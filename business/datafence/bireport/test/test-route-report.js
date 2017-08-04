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
});

describe('Report API', function() {
    this.timeout(TIMEOUT);

    var reportId;
    describe('/report/savereport', function() {
        it('', function(done) {
            post('/report/savereport', {
                reportName: "test",
                reportComments: "test-comments",
                dirId: 23,
                reportDetail: {
                    card: 'test-card'
                }
            }).then(function(rsp) {
                assert.equal(0, rsp.code);
                if(rsp.code == 0) 
                    reportId = rsp.data.reportId;
                done();                                
            }).catch(done);
        })
    });

    // describe('/report/savemodelreportdetail', function() {
    //     it('', function(done) {
    //         post('/report/savemodelreportdetail', {
    //             modelId: 6291,
    //             reportDetail: {
    //                 card: 'test-card'
    //             } 
    //         }, done, true);
    //     })
    // });

    describe('/report/getreport', function() {
        it('', function(done) {
            post('/report/getreport', {
                reportId: reportId
            }, done, true);
        })
    });

    // describe('/report/getmodelreportdetail', function() {
    //     it('', function(done) {
    //         post('/report/getmodelreportdetail', {
    //             modelId: 6291
    //         }, done, true);
    //     })
    // });

    describe('/report/queryreportdata', function() {
        it('', function(done) {
            post('/report/queryreportdata', {
                mainTaskId: 0,
                nodeId: "c1bbddb0-7e10-11e6-9320-3f60eb4e29d9",
                queryFields: [""]
            }, done, true);
        })
    });
});