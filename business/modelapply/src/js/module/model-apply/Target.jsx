/**
 * Created by rhtkb on 2016/6/2.
 */
var React = require('react');
var _ = require('underscore');
var SubTarget = require('./Components').SubTarget;
var Target = React.createClass({

    propTypes: {
        editable: React.PropTypes.bool.isRequired
    },

    render: function() {
        return (
            <div>
                {
                    _.map(this.props.components, _.bind(function(component){
                        return <SubTarget isMultiple={component.condition.isMultiple} selectData={component.condition.selectData} value={component.condition.value} isRequired ={component.condition.isRequired} border={component.border} display={component.display} size = {component.size} hint = {component.condition.hint} isHide = {component.condition.hideOpr} fontSize={this.props.fontSize}  operationChar={component.condition.opr} title={component.condition.title}  index={component.identity} name={component.type} opacity={component.opacity} isSelected={component.isSelected} editable={this.props.editable} />;
                    }, this))
                }
            </div>
        );
    }
})

module.exports.Target = Target;