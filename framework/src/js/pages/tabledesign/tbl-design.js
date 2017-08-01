require([
    'widget/dialog/nova-dialog',
    'widget/dialog/nova-notify',
    'widget/dialog/nova-bootbox-dialog',
    'q',
    '../../nova-utils',
    'json-stable-stringify',
    '../../module/tabledesign/tbl-detail-design',
    '../../module/tabledesign/scripts',
    '../../tpl/tabledesign/tbl-design-basicinfo',
    '../../tpl/tabledesign/tpl-tblmeta-selected',
    'fancytree-all',
    "utility/jquery-hotkeys/jquery.hotkeys",
    'jquery.datatables',
    'datatables.bootstrap'
], function(Dialog, Notify, bootBox, Q, NovaUtils, stringify, tblDetailDesign, tblDesignScript, tblBasicInfo, tblMetaList) {
    var DEBUG = true;
    tblBasicInfo = _.template(tblBasicInfo);
    tblMetaList = _.template(tblMetaList);
    var lyTpl = _.template('<span class="tm-tag tm-tag-primary mt10 ml10 mb10">' +
        '<span style="cursor:pointer;" class="layoutItem">' +
        '<a style="color:#fff;" id="<%- LAYOUT_KEY %>" tagidtoedit="1">' +
        '<%- LAYOUT_TITLE %>' +
        '</a>' +
        '<span class="hide ly_desc"><%- LAYOUT_DESC %></span>' +
        '<span class="hide ly_default"><%- LAYOUT_DEFAULT %></span>' +
        '</span>' +
        '<a href="#" class="tm-tag-remove">x</a>' +
        '</span>');

    var TYPE_DATASOURCE = 1;
    var CURRENT_NODE_KEY;
    var CURRENT_LAYOUT;
    var tblMetaData = [];

    pageInit();
    tblDesignScript.init();

    function pageInit() {

        // 左侧面板树的筛选框
        $("input[name=search-input]").keyup(function(event) {
            var targetTree = getCurrentTree();
            if (!targetTree) {
                return;
            }

            var count, opts = {
                autoExpand: true
            };
            var match = $(this).val();

            if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                $("button#btn-reset").click();
                return;
            }
            count = targetTree.filterNodes(match, opts);

            $("button#btn-reset").attr("disabled", false);
            $("span#matches").text("(" + count + ")");
        });
        $("button#btn-reset").click(function() {
            var targetTree = getCurrentTree();
            if (!targetTree) {
                return;
            }

            $("input[name=search-input]").val("");
            $("span#matches").text("");
            targetTree.clearFilter();
            $(this).attr('disabled', 'true');
        });

        generateTree();
        //================= for debug===============
        if (DEBUG) {
            // window.HistoryStack = HistoryStack;
        }
    }

    function getCurrentTree() {
        var treeContainer = $('#tab-data-tree');
        return treeContainer ? treeContainer.fancytree('getTree') : null;
    }

    function setDsTree(dsDirs) {
        inflateTree($('#tab-data-tree'), TYPE_DATASOURCE, dsDirs, function(event, data) {
            if (data.node.folder) {
                return "fa fa-folder fa-fw";
            } else {
                return "fa fa-file fa-fw";
            }
        });

        $('ul.fancytree-container').css('height', '100%');
    }

    function inflateTree($container, dataType, data, iconMapper) {
        var nodeTpl = _.template('<span class="fancytree-title unselectable"><%- title %></span><span id="favor-toggle" class="fancytree-action-icon fs16 ml10 text-muted"></span>');
        $container.fancytree({
            extensions: ["filter"],
            quicksearch: true,
            filter: {
                mode: "dimn",
                autoAppaly: true,
                hightlight: true
            },
            selectMode: 2,
            clickFolderMode: 1,
            checkbox: false,
            autoScroll: true,
            source: data,
            iconClass: iconMapper,
            init: function(event, data) {
                // data.tree.visit(function(node) {
                //     node.setExpanded(true);
                // });
                data.tree.visit(function (node) {
                    if (node.data.parentDirId == "-1") {
                        node.setExpanded(true);
                    }
                });
            },
            // 创建title自定义节点
            renderTitle: function(event, data) {
                return nodeTpl({
                    title: data.node.title
                });
            },
            // 第一次创建时
            createNode: function(event, data) {

            },
            renderNode: function(event, data) {
                var node = data.node;
                var favorToggle = $(node.li).find('#favor-toggle');
                if (data.node.folder) {
                    favorToggle.addClass('hide');
                } else {
                    favorToggle.removeClass('hide');
                }
                var favored = node.data.favored;
                favorToggle.removeClass(favored ? 'text-muted' : 'text-warning');
                favorToggle.addClass(favored ? 'text-warning' : 'text-muted');
            },
            activate: function(event, data) {

                var node = data.node;

                if (node.extraClasses == 'nv-table') {

                    // tblDetailDesign.renderForTblDesign({
                    //     container : $("#main-content-area"),
                    // });
                    // tblDesignScript.openTblDesign();

                    _initLayoutList({
                        container: $("#tbl-layout-list-body"),
                        tblId: node.key
                    });
                    _getTblMetaData({
                        tblId : CURRENT_NODE_KEY
                    });
                } else {

                }
            }
        });
    }

    function toggleRightPanel(open) {
        if (_.isUndefined(open)) {
            $('#right-panel-container').toggleClass('hide');
            $('#right-panel-toggle').toggleClass('text-primary');
        } else if (open) {
            $('#right-panel-toggle').addClass('text-primary');
            $('#right-panel-container').removeClass('hide');
        } else {
            $('#right-panel-toggle').removeClass('text-primary');
            $('#right-panel-container').addClass('hide');
        }
    }

    var resultFullScreen = false;
    $('#left-panel-toggle').click(function() {
        $('#tree-content').toggleClass('hide');
        $(this).toggleClass('text-primary');
    });

    $('#right-panel-toggle').click(function() {
        toggleRightPanel();
        // $("#right-panel-container").toggleClass('hide');
    });

    $("#btn-tbl-layout-list").click(function() {
        if (_.isEmpty(CURRENT_NODE_KEY)) {
            Notify.show({
                title: "请先选中表单",
                type: "danger"
            });
        } else {
            $("#tbl-layout-list").toggleClass("hide");
        }
    });

    $("#btn-table-tree-refresh").click(function() {
        refreshTree();
    });

    $("#layoutHead").click(function() {
        $(this).parent().find(".rows").toggleClass('hide');
    });

    $("#componentHead").click(function() {
        $(this).parent().find(".boxes").toggleClass('hide');
    });

    $("#labelcompHead").click(function() {
        $(this).parent().find(".boxes").toggleClass('hide');
    });
    $("#btn-metadata").click(function() {
        if (_.isEmpty(CURRENT_LAYOUT)) {
            Notify.show({
                title: "请先选中表单布局",
                type: "danger"
            });
            return;
        }
        tblDesignScript.rendFromTblMetaDt(tblMetaData,CURRENT_NODE_KEY);
    });

    $("#btn-saveTblDesign").click(function() {
        if (_.isEmpty(CURRENT_LAYOUT)) {
            Notify.show({
                title: "当前无选中表单布局",
                type: "danger"
            });
            return;
        }

        Dialog.build({
            title: "基本信息",
            leftBtn: "关闭",
            rightBtn: "保存",
            width: 650,
            minHeight: 250,
            content: tblBasicInfo({
                tbl_name: CURRENT_LAYOUT.ly_title,
                tbl_key: CURRENT_LAYOUT.ly_key,
                tbl_desc: CURRENT_LAYOUT.ly_desc
            }),
            rightBtnCallback: function() {
                if($("#tbl_default").is(":checked")){
                    CURRENT_LAYOUT.ly_default = 1;
                }else{
                    CURRENT_LAYOUT.ly_default = 0;
                }
                CURRENT_LAYOUT.ly_title = $("#tbl_name").val();
                CURRENT_LAYOUT.ly_desc = $("#tbl_desc").val();
                tblDesignScript.saveTblDesign(CURRENT_LAYOUT);
                Dialog.dismiss();
            },
        }).show(function() {
            if(CURRENT_LAYOUT.ly_default == '1'){
                $("#tbl_default").attr("checked",true);
            }else{
                $("#tbl_default").attr("checked",false);
            }
            
        });

    });

    $("#btn-previewTblDesign").click(function() {
        tblDesignScript.previewTblDesign();
    });

    $("#btn-editviewTblDesign").click(function() {
        tblDesignScript.editviewTblDesign();
    });

    $("#btn-clearTblDesign").click(function(e) {
        tblDesignScript.clearTblDesign(e);
    });

    $("#btn-create-layout").click(function() {
        if (_.isEmpty(CURRENT_NODE_KEY)) {
            Notify.show({
                title: "请先选中表单",
                type: "danger"
            });
            return;
        }
        Dialog.build({
            title: "创建布局",
            leftBtn: "关闭",
            rightBtn: "保存",
            width: 650,
            minHeight: 250,
            content: tblBasicInfo({
                tbl_name: "",
                tbl_key: "自动生成",
                tbl_desc: ""
            }),
            rightBtnCallback: function(e) {

                $.getJSON('/tbl-design/createLayout', {
                    ly_title: $("#tbl_name").val(),
                    ly_desc: $("#tbl_desc").val(),
                    state : 0,
                    tableId : CURRENT_NODE_KEY
                }).done(function(rsp) {
                    if (rsp.code == 0) {
                        _initLayoutList({
                            container: $("#tbl-layout-list-body"),
                            tblId: CURRENT_NODE_KEY
                        });
                        CURRENT_LAYOUT = {
                            ly_key: rsp.data.layoutId,
                            ly_desc: $("#tbl_desc").val(),
                            ly_path: "",
                            ly_title: $("#tbl_name").val(),
                            ly_default : 0
                        };

                        _setCurrentSelectedTag({
                            selectedTag: $("#" + CURRENT_LAYOUT.ly_key).parent().parent()
                        });

                        $("#main-content-area").removeClass("hide");
                        $("#tbl-layout-list").addClass("hide");
                        tblDesignScript.newTblDesign(e);
                    } else {

                    }
                });
                Dialog.dismiss();
            }
        }).show(function() {
            $("#tbl_default").parent().parent().parent().addClass("hide");
        });
    });

    function generateTree() {
        var promiseArray = [];
        var dsPromise = NovaUtils.makeRetryGet('/tbl-design/getTblTree');
        promiseArray.push(dsPromise);
        Q.all(promiseArray)
            .spread(function(dataSource) {
                setDsTree(dataSource);

                hideLoader();
            }).catch(function(ex) {
                hideLoader();
                Notify.show({
                    title: '加载异常',
                    text: ex ? ex.message : '服务器数据加载失败，请稍后刷新',
                    type: 'danger'
                });
            });
    }

    function refreshTree() {
        var promiseArray = [];
        var dsPromise = NovaUtils.makeRetryGet('/tbl-design/getTblTree');
        promiseArray.push(dsPromise);
        Q.all(promiseArray)
            .spread(function(dataSource) {
                $('#tab-data-tree').fancytree('getTree').reload(dataSource);

                hideLoader();
            }).catch(function(ex) {
                hideLoader();
                Notify.show({
                    title: '加载异常',
                    text: ex ? ex.message : '服务器数据加载失败，请稍后刷新',
                    type: 'danger'
                });
            });
    }

    function _initLayoutList(info) {
        
        CURRENT_NODE_KEY = info.tblId;
        
        
        CURRENT_LAYOUT = {};
        $("#main-content-area").addClass("hide");

        $.getJSON('/tbl-design/getTblLayoutList', {
            tblId: info.tblId
        }).done(function(rsp) {
            if (rsp.code == 0) {
                $(info.container).empty();
                if (rsp.data.length == 0) {
                    $(info.container).append("<span>请创建表单布局</span>");
                } else {
                    _.each(rsp.data, function(lyItem) { 
                        $(info.container).append(lyTpl({
                            LAYOUT_KEY: lyItem.layoutId,
                            LAYOUT_TITLE: lyItem.layoutName, 
                            LAYOUT_DESC: lyItem.layoutDesc,
                            LAYOUT_DEFAULT : lyItem.isDefault,
                        }));
                    });
                }
            } else {

            }
            $(".layoutItem").click(function() {
                _setCurrentSelectedTag({
                    selectedTag: $(this).parent()
                });
                var layoutKey = $(this).find("a").attr("id");
                var layoutTitle = $(this).find("a").text();
                var layoutDesc = $(this).find(".ly_desc").text();
                var layoutDefault = $(this).find(".ly_default").text();
                CURRENT_LAYOUT = {
                    ly_key: layoutKey,
                    ly_desc: layoutDesc,
                    ly_path: "",
                    ly_title: layoutTitle,
                    ly_default : layoutDefault,
                };
                _updateLayoutItem({
                  currentLayout : CURRENT_LAYOUT,
                  currentTblId : CURRENT_NODE_KEY
                });
            });
            $(".tm-tag-remove").click(function() {
                _removeLayoutItem({
                    layoutKey: $(this).parent().find(".layoutItem").find("a").attr("id"),
                    tblId: CURRENT_NODE_KEY,
                    rmLayout: $(this).parent()
                });

            });
        });
        $("#tbl-layout-list").removeClass("hide");

    }

    function _removeLayoutItem(info) {
        $.getJSON("/tbl-design/deleteLayout", {
            layoutKey: info.layoutKey,
            tblId: info.tblId
        }).done(function(rsp) {
            if (rsp.code == 0) {
                if (info.layoutKey == CURRENT_LAYOUT.ly_key) {
                    CURRENT_LAYOUT = {};
                    $("#main-content-area").addClass("hide");
                }
                $(info.rmLayout).remove();
                if ($("#tbl-layout-list-body").find("span").hasClass("layoutItem")) {} else {
                    $("#tbl-layout-list-body").empty().append("<span>请创建表单布局</span>");
                }
            } else {

            }
        });
    }

    function _updateLayoutItem(info) {
        $("#main-content-area").removeClass("hide");
        $("#tbl-layout-list").addClass("hide");
        tblDesignScript.openTblDesign(info);
    }

    function _setCurrentSelectedTag(info) {
        var lastSelecedTag = $("#tbl-layout-list-body").find(".tm-tag-danger");
        $(lastSelecedTag).removeClass("tm-tag-danger");
        $(lastSelecedTag).addClass("tm-tag-primary");

        $(info.selectedTag).removeClass("tm-tag-primary");
        $(info.selectedTag).addClass("tm-tag-danger");
    }

    function _getTblMetaData(info) {
        tblMetaData = [];
        $.getJSON("/tbl-design/getTblMetaData", {
            tblId: info.tblId,
        }).done(function(rsp) {
            if (rsp.code == 0) {
                tblMetaData = rsp.data;
                // _.each(rsp.data.mainTable, function(item) {
                //     tblMetaData.push({
                //         name : "tbl_"+item.fieldId,
                //         label: item.fieldDisplayName,
                //         type:  "C",//metaTypeMap[item.fieldType],
                //         dict: item.codeTable,
                //         length: 200
                //     });
                // });
            } else {

            }
        });

    }
});