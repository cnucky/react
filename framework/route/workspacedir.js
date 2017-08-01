var router = require('express').Router();
var soap = require('soap');
var path = require('path');
var WSDApi = require('../jws/directory');
var WFApi = require('../jws/workflowmanager');
var WAApi = require('../jws/workarea');
var TMApi = require('../jws/taskService');
var UMSApi = require('../jws/ums');
var URSApi = require('../jws/role');
var Util = require('../utils/util');
var UdpFileApi = require('../jws/udpFileService');
var _ = require('underscore');
var Q = require('q');
var moment = require('moment');
var sysConfig = require('../../utils/config-system.js');
var appConfig = require('../../config/config.js');
 // var configmgr = require('../../public/widget/configmgr/src/configmgr');
var CommonConfig = require(path.join(process.cwd(), './framework/utils/common-config.js'));

router.get('/reApprovalTask', function(req, res) {
    var param = {
        taskId: Util.toInt(req.query.taskId)
    };
    TMApi(req).recheckTask(param).then(function(rsp) {
        res.endj(rsp);
    }).catch(res.endj)
});

router.get('/getdir', function(req, res) {
    var data = {
        'dirType': 2,
        'dirId': Util.toInt(req.query.dirId),
        'queryType': 0
    };
    WSDApi(req).queryDir(data).then(function(rsp) {
        if (rsp.data) {
            res.endj({
                code: 0,
                data: rsp.data[0]
            });
        }else{
            res.endj({
                code: 3
            });
        }
    }).catch(res.endj);
});

router.get('/getDatacenterDir',function(req, res){
    // configmgr.getDataCenters(function (result) {
    CommonConfig.getDataCenters(req, function(result){
        var translate_map = {'datacenter':{},'datasystem':{}};
            _.each(result.DATA_AREA_GROUP, function(map){
                _.each(map.DATA_AREA,function(dic){
                    translate_map['datacenter'][String(dic.CODE[0])] = dic.NAME[0];
                    _.each(dic.DATA_SYSTEM, function(item){
                        translate_map['datasystem'][String(item.CODE[0])] = item.NAME[0]
                    });
                });
            });
            _.each(result.DATA_AREA,function(dic){
                translate_map['datacenter'][String(dic.CODE[0])] = dic.NAME[0];
                _.each(dic.DATA_SYSTEM, function(item){
                    translate_map['datasystem'][String(item.CODE[0])] = item.NAME[0]
                });
            });
        res.endj(translate_map);
    });
});

router.get('/getApprovalData',function(req, res){
    //console.log(req);
    WFApi(req).GetBusinessState({
        data: req.query.data
    }).then(function(rsp){
        res.endj(rsp);
    }).catch(res.endj);
});

router.get('/list', function(req, res) {
    WAApi(req).getWorkAreaDir({
            dirId: -1,
            dirType: 1
        }).then(function(rsp) {
            // directory list -> tree 
            // console.log(i18n.store.data);
            var list = rsp.data;
            if(sysConfig.is_oversea()){
                list = _.filter(list,function(listInfo){
                    return listInfo.dirId != 1;
                })
            }
            _.each(list, function(directory) {
                directory['key'] = directory.id;
                directory['title'] = directory.name;
                directory['folder'] = true;
                directory['lazy'] = true;
            });
            rsp.data = list;
            res.endj(rsp);
        })
        .catch(res.endj);
});

router.get('/sublist', function(req, res) {
    WAApi(req).getWorkAreaDir({
            dirId: Util.toInt(req.query.dirId),
            dirType: Util.toInt(req.query.dirType)
        }).then(function(rsp) {
            // directory list -> tree 
            var list = rsp.data;
            _.each(list, function(directory) {
                directory['key'] = directory.id;
                directory['title'] = directory.name;
                directory['folder'] = true;
                directory['lazy'] = true;
            });
            res.endj(rsp);
        })
        .catch(res.endj);
});

router.get('/checkPermissions', function(req, res) {
    URSApi(req).checkPermissions({
        permissions: req.query.permissions
    }, function(rsp) {
        res.endj(rsp);
    });
});

router.get('/onelevel', function(req, res) {
    var data = {
        'dirId': Util.toInt(req.query.dirId),
        'dirType': Util.toInt(req.query.dirType),
        'shareFlag': Util.toInt(req.query.shareFlag),
        'path': req.query.path
    };
    WAApi(req).getResourceByDirId(data, function(rsp) {
        if(sysConfig.is_oversea()){
            var list = rsp.data;
            list = _.filter(list,function(listInfo){
                return listInfo.dirId != 1;
            })
            rsp.data = list;
            console.log(rsp.data);
        }

        res.endj(rsp);
    });
});

router.get('/getResourceByDirId', function(req, res) {
    var data = {
        'dirId': Util.toInt(req.query.dirId),
        'dirType': Util.toInt(req.query.dirType),
        'shareFlag': Util.toInt(req.query.shareFlag),
        'path': req.query.path
    };
    console.log("getResourceByDirId", data);
    WAApi(req).getResourceByDirId(data, function(rsp) {
        res.endj(rsp);
    });
});


router.get('/searchuser', function(req, res) {
    UMSApi(req).searchUsersByKeyword({
        queryWord: req.query.queryWord
    }, res.endj);
});

router.get('/shareinfo', function(req, res) {
    WAApi(req).getShareResourceInfo({
        resourceType: req.query.resourceType,
        resourceId: req.query.resourceId
    }, res.endj);
});


router.get('/selectusers', function(req, res) {
    var shareUserList = req.query.shareUserList;
    var selectedUserIds = [];
    _.each(shareUserList, function(item, index) {
        selectedUserIds.push(Util.toInt(item.shareUserId));
    })
    var departmentPromise = UMSApi(req).getDepartments();
    var userPromise = UMSApi(req).getUsers();
    var profilePomise = UMSApi(req).getUserProfile();
    Q.all([departmentPromise, userPromise, profilePomise]).spread(function(depData, userData, userInfo) {
        var departments = depData.data;
        var idmap = {};

        _.each(departments, function(department) {
            idmap[department.departmentId] = department;
            department.key = 'dep-' + department.departmentId;
            department.lazy = false;
            department.folder = false;
        });
        var users = userData.data;
        var result = [];

        _.each(departments, function(department) {
            if (!idmap[department.parentDepartmentId]) {
                result.push(department);
            } else {
                var parent = idmap[department.parentDepartmentId];
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(department);
                    parent.folder = true;
                } else {
                    console.log(department.departmentName);
                }
            }
        });

        //check if user has workspace
        var userPara = [];
        _.each(users, function(user) {
            if (user.userId != userInfo.data.userId)
                userPara.push(user.userId);
        })
        URSApi(req).getHasRoleTypeUsers({
            user: userPara,
            roleType: 0
        }).then(function(rsp) {
            var newUsers = [];
            hasRoleUsers = rsp.data;
            _.each(users, function(user) {
                if (_.contains(hasRoleUsers, user.userId) && user.userId != -1)
                    newUsers.push(user);
            })

            _.each(newUsers, function(user) {
                user.key = 'user-'+ user.userId;
                user.title = user.loginName;
                user.userName = user.loginName;
                user.description = user.position;
                user.extraClasses = "nv-department-people";
                if (_.contains(selectedUserIds, user.userId)) {
                    user.selected = true;
                }
                var parent = idmap[user.departmentId];
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(user);
                    parent.folder = true;
                }
            });
            res.endj({
                code: 0,
                data: result
            });
        }).catch(res.endj);
    }).catch(res.endj);
})

router.post('/shareresource', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        resourceType: Util.toInt(req.query.resourceType) ,
        resourceId: Util.toInt(req.query.resourceId) ,
        resourceName: req.query.resourceName ,
        shareInfos: req.query.shareInfos || []
    };
    var shareNames = '';
    var index = 0;
    _.each(req.query.shareUserNames,function(name){
        if(index > 0)
            shareNames += ',';
        shareNames += name;
        index++;
    })
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '4',
        ModuleName:'工作区',
        EventType: '8008',
        EventTypeDes: '共享资源',
        Detail: req.generalArgument.loginName +req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') +  req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.workspace.label-executeshareoperation')  + req.i18n.t('base-frame.workspace.label-shareresource') + req.query.resourceName + req.i18n.t('base-frame.workspace.label-to') + shareNames + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;


    WAApi(req).shareResource(data, res.endj);
});

router.get('/fullpath', function(req, res) {
    var data = {
        'dirType': 2,
        'dirId': -1,
        'queryType': 2
    };
    var dirId = req.query.dirId;
    WSDApi(req).queryDir(data).then(function(rsp) {
        var list = rsp.data;
        var idmap = {};
        var result = [];
        _.each(list, function(directory) {
            idmap[directory.id] = directory;
        });

        var curDir = idmap[dirId];
        result.push(curDir);
        while (curDir.id != '-1') {
            curDir = idmap[curDir.parentId];
            result.push(curDir);
        }
        result.reverse();
        res.endj({
            code: 0,
            data: result
        });
    }).catch(res.endj);
});

router.post('/add', function(req, res) {
    var data = {
        'dirType': Util.toInt(req.query.dirType) ,
        'dirName': req.query.dirName ,
        'dirDesc': req.query.dirDesc ,
        'parentDirId': Util.toInt(req.query.parentDirId)
    };

    //edit by huangjingwei,add auditInfo
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '4',
        ModuleName:'工作区',
        EventType: '8001',
        EventTypeDes: '添加目录',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') +req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.workspace.label-adddir') + (data.dirName || '') + ')'+req.i18n.t('base-frame.workspace.label-desc')+'(' + (data.dirDesc || '') + req.i18n.t('base-frame.workspace.label-parentdir') + (data.parentDirId || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    WSDApi(req).addDir(data, res.endj);
});

router.post('/create', function(req, res) {
    WSDApi(req).createUserWorkZone();
});

//getContainingDir
router.get('/getContainingDir', function(req, res) {
    WAApi(req).getContainingDir({
        parentId: Util.toInt(req.query.parentId),
        parentDn: req.query.parentDn,
        parentDirType: Util.toInt(req.query.parentDirType)
    }, res.endj);
});


//移动文件
router.post('/moveDir', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        item: req.query.item ,
        destDirId: Util.toInt(req.query.destDirId) ,
        destDirName: req.query.destDirName ,
        tgt: req.query.tgt ,
        dirType: Util.toInt(req.query.dirType)
    };
    var index = 0;
    var resourceStr = '';
    _.each(req.query.item,function(item){
        if(index > 0)
            resourceStr += ',';
        resourceStr += item.name;
        index++;
    })
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '4',
        ModuleName:'工作区',
        EventType: '8005',
        EventTypeDes: '移动目录',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.workspace.label-movefileoperation') + resourceStr + req.i18n.t('base-frame.workspace.label-todir') + (data.destDirName || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    WAApi(req).moveDir(data, res.endj);
});

//删除文件
router.post('/deleteResource', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        item: req.query.item ,
        force: Util.toInt(req.query.force) ,
        tgt: req.query.tgt ,
        dirType: Util.toInt(req.query.dirType)
    };
    var index = 0;
    var resourceStr = '';
    _.each(req.query.item,function(item){
        if(index > 0)
            resourceStr += ',';
        resourceStr += item.name;
        index++;
    })
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '4',
        ModuleName:'工作区',
        EventType: '8007',
        EventTypeDes: '删除资源',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.workspace.label-deletefileoperation') + resourceStr +')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    WAApi(req).deleteResource(data, res.endj);
});

//重命名
router.post('/updateDir', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        id: Util.toInt(req.query.id) ,
        newName: req.query.newName ,
        oldName: req.query.oldName ,
        type: Util.toInt(req.query.type) ,
        desc: req.query.desc ,
        tgt: req.query.tgt ,
        force: Util.toInt(req.query.force) ,
        dirType: Util.toInt(req.query.dirType)
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '4',
        ModuleName:'工作区',
        EventType: '8006',
        EventTypeDes: '重命名',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.workspace.label-renamefileoperation') + (data.oldName || '') + req.i18n.t('base-frame.workspace.label-for') + (data.newName || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    WAApi(req).renameResource(data, res.endj);
});


router.get('/getAllResource', function(req, res) {
    var data = {
        'keyword': "",
        'dirId': -1,
        'type': Util.toInt(req.query.type)
    };
    WAApi(req).searchResource(data, function(rsp) {
        res.endj(rsp);
    });
});

router.get('/searchResource', function(req, res) {
    var data = {
        'keyword': req.query.keyword,
        'dirId': -1,
        'type': 0
    };
    WAApi(req).searchResource(data, function(rsp) {
        res.endj(rsp);
    });
});


router.get('/getReportUrl', function(req, res) {
    var data = {
        'type': Util.toInt(req.query.type),
        'path': req.query.path
    };
    WAApi(req).getReportUrl(data, function(rsp) {
        res.endj(rsp);
    });
});


router.post('/recordPreference', function(req, res) {
    var data = {
        name: req.query.name,
        detail: req.query.detail || []
    }
    WAApi(req).recordPreference(data, res.endj);
});

router.get('/queryPreference', function(req, res) {
    var data = {
        name: req.query.name
    }
    WAApi(req).queryPreference(data, function(rsp) {
        res.endj(rsp);
    });
})

router.get('/getFile',function(req,res){
    var data = req.query.resourceDetail;
    res.endj({
            code: 0,
            data: [{
                filename:"1.doc",
                filepath:"asdas"
            }]
        });
});

router.post('/batchDownload',function(req,res){
    var data = {
        returnName:req.query.returnName,
        fileInfo:req.query.fileInfo
    }
    UdpFileApi(req).batchDownloadFile(data,function(rsp) {
        res.endj(rsp);
    });
});

router.post('/getDocumentsInfo', function(req, res) {
    var data = {
        idList: req.query.idList || []
    }
    WAApi(req).getDocumentsInfo(data, res.endj);
});

module.exports = router;