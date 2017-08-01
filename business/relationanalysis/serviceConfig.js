var config = require('./config');

module.exports = {
    personcore: { role: 'dc-analysis', url: '/CloudPersonCore/services/PersonCoreService?wsdl'},
    relationgraph: { role: 'dc-analysis', url: '/CloudGraphAnalysis/services/RelationGraphService?wsdl'},
    personrelationexplore: { role: 'dc-analysis', url: '/PersonRelationExplore/services/PersonRelationExploreService?wsdl'},
    taskcommon: { role: 'dc-analysis', url: '/CloudTaskCommon/services/TaskCommonService?wsdl'},
    tag: { role: 'dc-analysis', url: '/DataTag_Service/services/DataTagService?wsdl'}
}