var router = require('express').Router();
var soap = require('soap');
var TaskadminAssignmentStatusApi = require('../jws/taskadmin');
var Util = require('../utils/util');
var moment = require('moment');
var appConfig = require('../../../config/config.js');


router.get('/searchdata', function(req, res) {
    var selectObj = {
        'index': req.query.index,
        'pageSize': req.query.pageSize,
        'orderBy': req.query.orderBy,
        'orderType': req.query.orderType
    };

    if (req.query.taskNameContain && req.query.taskNameContain !== '') {
        selectObj.taskNameContain = req.query.taskNameContain;
    }
    if (req.query.submitUserIds && req.query.submitUserIds.length > 0) {
        selectObj.submitUserIds = req.query.submitUserIds;
    }
    if (req.query.taskStatus && req.query.taskStatus.length > 0) {
        selectObj.taskStatus = req.query.taskStatus;
    }
    if (req.query.taskType && req.query.taskType.length > 0) {
        selectObj.taskType = req.query.taskType;
    }
    if (req.query.submitTime && req.query.submitTime.length > 0) {
        selectObj.submitTime = req.query.submitTime;
    }
    TaskadminAssignmentStatusApi(req).selectTasks(selectObj, res.endj);
})


router.get('/operate', function(req, res) {
    TaskadminAssignmentStatusApi(req).operateTask({
        'operateType': req.query.operateType,
        'taskId': req.query.taskId
    }, res.endj);
})

module.exports = router;
