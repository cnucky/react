/**
 * Created by songqiankun on 2016/12/10.
 */

require([
    '../../../config',
    '../module/relation_filterControl',
    '../module/taishi_map',
    '../module/taishi_relation',
    '../module/dlg-rt'
], function (config, relation_filterControl, taishi_map, taishi_relation, dialog) {
    var filterControl = relation_filterControl.getFilterCon();
    var mapControl = taishi_map.getmap();
    var relationDraw = taishi_relation.getDraw();
    var dlg = dialog.getDlg();

    var people = [{
        "ename": "I-HUNG",
        "cname": "陈奕宏",
        "gender": "男",
        "birth": "1983-05-03",
        "id": "0691073402",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0726",
        "checkintime": "2016-08-01 10:18:00",
        "checkouttime": "2016-08-06 08:01:00",
        "activity": ["8月6日离境至台湾", "8月4日乘高铁去往天津", "之后未入境"],
        "lat": "39.91923256",
        "lng": "116.4429116"
    }, {
        "ename": "FENG-MING",
        "cname": "凃峰明",
        "gender": "男",
        "birth": "1974-10-05",
        "id": "1033100201",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0610",
        "checkintime": "2016-08-01 10:19:00",
        "checkouttime": "2016-08-06 08:56:00",
        "activity": ["8月6日离境至台湾", "8月4日乘高铁去往天津", "之后未入境"],
        "lat": "39.91918319",
        "lng": "116.4428258"
    }, {
        "ename": "WEI-HSIANG",
        "cname": "方韦翔",
        "gender": "男",
        "birth": "2000-05-08",
        "id": "1035556301",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0726",
        "checkintime": "2016-08-01 10:25:00",
        "checkouttime": "2016-08-06 08:01:00",
        "activity": ["8月6日离境至台湾", "8月4日乘高铁去往天津", "之后未入境"],
        "lat": "39.92021997",
        "lng": "116.4468384"
    }, {
        "ename": "HAO-YUAN",
        "cname": "熊皓元",
        "gender": "男",
        "birth": "1999-12-29",
        "id": "1034858101",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0721",
        "checkintime": "2016-08-01 10:28:00",
        "checkouttime": "2016-08-06 08:46:00",
        "activity": ["8月6日CX331出境", "8月4日火车C2039前往天津", "之后未入境"],
        "lat": "39.92013768",
        "lng": "116.4470315"
    }, {
        "ename": "SHIH-HUNG",
        "cname": "刘时宏",
        "gender": "男",
        "birth": "1975-01-29",
        "id": "0834573602",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0616",
        "checkintime": "2016-08-01 10:28:00",
        "checkouttime": "2016-08-06 08:48:00",
        "activity": ["8月6日CX331出境", "8月4日火车C2039前往天津", "之后未入境"],
        "lat": "39.91651711",
        "lng": "116.4428902"
    }, {
        "ename": "HSIANG-HO",
        "cname": "徐祥贺",
        "gender": "男",
        "birth": "1985-07-13",
        "id": "1032477501",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0716",
        "checkintime": "2016-08-01 10:27:00",
        "checkouttime": "2016-08-06 08:20:00",
        "activity": ["8月6日CX331出境", "8月4日火车C2039前往天津", "之后未入境"],
        "lat": "39.91618795",
        "lng": "116.4435768"
    }, {
        "ename": "JUI-SHENG",
        "cname": "方瑞声",
        "gender": "男",
        "birth": "1980-12-12",
        "id": "1005979101",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0715",
        "checkintime": "2016-08-01 10:29:00",
        "checkouttime": "2016-08-06 08:00:00",
        "activity": ["8月6日CX331出境", "8月4日火车C2039前往天津", "之后未入境"],
        "lat": "39.93909322",
        "lng": "116.4863205"
    }, {
        "ename": "HSIU-JUNG",
        "cname": "钟秀荣",
        "gender": "男",
        "birth": "1946-01-04",
        "id": "0229722804",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0717",
        "checkintime": "2016-08-01 10:29:00",
        "checkouttime": "2016-08-06 08:46:00",
        "activity": ["8月6日CX331出境", "", "之后未入境"],
        "lat": "39.94172552",
        "lng": "116.4813423"
    }, {
        "ename": "CHING-PIAO",
        "cname": "林清标",
        "gender": "男",
        "birth": "1952-05-20",
        "id": "0649707002",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0708",
        "checkintime": "2016-08-01 10:30:00",
        "checkouttime": "2016-08-06 08:54:00",
        "activity": ["8月6日CX331出境", "", "之后未入境"],
        "lat": "39.93843513",
        "lng": "116.4835739"
    }, {
        "ename": "CHIA-HUNG",
        "cname": "马嘉宏",
        "gender": "男",
        "birth": "1984-04-09",
        "id": "0878032001",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0721",
        "checkintime": "2016-08-01 10:30:00",
        "checkouttime": "2016-08-06 08:46:00",
        "activity": ["8月6日CX331出境", "", "之后未入境"],
        "lat": "39.9077611",
        "lng": "116.4583397"
    }, {
        "ename": "YUAN-SHENG",
        "cname": "杨渊盛",
        "gender": "男",
        "birth": "1975-07-09",
        "id": "0951717701",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0720",
        "checkintime": "2016-08-01 10:31:00",
        "checkouttime": "2016-08-06 08:43:00",
        "activity": ["8月6日CX331出境", "", "之后未入境"],
        "lat": "39.90749774",
        "lng": "116.4616013"
    }, {
        "ename": "YU-HSIANG",
        "cname": "熊昱翔",
        "gender": "男",
        "birth": "1971-03-27",
        "id": "0878031501",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0722",
        "checkintime": "2016-08-01 10:31:00",
        "checkouttime": "2016-08-06 08:41:00",
        "activity": ["8月6日CX331出境", "", "之后未入境"],
        "lat": "39.89933321",
        "lng": "116.4080429"
    }, {
        "ename": "CHIA CHING",
        "cname": "廖家庆",
        "gender": "男",
        "birth": "1971-11-01",
        "id": "0557211203",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "1509",
        "checkintime": "2016-08-02 01:46:00",
        "checkouttime": "2016-08-06 10:49:00",
        "activity": ["8月6日BR715出境", "", "之后未入境"],
        "lat": "39.92553528",
        "lng": "116.3967133"
    }, {
        "ename": "HOU-YU",
        "cname": "陈厚宇",
        "gender": "男",
        "birth": "1963-08-31",
        "id": "0649478102",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0729",
        "checkintime": "2016-08-01 10:32:00",
        "checkouttime": "2016-08-06 08:41:00",
        "activity": ["8月6日CX331出境", "", "之后未入境"],
        "lat": "39.92514035",
        "lng": "116.4085579"
    }, {
        "ename": "YUAN-LIN",
        "cname": "廖元琳",
        "gender": "男",
        "birth": "1970-03-01",
        "id": "0878032201",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0728",
        "checkintime": "2016-08-01 10:32:00",
        "checkouttime": "2016-08-06 08:20:00",
        "activity": ["8月6日CX331出境", "", "之后未入境"],
        "lat": "39.8801032",
        "lng": "116.4806557"
    }, {
        "ename": "KUAN LIN",
        "cname": "高冠璘",
        "gender": "男",
        "birth": "1984-02-04",
        "id": "0594750504",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "1521",
        "checkintime": "2016-08-02 01:46:00",
        "checkouttime": "2016-08-06 11:00:00",
        "activity": ["8月6日BR715出境", "", "8月31日BR797由白云出入境站入境目前未出境"],
        "lat": "39.89017987",
        "lng": "116.4190292"
    }, {
        "ename": "PEI-AN",
        "cname": "胡培安",
        "gender": "男",
        "birth": "1971-06-07",
        "id": "0538941203",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "1023",
        "checkintime": "2016-08-02 01:47:00",
        "checkouttime": "2016-08-06 11:05:00",
        "activity": ["8月6日BR715出境", "", "之后未入境"],
        "lat": "39.9074319",
        "lng": "116.4938736"
    }, {
        "ename": "TE-HSI",
        "cname": "陈德喜",
        "gender": "男",
        "birth": "1953-07-18",
        "id": "0005058103",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0618",
        "checkintime": "2016-08-01 10:17:00",
        "checkouttime": "2016-08-06 08:38:00",
        "activity": ["8月6日CX331出境", "8月4日火车C2039前往天津", "之后未入境"],
        "lat": "39.92438339",
        "lng": "116.4461946"
    }, {
        "ename": "YUNG-CHEN",
        "cname": "黄咏晨",
        "gender": "男",
        "birth": "1989-08-17",
        "id": "1034858301",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0718",
        "checkintime": "2016-08-01 10:18:00",
        "checkouttime": "2016-08-06 08:20:00",
        "activity": ["8月6日CX331出境", "8月4日火车C2039前往天津", "之后未入境"],
        "lat": "39.9315248",
        "lng": "116.4499283"
    }, {
        "ename": "CHUN-TSE",
        "cname": "陈畯泽",
        "gender": "男",
        "birth": "1975-09-10",
        "id": "0617630503",
        "nationality": "中国台湾",
        "hotel": "日坛国际酒店",
        "roomnum": "0701",
        "checkintime": "2016-08-01 10:18:00",
        "checkouttime": "2016-08-06 08:42:00",
        "activity": ["8月6日CX331出境", "8月4日火车C2039前往天津", "之后未入境"],
        "lat": "39.8841538",
        "lng": "116.4398432"
    }];

    var testData = [{
            "title": "基本属性",
            "subtitle": [{
                "name": '国籍',
                "type": "input"
            }, {
                "name": '性别',
                "type": "select",
                "valueList": ["男", "女"]
            }, {
                "name": '年龄',
                "type": "inputIntRange"
            }]
        }, {
            "title": "住宿行为",
            "subtitle": [{
                "name": '酒店',
                "type": "input"
            }, {
                "name": '时间',
                "type": "inputDateRange"
            }]
        }, {
            "title": "轨迹特征",
            "subtitle": [{
                "name": '入境时间',
                "type": "input"
            }, {
                "name": '出境时间',
                "type": "input"
            }, {
                "name": '境内出现时间',
                "type": "input"
            }, {
                "name": '境内出现地点',
                "type": "input"
            }]
        }

    ];

    var timelineData = {
        data: [{
            id: "0691073402",
            line: [{
                type: "Globe",
                content: "离境至台湾",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:01"
            }, {
                type: "Globe",
                content: "乘高铁去往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:18"
            }]
        }, {
            id: "1033100201",
            line: [{
                type: "Globe",
                content: "离境至台湾",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:56"
            }, {
                type: "Globe",
                content: "乘高铁去往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:19:00"
            }]
        }, {
            id: "1035556301",
            line: [{
                type: "Globe",
                content: "离境至台湾",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:01"
            }, {
                type: "Globe",
                content: "乘高铁去往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:25"
            }]
        }, {
            id: "1034858101",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:46"
            }, {
                type: "Globe",
                content: "火车C2039前往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:28"
            }]
        }, {
            id: "0834573602",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:48"
            }, {
                type: "Globe",
                content: "火车C2039前往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:28"
            }]
        }, {
            id: "1032477501",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:20"
            }, {
                type: "Globe",
                content: "火车C2039前往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:27"
            }]
        }, {
            id: "1005979101",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:00"
            }, {
                type: "Globe",
                content: "火车C2039前往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:29"
            }]
        }, {
            id: "0229722804",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:46"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:29"
            }]
        }, {
            id: "0649707002",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:54"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:30"
            }]
        }, {
            id: "0878032001",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:46"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:30"
            }]
        }, {
            id: "0951717701",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:43"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:31"
            }]
        }, {
            id: "0878031501",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:41"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:31"
            }]
        }, {
            id: "0557211203",
            line: [{
                type: "Globe",
                content: "BR715出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 10:49"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-02 01:46"
            }]
        }, {
            id: "0649478102",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:41"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:32"
            }]
        }, {
            id: "0878032201",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:20"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:32"
            }]
        }, {
            id: "0594750504",
            line: [{
                type: "Globe",
                content: "BR715出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 11:00"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-02 01:46"
            }]
        }, {
            id: "0538941203",
            line: [{
                type: "Globe",
                content: "BR715出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 11:05"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-02 01:47"
            }]
        }, {
            id: "0005058103",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:38"
            }, {
                type: "Globe",
                content: "火车C2039前往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:17"
            }]
        }, {
            id: "1034858301",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:20"
            }, {
                type: "Globe",
                content: "火车C2039前往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:18"
            }]
        }, {
            id: "0617630503",
            line: [{
                type: "Globe",
                content: "CX331出境",
                time: "2016-08-06"
            }, {
                type: "Dialogue",
                content: "离开酒店",
                time: "2016-08-06 08:42"
            }, {
                type: "Globe",
                content: "火车C2039前往天津",
                time: "2016-08-04"
            }, {
                type: "Dialogue",
                content: "入住酒店",
                time: "2016-08-01 10:18"
            }]
        } ],
        getData: function (ID) {
            //console.log(ID);
            var result = [];
            this.data.forEach(function (item) {
                //console.log(ID);
                if (item.id == ID) {
                    result = item.line;
                }
            });
            return result;
        }
    };

    relationDraw.buildGUI();

    function changeList(id) {
        var id = "#" + id;
        var h = Number($(id).text()) * 105;
        console.log(h);
        $(".list-div").animate({
            "scrollTop": h
        }, 500);
        $(id).parent(".list-item").click();
    }

    relationDraw.selectList = changeList;

    filterControl.CreateControl(testData, "options-content", function () {
        mapControl.InitCase(config.MapServer);
        relationDraw.initRelation();
        relationDraw.initList(people);
        $("#thumbprint").click();
        dlg.Init();
        $(".list-arrow").click(function () {
            var id = $(this).siblings(".list-id").attr("id");
            //console.log(id);
            //console.log(timelineData.getData(id));
            dlg.addtimeline(id, timelineData.getData(id));
            dlg.Open();
        });
        $(".list-item").click(relationDraw.listClick);
        mapControl.LoadCaseData(people, function (id) {
            changeList(id);
        });
    });

    $("#00001 li a").click(function (e) {
        e.stopPropagation();
        if (!$(this).parent('li').hasClass('selected')) {
            if ($(this).text() == '同行') {
                $("#relation-select").show();
            }
        } else {
            if ($(this).text() == '同行') {
                $("#relation-select").hide();
                // relationDraw.initRelation();
            }
        }
        $(this).parent('li').toggleClass('selected');
    });

    var flag = false;
    $(".search-div").click(function () {
        flag = !flag;
        if (flag) {
            $(".search-menu").css("visibility", "visible");
        } else if (!flag) {
            $(".search-menu").css("visibility", "hidden");
            $("#relation-select").css("display", "none");
        }

    });

    $("#relation-select-button").click(function () {
        var flag = true;
        if (["2016-01-01", "2016-1-1", "2016.01.01", "2016.1.1", "2016/01/01", "2016/1/1", "2016年01月01日", "2016年1月1日"].indexOf($("#relation-select-starttime").val()) < 0) {
            console.log($("#relation-select-starttime").val());
            flag = false;
        }
        if (["2016-11-30", "2016.11.30", "2016/11/30", "2016年11月30日"].indexOf($("#relation-select-endtime").val()) < 0) {
            console.log($("#relation-select-endtime").val());
            flag = false;
        }
        if ($("#relation-select-number").val() != "1") {
            console.log($("#relation-select-number").val());
            flag = false;
        }
        if (flag) {
            relationDraw.drawRelation();
            $("#relation-select").hide();
            $(".dropup").removeClass("open");
        }

    });
});