var config = require('./config');

module.exports = {
	smartquery: { role: 'dc-analysis', url: '/CloudTaskCommon/services/IntelligentQueryService?wsdl'},
	udpFileService: { role: 'dc-analysis', url: '/UDP_WS/services/UdpFileService?wsdl'},
	taskcommon: { role: 'dc-analysis', url: '/CloudTaskCommon/services/TaskCommonService?wsdl'},
}