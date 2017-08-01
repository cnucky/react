var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var _ = require('underscore');
var MultiSelect = require('widget/multiselect');
require('../../widget/collision-condition.less');
var OPERATIONS = require('./operations');
var Notify = require('nova-notify');

var inputData;
var taskType;
var semanticDef;
var fieldsData;
var selectedSematicId;

var TypeSelect = React.createClass({
    checkoutBenHandle: function() {
        this.props.onChange();
    },
    render:function(){
        var checkoutBenHandle = this.checkoutBenHandle;
        return (<div className = "modeDiv"><button type="button" onClick={checkoutBenHandle} className="btn btn-default btn-sm pull-right">切换到高级模式</button></div>)
    }
});

var CollisionSemantic = React.createClass({
    handleSelectSemantic: function(item, option, checked, select) {
        if (this.props.onChange && typeof this.props.onChange === 'function') {
            this.props.onChange(parseInt(option.val()));
        }
    },
    render: function() {
        var semantic = this.props.semantic;
        var semanticId = this.props.semanticId;
        return (<div className="form-group">
                    <label className="col-md-3 control-label">碰撞语义</label>
                    <div className="col-md-9">
                    {
                        <MultiSelect config={this.props.configSemantic} updateData={true} onChange={this.handleSelectSemantic}
                        data={_.map(semantic, function(item) {
                            return {
                                label: item.semanticName,
                                title: item.semanticName,
                                value: item.semanticId,
                                selected: item.semanticId == semanticId
                            }
                        })
                        }/>
                    }
                    </div>
                </div>)
    }
});


var CollisionFields = React.createClass({
    handleSelectField: function(item, option, checked, select) {
        item.selectedFields = item.selectedFields || [];
        if (checked) {
            item.selectedFields.push(option.val());
        } else {
            item.selectedFields.splice(_.indexOf(item.selectedFields, option.val()), 1);
        }
    },
    handleSelectFirst: function(item, option, checked, select) {
        var selectedKey = option.val();
        _.each(this.props.fieldsData, function(dataItem) {
            if (dataItem.key == selectedKey) {
                dataItem.index = -1;
            } else {
                dataItem.index = 0;
            }
        });
    },
    render: function() {
        if (!_.isEmpty(this.props.fieldsData)) {
            var addon;
            var handleSelectField = this.handleSelectField;

            if (this.props.taskType == OPERATIONS.DIFFERENCE) { //差集分析
                addon = (<div>
                <div className="form-group datasource-addon">
                    <label htmlFor="collision-field" className="col-md-3 control-label">其他</label>
                    <div className="col-md-9">
                    </div>
                </div>
                <div className="section datasource-addon">
                <div className="form-group">
                    <label className="col-md-3 field-label">首集合</label>
                    <div className="col-md-9">
                    <MultiSelect onChange={this.handleSelectFirst} data={
                        _.map(this.props.fieldsData, function(item) {
                            return {
                                label: item.caption,
                                title: item.caption,
                                value: item.key,
                                selected: item.index < 0
                            }
                        })
                    }/>
                    </div>
                </div>
                </div>
                </div>)
            }

            return (
                <div>
                    <div className="form-group datasource-fields">
                        <label htmlFor="collision-field" className="col-md-3 control-label">条件</label>
                        <div className="col-md-9">
                        </div>
                    </div>
                    <div className="section datasource-fields">
                    {
                        _.map(this.props.fieldsData, function(item, index){
                            return (
                            <div className="form-group" key={index}>
                            <div className="col-md-3">
                            <label className="field-label" style={{maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis'}} title={item.caption}>{item.caption}</label>
                            </div>
                            <div className="col-md-9">
                            <MultiSelect multiple="multiple" identity={item} updateData={true} onChange={handleSelectField}
                            config={{
                                maxHeight: 250,
                                enableFiltering: true,
                                enableClickableOptGroups: false,
                                nonSelectedText: "请选择",
                                nSelectedText: "个已选择",
                                allSelectedText: "全选",
                                numberDisplayed: 3
                            }}
                            data={
                                _.map(item.semantic, function(semantic) {
                                    var group = {
                                        label: semantic.semanticName
                                    };
                                    group.children = _.map(semantic.fieldList, function(field) {
                                        return {
                                            label: field.caption,
                                            title: field.caption,
                                            value: field.fieldName,
                                            selected: _.contains(item.selectedFields, field.fieldName)
                                        };
                                    });
                                    return group;
                                })
                            }/>
                            </div>
                            </div>)
                        })
                    }
                    </div>
                    {addon}
                </div>)
        }
        return (<div></div>);
    }
});


var CollisionCondition = React.createClass({
    getInitialState: function() {
        var semanticId = !this.props.semanticId ? selectedSematicId : undefined;
        this.updateFieldsData(semanticId);
        return {
            semanticId: selectedSematicId,
            fieldsData: this.props.fieldsData
        };
    },
    onSemanticChange: function(semanticId) {
        selectedSematicId = semanticId;
        this.updateFieldsData(semanticId);
        this.setState({
            semanticId: semanticId,
            fieldsData: this.props.fieldsData
        });
    },
    updateFieldsData: function(semanticId) {
        _.each(this.props.fieldsData, function(item) {
            var index = _.findIndex(item.semantic, function(semantic) {
                return semantic.semanticId == semanticId;
            });
            if (index >= 0) {
                var tmp = item.semantic[index];
                item.selectedFields = [];
                _.each(tmp.fieldList, function(field) {
                    item.selectedFields.push(field.fieldName);
                });
                item.semantic.splice(index, 1);
                item.semantic.unshift(tmp);
            }
        })
    },
    onModeChange:function(){
        this.props.onChange();
    },
    render: function() {
        return (
            <div className="form-horizontal">
            <TypeSelect onChange = {this.onModeChange}/>
            <CollisionSemantic semantic={this.props.semantic} onChange={this.onSemanticChange} semanticId={this.state.semanticId}/>
            <CollisionFields fieldsData={this.state.fieldsData} taskType={this.props.taskType}/>
            </div>)
    }
});

module.exports.render = function(container, _semanticDef, _taskType, _inputData,selectMode) {
    inputData = _inputData;
    taskType = _taskType;
    var srcDataTypes = inputData.output ? inputData.output.srcDataTypes : null;
    var _semanticId = inputData.output ? inputData.output.semanticId : null;

    var hasFirstItem = false;
    var _fieldsData = _.map(inputData.input, function(inputItem, index) {
        var srcData = srcDataTypes ? _.find(srcDataTypes, src => {
            return src.inputNode === inputItem.nodeId
        }) : null;

        if (srcData) {
            srcData.fieldList = _.filter(srcData.fieldList, function (field) {
                return _.find(inputItem.outputColumnDescList, function (column) {
                    return column.aliasName == field;
                })
            });
        }

        var semantics = {};
        _.each(inputItem.outputColumnDescList, function(item) {
            var semantic = semantics[item.codeUsage];
            if (!semantic) {
                semantics[item.codeUsage] = semantic = {
                    semanticId: item.codeUsage,
                    semanticName: item.codeUsage == 0 ? '其他' : item.semanticName,
                    fieldList: []
                };
            }
            semantic.fieldList.push({
                caption: item.displayName,
                fieldName: item.aliasName
            });
        })
        semantics = _.map(semantics, function(item) {
            return item;
        })
        semantics = _.sortBy(semantics,  function(item) {
            return - parseInt(item.semanticId);
        })
        return {
            key: inputItem.nodeId,
            caption: inputItem.title,
            semantic: semantics,
            selectedFields: srcData ? srcData.fieldList : null,
            index: srcData ? srcData.index : 0
        };
    });

    semanticDef = _semanticDef;

    var firstFields = _.find(_fieldsData, fields => {
           return fields.index === -1;
        });
    if (!firstFields) {
        _fieldsData[0].index = -1;
    }
    fieldsData = _fieldsData;
    if (_semanticId) {
        selectedSematicId = _semanticId;
    } else {
        selectedSematicId = semanticDef[0].semanticId;
    }
    var modeChange = function(){
        selectMode("low");
    }
    ReactDOM.render(<CollisionCondition onChange = {modeChange} semantic={semanticDef} semanticId={_semanticId} fieldsData={fieldsData} taskType={taskType}/>, container);
};

module.exports.constructTaskDetail = function() {
    var taskDetail = {
        srcDataTypes: [],
        outputColumnDescList: [],
        semanticId: selectedSematicId
    };
    var selectedSematic = _.find(semanticDef, function(item) {
        return item.semanticId == selectedSematicId;
    });
    var noPass = false;
    var checkedFields = [];
    _.each(fieldsData, function(item) {
        if(_.isEmpty(item.selectedFields)) {
            noPass = true;
        }else {
            _.each(item.selectedFields, function(field){
                var temp = _.find( _.find(inputData.input, function(input){
                    return input.nodeId == item.key;
                }).outputColumnDescList, function (output) {
                    return output.aliasName == field;
                });
                if (temp){
                    checkedFields.push(temp);
                }
            })
        }
        taskDetail.srcDataTypes.push({
            index: item.index || 0,
            inputNode: item.key,
            fieldList: item.selectedFields
        });
    });
    if(noPass) {
        return {message: '节点的条件未编辑完成,无法自动保存'};
    }
    for (var i=0; i< checkedFields.length-1; i++){
        if (!isTypeEqual(checkedFields[i].columnType,checkedFields[i+1].columnType)){
            return {
                message: checkedFields[i].displayName + '与' + checkedFields[i+1].displayName + '类型不一致'
            }
        }
    }
    //找到输出集合
    var outputSrc = _.find(fieldsData, function(item) {
        return item.index < 0;
    });
    if(outputSrc) { //构造outputColumnDescList
        taskDetail.outputColumnDescList.push({
            displayName: selectedSematic.semanticName,
            columnName: outputSrc.selectedFields[0]
        })
    }
    return {
        detail: taskDetail
    };
};

function isTypeEqual(type1, type2) {
    var types = [
        ['int', 'bigint', 'double', 'decimal'],
        ['string'],
        ['date', 'datetime', 'timestamp']
    ];
    var isMatch = false;
    _.each(types, function(type) {
        if (_.contains(type, type1) && _.contains(type, type2)){
            isMatch = true;
        }
    });
    return isMatch;
}
