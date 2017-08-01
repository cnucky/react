var assert = require("assert");
var TestUtils = require('../../utils/test-utils');
var get = TestUtils.get,
    post = TestUtils.post,
    TIMEOUT = TestUtils.timeout;

var nodes = [{ "nextNodes": [{ "linkType": "1", "nodeId": "320582199110253621", "nodeType": "1" }], "nodeId": "15298836424", "nodeTitle": "手机(15298836424)", "nodeType": "5" }, { "nextLevelNodes": [{ "linkType": "9", "nodeId": "342181383", "nodeType": "11" }], "nodeId": "15601578201", "nodeTitle": "手机(15601578201)", "nodeType": "5" }, { "nextLevelNodes": [{ "linkType": "9", "nodeId": "15298836424", "nodeType": "5" }], "nodeId": "417876446", "nodeTitle": "QQ(417876446)", "nodeType": "11" }, { "nextLevelNodes": [{ "linkType": "8", "nodeId": "417876446", "nodeType": "11" }], "nodeId": "346348908", "nodeTitle": "QQ(346348908)", "nodeType": "11" }, { "nextLevelNodes": [{ "linkType": "9", "nodeId": "342181383", "nodeType": "11" }, { "linkType": "9", "nodeId": "364489536", "nodeType": "11" }], "nextNodes": [{ "linkType": "1", "nodeId": "321284199011301218", "nodeType": "1" }], "nodeId": "15298836152", "nodeTitle": "手机(15298836152)", "nodeType": "5" }, { "nextNodes": [{ "linkType": "1", "nodeId": "15601578201", "nodeType": "5" }], "nodeId": "321284199011301218", "nodeTitle": "身份(321284199011301218)", "nodeType": "1" }, { "nextLevelNodes": [{ "linkType": "8", "nodeId": "417876446", "nodeType": "11" }], "nodeId": "364489536", "nodeTitle": "QQ(364489536)", "nodeType": "11" }, { "nodeId": "320582199110253621", "nodeTitle": "身份(320582199110253621)", "nodeType": "1" }, { "nextLevelNodes": [{ "linkType": "8", "nodeId": "346348908", "nodeType": "11" }, { "linkType": "8", "nodeId": "417876446", "nodeType": "11" }], "nodeId": "342181383", "nodeTitle": "QQ(346348908)", "nodeType": "11" }];

before(function(done) {
    this.timeout(TIMEOUT);
    TestUtils.login(done);
});

after(function(done) {
    this.timeout(TIMEOUT);
    TestUtils.logout(done);
});

describe('PersonRelationExploreApi', function() {
    this.timeout(TIMEOUT);

    describe('/personrelationexplore/getentityrelation', function() {
        it('', function(done) {
            get('/personrelationexplore/getentityrelation', {
                srcentitytype: 5,
                srcentityid: '13533859109',
                dstentitytype: 1,
                dstentityid: '320481198705120055'
            }, done, true);
        });
    });


    describe('/personrelationexplore/getpersonrelation', function() {
        it('', function(done) {
            get('/personrelationexplore/getpersonrelation', {
                nodes: nodes
            }, done, true);
        });
    });


    describe('/personrelationexplore/getcomparedocument', function() {
        it('', function(done) {
            get('/personrelationexplore/getcomparedocument', {
                srcentitytype: 5,
                srcentityid: '13533859109',
                dstentitytype: 1,
                dstentityid: '320481198705120055',
                maxnum: 1000
            }, done, true);
        });
    });
});
