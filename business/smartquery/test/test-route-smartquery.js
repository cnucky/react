var assert = require("assert");
var TestUtils = require('./test-utils');
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
});

/*describe('/smartquery/getTaskInfo', function() {
    it('', function(done) {
        get('/smartquery/getTaskInfo', {
            taskId:"2412"
        }, done, true);
    })
});*/

/*describe('/smartquery/getTaskCondition', function() {
    it('', function(done) {
        get('/smartquery/getTaskCondition', {
            taskId:"2578"
        }, done, true);
    })
});*/

describe('/smartquery/getdatatypequeryconfig', function() {
    it('', function(done) {
        get('/smartquery/getdatatypequeryconfig', {
            "centerCode":"100000","zoneId":1,"typeId":77
        }, done, true);
    })
});
