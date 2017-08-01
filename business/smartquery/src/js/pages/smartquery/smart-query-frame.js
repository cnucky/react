initLocales(require.context('../../../../../datafence/src/locales/gis-module', false, /\.js/));
require([
        '../../tpl/smartquery/data-source-picker',
        'nova-notify',
        'nova-dialog',
        'nova-bootbox-dialog',
        '../../module/smartquery/general-data-query',
        'utility/utility',
        'fancytree-all',
        'utility/fancytree/extensions/jquery.fancytree.childcounter',
        'bootstrap-tagsinput',
        'utility/select2/select2',
        'utility/select2/i18n/zh-CN'
    ],

    function( DataSource, Notify, Dialog, bootbox,GeneralQuery) {

         $(document).ready(function() {


            //edit bu guqun
            var taskId = getURLParameter("taskid");
            var mobile = getURLParameter("mobile");
            var taskName = getURLParameter('taskname');
            //console.log(getURLParameter('taskname'));

            //edit by zhangu

            var _modelId = getURLParameter("modelid");
            var _modelName = getURLParameter("modelname");

            //end by zhangu

            // 从 search.html URL 传参中获得搜索关键字
            function getURLParameter(name) {
                return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
            }
            //end

            $.getJSON('/smartquery/smartquery/getdatasource').done(function(rsp) {
                setHeight();
                setDataTypeTree(rsp.data.tree, rsp.data.favoredDir);
                leftPanelToggle();
                processMobilePage();

            });

            var setHeight = function() {
                var leftTray = $('.tray.tray-left');
                var leftHeight = window.innerHeight - leftTray.offset().top;
                $('.tray.tray-center').height(leftHeight);
                $('.dir-tree').height(leftHeight - $('#dir-tree-panel').position().top);
                leftTray.height(leftHeight);
            }

            $(window).on("resize", function() {
                var leftTray = $('.tray.tray-left');
                var leftHeight = window.innerHeight - leftTray.offset().top;
                $('.tray.tray-center').height(leftHeight);
                $('.dir-tree').height(leftHeight - $('#dir-tree-panel').position().top);
                leftTray.height(leftHeight);
            });


            var setDataTypeTree = function(dsDirs, favorDir) {
                inflateTree($('#data-type-tree'), dsDirs, favorDir, function(event, data) {
                    if (data.node.folder) {
                        return "fa fa-folder fa-fw";
                    } else {
                        return "fa fa-database fa-fw";
                    }
                });

                //$("#data-type-tree").contextmenu({
                //    delegate: "span.fancytree-node",
                //    menu: [
                //        {
                //            title: "<i class='fa fa-edit' style='color: #519f50'></i> &nbsp配置展示字段",
                //            cmd: "edit",
                //        },
                //    ],
                //    beforeOpen: beforeOpen,  //定义在菜单展现之前的操作
                //    select: contextMenuSelect           //定义选中菜单中的项的操作
                //});

                $("#data-type-tree").on("nodeCommand", function(event, data) {
                    var refNode;
                    var tree = $(this).fancytree("getTree");
                    var node = tree.getActiveNode();
                    selectedNode = node;
                    switch (data.cmd) {
                        case "edit": //新建目录

                            break;
                        default:
                            return;
                    }
                });

                $('.ui-menu-item').length = 100;
            };


            //定义在菜单展现之前的操作
            function beforeOpen(event, ui) {
                //获取节点
                var node = $.ui.fancytree.getNode(ui.target);


                node.setActive(); //将当前节点设置为active状态
            }

            //定义选中菜单中的项的操作
            function contextMenuSelect(event, ui) {
                //延时0.1秒执行命令，以确保菜单关闭和执行命令两件事情不冲突
                var that = this;
                setTimeout(function() {
                    $(that).trigger("nodeCommand", {
                        cmd: ui.cmd
                    });
                }, 100);
            }

            var inflateTree = function($container, treeData, favorDir, iconMapper) {
                var nodeTpl = _.template('<span class="fancytree-title unselectable"><%- title %></span><span id="favor-toggle" class="fancytree-action-icon fs16 ml10 text-muted fa fa-star"></span>');
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
                    source: treeData,
                    iconClass: iconMapper,
                    // 创建title自定义节点
                    renderTitle: function(event, data) {
                        return nodeTpl({
                            title: data.node.title
                        });
                    },
                    // 第一次创建时
                    createNode: function(event, data) {
                        // makeNodeDraggable(data);

                        bindFavorToggle(data, favorDir);
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
                    lazyLoad: function(event, data) {
                        data.result = {
                            url: "/smartquery/smartquery/listmodelingtask",
                            data: {
                                taskId: data.node.data.typeId
                            }
                        };
                    },
                    activate: function(event, data) {
                        if (!data.node.folder) {
                            mkGeneralQuery(data.node.data);
                        }
                    },

                });
                //标签树搜索(过滤)逻辑
                $("input[name=search-input]").keyup(function(event) {
                    var targetTree = $container.fancytree('getTree');
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
                //搜索条件清除按钮
                $("button#btn-reset").click(function() {
                    var targetTree = $container.fancytree('getTree');
                    if (!targetTree) {
                        return;
                    }

                    $("input[name=search-input]").val("");
                    $("span#matches").text("");
                    targetTree.clearFilter();
                    $(this).attr('disabled', 'disabled');
                });
            };

            var bindFavorToggle = function(data, favoredDir) {
                var node = data.node;
                var favorToggle = $(node.li).find('#favor-toggle');
                favorToggle.click(function() {
                    $(this).toggleClass('text-warning text-muted');
                    var itemFavored = node.data.favored;
                    itemFavored = itemFavored ? itemFavored : false;
                    node.data.favored = !itemFavored;
                    var tree = node.tree;
                    var favorNode = tree.getNodeByKey(favoredDir);
                    if (itemFavored) {
                        deleteFavor(node.data);
                        favorNode.removeChild(tree.getNodeByKey(keyOfTreeNode(node.data) + '_favored'));
                        if (node.data.parentId == 1) {
                            var origNode = tree.getNodeByKey(keyOfTreeNode(node.data));
                            origNode.data.favored = !itemFavored;
                            if (origNode.isVisible()) {
                                origNode.render();
                            }
                            // 阻止事件冒泡,引起fancytree的warnning
                            return false;
                        }
                    } else {
                        addFavor(node.data);

                        var newNode = _.extend({}, node.data);
                        newNode.key = node.key + '_favored';
                        newNode.favored = true;
                        newNode.parentId = 1;
                        newNode.extraClasses = 'nv-data';
                        newNode.title = node.title;
                        favorNode.addNode([newNode]);
                        // 组织事件冒泡,引起fancytree的warnning
                        return false;
                    }
                });
            }

            var keyOfTreeNode = function(nodeData) {
                return nodeData.centerCode + '_' + nodeData.zoneId + '_' + nodeData.typeId;
            }

            var addFavor = function(nodeData) {
                $.getJSON('/smartquery/smartquery/saveCustomQueryModel', {
                        centerCode: nodeData.centerCode,
                        zoneId: nodeData.zoneId,
                        typeId: nodeData.typeId
                    },
                    function(rsp) {});
            }

            var deleteFavor = function(nodeData) {
                $.getJSON('/smartquery/smartquery/deleteCustomQueryModel', {
                        centerCode: nodeData.centerCode,
                        zoneId: nodeData.zoneId,
                        typeId: nodeData.typeId
                    },
                    function(rsp) {});
            }

            var mkGeneralQuery = function(datatype) {

                GeneralQuery.init({
                    container: $('#form-container'),
                    datatype: datatype
                });
                GeneralQuery.renderGeneralDataQuery();
                GeneralQuery.stopCurrentQuery();


                //breadcrumb展示数据类型信息
                appendCrumbTrail(datatype.caption);

            }


            var appendCrumbTrail = function(datatypename) {
                $('#topbar .breadcrumb .crumb-trail').remove();
                $('.breadcrumb').append('<li class="crumb-trail">' + datatypename + '</li>');
            }

            var processMobilePage = function() {
                if (!_.isEmpty(mobile)) {

                    var mobileKey = '100000_1_506';
                    var tree = $('#data-type-tree').fancytree('getTree');
                    var mobileNode = tree.getNodeByKey(mobileKey) || tree.getNodeByKey(mobileKey + '_favored');
                    mobileNode.setActive();
                    setTimeout(function() {
                        GeneralQuery.inputTelcomMobile(mobile);
                    }, 300);

                }
            };

            var leftPanelToggle = function() {
                var $dataGrid, $splitter;
                var startOffsetTop, stopOffsetTop;

                $('#left-panel-toggle').draggable({
                    cursor: 'pointer',
                    containment: ".tray.tray-center",
                    revert: "valid",
                    zIndex: 100,
                    // helper: 'clone',
                    distance: 5,
                    axis: 'y',
                    start: function(event, ui) {
                        startOffsetTop = ui.offset.top;
                    },
                    stop: function(event, ui) {
                        stopOffsetTop = ui.offset.top;
                        $('#left-panel-toggle').css({
                            top: stopOffsetTop
                        })

                    },
                });


                $('#left-panel-toggle').click(function() {
                    var $resultTab = $('#res-li');

                    if ($('.tray.tray-left').hasClass('hide')) {
                        leftPanelShow();
                        toggleSpanPositionReset();
                        $splitter = $('#mainSplitter');
                        $dataGrid = $('#dataGrid');
                        if ($resultTab.hasClass('active')) {
                            if (GeneralQuery.exposeQueryHelper().exposeJqxBinding().isResultTableOpen()) {
                                GeneralQuery.exposeQueryHelper().exposeJqxBinding().initSplitter();
                            } else {
                                if ($('#tableBox').hasClass('jqx-splitter-panel')) {
                                    GeneralQuery.exposeQueryHelper().exposeJqxBinding().closeSplitter();
                                } else {
                                    if ($dataGrid) {
                                        var width = window.innerWidth - $dataGrid.offset().left
                                        $dataGrid.jqxGrid('width', width + 'px');
                                    }
                                }
                            }
                        }

                    } else {
                        leftPanelHide();
                        toggleSpanPositionReset();
                        $splitter = $('#mainSplitter');
                        $dataGrid = $('#dataGrid');
                        if ($resultTab.hasClass('active')) {
                            if (GeneralQuery.exposeQueryHelper().exposeJqxBinding().isResultTableOpen()) {
                                GeneralQuery.exposeQueryHelper().exposeJqxBinding().initSplitter();
                            } else {
                                if ($('#tableBox').hasClass('jqx-splitter-panel')) {
                                    GeneralQuery.exposeQueryHelper().exposeJqxBinding().closeSplitter();
                                } else {
                                    if ($dataGrid) {
                                        var width = window.innerWidth - $dataGrid.offset().left
                                        $dataGrid.jqxGrid('width', width + 'px');
                                    }
                                }


                            }
                        }

                    }


                });
            };
            var leftPanelShow = function() {
                $('.tray.tray-left').removeClass('hide');
                $('#left-panel-toggle i').removeClass('fa-caret-right').addClass('fa-caret-left');
            };
            var leftPanelHide = function() {
                $('.tray.tray-left').addClass('hide');
                $('#left-panel-toggle i').removeClass('fa-caret-left').addClass('fa-caret-right');
            };

            var toggleSpanPositionReset = function() {
                var offsetLeft = $('.tray.tray-center').offset().left - $('#content').offset().left;
                $('#left-panel-toggle').css({
                    left: offsetLeft
                })

            };

            //edit by guqun
            if (!_.isEmpty(taskId)) {


                $.getJSON('/smartquery/smartquery/getTaskInfo', {
                    taskId: taskId
                }).done(function(rsp) {
                    if (rsp.data) {
                        var taskInfo = rsp.data;
                        if (taskInfo.dataType.name) {
                            $('#topbar .breadcrumb .crumb-trail').remove();
                            $('.breadcrumb').append('<li class="crumb-trail">' + taskInfo.dataType.name + '</li>');
                            if (taskName != null && taskName != "") {
                                //$('#topbar .breadcrumb .crumb-trail').remove();
                                $('.breadcrumb').append('<li class="crumb-trail">任务：' + taskName + '</li>');
                            }
                        }
                        switch (taskInfo.dataType.srcTypeId) {
                            default: GeneralQuery.init({
                                container: $('#form-container'),
                                datatype: taskInfo.dataType
                            });
                            GeneralQuery.renderGeneralDataQuery();
                            setTimeout(function() {
                                GeneralQuery.inputGeneralDataQuery(taskId);
                            }, 300);
                        }
                    }
                })
            } else if (!_.isEmpty(_modelId)) {

                $.getJSON('/smartquery/smartquery/openModel', {
                    modelId: _modelId
                }).done(function(rsp) {
                    if (rsp.data) {
                        var modelInfomation = $.parseJSON(rsp.data.modelDetail);
                        if (modelInfomation.taskDetail.dataType.name) {
                            $('#topbar .breadcrumb .crumb-trail').remove();
                            $('.breadcrumb').append('<li class="crumb-trail">' + modelInfomation.taskDetail.dataType.name + '</li>');
                            //add by zhangu
                            if (_modelName != null && _modelName != "") {
                                $('.breadcrumb').append('<li class="crumb-trail">模型：' + _modelName + '</li>');
                            }
                            //the end
                        }
                        var modelDataType = modelInfomation.taskDetail.dataType;
                        switch (modelDataType.srcTypeId) {

                            default: GeneralQuery.init({
                                container: $('#form-container'),
                                datatype: modelInfomation.taskDetail.dataType,
                                modelId: _modelId
                            });
                            GeneralQuery.renderGeneralDataQuery();
                            setTimeout(function() {
                                GeneralQuery.modelInputGeneralDataQuery(_modelId);
                            }, 300);
                        }
                    }
                })
            } else {}
            //end
        })

        hideLoader();
    })