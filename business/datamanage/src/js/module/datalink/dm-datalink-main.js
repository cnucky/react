/**
 * Created by root on 1/20/17.
 */
require(['nova-dialog',
        'nova-notify',
        '../datalink/optionData',
        '../datalink/datetimepicker',
        '../datalink/dm-datalink-init',
        '../datalink/dm-datalink-util',],
    function(Dialog, Notify, optDataForMap, datePicker, init, util) {
        var mapChart;
        var linkChart;
        var dataTypeChart;
        var domGraphic = document.getElementById('graphic');
        var domMain = document.getElementById('echartmain');
        var domLink = document.getElementById('speedInfo');
        var dataTypeLink = document.getElementById('dataTypeInfo');

        var redColorStr = '#C1232B';
        var greenColorStr = '#33A499';
        var lightGreyColorStr = 'grey';
        var colorList = [];

        var timeTicket;

        var isSource = false;
        var isDes = false;

        var tarCenter;
        var srcCenter;
        var level;

        var systemsArray;
        var centerInfoArray;
        var codeNameDic;
        var nameCodeDic;
        var centerCityDic;
        var cityCenterDic;
        var systemDic = new Array();
        var dataTypeDic = new Array();

        var curLinkID;
        var curDataTypeId;
        var curSystemId;
        var curDataTypeIndex;
        var curTaskId;

        var dataTypePageCount;
        var curPageNum = 0;
        var dataTypeCountsForPage = 6;

        var curRowIndex;
        var mapOption;
        var dataTypeOption;

        var geoCoordMap = {
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
        };

        var color = ['red', '#4ea5e0', 'lightgreen', '#a6c84c', '#ffa022', '#46bee9'];
        var color1 = ['#e36d5a', '#85d27a', '#f7c65f', '#a992e2', '#b9b9b9', '#4ea5e0'];
        var series = [];

        var linkData = [];
        var linkDataA = [];
        var linkDataB = [];
        var linkDataC = [];
        var unlinkData = [];

        pageInit();

        function pageInit() {
            bindEvent();
            refresh();
            //window.onresize = mapChart.resize;
        }

        function bindEvent() {
            $("#closeGetDataTipBtn").bind("click", function () {
                $("#getDataTip").hide()
            });

            $("#centerTipBtn").bind("click", function () {
                    $("#centerTip").hide();
            });

            $("#linkTipBtn").bind("click", function () {
                $("#linkTip").hide();
            });

            $("#prev").bind("click", prePageClick);

            $("#next").bind("click", nextPageClick);

            $("#closeCreateLinkTip").bind("click", hideCreateLinkBtn);

            $("#btn-Break").bind("click", closeLink);

            $("#selectLink").bind("change", function () {
                    curLinkID = $("#selectLink")[0].value;
                    setByLink();
                });

            $("#showCreateLinkTipBtn").bind("click", showCreateView);

            $("#btn-addLink").bind("click", addLinkLine);

            $("#taskTable").delegate("tr", "click", taskTableClick);

            $("#btn-getdata").click(function () {
                Dialog.build({
                    title: "创建采集任务",
                    maxHeight: 500,
                    content: ' <div class="section"> <label class="field-label"> 系统名称：</label> <lable id="systemName-getData" style="width: 50px;"></lable></div> <br>'
                    + '<div class="section"> <label class="field-label"> 数据类型：</label> <lable id="getDataTipype-getData" style="width: 50px; color:red"></lable></div> <br>'
                    + '<div class="section"> <label class="field-label"> 目标中心：</label> <lable id="sourceCenter-getData" style="width: 50px;"></lable> </div> <br> <div class="section">'
                    + '<label class="field-label">发起中心：</label> <lable id="desCenter-getData" style="width: 50px;"></lable> </div> <br>'

                    + ' <div class=" input-group" style="width:100%"> <span class="input-group-addon" style="width:105px;color:#232323">采集时间范围：</span>'
                    + '<div class="input-group date" id="dateRange_picker"> <span class="input-group-addon cursor"> <i class="fa fa-calendar"></i> </span>'
                    + '<input type="text" class="form-control" id="dateRange" style="padding-right:0px; color:red" placeholder="时间段"> </div> </div><br>'

                    + ' <div class=" input-group" style="width:100%"> <span class="input-group-addon" style="width:105px;color:#232323">任务名称：</span>'
                    + '<input type="text" class="form-control" id="taskName" style="padding-right:0px; color:red" placeholder="请输入任务名称！">  </div>',

                    rightBtnCallback: function () {// 确认
                        var beginTimeStr = "";
                        var endTimeStr = "";
                        var timeRangeStr = $('#dateRange')[0].value;
                        var pos = timeRangeStr.indexOf(' - ');
                        if (pos >= 0) {
                            beginTimeStr = timeRangeStr.substring(0, pos).trim();
                            endTimeStr = timeRangeStr.substring(pos + 3, timeRangeStr.length).trim();
                        }

                        $.post('/datamanage/datalink/CreateTask', {
                            "taskName": $('#taskName')[0].value,
                            "datatypeId": curDataTypeId,
                            "tarSystemId": curSystemId,
                            "srcSystemId": curSystemId,
                            "connectId": curLinkID,
                            "taskType": 2,
                            "dataStartTime": beginTimeStr,
                            "dataEndTime": endTimeStr,
                        }).done(function (res) {
                            var data = JSON.parse(res);
                            if (data.code == 0) {
                                console.log(data.data);
                                getTaskInfoForLink();
                                getData();
                                Notify.show({
                                    title: "创建任务成功！",
                                    type: "success"
                                });
                            }
                            else {
                                Notify.show({
                                    title: "创建任务失败！",
                                    type: "error"
                                });
                                console.log("CreateTask", data.message);
                            }
                            $.magnificPopup.close();
                        });
                    }
                }).show(function () {
                    $('#getDataTipype-getData')[0].textContent = $('#curDataType')[0].textContent;
                    $('#sourceCenter-getData')[0].textContent = $('#sourceCenterName')[0].textContent;
                    $('#desCenter-getData')[0].textContent = $('#desCenterName')[0].textContent;
                    $('#systemName-getData')[0].textContent = systemDic[curSystemId];
                    datePicker.initDatetime('dateRange');
                });
            });

            $('#btn-createTask').bind("click", getData);

            $('#btn-refresh-loadtask').bind("click", function () {
                getTaskInfoForLink();
            });

            $('#btn-begin-loadtask').bind("click", beginTask);

            $('#btn-stop-loadtask').bind("click", stopTask);
        }

        function refresh() {
            if (mapChart && mapChart.dispose) {
                mapChart.dispose();
            }
            initpage();
            //console.log("echarts", echarts);
            mapChart = echarts.init(domMain);
            window.onresize = mapChart.resize;

            getAllConnection();

            //ecConfig = require('echarts/config');
            mapChart.on('click', mapClick);

            if (linkChart && linkChart.dispose) {
                linkChart.dispose();
            }
            linkChart = echarts.init(domLink);

            if (dataTypeChart && dataTypeChart.dispose) {
                dataTypeChart.dispose();
            }
        }

        function initpage() {
            dataTypeCountsForPage = init.initpagesize();
            mapOption = init.initmapOption();
            dataTypeOption = init.initdataTypeOption();

            centerInfoArray = init.initCenterInfoArray();
            codeNameDic = centerInfoArray;
            nameCodeDic = init.initnameCodeDic();
            centerCityDic = init.initcenterCityDic();
            cityCenterDic = init.initcityCenterDic();
        }

        function clearData() {
            linkData = [];
            linkDataA = [];
            linkDataB = [];
            linkDataC = [];
            unlinkData = [];
        }

        var convertDataLine = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var dataItem = data[i];
                if (dataItem[0]) {
                    var fromCoord = geoCoordMap[dataItem[0].name];
                }
                if (dataItem[1]) {
                    var toCoord = geoCoordMap[dataItem[1].name];
                    if (fromCoord && toCoord) {
                        res.push([{
                            coord: fromCoord,
                            srcCenter: dataItem[0].name,
                            tarCenter: dataItem[1].name,
                            type: dataItem[0].type,
                            id: dataItem[0].id,
                            status: dataItem[0].status,
                            value: dataItem[0].value
                        }, {
                            coord: toCoord
                        }]);
                    }
                }
            }
            return res;
        };

        var convertDataNode = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var dataItem = data[i];
                if (dataItem[0]) {
                    var fromCoord = geoCoordMap[dataItem[0].name];
                    //fromCoord.push(dataItem[0].name);
                    res.push({
                        name: dataItem[0].name,
                        value: fromCoord
                    });
                }
                if (dataItem[1]) {
                    var toCoord = geoCoordMap[dataItem[1].name];
                    //toCoord.push(dataItem[1].name);
                    res.push({
                        name: dataItem[1].name,
                        value: toCoord
                    });
                }
            }
            return res;
        };

        var convertData = function (linetype, selectType) {
            var res = [];
            switch (selectType) {
                case 0://全部
                    if (linetype == 0)
                        return convertDataLine(linkData);
                    if (linetype == 1)
                        return convertDataLine(linkDataA);
                    if (linetype == 2)
                        return convertDataLine(linkDataB);
                    if (linetype == 3)
                        return convertDataLine(linkDataC);
                    if (linetype == 4)
                        return convertDataLine(unlinkData);
                    if (linetype == 5){
                        var resArray = convertDataNode(linkData.concat(unlinkData));
                        resArray.push({
                            name: '部中心',
                            value: [116.4551, 40.2539]
                        });
                        return resArray;
                    }
                    break;
                case 1: //已链接
                    if (linetype == 0)
                        return convertDataLine(linkData);
                    if (linetype == 1)
                        return convertDataLine(linkDataA);
                    if (linetype == 2)
                        return convertDataLine(linkDataB);
                    if (linetype == 3)
                        return convertDataLine(linkDataC);
                    if (linetype == 5)
                        return convertDataNode(linkData);
                    break;
                case 2: //已断开
                    if (linetype == 4)
                        return convertDataLine(unlinkData);
                    if (linetype == 5)
                        return convertDataNode(unlinkData);
                    break;
                default:
                    break;
            }
            return res;
        };

        //调用服务，获取所有数据链
        function getAllConnection() {
            $.post('/datamanage/datalink/GetAllConnection', {}).done(function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    //console.log(data.data);

                    clearData();
                    var status;
                    for (var i = 0; i < data.data.connectInfos.length; ++i) {
                        status = data.data.connectInfos[i].connectStatus;
                        tarCenter = centerCityDic[centerInfoArray[data.data.connectInfos[i].srcCenterCode]];
                        srcCenter = centerCityDic[centerInfoArray[data.data.connectInfos[i].tarCenterCode]];
                        var line = new Array();
                        line.push(new Object({
                            name: srcCenter,
                            type: 'line',
                            id: data.data.connectInfos[i].connectID,
                            status: status,
                            value: util.levelTrans1(data.data.connectInfos[i].connectLevel)
                        }));
                        line.push(new Object({
                            name: tarCenter
                        }));

                        if (status == 0)
                        //mapOption.series[0].markLine.data.push(line);
                            unlinkData.push(line);

                        if (status == 1) {
                            //mapOption.series[1].markLine.data.push(line);
                            linkData.push(line);
                            switch (line[0].value) {
                                case 3:
                                    linkDataA.push(line);
                                    break;
                                case 2:
                                    linkDataB.push(line);
                                    break;
                                case 1:
                                    linkDataC.push(line);
                                    break;
                                default:
                                    break;
                            }
                            //mapOption.series[1].data.push(line);

                            ////if(tarCenter == '部中心' || srcCenter == '部中心')
                            ////    mapOption.series[2].markLine.data.push(line);
                            //
                            //for (var j = 0; j < mapOption.series[1].markPoint.data.length; ++j) {
                            //    if (mapOption.series[1].markPoint.data[j].name == tarCenter || mapOption.series[1].markPoint.data[j].name == srcCenter) {
                            //        if (line[0].value > mapOption.series[1].markPoint.data[j].value) {
                            //            mapOption.series[1].markPoint.data[j].value = line[0].value;
                            //        }
                            //        //break;
                            //    }
                            //}
                        }

                    }
                    console.log("linkData", linkData);
                    console.log("unlinkData", unlinkData);
                    console.log("linkDataA", linkDataA);
                    console.log("linkDataB", linkDataB);
                    console.log("linkDataC", linkDataC);

                    //mapOption.series[2].markPoint.data = mapOption.series[1].markPoint.data;
                    //$.get('datalink/map/json/anhui.json', function (geoJson) {
                    //
                    //    myChart.hideLoading();
                    //
                    //    mapChart.registerMap('anhui', geoJson);
                    [['全部'], ['已链接'], ['已断开']].forEach(function (item, i) {
                        //console.log(item);
                        series.push
                        (
                            //5
                            {
                                name: item[0],
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                legendHoverLink: false,
                                hoverable: true,
                                tooltip : {
                                    show: true,
                                    formatter: function(params){
                                        //console.log("formatter params", params.data.name);
                                        return params.data.name;
                                    }
                                },
                                zlevel: 1,
                                rippleEffect: {
                                    brushType: 'stroke' //stroke
                                },
                                label: {
                                    normal: {
                                        show: false,
                                        position: 'right',
                                        formatter: function(params){
                                            console.log("formatter params", params.data[2]);
                                            return params.data[2];
                                        }
                                    }
                                },
                                symbolSize: function (val) {
                                    return 12;
                                    //val[2] / 8;
                                },
                                itemStyle: {
                                    normal: {
                                        color: color[i],
                                        opacity: 0.2,
                                        formatter: function(params){
                                            //console.log("formatter params", params.data[2]);
                                            return params.data[2];
                                        }
                                    }
                                },
                                data: convertData(5, i)
                                //item[1].map(function (dataItem) {
                                //    if (dataItem[1]) {
                                //        return {
                                //            //name: dataItem[1].name,
                                //            //value: 1
                                //            value: geoCoordMap[dataItem[1].name] //.concat(1)
                                //        };
                                //    }
                                //})
                            },
                            //断开 4
                            {
                                name: item[0],
                                type: 'lines',
                                zlevel: 2,
                                //effect: {
                                //    show: true,
                                //    period: 6,
                                //    trailLength: 0,
                                //    //symbol: 'diamond',
                                //    symbolSize: 0
                                //},
                                tooltip : {
                                    show: true,
                                    formatter: function(params){
                                        console.log("tipinfo params", tipinfo);
                                        var tipinfo = params.data.srcCenter+'->'+params.data.tarCenter
                                            +',级别为'+util.levelTrans2(params.data.value)
                                        return tipinfo;
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        type: 'dashed',
                                        color: 'purple',
                                        width: 2,
                                        opacity: 0.6,
                                        curveness: 0.2
                                    }
                                },
                                animation: false,
                                data: convertData(4, i)
                            },
                            //A实线 1
                            {
                                name: item[0],
                                type: 'lines',
                                zlevel: 3,
                                tooltip : {
                                    show: true,
                                    formatter: function(params){
                                        console.log("tipinfo params", tipinfo);
                                        var tipinfo = params.data.srcCenter+'->'+params.data.tarCenter
                                            +',级别为'+util.levelTrans2(params.data.value)
                                        return tipinfo;
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        type: 'solid',
                                        color: color[0],
                                        width: 2,
                                        opacity: 1,
                                        curveness: 0.2
                                    }
                                },
                                animation: false,
                                data: convertData(1, i)
                            },
                            //B实线 2
                            {
                                name: item[0],
                                type: 'lines',
                                zlevel: 4,
                                tooltip : {
                                    show: true,
                                    formatter: function(params){
                                        console.log("tipinfo params", tipinfo);
                                        var tipinfo = params.data.srcCenter+'->'+params.data.tarCenter
                                            +',级别为'+util.levelTrans2(params.data.value)
                                        return tipinfo;
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        type: 'solid',
                                        color: color[1],
                                        width: 2,
                                        opacity: 1,
                                        curveness: 0.2
                                    }
                                },
                                animation: false,
                                data: convertData(2, i)
                            },
                            //C实线 3
                            {
                                name: item[0],
                                type: 'lines',
                                zlevel: 5,
                                tooltip : {
                                    show: true,
                                    formatter: function(params){
                                        console.log("tipinfo params", tipinfo);
                                        var tipinfo = params.data.srcCenter+'->'+params.data.tarCenter
                                            +',级别为'+util.levelTrans2(params.data.value)
                                        return tipinfo;
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        type: 'solid',
                                        color: color[2],
                                        width: 2,
                                        opacity: 1,
                                        curveness: 0.2
                                    }
                                },
                                animation: false,
                                data: convertData(3, i)
                            },
                            //闪烁 0
                            {
                                name: item[0],
                                type: 'lines',
                                zlevel: 6,
                                effect: {
                                    show: true,
                                    period: 5,
                                    trailLength: 0.5,
                                    symbol: 'triangle', //triangle
                                    color: '#fff',
                                    symbolSize: 7
                                },
                                lineStyle: {
                                    normal: {
                                        color: color[i],
                                        width: 0,
                                        opacity: 0.4,
                                        curveness: 0.2
                                    }
                                },
                                animation: false,
                                data: convertData(0, i)
                            }
                        );
                    });


                    mapOption.series = series;
                    mapChart.setOption(mapOption);
                }
                else {
                    console.log("GetAllConnection", data);
                    //alert(data.message);
                }
            });
        }

        //显示创建链路的页面
        function showCreateView() {
            isSource = true;
            isDes = true;
            var colorList = [];
            $('#sourceCenter')[0].textContent = '请在地图中选择！';
            $('#desCenter')[0].textContent = '请在地图中选择！';
            $('.createLinkTip').show();
        }

        //调用服务，创建数据链
        function createLink() {
            showLoader();
            console.log("mapOption.series[1]", mapOption.series[1]);
            var srcCenterCode = nameCodeDic[$('#desCenter')[0].textContent];
            if (srcCenterCode == undefined) {
                Notify.show({
                    title: "请先选择发起中心！",
                    type: "error"
                });
                hideLoader();
                return false;
            }
            var tarCenterCode = nameCodeDic[$('#sourceCenter')[0].textContent];
            if (tarCenterCode == undefined) {
                Notify.show({
                    title: "请先选择目标中心！",
                    type: "error"
                });
                hideLoader();
                return false;
            }
            if (srcCenterCode == tarCenterCode) {
                showCreateView();
                Notify.show({
                    title: "发起中心和目标中心不能相同！",
                    type: "error"
                });
                hideLoader();
                return false;
            }
            var connectLevel = util.levelTrans2(util.getLevel());
            if (connectLevel == null) {
                Notify.show({
                    title: "请先选择数据链级别！",
                    type: "error"
                });
                hideLoader();
                return false;
            }

            console.log("mapOption.series", mapOption.series);
            for (var j = 0; j < mapOption.series[5].data.length; ++j) {
                if (mapOption.series[5].data[j][0].name == centerCityDic[$('#sourceCenter')[0].textContent] &&
                    mapOption.series[5].data[j][1].name == centerCityDic[$('#desCenter')[0].textContent]) {
                    Notify.show({
                        title: "该数据链已经存在，不能重复创建！",
                        type: "error"
                    });
                    hideLoader();
                    return false;
                }
            }

            $.post('/datamanage/datalink/CreateConnection', {
                "srcCenterCode": srcCenterCode,
                "tarCenterCode": tarCenterCode,
                "connectLevel": connectLevel,
                "connectStatus": 1,
                "userID": -1,
                "passWord": "12345678",
                "connectDescription": ""
            }).done(function (res) {
                hideLoader();
                var data = JSON.parse(res);
                if (data.code == 0) {
                    ////console.log(data.data);
                    //tarCenter = centerCityDic[$('#sourceCenter')[0].textContent];
                    //srcCenter = centerCityDic[$('#desCenter')[0].textContent];
                    //var line = new Array();
                    //line.push(new Object({
                    //    name: tarCenter,
                    //    type: 'line',
                    //    id: data.data.connectID,
                    //    value: util.getLevel()
                    //}));
                    //line.push(new Object({
                    //    name: srcCenter
                    //}));
                    //mapOption.series[0].markLine.data.push(line);
                    //mapOption.series[1].markLine.data.push(line);
                    //
                    //if (tarCenter == '部中心' || srcCenter == '部中心')
                    //    mapOption.series[2].markLine.data.push(line);
                    //
                    //for (var j = 0; j < mapOption.series[1].markPoint.data.length; ++j) {
                    //    if (mapOption.series[1].markPoint.data[j].name == tarCenter ||
                    //        mapOption.series[1].markPoint.data[j].name == srcCenter) {
                    //        if (line[0].value > mapOption.series[1].markPoint.data[j].value) {
                    //            mapOption.series[1].markPoint.data[j].value = line[0].value;
                    //        }
                    //        //break;
                    //    }
                    //}
                    //mapOption.series[2].markPoint.data = mapOption.series[1].markPoint.data;
                    //mapChart.setOption(mapOption, true);
                    //
                    //Notify.show({
                    //    title: " 创建数据链成功！",
                    //    type: "success"
                    //});
                    //console.log("mapOption.series[0]", mapOption.series[0]);
                    //console.log("mapOption.series[1]", mapOption.series[1]);

                    refresh();
                    return true;
                }
                else {
                    Notify.show({
                        title: "创建数据链失败！",
                        type: "error"
                    });
                    showCreateView();
                    console.log("CreateConnection", data.message);
                    return false;
                }
            });
        }

        //单击按钮，建立链路
        function addLinkLine() {
            if (createLink())
                hideCreateLinkBtn();
        }

        //获取某数据类型的数据
        function getData() {
            dataTypeChart = echarts.init(dataTypeLink);
            dataTypeChart.on('click', dataTypeChartClick);
            colorList[curDataTypeIndex] = redColorStr;
            systemsArray[curSystemId].dataTypes[curDataTypeIndex].status = 1;
            dataTypeChart.setOption(dataTypeOption);

            $('#dataTypeState')[0].textContent = "已有任务";
        }

        //点击地图上各个元素，触发该事件
        function mapClick(param) {
            console.log("mapClick param", param);
            var componentType = param.componentType;
            var componentSubType = '';
            if(param.componentSubType)
                componentSubType = param.componentSubType;
            var type = 'area';
            if(componentType == 'geo'){
                type = 'area';
            }
            else if(componentSubType){
                if(componentSubType == "lines"){
                    var id = param.data.id;
                    type = 'line'
                }
                else
                    type = 'city';
            }


            if (isDes && type != 'line') {
                isDes = false;
                if (type == 'city')
                    $('#desCenter')[0].textContent = cityCenterDic[param.name];
                else
                    $('#desCenter')[0].textContent = param.name;

                $('#sourceCenter')[0].textContent = '请在地图中选择！';
                return;
            }

            if (isSource && type != 'line') {
                isSource = false;
                if (type == 'city')
                    $('#sourceCenter')[0].textContent = cityCenterDic[param.name];
                else
                    $('#sourceCenter')[0].textContent = param.name;
                //$('#desCenter')[0].textContent = '请在地图中选择源中心！';
                return;
            }

            if (isSource || isDes)
                return;

            curLinkID = undefined;
            switch (type) {
                case 'line':
                    if (param.data.status == 0)
                        return;

                    $('#linkGroup').hide();
                    $('#centerTipName').show();

                    curLinkID = param.data.id;

                    $('#centerTipName')[0].textContent = param.name;

                    $('.centerTip').show();
                    break;

                default:
                    break;
            }

            setByLink();
        };

        function setByLink() {
            if (curLinkID != undefined && curLinkID != "") {
                $("#tipInfo").show();
                //setLengend();

                setLinkInfo();

                getDataTypeInfoForLink();
            }
            else {
                $("#tipInfo").hide();
            }
        }

        function setLinkInfo() {
            var line = undefined;
            for (var i = 0; i < mapOption.series[5].data.length; ++i) {
                line = mapOption.series[5].data[i];
                if (line[0].id == curLinkID) {
                    $("#sourceCenterName")[0].textContent = cityCenterDic[line[0].srcCenter];
                    $("#desCenterName")[0].textContent = cityCenterDic[line[0].tarCenter];
                    switch (line[0].value) {
                        case 1:
                            $("#radioC")[0].checked = true;
                            break;
                        case 2:
                            $("#radioB")[0].checked = true;
                            break;
                        case 3:
                            $("#radioA")[0].checked = true;
                            break;
                        default :
                            break;
                    }
                    if (line[0].status == 0)
                        linkStatusFor0();
                    if (line[0].status == 1)
                        linkStatusFor1();

                    break;
                }
            }
        }

        function setDataTypeInfos() {
            dataTypeChart = echarts.init(dataTypeLink);
            dataTypeChart.on('click', dataTypeChartClick);
            dataTypeOption.title.text = systemsArray[curSystemId].systemName + " 各个数据类型";
            dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
            dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
            colorList.splice(0, colorList.length);
            if (systemsArray[curSystemId].dataTypes.length % dataTypeCountsForPage > 0)
                dataTypePageCount = parseInt(systemsArray[curSystemId].dataTypes.length / dataTypeCountsForPage + 1);
            else
                dataTypePageCount = parseInt(systemsArray[curSystemId].dataTypes.length / dataTypeCountsForPage);
            curPageNum = 0;
            if (dataTypePageCount > 1) {
                $("#prev").hide();
                $("#next").show();
            } else {
                $("#prev").hide();
                $("#next").hide();
            }

            if (systemsArray[curSystemId].dataTypes.length == 1) {
                dataTypeOption.series[0].barWidth = 80;
            } else if (dataTypePageCount > 1 || systemsArray[curSystemId].dataTypes.length == dataTypeCountsForPage) {
                dataTypeOption.series[0].barWidth = 50;
            } else {
                dataTypeOption.series[0].barWidth = 60;
            }

            for (var i = 0; i < systemsArray[curSystemId].dataTypes.length && i < dataTypeCountsForPage; ++i) {
                if (systemsArray[curSystemId].dataTypes[i].status == 0) {
                    colorList.push(greenColorStr);
                } else if (systemsArray[curSystemId].dataTypes[i].status == 1) {
                    colorList.push(redColorStr);
                } else if (systemsArray[curSystemId].dataTypes[i].status == 2) {
                    colorList.push(lightGreyColorStr);
                }
                dataTypeOption.xAxis[0].data.push(systemsArray[curSystemId].dataTypes[i].dataTypeName);
                dataTypeOption.series[0].data.push(systemsArray[curSystemId].dataTypes[i].dataCount);
            }
            dataTypeChart.setOption(dataTypeOption);
        }

        function initDataTypeInfo() {
            $('#curDataType')[0].textContent = "";// + " 系统下各个数据类型数据量";
            $('#dataTypeCount')[0].textContent = "";
            $('#dataTypeState')[0].textContent = "";
            curDataTypeId = -1;
            curDataTypeIndex = -1;
            $("#btn-getdata").show();
        }

        function getDataTypeInfoForLink() {
            showLoader();
            $.post('/datamanage/datalink/GetConnectionByID', {
                "connectID": curLinkID
            }).done(function (res) {
                hideLoader();
                var data = JSON.parse(res);
                if (data.code == 0) {
                    console.log("GetConnectionByID", data);
                    systemsArray = new Array();
                    var systemId;
                    for (var i = 0; i < data.data.dataTypes.length; ++i) {
                        systemId = data.data.dataTypes[i].systemId;
                        systemDic[systemId] = data.data.dataTypes[i].systemName;
                        dataTypeDic[data.data.dataTypes[i].dataTypeId] = data.data.dataTypes[i].dataTypeDisplayName;
                        if (systemsArray[systemId] == undefined) {
                            systemsArray[systemId] = new Object({
                                "systemName": data.data.dataTypes[i].systemName,
                                "dataTypes": []
                            });

                            systemsArray[systemId].dataTypes.push(new Object({
                                "dataTypeId": data.data.dataTypes[i].dataTypeId,
                                "dataTypeName": data.data.dataTypes[i].dataTypeDisplayName,
                                "dataCount": data.data.dataTypes[i].dataCount,
                                "dataTypeLevel": data.data.dataTypes[i].dataTypeLevel,
                                "status": 0,
                            }));
                        }
                        else {
                            systemsArray[systemId].dataTypes.push(new Object({
                                "dataTypeId": data.data.dataTypes[i].dataTypeId,
                                "dataTypeName": data.data.dataTypes[i].dataTypeDisplayName,
                                "dataCount": data.data.dataTypes[i].dataCount,
                                "dataTypeLevel": data.data.dataTypes[i].dataTypeLevel,
                                "status": 0,
                            }));
                        }
                    }
                    //console.log("systemsArray", systemsArray);

                    setLengend();
                    getTaskInfoForLink();
                }
                else {
                    Notify.show({
                        title: "获取数据链信息失败！",
                        type: "error"
                    });
                    console.log("GetConnectionByID", data.message);
                }
            });
        }

        function getTaskInfoForLink() {
            $.post('/datamanage/datalink/GetAllTaskByConnection', {
                "connectID": curLinkID
            }).done(function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    console.log("suc", data);
                    var taskTable = document.getElementById("taskTable");
                    for (var i = taskTable.rows.length - 1; i >= 1; --i)
                        taskTable.deleteRow(i);

                    var runningTaskNum = 0;

                    for (var i = 0; i < data.data.taskInfos.length; ++i) {
                        if (data.data.taskInfos[i].taskType == 2) {
                            curRow = taskTable.insertRow();
                            cell = curRow.insertCell();
                            cell.innerHTML = data.data.taskInfos[i].taskName;
                            cell.classList.add('taskClass');

                            cell = curRow.insertCell();
                            if (data.data.taskInfos[i].taskStatus == 1) {
                                cell.innerHTML = "运行中";
                                cell.classList.add('taskRunning');
                                runningTaskNum++;
                            } else if (data.data.taskInfos[i].taskStatus == 0) {
                                cell.innerHTML = "已停止";
                                cell.classList.add('taskStop');
                            } else {
                                cell.innerHTML = "错误";
                                cell.classList.add('taskClass');
                            }

                            cell = curRow.insertCell();
                            cell.innerHTML = systemDic[data.data.taskInfos[i].systemId];
                            cell.classList.add('taskClass');

                            cell = curRow.insertCell();
                            cell.innerHTML = dataTypeDic[data.data.taskInfos[i].dataTypeId];
                            cell.classList.add('taskClass');

                            cell = curRow.insertCell();
                            cell.innerHTML = data.data.taskInfos[i].recordCount;
                            cell.classList.add('taskNone');

                            cell = curRow.insertCell();
                            cell.innerHTML = data.data.taskInfos[i].connectId;
                            cell.classList.add('taskNone');

                            cell = curRow.insertCell();
                            cell.innerHTML = data.data.taskInfos[i].systemId;
                            cell.classList.add('taskNone');

                            cell = curRow.insertCell();
                            cell.innerHTML = data.data.taskInfos[i].srcSystemId;
                            cell.classList.add('taskNone');

                            cell = curRow.insertCell();
                            cell.innerHTML = data.data.taskInfos[i].taskId;
                            cell.classList.add('taskNone');

                            if (systemsArray[data.data.taskInfos[i].systemId] != undefined)
                            //if(data.data.taskInfos[i].srcSystemId == curSystemId)
                            {
                                for (var j = 0; j < systemsArray[data.data.taskInfos[i].systemId].dataTypes.length; ++j) {
                                    if (data.data.taskInfos[i].dataTypeId == systemsArray[data.data.taskInfos[i].systemId].dataTypes[j].dataTypeId) {
                                        systemsArray[data.data.taskInfos[i].systemId].dataTypes[j].status = 1;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (runningTaskNum <= 0) {
                        //没有运行中的任务
                        optDataForLink = optDataForMap.getOptionForLink();
                        optDataForLink.series[0].data[0].value = 0;
                        linkChart.setOption(optDataForLink);
                        clearInterval(timeTicket);
                    }
                    else {
                        optDataForLink = optDataForMap.getOptionForLink();
                        linkChart.setOption(optDataForLink);
                        clearInterval(timeTicket);
                        timeTicket = setInterval(function () {
                            var random = Math.random();
                            optDataForLink.series[0].data[0].value = (2.5 + (random.toFixed(2) - 0)).toFixed(2);//*10).toFixed(2) - 0;
                            //console.log(optDataForLink.series[0].data[0].value);
                            linkChart.setOption(optDataForLink);
                        }, 5000);
                    }

                    initDataTypeChart(curSystemId);
                }
                else {
                    Notify.show({
                        title: "获取该数据链任务信息失败！",
                        type: "error"
                    });
                    console.log("GetAllTaskByConnection", data.message);
                }
            });
        }

        function linkStatusFor0() {
            $("#btn-Break").hide();
            $("#btn-Start").hide();
            $("#btn-getdata").hide();
            $("#linkState")[0].textContent = '已断开';

            linkChart = echarts.init(domLink);
            optDataForLink = optDataForMap.getOptionForLink();
            optDataForLink.series[0].data[0].value = 0;
            linkChart.setOption(optDataForLink);
            clearInterval(timeTicket);
        }

        function linkStatusFor1() {
            $("#btn-Break").show();
            $("#btn-Start").hide();
            $("#btn-getdata").show();
            $("#linkState")[0].textContent = '运行中';

            linkChart = echarts.init(domLink);
            optDataForLink = optDataForMap.getOptionForLink();
            linkChart.setOption(optDataForLink);
            clearInterval(timeTicket);
            timeTicket = setInterval(function () {
                var random = Math.random();
                optDataForLink.series[0].data[0].value = (2.5 + (random.toFixed(2) - 0)).toFixed(2);//*10).toFixed(2) - 0;
                //console.log(optDataForLink.series[0].data[0].value);
                linkChart.setOption(optDataForLink);
            }, 5000);
        }

        function setLengend() {
            //systemsArray = optDataForMap.getSysArray();
            var htmlStr = '';
            var first = true;
            var firstSystemId = -1;
            for (var i = 0; i < systemsArray.length; ++i) {
                if (systemsArray[i] != undefined) {
                    if (first) {
                        firstSystemId = i;
                        first = false;
                        htmlStr += '<div class="checkbox-custom fill checkbox-info" style="margin-bottom: 5px;"> <input checked type="radio" name="systemElem" id="'
                            + i + '" value="' + i + '"> <label for="'
                            + i + '"' + ' style="margin-top:30px; margin-left: -15px;margin-right: 20px;font-weight:normal;c margin-bottom: 5px;">' + systemsArray[i].systemName + ' </label> </div>'
                    }
                    else
                        htmlStr += '<div class="checkbox-custom fill checkbox-info" style="margin-bottom: 5px;"> <input type="radio" name="systemElem" id="'
                            + i + '" value="' + i + '"> <label for="'
                            + i + '"' + ' style="margin-left: -15px;margin-right: 20px;font-weight:normal;margin-bottom: 5px;">' + systemsArray[i].systemName + ' </label> </div>'
                }
            }

            document.getElementById("systems").innerHTML = htmlStr;

            $(".checkbox-info").click(function () {
                updateDataTypeChart($(this)[0]);
            });

            curSystemId = firstSystemId;

            initDataTypeChart(firstSystemId);
            initDataTypeInfo();
        }

        function initDataTypeChart(systemId) {
            if (curSystemId < 0)
                return;

            //initDataTypeInfo();
            curDataTypeIndex = 0;
            setDataTypeInfos();
        }

        function updateDataTypeChart(system) {
            curSystemId = system.childNodes[1].id;

            initDataTypeInfo();
            setDataTypeInfos();
        }

        function dataTypeChartClick(param) {
            curDataTypeIndex = curPageNum * dataTypeCountsForPage + param.dataIndex;
            $('#curDataType')[0].textContent = param.name;// + " 系统下各个数据类型数据量";
            $('#dataTypeCount')[0].textContent = systemsArray[curSystemId].dataTypes[curDataTypeIndex].dataCount;
            curDataTypeId = systemsArray[curSystemId].dataTypes[curDataTypeIndex].dataTypeId;

            if (systemsArray[curSystemId].dataTypes[curDataTypeIndex].status == 0) {
                $('#dataTypeState')[0].textContent = "未获取";
                $('#btn-getdata').show();
            }
            else if (systemsArray[curSystemId].dataTypes[curDataTypeIndex].status == 1) {
                $('#dataTypeState')[0].textContent = "已有任务";
                $('#btn-getdata').show();
            } else if (systemsArray[curSystemId].dataTypes[curDataTypeIndex].status == 2) {
                $('#dataTypeState')[0].textContent = "已停止";
                $('#btn-getdata').show();
            } else {
                $('#dataTypeState')[0].textContent = "错误";
                $('#btn-getdata').show();
            }
        }

        function prePageClick() {
            if (curPageNum > 0) {
                curPageNum--;
                setDataTypeInfoForPage();

                if (curPageNum > 0) {
                    $("#prev").show();
                } else {
                    $("#prev").hide();
                }

                if (curPageNum + 1 < dataTypePageCount) {
                    $("#next").show();
                } else {
                    $("#next").hide();
                }
            }
        }

        function nextPageClick() {
            if (curPageNum + 1 < dataTypePageCount) {
                curPageNum++;
                setDataTypeInfoForPage();

                if (curPageNum > 0) {
                    $("#prev").show();
                } else {
                    $("#prev").hide();
                }
                if (curPageNum + 1 < dataTypePageCount) {
                    $("#next").show();
                } else {
                    $("#next").hide();
                }
            }
        }

        function setDataTypeInfoForPage() {
            dataTypeChart = echarts.init(dataTypeLink);
            dataTypeChart.on('click', dataTypeChartClick);
            dataTypeOption.title.text = systemsArray[curSystemId].systemName + " 各个数据类型";
            dataTypeOption.xAxis[0].data.splice(0, dataTypeOption.xAxis[0].data.length);
            dataTypeOption.series[0].data.splice(0, dataTypeOption.series[0].data.length);
            colorList.splice(0, colorList.length);
            for (var i = 0; (i + curPageNum * dataTypeCountsForPage) < systemsArray[curSystemId].dataTypes.length && i < dataTypeCountsForPage; ++i) {
                if (systemsArray[curSystemId].dataTypes[i + curPageNum * dataTypeCountsForPage].status == 0) {
                    colorList.push(greenColorStr);
                } else if (systemsArray[curSystemId].dataTypes[i + curPageNum * dataTypeCountsForPage].status == 1) {
                    colorList.push(redColorStr);
                } else if (systemsArray[curSystemId].dataTypes[i + curPageNum * dataTypeCountsForPage].status == 2) {
                    colorList.push(lightGreyColorStr);
                }
                dataTypeOption.xAxis[0].data.push(systemsArray[curSystemId].dataTypes[i + curPageNum * dataTypeCountsForPage].dataTypeName);
                dataTypeOption.series[0].data.push(systemsArray[curSystemId].dataTypes[i + curPageNum * dataTypeCountsForPage].dataCount);
            }
            dataTypeChart.setOption(dataTypeOption);
        }

        function hideCreateLinkBtn() {
            isSource = false;
            isDes = false;
            $("#createLinkTip").hide();
        }

        function closeLink() {
            $.post('/datamanage/datalink/CloseConnection', {
                "connectID": curLinkID
            }).done(function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    var line;
                    for (var i = 0; i < mapOption.series[5].data.length; ++i) {
                        line = mapOption.series[5].data[i];
                        if (line[0].id == curLinkID) {
                            mapOption.series[5].data[i][0].status = 0;
                            break;
                        }
                    }

                    for (var i = 0; i < mapOption.series[1].data.length; ++i) {
                        line = mapOption.series[1].data[i];
                        if (line[0].id == curLinkID) {
                            mapOption.series[1].data.splice(i, 1);

                            break;
                        }
                    }
                    for (var i = 0; i < mapOption.series[2].data.length; ++i) {
                        line = mapOption.series[2].data[i];
                        if (line[0].id == curLinkID) {
                            mapOption.series[2].data.splice(i, 1);

                            break;
                        }
                    }
                    mapChart.setOption(mapOption);
                    setLinkInfo();
                    //setByLink();
                    //delLink();

                    initDataTypeInfo();
                    dataTypeChart = echarts.init(dataTypeLink);
                    dataTypeChart.on('click', dataTypeChartClick);
                    colorList.splice(0, colorList.length);
                    for (var i = 0; i < systemsArray.length; ++i) {
                        if (systemsArray[i] != undefined) {
                            for (var j = 0; j < systemsArray[i].dataTypes.length; ++j) {
                                systemsArray[i].dataTypes[j].status = 2;
                                colorList.push(lightGreyColorStr);
                            }
                        }
                    }

                    dataTypeChart.setOption(dataTypeOption);

                    var loadTaskTable = document.getElementById("loadTaskTable");
                    for (var i = loadTaskTable.rows.length - 1; i >= 1; --i) {
                        loadTaskTable.rows[i].childNodes[1].textContent = '已停止';
                        loadTaskTable.rows[i].childNodes[1].classList.remove('taskRunning');
                        loadTaskTable.rows[i].childNodes[1].classList.add('taskStop');
                    }
                    Notify.show({
                        title: " 关闭数据链成功！",
                        type: "success"
                    });
                }
                else {
                    Notify.show({
                        title: "关闭数据链失败！",
                        type: "error"
                    });
                    console.log("CloseConnection", data.message);
                    //alert(data.message);
                }
            });
        }

        function taskTableClick() {
            curRowIndex = $(this).parent().children('tr').index($(this));
            if (curRowIndex > 0) {
                //$("#conditionsTable tbody tr td").removeClass("conditonSelected");
                for (var i = 0; i < $("#taskTable")[0].rows.length; ++i) {
                    $("#taskTable")[0].rows[i].classList.remove('taskSelected');
                }
                var tr = $("#taskTable")[0].rows[curRowIndex].classList;
                curTaskId = $("#taskTable")[0].rows[curRowIndex].cells[5].textContent;
                tr.add('taskSelected');
            }
        }

        function beginTask() {
            if (curRowIndex == undefined || curRowIndex <= 0 || curRowIndex >= $("#taskTable")[0].rows.length)
                return;

            $.post('/datamanage/datalink/ModifyTaskState', {
                "connectID": $("#taskTable")[0].rows[curRowIndex].childNodes[5].textContent,
                "tarSystemId": $("#taskTable")[0].rows[curRowIndex].childNodes[6].textContent,
                "srcSystemId": $("#taskTable")[0].rows[curRowIndex].childNodes[7].textContent,
                "taskId": $("#taskTable")[0].rows[curRowIndex].childNodes[8].textContent,
                "TaskStatus": 1
            }).done(function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    console.log(data.data);
                    refreshTask();
                }
                else {
                    console.log("ModifyTaskState", data);
                    //alert(data.message);
                }
            });
        }

        function stopTask() {
            if (curRowIndex == undefined || curRowIndex <= 0 || curRowIndex >= $("#taskTable")[0].rows.length)
                return;

            $.post('/datamanage/datalink/ModifyTaskState', {
                "connectID": $("#taskTable")[0].rows[curRowIndex].childNodes[5].textContent,
                "tarSystemId": $("#taskTable")[0].rows[curRowIndex].childNodes[6].textContent,
                "srcSystemId": $("#taskTable")[0].rows[curRowIndex].childNodes[7].textContent,
                "taskId": $("#taskTable")[0].rows[curRowIndex].childNodes[8].textContent,
                "TaskStatus": 0
            }).done(function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    console.log(data.data);
                    refreshTask();
                }
                else {
                    console.log("ModifyTaskState", data);
                    //alert(data.message);
                }
            });
        }

    }
);
