var config = require('./config');

module.exports = {
	echart:{role:'dc-analysis',url:'/CloudAlertReport/services/EChartService?wsdl'},
	taskrule:{role:'dc-analysis',url:'/CloudAlertReport/services/TaskRuleService?wsdl'},
	taskresult:{role:'dc-analysis',url:'/CloudAlertReport/services/TaskResultService?wsdl'},
	report:{role:'dc-analysis',url:'/CloudAlertReport/services/ReportService?wsdl'},
	billdetail:{role:'dc-analysis',url:'/CloudAlertReport/services/BillDetailService?wsdl'},
	personRelationService:{role:'dc-analysis',url:'/PersonRelationExplore/services/PersonRelationExploreService?wsdl'},
}