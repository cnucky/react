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
        this.onLinkClick = this.linkClickShow.bind(this);
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
    }


    componentDidUpdate() {
        if (!this.props.data) {
            return;
        }


    }

    componentDidMount() {
        if (!this.props.data) {
            return;
        }
        if (this.props.isTree){
            this.renderPeopleTree(this.zoneId ,  this.overviewId , false);
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



    changeSelection(event,node) {
        console.log('selectStart' ,Date.now() % 100000);

        var icon = node.findObject("Icon");

        var diagram = node.diagram;
        if (diagram === null) return;


        if (node.isSelected) {
            diagram.nodes.each(function (item) {
                if(node.data.isInit)
                {
                    item.fill = colors.orange;
                }
                else
                {
                    item.fill = "#6B96FF";
                }
            });
            icon.fill = "#66FAC1";

            diagram.select(node);

            this.props.onNodeClicked(event, node);
        }

    }

    linkClickShow(event,link) {
        var diagram = link.diagram;
        if (diagram === null) return;
        if (link.isSelected) {
            this.props.onLinkClicked(event,link);
        }
    }
    onSelectionChanged(node) {
        var icon = node.findObject("Icon");

        var diagram = node.diagram;
        if (diagram === null) return;

        if (node.isSelected) {

            icon.fill = "#66FAC1";

        }else {
            if(node.data.isInit)
            {
                icon.fill = colors.orange;
            }
            else
            {
                icon.fill = "#6B96FF";
            }

        }


    }


    renderPeopleTree(containerId, overviewId , isOverview){

        var myDiagram = goMake(go.Diagram, containerId, {
            scrollMode: isOverview ? go.Diagram.DocumentScroll : go.Diagram.InfiniteScroll,
            "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
            initialAutoScale: go.Diagram.Uniform,
            initialContentAlignment: go.Spot.Center,
            "animationManager.isEnabled": false,
            hoverDelay: 200,
            padding:100,
            maxSelectionCount: 1,
            layout:  // create a TreeLayout for the family tree
            goMake(go.LayeredDigraphLayout,{
                direction:90
            })

        });

        myDiagram.nodeTemplate =
            goMake(go.Node, "Spot", nodeStyle(), {
                    locationSpot: go.Spot.Center,
                    click: this.onIconClick,
                    selectionChanged: this.onSelectionChanged
                }, makeIconTextNode({radius: 30})
            );

        myDiagram.nodeTemplateMap.add("root",
            goMake(go.Node, "Auto",
             {selectionAdorned:false},
              goMake(go.Panel, "Vertical",
                goMake(go.Panel,"Auto",
                  goMake(go.Shape, "Circle", {
                    margin: 3,
                    fill: 'transparent',
                    stroke: 'transparent',

                })
            ))));
        myDiagram.linkTemplate = goMake(go.Link,
            {
                click:this.onLinkClick
            },
            goMake(go.Shape,{ strokeWidth: 3, stroke: '#424242' })
        );
        myDiagram.linkTemplateMap.add("none", goMake(go.Link,
            goMake(go.Shape,{ strokeWidth: 3, stroke: 'transparent' })
        ));

        var peopleData = getPeopleTree(this.props.isEntityRelation,this.props.selectData,this.props.selectKey);
        myDiagram.model = new go.GraphLinksModel(peopleData.nodes, peopleData.links);
        myDiagram.isOverview = isOverview;
        this.peopleDiagram = myDiagram;
        var myOverview =
            goMake(go.Overview, overviewId,
                { observed: myDiagram ,contentAlignment: go.Spot.Center});
    }

}


function getPeopleTree(isEntityRelation,selectData,selectKey){
    var findNodes;

    if(isEntityRelation)
    {
        selectData = selectData.entity;        
    }
    else
    {
        selectData = selectData.people;   
    }
    if(!_.isEmpty(selectKey))
    {
        findNodes = _.union(selectKey);
    }
    else
    {
        findNodes = [selectData[0][0].key];
    }
    var selectNode = _.union(findNodes);
    var nodes = _.union(selectData[0]);
    var links = _.union(selectData[1]);
    var existNodes = _.union(findNodes);
    while(!_.isEmpty(findNodes))
    {
        _.each(findNodes,node =>{
            _.each(links,link=>{
                if(link.from != link.to)
                {
                    if(link.from == node)
                    {
                        if(!_.contains(findNodes,link.to)&&!_.contains(existNodes,link.to))
                        {
                            findNodes.push(link.to);   
                            existNodes.push(link.to);  
                        }        
                    }
                    else if(link.to == node)
                    {
                        if(!_.contains(findNodes,link.from)&&!_.contains(existNodes,link.from))
                        {
                            findNodes.push(link.from);
                             existNodes.push(link.from); 
                            let temp = link.to;
                            link.to = link.from;
                            link.from = temp;
                        }
                    }
                }
                
            })
            findNodes = _.rest(findNodes);
        })
    }
    nodes.push({key:-1,category:'root'});
     _.each(links, (link) =>{
        _.each(selectNode,(node) =>{
            if(link.to == node)
            {
                link.to = link.from;
                link.from = node;
            }
        });
    });
    _.each(selectNode, (selected) => {
        links.push({from:-1,to:selected,category:'none'});
    });
    return {
        nodes:nodes,
        links:links
    };
}





function makeIconTextNode(opts = {}) {
    var iconRadius = opts.radius || 20;
    var iconMapper = opts.iconMapper || getGeoString;
    return goMake(go.Panel, "Vertical",
        goMake(go.Panel,"Auto",
            goMake(go.Shape, "Circle", {
                name:'Icon',
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


function nodeStyle() {
    return [
        {
            mouseHover: function (e, obj) { showPorts(obj.part, true)},
            mouseLeave: function (e, obj) { showPorts(obj.part, false)}
        }
    ];
}

function showPorts(node, show) {
    var diagram = node.diagram;
    if (!diagram || diagram.isReadOnly) return;
    if(!node.isSelected){
        node.ports.each(function(port) {
            if(node.data.isInit)
            {
                port.fill = show ?  colors.activeFill : colors.orange ;
            }
            else
            {
                port.fill = show ?  "#66FAC1" : '#6B96FF' ;
            }
            port.stroke = show ? colors.activeStroke : colors.stroke;
        });
    }

    if (show) {
        selectedObjs.push(node);
    } else if (!node.isSelected) {
        node.category = "";
        var index = _.findIndex(selectedObjs, node_i => {
            return node.data.key == node_i.data.key;
        })
        if (index > -1) {
            selectedObjs.splice(index, 1);
        }
    }
}