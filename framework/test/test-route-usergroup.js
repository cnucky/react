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

describe('UserGroupApi', function () {
    this.timeout(TIMEOUT);

    describe('/usergroup/list', function () {
        it('', function (done) {
            get('/usergroup/list', done, true);
        })
    });

    var gid = 0;
    describe('/usergroup/add', function () {
    	it('', function (done) {
    		post('/usergroup/add', {
    			name: 'Group' + (new Date().getTime()),
    			description: 'Group description'
    		}, done, true)
            .then(function (rsp) {
                gid = rsp.data;
            });
    	})
    });

    describe('/usergroup/users', function () {
        it('', function (done) {
            get('/usergroup/users', {
                id: 605
            }, done, true);
        })
    });

    describe('/usergroup/delete', function () {
        it('', function (done) {
            post('/usergroup/delete', {
                id: gid
            }, done, true);
        })
    });

    describe('/usergroup/addusers', function () {
        it('', function (done) {
            post('/usergroup/addusers', {
                id: 608,
                userids: [501]
            }, done, true);
        })
    });

    describe('/usergroup/deleteusers', function () {
        it('', function (done) {
            post('/usergroup/deleteusers', {
                id: 608,
                userids: [501]
            }, done, true);
        })
    });

/*
    $.post({
        url: '/usergroup/delete',
        data: {id: 1},
        dataType: 'json',
        success: function (rsp) {
            console.log(rsp);
        }
    })
*/

});
