var config = require('./config');

module.exports = {
    personcore: { role: 'dc-analysis', port:"8080", url: '/CloudPersonCore/services/PersonCoreService?wsdl'},
    taskcommon: { role: 'dc-analysis', port:"8080",url: '/CloudTaskCommon/services/TaskCommonService?wsdl'},
    tag: { role: 'dc-analysis', port:"8080",url: '/DataTag_Service/services/DataTagService?wsdl'},
    businessCommon: { role: 'app-common', port:"8080",url: '/BusinessCommon/services/HolographicFileService?wsdl'},
    holographic: { role: 'app-common', port:"8080",url: '/BusinessCommon/services/HolographicFileService?wsdl'},
    businesslib: { role: 'app-common', port:"8080",url: '/BusinessLib/services/BusinessLibService?wsdl'},
}
