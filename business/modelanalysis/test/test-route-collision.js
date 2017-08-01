var assert = require("assert");
var TestUtils = require('../../utils/test-utils');
var get = TestUtils.get,
    post = TestUtils.post,
    TIMEOUT = TestUtils.timeout;


before(function(done) {
    this.timeout(TIMEOUT);
    TestUtils.login(done);
});

after(function(done) {
    this.timeout(TIMEOUT);
    TestUtils.logout(done);
})


describe('Collision API', function() {
    this.timeout(TIMEOUT);
    describe('/collision/listdatasource', function() {
        it('', function(done) {
            get('/collision/listdatasource', done, true);
        });
    });
/*
    describe('/collision/getsemanticdef', function() {
        it('', function(done) {
            get('/collision/getsemanticdef', done, true);
        });
    });*/

    /*describe('/collision/getdatasourceinfo', function() {
        it('', function(done) {
            get('/collision/getdatasourceinfo', {
                centercode: 100000,
                zoneid: 1,
                typeid: 2
            }, done, true);
        });
    });*/

    /*describe('/collision/submittask', function() {
        it('', function(done) {
            post('/collision/submittask', {
                name: '测试Task',
                mode: 1,
                tasktype: 1,
                priority: 1,
                taskdetail: {
                    srcDataTypes: [],
                    output: "task"
                }
            }, done, true);
        })
    })

    describe('/collision/getresult', function() {
        it('', function(done) {
            get('/collision/getresult', {
                taskid: 1237,
                needmeta: 1,
                startindex: 0,
                length: 100
            }, done, true);
        })
    })*/

});