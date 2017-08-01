/**
 * Created by root on 3/15/16.
 */

define([], function () {
    Date.prototype.dateAdd = function (strInterval, Number) {
        var dtTmp = this;
        switch (strInterval) {
            case 's' :
                return new Date(Date.parse(dtTmp) + (1000 * Number));
            case 'n' :
                return new Date(Date.parse(dtTmp) + (60000 * Number));
            case 'h' :
                return new Date(Date.parse(dtTmp) + (3600000 * Number));
            case 'd' :
                return new Date(Date.parse(dtTmp) + (86400000 * Number));
            case 'w' :
                return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
            case 'q' :
                return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number * 3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
            case 'm' :
                return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
            case 'y' :
                return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        }
    }

    function formateDate(now) {
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();

        var hh = now.getHours();
        var mm = now.getMinutes();

        var clock = year + "-";

        if (month < 10)
            clock += "0";

        clock += month + "-";

        if (day < 10)
            clock += "0";

        clock += day;

        //if(hh < 10)
        //    clock += "0";
        //
        //clock += hh + ":";
        //if (mm < 10) clock += '0';
        //clock += mm;
        return (clock);
    }

    function getDataTypeInfo() {
        console.log("getDataTypeInfo!!!");
        $.getJSON('/datamanage/dataimport/getDataType', function (rsp) {
            if (rsp.code == 0) {
                console.log("数据类型信息:" + rsp.data.sysData);
                return rsp.data.sysData;
            }
            else {
                console.log("获取数据类型信息失败:" + rsp.message);
            }
        });
    }

    function initPage(tableHeight) {
        console.log("tableHeight", tableHeight);

        $("#prev").show();
        $("#btn-lastPage").show();
        $("#next").hide();
        $("#btn-firstPage").hide();

        $("#CountTable").show();
        $("#pieGraphic").hide();

        var endDate = new Date();
        var beginDate = endDate.dateAdd('d', -30);

        $('#dateRange')[0].value = formateDate(beginDate) + ' - ' + formateDate(endDate);

        $('#CountTable1').dataTable({
            'data': [],
            "bAutoWidth": false,
            'scrollX': true,
            'scrollY': tableHeight,
            'fixedHeader': true,
            'ordering': false,
            "bPaginate": false,
            'select': true,
            "columns": [
                {"data": "dateStr"},
                {"data": "counts"},
                {"data": "variationCounts"},
                {"data": "variationRate"}
            ],
            //'aaSorting': [
            //    [0, 'desc']
            //],
            //"aoColumnDefs": [{
            //    'bSortable': false,
            //    'bVisible': false,
            //    'aTargets': [4]
            //}],
            //'sPaginationType': "",
            "oLanguage": {
                "sProcessing": "正在加载信息...",
                "sLengthMenu": "每页显示_MENU_条记录",
                "sInfo": "",
                "sInfoEmpty": "未查询到相关的任务信息",
                "sZeroRecords": "对不起，查询不到相关信息",
                "sInfoFiltered": "",
                "sSearch": "搜索",
                "oPaginate": {
                    "sPrevious": "前一页",
                    "sNext": "后一页"
                }
            },
            "iDisplayLength": 10,
            'bLengthChange': false,
            //"aLengthMenu": [
            //    [5, 10, 10, 25, 50, -1],
            //    [5, 10, 25, 50, "All"]
            //],
            "sDom": '<"clearfix"r>Zt<"dt-panelfooter clearfix hide"lp>',
            //"sDom": '<"clearfix"r>t<"dt-panelfooter clearfix hide"ip>',
            'colResize': {
                'tableWidthFixed': true,
            },
            //'serverSide': true,
        });

        $('#CountTable1').on('draw.dt', function () {
            $('table tr td').each(function () {
                if (judgeEllipsis($(this)[0])) {
                    $(this).tooltip({
                        container: "body",
                        title: $(this).html(),
                    });
                }

            });
        });
    }

    //工具函数，判断传入元素是否超出显示范围，即text-overflow(css style)是否为 ellipsis
    function judgeEllipsis(e) {
        if (e.offsetWidth < e.scrollWidth) {
            return true;
        } else {
            return false;
        }
    }

    function getValue(value) {
        var count = parseInt(value);
        if (count >= 10000 && count < 100000000)
            return count / 10000 + '万';

        if (count >= 100000000)
            return count / 100000000 + '亿';

        return count;
    }

    function initLoadStatOption() {
        return {
            title: {
                x: 'center',
                text: '该数据类型的数据量'
            },
            legend: {
                show: true,
                x: 'left',
                data: ['接收数据量', '导入数据量']
            },
            tooltip: {
                trigger: 'axis'
            },
            toolbox: {
                show: true,
                y: 'top',
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: false,
            grid: {
                show: false,
                borderWidth: 1,
                //backgroundColor: 'yellow'
            },
            xAxis: [
                {
                    type: 'category',
                    //boundaryGap: false,
                    show: true,
                    data: []
                    //  '2016-03-28', '2016-03-29', ]
                    //'2016-03-30', '2016-03-31',
                    //'2016-04-01', '2016-04-02', '2016-04-03', '2016-04-04', '2016-04-05',
                    //'2016-04-06', '2016-04-07', '2016-04-08', '2016-04-09', '2016-04-10']
                }
            ],
            yAxis: [{
                scale: true,
                type: 'value',
                show: true,
                data: [],
                axisLabel: {
                    formatter: getValue //'{value} km'
                }
            }],
            series: [
                {
                    name: '接收数据量',
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: ["#d87a80"],//getColorList,
                            //label: {
                            //    show: false,
                            //    textStyle:
                            //    {color:"grey"},
                            //    position: 'top',
                            //    formatter: '{b}',
                            //    distance:1
                            //},
                            lineStyle: {
                                width: 2
                            },
                            //areaStyle:{
                            //    type:'default',
                            //    //color:'#F5F5F5',
                            //}
                        }
                    },
                    //barGap:20,
                    //barMaxWidth:80,
                    barMinHeight: 5,
                    data: [],
                    //markPoint: {
                    //    tooltip: {
                    //        show:true,
                    //        trigger: 'item',
                    //        backgroundColor: 'rgba(0,0,0,0)',
                    //    },
                    //    data: [1000, 2000]
                    //}
                },
                {
                    name: '导入数据量',
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: ["#2ec7c9"],//getColorList,
                            //label: {
                            //    show: false,
                            //    textStyle:
                            //    {color:"grey"},
                            //    position: 'top',
                            //    formatter: '{b}',
                            //    distance:1
                            //},
                            lineStyle: {
                                width: 2
                            },
                            //areaStyle:{
                            //    type:'default',
                            //    //color:'#F5F5F5',
                            //}
                        }
                    },
                    //barGap:10,
                    //barMaxWidth:30,
                    barMinHeight: 5,
                    data: [],
                    //markPoint: {
                    //    tooltip: {
                    //        show:true,
                    //        trigger: 'item',
                    //        backgroundColor: 'rgba(0,0,0,0)',
                    //    },
                    //    data: [1000, 2000]
                    //}
                }
            ],
            //animationThreshold: 2000,       // 动画元素阀值，产生的图形原素超过2000不出动画
            animationDuration: 2500,        // 过渡动画参数：进入
            animationDurationUpdate: 500,   // 过渡动画参数：更新
            //animationEasing: 'ExponentialOut',    //BounceOut

            noDataEffect: 'bubble',
            noDataText: '暂无数据',
        };
    }

    function initBatchStatOption() {
        return {
            title: {
                x: 'center',
                text: '该数据类型的数据量'
            },
            legend: {
                show: true,
                x: 'left',
                data: []
            },
            tooltip: {
                trigger: 'axis'
            },
            toolbox: {
                show: true,
                y: 'top',
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    //boundaryGap: false,
                    //show: true,
                    data: []
                }
            ],
            yAxis: [{
                //scale:true,
                type: 'value',
                //show: true,
                axisLabel: {
                    formatter: getValue //'{value} km'
                }
            }
            ],
            series: [],
            animationThreshold: 2000,       // 动画元素阀值，产生的图形原素超过2000不出动画
            animationDuration: 3000,        // 过渡动画参数：进入
            animationDurationUpdate: 500,   // 过渡动画参数：更新
            animationEasing: 'ExponentialOut'    //BounceOut
        };
    }

    function initBusinessStatOption() {
        return {
            title: {
                x: 'center',
                text: '该数据类型的数据量'
            },
            tooltip: {
                trigger: 'axis'
            },
            toolbox: {
                show: true,
                y: 'top',
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true}
                }
            },
            calculable: false,
            xAxis: [
                {
                    type: 'category',
                    show: true,
                    data: []
                }
            ],
            yAxis: [{
                scale: true,
                type: 'value',
                show: true,
                axisLabel: {
                    formatter: getValue //'{value} km'
                }
            }],
            series: [
                {
                    name: '按业务时间数据量',
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: ["#d87a80"],//getColorList, b6a2de
                            label: {
                                show: false,
                                textStyle: {color: "grey"},
                                position: 'top',
                                formatter: '{b}',
                                distance: 1
                            },
                            lineStyle: {
                                width: 2
                            },
                            areaStyle: {
                                type: 'default',
                                //color:'#2ec7c9',
                            }
                        }
                    },
                    //barGap: 20,
                    //barMaxWidth: 40,
                    barMinHeight: 5,
                    data: [],
                    markPoint: {
                        tooltip: {
                            show: true,
                            trigger: 'item',
                            backgroundColor: 'rgba(0,0,0,0)',
                        },
                        data: [1000, 2000]
                    }
                }
            ],
            animationThreshold: 2000,       // 动画元素阀值，产生的图形原素超过2000不出动画
            animationDuration: 2500,        // 过渡动画参数：进入
            animationDurationUpdate: 500,   // 过渡动画参数：更新
            animationEasing: 'ExponentialOut'    //BounceOut
        };
    }

    function initPieOption() {
        return {
            title: {
                x: 'center',
                text: '',
                show: true
            },
            legend: {
                show: true,
                orient: 'vertical',
                x: 'left',
                data: [],
            },
            tooltip: {
                trigger: 'item'
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            series: [
                {
                    name: '数据量：',
                    type: 'pie',
                    radius: '45%',
                    itemStyle: {
                        normal: {
                            //color: ['#2ec7c9'],
                            label: {
                                show: true
                            },
                            labelLine: {
                                show: true
                            }
                        }
                    },
                    center: ['50%', '60%'],
                    data: []
                }
            ],
            noDataEffect: 'bubble',
            noDataText: '暂无数据',
        }
    }

    return {
        getDataTypeInfo: getDataTypeInfo,
        initPage: initPage,
        initLoadStatOption: initLoadStatOption,
        initBusinessStatOption: initBusinessStatOption,
        initBatchStatOption: initBatchStatOption,
        initPieOption: initPieOption,
    }

});