define([
    "nova-notify",
    'nova-dialog',
    '../../tpl/relationship/tpl-node-combine',
    './relationship-network-config',
    './relationship-utils',
    'nova-utils',
    "jquery",
    "underscore"
], function(Notify, Dialog, tplNodeCombine, NetworkConfig, Utils, NovaUtils) {
    tplNodeCombine = _.template(tplNodeCombine);

    var COUNTABLE_LINK_TYPES = Utils.COUNTABLE_LINK_TYPES;

    var _network, _nodes, _edges, _generateNode, _generateEdge, _XORArray,
        countFrequency = Utils.countFrequency;

    function init(opts) {
        _network = opts.network;
        _nodes = opts.nodes;
        _edges = opts.edges;
        _generateNode = opts.generateNode;
        _generateEdge = opts.generateEdge;
        _XORArray = opts.XORArray;
    }

    function showError(title) {
        Notify.show({
            title: title,
            type: 'warning'
        });
    }

    function combine(opts) {
        var newnode;
        var searchType; // = _nodeTypeInfo[0].type;
        var allConnectedNodes = {};
        var combinednum = 0;
        var combinednodes = [];
        var _idarray = opts.idarray;
        // var _nodeTypeInfo = opts.nodeTypeInfo;
        var callback = opts.callback;
        _.each(_idarray, function(nId) {
            _.each(_network.getConnectedNodes(nId), function (nodeId) {
                if (allConnectedNodes[nodeId]) {
                    allConnectedNodes[nodeId].push(nId);
                } else {
                    allConnectedNodes[nodeId] = [nId];
                }
            })
            var combinednode = _nodes.get(nId);
            if (!_.isEmpty(combinednode.children)) {
                combinednum++;
                combinednodes.push(combinednode);
            }
        });
        _.each(_idarray, function (nodeId) {
            delete allConnectedNodes[nodeId];
        })
        if (combinednum === 0) { //no combined node
            Dialog.build({
                title: "合并节点",
                content: tplNodeCombine({
                    types: NetworkConfig.icons //nodeTypeInfo
                }),
                rightBtnCallback: function() {
                    searchType = parseInt($('.btn-node-type.active').prop('data-type')); //nodeTypes[0];
                    if (isNaN(searchType)) {
                        Notify.show({
                            title: '请先选择节点图标',
                            type: 'warning'
                        });
                    } else {
                        var name = $('#txt-query-node-name').val().trim();
                        if (_.isEmpty(name)) {
                            Notify.simpleNotify('请注意', '节点名称为必填项');
                            return;
                        } else {
                            var remarks = $('#txt-query-node-remarks').val().trim();
                            var newid = 'cmb#' + _idarray.join('-');
                            newnode = _generateNode({
                                nodeId: newid,
                                parentType: searchType,
                                nodeType: searchType,
                                title: name,
                                notes: remarks
                            });
                            newnode.children = _nodes.get(_idarray);
                            _nodes.add(newnode);
                            _nodes.remove(_idarray);
                            _.each(allConnectedNodes, function (fromNodes, nodeId) {
                                _generateCombineEdge(newid, fromNodes, nodeId);
                            });

                            callback(newnode.id);
                            $.magnificPopup.close();
                        }
                    }
                }
            }).show(function() {
                setupNodeIcons($('#nodetypes'), NetworkConfig.icons); //展示选择图标
            });
        } else if (combinednum === 1) { //one combined node
            var newnode = combinednodes[0];
            var mychildren = _nodes.get(_idarray);
            var childrenToAdd = [];
            // var newconnectid = _network.getConnectedNodes(newnode.id);
            var connectedges = _network.getConnectedEdges(newnode.id);
            // newconnectid = _.union(newconnectid, _idarray);
            // totalconnectid = _XORArray(totalconnectid, newconnectid);
            // totalconnectid = _XORArray(totalconnectid, _idarray);
            for (var j = 0; j < _idarray.length; j++) {
                if (_idarray[j] != newnode.id) {
                    childrenToAdd.push(mychildren[j]);

                    _nodes.remove(_idarray[j]);
                }
            }
            newnode.children = newnode.children.concat(childrenToAdd);
            _nodes.update({
                id: newnode.id,
                children: newnode.children
            });

            _.each(allConnectedNodes, function (fromNodes, nodeId) {
                _generateCombineEdge(newnode.id, fromNodes, nodeId);
            });

            callback(newnode.id);
        } else { //more combined nodes
            Notify.show({
                title: '不能同时合并两个已合并的节点.',
                type: 'warning'
            });
        }
    }

    function setupNodeIcons(girdContainer, icons) {
        var rowContainer;
        var gridItem;
        _.each(Object.keys(icons), function(type, index) {
            if (index % 6 == 0) {
                rowContainer = $('<div class="row "></div>');
                girdContainer.append(rowContainer);
            }
            var iconCfg = icons[type];
            gridItem = $('<button type="button" class="node-combine btn btn-default btn-sm btn-node-type m2 ml10" >' + '<i class="fa-fw"></i>' + '</button>');
            //gridItem.prop('data-original-title', iconCfg.);
            gridItem.children('i').addClass(iconCfg.name);
            gridItem.children('i').addClass("fs24");
            gridItem.children('i').attr("style", "line-height:1;");
            gridItem.attr("title", iconCfg.caption);
            gridItem.prop('data-type', type);
            rowContainer.append(gridItem);
        });
        $('.btn-node-type').click(function() {
            $('.node-combine.btn-primary.active').toggleClass('btn-default btn-primary active');
            $(this).toggleClass('btn-default btn-primary active');
        });
    }

    function cancel(opts) {
        var edgesid;
        var _idarray = opts.idarray;
        // var _nodeTypeInfo = opts.nodeTypeInfo;
        var callback = opts.callback;
        if (_idarray.length === 0) {
            Notify.show({
                title: '请先选择节点.',
                type: 'warning'
            });
        } else {
            var isexistcombine = false;
            for (var i = 0; i < _idarray.length; i++) {
                var newnode = _nodes.get(_idarray[i]);
                edgesid = _network.getConnectedEdges(newnode.id);
                if (!_.isEmpty(newnode.children)) {
                    isexistcombine = true;
                    _.each(newnode.children, function(childnode) {
                        try {
                            _nodes.add(childnode);
                        } catch (e) {
                            console.log(e);
                        }
                    });
                    _nodes.remove(newnode.id);
                    _edges.remove(edgesid);
                }
            }
            if (!isexistcombine) {
                Notify.show({
                    title: '非已合并节点.',
                    type: 'warning'
                });
            }
            _network.unselectAll();
            callback();
        }
    }

    function combineOvermuchNodes(opts) {
        var expandNodes = opts.expandNodes;
        var expandNodeIds = _.map(expandNodes, function(node) {
            return node.id;
        });
        var nodeType = opts.nodeType;
        var title = opts.title;
        var nid = opts.nid;
        var linkType = opts.linkType;

        var allConnectNodes = {};
        allConnectNodes[nid] = expandNodeIds;
        _.each(expandNodeIds, function(exNodeId) {
            var newConnectId = _network.getConnectedNodes(exNodeId);

            _.each(newConnectId, function (nodeId) {
                if (nodeId == nid) {
                    return;
                }
                if (allConnectNodes[nodeId]) {
                    allConnectNodes[nodeId].push(exNodeId);
                } else {
                    allConnectNodes[nodeId] = [exNodeId];
                }
            });
        });
        _.each(expandNodes, function (nodeId) {
            delete allConnectNodes[nodeId];
        });

        var newId = 'autocmb#' + nid + '_' + NovaUtils.hash(expandNodes);
        if (_nodes.get(newId)) {
            Notify.simpleNotify('该' + (linkType ? Utils.LINK_NAMES[linkType] : '') + '合并节点已经存在', '', 'warning');
            return;
        } else {
            var newnode = _generateNode({
                nodeId:  newId,
                nodeType: nodeType,
                title: title,
                parentType: nodeType
            });
            newnode.children = expandNodes;
            _nodes.add(newnode);
        }

        _.each(allConnectNodes, function (fromNodes, nodeId) {
            _generateCombineEdge(newId, fromNodes, nodeId, linkType);
        });
        _nodes.remove(expandNodeIds);
    }

    function cancelNodeFromCombine(opts) {
        var combineNode = _nodes.get(opts.combineNodeId)
            , onCancelled = opts.onCancelled
            , toCancelNode = opts.toCancelId;

        if (!combineNode) {
            Notify.show({
                title: '该节点已从合并节点中删除，请尝试刷新.',
                type: 'warning'
            });
            return;
        }

        if (combineNode.children.length <= 2) {
            _cancelAllFromCombine(combineNode, onCancelled);
            return;
        }

        _cancelSingleNode(combineNode, toCancelNode, onCancelled);
    }

    /**
     * 1、恢复子节点
     * 2、更新合并节点的children
     * 3、如果子节点与其他子节点有连接,现在则要连接到合并节点
     * 4、删除合并节点之前因该子节点而与其他节点产生的连接(非子节点)
     * @param combineNode
     * @param cancelNodeId
     * @param onCancelled
     * @private
     */
    function _cancelSingleNode(combineNode, cancelNodeId, onCancelled) {
        var connectedToCancel = getConnectedNodes(cancelNodeId),
            connectToCombine = getConnectedNodes(combineNode.id);

        var newChildren = [];

        var origChild, connectedChildren = [];
        _.each(combineNode.children, function(node) {
            if (node.id == cancelNodeId) {
                origChild = node;
            } else {
                newChildren.push(node);

                _.contains(connectedToCancel, node.id) && connectedChildren.push(node.id);
            }
        });

        if (!origChild) {
            Notify.show({
                title: '该节点不是合并节点的子节点.',
                type: 'warning'
            });
            return;
        }
        if (_nodes.get(origChild.id)) {
               Notify.show({
                title: '节点已经存在于图谱中',
                type: 'success'
            });
        } else {
            _nodes.add(origChild);
        }

        combineNode.children = newChildren;
        _nodes.update({
            id: combineNode.id,
            children: newChildren
        });

        if (!_.isEmpty(connectedChildren)) {
            _generateCombineEdge(combineNode.id, connectedChildren, cancelNodeId);
        }

        var bothConnected = _.intersection(connectToCombine, connectedToCancel);
        var childrenIds = _.map(combineNode.children, function (child) {
            return child.id;
        });
        _.each(bothConnected, function(nodeId) {
            var combineEdge = _getEdgeOf(nodeId, combineNode.id);
            var origEdge = _getEdgeOf(nodeId, cancelNodeId);
            if (combineEdge && origEdge) {
                var edgeInfo = _combineEdgeInfo(childrenIds, nodeId, _getCombineEdgeType(combineEdge));
                if (edgeInfo) {
                    _edges.update({
                        id: combineEdge.id,
                        label: edgeInfo.label,
                        filterAndLinkType: edgeInfo.filterAndLinkType
                    });
                }  else {
                    _edges.remove(combineEdge.id);
                }
            }
        });

        _.isFunction(onCancelled) && onCancelled();
    }

    function _cancelAllFromCombine(combineNode, onCancelled) {
        var edgeIds = _network.getConnectedEdges(combineNode.id);
        _edges.remove(edgeIds);
        _.each(combineNode.children, function(childNode) {
            _nodes.add(childNode);
        });
        _nodes.remove(combineNode.id);

        _.isFunction(onCancelled) && onCancelled();
    }

    function getConnectedNodes(nodeId) {
        var connectid = [];
        var myconnectid = [];
        _edges.forEach(function(edge) {
            if (edge.from == nodeId) {
                myconnectid = [edge.to];
                connectid = _.union(connectid, myconnectid);
            } else if (edge.to == nodeId) {
                myconnectid = [edge.from];
                connectid = _.union(connectid, myconnectid);
            }
        });
        return connectid;
    }

    function _combineEdgeInfo(oldSrcNodes, destNodeId, srcLinkType) {
        var filterAndTypes = [];
        var edgeLabel = '';
        var connected = false;

        _.each(oldSrcNodes, function (from) {
            var edge = _getEdgeOf(from, destNodeId);

            if (!edge) {
                return;
            } else {
                connected = true;
            }

            var newFilterAndTypes = srcLinkType ? _.filter(edge.filterAndLinkType, function (item) {
                return item.linkType == srcLinkType;
            }) : edge.filterAndLinkType;
            if (!_.isEmpty(newFilterAndTypes)) {
                filterAndTypes = filterAndTypes.concat(newFilterAndTypes);

                // 如果所有边的label相同则沿用
                if (edgeLabel === '') {
                    edgeLabel = edge.label;
                } else {
                    edgeLabel = edgeLabel != edge.label ? undefined : edgeLabel;
                }
            }
        });
        if (!edgeLabel || edgeLabel.match(/\d+/g)) {
            // 如果标题包含数字则不沿用
            var linkType, totalFrequency = 0;
            _.each(filterAndTypes, function(item){
                if (linkType === undefined) {
                    linkType = item.linkType;
                } else if (linkType != -1) {
                    linkType = linkType == item.linkType ? linkType : -1;
                }
                if (_.contains(COUNTABLE_LINK_TYPES, item.linkType)) {
                    totalFrequency += item.frequency;
                }
            });

            if (linkType > 0) {
                edgeLabel = Utils.LINK_NAMES[linkType]+totalFrequency+'次';
            } else {
                edgeLabel = totalFrequency > 0 ? '总频次' + totalFrequency: '';
            }
        }

        if (connected) {
            return  {
                label: edgeLabel,
                filterAndLinkType: filterAndTypes
            }
        }
    }

    function _generateCombineEdge(combinedNodeId, oldSrcNodes, destNodeId, linkType) {
        var edgeInfo = _combineEdgeInfo(oldSrcNodes, destNodeId, linkType);
        if (edgeInfo) {
            var edgeId = Utils.generateEdgeId(combinedNodeId, destNodeId);
            if (_edges.get(edgeId)) {
                _edges.update({
                    id: edgeId,
                    label: edgeInfo.label,
                    filterAndLinkType: edgeInfo.filterAndLinkType

                });
            } else {
                _generateEdge({
                    name: edgeInfo.label,
                    srcNodeId: combinedNodeId,
                    destNodeId: destNodeId,
                    filterAndLinkType: edgeInfo.filterAndLinkType
                });
            }
        }
    }

    function _getEdgeOf(srcNodeId, destNodeId) {
        var fromSrcEdeg = _edges.get(srcNodeId + '_' + destNodeId);
        var fromDestEdge = _edges.get(destNodeId + '_' + srcNodeId);
        return fromSrcEdeg || fromDestEdge;
    }

    function _getCombineEdgeType(edge) {
        var linkType;
        var notSame = _.find(edge.filterAndLinkType, function(item) {
            if (linkType && linkType != item.linkType) {
                return true;
            }
            linkType = item.linkType;
        });
        return !notSame && linkType;
    }

    return {
        init: init,
        showError: showError,
        combine: combine,
        cancel: cancel,
        combineOvermuchNodes: combineOvermuchNodes,
        cancelNodeFromCombine: cancelNodeFromCombine
    };
});