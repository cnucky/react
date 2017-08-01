var router = require('express').Router();
var AppApi = require('../jws/appstore');

router.get('/getAppDetail',function(req,res){
   AppApi(req).getAppDetail({
       id: req.query.id
   }, res.endj);
});

router.get('/getAppsByCategory',function(req,res){
    AppApi(req).getAppsByCategory({
        category: req.query.category
    },res.endj);
});

router.get('/getCategories', function (req, res) {
    AppApi(req).getCategories({

    },res.endj);
});

router.post('/saveAppDetail', function (req, res) {
    AppApi(req).saveAppDetail({
        id: req.query.id,
        title: req.query.title,
        img: req.query.img,
        icon: req.query.icon,
        url: req.query.url,
        openmode: req.query.openmode,
        category: req.query.category,
        developer: req.query.developer,
        description: req.query.description,
        tag: req.query.tag
    },res.endj);
});

router.get('/checkAppNameValid', function (req, res) {
    AppApi(req).checkAppNameValid({
        title: req.query.title
    },res.endj);
});

router.get('/getAvailableAppImages', function (req, res) {
    AppApi(req).getAvailableAppImages({
        startIndex: req.query.startIndex,
        pageSize: req.query.pageSize
    }, res.endj);
});

router.get('/addAppToDesktop',function (req,res){
    AppApi(req).addAppToDesktop({
        appId: req.query.appId
    }, res.endj);
});

router.get('/delAppFromDesktop',function (req,res){
    AppApi(req).delAppFromDesktop({
        appId: req.query.appId
    }, res.endj);
});

router.get('/getDefaultAppInfo',function (req,res){
    AppApi(req).getDefaultAppInfo({
        id: req.query.id,
        type: req.query.type
    }, res.endj);
});

router.post('/updateAppDownloads',function (req,res){
    AppApi(req).updateAppDownloads({
        appIds: req.query.appIds
    }, res.endj);
});

router.get('/getAllApps',function (req,res){
    AppApi(req).getAllApps(res.endj);
});



module.exports = router;

