var router = require('express').Router();
var soap = require('soap');
var UMSApi = require('../jws/ums');
var URSApi = require('../jws/role');
var Util = require('../utils/util');
var _ = require('underscore');
var moment = require('moment');
var appConfig = require('../config.js');

router.get('/list', function(req, res) {
    UMSApi(req).getMyGroups()
        .then(function(rsp) {
            UMSApi(req).getUsers().then(function(rsp2) {
                var groups = rsp.data;
                var users = rsp2.data;
                var idmap = {};
                _.each(groups, function(group) {
                    idmap[group.userGroupId] = group;
                    group.lazy = false;
                    group.folder = false;
                    group.extraClasses = "nv-group";
                });
                _.each(users, function(user) {
                    user.key = user.userId;
                    user.title = user.loginName;
                    user.userName = user.loginName;
                    user.description = user.position;
                    user.extraClasses = "nv-people";
                    _.each(user.userGroupIds, function(id) {
                        var parent = idmap[id];
                        if (parent) {
                            parent.children = parent.children || [];
                            parent.children.push(user);
                            parent.folder = true;
                        }
                    })
                });
                res.endj({
                    code: 0,
                    data: groups
                })
            })
        })
        .catch(function() {
            res.endj({
                code: -1,
                message: "API Internal error"
            })
        });
});

router.post('/add', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        userGroupName: req.query.name ,
        description: req.query.description ,
        parentUserGroupId: Util.toInt(req.query.pid, -1) 
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '402',
        ModuleName:'用户组管理',
        EventType: '1017',
        EventTypeDes: '新增用户组',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 新建用户组(' + (data.userGroupName || '')+ ')描述(' + (data.description || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).addUserGroup(data, res.endj);
});

router.get('/getGroupUsers', function(req, res) {
    var userList = req.query.userList;
    var userListIds = [];
    _.each(userList, function(item, index) {
        userListIds.push(Util.toInt(item));
    })
    console.log("*****************************************************");
    console.log(userListIds);
    console.log("*****************************************************");
    URSApi(req).getAuthableResourceByUserId({
        resourceType: 2
    }).then(function(rsp0) {
        UMSApi(req).getDepartments()
            .then(function(rsp) {
                UMSApi(req).getUsers().then(function(rsp2) {
                    // department list -> tree 
                    var departments = rsp.data;
                    var idmap = {};

                    _.each(departments, function(department) {
                        idmap[department.departmentId] = department;
                        department.lazy = false;
                        department.folder = false;
                    });
                    var users = rsp2.data;
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
                    for(var i = 0 ;i<users.length;i++){
                        if (!_.contains(userListIds, users[i].userId)) {
                            users[i].key = users[i].userId;
                            users[i].title = users[i].loginName;
                            users[i].userName = users[i].loginName;
                            users[i].description = users[i].position;
                            users[i].extraClasses = "nv-department-people";
                            var parent = idmap[users[i].departmentId];
                            if (parent) {
                                parent.children = parent.children || [];
                                parent.children.push(users[i]);
                                parent.folder = true;
                            }
                        }else{
                            users.splice(i,1);
                            i--;
                        }
                    }
                    res.endj({
                        code: 0,
                        data: result
                    });
                }).catch(res.endj);
            }).catch(res.endj);
    })
});

router.get('/users', function(req, res) {
    UMSApi(req).loadGroup({
        userGroupId: Util.toInt(req.query.id)
    }, res.endj);
});

router.post('/delete', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        userGroupId: Util.toInt(req.query.id) 
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '402',
        ModuleName:'用户组管理',
        EventType: '1018',
        EventTypeDes: '删除用户组',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 删除用户组(' + (data.userGroupId || '')+')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).delUserGroup(data, res.endj);
});

router.post('/move', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        userIds: Util.toInt(req.query.userIds) ,
        destGroupId: Util.toInt(req.query.groupId) 
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '402',
        ModuleName:'用户组管理',
        EventType: '1020',
        EventTypeDes: '用户移动用户组',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 移动用户(:' + (data.userIds || '')+ ')至用户组(' + (data.destGroupId || '')+')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).moveGroupUsers(data, res.endj);
});

router.post('/update', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        userGroupId: req.query.id ,
        userGroupName: req.query.name ,
        description: req.query.description 
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '402',
        ModuleName:'用户组管理',
        EventType: '1019',
        EventTypeDes: '更新用户组信息',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 更新ID为(' + (data.userGroupId || '')+ ')的用户组信息，新名称(' + (data.userGroupName || '') + ')新描述(' + (data.description || '')+')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).updateUserGroup(data, res.endj);
});

router.post('/addusers', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        userGroupId: req.query.id ,
        userIds: req.query.userids 
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '402',
        ModuleName:'用户组管理',
        EventType: '1021',
        EventTypeDes: '用户组添加用户',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 将ID为(' + (data.userIds || '')+ ')的用户添加至用户组(' + (data.userGroupId || '')+')' ,
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).addUserToUserGroup(data, res.endj);
});

router.post('/deleteusers', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        userGroupId: req.query.id ,
        userIds: req.query.userids 
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '402',
        ModuleName:'用户组管理',
        EventType: '1022',
        EventTypeDes: '用户删除加用户',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 将ID为(' + (data.userIds || '')+ ')的用户从用户组(' + (data.userGroupId || '')+ ')移除' ,
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).delUserFromUserGroup(data, res.endj);
});

module.exports = router;
