var _ = require('underscore');
var Q = require('q');
var soap = require('soap');
// var iconv = require('iconv').Iconv;
var Code = require('./code');
var colors = require('colors');
var logger= require('./routeLogger').logger('jws');

function jws(url, method, args, callback, req, res) {
    function addLog(req, message, level) {
        req._novaLogs.push({
            level: level || 'info',
            message: message
        });
        if (!logger[level]) {
            logger.info(message);
            return;
        }
        switch (level){
            case 'info' :
                logger.info(message);
                break;
            case 'error':
                logger.error(message);
                break;
            case 'debug':
                logger.debug(message);
                break;
            case 'warn':
                logger.warn(message);
                break;
            default :
                logger.info(message);
                break;
        }
    }


    function showlog() {
    }

    callback = _.isFunction(callback) ? callback : null;
    addLog(req, '++++++++++++ ' + method + ' start ++++++++++++');
    addLog(req, 'Url: ' + url);
    return Q.Promise(function(resolve, reject) {
        // (callback || resolve)({code: 0, data: 'testss'});
        var options = {
            ignoredNamespaces: {
                namespaces:['targetNamespace','typedNamespace'],
                override:true
            }
        }
        soap.createClient(url, options, function(err, client) {
            // console.log(err);
            if (err) {
                (callback || reject)({
                    code: Code.SERVICE_ERROR,
                    message: err.toString()
                });
                addLog(req, err, 'error');
                return showlog();
            }
            args = args || {};
            var generalArgument = req.generalArgument;
            if (!_.isFunction(client[method])) {
                var errmsg = '函数[' + method + ']不存在';
                (callback || reject)({
                    code: Code.OPERATION_ERROR,
                    message: errmsg
                });
                addLog(req, errmsg, 'error');
                return showlog();
            }

            client[method]({
                jsonArg: JSON.stringify(args),
                generalArgument: JSON.stringify(generalArgument)
            }, function(err, result) {
                addLog(req, 'Args: ' + JSON.stringify(args));
                addLog(req, 'GeneralArgument: ' + JSON.stringify(generalArgument));
                if (err) {
                    addLog(req, 'Error: ' + err.toString(), 'error');
                    if (err.response && err.response.body) {
                        addLog(req, 'Response: ' + err.response.body, 'error');
                    }
                } else {
                    var code = JSON.parse(result[method + 'Return']).code;
                    if (code == 0) {
                        addLog(req, 'Result:  ' + JSON.stringify(result));
                    } else {
                        addLog(req, 'request failed with code: ' + code + '\r\n'
                            + 'Result:    ' + JSON.stringify(result), 'error');
                    }
                }
                addLog(req, '------------ '  + method + '   end ------------');

                if (err) {
                    (callback || reject)({
                        code: Code.OPERATION_ERROR,
                        message: err.toString()
                    });
                    return showlog();
                }
                var data = getData(result);
                if (_.isEmpty(data)) {
                    (callback || reject)({
                        code: Code.INVALID_RESPONSE,
                        message: '服务器返回数据不正确'
                    });
                } else {
                    if (callback) {
                        callback(data);
                    } else {
                        data.code == 0 ? resolve(data) : reject(data);
                    }
                }

            });
        });
        showlog();
    });
}

function getData(result) {
    var data = null;
    // delete result['attributes'];
    // if (_.isObject(result)) {
    //     _.each(result, function(value, key) {
    //         if (_.isObject(value) && !_.isEmpty(value['$value'])) {
    //             try {
    //                 var buf = new Buffer(value['$value']);
    //                 // var content = new iconv('gb2312', 'UTF8').convert(buf).toString()
    //                 var content = buf.toString();
    //                 data = JSON.parse(content);
    //             } catch (e) {}
    //         }
    //         if (data) {
    //             return true;
    //         }
    //     });
    // }
    _.each(result, function(value) {
        if (!_.isEmpty(value)) {
            try {
                data = JSON.parse(value);
            } catch (e) {}
            if (data) {
                return true;
            }
        }
    });
    return data;
}

module.exports = jws;
