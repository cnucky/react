/**
 * Created by root on 16-9-28.
 */
define(
    [
        '../tpl/tpl-data-mining',
        'nova-notify',
        'nova-dialog',
        //'echarts',
        //'echarts/theme/macarons',
        //'echarts/map/js/china',
        'utility/datepicker/bootstrap-datetimepicker',
        //'echarts-2.2.7/lib/echarts',
        //'echarts-2.2.7/lib/config',
        //'echarts-2.2.7/lib/theme/macarons',
        //'echarts-2.2.7/lib/chart/bar',
        //'echarts-2.2.7/lib/chart/map'
    ], function (tpl_data_mining, Notify, Dialog
        //,ec
    ) {


        //初始化下钻树
        function init_downTree_menu(headerData) {
            var treeData=[];
            for(var i=0;i<headerData.length;i++){
                var col=headerData[i];
                var obj={};
                obj.name=col.headercaption;
                obj.key=col.columnName;
                treeData.push(obj);
            }
            $("#perspective").html(_.template(tpl_data_mining)({data:treeData}));

            var $downTreeContextMenu = $("#downTreeMenu").jqxMenu({
                width: '80px',
                height: '34x',
                autoOpenPopup: false,
                mode: 'popup'
            });
            $("#downTree li li").on('mousedown', function (event) {
                if ($(this).hasClass("down")) return;
                var rightClick = isRightClick(event);
                if (rightClick) {
                    $(this).addClass("active");
                    var scrollTop = $(window).scrollTop();
                    var scrollLeft = $(window).scrollLeft();
                    $downTreeContextMenu.jqxMenu('open', parseInt(event.clientX) + 5 + scrollLeft, parseInt(event.clientY) + 5 + scrollTop);
                    return false;
                }
            });

            $(document).on('contextmenu', function (e) {
                if ($(e.target).parents('#downTree').length > 0) {
                    return false;
                } else {
                    return true;
                }
            });

            function isRightClick(event) {
                var rightclick;
                if (!event) var event = window.event;
                if (event.which) rightclick = (event.which == 3);
                else if (event.button) rightclick = (event.button == 2);
                return rightclick;
            }


            //初始化日期选择
            var defaultStartDate = new Date();
            defaultStartDate.setHours(0);
            defaultStartDate.setMinutes(0);
            defaultStartDate.setSeconds(0);

            var defaultEndDate = new Date();
            defaultEndDate.setHours(23);
            defaultEndDate.setMinutes(59);
            defaultEndDate.setSeconds(59);
            $("#select_time_range input:first").datetimepicker({
                format: 'YYYY-MM-DD HH:mm:ss',
                    defaultDate: defaultStartDate,
                    immediateUpdate: true,
                    language: 'zh_cn',
                    minDate: '1999-01-01 00:00:00'
            });

            $("#select_time_range input:last").datetimepicker({
                format: 'YYYY-MM-DD HH:mm:ss',
                defaultDate: defaultStartDate,
                immediateUpdate: true,
                language: 'zh_cn',
                minDate: '1999-01-01 00:00:00'
            })

        }





        //**********************************事件响应********************************
        //下钻树的展开\收起
        $(document).on('click', '#downTree > ul > li i,#downTree > ul > li >h5', function () {
            $(this).parent().children("ul").fadeToggle();
            var $i = $(this).parent().children("i.glyphicon");
            if ($i.hasClass("glyphicon-triangle-bottom")) {
                $i.attr("class", "glyphicon glyphicon-triangle-right");
            } else {
                $i.attr("class", "glyphicon glyphicon-triangle-bottom");
            }
        });

        //下钻树的选中
        $(document).on('click', '#downTree li li', function () {
            $(this).toggleClass("active");
        });

        //树右键点击下钻
        var markNum = 0;
        $(document).on('itemclick', '#downTreeMenu', function (event) {
            switch ($(event.target).text()) {
                case "下钻":
                    var $downTree = $("#downTree");
                    var code = '';
                    $li_active = $downTree.children("ul").find("li.active");
                    for (var i = 0; i < $li_active.length; i++) {
                        code += '<p>' + $($li_active[i]).parents("li").children("h5").text() + '-' + $($li_active[i]).find("h5").text() + '</p>';
                        $($li_active[i]).parents("li").attr("mark", markNum).find("li[class!='active']").hide(); //将同列下的其他li隐藏
                    }
                    $li_active.attr("class", "down"); //下钻的li做标记
                    var triangle_left='<b class="triangle-left"></b>';
                    var triangle_right='<b class="triangle-right"></b>';
                    $("#downHistory").find(".ulBox ul").append('<li mark="' + markNum + '">'+triangle_left+'<div class="cont">' + code +'</div>' +
                        triangle_right+'</li>');
                    fnShowArrow();
                    markNum++;

                    init_charts();
            }
        });

        //箭头动作 移动ul
        $(document).on("click", "#downHistory span.glyphicons", function (e) {
            e.preventDefault();
            if ($(this).hasClass("ban")) return;
            var $downHty=$("#downHistory");
            var $ulBox = $downHty.find(".ulBox");
            var $ul = $ulBox.find("ul");
            var $moveDs = $ul.children("li:last").outerWidth(true);
            var $leftArrow = $downHty.find("span.pull-left");
            var $rightArrow = $downHty.find("span.pull-right");
            var $leftSpace = $ul.width() + parseInt($ul.css("left")) - $ulBox.width();
            var fstLiWidth=$ul.children("li:first").outerWidth(true);
            if ($(this).hasClass("pull-left")) { //左边箭头
                if (!$ul.is(":animated") && parseInt($ul.css("left")) < 0) {
                    if (-$leftSpace < $moveDs) {
                        $rightArrow.removeClass("ban");
                    }
                   if(-parseInt($ul.css("left"))==fstLiWidth){
                       $ul.animate({"left": '+=' + fstLiWidth}, "fast");
                       if(!$(this).hasClass("ban"))  $(this).addClass("ban");
                   }else{
                       $ul.animate({"left": '+=' + $moveDs}, "fast");
                   }

                }

            } else if($(this).hasClass("pull-right")) {
                if ($leftSpace <= $moveDs && !$(this).hasClass("ban")) {
                    $(this).addClass("ban");
                }
                if(parseInt($ul.css("left")) == 0){
                    $ul.animate({"left": '-=' + fstLiWidth}, "fast");
                }else{
                    $ul.animate({"left": '-=' + $moveDs}, "fast");
                }

                $leftArrow.removeClass("ban");
            }
        });

        //显示、隐藏记录详情
        $(document).on("mouseenter", "#downHistory li .cont", function () {
            var $li=$(this).parent();
            if ($li.offset().left + $li.width() > $(window).width()||$li.index()==0){
                return; //部分超出屏幕外的 和 第一个li不显示详情
            }
            var $left = $li.offset().left - $("#downHistory").offset().left;
            $("#downHistory > .info").show().css("left", $left + "px").attr("mark", $li.attr("mark"))
                .find(".cont").html($(this).html());
        });

        $(document).on("mouseleave", "#downHistory li .cont", function () {
            $("#downHistory > .info").hide();
        });

        $(document).on("mouseenter", "#downHistory > .info", function () {
            $("#downHistory > .info").show();
        })


        $(document).on("mouseleave", "#downHistory > .info", function () {
            $("#downHistory > .info").hide().removeAttr("mark").find(".cont").html('');
        });

        //删除记录
        $(document).on("click", "#downHistory .info", function () {
            var nextLi='';
            if($(this).hasClass("cont")){
                nextLi=$(this).parent().nextAll();
            }else{
                var $mark=$(this).attr("mark");
                nextLi =$("#downHistory li[mark="+$mark+"]").nextAll();
            }
            if(nextLi.length>0){
                Dialog.build({
                    title: "提示：",
                    content: "确定回退到当前记录吗？",
                    rightBtnCallback: function (e) {
                        e.preventDefault();
                        for(var i=0;i<nextLi.length;i++){
                            //恢复树
                            var $li = $("#downTree li[mark=" + $(nextLi[i]).attr("mark") + "]");
                            $li.find("li").show().removeClass("down");
                            $li.removeAttr("mark");
                            //删除记录
                            $(nextLi[i]).remove();
                            $.magnificPopup.close();
                            fnShowArrow();
                        }

                        init_charts();
                    }
                }).show();
            }
        });

        //**********************************业务方法********************************

        //显示/隐藏 左右移动箭头
        function fnShowArrow() {
            var $downHistory=$("#downHistory");
            var $box = $downHistory.find(".ulBox");
            var $ul = $box.find("ul");
            var $li = $ul.find("li");
            $ul.width($ul.find("li:last").outerWidth(true) * ($li.length-1)+$ul.find("li:first").outerWidth(true));
            var $leftArrow = $downHistory.find("span.pull-left");
            var $rightArrow = $downHistory.find("span.pull-right");
            var $boxWidth = $box.width();
            var $ulWidth = $ul.width();
            var $ulLeft = parseInt($ul.css("left"));

            if ($ulLeft == 0) {
                if(!$leftArrow.hasClass("ban"))$leftArrow.addClass("ban");
            } else if ($ulLeft < 0) {
                $leftArrow.removeClass("ban");
            }

            if ($ulWidth + $ulLeft <= $boxWidth) {
                if(!$rightArrow.hasClass("ban"))$rightArrow.addClass("ban");
            } else {
                $rightArrow.removeClass("ban");
            }
        }

        function get_axislabel(val, interval){
            var result_val = '';
            for(var i = 0; i < val.length; i += interval){
                var j = i + interval;
                result_val += val.substring(i, j) + '\n';
            }
            return result_val;
        }


        function randomData(max){
            return Math.round(Math.random()*max);
        }

        function moke_email(prename, num){
            var email_list = [];
            for (var i = 0; i < num; i++){
                email_list.push(prename + i + "@123.com");
            }

            return email_list;
        }

        function moke_data(num, max){
            var data_list = [];
            for (var i = 0; i < num; i++){
                data_list.push(randomData(max));
            }

            return data_list;
        }

        var email_num = 30;
        
        //function init_chart1(){
        //    var myChart = ec.init(document.getElementById('ec-sender'), 'macarons');
        //
        //    var option = {
        //        title: {
        //            x: 'center',
        //            text: '发件人统计',
        //            subtext: '话单数量'
        //        },
        //        tooltip: {
        //            trigger: 'item'
        //        },
        //        toolbox: {
        //            show: true,
        //            feature: {
        //                dataView: {show: true, readOnly: false},
        //                restore: {show: true},
        //                saveAsImage: {show: true}
        //            }
        //        },
        //        dataZoom : {
        //            show : true,
        //            realtime : true,
        //            orient: 'vertical',   // 'horizontal'
        //            x: 'right',
        //            //y: 'top',
        //            width: 20,
        //            //height: 20,
        //            //backgroundColor: 'rgba(221,160,221,0.5)',
        //            //dataBackgroundColor: 'rgba(138,43,226,0.5)',
        //            //fillerColor: 'rgba(38,143,26,0.6)',
        //            //handleColor: 'rgba(128,43,16,0.8)',
        //            //xAxisIndex:[],
        //            //yAxisIndex:[],
        //            start : 70,
        //            end : 100
        //        },
        //        calculable: true,
        //        yAxis: [
        //            {
        //                type: 'category',
        //                axisLabel : {
        //                    interval: 0,
        //                    formatter: function(val){
        //                        return get_axislabel(val, 5);
        //                    }
        //                },
        //                data: moke_email("a", email_num)
        //            }
        //        ],
        //        xAxis: [
        //            {
        //                type: 'value'
        //            }
        //        ],
        //        series: [
        //            {
        //                name: '发件人',
        //                type: 'bar',
        //                itemStyle: {
        //                    normal: {
        //                        label: {
        //                            show: false,
        //                            position: 'right',
        //                            formatter: '{b}\n{c}'
        //                        }
        //                    }
        //                },
        //                data: moke_data(email_num, 30)
        //            }
        //        ]
        //    };
        //
        //    myChart.setOption(option);
        //}
        //
        //function init_chart2(){
        //    var myChart = ec.init(document.getElementById('ec-receiver'), 'macarons');
        //
        //    var option = {
        //        title: {
        //            x: 'center',
        //            text: '收件人统计',
        //            subtext: '话单数量'
        //        },
        //        tooltip: {
        //            trigger: 'item'
        //        },
        //        toolbox: {
        //            show: true,
        //            feature: {
        //                dataView: {show: true, readOnly: false},
        //                restore: {show: true},
        //                saveAsImage: {show: true}
        //            }
        //        },
        //        dataZoom : {
        //            show : true,
        //            realtime : true,
        //            orient: 'vertical',   // 'horizontal'
        //            x: 'right',
        //            //y: 'top',
        //            width: 20,
        //            //height: 20,
        //            //backgroundColor: 'rgba(221,160,221,0.5)',
        //            //dataBackgroundColor: 'rgba(138,43,226,0.5)',
        //            //fillerColor: 'rgba(38,143,26,0.6)',
        //            //handleColor: 'rgba(128,43,16,0.8)',
        //            //xAxisIndex:[],
        //            //yAxisIndex:[],
        //            start : 70,
        //            end : 100
        //        },
        //        calculable: true,
        //        yAxis: [
        //            {
        //                type: 'category',
        //                axisLabel : {
        //                    interval: 0,
        //                    formatter: function(val){
        //                        return get_axislabel(val, 5);
        //                    }
        //                },
        //                data: moke_email("b", email_num)
        //            }
        //        ],
        //        xAxis: [
        //            {
        //                type: 'value'
        //            }
        //        ],
        //        series: [
        //            {
        //                name: 'ECharts例子个数统计',
        //                type: 'bar',
        //                itemStyle: {
        //                    normal: {
        //                        label: {
        //                            show: false,
        //                            position: 'right',
        //                            formatter: '{b}\n{c}'
        //                        }
        //                    }
        //                },
        //                data: moke_data(email_num, 30)
        //            }
        //        ]
        //    };
        //
        //    myChart.setOption(option);
        //}
        //
        //function init_chart3(){
        //    var myChart = ec.init(document.getElementById('ec-receiver-area'), 'macarons');
        //
        //    var option = {
        //        title : {
        //            text: '收件人归属地分布',
        //            subtext: '',
        //            left:'center'
        //        },
        //        tooltip : {
        //            trigger: 'item'
        //        },
        //        visualMap: {
        //            min: 0,
        //            max: 2500,
        //            x: 'left',
        //            y: 'bottom',
        //            text:['高','低'],           // 文本，默认为数值文本
        //            calculable : true
        //        },
        //        toolbox: {
        //            show: true,
        //            orient : 'vertical',
        //            x: 'right',
        //            y: 'center',
        //            feature : {
        //                dataView : {readOnly: false},
        //                restore : {},
        //                saveAsImage : {}
        //            }
        //        },
        //        series : [
        //            {
        //                name: '收件人分布',
        //                type: 'map',
        //                mapType: 'china',
        //                roam: false,
        //                label:{
        //                    normal:{show:true},
        //                    emphasis:{show:true}
        //                },
        //                data:[
        //                    {name: '北京',value: randomData(1000)},
        //                    {name: '天津',value: randomData(1000)},
        //                    {name: '上海',value: randomData(1000)},
        //                    {name: '重庆',value: randomData(1000)},
        //                    {name: '河北',value: randomData(1000)},
        //                    {name: '河南',value: randomData(1000)},
        //                    {name: '云南',value: randomData(1000)},
        //                    {name: '辽宁',value: randomData(1000)},
        //                    {name: '黑龙江',value: randomData(1000)},
        //                    {name: '湖南',value: randomData(1000)},
        //                    {name: '安徽',value: randomData(1000)},
        //                    {name: '山东',value: randomData(1000)},
        //                    {name: '新疆',value: randomData(1000)},
        //                    {name: '江苏',value: randomData(1000)},
        //                    {name: '浙江',value: randomData(1000)},
        //                    {name: '江西',value: randomData(1000)},
        //                    {name: '湖北',value: randomData(1000)},
        //                    {name: '广西',value: randomData(1000)},
        //                    {name: '甘肃',value: randomData(1000)},
        //                    {name: '山西',value: randomData(1000)},
        //                    {name: '内蒙古',value: randomData(1000)},
        //                    {name: '陕西',value: randomData(1000)},
        //                    {name: '吉林',value: randomData(1000)},
        //                    {name: '福建',value: randomData(1000)},
        //                    {name: '贵州',value: randomData(1000)},
        //                    {name: '广东',value: randomData(1000)},
        //                    {name: '青海',value: randomData(1000)},
        //                    {name: '西藏',value: randomData(1000)},
        //                    {name: '四川',value: randomData(1000)},
        //                    {name: '宁夏',value: randomData(1000)},
        //                    {name: '海南',value: randomData(1000)},
        //                    {name: '台湾',value: randomData(1000)},
        //                    {name: '香港',value: randomData(1000)},
        //                    {name: '澳门',value: randomData(1000)}
        //                ]
        //            }
        //        ]
        //    };
        //
        //
        //
        //    myChart.setOption(option);
        //}

        $('body').on('click', '.returnBtn',function(){
            $('.navbar-btnlist span').removeClass('active').eq(0).addClass('active');
            $('#body-wrapper .pages').hide().eq(0).show();
            $('.triangle').hide().eq(0).show();
        })
        //function init_charts(){
        //    init_chart1();
        //    init_chart2();
        //    init_chart3();
        //}


        function init(headerData){
            $(".navBtn-dataPivot.hbtn", parent.document).css("display", "inline-block" );
            $('.navbar-btnlist span', parent.document).removeClass('active').eq(2).addClass('active');
            $('#body-wrapper .pages', parent.document).hide().eq(2).show();
            $('.triangle', parent.document).hide().eq(2).show();
            init_downTree_menu(headerData);
            $("#perspective").height("auto");
            $("#downTree").height($(window).height() - 100); //设置树的高度
            $("#downHistory .ulBox").width($(window).width() - 70);
            $("#select_time_range").width($(window).width() - 200);
            //init_charts();
        }

        return {
            init: init
        }

    });