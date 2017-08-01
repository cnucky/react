var router = require('express').Router();
var soap = require('soap');
var PersonRelationExploreApi = require('../jws/personrelationexplore');
var Util = require('../utils/util');
var moment = require('moment');
var appConfig = require('../../../config/config.js');

router.get('/getentityrelation', function(req, res) {

    var data = [{
        Type: 'KEYWORD',
        Content: req.query.entityid
    }]
    var TaskFetch = [{
        TaskID: 0,
        FTaskID: -1,
        SpyTime: {
            Begin: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            End: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
        },
        Datas: data
    }]

    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '204',
        ModuleName:'关系探索',
        EventType: '3022',
        EventTypeDes: '关系探索',
        Detail: req.generalArgument.loginName + '在' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '提交关系探索',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    auditInfo.TaskFetch = TaskFetch;

    PersonRelationExploreApi(req).exploreEntityRelation({
        'srcEntityType': Util.toInt(req.query.srcentitytype),
        'srcEntityId': req.query.srcentityid,
        'dstEntityType': Util.toInt(req.query.dstentitytype),
        'dstEntityId': req.query.dstentityid,
        'AuditInfo': auditInfo
    }, res.endj);
});

router.post('/getpersonrelation', function(req, res) {
    PersonRelationExploreApi(req).generatePersonRelation({
        'nodes': JSON.parse(req.query.nodes)
    }, res.endj);
})

router.get('/getcomparedocument', function(req, res) {
    PersonRelationExploreApi(req).comparePersonDocument({
        'srcEntityType': Util.toInt(req.query.srcentitytype),
        'srcEntityId': req.query.srcentityid,
        'dstEntityType': Util.toInt(req.query.dstentitytype),
        'dstEntityId': req.query.dstentityid,
        'maxNum': Util.toInt(req.query.maxnum)
    }, res.endj);
});

router.get('/analyzeMultiEntitiesRelation', function (req, res) {
    PersonRelationExploreApi(req).analyzeMultiEntitiesRelation({
        'analysisType': 10006,
        'filterTypeList': req.query.filterTypeList,
        "findContactsLevel":req.query.contactLevel,
        'nodes': req.query.nodes,
        'startTime': req.query.startTime,
        'endTime': req.query.endTime
    }, res.endj);
});

router.get('/analysisData', function (req, res) {
    PersonRelationExploreApi(req).analyzeEntityRelation({
        'analysisType': 10001,
        'srcEntityType': req.query.entityType,
        'srcEntityId': req.query.entityId,
        'startTime': req.query.startTime,
        'endTime': req.query.endTime
    }, res.endj);
});

router.get('/getRelationMetaData', function (req, res) {
    PersonRelationExploreApi(req).getRelationMetaData({}, res.endj);
});

module.exports = router;
