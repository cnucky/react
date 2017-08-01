define("module/gis/loadChinaRegionModule", [
    './regionData',
    '../../tpl/gis/tpl-loadchinaregion',
    '../../tpl/gis/tpl-loadchinaregion-content-item',
    // 'arale-autocomplete'
], function(regionData, tpl_loadchinaregion, tpl_content_item) {
    tpl_loadchinaregion = _.template(tpl_loadchinaregion);
    tpl_content_item = _.template(tpl_content_item);

    // var AutoComplete = require('arale-autocomplete');
    // console.log(autocomplete);
    // console.log(AutoComplete)

    var cityList = regionData.region.cityList;
    var provinceList = regionData.region.provinceList;
    var provinceAlphabets = ['A', 'F', 'G', 'H', 'J', 'L', 'N', 'Q', 'S', 'X', 'Y', 'Z'];
    var cityAlphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];

    var appConfig;
    var map;
    var curRegion;
    var needLoadPreference;

    function init(opts) {
        appConfig = opts.appConfig;
        map = opts.map;
        curRegion = opts.curRegion;
        needLoadPreference = opts.needLoadPreference;

        $('#loadChinaRegion').append(tpl_loadchinaregion());

        if(needLoadPreference){
            loadPreference();
        }

        appendHotCity();
        appendAlphabets();


        appendProvinceList();
        appendCityList();

        addEvents();

    }

    function loadPreference() {
        $.get('/workspacedir/queryPreference', {
            name: 'gisregions',
        }, function(rsp) {
            var data = JSON.parse(rsp).data;
            if (!!data) {
                var regioncode = data.cityCode;
                var cityName = _.find(cityList, function(e) {
                    return e.zoneCode == regioncode;
                }).zoneName;
                var shortName = cutContent(cityName);
                $('#regionContext').html(shortName);

                $.get('/gisapi/gisGetQuery', {
                        hostname: appConfig['gis-server'],
                        path: '/GisService/regions/regionInfo/' + regioncode + '/GeoInfo'
                    },
                    function(region) {
                        if (curRegion != undefined && map.hasLayer(curRegion)) {
                            map.removeLayer(curRegion);
                            curRegion = undefined;
                        }
                        curRegion = omnivore.wkt.parse(region);
                        var regionLayers = curRegion.getLayers()[0].getLayers();
                        for (var i = 0; i < regionLayers.length; i++) {
                            regionLayers[i].options.fill = false;
                        }
                        curRegion.addTo(map);
                        var bounds = curRegion.getBounds();
                        map.fitBounds(bounds);
                        map.panTo(bounds.getCenter());

                        $.get('/workspacedir/queryPreference', {
                            name: 'hideGisBorder',
                        }, function(rsp) {
                            var hideBorder = JSON.parse(rsp).data;
                            // console.log(hideBorder);
                            if (!!hideBorder) {

                                if (hideBorder.hideborder == "true") {
                                    $('#loadChinaRegionBox #hideborder')[0].checked = true;
                                    map.removeLayer(curRegion);
                                } else {
                                    $('#loadChinaRegionBox #hideborder')[0].checked = false;
                                }
                            }
                        })
                    }
                );
            }
        })
    }



    function appendHotCity() {
        var hotCityList = ['北京市', '广州市', '上海市', '重庆市', '福州市', '南京市', '乌鲁木齐市'];
        for (var i = 0; i < hotCityList.length; i++) {
            var hotCity = _.find(cityList, function(e) {
                return e.zoneName == hotCityList[i];
            });
            if (hotCity != undefined) {

                var content = cutContent(hotCity.zoneName);
                var liHTML = '<li data-zone-code="' + hotCity.zoneCode + '">' + content + '</li>';
                $('#hotCityList').append(liHTML);
            }
        }
    }

    //去除最后的“市”字
    function cutContent(content) {
        var result = content[content.length - 1] == '市' ? content.slice(0, -1) : content;
        return result;
    }

    function appendAlphabets() {
        for (var i = 0; i < provinceAlphabets.length; i++) {
            var liHTML = '<li data-alphabet="' + provinceAlphabets[i] + '">' + provinceAlphabets[i] + '</li>';
            $('#tab-province .alphabets ul').append(liHTML);
        }
        for (var i = 0; i < cityAlphabets.length; i++) {
            var liHTML = '<li data-alphabet="' + cityAlphabets[i] + '">' + cityAlphabets[i] + '</li>';
            $('#tab-city .alphabets ul').append(liHTML);
        }
    }

    function appendProvinceList() {
        //去除直辖市
        var DIRECT_CONTROL_MUNICIPALITY_LIST = ['北京市', '天津市', '重庆市', '上海市', '香港特别行政区', '澳门特别行政区'];
        provinceList = _.reject(provinceList, function(e) {
            return _.find(DIRECT_CONTROL_MUNICIPALITY_LIST, function(el) {
                return el == e.zoneName
            }) != undefined;
        })

        for (var i = 0; i < provinceAlphabets.length; i++) {
            var filterList = _.filter(provinceList, function(e) {
                return e.firstPinyin == provinceAlphabets[i];
            })
            if (filterList == undefined || filterList.length == 0) {
                console.error('首拼音' + provinceAlphabets[i] + '没有对应的省份');
                break;
            }
            for (var j = 0; j < filterList.length; j++) {
                var curProvince = filterList[j];
                var params = {};
                params.title = {};
                params.title.alphabet = provinceAlphabets[i];
                params.title.shortName = curProvince.short;
                params.cities = [];

                for (var k = 0; k < cityList.length; k++) {
                    if (cityList[k].provinceCode == curProvince.zoneCode) {
                        var city = _.extend(cityList[k], {
                            'content': cutContent(cityList[k].zoneName)
                        })
                        params.cities.push(city)
                    }
                }

                var contentHTML = tpl_content_item(params);
                $('#tab-province .content-list').append(contentHTML);

            }



        }
    }

    function appendCityList() {
        for (var i = 0; i < cityAlphabets.length; i++) {
            var filterList = _.filter(cityList, function(e) {
                return e.firstPinyin == cityAlphabets[i];
            })
            if (filterList == undefined || filterList.length == 0) {
                console.error('首拼音' + cityAlphabets[i] + '没有对应的城市');
                break;
            }

            var params = {};
            params.title = {};
            params.title.alphabet = cityAlphabets[i];
            params.title.shortName = cityAlphabets[i];
            params.cities = [];



            for (var k = 0; k < filterList.length; k++) {

                var city = _.extend(filterList[k], {
                    'content': cutContent(filterList[k].zoneName)
                })
                params.cities.push(city)

            }

            var contentHTML = tpl_content_item(params);
            $('#tab-city .content-list').append(contentHTML);





        }
    }

    function addEvents() {



        //tab switch event
        $('#tabHead .tab').on('click', function() {
            if ($(this).attr('id') == 'tab-head-province') {
                $(this).addClass('active');
                $('#tab-head-city').removeClass('active');
                $('#tab-city').hide();
                $('#tab-province').show();
            } else if ($(this).attr('id') == 'tab-head-city') {
                $(this).addClass('active');
                $('#tab-head-province').removeClass('active');
                $('#tab-province').hide();
                $('#tab-city').show();
            } else {
                console.error('监听到非对应ID的tab切换事件')
            }
        });

        //click alphabets(pinyin) event
        $('.alphabets ul li').on('click', function() {
            var that = this;
            if ($(that).hasClass('active')) {
                $(that).removeClass('active');
                $('dt,dd', $(that).closest('.tab-content')).show();
            } else {
                $('.alphabets ul li').removeClass('active');
                $(that).addClass('active');
                var alphabet = $(that).attr('data-alphabet');
                var $selectedDT = $('dt[data-alphabet="' + alphabet + '"]', $(that).closest('.tab-content'));
                $('dt,dd', $(that).closest('.tab-content')).hide();
                $selectedDT.show();
                $('+dd', $selectedDT).show();
                // $('.content-list .content-item', $(that).closest('.tab-content')).hide();
                // $('.content-list .content-item[data-alphabet="' + alphabet + '"]', $(that).closest('.tab-content')).show();
            }

        })


        //click city event
        $('dl.content-list dd li,#hotCityList li').on('click', function() {
            var that = this;
            var code = $(this).attr('data-zone-code');
            $.get('/gisapi/gisGetQuery', {
                    hostname: appConfig['gis-server'],
                    path: '/GisService/regions/regionInfo/' + code + '/GeoInfo',
                },

                function(region) {
                    if (curRegion != undefined && map.hasLayer(curRegion)) {
                        map.removeLayer(curRegion);
                        curRegion = undefined;
                    }
                    curRegion = omnivore.wkt.parse(region);
                    var regionLayers = curRegion.getLayers()[0].getLayers();
                    for (var i = 0; i < regionLayers.length; i++) {
                        regionLayers[i].options.fill = false;
                    }
                    curRegion.addTo(map);
                    map.fitBounds(curRegion.getBounds());

                    var isChecked = $("#loadChinaRegionBox #hideborder")[0].checked;
                    if (isChecked) {
                        map.removeLayer(curRegion);
                    }

                    //按钮上写入对应城市名 
                    $('#regionContext').html($(that).html());
                    //关闭导航面板 
                    $('#loadChinaRegionBox').hide();

                    //记录用户偏好
                    var thisCity = _.find(cityList, function(e) {
                        return e.zoneCode == code;
                    });
                    var provinceCode = thisCity.provinceCode;
                    var detail = {
                        cityCode: code
                    };
                    if (provinceCode != undefined) {
                        detail.provinceCode = provinceCode;
                    }

                    $.post('/workspacedir/recordPreference', {
                        name: 'gisregions',
                        detail: detail
                    })
                }
            );
        })

        $('#loadChinaRegionBox .dir_close').on('click', function() {
            hideBox();
        })

        //showchina
        $('#loadChinaRegionBox #china').on('click', function() {
            $('#regionContext').html('全国');
            if (curRegion != undefined && map.hasLayer(curRegion)) {
                map.removeLayer(curRegion);
                curRegion = undefined;
            }
            map = map.setView([39, 105], 5);
            hideBox();
            $.post('/workspacedir/recordPreference', {
                name: 'gisregions',
                detail: {}
            })
        })

        //showborder
        $('#loadChinaRegionBox #hideborder').on('change', function() {
            var isChecked = $(this)[0].checked;
            if (isChecked) {
                map.removeLayer(curRegion);
            } else {
                curRegion.addTo(map);
                map.fitBounds(curRegion.getBounds());
            }
            var detail = {
                hideborder: isChecked
            };

            $.post('/workspacedir/recordPreference', {
                name: 'hideGisBorder',
                detail: detail
            })
        })

        // $("#loadChinaRegionBox").on('focusout', function(e) {
        //     console.log(e)
        //     console.log('focus');
        //     if ($('#loadChinaRegionBox').is(':visible')) {
        //         loadChinaRegionModule.hideBox();
        //     } else {
        //         loadChinaRegionModule.showBox();
        //     }
        // })
         $("#loadChinaRegionBox").on("blur",function(){
            console.log("123");
         })

    }

    function hideBox() {
        $('#regionExpandIcon').removeClass('fa-sort-asc').addClass('fa-sort-desc')
        $('#loadChinaRegionBox').hide();
    }

    function showBox() {
        $('#regionExpandIcon').removeClass('fa-sort-desc').addClass('fa-sort-asc')
        $('#loadChinaRegionBox').show();
    }


    return {
        init: init,
        hideBox: hideBox,
        showBox: showBox
    }
})