define([
    'nova-notify',
    './create-node-image',
    './modeling-record-extraction',
    './modeling-data-source-replacement',
    'nova-bootbox-dialog',
    'nova-dialog',
    'widget/dialog/tpl/single-input-dialog',
    'utility/jquery-contextmenu/jquery.contextMenu',
    'utility/jquery-contextmenu/jquery.ui.position'
], function(Notify, ImageCreator, RecordExtraction, ReplacementDialog, bootBox, Dialog, dialogTpl) {
    var container, canvas, ctx, modelManager, network, nodes, edges, condBuilder;
    dialogTpl = _.template(dialogTpl);
    var line = {},
        startCanvas = {},
        endCanvas = {},
        startId = "",
        endId = "",
        drag = false,
        contain = false,
        mouseDownPos,
        mousemove = false,
        srcCursorStyle;
    var curNode;
    var drawingSurfaceImageData;
    var clipboard = require('widget/nova-clipboard');
    var NovaUtils = require('nova-utils');
    var contextMenuHandler;

    function init(opts) {
        container = opts.container;
        modelManager = opts.modelManager;
        network = opts.network;
        nodes = opts.nodes;
        edges = opts.edges;
        condBuilder = opts.condBuilder;
        if (opts.handler && typeof _.isFunction(opts.handler)) {
            contextMenuHandler = opts.handler;
        }

        canvas = network.canvas.frame.canvas;
        ctx = canvas.getContext('2d');

        //setup context menu
        $.contextMenu.types.hotkeyType = function(item, opt, root) {
            $('<span>').text(item.name).appendTo(this);
            if (item.desc) {
                $('<span>').text(item.desc).addClass('pull-right text-muted').appendTo(this);
            }
            if (item.icon && typeof item.icon === 'string') {
                item._icon = root.classNames.icon + ' ' + root.classNames.icon + '-' + item.icon;
                $(this).addClass(item._icon);
            }
        };
        $.contextMenu({
            selector: '#drawing',
            trigger: 'none',
            zIndex: 9999,
            build: function() {
                return _buildClickedItemContext();
            }
        });
    }

    function ligatureBtnClick(opts) {
        var enabled = opts.enabled;
        var btn = opts.btn;
        var removeBtn = opts.removeBtn;
        var options;
        if (enabled) {
            if (removeBtn.hasClass('active')) {
                opts.callback();
                removeBtn.removeClass('btn-primary active').addClass('btn-default');
            }
            btn.removeClass('btn-default').addClass('btn-primary active');
            options = {
                interaction: {
                    dragView: false,
                    dragNodes: false
                }
            };
            network.setOptions(options);
            container[0].style.cursor = "cell";
        } else {
            btn.removeClass('btn-primary active').addClass('btn-default');
            options = {
                interaction: {
                    dragView: true,
                    dragNodes: true
                }
            };
            network.setOptions(options);
            container[0].style.cursor = "pointer";
        }
    }

    // edit, delete, copy, end, view
    function _buildClickedItemContext() {
        var opts = {
            callback: function(key, options) {
                switch (key) {
                    case 'edit':
                        showRenameDialog();
                        break;
                    case 'delete':
                        if (!curNode ||
                            !modelManager.isNodeEditable(curNode.nodeId, true)) {
                            return;
                        }
                        bootBox.confirm(window.i18n.t("toolbar-handler.whether-to-delete-the-selected-node"), function(rlt) {
                            if (rlt) {
                                modelManager.removeNode(curNode.nodeId);
                            }
                        });
                        break;
                    case 'copy':
                        var data = JSON.stringify({ nodes: [nodes.get(curNode.nodeId)] });
                        clipboard.copy({
                            'text/plain': data
                        });
                        if (window.localStorage) {
                            //add data to localStorage too
                            window.localStorage['model-clipboard'] = data;
                        }
                        break;
                    case 'replacement':
                        ReplacementDialog.render(modelManager.getOutputColumns(curNode.nodeId), function(data) {
                            modelManager.replaceDataSource(curNode.nodeId, data.columnMapping, data.nodeData).then(function() {
                                var nodeName = _defineName({
                                    initialName: data.nodeData.caption,
                                    currentName: data.nodeData.caption,
                                    nodes: nodes
                                });
                                curNode.name = nodeName;
                                curNode.title = nodeName;
                                updateNode(curNode);
                                modelManager.nodeChangeNotify(curNode.nodeId);
                            });
                        });
                        break;
                    case 'view':
                        break;
                }
                if (contextMenuHandler) {
                    contextMenuHandler(key, curNode);
                }
            }
        };
        if (curNode) {
            if (curNode.nodeType == 0) {
                opts.items = {
                    'edit': { name: window.i18n.t("toolbar-handler.rename"), icon: 'edit' },
                    'copy': { name: window.i18n.t("toolbar-handler.copy"), icon: 'copy', desc: 'Ctrl + C', type: 'hotkeyType' },
                    'delete': { name: window.i18n.t("toolbar-handler.delete"), icon: 'delete', desc: 'Delete', type: 'hotkeyType' },
                    'replacement': { name: window.i18n.t("toolbar-handler.replace-data-source"), icon: 'recycle' },
                    'sep1': '----------',
                    'view': { name: window.i18n.t("toolbar-handler.view-data"), icon: 'view' }
                }
            } else {
                opts.items = {
                    'edit': { name: window.i18n.t("toolbar-handler.rename"), icon: 'edit' },
                    'copy': { name: window.i18n.t("toolbar-handler.copy"), icon: 'copy', desc: 'Ctrl + C', type: 'hotkeyType' },
                    'delete': { name: window.i18n.t("toolbar-handler.delete"), icon: 'delete', desc: 'Delete', type: 'hotkeyType' },
                    'sep1': '----------',
                    'end': { name: window.i18n.t("toolbar-handler.execute-to-here"), icon: 'step-forward' },
                    'sep2': '----------',
                    'view': { name: window.i18n.t("toolbar-handler.view-results"), icon: 'view' }
                }
            }
            network.unselectAll();
        } else {
            opts.items = {
                'copyall': { name: window.i18n.t("toolbar-handler.copy-the-selected-nodes"), icon: 'copy' },
                'deleteall': { name: window.i18n.t("toolbar-handler.delete-the-selected-elements"), icon: 'delete' },
                'paste': { name: window.i18n.t("toolbar-handler.paste"), icon: 'paste', desc: 'Ctrl + V', type: 'hotkeyType' }
            }
        }
        return opts;
    }



    function showRenameDialog() {
        Dialog.build({
            title: window.i18n.t("toolbar-handler.change-name"),
            minHeight: 100,
            content: dialogTpl({
                label: window.i18n.t("toolbar-handler.new-name"),
                defaultVal: curNode.name
            }),
            rightBtn: window.i18n.t("finish-btn"),
            leftBtn: window.i18n.t("cancel-btn"),
            rightBtnCallback: function() {
                var nodeName = $("#single-input").val();
                var isRepeat = isRepeatName({
                    name: nodeName,
                    nodes: nodes,
                    nodeId: curNode.nodeId
                });
                if (isRepeat) {
                    Notify.show({
                        title: window.i18n.t("toolbar-handler.duplicate-name"),
                        type: "error"
                    })
                    return false;
                }
                if (!NovaUtils.checkValidName(nodeName)) {
                    Notify.show({
                        title: window.i18n.t("warning.model-name-contains-illegal-characters"),
                        type: "error"
                    })
                    return false;
                }
                if (_.isEmpty(nodeName)) {
                    Notify.show({
                        title: window.i18n.t("warning.name-can-not-be-null"),
                        type: "error"
                    })
                } else {
                    curNode.name = nodeName;
                    curNode.title = nodeName;
                    updateNode(curNode);
                    if (curNode.nodeId == condBuilder.curNodeId()) {
                        condBuilder.onNameChanged(nodeName);
                    }

                    Dialog.dismiss();
                }
            }
        }).show();
    }

    function mouseDown(opts) {
        var e = opts.e;
        var drawing = opts.drawing;
        if ((e.button == 0) || (e.button == 2)) {
            if (e.button == 2) {
                srcCursorStyle = container[0].style.cursor;
                container[0].style.cursor = "cell";
            }
            mouseDownPos = { x: e.offsetX, y: e.offsetY };

            _saveDrawingSurface();
            line.startX = e.pageX - drawing.offset().left;
            line.startY = e.pageY - drawing.offset().top;
            startCanvas = network.DOMtoCanvas({
                x: line.startX,
                y: line.startY
            });
            drag = true;
            curNode = null;

            _findNode(drag, function(data) {});
        }
    }

    function mouseMove(opts) {
        var e = opts.e;
        var drawing = opts.drawing;
        if (contain) {
            // 超过5px的距离即视为mousemove
            mousemove = mousemove || ((Math.pow(mouseDownPos.x - e.offsetX, 2) + Math.pow(mouseDownPos.y - e.offsetY, 2)) > 25);

            _restoreDrawingSurface();
            line.endX = e.pageX - drawing.offset().left;
            line.endY = e.pageY - drawing.offset().top;

            ctx.strokeStyle = "#A3A3A3";
            ctx.lineWidth = 2;

            var rentengle = {};
            rentengle.X = Math.abs(line.startX - line.endX);
            rentengle.Y = Math.abs(line.startY - line.endY);
            var controlP1 = {};
            var controlP2 = {};
            var controlP3 = {};
            controlP2.X = (line.endX + line.startX) / 2;
            controlP2.Y = (line.endY + line.startY) / 2;
            controlP1.X = line.startX;
            controlP1.Y = (line.startY + controlP2.Y) / 2;
            controlP3.X = line.endX;
            controlP3.Y = (line.endY + controlP2.Y) / 2;

            ctx.beginPath();
            ctx.moveTo(line.startX, line.startY);

            // 两段贝兹曲线
            ctx.quadraticCurveTo(controlP1.X, controlP1.Y, controlP2.X, controlP2.Y);
            ctx.moveTo(controlP2.X, controlP2.Y);
            ctx.quadraticCurveTo(controlP3.X, controlP3.Y, line.endX, line.endY);

            // 直线
            // ctx.lineTo(line.endX, line.endY);
            // ctx.closePath();

            ctx.stroke();
        }
    }

    function mouseUp(opts) {
        var e = opts.e;
        var drawing = opts.drawing;
        if (e.button == 2) {
            container[0].style.cursor = srcCursorStyle;
        }
        if (drag && contain && mousemove) {
            _restoreDrawingSurface();
            drag = false;
            contain = false;
            mousemove = false;
            line.endX = e.pageX - drawing.offset().left;
            line.endY = e.pageY - drawing.offset().top;
            // 鼠标 DOM 座标转成 Canvas 座标
            endCanvas = network.DOMtoCanvas({
                x: line.endX,
                y: line.endY
            });
            _findNode(drag, function(data) {});

            if (endId) {
                if (startId != endId) {
                    var repeat = false;
                    var connectid = network.getConnectedNodes(startId);
                    _.each(connectid, function(cid) {
                        if (endId == cid) {
                            repeat = true;
                        }
                    });
                    if (!repeat) {
                        if (modelManager.mountTaskNode(startId, endId)) {
                            edges.add(_generateEdge(startId, endId));
                        }

                        startId = "";
                        endId = "";
                    } else {
                        Notify.show({
                            title: window.i18n.t("toolbar-handler.illegal-connection"),
                            text: window.i18n.t("toolbar-handler.unable-repeated-connect-and-two-way-connect"),
                            type: 'warning'
                        });
                    }
                }
            }
        } else if (!mousemove && e.button == 2) {
            //右键菜单
            $('#drawing').contextMenu({
                x: e.pageX,
                y: e.pageY
            });
        }
        contain = false;
    }

    function _generateEdge(startId, endId) {
        return {
            from: startId,
            to: endId,
            arrows: 'to',
            color: {
                color: '#999',
                highlight: '#999',
                hover: '#999'
            },
            smooth: {
                enabled: true,
                type: 'cubicBezier',
                roundness: 0.5
            },
            width: 1.5,
            hoverWidth: 0.5,
            selectionWidth: 0.5
        }
    }

    function _findNode(drag, callback) {
        var allNodes = nodes.get();
        _.each(allNodes, function(item) {
            var nodeBorder = network.getBoundingBox(item.id);
            if (drag) {
                if (nodeBorder.left < startCanvas.x && startCanvas.x < nodeBorder.right && nodeBorder.top < startCanvas.y && startCanvas.y < nodeBorder.bottom) {
                    curNode = item.origNode;
                    startId = curNode.nodeId;
                    endId = "";
                    contain = true;
                    callback(startId);
                }
            } else {
                if (nodeBorder.left < endCanvas.x && endCanvas.x < nodeBorder.right && nodeBorder.top < endCanvas.y && endCanvas.y < nodeBorder.bottom) {
                    curNode = item.origNode;
                    if (curNode.nodeType == 0 && curNode.nodeId != startId) {
                        Notify.show({
                            title: window.i18n.t("toolbar-handler.illegal-connection"),
                            text: window.i18n.t("toolbar-handler.unable-connect-to-data-source"),
                            type: 'warning'
                        });
                    } else {
                        endId = curNode.nodeId;
                        callback(endId);
                    }
                }
            }
        });
    }

    function _saveDrawingSurface() {
        drawingSurfaceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function _restoreDrawingSurface() {
        ctx.putImageData(drawingSurfaceImageData, 0, 0);
    }

    function dragCreateNode(params) {
        var ui = params.ui;
        var centerX = ui.position.left + ui.draggable[0].clientWidth / 2;
        var centerY = ui.position.top + ui.draggable[0].clientHeight / 2;
        var myposition = network.DOMtoCanvas({
            x: centerX,
            y: centerY
        });

        var taskType = params.nodeData.nodeType ? params.nodeData.nodeType : 0;
        var nodeOpts = {
            network: params.network,
            nodes: params.nodes,
            type: taskType,
            position: {
                x: myposition.x,
                y: myposition.y
            }
        };

        if (taskType != 0) {
            // 运算节点
            nodeOpts.name = _getTypeName(taskType);
            nodeOpts.remarks = window.i18n.t("toolbar-handler.not-running");
        } else {
            // 数据源节点
            nodeOpts.detail = params.nodeData;
            nodeOpts.remarks = window.i18n.t("toolbar-handler.data-source");
            nodeOpts.name = params.nodeData.caption;
        }
        _createNode(nodeOpts, modelManager);
    }

    function recordExtraction(opts) {
        var recordData = [];
        for (var i = 0; i < 2; i++) {
            // var info = [];
            // for(var j = 0;j < 3;j++) {
            //     var num = "sele" + i.toString() + j.toString();
            //     info.push({id: j, title: num});
            // }
            var info = {
                id: i.toString(),
                data: []
            };
            for (var j = 0; j < 3; j++) {
                var num = "sele" + i.toString() + j.toString();
                info.data.push({ id: j, title: num });
            }
            recordData.push(info);
        }
        RecordExtraction.RecordExtraction(opts.container, recordData);
    }

    var tplNodeCombine = require('../../tpl/relationship/tpl-node-combine');
    tplNodeCombine = _.template(tplNodeCombine);
    var uuid = require('node-uuid');
    var ColorUtil = require('utility/color-util/color-util');
    var OPERATIONS = require('./operations');

    var DS_BACKGROUND = '#ffffff';
    var OPERATOR_BACKGROUND = '#daf0ff';
    var WARN_BORDER = '#ffc125';
    var SUCCESS_BORDER = '#52cfb2';
    var ERROR_BORDER = '#e67965';
    var QUEUE_BORDER = '#e67965';
    var RUNNING_BORDER = '#e67965';
    var PAUSED_BORDER = '#e67965';
    var BORDER = '#289de9';

    function _generateNodeId() {
        return uuid.v1();
    }

    function _createNode(opts, taskManager) {

        var typeInfo = taskManager.operatorOfType(opts.type);
        var name = opts.type == OPERATIONS.DATA_SOURCE ? opts.name : typeInfo.typeName;

        var newid = _generateNodeId();

        name = _defineName({
            initialName: name,
            currentName: name,
            nodes: opts.nodes
        });

        createNodeImage({
            type: opts.type,
            name: name
        }, function(img) {
            var newnode = _generateNode({
                nodeId: newid,
                name: name,
                title: name,
                taskType: opts.type,
                isSave: 1,
                mustSave: typeInfo ? typeInfo.mustSave : 0,
                nodeType: opts.type,
                remarks: opts.remarks,
                image: img.src,
                x: opts.position.x,
                y: opts.position.y,
                detail: opts.detail
            });
            opts.nodes.add(newnode);
            // opts.network.moveTo({
            //     scale: 1
            // });
        });

        if (opts.type == OPERATIONS.DATA_SOURCE) {
            $.getJSON('/modelanalysis/modeling/getdatatypedefineinfo', {
                centerCode: opts.detail.centerCode,
                dataTypeId: Number(opts.detail.typeId)
            }, (rsp) => {
                var title;
                if (rsp.code == 0) {
                    title = createDataSourceInfoEl(rsp.data);
                    nodes.update({
                        id: newid,
                        title: title
                    });
                }
            })
        }
    }

    function createNodeImage(opts, onImageCreate) {
        var icon = _getNodeIcon(opts.type);

        var opt = {
            type: opts.type,
            name: opts.name,
            status: opts.status,
            styles: opts.styles,
            icon: icon,
            callback: onImageCreate
        };
        ImageCreator.createImage(opt);
    }

    function updateNode(origNode) {
        var status;
        var style = {};
        var taskInfo = origNode.taskType == OPERATIONS.DATA_SOURCE ? null : modelManager.getTaskInfo(origNode.nodeId);
        var type = taskInfo ? taskInfo.taskState : undefined;
        taskInfo && !taskInfo.nodeName && (taskInfo.nodeName = origNode.name);
        if (type === 'finished') {
            status = '\ue61b';
            style.status = { color: '#2ed855' };
        } else if (type === 'error') {
            status = '\ue620';
            style.status = { color: '#f15e5e' };
        } else if (type === 'running') {
            status = taskInfo.finishRatio + '%';
            style.status = {
                color: '#2ed855',
                fontFamily: 'arial',
                fontSize: 20
            }
        } else if (type === 'queue') {
            status = '\ue619';
            style.status = { color: '#d8b93d' };
        } else if (type === 'cancelled') {
            status = '\ue62b';
            style.status = {
                color: '#d8b93d'
            }
        }

        if (origNode.nodeType == OPERATIONS.DATA_SOURCE) {
            $.getJSON('/modelanalysis/modeling/getdatatypedefineinfo', {
                centerCode: origNode.detail.centerCode,
                dataTypeId: Number(origNode.detail.typeId)
            }, (rsp) => {
                var title;
                if (rsp.code == 0) {
                    title = createDataSourceInfoEl(rsp.data);
                } else {
                    title = origNode.name;
                    Notify.simpleNotify("数据源详细信息加载失败", rsp.message, 'error');
                }
                createNodeImage({
                    type: origNode.taskType,
                    name: origNode.name,
                    status: status,
                    styles: style
                }, function(img) {
                    nodes.update({
                        id: origNode.nodeId,
                        image: img.src,
                        name: origNode.name,
                        title: taskInfo ? createInfoEl(taskInfo) : title
                    });
                });
            })
        } else {
            createNodeImage({
                type: origNode.taskType,
                name: origNode.name,
                status: status,
                styles: style
            }, function(img) {
                nodes.update({
                    id: origNode.nodeId,
                    image: img.src,
                    name: origNode.name,
                    title: taskInfo ? createInfoEl(taskInfo) : origNode.title
                });
            });
        }
    }

    function updateNodeBorder(type, origNode) {
        var color;
        var hightlightBorder;
        var backgroundColor = DS_BACKGROUND;
        var hightlightBg = _highlightBgColor(OPERATOR_BACKGROUND);
        switch (type) {
            case 'ready':
                hightlightBorder = _highlightColor(BORDER);
                color = {
                    border: BORDER,
                    background: backgroundColor,
                    highlight: {
                        border: hightlightBorder,
                        background: hightlightBg
                    },
                    hover: {
                        border: hightlightBorder,
                        background: hightlightBg
                    }
                }
                break;
            case 'finished':
                hightlightBorder = _highlightColor(SUCCESS_BORDER);
                color = {
                    border: SUCCESS_BORDER,
                    background: backgroundColor,
                    highlight: {
                        border: hightlightBorder,
                        background: hightlightBg
                    },
                    hover: {
                        border: hightlightBorder,
                        background: hightlightBg
                    }
                }
                break;
            case 'queue':
            case 'running':
                break;
            case 'error':
                hightlightBorder = _highlightColor(ERROR_BORDER);
                color = {
                    border: ERROR_BORDER,
                    background: backgroundColor,
                    highlight: {
                        border: hightlightBorder,
                        background: hightlightBg
                    },
                    hover: {
                        border: hightlightBorder,
                        background: hightlightBg
                    }
                }
                break;
            default:
                hightlightBorder = _highlightColor(WARN_BORDER);
                color = {
                    border: WARN_BORDER,
                    background: backgroundColor,
                    highlight: {
                        border: hightlightBorder,
                        background: hightlightBg
                    },
                    hover: {
                        border: hightlightBorder,
                        background: hightlightBg
                    }
                }
                break;
        }
        if (color) {
            nodes.update({
                id: origNode.nodeId,
                color: color
            })
        }
    }

    /**
     * origNode
     *
     * nodeId: 节点ID
     * name： 节点名称
     * title： 节点描述
     * nodeType： 节点类型
     * x： x轴位置
     * y： y轴位置
     * */
    function _generateNode(opts) {
        var backgroundColor = DS_BACKGROUND;
        var borderColor = WARN_BORDER;
        var hightlightBorder = _highlightColor(borderColor);
        var hightlightBg = _highlightBgColor(OPERATOR_BACKGROUND);
        return {
            id: opts.nodeId,
            shape: 'image',
            name: opts.name,
            image: opts.image ? opts.image : undefined,
            borderWidth: 1.5,
            title: opts.title,
            color: {
                border: borderColor,
                background: backgroundColor,
                highlight: {
                    border: hightlightBorder,
                    background: hightlightBg
                },
                hover: {
                    border: hightlightBorder,
                    background: hightlightBg
                }
            },
            shapeProperties: {
                useBorderWithImage: true
            },
            nodeType: opts.nodeType,
            origNode: _.omit(opts, 'image'),
            x: opts.x,
            y: opts.y,
            size: 20
        }
    }

    function _highlightColor(color) {
        var rgb = ColorUtil.hexToRgb(color);
        var hsl = ColorUtil.rgbToHsl(rgb[0], rgb[1], rgb[2]);
        var newRgb = ColorUtil.hslToRgb(hsl[0], Math.min(hsl[1] + 0.25, 1), Math.min(hsl[2] + 0.05, 1));
        return ColorUtil.rgbToHex(newRgb[0], newRgb[1], newRgb[2]);
    }

    function _highlightBgColor(color) {
        var rgb = ColorUtil.hexToRgb(color);
        var hsl = ColorUtil.rgbToHsl(rgb[0], rgb[1], rgb[2]);
        var newRgb = ColorUtil.hslToRgb(hsl[0], hsl[1], Math.max(hsl[2] - 0.036, 0));
        return ColorUtil.rgbToHex(newRgb[0], newRgb[1], newRgb[2]);
    }

    function _getNodeIcon(type) {
        return type == OPERATIONS.DATA_SOURCE ? '\uf1c0' : OPERATIONS.iconConfigOf(type).iconCode;
    }

    function _defineName(opts) {
        var initialName = opts.initialName;
        var currentName = opts.currentName;
        var mynodes = opts.nodes;
        var lastName = currentName;
        var isRepeat = isRepeatName({
            name: currentName,
            nodes: mynodes
        });
        if (isRepeat) {
            var num = '';
            for (var i = initialName.length; i < currentName.length; i++) {
                num = num + currentName[i];
            }
            if (num == '') {
                num = 1;
            } else {
                num = parseInt(num) + 1;
            }
            num = num.toString();
            lastName = _defineName({
                initialName: initialName,
                currentName: initialName + num,
                nodes: mynodes
            });
        }
        return lastName;
    }

    function isRepeatName(opts) {
        var myname = opts.name;
        var mynodes = opts.nodes;
        var myid = opts.nodeId;
        var isRepeat = false;
        mynodes.forEach(function(node) {
            var id = []
            id.push(node.id)
            if (node.name == myname && !_.contains(id, myid)) {
                isRepeat = true;
            }
        });
        return isRepeat;
    }

    function copyNodes(srcNodes, srcEdges, callback) {
        if (srcNodes.length == 1) {
            var node = srcNodes[0];
            var newId = _generateNodeId();
            var srcNodesIds = [newId];
            node.id = node.origNode.nodeId = newId;
            node.origNode.detailHash = null;
            node.x = node.x + 20;
            node.y = node.y + 20;
            nodes.add(node);
            //复制单个节点修改命名
            node.origNode.title = _defineName({
                initialName: node.name,
                currentName: node.name,
                nodes: nodes
            });
            node.origNode.name = node.origNode.title;
            updateNode(node.origNode);
            updateNodeBorder('default', node.origNode);
            if (node.origNode.taskType == OPERATIONS.DATA_SOURCE) {
                modelManager.loadNodeOutput(node.origNode).then(function() {
                    updateNodeBorder('ready', node.origNode);
                })
            }
            callback(srcNodesIds);
        } else {
            var srcNodesIds = [];
            var srcEdgesIds = [];
            var isExist = false;
            _.each(srcNodes, function(node) {
                srcNodesIds.push(node.id);
            })
            _.each(nodes._data, function(node) {
                //判断当前面板是否存在要粘贴的节点
                if (_.indexOf(srcNodesIds, node.id) != -1) {
                    isExist = true;
                    return false;
                }
            })
            if (isExist) {
                Notify.simpleNotify(window.i18n.t("toolbar-handler.paste-failed"), window.i18n.t("toolbar-handler.duplicate-with-the-current-page-node"), 'error');
            } else {
                //添加节点到面板
                nodes.add(srcNodes);
                _.each(srcEdges, function(edge) {
                    var newEdge = _generateEdge(edge.from, edge.to);
                    edges.add(newEdge);
                    srcEdgesIds.push(newEdge.id);
                });
                //更新节点状态
                _.each(srcNodes, function(node) {
                    delete node.origNode.detailHash;
                    updateNode(node.origNode);
                    updateNodeBorder('default', node.origNode);
                    if (node.origNode.taskType == OPERATIONS.DATA_SOURCE) {
                        modelManager.loadNodeOutput(node.origNode).then(function() {
                            updateNodeBorder('ready', node.origNode);
                        })
                    }
                })
                callback(srcNodesIds, srcEdgesIds);
            }
        }
    }

    function _getTypeName(type) {
        if (type == OPERATIONS.DATA_SOURCE) {
            return '数据源';
        }
        var operationInfo = modelManager.operatorOfType(type);
        return operationInfo && operationInfo.typeName;
    }

    function createInfoEl(taskInfo) {
        var container = $('<div></div>');
        container.append('<div><b>任务名称：</b>' + _insertBrTag(taskInfo.nodeName) + '</div>');
        container.append('<div><b>任务ID：</b>' + taskInfo.taskId + '</div>');
        if (!_.isEmpty(taskInfo.startTime)) {
            container.append('<div><b>开始时间：</b>' + taskInfo.startTime + '</div>');
        }
        if (!_.isEmpty(taskInfo.finishTime)) {
            container.append('<div><b>结束时间：</b>' + taskInfo.finishTime + '</div>');
        }
        if (!_.isUndefined(taskInfo.resultCount)) {
            container.append('<div><b>结果数：</b>' + taskInfo.resultCount + '</div>');
        }
        if (!_.isEmpty(taskInfo.errMsg)) {
            container.append('<div style=""><b>错误日志：</b></div><div>' + _insertBrTag(taskInfo.errMsg) + '</div>');
        }
        return container[0];
    }

    function createDataSourceInfoEl(info) {
        var text = '<div>';
        text += '<div><b>数据源名称：</b>' + _insertBrTag(info.displayName) + '</div>';
        text += '<div><b>记录数：</b>' + info.dataCount + '</div>';
        if (!_.isEmpty(info.maxBusTime)) {
            text += '<div><b>开始时间：</b>' + info.minBusTime + '</div>';
        }
        if (!_.isEmpty(info.minBusTime)) {
            text += '<div><b>结束时间：</b>' + info.maxBusTime + '</div>';
        }
        /*container.append('<div><b>描述：</b>' + info.description + '</div>');*/
        text += '</div>'
        return text;
    }

    /**
     * 添加到节点title的html很多样式无法生效
     */
    function _insertBrTag(text) {
        return text.replace(/.{25}/g, "$&<br>");
    }

    return {
        init: init,
        ligatureBtnClick: ligatureBtnClick,
        mouseDown: mouseDown,
        mouseMove: mouseMove,
        mouseUp: mouseUp,
        dragCreateNode: dragCreateNode,
        updateNode: updateNode,
        updateNodeBorder: updateNodeBorder,
        createNodeImage: createNodeImage,
        copyNodes: copyNodes,
        isRepeatName: isRepeatName
    }
});
