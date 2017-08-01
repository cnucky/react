/**
 * Created by root on 4/18/16.
 */
//-2.2.7
define(['echarts/dist/echarts.min',
        'nova-notify',
        "../datastat/dm-datastat-init.js"
    ],
    function (ec, Notify, init) { //var ecConfig = config;
        var theme = 'vintage';
        var domMain = document.getElementById('mainGraphic');
        var pieMain = document.getElementById('pieGraphic');
        var pieChart = ec.init(pieMain, theme);
        var dataTypeChart = ec.init(domMain, theme);
        var dateNum = 0;
        var pageNum = 0;
        var curPage = 0;
        var statType = 1;
        var statContent = 1;
        var curTitleName = "";

        var businessStatResArray = new Array();
        var businessStatArrayAfterProcess = new Array();

        var loadStatResArray = new Array();
        var loadStatArrayAfterProcess = new Array();

        var magicType = 'line';
        var dataTypeOption;

        var dataTypePieOption = init.initPieOption();

        var colorList = [
            '#2ec7c9', '#d87a80', '#ffb980', '#5ab1ef', '#b6a2de',
            '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
            '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
            '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
        ];

        $("#btn-lastPage").click(function () {
            curPage = pageNum - 1;
            setPageNum();
            $("#next").show();
            $("#btn-firstPage").show();
            if (curPage + 1 >= pageNum) {
                $("#btn-lastPage").hide();
                $("#prev").hide();
            }

            if (statType == 1) {
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);

                for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                    dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                    dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].counts);
                }
            }
            else if (statType == 2 && statContent == 1) {
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
                dataTypeOption.series[1].data.splice(0, dataTypeOption.series[1].data.length);

                for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                    dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                    dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].countsRec);
                    dataTypeOption.series[1].data.unshift(businessStatArrayAfterProcess[i].counts);
                }
            }
            else if (statType == 2 && statContent == 2) {
            }
            else if (statType == 2 && statContent == 3) {
            }

            //dataTypeChart = ec.init(domMain, theme);
            //dataTypeChart.on(ecConfig.EVENT.MAGIC_TYPE_CHANGED, chartTypeClick);
            dataTypeChart.on('magicTypeChanged', chartTypeClick);

            //dataTypeChart.setTheme(theme);
            dataTypeChart.setOption(dataTypeOption, true);
        });

        $("#prev").click(function () {
            ++curPage;
            setPageNum();
            $("#next").show();
            $("#btn-firstPage").show();
            if (curPage + 1 >= pageNum) {
                $("#btn-lastPage").hide();
                $("#prev").hide();
            }

            if (statType == 1) {
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);

                for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                    dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                    dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].counts);
                }
            }
            else if (statType == 2 && statContent == 1) {
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
                dataTypeOption.series[1].data.splice(0, dataTypeOption.series[1].data.length);

                for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                    dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                    dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].countsRec);
                    dataTypeOption.series[1].data.unshift(businessStatArrayAfterProcess[i].counts);
                }
            }
            else if (statType == 2 && statContent > 1) {
                dataTypeOption.series = [];
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                for (var i in dataTypeOption.series) {
                    dataTypeOption.series[i].data.splice(0, dataTypeOption.series[i].data.length);
                }

                var i = 0;
                for (var namekey in businessStatArrayAfterProcess) {
                    dataTypeOption.xAxis[0].data = [];
                    dataTypeOption.series.push(genarateSerie(namekey, businessStatArrayAfterProcess[namekey].batchStatResArray, i));
                    i++;
                }
            }

            //dataTypeChart = ec.init(domMain, theme);
            //dataTypeChart.on(ecConfig.EVENT.MAGIC_TYPE_CHANGED, chartTypeClick);
            dataTypeChart.on('magicTypeChanged', chartTypeClick);

            //dataTypeChart.setTheme(theme);
            dataTypeChart.setOption(dataTypeOption, true);
        });

        $("#btn-firstPage").click(function () {
            curPage = 0;
            setPageNum();
            $("#prev").show();
            $("#btn-lastPage").show();
            if (curPage <= 0) {
                $("#next").hide();
                $("#btn-firstPage").hide();
            }

            if (statType == 1) {
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);

                for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                    dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                    dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].counts);
                }
            }
            else if (statType == 2) {
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
                dataTypeOption.series[1].data.splice(0, dataTypeOption.series[1].data.length);

                for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                    dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                    dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].countsRec);
                    dataTypeOption.series[1].data.unshift(businessStatArrayAfterProcess[i].counts);
                }
            }

            //dataTypeChart = ec.init(domMain, theme);
            //dataTypeChart.on(ecConfig.EVENT.MAGIC_TYPE_CHANGED, chartTypeClick);
            dataTypeChart.on('magicTypeChanged', chartTypeClick);

            //dataTypeChart.setTheme(theme);
            dataTypeChart.setOption(dataTypeOption, true);
        });

        $("#next").click(function () {
            --curPage;
            setPageNum();
            $("#prev").show();
            $("#btn-lastPage").show();
            if (curPage <= 0) {
                $("#next").hide();
                $("#btn-firstPage").hide();
            }

            if (statType == 1) {
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);

                for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                    dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                    dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].counts);
                }
            }
            else if (statType == 2 && statContent == 1) {
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
                dataTypeOption.series[1].data.splice(0, dataTypeOption.series[1].data.length);

                for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                    dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                    dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].countsRec);
                    dataTypeOption.series[1].data.unshift(businessStatArrayAfterProcess[i].counts);
                }
            }
            else if (statType == 2 && statContent > 1) {
                dataTypeOption.series = [];
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                for (var i in dataTypeOption.series) {
                    dataTypeOption.series[i].data.splice(0, dataTypeOption.series[i].data.length);
                }

                var i = 0;
                for (var namekey in businessStatArrayAfterProcess) {
                    dataTypeOption.xAxis[0].data = [];
                    dataTypeOption.series.push(genarateSerie(namekey, businessStatArrayAfterProcess[namekey].batchStatResArray, i));
                    i++;
                }
            }

            //dataTypeChart = ec.init(domMain, theme);
            //dataTypeChart.on(ecConfig.EVENT.MAGIC_TYPE_CHANGED, chartTypeClick););
            dataTypeChart.on('magicTypeChanged', chartTypeClick);

            //dataTypeChart.setTheme(theme);
            dataTypeChart.setOption(dataTypeOption, true);
        });

        function refresh(dataTypeOptionOut) {
            if (dataTypeChart && dataTypeChart.dispose) {
                dataTypeChart.dispose();
            }
            dataTypeOption = dataTypeOptionOut;
            dataTypeChart = ec.init(domMain, theme);

            //dataTypeChart.setTheme(theme);
            dataTypeChart.setOption(dataTypeOption, true);

            window.onresize = dataTypeChart.resize;

            //ecConfig = require('echarts/config');
        }

        function getBusinessTimeWithInterval(dataTypeList, dataTypeOptionOut, curDateNum) {
            statType = 1;
            dateNum = curDateNum;
            var dateArray = $('#dateRange')[0].value.split(" - ");
            if (dateArray.length < 2) {
                Notify.show({
                    title: "统计时间范围异常，请重新设置！",
                    type: "error"
                });
                hideLoader();
                return;
            }

            $.post('/datamanage/dataimport/GetDataTypesBusinessTimeWithInterval', {
                dataTypeArray: dataTypeList,
                beginDateStr: dateArray[0].trim(),
                endDateStr: dateArray[1].trim(),
            }).done(function (data) {
                var data = JSON.parse(data);
                console.log("GetDataTypesBusinessTimeWithInterval:" + data);

                if (data.code == 0) {
                    hideLoader();
                    if (dataTypeChart && dataTypeChart.dispose) {
                        dataTypeChart.dispose();
                    }
                    dataTypeOption = dataTypeOptionOut;

                    clearOldData();
                    businessStatResArray.splice(0, businessStatResArray.length);

                    for (var i = data.data.loadStatInfos.length - 1; i >= 0; --i) {
                        businessStatResArray.push(new Object({
                            "dateStr": data.data.loadStatInfos[i].beginDateStr,
                            "counts": data.data.loadStatInfos[i].sumCounts,
                        }));
                    }

                    processArrayForBusinessStat(businessStatResArray);
                    pageNum = Math.floor(businessStatArrayAfterProcess.length / dateNum);
                    curPage = 0;
                    $("#prev").show();
                    $("#btn-lastPage").show();
                    $("#next").hide();
                    $("#btn-firstPage").hide();
                    if (businessStatArrayAfterProcess.length % dateNum != 0)
                        pageNum++;

                    setPageNum();
                    if (pageNum <= 1)
                        $("#prev").hide();

                    bindDataForBusinessChart();
                    bindDataForBusinessTable();
                }
                else {
                    hideLoader();
                    console.log("getBusinessTimeWithInterval出错:" + data.message);
                    Notify.show({
                        title: "按业务时间获取统计信息出错！",
                        type: "error"
                    });
                }
            });
        }

        function getLoadWithIntervalByData(dataTypeList, dataTypeOptionOut) {
            var dateArray = $('#dateRange')[0].value.split(" - ");
            if (dateArray.length < 2) {
                Notify.show({
                    title: "统计时间范围异常，请重新设置！",
                    type: "error"
                });
                hideLoader();
                return;
            }
            $.post('/datamanage/dataimport/GetDataTypesLoadInfoWithInterval', {
                dataTypeArray: dataTypeList,
                beginDateStr: $('#dateRange')[0].value.split(" - ")[0].trim(),
                endDateStr: $('#dateRange')[0].value.split(" - ")[1].trim(),
            }).done(function (data) {
                var data = JSON.parse(data);
                console.log("GetDataTypesLoadInfoWithInterval:" + data);
                if (data.code == 0) {
                    hideLoader();
                    if (dataTypeChart && dataTypeChart.dispose) {
                        dataTypeChart.dispose();
                    }
                    dataTypeOption = dataTypeOptionOut;

                    clearOldData();
                    businessStatResArray.splice(0, businessStatResArray.length);

                    for (var i = data.data.loadStatInfos.length - 1; i >= 0; --i) {
                        businessStatResArray.push(new Object({
                            "dateStr": data.data.loadStatInfos[i].beginDateStr,
                            "countsRec": data.data.loadStatInfos[i].sumCountsRec,
                            "counts": data.data.loadStatInfos[i].sumCounts,
                        }));
                    }

                    processArrayForLoadStat(businessStatResArray);
                    pageNum = Math.floor(businessStatArrayAfterProcess.length / dateNum);
                    curPage = 0;
                    setPageNum();
                    $("#prev").show();
                    $("#next").hide();
                    if (businessStatArrayAfterProcess.length % dateNum != 0)
                        pageNum++;

                    setPageNum();
                    if (pageNum <= 1)
                        $("#prev").hide();

                    bindDataForLoadChart();
                    bindDataForLoadTable();
                }
                else {
                    hideLoader();
                    console.log("GetDataTypesLoadInfoWithInterval:" + data.message);
                    Notify.show({
                        title: "按导入/接收时间获取统计信息出错！",
                        type: "error"
                    });
                }
            });
        }

        function getLoadWithIntervalByUser(dataTypeList, dataTypeOptionOut) {
            var dateArray = $('#dateRange')[0].value.split(" - ");
            if (dateArray.length < 2) {
                Notify.show({
                    title: "统计时间范围异常，请重新设置！",
                    type: "error"
                });
                hideLoader();
                return;
            }
            $.post('/datamanage/dataimport/GetAllUsersLoadStatInfoWithInterval', {
                dataTypeArray: dataTypeList,
                beginDateStr: $('#dateRange')[0].value.split(" - ")[0].trim(),
                endDateStr: $('#dateRange')[0].value.split(" - ")[1].trim(),
            }).done(function (data) {
                var data = JSON.parse(data);
                console.log("getLoadWithIntervalByUser:" + data);
                if (data.code == 0) {
                    hideLoader();
                    if (dataTypeChart && dataTypeChart.dispose) {
                        dataTypeChart.dispose();
                    }
                    dataTypeOption = dataTypeOptionOut;

                    clearOldData();
                    businessStatResArray = [];//.splice(0, businessStatResArray.length);

                    if (data.data.loadStatInfos.length <= 0) {
                        pageNum = 0;
                        curPage = 0;
                        setPageNum();
                        $("#prev").hide();
                        $("#next").hide();
                        bindDataForLoadChartByBatchs();
                        bindDataForPieChart();
                        return;
                    }

                    for (var i in data.data.loadStatInfos) {
                        if (businessStatResArray[data.data.loadStatInfos[i].userName] == undefined) {
                            businessStatResArray[data.data.loadStatInfos[i].userName] = new Object({
                                "batchStatResArray": [],
                                "batchSumCounts": 0
                            });
                            businessStatResArray[data.data.loadStatInfos[i].userName].batchStatResArray.unshift(new Object({
                                "dateStr": data.data.loadStatInfos[i].beginDateStr,
                                "countsRec": data.data.loadStatInfos[i].sumCountsRec,
                                "counts": data.data.loadStatInfos[i].sumCounts,
                            }));
                        }
                        else {
                            businessStatResArray[data.data.loadStatInfos[i].userName].batchStatResArray.unshift(new Object({
                                "dateStr": data.data.loadStatInfos[i].beginDateStr,
                                "countsRec": data.data.loadStatInfos[i].sumCountsRec,
                                "counts": data.data.loadStatInfos[i].sumCounts,
                            }));
                        }
                        businessStatResArray[data.data.loadStatInfos[i].userName].batchSumCounts
                            += data.data.loadStatInfos[i].sumCounts;
                    }
                    console.log("businessStatResArray", businessStatResArray);

                    pageNum = processArrayForLoadStatByDic(businessStatResArray);
                    console.log("businessStatArrayAfterProcess", businessStatArrayAfterProcess);

                    curPage = 0;
                    setPageNum();
                    $("#prev").show();
                    $("#next").hide();
                    if (businessStatArrayAfterProcess.length % dateNum != 0)
                        pageNum++;

                    setPageNum();
                    if (pageNum <= 1)
                        $("#prev").hide();

                    dataTypeOption.title.text = curTitleName + " 按用户统计数据量";
                    dataTypePieOption.title.text = curTitleName + " 按用户统计数据量";
                    bindDataForLoadChartByBatchs();
                    bindDataForPieChart();

                    pieChart.connect(dataTypeChart);
                    dataTypeChart.connect(pieChart);
                }
                else {
                    hideLoader();
                    console.log("GetDataTypesLoadInfoWithInterval:" + data.message);
                    Notify.show({
                        title: "按导入/接收时间获取统计信息出错！",
                        type: "error"
                    });
                }
            });
        }

        function getLoadWithIntervalByBatchs(dataTypeList, dataTypeOptionOut) {
            var dateArray = $('#dateRange')[0].value.split(" - ");
            if (dateArray.length < 2) {
                Notify.show({
                    title: "统计时间范围异常，请重新设置！",
                    type: "error"
                });
                hideLoader();
                return;
            }

            $.post('/datamanage/dataimport/GetAllBatchsLoadStatInfoWithInterval', {
                dataTypeArray: dataTypeList,
                beginDateStr: $('#dateRange')[0].value.split(" - ")[0].trim(),
                endDateStr: $('#dateRange')[0].value.split(" - ")[1].trim(),
            }).done(function (data) {
                var data = JSON.parse(data);
                console.log("getLoadWithIntervalByBatchs:" + data);
                if (data.code == 0) {
                    hideLoader();
                    if (dataTypeChart && dataTypeChart.dispose) {
                        dataTypeChart.dispose();
                    }
                    dataTypeOption = dataTypeOptionOut;

                    clearOldData();
                    businessStatResArray = [];//.splice(0, businessStatResArray.length);

                    if (data.data.loadStatInfos.length <= 0) {
                        pageNum = 0;
                        curPage = 0;
                        setPageNum();
                        $("#prev").hide();
                        $("#next").hide();
                        bindDataForLoadChartByBatchs();
                        bindDataForPieChart();
                        return;
                    }

                    for (var i in data.data.loadStatInfos) {
                        if (businessStatResArray[data.data.loadStatInfos[i].batchName] == undefined) {
                            businessStatResArray[data.data.loadStatInfos[i].batchName] = new Object({
                                "batchStatResArray": [],
                                "batchSumCounts": 0
                            });
                            businessStatResArray[data.data.loadStatInfos[i].batchName].batchStatResArray.unshift(new Object({
                                "dateStr": data.data.loadStatInfos[i].beginDateStr,
                                "countsRec": data.data.loadStatInfos[i].sumCountsRec,
                                "counts": data.data.loadStatInfos[i].sumCounts,
                            }));
                        }
                        else {
                            businessStatResArray[data.data.loadStatInfos[i].batchName].batchStatResArray.unshift(new Object({
                                "dateStr": data.data.loadStatInfos[i].beginDateStr,
                                "countsRec": data.data.loadStatInfos[i].sumCountsRec,
                                "counts": data.data.loadStatInfos[i].sumCounts,
                            }));
                        }
                        businessStatResArray[data.data.loadStatInfos[i].batchName].batchSumCounts
                            += data.data.loadStatInfos[i].sumCounts;
                    }
                    console.log("businessStatResArray", businessStatResArray);

                    pageNum = processArrayForLoadStatByDic(businessStatResArray);
                    console.log("businessStatArrayAfterProcess", businessStatArrayAfterProcess);

                    curPage = 0;
                    setPageNum();
                    $("#prev").show();
                    $("#next").hide();
                    if (pageNum != 0)
                        pageNum++;

                    setPageNum();
                    if (pageNum <= 1)
                        $("#prev").hide();

                    dataTypeOption.title.text = curTitleName + " 按任务统计数据量";
                    dataTypePieOption.title.text = curTitleName + " 按任务统计数据量";
                    bindDataForLoadChartByBatchs();
                    bindDataForPieChart();

                    //bindDataForLoadTable();
                }
                else {
                    hideLoader();
                    console.log("GetDataTypesLoadInfoWithInterval:" + data.message);
                    Notify.show({
                        title: "按导入/接收时间获取统计信息出错！",
                        type: "error"
                    });
                }
            });
        }

        function getLoadWithInterval(dataTypeList, dataTypeOptionOut, batchOptionOut, curDateNum, titleName) {
            curTitleName = titleName;
            statType = 2;
            dateNum = curDateNum;
            var statContentType = $('#statType')[0].value;
            if (dataTypeList.length > 1 && statContentType == 3) {
                statContentType = "1";
                $("#batchsOption").hide();
                $('#statType')[0].selectedIndex = 0;
            }
            switch (statContentType) {
                case "1":
                    statContent = 1;
                    $("#CountTable").show();
                    $("#pieGraphic").hide();
                    getLoadWithIntervalByData(dataTypeList, dataTypeOptionOut);
                    break;
                case "2":
                    $("#CountTable").hide();
                    $("#pieGraphic").show();
                    statContent = 2;
                    getLoadWithIntervalByUser(dataTypeList, batchOptionOut); //dataTypeOptionOut);
                    break;
                case "3":
                    $("#CountTable").hide();
                    $("#pieGraphic").show();
                    statContent = 3;
                    getLoadWithIntervalByBatchs(dataTypeList, batchOptionOut);
                    break;
                default:
                    break;
            }
        }

        function bindDataForPieChart() {
            dataTypePieOption.series[0].data = [];
            dataTypePieOption.legend.data = [];
            //dataTypePieOption = init.initPieOption();
            //dataTypePieOption.series[0].itemStyle.normal.color = [];

            //var i=0;
            //dataTypePieOption.series[0].itemStyle.normal.color.push(colorList[i%colorList.length]);
            for (var namekey in businessStatArrayAfterProcess) {
                dataTypePieOption.legend.data.push(namekey);
                dataTypePieOption.series[0].data.push(new Object({
                    value: businessStatArrayAfterProcess[namekey].batchSumCounts,
                    name: namekey
                }));
                //dataTypePieOption.series[0].itemStyle.normal.color.push(colorList[i%colorList.length]);
                //i++;
            }
            pieChart = ec.init(pieMain, theme);
            //pieChart.setTheme(theme);
            //console.log(dataTypePieOption.series[0].itemStyle.normal.color);
            pieChart.setOption(dataTypePieOption, true);
            window.onresize = pieChart.resize;
        }

        function bindDataForLoadChart() {
            //console.log("dataTypeOption", dataTypeOption);
            //dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
            //dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
            //dataTypeOption.series[1].data.splice(0, dataTypeOption.series[1].data.length);

            if (statType == 2 && statContent == 1) {
                dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
                dataTypeOption.series[1].data.splice(0, dataTypeOption.series[1].data.length);
            }

            for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].countsRec);
                dataTypeOption.series[1].data.unshift(businessStatArrayAfterProcess[i].counts);
            }

            dataTypeOption.legend.data = ['接收数据量', '导入数据量'];
            dataTypeChart = ec.init(domMain, theme);
            dataTypeOption.series[0].type = magicType;
            dataTypeOption.series[1].type = magicType;
            //var ecConfig = require('echarts/config');
            //dataTypeChart.on(ecConfig.EVENT.MAGIC_TYPE_CHANGED, chartTypeClick);
            dataTypeChart.on('magicTypeChanged', chartTypeClick);

            //dataTypeChart.setTheme(theme);
            dataTypeChart.setOption(dataTypeOption, false);

            window.onresize = dataTypeChart.resize;
        }

        function genarateSerie(name, statResArray, i) {
            var serie = new Object({
                name: '',
                type: 'line',
                smooth: true,
                itemStyle: {
                    normal: {
                        color: [],
                        lineStyle: {
                            width: 2
                        },
                    }
                },
                //barGap: 20,
                //barMaxWidth: 80,
                //barMaxWidth: 40,
                barMinHeight: 5,
                data: [],
            });

            serie.name = name;
            serie.itemStyle.normal.color.push(colorList[i % colorList.length]);

            //for(var i in statResArray){
            for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < statResArray.length; ++i) {
                serie.data.unshift(statResArray[i].counts);
                dataTypeOption.xAxis[0].data.unshift(statResArray[i].dateStr);
            }

            return serie;
        }

        function bindDataForLoadChartByBatchs() {
            dataTypeOption.legend.data = [];
            dataTypeOption.series = [];
            var i = 0;
            for (var namekey in businessStatArrayAfterProcess) {
                dataTypeOption.xAxis[0].data = [];
                dataTypeOption.legend.data.push(namekey);
                dataTypeOption.series.push(genarateSerie(namekey, businessStatArrayAfterProcess[namekey].batchStatResArray, i));
                dataTypeOption.series[i].type = magicType;
                i++;
            }
            if (i == 0) {
                dataTypeOption.series.push(new Object({
                    name: '',
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: [],
                            lineStyle: {
                                width: 2
                            },
                        }
                    },
                    //barGap: 20,
                    //barMaxWidth: 80,
                    //barMaxWidth: 40,
                    barMinHeight: 5,
                    data: [],
                }));
            }

            dataTypeChart = ec.init(domMain, theme);
            //var ecConfig = require('echarts/config');
            //dataTypeChart.on(ecConfig.EVENT.MAGIC_TYPE_CHANGED, chartTypeClick);
            dataTypeChart.on('magicTypeChanged', chartTypeClick);

            //dataTypeChart.setTheme(theme);
            dataTypeChart.setOption(dataTypeOption, true);

            window.onresize = dataTypeChart.resize;
        }

        function bindDataForBusinessChart() {
            for (var i = curPage * dateNum; i < (curPage + 1) * dateNum && i < businessStatArrayAfterProcess.length; ++i) {
                dataTypeOption.xAxis[0].data.unshift(businessStatArrayAfterProcess[i].dateStr);
                dataTypeOption.series[0].data.unshift(businessStatArrayAfterProcess[i].counts);
            }

            dataTypeChart = ec.init(domMain, theme);
            dataTypeOption.series[0].type = magicType;
            //var ecConfig = require('echarts/config');
            //dataTypeChart.on(ecConfig.EVENT.MAGIC_TYPE_CHANGED, chartTypeClick);
            dataTypeChart.on('magicTypeChanged', chartTypeClick);

            //dataTypeChart.setTheme(theme);
            dataTypeChart.setOption(dataTypeOption, true);

            window.onresize = dataTypeChart.resize;
        }

        function chartTypeClick(param) {
            if (param.magicType.bar)
                magicType = 'bar';
            else if (param.magicType.line)
                magicType = 'line';

            dataTypeOption.series[0].type = magicType;
            if (statType == 2) {
                dataTypeOption.series[1].type = magicType;
            }
        }

        function bindDataForBusinessTable_bak() {
            for (var i = 0; i < businessStatArrayAfterProcess.length; ++i) {
                if (i >= businessStatArrayAfterProcess.length - 1) {
                    $('#CountTableBody')[0].innerHTML += '<tr> <td style="width:20%;">'
                        + businessStatArrayAfterProcess[i].dateStr
                        + '</td> <td style="width:30%;">'
                        + businessStatArrayAfterProcess[i].counts
                        + '</td> <td style="width:30%;"> <span class="fa fa-minus"></span></td> <td style="width:20%;"><span class="fa fa-minus"></span></td> </tr>';
                }
                else {
                    var diff = businessStatArrayAfterProcess[i].counts - businessStatArrayAfterProcess[i + 1].counts;
                    //data.data.loadStatInfos[i-1].sumCounts;
                    var percent;
                    if (businessStatArrayAfterProcess[i + 1].counts == 0)
                        percent = "";
                    else
                        percent = (diff * 100 / businessStatArrayAfterProcess[i + 1].counts).toFixed(1) + '%';
                    if (diff == 0) {
                        $('#CountTableBody')[0].innerHTML += '<tr> <td style="width:20%;">'
                            + businessStatArrayAfterProcess[i].dateStr
                            + '</td> <td style="width:30%;">'
                            + businessStatArrayAfterProcess[i].counts
                            + '</td> <td style="width:30%;">' + diff + '</td>'
                            + '<td style="width:20%;"><span class="fa fa-minus"></span></td> </tr>';
                    }
                    else if (diff > 0) {
                        $('#CountTableBody')[0].innerHTML += '<tr> <td style="width:20%;">'
                            + businessStatArrayAfterProcess[i].dateStr
                            + '</td> <td style="width:30%;">'
                            + businessStatArrayAfterProcess[i].counts
                            + '</td> <td style="width:30%;">' + diff + '</td>'
                            + '<td style="width:20%;"><span class="fa fa-arrow-up" style="color:red"></span>'
                            + percent + '</td> </tr>';
                    }
                    else if (diff < 0) {
                        percent = (diff * -100 / businessStatArrayAfterProcess[i + 1].counts).toFixed(1) + '%';
                        $('#CountTableBody')[0].innerHTML += '<tr> <td style="width:18%;">'
                            + businessStatArrayAfterProcess[i].dateStr
                            + '</td> <td style="width:30%;">'
                            + businessStatArrayAfterProcess[i].counts
                            + '</td> <td style="width:30%;">' + diff + '</td>'
                            + '<td style="width:20%;"><span class="fa fa-arrow-down" style="color:green"></span>'
                            + percent + '</td> </tr>';
                    }
                }
            }
        }

        function bindDataForBusinessTable() {
            var loadtasks = new Array();
            for (var i = 0; i < businessStatArrayAfterProcess.length; ++i) {
                var loadtask = {};

                if (i >= businessStatArrayAfterProcess.length - 1) {
                    loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                    loadtask.counts = businessStatArrayAfterProcess[i].counts;
                    loadtask.variationCounts = '<span class="fa fa-minus"></span>';
                    loadtask.variationRate = '<span class="fa fa-minus"></span>';
                }
                else {
                    var diff = businessStatArrayAfterProcess[i].counts - businessStatArrayAfterProcess[i + 1].counts;
                    //data.data.loadStatInfos[i-1].sumCounts;
                    var percent;
                    if (businessStatArrayAfterProcess[i + 1].counts == 0)
                        percent = "";
                    else
                        percent = (diff * 100 / businessStatArrayAfterProcess[i + 1].counts).toFixed(1) + '%';
                    if (diff == 0) {
                        loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                        loadtask.counts = businessStatArrayAfterProcess[i].counts;
                        loadtask.variationCounts = diff;
                        loadtask.variationRate = '<span class="fa fa-minus"></span>';
                    }
                    else if (diff > 0) {
                        loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                        loadtask.counts = businessStatArrayAfterProcess[i].counts;
                        loadtask.variationCounts = diff;
                        loadtask.variationRate = '<span class="fa fa-arrow-up" style="color:red"></span>' + percent;
                    }
                    else if (diff < 0) {
                        percent = (diff * -100 / businessStatArrayAfterProcess[i + 1].counts).toFixed(1) + '%';
                        loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                        loadtask.counts = businessStatArrayAfterProcess[i].counts;
                        loadtask.variationCounts = diff;
                        loadtask.variationRate = '<span class="fa fa-arrow-down" style="color:green"></span>' + percent;
                    }
                }

                loadtasks.push(loadtask);
            }

            $("#CountTable1").dataTable().fnClearTable();
            $("#CountTable1").dataTable().fnAddData(loadtasks);
        }

        function bindDataForLoadTable() {
            var loadtasks = new Array();
            if ($('#tableType')[0].value == 1) {
                for (var i = 0; i < businessStatArrayAfterProcess.length; ++i) {
                    var loadtask = {};

                    if (i >= businessStatArrayAfterProcess.length - 1) {
                        loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                        loadtask.counts = businessStatArrayAfterProcess[i].counts;
                        loadtask.variationCounts = '<span class="fa fa-minus"></span>';
                        loadtask.variationRate = '<span class="fa fa-minus"></span>';
                    }
                    else {
                        var diff = businessStatArrayAfterProcess[i].counts - businessStatArrayAfterProcess[i + 1].counts;
                        //data.data.loadStatInfos[i-1].sumCounts;
                        var percent;
                        if (businessStatArrayAfterProcess[i + 1].counts == 0)
                            percent = "";
                        else
                            percent = (diff * 100 / businessStatArrayAfterProcess[i + 1].counts).toFixed(1) + '%';
                        if (diff == 0) {
                            loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                            loadtask.counts = businessStatArrayAfterProcess[i].counts;
                            loadtask.variationCounts = diff;
                            loadtask.variationRate = '<span class="fa fa-minus"></span>';
                        }
                        else if (diff > 0) {
                            loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                            loadtask.counts = businessStatArrayAfterProcess[i].counts;
                            loadtask.variationCounts = diff;
                            loadtask.variationRate = '<span class="fa fa-arrow-up" style="color:red"></span>' + percent;
                        }
                        else if (diff < 0) {
                            percent = (diff * -100 / businessStatArrayAfterProcess[i + 1].counts).toFixed(1) + '%';
                            loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                            loadtask.counts = businessStatArrayAfterProcess[i].counts;
                            loadtask.variationCounts = diff;
                            loadtask.variationRate = '<span class="fa fa-arrow-down" style="color:green"></span>' + percent;
                        }
                    }

                    loadtasks.push(loadtask);
                }
            }
            else if ($('#tableType')[0].value == 2) {
                for (var i = 0; i < businessStatArrayAfterProcess.length; ++i) {
                    var loadtask = {};

                    if (i >= businessStatArrayAfterProcess.length - 1) {
                        loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                        loadtask.counts = businessStatArrayAfterProcess[i].countsRec;
                        loadtask.variationCounts = '<span class="fa fa-minus"></span>';
                        loadtask.variationRate = '<span class="fa fa-minus"></span>';
                    }
                    else {
                        var diff = businessStatArrayAfterProcess[i].countsRec - businessStatArrayAfterProcess[i + 1].countsRec;
                        //data.data.loadStatInfos[i-1].sumCounts;
                        var percent;
                        if (businessStatArrayAfterProcess[i + 1].countsRec == 0)
                            percent = "";
                        else
                            percent = (diff * 100 / businessStatArrayAfterProcess[i + 1].countsRec).toFixed(1) + '%';
                        if (diff == 0) {
                            loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                            loadtask.counts = businessStatArrayAfterProcess[i].countsRec;
                            loadtask.variationCounts = diff;
                            loadtask.variationRate = '<span class="fa fa-minus"></span>';
                        }
                        else if (diff > 0) {
                            loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                            loadtask.counts = businessStatArrayAfterProcess[i].countsRec;
                            loadtask.variationCounts = diff;
                            loadtask.variationRate = '<span class="fa fa-arrow-up" style="color:red"></span>' + percent;
                        }
                        else if (diff < 0) {
                            percent = (diff * -100 / businessStatArrayAfterProcess[i + 1].countsRec).toFixed(1) + '%';
                            loadtask.dateStr = businessStatArrayAfterProcess[i].dateStr;
                            loadtask.counts = businessStatArrayAfterProcess[i].countsRec;
                            loadtask.variationCounts = diff;
                            loadtask.variationRate = '<span class="fa fa-arrow-down" style="color:green"></span>' + percent;
                        }
                    }

                    loadtasks.push(loadtask);
                }
            }

            $("#CountTable1").dataTable().fnClearTable();
            $("#CountTable1").dataTable().fnAddData(loadtasks);
        }

        function processArrayForBusinessStat(businessStatResArray) {
            var select = document.getElementById('stat-granularity');
            console.log("businessStatResArray", businessStatResArray);
            switch (select.value) {
                case "1":
                    businessStatArrayAfterProcess = businessStatResArray.concat();
                    break;
                case "2":
                    var resDic = new Array();
                    for (var i = 0; i < businessStatResArray.length; ++i) {
                        var dateStr = businessStatResArray[i].dateStr.substring(0, 7);
                        if (!(resDic[dateStr] >= 0))
                            resDic[dateStr] = businessStatResArray[i].counts;
                        else
                            resDic[dateStr] += businessStatResArray[i].counts;
                    }
                    for (var key in resDic)
                        businessStatArrayAfterProcess.push(new Object({
                            "dateStr": key,
                            "counts": resDic[key],
                        }));
                    break;
                case "3":
                    var resDic = new Array();
                    for (var i = 0; i < businessStatResArray.length; ++i) {
                        var dateStr = businessStatResArray[i].dateStr.substring(0, 4);
                        if (!(resDic[dateStr] >= 0))
                            resDic[dateStr] = businessStatResArray[i].counts;
                        else
                            resDic[dateStr] += businessStatResArray[i].counts;
                    }
                    for (var i = 0; i < resDic.length; ++i) {
                        if (resDic[i] == undefined)
                            continue;

                        businessStatArrayAfterProcess.unshift(new Object({
                            "dateStr": i,
                            "counts": resDic[i],
                        }));
                    }
                    break;
                default:
                    break;
            }
        }

        function processArrayForLoadStat(businessStatResArray) {
            var select = document.getElementById('stat-granularity');
            switch (select.value) {
                case "1":
                    businessStatArrayAfterProcess = businessStatResArray.concat();
                    break;
                case "2":
                    var resDic = new Array();
                    for (var i = 0; i < businessStatResArray.length; ++i) {
                        var dateStr = businessStatResArray[i].dateStr.substring(0, 7);
                        if (resDic[dateStr] == undefined) {
                            resDic[dateStr] = new Object({
                                "counts": businessStatResArray[i].counts,
                                "countsRec": businessStatResArray[i].countsRec,
                            });
                        }
                        else {
                            resDic[dateStr].counts += businessStatResArray[i].counts;
                            resDic[dateStr].countsRec += businessStatResArray[i].countsRec;
                        }
                    }
                    for (var key in resDic)
                        businessStatArrayAfterProcess.push(new Object({
                            "dateStr": key,
                            "counts": resDic[key].counts,
                            "countsRec": resDic[key].countsRec,
                        }));
                    break;
                case "3":
                    var resDic = new Array();
                    for (var i = 0; i < businessStatResArray.length; ++i) {
                        var dateStr = businessStatResArray[i].dateStr.substring(0, 4);
                        if (resDic[dateStr] == undefined) {
                            resDic[dateStr] = new Object({
                                "counts": businessStatResArray[i].counts,
                                "countsRec": businessStatResArray[i].countsRec,
                            });
                        }
                        else {
                            resDic[dateStr].counts += businessStatResArray[i].counts;
                            resDic[dateStr].countsRec += businessStatResArray[i].countsRec;
                        }
                    }
                    for (var key in resDic)
                        businessStatArrayAfterProcess.unshift(new Object({
                            "dateStr": key,
                            "counts": resDic[key].counts,
                            "countsRec": resDic[key].countsRec,
                        }));
                    break;
                default:
                    break;
            }
        }

        function processArrayForLoadStatByDic(businessStatResArray) {
            var chartPageNums = 0;
            var select = document.getElementById('stat-granularity');

            switch (select.value) {
                case "1":
                    for (var batchkey in businessStatResArray) {
                        businessStatArrayAfterProcess[batchkey] = new Object(businessStatResArray[batchkey]);
                        chartPageNums = Math.floor(businessStatArrayAfterProcess[batchkey].batchStatResArray.length / dateNum);
                    }
                    break;
                case "2":
                    for (var batchkey in businessStatResArray) {
                        //console.log("batchkey", batchkey);
                        var resDic = new Array();
                        for (var i = 0; i < businessStatResArray[batchkey].batchStatResArray.length; ++i) {
                            var dateStr = businessStatResArray[batchkey].batchStatResArray[i].dateStr.substring(0, 7);
                            if (resDic[dateStr] == undefined) {
                                resDic[dateStr] = new Object({
                                    "counts": businessStatResArray[batchkey].batchStatResArray[i].counts,
                                    "countsRec": businessStatResArray[batchkey].batchStatResArray[i].countsRec,
                                });
                            }
                            else {
                                resDic[dateStr].counts += businessStatResArray[batchkey].batchStatResArray[i].counts;
                                resDic[dateStr].countsRec += businessStatResArray[batchkey].batchStatResArray[i].countsRec;
                            }
                        }
                        businessStatArrayAfterProcess[batchkey] = new Object({
                            "batchStatResArray": []
                        });
                        for (var key in resDic)
                            businessStatArrayAfterProcess[batchkey].batchStatResArray.push(new Object({
                                "dateStr": key,
                                "counts": resDic[key].counts,
                                "countsRec": resDic[key].countsRec,
                            }));

                        chartPageNums = Math.floor(businessStatArrayAfterProcess[batchkey].batchStatResArray.length / dateNum);
                        businessStatArrayAfterProcess[batchkey].batchSumCounts = businessStatResArray[batchkey].batchSumCounts;
                    }

                    break;
                case "3":
                    for (var batchkey in businessStatResArray) {
                        console.log("batchkey", batchkey);
                        var resDic = new Array();
                        for (var i = 0; i < businessStatResArray[batchkey].batchStatResArray.length; ++i) {
                            var dateStr = businessStatResArray[batchkey].batchStatResArray[i].dateStr.substring(0, 4);
                            if (resDic[dateStr] == undefined) {
                                resDic[dateStr] = new Object({
                                    "counts": businessStatResArray[batchkey].batchStatResArray[i].counts,
                                    "countsRec": businessStatResArray[batchkey].batchStatResArray[i].countsRec,
                                });
                            }
                            else {
                                resDic[dateStr].counts += businessStatResArray[batchkey].batchStatResArray[i].counts;
                                resDic[dateStr].countsRec += businessStatResArray[batchkey].batchStatResArray[i].countsRec;
                            }
                        }
                        businessStatArrayAfterProcess[batchkey] = new Object({
                            "batchStatResArray": []
                        });
                        for (var key in resDic)
                            businessStatArrayAfterProcess[batchkey].batchStatResArray.unshift(new Object({
                                "dateStr": key,
                                "counts": resDic[key].counts,
                                "countsRec": resDic[key].countsRec,
                            }));

                        chartPageNums = Math.floor(businessStatArrayAfterProcess[batchkey].batchStatResArray.length / dateNum);
                        businessStatArrayAfterProcess[batchkey].batchSumCounts = businessStatResArray[batchkey].batchSumCounts;
                    }
                    break;
                default:
                    break;
            }

            return chartPageNums;
        }

        function granularitySelectChanged() {
            clearOldData();

            if (statType == 1) {
                processArrayForBusinessStat(businessStatResArray);
                pageNum = Math.floor(businessStatArrayAfterProcess.length / dateNum);
                curPage = 0;
                $("#prev").show();
                $("#btn-lastPage").show();
                $("#next").hide();
                $("#btn-firstPage").hide();
                if (businessStatArrayAfterProcess.length % dateNum != 0)
                    pageNum++;

                setPageNum();
                if (pageNum <= 1) {
                    $("#prev").hide();
                    $("#btn-firstPage").hide();
                    $("#btn-lastPage").hide();
                }

                bindDataForBusinessChart();
                bindDataForBusinessTable();
            }
            else if (statType == 2) {
                switch (statContent) {
                    case 1:
                        processArrayForLoadStat(businessStatResArray);
                        pageNum = Math.floor(businessStatArrayAfterProcess.length / dateNum);
                        curPage = 0;
                        setPageNum();
                        $("#prev").show();
                        $("#next").hide();
                        if (businessStatArrayAfterProcess.length % dateNum != 0)
                            pageNum++;

                        setPageNum();
                        if (pageNum <= 1)
                            $("#prev").hide();

                        bindDataForLoadChart();
                        bindDataForLoadTable();
                        break;
                    case 2:
                        pageNum = processArrayForLoadStatByDic(businessStatResArray);
                        console.log("businessStatArrayAfterProcess", businessStatArrayAfterProcess);

                        curPage = 0;
                        setPageNum();
                        $("#prev").show();
                        $("#next").hide();
                        if (pageNum != 0)
                            pageNum++;

                        setPageNum();
                        if (pageNum <= 1)
                            $("#prev").hide();

                        bindDataForLoadChartByBatchs();
                        bindDataForPieChart();
                        break;
                    case 3:
                        pageNum = processArrayForLoadStatByDic(businessStatResArray);
                        console.log("businessStatArrayAfterProcess", businessStatArrayAfterProcess);

                        curPage = 0;
                        setPageNum();
                        $("#prev").show();
                        $("#next").hide();
                        if (pageNum != 0)
                            pageNum++;

                        setPageNum();
                        if (pageNum <= 1)
                            $("#prev").hide();

                        bindDataForLoadChartByBatchs();
                        bindDataForPieChart();
                        break;
                    default:
                        break;
                }
            }
        }

        function tableTypeChanged() {
            if ($('#tableType')[0].value == 1)
                $('#countsCol')[0].innerHTML = '导入数据量(条)';
            else if ($('#tableType')[0].value == 2)
                $('#countsCol')[0].innerHTML = '接收数据量(条)';

            bindDataForLoadTable();
        }

        function clearOldData() {
            //businessStatArrayAfterProcess.splice(0, businessStatArrayAfterProcess.length);
            businessStatArrayAfterProcess = [];
            dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
            if (statType == 1)
                dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
            else if (statType == 2) {
                switch ($('#statType')[0].value) {
                    case "1":
                        if (dataTypeOption.series[0] != undefined)
                            dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
                        if (dataTypeOption.series[1] != undefined)
                            dataTypeOption.series[1].data.splice(0, dataTypeOption.series[0].data.length);
                        break;
                    case "2":
                        dataTypeOption.series = [];
                        break;
                    case "3":
                        dataTypeOption.series = [];
                        break;
                    default:
                        break;
                }
            }

            //$('#CountTableBody')[0].innerHTML = "";
        }

        function setPageNum() {
            $("#chartPageNum")[0].innerHTML = (curPage + 1) + "/" + pageNum;
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
        }

        return {
            refresh: refresh,
            getBusinessTimeWithInterval: getBusinessTimeWithInterval,
            getLoadWithInterval: getLoadWithInterval,
            granularitySelectChanged: granularitySelectChanged,
            tableTypeChanged: tableTypeChanged,
            statContentChanged: statContentChanged,
        }

    }
);