/**
 * Created by Jun on 2016-12-28.
 *
 * 实现公共缓存功能，提供的缓存功能包含三种类型：
 * 1 服务器端缓存，内存机制缓存，当web服务重启后数据丢失
 * 2 浏览器本地缓存，浏览器本地存储
 * 3 浏览器会话缓存，浏览器页面关闭后数据丢失
 *
 */

/**
 * 服务器端缓存
 * cacheMgr.getLRUCache(key)                        //
 * cacheMgr.putLRUCache(key, value)                 //
 * cacheMgr.removeLRUCache(key)                     //
 * cacheMgr.clearLRUCache()                         //
 * cacheMgr.infoLRUCache()                          //
 *
 * 浏览器本地缓存
 * cacheMgr.getLocalStorage(key)                    //
 * cacheMgr.putLocalStorage(key, value)             //
 * cacheMgr.removeLocalStorage(key)                 //
 * cacheMgr.clearLocalStorage()                     //
 *
 * 浏览器会话缓存
 * cacheMgr.getSessionStorage(key)                  //
 * cacheMgr.putSessionStorage(key, value)           //
 * cacheMgr.removeSessionStorage(key)               //
 * cacheMgr.clearSessionStorage()                   //
 *
 */

var cacheLRU = require('../utils/cacheLRU');
var localStorage = null;            // window.localStorage;
var sessionStorage = null;          // window.sessionStorage;

function CacheMgr(){
	cacheLRU.build(0);

	if(typeof(window) !== 'undefined'){
		localStorage = window.localStorage;
		sessionStorage = window.searchRecords;
	}
}

/**
 * 获取localStorage中指定key的value值
 * @param key
 */
CacheMgr.prototype.getLocalStorage = function(key){
	var value = null;

	if(!localStorage)
		value = localStorage.getItem(key);

	if(!value)
		return;
	return JSON.parse(value.toString());
}

/**
 * 将指定的key、value值存放至localStorage中
 * @param key
 * @param value
 */
CacheMgr.prototype.putLocalStorage = function(key, value){
	if(key == undefined || value == undefined)
		return;

	if(localStorage == null)
		return;

	localStorage.setItem(key, JSON.stringify(value));
}

/**
 * 清除localStorage中指定key的数据项
 * @param key
 */
CacheMgr.prototype.removeLocalStorage = function(key){
	if(localStorage == null)
		return;

	localStorage.removeItem(key);
}

/**
 * 清空localStorage中数据项
 */
CacheMgr.prototype.clearLocalStorage = function(){
	if(localStorage == null)
		return;

	localStorage.clear();
}

/**
 * 获取在sessionStorage中存储的指定key的value值
 * @param key
 */
CacheMgr.prototype.getSessionStorage = function(key){
	var value = null;

	if(!sessionStorage)
		value = sessionStorage.getItem(key);

	if(!value)
		return;
	return JSON.parse(value.toString());
}

/**
 * 将给定的key和value值存储到sessionStorage中
 * @param key
 * @param value
 */
CacheMgr.prototype.putSessionStorage = function(key, value){
	if(key == undefined || value == undefined)
		return;

	if(sessionStorage == null)
		return;

	sessionStorage.setItem(key, JSON.stringify(value));
}

/**
 * 删除sessionStorage中指定key值的存储项
 * @param key
 */
CacheMgr.prototype.removeSessionStorage = function(key){
	if(sessionStorage == null)
		return;

	sessionStorage.removeItem(key);
}

/**
 * 清空sessionStorage存储
 */
CacheMgr.prototype.clearSessionStorage = function(){
	if(sessionStorage == null)
		return;

	sessionStorage.clear();
}

/**
 * 获取Web服务器端存储的指定key的value值
 * @param key
 */
CacheMgr.prototype.getLRUCache = function(key){
	return cacheLRU.get(key);
}

/**
 * 将指定key的数据存储到服务端cache中
 * @param key
 * @param value
 */
CacheMgr.prototype.putLRUCache = function(key, value){
	cacheLRU.put(key, value);
}

/**
 * 删除服务端中指定key的存储数据
 * @param key
 */
CacheMgr.prototype.removeLRUCache = function(key){
	cacheLRU.remove(key);
}

/**
 * 清除服务端cache存储数据
 */
CacheMgr.prototype.clearLRUCache = function(){
	cacheLRU.removeAll();
}

/**
 * 服务端cache的相关信息
 */
CacheMgr.prototype.infoLRUCache = function(){
	cacheLRU.info();
}

module.exports = new CacheMgr();
