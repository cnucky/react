/**
 * Created by songqiankun on 2017/2/9.
 */
define([
    "../lib/vue/vue",
    "../lib/echarts/echarts.min"
], function (Vue, echarts) {
    Vue.component('echarts-qx-map', {
        // 选项
        template: '\
    <div class="echarts">\
        <ul v-if="styleConfig.isEnlarge" class="qxmap-ul">\
            <li v-for="(item,index) in controllerConfig.geographies" :class="isSelect(item)" @click="changeSelect(item)">\
            {{item.text}}\
            </li>\
        </ul>\
        <div class="mapChart"></div>\
    </div>\
    ',
        props: {
            dataConfig: {
                type: Object,
                default: function () {
                    var value = {};
                    return value;
                }
            },
            styleConfig: {
                type: Object
            },
            controllerConfig: {
                type: Object
            }
        },
        data: function () {
            return {
                chart: new Object(),
                geoCoordMap: {
                    '上海': [121.4648, 31.2891],
                    '东莞': [113.8953, 22.901],
                    '东营': [118.7073, 37.5513],
                    '中山': [113.4229, 22.478],
                    '临汾': [111.4783, 36.1615],
                    '临沂': [118.3118, 35.2936],
                    '丹东': [124.541, 40.4242],
                    '丽水': [119.5642, 28.1854],
                    '乌鲁木齐': [87.9236, 43.5883],
                    '佛山': [112.8955, 23.1097],
                    '保定': [115.0488, 39.0948],
                    '兰州': [103.5901, 36.3043],
                    '包头': [110.3467, 41.4899],
                    '北京': [116.4551, 40.2539],
                    '北海': [109.314, 21.6211],
                    '南京': [118.8062, 31.9208],
                    '南宁': [108.479, 23.1152],
                    '南昌': [116.0046, 28.6633],
                    '南通': [121.1023, 32.1625],
                    '厦门': [118.1689, 24.6478],
                    '台州': [121.1353, 28.6688],
                    '合肥': [117.29, 32.0581],
                    '呼和浩特': [111.4124, 40.4901],
                    '咸阳': [108.4131, 34.8706],
                    '哈尔滨': [127.9688, 45.368],
                    '唐山': [118.4766, 39.6826],
                    '嘉兴': [120.9155, 30.6354],
                    '大同': [113.7854, 39.8035],
                    '大连': [122.2229, 39.4409],
                    '天津': [117.4219, 39.4189],
                    '太原': [112.3352, 37.9413],
                    '威海': [121.9482, 37.1393],
                    '宁波': [121.5967, 29.6466],
                    '宝鸡': [107.1826, 34.3433],
                    '宿迁': [118.5535, 33.7775],
                    '常州': [119.4543, 31.5582],
                    '广州': [113.5107, 23.2196],
                    '廊坊': [116.521, 39.0509],
                    '延安': [109.1052, 36.4252],
                    '张家口': [115.1477, 40.8527],
                    '徐州': [117.5208, 34.3268],
                    '德州': [116.6858, 37.2107],
                    '惠州': [114.6204, 23.1647],
                    '成都': [103.9526, 30.7617],
                    '扬州': [119.4653, 32.8162],
                    '承德': [117.5757, 41.4075],
                    '拉萨': [91.1865, 30.1465],
                    '无锡': [120.3442, 31.5527],
                    '日照': [119.2786, 35.5023],
                    '昆明': [102.9199, 25.4663],
                    '杭州': [119.5313, 29.8773],
                    '枣庄': [117.323, 34.8926],
                    '柳州': [109.3799, 24.9774],
                    '株洲': [113.5327, 27.0319],
                    '武汉': [114.3896, 30.6628],
                    '汕头': [117.1692, 23.3405],
                    '江门': [112.6318, 22.1484],
                    '沈阳': [123.1238, 42.1216],
                    '沧州': [116.8286, 38.2104],
                    '河源': [114.917, 23.9722],
                    '泉州': [118.3228, 25.1147],
                    '泰安': [117.0264, 36.0516],
                    '泰州': [120.0586, 32.5525],
                    '济南': [117.1582, 36.8701],
                    '济宁': [116.8286, 35.3375],
                    '海口': [110.3893, 19.8516],
                    '淄博': [118.0371, 36.6064],
                    '淮安': [118.927, 33.4039],
                    '深圳': [114.5435, 22.5439],
                    '清远': [112.9175, 24.3292],
                    '温州': [120.498, 27.8119],
                    '渭南': [109.7864, 35.0299],
                    '湖州': [119.8608, 30.7782],
                    '湘潭': [112.5439, 27.7075],
                    '滨州': [117.8174, 37.4963],
                    '潍坊': [119.0918, 36.524],
                    '烟台': [120.7397, 37.5128],
                    '玉溪': [101.9312, 23.8898],
                    '珠海': [113.7305, 22.1155],
                    '盐城': [120.2234, 33.5577],
                    '盘锦': [121.9482, 41.0449],
                    '石家庄': [114.4995, 38.1006],
                    '福州': [119.4543, 25.9222],
                    '秦皇岛': [119.2126, 40.0232],
                    '绍兴': [120.564, 29.7565],
                    '聊城': [115.9167, 36.4032],
                    '肇庆': [112.1265, 23.5822],
                    '舟山': [122.2559, 30.2234],
                    '苏州': [120.6519, 31.3989],
                    '莱芜': [117.6526, 36.2714],
                    '菏泽': [115.6201, 35.2057],
                    '营口': [122.4316, 40.4297],
                    '葫芦岛': [120.1575, 40.578],
                    '衡水': [115.8838, 37.7161],
                    '衢州': [118.6853, 28.8666],
                    '西宁': [101.4038, 36.8207],
                    '西安': [109.1162, 34.2004],
                    '贵阳': [106.6992, 26.7682],
                    '连云港': [119.1248, 34.552],
                    '邢台': [114.8071, 37.2821],
                    '邯郸': [114.4775, 36.535],
                    '郑州': [113.4668, 34.6234],
                    '鄂尔多斯': [108.9734, 39.2487],
                    '重庆': [107.7539, 30.1904],
                    '金华': [120.0037, 29.1028],
                    '铜川': [109.0393, 35.1947],
                    '银川': [106.3586, 38.1775],
                    '镇江': [119.4763, 31.9702],
                    '长春': [125.8154, 44.2584],
                    '长沙': [113.0823, 28.2568],
                    '长治': [112.8625, 36.4746],
                    '阳泉': [113.4778, 38.0951],
                    '青岛': [120.4651, 36.3373],
                    '韶关': [113.7964, 24.7028],
                    '琼海': [110.4746, 19.2590],
                    '三亚': [109.5122, 18.2516],
                    '儋州': [109.5806, 19.5208],
                    '甘肃': [103.5901, 36.3043],
                    '广西': [109.28, 25.29],
                    '新疆': [87.9236, 43.5883],
                    '内蒙古': [110.3467, 41.4899],
                    '西藏': [91.1865, 30.1465],
                    '河南': [113.4668, 34.6234],
                    '山西': [112.3352, 37.9413],
                    '福建': [119.4543, 25.9222],
                    '黑龙江': [127.9688, 45.368],
                    '吉林': [125.8154, 44.2584],
                    '山东': [117.1582, 36.8701],
                    '安徽': [117.29, 32.0581],
                    '陕西': [109.1162, 34.2004],
                    '浙江': [119.8313, 28.8773],
                    '湖北': [114.3896, 30.6628],
                    '广东': [113.5107, 23.2196],
                    '云南': [102.9199, 25.4663],
                    '辽宁': [123.1238, 42.1216],
                    '江西': [116.0046, 28.6633],
                    '宁夏': [106.3586, 38.1775],
                    '河北': [114.4995, 38.1006],
                    '江苏': [118.8062, 31.9208],
                    '四川': [103.9526, 30.7617],
                    '贵州': [106.6992, 26.7682],
                    '湖南': [113.0823, 28.2568],
                    '青海': [101.4038, 36.8207],
                    '海南': [110.3893, 19.8516],
                    '台湾': [121.5365, 25.0192],
                    '中国台湾': [121.5365, 25.0192],
                    '中国香港': [114.5435, 22.5439],
                    '香港': [114.5435, 22.5439],
                    '澳门': [114.5535, 22.5339],
                    'hainan': [109.7891, 19.1581],
                    'zhejiang': [119.5313, 29.8773]
                },
                legendData: {},
                seriesValue: {},
                selectGeography: this.controllerConfig.geographies[0].geography,
                valueMaxOb: {},
                valueMax: 0,
                selectLegend: ''
            };
        },
        mounted: function () {
            console.log('qxMap mounted');
            var vm = this;

            // vm.controllerConfig.geographies.forEach(function (item, index) {
            //     var geo = {};
            //     geo.geography = item.geography;
            //     geo.isSelect = false;
            //     if (index == 0) {
            //         geo.isSelect = true;
            //     }
            //     vm.geographys.push(geo);
            // });
            //../js/components/gisWidget/dap/components/res/mapData/
            // ../../resources/mapData/
            $.get('./img/' + vm.selectGeography + '.json', function (chinaMapData) {
                echarts.registerMap(vm.selectGeography, chinaMapData);
                // 初始化echarts对象
                //console.log(vm.$el.childNodes[2]);
                var dom = vm.$el.childNodes[2];
                var myChart = echarts.init(dom);

                // 初始化图表数据

                console.log(vm.dataConfig);

                function upDate() {
                    vm.upLegendData();
                    vm.upSeriesValue();
                    vm.selectLegend = vm.legendData[0]||'';
                }

                upDate();

                // 指定图表的配置项和数据
                var option = {
                    title: {
                        show: false
                    },
                    color: ['#6df7f5', '#f86e70', '#f7ef6d', '#6df784', '#ea0000', '#846df7', '#f76de5', '#60ef00', '#089482', '#0824f0'],
                    tooltip: {
                        confine: true,
                        trigger: 'item',
                        formatter: function (event) {
                            if (event.componentSubType == "effectScatter") {
                                return event.seriesName + '<br />' + event.name + ':' + event.value[2];
                            } else if (event.componentSubType == "lines") {
                                return event.seriesName + '<br />' + event.data.formName + '>' + event.data.toName + ':' + event.value;
                            } else {
                                return '其他';
                            }
                        }
                    },
                    legend: {
                        data: vm.legendData,
                        selectedMode: 'single',
                        itemWidth: 20,
                        itemHeight: 8,
                        textStyle: {
                            color: '#ccc'
                        }
                    },
                    visualMap: {
                        type: 'continuous',
                        max: (vm.valueMaxOb[vm.selectLegend]==undefined)?0:vm.valueMaxOb[vm.selectLegend],
                        min: 0,
                        range: null,
                        calculable: true,
                        text: ['高', '低'],
                        color: ['#6df7f5', '#f86e70'],
                        textStyle: {
                            color: '#30a4ff'
                        }
                    },
                    geo: {
                        map: vm.selectGeography,
                        label: {
                            normal: {
                                show: false
                            }
                        },
                        roam: true,
                        itemStyle: {
                            normal: {
                                borderColor: '#61a0a8',
                                color: '#00041a'
                            },
                            emphasis: {}
                        },
                        silent: true
                    },
                    series: vm.seriesValue
                };

                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option);
                console.log(vm.styleConfig);
                myChart.resize({
                    'width': vm.styleConfig.width,
                    'height': vm.styleConfig.height
                });
                myChart.on('legendselectchanged', function (event) {
                    vm.selectLegend = event.name;
                    myChart.setOption({
                        visualMap: {
                            max: vm.valueMaxOb[vm.selectLegend]
                        }
                    });
                });
                vm.chart = myChart;
                myChart.on('click', function (data) {
                    if (data.seriesType == "lines") {
                        var back = {};
                        back.type = data.seriesName;
                        back.formName = data.data.formName;
                        back.toName = data.data.toName;
                        vm.$emit('chartchange', {
                            chartName: 'echarts-qx-map',
                            eventName: 'clickMap'
                        }, back);
                    }
                });
                // 监听数据变化并更新图表
                vm.$watch('dataConfig', function (val, oldVal) {
                    upDate();
                    console.log('change data to', vm.dataConfig);
                    var newOption = {
                        legend: {
                            data: vm.legendData
                        },
                        visualMap: {
                            max: (vm.valueMaxOb[vm.selectLegend]==undefined)?0:vm.valueMaxOb[vm.selectLegend],
                            range: null
                        },
                        series: vm.seriesValue
                    };
                    vm.chart.setOption(newOption);
                }, {
                    deep: true
                });
                // 监听组件大小变化并改变图表大小
                vm.$watch('styleConfig', function (val, oldVal) {
                    upDate();
                    console.log('change styleData to', vm.styleConfig);
                    var newOption = {
                        visualMap: {
                            max: (vm.valueMaxOb[vm.selectLegend]==undefined)?0:vm.valueMaxOb[vm.selectLegend],
                            range: null
                        },
                        series: vm.seriesValue
                    };
                    vm.chart.setOption(newOption);
                    // console.log(vm.chart.getOption());
                    vm.chart.resize({
                        'width': vm.styleConfig.width,
                        'height': vm.styleConfig.height
                    });
                }, {
                    deep: true
                });
            });
        },
        methods: {
            isSelect: function (ob) {
                if (ob.geography == this.selectGeography) {
                    return 'geo-select';
                }
                return '';
            },
            upLegendData: function () {
                var vm = this;
                vm.legendData = vm.dataConfig.items.map(function (item) {
                    return item.name;
                });
            },
            upSeriesValue: function () {
                var vm = this;
                vm.valueMaxOb = {};
                var newValue = [];
                var myColor = ['#6df7f5', '#f86e70', '#f7ef6d', '#6df784', '#ea0000', '#846df7', '#f76de5', '#60ef00', '#089482', '#0824f0'];
                vm.dataConfig.items.forEach(function (item, index) {
                    var hasCity = true;
                    vm.valueMaxOb[item.name] = 0;
                    var chartLine = {};
                    var chartLine2 = {};
                    var chartEff = {};
                    chartEff.name = chartLine.name = chartLine2.name = item.name;
                    //chartEff.id = chartLine.id = item.id;

                    chartLine.type = 'lines';
                    chartLine.zlevel = 1;
                    chartLine.effect = {
                        show: true,
                        period: 6,
                        trailLength: 0.2,
                        symbolSize: 3
                        // color: '#fff'
                    };
                    chartLine.lineStyle = {
                        normal: {
                            width: 0,
                            curveness: 0.2
                            // color: myColor[index]
                        }
                    };
                    chartLine.data = [];
                    item.links.forEach(function (linkItem) {
                        vm.valueMaxOb[item.name] = linkItem.value > vm.valueMaxOb[item.name] ? linkItem.value : vm.valueMaxOb[item.name];
                        var dataItem = {};
                        if (!(vm.geoCoordMap[linkItem.source])) {
                            console.log('不存在经纬度的城市：', linkItem.source);
                            // hasCity = false;
                        } else if (!(vm.geoCoordMap[linkItem.target])) {
                            console.log('不存在经纬度的城市：', linkItem.target);
                            // hasCity = false;
                        } else {
                            dataItem.formName = linkItem.source;
                            dataItem.toName = linkItem.target;
                            dataItem.coords = [
                                vm.geoCoordMap[linkItem.source],
                                vm.geoCoordMap[linkItem.target]
                            ];
                            dataItem.value = linkItem.value;
                            chartLine.data.push(dataItem);
                        }
                    });

                    chartLine2.type = 'lines';
                    chartLine2.zlevel = 2;
                    chartLine2.effect = {
                        show: false,
                        period: 6,
                        trailLength: 0.9,
                        symbolSize: 0
                        // color: '#fff'
                    };
                    chartLine2.lineStyle = {
                        normal: {
                            width: 2,
                            curveness: 0.2
                            // color: myColor[index]
                        }
                    };
                    chartLine2.data = [];
                    item.links.forEach(function (linkItem) {
                        var dataItem = {};
                        if (!(vm.geoCoordMap[linkItem.source])) {
                            console.log('不存在经纬度的城市：', linkItem.source);
                        } else if (!(vm.geoCoordMap[linkItem.target])) {
                            console.log('不存在经纬度的城市：', linkItem.target);
                        } else {
                            dataItem.formName = linkItem.source;
                            dataItem.toName = linkItem.target;
                            dataItem.coords = [
                                vm.geoCoordMap[linkItem.source],
                                vm.geoCoordMap[linkItem.target]
                            ];
                            dataItem.value = linkItem.value;
                            chartLine2.data.push(dataItem);
                        }
                    });

                    chartEff.type = 'effectScatter';
                    chartEff.coordinateSystem = 'geo';
                    chartEff.zlevel = 2;
                    chartEff.rippleEffect = {
                        period: 4,
                        brushType: 'stroke',
                        scale: 6
                    };
                    // chartEff.symbol = 'pin';
                    // chartEff.symbolOffset = [0,'50%'];
                    chartEff.label = {
                        normal: {
                            show: false,
                            position: 'right',
                            formatter: '{b}'
                        }
                    };
                    chartEff.symbolSize = function (val) {
                        if (vm.styleConfig.isEnlarge) {
                            return val[2] > 100 ? 5 : 2.5;
                        }
                        return val[2] > 100 ? 2 : 1;
                    };
                    chartEff.itemStyle = {
                        normal: {
                            // color: myColor[index]
                        }
                    };
                    chartEff.data = [];
                    item.nodes.forEach(function (linkItem) {
                        var dataItem = {};
                        if (!(vm.geoCoordMap[linkItem.name])) {
                            console.log('不存在经纬度的城市：', linkItem.name);
                            hasCity = false;
                            return;
                        } else {
                            dataItem.name = linkItem.name;
                            dataItem.value = [];
                            dataItem.value[0] = vm.geoCoordMap[linkItem.name][0];
                            dataItem.value[1] = vm.geoCoordMap[linkItem.name][1];
                            dataItem.value.push(linkItem.value);
                            chartEff.data.push(dataItem);
                        }
                    });

                    newValue.push(chartLine);
                    newValue.push(chartLine2);
                    newValue.push(chartEff);
                });
                vm.seriesValue = newValue;
            },
            changeSelect: function (item) {
                var vm = this;
                console.log(item);
                vm.selectGeography = item.geography;
                vm.$emit('chartchange', {
                    chartName: 'echarts-qx-map',
                    eventName: 'changeGeo'
                }, item.back);
                $.get('./img/' + vm.selectGeography + '.json', function (chinaMapData) {
                    echarts.registerMap(vm.selectGeography, chinaMapData);
                    if (vm.selectGeography === 'hainan') {
                        var newOption = {
                            geo: {
                                map: vm.selectGeography,
                                zoom: 8,
                                center: [109.7891, 19.1581]
                            }
                        }
                        vm.chart.setOption(newOption);
                    } else {
                        var newOption = {
                            geo: {
                                map: vm.selectGeography,
                                zoom: null,
                                center: null
                            }
                        };
                        vm.chart.setOption(newOption);
                    }
                });
            }
        }
    });
});