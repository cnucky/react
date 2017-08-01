/**
 * Created by maxiaodan on 2016/11/28.
 */
var router = require('express').Router();
var bodyParser = require('body-parser');
//var validator = require("validator");
var taskruleservice = require('../jws/taskRuleService');
var taskresultservice = require('../jws/taskresultService');
var echartservice = require('../jws/echartService');
var datatagservice = require('../jws/datatagService');
var enemyaccumulationService = require('../jws/enemyaccumulationService');
var personexternalService = require('../jws/personExternalService');
var personrelationService = require('../jws/personRelationService');
var config = require('../config-lmb');

var Simulate_data = require("./data_service");
var simulate = new Simulate_data();

var dateFormateString = 'yyyy-MM-dd hh:mm:ss';
Date.prototype.Format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

var screenlog4js = require('log4js');
screenlog4js.configure({
    appenders: [
        { type: "console" },
        { type: "file", filename: "/opt/log.log", category: "lmb-taishi" }
    ]
});
var mylogger = screenlog4js.getLogger("lmb-taishi");
mylogger.setLevel("INFO");

/**
 * 获取任务列表
 */
router.get("/gettasklist", function(req, res) {
    if (config.debug == false) {
        var args = {
            subTypeName: "getTaskList",
            taskType: "lmb",
            params: {}
        };
        taskruleservice(req).getTaskRule(args)
            .then(function(rsp) {
                mylogger.info('gettaskinfo:' + JSON.stringify(rsp));
                var data = rsp.data;
                var objectdata = data;
                simulate.setTasks(objectdata);
                res.endj(simulate.getTaskList());
            })
            .catch(function(d) {
                mylogger.info('exception', d);
                res.endj({});
            });

    } else {
        simulate.simulatePersons();
        var data = simulate.getTaskList()
        res.endj(data);
    }
})

/**
 * 获取指定任务信息
 */
router.get('/gettaskinfo', function(req, res) {
    if (config.debug == false) {
        var taskid;
        try {
            taskid = req.query.taskid;
        } catch (err) {
            res.send("获取参数targetid错误，" + err);
            return;
        }
        //        var args = {
        //            subTypeName:"getTaskInfo",
        //            taskType: "lmb",
        //            params:{id:taskid}
        //
        //        };

        inittaskInfo(taskid, req, res);
    } else {
        var data = {
            "id": '1',
            "tag": ["tag1", "tag2", "tag3"],
            "target": []
        };
        res.endj(data);
    }

});

function inittaskInfo(taskid, req, res) {
    var userId = getuseridfromcookie(req);
    mylogger.info("用户：" + userId + "获取任务信息，taskid is:" + taskid);
    var task = simulate.getTaskInfo(taskid);
    mylogger.info("获取的任务信息为：" + JSON.stringify(task));

    setUserCurrentInfo(userId, task);
    mylogger.info("初始化用户与任务关系完毕。")

    var getlegendargs = {
        "subTypeName": "getTaskLegendParamList",
        "taskType": "lmb",
        "params": {
            id: task.taskId,
            name: ['target_activity_indicator_list', 'target_activity_category_list']
        }
    };
    mylogger.info("gettasklegend args is:" + JSON.stringify(getlegendargs));
    taskruleservice(req).getTaskRule(getlegendargs).then(function(rsp) {
            var data = rsp.data;
            mylogger.info("legend of task " + task.taskId + " is:" + JSON.stringify(getlegendargs));
            simulate.setlegends(task.taskId, data);
            mylogger.info("初始化任务与图例映射完毕。");

            var args = {
                targetIds: task.target, //[1528039]//
                returnPhoto: "true"
            }
            mylogger.info("初始化目标详细信息.");
            enemyaccumulationService(req).getPeopleDetailValueForSensing(args)
                .then(function(rsp) {
                    var data = rsp.data;
                    mylogger.info("获取targets信息结果：" + JSON.stringify(data));
                    simulate.setTargets(taskid, data.result);
                    mylogger.info("设置任务1目标信息");
                    //simulate.setTargets("0",data.result);
                    //mylogger.info("设置任务0目标信息");
                    var targets = simulate.getalltargets(taskid);
                    res.endj(targets);
                })
                .catch(function(d) {
                    mylogger.info('exception:', d);
                    res.endj({});
                });

        })
        .catch(function(d) {
            mylogger.info('get task legend exception:', d);
            res.endj({});
        });
}

/**
 * 获取指定targetid的目标详细信息（maxiaodan使用）
 */
router.get("/gettargetsinfo", function(req, res) {
    var args = req.query;
    mylogger.info('gettargetsinfo args is: ' + JSON.stringify(args));
    enemyaccumulationService(req).getPeopleDetailValueForSensing(args)
        .then(function(rsp) {
            var data = rsp.data;
            res.endj(data);
        })
        .catch(function(d) {
            mylogger.info('exception:', d);
            res.endj({});
        });
})

/**
 * 获取所有目标的详情（包括图片）(人头墙)
 */
router.get('/getalltargetsinfo', function(req, res) {
    if (config.debug == false) {
        //webservice接口
        //var targets = simulate.getalltargets("1");

        var userid = getuseridfromcookie(req);
        //var taskid = SellectedTargetId[userid]["currentTaskId"];
        var targets = SellectedTargetId[userid]["currentTargets"];

        //var targets=simulate.getTaskInfo("2").target;
        if (targets == undefined) {
            res.endj("未初始化任务信息");
            return;
        }
        var targetsids = new Array();
        for (var i = 0; i < targets.length; i++) {
            //targetsids.push(targets[i].id);
            targetsids.push(targets[i]);
        }

        var args = {
            targetIds: targetsids
        }
        mylogger.info('getChartReport: call for webservice.');
        enemyaccumulationService(req).getPeopleDetailValueForSensing(args)
            .then(function(rsp) {
                var data = rsp.data;
                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('exception:', d);
                res.endj({});
            });
    } else {
        var data = simulate.getalltargets();
        res.endj(data);
    }
});



router.get('/getalltargetsphoto', function(req, res) {
    if (config.debug == false) {
        //webservice接口
        var args = {
            type: "20",
            value: "65010319830712641X"

        }
        mylogger.info('getalltargetsphoto: call for webservice.');
        personexternalService(req).queryExternalInfo(args)
            .then(function(rsp) {
                mylogger.info('getalltargetsphoto:' + rsp);
                var data = rsp.data;
                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('exception:', d);
                res.endj({});
            });
    } else {
        var data = simulate.getalltargets();
        res.endj(data);
    }
});

/**
 * 获取所有目标的轨迹
 */
router.get('/getalltargetstrace', function(req, res) {

    if (config.debug == false) {
        //webservice接口

        //var targets = simulate.getalltargets("2");
        var userid = getuseridfromcookie(req);
        if (SellectedTargetId[userid] == undefined) {
            res.endj({});
            return;
        }
        var taskid = SellectedTargetId[userid]["currentTaskId"];
        var targets = SellectedTargetId[userid]["currentTargets"];
        //var targets = simulate.getTaskInfo("2").target;
        if (targets == undefined) {
            res.endj("未初始化任务信息");
            return;
        }
        var alltargetsid = "";
        for (var i = 0; i < targets.length - 1; i++) {
            //alltargetsid+=targets[i].id;
            alltargetsid += targets[i];
            alltargetsid += ",";
        }
        alltargetsid += targets[targets.length - 1];
        var args = {
            centerCode: 10000,
            taskType: "lmb",
            subRpTasks: [{
                subTypeName: "index_target_recently_position",
                param: {
                    task_id: 2,
                    target_id: alltargetsid,
                    return_count: 20
                }
            }]
        };
        mylogger.info('getChartReport: call for webservice. args:' + JSON.stringify(args));
        echartservice(req).getChartReport(args)
            .then(function(rsp) {
                var data = rsp.data;

                var trace = simulate.processTrace(data['index_target_recently_position']);
                res.endj(trace);
            })
            .catch(function(d) {
                mylogger.info('exception:', d);
                res.endj({});
            });
    } else {
        var data = simulate.getsimulatetargetTrace();
        res.endj(data);
    }
});

/**
 * 获取柱状图一层图例（songqiankun使用）
 */
router.get("/getStaticFirstLevellegend", function(req, res) {
    var userid = getuseridfromcookie(req);
    if (SellectedTargetId[userid] == undefined) {
        res.endj({});
        return;
    }
    var taskid = SellectedTargetId[userid]["currentTaskId"];
    var legends = simulate.getlegend(taskid, "target_activity_category_list");
    console.log("获取到的legend：" + JSON.stringify(legends));
    if (legends == undefined) {
        res.endj("未初始化图例信息。");
        return;
    }
    var legendChnName = new Array();
    for (var i = 0; i < legends.length; i++) {
        legendChnName.push(legends[i].chn);
    }
    res.endj(legendChnName);
})

/**
 * 获取目标的统计柱状图
 */
router.get('/gettargetsstatic', function(req, res) {
    try {
        var targetid = req.query.targetid;
        if (targetid == undefined) {
            res.send("获取参数targetid错误，");
            return;
        }
    } catch (err) {
        res.send("获取参数targetid错误，" + err);
        return;
    }
    try {
        var category = req.query.category;
        if (category == undefined) {
            res.send("获取参数category错误，");
            return;
        }
    } catch (err) {
        res.send("获取参数category错误，" + err);
        return;
    }

    if (config.debug == false) {
        //webservice接口

        //var targets = simulate.getalltargets("1");

        var userid = getuseridfromcookie(req);
        if (SellectedTargetId[userid] == undefined) {
            res.endj({});
            return;
        }
        var taskid = SellectedTargetId[userid]["currentTaskId"];
        var targets = SellectedTargetId[userid]["currentTargets"];
        var legends = simulate.getlegend(taskid, "target_activity_category_list");
        console.log("获取到的legend：" + JSON.stringify(legends));
        if (legends == undefined) {
            res.endj("未初始化图例信息。");
            return;
        }
        var legendEngName = new Array();
        var legendEndChnMap = {};
        var legendChnEndMap = {};
        for (var i = 0; i < legends.length; i++) {
            legendEngName.push(legends[i].eng);
            legendChnEndMap[legends[i].chn] = legends[i].eng;
            legendEndChnMap[legends[i].eng] = legends[i].chn;
            for (var j = 0; j < legends[i].sub_category.length; j++) {
                legendChnEndMap[legends[i].sub_category[j].chn] = legends[i].sub_category[j].eng;
                legendEndChnMap[legends[i].sub_category[j].eng] = legends[i].sub_category[j].chn;
            }
        }
        console.log("中文到英文的映射：" + JSON.stringify(legendChnEndMap));
        console.log("英文到中文的映射：" + JSON.stringify(legendEndChnMap));
        if (targets == undefined) {
            res.endj("未初始化任务信息");
            return;
        }
        var targetsids = new Array();
        for (var i = 0; i < targets.length - 1; i++) {
            targetsids.push(targets[i]);
            //targetsids.push(targets[i].id);
        }

        var end_time = new Date();
        var start_time = new Date(new Date() - 7 * 24 * 3600 * 1000);

        var args
        if (category == "0" && targetid == "0") {
            args = {
                taskType: "lmb",
                subRpTasks: [{
                    subTypeName: "index_target_activity_stat_histogram",
                    param: {
                        task_id: taskid,
                        start_time: start_time.Format(dateFormateString),
                        end_time: end_time.Format(dateFormateString),
                        target_id: targetsids,
                        type: "category",
                        item: legendEngName //["tel","internet","trip"]
                    }
                }]
            }
        } else if (category == "0" && targetid != "0") {
            args = {
                taskType: "lmb",
                subRpTasks: [{
                    subTypeName: "index_target_activity_stat_histogram",
                    param: {
                        task_id: taskid,
                        start_time: start_time.Format(dateFormateString),
                        end_time: end_time.Format(dateFormateString),
                        target_id: [targetid],
                        type: "category",
                        item: legendEngName //["tel","internet","trip"]
                    }
                }]
            }
        } else if (category != "0" && targetid == "0") {
            //var sub_category_eng = legendChnEndMap[category];
            var subLegendEngName = new Array();
            for (var i = 0; i < legends.length; i++) {
                if (legends[i].chn == category) {
                    for (var j = 0; j < legends[i].sub_category.length; j++)
                        subLegendEngName.push(legends[i].sub_category[j].eng);
                }
            }
            args = {
                taskType: "lmb",
                subRpTasks: [{
                    subTypeName: "index_target_activity_stat_histogram",
                    param: {
                        task_id: taskid,
                        start_time: start_time.Format(dateFormateString),
                        end_time: end_time.Format(dateFormateString),
                        target_id: targetsids,
                        //category:category,
                        type: "sub_category",
                        item: subLegendEngName
                    }
                }]
            }
        } else if (category != "0" && targetid != "0") {
            var subLegendEngName = new Array();
            for (var i = 0; i < legends.length; i++) {
                if (legends[i].chn == category) {
                    for (var j = 0; j < legends[i].sub_category.length; j++)
                        subLegendEngName.push(legends[i].sub_category[j].eng);
                }
            }
            args = {
                taskType: "lmb",
                subRpTasks: [{
                    subTypeName: "index_target_activity_stat_histogram",
                    param: {
                        task_id: taskid,
                        start_time: start_time.Format(dateFormateString),
                        end_time: end_time.Format(dateFormateString),
                        target_id: [targetid],
                        //category:category
                        type: "sub_category",
                        item: subLegendEngName
                    }
                }]
            }
        }
        mylogger.info("获取柱状图参数：" + JSON.stringify(args));
        echartservice(req).getChartReport(args)
            .then(function(rsp) {
                mylogger.info('getChartReport:' + rsp);
                var data = rsp.data['index_target_activity_stat_histogram'];
                var legenddata = new Array();
                for (var i = 0; i < data.legend.data.length; i++) {
                    legenddata.push(legendEndChnMap[data.legend.data[i]]);
                }
                data.legend.data = null;
                data.legend.data = legenddata;

                for (var j = 0; j < data.series.length; j++) {
                    var engdata = data.series[j]['name'];
                    data.series[j]['name'] = legendEndChnMap[engdata];
                }
                mylogger.info("get statistic graph legend transfiled.");
                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('exception:', d);
                res.endj({});
            });

    } else {
        var linechart = simulate.getsimulatestatisticgraph(targetid, category);
        res.endj(linechart);
    }
});

/**
 * 获取目标的威胁详情(时间轴)
 */
router.get('/gettargetthreateninfo', function(req, res) {
    var targetid;
    try {
        targetid = req.query.targetid;
        if (targetid == undefined) {
            res.send("获取参数targetid错误，");
            return;
        }
    } catch (err) {
        res.send("获取参数targetid错误，" + err);
        return;
    }
    var end_time = new Date();
    var start_time = new Date(new Date() - 120 * 24 * 3600 * 1000);
    if (config.debug == false) {
        //webservice接口
        var args = {
            subTypeName: "getTargetResult",
            params: {
                target_id: targetid,
                start_time: start_time.Format(dateFormateString),
                end_time: end_time.Format(dateFormateString),
                row_count: "20",
                start_row: "0"
            }
        }
        mylogger.info('gettargetthreateninfo: call for webservice.');
        taskresultservice(req).getResult(args)
            .then(function(rsp) {
                mylogger.info('getResult:' + rsp);
                var data = rsp.data;
                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('exception', d);
                res.endj([]);
            });

    } else {
        var data = simulate.getsimulateThreatenInfo(targetid);
        res.endj(data);
    }
});



/**
 * 获取所有目标的威胁数目（轮询）
 */
router.get('/getalltargetsthreatennum', function(req, res) {
    if (config.debug == false) {
        //webservice接口

        //var targets = simulate.getalltargets("1");
        var userid = getuseridfromcookie(req);
        //var taskid = SellectedTargetId[userid]["currentTaskId"];
        var targets = SellectedTargetId[userid]["currentTargets"];

        //var targets = simulate.getTaskInfo("2").target;
        if (targets == undefined) {
            res.endj("未初始化任务信息");
            return;
        }
        var targetsid = new Array();
        for (var i = 0; i < targets.length; i++) {
            //targetsid.push(targets[i].id);
            targetsid.push(targets[i]);
        }

        var end_time = new Date();
        var start_time = new Date(new Date() - 120 * 24 * 3600 * 1000);
        var args = {
            subTypeName: "getPersonTaskCount",
            params: {
                target_list: targetsid,
                start_time: start_time.Format(dateFormateString),
                end_time: end_time.Format(dateFormateString)
            }
        }
        mylogger.info('getalltargetsthreatennum: call for webservice.');
        taskresultservice(req).getResult(args)
            .then(function(rsp) {
                mylogger.info('getResult:' + rsp);
                var data = rsp.data;

                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('exception', d);
                res.endj([]);
            });
    } else {
        var data = simulate.getsimulatetargetthreatenNum();
        res.endj(data);
    }
});

/**
 * 威胁处置
 */
router.get('/updatethreateninfo', function(req, res) {
    mylogger.info('updatethreateninfo:request comming');
    try {
        var id = req.query.id;
    } catch (err) {
        res.send("获取参数威胁id错误，" + err);
        return;
    }
    if (config.debug == false) {
        var ids = id.split(",");
        mylogger.info("split array is:" + JSON.stringify(ids));
        var args = {
            subTypeName: "setTaskResultProcessed",
            taskType: "lmb",
            params: {
                result_id: ids,
                remark: "abc"
            }
        }
        mylogger.info('updatethreateninfo: call for webservice.');
        taskresultservice(req).updateResult(args)
            .then(function(rsp) {
                mylogger.info('updateResult:' + JSON.stringify(rsp));
                var data = rsp.data;
                res.endj({ info: true });
            })
            .catch(function(d) {
                mylogger.info('exception', d);
                res.endj({ info: false });
            });

    } else {
        res.endj({ info: true });
    }
})

/**
 * 获取目标雷达图
 */
router.get('/gettargetsradar', function(req, res) {
    var targetid;
    try {
        targetid = req.query.targetid;
        if (targetid == undefined) {
            res.send("获取参数targetid错误，");
            return;
        }
    } catch (err) {
        res.send("获取参数targetid错误，" + err);
        return;
    }

    if (config.debug == false) {
        var args;
        var end_time = new Date();
        var start_time = new Date(new Date() - 60 * 24 * 3600 * 1000);
        var userid = getuseridfromcookie(req);
        if (SellectedTargetId[userid] == undefined) {
            res.endj({});
            return;
        }
        var taskid = SellectedTargetId[userid]["currentTaskId"];
        var legends = simulate.getlegend(taskid, "target_activity_indicator_list");
        if (legends == undefined) {
            res.endj("未初始化图例信息。")
            return;
        }
        var legendEngName = new Array();
        var legendEndChnMap = {};
        for (var i = 0; i < legends.length; i++) {
            legendEngName.push(legends[i].eng);
            legendEndChnMap[legends[i].eng] = legends[i].chn;
        }
        if (targetid == 0) {
            var targets = SellectedTargetId[userid]["currentTargets"];
            //var targets = simulate.getTaskInfo("2").target;
            if (targets == undefined) {
                res.endj("未初始化任务信息");
                return;
            }
            var targetsid = new Array();
            for (var i = 0; i < targets.length; i++) {
                //targetsid.push(targets[i].id);
                targetsid.push(targets[i])
            }
            args = {
                taskType: "lmb",
                subRpTasks: [{
                    subTypeName: "index_target_threat_radar",
                    param: {
                        task_id: taskid,
                        series: ["实际数", "平均数"],
                        //start_time:start_time.Format(dateFormateString),
                        time: end_time.Format(dateFormateString),
                        target_id: targetsid,
                        item: legendEngName //["tel_internet_num","contact_num","special_num","entry_num","trip_num"]
                    }
                }]
            }
        } else {
            args = {
                taskType: "lmb",
                subRpTasks: [{
                    subTypeName: "index_target_threat_radar",
                    param: {
                        task_id: taskid,
                        series: ["实际数", "平均数"],
                        //start_time:start_time.Format(dateFormateString),
                        time: end_time.Format(dateFormateString),
                        target_id: [targetid],
                        item: legendEngName //["tel_internet_num","contact_num","special_num","entry_num","trip_num"]
                    }
                }]
            }
        }

        mylogger.info('gettargetsradar:getChartReport: call for webservice.args:' + JSON.stringify(args));
        echartservice(req).getChartReport(args)
            .then(function(rsp) {
                mylogger.info('getChartReport:' + rsp);
                var data = rsp.data;
                for (var i = 0; i < data['index_target_threat_radar'].indicator.length; i++) {
                    var engtext = data['index_target_threat_radar'].indicator[i].text;
                    data['index_target_threat_radar'].indicator[i].text = legendEndChnMap[engtext];
                }
                mylogger.info("get radar graph legend transfiled.");
                res.endj(data['index_target_threat_radar']);
            })
            .catch(function(d) {
                mylogger.info('exception:', d);
                res.endj({});
            });
    } else {
        var radar = simulate.getsimulatetargetRadar(targetid);
        res.endj(radar);
    }
});

var SellectedTargetId = { targetid: "0" };

function setUserCurrentInfo(userId, task) {
    SellectedTargetId[userId] = {};
    SellectedTargetId[userId].currentTaskId = task.taskId;
    SellectedTargetId[userId].currentTargets = task.target;
    SellectedTargetId[userId].selectedTarget = { targetid: "0" };
}



function getuseridfromcookie(req) {
    var userid = "";
    try {
        if (req.headers.cookie != null) {
            //mylogger.info("请求的cookies为："+req.headers.cookie);
            var cookies = req.headers.cookie.split(';');
            for (var c = 0; c < cookies.length; c++) {
                //mylogger.info("cookies中的项为："+cookies[c]);
                var cookiepair = cookies[c].split('=');
                if (cookiepair[0].trim() == "userid") {
                    userid = cookiepair[1]; //cookies中的userid为
                    //mylogger.info("："+userid);
                    //mylogger.info(SellectedTargetId[userid]);
                    return userid;
                }
            }
        }
    } catch (e) {
        mylogger.error("从请求中获取userid出错，req ：" + JSON.stringify(req.headers));
        mylogger.error("从请求中获取userid出错，堆栈：" + e);
        return "";
    }
    return userid;
}

/**
 * 联动获取选中的目标
 */
router.get('/getselectedtarget', function(req, res) {
    var userid = getuseridfromcookie(req);
    mylogger.info("态势的userid为：" + userid);
    if (userid in SellectedTargetId) {
        //mylogger.info("选中对象为："+JSON.stringify(SellectedTargetId[userid]));
        res.endj(SellectedTargetId[userid].selectedTarget);
    } else {
        //SellectedTargetId[userid]={};
        mylogger.info("任务未初始化。");
        res.endj({});
    }

});

/**
 * 联动设置选中的目标
 */
router.get('/setselectedtarget', function(req, res) {
    var userid = getuseridfromcookie(req);
    //mylogger.info("人头墙的userid为："+userid);
    var targetid;
    try {
        targetid = req.query.targetid;
        if (targetid == undefined) {
            res.send("获取参数targetid错误，");
            return;
        }
    } catch (err) {
        res.send("获取参数targetid错误，" + err);
        return;
    }
    mylogger.info("设置选中目标的targetid为：" + JSON.stringify(targetid));
    SellectedTargetId[userid].selectedTarget = targetid;
    res.end();
})


/**
 * 获取指定目标的人物关系
 */
router.get('/getTargetRelationship', function(req, res) {
    var targetid;
    try {
        targetid = req.query.targetid;
        mylogger.info("type of targetid is: " + typeof(targetid));
        if (targetid == undefined) {
            res.send("获取参数targetid错误，");
            return;
        }
    } catch (err) {
        res.send("获取参数targetid错误，" + err);
        return;
    }
    if (config.debug == false) {
        var args = {
            targetIds: [targetid]
        }
        mylogger.info('analyzeTargetRelation call for webservice.args is:' + JSON.stringify(args));
        personrelationService(req).analyzeTargetRelation(args)
            .then(function(rsp) {
                mylogger.info('updateResult:' + JSON.stringify(rsp));
                var data = rsp.data;
                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('exception', d);
                res.endj({});
            });


    } else {
        var data = simulate.getsimulatetargetrelationship(targetid);
        res.endj(data);
    }
})

/**
 * 获取所有目标的关系图
 */
router.get('/getAllRelationship', function(req, res) {
    if (config.debug == false) {
        //webservice接口
        //var targets = simulate.getalltargets("1");
        var userid = getuseridfromcookie(req);
        if (SellectedTargetId[userid] == undefined) {
            res.endj({});
            return;
        }
        //var taskid = SellectedTargetId[userid]["currentTaskId"];
        var targets = SellectedTargetId[userid]["currentTargets"];
        mylogger.info("用户的当前目标列表为：" + JSON.stringify(targets));
        //var targets = simulate.getTaskInfo("2").target;
        if (targets == undefined) {
            res.endj("未初始化任务信息");
            return;
        }
        var targetsids = new Array();
        for (var i = 0; i < targets.length; i++) {
            //targetsids.push(targets[i].id);
            targetsids.push(targets[i]);
        }
        var args = {
            targetIds: targetsids
        }
        mylogger.info('analyzeTargetRelation call for webservice.args is:' + JSON.stringify(args));
        personrelationService(req).analyzeTargetRelation(args)
            .then(function(rsp) {
                mylogger.info('updateResult:' + JSON.stringify(rsp));
                var data = rsp.data;
                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('exception', d);
                res.endj({});
            });

    } else {
        var data = simulate.getsimulateallrelationship();
        res.endj(data);
    }
})

/**
 * 获取可供选择的标签
 */
router.get('/getSelectableTags', function(req, res, next) {
    mylogger.info('getSelectableTags: http request comming');
    if (config.debug == false) {
        //webservice接口

        var args = {
            size: 25
        };
        mylogger.info('getSelectableTags: call for webservice.');
        datatagservice(req).getFrequentTag(args)
            .then(function(rsp) {
                mylogger.info('updateResult:' + JSON.stringify(rsp));
                var data = rsp.data;
                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('exception', d);
                res.endj({})
            });
    } else {
        var data = simulate.getalltags();
        res.endj(data);
    }
})

/**
 * 创建新的标签筛选任务，并返回筛选结果
 */
router.post('/submittagfiltertask', function(req, res, next) {
    mylogger.info('submittagfiltertask: http request comming');

    //var taskid = SellectedTargetId[userid]["currentTaskId"];

    var condition;
    var typeid;
    var typename;
    var valuetype
    try {
        //targetid = req.query.targetid;
        mylogger.info("---------posted data  state_user_id is:" + JSON.stringify(req.body.state_user_id) + ", data type is :" + typeof(req.body.state_user_id) + "--------------------------------------------")

        condition = req.query.condition; //validator.trim(req.body.condition);
        mylogger.info("---------posted data is:" + JSON.stringify(condition) + ", data type is :" + typeof(condition) + "--------------------------------------------")
            //typeid = req.query.typeid;
            //typename=req.query.typename;
            //valuetype=req.query.valuetype;
    } catch (err) {
        res.send("获取参数targetid错误，" + err);
        return;
    }

    if (config.debug == false) {
        //var args={
        //    "keyword":"",
        //    "dataTag":
        //        [
        //            {
        //                //"typeId": 10001,
        //                //"typeName":"出境次数(次)",
        //                //"valueType": "int",
        //                //"valueList": [[1,196]]
        //                "typeId": typeid,
        //                "typeName":typename,
        //                "valueType": valuetype,
        //                "valueList": [[1,196]]
        //            }
        //        ]
        //
        //};
        var args = {
            "keyword": ""
        };
        args["dataTag"] = JSON.parse(condition);
        mylogger.info("提交标签筛选时刻：" + JSON.stringify(new Date()));
        mylogger.info('submittagfiltertask: call for webservice. args is:' + JSON.stringify(args));
        datatagservice(req).submitTagSearch(args)
            .then(function(rsp) {
                var submitresult = rsp.data;
                mylogger.info('submitTagResult:' + JSON.stringify(submitresult));
                var getresultArgs = {
                    taskId: submitresult["taskId"],
                    pos: 0,
                    size: 1000
                };
                mylogger.info("获取标签筛选结果时刻：" + JSON.stringify(new Date()));
                datatagservice(req).getTagSearchResultCustomed(getresultArgs) //获取所有目标：getTagSearchResultCustomed()  //getTagSearchResult()
                    .then(function(rsp) {
                        var data = rsp.data["entities"];
                        mylogger.info("获取targets对应目标信息：" + JSON.stringify(new Date()));
                        mylogger.info('getTagSearchResultCustomed:' + JSON.stringify(data));

                        //var alltargets = simulate.getalltargets("0");
                        var userid = getuseridfromcookie(req);
                        var taskid = SellectedTargetId[userid]["currentTaskId"];
                        var alltargets = simulate.getalltargets(taskid); //SellectedTargetId[userid]["currentTargets"];
                        if (alltargets == undefined) {
                            res.endj({});
                            return;
                        }
                        var tagfilltertargets = new Array();
                        for (var i = 0; i < data.length; i++) {
                            var targetid = data[i].targetId;
                            for (var j = 0; j < alltargets.length; j++) {
                                if (alltargets[j].id == targetid) {
                                    tagfilltertargets.push(alltargets[j]);
                                    continue;
                                }
                            }
                        }
                        var tagfilltertargetsids = new Array();
                        for (var i = 0; i < tagfilltertargets.length; i++) {
                            tagfilltertargetsids.push(tagfilltertargets[i].id);
                        }
                        SellectedTargetId[userid]["currentTargets"] = tagfilltertargetsids;
                        //simulate.settagfiltertargets(tagfilltertargets);
                        mylogger.info("取到targets对应目标信息时刻：" + JSON.stringify(new Date()));
                        res.endj(tagfilltertargets);

                        //var tagids = new Array();
                        //for(var i=0;i<data.length;i++){
                        //    tagids.push(data[i].targetId);
                        //}
                        //var tagfilterTargetsargs = {
                        //    targetIds:tagids
                        //}
                        //mylogger.info("获取targets对应目标信息："+JSON.stringify(new Date()));
                        //mylogger.info('获取标签筛选结果目标信息参数：:'+ JSON.stringify(tagfilterTargetsargs));
                        //enemyaccumulationService(req).getPeopleDetailValueForSensing(tagfilterTargetsargs)
                        //    .then(function(rsp) {
                        //        //mylogger.info('getPeopleDetailValueForSensing:'+ rsp);
                        //        var data = rsp.data;
                        //        mylogger.info("取到targets对应目标信息时刻："+JSON.stringify(new Date()));
                        //       //mylogger.info("returned data is:"+JSON.stringify(data));
                        //        mylogger.info("returned data type is:"+typeof(data));

                        //        simulate.settagfiltertargets(data);
                        //        mylogger.info("存储targets对应目标信息时刻："+JSON.stringify(new Date()));
                        //        var targets = simulate.getalltargets("1");
                        //        res.endj(targets);
                        //    })
                        //    .catch(function(d) {
                        //        mylogger.info('exception:',d);
                        //        logger.info('exception',d);
                        //    });
                    })
                    .catch(function(d) {
                        mylogger.info('exception', d);
                        res.endj(simulate.getalltargets("1"));
                    });
            })
            .catch(function(d) {
                mylogger.info('exception', d);
                res.endj(simulate.getalltargets("1"));
            });
    } else {
        //var data = simulate.getalltags();
        res.endj({ value: "haha" });
    }
})

router.get('/gettagfilterresult', function(req, res, next) {
    mylogger.info('gettagfilterresult: http request comming');
    if (config.debug == false) {
        var args = {
            taskId: "m3iT8Cu8jP_C2JIa3pJbH0_Ujmc=",
            pos: 0,
            size: 10
        };
        mylogger.info('getSelectableTags: call for webservice.');
        datatagservice(req).getTagSearchResult(args) //获取所有目标：getTagSearchResultCustomed()
            .then(function(rsp) {
                mylogger.info('updateResult:' + JSON.stringify(rsp));
                var data = rsp.data;
                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('exception', d);
                res.endj({});
            });
    } else {
        //var data = simulate.getalltags();
        res.endj({ value: "haha" });
    }

})


router.get("/getalltargets", function(req, res) {
    var userid = getuseridfromcookie(req);
    //var taskid = SellectedTargetId[userid]["currentTaskId"];
    var targets = SellectedTargetId[userid]["currentTargets"];
    //var alltargets = simulate.getalltargets("1");
    res.endj(targets);
})

router.get("/gettargetinfobytargetid", function(req, res) {
    var targetid;
    try {
        targetid = req.query.targetid;
        if (targetid == undefined) {
            res.send("获取参数targetid错误，");
            return;
        }
    } catch (err) {
        res.send("获取参数targetid错误，" + err);
        return;
    }

    var userid = getuseridfromcookie(req);
    var taskid = SellectedTargetId[userid]["currentTaskId"];

    var targets = simulate.getalltargets(taskid);
    if (targets == undefined) {
        res.endj("未初始化任务信息");
        return;
    }
    for (var i = 0; i < targets.length; i++) {
        if (targetid == targets[i].id) {
            res.endj(targets[i]);
        }
    }
    res.endj("没有找到targetid对应的目标信息");
})

router.get("/setrecordlog", function (req, res) {
    var args = req.query;

    // var args = {
    //     "taskType": "lmb",
    //     "subRpTasks": [
    //          {
    //              subTypeName: record_log,
    //              param: {
    //                  "task_id": "1", //任务id
    //                  "item": "lmb"  //city / threat分别对应态势感知和威胁预警
    //              }
    //          }
    //     ]
    // };

    mylogger.info("setrecordlog args is :" + JSON.stringify(args));
    echartservice(req).getChartReport(args).then(function (rsp) {
        var data = rsp.data;
        res.endj(data);
    })
    .catch(function (d) {
        mylogger.info('exception:', d);
        res.endj({});
    });
})

module.exports = router;