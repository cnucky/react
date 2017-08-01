
var router = require('express').Router();
var echartService = require('../jws/echart');
var taskRuleService = require('../jws/taskrule');
var taskResultService = require('../jws/taskresult');
var reportService = require('../jws/report');
var billDetailService = require('../jws/billdetail');
var personrelationService = require('../jws/personRelationService');
var charsetMiddleware = require('./charsetmiddleware');


var log4js = require('log4js');
log4js.configure({
    appenders:[
        {type:"console"},
        {type:"file",filename:"/opt/log.log",category:"Situation-scense"}
    ]
});
var mylogger = log4js.getLogger("Situation-scense");
mylogger.setLevel("DEBUG");

var testData = [
    [
        { image: './resources/images/group.png', content: '重点目标聚集', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/in-area.png', content: '重点区域预警', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/contactpng.png', content: '重点人员通联', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/packagepng.png', content: '重点目标投递', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/i-person.png', content: '周边五省预警', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/i-person.png', content: '高危人员预警', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/i-news.png', content: '涉杭重点新闻', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false }
    ],
    [
        { image: './resources/images/group.png', content: '重点目标聚集', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/in-area.png', content: '重点区域预警', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/contactpng.png', content: '重点人员通联', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/packagepng.png', content: '重点目标投递', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/i-person.png', content: '周边五省预警', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/i-person.png', content: '高危人员预警', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/i-news.png', content: '涉杭重点新闻', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false }
    ],
    [
        { image: './resources/images/group.png', content: '重点目标聚集', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/in-area.png', content: '重点区域预警', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/contactpng.png', content: '重点人员通联', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/packagepng.png', content: '重点目标投递', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/i-person.png', content: '周边五省预警', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/i-person.png', content: '高危人员预警', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false },
        { image: './resources/images/i-news.png', content: '涉杭重点新闻', count: 0, data: [{ info: 'test item', warntype: '', titleid: '', resultid: '' }], show: false }
    ]
];

var mockData = {
    group_cluster: [
        {
            result_id: '00001',
            format_template: '<font color="yellow"><%= cap_time%></font>共计<%= count%>名<%= group_name%>人员在<%= place_name%>聚集',
            title_template_id: '',
            summary_template_id: '',
            status: 'unprocessed',
            cap_time: '2016-12-09 00:00:00',
            detail_info: {
                cap_time: '2016-12-09 00:00:00',
                count: 4,
                group_name: '涉恐',
                place_name: '浙江大学华家池校区'
            }
        }
    ],
    area_target: [],
    contact_target: [],
    waybill_target: [],
    news: []
};

var targetDetail = [
    {
        nums: 1,
        record: [
            {
                datatype: "location",
                format_template: "<font color='yellow'><%= board_date%></font>，从<%= from_station%>乘坐<%= railway_no%>前往<%= to_station%>",// 模板html
                cap_time: "2016.12.12 00:00:00",
                lat: "",
                lng: "",
                detail_info: {
                    board_date: '2016.12.12 00:00:00',
                    from_station: '上海虹桥',
                    railway_no: 'G223',
                    to_station: '杭州'
                }
            }
        ]
    }, {
        nums: 1,
        record: [
            {
                datatype: "contact",
                format_template: "<font color='yellow'><%= cap_time%></font>，<font color='red'><u><%= user_num%></u></font>与<font color='red'><u><%= oppo_num%></u></font>发生通话，通话时长<%= call_duration%>",// 模板html
                cap_time: "2016.12.12 00:00:00",
                lat: "",
                lng: "",
                detail_info: {
                    cap_time: "2016.12.12 00:00:00",
                    user_num: '1899999999',
                    oppo_num: '1898888888',
                    call_duration: '10分25秒'
                }
            }
        ]
    }, {
        nums: 1,
        record: [
            {
                datatype: "browser",
                format_template: "<font color='yellow'><%= intercept_time%></font>，访问网站<%= dns_name%>",// 模板html
                cap_time: "2016.12.12 00:00:00",
                lat: "",
                lng: "",
                detail_info: {
                    intercept_time: "2016.12.12 00:00:00",
                    dns_name: 'www.baidu.com'
                }
            }
        ]
    }, {
        nums: 1,
        record: [
            {
                datatype: "other",
                format_template: "<font color='yellow'><%= cap_time%></font>，使用VPN",// 模板html
                cap_time: "2016.12.12 00:00:00",
                lat: "",
                lng: "",
                detail_info: {
                    cap_time: "2016.12.12 00:00:00"
                }
            }
        ]
    }
];

/*
 * 5.3.1.1 获取任务列表
 * */
router.get("/gettasklist", charsetMiddleware(), function (req, res) {
    var args=req.query;
//    var args={
//        "subTypeName": "getTaskList",
//        "taskType": "city",
//        "params":
//        {
//        }
//    }
    mylogger.info("gettasklist args is:"+JSON.stringify(args));
    taskRuleService(req).getTaskRule(args).then(function(rsp){
        var data = rsp.data;
        res.endj(data);
    })
    .catch(function(d) {
        mylogger.info('exception:',d);
        res.endj([]);
    });
});

/*
 * 5.3.1.8 获取任务图例信息
 * */
router.get("/gettasklegend", charsetMiddleware(), function (req, res) {
    var args=req.query;
//    var args={
//        "subTypeName": "getTaskLegendParamList",
//        "taskType": "city",
//        "params":
//        {
//            id:"2",
//            name :['area_area_item','vipcountry_item']
//        }
//    }
    mylogger.info("gettasklegend args is:"+JSON.stringify(args));
    taskRuleService(req).getTaskRule(args).then(function(rsp){
            var data = rsp.data;
            res.endj(data);
        })
        .catch(function(d) {
            mylogger.info('exception:',d);
            res.endj({});
        });
    });

/*
* 5.3.3.1 获取威胁列表*
* */
router.get("/getthreatlist", charsetMiddleware(), function (req, res) {
    var args=req.query;
    //var args={
    //    "subTypeName": "getAlertTypeResultByTaskID",
    //    "taskType": "city",
    //    "params":
    //    {
    //        "task_id":"1",
    //        "alert_type":["warn_group_cluster","warn_area_target","warn_contact_target",
    //            "warn_ex_province","warn_news","warn_person","warn_target_hotel",
    //            "warn_waybill_target","warn_target_entry"],
    //        "start_row":"0",
    //        "row_count":"1000",
    //        "start_time":"2017-02-20 00:00:00",
    //        "end_time":"2017-02-20 23:59:59"
    //    }
    //}
    mylogger.info("getthreatlist args is:"+JSON.stringify(args));
    taskResultService(req).getResult(args).then(function(rsp){
        var data = rsp.data;
        res.endj(data);
    })
    .catch(function(d) {
        mylogger.info('exception:',d);
        res.endj({});
    });
});

/*
 *5.3.3.2 获取告警结果条数
 */
router.get("/getalermresultcount", function (req, res) {
    res.endj({ counter: 100 });
});

/**
 * 5.3.3.3 更新结果状态*
 */
router.get("/updateresultstatus", charsetMiddleware(), function (req, res) {
    var args=req.query;
//    var args={
//        "subTypeName": "setProcessed",
//        "taskType": "city",
//        "params":
//        {
//            "result_id":["27166"],
//            "remark":""
//        }
//    }

    mylogger.info("updateresultstatus args is:"+JSON.stringify(args));
    taskResultService(req).updateResult(args).then(function(rsp){
        var data = rsp.data;
        res.endj(data);
    })
        .catch(function(d) {
            mylogger.info('exception:',d);
            res.endj({});
        });
});

/**
 * 5.3.3.4 删除结果
 */
router.get("/deleteresult", function (req, res) {
    res.endj({});
});

/**
 * 5.3.3.5 更新处理意见*
 */
router.get("/updatehandleresult", charsetMiddleware(), function (req, res) {
    var args=req.query;
//    var args={
//        "subTypeName": "updateSuggest",
//        "taskType": "city",
//        "params":
//        {
//            "result_id":["27166"],
//            "type":1,
//            "suggest_type":"handle",
//            "suggest":"同意3",
//            "evaluate":"同意2"
//        }
//    }
    mylogger.info("updatehandleresult args is:"+JSON.stringify(args));
    taskResultService(req).updateResult(args).then(function(rsp){
        var data = rsp.data;
        res.endj(data);
    })
    .catch(function(d) {
        mylogger.info('exception:',d);
        res.endj({});
    });
});

var handleresult = [
    {
        type: 1,
        handleSuggest: '',
        handleTime: '',
        handler: '',
        feedbackSuggest: '',
        feedbackEvaluate: '',
        feedbacker: '',
        feedbackTime: '',
        compSuggest: '',
        compEvaluate: '',
        comp: '',
        compTime: ''
    }
]

/**
 * 5.3.3.6	获取处理意见*
 */
router.get("/gethandleresult", charsetMiddleware(), function (req, res) {
    var args=req.query;
//    var args={
//        "subTypeName": "getResultSuggest",
//        "taskType": "city",
//        "params":
//        {
//            "result_id":"27166"
//        }
//    }

    mylogger.info("gethandleresult args is:"+JSON.stringify(args));
    taskResultService(req).getResult(args).then(function(rsp){
        var data = rsp.data;
        res.endj(data);
    })
        .catch(function(d) {
            mylogger.info('exception:',d);
            res.endj({});
        });
});

/**
 * 5.3.3.7  威胁详情
 */
router.get("/getthreatdetail",charsetMiddleware(),function(req,res){
    var args = req.query;
//    var args={
//        "subTypeName": "getResultByID",
//        "taskType": "city",
//        "params":
//        {
//            "result_id":"123"
//        }
//    }
    mylogger.info("getthreatdetail args is:"+JSON.stringify(args));
    taskResultService(req).getResult(args).then(function(rsp){
        var data = rsp.data;
        res.endj(data);
    })
        .catch(function(d) {
            mylogger.info('exception:',d);
            res.endj({});
        });

})

var threatendetail = {
    result_id: "",
    format_template: "XXX",
    title_template_id: '',
    summary_template_id: "222",
    data_type: "DATA_CALL",
    status: "unprocessed",
    rule_id: 136,
    rule_name: '',
    sub_rule_id: 136,
    cdr_id: "1234frt-7676f",// 告警消息对应的话单唯一编号，当存在cdrs不为空值时该值为空
    cap_tim: "2016-12-09 00:00:00",
    detail_info:
    {
        data_type: "DATA_CALL",  //话单可能属于不同的数据类型
        oppo_num: "13811223344",  //示例数据类型DATA_CALL中需要返回的字段
        lat: "12.234",
        lng: "12.345",
        oppo_country: "81"
    },
    cdrs:     //当cdr_id值不为空时，该值为空数组
    [
        {
            data_type: "DATA_CALL",  //话单可能属于不同的数据类型
            format_template: "XXX",  //每条话单字段的界面描述方式（format串）
            cap_time: "2016-12-01 12:14:38",
            oppo_num: "13811223344",  //示例数据类型DATA_CALL中需要返回的字段
            lat: "12.234",
            lng: "12.345",
            oppo_country: "81",
            cdr_id: "1234frt-7676f" // 告警消息对应的话单唯一编号
        }
    ]
}


/**
 * 5.3.3.7	威胁详情
 */
//router.get("/getthreatdetail", function (req, res) {
//    res.endj(threatendetail);
//});


/**
 * 5.3.4 统计结果获取
 *
 */
router.get("/getstatisticresult",charsetMiddleware(), function(req,res){
    var args=req.query;
//    var no=req.query.id;
//    console.log("params id is: "+no);
//    //5.3.4.1
//    switch (no){
//        case '1':
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_area_area_map",
//                        "param":
//                        {
//                            "task_id": "1",
//                            "type":"province",
//                            "time":"2016-11-12 12:00:00",
//                            "to": "杭州",
//                            "item":["person","order"]
//
//                        }
//                    }
//                ]
//            };
//            break;
//        case '2':
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_vipcountry_pie",
//                        "param":
//                        {
//                            "task_id": "1", //任务id
//                            "start_time": "2016-09-01 00:00:00",
//                            "end_time": "2016-09-05 23:59:59", //统计包含端点时间
//                            "vip_country":["阿富汗","叙利亚","美国","日本","韩国"],
//                            "item":["person","tel"]//取值暂为person, tel
//                        }
//                    }
//                ]
//            };
//            break;
//        case '3':
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_vipcountry_bar_line",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "start_time": "2016-09-01 00:00:00",
//                            "end_time": "2016-09-05 23:59:59", //统计包含端点时间
//                            "vip_country":["阿富汗","叙利亚","美国","日本","韩国"],
//                            "item":{"name":"person","type":"bar"}
//                        }
//                    }
//                ]
//            };
//            break;
//        case '4':
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_target_bar_line",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "start_time": "2016-09-01 00:00:00",
//                            "end_time": "2016-09-05 23:59:59",
//                            "item":[
//                                {"name":"tel","type":"bar"},
//                                {"name":"im","type":"line"},
//                                {"name":"dns","type":"bar"},
//                                {"name":"email","type":"bar"},
//                                {"name":"sns","type":"line"},
//                                {"name":"vpn","type":"bar"}
//                            ]
//                        }
//                    }
//                ]
//            };
//            break;
//        case '5':
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_region_bar_line",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "start_time": "2016-09-01 00:00:00",
//                            "end_time": "2016-09-05 23:59:59",
//                            "item":[
//                                {"name":"target_num","type":"bar"},
//                                {"name":"total_num","type":"line"},
//                                {"name":"tel_num","type":"line"},
//                                {"name":"region_score","type":"bar"}
//                            ]
//
//                        }
//                    }
//                ]
//            };
//            break
//        case '6':
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_region_list",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "time":"2016-11-13 12:00:00",
//                            "vip_region":["中华门","集庆门大街","莫愁湖","汉中门","新街口","西安门"],
//                            "item":["target_num","total_num","tel_num","region_score"]
//                        }
//                    }
//                ]
//            };
//            break;
//        case '7':
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_threat_radar",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "time":"2016-11-13 12:00:00",
//                            "series":["实际数","平均数"],
//                            "item":["target_num","region_target_num","target_tel_num","high_threat_person_num","threat_num","threat_score"]
//                        }
//                    }
//                ]
//            };
//            break;
//        case '8':
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_threat_bar_line",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "start_time": "2016-09-01 00:00:00",
//                            "end_time": "2016-09-05 23:59:59",//包含端点时间
//                            "type":"bar"// 取值bar/line
//                        }
//                    }
//                ]
//            };
//            break;
//        case '9':
//            //5.3.4.9
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_distribution_heat_map",
//                        "param":
//                        {
//                            "task_id": "1", //任务id
//                            time:'2016-09-01 12:18:00'
//                        }
//                    }
//                ]
//            }
//            break;
//        case '10':
//            //5.3.4.10
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_target_location_map",
//                        "param":
//                        {
//                            "task_id": "1", //任务id
//                            "time":"2017-01-12 12:12:23"
//                        }
//                    }
//                ]
//            }
//            break;
//        case '11':
//            //5.3.4.11
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "index_activity_data_count",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "time":"2017-01-12 12:12:23"
//                        }
//                    }
//                ]
//            }
//            break;
//        case '12':
//            //5.3.4.12
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "yj_info_stat_pie",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "alert_type":["warn_contact_target","warn_news","warn_ex_province","warn_area_target"],//要统计的类型
//                            "time":"2017-01-12 12:12:23"
//                        }
//                    }
//                ]
//            }
//            break;
//        case '13':
//            //5.3.4.13
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "yj_info_num_bar_line",
//                        "param":
//                        {
//                            "task_id": "1", //任务id
//                            "start_time":"2016-11-06 00:00:00",
//                            "end_time":"2016-11-06 23:00:00",
//                            "item":[
//                                {
//                                    "name":"warn_contact_target",
//                                    "type":"line"
//                                },
//                                {
//                                    "name":"warn_person",
//                                    "type":"line"
//                                },
//                                {
//                                    "name":"warn_ex_province",
//                                    "type":"bar"
//                                },
//                                {
//                                    "name":"warn_area_target",
//                                    "type":"line"
//                                }
//                            ]
//                        }
//                    }
//                ]
//            }
//            break;
//        case '14':
//            //5.3.4.14
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "yj_info_process_bar_line",
//                        "param":
//                        {
//                            "task_id": "1", //任务id
//                            "start_time":"2016-11-06 00:00:00",
//                            "end_time":"2016-11-06 23:00:00",
//                            "item":[
//                                {
//                                    "name":"unprocessed",
//                                    "type":"bar"
//                                },
//                                {
//                                    "name":"processing",
//                                    "type":"line"
//                                },
//                                {
//                                    "name":"processed",
//                                    "type":"bar"
//                                }
//                            ]
//                        }
//                    }
//                ]
//            }
//            break;
//        case '15':
//            //5.3.4.15
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "yj_info_increase_bar_line",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "start_time":"2016-09-01 12:00:00",
//                            "end_time":"2016-09-05 12:00:00",
//                            "item":[
//                                {"name":"target_increase","type":"bar"},
//                                {"name":"score_increase","type":"line"}
//                            ]
//                        }
//                    }
//                ]
//            }
//            break;
//        case '16':
//            //5.3.4.16
//            var args={
//                "taskType": "city",
//                "subRpTasks":[
//                    {
//                        "subTypeName": "yj_info_data_count",
//                        "param":
//                        {
//                            "task_id": "2", //任务id
//                            "time":"2017-01-12 12:12:23"
//                        }
//                    }
//                ]
//            }
//            break;
//    }
    mylogger.info("getstatisticresult args is :" + JSON.stringify(args));

     echartService(req).getChartReport(args).then(function(rsp){
         var data = rsp.data;
         res.endj(data);
     })
     .catch(function(d) {
         mylogger.info('exception:',d);
         res.endj({});
     });
})

/**
 * 5.3.5.1	区域态势报告获取
 */
router.get('/getregionsituationreport',function (req, res, next) {
    res.writeHead(200, { 'Content-Type': "text/html;charset=utf-8" });
    next();
},function(req,res){
    var args=req.query;
//    var args={
//        "subTypeName":"day_report_html",
//            "taskType": "city",
//            "params":
//            {
//                "time":"2016-11-12 00:00:00",
//                "task_id":"1"
//            }
//    }
    mylogger.info("getregionsituationreport args is :" + JSON.stringify(args));
    reportService(req).getReport(args).then(function(rsp){
        var data = rsp.data.data;
        //console.log(data);
        //res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
        res.end(data);
    })
    .catch(function(d) {

        mylogger.info('exception:',d);
        res.endj({});
    });
});

/**
 * 5.3.6.1	人员流等详情获取
 */
router.get('/getpersonalturnoverdetail',charsetMiddleware(),function(req,res){
    var args=req.query;
//    var args = {
//            "subTypeName":"getBillDataByDay",
//            "taskType": "city",
//            "params":
//            {
//                "start_time":"2016-09-01 00:00:00",
//                "end_ime":"2017-09-01 23:59:59",
//                "item":"person",
//                "from_type":"province",
//                "to_type":"province",
//                "from":"新疆",
//                "to":"浙江",
//                "offset":0,
//                "limit":1000
//
//            }
//        };
    mylogger.info("getpersonalturnoverdetail args is :" + JSON.stringify(args));
    billDetailService(req).getBillData(args).then(function(rsp){
        var data = rsp.data;
        res.endj(data);
    })
        .catch(function(d) {
            mylogger.info('exception:',d);
            res.endj({});
        });
})

/**
 * 5.3.6.2	目标详情获取
 */
router.get("/gettargetdetail", charsetMiddleware(),function (req, res) {
    var args=req.query;
//    var args = {
//        "subTypeName":"getBillDataByTargetID",
//        "taskType": "city",
//        "params":
//        {
//            "task_id":1,
//            "time":"2016-09-01 12:00:00",
//            "type":["位置","通联","浏览","次数"],
//            "uuid":"516985",
//            "limit":20
//        }
//    };
    mylogger.info("gettargetdetail args is :" + JSON.stringify(args));
    billDetailService(req).getBillData(args).then(function(rsp){
        var data = rsp.data;
        res.endj(data);
    })
        .catch(function(d) {
            mylogger.info('exception:',d);
            res.endj({});
        });
});

/**
 * 5.3.3.8	获取威胁目标关系图（通过任务id，wangjue使用）
 */
router.get("/getrelationgraph", charsetMiddleware(), function (req, res){
    var args = req.query;
//    var args={
//        "subTypeName":"getUUIDByTaskID",
//        "taskType": "city",
//        "params":
//        {
//            "task_id":"1",
//            "time":"2017-01-01 00:00:00"
//        }
//    }
    taskResultService(req).getResult(args).then(function(rsp){
        var targetList = rsp.data;
        //var targetList = []
        var getrelationargs = {
            targetIds:targetList
        }
        mylogger.info('threat targets ids :'+ JSON.stringify(targetList));
        personrelationService(req).analyzeTargetRelation(getrelationargs)
            .then(function(rsp) {
                var data = rsp.data;
                mylogger.info('relation graph is :'+ JSON.stringify(data));
                res.endj(data);
            })
            .catch(function(d) {
                mylogger.info('get target relation graph error. exception',d);
                res.endj({});
            });
    }).catch(function(d){
        mylogger.info('get threat target error. exception:',d);
        res.endj({});
    })
});

/**
 * 通过uuid获取关系图（maxiaodan使用）
 */
router.get("/getrelationgraphbyuuid",charsetMiddleware(), function (req, res){
    var args = req.query;
//    var getrelationargs = {
//        targetIds:targetList
//    }
    mylogger.info("getrelationgraphbyuuid args is :" + JSON.stringify(args));
    personrelationService(req).analyzeTargetRelation(args)
        .then(function(rsp) {
            var data = rsp.data;
            mylogger.info('relation graph is :'+ JSON.stringify(data));
            res.endj(data);
        })
        .catch(function(d) {
            mylogger.info('get target relation graph error. exception',d);
            res.endj({});
        });
})

router.get("/test", charsetMiddleware(), function (req, res){
    var getrelationargs = {
        targetIds:[
            518660
        ]//,
        //findContactsLevel:0
    }
    mylogger.info('test args is :'+ JSON.stringify(getrelationargs));
    personrelationService(req).analyzeTargetRelation(getrelationargs)
        .then(function(rsp) {
            var data = rsp.data;
            mylogger.info('relation graph is :'+ JSON.stringify(data));
            res.endj(data);
        })
        .catch(function(d) {
            mylogger.info('get target relation graph error. exception',d);
            res.endj({});
        });
});

router.get("/setrecordlog", charsetMiddleware(), function (req, res) {
    var args = req.query;

    // var args = {
    //     "taskType": "city",
    //     "subRpTasks": [
    //          {
    //              subTypeName: record_log,
    //              param: {
    //                  "task_id": "1", //任务id
    //                  "item": "city"  //city / threat分别对应态势感知和威胁预警
    //              }
    //          }
    //     ]
    // };

    mylogger.info("setrecordlog args is :" + JSON.stringify(args));
    echartService(req).getChartReport(args).then(function (rsp) {
        var data = rsp.data;
        res.endj(data);
    })
    .catch(function (d) {
        mylogger.info('exception:', d);
        res.endj({});
    });
})


module.exports = router;