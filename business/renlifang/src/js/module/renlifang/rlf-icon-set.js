var Util = require('nova-utils');
var _ = require('underscore');

function icons() {
    return {
        icons: {
            '1': {
                type: 1,
                name: "身份证",
                icon: "fa fa-user",
                color: "#F6B132"
            },
            '5': {
                type: 5,
                name: "手机",
                icon: "fa fa-phone-square",
                color: "#6EAFF7"
            },
            '11': {
                type: 11,
                name: "QQ",
                icon: "fa fa-qq",
                color: "#E95D35"
            },
            '12': {
                type: 12,
                name: "电子邮箱",
                icon: "fa-envelope",
                color: "#6B4897"
            },
            '2': {
                type: 2,
                name: "护照",
                icon: "fa fa-ticket",
                color: "#F64662"
            },
            '3': {
                type: 3,
                name: "签证",
                icon: "fa fa-cc-visa",
                color: "#5457A6"
            },
            '4': {
                type: 4,
                name: "电话",
                icon: "fa fa-phone-square",
                color: "#F39C9C"
            },
            '6': {
                type: 6,
                name: "汽车",
                icon: "fa fa-bus",
                color: "#29CDB5"
            },
            '7': {
                type: 7,
                name: "银行账户",
                icon: "fa fa-credit-card",
                color: "#0066CC"
            },
            '8': {
                type: 8,
                name: "宾馆",
                icon: "fa fa-bed",
                color: "#80EF91"
            },
            '9': {
                type: 9,
                name: "火车",
                icon: "fa fa-train",
                color: "#EC952E"
            },
            '10': {
                type: 10,
                name: "飞机",
                icon: "fa fa-plane",
                color: "#4BC87F"
            },
            '13': {
                type: 13,
                name: "微博",
                icon: "fa fa-weibo",
                color: "#F06161"
            },
            '14': {
                type: 14,
                name: "IP",
                icon: "fa fa-wifi",
                color: "#A2453D"
            },
            '15': {
                type: 15,
                name: "QQ群组",
                icon: "fa fa-users",
                color: "#00ADB5"
            },
            '16': {
                type: 16,
                name: "淘宝",
                icon: "alibaba alitao fs14",
                color: "#FF5500"
            },
            '17': {
                type: 17,
                name: "支付宝",
                icon: "alibaba alipay fs14",
                color: "#01AAEF"
            }
        }
    }
}


function getcurrentHrefName() {
    var iconSet = icons().icons;
    var valueandname;
    if(!Util.getURLParameter('entityid')){
        return undefined;
    }
    var entityid = Util.deCodeString(Util.getURLParameter('entityid'));
    var entitytype = Util.deCodeString(Util.getURLParameter('entitytype'));
    _.find(iconSet, function(item) {
        if (entitytype == item.type) {
            valueandname = entityid + "(" + item.name + ")";
        }
    });
    return valueandname;
}


module.exports.icons = icons;
module.exports.getcurrentHrefName = getcurrentHrefName;