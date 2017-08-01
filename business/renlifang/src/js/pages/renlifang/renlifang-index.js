initLocales();
require([
    '../../tpl/rlf/rlf-search-result-item',
    'widget/rlf-pagination',
    'nova-alert',
    'nova-utils',
    'jquery',
    'underscore',
    '../../tpl/rlf/rlf-tag-search-result-item'
], function (tpl, Pagination, Alert, Util, $, _, tagTpl) {
    var _queryResult = [];
    var _resultCount;
    var _taskId;
    var countPerPage = 20;
    tpl = _.template(tpl);
    tagTpl = _.template(tagTpl);

    _taskId = Util.getURLParameter('taskid');
    var entityId = Util.getURLParameter('entityid');
    var entityType = Util.getURLParameter('entitytype');
    var faceRecogTaskId = Util.getURLParameter('faceRecogTaskId');

    var searchType = entityType != null ? 1 : 2;
    if (faceRecogTaskId){
        searchType = 3;
    }
    var personMap = [];

    $('#keyword').val(entityId);

    $("#search-form").on('submit', function (event) {
        // 获取查询关键字
        var keyword = $("#keyword").val();
        if (_.isEmpty(keyword)) {
            event.preventDefault();
            Alert.show({
                container: $("#alert-container"),
                alertid: "alert-keyword-empty",
                alertclass: "alert-warning",
                content: "<i class='fa fa-keyboard-o pr10'></i><strong> 请输入查询关键字！ </strong>"
            });
        }
    });

    //人立方模糊查询
    if (searchType == 2) {
        $.getJSON('/renlifang/tag/getTagSearchResult', {
                taskId:_taskId,
                pos:0,
                size:20
            }, function (rsp) {
            if (rsp.code != 0) {
                dismissLoader();
                Alert.show({
                    container: $("#alert-container"),
                    alertid: "alert-load-fail",
                    alertclass: "alert-danger",
                    content: "<i class='fa fa-coffee pr10'></i><strong> 查询请求失败 </strong>"
                });
                dismissLoader();
            }
            if(rsp.data.timeOut == 1){
                Alert.show({
                    container: $("#alert-container"),
                    alertid: "alert-keyword-no-result",
                    alertclass: "alert-warning",
                    content: "<i class='fa fa-keyboard-o pr10'></i><strong> 查询超时 </strong>"
                });
                dismissLoader();
            }
            else{
                var data = rsp.data.entities;
                if(data.length == 0){
                    dismissLoader();
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-keyword-no-result",
                        alertclass: "alert-warning",
                        content: "<i class='fa fa-keyboard-o pr10'></i><strong> 没有检索到匹配的数据 </strong>"
                    });
                }
                else {
                    _queryResult = data;
                    renderTotalInfo(entityId, _queryResult.length, rsp.message);
                    buildTagResTpl();
                    dismissLoader();
                }
            }
        });
    }
    //人脸识别
    else if (searchType == 3){
        $.getJSON('/renlifang/personcore/getFaceRecogResult',{
            faceRecogTaskId: faceRecogTaskId
        },function(rsp){
            if (rsp.code == 0){
                var data = rsp.data;
                if(data.length == 0){
                    dismissLoader();
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-keyword-no-result",
                        alertclass: "alert-warning",
                        content: "<i class='fa fa-keyboard-o pr10'></i><strong> 没有检索到匹配的数据 </strong>"
                    });
                }
                else {
                    renderTargetPhotoInfo(rsp.data.picBase64,rsp.data.params.length);
                    batchGetPersonSummary(rsp.data.params);
                    dismissLoader();
                }
            }
        })
    }

    function renderTargetPhotoInfo(picBase64,resultCount){
        $("#search-result").fadeIn();
        $("b#result-count").text(" " + resultCount + " ")
        $("#result-keyword").hide();
        $('#targetphoto').attr('src',picBase64);
        $('#targetphoto').attr('visibility','visible');
    }

    function batchGetPersonSummary(params){
        $.getJSON('/renlifang/personcore/batchGetPersonSummary',{
            params: params
        },function(rsp){
            if (rsp.code == 0){
                _queryResult = rsp.data.entities;
                buildTagResTpl();
            }
            dismissLoader();
        })
    }

    function buildTagResTpl() {
        $("#search-result").fadeIn();
        var ul = $(".search-result");
        ul.empty();

        // info-item-line-1 info-item-line-2
        var tplInfo = _.template("<span class='mr10' id='for-remove'><%- key %>：<span class='text-primary'><%- value %></span></span>");

        var resultRow;
        _.each(_queryResult, function (item) {
            item.base64id = BASE64.encoder(item.id);
            item.base64typeid = BASE64.encoder('' + item.typeId);
            item.linkUrl = UrlUtil.getProfileUrl(item.id, item.typeId)
            resultRow = $(tagTpl(item));
            ul.append(resultRow);

            // info-item-line-1
            var start = 0,
                end = item.properties.length - 1,
                reverseIndex = 0
            var m = 0,
                n = 0;
            var arr1 = [],
                arr2 = [];
            // 前后都一起开始遍历
            while (start <= end) {
                if (m <= n) {
                    arr1.push(item.properties[start]);
                    m += getLength(arr1[start].key) + getLength(arr1[start].value);
                    start++;
                } else {
                    arr2.push(item.properties[end]);
                    n += getLength(arr2[reverseIndex].key) + getLength(arr2[reverseIndex].value);
                    end--;
                    reverseIndex++
                }
            }

            // 手动保证第一行的字符数小于第二行
            if (m > n) {
                var popItem = arr1.pop();
                arr2.push(popItem);
            }

            // append line1 tpl
            _.each(arr1, function (item) {
                var line1 = tplInfo({
                    key: item.key,
                    value: item.value
                });
                resultRow.find("#info-item-line-1").append(line1);
            });

            // append line2 tpl
            _.each(arr2, function (item) {
                var line2 = tplInfo({
                    key: item.key,
                    value: item.value
                });
                resultRow.find("#info-item-line-2").append(line2);
            });

            //头像
            var head = resultRow.find("#head-base64");
            head.attr('src', '/renlifang/personcore/getpersonphoto?identityid=' + item.id+ '&type=' + item.typeId);

            if (item.similarity){
                var facePhoto =  resultRow.find("#face-photo");
                var simTmp = _.template("<div><span class='mr10'>相似度: <span class='text-danger'><%- similarity %></span></span></div>")
                facePhoto.append(simTmp({
                    similarity : item.similarity
                }))
            }
        });

        if(_queryResult.length >= 20){
            ul.append("<i class='fa pr10'></i><strong>更多结果请通过标签筛选功能获取</strong>");
        }
    }


    // 姓名+生日模式人立方检索
    //function getQueryResult(index, length, times) {
    //    $.getJSON('/renlifang/personcore/getpcqueryresult', {
    //        entityid: entityId,
    //        entitytype: entityType,
    //        startindex: index,
    //        length: length
    //    }, function (rsp) {
    //        if (rsp.code == 0) {
    //            _queryResult = rsp.data.resultList;
    //            _resultCount = rsp.data.totalCount;
    //
    //            renderTotalInfo(entityId, _resultCount, rsp.message);
    //            buildTpl();
    //            dismissLoader();
    //        } else if (times < 3) {
    //            getQueryResult(index, length, times + 1);
    //        } else {
    //            dismissLoader();
    //            Alert.show({
    //                container: $("#alert-container"),
    //                alertid: "alert-load-fail",
    //                alertclass: "alert-danger",
    //                content: "<i class='fa fa-coffee pr10'></i><strong> 服务器出错，请稍候 </strong>"
    //            });
    //        }
    //    });
    //}


    //模糊查询获取人详情
    function getFuzzyQueryResult(resEntityId, resEntityType, index, length, times){
        $.getJSON('/renlifang/personcore/getpersondetail', {
            entityid: resEntityId,
            entitytype: resEntityType
        }, function (rsp) {
            if (rsp.code == 0) {
                var personSummary = rsp.data.summary;
                if(personSummary.length == 0){
                    dismissLoader();
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-keyword-no-result",
                        alertclass: "alert-warning",
                        content: "<i class='fa fa-keyboard-o pr10'></i><strong> 没有检索到匹配的数据 </strong>"
                    });
                }else {
                    var personData = {};
                    personData.info = [];
                    _.each(personSummary, function (item) {
                        var keyValue = {};

                        if (item.name == 'CNAME') {
                            if (!_.isEmpty(item.valueList)) {
                                personData.keyword = item.valueList[0].value;
                                keyValue.key = item.caption;
                                keyValue.value = item.valueList[0].value;
                                personData.info.push(keyValue);
                            }
                        } else if (item.name == 'BIRTHDAY') {
                            if (!_.isEmpty(item.valueList)) {
                                keyValue.key = item.caption;
                                keyValue.value = item.valueList[0].value;
                                personData.info.push(keyValue);
                            }
                        } else if (item.name == 'SFZ') {
                            if (!_.isEmpty(item.valueList)) {
                                personData.entityid = item.valueList[0].value;
                                personData.entitytype = 1;
                                personData.sfz = item.valueList[0].value;
                                keyValue.key = item.caption;
                                keyValue.value = item.valueList[0].value;
                                personData.info.push(keyValue);
                            }
                        } else if (item.name == 'GENDER') {
                            if (!_.isEmpty(item.valueList)) {
                                keyValue.key = item.caption;
                                keyValue.value = item.valueList[0].value;
                                personData.info.push(keyValue);
                            }
                        }

                    });

                    if (personMap.indexOf(personData.entityid < 0)) {
                        personMap.push(personData.entityid);
                        _queryResult.push(personData);
                    }
                }
            } else if (times < 3) {
                getFuzzyQueryResult(resEntityId, resEntityType, index, length, times + 1);
            } else {
                dismissLoader();
                Alert.show({
                    container: $("#alert-container"),
                    alertid: "alert-load-fail",
                    alertclass: "alert-danger",
                    content: "<i class='fa fa-coffee pr10'></i><strong> 模糊查询获取详情失败 </strong>"
                });
                return;
            }
        });
    }


    // 填上搜索结果数量
    function renderTotalInfo(entityId, resultCount, hint) {
        $("b#result-count").text(" " + resultCount + " ")
        $("b#result-keyword").text(" " + entityId + " ");
        $('h4#result-hint').text(hint ? hint : '');
    }

    function buildTpl() {
        $("#search-result").fadeIn();
        var ul = $(".search-result");
        ul.empty();

        // info-item-line-1 info-item-line-2
        var tplInfo = _.template("<span class='mr10' id='for-remove'><%- key %>：<span class='text-primary'><%- value %></span></span>");

        var resultRow;
        _.each(_queryResult, function (item) {
            item.linkUrl = UrlUtil.getProfileUrl(item.entityid, item.typeId)
            resultRow = $(tpl(item));
            ul.append(resultRow);

            // info-item-line-1 info-item-line-2
            var start = 0,
                end = item.info.length - 1,
                reverseIndex = 0
            var m = 0,
                n = 0;
            var arr1 = [],
                arr2 = [];
            // 前后都一起开始遍历
            while (start <= end) {
                if (m <= n) {
                    arr1.push(item.info[start]);
                    m += getLength(arr1[start].key) + getLength(arr1[start].value);
                    start++;
                } else {
                    arr2.push(item.info[end]);
                    n += getLength(arr2[reverseIndex].key) + getLength(arr2[reverseIndex].value);
                    end--;
                    reverseIndex++
                }
            }

            // 手动保证第一行的字符数小于第二行
            if (m > n) {
                var popItem = arr1.pop();
                arr2.push(popItem);
            }

            // append line1 tpl
            _.each(arr1, function (item) {
                var line1 = tplInfo({
                    key: item.key,
                    value: item.value
                });
                resultRow.find("#info-item-line-1").append(line1);
            });

            // append line1 tpl
            _.each(arr2, function (item) {
                var line2 = tplInfo({
                    key: item.key,
                    value: item.value
                });
                resultRow.find("#info-item-line-2").prepend(line2);
            });


            //头像
            var head = resultRow.find("#head-base64");
            head.attr('src', '/renlifang/personcore/getpersonphoto?identityid=' + item.entityid + '&type=' + item.typeId);

        });
    }


    function dismissLoader() {
        hideLoader();
        $('#search-progress').hide();
    }

    // 多值计算长度
    function getLength(item) {
        var itemLength = 0;
        if (typeof item === String) {
            itemLength = item.length;
        } else {
            _.each(item, function (item1) {
                itemLength += item1.length;
            });
        }
        return itemLength;
    }

});
