var React = require('react');
var _ = require('underscore');
var store = require('./model-apply-store');
var ComponentSetting = require('./ComponentSetting');
var CardSetting = require('./CardSetting');

//view | SettingPanel
var SettingPanel = React.createClass({

    propTypes: {
        index: React.PropTypes.number
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

    render: function() {
        var data = store.getState().data;
        //get component properties
        var components = data.viewDetail.components;
        var component = _.find(components, _.bind(function(component) {
                return component.isSelected;
            }, this));    
        //get Card properties
        var card = data.viewDetail.style;
        var title = data.viewDetail.appName;
        var describe = data.viewDetail.appDescribe;

        return (
            <div>
                { component && <ComponentSetting  component={component} index={component.identity} />}
                { !component && <CardSetting card={card} title={title} describe={describe}/> }
            </div>
        );
    }
});

module.exports = SettingPanel;