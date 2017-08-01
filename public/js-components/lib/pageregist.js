//require pagecontrol

relayoutpage();
window.publishall = publishall;
window.params = {};

if(!_.isUndefined(window.screenid))
 regist(window.screenid, resendmsg);

console.log("regist");

function gotopage(pagecode){
    sendPageCommand('rscreen',{name:'changepage',value:pagecode +'r'});
    sendPageCommand('lscreen',{name:'changepage',value:pagecode +'l'});
};

function relayoutpage(){
    var divs = $("div");

    var heights = [];
    $.each(divs,function(i,item){
        heights.push( $("#" + item.id).height());
    });

    $.each(divs, function (i,item) {
        $("#" + item.id).attr("style", "height:" + (heights[i] + 2));
    });
};

function publishall(eventname, params) {

    sendPageCommand(window.anotherscreenid, {name: 'command', value: {eventid: eventname, value: params}});
    $.publish(eventname, params);
};

function resendmsg(msg) {

    msg = msg.value;
    window.params = msg.value;
    if (msg.eventid == "reloadpage") {
        $.publish(msg.eventid, msg.value);
    }

    console.log("getmsg");
};