/**
 * Created by songqiankun on 2017/2/9.
 */
define([
    "../lib/vue/vue",
    "../lib/echarts/echarts.min"
], function (Vue, echarts) {
    Vue.component('echarts-radar', {
        // 选项
        template: '<div class="echarts"></div>',
        props: {
            dataConfig: {
                type: Object,
                default: function () {
                    var value = {};
                    value.columnTitle = [{
                        value: '重点人数',
                        max: 100
                    }, {
                        value: '重点人员通联',
                        max: 100
                    }, {
                        value: '威胁数',
                        max: 100
                    }, {
                        value: '高威胁人员',
                        max: 100
                    }, {
                        value: '重点区域的重点人数',
                        max: 100
                    }];
                    value.rowTitle = [{
                        name: '平均数',
                        id: "12345"
                    }, {
                        name: '实际数',
                        id: "4561"
                    }];
                    value.content = [
                        [25, 68, 95, 48, 31],
                        [12, 39, 45, 22, 1]
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
            // 处理数据
            //vm.dataConfig = {
            //    columnTitle: [
            //        {value: '重点人数',max:100},
            //        {value: '重点人员通联',max:100},
            //        {value: '威胁数',max:100},
            //        {value: '高威胁人员',max:100},
            //        {value: '重点区域的重点人数',max:100}
            //    ],
            //    rowTitle: [
            //        {
            //            name: '平均数',
            //            id: 125846
            //        },
            //        {
            //            name: '实际数',
            //            id: 125855
            //        }
            //    ],
            //    content: [
            //        [25, 68, 95, 48, 31],
            //        [12, 39, 45, 22, 1]
            //    ]
            //};

            // 初始化echarts对象
            var myChart = echarts.init(vm.$el);

            // 初始化图表数据
            var legendData, indicatorValue, seriesData;

            function upLegendData() {
                legendData = vm.dataConfig.rowTitle.map(function (item) {
                    return item.name;
                });
            }

            function upIndicatorValue() {
                indicatorValue = vm.dataConfig.columnTitle.map(function (item) {
                    var newItem = {};
                    newItem.name = item.value;
                    newItem.max = item.max;
                    return newItem;
                });
            }

            function upSeriesData() {
                seriesData = vm.dataConfig.rowTitle.map(function (item, index) {
                    var chart = {};
                    chart.name = item.name;
                    chart.id = item.id;
                    if (vm.styleConfig.items) {
                        if (vm.styleConfig.items[item.id]) {

                        }
                    } else {}
                    chart.value = vm.dataConfig.content[index];
                    return chart;
                });
            }

            console.log(vm.dataConfig);

            function upDate() {
                upLegendData();
                upIndicatorValue();
                upSeriesData();
            }

            upDate();

            // 指定图表的配置项和数据
            var option = {
                title: {
                    show: false
                },
                tooltip: {
                    confine: true,
                    trigger: 'item'
                },
                legend: {
                    data: legendData,
                    itemWidth: 20,
                    itemHeight: 8,
                    textStyle: {
                        color: '#ccc'
                    }
                },
                radar: {
                    indicator: indicatorValue,
                    nameGap: 5,
                    center: ['55%', '55%'],
                    radius: '50%',
                    splitLine: {
                        lineStyle: {
                            width: 0.5
                        }
                    },
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.2)']
                        }
                    }
                },
                color: ['#f86e70', '#6df7f5', '#f7ef6d', '#6df784', '#ea0000', '#846df7', '#f76de5', '#60ef00', '#089482', '#0824f0'],
                series: [{
                    type: 'radar',
                    data: seriesData
                }]
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
            console.log(vm.styleConfig);
            myChart.resize({
                'width': vm.styleConfig.width,
                'height': vm.styleConfig.height
            });
            vm.chart = myChart;
            // 监听数据变化并更新图表
            vm.$watch('dataConfig', function (val, oldVal) {
                upDate();
                console.log('change data to', vm.dataConfig);
                var newOption = {
                    legend: {
                        data: legendData
                    },
                    radar: [{
                        indicator: indicatorValue
                    }],
                    series: [{
                        data: seriesData
                    }]
                };
                vm.chart.setOption(newOption);
            }, {
                deep: true
            });
            // 监听组件大小变化并改变图表大小
            vm.$watch('styleConfig', function (val, oldVal) {
                upSeriesData();
                console.log(seriesData);
                myChart.setOption({
                    series: [{
                        data: seriesData
                    }]
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
            //    vm.chart.resize();
            //});
        }
    });
});