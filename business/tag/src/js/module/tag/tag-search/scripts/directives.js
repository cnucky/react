'use strict';
define(['./app', 'nova-notify', 'moment'], function(app, Notify, moment) {



    app.directive('tagValueRow', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'tag-search-views/tag-value-row-tpl.html',
            scope: true,
            link: function(scope, element, attrs) {},
        };
    }]);
    app.directive('customValueRow', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'tag-search-views/custom-value-row-tpl.html',
            scope: true,
            link: function(scope, element, attrs) {},
        };
    }]);

    // app.directive('moreSpan', function() {
    //     return {
    //         restrict: 'E',
    //         templateUrl: 'tag-search-views/more-span-tpl.html',
    //         scope: false,
    //         link: function(scope, element, attrs) {

    //             scope.multiLineText = scope.multiLineExpand ? '收起' : '更多';
    //             scope.multiLineClass = scope.multiLineExpand ? 'asc' : 'desc';



    //         },

    //     };
    // });
    app.directive('resultCard', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'tag-search-views/result-card-tpl.html',
            scope: true,
            link: function(scope, element, attrs) {

            },


        };
    }]);
    app.directive('resultList', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'tag-search-views/result-list-tpl.html',
            scope: true,
            link: function(scope, element, attrs) {

            },


        };
    }]);

    app.directive('customValue', function() {

        return {
            restrict: 'E',
            templateUrl: 'tag-search-views/custom-value-tpl.html',

            link: function($scope, element, attrs) {


                $scope.stringVal = '';
                $scope.dateVal1 = '';
                $scope.dateVal2 = '';
                $scope.intVal1 = '';
                $scope.intVal2 = '';

                var stringButtonEle = angular.element(element[0].querySelector('.string-btn'));
                var dateButtonEle = angular.element(element[0].querySelector('.date-btn'));
                var intButtonEle = angular.element(element[0].querySelector('.int-btn'));

                stringButtonEle.bind('click', function() {
                    if ($scope.stringVal != '') {
                        $scope.$apply(function() {
                            $scope.addCustomValue($scope.tag.typeId, $scope.stringVal);
                            $scope.stringVal = '';
                        });
                    }

                });



                dateButtonEle.bind('click', function() {
                    if ($scope.dateVal1 != undefined && $scope.dateVal2 != undefined) {
                        if ($scope.dateVal1 != '' || $scope.dateVal2 != '') {
                            var v1 = $scope.dateVal1;
                            var v2 = $scope.dateVal2;
                            var submitFlag = true;
                            if (v1.length + v2.length == 0) {
                                return;
                            }
                            if (v1.length == 0) {
                                v1 = 'null'
                            }
                            if (v1 != 'null' && v1.length <= 10) {
                                v1 += ' 00:00:00';
                            }
                            if (v2.length == 0) {
                                v2 = 'null'
                            }
                            if (v2 != 'null' && v2.length <= 10) {
                                v2 += ' 00:00:00';
                            }

                            if (v1 != 'null' && v2 != 'null') {
                                var m1 = moment(v1);
                                var m2 = moment(v2);
                                var isBefore = m1.isBefore(m2);
                                if (!isBefore) {
                                    Notify.show({
                                        title: '日期范围前后值大小关系不正确！',
                                        type: "error"
                                    });
                                    submitFlag = false;
                                }
                            }
                            if (submitFlag) {
                                var v = '[' + v1 + ',' + v2 + ']';
                                $scope.$apply(function() {

                                    $scope.addCustomValue($scope.tag.typeId, v);
                                    $scope.dateVal1 = '';
                                    $scope.dateVal2 = '';
                                });
                            }
                        }
                    }


                });





                intButtonEle.bind('click', function() {
                    if ($scope.intVal1 != undefined && $scope.intVal2 != undefined) {
                        if ($scope.intVal1 != '' || $scope.intVal2 != '') {
                            var v1 = $scope.intVal1;
                            var v2 = $scope.intVal2;
                            var submitFlag = true;
                            if (v1.length + v2.length == 0) {
                                return;
                            }
                            if (v1.length == 0) {
                                v1 = 'null'
                            }
                            if (v2.length == 0) {
                                v2 = 'null'
                            }
                            if (v1 != 'null' && v2 != null) {
                                if (parseInt(v1) > parseInt(v2)) {
                                    Notify.show({
                                        title: '数值范围前后值大小关系不正确！',
                                        type: "error"
                                    });
                                    submitFlag = false;
                                }
                            }
                            if (submitFlag) {
                                var v = '[' + v1 + ',' + v2 + ']';
                                $scope.$apply(function() {
                                    $scope.addCustomValue($scope.tag.typeId, v);
                                    $scope.intVal1 = '';
                                    $scope.intVal2 = '';


                                });
                            }

                        }
                    }


                });


            },


        };
    });




});