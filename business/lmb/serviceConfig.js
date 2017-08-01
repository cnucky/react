var config = require('./config');

module.exports = {
	echartService:{role:'dc-analysis',url:'/CloudAlertReport/services/EChartService?wsdl'},
	taskRuleService:{role:'dc-analysis',url:'/CloudAlertReport/services/TaskRuleService?wsdl'},
	taskresultService:{role:'dc-analysis',url:'/CloudAlertReport/services/TaskResultService?wsdl'},
	//report:{role:'dc-analysis',url:'/CloudAlertReport/services/ReportService?wsdl'},
	//billdetail:{role:'dc-analysis',url:'/CloudAlertReport/services/BillDetailService?wsdl'},
	personRelationService:{role:'dc-analysis',url:'/PersonRelationExplore/services/PersonRelationExploreService?wsdl'},
	datatagService:{role:'dc-analysis',url:'/DataTag_Service/services/DataTagService?wsdl'},
	enemyaccumulationService:{role:'dc-analysis', url:'/EnemyAccumulation/services/EnemyAccumulationService?wsdl'},
	personExternalService:{role:'dc-analysis',url:'/CloudPersonCoreProxyAgent/services/PersonCoreExternalQueryProxy?wsdl'}
}