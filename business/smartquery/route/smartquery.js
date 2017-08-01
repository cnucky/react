var router = require('express').Router();
var soap = require('soap');
var SQApi = require('../jws/smartquery');
var TCApi = require('../jws/taskcommon');
var LogApi = require('../../../framework/jws/log');
var URApi = require('../../../framework/jws/role');
var udpCephApi = require('../jws/udpFileService');
var xlsx = require('node-xlsx');
//var nodeExcel = require('Node-Excel-Export');
var fs = require('fs');
var moment = require('moment');
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');
var http = require('http');
var qs = require('querystring');
var sysConfig = require('../../../utils/config-system.js');
var appConfig = require('../../../config/config.js');
var dns = require("dns")

//edit by zhangu
router.post('/saveModel', function(req, res) {
    var data = {
        "modelId": Util.toInt(req.query.modelId),
        "modelName": req.query.modelName,
        "modelDesc": req.query.modelDesc,
        "dirId": Util.toInt(req.query.dirId),
        "modelType": Util.toInt(req.query.modelType),
        "modelDetail": req.query.modelDetail
    }
    TCApi(req).saveModel(data, res.endj);
})

router.get('/openModel', function(req, res) {
    var data = {
        "modelId": Util.toInt(req.query.modelId)
    }
    TCApi(req).openModel(data, res.endj);
})

router.post('/updateModel', function(req, res) {
    var data = {
        "modelId": Util.toInt(req.query.modelId),
        "modelDetail": req.query.modelDetail
    }
    TCApi(req).updateModel(data, res.endj);
})

router.get('/checkModelPermission', function(req, res) {
        var data = {
            "modelId": Util.toInt(req.query.modelId)
        }
        TCApi(req).checkModelPermission(data, res.endj);
    })
    //end

router.get('/getdatatypedir', function(req, res) {
    TCApi(req).getDataTypeDir(res.endj);
});

router.get('/getdatatype', function(req, res) {
    TCApi(req).getDataType(res.endj);
});


router.get('/getdatatypequeryconfig', function(req, res) {
    SQApi(req).getDataTypeQueryConfig({
            'centerCode': req.query.centerCode,
            'zoneId': Util.toInt(req.query.zoneId),
            'typeId': Util.toInt(req.query.typeId)
        }).then(function(rsp) {
            var result = rsp.data;
            _.each(result, function(field) {
                field.fieldType = field.fieldType.toLowerCase();
            });
            res.endj({
                code: 0,
                data: result
            })
        })
        .catch(res.endj);
});

router.get('/dnsip', function(req, res) {
    dns.lookup(req.query.dnsFind,{ all : !0 }, function(err, addresses) {
        if (err) throw err;
        var index = Math.floor(Math.random() * addresses.length);
        res.endj({
            code: 0,
            data: addresses[index].address
        })
    })
})
router.post('/updatedatatypequeryconfig', function(req, res) {
    TCApi(req).updateDataTypeQueryConfig({
        'centerCode': req.query.centerCode,
        'zoneId': Util.toInt(req.query.zoneId),
        'dataTypeId': Util.toInt(req.query.dataTypeId),
        'config': req.query.config
    }, res.endj)
});
router.get('/submitintelligentquery', function(req, res) {
    var data = {
        "name": req.query.name,
        "mode": Util.toInt(req.query.mode),
        "taskType": Util.toInt(req.query.taskType),
        "priority": Util.toInt(req.query.priority),
        "taskDetail": req.query.taskDetail
    };

    if (req.query.dirId != undefined) {
        data["dirId"] = Util.toInt(req.query.dirId);
    };

    TCApi(req).submitTask(data).then(function(rsp) {


        var datas = [{
            Type: 'KEYWORD',
            Content: '详情:' + JSON.stringify(req.query.taskDetail)
        }]

        var common = {
            HostIP: req.generalArgument.ip,
            HostMAC: '',
            UserID: req.generalArgument.loginName,
            Domain: '',
            OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            SysID: appConfig['systemID'],
            Vender: '1',
            ModuleID: '205',
            ModuleName: '离线分析',
            EventType: '4013',
            EventTypeDes: '离线分析',
            Detail: req.generalArgument.loginName + '在' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '提交专项查询',
            Result: '0'
        }

        var TaskFetch = [{
            TaskID: rsp.data,
            FTaskID: -1,

            SpyTime: {
                Begin: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                End: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            },
            Datas: datas
        }]

        var auditInfo = {}
        auditInfo.Common = common;
        auditInfo.TaskFetch = TaskFetch;
        var promises = [];
        promises.push(LogApi(req).recordLog({
            moduleType: 205,
            operationType: 10,
            content: req.query.condStr,
            detailType: 1,
            detailId: rsp.data,
            AuditInfo: auditInfo
        }));

        Q.all(promises).then(function(rsp2) {
            res.endj({
                code: 0,
                data: {
                    taskId: rsp.data,
                    queryType: 1
                }
            });
        }).catch(function() {
            res.endj({
                code: 0,
                message: "记录日志失败",
                data: rsp.data
            });
        });
    }).catch(res.endj);
});

router.get('/previewNodeData', function(req, res) {
    TCApi(req).previewNodeData({
        centerCode: req.query.centerCode,
        typeId: req.query.typeId,
        zoneId: req.query.zoneId,
        length: req.query.length,
        queryArea: req.query.queryArea
    }, res.endj);
});

router.get('/getintelligentqueryresult', function(req, res) {
    var data = {
        "taskId": Util.toInt(req.query.taskId),
        "needMeta": req.query.needMeta,
        "startIndex": Util.toInt(req.query.startIndex),
        "length": Util.toInt(req.query.length),
    };
    TCApi(req).getResult(data, res.endj);
});

router.get('/saveintelligentqueryresult', function(req, res) {
    TCApi(req).saveTask({
        "taskId": Util.toInt(req.query.taskId),
        "dirId": Util.toInt(req.query.dirId),
        "taskName": req.query.taskName,
        "taskDesc": req.query.taskDesc
    }, res.endj);
});

router.get('/saveCustomQueryModel', function(req, res) {
    SQApi(req).saveCustomQueryModel({
        centerCode: req.query.centerCode,
        zoneId: Util.toInt(req.query.zoneId),
        typeId: Util.toInt(req.query.typeId)
    }, res.endj);
});

router.get('/deleteCustomQueryModel', function(req, res) {
    SQApi(req).deleteCustomQueryModel({
        centerCode: req.query.centerCode,
        zoneId: Util.toInt(req.query.zoneId),
        typeId: Util.toInt(req.query.typeId)
    }, res.endj);
});

router.get('/getCustomQueryModel', function(req, res) {
    SQApi(req).getCustomQueryModel(res.endj);
});


router.get('/getCodeTable', function(req, res) {
    TCApi(req).getCodeTable({
        fieldName: req.query.fieldName,
        typeId: Util.toInt(req.query.typeId),
        queryWord: req.query.queryWord
    }, res.endj);
});

router.get('/getCodeTableByCode', function(req, res) {
    TCApi(req).getCodeTableByCode({
        fieldName: req.query.fieldName,
        typeId: Util.toInt(req.query.typeId),
        code: req.query.code
    }, res.endj);
});


router.get('/getDataTypeTree', function(req, res) {

    TCApi(req).getDataTypeDir().then(function(rsp) {
            // department list -> tree
            var list = rsp.data;
            var idmap = {};
            var result = [];
            _.each(list, function(dir) {
                idmap[dir.dirId] = dir;
                dir.folder = true;
                dir.title = dir.dirName;
                dir.lazy = false;
            });

            _.each(list, function(dir) {
                if (dir.parentId == -1 && dir.dirId != -1) {
                    result.push(dir);
                } else {
                    var parent = idmap[dir.parentId];
                    if (parent) {
                        parent.children = parent.children || [];
                        parent.children.push(dir);
                        //parent.folder = true;
                        // parent.hideCheckbox = true;
                    } else {
                        result.push(dir);
                    }

                }
            });

            var datatypeList = [];
            TCApi(req).getDataType().then(function(rsp2) {
                datatypeList = rsp2.data;
                var datatypeMap = {};
                _.each(datatypeList, function(datatype) {
                    datatypeMap[datatype.typeId] = datatype;
                    datatype.folder = false;
                    datatype.title = datatype.caption;
                });

                _.each(datatypeList, function(datatype) {
                    var parent = idmap[datatype.dirId];
                    if (parent) {
                        parent.children = parent.children || [];
                        parent.children.push(datatype);
                    } else {
                        result.push(datatype);
                    }
                });

                res.endj({
                    code: 0,
                    data: result
                })
            });


        })
        .catch(res.endj);
});


router.get('/getTaskInfo', function(req, res) {
    var data = {
        taskId: Util.toInt(req.query.taskId)
    };
    TCApi(req).getTaskDetailByTaskId(data, function(rsp) {
        res.endj(rsp);
    });
});

var conds = [];

router.get('/getTaskCondition', function(req, res) {
    var data = {
        taskId: Util.toInt(req.query.taskId)
    };
    TCApi(req).getTaskDetailByTaskId(data).then(function(rsp) {
        if (rsp.data.cond && rsp.data.cond.children) {
            var condition = rsp.data.cond.children;
            conds = [];
            getConds(condition);
            res.endj({
                code: 0,
                data: conds
            });
        } else {
            res.endj({
                code: 0,
                data: []
            });
        }
    }).catch(res.endj);
});

function getConds(condition) {
    if (condition == null || condition.length == 0) {
        return;
    }
    _.each(condition, function(cond) {
        if (cond.composite == false || cond.composite == "false") {
            conds.push(cond);
        } else {
            getConds(cond.children);
        }
    })
}


router.get('/getDataTypeColDef', function(req, res) {
    SQApi(req).getDataTypeColDef({
        typeId: Util.toInt(req.query.typeId),
        centerCode: req.query.centerCode,
        zoneId: Util.toInt(req.query.zoneId),
        isWithFavor: Util.toInt(req.query.isWithFavor)
    }, res.endj);
});

router.get('/getStatisticResult', function(req, res) {
    SQApi(req).getStatisticResult({
        typeId: req.query.typeId
    }, res.endj);
});


router.post('/saveStatisticPattern', function(req, res) {
    SQApi(req).saveStatisticPattern({
        typeId: Util.toInt(req.query.typeId),
        patternName: req.query.patternName,
        aggregateInfos: req.query.aggregateInfos,
        meta: req.query.meta
    }, res.endj);
});

router.get('/delStatisticPattern', function(req, res) {
    SQApi(req).delStatisticPattern({
        patternId: req.query.patternId
    }, res.endj);
});

router.post('/updateStatisticPattern', function(req, res) {
    SQApi(req).updateStatisticPattern({
        typeId: Util.toInt(req.query.typeId),
        patternId: req.query.patternId,
        patternName: req.query.patternName,
        aggregateInfos: req.query.aggregateInfos,
        meta: req.query.meta
    }, res.endj);
});

router.get('/getStatisticPatternById', function(req, res) {
    SQApi(req).getStatisticPatternById({
        typeId: Util.toInt(req.query.typeId),
        patternId: req.query.patternId
    }, res.endj);
});

router.get('/getAggregateFunc', function(req, res) {
    SQApi(req).getAggregateFunc({
        type: req.query.type
    }, res.endj);
});

router.get('/getfilepath', function(req, res) {

    var data = {
        fileName: req.query.filename,
        fileId: req.query.filename
    };
    udpCephApi(req).downloadFile(data, function(rsp) {
        res.endj(rsp);
    });
});

router.post('/batchgetfilepath', function(req, res) {

    var fileInfo = {};
    fileInfo.fileInfo = req.query.fileInfo;
    udpCephApi(req).batchDownloadFile(fileInfo, function(rsp) {
        res.endj(rsp);
    });
});

router.post('/getResultFile', function(req, res) {

    var data = {};
    data.taskId = req.query.taskId;
    data.limit = req.query.limit;
    data.format = req.query.format;
    TCApi(req).getResultFile(data, res.endj);
});

var conExport = 1;
router.post('/newExport', function(req, res) {
    try {
        conExport = 1;
        var change = req.query.change;
        console.log(change);
        resText = {
            code: 0,
            message: "",
            data: 'change success'
        };
        res.endj(resText);
    } catch (e) {
        resText = {
            code: 1,
            message: e,
            data: 'change fail'
        };
        res.endj(resText);
    }
})
router.post('/exportExcel', function(req, res) {
    try {
        var exportExcel = {};
        var exportdata = [];
        exportExcel.dataset = req.query.dataset;
        exportExcel.columns = req.query.columns;
        exportExcel.taskId = req.query.taskId;
        var nowTaskId = req.query.taskId;
        if (conExport == 0) {
            var list = xlsx.parse('mysheet.xlsx');
            var finalData = list[0].data;
            for (var i = 0; i < exportExcel.dataset.length; i++) {
                exportdata[i] = [];
                for (var j in exportExcel.dataset[i]) {
                    exportdata[i].push(exportExcel.dataset[i][j]);
                }
                finalData.push(exportdata[i]);
            }

            var buffer = xlsx.build([{
                name: "mySheetName",
                data: finalData
            }]);
            fs.writeFile('mysheet.xlsx', buffer);
        } else {
            exportdata[0] = [];
            for (var i = 0; i < exportExcel.columns.length; i++) {
                exportdata[0].push(exportExcel.columns[i].headertext);
            }
            for (var i = 1; i <= exportExcel.dataset.length; i++) {
                exportdata[i] = [];
                for (var j in exportExcel.dataset[i - 1]) {
                    exportdata[i].push(exportExcel.dataset[i - 1][j]);
                }
            }
            var buffer = xlsx.build([{
                name: "mySheetName",
                data: exportdata
            }]);

            fs.writeFileSync('mysheet.xlsx', buffer);
            conExport = 0;
        }
        console.log('导出结果数' + exportExcel.dataset.length);
        LogApi(req).recordLog({
            moduleType: 6,
            operationType: 9,
            content: '导出任务(' + req.query.taskId + ')结果记录' + exportExcel.dataset.length + '条',
            detailType: 0,
            detailId: req.query.taskId
        });

        resText = {
            code: 0,
            message: "",
            data: 'mysheet.xlsx'
        };
        res.endj(resText);
    } catch (e) {
        resText = {
            code: 1,
            message: e,
            data: ''
        };
        res.endj(resText);
    }
});
router.get('/excelDownloadFile', function(req, res) {
    console.log("download file, file url:" + req.url);
    var filePath = req.query.filePath;
    var fileName = req.query.fileName;
    res.download(filePath, fileName);
});

router.get('/getGisDataType', function(req, res) {
    SQApi(req).getGisDataType(res.endj);
});

router.get('/getGisQueryConfig', function(req, res) {
    var dataType = {};
    if (req.query.centerCode == 100000 && Util.toInt(req.query.zoneId) == 3) {
        dataType = {
            "centerCode": req.query.centerCode,
            "typeId": Util.toInt(req.query.srcTypeId)
        };
    } else {
        dataType = {
            "zoneId": Util.toInt(req.query.zoneId),
            "centerCode": req.query.centerCode,
            "typeId": Util.toInt(req.query.typeId)
        };
    }
    var data = {
        "taskDetail": {
            "dataType": dataType
        }
    };

    TCApi(req).getGisQueryConfig(data, res.endj);
});

router.get('/getStreamTaskDataTypes', function(req, res) {

    TCApi(req).getStreamTaskDataTypes({
        taskId: req.query.taskId
    }, res.endj);
});

var FAVOR_DIR = {
    datasource: '常用数据',
    operation: '常用组件'
};
router.get('/getdatasource', function(req, res) {
    var favorDataPromise = SQApi(req).getCustomQueryModel();
    var dataDirPromise = TCApi(req).getDataTypeDir();
    var dataTypePromise = TCApi(req).getDataType();
    Q.all([favorDataPromise, dataDirPromise, dataTypePromise]).spread(function(favorData, dirs, dataSource) {
        favorData = favorData.data;
        dirs = dirs.data;
        dataSource = dataSource.data;
        var sysIdmap = {};
        var personalIdmap = {};
        var result = {
            sysTree: [],
            personalTree: []
        };

        function findParent(dir, tree, idmap) {
            if (!idmap[dir.parentId]) {
                if (!_.contains(tree, dir)) {
                    tree.push(dir);
                }
            } else {
                var parent = idmap[dir.parentId];
                parent.children = parent.children || [];
                if (!_.contains(parent.children, dir)) {
                    parent.children.push(dir);
                    parent.folder = true;
                    findParent(parent, tree, idmap);
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
        });
        _.each(dataSource.sysData, function(data) {
            var dir = sysIdmap[data.dirId];
            if (dir) {
                dir.children = dir.children || [];
                data.title = data.caption;
                data.key = data.centerCode + '_' + data.zoneId + '_' + data.typeId;
                data.extraClasses = 'nv-data';
                if (data.category == 2) {
                    return;
                }
                dir.children.push(data);
                dir.folder = true;
                findParent(dir, result.sysTree, sysIdmap);
            }
        });
        _.each(dataSource.personalData, function(data) {
            var dir = personalIdmap[data.dirId];
            if (dir) {
                dir.children = dir.children || [];
                data.title = data.caption;
                data.key = data.centerCode + '_' + data.zoneId + '_' + data.typeId;
                data.extraClasses = 'nv-data';
                processModelingTask(data);

                //edit by hjw, filter unstructured data ,category = 2
                if (data.category == 2) {
                    return;
                }
                dir.children.push(data);
                dir.folder = true;
                findParent(dir, result.personalTree, personalIdmap);
            }
        });


        function processModelingTask(data) {
            if (data.taskType == 107) {
                data.lazy = true;
                data.extraClasses = "nv-dir";
                data.folder = true;
                data.hideCheckbox = true;
            }
        }

        var favorDir = {
            title: FAVOR_DIR.datasource,
            key: FAVOR_DIR.datasource,
            extraClasses: 'nv-dir',
            dirId: 1,
            parentId: -1,
            folder: true,
            hideCheckbox: true,
            children: [],
            expanded: true
        };
        favorDir.children = [];
        _.each(favorData, function(item) {
            var origData = findOriginData(item.typeId, _.union(dataSource.sysData, dataSource.personalData));
            if (origData) {
                var favorNode = _.extend({}, origData);
                favorNode.key = item.centerCode + '_' + item.zoneId + '_' + item.typeId + '_favored';
                favorNode.favored = true;
                favorNode.parentId = 1;
                favorNode.extraClasses = 'nv-data';
                processModelingTask(favorNode);
                favorNode.title = item.caption;
                favorDir.children.push(favorNode);
            }
        });

        result = _.union([favorDir], result.sysTree, result.personalTree);

        res.endj({
            code: 0,
            data: {
                tree: result,
                favoredDir: FAVOR_DIR.datasource
            }
        });
    }).catch(res.endj);
});

function findOriginData(typeId, origDataList) {
    return _.find(origDataList, function(data) {
        var rightOne = data.typeId == typeId;
        if (rightOne) {
            data.favored = true;
        }
        return rightOne;
    });
}

router.post('/gisPostQuery', function(req, res) {
    var reqData = req.query;
    var postData = {};
    for (var i in reqData) {
        console.log(reqData[i] instanceof Array);
        if (reqData[i] instanceof Array) {
            var key = i + '[]';
            postData[key] = reqData[i];
        } else {
            postData[i] = reqData[i];
        }
    }

    var options = {
        hostname: req.query.hostname,
        port: 8080,
        path: req.query.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };
    var pageStr = [];
    var size = 0;

    var req2 = http.request(options, function(rsp) {
        console.log(rsp.statusCode);

        rsp.on('data', function(data) {
            pageStr.push(data);
            size += data.length;
        })

        rsp.on('end', function() {
            var data = Buffer.concat(pageStr);
            res.end(data);
        });
    })
    req2.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req2.write(qs.stringify(postData));

    req2.end();
});

router.get('/getLayer', function(req, res) {
    var data = get({
        'hostname': 'gis-server',
        'path': '/GisService/enclosure/getRootDirectoryID',
        'userID': 511
    })
    console.log(data);
});

router.get('/gisGetQuery', function(req, res) {
    var reqData = req.query;

    var options = {
        hostname: req.query.hostname,
        port: req.query.port || 8080,
        path: req.query.path + '?' + qs.stringify(req.query),
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };
    var pageStr = [];
    var size = 0;
    var req2 = http.request(options, function(rsp) {
        rsp.on('data', function(data) {
            pageStr.push(data);
            size += data.length;
        })

        rsp.on('end', function() {
            var data = Buffer.concat(pageStr);
            res.end(data);
        });
    })

    req2.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });


    req2.end();
});

router.get('/get_gis_init_params', function(req, res) {
    res.endj(sysConfig.get_gis_params());
})


router.get('/tileMap', function(req, res) {
    var reqData = req.query;
    console.log(req.query)
    var options = {
        hostname: req.query.hostname,
        port: 8080,
        path: '/TileMapService/arcgis/rest/services/world/MapServer/tile/' + req.query.z + '/' + req.query.y + '/' + req.query.x + '.png',
        method: 'GET',

    };
    var pageStr = [];
    var size = 0;
    var req2 = http.get(options, function(rsp) {
        console.log(rsp.statusCode);

        rsp.on('data', function(data) {
            pageStr.push(data);
            size += data.length;
        })

        rsp.on('end', function() {
            res.writeHeader(200, {
                'ContentType': 'image/png',
                'Content-length': size
            });
            var data = Buffer.concat(pageStr);
            res.end(data);
        });
    })

    req2.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req2.end();
});


router.get('/getGisQuerySetting', function(req, res) {
    var data = {
        "centerCode": req.query.centerCode,
        "zoneId": Util.toInt(req.query.zoneId),
        "typeId": Util.toInt(req.query.typeId)
    };

    TCApi(req).getGisQueryConfig(data, res.endj);
});

router.all('/saveGisQueryConfig', function(req, res) {
    var data = {
        "centerCode": req.query.centerCode,
        "zoneId": Util.toInt(req.query.zoneId),
        "typeId": Util.toInt(req.query.typeId),
        "queryConfig": req.query.queryConfig
    };
    TCApi(req).saveGisQueryConfig(data, res.endj);
});


router.all('/delGisQueryConfig', function(req, res) {
    var data = {
        "centerCode": req.query.centerCode,
        "zoneId": Util.toInt(req.query.zoneId),
        "typeId": Util.toInt(req.query.typeId),
    };
    TCApi(req).delGisQueryConfig(data, res.endj);
});

router.all('/getCodeTableBatch', function(req, res) {
    var data = req.query.data;
    TCApi(req).getCodeTableBatch(data, res.endj);
});

router.get('/listdatasource', function(req, res) {
    TCApi(req).getDataTypeDir()
        .then(function(rsp) {
            var dirs = rsp.data;
            TCApi(req).getDataType()
                .then(function(rsp2) {
                    var datasource = rsp2.data;
                    var sysIdmap = {};
                    var personalIdmap = {};
                    var result = {
                        sysTree: [],
                        personalTree: []
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

                    function processModelingTask(data) {
                        if (data.taskType == 107) {
                            data.lazy = true;
                            data.extraClasses = "nv-dir";
                            data.folder = false;
                            data.hideCheckbox = true;
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
                    _.each(datasource.sysData, function(data) {
                        var dir = sysIdmap[data.dirId];
                        if (dir) {
                            dir.children = dir.children || [];
                            data.title = data.caption;
                            data.key = data.centerCode + data.typeId + data.zoneId;
                            data.extraClasses = 'nv-data';
                            dir.children.push(data);
                            dir.folder = true;
                            findParent(dir, result.sysTree, sysIdmap);
                        }
                    });
                    _.each(datasource.personalData, function(data) {
                        var dir = personalIdmap[data.dirId];
                        if (dir) {
                            console.log(data);
                            dir.children = dir.children || [];
                            data.title = data.caption;
                            data.key = data.centerCode + data.typeId + data.zoneId;
                            data.extraClasses = data.zoneId == 2 ? 'nv-data' : 'nv-task';
                            processModelingTask(data);
                            data.srcTypeId = data.srcTypeId;
                            if (data.extraClasses == 'nv-data') {
                                dir.children.push(data);
                            }
                            dir.folder = true;
                            findParent(dir, result.personalTree, personalIdmap);
                        }
                    });
                    res.endj({
                        code: 0,
                        data: result
                    });
                }).catch(res.endj);
        }).catch(res.endj);
});

router.get("/taskinfo", function(req, res) {
    TCApi(req).getStreamRunningInfo({
        taskId: Util.toInt(req.query.taskid),
        runToNode: req.query.runtonode
    }, res.endj);
});

router.get('/listmodelingtask', function(req, res) {
    TCApi(req).getStreamTaskDataTypes({
        taskId: Util.toInt(req.query.taskId)
    }).then(function(rsp) {
        var tasks = rsp.data.streamTaskData;
        var result = [];
        _.each(tasks, function(data) {
            data.title = data.caption;
            data.key = data.centerCode + data.typeId + data.zoneId;
            data.extraClasses = 'nv-data';
            result.push(data);
        })
        res.endj(result);
    }).catch(res.endj);
});
//end


module.exports = router;