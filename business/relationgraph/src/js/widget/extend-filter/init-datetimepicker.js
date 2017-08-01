define("widget/init-datetimepicker", [
    "moment",
    "moment-locale",
    "jquery",
    "utility/daterange/daterangepicker"
], function(moment) {
    var companyStartDate, companyEndDate;
    var companyFrequency = 1;

    function init() {
        //选择时间范围
        moment().locale('zh-cn');
        companyStartDate = moment().subtract(1, 'year');
        companyEndDate = moment();
        var dateFormat = 'YYYY/MM/DD';
        var rangeOptions = {
            showDropdowns: true,
            ranges: {
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
            startDate: companyStartDate,
            endDate: companyEndDate
        };
        $('#frequency-input').val(companyFrequency);
        $('#date-range-input').val(companyStartDate.format(dateFormat) + "-" + companyEndDate.format(dateFormat));
        companyStartDate = companyStartDate.format("YYYY-MM-DD");
        companyEndDate = companyEndDate.format("YYYY-MM-DD");
        $('#date-range').daterangepicker(
            rangeOptions,
            function(start, end) {
                companyStartDate = start.format("YYYY-MM-DD");
                companyEndDate = end.format("YYYY-MM-DD");
                $('#date-range-input').val(start.format(dateFormat) + "-" + end.format(dateFormat));
            }
        );
    }


    return {
        init: init
    };
});
