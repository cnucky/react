var config = require('./config');

module.exports = {
    taskcommon: { role: 'dc-analysis', port:'8080',url: '/CloudTaskCommon/services/TaskCommonService?wsdl'},
    tactics: { role: 'dc-analysis', port:'8080',url: '/CloudTaskCommon/services/TacticsService?wsdl'},
}