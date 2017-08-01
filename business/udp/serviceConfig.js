var config = require('./config');

module.exports = {
	udp: { role: 'dc-analysis', url: '/UDP_WS/services/UdpSearchService?wsdl'},
    udpTextLibService: { role: 'dc-analysis', url: '/UDP_WS/services/UdpTextLibService?wsdl'},
    udpFileService: { role: 'dc-analysis', url: '/UDP_WS/services/UdpFileService?wsdl'},
	businesscommon: { role: 'app-common', url: '/BusinessCommon/services/BusinessCommonService?wsdl'},
    businesslib: { role: 'app-common', url: '/BusinessLib/services/BusinessLibService?wsdl'},
    importbatch: { role: 'dc-analysis', url: '/DI_WS/services/DataImportBatch?wsdl'},

}