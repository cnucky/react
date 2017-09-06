var router = require('express').Router();
var _ = require('underscore');
var RegularApi = require('../jws/tactics');
var Util = require('../utils/util');
var Q = require('q');
var moment = require('moment');
var appConfig = require('../config.js');

router.get('/getTacticsFavorByUser', function(req, res) {
    RegularApi(req).getTacticsFavorByUser(res.endj);
})
router.get('/getTacticsTypes', function(req, res) {
    RegularApi(req).getTacticsTypes(res.endj);
})
router.get('/getTactics', function(req, res) {
    RegularApi(req).getTactics(res.endj);
})
router.get('/getTacticsByTypeId', function(req, res) {
    RegularApi(req).getTactics({
       marketTypeIds: req.query.marketTypeIds
    }, res.endj);
})
router.post('/addTacticsFavor', function(req, res) {
    RegularApi(req).addTacticsFavor({
        solidId: req.query.solidId,
        caption: req.query.caption,
    }, res.endj);
})
router.post('/deleteTacticsFavor', function(req, res) {
    RegularApi(req).deleteTacticsFavor({
        solidId: req.query.solidId,
    }, res.endj);
})

/*router.get('/getTaskListBySchemeId', function(req, res) {
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
*/

module.exports = router;


