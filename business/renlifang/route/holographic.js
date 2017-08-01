var router = require('express').Router();
var soap = require('soap');
var PCApi = require('../jws/personcore');
var TCApi = require('../jws/taskcommon');
var HGApi = require('../jws/holographic');
var TAGApi = require('../jws/tag');
var Util = require('../utils/util');
var _ = require('underscore');
var moment = require('moment');
var Q = require('q');
var logger = require('../../../utils/routeLogger').logger('personcore');
var appConfig = require('../../../config/config.js');
var config = require('../config');

router.get('/getEvent', function(req, res) {
    HGApi(req).getObjectEvent({
        'entityid': req.query.entityid,
        'entitytype': req.query.entitytype
    }, res.endj);
});

router.get('/getOrganize', function(req, res) {
    HGApi(req).getObjectOrg({
        'entityid': req.query.entityid,
        'entitytype': req.query.entitytype
    }, res.endj);
});

router.get('/getorganizeMember', function(req, res) {
    HGApi(req).getOrgObj({
        'orgId': req.query.orgId,
        'type': req.query.type
    }, res.endj);
});

router.get('/getInfo', function(req, res) {
    HGApi(req).getObjectInfo({
        'entityid': req.query.entityid,
        'entitytype': req.query.entitytype
    }, res.endj);
});

router.get('/getAdd', function(req, res) {
    HGApi(req).getObjectAddresses({
        'entityid': req.query.entityid,
        'entitytype': req.query.entitytype
    }, res.endj);
});

router.get('/getAcc', function(req, res) {
    HGApi(req).getObjectAccounts({
        'entityid': req.query.entityid,
        'entitytype': req.query.entitytype
    }, res.endj);
});

router.get('/geteventMember', function(req, res) {
    HGApi(req).getEventObj({
        'eventId': req.query.eventId,
        'type': req.query.type
    }, res.endj);
});






module.exports = router;