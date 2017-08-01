import React from 'react';

import {getGeoString, getIconNameOfType} from './icon-config.js'
import {MODE, store} from './store';
import {SpiralLayout} from './SpiralLayout.js';
import {hslToRgb,rgbToHsl} from 'utility/color-util/color-util';

const Notify = require('nova-notify');

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

var goMake = go.GraphObject.make;

const layerThickness = 100;
const MIN_LAYER = 3, MAX_LAYER = 7;

var selectedObjs = [];
var centerId;

export default class GraphZone extends React.Component {
    constructor(props) {
        super(props);

        var timestamp = Date.now();
        this.zoneId = 'gojs-container#' + timestamp;
        this.overviewId = 'overview#' + timestamp;
        this.onIconClick = this.changeSelection.bind(this);
        this.entityClick =  this.changeEntitySelection.bind(this);
    }

    componentDidUpdate() {
        if (!this.props.data) {
            return;
        }

        switch (this.props.mode) {
            case MODE.COHESION:
                // TODO yaco 待优化
                if(this.props.types != null)
                {

                    var nodesAndLinks = changeEntityNodesLinks(this.props.data,this.props.types);
                    // myDiagram.model.nodeDataArray = nodesAndLinks.nodes;
                    // myDiagram.model.linkDataArray = nodesAndLinks.links;
                    // console.log("this.entityDiagram.model.nodeDataArray");
                    // console.log(this.entityDiagram.model.nodeDataArray);
                    // console.log(nodesAndLinks.nodes);
                    _.each(this.entityDiagram.model.nodeDataArray, (node) =>{
                        var canfind = false;
                        _.each(nodesAndLinks.nodes , (newNode) =>{
                            if(newNode.data.nodeId == node.data.nodeId)
                            {
                                canfind = true;
                            }
                        });
                        if(!canfind)
                        {
                            var nodeObject = this.entityDiagram.findNodeForKey(node.key);
                            this.entityDiagram.model.setDataProperty(nodeObject,"visible",false);
                        }
                        else
                        {
                            var nodeObject = this.entityDiagram.findNodeForKey(node.key);
                            this.entityDiagram.model.setDataProperty(nodeObject,"visible",true);
                        }
                    });
                    // this.entityDiagram.model.nodeDataArray = nodesAndLinks.nodes;
                    // this.entityDiagram.model.linkDataArray = nodesAndLinks.links;

                    _.each(this.entityDiagram.model.linkDataArray , (link,index) =>{
                        var canfind = false;
                        var newLinkText;
                        var newLinkData;
                        _.each(nodesAndLinks.links ,(newLink) =>{
                            if(link.key == newLink.key)
                            {
                                canfind = true;
                                newLinkText = newLink.text;
                                newLinkData = newLink;
                                // link.text = newLink.text;
                            }
                        });
                        if(!canfind)
                        {
                            var linkObject = this.entityDiagram.findLinkForData(link);
                            this.entityDiagram.model.setDataProperty(linkObject,"visible",false);
                        }
                        else
                        {
                            var linkObject = this.entityDiagram.findLinkForData(link);
                            // this.entityDiagram.model.linkDataArray[index] = newLinkData;
                            // this.entityDiagram.model.setDataProperty(linkObject,"data",this.entityDiagram.model.linkDataArray[index]);
                            this.entityDiagram.model.setDataProperty(linkObject,"visible",true);
                        }
                    });
                }

                if (this.peopleDiagram && this.entityDiagram) {
                    if (this.props.isEntityRelation) {
                        this.switchDiagram(this.entityDiagram, this.peopleDiagram);
                    } else {
                        this.switchDiagram(this.peopleDiagram, this.entityDiagram);
                    }
                }
                if (this.props.selectedObject) {
                    if (this.props.isEntityRelation) {
                        var selected = this.entityDiagram.findNodeForKey(this.props.selectedObject.key);
                        this.entityDiagram.centerRect(selected.actualBounds);
                        this.entityDiagram.select(selected);
                        this.entityClick(null,selected)
                    } else {
                        var selected = this.peopleDiagram.findNodeForKey(this.props.selectedObject.personId);
                        this.peopleDiagram.centerRect(selected.actualBounds);
                        // console.log(selected.isSelected);
                        this.peopleDiagram.select(selected);
                        this.onIconClick(null,selected);
                    }
                }
                break;
        }
    }

    componentDidMount() {
        if (!this.props.data) {
            return;
        }

        switch (this.props.mode) {
            case MODE.COHESION:
                // 这里需要先绘制缩略图，否则会出现滚动条
                if (this.props.isEntityRelation) {
                    this.renderPeopleRelation(this.overviewId, true);
                    this.renderEntityRelation(this.zoneId);
                } else {
                    this.renderEntityRelation(this.overviewId, true);
                    this.renderPeopleRelation(this.zoneId);
                }
                break;
        }
    }

    render() {
        var overviewDiv = <div style={{width: '280px', height:'210px', position: 'absolute', background: '#eee', bottom:5, right: 5,
            visibility: this.props.overviewEnabled ? 'visible': 'hidden'}}>
            <div id={this.overviewId} className="br-a"
                 style={{width: '100%', height: '100%'}}>
            </div>
            <span className="btn-round-circle btn-overview fa fa-eye-slash "
                  style={{position: 'absolute', paddingLeft: 7, top: -16, left: -16, background: '#fff', zIndex: 2}}
                  onClick={() => {store.dispatch({type: 'TOGGLE_OVERVIEW', source: this.props.mode});
                  }}></span>
        </div>
        var closeBtn = <span className={"btn-round-circle btn-overview fa fa-eye " + (this.props.overviewEnabled ? 'hidden': '')}
                             style={{position: 'absolute', paddingLeft: 7,  background: '#fff', bottom:5, right: 5, zIndex: 2}}
                             onClick={() => {store.dispatch({type: 'TOGGLE_OVERVIEW', source: this.props.mode});
                             }}></span>

        return <div className="gojs-panel">
            <div ref="graphZone" id={this.zoneId} style={{width: '100%', height: '100%'}}></div>
            {overviewDiv}
            {closeBtn}
        </div>
    }

    changeEntitySelection(event,node){
        var diagram = node.diagram;
        if (diagram === null) return;
        if (node.isSelected ) {
            diagram.nodes.each(function (item) {
                item.category = "";
            });
            if (!node.data.data.isCenter) {
                node.category = "Selected";
            }else{
                node.category = "RootSelected";
            }
            diagram.select(node);
        }
        if (!node.diagram.isOverview) {
            this.props.onNodeClicked(event, node);
            this.selectNodeInPeoGraph(node.data.data.personId);
        }

    }

    changeSelection(event,node) {
        var diagram = node.diagram;
        if (diagram === null) return;
        if (node.isSelected) {
            this.makeSelectedNode(node);
        }
        if (!node.diagram.isOverview) {
            this.props.onNodeClicked(event, node);
            this.selectNodeInEntGraph(node.data.data.personId);
        }
    }

    makeSelectedNode(node) {
        _.each(selectedObjs, (item)=> {
            item.category = "";
        });
        selectedObjs = [];
        if (!node.data.data.isCenter) {
            var rootNode = node.diagram.findNodeForKey(centerId);
            rootNode.category = "Root";
            node.category = "Selected";
            selectedObjs.push(node);
        }else{
            node.category = "RootSelected";
        }
        node.diagram.select(node);
    }

    //缩略图联动
    selectNodeInPeoGraph(personId){
        var node = this.peopleDiagram.findNodeForKey(personId);
        if (node){
            this.peopleDiagram.centerRect(node.actualBounds);
            if(!node.isSelected){
                this.peopleDiagram.select(node);
            }
            this.onIconClick(null,node);
        }else {
            //清除选中
            _.each(selectedObjs, (item)=> {
                item.category = "";
            });
            selectedObjs = [];
            var rootNode = this.peopleDiagram.findNodeForKey(centerId);
            rootNode.category = "Root";
        }

    }

    selectNodeInEntGraph(personId){
        var nodes = [];
        this.entityDiagram.nodes.each(function(node){
            var id = node.data.data.personId;
            node.category = "";
            if(node.data.data.personId == personId){
                nodes.push(node);
            }
        });
        if(nodes.length > 0){
            _.each(nodes,node=>{
                if(!node.data.data.isCenter){
                    node.category = "Selected";
                    this.entityDiagram.select(node);
                }
            })
        }
    }
    // 找出中心点，计算亲密度单位值，按值分组，每组以transaction形式添加
    renderPeopleRelation(containerId, isOverview) {
        var myDiagram = goMake(go.Diagram, containerId, {
            scrollMode: isOverview ? go.Diagram.DocumentScroll : go.Diagram.InfiniteScroll,
            "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
            initialAutoScale: go.Diagram.Uniform,
            initialContentAlignment: go.Spot.Center,
            maxSelectionCount: 1,
            "animationManager.isEnabled": false,
            hoverDelay: 200,
            isTreePathToChildren: false,
            padding:100,
            layout: goMake(SpiralLayout)
        });

        myDiagram.nodeTemplate =
            goMake(go.Node, "Spot", nodeStyle(), {
                    locationSpot: go.Spot.Center,
                    click: this.onIconClick,
                    selectionAdorned: false
                }, makeIconTextNode({radius: 30})
            );
        myDiagram.nodeTemplateMap.add("Root",
            goMake(go.Node, "Auto", nodeStyle(), {
                    locationSpot: go.Spot.Center,
                    click: this.onIconClick,
                    selectionAdorned: false
                }, new go.Binding("location", "location").makeTwoWay(), makeIconTextNode({radius: 45})
            ));
         myDiagram.nodeTemplateMap.add("RootSelected",
            goMake(go.Node, "Auto", {
                    locationSpot: go.Spot.Center,
                    click: this.onIconClick,
                    selectionAdorned: false
                }, new go.Binding("location", "location").makeTwoWay(), makeSelectedNode({radius: 45,strokeWidth: 5,strokeColor: colors.activeStroke,fillColor: colors.orange})
            ));

        myDiagram.nodeTemplateMap.add("Selected",
            goMake(go.Node, "Auto", {
                    locationSpot: go.Spot.Center,
                    click: this.onIconClick,
                    selectionAdorned: false
                }, new go.Binding("location", "location").makeTwoWay(), makeSelectedNode({radius: 45,strokeWidth: 6,strokeColor: colors.activeStroke})
            ));
        myDiagram.nodeTemplateMap.add("Hover",
            goMake(go.Node, "Auto", nodeStyle(), {
                    locationSpot: go.Spot.Center,
                    click: this.onIconClick,
                    selectionAdorned: false
                }, new go.Binding("location", "location").makeTwoWay(), makeSelectedNode({radius: 45})
            ));
        myDiagram.linkTemplate = goMake(go.Link,
            {
                toShortLength: 3,
                curve: go.Link.Bezier,
                curviness: 10,
                layerName: 'Background'
            },
            goMake(go.Shape,{ strokeWidth: 8},
                new go.Binding("stroke", "line_color"))
        );

        var myModel = new go.TreeModel();
        myModel.nodeParentKeyProperty = "next";
        var peopleData = getPeopleNodes(this.props.data);
        myModel.nodeDataArray = peopleData.nodes;
        myDiagram.model = myModel;
        myDiagram.isOverview = isOverview;
        this.peopleDiagram = myDiagram;
    }

    renderEntityRelation(containerId, isOverview) {
        function ContinuousForceDirectedLayout() {
            go.ForceDirectedLayout.call(this);
            this._isObserving = false;
        }

        go.Diagram.inherit(ContinuousForceDirectedLayout, go.ForceDirectedLayout);

        /** @override */
        ContinuousForceDirectedLayout.prototype.isFixed = function (v) {
            return v.node.isSelected ;
        }

        /** @override */
        ContinuousForceDirectedLayout.prototype.doLayout = function (coll) {
            if (!this._isObserving) {
                this._isObserving = true;
                var lay = this;
                this.diagram.addModelChangedListener(function (e) {
                    if (e.modelChange !== "") lay.network = null;
                });
            }
            var net = this.network;
            if (net === null) {
                this.network = net = this.makeNetwork(coll);
            } else {
                this.diagram.nodes.each(function (n) {
                    var v = net.findVertex(n);
                    if (n.data.data.isCenter == true){

                    }
                    if (v !== null) v.bounds = n.actualBounds;

                });
            }
            go.ForceDirectedLayout.prototype.doLayout.call(this, coll);
            this.network = net;
        }

        function nodeStyle() {
            return [
                {

                    mouseHover: function (e, obj) { showPorts(obj.part, true); },
                    mouseLeave: function (e, obj) { showPorts(obj.part, false); }
                }
            ];
        }

        function showPorts(node, show) {
            var diagram = node.diagram;
            if (!diagram || diagram.isReadOnly) return;
            node.ports.each(function(port) {
                port.stroke = show ? colors.activeStroke : colors.stroke;
                port.strokeWidth = show ? 5 : 2;
            });
            if (show) {

                if (!node.data.data.isCenter) {
                    node.category = "Hover";
                }
            } else if(!node.isSelected) {
                node.category = "";

            }
        }

        var myDiagram = goMake(go.Diagram, containerId, {
            scrollMode: isOverview ? go.Diagram.DocumentScroll : go.Diagram.InfiniteScroll,
            "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
            initialContentAlignment: go.Spot.Center,
            initialAutoScale: go.Diagram.Uniform,
            layout: goMake(ContinuousForceDirectedLayout , {
                // infinityDistance:700
                defaultCommentElectricalCharge:1
            }),
            "SelectionMoved": function (e) {
                e.diagram.layout.invalidateLayout();
            },
            padding:100,
            hoverDelay: 500
            // "undoManager.isEnabled": true,

        });

        myDiagram.toolManager.draggingTool.doMouseMove = function () {
            go.DraggingTool.prototype.doMouseMove.call(this);
            if (this.isActive) {
                this.diagram.layout.invalidateLayout();
            }
        }

        var nodesAndLinks = changeEntityNodesLinks(this.props.data,this.props.types , containerId);

        myDiagram.nodeTemplate = goMake(go.Node, "Auto", nodeStyle() ,{
                // movable:false,
                locationSpot: go.Spot.Center,
                click: this.entityClick,
                selectionAdorned: false
            },makeIconTextNode(),new go.Binding("location", "location").makeTwoWay()
        );

        myDiagram.nodeTemplateMap.add("RootSelected",
            goMake(go.Node, "Auto", {
                    locationSpot: go.Spot.Center,
                    click: this.entityClick,
                    selectionAdorned: false
                }, new go.Binding("location", "location").makeTwoWay(),
                   makeSelectedNode({strokeWidth: 5,strokeColor: colors.activeStroke,fillColor: colors.orange})
        ));

        myDiagram.nodeTemplateMap.add("Selected",
            goMake(go.Node, "Auto", {
                    locationSpot: go.Spot.Center,
                    click: this.entityClick,
                    selectionAdorned: false
                },makeHoverIconTextNode({strokeWidth: 6,strokeColor: colors.activeStroke})
            ));
        myDiagram.nodeTemplateMap.add("Hover",
            goMake(go.Node, "Auto", nodeStyle(), {
                    locationSpot: go.Spot.Center,
                    click: this.entityClick,
                    selectionAdorned: false
                },makeHoverIconTextNode()
            ));

        myDiagram.linkTemplate = goMake(go.Link,  {
                width:10,
                isSelected: false
            }
        );



        // console.log(nodesAndLinks);
        myDiagram.model = new go.GraphLinksModel(nodesAndLinks.nodes , nodesAndLinks.links);
        // new go.Overview(overviewId).observed = myDiagram;

        myDiagram.isOverview = isOverview;
        this.entityDiagram = myDiagram;

    }
    // 改变实体图
    // changeEntityRelation(entityTypes,relationTypes){
    //     var myDiagram = go.Diagram.fromDiv(this.zoneId);
    //     var nodesAndLinks = changeEntityNodesLinks(this.props.data , entityTypes,relationTypes);
    //     myDiagram.model.nodeDataArray = nodesAndLinks.nodes;
    //     myDiagram.model.linkDataArray = nodesAndLinks.links;
    // }

    switchDiagram(mainDiagram, overviewDiagram) {
        overviewDiagram.div = document.getElementById(this.overviewId);
        overviewDiagram.isOverview = true;
        overviewDiagram.scrollMode = go.Diagram.DocumentScroll;
        overviewDiagram.zoomToFit();

        mainDiagram.isOverview = false;
        mainDiagram.div = document.getElementById(this.zoneId);
        mainDiagram.scrollMode = go.Diagram.InfiniteScroll;
    }

    selectNodeByKey(nodeKey) {
        var diagram = this.props.isEntityRelation ? this.entityDiagram : this.peopleDiagram;
        var selected = diagram.findNodeForKey(nodeKey);
        diagram.centerRect(selected.actualBounds);

        this.makeSelectedNode(selected);
    }
}

function getPeopleNodes(relationData) {
    var peoples = relationData.persons;
    var nodeDataArray = [];
    var center = _.find(peoples, (person)=> {
        return person.isCenter == true;
    });
    var preId = "";
    var color_num = 192;
    var gap = Math.floor(100/peoples.length);
    if(gap == 0){
        gap = 1;
    }
    peoples = _.filter(peoples, (person)=> {
        return person.isCenter == false;
    });
    peoples = _.sortBy(peoples, people=>{
        return people.totalScore
    });
    _.each(peoples, (person)=> {
        var node_color;
        if(person.totalScore < 10){
            //node_color = "#4C80FF";
            //node_color = "#6B96FF";
            //
            node_color = "#B7CCFF";
        }else if(person.totalScore < 25){
            //node_color = "#355AB2";
            //node_color = "#3960BF";
            node_color = "#6B96FF";
            //node_color = "#3D66CC";
        }else {
            node_color = "#26407F";
            //node_color = "#1E3366";
        }
        nodeDataArray.push({
            key: person.personId,
            text: person.personName,
            color: node_color,
            // line_color: "rgb("+lineColor[0]+","+lineColor[1]+","+lineColor[2]+")",
            line_color: "rgb("+color_num+","+color_num+","+color_num+")",
            geo: "cert",
            data: person,
            next: preId
        });
        preId = person.personId;
        color_num = color_num - gap;
    });
    centerId = center.personId;
    nodeDataArray.push({
        key: center.personId,
        text: center.personName,
        color: colors.orange,
        line_color: "rgb("+color_num+","+color_num+","+color_num+")",
        geo: 'cert',
        data: center,
        next: preId,
        category: 'Root'
    });
    return {
        nodes: nodeDataArray
    };
}

function changeEntityNodesLinks(relationData ,types ,containerId){
    if(types == null)
        return getEntityNodesLinks(relationData , containerId);
    var entityTypes = types.entity;
    var relationTypes = types.relation;
    var linkDataArray = [];
    var nodeDataArray = [];
    _.each(relationData.nodes, (node) => {
        _.each(node.nextLevelNodes, (nextNode) => {
            _.each(nextNode.linkDetail, (link) => {
                if(isInArray(nextNode.nodeType , entityTypes) && isInArray(link.linkedType , relationTypes))
                {
                    nodeDataArray.push({
                        key: nextNode.key,
                        text: dealWithNodeTitle(nextNode.nodeTitle),
                        geo: getIconNameOfType(nextNode.nodeType).icon,
                        color: colors.blue,
                        data: nextNode
                    });
                }
            });

        });

        if(isInArray(node.nodeType , entityTypes))
        {
            nodeDataArray.push({
                key: node.key,
                text: dealWithNodeTitle(node.nodeTitle),
                geo: getIconNameOfType(node.nodeType).icon,
                color: colors.orange,
                data: node
            });
        }
    });

    return {
        nodes: nodeDataArray,
        links: linkDataArray
    }
}

function isInArray(id , array){
    var isInArray = false;
    _.each(array,idInarray =>{
        if(id == idInarray)
        {
            isInArray = true;
        }
    });
    return isInArray;
}

function getEntityNodesLinks(relationData , containerId) {
    var linkDataArray = [];
    var nodeDataArray = [];
    _.each(relationData.nodes, (node) => {
        _.each(node.nextLevelNodes, (nextNode) => {
            nodeDataArray.push({
                key: nextNode.key,
                text: dealWithNodeTitle(nextNode.nodeTitle),
                geo: getIconNameOfType(nextNode.nodeType).icon,
                color: "#6B96FF",
                data: nextNode,
                score: nextNode.linkScore
            });
            linkDataArray.push({
                key: generateLinkKey(node.nodeId, nextNode.nodeId),
                from: node.nodeId,
                to: nextNode.key,
                text: generateLinkTitle(nextNode.linkDetail),
                data: nextNode.linkDetail
            });
        });

        nodeDataArray.unshift({
            key: node.key,
            text: dealWithNodeTitle(node.nodeTitle),
            geo: getIconNameOfType(node.nodeType).icon,
            color: colors.orange,
            data: node,
            isCenter: true
        });

    });

    nodeDataArray=initEntityGraph(nodeDataArray , containerId);

    return {
        nodes: nodeDataArray,
        links: linkDataArray
    }
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
function generateLinkTitle(links) {
    var title = links.length == 1 ? links[0].linkedTitle : _.reduce(links, (left, right)=>{
        return left.linkedTitle + '+' + right.linkedTitle;
    });
    return title;
}

function generateLinkKey(from, to) {
    return from < to ? from + '-' + to : to + '-' +  from
}

function makeHoverIconSelectionAdornment(strokeColor = colors.activeStroke) {
    return goMake(go.Adornment, "Position",
        goMake(go.Shape, "Circle", {stroke: strokeColor,
                strokeWidth: 3, fill: null }
            ,new go.Binding("width", "hoverWidth") , new go.Binding("height", "hoverWidth") , new go.Binding("position", "hoverPosition").makeTwoWay()
        )
    )
}


function makeHoverIconTextNode(opts = {}) {
    var iconMapper = opts.iconMapper || getGeoString;
    var strokeWidth = opts.strokeWidth || 2;
    var strokeColor = opts.strokeColor || colors.stroke;
    return goMake(go.Panel, "Vertical",
        goMake(go.Panel,"Auto",
            goMake(go.Shape, "Circle", {
                margin: 3,
                fill: colors.activeFill,
                strokeWidth: strokeWidth,
                stroke: strokeColor,
                portId: ""
            }, new go.Binding("width", "hoverWidth").makeTwoWay() , new go.Binding("height", "hoverWidth").makeTwoWay()),
            goMake(go.Shape, {
                margin: 3,
                fill: colors["white"],
                strokeWidth: 0
            }, new go.Binding("geometryString", "geo", iconMapper) , new go.Binding("height", "hoverRadius"), new go.Binding("width", "hoverRadius"))
        ), goMake(go.TextBlock, {
            // width:100,
            name:"TB",
            font: "bold 16pt helvetica,arial, sans-serif",
            margin: 10,
            stroke: '#555',
            textAlign:"center"
        }, new go.Binding("text"),new go.Binding("stroke","text_color"))
    )
}

function makeIconTextNode(opts = {}) {
    var iconRadius = opts.radius || 20;
    var iconMapper = opts.iconMapper || getGeoString;
    return goMake(go.Panel, "Vertical",
        goMake(go.Panel,"Auto",
            goMake(go.Shape, "Circle", {
                margin: 3,
                fill: "lightcoral",
                strokeWidth: 2,
                stroke: colors.stroke,
                width: iconRadius * 2,
                height: iconRadius * 2,
                portId: ""
            }, new go.Binding("fill", "color") , new go.Binding("width", "width").makeTwoWay() , new go.Binding("height", "height").makeTwoWay()),
            goMake(go.Shape, {
                margin: 3,
                width: iconRadius,
                height: iconRadius,
                fill: colors["white"],
                strokeWidth: 0
            }, new go.Binding("geometryString", "geo", iconMapper) , new go.Binding("height", "radius"), new go.Binding("width", "radius"))
        ), goMake(go.TextBlock, {
            // width:100,
            name:"TB",
            font: "bold 16pt helvetica,arial, sans-serif",
            margin: 10,
            stroke: '#555',
            textAlign:"center"
        }, new go.Binding("text"),new go.Binding("stroke","text_color"))
    )
}

function makeSelectedNode(opts = {}) {
    var iconRadius = opts.radius || 45;
    var iconMapper = opts.iconMapper || getGeoString;
    var strokeWidth = opts.strokeWidth || 2;
    var strokeColor = opts.strokeColor || colors.stroke;
    var fillColor = opts.fillColor || colors.activeFill;
    return goMake(go.Panel, "Vertical",
        goMake(go.Panel,"Auto",
            goMake(go.Shape, "Circle", {
                margin: 3,
                fill: fillColor,
                strokeWidth: strokeWidth,
                stroke: strokeColor,
                width: iconRadius * 2,
                height: iconRadius * 2,
                portId: ""
            },new go.Binding("width", "width").makeTwoWay() , new go.Binding("height", "height").makeTwoWay()),
            goMake(go.Shape, {
                margin: 3,
                width: iconRadius,
                height: iconRadius,
                fill: colors["white"],
                strokeWidth: 0
            }, new go.Binding("geometryString", "geo", iconMapper),new go.Binding("height", "radius"), new go.Binding("width", "radius"))
        ), goMake(go.TextBlock, {
            // width:100,
            name:"TB",
            font: "bold 16pt helvetica,arial, sans-serif",
            margin: 10,
            stroke: '#555',
            textAlign:"center"
        }, new go.Binding("text"),new go.Binding("stroke","text_color"))
    )
}

function makePictureTextNode(opts = {}){
    var iconRadius = opts.radius || 20;
    return goMake(go.Panel,"Vertical",
        goMake(go.Picture, {
            margin: 3,
            // element:canvasElement,
            // element: image,
            // source: "/img/groupanalysis/avatar.jpg",
            width: iconRadius*2,
            height: iconRadius*2
        },new go.Binding("element","key",createCanvas)),
        goMake(go.TextBlock, {
            // width:100,
            name: "TEXTBLOCK",
            font: "bold 10pt sans-serif",
            margin: 10,
            textAlign:"center"
        }, new go.Binding("text"))
    )
}

function createCanvas(key){
    var iconRadius = 20;
    var canvasElement = document.createElement("canvas");
    var ctx = canvasElement.getContext('2d');
    canvasElement.width = iconRadius*4;
    canvasElement.height = iconRadius*4;
    if(canvasElement.getContext){
        ctx.translate(iconRadius*2,iconRadius*2);
        ctx.beginPath();
        ctx.arc(0,0,iconRadius*2,0,Math.PI*2);
        ctx.closePath();
        ctx.clip();
        var imageElement = new Image();
        var randomIndex = Math.ceil(Math.random()*9);
        imageElement.src='/img/groupanalysis/avatar' + randomIndex + '.png';
        imageElement.onload = function(){
            ctx.drawImage(imageElement,-(iconRadius*2),-(iconRadius*2),iconRadius*4,iconRadius*4);
        }
    }
    return canvasElement;
}

// function makeIconSelectionAdornment(strokeColor = colors.activeStroke) {
//     return goMake(go.Adornment, "Position",
//         goMake(go.Shape, "Circle", {stroke: strokeColor,
//                 strokeWidth: 3, fill: null }
//             ,new go.Binding("width", "width") , new go.Binding("height", "height") , new go.Binding("position", "position").makeTwoWay()
//         )
//     )
// }

// function makeSelectionAdornment(radius = 20, strokeColor = colors.activeStroke) {
//     return goMake(go.Adornment, "Position",
//         goMake(go.Shape, "Circle", {stroke: strokeColor,
//                 strokeWidth: 6, fill: null,
//                 position : new go.Point(32.5- (radius - 20), 2.5),
//                 width: radius * 2, height: radius * 2}
//         )
//     )
// }

function initEntityGraph(nodes) {
    if (_.isEmpty(nodes)) {
        return;
    }
    var minScore = nodes[nodes.length - 1].score, maxScore = nodes[1].score;
    var scoreGap = maxScore - minScore;
    // TODO yaco 暂时固定为1圈
    var circleCount = 1 , hiddenCount = 0;
    var scoreUnit = scoreGap / circleCount;
    var circles = {}, currentCircle = 1, maxDistance , nodesOfDistance={};
    _.each(nodes, node=>{
        if (node.score >= 0 && node.score < 10){
            node.width = 60;
        } else if (node.score >= 10 && node.score < 25){
            node.width = 70;
        } else if (node.score >= 25){
            node.width = 85;
        }
        if (node.isCenter == true){
            node.width = 85;
        }

    });

    if (nodes && nodes.length > 0) {
        layoutEntitytNodes(nodes );
    }

    return nodes;
}


function layoutEntitytNodes(nodes ) {
    var startAngle = Math.random() * 360;
    var angleSeparator = 360 / nodes.length;
    var container = window.document.getElementById('cohesion');
    var containerWidth = container.offsetWidth;
    var containerHeight = container.offsetHeight - 50;


    var centerNode = [];
    var startAngle = 0;
    _.each(nodes, node=>{
        var width = node.width;
        node.height = width;
        node.radius = width/2;
        node.position = new go.Point(38.5 - (width/2 - 20), 2.5);
        if (node.isCenter){
            centerNode.push(node);
            node.hoverWidth = width;
            node.hoverRadius = width/2;
            node.hoverPosition = new go.Point(38.5 - (width/2 - 20), 2.5);
            node.color=colors['orange']

        } else {
            node.hoverWidth = width*2;
            node.hoverPosition = new go.Point(38.5 - (width - 20), 2.5);
            node.hoverRadius = width;

        }

    });
    // console.log(centerNode);
    var angleSeparator = 360 / centerNode.length;

    _.each(nodes , node=>{
        // console.log(Math.cos((startAngle*Math.PI)/180),startAngle)
        if (node.isCenter){
            let x = ((Math.cos((startAngle*Math.PI)/180))*(containerWidth*5/2))+containerWidth*5/2;
            let y = ((Math.sin((startAngle*Math.PI)/180))*(containerHeight*5/2))+containerHeight*5/2;
            node.location = new go.Point(x,y);
            // console.log(node.location,containerWidth,containerHeight,startAngle);
            startAngle = (startAngle + angleSeparator);
        }
    })
    // console.log(nodes);
    return nodes;

}


function initGraph(rootNode, nodes) {
    if (_.isEmpty(nodes)) {
        return;
    }
    var minScore = nodes[nodes.length - 1].data.totalScore, maxScore = nodes[0].data.totalScore;
    var scoreGap = maxScore - minScore;
    // TODO yaco 暂时固定为4圈
    var circleCount = 3, hiddenCount = 0;
    var scoreUnit = scoreGap / circleCount;
    var circles = {}, currentCircle = 1, maxDistance, nodesOfDistance = {};
    _.each(nodes, node=>{
        if (scoreUnit != 0) {
            // 所有节点totalscore相等
            node.distance = (maxScore - node.data.totalScore) / scoreUnit + 1;
        } else {
            node.distance = 2;
        }
        if (nodesOfDistance[node.distance]) {
            nodesOfDistance[node.distance].push(node);
        } else {
            nodesOfDistance[node.distance] = [node];
        }
        if (node.distance > currentCircle) {
            currentCircle = Math.ceil(node.distance);
        }
        if (circles[currentCircle]) {
            // 同一半径上的节点不能超过一定个数
            if (nodesOfDistance[node.distance].length < node.distance * 12) {
                circles[currentCircle].push(node);
            } else {
                hiddenCount++;
            }
        } else {
            circles[currentCircle] = [node];
        }
        maxDistance = currentCircle;
    });

    radialLayout(rootNode, circles, maxDistance);

    if (hiddenCount > 0) {
        Notify.simpleNotify('提醒', '部分节点因太过密集已被隐藏', 'warning');
    }
}



function radialLayout(rootNode, circles, maxDistance) {
    for (var layer = 1; layer <= maxDistance; layer++) {
        (function (level) {
            setTimeout(() => {
                layoutCircleAndNodes(rootNode, level, circles[level])
            }, 500 * level);
        })(layer);
    }
}

function layoutCircleAndNodes(rootNode, distance, nodes) {
    var diagram = rootNode.diagram;

    var radius = distance * layerThickness;
    var circle = goMake(go.Part,
        {name: "CIRCLE", layerName: "Grid"},
        {
            locationSpot: go.Spot.Center,
            location: new go.Point(0, 0)
        },
        goMake(go.Shape, "Circle",
            {width: radius * 2, height: radius * 2},
            {fill: "rgba(200,200,200,0.2)", stroke: null}));
    diagram.add(circle);

    if (nodes && nodes.length > 0) {
        layoutNodes(rootNode.diagram, nodes);
    }
}

function layoutNodes(diagram, nodes) {
    var startAngle = Math.random() * 360;
    var angleSeparator = 360 / nodes.length;
    _.each(nodes, node=>{
        var radius = node.distance * layerThickness;//半径
        var point = new go.Point(radius, 0);
        point.rotate(startAngle);
        node.location = point;
        diagram.model.addNodeData(node);
        startAngle = (startAngle + angleSeparator) % 360;
    });
}

function nodeStyle() {
    return [
        {
            mouseHover: function (e, obj) { showPorts(obj.part, true)},
            mouseLeave: function (e, obj) { showPorts(obj.part, false)}
        }
    ];
}

function showPorts(node, active) {
    var diagram = node.diagram;
    if (!diagram || diagram.isReadOnly) return;
    if (node.data.data.isCenter) {
        node.ports.each(function(port) {
            port.stroke = (active ? colors.activeStroke : colors.stroke);
            port.strokeWidth = (active ? 5 : 2);
        });
    }else {
        if (active) {
        node.category = "Hover";
        selectedObjs.push(node);
        } else if (!node.isSelected) {
            node.category = "";
            var index = _.findIndex(selectedObjs, node_i => {
                return node.data.data.key == node_i.data.data.key;
            })
            if (index > -1) {
                selectedObjs.splice(index, 1);
            }
        }
    }
}