import uuid from 'node-uuid';
import React from 'react';
import {DropTarget} from 'react-dnd';
import {Card} from 'antd';
import {store, storeAPI} from './store';
import {Column} from './bi-view-column';
import {Tab} from './bi-view-tab';
import {IFrame} from './bi-view-iframe';
import Themes from "./charts-themes";

/** DropTarget */
function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        didDrop: monitor.didDrop(),
        item: monitor.getItem()
    }
}

var App = React.createClass({

    propTypes: {
        editable: React.PropTypes.bool.isRequired,
        oprQueue: React.PropTypes.object
    },

	componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        })
    },
    
    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    },

    getLayoutHeight(item) {
        return storeAPI.getHeight(item);
    },

    getCardMaxWidth() {
        var main_panel_padding = 40;
        var windowWidth = $(window).width();
        var toolBarWidth = 60;
        var samplePanelWidth ;
        if(document.getElementById('left-panel') != null){
            samplePanelWidth = document.getElementById('left-panel').offsetWidth;
        }else{
            samplePanelWidth = 200;
        }

        var settingPanelWidth = this.props.isRightShow ? 300 : 0 ;
        console.log(samplePanelWidth)

        if(this.props.editable)
            return windowWidth - toolBarWidth - samplePanelWidth - settingPanelWidth - main_panel_padding;
        else 
            return windowWidth - toolBarWidth - main_panel_padding;
    },

    pointerIsOver(dom, pointX, pointY) {
        var domWidthRange = [dom.offset().left, dom.offset().left + dom.outerWidth()];
        var domHeightRange = [dom.offset().top, dom.offset().top + dom.outerHeight()];
 
        if(pointX === 0 && pointY === 0)
            return true;

        if(pointX >= domWidthRange[0] && pointX <= domWidthRange[1] && pointY >= domHeightRange[0] && pointY <= domHeightRange[1])
            return true;
            
        return false;
    },

    clickHandle() {
        store.dispatch({ 'type':'SELECT_CARD' });
    },

    dragEnterHandle(e) {
        if(this.props.item.type === 'LAYOUT') {
            if(this.pointerIsOver($(e.currentTarget), e.clientX, e.clientY) && !storeAPI.cardExistLayoutIdEq(0)) {
                let dropTargetPosition = storeAPI.getPositionByCoordinate($(e.currentTarget).offset().top, e.clientY - $(e.currentTarget).offset().top + document.body.scrollTop);
                let action = { type:'MOVE_LAYOUT', layoutId:0, layoutType:this.props.item.name, dropTarget:'CARD', dropTargetPosition:dropTargetPosition };
                this.props.oprQueue.updateOpr(action);
            }
        }
        else if(this.props.item.type === 'CHART') {
            if(this.pointerIsOver($(e.currentTarget), e.clientX, e.clientY) && !storeAPI.cardExistChartIdEq(-1)) {
                let dropTargetPosition = storeAPI.getPositionByCoordinate($(e.currentTarget).offset().top, e.clientY - $(e.currentTarget).offset().top + document.body.scrollTop);
                let action = { type: 'MOVE_CHART', purpose:'PREVIEW', chartType: this.props.item.name, dropTarget: 'CARD', dropTargetPosition:dropTargetPosition };
                this.props.oprQueue.updateOpr(action);
            }
        }
    },

    dragLeaveHandle(e) {
        if(this.props.item){
            if(this.props.item.type === 'LAYOUT') {
                if(!this.pointerIsOver($(e.currentTarget), e.clientX, e.clientY)) {
                    this.props.oprQueue.stopOpr();
                    store.dispatch({ type:'DELETE_LAYOUT', id:0 });
                }
            }
            else if(this.props.item.type === 'CHART' && this.props.item.state === 'SAMPLE') {
                if(!this.pointerIsOver($(e.currentTarget), e.clientX, e.clientY)) {
                    this.props.oprQueue.stopOpr();
                    store.dispatch({ type:'DELETE_CHART', id:-1 });
                }
            }
        }

    },

    dropHandle(e) {
        if(this.props.item.type === 'LAYOUT' ) {
            if(storeAPI.cardExistLayoutIdEq(0)) {
                this.props.oprQueue.stopOpr();
                store.dispatch({ type:'DROP_LAYOUT' });
            }
            else {
                this.props.oprQueue.stopOpr();
                let dropTargetPosition = storeAPI.getPositionByCoordinate($(e.currentTarget).offset().top, e.clientY - $(e.currentTarget).offset().top + document.body.scrollTop );
                store.dispatch({ type:'MOVE_LAYOUT', layoutId:uuid.v1(), layoutType:this.props.item.name, dropTarget:'CARD', dropTargetPosition:dropTargetPosition });
            }
        }
        else if(this.props.item.type === 'CHART') {
            if(storeAPI.cardExistChartIdEq(-1)) {
                this.props.oprQueue.stopOpr();
                store.dispatch({ type:'DROP_CHART' });
            }
            else {
                this.props.oprQueue.stopOpr();
                let dropTargetPosition = storeAPI.getPositionByCoordinate($(e.currentTarget).offset().top, e.clientY - $(e.currentTarget).offset().top + document.body.scrollTop);
                store.dispatch({ type:'MOVE_CHART', purpose:'DROP', chartType: this.props.item.name, dropTarget: 'CARD', dropTargetPosition:dropTargetPosition });
            }
        }
    },

    render: function() {
        var data = store.getState();
        var framework = data.framework;
        var card = data.card;

        /** card style */
        var cardMaxWidth = this.getCardMaxWidth();

        var cardWidth;
        if(card.widthType === 'fix')
            cardWidth = '100%';
        else {
            cardWidth = card.width;
            (cardWidth === "") && (cardWidth = "100%");
        }

        var cardPadding = (card.showPadding ? card.padding : 0);
        (cardPadding === "") && (cardPadding = 0);

        var cardStyle = {
            minHeight: '95%',
            padding: cardPadding,
            paddingBottom:40,
            // background: card.theme != 'none' ? Themes.importTheme(card.theme).cardBackgroundColor : null
            background:Themes.importTheme(card.theme).cardBackgroundColor
        }

        /** name Style */
        var nameStyle = {
            height: "70px",
            lineHeight: "70px", 
            marginBottom: "10px",
            textAlign: "center",
            // color:: card.theme != 'none' ? Themes.importTheme(card.theme).textStyle.color : "#000",
            color:Themes.importTheme(card.theme).textStyle.color,
            fontSize: "18px",
            display: card.showName ? "block" : "none"
        } 

        /** card Component */
        var cardComponent = (
            <Card className={card.isSelected ? 'active' : ''} style={cardStyle}>
                <h1 style={nameStyle}>
                    { card.name === "" ? "未命名报表" : card.name }
                </h1>
                
                { 
                    _.map(framework, function(item) {                            
                        var layoutProps = storeAPI.getLayoutByID(item.id);
                        var layoutHeight = this.getLayoutHeight(item);

                        if(item.type === 'TAB') {
                            return <Tab {...layoutProps} childNodes={item.children} height={layoutHeight} oprQueue={this.props.oprQueue} editable={this.props.editable} />;
                        }
                        else if(item.type === 'COLUMN') {
                            return <Column {...layoutProps} childNodes={item.children} height={layoutHeight} oprQueue={this.props.oprQueue} editable={this.props.editable} />
                        }
                        else if(item.type === 'IFRAME') {
                            return <IFrame {...layoutProps} oprQueue={this.props.oprQueue} editable={this.props.editable} />
                        }
                    }.bind(this))
                }
            </Card>
        );

        /** return */
        if(this.props.editable) {
            var connectDropTarget = this.props.connectDropTarget;
            return connectDropTarget(
                <div id="card-container" style={ {maxWidth:cardMaxWidth, overflow:'auto',height:'100%' }}>
                    <div id='card-instance' style={{ margin:'30px auto 0px', width:cardWidth , height:'95%' }} onClick={this.clickHandle} onDrop={this.dropHandle} onDragEnter={this.dragEnterHandle} onDragLeave={this.dragLeaveHandle}>
                        {cardComponent}                
                    </div>
                </div>
            );
        }
        else {
            return (
                <div id="card-container" style={{  overflow:'auto' , height:'100%'}}>
                    <div id='card-instance' style={{marginTop:'50px',marginLeft:'10px',marginRight:'10px',height:'95%' }}>
                        {cardComponent}                
                    </div>
                </div>
            );
        }
    }
});
module.exports.App = DropTarget("BI_REPORT", {}, collect)(App);