var React =  require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var MutiSelect = require('widget/multiselect');
var OutputFields = require('./modeling-output-fields');
var Notify = require('nova-notify');
var Provider = require('widget/i18n-provider');
var taskDetail;

var selectedOperType, collisionList, srcDataTypes;

var inputFields = {
	leftInputFields : [],
	rightInputFields : []
};

var outputFields = {
	leftOutputFields : [],
	rightOutputFields : []
};

var inputTitles = {
	leftInputTitles : window.i18n.t("join-condition.left-chart"),
	rightInputTitles : window.i18n.t("join-condition.right-chart")
};


 /*state = {
	 input: [
		 {
			 inputNode: 'xxx',
              title: 'zzx',
			 outputColumnDescList: []
		 }
	 ],
	 inputIds: [],
	 output: {
		 srcDataTypes: [
			 {
				 inputNode: 'xxx1',
				 outputColumnDescList: []
			 },
			 {
				 inputNode: 'xxx2',
				 outputColumnDescList: []
			 }
		 ],
		 collisionList: [{
			 leftTableField: "USER_MSISDN",
			 rightTableField: "OPPO_MSISDN_REG"
		 }],  //碰撞字段
		 oper_type: "LEFT_JOIN"   // LEFT_JOIN  RIGHT_JOIN  INNER_JOIN OUT_JOIN
	 }
 }*/


/***连接类型组件***/
var JoinTypeComponent = React.createClass({
	contextTypes: {
		i18n: React.PropTypes.object
	},
	getInitialState: function() {
		return {
			operType: selectedOperType,
			focusType: -1
		};
	},
	handJoinTypeChange : function(e) {
		selectedOperType = e.currentTarget.id;
		this.setState({
			operType : selectedOperType
		})
	},
	onMouseOver: function(e){
		this.setState({
			focusType: e.currentTarget.id
		})
	},
	onMouseLeave: function(e){
		this.setState({
			focusType: -1
		})
	},
	render: function() {
		var {i18n} = this.context;
		var joinTypeEnum = [
			{type:"INNER_JOIN","name":i18n.t("join-condition.internal-connect"),"src":"/modelanalysis/img/collision/icon-intersection.png"},
			{type:"LEFT_JOIN","name":i18n.t("join-condition.left-connect"),"src":"/modelanalysis/img/collision/icon-subtraction.png"},
			{type:"RIGHT_JOIN","name":i18n.t("join-condition.right-connect"),"src":"/modelanalysis/img/modeling/right-join.png"},
			{type:"OUT_JOIN","name":i18n.t("join-condition.outernal-connect"),"src":"/modelanalysis/img/collision/icon-union.png"}
		];
		return (
			<div>
				<div>
					<label>{i18n.t("join-condition.join-type")}</label>
				</div>
				<div className="row">
					{_.map(joinTypeEnum,_.bind(function(item) {
						return (
							<div className="col-md-3 text-center" id={item.type} key={item.type}
								 onClick={this.handJoinTypeChange}
								 onMouseOver={this.onMouseOver}
								 onMouseLeave={this.onMouseLeave}
								 style={ item.type==this.state.operType?{'background':'#B9B7B7'}:
								 (item.type==this.state.focusType?{'background':'#e9e9e9'}:{'background':'transparent'})}>
								<img style={{width:'60px'}} draggable="false" src={item.src}/>
								<div >{item.name}</div>
							</div>
						)
					}, this))
					}
				</div>
			</div>)
	}
});

/***选择连接字段组件***/
var JoinFieldsComponent = React.createClass({
	contextTypes: {
		i18n: React.PropTypes.object
	},
	getInitialState: function() {
		return {
			selectedFields: this.props.selectedFields,
			onDeleteMode : false
		};
	},
	handleSelectField: function(item, option, checked, select){
		if (this.props.onChange && typeof this.props.onChange === 'function') {
			this.props.onChange(parseInt(option.val()));
		}
		if (item.leftOrRight == 0){
			this.state.selectedFields[item.index].leftTableField = option.val();
		}else if (item.leftOrRight == 1){
			this.state.selectedFields[item.index].rightTableField = option.val();
		}
		this.setState({
			selectedFields: this.state.selectedFields
		});
	},
	addBtnClick: function() {
		var leftTableFields = [];
		var rightTableFields = [];
		_.each(this.state.selectedFields, function(item) {
			leftTableFields.push(item.leftTableField);
			rightTableFields.push(item.rightTableField);
		})
		// 寻找类型相同的两个输入
		var leftTableField = _.find(this.props.leftInputFields, function(item) {
			return item.columnType == "string" && _.indexOf(leftTableFields, item.aliasName) == -1;
		})
		var rightTableField = _.find(this.props.rightInputFields, function(item) {
			return item.columnType == "string" && _.indexOf(rightTableFields, item.aliasName) == -1;
		})
		if (!leftTableField || !rightTableField) {
			leftTableField = _.find(this.props.leftInputFields, function(item) {
				return isNumber(item.columnType) && _.indexOf(leftTableFields, item.aliasName) == -1;
			})
			rightTableField = _.find(this.props.rightInputFields, function(item) {
				return isNumber(item.columnType) && _.indexOf(rightTableFields, item.aliasName) == -1;
			})
			if (!leftTableField || !rightTableField) {
				leftTableField = _.find(this.props.leftInputFields, function(item) {
					return isDate(item.columnType) && _.indexOf(leftTableFields, item.aliasName) == -1;
				})
				rightTableField = _.find(this.props.rightInputFields, function(item) {
					return isDate(item.columnType) && _.indexOf(rightTableFields, item.aliasName) == -1;
				})
				if (!leftTableField || !rightTableField) {
					leftTableField = this.props.leftInputFields[0];
					rightTableField = this.props.rightInputFields[0];
				}
			}
		}
		this.state.selectedFields.push({
			leftTableField: leftTableField.aliasName,
			rightTableField: rightTableField.aliasName
		});
		this.setState({
			selectedFields: this.state.selectedFields
		});
	},
	deleteBtnClick: function() {
		this.setState({
			onDeleteMode: true
		})
	},
	deleteCompletedHandle: function(){
		this.setState({
			onDeleteMode: false
		})
	},
	deleteBtnHandle: function(e) {
		var {i18n} = this.context;
		var selectedFields = this.state.selectedFields;
		if(selectedFields.length > 1) {
			selectedFields.splice($(e.currentTarget).attr('data-index'), 1);
			this.setState({
				selectedFields: selectedFields
			});
		} else {
			Notify.simpleNotify(i18n.t("warning.delete-failed"), i18n.t("warning.leave-at-least-one-condition") , 'error');
		}
	},
	render: function() {
		var {i18n} = this.context;
		var addBtnClick = this.addBtnClick;
		var deleteBtnClick = this.deleteBtnClick;
		var deleteCompletedHandle = this.deleteCompletedHandle;
		return (
			<div>
				<div>
					<label>{i18n.t("join-condition.join-condition")}</label>
				</div>
				<div>
					<div className="flex-layout" style={{padding: "2px 0px 2px 0px"}}>
						{ this.state.onDeleteMode ?
							<div style={{ visibility: "hidden" }}>
								<button type="button" style={{verticalAlign: "middle"}} className="btn btn-rounded btn-danger btn-xs">
									<i className="fa fa-minus fa-fw"></i>
								</button>
							</div> : null
						}
						<div className="flex-item" style={{paddingLeft: "1px",paddingRight:"1px"}}>
							<div className='text-center'>
								<label className='text-ellipsis'>{inputTitles.leftInputTitles}</label>
							</div>
						</div>
						<div style={{width: "35px", paddingLeft: "1px",paddingRight:"1px"}}></div>
						<div className="flex-item" style={{paddingLeft: "5px",paddingRight:"1px"}}>
							<div className='text-center'>
								<label className='text-ellipsis'>{inputTitles.rightInputTitles}</label>
							</div>
						</div>
					</div>
					<div>
						{
							_.map(this.state.selectedFields, _.bind(function (item,index) {
								return (
									<div className="flex-layout" key={index}
										 style={{padding: "2px 0px 2px 0px"}}>

										{ this.state.onDeleteMode ?
											<div style={{padding: "8px 0px 8px 0px"}}>
												<button type="button" hide="true" style={{verticalAlign: "middle"}}
														className="btn btn-rounded  btn-danger btn-xs"
														data-index={index}
														onClick={this.deleteBtnHandle}>
													<i className="fa fa-minus fa-fw"></i>
												</button>
											</div> : null
										}

										<div className="flex-item" style={{paddingLeft: "1px",paddingRight:"1px"}}>
											<MutiSelect config={{buttonWidth: '99%',enableFiltering: true}}
														identity={{index: index, leftOrRight: 0}}
														updateData={true} onChange={this.handleSelectField}
														data={
														_.map(this.props.leftInputFields,function(field){
														return{
															label: field.displayName,
															type: field.columnType,
									                 		value: field.aliasName,
															selected: item.leftTableField === field.aliasName
														}
														})}/>
										</div>
										<div style={{width: "35px", paddingLeft: "1px",paddingRight:"1px"}}>
											<button type="button"
													className="btn btn-info fw600 fs14"
													aria-expanded="false">
												<span>=</span>
											</button>
										</div>
										<div className="flex-item" style={{paddingLeft: "5px",paddingRight:"1px"}}>
											<MutiSelect config={{buttonWidth: '99%',enableFiltering: true}}
														identity={{index: index, leftOrRight: 1}}
														style={{paddingLeft: "-11px",paddingRight:"1px"}}
														updateData={true} onChange={this.handleSelectField}
														data={
														_.map(this.props.rightInputFields,function(field){
														return{
															label: field.displayName,
															type: field.columnType,
															value: field.aliasName,
															selected: item.rightTableField === field.aliasName
														}
														})}/>
										</div>
									</div>
								)
							}, this))
						}
					</div>
					<div className="row" style={{paddingRight: "10px"}}>
						{ this.state.onDeleteMode ?
							<div className='complete-delete ml5' id="filter-btn3">
								<button type="button" onClick={deleteCompletedHandle}
										className="btn btn-default box-flex-1 pull-right mt10" style={{width: '80px'}}>
									{i18n.t("complete-btn")}
								</button>
							</div> :
							<div>
								<div className="add-record ml5">
									<button type="button" onClick={addBtnClick}
											className="btn-add-record btn btn-rounded btn-primary btn-xs pull-right mt10">
										<i className="fa fa-plus fa-fw"></i>
									</button>
								</div>
								<div className="delete-record ml5">
									<button type="button" onClick={deleteBtnClick}
											className="btn-delete-record btn btn-rounded  btn-danger btn-xs pull-right mt10">
										<i className="fa fa-minus fa-fw"></i>
									</button>
								</div >
							</div>
						}
					</div>
				</div>
			</div>
		)
	}
});

/***设置单表输入输出表格组件***/
var Table_Component = React.createClass({
	contextTypes: {
		i18n: React.PropTypes.object
	},
	getInitialState: function() {
		return {
			selectedFields: this.props.selectedFields
		}
	},
	selectAllHandle: function(e) {
		if (e.target.checked) {
			_.each(this.props.dataTable, _.bind(function (rowData) {
				var inputField = _.find(this.props.inputFields, function (field) {
					return field.aliasName === rowData.aliasName;
				});
				var outputField = _.find(this.state.selectedFields, function (field) {
					return field.columnName === rowData.aliasName;
				});
				if (inputField !== undefined && outputField == undefined) {
					var field = {};
					$.extend(field,inputField);
					field.columnName = rowData.aliasName;
					field.displayName = rowData.outputFieldCaption;
					field.aliasName = "";
					this.state.selectedFields.push(field)
				}
			}, this));
		} else {
			this.state.selectedFields = new Array();
		}
		this.setState({
			selectedFields: this.state.selectedFields
		});
		this.props.selectedFieldsChanged(this.props.reactKey,this.state.selectedFields);
	},
	selectChangedHandle: function(e){
		var index =	$(e.target.parentElement.parentElement).attr('data-index');
		var rowData = this.props.dataTable[index];
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
				field.columnName = rowData.aliasName;
				field.displayName = rowData.outputFieldCaption;
				field.aliasName = "";
				this.state.selectedFields.push(field)
			}
		}else{
			if (inputField !== undefined && outputField !== undefined){
				this.state.selectedFields.splice(_.indexOf(this.state.selectedFields,outputField),1);
			}
		}
		this.setState({
			selectedFields: this.state.selectedFields
		});
		this.props.selectedFieldsChanged(this.props.reactKey,this.state.selectedFields);
	},
	outputChangedHandle: function(e) {
		var index =	$(e.target.parentElement.parentElement).attr('data-index');
		var rowData = this.props.dataTable[index];
		rowData.outputFieldCaption = e.target.value;
		var outputIndex = _.findIndex(this.state.selectedFields,function(field){
			return field.columnName === rowData.aliasName;
		});
		if (outputIndex !== -1){
			this.state.selectedFields[outputIndex].displayName = e.target.value;
			this.setState({
				selectedFields: this.state.selectedFields
			});
			this.props.selectedFieldsChanged(this.props.reactKey,this.state.selectedFields);
		}
	},

	render: function() {
		var {i18n} = this.context;
		var table = _.map(this.props.dataTable, _.bind(function (item,index) {
			return (
				<tr data-index={index} key={index}>
					<td>
						<input type="checkbox"
							   checked={_.find(this.state.selectedFields,function(field){
							   			return field.columnName === item.aliasName})}
							   onChange = {this.selectChangedHandle}>
						</input>
					</td>
					<td>{item.inputFieldCaption}</td>
					<td>{item.columnType}</td>
					<td>
						<input type="text" className="form-control" style={{padding:"0px",height:"25px",border:"transparent"}}
							   defaultValue={item.outputFieldCaption} onChange={this.outputChangedHandle}>
						</input>
					</td>
				</tr>
			)
		},this));

		return (
			<div>
				<table className="table table-hover">
					<thead>
					<tr className="primary">
						<th className="sortable">
							<input type="checkbox" checked={this.props.inputFields.length == this.state.selectedFields.length}
								   onChange={this.selectAllHandle}/>
						</th>
						<th className="sortable text-nowrap">{i18n.t("input-field")}</th>
						<th className="sortable text-nowrap">{i18n.t("type")}</th>
						<th className="sortable text-nowrap">{i18n.t("output-field")}</th>
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

var JoinCondition = React.createClass({
	contextTypes: {
		i18n: React.PropTypes.object
	},
	leftSelectedFieldsChanged : function(selectedFields){
			outputFields.leftOutputFields = selectedFields;
	},
	rightSelectedFieldsChanged : function(selectedFields){
		outputFields.rightOutputFields = selectedFields;
	},
	render: function () {
		return (
			<div>
				<JoinTypeComponent ></JoinTypeComponent>
				<br></br>
				<JoinFieldsComponent leftInputFields={inputFields.leftInputFields} rightInputFields={inputFields.rightInputFields}
									 selectedFields={this.props.collisionList}></JoinFieldsComponent>
				<div>
					<div>
						<label>{i18n.t("output-field")}</label>
					</div>
					<div style={{paddingLeft:"7px"}}>
						<ul className="nav nav-pills mb2bindingData0">
							<li className="active">
								<a href="#tab-left-table" data-toggle="tab" aria-expanded="true"
								   style={{padding: "4px 20px 5px"}}>{inputTitles.leftInputTitles}</a>
							</li>
							<li>
								<a href="#tab-right-table" data-toggle="tab" aria-expanded="true"
								   style={{padding: "4px 20px 5px"}}>{inputTitles.rightInputTitles}</a>
							</li>
						</ul>
						<div className="tab-content br-n pn">
							<div id="tab-left-table" className="tab-pane active" style={{padding:'1px 0px 0px 0px'}}>
								<OutputFields key="leftTableComponent"
											  onChange = {this.leftSelectedFieldsChanged}
												selectedFields={outputFields.leftOutputFields}
												inputFields={inputFields.leftInputFields} />
							</div>

							<div id="tab-right-table" className="tab-pane" style={{padding:'1px 0px 0px 0px'}}>
								<OutputFields key="rightTableComponent"
											  onChange = {this.rightSelectedFieldsChanged}
												selectedFields={outputFields.rightOutputFields}
												inputFields={inputFields.rightInputFields} />
							</div>
						</div>
					</div>
				</div>
			</div>)
	}
});

module.exports.render  = function(container,data) {
	// data = checkInputData(data);
	inputFields.leftInputFields = data.input[0].outputColumnDescList;
	inputFields.rightInputFields = data.input[1].outputColumnDescList;
	inputTitles.leftInputTitles = data.input[0].title;
	inputTitles.rightInputTitles = data.input[1].title;

	// 寻找类型相同的两个输入
	var leftTableField = _.find(inputFields.leftInputFields, function(item) {
		return item.columnType == "string";
	})
	var rightTableField = _.find(inputFields.rightInputFields, function(item) {
		return item.columnType == "string";
	})
	if (!leftTableField || !rightTableField) {
		leftTableField = _.find(inputFields.leftInputFields, function(item) {
			return isNumber(item.columnType);
		})
		rightTableField = _.find(inputFields.rightInputFields, function(item) {
			return isNumber(item.columnType);
		})
		if (!leftTableField || !rightTableField) {
			leftTableField = _.find(inputFields.leftInputFields, function(item) {
				return isDate(item.columnType);
			})
			rightTableField = _.find(inputFields.rightInputFields, function(item) {
				return isDate(item.columnType);
			})
			if (!leftTableField || !rightTableField) {
				leftTableField = inputFields.leftInputFields[0];
				rightTableField = inputFields.rightInputFields[0];
			}
		}
	}
	
	if (data.output && data.output.collisionList) {
		if (data.output.collisionList.length != 0) {
			taskDetail = data.output;
		} else {
			taskDetail = {
				srcDataTypes: data.output.srcDataTypes,
				collisionList: [
					{
						leftTableField : leftTableField.aliasName,
						rightTableField: rightTableField.aliasName
					}
				],
				oper_type: data.output.oper_type
			};
		}
	}else{
		taskDetail = {
			srcDataTypes: [
				{
					inputNode: data.inputIds[0],
					outputColumnDescList: _.map(inputFields.leftInputFields,function(item){
						var outputField = {};
						$.extend(outputField,item);
						outputField.columnName = item.aliasName;
						outputField.aliasName = "";
						return outputField;
					})
				},
				{
					inputNode: data.inputIds[1],
					outputColumnDescList: _.map(inputFields.rightInputFields,function(item){
						var outputField = {};
						$.extend(outputField,item);
						outputField.columnName = item.aliasName;
						outputField.aliasName = "";
						return outputField;
					})
				}
			],
			collisionList: [
				{
					leftTableField : leftTableField.aliasName,
					rightTableField: rightTableField.aliasName
				}
			],
			oper_type: "INNER_JOIN"
		};
	}
	selectedOperType = taskDetail.oper_type;
	outputFields.leftOutputFields = taskDetail.srcDataTypes[0].outputColumnDescList;
	outputFields.rightOutputFields = taskDetail.srcDataTypes[1].outputColumnDescList;
	ReactDOM.render(<Provider.default><JoinCondition collisionList={taskDetail.collisionList}
								   srcDataTypes={taskDetail.srcDataTypes}/></Provider.default>, container);
};

module.exports.constructTaskDetail = function() {
	for (var index in taskDetail.collisionList) {
		var item = taskDetail.collisionList[index];
		var leftCol = _.find(inputFields.leftInputFields, function (input) {
			return input.aliasName == item.leftTableField;
		});
		var rightCol = _.find(inputFields.rightInputFields, function (input) {
			return input.aliasName == item.rightTableField;
		});
		if (leftCol.columnType != rightCol.columnType && !(isNumber(leftCol.columnType) && isNumber(rightCol.columnType)) && !(isDate(leftCol.columnType) && isDate(rightCol.columnType))) {
			return {
				message: leftCol.displayName + window.i18n.t("warning.and") + rightCol.displayName + window.i18n.t("warning.types-are-inconsistent")
			}
		}
	};

	let allOutputFields = outputFields.leftOutputFields.concat(outputFields.rightOutputFields);
	let column = _.find(allOutputFields, prevColumn => {
        return _.find(allOutputFields, postColumn => {
            return prevColumn != postColumn && prevColumn.displayName === postColumn.displayName
        })
    })
    if (column && column.displayName) {
    	return {
			message: window.i18n.t("warning.there-is-a-duplicate-output-name") + '"' + column.displayName + '"'
		}
    }

	taskDetail.oper_type = selectedOperType;
	taskDetail.srcDataTypes[0].outputColumnDescList = outputFields.leftOutputFields;
	taskDetail.srcDataTypes[1].outputColumnDescList = outputFields.rightOutputFields;
	return {
		detail: taskDetail
	};
};

function isNumber(columnType) {
    return _.contains(['int', 'bigint', 'double', 'decimal'], columnType);
}

function isDate(columnType) {
	return _.contains(['date', 'datetime', 'timestamp'], columnType);
}

module.exports.checkInputData = checkInputData;

function checkInputData(inputData) {
	if(inputData.output) {
		if(inputData.input[0] && inputData.input[1]) {
			var fields0 = _.map(inputData.input[0].outputColumnDescList, function (item) {
				return item.aliasName;
			});
			var fields1 = _.map(inputData.input[1].outputColumnDescList, function (item) {
				return item.aliasName;
			});

			if (!_.contains(fields0, inputData.output.collisionList.leftTableField)
			|| !_.contains(fields1, inputData.output.collisionList.rightTableField)
			|| inputData.output.srcDataTypes[0].inputNode !== inputData.input[0].inputNode
			|| inputData.output.srcDataTypes[1].inputNode !== inputData.input[1].inputNode) {
				inputData.output = null;
				return inputData;
			}

			for(var i=0;i < inputData.output.srcDataTypes[0].outputColumnDescList.length;i++){
				if (!_.contains(fields0, inputData.output.srcDataTypes[0].outputColumnDescList[i].columnName)) {
					inputData.output = null;
					return inputData;
				}
			}

			for(var j=0;j < inputData.output.srcDataTypes[1].outputColumnDescList.length;j++){
				if (!_.contains(fields1, inputData.output.srcDataTypes[1].outputColumnDescList[j].columnName)) {
					inputData.output = null;
					return inputData;
				}
			}
		}else{
			inputData.output = null;
			return inputData;
		}
	}
	return inputData;
}