var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var Dialog = require('nova-dialog');
var Notify = require('nova-notify');
var _ = require('underscore');
require('fancytree-all');
var showExpressionDialog = require('./modeling-expression-constructor').showExpressionDialog;
var Provider = require('widget/i18n-provider');

var DEBUG = true;

//==========================Store=============================
var redux = require('redux');
/**
state = {
	input: [
		{
			inputNode: 'xxx',
			outputColumnDescList: []
		}
	],
	inputIds:[],
	output: {
		outputColumnDescList: []
	}
}
*/
var reducer = function(state, action) {
    switch (action.type) {
        case 'UPDATE':
            return _.assign({}, state, { output: { outputColumnDescList: action.data } });
        case 'REPLACE':
            return action.data;
        default:
            return state;
    }
};
var store = redux.createStore(reducer); //数据存储

//===========================Views==============================
var ExpressionInput = React.createClass({
    propTypes: {
        callback: React.PropTypes.func.isRequired,
        expression: React.PropTypes.string,
        index: React.PropTypes.number.isRequired,
        input: React.PropTypes.array.isRequired
    },
    showDialog: function() {
        showExpressionDialog(this.props.input, function(data) {
            this.props.callback(this.props.index, data)
        }.bind(this), {
            expression: this.props.expression,
            hint: this.props.value
        });
    },
    render: function() {
        return (
            <div style={{width: '100%', minWidth: '180px'}}>
			<input ref="expressionInput" onClick={this.showDialog} type="text" placeholder="点击编辑表达式" className="gui-input"
				readOnly="true" style={{width: '100%'}} value={this.props.hint} title={this.props.hint}/>
			</div>
        )
    }
});

var TransformTable = React.createClass({
	contextTypes: {
		i18n: React.PropTypes.object
	},
	getInitialState: function() {
		var data = this.props.store.getState();
		return {
			condition: data.output.outputColumnDescList
		};
	},
	update: function(state) {
		this.setState(state);
		this.props.store.dispatch({
			type: 'UPDATE',
			data: state.condition
		});
	},
	addBtnClick: function() {
		this.state.condition.push({
			aliasName: "",
			displayName:""
		});
		this.update(this.state);
	},
	resetBtnClick: function() {
		var data = this.props.store.getState();
		if(data.input) {
			this.state.condition = _.filter(this.state.condition, function(condition) {
				return condition.columnName;
			});
			_.each(data.input[0].outputColumnDescList, _.bind(function(item){
				var matched = _.find(this.state.condition, function(condition) {
					return condition.columnName == item.aliasName;
				})
				if(!matched) {
					this.state.condition.push(_copyInputItem(item));
				}
			},this))
			this.update(this.state);
		}
	},
	toggleDeleteMode: function() {
		this.state.deleteMode = !this.state.deleteMode;
		this.setState(this.state);
	},
	deleteBtnClick: function(e) {
		var conditions = this.state.condition;
		if(conditions.length > 1) {
			conditions.splice($(e.currentTarget).attr('data-index'), 1);
            this.update(this.state);
		}
	},
	clearOutput: function() {
		this.state.condition = [{displayName:"",aliasName:""}];
		this.update(this.state);
	},
	expressionCallback: function(index, data) {
		this.state.condition[index] = _.assign(this.state.condition[index], data);
		this.update(this.state);
	},
	outputCallback: function(e) {
		var index = $(e.target).attr('data-index');
		this.state.condition[index] = _.assign(this.state.condition[index], {displayName: e.target.value});
		this.update(this.state);
	},
	render: function() {
		var {i18n} = this.context;
		var data = store.getState();
		var btns = (<div className="panel-footer text-right">
				<button type="button" onClick={this.resetBtnClick} className="btn btn-rounded btn-system btn-xs mr5 pull-left">
                    {i18n.t("get-all-btn")}
                </button>
				<button type="button" onClick={this.addBtnClick} className="btn btn-rounded btn-primary btn-xs mr5">
                    {i18n.t("add-btn")}
                </button>
                <button type="button" onClick={this.toggleDeleteMode} className="btn btn-rounded btn-danger btn-xs">
                    {i18n.t("delete-btn")}
                </button>
			</div>)
		if(this.state.deleteMode) {
			btns = (<div className="panel-footer text-right">
				<button type="button" onClick={this.clearOutput} className="btn btn-rounded btn-danger btn-xs mr5">
                    {i18n.t("clear-all-btn")}
                </button>
				<button type="button" onClick={this.toggleDeleteMode} className="btn btn-rounded btn-default btn-xs">
                    {i18n.t("complete-btn")}
                </button>
			</div>)
		}

		return (
			<div className="panel pt10">
			<div className="panel-body pn admin-form" style={{border: 'none'}}>
			<table className="table table-bordered">
				<thead>
					<tr>
					<th style={this.state.deleteMode ? {} : {display: 'none'}}></th>
					<th>{i18n.t("column-transform.field")}</th>
					<th>{i18n.t("column-transform.output")}</th>
					</tr>
				</thead>
				<tbody>
				{_.map(this.state.condition, _.bind(function(item, index){
				return (<tr key={index}>
					<td style={this.state.deleteMode ? {} : {display: 'none'}}>
					<button type="button" data-index={index} onClick={this.deleteBtnClick} 
						className="btn btn-rounded btn-danger btn-xs">
                            <i className="fa fa-minus"></i>
                    </button>
					</td>
					<td className="p5"><ExpressionInput index={index} input={data.input} callback={this.expressionCallback} expression={item.columnName} hint={item.tag ? item.tag.hint : null}/></td>
					<td className="p5"><input data-index={index} type="text" className="gui-input" value={item.displayName} title={item.displayName} onChange={this.outputCallback}/></td>
					</tr>)
				}, this))}
				</tbody>
			</table>
			</div>
			{btns}
			</div>
			)
	}
});

function _copyInputItem(inputItem) {
    return _.extend({}, inputItem, {columnName: inputItem.aliasName, tag: {hint: inputItem.displayName}});
}

function _logd(...args) {
	if(DEBUG) {
		console.log(...args);
	}
}
function getDuplicateHint(detail) {
	let columnList = detail;
	let column = _.find(columnList, prevColumn => {
		return _.find(columnList, postColumn => {
			return prevColumn != postColumn && prevColumn.tag.hint === postColumn.tag.hint
		})
	})
	return column && column.tag.hint
}


//=======================Exports==========================
module.exports.render = function(container, data) {
	data = checkInputData(data);
	if(_.isEmpty(data.output) || _.isEmpty(data.output.outputColumnDescList)) {
		data.output = {outputColumnDescList:[{displayName:"",aliasName:""}]};
	}
	store.dispatch({
		type: 'REPLACE',
		data: data
	});
	ReactDOM.render(<Provider.default><TransformTable store={store}/></Provider.default>, container);
};

module.exports.constructTaskDetail = function() {
	var data = store.getState();
	if(!_.isEmpty(data.inputIds)) {
		data.output.inputNode = data.inputIds[0];
	}
	var outputColumnDescList = _.filter(data.output.outputColumnDescList, function(item) {
		return item.columnName;
	});
	_logd('constructTaskDetail', data.output);
	
	if(_.isEmpty(outputColumnDescList)) {
		return {
			message: window.i18n.t("warning.no-output-fields-are-selected")
		};
	}
	return {
		detail:	_.assign({}, data.output, {outputColumnDescList: outputColumnDescList})
	};
};

function checkInputData(inputData) {
    if (inputData.output) {
        if (!_.isEmpty(inputData.inputIds) && inputData.output.inputNode != inputData.inputIds[0]) {
            inputData.output = null;
        }
    }
    return inputData;
}

module.exports.checkInputData = checkInputData;

module.exports.showExpressionDialog = function() {
	Dialog.build({
		title: '编辑表达式',
		content: '<div id="expression-content"></div>',
		style: 'lg'
	}).show(function(){
		ReactDOM.render(<ExpressionConstructor />, $('#expression-content')[0]);
	})
};
