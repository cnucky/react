import React from "react";
import {getGeoString , getIconNameOfType} from "./icon-config.js";
import {MODE, store} from "./store";
import {hslToRgb, rgbToHsl} from "utility/color-util/color-util";

const Notify = require('nova-notify');

const colors = {
    blue:   "#36dec7",
    orange: "#f0862d",
    green:  "#C8DA2B",
    gray:   "#888",
    white:  "#F5F5F5",
    stroke: "#888",
    activeStroke: "rgb(120, 131, 240)",
    activeFill: "#66FAC1",
    suggestNode: "#48cfad",
    originColor: "#6B96FF"
};

var goMake = go.GraphObject.make;

const layerThickness = 100;
const MIN_LAYER = 3, MAX_LAYER = 7;

var selectedObjs = [];
var centerId;
var beforeNodeArray = [];
var beforeLinkArray = [];
var entityNodeArray =[];
var entityLinkArray = [];
var selectKey = [];

export default class GraphZone extends React.Component {
    constructor(props) {
        super(props);

        var timestamp = Date.now();
        this.zoneId = 'gojs-container#' + timestamp;
        this.overviewId = 'overview#' + timestamp;
        this.onIconClick = this.changeSelection.bind(this);
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
        this.entityClick =  this.changeEntitySelection.bind(this);
        this.onLinkClick = this.linkClickShow.bind(this);
    }

    componentDidUpdate() {
        var mode = this.props.mode;
        if (!this.props.data) {
            return;
        }

        if(this.props.types != null && this.props.isFilter)
        {
           if (this.props.isEntityRelation){
               let nodesAndLinks =  this.props.filterEntityData;




               let nodeId = {};
               _.each(nodesAndLinks.nodes , (newNode)=>{
                   nodeId[newNode.key] = true;
               })


               _.each(this.entityDiagram.model.nodeDataArray, (node) =>{


                   if(!nodeId[node.key])
                   {
                       let nodeObject = this.entityDiagram.findNodeForData(node);
                       this.entityDiagram.model.setDataProperty(nodeObject.data,"visible",false);
                   }
                   else
                   {
                       let nodeObject = this.entityDiagram.findNodeForData(node);
                       this.entityDiagram.model.setDataProperty(nodeObject.data,"visible",true);
                       delete nodeId[node.key];
                   }
               });


               let linkId = {};
               _.each(nodesAndLinks.links , (newLink)=>{
                   linkId[newLink.key] = true;
               })

               _.each(this.entityDiagram.model.linkDataArray , (link,index) =>{

                   if(!linkId[link.key])
                   {
                       let linkObject = this.entityDiagram.findLinkForData(link);
                       this.entityDiagram.model.setDataProperty(linkObject.data,"visible",false);
                   }
                   else
                   {
                       let linkObject = this.entityDiagram.findLinkForData(link);
                       this.entityDiagram.model.setDataProperty(linkObject.data,"visible",true);
                       delete linkId[link.key];
                   }
               });


           } else {
               let nodesAndLinks =this.props.filterPeopleData;



               let personId = {};
               _.each(nodesAndLinks.nodes , (newNode)=>{
                   personId[newNode.key] = true;
               })

               _.each(this.peopleDiagram.model.nodeDataArray, (node) =>{
                   // var canfind = false;
                   // _.each(nodesAndLinks.nodes , (newNode) =>{
                   //     if(newNode.data.personId == node.data.personId)
                   //     {
                   //         canfind = true;
                   //     }
                   // });
                   if(!personId[node.key])
                   {
                       let nodeObject = this.peopleDiagram.findNodeForData(node);
                       this.peopleDiagram.model.setDataProperty(nodeObject.data,"visible",false);
                   }
                   else
                   {
                       let nodeObject = this.peopleDiagram.findNodeForData(node);
                       this.peopleDiagram.model.setDataProperty(nodeObject.data,"visible",true);
                       delete personId[node.data.personId];
                   }
               });


               let linkId = {};
               _.each(nodesAndLinks.links , (newLink)=>{
                   linkId[newLink.key] = true;
               })

               _.each(this.peopleDiagram.model.linkDataArray , (link,index) =>{


                   if(!linkId[link.key])
                   {
                       let linkObject = this.peopleDiagram.findLinkForData(link);
                       this.peopleDiagram.model.setDataProperty(linkObject.data,"visible",false);
                   }
                   else
                   {
                       let linkObject = this.peopleDiagram.findLinkForData(link);
                       this.peopleDiagram.model.setDataProperty(linkObject.data,"visible",true);
                       delete linkId[link.key];
                   }
               });

           }
        }
        // console.log(this.props);
        if (this.props.shouldGetData){
            let diagram = this.props.isEntityRelation ? this.entityDiagram : this.peopleDiagram;
            this.getSelectData(diagram,this.props.mode,this.props.isInit,this.props.selectKey , this.props.data);
        }
        if (this.props.deletedData){
            let diagram = this.props.isEntityRelation ? this.entityDiagram : this.peopleDiagram;
            this.getDeletedData(diagram,this.props.mode ,  this.props.data);
        }

        /** 模式切换时绘制 **/
        if ( this.props.isEntityRelation && this.peopleDiagram.div == document.getElementById(this.zoneId)) {

            this.peopleDiagram.div = null;
            this.peopleDiagram.div = document.getElementById(this.overviewId);
            this.peopleDiagram.isOverview = true;
            this.entityDiagram.div = document.getElementById(this.zoneId);
            this.entityDiagram.isOverview = false;

            // this.renderEntityRelation(this.zoneId);

        }

        if (!this.props.isEntityRelation && this.entityDiagram.div == document.getElementById(this.zoneId)){

            this.entityDiagram.div = null;
            this.entityDiagram.div = document.getElementById(this.overviewId);
            this.entityDiagram.isOverview = true;
            // this.renderPeopleRelation(this.zoneId);
            this.peopleDiagram.div = document.getElementById(this.zoneId);
            this.peopleDiagram.isOverview = false;


        }

        /** 编辑模式时绘制 **/
        if(this.props.refreshGragh){
            if(this.props.isEntityRelation){
                // this.entityDiagram.div = null;
                // this.entityDiagram.isOverview = false;
                // this.renderEntityRelation(this.zoneId);

                let nodesAndLinks =  this.props.selectData.entity;

                let nodeId = {};
                _.each(nodesAndLinks[0] , (newNode)=>{
                    nodeId[newNode.key] = true;
                })

                this.entityDiagram.startTransaction("clear boss");

                _.each(this.entityDiagram.model.nodeDataArray, (node) =>{


                    if(!nodeId[node.key])
                    {
                        let nodeObject = this.entityDiagram.findNodeForKey(node.key);
                        this.entityDiagram.model.setDataProperty(nodeObject.data,"visible",false);
                    }
                    else
                    {
                        let nodeObject = this.entityDiagram.findNodeForKey(node.key);
                        this.entityDiagram.model.setDataProperty(nodeObject.data,"visible",true);

                    }
                });


                let linkId = {};
                _.each(nodesAndLinks[1] , (newLink)=>{
                    linkId[newLink.key] = true;
                })

                _.each(this.entityDiagram.model.linkDataArray , (link,index) =>{

                    if(!linkId[link.key])
                    {
                        let linkObject = this.entityDiagram.findLinkForData(link);
                        this.entityDiagram.model.setDataProperty(linkObject.data,"visible",false);
                    }
                    else
                    {
                        let linkObject = this.entityDiagram.findLinkForData(link);
                        this.entityDiagram.model.setDataProperty(linkObject.data,"visible",true);

                    }
                });


            } else {
                // this.peopleDiagram.div = null;
                // this.peopleDiagram.isOverview = false;
                // this.renderPeopleRelation(this.zoneId);

                let nodesAndLinks =this.props.selectData.people;

                let personId = {};
                _.each(nodesAndLinks[0] , (newNode)=>{
                    personId[newNode.key] = true;
                })


                this.peopleDiagram.startTransaction("clear boss");

                _.each(this.peopleDiagram.model.nodeDataArray, (node) =>{

                    if(!personId[node.key])
                    {
                        let nodeObject = this.peopleDiagram.findNodeForData(node);
                        this.peopleDiagram.model.setDataProperty(nodeObject.data,"visible",false);
                    }
                    else
                    {
                        let nodeObject = this.peopleDiagram.findNodeForData(node);
                        this.peopleDiagram.model.setDataProperty(nodeObject.data,"visible",true);

                    }
                });


                let linkId = {};
                _.each(nodesAndLinks[1] , (newLink)=>{
                    linkId[newLink.key] = true;
                })

                _.each(this.peopleDiagram.model.linkDataArray , (link,index) =>{


                    if(!linkId[link.key])
                    {
                        let linkObject = this.peopleDiagram.findLinkForData(link);
                        this.peopleDiagram.model.setDataProperty(linkObject.data,"visible",false);
                    }
                    else
                    {
                        let linkObject = this.peopleDiagram.findLinkForData(link);
                        this.peopleDiagram.model.setDataProperty(linkObject.data,"visible",true);

                    }
                });

                this.peopleDiagram.commitTransaction("clear boss");
            }
        }


        // if(this.props.undo){
        //     if(this.props.isEntityRelation){
        //         this.entityDiagram.div = null;
        //         this.entityDiagram.isOverview = false;
        //         this.renderEntityRelation(this.zoneId);
        //
        //     } else {
        //         this.peopleDiagram.div = null;
        //         this.peopleDiagram.isOverview = false;
        //         this.renderPeopleRelation(this.zoneId);
        //     }
        // }




        /** 鹰眼图切换时绘制 **/
        if( !this.props.outEditState &&!this.props.isEditState &&  this.peopleDiagram.div == document.getElementById(this.zoneId) && !_.isEmpty(this.props.selectData.people)){
            let nodesAndLinks =  this.props.selectData.entity;

            let nodeId = {};
            _.each(nodesAndLinks[0] , (newNode)=>{
                nodeId[newNode.data.key] = true;
            })

            this.entityDiagram.startTransaction("clear boss");

            _.each(this.entityDiagram.model.nodeDataArray, (node) =>{


                if(!nodeId[node.data.key])
                {
                    var nodeObject = this.entityDiagram.findNodeForKey(node.key);
                    this.entityDiagram.model.setDataProperty(nodeObject.data,"visible",false);
                }
                else
                {
                    var nodeObject = this.entityDiagram.findNodeForKey(node.key);
                    this.entityDiagram.model.setDataProperty(nodeObject.data,"visible",true);

                }
            });


            let linkId = {};
            _.each(nodesAndLinks[1] , (newLink)=>{
                linkId[newLink.key] = true;
            })

            _.each(this.entityDiagram.model.linkDataArray , (link,index) =>{

                if(!linkId[link.key])
                {
                    var linkObject = this.entityDiagram.findLinkForData(link);
                    this.entityDiagram.model.setDataProperty(linkObject.data,"visible",false);
                }
                else
                {
                    var linkObject = this.entityDiagram.findLinkForData(link);
                    this.entityDiagram.model.setDataProperty(linkObject.data,"visible",true);

                }
            });
            this.entityDiagram.isOverview = true;
        }

        if( !this.props.outEditState && !this.props.isEditState && this.entityDiagram.div == document.getElementById(this.zoneId) && !_.isEmpty(this.props.selectData.entity)){
            let nodesAndLinks =this.props.selectData.people;

            let personId = {};
            _.each(nodesAndLinks[0] , (newNode)=>{
                personId[newNode.data.personId] = true;
            })


            _.each(this.peopleDiagram.model.nodeDataArray, (node) =>{

                if(!personId[node.data.personId])
                {
                    var nodeObject = this.peopleDiagram.findNodeForData(node);
                    this.peopleDiagram.model.setDataProperty(nodeObject.data,"visible",false);
                }
                else
                {
                    var nodeObject = this.peopleDiagram.findNodeForData(node);
                    this.peopleDiagram.model.setDataProperty(nodeObject.data,"visible",true);

                }
            });


            let linkId = {};
            _.each(nodesAndLinks[1] , (newLink)=>{
                linkId[newLink.key] = true;
            })

            _.each(this.peopleDiagram.model.linkDataArray , (link,index) =>{


                if(!linkId[link.key])
                {
                    var linkObject = this.peopleDiagram.findLinkForData(link);
                    this.peopleDiagram.model.setDataProperty(linkObject.data,"visible",false);
                }
                else
                {
                    var linkObject = this.peopleDiagram.findLinkForData(link);
                    this.peopleDiagram.model.setDataProperty(linkObject.data,"visible",true);

                }
            });
            this.peopleDiagram.isOverview = true;
        }




        /** 编辑模式可选的节点数量 **/
        if (this.props.isEditState)
        {
            this.peopleDiagram.toolManager.dragSelectingTool.isEnabled = this.props.isCircleChoose ? true : false;
            this.entityDiagram.toolManager.dragSelectingTool.isEnabled = this.props.isCircleChoose ? true : false;
            this.peopleDiagram.allowHorizontalScroll = this.props.isCircleChoose ? false : true;
            this.peopleDiagram.allowVerticalScroll = this.props.isCircleChoose ? false : true;
            this.entityDiagram.allowHorizontalScroll = this.props.isCircleChoose ? false : true;
            this.entityDiagram.allowVerticalScroll = this.props.isCircleChoose ? false : true;
            this.peopleDiagram.maxSelectionCount = 10000;
            this.peopleDiagram.nodeTemplate.selectionAdorned = true;
            this.entityDiagram.maxSelectionCount = 10000;
            this.entityDiagram.nodeTemplate.selectionAdorned = true;
        }
        else
        {
            this.peopleDiagram.toolManager.dragSelectingTool.isEnabled =  false;
            this.entityDiagram.toolManager.dragSelectingTool.isEnabled =  false;
            this.peopleDiagram.allowHorizontalScroll =  true;
            this.peopleDiagram.allowVerticalScroll = true;
            this.entityDiagram.allowHorizontalScroll = true;
            this.entityDiagram.allowVerticalScroll = true;
            this.peopleDiagram.maxSelectionCount = 1;
            this.peopleDiagram.nodeTemplate.selectionAdorned = false;
            this.entityDiagram.maxSelectionCount = 1;
            this.entityDiagram.nodeTemplate.selectionAdorned = false;
        }


        if (this.props.selectedObject) {
            if (this.props.isEntityRelation) {
                var selected = this.peopleDiagram.findNodeForKey(this.props.selectedObject.key);
                this.entityDiagram.centerRect(selected.actualBounds);
                this.entityDiagram.select(selected);
                this.entityClick(null,selected);
                this.onLinkClick(null,selected);
            } else {
                var selected = this.peopleDiagram.findNodeForKey(this.props.selectedObject.personId);
                this.peopleDiagram.centerRect(selected.actualBounds);
                // console.log(selected.isSelected);
                this.peopleDiagram.select(selected);
                this.onIconClick(null,selected);
                this.onLinkClick(null,selected);
            }
        }

        if(!this.props.isCheck)
        {
            var diagram = null;
            if (this.props.isEntityRelation) {
                diagram =this.entityDiagram;
            }
            else
            {
                diagram =this.peopleDiagram;
            }
            // this.peopleDiagram.nodes = null;
            diagram.nodes.each(function (item) {
                if(item.data.color == colors.activeFill)
                {
                    var icon = item.findObject("Icon");
                    if(item.data.isInit)
                    {
                        // item.data.color = colors.orange;
                        icon.fill = colors.orange;
                    }
                    else
                    {
                        icon.fill = colors.originColor;
                        // item.data.color = colors.originColor;
                    }                    
                }
            });
        }
    }
    componentDidMount() {
        if (!this.props.data) {
            return;
        }

        switch (this.props.mode) {
            case MODE.MULTI_TARGET:
                //这里需要先绘制缩略图，否则会出现滚动条
                if (this.props.isEntityRelation) {
                    this.renderPeopleRelation(this.overviewId, true);
                    this.renderEntityRelation(this.zoneId );

                } else {
                    this.renderEntityRelation(this.overviewId, true);
                    this.renderPeopleRelation(this.zoneId );
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
            <div className={(this.props.isEditState ? 'hidden' : '')}>
                {overviewDiv}
                {closeBtn}
            </div>

        </div>
    }

    changeEntitySelection(event,node){
        var that = this.props;

        if (node.isSelected && !node.diagram.isOverview){
            this.props.onNodeClicked(event, node);
            this.selectNodeInPeoGraph(node.data.data.personId);
        }
        var icon = node.findObject("Icon");

        var diagram = node.diagram;
        if (diagram === null) return;


            if(that.isCheck){

                var index = _.indexOf(that.selectKey, node.data.key);

                if (index != -1) {
                    that.selectKey.splice(index, 1);
                } else {
                    that.selectKey.push(node.data.key);
                }


                _.each(that.selectKey , (item) =>{
                    if(item === node.data.key){
                        icon.fill = "#66FAC1";
                    } else {
                        if(node.data.isInit)
                        {
                            icon.fill = colors.orange;
                        }
                        else
                        {
                          icon.fill = "#6B96FF";
                        }

                    }
                })

                // console.log(that.selectKey)
                var findNodes = _.union(that.selectKey);
                var existNodes = _.union(findNodes);

            } else {
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

                    that.selectKey.push(node.data.key);


                    var index = _.indexOf(that.selectKey, node.data.key);


                    if (index != -1) {
                        that.selectKey.length = 0;
                        that.selectKey.push(node.data.key);
                    } else {
                        that.selectKey.splice(index, 1);
                    }
                    // console.log(that.selectKey)
                    diagram.select(node);

                }

            }



    }

    changeSelection(event,node) {
        var that = this.props;
        var icon = node.findObject("Icon");

        if (node.isSelected && !node.diagram.isOverview){
            this.props.onNodeClicked(event, node);
            this.selectNodeInEntGraph(node.data.data.personId);
        }

        var diagram = node.diagram;
        if (diagram === null) return;


            if(that.isCheck){
                var index = _.indexOf(that.selectKey, node.data.key);

                if (index != -1) {
                    that.selectKey.splice(index, 1);
                } else {
                    that.selectKey.push(node.data.key);
                }

                if (_.isEmpty(that.selectKey)){
                    icon.fill = "#6B96FF";
                } else {
                    _.each(that.selectKey , (item) =>{
                        if(item === node.data.key){
                            icon.fill = "#66FAC1";
                        } else {
                            if(node.data.isInit)
                                {
                                    icon.fill = colors.orange;
                                }
                                    else
                                {
                                    icon.fill = "#6B96FF";
                                }
                        }
                    })
                }
                var findNodes = _.union(that.selectKey);
                var existNodes = _.union(findNodes);

            } else {
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
                    that.selectKey.push(node.data.key);
                    var index = _.indexOf(that.selectKey, node.data.key);
                    if (index != -1) {
                        that.selectKey.length = 0;
                        that.selectKey.push(node.data.key);
                    } else {
                        that.selectKey.splice(index, 1);
                    }
                    diagram.select(node);

                }

            }

    }

    selectNodeInPeoGraph(personId){
        var node = this.peopleDiagram.findNodeForKey(personId);
        if (node){
            this.peopleDiagram.centerRect(node.actualBounds);
            if(!node.isSelected){
                this.peopleDiagram.select(node);
            }
        }else {
            //清除选中
            _.each(selectedObjs, (item)=> {
                item.fill = "#6B96FF";
            });
        }

    }

    selectNodeInEntGraph(personId){
        var nodes = [];
        this.entityDiagram.nodes.each(function(node){
            var id = node.data.data.personId;
            if(node.data.data.personId == personId){
                nodes.push(node);
            }
        });
        if(nodes.length > 0){
            _.each(nodes,node=>{
                if(!node.data.data.isCenter){
                    node.fill = "#66FAC1";
                    this.entityDiagram.select(node);
                }
            })
        }
    }


    onSelectionChanged(node) {
        var that = this.props;
        var icon = node.findObject("Icon");

        var diagram = node.diagram;
        if (diagram === null) return;
        if(that.isEditState)
        {
          node.selectionAdorned = true;
        }
        else
        {
          node.selectionAdorned = false;
        }
        if(!that.isCheck){
            if (node.isSelected) {

                icon.fill = "#66FAC1";  
                _.each(diagram.model.linkDataArray,function(item,index){
                    let key = item.data.key;
                    if(!_.isEmpty(key.split("-")) && key.split("-").length == 2){
                        let fromId = key.split("-")[0];
                        let toId = key.split("-")[1];
                        if(fromId == node.data.data.key || toId == node.data.data.key)
                        {
                            var linkObject = diagram.findLinkForData(item);
                            linkObject.isShadowed = true;
                        }
                    }                  
                });              
            }else {
                if(node.data.isInit)
                {
                  icon.fill = colors.orange;
                }
                else
                {
                  icon.fill = "#6B96FF";
                }
                _.each(diagram.model.linkDataArray,function(item,index){
                            var linkObject = diagram.findLinkForData(item);
                            linkObject.isShadowed = false;
                    });
            }
        }

    }

    linkClickShow(event,link) {

        var diagram = link.diagram;
        if (diagram === null) return;
        if (link.isSelected && !link.diagram.isOverview) {
            this.props.onLinkClicked(event,link);
        }
    }



    getDeletedData(diagram,mode , analysisData) {
        let newSelectData = {
            people:[],
            entity:[]
        };
        var linkDataArray = [];
        var nodeDataArray = [];
        var newLinkDataArray;
        var newNodeDataArray;


        let modelNodeDataArray = []
        _.each(diagram.model.nodeDataArray , (item)=>{
            if(item.visible == true){
                modelNodeDataArray.push(item)
            };
        })

        let modelLinkDataArray = []

        _.each(diagram.model.linkDataArray , (item)=>{
            if(item.visible == true){
                modelLinkDataArray.push(item)
            };
        })


        if(diagram.selection.count == 0)
        {
            Notify.simpleNotify('错误', '删除失败，未选中任何节点。', 'error');
            return;
        }
        if(diagram.type == 'people')
        {
            beforeNodeArray.push(modelNodeDataArray);
            beforeLinkArray.push(modelLinkDataArray);
        }
        else if(diagram.type == 'entity')
        {
            entityNodeArray.push(modelNodeDataArray);
            entityLinkArray.push(modelLinkDataArray);
        }
        var it = diagram.selection.iterator;

        while (it.next()) {
            var selnode = it.value;
            if (selnode instanceof go.Node && selnode.data != null ) {
                nodeDataArray.push(selnode.data);
            }
            else if(selnode instanceof go.Link && selnode.data != null){
                linkDataArray.push(selnode.data);
            }
        }

        _.each(nodeDataArray , (item)=>{
            if(item.isInit)
            {
                item.color = colors.orange;
            }
            else
            {
                item.color = "#6B96FF";
            }
        })

        newNodeDataArray = _.difference(modelNodeDataArray , nodeDataArray);
        newLinkDataArray = _.difference(modelLinkDataArray , linkDataArray);

        newNodeDataArray = _.sortBy(newNodeDataArray , function (item) {
            return -item.personDegree;
        })

        
        if(!_.isEmpty(newNodeDataArray))
        {
            newNodeDataArray[0].color = colors.activeFill;
        }

        if(diagram.type == 'people')
        {
            newSelectData.people=[newNodeDataArray,newLinkDataArray];
        }
        else if(diagram.type == 'entity')
        {
            newSelectData.entity=[newNodeDataArray,newLinkDataArray];
        }


        var node = [] ; var edgs = [];
        if(!this.props.isEntityRelation && !_.isEmpty(newSelectData.people)){

            _.each(newSelectData.people[0] , (item)=>{
                node.push(item.data);
            })
            _.each(newSelectData.people[1] , (item)=>{
                edgs.push(item.data);
            })
            newSelectData.entity = [node,edgs];

            let selectPersonId = {};
            _.each(newSelectData.entity[0] , (item) =>{
                selectPersonId[item.personId] = true;
            })

            newSelectData.entity[0] = _.filter(analysisData.nodes.nodes , (item)=>{
                return selectPersonId[item.personId];
            })

            var selectEdges = {};
            _.each(newSelectData.entity[0] , (item) =>{
                selectEdges[item.nodeId] = true;
            })

            newSelectData.entity[1]=_.filter(analysisData.nodes.edges , (edges) => {
                return selectEdges[edges.toNodeId] || selectEdges[edges.fromNodeId];
            })
            let entityLinkDataArray = [];
            let entitynNodeDataArray = [];
            _.each(newSelectData.entity[0], (node) => {
                if(node.isInit)
                {
                    entitynNodeDataArray.push({
                        key: node.nodeType+'-'+node.nodeId,
                        text: dealWithNodeTitle(node.nodeTitle),
                        geo: getIconNameOfType(node.nodeType).icon,
                        color: "#f0862d",
                        data: node,
                        isInit:true,
                        visible : true
                    });
                }
                else
                {
                    entitynNodeDataArray.push({
                        key: node.nodeType+'-'+node.nodeId,
                        width : 45,
                        text: dealWithNodeTitle(node.nodeTitle),
                        geo: getIconNameOfType(node.nodeType).icon,
                        color: "#6B96FF",
                        data: node,
                        visible : true
                    });
                }
            });

            _.each(newSelectData.entity[1] , (edges)=>{
                entityLinkDataArray.push({
                    key: generateLinkKey(edges.fromNodeType+'-'+edges.fromNodeId, edges.toNodeType+'-'+edges.toNodeId),
                    from: edges.fromNodeType+'-'+edges.fromNodeId,
                    to: edges.toNodeType+'-'+edges.toNodeId,
                    // text: generateLinkTitle(nextNode.linkDetail),
                    data: edges,
                    visible : true
                });

            })
            entitynNodeDataArray=initEntityGraph(entitynNodeDataArray);
            newSelectData.entity = [entitynNodeDataArray,entityLinkDataArray];
        }


        if (this.props.isEntityRelation && !_.isEmpty(newSelectData.entity)){
            _.each(newSelectData.entity[0] , (item)=>{
                node.push(item.data);
            })
            _.each(newSelectData.entity[1] , (item)=>{
                edgs.push(item.data);
            })
            newSelectData.people = [node,edgs];

            let selectPersonId = {};
            _.each(newSelectData.people[0] , (item) =>{
                selectPersonId[item.personId] = true;
            })

            newSelectData.people[0] = _.filter(analysisData.persons.persons , (item)=>{
                return selectPersonId[item.personId];
            })

            var selectEdges = {};
            _.each(newSelectData.people[0] , (item) =>{
                selectEdges[item.personId] = true;
            })

            newSelectData.people[1]=_.filter(analysisData.persons.edges , (edges) => {
                return selectEdges[edges.toPersonId] || selectEdges[edges.fromPersonId];
            })
            let peopleLinkDataArray = [];
            let peoplenNodeDataArray = [];
            var preId = "";
            _.each(newSelectData.people[0], (person)=> {
                var node_color = "#6B96FF";
                if(person.isInit)
                {
                    peoplenNodeDataArray.push({
                        key: person.personId,
                        text: person.personName,
                        color: "#f0862d",
                        geo: "cert",
                        hoverColor : "#f0862d",
                        personDegree:person.personDegree,
                        data: person,
                        isInit:true,
                        visible : true
                    });
                }
                else
                {
                    peoplenNodeDataArray.push({
                        key: person.personId,
                        text: person.personName,
                        color: node_color,
                        geo: "cert",
                        personDegree:person.personDegree,
                        data: person,
                        visible : true
                    });
                }
                preId = person.personId;
            });
            _.each(newSelectData.people[1] , (edges) =>{
                peopleLinkDataArray.push({
                    key: generateLinkKey(edges.fromPersonId,edges.toPersonId),
                    from: edges.fromPersonId,
                    to:  edges.toPersonId,
                    data:edges,
                    visible : true
                })
            })
            newSelectData.people = [peoplenNodeDataArray,peopleLinkDataArray];
        }



        store.dispatch({type: 'ADD_TREE_DATA', selectKey: selectKey, selectData:newSelectData, beforeNodeArray:beforeNodeArray, beforeLinkArray:beforeLinkArray,
            entityNodeArray:entityNodeArray, entityLinkArray:entityLinkArray, source: mode, isTreeButton: true});
    }

    getSelectData(diagram,mode,isInit,selects,analysisData) {
        let newSelectData = {
            people:[],
            entity:[]
        };
        var linkDataArray = [];
        var nodeDataArray = [];

        let modelNodeDataArray = [];
        _.each(diagram.model.nodeDataArray , (item)=>{
            if(item.visible == true){
                modelNodeDataArray.push(item)
            };
        })

        let modelLinkDataArray = []

        _.each(diagram.model.linkDataArray , (item)=>{
            if(item.visible == true){
                modelLinkDataArray.push(item)
            };
        })


        if(isInit)
        {
            linkDataArray = modelLinkDataArray;
            nodeDataArray = modelNodeDataArray;
            if(!_.isEmpty(selects))
            {
                selectKey = selects;
            }   
            var node = [],link = [] ,linkId = [];
            _.each(nodeDataArray , (item)=>{
                node.push(item.key);
            })
            _.each(linkDataArray , (item)=>{
                link.push(item.from,item.to);

            })
            if(_.difference(_.uniq(node), _.uniq(link)) != ''){
                Notify.simpleNotify('错误', '请先框对应关系所需节点', 'error');
                return false;
            }      
        }
        else
        {
            var it = diagram.selection.iterator;
            while (it.next()) {
                var selnode = it.value;
                if (selnode instanceof go.Node && selnode.data != null) {
                    nodeDataArray.push(selnode.data);
                }
                else if(selnode instanceof go.Link && selnode.data != null){
                    linkDataArray.push(selnode.data);
                }
            }
            if(_.isEmpty(nodeDataArray) && _.isEmpty(linkDataArray)){
                //Notify.simpleNotify('错误', '保存失败，请先框选节点。', 'error');
                return;
            }



            if(diagram.type == 'people')
            {
                beforeNodeArray.push(modelNodeDataArray);
                beforeLinkArray.push(modelLinkDataArray);
            }
            else if(diagram.type == 'entity')
            {
                entityNodeArray.push(modelNodeDataArray);
                entityLinkArray.push(modelLinkDataArray);
            }

            if(diagram.type == 'people')
            {
                nodeDataArray = _.sortBy(nodeDataArray , function (item) {
                    return -item.data.personDegree;
                })
            }
            else if(diagram.type == 'entity')
            {
                nodeDataArray = _.sortBy(nodeDataArray , function (item) {
                    return -item.data.nodeDegree;
                })
            }

            
            _.each(nodeDataArray , (item)=>{
                if(item.isInit)
                {
                  item.color = colors.orange;
                }
                else
                {
                  item.color = "#6B96FF";
                }
            })
            if(!_.isEmpty(nodeDataArray))
            {
                nodeDataArray[0].color = colors.suggestNode;
            }
        }


        if(diagram.type == 'people')
        {
            newSelectData.people=[nodeDataArray,linkDataArray];
        }
        else if(diagram.type == 'entity')
        {
            newSelectData.entity=[nodeDataArray,linkDataArray];
        }



        var node = [] ; var edgs = [];
        if(!this.props.isEntityRelation && !_.isEmpty(newSelectData.people)){

            _.each(newSelectData.people[0] , (item)=>{
                node.push(item.data);
            })
            _.each(newSelectData.people[1] , (item)=>{
                edgs.push(item.data);
            })
            newSelectData.entity = [node,edgs];

            let selectPersonId = {};
            _.each(newSelectData.entity[0] , (item) =>{
                selectPersonId[item.personId] = true;
            })

            newSelectData.entity[0] = _.filter(analysisData.nodes.nodes , (item)=>{
                return selectPersonId[item.personId];
            })

            var selectEdges = {};
            _.each(newSelectData.entity[0] , (item) =>{
                selectEdges[item.nodeId] = true;
            })

            newSelectData.entity[1]=_.filter(analysisData.nodes.edges , (edges) => {
                return selectEdges[edges.toNodeId] && selectEdges[edges.fromNodeId];
            })
            let entityLinkDataArray = [];
            let entitynNodeDataArray = [];
            _.each(newSelectData.entity[0], (node) => {
                if(node.isInit)
                {
                    entitynNodeDataArray.push({
                        key: node.nodeType+'-'+node.nodeId,
                        text: dealWithNodeTitle(node.nodeTitle),
                        geo: getIconNameOfType(node.nodeType).icon,
                        color: "#f0862d",
                        data: node,
                        isInit:true,
                        visible : true
                    });
                }
                else
                {
                    entitynNodeDataArray.push({
                        key: node.nodeType+'-'+node.nodeId,
                        width : 45,
                        text: dealWithNodeTitle(node.nodeTitle),
                        geo: getIconNameOfType(node.nodeType).icon,
                        color: "#6B96FF",
                        data: node,
                        visible : true
                    });
                }
            });

            _.each(newSelectData.entity[1] , (edges)=>{
                entityLinkDataArray.push({
                    key: generateLinkKey(edges.fromNodeType+'-'+edges.fromNodeId, edges.toNodeType+'-'+edges.toNodeId),
                    from: edges.fromNodeType+'-'+edges.fromNodeId,
                    to: edges.toNodeType+'-'+edges.toNodeId,
                    // text: generateLinkTitle(nextNode.linkDetail),
                    data: edges,
                    visible : true
                });

            })
            entitynNodeDataArray=initEntityGraph(entitynNodeDataArray);
            newSelectData.entity = [entitynNodeDataArray,entityLinkDataArray];

        }


        if (this.props.isEntityRelation && !_.isEmpty(newSelectData.entity)){
            _.each(newSelectData.entity[0] , (item)=>{
                node.push(item.data);
            })
            _.each(newSelectData.entity[1] , (item)=>{
                edgs.push(item.data);
            })
            newSelectData.people = [node,edgs];

            let selectPersonId = {};
            _.each(newSelectData.people[0] , (item) =>{
                selectPersonId[item.personId] = true;
            })

            newSelectData.people[0] = _.filter(analysisData.persons.persons , (item)=>{
                return selectPersonId[item.personId];
            })

            var selectEdges = {};
            _.each(newSelectData.people[0] , (item) =>{
                selectEdges[item.personId] = true;
            })

            newSelectData.people[1]=_.filter(analysisData.persons.edges , (edges) => {
                return selectEdges[edges.toPersonId] &&selectEdges[edges.fromPersonId];
            })
            let peopleLinkDataArray = [];
            let peoplenNodeDataArray = [];
            var preId = "";
            _.each(newSelectData.people[0], (person)=> {
                var node_color = "#6B96FF";
                if(person.isInit)
                {
                    peoplenNodeDataArray.push({
                        key: person.personId,
                        text: person.personName,
                        color: "#f0862d",
                        geo: "cert",
                        hoverColor : "#f0862d",
                        personDegree:person.personDegree,
                        data: person,
                        isInit:true,
                        visible : true
                    });
                }
                else
                {
                    peoplenNodeDataArray.push({
                        key: person.personId,
                        text: person.personName,
                        color: node_color,
                        geo: "cert",
                        personDegree:person.personDegree,
                        data: person,
                        visible : true
                    });
                }
                preId = person.personId;
            });
            _.each(newSelectData.people[1] , (edges) =>{
                peopleLinkDataArray.push({
                    key: generateLinkKey(edges.fromPersonId,edges.toPersonId),
                    from: edges.fromPersonId,
                    to:  edges.toPersonId,
                    data:edges,
                    visible : true
                })
            })
            newSelectData.people = [peoplenNodeDataArray,peopleLinkDataArray];
        }

        store.dispatch({type: 'ADD_TREE_DATA', selectKey: selectKey, selectData:newSelectData, beforeNodeArray:beforeNodeArray, beforeLinkArray:beforeLinkArray,
        entityNodeArray:entityNodeArray, entityLinkArray:entityLinkArray, source: mode, isTreeButton: true});

    }


    renderPeopleRelation(containerId,isOverview) {

        function layout() {

            var lay = myDiagram.layout;

            var maxIter = 70;
            maxIter = parseInt(maxIter, 10);
            lay.maxIterations = maxIter;

            var epsilon = 0.1;
            epsilon = parseFloat(epsilon, 10);
            lay.epsilon = epsilon;

            var infinity = 1000;
            infinity = parseFloat(infinity, 10);
            lay.infinity = infinity;

            var arrangement = [800,800];
            var arrangementSpacing = new go.Size();
            arrangementSpacing.width = parseFloat(arrangement[0], 10);
            arrangementSpacing.height = parseFloat(arrangement[1], 10);
            lay.arrangementSpacing = arrangementSpacing;

            var charge = 1500;
            charge = parseFloat(charge, 10);
            lay.defaultElectricalCharge = charge;

            var mass = 3000;
            mass = parseFloat(mass, 10);
            lay.defaultGravitationalMass = mass;

            var stiffness = 0.1;
            stiffness = parseFloat(stiffness, 10);
            lay.defaultSpringStiffness = stiffness;

            var length = 0.1;
            length = parseFloat(length, 10);
            lay.defaultSpringLength = length;

        }

        function ContinuousForceDirectedLayout() {
            go.ForceDirectedLayout.call(this);
            this._isObserving = false;
        }

        go.Diagram.inherit(ContinuousForceDirectedLayout, go.ForceDirectedLayout);

        /** @override */
        ContinuousForceDirectedLayout.prototype.isFixed = function (v) {
            return v.node.isSelected ;
        }

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
            let data =store.getState().target;
            var diagram = node.diagram;
            if (!diagram || diagram.isReadOnly) return;

            if(!node.isSelected && !data.isCheck ){
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

        }

        var myDiagram = goMake(go.Diagram, containerId, {
            "undoManager.isEnabled": true,
            scrollMode: go.Diagram.InfiniteScroll,
            "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
            initialContentAlignment: go.Spot.Center,
            initialAutoScale: go.Diagram.Uniform,
            layout:goMake(ContinuousForceDirectedLayout , {


            }),
            allowHorizontalScroll:true,
            allowVerticalScroll:true,
            maxSelectionCount:1,
            hoverDelay: 100,
            allowClipboard:false,
            dragSelectingTool:
                goMake(RealtimeDragSelectingTool,
                    { isPartialInclusion: false, delay: 50 },
                    { box: goMake(go.Part,
                        { layerName: "Tool", selectable: false },
                        goMake(go.Shape,
                            { name: "SHAPE", fill: "rgba(255,0,0,0.1)",
                                stroke: "red", strokeWidth: 2 })) }
                )
        });
        myDiagram.toolManager.dragSelectingTool.isEnabled = false;

        var nodesAndLinks = this.props.peopleData;

        var data =store.getState().target;

            myDiagram.nodeTemplate =
                goMake(go.Node, "Spot", nodeStyle(), {
                        deletable: false,
                        locationSpot: go.Spot.Center,
                        click: this.onIconClick,
                        // selectionAdorned:false,
                        selectionChanged: this.onSelectionChanged
                    }, makeIconTextNode({radius: 45}),new go.Binding("visible", "visible").makeTwoWay()

                );

            myDiagram.linkTemplate = goMake(go.Link,
                {
                    click:this.onLinkClick,
                    relinkableFrom: true, relinkableTo: true,
                    toShortLength: 4,  fromShortLength: 2,
                    shadowOffset: new go.Point(0, 0), shadowBlur: 5, shadowColor: "red",
                },
                new go.Binding("isShadowed", "isSelected").ofObject(),new go.Binding("visible", "visible").makeTwoWay(),
                goMake(go.Shape,{ strokeWidth: 2},
                    new go.Binding("stroke", "line_color"))
            );

        layout();

        if(_.isEmpty(this.props.selectData.people))
        {
            myDiagram.model = new go.GraphLinksModel(nodesAndLinks.nodes , nodesAndLinks.links);
        }
        else
        {
            // if(data.showingEntityRelation){

            myDiagram.model = new go.GraphLinksModel(this.props.selectData.people[0] , this.props.selectData.people[1]);
            // this.dealWithInitGragh(myDiagram);
            // } else {
            //     myDiagram.model = new go.GraphLinksModel(nodesAndLinks.nodes , nodesAndLinks.links);
            // }

        }


        myDiagram.isOverview = isOverview;
        myDiagram.type = 'people';
        this.peopleDiagram = myDiagram;



    }

    renderEntityRelation(containerId,isOverview) {

        function layout() {

            var lay = myDiagram.layout;

            var maxIter = 100;
            maxIter = parseInt(maxIter, 10);
            lay.maxIterations = maxIter;

            var epsilon = 1;
            epsilon = parseFloat(epsilon, 10);
            lay.epsilon = epsilon;

            var infinity = 1000;
            infinity = parseFloat(infinity, 10);
            lay.infinity = infinity;

            var arrangement = [300,300];
            var arrangementSpacing = new go.Size();
            arrangementSpacing.width = parseFloat(arrangement[0], 10);
            arrangementSpacing.height = parseFloat(arrangement[1], 10);
            lay.arrangementSpacing = arrangementSpacing;

            var charge = 3000;
            charge = parseFloat(charge, 10);
            lay.defaultElectricalCharge = charge;

            var mass = 1000;
            mass = parseFloat(mass, 10);
            lay.defaultGravitationalMass = mass;

            var stiffness = 0.1;
            stiffness = parseFloat(stiffness, 10);
            lay.defaultSpringStiffness = stiffness;

            var length = 0.1;
            length = parseFloat(length, 10);
            lay.defaultSpringLength = length;

        }

        function ContinuousForceDirectedLayout() {
            go.ForceDirectedLayout.call(this);
            this._isObserving = false;
        }

        go.Diagram.inherit(ContinuousForceDirectedLayout, go.ForceDirectedLayout);

        /** @override */
        ContinuousForceDirectedLayout.prototype.isFixed = function (v) {
            return v.node.isSelected ;
        }

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
            let data =store.getState().target;
            var diagram = node.diagram;
            if (!diagram || diagram.isReadOnly) return;

            if(!node.isSelected && !data.isCheck ){
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

        }

        var myDiagram = goMake(go.Diagram, containerId, {
            "undoManager.isEnabled": true,
            scrollMode: go.Diagram.InfiniteScroll,
            "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
            initialContentAlignment: go.Spot.Center,
            initialAutoScale: go.Diagram.Uniform,
            layout:goMake(ContinuousForceDirectedLayout , {
                // infinityDistance:100,
                // defaultCommentElectricalCharge:1000,
                // maxIterations:20,

            }),
            allowHorizontalScroll:true,
            allowVerticalScroll:true,
            maxSelectionCount:1,
            hoverDelay: 100,
            allowClipboard:false,
            dragSelectingTool:
              goMake(RealtimeDragSelectingTool,
                { isPartialInclusion: false, delay: 50 },
                { box: goMake(go.Part,  
                         { layerName: "Tool", selectable: false },
                         goMake(go.Shape,
                           { name: "SHAPE", fill: "rgba(255,0,0,0.1)",
                             stroke: "red", strokeWidth: 2 })) }
              )
        });
        myDiagram.toolManager.dragSelectingTool.isEnabled = false;

        var nodesAndLinks = this.props.entityData;

        var data =store.getState().target;

        myDiagram.nodeTemplate = goMake(go.Node, "Auto", nodeStyle() ,{
                // movable:false,
                locationSpot: go.Spot.Center,
                click: this.entityClick,
                // selectionAdorned:false,
                selectionChanged: this.onSelectionChanged
            },makeIconTextNode(),new go.Binding("location", "location").makeTwoWay(),new go.Binding("visible", "visible").makeTwoWay()
        );

        myDiagram.linkTemplate = goMake(go.Link,
            {
                click: this.onLinkClick,
                relinkableFrom: true, relinkableTo: true,
                toShortLength: 4,  fromShortLength: 2,
                shadowOffset: new go.Point(0, 0), shadowBlur: 5, shadowColor: "red",
            },
            new go.Binding("isShadowed", "isSelected").ofObject(),new go.Binding("visible", "visible").makeTwoWay(),

            goMake(go.Shape, { strokeWidth: 3, stroke: '#424242' , scale: 1}),
            {
                click:this.onLinkClick
            }
        );
        layout();

        if(_.isEmpty(this.props.selectData.entity))
        {
            myDiagram.model = new go.GraphLinksModel(nodesAndLinks.nodes , nodesAndLinks.links);
        }
        else
        {
            // if(data.showingEntityRelation){

                myDiagram.model = new go.GraphLinksModel(this.props.selectData.entity[0] , this.props.selectData.entity[1]);
                // this.dealWithInitGragh(myDiagram);
            // } else {
            //     myDiagram.model = new go.GraphLinksModel(nodesAndLinks.nodes , nodesAndLinks.links);
            // }

        }


        myDiagram.type = 'entity';
        this.entityDiagram = myDiagram;
        myDiagram.isOverview = isOverview;



    }

    selectNodeByKey(nodeKey) {
        var diagram =  this.peopleDiagram;
        var selected = diagram.findNodeForKey(nodeKey);
        diagram.centerRect(selected.actualBounds);
        diagram.select(selected);
        selected.click(null, selected);
    }
    // dealWithInitGragh(diagram){
    //   var it = diagram.nodes.iterator;
    //   while (it.next()) {
    //       var node = it.value;
    //       if (node instanceof go.Node && node.data != null) {
    //           if(node.data.color == colors.activeFill)
    //           {
    //              node.isSelected = true;
    //              // that.selectKey.push(node.data.key);
    //           }
    //       }
    //   }
    // }

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


function generateLinkKey(from, to) {
    return from < to ? from + '-' + to : to + '-' +  from
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

    var container = window.document.getElementById('body-wrapper');

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
            },  new go.Binding("fill", "color").makeTwoWay() , new go.Binding("width", "width").makeTwoWay() , new go.Binding("height", "height").makeTwoWay()),
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


function showPorts(node, show ) {
    var data =store.getState().target;
    var diagram = node.diagram;
    if (!diagram || diagram.isReadOnly) return;

    if(!node.isSelected && !data.isCheck ){
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