var router = require('express').Router();
var soap = require('soap');
var PCMApi = require('../jws/pcmanage');
var Util = require('../../../framework/utils/util');
var _ = require('underscore');

router.get('/datatypetree', function(req, res) {
    PCMApi(req).getDataType({
            // userId: Util.toInt(req.query.userId),
        })
        .then(function(rsp) {
            var data = rsp.data;
            var sysIdmap = {};
            var personalIdmap = {};
            var qaTaskIdmap = {};
            var midResult = {
                sysTree: [],
                personalTree: [],
                qaTaskTree:[]
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

            _.each(data.sysDir, function(dir) {
                sysIdmap[dir.dirId] = dir;
                dir.folder = false;
                dir.key = dir.dirId;
                dir.title = dir.dirName;
                dir.extraClasses = "nv-dir";
                dir.hideCheckbox = true;
            });
            _.each(data.personalDir, function(dir) {
                personalIdmap[dir.dirId] = dir;
                dir.folder = false;
                dir.key = dir.dirId;
                dir.title = dir.dirName;
                dir.extraClasses = "nv-dir";
                dir.hideCheckbox = true;
            })
            
            _.each(data.sysData, function(data) {
                var dir = sysIdmap[data.dirId];
                if (dir) {
                    dir.children = dir.children || [];
                    data.title = data.caption;
                    data.key = data.centerCode + data.typeId + data.zoneId;
                    data.extraClasses = 'nv-data';
                    dir.children.push(data);
                    dir.folder = true;
                    findParent(dir, midResult.sysTree, sysIdmap);
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

            _.each(data.personalData, function(data) {
                var dir = personalIdmap[data.dirId];
                if (dir) {
                    dir.children = dir.children || [];
                    data.title = data.caption;
                    data.key = data.centerCode + data.typeId + data.zoneId;
                    data.extraClasses = 'nv-data';
                    processModelingTask(data);
                    dir.children.push(data);
                    dir.folder = true;
                    findParent(dir, midResult.personalTree, personalIdmap);
                }
            });

            if (data.qaTaskData) {
                _.each(data.qaTaskDir, function(dir) {
                    qaTaskIdmap[dir.dirId] = dir;
                    dir.folder = false;
                    dir.key = dir.dirId;
                    dir.title = dir.dirName;
                    dir.extraClasses = "nv-dir";
                    dir.hideCheckbox = true;
                });

                _.each(data.qaTaskData, function(data) {
                    var dir = qaTaskIdmap[data.dirId];
                    if (dir) {
                        dir.children = dir.children || [];
                        data.title = data.caption;
                        data.key = data.centerCode + data.typeId + data.zoneId;
                        data.extraClasses = 'nv-data';
                        dir.children.push(data);
                        dir.folder = true;
                        findParent(dir, midResult.qaTaskTree, qaTaskIdmap);
                    }
                });
            }

            var result = _.union(midResult.sysTree, midResult.personalTree, midResult.qaTaskTree);
            res.endj({
                code: 0,
                data: result
            });
        }).catch(res.endj);
});

router.get('/checkImportTask', function(req, res){
    PCMApi(req).checkImportTask({
        dataTypeId: Util.toInt(req.query.dataTypeId)
    }).then(function(rsp){
        res.endj(rsp);
    }).catch(res.endj);
});

router.get('/getDataTypeColDef', function(req, res) {
    PCMApi(req).getDataTypeColDef({
        typeId: req.query.typeId,
        zoneId: req.query.zoneId,
        centerCode: req.query.centerCode
    }, res.endj);
});

router.get('/getDataTypeColDef', function(req, res) {
    PCMApi(req).getDataTypeColDef({
        typeId: req.query.typeId,
        zoneId: req.query.zoneId,
        centerCode: req.query.centerCode
    }, res.endj);
});

router.get('/searchCodeTable', function(req, res) {
    PCMApi(req).searchCodeTable({
        fieldName: req.query.fieldName,
        typeId: Util.toInt(req.query.typeId),
        queryWord: req.query.queryWord
    }, res.endj);
});


router.post('/submitTask', function(req, res) {
    PCMApi(req).submitTask({
        createNew: req.query.createNew,
        taskId: Util.toInt(req.query.taskId),
        taskName: req.query.taskName,
        taskType: Util.toInt(req.query.taskType),
        taskRemark: req.query.taskRemark,
        centerCode: Util.toInt(req.query.centerCode),
        zoneId: Util.toInt(req.query.zoneId),
        dataTypeId: Util.toInt(req.query.dataTypeId),
        dataTypeName: req.query.dataTypeName,
        switchButton: req.query.switchButton,
        taskDetail: JSON.parse(req.query.taskDetail),
        uiDetail: JSON.parse(req.query.uiDetail)
    }, res.endj);
});

router.post('/gettaskdetail', function(req, res) {
    PCMApi(req).getTaskDetail({
        taskId: Util.toInt(req.query.taskId)
    }, res.endj);
});

router.get('/getbasicproperty', function(req, res) {
    PCMApi(req).getBasicProperty({}, res.endj);
});

router.get('/getrecords', function(req, res) {
    PCMApi(req).getRecords({
        dataTypeId: Util.toInt(req.query.dataTypeId),
        count: 10
    }, res.endj);
});

router.get('/getdataiteminfo', function(req, res) {
    PCMApi(req).getDataItemInfo({
        batchId: Util.toInt(req.query.batchId)
    }, res.endj);
});

router.get('/gettaskinfo', function(req, res) {
    PCMApi(req).getTaskInfo({
        dataTypeId: Util.toInt(req.query.dataTypeId)
    }, res.endj);
});

router.get('/getbatchinfo', function(req, res) {
    PCMApi(req).getBatchInfo({
        taskId: Util.toInt(req.query.taskId)
    }, res.endj);
});

router.post('/updatetaskstate', function(req, res) {
    PCMApi(req).updateTaskState({
        taskId: Util.toInt(req.query.taskId),
        toState: Util.toInt(req.query.toState)
    }, res.endj);
});

router.post('/deletetask', function(req, res) {
    PCMApi(req).deleteTask({
        taskId: Util.toInt(req.query.taskId)
    }, res.endj);
});

module.exports = router;