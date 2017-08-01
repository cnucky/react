/**
 * Created by 841 on 2017/2/9.
 */

require([
    "../../../config",
    "../lib/vue/vue",
    "../module/TaiShi_WeiXie_Gis",
    "../module/dlg",
    "../module/echartsPie",
    "../module/echartsBarLine"
], function (config, Vue, gis) {

var MAX = 200;
    var legendDic = {};
    var mapControl;

    var chartNames = ["threat_name_list", "threat_bill_type_list", "threat_process_department", "threat_high_score_stat", "threat_cycling_get_interval"];
    var currentTask;
    var last_time;
    var threatList;
    var dlg;
    var imageUrl = {
        warn_group_cluster: './img/group.png',
        warn_area_target: './img/in-area.png',
        warn_contact_target: './img/contactpng.png',
        warn_waybill_target: './img/packagepng.png',
        warn_news: './img/i-news.png',
        warn_person: './img/i-person.png',
        warn_target_hotel: './img/contactpng.png',
        warn_target_entry: './img/packagepng.png',
        warn_ex_province: './img/in-area.png'
    };
    var selectedImageUrl = {
        warn_group_cluster: './img/selected-group.png',
        warn_area_target: './img/selected-in-area.png',
        warn_contact_target: './img/selected-contactpng.png',
        warn_waybill_target: './img/selected-packagepng.png',
        warn_news: './img/selected-i-news.png',
        warn_person: './img/selected-i-person.png',
        warn_target_hotel: './img/selected-contactpng.png',
        warn_target_entry: './img/selected-packagepng.png',
        warn_ex_province: './img/selected-in-area.png'
    };
    var alertType = [];
    var billType = [];
    var processDep = [];
    var processStat = [];
    var cyclingInerval;
    // var railwaytemplate = "重点人员(<font color='red'><u><%= entity%></u></font>)乘坐火车<%= railway_no%>从<%= from_province%><%= from_station%>前往<%= to_station%>";
    // var airwaytemplate = "重点人员(<font color='red'><u><%= entity%></u></font>)乘坐航班<%= flt_code%>从<%= deptname%>前往<%= destname%>";
    // var areatemplate = "<font color='yellow'><%= cap_time%></font><%= group_name%>重点人员<font color='red'><u><%= entity%></u></font>进入<%= areaname%>";
    var getTime = function () {
        var date = new Date();
        var time = (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() + ":" + (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
        if (currentTask.info.force_day !== undefined)
            time = currentTask.info.force_day + " " + time;
        else
            time = date.getFullYear() + "-" + (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" : "") + date.getDate() + " " + time;

        return time;
    }
    var vm = new Vue({
        el: '#main',
        data: {
            loading: false,
            empty:false,
            showMenu: false,
            tasks: [],
            taskTitle: '',
            totalNum: '',
            hitNum: '',
            tabs: [{
                    content: '未处置',
                    isActive: true,
                    count: 0,
                    status: 'unprocessed'
                },
                {
                    content: '处置中',
                    isActive: false,
                    count: 0,
                    status: 'processing'
                },
                {
                    content: '已处置',
                    isActive: false,
                    count: 0,
                    status: 'processed'
                }
            ],
            types: {},
            typeDetail: {},
            threatItemDetail: {},
            pies: {
                "dataConfig": [],
                "styleConfig": {
                    isEnlarge: false
                }
            },
            bar: {
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
                    items: {
                        12584: {
                            type: 'bar'
                        },
                        12585: {
                            type: 'bar'
                        }
                    },
                    isEnlarge: false
                }
            },
            line: {
                "dataConfig": {
                    columnTitle: [{
                        value: ''
                    }],
                    rowTitle: [],
                    content: []
                },
                "styleConfig": {
                    items: {
                        12584: {
                            type: 'line'
                        },
                        12585: {
                            type: 'line'
                        }
                    },
                    isEnlarge: false
                }
            }
        },
        methods: {
            click: function (event) {
                this.showMenu = false;
            },
            selectTask: function (task) {
                if (task.isCurrent)
                    return;
                setTask(task);
                this.showMenu = false;
            },
            showTab: function (event) {
                var index = parseInt(event.currentTarget.attributes.propindex.value);
                if (index == 0) {
                    this.tabs[0].isActive = true;
                    this.tabs[1].isActive = false;
                    this.tabs[2].isActive = false;
                } else if (index == 1) {
                    this.tabs[0].isActive = false;
                    this.tabs[1].isActive = true;
                    this.tabs[2].isActive = false;
                } else {
                    this.tabs[0].isActive = false;
                    this.tabs[1].isActive = false;
                    this.tabs[2].isActive = true;
                }
                this.types = threatList[index];
                var selectedWarnType;
                for (var i = 0; i < threatList[index].length; i++) {
                    if (threatList[index][i].selected) {
                        selectedWarnType = i;
                        break;
                    }
                }
                vm.typeDetail = threatList[index][selectedWarnType];
                for (var j = 0; j < vm.typeDetail.data.length; j++) {
                    if (vm.typeDetail.data[j].showDetail) {
                        vm.typeDetail.data[j].showDetail = false;
                    }
                }
                //地图调用清楚上一条数据的活动信息
                mapControl.clearActionsLayer();

            },
            showDetail: function (event) {
                var index = parseInt(event.currentTarget.attributes.propindex.value);
                if (this.types[index].selected)
                    return;
                else {
                    for (var i = 0; i < this.types.length; i++) {
                        if (this.types[i].selected) {
                            this.types[i].selected = false;
                            this.types[i].image = imageUrl[this.types[i].type];
                        }
                    }
                    this.types[index].selected = true;
                    this.types[index].image = selectedImageUrl[this.types[index].type];
                    this.typeDetail = this.types[index];
                }
                for (var j = 0; j < this.typeDetail.data.length; j++) {
                    if (vm.typeDetail.data[j].showDetail) {
                        vm.typeDetail.data[j].showDetail = false;
                    }
                }
                //地图调用清楚上一条数据的活动信息
                mapControl.clearActionsLayer();
            },
            showItem: function (event) {
                var item = event.currentTarget;
                var index = parseInt(event.currentTarget.attributes.propindex.value);
                var id = event.currentTarget.id;

                //如果详细框已经打开则关闭
                if (this.typeDetail.data[index].showDetail) {
                    this.typeDetail.data[index].showDetail = false;
                    //地图调用清楚上一条数据的活动信息
                    mapControl.clearActionsLayer();
                    return;
                }

                var billTypes = [];
                for (var j = 0; j < billType.length; j++) {
                    billTypes.push(billType[j].chn);
                }

                var params;
                if (this.typeDetail.data[index].uuid == "") {
                    var type = this.typeDetail.data[index].people[0].type;

                    if (type == 'uuid') {
                        params = {
                            "subTypeName": "getBillDataByTargetID",
                            "taskType": "city",
                            "params": {
                                "task_id": currentTask.id,
                                "time": getTime(),
                                "type": billTypes,
                                "uuid": this.typeDetail.data[index].people[0].param,
                                "limit": 20
                            }
                        };
                    } else if (type == 'phone') {
                        params = {
                            "subTypeName": "getBillDataByPhone",
                            "taskType": "city",
                            "params": {
                                "task_id": currentTask.id,
                                "time": getTime(),
                                "type": billTypes,
                                "phone": this.typeDetail.data[index].people[0].param,
                                "limit": 20
                            }
                        };
                    } else if (type == 'cert_no') {
                        params = {
                            "subTypeName": "etBillDataByCertNo",
                            "taskType": "city",
                            "params": {
                                "task_id": currentTask.id,
                                "time": getTime(),
                                "type": billTypes,
                                "cert_no": this.typeDetail.data[index].people[0].param,
                                "limit": 20
                            }
                        };
                    }
                } else {
                    params = {
                        "subTypeName": "getBillDataByTargetID",
                        "taskType": "city",
                        "params": {
                            "task_id": currentTask.id,
                            "time": getTime(),
                            "type": billTypes,
                            "uuid": this.typeDetail.data[index].uuid,
                            "limit": 20
                        }
                    };
                }

                //地图联动定位
                mapControl.locateThreatOnMap(item.id);

                vm.threatItemDetail = generateItemDetail(index);
                invokeService('/dapservices/gettargetdetail', params, function (data) {
                    //生成所有活动信息    
                    var trace = getTraceList(data);
                    vm.threatItemDetail.kinds = trace.kinds;
                    vm.threatItemDetail.alltraceList = trace.alltraceList;
                    vm.threatItemDetail.traceList = trace.traceList;
                    //地图调用清楚上一条数据的活动信息
                    mapControl.clearActionsLayer();
                });
                //界面展示
                for (var i = 0; i < vm.typeDetail.data.length; i++) {
                    if (id == vm.typeDetail.data[i].resultid && vm.typeDetail.data[i].readflag == false) {
                        vm.typeDetail.data[i].readflag = true;
                        vm.typeDetail.notreadNum -= 1;
                    }
                    vm.typeDetail.data[i].showDetail = false;
                }
                vm.typeDetail.data[index].showDetail = true;
            },

            //itemdetail methods

            //底端处置或者反馈按钮事件
            ok: function (event) {
                var status;
                for (var i = 0; i < this.tabs.length; i++) {
                    if (this.tabs[i].isActive) {
                        status = this.tabs[i].status;
                        break;
                    }
                }
                //生成部门选择标签
                this.threatItemDetail.processDeps = [];
                for (var i = 0; i < processDep.length; i++) {
                    this.threatItemDetail.processDeps.push({
                        name: processDep[i].chn,
                        type: processDep[i].eng,
                        suggest: '',
                        feedback: '',
                        evaluate: '',
                        isActive: i == 0 ? true : false
                    });
                }
                //根据不同的状态弹出不同的对话框
                if (status == 'unprocessed') {

                    this.threatItemDetail.modalShow = true;
                    this.threatItemDetail.threatHandleShow = true;
                }
                if (status == 'processing') {
                    var result_id = this.threatItemDetail.id;
                    invokeService("/dapservices/gethandleresult", {
                        "subTypeName": "getResultSuggest",
                        "taskType": "city",
                        "params": {
                            "result_id": result_id
                        }
                    }, function (data) {
                        for (var i = 0; i < data.length; i++) {
                            for (var j = 0; j < vm.threatItemDetail.processDeps.length; j++) {
                                if (data[i].type == vm.threatItemDetail.processDeps[j].type) {
                                    vm.threatItemDetail.processDeps[j].suggest = data[i].handleSuggest;
                                    if (!_.isUndefined(data[i].feedbackSuggest)) {
                                        vm.threatItemDetail.processDeps[j].feedback = data[i].feedbackSuggest;
                                        vm.threatItemDetail.processDeps[j].evaluate = data[i].feedbackEvaluate.trim() == '' ? '低' : data[i].feedbackEvaluate;
                                    }
                                }
                            }
                        }

                        //界面显示
                        vm.threatItemDetail.modalShow = true;
                        if (vm.threatItemDetail.processDeps[0].suggest == '') {
                            vm.threatItemDetail.suggestContent = '';
                            vm.threatItemDetail.threatHandleShow = true;
                            vm.threatItemDetail.evaluatShow = false;
                            vm.threatItemDetail.compShow = false;
                        } else if (vm.threatItemDetail.processDeps[0].suggest != '' && vm.threatItemDetail.processDeps[0].evaluate == '') {
                            vm.threatItemDetail.suggestContent = vm.threatItemDetail.processDeps[0].suggest;
                            vm.threatItemDetail.evaluateContent = '';
                            vm.threatItemDetail.evaluatePicked = '低';
                            vm.threatItemDetail.threatHandleShow = false;
                            vm.threatItemDetail.evaluatShow = true;
                            vm.threatItemDetail.compShow = false;
                        } else if (vm.threatItemDetail.processDeps[0].suggest != '' && vm.threatItemDetail.processDeps[0].evaluate != '') {
                            if (vm.threatItemDetail.processDeps.length == 1 || vm.threatItemDetail.processDeps[0].type == '5') {
                                vm.threatItemDetail.suggestContent = vm.threatItemDetail.processDeps[0].suggest;
                                vm.threatItemDetail.evaluateContent = vm.threatItemDetail.processDeps[0].feedback;
                                vm.threatItemDetail.evaluatePicked = '低';
                                vm.threatItemDetail.compContent = '';
                                vm.threatItemDetail.threatHandleShow = false;
                                vm.threatItemDetail.evaluatShow = false;
                                vm.threatItemDetail.compShow = true;
                            } else {
                                vm.threatItemDetail.suggestContent = vm.threatItemDetail.processDeps[0].suggest;
                                vm.threatItemDetail.evaluateContent = vm.threatItemDetail.processDeps[0].feedback;
                                vm.threatItemDetail.evaluatePicked = vm.threatItemDetail.processDeps[0].evaluate;
                                vm.threatItemDetail.threatHandleShow = false;
                                vm.threatItemDetail.evaluatShow = true;
                                vm.threatItemDetail.compShow = false;
                            }
                        }
                    });

                }
                if (status == 'processed') {

                }
            },
            //低端关闭按钮事件
            close: function () {
                for (var i = 0; i < this.typeDetail.data.length; i++) {
                    this.typeDetail.data[i].showDetail = false;
                }
            },
            //右上角报告按钮事件
            report: function () {
                var id = vm.threatItemDetail.id;
                var random = Math.random().toString();
                var force_time;
                if (currentTask.info.force_day !== undefined) {
                    force_time = currentTask.info.force_day
                } else {
                    force_time = "";
                }
                window.open('threat-report.html#' + id + '&' + currentTask.id + '&' + force_time + '&' + random);
            },
            //选择相关人员事件
            selectPerson: function (event) {
                var index = parseInt(event.currentTarget.attributes.propindex.value);
                var billTypes = [];
                for (var j = 0; j < billType.length; j++) {
                    billTypes.push(billType[j].chn);
                }
                var params;
                if (this.threatItemDetail.persons[index].type == 'uuid') {
                    params = {
                        "subTypeName": "getBillDataByTargetID",
                        "taskType": "city",
                        "params": {
                            "task_id": currentTask.id,
                            "time": getTime(),
                            "type": billTypes,
                            "uuid": this.threatItemDetail.persons[index].id,
                            "limit": 20
                        }
                    };
                } else if (this.threatItemDetail.persons[index].type == 'phone') {
                    params = {
                        "subTypeName": "getBillDataByPhone",
                        "taskType": "city",
                        "params": {
                            "task_id": currentTask.id,
                            "time": getTime(),
                            "type": billTypes,
                            "phone": this.threatItemDetail.persons[index].id,
                            "limit": 20
                        }
                    };
                } else if (this.threatItemDetail.persons[index].type == 'cert_no') {
                    params = {
                        "subTypeName": "etBillDataByCertNo",
                        "taskType": "city",
                        "params": {
                            "task_id": currentTask.id,
                            "time": getTime(),
                            "type": billTypes,
                            "cert_no": this.threatItemDetail.persons[index].id,
                            "limit": 20
                        }
                    };
                }
                invokeService('/dapservices/gettargetdetail', params, function (data) {
                    var trace = getTraceList(data);
                    vm.threatItemDetail.kinds = trace.kinds;
                    vm.threatItemDetail.alltraceList = trace.alltraceList;
                    vm.threatItemDetail.traceList = trace.traceList;


                    //界面展示
                    if (vm.threatItemDetail.persons[index].isActive == true)
                        return;
                    for (var i = 0; i < vm.threatItemDetail.persons.length; i++) {
                        vm.threatItemDetail.persons[i].isActive = false;
                    }
                    vm.threatItemDetail.persons[index].isActive = true;

                    //地图调用清楚上一条数据的活动信息
                    mapControl.clearActionsLayer();
                });

            },
            //身份按钮事件弹框显示人立方
            showpeopleinfo: function () {
                var people;
                for (var i = 0; i < vm.threatItemDetail.persons.length; i++) {
                    if (vm.threatItemDetail.persons[i].isActive) {
                        people = vm.threatItemDetail.persons[i];
                        break;
                    }
                }
                if (_.isUndefined(people))
                    return;
                if (people.type == 'uuid') {
                    //弹敌情库
                    showbox('<iframe width="100%" height="100%" src="' + config.acHost + '/ac/ac-detail.html?peopleid=' + people.id + '"></iframe>');
                } else if (people.type == 'phone') {
                    //弹人立方
                    showbox('<iframe width="100%" height="100%" src="' + config.renHost + '/renlifang/profile.html?entityid=' + window.btoa(people.id) + '&entitytype=' + window.btoa(5) + '"></iframe>');
                } else if (people.type == 'cert_no') {
                    //弹人立方
                    showbox('<iframe width="100%" height="100%" src="' + config.renHost + '/renlifang/profile.html?entityid=' + window.btoa(people.id) + '&entitytype=' + window.btoa(1) + '"></iframe>');
                }
            },
            //关系按钮事件弹框显示相关人员的关系图
            showpeoplerelation: function () {
                var people = [];
                for (var i = 0; i < vm.threatItemDetail.persons.length; i++) {
                    people.push(vm.threatItemDetail.persons[i].id);
                }
                invokeService("/dapservices/getrelationgraphbyuuid", {
                    targetIds: people
                }, function (data) {
                    //关系图表
                    showbox('');
                });
            },
            //活动轨迹类型选择事件
            selectKind: function (event) {
                var text = event.currentTarget.attributes.propvalue.value;
                var index = parseInt(event.currentTarget.attributes.propindex.value);
                if (this.threatItemDetail.kinds[index].isActive == true)
                    return;
                for (var i = 0; i < this.threatItemDetail.kinds.length; i++) {
                    this.threatItemDetail.kinds[i].isActive = false;
                }
                this.threatItemDetail.kinds[index].isActive = true;

                var type;
                for (var i = 0; i < this.threatItemDetail.kinds.length; i++) {
                    if (this.threatItemDetail.kinds[i].content == text) {
                        type = this.threatItemDetail.kinds[i].content;
                        break;
                    }
                }
                if (type == '全部') {
                    this.threatItemDetail.traceList = this.threatItemDetail.alltraceList;
                    return;
                } else {
                    this.threatItemDetail.traceList = [];
                    for (var j = 0; j < this.threatItemDetail.alltraceList.length; j++) {
                        if (this.threatItemDetail.alltraceList[j].type == type) {
                            this.threatItemDetail.traceList.push(this.threatItemDetail.alltraceList[j]);
                        }
                    }
                }
            },
            //点击某一条活动的事件
            showactivity: function () {
                var item = event.currentTarget;
                var lat = item.attributes.proplat.value;
                var lng = item.attributes.proplng.value;
                var datatype = item.attributes.type.value;
                var tolat = item.attributes.proptolat.value;
                var tolng = item.attributes.proptolng.value;

                mapControl.showAction({
                    lat: lat,
                    lng: lng,
                    datatype: datatype,
                    to_lat: tolat,
                    to_lng: tolng
                });

            },
            //处置意见手段选择事件
            selectProcessDep: function (event) {
                var index = parseInt(event.currentTarget.attributes.propindex.value);
                if (this.threatItemDetail.processDeps[index].isActive == true)
                    return;
                for (var i = 0; i < this.threatItemDetail.processDeps.length; i++) {
                    if (this.threatItemDetail.processDeps[i].isActive) {
                        this.threatItemDetail.processDeps[i].isActive = false;
                        break;
                    }
                }
                this.threatItemDetail.processDeps[index].isActive = true;
                if (this.threatItemDetail.processDeps[index].suggest == '') {
                    this.threatItemDetail.suggestContent = '';
                    this.threatItemDetail.threatHandleShow = true;
                    this.threatItemDetail.evaluatShow = false;
                    this.threatItemDetail.compShow = false;
                } else if (this.threatItemDetail.processDeps[index].suggest != '' && this.threatItemDetail.processDeps[index].evaluate == '') {
                    this.threatItemDetail.suggestContent = this.threatItemDetail.processDeps[index].suggest;
                    this.threatItemDetail.evaluateContent = '';
                    this.threatItemDetail.evaluatePicked = '低';
                    this.threatItemDetail.threatHandleShow = false;
                    this.threatItemDetail.evaluatShow = true;
                    this.threatItemDetail.compShow = false;
                } else if (this.threatItemDetail.processDeps[index].suggest != '' && this.threatItemDetail.processDeps[index].evaluate != '') {
                    if (this.threatItemDetail.processDeps[index].type == '5') {
                        this.threatItemDetail.suggestContent = this.threatItemDetail.processDeps[index].suggest;
                        this.threatItemDetail.evaluateContent = this.threatItemDetail.processDeps[index].feedback;
                        this.threatItemDetail.evaluatePicked = '低';
                        this.threatItemDetail.compContent = '';
                        this.threatItemDetail.threatHandleShow = false;
                        this.threatItemDetail.evaluatShow = false;
                        this.threatItemDetail.compShow = true;
                    } else {
                        this.threatItemDetail.suggestContent = this.threatItemDetail.processDeps[index].suggest;
                        this.threatItemDetail.evaluateContent = this.threatItemDetail.processDeps[index].feedback;
                        this.threatItemDetail.evaluatePicked = this.threatItemDetail.processDeps[index].evaluate;
                        this.threatItemDetail.threatHandleShow = false;
                        this.threatItemDetail.evaluatShow = true;
                        this.threatItemDetail.compShow = false;
                    }

                }
            },
            //提交处置意见按钮事件
            submitsuggestion: function () {
                var result_id = [];
                result_id.push(this.threatItemDetail.id);
                this.threatItemDetail.alltraceList.forEach(function (element) {
                    if(element.resultid!==undefined && element.resultid!==''&& element.status == 'unprocessed')
                        result_id.push(element.resultid);
                }, this);
                var type;
                for (var j = 0; j < this.threatItemDetail.processDeps.length; j++) {
                    for (var i = 0; i < processDep.length; i++) {
                        if (this.threatItemDetail.processDeps[j].isActive && this.threatItemDetail.processDeps[j].name == processDep[i].chn) {
                            type = parseInt(processDep[i].eng);
                            break;
                        }
                    }
                }
                var suggest = this.threatItemDetail.suggestContent.trim();

                if (this.threatItemDetail.suggestContent.trim() == '')
                    return;
                else {
                    invokeService("/dapservices/updatehandleresult", {
                        "subTypeName": "updateSuggest",
                        "taskType": "city",
                        "params": {
                            "result_id": result_id,
                            "type": type,
                            "suggest_type": "handle",
                            "suggest": suggest,
                            "evaluate": " "
                        }
                    }, function (data) {
                        if (data == "update success") {
                            var status = getstatus();
                            if (status == 'unprocessed') {
                                invokeService("/dapservices/updateresultstatus", {
                                    "subTypeName": "setProcessing",
                                    "taskType": "city",
                                    "params": {
                                        "result_id": result_id,
                                        "remark": " "
                                    }
                                }, function (data) {
                                    if (data == "update success!") {
                                        //把未处理的状态变为已处理
                                        setProcessing(result_id);
                                    } else {
                                        vm.threatItemDetail.submittipcontent = '变更威胁状态失败！';
                                        vm.threatItemDetail.submittip = true;
                                        setTimeout(function () {
                                            vm.threatItemDetail.submittipcontent = '';
                                            vm.threatItemDetail.submittip = false;
                                        }, 3000);
                                    }
                                });
                            }
                            if (status == 'processing') {
                                vm.threatItemDetail.modalShow = false;
                            }

                        } else {
                            vm.threatItemDetail.submittipcontent = '提交处置意见失败！';
                            vm.threatItemDetail.submittip = true;
                            setTimeout(function () {
                                vm.threatItemDetail.submittipcontent = '';
                                vm.threatItemDetail.submittip = false;
                            }, 3000);
                        }
                    });
                }

            },
            cancelSuggestion: function () {
                this.threatItemDetail.modalShow = false;
            },
            //提交处置意见的反馈按钮事件
            submitEvaluation: function () {
                var result_id = [];
                result_id.push(this.threatItemDetail.id);
                var type;
                for (var j = 0; j < this.threatItemDetail.processDeps.length; j++) {
                    for (var i = 0; i < processDep.length; i++) {
                        if (this.threatItemDetail.processDeps[j].isActive && this.threatItemDetail.processDeps[j].name == processDep[i].chn) {
                            type = parseInt(processDep[i].eng);
                            break;
                        }
                    }
                }
                var feedback = this.threatItemDetail.evaluateContent.trim();
                var evaluate = this.threatItemDetail.evaluatePicked;

                if (this.threatItemDetail.evaluateContent.trim() == '')
                    return;
                else {
                    invokeService("/dapservices/updatehandleresult", {
                        "subTypeName": "updateSuggest",
                        "taskType": "city",
                        "params": {
                            "result_id": result_id,
                            "type": type,
                            "suggest_type": "feedback",
                            "suggest": feedback,
                            "evaluate": evaluate
                        }
                    }, function (data) {
                        if (data == "update success") {
                            vm.threatItemDetail.modalShow = false;
                        } else {
                            vm.threatItemDetail.submittipcontent = '提交反馈意见失败！';
                            vm.threatItemDetail.submittip = true;
                            setTimeout(function () {
                                vm.threatItemDetail.submittipcontent = '';
                                vm.threatItemDetail.submittip = false;
                            }, 3000);
                        }
                    });
                }
            },
            cancelEvaluation: function () {
                this.threatItemDetail.modalShow = false;
            },
            submitcomp: function () {
                var result_id = [];
                result_id.push(this.threatItemDetail.id);
                var type;
                for (var j = 0; j < this.threatItemDetail.processDeps.length; j++) {
                    for (var i = 0; i < processDep.length; i++) {
                        if (this.threatItemDetail.processDeps[j].isActive && this.threatItemDetail.processDeps[j].name == processDep[i].chn) {
                            type = parseInt(processDep[i].eng);
                            break;
                        }
                    }
                }
                var suggest = this.threatItemDetail.compContent.trim();
                var evaluate = this.threatItemDetail.evaluatePicked;

                if (this.threatItemDetail.suggestContent.trim() == '')
                    return;
                else {
                    invokeService("/dapservices/updatehandleresult", {
                        "subTypeName": "updateSuggest",
                        "taskType": "city",
                        "params": {
                            "result_id": result_id,
                            "type": type,
                            "suggest_type": "comp",
                            "suggest": suggest,
                            "evaluate": evaluate
                        }
                    }, function (data) {
                        if (data == "update success") {
                            invokeService("/dapservices/updateresultstatus", {
                                "subTypeName": "setProcessed",
                                "taskType": "city",
                                "params": {
                                    "result_id": result_id,
                                    "remark": " "
                                }
                            }, function (data) {
                                if (data == "update success!") {
                                    //把未处理的状态变为已处理
                                    setProcessed(result_id);
                                } else {
                                    vm.threatItemDetail.submittipcontent = '变更威胁状态失败！';
                                    vm.threatItemDetail.submittip = true;
                                    setTimeout(function () {
                                        vm.threatItemDetail.submittipcontent = '';
                                        vm.threatItemDetail.submittip = false;
                                    }, 3000);
                                }
                            });

                        } else {
                            vm.threatItemDetail.submittipcontent = '提交处置意见失败！';
                            vm.threatItemDetail.submittip = true;
                            setTimeout(function () {
                                vm.threatItemDetail.submittipcontent = '';
                                vm.threatItemDetail.submittip = false;
                            }, 3000);
                        }
                    });
                }
            },
            cancelcomp: function () {
                this.threatItemDetail.modalShow = false;
            }
        }
    });

    init();

    function init() {
        vm.loading = true;
        invokeService("/dapservices/gettasklist", {
            "subTypeName": "getTaskList",
            "taskType": "city",
            "params": {
                id: "1"
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

    }

    function getAllThreatsList(alllegends) {
        var alert_types = [];
        for (var i = 0; i < this.alertType.length; i++) {
            if (this.alertType[i].eng != '')
                alert_types.push(this.alertType[i].eng);
        }

        var date = new Date();
        if (currentTask.info.force_day !== undefined) {
            var dates = currentTask.info.force_day.split('-');
            date = new Date(dates[0], dates[1], dates[2]);
        }

        var start_time;
        var end_time;
        var now = new Date();

        if (currentTask.info.force_day !== undefined) {
            start_time = new Date(date.getTime());
            start_time.setDate(start_time.getDate() - 13);
            start_time = start_time.getFullYear() + "-" +
                (start_time.getMonth() < 10 ? "0" : "") + start_time.getMonth() + "-" +
                (start_time.getDate() < 10 ? "0" : "") + start_time.getDate() + " 00:00:00";

            end_time = date.getFullYear() + "-" +
                (date.getMonth() < 10 ? "0" : "") + date.getMonth() + "-" +
                (date.getDate() < 10 ? "0" : "") + date.getDate() + " " +
                (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" +
                (now.getMinutes() < 10 ? "0" : "") + now.getMinutes() + ":" +
                (now.getSeconds() < 10 ? "0" : "") + now.getSeconds();
        } else {
            start_time = new Date(date.getTime());
            start_time.setDate(start_time.getDate() - 13);
            start_time = start_time.getFullYear() + "-" +
                (start_time.getMonth() < 9 ? "0" : "") + (start_time.getMonth() + 1) + "-" +
                (start_time.getDate() < 10 ? "0" : "") + start_time.getDate() + " 00:00:00";

            end_time = date.getFullYear() + "-" +
                (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "-" +
                (date.getDate() < 10 ? "0" : "") + date.getDate() + " " +
                (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" +
                (now.getMinutes() < 10 ? "0" : "") + now.getMinutes() + ":" +
                (now.getSeconds() < 10 ? "0" : "") + now.getSeconds();
        }


        last_time = end_time;
        threatList = generateTemplist();
        querythreats(currentTask.id, alert_types, start_time, end_time);

    }

    function querythreats(taskid, alert_types, start_time, end_time) {
        invokeService('/dapservices/getthreatlist', {
            "subTypeName": "getAlertTypeResultByTaskID",
            "taskType": "city",
            "params": {
                "task_id": taskid,
                "alert_type": alert_types,
                "start_row": "0",
                "row_count": "1500",
                "start_time": start_time,
                "end_time": end_time
            }
        }, function (data) {

            processData(data);

            calculateCountAndNotreadnum();

            var tabindex;
            for (var i = 0; i < vm.tabs.length; i++) {
                if (vm.tabs[i].isActive) {
                    tabindex = i;
                    break;
                }
            }
            vm.types = threatList[tabindex];

            var typeindex = 0;
            for (var i = 0; i < threatList[tabindex].length; i++) {
                if (threatList[tabindex][i].selected) {
                    typeindex = i;
                    break;
                }
            }
            vm.typeDetail = threatList[tabindex][typeindex];
            if (vm.typeDetail === undefined) {
                vm.typeDetail = {
                    "longName": "",
                    "notreadNum": "",
                    "count": "",
                    "data": []
                };
            }

            calculateTotal();

            Vue.nextTick(function () {
                if (_.isUndefined(mapControl)) {
                    mapControl = new gis.WeiXie_Gis({
                        ip: config["gis-server"]
                    });
                }

                if (vm.loading) {
                    mapControl.setTask({
                        location: currentTask.info.city_position,
                        areanames: currentTask.info.viparea,
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
                }

                setTimeout(function () {
                    vm.loading = false;
                }, 50);

                //部分威胁传给地图
                var tdata = {};
                for (var i = 0; i < this.alertType.length; i++) {
                    var threats = data[this.alertType[i].eng];
                    if (threats == undefined) {
                        console.log('无' + this.alertType[i]);
                        continue;
                    }
                    if (threats.length > 0) {
                        tdata[this.alertType[i].eng] = [];
                        var len = (MAX/10<threats.length)?MAX/10:threats.length;
                        for (var j = 0; j < len; j++) {
                            tdata[this.alertType[i].eng].push(threats[j]);
                        }
                    }
                }
                mapControl.showThreats(tdata);

                $('.none').removeClass('none');
            });
        });
    }

    function cyclingGetThreatsList() {
        var interval = parseInt(this.cyclingInerval);

        setInterval(function () {
            var alert_types = [];
            for (var i = 0; i < this.alertType.length; i++) {
                if (this.alertType[i].eng != '')
                    alert_types.push(this.alertType[i].eng);
            }

            var date = new Date();
            if (currentTask.info.force_day !== undefined) {
                var dates = currentTask.info.force_day.split('-');
                date = new Date(dates[0], dates[1], dates[2]);
            }

            var start_time = last_time;
            var end_time;
            var now = new Date();
            if (currentTask.info.force_day !== undefined) {
                end_time = date.getFullYear() + "-" +
                    (date.getMonth() < 10 ? "0" : "") + date.getMonth() + "-" +
                    (date.getDate() < 10 ? "0" : "") + date.getDate() + " " +
                    (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" +
                    (now.getMinutes() < 10 ? "0" : "") + now.getMinutes() + ":" +
                    (now.getSeconds() < 10 ? "0" : "") + now.getSeconds();
            } else {
                end_time = date.getFullYear() + "-" +
                    (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "-" +
                    (date.getDate() < 10 ? "0" : "") + date.getDate() + " " +
                    (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" +
                    (now.getMinutes() < 10 ? "0" : "") + now.getMinutes() + ":" +
                    (now.getSeconds() < 10 ? "0" : "") + now.getSeconds();
            }

            last_time = end_time;

            querythreats(currentTask.id, alert_types, start_time, end_time);
        }, 60 * 1000);
    }

    function generateTemplist() {
        var tempList = [
            [],
            [],
            []
        ];
        var num = this.alertType.length;
        var typeShortName = {};
        var typeLongName = {};

        for (var i = 0; i < this.alertType.length; i++) {
            typeShortName[this.alertType[i].eng] = this.alertType[i].chnshort;
            typeLongName[this.alertType[i].eng] = this.alertType[i].chn;
        }

        for (var i = 0; i < num; i++) {
            var type = this.alertType[i].eng;
            if (i == 0) {
                tempList[0].push({
                    type: type,
                    selected: true,
                    image: selectedImageUrl[type],
                    longName: typeLongName[type],
                    shortName: typeShortName[type],
                    count: 0,
                    data: [],
                    notreadNum: 0
                });
                tempList[1].push({
                    type: type,
                    selected: true,
                    image: selectedImageUrl[type],
                    longName: typeLongName[type],
                    shortName: typeShortName[type],
                    count: 0,
                    data: [],
                    notreadNum: 0
                });
                tempList[2].push({
                    type: type,
                    selected: true,
                    image: selectedImageUrl[type],
                    longName: typeLongName[type],
                    shortName: typeShortName[type],
                    count: 0,
                    data: [],
                    notreadNum: 0
                });
            } else {
                tempList[0].push({
                    type: type,
                    selected: false,
                    image: imageUrl[type],
                    longName: typeLongName[type],
                    shortName: typeShortName[type],
                    count: 0,
                    data: [],
                    notreadNum: 0
                });
                tempList[1].push({
                    type: type,
                    selected: false,
                    image: imageUrl[type],
                    longName: typeLongName[type],
                    shortName: typeShortName[type],
                    count: 0,
                    data: [],
                    notreadNum: 0
                });
                tempList[2].push({
                    type: type,
                    selected: false,
                    image: imageUrl[type],
                    longName: typeLongName[type],
                    shortName: typeShortName[type],
                    count: 0,
                    data: [],
                    notreadNum: 0
                });
            }
        }
        return tempList;
    }

    function processData(data) {
        for (var key in data) {
            var index;
            for (var i = 0; i < this.alertType.length; i++) {
                if (this.alertType[i].eng == key) {
                    index = i;
                    break;
                }
            }
            for (var i = 0; i < data[key].length; i++) {
                var uid = _.isUndefined(data[key][i].detail_info.uuid) ? "" : data[key][i].detail_info.uuid;
                var infotext = formatData(data[key][i].format_template, data[key][i].detail_info);
                if (data[key][i].status == 'unprocessed') {
                    if(threatList[0][index].data.length<MAX)
                    threatList[0][index].data.push({
                        uuid: uid,
                        showDetail: false,
                        info: infotext,
                        titleid: data[key][i].title_template_id,
                        resultid: data[key][i].result_id,
                        captime: data[key][i].cap_time,
                        readflag: false,
                        people: data[key][i].related_person
                    });
                }
                if (data[key][i].status == 'processing') {
                    if(threatList[1][index].data.length<MAX)
                    threatList[1][index].data.push({
                        uuid: uid,
                        showDetail: false,
                        info: infotext,
                        titleid: data[key][i].title_template_id,
                        resultid: data[key][i].result_id,
                        captime: data[key][i].cap_time,
                        readflag: false,
                        people: data[key][i].related_person
                    });
                }
                if (data[key][i].status == 'processed') {
                    if(threatList[2][index].data.length<MAX)
                    threatList[2][index].data.push({
                        uuid: uid,
                        showDetail: false,
                        info: infotext,
                        titleid: data[key][i].title_template_id,
                        resultid: data[key][i].result_id,
                        captime: data[key][i].cap_time,
                        readflag: false,
                        people: data[key][i].related_person
                    });
                }
            }
        }
    }

    function generateItemDetail(index, data) {
        var status = getstatus();
        var warntype = getwarntype();
        var detail = {
            id: '', //这条威胁的id
            modalShow: false, //模态窗口显示
            newsShow: false,
            reportBtnShow: true, //控制报告按钮显示
            personShow: true, //控制相关人员面板的显示
            relationBtnShow: false, //控制关系按钮显示，只有相关人员是多人的时候才显示
            activityShow: true, //控制活动信息面板显示
            threatHandleShow: false, //控制处置面板显示
            evaluatShow: false, //控制反馈面板显示
            compShow: false, //控制综合意见显示
            okBtn: true, //控制底层OK按钮的显示
            okBtnContent: '', //OK按钮的现实内容
            submittip: false, //消息提示
            submittipcontent: '', //消息提示内容
            //新闻内容
            newscontent: '',
            //捕获时间
            captime: '',
            //威胁概述信息
            summaryInfo: '',
            //相关人员信息
            persons: [],
            //活动类别信息
            kinds: [],
            //活动列表信息
            traceList: [],
            //所有活动轨迹信息
            alltraceList: [], //[{ info: '<font color="yellow">2016.12.12 00:00:00</font>, 使用VPN', type: '其他' }, { info: '<font color="yellow">2016.12.12 00:00:00</font>，从上海虹桥乘坐G234前往杭州', type: '位置' }, { info: '<font color="yellow">2016.12.12 00:00:00</font>，访问网站www.baidu.com', type: '浏览' }],
            //处置意见信息
            processDeps: [],
            //反馈意见信息
            evaluate: [],
            //处置内容
            suggestContent: '',
            //反馈内容
            evaluateContent: '',
            //综合意见
            compContent: '',
            //评价反馈
            evaluatePicked: '低'
        };
        //当热点新闻的时候其余都不显示
        if (warntype == 'warn_news') {
            detail.reportBtnShow = false;
            detail.personShow = false;
            detail.activityShow = false;
            detail.okBtn = false;
            detail.newsShow = true;
        }
        if (warntype == 'warn_group_cluster') {
            detail.relationBtnShow = true;
        }
        if (status == 'unprocessed') {
            detail.okBtnContent = "&nbsp;处&nbsp;置";
        }
        if (status == 'processing') {
            detail.okBtnContent = "&nbsp;反&nbsp;馈";
        }
        if (status == 'processed') {
            detail.okBtn = false;
        }

        detail.id = vm.typeDetail.data[index].resultid;
        detail.captime = vm.typeDetail.data[index].captime;
        detail.summaryInfo = vm.typeDetail.data[index].info;
        //选择person
        detail.persons = [];
        if (vm.typeDetail.data[index].uuid == "") {
            for (var i = 0; i < vm.typeDetail.data[index].people.length; i++) {
                if (i == 0)
                    detail.persons.push({
                        isActive: true,
                        content: vm.typeDetail.data[index].people[i].content,
                        id: vm.typeDetail.data[index].people[i].param,
                        type: vm.typeDetail.data[index].people[i].type
                    });
                else
                    detail.persons.push({
                        isActive: false,
                        content: vm.typeDetail.data[index].people[i].content,
                        id: vm.typeDetail.data[index].people[i].param,
                        type: vm.typeDetail.data[index].people[i].type
                    });
            }
        } else {
            for (var i = 0; i < vm.typeDetail.data[index].people.length; i++) {
                if (vm.typeDetail.data[index].people[i].type == 'uuid' && vm.typeDetail.data[index].people[i].param == vm.typeDetail.data[index].uuid)
                    detail.persons.push({
                        isActive: true,
                        content: vm.typeDetail.data[index].people[i].content,
                        id: vm.typeDetail.data[index].people[i].param,
                        type: vm.typeDetail.data[index].people[i].type
                    });
                else
                    detail.persons.push({
                        isActive: false,
                        content: vm.typeDetail.data[index].people[i].content,
                        id: vm.typeDetail.data[index].people[i].param,
                        type: vm.typeDetail.data[index].people[i].type
                    });
            }
        }

        //生成kind
        detail.kinds.push({
            isActive: true,
            content: '全部',
            count: 0
        });
        for (var i = 0; i < billType.length; i++) {
            detail.kinds.push({
                isActive: false,
                content: billType[i].chn,
                count: 0
            });
        }
        // //生成所有活动信息    
        // var trace = getTraceList(data);
        // detail.kinds = trace.kinds;
        // detail.alltraceList = trace.alltraceList;
        // detail.traceList = trace.traceList;

        // for (var i = 0; i < detail.alltraceList.length; i++) {
        //     for (var j = 0; j < detail.kinds.length; j++) {
        //         if (detail.alltraceList[i].type == detail.kinds[j].content || detail.kinds[j].content == '全部') {
        //             detail.kinds[j].count++;
        //         }
        //     }
        // }

        // detail.traceList = detail.alltraceList;

        return detail;
    }

    function getTraceList(data) {
        var kinds = [];
        var alltrace = [];
        var actions = [];

        kinds.push({
            isActive: true,
            content: '全部',
            count: 0
        });
        for (var i = 0; i < billType.length; i++) {
            kinds.push({
                isActive: false,
                content: billType[i].chn,
                count: 0
            });
        }
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].record.length; j++) {
                alltrace.push({
                    info: _.template(data[i].record[j].format_template)(data[i].record[j].detail_info),
                    type: data[i].record[j].datatype,
                    lat: _.isUndefined(data[i].record[j].detail_info.lat) ? '' : data[i].record[j].detail_info.lat,
                    lng: _.isUndefined(data[i].record[j].detail_info.lng) ? '' : data[i].record[j].detail_info.lng,
                    to_lat: _.isUndefined(data[i].record[j].detail_info.to_lat) ? '' : data[i].record[j].detail_info.to_lat,
                    to_lng: _.isUndefined(data[i].record[j].detail_info.to_lng) ? '' : data[i].record[j].detail_info.to_lng,
                    datatype: data[i].record[j].detail_info.type,
                    resultid: data[i].record[j].detail_info.result_id,
                    status:data[i].record[j].detail_info.status,
                    ischecked: true
                });
                actions.push({
                    datatype: data[i].record[j].detail_info.type,
                    lat: data[i].record[j].lat,
                    lng: data[i].record[j].lng
                });
                for (var l = 0; l < kinds.length; l++) {
                    if (kinds[l].content == '全部' || kinds[l].content == data[i].record[j].datatype) {
                        kinds[l].count++;
                    }
                }
            }
        }
        //通知地图加载活动
        mapControl.showActions(actions);

        return {
            kinds: kinds,
            alltraceList: alltrace,
            traceList: alltrace
        };
    }

    function calculateTotal() {
        for (var i = 0; i < threatList.length; i++) {
            var count = 0;
            for (var j = 0; j < threatList[i].length; j++) {
                count += threatList[i][j].data.length;
            }
            vm.tabs[i].count = count;
        }
    }

    function calculateCountAndNotreadnum() {
        for (var i = 0; i < threatList.length; i++) {
            for (var j = 0; j < threatList[i].length; j++) {
                var count = threatList[i][j].data.length;
                var notreadNum = 0;
                for (var l = 0; l < count; l++) {
                    if (threatList[i][j].data[l].readflag == false) {
                        notreadNum++;
                    }
                }
                threatList[i][j].count = count;
                threatList[i][j].notreadNum = notreadNum;
            }
        }
    }

    function getstatus() {
        var st;
        for (var i = 0; i < vm.tabs.length; i++) {
            if (vm.tabs[i].isActive) {
                st = vm.tabs[i].status;
                break;
            }
        }
        return st;
    }

    function getwarntype() {
        var type;
        for (var i = 0; i < vm.types.length; i++) {
            if (vm.types[i].selected) {
                type = vm.types[i].type;
                break;
            }
        }
        return type;
    }

    function setProcessing(ids) {
        var selectedtypeindex;

        if (_.isUndefined(ids) || ids.length == 0)
            return;

        for (var i = 0; i < vm.types.length; i++) {
            if (vm.types[i].selected) {
                selectedtypeindex = i;
                break;
            }
        }
        var indexs = [];
        for(var i=0;i<threatList[0].length;i++){
            for(var j=0;j<threatList[0][i].data.length;j++){
                if(ids.indexOf(threatList[0][i].data[j].resultid) >=0){
                    indexs.push({typeindex:i,itemindex:j});
                }
            }
        }

        indexs.forEach(function(index){
            threatList[0][index.typeindex].data[index.itemindex].showDetail = false;
            threatList[0][index.typeindex].data[index.itemindex].readflag = false;
            threatList[1][index.typeindex].data.unshift(threatList[0][index.typeindex].data[index.itemindex]);
            threatList[1][index.typeindex].count++;
            threatList[1][index.typeindex].notreadNum++;
            threatList[0][index.typeindex].data.splice(index.itemindex, 1);
            threatList[0][index.typeindex].count--;
        });


        vm.types = threatList[0];
        vm.typeDetail = _.isUndefined(threatList[0][selectedtypeindex]) ? {} : threatList[0][selectedtypeindex];
        vm.threatItemDetail = {};
        for (var i = 0; i < threatList.length; i++) {
            var count = 0;
            for (var j = 0; j < threatList[i].length; j++) {
                count += threatList[i][j].data.length;
            }
            vm.tabs[i].count = count;
        }

        //通知地图开始处理威胁
        mapControl.handleThreatOnMap({
            ID: ids[0]
        });
    }

    function setProcessed(ids) {
        var selectedtypeindex;

        if (_.isUndefined(ids) || ids.length == 0)
            return;

        for (var i = 0; i < vm.types.length; i++) {
            if (vm.types[i].selected) {
                selectedtypeindex = i;
                break;
            }
        }

        var indexs = [];
        for(var i=0;i<threatList[1].length;i++){
            for(var j=0;j<threatList[1][i].data.length;j++){
                if(ids.indexOf(threatList[1][i].data[j].resultid) >=0){
                    indexs.push({typeindex:i,itemindex:j});
                }
            }
        }

        indexs.forEach(function(index){
            threatList[1][index.typeindex].data[index.itemindex].showDetail = false;
            threatList[1][index.typeindex].data[index.itemindex].readflag = false;
            threatList[2][index.typeindex].data.unshift(threatList[1][index.typeindex].data[index.itemindex]);
            threatList[2][index.typeindex].count++;
            threatList[2][index.typeindex].notreadNum++;
            threatList[1][index.typeindex].data.splice(index.itemindex, 1);
            threatList[1][index.typeindex].count--;

        });

        vm.types = threatList[1];
        vm.typeDetail = _.isUndefined(threatList[1][selectedtypeindex]) ? {} : threatList[1][selectedtypeindex];
        vm.threatItemDetail = {};
        for (var i = 0; i < threatList.length; i++) {
            var count = 0;
            for (var j = 0; j < threatList[i].length; j++) {
                count += threatList[i][j].data.length;
            }
            vm.tabs[i].count = count;
        }

        //通知地图威胁处理结束
        mapControl.responsedThreatOnMap({
            ID: ids[0]
        });
    }

    function formatData(type, data) {

        try {
            return _.template(type)(data);
        } catch (e) {
            console.log(e);
            console.log(data);
            return '';
        }
    }

    function invokeService(url, params, completed) {
        $.getJSON(config.serviceRoot + url, params, function (res) {
            console.log(res);

            completed(res);
        });
    }

    function setTask(task) {
        if (task.isCurrent) return;
        vm.loading = true;
        vm.tasks.forEach(function (el) {
            el.isCurrent = el === task;
            if (el.isCurrent) {
                currentTask = task;

                setReport();
                vm.taskTitle = el.info.title.weixie;
                getTaskNumber(task, function (result) {
                    var totalNum = result["threat_num"].toString();
                    var hitNum = result["person_num"].toString();

                    vm.totalNum = totalNum;
                    vm.hitNum = hitNum;
                });

                var self = this;

                // 获取任务相关所有图表图例
                getTaskLegends(task, function (alllegends) {
                    //initAllChartsData(task, alllegends);
                    self.alertType = alllegends.threat_name_list;
                    billType = alllegends.threat_bill_type_list;
                    processDep = alllegends.threat_process_department;
                    self.processStat = alllegends.threat_high_score_stat;
                    self.cyclingInerval = alllegends.threat_cycling_get_interval;
                    getAllThreatsList(self.alertType);
                    getAllChartsData();
                    cyclingGetThreatsList();
                });
            }
        });
    }

    function getAllChartsData() {
        var items = [],
            items2 = [],
            dic = {};
        this.alertType.forEach(function (item) {
            items.push(item.eng);
            items2.push({
                name: item.eng,
                type: "line"
            });
            legendDic[item.eng] = item.chn;
        }, this);
        dic["unprocessed"] = "未处理";
        dic["processing"] = "处理中";
        dic["processed"] = "已处理";
        invokeService("/dapservices/getstatisticresult", {
            "taskType": "city",
            "subRpTasks": [{
                "subTypeName": "yj_info_stat_pie",
                "param": {
                    "task_id": currentTask.id,
                    "alert_type": items, //要统计的类型
                    "time": getTime()
                }
            }]
        }, function (result) {
            var dataConfig = [];
            var element = result["yj_info_stat_pie"];
            var conf = {};
            conf.value = "";
            conf.id = "1";
            conf.data = [];
            element.series.forEach(function (serie) {
                serie.data.forEach(function (it) {
                    switch (it.name) {
                        case 'unprocessed':
                            it.name = "未处理";
                            break;
                        case 'processing':
                            it.name = "处理中";
                            break;
                        case 'processed':
                            it.name = "已处理";
                            break;
                        default:
                            it.name = legendDic[it.name];
                            break;
                    }
                });
                switch (serie.name) {
                    case 'alert_num':
                        conf.data.splice(0, 0, {
                            value: serie.data,
                            name: '威胁类别'
                        });
                        break;
                    case 'alert_status':
                        conf.data.splice(0, 0, {
                            value: serie.data,
                            name: '处理状态'
                        });
                        break;
                    default:
                        conf.data.push({
                            value: serie.data,
                            name: '威胁'
                        });
                        break;
                }
            });

            dataConfig.push(conf);

            vm.pies.dataConfig = dataConfig;
        });

        var date = new Date();
        if (currentTask.info.force_day !== undefined) {
            var dates = currentTask.info.force_day.split('-');
            date = new Date(dates[0], dates[1], dates[2]);
        }

        var start_time;
        var end_time;
        if (currentTask.info.force_day !== undefined) {
            start_time = new Date(date.getTime());
            //start_time.setDate(start_time.getDate() - 6);
            start_time = start_time.getFullYear() + "-" +
                (start_time.getMonth() < 10 ? "0" : "") + (start_time.getMonth()) + "-" +
                (start_time.getDate() < 10 ? "0" : "") + start_time.getDate() + " 00:00:00";

            end_time = date.getFullYear() + "-" +
                (date.getMonth() < 10 ? "0" : "") + (date.getMonth()) + "-" +
                (date.getDate() < 10 ? "0" : "") + date.getDate() + " 23:59:59";
        } else {
            start_time = new Date(date.getTime());
            //start_time.setDate(start_time.getDate() - 6);
            start_time = start_time.getFullYear() + "-" +
                (start_time.getMonth() < 9 ? "0" : "") + (start_time.getMonth() + 1) + "-" +
                (start_time.getDate() < 10 ? "0" : "") + start_time.getDate() + " 00:00:00";

            var now = new Date();
            end_time = date.getFullYear() + "-" +
                (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "-" +
                (date.getDate() < 10 ? "0" : "") + date.getDate() + " " +
                (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" +
                (now.getMinutes() < 10 ? "0" : "") + now.getMinutes() + ":" +
                (now.getSeconds() < 10 ? "0" : "") + now.getSeconds();
        }
        invokeService("/dapservices/getstatisticresult", {
            "taskType": "city",
            "subRpTasks": [{
                "subTypeName": "yj_info_num_bar_line",
                "param": {
                    "task_id": currentTask.id,
                    "start_time": start_time,
                    "end_time": end_time,
                    "item": items2
                }
            }]
        }, function (result) {
            var dataConfig = {
                columnTitle: [],
                rowTitle: [],
                content: []
            };
            result["yj_info_num_bar_line"].xAxis.data.forEach(function (value) {
                dataConfig.columnTitle.push({
                    "value": value
                });
            });
            result["yj_info_num_bar_line"].legend.data.forEach(function (value) {
                dataConfig.rowTitle.push({
                    "name": legendDic[value],
                    "unit": "P",
                    "stack": "y"
                });
            });
            result["yj_info_num_bar_line"].series.forEach(function (value) {
                dataConfig.content.push(value.data);
            });

            invokeService("/dapservices/getstatisticresult", {
                "taskType": "city",
                "subRpTasks": [{
                    "subTypeName": "yj_info_process_bar_line",
                    "param": {
                        "task_id": currentTask.id,
                        "start_time": start_time,
                        "end_time": end_time,
                        "item": [{
                            "name": "unprocessed",
                            "type": "line"
                        }, {
                            "name": "processing",
                            "type": "line"
                        }, {
                            "name": "processed",
                            "type": "line"
                        }]
                    }
                }]
            }, function (result) {
                for (var index = 0; index < result["yj_info_process_bar_line"].legend.data.length; index++) {
                    var element = result["yj_info_process_bar_line"].legend.data[index];
                    dataConfig.rowTitle.push({
                        "name": dic[element],
                        "unit": "P",
                        "stack": "n"
                    });
                }
                result["yj_info_process_bar_line"].series.forEach(function (value) {
                    dataConfig.content.push(value.data);
                });
                vm.bar.dataConfig = dataConfig;
            });
        });

        var its = [];
        this.processStat.forEach(function (item) {
            its.push({
                "name": item.eng,
                "type": "line"
            });
            legendDic[item.eng] = item.chn;
        }, this);
        invokeService("/dapservices/getstatisticresult", {
            "taskType": "city",
            "subRpTasks": [{
                "subTypeName": "yj_info_increase_bar_line",
                "param": {
                    "task_id": currentTask.id,
                    "start_time": start_time,
                    "end_time": end_time,
                    "item": its
                }
            }]
        }, function (result) {
            var dataConfig = {
                columnTitle: [],
                rowTitle: [],
                content: []
            };
            var styleItems = {};
            result["yj_info_increase_bar_line"].xAxis.data.forEach(function (value) {
                dataConfig.columnTitle.push({
                    "value": value
                });
            });
            result["yj_info_increase_bar_line"].legend.data.forEach(function (value) {
                dataConfig.rowTitle.push({
                    "name": legendDic[value],
                    "unit": "P",
                    "id": value
                });
                styleItems[value] = {
                    "type": "line"
                };
            });
            result["yj_info_increase_bar_line"].series.forEach(function (value) {
                dataConfig.content.push(value.data);
            });
            vm.line.dataConfig = dataConfig;
            vm.line.styleConfig.items = styleItems;
        });
    }

    function getTaskLegends(task, completed) {
        invokeService("/dapservices/gettasklegend", {
            "subTypeName": "getTaskLegendParamList",
            "taskType": "city",
            "params": {
                id: task.id,
                name: chartNames
            }
        }, function (alllegends) {
            completed(alllegends);
        });
    }

    function getTaskNumber(task, completed) {
        invokeService("/dapservices/getstatisticresult", {
            "taskType": "city",
            "subRpTasks": [{
                "subTypeName": "yj_info_data_count",
                "param": {
                    "task_id": currentTask.id,
                    "time": getTime()
                }
            }]
        }, function (result) {
            completed(result["yj_info_data_count"]);
        });
    }

    function setReport() {
        invokeService("/dapservices/setrecordlog", {
            "taskType": "city",
            "subRpTasks": [{
                "subTypeName": "record_log",
                "param": {
                    "task_id": currentTask.id,
                    "item": "threat"
                }
            }]
        }, function (result) {});
    }

    function showbox(content) {
        if (_.isUndefined(dlg)) {
            dlg = new Vue({
                el: '#mydlg',
                data: {
                    dlgshow: true,
                    content: content
                },
                methods: {
                    close: function () {

                        dlg.dlgshow = false;
                    }
                }
            });
        } else {
            dlg.content = content;
            dlg.dlgshow = true;
        }
    }
});