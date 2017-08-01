var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');
var MultiSelect = require('widget/multiselect');
var Provider = require('widget/i18n-provider');

var ColumnExtraction = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    handleSelectSemantic: function(item, option, checked, select) {
        if (this.props.onChange && typeof this.props.onChange === 'function') {
            this.props.onChange(parseInt(option.val()));
        }
    },
    render: function() {
        var {i18n} = this.context;
        return (<div className="form-group">
                    <label className="col-md-3 control-label">i18n.t("column-extraction-post.extraction-field")</label>
                    <div className="col-md-9">
                    {
                        <MultiSelect multiple="multiple" onChange={this.handleSelectSemantic} data={
                            _.map(this.props.column, function(item) {
                            return {
                                id: item.id,
                                label: item.content
                            }
                        })
                        }/>
                    }
                    </div>
                </div>)
    }
})

module.exports.ColumnExtraction = function(container, columnData) {
    ReactDOM.render(<Provider.default><ColumnExtraction column={columnData}/></Provider.default>, container);
}