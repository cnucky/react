initLocales(require.context('../../locales/dataprocess/', false, /\.js/));
require([], function () {
//++++++++++++++++++事件响应++++++++++++++

//路由信息展开/收起
    $(document).on("click", "#openRoute", function (e) {
        e.preventDefault();
        $(this).toggleClass("in");
        $("#routeTab,#nodesBox").fadeToggle();
        if ($(this).hasClass("in")) {
            $(this).children("span").attr("class", "fa fa-minus-square");
        } else {
            $(this).children("span").attr("class", "fa fa-plus-square");
        }
    });

//切换路由图
    $(document).on("click", "#routeTab a", function (e) {
        e.preventDefault();
        $(this).addClass("a").siblings().removeClass("a");
        $("#nodesBox").children("div").eq($(this).index()).show().siblings().hide();
    });

//查看、收起情/更多
    $(document).on('click', '#email-page a.view ', function () {
        var tname = $(this).html().substr("2");
        if ($(this).hasClass("in")) {
            $(this).html(i18n.t("dataprocess.action.close_2") + tname).removeClass("in");
        } else {
            $(this).html(i18n.t("dataprocess.action.look") + tname).addClass("in");
        }
    });
})