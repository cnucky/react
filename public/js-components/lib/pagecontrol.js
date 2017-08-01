//css
document.write("<link rel='stylesheet' type='text/css' href='/css/skin/bootstrap.css'>")
document.write("<link rel='stylesheet' type='text/css' href='/css/navbutton/animate.min.css'>")
document.write("<link rel='stylesheet' type='text/css' href='/css/navbutton/default.css'>")

if(window.screenid != undefined)
   document.write("<link rel='stylesheet' type='text/css' href='/css/navbutton/styles-5.css'>")
else
    document.write("<link rel='stylesheet' type='text/css' href='/css/navbutton/styles-7.css'>")

document.write("<link rel='stylesheet' type='text/css' href='/css/panel.css'>")
document.write("<link rel='stylesheet' type='text/css' href='/css/bubble/bubble.css'>")
//js
document.write("<script type='text/javascript' src='/socket.io/socket.io.js'></script>")
document.write("<script type='text/javascript' src='/js/components/lib/jquery.js'></script>")
document.write("<script type='text/javascript' src='/js/components/lib/jquery-ui.js'></script>")
document.write("<script type='text/javascript' src='/js/components/lib/jquery.history.js'></script>")
document.write("<script type='text/javascript' src='/js/components/lib/jquery.animateNumber.min.js'></script>")
document.write("<script type='text/javascript' src='/js/components/lib/bootstrap.js'></script>")
document.write("<script type='text/javascript' src='/js/components/lib/underscore.js'></script>")
document.write("<script type='text/javascript' src='/js/components/lib/q.min.js'></script>")
document.write("<script type='text/javascript' src='/js/components/echarts/echarts-all.js'></script>")
document.write("<script type='text/javascript' src='/js/components/lib/ba-tinyPubSub.js'></script>")


var socket;

function regist(screenid, callback)
{
    socket = io.connect('http://'+ window.location.hostname +':3000');

    socket.emit('regist', { screenid: screenid });

    socket.on('changepagecmd_toclient', function(data){
        if(data.name=='changepage')
        {
            changePage(data.value);
        }
        else
        {
            if(callback != undefined)
                callback(data);
        }
    });
}

function changePage(pageid)
{
    $.getJSON("../mock/getlink",function(data){
        //console.log(data);
        $.grep(data,function(val,key){
            if(val.name==pageid)
            {
                window.location.href=val.link;
            }
        });
    });
}

function sendPageCommand(screenid,command)
{
    socket.emit('changepagecmd_toserver',{'screenid':screenid,'command':command});
}

//under pagecontrol
document.write("<script type='text/javascript' src='/js/components/lib/pageregist.js'></script>");