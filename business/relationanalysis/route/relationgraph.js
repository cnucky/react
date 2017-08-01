var router = require('express').Router();
var soap = require('soap');
var RGApi = require('../jws/relationgraph');
var Util = require('../utils/util');
var _ = require('underscore');
var moment = require('moment');
var appConfig = require('../../../config/config.js');

router.get('/getallnodetype', function(req, res) {
    RGApi(req).getAllNodeType({}, res.endj);
});

router.get('/getallnodeextendmenu', function(req, res) {
    RGApi(req).getAllNodeExtendMenu({}, res.endj);
});

router.get('/getallnodetypeinfo', function(req, res) {
    RGApi(req).getAllNodeType()
        .then(function(rsp) {
            var nodeTypes = rsp.data;
            RGApi(req).getAllNodeExtendMenu()
                .then(function(rsp2) {
                    var menuData = {};
                    _.each(rsp2.data, function(item) {
                        menuData['' + item.nodeType] = item.menu;
                    });
                    _.each(nodeTypes, function(type) {
                        type.menu = menuData['' + type.type];
                    });
                    return {
                        code: 0,
                        data: nodeTypes
                    };
                })
                .then(res.endj);
        })
        .catch(res.endj);
});


router.get('/querynode', function(req, res) {
    var data = [{
        Type: 'KEYWORD',
        Content: req.query.keyword
    }]
     var TaskFetch = [
        {
            TaskID: 0,
            FTaskID: -1,
            SpyTime: {
                Begin: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                End: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            },
            Datas: data
        }
    ]
   
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime:moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '202',
        ModuleName:'关系图谱',
        EventType: '3018',
        EventTypeDes: '关系图谱',
        Detail: req.generalArgument.loginName + '在' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '提交关系图谱查询',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    auditInfo.TaskFetch = TaskFetch;
    RGApi(req).queryNode({
        keyword: req.query.keyword,
        nodeType: Util.toInt(req.query.type),
        AuditInfo: auditInfo
    }, res.endj);
});

router.get('/nodeexpand', function(req, res) {
    if (req.query.expandtype == 0 || req.query.expandtype == 1) {
        RGApi(req).nodeExpandAll({
            nodeId: req.query.id,
            nodeType: Util.toInt(req.query.type),
            keyword: req.query.keyword,
            expandType: Util.toInt(req.query.expandtype),
            filter: req.query.filter || ""
        }, res.endj);
    } else {
        RGApi(req).nodeExpand({
            nodeId: req.query.id,
            nodeType: Util.toInt(req.query.type),
            keyword: req.query.keyword,
            targetType: Util.toInt(req.query.targettype),
            linkType: Util.toInt(req.query.linktype),
            filter: req.query.filter || ""
        }, res.endj);
    }
});

router.get('/queryEdge', function(req, res) {
    RGApi(req).getLinkDetail({
        id: req.query.id,
        needMeta: 1,
        startPos:1,
        pageSize:1000,
        srcNodeId: req.query.snodeid,
        srcNodeType: Util.toInt(req.query.snodetype),
        srcKeyProperty: req.query.snodekeyproperty,
        destNodeId: req.query.dnodeid,
        destNodeType: Util.toInt(req.query.dnodetype),
        destKeyProperty: req.query.dnodekeyproperty
    }, res.endj);
});

router.get('/getNodeDetail', function(req, res) {
    RGApi(req).getNodeDetail({
        nodes: req.query.nodes
    }, res.endj);
});

router.post('/createtask', function(req, res) {
    RGApi(req).createGraphAnalysis({
        dirId: 123,
        title: req.query.title,
        remark: req.query.remark || ''
    }, res.endj);
});

router.get('/tasklist', function(req, res) {
    RGApi(req).getGATaskList(res.endj);
});

router.post('/savesnapshot', function(req, res) {
    function save(taskid) {
        RGApi(req).saveSnapshot({
                analysisId: taskid,
                title: req.query.title,
                graph: req.query.graph,
                remark: req.query.remark,
                data: req.query.image,
                autoSave: Util.toInt(req.query.autosave, 1)
            })
            .then(function(rsp) {
                res.endj({
                    code: 0,
                    data: {
                        taskid: taskid,
                        taskname: req.query.taskname
                    }
                });
            })
            .catch(res.endj);
    }

    var taskid = Util.toInt(req.query.taskid, 0);
    if (taskid == 0) { // create task
        RGApi(req).createGraphAnalysis({
                dirId: req.query.dirid,
                title: req.query.taskname,
                remark: '',
            })
            .then(function(rsp) {
                taskid = rsp.data;
                save(taskid);
            })
            .catch(res.endj);
    } else {
        save(taskid);
    }

});

router.get('/snapshotlist', function(req, res) {
    RGApi(req).getSnapshotList({
        analysisId: req.query.taskid,
        startPos: Util.toInt(req.query.start),
        pageSize: 20,
        snapshotType: Util.toInt(req.query.autosave, 2)
    }, res.endj);
});

router.post('/deletesnapshot', function(req, res) {
    RGApi(req).deleteSnapshot({
        analysisId: req.query.taskid,
        taskType: 108,
        snapshotId: req.query.snapshotid,
        title: req.query.title
    }, res.endj);
});

router.post('/updatesnapshot', function(req, res) {
    RGApi(req).editSnapshot({
        analysisId: req.query.taskid,
        taskType: 108,
        snapshotId: req.query.snapshotid,
        title: req.query.title,
        remark: req.query.remark
    }, res.endj);
});

module.exports = router;
