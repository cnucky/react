var $ = require('jquery');
var _ = require('underscore');
var Dialog = require('nova-dialog');
var loaders = require('utility/loaders')
var tplAddNode = require('../../tpl/relationship/tpl-add-node-dialog');
tplAddNode = _.template(tplAddNode);

function buildAddNodeDialog(nodeTypeInfo, NetworkConfig, callback) {
    var certPattern = new RegExp(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/);
    var mobilePattern = new RegExp(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
    var mailPattern = new RegExp(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);
    var ipPattern = new RegExp(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

    var clickTime;

    Dialog.build({
            title: "添加节点",
            content: tplAddNode({
                types: nodeTypeInfo
            }),
            hideFooter: true,
            closeOnBgClick: false
        }).show(function() {
            var categoryStabled = false;    // 手动选择了一个类别，不要让自动匹配再生效
            $("#txt-query-node-key").on("input", function() {
                // 没有手动选择类别才进行正则匹配
                if (!categoryStabled) {
                    var searchinput = $("#txt-query-node-key").val();
                    if (certPattern.test(searchinput)) {
                        selectDropdown($("#button_1"));
                    } else if (mobilePattern.test(searchinput)) {
                        selectDropdown($("#button_5"));
                    } else if (mailPattern.test(searchinput)) {
                        selectDropdown($("#button_12"));
                    } else if (ipPattern.test(searchinput)) {
                        selectDropdown($("#button_14"));
                    } else {
                        selectDropdown($("#button_1"));
                    }
                }
            })

            var searchType = nodeTypeInfo[0].type;

            $('#query-node-box .dropdown-menu a').on('click', function() {
                var a = $(this);
                selectDropdown(a);
                if (searchType == 1) {
                    categoryStabled = false;
                } else {
                    categoryStabled = true;
                }
            })

            $("#add-search-form").on('submit', function(e) {
                e.preventDefault();

                var key = $('#txt-query-node-key').val().trim();
                if (_.isEmpty(key)) {
                    return;
                }
                var loader = loaders($('#load-query-result'));
                $.getJSON('/relationgraph/relationgraph/querynode', {
                    keyword: key,
                    type: searchType
                }, function(rsp) {
                    loader.hide();
                    if (rsp.code == 0) {
                        var ul = $('ul#list-query-node');
                        ul.empty();
                        var rltTpl = _.template('<li><a href="javascript:void(0);"><span class="<%- icon %> text-info mr10"></span> <%- title %> </a></li>');
                        _.each(rsp.data, function(rlt) {
                            var icon = NetworkConfig.icons["" + rlt.nodeType];
                            var li = $(rltTpl({
                                icon: icon ? icon.name : "",
                                title: rlt.title
                            }));
                            li.click(function() {
                                if (clickTime && clickTime - Date.now() < 200) {
                                    return;
                                }
                                clickTime = Date.now();
                                $.magnificPopup.close();

                                callback(rlt);                                
                            })
                            ul.append(li);
                        })
                    }
                })
            })

            function selectDropdown(aButton) {
                $('#query-node-box button').html(aButton.html());
                $('#query-node-box').removeClass('open');
                searchType = parseInt(aButton.attr('data-type'));
            }
        });
}


module.exports.buildAddNodeDialog = buildAddNodeDialog;