'use strict';
initLocales();
require([
    'fancytree-all',
    'nova-dialog',
    'nova-utils',
    'nova-notify',
    'nova-alert',
    '../../../html/tag-search-views/index',
    'jquery',
    'angular',
    'angular-route',
    'angular-animate',
    '../../module/tag/tag-search/scripts/angular-bootstrap'


], function(Tree, Dialog, Util, Notify, Alert, tpl) {
    // console.log(angular);
    
    tpl = _.template(tpl);

    document.getElementById('home-content').innerHTML = tpl();
    // $('#home-content').append(tpl());

    hideLoader();




});