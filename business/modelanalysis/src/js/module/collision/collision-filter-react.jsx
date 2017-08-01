var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');
// require('bootstrap-multiselect');
var conditionModule = require('./collision-filter-condition');
var oprMap = conditionModule.oprMap;
var FilterCondition = conditionModule.FilterCondition;
var Notify = require('nova-notify');
var MultiSelect = require('widget/multiselect');
require("./collision-filter-react.less");
var Q = require('q');
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
        // if (data.selectedData.length == 1) {
        //     Notify.show({
        //         title: '过滤至少需要一个条件',
        //         type: 'warning'
        //     })
        //     return;
        // }
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
        var title1 = onAdvancedMode ? '高级模式' : '简单模式';
        var title2 = onAdvancedMode ? '简单模式' : '高级模式';
        var conditionHandle = this.conditionHandle;
        var deleteGroupHandle = this.deleteGroupHandle;
        var onDeleteMode = this.state.onDeleteMode;
        var btns = (<div className="col-md-5 pn text-right"><div className="btn-group">
                        <a className="btn btn-primary btn-sm" onClick={this.addGroupHandle}><span>添加</span></a>
                        <a className="btn btn-danger btn-sm" onClick={this.toggleDeleteMode}><span>删除</span></a>
                        </div></div>)
        if(onDeleteMode) {
            btns = (<div className="col-md-5 pn text-right"><div className="btn-group">
                        <a className="btn btn-default btn-sm" onClick={this.toggleDeleteMode}><span>完成</span></a>
                        </div></div>)
        }
        return (
            <div>
                <div id="advancedMode" style={onAdvancedMode ? {} : {display: "none"}}>
                    <div id="whereCondition">
                        <label>where条件:</label>
                        <textarea className="form-control" cols="37" rows="6" value={textareaValue} onChange={this.professorConditionCallback}></textarea>
                    </div>
                    <div id="collapseDetail" className="mt10">
                        <label className="text-right" style={{width: '100%'}}>
                            <a data-toggle="collapse" href="#action-panel" aria-expanded="false" aria-controls="action-panel"
                               style={{textDecoration: 'none'}} className="collapsed">
                                字段详细
                            </a>
                        </label>

                        <div id="action-panel" className="collapse">
                            <table className="table mt10">
                                <thead>
                                <tr>
                                    <th className="text-nowrap"><label>显示名</label></th>
                                    <th className="text-nowrap"><label>物理名</label></th>
                                    <th className="text-nowrap"><label>字段类型</label></th>
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
                                    label: '或',
                                    value: 'or',
                                    selected: data.logicOperator === 'or'
                                },{
                                    label: '与',
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
            // myopr = 'between';
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
    // console.log(JSON.parse(JSON.stringify(inputData)));
    // inputData = checkInputData(inputData);


    changeData(inputData,function(returnData){//转换结构
        inputData = returnData;
        // console.log("get");
        data.input = inputData.input;
        data.inputIds = inputData.inputIds;
        // data.output = inputData.output;
        data.output = null;
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
        if (inputData.cond) {
            data.selectedData = inputData.cond.children;
            if (_.isEmpty(data.selectedData)) {
                data = addEmptyGroup(data);
            }
        } else {
            data = addEmptyGroup(data);
        }
        ReactDOM.render(<RecordFilter inputData={data.input[0].outputColumnDescList} selectedFields1={data.selectedFields1}
                                          selectedFields2={data.selectedFields2} selectedData={data.selectedData}
                                          selectedFields={data.outputSelectedFields} />, container);
    });
};

//转换数据格式
 function changeData(inputData,callback){
    let data = new Object();
    //处理inputId
    data.inputIds = [];
    data.inputIds.push(inputData.key);
    //处理output
    if(inputData.cond){
        data.cond = inputData.cond;
    }
    //处理input
    data.input = [];
    let input = new Object();
    _getColumnDef(inputData).then(function(column){
        if(column == ""){

        }else{
            input.outputColumnDescList = column;
            data.input.push(input);
            // console.log('%O',data.input[0].outputColumnDescList);
            callback(data);
        }
    });
 }

//从后台获得数据
function _getColumnDef(inputData) {
    var defer = Q.defer();
    $.getJSON('/modelanalysis/modeling/getdatatypecoldef', {
                    centercode: inputData.centerCode,
                    zoneid: inputData.zoneId,
                    typeid: inputData.typeId,
                    iswithfavor: 0
                }, function (res) {
                    if (res.code == 0) {
                       defer.resolve(res.data.outputColumnDescList);
                    } else {
                        defer.resolve("");
                        console.error("DescList err");
                    }
                });
    return defer.promise;
}

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
            taskDetail.isEmpty = 1;
            // return {
            //     message: '简单模式需要设置至少一个条件'
            // };
        }
    }
    // if (data.onAdvancedMode && !taskDetail.professorCondition) {
    //     return {
    //         message: '高级模式未设置条件'
    //     };
    // }
    // if (_.isEmpty(data.outputSelectedFields)) {
    //     return {
    //         message: '未选择输出字段'
    //     };
    // }

    // taskDetail.outputColumnDescList = data.outputSelectedFields;
    return {
        detail: taskDetail
    };
};

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
                            message = field.displayName + window.i18n.t("input-format-wrong");
                            return true;
                        }
                        if (Number(item.value[1]) < Number(item.value[0]) || isNaN(item.value[1]) || isNaN(item.value[0])) {
                            message = field.displayName + window.i18n.t("input-range-is-illegal");
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
