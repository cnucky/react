define('module/pcmanage/pcmanage-func-helper', ["jquery", 'nova-utils',
    'nova-dialog', 'nova-notify', 'udp-file-util',
    'utility/FileSaver/FileSaver', 'moment',
], function($, Util, Dialog, Notify, FileUtil, FileHelper, moment) {

    function getStringColDef(data) {
        var returnData = [];
        if (data.length > 0) {
            _.each(data, function(col) {
                if (col.type.toLowerCase() == 'varchar' || col.type.toLowerCase() == 'string' || col.codeTag == 1) {
                    if (col.type.toLowerCase() == 'varchar') {
                        col.type = "string";
                        // col.codeTag = 1;
                    }
                    returnData.push(col);
                }
            })
        }
        return returnData;
    }

    function initSelectData(data) {
        var initData = [];
        $('#select2').empty();
        $('#select2').append('<option value="">(时间戳为空)</option>');
        if (data.length > 0) {
            _.map(data, function(item, index) {
                if (item.type.toLowerCase() == 'date' || item.type.toLowerCase() == 'datetime') {
                    initData.push(item);
                }
            })
        }

        _.map(initData, function(dataItem, dataIndex) {
            $('#select2').append('<option value=' + dataItem.name + '>' + dataItem.caption + '</option>');
        })

    }


    //模型另存为
    function saveTplInfo(modelInfo, messageFlag) {
        $.post('/smartquery/saveModel', {
            "modelId": modelInfo.modelId,
            "modelName": modelInfo.modelName,
            "modelDesc": modelInfo.modelDesc,
            "dirId": modelInfo.dirId,
            "modelType": modelInfo.modelType,
            "modelDetail": modelInfo.modelDetail,
        }, function(rspData) {
            var rsp = $.parseJSON(rspData);
            if (rsp.code == 0) {
                if (messageFlag == "1") {
                    Notify.show({
                        title: " 保存模型成功！",
                        type: "success"
                    });
                } else {
                    Notify.show({
                        title: " 模型另存为成功！",
                        type: "success"
                    });
                }

            } else {
                Notify.show({
                    title: rsp.message,
                    type: "warning"
                });
            }
        })
    }

    //模型保存
    function updateTplInfo(modelId, modelDetail) {
        $.post('/smartquery/updateModel', {
            "modelId": modelId,
            "modelDetail": modelDetail,
        }, function(rspData) {
            var rsp = $.parseJSON(rspData);
            if (rsp.code == 0) {
                Notify.show({
                    title: " 模型保存成功！",
                    type: "success"
                });
            } else {
                Notify.show({
                    title: rsp.message,
                    type: "warning"
                });
            }
        })
    }

    //=======================条件还原 -start=============================
    //抽取数据过滤页面条件
    function getSecondPartData(data) {
        var retData = [];
        _.map(data, function(item, index) {
            _.map(item.filterRule, function(filterItem) {
                retData.push(filterItem);
            })
        })
        return retData;
    }

    //抽取设置属性页面条件
    function getThirdPartData(data) {
        var retData = [];
        _.map(data[0].propertyFieldMap, function(item, index) {
            retData.push(item);
        })
        return retData;
    }

    //抽取设置实体页面条件 
    function getForthPartData(data) {
        var retData = [];
        _.map(data, function(item, index) {
            _.map(item.entityExtractRule, function(entityItem) {
                retData.push(entityItem);
            })
        })
        return retData;
    }

    //抽取设置关系页面条件
    function getFifthPartData(data) {
        var retData = [];
        _.map(data, function(item, index) {
            _.map(item.relationExtractRule, function(relationItem) {
                retData.push(relationItem);
            })
        })
        return retData;
    }

    //=======================条件还原 -end===============================

    //另存为文件
    function exportFile(data) {
        var modelName = modelName || moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        // var fileDetail = {};
        // $.extend(true, fileDetail, data);
        var fileData = new Blob([data], {
            type: 'application/json'
        });
        FileHelper.saveAs(fileData, modelName + '.mdl');
    }

    function importFromFile(loadFromFile) {
        var fileChooser = $('<input type="file" accept=".mdl"/>');
        fileChooser.change(event => {
            if (event.target.files.length == 0) {
                return;
            }
            var file = event.target.files[0];
            if (!/.*\.mdl$/.test(file.name)) {
                Notify.simpleNotify('无法打开', '请选择格式为.mdl的模型文件');
                return;
            }
            var fileReader = new FileReader();
            fileReader.onload = event => {
                try {
                    var data = event.target.result;
                    var strData = JSON.parse(data);
                    strData = JSON.parse(strData.modelDetail);
                    // var strData = "";
                    // for (var i = 0;; i++) {
                    //     if (data["" + i]) {
                    //         strData = strData + data["" + i];
                    //     } else {
                    //         break;
                    //     }
                    // }
                    if (_.isFunction(loadFromFile)) {
                        // strData = JSON.parse(strData);
                        var treeKey = strData.centerCode + strData.dataTypeId + strData.zoneId;
                        var Tree = $("#task-treeview").fancytree("getTree");
                        var treeNode = Tree.activateKey(treeKey);
                        loadFromFile(strData);
                    }
                } catch (e) {
                    Notify.simpleNotify('文件不正确', '请导入正确的文件');
                }
            };

            fileReader.onerror = () => {
                Notify.simpleNotify('无法打开', '文件读取失败');
                return;
            };
            fileReader.readAsText(file);
        }).click();
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            return;
        }
    }

    return {
        getStringColDef: getStringColDef,
        initSelectData: initSelectData,
        saveTplInfo: saveTplInfo,
        updateTplInfo: updateTplInfo,
        getSecondPartData: getSecondPartData,
        getThirdPartData: getThirdPartData,
        getForthPartData: getForthPartData,
        getFifthPartData: getFifthPartData,
        exportFile: exportFile,
        importFromFile: importFromFile,
    };
});