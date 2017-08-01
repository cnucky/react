define("./rdp-property", [
    "../../tpl/rlf/rlf-property-groupname",
    "../../tpl/rlf/rlf-property-item",
    // "module/rlf-property-source",
    "jquery",
    "underscore"
], function(tplProperty, tplPropertyItem /*, PropertySource*/ ) {
    tplProperty = _.template(tplProperty);
    tplPropertyItem = _.template(tplPropertyItem);



    function init(opts) {
        var position = opts.position;
        $(opts.container).append("<div class='row' id='group-table'></div>");

        function render(property) {
            if (property) {
                var table = $(position + " " + "#group-table"); //
                var groupName;

                // 判断是否生成过，没生成，标记为1；生成模板，已经生成就什么都不做。
                if (_.isUndefined(table.attr('rendered'))) {
                    table.empty();
                    table.attr('rendered', 1);

                    _.each(property, function(item) {
                        groupName = $(tplProperty(item));
                        table.append(groupName);

                        _.each(item.children, function(item1) {
                            _.each(item1.properties, function(item2) {
                                item2['base64jumpType'] = BASE64.encoder(''+item2.jumpType); 
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
                                });
                            });

                            var groupItem = groupName.find("#group-item");
                            var itemName;
                            itemName = $(tplPropertyItem(item1));
                            groupItem.append(itemName);
                        });
                    });
                }

                // 手动初始化 tootip 否则不显示
                $(position + " " + '[data-toggle="tooltip"]').tooltip();

            }
        }
        return {
            render: render
        }
    }



    return {
        init: init
    }
});
