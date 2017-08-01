/**
 * Created by root on 16-3-31.
 */
registerLocales(require.context('../../locales/datasearch/', false, /\.js/));
define('../module/protocol-checkbtn',
    [
        './search-operation-define',
        '../tpl/tpl-protocol-checkbtn',
        '../tpl/tpl-form-group',
        '../tpl/tpl-condition-group',
        '../tpl/tpl-search-text',
        '../tpl/tpl-search-textrange',
        '../tpl/tpl-search-datetimerange',
        '../tpl/tpl-search-dropdownmultiselect',
        '../tpl/tpl-search-tagmultiselect',
        '../tpl/tpl-search-usevpn',
        '../module/search-validation',
        'nova-notify',
        'utility/datepicker/bootstrap-datetimepicker',
        'utility/bootstrap/bootstrap-multiselect',
        'utility/select2/select2'
    ], function (search_operation_define,
                 protocol_checkbtn,
                 form_group,
                 condition_group,
                 search_text,
                 search_text_range,
                 search_datetime_range,
                 search_dropdown_multiselect,
                 search_tag_multiselect,
                 search_usevpn,
                 search_validation,
                 Notify) {
        var search_operation_dic = search_operation_define.get_search_operation_dic();
        var search_relation_dic = search_operation_define.get_search_relation_dic();
        var protocol_checkbtn_tpl = _.template(protocol_checkbtn);
        var form_group_tpl = _.template(form_group);
        var condition_group_tpl = _.template(condition_group);
        var search_text_tpl = _.template(search_text);
        var search_text_range_tpl = _.template(search_text_range);
        var search_datetime_range_tpl = _.template(search_datetime_range);
        var search_dropdown_multiselect_tpl = _.template(search_dropdown_multiselect);
        var search_tag_multiselect_tpl = _.template(search_tag_multiselect);
        var search_usevpn_tpl = _.template(search_usevpn);

        var category_all_config_dic = {};
        var current_language = "";
        var input_elements = [];
        var fulltextsearch = "False";

        function init_protocols(container, func) {
            $.ajax({
                url: '/datasearch/datasearch/get_datatypes',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        var protocols = rsp.data;
                        func(container, protocols);
                    }
                    else {

                    }
                }
            });
        }

        function create_protocols_checkboxs(container, protocols) {
            container.empty();

            var protocol_form_group_param = {
                label: i18n.t("datasearch.protocol-checkbtn.label.data-type") + ':',
                content: protocol_checkbtn_tpl({data: protocols}),
                labelwidth: 1,
                contentwidth: 11
            };

            container.append(form_group_tpl(protocol_form_group_param));

            if(protocols.length == 0) {
                Notify.show({
                    title: i18n.t("datasearch.protocol-checkbtn.message.no-data-type"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            var first_protocol = $('.protocol-check-btn:first');
            first_protocol.addClass('protocol-select');
            //first_protocol.attr('style', 'width:100px; font-weight:600; color: #3078D7 !important;');
            var first_protocol_name = first_protocol.attr('protocol_name');
            protocol_select_change(first_protocol_name, search_input_change);

            $('.protocol-check-btn').click(function () {
                $('.protocol-check-btn').each(function () {
                    $(this).removeClass('protocol-select');
                });
                $(this).addClass('protocol-select');

                var protocol_name = $(this).attr('protocol_name');

                protocol_select_change(protocol_name, search_input_change);

            })
        }

        function protocol_select_change(category_name, func) {
            /*$.ajax({
                url: '/datasearch/get_search_config',
                type: 'POST',
                async: true,
                data: {category_name: category_name},
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        var dis_config = rsp.data;
                        func(dis_config);
                    }
                    else {
                        $("#search-input").empty();
                    }
                }
            });*/

            func(category_all_config_dic[category_name]);
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

                    }
                }
            });
            return options;

        }

        function get_search_control_type(control) {
            var control_type = control.ControlType;
            var item_config = control.ItemConfig;
            control["Id"] = control.Item.replace(/,/g, "_");

            if (control_type == 'Text') {
                input_elements.push({
                    id: control["Id"],
                    name: control["Id"] + "_" + control["Rule"],
                    rule: control["Rule"]
                });
                return search_text_tpl({Control: control});
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
                return search_text_range_tpl({Control: control})
            }
            else if (control_type == 'DropDownMultiSelect') {
                var options = trans_dic[item_config];
                return search_dropdown_multiselect_tpl({Control: control, Data: options})
            }
            else if (control_type == 'TagMultiSelect') {
                var options = trans_dic[item_config];
                return search_tag_multiselect_tpl({Control: control, Data: options});
            }
            else if (control_type == 'UseVpn') {
                return search_usevpn_tpl({
                    Control: control,
                    UseVPN: i18n.t("datasearch.protocol-checkbtn.label.use-vpn")
                });
            }

            return "";
        }

        function search_input_change(dis_config) {
            var search_input = $("#search-input");
            search_input.empty();
            var condition_groups = dis_config.Combine.ConditionGroup;
            fulltextsearch = dis_config.FullText;
            var row_flag = 0;
            input_elements = [];

            var search_input_html = '';
            $.each(condition_groups, function () {
                var conditions = this.Condition;
                var condtion_html = '';
                $.each(conditions, function () {

                    var content = get_search_control_type(this);

                    var form_group_condition = '';
                    if (this.Seperate == 'True') {
                        var form_group_param = {
                            label: this.DisplayName + ':',
                            content: content,
                            labelwidth: 1,
                            contentwidth: 11
                        };
                        form_group_condition = form_group_tpl(form_group_param);
                        form_group_condition = '<div class="row"><div class="col-lg-12">' + form_group_condition + '</div></div>';
                        if (row_flag % 2 == 1) {
                            form_group_condition = '</div>' + form_group_condition;
                        }
                        row_flag = 0;
                    }
                    else {
                        var form_group_param = {
                            label: this.DisplayName + ':',
                            content: content,
                            labelwidth: 2,
                            contentwidth: 9
                        };
                        form_group_condition = form_group_tpl(form_group_param);
                        if (row_flag % 2 == 0) {
                            form_group_condition = '<div class="row"><div class="col-lg-6">' + form_group_condition + '</div>';
                        }
                        else {
                            form_group_condition = '<div class="col-lg-6">' + form_group_condition + '</div></div>';

                        }
                        row_flag++;
                    }
                    condtion_html += form_group_condition;
                });

                if (row_flag % 2 == 1) {
                    condtion_html += '</div>';
                }
                row_flag = 0;
                //condtion_html = '<div class="col-md-12">' + condtion_html + '</div>';

                var condition_group_param = {
                    GroupName: this.GroupName,
                    Content: condtion_html
                };

                search_input_html += condition_group_tpl(condition_group_param);

            });

            search_input_html = '<form id="search_sort_form" class="form-horizontal" role="form">' +
                search_input_html +
                '</form>';

            search_input.append(search_input_html);

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

            $('.search-input-date').val('');
            $('input.datetime-range-checkbox').change(function () {
                var checked = $(this).is(':checked');
                $(this).closest('.form-group').find('.search-input-date').each(function () {

                    if (checked) {
                        $(this).removeAttr('disabled');
                    }
                    else {
                        $(this).attr('disabled', 'disabled');
                    }

                });

            });


            $('.dropdown-multi-select').multiselect({
                buttonClass: 'multiselect dropdown-toggle btn btn-default bg-none',
                buttonWidth: '100%',
                selectAllText: i18n.t("datasearch.protocol-checkbtn.dropdown-multi-select-param.select-all-text"),
                nonSelectedText: i18n.t("datasearch.protocol-checkbtn.dropdown-multi-select-param.non-selected-text"),
                nSelectedText: i18n.t("datasearch.protocol-checkbtn.dropdown-multi-select-param.selected-text"),
                allSelectedText: i18n.t("datasearch.protocol-checkbtn.dropdown-multi-select-param.all-selected-text"),
                numberDisplayed: 3,
                maxHeight: 200,
                templates: {
                    ul: '<ul style="width: 100%;" class="multiselect-container dropdown-menu"></ul>',

                }
            });

            $(".tag-multi-select").select2({
                placeholder: i18n.t("datasearch.protocol-checkbtn.tag-multi-select-param.placeholder"),
                width: '100%',
                closeOnSelect: false,
            });

            search_validation.init_valide("#search_sort_form");


            search_validation.add_rules(input_elements);

        }

        var trans_dic = {};

        function get_all_translate(callback) {
            $.ajax({
                url: '/datasearch/datasearch/get_all_translate',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        trans_dic = rsp.data;
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                    else {

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

        function init_language(func){
            $.ajax({
                url: '/datasearch/datasearch/get_current_language',
                type: 'POST',
                async: false,
                data: {},
                dataType: 'json',
                success: function (language) {
                    if (typeof func === 'function') {
                        func(language);
                    }
                }
            });

        }

        function init(opt, callback) {
            init_language(function(language){
                current_language = language;
                get_all_translate(function () {
                    init_category_config_dic(function(search_config_dic){
                        category_all_config_dic = search_config_dic;
                        init_protocols(opt.container, function(container, protocols){
                            create_protocols_checkboxs(container, protocols);

                            if (typeof callback === 'function') {
                                callback();
                            }
                        });
                    });

                });
            });


        }

        function render() {

        }

        function test() {

        }

        function get_select_protocol() {
            var protocol_control = $("#protocol-group").find('a').filter('.protocol-select');
            if (protocol_control.length == 0) {
                return '';
            }
            else {
                var protocol_name = protocol_control.attr('protocol_name');
                return protocol_name;
            }
        }

        function get_select_protocol_value() {
            var item = {
                category_name: "",
                category: "",
                protocols: ""
            };
            var protocol_control = $("#protocol-group").find('a').filter('.protocol-select');
            if (protocol_control.length != 0) {
                item.category_name = protocol_control.text().trim();
                item.category = protocol_control.attr('protocol_name');
                item.protocols = protocol_control.attr('protocol_value');
            }

            return item;
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

        function isArray(object) {
            return object && typeof object === 'object' && Array == object.constructor;
        }

        function get_one_condition_value(condition_item, condition_value, operation){
            var one_condition_value;
            var audit_datas = [];

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
                    audit_datas.push({
                        Type: "KEYWORD",
                        Content: condition_value[j]
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
                audit_datas.push({
                    Type: "KEYWORD",
                    Content: condition_value
                });
            }

            return {
                condition_value: one_condition_value,
                audit_datas: audit_datas
            };
        }

        function get_relation_item(condition_item, condition_value, operation) {
            var relation_item = {};
            var audit_datas = [];

            /*if (condition_item == "KEYWORD") {
                relation_item = {
                    type: 'relation',
                    operation: search_relation_dic.AND.name,
                    items: []
                };

                if (is_noneSplitCondition(condition_value)) {
                    relation_item.items.push({
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
                            operation: search_operation_dic.SPLITMATCH.name,
                            value: condition_value_list[i]
                        };
                        relation_item.items.push(and_relation_item);
                    });
                }

                return relation_item;
            }*/

            var condition_item_list = condition_item.split(',');
            if (condition_item_list.length > 1) {
                relation_item = {
                    type: 'relation',
                    operation: search_relation_dic.OR.name,
                    items: []
                };

                $.each(condition_item_list, function (i) {
                    var search_datas = get_one_condition_value(condition_item_list[i], condition_value, operation);
                    var or_relation_item = search_datas.condition_value;
                    relation_item.items.push(or_relation_item);

                    if(i == 0){
                        audit_datas = audit_datas.concat(search_datas.audit_datas);

                    }
                });


            }
            else if (condition_item_list.length == 1) {
                var search_datas = get_one_condition_value(condition_item_list[0], condition_value, operation);
                relation_item = search_datas.condition_value;
                audit_datas = audit_datas.concat(search_datas.audit_datas);
            }

            return {
                relation_item: relation_item,
                audit_datas: audit_datas
            }
        }

        var isNumBtwError = false;
        var detail = "";

        function get_search_condition() {
            isNumBtwError = false;
            detail = "";

            var all_condition_relation = {
                type: 'relation',
                operation: search_relation_dic.AND.name,
                items: []
            };
            var audit_datas = [];

            $('.search-condition-text').each(function () {
                var condition_item = $(this).attr('condition_item');
                var display = $(this).attr('display');
                var condition_value = $(this).val().toString().trim();

                if (condition_value == null || condition_value == undefined || condition_value == '') {
                    return true;
                }

                if(fulltextsearch == "True"){
                    var condition_value_list = condition_value.split(' ');
                    if(condition_value_list.length > 1) {
                        condition_value = condition_value_list;
                    }
                }

                var search_datas = get_relation_item(condition_item, condition_value, search_operation_dic.EQ.name);
                var relation_item = search_datas.relation_item;
                audit_datas = audit_datas.concat(search_datas.audit_datas);

                detail += display + ":" + condition_value + ";";
                all_condition_relation.items.push(relation_item);
            });

            $('.search-condition-textrange').each(function () {
                var condition_item = $(this).attr('condition_item');
                var display = $(this).attr('display');
                var condition_from = $(this).find('.search-condition-textrange-from');
                var condition_from_value = condition_from.val().trim();

                var condition_to = $(this).find('.search-condition-textrange-to');
                var condition_to_value = condition_to.val().trim();

                /*if (condition_from.hasClass('search-input-date')) {
                 var checkbox = $(this).closest('.form-group').find('input.datetime-range-checkbox');
                 if (!checkbox.is(':checked')) {
                 return true;
                 }
                 }*/

                if ((condition_from_value == null || condition_from_value == undefined || condition_from_value == '') &&
                    (condition_to_value == null || condition_to_value == undefined || condition_to_value == '')) {
                    return true;
                }

                var condition_value = "";

                var search_datas = {};
                var relation_item = {};

                if (condition_from_value == null || condition_from_value == undefined || condition_from_value == '') {
                    condition_value = condition_to_value;

                    if ($(this).find(".search-input-ip").length > 0) {
                        search_datas = get_relation_item(condition_item, condition_value, search_operation_dic.EQ.name);
                        relation_item = search_datas.relation_item;
                        audit_datas = audit_datas.concat(search_datas.audit_datas);
                    }
                    else {
                        search_datas = get_relation_item(condition_item, condition_value, search_operation_dic.LE.name);
                        relation_item = search_datas.relation_item;
                        audit_datas = audit_datas.concat(search_datas.audit_datas);
                    }

                }
                else if (condition_to_value == null || condition_to_value == undefined || condition_to_value == '') {
                    condition_value = condition_from_value;

                    if ($(this).find(".search-input-ip").length > 0) {
                        search_datas = get_relation_item(condition_item, condition_value, search_operation_dic.EQ.name);
                        relation_item = search_datas.relation_item;
                        audit_datas = audit_datas.concat(search_datas.audit_datas);
                    }
                    else {
                        search_datas = get_relation_item(condition_item, condition_value, search_operation_dic.GE.name);
                        relation_item = search_datas.relation_item;
                        audit_datas = audit_datas.concat(search_datas.audit_datas);
                    }

                }
                else {
                    if (!(condition_from.hasClass('search-input-date') || condition_from.hasClass('search-input-ip'))) {
                        if (Number(condition_from_value) > Number(condition_to_value)) {
                            isNumBtwError = true;
                            return false;
                        }

                    }

                    condition_value = condition_from_value + ',' + condition_to_value;

                    search_datas = get_relation_item(condition_item, condition_value, search_operation_dic.BTW.name);
                    relation_item = search_datas.relation_item;
                    audit_datas = audit_datas.concat(search_datas.audit_datas);
                }

                detail += display + ":" + condition_value + ";";
                all_condition_relation.items.push(relation_item);

            });

            $('.search-condition-multiselect').each(function () {
                var condition_item = $(this).attr('condition_item');
                var display = $(this).attr('display');
                var select_value = $(this).val();

                if (select_value == null || select_value == undefined || select_value == '') {
                    return true;
                }

                if (this.length == select_value.length) {
                    return true;
                }

                var condition_value = select_value.toString();
                var search_datas = get_relation_item(condition_item, condition_value, search_operation_dic.IN.name);
                var relation_item = search_datas.relation_item;
                audit_datas = audit_datas.concat(search_datas.audit_datas);

                var select_text = "";
                $(this).find("option:selected").each(function () {
                    if (select_text == "") {
                        select_text = $(this).text();
                    }
                    else {
                        select_text += ',' + $(this).text();
                    }
                });
                detail += display + ":" + select_text + "; ";
                all_condition_relation.items.push(relation_item);

            });

            if ($("#vpn_check").is(':checked')) {
                var condition_item = $("#vpn_check").attr('condition_item');
                var display = $(this).attr('display');
                var condition_value = "1";

                var search_datas = get_relation_item(condition_item, condition_value, search_operation_dic.EQ.name);
                var relation_item = search_datas.relation_item;
                audit_datas = audit_datas.concat(search_datas.audit_datas);

                detail += display + ":" + condition_value + "; ";
                all_condition_relation.items.push(relation_item);
            }

            return {
                search_condition: all_condition_relation,
                audit_datas: audit_datas
            };
        }

        function isFullTextSearch() {
            if (fulltextsearch == "True") {
                return true;
            }
            else {
                return false;
            }
        }

        function isNumberBtwError() {
            return isNumBtwError;
        }

        function get_detail() {
            return detail;
        }

        //wangjun use ###################
        function get_search_condition_wangjun() {
            isNumBtwError = false;
            detail = "";

            var all_condition_relation = {
                type: 'relation',
                operation: search_relation_dic.AND.name,
                items: []
            };

            $('.search-condition-text').each(function () {
                var condition_item = $(this).attr('condition_item');
                var display = $(this).attr('display');
                var condition_value = $(this).val().toString().trim();

                if (condition_value == null || condition_value == undefined || condition_value == '') {
                    return true;
                }

                var condition_value_list = condition_value.split(' ');
                if(condition_value_list.length > 1) {
                    condition_value = condition_value_list;
                }

                var relation_item = get_relation_item_wangjun(condition_item, condition_value, search_operation_dic.EQ.name);

                detail += display + ":" + condition_value + "; ";

                if(relation_item.type == "relation" && relation_item.operation == search_relation_dic.AND.name){
                    $.each(relation_item.items, function(i) {
                        all_condition_relation.items.push(relation_item.items[i]);
                    });
                }
                else{
                    all_condition_relation.items.push(relation_item);
                }

            });

            $('.search-condition-textrange').each(function () {
                var condition_item = $(this).attr('condition_item');
                var display = $(this).attr('display');
                var condition_from = $(this).find('.search-condition-textrange-from');
                var condition_from_value = condition_from.val().trim();

                var condition_to = $(this).find('.search-condition-textrange-to');
                var condition_to_value = condition_to.val().trim();

                /*if (condition_from.hasClass('search-input-date')) {
                 var checkbox = $(this).closest('.form-group').find('input.datetime-range-checkbox');
                 if (!checkbox.is(':checked')) {
                 return true;
                 }
                 }*/

                if ((condition_from_value == null || condition_from_value == undefined || condition_from_value == '') &&
                    (condition_to_value == null || condition_to_value == undefined || condition_to_value == '')) {
                    return true;
                }

                var condition_value = "";

                var relation_item = {};

                if (condition_from_value == null || condition_from_value == undefined || condition_from_value == '') {
                    condition_value = condition_to_value;

                    if ($(this).find(".search-input-ip").length > 0) {
                        relation_item = get_relation_item_wangjun(condition_item, condition_value, search_operation_dic.EQ.name);
                    }
                    else {
                        relation_item = get_relation_item_wangjun(condition_item, condition_value, search_operation_dic.LE.name);
                    }

                }
                else if (condition_to_value == null || condition_to_value == undefined || condition_to_value == '') {
                    condition_value = condition_from_value;

                    if ($(this).find(".search-input-ip").length > 0) {
                        relation_item = get_relation_item_wangjun(condition_item, condition_value, search_operation_dic.EQ.name);
                    }
                    else {
                        relation_item = get_relation_item_wangjun(condition_item, condition_value, search_operation_dic.GE.name);
                    }

                }
                else {
                    if (!(condition_from.hasClass('search-input-date') || condition_from.hasClass('search-input-ip'))) {
                        if (Number(condition_from_value) > Number(condition_to_value)) {
                            isNumBtwError = true;
                            return false;
                        }

                    }

                    condition_value = condition_from_value + ',' + condition_to_value;

                    relation_item = get_relation_item_wangjun(condition_item, condition_value, search_operation_dic.BTW.name);
                }

                detail += display + ":" + condition_value + "; ";
                all_condition_relation.items.push(relation_item);

            });

            $('.search-condition-multiselect').each(function () {
                var condition_item = $(this).attr('condition_item');
                var display = $(this).attr('display');
                var select_value = $(this).val();

                if (select_value == null || select_value == undefined || select_value == '') {
                    return true;
                }

                if (this.length == select_value.length) {
                    return true;
                }

                var condition_value = select_value.toString();
                var relation_item = get_relation_item_wangjun(condition_item, condition_value, search_operation_dic.IN.name);

                var select_text = "";
                $(this).find("option:selected").each(function () {
                    if (select_text == "") {
                        select_text = $(this).text();
                    }
                    else {
                        select_text += ',' + $(this).text();
                    }
                });
                detail += display + ":" + select_text + "; ";
                all_condition_relation.items.push(relation_item);

            });

            if ($("#vpn_check").is(':checked')) {
                var condition_item = $("#vpn_check").attr('condition_item');
                var display = $(this).attr('display');
                var condition_value = "1";

                var relation_item = get_relation_item_wangjun(condition_item, condition_value, search_operation_dic.EQ.name);

                detail += display + ":" + condition_value + "; ";
                all_condition_relation.items.push(relation_item);
            }

            console.log(JSON.stringify(all_condition_relation, null, 2));

            return all_condition_relation;
        }

        function get_relation_item_wangjun(condition_item, condition_value, operation) {
            var relation_item = get_one_condition_value_wangjun(condition_item, condition_value, operation);

            return relation_item;
        }

        function get_one_condition_value_wangjun(condition_item, condition_value, operation){
            var one_condition_value;

            if(isArray(condition_value)){
                one_condition_value = {
                    type: 'relation',
                    operation: search_relation_dic.AND.name,
                    items: []
                };
                $.each(condition_value, function(j){
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

        //wangjun use end #################

        return {
            init: init,
            render: render,
            get_select_protocol: get_select_protocol,
            get_select_protocol_value: get_select_protocol_value,
            get_search_condition: get_search_condition,
            get_search_condition_wangjun: get_search_condition_wangjun,
            get_detail: get_detail,
            is_full_text_search: isFullTextSearch,
            is_num_btw_error: isNumberBtwError,
            test: test
        }

    });