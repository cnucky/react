define("module/gis/searchBoxModule", [
    '../../tpl/gis/tpl-search-box',
    'nova-notify',
    "jquery",
    "underscore",
], function(tpl_search_box,Notify) {
    tpl_search_box = _.template(tpl_search_box);

    var map;
    var gisServer;

    var queryResultLayer; //查询结果图层
    var _querySentence = null; //查询语句
    var _queryResultKeyValue; //查询结果中点与ID值的对应关系
    var _currentElement; //当前选中的查询类表中的项
    var _currentPoint; //当前选中的地图上的点


    function init(opts) {
        map = opts.map;
        gisServer = opts.gisServer;
        queryResultLayer = L.featureGroup();
        map.addLayer(queryResultLayer);

        _render();
        _initEvent();
    }

    function _render() {
        $('#boxes').append(tpl_search_box);
        _appendCategories();


    }

    function _appendCategories() {
        var cateHTML = "<div class='category type-item' name='KIND:10??'>" +
            "    <span class='category-icon fa fa-cutlery' style='background: #e28916;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.fastFood') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:13??'>" +
            "    <span class='category-icon fa fa-building' style='background: #e65a6c;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.restaurant') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:1500'>" +
            "    <span class='category-icon fa fa-glass' style='background: #1b9fef;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.bar') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:160?'>" +
            "    <span class='category-icon fa fa-coffee' style='background: #826230;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.cafe') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:21??'>" +
            "    <span class='category-icon fa fa-shopping-cart' style='background: #59d045;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.superMarket') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:280?'>" +
            "    <span class='category-icon fa fa-medkit' style='background: #93b6e4;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.drugStore') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:40??'>" +
            "    <span class='category-icon fa fa-car' style='background: #d27716;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.gasStation') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:41??'>" +
            "    <span class='category-icon fa stateface-ks' style='background: #165adc;font-size: 30px;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.park') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:5???'>" +
            "    <span class='category-icon fa fa-hotel' style='background: #e6c723;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.hotel') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:6500'>" +
            "    <span class='category-icon fa fa-film' style='background: #967adc;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.cinema') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:6680'>" +
            "    <span class='category-icon fa fa-music' style='background: #d346e2;'></span>" +
            "    <div class='category-name'><span>KTV</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:6E00'>" +
            "    <span class='category-icon fa fa-keyboard-o' style='background: #d4e214;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.InternetBar') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:72??'>" +
            "    <span class='category-icon fa fa-plus-square' style='background: #e23c14;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.hospital') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:808?'>" +
            "    <span class='category-icon fa fa-train' style='background: #2e8425;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.railwayStation') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:810?'>" +
            "    <span class='category-icon fa fa-plane' style='background: #989898;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.airport') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:A380 OR KIND:F007'>" +
            "    <span class='category-icon fa fa-envelope' style='background: #319622;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.postOffice') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:9???'>" +
            "    <span class='category-icon fa fa-tree' style='background: #d1d619;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.scenerySpot') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:A1??'>" +
            "    <span class='category-icon fa fa-cny' style='background: #207314;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.bank') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:8180'>" +
            "    <span class='category-icon fa fa-anchor' style='background: #1d3bd6;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.port') + "</span></div>" +
            "</div>" +
            "<div class='category type-item' name='KIND:A900'>" +
            "    <span class='category-icon fa fa-home' style='background: #11bfa9;'></span>" +
            "    <div class='category-name'><span>" + i18n.t('gismodule.searchPOI.pointKind.plot') + "</span></div>" +
            "</div>";
        $('#categories').append(cateHTML);
    }

    //针对小屏幕显示器，结果高度需要限制。在结果可见之后才能调用此函数
    function _resizeHeight() {
        var panelHeight = $(window).innerHeight() - $('#POIresultPanel').offset().top - 50;
        var listHeight = panelHeight - 100;
        // console.log($('#POIresultPanel').offset().top)
        $('#POIresultPanel').height(panelHeight);
        $('#queryResultList').height(listHeight);
    }

    //初始化事件
    function _initEvent() {



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
            var queryItem = _stringFilter($("#queryItem").val()); //输入的查询条件
            var selectedTypes = $(".type-selection"); //选择的类别
            //校验数据合法性（当类别和输入框都为空时，停止查询）
            if (queryItem == "" && selectedTypes.length == 0) {
                // alert(i18n.t('gismodule.searchPOI.alert3'));
                Notify.show({
                    title: i18n.t('gismodule.searchPOI.alert3'),
                    type: "warning"
                });
                $("#excuteQuery").focus();
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
                // if ($($(".addressOrName")[0]).hasClass("itemChoosed")) {
                //     addressOrName = "ADDRESS:"; //地址
                // } else {
                //     addressOrName = "NAME:"; //名称
                // }

                addressOrName = "NAME:"; //名称
                q_statement += (addressOrName + queryItem);
            }
            if (selectedTypes.length > 0) {
                var tempStr = "";
                for (var i = 0; i < selectedTypes.length; i++) {
                    tempStr += selectedTypes[i].attributes.name.value;
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
            // console.log(querySentence)
            //显示结果列表
            $('#POIresultPanel').show();


            _resizeHeight();
        });

        $(window).on('keydown', function(e) {
            if (e.which == 13) {
                if (document.activeElement.id == 'queryItem') {
                    e.preventDefault();
                    $("#excuteQuery").trigger('click');
                }
                // console.log(document.activeElement.classNames)
            }
        });

        //调试时把收起逻辑注释掉
         $('#catePanel,.poibar').on('focusout', function(e) {
             if (!$('#POIresultPanel').is(':visible')) {
                $('#catePanel').height(0);
                console.log('focusout')
                 // $('#catePanel').css({
                 //     'display': 'none',
                 //     'overflow': 'hidden'
                 // })
             }

         });

    }




    //执行查询
    function _excuteQuery(currentPage, totalPage) {
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

                _pointsClick();

                // _windowResize();
                //更改页码状态
                if (totalPage != undefined) {
                    _setPageStyle(currentPage, totalPage);
                }
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
            // alert(i18n.t('gismodule.searchPOI.alert1'));
            Notify.show({
                title: i18n.t('gismodule.searchPOI.alert1'),
                type: "warning"
            });
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
            // alert(i18n.t('gismodule.searchPOI.alert2'));
            Notify.show({
                title: i18n.t('gismodule.searchPOI.alert2'),
                type: "warning"
            });
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
            oneResultHTML += '<div style="float: left;width: 345px;height: 70px;"> <div style="color: blue"><b>';
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
    //注册查询后事件
    function _addAfterQueryEvent() {


        // $("#clearQueryResult").unbind("click");
        // //点击清空查询结果按钮
        // $("#clearQueryResult").click(function() {
        //     //删除图层上的点
        //     queryResultLayer.clearLayers();

        //     //清空结果列表
        //     $("#queryResultList").empty();

        //     //清空页码，修改页码样式
        //     $("#currentPage")[0].innerHTML = "0/0";
        //     _setPageStyle(0, 0);
        // });
        // _unbindFocus();

        //点击关闭查询结果列表span
        $('#POIresultQuit').click(function() {
            clearPOIResultPanel();
            $('#catePanel').focus();
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
            _setPageStyle(currentPage - 1, totalPage);
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
            _setPageStyle(currentPage + 1, totalPage);
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

    function clearPOIResultPanel() {
        $('#POIresultPanel').hide();
        queryResultLayer.clearLayers();
        //清空结果列表
        $("#queryResultList").empty();

        //清空页码，修改页码样式
        $("#currentPage")[0].innerHTML = "0/0";
        _setPageStyle(0, 0);


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

    function hideBox() {
        clearPOIResultPanel();
        $('#searchBox').hide();
        $('#catePanel').height(0);

    }

    function showBox() {
        $('#searchBox').show();
        // $('#catePanel').css({
        //     'display': 'block',
            
        // })
        $('#catePanel').height(191);
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

    return {
        init: init,
        hideBox: hideBox,
        showBox: showBox
    }
});