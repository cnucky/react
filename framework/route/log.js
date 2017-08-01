var router = require('express').Router();
var soap = require('soap');
var multiparty = require('multiparty');
var fs = require('fs');
var LogApi = require('../jws/log');
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');
var moment = require('moment');
var appConfig = require('../config.js');


//var logger= require('../log').logger('log');

router.get('/getrecenttasks', function(req, res) {
    LogApi(req).getRecentTasks({
        'taskType': req.query.tasktype
    }, res.endj);
});

router.post('/recordlog', function(req, res) {
    LogApi(req).recordLog({
        'moduleType': Util.toInt(req.query.moduletype),
        'operationType': Util.toInt(req.query.operationtype),
        'content': req.query.content,
        'detailType': Util.toInt(req.query.detailtype)
    }, res.endj);
});

router.get('/getchartsdata', function(req, res) {
    LogApi(req).getLogCountByModuleTypeAndUnit({
            'moduleType': Util.toInt(req.query.moduleType),
            'unit': Util.toInt(req.query.unit),
            'startTime': req.query.startTime,
            'endTime': req.query.endTime
        })
        .then(function(rsp0) {
            LogApi(req).getModulesLogCount({
                    // 'moduleType':  Util.toInt(req.query.moduleType),
                    // 'unit':  Util.toInt(req.query.unit),
                    'startTime': req.query.startTime,
                    'endTime': req.query.endTime
                })
                .then(function(rsp1) {
                    res.endj({
                        code: 0,
                        linedata: rsp0.data,
                        piedata: rsp1.data
                    });
                })
                .catch(res.endj);
        })
        .catch(res.endj);
})

router.get('/getmoduletypes', function(req, res) {
    LogApi(req).getModuleTypes({}).then(function(rsp){
        var groups={};
        var retData=[];
        if(rsp.data){
            _.each(rsp.data,function(item){
                if(groups[item.category]){
                    groups[item.category].push({
                        label:item.typeName,
                        value:item.typeId
                    });
                }else{
                    groups[item.category] = [{
                        label:item.typeName,
                        value:item.typeId
                    }];
                }
            })
            _.each(groups,function(value,key){
                retData.push({
                    label:key,
                    children:value
                });
            })
        }
        res.endj({
            code:0,
            data:retData
        });
    }).catch(res.endj);
});

router.get('/getoperationtypes', function(req, res) {
    LogApi(req).getOperationTypes({}, res.endj);
});

router.get('/getdeptlogcount', function(req, res) {
    LogApi(req).getDeptLogCount({
            'deptList': Util.toInt(req.query.departmentlist),
            'moduleTypeList': Util.toInt(req.query.moduletypelist),
            'startTime': req.query.starttime,
            'endTime': req.query.endtime
        })
        .then(function(rsp) {
            var unformatDeptLogData = rsp.data;
            var formatDeptLogData = reformatData(unformatDeptLogData);

            LogApi(req).getLogCountByDeptId({
                'deptList': Util.toInt(req.query.departmentlist),
                'moduleTypeList': Util.toInt(req.query.moduletypelist),
                'startTime': req.query.starttime,
                'endTime': req.query.endtime
            }).then(function (userRsp) {
                _.each(formatDeptLogData, function(item) {
                    item.user = reformatData(userRsp.data[item.id]);
                });

                res.endj({
                    code: 0,
                    data: formatDeptLogData
                });
            }).catch(function() {
                res.endj({
                    code: 1,
                    message: req.i18n.t('system-manage.log.label-getuserlogsfail')
                });
            });
        })
        .catch(res.endj);
});

router.get('/getlogcountbydeptid', function(req, res) {
    LogApi(req).getLogCountByDeptId({
            'deptId': Util.toInt(req.query.departmentid),
            'moduleTypeList': Util.toInt(req.query.moduletypelist),
            'startTime': req.query.starttime,
            'endTime': req.query.endtime
        })
        .then(function(rsp) {
            var unformatUserLogData = rsp.data;
            var formatUserLogData = reformatData(unformatUserLogData);

            res.endj({
                code: 0,
                data: formatUserLogData
            });
        })
        .catch(res.endj);
});

router.get('/getuniqmoduletypelist', function(req, res) {
    LogApi(req).getDeptLogCount({
            'deptList': Util.toInt(req.query.departmentlist),
            'moduleTypeList': Util.toInt(req.query.moduletypelist),
            'startTime': req.query.starttime,
            'endTime': req.query.endtime
        })
        .then(function(rsp) {
            var uniqMoudleTypelist = getuniqIDlist(rsp.data, "moduleType");
            res.endj({
                code: 0,
                data: uniqMoudleTypelist
            });
        })
        .catch(res.endj);
})

router.get('/querylog', function(req, res) {
    var params = {
        startTime: req.query.starttime ,
        endTime: req.query.endtime ,
        startPos: req.query.startpos ,
        count: Util.toInt(req.query.count) 
    };
    if (req.query.userid) {
        params.userId = req.query.userid ||'';
        params.userName = req.query.username ||'';
    }
    if (req.query.moduletype) {
        params.moduleType = Util.toInt(req.query.moduletype) ||'';
        params.moduleName = req.query.modulename ||'';
    }
    if (req.query.operationtype) {
        params.operationType = Util.toInt(req.query.operationtype) ||'';
        params.operationName = req.query.operationname ||'';
    }
    if (req.query.ip) {
        params.ip = req.query.ip ||'';
    }
    if (req.query.mac) {
        params.mac = req.query.mac ||'';
    }
    if (req.query.keyword) {
        params.keyword = req.query.keyword ||'';
    }

    //edit by huangjingwei,add auditInfo
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '421',
        ModuleName:'日志查询',
        EventType: '8001',
        EventTypeDes: '',
        Detail: req.generalArgument.loginName + req.i18n.t('system-manage.rolemanage.label-in') + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + req.i18n.t('system-manage.rolemanage.label-useip') + req.generalArgument.ip + req.i18n.t('system-manage.log.label-submitlogquery') + (params.moduleName || '') + req.i18n.t('system-manage.log.label-operationtype') + (params.operationType || '') + req.i18n.t('system-manage.log.label-user') + (params.userName || '') + req.i18n.t('system-manage.log.label-macaddress') + (params.mac || '') + req.i18n.t('system-manage.log.label-logcontent') + (params.keyword || '') + req.i18n.t('system-manage.log.label-ipaddress') + (params.ip || '') + req.i18n.t('system-manage.log.label-timarange') + ((params.startTime || '') + ' - ' + (params.endTime || '')) + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    params.AuditInfo = auditInfo;
    LogApi(req).queryLog(params, res.endj);
});

// 去重
function getuniqIDlist(unformatData, redundantID) {
    var uniqIDlist = [];
    _.each(unformatData, function(item) {
        uniqIDlist.push(item[redundantID]);
    });

    var obj1 = {};
    uniqIDlist.forEach(function(id) {
        obj1[id] = true;
    })
    uniqIDlist = Object.keys(obj1);
    uniqIDlist = Util.toInt(uniqIDlist);
    return uniqIDlist;
}


// 重新构造数组 一维数组 > 二维数组
function reformatData(unformatData) {
    var uniqIDlist = getuniqIDlist(unformatData, "id");
    // 构造二维数组
    var formatData = [];
    _.each(uniqIDlist, function(item0) {
        var formatItem = {};
        formatItem.module = {};
        formatItem.totalcount = 0;
        _.each(unformatData, function(item1) {
            if (item0 === item1.id) {
                formatItem.id = item1.id;
                formatItem.name = item1.name;
                formatItem.collapse = false;
                formatItem.totalcount += item1.count;
                formatItem.module[item1.moduleType] = item1.count;
            }
        });
        formatData.push(formatItem);
    });
    return formatData;
}

router.get('/getAllBaTasks', function(req, res) {
    LogApi(req).getAllBaTasks(res.endj);
});

router.get('/createBaTable', function(req, res) {
    var logIds = [];
    for (var i = 0; i < req.query.logIds.length; i++) {
        logIds.push(Util.toInt(req.query.logIds[i]));
    }
    LogApi(req).createBaTable({
        username: req.generalArgument.loginName,
        logIds: logIds
    }, res.endj);
});
router.post('/uploadBaTable', function(req, res) {
    var logIds = [];
    for (var i = 0; i < req.query.logIds.length; i++) {
        logIds.push(Util.toInt(req.query.logIds[i]));
    }
    LogApi(req).uploadBaTable({
        logIds: logIds,
        fileName: req.query.fileName
    }, res.endj);
});

router.get('/downloadFile', function(req, res) {
    console.log("download file, file url:" + req.url);
    var filePath = req.query.filePath;
    var fileName = req.query.fileName;
    res.download(filePath, fileName);
});

router.post('/uploadFile', function(req, res) {
    var uploadDir = req.query.uploadDir;
    if (!fs.existsSync(uploadDir)) {
        console.log("upload file dir not exists!");
        return;
    }
    var form = new multiparty.Form({
        uploadDir: uploadDir
    });
    form.parse(req, function(err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        if (err) {
            console.log('parse error: ' + err);
        } else {
            var file = JSON.parse(filesTmp);
            var uploadedPath = file.file[0].path;
            var newName = 'spt_' + '5003' + '_' + moment().unix() + '.pdf';
            var dstPath = uploadDir + '/' + newName;
            fs.rename(uploadedPath, dstPath, function(err) {
                if (err) {
                    console.log('rename error: ' + err);
                } else {
                    res.writeHead(200, {
                        'content-type': 'text/plain;charset=utf-8'
                    });
                    var resText = {
                        newName: newName,
                        fileSize: file.file[0].size,
                        srcFileDir: uploadDir
                    };
                    res.write(JSON.stringify(resText));
                    res.end();
                }
            });
        }
    });
});
module.exports = router;
