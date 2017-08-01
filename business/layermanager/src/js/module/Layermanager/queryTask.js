/**
 * Created by THINK on 2016/8/19.
 * 图层管理查询导入任务功能模块
 */
define('module/Layermanager/queryTask', ['nova-notify'], function(Notify) {
    //queryTask= _.template(queryTask);
    var BASEURL; //查询接口地址
    //初始化
    function init(layerId, taskTabId, baseURL) {
        BASEURL = baseURL;
        //添加任务页面
        _addTaskTabPage(taskTabId);
        //首次获取导入任务的数据，并初始化任务表格
        _GetAllTasks(layerId, taskTabId);
        //添加点击事件
        _addEvent(layerId, taskTabId);
    }
    //添加任务页面
    function _addTaskTabPage(tabid) {
        // var parameters = [{
        //     TaskTabId: tabid
        // }];
        // //$('#tabContent').append(queryTask(parameters));
        // $.template("template", queryTask);
        // $.tmpl("template", parameters)
        //     .appendTo("#tabContent");
        $(_createTabContent(tabid)).appendTo("#tabContent");
        _setStyle(tabid);
    }
    //生成Html
    function _createTabContent(tabid) {
        var innerHtml = '<div id="' + tabid + '">' +
            '<div style="height: 40px;vertical-align: middle;">' +
            '<button id="' + tabid + '_refresh" type="button" class="btn blue delete btn-primary" style="padding: 7px 12px;margin-right: 10px;margin-bottom: 5px;">' +
            '<i class="icon-refresh icon-white"></i>' +
            '<span>' + i18n.t('gismodule.LayerManager.queryTask.uiItem.refresh') + '</span>' +
            '</button>' +
            '<button id="' + tabid + '_delete" type="button" class="btn blue delete btn-primary" style="padding: 7px 12px;margin-right: 10px;margin-bottom: 5px;">' +
            '<i class="icon-trash icon-white"></i>' +
            '<span>' + i18n.t('gismodule.LayerManager.queryTask.uiItem.delete') + '</span>' +
            '</button>' +
            '<button id="' + tabid + '_option" type="button" class="btn blue delete" style="padding: 7px 12px;margin-right: 10px;margin-bottom: 5px;display: none">' +
            '<i class="icon-collapse-top icon-white"></i>' +
            '<span>' + i18n.t('gismodule.LayerManager.queryTask.uiItem.fold') + '</span>' +
            '</button>' +
            '</div>' +
            '<div class="portlet box green tabbable">' +
            '<div class="portlet-title " style="padding: 5px 0px 1px 10px;">' +
            '<div class="caption" style="font-size: 14px;margin-bottom: 3px;">' +
            '<i class="icon-reorder" style="margin-top: 3px;"></i>' + i18n.t('gismodule.LayerManager.queryTask.uiItem.taskList') +
            '</div>' +
            '</div>' +
            '<div class="portlet-body">' +
            '<div class="tabbable portlet-tabs ">' +
            '<div style="margin-right: 0px">' +
            '<table class="table table-striped sampleData ">' +
            '<thead>' +
            '<tr>' +
            '<th style="font-weight: 800;width: 7%;">' + i18n.t('gismodule.LayerManager.queryTask.uiItem.tableCol.select') + '</th>' +
            '<th style="font-weight: 800;width: 15%;">' + i18n.t('gismodule.LayerManager.queryTask.uiItem.tableCol.taskName') + '</th>' +
            '<th style="font-weight: 800;width: 14%;">' + i18n.t('gismodule.LayerManager.queryTask.uiItem.tableCol.startTime') + '</th>' +
            '<th style="font-weight: 800;width: 14%;">' + i18n.t('gismodule.LayerManager.queryTask.uiItem.tableCol.endTime') + '</th>' +
            '<th style="font-weight: 800;width: 9%;">' + i18n.t('gismodule.LayerManager.queryTask.uiItem.tableCol.layerName') + '</th>' +
            '<th style="font-weight: 800;width: 7%;">' + i18n.t('gismodule.LayerManager.queryTask.uiItem.tableCol.successCount') + '</th>' +
            '<th style="font-weight: 800;width: 9%;">' + i18n.t('gismodule.LayerManager.queryTask.uiItem.tableCol.failedCount') + '</th>' +
            '<th style="font-weight: 800;width: 9%;">' + i18n.t('gismodule.LayerManager.queryTask.uiItem.tableCol.taskState') + '</th>' +
            '<th style="font-weight: 800;width: 15%;">' + i18n.t('gismodule.LayerManager.queryTask.uiItem.tableCol.taskSchedule') + '</th>' +
            '</tr>' +
            '</thead>' +
            '</table>' +
            '</div>' +
            '<div class="tabbable portlet-tabs" id="' + tabid + '_TaskTable">' +
            '<table id="' + tabid + '_DataImport_Details" class=" table table-striped table-hover sampleData">' +
            '<tbody>' +
            '</tbody>' +
            '</table>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        return innerHtml;
    }
    //设置元素的样式：高和宽,以及滚动条
    function _setStyle(tabid) {
        $("#" + tabid + "_TaskTable").height($(".tabContent-Style").height() - 110 - 25);
        $("#" + tabid + "_TaskTable").css({
            "overflow": "auto"
        });
    }
    //服务请求：获取所有导入任务数据
    function _GetAllTasks(layerid, tabid) {
        $.ajax({
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: BASEURL,
                path: '/LayerService/layer/ImportTask',
                layerID: layerid
            },
            // url:BASEURL+ "/layer/ImportTask?layerID=" + layerid,
            type: "GET",
            dataType: "text",
            success: function(data) {
                var taskData = eval(data);
                _addDataToTable(taskData, tabid); //将数据添加到界面上
            },
            error: function() {
                // alert(i18n.t('gismodule.LayerManager.queryTask.alert1'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.queryTask.alert1'),
                    type: "warning"
                });
            }
        });
    }
    //将data添加到表格tableid中，data为JSON对象
    function _addDataToTable(data, tabid) {
        $.each(data, function(i, n) {
            var oneTask = _TaskStructure(n["jobID"], n["jobType"], n["jobName"], n["jobStartTime"], n["jobEndTime"], n["layerName"], n["currRecordNum"], n["errorRecordNum"], n["errorRecordFile"], n["jobStatus"], n["jobProcess"]);
            var status = _StatusSwitch(oneTask.jobStatus); //任务状态的类型转换
            var fileaddress = _CheckErrorData(BASEURL, oneTask.errorRecordNum, oneTask.jobStatus, oneTask.errorRecordFile);
            var htmlVal = "<tr id='" + i + "'>" + //将任务数据添加到表格tableid中
                "<td style='width:7%;'><input type='checkbox' name='count' id='" + oneTask.jobID + "'/></td> " + // 将复选框的id设置为任务ID，以便删除任务时，根据任务ID获取该复选框的状态
                "<td style='width:15%;'>" + oneTask.jobName + "</td> " +
                "<td style='width:14%;'>" + oneTask.jobStartTime + "</td> " +
                "<td style='width:14%;'>" + oneTask.jobEndTime + "</td> " +
                "<td style='width:9%;'>" + oneTask.layerName + "</td> " +
                "<td style='width:7%;'>" + oneTask.successRecordNum + "</td> " +
                "<td style='width:9%;'>" +
                "<a href=\"" + fileaddress + "\" style='color:red' target='_blank'>" + oneTask.errorRecordNum + "</a>" +
                "</td> " +
                "<td style='width:9%;'>" + status + "</td> " +
                "<td style='width:15%;'>" +
                "<div  style='height:19px; width:100%;' id='" + tabid + "progress" + i + "'><div id='" + tabid + "progressbar" + i + "'class='progressbar-label'></div></div>" +
                "</td> " +
                "</tr>";
            switch (n["jobType"]) {
                case 1: //任务类型为“数据导入”
                    $("#" + tabid + "_DataImport_Details").append(htmlVal);
                    break;
                case 2: //任务类型为“优化显示”
                    $("#" + tabid + "_OptimizeDisplay_Details").append(htmlVal);
                    break;
                case 3: //任务类型为“重建索引”
                    $("#" + tabid + "_RebuildingIndex_Details").append(htmlVal);
                    break;
            }
            //给进度条设值
            $("#" + tabid + "progress" + i).progressbar({
                value: false,
                change: function() {
                    $("#" + tabid + "progressbar" + i).text($("#" + tabid + "progress" + i).progressbar("value") + "%");
                }
            });
            $("#" + tabid + "progress" + i).progressbar("value", oneTask.jobProcess);
        });
    }
    //导入任务的数据结构
    function _TaskStructure(id, type, name, begintime, endtime, layername, allnum, errornum, errorfile, status, progress) {
        var task = {};
        task.jobID = id;
        task.jobType = type; //int：1：数据导入 2：优化显示 3：重建索引
        task.jobName = name;
        task.jobStartTime = begintime;
        task.jobEndTime = endtime;
        task.layerName = layername;
        task.successRecordNum = allnum - errornum;
        task.errorRecordNum = errornum;
        task.errorRecordFile = errorfile;
        task.jobStatus = status; //int：1：空闲 2：导入中 3：导入成功 4：导入失败
        task.jobProcess = progress;
        return task;
    }
    //任务状态类型转换:int-->string
    function _StatusSwitch(status) {
        var state = "";
        switch (status) {
            case 1: //任务状态为“等待导入”
                state = i18n.t('gismodule.LayerManager.queryTask.state.waitForImport');
                break;
            case 2: //任务状态为“导入中”
                state = i18n.t('gismodule.LayerManager.queryTask.state.importing');
                break;
            case 3: //任务状态为“导入成功”
                state = i18n.t('gismodule.LayerManager.queryTask.state.importSuccess');
                break;
            case 4: //任务状态为“导入失败”
                state = i18n.t('gismodule.LayerManager.queryTask.state.importFailed');
                break;
        }
        return state;
    }
    //添加按钮点击事件
    function _addEvent(layerid, tabid) {

        //事件：刷新导入任务
        $("#" + tabid + "_refresh").click(function() {
            _ClearTableContent(tabid); //先清空表格
            _GetAllTasks(layerid, tabid); //再重新获取
        });
        //事件：批量删除导入的任务
        $("#" + tabid + "_delete").click(function() {
            //获得需要删除任务的ID
            var deletedTaskIdList = _FindSelectRow();
            //删除指定的任务
            _DeleteSomeTasksInServer(deletedTaskIdList);
        });

    }
    //清空表格
    function _ClearTableContent(tabid) {
        $("#" + tabid + "_DataImport_Details").empty();
        $("#" + tabid + "_OptimizeDisplay_Details").empty();
        $("#" + tabid + "_RebuildingIndex_Details").empty();
    }
    //获得需要删除任务的ID
    function _FindSelectRow() {
        var deletedTaskIdList = new Array(); //用于存储要删除任务的ID
        var checked = $("input[type='checkbox'][name='count']:checked");
        $(checked).each(function(i) {
            deletedTaskIdList[i] = $(this).attr('id');
        });
        return deletedTaskIdList;
    }
    //服务请求：删除指定的任务
    function _DeleteSomeTasksInServer(taskidlist) {
        $.ajax({
            // url: BASEURL + "/layer/DeleteTask",
            type: "POST",
            url: '/gisapi/gisPostQuery',
            data: {
                hostname: BASEURL,
                path: '/LayerService/layer/DeleteTask',
                jobids: taskidlist
            },
            dataType: "Json",
            success: function(data) {
                //后台删除任务成功后，进行本地和界面的数据删除
                _DeleteSomeTasksInView();
            },
            error: function() {
                // alert(i18n.t('gismodule.LayerManager.queryTask.alert2'));
                Notify.show({
                    title: i18n.t('gismodule.LayerManager.queryTask.alert2'),
                    type: "warning"
                });
            }
        });
    }
    //本地（界面）删除指定的任务
    function _DeleteSomeTasksInView() {
        var checked = $("input[type='checkbox'][name='count']:checked");
        $(checked).each(function(i) {
            $(checked[i]).parent().parent().remove();
        });
    }
    //download the error data file
    function _CheckErrorData(url, errornum, status, filepath) {
        if (status > 2 && errornum > 0) {
            var index=filepath.indexOf('webapps');
            var path=filepath.slice(index+7);
            return 'http://'+url+':8080' + path;
        } else {
            return '';
        }
    }
    return {
        init: init
    }
})