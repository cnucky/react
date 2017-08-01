/**
 * Created by root on 1/3/17.
 */
var path = require('path');
var _ = require('underscore');
var configmgr = require(path.join(process.cwd(), 'public/widget/configmgr/src/configmgr.js'));
var cachemgr = require(path.join(process.cwd(), 'public/widget/cachemgr/src/cachemgr.js'));

//var cachemgr = require('./cachemgr.js')

function ConfigReader() {
};



ConfigReader.prototype.getConfigData = function (callback) {
    var cached_name = "cached_config_data";
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/libConfig/config/',
            'config_data.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var map = {};

                _.each(result.CONFIG_DATA.CATEGORIES, function(category){
                    var categoryObject = {
                        Name:category.NAME[0],
                        Caption:category.CAPTION[0],
                        DataTypes:[]
                    };

                    _.each(category.DATA_TYPE,function(data_type){
                        var dataTypeObject = {
                            Name:data_type.NAME[0],
                            Caption:data_type.CAPTION[0],
                            ServiceTypes:[]
                        };

                        _.each(data_type.SERVICE_TYPE, function(service_type){
                            dataTypeObject.ServiceTypes.push({
                                Name:service_type.NAME[0],
                                Caption:service_type.CAPTION[0]
                            })
                        });

                        categoryObject.DataTypes.push(dataTypeObject);

                    })

                    map[categoryObject.Name] = categoryObject;
                });
                cachemgr.putLRUCache(cached_name,map);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(map);
                }else{
                    cache_put_in_callback(configRes);
                    callback(map);
                }
            }
        );
    }
};


ConfigReader.prototype.getType2operation = function (callback) {
    var cached_name = "cached_type2operation";
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/readcontrol/config/',
            'config_type2operation_map.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var cached_type2operation_data = type2operation_data_trans(result);
                cachemgr.putLRUCache(cached_name,cached_type2operation_data);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(cached_type2operation_data);
                }else{
                    cache_put_in_callback(configRes);
                    callback(cached_type2operation_data);
                }
            }
        );
    }
}

function type2operation_data_trans(xml_data){
    var type2operation_dic = {};
    var type_list = xml_data.Type2Operation.Type;
    _.each(type_list, function (type) {
        var type_name = type.name[0];
        var operation_list = type.Operation;
        var operations = [];
        _.each(operation_list, function (operation) {
            var key = operation.key[0];
            var val = operation.val[0];
            var operation_item = {
                key: key,
                val: val
            };
            operations.push(operation_item);
        });
        type2operation_dic[type_name] = operations;
    });
    return type2operation_dic;
}

ConfigReader.prototype.getTranslationDic = function (callback) {
    var cached_name = "cached_translation_dic";
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/libConfig/config/',
            'config_translate.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var translate_map = {};
                _.each(result.TRANSLATE.DIC,function(dic){
                    translate_map[dic.NAME] = {};
                    _.each(dic.ELEINFO, function(item){
                        translate_map[dic.NAME][item.CODE] = item.VALUE;
                    });
                });
                cachemgr.putLRUCache(cached_name,translate_map);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(translate_map);
                }else{
                    cache_put_in_callback(configRes);
                    callback(translate_map);
                }
            }
        );
    }


}

ConfigReader.prototype.getReverseTranslationList = function (callback) {
    var cached_name = "cached_reverse_translation_list";
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/libConfig/config/',
            'config_translate.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var translate_map = {};
                _.each(result.TRANSLATE.DIC,function(dic){
                    translate_map[dic.NAME] = [];
                    var list = [];

                    _.each(dic.ELEINFO, function(item){
                        var existedItem = _.find(list, function(item_in_list){
                            return item_in_list.desc == item.VALUE[0];
                        });
                        if (existedItem == null)
                        {
                            list.push({name:item.CODE[0],
                                desc:item.VALUE[0]});
                        }
                        else
                        {
                            existedItem.name = existedItem.name + ',' + item.CODE[0];
                        }
                    });

                    translate_map[dic.NAME] = list;
                });

                cachemgr.putLRUCache(cached_name,translate_map);

                if(cache_put_in_callback == null){
                    //直接使用
                    callback(translate_map);
                }else{

                    cache_put_in_callback(configRes);
                    callback(translate_map);
                }
            }
        );
    }


};



ConfigReader.prototype.getRelationsAnalysisTemplate = function (callback) {
    var cached_name = "cached_relations_Analysis_template";
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/readcontrol/config/' , 'relationsAnalysis/'+
            'template-config.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                result = result['CONFIG_DATA']['TEMPLATE'];
                var returnData = {}
                _.each(result, function(template){
                    returnData[template['DATATYPE'][0]] = [];
                    _.each(template['TEMPLATEITEM'], function(templateItem){
                        var tmp = {};
                        tmp['NAME'] = templateItem['NAME'][0];
                        tmp['START'] = templateItem['START'][0];
                        tmp['END'] = templateItem['END'][0];
                        tmp['TIME'] = templateItem['TIME'][0];
                        returnData[template['DATATYPE'][0]].push(tmp);
                    })
                });
                cachemgr.putLRUCache(cached_name,returnData);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(result);
                }else{
                    cache_put_in_callback(configRes);
                    callback(returnData);
                }
            }
        );
    }


}




ConfigReader.prototype.getDisplayConfig = function(category,callback) {


    var cached_name = "cached_display_config_" + category;
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/libConfig/config/' , 'display/'+
            category + '_DISPLAY.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var defaultVersion = result.CONFIG.VERSION[0];
                var columns = result.CONFIG.UI_CONFIG[0].COLUMNS[0].COLUMN;
                var fullColumnMap = {};
                _.each(columns, function(column){
                    fullColumnMap[column.NAME[0]] = column;
                })
                var listColumns = result.CONFIG.UI_CONFIG[0].LIST_COLUMNS[0].COLUMN;

                var rtnValue = {
                    "DisplayConfig": {
                        "Version": defaultVersion,
                        "FilePositionConfig": [
                            {
                                "Position": [
                                    result.CONFIG.UI_CONFIG[0].FILE_LAYOUT[0].POISITION[0]
                                ],
                                "DefaultBottomPixels": [
                                    result.CONFIG.UI_CONFIG[0].FILE_LAYOUT[0].BOTTOM_PX[0]
                                ],
                                "DefaultRightPixels": [
                                    result.CONFIG.UI_CONFIG[0].FILE_LAYOUT[0].RIGHT_PX[0]
                                ],
                                "DefaultInsidePixels": [
                                    "0"
                                ]
                            }
                        ],
                        "DataTableDisplayConfig": [{
                            "ColumnDisplayConfig": []
                        }]
                    }
                }
                _.each(listColumns,function(column){
                    if (fullColumnMap[column.NAME[0]])
                    {
                        rtnValue.DisplayConfig.DataTableDisplayConfig[0].ColumnDisplayConfig.push({
                            "ColumnName": column.NAME[0],
                            "HeaderCaption": fullColumnMap[column.NAME[0]].HEADER[0],
                            "Hidden": column.HIDDEN[0],
                            "ColumnLength": column.LENGTH[0],
                            "Convert": fullColumnMap[column.NAME[0]].CONVERT[0],
                            "Type": fullColumnMap[column.NAME[0]].TYPE[0]
                        })
                    }
                })
                cachemgr.putLRUCache(cached_name,rtnValue);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(rtnValue);
                }else{
                    cache_put_in_callback(configRes);
                    callback(rtnValue);
                }
            }
        );
    }


};



ConfigReader.prototype.getDataCenters = function (callback) {
    var cached_name = "cached_datacenters";
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/libConfig/config/',
            'config_datacenter.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var cached_datacenters = result.CONFIG_DATACENTER;
                cachemgr.putLRUCache(cached_name,cached_datacenters);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(cached_datacenters);
                }else{
                    cache_put_in_callback(configResf);
                    callback(cached_datacenters);
                }
            }
        );
    }
};




ConfigReader.prototype.getDetailDisplayConfig = function(category,callback) {
    var cached_name = "cached_detail_display_config_" + category;

    var cached_datas = cachemgr.getLRUCache(cached_name);
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/libConfig/config/', 'display/' +
            category + '_DISPLAY.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var defaultVersion = result.CONFIG.VERSION[0];
                var columns = result.CONFIG.UI_CONFIG[0].COLUMNS[0].COLUMN;
                var fullColumnMap = {};
                _.each(columns, function(column){
                    fullColumnMap[column.NAME[0]] = column;
                })
                var detailColumnGroups = result.CONFIG.UI_CONFIG[0].DETAIL_COLUMNS[0].COLUMN_GROUP;

                var rtnValue = [];

                _.each(detailColumnGroups, function(column_group){
                    var rtnGroup = {
                        GroupName: column_group.NAME[0],
                        DisplayName: column_group.NAME[0],
                        Columns: []
                    };

                    _.each(column_group.COLUMN, function(column){
                        rtnGroup.Columns.push({
                            ColumnName: column.NAME[0],
                            HeaderCaption: fullColumnMap[column.NAME[0]].HEADER[0],
                            Convert: fullColumnMap[column.NAME[0]].CONVERT[0]
                        })
                    })

                    rtnValue.push(rtnGroup);
                });
                cachemgr.putLRUCache(cached_name,rtnValue);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(rtnValue);
                }else{
                    cache_put_in_callback(configRes);
                    callback(rtnValue);
                }
            }
        );
    }
};



ConfigReader.prototype.getDistinctColumns = function(category,callback){
    var cached_name = "cached_distinct_columns_" + category;
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/libConfig/config/' , 'display/'+
            category + '_DISPLAY.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var rtnValue = [];
                _.each(result.CONFIG.UI_CONFIG[0].DISTINCT_COLUMNS[0].COLUMN, function(item){
                    rtnValue.push({NAME:item.NAME[0], TITLE:item.TITLE[0]});
                });
                cachemgr.putLRUCache(cached_name,rtnValue);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(rtnValue);
                }else{
                    cache_put_in_callback(configRes);
                    callback(rtnValue);
                }
            }
        );
    }
};

ConfigReader.prototype.getTableContextMenuConfig = function(category,callback) {
    var cached_name = "cached_table_contextmenu_config_" + category;
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/libConfig/config/' , 'display/'+
            category + '_DISPLAY.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));

                var columns = result.CONFIG.UI_CONFIG[0].COLUMNS[0].COLUMN;
                var rtnValue = {};
                _.each(columns,function(column){
                    if (column.MENU[0] != "")
                    {
                        rtnValue[column.NAME[0]] = {
                            "Menu": column.MENU[0].split(","),
                            "ADDR_TYPE": column.ADDR_TYPE[0]
                        }
                    }
                })
                cachemgr.putLRUCache(cached_name,rtnValue);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(rtnValue);
                }else{
                    cache_put_in_callback(configRes);
                    callback(rtnValue);
                }
            }
        );
    }
};



ConfigReader.prototype.getGisColumnsConfig = function(category,callback) {
    var cached_name = "cached_gis_columns_config_" + category;
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/libConfig/config/' , 'display/'+
            category + '_DISPLAY.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var columns = result.CONFIG.UI_CONFIG[0].COLUMNS[0].COLUMN;
                var fullColumnMap = {};
                _.each(columns, function(column){
                    fullColumnMap[column.NAME[0]] = column;
                })

                var gisColumns = result.CONFIG.UI_CONFIG[0].GIS_COLUMNS[0].COLUMN;
                var rtnValue = {};

                _.each(gisColumns,function(column){
                    if (fullColumnMap[column.NAME[0]])
                    {
                        rtnValue[column.NAME[0]] = {
                            "ColumnName": column.NAME[0],
                            "HeaderCaption": fullColumnMap[column.NAME[0]].HEADER[0]
                        }
                    }
                })
                cachemgr.putLRUCache(cached_name,rtnValue);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(rtnValue);
                }else{
                    cache_put_in_callback(configRes);
                    callback(rtnValue);
                }
            }
        );
    }
};


ConfigReader.prototype.getNeo4jConfig = function (callback) {


    var cached_name = "cached_neo4j_config";
    var cached_datas = cachemgr.getLRUCache(cached_name)
    if (cached_datas != null) {
        callback(cached_datas);
    } else {
        configmgr.getConfigFile(
            '/business/readcontrol/config/',
            'relationsAnalysis/neo4j-config.xml',
            function(result, cache_put_in_callback) {
                var configRes = JSON.parse(JSON.stringify(result));
                var cached_neo4j_config = {
                    url: result.CONFIG_DATA.URL,
                    port: result.CONFIG_DATA.PORT,
                    name: result.CONFIG_DATA.NMAE,
                    password: result.CONFIG_DATA.PASSWOED
                }
                cachemgr.putLRUCache(cached_name,cached_neo4j_config);
                if(cache_put_in_callback == null){
                    //直接使用
                    callback(cached_neo4j_config);
                }else{
                    cache_put_in_callback(configRes);
                    callback(cached_neo4j_config);
                }
            }
        );
    }
}




ConfigReader.prototype.getRouteConfig = function(file){
    var common_config_file =  "../config/zh/" + file;
    return common_config_file;
};


module.exports = new ConfigReader();