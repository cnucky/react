/**
 * Created by root on 3/14/17.
 */

/**
 *
 * 获取公共配置项函数
 * getConfigData()            // 获取配置数据接口，全部数据类型、服务类型的配置
 * getTranslationDic()        // 获取翻译字典数据
 * getDataCenters()           // 获取系统的数据中心信息
 * getSpySystemConfig()       // 获取系统所支持侦控系统的配置信息
 * getCarriers()              // 获取运营商信息
 * getServiceNames()          // 获取支持服务名称的配置信息
 * getApplicationImages()     // 获取应用与图片映射字典信息
 * getConfigFile()            // 获取指定路径与名称的配置文件信息
 * getConfigFileByDir()       // 获取指定目录下的所有配置文件
 *
 */

var _ = require('underscore');
var xml2js = require('xml2js');
var path = require('path');
var config_system = require(path.join(process.cwd(), './utils/config-system.js'));

// var commonConfigApi = require('../jws/commonConfig');
var config_system;
var commonConfigApi = require('../jws/commonConfig');
var cache = require(path.join(process.cwd(), './public/widget/cachemgr/src/cachemgr'));
var language = config_system.get_language();

function CommonConfig() {

}

function xml_to_js(fileContent, callback) {
    xml2js.parseString(fileContent, {
        mergeAttrs: true
    }, function (err, result) {
        if (err) {
            callback("");
        }
        else {
            callback(result);
        }

    });
}

function parseXmlFiles(files, fileList, index, callback) {
    var file = files[index];
    var fileName = file.fileName;
    var fileContent = file.fileContent;

    index++;
    xml2js.parseString(fileContent, {
        mergeAttrs: true
    }, function (err, result) {
        if (err) {
            fileList.push({
                filename: fileName,
                filecontent: ""
            });
        }
        else {
            fileList.push({
                filename: fileName,
                filecontent: result
            });
        }

    });

    if (files.length == index)
        callback(fileList);
    else
        parseXmlFiles(files, fileList, index, callback);
}

function commonConfigServer(req, fileName, callback) {
    commonConfigApi(req).getConfigContent({
            "configName": fileName,
            "configLanguage": language,
            "configContent": ""
        },
        function (rsp) {
            callback(rsp);
        }
    );
}

_.extend(CommonConfig.prototype, {
    /**
     * 获取本地数据中心的相关信息函数
     * 读取config_datacenter.xml公共配置文件，并对读取的配置文件进行处理，cache缓存处理过后的配置项
     * @param callback
     */
    getDataCenters: function (req, callback) {
        var fileName = "config_datacenter.xml";
        var cachedName = 'cached_common_' + fileName;
        var cachedData = cache.getLRUCache(cachedName);

        if (cachedData != null)
            callback(cachedData);
        else {
            commonConfigServer(req, fileName, function (rsp) {
                if (rsp.code == 0) {
                    xml_to_js(rsp.data.configContent[0].fileContent, function (result) {
                        var datacenter = result.CONFIG_DATACENTER;

                        _.each(datacenter.DATA_AREA, function(data_area, i){
                            var area_code = data_area.AREA_CODE[0];
                            _.each(data_area.DATA_SYSTEM, function(data_system, j){
                                _.each(data_system.FRONT_GROUP, function(front_group, k){
                                    var front_code = front_group.CODE[0];
                                    datacenter.DATA_AREA[i].DATA_SYSTEM[j].FRONT_GROUP[k].CODE[0] = area_code + "_" + front_code;
                                });
                            });
                        });

                        cachedData = datacenter;
                        cache.putLRUCache(cachedName, cachedData);
                        callback(cachedData);
                    })
                }
                else {
                    callback("");
                }
            });
        }
    },

    /**
     * 获取配置数据接口，
     * 读取config_data.xml公共配置文件，并对读取的配置文件进行处理，cache缓存处理过后的配置项
     * 配置项以 Categories、 Data_type、 Service_Type的层级进行处理
     *
     * @param callback
     */
    getConfigData: function (req, callback) {
        var fileName = "config_data.xml";
        var cachedName = 'cached_common_' + fileName;
        var cachedData = cache.getLRUCache(cachedName);

        if (cachedData != null)
            callback(cachedData);
        else {
            commonConfigServer(req, fileName, function (rsp) {
                if (rsp.code == 0) {
                    xml_to_js(rsp.data.configContent[0].fileContent, function (result) {
                        var map = {};

                        _.each(result.CONFIG_DATA.CATEGORIES, function (category) {
                            var categoryObject = {
                                Name: category.NAME[0],
                                Caption: category.CAPTION[0],
                                DataTypes: []
                            };

                            _.each(category.DATA_TYPE, function (dataType) {
                                var dataTypeObject = {
                                    Name: dataType.NAME[0],
                                    Caption: dataType.CAPTION[0],
                                    ServiceTypes: []
                                };

                                _.each(dataType.SERVICE_TYPE, function (serviceType) {
                                    dataTypeObject.ServiceTypes.push({
                                        Name: serviceType.NAME[0],
                                        Caption: serviceType.CAPTION[0]
                                    });
                                });

                                categoryObject.DataTypes.push(dataTypeObject);
                            });

                            map[categoryObject.Name] = categoryObject;
                        });
                        cachedData = map;
                        cache.putLRUCache(cachedName, cachedData);
                        callback(cachedData);
                    })
                }
                else {
                    callback("");
                }
            });
        }
    },

    /**
     * 获取翻译字典信息
     * 读取translate.xml公共配置文件，并对数据进行处理后存放在缓存中
     *
     * 使用方法：
     * configMgr.getTranslationDic(function(result){
     *
     *      result['DIC_SERVICE_TYPE_RADIUS']['RADIUS']   //
     *
     * })
     *
     * @param callback
     */
    getTranslate: function (req, callback) {
        var fileName = "config_translate.xml";
        var cachedName = 'cached_common_' + fileName;
        var cachedData = cache.getLRUCache(cachedName);

        if (cachedData)
            callback(cachedData);
        else {
            commonConfigServer(req, fileName, function (rsp) {
                if (rsp.code == 0) {
                    xml_to_js(rsp.data.configContent[0].fileContent, function (result) {
                        cachedData = result;
                        cache.putLRUCache(cachedName, cachedData);
                        callback(cachedData);
                    })
                }
                else {
                    callback("");
                }
            });
        }
    },

    /**
     * 获取当前系统的所有侦控系统配置信息
     *
     * 使用方法：
     *   configMgr.getSpySystemConfig(function(result){
     *       result.CONFIG_SPYSYSTEM.AREAS[0].***           //中心信息
     *       result.CONFIG_SPYSYSTEM.SYSTEMS[0].***         //侦控系统信息
     *       result.CONFIG_SPYSYSTEM.SPY_FORMS[0].***       //布控表单信息
     *       result.CONFIG_SPYSYSTEM.APPROVAL_FORMS[0].***    //审批表单信息
     *   });
     *
     * @param callback 获取配置数据后的回调处理函数
     */
    getSpySystemConfig: function (req, callback) {
        var fileName = "config_spysystem.xml";
        var cachedName = 'cached_common_' + fileName;
        var cachedData = cache.getLRUCache(cachedName);

        if (cachedData)
            callback(cachedData);
        else {
            commonConfigServer(req, fileName, function (rsp) {
                if (rsp.code == 0) {
                    xml_to_js(rsp.data.configContent[0].fileContent, function (result) {
                        cachedData = result;
                        cache.putLRUCache(cachedName, cachedData);
                        callback(cachedData);
                    })
                }
                else {
                    callback("");
                }
            });
        }
    },

    /**
     * 获取运营商相关信息
     * 读取config_carrier.xml公共配置文件，并对读取的配置文件进行处理，cache缓存处理过后的配置项
     * @param callback
     */
    getCarriers: function (req, callback) {
        var fileName = "config_carrier.xml";
        var cachedName = 'cached_common_' + fileName;
        var cachedData = cache.getLRUCache(cachedName);

        if (cachedData)
            callback(cachedData);
        else {
            commonConfigServer(req, fileName, function (rsp) {
                if (rsp.code == 0) {
                    xml_to_js(rsp.data.configContent[0].fileContent, function (result) {
                        var carrar_datas = [];
                        _.each(result.CONFIG_DATA.CARRIER, function (carrer) {
                            carrar_datas.push({key: carrer.CODE[0], value: carrer.NAME[0]})
                        });

                        cachedData = carrar_datas;
                        cache.putLRUCache(cachedName, cachedData);
                        callback(cachedData);
                    })
                }
                else {
                    callback([]);
                }
            });
        }
    },

    /**
     * 获取当前系统支持的serviceName
     *
     * 使用方法：
     * configMgr.getServiceNames(function(result){
     *
     *      result["IM"]  //
     *
     * })
     *
     * @param callback
     */
    getServiceNames: function (req, callback) {
        var fileName = "config_servicename.xml";
        var cachedName = 'cached_common_' + fileName;
        var cachedData = cache.getLRUCache(cachedName);

        if (cachedData)
            callback(cachedData);
        else {
            commonConfigServer(req, fileName, function (rsp) {
                if (rsp.code == 0) {
                    xml_to_js(rsp.data.configContent[0].fileContent, function (result) {
                        if (result == '') {
                            callback('');
                            return;
                        }

                        var rtnValue = {};
                        _.each(result.ServiceTypes.ServiceType, function (serviceType) {
                            if (!rtnValue[serviceType.Name])
                                rtnValue[serviceType.Name] = new Array();

                            _.each(serviceType.ServiceName, function (serviceName) {

                                rtnValue[serviceType.Name].push({
                                    name: serviceName.Name[0],
                                    image: serviceName.IMAGE.length == 0 ? '' : serviceName.IMAGE[0]
                                });
                            });
                        });

                        cachedData = rtnValue;
                        cache.putLRUCache(cachedName, cachedData);
                        callback(cachedData);
                    })
                }
                else {
                    callback("");
                }
            });
        }
    },

    getConfigFile: function (fileName, req, callback) {
        var cachedName = 'cached_common_' + fileName;
        var cachedData = cache.getLRUCache(cachedName);

        if (cachedData)
            callback(cachedData);
        else {
            commonConfigServer(req, fileName, function (rsp) {
                if (rsp.code == 0) {
                    xml_to_js(rsp.data.configContent[0].fileContent, function (result) {
                        cachedData = result;
                        cache.putLRUCache(cachedName, cachedData);
                        callback(cachedData);
                    })
                }
                else {
                    callback("");
                }
            });
        }
    },

    getConfigFileByDir: function (fileDir, req, callback) {
        var cachedName = 'cached_common_' + fileDir;
        var cachedData = cache.getLRUCache(cachedName);

        if (cachedData != null)
            callback(cachedData);
        else {
            commonConfigServer(req, fileDir, function (rsp) {
                if (rsp.code == 0) {
                    var files = rsp.data.configContent;
                    var file_list = [];
                    parseXmlFiles(files, file_list, 0, function (result) {
                        cachedData = result;
                        cache.putLRUCache(cachedName, cachedData);
                        callback(cachedData);
                    });
                }
                else {
                    callback([]);
                }
            });
        }
    }
});

module.exports = new CommonConfig();