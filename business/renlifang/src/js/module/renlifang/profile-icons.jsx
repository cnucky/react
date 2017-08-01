const DEFAULT_CLS = "fa fa-table";
const ICON_CLS = {
	"基本信息": "fa fa-user",
	"个人履历": "fa fa-trophy",
	"社会组织": "fa fa-sitemap",
	"参与事件": "fa fa-tasks",
	"附件信息": "fa fa-paperclip",
	"实体拓扑": "fa fa-credit-card",
	"身份信息": "fa fa-credit-card",
	"手机信息": "glyphicon glyphicon-phone",
	"银行账户": "fa fa-money",
	"网络账号": 'fa fa-globe',
	"护照信息": "fa fa-list-alt",
	"车辆信息": "fa fa-truck",
	"关系总览": "fa fa-table",
	"电话通联": "fa fa-phone",
	"通讯录": "fa fa-link",
	"QQ": "fa fa-qq",
	"同行人": "fa fa-train",
	"同订票": "fa fa-ticket",
	"同地址": "fa fa-map-marker",
	"家庭成员": "fa fa-home",
	"同组织": "fa fa-group",
	"同事件": "fa fa-server",
};

function getIconCls(key) {
    return ICON_CLS[key] || DEFAULT_CLS;
}


const DEFAULT_SUMMARY = "fa fa-table";
const ICON_SUMMARY = {
	"SFZ": "fa fa-credit-card",
	"USER_MSISDN": "glyphicon glyphicon-phone",
	"银行账户": "fa fa-money",
	"网络账号": 'fa fa-globe',
	"护照信息": "fa fa-list-alt",
	"QQ": "fa fa-qq",
};
function getIconSummary(key) {
	return ICON_SUMMARY[key] || DEFAULT_SUMMARY;
}

module.exports  = {
	getIconCls: getIconCls,
	getIconSummary:getIconSummary

};