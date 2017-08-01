var assert = require("assert");
var TestUtils = require('../../utils/test-utils');
var get = TestUtils.get, post = TestUtils.post, TIMEOUT = TestUtils.timeout;


before(function(done) {
    this.timeout(TIMEOUT);
    TestUtils.login(done);
});

after(function(done) {
    this.timeout(TIMEOUT);
    TestUtils.logout(done);
})

describe('UserAPi', function() {
    this.timeout(TIMEOUT);

    // describe('/userstatus', function() {
    //     it('should code=0', function(done) {
    //         get('/userstatus')
    //             .then(function(rsp) {
    //                 assert.equal(0, rsp.code);
    //                 done();
    //             })
    //             .catch(done)
    //     });
    // });

    // describe('/user/list', function() {
    //     it('should code=0', function(done) {
    //         get('/user/list')
    //             .then(function(rsp) {
    //                 // console.log(rsp);
    //                 assert.equal(0, rsp.code);
    //                 done();
    //             })
    //             .catch(done);
    //     })
    // });

    var userId = 0;
    describe('/user/add', function() {
        it('should code=0', function(done) {
            post('/user/add', {
                    "address": "js-nj",
                    "birthday": "1986-05-26",
                    "certNumber": "320821198612251418",
                    "departmentId": 0,
                    "email": "247852418@qq.com",
                    "gender": 1,
                    "loginName": "test" + (new Date().getTime()),
                    "password": "123456",
                    "loginType": 1,
                    "telphone": "1442992896401",
                    "trueName": "zhang",
                    "userGroupArray": '[1, 2, 3]',
                    "userState": 1,
                    "workPhone": "15912953446"
                })
                .then(function(rsp) {
                    assert.equal(0, rsp.code);
                    if (rsp.code == 0) {
                        userId = rsp.data;
                    }
                    done();
                })
                .catch(done);
        });
    });

    describe('/user/info', function () {
        it('', function (done) {
            get('/user/info', {
                id: userId
            }, done, true);
        })
    })

    describe('/user/position', function () {
        it('', function (done) {
            get('/user/position', {}, done, true);
        })
    })

    describe('/user/delete', function() {
        it('', function(done) {
            post('/user/delete', {
                    ids: userId
                })
                .then(function(rsp) {
                    assert.equal(0, rsp.code);
                    done();
                })
                .catch(done);
        })
    })
})

