/**
 * Created by root on 16-3-31.
 */
var router = require('express').Router();
var soap = require('soap');
//var xml2js = require("xml2js");
var xmlbuilder = require("xmlbuilder");
//var RoleApi = require('../../../framework/jws/role');
var TaskCommonApi = require('../jws/taskcommon');
var Q = require('q');
var LogApi = require('../../../framework/jws/log');
var LoginApi = require('../../../framework/jws/login');
var SearchTemplate = require('../jws/searchTemplate');
var _ = require('underscore');
var configReader = require('../../../public/widget/configmgr/src/configmgr.js');
var AuthorizationApi = require('../jws/authorization');
//var RuleDecisionApi = require('../jws/ruleDecisionService');
//var UserManageApi = require('../jws/userManageService');
var TaskManageApi = require('../jws/taskManage');
var commonConfig = require('../config.js');
var path = require('path');
var sysConfig = require(path.join(process.cwd(), './utils/config-system.js'));
var common_config = require(configReader.getRouteConfig("business/datasearch/config/", "route_config_datasearch.js"));

var search_operation_dic = common_config.search_operation_dic;

var search_relation_dic = common_config.search_relation_dic;

var dscp_len = 300;

var CommonConfig = require(path.join(process.cwd(), './framework/utils/common-config.js'));


function datatype_filter(config_dataTypes, datatypes) {
    var user_dataTypes = [];
    for (var i = 0; i < config_dataTypes.length; i++) {
        var name = config_dataTypes[i].Name;
        var caption = config_dataTypes[i].Caption;
        for (var j = 0; j < datatypes.length; j++) {
            if (name == datatypes[j].name) {
                var user_datatype = config_dataTypes[i];
                user_dataTypes.push(user_datatype);
            }
        }
    }
    return user_dataTypes;
}

router.all('/get_datatypes', function (req, res) {

    var config_data_types = req.query.data_types;
    if (config_data_types == undefined) {
        config_data_types = ['DATA'];
    }

    CommonConfig.getConfigData(req, function (result) {
        var user_dataTypes = [];

        if (sysConfig.ignore_authority())
        {
            _.each(config_data_types, function (data_type) {
                var config_dataTypes = result[data_type].DataTypes;
                user_dataTypes = user_dataTypes.concat(config_dataTypes);
            });

            var rsp = {
                "code": 0,
                "data": user_dataTypes
            };

            res.endj(rsp);
        }
        else
        {
            TaskCommonApi(req).getDataType()
                .then(function (datatype_rsp) {
                    if (datatype_rsp.code == 0) {
                        var datatypes = datatype_rsp.data.sysData;
                        _.each(config_data_types, function (data_type) {
                            var config_dataTypes = result[data_type].DataTypes;
                            var filter_dataTypes = datatype_filter(config_dataTypes, datatypes);
                            user_dataTypes = user_dataTypes.concat(filter_dataTypes);
                        });
                    }
                    else {
                        res.endj(datatype_rsp);
                    }

                    var rsp = {
                        "code": 0,
                        "data": user_dataTypes
                    };

                    res.endj(rsp);
                });
        }
    });

});

function get_condition_trans(condition) {
    var item = "";
    var displayname = "";
    var controltype = "Text";
    var itemconfig = "";
    var valuetype = "text";
    var rule = "text";
    var seperate = "";

    if (condition.Item != undefined) {
        item = condition.Item[0];
    }
    if (condition.DisplayName != undefined) {
        displayname = condition.DisplayName[0];
    }
    if (condition.ControlType != undefined) {
        controltype = condition.ControlType[0];
    }
    if (condition.ItemConfig != undefined) {
        itemconfig = condition.ItemConfig[0];
    }
    if (condition.ValueType != undefined) {
        valuetype = condition.ValueType[0];
    }
    if (condition.Rule != undefined) {
        rule = condition.Rule[0];
    }
    if (condition.Seperate != undefined) {
        seperate = condition.Seperate[0];
    }

    var condition_dic = {
        Item: item,
        DisplayName: displayname,
        ControlType: controltype,
        ItemConfig: itemconfig,
        ValueType: valuetype,
        Rule: rule,
        Seperate: seperate
    };

    return condition_dic;
}

function get_condition_list_trans(condition_list) {
    var conditions = [];
    for (var j = 0; j < condition_list.length; j++) {
        var condition = condition_list[j];

        var condition_dic = get_condition_trans(condition);

        conditions.push(condition_dic);

    }

    return conditions;
}

function protocol_combine_trans(combine_display) {
    var combine_condition_group_list = combine_display[0].ConditionGroup;
    if(combine_condition_group_list == undefined){
        return {
            ConditionGroup: []
        };
    }

    var condition_groups = [];
    for (var i = 0; i < combine_condition_group_list.length; i++) {
        var condition_group = combine_condition_group_list[i];

        var group_name = condition_group.GroupName;

        var conditions = get_condition_list_trans(condition_group.Condition);

        var group_dic = {
            GroupName: group_name,
            Condition: conditions
        };

        condition_groups.push(group_dic);
    }

    var combine_dic = {
        ConditionGroup: condition_groups
    };

    return combine_dic;
}

function protocol_template_trans(template_display) {
    var template_item_list = template_display[0].Condition;
    if(template_item_list == undefined){
        return {
            Condition: []
        };
    }

    var template_dic = {
        Condition: get_condition_list_trans(template_item_list)
    };

    return template_dic;
}

function protocol_display_trans(xml_data) {
    var protocol_info = xml_data.Search;
    var protocol_type = protocol_info.Type[0];
    var protocol_name = protocol_info.DisplayName[0];
    var protocol_fulltext = _.isUndefined(protocol_info.FullText) ? "False" : protocol_info.FullText[0];

    var combine_display = xml_data.Search.Combine;
    var combine_config = protocol_combine_trans(combine_display);

    var template_display = xml_data.Search.Template;
    var template_config = protocol_template_trans(template_display);

    var protocol_config = {
        Type: protocol_type,
        DisplayName: protocol_name,
        FullText: protocol_fulltext,
        Combine: combine_config,
        Template: template_config
    };

    return protocol_config;
}

function search_config_dic_trans(xml_data_list){
    var search_config_dic = {};
    _.each(xml_data_list, function(xml_data){
        var file_name = xml_data.filename;
        var file_key = file_name.slice(0,file_name.indexOf("_QUERY.xml"));
        var file_content = protocol_display_trans(xml_data.filecontent);
        search_config_dic[file_key] = file_content;
    });
    return search_config_dic;
}

/*router.all('/get_search_config', function (req, res) {

    var category_name = req.query.category_name;

    configReader.getCategoryConfigDic(category_name, function (result) {
        var category_config = protocol_display_trans(result);

        if (category_config == "") {
            var rsp = {
                "code": 1,
                "message": common_config.message.config_read_faild,
                "data": {},
            };
        }
        else{
            var rsp = {
                "code": 0,
                "data": category_config
            };
        }


        res.endj(rsp);
    });


});*/

router.all('/get_search_config_dic', function (req, res) {
    CommonConfig.getConfigFileByDir("data_search", req, function (result) {
        var search_config_dic = search_config_dic_trans(result);
        var rsp = {
            "code": 0,
            "data": search_config_dic
        };

        res.endj(rsp);
    });
});

router.all('/get_search_operation_dic', function (req, res) {

    var rsp = {
        "code": 0,
        "data": search_operation_dic
    };
    res.endj(rsp);

});

router.all('/get_search_relation_dic', function (req, res) {

    var rsp = {
        "code": 0,
        "data": search_relation_dic
    };
    res.endj(rsp);

});

function valuetype_operation_data_trans(xml_data) {
    var operation_dic = {};
    var valuetype_list = xml_data.TemplateOperation.ValueType;
    _.each(valuetype_list, function (valuetype) {
        var name = valuetype.name[0];
        var operation_list = valuetype.Operation;
        var operations = [];
        _.each(operation_list, function (operation) {
            var key = operation.key[0];
            var operation_item = {
                key: key
            };
            operations.push(operation_item);
        });
        operation_dic[name] = operations;
    });
    return operation_dic;
}

router.all('/get_valuetype_operation_dic', function (req, res) {
    configReader.getConfigFile("/business/datasearch/config/", "template_operation.xml", function (result) {
        var operation_dic = valuetype_operation_data_trans(result);
        var rsp = {
            "code": 0,
            "data": operation_dic
        };
        res.endj(rsp);
    });

});

function translate_handle(translate){
    var translate_map = {};
    _.each(translate.TRANSLATE.DIC,function(dic){
        translate_map[dic.NAME[0]] = [];
        var list = [];

        _.each(dic.ELEINFO, function(item){
            var existedItem = _.find(list, function(item_in_list){
                return item_in_list.desc == item.VALUE[0];
            });
            if (existedItem == null)
            {
                list.push({name:item.CODE[0],
                    desc:item.VALUE[0]});
            }
            else
            {
                existedItem.name = existedItem.name + ',' + item.CODE[0];
            }
        });

        translate_map[dic.NAME[0]] = list;
    });
    return translate_map;
}

router.all('/get_select_options', function (req, res) {

    var dic_name = req.query.dic_name;

    CommonConfig.getTranslate(req, function (result) {
        var translate_map = translate_handle(result);
        var rsp = {
            "code": 0,
            "data": translate_map[dic_name]
        };
        res.endj(rsp);
    });
});

router.all('/get_all_translate', function (req, res) {

    var dic_name = req.query.dic_name;

    CommonConfig.getTranslate(req, function (result) {
        var translate_map = translate_handle(result);
        var rsp = {
            "code": 0,
            "data": translate_map
        };
        res.endj(rsp);
    });
});

router.all('/get_search_template_list_by_user', function (req, res) {

    SearchTemplate(req).getQueryTemplate({}, res.endj);

});

router.all('/get_search_template_list_by_id', function (req, res) {
    var template_id = req.query.template_id;
    var param = {
        "id": template_id
    };
    SearchTemplate(req).getQueryTemplate(param, res.endj);

});

router.all('/add_search_template', function (req, res) {
    var search_template = req.query.search_template;
    SearchTemplate(req).addQueryTemplate(search_template, res.endj);
});

router.all('/update_search_template', function (req, res) {
    var search_template = req.query.search_template;
    SearchTemplate(req).updateQueryTemplate(search_template, res.endj);
});

router.all('/delete_search_template', function (req, res) {
    var template_ids = req.query.template_ids;
    var param = {
        ids: template_ids
    };
    SearchTemplate(req).delQueryTemplate(param, res.endj);
});

router.all('/get_search_template_condition', function (req, res) {
    var template_id = req.query.template_id;
    var param = {
        template_id: template_id
    };
    SearchTemplate(req).getQueryCondition(param, res.endj);
});

router.all('/get_search_result_maxnum', function (req, res) {
    res.endj(50000);
});

router.all('/get_datacenters', function (req, res) {
    var type = req.query.type;
    if (type == undefined) {
        type = "local";
    }


    CommonConfig.getDataCenters(req, function(result){
        if(result == "") {
            var rsp = {
                "code": 0,
                "data": result
            };

            res.endj(rsp);
        }
        else{
            var dataAreaGroups = result.DATA_AREA_GROUP;
            var dataAreas = result.DATA_AREA;
            var config_datacenter_list = build_datacenter_tree(dataAreaGroups, dataAreas, type);

            if (!sysConfig.ignore_authority())
            {
                AuthorizationApi(req).getAllSystemCenters()
                    .then(function (datacenter_rsp) {
                        var datacenters = datacenter_rsp.data;

                        console.log("sys_right", JSON.stringify(datacenters, null, 2));
                        console.log("sys_config", JSON.stringify(config_datacenter_list, null, 2));

                        var user_datacenter_list = datacenter_filter(config_datacenter_list, datacenters);

                        var rsp = {
                            "code": 0,
                            "data": user_datacenter_list
                        };

                        res.endj(rsp);
                    });
            }
            else
            {
                var rsp = {
                    "code": 0,
                    "data": config_datacenter_list
                };

                res.endj(rsp);
            }
        }


    });
});

function get_search_param_by_type(search_type, isfulltext, req){
    var search_code = "";
    var return_code = "";
    if(search_type == "sort_search" || search_type == "template_search" || search_type == "file_search"){
        search_code = "JZ_COMMON_010200";
        return_code = "JZ_COMMON_010201";
        if (isfulltext == "True") {
            search_code = "JZ_COMMON_010205";
            return_code = "JZ_COMMON_010206";
        }
    }
    else if(search_type == "onekey_search"){
        search_code = "JZ_COMMON_010208";
        return_code = "JZ_COMMON_010209";
    }
    else if(search_type == "system_search"){
        search_code = "JZ_COMMON_010217";
        return_code = "JZ_COMMON_010218";
    }

    var task_type = 0;
    var module_id = "";
    var module_name = "";
    var event_type = "";
    var module_type = 0;
    switch (search_type){
        case "onekey_search":
            task_type = 401;
            module_id = "501";
            module_name = req.i18n.t('datasearch.onekey-search');
            event_type = "3007";
            module_type = 501;
            break;
        case "sort_search":
            task_type = 402;
            module_id = "502";
            module_name = req.i18n.t('datasearch.sort-search');
            event_type = "3013";
            module_type = 502;
            break;
        case "template_search":
            task_type = 403;
            module_id = "503";
            module_name = req.i18n.t('datasearch.template-search');
            event_type = "3012";
            module_type = 503;
            break;
        case "file_search":
            task_type = 404;
            module_id = "504";
            module_name = req.i18n.t('datasearch.file-search');
            event_type = "3014";
            module_type = 504;
            break;
        case "system_search":
            task_type = 405;
            module_id = "505";
            module_name = req.i18n.t('datasearch.system-search');
            event_type = "3016";
            module_type = 505;
            break;
    }

    return {
        search_code: search_code,
        return_code: return_code,
        task_type: task_type,
        module_id: module_id,
        module_name: module_name,
        event_type: event_type,
        module_type: module_type
    }

}

function get_bussType(search_type){
    var bussType = "";
    switch (search_type){
        case "onekey_search":
            bussType = "search_all";
            break;
        case "sort_search":
            bussType = "search_sort";
            break;
        case "template_search":
            bussType = "search_template";
            break;
        case "file_search":
            bussType = "search_file";
            break;
        case "system_search":
            bussType = "search_dianwei";
            break;
    }
    return bussType;
}

/*function get_actionInfo(user_info, bussType, spytime, clueList, systemList) {
    var actionInfo = {
        "userParam": {
            "userId": user_info.userId,
            "registrationDomain": user_info.areaCode,
            "loginedDomain": user_info.areaCode
        },
        "businessParam": {
            "systemLocation": user_info.areaCode,
            "systemId": "10001",
            "bussType": bussType,
            "timeFrom": spytime.Begin,
            "timeTo": spytime.End
        },
        "paramList": [
            {
                "clueList": clueList,
                "systemList": systemList
            }
        ]
    };

    return actionInfo;

}*/

/*function get_common_workflows(examList){
    var workflow_dic = {};
    _.each(examList, function(exam){
        var workflows = exam.workflows;
        _.each(workflows, function(workflow){
            if(workflow_dic[workflow.processKey]){
                workflow_dic[workflow.processKey].count++;
            }
            else{
                workflow_dic[workflow.processKey] = {
                    workflow: workflow,
                    count: 1
                }
            }
        });
    });

    var common_workflows = [];
    for(var processKey in workflow_dic) {
        if(workflow_dic[processKey].count == examList.length){
            common_workflows.push(workflow_dic[processKey].workflow);
        }
    }

    return common_workflows;
}*/

router.all('/get_exam_flag',function(req,res){
    res.endj(sysConfig.get_exam_flag());
})

/*router.all('/get_checkresult_info', function (req, res) {
    var search_condition = req.query.search_condition;
    var zkqy = req.query.zkqy;
    var SpyTime = req.query.spytime;

    var search_type = req.query.search_type;
    var user = req.generalArgument;

    //检测审批规则
    UserManageApi(req).getUserProfile({userId: user.userId})
        .then(function(user_rsp){
            var bussType = get_bussType(search_type);
            var cluelist = get_checkresult_cluelist(search_condition);
            var systemlist = get_checkresult_systemlist(zkqy);
            var actionInfo = get_actionInfo(user_rsp.data, bussType, SpyTime, cluelist, systemlist);
            console.log("actionInfo", JSON.stringify(actionInfo, null, 2));
            RuleDecisionApi(req).getCheckResultInfo(actionInfo, function (result) {
                console.log(JSON.stringify(result, null, 2));
                if(result.code < 0) {
                    res.endj(result);
                }
                else if(result.code != 0){
                    var failedClueList = result.data.failedClueList;
                    var systemResult = result.data.systemResult;

                    if(failedClueList.length > 0) {
                        res.endj({
                            code: 11,
                            message: "",
                            data: failedClueList
                        });
                    }
                    else {
                        var examList = systemResult.examList;
                        var resourceList = systemResult.resourceList;

                        if(resourceList.length > 0){
                            res.endj({
                                code: 12,
                                message: "",
                                data: resourceList
                            });
                        }
                        else if(examList.length > 0){
                            var common_workflows = get_common_workflows(examList);
                            console.log(JSON.stringify(common_workflows, null, 2));
                            res.endj({
                                code: 13,
                                message: "",
                                data: common_workflows
                            });
                        }
                        else{
                            res.endj({
                                code: 0,
                                message: "",
                                data: {}
                            });
                        }

                    }


                }
                else{
                    res.endj(result);
                }

            }).catch(res.endj)

        }).catch(res.endj);
});*/

/*router.all('/search_post', function (req, res) {
    req._novaLogs = [];
    var search_condition = req.query.search_condition;
    var protocols = req.query.protocols;
    var zkqy = req.query.zkqy;
    var search_result_maxnum = req.query.search_result_maxnum;
    var task_name = req.query.task_name;
    var detail = req.query.detail;
    var SpyTime = req.query.spytime;
    var event_type_desc = req.query.event_type_desc;
    var search_remark = common_config.search_remark;
    var return_remark = common_config.return_remark;
    var onekey_param = req.query.onekey_param;
    var exam_flag = req.query.exam_flag;

    var search_type = req.query.search_type;
    var isfulltext = req.query.isfulltext;
    var search_type_param = get_search_param_by_type(search_type, isfulltext);
    var search_code = search_type_param.search_code;
    var return_code = search_type_param.return_code;
    var task_type = search_type_param.task_type;
    var module_id = search_type_param.module_id;
    var event_type = search_type_param.event_type;
    var module_type = search_type_param.module_type;
    var user = req.generalArgument;
    var audit_datas = get_audit_datas(search_condition);

    //审计信息
    var audit_info = {
        Common: {
            HostIP: "",
            HostMAC: "",
            UserID: "",
            Domain: "",
            OccurTime: "",
            SysID: "8001",
            Vender: "1",
            ModuleID: module_id,//暂时没有模块编号，置空
            EventType: event_type,// 事件编号，参照《技侦鉴权审计中心 业务审计规范1.0》附录7.5
            EventTypeDes: event_type_desc, //事件描述，参照《技侦鉴权审计中心业务审计规范》附录7.5
            Detail: detail,
            Result: "0" //默认调用服务成功
        },
        TaskFetch: [
            {
                SerialID:"",
                TaskID: "",
                FTaskID: "",
                CaseName: "",
                ObjectName: "",
                CaseSort: "",
                CaseDirection: "",
                SpyRegion: "",
                SpySystem: "8001",
                SpyTime: SpyTime,
                Datas: audit_datas
            }
        ]
    };


    var user_role = {};
    RoleApi(req).queryRole({userId: user.userId})
        .then(function (role_rsp) {
            user_role = role_rsp.data;

            var search_server_data = "";
            if(onekey_param != undefined){
                search_server_data = search_data_to_server_data(search_condition, protocols, search_code, search_remark, return_code, return_remark, search_result_maxnum, onekey_param);
            }
            else{
                search_server_data = search_data_to_server_data(search_condition, protocols, search_code, search_remark, return_code, return_remark, search_result_maxnum);
            }

            var datasourcedata = datacenter_to_xml(zkqy);
            var identity_info = identity_to_xml(user, user_role);

            var data = {
                name: task_name,
                mode: 3,
                taskType: task_type,
                dirId: -10000 - user.userId,
                priority: 1,
                taskDetail: make_task_xml(identity_info, datasourcedata, search_server_data),
                description: detail,
                AuditInfo: audit_info,
                examFlag: exam_flag


            };

            console.log(JSON.stringify(data,null,2));
            //console.log("task_xml", console.log(JSON.stringify(data.taskDetail,null,2)));
            TaskCommonApi(req).submitTask(data).then(function(rsp){
                var auditInfo = data.AuditInfo;
                auditInfo.TaskFetch[0].TaskID = rsp.data;
                auditInfo.TaskFetch[0].FTaskID = -1;
                var promises = [];
                promises.push(LogApi(req).recordLog({
                    moduleType: module_type,
                    operationType: 10,
                    content: detail,
                    detailType: 1,
                    detailId: rsp.data,
                    AuditInfo: auditInfo
                }));

                Q.all(promises).then(function(rsp2) {
                    res.endj({
                        code: 0,
                        data: rsp.data
                    });
                }).catch(function() {
                    res.endj({
                        code: 0,
                        message: common_config.message.task_beian_faild,
                        data: rsp.data
                    });
                });
            }).catch(res.endj);
        }).catch(res.endj);
});*/

function get_system_list(zkqy){
    var systems = {
        code_list: "",
        system_code_list: ""
    };

    _.each(zkqy, function(data_area){

        _.each(data_area.children, function(data_system){
            if(systems.code_list == ""){
                systems.code_list = data_system.key;
            }
            else{
                systems.code_list += "," + data_system.key;
            }

            if(systems.system_code_list == ""){
                systems.system_code_list = data_system.system_key;
            }
            else {
                systems.code_list += "," + data_system.system_key;
            }
        });
    });

    return systems;
}

function get_data_area(zkqy){
    var data_areas = [];

    _.each(zkqy, function(data_area){
        var data_area_item = {
            code: data_area.key,
            areaCode: data_area.area_code,
            children:[]
        };

        _.each(data_area.children, function(data_system){
            data_area_item.children.push({
                code: data_system.key,
                systemCode: data_system.system_key,
                submitPoint: data_system.submit_point
            })
        });

        data_areas.push(data_area_item);
    });

    return data_areas;
}

router.all('/search_task_post', function (req, res) {
    req._novaLogs = [];
    var search_condition = req.query.search_condition;
    var protocols = req.query.protocols;
    var zkqy = req.query.zkqy;
    var search_result_maxnum = req.query.search_result_maxnum;
    var task_name = req.query.task_name;
    var detail = req.query.detail;
    var SpyTime = req.query.spytime;
    var event_type_desc = req.query.event_type_desc;
    var search_remark = common_config.search_remark;
    var return_remark = common_config.return_remark;
    var onekey_param = req.query.onekey_param;

    var search_type = req.query.search_type;
    var isfulltext = req.query.isfulltext;
    var search_type_param = get_search_param_by_type(search_type, isfulltext, req);
    var search_code = search_type_param.search_code;
    var return_code = search_type_param.return_code;
    var task_type = search_type_param.task_type;
    var module_id = search_type_param.module_id;
    var module_name = search_type_param.module_name;
    var event_type = search_type_param.event_type;
    var module_type = search_type_param.module_type;
    var user = req.generalArgument;
    var audit_datas = get_audit_datas(search_condition);
    var system_list = get_system_list(zkqy);
    var system_id_list = system_list.code_list;
    var system_systemid_list = system_list.system_code_list;

    //审计信息
    var audit_info = {
        Common: {
            HostIP: "",
            HostMAC: "",
            UserID: "",
            Domain: "",
            OccurTime: "",
            SysID: "",
            Vender: "1",
            ModuleID: module_id,//暂时没有模块编号，置空
            ModuleName: module_name,
            EventType: event_type,// 事件编号，参照《技侦鉴权审计中心 业务审计规范1.0》附录7.5
            EventTypeDes: event_type_desc, //事件描述，参照《技侦鉴权审计中心业务审计规范》附录7.5
            Detail: detail,
            Result: "0" //默认调用服务成功
        },
        TaskFetch: [
            {
                SerialID:"",
                TaskID: "",
                FTaskID: "",
                CaseName: "",
                ObjectName: "",
                CaseSort: "",
                CaseDirection: "",
                SpyRegion: "",
                SpySystem: system_systemid_list,
                SpyTime: SpyTime,
                Datas: audit_datas
            }
        ]
    };

    var search_server_data = "";
    if(onekey_param != undefined){
        search_server_data = search_data_to_xml(search_condition, protocols, search_code, search_remark, return_code, return_remark, search_result_maxnum, system_id_list, search_type, onekey_param);
    }
    else{
        search_server_data = search_data_to_xml(search_condition, protocols, search_code, search_remark, return_code, return_remark, search_result_maxnum, system_id_list, search_type);
    }

    var identity_info = identity_to_xml(user, []);
    var common_info = common_to_xml(commonConfig.areaCode, search_type);

    var task_detail_xml = make_task_condition_xml(common_info, identity_info, search_server_data);



    var search_data = {
        loginSystemId: "10001",
        loginAreaCode: commonConfig.areaCode,
        bussType: get_bussType(search_type),
        dataArea: get_data_area(zkqy),
        clueList: get_checkresult_cluelist(search_condition),
        moduleType: module_type,
        auditInfo: JSON.stringify(audit_info),
        taskName: task_name,
        taskDesc: detail,
        taskCondition: task_detail_xml,
        startTime: SpyTime.Begin,
        endTime: SpyTime.End,
        taskType: task_type,
        dataSort: protocols.toString(),
        taskStatus:"",
        taskPriority: 1,
        dirType:1,
        dirId: -10000 - user.userId,
        operateAspect:"",
        operateKeyword:"",
        operateDesc:"",
        operateReason:"",
        resultLimit: search_result_maxnum,
        otherInfo:""
    };

    console.log(JSON.stringify(search_data.taskCondition, null, 2));

    TaskManageApi(req).insertTask(search_data, function(rsp){
        res.endj(rsp);
    }).catch(res.endj);



});

router.all('/get_user_info', function (req, res) {
    var tgt = req.cookies['tgt'];
    LoginApi(req).loginVerify({
        tgt: tgt
    })
        .then(function (rsp) {
            res.endj(rsp);
        })
        .catch(function (rsp) {
            // res.endj({code: 2});
            if (isHtmlPage(req.path)) {
                res.status(302);
                res.setHeader('Location', '/user/login.html');
                res.end();
            } else {
                if (rsp) {
                    rsp.code = Code.TGT_INVALID;
                }
                res.endj(rsp);
            }
        });
});

router.all('/get_current_language',function(req,res){
    res.endj(sysConfig.get_current_language());
})

router.all('/get_carriers',function(req,res){
    CommonConfig.getCarriers(req, function (result) {

        res.endj(result);
    });
})

function get_audit_datas(search_condition) {
    if(search_condition == undefined){
        return [];
    }

    var type = search_condition["type"];
    if(type == undefined){
        return [];
    }

    if(type == "item"){
        return {
            Type: "KEYWORD",
            Content: search_condition["value"].toString()
        }
    }
    else if(type == "relation"){
        var items = search_condition["items"];
        if(items == undefined){
            return [];
        }
        var item_list = [];
        _.each(items, function(item){
            item_list = item_list.concat(get_audit_datas(item));
        });
        return item_list;
    }
    else{
        return [];
    }
}

function get_all_search_item_list(search_condition) {
    if(search_condition == undefined){
        return [];
    }

    var type = search_condition["type"];
    if(type == undefined){
        return [];
    }

    if(type == "item"){
        return {
            Type: search_condition["code"],
            Content: search_condition["value"].toString()
        }
    }
    else if(type == "relation"){
        var items = search_condition["items"];
        if(items == undefined){
            return [];
        }
        var item_list = [];
        _.each(items, function(item){
            item_list = item_list.concat(get_all_search_item_list(item));
        });
        return item_list;
    }
    else{
        return [];
    }
}

function get_checkresult_cluelist(search_condition) {
    var search_condition_list = get_all_search_item_list(search_condition);

    var clueList = [];
    for(var clueid = 0; clueid < search_condition_list.length; clueid++){
        var clue = search_condition_list[clueid];
        var clueItem = {
            "clueId": clueid,
            "clueType": clue.Type,
            "keywordParamList": [{"key": clue.Type, "value": clue.Content}]
        };
        clueList.push(clueItem);
    }
    return clueList;
}

/*function get_checkresult_systemlist(zkqy) {
    var systemList = [];
    _.each(zkqy, function(area){
        var systems = area.children;
        _.each(systems, function(datacenter){
            var systemItem = {
                "systemId": datacenter.system_key,
                "systemLocation": area.area_code,
                "equList": []
            };
            systemList.push(systemItem);
        });


    });
    return systemList;
}*/

function get_server_condition(search_condition) {

    var server_condition = {
        "@rel": search_condition.operation
    };

    var conditions = [];
    var items = [];

    if (search_condition.items) {
        for (var i = 0; i < search_condition.items.length; i++) {
            if (search_condition.items[i].type == "relation") {
                conditions.push(get_server_condition(search_condition.items[i]));
            }
            else {
                items.push(get_server_item(search_condition.items[i]));
            }
        }
    }


    if (conditions.length > 0) {
        server_condition["CONDITION"] = conditions;
    }
    if (items.length > 0) {
        server_condition["ITEM"] = items;
    }
    return server_condition;
}

function get_server_item(search_item) {
    var server_item = {
        "@eng": search_item.code,
        "@val": search_item.value
    };
    if (search_item.operation) {
        server_item["@opr"] = search_item.operation;
    }

    if (search_item.title) {
        server_item["@chn"] = search_item.title;
    }

    return server_item;
}

function get_server_dataset(protocols, return_code, return_remark) {
    var dataset_list = [];
    _.each(protocols, function (protocol) {
        dataset_list.push({"@name": protocol});

    });

    var dataset = {
        "@name": return_code,
        "@rmk": return_remark,
        DATA: [
            {
                DATASET: dataset_list
            }
        ]
    };

    return dataset;
}

/*function search_data_to_server_data(search_data, protocols, search_code, search_remark, return_code, return_remark, search_result_maxnum, onekey_param) {

    var default_items = [{
        "@key": "",
        "@val": search_result_maxnum,
        "@eng": "SEARCH_RESULT_MAXNUM",
        "@chn": common_config.search_result_maxnum
    }];

    if (onekey_param != undefined) {
        default_items.push({
            "@key": "",
            "@val": onekey_param.search_application_type.value,
            "@eng": onekey_param.search_application_type.code,
            "@chn": onekey_param.search_application_type.title
        });
        default_items.push({
            "@key": "",
            "@val": onekey_param.data_scope.value,
            "@eng": onekey_param.data_scope.code,
            "@chn": onekey_param.data_scope.title
        })
    }

    var server_data = {
        DATASET: {
            "@name": search_code,
            "@rmk": search_remark,
            DATA: {
                ITEM: default_items,
                CONDITION: [],
                DATASET: []
            }

        }
    };



    server_data.DATASET.DATA.CONDITION.push(get_server_condition(search_data));
    server_data.DATASET.DATA.DATASET.push(get_server_dataset(protocols, return_code, return_remark));

    var xml = xmlbuilder.create(server_data);
    var xml_string = xml.toString({
        pretty: true,
        indent: '  ',
        offset: 1,
        newline: '\n'
    });

    return xml_string;
}*/

function search_data_to_xml(search_data, protocols, search_code, search_remark, return_code, return_remark, search_result_maxnum, system_id_list, search_type, onekey_param) {

    var default_items = [{
        "@key": "",
        "@val": search_result_maxnum,
        "@eng": "SEARCH_RESULT_MAXNUM",
        "@chn": common_config.search_result_maxnum
    }];

    if (onekey_param != undefined) {
        default_items.push({
            "@key": "",
            "@val": onekey_param.search_application_type.value,
            "@eng": onekey_param.search_application_type.code,
            "@chn": onekey_param.search_application_type.title
        });
        default_items.push({
            "@key": "",
            "@val": onekey_param.data_scope.value,
            "@eng": onekey_param.data_scope.code,
            "@chn": onekey_param.data_scope.title
        })
    }

    default_items.push({
        "@val": "yyyyyy",
        "@eng": "CHECK_CODE",
        "@chn": common_config.exam_check
    });
    default_items.push({
        "@val": "",
        "@eng": "CLUE_ID",
        "@chn": common_config.search_id
    });

    if(search_type == "system_search"){
        default_items.push({
            "@val": commonConfig.areaCode,
            "@eng": "SPY_REGION",
            "@chn": common_config.zk_area,
            "@rmk": commonConfig.areaName
        }, {
            "@val": "50003",
            "@eng": "SPY_SYSTEM",
            "@chn": common_config.zk_system,
            "@rmk": common_config.dianwei
        });
    }

    var server_data = {
        DATASET: {
            "@name": search_code,
            "@rmk": search_remark,
            DATA: {
                ITEM: default_items,
                CONDITION: [],
                DATASET: []
            }

        }
    };

    server_data.DATASET.DATA.CONDITION.push(get_server_condition(search_data));
    server_data.DATASET.DATA.CONDITION[0].ITEM.push({
        "@eng": "SYSTEM_ID",
        "@chn": common_config.datasource_system,
        "@val": system_id_list,
        "@opr": "in"
    });

    server_data.DATASET.DATA.DATASET.push(get_server_dataset(protocols, return_code, return_remark));

    var xml = xmlbuilder.create(server_data);
    var xml_string = xml.toString({
        pretty: true,
        indent: '  ',
        offset: 1,
        newline: '\n'
    });

    return xml_string;
}

/*function datacenter_to_xml(datacenters) {
    var server_data = {
        DATASET: {
            "@name": "datasource_info",
            "@rmk": common_config.datasource_info,
            DATA: []
        }
    }

    _.each(datacenters, function (datacenter) {
        var areaLayer = {
            DATASET: {
                "@name": datacenter.key,
                "@rmk": datacenter.title,
                DATA: []
            }
        }

        var datasystems = datacenter.children;


        _.each(datasystems, function (datasystem) {
            var systemLayer = {
                DATASET: {
                    "@name": datasystem.key,
                    "@rmk": datasystem.title
                }
            }

            areaLayer.DATASET.DATA.push(systemLayer);
        });

        server_data.DATASET.DATA.push(areaLayer);
    });

    console.log(JSON.stringify(server_data, null, 2));

    var xml = xmlbuilder.create(server_data);

    var xml_string = xml.toString({
        pretty: true,
        indent: '  ',
        offset: 1,
        newline: '\n'
    });

    return xml_string;
}*/

function common_to_xml(local_area_code, search_type){
    var msg_type = "";

    if(search_type == "system_search"){
        msg_type = "REQ_PTCX";
    }
    else{
        msg_type = "REQ_YJS";
    }

    var common_data = {
        DATASET: {
            "@name": "JZ_COMMON_010000",
            "@rmk": common_config.msg_common_info,
            DATA: {
                ITEM: [
                    {
                        "@eng": "FROM",
                        "@chn": common_config.from_node_flag,
                        "@val": local_area_code,
                        "@rmk": common_config.unknown
                    },
                    {
                        "@eng": "TO",
                        "@chn": common_config.to_node_flag,
                        "@val": "",
                        "@rmk": common_config.unknown
                    },
                    {
                        "@eng": "RESPONSE_TYPE",
                        "@chn": common_config.response_type,
                        "@val": "2",
                        "@rmk": common_config.asyn_response
                    },
                    {
                        "@eng": "MESSAGE_SEQUENCE",
                        "@chn": common_config.msg_seq,
                        "@val": "",
                        "@rmk": common_config.seq_id
                    },
                    {
                        "@eng": "MESSAGE_TYPE",
                        "@chn": common_config.msg_type,
                        "@val": msg_type,
                        "@rmk": common_config.common_search_request
                    },
                    {
                        "@eng": "SYS",
                        "@chn": common_config.sys_flag,
                        "@val": "",
                        "@rmk": ""
                    }
                ]
            }
        }
    };

    var xml = xmlbuilder.create(common_data);

    var xml_string = xml.toString({
        pretty: true,
        indent: '  ',
        offset: 1,
        newline: '\n'
    });

    return xml_string;
}

function identity_to_xml(user, user_role) {

    var server_data = {
        DATASET: {
            "@name": "JZ_COMMON_010001",
            "@rmk": common_config.identity_info,
            DATA: {
                ITEM: []
            }
        }
    }

    server_data.DATASET.DATA.ITEM.push({
        "@key": "01A0001",
        "@val": "",
        "@eng": "DEPARTMENT",
        "@chn": common_config.department_code
    });

    server_data.DATASET.DATA.ITEM.push({
        "@key": "96A0026",
        "@val": user.loginName,
        "@eng": "USER_NAME",
        "@chn": common_config.user_name
    });

    var role_ids = "";
    _.each(user_role, function (role) {
        role_ids += role.roleID + ',';
    });

    var role_types = "";
    _.each(user_role, function (role) {
        role_types += role.roleType + ',';
    });

    server_data.DATASET.DATA.ITEM.push({
        "@key": "96A0026",
        "@val": role_ids,
        "@eng": "ROLE_ID",
        "@chn": common_config.role
    });

    server_data.DATASET.DATA.ITEM.push({
        "@key": "96A0025",
        "@val": role_types,
        "@eng": "ROLE_TYPE",
        "@chn": common_config.role_type
    });

    var xml = xmlbuilder.create(server_data);

    var xml_string = xml.toString({
        pretty: true,
        indent: '  ',
        offset: 1,
        newline: '\n'
    });

    return xml_string;
}

function datacenter_filter(confige_datacenter_list, datacenters) {
    var user_datacenter_list = [];
    for (var i = 0; i < confige_datacenter_list.length; i++) {
        var key = confige_datacenter_list[i].key;
        var title = confige_datacenter_list[i].title;
        var area_code =  confige_datacenter_list[i].area_code;
        for (var j = 0; j < datacenters.length; j++) {
            if (key == datacenters[j].key) {
                var user_datacenter = data_area_node(key, title, area_code);

                var config_children = confige_datacenter_list[i].children;
                var dc_children = datacenters[j].children;
                for (var m = 0; m < config_children.length; m++) {
                    var config_key = config_children[m].key;
                    var config_system_key = config_children[m].system_key;
                    var config_title = config_children[m].title;
                    var config_submitpoint = config_children[m].submit_point;

                    for (var n = 0; n < dc_children.length; n++) {
                        if (config_key == dc_children[n].key) {
                            user_datacenter.children.push(data_system_node({
                                code: config_key,
                                system_code: config_system_key,
                                name: config_title,
                                submit_point: config_submitpoint
                            }));
                        }
                    }
                }

                user_datacenter_list.push(user_datacenter);

            }
        }
    }

    return user_datacenter_list;
}

function build_datacenter_tree(topDataAreaGroups, topDataAreas, type) {
    var datacenter_list = new Array();

    if (topDataAreaGroups != null) {
        for (var i = 0; i < topDataAreaGroups.length; i++) {

            var dataAreaGroup = topDataAreaGroups[i];

            var areaGroupNode = data_area_group_node(dataAreaGroup.CODE[0], dataAreaGroup.NAME[0]);
            datacenter_list.push(areaGroupNode);

            var dataAreas = dataAreaGroup.DATA_AREA;
            for (var j = 0; j < dataAreas.length; j++) {
                var dataArea = dataAreas[j];

                var areaNode = data_area_node(dataArea.CODE[0], dataArea.NAME[0], dataArea.AREA_CODE[0]);
                areaGroupNode.children.push(areaNode);

                var dataSystems = dataArea.DATA_SYSTEM;
                for (var k = 0; k < dataSystems.length; k++) {
                    var dataSystem = dataSystems[k];
                    var systemNode = data_system_node({
                        code: dataSystem.CODE[0],
                        system_code: dataSystem.SYSTEM_CODE[0],
                        name: dataSystem.NAME[0],
                        submit_point: dataSystem.SUBMIT_POINT[0]
                    });
                    areaNode.children.push(systemNode);
                }
            }
        }
    }

    if (topDataAreas != null) {
        for (var j = 0; j < topDataAreas.length; j++) {
            var dataArea = topDataAreas[j];

            var areaNode = data_area_node(dataArea.CODE[0], dataArea.NAME[0], dataArea.AREA_CODE[0]);

            var dataSystems = dataArea.DATA_SYSTEM;
            for (var k = 0; k < dataSystems.length; k++) {
                var dataSystem = dataSystems[k];

                if (type != dataSystem.QUERY_TYPE[0]) {
                    continue;
                }

                var systemNode = data_system_node({
                    code: dataSystem.CODE[0],
                    system_code: dataSystem.SYSTEM_CODE[0],
                    name: dataSystem.NAME[0],
                    submit_point: dataSystem.SUBMIT_POINT[0]
                });
                areaNode.children.push(systemNode);
            }

            if(areaNode.children.length > 0){
                datacenter_list.push(areaNode);
            }

        }
    }

    return datacenter_list;
}

function data_system_node(system_node) {
    return {
        key: system_node.code,
        system_key: system_node.system_code,
        title: system_node.name,
        submit_point: system_node.submit_point,
        type: "data_system"
    };
}

function data_area_node(code, name, area_code) {
    return {
        key: code,
        title: name,
        area_code: area_code,
        type: "data_area",
        folder: true,
        expanded: true,
        children: new Array()
    };
}

function data_area_group_node(code, name) {
    return {
        key: code,
        title: name,
        type: "data_area_group",
        folder: true,
        expanded: true,
        children: new Array()
    };
}
/*router.all('/onekey_search_category_init', function (req, res) {

 console.log("onekey_search_category_init");

 configReader.getConfigData(function (result) {
 var categories = result.CONFIG_DATA.CATEGORIES[0].CATEGORY;
 console.log(JSON.stringify(categories), null, 2);
 res.endj(categories);
 });


 });*/


/*function make_task_xml(identityinfo, datasourceinfo, conditioninfo) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?>'
    xml += '\n<MESSAGE>';
    xml += '\n' + identityinfo;
    xml += '\n' + datasourceinfo;
    xml += '\n' + conditioninfo;
    xml += '\n</MESSAGE>';

    return xml;
}*/

function make_task_condition_xml(commoninfo, identityinfo, conditioninfo){
    var xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '\n<MESSAGE>';
    xml += '\n' + commoninfo;
    xml += '\n' + identityinfo;
    xml += '\n' + conditioninfo;
    xml += '\n</MESSAGE>';

    return xml;
}

function isHtmlPage(path) {
    return path == '/' || /\.html?$/.test(path);
}


module.exports = router;
