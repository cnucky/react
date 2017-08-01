registerLocales(require.context('../../../../../datasearch/src/locales/datasearch/', false, /\.js/));
define('./service', [

    'moment',
    'nova-dialog',
    'nova-notify',
    'q',
    '../../../../../datasearch/src/js/module/search-operation-define',

], function(moment, Dialog, Notify, Q, search_operation_define ) {
     var search_operation_dic = search_operation_define.get_search_operation_dic();
    var search_relation_dic = search_operation_define.get_search_relation_dic();


    var getDatatypes = function() {
        var defer = Q.defer();
        $.getJSON('/datasearch/datasearch/get_datatypes', {
            data_types: ['DATA', 'FILE']
        }, function(rsp) {
            if (rsp && rsp.code == 0 && rsp.data && rsp.data.length > 0) {
                defer.resolve(rsp.data)
            } else {
                Notify.show({
                    title: '一键搜获取查询条件接口返回错误',
                    type: "error"
                });
                defer.reject({
                    code: 2,
                    data: []
                })
            }
        });
        return defer.promise;
    }



    var getDatacenters = function() {
        var defer = Q.defer();
        $.getJSON('/datasearch/datasearch/get_datacenters', {}, function(rsp) {
            if (rsp && rsp.code == 0 && rsp.data && rsp.data.length > 0) {
                defer.resolve(rsp.data)
            } else {
                defer.reject({
                    code: 2,
                    data: []
                })
            }
        });
        return defer.promise;
    }

    var getSearchResultMaxnum = function() {
        var defer = Q.defer();
        $.getJSON('/datasearch/datasearch/get_search_result_maxnum', {}, function(rsp) {
            if (rsp) {
                defer.resolve(rsp)
            } else {
                defer.reject({
                    code: 2,
                    data: []
                })
            }
        });
        return defer.promise;
    }


    var getConds = function(inputElementId, startTime, endTime) {
        var defer = Q.defer();
        Q.all([getDatatypes(), getDatacenters(), getSearchResultMaxnum()]).spread(function(dataTypes, dataCenters, searchResultMaxnum) {
            let categories = [];
            _.each(dataTypes, function(dT) {
                categories.push(dT.Name)
            })

            let zkqy = dataCenters;
            let search_position = 1;

            let search_params = {
                categories: categories,
                startTime: startTime,
                endTime: endTime,
                zkqy: zkqy,
                search_position: search_position
            };

            let search_type_param = {
                search_type: 'address',
                search_type_name: '码址/关键词'
            }

            let rlf_invoke = {
                maxnum: searchResultMaxnum
            }
            let submit_params = get_submit_params(inputElementId, search_params, search_type_param, rlf_invoke)
            defer.resolve(submit_params)


        }, function() {
            Notify.show({
                title: '一键搜获取查询条件接口返回错误',
                type: "error"
            });
        });




        return defer.promise;
    }

    function get_submit_params(inputElementId, search_params, search_type_param, rlf_invoke) {

       

        var condition = $(inputElementId).val().trim();
        $(inputElementId).val(condition);

        var lines = condition.split("\n");

        if (lines.length > 1000) {
            Notify.show({
                title: i18n.t("datasearch.searchall.js.too_many_conditions"),
                text: i18n.t("datasearch.searchall.js.max_conditions"),
                type: "warning"
            });
            return;
        }


        var conditions = {
            "type": "relation",
            "operation": search_relation_dic.AND.name,
            "items": []
        };
        var audit_datas = [];

        var task_name_prefix = ""; //i18n.t("datasearch.searchall.js.one_key_search") + ": ";
        var task_name = task_name_prefix;

        if (lines.length > 1) {
            task_name = task_name + i18n.t("datasearch.searchall.js.batch");
        }

        var search_type = "";
        var search_type_name = "";
        if (search_type_param != undefined) {
            search_type = search_type_param.search_type;
            search_type_name = search_type_param.search_type_name;
        } else {
            $(".tab_header").each(function() {
                if ($(this).parent().hasClass("active")) {
                    search_type = $(this).attr("search_type");
                    search_type_name = this.innerText;
                    return false;
                }
            });
        }

        add_keyword_conditions(conditions, lines, "address", i18n.t("datasearch.searchall.js.address"), audit_datas);

        var task_detail = task_name_prefix + search_type_name + ':' + condition.replace(/\n/g, ';') + ";" + " " + i18n.t("datasearch.searchall.js.cap_time") + ":" + search_params.startTime + "," + search_params.endTime + ";";

        if (task_detail.length > 500) {
            task_detail = task_detail.substring(0, 500) + "...";
        }

        //task_name += search_type_name + ":" + condition.replace(/\n/g, ';');
        task_name = task_name_prefix + search_type_name + ':' + condition.replace(/\n/g, ';') + ";" + " " + i18n.t("datasearch.searchall.js.cap_time") + ":" + search_params.startTime + "," + search_params.endTime + ";";

        if (task_name.length > 50) {
            task_name = task_name.substring(0, 50) + "...";
        }

        var spy_time = {
            Begin: search_params.startTime,
            End: search_params.endTime
        };

        $("#div_error").addClass("hidden");

        conditions.items.push({
            "type": "item",
            "code": "CAP_TIME",
            "title": i18n.t("datasearch.searchall.js.cap_time"),
            "operation": search_operation_dic.BTW.name,
            "value": [
                search_params.startTime,
                search_params.endTime
            ]
        });

        var submit_params = {
            task_name: task_name,
            onekey_param: {
                data_scope: {
                    "type": "item",
                    "code": "DATA_SCOPE",
                    "title": i18n.t("datasearch.searchall.js.search_position"),
                    "value": search_params.search_position
                },
                search_application_type: {
                    "type": "item",
                    "code": "SEARCH_APPLICATION_TYPE",
                    "title": i18n.t("datasearch.searchall.js.one_key_search_type"),
                    "value": search_type
                }
            },
            detail: task_detail,
            spytime: spy_time,
            zkqy: search_params.zkqy,
            protocols: search_params.categories,
            search_condition: conditions,
            audit_datas: audit_datas,
            search_result_maxnum: rlf_invoke == undefined ? search_range.get_search_result_maxnum() : rlf_invoke.maxnum
        };

        return submit_params;

    }

            function add_keyword_conditions(conditions, lines, code, title, audit_datas) {
            if (lines.length == 1) {
                add_and_keyword_conditions(conditions, lines[0], code, title, true, audit_datas);
            }
            else {
                var outterCons =
                {
                    "type": "relation",
                    "operation": search_relation_dic.OR.name,
                    "items": new Array()
                };

                _.each(lines, function (line) {
                    add_and_keyword_conditions(outterCons, line, code, title, false, audit_datas);
                });

                conditions.items.push(outterCons);
            }
        }

        function add_and_keyword_conditions(parent_conditions, line, code, title, singleLine, audit_datas) {
            line = line.trim();

            //分词匹配
            var keywords = line.split(' ');

            if (keywords.length > 1) {
                var outterCons = {
                    "type": "relation",
                    "operation": search_relation_dic.AND.name,
                    "items": new Array()
                };

                _.each(keywords, function (keyword) {
                    if(keyword == ""){
                        return true;
                    }

                    outterCons.items.push({
                        "type": "item",
                        "code": code,
                        "title": title,
                        "operation": search_operation_dic.EQ.name,
                        "value": keyword
                    });

                    audit_datas.push({
                        Type: "KEYWORD",
                        Content: keyword
                    });
                })

                parent_conditions.items.push(outterCons);
            }
            else {
                if (singleLine) {
                    var outterCons = {
                        "type": "relation",
                        "operation": search_relation_dic.AND.name,
                        "items": new Array()
                    };

                    outterCons.items.push({
                        "type": "item",
                        "code": code,
                        "title": title,
                        "operation": search_operation_dic.EQ.name,
                        "value": keywords[0]
                    })

                    audit_datas.push({
                        Type: "KEYWORD",
                        Content: keywords[0]
                    });

                    parent_conditions.items.push(outterCons);
                }
                else {
                    parent_conditions.items.push({
                        "type": "item",
                        "code": code,
                        "title": title,
                        "operation": search_operation_dic.EQ.name,
                        "value": keywords[0]
                    })

                    audit_datas.push({
                        Type: "KEYWORD",
                        Content: keywords[0]
                    });
                }

            }

        }

    return {
        getConds: getConds
    }
})