var router = require('express').Router();
var soap = require('soap');
var DIRApi = require('../jws/tag');
var Util = require('../utils/util');
var _ = require('underscore');
var fs = require('fs');
var multiparty = require('multiparty');
var appConfig = require('../../../config/config.js');
var moment = require('moment');
// var staticData = require('../src/js/module/tag/datatables-res-data.json');

//test code,don't remove
router.get('/getdatatablesdata', function(req, res) {
    var returnData = {};
    returnData.draw = req.query.draw;
    returnData.code = staticData.code;
    returnData.message = staticData.message;
    returnData.recordsTotal = 800;
    returnData.recordsFiltered = 800;
    returnData.data = staticData.data;
    res.end(JSON.stringify(returnData));

});

router.get('/getCategary', function(req, res) {
    DIRApi(req).getCategary(res.endj);
});

router.get('/queryDataTagInfo', function(req, res) {
    var args = {
        'key': req.query.search['value'] || '',
        'categary1': req.query.categary1 || '',
        'categary2': req.query.categary2 || '',
        'position': Util.toInt(req.query.start),
        'size': Util.toInt(req.query.length),
    };



    DIRApi(req).queryDataTagInfo(args).then(function(rsp) {
        var recordsTotal, recordsFiltered;
        if (rsp.code == 0 || rsp.code == null) {
            recordsTotal = rsp.data.totalCount;
            recordsFiltered = rsp.data.totalCount;
        }
        res.endj({
            code: rsp.code,
            data: rsp.data,
            message: rsp.message,
            recordsTotal: recordsTotal || '',
            recordsFiltered: recordsFiltered || '',
            draw: Util.toInt(req.query.draw),
        });
    });

});

router.post('/addCategary', function(req, res) {
    DIRApi(req).addCategary({
        'categary1': req.query.categary1,
        'categary2': req.query.categary2
    }, res.endj);
});

router.post('/addDataTag', function(req, res) {
    var data = {
        'tagName': req.query.tagName,
        'tagDisplayName': req.query.tagDisplayName,
        'tagType': req.query.tagType,
        'categary1': req.query.categary1,
        'categary2': req.query.categary2,
        'remark': req.query.remark
    };
    //edit by huangjingwei,add auditInfo
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '460',
        ModuleName: '标签元数据管理',
        EventType: '28',
        EventTypeDes: '新增标签',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 新增标签(' + ('/' + data.categary1) + ('/' + data.categary2) + (data.tagDisplayName || '') + ')',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;


    DIRApi(req).addDataTag(data, res.endj);
});

router.get('/getImportTaskInfo', function(req, res) {
    var args = {
        'position': Util.toInt(req.query.start),
        'size': Util.toInt(req.query.length)
    };
    DIRApi(req).getImportTaskInfo(args).then(function(rsp) {
        var recordsTotal, recordsFiltered;
        var emptyArray = [];
        if (rsp.code == 0 || rsp.code == null) {
            recordsTotal = rsp.data.totalCount;
            recordsFiltered = rsp.data.totalCount;
        }

        //防止服务传来的值有属性丢失
        
        _.each(rsp.data.tasks,function(t){
            t.remark = t.remark || '';
            t.dataTagType = t.dataTagType || '';
            t.entityNum = t.entityNum || '';
            t.entityType = t.entityType || '';
            t.importTime = t.importTime || '';
            t.taskId = t.taskId || -1;
            t.taskName = t.taskName || '';
            t.taskStatus = t.taskStatus || '';
            t.userId = t.userId || '';

        }) 

        res.endj({
            code: rsp.code,
            data: rsp.data,
            message: rsp.message,
            recordsTotal: recordsTotal || '',
            recordsFiltered: recordsFiltered || '',
            draw: Util.toInt(req.query.draw),
        });
    });
});

router.post('/createImportTask', function(req, res) {
    var typeList = [];
    _.each(req.query.head.dataTagTypeList, function(e) {
        typeList.push(Util.toInt(e));
    })

    var head = {
        'createTime': req.query.head.createTime,
        'dataSource': Util.toInt(req.query.head.dataSource),
        'dataTagTypeList': typeList,
        'dataTagNameList': req.query.head.dataTagNameList,
        'emptyValueList': req.query.head.emptyValueList || [""],
        'delimeter': req.query.head.delimeter,
        'entityNum': Util.toInt(req.query.head.entityNum),
        'entityTypeId': Util.toInt(req.query.head.entityTypeId),
        'entityType': req.query.head.entityType
    };
    // console.log(req.query.head);
    // console.log(head);
    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '461',
        ModuleName: '标签导入',
        EventType: '29',
        EventTypeDes: '导入标签',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 导入标签,任务名(' + (req.query.taskName || '') + ')',
        Result: '0'
    }

    var args = {
        'taskName': req.query.taskName,
        'remark': req.query.remark,
        'filePath': req.query.filePath,
        'head': head
    };

    var auditInfo = {}
    auditInfo.Common = common;
    args.AuditInfo = auditInfo;

    DIRApi(req).createImportTask(args, res.endj);
});

router.get('/getCategaryTree', function(req, res) {
    var useCase = req.query.useCase || null;

    DIRApi(req).getCategary().then(function(rsp) {
        var result = [];
        var data = rsp.data.categarys
        var group = _.groupBy(data, 'categary1');

        for (var item in group) {
            treeNode = {};
            treeNode.title = item;
            treeNode.folder = true;
            treeNode.children = [];
            treeNode.extraClasses = 'hasmenu first-level-category';
            var lazy = true;
            if (useCase == 'tagManage' || useCase == 'tagManageDialogTree') {
                lazy = false;
            }
            _.each(group[item], function(gi) {
                treeNode.children.push({
                    categary2: gi.categary2,
                    title: gi.categary2,
                    categaryId: gi.categaryId,
                    folder: true,
                    lazy: lazy,
                    extraClasses: 'hasmenu',
                });

            })
            result.push(treeNode);
        }
        if (useCase == 'tagManage') {
            var rootNode = {};
            rootNode.title = "标签类别";
            rootNode.folder = true;
            rootNode.expanded = true;
            rootNode.children = [];
            for (var i = 0; i < result.length; i++) {
                rootNode.children.push(result[i]);
            }
            result = [];
            result.push(rootNode);
        }



        res.endj({
            code: 0,
            data: result
        });

    }).catch(res.endj);;
});

router.get('/queryTags', function(req, res) {
    var args = {
        'key': req.query.value || '',
        'categary1': req.query.categary1 || '',
        'categary2': req.query.categary2 || '',
        'position': Util.toInt(req.query.start),
        'size': Util.toInt(req.query.length),
    };
    DIRApi(req).queryDataTagInfo(args).then(function(rsp) {
        var result = [];
        var data = rsp.data.tags;
        _.each(data, function(item) {
            treeNode = {};
            treeNode.title = item.tagDisplayName;
            treeNode.folder = false;
            treeNode.tagId = item.tagId;
            treeNode.tagName = item.tagName;
            treeNode.tagType = item.tagType;
            treeNode.children = [];
            result.push(treeNode);
        })
        res.endj({
            code: 0,
            data: result
        });
    }).catch(res.endj);
});


router.get('/getEntityType', function(req, res) {
    var useCase = req.query.useCase;

    DIRApi(req).getEntityType().then(function(rsp) {
        var result = [];
        var data = rsp.data.entityTypes

        treeNode = {};
        treeNode.title = '实体类型';
        treeNode.folder = true;
        treeNode.children = [];
        treeNode.extraClasses = 'hasmenu';
        _.each(data, function(gi) {
            treeNode.children.push({
                id: gi.entityTypeId,
                title: gi.entityTypeName,
                folder: false,
            });
        })
        result.push(treeNode);

        res.endj({
            code: 0,
            data: result
        });

    }).catch(res.endj);;
});

router.get('/submitPersonSearch', function(req, res) {
    var data = {
        keyword: req.query.keyword,
        dataTag: req.query.dataTag
    };


    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '201',
        ModuleName: '人立方',
        EventType: '3017',
        EventTypeDes: '人立方',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 人立方查询(模糊(' + (data.keyword || '') + '))',
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    data.AuditInfo = auditInfo;

    DIRApi(req).submitPersonSearch(data, res.endj);
})

router.get('/submitTagSearch', function(req, res) {
    var args = {
        keyword: req.query.keyword,
        dataTag: req.query.dataTag
    };

    //edit by huangjingwei,add auditInfo

    var dataTagString = '';
    if (args.dataTag) {
        for (var i = 0; i < args.dataTag.length; i++) {
            dataTagString += args.dataTag[i].typeName;
            dataTagString += '(';
            for (var j = 0; j < args.dataTag[i].valueList.length; j++) {
                dataTagString += args.dataTag[i].valueList[j];
                if (j != args.dataTag[i].valueList.length - 1) {
                    dataTagString += ','
                }
            }
            dataTagString += ')\n';
        }
    }
    if (dataTagString == '') {
        dataTagString = '无'
    }

    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '207',
        ModuleName: '标签筛选',
        EventType: '30',
        EventTypeDes: '筛选标签',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 筛选标签,\n关键字(' + (args.keyword || '') + '),\n筛选标签:\n' + dataTagString,
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    args.AuditInfo = auditInfo;

    DIRApi(req).submitTagSearch(args, res.endj);
})

router.get('/getTagSearchResult', function(req, res) {
    DIRApi(req).getTagSearchResult({
        taskId: req.query.taskId,
        pos: req.query.pos,
        size: req.query.size
    }, res.endj);
})



router.get('/getFrequentTag', function(req, res) {
    DIRApi(req).getFrequentTag({
        'size': Util.toInt(req.query.size)
    }, res.endj);
});
router.get('/getFrequentTagStat', function(req, res) {
    if (req.query.taskId == undefined) {
        result = [{
            title: '暂无数据',
            isLeaf: true
        }];
        res.endj({
            code: 0,
            data: result
        });
    } else {
        DIRApi(req).getFrequentTagStat({
            'taskId': req.query.taskId
        }).then(function(rsp) {
            var result = [];
            var data = rsp.data.stat;
            // console.log(data);

            var ftags = req.query.frequentTags;
            // console.log(ftags);
            //pass in JSON string,need to transfer here
            var obj = JSON.parse(ftags);
            for (var i = 0; i < data.length; i++) {

                var ftag = _.find(obj, function(t) {
                    return t.typeId == data[i].typeId;
                });
                if (ftag) {
                    // console.log(ftag);
                    var children = [];
                    for (var j = 0; j < ftag.valueList.length; j++) {
                        children.push({
                            title: ftag.valueList[j] + '(' + data[i].sizeList[j] + ')',
                            isLeaf: true,
                            tagValue: ftag.valueList[j],
                            tagShoot: data[i].sizeList[j],
                            tagId: ftag.typeId,
                            tagName: ftag.typeName,
                            tagType: ftag.valueType
                        });
                    }
                    var stat = 0;
                    for (var k = 0; k < data[i].sizeList.length; k++) {
                        stat += data[i].sizeList[k];
                    }
                    var treeNode = {
                        title: ftag.typeName,
                        isLeaf: false,
                        children: children,
                        tagType: ftag.valueType,
                        tagId: ftag.typeId,
                        tagStat: stat
                    };

                    result.push(treeNode);
                }

            }
            res.endj({
                code: 0,
                data: result
            });
        }).catch(res.endj);
    }

});


router.post('/submitTagSearch', function(req, res) {
    var args = {
        'keyword': req.query.keyword,
        'dataTag': req.query.dataTag,
    };

    //edit by huangjingwei,add auditInfo

    var dataTagString = '';
    if (args.dataTag) {
        for (var i = 0; i < args.dataTag.length; i++) {
            dataTagString += args.dataTag[i].typeName;
            dataTagString += '(';
            for (var j = 0; j < args.dataTag[i].valueList.length; j++) {
                dataTagString += args.dataTag[i].valueList[j];
                if (j != args.dataTag[i].valueList.length - 1) {
                    dataTagString += ','
                }
            }
            dataTagString += ')\n';
        }
    }
    if (dataTagString == '') {
        dataTagString = '无'
    }

    var common = {
        HostIP: req.generalArgument.ip,
        HostMAC: '',
        UserID: req.generalArgument.loginName,
        Domain: '',
        OccurTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        SysID: appConfig['systemID'],
        Vender: '1',
        ModuleID: '207',
        ModuleName: '标签筛选',
        EventType: '30',
        EventTypeDes: '筛选标签',
        Detail: req.generalArgument.loginName + '在(' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + ') 使用IP(' + req.generalArgument.ip + ') 筛选标签,\n关键字(' + (args.keyword || '') + '),\n筛选标签:\n' + dataTagString,
        Result: '0'
    }

    var auditInfo = {}
    auditInfo.Common = common;
    args.AuditInfo = auditInfo;
    DIRApi(req).submitTagSearch(args, res.endj);
});

router.get('/getTagSearchResult', function(req, res) {
    DIRApi(req).getTagSearchResult({
        'taskId': req.query.taskId,
        'pos': req.query.pos,
        'size': req.query.size,
    }, res.endj);
});

router.get('/getTagTree', function(req, res) {
    DIRApi(req).getTagTree().then(function(rsp) {
        var result = [];
        var data = rsp.data.tagTree;

        var group = _.groupBy(data, function(t) {
            return t.categary1.name;
        });

        for (var item in group) {
            treeNode = {};
            treeNode.title = item;
            treeNode.folder = true;
            treeNode.children = [];
            treeNode.extraClasses = '';
            _.each(group[item], function(gi) {
                _.each(gi.categary1.categary2, function(child) {
                    // console.log(child);
                    var children2 = [];
                    _.each(child.children, function(child2) {
                        var ch2 = {
                            folder: false,
                            title: child2.tagDisplayName,
                            extraClasses: '',
                            tagType: child2.tagType,
                            tagId: child2.tagId,
                            tagName: child2.tagName
                        };
                        children2.push(ch2);
                    });
                    var ch = {
                        folder: true,
                        title: child.name,
                        extraClasses: '',
                        children: children2
                    };
                    treeNode.children.push(ch);
                });

            })
            result.push(treeNode);
        }
        res.endj({
            code: 0,
            data: result
        });
    }).catch(res.endj);
});

router.get('/getTagValueList', function(req, res) {
    DIRApi(req).getTagValueList({
        'typeId': req.query.typeId,
    }, res.endj);
});


router.get('/makeDirSync', function(req, res) {
    var baseDir = '/tmp/tagImport'
    if (!fs.existsSync('/tmp')) {
        fs.mkdirSync('/tmp');
        console.log('Make dir /tmp');
    }
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
        console.log('Make dir ' + baseDir);
    }
    res.end(baseDir);
})

router.post('/uploadFile', function(req, res) {
    uploadDir = req.query.uploadDir;
    if (!fs.existsSync(uploadDir)) {
        console.log("upload file dir not exists!");
        return;
    }
    var form = new multiparty.Form({
        uploadDir: uploadDir
    });
    form.parse(req, function(err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        if (err) {
            console.log('parse error: ' + err);
        } else {
            var file = JSON.parse(filesTmp);
            var uploadedPath = file.file[0].path;
            var newFileNameBASE64 = new Buffer(file.file[0].originalFilename).toString('base64');
            var urlSafe = newFileNameBASE64.replace('/', '_')
            var newName = uuid(14) + '#' + urlSafe;
            var dstPath = uploadDir + '/' + newName;
            fs.rename(uploadedPath, dstPath, function(err) {
                if (err) {
                    console.log('rename error: ' + err);
                } else {
                    res.writeHead(200, {
                        'content-type': 'text/plain;charset=utf-8'
                    });
                    resText = {
                        newName: newName,
                        fileSize: file.file[0].size,
                        srcFileDir: uploadDir
                    };
                    res.write(JSON.stringify(resText));
                    res.end();
                }
            });
        }
    });
});

function uuid(len) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
        i;
    if (len) {
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * 62];
        }
    } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 62;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}


module.exports = router;