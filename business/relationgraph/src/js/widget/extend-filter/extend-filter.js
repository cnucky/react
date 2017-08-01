define('widget/extend-filter', [
    './extend-filter.html',
    './init-datetimepicker',
    'nova-notify',
    'jquery',
    'underscore',
    'utility/jquery/jqmaskedinput',
    'utility/bootstrap/bootstrap-maxlength'
], function(Filter, Datetimepicker, Notify) {

    function extendFilter(filter, callback) {

        if (filter != 0) {

            $(".toolbox").addClass("toolbox-open");
            $(".toolbox li#extend-filter").removeClass("hide").find('a').click();
            $("#toolbox-extend-filter").removeClass("hide");

            // toolbox 解绑 click()
            $('.toolbox .panel-heading').unbind('click');

            $("#toolbox-extend-filter").empty();
            $('#toolbox-extend-filter').append(Filter);

            $("#frequency-input").on('input', function(e) {
                var frequency = $("#frequency-input").val();
                if (frequency < 0) {
                    $("#frequency-input").val("0");
                }
            })

            if (filter == 3) {
                $(".filter-time").show();
                $(".filter-frequency").show();
                _daterangeInput();

            } else if (filter == 1) {
                $(".filter-time").show();
                $(".filter-frequency").hide();
                _daterangeInput();
            } else if (filter == 2) {
                $(".filter-time").hide();
                $(".filter-frequency").show();
            }

            $("#filter-btn").on("click", function(e) {
                var filterArray = {};

                if (filter == 3) {
                    _getFilter(function(data) {
                        filterArray = data;
                    });

                } else if (filter == 1) {
                    _getTime(function(data) {
                        filterArray = data;
                    })
                } else if (filter == 2) {
                    _getFrequency(function(data) {
                        filterArray = data;
                    })
                }

                callback(filterArray);

                _hide();
            })

            $("#cancel-btn").on("click", function(e) {
                _hide();
            });
            $('#frequency-input').val("1");
            
        } else {
            callback({});
        }
    }

    function _daterangeInput() {
        Datetimepicker.init();
        $(".custom").mask("9999/99/99-9999/99/99");
        $('input[maxlength]').maxlength({
            threshold: 21,
            placement: "right"
        });
    }

    function _getFilter(callback) {
        // 开始，结束
        var time = $('#date-range-input').val().split("-");
        var from = time[0].replace(/\//g, '-');
        var toTime = time[1].replace(/\//g, '-');
        // 等于 小于 大于 1 2 3
        var opr = $(".option-group input:radio:checked").attr("value");
        // 次数
        if (!_.isEmpty($("#frequency-input"))) {
            var frequency = $("#frequency-input").val();
        } else {
            Notify.show({
                title: "请输入筛选次数",
                type: "error"
            })
        }

        var filterArray = {};
        filterArray = {
            "time": {
                "from": from,
                "toTime": toTime
            },
            "count": {
                "opr": opr,
                "frequency": frequency
            }


        };
        callback(filterArray);
    }

    function _getTime(callback) {
        // 开始，结束
        var time = $('#date-range-input').val().split("-");
        var from = time[0].replace(/\//g, '-');
        var toTime = time[1].replace(/\//g, '-');

        var filterArray
        filterArray = {
            "time": {
                "from": from,
                "toTime": toTime
            }
        };
        callback(filterArray);
    }

    function _getFrequency(callback) {
        // 等于 小于 大于 1 2 3
        var opr = $(".option-group input:radio:checked").attr("value");
        // 次数
        if (!_.isEmpty($("#frequency-input"))) {
            var frequency = $("#frequency-input").val();
        } else {
            Notify.show({
                title: "请输入筛选次数",
                type: "error"
            })
        }


        var filterArray;
        filterArray = {
            "count": {
                "opr": opr,
                "frequency": frequency
            }
        };
        callback(filterArray);
    }

    function _hide() {
        $(".toolbox").removeClass("toolbox-open").addClass("toolbox");

        setTimeout(_delayHide, 600);
    }

    function _delayHide() {
        // active 重新设置回去
        $(".toolbox li#extend-filter").addClass("hide");
        $("#toolbox-extend-filter").addClass("hide");

        $(".toolbox li:eq(1) a").click();

        // toolbox 重新绑定 click() 回去
        $('.toolbox .panel-heading').on('click', function() {
            var curToolBox = $(this).parent('.toolbox');
            curToolBox.toggleClass('toolbox-open');
        });
    }


    return {
        extendFilter: extendFilter
    };
});