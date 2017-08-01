var router = require('express').Router();
var soap = require('soap');
var PCApi = require('../jws/personcore');
var TCApi = require('../jws/taskcommon');
var PICApi = require('../jws/picrecogcore');
var TAGApi = require('../jws/tag');
var BCApi = require('../jws/businessCommon');
var HGApi = require('../jws/holographic');
var businessLib = require('../jws/businesslib');
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
                    keyword: cond.entityId
                }).then(function(rsp1) {
                    if (rsp1.data) {
                        res.endj({
                            code: 0,
                            data: '/renlifang/index.html?entityid=' + cond.entityId + '&taskid=' + rsp1.data.taskId
                        });
                    } else {
                        res.endj({
                            code: 3
                        });
                    }
                });
            } else if (cond.type == 'photo') {
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
    
    // var entityType = Util.toInt(req.query.entityType)
    // if (entityType == 1 || entityType == 2) {
    //     res.endj({
    //         code: 0,
    //         data: 1
    //     })
    // } else {
    //     PCApi(req).checkEntityExist({
    //         'entityId': req.query.entityId,
    //         'entityType': Util.toInt(req.query.entityType)
    //     }, res.endj)
    // }

});

router.get('/batchGetPersonPhoto', function(req, res) {
    var List = JSON.parse(req.query.idList);
    // PCApi(req).batchGetPersonPhoto({
    //     idList: List.queryList
    // }).then(function(rsp) {
    //     var bitmap = new Buffer(rsp.data.photos[0], 'base64');
    //     res.setHeader('ContentType', 'image/jpg');
    //     res.end(bitmap);
    // }).catch(res.endj); //TODO 错误图片
    PCApi(req).batchGetPersonPhoto({
        idList: List.queryList
    }, res.endj)
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
    }).then(function(rsp) {
        //数据来源tooltip去重去空逻辑
        if (rsp.code == 0) {
            var summary = rsp.data.summary;
            var info = rsp.data.information;
            _.each(summary, function(s) {
                _.each(s.valueList, function(v) {
                    v.source = _.reject(v.source, function(sv) {
                        return sv.name == '';
                    })
                    v.source = _.uniq(v.source, function(sv) {
                        return sv.name
                    });
                })
            })

            _.each(info, function(i) {
                _.each(i.children, function(ic) {
                    _.each(ic.properties, function(p) {
                        _.each(p.valueList, function(v) {
                            v.source = _.reject(v.source, function(sv) {
                                return sv.name == '';
                            })
                            v.source = _.uniq(v.source, function(sv) {
                                return sv.name
                            });
                        })
                    })
                })
            })

        }
        res.endj({
            code: rsp.code,
            data: rsp.data,
            message: rsp.data
        });

    }).catch(res.endj);
    // res.endj(staticData)

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

router.post('/checkFaceQuality', function(req, res) {
    var options = {max_faces_allowed:-1};

    PICApi(req).checkFaceQuality({
        picture_image_content_base64: req.query.picture_image_content_base64,
        'options':options
    }, res.endj);
});

//获取所有人像库
router.get('/getFaceRepository', function(req, res) {
    PICApi(req).getFaceRepository({
        'type':'all'
    }, res.endj)
});

//获取人立方人像库
router.get('/getRlfFaceRepository', function(req, res) {
    PICApi(req).getFaceRepository({
        'type':'renlifang'
    }, res.endj)
});

router.get('/getFaceRecogTaskID', function(req, res) {
    var repository_ids_str = req.query.repository_ids;
    var face_image_id_str = req.query.face_image_id_str;
    var face_image_uri = req.query.face_image_uri;

    //将stirng数组转换成int数组

    var repository_ids_int = [];
    repository_ids_int = repository_ids_str.map(
        function (data) {
            return +data;
        }
    );

    PICApi(req).getFaceRecogTaskID({
        repository_ids_int: repository_ids_int,
        face_image_id_str: face_image_id_str,
        face_image_uri:face_image_uri
    }, res.endj);
});


//查询结果提供给五所
router.get('/getFaceRecogResult', function(req, res) {
    PICApi(req).getFaceRecogResult({
        face_recog_result_task_id: req.query.faceRecogTaskId
    }).then(function(rsp) {
        var results = eval("(" + rsp.data.results + ")");
        var params = _.map(results, function(item) {
            var person_id = item.person_id.split("_");
            return {
                id: person_id[0],
                typeId: person_id[1],
                similarity: item.similarity.toFixed(2) + "%"
            }
        });
        res.endj({
            code: 0,
            data: {
                //WEB Service那头是pic_base64
                picBase64: rsp.data.tp_face_image_uri,
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

router.get('/getExternalInfo', function(req, res) {
    var data = {
        "entityId": req.query.entityId,
        "entityType": req.query.entityType,
        "queryType": req.query.queryType
    }


    PCApi(req).getExternalInfo(data, res.endj);
});

router.get('/getpersonprofile', function(req, res) {
    var value = {}

    HGApi(req).getObjectAddresses({
        'entityid': req.query.entityid,
        'entitytype': req.query.entitytype
    }).then(function(addRsp) {

        value.address = addRsp.data.address;

        HGApi(req).getObjectAccounts({
            'entityid': req.query.entityid,
            'entitytype': req.query.entitytype
        }).then(function(accRsp) {

            value.keyValueMap = accRsp.data.keyValueMap;

            HGApi(req).getObjectInfo({
                'entityid': req.query.entityid,
                'entitytype': req.query.entitytype
            }).then(function(infoRsp) {


                _.each(infoRsp.data.summary , (item , key)=>{
                    var value = {};
                    _.each(item.valueList , (list)=>{
                        value.value = list;
                    })
                    item.valueList.splice(0 ,item.valueList.length);
                    item.valueList.push(value)
                })


                value.summary = [
                    {
                        groupName: "概要信息",
                        type:'newData',
                        children : infoRsp.data.summary
                    }
                ]

                _.each(infoRsp.data.information , (item)=>{

                    value.summary.push(item)
                })

                requestPersonDetail(req, res, value);
            })
        })
    }).catch(function() {
        requestPersonDetail(req, res);
    });
});

router.get('/getSpyObjUrlByNumber', function(req, res) {
    var data = {
        "entityid": req.query.entityid,
        "entitytype": req.query.entitytype,
    }
    BCApi(req).getSpyObjUrlByNumber(data, res.endj);
});

function requestPersonDetail(req, res, extraData) {
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


    var auditInfo = {};
    auditInfo.Common = common;
    auditInfo.TaskFetch = TaskFetch;



    PCApi(req).getPersonDetail({
        'entityId': req.query.entityid,
        'entityType': Util.toInt(req.query.entitytype, 0),
        'AuditInfo': auditInfo
    }).then(function (rsp) {

        var result = rsp.data;

        result.summary = [
            {
                groupName: "概要信息",
                children : rsp.data.summary
            }
        ];

        if(!_.isEmpty(extraData.address)){
            _.extend(result, {address:extraData.address})
        }

        if(!_.isEmpty(extraData.keyValueMap)){
            _.extend(result, {keyValueMap:extraData.keyValueMap})
        }

        if(!_.isEmpty(extraData.summary[0].children)){
            _.extend(result, {summary:extraData.summary})
        }

        //result.summary.push({
        //    groupName: "附件信息",
        //    children : rsp.data.attachment
        //});

        res.endj({
            code: 0,
            data: result
        });
    }).catch(res.endj);



}

router.get('/getFamilyInfo', function(req, res) {
    PCApi(req).getHouseHoldMemberGroups({
        params:req.query.cert
    }, res.endj);
});


router.get('/showPhoto', function(req, res) {

    businessLib(req).downloadPhoto({
        fileId: req.query.fileId
    }, res.endj);
});

router.get('/getNewMap', function(req, res) {
    PCApi(req).getNewKeyMap({
        valueKey:req.query.valueKey
    }, res.endj);
});

router.get('/getAttachment', function(req, res) {
    PCApi(req).getAttachment({
        fileName:req.query.fileName,
        fileType:req.query.fileType,
        option:req.query.option || {}
    }, res.endj);
});

module.exports = router;