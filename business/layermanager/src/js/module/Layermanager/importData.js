/**
 * Created by THINK on 2016/8/19.
 * 图层管理导入数据功能模块
 */
define('module/Layermanager/importData', ['nova-notify','nova-bootbox-dialog'], function(Notify,bootbox) {
    //  importData= _.template(importData);
    var USERID; //用户ID
    var TabID; //标签页ID
    var BASEURL; //查询接口地址
    var LayerID; //图层ID
    //初始化
    function init(tabID, layerID, userId, baseURL) {
        USERID = userId;
        LayerID = layerID;
        TabID = tabID;
        BASEURL = baseURL;
        _addDataImport();
        var MatchFieldData = null;
        _GetLayerFields(TabID, LayerID);
        _resize(tabID);
    }
    //添加“数据导入”tab内容
    function _addDataImport() {
        //需要动态加载的数据
        //        var parameters = [{
        //            TabPage: TabID,
        //            FilePath: "filePath" + TabID,
        //            FileListBody: "fileBody" + TabID,
        //            TableParent: "tablePar" + TabID,
        //            OK: "ok" + TabID,
        //            Cancel: "cancel" + TabID,
        //            TempletData: "templetData" + TabID,
        //            TempletHead: "templetHead" + TabID,
        //            SampleLable: "sampleLable" + TabID,
        //            DelFile: "delFile" + TabID,
        //            FileList: "fileList" + TabID,
        //            SamleDataList: "samleDataList" + TabID,
        //            TaskName: "taskName" + TabID,
        //            Deflect: "deflect" + TabID
        //        }];
        //        //      $('#tabContent').append(importData(parameters));
        //        $.template("template", importData);
        //        $.tmpl("template", parameters)
        //            .appendTo("#tabContent");
        $(_createTabContent(TabID)).appendTo("#tabContent");
    }
    //生成HTML
    function _createTabContent(tabid) {
        var innerHtml = '<div id=' + tabid + '>' +
            '<div style="height: 30px;vertical-align: middle;">' +
            '<span class="btn blue fileinput-button btn-primary" style="padding: 7px 12px;margin-right: 10px;margin-bottom: 5px;">' +
            '<i class="icon-plus icon-white"></i>' +
            '<span>' + i18n.t('gismodule.LayerManager.importData.uiItem.fileUpload') + '</span>' +
            '<input id="filePath' + tabid + '" name="file" multiple type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">' +
            '</span>' +
            '<button id="delFile' + tabid + '" type="button" class="btn blue delete btn-primary" style="padding: 7px 12px;margin-right: 10px;margin-bottom: 5px;">' +
            '<i class="icon-trash icon-white"></i>' +
            '<span>' + i18n.t('gismodule.LayerManager.importData.uiItem.delete') + '</span>' +
            '</button>' +
            '<span style="height: 100%;width: 1px;border-left:1px solid #000000; margin-left: 10px;"></span>' +
            '<span style="margin-left: 10px;">' +
            '<label style="font-weight: 800;">' + i18n.t('gismodule.LayerManager.importData.uiItem.taskName') + '</label>' +
            '<input id="taskName' + tabid + '" title="' + i18n.t('gismodule.LayerManager.importData.uiItem.inputTaskName') + '" type="text" name="taskName" class="" style="width: 200px;">' +
            '</span>' +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
            '<span><input id="deflect' + tabid + '" type="checkbox" checked="true"/><label style="font-weight: 800;">' + i18n.t('gismodule.LayerManager.importData.uiItem.offset') + '</label></span>' +
            '</div>' +

            '<div class="portlet box green" id="fileList' + tabid + '">' +
            '<div class="portlet-title" style="padding: 5px 0px 1px 10px;">' +
            '<div class="caption" style="font-size: 14px;margin-bottom: 3px;">' +
            '<i class="icon-edit" style="margin-top: 3px;"></i>' +
            i18n.t('gismodule.LayerManager.importData.uiItem.fileList') +
            '</div>' +
            '</div>' +

            '<div class="portlet-body" style="">' +
            '<table class="table table-striped table-hover">' +
            '<thead>' +
            '<tr>' +
            '<th style="font-weight: 800;width: 15%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.select') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.state') + '</th>' +
            '<th style="font-weight: 800;width: 25%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.fileName') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.fileSize') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.dataCount') + '</th>' +
            '</tr>' +
            '</thead>' +
            '</table>' +

            '<div id="tablePar' + tabid + '" style="overflow-y:auto;min-height: 200px;max-height: 200px;">' +
            '<table class="table table-striped table-hover">' +
            '<thead style="display: none;">' +
            '<tr>' +
            '<th style="font-weight: 800;width: 15%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.select') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.state') + '</th>' +
            '<th style="font-weight: 800;width: 25%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.fileName') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.fileSize') + '</th>' +
            '<th style="font-weight: 800;width: 20%;">' + i18n.t('gismodule.LayerManager.importData.uiItem.tableCol.dataCount') + '</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody id="fileBody' + tabid + '">' +
            '</tbody>' +
            '</table>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '<div class="portlet box green tabbable">' +
            '<div class="portlet-title" style="padding: 5px 0px 1px 10px;">' +
            '<div class="caption" style="font-size: 14px;margin-bottom: 3px;">' +
            '<i class="icon-reorder" style="margin-top: 3px;"></i>' +
            i18n.t('gismodule.LayerManager.importData.uiItem.sampleData') + '<span id="sampleLable' + tabid + '" style="color: #ffff00;display: none;">（' + i18n.t('gismodule.LayerManager.importData.uiItem.mappingRelation') + '）</span>' +
            '</div>' +
            '</div>' +

            '<div class="portlet-body" style="min-height: 100px;">' +

            '<div style="overflow:auto;"  id="samleDataList' + tabid + '">' +
            '<table class="table table-striped table-hover sampleData">' +
            '<thead id="templetHead' + tabid + '">' +
            '</thead>' +
            '<tbody id="templetData' + tabid + '" getData="false">' +
            '</tbody>' +
            '</table>' +
            '</div>' +


            '</div>' +
            '</div>' +

            '<div style="text-align: center;">' +
            '<a id="ok' + tabid + '" href="#" class="btn blue btn-primary" style="margin-right: 15px;" direId="${DireID}"><i class="icon-ok"></i>' + i18n.t('gismodule.LayerManager.importData.uiItem.ok') + '</a>' +
            '<a id="cancel' + tabid + '" href="#" class="btn blue" style="margin-left: 15px;"><i class="icon-remove"></i>' + i18n.t('gismodule.LayerManager.importData.uiItem.cancel') + '</a>' +
            '</div>' +

            '</div>';
        return innerHtml;
    }
    //列头匹配
    function _colMatch(base, match) {
        if (match == null || match == "") return false;

        var baseArr = base.split('|');
        var matchArr = match.split('|');

        if (baseArr.length != matchArr.length) return false;

        for (var i = 0; i < baseArr.length; i++) {
            if ($.inArray(baseArr[i], matchArr) == -1) return false;
        }
        return true;
    }
    //添加事件
    function _addEvent(TabID, LayerID, MatchFieldData) {
        var TimeControl = true;
        //"确定"操作
        $("#ok" + TabID).click(function() {
            var importInfo = {}; //存储导入文件操作的数据
            var taskName = $("#taskName" + TabID).val(); //任务名称
            var layerID = LayerID; //图层ID
            var fileID = new Array(); //需导入的文件ID列表
            var fileBody = $("#fileBody" + TabID)[0].children;
            //将校验成功的文件ID放入列表中
            for (var i = 0; i < fileBody.length; i++) {
                var thisID = $(fileBody[i]).attr("id");
                var thisStatus = $(fileBody[i]).attr("status");
                if (thisStatus == "7") { //状态为"校验成功"
                    fileID.push(thisID);
                }
            }
            //放入字段匹配信息
            var mapField = {};
            var columnIDs = new Array();
            var fileColumnNames = new Array();
            var colMatch = $('#templetHead' + TabID + ' .columSelect');
            var colNames = $('#templetHead' + TabID + ' label');
            for (var i = 0; i < colMatch.length; i++) {
                var value = colMatch[i].selectedOptions[0].value;
                var text = colMatch[i].selectedOptions[0].text;
                if (value != 'noValue') {
                    if ($.inArray(value, columnIDs) != -1) {
                        // alert(i18n.t('gismodule.LayerManager.importData.alert1') + '\"' + text + '\"' + i18n.t('gismodule.LayerManager.importData.alert2'));
                        Notify.show({
                            title: i18n.t('gismodule.LayerManager.importData.alert1') + '\"' + text + '\"' + i18n.t('gismodule.LayerManager.importData.alert2'),
                            type: "warning"
                        });
                        return;
                    }
                    columnIDs.push(value);
                    fileColumnNames.push(colNames[i].attributes.fieldName.value);
                }
            }
            mapField["columnIDs"] = columnIDs;
            mapField["fileColumnNames"] = fileColumnNames;
            //任务名不能为空
            if (taskName == "") {
                // alert(i18n.t('gismodule.LayerManager.importData.alert3'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.importData.alert3'),
                    type: "warning"
                });
                return;
            }
            //文件列表中不能没有符合导入条件的文件
            if (fileID.length == 0) {
                // alert(i18n.t('gismodule.LayerManager.importData.alert4'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.importData.alert4'),
                    type: "warning"
                });
                return;
            }
            var alertMsg = "";
            for (var i = 0; i < MatchFieldData.mustMatchs.length; i++) {
                if (MatchFieldData.mustMatchs[i] == 1) {
                    var id = MatchFieldData.ids[i].toString();
                    if ($.inArray(id, mapField.columnIDs) == -1) {
                        alertMsg += '\"' + MatchFieldData.names[i] + '\"';
                    }
                }
            }
            if (alertMsg != "") {
                alertMsg = i18n.t('gismodule.LayerManager.importData.alert1') + alertMsg + i18n.t('gismodule.LayerManager.importData.alert5');
                // alert(alertMsg);
                Notify.show({
                    title: alertMsg,
                    type: "warning"
                });
                return;
            }
            importInfo["taskName"] = taskName;
            importInfo["MapField"] = mapField;
            importInfo["FileID"] = fileID;
            importInfo["layerID"] = layerID;
            importInfo["needDeflect"] = $("#deflect" + TabID)[0].checked ? 1 : 0;
            _ImportFile(importInfo);
        });
        //"取消"操作
        $("#cancel" + TabID).click(function() {
            // var messageBox = confirm(i18n.t('gismodule.LayerManager.importData.confirm'));
            // if (messageBox == true) { //用户同意取消操作
            //     //删除tab页
            //     _delTab($("#tabHead .activeTab").attr("tabID"));
            // } else { //不同意，退出本次操作
            //     return;
            // }
            var msg=i18n.t('gismodule.LayerManager.importData.confirm');
            bootbox.confirm(msg, function(rlt) {
                if (rlt) {
                    //删除tab页
                _delTab($("#tabHead .activeTab").attr("tabID"));
                }
            });
        });
        //"上传文件"按钮
        $("#filePath" + TabID).live("change", function() {
            var myDate = new Date();
            var time = myDate.toLocaleString();
            var fileIDs = {};
            //遍历该input标签中的所有文件
            var fileList = this.files;
            for (var i = 0; i < fileList.length; i++) {
                var lastModifiedDate = fileList[i].lastModifiedDate; //文件最后一次修改时间
                var name = fileList[i].name; //文件名
                var size = fileList[i].size; //文件大小
                var hash = _CalHashCode(time + name + size + lastModifiedDate); //计算文件哈希值
                _addFileToFileList(TabID, hash, name, parseInt(size / 1024).toString() + "KB", ""); //在文件列表中新添文件
                fileIDs[name] = hash;
            }
            _UploadFile("filePath" + TabID, fileIDs); //调用后台服务，上传文件
            setInterval(function() {
                if (TimeControl) {
                    //获取"1.等待上传"和"2.文件上传中"的文件（ID、状态、文件列头信息）
                    var fileIDList = new Array();
                    var fileBody = $("#fileBody" + TabID).children();
                    for (var i = 0; i < fileBody.length; i++) {
                        var status = parseInt($(fileBody[i]).attr("status"));
                        if (status == 1 || status == 2) {
                            fileIDList.push($(fileBody[i]).attr("id"));
                        }
                    }
                    //当没有文件是"等待上传"或"文件上传中"是状态时
                    if (fileIDList.length == 0) {
                        //关闭计时器
                        TimeControl = false;
                        //加载样本数据
                        _loadTempletData(TabID);
                        //进行文件校验
                        _validateFiles(TabID);
                        //退出本次操作
                        return;
                    }
                    //后台服务接口——获取上传文件状态（需要刷新状态的文件ID列表）
                    _GetUploadStatus(fileIDList, TimeControl);
                }
            }, 2 * 1000);
        });
        //删除文件
        $("#delFile" + TabID).click(function() {
            var selectFile = $(".cb" + TabID);
            var delFileIDs = new Array();
            var hasSample = false;
            for (var i = 0; i < selectFile.length; i++) {
                var thisInput = $(".cb" + TabID)[i];
                if (thisInput.checked) {
                    delFileIDs.push($(thisInput.parentNode.parentNode).attr("id"));
                    //判断删除的文件中是否包含模板文件
                    if ($(thisInput.parentNode.parentNode).attr("sample") == "true") {
                        hasSample = true;
                    }
                }
            }
            //后台服务接口——删除已上传的文件（文件ID列表）
            _DelUploadFiles(TabID, delFileIDs, hasSample);
        });
        //窗口大小变化事件
        $(window).resize(function() {
            // _resize(TabID);
        })
    }
    //后台服务接口——导入已上传文件
    function _ImportFile(importInfo) {
        importInfo.hostname = BASEURL;
        importInfo.path = '/LayerService/layer/ImportFile';
        $.ajax({
            type: 'POST',
            url: '/layermanager/layermanager/gisPostQuery',
            // url: BASEURL + '/layer/ImportFile',
            data: importInfo,
            dataType: 'text',
            success: function() {
                _delTab($("#tabHead .activeTab").attr("tabID"));
                // alert(i18n.t('gismodule.LayerManager.importData.alert6'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.importData.alert6'),
                    type: "success"
                });
            },
            error: function(errorMsg) {
                // alert(i18n.t('gismodule.LayerManager.importData.alert7'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.importData.alert7'),
                    type: "warning"
                });
            }
        });
    }
    //删除tab页（tabID：tab页ID）
    function _delTab(tabID) {
        var tabsItems = $("#tabHead").children();
        var thisTab;
        for (var i = 0; i < tabsItems.length; i++) {
            if ($(tabsItems[i]).attr("tabID") == tabID) {
                thisTab = $(tabsItems[i]);
            }
        }
        var isActive = thisTab.hasClass("activeTab"); //是否为活动状态
        $("#" + tabID).remove(); //删除Tab页内容
        thisTab.remove(); //删除tab页头
        //判断主框架中是否包含tab页,若不包含tab页，则隐藏“横线”
        tabsItems = $("#tabHead").children();
        if (tabsItems.length == 0) {
            $(".hr-sepratorTab").hide();
            $('#tabContent').hide();
        } else {
            if (isActive) { //若删除的tab为活动状态，且删除后还包含tab页，则将第一个tab页设置为活动状态
                _setActiveTab($($("#tabHead")[0].children).attr("tabID"));
            }
        }
    }
    //将某tab页设为活动状态
    function _setActiveTab(tabID) {
        var tabHeads = $("#tabHead")[0].children;
        var needActTabHead = null;
        var needActTabCon = null;
        for (var i = 0; i < tabHeads.length; i++) {
            var thisTab = $(tabHeads[i]);
            if (thisTab.hasClass("activeTab")) {
                var tabConId = thisTab.attr("tabid");
                if (tabID == tabConId) {
                    return;
                } else {
                    thisTab.removeClass("activeTab")
                        .addClass("unActiveTab");
                    $("#" + tabConId).hide();
                }
            } else {
                var tabConId = thisTab.attr("tabid");
                if (tabID == tabConId) {
                    needActTabHead = $(tabHeads[i]);
                    needActTabCon = $("#" + tabID);
                }
            }
        }
        if (needActTabHead != null && needActTabCon != null) {
            needActTabHead.addClass("activeTab")
                .removeClass("unActiveTab");
            needActTabCon.show();
        }
    }
    //根据字符串计算Hash值
    function _CalHashCode(hashStr) {
        var h = 0;
        var len = hashStr.length;
        var t = 2147483648;
        for (var i = 0; i < len; i++) {
            h = 31 * h + hashStr.charCodeAt(i);
            if (h > 2147483648) h %= t;
        }
        while (h > 2147483647) {
            h += t;
        }
        return h;
    }
    //在文件列表中新添文件
    function _addFileToFileList(TabID, hash, fileName, fileSize, num) {
        var fileBody = $("#fileBody" + TabID)[0]; //获取已有的html内容
        var addFileHtml =
            '<tr id="' + hash + '" status="1">' +
            '<td style="width: 15%;">' +
            '<input class="cb' + TabID + '" type="checkbox"/>' +
            '</td>' +
            '<td style="width: 20%;">' +
            '<img src="../layermanager/img/LayerManager/image/document_refresh_16_p.png"/><lable>' + i18n.t('gismodule.LayerManager.importData.status.waitForUpload') + '</lable>' +
            '</td>' +
            '<td style="width: 25%;">' + fileName + '</td>' +
            '<td style="width: 20%;">' + fileSize + '</td>' +
            '<td style="width: 20%;">' + num + '</td>' +
            '</tr>';
        fileBody.innerHTML += addFileHtml;
    }
    //计算元素的高和宽
    function _resize(TabID) {
        var toolBarHeight = 30; //工具条高度
        var fileListHeight = $("#fileList" + TabID).height(); //文件列表高度
        var opButtHeight = 40; //最下端“确定”“取消”按钮的高度
        $("#samleDataList" + TabID).height($(".tabContent-Style").height() - toolBarHeight - fileListHeight - opButtHeight - 100);
    }
    //后台服务接口——上传文件（需要上传的文件域ID）
    function _UploadFile(inputID, fileIDs) {
        $.ajaxFileUpload({
            url: '/layermanager/layermanager/UploadFile',
            secureuri: false,
            fileElementId: inputID,
            data: fileIDs,
            //type:'POST',
            success: function(data) { //获取本次上传文件的状态信息
                // alert("成功");
                console.log(data);
            },
            error: function(data) {
                //                    alert("文件上传失败！");
                console.log(data);
            }
        });
    }
    //加载模板数据
    function _loadTempletData(TabID) {
        //当还未提交获取模板数据的请求时
        if ($("#templetData" + TabID).attr("getData") == "false") {
            var fileList = $("#fileBody" + TabID)[0].children; //页面上的文件列表
            //依次遍历文件列表中的文件，
            for (var i = 0; i < fileList.length; i++) {
                var status = $(fileList[i]).attr("status"); //获取文件状态信息
                //若文件状态为"上传成功",调后台服务，获取采样数据
                if (status == "3") {
                    var fileID = $(fileList[i]).attr("id"); //获取文件ID
                    $("#templetData" + TabID).attr("getData", "true"); //标记文件已经在获取过程中了
                    _refreshFileStatus(fileID, 7, "", "", ""); //修改文件状态为"校验成功"
                    $(fileList[i]).css("font-weight", "800");
                    var data = $(fileList[i]).attr("rowData"); //获取采样数据
                    if (data != null && data != "") {
                        //页面加载采样数据
                        var headerMapInnerHtml = '<tr>';
                        var headerInnerHtml = '<tr>';
                        var bodyInnerHtml = '';
                        var header = $(fileList[i]).attr("headerInfo").split('\t');
                        var body = data.split('\n');
                        for (var j = 0; j < header.length; j++) {
                            headerInnerHtml +=
                                '<th>' +
                                '<label fieldName="' + header[j] + '">' + header[j] + '&nbsp;&nbsp;</label>' +
                                // '<img class="colMatch" fieldID="-1" src="../layermanager/img/LayerManager/image/rubberstamp_16_p.png"/>' +
                                '</th>';
                            headerMapInnerHtml += '<th>' +
                                '<select class="columSelect"></select>' +
                                '</th>';
                        }
                        headerInnerHtml += '</tr>';
                        headerMapInnerHtml += '</tr>';
                        for (var j = 0; j < body.length; j++) {
                            bodyInnerHtml += '<tr>';
                            var lineData = body[j].split('\t'); //一行数据
                            for (var k = 0; k < lineData.length; k++) {
                                bodyInnerHtml += '<td>' + lineData[k] + '</td>';
                            }
                            bodyInnerHtml += '</tr>';
                        }
                        $("#templetHead" + TabID)[0].innerHTML = headerMapInnerHtml + headerInnerHtml;
                        $("#templetData" + TabID)[0].innerHTML = bodyInnerHtml;
                        _initColsSelect();
                        //更改该文件状态为"样本文件"
                        $(fileList[i]).attr("sample", "true");
                        _SetFileStatus(fileID, 7); //调用后台服务，修改数据库中文件状态
                        $("#sampleLable" + TabID).show();
                    } else {
                        $("#templetData" + TabID).attr("getData", "false"); //标记文件未获取成功
                        // alert(i18n.t('gismodule.LayerManager.importData.alert8'));
                        Notify.show({
                            title: i18n.t('gismodule.LayerManager.importData.alert8'),
                            type: "warning"
                        });
                    }
                    return;
                }
            }
        }
    }
    //刷新文件状态信息
    function _refreshFileStatus(hash, status, headerInfo, rowData, size) {
        //1-等待上传 2-文件上传中 3-上传成功 4-上传失败 5-等待校验 6-文件校验中 7-校验成功 8-校验失败 9-等待导入 10-数据导入中 11-导入完成 12-导入失败
        var statusHtml = "";
        switch (status) {
            case 1:
                statusHtml = '<img src="../layermanager/img/LayerManager/image/document_refresh_16_p.png"/><lable>' + i18n.t('gismodule.LayerManager.importData.status.waitForUpload') + '</lable>';
                break;
            case 2:
                statusHtml = '<img src="../layermanager/img/LayerManager/image/document_up_16_p.png"/><lable>' + i18n.t('gismodule.LayerManager.importData.status.uploading') + '</lable>';
                break;
            case 3:
                statusHtml = '<img src="../layermanager/img/LayerManager/image/document_ok_16_p.png"/><lable>' + i18n.t('gismodule.LayerManager.importData.status.uploadSuccess') + '</lable>';
                break;
            case 4:
                statusHtml = '<img src="../layermanager/img/LayerManager/image/document_delete_16_p.png"/><lable color="red">' + i18n.t('gismodule.LayerManager.importData.status.uploadFailed') + '</lable>';
                break;
            case 5:
                statusHtml = '<img src="../layermanager/img/LayerManager/image/recycle_16_p.png"/><lable>' + i18n.t('gismodule.LayerManager.importData.status.waitForCheck') + '</lable>';
                break;
            case 6:
                statusHtml = '<img src="../layermanager/img/LayerManager/image/text_view_16_p.png"/><lable>' + i18n.t('gismodule.LayerManager.importData.status.checking') + '</lable>';
                break;
            case 7:
                statusHtml = '<img src="../layermanager/img/LayerManager/image/check2_16_p.png"/><lable>' + i18n.t('gismodule.LayerManager.importData.status.checkSuccess') + '</lable>';
                break;
            case 8:
                statusHtml = '<img src="../layermanager/img/LayerManager/image/delete2_16_p.png"/><lable color="red">' + i18n.t('gismodule.LayerManager.importData.status.checkFailed') + '</lable>';
                break;
        }
        $("#" + hash).attr("status", status);
        $("#" + hash).children()[1].innerHTML = statusHtml;
        if (headerInfo != "") {
            $("#" + hash).attr("headerInfo", headerInfo);
        }
        if (rowData != "") {
            $("#" + hash).attr("rowData", rowData);
        }
        if (size != "") {
            $("#" + hash)[0].children[4].innerHTML = size;
        }
    }
    //初始化映射字段下拉选项
    function _initColsSelect() {
        var options = '<option selected value="noValue">' + i18n.t('gismodule.LayerManager.importData.empty') + '</option>';
        if (MatchFieldData) {
            for (var i = 0; i < MatchFieldData.ids.length; i++) {
                options += '<option value="' + MatchFieldData.ids[i] + '">' + MatchFieldData.names[i] + '</option>';
            }
        }
        $('.columSelect').each(function(i) {
            $(this).empty().append(options);
        });
    }
    //后台服务接口——获取图层存储字段20160928
    function _GetLayerFields(tabID, layerID) {
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: BASEURL,
                path: '/LayerService/layer/GetLayerField',
                layerID: layerID
            },
            // url: BASEURL + '/layer/GetLayerField?layerID=' + layerID,
            dataType: 'text',
            success: function(args) {
                MatchFieldData = JSON.parse(args);
                _addEvent(tabID, layerID, MatchFieldData);
            },
            error: function(errorMsg) {
                // alert(i18n.t('gismodule.LayerManager.importData.alert9'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.importData.alert9'),
                    type: "warning"
                });
            }
        });
    }
    //后台服务接口——更改数据库文件状态
    function _SetFileStatus(fileID, status) {
        $.ajax({
            type: 'POST',
            // url: BASEURL + '/layer/SetFileStatus',
            url: '/gisapi/gisPostQuery',
            data: {
                hostname: BASEURL,
                path: '/LayerService/layer/SetFileStatus',
                fileID: fileID,
                status: status
            },
            dataType: 'text',
            success: function(args) {},
            error: function(errMsg) {
                // alert(i18n.t('gismodule.LayerManager.importData.alert10') + ',fileID:' + fileID);
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.importData.alert10') + ',fileID:' + fileID,
                    type: "warning"
                });
            }
        });
    }
    //将上传成功的文件进行校验
    function _validateFiles(TabID) {
        var fileBody = $("#fileBody" + TabID).children();
        var sampleHeader = "";
        for (var i = 0; i < fileBody.length; i++) {
            var tr = $(fileBody[i]);
            var header = tr.attr("headerInfo"); //列头信息
            var isSample = tr.attr("sample"); //标记是否是样本文件
            if (isSample == "true") { //校验成功且是样本文件
                sampleHeader = header;
                break;
            }
        }
        if (sampleHeader == "") return;
        for (var i = 0; i < fileBody.length; i++) {
            var tr = $(fileBody[i]);
            var fileID = tr.attr("id"); //文件ID
            var status = tr.attr("status"); //文件状态
            var header = tr.attr("headerInfo"); //列头信息
            if (status == "3") { //上传成功
                if (_colMatch(sampleHeader, header)) {
                    _refreshFileStatus(fileID, 7, "", "", ""); //校验成功
                    _SetFileStatus(fileID, 7); //调用后台服务，修改数据库中文件状态
                } else {
                    _refreshFileStatus(fileID, 8, "", "", ""); //校验失败
                    _SetFileStatus(fileID, 8); //调用后台服务，修改数据库中文件状态
                }
            }
        }
    }
    //后台服务接口——获取上传文件状态（需要刷新状态的文件ID列表）
    function _GetUploadStatus(fileIDList, TimeControl) {
        $.ajax({
            type: 'POST',
            // url: BASEURL + '/layer/GetUploadStatus',
            url: '/gisapi/gisPostQuery',
            data: {
                hostname: BASEURL,
                path: '/LayerService/layer/GetUploadStatus',
                id: fileIDList
            },
            dataType: 'text',
            success: function(args) {
                var data = eval(args);
                //更新文件状态
                for (var i = 0; i < data.length; i++) {
                    _refreshFileStatus(data[i].fileSID, data[i].fileStatus, data[i].headerInfo, data[i].rawData, data[i].fileSize);
                }
            },
            error: function(error) {
                //未获取文件状态信息，则关闭计时器，返回操作
                // alert(i18n.t('gismodule.LayerManager.importData.alert11'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.importData.alert11'),
                    type: "warning"
                });
                //clearTimeout(TimeControl); //清除计时器
                TimeControl = false;
            }
        });
    }
    //后台服务接口——删除已上传的文件（文件ID列表）
    function _DelUploadFiles(TabID, fileIDList, hasSample) {
        $.ajax({
            type: 'POST',
            // url: BASEURL + '/layer/DelUploadFiles',
            url: '/gisapi/gisPostQuery',
            data: {
                hostname: BASEURL,
                path: '/LayerService/layer/DelUploadFiles',
                fileID: fileIDList
            },
            dataType: 'text',
            success: function() {
                //在界面上删除文件
                for (var i = 0; i < fileIDList.length; i++) {
                    $("#" + fileIDList[i]).remove();
                }
                //判断是否是模板文件，如果是模板文件，删除后要重新进行模板文件选定、获取新的模板数据、对其他文件进行匹配
                if (hasSample) {
                    //清空模板数据
                    $("#templetHead" + TabID).empty();
                    $("#templetData" + TabID).empty();
                    $("#sampleLable" + TabID).hide();
                    //更改其他文件状态（将校验成功、校验失败的文件重新更改为上传成功）
                    var restFiles = $("#fileBody" + TabID)[0].children;
                    for (var i = 0; i < restFiles.length; i++) {
                        var status = $(restFiles[i]).attr("status");
                        var fileID = $(restFiles[i]).attr("id");
                        if (status == "7" || status == "8") {
                            $(restFiles[i]).attr("status", "3");
                            _refreshFileStatus($(restFiles[i]).attr("id"), 3, "", "", ""); //修改文件状态为“上传成功”
                            _SetFileStatus(fileID, 3); //调用后台服务，修改数据库中文件状态
                        }
                    }
                    $("#templetData" + TabID).attr("getData", "false");
                    _loadTempletData(TabID); //获取样本数据
                    _validateFiles(TabID); //重新校验文件
                }
            },
            error: function(errorMsg) {
                // alert(i18n.t('gismodule.LayerManager.importData.alert12'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.importData.alert12'),
                    type: "warning"
                });
            }
        });
    }
    return {
        init: init
    }
})