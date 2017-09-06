import React from 'react';
import {Header} from './Components';
import Container from './Container';
import {Card} from 'antd';
var store = require('./model-apply-store');
var manager = require('./modelapply-manager');
require('./model-apply.less');

var App = React.createClass({

    propTypes: {
        editable: React.PropTypes.bool.isRequired
    },

	componentDidMount() {

        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        })

        var solidId = this.props.solidId;


        if(solidId){

            manager.openApply(solidId).then(function () {
                manager.getAllData().then(function () {

                });
            });
        }

    },

    componentWillReceiveProps: function (nextProps) {
        if(nextProps.solidId && nextProps.solidId!=this.props.solidId){
            manager.openApply(nextProps.solidId).then(function () {
                manager.getAllData().then(function () {

                });
            });
        }
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
        var asWidget = this.props.asWidget;
        var data = store.getState().data;
        var components = data.viewDetail.components;
        var title = data.viewDetail.appName;
        var describe = data.viewDetail.appDescribe;
        var theme = data.viewDetail.style;
        var classString = "mauto";
        if(theme && theme.isSelected && !this.props.editable)
            classString += " active";
        return (
            <Card className={classString} style={{width:asWidget?'100%':theme.cardWidth,height:'100%',marginTop: asWidget?0:'30px',background:theme.bodyBackgroundColor,color:theme.bodyContentColor}}
                onClick={this.props.editable ? null : this.cardClickHandler} bodyStyle={{padding: '0 0 10px 0', height: '100%'}}>
                <Header title={title} style={{height:'70px',lineHeight:'70px',background:theme.titleBackgroundColor,color:theme.titleContentColor,fontSize:theme.titleFontSize}}/>
                <Container asWidget describe={describe} fontSize={theme.bodyFontSize} components={components} editable={this.props.editable} />
            </Card>
        );
    }
});

module.exports = App;