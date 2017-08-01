/**
 * Created by root on 16-7-21.
 */
registerLocales(require.context('../../locales/datasearch/', false, /\.js/));
define('../module/datasearch/datacenter-range',
    [
        'nova-notify',
        '../tpl/tpl-form-group',
        '../tpl/tpl-datacenter-checkbox-list',
        'nova-utils',
        'underscore',
        'fancytree-all',
        'utility/jqwidgets4/jqxcore',
        'utility/jqwidgets4/jqxbuttons',
        'utility/jqwidgets4/jqxscrollbar',
        'utility/jqwidgets4/jqxpanel',
        'utility/jqwidgets4/jqxtree',
        'utility/jqwidgets4/jqxcheckbox'
    ],
    function (
        Notify,
        tpl_form_group,
        tpl_dc_checkbox_list,
        nova_utils,
        _) {


        var form_group_tpl = _.template(tpl_form_group);
        var dc_checkbox_list_tpl = _.template(tpl_dc_checkbox_list);

        //++++++++++++++++自定义变量+++++++++++++++++++
        var $maxNumArray=[50000,100000,1000000]; //返回最大记录数 数组
        var $datacenteID="datacenter_check_div";

        //++++++++++++++++业务方法+++++++++++++++++++

        //加载数据中心数据
        function load_dataCenter(maxReturnNum,datacenter_list) {
            if(datacenter_list.length == 0){
                Notify.show({
                    title: i18n.t("datasearch.datacenter-range.message.no-datacenter"),
                    text: "",
                    type: "warning"
                });
                return;
            }

            var code = '';
            for (var i = 0; i < datacenter_list.length; i++) {
                var di = datacenter_list[i];
                code += '<div class="dropdown checkbox-custom">' +
                    '<input type="checkbox" id="' + di.key + '">' +
                    '<label style="corlor:#666;font-weight:200" for="' + di.key + '" type=' + di.type + ' key="' + di.key + '" area-code="' + di.area_code + '">' + di.title + '</label>' +
                    '<button type="button" class="btn-link btn-datacenter">' +
                    '<span class="caret btn-datacenter text-muted"></span>' +
                    '</button>' +
                    '<div class="menu btn-datacenter">' +
                    '<ul>' +
                    load_datacenter_menu(di.children) +
                    '</ul>' +
                    '</div>' +
                    '</div>';
            }
            code+='<div class="dropdown radio-custom">' +
                '<button type="button" class="btn btn-sm btn-success" data-toggle="dropdown" data-i18n="datasearch.datacenter-range.return_numbers" >' +
                '<span class="caret"></span>' +
                '</button>' +
                '<div class="dropdown-menu">' +
                '<p data-i18n="datasearch.datacenter-range.max_numbers"></p>';

            for(var i=0;i<$maxNumArray.length;i++){
                code+='<input type="radio" id="maxnum_'+$maxNumArray[i]+'" name="maxnum" value="'+$maxNumArray[i];
                if($maxNumArray[i]==maxReturnNum) code+='" checked>'; else code+='">';
                code+='<label style="corlor:#666;font-weight:200" for="maxnum_'+$maxNumArray[i]+'">'+$maxNumArray[i]+'</label><br>';
            }
            code+='</div></div>';
            var $datacenter_check_div = $("#"+$datacenteID).html(code);



            $datacenter_check_div.find(".menu").jqxTree({
                height: '150px',
                hasThreeStates: true,
                checkboxes: true,
                width: '250px'
            }).find(".jqx-checkbox").css("margin-top", "4.5px");
            $datacenter_check_div.find("input:first").attr("checked", true);
            $datacenter_check_div.find(".menu:first").jqxTree('checkAll');

            bind_events();

            $("#" + $datacenteID + " [data-i18n]").localize();
        }

        //数据中心加载下拉列表
        function load_datacenter_menu(data) {
            var code = '';
            for (var i = 0; i < data.length; i++) {
                var di = data[i];
                if (di.children && di.children.length > 0) {
                    code += '<li item-expanded="true" title="' + di.title + '" key="' + di.key + '" system-key="' + di.system_key + '" type="' + di.type + '">' + di.title + '<ul>' + load_datacenter_menu(di.children) + '</ul></li>';
                } else {
                    code += '<li title="' + di.title + '" key="' + di.key + '" system-key="' + di.system_key + '" submit-point="' + di.submit_point + '" type="' + di.type + '">' + di.title + '</li>';
                }
            }
            return code;
        }


        //遍历下拉列表
        function traverse_menu(ul){
            var tempArray=[];
            for(var i=0;i<ul.children("li").length;i++){
                $li=$(ul.children("li")[i]);
                var spanClass=$li.children(".jqx-checkbox").find("span").attr("class");
                if(spanClass&&spanClass!=""){ //说明被选择
                    var obj = {
                        key: $li.attr("key"),
                        system_key: $li.attr("system-key"),
                        submit_point: $li.attr("submit-point"),
                        title: $li.attr("title"),
                        type: $li.attr("type")
                    };
                    if($li.children("ul").length>0) obj.children=traverse_menu($li.children("ul"));
                    tempArray.push(obj);
                }
            }
            return tempArray;
        }

        function bind_events()
        {
            //++++++++++++++++事件响应+++++++++++++++++++

            //点击三角按钮显示下拉菜单
            $("#datacenter_check_div .dropdown > button.btn-link").click(function (e) {
                $(this).next(".menu").toggle();
                $(this).parents(".dropdown").siblings().find(".menu").hide();
            });

            //在下拉菜单外点击鼠标关闭菜单
            $(document).click(function (e) {
                var $datacenter = $("#datacenter_check_div");
                if ($datacenter.find(".menu:visible").length > 0 && !$(e.target).hasClass("btn-datacenter") && !$(e.target).parents(".menu").hasClass("btn-datacenter"))  $datacenter.find(".menu:visible").hide();
            });
            $("#datacenter_check_div .menu").click(function (e) {
                e.stopPropagation();
            });
            $("#datacenter_check_div .dropdown:last > button").click(function (e) {
                $("#datacenter_check_div").find(".menu:visible").hide();
            });

            //数据中心下拉列表改变选择
            $(".menu .jqx-tree-item,#datacenter_check_div .jqx-fill-state-normal").click(function(){
                if($(this).hasClass("jqx-tree-item")){ //点击item时 绑定checkbox事件
                    var $checkedItem=$(this).parents(".menu").jqxTree('getCheckedItems');
                    var $thisID=$(this).parents("li:first").attr("id");
                    var flag=false;
                    for(var i=0;i<$checkedItem.length;i++){
                        if( $checkedItem[i].id==$thisID) flag=true;
                    }
                    $(this).parents(".menu").jqxTree('checkItem', $("#"+$thisID)[0], !flag);
                }

                var $dropdown = $(this).parents(".dropdown");
                var checkedNum = $dropdown.find(".menu").jqxTree('getCheckedItems').length; //已经选择的数目
                var uncheckedNum = $dropdown.find(".menu").jqxTree('getUncheckedItems').length; //没选择的数目
                var $checkbox = $dropdown.children("input");
                var $label = $dropdown.children("label");
                if (checkedNum == 0) { //没有选择
                    if ($checkbox.is(":checked")) $checkbox.removeAttr("checked");
                    $label.find("span").remove();
                } else { //有选择
                    if (uncheckedNum != 0) { //半选
                        $label.append('<span></span>');
                    } else {
                        if (!$checkbox.is(":checked"))$label.trigger("click");
                        $label.find("span").remove();
                        $(this).parents(".menu").show();
                    }
                }
            });

            //数据中心全选 全不选
            $("#datacenter_check_div .dropdown > label").click(function () {
                var menu = $(this).parents(".dropdown").find(".menu");
                if ($(this).prev("input").is(":checked")) {
                    menu.jqxTree('uncheckAll');
                    $(this).find("span").remove();
                } else {
                    menu.jqxTree('checkAll');
                    $(this).find("span").remove();
                }
            });

            //+++++++++++++++++++++++++++++++++++
        }
        $(document).ready(function(){
            nova_utils.dynamicLoadingCss("../css/jqwidgets4/jqx.base.css");
            nova_utils.dynamicLoadingCss("/datasearch/css/datacenter-checkbox-list.css");
        })

        function get_datacenter_html(opt)
        {
            var labelwidth = 1;
            var contentwidth = 11;

            if (opt.labelwidth != undefined) {
                labelwidth = opt.labelwidth;
            }
            if (opt.contentwidth != undefined) {
                contentwidth = opt.contentwidth;
            }

            var dc_form_group_param = {
                label: i18n.t("datasearch.datacenter-range.datacenter"),
                content: dc_checkbox_list_tpl(),
                labelwidth: labelwidth,
                contentwidth: contentwidth
            };

            // nova_utils.dynamicLoadingCss("../css/jqwidgets4/jqx.base.css");
            // nova_utils.dynamicLoadingCss("../css/datacenter-checkbox-list/datacenter-checkbox-list.css");

            return form_group_tpl(dc_form_group_param);
        }

        function init_datacenter(type, callback)
        {
            var param = {};
            if(type){
                param["type"] = type;
            }
            $.ajax({
                url: '/datasearch/datasearch/get_datacenters',
                type: 'POST',
                async: true,
                data: param,
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        var datacenter_list = rsp.data;
                        //加载数据中心数据
                        $.getJSON('/datasearch/datasearch/get_search_result_maxnum', {}, function (rsp) {
                            load_dataCenter(rsp,datacenter_list);

                            if(typeof callback === 'function'){
                                callback();
                            }
                        });
                    }
                    else {
                        return "";
                    }

                }
            });
        }

        function init(opt, type, callback){
            opt.container.append(get_datacenter_html(opt));

            init_datacenter(type, callback);
        }


        function getZkqy() {
            var $datacenterJSON=[];
            var $dropdown = $("#"+$datacenteID).children(".dropdown");
            for (var i = 0; i < $dropdown.length-1; i++) {
                var checkbox_i = $($dropdown[i]).children("input[type='checkbox']");
                var label_i = $($dropdown[i]).children("label");
                if (checkbox_i.is(":checked") || label_i.find("span").length > 0) {
                    var $ul=$($dropdown[i]).find(".jqx-tree-dropdown-root");
                    var obj = {
                        key: label_i.attr("key"),
                        title: label_i.text(),
                        area_code: label_i.attr("area-code"),
                        type: label_i.attr("type"),
                        children: traverse_menu($ul)
                    };
                    $datacenterJSON.push(obj);
                }
            }
            return $datacenterJSON;
        }


        function get_search_result_maxnum() {
            return $("#"+$datacenteID).find(".dropdown-menu input[type='radio']:checked").val();
        }

        Date.prototype.Format = function (fmt) { //author: meizz
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }

        return {
            init: init,
            get_datacenter_html:get_datacenter_html,
            init_datacenter: init_datacenter,
            getZkqy:getZkqy,
            get_search_result_maxnum:get_search_result_maxnum
        }

    }
)