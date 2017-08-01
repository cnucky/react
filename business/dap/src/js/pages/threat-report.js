require([
	"../../../config",
	"../lib/vue/vue"
], function (config, Vue) {
	var id;
	var taskid;
	var peoples;
	var forceDay;
	var chartNames = ["threat_process_department", "threat_bill_type_list"];
	var processDep;
	var billType;
	var invokeService = function (url, params, completed) {
		$.get(config.serviceRoot + url, params, function (res) {
			console.log(res);

			completed(res);
		});
	};

	var getTime = function () {
		var date = new Date();
		var time = (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() + ":" + (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
		if (forceDay !== "")
			time = forceDay + " " + time;
		else
			time = date.getFullYear() + "-" + (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" : "") + date.getDate() + " " + time;

		return time;
	};

	var generateStr = function (strs) {
		var str = '';
		for (var i = 0; i < strs.length; i++) {
			str += strs[i] + '；';
		}
		return str;
	};

	var parseProperties = function (people, property) {
		if (property.propertyName.indexOf("姓名") > -1) {
			people.name = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("性别") > -1) {
			people.sex = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("生日") > -1) {
			people.birthday = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("身高") > -1) {
			people.height = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("婚") > -1) {
			people.marriage = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("民族") > -1) {
			people.nation = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("身份证") > -1) {
			people.idcard = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("地址") > -1) {
			people.address = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("手机") > -1 || property.propertyName.indexOf("电话") > -1) {
			people.teladdr = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("邮箱") > -1 || property.propertyName.indexOf("邮件") > -1) {
			people.email = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("qq") > -1) {
			people.qq = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("淘宝") > -1) {
			people.taobao = generateStr(property.propertyValue);
		}

		if (property.propertyName.indexOf("支付宝") > -1) {
			people.alipay = generateStr(property.propertyValue);
		}

		return people;

	};



	var vm = new Vue({
		el: "#div_report",
		data: {
			report_no: 'xxxxx',
			report_time: moment().format('YYYY-MM-DD HH:mm:ss'),
			shortsummary: '',
			summarys: [],
			threatpeoples: [],
			departmentAction: [],
			departmentWords: [],
			allword: ''
		}
	});

	function getThreatItem(id) {

		invokeService("/dapservices/getthreatdetail", {
			"subTypeName": "getResultByID",
			"taskType": "city",
			"params": {
				"result_id": id
			}
		}, function (data) {
			vm.shortsummary = _.template(data.format_template)(data.detail_info);
			vm.summarys.push(vm.shortsummary);
			vm.threatpeoples = [];
			for (var i = 0; i < data.related_person.length; i++) {
				var people = {
					activities: [],
					desp: '',
					name: '',
					sex: '',
					birthday: '',
					height: '',
					marriage: '',
					nation: '',
					idcard: '',
					address: '',
					teladdr: '',
					email: '',
					qq: '',
					taobao: '',
					alipay: ''
				};
				if (data.related_person[i].type == 'uuid') {
					//通过uuid拿人员数据
					$.ajax({
						url: config.serviceRoot + '/../lmb/lmbservice/gettargetsinfo',
						type: 'GET',
						async: false,
						data: {
							targetIds: [data.related_person[i].param],
							returnPhoto: false
						},
						dataType: 'json',
						success: function (rsp) {
							for (var i = 0; i < rsp.result.length; i++) {
								for (var j = 0; j < rsp.result[i].properties.length; j++) {
									people = parseProperties(people, rsp.result[i].properties[j]);
								}
							}

							people.desp = people.name + people.teladdr;
						}
					});
				} else if (data.related_person[i].type == 'phone') {
					//通过手机号拿用户信息
					$.ajax({
						url: config.serviceRoot + '/personcore/getpersondetail',
						type: 'GET',
						async: false,
						data: {
							entityid: data.related_person[i].param,
							entitytype: 5
						},
						dataType: 'json',
						success: function (rsp) {

						}
					});
				} else if (data.related_person[i].type == 'cert_no') {
					//通过身份证号来获取用户信息
					$.ajax({
						url: config.serviceRoot + '/personcore/getpersondetail',
						type: 'GET',
						async: false,
						data: {
							entityid: data.related_person[i].param,
							entitytype: 1
						},
						dataType: 'json',
						success: function (rsp) {

						}
					});
				}

				//获取活动列表
				var params;
				var billTypes = [];
				for (var j = 0; j < billType.length; j++) {
					billTypes.push(billType[j].chn);
				}
				if (data.related_person[i].type == 'uuid') {
					params = {
						"subTypeName": "getBillDataByTargetID",
						"taskType": "city",
						"params": {
							"task_id": taskid,
							"time": getTime(),
							"type": billTypes,
							"uuid": data.related_person[i].param,
							"limit": 20
						}
					};
				} else if (data.related_person[i].type == 'phone') {
					params = {
						"subTypeName": "getBillDataByPhone",
						"taskType": "city",
						"params": {
							"task_id": taskid,
							"time": getTime(),
							"type": billTypes,
							"phone": data.related_person[i].param,
							"limit": 20
						}
					};
				} else if (data.related_person[i].type == 'cert_no') {
					params = {
						"subTypeName": "etBillDataByCertNo",
						"taskType": "city",
						"params": {
							"task_id": taskid,
							"time": getTime(),
							"type": billTypes,
							"cert_no": data.related_person[i].param,
							"limit": 20
						}
					};
				}
				$.ajax({
					url: config.serviceRoot + '/dapservices/gettargetdetail',
					type: 'GET',
					async: false,
					data: params,
					dataType: 'json',
					success: function (data) {
						people.activities = [];
						for (var i = 0; i < data.length; i++) {
							for (var j = 0; j < data[i].record.length; j++) {
								people.activities.push(_.template(data[i].record[j].format_template)(data[i].record[j].detail_info));
							}
						}
					}
				});

				vm.threatpeoples.push(people);
			}
		});
	}

	function getSuggestion(id) {
		invokeService("/dapservices/gethandleresult", {
			"subTypeName": "getResultSuggest",
			"taskType": "city",
			"params": {
				"result_id": id
			}
		}, function (data) {
			var departmentActions = {};
			var departmentWords = {};
			vm.departmentAction = [];
			vm.departmentWords = [];
			vm.allword = "无";
			for (var i = 0; i < processDep.length; i++) {
				departmentActions[processDep[i].eng] = processDep[i].chn + '部门任务：无';
				departmentWords[processDep[i].eng] = {
					name: processDep[i].chn,
					content: '无',
					evaluate: '无'
				};
				for (var j = 0; j < data.length; j++) {
					if (processDep[i].eng == data[j].type) {
						departmentActions[data[j].type] = (processDep[i].chn.toString()) + '部门任务：' + (_.isUndefined(data[j].handleSuggest) ? "无" : data[j].handleSuggest.toString());
						departmentWords[data[j].type] = {
							name: processDep[i].chn.toString(),
							content: (_.isUndefined(data[j].feedbackSuggest) ? "无" : data[j].feedbackSuggest.toString()),
							evaluate: data[j].feedbackEvaluate
						};
						if (data[j].type == 5) {
							vm.allword = _.isUndefined(data[j].compSuggest) ? "无" : data[j].compSuggest;
						}
					}
				}
			}

			for (var key in departmentActions) {
				vm.departmentAction.push(departmentActions[key]);
				vm.departmentWords.push(departmentWords[key]);
			}

		});
	}


	function getTaskLegends(taskid, completed) {
		invokeService("/dapservices/gettasklegend", {
			"subTypeName": "getTaskLegendParamList",
			"taskType": "city",
			"params": {
				id: taskid,
				name: chartNames
			}
		}, function (alllegends) {
			completed(alllegends);
		});
	}

	function init() {
		var splits = location.hash.split('&');
		id = splits[0].substr(1, splits[0].length);
		taskid = splits[1];
		forceDay = splits[2];
		getTaskLegends(taskid, function (alllegends) {
			processDep = alllegends.threat_process_department;
			billType = alllegends.threat_bill_type_list;

			getThreatItem(id);
			getSuggestion(id);
		});

	}

	init();

});