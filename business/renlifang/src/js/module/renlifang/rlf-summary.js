define("./rlf-summary", [
    "../../tpl/rlf/rlf-profile-summary",
    // "module/rlf-property-source",
    "jquery",
    "underscore",
    "./rlf-assist-menu",
    "./rlf-icon-set",
    "./rlf-auto-link",
    "utility/contextmenu/jquery.ui-contextmenu",
], function(tplSummary, /*PropertySource,*/ $, _, AssistMenu, IconSet, AutoLink) {
    tplSummary = _.template(tplSummary);
    var _opts;

    function init(opts) {
        _opts = opts;
        if (_opts.container) {
            _opts.container.append('<table class="table table-bordered"><tbody id="summary-item"></tbody></table>');
        }
    }

    function render(personSummary, showItemsCount, isPermission) {
        var summaryItem = _opts.container.find("#summary-item");

        _.each(personSummary, function(item) {
            _.each(item.valueList, function(item1) {
                if (!_.isEmpty(item1.source)) {
                    item1.tooltip = _.reduce(item1.source, function(memo, source) {
                        return memo + source.name + "，";
                    }, "数据来源：");
                    item1.tooltip = item1.tooltip.substring(0, item1.tooltip.length - 1);

                    var sourceArray = _.map(item1.source, function(item2) {
                        return item2.typeId;
                    });
                    item1.sourcearray = sourceArray;
                } else {
                    item1.tooltip = "数据来源：无";
                }
                item1.base64value = BASE64.encoder(item1.value);
                item1.linkUrl = UrlUtil.getProfileUrl(item1.value, name == "SFZ" ? 1 : 5);
            });
            var summaryRow;
            item.showItemsCount = showItemsCount
            summaryRow = $(tplSummary(item));
            summaryItem.append(summaryRow);

            var a = summaryRow.find('a');
            if(a.length > 0){
                _.each(a,function(item){
                    var hrefLink = $(this).attr("href");
                    var currentHrefName = IconSet.getcurrentHrefName();
                    AutoLink.initLink(item, currentHrefName, hrefLink);
                })
            }

            // 原始数据
            // summaryRow.find(".meta-dialog").on("click", function() {
            //     var value = $(this).attr("data-value");
            //     var sourceArray = $(this).attr("data-source").split(",");
            //     PropertySource.render(item.name, value, sourceArray);
            // })
        });

        // 手动初始化 tootip 否则不显示
        $('[data-toggle="tooltip"]').tooltip();

        if (isPermission) {
            $('#summary').on('contextmenu', function(e) {
                e.preventDefault();
                return false;
            })

            AssistMenu.initContextmenu("#summary div", "span.data-search", isPermission, true);
        }

        $(".data-search").hover(function(){
            if(!$(this)[0].children.length){
                $(this).addClass("hoverStyle");
            }
        },function(){
            $(this).removeClass("hoverStyle");
        })

        $("#summary .glyphicon").unbind("click").click(function(e) {
            var id = $(this).attr("data-title");
            if ($(this).hasClass("glyphicon-chevron-down")) {
                $("#" + id).show();
                $(this).addClass("glyphicon-chevron-up");
                $(this).removeClass("glyphicon-chevron-down");
            } else if($(this).hasClass("glyphicon-chevron-up")){
                $("#" + id).hide();
                $(this).addClass("glyphicon-chevron-down");
                $(this).removeClass("glyphicon-chevron-up");
            }
        })

        $("#summary .glyphicon").hover(function(){
            $(this).css("border","1px solid");
        },function(){
            $(this).css("border","none");
        })
    }


    return {
        init: init,
        render: render
    }
});