var router = require('express').Router();
var TaskApi = require('../jws/taskcommon');
var RGApi = require('../jws/relationgraph');
var SQApi = require('../jws/smartquery');
var ImportBatchApi = require('../jws/importbatch');
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');

var FAVOR_DIR = {
    datasource: '常用数据',
    operation: '常用组件'
};

router.get('/getdatasource', function(req, res) {
    var favorDataPromise = TaskApi(req).getPersonFavor({
        type: 1
    });
    var dataDirPromise = TaskApi(req).getDataTypeDir();
    var dataTypePromise = TaskApi(req).getDataType();
    Q.all([favorDataPromise, dataDirPromise, dataTypePromise]).spread(function(favorData, dirs, dataSource) {
        favorData = favorData.data;
        dirs = dirs.data;
        dataSource = dataSource.data;
        var sysIdmap = {};
        var personalIdmap = {};
        var result = {
            sysTree: [],
            personalTree: []
        };

        function findParent(dir, tree, idmap) {
            if (!idmap[dir.parentId]) {
                if (!_.contains(tree, dir)) {
                    tree.push(dir);
                }
            } else {
                var parent = idmap[dir.parentId];
                parent.children = parent.children || [];
                if (!_.contains(parent.children, dir)) {
                    parent.children.push(dir);
                    parent.folder = true;
                    findParent(parent, tree, idmap);
                }
            }
        }

        _.each(dirs.sysDir, function(dir) {
            sysIdmap[dir.dirId] = dir;
            dir.folder = false;
            dir.key = dir.dirId;
            dir.title = dir.dirName;
            dir.extraClasses = "nv-dir";
            dir.hideCheckbox = true;
        });
        _.each(dirs.personalDir, function(dir) {
            personalIdmap[dir.dirId] = dir;
            dir.folder = false;
            dir.key = dir.dirId;
            dir.title = dir.dirName;
            dir.extraClasses = "nv-dir";
            dir.hideCheckbox = true;
        });
        _.each(dataSource.sysData, function(data) {
            var dir = sysIdmap[data.dirId];
            if (dir) {
                dir.children = dir.children || [];
                data.title = data.caption;
                data.tooltip = data.caption;
                data.key = data.centerCode + '_' + data.zoneId + '_' + data.typeId;
                data.extraClasses = 'nv-data';
                dir.children.push(data);
                dir.folder = true;
                findParent(dir, result.sysTree, sysIdmap);
            }
        });
        if(result.sysTree.length > 0) {
            result.sysTree[0].expanded = true;
        }
        _.each(dataSource.personalData, function(data) {
            var dir = personalIdmap[data.dirId];
            if (dir) {
                dir.children = dir.children || [];
                data.title = data.caption;
                data.tooltip = data.caption;
                data.key = data.centerCode + '_' + data.zoneId + '_' + data.typeId;
                data.extraClasses = 'nv-data';
                processModelingTask(data);
                dir.children.push(data);
                dir.folder = true;
                findParent(dir, result.personalTree, personalIdmap);
            }
        });


        function processModelingTask(data) {
            if (data.taskType == 107) {
                data.lazy = true;
                data.extraClasses = "nv-dir";
                data.folder = true;
                data.hideCheckbox = true;
            }
        }

        var favorDir = {
            title: FAVOR_DIR.datasource,
            key: FAVOR_DIR.datasource,
            extraClasses: 'nv-dir',
            dirId: 1,
            parentId: -1,
            folder: true,
            hideCheckbox: true,
            expanded: true,
            children: []
        };
        favorDir.children = [];
        _.each(favorData, function(item) {
            var origData = findOrigData(item.favorId, _.union(dataSource.sysData, dataSource.personalData));
            if (origData) {
                var favorNode = _.extend({}, origData);
                favorNode.key = item.favorId + '_favored';
                favorNode.favored = true;
                favorNode.parentId = 1;
                favorNode.extraClasses = 'nv-data';
                processModelingTask(favorNode);
                favorNode.title = item.caption;
                favorNode.tooltip = item.caption;
                favorDir.children.push(favorNode);
            }
        });

        result = _.union([favorDir], result.sysTree, result.personalTree);

        res.endj({
            code: 0,
            data: {
                tree: result,
                favoredDir: FAVOR_DIR.datasource
            }
        });
    }).catch(res.endj);
});


router.get("/getoperators", function(req, res) {
    var favorDataPromise = TaskApi(req).getPersonFavor({
        type: 2
    });
    var operatorsPromise = TaskApi(req).getStreamNodes();
    Q.all([favorDataPromise, operatorsPromise]).spread(function(favorData, operators) {
        favorData = favorData.data;
        operators = operators.data;

        var favorOperatorDir = {
            title: FAVOR_DIR.operation,
            key: FAVOR_DIR.operation,
            extraClasses: 'nv-dir',
            dirId: 1,
            parentId: -1,
            folder: true,
            expanded: true,
            hideCheckbox: true,
            children: []
        };

        var dirMap = {
            '智能分析': 2,
            '数据处理': 3,
            '机器学习': 4
        };
        dirMap[FAVOR_DIR.operation] = 1;

        var dirs = {};

        _.each(operators, function(item) {
            if (!dirs[item.dirName]) {
                dirs[item.dirName] = [];
            }
            item.parentId = dirMap[item.dirName];
            item.title = item.typeName;
            item.key = item.nodeType;
            item.extraClasses = 'nv-data';
            dirs[item.dirName].push(item);
        });

        var dirTree = [];
        for (var dirName in dirs) {
            dirTree.push({
                title: dirName,
                key: dirName,
                extraClasses: 'nv-dir',
                dirId: dirMap[dirName],
                parentId: -1,
                folder: true,
                hideCheckbox: true,
                children: dirs[dirName]
            });
        }
        _.each(favorData, function(item) {
            var node = findOrigData(item.favorId, operators);
            if (node) {
                var favorNode = _.extend({}, node);
                favorNode.key = item.favorId + '_favored';
                favorNode.favored = true;
                favorNode.parentId = 1;
                favorNode.extraClasses = 'nv-data';
                favorNode.title = item.caption;
                favorOperatorDir.children.push(favorNode);
            }
        });

        res.endj({
            code: 0,
            data: {
                favoredDir: FAVOR_DIR.operation,
                array: operators,
                tree: _.union([favorOperatorDir], dirTree)
            }
        });
    }).catch(res.endj);
});

function findOrigData(key, origDataList) {
    return _.find(origDataList, function(data) {
        var rightOne = data.key == key;
        if (rightOne) {
            data.favored = true;
        }
        return rightOne;
    });
}

router.post("/submittask", function(req, res) {
    TaskApi(req).submitTask({
        taskId: req.query.taskid ? Util.toInt(req.query.taskid) : req.query.taskid,
        name: req.query.name,
        mode: 3,
        dirId: Util.toInt(req.query.dirid),
        description: req.query.description,
        taskType: 107,
        priority: 1,
        taskDetail: req.query.taskdetail
    }, res.endj);
});

router.post("/pausetask", function(req, res) {
    TaskApi(req).pauseStreamTask({
        taskId: Util.toInt(req.query.taskid)
    }, res.endj);
});

router.get("/taskinfo", function(req, res) {
    TaskApi(req).getStreamRunningInfo({
        taskId: Util.toInt(req.query.taskid),
        runToNode: req.query.runtonode
    }, res.endj);
});

router.post("/getnodeoutput", function(req, res) {
    TaskApi(req).getNodeOutput({
        srcDataTypes: req.query.srcDataTypes,
        nodeInfo: req.query.nodeInfo
    }, res.endj);
});

router.post("/savetask", function(req, res) {
    TaskApi(req).saveTask({
        taskId: req.query.taskid ? Util.toInt(req.query.taskid) : req.query.taskid,
        taskName: req.query.name,
        description: req.query.description,
        dirId: Util.toInt(req.query.dirid)
    }, res.endj);
});

router.get('/getsnapshot', function(req, res) {
    RGApi(req).getSnapshotList({
        analysisId: req.query.taskid,
        startPos: 0,
        pageSize: 5,
        snapshotType: 0,
        autosave: 0
    }, res.endj);
});

router.post('/savesnapshot', function(req, res) {
    RGApi(req).saveSnapshot({
        analysisId: req.query.taskid,
        title: req.query.title,
        graph: req.query.graph,
        data: '',
        remark: req.query.remark,
        autoSave: 0,
        taskType: 107
    }, res.endj);

});

router.get('/getcoltransformfunction', function(req, res) {
    TaskApi(req).getColTransformFunction().then(function(rsp) {
        var tree = [];
        var folders = {};
        _.each(rsp.data.funcList, function(item) {
            if (!folders[item.dirName]) {
                var folder = {
                    title: item.dirName,
                    folder: true,
                    children: []
                }
                folders[item.dirName] = folder;
                tree.push(folder);
            }
        })
        _.each(rsp.data.funcList, function(item) {
            item.title = item.caption + "(" + item.name + ")";
            item.key = item.name;
            item.tooltip = item.hint;
            folders[item.dirName].children.push(item);
        })
        res.endj({
            code: 0,
            data: tree
        })
    }).catch(res.endj);
});

/**
 * type: 1 数据源，2 算子
 */
router.get('/getfavoritems', function(req, res) {
    TaskApi(req).getPersonFavor({
        type: req.query.type
    }, res.endj);
});

router.post('/addfavoritem', function(req, res) {
    TaskApi(req).addPersonFavor({
        type: req.query.type,
        id: req.query.id,
        caption: req.query.caption
    }, res.endj);
});

router.post('/delfavoritem', function(req, res) {
    TaskApi(req).delPersonFavor({
        type: req.query.type,
        id: req.query.id
    }, res.endj);
});

router.post('/checkexpression', function(req, res) {
    TaskApi(req).checkExpression({
        expression: req.query.expression,
        inputNodes: JSON.parse(req.query.inputnodes),
        inputColumnDescList: JSON.parse(req.query.inputcolumndesclist)
    }, res.endj);
});

router.get('/getmymodels', function(req, res) {
    TaskApi(req).getUserModels({}, res.endj);
});

router.get('/loadmodel', function(req, res) {
    TaskApi(req).openModel({
        modelId: req.query.id
    }, res.endj);
});
router.get('/loadsolid', function(req, res) {
    TaskApi(req).openOriginalModel({
        solidId: req.query.solidId
    }, res.endj);
});

// 新建模型时modelId == 0
router.post('/savemodel', function(req, res) {
    TaskApi(req).saveModel({
        modelId: req.query.id || 0,
        modelName: req.query.name,
        modelDesc: req.query.desc,
        dirId: req.query.dirid,
        modelType: 107,
        modelDetail: req.query.detail
    }, res.endj);
});

router.get('/checkmodelpermission', function(req, res) {
    TaskApi(req).checkModelPermission({
        modelId: req.query.id
    }, res.endj);
});

router.post('/updatemodel', function(req, res) {
    TaskApi(req).updateModel({
        modelId: req.query.id,
        modelName: req.query.name,
        modelDetail: req.query.detail
    }, res.endj);
});

router.post('/updatesolid', function(req, res) {
    TaskApi(req).saveOriginalModel({
        solidId: req.query.solidId,
        modelDetail: req.query.modelDetail
    }, res.endj);
});

router.post('/deletemodel', function(req, res) {
    TaskApi(req).deleteModel({
        modelIdList: req.query.ids
    }, res.endj);
});

router.get('/groupstatistics', function(req, res) {
    TaskApi(req).getGroupStatFunction({}, res.endj);
});

router.get('/previewdatasource', function(req, res) {
    TaskApi(req).previewNodeData({
        centerCode: req.query.centercode,
        typeId: req.query.typeid,
        zoneId: req.query.zoneid,
        limit: 100
    }, res.endj);
});

router.get('/getcodetable', function(req, res) {
    TaskApi(req).getStreamCodeTable({
        codeTable: req.query.codetable,
        codeField: req.query.codefield,
        codeDisNameField: req.query.codedisnamefield,
        queryWord: req.query.queryword
    }, res.endj);
});

router.get('/getcodetablebycode', function(req, res) {
    TaskApi(req).getStreamCodeTableByCode({
        codeTable: req.query.codetable,
        codeField: req.query.codefield,
        codeDisNameField: req.query.codedisnamefield,
        code: JSON.parse(req.query.code)
    }).then(function(rsp1) {
        TaskApi(req).getStreamCodeTable({
            codeTable: req.query.codetable,
            codeField: req.query.codefield,
            codeDisNameField: req.query.codedisnamefield,
            queryWord: ''
        }).then(function(rsp2) {
            var out = rsp1.data;
            Array.prototype.push.apply(out, rsp2.data);
            out = _.uniq(out, false, function(item) {
                return item.id;
            });
            res.endj({
                code: 0,
                data: out
            })

        })
    }).catch(res.endj);
});

router.get('/getdatatypecoldef', function(req, res) {
    SQApi(req).getDataTypeColDef({
        centerCode: req.query.centercode,
        zoneId: req.query.zoneid,
        typeId: req.query.typeid,
        isWithFavor: req.query.iswithfavor
    }).then(function(rsp) {
            var result = rsp.data.outputColumnDescList;
            res.endj({
                code: 0,
                data: {
                    outputColumnDescList: _.filter(result, function (field) {
                        return field.isQueryable == 1;
                    })
                }
            })
        }).catch(res.endj);
});

router.post('/fieldmapping', function(req, res) {
    TaskApi(req).getFieldMapOfDataSources({
        outputColumnDescList1: req.query.outputlist1,
        outputColumnDescList2: req.query.outputlist2
    }, res.endj);
});

router.get('/getsearchitem', function(req, res) {
    TaskApi(req).getSearchItem({}, res.endj);
});

router.post('/replacenodemapcolumns', function(req, res) {
    TaskApi(req).replaceNodeMapColumns({
        srcReplacedNodeId: req.query.nodeid,
        outputColumnNameMapList: req.query.maplist,
        childrenNodeInfo: JSON.parse(req.query.childrennodeinfo)
    }, res.endj);
});

router.post('/updatenodedetail', function(req, res) {
    TaskApi(req).updateNodeDetail({
        srcDataTypes: JSON.parse(req.query.srcDataTypes),
        nodeInfo: req.query.nodeInfo
    }, res.endj);
});

router.get('/listmodelingtree',function(req,res){
    TaskApi(req).getModelDir()
        .then(function(rsp) {
            var dirs = rsp.data;
            TaskApi(req).getModel({modelType:107})
                .then(function(rsp2) {
                    var datasource = rsp2.data;
                    var sysRoot = [];
                    var personalRoot = [];
                    var sysIdmap = {};
                    var personalIdmap = {};
                    var returnData = [];
                    var result = {
                        systree:[],
                        personaltree:[]
                    };

                    function findParent(dir, tree, idmap) {
                        if (!idmap[dir.parentId]) {
                            if (!_.contains(tree, dir)) {
                                tree.push(dir);
                            }
                        } else {
                            var parent = idmap[dir.parentId];
                            if (parent) {
                                parent.children = parent.children || [];
                                if (!_.contains(parent.children, dir)) {
                                    parent.children.push(dir);
                                    parent.folder = true;
                                    findParent(parent, tree, idmap);
                                }
                            }
                        }

                    }

                    _.each(dirs.sysDir, function(dir) {
                        sysIdmap[dir.dirId] = dir;
                        dir.folder = false;
                        dir.key = dir.dirId;
                        dir.title = dir.dirName;
                        dir.extraClasses = "nv-dir";
                        dir.hideCheckbox = true;
                    });

                    _.each(dirs.personalDir, function(dir) {
                        personalIdmap[dir.dirId] = dir;
                        dir.folder = false;
                        dir.key = dir.dirId;
                        dir.title = dir.dirName;
                        dir.extraClasses = "nv-dir";
                        dir.hideCheckbox = true;
                    })

                    _.each(dirs.sysDir, function(dir){
                        findParent(dir, sysRoot, sysIdmap);
                    })

                    _.each(dirs.personalDir, function(dir){
                        findParent(dir, personalRoot, personalIdmap);
                    })

                    _.each(datasource, function(model) {
                        var dir = sysIdmap[model.dirId];
                        if (dir) {
                            dir.children = dir.children || [];
                            model.title = model.modelName;
                            model.key = model.modelId;
                            model.extraClasses = 'nv-model';
                            dir.children.push(model);
                            dir.folder = true;
                            findParent(dir, result.systree, sysIdmap);
                        }
                    });

                    _.each(datasource, function(model) {
                        var dir = personalIdmap[model.dirId];
                        if (dir) {
                            dir.children = dir.children || [];
                            model.title = model.modelName;
                            model.key = model.modelId;
                            model.extraClasses = 'nv-model';
                            dir.children.push(model);
                            dir.folder = true;
                            findParent(dir, result.personaltree, personalIdmap);
                        }
                    });

                    result.systree[0]==null?returnData.push(sysRoot[0]):returnData.push(result.systree[0]);
                    result.personaltree[0]==null?returnData.push(personalRoot[0]):returnData.push(result.personaltree[0]);

                    res.endj({
                        code: 0,
                        data: returnData
                    });
                }).catch(res.endj);
        }).catch(res.endj);
});

router.get('/getdatatypedefineinfo', function(req, res) {
    ImportBatchApi(req).GetDataTypeDefineInfo({
        centerCode: req.query.centerCode,
        dataTypeId: req.query.dataTypeId
    }).then(function(rsp) {
            var result = rsp.data.datatype;
            res.endj({
                code: 0,
                data: {
                    displayName: result.displayName,
                    description: result.description,
                    dataCount: result.dataCount,
                    maxBusTime: result.maxBusTime,
                    minBusTime: result.minBusTime
                }
            })
        }).catch(res.endj);
});

module.exports = router;
