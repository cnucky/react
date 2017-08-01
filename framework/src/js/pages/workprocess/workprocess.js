initLocales(require.context('../../../locales/workprocess', false, /\.js/));
require([
    'widget/dialog/nova-dialog',
    'widget/dialog/nova-bootbox-dialog',
    'widget/dialog/nova-notify',
    'widget/dialog/nova-alert',
    'module/workprocess/utility',
    'module/workprocess/customcfg',
    'module/tabledesign/api/table-runtime',
], function(dialog, bootbox, notify, alert, utility, customcfg) {
    initmenu();

    //select some table material and jumping
    $("#spy-nav .nav").on("click" ,"li" , function(){
        var type = $(this).children('a').data("type");
        var url = customcfg.getCustomListUrl({
            strTaskType: type
        });
        $("iframe").attr("src", url + "?type=" + type);  
    })
    //iframe height adaptive
    $("#ifm").load(function() {
        $("#ifm").height(800);
        var callback = function() {
            if ($("#ifm").contents().find('body')[0].scrollHeight > 800)
                $("#ifm").height($("#ifm").contents().find('body')[0].scrollHeight);
            else
                $("#ifm").height(800);
        }
        callback();
        var mo = new MutationObserver(callback);
        var option = {
            'subtree': true,
            'attributes': true,
            'childList':true,
        }
        mo.observe($("#ifm").contents().find('body').get(0), option);

        var subWin = window.frames["ifm"].contentWindow;
        subWin.$(subWin).unload(function(event){
            $.getJSON("/user/curuserinfo", function(data, status){
                if(data.code != 0) //need login
                    window.location.reload();
            });
        });
    });
    //remove load animation
    hideLoader();
    //navigation list 's initialization
    function initmenu() {
        customcfg.init(function(){
            renderTaskTypes(function(firstTask){
                $('#spy-nav >.nav >li:eq(0)').addClass('active');
                var  param = utility.parseQuery();
                if(!!param.url){
                        $('#spy-nav >.nav >.active').removeClass('active');
                        $('#spy-nav >.nav >li>a[data-type = '+ param.type +']').parent().addClass('active');
                        $("iframe").attr("src", decodeURIComponent(param.url));
                }else{

                    var strTypeName = firstTask.strTypeName;
                    var url = customcfg.getCustomListUrl({
                        strTaskType: strTypeName
                    });
                    $("iframe").attr("src", url + "?type=" + strTypeName);
                }
            })
        });
        window.workprocessbootbox = bootbox;
        window.workprocessdialog = dialog;
        window.workprocessnotify = notify;
        window.workprocessalert = alert;
        window.workprocessnavrefresh = function() { renderTaskTypes(); }
    }
    function renderTaskTypes(callback) {
        $.getJSON("/user/curuserinfo", function(res, status) {
            if (res.code !== 0)
                return;
            $.getJSON("/workflow/GetIssuesTypeList",{
                strUserID: res.data.userId,
                strUserName: res.data.title,
                nUserType: 0
            } , function(res) {
                if(res.code !== 0)
                    return notify.show({
                        title: i18n.t("workprocess.commontip.gettypelistFail"),
                        text: res.message,
                        type: "error"
                    });
                /*如果res.data是空的话，没有做相应的保护，导致后面的函数去不到值，运行时js报错*/
                var items = res.data.sort(function(a, b){
                    if(a.nUnfinishedCount === 0 && b.nUnfinishedCount === 0
                        || a.nUnfinishedCount !== 0 && b.nUnfinishedCount !== 0)
                        return a.strTypeName < b.strTypeName ? -1 : 1;
                    else
                        return a.nUnfinishedCount !== 0 ? -1 : 1;
                });
                var activeItem = $('#spy-nav >.nav >.active').children('a').data('type');
                $('#spy-nav >.nav').empty();
                items.forEach(function(item){
                    $('#spy-nav .nav').append("<li " + (item.strTypeName === activeItem ? "class='active' " : "") + "><a data-toggle='tab' data-type='" + item.strTypeName + "'>" +
                            "<span class='title'>" + item.strTypeDispName + "</span>" +
                            (item.nUnfinishedCount === 0 ? "" : ("<span class='badge badge-info pull-right'>" + item.nUnfinishedCount + "</span>")) +
                        "</a></li>");
                });
                if(callback)
                    callback(items[0]);
            });
        });
    }
});
