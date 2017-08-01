/**
 * Created by root on 3/15/16.
 */

define([], function () {
    function getColorList(params) {
        // build a color map as your need.
        //,'#FCCE10','#E87C25','#27727B',
        //    '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
        //    '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
        return colorList[params.dataIndex]
    }

    function initpagesize() {
        //设置页面元素大小
        var proportion = 0.65;

        var pieWidth = 350;
        var pieHeight = 290;
        var otherWidth = 120;
        var minWidth = 0;
        var minHeight = 600;
        var widthAll = $("#content")[0].offsetWidth;

        if (widthAll < 1100)
            proportion = 0.63;
        if (widthAll > 1300)
            proportion = 0.53;

        document.getElementById("echartmain").style.height = widthAll * (proportion + 0.06) + "px";
        //pieHeight = widthAll*proportion*0.4;

        $('.centerTip').css({
            width: widthAll - otherWidth > minWidth ? widthAll - otherWidth : minWidth,
            height: widthAll * proportion - 70 > minHeight ? widthAll * proportion - 70 : minHeight,
            left: otherWidth / 2,
            top: 30

        });

        pieHeight = (widthAll * proportion - 70 - 30 > minHeight ? widthAll * proportion - 70 - 30 : minHeight) / 2 - 10;
        document.getElementById("speedInfo").style.height = pieHeight + "px";
        document.getElementById("speedInfo").style.width =
            ((widthAll * proportion - 70 - 30) / 2 * 0.8 > 300 ? 300 : (widthAll * proportion - 70 - 30) / 2 * 0.8) - 10 + "px";
        document.getElementById("taskTable").style.height = pieHeight + "px";
        document.getElementById("taskTablePanel").style.height = pieHeight - 70 + "px";
        document.getElementById("linkInfoBody").style.height = pieHeight - 70 + "px";
        document.getElementById("loadtaskmanage").style.width = (widthAll - otherWidth > minWidth ? widthAll - otherWidth : minWidth) -
            ((widthAll * proportion - 70 - 30) / 2 * 0.8 > 300 ? 300 : (widthAll * proportion - 70 - 30) / 2 * 0.8) - 160 - 20 + "px";
        document.getElementById("dataTypeInfo").style.height =
            (widthAll * proportion - 70 > minHeight ? widthAll * proportion - 70 : minHeight) - pieHeight - 10 + "px";
        document.getElementById("dataInfo").style.height =
            (widthAll * proportion - 70 - 30 > minHeight ? widthAll * proportion - 70 - 30 : minHeight) - pieHeight - 10 - 70 - 30 + "px";
        document.getElementById("dataTypeInfo").style.width = widthAll - 210 - 90 - otherWidth + "px";

        return parseInt((widthAll - 210 - 90 - otherWidth) / 100);
    }

    function initdataTypeOption() {
        var dataTypeOption = {
            title: {
                x: 'center',
                text: ' 各个数据类型'
            },
            legend: {
                show: false,
                orient: 'vertical',
                x: 'right',
                y: 'center',
                data: ['已获取', '未获取'],
                selectedMode: 'single',
                selected: {
                    '已获取': true,
                    '未获取': true
                },
            },
            tooltip: {
                trigger: 'item'
            },
            toolbox: {
                show: false,
                feature: {
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            grid: {
                borderWidth: 0,
                y: 80,
                y2: 60
            },
            xAxis: [
                {
                    type: 'category',
                    show: false,
                    data: []
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    show: false
                }
            ],
            series: [
                {
                    name: '该数据类型的数据量：',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#33A499',//getColorList,
                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{b}\n{c}'
                            }
                        }
                    },
                    barMaxWidth: 80,
                    barWidth: 60,
                    barMinHeight: 30,
                    data: [],
                    markPoint: {
                        tooltip: {
                            show: false,
                            trigger: 'item',
                            backgroundColor: 'rgba(0,0,0,0)',
                            //formatter: function(params){
                            //    return '<img src="'
                            //        + params.data.symbol.replace('image://', '')
                            //        + '"/>';
                            //}
                        },
                        data: []
                    }
                }
            ]
        };
        return dataTypeOption;
    }

    var color = ['#e36d5a', '#85d27a', '#f7c65f', '#a992e2', '#b9b9b9', '#4ea5e0'];

    var testData = [
        {name: '天津', value: 0, type: 'city',},

        {name: '上海', value: 0, type: 'city',},
        {name: '南京', value: 0, type: 'city',},
        {name: '合肥', value: 0, type: 'city',},
        {name: '杭州', value: 0, type: 'city',},

        {name: '广州', value: 0, type: 'city',},
        {name: '福州', value: 0, type: 'city',},
        {name: '海口', value: 0, type: 'city',},

        {name: '乌鲁木齐', value: 0, type: 'city',},
        {name: '西宁', value: 0, type: 'city',},
        {name: '拉萨', value: 0, type: 'city',},
        {name: '兰州', value: 0, type: 'city',},
        {name: '银川', value: 0, type: 'city',},
        {name: '西安', value: 0, type: 'city',},

        {name: '长春', value: 0, type: 'city',},
        {name: '哈尔滨', value: 0, type: 'city',},
        {name: '沈阳', value: 0, type: 'city',},
        {name: '呼和浩特', value: 0, type: 'city',},

        {name: '重庆', value: 0, type: 'city',},
        {name: '成都', value: 0, type: 'city',},
        {name: '贵阳', value: 0, type: 'city',},
        {name: '昆明', value: 0, type: 'city',},
        {name: '南宁', value: 0, type: 'city',},

        {name: '南昌', value: 0, type: 'city',},
        {name: '武汉', value: 0, type: 'city',},
        {name: '长沙', value: 0, type: 'city',},

        {name: '济南', value: 0, type: 'city',},
        {name: '石家庄', value: 0, type: 'city',},
        {name: '太原', value: 0, type: 'city',},
        {name: '郑州', value: 0, type: 'city',},
    ]

    var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';


    function initmapOption() {
        var mapOption = {
            backgroundColor: '#1b1b1b',
            title: {
                show: true,
                text: '数据链管理',
                x: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}'
            },
            legend: {
                orient: 'vertical',
                x: 'right',
                y: 'center',
                //data: ['全部', '未建立'],
                selectedMode: 'single',
                //selected: {
                //    //'全部': false,
                //    '全部': true,
                //    '未建立': false,
                //},
                textStyle: {
                    color: '#fff'
                }
            },
            //dataRange: {
            //    show: true,
            //    min: 0,
            //    max: 3,
            //    x: 'right',
            //    y: 'top',
            //    calculable: true,
            //    color: ['#ff3333', 'aqua', 'lime', 'orange'],
            //    textStyle: {
            //        color: '#fff'
            //    }
            //},

            geo: {
                map: 'china',
                label: {
                    emphasis: {
                        show: true
                    }
                },
                //roam: true,
                itemStyle: {
                    normal: {
                        areaColor: '#1b1b1b',
                        borderColor: 'rgba(100,149,237,1)'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: [
                //{
                //    name: '未',
                //    type: 'map',
                //    roam: false,
                //    hoverable: true,
                //    clickable: true,
                //    mapType: 'china',
                //    itemStyle: {
                //        normal: {
                //            label: {show: true},
                //            borderColor: 'rgba(100,149,237,1)',
                //            borderWidth: 0.5,
                //            areaStyle: {
                //                color: '#1b1b1b'
                //            }
                //        }
                //    },
                //    data: [],
                //    markLine: {
                //        smooth: true,
                //        symbol: ['none', 'circle'],
                //        symbolSize: 2,
                //        itemStyle: {
                //            normal: {
                //                label: {show: false},
                //                color: '#fff',
                //                borderWidth: 1,
                //                borderColor: 'rgba(30,144,255,0.5)',
                //                //lineStyle: {
                //                //                type: function (v) {
                //                //                    alert(v);
                //                //                    console.log("v", v);
                //                //                    if(v>10)
                //                //                        return 'solid';
                //                //                    else
                //                //                        return 'dashed';
                //                //                },
                //                //                shadowBlur: 10
                //                //            }
                //            }
                //        },
                //        data: [],
                //
                //        //effect: {
                //        //    show: true,
                //        //    scaleSize: 1,
                //        //    period: 30,
                //        //    color: '#fff',
                //        //    shadowBlur: 10
                //        //},
                //        //itemStyle: {
                //        //    normal: {
                //        //        label: {show: false},
                //        //        borderWidth: 1,
                //        //        lineStyle: {
                //        //            type: 'solid',
                //        //            shadowBlur: 10
                //        //        }
                //        //    },
                //        //
                //        //    emphasis: {
                //        //        label: {show: false, position: 'top'}
                //        //    }
                //        //
                //        //},
                //        //data: [],
                //    },
                //    markPoint: {
                //        symbol: 'emptyCircle',
                //        symbolSize: 8,
                //        effect: {
                //            show: true,
                //            shadowBlur: 0
                //        },
                //        itemStyle: {
                //            normal: {
                //                label: {show: true}
                //            },
                //            emphasis: {
                //                label: {
                //                    show: false,
                //                    position: 'top'
                //                }
                //            }
                //        },
                //        data: []
                //    },
                //    geoCoord: {
                //        '部中心': [116.4551, 40.2539],
                //        '上海': [121.4648, 31.2891],
                //        '东莞': [113.8953, 22.901],
                //        '东营': [118.7073, 37.5513],
                //        '中山': [113.4229, 22.478],
                //        '临汾': [111.4783, 36.1615],
                //        '临沂': [118.3118, 35.2936],
                //        '丹东': [124.541, 40.4242],
                //        '丽水': [119.5642, 28.1854],
                //        '乌鲁木齐': [87.9236, 43.5883],
                //        '佛山': [112.8955, 23.1097],
                //        '保定': [115.0488, 39.0948],
                //        '兰州': [103.5901, 36.3043],
                //        '包头': [110.3467, 41.4899],
                //        '北京': [116.4551, 40.2539],
                //        '北海': [109.314, 21.6211],
                //        '南京': [118.8062, 31.9208],
                //        '南宁': [108.479, 23.1152],
                //        '南昌': [116.0046, 28.6633],
                //        '南通': [121.1023, 32.1625],
                //        '厦门': [118.1689, 24.6478],
                //        '台州': [121.1353, 28.6688],
                //        '合肥': [117.29, 32.0581],
                //        '呼和浩特': [111.4124, 40.4901],
                //        '咸阳': [108.4131, 34.8706],
                //        '哈尔滨': [127.9688, 45.368],
                //        '唐山': [118.4766, 39.6826],
                //        '嘉兴': [120.9155, 30.6354],
                //        '大同': [113.7854, 39.8035],
                //        '大连': [122.2229, 39.4409],
                //        '天津': [117.4219, 39.4189],
                //        '太原': [112.3352, 37.9413],
                //        '威海': [121.9482, 37.1393],
                //        '宁波': [121.5967, 29.6466],
                //        '宝鸡': [107.1826, 34.3433],
                //        '宿迁': [118.5535, 33.7775],
                //        '常州': [119.4543, 31.5582],
                //        '广州': [113.5107, 23.2196],
                //        '廊坊': [116.521, 39.0509],
                //        '延安': [109.1052, 36.4252],
                //        '张家口': [115.1477, 40.8527],
                //        '徐州': [117.5208, 34.3268],
                //        '德州': [116.6858, 37.2107],
                //        '惠州': [114.6204, 23.1647],
                //        '成都': [103.9526, 30.7617],
                //        '扬州': [119.4653, 32.8162],
                //        '承德': [117.5757, 41.4075],
                //        '拉萨': [91.1865, 30.1465],
                //        '无锡': [120.3442, 31.5527],
                //        '日照': [119.2786, 35.5023],
                //        '昆明': [102.9199, 25.4663],
                //        '杭州': [119.5313, 29.8773],
                //        '枣庄': [117.323, 34.8926],
                //        '柳州': [109.3799, 24.9774],
                //        '株洲': [113.5327, 27.0319],
                //        '武汉': [114.3896, 30.6628],
                //        '汕头': [117.1692, 23.3405],
                //        '江门': [112.6318, 22.1484],
                //        '沈阳': [123.1238, 42.1216],
                //        '沧州': [116.8286, 38.2104],
                //        '河源': [114.917, 23.9722],
                //        '泉州': [118.3228, 25.1147],
                //        '泰安': [117.0264, 36.0516],
                //        '泰州': [120.0586, 32.5525],
                //        '济南': [117.1582, 36.8701],
                //        '济宁': [116.8286, 35.3375],
                //        '海口': [110.3893, 19.8516],
                //        '淄博': [118.0371, 36.6064],
                //        '淮安': [118.927, 33.4039],
                //        '深圳': [114.5435, 22.5439],
                //        '清远': [112.9175, 24.3292],
                //        '温州': [120.498, 27.8119],
                //        '渭南': [109.7864, 35.0299],
                //        '湖州': [119.8608, 30.7782],
                //        '湘潭': [112.5439, 27.7075],
                //        '滨州': [117.8174, 37.4963],
                //        '潍坊': [119.0918, 36.524],
                //        '烟台': [120.7397, 37.5128],
                //        '玉溪': [101.9312, 23.8898],
                //        '珠海': [113.7305, 22.1155],
                //        '盐城': [120.2234, 33.5577],
                //        '盘锦': [121.9482, 41.0449],
                //        '石家庄': [114.4995, 38.1006],
                //        '福州': [119.4543, 25.9222],
                //        '秦皇岛': [119.2126, 40.0232],
                //        '绍兴': [120.564, 29.7565],
                //        '聊城': [115.9167, 36.4032],
                //        '肇庆': [112.1265, 23.5822],
                //        '舟山': [122.2559, 30.2234],
                //        '苏州': [120.6519, 31.3989],
                //        '莱芜': [117.6526, 36.2714],
                //        '菏泽': [115.6201, 35.2057],
                //        '营口': [122.4316, 40.4297],
                //        '葫芦岛': [120.1575, 40.578],
                //        '衡水': [115.8838, 37.7161],
                //        '衢州': [118.6853, 28.8666],
                //        '西宁': [101.4038, 36.8207],
                //        '西安': [109.1162, 34.2004],
                //        '贵阳': [106.6992, 26.7682],
                //        '连云港': [119.1248, 34.552],
                //        '邢台': [114.8071, 37.2821],
                //        '邯郸': [114.4775, 36.535],
                //        '郑州': [113.4668, 34.6234],
                //        '鄂尔多斯': [108.9734, 39.2487],
                //        '重庆': [107.7539, 30.1904],
                //        '金华': [120.0037, 29.1028],
                //        '铜川': [109.0393, 35.1947],
                //        '银川': [106.3586, 38.1775],
                //        '镇江': [119.4763, 31.9702],
                //        '长春': [125.8154, 44.2584],
                //        '长沙': [113.0823, 28.2568],
                //        '长治': [112.8625, 36.4746],
                //        '阳泉': [113.4778, 38.0951],
                //        '青岛': [120.4651, 36.3373],
                //        '韶关': [113.7964, 24.7028]
                //    }
                //},
                {
                    name: '全部',
                    type: 'map',
                    //backgroundColor: '#1b1b1b',
                    //zlevel: 1,
                    roam: false,
                    hoverable: true,
                    clickable: true,
                    mapType: 'china',
                    effect: {
                        show: true,
                        period: 6,
                        trailLength: 0.7,
                        color: '#fff',
                        symbolSize: 3
                    },
                    effect: {
                        show: true,
                        period: 6,
                        trailLength: 0.7,
                        color: '#fff',
                        symbolSize: 3
                    },
                    lineStyle: {
                        normal: {
                            color: color[1],
                            width: 0,
                            curveness: 0.2
                        }
                    },
                    itemStyle: {
                        normal: {
                            label: {show: true},
                            borderColor: 'rgba(100,149,237,1)',
                            borderWidth: 0.5,
                            areaStyle: {
                                color: '#1b1b1b'//'#1b1b1b'
                            }
                        }
                    },
                    data: [],
                    //markPoint: {
                    //    symbol: 'emptyCircle',
                    //    symbolSize: 8,
                    //    effect: {
                    //        show: true,
                    //        shadowBlur: 0
                    //    },
                    //    itemStyle: {
                    //        normal: {
                    //            label: {show: true}
                    //        },
                    //        emphasis: {
                    //            label: {
                    //                show: false,
                    //                position: 'top'
                    //            }
                    //        }
                    //    },
                    //    data: []
                    //},

                    geoCoord: {
                        '部中心': [116.4551, 40.2539],
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
                        '韶关': [113.7964, 24.7028]
                    },

                    //markLine: {
                    //    smooth: true,
                    //    effect: {
                    //        show: true,
                    //        scaleSize: 1,
                    //        period: 30,
                    //        color: '#fff',
                    //        shadowBlur: 10
                    //    },
                    //    itemStyle: {
                    //        normal: {
                    //            label: {show: false},
                    //            borderWidth: 1,
                    //            lineStyle: {
                    //                type: 'solid',
                    //                shadowBlur: 10
                    //            }
                    //        },
                    //
                    //        emphasis: {
                    //            label: {show: false, position: 'top'}
                    //        }
                    //
                    //    },
                    //    data: [],
                    //},
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 8,
                        effect: {
                            show: true,
                            //shadowBlur: 0

                            symbol: 'circle',
                            symbolSize: 8,
                            color: 'orange'
                        },
                        itemStyle: {
                            normal: {
                                label: {show: true}
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    position: 'top'
                                }
                            }
                        },
                        data: [
                            {name: '部中心', value: 3, type: 'city',},
                            {name: '天津', value: 0, type: 'city',},

                            {name: '上海', value: 0, type: 'city',},
                            {name: '南京', value: 0, type: 'city',},
                            {name: '合肥', value: 0, type: 'city',},
                            {name: '杭州', value: 0, type: 'city',},

                            {name: '广州', value: 0, type: 'city',},
                            {name: '福州', value: 0, type: 'city',},
                            {name: '海口', value: 0, type: 'city',},

                            {name: '乌鲁木齐', value: 0, type: 'city',},
                            {name: '西宁', value: 0, type: 'city',},
                            {name: '拉萨', value: 0, type: 'city',},
                            {name: '兰州', value: 0, type: 'city',},
                            {name: '银川', value: 0, type: 'city',},
                            {name: '西安', value: 0, type: 'city',},

                            {name: '长春', value: 0, type: 'city',},
                            {name: '哈尔滨', value: 0, type: 'city',},
                            {name: '沈阳', value: 0, type: 'city',},
                            {name: '呼和浩特', value: 0, type: 'city',},

                            {name: '重庆', value: 0, type: 'city',},
                            {name: '成都', value: 0, type: 'city',},
                            {name: '贵阳', value: 0, type: 'city',},
                            {name: '昆明', value: 0, type: 'city',},
                            {name: '南宁', value: 0, type: 'city',},

                            {name: '南昌', value: 0, type: 'city',},
                            {name: '武汉', value: 0, type: 'city',},
                            {name: '长沙', value: 0, type: 'city',},

                            {name: '济南', value: 0, type: 'city',},
                            {name: '石家庄', value: 0, type: 'city',},
                            {name: '太原', value: 0, type: 'city',},
                            {name: '郑州', value: 0, type: 'city',},
                        ]
                    }
                },
                //{
                //    name: '未建立',
                //    type: 'map',
                //    mapType: 'china',
                //    //animation: true,
                //    //animationDuration: 13000,
                //    itemStyle: {
                //        normal: {
                //            label: {show: false},
                //            borderColor: 'rgba(100,149,237,1)',
                //            borderWidth: 0.5,
                //            areaStyle: {
                //                color: '#1b1b1b'//'#1b1b1b'
                //            }
                //        }
                //    },
                //    data: [],
                //    markLine: {
                //        smooth: true,
                //        effect: {
                //            show: true,
                //            scaleSize: 1,
                //            period: 30,
                //            color: '#fff',
                //            shadowBlur: 10
                //        },
                //        itemStyle: {
                //            normal: {
                //                label: {show: false},
                //                borderWidth: 1,
                //                lineStyle: {
                //                    type: 'solid',
                //                    shadowBlur: 10
                //                }
                //            },
                //
                //            emphasis: {
                //                label: {show: false, position: 'top'}
                //            }
                //
                //        },
                //        data: []
                //    },
                //    markPoint: {
                //        symbol: 'emptyCircle',
                //        symbolSize: 10,
                //        //function (v) {
                //        //return 10 + v / 10
                //        //},
                //        effect: {
                //            show: true,
                //            shadowBlur: 0
                //        },
                //        itemStyle: {
                //            normal: {
                //                label: {show: true}
                //            },
                //            emphasis: {
                //                label: {position: 'top'}
                //            }
                //        },
                //        data: [
                //            {name: '部中心', value: 3, type: 'city',},
                //            //    {name: '天津', value: 0, type: 'city',},
                //            //
                //            //    {name: '上海', value: 0, type: 'city',},
                //            //    {name: '南京', value: 0, type: 'city',},
                //            //    {name: '合肥', value: 0, type: 'city',},
                //            //    {name: '杭州', value: 0, type: 'city',},
                //            //
                //            //    {name: '广州', value: 0, type: 'city',},
                //            //    {name: '福州', value: 0, type: 'city',},
                //            //    {name: '海口', value: 0, type: 'city',},
                //            //
                //            //    {name: '乌鲁木齐', value: 0, type: 'city',},
                //            //    {name: '西宁', value: 0, type: 'city',},
                //            //    {name: '拉萨', value: 0, type: 'city',},
                //            //    {name: '兰州', value: 0, type: 'city',},
                //            //    {name: '银川', value: 0, type: 'city',},
                //            //    {name: '西安', value: 0, type: 'city',},
                //            //
                //            //    {name: '长春', value: 0, type: 'city',},
                //            //    {name: '哈尔滨', value: 0, type: 'city',},
                //            //    {name: '沈阳', value: 0, type: 'city',},
                //            //    {name: '呼和浩特', value: 0, type: 'city',},
                //            //
                //            //    {name: '重庆', value: 0, type: 'city',},
                //            //    {name: '成都', value: 0, type: 'city',},
                //            //    {name: '贵阳', value: 0, type: 'city',},
                //            //    {name: '昆明', value: 0, type: 'city',},
                //            //    {name: '南宁', value: 0, type: 'city',},
                //            //
                //            //    {name: '南昌', value: 0, type: 'city',},
                //            //    {name: '武汉', value: 0, type: 'city',},
                //            //    {name: '长沙', value: 0, type: 'city',},
                //            //
                //            //    {name: '济南', value: 0, type: 'city',},
                //            //    {name: '石家庄', value: 0, type: 'city',},
                //            //    {name: '太原', value: 0, type: 'city',},
                //            //    {name: '郑州', value: 0, type: 'city',},
                //        ]
                //    }
                //}
            ],
        };

        option = {
            scale: true,
            backgroundColor: '#1b1b1b',
            top: 'top',
            title: {
                text: '数据链管理',
                top: 'top',
                left: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            roam: false,
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                top: 'middle',
                left: 'right',
                data: ['全部', '已链接', '已断开'],
                icon: 'roundRect',
                textStyle: {
                    color: '#fff'
                },
                selectedMode: 'single'
            },
            geo: {
                map: 'china',
                label: {
                    normal: {
                        show: true,
                        textStyle: {
                            color: '#aaa'
                        },
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontWeight: 'bolder',
                            color: 'blue'
                        },
                    }
                },
                scale: true,
                //roam: false,
                itemStyle: {
                    normal: {
                        areaColor: '#1b1b1b',
                        borderColor: 'orange',
                        borderWidth: 0.5,
                        //shadowColor:'#fff',
                        //shadowOffsetX: 1,
                        //shadowOffsetY: 1,
                    },
                    //emphasis: {
                    //    areaColor: 'orange'
                    //}
                }
            },
            series: []
        };
        return option;
    }

    function initCenterInfoArray() {
        var centerInfoArray = new Array();
        centerInfoArray[100000] = '部中心';
        centerInfoArray[110000] = '北京';
        centerInfoArray[120000] = '天津';
        centerInfoArray[130000] = '河北';
        centerInfoArray[140000] = '山西';
        centerInfoArray[150000] = '内蒙古';

        centerInfoArray[210000] = '辽宁';
        centerInfoArray[220000] = '吉林';
        centerInfoArray[230000] = '黑龙江';

        centerInfoArray[310000] = '上海';
        centerInfoArray[320000] = '江苏';
        centerInfoArray[330000] = '浙江';
        centerInfoArray[340000] = '安徽';
        centerInfoArray[350000] = '福建';
        centerInfoArray[360000] = '江西';
        centerInfoArray[370000] = '山东';

        centerInfoArray[410000] = '河南';
        centerInfoArray[420000] = '湖北';
        centerInfoArray[430000] = '湖南';
        centerInfoArray[440000] = '广东';
        centerInfoArray[450000] = '广西';
        centerInfoArray[460000] = '海南';

        centerInfoArray[500000] = '重庆';
        centerInfoArray[510000] = '四川';
        centerInfoArray[520000] = '贵州';
        centerInfoArray[530000] = '云南';
        centerInfoArray[540000] = '西藏';

        centerInfoArray[610000] = '陕西';
        centerInfoArray[620000] = '甘肃';
        centerInfoArray[630000] = '青海';
        centerInfoArray[640000] = '宁夏';
        centerInfoArray[650000] = '新疆';
        return centerInfoArray;
    }

    function initnameCodeDic() {
        var nameCodeDic = new Array();

        nameCodeDic['部中心'] = 100000;
        nameCodeDic['北京'] = 110000;
        nameCodeDic['天津'] = 120000;
        nameCodeDic['河北'] = 130000;
        nameCodeDic['山西'] = 140000;
        nameCodeDic['内蒙古'] = 150000;

        nameCodeDic['辽宁'] = 210000;
        nameCodeDic['吉林'] = 220000;
        nameCodeDic['黑龙江'] = 230000;

        nameCodeDic['上海'] = 310000;
        nameCodeDic['江苏'] = 320000;
        nameCodeDic['浙江'] = 330000;
        nameCodeDic['安徽'] = 340000;
        nameCodeDic['福建'] = 350000;
        nameCodeDic['江西'] = 360000;
        nameCodeDic['山东'] = 370000;

        nameCodeDic['河南'] = 410000;
        nameCodeDic['湖北'] = 420000;
        nameCodeDic['湖南'] = 430000;
        nameCodeDic['广东'] = 440000;
        nameCodeDic['广西'] = 450000;
        nameCodeDic['海南'] = 460000;

        nameCodeDic['重庆'] = 500000;
        nameCodeDic['四川'] = 510000;
        nameCodeDic['贵州'] = 520000;
        nameCodeDic['云南'] = 530000;
        nameCodeDic['西藏'] = 540000;

        nameCodeDic['陕西'] = 610000;
        nameCodeDic['甘肃'] = 620000;
        nameCodeDic['青海'] = 630000;
        nameCodeDic['宁夏'] = 640000;
        nameCodeDic['新疆'] = 650000;

        return nameCodeDic;
    }

    function initcenterCityDic() {
        var centerCityDic = new Array();

        centerCityDic['部中心'] = '部中心';
        centerCityDic['北京'] = '北京';
        centerCityDic['天津'] = '天津';
        centerCityDic['河北'] = '石家庄';
        centerCityDic['山西'] = '太原';
        centerCityDic['内蒙古'] = '呼和浩特';

        centerCityDic['辽宁'] = '沈阳';
        centerCityDic['吉林'] = '长春';
        centerCityDic['黑龙江'] = '哈尔滨';

        centerCityDic['上海'] = '上海';
        centerCityDic['江苏'] = '南京';
        centerCityDic['浙江'] = '杭州';
        centerCityDic['安徽'] = '合肥';
        centerCityDic['福建'] = '福州';
        centerCityDic['江西'] = '南昌';
        centerCityDic['山东'] = '济南';

        centerCityDic['河南'] = '郑州';
        centerCityDic['湖北'] = '武汉';
        centerCityDic['湖南'] = '长沙';
        centerCityDic['广东'] = '广州';
        centerCityDic['广西'] = '南宁';
        centerCityDic['海南'] = '海口';

        centerCityDic['重庆'] = '重庆';
        centerCityDic['四川'] = '成都';
        centerCityDic['贵州'] = '贵阳';
        centerCityDic['云南'] = '昆明';
        centerCityDic['西藏'] = '拉萨';

        centerCityDic['陕西'] = '西安';
        centerCityDic['甘肃'] = '兰州';
        centerCityDic['青海'] = '西宁';
        centerCityDic['宁夏'] = '银川';
        centerCityDic['新疆'] = '乌鲁木齐';

        return centerCityDic;
    }

    function initcityCenterDic() {
        var cityCenterDic = new Array();

        cityCenterDic['部中心'] = '部中心';
        cityCenterDic['北京'] = '北京';
        cityCenterDic['天津'] = '天津';
        cityCenterDic['石家庄'] = '河北';
        cityCenterDic['太原'] = '山西';
        cityCenterDic['呼和浩特'] = '内蒙古';

        cityCenterDic['沈阳'] = '辽宁';
        cityCenterDic['长春'] = '吉林';
        cityCenterDic['哈尔滨'] = '黑龙江';

        cityCenterDic['上海'] = '上海';
        cityCenterDic['南京'] = '江苏';
        cityCenterDic['浙江'] = '杭州';
        cityCenterDic['合肥'] = '安徽';
        cityCenterDic['福州'] = '福建';
        cityCenterDic['南昌'] = '江西';
        cityCenterDic['济南'] = '山东';

        cityCenterDic['郑州'] = '河南';
        cityCenterDic['武汉'] = '湖北';
        cityCenterDic['长沙'] = '湖南';
        cityCenterDic['广州'] = '广东';
        cityCenterDic['南宁'] = '广西';
        cityCenterDic['海口'] = '海南';

        cityCenterDic['重庆'] = '重庆';
        cityCenterDic['成都'] = '四川';
        cityCenterDic['贵阳'] = '贵州';
        cityCenterDic['昆明'] = '云南';
        cityCenterDic['拉萨'] = '西藏';

        cityCenterDic['西安'] = '陕西';
        cityCenterDic['兰州'] = '甘肃';
        cityCenterDic['西宁'] = '青海';
        cityCenterDic['银川'] = '宁夏';
        cityCenterDic['乌鲁木齐'] = '新疆';

        return cityCenterDic;
    }

    return {
        initpagesize: initpagesize,
        initdataTypeOption: initdataTypeOption,
        initmapOption: initmapOption,
        initCenterInfoArray: initCenterInfoArray,
        initnameCodeDic: initnameCodeDic,
        initcenterCityDic: initcenterCityDic,
        initcityCenterDic: initcityCenterDic
    }

});