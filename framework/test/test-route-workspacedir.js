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


/*describe('/workspacedir/add', function() {
    it('', function(done) {
        post('/workspacedir/add', {
            dirType: 2,
            dirName: "dir6_2_1",
            dirDesc: "789",
            parentDirId: 11112
        }, done, true);
    })
});*/


/*describe('/workspacedir/directorytree', function() {
    it('', function(done) {
        get('/workspacedir/directorytree', {
            'dirType': 2,
            'dirId': -1,
            'queryType': 2
        }, done, true);
    })
});
*/


/*
describe('/workspacedir/create', function() {
    it('', function(done) {
        post('/workspacedir/create', {
        }, done, true);
    })
});*/

/*describe('/workspacedir/onelevel', function() {
    it('', function(done) {
        get('/workspacedir/onelevel', {
            'dirId': -1
        }, done, true);
    })
});*/

/*
describe('/workspacedir/deleteResource', function() {
    it('', function(done) {
        post('/workspacedir/deleteResource', {
            item:[{id:11177,type:4}]
        }, done, true);
    })
});*/

// describe('/workspacedir/updateDir', function() {
//     it('', function(done) {
//         post('/workspacedir/updateDir', {
//             did: 11175,
//             newName: 'dir5',
//             newDesc: '7890'
//         }, done, true);
//     })
// });


// describe('/workspacedir/getAllTasks', function() {
//     it('', function(done) {
//         get('/workspacedir/getAllTasks', {
//         }, done, true);
//     })
// });

/*describe('/workspacedir/getAllTasks', function() {
>>>>>>> cf9c3df0f19faa9db99517efa118672336d923cf
    it('', function(done) {
        post('/workspacedir/moveDir', {
            item: [{
                "id": 11198,
                "type": 4
            }, {
                "id": 11199,
                "type": 4
            }],
            destDirId: 11176,
        }, done, true);
    })
});*/


describe('/workspacedir/searchResource', function() {
    it('', function(done) {
        get('/workspacedir/searchResource', {
            keyword:"测试数据",
            dirId:-1,
            type:0
        }, done, true);
    })
});
