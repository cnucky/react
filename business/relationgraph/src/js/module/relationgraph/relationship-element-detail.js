define('./relationship-element-detail', ['../../tpl/relationship/tpl-detail-panel',
        '../../tpl/relationship/tpl-node-detail',
        '../../tpl/relationship/tpl-edge-detail',
        'bootstrap-colorpicker',
        'nova-dialog',
        'utility/loaders'
    ],
    function(tplPanel, tplNode, tplEdge, colorPicker, Dialog, Loader) {
        tplPanel = _.template(tplPanel);
        tplNode = _.template(tplNode);
        tplEdge = _.template(tplEdge);

        var TYPE_NODE = 0,
            TYPE_EDGE = 1;

        var Cacher, CombineNode;
        var network, nodeSet, generateEdge, edgeSet, expandNodeFn, tableContainer, historySaveFn;
        var nodeData, edgeData, detailType, elementColor, fontColor;

        var searchRange, lastInputTime, _lastSearchKeyword;

        function init(opts) {
            $(opts.container).append(tplPanel());

            $('#color6, #fontColor6').colorpicker({
                color: '#4a89dc',
                align: 'right',
                format: 'hex'
            }).on('changeColor', function(e) {
                var newColor = e.color.toHex();
                if ($(e.target).attr('id') == 'color6') {
                    $('input[name="elemColor"]:checked').prop('checked', false);

                    if (elementColor === newColor) {
                        return;
                    }
                    elementColor = newColor;
                } else if ($(e.target).attr('id') == 'fontColor6' && fontColor != newColor) {
                    $('input[name="fontColor"]:checked').prop('checked', false);

                    if (fontColor === newColor) {
                        return;
                    }
                    fontColor = newColor;
                }
                setColor();
            });

            Cacher = opts.cacher;
            CombineNode = opts.nodeCombinator;
            network = opts.network;
            nodeSet = opts.nodeSet;
            edgeSet = opts.edgeSet;
            expandNodeFn = opts.expandNodeFn;
            generateEdge = opts.generateEdge;
            historySaveFn = opts.historySaveFn;

            tableContainer = $('#table-container');

            // collapse
            $("#collapse-click").click(function() {
                var cls = $("#action-panel").attr("class");
                if (cls == "collapse") {
                    $("#plus-minus").attr("class", "fa fa-minus");
                } else if (cls == "collapse in") {
                    $("#plus-minus").attr("class", "fa fa-plus");
                }
            });

            $('#notes-edit').blur(function() {
                var notes = $('#notes-edit').val().trim();
                if (detailType == TYPE_NODE) {

                    if (notes && nodeData.notes !== notes) {
                        nodeData.notes = notes;
                        nodeData.notes = !_.isEmpty(notes) ? notes : nodeData.notes;
                        nodeSet.update({
                            id: nodeData.id,
                            notes: nodeData.notes
                        });
                    }
                } else if (detailType == TYPE_EDGE) {

                    if (notes && edgeData.notes !== notes) {
                        edgeData.notes = notes;
                        edgeData.notes = !_.isEmpty(notes) ? notes : edgeData.notes;
                        edgeSet.update({
                            id: edgeData.id,
                            notes: edgeData.notes
                        });
                    }
                }
            });

            $('input[name="elemColor"], input[name="fontColor').click(function() {
                if (detailType == TYPE_NODE && !nodeData || detailType == TYPE_EDGE && !edgeData) {
                    return;
                }

                if (this.name == 'elemColor') {
                    elementColor = $('input[name="elemColor"]:checked').prop('value');
                } else {
                    fontColor = $('input[name="fontColor"]:checked').prop('value');
                }
                setColor();
            });

            $('#element-title').blur(function(event) {
                var newTitle = event.target.value.trim();

                if (_.isEmpty(newTitle)) {
                    return;
                }
                if (detailType == TYPE_NODE && nodeData && nodeData.title !== newTitle) {
                    nodeData.origNode.title = newTitle;
                    nodeSet.update({
                        id: nodeData.id,
                        label: newTitle
                    });

                    historySaveFn();
                } else if (detailType == TYPE_EDGE && edgeData && edgeData.title !== newTitle) {
                    edgeSet.update({
                        id: edgeData.id,
                        label: newTitle
                    });

                    historySaveFn();
                }
            });

            //add by zhangu
            $("#search-input").keyup(function(event) {
                lastInputTime = event.timeStamp;
                setTimeout(function() {
                    if (lastInputTime - event.timeStamp == 0) {
                        var keyword = $("#search-input").val();
                        if (_.isEmpty(keyword)) {
                            loadInfo();
                            _lastSearchKeyword = keyword;
                            return;
                        }else{
                            _lastSearchKeyword = keyword;
                            var searchResult = [];

                                for (var i = 0; i < searchRange.length; i++) {
                                    var props = [], matched = false;
                                    props = searchRange[i].properties;
                                    if (props.length > 0) {
                                        for (var j = 0; j < props.length && !matched; j++) {
                                            var propInfo = props[j];
                                            for (var key in propInfo) {
                                                if (key != "nodeType") {

                                                    if (propInfo[key].toUpperCase().indexOf(keyword.toUpperCase()) != -1) {
                                                        matched = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        matched && searchResult.push(searchRange[i]);
                                    }

                                tableContainer.empty();
                                tplNodesDetail(searchResult);
                            }
                        }
                    }
                }, 300)
            });
            //the end

            resetViews();
        }

        function setColor() {
            if (detailType == TYPE_NODE) {
                nodeData.icon.color = elementColor ? elementColor : nodeData.icon.color;
                nodeData.font.color = fontColor ? fontColor : nodeData.font.color;
                nodeSet.update({
                    id: nodeData.id,
                    icon: nodeData.icon,
                    font: nodeData.font
                });
            } else {
                edgeData.color.color = elementColor ? elementColor : edgeData.color.color;
                edgeData.font.color = fontColor ? fontColor : edgeData.font.color;
                edgeSet.update({
                    id: edgeData.id,
                    color: edgeData.color,
                    font: edgeData.font
                });
            }
        }

        function setNode(nodeId, expand) {
            $("#search-input").val("");
            detailType = TYPE_NODE;

            if (expand) {
                expandToolPanel();
            }

            nodeData = nodeSet.get(nodeId);
            edgeData = null;
            //the end
            loadInfo(false);
        }

        function setEdge(edgeId, expand) {
            detailType = TYPE_EDGE;

            if (expand) {
                expandToolPanel();
            }

            if (edgeData && edgeData.id == edgeId) {
                return;
            }
            edgeData = edgeSet.get(edgeId);
            nodeData = null;

            loadInfo(false);
        }

        function refresh() {
            if (detailType == TYPE_NODE) {
                nodeData = nodeSet.get(nodeData.id);
            } else if (detailType == TYPE_EDGE) {
                edgeData = edgeSet.get(edgeData.id);
            }
            loadInfo(true);
        }

        function loadInfo(ignoreCache) {
            resetViews();

            if (detailType == TYPE_NODE) {
                if (!nodeData) {
                    return;
                }
            } else if (detailType == TYPE_EDGE) {
                if (!edgeData) {
                    return;
                }
            }
            initColors();
            setTitle();
            showNotes();
            showDetail(ignoreCache);
        }

        function initColors() {
            if (detailType == TYPE_NODE) {
                elementColor = nodeData.icon.color;
                fontColor = nodeData.font.color;
            } else if (detailType == TYPE_EDGE) {
                elementColor = edgeData.color.color;
                fontColor = edgeData.font.color;
            }

            $('#color6').colorpicker('setValue', elementColor);
            $('#fontColor6').colorpicker('setValue', fontColor);
        }

        function setTitle() {
            if (detailType == TYPE_NODE) {
                $('#element-title').val(nodeData.label);
            } else if (detailType == TYPE_EDGE) {
                $('#element-title').val(edgeData.label);
            }
        }

        function showDetail(ignoreCache) {

            if (!ignoreCache && loadCache()) {
                return;
            }

            var loader = Loader(tableContainer);
            if (detailType == TYPE_NODE) {
                var nodes = [];
                if (!_.isEmpty(nodeData.children)) {
                    _.each(nodeData.children, function(childNode) {
                        nodes.push({
                            nodeId: childNode.id,
                            nodeType: childNode.nodeType,
                            keyword: childNode.origNode.keyword
                        });
                    });
                } else {
                    nodes.push({
                        nodeId: nodeData.id,
                        nodeType: nodeData.nodeType,
                        keyword: nodeData.origNode.keyword
                    });
                }
                $.getJSON('/relationgraph/relationgraph/getNodeDetail', {
                    nodes: JSON.stringify(nodes)
                }, function(rsp) {
                    loader.hide();
                    if (rsp.code != 0 || !rsp.data) {
                        return;
                    }
                    Cacher.addCache(nodeData.id, rsp.data);

                    //add by zhangu --search 
                    searchRange = [];
                    searchRange = rsp.data;
                    if (searchRange.length > 10) {
                        $("#search-input").show();
                    } else {
                        $("#search-input").hide();
                    }
                    //the end

                    tplNodesDetail(rsp.data);
                });
            } else if (detailType == TYPE_EDGE) {
                var sNode = nodeSet.get(edgeData.from).origNode;
                var dNode = nodeSet.get(edgeData.to).origNode;
                $.getJSON('/relationgraph/relationgraph/queryEdge', {
                    id: edgeData.id,
                    snodeid: sNode.nodeId,
                    snodetype: sNode.nodeType,
                    snodekeyproperty: sNode.keyword,
                    dnodeid: dNode.nodeId,
                    dnodetype: dNode.nodeType,
                    dnodekeyproperty: dNode.keyword
                }, function(rsp) {
                    loader.hide();
                    if (rsp.code != 0) {
                        return;
                    }
                    Cacher.addCache(edgeData.id, rsp.data);

                    var tableInfo = rsp.data;
                    tableInfo.title = sNode.title + '-' + dNode.title;
                    tableContainer.append(tplEdge(tableInfo));
                });
            }
        }

        function loadCache() {
            if (detailType == TYPE_NODE) {
                var cachedData = Cacher.readCache(nodeData.id);
                if (cachedData) {
                    //add by zhangu
                    if (nodeData.children && cacheInvalidate(cachedData)) {
                        // 合并节点中子节点可能已撤出
                        return false;
                    }
                    searchRange = [];
                    $.extend(true, searchRange, cachedData);
                    if (cachedData.length > 10) {
                        $("#search-input").show();
                    } else {
                        $("#search-input").hide();
                    }
                    //the end
                    tplNodesDetail(cachedData);
                    return true;
                }
            } else if (detailType == TYPE_EDGE) {
                cachedData = Cacher.readCache(edgeData.id);
                if (cachedData) {
                    var tableInfo = cachedData;
                    tableInfo.title = edgeData.label;
                    tableContainer.append(tplEdge(tableInfo));
                    return true;
                }
            }
            return false;
        }

        function addMemberNode(member) {
            if (!member.keyword) {
                member.keyword = member.key;
            }
            member.title = member.caption;
            member.link.srcNodeId = nodeData.id;
            member.link.destNodeId = member.nodeId;

            var data = {
                nodes: [member],
                links: [member.link]
            };
            expandNodeFn(data, nodeData.id, true);
        }

        function resetViews() {
            tableContainer.empty();

            $('#element-title').val('');
            $('input[name="elemColor"]:checked').removeAttr('checked');
            $('input[name="fontColor"]:checked').removeAttr('checked');
            $('#notes-edit').val('');
        }

        function showNotes() {
            var info = detailType == TYPE_NODE ? nodeData : edgeData;
            if (info.notes) {
                $('#notes-edit').val(info.notes);
            }
        }

        function tplNodesDetail(dataList) {
            _.each(dataList, function(item, index) {
                item.memberIndex = index;
                item.isMerged = nodeData.parentType;
                tableContainer.append(tplNode(item));
            });
            if (!nodeData.parentType) {
                //群组节点
                $('.btn-add-graph').click(function() {
                    $("#search-input").val("");
                    var memberIndex = $(this).attr('data-index');
                    var member = dataList[0].members[memberIndex];
                    addMemberNode(member);

                    historySaveFn();
                });
            } else {
                //合并节点
                $('.btn-add-graph').click(function() {
                    $("#search-input").val("");
                    if (!nodeData) {
                        return;
                    }
                    var childIndex = $(this).attr('data-index');
                    var member = dataList[childIndex];
                    var toCancelNode = _.find(nodeData.children, function(cnode) {
                        return (cnode.id == member.nodeId);
                    });

                    if (!toCancelNode) {
                        return;
                    }

                    var opts = {
                        combineNodeId: nodeData.id,
                        toCancelId: toCancelNode.id,
                        onCancelled: function() {
                            refresh();

                            historySaveFn();
                        }
                    };
                    CombineNode.cancelNodeFromCombine(opts);
                });
            }
        }

        function expandToolPanel() {
            $('.toolbox').addClass('toolbox-open');
            $('#tab-element-detail').addClass('active').siblings('.active').removeClass('active');
            $('#toolbox-detail').addClass('active').siblings('.active').removeClass('active');
        }

        function onElementChanged(type, id) {
            type = type === 'node' ? TYPE_NODE : TYPE_EDGE;
            if (type !== detailType) {
                return;
            }
            if (type === TYPE_NODE && nodeData && id === nodeData.id) {
                if (!nodeSet.get(id)) {
                    resetViews();
                }
                return;
            }
            if (type === TYPE_EDGE && edgeData && id === edgeData.id) {
                if (!edgeSet.get(id)) {
                    resetViews();
                }
            }
        }

        function cacheInvalidate(childrenCache) {
            if (nodeData.children.length != childrenCache.length) {
                return true;
            }
            var notCachedChild = _.find(nodeData.chilren, function (child) {
                return !_.find(childrenCache, function(item) {
                     return child.id == item.nodeId;
                });
            })
            return notCachedChild;
        }

        return {
            init: init,
            setNode: setNode,
            setEdge: setEdge,
            onElementChanged: onElementChanged,
            resetViews: resetViews
        };
    });