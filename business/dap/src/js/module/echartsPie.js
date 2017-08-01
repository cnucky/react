/**
 * Created by songqiankun on 2017/2/9.
 */
define([
    "../lib/vue/vue",
    "../lib/echarts/echarts.min"
], function (Vue, echarts) {

    Vue.component('echarts-pies', {
        // 选项
        template: '<div class="echarts">\
    <div v-show="!styleConfig.isEnlarge" class="pie"></div>\
    <div v-show="styleConfig.isEnlarge" class="grid"></div>\
    </div>',
        props: {
            dataConfig: {
                type: Array,
                default: function () {
                    var value = {};
                    return value;
                }
            },
            styleConfig: {
                type: Object
            }
        },
        data: function () {
            return {
                chartPie: new Object(),
                chartGrid: new Object()
            };
        },
        mounted: function () {
            console.log('mounted');
            var vm = this;

            var pieDom = vm.$el.childNodes[0];

            var timeLineData, optionsValue;
            var legendData = [];
            var seriesValue = {};

            var gridDom = vm.$el.childNodes[2];
            // console.log(gridDom);

            var gridxAxisData = timeLineData;
            var gridLegendData = legendData;
            var keyData = [];
            var gridData = {};
            var gridSeriesValue;
            var timelineIsShow=false;

            function upLandS() {
                gridxAxisData = timeLineData = [];
                gridData = {};
                vm.dataConfig.forEach(function (item) {
                    timeLineData.push(item.value);
                    // var legendArr = [];
                    // legendData[item.id] = legendArr;
                    item.data.forEach(function (dataItem) {
                        if (gridData[dataItem.name] == undefined) {
                            gridData[dataItem.name] = {};
                        }
                        var dataItemGrid = gridData[dataItem.name];
                        dataItem.value.forEach(function (totalItem) {
                            if (legendData.indexOf(totalItem.name) < 0) {
                                legendData.push(totalItem.name);
                            }
                            if (dataItemGrid[totalItem.name] == undefined) {
                                dataItemGrid[totalItem.name] = [];
                            }
                            dataItemGrid[totalItem.name].push(totalItem.value);
                        });
                    });
                });
                console.log('grid data', gridData);
            }

            function upSeriesValue() {
                vm.dataConfig.forEach(function (item) {
                    var seriesArr = [];
                    seriesValue[item.id] = seriesArr;
                    var length = item.data.length;
                    var rL = 80 / length;
                    item.data.forEach(function (dataItem, index) {
                        var seriesItem = {};
                        seriesItem.name = dataItem.name;
                        seriesItem.type = 'pie';
                        seriesItem.radius = [];
                        seriesItem.radius[0] = index * rL * 1.5 + '%';
                        seriesItem.radius[1] = (index + 1) * rL + '%';
                        if (index == 0) {
                            seriesItem.radius[0] = rL * 0.5 + '%';
                        }
                        seriesItem.label = {
                            normal: {
                                show: false
                            }
                        };
                        seriesItem.labelLine = {
                            normal: {
                                show: false
                            }
                        };
                        if (vm.styleConfig.isEnlarge) {
                            seriesItem.label = {
                                normal: {
                                    position: 'inner',
                                    show: true
                                }
                            };
                            seriesItem.labelLine = {
                                normal: {
                                    show: false
                                }
                            };
                            if (index == (length - 1)) {
                                seriesItem.label = {
                                    normal: {
                                        position: 'outside',
                                        show: true
                                    }
                                };
                                seriesItem.labelLine = {
                                    normal: {
                                        show: true
                                    }
                                };
                            }
                        }
                        seriesItem.data = dataItem.value;
                        seriesArr.push(seriesItem);
                    });
                });
                console.log('series', seriesValue);
            }

            function upOptionsValue() {
                var optionsArr = [];
                vm.dataConfig.forEach(function (item) {
                    var option = {};
                    console.log('ONE series', seriesValue[item.id]);
                    option.id = item.id;
                    option.legend = {};
                    option.legend.data = legendData;
                    option.series = seriesValue[item.id];
                    optionsArr.push(option);
                });
                optionsValue = optionsArr;
            }

            function upGridSeries() {
                gridSeriesValue = [];
                keyData = [];
                for (var key in gridData) {
                    if (gridData.hasOwnProperty(key)) {
                        keyData.push(key);
                        var value = gridData[key];
                        for (var key1 in value) {
                            if (value.hasOwnProperty(key1)) {
                                var data = value[key1];
                                var seriesO = {
                                    type: 'bar',
                                    stack: key,
                                    name: key1,
                                    data: data,
                                    barWidth: '30%'
                                };
                                seriesO.xAxisIndex = keyData.indexOf(key);
                                seriesO.yAxisIndex = keyData.indexOf(key);
                                gridSeriesValue.push(seriesO);
                            }
                        }
                    }
                }
            }

            function upData() {
                timelineIsShow = false;
                upLandS();
                upSeriesValue();
                upOptionsValue();
                upGridSeries();
                if(vm.dataConfig.length >1) {
                    timelineIsShow = true;
                }
            }

            upData();

            var myChart = echarts.init(pieDom);

            var option = {
                baseOption: {
                    timeline: {
                        show: timelineIsShow,
                        autoPlay: true,
                        playInterval: 2000,
                        orient: 'vertical',
                        left: '0',
                        top: '10',
                        bottom: '10',
                        width: 40,
                        data: timeLineData,
                        label: {
                            formatter: function (s) {
                                return (new Date(s)).getUTCDate();
                            },
                            position: 'right',
                            normal: {
                                textStyle: {
                                    color: '#30a4ff'
                                }
                            },
                            emphasis: {
                                textStyle: {
                                    color: '#30a4ff'
                                }
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#0f0',
                                borderColor: '#30a4ff'
                            },
                            emphasis: {
                                color: '#0f0',
                                borderColor: '#30a4ff'
                            }
                        },
                        checkpointStyle: {
                            color: '#30a4ff',
                            borderColor: '#30a4ff'
                        },
                        controlStyle: {
                            showPlayBtn: true,
                            showPrevBtn: false,
                            showNextBtn: false,
                            position: 'top',
                            normal: {
                                color: '#30a4ff',
                                borderColor: '#30a4ff'
                            }
                        }
                    },
                    title: {
                        show: false
                    },
                    color: ['#f86e70', '#6df7f5', '#f7ef6d', '#6df784', '#ea0000', '#846df7', '#f76de5', '#60ef00', '#089482', '#0824f0'],
                    legend: {
                        right: 'right',
                        top: '10',
                        itemWidth: 20,
                        itemHeight: 8,
                        textStyle: {
                            color: '#ccc'
                        },
                        orient: 'vertical',
                        padding: 0,
                        itemGap: 3,
                        align: 'right'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function (param) {
                            if (param.componentType == "timeline") {
                                return param.data;
                            } else if (param.componentType == "series") {
                                return param.seriesName + '<br />' + param.name + ':' + param.value + '(' + param.percent + '%)';
                            }
                        }
                    },
                    series: []
                },
                options: optionsValue
            };
            console.log(option);

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
            console.log(vm.styleConfig);
            myChart.resize({
                'width': vm.styleConfig.width,
                'height': vm.styleConfig.height
            });
            vm.chartPie = myChart;

            // 直角坐标系图表绘制
            var myGridChart = echarts.init(gridDom);

            var gridOption = {
                title: {
                    show: false
                },
                tooltip: {
                    confine: true,
                    trigger: 'axis'
                },
                legend: {
                    data: gridLegendData,
                    itemWidth: 20,
                    itemHeight: 8,
                    textStyle: {
                        color: '#ccc'
                    }
                },
                grid: [{
                    left: '2%',
                    top: '7%',
                    right: '2%',
                    bottom: '50%',
                    containLabel: true
                }, {
                    left: '2%',
                    top: '55%',
                    right: '2%',
                    bottom: '2%',
                    containLabel: true
                }],
                color: ['#f86e70', '#6df7f5', '#f7ef6d', '#6df784', '#2f4554', '#ea0000', '#846df7', '#f76de5', '#60ef00', '#089482', '#0824f0'],
                xAxis: [{
                    gridIndex: 0,
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
                    data: gridxAxisData
                }, {
                    gridIndex: 1,
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
                    data: gridxAxisData
                }],
                yAxis: [{
                    gridIndex: 0,
                    name: keyData[0],
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
                }, {
                    gridIndex: 1,
                    name: keyData[1],
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
                }],
                series: gridSeriesValue
            };
            console.log('gridOption', gridOption);
            myGridChart.setOption(gridOption);
            myGridChart.resize({
                'width': vm.styleConfig.width,
                'height': vm.styleConfig.height
            });
            vm.chartGrid = myGridChart;
            // 监听数据变化并更新图表
            vm.$watch('dataConfig', function (val, oldVal) {
                console.log(vm.dataConfig);
                upData();
                console.log(optionsValue);
                vm.chartPie.setOption({
                    baseOption: {
                        timeline: {
                            show: timelineIsShow,
                            data: timeLineData
                        }
                    },
                    options: optionsValue
                });
                console.log(vm.chartPie.getOption());
                vm.chartGrid.setOption({
                    legend: {
                        data: gridLegendData
                    },
                    xAxis: [{
                        data: gridxAxisData
                    }, {
                        data: gridxAxisData
                    }],
                    yAxis: [{
                        name: keyData[0]
                    }, {
                        name: keyData[1]
                    }],
                    series: gridSeriesValue
                });
            }, {
                deep: true
            });
            // 监听组件大小变化并改变图表大小
            vm.$watch('styleConfig', function () {
                console.log(vm.styleConfig);
                upData();
                vm.chartPie.setOption({
                    options: optionsValue
                });
                vm.chartPie.resize({
                    'width': vm.styleConfig.width,
                    'height': vm.styleConfig.height
                });
                if (vm.styleConfig.isEnlarge) {
                    vm.chartGrid.setOption({
                        series: gridSeriesValue
                    });
                    vm.chartGrid.resize({
                        'width': vm.styleConfig.width,
                        'height': vm.styleConfig.height
                    });
                }
            }, {
                deep: true
            });
        }
    });
});