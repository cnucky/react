var router = require('express').Router();
var soap = require('soap');
var TCApi = require('../jws/taskcommon');
var LogApi = require('../../../framework/jws/log');
var fs = require('fs');
var moment = require('moment');
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');
var http = require('http');
var qs = require('querystring');
var appConfig = require('../../../config/config.js');


//edit by zhangu
router.post('/saveModel', function(req, res) {
    var data = {
        "modelId": Util.toInt(req.query.modelId),
        "modelName": req.query.modelName,
        "modelDesc": req.query.modelDesc,
        "dirId": Util.toInt(req.query.dirId),
        "modelType": Util.toInt(req.query.modelType),
        "modelDetail": req.query.modelDetail
    }
    TCApi(req).saveModel(data, res.endj);
})

router.get('/openModel', function(req, res) {
    var data = {
        "modelId": Util.toInt(req.query.modelId)
    }
    TCApi(req).openModel(data, res.endj);
})

router.post('/updateModel', function(req, res) {
    var data = {
        "modelId": Util.toInt(req.query.modelId),
        "modelDetail": req.query.modelDetail
    }
    TCApi(req).updateModel(data, res.endj);
})

router.get('/checkModelPermission', function(req, res) {
        var data = {
            "modelId": Util.toInt(req.query.modelId)
        }
        TCApi(req).checkModelPermission(data, res.endj);
    })

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
            ModuleID: '205',
            ModuleName:'离线分析',
            EventType: '4013',
            EventTypeDes: '离线分析',
            Detail: req.generalArgument.loginName + '在' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '提交专项查询',
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
            moduleType: 205,
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

module.exports = router;