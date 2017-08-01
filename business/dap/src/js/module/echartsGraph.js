/**
 * Created by songqiankun on 2017/2/13.
 */
define([
    "../lib/vue/vue",
    "../lib/echarts/echarts.min"
], function (Vue, echarts) {
    Vue.component('echarts-graph', {
        // 选项
        template: '<div class="echarts"></div>',
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
                chart: new Object()
            };
        },
        mounted: function () {
            console.log('mounted');
            var vm = this;

            var timeLineData, optionsValue;
            var legendData = {};
            var seriesValue = {};
            var categories = {};

            function upLandS() {
                timeLineData = [];
                vm.dataConfig.forEach(function (item) {
                    timeLineData.push(item.time);
                    var legendArr = [];
                    legendData[item.id] = legendArr;
                    categories[item.id] = [];
                    item.nodes.forEach(function (nodeItem) {
                        if (legendArr.indexOf(nodeItem.category) < 0) {
                            legendArr.push(nodeItem.category);
                            categories[item.id].push({
                                name: nodeItem.category
                            });
                        }
                    });
                });
            }

            function upSeriesValue() {
                vm.dataConfig.forEach(function (item) {
                    seriesValue[item.id] = [];

                    var seriesItem = {};
                    // seriesItem.id = item.id;
                    seriesItem.name = item.time;
                    seriesItem.type = 'graph';
                    seriesItem.layout = 'force';
                    seriesItem.legendHoverLink = true;
                    seriesItem.hoverAnimation = true;
                    seriesItem.draggable = true;
                    seriesItem.focusNodeAdjacency = true;
                    seriesItem.categories = categories[item.id];
                    if (vm.styleConfig.isEnlarge) {

                    }
                    seriesItem.nodes = [];
                    item.nodes.forEach(function (nodeItem, index) {
                        var newItem = {};
                        if (index == 0) {
                            newItem.x = 10;
                            newItem.y = 10;
                        }
                        newItem.name = nodeItem.personId;
                        newItem.rlName = nodeItem.name;
                        newItem.value = nodeItem.value;
                        newItem.personId = nodeItem.personId;
                        newItem.category = legendData[item.id].indexOf(nodeItem.category);
                        seriesItem.nodes.push(newItem);
                    });
                    seriesItem.links = item.links;
                    seriesItem.force = {
                        repulsion: 100,
                        gravity: 0.9,
                        edgeLength: 40,
                        layoutAnimation: true
                    };
                    console.log(seriesItem);

                    seriesValue[item.id].push(seriesItem);

                });
            }

            function upOptionsValue() {
                var optionsArr = [];
                vm.dataConfig.forEach(function (item) {
                    var option = {};
                    option.id = item.id;
                    option.legend = {};
                    option.legend.data = legendData[item.id];
                    option.series = seriesValue[item.id];
                    optionsArr.push(option);
                });
                optionsValue = optionsArr;
            }

            function upData() {
                upLandS();
                upSeriesValue();
                upOptionsValue();
            }

            upData();

            var myChart = echarts.init(vm.$el);

            var option = {
                baseOption: {
                    timeline: {
                        show: function () {
                            if (vm.dataConfig.length == 1) {
                                return false;
                            }
                            return true;
                        }(),
                        axisType: 'category',
                        autoPlay: false,
                        playInterval: 2000,
                        orient: 'horizontal',
                        left: '10',
                        right: '10',
                        bottom: '0',
                        height: 33,
                        data: timeLineData,
                        label: {
                            formatter: function (s) {
                                return new Date(s).getDate();
                            },
                            position: 'bottom',
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
                            position: 'right',
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
                        itemGap: 9,
                        align: 'right'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function (event) {
                            return event.data.rlName;
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
            myChart.on('click', function (event) {
                console.log(event);
                var back = {};
                back.personId = event.data.personId;
                vm.$emit('chartchange', {
                    chartName: 'echarts-graph',
                    eventName: 'clickNode'
                }, back);
            });
            myChart.resize({
                'width': vm.styleConfig.width,
                'height': vm.styleConfig.height
            });
            vm.chart = myChart;
            // 监听数据变化并更新图表
            vm.$watch('dataConfig', function (val, oldVal) {
                console.log(vm.dataConfig);
                upData();
                vm.chart.setOption({
                    baseOption: {
                        timeline: {
                            show: function () {
                                if (vm.dataConfig.length == 1) {
                                    return false;
                                }
                                return true;
                            }(),
                            data: timeLineData
                        }
                    },
                    options: optionsValue
                });
            }, {
                deep: true
            });
            // 监听组件大小变化并改变图表大小
            vm.$watch('styleConfig', function () {
                console.log(vm.styleConfig);
                upData();
                vm.chart.setOption({
                    options: optionsValue
                });
                myChart.resize({
                    'width': vm.styleConfig.width,
                    'height': vm.styleConfig.height
                });
            }, {
                deep: true
            });
        }
    });
});