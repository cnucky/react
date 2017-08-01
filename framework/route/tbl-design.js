var router = require('express').Router();
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');
var businessLibDesign = require('../jws/businesslibdesign');
var businessLib = require('../jws/businesslib');

var metaTypeMap = [];
metaTypeMap["STRING"] = "C"; //M ritch text
metaTypeMap["DATE"] = "D";
metaTypeMap["INTEGER"] = "V";

//字段元数据服务 begin
router.get('/deleteTable', function (req, res) {
    businessLibDesign(req).deleteTable(req.query, res.endj);
});

router.post('/createTable', function (req, res) {
    var data = JSON.parse(req.query.data);
    businessLibDesign(req).createTable(data, res.endj);
});

router.post('/updateTableMetaInfo', function (req, res) {
    var data = JSON.parse(req.query.data);
    businessLibDesign(req).updateTableMetaInfo(data, res.endj);
});

router.get('/getTableListInfo', function (req, res) {
    businessLibDesign(req).getTableListInfo(req.query, res.endj);
});

router.get('/getAllProperty', function (req, res) {
    console.log(req.query);
    businessLibDesign(req).getAllProperty(req.query, res.endj);
});

router.get('/getTableMetaInfo', function (req, res) {
    console.log(req.query);
    businessLibDesign(req).getTableMetaInfo(req.query, res.endj);
});

router.get('/getAllProperty', function (req, res) {
    console.log(req.query);
    businessLibDesign(req).getAllProperty(req.query, res.endj);
});

router.post('/createTable', function (req, res) {
    console.log(req.query);
    businessLibDesign(req).createTable(req.query, res.endj);
});

//字段元数据服务 end
router.get('/downloadPhoto', function(req, res) {
    businessLib(req).downloadPhoto(req.query).then(function(rsp) {
        var bitmap = new Buffer(rsp.data, 'base64');
        res.setHeader('ContentType', 'image/jpg');
        res.end(bitmap);
    }).catch(res.endj); //TODO 错误图片
});

router.get('/showPhoto', function(req, res) {
    businessLib(req).downloadPhoto(req.query, res.endj);
});

router.post('/saveTblTemplate', function (req, res) {
    console.log("==================start=================");
    console.log(JSON.parse(req.query.layoutContent));
    console.log("===================end================");
    businessLibDesign(req).updateTableLayout({
        layoutId: req.query.layoutId,
        layoutName: req.query.layoutName,
        layoutDesc: req.query.layoutDesc,
        layoutContent: JSON.parse(req.query.layoutContent),
        status: req.query.state,
        isDefault: req.query.layoutDefault
    }, res.endj);
});

router.get('/getTblTemplate', function (req, res) {
    businessLibDesign(req).getTableLayoutDetail({
        layoutId: req.query.ly_key,
        tableId: req.query.ly_tblId
    }, res.endj);
});

router.get('/getRunTimeTblTemplate', function (req, res) {
    // var layoutId = req.query.ly_key;
    var layoutTblId = req.query.ly_tblId;
    businessLibDesign(req).getTableLayoutDetail({
        layoutId: req.query.ly_key,
        tableId: req.query.ly_tblId,
    }, res.endj);

});

router.get('/getTblLayoutList', function (req, res) {

    businessLibDesign(req).getTableLayoutListInfo({
        tableId: req.query.tblId
    }, res.endj);
});

router.get('/getTblList', function (req, res) {

    businessLibDesign(req).getTableListInfo({}).then(function (rsp) {
        var tableList = [];
        _.each(rsp.data.tables,function(t){
            tableList.push({
                id : t.tableId,
                text : t.tableName
            });
        });
        res.endj({
            code: rsp.code,
            message: rsp.message,
            data: tableList
        });
    }).catch(res.endj);
});

router.all('/getTblTree', function (req, res) {
    businessLibDesign(req).getTableListInfo({}).then(function (rsp) {
        var dataDirPromise = rsp.data.dirs;
        var dataTypePromise = rsp.data.tables;
        Q.all([dataDirPromise, dataTypePromise]).spread(function (dirs, dataSource) {
            dirs = dirs;
            if (req.query.type && req.query.type == 'onlyDir')
                dataSource = [];
            else
                dataSource = dataSource;
            var sysIdmap = {};
            var newList = [];
            var result = {
                sysTree: [],
            };

            function findParent(dir, tree, idmap) {
                if (!idmap[dir.parentDirId]) {
                    if (!_.contains(tree, dir)) {
                        tree.push(dir);
                    }
                } else {
                    var parent = idmap[dir.parentDirId];
                    parent.children = parent.children || [];
                    if (!_.contains(parent.children, dir)) {
                        parent.children.push(dir);
                        parent.folder = true;
                        findParent(parent, tree, idmap);
                    }
                }
            }

            _.each(dirs, function (dir) {
                sysIdmap[dir.dirId] = dir;
                dir.folder = true;
                dir.key = "dir_" + dir.dirId;
                dir.title = dir.dirName;
                dir.extraClasses = "nv-dir";
                dir.hideCheckbox = true;
                newList.push(dir);
            });

            _.each(dataSource, function (table) {
                sysIdmap[table.tableId] = table;
                table.folder = false;
                table.key = table.tableId;
                table.title = table.tableName;
                table.extraClasses = "nv-table";
                table.hideCheckbox = true;
                newList.push(table);
            });

            _.each(newList, function (resource) {
                var parentKey;
                if (resource.extraClasses == "nv-table")
                    parentKey = resource.dirId;
                else
                    parentKey = resource.parentDirId;

                if (!sysIdmap[parentKey]) {
                    result.sysTree.push(resource);
                } else {
                    var parent = sysIdmap[parentKey];
                    if (parent) {
                        parent.children = parent.children || [];
                        parent.children.push(resource);
                    }
                }
            });

            //_.each(dataSource, function(data) {
            //    var dir = sysIdmap[data.dirId];
            //    if (dir) {
            //        dir.children = dir.children || [];
            //        data.title = data.tableName;
            //        data.key = data.tableId;
            //        data.extraClasses = 'nv-table';
            //        dir.children.push(data);
            //        dir.folder = true;
            //        findParent(dir, result.sysTree, sysIdmap);
            //    }
            //});

            result = result.sysTree;
            res.endj({
                code: rsp.code,
                message: rsp.message,
                data: result
            });
        }).catch(res.endj);
    }).catch(res.endj);
});

router.get('/createLayout', function (req, res) {
    businessLibDesign(req).createTableLayout({
        tableId: req.query.tableId,
        layoutName: req.query.ly_title,
        layoutDesc: req.query.ly_desc,
        status: req.query.state
    }, res.endj);
});

router.get('/deleteLayout', function (req, res) {
    businessLibDesign(req).deleteTableLayout({
        layoutId: req.query.layoutKey
    }, res.endj);
});

router.get('/getTblMetaData', function (req, res) {
    businessLib(req).getInitTableData({
        tableId: req.query.tblId
    }).then(function (rsp) {
        console.log("===========meta begin1==============");
        console.log(JSON.stringify(rsp.data));
        console.log("===========meta end1  ==============");
        var tblMetaData = [];

        _.each(rsp.data.fields, function (item) {
            var fieldMetaData = {};
            fieldMetaData.name = item.fieldId;
            fieldMetaData.label = item.fieldDisplayName;
            fieldMetaData.dict = item.codeTable;
            fieldMetaData.notNull = !item.isNullable;
            fieldMetaData.readOnly = !item.isModifiable;
            fieldMetaData.visible = (!item.isSystemField) && item.isVisible;
            fieldMetaData.length = 200;
            fieldMetaData.multi = item.isMultiValue;
            switch (item.fieldValueType) {
                case "STRING":
                    if (item.isCode) {
                        fieldMetaData.type = "B";
                    } else if (item.isMultiValue) {
                        fieldMetaData.type = "CS";
                    } else {
                        fieldMetaData.type = "C";
                    }

                    break;
                case "INTEGER":
                    if (item.isCode) {
                        fieldMetaData.type = "B";
                    } else {
                        fieldMetaData.type = "V";
                    }

                    break;
                case "DATE":
                    fieldMetaData.type = "D";
                    fieldMetaData.length = 8;
                    break;
                case "DATETIME":
                    fieldMetaData.type = "D";
                    fieldMetaData.length = 14;
                    break;
                case "TEXT":
                    fieldMetaData.type = "M";
                    break;
                case "ATTACHMENT":
                    fieldMetaData.type = "X";
                    break;
                case "PHOTO":
                    fieldMetaData.type = "P";
                    break;
                case "FULLTEXT":
                    fieldMetaData.type = "MS";
                    break;
            }
            tblMetaData.push(fieldMetaData);
        });
        console.log("===========meta begin==============");
        console.log(JSON.stringify(tblMetaData));
        console.log("===========meta end  ==============");
        res.endj({
            code: rsp.code,
            message: rsp.message,
            data: tblMetaData
        });
    }).catch(res.endj);
});

router.get('/getTableDefaultLayOutInfo',function(req,res){
    businessLibDesign(req).getTableDefaultLayOutInfo({
        tableID: req.query.tableID
    },res.endj);
    /*res.endj({
        code : 0,
        message : "",
        data : {
            tableID : 10087,
            Layout : [{
                "Width": 12,
                "Label": "审批表信息",
                "Id": 0,
                "ElementType": 1,
                "ChildrenItem": [{
                    "Width": 12,
                    "Label": "",
                    "Id": 0,
                    "ElementType": 1,
                    "ChildrenItem": [{
                        "Width": 6,
                        "RealWidth" : 6,
                        "Label": "填表单位",
                        "Id": 12468,
                        "ElementType": 2,
                        "ChildrenItem": null
                    }, {
                        "Width": 6,
                        "RealWidth" : 6,
                        "Label": "填表日期",
                        "Id": 12469,
                        "ElementType": 2,
                        "ChildrenItem": null
                    }]
                }, {
                    "Width": 12,
                    "Label": "",
                    "Id": 0,
                    "ElementType": 1,
                    "ChildrenItem": [{
                        "Width": 6,
                        "RealWidth" : 6,
                        "Label": "审批表编号",
                        "Id": 12470,
                        "ElementType": 2,
                        "ChildrenItem": null
                    }, {
                        "Width": 6,
                        "RealWidth" : 6,
                        "Label": "对象名称",
                        "Id": 12472,
                        "ElementType": 2,
                        "ChildrenItem": null
                    }]
                }]
            },
            {
                "Width": 12,
                "Label": "对象信息",
                "Id": 0,
                "ElementType": 1,
                "ChildrenItem": [{
                    "Width": 6,
                    "Label": "",
                    "Id": 0,
                    "ElementType": 1,
                    "ChildrenItem": [{
                        "Width": 12,
                        "RealWidth" : 6,
                        "Label": "头像",
                        "Id": 12473,
                        "ElementType": 2,
                        "ChildrenItem": null
                    }]
                }, {
                    "Width": 6,
                    "Label": "",
                    "Id": 0,
                    "ElementType": 1,
                    "ChildrenItem": [{
                        "Width": 12,
                        "RealWidth" : 6,
                        "Label": "对象身份",
                        "Id": 12481,
                        "ElementType": 2,
                        "ChildrenItem": null
                    },{
                        "Width": 12,
                        "RealWidth" : 6,
                        "Label": "现在住址",
                        "Id": 12482,
                        "ElementType": 2,
                        "ChildrenItem": null
                    }]
                }, {
                    "Width": 12,
                    "Label": "",
                    "Id": 0,
                    "ElementType": 1,
                    "ChildrenItem": [{
                        "Width": 12,
                        "RealWidth" : 12,
                        "Label": "办公地址",
                        "Id": 12483,
                        "ElementType": 2,
                        "ChildrenItem": null
                    }]
                }]
            }]
        }
    });*/
});

router.get('/GetTableDefaultValue', function (req, res) {
    businessLib(req).GetTableDefaultValue({
        tableId: req.query.tableId
    }, res.endj);

});

router.post('/uploadFile', function (req, res) {
    res.endj({
        fileName: "文件名称FileName",
        fileId: "FILEID",
        fileFullPath: "/tmp/文件名称FileName"
    });
});

router.get('/transFieldFromCodeToValue', function (req, res) {
    var cData = [];
    var ft = req.query.dictCodeIds;
    _.each(ft, function (it) {
        cData.push({
            fieldId: it.dict,
            codes: it.code
        });
    });

    businessLib(req).transFieldFromCodeToValue({
        data: cData
    }).then(function (rsp) {
        var codeToValue = [];
        _.each(rsp.data, function (cv) {
            codeToValue.push({
                fieldId: cv.fieldId,
                text: cv.values.join(",")
            });
        });

        res.endj({
            code: rsp.code,
            message: rsp.message,
            data: codeToValue
        });
    }).catch(res.endj);
});

router.get('/getRecordVersionId', function (req, res) {
    businessLib(req).getRecordVersionId({
        data: req.query.data
    }, res.endj);
});

//表单关联流程
router.get('/getProcessDefinitions', function (req, res) {

    businessLibDesign(req).getProcessDefinitions({}, res.endj);
    // res.endj({
    //     code : 0,
    //     message : "",
    //     data : [{
    //         "processKey":"key1",
    //         "processName":"name1",
    //         "description":"des1"
    //     },{
    //         "processKey":"key2",
    //         "processName":"name2",
    //         "description":"des2"
    //     },{
    //         "processKey":"key3",
    //         "processName":"name3",
    //         "description":"des3"
    //     },{
    //         "processKey":"key4",
    //         "processName":"name4",
    //         "description":"des4"
    //     }]
    // });
});

router.get('/getTableProcessRelations', function (req, res) {

    businessLibDesign(req).getTableProcessRelations({
        tableId: req.query.tableId
    }, res.endj);
    // res.endj({
    //     code : 0,
    //     message : "",
    //     data : ["key1","key2","key3"]
    // });
});


router.get('/updateTableProcessRelations', function (req, res) {
    var data = JSON.parse(req.query.data);
    businessLibDesign(req).updateTableProcessRelations(data, res.endj);
    // res.endj({
    //     code : 0,
    //     message : "",
    //     data : {}
    // });
});

/*
 * 列表界面设置开始
 */
router.get('/getTableListName', function (req, res) {
    businessLibDesign(req).getTableListName(req.query, res.endj);
});

router.get('/getModuleInfo', function (req, res) {
    businessLibDesign(req).getAllModuleInfo(req.query, res.endj);
});

router.get('/getTableListDefineInfos', function (req, res) {
    businessLibDesign(req).getTableListDefineInfos(req.query, res.endj);
});

router.get('/getTableListDefineDetail', function (req, res) {
    businessLibDesign(req).getTableListDefineDetail(req.query, res.endj);
});

router.get('/AddTableListDefineDetail', function (req, res) {
    req.query.fields = JSON.parse(req.query.fields);
    businessLibDesign(req).AddTableListDefineDetail(req.query, res.endj);
});

router.get('/DeleteTableListDefineDetail', function (req, res) {
    businessLibDesign(req).DeleteTableListDefineDetail(req.query, res.endj);
});

router.get('/UpdateTableListDefineDetail', function (req, res) {
    req.query.fields = JSON.parse(req.query.fields);
    businessLibDesign(req).UpdateTableListDefineDetail(req.query, res.endj);
});
/*
 * 列表界面设置结束
 */

/*
 * 变量及默认值开始
 */
router.get('/GetAllVariable', function (req, res) {
    businessLibDesign(req).getVariableListInfo(req.query, res.endj);
});

router.get('/SaveVariable', function (req, res) {
    businessLibDesign(req).saveVariable(req.query, res.endj);
});

router.get('/DelVariable', function (req, res) {
    businessLibDesign(req).delVariable(req.query, res.endj);
});

router.get('/GetVariableInfo', function (req, res) {
    businessLibDesign(req).getVariableInfo(req.query, res.endj);
});

router.get('/GetDefalutValuePreview', function (req, res) {
    businessLibDesign(req).getDefalutValuePreview(req.query, res.endj);
});
/*
 * 变量及默认值结束
 */

module.exports = router;