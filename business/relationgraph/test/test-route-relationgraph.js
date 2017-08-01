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


describe('RelationGraph API', function() {
    this.timeout(TIMEOUT);
    describe('/relationgraph/getallnodetype', function() {
        it('', function(done) {
            get('/relationgraph/getallnodetype', done, true);
        });
    });

    describe('/relationgraph/getallnodeextendmenu', function() {
        it('', function(done) {
            get('/relationgraph/getallnodeextendmenu', done, true);
        });
    });

    describe('/relationgraph/querynode', function() {
        it('', function(done) {
            get('/relationgraph/querynode', {
                type: 1,
                keyword: '28356547'
            }, done, true);
        });
    });

    describe('/relationgraph/getnodedetail', function() {
        it('', function(done) {
            get('/relationgraph/getnodedetail', {
                nodes: [{
                    nodeId: '1_28356547',
                    nodeType: 1,
                    keyword: '28356547'
                }]
            }, done, true);
        });
    });

    describe('/relationgraph/nodeexpand', function() {
        it('', function(done) {
            get('/relationgraph/nodeexpand', {
                id: '1_28356547',
                type: 1,
                keyword: '28356547',
                targettype: 1,
                linktype: 1,
            }, done, true);
        });
    });
    
    describe('/relationgraph/createtask', function() {
        it('', function(done) {
            post('/relationgraph/createtask', {
                title: '测试Task',
                remark: 'ceshi remark'
            }, done, true);
        })
    })

    describe('/relationgraph/savesnapshot', function() {
        it('', function(done) {
            post('/relationgraph/savesnapshot', {
                taskid: 1237,
                title: '快照',
                graph: 'graph data',
                remark: '描述',
                image: 'image data',
                autoSave: 0
            }, done, true);
        })
    });

    describe('/relationgraph/snapshotlist', function() {
        it('', function(done) {
            get('/relationgraph/snapshotlist', {
                taskid: 1237,
                start: 0
            }, done, true);
        })
    })

});
