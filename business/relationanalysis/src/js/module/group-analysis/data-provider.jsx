import {store, MODE} from './store';
import NovaUtils from 'nova-utils';
import Notify from 'nova-notify';
import {getGeoString, getIconNameOfType} from './icon-config.js'

const PEOPLE_LIMIT = 50;
const ENTITY_NODE_LIMIT = 10;

const colors = {
    blue:   "#36dec7",
    orange: "#f0862d",
    green:  "#C8DA2B",
    gray:   "#888",
    white:  "#F5F5F5",
    stroke: "#888",
    activeStroke: "rgb(120, 131, 240)",
    activeFill: "#66FAC1"
};

export default class DataProvider {
    constructor(mode) {
        this.mode = mode;
    }

    setMetadata(metadata) {
        this.metadata = metadata;
    }

    peopleData(relationData){
        this.people = getPeopleNodes(relationData);
        return this.people;
    }

    entityData(relationData){
        this.entity = getEntityNodesLinks(relationData);
        return this.entity;
    }


    changeEntityNodesLinks(relationData ,types){
        var entityTypes = types.entity;
        var relationTypes = types.relation;


        let newEntityTypes = {};
        _.each(entityTypes ,(item) =>{
            newEntityTypes[item] = true;
        })


        let newRelationTypes = {};
        _.each(relationTypes ,(item) =>{
            newRelationTypes[item] = true;
        })

        let entity = [];
        if(_.isEmpty(types.entity)){
            entity = []
        } else {
            entity = _.filter(relationData.nodes.nodes , (item)=>{
                let type = JSON.stringify(item.nodeType)
                return newEntityTypes[type];
            })
        }


        let entityEdges = [];


        _.each(relationData.nodes.edges , (edges) => {
            if(newRelationTypes[edges.types]){
                entityEdges.push(edges)
            }
        })


        var data={
            nodes:{
                nodes:entity,
                edges:entityEdges,
            }
        }


        return this.filterEntity = getEntityNodesLinks(data);

    }

    changePeopleNodesLinks(relationData ,types){


        var relationTypes = types.relation;

        let personEdges =[];
        _.each(relationTypes , (item)=>{
            _.each(relationData.persons.edges , (edges) => {
                if(_.contains(edges.types,JSON.parse(item))){
                    personEdges.push(edges)
                }
            })
        })

        let personIds = {};
        _.each(personEdges , (edges)=>{
            personIds[edges.fromPersonId] = true;
            personIds[edges.toPersonId] = true;
        })

        let persons =[];
        persons=_.filter(relationData.persons.persons , (person) => {
            return personIds[person.personId];
        })


        var preId = "";

       var data={
           persons:{
               persons:persons,
               edges:personEdges,
           }
       }

        return this.filterPeople = getPeopleNodes(data);
    }


    loadAnalysisData() {
        switch (this.mode) {
            case MODE.COHESION:
                var entityId = NovaUtils.getURLParameter('entityid');
                var entityType = NovaUtils.getURLParameter('entitytype');
                var startTime = NovaUtils.getURLParameter('starttime');
                var endTime = NovaUtils.getURLParameter('endtime');
                $.get('/relationanalysis/personrelationexplore/analysisData', {
                    entityId, entityType, startTime, endTime
                }, rsp=>{
                    if (rsp.code == 0) {
                        rsp.data = arrangeData(rsp.data);
                        this.data = rsp.data;
                        store.dispatch({type: 'DATA_FETCHED', source: this.mode, data: rsp.data});
                    } else {
                        Notify.simpleNotify('错误', rsp.message, 'error');
                    }
                }, 'json');
                break;

            case MODE.MULTI_TARGET:
                let startTime = localStorage.getItem("startTime");
                let endTime = localStorage.getItem("endTime");
                let contactLevel= localStorage.getItem("contactLevel");
                let entityList= localStorage.getItem("entityList");
                let nodes = JSON.parse(entityList);
                let filterTypeList = JSON.parse(localStorage.getItem("filterTypeList"));
                $.get('/relationanalysis/personrelationexplore/analyzeMultiEntitiesRelation', {
                    contactLevel, nodes, startTime, endTime,filterTypeList
                }, rsp=>{
                    if (rsp.code == 0) {
                        rsp.data = arrangeMultiData(rsp.data);
                        this.data = rsp.data;
                        store.dispatch({type: 'DATA_FETCHED', source: this.mode, data: rsp.data});
                    } else {
                        Notify.simpleNotify('错误', rsp.message, 'error');
                    }
                }, 'json');
                break;
        }
    }

    getAnalysisData() {
        return this.data;
    }

    /**
     * 通过key获取原始数据
     * @param key 键值
     * @param personOrEntity 0——人物，1——实体
     * @param type 类型，"node"或"link"
     */
    getDataByKey(key, personOrEntity, type) {

    }



    getTableData(relationData, isEntityNodes) {
        var nodeList = [], columns;
        if (isEntityNodes) {
            _.each(relationData.nodes, (node) => {
                _.each(node.nextLevelNodes, (nextNode) => {
                    nextNode.nodeTypeLabel = this.metadata.entityMeta[node.nodeType];
                    nodeList.push(nextNode);
                });
                node.nodeTypeLabel = this.metadata.entityMeta[node.nodeType];
                nodeList.push(node);
            });
            columns = [{key: 'key', text: '实体ID'}, {key: 'nodeTitle', text: '标题'},
                {key: 'nodeTypeLabel', text: '实体类型'}, {key: 'linkScore', text: '亲密度'}];
        } else {
            nodeList = _.sortBy(relationData.persons, function (people) {
                return -people.totalScore;
            });

            nodeList = _.filter(nodeList, function (item) {
                return item.totalScore != -1;
            })

            _.each(nodeList , (item) =>{
                item.nodesDetail='';
                _.each(item.nodes , (node) =>{
                    item.nodesDetail +=  node.nodeId + '(' + this.metadata.entityMeta[node.nodeType] + ')' + (item.nodes.length == 1 ? '' : ' , ');
                })
            })

            columns = [ {key: 'personName', text: '姓名'}, {key: 'totalScore', text: '亲密度'} , {key: 'nodesDetail', text: '实体'}];
        }

        return {nodes: nodeList, columns};
    }

    getTargetTableData(relationData,isEntityNodes,selectData){
        var nodeList = [],columns;
        if(isEntityNodes){
            selectData = selectData.entity;
            if(_.isEmpty(selectData)){
                nodeList = relationData.nodes.nodes; 
            }  
            else
            {
                _.each(selectData[0],(node) =>{
                    nodeList.push(node.data);
                });
            }
            _.each(nodeList,(node)=>{
                node.nodeTypeLabel = this.metadata.entityMeta[node.nodeType];
            });          
            columns = [{key: 'nodeId', text: '实体ID'}, {key: 'nodeTitle', text: '标题'},
                {key: 'nodeTypeLabel', text: '实体类型'}, {key: 'personId', text: '人物ID'}];

        }else{
            selectData = selectData.people;
            if(_.isEmpty(selectData)){
                nodeList = relationData.persons.persons;
            }  
            else
            {
                _.each(selectData[0],(node) =>{
                    nodeList.push(node.data);
                });
            } 
            _.each(nodeList, (item) =>{
                if(!item.nodesDetail){
                    item.nodesDetail='';
                }
                _.each(item.nodes, (node) =>{
                    item.nodesDetail += node.nodeId + '(' + this.metadata.entityMeta[node.nodeType] + ')' + ',';
                })
                item.nodesDetail = item.nodesDetail.length > 0 ?   item.nodesDetail.substring(0,item.nodesDetail.length-1) : item.nodesDetail;
            })
            columns=[  {key: 'personName', text: '姓名'}, {key: 'nodesDetail', text: '实体'}];

        }
        return {nodes: nodeList, columns};

    }
}

function generateLinkKey(from, to) {
    return from < to ? from + '-' + to : to + '-' +  from
}

function getPeopleNodes(relationData) {
    var peoples = relationData.persons;
    // console.log(peoples)
    var nodeDataArray = [];
    var linkDataArray = [];
    // var center = _.find(peoples, (person)=> {
    //     return person.isCenter == true;
    // });
    var preId = "";
    var color_num = 192;
    var gap = Math.floor(100/peoples.length);
    if(gap == 0){
        gap = 1;
    }
    _.each(peoples.persons, (person)=> {


        var node_color = "#6B96FF";

        color_num = color_num - gap;
        if(person.isInit)
        {
            nodeDataArray.push({
                key: person.personId,
                text: person.personName,
                color: colors.orange,
                geo: "cert",
                hoverColor : colors['orange'],
                personDegree:person.personDegree,
                data: person,
                visible:true,
                isInit:true
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
    _.each(peoples.edges , (edges) =>{
        linkDataArray.push({
            key: generateLinkKey(edges.fromPersonId,edges.toPersonId),
            from: edges.fromPersonId,
            to:  edges.toPersonId,
            data: edges,
            visible:true
        })
    })
    return {
        nodes: nodeDataArray,
        links: linkDataArray
    };
}


function arrangeMultiData(analysisData) {
    console.log(analysisData)

    var peoples , entities ;

    //人物数据

    peoples = analysisData.personInfo;


    _.each(peoples.persons,function(person,key){
        person.key = person.personId;
    });


    _.each(peoples.edges,function(edges){
        edges.key = generateLinkKey(edges.fromPersonId,edges.toPersonId);
        let types = [];
        _.each(edges.linkDetail , (item)=>{
            types.push(item.linkedType);
        })
        edges.types = _.union(types);

    });


    var selectPersonId = {};
    _.each(peoples.persons , (persons) =>{
        selectPersonId[persons.personId]=true;
    })



    //实体数据

    entities = analysisData.nodeInfo;

    _.each(entities.nodes,function(node,key){
        node.key = node.nodeId;
    });



    _.each(entities.edges,function(edges,key){
        edges.key = generateLinkKey(edges.fromNodeId, edges.toNodeId);
        let types = [];
        _.each(edges.linkDetail , (item)=>{
            types.push(item.linkedType);
        })
        edges.types = _.union(types);
    });


    entities.nodes=_.filter(entities.nodes , (nodes) => {
        return selectPersonId[nodes.personId];
    })


    var nodeEdges = {};
    _.each(entities.nodes , (nodes) =>{
        nodeEdges[nodes.nodeId] = true;
    })

    entities.edges=_.filter(entities.edges , (edges) => {
        return nodeEdges[edges.toNodeId] && nodeEdges[edges.fromNodeId];
    })


    return {
        persons: peoples,
        nodes: entities
    };

}

function arrangeData(analysisData) {
    var peoples, entities, center;
    peoples = _.sortBy(analysisData.persons, function (people) {
        people.key = people.personId;
        if (people.isCenter) {
            center = people;
        }
        return -people.totalScore;
    });
    if (peoples && peoples.length > PEOPLE_LIMIT) {
        peoples = peoples.slice(0, PEOPLE_LIMIT + 1);
        if (center) {
            peoples[PEOPLE_LIMIT] = center;
        }
    }
    entities = _.map(analysisData.nodes, node=>{
        node.key = node.nodeId;
        node.isCenter = true ;
        var nextNodes = _.sortBy(node.nextLevelNodes, function (next) {
            return -next.linkScore;
        });
        _.each(nextNodes , (item , key) =>{
            item.key =item.nodeId + node.nodeId;
        })
        if (nextNodes && nextNodes.length > ENTITY_NODE_LIMIT) {
            nextNodes = nextNodes.slice(0, ENTITY_NODE_LIMIT);
        }
        return _.extend(node, {nextLevelNodes: nextNodes});
    });
    return {
        persons: peoples,
        nodes: entities
    };
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


function getEntityNodesLinks(relationData , containerId) {
    // console.log(relationData)
    var linkDataArray = [];
    var nodeDataArray = [];


    _.each(relationData.nodes.nodes, (node) => {
        if(node.isInit)
        {
            nodeDataArray.push({
                key: node.nodeType+'-'+node.nodeId,
                text: dealWithNodeTitle(node.nodeTitle),
                geo: getIconNameOfType(node.nodeType).icon,
                color: colors.orange,
                data: node,
                visible:true,
                isInit:true
            });
        }
        else
        {
            nodeDataArray.push({
                key: node.nodeType+'-'+node.nodeId,
                text: dealWithNodeTitle(node.nodeTitle),
                geo: getIconNameOfType(node.nodeType).icon,
                color: "#6B96FF",
                data: node,
                visible:true
            });
        }
    });

    _.each(relationData.nodes.edges , (edges)=>{
        linkDataArray.push({
            key: generateLinkKey(edges.fromNodeType+'-'+edges.fromNodeId, edges.toNodeType+'-'+edges.toNodeId),
            from: edges.fromNodeType+'-'+edges.fromNodeId,
            to: edges.toNodeType+'-'+edges.toNodeId,
            // text: generateLinkTitle(nextNode.linkDetail),
            data: edges,
            visible:true
        });

    })

    nodeDataArray=initEntityGraph(nodeDataArray , containerId);
    return {
        nodes: nodeDataArray,
        links: linkDataArray
    }
}


function initEntityGraph(nodes) {
    if (_.isEmpty(nodes)) {
        return [];
    }
    _.each(nodes, node=>{
        node.width = 80;
    });

    if (nodes && nodes.length > 0) {
        layoutEntitytNodes(nodes);
    }
    return nodes;
}


function layoutEntitytNodes(nodes ) {

    _.each(nodes, node=>{
        var width = node.width;
        node.height = width;
        node.radius = width/2;
        node.visible = true;
        node.position = new go.Point(38.5 - (width/2 - 20), 2.5);
        if (node.data.isExtend){
            node.hoverColor = colors['orange'];
            node.hoverWidth = width;
            node.hoverRadius = width/2;
            node.hoverPosition = new go.Point(38.5 - (width/2 - 20), 2.5);
            node.color=colors['orange'];
        } else {
            node.hoverWidth = width;
            node.hoverPosition = new go.Point(38.5 - (width - 20), 2.5);
            node.hoverRadius = width/2;
        }

    });
    return nodes;

}


