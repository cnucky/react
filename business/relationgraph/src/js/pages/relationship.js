initLocales();
require([
    '../module/relationgraph/relationship-circle-menu',
    '../module/relationgraph/relationship-network-config',
    '../module/relationgraph/relationship-element-detail',
    '../module/relationgraph/relationship-node-combine',
    'nova-dialog',
    'nova-notify',
    'nova-bootbox-dialog',
    '../module/filter/filter-content',
    'utility/loaders',
    'nova-utils',
    '../module/relationgraph/relationship-add-node-dialog',
    '../module/relationgraph/relationship-overview',
    '../widget/extend-filter',
    '../widget/history-stack',
    '../module/relationgraph/relationship-filter',
    '../module/relationgraph/relationship-snapshot',
    '../module/relationgraph/relationship-utils',
    'utility/FileSaver/FileSaver',
    'utility/cacher',
    '../tpl/relationship/tpl-store-image',
    'utility/jquery/jquery.resize',
    'utility/FileSaver/Blob',
    'utility/FileSaver/canvas-toBlob'
], function(CircleMenu, NetworkConfig, ElementDetail, CombineNode, Dialog, Notify, bootBox, FilterContent,
            loaders, Util, AddNodeDialog, Overview, FilterTimeFrequency, HistoryStack, Filter, Snapshot, RelationshipUtil, FileSaver, Cacher, tplStoreImage) {
    //===================Variables=====================
    var DEBUG = false;

    var COUNTABLE_LINK_TYPES = RelationshipUtil.COUNTABLE_LINK_TYPES;

    var AUTO_COMBINE_LIMIT = 16;

    tplStoreImage = _.template(tplStoreImage);
    // Class Definition
    function HistoryAction(data) {
        var restore = function() {
            restoreSnapShot(data);
        }
        HistoryStack.History.call(this, data, restore);
        this.timestamp = Date.now();
    }
    HistoryStack.init({
        callback: function(canRedo, canUndo) {
            if (canRedo) {
                $('#btn-redo').removeClass('disabled');
            } else {
                $('#btn-redo').addClass('disabled');
            }
            if (canUndo) {
                $('#btn-undo').removeClass('disabled');
            } else {
                $('#btn-undo').addClass('disabled');
            }
        }
    });

    //Network
    var network, isStabilizing = false;
    var nodes = new vis.DataSet();
    var edges = new vis.DataSet();

    //toolbar status
    var toolbar = {
        autolayout: true
    };

    //actions when event occurs
    var eventAction = {},
        historiesToUpdate = [];

    // multiple select vars
    var multiselectMode = false;
    var selectedNodes = []; // multi
    var selectedEdges = [];
    var expandCombineNodes = [0];

    // 自动保存
    var lastAutoSaveTime = 0;
    var autoSaveWaiting = false;
    var autoSaveInterval = 30000;
    var nodeTypeInfo;
    (function loadNodeTypeInfo(times) {
        $.getJSON('/relationgraph/relationgraph/getallnodetypeinfo', function(rsp) {
            if (rsp.code == 0) {
                nodeTypeInfo = rsp.data;
                hideLoader();
                _.each(nodeTypeInfo, function(item) {
                    item.icon = NetworkConfig.icons["" + item.type];
                });

                if (DEBUG) {
                    window.nodeTypeInfo = nodeTypeInfo;
                }
            } else if (times < 2) {
                loadNodeTypeInfo(++times);
            } else {
                hideLoader();

                Notify.show({
                    title: '服务器异常',
                    text: '关系网络功能可能无法正常使用',
                    type: 'danger'
                });
            }
        })
    })(0);

    //===============Create Network and Bind Events===============
    function resizeCanvas() {
        var height = window.innerHeight - $('#network-container').offset().top;

        $("#drawing").height(height);
        $('.tray.tray-center').height(height + $('#relationship-toolbar').height());

        var toolboxBody = $('#toolbox-body');
        height = window.innerHeight - toolboxBody.offset().top - 40;
        toolboxBody.css('height', height);
        toolboxBody.css('maxHeight', height);

        Overview.resize();
    }
    // bind resize events
    (function() {
        $(window).on('nv-resize resize', _.debounce(resizeCanvas, 100));

        $('#drawing').resize(resizeCanvas);

        $('#btn-showall').click(resizeCanvas);

    })(); // end resize events

    // create network
    function createNetwork() {
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
                randomSeed: 1
            },
            interaction: {
                multiselect: true,
                hover: true,
                hoverConnectedEdges: false
            },
            physics: {
                enabled: $('#btn-autolayout').hasClass('active'),
                stabilization: {
                    onlyDynamicEdges: true,
                    fit: false
                },
                maxVelocity: 15
            }
        });

        // 快照堆栈Head
        HistoryStack.push(new HistoryAction(getSnapShot()));

        // 创建鹰眼图
        Overview.create(network);
        resizeCanvas();
        // bind network events
        function scale2node(nid) {
            network.focus(nid, {
                scale: 1,
                locked: false,
                animation: {
                    duration: 200,
                    easingFunction: 'linear'
                }
            });
        }

        function onContext(params) {
            var nid = network.getNodeAt(params.pointer.DOM);
            params.event.preventDefault();
            if (nid) {
                network.selectNodes([nid]);
                menuDAC(nid, params);
            }
        }

        function menuDAC(nid, params) {
            if (nid) {
                var node = nodes.get(nid);
                var curscale = network.getScale();
                if ((curscale < 0.8) || (curscale > 1.2)) {
                    network.interactionHandler.zoom(1, params.pointer.DOM);
                }
                var canvasxy = network.getPositions([nid])[nid];
                var domxy = network.canvasToDOM(canvasxy);
                var height = $('#drawing canvas').height();
                var width = $('#drawing canvas').width();
                var radius = 150;
                var addrl = 0,
                    addud = 0;
                var needMove = false;
                if (domxy.x < radius) {
                    addrl = addrl + (radius - domxy.x);
                    needMove = true;
                }
                if ((domxy.x + radius) > width) {
                    addrl = addrl - (domxy.x + radius - width);
                    needMove = true;
                }
                if (domxy.y < radius) {
                    addud = addud + (radius - domxy.y);
                    needMove = true;
                }
                if ((domxy.y + radius) > height) {
                    addud = addud - (domxy.y + radius - height);
                    needMove = true;
                }
                if (needMove) {
                    domxy.x = domxy.x + addrl;
                    domxy.y = domxy.y + addud;
                }
                var movedata = {
                    offset: {
                        x: addrl,
                        y: addud
                    },
                    animation: {
                        duration: 200,
                        easingFunction: 'linear'
                    }
                };
                network.moveTo(movedata);
                var menu = new CircleMenu(domxy, $('#drawing'), buildNodeMenuConfig(node));
                menu.nid = nid;
                menu.show();
            }
        }

        function onClick(params) {
            if (params.nodes[0]) {
                ElementDetail.setNode(params.nodes[0]);
            } else if (params.edges[0]) {
                ElementDetail.setEdge(params.edges[0]);
            }
            if (!multiselectMode) {
                selectedNodes = params.nodes;
                selectedEdges = params.edges;
                return;
            }

            if (params.nodes.length > 0) {
                selectedNodes = _XORArray(selectedNodes, params.nodes);
            } else {
                selectedEdges = _XORArray(selectedEdges, params.edges);
            }

            network.unselectAll();

            if (selectedNodes.length > 0) {
                network.selectNodes(selectedNodes, false);
            }
            if (selectedEdges.length > 0) {
                _.each(selectedEdges, function(eid) {
                    var edge = network.selectionHandler.body.edges[eid];
                    network.selectionHandler.selectObject(edge);
                })
            }
        }

        function onSelectEdge(params) {
            if (multiselectMode) {
                return;
            }

        }

        function onDragEnd(params) {
            if (!_.isEmpty(params.nodes) || !_.isEmpty(params.edges)) {
                //drag node or edge
                saveHistory();
            }

            var todo = eventAction['dragEnd'];
            if (todo) {
                _.each(todo, function(action) {
                    action();
                })
                eventAction['dragEnd'] = [];
            }
        }

        function onStabilized() {
            isStabilizing = false;
            doStabilize();
        }

        function onDoubleClick(params) {
            if (!multiselectMode) {
                if (!_.isEmpty(params.nodes)) {
                    var nid = params.nodes[0];
                    menuDAC(nid, params);
                }
            }
        }

        network.on('oncontext', onContext);
        network.on('doubleClick', onDoubleClick);
        network.on('click', onClick);
        network.on('dragEnd', onDragEnd);
        network.on('stabilized', onStabilized);
        network.on('startStabilizing', function() {
            isStabilizing = true;
        });

        nodes.on('remove', function(event, properties) {
            _.each(properties.items, function(item) {
                selectedNodes = _.filter(selectedNodes, function(nId) {
                    return nId !== item;
                });

                ElementDetail.onElementChanged('node', item)
            });
        });

        edges.on('remove', function(event, properties) {
            _.each(properties.items, function(item) {
                ElementDetail.onElementChanged('edge', item)
            });
        });
        // end bind network events
    }
    createNetwork();


    //=====================Toolbar=======================
    // 新增节点
    $('#btn-add').click(function() {
        AddNodeDialog.buildAddNodeDialog(nodeTypeInfo, NetworkConfig, function(data) {
            var node = nodes.get(data.nodeId)
            if (node) {
                Notify.show({
                    title: '节点"' + data.title + '"已存在',
                    type: 'warning'
                });
            } else {
                nodes.add(generateNode(data));
                saveHistory();
            }
        });
    });



    $('#btn-showall').click(function() {
        network.fit({
            animation: {
                duration: 200,
                easingFunction: 'easeInQuad'
            }
        });
    });

    $('#btn-zoomin').click(function() {
        network.moveTo({
            scale: network.getScale() * 1.25
        })
    });

    $('#btn-zoomout').click(function() {
        network.moveTo({
            scale: network.getScale() / 1.25
        })
    });

    $('#btn-hidelabel').click(function() {
        var btn = $('#btn-hidelabel');
        if (toolbar.hideLabel) {
            btn.removeClass('btn-primary active').addClass('btn-default');
        } else {
            btn.removeClass('btn-default').addClass('btn-primary active');
        }
        toolbar.hideLabel = !toolbar.hideLabel;
        _showLabelOrNot();
    });

    $('#btn-overview').click(function() {
        enableOverview(!$(this).hasClass('active'));
    })

    $('#btn-multiselect').click(function() {
        enableMultiselectMode(!$(this).hasClass('active'));
    });

    $('#btn-autolayout').click(function() {
        enableAutoLayout(!toolbar.autolayout);
    });

    $('#btn-hierarchical').click(function() {
        var on = !toolbar.hierarchical;
        enableHierarchicalLayout(on);

        if (!on && !toolbar.autolayout) {
            enableAutoLayout(false);
        }
        saveHistory();
    });

    $('#btn-delete').click(function() {
        if (selectedNodes && selectedNodes.length > 0) {
            bootBox.confirm('是否删除选中的' + selectedNodes.length + '个节点？', function(rlt) {
                if (rlt) {
                    nodes.remove(selectedNodes);

                    saveHistory();
                }
            });
        }
    });

    //合并节点
    $('#btn-combinenode').click(function() {
        var idarray = selectedNodes; //network.getSelectedNodes();
        if (idarray.length > 1) {
            var opts = {
                idarray: idarray,
                nodeTypeInfo: nodeTypeInfo,
                callback: function(nodeid) {
                    Cacher.removeCache(nodeid);
                    ElementDetail.resetViews();
                    saveHistory();
                    selectedNodes = [];
                    selectedEdges = [];
                }
            };
            CombineNode.combine(opts);
        } else {
            CombineNode.showError("请至少选择两个节点进行合并");
        }
    });

    //取消合并
    $('#btn-cancelcombine').click(function() {
        var idarray = network.getSelectedNodes(); //selectedNodes;
        cancelCombine(idarray);
        selectedNodes = [];
        selectedEdges = [];

        saveHistory();
    });

    function cancelCombine(idarray) {
        var opts = {
            idarray: idarray,
            nodeTypeInfo: nodeTypeInfo,
            callback: function() {
                ElementDetail.resetViews();
            }
        };
        CombineNode.cancel(opts);

        saveHistory();
    }

    //保存图片
    $('#btn-storeimg').click(function() {
        Dialog.build({
            title: "保存图片",
            content: tplStoreImage(),
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

    // Redo/Undo
    $('#btn-undo').click(function() {
        doStabilize();
        HistoryStack.undo();
    });

    $('#btn-redo').click(function() {
        HistoryStack.redo();
    });

    //导出Excel
    $('#btn-export').click(function() {
        if( nodes.length == 0 ) {
            return;
        }
        var data=nodes._data;
        var tableHeader='标签,类型';
        var tableContent='';

        _.each(data ,(item, key)=>{
            tableContent+=item.label+','+item.nodeType+'\r\n';
        });
        
        tableContent = tableHeader + '\r\n' +  tableContent;

        var fileName = '内容.xls'; //文件名
        FileSaver.saveAs(
            new Blob(
                ["\ufeff" + tableContent] //\ufeff防止utf8 bom防止中文乱码
                , {type: "application/vnd.ms-excel;charset=charset=utf-8"}
            ) , fileName);
    });

    function doStabilize() {
        var todo = eventAction['stabilized'];
        if (todo) {
            _.each(todo, function(action) {
                action();
            })
            eventAction['stabilized'] = {};
        }
    }

    function _XORArray(a, b) {
        return _.difference(_.union(a, b), _.intersection(a, b));
    }

    function toggleNetworkLabel(snapshot, enabled) {
        _.each(snapshot.nodes, function(node) {
            var tmp = node.title || node.label;
            node.title = enabled ? tmp : undefined;
            node.label = enabled ? undefined : tmp;
        });
        _.each(snapshot.edges, function(edge) {
            var tmp = edge.title || edge.label;
            edge.title = enabled ? tmp : undefined;
            edge.label = enabled ? undefined : tmp;
        });
    }

    function enableMultiselectMode(enabled) {
        var btn = $('#btn-multiselect');

        function saveDrawingSurface() {
            drawingSurfaceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        function restoreDrawingSurface() {
            ctx.putImageData(drawingSurfaceImageData, 0, 0);
        }

        // 计算开始点到结束点的 X Y 座标
        function getStartToEnd(start, theLength) {
            return theLength > 0 ? {
                start: start,
                end: start + theLength
            } : {
                start: start + theLength,
                end: start
            };
        }

        // 转换 canvas 座标到 DOM，选出框内的点
        function selectNodesFromHighlight() {
            var nodesIdInDrawing = [];
            // X Y 轴座标变化
            var xRange = getStartToEnd(rect.startX, rect.w);
            var yRange = getStartToEnd(rect.startY, rect.h);

            var allNodes = nodes.get();
            _.each(allNodes, function(item) {
                var curNode = item;
                var nodePosition = network.getPositions([curNode.id]);
                var nodeXY = network.canvasToDOM({
                    x: nodePosition[curNode.id].x,
                    y: nodePosition[curNode.id].y
                });
                if (nodeXY.x >= xRange.start && nodeXY.x <= xRange.end && nodeXY.y >= yRange.start && nodeXY.y <= yRange.end) {
                    nodesIdInDrawing.push(curNode.id);
                }
            });
            // 选出点 network.selectNodes(Array with nodeIds, [Boolean hightEdges])
            network.selectNodes(nodesIdInDrawing, false);

            selectedNodes = nodesIdInDrawing;
        }
        var container = $("#drawing");
        if (enabled) {
            btn.removeClass('btn-default').addClass('btn-primary active');

            // 右键画框多选
            var canvas = $("#drawing canvas").get(0);
            var ctx = canvas.getContext("2d")
            var rect = {},
                drag = false;
            var drawingSurfaceImageData;

            // 禁用浏览器中默认右键
            container.bind('contextmenu', function() {
                return false;
            });

            // 右键按下
            container.on("mousedown", function(e) {
                if (e.button == 2) {
                    selectedNodes = e.ctrlKey ? network.getSelectedNodes() : null;
                    saveDrawingSurface();
                    rect.startX = e.pageX - $("#drawing canvas").offset().left;
                    rect.startY = e.pageY - $("#drawing canvas").offset().top;
                    drag = true;
                    container[0].style.cursor = "crosshair";
                }
            });

            // 画框
            container.on("mousemove", function(e) {
                if (drag) {
                    restoreDrawingSurface();
                    rect.w = (e.pageX - $("#drawing canvas").offset().left) - rect.startX;
                    rect.h = (e.pageY - $("#drawing canvas").offset().top) - rect.startY;

                    ctx.setLineDash([5]);
                    ctx.strokeStyle = "rgb(0, 102, 0)";
                    ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
                    ctx.setLineDash([]);
                    ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
                    ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
                }
            });

            // 右键放开
            container.on("mouseup", function(e) {
                if (e.button == 2) {
                    restoreDrawingSurface();
                    drag = false;

                    container[0].style.cursor = "default";
                    selectNodesFromHighlight();
                }
            });

            $('.toolbox').removeClass('toolbox-open');
            ElementDetail.resetViews();
        } else {
            btn.removeClass('btn-primary active').addClass('btn-default');
            selectedNodes = [];
            selectedEdges = [];
            network.unselectAll();
            // 非多选情况下，释放默认右键；解绑 $("#drawing") 上的三个事件 mousedown mousemove mouseup
            container.bind('contextmenu', function() {
                return true;
            });
            $("#drawing").unbind("mousedown");
            $("#drawing").unbind("mouseover");
            $("#drawing").unbind("mouseup");
        }

        multiselectMode = enabled;
    }

    function enableAutoLayout(enabled) {
        toolbar.autolayout = enabled;
        var btn = $('#btn-autolayout');
        if (enabled) {
            btn.removeClass('btn-default').addClass('btn-primary active');
        } else {
            btn.removeClass('btn-primary active').addClass('btn-default');
        }

        var hierarchical = $('#btn-hierarchical').hasClass('active');
        var option = {
            physics: {
                enabled: enabled
            }
        };
        if (!hierarchical) {
            option.edges = {
                smooth: enabled ? {
                    enabled: true,
                    type: 'dynamic'
                } : {
                    enabled: false,
                    type: 'continuous'
                }
            }
        }
        network.setOptions(option);
    }

    function enableHierarchicalLayout(enabled) {
        toolbar.hierarchical = enabled;
        var btn = $('#btn-hierarchical');
        if (enabled) {
            enableAutoLayout(true);
            btn.removeClass('btn-default').addClass('btn-primary active');
        } else {
            btn.removeClass('btn-primary active').addClass('btn-default');
        }

        network.setOptions({
            layout: {
                hierarchical: {
                    enabled: enabled,
                    direction: 'UD',
                    sortMethod: 'directed'
                }
            }
        })
    }

    function enableOverview(enabled) {
        var btn = $('#btn-overview');
        if (enabled) {
            btn.removeClass('btn-default').addClass('btn-primary active');
        } else {
            btn.removeClass('btn-primary active').addClass('btn-default');
        }

        if (enabled) {
            Overview.show();
        } else {
            Overview.hide();
        }
    }

    //生成快照
    function getSnapShot() {
        network.storePositions();

        return JSON.parse(JSON.stringify({
            nodes: nodes.get(),
            edges: edges.get()
        }));
    }

    //还原快照
    function restoreSnapShot(snapshot, fit) {
        nodes.clear();
        edges.clear();
        toggleNetworkLabel(snapshot, toolbar.hideLabel);
        nodes.add(snapshot.nodes);
        edges.add(snapshot.edges);
        //just to skip fit
        network.setOptions({
            physics: {
                enabled: true
            }
        });
        network.setData({
            nodes: nodes,
            edges: edges
        });
        network.setOptions({
            physics: {
                enabled: toolbar.autolayout
            }
        });
        selectedNodes = [];
        selectedEdges = [];
        if (fit) {
            network.fit();
        }
    }

    //存个档可好
    function saveHistory(dontSaveSnapshot) {
        setTimeout(function() {
            if (toolbar.autolayout) {
                if (!eventAction['stabilized']) {
                    eventAction['stabilized'] = {};
                }
                var history = new HistoryAction(getSnapShot());
                HistoryStack.push(history);
                if (isStabilizing) {
                    historiesToUpdate.push(history);
                    eventAction['stabilized'].updateHistory = function(){
                        updateHistorys();
                    }
                }
            } else {
                HistoryStack.push(new HistoryAction(getSnapShot()));
            }
            if (dontSaveSnapshot) {
                return;
            }
            autoSave();
        });
    }

    function updateHistorys() {
        if (_.isEmpty(historiesToUpdate)) {
            return;
        }
        network.storePositions();
        _.each(historiesToUpdate, function(history) {
            _.each(history.data.nodes, function(node) {
                var newState = nodes.get(node.id);
                if (newState) {
                    node.x = newState.x;
                    node.y = newState.y;
                }
            })
        })
        historiesToUpdate = [];
    }

    function autoSave() {
        if (autoSaveWaiting)
            return;
        var current = new Date().getTime();
        if (current - lastAutoSaveTime > autoSaveInterval) {
            // console.log('auto save');
            lastAutoSaveTime = current;
            if (toolbar.autolayout && isStabilizing) {
                if (!eventAction['stabilized']) {
                    eventAction['stabilized'] = {};
                }
                eventAction['stabilized']['saveSnapshot'] = function() {
                    Snapshot.autoSave();
                };
            } else {
                Snapshot.autoSave();
            }
        } else {
            autoSaveWaiting = true;
            setTimeout(function() {
                autoSaveWaiting = false;
                autoSave();
            }, autoSaveInterval + lastAutoSaveTime - current);
        }
    }


    //=======================节点扩展与详情==========================
    function showExtendingLoader(position) {
        var container = $('<div class="extend-loader">').css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': $('#drawing').width(),
            'height': $('#drawing').height(),
            'z-index': 3
        });
        var loader = $('<div class="loader"><div class="loader-inner ball-scale-multiple"><div></div><div></div><div></div></div></div>');
        loader.css({
            'position': 'absolute',
            'top': (position.y - 30) + 'px',
            'left': (position.x - 30) + 'px'
        });
        loader.find('.loader-inner > div').css({
            'background-color': '#2384c6',
            'width': '120px',
            'height': '120px'
        });
        $('#drawing').append(container);
        container.append(loader);
    }

    function hideExtendingLoader() {
        $('#drawing .extend-loader').remove();
    }

    var clickExtend = function(btn) {
        btn.menu.close();
        network.unselectAll();
        var nid = btn.menu.nid;
        var origNode = nodes.get(nid).origNode;
        var filter = btn.config.filter;
        var position = network.getPositions([nid])[nid];
        position = network.canvasToDOM(position);

        if (filter == 0) {
            onExpandClicked(origNode, btn);
        } else {
            FilterTimeFrequency.extendFilter(filter, function(data) {
                showExtendingLoader(position);

                onExpandClicked(origNode, btn, data);
            })
        }
    }

    var clickDetail = function(btn) {
        btn.menu.close();
        var nid = btn.menu.nid;

        ElementDetail.setNode(nid, true);
    }

    var _expandNode = function(data, nid, showNotify, isExpandRelation, disableAutoCombine) {
        var type, expandNodesOfTypes = {},
            isExist = false,
            isAdded = false;
        _.each(data.nodes, function(node, index) {
            var link = data.links.length > index && data.links[index];

            if (nodes.get(node.nodeId)) {
                isExist = true;
            } else {
                isAdded = true;
                node = generateNode(node);
                type = node.nodeType;
                expandNodesOfTypes[type] = expandNodesOfTypes[type] || {};
                expandNodesOfTypes[type][link.linkType] = expandNodesOfTypes[type][link.linkType] || [];
                expandNodesOfTypes[type][link.linkType].push(node);
            }

            if (link) {
                if (edges.get(link.id) || _getEdgeOf(nid, node.nodeId)) {
                    combineEdge(link);
                } else {
                    generateEdge(link);
                }
            }
        });

        if (showNotify && isExist) {
            Notify.show({
                title: (isAdded ? '部分' : '所有') + '节点已存在关系中',
                type: 'warning'
            });
        }
        _.each(expandNodesOfTypes, function(expandNodesOfLink, type) {
            _.each(expandNodesOfLink, function(expandNodes, linkType) {
                if (disableAutoCombine || expandNodes.length <= AUTO_COMBINE_LIMIT) {
                    // 批添加会导致自动布局问题
                    _.each(expandNodes, function(node) {
                        nodes.add(node);
                    });
                } else {
                    type = parseInt(type);
                    var title = _nodeCaptionOfType(type);
                    title = title ? title + '合并节点' : '自动合并节点';
                    var opts = {
                        nid: nid,
                        nodeType: type,
                        title: title,
                        expandNodes: expandNodes,
                        linkType: parseInt(linkType)
                    };
                    CombineNode.combineOvermuchNodes(opts);
                }
            });
        });
    }

    function combineEdge(repeatEdge) {
        var targetEdge = _getEdgeOf(repeatEdge.srcNodeId, repeatEdge.destNodeId);
        var newLabel = repeatEdge.name == targetEdge.label && targetEdge.label;

        var isExist = false;
        _.each(targetEdge.filterAndLinkType, function(filterAndLinkType) {
            if (filterAndLinkType.linkType == repeatEdge.linkType) {
                isExist = true;
            }
        });
        if (!isExist) {
            targetEdge.filterAndLinkType.push({
                frequency: repeatEdge.frequency,
                filter: repeatEdge.filter || "",
                linkType: repeatEdge.linkType || 0
            });
            var linkType, totalFrequency = 0;
            _.each(targetEdge.filterAndLinkType, function (item) {
                if (linkType === undefined) {
                    linkType = item.linkType;
                } else if (linkType != -1) {
                    linkType = linkType == item.linkType ? linkType : -1;
                }
                if (_.contains(COUNTABLE_LINK_TYPES, item.linkType)) {
                    totalFrequency += item.frequency;
                }
            });
            if (!newLabel && linkType != -1) {
                newLabel = RelationshipUtil.LINK_NAMES[linkType];
            } else {
                newLabel = totalFrequency > 0 ? '总频次=' + totalFrequency: '';
            }

            edges.update({
                id: targetEdge.id,
                label: newLabel,
                filterAndLinkType: targetEdge.filterAndLinkType
            });
        }
    }

    function getIconByType(type) {
        var icon = NetworkConfig.icons["" + type];
        return icon || {
            font: 'FontAwesome',
            name: "fa fa-share-alt-square",
            code: "\uf1e1",
            color: "black"
        }
    }

    function buildNodeMenuConfig(node) {
        if (!_.isEmpty(node.children)) {
            //combined node
            return [{
                title: "取消合并",
                family: 'FontAwesome',
                icon: '\uf248',
                click: function(btn) {
                    btn.menu.close();
                    cancelCombine([btn.menu.nid]);
                }
            }, {
                title: "详情",
                family: 'FontAwesome',
                icon: "\uf1e1",
                fill: '',
                hover: '',
                click: clickDetail
            }, {
                title: "删除",
                family: 'FontAwesome',
                icon: "\uf014",
                fill: '#E9573F',
                hover: '#E63F24',
                click: function(btn) {
                    btn.menu.close();
                    nodes.remove(btn.menu.nid);
                    saveHistory();
                }
            }];
        }
        var nodeType = node.nodeType;
        var nodeInfo = _.find(nodeTypeInfo, function(info) {
            return info.type == nodeType;
        });

        if (!nodeInfo) {
            return [{
                title: "详情",
                family: 'FontAwesome',
                icon: "\uf1e1",
                fill: '',
                hover: '',
                click: clickDetail
            }, {
                title: "删除",
                family: 'FontAwesome',
                icon: "\uf014",
                fill: '#E9573F',
                hover: '#E63F24',
                click: function(btn) {
                    btn.menu.close();
                    nodes.remove(btn.menu.nid);

                    saveHistory();
                }
            }];
        }

        var out = (function buildMenu(items) {
            var array = [];
            _.each(items, function(item) {
                var menuItem = {
                    title: item.name,
                    targettype: item.targetType,
                    linktype: item.linkType,
                    filter: item.filter,
                    family: getIconByType(item.targetType).font,
                    icon: getIconByType(item.targetType).code
                };
                if (_.size(item.children) > 0) {
                    menuItem.children = buildMenu(item.children);
                } else if (item.targetType > 0) {
                    // 正常扩展节点
                    menuItem.click = clickExtend;
                } else if (item.targetType == -3) {
                    // 查看节点详情
                    menuItem.click = clickDetail;
                } else if (item.targetType === -100) {
                    // 所有关系或所有实体
                    menuItem.click = clickExtend;
                } else {
                    menuItem.click = function() {
                        Notify.show({
                            title: '无符合条件的拓展',
                            type: 'warning'
                        });
                    };
                }
                array.push(menuItem);
            });
            return array;
        })(nodeInfo.menu);
        out.push({
            title: '删除',
            icon: "\uf014",
            family: 'FontAwesome',
            fill: '#E9573F',
            hover: '#E63F24',
            children: [
                {
                    title: '节点',
                    icon: "\uf013",
                    family: 'FontAwesome',
                    fill: '#e68a07',
                    hover: '#e68a07',
                    click: function(btn) {
                        network.deleteSelected();
                        btn.menu.close();

                        saveHistory();
                    }
                },{
                    title: '节点及扩展',
                    icon: "\uf085",
                    family: 'FontAwesome',
                    fill: '#e6c018',
                    hover: '#e6c018',
                    click: function(btn) {
                        var selectId = btn.menu.nid;
                        var getEdgeNodes = network.getConnectedNodes(selectId).slice();
                        var getSelectedNodes = getEdgeNodes.slice();
                        getSelectedNodes.push(selectId);
                        network.selectNodes(getSelectedNodes);
                        network.deleteSelected();
                        btn.menu.close();

                        saveHistory();
                    }
                }
            ]
        });
        return out;
    }

    function generateNode(node) {
        var cfg = getIconByType(node.parentType || node.nodeType);
        return {
            id: node.nodeId,
            label: toolbar.hideLabel ? undefined : node.title,
            title: toolbar.hideLabel ? node.title : undefined,
            shape: 'icon',
            icon: {
                face: cfg.font,
                code: cfg.code,
                color: cfg.color,
                size: 50
            },
            font: {
                color: '#8e388e'
            },
            parentType: node.parentType ? node.parentType : undefined, //parentType:是否是合并节点，如果是，parentType就是合并节点的类型
            nodeType: node.nodeType,
            notes: node.notes,
            origNode: node
        }
    }

    function generateEdge(edge) {
        var edgeId = edge.id || RelationshipUtil.generateEdgeId(edge.srcNodeId, edge.destNodeId);

        var filterAndLinks = edge.filterAndLinkType || [{
            filter: edge.filter || "",
            linkType: edge.linkType || 0,
            frequency: edge.frequency
        }];

        if (edge.name === '') {
            console.log('combineline', filterAndLinks[0]);
        }

        if (edges.get(edgeId)) {
            return;
        }

        edges.add({
            id: edgeId,
            from: edge.srcNodeId,
            to: edge.destNodeId,
            label: toolbar.hideLabel ? undefined : edge.name,
            title: toolbar.hideLabel ? edge.name : undefined,
            font: {
                align: 'top'
            },
            color: {
                color: '#443838',
                highlight: '#3498db'
            },
            notes: edge.notes,
            selectionWidth: 2,
            filterAndLinkType: filterAndLinks
        });
        return edgeId;
    }



    function _getEdgeOf(srcNodeId, destNodeId) {
        var fromSrcEdeg = edges.get(srcNodeId + '_' + destNodeId);
        var fromDestEdge = edges.get(destNodeId + '_' + srcNodeId);
        return fromSrcEdeg || fromDestEdge;
    }

    function _nodeCaptionOfType(type) {
        var info = NetworkConfig.icons[type];
        return info ? info.caption : '';
    }

    function _showLabelOrNot() {
        var nodesUpdate = [];
        nodes.forEach(function(node) {
            var label = toolbar.hideLabel ? node.label : node.title;
            nodesUpdate.push({
                id: node.id,
                label: toolbar.hideLabel ? '' : label,
                title: toolbar.hideLabel ? label : ''
            });
        });
        nodes.update(nodesUpdate);
    }

    function onExpandClicked(origNode, btn, filterData) {
        var expandAllType;
        if (btn.config.targettype === -100) {
            var parentType = btn.parent.config.targettype;
            expandAllType = parentType === -1 ? 0 : (parentType === -2 ? 1 : undefined);
        }

        $.getJSON('/relationgraph/relationgraph/nodeexpand', {
            id: origNode.nodeId,
            type: origNode.nodeType,
            keyword: origNode.keyword,
            targettype: btn.config.targettype,
            expandtype: expandAllType,
            linktype: btn.config.linktype,
            filter: filterData
        }, function(rsp) {
            hideExtendingLoader();
            if (rsp.code == 0 && !_.isEmpty(rsp.data.nodes)) {
                Filter.cancelFiltration();

                _expandNode(rsp.data, origNode.nodeId, true);
                saveHistory();
            } else {
                Notify.show({
                    title: '无符合条件的拓展',
                    type: 'warning'
                });
            }
        });
    }



    //===================Some Modules Here=================
    // Toggles Theme Settings Tray

    (function loadGraphInfo() {
        $.getJSON('/relationanalysis/personrelationexplore/getRelationMetaData', function(rsp){
            if (rsp.code == 0) {
                var optionList = [];

                _.each(rsp.data.relationMeta, item=> {
                    var metadataMaps = {label: '', value: ''};
                    metadataMaps.label = item.relationName;
                    metadataMaps.value =  item.relationType;
                    optionList.push(metadataMaps);

                });

                FilterContent.config({
                    container: $('#toolbox-filter-new'),
                    nodeGraphs: optionList,
                    nodeIcons: NetworkConfig.icons,
                    nodes: nodes,
                    edges: edges
                });

            } else {
                Notify.simpleNotify('错误', rsp.message, 'error');
                hideLoader();
            }
        });
    })();

    $('.toolbox .panel-heading').on('click', function() {
        var curToolBox = $(this).parent('.toolbox');
        curToolBox.toggleClass('toolbox-open');
    });

    CombineNode.init({
        network: network,
        nodes: nodes,
        edges: edges,
        generateNode: generateNode,
        generateEdge: generateEdge,
        XORArray: _XORArray
    });

    ElementDetail.init({
        container: $('#toolbox-detail'),
        network: network,
        nodeSet: nodes,
        edgeSet: edges,
        cacher: Cacher,
        nodeCombinator: CombineNode,
        expandNodeFn: _expandNode,
        generateEdge: generateEdge,
        historySaveFn: saveHistory
    });


    Filter.config({
        container: $('#toolbox-filter'),
        nodeIcons: NetworkConfig.icons,
        nodes: nodes,
        edges: edges
    });

    // snapshot
    Snapshot.init(network, getSnapShot, function(graph, fit) {
        restoreSnapShot(graph, fit);

        saveHistory(true);
    });
    var taskId = Util.getURLParameter('taskid');
    var taskName = Util.getURLParameter('taskname');
    if (taskId) {
        Snapshot.openTask(taskId, taskName);
        // $('#btn-importfile').click();
    }


    //================= for debug===============
    if (DEBUG) {
        window.network = network;
        window.nodes = nodes;
        window.edges = edges;

        nodes.on('add', function(event, properties) {
            console.log('node add:' + properties.items);
        });
        nodes.on('remove', function(event, properties) {
            console.log('node remove:' + properties.items);
        });
        edges.on('add', function(event, properties) {
            console.log('edge add:' + properties.items);
        });
        edges.on('remove', function(event, properties) {
            console.log('edge remove:' + properties.items);
        });
        // window.HistoryStack = HistoryStack;
    }

});
