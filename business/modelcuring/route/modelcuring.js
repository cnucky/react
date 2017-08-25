var router = require('express').Router();
var _ = require('underscore');
// var RegularApi = require('../jws/taskcommon');
var Util = require('../utils/util');
var Q = require('q');
var moment = require('moment');
var appConfig = require('../config.js');

router.get('/schemesummarylist', function(req, res) {
    RegularApi(req).getSchemeSummaryList(res.endj);
})
router.get('/tasksummaries', function(req, res) {
    RegularApi(req).getSchemeDetail({
       schemeId: req.query.schemeId
    }, res.endj);
})
router.post('/addExecuteScheme', function(req, res) {
    RegularApi(req).createExecuteScheme({
        modelId: req.query.modelId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        nextExecuteTime: req.query.nextExecuteTime,
        executeTime: req.query.executeTime,
        executeInterval: req.query.executeInterval,
        taskNamePre: req.query.taskNamePre,
        schemeName: req.query.schemeName,
        taskDirId: req.query.taskDirId,
        enable: req.query.enable
    }, res.endj);
})
router.post('/editExecuteScheme', function(req, res) {
    RegularApi(req).createExecuteScheme({
        modelId: req.query.modelId,
        schemeId: req.query.schemeId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        nextExecuteTime: req.query.nextExecuteTime,
        executeTime: req.query.executeTime,
        executeInterval: req.query.executeInterval,
        taskNamePre: req.query.taskNamePre,
        schemeName: req.query.schemeName,
        taskDirId: req.query.taskDirId,
        enable: req.query.enable
    }, res.endj);
})
router.post('/deleteExecuteScheme', function(req, res) {
    RegularApi(req).deleteExecuteScheme({
        schemeIds: req.query.schemeIds
    }, res.endj);
})
router.post('/enableScheme', function(req, res) {
    RegularApi(req).setSchemeStatus({
        schemeIds: req.query.schemeIds,
        enable: req.query.enable
    }, res.endj);
})
router.get('/getTaskListBySchemeId', function(req, res) {
    RegularApi(req).getTaskListBySchemeId({
        schemeId: req.query.schemeId
    }).then(function (rsp) {
        var taskIds = rsp.data
        RegularApi(req).getTaskSummaries({
            taskList: rsp.data.taskList
        }).then(function (rsp2) {
            res.endj({
                code: 0,
                data: rsp2.data
            });
        }).catch(res.endj)
    }).catch(res.endj)
})


module.exports = router;


