import React from 'react';
import ReactDOM from 'react-dom';
import MultiSelect from 'widget/multiselect';
import DateTimePicker from 'widget/datetime-picker';
import { createStore } from 'redux';
import Notify from 'nova-notify';
import ValueInput from 'widget/value-input';
import { showExpressionDialog } from './modeling-expression-constructor';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
require('./modeling-profession-analysis.less');
import SingleDateTimePicker from 'widget/single-datetime-picker';
import Provider from 'widget/i18n-provider';
import Operator from 'widget/operator';
import DropDown from 'widget/single-select-dropdown';
var dialogRender = require('./modeling-dialog-wrap-notify.jsx').render;
import 'antd/dist/antd.css';

const SPLIT_WORD = ',';

const OPR_MAP = Operator.MODELING_PROFESSION_ANALYSIS_OPR_MAP;

//==========================Store=============================
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
        outputColumnDescList: [],
        cond: {}
    }
}
*/
var _isTypeEqual = function (type1, type2) {
        const types = [
            ['int', 'bigint', 'double', 'decimal'],
            ['string'],
            ['date', 'datetime', 'timestamp']
        ];
        let match = _.find(types, (item) => {
            return _.contains(item, type1) && _.contains(item, type2);
        });
        return match;
}

var reducer = function(state, action) {
    switch (action.type) {
        case 'UPDATE':
            return _.assign({}, state, { output: { outputColumnDescList: action.data } });
        case 'REPLACE':
            return action.data;
        case 'ADD_SUBITEM':
            {
                let index = action.data;
                let output = {};
                $.extend(true, output, state.output);
                let item = output.cond.children[index];
                if (typeof item !== 'undefined') {
                    let leftExpression = item.children[item.children.length - 1].leftExpression
                    let rightExpression = item.children[item.children.length - 1].rightExpression
                    let value = item.children[item.children.length - 1].value
                    let order = item.children.length
                    let message = ''
                    if (_.isEmpty(leftExpression)) {
                        message = `子条件关系第${order}条左边未填写`
                    } else if (_.isEmpty(rightExpression) && value.length < 1) {
                        message = `子条件关系第${order}条两边类型不一致`
                    }else if (!(_isTypeEqual(leftExpression.columnType, rightExpression.columnType)||
                              (value.length > 0 && typeof value[0] == leftExpression.columnType))) {
                        message = `子条件关系第${order}条两边类型不一致`
                    }
                    if (message !== '') {
                        Notify.show({
                            type: 'warning',
                            text: message
                        })
                        return state;
                    }
                } else {
                    return state;
                }
                item.children.push({
                    composite: "false",
                    opr: "equal",
                    leftExpression: {},
                    expertOpr: 0,
                    value: [],
                    rightExpression: {}
                });
                return _.assign({}, state, { output: output });
            }
        case 'DELETE_SUBITEM':
            {
                let index = action.data.index;
                let subindex = action.data.subindex;
                let output = {};
                $.extend(true, output, state.output);
                let item = output.cond.children[index];
                let typeError = state.typeError

                if (output.cond.children.length === 1 && item.children.length === 1) {
                    Notify.show({
                        type: 'warning',
                        text: window.i18n.t("warning.leave-at-least-one-condition")
                    });
                    return state;
                } else if (item.children.length === 1) {
                    output.cond.children.splice(index, 1);
                } else {
                    item.children.splice(subindex, 1);
                }
                if (typeof typeError !== 'undefined' && typeError.index == index && typeError.subindex == subindex) {
                    return _.assign({}, state, { output: output }, {typeError: {typeError: ''}});
                } else {
                    return _.assign({}, state, { output: output });
                }
            }
        case 'EDIT_SUBITEM':
            {
                let index = action.data.index;
                let subindex = action.data.subindex;
                let output = {};
                $.extend(true, output, state.output);
                let item = output.cond.children[index];
                if (item && item.children[subindex]) {
                    item.children[subindex] = action.data.content;
                    return _.assign({}, state, { output: output }, {typeError: ''});
                }
                return state;
            }
        case 'ADD_GROUPITEM':
            {
                let output = {};
                $.extend(true, output, state.output);
                output.cond.children.push({
                    composite: "true",
                    logicOperator: "and",
                    children: [{
                        composite: "false",
                        opr: "equal",
                        leftExpression: {},
                        expertOpr: 0,
                        value: [],
                        rightExpression: {}
                    }]
                })
                return _.assign({}, state, { output: output });
            }
        case 'DELETE_GROUPITEM':
            {
                let output = {};
                let index = action.data;
                $.extend(true, output, state.output);
                if (output.cond.children && output.cond.children[index]) {
                    output.cond.children.splice(index, 1);
                }
                if (output.cond.children.length > 0) {
                    return _.assign({}, state, { output: output });
                } else {
                    Notify.show({
                        type: 'warning',
                        text: window.i18n.t("warning.leave-at-least-one-condition")
                    });
                    return state;
                }
            }
        case 'EDIT_GROUPITEM':
            {
                let index = action.data.index;
                let output = {};
                $.extend(true, output, state.output);
                if (output.cond.children[index]) {
                    output.cond.children[index] = action.data.content;
                    return _.assign({}, state, { output: output });
                }
                return state;
            }
        case 'ADD_OUTPUT':
            {
                let output = {};
                $.extend(true, output, state.output);
                output.outputColumnDescList = output.outputColumnDescList || [];
                output.outputColumnDescList.push({
                    aliasName: "",
                    columnName: "",
                    displayName: ""
                });
                return _.assign({}, state, { output: output });
            }
        case 'DELETE_OUTPUT':
            {
                let output = {};
                $.extend(true, output, state.output);
                if (output.outputColumnDescList) {
                    let filtered = _.filter(output.outputColumnDescList, item => !item.selected);
                    if (filtered.length == 0) {
                        output.outputColumnDescList = [{
                            aliasName: "",
                            columnName: "",
                            displayName: ""
                        }];
                        return _.assign({}, state, { output: output });
                    } else if (filtered.length == output.outputColumnDescList.length) {
                        Notify.show({
                            type: 'warning',
                            text: '请勾选需要删除的输出字段'
                        });
                    } else {
                        output.outputColumnDescList = filtered;
                        return _.assign({}, state, { output: output });
                    }
                }
                return state;
            }
        case 'SELECT_OUTPUT':
            {
                let index = action.data.index;
                let output = {};
                $.extend(true, output, state.output);
                if (output.outputColumnDescList && output.outputColumnDescList[index]) {
                    output.outputColumnDescList[index].selected = action.data.selected;
                    return _.assign({}, state, { output: output });
                }
                return state;
            }
        case 'SELECT_ALL_OUTPUT':
            {
                let output = {};
                $.extend(true, output, state.output);
                if (output.outputColumnDescList) {
                    _.each(output.outputColumnDescList, (item) => {
                        item.selected = action.data.selected;
                    })
                    return _.assign({}, state, { output: output });
                }
                return state;
            }
        case 'MOVE_OUTPUT_FORWARD':
            {
                let output = {};
                $.extend(true, output, state.output);
                let outputColumnDescList = output.outputColumnDescList;
                if (outputColumnDescList) {
                    if (!outputColumnDescList[0].selected) {
                        let indexs = [];
                        let start = -1;
                        _.each(outputColumnDescList, (item, index) => {
                            if (start < 0 && item.selected) {
                                start = index;
                            }
                            if (start >= 0) {
                                if (!item.selected) {
                                    indexs.push({
                                        start: start,
                                        length: index - start
                                    })
                                    start = -1;
                                } else if (index == outputColumnDescList.length - 1) {
                                    indexs.push({
                                        start: start,
                                        length: outputColumnDescList.length - start
                                    })
                                    start = -1;
                                }
                            }
                        })
                        _.each(indexs, (index) => {
                            outputColumnDescList.splice(index.start - 1, 0, ...outputColumnDescList.splice(index.start, index.length));
                        })
                        return _.assign({}, state, { output: output });
                    }
                }
                return state;
            }
        case 'MOVE_OUTPUT_BACKWARD':
            {
                let output = {};
                $.extend(true, output, state.output);
                let outputColumnDescList = output.outputColumnDescList;
                if (outputColumnDescList) {
                    if (!outputColumnDescList[outputColumnDescList.length - 1].selected) {
                        let indexs = [];
                        let start = -1;
                        _.each(outputColumnDescList, (item, index) => {
                            if (start < 0 && item.selected) {
                                start = index;
                            }
                            if (start >= 0) {
                                if (!item.selected) {
                                    indexs.push({
                                        start: start,
                                        length: index - start
                                    })
                                    start = -1;
                                } else if (index == outputColumnDescList.length - 1) {
                                    indexs.push({
                                        start: start,
                                        length: outputColumnDescList.length - start
                                    })
                                    start = -1;
                                }
                            }
                        })
                        _.each(indexs, (index) => {
                            outputColumnDescList.splice(index.start + 1, 0, ...outputColumnDescList.splice(index.start, index.length));
                        })
                        return _.assign({}, state, { output: output });
                    }
                }
                return state;
            }
        case 'CLEAR_OUTPUT':
            {
                let output = {};
                $.extend(true, output, state.output);
                output.outputColumnDescList = [{
                    aliasName: "",
                    columnName: "",
                    displayName: ""
                }];
                return _.assign({}, state, { output: output });
            }
        case 'ADD_ALL_TO_OUTPUT':
            {
                let output = {};
                let size = state.input.length;
                $.extend(true, output, state.output);
                output.outputColumnDescList = _.filter(output.outputColumnDescList, function(outputItem) {
                    return outputItem.columnName;
                });
                _.each(state.input, (input, index) => {
                    let inputId = input.nodeId;
                    _.each(input.outputColumnDescList, (inputItem) => {
                        let matched = _.find(state.output.outputColumnDescList, (outputItem) => {
                            if (outputItem.tag) {
                                return size > 1 ? outputItem.tag.hint == (input.title + '.' + inputItem.displayName) : outputItem.tag.hint == inputItem.displayName;
                            }
                        });
                        if (!matched) {
                            var copyed = _copyInputItem(inputItem);
                            copyed.srcInput = inputId;
                            if (size > 1) {
                                copyed.tag.hint = input.title + '.' + copyed.tag.hint;
                                copyed.displayName = input.title + '.' + copyed.displayName;
                                copyed.columnName = 't' + (index + 1) + '.' + copyed.columnName;
                            }
                            output.outputColumnDescList.push(copyed);
                        }
                    })
                });
                return _.assign({}, state, { output: output });
            }
        case 'UPDATE_OUTPUT':
            {
                let index = action.data.index;
                let output = {};
                $.extend(true, output, state.output);
                if (output.outputColumnDescList && output.outputColumnDescList[index] && action.data.info) {
                    output.outputColumnDescList[index] = _.assign(output.outputColumnDescList[index], action.data.info);
                    return _.assign({}, state, { output: output });
                }
                return state;
            }
        case 'EDIT_GROUP_OPR':
            {
                let output = {};
                $.extend(true, output, state.output);
                output.cond.logicOperator = action.data;
                return _.assign({}, state, { output: output });
            }
        case 'UPDATE_DEL_DUPLICATE':
            {
                let output = {};
                $.extend(true, output, state.output);
                output.isDelDuplicate = action.data;
                return _.assign({}, state, { output: output });
            }
        case 'TYPE_ERROR':
            {
                let typeError = action.data
                return _.assign({}, state, {typeError: typeError})
            }

        default:
            return state;
    }
};
var store = createStore(reducer); //数据存储

function _copyInputItem(inputItem) {
    return _.extend({}, inputItem, { columnName: inputItem.aliasName, tag: { hint: inputItem.displayName } });
}

function dispatch(action, data, callback) {
    store.dispatch({
        type: action,
        data: data
    });
    if (callback) {
        callback();
    }
}

//===========================Views==============================

class ComplexInput extends React.Component {

    // componentDidMount() {
    //     $(this.refs.switcher).tooltip();
    // }
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
    }

    showDialog() {
        var input = store.getState().input;
        showExpressionDialog(input, (data) => this.props.callback(this.props.identity, data), {
            expression: this.props.expression,
            hint: this.props.value
        });
    }

    dropDownClicked() {
        this.setState({show: true});
    }

    dropDownClose() {
        this.setState({show: false});
    }

    handleDropDownSelected(value) {
        var data, copyedData;
        if (store.getState().input.length > 1) {
            data = _.find(store.getState().input[Number(value.charAt(1))-1].outputColumnDescList, function(item) {
                return item.aliasName == value.substring(3);
            })
            copyedData = _.extend({}, data, { columnName: value });
            copyedData.tag.hint = store.getState().input[Number(value.charAt(1))-1].title + '.' + data.displayName;
            copyedData.columnName = value;
            copyedData.displayName = data.tag.hint;
        } else {
            data = _.find(store.getState().input[0].outputColumnDescList, function(item) {
                return item.aliasName == value;
            })
            copyedData = _.extend({}, data, { columnName: value }, { tag: { hint: data.displayName }});
        }
        this.props.callback(this.props.identity, copyedData);
        this.setState({show: false});
    }

    switchClicked() {
        if (this.props.switchCallback) {
            this.props.switchCallback(this.props.identity);
        }
    }

    render() {
        var {i18n} = this.context;
        // dropdown
        var data = [];
        if (store.getState().input.length > 1) {
            _.each(store.getState().input, function(list, index) {
                data = _.union(data, _.map(list.outputColumnDescList, function(item) {
                    return {
                        title: list.title + '.' + item.displayName,
                        value: 't' + (index+1) + '.' + item.aliasName
                    }
                }))
            })
        } else {
            data = _.map(store.getState().input[0].outputColumnDescList, function(item) {
                return {
                    title: item.displayName,
                    value: item.aliasName
                }
            })
        }

        var out;
        if (this.props.pullRight) {
            out = (
                <div className="input-group" style={{width: '100%', minWidth: '100px'}}>
                <input ref="expressionInput" onClick={this.showDialog.bind(this)} type="text" placeholder={this.props.placeholder || i18n.t("profession-analysis.complex-value")} className="form-control" 
                    readOnly="true" value={this.props.value || ''} title={this.props.value} style={this.props.hideSwitcher ? {borderRadius: 0, width: '100%'} : {width: '100%'}}/>
                <span ref="switcher" className="input-group-addon cursor" style={this.props.hideSwitcher ? {display: 'none'} : {}} onClick={this.switchClicked.bind(this)}
                    data-toggle="tooltip" data-placement="bottom" title={i18n.t("profession-analysis.toggle")}>
                <i className="fa fa-exchange"></i>
                </span>
                </div>
            )
        } else {
            out = (
                <div className="input-group" style={{width: '100%', minWidth: '100px'}}>
                <span ref="switcher" className="input-group-addon cursor" style={this.props.hideSwitcher ? {display: 'none'} : {}} onClick={this.switchClicked.bind(this)}
                    data-toggle="tooltip" data-placement="bottom" title={i18n.t("profession-analysis.toggle")}>
                <i className="fa fa-exchange"></i>
                </span>
                <input ref="expressionInput" onClick={this.showDialog.bind(this)} type="text" placeholder={this.props.placeholder || i18n.t("profession-analysis.complex-value")} className="form-control" 
                    readOnly="true" value={this.props.value || ''} title={this.props.value} style={this.props.hideSwitcher ? {borderRadius: 0, width: '100%'} : {width: '100%'}}/>
                <span ref="dropdownBtn" className="input-group-addon cursor" onClick={this.dropDownClicked.bind(this)} style={{width: '40px'}}>
                    <i className="fa fa-chevron-down"/>
                </span>
                <DropDown data={data} show={this.state.show} onClick={this.handleDropDownSelected.bind(this)} onCloseClicked={this.dropDownClose.bind(this)}/>
                </div>
            )
        }
        return out;
    }
}

ComplexInput.propTypes = {
    identity: React.PropTypes.any,
    placeholder: React.PropTypes.string,
    pullRight: React.PropTypes.bool,
    expression: React.PropTypes.string,
    value: React.PropTypes.string,
    hideSwitcher: React.PropTypes.string,
    switchCallback: React.PropTypes.func,
    callback: React.PropTypes.func.isRequired
};

ComplexInput.contextTypes = {
    i18n: React.PropTypes.object
};

class ProfessionCondition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            onDeleteMode: false
        }
    }

    isTypeEqual(type1, type2) {
        const types = [
            ['int', 'bigint', 'double', 'decimal'],
            ['string'],
            ['date', 'datetime', 'timestamp']
        ];
        let match = _.find(types, (item) => {
            return _.contains(item, type1) && _.contains(item, type2);
        });
        return match;
    }

    toggleExpertMode(index) {
        var cond = this.props.cond;
        var item = cond.children[index];
        item.expertOpr = item.expertOpr == 1 ? 0 : 1;
        item.value = [];
        item.rightExpression = {};

        dispatch('EDIT_SUBITEM', {
            index: this.props.index,
            subindex: index,
            content: item
        });
    }

    oprCallback(identity, option, checked, select) {
        var cond = this.props.cond;
        var item = cond.children[identity.index];
        var preOpr = item.opr;
        item.opr = option.val();
        var columnType = item.leftExpression.columnType;
        var codeTag = item.leftExpression.codeTag;
        var logicOpr;
        if (codeTag == 1) {
            logicOpr = _.find(OPR_MAP['codeTagOpr'], function(oprItem) {
                return oprItem.key === item.opr;
            })
            item.expertOpr = logicOpr.onlyExpert ? 1 : logicOpr.expert ? item.expertOpr : 0;
            if (Operator.isOprMultiple(preOpr) != Operator.isOprMultiple(option.val())) {
                item.value = [];
            }  
        } else if (columnType === 'string') {
            logicOpr = _.find(OPR_MAP['stringOpr'], function(oprItem) {
                return oprItem.key === item.opr;
            })
            item.expertOpr = logicOpr.onlyExpert ? 1 : logicOpr.expert ? item.expertOpr : 0;
            if (Operator.isOprMultiple(preOpr) != Operator.isOprMultiple(option.val())) {
                item.value = [];
            }  
        } else if (Operator.isNumber(columnType)) {
            logicOpr = _.find(OPR_MAP['numberOpr'], function(oprItem) {
                return oprItem.key === item.opr;
            })
            item.expertOpr = logicOpr.onlyExpert ? 1 : logicOpr.expert ? item.expertOpr : 0;
            if (Operator.isOprMultiple(preOpr) != Operator.isOprMultiple(option.val())) {
                item.value = [];
            }  
        } else if (Operator.isTime(columnType)){
            logicOpr = _.find(OPR_MAP['dateTimeOpr'], function(oprItem) {
                return oprItem.key === item.opr;
            })
            item.expertOpr = logicOpr.onlyExpert ? 1 : logicOpr.expert ? item.expertOpr : 0;
        }
        dispatch('EDIT_SUBITEM', {
            index: this.props.index,
            subindex: identity.index,
            content: item
        });
    }

    simpleInputCallback(value, index, e) {
        var cond = this.props.cond;
        var item = cond.children[index];
        let pureValue = new Array()
        for (let i = 0; i < value.length; i++) {
            if (value[i].indexOf(',') > -1 || value[i].indexOf('，') > -1) {
                let listItem = value[i].split( /[',', '，']/ )
                pureValue = [...pureValue, ...listItem]
            } else {
                pureValue.push(value[i])
            }
        }
        item.value = pureValue;
        dispatch('EDIT_SUBITEM', {
            index: this.props.index,
            subindex: index,
            content: item
        });
    }

    /*_getSingleArray (repeaArray) {
        let newArray = []
        for (let i = 0; i < repeaArray.length; i++) {
            let times = 0
            if (newArray.indexOf(repeaArray[i]) < 0) {
                newArray.push(repeaArray[i])
            }
        }
        return newArray
    }*/

    _getSingleArray (repeaArray) {
        let newArray = new Array()
        let returnArray = new Array()
        let listItem = ''
        for (let i = 0; i < repeaArray.length; i++) {
            listItem = repeaArray[i]
            
            let count = 1
            for (let o = i; o < repeaArray.length; o++) {
                if (listItem === repeaArray[o]) {
                    count += 1
                }
            }
            if (returnArray.indexOf(listItem) < 0) {
                returnArray.push(listItem)
                newArray.push({value: listItem, count: count, key: i, isChecked: true})
            }
        }
        return newArray
    }

    _simpleInputBlurCallback (value, index, e) {
        var cond = this.props.cond;
        var item = cond.children[index];
        item.value = value
        if (typeof value !== 'undefined' && value.length > 0) {
            let filterValue = []
            let repeatValue = []
            let valueList
            if (value.length > 0) {
                for (let v = 0; v < value.length; v++) {
                    let valueList = value[v]
                    let index = valueList.indexOf('，')
                    if (index > -1) {
                        valueList = valueList[0, index - 1]
                    }
                    if (valueList !== '' && filterValue.indexOf(valueList) > -1) {
                        repeatValue.push(valueList)
                    }
                    if (filterValue.indexOf(valueList) < 0) {
                        filterValue.push(value[v])
                    }
                }
            }
            
            if (repeatValue.length > 0) {
                var dialogValue = this._getSingleArray(repeatValue)
                dialogRender({value: dialogValue}, _callback.bind(this))
            }
            function _callback (valueData, e) {
                let valueArray = new Array()
                if (valueData.length > 0) {
                    for (let i = 0; i < value.length; i++) {
                        let valueList = value[i]
                        let index = valueList.indexOf('，')
                        if (index > -1) {
                            valueList = valueList[0, index - 1]
                        }
                        if (valueData.indexOf(valueList) < 0 ||
                            valueData.indexOf(valueList) > -1 && valueArray.indexOf(valueList) < 0) {
                            valueArray.push(valueList)
                        }
                    }
                }
                
                item.value = valueData.length > 0 ? filterValue : value
                dispatch('EDIT_SUBITEM', {
                    index: this.props.index,
                    subindex: index,
                    content: item
                });
            }
        }
    }

    codeTagInputCallback(value, index) {
        var cond = this.props.cond;
        var item = cond.children[index];
        item.value = value;
        dispatch('EDIT_SUBITEM', {
            index: this.props.index,
            subindex: index,
            content: item
        });
    }

    complexInputCallback(index, data) {
        var cond = this.props.cond;
        var item = cond.children[index];
        if (_.isEmpty(item.leftExpression) || this.isTypeEqual(item.leftExpression.columnType, data.columnType)) {
            item.rightExpression = _.assign(cond.children[index].rightExpression, { expression: data.columnName },
                _.pick(data, 'displayName', 'codeTag', 'codeTable', 'codeField', 'codeDisNameField', 'columnType', 'length', 'scale', 'srcInput', 'tag'));
            dispatch('EDIT_SUBITEM', {
                index: this.props.index,
                subindex: index,
                content: item
            });
        } else {
            Notify.show({
                type: 'warning',
                title: '两边类型不一致'
            });
            dispatch('TYPE_ERROR', {
                typeError: `第${this.props.index + 1}个子条件关系第${index + 1}条关系两边类型不一致`,
                index: this.props.index,
                subindex: index
            });
        }
    }

    fieldInputCallback(index, data) {
        var cond = this.props.cond;
        var item = cond.children[index];

        if (!item.expertOpr || _.isEmpty(item.rightExpression) || this.isTypeEqual(item.rightExpression.columnType, data.columnType)) {
            item.leftExpression = _.assign(cond.children[index].leftExpression, { expression: data.columnName },
                _.pick(data, 'displayName', 'codeTag', 'codeTable', 'codeField', 'codeDisNameField', 'columnType', 'length', 'scale', 'srcInput', 'tag'));
            if (data.codeTag == 1) {
                item.opr = OPR_MAP['codeTagOpr'][0].key;
            } else if (Operator.isNumber(data.columnType)) {
                item.opr = OPR_MAP['numberOpr'][0].key;
            } else if (Operator.isTime(data.columnType)) {
                item.opr = OPR_MAP['dateTimeOpr'][0].key;
            } else {
                item.opr = OPR_MAP['stringOpr'][0].key;
            }
            item.value = [];
            dispatch('EDIT_SUBITEM', {
                index: this.props.index,
                subindex: index,
                content: item
            });
        } else {
            Notify.show({
                type: 'warning',
                title: '两边类型不一致'
            });
            dispatch('TYPE_ERROR', {
                typeError: `第${this.props.index + 1}个子条件关系第${index + 1}条两边类型不一致`,
                index: this.props.index,
                subindex: index
            });
        }
    }

    getRight(item, index) {
        var codeTag = item.leftExpression.codeTag;
        var columnType = item.leftExpression.columnType;
        var canExpert;
        var expert;
        var onlyExpert;
        var opr;
        var rightInput;
        var {i18n} = this.context;

        if (codeTag != 1) {
            if (Operator.isNumber(columnType)) {
                opr = _.find(OPR_MAP['numberOpr'], function(oprItem) {
                    return oprItem.key == item.opr;
                })
                canExpert = opr && opr.expert;
                expert = parseInt(item.expertOpr) && canExpert;
                onlyExpert = opr && opr.onlyExpert;
                if (expert) {
                    rightInput = (<ComplexInput pullRight="true" identity={index} expression={item.rightExpression.expression} value={item.rightExpression.displayName}
                        callback={this.complexInputCallback.bind(this)} switchCallback={this.toggleExpertMode.bind(this)} hideSwitcher={onlyExpert}/>)
                } else {
                    rightInput = (
                        <div className="input-group" style={{width: '100%', minWidth: '120px'}}>
                        <ValueInput type={Operator.isOprMultiple(item.opr) ? 'text' : 'number'} className="form-control ph5" data-index={index} 
                          placeholder={Operator.isOprMultiple(item.opr)?i18n.t("profession-analysis.simple-value")+"(" + i18n.t('multi-input-hint') + ")":i18n.t("profession-analysis.simple-value")}
                          multiple={Operator.isOprMultiple(item.opr)} onChange={(value) => this.simpleInputCallback(value, index)} splitWord={SPLIT_WORD} value={item.value}/>
                        <span className="input-group-addon cursor" style={canExpert ? {} : {display: 'none'}}
                            data-toggle="tooltip" data-placement="bottom" title={i18n.t("profession-analysis.toggle")} onClick={() => this.toggleExpertMode(index)}>
                        <i className="fa fa-exchange"></i>
                        </span>
                        </div>
                    )
                }
                return (
                    <div className="value-opr-container">
                        <div className="opr-select pn" style={{flex: 5}}>
                            <MultiSelect
                                config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs13 mnw50',buttonWidth: '100%'}}
                                identity={{index: index}}
                                updateData={true}
                                onChange={this.oprCallback.bind(this)} 
                                data={
                                    _.map(OPR_MAP['numberOpr'], function(oprItem) {
                                        return {
                                            label: oprItem.name,
                                            title: oprItem.key,
                                            value: oprItem.key,
                                            type: 'string',
                                            selected: item.opr === oprItem.key
                                        }
                                    })
                            }/>
                        </div>
                        <div className="pn" style={{flex: 7}}>
                            {rightInput}
                        </div>
                    </div>
                )
            } else if (Operator.isTime(columnType)) {
                opr = _.find(OPR_MAP['dateTimeOpr'], function(oprItem) {
                    return oprItem.key == item.opr;
                });
                canExpert = opr && opr.expert;
                expert = parseInt(item.expertOpr) && canExpert;
                let dateType = columnType == 'date' ? 'date' : 'datetime';
                if (expert) {
                    rightInput = (<ComplexInput pullRight="true" identity={index} expression={item.rightExpression.expression} value={item.rightExpression.displayName}
                        callback={this.complexInputCallback.bind(this)} switchCallback={this.toggleExpertMode.bind(this)}/>)
                } else {
                    if (_.contains(["notGreaterThan", "notLessThan", "equal", "notEqual"], opr.key)) {
                        rightInput = (
                            <SingleDateTimePicker type={dateType} needDefault={true} needMask={true} value={_.isEmpty(item.value)?null:item.value}
                                onChange={(value) => this.simpleInputCallback(_.isEmpty(value)?[]:[value], index)}>
                                <span className="input-group-addon cursor" style={canExpert ? {} : {display: 'none'}}
                                    data-toggle="tooltip" data-placement="bottom" title={i18n.t("profession-analysis.toggle")} onClick={() => this.toggleExpertMode(index)}>
                                <i className="fa fa-exchange"></i>
                                </span>
                            </SingleDateTimePicker>);
                    } else if (_.contains(["isNull", "isNotNull"], opr.key)) {
                        rightInput = (<ValueInput className="form-control ph5"/>);
                    } else {
                        rightInput = (
                            <DateTimePicker type={dateType} needMask={true} value={_.isEmpty(item.value)?null:item.value.join('~')}
                                onChange={(value) => this.simpleInputCallback(_.isEmpty(value)?[]:value.split('~'), index)}>
                                <span className="input-group-addon cursor" style={canExpert ? {} : {display: 'none'}}
                                    data-toggle="tooltip" data-placement="bottom" title="切换" onClick={() => this.toggleExpertMode(index)}>
                                <i className="fa fa-exchange"></i>
                                </span>
                            </DateTimePicker>);
                    }
                }
                return (
                    <div className="value-opr-container">
                    <div className="opr-select pn" style={{flex: 4}}>
                        <MultiSelect
                            config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs13 mnw50',buttonWidth: '100%'}}
                            identity={{index: index}}
                            updateData={true}
                            onChange={this.oprCallback.bind(this)} 
                            data={
                                _.map(OPR_MAP['dateTimeOpr'], function(oprItem) {
                                    return {
                                        label: oprItem.name,
                                        title: oprItem.key,
                                        value: oprItem.key,
                                        type: 'string',
                                        selected: item.opr === oprItem.key
                                    }
                                })
                        }/>
                    </div>
                    <div className="pn" style={{flex: 8}}>
                    {rightInput}
                    </div>
                </div>
                ) 
            } else {
                opr = _.find(OPR_MAP['stringOpr'], function(oprItem) {
                    return oprItem.key == item.opr;
                })
                canExpert = opr && opr.expert;
                expert = parseInt(item.expertOpr) && canExpert;
                onlyExpert = opr && opr.onlyExpert;

                if (expert) {
                    rightInput = (<ComplexInput pullRight="true" identity={index} expression={item.rightExpression.expression} value={item.rightExpression.displayName}
                        callback={this.complexInputCallback.bind(this)} switchCallback={this.toggleExpertMode.bind(this)} hideSwitcher={onlyExpert}/>)
                } else {
                    rightInput = (
                        <div className="input-group" style={{width: '100%', minWidth: '120px'}}>
                            <ValueInput
                                type='text'
                                className="form-control ph5"
                                data-index={index} 
                                placeholder={Operator.isOprMultiple(item.opr)?i18n.t("profession-analysis.simple-value")+"("+i18n.t('multi-input-hint')+")":i18n.t("profession-analysis.simple-value")}
                                multiple={Operator.isOprMultiple(item.opr)}
                                onChange={(value) => this.simpleInputCallback(value, index)}
                                onBlur={(value) => this._simpleInputBlurCallback(value, index)}
                                splitWord={SPLIT_WORD}
                                value={item.value} />
                            <span className="input-group-addon cursor" style={canExpert ? {} : {display: 'none'}} 
                                data-toggle="tooltip" data-placement="bottom" title={i18n.t("profession-analysis.toggle")} onClick={() => this.toggleExpertMode(index)}>
                                <i className="fa fa-exchange"></i>
                            </span>
                        </div>
                    )
                }
                return (
                    <div className="value-opr-container">
                        <div className="opr-select pn" style={{flex: 5}}>
                            <MultiSelect
                                config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs13 mnw50',buttonWidth: '100%'}}
                                identity={{index: index}}
                                updateData={true}
                                onChange={this.oprCallback.bind(this)} 
                                data={
                                    _.map(OPR_MAP['stringOpr'], function(oprItem) {
                                        return {
                                            label: oprItem.name,
                                            title: oprItem.key,
                                            value: oprItem.key,
                                            type: 'string',
                                            selected: item.opr === oprItem.key
                                        }
                                    })
                            }/>
                        </div>
                        <div className="pn" style={{flex: 7}}>
                        {rightInput}
                        </div>
                    </div>
                )
            }
        } else {
            opr = _.find(OPR_MAP['codeTagOpr'], function(oprItem) {
                return oprItem.key == item.opr;
            })
            canExpert = opr && opr.expert;
            expert = parseInt(item.expertOpr) && canExpert;
            onlyExpert = opr && opr.onlyExpert;
            if (expert) {
                rightInput = (<ComplexInput pullRight="true" identity={index} expression={item.rightExpression.expression} value={item.rightExpression.displayName}
                        callback={this.complexInputCallback.bind(this)} switchCallback={this.toggleExpertMode.bind(this)} hideSwitcher={onlyExpert}/>)
            } else {
                rightInput = (
                    <div className="input-group" id={this.props.index + '-'+ index} style={{width: '100%', minWidth: '120px'}}>
                    <div className="codeTag1">
                    <Select name="codeTag" className="valueInput" multi={true} value={item.value} clearable={false}
                        placeholder={i18n.t("profession-analysis.simple-value")} cacheAsyncResults={false} noResultsText={i18n.t("no-results-text")} searchPromptText={i18n.t("search-prompt")}
                        asyncOptions={(input, callback) => {
                            if(typeof input === 'string' && !(input == "" && !_.isEmpty(item.value))) {
                                $.getJSON('/modelanalysis/modeling/getcodetable', {
                                        codetable: item.leftExpression.codeTable,
                                        codefield: item.leftExpression.codeField,
                                        codedisnamefield: item.leftExpression.codeDisNameField,
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
                                var code = _.isArray(input) && !_.isEmpty(input) ? input :item.value;
                                $.getJSON('/modelanalysis/modeling/getcodetablebycode', {
                                        codetable: item.leftExpression.codeTable,
                                        codefield: item.leftExpression.codeField,
                                        codedisnamefield: item.leftExpression.codeDisNameField,
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
                                            _.each(item.value, function(id, index) {
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
                                            $("#"+ this.props.index + '-'+ index).attr("title", title);
                                            callback(null, {options: rlt});
                                        } else {
                                            callback(null, {options: []});
                                        }
                                    })
                            }
                        }}
                        onChange={(newValue) => this.codeTagInputCallback(_.isEmpty(newValue) ? [] : newValue.split(','), index)}
                     />
                    </div>
                    <span className="input-group-addon cursor" style={canExpert ? {} : {display: 'none'}} 
                            data-toggle="tooltip" data-placement="bottom" title={i18n.t("profession-analysis.toggle")} onClick={() => this.toggleExpertMode(index)}>
                        <i className="fa fa-exchange"></i>
                    </span>
                    </div>
                )
            }
            return (
                <div className="value-opr-container">
                    <div className="opr-select pn" style={{flex: 5}}>
                        <MultiSelect
                            config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs13 mnw50',buttonWidth: '100%'}}
                            identity={{index: index}}
                            updateData={true}
                            onChange={this.oprCallback.bind(this)} 
                            data={
                                _.map(OPR_MAP['codeTagOpr'], function(oprItem) {
                                    return {
                                        label: oprItem.name,
                                        title: oprItem.key,
                                        value: oprItem.key,
                                        type: 'string',
                                        selected: item.opr === oprItem.key
                                    }
                                })
                        }/>
                    </div>
                    <div className="pn" style={{flex: 7}}>
                    {rightInput}
                    </div>
                </div>)
        }
    }

    render() {
        var cond = this.props.cond;
        var checked = cond.checked;
        var onDeleteMode = this.state.onDeleteMode;
        var canDelete = this.props.canDelete;
        var btns;
        var {i18n} = this.context;
        if (!onDeleteMode) {
            btns = (
                <div>
                    <div className='text-right'>
                    <button type="button" onClick={this.addBtnClick.bind(this)}
                        className="add-record btn btn-rounded btn-primary btn-xs">
                        <i className="fa fa-plus fa-fw"></i>
                    </button>
                    <button type="button" onClick={this.toggleDeleteMode.bind(this)}
                        className="delete-record btn btn-rounded btn-danger btn-xs">
                        <i className="fa fa-minus fa-fw"></i>
                    </button>
                    </div>                              
                </div>)
        } else {
            btns = (
                <div>
                    <div className='complete-delete text-right'>
                    <button type="button" onClick={this.toggleDeleteMode.bind(this)}
                        className="btn btn-default btn-xs" style={{width: '60px'}}>{i18n.t("complete-btn")}
                    </button>
                    </div>
                </div>)
        }

        return (
            <div className="module filter-condition"  style={checked ? {backgroundColor: '#eeeeee', padding: '10px 0'} : {padding: '10px 0'}}>
                <div style={canDelete ? {'float': 'right', 'cursor': 'pointer'} : {display: 'none'}} onClick={this.deleteGroup.bind(this)}>
                    <span className="text-danger fs15 fa fa-trash-o p5"></span>
                </div>
                <form className="form-horizontal" role="form">
                <div className="form-group">
                    <label className="col-md-5 control-label">{i18n.t("sub-condition-relationship")}</label>
                        <div className="col-md-5">
                            <div className="bs-component">
                                <label className="radio-inline mr10">
                                    <input type="radio"  name="conditionRadio" value="or" onChange={this.logicOperatorCallback} checked={cond.logicOperator == 'or'}/>{i18n.t("or")}
                                </label>
                                <label className="radio-inline mr10">
                                    <input type="radio"  name="conditionRadio" value="and" onChange={this.logicOperatorCallback} checked={cond.logicOperator == 'and'}/>{i18n.t("and")}
                                </label>
                            </div>
                        </div>
                </div>
                </form>
                <div>
                {
                    _.map(cond.children, _.bind(function(item, index) {
                        return (
                            <div style={{minWidth: '200px'}} className="form-group mb10" key={index}>
                                <div className="col-md-1 pn deleteStyle" style={onDeleteMode?{}:{display: 'none'}}>
                                    <button type="button" data-index={index} onClick={this.deleteBtnClick.bind(this)}
                                        className="btn-delete-record btn btn-rounded btn-danger btn-xs pull-left mt10">
                                        <i className="fa fa-minus"></i>
                                    </button>
                                </div>
                                <div className="col-md-4 pn">
                                    <ComplexInput hideSwitcher="true" placeholder={i18n.t("click-edit-expression")} expression={item.leftExpression.expression} 
                                        value={item.leftExpression.displayName} identity={index} callback={this.fieldInputCallback.bind(this)} />
                                </div>
                                <div className={onDeleteMode ? 'col-md-7 pn' : 'col-md-8 pn'}>
                                {
                                    this.getRight(item, index)
                                }
                                </div>
                            </div>)
                    }, this))
                }
                </div>
                {btns}
            </div>)
    }

    addBtnClick() {
        dispatch('ADD_SUBITEM', this.props.index);
    }

    deleteBtnClick(e) {
        dispatch('DELETE_SUBITEM', {
            index: this.props.index,
            subindex: $(e.currentTarget).attr('data-index')
        })
    }

    deleteGroup() {
        dispatch('DELETE_GROUPITEM', this.props.index);
    }

    toggleDeleteMode() {
        var onDeleteMode = !this.state.onDeleteMode;
        this.setState({ onDeleteMode: onDeleteMode });
    }

    onGroupChecked(e) {
        var cond = this.props.cond;
        cond.checked = e.target.checked;
        dispatch('EDIT_GROUPITEM', {
            index: this.props.index,
            content: cond
        });
    }

    logicOperatorCallback(e) {
        var cond = this.props.cond;
        cond.logicOperator = $(e.currentTarget).val();
        dispatch('EDIT_GROUPITEM', {
            index: this.props.index,
            content: cond
        });
    }
}

ProfessionCondition.contextTypes = {
    i18n: React.PropTypes.object
};

class OutputTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            onDeleteMode: false
        }
    }

    addBtnClick() {
        dispatch('ADD_OUTPUT');
    }

    resetBtnClick() {
        dispatch('ADD_ALL_TO_OUTPUT');
    }

    clearOutput() {
        dispatch('CLEAR_OUTPUT');
    }

    selectOutputItem(e) {
        dispatch('SELECT_OUTPUT', { index: $(e.currentTarget).attr('data-index'), selected: e.target.checked });
    }

    selectallOutputItem(e) {
        dispatch('SELECT_ALL_OUTPUT', { selected: e.target.checked });
    }

    moveOutputForward() {
        dispatch('MOVE_OUTPUT_FORWARD');
    }

    moveOutputBackward() {
        dispatch('MOVE_OUTPUT_BACKWARD');
    }

    toggleDeleteMode() {
        var deleteMode = !this.state.deleteMode;
        dispatch('SELECT_ALL_OUTPUT', { selected: false });
        this.setState({ deleteMode: deleteMode });
    }

    deleteBtnClick() {
        dispatch('DELETE_OUTPUT')
    }

    expressionCallback(index, data) {
        dispatch('UPDATE_OUTPUT', {
            index: index,
            info: data
        });
    }

    outputCallback(e) {
        var index = $(e.target).attr('data-index');
        dispatch('UPDATE_OUTPUT', {
            index: index,
            info: { displayName: e.target.value }
        });
    }

    render() {
        var {i18n} = this.context;
        var outputColumnDescList = this.props.output;
        var btns = (<div className="panel-footer text-right">
                <button type="button" onClick={this.resetBtnClick.bind(this)} className="btn btn-rounded btn-system btn-xs mr5 pull-left">
                    {i18n.t("get-all-btn")}
                </button>
                <button type="button" onClick={this.addBtnClick.bind(this)} className="btn btn-rounded btn-primary btn-xs mr5">
                    {i18n.t("add-btn")}
                </button>
                <button type="button" onClick={this.toggleDeleteMode.bind(this)} className="btn btn-rounded btn-default btn-xs">
                    编辑
                </button>
            </div>)
        if (this.state.deleteMode) {
            btns = (<div className="panel-footer text-right">
                <button type="button" onClick={this.moveOutputForward.bind(this)} className="btn btn-rounded btn-default btn-xs mr5 pull-left">
                    上移
                </button>
                <button type="button" onClick={this.moveOutputBackward.bind(this)} className="btn btn-rounded btn-default btn-xs mr5 pull-left">
                    下移
                </button>
                <button type="button" onClick={this.deleteBtnClick.bind(this)} className="btn btn-rounded btn-danger btn-xs mr5">
                    删除
                </button>
                <button type="button" onClick={this.toggleDeleteMode.bind(this)} className="btn btn-rounded btn-default btn-xs">
                    完成
                </button>
            </div>)
        }

        let isAllSelected = _.reduce(outputColumnDescList, (rlt, item) => rlt && item.selected, true);

        return (
            <div className="panel">
            <div className="panel-body pn" style={{border: 'none'}}>
            <table className="table table-bordered">
                <thead>
                    <tr key={1}>
                    <th style={this.state.deleteMode ? {} : {display: 'none'}}>
                        <input type="checkbox" checked={isAllSelected} onChange={this.selectallOutputItem.bind(this)} />
                    </th>
                    <th>{i18n.t("field")}</th>
                    <th>{i18n.t("output-name")}</th>
                    </tr>
                </thead>
                <tbody>
                {_.map(outputColumnDescList, (item, index) => {
                return (<tr key = {index + 2}>
                    <td style={this.state.deleteMode ? {} : {display: 'none'}}>
                    <input data-index={index} type="checkbox" checked={item.selected} onChange={this.selectOutputItem.bind(this)} />
                    </td>
                    <td className="p5"><ComplexInput identity={index} callback={this.expressionCallback.bind(this)} 
                        hideSwitcher="true" placeholder={i18n.t("click-edit-expression")} expression={item.columnName} value={item.tag ? item.tag.hint : null}/></td>
                    <td className="p5"><input data-index={index} type="text" className="form-control" value={item.displayName} 
                        title={item.displayName} onChange={this.outputCallback.bind(this)} style={{borderRadius: 0}}/></td>
                    </tr>)
                })}
                </tbody>
            </table>
            </div>
            {btns}
            </div>
        )
    }
}

OutputTable.contextTypes = {
    i18n: React.PropTypes.object
};

class ProfessionAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cond: props.cond,
            onDeleteMode: false
        }
    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        })
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    addGroupHandle() {
        dispatch('ADD_GROUPITEM');
    }

    logicOperatorCallback(identity, option, checked, select) {
        dispatch('EDIT_GROUP_OPR', option.val());
    }

    toggleDeleteMode() {
        var onDeleteMode = !this.state.onDeleteMode;
        this.setState({ onDeleteMode: onDeleteMode });
    }

    onUniqChecked(e) {
        var isDelDuplicate = e.target.checked ? 1 : 0;
        dispatch('UPDATE_DEL_DUPLICATE', isDelDuplicate);
    }

    render() {
        var {i18n} = this.context;
        var state = store.getState();
        var cond = state.output.cond;
        var output = state.output.outputColumnDescList;
        var onDeleteMode = this.state.onDeleteMode;
        var isDelDuplicate = state.output.isDelDuplicate == 1;
        var btns = (<div className="col-md-5 pn text-right"><div className="btn-group">
                        <a className="btn btn-primary btn-sm" onClick={this.addGroupHandle.bind(this)}><span>{i18n.t("add-btn")}</span></a>
                        <a className="btn btn-danger btn-sm" onClick={this.toggleDeleteMode.bind(this)}><span>{i18n.t("delete-btn")}</span></a>
                        </div></div>)
        if (onDeleteMode) {
            btns = (<div className="col-md-5 pn text-right"><div className="btn-group">
                        <a className="btn btn-default btn-sm" onClick={this.toggleDeleteMode.bind(this)}><span>{i18n.t("complete-btn")}</span></a>
                        </div></div>)
        }
        return (
            <div className="profession-analysis">
            <table className="table form-horizontal query-fields">
                <tbody>
                    <tr key={1}><td style={{padding: "10px 0"}}>
                    <div className="col-md-7 pn group-opr-select">
                        <MultiSelect
                            config={{buttonClass: 'multiselect dropdown-toggle btn btn-info btn-sm mnw50 fs13',buttonWidth: '60px'}}
                            updateData={true}
                            onChange={this.logicOperatorCallback.bind(this)} 
                            data={[{
                                    label: i18n.t("or"),
                                    value: 'or',
                                    selected: cond.logicOperator === 'or'
                                },{
                                    label: i18n.t("and"),
                                    value: 'and',
                                    selected: cond.logicOperator === 'and'
                                }]}/>
                    </div>
                    {btns}
                    </td></tr>
                    {
                        _.map(cond.children, _.bind(function(item, index) {
                            return (
                                <tr key={index + 2}><td className="pn">
                                <ProfessionCondition cond={item} index={index} canDelete={onDeleteMode}/>
                                </td></tr>)
                        }, this))
                    }
                </tbody>
            </table>
            <div>
                <div className="row mt10 mb10">
                    <label className="col-md-4" style={{fontSize: "18px", fontWeight: 'lighter'}}>{i18n.t("output-field")}</label>
                    <div className="col-md-8 text-right" style={{paddingTop: '2px'}}>
                    <input type="checkbox" checked={isDelDuplicate} onChange={this.onUniqChecked} /><span className="ml5 fs13 fw600">{i18n.t("profession-analysis.del-duplicate")}</span>
                    </div>
                </div>
                <OutputTable output={output}/>
            </div>
            </div>
        )
    }
}

ProfessionAnalysis.contextTypes = {
    i18n: React.PropTypes.object
};

export function render(container, inputData) {
    inputData = checkInputData(inputData);
    if (_.isEmpty(inputData.output)) {
        inputData.output = {
            cond: {
                composite: "true",
                logicOperator: "and",
                children: [{
                    composite: "true",
                    logicOperator: "and",
                    children: [{
                        composite: "false",
                        opr: "equal",
                        leftExpression: {},
                        expertOpr: 0, // 是否启用复杂值条件
                        value: [], //expertOpr为0时使用 
                        rightExpression: {}
                    }]
                }]
            },
            isDelDuplicate: 0,
            outputColumnDescList: [{
                aliasName: "",
                columnName: "",
                displayName: ""
            }]
        }
    } else if (_.isEmpty(inputData.output.cond)) {
        inputData.output.cond = {
            composite: "true",
            logicOperator: "and",
            children: [{
                composite: "true",
                logicOperator: "and",
                children: [{
                    composite: "false",
                    opr: "equal",
                    leftExpression: {},
                    expertOpr: 0, // 是否启用复杂值条件
                    value: [], //expertOpr为0时使用 
                    rightExpression: {}
                }]
            }]
        };
    } else if (_.isEmpty(inputData.output.outputColumnDescList)) {
        inputData.output.outputColumnDescList = [{
            aliasName: "",
            columnName: "",
            displayName: ""
        }];
    }
    dispatch('REPLACE', inputData);

    ReactDOM.render(<Provider><ProfessionAnalysis /></Provider>, container);
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


export function constructTaskDetail() {
    var data = store.getState();
    var cond = data.output.cond || {};
    var typeError = data.typeError || {typeError: ''}
    if (typeError.typeError !== '') {
        return {
            message: typeError.typeError
        }
    }
    cond.children = _.filter(data.output.cond.children, (condItem) => {
        return _.find(condItem.children, (child) => {
            if (_.isEmpty(child.leftExpression)) {
                return false;
            }
            if (child.opr == 'isNull' || child.opr == 'isNotNull') {
                return true;
            }
            if (parseInt(child.expertOpr)) {
                return !_.isEmpty(child.rightExpression);
            } else {
                return !_.isEmpty(child.value);
            }

        })
    });

    if(_.isEmpty(cond.children)) {
        cond = {};
        return {
            message: '子条件未填写或两边类型不一致'
        }
    }

    var illegalNumInput;
    _.each(data.output.cond.children, (condItem) => {
        illegalNumInput = _.find(condItem.children, (child) => {
            if (Operator.isNumber(child.leftExpression.columnType) && (child.opr == 'between' || child.opr == 'notBetween')) {
                if (child.value.length != 2) {
                    return true;
                }
                if (Number(child.value[1]) < Number(child.value[0]) || isNaN(child.value[1]) || isNaN(child.value[0])) {
                    return true;
                }
            }
        })
    });

    if (illegalNumInput) {
        return {
            message: illegalNumInput.leftExpression.displayName + window.i18n.t("warning.input-range-is-illegal")
        }
    }

    var outputColumnDescList = _.filter(data.output.outputColumnDescList, function(item) {
        return item.columnName;
    });
    if (_.isEmpty(outputColumnDescList)) {
        return {
            message: window.i18n.t("warning.no-output-fields-are-selected")
        }
    }
    var duplicateHint = getDuplicateHint(outputColumnDescList);
    if (duplicateHint) {
        return {
            message: '存在重复的字段名:' + duplicateHint
        }
    }

    return {
        detail: _.extend({}, {cond: cond, isDelDuplicate: data.output.isDelDuplicate}, {
            srcDataTypes: _.map(data.inputIds, id => {
                return { inputNode: id }
            })
        }, { outputColumnDescList: outputColumnDescList })
    }
}

export function checkInputData(inputData) {
    var size = _.size(inputData.input);
    if (inputData.output) {
        var output = JSON.stringify(inputData.output);
        if (size > 1) {
            if (output.indexOf('t1.') == -1 && output.indexOf('t2.') == -1) {
                inputData.output = null;
            }
        } else if (size == 1) {
            if (output.indexOf('t1.') != -1 || output.indexOf('t2.') != -1) {
                inputData.output = null;
            }
        }
    }
    return inputData;
}
