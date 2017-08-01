/**
 * Created by root on 2/17/17.
 */
var router = require('express').Router();
var tools = require('../jws/tools');

router.all('/getIpsAddrInfo', function (req, res) {
    //var data = {"ipContent":["210.28.141.12","210.28.142.99"]}
    var data = {"ipContent":req.query.queryContent}
    tools(req).getIpsAddrInfo(data, function (result) {
        res.send(result);
    });
});

router.all('/getTelNumberAddrInfo', function (req, res) {

    var data = {"telContent":req.query.queryContent}
    console.log('------------------------------------------------', data);
    tools(req).getTelNumberAddrInfo(data, function (result) {
        console.log('------------------------------------------------', result);
        res.send(result);
    });
});