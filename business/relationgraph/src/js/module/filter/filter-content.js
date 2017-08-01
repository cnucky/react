define('./filter-content', ['../../tpl/relationship/tpl-filter-panel-new', 'utility/color-util/color-util', 'nova-notify', '../relationgraph/relationship-utils'],
    function(tplFilter, ColorUtils, Notify, Utils) {
        tplFilter = _.template(tplFilter);

        var nodeData, edgeData, filteredNodes = [],
            countFrequency = Utils.countFrequency,
            filteredEdges = [];

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

            setupNodeIcons(container.find('#node-grid'), cfg.nodeIcons);
            setupGraphIcons(container.find('#graph-grid'), cfg.nodeGraphs);
            $('select#select-mode').val('2');
            $('#min-frequency-new').hide();
            $('#max-frequency-new').hide();
            $('#frequency-new').show();
            $('#button-filter-new').click(function() {
                doFilter();
            });
            $('#button-recovery-new').click(function() {
                cancelFiltration();
            });

            $('#select-node-all').on('click',function(){
                var getIcons = $('.icon-node-type-new');
                for(var i=0,lth=getIcons.length; i<lth; i++){
                    if(!$(getIcons[i]).hasClass('text-primary')){
                        $(getIcons[i]).addClass('text-primary');
                    }
                }
            });
            $('#select-node-reverse').on('click',function(){
                var getIcons = $('.icon-node-type-new');
                for(var i=0,lth=getIcons.length; i<lth; i++){
                    if(!$(getIcons[i]).hasClass('text-primary')){
                        $(getIcons[i]).addClass('text-primary');
                    }else{
                        $(getIcons[i]).removeClass('text-primary');
                    }
                }
            });
            $('#select-graph-all').on('click',function(){
                var getGraphs = $('input[name=graphMode]');
                for(var i=0,lth=getGraphs.length; i<lth; i++){
                    if(!$(getGraphs[i]).prop('checked')){
                        $(getGraphs[i]).prop('checked',true);
                    }
                }
            });
            $('#select-graph-reverse').on('click',function(){
                var getGraphs = $('input[name=graphMode]');
                for(var i=0,lth=getGraphs.length; i<lth; i++){
                    if(!$(getGraphs[i]).prop('checked')){
                        $(getGraphs[i]).prop('checked',true);
                    }else{
                        $(getGraphs[i]).prop('checked',false);
                    }
                }
            });


            $('select#select-mode').on('change',function(){
                if($('select#select-mode').val()=='4' || $('select#select-mode').val()=='5'){
                    $('#min-frequency-new').show();
                    $('#max-frequency-new').show();
                    $('#frequency-new').hide();
                }else{
                    $('#min-frequency-new').hide();
                    $('#max-frequency-new').hide();
                    $('#frequency-new').show();
                }
            });

            //add by zhangu
            $('#min-frequency-new').on('blur', function() {
                var minvalue = parseInt($('#min-frequency-new').val());
                var maxvalue = parseInt($('#max-frequency-new').val());
                if (!_.isNaN(minvalue)) {
                    if(minvalue < 0){
                        $('#min-frequency-new').val(0);
                    }else if(_.isNaN(maxvalue) || minvalue > maxvalue){
                        $('#max-frequency-new').val(minvalue);
                    }
                }
            });

            $('#max-frequency-new').on('blur', function() {
                var minvalue = parseInt($('#min-frequency-new').val());
                var maxvalue = parseInt($('#max-frequency-new').val());
                if (!_.isNaN(maxvalue)) {
                    if(maxvalue < 0){
                        !_.isNaN(minvalue)?$('#max-frequency-new').val(minvalue):$('#max-frequency-new').val(0)
                    }else if(!_.isNaN(minvalue) && minvalue > maxvalue){
                        Notify.show({
                            title: '数值大小次序不能颠倒!',
                            type: 'warning'
                        });
                        $('#min-frequency-new').val(null);
                    }
                }
            });
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

            var minFrequency = parseInt($('#min-frequency-new').val());
            var maxFrequency = parseInt($('#max-frequency-new').val());

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
                if(node.hidden){
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
                if(edge.hidden){
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
            var nodeTypes = _.map($('.icon-node-type-new.text-primary'), function(typeButton) {
                return parseInt($(typeButton).prop('data-type'));
            });
            var graphTypes = _.map($('input[name=graphMode]:checked'), function(item){
                return parseInt($(item).prop('id'));
            })
            console.log(graphTypes,'ssssssssssssss');

            var keyword = $('#filter-keyword-new').val().trim();

            var nodeIds = [];
            if (nodeTypes.length > 0 || graphTypes.length > 0 || !_.isEmpty(keyword)) {
                nodeIds = nodeData.getIds({
                    filter: function(item) {
                        var matched = true;
                        if (nodeTypes.length > 0) {
                            matched = _.contains(nodeTypes, parseInt(item.nodeType));
                        }
                        if (graphTypes.length > 0) {
                            matched = _.contains(graphTypes, parseInt(item.nodeType));
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
            var getFrequency = $('select#select-mode').val();
            var midFrequency = parseInt($('#frequency-new').val());
            var minFrequency = parseInt($('#min-frequency-new').val());
            var maxFrequency = parseInt($('#max-frequency-new').val());
            var edgeIds = [], nodeIds = filteredNodes, allConnectedNodes = {}, relatedNodes = {};
             switch(getFrequency){
                 case '0':
                     break;
                 case '1':
                     break;
                 case '2':
                     break;
                 case '3':
                     break;
                 case '4':
                     filterFrequency(minFrequency,maxFrequency);
                     break;
                 case '5':
                     break;
             }




        }

        function filterFrequency(minFrequency,maxFrequency){
            var edgeIds = [], nodeIds = filteredNodes, allConnectedNodes = {}, relatedNodes = {};
            // allConnectedNodes是所有有边连接的点，relatedNodes是其中会被此次边的筛选影响到的节点
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
                var changes = {
                    hidden: true
                };
                nodeUpdateParams.push($.extend({
                    id: nodeId
                }, changes));
            });
            nodeData.update(nodeUpdateParams);

            var edgeUpdateParams = [];
            _.each(filteredEdges, function(edgeId) {
                var changes = {
                    hidden: true
                };

                edgeUpdateParams.push($.extend({
                    id: edgeId
                }, changes));
            });
            edgeData.update(edgeUpdateParams);
        }

        function setupNodeIcons(girdContainer, icons) {
            var rowContainer;
            var gridItem;
            var gridSpan;
            _.each(Object.keys(icons), function(type, index) {
                if (index % 4 == 0) {
                    rowContainer = $('<div class="col-md-12 mb16"></div>');
                    girdContainer.append(rowContainer);
                }

                var iconCfg = icons[type];
                gridItem = $('<div  class="icon-node-type-new col-md-3 mt10" style="padding:0;text-align:center" data-type="'+ type +'"></div>');
                gridSpan = $('<span class="fa fs18"><br/><span class="fs12">'+ iconCfg.caption+'</span></span>');
                gridSpan.addClass(iconCfg.name);
                gridItem.append(gridSpan);
                rowContainer.append(gridItem);
            });
            $('.icon-node-type-new').click(function() {
                $(this).toggleClass('text-primary');
            });
        }

        function setupGraphIcons(girdContainer, graphs) {
            var rowContainer;
            var gridItem;
            _.each(graphs, function(type, index) {
                if (index % 2 == 0) {
                    rowContainer = $('<div class="col-md-12 mb16"></div>');
                    girdContainer.append(rowContainer);
                }

                gridItem = $('<div class="graph-node-type col-md-6 checkbox-custom mt10" style="padding:0;margin-right:-16px;margin-left:16px"><input name="graphMode"  type="checkbox" id="'+
                    type.value +'"/> <label for="'+type.value +'">'+ type.label +'</label></div>');
                rowContainer.append(gridItem);
            });

        }



        return {
            config: config,
            cancelFiltration: cancelFiltration
        };
    });