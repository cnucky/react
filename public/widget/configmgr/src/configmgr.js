/**
 * Created by Jun on 2016-12-09.
 *
 * 实现配置管理功能, 提供功能如下：
 * 1、 对公共配置项的直接读取
 * 2、 应用私有配置的配置读取功能,包括配置文件的读取和配置文件所在目录的读取
 *
 * 注意：在此功能模块中，只完成对公共配置项的读取处理及缓存逻辑，对应用的私有配置
 * 文件只提供读取及处理后的缓存功能，需要将处理后的配置项进行回传进行缓存
 * 请勿将过多的处理逻辑放在此文件中，私有配置项的处理逻辑放在各自的应用中
 */

/**
 *
 * 获取公共配置项函数
 * configmgr.getConfigData()            // 获取配置数据接口，全部数据类型、服务类型的配置
 * configmgr.getTranslationDic()        // 获取翻译字典数据
 * configmgr.getDataCenters()           // 获取系统的数据中心信息
 * configmgr.getSpySystemConfig()       // 获取系统所支持侦控系统的配置信息
 * configmgr.getCarriers()              // 获取运营商信息
 * configmgr.getServiceNames()          // 获取支持服务名称的配置信息
 * configmgr.getApplicationImages()     // 获取应用与图片映射字典信息
 * configmgr.getConfigFile()            // 获取指定路径与名称的配置文件信息
 * configmgr.getConfigFileByDir()       // 获取指定目录下的所有配置文件
 *
 */

var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var cache = require('./../utils/cache.js');
var configRead = require('./../utils/configread');


function ConfigMgr(){

}

/**
 * 获取配置数据接口，
 * 读取config_data.xml公共配置文件，并对读取的配置文件进行处理，cache缓存处理过后的配置项
 * 配置项以 Categories、 Data_type、 Service_Type的层级进行处理
 *
 * @param callback
 */
ConfigMgr.prototype.getConfigData = function(callback){
	var cachedName = 'cached_common_config_data',
	    cachedConfigData = cache.get(cachedName);

	if(cachedConfigData != null)
		callback(cachedConfigData);
	else{
		configRead.readConfigFile('/business/common-config/config/', 'config_data.xml', function(result){
			if(result == ''){
				callback('');
				return;
			}

			var map = {};

			_.each(result.CONFIG_DATA.CATEGORIES, function(category){
				var categoryObject = {
					Name: category.NAME[0],
					Caption: category.CAPTION[0],
					DataTypes: []
				};

				_.each(category.DATA_TYPE, function(dataType){
					var dataTypeObject = {
						Name: dataType.NAME[0],
						Caption: dataType.CAPTION[0],
						ServiceTypes: []
					};

					_.each(dataType.SERVICE_TYPE, function(serviceType){
						dataTypeObject.ServiceTypes.push({
							Name: serviceType.NAME[0],
							Caption: serviceType.CAPTION[0]
						});
					});

					categoryObject.DataTypes.push(dataTypeObject);
				});

				map[categoryObject.Name] = categoryObject;
			});

			cachedConfigData = map;
			cache.put(cachedName, cachedConfigData);
			callback(cachedConfigData);
		});
	}
}


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
ConfigMgr.prototype.getTranslate = function(callback){
	var cachedName = 'cached_common_translate',
	cachedTranslate = cache.get(cachedName);

	if(cachedTranslate != null)
		callback(cachedTranslate);
	else{
		configRead.readConfigFile('/business/common-config/config/', 'config_translate.xml', function(result){
			cachedTranslate = result;
			cache.put(cachedName, cachedTranslate);
			callback(cachedTranslate);
		});
	}
}

/**
 * 获取本地数据中心的相关信息函数
 *
 * @param callback
 */
ConfigMgr.prototype.getDataCenters = function(callback){
	var cachedName = 'cached_common_datacenters',
		cachedDataCenters = cache.get(cachedName);

	if(cachedDataCenters)
		callback(cachedDataCenters);
	else{
		configRead.readConfigFile('/config/', 'config_datacenter.xml', function(result){
			if(result == ''){
				callback('');
				return;
			}

			cachedDataCenters = result.CONFIG_DATACENTER;
			cache.put(cachedName, cachedDataCenters);
			callback(cachedDataCenters);
		});
	}
}

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
ConfigMgr.prototype.getSpySystemConfig = function(callback){
	var cachedName = "cached_common_config_spysystem",
	    cachedConfigSpySystem = cache.get(cachedName);

	if(cachedConfigSpySystem != null)
		callback(cachedConfigSpySystem);
	else{
		configRead.readConfigFile('/business/common-config/config/', 'config_spysystem.xml', function(result){
			cachedConfigSpySystem = result;
			cache.put(cachedName, cachedConfigSpySystem);
			callback(cachedConfigSpySystem);
		});
	}
}


/**
 * 获取运营商相关信息
 *
 * @param callback
 */
ConfigMgr.prototype.getCarriers = function(callback){
	var cachedName = 'cached_common_carriers',
		cachedCarriersInfo = cache.get(cachedName);

	if(cachedCarriersInfo != null)
		callback(cachedCarriersInfo);
	else{
		configRead.readConfigFile('/business/common-config/config/', 'config_carrier.xml', function(result){
			cachedCarriersInfo = result;
			cache.put(cachedName, cachedCarriersInfo);
			callback(cachedCarriersInfo);
		});
	}
}

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
ConfigMgr.prototype.getServiceNames = function(callback){
	var cachedName = 'cached_common_servicenames',
		cachedServiceNames = cache.get(cachedName);

	if(cachedServiceNames != null)
		callback(cachedServiceNames);
	else{
		configRead.readConfigFile('/business/common-config/config/', 'config_servicename.xml', function(result){
			if(result == ''){
				callback('');
				return;
			}

			var rtnValue = {};
			_.each(result.ServiceTypes.ServiceType, function(serviceType){
				if(!rtnValue[serviceType.Name])
					rtnValue[serviceType.Name] = new Array();

				_.each(serviceType.ServiceName, function(serviceName){
					
					rtnValue[serviceType.Name].push({
						name: serviceName.Name[0],
						image: serviceName.IMAGE.length == 0 ? '' : serviceName.IMAGE[0]
					});
				});
			});

			cachedServiceNames = rtnValue;
			cache.put(cachedName, cachedServiceNames);
			callback(cachedServiceNames);
		});
	}
}


/**
 * 提供读读取应用私有配置文件函数接口，只对读取的配置文件进行透传，不对配置数据进行处理，
 * 外部调用函数处理数据后需进行回调以进行处理数据后的缓存
 *
 * 使用方法：
 * configMgr.getConfigFile('/business/mobilearchive/config/', 'config.xml', function(result, callback(){
 *     //第一次读取需要进行原始配置数据的处理，否则直接从缓存中读取处理好的配置项
 *     if(callback != null && _.isFunction(callback)){
 *          //配置文件数据处理，结果为 rtnValue
 *
 *          callback(rtnValue);
 *     }
 *
 *     //其他处理逻辑
 * }))
 *
 * @param filePath  应用私有配置路径
 * @param fileName  应用私有配置文件名称
 * @param callback  回调函数，用于第一次读取时存储已经处理过的数据，后续读取时直接从缓存中读取处理过的数据，为null
 */
ConfigMgr.prototype.getConfigFile = function(fileDir, fileName, callback){
	var configFileKey = path.join(fileDir, path.basename(fileName, path.extname(fileName))),
		cachedConfigData = cache.get(configFileKey);

	if(cachedConfigData != null)
		callback(cachedConfigData);
	else{
		configRead.readConfigFile(fileDir, fileName, function(result){
			cache.put(configFileKey, result);
			callback(result);
		});
	}
}

/**
 * 读取指定目录下的所有配置文件，并对处理后的配置文件进行缓存
 *
 *
 * @param fileDir
 * @param callback
 */
ConfigMgr.prototype.getConfigFileByDir = function(fileDir, dirname, callback){
	var configDirKey = path.join(fileDir, '/'),
		cachedConfigData = cache.get(configDirKey);

	if(cachedConfigData != null)
		callback(cachedConfigData);
	else{
		configRead.readConfigDir(configDirKey, dirname, function(fileList){
			cache.put(configDirKey, fileList);
			callback(fileList);
		});
	}
}

/**
 * 获取配置文件的完整路径
 * @param filePath
 * @param fileName
 * @returns {string}
 */
ConfigMgr.prototype.getRouteConfig = function(filePath, fileName){
	return configRead.readFilePath(filePath, fileName);
};

module.exports = new ConfigMgr();


















