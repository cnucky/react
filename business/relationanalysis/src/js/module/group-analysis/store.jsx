import {getGeoString, getIconNameOfType} from './icon-config.js'
var Redux = require('redux');

const MODE = {
    COHESION: 'cohesion',
    MULTI_TARGET:'target',

    GROUP_PHONE: 'group_phone',
    ALL_COMMUNICATED: 'all_communicated',
    CLOSED_GROUP: 'closed_group'
};

const MODE_CONFIG = {
    COHESION: {
        name: '亲密度',
        icon: 'fa fa-bullseye'
    }, GROUP_PHONE: {
        name: '集团号码',
        icon: 'fa fa-phone'
    }, ALL_COMMUNICATED: {
        name: '全通联群体',
        icon: 'fa fa-group'
    }, MULTI_TARGET: {
        name: '多维度聚类',
        icon: 'fa fa-globe'
    }, CLOSED_GROUP: {
        name: '封闭群体',
        icon: 'fa fa-retweet'
    }
};

function generateLinkKey(from, to) {
    return from < to ? from + '-' + to : to + '-' +  from
}

function dealWithNodeTitle(title){
    var index = title.indexOf('(');
    if(index>0){
        var temp_str = title.split('(');
        var result = temp_str[0]+"\n("+temp_str[1];
        return result;
    }
    return title;
}

function initEntityGraph(nodes) {
    if (_.isEmpty(nodes)) {
        return;
    }
    _.each(nodes, node=>{

        node.width = 45;


    });

    if (nodes && nodes.length > 0) {
        layoutEntitytNodes(nodes );
    }

    return nodes;
}

function layoutEntitytNodes(nodes ) {

    _.each(nodes, node=>{
        var width = node.width;
        node.height = width;
        node.radius = width/2;
        node.position = new go.Point(38.5 - (width/2 - 20), 2.5);
        if (node.data.isInit){
            node.hoverColor = "#f0862d";
            node.hoverWidth = width*2;
            node.hoverRadius = width;
            node.hoverPosition = new go.Point(38.5 - (width/2 - 20), 2.5);
            node.color="#f0862d";
        } else {
            node.hoverWidth = width*2;
            node.hoverPosition = new go.Point(38.5 - (width - 20), 2.5);
            node.hoverRadius = width;
        }

    });
    return nodes;

}

/**
 * store最外层包含一些各分析功能所需的公用数据，如当前的模式curMode，整个分析依赖的元数据metadata
 * 除此外，每一个分析模式对应一个字段，如cohesion对应亲密度，target对应多目标。其中存储了当前模式需要的关系数据及各组件的状态。
 */
const defaultState = {
    curMode: MODE.COHESION,
    cohesion: {
        nodeTableEnabled: false,
        overviewEnabled: true,
        showingEntityRelation: false,
        filterEnabled: false
    },
    target:{
        nodeTableEnabled: false,
        overviewEnabled: true,
        showingEntityRelation: false,
        filterEnabled: false,
        showTree:false,
        selectData:{
            people:[],
            entity:[]
        },
        selectKey:[],
        isTreeButton:true,
        isCheck:false,
        beforeNodeArray:[],
        beforeLinkArray:[],
        entityNodeArray:[],
        entityLinkArray:[],
        refreshGragh:false,
        undo:false,
        outEditState:true,
        isEditState:false,
        shouldGetData:false,
        isFilter:false,
        isInit:false,
        isCircleChoose:false
    },
    group_phone: {
        nodeTableEnabled: false,
        detailPanelEnabled: false
    },
    all_communicated: {
        nodeTableEnabled: false,
        detailPanelEnabled: false
    },
    multidimensional_clustering: {
        nodeTableEnabled: false,
        detailPanelEnabled: false
    },
    closed_group: {
        nodeTableEnabled: false,
        detailPanelEnabled: false
    }
};

function linkPeopleEntity(showingEntityRelation,selectData,analysisData)
{
    let newSelectData = [];

    if(!showingEntityRelation && !_.isEmpty(selectData)){
        let node = [] ; let edgs = [];

        _.each(selectData[0] , (item)=>{
            node.push(item.data);
        })
        _.each(selectData[1] , (item)=>{
            edgs.push(item.data);
        })
        newSelectData = [node,edgs];

        let selectPersonId = {};
        _.each(newSelectData[0] , (item) =>{
            selectPersonId[item.personId] = true;
        })

        newSelectData[0] = _.filter(analysisData.nodes.nodes , (item)=>{
            return selectPersonId[item.personId];
        })

        var selectEdges = {};
        _.each(newSelectData[0] , (item) =>{
            selectEdges[item.nodeId] = true;
        })

        newSelectData[1]=_.filter(analysisData.nodes.edges , (edges) => {
            return selectEdges[edges.toNodeId] && selectEdges[edges.fromNodeId];
        })
        var linkDataArray = [];
        var nodeDataArray = [];
        _.each(newSelectData[0], (node) => {
            if(node.isInit)
            {
                nodeDataArray.push({
                    key: node.nodeType+'-'+node.nodeId,
                    text: dealWithNodeTitle(node.nodeTitle),
                    geo: getIconNameOfType(node.nodeType).icon,
                    color: "#f0862d",
                    data: node,
                    isInit:true,
                    visible:true
                });
            }
            else
            {
                nodeDataArray.push({
                    key: node.nodeType+'-'+node.nodeId,
                    width : 45,
                    text: dealWithNodeTitle(node.nodeTitle),
                    geo: getIconNameOfType(node.nodeType).icon,
                    color: "#6B96FF",
                    data: node,
                    visible:true
                });
            }
        });

        _.each(newSelectData[1] , (edges)=>{
            linkDataArray.push({
                key: generateLinkKey(edges.fromNodeType+'-'+edges.fromNodeId, edges.toNodeType+'-'+edges.toNodeId),
                from: edges.fromNodeType+'-'+edges.fromNodeId,
                to: edges.toNodeType+'-'+edges.toNodeId,
                // text: generateLinkTitle(nextNode.linkDetail),
                data: edges,
                visible:true
            });

        })
        nodeDataArray=initEntityGraph(nodeDataArray);
        newSelectData = [nodeDataArray,linkDataArray];
    }

    if (showingEntityRelation && !_.isEmpty(selectData)){
        let node = [] ; let edgs = [];
        _.each(selectData[0] , (item)=>{
            node.push(item.data);
        })
        _.each(selectData[1] , (item)=>{
            edgs.push(item.data);
        })
        newSelectData = [node,edgs];

        let selectPersonId = {};
        _.each(newSelectData[0] , (item) =>{
            selectPersonId[item.personId] = true;
        })

        newSelectData[0] = _.filter(analysisData.persons.persons , (item)=>{
            return selectPersonId[item.personId];
        })

        var selectEdges = [];
        _.each(newSelectData[0] , (item) =>{
            selectEdges.push(item.personId);
        })

        newSelectData[1]=_.filter(analysisData.persons.edges , (edges) => {
            return _.contains(_.uniq(selectEdges),edges.toPersonId) && _.contains(_.uniq(selectEdges),edges.fromPersonId);
        })
        var linkDataArray = [];
        var nodeDataArray = [];
        var preId = "";
        _.each(newSelectData[0], (person)=> {
            var node_color = "#6B96FF";
            if(person.isInit)
            {
                nodeDataArray.push({
                    key: person.personId,
                    text: person.personName,
                    color: "#f0862d",
                    geo: "cert",
                    hoverColor : "#f0862d",
                    personDegree:person.personDegree,
                    data: person,
                    isInit:true,
                    visible:true
                });
            }
            else
            {
                nodeDataArray.push({
                    key: person.personId,
                    text: person.personName,
                    color: node_color,
                    geo: "cert",
                    personDegree:person.personDegree,
                    data: person,
                    visible:true
                });
            }
            preId = person.personId;
        });
        _.each(newSelectData[1] , (edges) =>{
            linkDataArray.push({
                key: generateLinkKey(edges.fromPersonId,edges.toPersonId),
                from: edges.fromPersonId,
                to:  edges.toPersonId,
                data:edges,
                visible:true
            })
        })
        newSelectData = [nodeDataArray,linkDataArray];
    }
    return newSelectData;
}
var reducer = function(state = defaultState, action) {
    var mode = action.source, newState = {};

    switch(action.type) {
        case 'CHANGE_MODE':
            return _.assign({}, state, {curMode: action.mode});
        case 'TOGGLE_NODE_TABLE': {
            newState[mode] = {...state[mode], nodeTableEnabled: !state[mode].nodeTableEnabled};
            newState[mode].fullscreenOn = false;
            delete newState[mode].detailData;
            return _.assign({}, state, newState);
        }
        case 'ANALYSIS_DATA_LOADED': {
            newState[mode] = {...state[mode], analysisData: state[mode].analysisData};
            return _.assign({}, state, newState);
        }
        case 'TOGGLE_PEOPLE_ENTITY': {
            switch(mode){
                case MODE.COHESION:
                    newState[mode] = {...state[mode], showingEntityRelation: !state[mode].showingEntityRelation, nodeTableEnabled: false};
                    break;
                case MODE.MULTI_TARGET:
                    newState[mode] = {...state[mode], showingEntityRelation: !state[mode].showingEntityRelation, nodeTableEnabled: false, isCheck: false ,refreshGragh:false , outEditState:true ,  isFilter:false , filterEnabled: false , undo:false };
                    break;

            }
            delete newState[mode].detailData;
            return _.assign({}, state, newState);
        }
        case 'TOGGLE_TREE': {
            newState[mode] = {...state[mode], showTree: !state[mode].showTree, nodeTableEnabled: false};
            delete newState[mode].detailData;
            return _.assign({}, state, newState);
        }
        case 'CHECK': {
            newState[mode] = {...state[mode], isCheck: !state[mode].isCheck, nodeTableEnabled: false,  outEditState:true, refreshGragh:false ,  isFilter:false , undo:false };
            delete newState[mode].detailData;
            return _.assign({}, state, newState);
        }
        case 'ADD_TREE_DATA': {
            let newSelectData = [];
            if(state[mode].isInit)
            {
                newState[mode] = {...state[mode],showTree: true, nodeTableEnabled: false, selectData: action.selectData , selectKey: action.selectKey,
                    shouldGetData:false, deletedData:false , refreshGragh:true , undo:false };
                return _.assign({}, state, newState);
            }
            if(state[mode].showingEntityRelation)
            {
                newSelectData = linkPeopleEntity(state[mode].showingEntityRelation, [action.entityNodeArray[action.entityNodeArray.length-1],action.entityLinkArray[action.entityLinkArray.length-1]], state[mode].analysisData);
                action.beforeNodeArray.push(newSelectData[0]);
                action.beforeLinkArray.push(newSelectData[1]);
            }
            else
            {
                newSelectData = linkPeopleEntity(state[mode].showingEntityRelation, [action.beforeNodeArray[action.beforeNodeArray.length-1],action.beforeLinkArray[action.beforeLinkArray.length-1]], state[mode].analysisData);
                action.entityNodeArray.push(newSelectData[0]);
                action.entityLinkArray.push(newSelectData[1]);
            }
            newState[mode] = {...state[mode],  nodeTableEnabled: false, selectData: action.selectData , selectKey: action.selectKey,
                beforeNodeArray:action.beforeNodeArray, beforeLinkArray:action.beforeLinkArray, entityNodeArray:action.entityNodeArray, entityLinkArray:action.entityLinkArray,
                shouldGetData:false, deletedData:false , refreshGragh:true, isEditState:true, isTreeButton:false,  isFilter:false , undo:false };

            return _.assign({}, state, newState);
        }
        case 'UNDO_SELECT_DATA':{
            let nodeDataArray = [];
            let linkDataArray = [];
            let beforeNodeArray = state[mode].beforeNodeArray;
            let beforeLinkArray = state[mode].beforeLinkArray;
            let entityNodeArray = state[mode].entityNodeArray;
            let entityLinkArray = state[mode].entityLinkArray;
            if(!state[mode].showingEntityRelation){
                if(beforeNodeArray!=null || beforeLinkArray!=null)
                {
                    nodeDataArray = beforeNodeArray.pop();
                    linkDataArray = beforeLinkArray.pop();
                    let selectData = state[mode].selectData;
                    selectData.people = [nodeDataArray,linkDataArray];
                    selectData.entity = [entityNodeArray.pop(),entityLinkArray.pop()];

                    // entityNodeArray.pop();
                    // entityLinkArray.pop();
                    if(beforeNodeArray.length == 0 && beforeLinkArray.length == 0)
                    {
                        newState[mode] ={...state[mode],  selectData:selectData, beforeNodeArray:beforeNodeArray, beforeLinkArray:beforeLinkArray , isEditState:false , refreshGragh:true , outEditState: false,};
                        return _.assign({}, state, newState);
                    }
                    else
                    {
                        newState[mode] ={...state[mode],  selectData:selectData, beforeNodeArray:beforeNodeArray, beforeLinkArray:beforeLinkArray,refreshGragh:true};
                        return _.assign({}, state, newState);
                    }
                }
            }
            else
            {
                if(entityNodeArray!=null || entityLinkArray!=null)
                {
                    nodeDataArray = entityNodeArray.pop();
                    linkDataArray = entityLinkArray.pop();
                    // beforeNodeArray.pop();
                    // beforeLinkArray.pop();
                    let selectData = state[mode].selectData;
                    selectData.entity = [nodeDataArray,linkDataArray];
                    selectData.people = [beforeNodeArray.pop(),beforeLinkArray.pop()];
                    if(entityNodeArray.length == 0 && entityLinkArray.length == 0)
                    {
                        newState[mode] ={...state[mode],  selectData:selectData, entityNodeArray:entityNodeArray, entityLinkArray:entityLinkArray,undo:true,refreshGragh:true, isEditState:false , outEditState: false,};
                        return _.assign({}, state, newState);
                    }
                    else
                    {
                        newState[mode] ={...state[mode],  selectData:selectData, entityNodeArray:entityNodeArray, entityLinkArray:entityLinkArray,undo:true,refreshGragh:true};
                        return _.assign({}, state, newState);
                    }
                }
            }
        }
        case 'METADATA_FETCHED': {
            return _.assign({}, state, {metadata: action.data});
        }
        case 'TOGGLE_OVERVIEW': {
            newState[mode] = {...state[mode], overviewEnabled: !state[mode].overviewEnabled};
            return _.assign({}, state, newState);
        }
        case 'DATA_FETCHED':
            newState[mode] = {...state[mode], analysisData: action.data , isFilter:true};
            hideLoader();
            return _.assign({}, state, newState);
        case 'NODE_SELECTED':
            newState[mode] = {...state[mode], detailData: action.data, shouldGetData:false, refreshGragh:false , isFilter:false , undo:false };
            newState[mode].fullscreenOn = false;
            newState[mode].filterEnabled = false;
            newState[mode].refreshGragh = false;
            newState[mode].outEditState = true;
            return _.assign({}, state, newState);
        case 'LINK_SELECTED':
            newState[mode] = {...state[mode], detailData: action.data,refreshGragh:false, isFilter:false , undo:false };
            newState[mode].fullscreenOn = false;
            newState[mode].refreshGragh = false;
            newState[mode].outEditState = true;
            newState[mode].filterEnabled = false;
            return _.assign({}, state, newState);
        case 'CLOSE_DETAIL_PANEL':
            newState[mode] = {...state[mode]};
            delete newState[mode].detailData;

            return _.assign({}, state, newState);
        case 'TOGGLE_ENTITY_FILTER':
            newState[mode] = {...state[mode], filterEnabled: !state[mode].filterEnabled,refreshGragh:false , outEditState:true,  isFilter:false , undo:false };
            return _.assign({}, state, newState);

        case 'DATA_FILTER':
            newState[mode] = {...state[mode], filterTypes: action.filterTypes, filterEntityData: action.filterEntityData ,filterPeopleData: action.filterPeopleData ,refreshGragh:false ,  isFilter:true , undo:false };
            return _.assign({}, state, newState);
        case 'TOGGLE_FULL_SCREEN':
            newState[mode] = {...state[mode]};
            if (!newState[mode].fullscreenOn) {
                newState[mode].overviewEnabled = false;
                newState[mode].filterEnabled = false;
                newState[mode].nodeTableEnabled = false;
                if (mode == MODE.COHESION) {
                    delete newState[mode]['detailData'];
                }
            } else {
                newState[mode].overviewEnabled = true;
            }
            newState[mode].fullscreenOn = !newState[mode].fullscreenOn;
            return _.assign({}, state, newState);
        case 'FLASH':
            return _.assign({}, state, newState);
        case 'CLOSE_NODE_TABLE':
            newState[mode] = {...state[mode], nodeTableEnabled: false, refreshGragh:false , outEditState: true, shouldGetData:false ,  isFilter:false , undo:false };
            return _.assign({}, state, newState);

        case 'CHANGE_EDIT_STATE':
            newState[mode] = {...state[mode], isEditState:!state[mode].isEditState, isTreeButton:!state[mode].isTreeButton,refreshGragh:false, isFilter:false , isCircleChoose:false, outEditState: false, shouldGetData:false, deletedData:false , filterEnabled: false , undo:false };
            return _.assign({}, state, newState);
        case 'GET_SELECT_DATA':
            var isInit = action.isInit ? true : false;
            newState[mode] = {...state[mode], shouldGetData:true, isInit:isInit};
            return _.assign({}, state, newState);
        case 'DELETED_SELECT_DATA':
            newState[mode] = {...state[mode], deletedData:true};
            return _.assign({}, state, newState);
        case 'CHANGE_SELECT_DATA':
            newState[mode] = {...state[mode], selectData:action.selectData};
            return _.assign({}, state, newState);
        case 'CIRCLE_CHOOSE':
            newState[mode] = {...state[mode], isCircleChoose:!state[mode].isCircleChoose, refreshGragh:false ,  isFilter:false , undo:false };
            return _.assign({}, state, newState);
        default:
            return state;
    }
};


var store = Redux.createStore(reducer);

export {store, MODE, MODE_CONFIG};