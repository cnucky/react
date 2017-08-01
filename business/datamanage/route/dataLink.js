/**
 * Created by root on 12/17/15.
 */

var router = require('express').Router();
var DLApi = require('../jws/dataLink');
var Util = require('../utils/util');
var appConfig = require('../../../config/config.js');
var moment = require('moment');

router.all('/GetAllConnection', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "431",
            ModuleName: '数据链管理',
            EventType: "10001",
            EventTypeDes: "获取数据链信息",
            Detail: "",
            Result: "0"
        },
    };
    DLApi(req).GetAllConnection({
        'AuditInfo': auditInfo
    }, res.endj)
});

router.all('/CreateConnection', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "431",
            ModuleName: '数据链管理',
            EventType: "10002",
            EventTypeDes: "新建数据链",
            Detail: "",
            Result: "0"
        },
    };

    var data = {
        "srcCenterCode": Util.toInt(req.query.srcCenterCode),
        "tarCenterCode": Util.toInt(req.query.tarCenterCode),
        "connectLevel": req.query.connectLevel,
        "connectStatus": Util.toInt(req.query.connectStatus),
        "userID": req.query.userID,
        "passWord": req.query.passWord,
        "connectDescription": req.query.connectDescription,
        'AuditInfo': auditInfo
    };
    DLApi(req).CreateConnection(data, res.endj)
});

router.all('/CloseConnection', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "431",
            ModuleName: '数据链管理',
            EventType: "10003",
            EventTypeDes: "关闭数据链",
            Detail: "",
            Result: "0"
        },
    };

    var data = {
        "connectID": req.query.connectID,
        'AuditInfo': auditInfo
    };
    DLApi(req).CloseConnection(data, res.endj)
});

router.all('/GetConnectionByID', function(req, res) {
    var data = {
        "connectID": req.query.connectID
    };
    console.log("GetConnectionByID", data);
    DLApi(req).GetConnectionByID(data, res.endj)
});

router.all('/CreateTask', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "431",
            ModuleName: '数据链管理',
            EventType: "10004",
            EventTypeDes: "创建获取数据任务",
            Detail: "",
            Result: "0"
        },
    };
    var data = {
        "taskName": req.query.taskName,
        "datatypeId": req.query.datatypeId,
        "systemId": req.query.tarSystemId,
        "srcSystemId": req.query.srcSystemId,
        "connectId": req.query.connectId,
        "taskType": req.query.taskType,
        "dataStartTime": req.query.dataStartTime,
        "dataEndTime": req.query.dataEndTime,
        'AuditInfo': auditInfo
    };
    console.log("CreateTask:", data);
    DLApi(req).CreateTask(data, res.endj)
});

router.all('/GetAllTaskByConnection', function(req, res) {
    var data = {
        "connectID": req.query.connectID
    };
    DLApi(req).GetAllTaskByConnection(data, res.endj)
});

router.all('/ModifyTaskState', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "431",
            ModuleName: '数据链管理',
            EventType: "10005",
            EventTypeDes: "修改获取数据任务状态",
            Detail: "",
            Result: "0"
        },
    };
    var data = {
        "connected": req.query.connectID,
        "tarSystemId": req.query.tarSystemId,
        "srcSystemId": req.query.srcSystemId,
        "taskId": req.query.taskId,
        "taskStatus": req.query.TaskStatus,
        'AuditInfo': auditInfo
    };
    DLApi(req).ModifyTaskState(data, res.endj)
});

module.exports = router;
