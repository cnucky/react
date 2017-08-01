var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');
var Q = require('q');
// require('bootstrap-multiselect');
var MultiSelect = require('widget/multiselect');
require('./modeling-group-statistics.css');
require("utility/jquery/jqmaskedinput");
var Provider = require('widget/i18n-provider');

import Select from 'react-select';

//==========================Store=============================
var UNSET_LABEL = window.i18n.t("group-statistics.none");
var UNSET_VALUE = 'none';

var statisticalCondition = [{
    title: window.i18n.t("group-statistics.greater-than"),
    value: 'GREATER_THAN'
}, {
    title: window.i18n.t("group-statistics.less-than"),
    value: 'LESS_THAN'
}, {
    title: window.i18n.t("group-statistics.equal"),
    value: 'EQUAL'
}, {
    title: window.i18n.t("group-statistics.not-equal"),
    value: 'NOT_EQUAL'
}]
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
        cond:{},
        groupBy: [],
        outputColumnSelect: [],
        outputColumnDescList: []
    }
}
*/
var reducer = function(state, action) {
    switch (action.type) {
        case 'UPDATE':
            return _.assign({}, state, { output: action.data });
        case 'REPLACE':
            return action.data;
        default:
            return state;
    }
};
var store = redux.createStore(reducer); //数据存储

//===========================View===========================
var styles = {
    formControl: { height: '25px', padding: '3px 8px' }
};

//统计分析
var ColumnExtraction = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    componentDidUpdate: function(){
        if (this.state.statisticalType == 'date') {
            $('#conditionInput').mask('9999-99-99', {
                completed: function() {
                    this.dateInputCallback($('#conditionInput').val());
                }.bind(this)
            });
        } else if (this.state.statisticalType == 'dateTime'){
            $('#conditionInput').mask('9999-99-99 99:99:99', {
                completed: function() {
                    this.dateInputCallback($('#conditionInput').val());
                }.bind(this)
            });
        } else {
            $('#conditionInput').unmask();
        }
    },
    componentDidMount: function(){
        if (this.state.statisticalType == 'date') {
            $('#conditionInput').mask('9999-99-99', {
                completed: function() {
                    this.dateInputCallback($('#conditionInput').val());
                }.bind(this)
            });
        } else if (this.state.statisticalType == 'dateTime'){
            $('#conditionInput').mask('9999-99-99 99:99:99', {
                completed: function() {
                    this.dateInputCallback($('#conditionInput').val());
                }.bind(this)
            });
        } else {
            $('#conditionInput').unmask();
        }
    },
    dateInputCallback: function(input) {
        this.state.cond.value = [input];
        this.updateOutput(this.state);
    },
    codeTagInputCallback: function(value) {
        this.state.cond.value = value.split(',');
        this.updateOutput(this.state);
    }, 
    getInitialState: function() {
        var data = this.props.store.getState();
        var statisticalType;
        if (data.output.cond.func && data.output.cond.columnName) {
            if ( _.contains(['count(*)', 'avg(*)', 'sum(*)', 'count(distinct(*))'], data.output.cond.func)) {
                statisticalType = 'number';
            } else {
                var selectedItem = _.find(data.input[0].outputColumnDescList, _.bind(function(item) {
                    return data.output.cond.columnName == item.aliasName;
                }, this));
                if (selectedItem.codeTag == 0) {
                    if (selectedItem.columnType == 'string') {
                        statisticalType = 'text';
                    } else if (_.contains(['int', 'bigint', 'double', 'decimal'], selectedItem.columnType)) {
                        statisticalType = 'number';
                    } else if (selectedItem.columnType == 'date'){
                        statisticalType = 'date';
                    } else {
                        statisticalType = 'dateTime';
                    }
                } else {
                    statisticalType = 'codeTag';
                }
            }
        } else {
            statisticalType = 'text';
        }
        var output = _.assign({}, data.output, {newColumns: data.input[0].outputColumnDescList, statisticalType: statisticalType});
        return output;
    },
    updateOutput: function(state) {
        this.setState(state);
        this.props.store.dispatch({
            type: 'UPDATE',
            data: state
        });
    },
    handleSelectSemantic: function(item, option, checked, select) {
        if (this.props.onChange && typeof this.props.onChange === 'function') {
            this.props.onChange(parseInt(option.val()));
        }
    },
    groupFuncCallback: function(item, option, checked, select, isNoneItem) {
        this.state.cond.func = isNoneItem ? null : option.val();
        var data = this.props.store.getState();
        if (this.state.cond.func == 'avg(*)' || this.state.cond.func == 'sum(*)') {
            var numberColumns = _.filter(data.input[0].outputColumnDescList, function(item) {
                return _.contains(['int', 'bigint', 'double', 'decimal'], item.columnType);
            });
            this.state.newColumns = numberColumns;
            var isNumber = false;
            _.each(numberColumns, _.bind(function(item) {
                if(item.aliasName == this.state.cond.columnName) {
                    isNumber = true;
                }
            },this));
            if(!isNumber) {
                this.state.cond.columnName = null;
            }
        } else {
            this.state.newColumns = data.input[0].outputColumnDescList;
        }
        this.updateStatisticalType();
        this.updateOutput(this.state);
    },
    funcColumnCallback: function(item, option, checked, select, isNoneItem) {
        this.state.cond.columnName = isNoneItem ? null : option.val();
        this.updateStatisticalType();
        this.updateOutput(this.state);
    },
    conditionCallback: function(item, option, checked, select, isNoneItem) {
        this.state.cond.opr = isNoneItem ? null : option.val();
        this.updateOutput(this.state);
    },
    condInputCallback: function(e) {
        this.state.cond.value = [e.target.value];
        this.updateOutput(this.state);
    },
    groupByColumnCallback: function(item, option, checked, select) {
        var value = option.val();
        var data = this.props.store.getState();
        var columns = data.input[0].outputColumnDescList;
        if (_.contains(this.state.groupBy, value)) {
            this.state.groupBy.splice(_.indexOf(this.state.groupBy, value), 1);
            this.state.outputColumnDescList = _.filter(this.state.outputColumnDescList, function(item) {
                return item.columnName != value;
            })
        } else {
            this.state.groupBy.push(value);
            var inputItem = _.find(columns, function(item) {
                return item.aliasName == value;
            })
            this.state.outputColumnDescList.splice(0, 0, _copyInputItem(inputItem));
        }

        // this.state.outputColumnSelect = _.filter(columns, _.bind(function(item) {
        //     return _.contains(this.state.groupBy, item.aliasName);
        // }, this))
        this.updateOutput(this.state);
    },
    outputNameCallback: function(e) {
        var output = this.state.outputColumnDescList;
        var index = $(e.target).attr('data-index');
        output[index].displayName = e.target.value;
        this.updateOutput(this.state);
    },
    outputColumnCallback: function(e) {
        var output = this.state.outputColumnDescList;
        var index = $(e.target).attr('data-index');
        output[index].tag.columnName = output[index].columnName = e.target.value;
        var selectedItem = _.find(this.state.outputColumnSelect, function(item) {
            return item.aliasName == e.target.value;
        });
        output[index].tag.origDisplayName = selectedItem.displayName;
        this.autoDisplayName(output[index]);
        this.updateOutput(this.state);
    },
    outputFuncCallback: function(e) {
        var output = this.state.outputColumnDescList;
        var index = $(e.target).attr('data-index');
        output[index].tag.func = e.target.value;
        this.autoDisplayName(output[index]);
        this.updateOutput(this.state);
    },
    autoDisplayName: function(item) {
        var selectedFunc = _.find(this.props.statisticalFunctions, function(funcItem) {
            return funcItem.format == item.tag.func;
        });
        item.displayName = item.tag.origDisplayName + (selectedFunc ? selectedFunc.caption : '');
    },
    addBtnClick: function(e) {
        // var data = this.props.store.getState();
        var columns = this.state.outputColumnDescList;
        //find one to add
        var toadd = this.state.outputColumnSelect[0];
        toadd = _copyInputItem(toadd);
        toadd.tag.func = this.props.statisticalFunctions[0].format;
        toadd.tag.columnName = toadd.columnName;
        this.autoDisplayName(toadd);
        columns.push(toadd);
        this.updateOutput(this.state);
    },
    toggleDeleteMode: function(e) {
        this.setState({
            deleteMode: !this.state.deleteMode
        })
    },
    deleteBtnClick: function(e) {
        this.state.outputColumnDescList.splice($(e.currentTarget).attr('data-index'), 1);
        this.updateOutput(this.state);
    },
    updateStatisticalType: function() {
        var oldStatisticalType = this.state.statisticalType;
        if(this.state.cond.func && this.state.cond.columnName) {
            if ( _.contains(['count(*)', 'avg(*)', 'sum(*)', 'count(distinct(*))'], this.state.cond.func)) {
                this.state.statisticalType = 'number';
            } else {
                var selectedItem = _.find(this.state.newColumns, _.bind(function(item) {
                    return this.state.cond.columnName == item.aliasName;
                }, this));
                if (selectedItem.codeTag == 0) {
                    if (selectedItem.columnType == 'string') {
                        this.state.statisticalType = 'text';
                    } else if (_.contains(['int', 'bigint', 'double', 'decimal'], selectedItem.columnType)) {
                        this.state.statisticalType = 'number';
                    } else if (selectedItem.columnType == 'date'){
                        this.state.statisticalType = 'date';
                    } else {
                        this.state.statisticalType = 'dateTime';
                    }
                } else {
                    this.state.statisticalType = 'codeTag';
                }
            }
        } else {
            this.state.statisticalType = 'text';
        }
        if (oldStatisticalType != this.state.statisticalType) {
            this.state.cond.value = "";
        }
    },
    render: function() {
        var {i18n} = this.context;

        var data = this.props.store.getState();
        var columns = data.input[0].outputColumnDescList;
        var newColumns = this.state.newColumns;
        var statisticalFunctions = this.props.statisticalFunctions;
        var statisticalCondition = this.props.statisticalCondition;
        var selectedItem = _.find(newColumns, _.bind(function(item) {
            return this.state.cond.columnName == item.aliasName;
        }, this));
        var btns = (<div className="text-right mt10">
                        <button type="button" onClick={this.addBtnClick} className="btn btn-rounded btn-primary btn-xs mr5">
                            {i18n.t("add-btn")}
                        </button>
                        <button type="button" onClick={this.toggleDeleteMode} className="btn btn-rounded btn-danger btn-xs">
                            {i18n.t("delete-btn")}
                        </button>
                    </div>);
        if (this.state.deleteMode) {
            btns = (<div className="text-right mt10">
                    <button type="button" onClick={this.toggleDeleteMode} className="btn btn-rounded btn-default btn-xs">
                        {i18n.t("complete-btn")}
                    </button>
                    </div>)
        }
        var inputArea;
        switch (this.state.statisticalType) {
            case 'text': {
                inputArea = (<input id="conditionInput" type="text" className='form-control' 
                            value={this.state.cond.value && this.state.cond.value[0]} onChange={this.condInputCallback}></input>);
                break;
            }
            case 'number': {
                inputArea = (<input id="conditionInput" type="number" className='form-control' 
                            value={this.state.cond.value && this.state.cond.value[0]} onChange={this.condInputCallback}></input>);
                break;
            }
            case 'date': {
                inputArea = (<input id="conditionInput" type="text" className='form-control' placeholder={i18n.t("group-statistics.date-input-placeholder")}
                            value={this.state.cond.value && this.state.cond.value[0]} ></input>);
                break;
            }
            case 'dateTime': {
                inputArea = (<input id="conditionInput" type="text" className='form-control' placeholder={i18n.t("group-statistics.datetime-input-placeholder")}
                            value={this.state.cond.value && this.state.cond.value[0]}></input>);
                break;
            }
            case 'codeTag': {
                inputArea = (<Select name="codeTag" className="valueInput" multi={true} value={this.state.cond.value} clearable={false}
                                placeholder="" cacheAsyncResults={false} noResultsText={i18n.t("no-results-text")} searchPromptText={i18n.t("search-prompt")}
                                asyncOptions={(input, callback) => {
                                    if(typeof input === 'string' && !(input == "" && this.state.cond.value)) {
                                        $.getJSON('/modelanalysis/modeling/getcodetable', {
                                            codetable: selectedItem.codeTable,
                                            codefield: selectedItem.codeField,
                                            codedisnamefield: selectedItem.codeDisNameField,
                                            queryword: input
                                        }, (rsp) => {
                                            if(rsp.code == 0) {
                                                var rlt = _.map(rsp.data, (dataItem) => {
                                                    return {
                                                        value: dataItem.id,
                                                        label: dataItem.text
                                                    }
                                                })
                                                callback(null, {options: rlt});
                                            } else {
                                                callback(null, {options: []});
                                            }
                                        })
                                    } else {
                                        var code = _.isArray(input) && !_.isEmpty(input) ? input : this.state.cond.value;
                                        $.getJSON('/modelanalysis/modeling/getcodetablebycode', {
                                            codetable: selectedItem.codeTable,
                                            codefield: selectedItem.codeField,
                                            codedisnamefield: selectedItem.codeDisNameField,
                                            code: JSON.stringify(code)
                                        }, (rsp) => {
                                            if(rsp.code == 0) {
                                                var rlt = _.map(rsp.data, (dataItem) => {
                                                    return {
                                                        value: dataItem.id,
                                                        label: dataItem.text
                                                    }
                                                })
                                                var title;
                                                _.each(this.state.cond.value, function(id, index) {
                                                    if (index == 0) {
                                                        title = _.find(rlt, function(item) {
                                                            return id == item.value;
                                                        }).label;
                                                    } else {
                                                        var label = _.find(rlt, function(item) {
                                                            return id == item.value;
                                                        }).label;
                                                        title = title + "," + label;
                                                    }
                                                })
                                                $("#statistical-condition-input").attr("title", title);
                                                callback(null, {options: rlt});
                                            } else {
                                                callback(null, {options: []});
                                            }
                                        })
                                    }
                                }}
                                onChange={(newValue) => this.codeTagInputCallback(newValue)}/>);
            }
        }
        return (<div id="groupstatistics">
                    <div className="row mt10">
                        <div className="ml10"><label className="group-label">{i18n.t("group-statistics.grouping-field")}</label></div>
                            <div className="col-md-4 form-group">
                            <MultiSelect multiple="multiple" onChange={this.groupByColumnCallback} data={
                                _.map(columns, _.bind(function(item) {
                                    return {
                                        label: item.displayName,
                                        title: item.displayName,
                                        value: item.aliasName,
                                        selected: _.contains(this.state.groupBy, item.aliasName)
                                    }
                                },this))
                            } config={{
                                buttonWidth: '100%',
                                enableFiltering: true,
                                enableClickableOptGroups: false,
                                nonSelectedText: i18n.t("none-selected-text"),
                                nSelectedText: i18n.t("n-selected-text"),
                                allSelectedText: i18n.t("all-selected")
                            }}></MultiSelect>
                        </div>
                    </div>
                    <div className="row ">
                        <div className="ml10"><label className="group-label">{i18n.t("group-statistics.statistical-funcAndfield")}</label></div>
                        <div className="col-md-12 form-group">
                            <div className="col-md-4" style={{"paddingLeft": 0}}>
                                <MultiSelect onChange={this.groupFuncCallback} data={
                                    _.map(statisticalFunctions, _.bind(function(sf) {
                                        return {
                                            label: sf.caption,
                                            value: sf.format,
                                            selected: sf.format == this.state.cond.func
                                        }
                                    }, this))
                                } config={{buttonWidth: '100%'}} firstNoneItem={{
                                    label: UNSET_LABEL, 
                                    value: UNSET_VALUE 
                                }}></MultiSelect>
                            </div>
                            <div className="col-md-4" style={{"paddingLeft": "10px"}}>
                                <MultiSelect onChange={this.funcColumnCallback} config={{enableFiltering: true, buttonWidth: '100%'}} data={
                                    _.map(newColumns, _.bind(function(item) {
                                        return {
                                            label: item.displayName,
                                            title: item.displayName,
                                            value: item.aliasName,
                                            selected: item.aliasName == this.state.cond.columnName
                                        }
                                    }, this))
                                } firstNoneItem={{
                                    label: UNSET_LABEL, 
                                    value: UNSET_VALUE 
                                }}></MultiSelect>
                            </div> 
                        </div>
                    </div>
                    <div className="row ">
                        <div className="ml10"><label className="group-label">{i18n.t("group-statistics.statistical-condition")}</label></div>
                        <div className="form-group col-md-12">
                            <div className="col-md-4" style={{"paddingLeft": 0}}>
                                <MultiSelect onChange={this.conditionCallback} data={
                                    _.map(statisticalCondition, _.bind(function(item) {
                                        return {
                                            label: item.title,
                                            value: item.value,
                                            selected: item.value == this.state.cond.opr
                                        }
                                    }, this))
                                } config={{buttonWidth: '100%'}} firstNoneItem={{
                                    label: UNSET_LABEL, 
                                    value: UNSET_VALUE 
                                }}></MultiSelect>
                            </div>
                            <div className="col-md-8" id="statistical-condition-input" style={{"paddingLeft": "10px"}}>
                            {inputArea}
                            </div>
                        </div>
                    </div>
                    <div className="mt10">
                        <div className="pull-left" style={{"width": "100%"}}><label className="group-label">{i18n.t("group-statistics.output")}</label></div>
                        <table className='table'>
                        <thead>
                            <tr className="flex-layout">
                                <th className="flex-item text-center text-nowrap">{i18n.t("function")}</th>
                                <th className="flex-item text-center text-nowrap">{i18n.t("field")}</th>
                                <th className="flex-item text-center text-nowrap">{i18n.t("output-name")}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            _.map(this.state.outputColumnDescList, _.bind(function(outputItem, index){
                                if(!outputItem.tag.func) {
                                    var newOutputItem = _.find(columns, function(item) {
                                        return outputItem.columnName == item.aliasName;
                                    })
                                    return (
                                        <tr className="flex-layout" key={index}>
                                        <td claseName="flex-item" style={this.state.deleteMode ? {} : {display: 'none'}}></td>
                                        <td className='flex-item text-center p5'><label className="mn fw400"></label></td>
                                        <td className='flex-item text-center p5' style={{width:'100px'}}>
                                        <label className="text-ellipsis mn fw400" title={newOutputItem.displayName}>{newOutputItem.displayName}</label>
                                        </td>
                                        <td className='p5 flex-item' style={{width: '120px'}}>
                                        <input className='form-control' style={styles.formControl} data-index={index} type="text" 
                                        value={outputItem.displayName} onChange={this.outputNameCallback}/>
                                        </td>
                                        </tr>
                                        )
                                } else {
                                    var newOutputItem = _.find(columns, function(item) {
                                        return outputItem.tag.columnName == item.aliasName;
                                    })
                                    return (
                                        <tr className="flex-layout" key={index}>
                                        <td style={this.state.deleteMode ? {} : {display: 'none'}}>
                                        <button type="button" data-index={index} onClick={this.deleteBtnClick} 
                                            className="btn btn-rounded btn-danger btn-xs">
                                                <i className="fa fa-minus"></i>
                                        </button>
                                        </td>
                                        <td className='p5 flex-item'>
                                        <ItemSelect index={index} onChange={this.outputFuncCallback} data={
                                            _.map(statisticalFunctions, _.bind(function(sf) {
                                                return {
                                                    title: sf.caption,
                                                    value: sf.format
                                                }
                                            }, this))
                                        } value={outputItem.tag.func}/>             
                                        </td>
                                        <td className='p5 flex-item' style={{width: '100px'}}>
                                        <ItemSelect index={index} onChange={this.outputColumnCallback} data={
                                            _.map(this.state.outputColumnSelect, _.bind(function(item) {
                                                return {
                                                    title: item.displayName,
                                                    value: item.aliasName
                                                }
                                            }, this))
                                        } value={outputItem.tag.columnName} title={newOutputItem.displayName}/>
                                        </td>
                                        <td className='p5 flex-item' style={{width: '120px'}}>
                                        <input className='form-control' style={styles.formControl} data-index={index} type="text" 
                                        value={outputItem.displayName} onChange={this.outputNameCallback}/>
                                        </td>
                                        </tr>
                                        )
                                }
                            }, this))
                        }
                        </tbody>
                        </table>
                        {btns}
                    </div>
                </div>)
    }
});

var ItemSelect = React.createClass({
    propTypes: {
        onChange: React.PropTypes.func
    },
    render: function() {
        return (
            <select className="form-control" data-index={this.props.index} style={styles.formControl} value={this.props.value} 
            title={this.props.title} onChange={this.props.onChange}>
            {
                _.map(this.props.data, function(item, index){
                    return (
                        <option key={index} value={item.value}>{item.title}</option>
                        )
                })
            }
            </select>
        )
    }
})

// function _splitColumn(column) {
//     column = column.split('(');
//     if(_.size(column) == 1) {
//         return {
//             columnName: column[0]
//         }
//     } else if(_.size(column) == 2){
//         return {
//             func: column[0],
//             columnName: column[1].substring(0, column[1].length - 1)
//         }
//     }
//     return {};
// }

function _copyInputItem(inputItem) {
    return _.extend({}, inputItem, { columnName: inputItem.aliasName, aliasName: "", tag: { origDisplayName: inputItem.displayName } });
}

var statisticalFunc;

function _getStatisticalFunc() {
    var defer = Q.defer();
    if (statisticalFunc) {
        defer.resolve(statisticalFunc);
    } else {
        $.getJSON('/modelanalysis/modeling/groupstatistics', {}, function(res) {
            if (res.code == 0) {
                statisticalFunc = res.data.funcList;
                defer.resolve(statisticalFunc);
            } else {
                defer.reject();
            }
        });
    }
    return defer.promise;
}

module.exports.render = function(container, inputData) {
    _getStatisticalFunc().then(function(funcList) {
        var statisticalFunctions = funcList;
        inputData = checkInputData(inputData);
        var input = _.isEmpty(inputData.input) ? [] : inputData.input[0].outputColumnDescList;
        if (!inputData.output) {
            inputData.output = {
                groupBy: [input[0].aliasName],
                cond: {},
                outputColumnSelect: input,
                outputColumnDescList: [_copyInputItem(input[0])]
            }
        } else {
            inputData.output.outputColumnSelect = input;
        }
        store.dispatch({
            type: 'REPLACE',
            data: inputData
        })
        ReactDOM.render(<Provider.default><ColumnExtraction store={store} statisticalFunctions={statisticalFunctions} statisticalCondition={statisticalCondition} /></Provider.default>, container);
    });
};

module.exports.constructTaskDetail = function() { //保存
    var data = store.getState();
    var output = {
        inputNode: data.inputIds[0],
        groupBy: data.output.groupBy,
        cond:{},
        outputColumnDescList: $.extend(true, [], data.output.outputColumnDescList)
    };
    var cond = {};
    if (data.output.cond.func && data.output.cond.columnName) {
        cond.func = data.output.cond.func;
        cond.columnName = data.output.cond.columnName;
        cond.column = data.output.cond.func.replace(/\*/g, data.output.cond.columnName);
    }
    if (data.output.cond.opr && data.output.cond.value && data.output.cond.value[0]) {
        cond.opr = data.output.cond.opr;
        cond.value = data.output.cond.value;
        if (!cond.column) {
            return {
                message: window.i18n.t("warning.please-enter-statistical-function-and-field")
            }
        }
    } else if (cond.column) {
        return {
            message: window.i18n.t("warning.please-enter-statistical-condition")
        }
    }
    output.cond = cond;
    if (_.isEmpty(output.outputColumnDescList)) {
        return {
            message: window.i18n.t("warning.please-select-grouping-field")
        };
    } else {
        _.each(output.outputColumnDescList, function(item) {
            if (item.tag.func) {
                item.columnName = item.tag.func.replace(/\*/g, item.tag.columnName);
            }
        });
        return {
            detail: output
        };
    }

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
