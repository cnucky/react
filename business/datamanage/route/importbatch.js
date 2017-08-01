var router = require('express').Router();
var soap = require('soap');
var IMApi = require('../jws/importbatch');
// var Util = require('../utils/util');

router.all('/GetCodeTableInfo', function (req, res) {
    IMApi(req).GetCodeTableInfo({
        "tableName": req.query.tableName
    }, res.endj);
});

router.all('/JudgeDataTypeModifyType', function(req, res) {
    IMApi(req).JudgeDataTypeModifyType({
        "centerCode": req.query.centerCode,
        "dataTypeId": req.query.dataTypeId,
    }, res.endj);
});

router.all('/GetBatchInfoByUserId', function(req, res) {
    IMApi(req).GetBatchInfoByUserId({
        "userId": req.query.userID // "1",
    }, res.endj);
});

router.all('/GetFileInfoByBatchIDFirst50', function(req, res) {
    console.log(req.query.batchID);
    IMApi(req).GetFileInfoByBatchIDFirst50({
        "batchID": req.query.batchID // "1",
    }, res.endj);
});

router.all('/GetFileInfoByBatchIDNext50', function(req, res) {
    console.log(req.query.batchID);
    IMApi(req).GetFileInfoByBatchIDNext50({
        "batchID": req.query.batchID,// "1",
        "currentMinFileID": req.query.currentMinFileID // "1",
    }, res.endj);
});

router.all('/GetAllLeftFilesInfoByBatchID', function(req, res) {
    console.log(req.query.batchID);
    IMApi(req).GetAllLeftFilesInfoByBatchID({
        "batchID": req.query.batchID,// "1",
        "currentMinFileID": req.query.currentMinFileID // "1",
    }, res.endj);
});

router.all('/SetBatchStatus', function(req, res) {
    console.log(req.query.batchID);
    IMApi(req).SetBatchStatus({
        "batchID": req.query.batchID,// "1",
        "status": req.query.status, // "1",
        "dbType": req.query.dbType// "1",
    }, res.endj);
});

router.all('/GetBatchInfoByBatchID', function(req, res) {
    console.log(req.query.batchID);
    IMApi(req).GetBatchInfoByBatchID({
        "batchID": req.query.batchID// "1",
    }, res.endj);
});

router.all('/DeleteDataImportBatchInfo', function(req, res) {
    console.log(req.query.batchID);
    IMApi(req).DeleteDataImportBatchInfo({
        "batchID": req.query.batchID,// "1",
        "dbType": req.query.dbType// "1",
    }, res.endj);
});

module.exports = router;