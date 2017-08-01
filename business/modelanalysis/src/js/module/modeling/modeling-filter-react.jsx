var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');
// require('bootstrap-multiselect');
var conditionModule = require('./modeling-filter-condition');
var oprMap = conditionModule.oprMap;
var FilterCondition = conditionModule.FilterCondition;
var OutputFields = require('./modeling-output-fields');
var Notify = require('nova-notify');
var MultiSelect = require('widget/multiselect');
var Provider = require('widget/i18n-provider');
require("./modeling-filter-react.less");
var Operator = require('widget/operator');

var data = {
    input: [],
    inputIds: [],
    output: {},
    selectedFields1: [],
    selectedFields2: [],
    selectedFields4: [],
    selectedData: [],
    onAdvancedMode: false,
    professorCondition: '',
    outputSelectedFields: [],
    logicOperator: 'and'
};

var RecordFilter = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    getInitialState: function() {
        return {
            onAdvancedMode: data.onAdvancedMode,
            selectedData: data.selectedData,
            onDeleteMode: false
        };
    },
    checkoutBenHandle: function() {
        data.onAdvancedMode = !data.onAdvancedMode;
        this.setState({
            onAdvancedMode: data.onAdvancedMode
        });
    },
    selectChangedHandle: function(outputSelectedFields) {
        data.outputSelectedFields = outputSelectedFields;
    },
    conditionHandle: function(index, selectedData, logicOperator) {
        data.selectedData[index].children = selectedData;
        data.selectedData[index].logicOperator = logicOperator;
    },
    professorConditionCallback: function(e) {
        data.professorCondition = e.target.value;
        this.setState({
            professorCondition: data.professorCondition
        });
    },
    addGroupHandle: function(e) {
        data = addEmptyGroup(data);
        this.setState({
            selectedData: data.selectedData
        });
    },
    deleteGroupHandle: function(index) {
        var {i18n} = this.context;
        if (data.selectedData.length == 1) {
            Notify.show({
                title: i18n.t("warning.leave-at-least-one-condition"),
                type: 'warning'
            })
            return;
        }
        data.selectedData.splice(index, 1);
        this.setState({
            selectedData: data.selectedData
        })

    },
    onGroupChecked: function(index, checked) {
        if (data.selectedData[index]) {
            data.selectedData[index].checked = checked;
            this.setState({ selectedData: data.selectedData });
        }
    },
    onUniqChecked: function(e) {
        data.isDelDuplicate = e.target.checked ? 1 : 0;
        this.setState({ selectedData: data.selectedData });
    },
    logicOperatorCallback: function(identity, option, checked, select) {
        data.logicOperator = option.val();
        this.setState({ selectedData: data.selectedData });
    },
    toggleDeleteMode: function() {
        var onDeleteMode = !this.state.onDeleteMode;
        this.setState({onDeleteMode: onDeleteMode});
    },
    render: function() {
        var checkoutBenHandle = this.checkoutBenHandle;
        var selectChangedHandle = this.selectChangedHandle;
        var inputData = this.props.inputData;
        var textareaValue = data.professorCondition;
        var selectedFields = data.outputSelectedFields;
        var isDelDuplicate = data.isDelDuplicate == 1;
        var onAdvancedMode = data.onAdvancedMode;
        var title1 = onAdvancedMode ? i18n.t("advanced-mode") : i18n.t("simple-mode");
        var title2 = onAdvancedMode ? i18n.t("simple-mode") : i18n.t("advanced-mode");
        var conditionHandle = this.conditionHandle;
        var deleteGroupHandle = this.deleteGroupHandle;
        var onDeleteMode = this.state.onDeleteMode;
        var btns = (<div className="col-md-5 pn text-right"><div className="btn-group">
                        <a className="btn btn-primary btn-sm" onClick={this.addGroupHandle}><span>{i18n.t("add-btn")}</span></a>
                        <a className="btn btn-danger btn-sm" onClick={this.toggleDeleteMode}><span>{i18n.t("delete-btn")}</span></a>
                        </div></div>)
        if(onDeleteMode) {
            btns = (<div className="col-md-5 pn text-right"><div className="btn-group">
                        <a className="btn btn-default btn-sm" onClick={this.toggleDeleteMode}><span>{i18n.t("complete-btn")}</span></a>
                        </div></div>)
        }
        return (
            <div>
                <div className="mt10 mb10">
                    <label style={{fontSize: "18px", fontWeight: 'lighter'}}>{title1}</label>
                    <button type="button" onClick={checkoutBenHandle}
                            className="btn btn-default btn-sm pull-right">{title2}</button>
                </div>
                <div id="advancedMode" style={onAdvancedMode ? {} : {display: "none"}}>
                    <div id="whereCondition">
                        <label>{i18n.t("filter-react.where-condition")}</label>
                        <textarea className="form-control" cols="37" rows="6" value={textareaValue} onChange={this.professorConditionCallback}></textarea>
                    </div>
                    <div id="collapseDetail" className="mt10">
                        <label className="text-right" style={{width: '100%'}}>
                            <a data-toggle="collapse" href="#action-panel" aria-expanded="false" aria-controls="action-panel"
                               style={{textDecoration: 'none'}} className="collapsed">
                                {i18n.t("filter-react.field-detail")}
                            </a>
                        </label>

                        <div id="action-panel" className="collapse">
                            <table className="table mt10">
                                <thead>
                                <tr>
                                    <th className="text-nowrap"><label>{i18n.t("filter-react.show-name")}</label></th>
                                    <th className="text-nowrap"><label>{i18n.t("filter-react.physical-name")}</label></th>
                                    <th className="text-nowrap"><label>{i18n.t("filter-react.field-type")}</label></th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    _.map(inputData, function (tableInfo, index) {
                                        return (
                                            <tr key={index}>
                                                <td className="p6" style={{maxWidth: '100px'}}>
                                                    <label className="text-ellipsis mbn" style={{fontWeight: 'lighter'}}
                                                           title={tableInfo.displayName}>{tableInfo.displayName}</label>
                                                </td>
                                                <td className="p6" style={{maxWidth: '160px'}}>
                                                    <label className="text-ellipsis" style={{fontWeight: 'lighter'}}
                                                           title={tableInfo.aliasName}>{tableInfo.aliasName}</label>
                                                </td>
                                                <td className="p6" style={{maxWidth: '75px'}}>
                                                    <label className="text-ellipsis" style={{fontWeight: 'lighter'}}
                                                           title={tableInfo.columnType}>{tableInfo.columnType}</label>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <table id="simpleMode" className="table form-horizontal query-fields" style={onAdvancedMode ? {display: "none"} : {}}>
                    <tbody>
                        <tr key={1}><td style={{padding: "10px 0"}}>
                        <div className="col-md-7 pn group-opr-select">
                        <MultiSelect
                            config={{buttonClass: 'multiselect dropdown-toggle btn btn-info btn-sm mnw50 fs13',buttonWidth: '60px'}}
                            updateData={true}
                            onChange={this.logicOperatorCallback} 
                            data={[{
                                    label: i18n.t("or"),
                                    value: 'or',
                                    selected: data.logicOperator === 'or'
                                },{
                                    label: i18n.t("and"),
                                    value: 'and',
                                    selected: data.logicOperator === 'and'
                                }]}/>
                        </div>
                        {btns}
                        </td></tr>
                    {
                        _.map(data.selectedData, function (info, index) {
                            return (
                                <tr key={index + 2}><td className="pn" style={info.checked ? {backgroundColor: '#eeeeee'} : {}}  data-index={index}>
                                <FilterCondition onChange={conditionHandle} deleteGroupHandle={deleteGroupHandle} outputColumnDescList={inputData} cond={info} index={index} canDelete={onDeleteMode}/>
                                </td></tr>
                            )
                        })
                    }
                    </tbody>
                </table>
                <div id="outputFields" >
                    <div className="row mt10 mb10">
                        <label className="col-md-4" style={{fontSize: "18px", fontWeight: 'lighter'}}>{i18n.t("filter-react.output-field")}</label>
                        <div className="col-md-8 text-right" style={{paddingTop: '2px'}}>
                        <input type="checkbox" checked={isDelDuplicate} onChange={this.onUniqChecked} /><span className="ml5 fs13 fw600">{i18n.t("filter-react.is-del-duplicate")}</span>
                        </div>
                    </div>
                    <OutputFields inputFields={inputData} selectedFields={selectedFields}
                                  onChange={selectChangedHandle}/>
                </div>
            </div>
        )
    }
});

function isNumber(data) {
    return _.find(['int', 'bigint', 'double', 'timestamp', 'decimal'], function(type) {
        return type == data;
    });
}

function addEmptyGroup(data) {
    var myopr = 'equal';
    if (data.input[0].outputColumnDescList[0].codeTag == 1) {
        myopr = 'in';
    } else {
        if (data.input[0].outputColumnDescList[0].columnType == 'string') {
            myopr = data.selectedFields1[0].key;
        } else if (isNumber(data.input[0].outputColumnDescList[0].columnType)) {
            myopr = data.selectedFields2[0].key;
        } else {
            myopr = data.selectedFields4[0].key;
        }
    }
    data.selectedData.push({
        logicOperator: 'and',
        composite: true,
        children: [{
            column: data.input[0].outputColumnDescList[0].aliasName,
            opr: myopr,
            value: []
        }]
    });
    return data;
}

module.exports.render = function(container, inputData) {
    inputData = checkInputData(inputData);

    data.input = inputData.input;
    data.inputIds = inputData.inputIds;
    data.output = inputData.output;
    data.selectedFields1 = oprMap.stringOpr;
    data.selectedFields2 = oprMap.numberOpr;
    data.selectedFields4 = oprMap.dateTimeOpr;
    data.selectedData = [];
    data.professorCondition = '';
    data.onAdvancedMode = false;
    data.isDelDuplicate = 0;


    data.outputSelectedFields = _.map(data.input[0].outputColumnDescList, function(item) {
        return _.extend({}, item, { columnName: item.aliasName, aliasName: '' });
    });
    if (data.output) {
        data.selectedData = data.output.cond?data.output.cond.children:[];
        data.isDelDuplicate = data.output.isDelDuplicate;
        if (!_.isEmpty(data.output.outputColumnDescList)) {
            data.outputSelectedFields = data.output.outputColumnDescList;
        }
        if (data.output.professorCondition) {
            data.professorCondition = data.output.professorCondition;
            data.onAdvancedMode = true;
        }
        if (_.isEmpty(data.selectedData)) {
            data = addEmptyGroup(data);
        }
    } else {
        data = addEmptyGroup(data);
    }

    ReactDOM.render(<Provider.default><RecordFilter inputData={data.input[0].outputColumnDescList} selectedFields1={data.selectedFields1}
                                      selectedFields2={data.selectedFields2} selectedData={data.selectedData}
                                      selectedFields={data.outputSelectedFields} /></Provider.default>, container);
};

function checkInputData(inputData) {
    if (inputData.output) {
        if (!_.isEmpty(inputData.inputIds)) {
            inputData.output.inputNode = inputData.inputIds[0];
        }
        var temp = {};
        _.each(inputData.input[0].outputColumnDescList, function(item) {
            temp[item.aliasName] = item;
        });
        //筛选掉不存在的字段
        inputData.output.outputColumnDescList = _.filter(inputData.output.outputColumnDescList, function(item) {
            return item.columnName && temp[item.columnName];
        });
        if (inputData.output.cond) {
            inputData.output.cond.children = _.filter(inputData.output.cond.children, function(item) {
                if (item.composite) {
                    item.children = _.filter(item.children, function(childItem) {
                        return childItem && temp[childItem.column];
                    })
                    return !_.isEmpty(item.children);
                } else {
                    return item.column && temp[item.column];
                }
            })
        }
    }
    return inputData;
}

module.exports.checkInputData = checkInputData;

module.exports.constructTaskDetail = function() {
    var children = {}; //totalSelectedData;
    var tags;
    var professorUse = 0;
    var professorCondition = "";
    if (data.onAdvancedMode) {
        professorUse = 1;
        professorCondition = data.professorCondition;
    }

    var taskDetail = constructTaskDetail(data.selectedData, data.logicOperator);
    if (taskDetail.message) {
        return {
            message: taskDetail.message
        };
    }
    taskDetail.professorUse = professorUse;
    taskDetail.professorCondition = professorCondition;
    taskDetail.inputNode = data.inputIds[0];
    taskDetail.isDelDuplicate = data.isDelDuplicate;
    if (!data.onAdvancedMode) {
        var isEmpty = !_.find(taskDetail.cond.children, function(item) {
            return item && !_.isEmpty(item.children);
        });
        if (isEmpty) {
            return {
                message: window.i18n.t("warning.simple-mode-need-at-least-one-condition")
            };
        }
    }
    if (data.onAdvancedMode && !taskDetail.professorCondition) {
        return {
            message: window.i18n.t("warning.advanced-mode-need-condition")
        };
    }
    if (_.isEmpty(data.outputSelectedFields)) {
        return {
            message: window.i18n.t("warning.no-output-fields-are-selected")
        };
    }

    taskDetail.outputColumnDescList = data.outputSelectedFields;
    return {
        detail: taskDetail
    };
};

// function getSelectedData(data) {
//     var module = $('#dynamic-cond-panel #simpleMode .module');
//     _.each(module, function (item, index) {
//         _.each($(item).children('#conditionModule').children('div'), function(sitem, sindex) {
//             if ($(sitem).hasClass('form-group')) {
//                 // children[index][0] = $($(item).children('div')[1]).children('div').children('button').children('span').text();
//                 // data.selectedData[index][0] = $($(item).children('#conditionModule').children('div')[1]).children('div').children('ul').children('li.active').children('a').children('label').children('input').val();
//                 var selection = $($(sitem).children('div')[2]).children('div');
//                 if (selection.hasClass('codeTag1')) {
//                     // data.selectedData[index][1] = 'in';
//                     data.selectedData[index].children[sindex].value = selection.find('input.select2-search__field').val();
//                 } else {
//                     var tags;
//                     if (selection.hasClass('string')) {
//                         // data.selectedData[index][1] = $(selection.children('div')[0]).children('div').children('button').children('span').text();
//                         tags = $(selection.children('div')[1]).children('div').children('span');
//                         data.selectedData[index].children[sindex].value = [];
//                         _.each(tags, function (span) {
//                             data.selectedData[index].children[sindex].value.push($(span).text());
//                         });
//                     } else if (selection.hasClass('decimal')) {
//                         // data.selectedData[index][1] = $(selection.children('div')[0]).children('div').children('button').children('span').text();
//                         tags = $(selection.children('div')[1]).children('div').children('span');
//                         data.selectedData[index].children[sindex].value = [];
//                         _.each(tags, function (span) {
//                             data.selectedData[index].children[sindex].value.push($(span).text());
//                         });
//                     } else if (selection.hasClass('date') || selection.hasClass('datetime')) {
//                         // data.selectedData[index][1] = 'between';
//                         data.selectedData[index].children[sindex].value = selection.children('div').children('input').val();
//                     }
//                 }
//             }
//         });
//     });
//     return data;
// }

function constructTaskDetail(selectedData, logicOperator) {
    var taskDetail = {};
    var cond = {};
    cond.composite = true;
    cond.logicOperator = logicOperator || "and";

    var mchildren = [];
    var message = "";
    _.each(selectedData, function(mitem) {
        var children = [];
        _.each(mitem.children, function(item) {
            _.find(data.input[0].outputColumnDescList, function(field) {
                if (item.column == field.aliasName) {
                    if (Operator.isNumber(field.columnType) && (item.opr == 'between' || item.opr == 'notBetween')) {
                        if (item.value.length != 2) {
                            message = field.displayName + window.i18n.t("warning.input-format-wrong");
                            return true;
                        }
                        if (Number(item.value[1]) < Number(item.value[0]) || isNaN(item.value[1]) || isNaN(item.value[0])) {
                            message = field.displayName + window.i18n.t("warning.input-range-is-illegal");
                            return true;
                        }
                    }
                    var condInfo;
                    if (item.opr == "isNull" || item.opr == "isNotNull") {
                        condInfo = {
                            composite: false,
                            column: field.aliasName,
                            opr: item.opr
                        };
                        children.push(condInfo);
                    } else {
                        if (!_.isEmpty(item.value)) {
                            condInfo = {
                                composite: false,
                                column: field.aliasName,
                                opr: item.opr,
                                value: item.value
                            };
                            children.push(condInfo);
                        }
                    }
                    return true;
                }
            });
        });
        mchildren.push({
            composite: !_.isEmpty(children),
            logicOperator: mitem.logicOperator,
            children: children
        });
    });
    cond.children = mchildren;
    taskDetail.cond = cond;
    if (message == "") {
        return taskDetail;
    } else {
        return {message: message};
    }
}
