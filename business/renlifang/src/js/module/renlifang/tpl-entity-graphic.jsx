import React from 'react';
import { Collapse, Tabs, Spin} from 'antd';
var redux = require('redux');
require('../../module/renlifang/styles.less');
// import {store} from '../../module/renlifang/store';
var NetworkConfig = require('./relationship-network-config');
const Notify = require('nova-notify');
var Cacher = require('utility/cacher');
var loaders = require('utility/loaders');
var network, dataSet = {}, nodeDetailContainer;
var _personData;
var srcEntityType = 11;var srcEntityId = '417876446_11';
// var tplEntityDetail = require('../../tpl/rlf/tpl-entity-detail');
// tplEntityDetail = _.template(tplEntityDetail);

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;


var nodes = new vis.DataSet();
var edges = new vis.DataSet();

var data=null;

var reducer = function(state, action) {
    var newState = {}
    switch (action.type) {
        case 'ENTITY_DATA':
            newState.entityData = action.entityData
            return _.assign({}, state, newState);

        default:
            return state;
    }
}
var store = redux.createStore(reducer);

export default class EntityGraphic extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            hide:'hide',
            entityLoder: false,
            entityData: {}
        }
    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });
        let infoGroup = this.props.infoGroup;
        this.initNetwork();
        dataSet = this.constructEntityData(infoGroup.children[0].nodes,infoGroup.children[0].edges)
        network.setData({
            nodes: dataSet.nodes,
            edges: dataSet.edges
        });
        network.fit();
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    initNetwork() {
        var container = document.getElementById('entityGraphic');
        if (network) {
            network.destroy();
        }
        network = new vis.Network(container, {}, {
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
            layout: {
                hierarchical: {
                    direction: "UD"
                }
            },
            physics: {
                enabled: true,
                hierarchicalRepulsion: {
                    nodeDistance: 160
                }
            }
        });

        network.on('click',  onNetworkClick);
        network.on('selectEdge',  function (params) {
            console.log('aaa')

        });



    }

    constructEntityData(nodeinfo, edgeinfo) {


        _.each(nodeinfo, function(item) {
            // 搜索的两个实体节点设为 fixed
            var nodeItem;
            if ((item.nodeId + item.nodeType) === (srcEntityId + srcEntityType) ) {
                nodeItem = _.extend({}, item, { fixed: true, nodeId: item.nodeId + '_' + item.nodeType });
            } else {
                nodeItem = _.extend({}, item, { fixed: false, nodeId: item.nodeId + '_' + item.nodeType });
            }
            nodeItem.keyword = item.nodeId;
            nodes.add(generateNode(nodeItem, 'nodeId', 'nodeTitle'));

        });
        dataSet.nodes = nodes;

        _.each(edgeinfo, function(item) {

            var id = [item.fromNodeId,item.fromNodeType,item.toNodeId, item.toNodeType].join('_');

            var preEdge = edges.get(id);

            var edgeItem
            if (preEdge === null) {
                edgeItem = _.extend({ id: id }, item);
                edges.add(generateEntityEdge(edgeItem, 'fromNodeId', 'toNodeId'));

            } else {
                edges.update({ id: id, title: preEdge.title + ', ' + item.linkedTitle.toString() });
            }
        });
        dataSet.edges = edges;

        return dataSet;
    }


    buildEntityDetail(data) {

        if (_.isEmpty(data)) {
            return;
        }

        return (<Collapse bordered={false} defaultActiveKey={['0']}>
            {_.map(data, (node, index) => {
                var title = '实体' + (index + 1);
                var properties = data[index] ? data[index].properties : [];
                return <Panel className="p6 text-ellipsis" header={title} key={index}>
                    <table className="table detail-table-striped">
                        <tbody>
                        {_.map(properties, (prop)=> {
                            return (<tr>
                                    <td style={{width: '40%'}}>
                                        <span className="fs14 text-nowrap fw600">{prop.key}</span>
                                    </td>
                                    <td className="property-value" style={{width:'60%'}}>
                                        <span>{prop.value}</span>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </Panel>
            })}
        </Collapse>)
    }


    close(){
        $('#entity-detail-panel').addClass('hide');
    }



    render() {
        let infoGroup = this.props.infoGroup;
        var panelStyle = {minHeight: 50,maxHeight: 450, overflowY: 'auto'};
        var tabs = [];
        var storeData = store.getState();
        let entityData = typeof storeData !== 'undefined' && typeof storeData.entityData !== 'undefined' ? storeData.entityData : {}
        tabs.push(<TabPane tab="实体详情" key="1"><div style={panelStyle}>{this.buildEntityDetail(entityData)}</div></TabPane>);

        return <div  style={{height:500}}>

            <div id="entityGraphic"></div>

            <div id="entity-detail-panel" className="hide">

                <div className="flex-layout flex-vertical br-a panel-shadow" style={{background: 'white'}}>
                    <div className="panel-body flex-item flex-layout flex-vertical br-n p10">
                        <Tabs defaultActiveKey="1" type="line" size={(tabs.length < 3)?"default":"small"}>
                            {tabs}
                        </Tabs>
                    </div>
                    <div className="text-center pb10">
                        <span className="btn-round-circle btn-close-detail fa fa-times" onClick={this.close}></span>
                    </div>
                </div>

            </div>
        </div>


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

function generateNode(node, id, label, title) {
    var cfg = getIconByType(node.nodeType);

    // 节点 label 字符过长需要换行
    if (node[label].length > 15) {
        var reConstructLabel = node[label].slice(0, node[label].indexOf('(')) + '\n' + node[label].slice(node[label].indexOf('('));
    } else {
        reConstructLabel = node[label];
    }


    var  generateNode= {}
    if((node.nodeId === srcEntityId && node.nodeType === srcEntityType)){
        generateNode = {
            id: node[id],
            level: node.level,
            label: reConstructLabel,
            title: node[title] || reConstructLabel,
            shape: 'icon',
            color:{
                border:'#ddd'
            },
            shadow:{
                color:'#2384c6',
                x:0,
                y:10
            },
            icon: {
                face: cfg.font,
                code: cfg.code,
                color: "#942a9c",
                size: 40
            },
            font: {
                color: '#942a9c',
                size: 12
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
                size: 12,
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
        from: edge[from] + '_' + edge.fromNodeType,
        to: edge[to] + '_' + edge.toNodeType,
        title: edge.linkedTitle.toString(),
        label:edge.linkedTitle.toString(),
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


function onNetworkClick(params) {
    var selectedNode;
    if (params.nodes[0]) {
        selectedNode = params.nodes[0];
    }

    if (selectedNode) {
        $('#entity-detail-panel').removeClass('hide');
        showNodeDetail(selectedNode);

    } else if (params.edges.length > 0) {
        // 点击了边
        $('#entity-detail-panel').addClass('hide');
    }
}


function showNodeDetail(nodeId) {
    var networkName = $('#entityGraphic').attr('network-mark');
    if (loadCache(networkName,nodeId)) {
        return;
    }

    var node = dataSet.nodes.get(nodeId);

    var loader = loaders($('#entity-node-detail'));

    _.each(node.origNode.nodes,function(item){
        item.keyword = item.nodeId;
    })
    var nodesInfo = networkName==='entityGraphic'?[{
            nodeId: node.id,
            nodeType: node.nodeType,
            keyword: node.origNode.keyword
        }]:node.origNode.nodes;

    $.getJSON('/renlifang/personcore/getnodedetail', { nodes: JSON.stringify(nodesInfo) }, function(rsp) {
        loader.hide();
        if (rsp.code != 0 || !rsp.data) {
            Notify.simpleNotify('详情获取失败', rsp.message, 'error');
            return;
        }
        data=rsp.data;

        Cacher.addCache(networkName+nodeId, rsp.data);

        store.dispatch({type: 'ENTITY_DATA', entityData: data});

    });
}

function loadCache(networkName,nodeId) {
    var cachedData = Cacher.readCache(networkName+nodeId);
    if (cachedData) {
        return true
    }
    return false
}

module.exports = EntityGraphic;