/**
 * Created by root on 12/12/15.
 */

define([], function () {
    //获取地图需要加载的数据
    function getOptionForMap() {
        var opt = {
            backgroundColor: '#1b1b1b',//
            color: ['#e36d5a', '#85d27a', '#f7c65f', '#a992e2', '#b9b9b9', '#4ea5e0'],
            title: {
                show: true,
                text: '数据链',
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
                data: ['全国', '部中心'],
                selectedMode: 'single',
                selected: {
                    '全国': true,
                    '部中心': false,
                },
                textStyle: {
                    color: '#fff'
                }
            },
            toolbox: {
                show: false,
                orient: 'vertical',
                x: 'right',
                y: 'center',
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            dataRange: {
                show: true,
                min: 0,
                max: 3,
                x: 'right',
                y: 'top',
                calculable: true,
                color: ['#ff3333', 'orange', 'aqua', 'yellow'],
                textStyle: {
                    color: '#fff'
                }
            },
            series: [
                {
                    name: '全部',
                    type: 'map',
                    roam: false,
                    hoverable: true,
                    clickable: true,
                    mapType: 'china',
                    itemStyle: {
                        normal: {
                            borderColor: 'rgba(100,149,237,1)',
                            borderWidth: 0.5,
                            areaStyle: {
                                color: '#1b1b1b'
                            }
                        }
                    },
                    data: [],
                    markLine: {
                        smooth: true,
                        symbol: ['none', 'circle'],
                        symbolSize: 1,
                        itemStyle: {
                            normal: {
                                label: {show: false},
                                color: '#fff',
                                borderWidth: 1,
                                borderColor: 'rgba(30,144,255,0.5)'
                            }
                        },
                        data: [
                            [{name: '广州'}, {name: '汕头'}],
                            [{name: '广州'}, {name: '青岛'}],
                            [{name: '广州'}, {name: '济南'}],
                            [{name: '广州'}, {name: '天津'}],
                            [{name: '广州'}, {name: '太原'}],
                            [{name: '广州'}, {name: '乌鲁木齐'}],
                            [{name: '广州'}, {name: '温州'}],
                            [{name: '广州'}, {name: '武汉'}],
                            [{name: '广州'}, {name: '无锡'}],
                            [{name: '广州'}, {name: '厦门'}],
                            [{name: '广州'}, {name: '西宁'}],
                            [{name: '广州'}, {name: '徐州'}],
                            [{name: '广州'}, {name: '烟台'}],
                            [{name: '广州'}, {name: '盐城'}]
                        ],
                    },
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
                    }
                },
                {
                    name: '全国',
                    type: 'map',
                    roam: false,
                    hoverable: true,
                    clickable: true,
                    mapType: 'china',
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
                    markLine: {
                        smooth: true,
                        effect: {
                            show: true,
                            scaleSize: 1,
                            period: 30,
                            color: '#fff',
                            shadowBlur: 10
                        },
                        itemStyle: {
                            normal: {
                                label: {show: false},
                                borderWidth: 1,
                                lineStyle: {
                                    type: 'solid',
                                    shadowBlur: 10
                                }
                            },

                            emphasis: {
                                label: {show: false, position: 'top'}
                            }

                        },
                        data: [
                            //[{name:'乌鲁木齐'},{name:'乌鲁木齐'}],

                            //[{name: '包头'}, {name: '北京'}],
                            //[{name: '北京'}, {name: '北海'}],
                            //[{name: '北京'}, {name: '广州'}],
                            //[{name: '北京'}, {name: '郑州'}],
                            //[{name: '北京'}, {name: '长春'}],
                            //[{name: '北京'}, {name: '长治'}],
                            //[{name: '北京'}, {name: '重庆'}],
                            //[{name: '北京'}, {name: '长沙'}],
                            //[{name: '北京'}, {name: '成都'}],
                            //[{name: '北京'}, {name: '常州'}],
                            //[{name:'北京'},{name:'丹东'}],
                            //[{name:'北京'},{name:'大连'}],
                            //[{name:'北京'},{name:'东营'}],
                            //[{name:'北京'},{name:'延安'}],
                            //[{name:'北京'},{name:'福州'}],
                            //[{name:'北京'},{name:'海口'}],
                            //[{name:'北京'},{name:'呼和浩特'}],
                            //[{name:'北京'},{name:'合肥'}],
                            //[{name:'北京'},{name:'杭州'}],
                            //[{name:'北京'},{name:'哈尔滨'}],
                            //[{name:'北京'},{name:'舟山'}],
                            //[{name:'北京'},{name:'银川'}],
                            //[{name:'北京'},{name:'衢州'}],
                            //[{name:'北京'},{name:'南昌'}],
                            //[{name:'北京'},{name:'昆明'}],
                            //[{name:'北京'},{name:'贵阳'}],
                            //[{name:'北京'},{name:'兰州'}],
                            //[{name:'北京'},{name:'拉萨'}],
                            //[{name:'北京'},{name:'连云港'}],
                            //[{name:'北京'},{name:'临沂'}],
                            //[{name:'北京'},{name:'柳州'}],
                            //[{name:'北京'},{name:'宁波'}],
                            //[{name:'北京'},{name:'南京'}],
                            //[{name:'北京'},{name:'南宁'}],
                            //[{name:'北京'},{name:'南通'}],
                            //[{name:'北京'},{name:'上海'}],
                            //[{name:'北京'},{name:'沈阳'}],
                            //[{name:'北京'},{name:'西安'}],
                            //[{name:'北京'},{name:'汕头'}],
                            //[{name:'北京'},{name:'深圳'}],
                            //[{name:'北京'},{name:'青岛'}],
                            //[{name:'北京'},{name:'济南'}],
                            //[{name:'北京'},{name:'太原'}],
                            //[{name:'北京'},{name:'乌鲁木齐'}],
                            //[{name:'北京'},{name:'潍坊'}],
                            //[{name:'北京'},{name:'威海'}],
                            //[{name:'北京'},{name:'温州'}],
                            //[{name:'北京'},{name:'武汉'}],
                            //[{name:'北京'},{name:'无锡'}],
                            //[{name:'北京'},{name:'厦门'}],
                            //[{name:'北京'},{name:'西宁'}],
                            //[{name:'北京'},{name:'徐州'}],
                            //[{name:'北京'},{name:'烟台'}],
                            //[{name:'北京'},{name:'盐城'}],
                            //[{name:'北京'},{name:'珠海'}],
                            //[{name: '上海'}, {name: '包头'}],
                            //[{name: '上海'}, {name: '北海'}],
                            //[{name: '上海'}, {name: '广州'}],
                            //[{name: '上海'}, {name: '郑州'}],
                            //[{name: '上海'}, {name: '长春'}],
                            //[{name: '上海'}, {name: '重庆'}],
                            //[{name: '上海'}, {name: '长沙'}],
                            //[{name: '上海'}, {name: '成都'}],
                            //[{name: '上海'}, {name: '丹东'}],
                            //[{name: '上海'}, {name: '大连'}],
                            [{name: '上海', type: 'line', id: 1, value: 1}, {name: '拉萨'}],
                            //[{name:'上海'},{name:'拉萨'}],
                            //[{name:'上海'},{name:'连云港'}],
                            //[{name:'上海'},{name:'临沂'}],
                            //[{name:'上海'},{name:'柳州'}],
                            //[{name:'上海'},{name:'宁波'}],
                            //[{name:'上海'},{name:'南宁'}],
                            //[{name:'上海'},{name:'北京'}],
                            //[{name:'上海'},{name:'沈阳'}],
                            //[{name:'上海'},{name:'秦皇岛'}],
                            //[{name:'上海'},{name:'西安'}],
                            //[{name:'上海'},{name:'石家庄'}],
                            //[{name:'上海'},{name:'汕头'}],
                            //[{name:'上海'},{name:'深圳'}],
                            //[{name:'上海'},{name:'青岛'}],
                            //[{name:'上海'},{name:'济南'}],
                            //[{name:'上海'},{name:'天津'}],
                            //[{name:'上海'},{name:'太原'}],
                            //[{name:'上海'},{name:'乌鲁木齐'}],
                            //[{name:'上海'},{name:'潍坊'}],
                            //[{name:'上海'},{name:'威海'}],
                            //[{name:'上海'},{name:'温州'}],
                            //[{name:'上海'},{name:'武汉'}],
                            //[{name:'上海'},{name:'厦门'}],
                            //[{name:'上海'},{name:'西宁'}],
                            //[{name:'上海'},{name:'徐州'}],
                            //[{name:'上海'},{name:'烟台'}],
                            //[{name:'上海'},{name:'珠海'}],
                            [{name: '广州', type: 'line', id: 1, value: 1}, {name: '长春'}],
                            //[{name:'广州'},{name:'呼和浩特'}],
                            //[{name:'广州'},{name:'合肥'}],
                            //[{name:'广州'},{name:'杭州'}],
                            //[{name:'广州'},{name:'哈尔滨'}],
                            //[{name:'广州'},{name:'舟山'}],
                            //[{name:'广州'},{name:'银川'}],
                            //[{name:'广州'},{name:'南昌'}],
                            //[{name:'广州'},{name:'昆明'}],
                            //[{name:'广州'},{name:'贵阳'}],
                            //[{name:'广州'},{name:'兰州'}],
                            //[{name:'广州'},{name:'拉萨'}],
                            //[{name:'广州'},{name:'连云港'}],
                            //[{name:'广州'},{name:'临沂'}],
                            //[{name:'广州'},{name:'柳州'}],
                            //[{name:'广州'},{name:'宁波'}],
                            //[{name:'广州'},{name:'南京'}],
                            //[{name:'广州'},{name:'南宁'}],
                            //[{name:'广州'},{name:'南通'}],
                            //[{name:'广州'},{name:'北京'}],
                            //[{name:'广州'},{name:'上海'}],
                            //[{name:'广州'},{name:'沈阳'}],
                            //[{name:'广州'},{name:'西安'}],
                            //[{name:'广州'},{name:'石家庄'}],
                            //[{name:'广州'},{name:'汕头'}],
                            //[{name:'广州'},{name:'青岛'}],
                            //[{name:'广州'},{name:'济南'}],
                            //[{name:'广州'},{name:'天津'}],
                            //[{name:'广州'},{name:'太原'}],
                            //[{name:'广州'},{name:'乌鲁木齐'}],
                            //[{name:'广州'},{name:'温州'}],
                            //[{name:'广州'},{name:'武汉'}],
                            //[{name:'广州'},{name:'无锡'}],
                            //[{name:'广州'},{name:'厦门'}],
                            //[{name:'广州'},{name:'西宁'}],
                            //[{name:'广州'},{name:'徐州'}],
                            //[{name:'广州'},{name:'烟台'}],
                            //[{name:'广州'},{name:'盐城'}]
                        ],
                    },
                    markPoint: {
                        symbol: 'emptyCircle',
                        symbolSize: 5,
                        effect: {
                            show: true,
                            shadowBlur: 0
                        },
                        itemStyle: {
                            normal: {
                                label: {show: true}
                            },
                            emphasis: {
                                label: {
                                    show: false,
                                    position: 'top'
                                }
                            }
                        },
                        data: [
                            {name: '部中心', value: 0, type: 'city',},
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
                {
                    name: '部中心',
                    type: 'map',
                    mapType: 'china',
                    //animation: true,
                    //animationDuration: 13000,
                    itemStyle: {
                        normal: {
                            label: {show: false},
                            borderColor: 'rgba(100,149,237,1)',
                            borderWidth: 0.5,
                            areaStyle: {
                                color: '#1b1b1b'//'#1b1b1b'
                            }
                        }
                    },
                    data: [],
                    markLine: {
                        smooth: true,
                        effect: {
                            show: true,
                            scaleSize: 1,
                            period: 30,
                            color: '#fff',
                            shadowBlur: 10
                        },
                        itemStyle: {
                            normal: {
                                label: {show: false},
                                borderWidth: 1,
                                lineStyle: {
                                    type: 'solid',
                                    shadowBlur: 10
                                }
                            },

                            emphasis: {
                                label: {show: false, position: 'top'}
                            }

                        },
                        data: [
                            [{name: '上海', type: 'line', id: 1, value: 1}, {name: '部中心'}],
                            [{name: '广州', type: 'line', id: 2, value: 2}, {name: '部中心'}],
                            [{name: '大连', type: 'line', id: 3, value: 3}, {name: '部中心'}],
                            [{name: '南宁', type: 'line', id: 1, value: 1}, {name: '部中心'}],
                            [{name: '南昌', type: 'line', id: 2, value: 2}, {name: '部中心'}],
                            [{name: '拉萨', type: 'line', id: 3, value: 3}, {name: '部中心'}],
                            [{name: '长春', type: 'line', id: 1, value: 1}, {name: '部中心'}],
                            [{name: '包头', type: 'line', id: 2, value: 2}, {name: '部中心'}],
                            [{name: '重庆', type: 'line', id: 3, value: 3}, {name: '部中心'}]
                        ]
                    },
                    markPoint: {
                        symbol: 'emptyCircle',
                        symbolSize: 5,
                        //function (v) {
                        //return 10 + v / 10
                        //},
                        effect: {
                            show: true,
                            shadowBlur: 0
                        },
                        itemStyle: {
                            normal: {
                                label: {show: true}
                            },
                            emphasis: {
                                label: {position: 'top'}
                            }
                        },
                        data: [
                            {name: '部中心', value: 0, type: 'city',},
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
                {
                    name: '上海',
                    type: 'map',
                    mapType: 'china',
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
                    markLine: {
                        smooth: true,
                        effect: {
                            show: true,
                            scaleSize: 1,
                            period: 30,
                            color: '#fff',
                            shadowBlur: 10
                        },
                        itemStyle: {
                            normal: {
                                borderWidth: 1,
                                lineStyle: {
                                    type: 'solid',
                                    shadowBlur: 10
                                }
                            }
                        },
                        data: [
                            //[{name: '包头'}, {name: '上海', value: 95}],
                            //[{name: '上海'}, {name: '昆明', value: 90}],
                            //[{name: '上海'}, {name: '广州', value: 80}],
                            //[{name: '上海'}, {name: '郑州', value: 70}],
                            //[{name: '上海'}, {name: '长春', value: 60}],
                            //[{name: '上海'}, {name: '重庆', value: 50}],
                            //[{name: '上海'}, {name: '长沙', value: 40}],
                            //[{name: '上海'}, {name: '北京', value: 30}],
                            //[{name: '上海'}, {name: '丹东', value: 20}],
                            //[{name: '上海'}, {name: '大连', value: 10}]
                        ]
                    },
                    markPoint: {
                        symbol: 'emptyCircle',
                        symbolSize: function (v) {
                            return 10 + v / 10
                        },
                        effect: {
                            show: true,
                            shadowBlur: 0
                        },
                        itemStyle: {
                            normal: {
                                label: {show: false}
                            },
                            emphasis: {
                                label: {position: 'top'}
                            }
                        },
                        data: [
                            //{name: '包头', value: 95},
                            //{name: '昆明', value: 90},
                            //{name: '广州', value: 80},
                            //{name: '郑州', value: 70},
                            //{name: '长春', value: 60},
                            //{name: '重庆', value: 50},
                            //{name: '长沙', value: 40},
                            //{name: '北京', value: 30},
                            //{name: '丹东', value: 20},
                            //{name: '大连', value: 10}
                        ]
                    }
                },
                {
                    name: '广州',
                    type: 'map',
                    mapType: 'china',
                    itemStyle: {
                        normal: {
                            label: {show: true},
                            borderColor: 'rgba(100,149,237,1)',
                            borderWidth: 0.5,
                            areaStyle: {
                                color: '#fff'//'#1b1b1b'
                            }
                        }
                    },
                    data: [],
                    markLine: {
                        smooth: true,
                        effect: {
                            show: true,
                            scaleSize: 1,
                            period: 30,
                            color: '#fff',
                            shadowBlur: 10
                        },
                        itemStyle: {
                            normal: {
                                borderWidth: 1,
                                lineStyle: {
                                    type: 'solid',
                                    shadowBlur: 10
                                }
                            }
                        },
                        data: [
                            //[{name: '广州'}, {name: '福州', value: 95}],
                            //[{name: '广州'}, {name: '太原', value: 90}],
                            //[{name: '广州'}, {name: '长春', value: 80}],
                            //[{name: '广州'}, {name: '重庆', value: 70}],
                            //[{name: '广州'}, {name: '西安', value: 60}],
                            //[{name: '广州'}, {name: '成都', value: 50}],
                            //[{name: '广州'}, {name: '常州', value: 40}],
                            //[{name: '广州'}, {name: '北京', value: 30}],
                            //[{name: '广州'}, {name: '北海', value: 20}],
                            //[{name: '广州'}, {name: '海口', value: 10}]
                        ]
                    },
                    markPoint: {
                        symbol: 'emptyCircle',
                        symbolSize: function (v) {
                            return 10 + v / 10
                        },
                        effect: {
                            show: true,
                            shadowBlur: 0
                        },
                        itemStyle: {
                            normal: {
                                label: {show: false}
                            },
                            emphasis: {
                                label: {position: 'top'}
                            }
                        },
                        data: [
                            //{name: '福州', value: 95},
                            //{name: '太原', value: 90},
                            //{name: '长春', value: 80},
                            //{name: '重庆', value: 70},
                            //{name: '西安', value: 60},
                            //{name: '成都', value: 50},
                            //{name: '常州', value: 40},
                            //{name: '北京', value: 30},
                            //{name: '北海', value: 20},
                            //{name: '海口', value: 10}
                        ]
                    }
                }

            ],
        };

        return opt;
    }

    function getOptionForLink() {
        return option = {
            title: {
                show: false,
                text: '数据链传输速度',
                x: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            tooltip: {
                formatter: "{a} <br/>{b} : {c}Mb/s"
            },
            toolbox: {
                show: false,
                feature: {
                    mark: {show: true},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            series: [
                {
                    name: '传输速率',
                    type: 'gauge',
                    min: 0,
                    max: 5,
                    detail: {formatter: '{value}Mb/s'},
                    data: [{value: 2.93, name: '传输速率(Mb/s)'}]
                }
            ]
        };
    }

    function getOptionForDataTypes() {
        return option = {
            title: {
                x: 'center',
                text: '各个数据类型'
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
                    data: ['Line1', 'Bar', 'Scatter', 'K', 'Pie', 'Radar', 'Chord', 'Force', 'Map', 'Gauge', 'Funnel']

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
                            color: function (params) {

                                var colorList = [
                                    '#C1232B', '#B5C334', '#B5C334', '#B5C334', '#B5C334', '#C1232B', '#C1232B', '#C1232B', '#C1232B', '#C1232B', '#B5C334'
                                ];
                                return colorList[params.dataIndex]
                            },
                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{b}\n{c}'
                            }
                        }
                    },
                    data: [12, 21, 10, 4, 12, 5, 6, 5, 25, 23, 7],
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
                        data: [
                            //{xAxis:0, y: 320, name:'Line',state:'1',
                            //    symbolSize:10, symbol: 'image://../img/dm/add-64.png'
                            //},
                            //{xAxis:1, y: 320, name:'Bar',state:'2',
                            //    symbolSize:10, symbol: 'image://../img/dm/ok-64.png'},
                            //{xAxis:2, y: 320, name:'Scatter', symbolSize:10, symbol: 'image://../img/dm/ok-64.png'},
                            //{xAxis:3, y: 320, name:'K', symbolSize:10, symbol: 'image://../img/dm/add-64.png'},
                            //{xAxis:4, y: 320, name:'Pie', symbolSize:10, symbol: 'image://../img/dm/add-64.png'},
                            //{xAxis:5, y: 320, name:'Radar', symbolSize:10, symbol: 'image://../img/dm/ok-64.png'},
                            //{xAxis:6, y: 320, name:'Chord', symbolSize:10, symbol: 'image://../img/dm/ok-64.png'},
                            //{xAxis:7, y: 320, name:'Force', symbolSize:10, symbol: 'image://../img/dm/ok-64.png'},
                            //{xAxis:8, y: 320, name:'Map', symbolSize:10, symbol: 'image://../img/dm/ok-64.png'},
                            //{xAxis:9, y: 320, name:'Gauge', symbolSize:10, symbol: 'image://../img/dm/add-64.png'},
                            //{xAxis:10, y: 320, name:'Funnel', symbolSize:10, symbol: 'image://../img/dm/ok-64.png'},
                        ]
                    }
                }
            ]
        };
    }

    function getOptionForSystems() {
        return option = {
            title: {
                text: '各个系统数据量统计',
                x: 'center'
            },
            tooltip: {
                trigger: 'item',
                position: function (p) {
                    // 位置回调
                    // console.log && console.log(p);
                    return [p[0], p[1] - 100];
                },
                formatter: "{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                y: 'top',
                data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
            },
            calculable: true,
            series: [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', 225],
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        }
                    },
                    data: [
                        {value: 335, name: '直接访问'},
                        {value: 310, name: '邮件营销'},
                        {value: 234, name: '联盟广告'},
                        {value: 135, name: '视频广告'},
                        {value: 1548, name: '搜索引擎'}
                    ]
                }
            ]
        };
    }

    function getSysArray() {
        var sysArray = new Array();
        sysArray.push("923系统");
        sysArray.push("993系统");
        sysArray.push("电子围栏侦控系统");

        return sysArray;
    }

    return {
        //getAllConnection: function (mapOption,mapChart) {
        //    return getAllConnection(mapOption,mapChart);
        //},

        getOptionForMap: function () {
            return getOptionForMap();
        },

        getOptionForLink: function () {
            return getOptionForLink();
        },

        getOptionForDataTypes: function () {
            return getOptionForDataTypes();
        },

        getOptionForSystems: function () {
            return getOptionForSystems();
        },

        getSysArray: function () {
            return getSysArray();
        },
    }

});

