define("./tpl-sq-datetimepicker", [
    "moment",
    "moment-locale",
    "jquery",
    "utility/daterange/daterangepicker",
    'utility/jquery/jqmaskedinput',
    'utility/bootstrap/bootstrap-maxlength'
], function(moment) {

    var companyStartDate, companyEndDate;
    var companyFrequency = 1;
    var customMaskConstructor = function(val){
        if(!val){
            return '';
        }else{
            return '';
        }
    };
    var maskOptions = {
        translation:{
        },

    };

    function initDatetime(container) {
        $('#' + container).attr('placeholder', 'YYYY/MM/DD hh:mm:ss-YYYY/MM/DD hh:mm:ss')
        // $('#' + container).mask("9999/99/99 99:99:99-9999/99/99 99:99:99",maskOptions);
        $('#' + container).mask("9999/99/99 99:99:99-9999/99/99 99:99:99");
        $('input[maxlength]').maxlength({
            threshold: 39,
            placement: "right"
        });
        moment().locale('zh-cn');
        companyStartDate = moment();
        companyEndDate = moment();
        var dateFormat = 'YYYY/MM/DD HH:mm:ss';
        var rangeOptions = {
            showDropdowns: false,
            ranges: {
                '今天': [moment().startOf('days'), moment()],
                '昨天': [moment().subtract(1, 'days').startOf('days'), moment().subtract(1, 'days').endOf('days')],
                '过去一周': [moment().subtract(6, 'days'), moment()],
                '过去一个月': [moment().subtract(29, 'days'), moment()],
                '当月': [moment().startOf('month'), moment().endOf('month')],
                '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                '过去一年': [moment().subtract(1, 'year'), moment()]
            },
            locale: {
                applyLabel: '确定',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                customRangeLabel: '自定义'
            },
            format: dateFormat,
     /*       startDate: companyStartDate,
            endDate: companyEndDate,*/
            showWeekNumbers: false,
            timePicker: false,
            timePickerSeconds: false,
            timePickerIncrement: 1,
            timePicker12Hour: false,
            //EDIT BY huangjingwei
            autoUpdateInput:false

        };
        companyStartDate = companyStartDate.format(dateFormat);
        companyEndDate = companyEndDate.format(dateFormat);

     //   $('#' + container).val(companyStartDate + '-' + companyEndDate);

        /* EDIT BY huangjingwei BEGIN */
        $('#' + container + '_picker').daterangepicker(
            rangeOptions,
            function(start, end, input) {
                // companyStartDate = start.format("YYYY-MM-DD HH:mm:ss");
                // companyEndDate = end.format("YYYY-MM-DD HH:mm:ss");
                // $('#' + container).val(start.format(dateFormat) + ' - ' + end.format(dateFormat));
            }
        );
        $('#' + container + '_picker').on('apply.daterangepicker',function(ev,picker){
            $('#' + container).val(picker.startDate.format(dateFormat) + ' - ' + picker.endDate.format(dateFormat));
        });
        
        $('#' + container + '_picker').on('cancel.daterangepicker',function(ev,picker){
            $('#' + container).val('');
        });
        /* EDIT BY huangjingwei END */

        $('.range_inputs').hide();
        $('.ranges ul li:last').remove();
        //EDIT BY huangjingwei
        // $('.ranges ul li.active').removeClass('active');
        

    }

    function initDate(container) {
        $('#' + container).attr('placeholder', 'YYYY/MM/DD-YYYY/MM/DD');
        // $('#' + container).mask("9999/99/99-9999/99/99",maskOptions);
        $('#' + container).mask("9999/99/99-9999/99/99");
        $('input[maxlength]').maxlength({
            threshold: 21,
            placement: "right"
        });

        moment().locale('zh-cn');
        companyStartDate = moment();
        companyEndDate = moment();
        var dateFormat = 'YYYY/MM/DD';
        var rangeOptions = {
            showDropdowns: true,
            ranges: {
                '今天': [moment(), moment()],
                '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '过去一周': [moment().subtract(6, 'days'), moment()],
                '过去一个月': [moment().subtract(29, 'days'), moment()],
                '当月': [moment().startOf('month'), moment().endOf('month')],
                '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                '过去一年': [moment().subtract(1, 'year'), moment()]
            },
            locale: {
                applyLabel: '确定',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                customRangeLabel: '自定义'
            },
            format: dateFormat,
           // startDate: companyStartDate,
           // endDate: companyEndDate,
            showWeekNumbers: false,
            timePicker: false,
            timePickerSeconds: false,
            timePickerIncrement: 1,
            timePicker12Hour: false,
            //EDIT BY huangjingwei
            autoUpdateInput:false
        };
        companyStartDate = companyStartDate.format(dateFormat);
        companyEndDate = companyEndDate.format(dateFormat);

        //EDIT BY huangjingwei
        

       // $('#' + container).val(companyStartDate + '-' + companyEndDate);

       /* EDIT BY huangjingwei BEGIN */
        $('#' + container + '_picker').daterangepicker(
            rangeOptions,
            function(start, end, input) {
                // companyStartDate = start.format("YYYY-MM-DD");
                // companyEndDate = end.format("YYYY-MM-DD");
                // $('#' + container).val(start.format(dateFormat) + ' - ' + end.format(dateFormat));
            }
        );
        $('#' + container + '_picker').on('apply.daterangepicker',function(ev,picker){
            $('#' + container).val(picker.startDate.format(dateFormat) + ' - ' + picker.endDate.format(dateFormat));
        });
        
        $('#' + container + '_picker').on('cancel.daterangepicker',function(ev,picker){
            $('#' + container).val('');
        });
        /* EDIT BY huangjingwei END */

        $('.range_inputs').hide();
        $('.ranges ul li:last').remove();



    }

    function initSingleDate(container) {
        $('#' + container).attr('placeholder', 'YYYY/MM/DD');
        // $('#' + container).mask("9999/99/99",maskOptions);
        $('#' + container).mask("9999/99/99");
        // $('input[maxlength]').maxlength({
        //     threshold: 21,
        //     placement: "right"
        // });

        moment().locale('zh-cn');
        companyStartDate = moment();
        companyEndDate = moment();
        var dateFormat = 'YYYY/MM/DD';
        var rangeOptions = {
            showDropdowns: true,
            ranges: {
                '今天': [moment()],
                '昨天': [moment().subtract(1, 'days')],
                '一周前': [moment().subtract(6, 'days')],
                '一月前': [moment().subtract(29, 'days')],
                '一年前': [moment().subtract(1, 'year')]
            },
            locale: {
                applyLabel: '确定',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                customRangeLabel: '自定义'
            },
            format: dateFormat,
            // startDate: companyStartDate,
            // endDate: companyEndDate,
            showWeekNumbers: false,
            timePicker: false,
            timePickerSeconds: false,
            timePickerIncrement: 1,
            timePicker12Hour: false,
            //EDIT BY huangjingwei
            autoUpdateInput:false
        };
        companyStartDate = companyStartDate.format(dateFormat);
        companyEndDate = companyEndDate.format(dateFormat);

        //EDIT BY huangjingwei


        // $('#' + container).val(companyStartDate + '-' + companyEndDate);

        /* EDIT BY huangjingwei BEGIN */
        //$('#' + container + '_picker').daterangepicker(
        //    rangeOptions,
        //    function(start, end, input) {
        //        // companyStartDate = start.format("YYYY-MM-DD");
        //        // companyEndDate = end.format("YYYY-MM-DD");
        //        // $('#' + container).val(start.format(dateFormat) + ' - ' + end.format(dateFormat));
        //    }
        //);
        $('#' + container + '_picker').on('apply.daterangepicker',function(ev,picker){
            $('#' + container).val(picker.startDate.format(dateFormat));
        });

        $('#' + container + '_picker').on('cancel.daterangepicker',function(ev,picker){
            $('#' + container).val('');
        });
        /* EDIT BY huangjingwei END */

        $('.range_inputs').hide();
        $('.ranges ul li:last').remove();
    }

    function initSingleDatetime(container) {
        $('#' + container).attr('placeholder', 'YYYY/MM/DD hh:mm:ss')
        // $('#' + container).mask("9999/99/99 99:99:99",maskOptions);
        $('#' + container).mask("9999/99/99 99:99:99");
        // $('input[maxlength]').maxlength({
        //     threshold: 39,
        //     placement: "right"
        // });
        moment().locale('zh-cn');
        companyStartDate = moment();
        companyEndDate = moment();
        var dateFormat = 'YYYY/MM/DD HH:mm:ss';
        var rangeOptions = {
            showDropdowns: false,
            ranges: {
                '今天': [moment().startOf('days'), moment()],
                '昨天': [moment().subtract(1, 'days').startOf('days'), moment().subtract(1, 'days').endOf('days')],
                '过去一周': [moment().subtract(6, 'days'), moment()],
                '过去一个月': [moment().subtract(29, 'days'), moment()],
                '当月': [moment().startOf('month'), moment().endOf('month')],
                '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                '过去一年': [moment().subtract(1, 'year'), moment()]
            },
            locale: {
                applyLabel: '确定',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                customRangeLabel: '自定义'
            },
            format: dateFormat,
            /*       startDate: companyStartDate,
             endDate: companyEndDate,*/
            showWeekNumbers: false,
            timePicker: false,
            timePickerSeconds: false,
            timePickerIncrement: 1,
            timePicker12Hour: false,
            //EDIT BY huangjingwei
            autoUpdateInput:false

        };
        companyStartDate = companyStartDate.format(dateFormat);
        companyEndDate = companyEndDate.format(dateFormat);

        //   $('#' + container).val(companyStartDate + '-' + companyEndDate);

        /* EDIT BY huangjingwei BEGIN */
        //$('#' + container + '_picker').daterangepicker(
        //    rangeOptions,
        //    function(start, end, input) {
        //        // companyStartDate = start.format("YYYY-MM-DD HH:mm:ss");
        //        // companyEndDate = end.format("YYYY-MM-DD HH:mm:ss");
        //        // $('#' + container).val(start.format(dateFormat) + ' - ' + end.format(dateFormat));
        //    }
        //);
        $('#' + container + '_picker').on('apply.daterangepicker',function(ev,picker){
            $('#' + container).val(picker.startDate.format(dateFormat) + ' - ' + picker.endDate.format(dateFormat));
        });

        $('#' + container + '_picker').on('cancel.daterangepicker',function(ev,picker){
            $('#' + container).val('');
        });
        /* EDIT BY huangjingwei END */

        $('.range_inputs').hide();
        $('.ranges ul li:last').remove();
        //EDIT BY huangjingwei
        // $('.ranges ul li.active').removeClass('active');


    }

    return {
        initDatetime: initDatetime,
        initDate: initDate,
        initSingleDate: initSingleDate,
        initSingleDatetime: initSingleDatetime
    };
});