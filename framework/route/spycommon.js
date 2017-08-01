var router = require('express').Router();
var Util = require('../utils/util');
var _ = require('underscore');
var Q = require('q');
var fs = require('fs');
var multiparty = require('multiparty');
var BusinessCommon = require('../jws/businesscommon');
var BusinessLib = require('../jws/businesslib');
var RoleApi = require('../jws/role');
/*var wfApi = require('../jws/workflow');*/
var BusinessLibDesign = require('../jws/businesslibdesign');
var DIApi = require('../jws/dataimport');
var UMSApi = require('../jws/ums');

router.get('/shareRecord', function (req, res) {
    BusinessCommon(req).passRoundRecord(req.query, res.endj);
});

//附件上传接口 begin
router.all('/checkUploadResult', function (req, res) {
    console.log('checkUploadResult:' + req.query.fileName);
    DIApi(req).CheckUploadResult({
        'fileName': req.query.fileName
    }, res.endj);
});

router.all('/getLocalImg', function (req, res) {
    var filePath = req.query.path;
    fs.readFile(filePath, 'base64', function (err, file) {
        if (err) {
            console.log(err);
            return;
        } else {
            var bitmap = new Buffer(file, 'base64');
            // console.log(rsp.data);
            res.setHeader('ContentType', 'image/jpg');
            res.end(bitmap);
        }
    });
});

router.all('/moveFileToUploadDir', function (req, res) {
    try {
        if (!fs.existsSync('/data')) {
            fs.mkdirSync('/data');
        }
        if (!fs.existsSync('/data/personaldata')) {
            fs.mkdirSync('/data/personaldata');
        }
        if (!fs.existsSync('/data/udp_upload/')) {
            fs.mkdirSync('/data/udp_upload/');
        }
        if (!fs.existsSync(req.query.uploadDir)) {
            fs.mkdirSync(req.query.uploadDir);
        }
        var originalFilenameSuf = getFileExt(req.query.oldFileName);
        var newName = req.query.newFileName.split('.')[0] + '.' + originalFilenameSuf;
        var uploadedPath = '/data/tmp/' + newName;
        var dstPath = req.query.uploadDir + newName;
        console.log("----" + uploadedPath + "---" + dstPath);
        fs.rename(uploadedPath, dstPath, function (err) {
            if (err) {
                console.log('rename error: ' + err);
                resText = {
                    code: 3,
                    message: "失败",
                    data: []
                };
                fs.unlinkSync('/data/tmp/' + newName);
                res.endj(resText);
            }
            else {
                console.log('moveFileToUploadDir', dstPath + "success");
                resText = {
                    code: 0,
                    message: ""
                };
                res.endj(resText);
            }
        });

    } catch (e) {
        console.log('moveFileToUploadDir', e);
        resText = {
            code: 3,
            message: e,
            data: ""
        };
        res.endj(resText);
    }
});

router.all('/uploadFileRegist', function (req, res) {
    DIApi(req).UploadFileRegist({
        "uploadFiles": JSON.parse(req.query.uploadFiles) || []
    }, res.endj);
});

router.all('/uploadFile', function (req, res) {
    var uploadDir = req.query.uploadDir;

    console.log("uploadDir:", uploadDir);
    if (!fs.existsSync('/data')) {
        fs.mkdirSync('/data');
    }
    if (!fs.existsSync('/data/tmp/')) {
        fs.mkdirSync('/data/tmp/');
    }
    var personalDir = '/data/tmp';
    if (!fs.existsSync(personalDir)) {
        fs.mkdirSync(personalDir);
    }
    var form = new multiparty.Form({
        uploadDir: '/data/tmp/'
    });
    form.parse(req, function (err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        if (err) {
            console.log('parse error: ' + err);
        }
        else {
            var file = JSON.parse(filesTmp);
            var uploadedPath = file.file[0].path;
            var originalFilenameSuf = getFileExt(file.file[0].originalFilename);
            var newName = uuid(14, 16) + '.' + originalFilenameSuf;
            var dstPath = personalDir + '/' + newName;
            console.log("---" + uploadedPath + "---" + dstPath);
            fs.rename(uploadedPath, dstPath, function (err) {
                if (err) {
                    console.log('rename error: ' + err);
                }
                else {
                    // newName = newName.split('.')[0] + '.' + 'txt';
                    resText = {
                        oldName: file.file[0].originalFilename,
                        newName: newName,
                        tmpNewName: newName.split('.')[0] + '.' + originalFilenameSuf,
                        fileSize: file.file[0].size,
                        dstPath: uploadedPath,
                        fileType: originalFilenameSuf
                    };
                    console.log(resText);
                    res.write(JSON.stringify(resText));
                    res.end();
                }
            });
        }
    });
});

function getFileExt(str) {
    var d = str.replace(/^.+\./, "");
    return d;
}

function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    if (len) {
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix];
        }
    }
    else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}
//附件上传接口 end

// 获取进展信息 begin
router.get('/getProgressInfo', function (req, res) {
    var tmpData = JSON.parse(req.query.data);
    BusinessCommon(req).getProgressInfo(tmpData, res.endj);
});
//获取进展信息 end

//表单服务 begin
router.get('/getFieldIdAndFieldNameMap', function (req, res) {
    BusinessLib(req).getFieldIdAndFieldNameMap(req.query, res.endj);
});

router.get('/getCodeTable', function (req, res) {
    console.log(req.query);
    BusinessLib(req).getCodeTable(req.query, res.endj);
});
//表单服务 end

//侦办资料 begin
router.get('/getTableListConstruct', function (req, res) {
    console.log(req.query);
    BusinessCommon(req).getTableListConstruct(req.query, res.endj);
});

router.post('/insertTableRecord', function (req, res) {
    var tmpData = JSON.parse(req.query.data);
    console.log(tmpData);
    BusinessCommon(req).insertTableRecord({
        targetId: req.query.targetId,
        data: tmpData,
    }, res.endj);
});

router.post('/updateTableRecord', function (req, res) {
    console.log(req.query);
    BusinessCommon(req).updateTableRecord({
        targetId: req.query.targetId,
        data: JSON.parse(req.query.data),
    }, res.endj);
});

router.get('/getAllUsedLabel', function (req, res) {
    console.log(req.query);
    BusinessCommon(req).getAllUsedLabel(req.query, res.endj);
});

router.get('/getTableListByLabel', function (req, res) {
    console.log(req.query);
    BusinessCommon(req).getTableListByLabel(req.query, res.endj);
});
router.get('/deleteRecords', function (req, res) {
    console.log(req.query);
    BusinessCommon(req).deleteRecords(req.query, res.endj);
});

router.get('/getTblRecordList', function (req, res) {
    console.log(req.query);
    BusinessCommon(req).getTblRecordList(req.query, res.endj);
});

router.get('/getYWTableQueryListConstruct', function (req, res) {
    var data = {
        moduleId: req.query.moduleId,
        tableType: req.query.tableType
    }
    console.log(data);
    BusinessCommon(req).getYWTableQueryListConstruct(data, res.endj);
});

router.get('/getClassifiedTblType', function (req, res) {
    var data = {
        moduleId: req.query.moduleId
    }
    console.log(data);
    BusinessCommon(req).getClassifiedTableType(data, res.endj);
});
//侦办资料 end

router.post('/saveTableDetail', function (req, res) {
    console.log(req.query);
    var data = JSON.parse(req.query.data);
    if (data.recId <= 0)
        BusinessCommon(req).insertTableDetail(req.query, res.endj);
    else
        BusinessLib(req).updateTableDetail(req.query, res.endj);
});

router.get('/ConvertTableRecord', function (req, res) {
    BusinessLib(req).ConvertTableRecord(req.query, res.endj);
});

router.get('/getRecIdFromTargetId', function (req, res) {
    BusinessCommon(req).getRecIdFromTargetId(req.query, res.endj);
});

router.get('/getFlowDescFromData', function (req, res) {
    BusinessCommon(req).getRecordSummary(req.query, res.endj);
});

router.get('/targetCanDelete', function (req, res) {
    BusinessCommon(req).isTargetHasTableRecFlow(req.query, res.endj);
});

//数据授权 begin
router.get('/getTableResourcePermissionsByUserId', function (req, res) {
    BusinessCommon(req).getTableResourcePermissionsByUserId(req.query, res.endj);
});

router.get('/getModuleTableList', function (req, res) {
    BusinessCommon(req).getCustomizedTable(req.query, res.endj);
});

router.get('/getUsersTableAuthRecords', function (req, res) {
    BusinessCommon(req).getUsersRecordAuthority(req.query, res.endj);
});

router.get('/saveUsersTableAuthRecords', function (req, res) {
    BusinessCommon(req).updateUsersRecordAuthority(JSON.parse(req.query.data), res.endj);
});

router.get('/getDataAuthResource', function (req, res) {
    BusinessCommon(req).getTableRuleInfo().then(function (rsp) {
        RoleApi(req).getTableRuleResourceByRoleId({
            resourceType: 8,
            roleId: Util.toInt(req.query.roleId),
            data: rsp.data,
        }).then(function (rsp) {
            var list = rsp.data;
            var idmap = {};
            _.each(list, function (resource) {
                idmap[resource.id] = resource;
                resource.visable = false;
            });
            _.each(list, function (resource) {
                if (resource.authable == 1 || resource.isDir == 1) {
                    resource.visable = true;
                    var iResouce = resource;
                    while (iResouce.parentId != -1) {
                        if (idmap[iResouce.parentId]) {
                            idmap[iResouce.parentId].visable = true;
                            iResouce = idmap[iResouce.parentId];
                        } else {
                            console.log(' 孤儿节点:');
                            console.log(iResouce.id);
                            break;
                        }
                    }
                }
            });

            var newList = [];
            _.each(list, function (resource) {
                if (resource.visable == true) {
                    resource.key = resource.id;
                    resource.title = resource.name;
                    resource.isDir = resource.isDir;
                    newList.push(resource);
                }
            });

            var newResult = [];
            _.each(newList, function (resource) {
                /*if (resource.authable != 1) {
                 resource.hideCheckbox = true;
                 }*/
                if (resource.included == 1) {
                    resource.selected = true;
                }
                if (resource.isDir == 1) {
                    resource.folder = true;
                }
                if (!idmap[resource.parentId]) {
                    newResult.push(resource);
                } else {
                    var parent = idmap[resource.parentId];
                    if (parent) {
                        parent.children = parent.children || [];
                        parent.children.push(resource);
                    }
                }
            });

            res.endj({
                code: 0,
                data: newResult
            });
        });
    }).catch(res.endj);
});

router.get('/addAuthResource', function (req, res) {
    RoleApi(req).addTableRuleResourceToRole(req.query, res.endj);
});

router.get('/removeAuthedResource', function (req, res) {
    RoleApi(req).removeTableRuleResourceFromRole(req.query, res.endj);
});

router.get('/getDistributionRecords', function (req, res) {
    BusinessCommon(req).getAllTablesRecords4Authority(req.query, res.endj);
});

router.get('/listalluser', function (req, res) {
    UMSApi(req).getDepartments()
        .then(function (rsp) {
            UMSApi(req).getUsers().then(function (rsp2) {
                // department list -> tree
                var departments = rsp.data;
                var idmap = {};

                _.each(departments, function (department) {
                    idmap[department.departmentId] = department;
                    department.key = "dep-"+department.departmentId;
                    department.lazy = false;
                    department.folder = false;
                });
                var users = rsp2.data;
                var result = [];

                _.each(departments, function (department) {
                    if (!idmap[department.parentDepartmentId]) {
                        result.push(department);
                    } else {
                        var parent = idmap[department.parentDepartmentId];
                        if (parent) {
                            parent.children = parent.children || [];
                            parent.children.push(department);
                            parent.folder = true;
                        } else {
                            console.log(department.departmentName);
                        }

                    }
                });

                var userPara = _.pluck(users, 'userId');

                RoleApi(req).getHasRoleTypeUsers({
                    user: userPara,
                    roleType: 0
                }).then(function (rsp) {
                    var newUsers = [];
                    hasRoleUsers = rsp.data;
                    _.each(users, function (user) {
                        if (_.contains(hasRoleUsers, user.userId) && user.userId != -1)
                            newUsers.push(user);
                    });
                    _.each(newUsers, function (user) {
                        user.key = 'user-'+ user.userId;
                        user.title = user.loginName;
                        user.userName = user.loginName;
                        user.description = user.position;
                        user.extraClasses = "nv-department-people";
                        var parent = idmap[user.departmentId];
                        if (parent) {
                            parent.children = parent.children || [];
                            parent.children.push(user);
                            parent.folder = true;
                        }
                    });
                    res.endj({
                        code: 0,
                        data: result
                    });
                }).catch(res.endj);
            }).catch(res.endj);
        }).catch(res.endj);
});
//数据授权 end

//公共标签服务 begin
router.get('/getRecordLabel', function (req, res) {
    var data = {
        tableType: req.query.tableId,
        recordId: req.query.recId,
    }
    console.log(data);
    BusinessCommon(req).getRecordLabel(data, res.endj);
});

router.get('/addLable', function (req, res) {
    var data = {
        tableId: req.query.tableId,
        recId: req.query.recId,
        labelId: req.query.labelIds
    }
    console.log(data);
    BusinessCommon(req).addRecordLabel(data, res.endj);
});

router.get('/removeLable', function (req, res) {
    var data = {
        tableId: req.query.tableId,
        recId: req.query.recId,
        labelId: req.query.labelIds
    }
    console.log(data);
    BusinessCommon(req).removeRecordLabel(data, res.endj);
});

router.get('/createLable', function (req, res) {
    var data = {
        label: req.query.label
    }
    BusinessCommon(req).createLabel(data, res.endj);
});

router.get('/getAllLable', function (req, res) {
    BusinessCommon(req).getAllLabel({}, res.endj);
});
//公共标签服务 end

//公共二维码服务 begin
router.get('/getQRCodeInput', function (req, res) {
    res.endj({
        code: 0,
        message: "",
        data: {
            mainTbl: {
                type: {
                    id: 1001,
                    name: "对象信息表"
                },
                fields: [{
                    fieldId: 1001,
                    fieldValue: "123"
                }, {
                    fieldId: 1002,
                    fieldValue: "123"
                }]
            },
            subTbl: {}
        }
    });
});
//公共二维码服务 end

//业务查询
router.get('/get4GModuleId', function (req, res) {
    BusinessCommon(req).get4GModuleId({}, res.endj);
});

router.get('/getYWTableQueryRecords', function (req, res) {
    var data = JSON.parse(req.query.condition);
    BusinessCommon(req).getYWTableQueryRecords(data, res.endj);
});


//码址查询相关
router.get('/getNumberQueryRecords', function (req, res) {
    var data = JSON.parse(req.query.condition);
    BusinessCommon(req).getNumberQueryRecords(data, res.endj);
});

router.get('/getNumberTableListConstruct', function (req, res) {
    var data = {
        moduleId: req.query.moduleId
    }
    BusinessCommon(req).getNumberTableListConstruct(data, res.endj);
});


router.get("/getNumberMetaInfo", function (req, res) {
    BusinessCommon(req).getNumberMetaInfo({}).then(function (rsp) {
        var codeArr = [];
        _.each(rsp.data.numberMetaInfos, function (k) {
            codeArr.push({
                id: k.typeId,
                text: k.dispName
            });
        });
        res.endj({
            code: rsp.code,
            message: rsp.message,
            data: codeArr
        })
    }).catch(res.endj);
});

router.get('/getNumberTableFieldCodeTable', function (req, res) {
    var data = {
        moduleId: req.query.moduleId,
        fieldId: req.query.fieldId
    }
    BusinessCommon(req).getNumberTableFieldCodeTable(data).then(function (rsp) {
        var codeArr = [];
        _.each(rsp.data.content, function (k) {
            codeArr.push({
                id: k.code,
                text: k.value
            });
        });
        res.endj({
            code: rsp.code,
            message: rsp.message,
            data: codeArr
        })
    }).catch(res.endj);
});

router.get('/getTableFieldCodeTable', function (req, res) {
    var data = {
        tableId: req.query.tableId,
        fieldId: req.query.fieldId
    }

    BusinessCommon(req).getTableFieldCodeTable(data).then(function (rsp) {
        var codeArr = [];
        _.each(rsp.data.content, function (k) {
            codeArr.push({
                id: k.code,
                text: k.value
            });
        });
        res.endj({
            code: rsp.code,
            message: rsp.message,
            data: codeArr
        })
    }).catch(res.endj);
});

//数据比对
router.get('/getRecordContrastResult', function (req, res) {
    var data = {
        moduleId: req.query.moduleId,
        tableId: req.query.tableId,
        mainTableData: JSON.parse(req.query.mainTableData)
    }
    BusinessCommon(req).getRecordContrastResult(data, res.endj);
});

router.get('/AddRecordAndContrastResult', function (req, res) {
    var sdata = {
        data: JSON.parse(req.query.data),
        ContrastResultRelate: JSON.parse(req.query.ContrastResultRelate)
    };
    BusinessCommon(req).AddRecordAndContrastResult(sdata, res.endj);
});

router.get("/getDataCanStartWorkFlow", function (req, res) {
    BusinessLibDesign(req).getRecordCanStartProcess(req.query, res.endj);
});

router.get("/getDataWorkFlowInfo", function (req, res) {
    BusinessCommon(req).getRelatedTargetInfo(req.query, res.endj);
});

router.get("/getLoginUserId", function (req, res) {
    res.endj({
        code: 0,
        message: '',
        data: req.generalArgument.userId,
    });
});

/*router.get("/getDataWorkFlowInstances", function (req, res) {
    wfApi(req).GetBusinessHistory({
        data: [req.query.recordId + "_" + req.query.tableId],
        //userId: req.generalArgument.userId
    }).then(function (rsp) {
        var data = [];
        _.each(rsp.data, function (task) {
            console.log(task);
            data.push({
                caption: task.strProcessName + ' ' + task.tStartUser.strUserName + '于' + task.strStartTime + '提交',
                type: task.strProcessType,
                id: task.strProcessInsId,
                hasEnd: !_.isEmpty(task.strEndTime),
            });
        });
        res.endj({
            code: 0,
            message: '',
            data: data,
        });
    }).catch(res.endj);
});*/

/*router.get("/GetIssuesListBySQL", function (req, res) {
    wfApi(req).GetIssuesListBySQL(req.query).then(function (rsp) {
        var data = {taskList: [], totalCount: 0};
        _.each(rsp.data.taskList, function (task) {
            try {
                if (task.iFinishFlag == 1
                    && task.tTaskVariables.assigneeInfo.strUserID == req.generalArgument.userId) {
                    data.taskList.push(task);
                }
            } catch (e) {
                console.log(e.message);
            }
        });

        data.totalCount = data.taskList.length;
        res.endj({
            code: 0,
            message: '',
            data: data,
        });
    }).catch(res.endj);
});*/
module.exports = router;
