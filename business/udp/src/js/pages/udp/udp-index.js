initLocales();
require(['../../tpl/udp/udp-search-result-li',
        '../../tpl/udp/udp-search-result-yth-item',
        '../../tpl/udp/udp-search-result-yth-container',
        '../../tpl/udp/udp-search-result-yth-detail',
        '../../tpl/udp/udp-search-result-yw-container',
        '../../tpl/udp/udp-search-result-yw-item',
        '../../tpl/udp/struct-dataview',
        '../../tpl/udp/date-time-filter',
        '../../module/udp/udp-pagination',
        'underscore', 'nova-alert',
        '../../module/udp/udp-datetimepicker',
        'udp-file-util',
        'utility/loaders',
        '../../module/udp/udp-toolbar',
        //'module/smartquery/toolbar',
        '../../module/udp/udp-jqx-binding',
        //'widget/jqx-binding',
        'nova-notify', 'nova-utils', 'q',
        "jquery.magnific-popup", "utility/utility"
    ],
    function(resultLiTpl, ythItemTpl, ythContainerTpl, ythDetailTpl, ywContainerTpl, ywItemTpl, dataViewTpl, dateTimeFilterTpl, Pagination, _, Alert, datetimepicker, fileUtil, DOMLoader,
        toolbar, jqxBinding, Notify, NovaUtils, Q) {
        $('#exchange').on('click', function(event) {
            $('#toolbox').toggleClass("rp");
        });
        var _renderOnce;
        var _sessionID;
        var _totalCount = 0;
        var sessionArray = [];
        var textlibindex = 0;

        var curCategory = 0;
        var displayCategory;
        var displayYTHResult;
        var countPerPage;
        var structPageCount = 30;
        var presetCountPerPage;
        var _presetLengths = [10, 30, 50, 100, 200, 500];
        var _presetExist = false;
        var curYTHID = undefined;


        var scriptOP = false;
        var _displayResultCount = 0;
        var _displayRecordsLimit = 100000; //接口只能返回前10万条数据，故限定展示最大记录数为10万

        //适配屏幕大小确定结构化表格展示结果条数
        //jqxgrid每行高约25.3px，此处计算能容纳的结构化表格行数
        //50为表格头部工具条高度，74为分页组件高度
        var tblHeight = window.innerHeight - 50 - 74 - $('.search-result').offset().top;
        if (tblHeight / 25 < 31 && tblHeight / 25 > 26) {
            structPageCount = 25;
        } else if (tblHeight / 25 < 26 && tblHeight / 25 > 21) {
            structPageCount = 20;
        } else if (tblHeight / 25 < 21 && tblHeight / 25 > 16) {
            structPageCount = 15;
        } else if (tblHeight / 25 < 16) {
            structPageCount = 10;
        }

        // var unStructPageCount = 10;
        var unStructPageCount;

        var defaultHeight = 320;
        var rowHeight = 26;
        var CATE_DEF = {

            STRUCT: 1, //结构化数据 
            UNSTRUCT: 2, //非结构化数据  
            MIX: 3, //混合数据 
            YTH: 4 //一体化数据
        }



        //各模板初始化
        resultLiTpl = _.template(resultLiTpl);
        ythItemTpl = _.template(ythItemTpl);
        ythContainerTpl = _.template(ythContainerTpl);
        ythDetailTpl = _.template(ythDetailTpl);
        ywContainerTpl = _.template(ywContainerTpl);
        ywItemTpl = _.template(ywItemTpl);
        dateTimeFilterTpl = _.template(dateTimeFilterTpl);

        dataViewTpl = _.template(dataViewTpl);

        cond = JSON.parse(sessionStorage.getItem("cond"));

        if (!cond) {
            window.location.href = "search.html";
            return;
        }

        var searchKeyword = cond.keyword;
        var precisemode = cond.precisemode;
        if (precisemode != undefined) {
            $('#precisemode')[0].checked = precisemode;
        }

        $('#keyword').val(searchKeyword);

        bussiDateRange = cond.bussiDateRange;
        fileloadDateRange = cond.fileloadDateRange;
        unStructPageCount = parseInt(cond.countPerPage);
        presetCountPerPage = parseInt(cond.countPerPage);
        if (_.find(_presetLengths, function(p) {
                return p == presetCountPerPage;
            }) != undefined) {
            _presetExist = true;
        }
        countPerPage = presetCountPerPage;


        // console.log("textlibmappings", textlibmappings);



        var textlibDirs = cond.textlibs;
        var textlibmappings = [];
        _.each(textlibDirs, function(v) {
            textlibmappings = _.union(textlibmappings, v.textlibs);
        });
        // console.log(textlibmappings)

        var ythALL = _.find(textlibmappings, function(v) {
            return v.category == 4 && v.libID == -1022;
        })

        var ythSecondaryCateArray = [];
        if (ythALL) {
            for (var i = 0; i < cond.secondaryCategoriesInfo.ythItems.length; i++) {
                ythSecondaryCateArray.push(cond.secondaryCategoriesInfo.ythItems[i].libID);
            }
            // console.log(ythSecondaryCateArray)
        }
        var $resultList = $('#result-list');





        //生成左侧列表目录项
        _.each(textlibDirs, function(v) {
            var html = resultLiTpl(v);
            $resultList.append(html);
        })




        datetimepicker.setDatetime({
            bussiDateRange: bussiDateRange,
            fileloadDateRange: fileloadDateRange
        });


        var submitJsonArray = makeSubmitArray(searchKeyword);

        function makeSubmitArray(searchKeyword) {
            var _submitJsonArray = [];

            if (_.isEmpty(searchKeyword)) {
                return _submitJsonArray;
            }
            // $scrollerPanel = $('#textlibs').find('a').parent();
            // $scrollerPanel.empty();

            _.each(textlibmappings, function(item) {

                var submitJson = {
                    "priority": 1,
                    "maxResultCount": 500,
                    "dataScope": 1,
                    "name": "12345",
                    "needSummary": true
                };
                var queryCond = {};

                var contentValue = [];
                contentValue.push(searchKeyword);
                var bussinessDate = [];
                bussinessDate.push(cond.bussiDateRange.split("-")[0].replace(/\//g, '-').trim() + ' 00:00:00');
                bussinessDate.push(cond.bussiDateRange.split("-")[1].replace(/\//g, '-').trim() + ' 23:59:59');
                var fileloadDate = [];
                fileloadDate.push(cond.fileloadDateRange.split("-")[0].replace(/\//g, '-').trim() + ' 00:00:00');
                fileloadDate.push(cond.fileloadDateRange.split("-")[1].replace(/\//g, '-').trim() + ' 23:59:59');
                queryCond = {
                    "children": [{
                        "column": "CONTENT",
                        "composite": false,
                        "opr": precisemode ? "equal" : "like",
                        "value": contentValue
                    }, {
                        "column": "FILE_TIME",
                        "composite": false,
                        "opr": "between",
                        "value": bussinessDate
                    }, {
                        "column": "LOAD_TIME",
                        "composite": false,
                        "opr": "between",
                        "value": fileloadDate
                    }],
                    "composite": true,
                    "logicOperator": "and"
                };

                sortCond = {
                    column: "_score",
                    sortOrder: "none"
                };

                var returnColumn = [];

                typeId = item.libID;
                typeName = item.libName;
                libCategory = item.category;
                libId = typeId;

                switch (libCategory) {
                    case CATE_DEF.YTH:
                        queryCond.children.push({
                            "column": "TABLE_ID",
                            "composite": false,
                            "opr": "in",
                            "value": ythSecondaryCateArray

                        })
                        returnColumn = ["TABLE_ID", "RECORD_ID", "TITLE", "CREATOR", "EDITOR",
                            "CREATE_TIME", "EDIT_TIME", "ATTACH_ID", "ATTACH_NAME"
                        ];
                        sortCond.sortOrder = "desc";
                        if (ythSecondaryCateArray.length > 0) {
                            submitJson.aggCond = {
                                column: 'TABLE_ID',
                                type: 'terms'
                            }
                        }
                        break;
                    case CATE_DEF.UNSTRUCT:
                        returnColumn = ["FILE_TIME", "LOAD_TIME", "FILE_ID", "FILE_PATH", "FILE_NAME"];
                        break;
                    default:
                        break;
                }


                submitJson.returnColumn = returnColumn;
                submitJson.queryCond = queryCond;
                submitJson.sortCond = sortCond;


                submitJson.dataType = {
                    "centerCode": "100000",
                    "dataSet": typeName,
                    "typeId": typeId,
                    "zoneId": 1,
                    "libId": libId,
                    "category": libCategory
                };
                _submitJsonArray.push(submitJson);
                // html = '<a href="#" category = "' + libCategory + '" id="' + libId + '" class="list-group-item">' + typeName + '<img class="msg-count" style="width: 26px;height: 26px" src="../../img/udp/Loading.gif"></a>';
                // $scrollerPanel.append(html);
            });
            // console.log(_submitJsonArray)
            return _submitJsonArray;
        }

        // 提交查询 获得 querySessionID
        // $('#search-button').attr('disabled','true')
        $.post("/udp/udp/submit", {
            submit: submitJsonArray
        }).done(function(rsp) {
            rsp = JSON.parse(rsp)
            if (rsp.code != 0) {
                dismissLoader();
                Alert.show({
                    container: $("#alert-container"),
                    alertid: "alert-load-fail",
                    alertclass: "alert-danger",
                    content: "<i class='fa fa-coffee pr10'></i><strong> 服务器出错，请稍候 </strong>"
                });
                $('#textlibs').addClass("hidden");
                $("#search-result").fadeIn();
                var ul = $(".search-result");
                ul.empty();
                ul.append('<div><p style="font-size:16px;color:red">提交全文检索请求发生异常，请开发人员排查！</p></div>');
                return;
            }
            _totalCount = 0;
            sessionArray = rsp.data;
            curCategory = textlibmappings[0].category;
            displayCategory = textlibmappings[0].category;
            querySessionID = getSessionIDByLibID(textlibmappings[0].libID, curCategory);

            showLoader();

            // switch (curCategory) {
            //     case CATE_DEF.STRUCT:
            //     case CATE_DEF.MIX:
            //         countPerPage = structPageCount;
            //         break
            //     case CATE_DEF.UNSTRUCT:
            //     case CATE_DEF.YTH:
            //     default:
            //         countPerPage = unStructPageCount;
            //         break;
            // }

            getQueryResult(querySessionID, 0, countPerPage, true);
            _renderOnce = 1;

        });

        // 根据资料库ID获取对应的资料库名称
        function getNameByID(libID) {
            libID = parseInt(libID);
            for (i = 0; i < textlibmappings.length; i++) {
                libid = textlibmappings[i].libID;
                if (libID == libid) {
                    return textlibmappings[i].libName;
                }
            }
            return '未知';
        }

        // 根据SessionID获取对应的资料库ID
        function getLibIDBySessionID(sessionID, curCategory) {
            for (i = 0; i < sessionArray.length; i++) {
                sessionid = sessionArray[i].sessionId;
                if (sessionid === sessionID) {
                    if (curCategory == CATE_DEF.YTH) {
                        return sessionArray[i].dataTypeId;
                    } else {
                        return sessionArray[i].textLibId;
                    }

                }
            }
        }

        function getCategoryBySessionID(sessionID) {
            var typeId = getLibIDBySessionID(sessionID);
            for (i = 0; i < textlibmappings.length; i++) {;
                if (textlibmappings[i].libID == typeId) {
                    return textlibmappings[i].category;
                }
            }
            return '未知';
        }

        // 根据资料库ID获取对应的SessionID
        function getSessionIDByLibID(libID, curCategory) {
            if (curCategory == CATE_DEF.YTH) {
                for (i = 0; i < sessionArray.length; i++) {
                    var dataTypeId = sessionArray[i].dataTypeId;
                    if (dataTypeId == libID) {
                        return sessionArray[i].sessionId;
                    }
                }
            } else {
                for (i = 0; i < sessionArray.length; i++) {
                    var libid = sessionArray[i].textLibId;
                    if (libid == libID) {
                        return sessionArray[i].sessionId;
                    }
                }
            }


        }


        // 根据 querySessionID 获得查询结果
        function getQueryResult(id, index, length, recursive) {
            if (id != -1) {
                //showLoader();
                dataTypeId = getLibIDBySessionID(id, curCategory);


                var params = {
                    "sessionID": id,
                    "startIndex": index,
                    "length": length
                };
                if (recursive == false) {
                    dataTypeId = getLibIDBySessionID(id, displayCategory);
                    if (curYTHID != undefined) {
                        params.addCond = {
                            column: 'TABLE_ID',
                            value: [curYTHID]
                        }
                    }

                }
                if (params.startIndex + params.length > _displayRecordsLimit) {
                    params.length = _displayRecordsLimit - params.startIndex;
                }
                // switch(curCategory2){
                //     case CATE_DEF.YTH:
                //         params.addCond = {
                //             column:'TABLE_ID',
                //             value: ythSecondaryCateArray
                //         }
                //         break;
                //     default:
                //         break;
                // }

                element = '#' + dataTypeId;
                $.getJSON('/udp/udp/getResult', params).done(function(rsp) {
                    if (rsp.code == 0) {
                        var queryResult = rsp.data.ftrResults;
                        var structQueryResult = rsp.data.structResults;
                        var _resultCount = rsp.data.totalResultCount || 0;
                        var timeCost = rsp.data.timeCost || 0;

                        dispCount = _resultCount;
                        if (_resultCount / 10000 > 1) {
                            dispCount = (_resultCount / 10000).toFixed(1) + "w";
                        }
                        if (_resultCount / 100000000 > 1) {
                            dispCount = (_resultCount / 100000000).toFixed(1) + "e";
                        }

                        if (recursive == true) {
                            $(element).find('img').remove();
                            $(element).find('span').remove();

                            _totalCount += _resultCount;
                            // renderCount(_totalCount);

                            if (_resultCount != 0) {
                                $(element).show();
                                $(element).addClass('visible')
                                if (_renderOnce == 1) {
                                    $(element).addClass("bg");
                                    $(element).append('<span class="msg-count badge badge-info" >' + dispCount + '</span>');

                                    //Notify.show({
                                    //    title: '此目录含有数据或子目录,不支持删除1',
                                    //    type: 'danger'
                                    //});
                                    _sessionID = id;
                                    displayCategory = curCategory;
                                    _displayResultCount = _resultCount > _displayRecordsLimit ? _displayRecordsLimit : _resultCount;

                                    var page = Math.ceil(_displayResultCount / countPerPage);

                                    switch (curCategory) {
                                        case CATE_DEF.STRUCT:
                                        case CATE_DEF.MIX:
                                            buildStructTable(structQueryResult, searchKeyword, page);
                                            renderSearchInfo(timeCost, dispCount, searchKeyword);

                                            break;
                                        case CATE_DEF.UNSTRUCT:
                                            buildYWTpl(dataTypeId, queryResult, page)
                                            renderSearchInfo(timeCost, dispCount, searchKeyword);

                                            break;
                                            // case CATE_DEF.MIX:
                                        case CATE_DEF.YTH:
                                            buildYTHTpl(dataTypeId, queryResult, page);
                                            renderSearchInfo(timeCost, dispCount, searchKeyword);
                                            break;
                                        default:
                                            break;

                                    }


                                    //Notify.show({
                                    //    title: 'page1: '+page,
                                    //    type: 'danger'
                                    //});
                                    // renderTimeCount(timeCost);
                                    dismissLoader();

                                    _renderOnce = 0;

                                } else {
                                    $(element).append('<span class="msg-count badge badge-info" >' + dispCount + '</span>');
                                }
                            } else {
                                // $(element).addClass("hidden");
                                $(element).hide();
                                $(element).removeClass('visible')
                            }


                            //添加一次捞取的作战指挥数据各分类结果数信息
                            if (getCategoryBySessionID(id) == CATE_DEF.YTH) {
                                var aggArray = rsp.data.aggsResults;
                                var $ythCateList = $('#-1022').closest('.panel-body');
                                for (var i = 0; i < aggArray.length; i++) {
                                    var record = _.find(cond.secondaryCategoriesInfo.ythItems, function(v) {
                                        return v.libID == parseInt(aggArray[i].key);
                                    })
                                    var caption = record.libName;
                                    var appendHTML = '<a href="#" category="4" id="' + aggArray[i].key + '" class="list-group-item visible" style="">' + caption + '<span class="msg-count badge badge-info">' + aggArray[i].doc_count + '</span></a>';
                                    $ythCateList.append(appendHTML);
                                }
                            }



                            textlibindex++;
                            if (textlibindex >= sessionArray.length) {
                                if (_totalCount == 0) {
                                    // renderTimeCount(timeCost);
                                    $("#search-result").fadeIn();
                                    var ul = $(".search-result");
                                    ul.empty();
                                    ul.append('<div><p id="no-result-warning" style="font-size:16px;color:red">没有相应的检索结果，请修改条件重新检索！</p></div>');
                                }
                                $('#result-list .list-group').each(function() {

                                    if ($(this).find(' .panel>.panel-body>a.visible').length == 0) {
                                        // $(' .list-group-header>span', this).hide();
                                        $(' .list-group-header', this).removeClass('not-empty')
                                    } else {
                                        // $(' .list-group-header>span', this).show();
                                        $(' .list-group-header', this).addClass('not-empty')
                                    }
                                })

                                $('.list-group-header img').hide();
                                // $('#search-button').removeAttr('disabled')


                                dismissLoader();
                            } else {

                                curCategory = textlibmappings[textlibindex].category;
                                // switch (curCategory) {
                                //     case CATE_DEF.STRUCT:
                                //     case CATE_DEF.MIX:
                                //         countPerPage = structPageCount;
                                //         break
                                //     case CATE_DEF.UNSTRUCT:
                                //     case CATE_DEF.YTH:
                                //     default:
                                //         countPerPage = unStructPageCount;
                                //         break;
                                // }
                                querySessionID = getSessionIDByLibID(textlibmappings[textlibindex].libID, curCategory);

                                if (_totalCount == 0) {
                                    getQueryResult(querySessionID, 0, countPerPage, true);
                                } else {
                                    getQueryResult(querySessionID, 0, 0, true);
                                }
                            }
                        } else {
                            //Notify.show({
                            //    title: '此目录含有数据或子目录,不支持删除2',
                            //    type: 'danger'
                            //});
                            _displayResultCount = _resultCount > _displayRecordsLimit ? _displayRecordsLimit : _resultCount;
                            var page = Math.ceil(_displayResultCount / countPerPage);;


                            switch (displayCategory) {
                                case CATE_DEF.STRUCT:
                                case CATE_DEF.MIX:
                                    buildStructTable(structQueryResult, searchKeyword, page);
                                    renderSearchInfo(timeCost, dispCount, searchKeyword);
                                    break;
                                case CATE_DEF.UNSTRUCT:
                                    buildYWTpl(dataTypeId, queryResult, page);
                                    renderSearchInfo(timeCost, dispCount, searchKeyword);
                                    break;
                                case CATE_DEF.YTH:
                                    buildYTHTpl(dataTypeId, queryResult, page);
                                    renderSearchInfo(timeCost, dispCount, searchKeyword);
                                    break;
                                default:
                                    break;
                            }


                            dismissLoader();
                            // Pagination.renderPagination(page);
                            _sessionID = id;
                        }
                    } else if (recursive == false) {
                        //Notify.show({
                        //    title: '此目录含有数据或子目录,不支持删除3',
                        //    type: 'danger'
                        //});

                        buildYWTpl(dataTypeId, [], 0);
                        dismissLoader();
                        // Pagination.renderPagination(0);
                    } else {
                        textlibindex++;
                        if (textlibindex >= sessionArray.length) {
                            if (_totalCount == 0) {
                                // renderTimeCount(timeCost);
                                $("#search-result").fadeIn();
                                var ul = $(".search-result");
                                ul.empty();
                                ul.append('<div><p id="no-result-warning" style="font-size:16px;color:red">没有相应的检索结果，请修改条件重新检索！</p></div>');
                            }
                            $('#result-list .list-group').each(function() {

                                if ($(this).find(' .panel>.panel-body>a.visible').length == 0) {
                                    // $(' .list-group-header>span', this).hide();
                                    $(' .list-group-header', this).removeClass('not-empty')
                                } else {
                                    // $(' .list-group-header>span', this).show();
                                    $(' .list-group-header', this).addClass('not-empty')
                                }
                            })

                            $('.list-group-header img').hide();
                            // $('#search-button').removeAttr('disabled')


                            dismissLoader();
                        } else {
                            $(element).hide();
                            $(element).removeClass('visible')
                            curCategory = textlibmappings[textlibindex].category;
                            // switch (curCategory) {
                            //     case CATE_DEF.STRUCT:
                            //     case CATE_DEF.MIX:
                            //         countPerPage = structPageCount;
                            //         break
                            //     case CATE_DEF.UNSTRUCT:
                            //     case CATE_DEF.YTH:
                            //     default:
                            //         countPerPage = unStructPageCount;
                            //         break;
                            // }
                            querySessionID = getSessionIDByLibID(textlibmappings[textlibindex].libID, curCategory);

                            if (_totalCount == 0) {
                                getQueryResult(querySessionID, 0, countPerPage, true);
                            } else {
                                getQueryResult(querySessionID, 0, 0, true);
                            }
                        }
                    }

                    dismissLoader();
                });
            } else if (recursive == true) {
                textlibindex++;
                if (textlibindex >= sessionArray.length) {
                    if (_totalCount == 0) {
                        $("#search-result").fadeIn();
                        var ul = $(".search-result");
                        ul.empty();
                        ul.append('<div><p id="no-result-warning" style="font-size:16px;color:red">没有相应的检索结果，请修改条件重新检索！</p></div>');
                    }
                    dismissLoader();
                    // $('#search-button').removeAttr('disabled')
                    // document.getElementById('search-button').disabled = false;
                    // console.log('in disabled')

                } else {
                    curCategory = textlibmappings[textlibindex].category;
                    querySessionID = getSessionIDByLibID(textlibmappings[textlibindex].libID, curCategory);
                    if (_totalCount == 0) {
                        displayCategory = curCategory;
                        _displayResultCount = 0;
                        getQueryResult(querySessionID, 0, countPerPage, true);
                    } else {
                        getQueryResult(querySessionID, 0, 0, true);
                    }
                }
            }
        }

        // 从 search.html URL 传参中获得搜索关键字
        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
        }





        function renderSearchInfo(timeCount, resultCount, searchKeyword) {
            // 填上搜索时间
            $("b#time-count").text(timeCount);

            // 搜索结果页面结果计数及搜索关键字
            $("b#result-count").text(("" + resultCount).split("").reverse().join("").replace(/(\d{3})/g, "$1,").split("").reverse().join("").replace(/^,/g, ""));
            if (_.isEmpty($('#keyword').val())) {
                $("b#result-keyword").text(" ... ");
            } else {
                $("b#result-keyword").text(" " + searchKeyword + " ");
            }
        }


        // 生成业务数据的非结构化数据模板
        function buildYWTpl(dataTypeId, queryResult, page) {
            // category = parseInt(category);
            $("#search-result").fadeIn();
            var $resultContainer = $(".search-result");
            $resultContainer.empty();

            $resultContainer.append(ywContainerTpl());
            var $ul = $('#yw-result-list');



            i = 0;
            _.each(queryResult, function(item) {
                var resultRow;
                item.searchkeyword = searchKeyword;
                doc = JSON.stringify({
                    docID: item.docId,
                    uuidName: item.docId.id,
                    fileName: item.FILE_NAME[0],
                    dataTypeId: dataTypeId
                });

                resultRow = ywItemTpl({
                    docName: item.FILE_NAME[0],
                    docSummary: JSON.stringify(item.summary),
                    docModifyTime: item.FILE_TIME[0].toString().replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3 $4:$5:$6'),
                    docLoadTime: item.LOAD_TIME[0].toString().replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3 $4:$5:$6'),
                    docScore: item.score || 1,
                    doc: doc,
                    id: "search-result-" + i
                });
                $ul.append(resultRow);
                i++;
            });
            setDOMCountPerPage();

            Pagination.renderPagination(page);

            setHeight($ul, 70);



        }

        function buildYTHTpl(dataTypeId, ythResult, page) {
            var libName = getNameByID(dataTypeId);
            displayYTHResult = ythResult;
            $("#search-result").fadeIn();
            var $resultContainer = $(".search-result");

            var tplHTML;

            //清空中间部分内容，append一体化的结果container模板
            $resultContainer.empty();
            $resultContainer.append(ythContainerTpl({
                title: libName
            }));
            var $ul = $('#yth-result-list');





            //每条记录的详情跳转url与下载的附件文件位置需要在此时请求获得，准备好请求参数
            var records = [];
            var attachIds = [];
            var attachObjs = [];
            _.each(ythResult, function(item) {
                var recordId = parseInt(item.RECORD_ID[0]);
                var tableID = parseInt(item.TABLE_ID[0]);
                if ((!isNaN(recordId)) && (!isNaN(tableID)) && parseInt(item.hasAuth) == 1) {
                    records.push({
                        recordId: recordId,
                        tableID: tableID
                    })
                }



                var attachId = item.ATTACH_ID
                if (parseInt(item.hasAuth) == 1) {
                    for (var i = 0; i < attachId.length; i++) {
                        attachIds.push(attachId[i])
                        attachObjs.push({
                            attachId: item.ATTACH_ID[i],
                            attachName: item.ATTACH_NAME[i]
                        })
                    }
                }
            })

            //具有权限的记录数大于0
            if (records.length > 0) {
                var detailUrlPromise = NovaUtils.makeRetryGet('/udp/udp/getYTHRecordDetailURL', {
                    records: records
                });
                detailUrlPromise.then(function(detailUrlData) {
                        var attachPromise;

                        //有权限的附件数大于0
                        if (attachIds.length > 0) {
                            attachPromise = NovaUtils.makeRetryGet('/udp/udp/getYTHDownloadFilePath', {
                                fileId: attachIds
                            });
                            attachPromise.then(function(attachData) {
                                    _.each(ythResult, function(item) {
                                        var link = '#';
                                        var flink = _.find(detailUrlData.urls, function(urls) {
                                            return urls.recordId == parseInt(item.RECORD_ID[0])
                                        })
                                        if (flink) {
                                            link = '/spyintegration' + flink.url;
                                        }
                                        var attachs = [];
                                        for (var i = 0; i < item.ATTACH_ID.length; i++) {
                                            var attachObj = _.find(attachObjs, function(aO) {
                                                return aO.attachId == item.ATTACH_ID[i];
                                            })
                                            if (attachObj) {
                                                var pathObj = _.find(attachData, function(aD) {
                                                    return aD.fileId == attachObj.attachId;
                                                })
                                                if (pathObj) {
                                                    attachObj.path = pathObj.filePath;
                                                } else {
                                                    attachObj.path = '#';
                                                }
                                                attachs.push(attachObj);
                                            }
                                        }


                                        tplHTML = ythItemTpl({
                                            title: item.TITLE[0],
                                            creator: item.CREATOR[0],
                                            createTime: item.CREATE_TIME[0],
                                            editor: item.EDITOR[0],
                                            editTime: item.EDIT_TIME[0],
                                            summary: item.summary,
                                            tableId: item.TABLE_ID[0],
                                            recordId: item.RECORD_ID[0],
                                            attachs: attachs,
                                            hasAuth: item.hasAuth,
                                            link: link
                                        });
                                        $ul.append(tplHTML);
                                        Pagination.renderPagination(page);

                                        setHeight($ul, 70);
                                        setHeight($('#yth-result-detail'), 0);
                                        initFilter();
                                    })
                                })
                                //没有有权限的附件
                        } else {
                            _.each(ythResult, function(item) {
                                var link = '#';
                                var flink = _.find(detailUrlData.urls, function(urls) {
                                    return urls.recordId == parseInt(item.RECORD_ID[0])
                                })
                                if (flink) {
                                    link = '/spyintegration' + flink.url;
                                }
                                var attachs = [];
                                tplHTML = ythItemTpl({
                                    title: item.TITLE[0],
                                    creator: item.CREATOR[0],
                                    createTime: item.CREATE_TIME[0],
                                    editor: item.EDITOR[0],
                                    editTime: item.EDIT_TIME[0],
                                    summary: item.summary,
                                    tableId: item.TABLE_ID[0],
                                    recordId: item.RECORD_ID[0],
                                    attachs: attachs,
                                    hasAuth: item.hasAuth,
                                    link: link
                                });
                                $ul.append(tplHTML);
                                Pagination.renderPagination(page);

                                setHeight($ul, 70);
                                setHeight($('#yth-result-detail'), 0);
                                initFilter();
                            })
                        }

                    })
                    //有权限的记录都没有，更不会有有权限的附件
            } else {
                _.each(ythResult, function(item) {
                    var link = '#';
                    var attachs = [];
                    tplHTML = ythItemTpl({
                        title: item.TITLE[0],
                        creator: item.CREATOR[0],
                        createTime: item.CREATE_TIME[0],
                        editor: item.EDITOR[0],
                        editTime: item.EDIT_TIME[0],
                        summary: item.summary,
                        tableId: item.TABLE_ID[0],
                        recordId: item.RECORD_ID[0],
                        attachs: attachs,
                        hasAuth: item.hasAuth,
                        link: link
                    });
                    $ul.append(tplHTML);
                    Pagination.renderPagination(page);
                    setHeight($ul, 70);
                    setHeight($('#yth-result-detail'), 0);
                    initFilter();
                })
            }

            setDOMCountPerPage();




            // Q.allSettled([detailUrlPromise, attachPromise]).then(function() {
            // });
        }

        function bindYTHResultClick() {

        }



        function buildStructTable(structQueryResult, searchKeyword, page) {
            var $result = $(".search-result");
            $result.empty();

            // $result.append(ywContainerTpl());
            // var $div = $('#yw-result-div');

            $result.append(dataViewTpl());

            toolbar.init({
                container: $('#panel-menu'),
                submit: false,
                saveTask: false,
                saveModel: false,
                saveAsModel: false,
                exportData: true,
                download: false,
                statistic: false,
                filter: false,
                group: false,
                locate: false,
                sessionId: _sessionID
            });
            toolbar.renderToolbar();

            var panelHeight = document.getElementById('content_wrapper').offsetHeight;
            $('#gridContainer').height((structPageCount + 1) * rowHeight);

            jqxBinding.jqxDataBinding('#gridContainer', structQueryResult, searchKeyword);
            Pagination.renderPagination(page);

            setDOMCountPerPage();

        }

        function setHeight(container, adjustHeight) {
            // console.log('in setHeight')
            var height = window.innerHeight - container.offset().top - $('#page-ul').height() - adjustHeight;
            container.css({
                'height': height,
                'overflow-y': 'auto'
            })
        }

        function initFilter() {
            var contentHTML = dateTimeFilterTpl();
            $('#btn-filter').on('click', function() {
                Dialog.build({
                    title: "筛选日期范围",
                    content: contentHTML,
                    rightBtnCallback: function() {
                        Dialog.dismiss();
                    }

                }).show(function() {

                })
            })

        }


        // 翻页
        Pagination.init({
            container: $("#pagination"),
            pageCallback: function(currentPage) {
                showLoader();
                $("ul.search-result").empty();
                var params = {};

                switch (displayCategory) {
                    case CATE_DEF.STRUCT:
                    case CATE_DEF.MIX:
                        // countPerPage = structPageCount;
                        break;


                    case CATE_DEF.YTH:
                        // countPerPage = unStructPageCount;
                        var id = parseInt($('.bg').attr("id"));
                        if (id != -1022) {
                            params.addCond = {
                                column: 'TABLE_ID',
                                value: [id]
                            };
                        }
                        break;
                    case CATE_DEF.UNSTRUCT:
                    default:
                        // countPerPage = unStructPageCount;
                        break;
                }
                var pageIndex = (currentPage - 1) * countPerPage;
                params.sessionID = _sessionID;

                params.startIndex = pageIndex;
                params.length = countPerPage;
                if (params.startIndex + params.length > _displayRecordsLimit) {
                    params.length = _displayRecordsLimit - params.startIndex;
                }
                $.getJSON('/udp/udp/getResult', params).done(function(rsp) {
                    if (rsp.code == 0) {
                        queryResult = rsp.data.ftrResults;
                        // ythResult = rsp.data.ythResults;
                        var structQueryResult = rsp.data.structResults;
                        var _resultCount = rsp.data.totalResultCount || 0;


                        var timeCost = rsp.data.timeCost || 0;

                        var dispCount = _resultCount;
                        if (_resultCount / 10000 > 1) {
                            dispCount = (_resultCount / 10000).toFixed(1) + "w";
                        }
                        if (_resultCount / 100000000 > 1) {
                            dispCount = (_resultCount / 100000000).toFixed(1) + "e";
                        }
                        // console.log("queryResult", queryResult);
                        var page = Math.ceil(_displayResultCount / countPerPage);
                        switch (displayCategory) {
                            case CATE_DEF.STRUCT:
                            case CATE_DEF.MIX:
                                buildStructTable(structQueryResult, searchKeyword, page);
                                renderSearchInfo(timeCost, dispCount, searchKeyword);

                                break;
                            case CATE_DEF.UNSTRUCT:
                                buildYWTpl(dataTypeId, queryResult, page);
                                renderSearchInfo(timeCost, dispCount, searchKeyword);
                                break;
                            case CATE_DEF.YTH:
                                buildYTHTpl(dataTypeId, queryResult, page);
                                renderSearchInfo(timeCost, dispCount, searchKeyword);
                                break;
                            default:
                                break;

                        }
                        dismissLoader();
                        // Pagination.renderPagination(page);
                        // _sessionID = getSessionIDByLibID(id, displayCategory);

                    } else {
                        dismissLoader();
                        Notify.show({
                            title: '服务异常',
                            type: 'error'
                        });
                    }
                });

                // switch (displayCategory) {
                //     case CATE_DEF.STRUCT:
                //     case CATE_DEF.MIX:
                //         pageIndex = (currentPage - 1) * countPerPage;
                //         $("ul.search-result").empty();
                //         showLoader();
                //         getQueryResult(_sessionID, pageIndex, countPerPage, false);
                //         break;
                //     case CATE_DEF.UNSTRUCT:
                //     case CATE_DEF.YTH:
                //         pageIndex = (currentPage - 1) * countPerPage;
                //         $("ul.search-result").empty();
                //         showLoader();
                //         getQueryResult(_sessionID, pageIndex, countPerPage, false);
                //         break;
                //     default:
                //         break;
                // }
            }
        });

        //注册每页条数变化事件 
        $(document).on('change', '#pager_length_options', function(e) {
            if (!scriptOP) {
                showLoader();
                countPerPage = parseInt($('#pager_length_options').val())
                Pagination.setCurPage(1)
                getQueryResult(_sessionID, 0, countPerPage, false)
            }

        })

        $(document).on('click', '#toPageConfirm', function(e) {

            var gotoPage = parseInt($('#toPage').val());
            if (isNaN(gotoPage)) {
                Notify.show({
                    title: '请输入正确的数字',
                    type: 'error'
                });
                return;
            } else {

                var page = Math.ceil(_displayResultCount / countPerPage)
                if (gotoPage <= page && gotoPage > 0) {
                    showLoader();
                    Pagination.setCurPage(gotoPage);
                    getQueryResult(_sessionID, (gotoPage - 1) * countPerPage, countPerPage, false)
                } else {
                    Notify.show({
                        title: '页数不在有效范围内',
                        type: 'error'
                    });

                }
            }
        })

        //在生成模板时加上用户设置的每页条数，并选对当前每页条数
        function setDOMCountPerPage() {
            if (!_presetExist) {
                var added = false;
                $('#pager_length_options option').each(function(e) {
                    var p = parseInt($(this).val());
                    if (presetCountPerPage < p && !added) {
                        $(this).before('<option value="' + presetCountPerPage + '">' + presetCountPerPage + '</option>')
                        added = true;
                    }
                });


            }
            scriptOP = true;
            $('#pager_length_options').val(countPerPage);
            scriptOP = false;
        }

        function dismissLoader() {
            hideLoader();
        }

        // 检索结果页面重新提交检索
        $("#search-form").on('submit', function(event) {
            // 获取查询关键字
            searchKeyword = $("#keyword").val();

            if (_.isEmpty(searchKeyword)) {
                event.preventDefault();
                Alert.show({
                    container: $("#alert-container"),
                    alertid: "alert-keyword-empty",
                    alertclass: "alert-warning",
                    content: "<i class='fa fa-keyboard-o pr10'></i><strong> 请输入查询关键字！ </strong>"
                });
            } else {
                cond.keyword = searchKeyword;
                cond.precisemode = $('#precisemode').is(':checked');
                sessionStorage.setItem("cond", JSON.stringify(cond));
                window.location.href = 'index.html';

                // event.preventDefault();
                // showLoader();
                // // $('.search-result-loader-container').show();

                // $(".search-result").empty();
                // $('a.list-group-item').hide();
                // $('.list-group-header').removeClass('not-empty')
                // $('.list-group-header img').show();

                // submitJsonArray = makeSubmitArray(searchKeyword);
                // $('#search-button').attr('disabled','true')

                // $.post("/udp/submit", {
                //     submit: submitJsonArray
                // }).done(function(rsp) {
                //     rsp = JSON.parse(rsp);
                //     if (rsp.code != 0) {
                //         dismissLoader();
                //         Alert.show({
                //             container: $("#alert-container"),
                //             alertid: "alert-load-fail",
                //             alertclass: "alert-danger",
                //             content: "<i class='fa fa-coffee pr10'></i><strong> 服务器出错，请稍候 </strong>"
                //         });
                //         return;
                //     }
                //     _totalCount = 0;
                //     textlibindex = 0;
                //     sessionArray = rsp.data;
                //     curCategory = textlibmappings[0].category;
                //     displayCategory = textlibmappings[0].category;
                //     querySessionID = getSessionIDByLibID(textlibmappings[0].libID, curCategory);
                //     showLoader();
                //     getQueryResult(querySessionID, 0, countPerPage, true);
                //     _renderOnce = 1;
                // });
            }
        });

        //检索结果分类查看

        $(document).on('click', "#result-list a", function(event) {
            if (_renderOnce == 0) {
                $textlib = $(this);
                $textlib.siblings().each(function() {
                    // $(this).removeClass("bg");
                    if ($(this).find("span").hasClass("badge-warning")) {
                        $(this).find("span").removeClass("badge-warning");
                        $(this).find("span").addClass("badge-info");
                    }
                });
                $('a.list-group-item').removeClass('bg')
                showLoader();
                $textlib.addClass("bg");
                var libCategory = $(this).attr("category");
                var id = parseInt($(this).attr("id"));
                // console.log("libCategory", libCategory);
                displayCategory = parseInt(libCategory);
                _sessionID = getSessionIDByLibID(id, displayCategory);
                var params = {
                    "sessionID": _sessionID,
                    "startIndex": 0,
                };

                switch (displayCategory) {
                    case CATE_DEF.STRUCT:
                    case CATE_DEF.MIX:
                        // countPerPage = structPageCount;
                        curYTHID = undefined
                        break;
                    case CATE_DEF.YTH:
                        params.sessionID = getSessionIDByLibID(-1022, CATE_DEF.YTH)
                        _sessionID = params.sessionID
                        if (id != -1022) {
                            params.addCond = {
                                column: 'TABLE_ID',
                                value: [id]
                            };
                            curYTHID = id;
                        } else {
                            curYTHID = undefined;
                        }
                        break;

                        
                    case CATE_DEF.UNSTRUCT:
                        curYTHID = undefined
                        // countPerPage = unStructPageCount;
                        break;
                    default:
                        curYTHID = undefined
                        // countPerPage = unStructPageCount;
                        break;
                }
                
                params.length = countPerPage;

                $.getJSON('/udp/udp/getResult', params).done(function(rsp) {
                    if (rsp.code == 0) {

                        Pagination.setCurPage(1);
                        queryResult = rsp.data.ftrResults;
                        // ythResult = rsp.data.ythResults;
                        var structQueryResult = rsp.data.structResults;
                        // _resultCount = rsp.data.totalResultCount || 0;

                        var _resultCount = rsp.data.totalResultCount || 0;

                        var timeCost = rsp.data.timeCost || 0;

                        var dispCount = _resultCount;
                        if (_resultCount / 10000 > 1) {
                            dispCount = (_resultCount / 10000).toFixed(1) + "w";
                        }
                        if (_resultCount / 100000000 > 1) {
                            dispCount = (_resultCount / 100000000).toFixed(1) + "e";
                        }
                        _displayResultCount = _resultCount > _displayRecordsLimit ? _displayRecordsLimit : _resultCount;
                        // console.log("queryResult", queryResult);
                        var page = Math.ceil(_displayResultCount / countPerPage);
                        switch (displayCategory) {
                            case CATE_DEF.STRUCT:
                            case CATE_DEF.MIX:
                                buildStructTable(structQueryResult, searchKeyword, page);
                                renderSearchInfo(timeCost, dispCount, searchKeyword);

                                break;
                            case CATE_DEF.UNSTRUCT:
                                buildYWTpl(dataTypeId, queryResult, page);
                                renderSearchInfo(timeCost, dispCount, searchKeyword);
                                break;
                            case CATE_DEF.YTH:
                                buildYTHTpl(dataTypeId, queryResult, page);
                                renderSearchInfo(timeCost, dispCount, searchKeyword);
                                break;

                        }
                        dismissLoader();
                        Pagination.renderPagination(page);
                        // _sessionID = getSessionIDByLibID(id, displayCategory);

                    } else {
                        dismissLoader();
                        Notify.show({
                            title: '服务异常',
                            type: 'error'
                        });
                    }
                });

                //getQueryResult(getSessionIDByLibID($(this).attr("id")), 0, countPerPage, false);
            }
        });



        //检索结果记录附件下载、查看、浏览
        $(document).on('click', "#yw-result-list .media a", function(event) {
            if ($(this).text() == "下载") {
                doc = JSON.parse($(this).attr('data-value'));
                fileUtil.downloadFile({
                    fileName: doc.fileName,
                    uuidName: doc.uuidName,
                    dataTypeId: doc.dataTypeId
                });
            } else if ($(this).text() == '浏览') {
                doc = JSON.parse($(this).attr('data-value'));
                fileUtil.openFile({
                    fileName: doc.fileName,
                    uuidName: doc.uuidName,
                    dataTypeId: doc.dataTypeId
                });
            } else {
                var Animation = $(this).attr('data-effect');
                doc = JSON.parse($(this).attr('data-value'));
                docID = doc.docID;
                start = 0;
                pageSize = 2000000;
                $.getJSON("/udp/udp/getContent", {
                    "docID": JSON.stringify(docID),
                    "start": start,
                    "size": pageSize
                }).done(function(rsp) {
                    if (rsp.code == 0) {
                        var content = $('<span/>').text(rsp.data).html();
                        $('#content').empty();
                        content = content.replace(/\n/g, "<br/>");
                        $('#content').append('<p style="word-break:break-all">' + content + '</p>');

                        // Inline Admin-Form example
                        $.magnificPopup.open({
                            removalDelay: 500, //delay removal by X to allow out-animation,
                            items: {
                                src: '#modal-panel'
                            },
                            // overflowY: 'hidden', //
                            callbacks: {
                                beforeOpen: function(e) {
                                    this.st.mainClass = Animation;
                                }
                            },
                            midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
                        });
                    }
                });
            }
        });

        //一体化附件下载与查看 
        $(document).on('click', "#yth-result-list .media a", function(event) {

            if ($(this).text() == "下载") {
                var filePath = $(this).attr('data-path');
                var fileName = $(this).closest('.yth-attach-line').children('.attach-name').html();
                var alink = document.createElement('a');
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("click", false, false);
                alink.download = fileName;
                alink.href = filePath;
                // console.log(filePath);
                if (filePath != '#') {
                    alink.click();
                }

            } else if ($(this).text() == '浏览') {
                var filePath = $(this).attr('data-path');
                if (filePath && filePath != '#') {
                    // var last = filePath.slice(-4,filePath.length);
                    // if(last=='.eml'){
                    //     Notify.show({
                    //         title: '浏览器插件不支持浏览eml格式文件',
                    //         type: 'warning'
                    //     });
                    // }else{
                    window.open(filePath);
                    // }   
                }

            }
            // else if ($(this).text() == '查看') {
            //     var filePath = $(this).attr('data-path');
            //     window.open(filePath);
            // } 
            else {
                if ($(this).hasClass('attach-link')) {
                    var filePath = $(this).attr('data-path');
                    var fileName = $(this).children('.attach-name').html();
                    var alink = document.createElement('a');
                    var evt = document.createEvent("HTMLEvents");
                    evt.initEvent("click", false, false);
                    alink.download = fileName;
                    alink.href = filePath;
                    // console.log(filePath);
                    if (filePath != '#') {
                        alink.click();
                    }
                }

            }
        });



        //一体化结果panel双击打开详情结果页面
        $(document).on('dblclick', ".yth-result-panel", function(event) {
            var timeNow = new Date().getTime().toString();
            var link = $(this).attr('data-link');
            if (link != '#') {
                window.open(link, '_' + timeNow);
            }

        });

        //一体化结果panel点击事件
        var clickFlag = false;
        $(document).on('click', '.yth-result-panel', function(e) {
            //防止下载查看链接触发此点击事件
            if (e.target.nodeName == 'A' || e.target.className == 'attach-name') {
                return
            }
            //防止双击触发此点击事件 
            if (clickFlag) {
                clickFlag = false;
                return;
            } else {
                clickFlag = true;
                var tableId = $(this).attr('data-table-id');
                var recordId = $(this).attr('data-record-id');
                var tableName = $(this).attr('data-title');
                $('.yth-result-panel').removeClass('selected-panel');
                $(this).addClass('selected-panel');
                var record = _.find(displayYTHResult, function(val) {
                    return (val.TABLE_ID == tableId && val.RECORD_ID == recordId);
                })

                if (record) {
                    if (record.hasAuth == '0') {
                        $('#yth-result-detail').empty();
                        $('#yth-result-detail').hide();
                        $('#yth-result-detail-warning').show();
                        clickFlag = false;

                    } else if (record.hasAuth == '1') {
                        $('#yth-result-detail').empty();
                        $('#yth-result-detail').show();
                        $('#yth-result-detail-warning').hide();
                        $.getJSON('/udp/udp/getYTHRecordDetail', {
                            recordId: recordId,
                            tableId: tableId
                        }, function(rsp) {
                            if (rsp.code == 0) {
                                rsp.data.tableName = tableName;
                                var detailHTML = ythDetailTpl(rsp.data);
                                $('#yth-result-detail').append(detailHTML);
                                //添加面板收起事件监听
                                $('a.panel-control-collapse').on('click', function() {
                                    var $panelBody = $(this).closest('.panel').children('.panel-body');
                                    if ($panelBody.is(':visible')) {
                                        $(this).closest('.panel').addClass('panel-collapsed')
                                    } else {
                                        var $expandPanel = $('#yth-result-detail>.panel:not(.panel-collapsed)');
                                        $expandPanel.children('.panel-body').slideToggle('fast');
                                        $expandPanel.addClass('panel-collapsed');

                                        $(this).closest('.panel').removeClass('panel-collapsed')
                                    }
                                    $panelBody.slideToggle('fast');
                                })
                            }
                            clickFlag = false;
                        })
                    }
                }

            }






        });


        //左侧结果数目列表点击收起事件
        $(document).on('click', '.list-group-header.not-empty', function() {
            var $panel = $(this).siblings('.panel');
            $panel.slideToggle('fast');
            if ($(' span', this).hasClass('fa-sort-asc')) {
                $(' span', this).addClass('fa-sort-desc');
                $(' span', this).removeClass('fa-sort-asc');
            } else {
                $(' span', this).addClass('fa-sort-asc');
                $(' span', this).removeClass('fa-sort-desc');

            }
        });



        // ////检索时间过滤
        // $('#timeFilter').on('click', function(event) {
        //     cond = {
        //         keyword: $("#keyword").val(),
        //         bussiDateRange: $('#bussiness-date-range-input').val(),
        //         fileloadDateRange: $('#fileload-date-range-input').val(),
        //         textlibs: textlibs,
        //         countPerPage: countPerPage,
        //         summaryLen: summaryLen
        //     };
        //     sessionStorage.setItem("cond", JSON.stringify(cond));
        // });

    });