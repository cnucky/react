var config = require('./config');

module.exports = {
    taskcommon: { role: 'dc-analysis', url: '/CloudTaskCommon/services/TaskCommonService?wsdl'},
    importbatch: { role: 'dc-analysis', url: '/DI_WS/services/DataImportBatch?wsdl'},
    relationgraph: { role: 'dc-analysis', url: '/CloudGraphAnalysis/services/RelationGraphService?wsdl'},
    smartquery: { role: 'dc-analysis', url: '/CloudTaskCommon/services/IntelligentQueryService?wsdl'}
}