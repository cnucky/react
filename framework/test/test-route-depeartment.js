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


describe('DepartmentApi', function() {
    this.timeout(TIMEOUT);

    describe('/department/list', function() {
        it('should code=0', function(done) {
            get('/department/list', done, true);
        });
    });

    describe('/department/sublist?id=-1', function () {
        it('', function (done) {
            get('/department/sublist?id=-1', done, true);
        });
    })

    var departmentId = 0;
    describe('/department/add', function() {
        it('', function(done) {
            post('/department/add', {
                    name: '部门' + (new Date().getTime()),
                    description: '测试部门description' + (new Date().getTime()),
                    pid: -1
                })
                .then(function(rsp) {
                    // console.log(rsp);
                    assert.equal(0, rsp.code);
                    if (rsp.code == 0) {
                        departmentId = rsp.data;
                    }
                    done();
                })
                .catch(done);
        });
    });

    describe('/department/delete', function() {
        it('', function(done) {
            post('/department/delete', {
                    departmentId: departmentId
                }, done)
        })
    });

    describe('/department/move', function () {
        it('', function (done) {
            post('/department/move', {
                id: 29,
                pid: 24
            }, done, true);
        })
    });
});



