var Q = require('q');
var $ = require('jquery');

function makeRetryGet(url, params) {
    var defer = Q.defer();

    function request() {
        $.getJSON(url, params, function(rsp) {
            if (rsp.code == 0) {
                defer.resolve(rsp.data);
            }else {
                defer.reject(rsp.data);
            }
        });
    }
    request();
    return defer.promise;
}

function makePost(url, params) {
    var defer = Q.defer();
    $.post(url, params, function(rsp) {
        rsp = JSON.parse(rsp);
        if (rsp.code == 0) {
            defer.resolve(rsp.data);
        } else {
            defer.reject(rsp.data);
        }
    });
    return defer.promise;
}

function getCategories(){
    return makeRetryGet('/appstore/getCategories');
}

function getAppsByCategory(category){
    return makeRetryGet('/appstore/getAppsByCategory',{
        category: category
    });
}

function getAllApps(){
    return makeRetryGet('/appstore/getAllApps',{
    });
}

function addAppToDesktop(appId){
    return makeRetryGet('/appstore/addAppToDesktop',{
        appId: appId
    });
}

function delAppFromDesktop(appId){
    return makeRetryGet('/appstore/delAppFromDesktop',{
        appId: appId
    });
}

function queryPreference(name){
    return makeRetryGet('/workspacedir/queryPreference',{
        name: name
    });
}

function updateAppDownloads(appIds){
    return makePost('/appstore/updateAppDownloads',{
        appIds: appIds
    });
}



module.exports = {
    getCategories : getCategories,
    getAppsByCategory : getAppsByCategory,
    getAllApps : getAllApps,
    addAppToDesktop : addAppToDesktop,
    delAppFromDesktop : delAppFromDesktop,
    queryPreference : queryPreference,
    updateAppDownloads : updateAppDownloads
};