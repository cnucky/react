var express = require('express');
var router = require('express').Router();
var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var configReader = require('../utils/config.js');
var cxfexample = require('../jws/relationAnalysis');
//var neo4j = require('node-neo4j');
var newTreeData = {};
var treeData;

var db, name, password, url, port ;
var successCode = 0;
var downloadFlie;
configReader.getNeo4jConfig(function (getNeo4jConfigData) {
    name = getNeo4jConfigData.name[0];
    password = getNeo4jConfigData.password[0];
    url = getNeo4jConfigData.url[0];
    port = getNeo4jConfigData.port[0];
    //db = new neo4j('http://' + name + ':' + password + '@' + url + ':' + port );
})
//判断json是否为空
function isEmptyObject(e){
    for(var t in e){
        return !1
    }
    return !0;
}

//处理请求数据
function getCypherQuery(cypher, req, res, next){
    var node = [];
    var linkId = [];
    var link = [];
    var arr = [];
    db.cypherQuery(cypher, function (err, result) {
        if (err) {
            throw err;
        }
        //downloadFlie = result.data[0];
        //fnDownloadFlie(result.data);
        result.data.forEach(function (e) {
            if (arr.indexOf(e[0]._id) == '-1') {
                arr.push(e[0]._id);
                node.push(e[0]);
            }
            if (arr.indexOf(e[3]._id) == '-1') {
                arr.push(e[3]._id);
                node.push(e[3]);
            }
        });
        result.data.forEach(function(e, index){
            var linkData = {}
            linkData['source'] = _.indexOf(arr, parseInt(e[1].start.split('/')[6]));
            linkData['target'] = _.indexOf(arr, parseInt(e[1].end.split('/')[6]));
            linkData['sourceId'] = e[1].start.split('/')[6];
            linkData['targetId'] = e[1].end.split('/')[6];
            linkData['weight'] = e[2].weight;
            if(e[2].message.length > 1){
                linkData['massage'] = JSON.parse(e[2].message);
            }
            link.push(linkData);
        });
        var json = {
            node: node,
            link: link
        }

        fnDownloadFile(node, link);
        res.json(json);
    })
}

function fnDownloadFile(node, link){
    downloadFlie = '';
    for(var n in node[0]){
        downloadFlie += n + ','
    }
    downloadFlie += '\n';
    for(var i = 0; i< node.length; i++){
        for(var j in node[i]){
            downloadFlie += node[i][j] + ',';
        }
        downloadFlie += '\n';
    }

    downloadFlie += '\n';

    for(var f in link[0]){
        downloadFlie += f + ','
    }
    downloadFlie += '\n';
    for(var r = 0; r< link.length; r++){
        for(var h in link[r]){
            downloadFlie += link[r][h] + ',';
        }
        downloadFlie += '\n';
    }
}


router.all('/getDownloadFile', function(req, res, next){
    res.json(downloadFlie)
})


router.all('/getTreeData', function(req, res, next){
    var cypher = 'start a=node(' + req.query.jsonArg.nodeId;
    cypher +=') match (a)-[r:KNOWS*0..1]-(e)'
    //where r.weight >=';
    //cypher +=  req.query.jsonArg.minWeight + ' and r.weight <=' + req.query.jsonArg.maxWeight;
    cypher +=' return a, e LIMIT 100';

    db.cypherQuery(cypher, function(err, result){
        if (err) {
            throw err;
        }
        var childrener = [];
        treeData = result.data
        for(var n in treeData) {
            console.log(JSON.stringify(treeData[n][0]._id, null, 2))
            if(treeData[n][0]._id == req.query.jsonArg.nodeId){
                newTreeData.node = treeData[n][0];
                childrener.push({node: treeData[n][1]});
                newTreeData.children = childrener;
            }
        }
        recursionTree(newTreeData, req, res, next);

    })
})

function recursionTree(data, req, res, next){
    for(var t in data){
        if(data[t].length){
            recursionTreeData(data[t], req, res, next);
        }
    }
}

function recursionTreeData(data, req, res, next){
    for (var j in data) {
        for(var t in treeData){
            var all = [];
            if (treeData[t][0].id == data[j].node.id) {
                all.push({node: treeData[t][1]})
                data[j].children = all;
            }
        }
    }
    console.log(JSON.stringify(newTreeData, null, 2));
    res.json(newTreeData);
}
//获取距型图数据
router.all('/getRectData', function(req, res, next){
    var cypher = 'start a=node(' + req.query.jsonArg.nodeId;;
    cypher +=') match p = (a)-[r:KNOWS]-(e) where r.weight >=';
    cypher +=  req.query.jsonArg.minWeight + ' and r.weight <=' + req.query.jsonArg.maxWeight;
    cypher +=' return a, p, r, e LIMIT 100'

    getCypherQuery(cypher, req, res, next);
})
//获取力导图数据
router.all('/getRelationData', function(req, res, next){
    var cypher = 'MATCH p = (a)-[r:KNOWS]-(e) WHERE ';
    cypher += 'r.weight >=';
    cypher += '0';
    cypher += ' AND r.weight <= ';
    cypher += '11';
    cypher += ' RETURN a, p, r, e LIMIT 1000';
    getCypherQuery(cypher, req, res, next);
})

//筛选线数据
router.all('/getDegree', function(req, res, next){
    var cypher = 'MATCH p = (a)-[r:KNOWS]-(e) ';
    var num = 0;
    var degree = req.query.jsonArg;
    if(degree){
        cypher += 'WhERE'
        for(var i in degree){
            if(num != 0){
                cypher += ' AND '
            }
            if(i == 'maxTotalDegree'){
                cypher += ' r.weight <=' + degree[i];
            }

            if(i == 'minTotalDegree'){
                cypher += ' r.weight >=' + degree[i];
            }
            num++
        }
    }
    cypher += ' RETURN a, p, r, e LIMIT 3';
    getCypherQuery(cypher, req, res, next);
});

//筛选点数据
router.all('/getDesignAtion', function(req, res, next){
    var num = 0;
    var cypher = 'MATCH p = (a)-[r:KNOWS*0..1]-(e) ';
    var designAtion = req.query.jsonArg
    if(designAtion){
        cypher += 'WhERE'
        for(var i in designAtion){
            if(num != 0){
                cypher += ' AND '
            }
            if(i == 'designAtion'){
                cypher += ' a.mac =~".*' + designAtion[i] + '.*"';
            }
            if(i == 'maxTotalDegree'){
                cypher += ' a.totalDegree <=' + designAtion[i];
            }
            if(i == 'minTotalDegree'){
                cypher += ' a.totalDegree >=' + designAtion[i];
            }
            if(i == 'maxOutDegree'){
                cypher += ' a.outDegree >=' + designAtion[i];
            }
            if(i == 'minOutDegree'){
                cypher += ' a.outDegree <=' + designAtion[i];
            }
            if(i == 'maxInDegree'){
                cypher += ' a.inDegree >=' + designAtion[i];
            }
            if(i == 'minInDegree'){
                cypher += ' a.inDegree <=' + designAtion[i];
            }
            num++
        }
    }
    cypher += ' RETURN a, p, r, e LIMIT 1';
    getCypherQuery(cypher, req, res, next);

});

//获取处理结果
router.all('/queryProcess', function (req, res, next) {
    cxfexample(req).getRelationAnalysisCacheStatus(req.query.jsonArg, function(result){
        res.json(result);
    })
})

//wsdl请求
router.all('/initRelationAnalysisTask', function (req, res, next) {

    var jsonArg = req.query.jsonArg;
    if(!jsonArg){
        res.send({code:-1,message:"Args Err"});
    }
    jsonArg['neo4j'] = {
        name: name,
        password: password,
        url: url,
        port: port
    };

    cxfexample(req).initRelationAnalysisTask(jsonArg, function(result){
        res.send(result);
    });
});
module.exports = router;
