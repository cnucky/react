var router = require('express').Router();
var BusinessLib = require('../jws/businesslib');
var BusinessCommon = require('../jws/businesscommon');
var Util = require('../utils/util');
var fs = require('fs');
var multiparty = require('multiparty');

//附件上传接口 begin
router.get('/uploadAttachment', function(req, res){
    console.log(req.query);
    BusinessLib(req).uploadAttachment(req.query, res.endj);
});

router.get('/downloadAttachment', function(req, res){
    console.log(req.query);
    BusinessLib(req).downloadAttachment(req.query, res.endj);
});

router.get('/deleteAttachment', function(req, res){
    console.log(req.query);
    BusinessLib(req).deleteAttachment(req.query, res.endj);
});

router.post('/uploadFile', function (req, res) {
    console.log('uploadFile start');
    var uploadDir = req.query.uploadDir;

    if (!fs.existsSync(uploadDir)) {
        console.log("upload file dir not exists!");

        uploadDir = '/data/spy/tmp/';
        fs.mkdirSync('/data/spy/', 0777);
        fs.mkdirSync('/data/spy/tmp', 0777);

        console.log("upload file dir create success!");
    }

    var form = new multiparty.Form({
        uploadDir: uploadDir
    });

    form.parse(req, function (err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        if (err) {
            console.log('parse error: ' + err);
        } else {
            var file = JSON.parse(filesTmp);
            var uploadedPath = file.file[0].path;
            var originalFilenameSuf = getFileExt(file.file[0].originalFilename);
            var newName = uuid(14, 16) + '.' + originalFilenameSuf;
            var dstPath = uploadDir + newName;

            console.log("dstPath:" + dstPath);
            fs.rename(uploadedPath, dstPath, function (err) {
                if (err) {
                    console.log('rename error: ' + err);
                }
                else {
                    console.log('rename ok');

                    res.writeHead(200, {
                        'content-type': 'text/plain;charset=utf-8'
                    });
                    resText = {
                        oldName: file.file[0].originalFilename,
                        newName: newName,
                        filePath: uploadDir,
                        fileSize: file.file[0].size,
                        fileType: originalFilenameSuf
                    };
                    res.write(JSON.stringify(resText));
                    res.end();
                }
            });
        }
    });
});

router.get('/downloadFile', function (req, res) {
    console.log("download file, file url:" + req.url);
    var filePath = req.query.filePath;
    var fileName = req.query.fileName;
    res.sendFile(filePath, fileName);
});

function getFileExt(str) {
    var d = str.replace(/^.+\./, "");
    return d;
}

function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    if(len) {
        for(i=0;i < len;i++) {
            uuid[i] = chars[0 | Math.random()*radix];
        }
    }
    else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        for(i = 0;i < 36;i++) {
            if(!uuid[i]) {
               r = 0 | Math.random()*16;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]; 
            }
        }
    }
    return uuid.join('');
}
//附件上传接口 end

router.get("/deleteTableDetail", function(req, res) {
    var data = {
        tableType: req.query.tableType,
        recId: req.query.recId,
    };
    BusinessLib(req).deleteTableDetail(data, res.endj);
});

router.get("/getCodeTable", function(req, res) {
    var data = {
        tableType: req.query.tableType,
    };
    BusinessLib(req).getCodeTable(data, res.endj);
});

router.get("/getInitTableData", function(req, res) {
    BusinessLib(req).getInitTableData(req.query, res.endj);
});

router.get("/getTableDetail", function(req, res) {
    BusinessLib(req).getTableDetail(req.query, res.endj);
});

router.post("/insertTableDetail", function(req, res) {
    console.log(req.query);
    BusinessCommon(req).insertTableDetail(req.query, res.endj);
});

router.post("/updateTableDetail", function(req, res) {
    var data = {
        tableType: req.query.tableType,
        recId: req.query.recId,
        data: req.query.data
    };
    console.log(data);
    BusinessLib(req).updateTableDetail(data, res.endj);
});

router.get('/GetTableDefaultValue', function(req, res) {
    BusinessLib(req).GetTableDefaultValue({
        tableId: req.query.tableId
    }, res.endj);

});

router.get('/getRecordVersionId', function(req, res) {
    BusinessLib(req).getRecordVersionId({
        data: req.query.data
    }, res.endj);
});

module.exports = router;