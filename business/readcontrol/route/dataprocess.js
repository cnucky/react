var router = require('express').Router(),
    fs = require('fs'),
    request = require('request'),
    _ = require('underscore'),
    soap = require('soap');
    builder = require('xmlbuilder'),
    path = require('path'),
    //cache = require('../utils/cache'),
    cachemgr = require(path.join(process.cwd(), 'public/widget/cachemgr/src/cachemgr.js')),
    configReader = require('../utils/config.js'),
    dataAccessor = require('../jws/dataAccessor'),
    customConfig = require('../jws/customConfig'),
    tools = require('../jws/tools.js'),
    RoleApi = require(path.join(process.cwd(), 'framework/jws/role.js'));
    appConfig = require(path.join(process.cwd(), './config/config.js')),
    fileReadUrl = "http://fileReadServerIp:8080/ProtocolAnalysis/ws/rs/json",
    dp_config = require(configReader.getRouteConfig("route_config_dataprocess.js")),
    sysConfig = require(path.join(process.cwd(), './utils/config-system.js')),
    menuCache = require('../utils/menuCache.js')



var operationTransDic = {
    equal: {operate: 'EQ',},
    notEqual: {operate: 'NOTEQ',},
    between: {operate: 'BTW',},
    greaterThan: {operate: 'GT'},
    lessThan: {operate: 'LT',},
    notLessThan: {operate: 'GE',},
    notGreaterThan: {operate: 'LE',},
    like: {operate: 'LIKE',},
    startWith: {operate: 'STARTWITH',},
    endWidth: {operate: 'ENDWITH',},
    in: {operate: 'IN',},
    notIn: {operate: 'NOTIN',},
    isNull: {operate: 'ISNULL',},
    isNotNull: {operate: 'ISNOTNULL',},
    topCount: {operate: '',},
    splitMatch: {operate: '',},
};


var caseColumns={
    "CLUE_ID":"CLUE_ID",
    "TS_OBJECT_NAME":"TS_OBJECT_NAME",
    "TS_CLUE_CONTENT":"TS_CLUE_CONTENT",
    "TS_CLUE_TYPE":"TS_CLUE_TYPE",
    "TS_CASE_ID":"TS_CASE_ID",
    "TS_CASE_NAME":"TS_CASE_NAME",
    "TS_OBJECT_ID":"TS_OBJECT_ID"
}

var successCode = 0;




router.all('/getIpsAddrInfo',function(req,res){
    var data = {"ipContent":req.query.queryContent};
    tools(req).getIpsAddrInfo(data,function(result){
        res.send(result)
    })
})


router.all('/getTelNumberAddrInfo',function(req,res){
    var data = {"telContent":req.query.queryContent};
    tools(req).getTelNumberAddrInfo(data,function(result){
        res.send(result)
    })
})


router.all('/get_current_language',function(req,res){
    res.endj(sysConfig.get_current_language());
})



router.all('/getOperationMap', function (req, res) {
    configReader.getType2operation(function (type2operation_map) {
        var rsp = {
            "code": 0,
            "data": type2operation_map
        };
        res.endj(rsp);
    });
});

router.all('/get_operatioTransform_dic', function(req, res){
    var rsp = {
        'code': 0,
        'data': operationTransDic,
    };
    res.send(rsp);
});

//将中标数据查询的参数进行缓存
router.all('/put_hitQueryData_param', function(req, res){
    console.log(req.query.data);
    if(req.query.data != undefined)
        cachemgr.putLRUCache('hitdata_query_param', req.query.data);

    res.send({
        code: 0,
        message: 0,
    })
});

router.all('/get_hitQueryData_param', function(req, res){
    var data = cachemgr.getLRUCache('hitdata_query_param');
    res.send({
        code: 0,
        data: data,
    });
});

router.all('/getTreeAll', function (req, res) {
    menuCache.getMenu_type(function(data){
        res.send(data)
    });
})

router.all('/getExtract',function(req, res) {
    var sessionID = req.query.sessionID;
    var retCols = req.query.retCols;
    var serverIp = req.query.serverIp;
    var fetchNum = req.query.fetchNum;
    var merge = req.query.merge;
    var order = req.query.order;
    var data = { sessionId:sessionID, retCols:retCols, fetchNum:fetchNum, merge:merge, order:order};
    console.log(data);
    dataAccessor(req).extract(data, function (result) {
        //console.log(JSON.stringify(result,null,2));
        res.send(result.data);
    })
})

router.all('/support_minority_fonts',function(req, res){
    res.endj({"support_minority_fonts":sysConfig.support_minority_fonts(),
              "support_extract":sysConfig.support_extract()});
})

//http://192.168.19.117:3000/dataprocess/entityCountTotal?taskId=71131&businessType=2

//http://192.168.19.117:3000/dataprocess/entityQueryResult?taskId=71131&businessType=2&entityId=-1

//http://192.168.19.117:3000/dataprocess/entityQueryResult?taskId=71131&businessType=2&entityId=987654321

//http://192.168.19.117:3000/dataprocess/entityCountCache?entityId=987654321

//http://192.168.19.117:3000/dataprocess/entityGetResult?entityId=987654321

router.all('/entityCountTotal', function (req, res) {
    var taskId = req.query.taskId,
        entityName = "ENTITY_TEL",m
    businessType = req.query.businessType;

    var data = {"businessType": businessType, "identifyIds": [taskId], "entitys": [entityName], "filters": []};
    dataAccessor(req).entityCountTotal(data, function (result) {
        res.send(result);
    });
});

router.all('/entityQueryResult', function (req, res) {
    //var taskId = req.query.taskId,
    //    entityName = "ENTITY_TEL",
    //    businessType = req.query.businessType,
    //    entityId = req.query.entityId;
    //
    //var data = {"businessType": businessType, "identifyIds": [taskId], entityId:entityId, "entity": entityName, "filters": [], retCols:[], orderCols:[]};
    //console.log(req.query.ajaxSend)
    //var data = req.query.ajaxSend;
    //dataAccessor(req).entityQueryResult(data, function (resultQueryResults) {
    //    if (resultQueryResults.code != successCode) {
    //        res.send(resultQueryResults);
    //        return;
    //    }
    //    var entityCountCacheParam = {entityId:resultQueryResults.data.entityId};
    //    dataAccessor(req).entityCountCache(entityCountCacheParam, function (resultCountCache) {
    //        resultCountCache.data.entityId = resultQueryResults.data.entityId;
    //        res.send(resultCountCache);
    //    });
    //});

    var dataType = req.query.dataType,
        orderCols = req.query.orderCols,
        filters = req.query.filters,
        sortdata = req.query.sortdata,
        taskId = req.query.taskIds,
        sessionId = req.query.sessionId,
        distinctCols = req.query.distinctCols,
        businessType = req.query.businessType;


    var retCols = req.query.retCols;

    var data_ = {
        "businessType": businessType,
        "taskIds": taskId,
        "sessionId": sessionId,
        "dataType": dataType,
        "filters": [],
        "retCols": [],
        "orderCols": [],
        "distinctCols": [],
        "mergeCols": []
    }


    if(sessionId != -1){
        var serverIp = req.query.serverIp;
        data_.serverIp = serverIp;
    }

    if (typeof sortdata != 'undefined') {
        if (sortdata.length > 0) {
            data_.orderCols = sortdata;
        }
    }

    if (typeof orderCols != 'undefined') {
        if (orderCols.length > 0) {
            data_.orderCols = orderCols;
        }
    }

    if (typeof filters != 'undefined') {
        if (filters.filters.length > 0) {
            data_.filters = filters.filters;
        }
    }

    if (typeof distinctCols != 'undefined') {
        if (distinctCols.length > 0) {
            data_.distinctCols = distinctCols;
        }
    }

    var args = data_;

    dataAccessor(req).queryResults(args, function (result_queryResults) {
        console.log(JSON.stringify(result_queryResults,null,2));
        if (result_queryResults.code != successCode) {
            res.send(result_queryResults);
            return;
        }
        var result1 = result_queryResults.data;

        dataAccessor(req).countCache({"sessionId": result1.sessionId,"serverIp":result1.serverIp}, function (result_countCache) {
            if (result_countCache.code != successCode) {
                res.send(result_countCache);
                return;
            }
            var result2 = result_countCache.data;
            result1.count = result2.cacheCount;
            result1.sessionStatus = result2.sessionStatus;
            result1.code = successCode;
            result1.orderAble = result2.orderAble
            result1.mergeAble = result2.mergeAble
            res.send(result1);
        })

    });


});

router.all('/entityCountCache', function (req, res) {
    var entityId = req.query.entityId;

    var data = {entityId:entityId};
    dataAccessor(req).entityCountCache(data, function (result) {
        res.send(result);
    });
});

//router.all('/entityGetResult', function (req, res) {
//    var entityId = req.query.entityId;
//
//    var data = {entityId:entityId, startNo:1, fetchNum:500};
//    dataAccessor(req).entityGetResult(data, function (result) {
//        res.send(result);
//    });
//});

router.all('/entityGetResult', function (req, res) {
    //数据起始位置
    var start = parseInt(req.query.start) + 1;
    //数据长度
    var length = req.query.length;

    var sessionID = req.query.sessionID;

    var serverIp = req.query.serverIp;

    var args = {"sessionId": sessionID,"serverIp":serverIp};

    console.log("111111111",JSON.stringify(args,null,2))

    dataAccessor(req).countCache(args, function (result) {

        if (result.code != successCode) {
            res.send(result)
        }
        var result = result.data

        var recordsTotal = result.cacheCount;

        var sessionStatus = result.sessionStatus;


        args = {"sessionId": sessionID, "startNo": start, "fetchNum": length,"serverIp":serverIp};
        dataAccessor(req).getResults(args, function (result) {
            if (result.code != successCode) {
                res.send(result)
                return;
            }
            var result = result.data;

            var data = [];

            _.each(result.resultSet,function(resItem){
                var tmp = {};
                _.each(result.retCols,function(closItem,index){
                    tmp[closItem] = resItem[index];
                })
                data.push(tmp);
            })

            var entityDatas = {};
            entityDatas.recordsTotal = recordsTotal;
            entityDatas.data = data;
            entityDatas.code = successCode;
            entityDatas.sessionId = sessionID;
            entityDatas.sessionStatus = sessionStatus;
            res.send(entityDatas);
        });

    });
});



router.all('/getTree', function (req, res) {
    var taskId = req.query.taskId,
        businessType = req.query.businessType,
        filterParam = req.query.filters,
        tree_ = [];

    menuCache.getAllMenu(function(tree){
        if(req.query.dataTypes != undefined){
            tree_ = req.query.dataTypes;

        }
        else{
            _.each(tree.children, function (t) {
                tree_.push(t.key)
            });
        }

	    //对于案件中标的特殊处理，去除所有entity, Add by @wangj
	    if(businessType == 1){
		    var entityArray = [];
		    _.each(tree_, function(item){
			    if(item.indexOf('ENTITY') != -1){entityArray.push(item);}
		    });
		    tree_ = _.difference(tree_, entityArray);
	    }

        var data = {"businessType": businessType, "taskIds": req.query.taskIds, "dataTypes": tree_, "filters": filterParam};
        console.log(data);
        dataAccessor(req).countTotal(data, function (result) {
            if (result.code == successCode) {
                result = result.data;
                menuCache.getAllMenuHash(function(tree){
                    var returnData = {};

                    _.each(result.resultSet, function (resultSet) {
                        if (resultSet[1] > 0) {
                            var tmp_ = tree[resultSet[0]]
                            if (tmp_) {
                                tmp_.count = resultSet[1]
                                returnData[resultSet[0]] = tmp_;
                            }
                        }
                    })

                    returnData.DATA_PHONE = dp_config.mock_data_phone;
                    returnData.code = successCode;
                    returnData.taskFinish = result.taskFinish;
                    res.send(returnData);
                })

            } else {
                res.send({code: result.code, message: result.message});
            }
        });
    });



});

router.all('/getGisData', function (req, res) {
    //数据起始位置
    var start = parseInt(req.query.start) + 1;
    //数据长度
    var length = req.query.length;

    var sessionID = req.query.sessionID;

    var key = req.query.key;

    var serverIp = req.query.serverIp;

    var gisColumns = req.query.gisColumns;

    var args = {"sessionId": sessionID, "startNo": start, "fetchNum": length,"serverIp":serverIp};

    dataAccessor(req).getResults(args, function (result) {
        if (result.code != successCode) {
            res.send(result)
            return;
        }
        var result = result.data;

        configReader.getTranslationDic(function (getTranslationDicData) {
            getDisplayConfigHash(req, key, function (getDisplayConfigData) {
                var data = [];
                for (i in result.resultSet) {
                    var tmp_ = {}
                    for (j in result.resultSet[i])
                    {
                        if (gisColumns[result.retCols[j]])
                        {
                            tmp_[result.retCols[j]] = result.resultSet[i][j];
                        }
                    }
                    if (tmp_ != {})
                    {
                        data.push(tmp_);
                    }
                }

                var tableDatas = {};
                tableDatas.data = data;
                tableDatas.code = successCode;

                res.send(tableDatas);
            })
        });
    });
});

router.all('/getTable', function (req, res) {
    //数据起始位置
    var start = parseInt(req.query.start) + 1;
    //数据长度
    var length = req.query.length;

    var sessionID = req.query.sessionID;

    var key = req.query.key;

    var serverIp = req.query.serverIp;

    var args = {"sessionId": sessionID,"serverIp":serverIp};

    dataAccessor(req).countCache(args, function (result) {

        if (result.code != successCode) {
            res.send(result)
        }
        var result = result.data

        var recordsTotal = result.cacheCount;

        var sessionStatus = result.sessionStatus;


        args = {"sessionId": sessionID, "startNo": start, "fetchNum": length,"serverIp":serverIp};
        dataAccessor(req).getResults(args, function (result) {
            if (result.code != successCode) {
                res.send(result)
                return;
            }
            var result = result.data;
            //console.log("test1111", result);
            configReader.getTranslationDic(function (getTranslationDicData) {
                getDisplayConfigHash(req, key, function (getDisplayConfigData) {
                    var data = [];
                    for (i in result.resultSet) {
                        var tmp = {};
                        var tmp_ = {};
                        for (j in result.resultSet[i]) {
                            tmp_[result.retCols[j]] = result.resultSet[i][j];
                            var convert = "";
                            if (getDisplayConfigData[result.retCols[j]]) {
                                convert = getDisplayConfigData[result.retCols[j]].convert;
                            }
                            if (convert == "") {
                                if(result.retCols[j] == "MK_NOTE"){
                                    if(result.resultSet[i][j] != ""){
                                        tmp[result.retCols[j]] = '<span style="color:#669933" class="glyphicons glyphicons-pencil"></span>';
                                    }else{
                                        tmp[result.retCols[j]] = result.resultSet[i][j];
                                    }
                                }else{
                                    tmp[result.retCols[j]] = result.resultSet[i][j];
                                }
                            } else {

                                if (convert in getTranslationDicData) {
                                    if (convert == "IMG_MK_ISREAD" || convert == "IMG_MK_IMPORTANCE" || convert == 'IMG_MK_MATERIAL') {
                                        if (getTranslationDicData[convert][result.resultSet[i][j]] != undefined) {
                                            var tmp_arry = getTranslationDicData[convert][result.resultSet[i][j]][0].split(",");
                                            tmp[result.retCols[j]] = '<span style="color:' + tmp_arry[2] + '" class="glyphicons ' + tmp_arry[1] + '"></span>';
                                        }
                                        else {
                                            tmp[result.retCols[j]] = result.resultSet[i][j];
                                        }
                                    }
                                    else {
                                        var splittedArray = result.resultSet[i][j].split(";");
                                        var convertedArray = [];
                                        _.each(splittedArray, function(item){
                                            var converted = getTranslationDicData[convert][item];
                                            if (!converted)
                                            {
                                                converted = item;
                                            }
                                            else
                                            {
                                                converted = converted[0];
                                            }
                                            convertedArray.push(converted);
                                        });
                                        tmp[result.retCols[j]] = _.reduce(convertedArray,function(result,item){
                                            return result + ";" + item;
                                        });
                                    }
                                } else {
                                    tmp[result.retCols[j]] = result.resultSet[i][j];
                                }
                            }
                        }

                        tmp['hideData'] = tmp_;
                        data.push(tmp);
                    }


                    var tableDatas = {};
                    tableDatas.recordsTotal = recordsTotal;
                    tableDatas.data = data;
                    tableDatas.code = successCode;
                    tableDatas.sessionId = sessionID;
                    tableDatas.sessionStatus = sessionStatus;
                    res.send(tableDatas);
                })
            });
        });

    });
});

router.all('/getColumns', function (req, res) {
    var name = req.query.key;
    var businessType = req.query.businessType
    var user_id = req.generalArgument.userId;

    configReader.getTranslationDic(function (getTranslationDicData) {

        configReader.getReverseTranslationList(function (filterList) {

            configReader.getType2operation(function(type2operation_map){
                configReader.getRelationsAnalysisTemplate(function (resultReationsAnalysisTemplate) {
                    getDisplayConfig(req, name, function (err, result) {
                    //console.log(err);
                        if (err)
                        {
                            res.send(err);
                        }
                        else
                        {
                            var result = result.DisplayConfig.DataTableDisplayConfig[0].ColumnDisplayConfig;
                            var result_ = new Array();
                            var screenArry = [];
                            var visibleArry = []
                            var img_isread = deepCopy(getTranslationDicData["IMG_MK_ISREAD"]);
                            var img_importance = deepCopy(getTranslationDicData["IMG_MK_IMPORTANCE"]);

                            for (i in result) {
                                var tmp = {};
                                tmp.data = result[i].ColumnName;
                                tmp.columnName = result[i].ColumnName;
                                tmp.headercaption = result[i].HeaderCaption;
                                tmp.typeName = result[i].Type;
                                tmp.columnLength = result[i].ColumnLength;
                                if (result[i].Convert != "") {

                                    tmp.convertName = result[i].Convert;
                                    tmp.type = [{key:'IN',val:""},{key:'NOTIN',val:""}]

                                    var tmp_ = getTranslationDicData[result[i].Convert];
                                    var filter_ = filterList[result[i].Convert];

                                    if (result[i].Convert == "IMG_MK_ISREAD" ||
                                        result[i].Convert == "IMG_MK_IMPORTANCE" ||
                                        result[i].Convert == "IMG_MK_MATERIAL") {

                                        for (j in tmp_) {
                                            tmp_[j][0] = tmp_[j][0].split(",")[0];
                                        }

                                        _.each(filter_,function(item){
                                            item.desc = item.desc.split(",")[0];
                                        })

                                    }

                                    tmp.convert = tmp_;
                                    tmp.filter = filter_;

                                } else {
                                    tmp.type = type2operation_map[result[i].Type]
                                }

                                result_.push(tmp);
                                /*if (!result[i].Hidden) {
                                 console.log("no hidden:" + JSON.stringify(result[i], null, 2));
                                 }*/
                                if (result[i].Hidden == 'True') {
                                    tmp.hidden = true;
                                } else {
                                    if(businessType == 2 && typeof caseColumns[tmp.columnName] != 'undefined'){
                                        tmp.hidden = true;
                                    } else if(businessType == 1 && typeof caseColumns[tmp.columnName] != 'undefined') {
                                        tmp.hidden = false;
                                    } else {
                                        tmp.hidden = false;
                                        screenArry.push(tmp);
                                    }
                                }
                            }
                            result_.push({columnName: "hideData", headercaption: "hideData", hidden: true, columnLength: 0})
                            var caseColumns_ = {};
                            if(businessType == 2 ){
                                caseColumns_ = caseColumns;
                            }else{
                                caseColumns_ = {};
                            }
                            res.send({
                                code:0,
                                message:"",
                                data:{
                                    columns: result_,
                                    screenArry: screenArry,
                                    img_isread: img_isread,
                                    img_importance: img_importance,
                                    caseColumns:caseColumns_,
                                    relationsAnalysisData:(typeof resultReationsAnalysisTemplate[name] == 'undefined' ? [] : resultReationsAnalysisTemplate[name])
                                }
                            });
                        }
                    });


                });
            });

        });


    });
});

router.all('/queryResults', function (req, res) {
    var dataType = req.query.dataType,
        orderCols = req.query.orderCols,
        filters = req.query.filters,
        sortdata = req.query.sortdata,
        taskId = req.query.taskIds,
        sessionId = req.query.sessionId,
        distinctCols = req.query.distinctCols,
        businessType = req.query.businessType;


    var retCols = [];
    var columns = req.query.retCols;
    
    for (var i = 0; i < columns.length; i++) {
        if (columns[i].datafield == "hideData") {
            continue;
        }
        retCols.push(columns[i].datafield);
    }
    
    var data_ = {
        "businessType": businessType,
        "taskIds": taskId,
        "sessionId": sessionId,
        "dataType": dataType,
        "filters": [],
        "retCols": [],
        "orderCols": [],
        "distinctCols": [],
        "mergeCols": []
    }


    if(sessionId != -1){
        var serverIp = req.query.serverIp;
        data_.serverIp = serverIp;
    }

    if (typeof sortdata != 'undefined') {
        if (sortdata.length > 0) {
            data_.orderCols = sortdata;
        }
    }

    if (typeof orderCols != 'undefined') {
        if (orderCols.length > 0) {
            data_.orderCols = orderCols;
        }
    }

    if (typeof filters != 'undefined') {
        if (filters.filters.length > 0) {
            data_.filters = filters.filters;
        }
    }

    if (typeof distinctCols != 'undefined') {
        if (distinctCols.length > 0) {
            data_.distinctCols = distinctCols;
        }
    }

    var args = data_;

    dataAccessor(req).queryResults(args, function (result_queryResults) {
        //console.log(JSON.stringify(result_queryResults,null,2));
        if (result_queryResults.code != successCode) {
            res.send(result_queryResults);
            return;
        }
        var result1 = result_queryResults.data;

        dataAccessor(req).countCache({"sessionId": result1.sessionId,"serverIp":result1.serverIp}, function (result_countCache) {
            if (result_countCache.code != successCode) {
                res.send(result_countCache);
                return;
            }
            var result2 = result_countCache.data;
            result1.count = result2.cacheCount;
            result1.sessionStatus = result2.sessionStatus;
            result1.code = successCode;
            result1.orderAble = result2.orderAble
            result1.mergeAble = result2.mergeAble
            res.send(result1);
        })

    });
});

function getFilter(array)
{
    var obj = {};
    _.each(array,function(item){
        var valueArray = [];
        valueArray.push(item.desc);
       obj[item.name] = valueArray;
    });

    return obj;
}

function getDisplayConfig(req, key, callback) {
    //读取默认显示配置
    configReader.getDisplayConfig(key, function (defaultConfigResult) {
        var defaultVersion = defaultConfigResult.DisplayConfig.Version;

        //读取个人显示配置
        var param = {
            "type1": "DisplayConfig",
            "type2": key
        };
        customConfig(req).getConfigInfo(param, function (personalConfigResult) {
            if (personalConfigResult.code == 0) {
                //如果存在个人显示配置
                if (personalConfigResult.data.list.length > 0) {
                    var parseResult = JSON.parse(personalConfigResult.data.list[0].config_info);
                    var personalVersion = parseResult.DisplayConfig.Version;

                    //如果个人显示配置与默认显示配置版本相同，返回个人显示配置，否则返回默认显示配置
                    if (defaultVersion == personalVersion) {
                        callback(null, parseResult);
                    }
                    else {
                        callback(null, defaultConfigResult)
                    }
                }
                else {
                    //不存在个人显示配置则返回默认显示配置
                    callback(null, defaultConfigResult)
                }
            }
            else {
                //个人显示配置读取失败
                error = {
                    code: personalConfigResult.code,
                    message: personalConfigResult.message
                }
                callback(error, null)
            }

        });
    });
}

function getDisplayConfigHash(req, key, callback) {
    getDisplayConfig(req, key, function (err, result) {
        var hash = {}
        _.each(result.DisplayConfig.DataTableDisplayConfig[0].ColumnDisplayConfig, function (dic) {
            var ndic = {
                columnname: dic.ColumnName,
                headercaption: dic.HeaderCaption,
                hidden: dic.Hidden,
                columnlength: dic.ColumnLength,
                convert: dic.Convert
            };

            hash[ndic.columnname] = ndic;
        })
        callback(hash);
    })
}

function common_to_xml(from, to, msg_seq) {
    var server_data = {
        DATASET: {
            "@name": "JZ_COMMON_010000",
            "@rmk": dp_config.file_download.common_msg,
            DATA: {
                ITEM: []
            }
        }
    }

    server_data.DATASET.DATA.ITEM.push({
        "@val": from,
        "@eng": "FROM",
        "@chn": dp_config.file_download.node_from
    });

    server_data.DATASET.DATA.ITEM.push({
        "@val": to,
        "@eng": "TO",
        "@chn": dp_config.file_download.node_to
    });

    server_data.DATASET.DATA.ITEM.push({
        "@val": "2",
        "@eng": "RESPONSE_TYPE",
        "@chn": dp_config.file_download.reponse_type
    });

    server_data.DATASET.DATA.ITEM.push({
        "@val": msg_seq,
        "@eng": "MESSAGE_SEQUENCE",
        "@chn": dp_config.file_download.msg_seq
    });

    var xml = builder.create(server_data);

    var xml_string = xml.toString({
        pretty: true,
        indent: '  ',
        offset: 1,
        newline: '\n'
    });

    return xml_string;
}

function identity_to_xml(department, user, user_role) {

    var server_data = {
        DATASET: {
            "@name": "JZ_COMMON_010001",
            "@rmk": dp_config.file_download.identity_msg,
            DATA: {
                ITEM: []
            }
        }
    }

    server_data.DATASET.DATA.ITEM.push({
        "@val": department,
        "@eng": "_DEPARTMENT",
        "@chn": dp_config.file_download.department_code
    });

    server_data.DATASET.DATA.ITEM.push({
        "@val": user.loginName,
        "@eng": "USER_NAME",
        "@chn": dp_config.file_download.user_name
    });

    var role_ids = "";
    _.each(user_role, function (role) {
        role_ids += role.roleID + ',';
    });

    var role_types = "";
    _.each(user_role, function (role) {
        role_types += role.roleType + ',';
    });

    server_data.DATASET.DATA.ITEM.push({
        "@val": role_ids,
        "@eng": "ROLE",
        "@chn": dp_config.file_download.role
    });

    server_data.DATASET.DATA.ITEM.push({
        "@val": role_types,
        "@eng": "ROLE_TYPE",
        "@chn": dp_config.file_download.role_type
    });

    server_data.DATASET.DATA.ITEM.push({
        "@val": "",
        "@eng": "COOKIES",
        "@chn": dp_config.file_download.cookies
    });

    var xml = builder.create(server_data);

    var xml_string = xml.toString({
        pretty: true,
        indent: '  ',
        offset: 1,
        newline: '\n'
    });

    return xml_string;
}

function file_info_to_xml(fileName,businessType) {
    var server_data = {
        DATASET: {
            "@name": "JZ_COMMON_010212",
            "@rmk": dp_config.file_download.download_common_msg,
            DATA: {
                ITEM: []
            }
        }
    }

    server_data.DATASET.DATA.ITEM.push({
        "@val": fileName,
        "@eng": "FILEID",
        "@chn": dp_config.file_download.file_id
    });

    if (businessType == 1)
    {
        server_data.DATASET.DATA.ITEM.push({
            "@val": 1,
            "@eng": "CATEGORY",
            "@chn": dp_config.file_download.file_storage_category
        });
    }

    var xml = builder.create(server_data);

    var xml_string = xml.toString({
        pretty: true,
        indent: '  ',
        offset: 1,
        newline: '\n'
    });

    return xml_string;
}

function make_file_download_xml(commonInfo, identityInfo, fileInfo) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?>'
    xml += '\n<MESSAGE>';
    xml += '\n' + commonInfo;
    xml += '\n' + identityInfo;
    xml += '\n' + fileInfo;
    xml += '\n</MESSAGE>';

    return xml;
}

/*<?xml version="1.0" encoding="UTF-8"?>
 <MESSAGE>
 <DATASET name="JZ_COMMON_010000" rmk="消息通用信息">
 <DATA>
 <ITEM val="320000" eng="FROM" chn="发起节点的标识" rmk="江苏省"/>
 <ITEM val="320100" eng="TO" chn="目的节点的标识" rmk="南京市"/>
 <ITEM val="1" eng=" RESPONSE_TYPE " chn="响应方式" rmk="同步响应"/>
 <ITEM val="320000201103070955330012" eng="MESSAGE_SEQUENCE" chn="消息流水号"
 rmk="流水号ID"/>
 <ITEM val="REQ_WJXZ" eng="MESSAGE_TYPE" chn="消息类型" rmk="文件下载请求"/>
 </DATA>
 </DATASET>
 <DATASET name="JZ_COMMON_010001" rmk="身份认证信息">
 <DATA>
 <ITEM val="320000" eng=" _DEPARTMENT" chn="机关机构代码"/>
 <ITEM val="yao" eng="USER_NAME" chn="用户名"/>
 <ITEM val="授权管理员" eng="ROLE" chn="角色"/>
 <ITEM val="xx" eng="ROLE_TYPE" chn="角色类型"/>
 <ITEM val="yy" eng="COOKIES" chn="通行字"/>
 </DATA>
 </DATASET>
 <DATASET name="JZ_COMMON_010212" rmk="下载文件下发通用信息">
 <DATA>
 <ITEM val="呵呵哒.eml" eng="FILEID" chn="下载文件标示"/>
 </DATA>
 </DATASET>
 </MESSAGE>


 <ITEM val="320000201103070955330012" eng="MESSAGE_SEQUENCE" chn="消息流水号"
 rmk="流水号ID"/>  区域代码+14位时间+4位流水*/

function stringToBytes(str){
    var bytes = new Array();
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        var s = parseInt(c).toString(2);
        if(c >= parseInt("000080",16) && c <= parseInt("0007FF",16)){
            var af = "";
            for(var j = 0; j < (11 - s.length); j++){
                af += "0";
            }
            af += s;
            var n1 = parseInt("110" + af.substring(0,5),2);
            var n2 = parseInt("110" + af.substring(5),2);
            if(n1 > 127) n1 -= 256;
            if(n2 > 127) n2 -= 256;
            bytes.push(n1);
            bytes.push(n2);
        }else if(c >= parseInt("000800",16) && c <= parseInt("00FFFF",16)){
            var af = "";
            for(var j = 0; j < (16 - s.length); j++){
                af += "0";
            }
            af += s;
            var n1 = parseInt("1110" + af.substring(0,4),2);
            var n2 = parseInt("10" + af.substring(4,10),2);
            var n3 = parseInt("10" + af.substring(10),2);
            if(n1 > 127) n1 -= 256;
            if(n2 > 127) n2 -= 256;
            if(n3 > 127) n3 -= 256;
            bytes.push(n1);
            bytes.push(n2);
            bytes.push(n3);
        }else if(c >= parseInt("010000",16) && c <= parseInt("10FFFF",16)){
            var af = "";
            for(var j = 0; j < (21 - s.length); j++){
                af += "0";
            }
            af += s;
            var n1 = parseInt("11110" + af.substring(0,3),2);
            var n2 = parseInt("10" + af.substring(3,9),2);
            var n3 = parseInt("10" + af.substring(9,15),2);
            var n4 = parseInt("10" + af.substring(15),2);
            if(n1 > 127) n1 -= 256;
            if(n2 > 127) n2 -= 256;
            if(n3 > 127) n3 -= 256;
            if(n4 > 127) n4 -= 256;
            bytes.push(n1);
            bytes.push(n2);
            bytes.push(n3);
            bytes.push(n4);
        }else{
            bytes.push(c & 0xff);
        }
    }
    return bytes;
}

Number.prototype.pad2 = function () {
    return this > 9 ? this : '0' + this;
}

Number.prototype.pad4 = function () {
    if (this <10)
    {
        return '000' + this;
    }
    else if (this < 100)
    {
        return '00' + this;
    }
    else
    {
        return '0' + this;
    }
}

router.all('/ProtocolAnalysis', function (req, res) {
    var data = JSON.parse(req.query.data);

    var serverIp = _.find(data, function (item) {
        return item.key == "fileReadServerIp"
    }).val;

    var fileName = _.find(data, function (item) {
        return item.key == "FILENAME"
    }).val;

    var toLocationCode = _.find(data, function (item) {
        return item.key == "LOCATION_CODE"
    });

    var businessType = _.find(data, function (item) {
        return item.key == "businessType"
    }).val;


    if (toLocationCode)
    {
        toLocationCode = toLocationCode.val;
    }
    else
    {
        toLocationCode = "";
    }

    var currentLocationCode;

    configReader.getDataCenters(function (result){
        currentLocationCode = appConfig.areaCode;
        var currentTime = new Date();
        var msg_seq = currentLocationCode
            + currentTime.getFullYear()
            + currentTime.getMonth().pad2()
            + currentTime.getDate().pad2()
            + currentTime.getHours().pad2()
            + currentTime.getMinutes().pad2()
            + currentTime.getSeconds().pad2()
            + currentTime.getMilliseconds().pad4();

        var user = req.generalArgument;
        var user_role = {};
        RoleApi(req).queryRole({userId: user.userId})
            .then(function (role_rsp) {

                user_role = role_rsp.data;

                var common_info = common_to_xml(currentLocationCode, currentLocationCode, msg_seq);
                var identity_info = identity_to_xml(currentLocationCode, user, user_role);
                var file_info = file_info_to_xml(fileName,businessType);
                var xml = make_file_download_xml(common_info,identity_info,file_info);

                console.log("download-xml",xml);
                data.push({key:"FD_XML",val: xml});
                data.push({key:"file_download_webservice_ip",val: appConfig['dc-analysis'].split(':')[0]});

                var dynamicUrl = fileReadUrl.replace("fileReadServerIp",serverIp);
                console.log(dynamicUrl);
                
                //console.log(JSON.stringify(data,null,2));
                request(dynamicUrl, {
                        url: dynamicUrl,
                        method: "POST",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        },
                        body: data
                    },
                    function (error, response, body) {
                        if (error) {
                            console.log("error" + error);
                        }
                        if (!error && response.statusCode == 200 && body != "") {
                            res.send(JSON.stringify(body));
                        }
                    }
                )
            });

    })





});

router.all('/configData', function (req, res) {
    var key = req.query.category;

    getDisplayConfig(req, key, function (err, result) {
        if (err) {
            res.endj(err);
        }
        else {
            rsp = {
                code: 0,
                message: "",
                data: result
            }

            res.send(rsp);
        }
    });
});

router.all('/getDetailConfig', function (req, res) {
    var dataType = req.query.dataType;

    configReader.getDetailDisplayConfig(dataType,function(result){
        res.send(result);
        /*console.log(result);*/
    })


})

router.all('/countCache', function (req, res) {
    var sessionID = req.query.sessionID;

    var args = {"sessionId": sessionID,"serverIp":req.query.serverIp};

    dataAccessor(req).countCache(args, function (result) {
        //var result = result.data
        res.send(result);
    })

})

router.all('/noteRecords', function (req, res) {
    var taskIds = req.query.taskIds;
    var sessionIds = req.query.sessionIds;
    var dataType = req.query.dataType;
    var idS = req.query.idS;
    var propertys = req.query.propertys;
    var serverIp = req.query.serverIp;
    var businessType = req.query.businessType;

    var args = {
        "businessType": businessType,
        "recordIds": [{"identifyId": taskIds[0], "cdrIds": idS}],
        "sessionIds": sessionIds,
        "dataType": dataType,
        "propertys": [propertys],
        "serverIp":serverIp
    };

    dataAccessor(req).noteRecords(args, function (result) {
        /*console.log("result", result);*/
        res.send(result);
    });
    //res.send({code:0})
})

router.all('/saveDisplayConfigInfo', function (req, res) {
    var allXML = req.query.allXML;

    var btn = req.query.btn;

    var savedValue = {
        "DisplayConfig": {
            "Version": allXML.version,
            "FilePositionConfig": [
                {
                    "Position": [
                        btn.Position
                    ],
                    "DefaultBottomPixels": [
                        btn.DefaultBottomPixels
                    ],
                    "DefaultRightPixels": [
                        btn.DefaultRightPixels
                    ],
                    "DefaultInsidePixels": [
                        "0"
                    ]
                }
            ],
            "DataTableDisplayConfig": [{
                "ColumnDisplayConfig": []
            }]
        }
    }

    _.each(allXML.config, function (columnConfig) {
        savedValue.DisplayConfig.DataTableDisplayConfig[0].ColumnDisplayConfig.push(columnConfig);
    })

    var param = {
        "type1": "DisplayConfig",
        "type2": allXML.category,
        "config_info": JSON.stringify(savedValue)
    };

    customConfig(req).addConfigInfo(param, res.endj);
});

var deepCopy = function (obj) {
    if (typeof (obj) != 'object')
        return obj;

    var re = {};
    if (obj.constructor == Array)
        re = [];

    for (var i in obj) {
        re[i] = deepCopy(obj[i]);
    }

    return re;

}

router.all('/getDictionaries', function (req, res) {
    configReader.getTranslationDic(function (getTranslationDicData) {
        res.send(getTranslationDicData);
    })
})

router.all('/getDistinctColumns', function (req, res) {
    configReader.getDistinctColumns(req.query.category, function (distinctColumns) {
        res.send(distinctColumns);
    })

})

router.all('/getContextMenus', function (req, res) {
    configReader.getTableContextMenuConfig(req.query.category,function (data) {
        res.send(data);
    })
})

router.all('/getGisColumns', function (req, res) {
    configReader.getGisColumnsConfig(req.query.category,function (data) {
        res.send(data);
    })
})

//线索中标数据分组统计
router.all('/numberHitStatistic', function(req, res){
    var dataTypes = [],
        startTime = req.query.startTime,
        endTime = req.query.endTime,
        identifyIds = req.query.numberIds,
        querySQL = '',
        groupNumberResult = [],
        returnData = {};


    menuCache.getAllMenu(function(data){
        _.each(data.children, function(typeItem){
            dataTypes.push(typeItem.key);
        });

        _.each(identifyIds, function(numberItem){
            groupNumberResult[_.indexOf(identifyIds, numberItem)] = {
                numberId: numberItem,
                read: 0,
                unread: 0,
            };
        });

        querySQL = {
            businessType: 1,
            identifyIds: identifyIds,
            dataTypes: dataTypes,
            filters: [{
                field: 'CAP_TIME',      //时间范围
                operate: 'BTW',
                values: [startTime, endTime]
            },{
                field: 'MK_ISREAD',
                operate: 'EXEQ',
                values: ['1'],
            }],
        };
        dataAccessor(req).countGroup(querySQL, function(result){

            if(result.code == successCode){
                _.each(result.data.resultSet, function(resultItem){
                    for(var index = 0; index < groupNumberResult.length; index++){
                        groupNumberResult[index]['read'] += resultItem.count[index];
                    }
                });
            }else
                return res.send({code: result.code, message: result.message});

            querySQL = {
                businessType: 1,
                identifyIds: identifyIds,
                dataTypes: dataTypes,
                filters: [{
                    field: 'CAP_TIME',
                    operate: 'BTW',
                    values: [startTime, endTime],
                },{
                    field: 'MK_ISREAD',
                    operate: 'EXEQ',
                    values: ['0'],
                }],
            };
            dataAccessor(req).countGroup(querySQL, function(result){
                if(result.code == successCode){
                    _.each(result.data.resultSet, function(resultItem){
                        for(var index = 0; index < groupNumberResult.length; index ++){
                            groupNumberResult[index]['unread'] += resultItem.count[index];
                        }
                    });
                }else
                    res.send({code: result.code, message: result.message});

                returnData.code = successCode;
                returnData.resultSet = groupNumberResult;
                res.send(returnData);
            });
        });
    })



})

//以协议类型进行数据的统计
router.all('/protocolHitStatistic', function(req, res){
    var dataTypes = [],
        startTime = req.query.startTime,
        endTime = req.query.endTime,
        identifyIds = req.query.numberIds,
        querySQL = '',
        groupProtocolResult = {},
        returnData = {};

    menuCache.getAllMenu(function(data){
        _.each(data.children, function(typeItem){
            dataTypes.push(typeItem.key);
        });

        querySQL = {
            businessType: 1,
            taskIds: identifyIds,
            dataTypes: dataTypes,
            filters: [{
                field: 'CAP_TIME',      //时间范围
                operate: 'BTW',
                values: [startTime, endTime]
            },{
                field: 'MK_ISREAD',
                operate: 'EXEQ',
                values: ['1'],
            }],
        };
        dataAccessor(req).countTotal(querySQL, function(result){

            if(result.code == successCode){
                _.each(result.data.resultSet, function(resultItem){
                    groupProtocolResult[resultItem[0]] = {
                        readCount: resultItem[1],
                        unreadCount: 0,
                    };
                });
            }else
                return res.send({code: result.code, message: result.message});

            querySQL = {
                businessType: 1,
                taskIds: identifyIds,
                dataTypes: dataTypes,
                filters: [{
                    field: 'CAP_TIME',
                    operate: 'BTW',
                    values: [startTime, endTime],
                },{
                    field: 'MK_ISREAD',
                    operate: 'EXEQ',
                    values: ['0'],
                }],
            };
            dataAccessor(req).countTotal(querySQL, function(result){
                if(result.code == successCode){
                    _.each(result.data.resultSet, function(resultItem){
                        groupProtocolResult[resultItem[0]]['unreadCount'] = resultItem[1];
                    });
                }else
                    res.send({code: result.code, message: result.message});

                returnData.code = successCode;
                returnData.resultSet = groupProtocolResult;
                res.send(returnData);
            });
        });
    })


})

router.all('/extractColumns', function (req, res) {

    var key = req.query.key;
    var args = {"identifyIds": req.query.identifyIds,
        "sessionId": req.query.sessionID,
        "cols":req.query.columns,
        "merge":req.query.merge,
        fetchNum:1000,
        order:"DESC",
        "serverIp":req.query.serverIp};


    var mocked = {
        code:0,
        message:"",
        data:{
            totalCount:1001,
            fetchCount:3,
            retCols:["SENDER","MAIL_DIR","count"],
            result:[["a@a.com","1","11"],
                ["a@a.com","2","3"],
                ["b@b.com","3","5"]]
        }

    }
    var result = mocked.data;
    configReader.getTranslationDic(function (getTranslationDicData) {
        getDisplayConfigHash(req, key, function (getDisplayConfigData) {
            var data = [];
            for (i in result.result) {
                var tmp = {};
                var tmp_ = {};
                for (j in result.result[i]) {
                    tmp_[result.retCols[j]] = result.result[i][j];
                    var convert = "";
                    if (getDisplayConfigData[result.retCols[j]]) {
                        convert = getDisplayConfigData[result.retCols[j]].convert;
                    }
                    if (convert == "") {
                        tmp[result.retCols[j]] = result.result[i][j];
                    } else {

                        if (convert in getTranslationDicData) {
                            console.log("resultSet[i][j] ", result.result[i][j]);
                            var splittedArray = result.result[i][j].split(";");
                            console.log("splittedArray ", splittedArray);
                            var convertedArray = [];
                            _.each(splittedArray, function(item){
                                console.log("convert ",item, " to ",getTranslationDicData[convert][item]);
                                console.log(getTranslationDicData[convert]);
                                var converted = getTranslationDicData[convert][item];
                                if (!converted)
                                {
                                    converted = item;
                                }
                                else
                                {
                                    converted = converted[0];
                                }
                                convertedArray.push(converted);
                            });
                            console.log("convertedArray ", convertedArray);
                            tmp[result.retCols[j]] = _.reduce(convertedArray,function(result,item){
                                console.log("reduce ", item);
                                return result + ";" + item;
                            });
                        } else {
                            tmp[result.retCols[j]] = result.result[i][j];
                        }
                    }
                }

                data.push(tmp);
            }


            var tableDatas = {};
            tableDatas.data = {
                totalCount:result.totalCount,
                fetchCount:result.fetchCount,
                table:data
            };
            tableDatas.code = successCode;
            tableDatas.message = "";
            res.send(tableDatas);
        })
    });

})

module.exports = router;