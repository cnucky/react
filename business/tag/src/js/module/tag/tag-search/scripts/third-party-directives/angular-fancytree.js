(function() {
    'use strict';

    angular
        .module('angular-fancytree', []);
})();

(function() {
    'use strict';

    angular
        .module('angular-fancytree')
        .factory('fancytreeFactory', fancytreeFactory);

    fancytreeFactory.$inject = [];

    /* @ngInject */
    function fancytreeFactory() {
        var service = {
            setData: setData,
            getData: getData,
            setMethods: setMethods,
            getMethods: getMethods,
            data: new Object(),
            methods: new Object()
        };
        return service;

        function setData(data, name) {
            this.data[name] = data;
        }

        function getData(name) {
            return this.data[name];
        }

        function setMethods(methods, name) {
            this.methods[name] = methods;
        }

        function getMethods(name) {
            return this.methods[name];
        }

    }

})();

(function() {
    'use strict';

    angular
        .module('angular-fancytree')
        .directive('fancytree', fancytree);

    fancytree.$inject = ['$timeout', 'fancytreeFactory'];

    /* @ngInject */
    function fancytree($timeout, fancytreeFactory) {
        var directive = {
            template: '<div id="{{ id }}"></div>',
            restrict: 'EAC',
            scope: {
                reload: "@",
                id: "@",
                activevisible: "@",
                aria: "@",
                autovctivate: "@",
                autovollapse: "@",
                autoscroll: "@",
                clickfoldermode: "@",
                checkbox: "@",
                debuglevel: "@",
                disabled: "@",
                focusonselect: "@",
                generateids: "@",
                idprefix: "@",
                icon: "@",
                keyboard: "@",
                keypathseparator: "@",
                minexpandlevel: "@",
                quicksearch: "@",
                selectmode: "@",
                tabbable: "@",
                titlestabbable: "@"
            },
            link: function(scope, element, attrs) {
                var initializeFancytree = function() {
                    return $timeout(function() {
                        var fancytree = $('#' + scope.id);

                        var options = {
                            source: fancytreeFactory.getData(scope.id),
                            activeVisible: scope.activevisible === 'true',
                            aria: scope.aria !== 'false',
                            autoActivate: scope.autoactivate === 'true',
                            autoCollapse: scope.autocollapse !== 'false',
                            autoScroll: scope.autoscroll !== 'false',
                            clickFolderMode: scope.clickfoldermode != null ? parseInt(scope.clickFolderMode) : 4,
                            checkbox: scope.checkbox !== 'false',
                            debugLevel: scope.debuglevel != null ? parseInt(scope.debugLevel) : 2,
                            disabled: scope.disabled !== 'false',
                            focusOnSelect: scope.focusonselect !== 'false',
                            generateIds: scope.generateids !== 'false',
                            idPrefix: scope.idprefix || "ft_",
                            icon: scope.icon === 'true',
                            keyboard: scope.keyboard === 'true',
                            keyPathSeparator: scope.keypathseparator || "/",
                            minExpandLevel: scope.minexpandlevel != null ? parseInt(scope.minExpandLevel) : 1,
                            quicksearch: scope.quicksearch !== 'false',
                            selectMode: scope.selectmode != null ? parseInt(scope.selectMode) : 2,
                            tabbable: scope.tabbable === 'true',
                            titlesTabbable: scope.titlestabbable !== 'false',
                            select: null
                        };

                        var methodsObj = fancytreeFactory.getMethods(scope.id);
                        $.each(methodsObj, function(key, callback) {
                            if (typeof callback == 'function') {
                                options[key] = callback;
                            }
                        });

                        fancytree.fancytree(options);
                        // fancytree.css('height','500px');
                    });
                };
                var reloadFancytree = function() {
                    return $timeout(function() {
                        var fancytree = $('#' + scope.id);
                        console.log(fancytree.fancytree);
                        console.log(fancytree.fancytree('getTree'));
                        fancytree.fancytree('getTree').reload();
                    });
                };
                var myFilter = function(match) {
                    return $timeout(function() {
                        var fancytree = $('#' + scope.id);
                        var opts = {
                            autoExpand: true
                        };

                        fancytree.fancytree('getTree').filterNodes(match, opts);
                        var m = RegExp(match);
                        targetTree.visit(function(node) {
                            if (node.title.search(m) != -1) {
                                node.extraClasses = 'fancytree-highlight';
                            }
                        });
                    });
                };


                initializeFancytree();
                // scope.$on('generate-id', function(event, data) {
                //     // fancytree.reload();
                //     if (scope.reload === 'true') {
                //         console.log('reload');
                //         reloadFancytree();
                //     }

                // });
                // scope.$on('tree-filter', function(event, data) {
                //     // fancytree.reload();
                //     myFilter(data);

                // });


            }
        };
        return directive;
    }
})();