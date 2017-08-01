/**
 * Created by root on 5/24/16.
 */
define('./taskmanage', [
    'nova-notify', 'nova-dialog', 'nova-bootbox-dialog',
    '../../tpl/tpl-taskmanage',
    '../dm/taskmanage/dm-batchmanage',
    '../dm/taskmanage/dm-taskmanage-util',
    '../../tpl/tpl-error-files',
    '../../tpl/tpl-errorfile',
], function (Notify, Dialog, bootbox, tplTaskmanage, batchmanage, taskmanageUtil, tplErrorFilesDialog, tplSingleErrorFileDialog) {
    var _opts;
    var selectedNode;
    var fileBatchSize = 100;
    var errorFilesCount = 200;
    var hasMoreFiles = true;
    var taskID, taskState, taskType;
    var curTaskCounts = 0;
    var curFileCounts = 0;
    var curTaskId = -1;
    var curFileId = -1;
    //当前选中的表格：1:任务表; 2:文件表;
    var curType = -1;
    var curScrollTop = 0;
    var curFileErrorArray = new Array();

    tplTaskmanage = _.template(tplTaskmanage);
    tplErrorFilesDialog = _.template(tplErrorFilesDialog);
    tplSingleErrorFileDialog = _.template(tplSingleErrorFileDialog);

    function init(opts) {
        _opts = opts;
        curTaskId = -1;
        curFileId = -1;
        curType = -1;
    }

    function renderTaskmanageInfo(info) {
        if (_.isUndefined(info.data.typeId)) {
            $(_opts.container).empty();
            return;
        }

        selectedNode = info;
        $(_opts.container).empty().append(tplTaskmanage(info));
        $('#batchTableTitle')[0].innerHTML = '<span  style="color: #70ca63" class="glyphicon glyphicon-tasks"></span>'
            + selectedNode.title + "  导入/对接任务详情";

        delDynamicLoading.css("/datamanage/css/dataimport/bootplus.css");
        delDynamicLoading.css("/datamanage/css/dataimport/dataimport.css");
        initfunction();

        initLoadTaskTable();
        initLoadFileTable();

        processSelect();
    }

    var delDynamicLoading = {
        css: function (path) {
            if (!path || path.length === 0) {
                throw new Error('argument "path" is required !');
            }
            var head = document.getElementsByTagName('head')[0];
            for (var link in head.children) {
                if (head.children[link].type != undefined && head.children[link].type == 'text/css'
                    && head.children[link].href != undefined && head.children[link].href.indexOf(path) > 0)
                    head.removeChild(head.children[link]);
            }
            //link.href = path;
            //link.rel = 'stylesheet';
            //link.type = 'text/css';
            //head.appendChild(link);
        },
        js: function (path) {
            if (!path || path.length === 0) {
                throw new Error('argument "path" is required !');
            }
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.src = path;
            script.type = 'text/javascript';
            head.appendChild(script);
        }
    }

    function initfunction() {
        $('.widget-menu button').on('click', function (event) {
            $button = $(this);
            if ($button.text() == '开始') {
                setBatchStatus(3);
            }
            else if ($button.text() == '暂停') {
                setBatchStatus(6);
            }
            else if ($button.text() == '停止') {
                bootbox.confirm("确定停止此任务?", function (rlt) {
                    if (rlt) {
                        setBatchStatus(7);
                    }
                });
            }
            else if ($button.text() == '删除') {
                bootbox.confirm("确定删除此任务?", function (rlt) {
                    if (rlt) {
                        deleteTaskInfo();
                    }
                });
            }
            else if ($button.text() == "复制编辑") {
                if (taskID) {
                    batchmanage.copyBatch(taskID, selectedNode);
                }
            }
            else if ($button.text() == "刷新") {
                processSelect(selectedNode);
            }
            else if ($button.text() == "浏览数据") {
                viewdata();
            }
        });

        //获取下一批导入文件
        $("#nextFileBatch").on('click', function (event) {
            // if (hasMoreFiles == true) {
            //     // showLoader();
            //     loadFileInfo(taskID, $("#filecount").text(), fileBatchSize);
            // }

            $("#loadFileTable").dataTable().fnClearTable();
            var fileCounts = $("#fileCounts").val();
            if(fileCounts > 2000)
                fileCounts = 2000;
            loadFileInfo(taskID, 0, fileCounts);
        });
    }

    function viewdata(){
        if(curType == 1){
            if(curTaskId > 0){
                console.log("viewdata window.location", window.location);
                var hrefPath = window.location.origin+window.location.pathname+"?oprtype=4&batchId="+curTaskId;
                window.open(hrefPath);
            }
        }
        else if(curType == 2){
            if(curFileId > 0){
                console.log("viewdata window.location", window.location);
                var hrefPath = window.location.origin+window.location.pathname+"?oprtype=4&batchId="+curTaskId+"&fileId="+curFileId;
                window.open(hrefPath);
            }
        }
    }

    function processSelect() {
        $("#loadTaskTable").dataTable().fnClearTable();
        $("#loadFileTable").dataTable().fnClearTable();
        hasMoreFiles = true;
        console.log("selectedNode.data.", selectedNode.data);
        loadTaskInfo(selectedNode.data.typeId, selectedNode.data.centerCode);
    }

    //初始化任务列表
    function initLoadTaskTable() {
        var pageHeight = $("#main")[0].scrollHeight;
        var tableHeight = (pageHeight - 60 - 60 - 50 - 45 - 150) * 0.5;
        console.log("loadTaskTable", tableHeight);
        $('#loadTaskTable').dataTable({
            'data': [],
            "bAutoWidth": false,
            "bPaginate": false,
            'scrollX': true,
            'scrollY': tableHeight,
            'fixedHeader': true,
            "columns": [
                {
                    "data": "taskID"
                },
                {
                    "data": "taskName"
                },
                {
                    "data": "taskType"
                },
                {
                    "data": "srcFileDir"
                },
                {
                    "data": "taskState"
                },
                {
                    "data": "beginTime"
                },
                {
                    "data": "endTime"
                },
                {
                    "data": "percent"
                },
                {
                    "data": "succRecordCount"
                },
                {
                    "data": "errorRecordCount"
                },
                {
                    "data": "succFileCount"
                },
                {
                    "data": "errorFileCount"
                },
                {
                    "data": "taskType"
                }
            ],
            'aaSorting': [
                [0, 'desc']
            ],
            "aoColumnDefs": [{
                'bSortable': false,
                'bVisible': false,
                'aTargets': [12]
            }],
            "oLanguage": {
                "sProcessing": "正在加载任务信息...",
                "sLengthMenu": "每页显示_MENU_条记录",
                "sInfo": "当前显示_START_到_END_条，共_TOTAL_条任务",
                "sInfoEmpty": "未查询到相关的任务信息",
                "sZeroRecords": "对不起，查询不到相关任务信息",
                "sInfoFiltered": "",
                "sSearch": "搜索",
                "oPaginate": {
                    "sPrevious": "上一页",
                    "sNext": "下一页"
                }
            },
            "iDisplayLength": 10,
            'bLengthChange': false,
            //"aLengthMenu": [
            //    [5, 10, 10, 25, 50, -1],
            //    [5, 10, 25, 50, "All"]
            //],
            //"sDom": '<"clearfix"r>t<"dt-panelfooter clearfix"ip>',
            "sDom": '<"clearfix"r>Zt<"dt-panelfooter clearfix hide"lp>',
        });

        $("#loadTaskTable").on('click', 'tbody > tr', function (event) {
            //event.stopPropagation();
            $task = $(this);
            $("#loadTaskTable tr").removeClass('primary');
            $task.addClass('primary');
            var rowData = $("#loadTaskTable").dataTable().fnGetData($task);
            taskID = rowData.taskID;
            curTaskId = taskID;
            curType = 1;
            curScrollTop = $(".dataTables_scrollBody").scrollTop();//$("#loadTaskTable")[0].scrollHeight;
            taskState = rowData.taskState;
            taskType = rowData.taskType;
            curTaskCounts = rowData.succRecordCount;

            taskmanageUtil.setButtonStat(taskState);
            taskmanageUtil.setViewdataBtnStat(curTaskCounts);
            $("#loadFileTable").dataTable().fnClearTable();
            hasMoreFiles = true;
            loadFileInfo(taskID, 0, fileBatchSize);
        });
    }

    //初始化文件列表
    function initLoadFileTable() {
        var pageHeight = $("#main")[0].scrollHeight;
        var tableHeight = (pageHeight - 60 - 60 - 50 - 45 - 150) * 0.5;
        //console.log("loadTaskTable", tableHeight);

        $('#loadFileTable').dataTable({
            'data': [],
            'scrollX': true,
            'scrollY': tableHeight,
            'fixedHeader': true,
            "aoColumnDefs": [{
                'bSortable': false,
                'bVisible': false,
                // 'aTargets': [-1, -2]
            }],
            'aaSorting': [
                [0, 'desc']
            ],
            "oLanguage": {
                "sProcessing": "正在加载导入文件信息...",
                "sLengthMenu": "每页显示_MENU_条记录",
                "sInfo": "当前显示_START_到_END_条，共_TOTAL_条文件信息",
                "sInfoEmpty": "未查询到相关的文件信息",
                "sZeroRecords": "对不起，查询不到相关文件信息",
                "sInfoFiltered": "",
                "sSearch": "搜索",
                "oPaginate": {
                    "sPrevious": "",
                    "sNext": ""
                }
            },
            "iDisplayLength": -1,
            "aLengthMenu": [
                [5, 10, 25, 50, -1],
                [5, 10, 25, 50, "All"]
            ],
            "sDom": '<"clearfix"r>t<"clearfix">',
        });

        $("#loadFileTable").on('click', 'tbody > tr', function () {
            $file = $(this);
            $file.siblings().removeClass('primary'); //primary
            $file.addClass('primary');

            var fileRowData = $("#loadFileTable").dataTable().fnGetData($file);
            console.log("fileRowData", fileRowData);
            curFileId = fileRowData[0];
            curType = 2;
            taskmanageUtil.setViewdataBtnStat(fileRowData[6]);
        });
    }

    //根据数据类型ID加载相应的任务信息
    function loadTaskInfo(dataTypeID, centerCode) {
        var loadtasks = new Array();
        showLoader();
        $.getJSON("/datamanage/udp/listLoadTaskInfo", {
            "dataTypeId": dataTypeID,
            "centerCode": centerCode
        }).done(function (rsp) {
            if (rsp.code == 0) {
                var taskInfoList = rsp.data.batchInfoTable;
                console.log("loadTaskTable tbody > tr", taskInfoList);
                _.each(taskInfoList, function (item) {
                    var loadtask = {};
                    loadtask.taskID = item.batchID;
                    loadtask.taskName = '<span data-toggle="tooltip" data-placement="bottom" title=' + item.batchName + '>'
                        + item.batchName + '</span>';
                    loadtask.srcFileDir = '<span data-toggle="tooltip" data-placement="bottom" title=' + item.watchDir + '>'
                        + item.watchDir + '</span>';
                    loadtask.taskState = taskmanageUtil.getloadState(item.LOAD_STATE);
                    loadtask.beginTime = item.LOAD_START_TIME;
                    loadtask.endTime = item.LOAD_FINISH_TIME;
                    //对接任务不显示进度条
                    //if (item.taskType == 2 || item.taskType == 3 || item.taskType == 5)
                    //    loadtask.percent = '<span></span>';
                    //else
                    loadtask.percent = '<progress value=' + item.LOAD_RATIO + ' max=100></progress>' + '<span class="barNumber">'
                        + item.LOAD_RATIO + '%</span>';
                    loadtask.succRecordCount = item.LOAD_RECORD_COUNT;
                    if (item.ERROR_COUNT > 0) {
                        loadtask.errorRecordCount = '<a type="task" class="mr10 errorcount" style="color:blue; cursor: pointer">'
                            + item.ERROR_COUNT + '</a>';
                        //'<a>' + item.ERROR_COUNT + '</a>';
                    }
                    else
                        loadtask.errorRecordCount = 0;

                    loadtask.succFileCount = item.udpFileSuccessCount;
                    loadtask.errorFileCount = item.udpFileErrCount;
                    loadtask.taskType = taskmanageUtil.getTaskype(item.taskType);

                    loadtasks.push(loadtask);
                });
                if (taskInfoList.length > 0) {
                    $("#loadTaskTable").dataTable().fnAddData(loadtasks);
                    $(".errorcount").unbind("click", errorCountClick);
                    $(".errorcount").bind("click", errorCountClick);
                    //console.log("loadTaskTable tbody > tr", $("#loadTaskTable tbody > tr"));
                    if (curTaskId > 0) {
                        for (var i = 1; i <= $("#loadTaskTable tbody > tr").length; ++i) {
                            if ($('#loadTaskTable tbody > tr:nth-child(' + i + ') > td:nth-child(1)').text() == curTaskId) {
                                //$("#loadTaskTable")[0].scrollHeight = curScrollTop;
                                //console.log("loadTaskTable.scrollHeight", $("#loadTaskTable")[0].scrollHeight);
                                $(".dataTables_scrollBody").animate({scrollTop: curScrollTop}, 500);
                                //$("#loadTaskTable tbody").animate({scrollTop:1000}, 1500);
                                $('#loadTaskTable tbody > tr:nth-child(' + i + ')').trigger("click");
                                //$('#loadTaskTable tbody > tr:nth-child(' + i + ')').focus();
                            }
                        }
                    }
                    else
                        $("#loadTaskTable tbody > tr:nth-child(1)").trigger("click");
                }
                else{
                    hideLoader();
                }
            }
            else{
                hideLoader();
                Notify.show({
                    title: '加载任务信息失败！',
                    type: 'error'
                });
            }
        });
    }

    //加载对应任务下的导入文件信息
    function loadFileInfoForError(taskID, start, count, showDialog) {
        var fileErrorArray = new Array();

        $.getJSON("/datamanage/udp/listLoadFileInfo", {
            "batchID": taskID,
            "start": start,
            "count": count
        }).done(function (rsp) {
            if (rsp.code == 0) {
                fileInfoList = rsp.data.fileInfoTable;
                _.each(fileInfoList, function (item) {
                    if (item.ERROR_COUNT > 0) {
                        fileErrorArray[item.FILE_ID] = new Object({
                            'fileOldName': item.OLD_NAME,
                            'fileNewName': item.NEW_NAME,
                            'errorReason': item.ERROR_REASON,
                            'isDownLoaded': item.ERROR_FILE_DOWNLOADED,
                        });
                    }
                });
                if (showDialog) {
                    showErrorFilesInfoDialog(-1, fileErrorArray);
                }
            }
        });
    }

    //加载对应任务下的导入文件信息
    function loadFileInfo(taskID, start, count) {
        var loadfiles = new Array();
        var fileErrorArray = new Array();
        showLoader();

        $.getJSON("/datamanage/udp/listLoadFileInfo", {
            "batchID": taskID,
            "start": start,
            "count": count
        }).done(function (rsp) {
            if (rsp.code == 0) {
                var fileInfoList = rsp.data.fileInfoTable;
                console.log("fileInfoList", fileInfoList);
                //taskmanageUtil.setViewdataBtnStat(fileInfoList.length);
                _.each(fileInfoList, function (item) {
                    var loadfile = new Array();
                    loadfile.push(item.FILE_ID);
                    loadfile.push('<span data-toggle="tooltip" data-placement="bottom" title=' + item.OLD_NAME + '>' + item.OLD_NAME + '</span>');
                    loadfile.push(item.LOAD_START_TIME);
                    loadfile.push(item.LOAD_FINISH_TIME);
                    loadfile.push('<progress style="width: 100%;" value=' + item.LOAD_RATIO + ' max=100></progress>' + '<span class="barNumber">' + item.LOAD_RATIO + '%</span>');
                    loadfile.push(taskmanageUtil.getloadState(item.LOAD_STATE));
                    loadfile.push(item.LOAD_RECORD_COUNT);

                    if (item.ERROR_COUNT > 0) {
                        loadfile.push('<a type="file" class="mr10 errorcount" style="color:blue; cursor: pointer">'
                            + item.ERROR_COUNT + '</a>');

                        fileErrorArray[item.FILE_ID] = new Object({
                            'fileOldName': item.OLD_NAME,
                            'fileNewName': item.NEW_NAME,
                            'errorReason': item.ERROR_REASON,
                            'isDownLoaded': item.ERROR_FILE_DOWNLOADED,
                        });
                    }
                    else
                        loadfile.push(0);

                    // loadfile.push(taskmanageUtil.getloadState(item.LOAD_STATE));
                    // loadfile.push(0);
                    // loadfile.push(0);
                    // if (item.ERROR_COUNT > 0) {
                    //     fileErrorArray[item.FILE_ID] = new Object({
                    //         'fileOldName': item.OLD_NAME,
                    //         'fileNewName': item.NEW_NAME,
                    //         'errorReason': item.ERROR_REASON,
                    //         'isDownLoaded': item.ERROR_FILE_DOWNLOADED,
                    //     });
                    // }
                    loadfiles.push(loadfile);
                });
                curFileErrorArray = fileErrorArray;
                if (loadfiles.length > 0) {
                    $("#loadFileTable").dataTable().fnAddData(loadfiles);
                    $(".errorcount").unbind("click", errorCountClick);
                    $(".errorcount").bind("click", errorCountClick);
                }
                $("#filecount").text($("#loadFileTable tbody tr").length);
                if (loadfiles.length < fileBatchSize) {
                    hasMoreFiles = false;
                }
                hideLoader();
            }
            else{
                hideLoader();
            }
        });
    }

    //设置任务状态
    function setBatchStatus(status) {
        $.post("/datamanage/udp/SetBatchStatus", {
            "batchID": taskID,
            "status": status,
            "dbType": taskType
        }).done(function (rsp) {
            if (JSON.parse(rsp).code == 0) {
                processSelect(selectedNode);
            }
        });
    }

    //删除任务
    function deleteTaskInfo() {
        $.post("/datamanage/udp/DeleteDataImportBatchInfo", {
            "batchID": taskID
        }).done(function (rsp) {
            if (JSON.parse(rsp).code == 0) {
                curTaskId = -1;
                curFileId = -1;
                curScrollTop = 0;
                processSelect(selectedNode);
            }
        });
    }

    function errorCountClick(event) {
        console.log("currentTarget", event.currentTarget);
        var curTr = event.currentTarget.parentElement.parentElement;
        console.log("curTr", curTr);
        //curTr.children[9].children[0].value = "";
        if (event.currentTarget.getAttribute('type') == 'file') {
            console.log("id", curFileErrorArray[curTr.children[0].textContent]);
            showSingleErrorFileInfoDialog(curTr.children[0].textContent, curFileErrorArray);
        }
        else {
            //curTaskId = fileErrorArray[curTr.children[0].textContent];
            $("#loadFileTable").dataTable().fnClearTable();
            loadFileInfoForError(curTr.children[0].textContent, 0, errorFilesCount, true);
        }
    }

    function closeDialog() {
        $.magnificPopup.close();
    }

    function showSingleErrorFileInfoDialog(fileId, fileErrorArray) {
        Dialog.build({
            title: '导入出错原因',
            content: tplSingleErrorFileDialog({//loginname: "高级设置"
            }),
            rightBtn: '确定',
        }).show(
            function () {
                $("#error-fileId").val(fileId);
                $("#error-fileName").val(fileErrorArray[fileId].fileOldName);
                $("#error-fileName")[0].title = fileErrorArray[fileId].fileOldName;
                $("#error-reason").val(fileErrorArray[fileId].errorReason);
                $("#error-reason")[0].title = fileErrorArray[fileId].errorReason;
            })
    }

    function showErrorFilesInfoDialog(fileId, fileErrorArray) {
        Dialog.build({
            title: "导入出错原因",
            content: tplErrorFilesDialog({//loginname: "高级设置"
            }),
            width: 1100,
            minHeight: 550,
            rightBtnCallback: closeDialog,
            rightBtn: "确定",
        }).show(
            function () {
                //fromfile.initFunction();
                drawTable(fileId, fileErrorArray);
            })
    }

    function drawTable(fileId, fileErrorArray) {
        $('#errorfiles-table tbody').empty();
        var rowHtml = "";
        if (fileId < 0) {
            for (var fileIndex in fileErrorArray) {
                rowHtml = generateRow(fileIndex, fileErrorArray) + rowHtml;
                $('#errorfiles-table tbody tr:last-child td').find("select").each(function () {
                    $(this).select2();
                });
            }
        }
        else {
            rowHtml = generateRow(fileId, fileErrorArray) + rowHtml;
            $('#errorfiles-table tbody tr:last-child td').find("select").each(function () {
                $(this).select2();
            });
        }

        $('#errorfiles-table tbody').append(rowHtml);
    }

    function generateRow(fileId, fileErrorArray) {
        var rowHtml ='<tr>'+
            '<td><label type="text" class="edit lock-edit" style="border:0px" placeholder="">' +
            fileId + '</label></td>' +

            '<td><label type="text" class="edit lock-edit" style="border:0px" title="' +
            fileErrorArray[fileId].fileOldName + '">' +
            fileErrorArray[fileId].fileOldName + '</label></td>' +

            '<td><label type="text" style="border:0px; width: 100%;" title="' +
            fileErrorArray[fileId].errorReason + '">' +
            fileErrorArray[fileId].errorReason + '</label></td>'+ '</tr>';

        return rowHtml;
    }

    return {
        init: init,
        renderTaskmanageInfo: renderTaskmanageInfo,
    };

});