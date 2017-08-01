initLocales(require.context('../../locales/datasearch/', false, /\.js/));
define(
    [
        '../module/search-template/search-template-service',
        '../module/search-operation-define',
        '../module/identity-info',
        '../module/search-service',
        '../module/search-range',
        '../module/search-validation',
        '../tpl/tpl-condition-group',
        '../tpl/tpl-search-text',
        '../tpl/tpl-search-textrange',
        '../tpl/tpl-search-dropdownmultiselect',
        '../tpl/tpl-search-tagmultiselect',
        '../tpl/tpl-search-usevpn',
        '../tpl/tpl-form-group',
        'nova-dialog',
        'nova-notify',
        'nova-bootbox-dialog',
        'utility/datepicker/bootstrap-datetimepicker',
        'bootstrap-multiselect',
        'utility/duallistbox/jquery.bootstrap-duallistbox',
        'utility/input-mask/jquery.inputmask',
        'utility/nestable/jquery.nestable.template',
        'utility/jquery-validate/jquery.validate.min',
        'utility/jbase64/jbase64'
    ], function (Template_service,
                 search_operation_define,
                 identity_info,
                 Service,
                 search_range,
                 search_validation,
                 condition_group,
                 search_text,
                 search_text_range,
                 search_dropdown_multiselect,
                 search_tag_multiselect,
                 search_usevpn,
                 form_group,
                 Dialog,
                 Notify,
                 bootbox) {

        var current_language = "";
        var search_operation_dic = search_operation_define.get_search_operation_dic();
        var search_relation_dic = search_operation_define.get_search_relation_dic();
        var search_text_tpl = _.template(search_text);
        var search_text_range_tpl = _.template(search_text_range);
        var search_dropdown_multiselect_tpl = _.template(search_dropdown_multiselect);
        var search_tag_multiselect_tpl = _.template(search_tag_multiselect);
        var search_usevpn_tpl = _.template(search_usevpn);
        var form_group_tpl = _.template(form_group);

        var dataTypes = [];
        var category_protocols_dic = {};
        var category_config_dic = {};
        var category_all_config_dic = {};
        var operation_dic;
        var input_elements = [];
        var input_index = 0;
        var isfulltext = "False";

        // 业务方法 ########################################################################
        function init_category_protocols_dic(dataTypes) {
            if(dataTypes.length == 0) {
                Notify.show({
                    title: i18n.t("datasearch.protocol-checkbtn.message.no-data-type"),
                    text: "",
                    type: "warning"
                });
            }

            $.each(dataTypes, function () {
                var key = this.Name;
                var desc = this.Caption;

                category_protocols_dic[key] = {
                    desc: desc,
                    protocols: [key]
                }
            });
        }

        //读取模板初始化代码
        function init_load_template(title, isCreate) {
            var dd_list = '';
            var save_btn = '';
            var save_as_btn = '';
            var delete_btn = '';

            if (isCreate) {
                dd_list = '<ol class="dd-list"></ol>';
                save_btn = '<button class="btn btn-primary btn-sm mr15" style="width: 100px;" id="saveTemplate">' +
                '<span class="glyphicon glyphicon-floppy-disk " style="margin-right: 10px !important;"></span>' +
                i18n.t("datasearch.searchtemplate.button.save") +
                '</button>';
            }
            else {
                save_btn = '<div class="btn-group">' +
                '<button type="button" class="btn btn-primary btn-sm" style="width: 69px;" id="updateTemplate">' +
                '<span class="glyphicon glyphicon-floppy-disk " style="margin-right: 10px !important;"></span>' +
                i18n.t("datasearch.searchtemplate.button.save") +
                '</button>' +
                '<button type="button" class="btn btn-primary btn-sm dropdown-toggle mr15" data-toggle="dropdown" aria-expanded="false">' +
                '<span class="caret"></span>' +
                '<span class="sr-only">Toggle Dropdown</span>' +
                '</button>' +
                '<ul class="dropdown-menu" role="menu">' +
                '<li>' +
                '<a href="#" id="saveAsTemplate">' +
                '<span class="fa fa-floppy-o"></span>' +
                ' ' + i18n.t("datasearch.searchtemplate.button.save-as") + '</a>' +
                '</li>' +
                '<li>' +
                '<a href="#" id="deleteTemplate">' +
                '<span class="fa fa-trash-o"></span>' +
                ' ' + i18n.t("datasearch.searchtemplate.button.delete") + '</a>' +
                '</li>' +
                '</ul>' +
                '</div>';
            }

            var initCode = '<div class="panel br-primary br-t bw5">' +
                '<div class="panel-heading">' + title + '</div>' +
                '<div class="panel-menu">' +
                '<div id="search-range"></div>' +
                '</div>' +
                '<div class="panel-menu form-inline">' +
                '<select class="form-control mr5" style="width: 160px;" id="protocolSelect"></select>' +
                '<input type="text" class="form-control" id="templateName" placeholder="' +
                i18n.t("datasearch.searchtemplate.text.input-template-name") + '" style="width: 160px;" value="">' +
                '</div>' +
                '<div class="panel-body">' +
                '<div id="nestable_diy" class="dd">' +
                '<span class="dd3-content" style="display: none;"></span>' +
                dd_list +
                '</div>' +
                '</div>' +
                '<div class="panel-footer text-center">' +
                save_btn +
                '<button class="btn btn-primary btn-sm" style="width: 100px;" id="searchTemplate">' +
                '<span class="glyphicon glyphicon-search " style="margin-right: 10px !important;"></span>' +
                i18n.t("datasearch.searchtemplate.button.search") + '</button>' +
                '</div>' +
                '</div>';
            var control = $("#search_template_form");
            control.html(initCode);
            if (isCreate) {
                control.removeClass("noHand");
            }
            else {
                control.addClass("noHand");
            }
            UINestable.init(); //加载nestable js
            load_search_range("#search-range"); //加载查询选项
        }

        //加载模板列表
        function load_template_list(template_list) {
            var code = '<li class="nav-label mtn">' + i18n.t("datasearch.searchtemplate.aside.existing-template") +'</li>';
            for (var i = 0; i < template_list.length; i++) {
                code += '<li>' +
                '<a class="btn btn-primary btn-gradient btn-alt btn-block " href="#" ' +
                'tid="' + template_list[i].id + '"' +
                'category="' + template_list[i].protocol + '"' +
                '>'
                + template_list[i].name +
                '</a>' +
                '</li>';
            }
            $("#templateList ul").html(code);
        }

        //查询范围
        function load_search_range(id) {
            search_range.init(
                {
                    container: $(id),
                    labelwidth: 1,
                    contentwidth: 11
                }, function () {
                    hideLoader();
                }
            );
        }

        //读取协议列表
        function load_category_list(select_category) {
            var code = '';
            for (var i = 0; i < dataTypes.length; i++) {
                code += '<option value="' + dataTypes[i].Name + '"';
                if ((select_category == "" && i == 0) || dataTypes[i].Name == select_category) {
                    code += ' selected';
                    var category_config = category_config_dic[dataTypes[i].Name];
                    if (!$(".tray-center").hasClass("noHand")) {
                        if (category_config && category_config.length > 0) {
                            $("#nestable_diy ol.dd-list:first").html(baseCode1 + relationCode + baseCode2);
                        } else {
                            $("#nestable_diy ol.dd-list:first").html("");
                        }
                    }
                }
                code += '>' + dataTypes[i].Caption + '</option>'
            }
            return code;
        }

        //加载模板内容
        function load_template_content(template) {
            init_load_template(template.name, false);
            //模板协议
            $("#protocolSelect").html(load_category_list(template.protocol));
            //模板名称
            $("#templateName").val(template.name);
            $("#templateName").attr("tid", template.id);

            load_template_conditions(category_config_dic[template.protocol], template.conditions);

        }

        //读取协议配置内容
        function get_category_config_content(category_config, select_category) {
            var code = '';
            for (var i = 0; i < category_config.length; i++) {
                code += '<option value="' + category_config[i].Item + '"';
                if ((select_category == "" && i == 0) || category_config[i].Item == select_category) {
                    code += ' selected';
                }
                code += '>' + category_config[i].DisplayName + '</option>';
            }
            return code;
        }

        //根据协议配置加载operation
        function get_operation_of_condition(value_type, condition_operation) {
            var code = '';
            var isfulltext = (category_all_config_dic[$("#protocolSelect").val()].FullText == "True")? true:false;
            var operation_list = operation_dic[value_type];
            $.each(operation_list, function (index) {
                //不是全文检索只支持EQ
                if(value_type == "text" && !isfulltext && this.key != "EQ"){
                    return true;
                }
                var operation_item = search_operation_dic[this.key];
                code += '<option value="' + operation_item.name + '"';
                if ((condition_operation == "" && index == 0) || operation_item.name == condition_operation) {
                    code += ' selected';
                }
                code += '>' + operation_item.desc + '</option>'

            });

            return code;
        }

        //根据协议配置加载input-group内容
        function get_search_control(control) {
            var control_type = control.ControlType;
            var value_type = control.ValueType;
            var item_config = control.ItemConfig;
            control["Id"] = control.Item.replace(/,/g, "_") + "_" + input_index;
            input_index++;

            if (control_type == 'Text') {
                input_elements.push({
                    id: control["Id"],
                    name: control["Id"] + "_" + control["Rule"],
                    rule: control["Rule"]
                });
                return search_text_tpl({Control: control}).replace(/form-control/g, "form-control input-sm");
            }
            else if (control_type == 'TextRange') {
                input_elements.push({
                    id: control["Id"] + "_from",
                    name: control["Id"] + "_from_" + control["Rule"],
                    rule: control["Rule"]
                }, {
                    id: control["Id"] + "_to",
                    name: control["Id"] + "_to_" + control["Rule"],
                    rule: control["Rule"]
                });
                return search_text_range_tpl({Control: control}).replace(/form-control/g, "form-control input-sm");
            } else if (control_type == 'DropDownMultiSelect') {
                var options = Template_service.get_options_by_name(item_config);
                return search_dropdown_multiselect_tpl({Control: control, Data: options});
            } else if (control_type == 'UseVpn') {
                return search_usevpn_tpl({
                    Control: control,
                    UseVPN: i18n.t("datasearch.searchtemplate.label.use-vpn")})
                    .replace(/form-control/g, "form-control input-sm");
            }

            return "";
        }

        //根据and/or返回option
        function get_relation_content(operation) {
            var and_item = search_relation_dic.AND;
            var or_item = search_relation_dic.OR;
            if (operation == and_item.name) {
                return '<option value="' + and_item.name + '" selected>' + and_item.desc + '</option>' +
                    '<option value="' + or_item.name + '">' + or_item.desc + '</option>';
            } else if (operation == or_item.name) {
                return '<option value="' + and_item.name + '">' + and_item.desc + '</option>' +
                    '<option value="' + or_item.name + '" selected>' + or_item.desc + '</option>';
            }
        }

        //根据模板类型输出不同的模板内容
        function get_one_condition_content(category_config, condition) {
            if (condition.type == "condition") {
                return '<div class="dd3-content form-inline"><select class="form-control input-sm">' + get_relation_content(condition.operation) + '</select><div class="dropdown"><a data-toggle="dropdown"><span class="fa fa-plus-square"></span></a><ul class="dropdown-menu"></ul></div>';
            } else if (condition.type == "item") {
                num++;
                var category_config_of_condition = get_condition_by_item(category_config, condition.code);
                if (category_config_of_condition) {
                    return '<div class="dd3-content form-inline diy">' +
                        '<select class="form-control input-sm tpl-item">' + get_category_config_content(category_config, condition.code) + '</select>' +
                        '<select class="form-control input-sm tpl-opt">' + get_operation_of_condition(category_config_of_condition.ValueType, condition.operation) + '</select>' +
                        '<div class="input-group">' + get_search_control(category_config_of_condition) + '</div>' +
                        '<span class="checkbox-custom">' +
                        '<input type="checkbox" id="checkbox_' + num + '"><label for="checkbox_' + num + '">' + i18n.t("datasearch.searchtemplate.label.can-edit") +'</label>' +
                        '</span>';
                }
                else {
                    return '';
                }

            }
        }

        //根据item_code返回condition配置
        function get_condition_by_item(category_coditions, code) {
            if (code == "") {
                return category_coditions[0];
            }

            var condition;

            $.each(category_coditions, function () {
                if (this.Item == code) {
                    condition = this;
                    return false;
                }
            });
            return condition;
        }

        //模板的根内容
        var baseCode1 = '<li class="dd-item dd3-item"><div class="dd-handle dd3-handle"></div>';
        var baseCode2 = '<button class="close form-control" style="display: none;">&times;</button></div></li>';
        var relationCode = '<div class="dd3-content form-inline">' +
            '<select class="form-control input-sm">' +
            '<option value="' + search_relation_dic.AND.name + '" selected>' + search_relation_dic.AND.desc + '</option>' +
            '<option value="' + search_relation_dic.OR.name + '">' + search_relation_dic.OR.desc + '</option>' +
            '</select>' +
            '<div class="dropdown">' +
            '<a data-toggle="dropdown">' +
            '<span class="fa fa-plus-square"></span>' +
            '</a>' +
            '<ul class="dropdown-menu"></ul>' +
            '</div>';

        //加载模板所有condition
        function load_template_conditions(category_config, conditions) {
            var diy = $("#nestable_diy");
            diy.append("<ol class='dd-list'>" +
            baseCode1 +
            '<div class="dd3-content form-inline">' +
            '<select class="form-control input-sm">' +
            get_relation_content(conditions[0].operation) +
            '</select>' +
            '<div class="dropdown">' +
            '<a data-toggle="dropdown">' +
            '<span class="fa fa-plus-square"></span>' +
            '</a>' +
            '<ul class="dropdown-menu"></ul>' +
            '</div>' +
            '</div>' +
            baseCode2 +
            '</ol>'); //根作特殊处理
            console.log(JSON.stringify(conditions, null, 2));
            for (var i = 1; i < conditions.length; i++) {
                var parent_row = diy.find(".dd3-content").eq(Number(conditions[i].parent_seq) + 1);
                if (parent_row.next().hasClass("dd-list")) { //如果已存在ol 直接追加li
                    parent_row.next().append(baseCode1 + get_one_condition_content(category_config, conditions[i]) + baseCode3 + '</div>');
                } else {
                    parent_row.after("<ol class='dd-list'>" + baseCode1 + get_one_condition_content(category_config, conditions[i]) + baseCode3 + '</div></ol>');
                    parent_row.parent().prepend(collaspeCode);
                }
                var this_row = $("#nestable_diy .dd3-content:last");
                if (conditions[i].type == "item") {
                    var r = conditions[i].context.split(",");


                    if (conditions[i].is_edit == "1") {
                        this_row.children(".input-group").find("input").each(function () {
                            $(this).attr("enabled", "yes");
                        });
                        this_row.children(".checkbox-custom").find("input").attr("checked", true);
                    }
                    else {
                        this_row.children(".input-group").find("input").each(function () {
                            $(this).attr("enabled", "no");
                            $(this).attr("disabled", true);
                        });

                        this_row.find(".dropdown-multi-select").attr("disabled", "disabled");

                    }

                    var control = this_row.find(".dropdown-multi-select");
                    if (control.length > 0) {
                        control.multiselect({
                            buttonClass: 'multiselect dropdown-toggle btn-sm btn-default bg-white disabled',
                            buttonWidth: '100px',
                            selectAllText: i18n.t("datasearch.searchtemplate.dropdown-multi-select-param.select-all-text"),
                            nonSelectedText: i18n.t("datasearch.searchtemplate.dropdown-multi-select-param.non-selected-text"),
                            nSelectedText: i18n.t("datasearch.searchtemplate.dropdown-multi-select-param.selected-text"),
                            allSelectedText: i18n.t("datasearch.searchtemplate.dropdown-multi-select-param.all-selected-text"),
                            numberDisplayed: 3,
                            maxHeight: 200,
                            templates: {
                                ul: '<ul style="width: 100%;" class="multiselect-container dropdown-menu"></ul>',
                                button: '<button style="display:inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> <b class="caret"></b></button>',

                            }
                        });

                        control.multiselect('select', r);
                    }
                    else {
                        if(this_row.children(".input-group").find("input").length == 1){
                            this_row.children(".input-group").find("input").val(conditions[i].context);
                        }
                        else{
                            for (var j = 0; j < r.length; j++) {
                                this_row.children(".input-group").find("input").eq(j).val(r[j]);
                            }
                        }
                    }

                    init_datetimepick();

                    this_row.children("select").each(function () {
                        $(this).attr("enabled", "no");
                        $(this).attr("disabled", true);
                        $(this).css("appearance", "none");
                        $(this).addClass("noArrow");
                    });
                    this_row.children(".checkbox-custom").each(function () {
                        $(this).hide();
                    });
                }

            }

            //改成只读状态
            $("#protocolSelect,#templateName").each(function () {
                $(this).attr("disabled", true);
            });
            /*$("#nestable_diy button.close,#nestable_diy .checkbox-custom,#nestable_diy .dropdown,#nestable_diy button[data-action]").each(function () {
             $(this).hide();
             });*/


        }

//点击确定增加
        var baseCode3 = '<button class="close form-control">&times;</button></div></li>';
        var collaspeCode = '<button data-action="collapse" type="button">Collapse</button><button data-action="expand" type="button" style="display: none;">Expand</button>';//展开/收起按钮
        var num = 0; //可编辑checkboxID增长
        function add_condition_content(obj) {
            var conditionCode = '';//条件模板初始化内容
            var addType = $(obj).attr("addType");
            var addCode = '';
            var category_config = category_config_dic[$("#protocolSelect").val()];
            if (addType == "0") {
                addCode = relationCode;
            } else if (addType == "1") {
                num++;
                //协议配置内容
                var category_config_of_condition = get_condition_by_item(category_config, "");
                conditionCode = '<div class="dd3-content form-inline diy">' +
                '<select class="form-control input-sm tpl-item config">' + get_category_config_content(category_config, "") + '</select>' +
                '<select class="form-control input-sm tpl-opt">' + get_operation_of_condition(category_config_of_condition.ValueType, "") + '</select>' +
                '<div class="input-group">' + get_search_control(category_config_of_condition) + '</div>';

                addCode = conditionCode + '<span class="checkbox-custom">' +
                '<input type="checkbox" id="checkbox_' + num + '"><label for="checkbox_' + num + '">' +
                    i18n.t("datasearch.searchtemplate.label.can-edit") + '</label> </span>';
            }
            var dd3 = $(obj).parents(".dd3-content");
            if (dd3.next().hasClass("dd-list")) { //如果下面已经有了列表
                dd3.next().append(baseCode1 + addCode + baseCode3);
            } else {
                dd3.after('<ol class="dd-list">' + baseCode1 + addCode + baseCode3 + '</ol>');
                dd3.parent().prepend(collaspeCode);
            }
        }

//创建模板
        function create_template() {
            input_elements = [];
            input_index = 0;
            select_one_template("");
            init_load_template(i18n.t("datasearch.searchtemplate.aside.create-template"), true);
            $("#protocolSelect").html(load_category_list("")); //加载协议列表、协议的配置
        }

        function endWith(str, char) {
            if (str == null || str.length == 0 || char == null || char.length == 0 || char.length > str.length) {
                return false;
            }

            if (str.substring(str.length - char.length) == char) {
                return true;
            }
            else {
                return false;
            }
        }

        function startWith(str, char) {
            if (str == null || str.length == 0 || char == null || char.length == 0 || char.length > str.length) {
                return false;
            }

            if (str.substring(0, char.length) == char) {
                return true;
            }
            else {
                return false;
            }
        }

        function is_noneSplitCondition(line) {
            if (startWith(line, '"') && endWith(line, '"')) {
                return true;
            }
            else {
                return false;
            }
        }

//遍历模板内容
        var detail = "";
        function table_diy_value(ele) {
            var template_data = {
                search_condition: [],
                audit_datas: []
            };
            if (ele.next().hasClass("dd-list")) {
                for (var i = 0; i < ele.next().children("li").length; i++) {
                    var dd3 = ele.next().children("li").eq(i).children(".dd3-content");
                    var obj = {};
                    if (dd3.hasClass("diy")) {
                        var item_ctrl = dd3.children("select.tpl-item");
                        var display = item_ctrl.find("option:selected").text();
                        var input_content = "";

                        var inputGroup = dd3.children("div.input-group");
                        var multiselect_control = inputGroup.find(".search-condition-multiselect");
                        if (multiselect_control.length > 0) {
                            obj.value = "";
                            if (multiselect_control.val()) {
                                obj.value = multiselect_control.val().toString();

                                multiselect_control.find("option:selected").each(function(){
                                    if(input_content == ""){
                                        input_content = $(this).text();
                                    }
                                    else{
                                        input_content += ',' + $(this).text();
                                    }
                                });
                            }
                            obj.operation = dd3.children("select").eq(1).val();
                        }
                        else {
                            var firstInput = inputGroup.find("input:first").val().trim();
                            var lastInput = inputGroup.find("input:last").val().trim();
                            if (inputGroup.find("input").length > 1) {
                                if (firstInput == "" && lastInput != "") {
                                    if (inputGroup.find(".search-input-ip").length > 0) {
                                        obj.operation = search_operation_dic.EQ.name;
                                    }
                                    else {
                                        obj.operation = search_operation_dic.LE.name;
                                    }
                                    obj.value = lastInput;
                                } else if (lastInput == "" && firstInput != "") {
                                    if (inputGroup.find(".search-input-ip").length > 0) {
                                        obj.operation = search_operation_dic.EQ.name;
                                    }
                                    else {
                                        obj.operation = search_operation_dic.GE.name;
                                    }
                                    obj.value = firstInput;
                                } else if (firstInput != "" && lastInput != "") {
                                    obj.operation = dd3.children("select").eq(1).val();
                                    obj.value = firstInput + "," + lastInput;
                                }
                            } else {
                                obj.value = firstInput;
                                obj.operation = dd3.children("select").eq(1).val();
                            }

                            input_content = obj.value;
                        }

                        obj.type = 'item';
                        obj.code = dd3.children("select:eq(0)").val();

                        if (inputGroup.find(".search-input-text").length > 0 && obj.operation == search_operation_dic.EQ.name){
                            if(isfulltext == "True"){
                                var obj_value_list = obj.value.split(' ');
                                if(obj_value_list.length > 1){
                                    obj.value = obj_value_list;
                                }
                            }

                            obj = get_one_condition_value(obj.code, obj.value, obj.operation);
                        }

                        /*if (obj.code == "KEYWORD") {
                            var condition_item = obj.code;
                            var condition_value = obj.value;
                            obj = {
                                type: 'relation',
                                operation: search_relation_dic.AND.name,
                                items: []
                            };

                            if (is_noneSplitCondition(condition_value)) {
                                obj.items.push({
                                    type: 'item',
                                    code: condition_item,
                                    operation: search_operation_dic.SPLITMATCH.name,
                                    value: condition_value
                                });
                            }
                            else {
                                var condition_value_list = condition_value.split(' ');
                                $.each(condition_value_list, function (i) {
                                    if (condition_value_list[i] == "") {
                                        return true;
                                    }
                                    var and_relation_item = {
                                        type: 'item',
                                        code: condition_item,
                                        operation: search_operation_dic.EQ.name,
                                        value: condition_value_list[i]
                                    };
                                    obj.items.push(and_relation_item);
                                });
                            }

                        }*/
                        /*if (dd3.children("span.checkbox-custom").find("input").is(":checked")) {
                            obj.isedit = 1;
                        } else {
                            obj.isedit = 0;
                        }*/
                    } else {
                        obj.type = 'relation';
                        obj.operation = dd3.children("select").val();
                    }
                    var sub_items = table_diy_value(dd3);
                    var items = sub_items.search_condition;
                    template_data.audit_datas = template_data.audit_datas.concat(sub_items.audit_datas);
                    if (items.length != 0) {
                        obj.items = items;
                    }
                    if ((obj.value && obj.type == "item") || (items.length > 0 && obj.type == "relation") || (obj.items && obj.items.length > 0 && obj.type == "relation")) {
                        if(obj.type == "item"){
                            detail += display + ":" + input_content + ";";
                            template_data.audit_datas.push({
                                Type: "KEYWORD",
                                Content: obj.value
                            })
                        }
                        template_data.search_condition.push(obj);
                    }

                }
            }
            return template_data;
        }

        function isArray(object) {
            return object && typeof object === 'object' && Array == object.constructor;
        }

        function get_one_condition_value(condition_item, condition_value, operation){
            var one_condition_value;
            if(isArray(condition_value)){
                one_condition_value = {
                    type: 'relation',
                    operation: search_relation_dic.AND.name,
                    items: []
                };
                $.each(condition_value, function(j){
                    if(condition_value[j] == ""){
                        return true;
                    }

                    one_condition_value.items.push({
                        type: 'item',
                        code: condition_item,
                        operation: operation,
                        value: condition_value[j]
                    });
                });
            }
            else{
                one_condition_value = {
                    type: 'item',
                    code: condition_item,
                    operation: operation,
                    value: condition_value
                };
            }

            return one_condition_value;
        }

        function get_search_condition(condition_items) {
            var all_condition_relation = {
                type: 'relation',
                operation: search_relation_dic.AND.name,
                items: [condition_items]
            };

            return all_condition_relation;
        }

//查询提交
        function search_btn_submit() {

            var zkqy = search_range.getZkqy();
            if (zkqy.length == 0) {
                Notify.show({
                    title: i18n.t("datasearch.searchtemplate.notify-title.choose-datacenter"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            detail = "";
            var template_datas = table_diy_value($("#nestable_diy .dd3-content:first"));
            var condition_list = template_datas.search_condition;
            var audit_datas = template_datas.audit_datas;
            if (condition_list.length == 0) {
                Notify.show({
                    title: i18n.t("datasearch.searchtemplate.notify-title.input-condition"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            var search_condition = get_search_condition(condition_list[0]);
            console.log(JSON.stringify(search_condition, null, 2));
            if (search_condition.items.length == 0) {
                Notify.show({
                    title: i18n.t("datasearch.searchtemplate.notify-title.input-condition"),
                    text: "",
                    type: "warning"
                });

                return;
            }

            var startTime = search_range.get_start_time();
            var endTime = search_range.get_end_time();
            search_condition.items.push(
                {
                    "type": "item",
                    "code": "CAP_TIME",
                    "title": i18n.t("datasearch.searchtemplate.param-str.cap-time") + ":",
                    "operation": search_operation_dic.BTW.name,
                    "value": [
                        startTime,
                        endTime
                    ]
                });
            var spytime = {Begin:startTime,End:endTime};

            var category = $("#protocolSelect").val();
            var category_name = category_protocols_dic[category].desc;
            var protocols = category_protocols_dic[category].protocols;
            //var task_name = i18n.t("datasearch.template-search") + ":" + category_name;
            var task_name = category_name + ": " + detail + " "
                + i18n.t("datasearch.searchtemplate.param-str.cap-time") + ":" + startTime + "," + endTime + ";";
            if (task_name.length > 50) {
                task_name = task_name.substring(0, 50) + "...";
            }
            var task_detail = category_name + ": " + detail + " "
                + i18n.t("datasearch.searchtemplate.param-str.cap-time") + ":" + startTime + "," + endTime + ";";
            var dscp_len = 500;
            if(task_detail.length > dscp_len){
                task_detail = task_detail.substring(0, dscp_len) + "...";
            }

            var isfulltext = (category_all_config_dic[category].FullText == "True")? "True":"False";

            var submit_params = {
                zkqy: zkqy,
                search_condition: search_condition,
                audit_datas: audit_datas,
                protocols: protocols,
                task_name: task_name,
                search_result_maxnum: search_range.get_search_result_maxnum(),
                detail: task_detail,
                isfulltext: isfulltext,
                spytime: spytime
            };

            submit_params.open_window = true;
            Service.template_submit_task(submit_params, function(task_id){
                //window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_params.task_name));

            });
        }

//选择一个模板
        function select_one_template(template_id) {
            $("#templateList ul li a").each(function () {
                var template_item = $(this);
                if (template_item.attr("tid") == template_id) {
                    template_item.addClass("item-active");
                }
                else {
                    template_item.removeClass("item-active");
                }
            });
        }

//获取模板格式
        function get_template_from_page() {
            var obj = {};
            obj.name = $("#templateName").val();
            obj.description = '';
            obj.protocol = $("#protocolSelect").val();

            if (obj.name == undefined || obj.name == "") {
                Notify.show({
                    title: i18n.t("datasearch.searchtemplate.notify-title.input-template-name"),
                    text: "",
                    type: "warning"
                });
                return;
            }


            if (!search_validation.valid("#search_template_form")) {
                Notify.show({
                    title: i18n.t("datasearch.searchtemplate.notify-title.input-wrong"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            var conditions = [];
            var indexNum = 0;
            $("#nestable_diy div.dd3-content").each(function () {
                var o = {};
                o.seq = indexNum;
                var pSeq = $(this).parents("ol.dd-list:first").prev().index("div.dd3-content");
                if (pSeq < 0) {
                    o.parent_seq = 0
                } else {
                    o.parent_seq = pSeq;
                }
                if ($(this).hasClass("diy")) {
                    o.type = "item";
                    o.code = $(this).children("select:first").val();
                    var inp = $(this).children(".input-group").find("input");
                    var inp_code = '';
                    if (inp.length > 0) {
                        inp_code = inp.eq(0).val();
                        for (var i = 1; i < inp.length; i++) {
                            inp_code += ',' + inp.eq(i).val();
                        }
                    }
                    inp = $(this).children(".input-group").find(".search-condition-multiselect");
                    if (inp.length > 0) {
                        if (inp.val()) {
                            inp_code = inp.val().toString();
                        }
                        else {
                            inp_code = "";
                        }
                    }
                    o.context = inp_code;
                    if ($(this).children(".checkbox-custom").find("input").is(":checked")) {
                        o.is_edit = "1";
                    } else {
                        o.is_edit = "0";
                    }
                } else {
                    o.type = "condition";
                    o.code = '';
                    o.context = '';
                    o.is_edit = '1';
                }
                o.operation = $(this).children("select:last").val();
                indexNum++;
                conditions.push(o);
            });
            obj.conditions = conditions;
            return obj;
        }

        function set_default_datetimepick_by_language(current_language)
        {
            var defaultStartDate = new Date();
            defaultStartDate.setHours(0);
            defaultStartDate.setMinutes(0);
            defaultStartDate.setSeconds(0);

            var defaultEndDate = new Date();
            defaultEndDate.setHours(23);
            defaultEndDate.setMinutes(59);
            defaultEndDate.setSeconds(59);

            $('.search-input-date.search-condition-textrange-from').datetimepicker(
                {
                    format: 'YYYY-MM-DD HH:mm:ss',
                    defaultDate: defaultStartDate,
                    //immediateUpdate: true,
                    locale: current_language,
                    minDate: '1999-01-01 00:00:00'
                }
            );
            $('.search-input-date.search-condition-textrange-to').datetimepicker(
                {
                    format: 'YYYY-MM-DD HH:mm:ss',
                    defaultDate: defaultEndDate,
                    //immediateUpdate: true,
                    locale: current_language,
                    minDate: '1999-01-01 00:00:00'
                }
            );
        }

        function set_default_datetimepick(){
            $.ajax({
                url: '/datasearch/get_current_language',
                type: 'POST',
                async: false,
                data: {},
                dataType: 'json',
                success: function (current_language) {
                    set_default_datetimepick_by_language(current_language);
                }
            });
        }

        function init_datetimepick(){
            $('.search-input-date.search-condition-textrange-from').each(function(){
                var time_str = $(this).val();
                $(this).val("");

                $(this).datetimepicker({
                    format: 'YYYY-MM-DD HH:mm:ss',
                    //immediateUpdate: true,
                    defaultDate: time_str,
                    locale: current_language,
                    minDate: '1999-01-01 00:00:00'
                });

            });

            $('.search-input-date.search-condition-textrange-to').each(function(){
                var time_str = $(this).val();
                $(this).val("");

                $(this).datetimepicker({
                    format: 'YYYY-MM-DD HH:mm:ss',
                    //immediateUpdate: true,
                    defaultDate: time_str,
                    locale: current_language,
                    minDate: '1999-01-01 00:00:00'
                });
            });

        }

// 事件响应 ########################################################################

//读取模板
        $("#templateList ul").delegate("li a", "click", function (e) {
            e.preventDefault();
            showLoader();
            input_elements = [];
            input_index = 0;
            var tid = $(this).attr("tid");
            var name = $(this).text();
            var protocol = $(this).attr("category");
            select_one_template(tid);
            var template = {
                id: tid,
                name: name,
                protocol: protocol
            };
            console.log(JSON.stringify(template, null, 2));
            Template_service.get_template_condition(template, load_template_content);
        });

//创建模板
        $("#creat_template").on("click", function () {
            showLoader();
            create_template();
        });

// 增加一项
        $(document).delegate("#nestable_diy .dropdown>a", "click", function () {
            var depth = $(this).parents("ol.dd-list:first").index("ol.dd-list") + 1;
            if (depth <= 2) {
                $(this).next().html('<li><a href="#" addType="0">' +
                    i18n.t("datasearch.searchtemplate.template-bar.relation") + '</a></li><li><a href="#" addType="1">' +
                    i18n.t("datasearch.searchtemplate.template-bar.condition") + '</a></li>');
            } else {
                $(this).next().html('<li><a href="#" addType="1">' +
                    i18n.t("datasearch.searchtemplate.template-bar.condition") + '</a></li>');
            }
            $("#nestable_diy .dd3-content .dropdown li a").on("click", function (e) {
                e.preventDefault();
                add_condition_content(this);
                $(this).parents(".dropdown").removeClass("open");
                search_validation.add_template_rules(input_elements);
            });
        });

// 删除一项
        $(document).delegate("#nestable_diy .dd3-content button.close", "click", function () {
            var p = $(this).parents("ol.dd-list:first");
            if (p.children("li").length == 1) {//如果当前同级只有一个li 连同ol全删
                p.prevAll("button").remove();
                p.remove();
            } else {
                $(this).parents("li:first").remove(); //如果当前同级有其他li 只删本身
            }
            if ($("#nestable_diy ol.dd-list:first").children("li").length == 1) {
                $("#nestable_diy div.dd3-content:first button.close").hide();
            }
        });

//变更协议
        var preProtocolIndex = 0; //之前选择的协议序号
        $(document).delegate("#protocolSelect", "change", function () {
            if ($("#nestable_diy ol.dd-list").length != 1) {
                var changeVal = $(this).val();
                $("#protocolSelect").val($("#protocolSelect").find("option:eq(" + preProtocolIndex + ")").val());
                Dialog.build({
                    title: i18n.t("datasearch.searchtemplate.dialog-title.prompt"),
                    content: i18n.t("datasearch.searchtemplate.dialog-title.change-template"),
                    rightBtnCallback: function (e) {
                        e.preventDefault();
                        input_elements = [];
                        input_index = 0;
                        $("#protocolSelect").html(load_category_list(changeVal));
                        preProtocolIndex = $(protocolSelect).find("option:selected").index();

                        isfulltext = category_all_config_dic[$("#protocolSelect").val()].FullText;
                        $.magnificPopup.close();
                    }
                }).show();
            } else {
                $("#protocolSelect").html(load_category_list($(this).val()));
                preProtocolIndex = $(this).find("option:selected").index();

                isfulltext = category_all_config_dic[$("#protocolSelect").val()].FullText;
            }
        });


//变更协议配置自动更改后续表单及输入
        $(document).delegate("#nestable_diy select.config", "change", function () {
            var category_config = category_config_dic[$("#protocolSelect").val()];
            var optionVal = $(this).val();
            var category_config_of_condition = get_condition_by_item(category_config, optionVal);
            $(this).next().html(get_operation_of_condition(category_config_of_condition.ValueType, ""));
            $(this).nextAll(".input-group").html(get_search_control(category_config_of_condition));
            $(this).parent().find('.dropdown-multi-select').multiselect({
                buttonClass: 'multiselect dropdown-toggle btn-sm btn-default bg-white',
                buttonWidth: '100px',
                selectAllText: i18n.t("datasearch.searchtemplate.dropdown-multi-select-param.select-all-text"),
                nonSelectedText: i18n.t("datasearch.searchtemplate.dropdown-multi-select-param.non-selected-text"),
                nSelectedText: i18n.t("datasearch.searchtemplate.dropdown-multi-select-param.selected-text"),
                allSelectedText: i18n.t("datasearch.searchtemplate.dropdown-multi-select-param.all-selected-text"),
                numberDisplayed: 3,
                maxHeight: 200,
                templates: {
                    ul: '<ul style="width: 100%;" class="multiselect-container dropdown-menu"></ul>',
                    button: '<button style="display:inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> <b class="caret"></b></button>',

                }
            });

            set_default_datetimepick();

            search_validation.add_template_rules(input_elements);
        });

//保存模板
        $(document).delegate("#saveTemplate", "click", function (e) {
            e.preventDefault();

            if ($("#nestable_diy ol.dd-list").length != 1) {
                var template = get_template_from_page();
                console.log(JSON.stringify(template, null, 2));
                if (template) {
                    Template_service.add_template(template, function(template_obj){
                        load_template_content(template_obj);
                        Template_service.get_template_list(function (template_list) {
                            load_template_list(template_list);
                            select_one_template(template_obj.id);
                        });
                    });
                }
            } else {
                Notify.show({
                    title: i18n.t("datasearch.searchtemplate.notify-title.template-is-empty"),
                    text: "",
                    type: "warning"
                });
            }
        });

//更新模板
        $(document).delegate("#updateTemplate", "click", function (e) {
            e.preventDefault();

            if ($("#nestable_diy ol.dd-list").length != 1) {
                var template = get_template_from_page();
                if (template) {
                    template.id = $("#templateName").attr("tid");
                    Template_service.update_template(template, load_template_content);
                }

            } else {
                Notify.show({
                    title: i18n.t("datasearch.searchtemplate.notify-title.template-is-empty"),
                    text: "",
                    type: "warning"
                });
            }
        });

//另存模板
        $(document).delegate("#saveAsTemplate", "click", function (e) {
            e.preventDefault();
            var tid = $("#templateName").attr("tid");
            var form_group_param = {
                label: i18n.t("datasearch.searchtemplate.label.template-name") + ':',
                labelwidth: 2,
                content: '<input type="text" id="newTemplateName" class="form-control">',
                contentwidth: 9
            };
            var new_template_content = '<form class="form-horizontal" role="form">' +
                form_group_tpl(form_group_param) +
                '</form>';
            Dialog.build({
                title: i18n.t("datasearch.searchtemplate.dialog-title.template-save-as"),
                content: new_template_content,
                minHeight: 10,
                rightBtnCallback: function (e) {
                    e.preventDefault();

                    var template_name = $("#newTemplateName").val();
                    if (template_name == undefined || template_name == "") {
                        Notify.show({
                            title: i18n.t("datasearch.searchtemplate.notify-title.input-template-name"),
                            text: "",
                            type: "warning"
                        });
                        return;
                    }

                    var template = get_template_from_page();
                    if (template) {
                        template.name = template_name;
                        Template_service.add_template(template, function(template_obj){
                            load_template_content(template_obj);
                            Template_service.get_template_list(function (template_list) {
                                load_template_list(template_list);
                                select_one_template(template_id);
                            });
                        });

                        $.magnificPopup.close();
                    }

                }
            }).show();
        });

//编辑模板
        $(document).delegate("#editTemplate", "click", function (e) {
            e.preventDefault();
            UINestable.init();
            //改成可写状态
            $("#nestable_diy input,#nestable_diy select,#protocolSelect,#templateName").each(function () {
                $(this).removeAttr("disabled");
            });
            $("#nestable_diy button.close,#nestable_diy .checkbox-custom,#nestable_diy .dropdown").each(function () {
                $(this).show();
            });
            $(".tray-center .panel-footer").html('<button class="btn btn-primary btn-md" id="saveTemplate">' +
                i18n.t("datasearch.searchtemplate.button.save") + '</button><button class="btn btn-default btn-md" id="resetTemplate">' +
                i18n.t("datasearch.searchtemplate.button.clear-template") + '</button><button class="btn btn-primary btn-md" id="searchTemplate">' +
                i18n.t("datasearch.searchtemplate.button.search") + '</button>');
            $(".tray-center").removeClass("noHand");
        });

//删除模板
        $(document).delegate("#deleteTemplate", "click", function (e) {
            e.preventDefault();
            var tid = $("#templateName").attr("tid");

            bootbox.confirm(i18n.t("datasearch.searchtemplate.bootbox-msg.is-del"), function (rlt) {
                if (rlt) {
                    Template_service.delete_template([tid], function () {
                        Template_service.get_template_list(load_template_list);
                    });
                }
            });
        });

//清空模板
        $(document).delegate("#resetTemplate", "click", function (e) {
            e.preventDefault();
            if ($("#nestable_diy ol.dd-list").length != 1) {
                Dialog.build({
                    title: i18n.t("datasearch.searchtemplate.dialog-title.prompt"),
                    content: i18n.t("datasearch.searchtemplate.dialog-title.is-clear-template"),
                    rightBtnCallback: function (e) {
                        e.preventDefault();
                        $("#protocolSelect").html(load_protocols_list($("#protocolSelect").val()));
                        $.magnificPopup.close();
                    }
                }).show();
            } else {
                $("#protocolSelect").html(load_protocols_list($("#protocolSelect").val()));
            }
        });

//模板查询
        $(document).delegate("#searchTemplate", "click", function (e) {
            e.preventDefault();
            if (!search_validation.valid("#search_template_form")) {
                Notify.show({
                    title: i18n.t("datasearch.searchtemplate.notify-title.input-wrong"),
                    text: "",
                    type: "warning"
                });
                return;
            }
            search_btn_submit();
        });

//初始化 #################################################

//UINestable js
        var UINestable = function () {
            var updateOuload_search_rangetput = function (e) {
                var list = e.length ? e : $(e.target),
                    output = list.data('output');
                if (window.JSON) {
                    output.val(window.JSON.stringify(list.nestable('serialize')));
                } else {
                    output.val('JSON browser support required for this demo.');
                }
            };

            return {
                init: function () {
                    $('#nestable_diy').nestable();
                }
            };
        }();

        var init = function () {

            search_validation.init_valide("#search_template_form");

            $('#form-list3').height($(window).height() - 367.5);
            //初始化 current_language
            Template_service.get_language(function(language){
                current_language = language;
                //初始化 config_data.xml 配置
                Template_service.get_category_protocol(function (result) {
                    dataTypes = result;
                    init_category_protocols_dic(dataTypes);
                    //初始化 template_operation.xml 配置
                    Template_service.get_template_operation_config(function (result) {
                        operation_dic = result;
                        //初始化 search下所有xml
                        Template_service.init_category_config_dic(function (search_config_dic) {
                            for (var key in search_config_dic) {
                                category_config_dic[key] = search_config_dic[key].Template.Condition;
                                category_all_config_dic[key] = search_config_dic[key];
                            }

                            //初始化 已有模板列表
                            Template_service.get_template_list(function (template_list) {
                                load_template_list(template_list);
                                create_template();

                                $(document).delegate("input", "keypress", function (e) {
                                    if(e.keyCode == 13){
                                        e.preventDefault();
                                    }
                                });

                                hideLoader();

                            });
                        });
                    });
                });
            });

        }();


    })
;





















