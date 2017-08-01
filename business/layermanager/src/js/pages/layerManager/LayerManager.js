 initLocales(require.context('../../../locales/gismodule/', false, /\.js/));
require(['../../module/Layermanager/defineFancyTree',
	'nova-utils'
	// '../../../../config.js',
	//'lib/jquery-ui.js',
	//'../../js-components/LayerManager/jquery-migrate-1.2.1.min.js',
	//'../../js-components/LayerManager/jquery.tmpl.min.js',
	//'../../js-components/LayerManager/jquery.ui-contextmenu.min.js',
	//'../../js-components/fancytree/jquery.fancytree-all.js',
	//'utility/select2/select2.min.js',
	//'../../js-components/datatables/jquery.dataTables.js',
	//'../../js-components/LayerManager/DT_bootstrap.js',
	//'../../js-components/LayerManager/my-table-editable.js',
	//'../../js-components/LayerManager/ajaxfileupload.js',
	//'../../js-components/LayerManager/nova-dialog.js'
], function(defineFancyTree,utils) {
	var config = window.__CONF__.business.layermanager;
    var _pageConfig = {
        title: i18n.t('gismodule.LayerManager.title')
    };
    var opt={};
	opt.userID=utils.getCookiekey('userid');;
	var ip=config['gis-server'].replace('http://','');
	opt.baseURL=ip;//"http://192.168.90.32:8080/LayerService";//config['BASEURL']
	opt.panelParentID="content1";
	defineFancyTree.init(opt);
	hideLoader();
})