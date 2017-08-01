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

describe('UserRoleAPi', function() {
    this.timeout(TIMEOUT);

   /* describe('/userrole/list', function() {
        it('', function(done) {
            get('/userrole/list', done, true);
        });
    });

    var id = 0;
    describe('/userrole/createrole', function() {
        it('', function(done) {
            post('/userrole/createrole', {
                name: '测试角色' + (new Date().getTime()),
                description: 'miaoshu',
                roleType: 1,
                templateId: -1
            }, done, true)
            .then(function (rsp){
                id = rsp.data; 
            })
        })
    });*/

    describe('/userrole/roledetail', function () {
        it('', function (done) {
            get('/userrole/roledetail', {
                roleid: 7390,
                type: 0
            }, done, true);
        })
    })

    // describe('/userrole/deleterole', function () {
    //     it('', function (done) {
    //         post('/userrole/deleterole', {
    //             id: id
    //         }, done, true)
    //     })
    // });

    // describe
})
