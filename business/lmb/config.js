var _ = require('underscore');
var config = require('../../config/config');
var configValue;

configValue = {
    "ServiceRoot": "../lmb/lmbservice/",
    "MapServer": "/smartquery/tileMap?hostname=gis-server.jz&x={x}&y={y}&z={z}",
    "renHost": ".."
}

_.each(_.keys(config), function (itemKey) {
    if (configValue[itemKey] != undefined) return;
    configValue[itemKey] = config[itemKey];
});

module.exports = configValue;