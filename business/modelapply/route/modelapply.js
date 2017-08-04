var router = require('express').Router();
var TaskApi = require('../jws/taskcommon');
var _ = require('underscore');


const OPR_MAP = {
    stringOpr: [{key: 'equal', name: '等于'},
        {key: 'notEqual', name: '不等于'},
        {key: 'in', name: '在列表中'},
        {key: 'notIn', name: '不在列表中'},
        {key: 'startWith', name: '以...开头'},
        {key: 'notStartWith', name: '不以...开头'},
        {key: 'endWith', name: '以...结尾'},
        {key: 'notEndWith', name: '不以...结尾'},
        {key: 'like', name: '类似于'},
        {key: 'notLike', name: '不类似于'},
        {key: 'isNull', name: '为空'},
        {key: 'isNotNull', name: '不为空'}
    ],
    numberOpr: [{ key: 'equal', name: '等于', expert: true },
        { key: 'notEqual', name: '不等于', expert: true },
        { key: 'greaterThan', name: '大于', expert: true },
        { key: 'lessThan', name: '小于', expert: true },
        { key: 'between', name: '在...之间' },
        { key: 'notBetween', name: '不在...之间' },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
    ],
    dateTimeOpr: [{ key: 'equal', name: '等于', expert: true },
        { key: 'notEqual', name: '不等于', expert: true },
        { key: 'notLessThan', name: '起始于', expert: true },
        { key: 'notGreaterThan', name: '终止于', expert: true },
        { key: 'between', name: '在...之间' },
        { key: 'notBetween', name: '不在...之间' },
        { key: 'isNull', name: '为空', expert: true },
        { key: 'isNotNull', name: '不为空', expert: true }
    ],
    codeTagOpr: [{ key: 'in', name: '在列表中' },
        { key: 'notIn', name: '不在列表中' },
        { key: 'equal', name: '等于', expert: true, onlyExpert: true },
        { key: 'notEqual', name: '不等于', expert: true, onlyExpert: true },
        { key: 'isNull', name: '为空' },
        { key: 'isNotNull', name: '不为空' }
    ]
};
var OPR = [];
_.mapObject(OPR_MAP, function(val, key) {
    OPR = OPR.concat(val);
});


router.get('/getmodelcond', function(req, res) {
    //TaskApi(req).extractCondInSolid({ modelId: req.query.modelId } , res.endj);
    TaskApi(req).extractCondInSolid({ modelId: req.query.modelId }).then(function(rsp) {
        var result = {
            conds: [],
            modelDetail: rsp.data.modelDetail,
            modelName:rsp.data.modelName,
            modelDesc:rsp.data.modelDesc
        };
        _.each(rsp.data.conds, function(item) {
            var node = item.nodeInfo;
            var folders = {
                nodeId: node.nodeId,
                title: node.nodeName,
                key: node.nodeId,
                folder: true,
                extraClasses: "nv-dir",
                hideCheckbox: true,
                solidId:rsp.data.solidId,

                children: []
            };
            _.each(item.condList, function(cond) {
                var opr;
                _.map(OPR, function(oprItem) {
                    if (cond.opr == oprItem.key) {
                        opr = oprItem.name;
                    }
                });
                var condItem = {};
                condItem.extraClasses = 'nv-data';
                condItem.key = cond.condId;
                condItem.condId = cond.condId;
                condItem.opr = cond.opr;
                condItem.isSelected = false;
                condItem.value = cond.value;
                condItem.tooltip = ' 操作符为: ' + opr + ',值为: ' +(_.isArray(cond.value)?cond.value.join(' '):cond.value);
                if (cond.column) {
                    condItem.title = cond.column.displayName;
                    condItem = _.extend({}, condItem, cond.column);
                }
                folders.children.push(condItem);
            });
                result.conds.push(folders);
        });

        res.endj({
            code: 0,
            data: result
        });
    }).catch(res.endj);
});

router.post('/savemodelapply', function(req, res) {
    var params = req.query.solidId ? {
        solidId: req.query.solidId,
        viewDetail: JSON.parse(req.query.viewDetail),
        solidName: req.query.solidName,
        solidComments: req.query.solidComments.replace('\n',''),
    } : {
        solidName: req.query.solidName,
        dirId: req.query.dirId,
        viewDetail: JSON.parse(req.query.viewDetail),
        solidComments: req.query.solidComments,
        modelId:JSON.parse(req.query.modelId),
        modelDetail: JSON.parse(req.query.modelDetail),
        conds: req.query.conds
    };
    TaskApi(req).saveViewDetailInSolid(params, res.endj);
});

router.post('/openmodelapply', function(req, res) {
    TaskApi(req).getViewDetailInSolid({
        solidId: req.query.solidId
    }, res.endj);
});

router.post('/submitValues', function(req, res) {
    TaskApi(req).submitValuesInSolid({
        solidId: req.query.solidId,
        valuesMap: req.query.valuesMap,
        name: req.query.name,
        dirID: req.query.dirID,
        description: req.query.description,
        outputColumnNameMapList: req.query.outputColumnNameMapList
    }, res.endj);
});

router.get('/listbireportTree',function(req,res){
    TaskApi(req).getModelDir()
        .then(function(rsp) {
            var dirs = rsp.data;
            TaskApi(req).getSolid({modelType:501})
                .then(function(rsp2) {
                    console.log('getsolid', rsp2.data, '\n\n\n\n');
                    var datasource = rsp2.data;
                    var sysRoot = [];
                    var personalRoot = [];
                    var sysIdmap = {};
                    var personalIdmap = {};
                    var returnData = [];
                    var result = {
                        systree:[],
                        personaltree:[]
                    };

                    function findParent(dir, tree, idmap) {
                        if (!idmap[dir.parentId]) {
                            if (!_.contains(tree, dir)) {
                                tree.push(dir);
                            }
                        } else {
                            var parent = idmap[dir.parentId];
                            if (parent) {
                                parent.children = parent.children || [];
                                if (!_.contains(parent.children, dir)) {
                                    parent.children.push(dir);
                                    parent.folder = true;
                                    findParent(parent, tree, idmap);
                                }
                            }
                        }

                    }

                    _.each(dirs.sysDir, function(dir) {
                        sysIdmap[dir.dirId] = dir;
                        dir.folder = false;
                        dir.key = dir.dirId;
                        dir.title = dir.dirName;
                        dir.extraClasses = "nv-dir";
                        dir.hideCheckbox = true;
                    });

                    _.each(dirs.personalDir, function(dir) {
                        personalIdmap[dir.dirId] = dir;
                        dir.folder = false;
                        dir.key = dir.dirId;
                        dir.title = dir.dirName;
                        dir.extraClasses = "nv-dir";
                        dir.hideCheckbox = true;
                    })

                    _.each(dirs.sysDir, function(dir){
                        findParent(dir, sysRoot, sysIdmap);
                    })

                    _.each(dirs.personalDir, function(dir){
                        findParent(dir, personalRoot, personalIdmap);
                    })

                    _.each(datasource, function(model) {
                        var dir = sysIdmap[model.dirId];
                        if (dir) {
                            dir.children = dir.children || [];
                            model.title = model.modelName;
                            model.key = model.modelId;
                            model.extraClasses = 'nv-model';
                            dir.children.push(model);
                            dir.folder = true;
                            findParent(dir, result.systree, sysIdmap);
                        }
                    });

                    _.each(datasource, function(model) {
                        var dir = personalIdmap[model.dirId];
                        if (dir) {
                            dir.children = dir.children || [];
                            model.title = model.modelName;
                            model.key = model.modelId;
                            model.extraClasses = 'nv-model';
                            dir.children.push(model);
                            dir.folder = true;
                            findParent(dir, result.personaltree, personalIdmap);
                        }
                    });

                    result.systree[0]==null?returnData.push(sysRoot[0]):returnData.push(result.systree[0]);
                    result.personaltree[0]==null?returnData.push(personalRoot[0]):returnData.push(result.personaltree[0]);

                    res.endj({
                        code: 0,
                        data: returnData
                    });
                }).catch(res.endj);
        }).catch(res.endj);
});

router.post('/getAllData', function(req, res) {
    var params = req.query.solidId ? {solidId: req.query.solidId} : {
            modelDetail: JSON.parse(req.query.modelDetail)
        };
    TaskApi(req).getAllDataSourceInSolid(params, res.endj);
});


module.exports = router;
