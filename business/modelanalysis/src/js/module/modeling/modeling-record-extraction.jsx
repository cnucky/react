var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var MultiSelect = require('widget/multiselect');
var Notify = require('nova-notify');
var Provider = require('widget/i18n-provider');

var taskDetail;
var selectedInputId;
var inputSrc;

/*
state = {
    input: [
        {
            nodeId: 'xxx',
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
    }
}*/

/***选择碰撞字段组件***/
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
        var value = option.val();
        if (item.leftOrRight == 0){
            if (_.contains(this.state.selectedFields[item.index].leftTableField,value)){
                this.state.selectedFields[item.index].leftTableField.splice(_.indexOf(this.state.selectedFields[item.index].leftTableField, value), 1)
            }else {
                this.state.selectedFields[item.index].leftTableField.push(value);
            }
        }else if (item.leftOrRight == 1) {
            if (_.contains(this.state.selectedFields[item.index].rightTableField, value)) {
                this.state.selectedFields[item.index].rightTableField.splice(_.indexOf(this.state.selectedFields[item.index].rightTableField, value), 1)
            } else {
                this.state.selectedFields[item.index].rightTableField.push(value);
            }
        }
        this.setState({
            selectedFields: this.state.selectedFields
        });
    },
    addBtnClick: function() {
        var leftTableFields = [];
        var rightTableFields = [];
        _.each(this.state.selectedFields, function(item) {
            leftTableFields.push(item.leftTableField[0]);
            rightTableFields.push(item.rightTableField[0]);
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
            leftTableField: [leftTableField.aliasName],
            rightTableField: [rightTableField.aliasName]
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
            Notify.show({
                type: 'warning',
                title: i18n.t("warning.leave-at-least-one-condition")
            });
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
                    <label style={{fontSize:'15px'}}>{i18n.t("record-extraction.extraction-condition")}</label>
                </div>
                <div>
                    <div>
                        {
                            _.map(this.state.selectedFields, _.bind(function (item,index) {
                                return (
                                    <div className="flex-layout"　key={index}
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
                                            <MultiSelect config={{buttonWidth: '99%',
                                                                  disableIfEmpty: true,
                                                                  enableFiltering: true,
                                                                  enableClickableOptGroups: true,
                                                                  nonSelectedText: "请选择",
                                                                  nSelectedText: "个已选择",
                                                                  allSelectedText: "全选"}}
                                                         multiple='multiple'
                                                         identity={{index: index, leftOrRight: 0}}
                                                         updateData={true} onChange={this.handleSelectField}
                                                         data={
														_.map(this.props.leftInputFields,function(field){
														return{
															label: field.displayName,
															type: field.columnType,
															value: field.aliasName,
															selected: _.contains(item.leftTableField,field.aliasName)
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
                                            <MultiSelect config={{buttonWidth: '99%',
                                                                  disableIfEmpty: true,
                                                                  enableFiltering: true,
                                                                  enableClickableOptGroups: true,
                                                                  nonSelectedText: "请选择",
                                                                  nSelectedText: "个已选择",
                                                                  allSelectedText: "全选"}}
                                                         multiple='multiple'
                                                         identity={{index: index, leftOrRight: 1}}
                                                         style={{paddingLeft: "-11px",paddingRight:"1px"}}
                                                         updateData={true} onChange={this.handleSelectField}
                                                         data={
														_.map(this.props.rightInputFields,function(field){
														return{
															label: field.displayName,
															type: field.columnType,
															value: field.aliasName,
															selected: _.contains(item.rightTableField,field.aliasName)
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

var RecordExtractionComponent = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    selectChangedHandle : function(e){
        selectedInputId = e.target.value;
    },
    render : function () {
        var {i18n} = this.context;
        return (
            <div>
                <div>
                    <JoinFieldsComponent selectedFields={this.props.collisionList}
                                         leftInputFields={this.props.inputSrc[0].outputColumnDescList}
                                         rightInputFields={this.props.inputSrc[1].outputColumnDescList}>
                    </JoinFieldsComponent>
                </div>
                <div className='mt20'>
                    <div>
                        <label style={{fontSize:'15px'}}>{i18n.t("record-extraction.output-dataset")}</label>
                    </div>
                    <div>
                        <label className="radio-inline mr10" style={{marginLeft: '0px'}}>
                            <input type="radio" name="inlineRadioOptions" id="dataset1" value={this.props.inputSrc[0].nodeId}
                                defaultChecked={this.props.inputSrc[0].nodeId == selectedInputId}
                                onChange = {this.selectChangedHandle}/>{this.props.inputSrc[0].title}
                        </label>
                        <label className="radio-inline mr10" style={{marginLeft: '0px'}}>
                            <input type="radio" name="inlineRadioOptions" id="dataset2" value={this.props.inputSrc[1].nodeId}
                                defaultChecked={this.props.inputSrc[1].nodeId == selectedInputId}
                                onChange = {this.selectChangedHandle}/>{this.props.inputSrc[1].title}
                        </label>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports.render = function(container,data){
    data = checkInputData(data);
    if (data.output && data.output.collisionList && data.output.collisionList.length > 0) {
        taskDetail = data.output;
        _.each(data.output.srcDataTypes,function(item){
            if (item.outputColumnDescList != undefined && item.outputColumnDescList.length > 0){
                selectedInputId = item.inputNode;
            }
        })
    }else{
        selectedInputId = data.input[0].outputColumnDescList.length >= data.input[1].outputColumnDescList.length ? data.input[0].nodeId:data.input[1].nodeId;
        
        // 寻找类型相同的两个输入
        var leftTableField = _.find(data.input[0].outputColumnDescList, function(item) {
            return item.columnType == "string";
        })
        var rightTableField = _.find(data.input[1].outputColumnDescList, function(item) {
            return item.columnType == "string";
        })
        if (!leftTableField || !rightTableField) {
            leftTableField = _.find(data.input[0].outputColumnDescList, function(item) {
                return isNumber(item.columnType);
            })
            rightTableField = _.find(data.input[1].outputColumnDescList, function(item) {
                return isNumber(item.columnType);
            })
            if (!leftTableField || !rightTableField) {
                leftTableField = _.find(data.input[0].outputColumnDescList, function(item) {
                    return isDate(item.columnType);
                })
                rightTableField = _.find(data.input[1].outputColumnDescList, function(item) {
                    return isDate(item.columnType);
                })
                if (!leftTableField || !rightTableField) {
                    leftTableField = data.input[0].outputColumnDescList[0];
                    rightTableField = data.input[1].outputColumnDescList[0];
                }
            }
        }

        taskDetail = {
            srcDataTypes: [
                {
                    inputNode: data.inputIds[0],
                    outputColumnDescList: []
                },
                {
                    inputNode: data.inputIds[1],
                    outputColumnDescList: []
                }
            ],
            collisionList: [
                {
                    leftTableField : [leftTableField.aliasName],
                    rightTableField: [rightTableField.aliasName]
                }
            ],
        };
    }
    inputSrc = data.input;
    ReactDOM.render(<Provider.default><RecordExtractionComponent collisionList={taskDetail.collisionList}
                                      inputSrc={inputSrc}
                                      selectedInputId={selectedInputId}/></Provider.default>,container);
};

module.exports.constructTaskDetail = function () {
    for (var index in taskDetail.collisionList) {
        var item = taskDetail.collisionList[index];
        var leftCols = [];
        _.each(item.leftTableField, function(field) {
            var temp = _.find(inputSrc[0].outputColumnDescList, function (input) {
                return input.aliasName == field;
            });
            if (temp){
                leftCols.push(temp);
            }
        });
        var rightCols = [];
        _.each(item.rightTableField, function(field){
            var temp = _.find(inputSrc[1].outputColumnDescList, function (input) {
                return input.aliasName == field;
            });
            if (temp){
                rightCols.push(temp);
            }
        });
        if (!_.isArray(leftCols) || leftCols.length < 1 || !_.isArray(rightCols) || rightCols.length < 1){
            return {
                message : window.i18n.t("warning.extraction-conditions-have-not-been-completed")
            }
        }
        var condCols = leftCols.concat(rightCols);
        for (var i=0; i< condCols.length-1; i++){
            if (!isTypeEqual(condCols[i].columnType,condCols[i+1].columnType)){
                return {
                    message: condCols[i].displayName + '与' + condCols[i+1].displayName + '类型不一致'
                }
            }
        }
    }

    var inputColumns = _.find(inputSrc,function(item){
       return item.nodeId == selectedInputId;
    }).outputColumnDescList;
    _.each(taskDetail.srcDataTypes,function(item){
       if (item.inputNode == selectedInputId){
           item.outputColumnDescList = _.map(inputColumns,function(column){
               var outputField = {};
               $.extend(outputField,column);
               outputField.columnName = column.aliasName;
               outputField.aliasName = "";
               return outputField;
           });
       }else{
           item.outputColumnDescList = new Array();
       }
    });

    return {
        detail: taskDetail
    }
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

function isNumber(columnType) {
    return _.contains(['int', 'bigint', 'double', 'decimal'], columnType);
}

function isDate(columnType) {
    return _.contains(['date', 'datetime', 'timestamp'], columnType);
}

function checkInputData(data){
    var inputIsSame = true;
    if (data.inputIds && data.output && data.output.srcDataTypes){
        _.each(data.output.srcDataTypes, function (item) {
            if (!_.find(data.inputIds,function(inputId){
                return inputId == item.inputNode;
            })){
                inputIsSame = false;
            }
        })
    }
    if (!inputIsSame){
        data.output = null;
    }
    return data;
}

