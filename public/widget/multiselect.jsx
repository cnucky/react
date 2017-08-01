var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
require('./bootstrap-multiselect.js');
var DESELECT = -1;

var MultiSelect = React.createClass({
    componentDidMount: function() {
        var cfg = {
            dropAuto: true,
            maxHeight: 300,
            buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14'
        };
        if (this.props.config) {
            cfg = _.extend(cfg, this.props.config);
        }
        cfg.onChange = _.bind(function(option, checked, select) {
            if (_.isFunction(this.props.onChange)) {
                var isNoneItem = this.props.firstNoneItem && this.props.firstNoneItem.value == option.val(); 
                if(this.props.onChange(this.props.identity, option, checked, select, isNoneItem) === DESELECT) {
                    $(this.refs.multiselect).multiselect('deselect', $(option).val());
                }
            }
        }, this);
        $(this.refs.multiselect).multiselect(cfg).multiselect('dataprovider', this.getDataList(this.props));
    },
    componentWillReceiveProps: function(nextProps) {
        if (!_.isEqual(this.props.data, nextProps.data) || nextProps.forceUpdate) {
            $(this.refs.multiselect).multiselect('dataprovider', this.getDataList(nextProps));
        }
    },
    componentWillUnmount: function() {
        $(this.refs.multiselect).multiselect('destroy');
    },
    render: function() {
        var singleDefaultNone = !this.props.multiple && this.props.singleDefaultNone;
        return (
            <select ref="multiselect" multiple={this.props.multiple} style={{display:'none'}} size={singleDefaultNone ? 2 : 1}>
            </select>
        )
    },

    getDataList: function(props) {
        if (props.firstNoneItem) {
            return [props.firstNoneItem].concat(props.data)
        } else {
            return props.data
        }
    }
});

module.exports = MultiSelect;
