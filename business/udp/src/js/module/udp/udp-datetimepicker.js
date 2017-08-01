define('udp/udp-datetimepicker', ['jquery', 'moment',"utility/daterange/daterangepicker"],
    function($, moment) {

        moment().locale('zh-cn');
        companyStartDate = moment().subtract(45, 'year');
        companyEndDate = moment().subtract(-10, 'year');
        var dateFormat = 'YYYY/MM/DD';
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
        
        $('#bussiness-date-range').daterangepicker(
            rangeOptions,
            function(start, end, input) {
                companyStartDate = start.format("YYYY-MM-DD");
                companyEndDate = end.format("YYYY-MM-DD");
                $('#bussiness-date-range-input').val(start.format(dateFormat) + ' - ' + end.format(dateFormat));
            }
        );
        $('#fileload-date-range').daterangepicker(
            rangeOptions,
            function(start, end, input) {
                companyStartDate = start.format("YYYY-MM-DD");
                companyEndDate = end.format("YYYY-MM-DD");
                $('#fileload-date-range-input').val(start.format(dateFormat) + ' - ' + end.format(dateFormat));
            }
        );

        function setDatetime(opts) {
            opts = opts || {};
            $('#bussiness-date-range-input').val(opts.bussiDateRange || (companyStartDate.format(dateFormat) + ' - ' + companyEndDate.format(dateFormat)));
            $('#fileload-date-range-input').val(opts.fileloadDateRange || (companyStartDate.format(dateFormat) + ' - ' + companyEndDate.format(dateFormat)));
        }

        function pick(opts) {

            if(opts == '近一天') {
                $('#bussiness-date-range-input').val(moment().subtract(1, 'days').format(dateFormat) + '-' + moment().format(dateFormat));
                $('#fileload-date-range-input').val(moment().subtract(1, 'days').format(dateFormat) + '-' + moment().format(dateFormat));
            }
            else if(opts == '近三天') {
                $('#bussiness-date-range-input').val(moment().subtract(3, 'days').format(dateFormat) + '-' + moment().format(dateFormat));
                $('#fileload-date-range-input').val(moment().subtract(3, 'days').format(dateFormat) + '-' + moment().format(dateFormat));
            }
            else if(opts == '近一周') {
                $('#bussiness-date-range-input').val(moment().subtract(7, 'days').format(dateFormat) + '-' + moment().format(dateFormat));
                $('#fileload-date-range-input').val(moment().subtract(7, 'days').format(dateFormat) + '-' + moment().format(dateFormat));
            }
            else if(opts == '近一月') {
                $('#bussiness-date-range-input').val(moment().subtract(1, 'month').format(dateFormat) + '-' + moment().format(dateFormat));
                $('#fileload-date-range-input').val(moment().subtract(1, 'month').format(dateFormat) + '-' + moment().format(dateFormat));
            }
            else if(opts == '近半年'){
                $('#bussiness-date-range-input').val(moment().subtract(6, 'month').format(dateFormat) + '-' + moment().format(dateFormat));
                $('#fileload-date-range-input').val(moment().subtract(6, 'month').format(dateFormat) + '-' + moment().format(dateFormat));
            }
            else if(opts == '近一年') {
                $('#bussiness-date-range-input').val(moment().subtract(1, 'year').format(dateFormat) + '-' + moment().format(dateFormat));
                $('#fileload-date-range-input').val(moment().subtract(1, 'year').format(dateFormat) + '-' + moment().format(dateFormat));
            }
        }

        return {
            setDatetime: setDatetime,
            pick: pick
        }

    });