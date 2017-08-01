/**
 * Created by Jun on 2017-01-13.
 */

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');

var baseDirPath = path.join(process.cwd(), './');

function ConfigRead(){

}

/**
 * 读取指定路径的配置文件内容
 *
 * @param filename
 * @param callback
 */
ConfigRead.prototype.readConfigFile = function(configDir, fileName, callback){

	if(configDir == undefined || fileName == undefined || configDir === '' || fileName === ''){
		console.log('配置文件读取失败: 配置文件为空或文件名为空！');
		callback('');
	}

	var configFile = getConfigFileName(configDir, fileName);
	var filePath = path.join(baseDirPath, configFile),
		exist = fs.existsSync(filePath);
	if(exist){
		var fileData = fs.readFileSync(filePath, {encoding: 'utf-8'});

		xml2js.parseString(fileData, {
			mergeAttrs: true
		}, function(err, result){
			if(err)
				console.log('配置文件读取失败');
			callback(result);
		});
	}else{
		console.log('配置文件' + filename + '不存在!');
		callback('');
	}
}

/**
 *
 * @param configDir
 * @param fileName
 * @returns {*}
 */
ConfigRead.prototype.readFilePath = function(configDir, fileName){
	if(configDir == undefined || fileName == undefined || configDir === '' || fileName === ''){
		console.log('配置文件路径为空！');
		return '';
	}

	var configFile = getConfigFileName(configDir, fileName);
	return path.join(baseDirPath, configFile);
}

/**
 * 从指定目录下读取该目录下的所有配置文件
 *
 * @param filePath
 * @param callback
 */
ConfigRead.prototype.readConfigDir = function(configDirKey, dirName, callback){

	var configPath = getConfigFileName(configDirKey, dirName);

	var comparePath = configPath + '/',
		filepath = path.join(baseDirPath, configPath),
		files = fs.readdirSync(filepath),
		file_list = [];

	parseXmlFiles(files, file_list, 0, comparePath, callback);
}

/**
 *
 *
 * @param files
 * @param fileList
 * @param index
 * @param comparePath
 * @param callback
 */
function parseXmlFiles(files, fileList, index, comparePath, callback){
	var fileName = files[index];
	var filePath = path.join(baseDirPath, comparePath + files[index]);
	var exist = fs.existsSync(filePath);

	index ++;
	if(exist){
		var fileData = fs.readFileSync(filePath, {encoding: 'utf-8'});
		xml2js.parseString(fileData, {
			mergeAttrs: true
		}, function(err, result){
			if(err)
				console.log('读取配置文件' + filepath + '失败');
			fileList.push({
				filename: fileName,
				filecontent: result
			});
		});
	}else
		console.log('配置文件' + filepath + '不存在');

	if(files.length == index)
		callback(fileList);
	else
		parseXmlFiles(files, fileList, index, comparePath, callback);
}

/**
 * 根据文件路径、文件名称获取文件的详细地址
 * @param filepath
 * @param filename
 * @returns {string}
 */
function getConfigFileName(filePath, fileName){
	var configFile = filePath + fileName;

	if(fs.existsSync(path.join(baseDirPath, configFile)))
		return configFile;

	configFile = filePath + 'zh/' + fileName;
	if(fs.existsSync(path.join(baseDirPath, configFile)))
		return configFile;

	configFile = filePath + 'en/' + fileName;
	if(fs.existsSync(path.join(baseDirPath, configFile)))
		return configFile;

	return '';
}


var by = function(name){
	return function(o, p){
		if(typeof o === 'object' && typeof p === 'object' && o && p){
			a = o[name];
			b = p[name];
			if( a === b) return 0;
			if(typeof a === typeof b) return a < b ? -1 : 1;
			else throw('error');
		}
	}
}

module.exports = new ConfigRead();
