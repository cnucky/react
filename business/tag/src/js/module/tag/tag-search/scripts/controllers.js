define(['./app','utility/loaders'], function(app,loaders) {
    'use strict';
    var viewBaseUrl = 'tag-search-views';
    // app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    //     $routeProvider
    //     // .when('/', {

    //     //     templateUrl: viewBaseUrl+'/result.html',
    //     // })
    //     .when('/a', {
    //         controller: 'aCtrl',
    //         templateUrl: viewBaseUrl+'/test2.html',
    //     })
    //     .otherwise({
    //         templateUrl:viewBaseUrl+'/result-tpl.html',
    //     });
    //     // $locationProvider.html5Mode(true);
    // }]);
    app.controller('rootCtrl', ['$scope', '$window', '$timeout', function($scope, $window, $timeout) {
        $scope.showFiltratingFlag = true;
        $scope.collapseContext = $scope.showFiltratingFlag == true ? '收起' : '展开';
        $scope.showCollapseSpan = false;
        $scope.buttonStyle = false;
        $scope.toggleCollapse = function() {

            $scope.showFiltratingFlag = !$scope.showFiltratingFlag;
            $scope.collapseContext = $scope.showFiltratingFlag == true ? '收起' : '展开';
            $window.location.href = '#top';

        };
        $scope.$on('show-collapse-span', function(event, data) {
            $scope.showCollapseSpan = data;
        });

    }]);
    // app.controller('filtratingCtrl', ['$scope', function($scope) {
    //     $scope.showFiltratingFlag = true;
    // }]);


    app.controller('submitCtrl', ['$scope', '$window', 'queryInfoService', function($scope, $window, queryInfoService) {

        $scope.submit = function() {

            queryInfoService.setKeyword($scope.keyword);

        }
        $scope.clear = function() {
            $scope.keyword = '';
            queryInfoService.setKeyword($scope.keyword);
        }
        $scope.myKeyup = function($event) {
            if ($event.keyCode == 13) {
                $scope.submit();
            }
        };


    }]);

    app.controller('selectedTagCtrl', ['$scope', '$rootScope', 'queryInfoService', 'autoAdjustFilter', function($scope, $rootScope, queryInfoService, autoAdjustFilter) {
        $scope.tags = queryInfoService.getTags();
        $scope.removeTag = function($index) {
            var removedTagId = queryInfoService.removeTagByIndex($index);
            $rootScope.$broadcast('removeTag', removedTagId);
        };

    }]);

    app.controller('frequentTagCtrl', ['$scope', '$window', 'frequentTagService', 'pageScopeParamService', function($scope, $window, frequentTagService, pageScopeParamService) {
        $window.location.href = '#top';
        frequentTagService.getFrequentTags().then(function(result) {

            $scope.tags = result.data.tags;
            pageScopeParamService.setFrequentTags($scope.tags);

        });

        // $scope.tags = frequentTagService.doRequest().data.tags;




    }]);
    app.controller('frequentTagRowCtrl', ['$scope', 'queryInfoService', 'tagRowMethodService', function($scope, queryInfoService, tagRowMethodService) {


        tagRowMethodService.init($scope, false);

        //多选toggle函数
        $scope.toggleMultiSelect = function() {
            tagRowMethodService.toggleMultiSelect($scope);
        };

        //点击事件响应函数，单选模式下会将选中值传递到service中，多选则暂存本地等待提交
        $scope.clickTagValue = function($event) {
            var isCustom = false;

            tagRowMethodService.clickTagValue($scope, queryInfoService, $event, isCustom);
        };
        $scope.checkSelected = function(value, id) {
            return tagRowMethodService.checkSelected($scope, queryInfoService, value, id);
        };

        //提交多选模式的标签多个值到服务
        $scope.submitMultiValue = function(tagId) {
            var isCustom = false;
            tagRowMethodService.submitMultiValue($scope, queryInfoService, tagId, isCustom);
        };
        $scope.addCustomValue = function(tagId, newValue) {
            var isCustom = false;
            tagRowMethodService.addCustomValue($scope, queryInfoService, tagId, newValue, isCustom);
        }
        $scope.showCustomFlag = false;
        $scope.toggleCustom = function() {
            tagRowMethodService.toggleCustom($scope);
        }



    }]);



    app.controller('customTagCtrl', customTagCtrl);
    customTagCtrl.$inject = ['$scope', '$timeout', '$window', '$element', '$injector', 'fancytreeFactory', 'ModalService', 'customTagService'];
    /* @ngInject */
    function customTagCtrl($scope, $timeout, $window, $element, $injector, fancytreeFactory, ModalService, customTagService) {

        var customTagService = $injector.get('customTagService');
        var emptyNode = {
            title: '选择',
            tagId: null
        };

        $scope.node = emptyNode;
        $scope.selectedNodeId = null;

        $scope.showTagTree = function() {
            ModalService.showModal({
                templateUrl: "tag-search-views/tag-tree-modal-tpl.html",
                controller: "tagTreeModalCtrl",
                controllerAs: "ctrl"
            }).then(function(modal) {
                // var delayFlag = false;

                //click outside modal form also trigger close
                modal.element.on('hidden.bs.modal', function() {
                    if (!modal.controller.closed) {
                        // delayFlag = true;
                        modal.controller.closeModal();

                    }

                });

                modal.element.modal();



                modal.close.then(function(result) {
                    // if (result.selectedNodeId != null) {
                    //     $scope.$broadcast('node-change', result.selectedNodeId);
                    // }

                });
                modal.closed.then(function() {
                    modal.controller.closed = true;
                });
            });

        };

    };
    app.controller('tagTreeModalCtrl', [
        '$scope', '$element', 'close', '$timeout', 'fancytreeFactory', 'queryInfoService', 'customTagService', 'tagRowMethodService',
        function($scope, $element, close, $timeout, fancytreeFactory, queryInfoService, customTagService, tagRowMethodService) {


            //1. modal part
            this.closed = false;
            var that = this;
            this.closeModal = function() {
                close({}, 200);
 
            };

            this.cancel = function() {
                $element.modal('hide');

                close({
                    
                }, 200);
                
            };
            $scope.cancel = function() {
                $element.modal('hide');
                // $('#tagTree').fancytree('getTree').destroy();
                // console.log('cancel');
                close({
                    // selectedNodeId: null
                }, 200);
                // this.closed = true;
            };



            //2.fancytree part
            $scope.tag = {};
            $scope.filterValue = '';
            $scope.selectedNode = null;
            $scope.selectedNodeId = null;

            var opts = {
                autoExpand: true
            };
            $scope.myKeyup = function($event) {
                if ($event.keyCode == 13) {
                    $scope.filter();

                }
            };

            $scope.filter = function() {
                var targetTree = $('#tagTree').fancytree('getTree');
                targetTree.reload();
                $timeout(function() {
                    var match = $scope.filterValue;
                    var m = RegExp(match);
                    // var first = true;
                    $timeout(function() {
                        targetTree.filterNodes(match, opts);

                    }, 50);


                    targetTree.visit(function(node) {
                        if (node.title.search(m) != -1) {
                            node.extraClasses = 'fancytree-filtered fancytree-bold';
                            // if(first){
                            //     node.setActive(true);
                            //     first = false;
                            // }
                        }
                    });




                }, 400);
                // var match = $('#filter-input').val();


                // $rootScope.$broadcast('tree-filter',match);

            };



            /*ng tree control version BEGIN*/
            // $scope.treeOptions = {
            //     nodeChildren: "children",
            //     dirSelectable: true,
            //     injectClasses: {
            //         ul: "",
            //         li: "",
            //         liSelected: "",
            //         iExpanded: "fa fa-caret-down",
            //         iCollapsed: "fa fa-caret-right",
            //         iLeaf: "fa fa-tag",
            //         label: "",
            //         labelSelected: "selected-treenode"
            //     },
            //     // multiSelection: true
            // };
            // customTagService.getTagTree().then(function(rsp) {
            //     $scope.dataForTheTree = rsp;
            // });

            // $scope.selectNode = function(node, selected) {
            //     if (!node.folder) {
            //         console.log(node);
            //         var sNode = {
            //             tagName: node.tagName,
            //             tagType: node.tagType,
            //             tagId: node.tagId,
            //             title: node.title
            //         };
            //         if (selected) {
            //             console.log('select');
            //             $scope.node = sNode;
            //             $scope.$broadcast('node-change', $scope.node.tagId);

            //         } else {
            //             $scope.node = emptyNode;
            //         }
            //         $scope.toggleShowFlag = false;
            //     }

            // };

            // var emptyTreeData = [{
            //     title: '无统计结果',
            //     iLeaf: true,
            //     tagStat: 0
            // }];
            /*ng tree control version END*/

            /*fancytree version BEGIN*/

            fancytreeFactory.setMethods({
                activate: function(event, data) {


                    if (!data.node.folder) {
                        $scope.$apply(function() {
                            $scope.selectedNode = data.node;
                            $scope.selectedNodeId = data.node.data.tagId;

                        });

                    } else {
                        $scope.$apply(function() {
                            $scope.selectedNode = null;
                            $scope.selectedNodeId = null;
                        });
                    }
                },
                source: function() {
                    return {
                        url: '/tag/getTagTree',
                    }
                },
                postProcess: function(event, data) {
                    if (data.response) {
                        data.result = data.response.data;
                    }
                },
                extensions: function() {
                    return ['filter'];
                },
                filter: function() {
                    return {
                        mode: "dimn",
                        autoApply: true,
                        hightlight: true
                    };
                },
                selectMode: function() {
                    return 2;
                },
                clickFolderMode: function() {
                    return 1;
                },
                autoScroll: function() {
                    return 'true';
                },
                quicksearch: function() {
                    return true;
                },

                iconClass: function(event, data) {
                    if (data.node.folder == true) {
                        return "fa fa-folder fa-fw";
                    } else {
                        return "fa fa-tag fa-fw";
                    }
                },
            }, 'tagTree');
            /*fancytree version END*/




            //3. customTagRowCtrl part
            tagRowMethodService.init($scope, true);

            //多选toggle函数
            $scope.toggleMultiSelect = function() {
                tagRowMethodService.toggleMultiSelect($scope);
            };

            //点击事件响应函数，单选模式下会将选中值传递到service中，多选则暂存本地等待提交
            $scope.clickTagValue = function($event) {
                tagRowMethodService.clickTagValue($scope, queryInfoService, $event, $scope.isCustom);

            };
            $scope.checkSelected = function(value, id) {
                return tagRowMethodService.checkSelected($scope, queryInfoService, value, id);
            };

            //提交多选模式的标签多个值到服务
            $scope.submitMultiValue = function(tagId) {
                tagRowMethodService.submitMultiValue($scope, queryInfoService, tagId, $scope.isCustom);
            };
            $scope.addCustomValue = function(tagId, newValue) {
                var isCustom = true;
                tagRowMethodService.addCustomValue($scope, queryInfoService, tagId, newValue, isCustom);
            }
            $scope.showCustomFlag = false;
            $scope.toggleCustom = function() {
                tagRowMethodService.toggleCustom($scope);
            }
            var dereg = $scope.$watch('selectedNodeId', function(newValue, oldValue, scope) {
                if (newValue != null && newValue != undefined) {
                    customTagService.getValuesById(newValue).then(function(res) {
                        if (res != null) {
                            scope.tag = res;
                            scope.tag.cssFlag = {};
                            if (scope.tag.valueType == 'string') {

                                scope.tag.cssFlag.isMultiBtn = true;
                            } else {
                                scope.tag.cssFlag.isMultiBtn = false;
                            }
                            tagRowMethodService.init($scope, true);
                        }
                    });
                }

            });



        }
    ]);


    // app.controller('customTagRowCtrl', ['$scope', 'queryInfoService', 'customTagService', 'tagRowMethodService', function($scope, queryInfoService, customTagService, tagRowMethodService) {
    //     $scope.showRow = false;
    //     $scope.isCustom = true;

    //     // $scope.selectedNodeId = customTagService.getSelectedNodeId();
    //     // $scope

    //     $scope.multiSelectFlag = false;

    //     $scope.localMultiValueList = [];

    //     //多选toggle函数
    //     $scope.toggleMultiSelect = function() {
    //         tagRowMethodService.toggleMultiSelect($scope);
    //     };

    //     //点击事件响应函数，单选模式下会将选中值传递到service中，多选则暂存本地等待提交
    //     $scope.clickTagValue = function($event) {
    //         tagRowMethodService.clickTagValue($scope, queryInfoService, $event, $scope.isCustom);

    //     };
    //     $scope.checkSelected = function(value, id) {
    //         return tagRowMethodService.checkSelected($scope, queryInfoService, value, id);
    //     };

    //     //提交多选模式的标签多个值到服务
    //     $scope.submitMultiValue = function(tagId) {
    //         tagRowMethodService.submitMultiValue($scope, queryInfoService, tagId, $scope.isCustom);
    //     };
    //     $scope.addCustomValue = function(tagId, newValue) {
    //         var isCustom = true;
    //         tagRowMethodService.addCustomValue($scope, queryInfoService, tagId, newValue, isCustom);
    //     }
    //     $scope.showCustomFlag = false;
    //     $scope.toggleCustom = function() {
    //         tagRowMethodService.toggleCustom($scope);
    //     }
    //     $scope.$on('node-change', function(event, data) {
    //         customTagService.getValuesById(data).then(function(res) {
    //             if (res != null) {
    //                 console.log('customTag', res);
    //                 $scope.tag = res;
    //                 if ($scope.tag.valueType == 'string') {
    //                     $scope.tag.cssFlag = {};
    //                     $scope.tag.cssFlag.isMultiBtn = true;
    //                     $scope.multiSelectFlag = true;
    //                 }else{
    //                     $scope.tag.cssFlag.isMultiBtn = false;
    //                     $scope.multiSelectFlag = false;
    //                 }
    //                 $scope.showRow = true;
    //             }
    //         });
    //     });
    // }]);





    app.controller('statTreeCtrl', statTreeCtrl);
    statTreeCtrl.$inject = ['$scope', '$injector', '$timeout', 'fancytreeFactory'];
    /* @ngInject */
    function statTreeCtrl($scope, $injector, $timeout, fancytreeFactory) {
        var statTreeService = $injector.get('statTreeService');
        var pageScopeParamService = $injector.get('pageScopeParamService');
        var queryInfoService = $injector.get('queryInfoService');
        // Passing fancytree options
        // second arg is fancytree's element id
        $scope.node = {};
        $scope.overFlag = false;
        // $scope.overId = 0;
        $scope.selectNode = function(node, selected) {
            if (node.isLeaf) {
                var tagValueList = [];
                tagValueList.push(node.tagValue);
                var sNode = {
                    tagName: node.tagName,
                    tagType: node.tagType,
                    tagId: node.tagId,
                    tagValueList: tagValueList
                };
                // if (selected) {

                queryInfoService.updateTag(sNode);
                // }
                // else {
                //     queryInfoService.removeTagByTagId(sNode.tagId);
                // }
            }

        };
        $scope.treeOptions = {
            nodeChildren: "children",
            dirSelectable: true,
            injectClasses: {
                ul: "",
                li: "",
                liSelected: "",
                iExpanded: "fa fa-caret-down",
                iCollapsed: "fa fa-caret-right",
                iLeaf: "fa fa-tag icon-light", //fa-check-square-o
                label: "stat-tree-label",
                labelSelected: "selected-treenode"
            },
            // multiSelection: true
        };
        $scope.dataForTheTree = [];
        var emptyTreeData = [];
        var ftags = [];

        var reloadStatTree = function(id, frequentTags) {
            statTreeService.getFrequentTagStat(id, frequentTags).then(function(rsp) {
                $scope.exNodes = [];

                for (var i = 0; i < rsp.length; i++) {
                    $scope.exNodes.push(rsp[i]);
                }
                $scope.dataForTheTree = rsp;
                $scope.node = {};
            });

        };

        $scope.$on('get-result', function(event, data) {
            //fetch the tree when frequent tags has been fecthed already 
            if (emptyTreeData.length == 0) {
                emptyTreeData = pageScopeParamService.getEmptyFrequentTagsTree();
            }
            if (ftags.length == 0) {
                ftags = pageScopeParamService.getFrequentTags();
            }


            if (data.count == 0) {
                $scope.dataForTheTree = emptyTreeData;
                $scope.overFlag = true;
            } else if (data.count <= 1000) {
                $scope.overFlag = false;
                var stringFtags = JSON.stringify(ftags);
                reloadStatTree(data.id, stringFtags);
            } else {
                $scope.dataForTheTree = emptyTreeData;
                $scope.overFlag = true;
            }



        });

    };

    app.controller('resultCtrl', ['$scope', '$rootScope', '$window', 'queryInfoService', 'resultService', function($scope, $rootScope, $window, queryInfoService, resultService) {



        $scope.showFlag = false;
        $scope.showNumber = false;



        $scope.showOpt = 'card';

        $scope.toggleCard = function() {
            $scope.showOpt = 'card';
        };
        $scope.toggleList = function() {
            $scope.showOpt = 'list';
        };

        $scope.displayTotal;

        $scope.pageSize = 12;
        $scope.pos = 0;

        var emptyResult = {
            totalCount: 0
        };
        $scope.result = emptyResult;
        $scope.gotoPage = function(p) {
            resultService.getResult($scope.submitResult.taskId, $scope.pageSize * (p - 1), $scope.pageSize).then(function(res2) {
                if (res2 != null) {
                    if (res2.timeOut == 0) {
                        $scope.result = res2;
                        $scope.pos = $scope.pageSize * (p - 1);
                        $scope.total = $scope.result.totalCount;
                        $scope.displayTotal = $scope.total > 1000 ? 1000 : $scope.total;
                        $scope.showNumber = $scope.total==0?false:true;
                        $scope.currentPage = $scope.displayTotal == 0 ? 1 : ($scope.pos / $scope.pageSize + 1);


                        $window.location.href = '#result-head';
                    } else {
                        console.log('timeout!');
                        $rootScope.$broadcast('timeout',p);
                    }


                }

            });
        };
        $scope.observer = queryInfoService.getObserveParams();
        $scope.submitResult = {
            taskId: -1,
            taskCount: 0
        };

        //watch一个observer对象，其属性为预定义的改变了就需要刷新任务的所有要素
        var dereg1 = $scope.$watch('observer', function(newValue, oldValue, $scope) {

            //触发loader-begin事件,向loader-begin事件添加data数据为提交时的taskCount(意义是任务编号，
            //按照提交顺序递增的一个编号)，loader-end事件触发时如果当前taskCount小于最后更新的loader-begin的taskCount，则说明此时结束的不是最新任务
            $rootScope.$broadcast('loader-begin',$scope.submitResult.taskCount);
            queryInfoService.submitTask().then(function(res) {
                
                $scope.$emit('show-collapse-span', $scope.showFlag);
                if (res.taskCount > $scope.submitResult.taskCount) {
                    $scope.submitResult.taskCount = res.taskCount;
                    $scope.showFlag = (res.taskId == -1) ? false : true;
                }

                if ($scope.showFlag) {
                    $scope.submitResult.taskId = res.taskId;
                    $scope.pos = 0;
                }

            });
        }, true);
        $scope.$on('timeout', function(event, data) {
            $rootScope.$broadcast('loader-begin',$scope.submitResult.taskCount);
            queryInfoService.submitTask().then(function(res) {
                
                $scope.$emit('show-collapse-span', $scope.showFlag);
                if (res.taskCount > $scope.submitResult.taskCount) {
                    $scope.submitResult.taskCount = res.taskCount;
                    $scope.showFlag = (res.taskId == -1) ? false : true;
                }
                if ($scope.showFlag) {
                    $scope.submitResult.taskId = res.taskId;


                }

                $scope.gotoPage(data);

            });
        });

        var dereg2 = $scope.$watch('submitResult', function(newValue, oldValue, $scope) {
            if (newValue.taskCount > oldValue.taskCount) {

                resultService.getResult(newValue.taskId, $scope.pos, $scope.pageSize).then(function(res2) {
                    if (res2 != null) {
                        $scope.result = res2;
                        $scope.total = $scope.result.totalCount;
                        $scope.displayTotal = $scope.total > 1000 ? 1000 : $scope.total;
                        if($scope.total!=undefined){
                            $scope.showNumber = $scope.total==0?false:true;
                        }
                        
                        $scope.currentPage = $scope.displayTotal == 0 ? 1 : ($scope.pos / $scope.pageSize + 1);
                        var result = {
                            id: newValue.taskId,
                            count: $scope.total
                        };

                        $rootScope.$broadcast('get-result', result);
                    }

                    $rootScope.$broadcast('loader-end',newValue.taskCount);
                });
            }

        }, true);
        var curTaskCount;
        var loader;
        $scope.$on('loader-begin',function(event,data){
            curTaskCount = data;
            if(loader ==undefined){
                loader = loaders($('body'));
            }
            
            
        });

        $scope.$on('loader-end',function(event,data){
            if(data>=curTaskCount){
                if(loader){
                    loader.hide();
                    loader = undefined;
                }
            }
        });
        
        $scope.getBackgroundColor = function(id) {
            switch (id) {
                case 1: //身份
                    return '#F6B132';
                    break;
                case 2: //护照
                    return '#F64662';
                    break;
                case 3: //签证
                    return '#5457A6';
                    break;
                case 5: //手机
                    return '#6EAFF7';
                    break;
                case 11: //QQ
                    return '#E95D35';
                    break;
                case 12: //邮箱
                    return '#6B4897';
                    break;
                case 16: //淘宝
                    return '#FF5500';
                    break;
                case 17: //支付宝
                    return '#01AAEF';
                    break;
                default:
                    break;
            }
        };
        $scope.getIconClass = function(id) {
            switch (id) {
                case 1: //身份
                    return 'fa fa-user';
                    break;
                case 2: //护照
                    return 'fa fa-ticket';
                    break;
                case 3: //签证
                    return 'fa fa-cc-visa';
                    break;
                case 5: //手机
                    return 'fa fa-phone-square';
                    break;
                case 11: //QQ
                    return 'fa fa-qq';
                    break;
                case 12: //邮箱
                    return 'fa fa-envelope';
                    break;
                case 16: //淘宝
                    return 'alibaba alitao fs14';
                    break;
                case 17: //支付宝
                    return 'alibaba alipay fs14';
                    break;
                default:
                    break;
            }
        };

        $scope.openResult = function(item) {
            $window.open('/renlifang/profile.html?entityid=' + BASE64.encoder(item.id) + '&entitytype=' + BASE64.encoder('' + item.typeId));
        };
    }]);



});