//路由层日志记录,日志配置从log4js.json读取
var log4route = require('log4js');
var fs = require('fs');
var logConfigObj = JSON.parse(fs.readFileSync('log4js.json', 'utf8'));
log4route.configure(logConfigObj);

var path = require("path");

var logPath = logConfigObj.appenders[0].filename;

if (!fs.existsSync(logPath)) {
    mkdirsSync(logPath);
}

//初次运行时目录不存在，递归创建目录
function mkdirsSync(dirname, mode){
    if(fs.existsSync(dirname)) {
        return true;
    }else if(mkdirsSync(path.dirname(dirname), mode)){
        fs.mkdirSync(dirname, mode);
        return true;
    }
}

exports.logger = function(category){
    var routeLogger = log4route.getLogger(category);
    routeLogger.setLevel(logConfigObj['defaultLogLevel']);
    return routeLogger;
}





















