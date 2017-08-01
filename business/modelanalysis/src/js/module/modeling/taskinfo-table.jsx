var React = require('react');
var _ = require('underscore');
var ReactDOM = require('react-dom');
var Provider = require('widget/i18n-provider');

var timeId;
var index;

var TaskInfoTable = React.createClass({
	contextTypes: {
		i18n: React.PropTypes.object
	},
	getInitialState: function() {
		return this.getStateFromProps(this.props, null)
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState(this.getStateFromProps(nextProps))
	},
	getStateFromProps: function(props) {
		var taskInfo = props.data;
		if (!_.isEmpty(props.sortBy)) {
			taskInfo = _.sortBy(taskInfo, props.sortBy);
		}
		return {
			taskInfo: taskInfo,
			selectedNode: props.selectedNode
		};
	},
	handleClicked: function(e) {
		index = $(e.target.parentElement).attr('data-index');
		this.setState({selectedNode: this.state.taskInfo[index].nodeId});
		timeId = setTimeout(function() {
			this.props.taskInfoClicked(this.state.taskInfo[index].nodeId);
		}.bind(this), 100)
	},
	handleDoubleClicked: function(e) {
		this.setState({selectedNode: this.state.taskInfo[index].nodeId});
		clearTimeout(timeId);
		this.props.taskInfoDoubleClicked(this.state.taskInfo[$(e.target.parentElement).attr('data-index')].nodeId);
	},
	render: function() {
		var {i18n} = this.context;
		var table = _.map(this.state.taskInfo, _.bind(function (node,index) {
			return (
				<tr style={node.nodeId == this.state.selectedNode? {backgroundColor: '#DFEBF2', cursor: 'pointer'}: {backgroundColor: '', cursor: 'pointer'}}
				data-index={index} key={index} onClick={this.handleClicked} onDoubleClick={this.handleDoubleClicked}>
					<td className="p6 text-center">{node.taskId}</td>
					<td className="p6 text-center">{node.nodeName}</td>
					<td className="p6 text-center">{node.taskStateLabel}</td>
					<td className="p6 text-center">{node.startTime}</td>
					<td className="p6 text-center">{node.finishTime}</td>
					<td className="p6 text-center">{node.resultCount}</td>
				</tr>
            )
        }, this));

        return (
            <div>
				<table className="table">
					<thead>
					<tr>
						<th className="sortable text-center">{i18n.t('taskinfo-table.taskid')}</th>
						<th className="sortable text-center">{i18n.t('taskinfo-table.nodeName')}</th>
						<th className="sortable text-center">{i18n.t('taskinfo-table.taskStateLabel')}</th>
						<th className="sortable text-center">{i18n.t('taskinfo-table.startTime')}</th>
						<th className="sortable text-center">{i18n.t('taskinfo-table.finishTime')}</th>
						<th className="sortable text-center">{i18n.t('taskinfo-table.resultCount')}</th>
					</tr>
					</thead>

					<tbody>
					{table}
					</tbody>
				</table>
			</div>
        )
    }
})

module.exports.render = function (container, data, taskInfoClicked, taskInfoDoubleClicked, sortBy, selectedNode) {
	ReactDOM.render(<Provider.default><TaskInfoTable data={data} taskInfoClicked={taskInfoClicked} taskInfoDoubleClicked={taskInfoDoubleClicked} sortBy={sortBy} selectedNode={selectedNode}/></Provider.default>, container);
}