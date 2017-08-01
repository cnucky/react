var _ = require('underscore'),
    config = require('../config/config'),
    configValue;

configValue = {
    "messageServerIp": "app-common.jz",
    "gisServer": "http://gis-server.jz",
    "uploadFilePath": "preprocess-name",
    "acUploadFilePath": "struct-name.jz",
    "reportURL": "http://dxxtra-server.jz:7250/DefaultTable.aspx?",
    "smartQueryFirstBatchResult": "100",
    "systemCenterAuthable": "0",
    "spyIntegrationAuthable" : "1",
    "uploadBaTablePath": "/tmp",
    "uploadType": 'WeedFS',
    "faultPlatformIp": "http://app-common.jz:8080/cynthia/",
    "wikiSearchIp": "http://95.10.205.243:6505"
}

_.each(_.keys(config), function(itemKey){
    if(configValue[itemKey] != undefined) return;

    configValue[itemKey] = config[itemKey];
});

module.exports = configValue;

