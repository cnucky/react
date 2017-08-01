initLocales();
var Alert = require('nova-alert');
var appConfig = window.__CONF__.business.bireport;

hideLoader();

$(".iconTD").mouseover(function() {
    $(this).parent().children(".desDiv").css({
        'visibility': 'visible'
    });
    $(this).css('background', '#5cace1');
});

$(".iconTD").mouseleave(function() {
    $(this).parent().children(".desDiv").css({
        'visibility': 'hidden'
    });
    $(this).css('background-color', '#3498DB');
});

$(".actionCell").click(function() {
    var cookies = document.cookie.split('; ');
    var map = {};
    cookies.forEach(function(cookie) {
        var kv = cookie.split('=');
        map[kv[0]] = kv[1];
    });
    var tgt = map['tgt'];
    var v = $(this).attr("idx");
    var isIpHost = /^(\d+).(\d+).(\d+).(\d+)$/.test(window.location.host);
    var jumpAddress = "";
    switch (v) {
        case "query":
            jumpAddress = appConfig['yongHongBiIp'] + "/bi/Viewer?proc=0&action=query&ssoAction=login&tgt=" + tgt;
            if (isIpHost) {
                jumpAddress = jumpAddress.replace(appConfig['yonghong-server'], appConfig['yonghong-server-ip']);
            }
            window.open(jumpAddress);
            break;
        case "db":
            jumpAddress = appConfig['yongHongBiIp'] + "/bi/Viewer?proc=0&action=editor&ssoAction=login&tgt=" + tgt;
            if (isIpHost) {
                jumpAddress = jumpAddress.replace(appConfig['yonghong-server'], appConfig['yonghong-server-ip']);
            }
            window.open(jumpAddress);
            break;
        case "viewer":
            jumpAddress = appConfig['yongHongBiIp'] + "/bi/Viewer?proc=0&action=viewerManager&ssoAction=login&tgt=" + tgt;
            if (isIpHost) {
                jumpAddress = jumpAddress.replace(appConfig['yonghong-server'], appConfig['yonghong-server-ip']);
            }
            window.open(jumpAddress);
            break;
    }
});