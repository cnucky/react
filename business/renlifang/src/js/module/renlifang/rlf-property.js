define("./rlf-property", [
    "../../tpl/rlf/rlf-property-groupname",
    "../../tpl/rlf/rlf-property-groupname-loading",
    "../../tpl/rlf/rlf-property-item",
    "../../tpl/rlf/rlf-property-passport-item",
    "../../tpl/rlf/rlf-property-passport-item2",
    "./rlf-assist-menu",
    "./rlf-icon-set",
    "./rlf-auto-link",
    "../../../../config",
    "jquery",
    "underscore"
], function(tplProperty, tplPropertyLoading, tplPropertyItem,tplPropertyPassportItem,tplPropertyPassportItem2, AssistMenu, IconSet, AutoLink, appConfig) {
    tplProperty = _.template(tplProperty);
    tplPropertyLoading = _.template(tplPropertyLoading);
    tplPropertyItem = _.template(tplPropertyItem);
    tplPropertyPassportItem = _.template(tplPropertyPassportItem);
    tplPropertyPassportItem2 = _.template(tplPropertyPassportItem2);

    //定义常量，根据结果返回数据包含内容进行分类,区分后续操作流程
    var RTDEF = {
        'DEFAULT': 0, //两者都没有
        'PASSPORTANDCAR': 1, //有SFZ 
        'PASSPORT_ONLY': 2 //无SFZ有PASSPORT
    }

    //默认页面生成流程
    var processType = RTDEF.DEFAULT;
    // var pcExternalConf = appConfig['pcExternalConf']

    var table;
    var groupName;
    var propertyItemIndex = 0;
    var entityIds = []; //用来存储本次查询的所有entityId。从keyValueMap中取到，一次页面加载只可能是sfz或passport中的一种
    var entityType = 1; //默认sfz

    //记录获取外部请求的类型，
    //1:通过身份证号查户籍；
    //2:通过身份证号查车辆；
    //3:通过身份证号查护照
    //4:通过护照号查护照信息（可能含有身份证）

    var queryType = 0;

    //记录对应类别(车辆或护照)需要执行的请求数(即entityId的数目)，减为0时即对应类别请求全部结束
    var queryExternalCount = {
        CAR: 0,
        PASSPORT: 0
    };

    function init(opts) {
        $(opts.container).append("<div class='row' id='group-table'></div>");
        table = $("#group-table");


    }

    function render(property, keyValueMap, showItemsCount, isPermission) {

        if (property) {
            //如果需要从第三方系统中获取数据，查看当前结果的keyValueMap中是否包含sfz、passport进行分类
            if (appConfig['pcRequireExternalInfo']) {


                var sfzMap = _.find(keyValueMap, function(v) {
                    return v.name == 'SFZ';
                });
                var passportMap = _.find(keyValueMap, function(v) {
                    return v.name == 'PASSPORT';
                });

                //keyValueMap中含有sfz，则需查询护照与车辆实体，只含有passport则只需查询护照实体
                if (sfzMap && sfzMap.values.length > 0 && sfzMap.values[0] != '') {
                    processType = RTDEF.PASSPORTANDCAR;
                    entityType = 1;
                    entityIds = sfzMap.values;
                    queryExternalCount.CAR = entityIds.length;
                    queryExternalCount.PASSPORT = entityIds.length;
                } else if (passportMap && passportMap.values.length > 0 && passportMap.values[0] != '') {
                    processType = RTDEF.PASSPORT_ONLY;
                    entityType = 2;
                    entityIds = passportMap.values;
                    queryExternalCount.PASSPORT = entityIds.length;
                }

            }



            // 判断是否生成过，没生成，标记为1；生成模板，已经生成就什么都不做。
            if (_.isUndefined(table.attr('rendered'))) {
                table.empty();
                table.attr('rendered', 1);
                window.rlfPropertyData = {};

                //根据流程的类型，将原来获取到的护照和车辆信息剥离出来存储在全局对象中
                switch (processType) {
                    case RTDEF.PASSPORTANDCAR:
                        var carArray = _.filter(property, function(v) {
                            return (v.groupName == '车辆信息');
                        })
                        if (carArray.length > 0) {
                            window.rlfPropertyData.CAR = carArray[0]
                        } else {
                            window.rlfPropertyData.CAR = {
                                groupName: '车辆信息',
                                children: []
                            }
                        }

                        var passportArray = _.filter(property, function(v) {
                            return (v.groupName == '护照信息');
                        })

                        if (passportArray.length > 0) {
                            window.rlfPropertyData.PASSPORT = passportArray[0]
                        } else {
                            window.rlfPropertyData.PASSPORT = {
                                groupName: '护照信息',
                                children: []
                            }
                        }

                        //剩余的条目
                        property = _.reject(property, function(v) {
                            return (v.groupName == '护照信息') || (v.groupName == '车辆信息');
                        })

                        //用默认模板正常渲染剩余条目
                        _renderDefaultTpl(property, showItemsCount);


                        //延时模板的渲染
                        _renderDelayTpl(processType, showItemsCount);




                        break;
                    case RTDEF.PASSPORT_ONLY:
                        var passportArray = _.filter(property, function(v) {
                            return (v.groupName == '护照信息');
                        })

                        if (passportArray.length > 0) {
                            window.rlfPropertyData.PASSPORT = passportArray[0]
                        } else {
                            window.rlfPropertyData.PASSPORT = {
                                groupName: '护照信息',
                                children: []
                            }
                        }
                        property = _.reject(property, function(v) {
                            return (v.groupName == '护照信息');
                        })
                        _renderDefaultTpl(property, showItemsCount);

                        _renderDelayTpl(processType, showItemsCount);

                        break;
                    default:
                        _renderDefaultTpl(property, showItemsCount);
                        break;
                }

            }

            _bindEvents(isPermission)



        }
    }


    //默认模板的渲染
    function _renderDefaultTpl(property, showItemsCount ,groupName) {
        groupName = groupName || undefined;
        var hasDefaultContainer = false;
        if(groupName!=undefined){
            hasDefaultContainer = true;
        }

        _.each(property, function(item) {
            if(!hasDefaultContainer){
                groupName = $(tplProperty(item));
                table.append(groupName); 
            }
            

            _.each(item.children, function(item1) {
                _.each(item1.properties, function(item2) {
                    item2['base64jumpType'] = BASE64.encoder('' + item2.jumpType);
                    _.each(item2.valueList, function(item3) {
                        if (!_.isEmpty(item3.source)) {
                            item3.tooltip = _.reduce(item3.source, function(memo, source) {
                                return memo + source.name + "，";
                            }, "数据来源：");
                            item3.tooltip = item3.tooltip.substring(0, item3.tooltip.length - 1);

                            var sourceArray = _.map(item3.source, function(item4) {
                                return item4.typeId;
                            });
                            item3.sourcearray = sourceArray;
                        } else {
                            item3.tooltip = "数据来源：无";
                        }
                        item3.base64value = BASE64.encoder(item3.value);
                        item3.linkUrl = UrlUtil.getProfileUrl(item3.value, item2.jumpType)
                    });

                    item2.propertyToggleId = "pro-id-" + propertyItemIndex;
                    propertyItemIndex++;
                    item2.showItemsCount = showItemsCount;
                });
                var groupItem = groupName.find(".group-item");
                var itemName;

                itemName = $(tplPropertyItem(item1));
                groupItem.append(itemName);


                var a = itemName.find('a');
                if (a.length > 0) {
                    _.each(a, function(item) {
                        var hrefLink = $(this).attr("href");
                        var currentHrefName = IconSet.getcurrentHrefName();
                        AutoLink.initLink(item, currentHrefName, hrefLink);
                    })
                }
            });
        });
    }

    function _renderPassportTpl(item, showItemsCount, container) {

            groupName = container;

            _.each(item.children, function(item1) {
                _.each(item1.properties, function(item2) {
                    item2['base64jumpType'] = BASE64.encoder('' + item2.jumpType);
                    _.each(item2.valueList, function(item3) {
                        if (!_.isEmpty(item3.source)) {
                            item3.tooltip = _.reduce(item3.source, function(memo, source) {
                                return memo + source.name + "，";
                            }, "数据来源：");
                            item3.tooltip = item3.tooltip.substring(0, item3.tooltip.length - 1);

                            var sourceArray = _.map(item3.source, function(item4) {
                                return item4.typeId;
                            });
                            item3.sourcearray = sourceArray;
                        } else {
                            item3.tooltip = "数据来源：无";
                        }
                        item3.base64value = BASE64.encoder(item3.value);
                        item3.linkUrl = UrlUtil.getProfileUrl(item3.value, item2.jumpType)
                    });

                    item2.propertyToggleId = "pro-id-" + propertyItemIndex;
                    propertyItemIndex++;
                    item2.showItemsCount = showItemsCount;
                });
                var groupItem = groupName.find(".group-item");
                var itemName;

                itemName = $(tplPropertyPassportItem2(item1));

                groupItem.append(itemName);


                var a = itemName.find('a');
                if (a.length > 0) {
                    _.each(a, function(item) {
                        var hrefLink = $(this).attr("href");
                        var currentHrefName = IconSet.getcurrentHrefName();
                        AutoLink.initLink(item, currentHrefName, hrefLink);
                    })
                }
            });

    }

    function _bindEvents(isPermission) {
        // 手动初始化 tootip 否则不显示
        $('[data-toggle="tooltip"]').tooltip();
        if (isPermission) {
            $('#properties').on('contextmenu', function(e) {
                e.preventDefault();
                return false;
            })

            AssistMenu.initContextmenu("#properties div", "span.data-search", isPermission, true);
        }

        $(".data-search").hover(function() {
            if (!$(this)[0].children.length) {
                $(this).addClass("hoverStyle");
            }
        }, function() {
            $(this).removeClass("hoverStyle");
        })

        $("#properties .glyphicon").unbind("click").click(function(e) {
            var id = $(this).attr("data-title");
            if ($(this).hasClass("glyphicon-chevron-down")) {
                $("#" + id).show();
                $(this).addClass("glyphicon-chevron-up");
                $(this).removeClass("glyphicon-chevron-down");
            } else if ($(this).hasClass("glyphicon-chevron-up")) {
                $("#" + id).hide();
                $(this).addClass("glyphicon-chevron-down");
                $(this).removeClass("glyphicon-chevron-up");
            }
        })

        $("#properties .glyphicon").hover(function() {
            $(this).css("border", "1px solid");
        }, function() {
            $(this).css("border", "none");
        })
    }

    //根据流程类型渲染固定数目的延时模板(有loader和刷新按钮)，PASSPORTANDCAR是2个，PASSPORT_ONLY是1个
    function _renderDelayTpl(processType, showItemsCount, entityId) {

        switch (processType) {
            case RTDEF.PASSPORTANDCAR:
                var $groupName1 = $(tplPropertyLoading({
                    groupName: '护照信息'
                }));
                var $groupName2 = $(tplPropertyLoading({
                    groupName: '车辆信息'
                }));
                table.append($groupName1);
                table.append($groupName2);
                queryExternalData($groupName1, 3, showItemsCount, 1, entityId)
                queryExternalData($groupName2, 2, showItemsCount, 1, entityId)
                var $refreshButton1 = $groupName1.find('.btn.btn-success');
                var $refreshButton2 = $groupName2.find('.btn.btn-success');
                $refreshButton1.on('click', function(e) {
                    $('.empty-warning', $groupName1).remove();
                    $groupName1.find('.group-item').empty()
                    $groupName1.find('.group-item').addClass('delay')
                    queryExternalData($groupName1, 3, showItemsCount, 1)

                })
                $refreshButton2.on('click', function(e) {
                    $('.empty-warning', $groupName2).remove();
                    $groupName2.find('.group-item').empty()
                    $groupName2.find('.group-item').addClass('delay')
                    queryExternalData($groupName2, 2, showItemsCount, 1)
                })
                break;
            case RTDEF.PASSPORT_ONLY:
                var $groupName1 = $(tplPropertyLoading({
                    groupName: '护照信息'
                }));

                table.append($groupName1);
                queryExternalData($groupName1, 4, showItemsCount, 2)
                var $refreshButton1 = $groupName1.find('.btn.btn-success');
                $refreshButton1.on('click', function(e) {
                    $('.empty-warning', $groupName1).remove();
                    $groupName1.find('.group-item').empty()
                    $groupName1.find('.group-item').addClass('delay')
                    queryExternalData($groupName1, 4, showItemsCount, 2)

                })

                break;
        }


    }




    function queryExternalData(container, queryType, showItemsCount, entityType) {
        var oldData = {};
        oldData.CAR = window.rlfPropertyData.CAR;
        oldData.CAR.count = queryExternalCount.CAR
        oldData.PASSPORT = window.rlfPropertyData.PASSPORT;
        oldData.PASSPORT.count = queryExternalCount.PASSPORT


        var $loader = container.find('.loader');
        var $delay = container.find('.group-item.delay');
        $loader.show();

        _.each(entityIds, function(entityId) {
            $.getJSON('/renlifang/personcore/getExternalInfo', {
                entityId: entityId,
                entityType: entityType,
                queryType: queryType
            }, function(rsp) {
                var data;
                switch (queryType) {
                    case 2:
                        data = oldData.CAR;
                        break;
                    case 3:
                    case 4:
                        data = oldData.PASSPORT;
                        break;
                }
                if (rsp.code == 0) {
                    if (rsp.data.length > 0) {




                        for (var i = 0; i < rsp.data.length; i++) {
                            var d = rsp.data[i]
                            var oldItem = _.find(data.children, function(odc) {
                                return odc.itemKey == d.itemKey;
                            })

                            if (oldItem) {
                                data.children = _.reject(data.children, function(odc) {
                                    return odc.itemKey == d.itemKey;
                                })
                                data.children.push(d)
                                rsp.data.splice(i, 1);
                                i--;
                            } else {
                                data.children.push(d)
                            }
                        }




                    } else {
                        // container.find('.panel-body').append('<p style="color:red ;text-align:center;font-size:18px">服务返回为空</p>')
                    }


                } else {
                    // container.find('.panel-body').append('<p style="color:red ;text-align:center;font-size:18px">服务返回出错</p>')
                }

                $delay.removeClass('delay');

                data.count--;

                if (data.count <= 0) {
                    $loader.hide();
                    if (data.children.length == 0) {
                        container.find('.panel-body').append('<p class="empty-warning" style="color:red ;text-align:center;font-size:18px">暂无数据</p>')
                    } else {
                        if(queryType==2){
                            _renderDefaultTpl([data], showItemsCount, container)
                        }else{
                            _renderPassportTpl(data, showItemsCount, container)
                        }
                        
                    }
                    // _bindEvents(isPermission);

                    data.count = entityIds.length;
                }


                // switch (queryType) {
                //     case 2:
                //         queryExternalCount.CAR--;

                //         if (queryExternalCount.CAR <= 0) {
                //             $loader.hide();
                //             if (data.children.length == 0) {
                //                 container.find('.panel-body').append('<p style="color:red ;text-align:center;font-size:18px">无数据</p>')
                //             } else {
                //                 _renderDefaultTpl([data], showItemsCount, container)
                //             }


                //             queryExternalCount.CAR = entityIds.length;
                //         }
                //         break;
                //     case 3:
                //     case 4:
                //         data.count--;

                //         if (data.count <= 0) {
                //             $loader.hide();
                //             if (data.children.length == 0) {
                //                 container.find('.panel-body').append('<p style="color:red ;text-align:center;font-size:18px">无数据</p>')
                //             } else {
                //                 _renderDefaultTpl([data], showItemsCount, container)
                //             }

                //             data.count = entityIds.length;
                //         }
                //         break;
                //     default:
                //         break;
                // }




            })
        })

    }

    return {
        init: init,
        render: render
    }
});