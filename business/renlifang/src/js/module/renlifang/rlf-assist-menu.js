var $ = require('jquery');
var _ = require('underscore');
var Util = require('nova-utils');
var Dialog = require('nova-dialog');
var IframeDialog = require('nova-iframe-dialog');
var Util = require('nova-utils');

var searchKeyValue = "";
module.exports.initContextmenu = function(container, filter, isPermissison, flag) {
    if (isPermissison) {
        $(container).contextmenu({
            delegate: filter,
            menu: "#option",
            beforeOpen: function(event, ui) {
            	if(flag){
            		searchKeyValue = event.currentTarget.innerText;
                    if(filter == "span.fancytree-title"){
                        var start = searchKeyValue.indexOf("(");
                        var end = searchKeyValue.indexOf(")");
                        searchKeyValue = searchKeyValue.substring(start + 1, end);
                    }
            	}else{
            		searchKeyValue = event.currentTarget.children[1].innerText.trim();
            	}
            },
            select: function(event, ui) {
                if (ui.cmd == "searchbykey") {
                    // var obj = {
                    //     conditions: searchKeyValue,
                    //     search_code: "KEYWORD",
                    //     search_code_name: "码址/关键词",
                    // }
                    // searchByKey.show(obj,null,null,null,true);
                    window.open("/datasearch/search-all.html?addr=" + Util.enCodeString(searchKeyValue));
                
                }
            }
        });
    }
}