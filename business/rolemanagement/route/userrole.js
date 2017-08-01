var router = require('express').Router();
var RoleApi = require('../jws/role');
var UMSApi = require('../jws/ums');
var Util = require('../utils/util');
var Q = require('q');
var _ = require('underscore');
var moment = require('moment');
var appConfig = require('../config.js');

var ROLE_TYPE = {
    Normal: 0,
    User: 1,
    Role: 2,
    Log: 3
};

router.get('/list', function(req, res) {
    RoleApi(req).getRoles()
        .then(function(rsp) {
            // res.endj(rsp);
            var roles = rsp.data;
            var typeUser = {
                key: ROLE_TYPE.User,
                title: req.i18n.t('system-manage.rolemanage.enum-useradmin'),
                folder: true,
                hideCheckbox: true
            }
            var typeRole = {
                key: ROLE_TYPE.Role,
                title: req.i18n.t('system-manage.rolemanage.enum-authadmin'),
                folder: true,
                hideCheckbox: true
            }
            var typeLog = {
                key: ROLE_TYPE.Log,
                title: req.i18n.t('system-manage.rolemanage.enum-logadmin'),
                folder: true,
                hideCheckbox: true
            }
            var typeNormal = {
                key: ROLE_TYPE.Normal,
                title: req.i18n.t('system-manage.rolemanage.enum-nomal'),
                folder: true,
                hideCheckbox: true
            }

            var map = {};

            map[ROLE_TYPE.User] = typeUser;
            map[ROLE_TYPE.Role] = typeRole;
            map[ROLE_TYPE.Log] = typeLog;
            map[ROLE_TYPE.Normal] = typeNormal;

            _.each(roles, function(role) {
                var type = map[role.roleType];
                type.children = type.children || [];
                type.children.push(role);

                role.key = role.roleID;
                role.title = role.name;
            });

            res.endj({
                code: 0,
                data: [typeNormal, typeUser, typeRole, typeLog]
            });

        })
        .catch(res.endj);
});

router.get('/getpermission', function(req, res) {
    RoleApi(req).getFunctionGroup({}, res.endj);
});

router.post('/createrole', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var roleInfo = {
        name: req.query.name,
        description: req.query.description,
        roleType: Util.toInt(req.query.type, 0),
        templateId: Util.toInt(req.query.templateid, -1)
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '410',
        ModuleName:'角色管理',
        EventType: '1002',
        EventTypeDes: '添加角色',
        Detail: req.generalArgument.loginName + req.i18n.t('system-manage.rolemanage.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('system-manage.rolemanage.label-useip') + req.generalArgument.ip + req.i18n.t('system-manage.rolemanage.label-createroleoperation') + (roleInfo.name || '') + req.i18n.t('system-manage.rolemanage.label-desc') + (roleInfo.description || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    var params = {};
    params.AuditInfo = auditInfo;
    params.roleInfo = roleInfo;

    RoleApi(req).createRole(params, res.endj);
});

router.post('/deleterole', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        roleId: Util.toInt(req.query.id),
        roleName: req.query.roleName
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '410',
        ModuleName:'角色管理',
        EventType: '1005',
        EventTypeDes: '删除角色',
        Detail: req.generalArgument.loginName + req.i18n.t('system-manage.rolemanage.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('system-manage.rolemanage.label-useip') + req.generalArgument.ip + req.i18n.t('system-manage.rolemanage.label-deleterolenameoperation') + (data.roleName || '') + req.i18n.t('system-manage.rolemanage.label-roleid') + (data.roleId || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    RoleApi(req).deleteRole(data, res.endj)
});

router.post('/addresource', function(req, res) {
    var node = req.query.node;
    var resourceList = [];
    var logDetail = node[0].privateName;
    var params = {};
    for (var i = 0; i < node.length; i++) {
        if (i > 0) {
            logDetail += ',' + node[i].privateName;
        }
        var resource = {};
        resource.roleId = node[i].roleId;
        resource.roleName = node[i].roleName;
        resource.privateId = node[i].privateId;
        resource.privateName = node[i].privateName;
        resource.isDir = node[i].isDir;
        resource.type = node[i].type;
        resource.selectedSubPermission = node[i].selectedSubPermission;
        resourceList.push(resource);
    }
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '410',
        ModuleName:'角色管理',
        EventType: '1025',
        EventTypeDes: '添加资源',
        Detail: req.generalArgument.loginName + req.i18n.t('system-manage.rolemanage.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('system-manage.rolemanage.label-useip') + req.generalArgument.ip + req.i18n.t('system-manage.rolemanage.label-addauthoperation') + logDetail + req.i18n.t('system-manage.rolemanage.label-torole') + (node[0].roleName || '') + ')',
        Result: '0'
    };

    var auditInfo = {};
    auditInfo.Common = common;
    params.AuditInfo = auditInfo;
    params.resource = resourceList;
    RoleApi(req).addResourceToRole(params, res.endj);
})

router.post('/removeresource', function(req, res) {
    var node = req.query.node;
    var resourceList = [];
    var logDetail = node[0].privateName;
    var params = {};
    for (var i = 0; i < node.length; i++) {
        if (i > 0) {
            logDetail += ',' + node[i].privateName;
        }
        var resource = {};
        resource.roleId = node[i].roleId;
        resource.roleName = node[i].roleName;
        resource.privateId = node[i].privateId;
        resource.privateName = node[i].privateName;
        resource.isDir = node[i].isDir;
        resource.type = node[i].type;
        resource.selectedSubPermission = node[i].selectedSubPermission;
        resourceList.push(resource);
    }
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '410',
        ModuleName:'角色管理',
        EventType: '1026',
        EventTypeDes: '删除资源',
        Detail: req.generalArgument.loginName + req.i18n.t('system-manage.rolemanage.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('system-manage.rolemanage.label-useip') + req.generalArgument.ip + req.i18n.t('system-manage.rolemanage.label-deleteroleoperation') + (node[0].roleName || '') + req.i18n.t('system-manage.rolemanage.label-toauth') + logDetail + ')',
        Result: '0'
    }
    var auditInfo = {};
    auditInfo.Common = common;
    params.AuditInfo = auditInfo;
    params.resource = resourceList;
    RoleApi(req).removeResourceFromRole(params, res.endj);
})

router.post('/updaterole', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var roleSummary = {
        roleId: Util.toInt(req.query.id),
        roleName: req.query.roleName,
        name: req.query.name,
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
        ModuleID: '410',
        ModuleName:'角色管理',
        EventType: '1008',
        EventTypeDes: '更新角色信息',
        Detail: req.generalArgument.loginName + req.i18n.t('system-manage.rolemanage.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('system-manage.rolemanage.label-useip') + req.generalArgument.ip + req.i18n.t('system-manage.rolemanage.label-updateroledesc') + (roleSummary.roleName || '') + req.i18n.t('system-manage.rolemanage.label-updatedescto') + (roleSummary.description || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    var params = {};
    params.AuditInfo = auditInfo;
    params.roleSummary = roleSummary;

    RoleApi(req).updateRoleSummary(params, res.endj)
})

/*router.get('/roledetail', function(req, res) {
    RoleApi(req).getRolesDetail({
        roleId: Util.toInt(req.query.id),
        type: Util.toInt(req.query.type),
        dirId: Util.toInt(req.query.dirid, -1)
    }, res.endj);
})*/

router.get('/roledetail', function(req, res) {
    RoleApi(req).getResourceByRoleId({
            resourceType: Util.toInt(req.query.resourceType),
            roleId: Util.toInt(req.query.roleId),
            roleType:Util.toInt(req.query.roleType)
        })
        .then(function(rsp) {
            var list = rsp.data;
            var idmap = {};
            var resourceType = list[0].resourceType;
            var result = [];
            _.each(list, function(resource) {
                idmap[resource.id] = resource;
                resource.visable = false;
            });
            _.each(list, function(resource) {
                if (resource.authable == 1) {
                    resource.visable = true;
                    var iResouce = resource;
                    while (iResouce.parentId != -1) {
                        if (idmap[iResouce.parentId]) {
                            idmap[iResouce.parentId].visable = true;
                            iResouce = idmap[iResouce.parentId];
                        } else {
                            break;
                        }
                    }
                }
            })

            var newList = [];
            if (resourceType == 2) {
                _.each(list, function(resource) {
                    if (resource.authable == 1) {
                        resource.key = resource.id;
                        resource.title = resource.name;
                        resource.isDir = resource.isDir;
                        newList.push(resource);
                    }
                })
            } else {
                _.each(list, function(resource) {
                    if (resource.visable == true) {
                        resource.key = resource.id;
                        resource.title = resource.name;
                        resource.isDir = resource.isDir;
                        newList.push(resource);
                    }
                })
            }
            var newResult = [];
            if (resourceType == 2) {
                var depMap = {};
                _.each(newList, function(dep) {
                    depMap[dep.id] = dep;
                })
                _.each(newList, function(resource) {
                    if (resource.authable != 1) {
                        resource.hideCheckbox = true;
                    }
                    if (resource.included == 1 || resource.resourceType == 1) {
                        resource.selected = true;
                    }
                    if (resource.isDir == 1) {
                        resource.folder = true;
                    }
                    if (!depMap[resource.parentId]) {
                        newResult.push(resource);
                    } else {
                        var parent = depMap[resource.parentId];
                        if (parent) {
                            parent.children = parent.children || [];
                            parent.children.push(resource);
                        }
                    }
                });
            } else {
                _.each(newList, function(resource) {
                    /*if (resource.authable != 1) {
                        resource.hideCheckbox = true;
                    }*/
                    if (resource.included == 1 || resource.resourceType == 1) {
                        resource.selected = true;
                    }
                    if (resource.isDir == 1) {
                        resource.folder = true;
                    }
                    if (!idmap[resource.parentId]) {
                        newResult.push(resource);
                    } else {
                        var parent = idmap[resource.parentId];
                        if (parent) {
                            parent.children = parent.children || [];
                            parent.children.push(resource);
                        }
                    }
                });
            }

            res.endj({
                code: 0,
                data: newResult
            })
        })
        .catch(res.endj);
})


router.post('/grantuserrole', function(req, res) {
    RoleApi(req).grantRole({
        userId: Util.toInt(req.query.userid),
        roleIds: JSON.parse(req.query.roleids)
    }, res.endj)
})

router.post('/deprivusererole', function(req, res) {
    RoleApi(req).depriveRole({
        userId: Util.toInt(req.query.userid),
        roleIds: JSON.parse(req.query.roleIdArray)
    }, res.endj)
})

router.get('/queryuserroles', function(req, res) {
    // Q.spread([RoleApi(req).getRoles({}), RoleApi(req).queryRole({
    //     userId: Util.toInt(req.query.userid)
    // })], function (rolesRsp, userRoleRsp) {
    //  res.endj({
    //      a: rolesRsp,
    //      b: userRoleRsp
    //  })
    // });
    RoleApi(req).queryRole({
        userId: Util.toInt(req.query.userid)
    }, res.endj);
})

router.post('/updateuserrole', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        userId: req.query.userid,
        roleIds: req.query.roleid,
        type: req.query.type,
        userNames: req.query.userName,
        roleNames: req.query.roleName,
        typeName: req.query.typeName
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '411',
        ModuleName:'权限管理',
        EventType: '1007',
        EventTypeDes: '设置用户权限',
        Detail: req.generalArgument.loginName + req.i18n.t('system-manage.rolemanage.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('system-manage.rolemanage.label-useip') + req.generalArgument.ip + req.i18n.t('system-manage.rolemanage.label-updateusrrole') + (data.userNames || '') + req.i18n.t('system-manage.rolemanage.label-update') + (data.typeName || '') + req.i18n.t('system-manage.rolemanage.label-role') + (data.roleNames || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    RoleApi(req).updateRole(data, res.endj);
})

router.get('/getresourcedetail', function(req, res) {
    RoleApi(req).getResourceDetail({
        privateId: req.query.id,
        type: Util.toInt(req.query.type, 1),
        authLevel: Util.toInt(req.query.authlevel)
    }, res.endj);
})

router.get('/getUsersOfRole', function(req, res) {
    UMSApi(req).getDepartments().then(function (rsp) {
        RoleApi(req).getUsersOfRole({roleId: req.query.roleId}).then(function (rsp2) {
            // department list -> tree
            var departments = rsp.data;
            var idmap = {};
            _.each(departments, function (department) {
                department.key = 'dep-' + department.departmentId;
                idmap[department.departmentId] = department;
                department.lazy = false;
                department.folder = false;
            });
            var users = rsp2.data;
            var result = [];

            _.each(departments, function (department) {
                if (!idmap[department.parentDepartmentId]) {
                    result.push(department);
                } else {
                    var parent = idmap[department.parentDepartmentId];
                    if (parent) {
                        parent.children = parent.children || [];
                        parent.children.push(department);
                        parent.folder = true;
                    }
                }
            });
            _.each(users, function (user) {
                user.key = 'user-' + user.userId;
                user.title = user.loginName;
                user.userName = user.loginName;
                user.description = user.position;
                user.extraClasses = "nv-department-people";
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
});

router.get('/departmentwithroles', function (req, res) {
    UMSApi(req).getDepartments().then(function(rsp) {
            UMSApi(req).getUsers().then(function(rsp2) {
                RoleApi(req).queryUsersRole({
                    userIds: _.map(rsp2.data, function (user) {
                        return user.userId
                    })
                }).then(function (roleRsp) {
                    // department list -> tree
                    var departments = rsp.data;
                    var idmap = {};

                    _.each(departments, function(department) {
                        department.key = 'dep-' + department.departmentId;
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
                    _.each(users, function(user) {
                        user.roles = roleRsp.data[user.userId];
                        user.key = 'user-' + user.userId;
                        user.title = user.loginName;
                        user.userName = user.loginName;
                        user.description = user.position;
                        user.extraClasses = "nv-department-people";
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
                })

            }).catch(res.endj);
        }).catch(res.endj);
});

module.exports = router;