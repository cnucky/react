const Q = require('q');
const $ = require('jquery');
const _ = require('underscore');
// import {functionList} from './conf-function-list.jsx';

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

//permissions tree data has been pre-processed in route funcs
function getPermissions(){
    return tryGet('/configcenter/getPermissions');
}

function filterPermissions(validPermission){
    getPermissions().then((rsp) => {

    });
}




// module.exports = {
//     getPermissions : getPermissions,
// };
export {getPermissions};