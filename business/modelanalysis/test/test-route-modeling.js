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


describe('Modeling API', function() {
    this.timeout(TIMEOUT);
    describe('/modeling/listdatasource', function() {
        it('', function(done) {
            get('/collision/listdatasource', done, true);
        });
    });

    describe('/modeling/getoperationnodes', function() {
        it('', function(done) {
            get('/modeling/getoperationnodes', done, true);
        });
    });

    describe('/modeling/submittask', function() {
        it('', function(done) {
            post('/modeling/submittask', {
                name: '测试Task',
                taskdetail: {
                    streamTaskDetail: [{
                            nodeId: 'xxx1',
                            taskType:0,
                            detail: {
                                centerCode: '100000',
                                zoneId: 1,
                                typeId: 51
                            }
                        }
                    ]
                }
            }, done, true);
        })
    });

    describe('/modeling/taskinfo', function() {
        it('', function(done) {
            get('/modeling/taskinfo', {
                taskid: 1
            }, done, true);
        })
    });

    describe('/modeling/pausetask', function() {
        it('', function(done) {
            post('/modeling/pausetask', {
                taskid: 1
            }, done, true);
        })
    });

    describe('/modeling/savetask', function() {
        it('', function(done) {
            post('/modeling/savetask', {
                taskid: 1223,
                taskname: 'NewTask',
                dirid: 121
            }, done, true);
        })
    });

    describe('/modeling/getnodeoutput', function() {
        it('', function(done) {
            get('/modeling/getnodeoutput', {
                input: [{
                    nodeId: 'xxx-xxx-xxx-xx3',
                    columns: []
                }],
                nodeinfo: {
                    nodeId: 'xxx1',
                    taskType: 0,
                    detail: {
                        centerCode: '100000',
                        zoneId:1,
                        typeId:51
                    }
                }
            }, done, true);
        })
    });

    describe('/modeling/getfavoritems', function() {
        it('should return data source items if type == 1, otherwise, return operators', function(done) {
            get('/modeling/getfavoritems', done, true);
        });
    });

    describe('/modeling/addfavoritem', function() {
        it('should added successfully', function(done) {
            post('/modeling/addfavoritem', {
                type:1, //1,数据源 2算子
                caption:'电信话单',
                id:'100000_1_51'
            }, done, true);
        });
    });

    describe('/modeling/delfavoritem', function() {
        it('should deleted successfully if exists', function(done) {
            post('/modeling/delfavoritem', {
                type:1, //1,数据源 2算子
                id:'100000_1_51'
            }, done, true);
        });
    });
});
