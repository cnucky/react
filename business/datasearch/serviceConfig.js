module.exports = {
	searchTemplate: { role: 'app-analysis', url: '/MiddleService/services/QueryTemplateService?wsdl' },
	authorization: { role: 'app-common', url: '/CloudAuthorization/services/CloudAuthorizationService?wsdl' },
	taskcommon: { role: 'dc-analysis', url: '/CloudTaskCommon/services/TaskCommonService?wsdl'},
	taskManage: { role: 'app-common', url: '/TaskManage/services/TaskManageService?wsdl'}
}