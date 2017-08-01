/**
 * Created by xuxiaogang on 2016/3/29.
 */
(function (window, document, undefined) {
    $("#map").bind("contextmenu",function(){
        return false;
    });
    $("#mapMenu").bind("contextmenu",function(){
        return false;
    });
    $("#innerPoint").bind("contextmenu",function(){
        return false;
    });
//    $("#enclosureList").mousedown(function(e){
//        if(e.button != 2) return; //不是右键操作，直接返回
//
//        var left = e.pageX;
//        var top = e.pageY;
//        $("#enclosureMemu").css({"left":left,"top":top,"display":"block"});
//
//       return false;
//    });
//    $("#map").mousedown(function(e){
//        if(e.button != 2) return; //不是右键操作，直接返回
//
//        var left = e.pageX;
//        var top = e.pageY;
//        $("#mapMenu").css({"left":left,"top":top,"display":"block"});
//
//        return false;
//    });

    var childMenuTag = false;
    var timeControl = null; //计时器
    $("#displayInnerPoint").mouseenter(function(){
        var left = parseInt($("#mapMenu").css("left")) + 153;
        var top = parseInt($("#mapMenu").css("top")) + 40;
        $("#innerPoint").css({"left":left,"top":top,"display":"block"});
    });
    $("#displayInnerPoint").mouseleave(function(){
        timeControl = setTimeout(TimeOut,100);
    });
    $("#innerPoint").mouseenter(function(){
        childMenuTag = true;
    });
    $("#innerPoint").mouseleave(function(){
        if(childMenuTag)
        {
            $("#innerPoint").hide();
            childMenuTag = false;
        }
    });
    function TimeOut()
    {
        if(!childMenuTag)
        {
            $("#innerPoint").hide();
        }
        timeControl = null;
    }

}(window, document));