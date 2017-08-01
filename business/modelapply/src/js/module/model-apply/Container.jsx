import React from 'react';
var DropTarget = require('react-dnd').DropTarget;
var _ = require('underscore');
var store = require('./model-apply-store');
var Target = require('./Target').Target;
import {Footer} from './Components';
import {Describe} from './Components';


/** DropTarget */

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        didDrop: monitor.didDrop(),
        item: monitor.getItem()
    }
}

var Container = React.createClass({

    propTypes: {
        editable: React.PropTypes.bool.isRequired
    },

    componentWillReceiveProps(nextProps) {
        if(nextProps.isOver && nextProps.item && nextProps.item.name) {
            let match = _.find(nextProps.components, (component) => {
                return component.identity == -1;
            })
            _.isUndefined(match) && store.dispatch({ type: 'COMPONENT_IN', name: nextProps.item.name });
        }
        else if(!nextProps.didDrop && nextProps.item && nextProps.item.name)  {
            let match = _.find(nextProps.components, (component) => {
                return component.identity == -1;
            })
            match && store.dispatch({ type: 'COMPONENT_OUT' });
        }
        else if(nextProps.didDrop && nextProps.item && nextProps.item.name) {
            let match = _.find(nextProps.components, (component) => {
                return component.identity == -1;
            })
            match && store.dispatch({ type: 'COMPONENT_DROP', opacity: 1 });
        }
    },

	render() {
        var connectDropTarget = this.props.connectDropTarget;
        
        if(!this.props.editable)
		    return connectDropTarget(<div className="target-wrap" style={{width: '100%',border: '1px solid transparent', overflow: 'auto'}}>
					                    <Target fontSize={this.props.fontSize} components={this.props.components} editable={this.props.editable} />
                                    </div>);
        else
            return (<div className="target-wrap" style={{width: '100%', border: '1px solid transparent', overflow: 'auto'}}>
					    <Target fontSize={this.props.fontSize} components={this.props.components} editable={this.props.editable} />
                        <Footer describe={this.props.describe} fontSize={this.props.fontSize} editable={this.props.editable}/>
                    </div>);
	}
});

module.exports = DropTarget("SAMPLE", {}, collect)(Container);