const Q = require('q');
const $ = require('jquery');
const _ = require('underscore');

function tryGet(url, params) {
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
function tryPost(url, data) {
    var defer = Q.defer();
    function request() {
        $.post(url, data, function(rsp) {
            const rspParsed = JSON.parse(rsp);
            if (rspParsed.code == 0) {
                defer.resolve(rspParsed);
            }else {
                defer.reject(rspParsed);
            }
        });
    }
    request();
    return defer.promise;
}

function getConfigList(){
    return tryGet('/configcenter/getConfigList');
}

function updateConfigItems(data){
    return tryPost('/configcenter/updateConfigItems',data);
}

export {getConfigList,updateConfigItems};