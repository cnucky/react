define(['angular',
    'angular-route',
    'angular-animate',
    './third-party-directives/angular-fancytree',
    './third-party-directives/paging',
    './third-party-directives/angular-tree-control',
    './third-party-directives/angular-modal-service.min',
    './third-party-directives/ngMask.min',
], function(angular) {

    var app = angular.module('tagSearchApp', ['ngRoute',
        'ngAnimate',
        'angular-fancytree',
        'bw.paging',
        'treeControl',
        'angularModalService',
        'ngMask',
        // 'angular-loading-bar'
    ]);
    // console.log(app);


    //using full screen loader now
    // app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    //     cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    //     cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner"><span class="loader-title">数据加载中...</span></div>';
    // }]);
    return app;
});