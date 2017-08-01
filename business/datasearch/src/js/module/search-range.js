/**
 * Created by root on 16-4-1.
 */
registerLocales(require.context('../../locales/datasearch/', false, /\.js/));
define('../module/datasearch/search-range',
    [
        '../tpl/tpl-search-range',
        'underscore',
        './datacenter-range.js',
        './time-range.js'
    ],
    function (
        tpl_search_range,
        _,
        datacenter_ran,
        time_ran) {

        var search_range_tpl = _.template(tpl_search_range);

        function create_search_range(opt, callback) {

            var search_range_param = {
                datacenter_list:datacenter_ran.get_datacenter_html(opt),
                time_range:time_ran.get_time_range(opt)
            };

            opt.container.append(search_range_tpl(search_range_param));

            time_ran.init_time();
            time_ran.localize();
            datacenter_ran.init_datacenter(null, callback);
        }


        function getZkqy() {
            return datacenter_ran.getZkqy();
        }

        function get_start_time() {
            return time_ran.get_start_time();
        }

        function get_end_time() {
            return time_ran.get_end_time();
        }

        function get_search_result_maxnum() {
            return datacenter_ran.get_search_result_maxnum();
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

        function init(opt, callback) {
            create_search_range(opt, callback);
        }


        return {
            init: init,
            get_start_time: get_start_time,
            get_end_time: get_end_time,
            getZkqy:getZkqy,
            get_search_result_maxnum:get_search_result_maxnum
        }

    }
)