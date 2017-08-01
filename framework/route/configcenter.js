const router = require('express').Router();
const RoleApi = require('../jws/role');
const CommonPropertyApi = require('../jws/commonProperty');

router.get('/getConfigDotJs', function(req, res) {
    // var data = require('../static/config.js').getConfigList();
    const result = {
        // data ,
        code: '0',
        message: ''
    };
    res.end(JSON.stringify(result));
});
router.get('/refreshCachedConfig', function(req, res) {
    // delete require.cache['/home/huangjingwei/Repository/nj_nova/static/config-list.json'];
    const result = {
        code: '0',
        message: ''
    };
    res.end(JSON.stringify(result));
});

router.get('/getPermissions', function(req, res) {
    RoleApi(req).getFunctionGroup().then((rsp) => {
        res.endj(rsp);
    });
});

router.get('/getConfigList', function(req, res) {
    CommonPropertyApi(req).getConfigList().then((rsp) => {
        rsp.data.forEach((v,i,a) => {
            v.validateCondition = '';
        });

        res.endj(rsp);
    });
    // const result = {
    //     code: '0',
    //     message: '',
    //     data: products
    // };
    // res.end(JSON.stringify(result));
});
router.post('/updateConfigItems', function(req, res) {
    // RoleApi(req).getFunctionGroup().then((rsp) => {
    //     res.endj(rsp);
    // });
    CommonPropertyApi(req).updateConfigItems({
        'newConfigList': req.query.newConfigList
    }, res.endj);
});




const products = [{
    id: 1,
    description: 'aa1',
    value: 'bb1',
    validateCondition: 'cc1',
    key: 'kk1'
}, {
    id: 2,
    description: 'aa2',
    value: 'bb2',
    validateCondition: 'cc2',
    key: 'kk2'
}, {
    id: 3,
    description: 'aa3',
    value: 'bb3',
    validateCondition: 'cc3',
    key: 'kk3'
}, {
    id: 4,
    description: 'aa4',
    value: 'bb4',
    validateCondition: 'cc4',
    key: 'kk4'
}, {
    id: 5,
    description: 'aa5',
    value: 'bb5',
    validateCondition: 'cc5',
    key: 'kk5'
}, {
    id: 6,
    description: 'aa6',
    value: 'bb6',
    validateCondition: 'cc6',
    key: 'kk6'
}];

module.exports = router;