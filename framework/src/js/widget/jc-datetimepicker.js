define("widget/jc-datetimepicker", [
    "moment",
    "moment-locale",
    "jquery",
    "utility/daterange/daterangepicker"
], function(moment) {
    var startDate, endDate;

    function init(startday) {
        moment().locale('zh-cn');

        switch (startday) {
            case 'today':
                startDate = moment().startOf('day');
                break;
            case 'yestoday':
                startDate = moment().subtract(1, 'days');
                break;
            case 'lastweek':
                startDate = moment().subtract(6, 'days');
                break;
            case 'thismonth':
                startDate = moment().startOf('month');
                break;
            case 'lastmonth':
                startDate = moment().subtract(29, 'days');
                break;
            case 'lastyear':
                startDate = moment().subtract(1, 'year');
                break;
            default:
                startDate = moment().startOf('day');
        }
        endDate = moment();
        var dateFormat = 'YYYY/MM/DD';
        var rangeOptions = {
            showDropdowns: true,
            ranges: {
                '今天': [moment().startOf('day'), moment()],
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
            startDate: startDate,
            endDate: endDate
        };
        $('#date-range-input').val(startDate.format(dateFormat) + "-" + endDate.format(dateFormat));
        startDate = startDate.format("YYYY-MM-DD");
        endDate = endDate.format("YYYY-MM-DD");
        $('#date-range').daterangepicker(
            rangeOptions,
            function(start, end) {
                startDate = start.format("YYYY-MM-DD");
                endDate = end.format("YYYY-MM-DD");
                $('#date-range-input').val(start.format(dateFormat) + "-" + end.format(dateFormat));
            }
        );
    }


    return {
        init: init
    };
});
