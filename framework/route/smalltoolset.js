var router = require('express').Router(),
    baseStationQuery = require('../jws/baseStationQuery.js'),
    ipAddressQuery = require('../jws/ipAddressQuery.js'),
    telNumberAddrQuery = require('../jws/telNumberAddrQuery.js'),
    path = require('path'),
    CommonConfig = require(path.join(process.cwd(), './framework/utils/common-config.js'));


router.all('/getIpsAddrInfo',function(req,res){
    var data = {"queryContent":req.query.queryContent};
    ipAddressQuery(req).getIpsAddrInfo(data,function(result){
        res.send(result)
    })
})


router.all('/getTelNumberAddrInfo',function(req,res){
    var data = {"queryContent":req.query.queryContent};
    telNumberAddrQuery(req).getTelNumberAddrInfo(data,function(result){
        res.send(result)
    })
})


router.all('/getBaseStationFuzzyInfo',function(req,res){
    var data = {"queryContent":req.query.queryContent};
    baseStationQuery(req).getBaseStationFuzzyInfo(data,function(result){
        res.send(result)
    })
})


router.all('/get_carriers',function(req,res){
    CommonConfig.getCarriers(req, function (result) {
        res.send(result);
    });
})


router.all('/getBaseStationInfo',function(req,res){
    var data = {"queryContent":req.query.queryContent};
    baseStationQuery(req).getBaseStationInfo(data,function(result){
        res.send(result)
    })
})

module.exports = router;
