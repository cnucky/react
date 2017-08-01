/**
 * Created by maxiaodan on 2016/12/6.
 */
define([], function () {
    var filterControl = {
        //生成tag标签
        CreateControl: function (data, divid, submitcallback) {
            var innerHtml = '<div class="sx_updown clearfix">' +
                '<div class="content">';

            for (var i = 0; i < data.length; i++) {
                innerHtml += this.createNode(data[i]);
            }

            innerHtml += '</div></div><button id="submit" style="position:absolute;bottom:70px;left: 120px;z-index: 9999">筛选</button>';

            $('#' + divid).append(innerHtml);
            this.addSelectEvent(submitcallback);
        },

        createNode: function (tag) {
            var innerHtml = '';
            innerHtml += '<div class="updown_box">' +
                '<h3>' + tag.title + '</h3>';
            for (var i = 0; i < tag.subtitle.length; i++) {
                if (tag.subtitle[i].type == 'input') {
                    innerHtml += '<div><h5>' + tag.subtitle[i].name + '</h5><ul></ul><input type="text"><div class="add">+</div></div>';
                }
                if (tag.subtitle[i].type == 'select') {
                    innerHtml += '<div><h5>' + tag.subtitle[i].name + '</h5><ul>';
                    for (var j = 0; j < tag.subtitle[i].valueList.length; j++) {
                        innerHtml += '<li><a href="javascript:;" >' + tag.subtitle[i].valueList[j] + '</a></li>';
                    }
                    innerHtml += '</ul></div>';
                }
                if (tag.subtitle[i].type == 'inputIntRange') {
                    innerHtml += '<div><h5>' + tag.subtitle[i].name + '</h5><div><input type="text" style="width:30%"><span style="color:#4a9aff;font-size:13px;margin-left:10px;margin-bottom:5px;">&nbsp;--&nbsp; </span><input type="text" style="width:30%"></div></div>';
                }
                if (tag.subtitle[i].type == 'inputDateRange') {
                    innerHtml += '<div><h5>' + tag.subtitle[i].name + '</h5><div style="margin-left:30px;color:rgb(50, 110, 255);font-size:12px;">开始时间：</div><input type="text" style="width:50%"><br><div style="margin-left:30px;color:rgb(50, 110, 255);font-size:12px;">结束时间：</div><input type="text" style="width:50%"></div>';
                }
            }

            innerHtml += '</div>';

            return innerHtml;
        },

        addSelectEvent: function (callback) {
            $(".updown_box li").click(function () {
                $(this).toggleClass("selected");
            });

            $(".updown_box .add").click(function () {
                var inputtext = $($(this).siblings("input")[0]).val();
                if (inputtext != '') {
                    $(this).siblings("ul").append('<li class="selected newadd"><a href="javascript:;" >' + inputtext + '</a></li>');
                    $($(this).siblings("input")[0]).val("");
                    $(".updown_box li.newadd a").unbind("click");
                    $(".updown_box li.newadd a").click(function () {
                        $(this).parent("li").remove();
                    });
                }
            });
            $("#submit").click(function () {
                if (filterControl.checkData())
                    callback();
            });
        },

        checkData: function () {
            var iscorrect = true;
            $(".updown_box h5").each(function () {
                switch ($(this).text()) {
                    case "国籍":
                        {
                            var ele = $(this).siblings("ul").children("li");
                            var guoji = [];
                            ele.each(function () {
                                guoji.push($($(this).children()[0]).text());
                            });
                            if (ele.length == 0)
                                iscorrect = iscorrect && false;
                            else if (guoji.indexOf("中国台湾") != -1) {
                                iscorrect = iscorrect && true;
                            } else {
                                iscorrect = iscorrect && false;
                            }
                            break;
                        }
                    case "性别":
                        {
                            var ele = $(this).siblings("ul").children();
                            ele.each(function () {
                                if ($($(this).children()[0]).text() == "男" && $(this).hasClass("selected"))
                                    iscorrect = iscorrect && true;
                                else if ($($(this).children()[0]).text() == "女")
                                ;
                                else
                                    iscorrect = iscorrect && false;

                            });
                            break;
                        }
                    case "年龄":
                        {
                            var ele = $(this).siblings("div").children("span");
                            if ($(ele[0]).prev().val() == "20" && $(ele[0]).next().val() == "35")
                                iscorrect = iscorrect && true;
                            else
                                iscorrect = iscorrect && false;
                            break;
                        }
                    case "酒店":
                        {
                            var ele = $(this).siblings("ul").children("li");
                            var jiudian = [];
                            ele.each(function () {
                                jiudian.push($($(this).children()[0]).text());
                            });
                            if (ele.length == 0)
                                iscorrect = iscorrect && false;
                            else if (jiudian.indexOf("日坛国际酒店") != -1) {
                                iscorrect = iscorrect && true;
                            } else {
                                iscorrect = iscorrect && false;
                            }
                            break;
                        }
                    case "时间":
                        {
                            var ele = $(this).siblings("div");
                            var flag = true;
                            ele.each(function () {
                                if ($(this).text() == "开始时间：" && $(this).next().val() == "2016/08/01")
                                    flag = flag && true;
                                else if ($(this).text() == "结束时间：" && $(this).next().val() == "2016/08/06")
                                    flag = flag && true;
                                else
                                    flag = flag && false;
                            });
                            iscorrect = iscorrect && flag;
                            break;
                        }
                    case "入境时间":
                        {
                            break;
                        }
                    case "出境时间":
                        {
                            var ele = $(this).siblings("ul").children("li");
                            var chujing = [];
                            ele.each(function () {
                                chujing.push($($(this).children()[0]).text());
                            });
                            if (ele.length == 0)
                                iscorrect = iscorrect && false;
                            else if (chujing.indexOf("2016/08/04") != -1) {
                                iscorrect = iscorrect && true;
                            } else {
                                iscorrect = iscorrect && false;
                            }
                            break;
                        }
                    case "境内出现时间":
                        {
                            var ele = $(this).siblings("ul").children("li");
                            var jingneishijian = [];
                            ele.each(function () {
                                jingneishijian.push($($(this).children()[0]).text());
                            });
                            if (ele.length == 0)
                                iscorrect = iscorrect && false;
                            else if (jingneishijian.indexOf("2016/07/30") != -1) {
                                iscorrect = iscorrect && true;
                            } else {
                                iscorrect = iscorrect && false;
                            }
                            break;
                        }
                    case "境内出现地点":
                        {
                            var ele = $(this).siblings("ul").children("li");
                            var jingneididian = [];
                            ele.each(function () {
                                jingneididian.push($($(this).children()[0]).text());
                            });
                            if (ele.length == 0)
                                iscorrect = iscorrect && false;
                            else if (jingneididian.indexOf("广东") != -1) {
                                iscorrect = iscorrect && true;
                            } else {
                                iscorrect = iscorrect && false;
                            }
                            break;
                        }
                }
            });
            return iscorrect;
        }

    };

    function getFilterCon() {
        return filterControl;
    }

    return {
        getFilterCon: getFilterCon
    }
});