var router = require('express').Router();
var soap = require('soap');
var LoginApi = require('../jws/login');
var UMSApi = require('../jws/ums');
var USApi = require('../jws/directory');
var Util = require('../utils/util');
var crypto = require("crypto");
var moment = require('moment');
var appConfig = require('../config.js');
var sysConfig = require('../../utils/config-system');

router.all('/login', function(req, res) {
    var args = {
        loginName: req.query.username,
        passWord: req.query.password
    };
    //edit by huangjingwei,add auditInfo
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName || args.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '1',
        ModuleName: '登录',
        EventType: '1010',
        EventTypeDes: '用户登录',
        Detail: args.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + (req.generalArgument.ip || '') + req.i18n.t('base-frame.login.label-loginname') + (args.loginName || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    args.AuditInfo = auditInfo;

    LoginApi(req).getTicketGrantingTicket(args)
        .then(function(rsp) {
            // res.writeHead(200, {
            //     'Set-Cookie': 'tgt=' + rsp.data + '; path=/'
            // });
            res.cookie('tgt', rsp.data, {
                path: '/',
                expires: new Date(Date.now() + 3600 * 24 * 1000)
            });

            res.cookie('username', req.query.username, {
                path: '/',
                expires: new Date(Date.now() + 3600 * 24 * 1000)
            });

            if (req.query.isRemember == 'true') {
                res.cookie('lastloginname', req.query.username, {
                    path: '/',
                    expires: new Date(Date.now() + 3600 * 24 * 1000)
                });
            }

            //res.cookie('login_username', req.query.username, {
            //    path: '/',
            //    expires: new Date(Date.now() + 3600 * 24 * 1000)
            //});
            //
            //res.cookie('login_password', hex_md5(req.query.password), {
            //    path: '/',
            //    expires: new Date(Date.now() + 3600 * 24 * 1000)
            //});
            //
            //res.cookie('remember','true',{
            //    path: '/',
            //    expires: new Date(Date.now() + 3600 * 24 * 1000)
            //});
            res.cookie('home', sysConfig.homeUrl);

            res.endj(rsp);
        })
        .catch(function(data) {
            res.endj(data);
        });
});

function hex_md5(s) {
    var md5 = crypto.createHash("md5");
    md5.update(s);
    return md5.digest('hex');
}

router.get('/logout', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        loginName: req.cookies['username'],
        tgt: req.cookies['tgt'],
        service: 'LoginService'
    };
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName || data.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '2',
        ModuleName: '登出',
        EventType: '1011',
        EventTypeDes: '用户退出',
        Detail: data.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + (req.generalArgument.ip || '') + req.i18n.t('base-frame.login.label-loginout') + (data.loginName || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    LoginApi(req).removeTickGrantingTicket(data).then(function(rsp) {
            // res.writeHead(200, {
            //     'Set-Cookie': 'tgt=deleted; path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;'
            // });
            res.clearCookie('tgt');
            res.clearCookie('home');
            res.clearCookie('username');
            res.clearCookie('userid');

            res.endj(rsp)
        })
        .catch(function(rsp) {
            res.endj(rsp);
        });
});

// 获取当前用户可管理的所有用户
router.get('/list', function(req, res) {
    UMSApi(req).getUsers(res.endj);
});

// 获取当前用户信息
router.get('/info', function(req, res) {
    if (req.query.id) {
        UMSApi(req).getUserProfile({
            userId: Util.toInt(req.query.id)
        }, res.endj);
    } else {
        UMSApi(req).getUserProfile({
            userName: req.query.name 
        }, res.endj);
    }
});

router.get('/curuserinfo', function(req, res) {

    UMSApi(req).getUserProfile(res.endj);
});

//获取所有职位
router.get('/position', function(req, res) {
    UMSApi(req).getAllUserPosition(res.endj);
});

// 新增用户
router.post('/add', function(req, res) {
    // console.log(req.query);
    var data = {
        "address": req.query.address, // "js-nj",
        "birthday": req.query.birthday, // "1986-05-26",
        "certNumber": req.query.certNumber, // "320821198612251417",
        "departmentId": Util.toInt(req.query.departmentId, 0), // "",
        "email": req.query.email, // "247852417@qq.com",
        "gender": Util.toInt(req.query.gender, 0), // "1",
        "loginName": req.query.loginName, // "test1",
        "loginType": Util.toInt(req.query.loginType, 0), // "1",
        "passWord": req.query.password, // "123456",
        "telphone": req.query.telphone, // "15912953446",
        "trueName": req.query.trueName, // "zhang",
        "userGroups": JSON.parse(req.query.userGroupArray), // [1, 2, 3],
        "userState": 1,
        "accountExpireTime": req.query.accountExpireTime,
        "position": req.query.position,
        "workPhone": req.query.workPhone // "15912953446"
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
        ModuleName: '用户部门管理',
        EventType: '1001',
        EventTypeDes: '添加用户',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.login.label-adduser') + (data.loginName || '') + req.i18n.t('base-frame.login.label-to') + (data.destDepartmentId || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).addUser(data).
    then(function(rsp) {
        if (rsp.code == 0) {
            USApi(req).createUserWorkZone({
                userId: rsp.data
            })
        }
        res.endj(rsp);
    }).catch(res.endj);

    // Q.all([UMSApi(req).addUser(data), ...]).spread(function (a1, a2))
    // .then(function(rsp) {
    //     res.endj(rsp);
    // })
    // .catch(function(rsp) {
    //     res.endj(rsp);
    // })
});

// 修改用户信息
router.post('/update', function(req, res) {
    var data = {
        "userId": req.query.userId,
        "address": req.query.address, // "js-nj",
        "birthday": req.query.birthday, // "1986-05-26",
        "certNumber": req.query.certNumber, // "320821198612251417",
        "email": req.query.email, // "247852417@qq.com",
        "gender": Util.toInt(req.query.gender, 0), // "1",
        "telphone": req.query.telphone, // "15912953446",
        "trueName": req.query.trueName, // "zhang",
        "workPhone": req.query.workPhone, // "15912953446"
        "position": req.query.position,
        "accountExpireTime": req.query.accountExpireTime,
        "loginName": req.query.loginName
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
        ModuleName: '用户部门管理',
        EventType: '1009',
        EventTypeDes: '更新用户信息',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.login.label-updateuserinfo') + (data.true || '') + req.i18n.t('base-frame.login.label-gender') + (data.gender || '') + req.i18n.t('base-frame.login.label-position') + (data.position || '') + req.i18n.t('base-frame.login.label-timevalid') + (data.accountExpireTime || '') + req.i18n.t('base-frame.login.label-sfz') + (data.certNumber || '') + req.i18n.t('base-frame.login.label-birth') + (data.birthday || '') + ')Email(' + (data.email || '') + req.i18n.t('base-frame.login.label-phone') + (data.telphone || '') + req.i18n.t('base-frame.login.label-address') + (data.address || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).updateUser(data)
        .then(function(rsp) {
            res.endj(rsp);
        })
        .catch(function(rsp) {
            res.endj(rsp);
        })
});

// delete user
router.all('/delete', function(req, res) {
    // var ids = (req.body.ids || req.query.ids).split(/\s*,\s*/);
    //edit by huangjingwei,add auditInfo
    var data = {
        'userIds': req.query.ids,
        'userNames': (req.query.userNames).join(",")
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
        ModuleName: '用户部门管理',
        EventType: '1006',
        EventTypeDes: '删除用户',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.login.label-deleteuser') + (data.userNames || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).delUser(data)
        .then(function(rsp) {
            res.endj(rsp);
        })
        .catch(function(rsp) {
            res.endj(rsp);
        });
});

//move user
router.post('/movetodepartment', function(req, res) {
    // var ids = (req.body.ids || req.query.ids).split(/\s*,\s*/);
    //edit by huangjingwei,add auditInfo
    var data = {
        'userIds': req.query.ids,
        'departmentId': req.query.departmentId
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
        ModuleName: '用户部门管理',
        EventType: '1016',
        EventTypeDes: '用户转移部门',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.login.label-moveuser') + (req.query.names || '') + req.i18n.t('base-frame.login.label-todepart') + (req.query.departmentName || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).moveUsersToDepartment(data).then(function(rsp) {
        res.endj(rsp);
    }).catch(function(rsp) {
        res.endj(rsp);
    });
});

// modify password
router.post('/updatepassword', function(req, res) {
    var data = {
        oldPassword: req.query.oldpassword,
        newPassword: req.query.newpassword,
        userName: req.query.username
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
        ModuleName: '用户部门管理',
        EventType: '1023',
        EventTypeDes: '修改密码',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.login.label-changeuser') + (data.userName || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).updatePassword(data)
        .then(function(rsp) {
            res.endj(rsp);
        })
        .catch(function(rsp) {
            res.endj(rsp);
        })
});

// reset password
router.post('/resetpassword', function(req, res) {
    var data = {
        userId: Util.toInt(req.query.userid),
        newPassword: req.query.newpassword,
        userName: req.query.username
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
        ModuleName: '用户部门管理',
        EventType: '1024',
        EventTypeDes: '重置密码',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.login.label-resetuser') + (data.userName || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).resetPassword(data)
        .then(function(rsp) {
            res.endj(rsp);
        })
        .catch(function(rsp) {
            res.endj(rsp);
        })
});

// lock user
router.post('/lockuser', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        userId: Util.toInt(req.query.userid),
        userName: req.query.username
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
        ModuleName: '用户部门管理',
        EventType: '1004',
        EventTypeDes: '停用用户',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.login.label-lockuser') + (data.userName || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).lockUser(data, res.endj);
});

// unlock user
router.post('/unlockuser', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        userId: Util.toInt(req.query.userid),
        userName: req.query.username
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
        ModuleName: '用户部门管理',
        EventType: '1003',
        EventTypeDes: '启用用户',
        Detail: req.generalArgument.loginName + req.i18n.t('base-frame.workspace.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('base-frame.workspace.label-useip') + req.generalArgument.ip + req.i18n.t('base-frame.login.label-unlockuser') + (data.userName || '') + ')',
        Result: '0'
    }
    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    UMSApi(req).unlockUser(data, res.endj);
});

router.get('/getuserprofile', function(req, res) {
    UMSApi(req).getUserProfile({
        userId: Util.toInt(req.query.userid)
    }, res.endj);
});

module.exports = router;