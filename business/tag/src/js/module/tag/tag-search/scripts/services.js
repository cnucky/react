'use strict';
define(['./app'], function(app) {

    app.factory('queryInfoService', ['$q', '$http', '$rootScope', '$timeout', function($q, $http, $rootScope, $timeout) {
        // var selectedInfo = {};


        var _taskId;
        var _taskCount = 0;
        var _queryInfoParams = {
            selectedTagArray: [],
            keyword: ''
        };
        // selectedInfo._selectedTagArray = [];
        // selectedInfo._keyword = '';


        var submitTask = function() {
            var deferred = $q.defer();
            _taskCount++;


            let inner_taskCount = _taskCount;

            var dataTag = [];
            if (_queryInfoParams.selectedTagArray.length == 0 && (!_queryInfoParams.keyword||_queryInfoParams.keyword.length == 0)) {
                // $timeout(function(){
                deferred.resolve({
                    taskId: -1,
                    taskCount: inner_taskCount
                });
                // },1200);

                // $rootScope.$broadcast('generate-id', -2);
                return deferred.promise;
            } else {
                for (var i = 0; i < _queryInfoParams.selectedTagArray.length; i++) {
                    var t = {
                        typeId: _queryInfoParams.selectedTagArray[i].tagId,
                        typeName: _queryInfoParams.selectedTagArray[i].tagName,
                        valueType: _queryInfoParams.selectedTagArray[i].tagType,
                        valueList: _queryInfoParams.selectedTagArray[i].tagValueList

                    };
                    dataTag.push(t);

                }
                $http({
                        method: 'POST',
                        data: {
                            keyword: _queryInfoParams.keyword,
                            dataTag: dataTag,
                            // dataTag: [{
                            //     "typeId": '10001',
                            //     "typeName": "出境次数",
                            //     "valueType": "int",
                            //     "valueList": ["[3,10]"]
                            //         //int和date类型为起始范围
                            //         //开闭区间用()和[]表示，无上下限填空
                            //         //string类型为枚举值列表
                            // }]
                        },
                        url: '/tag/tag/submitTagSearch'
                    })
                    .success(function(data) {
                        _taskId = data.data.taskId;
                        if (data.code != 0) {
                            $rootScope.$broadcast('generate-id', -1);
                            deferred.resolve({
                                taskId: -1,
                                taskCount: inner_taskCount
                            });
                        } else {
                            $rootScope.$broadcast('generate-id', _taskId);
                            deferred.resolve({
                                taskId: data.data.taskId,
                                taskCount: inner_taskCount
                            });
                        }

                    })
                    .error(function(error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            }

        };
        var removeTagByTagId = function(tagId) {
            var index;

            _.each(_queryInfoParams.selectedTagArray, function(value, key, list) {
                if (value.tagId == tagId) {
                    index = key;
                }
            });


            _queryInfoParams.selectedTagArray.splice(index, 1);
            broadcastParams($rootScope);




        };
        var removeTagByIndex = function(index) {
            var removedTagArray = _queryInfoParams.selectedTagArray.splice(index, 1);
            return removedTagArray[0].tagId;
            broadcastParams($rootScope);

        };
        var pushTag = function(Tag) {
            _queryInfoParams.selectedTagArray.push(Tag);
            broadcastParams($rootScope);

        };
        var getTags = function() {
            // var deferred = $q.defer();
            // deferred.resolve(_selectedTagArray);
            // return deferred.promise;
            return _queryInfoParams.selectedTagArray;
        };

        var updateTag = function(Tag) {
            var index = -1;

            _.each(_queryInfoParams.selectedTagArray, function(value, key, list) {
                if (value.tagId == Tag.tagId) {
                    index = key;
                }
            });
            if (index != -1) {
                _queryInfoParams.selectedTagArray.splice(index, 1);
            }




            pushTag(Tag);
        };

        var getExistedTag = function(id) {
            return _.find(_queryInfoParams.selectedTagArray, function(tag) {
                return tag.tagId == id;
            });

        };

        var setKeyword = function(k) {
            _queryInfoParams.keyword = k;
            broadcastParams($rootScope);

        };

        var checkValueSelected = function(value, id) {
            var selectedTag = _.find(_queryInfoParams.selectedTagArray, function(tag) {
                return tag.tagId == id;
            });
            if (selectedTag) {
                return _.find(selectedTag.tagValueList, function(v) {
                    return v == value;
                });
            } else {
                return false;
            }
        };
        var broadcastParams = function() {
            // $rootScope.$broadcast('params-change', _queryInfoParams);
        };

        var getObserveParams = function() {
            return _queryInfoParams;
        };
        // var getTaskId = function(){
        //     deferred.resolve(_taskId);
        //     return deferred.promise;
        // };

        var print = function(n) {
            console.log(n, _queryInfoParams.selectedTagArray);
        };
        return {
            // selectedInfo:selectedInfo,
            submitTask: submitTask,
            taskId: _taskId,
            pushTag: pushTag,
            removeTagByIndex: removeTagByIndex,
            removeTagByTagId: removeTagByTagId,
            getExistedTag: getExistedTag,
            getTags: getTags,
            updateTag: updateTag,
            setKeyword: setKeyword,
            checkValueSelected: checkValueSelected,
            getObserveParams: getObserveParams,
            broadcastParams: broadcastParams,
            // getTaskId:getTaskId,

            print: print
        }
    }]);

    app.factory('frequentTagService', ['$q', '$http', function($q, $http) {
        var getFrequentTags = function() {
            var deferred = $q.defer();
            $http({
                    method: 'GET',
                    params: {
                        size: 10
                    },
                    url: '/tag/tag/getFrequentTag'
                })
                .success(function(data) {
                    var result = dataFormModify(data);
                    deferred.resolve(result);
                })
                .error(function(error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        };
        return {
            getFrequentTags: getFrequentTags,
        }
    }]);
    app.factory('pageScopeParamService', ['$q', '$http', function($q, $http) {
        var _frequentTags;
        var setFrequentTags = function(ft) {
            //deep clone without $$hashKey
            _frequentTags = deepClone(ft);
        };
        var getFrequentTags = function() {
            return _frequentTags;
        };
        var getEmptyFrequentTagsTree = function() {
            var result = [];
            for (var i = 0; i < _frequentTags.length; i++) {
                var newObj = {};
                newObj.tagId = _frequentTags[i].typeId;
                newObj.tagName = _frequentTags[i].typeName;
                newObj.tagType = _frequentTags[i].valueType;
                newObj.title = _frequentTags[i].typeName;
                newObj.tagValueList = _frequentTags[i].valueList;
                newObj.tagStat = 0;
                newObj.isLeaf = false;
                newObj.children = [];
                for (var j = 0; j < _frequentTags[i].valueList.length; j++) {
                    var newChild = {};
                    newChild.title = _frequentTags[i].valueList[j];
                    newChild.tagValue = _frequentTags[i].valueList[j];
                    newChild.tagShoot = 0;
                    newChild.tagId = _frequentTags[i].typeId;
                    newChild.tagName = _frequentTags[i].typeName;
                    newChild.tagType = _frequentTags[i].valueType;
                    newChild.isLeaf = true;
                    newObj.children.push(newChild);
                }
                result.push(newObj);
            }
            return result;
        };


        return {
            setFrequentTags: setFrequentTags,
            getFrequentTags: getFrequentTags,
            getEmptyFrequentTagsTree: getEmptyFrequentTagsTree
        }
    }]);

    app.factory('tagRowMethodService', function() {
        var init = function($scope, isCustom) {
            if ($scope.tag == undefined) {
                $scope.multiSelectFlag = false;
            } else {
                if ($scope.tag.cssFlag != undefined) {
                    $scope.multiSelectFlag = $scope.tag.cssFlag.isMultiBtn;
                } else $scope.multiSelectFlag = false;

            }
            $scope.localMultiValueList = [];
            $scope.customValue = '';
            $scope.isCustom = isCustom;


            $scope.$on('removeTag', function(event, data) {
                if ($scope.multiSelectFlag) {

                    if (data == $scope.tag.typeId) {
                        $scope.localMultiValueList = [];
                    }
                }

            });

        };



        var toggleMultiSelect = function($scope) {
            $scope.multiSelectFlag = !$scope.multiSelectFlag;
            //切换模式后需要清空暂存数组

            $scope.localMultiValueList = [];
        };


        var clickTagValue = function($scope, queryInfoService, $event, isCustom, isAddClick) {
            // if (!isCustom) {
            //     var curSelectedTag = _.find($scope.tags, function(tag) {
            //         return tag.typeId == $event.target.getAttribute('data-tag-id');
            //     });
            // } else {
            var curSelectedTag = $scope.tag;
            // }
            isAddClick = isAddClick || false;
            var selectedTagValue;
            if (!isAddClick) {
                selectedTagValue = $event.target.getAttribute('data-tag-value');
            } else {
                //when isAddClick,param $event is the value of selected tag
                selectedTagValue = $event;
            }

            var selectedTagValueLocal = {
                tagName: curSelectedTag.typeName,
                tagValueList: [],
                tagId: curSelectedTag.typeId,
                tagType: curSelectedTag.valueType,
                cssFlag: curSelectedTag.cssFlag
            };



            var selectedTagInService = queryInfoService.getExistedTag(selectedTagValueLocal.tagId);
            //单选
            if (!$scope.multiSelectFlag) {
                //点击未选中的值
                if (!$scope.checkSelected(selectedTagValue, selectedTagValueLocal.tagId)) {
                    if (selectedTagInService) {
                        queryInfoService.removeTagByTagId(selectedTagValueLocal.tagId);
                    }
                    var submitArray = [];
                    submitArray.push(selectedTagValue);
                    selectedTagValueLocal.tagValueList = submitArray;
                    queryInfoService.pushTag(selectedTagValueLocal);
                } else {
                    //点击选中的值
                    $scope.localValueList = [];

                    queryInfoService.removeTagByTagId(selectedTagValueLocal.tagId);
                }
                if (isCustom) {

                    //现在的逻辑为即使是单选也不自动关闭弹出框
                    // $scope.cancel();
                }
            } else {
                //多选
                //点击未选中的值
                if (!$scope.checkSelected(selectedTagValue)) {
                    $scope.localMultiValueList.push(selectedTagValue);

                    $scope.submitMultiValue($scope, queryInfoService, curSelectedTag.typeId, isCustom);
                } else {
                    //点击选中的值
                    $scope.localMultiValueList = _.reject($scope.localMultiValueList, function(v) {
                        return v == selectedTagValue;
                    });
                    $scope.submitMultiValue($scope, queryInfoService, curSelectedTag.typeId, isCustom);

                }
            }


            // if (isCustom) {
            //     $scope.$emit('node-submit');
            // };
        };

        var checkSelected = function($scope, queryInfoService, value, id) {
            id = id || undefined;
            if ($scope.multiSelectFlag) {
                var findLocal = _.find($scope.localMultiValueList, function(v) {
                    return v == value;
                });
                if (findLocal != undefined) {
                    return true;
                } else {
                    var findService = queryInfoService.checkValueSelected(value, id);
                    if (findService) {
                        $scope.localMultiValueList.push(value);
                    }
                    return findService;
                }
            } else {

                // if ($scope.multiSelectFlag) {
                //     if (queryInfoService.checkValueSelected(value, id) && _.find($scope.localMultiValueList, function(v) {
                //             return v == value;
                //         }) == undefined) {
                //         $scope.localMultiValueList.push(value);
                //     } else if (!queryInfoService.checkValueSelected(value, id) && _.find($scope.localMultiValueList, function(v) {
                //             return v == value;
                //         }) != undefined) {
                //         $scope.localMultiValueList = _.reject($scope.localMultiValueList, function(v) {
                //             return v == value;
                //         });
                //     }

                // }
                return queryInfoService.checkValueSelected(value, id) ? true : false;
            }
        };
        var submitMultiValue = function($scope, queryInfoService, tagId, isCustom) {
            // if (!isCustom) {
            //     var curSelectedTag = _.find($scope.tags, function(tag) {
            //         return tag.typeId == tagId;
            //     });
            // }else{
            var curSelectedTag = $scope.tag;
            // }


            //选中列表不为空时
            if ($scope.localMultiValueList.length != 0) {
                var selectedTagValueLocal = {
                    tagName: curSelectedTag.typeName,
                    tagValueList: $scope.localMultiValueList,
                    tagId: curSelectedTag.typeId,
                    cssFlag: curSelectedTag.cssFlag,
                    tagType: curSelectedTag.valueType
                };

                var selectedTagInService = queryInfoService.getExistedTag(selectedTagValueLocal.tagId);

                if (selectedTagInService) {

                    queryInfoService.removeTagByTagId(selectedTagValueLocal.tagId);
                }

                queryInfoService.pushTag(selectedTagValueLocal);

            } else {

                queryInfoService.removeTagByTagId(curSelectedTag.typeId);
            }
            // $scope.toggleMultiSelect();
            if (isCustom) {
                $scope.$emit('node-submit');
            };
        };
        var addCustomValue = function($scope, queryInfoService, tagId, newValue, isCustom) {
            var curSelectedTag = $scope.tag;


            if ($scope.tag.valueList) {
                $scope.tag.valueList.push(newValue);
            } else {
                $scope.tag.valueList = [];
                $scope.tag.valueList.push(newValue);
            }



            clickTagValue($scope, queryInfoService, newValue, isCustom, true);



        };
        var toggleCustom = function($scope) {
            $scope.showCustomFlag = !$scope.showCustomFlag;
        }
        return {
            init: init,
            toggleMultiSelect: toggleMultiSelect,
            clickTagValue: clickTagValue,
            checkSelected: checkSelected,
            submitMultiValue: submitMultiValue,
            addCustomValue: addCustomValue,
            toggleCustom: toggleCustom
        }
    });



    app.factory('resultService', ['$q', '$http', function($q, $http) {

        var getResult = function(taskId, pos, size) {
            var deferred = $q.defer();
            if (taskId != null) {
                
                $http({
                        method: 'GET',
                        params: {
                            taskId: taskId,
                            pos: pos,
                            size: size
                        },
                        url: '/tag/tag/getTagSearchResult'
                    })
                    .success(function(data) {

                        deferred.resolve(data.data);
                    })
                    .error(function(error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            } else {
                deferred.resolve(null);
                return deferred.promise;
            }


        };
        return {
            getResult: getResult,
        }
    }]);

    app.factory('statTreeService', ['$q', '$http', function($q, $http) {
        var getFrequentTagStat = function(id, ftags) {
            var deferred = $q.defer();
            $http({
                    method: 'GET',
                    params: {
                        'taskId': id,
                        'frequentTags': ftags
                    },
                    url: '/tag/tag/getFrequentTagStat'
                })
                .success(function(data) {

                    deferred.resolve(data.data);
                })
                .error(function(error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        };
        return {
            getFrequentTagStat: getFrequentTagStat,
        }
    }]);




    app.factory('customTagService', ['$q', '$http', function($q, $http) {
        var _selectedNodeId;
        var getSelectedNodeId = function() {
            return _selectedNodeId;
        };
        var setSelectedNodeId = function(id) {
            _selectedNodeId = id;
        };
        var getTagTree = function() {
            var deferred = $q.defer();
            $http({
                    method: 'GET',
                    url: '/tag/tag/getTagTree'
                })
                .success(function(data) {

                    deferred.resolve(data.data);
                })
                .error(function(error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        };
        var getValuesById = function(id) {
            var deferred = $q.defer();
            if (id == null) {
                deferred.resolve(null);
                return deferred.promise;
            } else {

                $http({
                        method: 'GET',
                        url: '/tag/tag/getTagValueList',
                        params: {
                            typeId: id,
                        },
                    })
                    .success(function(data) {
                        deferred.resolve(data.data);
                    })
                    .error(function(error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            }



        };
        return {
            getValuesById: getValuesById,
            getSelectedNodeId: getSelectedNodeId,
            setSelectedNodeId: setSelectedNodeId,
            getTagTree: getTagTree
        };
    }]);



    function dataFormModify(data) {

        // var intPattern = /\[\d+,\d+\]/;
        // var datePattern = /\[(\d{4}-\d{2}-\d{2}\s\d{2}\:\d{2}\:\d{2})?,(\d{4}-\d{2}-\d{2}\s\d{2}\:\d{2}\:\d{2})?\]/;

        // var intRE = new RegExp(intPattern);
        // var dateRE = new RegExp(datePattern);


        for (var i = 0; i < data.data.tags.length; i++) {

            data.data.tags[i].cssFlag = {};
            data.data.tags[i].cssFlag.isMultiBtn = data.data.tags[i].valueType == 'string' ? true : false;
        }

        return data;
    }
    

    
    function deepClone(obj){
        var o = obj instanceof Array ? []:{};
        for(var k in obj){
            o[k] = typeof obj[k] === 'object'?deepClone(obj[k]):obj[k]; 
        }
        return o;
    };


});