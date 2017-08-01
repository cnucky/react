
var router = require('express').Router();
var soap = require('soap');
var TaskadminGraphExploreApi = require('../jws/taskadmin');
var TasktypeExploreApi = require('../jws/tasktype');
var _ = require('underscore');

var Util = require('../utils/util');
var moment = require('moment');
var CommonConfig = require('../../../framework/utils/common-config.js');
var appConfig = require('../../../config/config.js');


router.get('/getgraphbar', function(req, res) {
    TaskadminGraphExploreApi(req).countTasks({
        "timeInterval":req.query.timeInterval,
        "sectionType":req.query.sectionType
    }, res.endj);
});

router.get('/getgraphline', function(req, res) {
    TaskadminGraphExploreApi(req).taskStatistics({
        "date":req.query.date,
        "statisticsType":req.query.statisticsType
    }, res.endj);
});

router.get('/getgraphpiestatus', function(req, res) {
    TaskadminGraphExploreApi(req).taskStatistics({
        "date":req.query.date,
        "statisticsType":req.query.statisticsType
    }, res.endj);
});


router.get('/gettasktype', function(req, res) {
    TasktypeExploreApi(req).getConfigContent({
        "configName":req.query.configName,
        "configLanguage":req.query.configLanguage
    },
    CommonConfig.getConfigFile('config_tasktype.xml' ,req, function(result){
        var taskTypeName = {};
        _.each(result.CONFIG.DIC[0].TYPE, function(type){
            taskTypeName[type.ID[0]] = type.NAME[0];

        })
        res.endj({code:0, data:taskTypeName, message:""})
    })
    );
});
router.get('/getgraphpieclass', function(req, res) {
    TaskadminGraphExploreApi(req).taskStatistics({
        "date":req.query.date,
        "statisticsType":req.query.statisticsType
    }, res.endj);
});

module.exports = router;