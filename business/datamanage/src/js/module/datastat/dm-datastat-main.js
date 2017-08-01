/**
 * Created by root on 3/15/16.
 */

require(["moment", 'underscore', 'nova-notify', 'nova-dialog',
        "../datastat/dm-datastat-init.js",
        '../datastat/dm-datastat-treetable.js',
        '../datastat/dm-datastat-echarts.js',
        '../datastat/dm-datastat-datepicker',
        '../../tpl/tpl-dataTypeFilterForStat',
        "../datastat/jquery.treetable.js",],
    function(moment, _, Notify, Dialog, init, treetable, echarts, datePicker, tplDataTypeFilterDialog) {
        tplDataTypeFilterDialog = _.template(tplDataTypeFilterDialog);
        var dataTypeInfoArray = new Array();
        var dataTypeInfoArrayForUser = new Array();
        //统计类型:1，业务时间统计；2，接收/导入数据量统计
        var statType = 1;
        var dataTypeInfoDic = new Array();
        var dirInfoDic = new Array();
        var sysStructureInfo;
        var userStructureInfo;
        var nodeType;
        var dataTypeList = new Array();
        var rootDirId;
        var curDirId = -1;

        var curTitleName = "";

        var curDateNum = 0;
        var dayWidth = 200;
        var dataTypeOption = init.initLoadStatOption();

        var businessStatOption = init.initBusinessStatOption();

        var batchOption = init.initBatchStatOption();

        var tableHeight = 380;
        var scrollHeight = 0;

        var isFirst = true;
        var dataTypeFilterParams = new Object({
            'beginTime': '',
            'endTime': '',
            'rate': 0,
            'batchFlag': 0
        });
        var option = {
            theme: 'vsStyle',
            expandLevel: 4,
            isFirst: true,
            beforeExpand: function ($treeTable, id) {
                if ($('.' + id, $treeTable).length) {
                    return;
                }
                //var html = '<tr id="8" pId="6"><td>5.1</td><td>ajax</td></tr>'
                //    + '<tr id="9" pId="6"><td>5.2</td><td>xx</td></tr>';

                //$treeTable.addChilds(html);\
                //$treeTable.cl
            },
            onSelect: function ($treeTable, id) {
                //console.log('onSelect:' + id);
            }
        };

        var filterDataTypeArray = [];
        var sysStructureInfoForLoad = new Object({
            "dirInfoDic": [],
            "dataTypeInfoDic": [],
            "isVisible": false,
        });

        datePicker.initDate('dateRange'); //dateinput.id
        setPageSize();
        init.initPage(tableHeight);
        businessStatConfig();

        $.getJSON('/datamanage/dataimport/listdatasource').done(function (rsp) {
            if (rsp.code == 0) {
                console.log("数据类型信息:" + rsp.data);
                dataTypeInfoArray = getdataTypeInfoArray(rsp.data); //rsp.data.sysTree[0];
                console.log("listdatasource dataTypeInfoArray", dataTypeInfoArray);
                //dataTypeInfoArrayForUser = rsp.data.personalTree[0];
                getTreeInfo();
                getSumStatInfo();//sysStructureInfo
                //$('#treeTable-sum-datastat').treeTable(option);
                //echarts.refresh(dataTypeOption);
                console.log("sysInfo:" + treetable.sysStructureInfo);
                hideLoader();
            }
            else {
                alert("获取数据类型信息失败:" + rsp.message);
            }
        });

        $("#import-datastat").click(function () {
            showLoader();
            initDataTypeFilterParams();
            dataTypeList.splice(0, dataTypeList.length);
            statType = 2;
            statTypeChanged();
        });

        $("#business-datastat").click(function () {
            showLoader();
            dataTypeList.splice(0, dataTypeList.length);
            $("#CountTable").show();
            $("#pieGraphic").hide();
            statType = 1;
            statTypeChanged();
        });

        $("#treeTable-sum-datastat").delegate("tr", "click", treeRowClick);

        $("#btn-query").click(refreshStatChart);

        $("#btn-refresh").click(btnRefresh);

        function btnRefresh() {
            initDataTypeFilterParams();
            refreshAll(false);
        }

        function refreshAll(isFilter) {
            showLoader();
            //init.initPage();
            setPageSize();
            scrollHeight = $('#treeTable-sum-datastat')[0].scrollHeight;
            isFirst = true;

            $.getJSON('/datamanage/dataimport/listdatasource').done(function (rsp) {
                if (rsp.code == 0) {
                    console.log("listdatasource 数据类型信息:" + rsp.data);
                    dataTypeInfoArray = getdataTypeInfoArray(rsp.data);//.sysTree[0]; //rsp.data.personalTree[0];//
                    getTreeInfo();
                    getSumStatInfo(isFilter);//sysStructureInfo
                    //$('#treeTable-sum-datastat').treeTable(option);
                    //echarts.refresh(dataTypeOption);
                    //var $trs = $('#treeTable-sum-datastat').find('tr');
                    //treetable.$treeTable.initRelation($trs, true);
                    console.log("sysInfo:" + treetable.sysStructureInfo);
                }
                else {
                    hideLoader();
                    alert("获取数据类型信息失败:" + rsp.message);
                }
            });
        }

        function getdataTypeInfoArray(dataTypeInfoObj) {
            var allDataTypeInfo = new Object({
                'dirId': -77777777,
                'title': '所有数据类型',
                'extraClasses': 'nv-dir',
                'children': []
            });
            if (dataTypeInfoObj.sysTree != undefined && dataTypeInfoObj.sysTree.length > 0)
                allDataTypeInfo.children.push(dataTypeInfoObj.sysTree[0]);
            if (dataTypeInfoObj.personalTree != undefined && dataTypeInfoObj.personalTree.length > 0)
                allDataTypeInfo.children.push(dataTypeInfoObj.personalTree[0]);

            return allDataTypeInfo; //dataTypeInfoObj.personalTree[0]; //
        }

        $("#stat-granularity").bind("change", echarts.granularitySelectChanged);

        $("#statType").bind("change", statContentChanged);

        $("#tableType").bind("change", echarts.tableTypeChanged);

        $("#btn-datatype-filter").bind("click", showDatatypeFilterDialog);

        function showDatatypeFilterDialog() {
            //console.log("showDatatypeFilterDialog");
            Dialog.build({
                title: "<i class='fa fa-filter' style='color: #519f50'></i>筛选统计的数据类型",
                content: tplDataTypeFilterDialog({
                    //loginname: "高级设置"
                }),
                leftBtn: '恢复默认设置',
                width: 500,
                leftBtnCallback: function () {// 确认
                    setDefaultDialog();
                },
                rightBtnCallback: function () {// 确认
                    checkInputParams();
                    saveDatatypeFilterDialog();
                    getDataTypeAfterFilter();
                    $.magnificPopup.close();
                },
            }).show(function () {
                datePicker.initDateForFilter('filterDateRange');
                setDatatypeFilterDialog();
            });
        }

        function getDataTypeAfterFilter() {
            if(dataTypeFilterParams.rate <= 0 && dataTypeFilterParams.batchFlag == 0){
                refreshAll(false);
            }
            else{
                $.post('/datamanage/dataimport/GetDataTypeAfterFilter', {
                    "beginTime": dataTypeFilterParams.beginTime,
                    "endTime": dataTypeFilterParams.endTime,
                    "rate": dataTypeFilterParams.rate,
                    "batchFlag": dataTypeFilterParams.batchFlag
                }).done(function (res) {
                    var data = JSON.parse(res);
                    if (data.code == 0) {
                        console.log("getDataTypeAfterFilter成功！", data.data);
                        Notify.show({
                            title: "筛选统计的数据类型成功！",
                            type: "success"
                        });
                        filterDataTypeArray = data.data;
                        refreshAll(true);
                    }
                    else {
                        console.log("getDataTypeAfterFilter失败！", data.message);
                        Notify.show({
                            title: "筛选统计的数据类型失败！",
                            type: "error"
                        });
                    }
                });
            }
        }

        function setDefaultDialog() {
            dataTypeFilterParams = new Object({
                'beginTime': '',
                'endTime': '',
                'rate': 0,
                'batchFlag': 0
            });
            document.getElementById('haveRunDJTask').checked =
                dataTypeFilterParams.batchFlag == 0 ? false : true;
            $("#diff-proportion").val(dataTypeFilterParams.rate);
            if (dataTypeFilterParams.beginTime.length <= 0 || dataTypeFilterParams.endTime.length <= 0) {
                $('#filterDateRange').val(moment().subtract(2, 'days').format("YYYY-MM-DD")
                    + ' - ' + moment().format("YYYY-MM-DD"));
            }
            else {
                $('#filterDateRange').val(dataTypeFilterParams.beginTime
                    + ' - ' + dataTypeFilterParams.endTime);
            }
            //$('#filterDateRange').val(dataTypeFilterParams.beginTime
            //    + ' - ' + dataTypeFilterParams.endTime);
        }

        function initDataTypeFilterParams(){
            dataTypeFilterParams.rate = 0;
            dataTypeFilterParams.batchFlag = 0;
        }

        //设置【筛选统计的数据类型对话框】的参数值
        function setDatatypeFilterDialog() {
            document.getElementById('haveRunDJTask').checked =
                dataTypeFilterParams.batchFlag == 0 ? false : true;
            $("#diff-proportion").attr("value", dataTypeFilterParams.rate);
            if (dataTypeFilterParams.beginTime.length <= 0 || dataTypeFilterParams.endTime.length <= 0) {
                $('#filterDateRange').val(moment().subtract(2, 'days').format("YYYY-MM-DD")
                    + ' - ' + moment().format("YYYY-MM-DD"));
            }
            else {
                $('#filterDateRange').val(dataTypeFilterParams.beginTime
                    + ' - ' + dataTypeFilterParams.endTime);
            }
        }

        function checkInputParams() {
        }

        //保存【筛选统计的数据类型对话框】的参数值
        function saveDatatypeFilterDialog() {
            if (document.getElementById('haveRunDJTask').checked)
                dataTypeFilterParams.batchFlag = 1;
            else
                dataTypeFilterParams.batchFlag = 0;
            dataTypeFilterParams.rate = $("#diff-proportion")[0].value;
            var dateArray = $('#filterDateRange')[0].value.split(" - ");
            if (dateArray.length < 2) {
                Notify.show({
                    title: "时间范围异常，请重新设置！",
                    type: "error"
                });
                hideLoader();
                return;
            }
            else {
                dataTypeFilterParams.beginTime = dateArray[0].trim();
                dataTypeFilterParams.endTime = dateArray[1].trim();
            }
        }

        function refreshStatChart() {
            showLoader();
            switch (statType) {
                case 1:
                    //businessStatOption.title.text += " 业务时间数据量";
                    echarts.getBusinessTimeWithInterval(dataTypeList, businessStatOption, curDateNum);
                    break;
                case 2:
                    refreshLoadStatChart();
                    //echarts.getLoadWithInterval(dataTypeList, dataTypeOption, batchOption, curDateNum);
                    break;
                default:
                    break;
            }
        }

        function statContentChanged() {
            var pageHeight = $("#main")[0].offsetHeight;
            if ($('#statType')[0].value == 1) {
                //document.getElementById("CountTable").style.height = (pageHeight-60-60-50-45)/2+40 + "px";
                //document.getElementById("pieGraphic").style.height = 0;
                $("#CountTable").show();
                $("#pieGraphic").hide();
            }
            else {
                $("#CountTable").hide();
                $("#pieGraphic").show();
                //document.getElementById("CountTable").style.height = 0;
                //document.getElementById("pieGraphic").style.height = (pageHeight-60-60-50-45)/2+40 + "px";
            }
            refreshLoadStatChart();
        }

        function refreshLoadStatChart() {
            switch ($('#statType')[0].value) {
                case "1":
                    $('#table-type').show();
                    //dataTypeOption.title.text += " 接收/导入数据量";
                    echarts.getLoadWithInterval(dataTypeList, dataTypeOption, batchOption, curDateNum, curTitleName);
                    break;
                case "2":
                    $('#table-type').hide();
                    echarts.getLoadWithInterval(dataTypeList, dataTypeOption, batchOption, curDateNum, curTitleName);
                    break;
                case "3":
                    $('#table-type').hide();
                    echarts.getLoadWithInterval(dataTypeList, dataTypeOption, batchOption, curDateNum, curTitleName);
                    break;
                default:
                    $('#table-type').show();
                    //dataTypeOption.title.text += " 接收/导入数据量";
                    echarts.getLoadWithInterval(dataTypeList, dataTypeOption, batchOption, curDateNum, curTitleName);
                    break;
            }
        }

        function getTreeInfo() {
            treetable.initId();
            treetable.getTreeStructure(dataTypeInfoArray, -1);
            //treetable.getTreeStructureForUser(dataTypeInfoArrayForUser, -1);
            sysStructureInfo = treetable.sysStructureInfo;
            //userStructureInfo = treetable.userStructureInfo;
        }

        function loadSumStat(isFilter) {
            if (isFilter) {
                var dataTypeStatInfo = sysStructureInfoForLoad;
                //console.log("dataTypeStatInfo", dataTypeStatInfo);
                //console.log("sysStructureInfo", sysStructureInfo.dataTypeInfoDic);
                //console.log("filterDataTypeArray", filterDataTypeArray);
                for (var index in sysStructureInfo.dataTypeInfoDic) {
                    sysStructureInfo.dataTypeInfoDic[index].isFilter = false;
                }
                for (var index in filterDataTypeArray) {
                    if (sysStructureInfo.dataTypeInfoDic[filterDataTypeArray[index]] != undefined)
                        sysStructureInfo.dataTypeInfoDic[filterDataTypeArray[index]].isFilter = true;
                }
                for (var i = 0; i < dataTypeStatInfo.length; ++i) {
                    //console.log("dataTypeID", dataTypeStatInfo[i].dataTypeID);
                    if (sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID + '_' + dataTypeStatInfo[i].centerCode).toString()] != undefined
                        && sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID + '_' + dataTypeStatInfo[i].centerCode).toString()].isFilter) {
                        sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID +
                        '_' + dataTypeStatInfo[i].centerCode).toString()].isVisible = true;
                        sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID +
                        '_' + dataTypeStatInfo[i].centerCode).toString()].statInfo = dataTypeStatInfo[i];
                    }
                }
                for (var index in sysStructureInfo.dirInfoDic) {
                    var dirInfo = sysStructureInfo.dirInfoDic[index];
                    for (var subIndex in dirInfo.dataTypeList) {
                        var subDataType = dirInfo.dataTypeList[subIndex];
                        if (sysStructureInfo.dataTypeInfoDic[subDataType].statInfo != null) {
                            dirInfo.statInfo.sumStorageSize += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.sumStorageSize;
                            dirInfo.statInfo.sumCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.sumCounts;
                            dirInfo.statInfo.todaydayCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.todaydayCounts;
                            dirInfo.statInfo.yesterdayCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yesterdayCounts;
                            dirInfo.statInfo.beforeYesterdayCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.beforeYesterdayCounts;
                            dirInfo.statInfo.weekCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.weekCounts;
                            dirInfo.statInfo.monthCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.monthCounts;
                            dirInfo.statInfo.yearCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yearCounts;

                            dirInfo.statInfo.sumCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.sumCountsRec;
                            dirInfo.statInfo.todaydayCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.todaydayCountsRec;
                            dirInfo.statInfo.yesterdayCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yesterdayCountsRec;
                            dirInfo.statInfo.beforeYesterdayCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.beforeYesterdayCountsRec;
                            dirInfo.statInfo.weekCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.weekCountsRec;
                            dirInfo.statInfo.monthCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.monthCountsRec;
                            dirInfo.statInfo.yearCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yearCountsRec;
                        }
                    }
                }

                setTreeTable();
                $('#treeTable-sum-datastat')[0].scrollHeight = scrollHeight;
                hideLoader();
            }
            else {
                $.getJSON('/datamanage/dataimport/GetAllDataTypeLoadStatInfo').done(function (rsp) {
                    if (rsp.code == 0) {
                        var dataTypeStatInfo = rsp.data.loadStatInfos;
                        sysStructureInfoForLoad = dataTypeStatInfo;
                        console.log("GetAllDataTypeLoadStatInfo dataTypeStatInfo", dataTypeStatInfo);
                        for (var i = 0; i < dataTypeStatInfo.length; ++i) {
                            //console.log("dataTypeID", dataTypeStatInfo[i].dataTypeID);
                            if (sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID + '_' + dataTypeStatInfo[i].centerCode).toString()] != undefined) {
                                sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID +
                                '_' + dataTypeStatInfo[i].centerCode).toString()].isVisible = true;
                                sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID +
                                '_' + dataTypeStatInfo[i].centerCode).toString()].statInfo = dataTypeStatInfo[i];
                            }
                        }
                        for (var index in sysStructureInfo.dirInfoDic) {
                            var dirInfo = sysStructureInfo.dirInfoDic[index];
                            for (var subIndex in dirInfo.dataTypeList) {
                                var subDataType = dirInfo.dataTypeList[subIndex];
                                if (sysStructureInfo.dataTypeInfoDic[subDataType].statInfo != null) {
                                    dirInfo.statInfo.sumStorageSize += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.sumStorageSize;
                                    dirInfo.statInfo.sumCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.sumCounts;
                                    dirInfo.statInfo.todaydayCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.todaydayCounts;
                                    dirInfo.statInfo.yesterdayCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yesterdayCounts;
                                    dirInfo.statInfo.beforeYesterdayCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.beforeYesterdayCounts;
                                    dirInfo.statInfo.weekCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.weekCounts;
                                    dirInfo.statInfo.monthCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.monthCounts;
                                    dirInfo.statInfo.yearCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yearCounts;

                                    dirInfo.statInfo.sumCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.sumCountsRec;
                                    dirInfo.statInfo.todaydayCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.todaydayCountsRec;
                                    dirInfo.statInfo.yesterdayCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yesterdayCountsRec;
                                    dirInfo.statInfo.beforeYesterdayCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.beforeYesterdayCountsRec;
                                    dirInfo.statInfo.weekCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.weekCountsRec;
                                    dirInfo.statInfo.monthCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.monthCountsRec;
                                    dirInfo.statInfo.yearCountsRec += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yearCountsRec;
                                }
                            }
                        }

                        setTreeTable();
                        $('#treeTable-sum-datastat')[0].scrollHeight = scrollHeight;
                        hideLoader();
                    }
                    else {
                        alert("接收/导入数据量统计失败:" + rsp.message);
                        hideLoader();
                    }
                });
            }
        }

        function businessSumStat() {
            $.getJSON('/datamanage/dataimport/GetAllDataTypeBusinessTimeStatInfo').done(function (rsp) {
                if (rsp.code == 0) {
                    var dataTypeStatInfo = rsp.data.loadStatInfos;
                    console.log("GetAllDataTypeBusinessTimeStatInfo dataTypeStatInfo", dataTypeStatInfo);
                    for (var i = 0; i < dataTypeStatInfo.length; ++i) {
                        //console.log("dataTypeID", dataTypeStatInfo[i].dataTypeID);
                        if (sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID +
                            '_' + dataTypeStatInfo[i].centerCode).toString()] != undefined) {
                            sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID +
                            '_' + dataTypeStatInfo[i].centerCode).toString()].isVisible = true;
                            sysStructureInfo.dataTypeInfoDic[(dataTypeStatInfo[i].dataTypeID +
                            '_' + dataTypeStatInfo[i].centerCode).toString()].statInfo = dataTypeStatInfo[i];
                        }
                    }
                    for (var index in sysStructureInfo.dirInfoDic) {
                        var dirInfo = sysStructureInfo.dirInfoDic[index];
                        for (var subIndex in dirInfo.dataTypeList) {
                            var subDataType = dirInfo.dataTypeList[subIndex];
                            if (sysStructureInfo.dataTypeInfoDic[subDataType].statInfo != null) {
                                dirInfo.statInfo.sumStorageSize += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.sumStorageSize;
                                dirInfo.statInfo.sumCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.sumCounts;
                                dirInfo.statInfo.todaydayCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.todaydayCounts;
                                dirInfo.statInfo.yesterdayCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yesterdayCounts;
                                dirInfo.statInfo.beforeYesterdayCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.beforeYesterdayCounts;
                                dirInfo.statInfo.weekCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.weekCounts;
                                dirInfo.statInfo.monthCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.monthCounts;
                                dirInfo.statInfo.yearCounts += sysStructureInfo.dataTypeInfoDic[subDataType].statInfo.yearCounts;
                            }
                        }
                    }
                    setTreeTable();
                }
                else {
                    alert("按业务时间统计失败！");
                    console.log("按业务时间统计失败: " + rsp.message);
                }
            });
        }

        function setTreeTable() {
            //alert("setTreeTable");
            // $('#treeTable-sum-datastat')[0].children[1].innerHTML = "";
            treetable.initId();
            switch (statType) {
                case 1:
                    rootDirId = treetable.setTreeTableForBusinessStat(dataTypeInfoArray, -1, sysStructureInfo);
                    $('#treeTable-sum-datastat')[0].children[1].innerHTML = treetable.getTreeTableHtml();
                    //alert(rootDirId);
                    initChartsForBusinessStat();
                    break;
                case 2:
                    rootDirId = treetable.setTreeTableFoLoadStat(dataTypeInfoArray, -1, sysStructureInfo);
                    $('#treeTable-sum-datastat')[0].children[1].innerHTML = treetable.getTreeTableHtml();
                    //setTreeTableFoLoadStat();
                    //rootDirId = treetable.setTreeTableFoLoadStatForUser(dataTypeInfoArrayForUser, -1, userStructureInfo);
                    initChartsForLoadStat();
                    break;
                default:
                    break;
            }
            option.isFirst = isFirst;
            //$('#treeTable-sum-datastat').removeEventL;
            $('#treeTable-sum-datastat').treeTable(option);
            $("#treeTable-sum-datastat").delegate("tr", "click", treeRowClick);
            //isFirst = false;
            option.isFirst = isFirst;
            //$('#treeTable-sum-datastat').treeTable(option);
        }

        function initChartsForLoadStat() {
            dataTypeOption.title.text = '';
            businessStatOption.title.text = '';
            if (dataTypeList.length <= 0) {
                //if(rootDirId>0)
                {
                    dataTypeOption.title.text = sysStructureInfo.dirInfoDic[rootDirId].name;
                    businessStatOption.title.text = sysStructureInfo.dirInfoDic[rootDirId].name;
                }
                nodeType = 2;
                curDirId = rootDirId;
                for (var i = 0; i < sysStructureInfo.dirInfoDic[rootDirId].dataTypeList.length; ++i) {
                    if (sysStructureInfo.dataTypeInfoDic[sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i]].isVisible){
                        dataTypeList.push(new Object({
                            "centerCode": sysStructureInfo.dirInfoDic[rootDirId].dataTypeList[i].split("_")[1],
                            "dataTypeID": sysStructureInfo.dirInfoDic[rootDirId].dataTypeList[i].split("_")[0],
                        }));
                    }
                }
                $("#treeTable-sum-datastat")[0].rows[1].classList.add('clicked');
                $("#batchsOption").hide();
            }
            else {
                switch (nodeType) {
                    case 1:
                        dataTypeOption.title.text = sysStructureInfo.
                            dataTypeInfoDic[(dataTypeList[0].dataTypeID + '_' + dataTypeList[0].centerCode).toString()].name;
                        dataTypeOption.title.text = sysStructureInfo.
                            dataTypeInfoDic[(dataTypeList[0].dataTypeID + '_' + dataTypeList[0].centerCode).toString()].name;
                        for (var i = 1; i < $("#treeTable-sum-datastat")[0].rows.length; ++i) {
                            if ($("#treeTable-sum-datastat")[0].rows[i].attributes['datatypeid'] != undefined &&
                                $("#treeTable-sum-datastat")[0].rows[i].attributes['datatypeid'].value == dataTypeList[0].dataTypeID) {
                                $("#treeTable-sum-datastat")[0].rows[i].classList.add('clicked');
                                break;
                            }
                        }
                        $("#batchsOption").show();
                        break;
                    case 2:
                        dataTypeList.splice(0, dataTypeList.length);
                        if (curDirId > 0) {
                            dataTypeOption.title.text = sysStructureInfo.dirInfoDic[curDirId].name;
                            dataTypeOption.title.text = sysStructureInfo.dirInfoDic[curDirId].name;
                        }
                        for (var i = 0; i < sysStructureInfo.dirInfoDic[curDirId].dataTypeList.length; ++i) {
                            if (sysStructureInfo.dataTypeInfoDic[sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i]].isVisible) {
                                dataTypeList.push(new Object({
                                    "centerCode": sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i].split("_")[1],
                                    "dataTypeID": sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i].split("_")[0],
                                }));
                            }
                            // dataTypeList.push(new Object({
                            //     "centerCode": sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i].split("_")[1],
                            //     "dataTypeID": sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i].split("_")[0],
                            // }));
                        }
                        for (var i = 1; i < $("#treeTable-sum-datastat")[0].rows.length; ++i) {
                            if ($("#treeTable-sum-datastat")[0].rows[i].attributes['dirId'] != undefined &&
                                $("#treeTable-sum-datastat")[0].rows[i].attributes['dirId'].value == curDirId) {
                                $("#treeTable-sum-datastat")[0].rows[i].classList.add('clicked');
                                break;
                            }
                        }
                        $("#batchsOption").hide();
                        break;
                }
            }
            dataTypeOption.title.text += " 接收/导入数据量";
            refreshLoadStatChart();
        }

        function initChartsForBusinessStat() {
            dataTypeOption.title.text = '';
            businessStatOption.title.text = '';
            if (dataTypeList.length <= 0) {
                //if(rootDirId>0)
                {
                    dataTypeOption.title.text = sysStructureInfo.dirInfoDic[rootDirId].name;
                    businessStatOption.title.text = sysStructureInfo.dirInfoDic[rootDirId].name;
                    curTitleName = sysStructureInfo.dirInfoDic[rootDirId].name;
                }
                nodeType = 2;
                curDirId = rootDirId;
                for (var i = 0; i < sysStructureInfo.dirInfoDic[rootDirId].dataTypeList.length; ++i) {
                    if (sysStructureInfo.dataTypeInfoDic[sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i]].isVisible){
                        dataTypeList.push(new Object({
                            "centerCode": sysStructureInfo.dirInfoDic[rootDirId].dataTypeList[i].split("_")[1],
                            "dataTypeID": sysStructureInfo.dirInfoDic[rootDirId].dataTypeList[i].split("_")[0],
                        }));
                    }
                }
                $("#treeTable-sum-datastat")[0].rows[1].classList.add('clicked');
            }
            else {
                switch (nodeType) {
                    case 1:
                        dataTypeOption.title.text = sysStructureInfo.
                            dataTypeInfoDic[(dataTypeList[0].dataTypeID + '_' + dataTypeList[0].centerCode).toString()].name;
                        businessStatOption.title.text = sysStructureInfo.
                            dataTypeInfoDic[(dataTypeList[0].dataTypeID + '_' + dataTypeList[0].centerCode).toString()].name;
                        curTitleName = sysStructureInfo.
                            dataTypeInfoDic[(dataTypeList[0].dataTypeID + '_' + dataTypeList[0].centerCode).toString()].name;

                        for (var i = 1; i < $("#treeTable-sum-datastat")[0].rows.length; ++i) {
                            if ($("#treeTable-sum-datastat")[0].rows[i].attributes['datatypeid'] != undefined &&
                                $("#treeTable-sum-datastat")[0].rows[i].attributes['datatypeid'].value == dataTypeList[0].dataTypeID) {
                                $("#treeTable-sum-datastat")[0].rows[i].classList.add('clicked');
                                break;
                            }
                        }
                        break;
                    case 2:
                        dataTypeList.splice(0, dataTypeList.length);
                        if (curDirId > 0) {
                            dataTypeOption.title.text = sysStructureInfo.dirInfoDic[curDirId].name;
                            businessStatOption.title.text = sysStructureInfo.dirInfoDic[curDirId].name;
                            curTitleName = sysStructureInfo.dirInfoDic[curDirId].name;
                        }
                        for (var i = 0; i < sysStructureInfo.dirInfoDic[curDirId].dataTypeList.length; ++i) {
                            if (sysStructureInfo.dataTypeInfoDic[sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i]].isVisible) {
                                if (sysStructureInfo.dataTypeInfoDic[sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i]].isVisible){
                                    dataTypeList.push(new Object({
                                        "centerCode": sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i].split("_")[1],
                                        "dataTypeID": sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i].split("_")[0],
                                    }));
                                }
                            }
                        }
                        for (var i = 1; i < $("#treeTable-sum-datastat")[0].rows.length; ++i) {
                            if ($("#treeTable-sum-datastat")[0].rows[i].attributes['dirId'] != undefined &&
                                $("#treeTable-sum-datastat")[0].rows[i].attributes['dirId'].value == curDirId) {
                                $("#treeTable-sum-datastat")[0].rows[i].classList.add('clicked');
                                break;
                            }
                        }
                        break;
                }
            }

            businessStatOption.title.text += " 业务时间数据量";
            echarts.getBusinessTimeWithInterval(dataTypeList, businessStatOption, curDateNum);
        }

        function getSumStatInfo(isFilter) {
            switch (statType) {
                case 1:
                    businessSumStat();
                    break;
                case 2:
                    loadSumStat(isFilter);
                    break;
                default:
                    break;
            }
        }

        //统计类型statType变化
        function statTypeChanged() {
            dataTypeList.splice(0, dataTypeList.length);
            scrollHeight = 0;
            switch (statType) {
                case 1:
                    //dataTypeOption.legend.show = false;
                    businessStatConfig();
                    break;
                case 2:
                    //dataTypeOption.legend.show = true;
                    importStatConfig();
                    break;
                default:
                    businessStatConfig();
                    break;
            }

            getTreeInfo();
            getSumStatInfo();
            //$('#treeTable-sum-datastat').treeTable(option);
            //echarts.refresh(dataTypeOption);

            // hideLoader();
        }

        function importStatConfig() {
            $('#recCount').show();
            $('#recCountToday').show();
            $('#recCountYesterday').show();
            $('#recCountBeforeYesterday').show();
            $('#recCountWeek').show();
            $('#recCountMonth').show();
            $('#recCountYear').show();

            $('#count')[0].innerText = "导入数据量";
            $('#countToday')[0].innerText = "今日导入数据量";
            $('#countYesterday')[0].innerText = "昨日导入数据量";
            $('#countBeforeYesterday')[0].innerText = "前日导入数据量";
            $('#countWeek')[0].innerText = "最近一周导入";
            $('#countMonth')[0].innerText = "最近一月导入";
            $('#countYear')[0].innerText = "最近一年导入";

            $('#table-type').show();
            if ($('#tableType')[0].value == 1)
                $('#countsCol')[0].innerHTML = '导入数据量(条)';
            else if ($('#tableType')[0].value == 2)
                $('#countsCol')[0].innerHTML = '接收数据量(条)';

            $('#stat-type').show();
            $('#btn-datatype-filter').show();
        }

        function businessStatConfig() {
            $('#recCount').hide();
            $('#recCountToday').hide();
            $('#recCountYesterday').hide();
            $('#recCountBeforeYesterday').hide();
            $('#recCountWeek').hide();
            $('#recCountMonth').hide();
            $('#recCountYear').hide();

            $('#count')[0].innerText = "数据量";
            $('#countToday')[0].innerText = "今日数据量";
            $('#countYesterday')[0].innerText = "昨日数据量";
            $('#countBeforeYesterday')[0].innerText = "前日数据量";
            $('#countWeek')[0].innerText = "最近一周";
            $('#countMonth')[0].innerText = "最近一月";
            $('#countYear')[0].innerText = "最近一年";

            $('#table-type').hide();
            $('#stat-type').hide();
            $('#btn-datatype-filter').hide();
            $('#countsCol').innerHTML = '数据量(条)';
        }

        function treeRowClick() {
            //var curRowIndex = $(this).parent().children('tr').index($(this));
            var typeId = $(this).attr('dataTypeId') || -1;
            var centerCode = $(this).attr('centerCode') || -1;

            dataTypeList.splice(0, dataTypeList.length);
            if (typeId >= 0) {
                dataTypeOption.title.text = sysStructureInfo.dataTypeInfoDic[(typeId + '_' + centerCode).toString()].name + " 接收/导入数据量";
                businessStatOption.title.text = sysStructureInfo.dataTypeInfoDic[(typeId + '_' + centerCode).toString()].name + " 业务时间数据量";
                curTitleName = sysStructureInfo.dataTypeInfoDic[(typeId + '_' + centerCode).toString()].name;
                nodeType = 1;
                dataTypeList.push(new Object({
                    "centerCode": centerCode,
                    "dataTypeID": typeId,
                }));

                $("#batchsOption").show();
            }
            else {
                $("#batchsOption").hide();
                var dirId = $(this).attr('dirId') || -1;
                curDirId = dirId;
                //alert(dirId);
                //if(dirId>0)
                {
                    dataTypeOption.title.text = sysStructureInfo.dirInfoDic[dirId].name + " 接收/导入数据量";
                    businessStatOption.title.text = sysStructureInfo.dirInfoDic[dirId].name + " 业务时间数据量";
                    curTitleName = sysStructureInfo.dirInfoDic[dirId].name;
                }
                nodeType = 2;
                for (var i = 0; i < sysStructureInfo.dirInfoDic[dirId].dataTypeList.length; ++i) {
                    if (sysStructureInfo.dataTypeInfoDic[sysStructureInfo.dirInfoDic[curDirId].dataTypeList[i]].isVisible) {
                        dataTypeList.push(new Object({
                            "centerCode": sysStructureInfo.dirInfoDic[dirId].dataTypeList[i].split("_")[1],
                            "dataTypeID": sysStructureInfo.dirInfoDic[dirId].dataTypeList[i].split("_")[0],
                        }));
                    }
                }
            }

            refreshStatChart();
            //refreshLoadStatChart();
            //console.log("dataTypeList", dataTypeList)
        }

        function setPageSize() {
            var pageHeight = $("#main")[0].offsetHeight;
            var echartsWidth = $("#mainGraphic")[0].offsetWidth;
            curDateNum = Math.floor(echartsWidth / dayWidth) + 2;
            document.getElementById("table-panel").style.height = (pageHeight - 40 - 50 - 43) / 2 - 5 + "px";
            document.getElementById("mainGraphic").style.height = (pageHeight - 40 - 50 - 43) / 2 - 2 + "px";
            document.getElementById("CountTable").style.height = (pageHeight - 40 - 50 - 43) / 2 - 2 + "px";
            document.getElementById("pieGraphic").style.height = (pageHeight - 40 - 50 - 43) / 2 - 2 + "px";
            //document.getElementById("countTableBodyDiv").style.height
            // = (pageHeight-60-60-50-45)/2-40+40 + "px";
            tableHeight = (pageHeight - 60 - 60 - 50 - 45) / 2;
            //tableHeight = (pageHeight-40-50-43)/2;

            document.getElementById("next").style.left = echartsWidth - 70 + "px";
            document.getElementById("btn-firstPage").style.left = echartsWidth - 70 + "px";
            document.getElementById("chartPageNum").style.left = echartsWidth - 70 - 28 + "px";
            document.getElementById("btn-lastPage").style.left = echartsWidth - 70 - 80 + "px";
        }

    }
);