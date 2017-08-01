import React from 'react';
import {Header} from './Components';
import Container from './Container';
import {Card} from 'antd';
var store = require('./model-apply-store');
var App = React.createClass({

    propTypes: {
        editable: React.PropTypes.bool.isRequired
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

    cardClickHandler() {
        store.dispatch({
            type: 'CHANGE_CARD_SELECT_MODE'
        });
    },

    render: function() {

        var data = store.getState().data;
        var components = data.viewDetail.components;
        var title = data.viewDetail.appName;
        var describe = data.viewDetail.appDescribe;
        var theme = data.viewDetail.style;
        var classString = "mauto";
        if(theme && theme.isSelected && !this.props.editable)
            classString += " active";
        return (
            <Card className={classString} style={{width:theme.cardWidth,height:'100%',marginTop: '30px',background:theme.bodyBackgroundColor,color:theme.bodyContentColor}}
                onClick={this.props.editable ? null : this.cardClickHandler} bodyStyle={{padding: '0 0 10px 0', height: '100%'}}>
                <Header title={title} style={{height:'70px',lineHeight:'70px',background:theme.titleBackgroundColor,color:theme.titleContentColor,fontSize:theme.titleFontSize}}/>
                <Container describe={describe} fontSize={theme.bodyFontSize} components={components} editable={this.props.editable} />
            </Card>
        );
    }
});

module.exports = App;