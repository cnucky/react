require([
    "../../../config",
    "../lib/vue/vue",
    "../lib/vue/vue-grid-layout.min",
    "../module/TaiShi_WeiXie_Gis",
    "../module/dlg",
    "../module/echartsBarLine",
    "../module/echartsGraph",
    "../module/echartsPie",
    "../module/echartsQxMap",
    "../module/echartsRadar",
    "../module/taishiTable",
    "../module/WxLine"
], function (config, Vue, VueGridLayout, gis) {
    var dlg;
    var showbox = function (html) {
        if (dlg === undefined) {
            dlg = new Vue({
                el: '#mydlg',
                data: {
                    dlgshow: true,
                    content: html
                },
                methods: {
                    close: function () {
                        dlg.dlgshow = false;
                    }
                }
            });
        } else {
            dlg.content = html;
            dlg.dlgshow = true;
        }
    }

    // 人物流表格身份证点击展开人立方
    $("#sccond-dlg-close").click(function () {
        $("#second-dlg").css("visibility", "hidden");
    });

    var MaxColumn = 100,
        RowHeight = 10,
        RowGap = 0,
        ColGap = 0,
        ComponentVerMargin = 50,
        ComponentHorMargin = 30;

    var mapControl;
    var chartNames = ["threat_indicator", "vipcountry_item", "area_area_item", "region_item_line", "target_item", "region_item_list"];

    var currentTask;
    var vipcountries, vipregions, threat_series, centercodes, legendDic = {};

    var qxCurrentLevel = 'province';

    var initDatas = {
        "threat_indicator": {
            "x": 1,
            "y": 1,
            "w": 20,
            "h": 33,
            "i": "威胁指数",
            "isEnlarge": false,
            "fetch": function (el) {
                var items = [],
                    items2 = [],
                    items3 = [];
                threat_series.forEach(function (ele) {
                    items3.push(ele.chn);
                });
                this.legend.forEach(function (item) {
                    items.push(item.eng);
                    items2.push(item.chn);
                    legendDic["index_activity_threat_radar" + "_" + item.eng] = item.chn;
                }, this);
                invokeService("/dapservices/getstatisticresult", {
                    "taskType": "city",
                    "subRpTasks": [{
                        "subTypeName": "index_activity_threat_radar",
                        "param": {
                            "task_id": currentTask.id,
                            "time": getTime(),
                            "series": items3,
                            "item": items
                        }
                    }]
                }, function (data) {
                    var dataConfig = {
                        columnTitle: [],
                        rowTitle: [],
                        content: []
                    };
                    data["index_activity_threat_radar"].indicator.forEach(function (value) {
                        dataConfig.columnTitle.push({
                            "value": legendDic["index_activity_threat_radar" + "_" + value.text],
                            "max": value.max
                        });
                    });
                    data["index_activity_threat_radar"].data.forEach(function (value) {
                        dataConfig.rowTitle.push({
                            "name": value.name
                        });
                        dataConfig.content.push(value.value);
                    });

                    el.dataConfig = dataConfig;
                });
            }
        },
        "vipcountry_item": {
            "x": 1,
            "y": 35,
            "w": 20,
            "h": 33,
            "i": "重点地区通联/人员进出",
            "isEnlarge": false,
            fetch: function (el) {
                var dates = getTimeRange();
                var items = [];
                this.legend.forEach(function (item) {
                    items.push(item.eng);
                    legendDic["index_activity_vipcountry_pie" + "_" + item.eng] = item.chn;
                }, this);
                invokeService("/dapservices/getstatisticresult", {
                    "taskType": "city",
                    "subRpTasks": [{
                        "subTypeName": "index_activity_vipcountry_pie",
                        "param": {
                            "task_id": currentTask.id,
                            "start_time": dates.start_time,
                            "end_time": dates.end_time,
                            "vip_country": vipcountries,
                            "item": items
                        }
                    }]
                }, function (data) {
                    var dataConfig = [];
                    var index = 0;
                    data["index_activity_vipcountry_pie"].options.forEach(function (element) {
                        var conf = {};
                        conf.value = data["index_activity_vipcountry_pie"].timeline.data[index].split(' ')[0];
                        conf.id = conf.value;
                        conf.data = [];
                        element.series.forEach(function (serie) {
                            conf.data.push({
                                value: serie.data,
                                name: legendDic["index_activity_vipcountry_pie" + "_" + serie.name]
                            });
                        });

                        index++;
                        dataConfig.push(conf);
                    });

                    el.dataConfig = dataConfig;
                });
            }
        },
        "map": {
            "x": 22,
            "y": 5,
            "w": 48,
            "h": 63,
            "i": "态势地图",
            "isEnlarge": true,
            fetch: function (el) {}
        },
        "area_area_item": {
            "x": 71,
            "y": 1,
            "w": 28,
            "h": 33,
            "i": "全球物流人流态势",
            "isEnlarge": false,
            "fetch": function (el, type) {
                var items = [];
                this.legend.forEach(function (item) {
                    items.push(item.eng);
                    legendDic["index_activity_area_area_map" + "_" + item.eng] = item.chn;
                    legendDic[item.chn] = item.eng;
                }, this);
                var tp = (type === undefined ? "province" : type);
                invokeService("/dapservices/getstatisticresult", {
                    "taskType": "city",
                    "subRpTasks": [{
                        "subTypeName": "index_activity_area_area_map",
                        "param": {
                            "task_id": currentTask.id,
                            "type": tp,
                            "time": getTime(),
                            "to": tp === 'province' ? currentTask.info.province : currentTask.info.city,
                            "item": items
                        }
                    }]
                }, function (data) {
                    data["index_activity_area_area_map"].series.forEach(function (element) {
                        element.name = legendDic["index_activity_area_area_map" + "_" + element.name];
                        element.nodes = element.markPoint.data;
                        element.links = [];
                        element.markLine.data.forEach(function (line) {
                            if (line[0].name !== line[1].name)
                                element.links.push({
                                    source: line[0].name,
                                    target: line[1].name,
                                    value: line[1].value
                                });
                        });
                    });

                    el.dataConfig = {
                        "items": data["index_activity_area_area_map"].series
                    };
                });
                el.controllerConfig.geographies[1].text = currentTask.info.province;
                el.controllerConfig.geographies[1].geography = currentTask.info.province_key;
                el.controllerConfig.geographies[1].back = currentTask.info.province;
            }
        },
        "target_item_relation": {
            "x": 71,
            "y": 35,
            "w": 28,
            "h": 33,
            "i": "重点人员关系",
            "isEnlarge": false,
            fetch: function (el) {
                invokeService("/dapservices/getrelationgraph", {
                    "subTypeName": "getUUIDByTaskID",
                    "taskType": "city",
                    "params": {
                        "task_id": currentTask.id,
                        "time": getTime()
                    }
                }, function (data) {
                    var dataConfig = [{
                        time: '2016-2-1',
                        id: 789654,
                        nodes: [],
                        links: []
                    }];
                    if (data["edges"] !== undefined) {
                        for (var k = 0; k < data["edges"].length; k++) {
                            
                        }
                    }
                    if (data["persons"] !== undefined) {
                        data["persons"].forEach(function (value) {
                            dataConfig[0].nodes.push({
                                "name": value.personName,
                                "value": value.personDegree,
                                "category": value.category === undefined ? '孤立点' : '',
                                "personId": value.personId
                            });
                        });
                    }
                    el.dataConfig = dataConfig;
                });
            }
        },
        "region_item_line": {
            "x": 1,
            "y": 69,
            "w": 34,
            "h": 30,
            "i": "重点区域指标变化趋势",
            "isEnlarge": false,
            fetch: function (el) {
                var dates = getTimeRange();
                var items = [];
                this.legend.forEach(function (item) {
                    items.push({
                        "name": item.eng,
                        "type": "bar"
                    });
                    legendDic["index_activity_region_bar_line" + "_" + item.eng] = item.chn;
                }, this);
                invokeService("/dapservices/getstatisticresult", {
                    "taskType": "city",
                    "subRpTasks": [{
                        "subTypeName": "index_activity_region_bar_line",
                        "param": {
                            "task_id": currentTask.id,
                            "start_time": dates.start_time,
                            "end_time": dates.end_time,
                            "item": items
                        }
                    }]
                }, function (data) {
                    var dataConfig = {
                        columnTitle: [],
                        rowTitle: [],
                        content: []
                    };
                    data["index_activity_region_bar_line"].xAxis.data.forEach(function (value) {
                        dataConfig.columnTitle.push({
                            "value": value
                        });
                    });
                    data["index_activity_region_bar_line"].legend.data.forEach(function (value) {
                        if (value === "target_num" || value === "total_num")
                            dataConfig.rowTitle.push({
                                "name": legendDic["index_activity_region_bar_line" + "_" + value],
                                "unit": "P"
                            });
                        else
                            dataConfig.rowTitle.push({
                                "name": legendDic["index_activity_region_bar_line" + "_" + value],
                                "unit": "K"
                            });
                    });
                    data["index_activity_region_bar_line"].series.forEach(function (value) {
                        dataConfig.content.push(value.data);
                    });

                    el.dataConfig = dataConfig;
                });
            }
        },
        "target_item": {
            "x": 71,
            "y": 69,
            "w": 28,
            "h": 30,
            "i": "重点人员电信/互联网行为活跃度",
            "isEnlarge": false,
            fetch: function (el) {
                var dates = getTimeRange();
                var items = [];
                this.legend.forEach(function (item) {
                    items.push({
                        "name": item.eng,
                        "type": "bar"
                    });
                    legendDic["index_activity_target_bar_line" + "_" + item.eng] = item.chn;
                }, this);
                invokeService("/dapservices/getstatisticresult", {
                    "taskType": "city",
                    "subRpTasks": [{
                        "subTypeName": "index_activity_target_bar_line",
                        "param": {
                            "task_id": currentTask.id,
                            "start_time": dates.start_time,
                            "end_time": dates.end_time,
                            "item": items
                        }
                    }]
                }, function (data) {
                    var dataConfig = {
                        columnTitle: [],
                        rowTitle: [],
                        content: []
                    };
                    data["index_activity_target_bar_line"].xAxis.data.forEach(function (value) {
                        dataConfig.columnTitle.push({
                            "value": value
                        });
                    });
                    data["index_activity_target_bar_line"].legend.data.forEach(function (value) {
                        dataConfig.rowTitle.push({
                            "name": legendDic["index_activity_target_bar_line" + "_" + value],
                            "unit": "P",
                            "stack": "s"
                        });
                    });
                    data["index_activity_target_bar_line"].series.forEach(function (value) {
                        dataConfig.content.push(value.data);
                    });

                    el.dataConfig = dataConfig;
                });
            }
        },
        "region_item_list": {
            "x": 36,
            "y": 69,
            "w": 34,
            "h": 30,
            "i": "重点区域积分统计",
            "isEnlarge": false,
            fetch: function (el) {
                var items = [],
                    items2 = ['区域名'];
                this.legend.forEach(function (item) {
                    items.push(item.eng);
                    items2.push(item.chn);
                    legendDic["index_activity_region_list" + "_" + item.eng] = item.chn;
                }, this);
                invokeService("/dapservices/getstatisticresult", {
                    "taskType": "city",
                    "subRpTasks": [{
                        "subTypeName": "index_activity_region_list",
                        "param": {
                            "task_id": currentTask.id,
                            "time": getTime(),
                            "vip_region": vipregions,
                            "item": items
                        }
                    }]
                }, function (data) {
                    var dataConfig = {
                        columnTitle: items2,
                        contents: data["index_activity_region_list"]
                    };
                    el.dataConfig = dataConfig;
                });
            }
        }
    };

    var panels = [{
        "id": "threat_indicator",
        "currentView": 'echarts-radar',
        "secondView": 'wx-line',
        "dataConfig": {
            columnTitle: [{
                value: '2012-01'
            }],
            rowTitle: [{
                name: '2012-01',
                unit: "P"
            }],
            content: []
        },
        "styleConfig": {
            isEnlarge: false,
            width: 200,
            height: 100
        },
        "dataConfig2": {
            columnTitle: [{
                value: '2012-01'
            }],
            rowTitle: [{
                name: '2012-01',
                unit: "P"
            }],
            content: []
        }
    }, {
        "id": "vipcountry_item",
        "currentView": 'echarts-pies',
        "dataConfig": [],
        "styleConfig": {
            isEnlarge: false,
            width: 200,
            height: 100
        }
    }, {
        "id": "map",
        "currentView": 'mapControl',
        "dataConfig": {},
        "styleConfig": {
            isEnlarge: true,
            width: 200,
            height: 100
        }
    }, {
        "id": "area_area_item",
        "currentView": 'echarts-qx-map',
        "dataConfig": {
            items: []
        },
        "styleConfig": {
            isEnlarge: false,
            width: 200,
            height: 100
        },
        "controllerConfig": {
            geographies: [{
                text: '全国',
                geography: 'china',
                back: 'china'
            }, {
                text: '省内',
                geography: '',
                back: ''
            }]
        }
    }, {
        "id": "target_item_relation",
        "currentView": 'echarts-graph',
        "dataConfig": [],
        "styleConfig": {
            isEnlarge: false,
            width: 200,
            height: 100
        }
    }, {
        "id": "region_item_line",
        "currentView": 'datazoom-one-bar-one-line',
        "dataConfig": {
            columnTitle: [{
                value: '2012-01'
            }],
            rowTitle: [{
                name: '2012-01',
                unit: "P"
            }],
            content: []
        },
        "styleConfig": {
            isEnlarge: false,
            width: 200,
            height: 100
        }
    }, {
        "id": "target_item",
        "currentView": 'datazoom-one-bar-one-line',
        "dataConfig": {
            columnTitle: [{
                value: '2012-01'
            }],
            rowTitle: [{
                name: '2012-01',
                unit: "P"
            }],
            content: []
        },
        "styleConfig": {
            isEnlarge: false,
            width: 200,
            height: 100
        }
    }, {
        "id": "region_item_list",
        "currentView": 'taishi-table',
        "dataConfig": {},
        "styleConfig": {
            isEnlarge: false,
            width: 200,
            height: 100
        }
    }];

    var calcPanelSize = function (panel, w, h) {
        panel.styleConfig.width = (document.getElementById('content').offsetWidth - (MaxColumn + 1) * ColGap) / MaxColumn * w + ColGap * (w - 1) - ComponentHorMargin;
        panel.styleConfig.height = RowHeight * h + RowGap * (h - 1) - ComponentVerMargin;
        console.log(panel.styleConfig.width, panel.styleConfig.height);
    };

    Vue.config.debug = true;
    Vue.config.devtools = false;

    var GridLayout = VueGridLayout.GridLayout;
    var GridItem = VueGridLayout.GridItem;

    var vm = new Vue({
        el: '#main',
        components: {
            GridLayout,
            GridItem
        },
        data: {
            loading: false,
            empty: false,
            children: [],
            maxCol: MaxColumn,
            rowHgt: 0,
            margin: [ColGap, RowGap],
            showMenu: false,
            tasks: [],
            taskTitle: '',
            totalNum: [],
            hitNum: [],
            imptlevel: '中',
            reportUrl: ''
        },
        computed: {
            totalNums: function () {
                return this.totalNum;
            },
            hitNums: function () {
                return this.hitNum;
            }
        },
        methods: {
            resizeEvent: function (i, newH, newW) {
                var lt = panels.find(function (el) {
                    return el.i === i;
                });
                calcPanelSize(lt, newW, newH);
            },
            selectTask: function (task) {
                if (task.isCurrent)
                    return;
                setTask(task);
                this.showMenu = false;
            },
            zoom: function (target) {
                console.log("查看 '%s' 详细信息", target);

                var zoomed, tobeZoom, temp = {};
                panels.forEach(function (el) {
                    if (el.styleConfig.isEnlarge) {
                        zoomed = el;
                    } else if (el.i === target) {
                        tobeZoom = el;
                    }
                });

                temp.x = tobeZoom.x;
                temp.y = tobeZoom.y;
                temp.w = tobeZoom.w;
                temp.h = tobeZoom.h;
                tobeZoom.x = zoomed.x;
                tobeZoom.y = zoomed.y;
                tobeZoom.w = zoomed.w;
                tobeZoom.h = zoomed.h;
                zoomed.x = temp.x;
                zoomed.y = temp.y;
                zoomed.w = temp.w;
                zoomed.h = temp.h;

                tobeZoom.styleConfig.isEnlarge = true;
                calcPanelSize(tobeZoom, tobeZoom.w, tobeZoom.h);
                zoomed.styleConfig.isEnlarge = false;
                calcPanelSize(zoomed, zoomed.w, zoomed.h);
            },
            resetLayout: function (resetData) {
                var layoutHeight = document.getElementById('content').offsetHeight;
                var rh = RowHeight;
                RowHeight = layoutHeight / 100;
                panels.forEach(function (el) {
                    var initData = initDatas[el.id];
                    el.x = initData.x;
                    el.y = initData.y;
                    el.w = initData.w;
                    el.h = initData.h;
                    el.i = initData.i;
                    el.styleConfig.isEnlarge = initData.isEnlarge;

                    if (resetData) {
                        initData.fetch(el);
                    }

                    if (el.y < 5 && el.y > 1) {
                        var ny = el.y;
                        var nh = el.h;
                        el.y = Math.floor(rh * ny / RowHeight);
                        el.h = nh + ny - el.y;
                    }
                    calcPanelSize(el, el.w, el.h);
                });

                vm.rowHgt = RowHeight;
            },
            chartChange: function (src, val) {
                if (src.chartName === 'echarts-qx-map') {
                    if (src.eventName === 'changeGeo') {
                        qxCurrentLevel = val === 'china' ? 'province' : 'city';
                        initDatas["area_area_item"].fetch(panels[3], qxCurrentLevel);
                    } else if (src.eventName === 'clickMap') {
                        var dates = getTimeRange();
                        vm.loading = true; //等待数据加载
                        invokeService("/dapservices/getpersonalturnoverdetail", {
                            "subTypeName": "getBillDataByDay",
                            "taskType": "city",
                            "params": {
                                "start_time": dates.today,
                                "end_time": dates.end_time,
                                "item": legendDic[val.type],
                                "from_type": qxCurrentLevel,
                                "to_type": qxCurrentLevel,
                                "from": val.formName,
                                "to": val.toName,
                                "offset": 0,
                                "limit": 1000,
                                "centercode": centercodes[legendDic[val.type]] === undefined ? "100000" : centercodes[legendDic[val.type]]
                            }
                        }, function (result) {
                            var html = '<div class="sqk-tbody-div" style="margin-top:30px">' +
                                '<h2>人流详单</h2>' +
                                '<table>' +
                                '<tbody>';
                            if (legendDic[val.type] === 'person')
                                result["data"].forEach(function (item) {
                                    html = html + '<tr>';
                                    item.forEach(function (totalItem, index) {
                                        if (index == 0) {
                                            html = html + '<td class="string-sqk"><a href="' + config.renHost + '/renlifang/profile.html?entityid=' + window.btoa(totalItem) + '&entitytype=' + window.btoa(1) + '" target="_blank">' + totalItem + '</a></td>';
                                        } else {
                                            html = html + '<td class="string-sqk">' + totalItem + '</td>';
                                        }
                                    });
                                    html = html + '</tr>';
                                });
                            else {
                                html = '<div class="sqk-tbody-div2" style="margin-top:30px">' +
                                    '<h2>物流详单</h2>' +
                                    '<table>' +
                                    '<tbody>';
                                result["data"].forEach(function (item) {
                                    html = html + '<tr>';
                                    item.forEach(function (totalItem, index) {
                                        if (index == 2 || index == 5) {
                                            html = html + '<td class="string-sqk"><a href="' + config.renHost + '/renlifang/profile.html?entityid=' + window.btoa(totalItem) + '&entitytype=' + window.btoa(5) + '" target="_blank">' + totalItem + '</a></td>';
                                        } else {
                                            html = html + '<td class="string-sqk">' + totalItem + '</td>';
                                        }
                                    });
                                    html = html + '</tr>';
                                });
                            }
                            html = html + '</tbody>' +
                                '</table>' +
                                '</div>';
                            showbox(html);
                            vm.loading = false;
                        });
                    }
                } else if (src.chartName === 'echarts-graph') {
                    if (src.eventName === 'clickNode') {
                        showbox('<iframe width="100%" height="100%" src="' + config.acHost + '/ac/ac-detail.html?peopleid=' + val.personId + '"></iframe>');
                    }
                }
            },
            click: function (event) {
                this.showMenu = false;
            }
        }
    });

    var invokeService = function (url, params, completed) {
        $.getJSON(config.serviceRoot + url, params, function (res) {
            console.log(res);

            completed(res);
        });
    };

    var getTaskLegends = function (task, completed, params) {
        invokeService("/dapservices/gettasklegend", {
            "subTypeName": "getTaskLegendParamList",
            "taskType": "city",
            "params": {
                id: task.id,
                name: params === undefined ? chartNames : params
            }
        }, function (alllegends) {
            completed(alllegends);
        });
    };

    var setReport = function () {
        invokeService("/dapservices/setrecordlog", {
            "taskType": "city",
            "subRpTasks": [{
                "subTypeName": "record_log",
                "param": {
                    "task_id": currentTask.id,
                    "item": "city"
                }
            }]
        }, function (result) {});
    };

    var getTaskNumber = function (task, completed) {
        invokeService("/dapservices/getstatisticresult", {
            "taskType": "city",
            "subRpTasks": [{
                "subTypeName": "index_activity_data_count",
                "param": {
                    "task_id": currentTask.id,
                    "time": getTime()
                }
            }]
        }, function (result) {
            completed(result["index_activity_data_count"]);
        });
    };

    var getTaskLevel = function (task, completed) {
        invokeService("/dapservices/getstatisticresult", {
            "taskType": "city",
            "subRpTasks": [{
                "subTypeName": "index_activity_threat_radar",
                "param": {
                    "task_id": currentTask.id,
                    "time": getTime(),
                    "series": ['实际值'],
                    "item": ['threat_level']
                }
            }]
        }, function (result) {
            completed(result["index_activity_threat_radar"]);
        });
    };

    var getTime = function () {
        var date = new Date();
        var time = (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() + ":" + (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
        if (currentTask.info.force_day !== undefined)
            time = currentTask.info.force_day + " " + time;
        else
            time = date.getFullYear() + "-" + (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" : "") + date.getDate() + " " + time;

        return time;
    }

    var getTodayTime = function () {
        var date = new Date();
        var time = "00:00:00";
        if (currentTask.info.force_day !== undefined)
            time = currentTask.info.force_day + " " + time;
        else
            time = date.getFullYear() + "-" + (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" : "") + date.getDate() + " " + time;

        return time;
    }

    var getTimeRange = function () {
        var date = new Date();
        if (currentTask.info.force_day !== undefined) {
            var dates = currentTask.info.force_day.split('-');
            date = new Date(dates[0], dates[1], dates[2]);
        }

        var start_time;
        var end_time = getTime();
        var today = getTodayTime();
        var time = end_time.split(" ")[1];
        if (currentTask.info.force_day !== undefined) {
            start_time = new Date(date.getTime());
            start_time.setDate(start_time.getDate() - 7);
            start_time = start_time.getFullYear() + "-" +
                (start_time.getMonth() < 10 ? "0" : "") + (start_time.getMonth()) + "-" +
                (start_time.getDate() < 10 ? "0" : "") + start_time.getDate() + " " + time;
        } else {
            start_time = new Date(date.getTime());
            start_time.setDate(start_time.getDate() - 7);
            start_time = start_time.getFullYear() + "-" +
                (start_time.getMonth() < 9 ? "0" : "") + (start_time.getMonth() + 1) + "-" +
                (start_time.getDate() < 10 ? "0" : "") + start_time.getDate() + " " + time;
        }
        return {
            "start_time": start_time,
            "end_time": end_time,
            "today": today
        };
    }

    /**
     * 3. 分别获取并处理组织所有图表的数据,最后渲染
     */
    var initAllChartsData = function (task, alllegends) {
        for (var key in initDatas) {
            if (initDatas.hasOwnProperty(key)) {
                initDatas[key].legend = alllegends[key];
            }
        }
        render();
    };

    /**
     * 2. 设置当前任务
     */
    var setTask = function (task) {
        if (task.isCurrent) return;
        vm.loading = true;
        vm.children = [];
        vm.tasks.forEach(function (el) {
            el.isCurrent = el === task;
            if (el.isCurrent) {
                currentTask = task;
                vm.reportUrl = "report.html#" + task.id + "+" + getTime();
                vm.taskTitle = el.info.title.taishi;

                setReport();
                getTaskNumber(task, function (result) {
                    var vm_totalNum = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
                    var vm_hitNum = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
                    var totalNum = result["dataCount"].toString();
                    var totalLength = totalNum.length;
                    var hitNum = result["hitCount"].toString();
                    var hitLength = hitNum.length;
                    for (var i = 1; i <= vm_totalNum.length; i++) {
                        if (i <= totalLength) {
                            vm_totalNum[vm_totalNum.length - i] = totalNum[totalLength - i];
                        }
                        if (i <= hitLength) {
                            vm_hitNum[vm_hitNum.length - i] = hitNum[hitLength - i];
                        }
                    }

                    vm.totalNum = vm_totalNum;
                    vm.hitNum = vm_hitNum;
                });
                getTaskLevel(task, function (result) {
                    switch (result.data[0].value[0]) {
                        case 0:
                            vm.imptlevel = "低";
                            break;
                        case 1:
                            vm.imptlevel = "中";
                            break;
                        case 2:
                            vm.imptlevel = "高";
                            break;
                        default:
                            break;
                    }
                });

                vipcountries = el.info.vipcountry;
                vipregions = el.info.viparea.map(function (item) {
                    return item.name;
                });

                centercodes = {};
                if (el.info.centercode !== undefined) {
                    el.info.centercode.forEach(function (it) {
                        centercodes[it.name] = it.value;
                    }, this);
                }

                // 获取特殊图例
                getTaskLegends(task, function (legends) {
                    threat_series = legends.threat_series;

                    // 获取任务相关所有图表图例
                    getTaskLegends(task, function (alllegends) {
                        initAllChartsData(task, alllegends);
                    });
                }, ["threat_series"]);
            }
        });
    };

    /**
     * 1. 启动函数，获取任务列表，默认选择第一个任务为当前任务
     */
    var init = function (completed) {
        vm.loading = true;
        invokeService("/dapservices/gettasklist", {
            "subTypeName": "getTaskList",
            "taskType": "city",
            "params": {
                id: "test"
            }
        }, function (alltasks) {
            if (alltasks === undefined || alltasks.length === 0) {
                vm.empty = true;
                Vue.nextTick(function () {
                    $('.alertmsg').removeClass('none');
                });
            } else {
                vm.tasks = alltasks;
                setTask(alltasks[alltasks.length - 1]);
            }
        });
    };

    /**
     * 渲染函数，计算布局，绑定所有面板数据
     */
    var render = function () {

        vm.resetLayout(true);
        vm.children = panels;

        Vue.nextTick(function () {
            setTimeout(function () {
                vm.loading = false;
            }, 50);

            mapControl = new gis.TaiShi_Gis({
                ip: config["gis-server"]
            });
            mapControl.setTask({
                location: currentTask.info.city_position,
                getHeatMap: function () {
                    invokeService("/dapservices/getstatisticresult", {
                        "taskType": "city",
                        "subRpTasks": [{
                            "subTypeName": "index_activity_distribution_heat_map",
                            "param": {
                                "task_id": currentTask.id,
                                "time": getTime()
                            }
                        }]
                    }, function (data) {
                        mapControl._heatMap(data["index_activity_distribution_heat_map"].record);
                    });
                },
                getCluster: function () {
                    invokeService("/dapservices/getstatisticresult", {
                        "taskType": "city",
                        "subRpTasks": [{
                            "subTypeName": "index_activity_target_location_map",
                            "param": {
                                "task_id": currentTask.id,
                                "time": getTime()
                            }
                        }]
                    }, function (data) {
                        mapControl._cluster(data["index_activity_target_location_map"]);
                    });
                },
                targetPopup: function (id) {
                    showbox('<iframe width="100%" height="100%" src="' + config.acHost + '/ac/ac-detail.html?peopleid=' + id + '"></iframe>');
                }
            });

            $('.none').removeClass('none');
        });
    };

    init();
});