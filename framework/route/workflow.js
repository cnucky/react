var router = require('express').Router();
var wfApi = require('../jws/workflowmanager');
var Util = require('../utils/util');
var _ = require('underscore');
var fs = require("fs");
var Datauri = require('datauri');
var datauri = new Datauri();


router.get('/startProcess', function(req, res) {
    wfApi(req).startProcess(req.query, res.endj);
});
router.get('/GetFirstAssignees', function(req, res) {
    var data = {
        strBusinessType: req.query.type,
    };
    wfApi(req).GetFirstAssignees(data, res.endj);
});
router.get('/GetIssuesTypeList', function(req, res) {
    var data = req.query.items;
    wfApi(req).GetIssuesTypeList(data, res.endj);
});
router.get('/GetRuntimeDiagram', function(req, res) {
    var data = {
        strBusinessType: req.query.strBusinessType,
    };
    if (!_.isUndefined(req.query.strBusinessID))
        data.strBusinessID = req.query.strBusinessID;
    if (!_.isUndefined(req.query.strProcessInsID))
        data.strProcessInsID = Util.toInt(req.query.strProcessInsID);
    wfApi(req).GetRuntimeDiagram(data, function(data) {
        if(data.code != 0)
            res.endj(data);
        else{
        datauri.format(".png", new Buffer(data.data.imageSequence));
        data.data.png = datauri.content;
        res.endj(data);
        }
    });
});
router.get("/getIssuesListByType", function(req, res) {
    var data = {
        taskType: req.query.type,
        startPos: Util.toInt(req.query.start),
        count: Util.toInt(req.query.length),
        queryType: Util.toInt(req.query.queryType)
    };
    wfApi(req).GetIssuesListByType(data, res.endj);
});

router.get("/getIssueslistById", function(req, res) {
    var data = {
        Ids: req.query.Ids,
        startPos: Util.toInt(req.query.start),
        count: Util.toInt(req.query.length),
        queryType: Util.toInt(req.query.queryType)
    }
    wfApi(req).GetIssuesListByID(data, res.endj);
})
router.get("/getToDoIssuesByUserId", function(req, res) {
    var data = {
        startPos: Util.toInt(req.query.startPos),
        count: Util.toInt(req.query.count)
    }
    wfApi(req).GetToDoIssuesByUserId(data, res.endj);
})
router.get("/GetActInfo", function(req, res) {
    var data = {
        strBusinessType: req.query.strBusinessType,
    };
    if (!_.isUndefined(req.query.strBusinessID))
        data.strBusinessID = req.query.strBusinessID;
    if (!_.isUndefined(req.query.strProcessInsID))
        data.strProcessInsID = Util.toInt(req.query.strProcessInsID);
    wfApi(req).GetActInfo(data, res.endj);
});

router.post('/deleteHisTask', function(req, res) {
    var data = req.query.strTaskIDs;
    wfApi(req).DeleteHisTask(data, res.endj);
});

router.get("/getnextassigneesbyoperate", function(req, res) {
    var data = {
        strTaskID: req.query.strTaskID,
        strOperate: req.query.strOperate,
        strProcessType: req.query.strProcessType,
    };
    wfApi(req).GetNextAssigneesByOperate(data, res.endj);
});

router.post("/completepersonaltask", function(req, res) {
    var data = {
        strTaskID: req.query.strTaskID,
        strProcessInsID: req.query.strProcessInsID,
        strResult: req.query.strResult,
        strComment: req.query.strComment,
        tNextAssignee: req.query.tNextAssignee,
        tTaskVariables:req.query.tTaskVariables,
        strResultDesc: req.query.strResultDesc,
    };
    if (!_.isUndefined(req.query.tProcessVariables))
        data.tProcessVariables = req.query.tProcessVariables;
    if (!_.isUndefined(req.query.tTaskVariables))
        data.tTaskVariables = req.query.tTaskVariables;
    wfApi(req).CompletePersonalTask(data, res.endj);
});

router.get('/recalltask', function(req, res) {
    var data = {
        strProcessInsId: req.query.strProcessInsId,
        strTaskId: req.query.strTaskId,
        strActId: req.query.strActId
    };
    wfApi(req).RecallTask(data, res.endj);
});

router.get("/getTaskExtraInfo", function(req, res) {
    var data = [{
        strActId: req.query.strActId,
        strTaskId: req.query.strTaskId,
        strProcessInsId: req.query.strProcessInsId
    }]
    wfApi(req).getTaskExtraInfo(data, res.endj);
})
router.get("/FindProcessDefinitions", function(req, res) {
    var data = req.query.items;
    wfApi(req).FindProcessDefinitions(data, res.endj);
})

router.get("/FindProcessDefinitionInfo", function(req, res) {
    var data = {
        processId: req.query.processId
    };
    wfApi(req).FindProcessDefinitionInfo(data, res.endj);
})
router.post("/ActivateProcess", function(req, res) {
    var data = {
        processDefinitionId: req.query.processDefinitionId
    };
    wfApi(req).ActivateProcess(data, res.endj);
})
router.post("/SuspendedProcess", function(req, res) {
    var data = {
        processDefinitionId: req.query.processDefinitionId
    };
    wfApi(req).SuspendedProcess(data, res.endj);
})
router.post("/UpdateRelationInfo", function(req, res) {
    var data = {
        vCorrelationInfo: req.query.item
    };
    wfApi(req).UpdateRelationInfo(data, res.endj);
})
router.get("/getcustomcfg", function(req, res){
    wfApi(req).GetExtensionInfo(req.query, res.endj);
});
module.exports = router;