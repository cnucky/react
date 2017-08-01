var React = require('react');
var _ = require('underscore');
var Notify = require('nova-notify');
var MultiSelect = require('widget/multiselect');
import ValueInput from 'widget/value-input';
import DateTimePicker from 'widget/datetime-picker';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import SingleDateTimePicker from 'widget/single-datetime-picker';
import Operator from 'widget/operator';

var oprMap = Operator.MODELING_FILTER_OPR_MAP;

function createInitialState(props) {
    var data = {
        index: 0,
        inputData: [],
        selectedFields1: [],
        selectedFields2: [],
        selectedFields3: [],
        selectedFields4: [],
        selectedData: [],
        logicOperator: 'or'
    };
    data.index = props.index;
    data.selectedFields1 = oprMap.stringOpr;
    data.selectedFields2 = oprMap.numberOpr;
    data.selectedFields3 = oprMap.codeTagOpr;
    data.selectedFields4 = oprMap.dateTimeOpr;
    if (props.outputColumnDescList) {
        data.inputData = props.outputColumnDescList;
    } else {
        Notify.show({
            title: 'outputColumnDescList数据传输有误',
            type: 'warning'
        });
    }
    if (props.cond) {
        data.selectedData = props.cond.children;
        data.logicOperator = props.cond.logicOperator || 'or';
        data.checked = props.cond.checked || false;
    } else {
        if (data.inputData[0].codeTag == 1) {
            data.selectedData.push({
                column: data.inputData[0].aliasName,
                opr: data.selectedFields3[0].key,
                value: []
            });
        } else {
            if (data.inputData[0].columnType == "string") {
                data.selectedData.push({
                    column: data.inputData[0].aliasName,
                    opr: data.selectedFields1[0].key,
                    value: []
                });
            } else if (Operator.isNumber(data.inputData[0].columnType)) {
                data.selectedData.push({
                    column: data.inputData[0].aliasName,
                    opr: data.selectedFields2[0].key,
                    value: []
                });
            } else {
                data.selectedData.push({
                    column: data.inputData[0].aliasName,
                    opr: data.selectedFields4[0].key,
                    value: []
                });
            }
        }
    }
    return data;
}

var FilterCondition = React.createClass({
    getInitialState: function() {
        var data = createInitialState(this.props);
        return {
            data: data
        }
    },
    componentWillReceiveProps: function(nextProps) {
        var data = createInitialState(nextProps);
        this.setState({ data: data });
    },
    deleteBtnClick: function(e) {
        var data = this.state.data;
        if (data.selectedData.length > 1) {
            data.selectedData.splice($(e.currentTarget).attr('data-index'), 1);
            this.update(data);
        }
    },
    handleSelectField: function(identity, option, checked, select) {
        var data = this.state.data;
        if (identity.leftOrRight == 0) {
            var preColumn = _.find(data.inputData, function(item) {
                return item.aliasName == data.selectedData[identity.index].column;
            })
            data.selectedData[identity.index].column = option.val();
            _.map(data.inputData, function(item) {
                if (item.aliasName == option.val()) { //option[0].title) { //option.val()) {
                    if (item.codeTag == 1) {
                        if (preColumn.codeTag != 1) {
                            data.selectedData[identity.index].opr = data.selectedFields3[0].key;
                        }
                        data.selectedData[identity.index].value = [];
                    } else {
                        if (preColumn.codeTag == 1 || preColumn.columnType != item.columnType) {
                            if (item.columnType == "string") {
                                data.selectedData[identity.index].opr = data.selectedFields1[0].key;
                            } else if (Operator.isNumber(item.columnType)) {
                                data.selectedData[identity.index].opr = data.selectedFields2[0].key;
                            } else if (Operator.isTime(item.columnType)) {
                                data.selectedData[identity.index].opr = data.selectedFields4[0].key;
                            }
                        }
                        data.selectedData[identity.index].value = [];
                    }
                }
            });
            this.update(data);
        } else if (identity.leftOrRight == 1) {
            var preOpr = data.selectedData[identity.index].opr;
            data.selectedData[identity.index].opr = option.val();
            var column = _.find(data.inputData, function(item) {
                return item.aliasName == data.selectedData[identity.index].column;
            })
            if (column.columnType != "date" && column.columnType != "datetime" && column.columnType != "timestamp") {
                if (Operator.isOprMultiple(preOpr) != Operator.isOprMultiple(option.val())) {
                    data.selectedData[identity.index].value = [];
                }  
            }
            this.update(data);
        }
    },
    update: function(data, state) {
        this.props.onChange(data.index, data.selectedData, data.logicOperator);
        var out = { data: data };
        if (state) {
            out = _.extend(state, out);
        }
        this.setState(out);
    },
    addBtnClick: function(e) {
        var data = this.state.data;
        var selectData = [];
        _.each(this.props.outputColumnDescList, function(item) {
            var isExist = false;
            // _.each(totalSelectedData, function (selection) {
            _.each(data.selectedData, function(selection) {
                if (item.aliasName == selection.column) {
                    isExist = true;
                }
            });
            if (!isExist) {
                selectData.push(item);
            }
        });
        var toadd = selectData.length > 0 ? selectData[0] : this.props.outputColumnDescList[0];
        if (toadd.codeTag == 1) {

            data.selectedData.push({
                column: toadd.aliasName,
                opr: data.selectedFields3[0].key,
                value: ''
            });
        } else {
            if (toadd.columnType == "string") {
                data.selectedData.push({
                    column: toadd.aliasName,
                    opr: data.selectedFields1[0].key,
                    value: []
                });
            } else if (Operator.isNumber(toadd.columnType)) {

                data.selectedData.push({
                    column: toadd.aliasName,
                    opr: data.selectedFields2[0].key,
                    value: []
                });
            } else {
                data.selectedData.push({
                    column: toadd.aliasName,
                    opr: data.selectedFields4[0].key,
                    value: []
                });
            }
        }
        this.update(data);
    },
    valueInputCallback: function(value, index, e) {
        var data = this.state.data;
        data.selectedData[index].value = value;
        this.update(data);
    },
    toggleDeleteBtn: function(e) {
        var onDeleteMode = !this.state.onDeleteMode;
        this.update(this.state.data, { onDeleteMode: onDeleteMode })
    },
    logicOperatorCallback: function(e) {
        var data = this.state.data;
        data.logicOperator = $(e.currentTarget).val();
        this.update(data);
    },
    codeTagInputCallback(value, index) {
        var data = this.state.data;
        data.selectedData[index].value = value;
        this.props.onChange(data.index, data.selectedData, data.logicOperator);
        this.update(data);
    },
    getRight: function(info, index) {
        var data = this.state.data;
        var handleSelectField = this.handleSelectField;
        var item = _.find(data.inputData, function(item) {
            return item.aliasName == data.selectedData[index].column;
        });
        if (item.codeTag == 0) {
            if (item.columnType == "string") {
                return (
                    <div className="string">
                        <div className="col-md-5 pn">
                            <MultiSelect id="string-opr"
                                config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50',buttonWidth: '100%'}}
                                identity={{index: index, leftOrRight: 1}}
                                updateData={true}
                                onChange={handleSelectField}
                                data={
                                    _.map(data.selectedFields1, function(selectedItem) {
                                        return {
                                            label: selectedItem.name,
                                            title: selectedItem.key,
                                            value: selectedItem.key,
                                            type: 'string',
                                            selected: info.opr === selectedItem.key
                                        }
                                    })
                            }/>
                        </div>
                        <div className="col-md-7 pn">
                            <ValueInput type='text' data-index={index} className="form-control ph5"
                                multiple={Operator.isOprMultiple(info.opr)} value={data.selectedData[index].value} style={{height: '40px'}}
                                placeholder={Operator.isOprMultiple(info.opr)?"以逗号分隔多个值":""}
                                onChange={(value, e) => this.valueInputCallback(value, index, e)}/>
                        </div>
                    </div>
                )
            } else if (Operator.isNumber(item.columnType)) {
                return (
                    <div className="decimal">
                        <div className="col-md-5 pn">
                            <MultiSelect id="int-opr"
                                config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50',buttonWidth: '100%'}}
                                identity={{index: index, leftOrRight: 1}}
                                updateData={true}
                                onChange={handleSelectField}
                                data={
                                    _.map(data.selectedFields2, function(selectedItem) {
                                        return {
                                            label: selectedItem.name,
                                            title: selectedItem.key,
                                            value: selectedItem.key,
                                            type: item.columnType,
                                            selected: info.opr === selectedItem.key
                                        }
                                    })
                            }/>
                        </div>
                        <div className="col-md-7 pn">
                            <ValueInput type={Operator.isOprMultiple(info.opr)?'text':'number'} data-index={index} className="form-control ph5"
                                 multiple={Operator.isOprMultiple(info.opr)} value={data.selectedData[index].value} style={{height: '40px'}}
                                 placeholder={Operator.isOprMultiple(info.opr)?"以逗号分隔多个值":""}
                                 onChange={(value, e) => this.valueInputCallback(value, index, e)}/>
                        </div>
                    </div>
                )
            } else if (item.columnType == "date") {
                if (_.contains(["notGreaterThan", "notLessThan", "equal", "notEqual"], this.state.data.selectedData[index].opr)){
                    var datetimePicker = (<SingleDateTimePicker type={item.columnType} value={_.isEmpty(data.selectedData[index].value)?'':data.selectedData[index].value}
                                needMask={true} needDefault={true} onChange={(value) => this.valueInputCallback(_.isEmpty(value)?[]:[value], index)} /> );
                } else if (_.contains(["isNull", "isNotNull"], this.state.data.selectedData[index].opr)){
                    var datetimePicker = (<ValueInput type='text' className="form-control ph5" style={{height: '40px'}}/>);
                } else {
                    var datetimePicker = (<DateTimePicker type={item.columnType} value={_.isEmpty(data.selectedData[index].value)?'':data.selectedData[index].value.join('~')}
                            needMask={true} onChange={(value) => this.valueInputCallback(_.isEmpty(value)?[]:value.split('~'), index)} />);
                }
                return (
                    <div className="date">
                        <div className="col-md-4 pn">
                            <MultiSelect id="date-opr"
                                config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50',buttonWidth: '100%'}}
                                identity={{index: index, leftOrRight: 1}}
                                updateData={true}
                                onChange={handleSelectField}
                                data={
                                    _.map(data.selectedFields4, function(selectedItem) {
                                        return {
                                            label: selectedItem.name,
                                            title: selectedItem.key,
                                            value: selectedItem.key,
                                            type: item.columnType,
                                            selected: info.opr === selectedItem.key
                                        }
                                    })
                            }/>
                        </div>
                        <div className="col-md-8 pn">
                            {datetimePicker}
                        </div> 
                    </div>
                )
            } else if (item.columnType == "datetime" || item.columnType == "timestamp") {
                if (_.contains(["notGreaterThan", "notLessThan", "equal", "notEqual"], this.state.data.selectedData[index].opr)){
                    var datetimePicker = (<SingleDateTimePicker type="datetime" value={_.isEmpty(data.selectedData[index].value)?'':data.selectedData[index].value}
                                needMask={true} needDefault={true} onChange={(value) => this.valueInputCallback(_.isEmpty(value)?[]:[value], index)} /> );
                } else if (_.contains(["isNull", "isNotNull"], this.state.data.selectedData[index].opr)){
                    var datetimePicker = (<ValueInput type='text' className="form-control ph5" style={{height: '40px'}}/>);
                } else {
                    var datetimePicker = (<DateTimePicker type="datetime" value={_.isEmpty(data.selectedData[index].value)?'':data.selectedData[index].value.join('~')}
                            needMask={true} onChange={(value) => this.valueInputCallback(_.isEmpty(value)?[]:value.split('~'), index)} />);
                }
                return (
                    <div className="date">
                        <div className="col-md-4 pn">
                            <MultiSelect id="date-opr"
                                config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50',buttonWidth: '100%'}}
                                identity={{index: index, leftOrRight: 1}}
                                updateData={true}
                                onChange={handleSelectField}
                                data={
                                    _.map(data.selectedFields4, function(selectedItem) {
                                        return {
                                            label: selectedItem.name,
                                            title: selectedItem.key,
                                            value: selectedItem.key,
                                            type: item.columnType,
                                            selected: info.opr === selectedItem.key
                                        }
                                    })
                            }/>
                        </div>
                        <div className="col-md-8 pn">
                            {datetimePicker}
                        </div>
                    </div>
                )
            }
        } else {
            return (
                <div className="codeTag1" style={{width: '100%', height: '40px'}}>
                    <div className="col-md-5 pn">
                        <MultiSelect id="int-opr"
                                     config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50',buttonWidth: '100%'}}
                                     identity={{index: index, leftOrRight: 1}}
                                     updateData={true}
                                     onChange={handleSelectField}
                                     data={
                                         _.map(data.selectedFields3, function(selectedItem) {
                                             return {
                                                 label: selectedItem.name,
                                                 title: selectedItem.key,
                                                 value: selectedItem.key,
                                                 type: item.columnType,
                                                 selected: info.opr === selectedItem.key
                                             }
                                         })
                                     }/>
                    </div>
                    <div className="col-md-7 pn" id={this.props.index + '-'+ index}>
                        <Select name="codeTag" className="valueInput" multi={true} value={data.selectedData[index].value} clearable={false}
                                placeholder="" cacheAsyncResults={false} noResultsText="没有匹配的结果" searchPromptText="输入进行搜索" searchingText="正在搜索中..."
                                asyncOptions={_.debounce((input, callback) => {
                                    if(typeof input === 'string' && !(input == "" && !_.isEmpty(data.selectedData[index].value))) {
                                        $.getJSON('/modelanalysis/modeling/getcodetable', {
                                            codetable: item.codeTable,
                                            codefield: item.codeField,
                                            codedisnamefield: item.codeDisNameField,
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
                                        var code =  _.isArray(input) && !_.isEmpty(input) ? input :data.selectedData[index].value;
                                        $.getJSON('/modelanalysis/modeling/getcodetablebycode', {
                                            codetable: item.codeTable,
                                            codefield: item.codeField,
                                            codedisnamefield: item.codeDisNameField,
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
                                                _.each(data.selectedData[index].value, function(id, index) {
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
                                }, 200)}
                                onChange={(newValue) => this.codeTagInputCallback(_.isEmpty(newValue) ? [] : newValue.split(','), index)}
                        />
                    </div>
                </div>
            )
        }
    },
    render: function() {
        var deleteBtnClick = this.deleteBtnClick;
        var handleSelectField = this.handleSelectField;
        var getRight = this.getRight;
        var data = this.state.data;
        var onDeleteMode = this.state.onDeleteMode;
        var canDelete = this.props.canDelete;
        var deleteGroupHandle = this.props.deleteGroupHandle;
        var btns;
        if (!onDeleteMode) {
            btns = (<div id="buttonModule">
                    <div className='text-right'>
                                            <button type="button" onClick={this.addBtnClick}
                                                    className="add-record btn btn-rounded btn-primary btn-xs">
                                                <i className="fa fa-plus fa-fw"></i>
                                            </button>
                                            <button type="button" onClick={this.toggleDeleteBtn}
                                                    className="delete-record btn btn-rounded btn-danger btn-xs">
                                                <i className="fa fa-minus fa-fw"></i>
                                            </button>
                                        </div>
                </div>)
        } else {
            btns = (<div id="buttonModule">
                    <div className='complete-delete text-right' id="filter-btn3" >
                                            <button type="button" onClick={this.toggleDeleteBtn}
                                                        className="btn btn-default btn-xs" style={{width: '60px'}}>完成
                                            </button>
                                        </div>
                </div>)
        }
        return (
            <div className="module filter-condition"  style={{padding: '10px 0px'}}>
                <div style={canDelete ? {'float': 'right', 'cursor': 'pointer'} : {display: 'none'}} onClick={() => deleteGroupHandle(this.state.data.index)}>
                    <span className="text-danger fs15 fa fa-trash-o p5"></span>
                </div>
                <form className="form-horizontal" role="form">
                <div className="form-group">
                                <label className="col-md-5 control-label">子条件关系</label>
                                <div className="col-md-5">
                                    <div className="bs-component">
                                        <label className="radio-inline mr10">
                                            <input type="radio"  name="conditionRadio" value="or" onChange={this.logicOperatorCallback} checked={data.logicOperator == 'or'}/>或
                                        </label>
                                        <label className="radio-inline mr10">
                                            <input type="radio"  name="conditionRadio" value="and" onChange={this.logicOperatorCallback} checked={data.logicOperator == 'and'}/>与
                                        </label>
                                    </div>
                                </div>
                          </div>
                          </form>
                <div id="conditionModule">
                {
                    _.map(data.selectedData, function (info, index) {
                                            return (
                                                <div style={{minWidth: '200px'}} className="form-group mb15">
                                                    <div className="col-md-1 pn deleteStyle" style={onDeleteMode?{}:{display: 'none'}}>
                                                        <button type="button" data-index={index} onClick={deleteBtnClick}
                                                                className="btn-delete-record btn btn-rounded btn-danger btn-xs pull-left mt10">
                                                            <i className="fa fa-minus"></i>
                                                        </button>
                                                    </div>
                                                    <div className="col-md-4 pn">
                                                        <MultiSelect style={{maxWidth: 200}} config={{buttonWidth: '100%', enableFiltering: true}}
                                                                     identity={{index: index, leftOrRight: 0}} updateData={true}
                                                                     onChange={handleSelectField} data={
                                                                            _.map(data.inputData, function(item) {
                                                                                return {
                                                                                    label: item.displayName,
                                                                                    title: item.aliasName,
                                                                                    value: item.aliasName,
                                                                                    selected: info.column === item.aliasName
                                                                                }
                                                                            })
                                                            }/>
                                                    </div>
                                                    <div className={onDeleteMode ? 'col-md-7 pn' : 'col-md-8 pn'}>
                                                        {
                                                            getRight(info, index)
                                                        }
                                                    </div>
                                                </div>
                                            )
                              })
                }
                </div>
                {btns}
            </div>
        )
    }
});

module.exports.FilterCondition = FilterCondition;
module.exports.oprMap = oprMap;

// function getSelectedData(data) {
//     var module = $($('#dynamic-cond-panel #simpleMode .module')[data.index]).children('#conditionModule').children('div');
//     _.each(module, function (item, index) {
//         if ($(item).hasClass('form-group')) {
//             var selection = $($(item).children('div')[2]).children('div');
//             if(data.selectedData[index]) {
//              if (selection.hasClass('codeTag1')) {
//                  data.selectedData[index].value = selection.find('input.select2-search__field').val();
//              } else {
//                  var tags;
//                  if (selection.hasClass('string')) {
//                          tags = $(selection.children('div')[1]).children('div').children('span');
//                          data.selectedData[index].value = [];
//                          _.each(tags, function (span) {
//                                  data.selectedData[index].value.push($(span).text());
//                          });
//                  } else if (selection.hasClass('decimal')) {
//                          tags = $(selection.children('div')[1]).children('div').children('span');
//                          data.selectedData[index].value = [];
//                          _.each(tags, function (span) {
//                                  data.selectedData[index].value.push($(span).text());
//                          });
//                  } else if (selection.hasClass('date') || selection.hasClass('datetime')) {
//                          data.selectedData[index].value = selection.children('div').children('input').val();
//                  }
//              }
//             }
//         }
//     });
//     // totalSelectedData = children;
//     return data;
// }
