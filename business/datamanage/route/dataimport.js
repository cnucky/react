var router = require('express').Router();
var DIApi = require('../jws/dataimport');
var fs = require('fs');
//var xlsx = require('node-xlsx');
var multiparty = require('multiparty');
//var WebHDFS = require('webhdfs');
var TaskApi = require('../jws/taskcommon');
var DIRApi = require('../../../framework/jws/directory');
var Q = require('q');
var _ = require('underscore');
var DataManageApi = require('../jws/importbatch');
var logger = require('../../../utils/routeLogger').logger('dataimport');
var appConfig = require('../../../config/config.js');
var moment = require('moment');

router.all('/UploadFileRegist', function(req, res) {
    //console.log("req.query", req.query);
    DIApi(req).UploadFileRegist({
        "uploadFiles": JSON.parse(req.query.uploadFiles) || []
    }, res.endj);
});

router.all('/checkUploadResult', function(req, res) {
    //console.log("req.query", req.query);
    //UploaderPreview
    DIApi(req).CheckUploadResult({
        'fileName': req.query.fileName
    }, res.endj);
});

router.all('/GetDataTypeWithTag', function(req, res) {
    DIApi(req).GetDataTypeWithTag(res.endj);
});

router.all('/GetDataTypeAfterFilter', function(req, res) {
    console.log("req.query", req.query);
    DIApi(req).GetDataTypeAfterFilter({
        'beginTime': req.query.beginTime,
        'endTime': req.query.endTime,
        'rate': req.query.rate,
        'batchFlag': req.query.batchFlag
    }, res.endj);
});

router.all('/GetSrcDatatypeInfoByType', function(req, res) {
    DIApi(req).GetSrcDatatypeInfoByType({
        'centerCode': req.query.centerCode,
        'dataTypeId': req.query.dataTypeId
    }, res.endj);
});

router.all('/GetSrcDatatypeInfo', function(req, res) {
    DIApi(req).GetSrcDatatypeInfo({
        'database': req.query.database,
        'url': req.query.url,
        'user': req.query.user,
        'password': req.query.password,
        "systemId": req.query.systemId,
        "dataTypeId": req.query.dataTypeId
    }, res.endj);
});

router.all('/GetSrcHeaderInfo', function(req, res) {
    DIApi(req).GetSrcHeaderInfo({
        'database': req.query.database,
        'url': req.query.url,
        'user': req.query.user,
        'password': req.query.password,
        'centerCode': req.query.centerCode,
        'systemId': req.query.systemId,
        'dataTypeId': req.query.dataTypeId,
        'batchId': req.query.batchId
    }, res.endj);
});

router.all('/GetSrcHeaderInfoByType', function(req, res) {
    DIApi(req).GetSrcHeaderInfoByType({
        'centerCode': req.query.centerCode,
        'dataTypeId': req.query.dataTypeId,
        "headerInfo": req.query.headerInfo, //["h1","h2","h3"],
        "srcSystemId": req.query.srcSystemId, //80002,
        "srcDataTypeId": req.query.srcDataTypeId, //501
    }, res.endj);
});

router.all('/UpdateOwnerForDataType', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "437",
            ModuleName: '数据管理',
            EventType: "9001",
            EventTypeDes: "更改个人库拥有者",
            Detail: "",
            Result: "0"
        },
    };

    DIApi(req).UpdateOwnerForDataType({
        'dataTypeId': req.query.dataTypeId,
        'centerCode': req.query.centerCode,
        'zoneId': req.query.zoneId,
        'dataTypeName': req.query.dataTypeName,
        'oldOwnerId': req.query.oldOwnerId,
        'newOwnerName': req.query.newOwnerName,
        'newOwnerId': req.query.newOwnerId,
        'newDirId': req.query.newDirId,
        'newDirName': '个人工作区',
        'AuditInfo': auditInfo
    }, res.endj);
});

router.all('/UpdateZoneForDataType', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "437",
            ModuleName: '数据管理',
            EventType: "9002",
            EventTypeDes: "个人库升级为系统库",
            Detail: "",
            Result: "0"
        },
    };

    DIApi(req).UpdateZoneForDataType({
        'dataTypeId': req.query.dataTypeId,
        'centerCode': req.query.centerCode,
        'dataTypeName': req.query.dataTypeName,
        'oldZoneId': req.query.oldZoneId,
        'newZoneId': req.query.newZoneId,
        'oldDirId': parseInt(req.query.oldDirId),
        'newDirName': req.query.newDirName,
        'newDirId': parseInt(req.query.newDirId),
        'AuditInfo': auditInfo
    }, res.endj);
});

router.all('/queryDir', function(req, res) {
    DIRApi(req).queryDir({
        'dirType': 5,
        'dirId': req.query.dirId,
        'queryType': req.query.queryType || 0
    }, res.endj);
});

router.get('/listdatasource', function(req, res) {
    TaskApi(req).getDataTypeDir()
        .then(function(rsp) {
            var dirs = rsp.data;
            TaskApi(req).getDataType()
                .then(function(rsp2) {
                    var datasource = rsp2.data;
                    var sysIdmap = {};
                    var personalIdmap = {};
                    var result = {
                        sysTree: [],
                        personalTree: []
                    };

                    function findParent(dir, tree, idmap) {
                        if (!idmap[dir.parentId]) {
                            if (!_.contains(tree, dir)) {
                                tree.push(dir);
                            }
                        } else {
                            var parent = idmap[dir.parentId];
                            if (parent) {
                                parent.children = parent.children || [];
                                if (!_.contains(parent.children, dir)) {
                                    parent.children.push(dir);
                                    parent.folder = true;
                                    findParent(parent, tree, idmap);
                                }
                            }
                        }

                    }

                    function processModelingTask(data) {
                        if (data.taskType == 107) {
                            data.lazy = true;
                            data.extraClasses = "nv-dir";
                            data.folder = false;
                            data.hideCheckbox = true;
                        }
                    }

                    _.each(dirs.sysDir, function(dir) {
                        sysIdmap[dir.dirId] = dir;
                        dir.folder = false;
                        dir.key = dir.dirId;
                        dir.title = dir.dirName;
                        dir.extraClasses = "nv-dir";
                        dir.hideCheckbox = true;
                    });
                    _.each(dirs.personalDir, function(dir) {
                        personalIdmap[dir.dirId] = dir;
                        dir.folder = false;
                        dir.key = dir.dirId;
                        dir.title = dir.dirName;
                        dir.extraClasses = "nv-dir";
                        dir.hideCheckbox = true;
                    })
                    _.each(datasource.sysData, function(data) {
                        var dir = sysIdmap[data.dirId];
                        if (dir) {
                            dir.children = dir.children || [];
                            data.title = data.caption;
                            data.key = data.centerCode + data.typeId + data.zoneId;
                            data.extraClasses = 'nv-data';
                            dir.children.push(data);
                            dir.folder = true;
                            findParent(dir, result.sysTree, sysIdmap);
                        }
                    });
                    _.each(datasource.personalData, function(data) {
                        var dir = personalIdmap[data.dirId];
                        if (dir) {
                            console.log(data);
                            dir.children = dir.children || [];
                            data.title = data.caption;
                            data.key = data.centerCode + data.typeId + data.zoneId;
                            data.extraClasses = data.zoneId == 2 ? 'nv-data' : 'nv-task';
                            processModelingTask(data);
                            data.srcTypeId = data.srcTypeId;
                            dir.children.push(data);
                            dir.folder = true;
                            findParent(dir, result.personalTree, personalIdmap);
                        }
                    });
                    res.endj({
                        code: 0,
                        data: result
                    });
                }).catch(res.endj);
        }).catch(res.endj);
});

router.get('/datatypetree', function(req, res) {
    var getDataTypeDirFunc = TaskApi(req).getDataTypeDir();
    var getDataTypeFunc = TaskApi(req).getDataType();
    Q.all([getDataTypeDirFunc, getDataTypeFunc]).spread(function(dirs, dataSource) {
        var sysIdmap = {};
        var personalIdmap = {};
        var result = {
            sysTree: [],
            personalTree: []
        };
        dirs = dirs.data;
        dataSource = dataSource.data;

        function findParent(dir, tree, idmap) {
            if (!idmap[dir.parentId]) {
                if (!_.contains(tree, dir)) {
                    tree.push(dir);
                }
            } else {
                var parent = idmap[dir.parentId];
                if (parent) {
                    parent.children = parent.children || [];
                    if (!_.contains(parent.children, dir)) {
                        parent.children.push(dir);
                        parent.folder = true;
                        findParent(parent, tree, idmap);
                    }
                }
            }
        }

        _.each(dirs.sysDir, function(dir) {
            sysIdmap[dir.dirId] = dir;
            dir.folder = false;
            dir.key = dir.dirId;
            dir.title = dir.dirName;
            dir.extraClasses = "nv-dir";
            dir.hideCheckbox = true;
        });

        _.each(dirs.sysDir, function(dir) {
            if (!sysIdmap[dir.parentId]) {
                if (!_.contains(result.sysTree, dir)) {
                    result.sysTree.push(dir);
                }
            } else {
                var parent = sysIdmap[dir.parentId];
                if (parent) {
                    parent.children = parent.children || [];
                    if (!_.contains(parent.children, dir)) {
                        parent.children.push(dir);
                        parent.folder = true;
                    }
                }
            }
        });

        _.each(dirs.personalDir, function(dir) {
            if (dir.dirType != 22) {
                personalIdmap[dir.dirId] = dir;
                dir.folder = false;
                dir.key = dir.dirId;
                dir.title = dir.dirName;
                dir.extraClasses = "nv-dir";
                dir.hideCheckbox = true;
            }
        });

        _.each(dirs.personalDir, function(dir) {
            if (!personalIdmap[dir.parentId]) {
                if (!_.contains(result.personalTree, dir)) {
                    result.personalTree.push(dir);
                }
            } else {
                var parent = personalIdmap[dir.parentId];
                if (parent) {
                    parent.children = parent.children || [];
                    if (!_.contains(parent.children, dir)) {
                        parent.children.push(dir);
                        parent.folder = true;
                    }
                }
            }
        });

        _.each(dataSource.sysData, function(data) {
            var dir = sysIdmap[data.dirId];
            if (dir) {
                dir.children = dir.children || [];
                data.title = data.caption;
                data.key = data.centerCode + data.typeId + data.zoneId;
                data.extraClasses = 'nv-data';
                dir.children.push(data);
                dir.folder = true;
            }
        });

        _.each(dataSource.personalData, function(data) {
            if (data.zoneId == 2) {
                var dir = personalIdmap[data.dirId];
                if (dir) {
                    dir.children = dir.children || [];
                    data.title = data.caption;
                    data.key = data.centerCode + data.typeId + data.zoneId;
                    data.extraClasses = 'nv-data';
                    dir.children.push(data);
                    dir.folder = true;
                }
            }
        });

        if (result.personalTree.length == 0) {
            _.each(personalIdmap, function(dir) {
                if (dir.parentId == 2) {
                    result.personalTree.push(dir);
                }
            })
        }

        result = _.union(result.sysTree, result.personalTree);

        res.endj({
            code: 0,
            data: result
        });
    }).catch(res.endj);
})

router.get('/GetCenterCodeInfo', function(req, res) {
    DIApi(req).GetCenterCodeInfo(res.endj);
});

router.get('/getDataType', function(req, res) {
    TaskApi(req).getDataType(res.endj);
});

router.get('/GetAllDataTypeBusinessTimeStatInfo', function(req, res) {
    DIApi(req).GetAllDataTypeBusinessTimeStatInfo(res.endj);
});

router.all('/GetDataTypesBusinessTimeWithInterval', function(req, res) {
    DIApi(req).GetDataTypesBusinessTimeWithInterval({
        "dataTypeArray": req.query.dataTypeArray,
        "beginDateStr": req.query.beginDateStr,
        "endDateStr": req.query.endDateStr,
    }, res.endj);
});

router.get('/GetAllDataTypeLoadStatInfo', function(req, res) {
    DIApi(req).GetAllDataTypeLoadStatInfo(res.endj);
});

router.all('/GetDataTypesLoadInfoWithInterval', function(req, res) {
    DIApi(req).GetDataTypesLoadInfoWithInterval({
        "dataTypeArray": req.query.dataTypeArray,
        "beginDateStr": req.query.beginDateStr,
        "endDateStr": req.query.endDateStr,
    }, res.endj);
});

router.all('/GetAllUsersLoadStatInfoWithInterval', function(req, res) {
    DIApi(req).GetAllUsersLoadStatInfoWithInterval({
        "dataTypeArray": req.query.dataTypeArray,
        "beginDateStr": req.query.beginDateStr,
        "endDateStr": req.query.endDateStr,
    }, res.endj);
});

router.all('/GetAllBatchsLoadStatInfoWithInterval', function(req, res) {
    DIApi(req).GetAllBatchsLoadStatInfoWithInterval({
        "dataTypeArray": req.query.dataTypeArray,
        "beginDateStr": req.query.beginDateStr,
        "endDateStr": req.query.endDateStr,
    }, res.endj);
});

router.get('/GetAllUsablePreProcessRules', function(req, res) {
    DIApi(req).GetAllUsablePreProcessRules(res.endj);
});

router.get('/GetSystemConfig', function(req, res) {
    DIApi(req).GetSystemConfig({
        "key": req.query.key,
    }, res.endj);
});

router.all('/GetDataTypeDefineInfo', function(req, res) {
    DataManageApi(req).GetDataTypeDefineInfo({
        "zoneId": req.query.zoneId, // "1",
        "dataTypeId": req.query.dataTypeId, // "51",
        "centerCode": req.query.centerCode,
    }, res.endj);
});

router.all('/RegisterBatchAndFileID', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "437",
            ModuleName: '数据管理',
            EventType: "9003",
            EventTypeDes: "生成数据导入任务",
            Detail: "",
            Result: "0"
        }
    };

    var data = {
        "batchInfo": {
            "batchName": req.query.batchName,
            "dataTypeID": req.query.dataTypeId,
            "centerCode": req.query.centerCode,
            "zoneId": req.query.zoneId,
            "fileFilterRule": req.query.fileFilter,
            "rowDelimeter": req.query.rowDelimeter,
            "colDelimeter": req.query.colDelimeter,
            "encoding": req.query.encoding,
            "errorNumLimit": req.query.errorNumLimit,
            "fileCount": req.query.fileCount,
            "fileNames": req.query.fileNames,
            "haveHeadDef": req.query.haveHeadDef,
            "m_outColsIndex": req.query.m_outColsIndex,
            "m_rules": req.query.m_rules,
            "recordSeparator": req.query.recordSeparator,
            "taskType": req.query.taskType,
            "userID": req.query.userID,
            "watchDir": req.query.watchDir,
            "dbConnInfo": {
                "dbType": req.query.dbType,
                "userName": req.query.userName,
                "passWord": req.query.passWord,
                //"instanceName": req.query.instanceName,
                "dbServerIP": req.query.dbIP,
                "dbInstance": req.query.dbInstance,
                "extractTBName": req.query.dbTableName,
                "whereClause": req.query.whereClause,
                "columnCount": req.query.columnCount,
            }
        },
        "fileInfo": JSON.parse(req.query.fileInfo),
        "dirId": req.query.dirID,
        "dirType": req.query.dirType,
        "files": JSON.parse(req.query.files) || [],
        'AuditInfo': auditInfo
    };
    //console.log('RegisterBatchAndFileID-data', data);
    DIApi(req).RegisterBatchAndFileID(data, res.endj);
});

router.all('/ShowTables', function(req, res) {
    var data = {
        "dbType": req.query.dbType,
        "url": req.query.url,
        "user": req.query.user,
        "password": req.query.password,
        "driver": req.query.driver,
    };
    DIApi(req).ShowTables(data, res.endj);
});

router.all('/ShowTableInfo', function(req, res) {
    var data = {
        "dbType": req.query.dbType,
        "url": req.query.url,
        "user": req.query.user,
        "password": req.query.password,
        "driver": req.query.driver,
        "tableName": req.query.tableName,
        "whereClause": req.query.whereClause
    };
    console.log('ShowTableInfo-data', data);
    DIApi(req).ShowTableInfo(data, res.endj);
});

router.all('/PreView', function(req, res) {
    //console.log("PreView");
    var data = {
        "text": req.query.text,
        "dataTypeId": req.query.dataTypeId,
        "centerCode": req.query.centerCode,
        "rowDelimeter": req.query.rowDelimeter,
        "colDelimeter": req.query.colDelimeter,
        "rules": JSON.parse(req.query.rules),
        "outputColIndex": JSON.parse(req.query.outputColIndex),
        "headerDefinition": req.query.headerDefinition,
        "encoding": req.query.encoding
    };
    //console.log('PreView-data',data);
    DIApi(req).PreView(data, res.endj);
});

router.post('/uploadFile', function(req, res) {
    var userId = req.cookies.userid;
    //logger.info('uploadFile start');
    var uploadDir = req.query.uploadDir;
    var ip = '';
    ip = req.query.ip;
    var uploadType = req.query.isUDP;

    //通过后台进行非结构化文件上传，上传到个人目录
    if (uploadType == 0) {
        console.log("isUDP:", uploadType);
        console.log("uploadDir:", uploadDir);
        if (!fs.existsSync('/data')) {
            fs.mkdirSync('/data');
        }
        if (!fs.existsSync('/data/tmp/')) {
            fs.mkdirSync('/data/tmp/');
        }
        var personalDir = '/data/tmp';
        if (!fs.existsSync(personalDir)) {
            fs.mkdirSync(personalDir);
        }
        var form = new multiparty.Form({
            uploadDir: '/data/tmp/'
        });
        form.parse(req, function(err, fields, files) {
            var filesTmp = JSON.stringify(files, null, 2);
            if (err) {
                console.log('parse error: ' + err);
            }
            else {
                var file = JSON.parse(filesTmp);
                var uploadedPath = file.file[0].path;
                var originalFilenameSuf = getFileExt(file.file[0].originalFilename);
                var newName = uuid(14, 16) + '.' + originalFilenameSuf;
                var dstPath = personalDir + '/' + newName;
                console.log("---" + uploadedPath + "---" + dstPath);
                fs.rename(uploadedPath, dstPath, function(err) {
                    if (err) {
                        console.log('rename error: ' + err);
                    }
                    else {
                        //newName = newName.split('.')[0] + '.' + 'txt';
                        var resText = {
                            oldName: file.file[0].originalFilename,
                            newName: newName,
                            tmpNewName: newName.split('.')[0] + '.' + originalFilenameSuf,
                            fileSize: file.file[0].size,
                            dstPath: uploadedPath,
                            userId: userId,
                            fileType: originalFilenameSuf
                        };
                        res.write(JSON.stringify(resText));
                        res.end();
                    }
                });
            }
        });
    }

    //通过后台进行结构化文件预览上传，上传到个人目录
    else if (uploadType == 1) {
        console.log("isUDP:", uploadType);
        console.log("uploadDir:", uploadDir);
        if (!fs.existsSync('/data')) {
            fs.mkdirSync('/data');
        }
        if (!fs.existsSync('/data/tmp/')) {
            fs.mkdirSync('/data/tmp/');
        }
        var personalDir = '/data/tmp';
        if (!fs.existsSync(personalDir)) {
            fs.mkdirSync(personalDir);
        }
        var form = new multiparty.Form({
            uploadDir: '/data/tmp/'
        });
        form.parse(req, function(err, fields, files) {
            var filesTmp = JSON.stringify(files, null, 2);
            if (err) {
                console.log('parse error: ' + err);
            }
            else {
                var file = JSON.parse(filesTmp);
                var uploadedPath = file.file[0].path;
                var originalFilenameSuf = getFileExt(file.file[0].originalFilename);
                var newName = uuid(14, 16) + '.' + originalFilenameSuf;
                var dstPath = personalDir + '/' + newName;
                console.log("---" + uploadedPath + "---" + dstPath);
                fs.rename(uploadedPath, dstPath, function(err) {
                    if (err) {
                        console.log('rename error: ' + err);
                    }
                    else {
                        newName = newName.split('.')[0] + '.' + 'txt';
                        var resText = {
                            oldName: file.file[0].originalFilename,
                            newName: newName,
                            tmpNewName: newName.split('.')[0] + '.' + originalFilenameSuf,
                            fileSize: file.file[0].size,
                            dstPath: uploadedPath,
                            userId: userId,
                            fileType: originalFilenameSuf
                        };
                        res.write(JSON.stringify(resText));
                        res.end();
                    }
                });
            }
        });
    }

});

router.all('/moveFileToUploadDir', function(req, res) {
    try {
        if (!fs.existsSync('/data')) {
            fs.mkdirSync('/data');
        }
        if (!fs.existsSync('/data/personaldata')) {
            fs.mkdirSync('/data/personaldata');
        }
        if (!fs.existsSync('/data/udp_upload/')) {
            fs.mkdirSync('/data/udp_upload/');
        }
        if (!fs.existsSync(req.query.uploadDir)) {
            fs.mkdirSync(req.query.uploadDir);
        }
        var originalFilenameSuf = getFileExt(req.query.oldFileName);
        var newName = req.query.newFileName.split('.')[0] + '.' + originalFilenameSuf;
        var uploadedPath = '/data/tmp/' + newName;
        var dstPath = req.query.uploadDir + newName;
        console.log("----" + uploadedPath + "---" + dstPath);
        fs.rename(uploadedPath, dstPath, function(err) {
            if (err) {
                console.log('rename error: ' + err);
                resText = {
                    code: 3,
                    message: "失败",
                    data: []
                };
                //fs.unlinkSync('/data/tmp/' + newName);
                res.endj(resText);
            } else {
                console.log('moveFileToUploadDir', "success");
                resText = {
                    code: 0,
                    message: ""
                };
                res.endj(resText);
            }
        });

    } catch (e) {
        console.log('moveFileToUploadDir', e);
        resText = {
            code: 3,
            message: e,
            data: ""
        };
        res.endj(resText);
    }
});

router.get('/uploadHDFS', function(req, res) {
    console.log('uploadHDFS start');
    var filePath = req.query.filePath;
    var hdfs = WebHDFS.createClient({
        user: 'root',
        host: ip, //'192.168.102.1',
        port: 50070,
        op: 'CREATE',
        path: '/webhdfs/v1'
    });

    var localFileStream = fs.createReadStream(dstPath);
    //console.log('localFileStream ok');
    var remoteFileStream = hdfs.createWriteStream(rmPath);
    console.log('remoteFileStream ok');
    //console.log("localFileStream", localFileStream);
    //console.log("remoteFileStream", remoteFileStream);
    localFileStream.pipe(remoteFileStream);
    //console.log('pipe ok');

    remoteFileStream.on('error', function onError(err) {
        // Do something with the error
        console.log("error remoteFileStream", err);
    });

    remoteFileStream.on('finish', function onFinish() {
        // Upload is done
        console.log("remoteFileStream.on 'finish'");

        if (fs.existsSync(dstPath)) {
            fs.unlinkSync(dstPath);
        }
        res.writeHead(200, {
            'content-type': 'text/plain;charset=utf-8'
        });
        resText = {
            oldName: file.file[0].originalFilename,
            newName: newName,
            fileSize: file.file[0].size,
            fileType: originalFilenameSuf
        };
        res.write(JSON.stringify(resText));
        res.end();
    });
});

router.get('/checkFileExist', function(req, res) {
    var filePath = req.query.filePath;
    console.log('checkFileExist start', filePath);
    if (!fs.existsSync(filePath)) {
        console.log('!fs.existsSync');
        res.writeHead(200, {
            'content-type': 'text/plain;charset=utf-8'
        });
        resText = {
            isExist: false
        };
        res.write(JSON.stringify(resText));
        res.end();
    } else {
        console.log('fs.existsSync');
        res.writeHead(200, {
            'content-type': 'text/plain;charset=utf-8'
        });
        resText = {
            isExist: true
        };
        res.write(JSON.stringify(resText));
        res.end();
    }
});

router.all('/GetAllDataRecord', function(req, res) {
    var data = {
        "type": req.query.type,
    };
    DIApi(req).GetAllDataRecord(data, res.endj);
});

router.all('/GetDataRecordByDate', function(req, res) {
    var data = {
        "datatypeList": req.query.datatypeId,
    };
    DIApi(req).GetDataRecordByDate(data, res.endj);
});

router.all('/xlsxParse', function(req, res) {
    try {
        //var conn = new ActiveXObject("ADODB.Connection");
        console.log('xlsxParse');
        //var rs = new ActiveXObject("ADODB.Recordset");
        //console.log('rs-data', rs);

        console.log('oldFileName', req.query.oldFileName);
        var originalFilenameSuf = getFileExt(req.query.oldFileName);
        var newName = req.query.newName.split('.')[0] + '.' + originalFilenameSuf;
        console.log('/data/personaldata/xlsxtmp/' + newName);
        var obj = xlsx.parse('/data/personaldata/xlsxtmp/' + newName);
        console.log("obj", obj[0].data.length);
        console.log("obj[0].data", obj[0].data);
        var uploadedPath = '/data/personaldata/xlsxtmp/' + newName;
        var dstPath = '/data/personaldata/' + newName;
        console.log("----" + uploadedPath + "---" + dstPath);
        fs.rename(uploadedPath, dstPath, function(err) {
            if (err) {
                console.log('rename error: ' + err);
                resText = {
                    code: 3,
                    message: "解析文件失败",
                    data: []
                };
                res.endj(resText);
            } else {
                console.log('xlsxParse', "success");
                resText = {
                    code: 0,
                    message: "",
                    data: obj[0].data.slice(0, 200)
                };
                //fs.unlinkSync('/data/personaldata/' + req.query.newName);
                res.endj(resText);
            }
        });

    } catch (e) {
        console.log('PreView-data', e);
        resText = {
            code: 3,
            message: e,
            data: ""
        };
        res.endj(resText);
    }
});

router.get('/GetAllDir', function(req, res) {
    DIApi(req).GetAllDir(res.endj);
});

router.all('/CreateDir', function(req, res) {
    var auditInfo = {
        Common: {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: "1",
            ModuleID: "437",
            ModuleName: '数据管理',
            EventType: "8001",
            EventTypeDes: "添加目录",
            Detail: "",
            Result: "0"
        },
    };

    var data = {
        "dirName": req.query.dirName,
        'AuditInfo': auditInfo
    };
    DIApi(req).CreateDir(data, res.endj);
});

router.all('/GetSimpleData', function(req, res) {
    //console.log("PreView");
    var data = {
        "type": req.query.type,
        "startNum": req.query.startNum,
        "countNum": req.query.countNum
    };
    //console.log('PreView-data',data);
    DIApi(req).GetSimpleDate(data, res.endj);
});

router.all('/CheckWatchDirIsUnique', function(req, res) {
    var data = {
        "watchDir": req.query.watchDir,
        "fileFilterRule": req.query.fileFilterRule,
    };
    DIApi(req).CheckWatchDirIsUnique(data, res.endj);
});

function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
        i;
    if (len) {
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix];
        }
    } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

function getFileExt(str) {
    var d = str.replace(/^.+\./, "");
    return d;
}

module.exports = router;