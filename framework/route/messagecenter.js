var router = require('express').Router();
var soap = require('soap');
var MCApi = require('../jws/messagecenter');
var UMSApi = require('../jws/ums');
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');
var moment = require('moment');
var appConfig = require('../config.js');

router.post('/getMessage', function(req, res) {
    var args = {
        'position': Util.toInt(req.query.start),
        'size': Util.toInt(req.query.length),
        'startTime': req.query.startTime,
        'endTime': req.query.endTime,
        'keyword': req.query.keyword,
        'type': req.query.type || [],
        'isRead': Util.toInt(req.query.isRead),
        'label': req.query.label || [],
        'module': req.query.module || [],
    };
    MCApi(req).getMessage(args).then(function(rsp) {
        var recordsTotal, recordsFiltered;
        if (rsp.code == 0 || rsp.code == null) {
            recordsTotal = rsp.data.totalCount || 0;
            recordsFiltered = rsp.data.totalCount || 0;
        }
        res.endj({
            code: rsp.code,
            data: rsp.data.batchMsgItems,
            message: rsp.message,
            recordsTotal: recordsTotal,
            recordsFiltered: recordsFiltered,
            draw: Util.toInt(req.query.draw),
        });
    });

});

router.post('/getMessageStat', function(req, res) {
    MCApi(req).getMessageStat({
        'startTime': req.query.startTime,
        'endTime': req.query.endTime,
        'keyword': req.query.keyWord
    }, res.endj);

});

router.post('/deleteMsgs', function(req, res) {
    MCApi(req).deleteMessage({
        'ids': req.query.ids
    }, res.endj);

});

router.get('/setMsgIsRead', function(req, res) {
    MCApi(req).setMessageReadState({
        'ids': req.query.ids,
        'isRead': Util.toInt(req.query.isRead)
    }, res.endj);
});

router.post('/setMsgLabel', function(req, res) {
    MCApi(req).setMessageLabel({
        'ids': req.query.ids,
        'labelValue': req.query.labelValue
    }, res.endj);
});

router.post('/getMessageContent', function(req, res) {
    MCApi(req).getMessageContent({
        'ids': req.query.ids,
    }, res.endj);
});

router.post('/sendMessage', function(req, res) {
    var ids = [];
    var temp = req.query.receiverIds;
    _.map(temp, function(tempItem, index) {
        ids.push(parseInt(tempItem));
    })

    var data = {
        subject: req.query.subject,
        content: req.query.content,
        typeId: Util.toInt(req.query.typeId),
        moduleId: Util.toInt(req.query.moduleId),
        receiverIds: ids,
        receiveNames:req.query.receiveNames,
        isMerge: Util.toInt(req.query.isMerge),
        mergeId: req.query.mergeId,
        mergeValue: Util.toInt(req.query.mergeValue),
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '470',
        ModuleName:'公告管理',
        EventType: '7004',
        EventTypeDes: '发布公告',
        Detail: req.generalArgument.loginName + "在(" + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ")使用IP(" + req.generalArgument.ip + ")发送通知公告，主题为:" + (data.subject || '') + ",接收人为:" + (data.receiveNames || '') ,
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    MCApi(req).sendMessage(data, res.endj);
});

router.get('/getUserSendedNotice', function(req, res) {
    MCApi(req).getUserSendedNotice({

    }, res.endj);
});

router.get('/getUserSendedNoticeDetail', function(req, res) {
    MCApi(req).getUserSendedNoticeDetail({
        ids: req.query.ids
    }).then(function(rsp) {
        var noticeDetail = rsp.data;
        var tempData = noticeDetail[0].receivers;
        
        UMSApi(req).getAllUserIdName().then(function(rsp2) {
            var userIdName = rsp2.data;
            noticeDetail[0].receivers = [];
            _.each(tempData,function(id){
                var user = _.find(userIdName,function(userInfo){
                    return userInfo.userId == id;
                })
                if(user){
                    noticeDetail[0].receivers.push(user.userName);
                }
            })
            res.endj({
                code: rsp.code,
                data: noticeDetail,
                message: rsp.message,
            });
        }).catch(function() {
            res.endj({
                code: 1,
                data: [],
                message: "根据userId获取用户名失败"
            });
        });
    }).catch(res.endj);
});

router.get('/deleteNotice', function(req, res) {
    var data = {
        ids: req.query.ids
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '470',
        ModuleName:'公告管理',
        EventType: '7005',
        EventTypeDes: '删除公告',
        Detail: req.generalArgument.loginName + "在(" + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ")使用IP(" + req.generalArgument.ip + ")执行删除公告操作"  ,
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    MCApi(req).deleteNotice(data, res.endj);

});

module.exports = router;