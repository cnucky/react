define([
    "../lib/vue/vue",
    "../lib/echarts/echarts.min"
], function (Vue, echarts) {
    Vue.component('datazoom-one-bar-one-line', {
        // 选项
        template: '<div class="echarts"></div>',
        props: {
            dataConfig: {
                type: Object,
                default: function () {
                    var value = {};
                    value.columnTitle = [{
                        value: '2012-01'
                    }, {
                        value: '2012-02'
                    }, {
                        value: '2012-03'
                    }, {
                        value: '2012-04'
                    }, {
                        value: '2012-05'
                    }, {
                        value: '2012-06'
                    }, {
                        value: '2012-07'
                    }, {
                        value: '2012-08'
                    }];
                    value.rowTitle = [{
                        name: '所有人员',
                        id: 12584,
                        unit: '个'
                    }, {
                        name: '重点人员',
                        id: 12585,
                        unit: '个'
                    }];
                    value.content = [
                        [25, 68, 95, 48, 31, 76, 15, 23],
                        [12, 39, 45, 22, 1, 56, 8, 17]
                    ];
                    return value;
                }
            },
            styleConfig: {
                type: Object
            }
        },
        data: function () {
            return {
                chart: new Object()
            };
        },
        mounted: function () {
            console.log('mounted');
            var vm = this;

            // 初始化echarts对象
            var myChart = echarts.init(vm.$el);
            console.log(vm.dataConfig);
            // 初始化图表数据
            var yAxisNameList = [];
            var yAxisLists = [];
            var legendData, xAxisData;
            var seriesValue = [];

            function upLegendData() {
                yAxisNameList = [];
                yAxisLists = [];
                legendData = vm.dataConfig.rowTitle.map(function (item) {
                    if (yAxisNameList.indexOf(item.unit) < 0) {
                        yAxisNameList.push(item.unit);
                        var yAxis = {};
                        yAxis.name = '';
                        yAxis.axisLine = {
                            lineStyle: {
                                color: '#30a4ff'
                            }
                        };
                        yAxis.splitLine = {
                            lineStyle: {
                                width: 0.5,
                                type: 'dashed',
                                opacity: 0.5
                            }
                        };
                        if (item.max) {
                            yAxis.max = item.max;
                        }
                        yAxisLists.push(yAxis);
                    }

                    return item.name;
                });
                // if (yAxisNameList.length > 1) {
                //     yAxisLists.forEach(function (item, index) {
                //         item.name = vm.dataConfig.rowTitle[index].name + '(' + item.name + ')'
                //     });
                // }
            }

            function ipXAxisData() {
                xAxisData = vm.dataConfig.columnTitle.map(function (item) {
                    return item.value;
                });
            }

            function upSeriesValue() {
                var seriesIsLine = true;
                seriesValue = vm.dataConfig.rowTitle.map(function (item, index) {
                    var chart = {};
                    chart.name = item.name;
                    chart.id = item.id;
                    if (vm.styleConfig.items && vm.styleConfig.items[item.id]) {
                        chart.type = vm.styleConfig.items[item.id].type;
                    } else {
                        chart.type = seriesIsLine ? 'line' : 'bar';
                        seriesIsLine = !seriesIsLine;
                    }
                    if (item.stack) {
                        console.log(item.stack);
                        chart.stack = item.stack;
                        chart.type = 'bar';
                    }
                    if (chart.type == 'bar') {
                        chart.barWidth = '30%';
                    }
                    chart.data = vm.dataConfig.content[index];
                    chart.dataType = item.unit;
                    chart.yAxisIndex = yAxisNameList.indexOf(item.unit);
                    return chart;
                });
                console.log('kong', seriesValue);
            }

            function upDate() {
                upLegendData();
                ipXAxisData();
                upSeriesValue();
            }

            upDate();
            if (vm.dataConfig.rowTitle.length == 0) {
                yAxisLists.push({
                    name: '',
                    axisLine: {
                        lineStyle: {
                            color: '#30a4ff'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            width: 0.5,
                            type: 'dashed',
                            opacity: 0.5
                        }
                    }
                });
            }

            // 初始化一个图表类型
            var chartType = 'line';
            // 指定图表的配置项和数据
            var option = {
                title: {
                    show: false
                },
                tooltip: {
                    confine: true,
                    trigger: 'axis'
                    //formatter: function(data) {
                    //    console.log(data);
                    //    return 'aa';
                    //}
                },
                legend: {
                    data: legendData,
                    itemWidth: 20,
                    itemHeight: 8,
                    textStyle: {
                        color: '#ccc'
                    }
                },
                grid: {
                    left: '2%',
                    top: '15%',
                    right: '2%',
                    bottom: '24%',
                    containLabel: true
                },
                dataZoom: {
                    type: 'slider',
                    left: '5%',
                    right: '2%',
                    top: '90%',
                    bottom: '2%',
                    realtime: false,
                    textStyle: {
                        color: '#30a4ff'
                    }
                },
                color: ['#f86e70', '#6df7f5', '#f7ef6d', '#6df784', '#ea0000', '#846df7', '#f76de5', '#60ef00', '#089482', '#0824f0'],
                yAxis: yAxisLists,
                xAxis: {
                    nameTextStyle: {
                        color: '#30a4ff'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#30a4ff'
                        }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    data: xAxisData
                },
                series: seriesValue
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
            //console.log(document.getElementsByClassName('echarts')[0]);
            //document.getElementsByClassName('echarts')[0].onmousemove =  function(event) {
            //    console.log(event);
            //};
            console.log(vm.styleConfig);
            myChart.resize({
                'width': vm.styleConfig.width,
                'height': vm.styleConfig.height
            });
            vm.chart = myChart;

            // 监听数据变化并更新图表
            vm.$watch('dataConfig', function (val, oldVal) {
                upDate();
                console.log(vm.dataConfig);
                var newOption = {
                    legend: {
                        data: legendData
                    },
                    yAxis: yAxisLists,
                    xAxis: {
                        data: xAxisData
                    },
                    series: seriesValue
                };
                vm.chart.setOption(newOption);
            }, {
                deep: true
            });
            // 监听样式变化并改变图表大小
            vm.$watch('styleConfig', function (val, oldVal) {
                upSeriesValue();
                console.log(vm.dataConfig);
                vm.chart.setOption({
                    series: seriesValue
                });
                console.log(vm.styleConfig);
                myChart.resize({
                    'width': vm.styleConfig.width,
                    'height': vm.styleConfig.height
                });
            }, {
                deep: true
            });
            //window.addEventListener('resize', function () {
            //    //console.log('win change');
            //    vm.chart.resize();
            //});
        }
    });
});