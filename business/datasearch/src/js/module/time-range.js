/**
 * Created by root on 16-7-21.
 */
registerLocales(require.context('../../locales/datasearch/', false, /\.js/));
define('../module/datasearch/time-range',
    [
        '../tpl/tpl-form-group',
        '../tpl/tpl-time-range',
        'moment',
        'underscore',
        "moment-locale",
        'utility/datepicker/bootstrap-datetimepicker'
    ],
    function (tpl_form_group, tpl_time_range_select,moment, _) {
        var form_group_tpl = _.template(tpl_form_group);
        var time_range_tpl = _.template(tpl_time_range_select);

        var dateFormat1 = 'YYYY-MM-DD HH:mm:ss';
        var dateFormat2 = 'yyyy-MM-dd hh:mm:ss';
        //++++++++++++++++业务方法+++++++++++++++++++

        function init(opt){
            opt.container.append(get_time_range(opt));

            init_time();
        }

        function localize()
        {
            $(".radio-custom.form-inline [data-i18n]").localize();
        }

        function get_time_range(opt)
        {
            var labelwidth = 1;
            var contentwidth = 11;

            if (opt.labelwidth != undefined) {
                labelwidth = opt.labelwidth;
            }
            if (opt.contentwidth != undefined) {
                contentwidth = opt.contentwidth;
            }

            var time_form_group_param = {
                label: i18n.t("datasearch.time-range.select_time"),
                content: time_range_tpl({}),
                labelwidth: labelwidth,
                contentwidth: contentwidth
            };

            return form_group_tpl(time_form_group_param);
        }

        function init_time()
        {
            $.ajax({
                url: '/datasearch/datasearch/get_current_language',
                type: 'POST',
                async: false,
                data: {},
                dataType: 'json',
                success: function (current_language) {
                    init_time_by_language(current_language.toString());
                }
            });


        }

        function init_time_by_language(current_language)
        {
            var defaultStartDate = new Date();
            defaultStartDate.setHours(0);
            defaultStartDate.setMinutes(0);
            defaultStartDate.setSeconds(0);

            var defaultEndDate = new Date();
            defaultEndDate.setHours(23);
            defaultEndDate.setMinutes(59);
            defaultEndDate.setSeconds(59);


            $('#dtpick_from').datetimepicker({
                format: dateFormat1,
                defaultDate: defaultStartDate,
                locale:current_language,
                //immediateUpdate: true,
                minDate:'1999-01-01 00:00:00'});

            $('#dtpick_to').datetimepicker({
                format: dateFormat1,
                defaultDate: defaultEndDate,
                locale:current_language,
                //immediateUpdate: true,
                minDate:'1999-01-01 00:00:00'
            });


            /*$("#dtpick_from").blur(function(){
             if(!moment($(this).val(),dateFormat2).isValid()){
             $('#dtpick_from').val(defaultStartDate.Format(dateFormat2));
             $('#dtpick_from').datetimepicker().data('DateTimePicker').setValue(defaultStartDate);
             }
             });*/

            $("#dtpick_from").focus(function(){
                $("#custom").removeClass("btn-default");
                $("#custom").addClass("btn-primary");

                $("#custom").siblings().removeClass("btn-primary");
                $("#custom").siblings().addClass("btn-default");
            });

            /*$("#dtpick_to").blur(function(){
             if(!moment($(this).val(),dateFormat2).isValid()){
             $('#dtpick_to').val(defaultEndDate.Format(dateFormat2));
             $('#dtpick_to').datetimepicker().data('DateTimePicker').setDate(defaultEndDate);
             }
             });*/

            $("#dtpick_to").focus(function(){
                $("#custom").removeClass("btn-default");
                $("#custom").addClass("btn-primary");

                $("#custom").siblings().removeClass("btn-primary");
                $("#custom").siblings().addClass("btn-default");
            });

            $(".efoDatePicker").click(function (e) {
                $(this).removeClass("btn-default");
                $(this).addClass("btn-primary");

                $(this).siblings().removeClass("btn-primary");
                $(this).siblings().addClass("btn-default");

                if (this.id != "custom") {
                    /* $('#dtpick_from').attr("disabled","disabled");
                     $('#dtpick_to').attr("disabled","disabled");*/

                    var initStartTime = new Date();
                    initStartTime.setHours(0);
                    initStartTime.setMinutes(0);
                    initStartTime.setSeconds(0);

                    var initEndTime = new Date();
                    initEndTime.setHours(23);
                    initEndTime.setMinutes(59);
                    initEndTime.setSeconds(59);

                    switch (this.id) {
                        case "oneweek":
                            initStartTime.setDate(initStartTime.getDate() - 7);
                            break;
                        case "onemonth":
                            initStartTime.setMonth(initStartTime.getMonth() - 1);
                            break;
                        case "halfyear":
                            initStartTime.setMonth(initStartTime.getMonth() - 6);
                            break;
                        case "oneyear":
                            initStartTime.setYear(initStartTime.getFullYear() - 1);
                            break;
                        /*  case "custom":
                         initStartTime = new Date($("#dtpick_from").val() + ":00");
                         break;*/
                        default:
                            break;
                    }

                    $('#dtpick_from').val(initStartTime.Format(dateFormat2));
                    $('#dtpick_to').val(initEndTime.Format(dateFormat2));

                    $('#dtpick_from').datetimepicker().data('DateTimePicker').date(initStartTime.Format(dateFormat2));
                    $('#dtpick_to').datetimepicker().data('DateTimePicker').date(initEndTime.Format(dateFormat2));

                    $('#datetime_period').removeClass("hidden");
                }
                else {
                    /*$('#dtpick_from').removeAttr("disabled");
                     $('#dtpick_to').removeAttr("disabled");*/

                    $('#datetime_period').removeClass("hidden");
                }
            });

            $("#oneweek").trigger("click");
        }


        function get_start_time() {
            var startTime = new Date($("#dtpick_from").val());

            return startTime.Format(dateFormat2);
        }

        function get_end_time() {
            var endTime = new Date($("#dtpick_to").val());

            return endTime.Format(dateFormat2);
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
            get_time_range: get_time_range,
            init_time: init_time,
            get_start_time: get_start_time,
            get_end_time: get_end_time,
            localize:localize
        }

    }
)
