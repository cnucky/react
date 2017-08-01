var React = require('react');
var _ = require('underscore');

/***设置单表输入输出表格组件***/
var TableComponent = React.createClass({
	getInitialState: function() {
		return this.getStateFromProps(this.props, null)
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState(this.getStateFromProps(nextProps, this.props))
	},
	getStateFromProps: function(props, oldProps) {
		var selectedFields = props.selectedFields;

		// inputField改变时 datatable才需要创建
		if (!oldProps || oldProps.inputFields != props.inputFileds) {
			var dataTable = _.map(props.inputFields, function(item){
				var outputField = _.find(selectedFields,function(field){
					return item.aliasName === field.columnName;
				});
				return {
					inputFieldCaption: item.displayName,
					aliasName: item.aliasName,
					columnName: item.columnName,
					columnType: item.columnType,
					outputAlias: outputField && outputField.aliasName || '',
					outputFieldCaption: outputField ? outputField.displayName : item.displayName
				}
			})
			return {selectedFields, dataTable};
		} else {
			return {selectedFields};
		}

	},
	selectAllHandle: function(e) {
		this.state.selectedFields = [];
		if (e.target.checked) {
			_.each(this.state.dataTable, _.bind(function (rowData) {
				var inputField = _.find(this.props.inputFields, function (field) {
					return field.aliasName === rowData.aliasName;
				});
				if (inputField !== undefined) {
					var field = {};
					$.extend(field,inputField);
					field.columnName = rowData.aliasName;
					field.aliasName = rowData.outputAlias;
					field.displayName = _.isEmpty(rowData.outputFieldCaption) ? field.displayName : rowData.outputFieldCaption;
					this.state.selectedFields.push(field);
				}
			}, this));
		}
		this.setState({
			selectedFields: this.state.selectedFields
		});
		if(_.isFunction(this.props.onChange)) {
			this.props.onChange(this.state.selectedFields);
		}
	},
	selectChangedHandle: function(e){
		var index = $(e.target.parentElement.parentElement).attr('data-index');
		var rowData = this.state.dataTable[index];
		var inputField = _.find(this.props.inputFields,function(field){
			return field.aliasName === rowData.aliasName;
		});
		var outputField = _.find(this.state.selectedFields,function(field){
			return field.columnName === rowData.aliasName;
		});
		if (e.target.checked){
			if (inputField !== undefined && outputField == undefined){
				var field = {};
				$.extend(field,inputField);
				field.columnName = inputField.aliasName;
				field.aliasName = rowData.outputAlias;
				field.displayName = _.isEmpty(rowData.outputFieldCaption) ? field.displayName : rowData.outputFieldCaption;
				this.state.selectedFields.push(field)
			}
		} else {
			if (inputField !== undefined && outputField !== undefined){
				this.state.selectedFields.splice(_.indexOf(this.state.selectedFields,outputField),1);
			}
		}
		this.setState({
			selectedFields: this.state.selectedFields
		});
		if(_.isFunction(this.props.onChange)) {
			this.props.onChange(this.state.selectedFields);
		}
	},
	outputChangedHandle: function(e) {
		var index = $(e.target.parentElement.parentElement).attr('data-index');
		var rowData = this.state.dataTable[index];
		rowData.outputFieldCaption = e.target.value;
		var outputIndex = _.findIndex(this.state.selectedFields,function(field){
			return field.columnName === rowData.aliasName;
		});
		if (outputIndex !== -1){
			this.state.selectedFields[outputIndex].displayName = e.target.value;
			this.setState({
				selectedFields: this.state.selectedFields
			});
		}
		if(_.isFunction(this.props.onChange)) {
			this.props.onChange(this.state.selectedFields);
		}
	},
	isAllSelected: function () {
		if (this.props.inputFields.length > this.state.selectedFields.length) {
			return false
		}
		var notSelected = _.find(this.props.inputFields, input => {
			return (_.find(this.state.selectedFields, selected => {
				return selected.columnName === input.aliasName
			}) == undefined)
		})
		return notSelected == undefined;
	},
	render: function() {
		var columnNames = this.props.tableColumnNames;
		columnNames = columnNames || ['输入字段', '类型', '输出字段'];

		var table = _.map(this.state.dataTable, _.bind(function (item,index) {
			return (
				<tr data-index={index} key={index}>
					<td  className="p6">
						<input type="checkbox"
							   checked={_.find(this.state.selectedFields,function(field){
							   			return field.columnName === item.aliasName})}
							   onChange = {this.selectChangedHandle}>
						</input>
					</td>
					<td className="p6">{item.inputFieldCaption}</td>
					<td  className="p6">{item.columnType}</td>
					{this.props.hideOutputs ? '' : <td  className="p6">
						<input type="text" className="form-control" style={{padding:"0px",height:"25px",border:"transparent"}}
							   defaultValue={item.outputFieldCaption} onChange={this.outputChangedHandle}>
						</input>
					</td>}
				</tr>
            )
        }, this));

        return (
            <div>
				<table className="table table-hover">
					<thead>
					<tr className="primary">
						<th className="sortable pl6">
							<input type="checkbox" checked={this.isAllSelected()} onChange={this.selectAllHandle}/>
						</th>
						<th className="sortable">{columnNames[0]}</th>
						<th className="sortable">{columnNames[1]}</th>
						{this.props.hideOutputs ? '' : <th className="sortable">{columnNames[2]}</th>}
					</tr>
					</thead>

					<tbody>
					{table}
					</tbody>
				</table>
			</div>
        )
    }
});

module.exports = TableComponent;
