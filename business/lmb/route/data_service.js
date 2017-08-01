/**
 * Created by lijie on 2016/12/5.
 */
var fs = require("fs");
var path = require("path");

var dataservicelog4js = require('log4js');
dataservicelog4js.configure({
    appenders: [
        { type: "console" },
        { type: "file", filename: "/opt/log.log", category: "lmb-data_service" }
    ]
});
var logger = dataservicelog4js.getLogger("lmb-data_service");
logger.setLevel("INFO");

function Person(id, name, photo, nation, sex, birth, hasCaseProperty, cardid) {
    this.id = id;
    this.name = name;
    this.photo = photo;
    this.nation = nation;
    this.sex = sex;
    this.birth = birth;
    this.hasCaseProperty = hasCaseProperty;
    this.cardid = cardid;
}

//function Target(id, name, photo, nation, number, sex, age){
//    this.id = id;
//    this.name = name;
//    this.photo = photo;
//    this.nation = nation;
//    this.number = number;
//    this.sex = sex;
//    this.age = age;
//}

function ThreatenInfo() {
    this.rowKey = "";
    this.ruleId = "";
    this.subRuleId = "";
    this.capTime = "";
    this.processTime = Date.now;
    this.detail = "";
}

function TracePoint(lat, lon, time) {
    this.lat = lat;
    this.lon = lon;
    this.time = time;
}

function Trace(userid, username) {
    this.userid = userid;
    this.username = username;
}

//gettargetPhotoPath(null, null);

function gettargetPhotoPath(base64Data, targetId) {
    //var path = "D:\桌面\截图\捕获.PNG";
    var fs = require('fs');
    var originImgbase64 = base64Data;
    var imgBuffer = new Buffer(originImgbase64, 'base64');
    //var dir = path.resolve(__dirname,'..');
    //console.log("photo path is: " + dir);
    var dir = process.cwd() + '/_build/img/targetImages/';
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    } catch (err) {
        logger.error("文件存储失败", err);
        return false;
    }

    fs.writeFile(dir + targetId + ".png", originImgbase64, 'base64', function(err) {
        if (err) {
            logger.error("文件存储失败", err);
        }
    })

    // fs.exists("/com/bin/app-web/web_frame/_build/img/targetImages/", function(exists){
    // 	if(exists){
    // 		fs.writeFile("/com/bin/app-web/web_frame/_build/img/targetImages/"+targetId+".png", originImgbase64,'base64',function(err){
    // 			if(err){
    // 				logger.error("文件存储失败",err);
    // 			}
    // 			else{
    // 				return true;
    // 			}
    // 		});
    // 	}
    // 	else{
    // 		fs.mkdir("/com/bin/app-web/web_frame/_build/img/targetImages/",function(err){
    // 			if(err){
    // 				logger.error("创建目标头像文件夹失败",err);
    // 			}
    // 			else{
    // 				fs.writeFile("/com/bin/app-web/web_frame/_build/img/targetImages/"+targetId+".png", originImgbase64,'base64',function(err){
    // 					if(err){
    // 						logger.error("文件存储失败",err);
    // 					}
    // 					else{
    // 						return true;
    // 					}
    // 				});
    // 			}
    // 		});
    // 	}
    // })


}

function PersonPoint(personId, personName, isCenter, totalScore) {
    this.id = personId;
    this.name = personName;
    this.isCenter = isCenter;
    this.totalScore = totalScore;
}

function Edge(source, target) {
    this.source = source;
    this.target = target;
}

module.exports = function() {

    this.tagInfo = new Array();

    this.targetInfo = {};

    this.taskList = {};

    this.getTaskList = function() {
        var tasklist = new Array();
        for (i in this.taskList) {
            tasklist.push(this.taskList[i]);
        }
        return tasklist;
    }

    this.getTaskInfo = function(taskid) {
        return this.taskList[taskid];
    }


    this.getalltags = function() {
        return this.tagInfo;
    }

    this.getalltargets = function(taskid) {
        //logger.info("all targets :"+JSON.stringify(this.targetInfo));
        return this.targetInfo[taskid];
    }

    this.setTasks = function(data) {
        logger.info("setTasks parameter:" + JSON.stringify(data));

        for (var i = 0; i < data.length; i++) {
            var taskid = data[i].id;
            this.taskList[taskid] = undefined;
            this.taskList[taskid] = { taskId: data[i].id, taskName: data[i].name, target: data[i].info.target, tag: data[i].info.tag };
        }
        logger.info("settasklist result :" + JSON.stringify(this.taskList));
    }

    this.setlegends = function(taskid, legends) {
        logger.info("setTasks legends parameter. taskid: " + taskid + " legends: " + JSON.stringify(legends));
        this.taskList[taskid]["legend"] = legends;
    }

    this.getlegend = function(taskid, legendName) {
        logger.info("get legend :" + legendName + " from task" + taskid);
        return this.taskList[taskid]["legend"][legendName];
    }

    this.setTargets = function(taskid, targets) {
        var targetList = new Array();
        logger.info("targets[" + taskid + "] is" + JSON.stringify(targets[taskid]));
        for (var i = 0; i < targets.length; i++) {
            var id = targets[i].targetId;
            var name;
            var nation;
            var sex;
            var birth;
            var photo;
            var hasCaseProperty;
            var cardid;
            for (var j = 0; j < targets[i].properties.length; j++) {
                if (targets[i].properties[j].propertyName == "对象姓名") {
                    name = targets[i].properties[j].propertyValue;
                }
                if (targets[i].properties[j].propertyName == "民族") {
                    nation = targets[i].properties[j].propertyValue;
                }
                if (targets[i].properties[j].propertyName == "性别") {
                    sex = targets[i].properties[j].propertyValue;
                }
                if (targets[i].properties[j].propertyName == "出生年月") {
                    birth = targets[i].properties[j].propertyValue;
                }
                if (targets[i].properties[j].propertyName == "照片") {
                    photo = targets[i].properties[j].propertyValue;
                    gettargetPhotoPath(photo, id);
                }
                if (targets[i].properties[j].propertyName == "是否有案件属性") {
                    hasCaseProperty = targets[i].properties[j].propertyValue[0];
                }
                if (targets[i].properties[j].propertyName == "居民身份证") {
                    cardid = targets[i].properties[j].propertyValue;
                }
            }
            targetList.push(new Person(id, name, "/img/targetImages/" + id + ".png", nation, sex, birth, hasCaseProperty, cardid));
        }
        logger.info("targetList is" + JSON.stringify(targetList));
        this.targetInfo[taskid] = null;
        this.targetInfo[taskid] = targetList;
    }

    this.settagfiltertargets = function(data) {
        this.targetInfo["2"] = null;
        this.targetInfo["2"] = data;
    }


    this.processTrace = function(originalData) {
        var alltrace = new Array();
        for (var i = 0; i < originalData.length; i++) {
            var targetid = originalData[i].target_id;
            var tracesource = originalData[i].source;
            var lon = originalData[i].lng;
            var lat = originalData[i].lat;
            var time = originalData[i].time;
            var isNew = true;
            for (var j = 0; j < alltrace.length; j++) {
                if (alltrace[j].userid == targetid) {
                    var point = new TracePoint(lat, lon, time);
                    alltrace[j].tracepath.push(point);
                    isNew = false;
                    break;
                }
            }
            if (isNew == true) {
                var trace = new Trace(targetid, tracesource);
                trace.tracepath = new Array();
                var tracepoint = new TracePoint(lat, lon, time);
                trace.tracepath.push(tracepoint);
                alltrace.push(trace);
            }
        }
        return alltrace;
    }












    // ---------------获取模拟数据--------------------

    this.simulatetasks = function() {
        this.taskList.push({
            operation_time: "2016-12-01 14:00:00",
            user_id: 6,
            name: "敌特嫌疑人员",
            id: 1,
            tag: ["最后出境时间", "使用VPN"],
            task_type: "lmb",
            status: "1",
            target: [19001, 19002, 19003, 19004, 19005]
        });
        this.taskList.push({
            operation_time: "2016-12-02 14:00:00",
            user_id: 6,
            name: "敌特2",
            id: 2,
            tag: ["最后出境时间", "使用SKYPE"],
            task_type: "lmb",
            status: "1",
            target: [19001, 19002, 19008, 19007, 19006]
        });
    }

    this.simulatePersons = function() {
        var files = fs.readdirSync('./route/data/');
        for (var i in files) {
            var doc = files[i];
            var data = fs.readFileSync('./route/data/' + doc);
            var person = JSON.parse(data);
            this.targetInfo.push(new Person(person['公民身份号码:'], person['姓名:'], "./images/targetphoto/" + person['公民身份号码:'] + ".jpg", person['民族:'], person['性别:']));
        }
    }

    this.simulateTags = function() {
        this.tagInfo.push({
            "typeId": 10001,
            "typeName": "出境口岸",
            "valueType": "int",
            "valueList": [
                "[1,5]",
                "[6,10]",
                "[11,null]"
            ]
        });
        this.tagInfo.push({
            "typeId": 10004,
            "typeName": "出境时间",
            "valueType": "date",
            " valueList ": [
                "[2015-01-01 01:01:01,2015-06-01 01:01:01]",
                "[2015-06-01 01:01:02,2015-12-01 01:01:01]",
                "[2015-12-01 01:01:02,null]"
            ]
        });
    }

    this.getsimulatetargetTrace = function() {

        var data = new Array();
        for (var k = 0; k < 10; k++) {
            var trace = new Trace("00" + k, "tar" + k);
            trace.tracepath = new Array();

            for (var i = 0; i < 15; i++) {
                var long = Math.random() * 5;
                var lat = Math.random() * 5;
                trace.tracepath.push(new TracePoint(25 + long, 110 + lat, (new Date("2016-12-5 12:00:00") - 3600)));
            }
            data.push(trace);
        }
        return data;
    }

    this.getsimulatestatisticgraph = function(targetid, category) {
        var linechart = {};
        if (targetid == "0" && category == "0") {
            linechart.legend = {};
            linechart.legend.data = ["电信", "互联网", "邮检"];
            linechart.xAxis = [{
                "type": "category",
                "data": ["2016-06-12 01:00:00", "2016-06-13 02:00:00", "2016-06-14 01:00:00", "2016-06-15 02:00:00", "2016-06-16 01:00:00", "2016-06-17 02:00:00", "2016-06-18 02:00:00"]

            }];

            //linechart.data=["2016-06-12 01:00:00","2016-06-13 02:00:00","2016-06-14 01:00:00","2016-06-15 02:00:00","2016-06-16 01:00:00","2016-06-17 02:00:00","2016-06-18 02:00:00"],

            linechart.series = [{
                    "data": [153, 152, 85, 90, 211, 23, 60]
                },
                {
                    "data": [5, 15, 24, 78, 159, 80, 56]
                },
                {
                    "data": [27, 76, 83, 65, 188, 120, 96]
                }
            ]

        } else if (targetid == "0" && category != "0") {
            linechart.legend = {};
            if (category == "电信") {
                linechart.legend.data = ["电话", "短信", "彩信"];
                linechart.xAxis = [{
                    "type": "category",
                    "data": ["2016-06-12 01:00:00", "2016-06-13 02:00:00", "2016-06-14 01:00:00", "2016-06-15 02:00:00", "2016-06-16 01:00:00", "2016-06-17 02:00:00", "2016-06-18 02:00:00"]
                }];
                linechart.series = [{
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    }
                ]
            }
            if (category == "互联网") {
                linechart.legend.data = ["邮件", "评论", "微信"];
                linechart.xAxis = [{
                    "type": "category",
                    "data": ["2016-06-12 01:00:00", "2016-06-13 02:00:00", "2016-06-14 01:00:00", "2016-06-15 02:00:00", "2016-06-16 01:00:00", "2016-06-17 02:00:00", "2016-06-18 02:00:00"]
                }];
                linechart.series = [{
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    }

                ]
            }
            if (category == "邮检") {
                linechart.legend.data = ["快递", "物流", "汇款"];
                linechart.xAxis = [{
                    "type": "category",
                    "data": ["2016-06-12 01:00:00", "2016-06-13 02:00:00", "2016-06-14 01:00:00", "2016-06-15 02:00:00", "2016-06-16 01:00:00", "2016-06-17 02:00:00", "2016-06-18 02:00:00"]
                }];
                linechart.series = [{
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    }
                ]
            }
        } else if (targetid != "0" && category == "0") {
            linechart.legend = {};
            linechart.legend.data = ["电信", "互联网", "邮检"];
            linechart.xAxis = [{
                "type": "category",
                "data": ["2016-06-12 01:00:00", "2016-06-13 02:00:00", "2016-06-14 01:00:00", "2016-06-15 02:00:00", "2016-06-16 01:00:00", "2016-06-17 02:00:00", "2016-06-18 02:00:00"]
            }];
            linechart.series = [{
                    "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                },
                {
                    "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                },
                {
                    "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                }
            ]
        } else if (targetid != "0" && category != "0") {
            linechart.legend = {};

            if (category == "电信") {
                linechart.legend.data = ["电话", "短信", "彩信"];
                linechart.xAxis = [{
                    "type": "category",
                    "data": ["2016-06-12 01:00:00", "2016-06-13 02:00:00", "2016-06-14 01:00:00", "2016-06-15 02:00:00", "2016-06-16 01:00:00", "2016-06-17 02:00:00", "2016-06-18 02:00:00"]
                }];
                linechart.series = [{
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    }
                ]
            }
            if (category == "互联网") {
                linechart.legend.data = ["邮件", "评论", "微信"];
                linechart.xAxis = [{
                    "type": "category",
                    "data": ["2016-06-12 01:00:00", "2016-06-13 02:00:00", "2016-06-14 01:00:00", "2016-06-15 02:00:00", "2016-06-16 01:00:00", "2016-06-17 02:00:00", "2016-06-18 02:00:00"]
                }];
                linechart.series = [{
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    }
                ]
            }
            if (category == "邮检") {
                linechart.legend.data = ["快递", "物流", "汇款"];
                linechart.xAxis = [{
                    "type": "category",
                    "data": ["2016-06-12 01:00:00", "2016-06-13 02:00:00", "2016-06-14 01:00:00", "2016-06-15 02:00:00", "2016-06-16 01:00:00", "2016-06-17 02:00:00", "2016-06-18 02:00:00"]
                }];
                linechart.series = [{
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    },
                    {
                        "data": [Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250), Math.round(Math.random() * 250)]
                    }
                ]
            }
        }
        return linechart;
    }

    this.getsimulateThreatenInfo = function(targetid) {
        var data = new Array();
        if (targetid == "0") {
            var threateninfo = new ThreatenInfo();
            threateninfo.capTime = new Date("2016-9-28 18:46:00");
            threateninfo.ruleId = targetid;
            threateninfo.detail = "2016年9月28日18点46分，手持铁棍攻击福州市公安局1名干警。";
            data.push(threateninfo);

            var threateninfo1 = new ThreatenInfo();
            threateninfo1.capTime = new Date("2016-9-19 17:46:00");
            threateninfo1.ruleId = targetid;
            threateninfo1.detail = "2016年9月19日17点46分，徒手强抢武警枪械。";
            data.push(threateninfo1);
        } else {
            var threateninfo2 = new ThreatenInfo();
            threateninfo2.capTime = new Date("2016-9-27 18:13:00");
            threateninfo2.ruleId = targetid;
            threateninfo2.detail = "2016年9月28日18点46分，抢劫银行。";
            data.push(threateninfo2);

            var threateninfo3 = new ThreatenInfo();
            threateninfo3.capTime = new Date("2016-10-19 17:31:00");
            threateninfo3.ruleId = targetid;
            threateninfo3.detail = "2016年9月19日17点46分，恶意冲撞行人。";
            data.push(threateninfo3);
        }
        return data;

    }

    this.getsimulatetargetthreatenNum = function() {
        var data = new Array();
        data.push({ targetid: "001", threatennum: 2 });
        data.push({ targetid: "002", threatennum: 16 });
        data.push({ targetid: "003", threatennum: 8 });
        return data;
    }

    this.getsimulatetargetRadar = function(targetid) {
        var radar = {};
        if (targetid == "0") {
            radar.data = new Array();
            radar.data.push({ name: "平均数", value: [56, 43, 67, 65, 54] });
            radar.indicator = new Array();
            radar.indicator.push({ text: '电信互联网通联数量', max: 90 });
            radar.indicator.push({ text: '特殊行为数量', max: 90 });
            radar.indicator.push({ text: '联系人数量', max: 90 });
            radar.indicator.push({ text: '六个月内出行次数', max: 90 });
            radar.indicator.push({ text: '总出境次数', max: 90 });
        } else {
            radar.data = new Array();
            radar.data.push({ name: targetid, value: [23, 13, 34, 25, 40] });
            radar.indicator = new Array();
            radar.indicator.push({ text: '电信互联网通联数量', max: 90 });
            radar.indicator.push({ text: '特殊行为数量', max: 90 });
            radar.indicator.push({ text: '联系人数量', max: 90 });
            radar.indicator.push({ text: '六个月内出行次数', max: 90 });
            radar.indicator.push({ text: '总出境次数', max: 90 });
        }
        return radar;
    }

    this.getsimulatetargetrelationship = function(targetid) {

        if (this.targetInfo.length == 0) {
            this.simulatePersons();
        }

        var personlist = new Array();
        for (var x in this.targetInfo) {
            personlist.push({ targetid: this.targetInfo[x].id, targetname: this.targetInfo[x].name });
        }

        var data = {};
        data.persons = new Array();
        data.edges = new Array();
        var center = 0;
        for (var i = 0; i < personlist.length; i++) {
            if (personlist[i].targetid == targetid) {
                center = i;
            }
        }
        for (var i = 0; i < personlist.length; i++) {
            if (personlist[i].targetid == targetid) {
                data.persons.push(new PersonPoint(targetid, personlist[i].targetname, true, -1));
            } else if (personlist[i].targetid.charAt(personlist[i].targetid.length - 1) == '1') {
                data.persons.push(new PersonPoint(personlist[i].targetid, personlist[i].targetname, false, 0));
                data.edges.push(new Edge(center, data.persons.length - 1));
            } else {
                data.persons.push(new PersonPoint(personlist[i].targetid, personlist[i].targetname, false, Math.round(Math.random() * 10) + 1));
                data.edges.push(new Edge(center, data.persons.length - 1));
            }
        }
        return data;
    }

    this.getsimulateallrelationship = function() {
        var data = {
            edges: [
                { "source": 1, "target": 0, "value": 1 },
                { "source": 2, "target": 0, "value": 8 },
                { "source": 3, "target": 0, "value": 10 },
                { "source": 3, "target": 2, "value": 6 },
                { "source": 4, "target": 0, "value": 1 },
                { "source": 5, "target": 0, "value": 1 },
                { "source": 6, "target": 0, "value": 1 },
                { "source": 7, "target": 0, "value": 1 },
                { "source": 8, "target": 0, "value": 2 },
                { "source": 9, "target": 0, "value": 1 },
                { "source": 11, "target": 10, "value": 1 },
                { "source": 11, "target": 3, "value": 3 },
                { "source": 11, "target": 2, "value": 3 },
                { "source": 11, "target": 0, "value": 5 },
                { "source": 12, "target": 11, "value": 1 },
                { "source": 13, "target": 11, "value": 1 },
                { "source": 14, "target": 11, "value": 1 },
                { "source": 15, "target": 11, "value": 1 },
                { "source": 17, "target": 16, "value": 4 },
                { "source": 18, "target": 16, "value": 4 },
                { "source": 18, "target": 17, "value": 4 },
                { "source": 19, "target": 16, "value": 4 },
                { "source": 19, "target": 17, "value": 4 },
                { "source": 19, "target": 18, "value": 4 },
                { "source": 20, "target": 16, "value": 3 },
                { "source": 20, "target": 17, "value": 3 },
                { "source": 20, "target": 18, "value": 3 },
                { "source": 20, "target": 19, "value": 4 },
                { "source": 21, "target": 16, "value": 3 },
                { "source": 21, "target": 17, "value": 3 },
                { "source": 21, "target": 18, "value": 3 },
                { "source": 21, "target": 19, "value": 3 },
                { "source": 21, "target": 20, "value": 5 },
                { "source": 22, "target": 16, "value": 3 },
                { "source": 22, "target": 17, "value": 3 },
                { "source": 22, "target": 18, "value": 3 },
                { "source": 22, "target": 19, "value": 3 },
                { "source": 22, "target": 20, "value": 4 },
                { "source": 22, "target": 21, "value": 4 },
                { "source": 23, "target": 16, "value": 3 },
                { "source": 23, "target": 17, "value": 3 },
                { "source": 23, "target": 18, "value": 3 },
                { "source": 23, "target": 19, "value": 3 },
                { "source": 23, "target": 20, "value": 4 },
                { "source": 23, "target": 21, "value": 4 },
                { "source": 23, "target": 22, "value": 4 },
                { "source": 23, "target": 12, "value": 2 },
                { "source": 23, "target": 11, "value": 9 },
                { "source": 24, "target": 23, "value": 2 },
                { "source": 24, "target": 11, "value": 7 },
                { "source": 25, "target": 24, "value": 13 },
                { "source": 25, "target": 23, "value": 1 },
                { "source": 25, "target": 11, "value": 12 },
                { "source": 26, "target": 24, "value": 4 },
                { "source": 26, "target": 11, "value": 31 },
                { "source": 26, "target": 16, "value": 1 },
                { "source": 26, "target": 25, "value": 1 },
                { "source": 27, "target": 11, "value": 17 },
                { "source": 27, "target": 23, "value": 5 },
                { "source": 27, "target": 25, "value": 5 },
                { "source": 27, "target": 24, "value": 1 },
                { "source": 27, "target": 26, "value": 1 },
                { "source": 28, "target": 11, "value": 8 },
                { "source": 28, "target": 27, "value": 1 },
                { "source": 29, "target": 23, "value": 1 },
                { "source": 29, "target": 27, "value": 1 },
                { "source": 29, "target": 11, "value": 2 },
                { "source": 30, "target": 23, "value": 1 },
                { "source": 31, "target": 30, "value": 2 },
                { "source": 31, "target": 11, "value": 3 },
                { "source": 31, "target": 23, "value": 2 },
                { "source": 31, "target": 27, "value": 1 },
                { "source": 32, "target": 11, "value": 1 },
                { "source": 33, "target": 11, "value": 2 },
                { "source": 33, "target": 27, "value": 1 },
                { "source": 34, "target": 11, "value": 3 },
                { "source": 34, "target": 29, "value": 2 },
                { "source": 35, "target": 11, "value": 3 },
                { "source": 35, "target": 34, "value": 3 },
                { "source": 35, "target": 29, "value": 2 },
                { "source": 36, "target": 34, "value": 2 },
                { "source": 36, "target": 35, "value": 2 },
                { "source": 36, "target": 11, "value": 2 },
                { "source": 36, "target": 29, "value": 1 },
                { "source": 37, "target": 34, "value": 2 },
                { "source": 37, "target": 35, "value": 2 },
                { "source": 37, "target": 36, "value": 2 },
                { "source": 37, "target": 11, "value": 2 },
                { "source": 37, "target": 29, "value": 1 },
                { "source": 38, "target": 34, "value": 2 },
                { "source": 38, "target": 35, "value": 2 },
                { "source": 38, "target": 36, "value": 2 },
                { "source": 38, "target": 37, "value": 2 },
                { "source": 38, "target": 11, "value": 2 },
                { "source": 38, "target": 29, "value": 1 },
                { "source": 39, "target": 25, "value": 1 },
                { "source": 40, "target": 25, "value": 1 },
                { "source": 41, "target": 24, "value": 2 },
                { "source": 41, "target": 25, "value": 3 },
                { "source": 42, "target": 41, "value": 2 },
                { "source": 42, "target": 25, "value": 2 },
                { "source": 42, "target": 24, "value": 1 },
                { "source": 43, "target": 11, "value": 3 },
                { "source": 43, "target": 26, "value": 1 },
                { "source": 43, "target": 27, "value": 1 },
                { "source": 44, "target": 28, "value": 3 },
                { "source": 44, "target": 11, "value": 1 },
                { "source": 45, "target": 28, "value": 2 },
                { "source": 47, "target": 46, "value": 1 },
                { "source": 48, "target": 47, "value": 2 },
                { "source": 48, "target": 25, "value": 1 },
                { "source": 48, "target": 27, "value": 1 },
                { "source": 48, "target": 11, "value": 1 },
                { "source": 49, "target": 26, "value": 3 },
                { "source": 49, "target": 11, "value": 2 },
                { "source": 50, "target": 49, "value": 1 },
                { "source": 50, "target": 24, "value": 1 },
                { "source": 51, "target": 49, "value": 9 },
                { "source": 51, "target": 26, "value": 2 },
                { "source": 51, "target": 11, "value": 2 },
                { "source": 52, "target": 51, "value": 1 },
                { "source": 52, "target": 39, "value": 1 },
                { "source": 53, "target": 51, "value": 1 },
                { "source": 54, "target": 51, "value": 2 },
                { "source": 54, "target": 49, "value": 1 },
                { "source": 54, "target": 26, "value": 1 },
                { "source": 55, "target": 51, "value": 6 },
                { "source": 55, "target": 49, "value": 12 },
                { "source": 55, "target": 39, "value": 1 },
                { "source": 55, "target": 54, "value": 1 },
                { "source": 55, "target": 26, "value": 21 },
                { "source": 55, "target": 11, "value": 19 },
                { "source": 55, "target": 16, "value": 1 },
                { "source": 55, "target": 25, "value": 2 },
                { "source": 55, "target": 41, "value": 5 },
                { "source": 55, "target": 48, "value": 4 },
                { "source": 56, "target": 49, "value": 1 },
                { "source": 56, "target": 55, "value": 1 },
                { "source": 57, "target": 55, "value": 1 },
                { "source": 57, "target": 41, "value": 1 },
                { "source": 57, "target": 48, "value": 1 },
                { "source": 58, "target": 55, "value": 7 },
                { "source": 58, "target": 48, "value": 7 },
                { "source": 58, "target": 27, "value": 6 },
                { "source": 58, "target": 57, "value": 1 },
                { "source": 58, "target": 11, "value": 4 },
                { "source": 59, "target": 58, "value": 15 },
                { "source": 59, "target": 55, "value": 5 },
                { "source": 59, "target": 48, "value": 6 },
                { "source": 59, "target": 57, "value": 2 },
                { "source": 60, "target": 48, "value": 1 },
                { "source": 60, "target": 58, "value": 4 },
                { "source": 60, "target": 59, "value": 2 },
                { "source": 61, "target": 48, "value": 2 },
                { "source": 61, "target": 58, "value": 6 },
                { "source": 61, "target": 60, "value": 2 },
                { "source": 61, "target": 59, "value": 5 },
                { "source": 61, "target": 57, "value": 1 },
                { "source": 61, "target": 55, "value": 1 },
                { "source": 62, "target": 55, "value": 9 },
                { "source": 62, "target": 58, "value": 17 },
                { "source": 62, "target": 59, "value": 13 },
                { "source": 62, "target": 48, "value": 7 },
                { "source": 62, "target": 57, "value": 2 },
                { "source": 62, "target": 41, "value": 1 },
                { "source": 62, "target": 61, "value": 6 },
                { "source": 62, "target": 60, "value": 3 },
                { "source": 63, "target": 59, "value": 5 },
                { "source": 63, "target": 48, "value": 5 },
                { "source": 63, "target": 62, "value": 6 },
                { "source": 63, "target": 57, "value": 2 },
                { "source": 63, "target": 58, "value": 4 },
                { "source": 63, "target": 61, "value": 3 },
                { "source": 63, "target": 60, "value": 2 },
                { "source": 63, "target": 55, "value": 1 },
                { "source": 64, "target": 55, "value": 5 },
                { "source": 64, "target": 62, "value": 12 },
                { "source": 64, "target": 48, "value": 5 },
                { "source": 64, "target": 63, "value": 4 },
                { "source": 64, "target": 58, "value": 10 },
                { "source": 64, "target": 61, "value": 6 },
                { "source": 64, "target": 60, "value": 2 },
                { "source": 64, "target": 59, "value": 9 },
                { "source": 64, "target": 57, "value": 1 },
                { "source": 64, "target": 11, "value": 1 },
                { "source": 65, "target": 63, "value": 5 },
                { "source": 65, "target": 64, "value": 7 },
                { "source": 65, "target": 48, "value": 3 },
                { "source": 65, "target": 62, "value": 5 },
                { "source": 65, "target": 58, "value": 5 },
                { "source": 65, "target": 61, "value": 5 },
                { "source": 65, "target": 60, "value": 2 },
                { "source": 65, "target": 59, "value": 5 },
                { "source": 65, "target": 57, "value": 1 },
                { "source": 65, "target": 55, "value": 2 },
                { "source": 66, "target": 64, "value": 3 },
                { "source": 66, "target": 58, "value": 3 },
                { "source": 66, "target": 59, "value": 1 },
                { "source": 66, "target": 62, "value": 2 },
                { "source": 66, "target": 65, "value": 2 },
                { "source": 66, "target": 48, "value": 1 },
                { "source": 66, "target": 63, "value": 1 },
                { "source": 66, "target": 61, "value": 1 },
                { "source": 66, "target": 60, "value": 1 },
                { "source": 67, "target": 57, "value": 3 },
                { "source": 68, "target": 25, "value": 5 },
                { "source": 68, "target": 11, "value": 1 },
                { "source": 68, "target": 24, "value": 1 },
                { "source": 68, "target": 27, "value": 1 },
                { "source": 68, "target": 48, "value": 1 },
                { "source": 68, "target": 41, "value": 1 },
                { "source": 69, "target": 25, "value": 6 },
                { "source": 69, "target": 68, "value": 6 },
                { "source": 69, "target": 11, "value": 1 },
                { "source": 69, "target": 24, "value": 1 },
                { "source": 69, "target": 27, "value": 2 },
                { "source": 69, "target": 48, "value": 1 },
                { "source": 69, "target": 41, "value": 1 },
                { "source": 70, "target": 25, "value": 4 },
                { "source": 70, "target": 69, "value": 4 },
                { "source": 70, "target": 68, "value": 4 },
                { "source": 70, "target": 11, "value": 1 },
                { "source": 70, "target": 24, "value": 1 },
                { "source": 70, "target": 27, "value": 1 },
                { "source": 70, "target": 41, "value": 1 },
                { "source": 70, "target": 58, "value": 1 },
                { "source": 71, "target": 27, "value": 1 },
                { "source": 71, "target": 69, "value": 2 },
                { "source": 71, "target": 68, "value": 2 },
                { "source": 71, "target": 70, "value": 2 },
                { "source": 71, "target": 11, "value": 1 },
                { "source": 71, "target": 48, "value": 1 },
                { "source": 71, "target": 41, "value": 1 },
                { "source": 71, "target": 25, "value": 1 },
                { "source": 72, "target": 26, "value": 2 },
                { "source": 72, "target": 27, "value": 1 },
                { "source": 72, "target": 11, "value": 1 },
                { "source": 73, "target": 48, "value": 2 },
                { "source": 74, "target": 48, "value": 2 },
                { "source": 74, "target": 73, "value": 3 },
                { "source": 75, "target": 69, "value": 3 },
                { "source": 75, "target": 68, "value": 3 },
                { "source": 75, "target": 25, "value": 3 },
                { "source": 75, "target": 48, "value": 1 },
                { "source": 75, "target": 41, "value": 1 },
                { "source": 75, "target": 70, "value": 1 },
                { "source": 75, "target": 71, "value": 1 },
                { "source": 76, "target": 64, "value": 1 },
                { "source": 76, "target": 65, "value": 1 },
                { "source": 76, "target": 66, "value": 1 },
                { "source": 76, "target": 63, "value": 1 },
                { "source": 76, "target": 62, "value": 1 },
                { "source": 76, "target": 48, "value": 1 },
                { "source": 76, "target": 58, "value": 1 }
            ],
            persons: [
                { "id": "Myriel", "group": 1 },
                { "id": "Napoleon", "group": 1 },
                { "id": "Mlle.Baptistine", "group": 1 },
                { "id": "Mme.Magloire", "group": 1 },
                { "id": "CountessdeLo", "group": 1 },
                { "id": "Geborand", "group": 1 },
                { "id": "Champtercier", "group": 1 },
                { "id": "Cravatte", "group": 1 },
                { "id": "Count", "group": 1 },
                { "id": "OldMan", "group": 1 },
                { "id": "Labarre", "group": 2 },
                { "id": "Valjean", "group": 2 },
                { "id": "Marguerite", "group": 3 },
                { "id": "Mme.deR", "group": 2 },
                { "id": "Isabeau", "group": 2 },
                { "id": "Gervais", "group": 2 },
                { "id": "Tholomyes", "group": 3 },
                { "id": "Listolier", "group": 3 },
                { "id": "Fameuil", "group": 3 },
                { "id": "Blacheville", "group": 3 },
                { "id": "Favourite", "group": 3 },
                { "id": "Dahlia", "group": 3 },
                { "id": "Zephine", "group": 3 },
                { "id": "Fantine", "group": 3 },
                { "id": "Mme.Thenardier", "group": 4 },
                { "id": "Thenardier", "group": 4 },
                { "id": "Cosette", "group": 5 },
                { "id": "Javert", "group": 4 },
                { "id": "Fauchelevent", "group": 0 },
                { "id": "Bamatabois", "group": 2 },
                { "id": "Perpetue", "group": 3 },
                { "id": "Simplice", "group": 2 },
                { "id": "Scaufflaire", "group": 2 },
                { "id": "Woman1", "group": 2 },
                { "id": "Judge", "group": 2 },
                { "id": "Champmathieu", "group": 2 },
                { "id": "Brevet", "group": 2 },
                { "id": "Chenildieu", "group": 2 },
                { "id": "Cochepaille", "group": 2 },
                { "id": "Pontmercy", "group": 4 },
                { "id": "Boulatruelle", "group": 6 },
                { "id": "Eponine", "group": 4 },
                { "id": "Anzelma", "group": 4 },
                { "id": "Woman2", "group": 5 },
                { "id": "MotherInnocent", "group": 0 },
                { "id": "Gribier", "group": 0 },
                { "id": "Jondrette", "group": 7 },
                { "id": "Mme.Burgon", "group": 7 },
                { "id": "Gavroche", "group": 8 },
                { "id": "Gillenormand", "group": 5 },
                { "id": "Magnon", "group": 5 },
                { "id": "Mlle.Gillenormand", "group": 5 },
                { "id": "Mme.Pontmercy", "group": 5 },
                { "id": "Mlle.Vaubois", "group": 5 },
                { "id": "Lt.Gillenormand", "group": 5 },
                { "id": "Marius", "group": 8 },
                { "id": "BaronessT", "group": 5 },
                { "id": "Mabeuf", "group": 8 },
                { "id": "Enjolras", "group": 8 },
                { "id": "Combeferre", "group": 8 },
                { "id": "Prouvaire", "group": 8 },
                { "id": "Feuilly", "group": 8 },
                { "id": "Courfeyrac", "group": 8 },
                { "id": "Bahorel", "group": 8 },
                { "id": "Bossuet", "group": 8 },
                { "id": "Joly", "group": 8 },
                { "id": "Grantaire", "group": 8 },
                { "id": "MotherPlutarch", "group": 9 },
                { "id": "Gueulemer", "group": 4 },
                { "id": "Babet", "group": 4 },
                { "id": "Claquesous", "group": 4 },
                { "id": "Montparnasse", "group": 4 },
                { "id": "Toussaint", "group": 5 },
                { "id": "Child1", "group": 10 },
                { "id": "Child2", "group": 10 },
                { "id": "Brujon", "group": 4 },
                { "id": "Mme.Hucheloup", "group": 8 }
            ]
        }

        var titles = ["火车同行", "飞机同程", "旅游大巴"];

        for (var i in data.edges) {
            data.edges[i].linkedTitle = new Array();
            var length = Math.random() * 10 % 3;
            for (var j = 0; j < length; j++) {
                data.edges[i].linkedTitle.push(titles[j]);
            }
        }
        for (var k in data.persons) {
            data.persons[k].name = data.persons[k]["id"];
        }
        return data;
    }

}