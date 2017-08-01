var router = require('express').Router();
var soap = require('soap');
var UMSApi = require('../jws/ums');
var URApi = require('../jws/role');
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');
var moment = require('moment');
var appConfig = require('../config.js');
router.get('/listall', function(req, res) {
    URApi(req).getAuthableResourceByUserId({
            resourceType: 2,
            roleType:Util.toInt(req.query.roleType)
        }).then(function(rsp0) {
            UMSApi(req).getDepartments()
                .then(function(rsp) {
                    UMSApi(req).getUsers().then(function(rsp2) {
                        // department list -> tree 
                        var departments = rsp.data;
                        var authDepartment = rsp0.data;
                        var authDepartmentId = [];
                        var idmap = {};
                        _.each(authDepartment, function(dep) {
                            var strFullId = dep.id;
                            var strId = strFullId.substr(strFullId.lastIndexOf(':') + 1);
                            var intId = Util.toInt(strId);
                            authDepartmentId.push(intId);
                            var iDep = idmap[intId];
                        })
                        var newDepartments = [];
                        _.each(departments, function(dep) {
                            if (_.contains(authDepartmentId, dep.departmentId)) {
                                newDepartments.push(dep);
                            }
                        })
                        _.each(newDepartments, function(department) {
                            department.key = 'dep-' + department.departmentId;
                            idmap[department.departmentId] = department;
                            department.lazy = false;
                            department.folder = false;
                        });
                        console.log("sum ++++++++++++++++++" + newDepartments.length);
                        var users = rsp2.data;
                        var result = [];

                        _.each(newDepartments, function(department) {
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
                            if (_.contains(authDepartmentId, user.departmentId)) {
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
                            }
                        });
                        res.endj({
                            code: 0,
                            data: result
                        });
                    }).catch(res.endj);
                }).catch(res.endj);
        })
        .catch(res.endj);
});

router.get('/listallnoauth', function(req, res) {
    UMSApi(req).getDepartments()
        .then(function(rsp) {
            UMSApi(req).getUsers().then(function(rsp2) {
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

router.get('/listallnosuperadmin', function(req, res) {
    URApi(req).getAuthableResourceByUserId({
            resourceType: 2,
            roleType:Util.toInt(req.query.roleType)
        }).then(function(rsp0) {
            UMSApi(req).getDepartments()
                .then(function(rsp) {
                    UMSApi(req).getUsers().then(function(rsp2) {
                        // department list -> tree 
                        var departments = rsp.data;
                        var authDepartment = rsp0.data;
                        var authDepartmentId = [];
                        var idmap = {};
                        _.each(authDepartment, function(dep) {
                            var strFullId = dep.id;
                            var strId = strFullId.substr(strFullId.lastIndexOf(':') + 1);
                            var intId = Util.toInt(strId);
                            authDepartmentId.push(intId);
                            var iDep = idmap[intId];
                        })
                        var newDepartments = [];
                        _.each(departments, function(dep) {
                            if (_.contains(authDepartmentId, dep.departmentId)) {
                                newDepartments.push(dep);
                            }
                        })
                        _.each(newDepartments, function(department) {
                            department.key = 'dep-' + department.departmentId;
                            idmap[department.departmentId] = department;
                            department.lazy = false;
                            department.folder = false;
                        });
                        console.log("sum ++++++++++++++++++" + newDepartments.length);
                        var users = rsp2.data;
                        var result = [];

                        _.each(newDepartments, function(department) {
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
                            if (_.contains(authDepartmentId, user.departmentId) && user.userId != -1) {
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
                            }
                        });
                        res.endj({
                            code: 0,
                            data: result
                        });
                    }).catch(res.endj);
                }).catch(res.endj);
        })
        .catch(res.endj);
});


router.get('/list', function(req, res) {
    URApi(req).getAuthableResourceByUserId({
            resourceType: 2,
            roleType:Util.toInt(req.query.roleType)
        }).then(function(rsp0) {
            UMSApi(req).getDepartments()
                .then(function(rsp) {
                    // department list -> tree 
                    var departments = rsp.data;
                    var authDepartment = rsp0.data;
                    var authDepartmentId = [];
                    var idmap = {};
                    _.each(authDepartment, function(dep) {
                        var strFullId = dep.id;
                        var strId = strFullId.substr(strFullId.lastIndexOf(':') + 1);
                        var intId = Util.toInt(strId);
                        authDepartmentId.push(intId);
                        var iDep = idmap[intId];
                    })
                    var newDepartments = [];
                    _.each(departments, function(dep) {
                        if (_.contains(authDepartmentId, dep.departmentId)) {
                            newDepartments.push(dep);
                        }
                    })
                    _.each(newDepartments, function(department) {
                        department.key = 'dep-' + department.departmentId;
                        idmap[department.departmentId] = department;
                        department.lazy = false;
                        department.folder = false;
                        department.expanded = false;
                    });
                    var result = [];
                    _.each(newDepartments, function(department) {
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
                    res.endj({
                        code: 0,
                        data: result
                    });
                }).catch(res.endj);
        })
        .catch(res.endj);
});


router.get('/sublist', function(req, res) {
    UMSApi(req).loadDepartment({
        departmentId: Util.toInt(req.query.id)
    }, function(rsp) {
        var data = rsp.data;
        if (data) {
            _.each(data, function(item) {
                if (item.extraClasses == 'nv-department') {
                    item.hideCheckbox = true;
                }
            })
        }
        res.endj(rsp);
    });
});

router.post('/add', function(req, res) {
    var data = {
        departmentName: req.query.name ,
        departmentType: 2, // TODO
        description: req.query.description ,
        parentDepartmentId: req.query.pid || -1
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
        ModuleID: '401',
        ModuleName:'用户部门管理',
        EventType: '1012',
        EventTypeDes: '新增部门',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 新增部门(' + (data.departmentName || '') + ')描述(' + (data.description || '') +')父级部门ID('+(data.parentDepartmentId||'')+')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).addDepartment(data, res.endj);
});

router.post('/update', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        departmentId: req.query.id ,
        departmentName: req.query.name , 
        departmentType: 2, // TODO
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
        ModuleID: '401',
        ModuleName:'用户部门管理',
        EventType: '1014',
        EventTypeDes: '更新部门信息',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 更新部门名称为(' + (data.departmentName || '') + ')更新描述为(' + (data.description || '')+')' ,
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;
    UMSApi(req).updateDepartment(data, res.endj);
})

router.post('/delete', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        departmentId: Util.toInt(req.query.departmentId) ,
        departmentName: req.query.departmentName ,
        userIds: Util.toInt(req.query.userIds) 
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '401',
        ModuleName:'用户部门管理',
        EventType: '1013',
        EventTypeDes: '删除部门',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 删除部门(' + (data.departmentName || '') +')' ,
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;
    UMSApi(req).delDepartment(data, res.endj);
});

router.post('/move', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        sourceDepartmentId: Util.toInt(req.query.id) ,
        destDepartmentId: Util.toInt(req.query.pid) ,
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '401',
        ModuleName:'用户部门管理',
        EventType: '1015',
        EventTypeDes: '移动部门',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 移动部门(' + (data.sourceDepartmentId || '') + ')至('+(data.destDepartmentId||'')+')' ,
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;
    UMSApi(req).moveDepartment(data, res.endj);
});

module.exports = router;