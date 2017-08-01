var router = require('express').Router();
var WSDApi = require('../jws/directory');
var Util = require('../utils/util');
var _ = require('underscore');

function showTree(data, flag) {
    var list = data;
    var idmap = {};
    var result = [];
    _.each(list, function(directory) {
        directory['key'] = directory.id;
        directory['title'] = directory.name;
        idmap[directory.id] = directory;
        directory['folder'] = true;
    });

    _.each(list, function(directory) {
        if (directory.dirType != 22) {
            if (!idmap[directory.parentId]) {
                result.push(directory);
            } else {
                var parent = idmap[directory.parentId];
                parent['children'] = parent['children'] || [];
                parent['children'].push(directory);
                parent.folder = true;
            }
            if (!idmap[directory.parentId]) {
                directory['expanded'] = true;
            }
        }
    });
    return result;
}

router.get('/showdirtree', function(req, res) {

    var showTreeList = [];
    var sstring = req.query.treeFlag;
    var sliceList = sstring.split(",");
    for (var i = 0; i < sliceList.length; i++) {
        showTreeList.push(Util.toInt(sliceList[i]));
    }
    var data = {
        'dirTypeList': showTreeList,
    };

    WSDApi(req).queryDirByDirType(data).then(function(rsp) {
            var result;
            result = showTree(rsp.data, "2");
            res.endj({
                code: 0,
                data: result
            })
        })
        .catch(res.endj);
});

module.exports = router;