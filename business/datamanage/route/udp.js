/**
 * Created by root on 15-10-21.
 */
var _ = require('underscore');
var path = require('path');
var router = require('express').Router();
var Util = require('../utils/util');
var UdpApi = require('../jws/udp');
var path = require('path');
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var WSDApi = require('../../../framework/jws/directory');
var DataManageApi = require('../jws/importbatch');
var logger = require('../../../utils/routeLogger').logger('udp');
var moment = require('moment');
var appConfig = require('../../../config/config.js');

router.get('/getSearchItem', function(req, res) {
    var args = {};
    UdpApi(req).getSearchItem(args, res.endj);
});

//add dir
router.post('/adddir', function(req, res) {
    var data = {
        'dirType': 1,
        'dirName': req.query.dirName,
        'dirDesc': req.query.dirDesc,
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
        ModuleID: '203',
        ModuleName: '全文检索',
        EventType: '8001',
        EventTypeDes: '添加目录',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 添加目录(' + (data.dirName || '') + ')描述(' + (data.dirDesc || '') + ')父级目录ID(' + (data.parentDirId || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;


    WSDApi(req).addDir(data, res.endj);
});

//重命名
router.post('/updateDir', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        'id': Util.toInt(req.query.did),
        'newName': req.query.newName,
        'type': Util.toInt(req.query.type)
    };

    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '203',
        ModuleName: '全文检索',
        EventType: '8006',
        EventTypeDes: '重命名',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 执行更新目录(重命名)操作，目录ID(' + (data.id || '') + ')新目录名称(' + (data.newName || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    WSDApi(req).updateDir(data, res.endj);
});

//修改目录名称和注释
router.post('/modifyDir', function(req, res) {
    //edit by huangjingwei,add auditInfo
    var data = {
        'dirType': 0,
        'dirId': Util.toInt(req.query.dirId),
        'newName': req.query.newName,
        'newDesc': Util.toInt(req.query.newDesc)
    };

    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '203',
        ModuleName: '全文检索',
        EventType: '8003',
        EventTypeDes: '更新目录信息',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ')执行更新目录(修改目录名称和注释)操作，目录ID(' + (data.dirId || '') + ')新目录名称(' + (data.newName || '') + ')新目录描述(' + (data.newDesc || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;
    WSDApi(req).updateDir(data, res.endj);
});

router.post('/moveDir', function(req, res) {
    var data = {
        'dirType': 1,
        'dirList': req.query.dirList,
        'newParentId': req.query.newParentId
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
        ModuleName: '工作区',
        EventType: '8005',
        EventTypeDes: '移动目录',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + '移动目录(' + (data.dirList || '') + ')新父级目录ID(:' + (data.newParentId || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    WSDApi(req).moveDir(data, res.endj);
});

router.post('/moveData', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: "",
            HostMAC: "",
            UserID: "",
            Domain: "",
            OccurTime: "",
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "437",
            ModuleName: '数据管理',
            EventType: "9004",
            EventTypeDes: "移动数据类型",
            Detail: "",
            Result: "0"
        },
    };
    var data = {
        'dataTypeId': parseInt(req.query.dataTypeId),
        'newParentDirId': parseInt(req.query.newParentDirId),
        'oldParentDirId': parseInt(req.query.oldParentDirId),
        'centerCode': req.query.centerCode,
        'dataTypeDisplayName': req.query.dataTypeDisplayName,
        'zoneId': req.query.zoneId,
        'AuditInfo': auditInfo
    };
    DataManageApi(req).MoveDataTypeDir(data, res.endj);
});

//获取目录
router.get('/queryDir', function(req, res) {
    var args = {
        'dirType': 5,
        'dirId': req.query.id,
        'queryType': req.query.queryType || 1
    };
    var result = [];
    var dirResult = {};
    WSDApi(req).queryDir(args, function(rsp) {
        var data = rsp.data;
        if (data) {
            _.each(data, function(dir) {
                dir.extraClasses = 'nv-folder';
                dir.lazy = false;
                dir.title = dir.name;
                dir.key = "dir" + dir.id;
                dir.folder = true;
                dirResult[dir.id] = dir;
                result.push(dir);
            });
        } else {
            console.log("获取系统数据目录信息失败!");
        }
        if (args.queryType == 0) {
            res.endj({
                code: 0,
                message: "",
                data: dirResult
            });
        } else {
            DataManageApi(req).GetAllDataType({}, function(rsp) {
                var data = rsp.data.dataTypes;
                if (data) {
                    _.each(data, function(item) {
                        if (item.category == 1) {
                            item.extraClasses = 'nv-structure';
                        } else if (item.category == 2) {
                            item.extraClasses = 'nv-unstructure';
                        } else {
                            item.extraClasses = 'nv-semi-structure';
                        }
                        item.lazy = false;
                        item.title = item.displayName;
                        item.id = item.dataTypeID;
                        item.key = item.dataTypeID;
                        item.folder = false;
                        item.parentId = item.dirID;
                        result.push(item);
                    })
                } else {
                    console.log("获取系统数据信息失败!");
                }

                var allResult = [];

                _.each(result, function(item) {
                    if (item.parentId == 1 && item.id == 12 && item.folder == true) {
                        allResult.push(item);
                    } else {
                        var parent = dirResult[item.parentId];
                        if (parent) {
                            parent.children = parent.children || [];
                            parent.children.push(item);
                        }

                    }
                });

                res.endj({
                    code: 0,
                    message: "",
                    data: allResult
                });
            });
        }

    });

});

//删除目录
router.post('/delDir', function(req, res) {
    var data = {
        'dirType': 1,
        'dirList': req.query.dirList,
        'delSubTree': 0
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
        ModuleID: '203',
        ModuleName: '全文检索',
        EventType: '8002',
        EventTypeDes: '删除目录',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ')执行删除目录操作，详情如下: dirType(' + (data.dirType || '') + ')dirList(' + (data.dirList || '') + ')delSubTree(' + (data.delSubTree || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    WSDApi(req).delDir(data, res.endj);
});

router.get('/listDir', function(req, res) {
    var args = {
        'dirType': req.query.dirType,
        'dirId': req.query.id,
        'queryType': 2
    };
    WSDApi(req).queryDir(args).then(function(rsp) {
            // dir list -> tree
            var list = rsp.data;
            var idmap = {};
            var result = [];
            _.each(list, function(dir) {
                dir.extraClasses = 'nv-folder';
                dir.title = dir.name;
                dir.key = "dir" + dir.id;
                idmap[dir.id] = dir;
                dir.folder = false;
            });

            _.each(list, function(dir) {
                //dir.parentId == 1 &&
                if (dir.id == req.query.id) {
                    if (dir.dirType != 22)
                        result.push(dir);
                } else {
                    var parent = idmap[dir.parentId];
                    if (parent) {
                        parent.children = parent.children || [];
                        if (dir.dirType != 22)
                            parent.children.push(dir);
                        parent.folder = true;
                    }
                }
            });
            res.endj({
                code: 0,
                data: result
            })
        })
        .catch(res.endj);
});

router.get('/listLoadTaskInfo', function(req, res) {
    var args = {
        'dataTypeId': Util.toInt(req.query.dataTypeId),
        'centerCode': req.query.centerCode
    };
    DataManageApi(req).GetBatchInfoByDataTypeId(args, res.endj);
});

router.get('/listLoadFileInfo', function(req, res) {
    var args = {
        'batchID': Util.toInt(req.query.batchID),
        'start': Util.toInt(req.query.start),
        'count': Util.toInt(req.query.count)
    };
    DataManageApi(req).GetFileInfoByBatchID(args, res.endj);
});

router.post('/SetBatchStatus', function(req, res) {
    var args = {
        'batchID': Util.toInt(req.query.batchID),
        'status': Util.toInt(req.query.status),
        'dbType': Util.toInt(req.query.dbType)
    };
    DataManageApi(req).SetBatchStatus(args, res.endj);
});

router.post('/DeleteDataImportBatchInfo', function(req, res) {
    var args = {
        'batchID': Util.toInt(req.query.batchID)
    };
    DataManageApi(req).DeleteDataImportBatchInfo(args, res.endj);
});

//create new data type
router.post('/createDataType', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: "",
            HostMAC: "",
            UserID: "",
            Domain: "",
            OccurTime: "",
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "437",
            ModuleName: '数据管理',
            EventType: "9005",
            EventTypeDes: "创建数据类型",
            Detail: "",
            Result: "0"
        },
    };
    if (req.query.columnList == null) {
        req.query.columnList = [];
    }
    var args = {
        'centerCode': req.query.centerCode,
        'description': req.query.description,
        'dirID': req.query.dirID,
        'displayName': req.query.displayName,
        'zoneID': req.query.zoneID,
        'category': req.query.category,
        'columnList': req.query.columnList,
        'udpFlag': req.query.udpFlag,
        'checkFlag': req.query.checkFlag,
        'metaCharacterFlag': req.query.metaCharacterFlag,
        'AuditInfo': auditInfo
    };
    DataManageApi(req).CreateDataType(args, res.endj);
});

router.post('/deleteDataType', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: "",
            HostMAC: "",
            UserID: "",
            Domain: "",
            OccurTime: "",
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "437",
            ModuleName: '数据管理',
            EventType: "9006",
            EventTypeDes: "删除数据类型",
            Detail: "",
            Result: "0"
        },
    };
    var args = {
        'centerCode': req.query.centerCode,
        'dataTypeId': req.query.dataTypeId,
        'AuditInfo': auditInfo
    };
    DataManageApi(req).RemoveDatatypeById(args, res.endj);
});

router.get('/getColumnList', function(req, res) {
    var args = {
        'dataTypeId': req.query.dataTypeId,
        'zoneId': req.query.zoneId,
        'centerCode': req.query.centerCode,
    };
    DataManageApi(req).GetDataTypeDefineInfo(args, res.endj);
});

router.get('/getCodeTable', function(req, res) {
    var args = {};
    DataManageApi(req).GetCodeTable(args, res.endj);
});

router.post('/modifyDataType', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: "",
            HostMAC: "",
            UserID: "",
            Domain: "",
            OccurTime: "",
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "437",
            ModuleName: '数据管理',
            EventType: "9007",
            EventTypeDes: "修改数据类型",
            Detail: "",
            Result: "0"
        },
    };
    if (req.query.columnList == null) {
        req.query.columnList = [];
    }
    var args = {
        'description': req.query.description,
        'dirID': req.query.dirID,
        'displayName': req.query.displayName,
        'centerCode': req.query.centerCode,
        'dataTypeId': req.query.dataTypeId,
        'zoneId': req.query.zoneId,
        'category': req.query.category,
        'columnList': req.query.columnList,
        'modifyClass': req.query.modifyClass,
        'udpFlag': req.query.udpFlag,
        'checkFlag': req.query.checkFlag,
        'metaCharacterFlag': req.query.metaCharacterFlag,
        'AuditInfo': auditInfo
    };
    DataManageApi(req).ModifyDataType(args, res.endj);
});

function uuid(len) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
        i;
    if (len) {
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * 62];
        }
    } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 62;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

module.exports = router;