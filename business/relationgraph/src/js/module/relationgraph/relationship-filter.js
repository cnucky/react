define('./relationship-filter', ['../../tpl/relationship/tpl-filter-panel', 'utility/color-util/color-util', 'nova-notify', './relationship-utils'],
    function(tplFilter, ColorUtils, Notify, Utils) {
        tplFilter = _.template(tplFilter);

        var nodeData, edgeData, filteredNodes = [],
            countFrequency = Utils.countFrequency,
            filteredEdges = [],
            filterMode;

        function config(cfg) {
            nodeData = cfg.nodes;
            edgeData = cfg.edges;

            nodeData.on('add', function() {

            });
            edgeData.on('add', function() {
                // filterEdges();
            });

            var container = cfg.container;
            container.append(tplFilter);

            setupNodeIcons(container.find('#icon-grid'), cfg.nodeIcons);
            $('#button-filter').click(function() {
                doFilter();
            });
            $('#button-recovery').click(function() {
                cancelFiltration();
            });

            //add by zhangu
            $('#min-frequency').on('blur', function() {
                var minvalue = parseInt($('#min-frequency').val());
                var maxvalue = parseInt($('#max-frequency').val());
                if (!_.isNaN(minvalue)) {
                    if(minvalue < 0){
                        $('#min-frequency').val(0);
                    }else if(_.isNaN(maxvalue) || minvalue > maxvalue){
                        $('#max-frequency').val(minvalue);
                    }
                }
            })

            $('#max-frequency').on('blur', function() {
                var minvalue = parseInt($('#min-frequency').val());
                var maxvalue = parseInt($('#max-frequency').val());
                if (!_.isNaN(maxvalue)) {
                    if(maxvalue < 0){
                        !_.isNaN(minvalue)?$('#max-frequency').val(minvalue):$('#max-frequency').val(0)
                    }else if(!_.isNaN(minvalue) && minvalue > maxvalue){
                        Notify.show({
                            title: '数值大小次序不能颠倒!',
                            type: 'warning'
                        });
                        $('#min-frequency').val(null);
                    }
                }
            })
            //the end
        }

        function doFilter() {
            if (!checkCondition()) {
                return;
            }

            cancelFiltration();

            findFilteredNodes();
            findFilteredEdges();

            filterElements();
        }

        function checkCondition() {
            if (nodeData.length == 0 && edgeData.length == 0) {
                return false;
            }

            var minFrequency = parseInt($('#min-frequency').val());
            var maxFrequency = parseInt($('#max-frequency').val());

            if (!_.isNaN(maxFrequency) && !_.isNaN(minFrequency) && maxFrequency < minFrequency) {
                Notify.simpleNotify('条件错误', '无效的频次区间', 'warning');
                return false;
            } else {
                return true;
            }
        }

        function cancelFiltration() {
            var changes,
                nodesRecovery = [],
                edgesRecovery = [];

            filteredNodes && _.each(filteredNodes, function(id) {
                var node = nodeData.get(id);
                if (!node) {
                    return;
                }
                changes = {
                    id: node.id
                };
                if (filterMode === 'translucent' && ColorUtils.isRgba(node.icon.color)) {
                    changes.icon = $.extend({}, node.icon, {
                        color: ColorUtils.toRgb(node.icon.color)
                    });
                } else if (filterMode === 'hide' && node.hidden) {
                    changes.hidden = false;
                }
                nodesRecovery.push(changes);
            });
            nodeData.update(nodesRecovery);

            filteredEdges && _.each(filteredEdges, function(id) {
                var edge = edgeData.get(id);
                if (!edge) {
                    return;
                }
                changes = {
                    id: edge.id
                };
                if (filterMode === 'translucent' && edge.color && ColorUtils.isRgba(edge.color.color)) {
                    changes.color = $.extend({}, edge.color, {
                        color: ColorUtils.toRgb(edge.color.color)
                    });
                } else if (filterMode === 'hide' && edge.hidden) {
                    changes.hidden = false;
                }
                edgesRecovery.push(changes);
            });
            edgeData.update(edgesRecovery);
            filteredNodes = [];
            filteredEdges = [];
        }

        /**
         * 筛选节点时，不满足条件的节点的边也会连带被筛选掉
         * 筛选关联时，不满足条件的关联连接的节点也会被筛选掉
         */
        function findFilteredNodes() {
            filterMode = $('input[name=filterMode]:checked').val();

            var nodeTypes = _.map($('.icon-node-type.text-primary'), function(typeButton) {
                return parseInt($(typeButton).prop('data-type'));
            });

            var keyword = $('#filter-keyword').val().trim();

            var nodeIds = [];
            if (nodeTypes.length > 0 || !_.isEmpty(keyword)) {
                nodeIds = nodeData.getIds({
                    filter: function(item) {
                        var matched = true;
                        if (nodeTypes.length > 0) {
                            matched = _.contains(nodeTypes, parseInt(item.nodeType));
                        }
                        if (matched && !_.isEmpty(keyword)) {
                            matched = item.label.indexOf(keyword) != -1;
                        }
                        return !matched;
                    }
                });
            }
            filteredNodes = nodeIds;
        }

        function findFilteredEdges() {
            filterMode = $('input[name=filterMode]:checked').val();

            var minFrequency = parseInt($('#min-frequency').val());
            var maxFrequency = parseInt($('#max-frequency').val());

            // allConnectedNodes是所有有边连接的点，relatedNodes是其中会被此次边的筛选影响到的节点
            var edgeIds = [], nodeIds = filteredNodes, allConnectedNodes = {}, relatedNodes = {};
            if (!_.isNaN(maxFrequency) || !_.isNaN(minFrequency) || nodeIds.length > 0) {
                edgeIds = edgeData.getIds({
                    filter: function(item) {
                        if (!(nodeData.get(item.to) && nodeData.get(item.from))) {
                            // 合并节点的边可能一端没有节点
                            return false;
                        }
                        var matched = true;
                        allConnectedNodes[item.to] ? allConnectedNodes[item.to].push(item.id) : allConnectedNodes[item.to] = [item.id];
                        allConnectedNodes[item.from] ? allConnectedNodes[item.from].push(item.id) : allConnectedNodes[item.from] = [item.id];

                        if (!_.isNaN(maxFrequency) || !_.isNaN(minFrequency)) {
                            if (Utils.isEdgeCountable(item)) {
                                var frequency = countFrequency(item);
                                // 只对通联,汇款,同行通订票的关系进行筛选
                                if (!_.isNaN(minFrequency)) {
                                    matched = frequency >= minFrequency;
                                }
                                if (matched && !_.isNaN(maxFrequency)) {
                                    matched = frequency <= maxFrequency;
                                }
                            } else {
                                // matched = true;
                            }
                        }
                        if (!matched) {
                            relatedNodes[item.to] ? relatedNodes[item.to].push(item.id) : relatedNodes[item.to] = [item.id];
                            relatedNodes[item.from] ? relatedNodes[item.from].push(item.id) : relatedNodes[item.from] = [item.id];
                        }
                        if (matched && nodeIds.length > 0) {
                            matched = _.find(nodeIds, function(id) {
                                return id === item.from || id === item.to;
                            }) == undefined;
                        }
                        return !matched;
                    }
                });
            }
            // 与某节点连接的所有边都被筛选掉以后，该节点也将被筛选掉
            var nodes = [];
            _.each(relatedNodes, function (edges, nodeId) {
                if (allConnectedNodes[nodeId].length == edges.length) {
                    nodes.push(nodeId);
                }
            });
            filteredNodes = _.union(filteredNodes, nodes);

            filteredEdges = edgeIds;
        }

        function filterElements() {
            var nodeUpdateParams = [];

            _.each(filteredNodes, function(nodeId) {
                var node = nodeData.get(nodeId);
                var changes;
                if (filterMode == 'hide') {
                    changes = {
                        hidden: true
                    };
                } else if (filterMode == 'translucent') {
                    var origColor = node.icon.color;
                    changes = {
                        icon: $.extend({}, node.icon, {
                            color: ColorUtils.toRgba(origColor, 0.3)
                        })
                    }
                }
                nodeUpdateParams.push($.extend({
                    id: nodeId
                }, changes));
            });
            nodeData.update(nodeUpdateParams);

            var edgeUpdateParams = [];
            _.each(filteredEdges, function(edgeId) {
                var changes;
                if (filterMode == 'hide') {
                    changes = {
                        hidden: true
                    };
                } else {
                    var origColor = edgeData.get(edgeId).color;
                    if (origColor) {
                        changes = {
                            color: $.extend({}, origColor, {
                                color: ColorUtils.toRgba(origColor.color, 0.3)
                            })
                        };
                    }
                }

                edgeUpdateParams.push($.extend({
                    id: edgeId
                }, changes));
            });
            edgeData.update(edgeUpdateParams);
        }

        function setupNodeIcons(girdContainer, icons) {
            var rowContainer;
            var gridItem;
            _.each(Object.keys(icons), function(type, index) {
                if (index % 4 == 0) {
                    rowContainer = $('<div class="col-md-12 mb10"></div>');
                    girdContainer.append(rowContainer);
                }

                gridItem = $('<span class="icon-node-type fa fs24 col-md-3"></span>');
                var iconCfg = icons[type];
                //gridItem.prop('data-original-title', iconCfg.);
                gridItem.addClass(iconCfg.name);
                gridItem.attr("title", iconCfg.caption);
                gridItem.prop('data-type', type);
                rowContainer.append(gridItem);
            });
            $('.icon-node-type').click(function() {
                $(this).toggleClass('text-primary');
            });
        }



        return {
            config: config,
            cancelFiltration: cancelFiltration
        };
    });