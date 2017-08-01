initLocales(require.context('../../../locales/modeling', false, /\.js/), 'zh');
registerLocales(require.context('../../../locales/operator', false, /\.js/), 'operator');
require([
    'nova-dialog',
    'nova-notify',
    'nova-bootbox-dialog',
    'utility/loaders',
    '../../module/relationgraph/relationship-network-config',
    '../../module/relationgraph/relationship-overview',
    '../../module/modeling/modeling-condition-builder',
    '../../module/modeling/modeling-toolbar-handler',
    '../../module/modeling/model-manager',
    '../../module/modeling/modeling-task-result',
    'utility/FileSaver/FileSaver',
    'q',
    'nova-utils',
    '../../tpl/modeling/tpl-store-image',
    '../../module/modeling/operations',
    '../../module/modeling/taskinfo-table',
    '../../module/modeling/model-chooser',
    'fancytree-all',
    "utility/jquery-hotkeys/jquery.hotkeys",
    'utility/FileSaver/canvas-toBlob'
], function(Dialog, Notify, bootBox, loader, NetworkConfig, Overview, CondBuilder, handleToolbar, modelManager, TaskResult, FileSaver, Q, NovaUtils, tplStoreImage, Operations, TaskInfoTable, ModelChooser) {
    var DEBUG = true;

    tplStoreImage = _.template(tplStoreImage);

    //Network
    var network;
    var nodes = new vis.DataSet();
    var edges = new vis.DataSet();

    //toolbar status
    var toolbar = {
        autolayout: true
    };

    //actions when event occurs
    var eventAction = {};

    // multiple select vars
    var onlineMode = false;
    var currentDirection = 'UD';
    var clickDeleteMode = false;
    var selectedNodes = []; // multi
    var selectedEdges = [];

    var taskInfoData = [];

    var resultContainer = document.getElementById('result-container');

    var networkContainer = $("#network-container");
    networkContainer[0].style.cursor = "pointer";

    var startBtn = $('#btn-start-task'),
        pauseBtn = $('#btn-pause-task'),
        resumeBtn = $('#btn-resume-task'),
        restartBtn = $('#btn-restart-task');

    var TYPE_DATASOURCE = 1,
        TYPE_OPERATOR = 2;

    pageInit();

    function pageInit() {

        createNetwork();

        bindNetworkEvent();

        handleToolbar.init({
            container: networkContainer,
            modelManager: modelManager,
            network: network,
            nodes: nodes,
            edges: edges,
            condBuilder: CondBuilder,
            handler: handleContextMenu
        });

        bindToolbarClick();

        (function() {
            $(window).on('nv-resize resize', _.debounce(resizeCanvas, 100));
        })(); // end resize events

        (function() {
            $('#drawing').droppable({
                accept: ".model-operator, .nv-data.fancytree-node",
                drop: function(event, ui) {
                    var opts = {
                        network: network,
                        nodes: nodes,
                        ui: ui,
                        nodeData: ui.helper.data('node-meta')
                    };
                    handleToolbar.dragCreateNode(opts);
                }
            });
        }());

        // TaskResult.render(resultContainer);

        modelManager.watchTaskUpdate(function(runningInfo, changedTasks) {
            _.each(changedTasks, function(taskInfo) {
                var nodeId = taskInfo.nodeId;
                var node = nodes.get(nodeId).origNode;
                if (node.taskType != 0) {
                    handleToolbar.updateNode(node);
                }
            });
            if (!_.isEmpty(changedTasks)) {
                $('#btn-toggle-taskinfotable').addClass('text-primary');
                taskInfoData = _.filter(runningInfo.nodes, function (node) {
                    return node.nodeType != Operations.DATA_SOURCE;
                });
                TaskInfoTable.render($('#task-table-container')[0], taskInfoData , taskInfoClicked, taskInfoDoubleClicked, 'taskId');
            }

            if (selectedNodes.length > 0 && _isResultPanelActive()) {
                var selectNode = nodes.get(selectedNodes[0]);
                if (selectNode) {
                    var newInfo = changedTasks[selectedNodes[0]];
                    if (newInfo) {
                        newInfo.isSave = selectNode.origNode.isSave === 1;
                        TaskResult.render(resultContainer, TaskResult.mode.TASK_RESULT, newInfo);
                    }
                }
            }

            var taskState = runningInfo.mainTask.taskState;
            switch (taskState) {
                case 'queue':
                case 'running':
                    startBtn.addClass('hide');
                    resumeBtn.addClass('hide');

                    pauseBtn.removeClass('hide');
                    break;
                case 'finished':
                case 'cancelled':
                case 'error':
                    pauseBtn.addClass('hide');
                    resumeBtn.addClass('hide');

                    startBtn.removeClass('hide');
                    break;
            }
        });

        //刷新按钮
        $("#btn-refresh").click(
            function () {
                var dsLoader = loader($('#tab-data-tree .ui-fancytree'));
                var dsPromise = NovaUtils.makeRetryGet('/modelanalysis/modeling/getdatasource');
                dsPromise.then(function(datasource) {
                    $('#tab-data-tree').fancytree({source: datasource.tree});
                }).catch(function(err) {
                    Notify.show({
                        title: '刷新失败',
                        text: err,
                        type: 'danger'
                    });
                }).finally(function() {
                    dsLoader.hide();
                });
            }
        )

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

            $("button#btn-reset").attr("disabled", false).text(window.i18n.t('clear-btn') + "(" + count + ")");
        });
        $("button#btn-reset").click(function() {
            var targetTree = getCurrentTree();
            if (!targetTree) {
                return;
            }

            $("input[name=search-input]").val("");
            $("span#filter-matches").text("");
            targetTree.clearFilter();
            $(this).attr('disabled', 'true').text(window.i18n.t('clear-btn'));
        });

        // 请求基础信息
        (function() {
            var promiseArray = [];
            var dsPromise = NovaUtils.makeRetryGet('/modelanalysis/modeling/getdatasource');
            var defPromise = NovaUtils.makeRetryGet('/modelanalysis/collision/getsemanticdef');
            var modelingPromise = NovaUtils.makeRetryGet('/modelanalysis/modeling/getoperators');
            promiseArray.push(dsPromise, defPromise, modelingPromise);

            var taskId = NovaUtils.getURLParameter('taskid');
            // if (taskId) {
            //     restartBtn.removeClass('hide');
            // } else {
            //     restartBtn.addClass('hide');
            // }
            var modelId = NovaUtils.getURLParameter('modelid');
            var solidId = NovaUtils.getURLParameter('solidid');

            Q.all(promiseArray)
                .spread(function(dataSource, semantic, operationTypes) {
                    modelManager.init(network, nodes, edges, operationTypes.array);

                    CondBuilder.init({
                        container: $('#node-config-panel'),
                        taskManager: modelManager,
                        semanticDef: semantic,
                        nodeSet: nodes
                    });

                    modelManager.setNodeChangeListener(function(nodeId) {
                        CondBuilder.onNodeChanged(nodeId);

                        if (!nodes.get(nodeId)) {
                            TaskResult.render(resultContainer);
                        }
                    });

                    setDsTree(dataSource.tree, dataSource.favoredDir);
                    setOperatorTree(operationTypes.tree, operationTypes.favoredDir);

                    if (taskId || modelId || solidId) {
                        taskId && loadTaskSnapshot(taskId);
                        modelId && loadModelDetail(modelId);
                        solidId && loadSolidDetail(solidId);
                    } else {
                        hideLoader();
                    }
                }).catch(function(ex) {
                    hideLoader();
                    Notify.show({
                        title: window.i18n.t("modeling.loading-exception"),
                        text: ex ? ex.message : window.i18n.t("modeling.server-data-load-failed"),
                        type: 'danger'
                    });
                });
        }());

        //taskinfotable切换按钮
        $('#btn-toggle-taskinfotable').click(function(){
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            if ($('#task-table-container').hasClass('hide')) {
                $('#task-table-container').removeClass('hide')
                .addClass('fadeInUp animated')
                .one(animationEnd, function(){
                    $(this).removeClass('fadeInUp animated');
                })
            } else {
                $('#task-table-container')
                .addClass('fadeOutDown animated')
                .one(animationEnd, function() {
                    $(this).removeClass('fadeOutDown animated');
                    $(this).addClass('hide');
                });
            }
        })

        //================= for debug===============
        if (DEBUG) {
            window.network = network;
            window.nodes = nodes;
            window.edges = edges;
            // window.HistoryStack = HistoryStack;
        }
    }

    // taskinfo单击事件
    function taskInfoClicked(nodeId) {
        network.unselectAll();
        network.selectNodes([nodeId], false);
        selectedNodes = [nodeId];
        onNodeChosen(nodeId);
    }
    // taskinfo双击事件
    function taskInfoDoubleClicked(nodeId) {
        network.unselectAll();
        network.selectNodes([nodeId], false);
        network.moveTo({
            position: network.getPositions(nodeId)[nodeId],
            scale: network.getScale(),
            animation: {
                duration: 200,
                easingFunction: "linear"
            }
        });
        selectedNodes = [nodeId];
        onNodeChosen(nodeId);
        gotoResultPage();
    }

    function loadTaskSnapshot(taskId) {
        showLoader();

        //var checkmodelpermission = NovaUtils.makeRetryGet('/modelanalysis/modeling/checkmodelpermission', {
        //    modelid: modelId
        //});
        //
        //checkmodelpermission.then(function(check){
        //    console.log(check)
        //    if(check === 1){
        //        $('#btn-bi-report').removeClass('hide');
        //    }
        //})

         // $('#btn-bi-report').removeClass('hide');

        var snapshotPromise = NovaUtils.makeRetryGet('/modelanalysis/modeling/getsnapshot', {
            taskid: taskId
        });
        snapshotPromise.then(function(snapshot) {
            if (snapshot && snapshot.snapshotList && snapshot.snapshotList.length > 0) {

                modelManager.loadFromSnapshot(snapshot.snapshotList[0]);
                showModelTitle(window.i18n.t("modeling.current-task") + snapshot.snapshotList[0].title);
            }
        }).catch(function() {
            Notify.show({
                title: window.i18n.t("modeling.loading-exception"),
                text: window.i18n.t("modeling.modeling-task-read-failed"),
                type: 'danger'
            });
        }).finally(function() {
            hideLoader();
        });
    }

    function loadModelDetail(modelId) {
        showLoader();

        var getModelPromise = NovaUtils.makeRetryGet('/modelanalysis/modeling/loadmodel', {
            id: modelId
        });

        //var checkmodelpermission = NovaUtils.makeRetryGet('/modelanalysis/modeling/checkmodelpermission', {
        //    modelid: modelId
        //});

        getModelPromise.then(function(model) {
            if (model) {
                modelManager.loadFromModel(modelId, model);
                $('#btn-save-model').removeClass('hide');
                //checkmodelpermission.then(function(check){
                //    console.log(check)
                //    if(check === 1){
                //
                //    }
                //})

                 // $('#btn-model-apply').removeClass('hide');
                 // $('#btn-bi-report').removeClass('hide');

                showModelTitle(window.i18n.t("modeling.current-model") + model.modelName);

                _enableModuleExport();
            }
        }).catch(function() {
            Notify.show({
                title: window.i18n.t("modeling.loading-exception"),
                text: window.i18n.t("modeling.model-load-failed"),
                type: 'danger'
            });
        }).finally(function() {
            hideLoader();
        });
    }

    function loadSolidDetail(solidId) {
        showLoader();

        var getSolidPromise = NovaUtils.makeRetryGet('/modelanalysis/modeling/loadsolid', {
            solidId: solidId
        });
        getSolidPromise.then(function(model) {
            if (model) {
                modelManager.loadFromSolid(solidId, model);
                $('#btn-save-model').removeClass('hide');
                $('#btn-new-model').addClass('hide');
                $('#btn-import-model').addClass('hide');

                showModelTitle(window.i18n.t("modeling.current-model") + model.modelName);

                _enableModuleExport();
            }
        }).catch(function() {
            Notify.show({
                title: window.i18n.t("modeling.loading-exception"),
                text: window.i18n.t("modeling.model-load-failed"),
                type: 'danger'
            });
        }).finally(function() {
            hideLoader();
        });
    }

    function bindNetworkEvent() {
        networkContainer.on("mousedown", function(e) {
            if (onlineMode || (e.button == 2)) {
                handleToolbar.mouseDown({
                    e: e,
                    drawing: $('#drawing canvas')
                });
            }
        });

        networkContainer.on("mousemove", function(e) {
            handleToolbar.mouseMove({
                e: e,
                drawing: $('#drawing canvas')
            });
        });

        networkContainer.on("mouseup", function(e) {
            handleToolbar.mouseUp({
                e: e,
                drawing: $('#drawing canvas')
            });
        });
    }

    //====================Switch BUtton==================

    $("#switchToDevelopPlatform").on("click", function() {
        window.open("http://95.10.205.100:8889");
    });

    $("#switchToIntelligentReport").on("click", function() {
        window.open("/bireport/index.html");
    });

    function handleContextMenu(action, node) {
        switch (action) {
            case 'end':
                if (node.taskType == Operations.DATA_SOURCE) {
                    return;
                }
                doTaskAction('start', node.nodeId);
                break;
            case 'view':
                if (node.taskType == Operations.DATA_SOURCE) {
                    gotoResultPage();
                    _setupResultTab(node);
                } else {
                    var taskInfo = modelManager.getTaskInfo(node.nodeId);
                    if (taskInfo) {
                        setTimeout(function () {
                            window.open('/smartquery/task-result.html?taskId=' + taskInfo.taskId,'_blank');
                        }, 80);

                    }
                }
                break;
            case 'copyall':
                try {
                    document.execCommand('copy');
                } catch (e) {
                    //
                }
                break;
            case 'deleteall':
                deleteSelectedNodes();
                break;
            case 'paste':
                try {
                    if (window.localStorage && window.localStorage.getItem('model-clipboard')) {
                        var srcNodes = JSON.parse(window.localStorage.getItem('model-clipboard'));
                        console.log('paste event >>>', srcNodes.nodes);
                        if (srcNodes.nodes) {
                            handleToolbar.copyNodes(srcNodes.nodes, srcNodes.edges, function(selectNodesIds, selectedEdgesIds) {
                                network.unselectAll();
                                if (selectNodesIds.length > 0) {
                                    network.selectNodes(selectNodesIds, false);
                                    if (selectNodesIds.length == 1) {
                                        onNodeChosen(selectNodesIds[0]);
                                    }
                                    selectedNodes = selectNodesIds;
                                }
                                if (selectedEdgesIds.length > 0) {
                                    _.each(selectedEdgesIds, function(eid) {
                                        var edge = network.selectionHandler.body.edges[eid];
                                        network.selectionHandler.selectObject(edge);
                                    })
                                    selectedEdges = selectedEdgesIds;
                                }
                            });
                        }
                    }
                } catch (e) {
                    //
                }
                break;
        }
    }
    var solidId = NovaUtils.getURLParameter('solidid');

    function bindToolbarClick() {
        //=====================Toolbar=======================
        startBtn.click(function() {
            doTaskAction('start');
        });

        pauseBtn.click(function() {
            doTaskAction('pause');
        });

        resumeBtn.click(function() {
            doTaskAction('resume');
        });

        restartBtn.click(function() {
            doTaskAction('restart');
        })

        $('#btn-load-model').click(function(params) {
            ModelChooser.open(function (modelId) {
                if (modelId) {
                    window.location = '/modelanalysis/modeling.html?modelid=' + modelId;
                }
            });
        });

        $('#btn-save-model').click(function(params) {
            CondBuilder.saveCondition(true, function() {
                if (solidId) {
                    modelManager.updateSolid();
                } else {
                    modelManager.updateModel();
                }
            });
        });

        $('#btn-new-model').click(function(params) {
            CondBuilder.saveCondition(true, function() {
                modelManager.saveModel(function(modelInfo) {
                    $('#btn-save-model').removeClass('hide');
                    // 问题汇总-建模分析5-隐藏模型固化和BI报表按钮
                      // $('#btn-model-apply').removeClass('hide');
                      // $('#btn-bi-report').removeClass('hide');
                    showModelTitle(window.i18n.t("modeling.current-model") + modelInfo.modelName);

                    _enableModuleExport();
                });
            });
        });

        $('#btn-model-apply').click(function(params) {
            window.open('/modelapply/model-apply.html?modelid=' + modelManager.getModelId());
        });

        $('#btn-bi-report').click(function(params) {
            var urlModelId = NovaUtils.getURLParameter('modelid');
            var modelid = modelManager.getModelId();
            var taskid = modelManager.getTaskId();
            console.log(modelid,taskid);
            if(modelid && taskid)
                window.open('/bireport/report.html?modelid=' + modelid + '&taskid=' + taskid);
            else if(modelid && !taskid)
                window.open('/bireport/report.html?modelid=' + modelid);
            else if(taskid && !modelid)
                window.open('/bireport/report.html?taskid=' + taskid);
        });

        $('#btn-import-model').click(function() {
            modelManager.importModel(function(model) {
                if (_.isEmpty(model.modelName)) {
                    return;
                }
                showModelTitle(window.i18n.t("modeling.current-model") + model.modelName);
            });
        });

        $('#btn-export-model').click(function() {
            modelManager.exportModel();
        });

        $('#btn-overview').click(function() {
            var enable = !$(this).hasClass('active');
            enable && toggleRightPanel(!enable);
            enableOverview(enable);
        });

        //保存图片
        $('#btn-storeimg').click(function() {
            Dialog.build({
                title: window.i18n.t("storeimg"),
                content: tplStoreImage(),
                rightBtn: window.i18n.t("finish-btn"),
                leftBtn: window.i18n.t("cancel-btn"),
                rightBtnCallback: function() {
                    var name = $("#image-name").val() + ".png";
                    var canvas = $("#drawing canvas").get(0);
                    canvas.toBlob(function(blob) {
                        FileSaver.saveAs(blob, name);
                    });
                    $.magnificPopup.close();
                }
            }).show();
        });

        $('#btn-ligature').click(function() {
            var enabled = !$(this).hasClass('active');
            onlineMode = enabled;
            handleToolbar.ligatureBtnClick({
                enabled: enabled,
                btn: $('#btn-ligature'),
                removeBtn: $('#btn-removeEdge'),
                callback: function() {
                    clickDeleteMode = false;
                }
            });
        });

        $('#btn-removeEdge').click(function() {
            var options;
            options = {
                interaction: {
                    dragView: true,
                    dragNodes: true
                }
            };
            network.setOptions(options);

            var enabled = !$(this).hasClass('active');
            var btn = $('#btn-removeEdge');
            clickDeleteMode = enabled;
            if (enabled) {
                if ($('#btn-ligature').hasClass('active')) {
                    onlineMode = false;
                    $('#btn-ligature').removeClass('btn-primary active').addClass('btn-default');
                }
                btn.removeClass('btn-default').addClass('btn-primary active');
                networkContainer[0].style.cursor = "url('/img/analysis/DeleteCursor.png'),auto";
            } else {
                btn.removeClass('btn-primary active').addClass('btn-default');
                networkContainer[0].style.cursor = "pointer";
            }
        });

        $('#btn-longitudinal-hierarchical').click(function() {
            autoPlacement();
        });

        $('#btn-toggle-direction').click(function() {
            $('#btn-toggle-direction').empty();
            if (currentDirection == 'UD') {
                currentDirection = 'LR';
                $('#btn-toggle-direction').attr('data-original-title', window.i18n.t("modeling.horizontal-direction")).append($('<i class="fa fa-arrows-h fa-fw"></i>'));
                Notify.show({
                    title: window.i18n.t("modeling.now-in-horizontal-direction"),
                    type: 'success'
                });
            } else {
                currentDirection = 'UD';
                $('#btn-toggle-direction').attr('data-original-title', window.i18n.t("modeling.vertical-direction")).append($('<i class="fa fa-arrows-v fa-fw"></i>'));
                Notify.show({
                    title: window.i18n.t("modeling.now-in-vertical-direction"),
                    type: 'success'
                });
            }
            autoPlacement();
        });

        $('#left-panel-toggle').click(function() {
            $('.tray.tray-left').toggleClass('hide');
            $(this).toggleClass('text-primary');
        });

        (function() {
            var lastX;
            $('#right-panel-splitter').draggable({
                cursor: "w-resize",
                axis: 'x',
                distance: 10,
                containment: '#network-container',
                scorll: false,
                start: function (event, ui) {
                    if ($('#right-panel-container').hasClass('hide')) {
                        event.preventDefault();
                        return;
                    }
                    $('#right-panel-splitter').addClass('btn-info light');
                    lastX = ui.position.left;
                },
                drag: function (event, ui) {
                    var deltaX = ui.position.left - lastX;
                    lastX = ui.position.left;
                    var newWidth = $('#right-panel-container').width() - deltaX;
                    if (newWidth < 400 && deltaX >= 0 || newWidth > window.innerWidth / 2 && deltaX <= 0) {
                        $('#right-panel-splitter').removeClass('btn-info light');
                        event.preventDefault();
                        return;
                    }
                    $('#right-panel-container').width(newWidth);
                },
                stop: function (event, ui) {
                    var deltaX = ui.position.left - lastX;
                    lastX = ui.position.left;
                    var newWidth = $('#right-panel-container').width() - deltaX;
                    $('#right-panel-container').width(newWidth);

                    $('#right-panel-splitter').removeClass('btn-info light').css({
                        left: 'auto',
                        right: 0
                    });
                }
            });
        } ());

        $('#right-panel-toggle').click(function() {
            toggleRightPanel();
        });

        $('#btn-save-snapshot').click(function() {
            modelManager.saveSnapshot();
        });
    }

    // create network
    function createNetwork() {
        var MAX_ZOOM = 1.5;
        var MIN_ZOOM = 0.6;
        if (network) {
            network.destroy();
        }
        network = new vis.Network($('#drawing').get(0), {
            nodes: nodes,
            edges: edges
        }, {
            autoResize: true,
            height: '100%',
            width: '100%',
            layout: {
                randomSeed: 1,
                hierarchical: {
                    enabled: false,
                    direction: 'UD',
                    sortMethod: 'directed'
                }
            },
            interaction: {
                multiselect: true,
                hover: true,
                hoverConnectedEdges: false,
                dragNodes: true,
                dragView: true,
                keyboard: false
            },
            physics: {
                enabled: false, //$('#btn-autolayout').hasClass('active'),
                stabilization: {
                    onlyDynamicEdges: true,
                    fit: false
                },
                maxVelocity: 15
            }
        });

        // 创建鹰眼图
        Overview.create(network);
        resizeCanvas();

        function onClick(params) {
            if (!clickDeleteMode && params.nodes[0]) {
                var curNodeId = CondBuilder.curNodeId();
                //taskInfoTable 对应节点选中
                TaskInfoTable.render($('#task-table-container')[0], taskInfoData , taskInfoClicked, taskInfoDoubleClicked, 'taskId', params.nodes[0]);
                
                if (curNodeId && params.nodes[0] != curNodeId) {                    
                    var conditionResult = CondBuilder.createCondition();
                    if (conditionResult && conditionResult.message) {
                        // 取消选中
                        network.unselectAll();
                        network.selectNodes([curNodeId], false);
                        var nodeName = nodes.get(curNodeId).name;

                        bootBox.confirm(window.i18n.t("modeling.node-setting-wrong-whether-toggle", {nodeName: nodeName}) +
                            '<br>' +
                            '<span style="color:red">(' + conditionResult.message + ')</span>', function (result) {

                            if (result) {
                                clickNodesAndEdges(params);
                            }
                        });
                        return;
                    }
                }
            }
            clickNodesAndEdges(params);
        }

        function clickNodesAndEdges(params) {
            network.canvas.frame.focus();
            if (!clickDeleteMode) {
                if (params.nodes[0]) {
                    selectedNodes = params.nodes;
                } else {
                    selectedNodes = [];
                }
                if (params.edges[0]) {
                    selectedEdges = params.edges;
                } else {
                    selectedEdges = [];
                }

                network.unselectAll();

                if (selectedNodes.length > 0) {
                    network.selectNodes(selectedNodes, false);

                    if (selectedNodes.length == 1) {
                        onNodeChosen(selectedNodes[0]);
                    }
                }
                if (selectedEdges.length > 0) {
                    _.each(selectedEdges, function(eid) {
                        var edge = network.selectionHandler.body.edges[eid];
                        network.selectionHandler.selectObject(edge);
                    })
                }
            } else {
                if (params.nodes.length > 0) {
                    removeNodes(params.nodes);
                } else if (params.edges.length > 0) {
                    removeEdges(params.edges);
                }
            }
        }

        function onDragEnd(params) {
            var todo = eventAction['dragEnd'];
            if (todo) {
                _.each(todo, function(action) {
                    action();
                })
                eventAction['dragEnd'] = [];
            }
        }

        function onStabilized() {
            var todo = eventAction['stabilized'];
            if (todo) {
                _.each(todo, function(action) {
                    action();
                })
                eventAction['stabilized'] = [];
            }

            network.storePositions();
            var options = {
                physics: {
                    enabled: false
                },
                layout: {
                    hierarchical: {
                        enabled: false,
                        direction: 'UD',
                        sortMethod: 'directed'
                    }
                }
                // edges: {
                //     smooth: {
                //         enabled: false,
                //         type: 'continuous'
                //     }
                // }
            };
            network.setOptions(options);
        }

        function onZoom(params) {
            if (params.scale > MAX_ZOOM) {
                network.body.view.scale = MAX_ZOOM;
            }
            if (params.scale < MIN_ZOOM) {
                network.body.view.scale = MIN_ZOOM;
            }
        }

        // document.body.oncontextmenu = function () {
        //     return false;
        // };

        function onContext(params) {
            params.event.preventDefault();
        }

        network.on('click', onClick);
        network.on('dragEnd', onDragEnd);
        network.on('stabilized', onStabilized);
        network.on('oncontext', onContext);
        // network.on('zoom', onZoom);
        // end bind network events
    }

    //===============Create Network and Bind Events===============
    function resizeCanvas() {
        var leftTray = $('.tray.tray-left');

        var leftHeight = window.innerHeight - leftTray.offset().top;

        // vis需要指定了其实际使用的div的height为100%，所以需要在父级指定一个具体height值
        $('#drawing').height(leftHeight);
        $('.tray.tray-center').height(leftHeight);

        // 因为有全屏的需求，而全屏的样式有display: !import，所有使用flex布局全局后高度hui
        // $('#right-content-panel').height(leftHeight - $('#right-content-panel').position().top);

        // fanceytree需要设置高度以启用滚动条
        $('.dir-tree').height(leftHeight - $('#dir-tree-panel').position().top);
        leftTray.height(leftHeight);

        Overview.resize();
    }

    function doTaskAction(action, toNode) {
        switch (action) {
            case 'start':
                CondBuilder.saveCondition(false, function () {
                    modelManager.startTask(function(result, taskConfig) {
                        showModelTitle(window.i18n.t("modeling.current-task") + taskConfig.title);
                         // $('#btn-bi-report').removeClass('hide');
                    }, toNode);
                });
                break;
            case 'pause':
                modelManager.stopTask();
                break;
            case 'resume':
                modelManager.resumeTask();
                break;
            case 'restart':
                CondBuilder.saveCondition(false, function () {
                    modelManager.restartTask(function(result, taskConfig) {
                        showModelTitle(window.i18n.t("modeling.current-task") + taskConfig.title);
                    }, toNode);
                });
                break;
        }
    }

    function showModelTitle(title) {
        $('#model-title-container').removeClass('hide');
        $('#model-title').text(title);
    }

    function showModelHint(text) {
        $('#model-hint-container').removeClass('hide');
        $('#model-hint').text(text);
    }

    function onSolidTaskFinish() {
        bootBox.confirm('任务运行完成，是否需要查看报表结果？', function (result) {
            if (result) {

            }
        });
    }

    function enableOverview(enabled) {
        var btn = $('#btn-overview');

        btn.toggleClass('btn-primary active btn-default');

        if (enabled) {
            Overview.show();
        } else {
            Overview.hide();
        }
    }

    function _enableModuleExport() {
        $('#btn-export-model').prop('disabled', false);
    }

    function getCurrentTree() {
        var treeContainer = $('#tab-data-tree');
        treeContainer = treeContainer.hasClass('active') ? treeContainer : $('#tab-components-tree');
        return treeContainer ? treeContainer.fancytree('getTree') : null;
    }

    function setDsTree(dsDirs, favorDir) {
        inflateTree($('#tab-data-tree'), TYPE_DATASOURCE, dsDirs, favorDir, function(event, data) {
            if (data.node.folder) {
                return "fa fa-folder fa-fw";
            } else {
                return Operations.iconConfigOf(data.node.data.nodeType).iconCls;
            }
        });
    }

    function setOperatorTree(optrDirs, favorDir) {
        inflateTree($('#tab-components-tree'), TYPE_OPERATOR, optrDirs, favorDir, function(event, data) {
            if (data.node.folder) {
                return "fa fa-folder fa-fw";
            } else {
                return Operations.iconConfigOf(data.node.data.nodeType).iconCls;
            }
        });
    }

    function inflateTree($container, dataType, treeData, favorDir, iconMapper) {
        var nodeTpl = _.template('<span class="fancytree-title unselectable" title=<%= tooltip %>><%- title %></span><span id="favor-toggle" class="fancytree-action-icon fs16 ml10 text-muted fa fa-star"></span>');
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
                    title: data.node.title,
                    tooltip: data.node.tooltip
                });
            },
            // 第一次创建时
            createNode: function(event, data) {
                makeNodeDraggable(data);

                bindFavorToggle(dataType, data, favorDir);
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
                    url: "/modelanalysis/collision/listmodelingtask",
                    data: {
                        taskId: data.node.data.typeId
                    }
                };
            }
        });
    }

    function makeNodeDraggable(nodeData) {
        var $span = $(nodeData.node.span);
        if ($span.hasClass('nv-data')) {
            draggablize($span, function() {
                var dragEl = $($span.clone());
                dragEl.find('.favor-toggle').remove();
                dragEl.children('.fancytree-expander').remove();
                var width = $span.find('.fancytree-title').outerWidth(true) + $span.find('.fancytree-custom-icon').outerWidth(true) + 5;
                dragEl.css('width', width);
                dragEl.data('node-meta', _.omit(nodeData.node.data, ['dirId', 'dirType', 'favored', 'parentId', 'dirName']));
                return dragEl;
            });
        }
    }

    function bindFavorToggle(dataType, data, favoredDir) {
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
                deleteFavor(dataType, node.data);
                favorNode.removeChild(tree.getNodeByKey(keyOfTreeNode(dataType, node.data) + '_favored'));
                if (node.data.parentId == 1) {
                    var origNode = tree.getNodeByKey(keyOfTreeNode(dataType, node.data));
                    origNode.data.favored = !itemFavored;
                    if (origNode.isVisible()) {
                        origNode.render();
                    }
                    // 阻止事件冒泡,引起fancytree的warnning
                    return false;
                }
            } else {
                addFavor(dataType, node.data);

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

    function keyOfTreeNode(type, nodeData) {
        return type == TYPE_DATASOURCE ? nodeData.centerCode + '_' + nodeData.zoneId + '_' + nodeData.typeId : nodeData.nodeType + '';
    }

    function addFavor(type, nodeData) {
        var key = keyOfTreeNode(type, nodeData);
        $.post('/modelanalysis/modeling/addfavoritem', {
            type: type,
            id: key,
            caption: type == TYPE_DATASOURCE ? nodeData.caption : nodeData.typeName
        }, function(rsp) {
            if (rsp.code != 0) {}
        }, 'json');
    }

    function deleteFavor(type, nodeData) {
        var key = keyOfTreeNode(type, nodeData);
        $.post('/modelanalysis/modeling/delfavoritem', {
            type: type,
            id: key
        }, function(rsp) {
            if (rsp.code != 0) {}
        }, 'json');
    }

    function onNodeChosen(selectedNodeId) {
        var selectedNode = nodes.get(selectedNodeId);

        toggleRightPanel(true);
        CondBuilder.setNode(selectedNode.origNode);

        if (_isResultPanelActive()) {
            _setupResultTab(selectedNode);
        }
    }

    function _isResultPanelActive() {
        return $('#right-content-panel>#right-tab-content>.tab-pane.active').attr('id') == 'result-panel';
    }

    function draggablize(target, helper) {
        target.draggable({
            cursor: 'pointer',
            containment: "#content",
            revert: "invalid",
            zIndex: 100,
            appendTo: "#drawing",
            helper: helper ? helper : 'clone',
            distance: 10,
            start: function(event, ui) {
                ui.helper.toggleClass('drag-active');
            },
            stop: function(event, ui) {
                ui.helper.toggleClass('drag-active');
            }
        });
    }

    function moveTopNode() {
        var index = 0;
        nodes.forEach(function(node) {
            network.moveNode(node.id, node.x + index, node.y + index);
            index++;
        });
    }

    function autoPlacement() {
        moveTopNode();
        var options = {
            layout: {
                hierarchical: {
                    enabled: true,
                    levelSeparation: 150,
                    direction: 'UD',
                    sortMethod: 'directed'
                }
            },
            edges: {
                smooth: {
                    enabled: false,
                    type: 'continuous'
                }
            }
        };
        if (currentDirection == 'UD') {
            options.layout.hierarchical.levelSeparation = 150;
        } else {
            options.layout.hierarchical.levelSeparation = 200;
        }
        options.layout.hierarchical.direction = currentDirection;
        network.setOptions(options);
        network.fit();
        network.moveTo({
            scale: 1
        });
    }

    function removeNodes(nodeIds) {
        _.each(nodeIds, function(id) {
            modelManager.removeNode(id);
        });
    }

    function removeEdges(edgeIds) {
        _.each(edgeIds, function(id) {
            modelManager.removeEdge(id);
        });
    }

    function gotoResultPage() {
        toggleRightPanel(true);
        $('#show-result').click();
    }

    function toggleRightPanel(open) {
        if (_.isUndefined(open)) {
            $('#right-panel-splitter').toggleClass('hide');
            $('#right-panel-container').toggleClass('hide');
            $('#right-panel-toggle').toggleClass('text-primary');
        } else if (open) {
            $('#right-panel-splitter').removeClass('hide');
            $('#right-panel-toggle').addClass('text-primary');
            $('#right-panel-container').removeClass('hide');
        } else {
            $('#right-panel-splitter').addClass('hide');
            $('#right-panel-toggle').removeClass('text-primary');
            $('#right-panel-container').addClass('hide');
        }
    }

    function _setupResultTab(selectedNode) {
        selectedNode = selectedNode.origNode || selectedNode;
        if (selectedNode.taskType == Operations.DATA_SOURCE) {
            TaskResult.render(resultContainer, TaskResult.mode.DATA_SOURCE, selectedNode.detail);
        } else {
            var taskInfo = modelManager.getTaskInfo(selectedNode.nodeId);
            if (taskInfo) {
                taskInfo.isSave = selectedNode.isSave;
                TaskResult.render(resultContainer, TaskResult.mode.TASK_RESULT, taskInfo);
            } else {
                TaskResult.render(resultContainer);
            }
        }
    }

    function deleteSelectedNodes() {
        //删除
        if (selectedEdges.length == 0 && selectedNodes.length == 0) {
            return;
        }
        bootBox.confirm(window.i18n.t("modeling.whether-delete-seleted-element"), function(rlt) {
            if (rlt) {
                if (selectedNodes.length > 0) {
                    removeNodes(selectedNodes);
                }
                if (selectedEdges.length > 0) {
                    removeEdges(selectedEdges);
                }
                selectedNodes = [];
                selectedEdges = [];
            }
        })
    }

    //===================hotkeys====================
    $(document).bind('keydown', 'del', function() {
        deleteSelectedNodes();
    });
    $("#drawing").bind('keydown', 'left', function(e) {
            if (selectedNodes.length == 0) {
                return;
            }
            e.preventDefault();
            var nodesPosition = network.getPositions(selectedNodes);
            for (var key in nodesPosition) {
                network.moveNode(key, nodesPosition[key].x - 5, nodesPosition[key].y);
            }
        })
        .bind('keydown', 'up', function(e) {
            if (selectedNodes.length == 0) {
                return;
            }
            e.preventDefault();
            var nodesPosition = network.getPositions(selectedNodes);
            for (var key in nodesPosition) {
                network.moveNode(key, nodesPosition[key].x, nodesPosition[key].y - 5);
            }
        })
        .bind('keydown', 'right', function(e) {
            if (selectedNodes.length == 0) {
                return;
            }
            e.preventDefault();
            var nodesPosition = network.getPositions(selectedNodes);
            for (var key in nodesPosition) {
                network.moveNode(key, nodesPosition[key].x + 5, nodesPosition[key].y);
            }
        })
        .bind('keydown', 'down', function(e) {
            if (selectedNodes.length == 0) {
                return;
            }
            e.preventDefault();
            var nodesPosition = network.getPositions(selectedNodes);
            for (var key in nodesPosition) {
                network.moveNode(key, nodesPosition[key].x, nodesPosition[key].y + 5);
            }
        });
    document.addEventListener('copy', function(e) {
        //复制
        console.log('copy event');
        if (document.getSelection().type != 'Range' && selectedNodes.length > 0) {
            network.storePositions();
            var copyedEdge = [];
            edges.forEach(function(item) {
                if (_.contains(selectedNodes, item.from) && _.contains(selectedNodes, item.to)) {
                    copyedEdge.push({
                        from: item.from,
                        to: item.to
                    });
                }
            })
            e.clipboardData.setData('text/plain', JSON.stringify({
                nodes: nodes.get(selectedNodes),
                edges: copyedEdge
            }));
            var data = JSON.stringify({
                nodes: nodes.get(selectedNodes),
                edges: copyedEdge
            });
            e.clipboardData.setData('text/plain', data);
            e.preventDefault();
            if (window.localStorage) {
                //add data to localStorage too
                window.localStorage['model-clipboard'] = data;
            }
        }
    });
    document.addEventListener('paste', function(e) {
        //黏贴
        try {
            var srcNodes = JSON.parse(e.clipboardData.getData('text/plain'));
            console.log('paste event >>>', srcNodes.nodes);
            if (srcNodes.nodes) {
                handleToolbar.copyNodes(srcNodes.nodes, srcNodes.edges, function(selectNodesIds, selectedEdgesIds) {
                    network.unselectAll();
                    if (selectNodesIds.length > 0) {
                        network.selectNodes(selectNodesIds, false);
                        if (selectNodesIds.length == 1) {
                            onNodeChosen(selectNodesIds[0]);
                        }
                        selectedNodes = selectNodesIds;
                    }
                    if (selectedEdgesIds.length > 0) {
                        _.each(selectedEdgesIds, function(eid) {
                            var edge = network.selectionHandler.body.edges[eid];
                            network.selectionHandler.selectObject(edge);
                        })
                        selectedEdges = selectedEdgesIds;
                    }
                });
                e.preventDefault();
            }
        } catch (e) {
            // console.error(e);
        }
    });
    window.onbeforeunload = function() {
        if(!(modelManager.getModelId() || modelManager.getTaskId())) {
            return window.i18n.t("modeling.some-data-may-not-be-saved");
        }
    }

    // 监听tab切换
    $("a[data-toggle='tab']").on('shown.bs.tab', function(e) {
        var id = $(e.target).attr("id");
        if (id == "show-result") {
            $('#btn-node-save').toggleClass('hide');
            $('#result-fullscreen').toggleClass('hide');

            if (!selectedNodes || selectedNodes.length == 0) {
                return;
            }

            _setupResultTab(nodes.get(selectedNodes[0]));
        } else if (id == "show-detail") {
            $('#btn-node-save').toggleClass('hide');
            $('#result-fullscreen').toggleClass('hide');
        } else if (id == "show-data-tree") {
            $('#btn-refresh').toggleClass('hide');
        } else if (id == "show-components-tree") {
            $('#btn-refresh').toggleClass('hide');
        }
    });

    $('#result-fullscreen').click(function() {
        resultFullScreen = !resultFullScreen;
        if (resultFullScreen) {
            $('#show-detail').hide();
        } else {
            $('#show-detail').show();
        }
        goFullscreen($('#right-panel-container'));
    });
    var resultFullScreen = false;
});
