/**
 * Created by root on 10/14/16.
 */
registerLocales(require.context('../../../locales/datasearch/', false, /\.js/));
define('module/search-template/search-template-service',
    [
        'nova-notify',
    ], function (Notify) {

        function get_template_list(func) {
            $.ajax({
                url: '/datasearch/datasearch/get_search_template_list_by_user',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (res) {
                    if (res.code == 0) {
                        var template_list = res.data.templates;
                        if (typeof func === 'function') {
                            func(template_list);
                        }
                    }
                    else {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.get-template-list-faild"),
                            text: res.message,
                            type: "error"
                        });
                    }
                }
            });
        }

        function add_template(template_obj, func) {
            $.ajax({
                url: '/datasearch/datasearch/add_search_template',
                type: "POST",
                async: true,
                data: {search_template: template_obj},
                dataType: 'json',
                success: function (res) {
                    if (res.code == "0") {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.add-template-success"),
                            type: "success"
                        });

                        var template_id = res.data.id;
                        template_obj["id"] = template_id;
                        if (typeof func === 'function') {
                            func(template_obj);
                        }

                    } else {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.add-template-faild"),
                            text: res.message,
                            type: "error"
                        });
                    }
                }
            });
        }

        function delete_template(template_ids, func) {
            $.ajax({
                url: '/datasearch/datasearch/delete_search_template',
                type: "POST",
                async: true,
                data: {template_ids: template_ids},
                dataType: 'json',
                success: function (res) {
                    if (res.code == "0") {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.del-template-success"),
                            type: "success"
                        });

                        //清空右边内容
                        $("#search_template_form").html("");
                        //重新加载模板列表
                        if (typeof func === 'function') {
                            func();
                        }
                    } else {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.del-template-faild"),
                            text: res.message,
                            type: "error"
                        });
                    }
                }
            });
        }

        function update_template(template_obj, func) {
            $.ajax({
                url: '/datasearch/datasearch/update_search_template',
                type: "POST",
                async: true,
                data: {search_template: template_obj},
                dataType: 'json',
                success: function (res) {
                    if (res.code == "0") {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.update-template-success"),
                            type: "success"
                        });
                        if (typeof func === 'function') {
                            func(template_obj);
                        }
                    } else {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.update-template-faild"),
                            text: res.message,
                            type: "error"
                        });
                    }
                }
            });
        }

        function get_template_condition(template_obj, func) {
            $.ajax({
                url: '/datasearch/datasearch/get_search_template_condition',
                type: "POST",
                async: true,
                data: {template_id: template_obj.id},
                dataType: 'json',
                success: function (res) {
                    if (res.code == "0") {
                        var template = res.data;
                        template = $.extend(template_obj, template);
                        if (typeof func === 'function') {
                            func(template);
                        }

                    } else {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.get-template-condition-faild"),
                            text: res.message,
                            type: "error"
                        });
                    }
                }
            });
        }

        function get_category_protocol(func) {
            $.ajax({
                url: '/datasearch/datasearch/get_datatypes',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (res) {
                    if (res.code == 0) {
                        var dataTypes = res.data;

                        if (typeof func === 'function') {
                            func(dataTypes);
                        }
                    }
                    else {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.get-datatype-faild"),
                            text: res.message,
                            type: "error"
                        });
                    }
                }
            });
        }

        function init_category_config_dic(func) {
            $.ajax({
                url: '/datasearch/datasearch/get_search_config_dic',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (res) {
                    if (res.code == 0) {
                        var search_config_dic = res.data;

                        //console.log(JSON.stringify(category_config_dic, null, 2));
                        if (typeof func === 'function') {
                            func(search_config_dic);
                        }
                    }
                    else {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.get-datatype-faild"),
                            text: res.message,
                            type: "error"
                        });
                    }
                }
            });
        }

        function get_template_operation_config(func) {
            $.ajax({
                url: '/datasearch/datasearch/get_valuetype_operation_dic',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (res) {
                    if (res.code == 0) {
                        var operation_dic = res.data;
                        if (typeof func === 'function') {
                            func(operation_dic);
                        }
                    }
                    else {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.get-opt-type-faild"),
                            text: res.message,
                            type: "error"
                        });
                    }
                }
            });

        }

        function get_options_by_name(name) {
            var options = [];
            if (name == undefined) {
                return options;
            }
            $.ajax({
                url: '/datasearch/datasearch/get_select_options',
                type: 'POST',
                async: false,
                data: {dic_name: name},
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        options = rsp.data;
                    }
                    else {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.get-dropdown-item-faild"),
                            text: res.message,
                            type: "error"
                        });
                    }
                }
            });
            return options;

        }

        function get_language(func){
            $.ajax({
                url: '/datasearch/datasearch/get_current_language',
                type: 'POST',
                async: false,
                data: {},
                dataType: 'json',
                success: function (current_language) {
                    if (typeof func === 'function') {
                        func(current_language);
                    }
                }
            });
        }

        return {
            get_template_list: get_template_list,
            add_template: add_template,
            delete_template: delete_template,
            update_template: update_template,
            get_template_condition: get_template_condition,
            get_category_protocol: get_category_protocol,
            init_category_config_dic: init_category_config_dic,
            get_template_operation_config: get_template_operation_config,
            get_options_by_name: get_options_by_name,
            get_language: get_language
        };
    });