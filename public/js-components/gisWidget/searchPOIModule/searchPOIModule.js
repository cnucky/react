/**
 * Created by zhangxinyue on 2016/3/4.
 */

(function(window, document, undefined) {
    /* 设置查询相关的元素
     panelParentID：承载图层面板的父节点ID
     * */
    var map;
    var gisServer;

    function _setSearchPOIInfo(options) {
        this.options = options;
        map = options.map;
        gisServer = options.gisServer;
    }

    var queryResultLayer; //查询结果图层
    var _querySentence = null; //查询语句
    var _queryResultKeyValue; //查询结果中点与ID值的对应关系
    var _currentElement; //当前选中的查询类表中的项
    var _currentPoint; //当前选中的地图上的点

    function _windowResize() {
        var windowHeight = $('#map').height();
        if (windowHeight < 505) {
            windowHeight = 505;
        }

        if ($("#queryType").is(':visible')) {
            $(".queryResult-table-scrollable").height(windowHeight - 170 - 26 - 164);

        } else {
            $(".queryResult-table-scrollable").height(windowHeight - 170 - 26);
        }

        // $(".queryResult-table-scrollable").height(windowHeight - ($(".queryInfoTip").top + $(".queryInfoTip").height()) - 50);

        // var searchBody = $(window).height() - 80 - 32;
        // if(searchBody < 475)
        // {
        //     searchBody = 475;
        // }

        var searchBody = $("#searchPOIPanel").height() - $(".search-group-title").height() - 10;
        $(".search-group-body").height(searchBody);
    }

    //查询输入过滤
    function _stringFilter(input) {
        var regxs = [/\\/g, /:/g, /\?/g, /\*/g, /~/g, /"/g, /\^/g, /\[/g, /\]/g, /{/g, /}/g, /\(/g, /\)/g, /!/g, /-/g, /\+/g, /\//g];
        var chars = ['\\\\', '\\:', '\\?', '\\*', '\\~', '\\"', '\\^', '\\[', '\\]', '\\{', '\\}', '\\(', '\\)', '\\!', '\\-', '\\+', '\\/'];
        var output = input;
        for (var i = 0; i < regxs.length; i++) {
            output = output.replace(regxs[i], chars[i]);
        }
        output = output.replace(/(^|[^&])(&{2})($|[^&])/g, '$1\\&&$3');
        output = output.replace(/(^|[^\|])(\|{2})($|[^\|])/g, '$1\\||$3');
        return output;
    }

    //执行查询
    function _excuteQuery(currentPage, totalPage) {
        //$.ajaxSettings.async = false;
        // $.ajax({
        //     type: 'get',
        //     url: gisServer + ':8983/solr/new_core/select',
        //     data: _querySentence,
        //     dataType: 'jsonp', //跨域访问
        //     jsonp: 'json.wrf',
        //     success: function(data) {
        //         _parseQueryResult(data);
        //         //定义点击查询结果列表的操作
        //         //_addAfterQueryEvent();
        //         _pointsClick();

        //         _windowResize();
        //         //更改页码状态
        //         if (totalPage != undefined) {
        //             _setPageStyle(currentPage, totalPage);
        //         }
        //         //                $("#waitingPanel").hide();
        //     }
        // });
        var querydata = {
            hostname: gisServer,
            port: 8983,
            path: '/solr/new_core/select',
        };
        for (var key in _querySentence) {
            querydata[key] = _querySentence[key];
        }
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: querydata,
            success: function(data) {
                _parseQueryResult(JSON.parse(data));
                //定义点击查询结果列表的操作
                //_addAfterQueryEvent();
                _pointsClick();

                _windowResize();
                //更改页码状态
                if (totalPage != undefined) {
                    _setPageStyle(currentPage, totalPage);
                }
                //                $("#waitingPanel").hide();
            }
        });
    }

    //解析查询结果
    function _parseQueryResult(jsonArg) {
        //删除列表内容
        $("#queryResultList").empty();

        //修改页码样式
        _setPageStyle(0, 0);

        //删除查询结果点
        queryResultLayer.clearLayers();

        //若状态不为0，说明查询结果出错
        if (parseInt(jsonArg.responseHeader.status) != 0) {
            alert(i18n.t('gismodule.searchPOI.alert1'));
            return;
        }

        //设置页码
        var totalPageNum = parseInt(parseInt(jsonArg.response.numFound) / 10);
        if (parseInt(jsonArg.response.numFound) % 10 != 0) {
            totalPageNum = totalPageNum + 1;
        }
        var currentPageNum = parseInt(jsonArg.response.start) / 10 + 1;
        $("#currentPage")[0].innerHTML = currentPageNum + "/" + totalPageNum;

        if (currentPageNum > 1) {
            $("#firstPage").css("color", "blue").css("cursor", "pointer");
            $("#prePage").css("color", "blue").css("cursor", "pointer");
        }
        $("#currentPage").css("color", "#000000");
        if (currentPageNum < totalPageNum) {
            $("#nextPage").css("color", "blue").css("cursor", "pointer");
        }

        //遍历查询结果数组
        if (parseInt(jsonArg.response.numFound) == 0) {
            alert(i18n.t('gismodule.searchPOI.alert2'));
            return;
        }

        var thisTimeTotalNum = parseInt(jsonArg.response.numFound) - parseInt(jsonArg.response.start);
        if (thisTimeTotalNum > 10) {
            thisTimeTotalNum = 10;
        }

        var queryResultListInnerHTML = "";
        _queryResultKeyValue = new Array();
        var latlngs = new Array(); //存放点的经纬度（自适应边界）
        for (var j = 0; j < thisTimeTotalNum; j++) {
            var thisData = jsonArg.response.docs[j];
            var id = thisData["id"]; //ID
            var name = thisData["NAME"]; //名称
            var address = thisData["ADDRESS"]; //地址
            var kindName = thisData["KINDNAME"]; //类别名称
            var ridName = thisData["RIDNAME"]; //归属地名称
            var location = thisData["LOCATION"].split(' ');
            var longitudeVal = location[0]; //经度值
            var latitudeVal = location[1]; //纬度值

            //初始化列表
            var oneResultHTML = '<div class="one_query_result" id = "';
            oneResultHTML += id;
            oneResultHTML += '"> <div style="float: left;width: 28px;padding-left: 4px;"> <div class="img_common img_';
            oneResultHTML += (j + 1 + '"></div> </div>');
            oneResultHTML += '<div style="float: left;width: 260px;height: 70px;"> <div style="color: blue"><b>';
            oneResultHTML += name;
            oneResultHTML += '</b></div> <hr class="hr-seprator"/>';
            if (address.length > 16) {
                oneResultHTML += '<div style="cursor: help" class="mutiChar-display" title="';
                oneResultHTML += address;
                oneResultHTML += '"> <b>' + i18n.t('gismodule.searchPOI.resultProperty.address') + '</b>';
                oneResultHTML += address;
                oneResultHTML += '</div>';
            } else {
                oneResultHTML += '<div><b>' + i18n.t('gismodule.searchPOI.resultProperty.address') + '</b>';
                oneResultHTML += address;
                oneResultHTML += '</div>';
            }
            oneResultHTML += '<div><b>' + i18n.t('gismodule.searchPOI.resultProperty.kind') + '</b>';
            oneResultHTML += kindName;
            oneResultHTML += '</div> </div> </div>';

            queryResultListInnerHTML += oneResultHTML;

            //在地图上打点
            var myicon = L.divIcon({
                className: 'point_click img_common img_' + (j + 1),
                iconSize: [18, 27],
                iconAnchor: [10, 10]
            });
            var popupInfo = '<div class="portlet-extend"><div class="portlet-title-extend-popup">' + name + '</div><div class="portlet-body-extend-popup"><table><tr><th>' + i18n.t('gismodule.searchPOI.popup.address') + '</th><td>' + address + '</td></tr><tr  style="background-color: white;"><th>' + i18n.t('gismodule.searchPOI.popup.kind') + '</th><td>' + kindName + '</td></tr><tr><th >' + i18n.t('gismodule.searchPOI.popup.location') + '</th><td>(' + i18n.t('gismodule.searchPOI.popup.lng') + ':' + longitudeVal + ',' + i18n.t('gismodule.searchPOI.popup.lat') + ':' + latitudeVal + ')</td></tr></table></div></div>';
            var point = L.marker([latitudeVal, longitudeVal], {
                    icon: myicon
                }).bindPopup(popupInfo)
                .addTo(map);
            //        }).on('click',function(){}).addTo(map);

            _queryResultKeyValue[j] = new Array();
            _queryResultKeyValue[j][0] = id;
            _queryResultKeyValue[j][1] = point;
            queryResultLayer.addLayer(point);

            //将点记录在在数组中
            latlngs.push(new L.LatLng(latitudeVal, longitudeVal));
        }

        map.fitBounds(L.latLngBounds(latlngs)); //自适应边界
        $("#queryResultList").append(queryResultListInnerHTML);
    }

    //（私有）设置页码样式
    function _setPageStyle(currentPage, totalPage) {
        //无数据时
        if (currentPage == 0 || totalPage == 0) {
            $("#firstPage").css("color", "#808080").css("cursor", "text");
            $("#prePage").css("color", "#808080").css("cursor", "text");
            $("#nextPage").css("color", "#808080").css("cursor", "text");
            $("#currentPage").css("color", "#808080");
            return;
        }

        //有数据但已经是第一页时，首页和前一页不可点
        if (currentPage == 1) {
            $("#firstPage").css("color", "#808080").css("cursor", "text");
            $("#prePage").css("color", "#808080").css("cursor", "text");
        } else {
            $("#firstPage").css("color", "blue").css("cursor", "pointer");
            $("#prePage").css("color", "blue").css("cursor", "pointer");
        }

        //有数据但已经的最后一页时，最后一页不可点
        if (totalPage == currentPage) {
            $("#nextPage").css("color", "#808080").css("cursor", "text");
        } else {
            if (totalPage > currentPage) {
                $("#nextPage").css("color", "blue").css("cursor", "pointer");
            }
        }
    }

    //注册查询后事件
    function _addAfterQueryEvent() {
        $("#clearQueryResult").unbind("click");
        //点击清空查询结果按钮
        $("#clearQueryResult").click(function() {
            //删除图层上的点
            queryResultLayer.clearLayers();

            //清空结果列表
            $("#queryResultList").empty();

            //清空页码，修改页码样式
            $("#currentPage")[0].innerHTML = "0/0";
            _setPageStyle(0, 0);
        });
        $("#firstPage").unbind("click");
        //首页
        $("#firstPage").click(function() {
            var strCurrentPage = $("#currentPage")[0].innerHTML;
            var currentPage = parseInt(strCurrentPage.split('/')[0]);
            var totalPage = parseInt(strCurrentPage.split('/')[1]);

            if (currentPage == 1 || currentPage == 0) {
                return;
            }

            //执行查询
            _querySentence.start = "0";
            _excuteQuery(1, totalPage);

            //更改页码状态
            //_setPageStyle(1,totalPage);
        });
        $("#prePage").unbind("click");
        //上一页
        $("#prePage").click(function() {
            var strCurrentPage = $("#currentPage")[0].innerHTML;
            var currentPage = parseInt(strCurrentPage.split('/')[0]);
            var totalPage = parseInt(strCurrentPage.split('/')[1]);

            if (currentPage == 1 || currentPage == 0) {
                return;
            }

            //执行查询
            _querySentence.start = ((currentPage - 2) * 10).toString();
            _excuteQuery(currentPage - 1, totalPage);

            //更改页码状态
            //_setPageStyle(currentPage - 1,totalPage);
        });
        $("#nextPage").unbind("click");
        //下一页
        $("#nextPage").click(function() {
            var strCurrentPage = $("#currentPage")[0].innerHTML;
            var currentPage = parseInt(strCurrentPage.split('/')[0]);
            var totalPage = parseInt(strCurrentPage.split('/')[1]);

            if (currentPage == totalPage || totalPage == 0) {
                return;
            }

            //执行查询
            _querySentence.start = (currentPage * 10).toString();
            _excuteQuery(currentPage + 1, totalPage);

            //更改页码状态
            //_setPageStyle(currentPage + 1,totalPage);
        });
    }

    function _pointsClick() {
        //注册查询结果点点击事件
        $(".point_click").click(function() {
            //若点击的节点已被选中，则退出本次操作
            if ((_currentPoint != null) && ($($(this)[0]).hasClass("thisPointIsSelected"))) {
                return;
            }

            var currentID = null;
            var num = -1;
            //当先前有选中的点时，删除对该点的选中状态
            if (_currentPoint != null) {
                //遍历数组（ID - Point），找出之前选中的点
                for (var i = 0; i < _queryResultKeyValue.length; i++) {
                    if ($($($(_queryResultKeyValue[i][1]))[0]._icon).hasClass("thisPointIsSelected")) {
                        currentID = _queryResultKeyValue[i][0];
                        num = i + 1;
                        break;
                    }
                }

                if ((currentID != null) && num > 0) {
                    //删除对该点的选中状态
                    $(_currentPoint).removeClass("img_select_" + num);
                    $(_currentPoint).removeClass("thisPointIsSelected");
                    $(_currentPoint).addClass("img_" + num);

                    //删除对列表中的行的选中状态
                    var firstElement = $(_currentElement.children().get(0)).children().get(0);
                    var secondElement = _currentElement.children().get(1);
                    $(firstElement).removeClass("img_select_" + num).addClass("img_" + num);
                    $(secondElement).removeClass("result_selection");
                }

            }

            //遍历数组（ID - Point），找到当前点击的的ID
            _currentPoint = $(this)[0];
            var classNames = _currentPoint.className;
            for (var i = 0; i < _queryResultKeyValue.length; i++) {
                if (_queryResultKeyValue[i][1]._icon.className == classNames) {
                    num = i + 1;
                    currentID = _queryResultKeyValue[i][0];
                    break;
                }
            }

            //选中当前点击的节点
            $(_currentPoint).removeClass("img_" + num);
            $(_currentPoint).addClass("img_select_" + num);
            $(_currentPoint).addClass("thisPointIsSelected");

            //选中当前点击的节点对应的列表中的行
            _currentElement = $("#" + currentID);
            var firstElement1 = $(_currentElement.children().get(0)).children().get(0);
            var secondElement1 = _currentElement.children().get(1);
            $(firstElement1).addClass("img_select_" + num).removeClass("img_" + num);
            $(secondElement1).addClass("result_selection");

            //滚动到当前行
            var scrollTopVal;
            switch (num) {
                case 1:
                    scrollTopVal = 0;
                    break;
                case 2:
                    scrollTopVal = 60;
                    break;
                default:
                    scrollTopVal = 60 + (num - 2) * 70;
            }
            document.getElementById("queryResultList").scrollTop = scrollTopVal;
        });

        //注册查询结果列表点击事件
        $(".one_query_result").click(function() {
            var currentElement = $(this);
            if ((_currentElement != null) && (currentElement[0].id == _currentElement[0].id)) {
                return;
            }

            var firstElement;
            var className;
            var middleParm1;
            var middleParm2;
            var secondElement;
            var point = null;
            var num = -1;
            if (_currentElement != null) {
                //删除上一次选中的节点样式
                firstElement = $(_currentElement.children().get(0));
                className = firstElement.children().get(0).className;
                middleParm1 = className.substring(0, 15);
                middleParm2 = className.substring(22, className.length);
                className = middleParm1 + middleParm2;
                firstElement.children().get(0).className = className;

                secondElement = $(_currentElement.children().get(1));
                secondElement.removeClass("result_selection");

                //删除地图上点的选中样式
                var itemID = _currentElement[0].id; //获取结果ID
                for (var i = 0; i < _queryResultKeyValue.length; i++) {
                    if (_queryResultKeyValue[i][0] == itemID) {
                        point = _queryResultKeyValue[i][1];
                        num = i + 1;
                        break;
                    }
                }

                if (point != null && num > 0) {
                    $(point._icon).removeClass("img_select_" + num);
                    $(point._icon).removeClass("thisPointIsSelected");
                    $(point._icon).addClass("img_" + num);
                    point.closePopup();
                }
            }

            _currentElement = currentElement;
            //获取当前元素的第一个子元素，修改图标
            firstElement = $(_currentElement.children().get(0));
            className = firstElement.children().get(0).className;
            middleParm1 = className.substring(0, 15);
            middleParm2 = className.substring(15, className.length);
            className = middleParm1 + "select_" + middleParm2;
            firstElement.children().get(0).className = className;

            //获取当前元素的第二个子元素，添加背景色
            secondElement = $(_currentElement.children().get(1));
            secondElement.addClass("result_selection");

            //定义与地图上的点的联动操作
            var itemID = _currentElement[0].id; //获取结果ID
            point = null;
            num = -1;
            for (var i = 0; i < _queryResultKeyValue.length; i++) {
                if (_queryResultKeyValue[i][0] == itemID) {
                    point = _queryResultKeyValue[i][1];
                    num = i + 1;
                    _currentPoint = $(point._icon);
                    break;
                }
            }

            if (_currentPoint != null && num > 0) {
                _currentPoint.removeClass("img_" + num);
                _currentPoint.addClass("img_select_" + num);
                _currentPoint.addClass("thisPointIsSelected");
            }

            //选中点居中
            map.setView([point._latlng.lat, point._latlng.lng]);
            point.openPopup();
        });
    }

    function _pointsClick(){
        //注册查询结果点点击事件
        $(".point_click").click(function() {
            //若点击的节点已被选中，则退出本次操作
            if ((_currentPoint != null) && ($($(this)[0]).hasClass("thisPointIsSelected"))) {
                return;
            }

            var currentID = null;
            var num = -1;
            //当先前有选中的点时，删除对该点的选中状态
            if (_currentPoint != null) {
                //遍历数组（ID - Point），找出之前选中的点
                for (var i = 0; i < _queryResultKeyValue.length; i++) {
                    if ($($($(_queryResultKeyValue[i][1]))[0]._icon).hasClass("thisPointIsSelected")) {
                        currentID = _queryResultKeyValue[i][0];
                        num = i + 1;
                        break;
                    }
                }

                if ((currentID != null) && num > 0) {
                    //删除对该点的选中状态
                    $(_currentPoint).removeClass("img_select_" + num);
                    $(_currentPoint).removeClass("thisPointIsSelected");
                    $(_currentPoint).addClass("img_" + num);

                    //删除对列表中的行的选中状态
                    var firstElement = $(_currentElement.children().get(0)).children().get(0);
                    var secondElement = _currentElement.children().get(1);
                    $(firstElement).removeClass("img_select_" + num).addClass("img_" + num);
                    $(secondElement).removeClass("result_selection");
                }

            }

            //遍历数组（ID - Point），找到当前点击的的ID
            _currentPoint = $(this)[0];
            var classNames = _currentPoint.className;
            for (var i = 0; i < _queryResultKeyValue.length; i++) {
                if (_queryResultKeyValue[i][1]._icon.className == classNames) {
                    num = i + 1;
                    currentID = _queryResultKeyValue[i][0];
                    break;
                }
            }

            //选中当前点击的节点
            $(_currentPoint).removeClass("img_" + num);
            $(_currentPoint).addClass("img_select_" + num);
            $(_currentPoint).addClass("thisPointIsSelected");

            //选中当前点击的节点对应的列表中的行
            _currentElement = $("#" + currentID);
            var firstElement1 = $(_currentElement.children().get(0)).children().get(0);
            var secondElement1 = _currentElement.children().get(1);
            $(firstElement1).addClass("img_select_" + num).removeClass("img_" + num);
            $(secondElement1).addClass("result_selection");

            //滚动到当前行
            var scrollTopVal;
            switch (num) {
                case 1:
                    scrollTopVal = 0;
                    break;
                case 2:
                    scrollTopVal = 60;
                    break;
                default:
                    scrollTopVal = 60 + (num - 2) * 70;
            }
            document.getElementById("queryResultList").scrollTop = scrollTopVal;
        });

        //注册查询结果列表点击事件
        $(".one_query_result").click(function() {
            var currentElement = $(this);
            if ((_currentElement != null) && (currentElement[0].id == _currentElement[0].id)) {
                return;
            }

            var firstElement;
            var className;
            var middleParm1;
            var middleParm2;
            var secondElement;
            var point = null;
            var num = -1;
            if (_currentElement != null) {
                //删除上一次选中的节点样式
                firstElement = $(_currentElement.children().get(0));
                className = firstElement.children().get(0).className;
                middleParm1 = className.substring(0, 15);
                middleParm2 = className.substring(22, className.length);
                className = middleParm1 + middleParm2;
                firstElement.children().get(0).className = className;

                secondElement = $(_currentElement.children().get(1));
                secondElement.removeClass("result_selection");

                //删除地图上点的选中样式
                var itemID = _currentElement[0].id; //获取结果ID
                for (var i = 0; i < _queryResultKeyValue.length; i++) {
                    if (_queryResultKeyValue[i][0] == itemID) {
                        point = _queryResultKeyValue[i][1];
                        num = i + 1;
                        break;
                    }
                }

                if (point != null && num > 0) {
                    $(point._icon).removeClass("img_select_" + num);
                    $(point._icon).removeClass("thisPointIsSelected");
                    $(point._icon).addClass("img_" + num);
                    point.closePopup();
                }
            }

            _currentElement = currentElement;
            //获取当前元素的第一个子元素，修改图标
            firstElement = $(_currentElement.children().get(0));
            className = firstElement.children().get(0).className;
            middleParm1 = className.substring(0, 15);
            middleParm2 = className.substring(15, className.length);
            className = middleParm1 + "select_" + middleParm2;
            firstElement.children().get(0).className = className;

            //获取当前元素的第二个子元素，添加背景色
            secondElement = $(_currentElement.children().get(1));
            secondElement.addClass("result_selection");

            //定义与地图上的点的联动操作
            var itemID = _currentElement[0].id; //获取结果ID
            point = null;
            num = -1;
            for (var i = 0; i < _queryResultKeyValue.length; i++) {
                if (_queryResultKeyValue[i][0] == itemID) {
                    point = _queryResultKeyValue[i][1];
                    num = i + 1;
                    _currentPoint = $(point._icon);
                    break;
                }
            }

            if (_currentPoint != null && num > 0) {
                _currentPoint.removeClass("img_" + num);
                _currentPoint.addClass("img_select_" + num);
                _currentPoint.addClass("thisPointIsSelected");
            }

            //选中点居中
            map.setView([point._latlng.lat, point._latlng.lng]);
            point.openPopup();
        });
    }

    _setSearchPOIInfo.prototype = {
        initialize: function(toolbar) {
            this._container = toolbar._container;
            var map = this.map = toolbar._map;
            this.relativeBtn = this._addBtn();
            this._addPanel();
            this._initEvent(); //初始化事件
            this._initPara();
        },

        //获取和图层面板相关联的按钮（在工具栏上）
        getRelativeBtn: function() {
            return this.relativeBtn;
        },

        //获取图层面板上的关闭按钮
        getCloseElement: function() {
            return document.getElementById("hideSearchPOIPanel");
        },

        setQueryResultLayer: function(map) {
            queryResultLayer = L.featureGroup();
            map.addLayer(queryResultLayer);
        },

        windowResize: function() {
            _windowResize();
            // var windowHeight = $(window).height();
            // if(windowHeight < 505)
            // {
            //     windowHeight = 505;
            // }

            // if($("#queryType").is(':visible'))
            // {
            //     $(".queryResult-table-scrollable").height(windowHeight - 150- 230 - 169);

            // }
            // else
            // {
            //     $(".queryResult-table-scrollable").height(windowHeight - 150 - 230);
            // }

            // // $(".queryResult-table-scrollable").height(windowHeight - ($(".queryInfoTip").top + $(".queryInfoTip").height()) - 50);

            // var searchBody = $(window).height() - 32;
            // if(searchBody < 475)
            // {
            //     searchBody = 475;
            // }
            // $(".search-group-body").height(searchBody);
        },

        //初始化事件
        _initEvent: function() {
            //地址与名称切换
            $(".addressOrName").click(function() {
                var currentItem = $(this);
                if (currentItem.hasClass("itemChoosed")) {
                    return;
                }

                var preChoosed = $(".itemChoosed");
                preChoosed.removeClass("itemChoosed")
                    .addClass("itemUnchoosed");
                $(preChoosed[0].firstElementChild).css("background-color", " #E0E0E0");

                currentItem.removeClass("itemUnchoosed")
                    .addClass("itemChoosed");
                $(currentItem[0].firstElementChild).css("background-color", "limegreen");
            });

            //展开/闭合查询类型框
            $("#setQueryTypeVisible").click(function() {
                if ($("#queryType").is(':visible')) {
                    $(".queryResult-table-scrollable").height($('#map').height() - 170 - 26);
                    $("#queryType").animate({
                        height: "hide"
                    }, 0);
                    $("#queryOutlook").animate({
                        height: "hide"
                    }, 0);
                    $($(this)[0].children[0]).attr("src", "../js/components/gisWidget/searchPOIModule/image/navigate_down.png");
                    $(this)[0].children[1].innerText = i18n.t('gismodule.searchPOI.info1');

                } else {
                    $(".queryResult-table-scrollable").height($('#map').height() - 170 - 26 - 164);
                    $("#queryType").animate({
                        height: "show"
                    }, 0);
                    $("#queryOutlook").animate({
                        height: "show"
                    }, 0);
                    $($(this)[0].children[0]).attr("src", "../js/components/gisWidget/searchPOIModule/image/navigate_up.png");
                    $(this)[0].children[1].innerText = i18n.t('gismodule.searchPOI.info2');
                }
            });

            //定义点击查询条件中类型的操作
            $(".type-item").click(function() {
                var selectionObj = $(this);; //当前选中的类型（图片）

                //若当前点击的类型已被选中，则取消对当前类型的选中状态
                if (selectionObj.hasClass("type-selection")) {
                    selectionObj.removeClass("type-selection");
                } else //若当前点击的类型未被选中，则选中当前类型
                {
                    selectionObj.addClass("type-selection");
                }
            });

            //点击查询按钮操作
            $("#excuteQuery").click(function() {
                //                $("#waitingPanel").css("top",0 - $("#out-panel").height()/2)
                //                $("#waitingPanel").show();

                var queryItem = _stringFilter($("#queryItem").val()); //输入的查询条件
                var selectedTypes = $("td.type-selection"); //选择的类别

                //校验数据合法性（当类别和输入框都为空时，停止查询）
                if (queryItem == "" && selectedTypes.length == 0) {
                    alert(i18n.t('gismodule.searchPOI.alert3'));
                    $("#excuteQuery").focus();
                    //                    $("#waitingPanel").hide();
                    return;
                }

                var mapBounds = map.getBounds();
                var leftDownLongitudeVal = mapBounds._southWest.lng; //左下角经度
                var leftDownLatitudeVal = mapBounds._southWest.lat; //左下角纬度
                var rightUpLongitudeVal = mapBounds._northEast.lng; //右上角经度
                var rightUpLatitudeVal = mapBounds._northEast.lat; //右上角纬度

                //查询条件
                var querySentence = {};
                var q_statement = "";
                if (queryItem != "") {
                    var addressOrName;
                    if ($($(".addressOrName")[0]).hasClass("itemChoosed")) {
                        addressOrName = "ADDRESS:"; //地址
                    } else {
                        addressOrName = "NAME:"; //名称
                    }
                    q_statement += (addressOrName + queryItem);
                }
                if (selectedTypes.length > 0) {
                    var tempStr = "";
                    for (var i = 0; i < selectedTypes.length; i++) {
                        tempStr += selectedTypes[i].children[0].name;
                        if (i != selectedTypes.length - 1) {
                            tempStr += " OR ";
                        }
                    }

                    if (q_statement == "") {
                        q_statement = "(" + tempStr + ")";
                    } else {
                        q_statement += (" AND " + "(" + tempStr + ")");
                    }
                }
                querySentence.q = q_statement;
                querySentence.start = "0";
                querySentence.rows = "10";
                querySentence.wt = "json";
                querySentence.fq = "LOCATION:[" + leftDownLatitudeVal + "," + leftDownLongitudeVal + " TO " + rightUpLatitudeVal + "," + rightUpLongitudeVal + "]";
                querySentence.indent = "true";

                _querySentence = querySentence;
                //定义点击查询结果列表的操作
                _addAfterQueryEvent();
                //执行查询
                _excuteQuery(1);
            });

        },

        _initPara: function() {
            this.windowResize();
        },

        //（私有）添加工具栏上的按钮
        _addBtn: function() {
            /*var toolButton = document.createElement('img');
            toolButton.src = "../js/components/gisWidget/searchPOIModule/image/view.png";*/

            var toolButton = document.createElement('span');
            toolButton.height = 24;
            toolButton.width = 24;
            toolButton.title = i18n.t('gismodule.searchPOI.btn');
            toolButton.className = "buttonInToolbar-style fa fa-search";
            this._container.appendChild(toolButton);

            return toolButton;
        },

        //（私有）添加图层面板上的元素
        _addPanel: function() {
            var parentId = document.getElementById(this.options.panelParentID);
            parentId.innerHTML = this._createPanelInnerHtml();
        },

        //（私有）生成图层面板的内部HTML
        _createPanelInnerHtml: function() {
            var innerHtml =
                '<div class="search-group-title">' +
                '<label style="position: absolute;top:8px;left: 5px;">' + i18n.t('gismodule.searchPOI.btn') + '</label>' +
                '<img id="hideSearchPOIPanel" src="../js/components/gisWidget/searchPOIModule/image/remove-icon-small.png" style="position: absolute;top:10px;right: 8px;cursor: pointer;"/>' +
                '</div>' +
                '<div class="search-group-body">' +
                '<table border="0" cellspacing="0" class="addressOrName-toggle">' +
                '<tr>' +
                '<td class="addressOrName itemChoosed" style="width: 37px;">' +
                '<div style="height: 25px;width: 37px;background-color: limegreen;">' +
                '<div style="text-align: center;padding-top: 6px;">' + i18n.t('gismodule.searchPOI.searchCondition.address') + '</div>' +
                '</div>' +
                '</td>' +
                '<td class="addressOrName itemUnchoosed" style="width: 37px;">' +
                '<div style="height: 25px;width: 37px;background-color: #E0E0E0;">' +
                '<div style="text-align: center;padding-top: 6px;">' + i18n.t('gismodule.searchPOI.searchCondition.name') + '</div>' +
                '</div>' +
                '</td>' +
                '<td style="text-align: right"><input id = "queryItem" type="text" class="z_search-input" placeholder="' + i18n.t('gismodule.searchPOI.searchCondition.placeholder') + '" style="color:#000"></td>' +
                '<td style="text-align: left"><button id = "excuteQuery" type="button" class="z_search-button">' + i18n.t('gismodule.searchPOI.searchCondition.search') + '</button></td>' +
                '</tr>' +
                '</table>' +
                '<div id="setQueryTypeVisible" class="queryInfoTip">' +
                '<img style="padding: 5px 5px 0px 5px;" src="../js/components/gisWidget/searchPOIModule/image/navigate_down.png"/>' +
                '<lable>' + i18n.t('gismodule.searchPOI.info1') + '</lable>' +
                '</div>' +
                '<div id="queryType" class="queryTypeStyle">' +
                '<div class="poiSearch-group-type">' + i18n.t('gismodule.searchPOI.searchCondition.searchKind') + '</div>' +
                '<div class="query-type-tableScroll">' +
                '<table style="width: 100%;">' +
                '<tr>' +
                '<td class="type-item" style="width: 19%;">' +
                '<img class="type-item-pic" name="KIND:10??" src="../js/components/gisWidget/gisLibs/imgs/kinds/1001.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.fastFood') + '</labelc>' +
                '</td>' +
                '<td class="type-item" style="width: 19%;">' +
                '<img class="type-item-pic" name = "KIND:13??" src="../js/components/gisWidget/gisLibs/imgs/kinds/1002.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.restaurant') + '</labelc>' +
                '</td>' +
                '<td class="type-item" style="width: 19%;">' +
                '<img class="type-item-pic" name = "KIND:1500" src="../js/components/gisWidget/gisLibs/imgs/kinds/1003.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.bar') + '</labelc>' +
                '</td>' +
                '<td class="type-item" style="width: 24%;">' +
                '<img class="type-item-pic" name = "KIND:160?" src="../js/components/gisWidget/gisLibs/imgs/kinds/1004.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.cafe') + '</labelc>' +
                '</td>' +
                '<td class="type-item" style="width: 19%;">' +
                '<img class="type-item-pic" name = "KIND:21??" src="../js/components/gisWidget/gisLibs/imgs/kinds/1005.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.superMarket') + '</labelc>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:280?" src="../js/components/gisWidget/gisLibs/imgs/kinds/1006.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.drugStore') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:40??" src="../js/components/gisWidget/gisLibs/imgs/kinds/1007.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.gasStation') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:41??" src="../js/components/gisWidget/gisLibs/imgs/kinds/1008.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.park') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:5???" src="../js/components/gisWidget/gisLibs/imgs/kinds/1009.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.hotel') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:6500" src="../js/components/gisWidget/gisLibs/imgs/kinds/1010.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.cinema') + '</labelc>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:6680" src="../js/components/gisWidget/gisLibs/imgs/kinds/1011.png"/>' +
                '<br/><labelc>KTV</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:6E00" src="../js/components/gisWidget/gisLibs/imgs/kinds/1012.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.InternetBar') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:72??" src="../js/components/gisWidget/gisLibs/imgs/kinds/1013.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.hospital') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:808?" src="../js/components/gisWidget/gisLibs/imgs/kinds/1014.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.railwayStation') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:810?" src="../js/components/gisWidget/gisLibs/imgs/kinds/1015.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.airport') + '</labelc>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:A380 OR KIND:F007" src="../js/components/gisWidget/gisLibs/imgs/kinds/1019.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.postOffice') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:9???" src="../js/components/gisWidget/gisLibs/imgs/kinds/1017.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.scenerySpot') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:A1??" src="../js/components/gisWidget/gisLibs/imgs/kinds/1018.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.bank') + '</labelc>' +
                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:8180" src="../js/components/gisWidget/gisLibs/imgs/kinds/1016.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.port') + '</labelc>' +

                '</td>' +
                '<td class="type-item">' +
                '<img class="type-item-pic" name = "KIND:A900" src="../js/components/gisWidget/gisLibs/imgs/kinds/1020.png"/>' +
                '<br/><labelc>' + i18n.t('gismodule.searchPOI.pointKind.plot') + '</labelc>' +
                '</td>' +
                '</tr>' +
                '</table>' +
                '</div>' +
                '</div>' +

                //                '<div id="queryOutlook" class="queryOutlookType">' +
                //                    '<div class="poiSearch-group-type">设置查询视野</div>'+
                //                    '<div style="float:left;width: 25px;border-right: 1px solid #000000;font-size: 14px;height: 131px;">' +
                //                        '<div style="height: 34%;border-left:3px solid darkred;border-bottom: 1px solid #000000;padding-left:4px;padding-top: 8px;">地区</div>'+
                //                        '<div style="height: 66%;padding-left:4px;padding-top: 6px;">手绘范围</div>'+
                //                    '</div>'+
                //                    '<div style="float:left;">' +
                //                        'bb'+
                //                    '</div>'+
                //                '</div>'+

                '<div>' +
                '<div class="queryInfoTip">' +
                '<table style="width: 100%;">' +
                '<tr>' +
                '<td style="width: 20px;"><img style="padding: 5px 5px 0px 5px;width: 20px;" src="../js/components/gisWidget/searchPOIModule/image/table_sql_view.png"/></td>' +
                '<td><labelc>' + i18n.t('gismodule.searchPOI.searchCondition.resultList') + '</labelc></td>' +
                '<td><img class="clearQueryResult-picture" id = "clearQueryResult" src="../js/components/gisWidget/searchPOIModule/image/garbage_empty.png" title="清空查询结果"/></td>' +
                '</tr>' +
                '</table>' +
                '</div>' +
                '<div class="queryResult-table-scrollable" id = "queryResultList">' +
                '</div>' +
                '<div>&nbsp;</div>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
                '<span id = "firstPage" style="text-decoration: underline;color: #808080;cursor: text;font-size: 13px;">' + i18n.t('gismodule.searchPOI.searchCondition.firstPage') + '</span>' +
                '&nbsp;&nbsp;' +
                '<span id = "prePage" style="text-decoration: underline;color: #808080;cursor: text;font-size: 13px;">&lt;' + i18n.t('gismodule.searchPOI.searchCondition.prePage') + '</span>' +
                '&nbsp;&nbsp;' +
                '<span id = "currentPage" style="color: #808080;font-size: 13px;">0/0</span>' +
                '&nbsp;&nbsp;' +
                '<span id = "nextPage" style="text-decoration: underline;color: #808080;cursor: text;font-size: 13px;">' + i18n.t('gismodule.searchPOI.searchCondition.nextPage') + '&gt;</span>' +
                '</div>' +
                '</div>';

            return innerHtml;
        }

    };

    //构造函数
    setSearchPOIInfo = function(options) {
        return new _setSearchPOIInfo(options);
    };
}(window, document));