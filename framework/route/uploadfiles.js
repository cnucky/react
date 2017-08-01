/**
 * Created by root on 3/21/17.
 */

var router = require('express').Router();
var DIApi = require('../jws/dataimport');
var UdpFileApi = require('../jws/udpFileService');
var appConfig = require('../../config/config.js');
var fs = require('fs');
var multiparty = require('multiparty');
var moment = require('moment');

router.get('/getFilePath', function(req, res) {
    var args = {
        fileName: req.query.fileName,
        fileId: req.query.fileId,
        dataTypeId: req.query.dataTypeId
    };
    UdpFileApi(req).downloadFile(args, res.endj);
});

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