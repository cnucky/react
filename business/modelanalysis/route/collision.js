var router = require('express').Router();
var soap = require('soap');
var TaskApi = require('../jws/taskcommon');
var LogApi = require('../../../framework/jws/log');
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');
var moment = require('moment');
var appConfig = require('../../../config/config.js');

router.get('/listdatasource', function(req, res) {
    TaskApi(req).getDataTypeDir()
        .then(function(rsp) {
            var dirs = rsp.data;
            TaskApi(req).getDataType()
                .then(function(rsp2) {
                    var datasource = rsp2.data;
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

                    function processModelingTask(data) {
                        if (data.taskType == 107) {
                            data.lazy = true;
                            data.extraClasses = "nv-dir";
                            data.folder = false;
                            data.hideCheckbox = true;
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
                    _.each(datasource.sysData, function(data) {
                        var dir = sysIdmap[data.dirId];
                        if (dir) {
                            dir.children = dir.children || [];
                            data.title = data.caption;
                            data.key = data.centerCode + data.typeId + data.zoneId;
                            data.extraClasses = 'nv-data';
                            dir.children.push(data);
                            dir.folder = true;
                            findParent(dir, result.sysTree, sysIdmap);
                        }
                    });
                    _.each(datasource.personalData, function(data) {
                        var dir = personalIdmap[data.dirId];
                        if (dir) {
                            console.log(data);
                            dir.children = dir.children || [];
                            data.title = data.caption;
                            data.key = data.centerCode + data.typeId + data.zoneId;
                            data.extraClasses = data.zoneId == 2 ? 'nv-data' : 'nv-task';
                            processModelingTask(data);
                            data.srcTypeId = data.srcTypeId;
                            dir.children.push(data);
                            dir.folder = true;
                            findParent(dir, result.personalTree, personalIdmap);
                        }
                    });
                    res.endj({
                        code: 0,
                        data: result
                    });
                }).catch(res.endj);
        }).catch(res.endj);
});

router.get('/listmodelingtask', function(req, res) {
    TaskApi(req).getStreamTaskDataTypes({
        taskId: Util.toInt(req.query.taskId)
    }).then(function(rsp) {
        var tasks = rsp.data.streamTaskData;
        var result = [];
        _.each(tasks, function(data) {
            data.title = data.caption;
            data.key = data.centerCode + data.typeId + data.zoneId;
            data.extraClasses = 'nv-data';
            result.push(data);
        })
        res.endj(result);
    }).catch(res.endj);
});

router.get("/getdatasourceinfo", function(req, res) {
    TaskApi(req).getDataTypeQueryConfig({
        centerCode: req.query.centercode,
        zoneId: req.query.zoneid,
        typeId: req.query.typeid
    }, res.endj);
});

router.get("/batchQueryDataType", function(req, res) {
    TaskApi(req).batchQueryDataType({
        params: req.query.params
    }, res.endj);
});


router.get("/getsemanticdef", function(req, res) {
    TaskApi(req).getSemanticDefine({}, res.endj);
});

router.post("/submittask", function(req, res) {
    var data = {
        taskId: req.query.taskid,
        name: req.query.name,
        mode: req.query.mode,
        dirId: req.query.dirid,
        description: req.query.taskdesc,
        taskType: req.query.tasktype,
        priority: req.query.priority,
        taskDetail: req.query.taskdetail
    };

    TaskApi(req).submitTask(data).then(function(rsp) {
        var datas = [{
            Type: 'KEYWORD',
            Content: '详情:' + JSON.stringify(req.query.taskDetail)
        }]

        var common = {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: '1',
            ModuleID: '206',
            ModuleName:'集合分析',
            EventType: '4012',
            EventTypeDes: '集合分析',
            Detail: req.generalArgument.loginName + '在' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '提交集合分析',
            Result: '0'
        }

        var TaskFetch = [{
            TaskID: rsp.data,
            FTaskID: -1,
            SpyTime: {
                Begin: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                End: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            },
            Datas: datas
        }]

        var auditInfo = {}
        auditInfo.Common = common;
        auditInfo.TaskFetch = TaskFetch;
        var promises = [];
        promises.push(LogApi(req).recordLog({
            moduleType: 206,
            operationType: 10,
            content: req.query.condStr,
            detailType: 1,
            detailId: rsp.data,
            AuditInfo: auditInfo
        }));

        Q.all(promises).then(function(rsp2) {
            res.endj({
                code: 0,
                data: rsp.data
            });
        }).catch(function() {
            res.endj({
                code: 1,
                message: "记录日志失败"
            });
        });
    }).catch(res.endj);
})

router.get("/getresult", function(req, res) {
    TaskApi(req).getResult({
        taskId: req.query.taskid,
        needMeta: req.query.needmeta,
        startIndex: req.query.startindex,
        length: req.query.length
    }, res.endj);
})

router.get('/gettaskinfo', function(req, res) {
    var data = {
        taskId: Util.toInt(req.query.taskid)
    };
    TaskApi(req).getTaskDetailByTaskId(data, res.endj);
});

module.exports = router;
