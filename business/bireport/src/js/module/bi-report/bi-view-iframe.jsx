import React from 'react';
import {Card} from 'antd';
import {store} from './store';
import Themes from "./charts-themes";


/****************************************************************************
 * iFrame
 ****************************************************************************/

var IFrame = React.createClass({
	propsType: {
        oprQueue: React.PropTypes.object,
        editable: React.PropTypes.bool.isRequired,
        id: React.PropTypes.string.isRequired,
        isSelected: React.PropTypes.bool.isRequired,
        height: React.PropTypes.number.isRequired,
        iFrameProportion: React.PropTypes.string.isRequired, 
        iFrameUrl: React.PropTypes.string.isRequired
    },

    delBtnClickHandle(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'DELETE_LAYOUT',
            id: this.props.id
        });
    },

    iFrameClickHandle(e) {
        e.stopPropagation();
        store.dispatch({
            type: 'SELECT_LAYOUT',
            id: this.props.id
        });
    },

    dragEnterHandle(e) {
        e.stopPropagation();
        this.props.oprQueue.stopOpr();
    },

    dropHandle(e) {
        e.stopPropagation();
        this.props.oprQueue.stopOpr();
    },

    render() {
    	var iFrameStyle = {
            opacity: this.props.id === 0 ? '0.5' : '1', 
            marginBottom: '10px',
            border: "1px solid #D9D9D9"
    	}

        var theme = store.getState().card.theme;
        var cardStyle = {
            padding: '15px', 
            textAlign: 'center', 
            height:this.props.height - 2,
            // background: theme != 'none' ? Themes.importTheme(theme).backgroundColor : null
            background:Themes.importTheme(theme).backgroundColor 
        }

        if(this.props.editable) {
            return (
                <div style={iFrameStyle} onClick={this.iFrameClickHandle} onDrop={this.dropHandle} onDragEnter={this.dragEnterHandle}>
                    <Card className={this.props.isSelected ? 'border-none active' : 'border-none'}
                        style={cardStyle}>			
                        
                        <iFrame frameborder='0' scrolling="yes" style={{border: '1px dotted', width:this.props.iFrameProportion, height: this.props.height - 32}} src={this.props.iFrameUrl}/>
                        <i className="antd-icon antd-icon-cross" style={{ display:this.props.isSelected?'inline-block':'none', cursor:'pointer', position:'absolute', right:'5px', top:'5px' }} onClick={this.delBtnClickHandle} />
                    
                    </Card>
                </div>

            )
        }
        else {
            return (
                <div style={iFrameStyle}>
                    <Card className={this.props.isSelected ? 'border-none active' : 'border-none'} style={cardStyle}>			  
                        <iFrame frameborder='0' scrolling="yes" style={{border: '1px dotted', width:this.props.iFrameProportion, height: this.props.height - 32}} src={this.props.iFrameUrl}/>                    
                    </Card>
                </div>
            )
        }
    }
})

module.exports.IFrame = IFrame;