/**
 * Created by mdk on 16/5/3.
 */
var path = require('path');
var _ = require('underscore');
var cachemgr = require(path.join(process.cwd(), 'public/widget/cachemgr/src/cachemgr.js'))
var configReader = require('./config.js');

function MenuCache(){
    this.menu_type = {};
    this.menu_type_hash = {};
    this.allMenu = {children:[]};
    this.allMenuHash = {};
}

MenuCache.prototype.getMenu_type = function (callback) {
    this.menu_type = cachemgr.getLRUCache('menu_type');
    if(this.menu_type == null){
        getAll(function(data){
            callback(data.menu_type);
        })
    }else{
        callback(this.menu_type);
    }
}

MenuCache.prototype.getMenu_type_hash = function (callback) {
    this.menu_type_hash = cachemgr.getLRUCache('menu_type_hash');
    if(this.menu_type_hash == null){
        getAll(function(data){
            callback(data.menu_type_hash);
        })
    }else{
        return this.menu_type_hash;
    }
}

MenuCache.prototype.getAllMenu = function (callback) {
    this.allMenu = cachemgr.getLRUCache('allMenu');
    if(this.allMenu == null){
        getAll(function(data){
            callback(data.all_menu_type);
        })
    }else{
        return this.allMenu;
    }
}

MenuCache.prototype.getAllMenuHash = function (callback) {
    this.allMenuHash = cachemgr.getLRUCache('allMenuHash');
    if(this.allMenuHash == null){
        getAll(function(data){
            callback(data.all_menu_type_hash);
        })
    }else{
        return this.allMenuHash;
    }
}

function getAll(callback){
    configReader.getConfigData(function(result){
        /*var config_protocols = result.CONFIG_DATA.CATEGORIES[0].CATEGORY;*/
        var menu_type = {};
        var menu_type_hash = {};
        var allMenu = {children:[]};
        var allMenuHash = {};
        for(i in result){
            var config_data = [];
            var config_protocols = result[i].DataTypes;

            _.each(config_protocols, function (config_protocol) {
                var protocol_item = {
                    key: config_protocol.Name,
                    sessionId:-1,
                    title: config_protocol.Caption
                };
                config_data.push(protocol_item);
                allMenu.children.push(protocol_item)
            });

            var menu = {
                "key": result[i].Name,
                "title": result[i].Caption,
                "expanded": true,
                "children": []
            }
            menu.children = config_data;
            //console.log(JSON.stringify(config_data));
            menu_type[i] = menu

            var menuHash = {};
            _.each(config_data, function (data) {
                menuHash[data.key] = data;
                allMenuHash[data.key] = data;
            });
            menu_type_hash[i] = menuHash
        }

        cachemgr.putLRUCache("menu_type", menu_type);
        //console.log(menu);
        cachemgr.putLRUCache("menu_type_hash", menu_type_hash)

        cachemgr.putLRUCache("all_menu_type", allMenu);
        cachemgr.putLRUCache("all_menu_type_hash", allMenuHash)
        callback({"menu_type":menu_type, "menu_type_hash":menu_type_hash, "all_menu_type":allMenu, "all_menu_type_hash":allMenuHash})
    });
}
module.exports = new MenuCache();
