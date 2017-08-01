var $ = require("jquery");
var Dialog = require('nova-dialog');
var BootboxDialog = require('nova-bootbox-dialog');
var store = require('./model-apply-store');
var Theme = require('./Theme');
var utils=require('nova-utils');
var modelId=utils.getURLParameter('modelid');
var loadTree=require('./modelapply-manager').loadTree;



function replace_store(id) {
	switch(id) {
		case '1':
			store.dispatch({
				type: 'REPLACE_VIEWDERAIL',
				viewDetail: {
						components: [
							{
								identity: 1,
								type: 'string',
								opacity: '1',
								isSelected: false,
								display:'none',
								border:'1px solid transparent',
								size: "100%",
								condition: {
									selectData:[],           /**选中的数据**/
									title: "",
									field: [],
									value:'',
									opr: "",
									hint: "",
									isRequired: false,
									hideOpr: true
								}
							}
						],

					}
			});
			break;
		default:
			break;
	}
}


function select() {
	var id = $(this).attr("data-id");
	var components = store.getState().data.viewDetail.components;

	if(components.length > 0)
		BootboxDialog.confirm("选择模板将丢失当前表单，是否确定？", function() {
			replace_store(id);

		});
	else {
		replace_store(id);
		Dialog.dismiss();
	}
}

module.exports.show = function() {
	Dialog.build({
		title: "选择模板",
		width: 800,
		minHeight: 200,
		hideFooter: true,
		content: content
	}).show(function() {
		$('.templete').click(select);
	});
};
module.exports.replace_store = replace_store;