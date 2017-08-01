var router = require('express').Router();
var soap = require('soap');
var SQApi = require('../jws/smartquery');
var TCApi = require('../jws/taskcommon');
var LogApi = require('../../../framework/jws/log');
var URApi = require('../../../framework/jws/role');
var moment = require('moment');
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');
var http = require('http');
var qs = require('querystring');
var sysConfig = require('../../../utils/config-system.js');
var appConfig = require('../../../config/config.js');



router.get('/submitintelligentquery', function(req, res) {
    var data = {
        "name": req.query.name,
        "mode": Util.toInt(req.query.mode),
        "taskType": Util.toInt(req.query.taskType),
        "priority": Util.toInt(req.query.priority),
        "taskDetail": req.query.taskDetail
    };

    if (req.query.dirId != undefined) {
        data["dirId"] = Util.toInt(req.query.dirId);
    };

    TCApi(req).submitTask(data).then(function(rsp) {


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
            ModuleID: '109',
            ModuleName:'大数据围栏',
            EventType: '4013',
            EventTypeDes: '大数据围栏',
            Detail: req.generalArgument.loginName + '在' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '提交大数据围栏',
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
            moduleType: 109,
            operationType: 10,
            content: req.query.condStr,
            detailType: 1,
            detailId: rsp.data,
            AuditInfo: auditInfo
        }));

        Q.all(promises).then(function(rsp2) {
            res.endj({
                code: 0,
                data: {
                    taskId: rsp.data,
                    queryType: 1
                }
            });
        }).catch(function() {
            res.endj({
                code: 0,
                message: "记录日志失败",
                data: rsp.data
            });
        });
    }).catch(res.endj);
});

router.post("/submitcollisiontask", function(req, res) {
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

    TCApi(req).submitTask(data).then(function(rsp) {
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
            ModuleID: '109',
            ModuleName:'',
            EventType: '4012',
            EventTypeDes: '大数据围栏',
            Detail: req.generalArgument.loginName + '在' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '提交大数据围栏',
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
            moduleType: 109,
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

router.get('/gettaskBaseCond', function(req, res) {
    var data = {
        taskId: Util.toInt(req.query.taskId)
    };
    TCApi(req).getNoCondTaskDetailByTaskId(data, res.endj);
});

module.exports = router;