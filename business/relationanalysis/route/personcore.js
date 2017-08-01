var router = require('express').Router();
var soap = require('soap');
var PCApi = require('../jws/personcore');
var TCApi = require('../jws/taskcommon');
var TAGApi = require('../jws/tag');
var Util = require('../utils/util');
var _ = require('underscore');
var moment = require('moment');
var Q = require('q');
var logger = require('../../../utils/routeLogger').logger('personcore');
var appConfig = require('../../../config/config.js');
var config = require('../config');

router.get('/getpersoncoreurl', function(req, res) {
    TCApi(req).getTaskDetailByTaskId({
        taskId: Util.toInt(req.query.taskId)
    }).then(function(rsp) {
        if (rsp.data) {
            var cond = rsp.data;
            if (cond.type == 'accurate') {
                var entityId = new Buffer(cond.entityId).toString('base64');
                var entityType = new Buffer('' + cond.entityType).toString('base64');
                res.endj({
                    code: 0,
                    data: '/renlifang/profile.html?entityid=' + entityId + '&entitytype=' + entityType
                });
            } else if (cond.type == 'blur') {
                TAGApi(req).submitPersonSearch({
                    keyword: cond.entityId,
                }).then(function(rsp1) {
                    if (rsp1.data) {
                        res.endj({
                            code: 0,
                            data: '/renlifang/index.html?entityid=' + cond.entityId + '&taskid=' + rsp1.data.taskId
                        });
                    }else{
                        res.endj({
                            code: 3
                        });
                    }
                });
            } else if(cond.type == 'photo'){
                res.endj({
                    code: 0,
                    data: '/renlifang/index.html?faceRecogTaskId=' + cond.taskId
                });
            }
        }
    }).catch(res.endj);
});

router.get('/submitpersoncoretask', function(req, res) {
    var data = {
        "name": req.query.name,
        "mode": 3,
        "taskType": 112,
        "priority": 3,
        "taskDetail": req.query.taskDetail
    };

    if (req.query.dirId != undefined) {
        data["dirId"] = Util.toInt(req.query.dirId);
    };

    TCApi(req).submitTask(data, res.endj);
});

router.get('/checkentityexist', function(req, res) {
    PCApi(req).checkEntityExist({
        'entityId': req.query.entityId,
        'entityType': Util.toInt(req.query.entityType)
    }, res.endj)
});

router.get('/batchGetPersonPhoto', function(req, res) {
    var List = JSON.parse(req.query.idList);
    PCApi(req).batchGetPersonPhoto({
        idList: List.queryList
    }).then(function(rsp) {
        var bitmap = new Buffer(rsp.data.photos[0], 'base64');
        res.setHeader('ContentType', 'image/jpg');
        res.end(bitmap);
    }).catch(res.endj); //TODO 错误图片
})

router.get('/getpersonphoto', function(req, res) {
    PCApi(req).getPersonPhoto({
        'identityId': req.query.identityid,
        'type': req.query.type ? req.query.type : 1
    }).then(function(rsp) {
        var bitmap = new Buffer(rsp.data, 'base64');
        res.setHeader('ContentType', 'image/jpg');
        res.end(bitmap);
    }).catch(res.endj); //TODO 错误图片
});

router.get('/getpersondetail', function(req, res) {
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
        ModuleID: '201',
        ModuleName: '人立方',
        EventType: '3017',
        EventTypeDes: '人立方',
        Detail: req.generalArgument.loginName + '在' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '提交人立方查询',
        Result: '0'
    }


    var auditInfo = {}
    auditInfo.Common = common;
    auditInfo.TaskFetch = TaskFetch;

    PCApi(req).getPersonDetail({
        'entityId': req.query.entityid,
        'entityType': Util.toInt(req.query.entitytype, 0),
        'AuditInfo': auditInfo
    }, res.endj);
});


router.get('/getpcpropertysource', function(req, res) {
    PCApi(req).getPCPropertySource({
        'key': req.query.key,
        'value': req.query.value,
        'source': req.query.source
    }, res.endj);
});


router.get('/getpcqueryresult', function(req, res) {
    PCApi(req).getPCQueryResult({
        'entityId': req.query.entityid,
        'entityType': Util.toInt(req.query.entitytype),
        'startIndex': Util.toInt(req.query.startindex),
        'length': Util.toInt(req.query.length)
    }, res.endj);
});

router.get('/getpartner', function(req, res) {
    console.log("passport:" + req.query.passport);
    PCApi(req).getPartner({
        'passport': req.query.passport,
        'cert': req.query.cert,
        'start': req.query.start,
        'end': req.query.end,
        'frequency': req.query.frequency,
        'type': Util.toInt(req.query.type),
        'recordnum': 50
    }, res.endj);
});

router.get('/getpartnerdetail', function(req, res) {
    PCApi(req).getPartnerDetail({
        id: req.query.id
    }, res.endj);
});

router.get('/getqq', function(req, res) {
    PCApi(req).getQQ({
        qq: req.query.qq
    }).then(function(rsp) {
        var processContact = function(contact) {
            _.each(contact, function(item) {
                item.title = item.name;
                item.folder = (_.size(item.friends) > 0);
                item.children = _.map(item.friends, function(friendItem) {
                    friendItem.title = friendItem.nick + " (" + friendItem.qq + ")";
                    friendItem.extraClasses = 'nv-qq-people';
                    return friendItem;
                });
            });
            return contact;
        };
        var processGroup = function(groups) {
            _.each(groups, function(item) {
                item.title = item.name;
                item.extraClasses = 'nv-group-item';
            });
            return groups;
        };
        var processQQ = function(qq) {
            var contact = {
                title: 'QQ好友',
                folder: true,
                extraClasses: 'nv-qq-contact',
                children: processContact(qq.friendGroups)
            };
            var groups = {
                title: 'QQ群',
                folder: true,
                extraClasses: 'nv-groups',
                children: processGroup(qq.groups)
            };
            qq.folder = true;
            qq.title = qq.qq;
            qq.extraClasses = 'nv-qq';
            qq.children = [contact, groups];
        };
        _.each(rsp.data, function(item) {
            processQQ(item);
        });
        res.endj({
            code: 0,
            data: rsp.data
        });
    }).catch(res.endj);
});

router.get('/getqqgroup', function(req, res) {
    PCApi(req).getQQGroup({
        number: req.query.number
    }, res.endj);
});

router.get('/getbehaviordir', function(req, res) {
    PCApi(req).getBehaviorDir({

    }, res.endj);
});

router.get('/querybehaviordata', function(req, res) {
    PCApi(req).queryBehaviorData({
        'typeId': req.query.typeId,
        'cond': req.query.cond,
        'startDate': req.query.startDate,
        'endDate': req.query.endDate,
        'startIndex': Util.toInt(req.query.startIndex),
        'recordCount': Util.toInt(req.query.recordCount),
        'needMetaData': Util.toInt(req.query.needMetaData)
    }, res.endj);
});

router.get('/getbehaviordatameta', function(req, res) {
    PCApi(req).getBehaviorDataMeta({
        'typeId': req.query.typeId
    }, res.endj);
});

router.get('/submitpcquery', function(req, res) {
    PCApi(req).submitPCQuery({
        'mode': Util.toInt(req.query.mode),
        'simpleCond': req.query.simpleCond,
        'advancedCon': req.query.advancedCon
    }, res.endj);
});

router.get('/getqqtomobilelist', function(req, res) {
    var args = [];
    if (req.query.qqlist) {
        args.push({
            type: 11,
            value: req.query.qqlist
        });
    }
    if (req.query.mobilelist) {
        args.push({
            type: 5,
            value: req.query.mobilelist
        })
    }
    PCApi(req).getSocialRelation(args, res.endj);
});

router.get('/actioninfo', function(req, res) {
    PCApi(req).getPersonActionInfo({
        type: req.query.type, // 身份证
        value: req.query.value,
        passport: req.query.passport
    }).then(function(rsp) {
        var actionList = rsp.data.actionList || rsp.data;
        var topCityList = rsp.data.topCityList;
        var group = _.groupBy(actionList, function(item) {
            var time = moment(item.time);
            return time.format('YYYY年M月');
        });
        if (_.size(group) > 2) {
            var out = [];
            _.each(group, function(item, key) {
                out.push({
                    date: key,
                    action: item
                });
            });
            res.endj({
                code: 0,
                data: {
                    group: true,
                    actions: out,
                    topCityList: topCityList
                }
            });
        } else {
            res.endj({
                code: 0,
                data: {
                    group: false,
                    actions: actionList,
                    topCityList: topCityList
                }
            });
        }
    }).catch(res.endj);
});

router.get('/getpersontags', function(req, res) {
    PCApi(req).getPersonTags({
        'id': req.query.id
    }, res.endj);
});

router.get('/generatedoc', function(req, res) {
    PCApi(req).generateDoc({
        'entityId': req.query.entityid,
        'entityType': Util.toInt(req.query.entitytype, 0)
    }, res.endj);
});

router.get('/gethujiaddressrelation', function(req, res) {
    PCApi(req).getHujiAddressRelation({
        sfz: req.query.ids
    }, res.endj);
});

router.get('/getphonerelation', function(req, res) {
    PCApi(req).getPhoneRelation({
        phoneNumber: req.query.phoneNumber,
        startTime: req.query.startTime,
        endTime: req.query.endTime
    }, res.endj);
})

router.post('/checkfacequality', function(req, res) {
    PCApi(req).checkFaceQuality({
        picture_image_content_base64: req.query.picture_image_content_base64
    }, res.endj);
});

router.get('/getFaceRecogTaskID', function(req, res) {
    var repository_ids = [155];
    var retrieval = {
        face_image_id_str: req.query.face_image_id_str,
        repository_ids: repository_ids,
        threshold: 10,
    }
    var fields = ["person_id", "similarity"]
    var order = {
        similarity: -1,
    }
    var condition = {};
    PCApi(req).getFaceRecogTaskID({
        retrieval: retrieval,
        fields: fields,
        condition: condition,
        order: order,
        start: 0,
        limit: 20
    }, res.endj);
});

router.get('/getFaceRecogResult', function(req, res) {
    PCApi(req).getFaceRecogResult({
        face_recog_result_task_id: req.query.faceRecogTaskId
    }).then(function(rsp) {
        var results = eval("(" + rsp.data.results + ")");
        var params = [];
        _.each(results, function(item) {
            if (!_.isEmpty(item.person_id)){
                var person_id = item.person_id.split("_");
                params.push({
                    id: person_id[0],
                    typeId: person_id[1],
                    similarity: item.similarity.toFixed(2) + "%"
                })
            }
        });
        res.endj({
            code: 0,
            data: {
                //WEB Service那头是pic_base64
                picBase64: rsp.data.picBase64,
                params: params
            }
        });
    }).catch(res.endj);
});

router.get('/batchGetPersonSummary', function(req, res) {
    PCApi(req).batchGetPersonSummary({
        params: req.query.params
    }, res.endj);
})

router.get('/getSystemConfig',function(req,res){
    var value = config[req.query.key];
    res.endj({
        code: 0,
        data : {
            value: value
        }
    })
})

module.exports = router;