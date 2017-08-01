/**
 * Created by songqiankun on 2016/11/24.
 */
require([
        '../../../config',
        '../module/taishi_chart2',
        '../module/taishi_map',
        '../module/dlg'
    ],
    function (config, taishi_chart2, tashi_map, dialog) {
        var draw, mapControl, dlg;
        var serviceRoot = config.ServiceRoot;
        var lastIndex;
        var traces;
        var currentCategory = '0';
        var relationData = null;
        draw = taishi_chart2.getDraw();
        mapControl = tashi_map.getmap();
        dlg = dialog.getDlg();

        function init() {
            mapControl.Init(config.MapServer);



            draw.barCallback = function (category) {
                if (category === '全部') {
                    category = '0';
                }
                currentCategory = category;
                console.log(currentCategory);

                setActivityBar(lastIndex, currentCategory);
            };

            /**
             * 根据数据动态添加柱状图的下钻控制
             */
            $.getJSON(serviceRoot + 'getStaticFirstLevellegend', function (data) {
                console.log('Bar first legend data', data);
                draw.drawBarCon(data);
                $(".bar-select").click(function () {
                    draw.barClick();
                });
            });

            $(".relation-select").click(function () {
                draw.relationCilck();
            }); //gai

            // 初始化时间线-人立方
            dlg.Init();

            // 获取全体人关系数据
            $.getJSON(serviceRoot + 'getAllRelationship', function (data) {
                if (relationData === null) {
                    relationData = data;
                    if (lastIndex === "0" || lastIndex === "-1") {
                        draw.drawForce(relationData);
                    }
                }
            });

            draw.opendlgdiv = openDlg;
            draw.openOneDlgDiv = openOneTreeDlg;

            $.getJSON(serviceRoot + 'getalltargetstrace', function (data) {
                console.log('getalltargetstrace');
                console.log(data);
                traces = data;

                setInterval(function () {
                    $.getJSON(serviceRoot + 'getselectedtarget', function (data) {

                        console.log('getselectedtarget');
                        console.log(data);

                        if (data.targetid === lastIndex) return;

                        if (data.targetid === '-1') {
                            lastIndex = '-1';

                            relationData == null;
                            $.getJSON(serviceRoot + 'getAllRelationship', function (data) {
                                relationData = data;
                                if (lastIndex === "0" || lastIndex === "-1") {
                                    draw.drawForce(relationData);
                                }
                            });

                            $.getJSON(serviceRoot + 'getalltargetstrace', function (data) {
                                console.log('getalltargetstrace');
                                console.log(data);

                                traces = data;
                            });
                            $.get(serviceRoot + 'setselectedtarget', {
                                targetid: {
                                    targetid: '0',
                                    state: ''
                                }
                            });

                            return;
                        }

                        lastIndex = data.targetid;
                        console.log("轮询id:" + lastIndex);
                        setRadar(lastIndex, data.state);
                        setActivityBar(lastIndex, currentCategory);
                        try {
                            setRelationship(lastIndex);
                        } catch (e) {
                            console.log(e);
                        }
                        setPicture(lastIndex);
                    });
                }, 1000);
            });
        }

        function openDlg(id) {

            $.getJSON(serviceRoot + 'gettargetthreateninfo?targetid=' + id, function (data) {
                var timelineData = data;
                $.getJSON(serviceRoot + "gettargetinfobytargetid", {
                    targetid: id
                }, function (d) {
                    var type = 1;
                    dlg.addtimeline(d.cardid, timelineData, type);
                    dlg.Open();
                });
            });
        }

        function openOneTreeDlg(nodeId, nodeType) {
            var timelineData = [];
            dlg.addtimeline(nodeId, timelineData, nodeType);
            dlg.Open();
        }

        function setPicture(id) {
            switch (id) {
                case "1530488":
                    $("#map-div").css("visibility", "hidden");
                    $("#fourImg").attr("src", "./img/1530488.png");
                    $("#fourImg").css("visibility", "visible");
                    break;
                case "1530498":
                    $("#map-div").css("visibility", "hidden");
                    $("#fourImg").attr("src", "./img/1530498.png");
                    $("#fourImg").css("visibility", "visible");
                    break;
                case "1530512":
                    $("#map-div").css("visibility", "hidden");
                    $("#fourImg").attr("src", "./img/1530512.png");
                    $("#fourImg").css("visibility", "visible");
                    break;
                case "1530522":
                    $("#map-div").css("visibility", "hidden");
                    $("#fourImg").attr("src", "./img/1530522.png");
                    $("#fourImg").css("visibility", "visible");
                    break;
                default:
                    $("#map-div").css("visibility", "visible");
                    $("#fourImg").css("visibility", "hidden");
                    setMapData(id);
            }
        }

        function setMapData(data) {
            if (traces === undefined) return;
            mapControl.ClearMap();

            if (data === '0') {
                mapControl.ShowData(traces, function (id) {
                    openDlg(id);
                });
            } else {
                traces.forEach(function (element) {
                    if (element.userid === data) {
                        mapControl.ShowData([element], function (id) {
                            openDlg(id);
                        });
                        return;
                    }
                }, this);

                // 测试用，待删除
                // mapControl.ShowData([traces[Math.floor((traces.length - 1) * Math.random())]]);
            }
        }

        function setActivityBar(id, category) {
            $.getJSON(serviceRoot + 'gettargetsstatic', {
                    targetid: id,
                    category: category
                },
                function (data) {
                    console.log('gettargetsstatic');
                    console.log(data);

                    draw.drawBar(data);

                });
        }

        function setRadar(id, state) {
            $.getJSON(serviceRoot + 'gettargetsradar', {
                    targetid: id
                },
                function (data) {
                    console.log('gettargetsradar');
                    console.log(data);

                    draw.drawRadar(data, state);

                });
        }

        function setRelationship(id) {
            if (id === '0') {
                console.log("all people data");
                if (relationData === null) {
                    return;
                }
                if (lastIndex === "0") {
                    draw.drawForce(relationData);
                }
            } else {
                console.log("one people data" + id);
                $.getJSON(serviceRoot + 'getTargetRelationship', {
                        targetid: id
                    },
                    function (data) {
                        console.log('getTargetRelationship');
                        console.log(data);

                        draw.drawTree(data);
                    });
            }

        }
        init();
    }
);