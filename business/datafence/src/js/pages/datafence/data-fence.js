initLocales(require.context('../../../locales/gis-module', false, /\.js/));
registerLocales(require.context('../../../locales/collision', false, /\.js/));
registerLocales(require.context('../../../locales/operator', false, /\.js/), 'operator');
require(['../../module/datafence/gis-module',
    '../../tpl/gis/tpl-gismodule',
], function(gisModule, tpl_gis) {
    hideLoader();
    // Variables
    var Window = $(window);
    var Body = $('body');
    var Navbar = $('.navbar');
    var Topbar = $('#topbar');

    // Constant Heights
    var windowH = Window.height();
    var bodyH = Body.height();
    var navbarH = 0;
    var topbarH = 0;

    // Variable Heights
    if (Navbar.is(':visible')) {
        navbarH = Navbar.outerHeight();
    }
    if (Topbar.is(':visible')) {
        topbarH = Topbar.outerHeight();
    }

    // Calculate Height for inner content elements
    var contentHeight = windowH - (navbarH + topbarH);

    $('#content').outerHeight(contentHeight);

    // $('#mainSplitter').jqxSplitter({
    //     width: '100%',
    //     height: '100%',
    //     orientation: 'horizontal',
    //     theme: 'bootstrap',
    //     panels: [{
    //         size: '30%',
    //         collapsible: false
    //     }, {
    //         size: '70',
    //         collapsed: true
    //     }]
    // });

    gisModule.Init({
        container: '#mapContainer'
    });
    // $('#mainSplitter').jqxSplitter({
    //     width: '100%',
    //     height: '100%',
    //     orientation: 'horizontal',
    //     theme: 'bootstrap',
    //     panels: [{
    //         size: '30%',
    //         collapsible: false
    //     }, {
    //         size: '70%',
    //         collapsed: true
    //     }]
    // });
})