/**
 * Created by rhtkb on 2016/9/18.
 */
var router = require('express').Router();
var TaskApi = require('../jws/taskcommon');
var RGApi = require('../jws/relationgraph')
var _ = require('underscore');
var Q = require('q');

router.get('/loadmodel', function(req, res) {
    TaskApi(req).openModel({
        modelId: req.query.modelid
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

router.post('/updatemodel', function(req, res) {
    TaskApi(req).updateModel({
        modelId: req.query.id,
        modelName: req.query.name,
        modelDetail: req.query.detail
    }, res.endj);
});

router.get('/checkTask', function(req, res) {
    TaskApi(req).checkTaskReportExist({
        taskId: req.query.taskId
    }, res.endj);
});

router.post('/saveReport', function(req, res) {
    TaskApi(req).saveTaskReport({
        taskId: req.query.taskId,
        dirId: req.query.dirId,
        reportName : req.query.reportName,
        reportDesc : req.query.reportDesc,
        reportDetail : JSON.parse(req.query.reportDetail)
    }, res.endj);
});

router.post('/upDateReport', function(req, res) {
    TaskApi(req).updateTaskReport({
        reportId : req.query.reportId,
        reportDetail : JSON.parse(req.query.reportDetail)
    }, res.endj);
});


router.get('/getReport', function(req, res) {
    var params = {
        reportId: req.query.reportId
    };
    TaskApi(req).getTaskReport(params, res.endj);
});

router.get('/queryreportdata', function(req, res) {
    var dataSource = req.query.dataSource;

    /** 数据源节点 */
    if(dataSource.nodeType == 0) {
        var params_else = {
            centerCode: dataSource.centerCode,
            typeId: dataSource.typeId, 
            zoneId: dataSource.zoneId,
            limit: 1000,
            queryFields: req.query.queryFields
        };

        TaskApi(req).previewNodeData(params_else).then(function(rsp) {
            /** 保存数据 */
            var result = [];
            /** 键名 */
            var meta = rsp.data.meta;
            /** 键值 */
            var records = rsp.data.records;

            _.each(records, function(record) {
                var item = {};
                _.each(meta, function(key, index) {
                    item[key.name] = record[index];
                })
                result.push(item);
            });

            res.endj({
                code: rsp.code,
                message: rsp.message,
                data: result
            })
        }).catch(res.endj);
    }
    /** 算子节点 */
    else {
        var params = {
            mainTaskId: req.query.mainTaskId,
            nodeId: dataSource.id,
            queryFields: req.query.queryFields
        };

        TaskApi(req).queryReportData(params).then(function(rsp) {
            /** 保存数据 */
            var result = [];
            /** 键名 */
            var meta = rsp.data.meta;
            /** 键值 */
            var records = rsp.data.records;

            _.each(records, function(record) {
                var item = {};
                _.each(meta, function(key, index) {
                    item[key.name] = record[index];
                })
                result.push(item);
            });

            res.endj({
                code: rsp.code,
                message: rsp.message,
                data: result
            })
        }).catch(res.endj);
    }
});

router.get('/listbireportTree',function(req,res){
    TaskApi(req).getModelDir()
        .then(function(rsp) {
            var dirs = rsp.data;
            TaskApi(req).getAllBiReportInfo({modelType:501})
                .then(function(rsp2) {
                    console.log(rsp2);
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
                            model.title = model.reportName;
                            model.key = model.reportId;
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
                            model.title = model.reportName;
                            model.key = model.reportId;
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

router.get('/getExport', function(req, res) {
    var params = {
        fileName:req.query.fileName,
        header: req.query.header,
        data: req.query.data
    };
    TaskApi(req).exportDataToExcel(params, res.endj);
});

var FAVOR_DIR = {
    datasource: '常用数据',
    operation: '常用组件'
};

router.get('/getdatasource', function(req, res) {
    var dataDirPromise = TaskApi(req).getDataTypeDir();
    var dataTypePromise = TaskApi(req).getDataType();
    Q.all([dataDirPromise, dataTypePromise]).spread(function(dirs, dataSource) {
        dirs = dirs.data;
        dataSource = dataSource.data;
        var sysIdmap = {};
        var personalIdmap = {};
        var result = {
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

        _.each(dirs.personalDir, function(dir) {
            personalIdmap[dir.dirId] = dir;
            dir.folder = true;
            dir.key = dir.dirId;
            dir.title = dir.dirName;
            dir.extraClasses = "nv-dir";
            dir.hideCheckbox = true;
            if(dir.title == '个人工作区'){
                dir.expanded = true;
            }
        });

        _.each(dataSource.personalData, function(data) {
            var dir = personalIdmap[data.dirId];
            if (dir && data.taskType == 107) {
                dir.children = dir.children || [];
                data.title = data.caption;
                data.tooltip = data.caption;
                data.key = data.centerCode + '_' + data.zoneId + '_' + data.typeId;
                data.extraClasses = 'nv-data';
                dir.children.push(data);
                data.hideCheckbox = true;
                findParent(dir, result.personalTree, personalIdmap);
            }
        });

        result = result.personalTree;
        res.endj({
            code: 0,
            data: result
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

module.exports = router;