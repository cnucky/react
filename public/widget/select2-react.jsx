var React = require('react');
var $ = require('jquery');
require('utility/select2/select2');
require('utility/select2/i18n/zh-CN');
$.fn.select2.defaults.set('width', '100%');

var Select2 = React.createClass({
	propTypes: {
		config: React.PropTypes.object,
		defaultValue: React.PropTypes.string,
		onChange: React.PropTypes.func,
		fetchDefaultData: React.PropTypes.func.isRequired
	},
	updateConfig: function(props) {
		var cfg = {
			language: 'zh-CN'
		};
		if(props.config) {
			cfg = _.extend(cfg, props.config);
		}
		$(this.refs.select2).select2(cfg);
		props.fetchDefaultData(props.defaultValue).then(function(data) {
			_.each(data, function(dataItem) {
				$(this.refs.select2).append($('<option></option>').text(dataItem.text).val(dataItem.id));
			}.bind(this))
			$(this.refs.select2).select2(cfg);
			$(this.refs.select2).val(props.defaultValue);
		}.bind(this))			
		$(this.refs.select2).on('change', function(e) {
			if(props.onChange) {
				props.onChange(e);
			}
		}.bind(this));
	},
	componentDidMount: function() {
		this.updateConfig(this.props);
	},
	componentWillReceiveProps: function(nextProps) {
        if (!_.isEqual(this.props, nextProps)) {
            this.updateConfig(nextProps);
        }
    },
	componentWillUnmount: function() {
		$(this.refs.select2).parent().empty();
	},
	render: function() {
		return (
			<div>
			<select ref='select2' multiple={this.props.multiple} style={{display: 'none'}}>
			</select>
			</div>
			)
	}
});

module.exports = Select2;