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
});

describe('LogApi', function() {
    this.timeout(TIMEOUT);

    // describe('/log/getmoduletypes', function() {
    //     it('', function (done) {
    //         get('/log/getmoduletypes', done, true);
    //     });
    // });

    // describe('/log/getoperationtypes', function() {
    //     it('', function (done) {
    //         get('/log/getoperationtypes', done, true);
    //     });
    // });

    describe('/log/getdeptlogcount', function() {
        it('', function (done) {
            get('/log/getdeptlogcount', {
                departmentlist: [618,620,624,626,619,622,623,323,324,325,326,305],
                moduletypelist: [1,2,3,4,101,102,103,104,201,202,203,204,205,206,301,302,303,401,402,410,411,420,431,432,433,434,435],
                starttime: '2015-03-04',
                endtime: '2016-03-10'
            }, done, true);
        });
    });

    describe('/log/getlogcountbydeptid', function() {
        it('', function (done) {
            get('/log/getlogcountbydeptid', {
                departmentid: 618,
                moduletypelist: [1,2,3,4,101,102,103,104,201,202,203,204,205,206,301,302,303,401,402,410,411,420,431,432,433,434,435],
                starttime: '2015-03-04',
                endtime: '2016-03-10'
            }, done, true);
        });
    });

    // describe('/log/querylog', function() {
    //     it('', function (done) {
    //         get('/log/querylog', {
    //             // userid: 727,
    //             // moduletype: 1,
    //             // operationtype: 1,
    //             starttime: '2015-02-04',
    //             endtime: '2016-03-10',
    //             startpos: 0,
    //             count: 10
    //         }, done, true);
    //     });
    // });

    // describe('/log/getlogcountbymoduletypeandunit', function() {
    //     it('', function (done) {
    //         get('/log/getlogcountbymoduletypeandunit', {
    //             moduleType: [618,620,624,626,619,622,623,323,324,325,326,305],
    //             unit: 1,
    //             startTime: '2015-02-04',
    //             endTime: '2016-03-10',
    //         }, done, true);
    //     });
    // });

    // describe('/log/getmoduleslogcount', function() {
    //     it('', function (done) {
    //         get('/log/getmoduleslogcount', {
    //             startTime: '2015-02-04',
    //             endTime: '2016-03-10',
    //         }, done, true);
    //     });
    // });

});
