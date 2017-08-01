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

/*
describe('/personcore/getpersonphoto', function() {
    it('', function(done) {
        get('/personcore/getpersonphoto', {
            'personId': 10003
        }, done, true);
    })
})

describe('/personcore/getpersondetail', function() {
    it('', function(done) {
        get('/personcore/getpersondetail', {
            'personId': 10003
        }, done, true);
    })
})

describe('/personcore/getqqgroup', function() {
    it('', function(done) {
        get('/personcore/getqqgroup', {
            number: "2132432"
        }, done, true);
    })
})
describe('/personcore/getpcqueryresult', function() {
    it('', function(done) {
        get('/personcore/getpcqueryresult', {
            taskId: 0,
            startIndex: 0,
            length: 0
        }, done, true);
    })
})


describe('/personcore/submitpcquery', function() {
    it('', function(done) {
        get('/personcore/submitpcquery', {
            mode: 0,
            simpleCond: 'test',
            advanceCond: 'test'
        }, done, true);
    })
})


describe('/personcore/getbehaviordatameta', function() {
    it('', function(done) {
        get('/personcore/getbehaviordatameta', {
            typeId: '1234'
        }, done, true);
    })
})

describe('/personcore/querybehaviordata', function() {
    it('', function(done) {
        get('/personcore/querybehaviordata', {
            cond: '1234',
            startDate: '1234',
            endDate: '1234',
            startIndex: 1,
            recordCount: 1,
            needMetaData: 1
        }, done, true);
    })
})

describe('/personcore/getbehaviordir', function() {
    it('', function(done) {
        get('/personcore/getbehaviordir', {}, done, true);
    })
})

describe('/personcore/getpartner', function() {
    it('', function(done) {
        get('/personcore/getpartner', {
            cert: '123878943357x',
            start: '2015-09-10 09:00:00',
            end: '2015-09-10 09:00:00',
            frequency: 5,
            type: 1 // 1:铁路订票, 2:飞机
        }, done, true);
    })
    describe('/personcore/getpartnerdetail', function() {
        it('', function(done) {
            get('/personcore/getpartnerdetail', {
                id: '123878943357x-29129312993x'
            }, done, true);
        })
    })
    describe('/personcore/getqq', function() {
        it('', function(done) {
            get('/personcore/getqq', {
                qq: [49494994, 12312313]
            }, done, true);
        })
    })
    describe('/personcore/getqqgroup', function() {
        it('', function(done) {
            get('/personcore/getqqgroup', {
                number: "2132432"
            }, done, true);
        })
    })

})
*/
describe('/personcore/actioninfo', function () {
    it('', function (done) {
        get('/personcore/actioninfo', {
            uid: '320821198508291918'
        }, done, true);
    })
})
