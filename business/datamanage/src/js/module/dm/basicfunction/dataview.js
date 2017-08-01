define('module/datamanage/dm/dataview', [
    'nova-dialog', 'nova-notify',
    'widget/jqx-binding',
    'utility/loaders',
    '../../../tpl/tpl-dataview',
    '../../dm/datatypemanage/dm-datatypemanage-util',
    //'../../../module/smartquery/toolbar',
], function (Dialog, Notify, jqxBinding, DOMLoader, dataviewTpl, datatypemanageUtil) {
    var _opts;
    var selectedNode;

    var dataViewRowLength = 500;

    dataviewTpl = _.template(dataviewTpl);

    function init(opts) {
        _opts = opts;
    }

    function renderDataView(type, info, batchId, fileId) {
        datatypemanageUtil.delDynamicLoading.css("/datamanage/css/dataimport/bootplus.css");
        datatypemanageUtil.delDynamicLoading.css("/datamanage/css/dataimport/dataimport.css");

        //type:1,浏览数据类型； 2,浏览任务；3,浏览文件
        switch(type){
            case 1:
                if (_.isUndefined(info.data.typeId)) {
                    $(_opts.container).empty();
                    return;
                }
                selectedNode = info;
                $(_opts.container).empty().append(dataviewTpl(info));
                constructQueryArgBasedDataType(selectedNode);
                break;
            case 2:
                $(_opts.container).empty().append(dataviewTpl());
                constructQueryArgBasedBatchId(batchId);
                break;
            case 3:
                $(_opts.container).empty().append(dataviewTpl());
                constructQueryArgBasedFileId(batchId, fileId);
                break;
            default:
                return;
        }
    }

    //构造浏览数据的查询参数
    function constructQueryArgBasedDataType(selectedNode) {
        var queryType = 2;
        var dataTypeSub = {};
        var request = {};
        request.name = "smartquery";
        request.mode = 3;
        request.taskType = 101;
        request.priority = 1;

        var taskDetail = {};
        var dataType = {};
        dataType.centerCode = selectedNode.data.centerCode;
        dataType.zoneId = selectedNode.data.zoneId;
        dataType.typeId = selectedNode.data.typeId;
        dataType.name = selectedNode.data.caption;

        taskDetail.dataType = dataType;
        var cond = {};
        cond.composite = true;
        cond.logicOperator = "and";

        var condDetail = {};
        condDetail.children = [];
        condDetail.condStr = [];
        condDetail.condStr.push('数据类型:' + selectedNode.data.typeId);

        var children = [];
        if (children.length != 0) {
            cond.children = JSON.stringify(children);
            taskDetail.cond = cond;
        }
        request.taskDetail = taskDetail;
        request.condStr = condDetail.condStr.join('\r\n');
        console.log("request", request);


        dataTypeSub.centerCode = selectedNode.data.centerCode;
        dataTypeSub.zoneId = selectedNode.data.zoneId;
        dataTypeSub.typeId = selectedNode.data.typeId;
        dataTypeSub.length = dataViewRowLength;
        submitQueryAndDisplayRes(request, queryType, dataTypeSub);
    }

    //构造浏览数据的查询参数
    function constructQueryArgBasedBatchId(batchId) {
        var queryType = 1;
        var request = {};
        request.name = "smartquery";
        request.mode = 3;
        request.taskType = 101;
        request.priority = 1;

        var taskDetail = {};
        var dataType = {};
        $.post('/datamanage/importbatch/GetBatchInfoByBatchID', {
            batchID: batchId,
        }).done(function (res) {
            var data = JSON.parse(res);
            if (data.code == 0) {
                console.log("data.data", data.data);// = data.data.batchInfo;
                var batchInfo = data.data.batchInfo;
                dataType.typeId = batchInfo.dataTypeID;
                dataType.centerCode = batchInfo.centerCode;
                dataType.zoneId = 0;
                dataType.name = "";

                taskDetail.dataType = dataType;
                var cond = {};
                cond.composite = true;
                cond.logicOperator = "and";

                var fileIdList = [];
                $.getJSON("/datamanage/udp/listLoadFileInfo", {
                    "batchID": batchId,
                    "start": 0,
                    "count": 30
                }).done(function (rsp) {
                    if (rsp.code == 0) {
                        fileInfoList = rsp.data.fileInfoTable;
                        _.each(fileInfoList, function (item) {
                            fileIdList.push(item.FILE_ID.toString());
                        });
                        if(fileIdList.length <= 0){
                            fileIdList.push(batchId.toString());
                        }
                        console.log("fileIdList", fileIdList);
                        var children = [];
                        children.push({
                            composite: false,
                            column: 'load_id',
                            opr: 'in',
                            value: fileIdList
                        });

                        if (children.length != 0) {
                            cond.children = JSON.stringify(children);
                            taskDetail.cond = cond;
                        }
                        var condDetail = {};
                        condDetail.children = [];
                        condDetail.condStr = [];
                        condDetail.condStr.push('数据类型:' + batchInfo.dataTypeID);
                        request.taskDetail = taskDetail;
                        request.condStr = condDetail.condStr.join('\r\n');
                        submitQueryAndDisplayRes(request, queryType);
                    }
                    else {
                        console.log("listLoadFileInfo获取任务信息出错：" , data.message);
                        Notify.show({
                            title: "获取任务信息出错！",
                            type: "error"
                        });
                    }
                });
            }
            else {
                console.log("获取任务信息出错：" , data.message);
                Notify.show({
                    title: "获取任务信息出错！",
                    type: "error"
                });
            }
        });
    }

    //构造浏览数据的查询参数
    function constructQueryArgBasedFileId(batchId, fileId) {
        var queryType = 1;
        var request = {};
        request.name = "smartquery";
        request.mode = 3;
        request.taskType = 101;
        request.priority = 1;

        var taskDetail = {};
        var dataType = {};
        $.post('/datamanage/importbatch/GetBatchInfoByBatchID', {
            batchID: batchId,
        }).done(function (res) {
            var data = JSON.parse(res);
            if (data.code == 0) {
                console.log("data.data", data.data);// = data.data.batchInfo;
                var batchInfo = data.data.batchInfo;
                dataType.typeId = batchInfo.dataTypeID;
                dataType.centerCode = batchInfo.centerCode;
                dataType.zoneId = 0;
                dataType.name = "";

                taskDetail.dataType = dataType;
                var cond = {};
                cond.composite = true;
                cond.logicOperator = "and";

                var fileIdList = [];
                fileIdList.push(fileId.toString());
                console.log("fileIdList", fileIdList);
                var children = [];
                children.push({
                    composite: false,
                    column: 'load_id',
                    opr: 'in',
                    value: fileIdList
                });

                if (children.length != 0) {
                    cond.children = JSON.stringify(children);
                    taskDetail.cond = cond;
                }
                var condDetail = {};
                condDetail.children = [];
                condDetail.condStr = [];
                condDetail.condStr.push('数据类型:' + batchInfo.dataTypeID);
                request.taskDetail = taskDetail;
                request.condStr = condDetail.condStr.join('\r\n');
                submitQueryAndDisplayRes(request, queryType);
            }
            else {
                console.log("获取任务信息出错：" , data.message);
                Notify.show({
                    title: "获取任务信息出错！",
                    type: "error"
                });
            }
        });
    }

    //提交查询任务，展示查询结果
    function submitQueryAndDisplayRes(request, queryType, dataTypeSub){
        //showLoader();
        var panelHeight = document.getElementById('content1').offsetHeight;
        var menuHeight = document.getElementById('panel-menu').offsetHeight;
        $('#gridContainer').height(panelHeight-menuHeight);
        DOMLoader('#gridContainer');

        if(queryType == 1){
            $.getJSON('/datamanage/smartquery/submitintelligentquery', request).
                done(
                function(rsp) {
                    if (rsp.code != 0) {
                        console.log("浏览数据,提交查询任务失败:", rsp.message);
                        Notify.show({
                            title: "浏览数据失败！",
                            type: "error"
                        });
                        //hideLoader();
                        DOMLoader.hide();
                    }
                    else {
                        //toolbar.init({
                        //    container: $('#panel-menu'),
                        //    submit: false,
                        //    saveTask: false,
                        //    saveModel :false,
                        //    saveAsModel: false,
                        //    exportData: false,
                        //    download: false,
                        //    statistic: false,
                        //    filter: false,
                        //    group: false,
                        //    locate: false
                        //});
                        //toolbar.renderToolbar();
                        jqxBinding.TryBindResult('#gridContainer', rsp.data);
                    }
                }
            );
        }
        else if(queryType == 2){
            //toolbar.init({
            //    container: $('#panel-menu'),
            //    submit: false,
            //    saveTask: false,
            //    saveModel :false,
            //    saveAsModel: false,
            //    exportData: false,
            //    download: false,
            //    statistic: false,
            //    filter: false,
            //    group: false,
            //    locate: false
            //});
            //toolbar.renderToolbar();
            var viewCond = {};
            viewCond.queryType = queryType;
            viewCond.dataType = dataTypeSub;
            viewCond.queryArea = 1;
            jqxBinding.TryBindResult('#gridContainer', viewCond);
        }
    }

    return {
        init: init,
        renderDataView: renderDataView,
    };

});
