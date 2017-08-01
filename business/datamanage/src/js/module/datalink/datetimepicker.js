define([
    "moment",
    "utility/datepicker/bootstrap-datetimepicker",
    "utility/daterange/daterangepicker",
], function(moment) {
    var companyStartDate, companyEndDate;

    function initDatetime(container) {

        moment().locale('zh-cn');
        companyStartDate = moment().subtract(29, 'days');
        companyEndDate = moment();
        var dateFormat = 'YYYY-MM-DD';
        var rangeOptions = {
            showDropdowns: true,
            ranges: {
                '今天': [moment(), moment()],
                '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '过去一周': [moment().subtract(6, 'days'), moment()],
                '过去一个月': [moment().subtract(29, 'days'), moment()],
                '当月': [moment().startOf('month'), moment().endOf('month')],
                '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            locale: {
                applyLabel: '确定',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                customRangeLabel: '自定义'
            },
            format: dateFormat,
            startDate: companyStartDate,
            endDate: companyEndDate,

            showWeekNumbers: true,
            timePicker: true,
            timePickerSeconds: true,
            timePickerIncrement: 1,
            timePicker12Hour: false
        };
        // $('#' + container).val(companyStartDate.format(dateFormat) + '-' + companyEndDate.format(dateFormat));
        companyStartDate = companyStartDate.format("YYYY-MM-DD HH:mm:ss");
        companyEndDate = companyEndDate.format("YYYY-MM-DD HH:mm:ss");
        $('#' + container+'_picker').daterangepicker(
            rangeOptions,
            function(start, end, input) {
                companyStartDate = start.format("YYYY-MM-DD HH:mm:ss");
                companyEndDate = end.format("YYYY-MM-DD HH:mm:ss");
                $('#' + container).val(start.format(dateFormat) + ' - ' + end.format(dateFormat));
            }
        );
    }

    function initDate(container) {
        moment().locale('zh-cn');
        companyStartDate = moment().subtract(29, 'days');
        companyEndDate = moment();
        var dateFormat = 'YYYY-MM-DD';
        var rangeOptions = {
            showDropdowns: true,
            ranges: {
                '今天': [moment(), moment()],
                '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '过去一周': [moment().subtract(6, 'days'), moment()],
                '过去一个月': [moment().subtract(29, 'days'), moment()],
                '当月': [moment().startOf('month'), moment().endOf('month')],
                '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            locale: {
                applyLabel: '确定',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                customRangeLabel: '自定义'
            },
            format: dateFormat,
            startDate: companyStartDate,
            endDate: companyEndDate
        };
        // $('#'+container).val(companyStartDate.format(dateFormat) + '-' + companyEndDate.format(dateFormat));
        companyStartDate = companyStartDate.format("YYYY-MM-DD");
        companyEndDate = companyEndDate.format("YYYY-MM-DD");
        $('#'+container+'_picker').datetimepicker(
            rangeOptions,
            function(start, end, input) {
                companyStartDate = start.format("YYYY-MM-DD");
                companyEndDate = end.format("YYYY-MM-DD");
                $('#'+container).val(start.format(dateFormat) + ' - ' + end.format(dateFormat));
            }
        );
    }

    return {
        initDatetime:initDatetime,
        initDate:initDate
    };

});