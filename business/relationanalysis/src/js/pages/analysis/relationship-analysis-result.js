initLocales();
//var NetworkConfig = require('module/relationship-analysis-network-config');
var NetworkConfig = require('../../module/relationgraph/relationship-network-config');
var Notify = require('nova-notify');
var Util = require('nova-utils');
var loaders = require('utility/loaders');
var $ = require('jquery');
var _ = require('underscore');
var Q = require('q');
var tplDocument = require('../../tpl/analysis/tpl-relationship-analysis-document');
var tplTable = require('../../tpl/analysis/tpl-relationship-analysis-document-table-content');
tplTable = _.template(tplTable);
var DownPanel = require('../../module/relationship-analysis/relationship-down-panel');

var tplEntityDetail = require('../../tpl/analysis/tpl-entity-detail');
tplEntityDetail = _.template(tplEntityDetail);
var Cacher = require('utility/cacher');

var network, dataSet = {}, nodeDetailContainer , nodes;
var _personData;
var srcEntityType, srcEntityId, dstEntityType, dstEntityId;

srcEntityType = Util.getURLParameter('srcentitytype');
srcEntityId = Util.getURLParameter('srcentityid');
dstEntityType = Util.getURLParameter('dstentitytype');
dstEntityId = Util.getURLParameter('dstentityid');

initNetwork();

getEntityData().then(function(entityData) {
    renderNetwork('entity', entityData.nodes, entityData.edges);

    hideLoader();

    nodeDetailContainer = $('#entity-detail-panel');

    $('#switch-table').on('click', function() {
        if ($('#entity-table').css('display') === 'none') {
            $('#panel-title').text("档案相似度分析");
            $('#switch-table').text("中间人分析");

            $('#entity-div').hide();

            if ($('#entity-table').attr('data-initmark') === "true") {
                $('#entity-table').show();
                initTable();
                $('#entity-table').attr('data-initmark', 'false')
            } else {
                $('#entity-table').show();
            }
        } else {
            $('#panel-title').text("中间人分析");
            $('#switch-table').text("档案相似度分析");
            $('#entity-table').hide();
            $('#entity-div').show();
            renderNetwork('entity', entityData.nodes, entityData.edges, function() {});
        }
    });

    $('#switch-value').on('click', function() {
        if ($('#entity').attr('network-mark') === 'entity') {
            if (_personData === undefined) {
                getPersonData(entityData.nodes).then(function(personData) {
                    renderNetwork('person', personData.persons, personData.edges);
                }).catch(function(error) {
                    Notify.show({
                        title: '获取人物路径出错',
                        message: error.message,
                        type: 'error'
                    })
                })
            } else {
                renderNetwork('person', _personData.persons, _personData.edges);
            }
        } else if ($('#entity').attr('network-mark') === 'person') {
            renderNetwork('entity', entityData.nodes, entityData.edges);
        }
    });
}).catch(function(error) {
    Notify.show({
        title: '获取实体路径出错',
        message: error.message,
        type: 'error'
    });
})

// 下半部份两个面板
DownPanel.init({
    idInfo: "0",
    position: "#position0",
    entityId: srcEntityId,
    entityType: srcEntityType
});

DownPanel.init({
    idInfo: "1",
    position: "#position1",
    entityId: dstEntityId,
    entityType: dstEntityType
});

function getEntityData() {
    var getEntityDefer = Q.defer();

    $.getJSON('/relationanalysis/personrelationexplore/getentityrelation', {
        srcentitytype: srcEntityType,
        srcentityid: srcEntityId,
        dstentitytype: dstEntityType,
        dstentityid: dstEntityId
    }, function(rsp) {
        if (rsp.code !== 0) {
            getEntityDefer.reject(rsp);
        } else {
            getEntityDefer.resolve(rsp.data);
        }
    });

    return getEntityDefer.promise;
}

function getPersonData(nodes) {
    var loader = loaders($('#entity'));
    var getPersonDefer = Q.defer();

    $.post('/relationanalysis/personrelationexplore/getpersonrelation', {
        nodes: JSON.stringify(nodes)
    }, function(rsp) {
        loader.hide();
        if (rsp.code !== 0) {
            getPersonDefer.reject(rsp);
        } else {
            getPersonDefer.resolve(rsp.data);
            _personData = rsp.data;
        }
    }, 'json');

    return getPersonDefer.promise;
}

function renderNetwork(networkmark, nodeinfo, edgeinfo) {
    if (networkmark === 'entity') {
        dataSet = constructEntityData(nodeinfo, edgeinfo);
        $('#entity').attr('network-mark', 'entity');
    } else if (networkmark === 'person') {
        dataSet = constructPersonData(nodeinfo, edgeinfo)
        $('#entity').attr('network-mark', 'person');
    }
    network.setData({
        nodes: dataSet.nodes,
        edges: dataSet.edges
    });
    network.fit();
}

function constructEntityData(nodeinfo, edgeinfo) {
    // create an array with nodes
    nodes = new vis.DataSet();

    // create an array with edges
    var edges = new vis.DataSet();
    _.each(nodeinfo, function(item) {
        // 搜索的两个实体节点设为 fixed
        var nodeItem;
        /*  if ((item.nodeId + item.nodeType) === (srcEntityId + srcEntityType) || (item.nodeId + item.nodeType) === (dstEntityId + dstEntityType)) {
         nodeItem = _.extend({}, item, { fixed: true, nodeId:  item.nodeType + '_' +item.nodeId });
         } else {
         nodeItem = _.extend({}, item, { fixed: false, nodeId: item.nodeType + '_' +item.nodeId});
         }*/
        nodeItem = _.extend({}, item, {nodeId:  item.nodeType + '_' +item.nodeId });
        nodeItem.keyword = item.nodeId;
        nodes.add(generateNode(nodeItem, 'nodeId', 'nodeTitle'));
        //console.log(generateNode(nodeItem, 'nodeId', 'nodeTitle'));
    });
    dataSet.nodes = nodes;

    _.each(edgeinfo, function(item) {
        //console.log(item);
        //var id = [item.fromNodeId,item.fromNodeType,item.toNodeId, item.toNodeType].sort().join('_');
        var id = [item.fromNodeType,item.fromNodeId, item.toNodeType,item.toNodeId].join('_');
        //console.log(id);
        var preEdge = edges.get(id);
        //console.log(preEdge);
        var edgeItem;
        if (preEdge === null) {
            edgeItem = _.extend({}, item, { id: id});
            edges.add(generateEntityEdge(edgeItem, 'fromNodeId', 'toNodeId'));
            //console.log("!!");
        } else {
            edges.update({ id: id, title: preEdge.title + ', ' + item.linkedTitle.toString() });
        }
    });
    dataSet.edges = edges;
    //console.log(dataSet.edges);

    return dataSet;
}

function constructPersonData(nodeInfo, edgeInfo) {
    // create an array with nodes
    nodes = new vis.DataSet();

    // create an array with edges
    var edges = new vis.DataSet();

    _.each(nodeInfo, function(item) {
        // 遍历 persons 里的 nodes，如果包含搜索的两个节点就把这个 person 节点设为fixed
        _.each(item.nodes, function(item1) {
            /*if ((item1.nodeId + item1.nodeType) === (srcEntityId + srcEntityType) || (item1.nodeId + item1.nodeType) === (dstEntityId + dstEntityType)) {
             item = _.extend({ nodeType: 0, fixed: true }, item);
             } else {
             item = _.extend({ nodeType: 0, fixed: false }, item);
             }*/
            item = _.extend({ nodeType: 0}, item);
        });

        // 人物节点的悬浮上去显示节点包含的 persons 里的 nodes 的全部 personName
        var titleArray = [];
        titleArray.push(item.personName);
        // 人物节点的悬浮上去显示节点包含的 persons 里的 nodes 的全部 nodeTitle
        /*   _.each(item.nodes, function(item) {
         titleArray.push(item.nodeTitle);
         });*/
        var nodeItem = _.extend({ titleArray: titleArray.toString() }, item);

        nodes.add(generateNode(nodeItem, 'personId', 'personName', 'titleArray'));
    });
    dataSet.nodes = nodes;

    _.each(edgeInfo, function(item) {
        var id = [item.fromPerson, item.toPerson].sort().join('_');
        var preEdge = edges.get(id);
        if (preEdge === null) {
            var edgeItem = _.extend({ id: id }, item);
            edges.add(generatePersonEdge(edgeItem, 'fromPerson', 'toPerson'));
        } else {
            edges.update({ id: id, title: preEdge.title + ', ' + item.linkedTitle.toString() });
        }
    });
    dataSet.edges = edges;

    return dataSet;
}

function generateNode(node, id, label, title) {
    var cfg = getIconByType(node.nodeType);

    // 节点 label 字符过长需要换行
    if (node[label].length > 15) {
        var reConstructLabel = node[label].slice(0, node[label].indexOf('(')) + '\n' + node[label].slice(node[label].indexOf('('));
    } else {
        reConstructLabel = node[label];
    }



    var  generateNode= {};
    if((node.nodeId == srcEntityType + '_' + srcEntityId && node.nodeType == srcEntityType) || (node.nodeId == dstEntityType + '_' + dstEntityId && node.nodeType == dstEntityType) ){
        generateNode = {
            id: node[id],
            level: node.level,
            label: reConstructLabel,
            title: node[title] || reConstructLabel,
            shape: 'icon',
            shadow:true,
            icon: {
                face: cfg.font,
                code: cfg.code,
                // color: cfg.color,
                color:'#f98d54',
                size: 80
            },
            font: {
                color: '#f98d54',
                size: 16,
            },
            nodeType: node.nodeType,
            origNode: node,
            fixed: node.fixed
        }

    } else {
        generateNode= {
            id: node[id],
            level: node.level,
            label: reConstructLabel,
            title: node[title] || reConstructLabel,
            shape: 'icon',
            icon: {
                face: cfg.font,
                code: cfg.code,
                color: cfg.color,
                size: 34
            },
            font: {
                color: '#8e388e',
                size: 12
            },
            nodeType: node.nodeType,
            origNode: node,
            fixed: node.fixed
        }
    }

    //console.log(getIconByType(node.nodeType));
    //console.log(getIconByType(node.nodeType).code);
    //console.log(node[id]);
    return generateNode;
}

function generateEntityEdge(edge, from, to) {
    return {
        id: edge.id,
        from: edge.fromNodeType + '_' + edge[from],
        to: edge.toNodeType + '_' + edge[to],
        title: edge.linkedTitle.toString(),
        font: {
            align: 'top'
        },
        color: {
            color: '#808080',
            highlight: '#3498db'
        },
        selectionWidth: 1,
        arrowStrikethrough: false
    };
}

function generatePersonEdge(edge, from, to) {
    return {
        id: edge.id,
        from: edge[from],
        to: edge[to],
        title: edge.linkedTitle.toString(),
        font: {
            align: 'top'
        },
        color: {
            color: '#808080',
            highlight: '#3498db'
        },
        selectionWidth: 1,
        arrowStrikethrough: false
    };
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


function initTable() {
    var loader = loaders($('#entity-table'));
    $.getJSON('/relationanalysis/personrelationexplore/getcomparedocument', {
        srcentitytype: srcEntityType,
        srcentityid: srcEntityId,
        dstentitytype: dstEntityType,
        dstentityid: dstEntityId,
        maxnum: 1000
    }, function(rsp) {
        loader.hide();
        if (rsp.code !== 0) {
            $('#entity-table').append('<label class="control-label pln col-md-3">无数据</label>');
        } else {
            var tableContainer = $('#entity-table');
            tableContainer.empty().append(tplDocument);
            renderTable(rsp.data);
        }
    })
}

function renderTable(tableData) {
    var propertiesTable = tplTable({ category: tableData.infomation, compare1: srcEntityId, compare2: dstEntityId });
    $('#table-properties').empty().append(propertiesTable);
    var relationsTable = tplTable({ category: tableData.relationship, compare1: srcEntityId, compare2: dstEntityId });
    $('#table-relations').empty().append(relationsTable);
    var relationspredictTable = tplTable({ category: tableData.relationshipSpeculation, compare1: srcEntityId, compare2: dstEntityId });
    $('#table-relations-predict').empty().append(relationspredictTable);
    var personactionTable = tplTable({ category: tableData.personAction, compare1: srcEntityId, compare2: dstEntityId });
    $('#table-actioninfo').empty().append(personactionTable);
}

function initNetwork() {
    if (network) {
        network.destroy();
    }
    network = new vis.Network($('#entity').get(0), {}, {
        autoResize: true,
        height: '100%',
        width: '100%',
        interaction: {
            hover: false,
            hoverConnectedEdges: false,
            dragNodes: true,
            dragView: true,
            selectable: true,
            selectConnectedEdges: false,
            zoomView: true,
            navigationButtons: true,
            keyboard: true
        },
        physics: {
            enabled: true,
            hierarchicalRepulsion: {
                nodeDistance: 160
            }
        }
    });

    network.on('click', onNetworkClick);

    $('#navigation-up').click(function () {
        network.moveTo({
            offset: {
                x: 0,
                y: -50
            },
            animation: true
        });
    });
    $('#navigation-down').click(function () {
        network.moveTo({
            offset: {
                x: 0,
                y: 50
            },
            animation: true
        });
    });
    $('#navigation-left').click(function () {
        network.moveTo({
            offset: {
                x: -50,
                y: 0
            },
            animation: true
        });
    });
    $('#navigation-right').click(function () {
        network.moveTo({
            offset: {
                x: 50,
                y: 0
            },
            animation: true
        });
    });
}

function onNetworkClick(params) {
    var selectedNode;
    if (params.nodes[0]) {

        selectedNode = params.nodes[0];
        // nodes.update([{
        //     id:selectedNode,
        //     icon: {
        //         color:'rgba(97,195,238,0.5)'
        //     }
        // }]);
    }



    if (selectedNode) {
        nodeDetailContainer.removeClass('hide');

        showNodeDetail(selectedNode)
    } else if (params.edges.length > 0) {
        // 点击了边
        nodeDetailContainer.addClass('hide');
    }
}

function showNodeDetail(nodeId) {
    var networkName = $('#entity').attr('network-mark');
    if (loadCache(networkName,nodeId)) {
        return;
    }

    var node = dataSet.nodes.get(nodeId);

    var loader = loaders($('#entity-node-detail'));

    _.each(node.origNode.nodes,function(item){
        item.keyword = item.nodeId;
    })
    var nodesInfo = networkName==='entity'?[{
            nodeId: node.id,
            nodeType: node.nodeType,
            keyword: node.origNode.keyword
        }]:node.origNode.nodes;


    $.getJSON('/relationanalysis/relationgraph/getnodedetail', {
        nodes: JSON.stringify(nodesInfo)
    }, function(rsp) {
        loader.hide();
        if (rsp.code != 0 || !rsp.data) {
            Notify.simpleNotify('详情获取失败', rsp.message, 'error');
            return;
        }

        Cacher.addCache(networkName+nodeId, rsp.data);

        inflateNodeDetail(rsp.data);
    });
}

function loadCache(networkName,nodeId) {
    var cachedData = Cacher.readCache(networkName+nodeId);
    if (cachedData) {
        inflateNodeDetail(cachedData);
        return true
    }
    return false
}

function inflateNodeDetail(dataList) {
    $('#entity-node-detail').empty();

    _.each(dataList, function(item,index) {
        item.memberIndex = dataList.length > 1 ? index + 1 : 0;

        $('#entity-node-detail').append(tplEntityDetail(item));
    });

    $('#btn-detail-close').click(function (params) {
        nodeDetailContainer.addClass('hide');
    });
}



//拉伸面板------
(function() {
    var lastY;
    $('#right-panel-splitter').draggable({
        cursor: "s-resize",
        axis: 'y',
        distance: 10,
        containment: '#content',
        scorll: false,
        start: function (event, ui) {
            $('#right-panel-splitter').addClass('btn-info light');
            lastY = ui.position.top;
        },
        drag: function (event, ui) {
            var deltaY = ui.position.top - lastY;
            lastY = ui.position.top;
            var newHeight = $('#panel-container').height() + deltaY;
            if (newHeight < 150 || newHeight > window.innerHeight / 1.25 ) {
                $('#right-panel-splitter').removeClass('btn-info light');
                event.preventDefault();
                return;
            }
            $('#panel-container').height(newHeight);
        },
        stop: function (event, ui) {
            var deltaY = ui.position.top - lastY;
            lastY = ui.position.top;
            var newHeight = $('#panel-container').height() + deltaY;
            $('#panel-container').height(newHeight);

            $('#right-panel-splitter').removeClass('btn-info light').css({
                top: 'auto',
                bottom: 0
            });
        }
    });
} ());

