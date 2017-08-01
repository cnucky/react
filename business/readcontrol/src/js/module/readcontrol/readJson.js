define(
    [
        'underscore',
        'utility/spin/spin.min'

    ], function (_,Spinner) {

        //业务方法++++++++++++++++++++++++++++++++++++++++++++++

        //加载loading
        var spinOpts_read = {
            lines: 10, // 花瓣数目
            length: 7, // 花瓣长度
            width: 3, // 花瓣宽度
            radius: 4, // 花瓣距中心半径
            corners: 1, // 花瓣圆滑度 (0-1)
            rotate: 0, // 花瓣旋转角度
            direction: 1, // 花瓣旋转方向 1: 顺时针, -1: 逆时针
            color: '#5882FA', // 花瓣颜色
            speed: 1, // 花瓣旋转速度
            trail: 60, // 花瓣旋转时的拖影(百分比)
            shadow: false, // 花瓣是否显示阴影
            hwaccel: false, //spinner 是否启用硬件加速及高速旋转
            className: 'spinner', // spinner css 样式名称
            zIndex: 2e9, // spinner的z轴 (默认是2000000000)
            top: '50%', // spinner 相对父容器Top定位 单位 px
            left: '50%'// spinner 相对父容器Left定位 单位 px
        };
        var loadingRecall = new Spinner(spinOpts_read);

        //公共的ajax方法
        function commonFn(url, param, sucFn) {
            var layerWin;
            var str = obj2str(param);
            $.ajax({
                type: 'get',
                url: url,
                data: param,
                beforeSend: function () {
                    loadingRecall.spin($("#wrapBox").get(0));
                },
                dataType: "json",
                success: function (data) {
                    loadingRecall.spin();
                    if (sucFn && isFunction(sucFn)) sucFn(data);
                }
            });
        }

        function commonJsonFn(url, param, sucFn) {
            var files = JSON.stringify(param);
            $.ajax({
                url: url,
                type: "POST",
                data: {data: files},
                beforeSend: function () {
                    loadingRecall.spin($("#wrapBox").get(0));
                },
                success: function (data) {
                    loadingRecall.spin();
                    if (sucFn && isFunction(sucFn)) sucFn(data);
                }
            });
        }

        function obj2str(obj) {
            var str = "";
            var num = 0;
            for (var i in obj) {
                if (num > 0) str += "&"; str += i + "=" + obj[i]; num++;
            }
            return str;
        }

        function isFunction(fnName) {
            var isFunction = false;
            try {
                isFunction = typeof(eval(fnName)) == "function";
            } catch (e) {
            }
            return isFunction;
        }

        //加载json内容
        function load_json_cont(fileUrl, params,fun) {
            commonJsonFn(fileUrl, params, function (data) {
                fun(fileUrl,data);
            });
        }
        return {
            load_json_cont: load_json_cont
        }
    });
