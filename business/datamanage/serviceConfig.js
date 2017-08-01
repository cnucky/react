var config = require('./config');

module.exports = {
    dataimport: { role: 'dc-analysis', url: '/DI_WS/services/DataImportService?wsdl'},
    importbatch: { role: 'dc-analysis', url: '/DI_WS/services/DataImportBatch?wsdl'},
    dataLink: { role: 'dc-analysis', url: '/DI_WS/services/DataLinkService?wsdl'},
}