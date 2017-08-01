var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var _ = require('underscore');
var MultiSelect = require('widget/multiselect');
var KeywordToDo = require('./keyword-todo');
var DateTimer = require('widget/datetimer');
var Select2 = require('widget/select2-react');
var Notify = require('nova-notify');
// import ValueInput from 'widget/value-input';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
require("./modeling-filter-react.less");

var oprData = {
    stringOpr: [/*{key: 'equal', name: '等于'},
        {key: 'notEqual', name: '不等于'},*/
        {key: 'in', name: '在列表中'},
        {key: 'notIn', name: '不在列表中'}/*,
        {key: 'startWith', name: '以...开头'},
        {key: 'notStartWith', name: '不以...开头'},
        {key: 'endWith', name: '以...结尾'},
        {key: 'notEndWith', name: '不以...结尾'},
        {key: 'like', name: '类似于'},
        {key: 'notLike', name: '不类似于'},
        {key: 'isNull', name: '为空'},
        {key: 'isNotNull', name: '不为空'}*/],
    numberOpr: [{key: 'equal', name: '等于'},
        {key: 'notEqual', name: '不等于'},
        {key: 'greaterThan', name: '大于'},
        {key: 'lessThan', name: '小于'},
        {key: 'between', name: '在...之间'},
        {key: 'notBetween', name: '不在...之间'}],
    dateTimeOpr: [{key: 'greaterThan', name: '大于'},
        {key: 'lessThan', name: '小于'},
        {key: 'between', name: '在...之间'},
        {key: 'notBetween', name: '不在...之间'}]
};

var _stateData = [];
var _consFlag = false;
var _inputFlag = false;

var ShowSecondPartContent = React.createClass({
    getInitialState: function() {
        var objData = {};
        var objSelectedData = []
        //$.extend(true,objData,this.props.inputData);
        return {
            selectedData:[]
        };
    },
    handleSelectedRule:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        selectedData[item.index].rule = option.val();
        _.map(selectedData,function(item,index){
            item = getSelectedData(item,index);
        })
        this.update(selectedData);
    },
    getInputValue:function(e){
        var index = $(e.currentTarget).attr('data-index');
        var selectedData = this.state.selectedData;
        selectedData[index].filterRuleName = $(e.currentTarget).val();
        _.map(selectedData,function(item,index){
            item = getSelectedData(item,index);
        })
        this.update(selectedData);
    },
    handleOprSelectedItem:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        selectedData[item.index].opType = option.val();
        _.map(selectedData,function(item,index){
            item = getSelectedData(item,index);
        })
        this.update(selectedData);
    },
    handleSelectField:function(item, option, checked, select){
        var inputData = this.props.inputData;
        var selectedData = this.state.selectedData;
        var seleItem ={};
        var filterName = option.attr('label');
        _.map(inputData.columnData,function(colItem){
            if(colItem.name == option.val()){
                seleItem = colItem;
            }
        })

        if (seleItem.codeTag == 1) {
            selectedData[item.index].field = option.val();
            selectedData[item.index].fieldType = seleItem.type;
            selectedData[item.index].codeTag = 1;
            selectedData[item.index].opType = inputData.oprData.stringOpr[0].key;
            selectedData[item.index].oprSelectedItems = inputData.oprData.stringOpr;
            selectedData[item.index].filterRuleName = filterName+"过滤";
            selectedData[item.index].opValue = [];
        } else {
            if (seleItem.type == "string") {
                selectedData[item.index].field = option.val();
                selectedData[item.index].fieldType = seleItem.type;
                selectedData[item.index].codeTag = 0;
                selectedData[item.index].opType = inputData.oprData.stringOpr[0].key;
                selectedData[item.index].oprSelectedItems = inputData.oprData.stringOpr;
                selectedData[item.index].filterRuleName = filterName+"过滤";
                selectedData[item.index].opValue = [];
            } else if (seleItem.type == "decimal") {
                selectedData[item.index].field = option.val();
                selectedData[item.index].fieldType = seleItem.type;
                selectedData[item.index].codeTag = 0;
                selectedData[item.index].opType = inputData.oprData.numberOpr[0].key;
                selectedData[item.index].oprSelectedItems = inputData.oprData.numberOpr;
                selectedData[item.index].filterRuleName = filterName+"过滤";
                selectedData[item.index].opValue = [];
            } else if (seleItem.type == "DATE" || seleItem.type == "DATETIME") {
                selectedData[item.index].field = option.val();
                selectedData[item.index].fieldType = seleItem.type;
                selectedData[item.index].codeTag = 0;
                selectedData[item.index].opType = inputData.oprData.dateTimeOpr[0].key;
                selectedData[item.index].oprSelectedItems = inputData.oprData.dateTimeOpr;
                selectedData[item.index].filterRuleName = filterName+"过滤";
                selectedData[item.index].opValue = [];
            }
        }

        _.map(selectedData,function(item,index){
            item = getSelectedData(item,index);
        })
        this.update(selectedData);
    },
    codeTagInputCallback(value, index) {
        var selectedData = this.state.selectedData;
        selectedData[index].opValue = value;
        this.update(selectedData);
    },
    update: function(state) {
        _stateData = [];
        $.extend(true,_stateData,state);
        this.setState({selectedData:state});
    },
    addBtnClick: function(e) {
        var oprSelItems = [];
        var type = this.props.inputData.columnData[0].type;
        switch(type){
            case "string":
                oprSelItems=this.props.inputData.oprData.stringOpr;
                break;
            case "decimal":
                oprSelItems=this.props.inputData.oprData.numberOpr;
                break;
            case "date":
                oprSelItems=this.props.inputData.oprData.dateTimeOpr;
                break;
        }
        //$.extend(true,oprSelItems,this.props.inputData.oprData);
        var opValues = [];
        this.state.selectedData.push({
            rule:this.props.inputData.ruleData[0].caption,
            field:this.props.inputData.columnData[0].name,
            fieldType:this.props.inputData.columnData[0].type,
            codeTag:this.props.inputData.columnData[0].codeTag,
            opType:oprSelItems[0].key,
            oprSelectedItems:oprSelItems,
            filterRuleName:this.props.inputData.columnData[0].caption+"过滤",
            opValue:opValues
        });
        _.map(this.state.selectedData,function(item,index){
            item = getSelectedData(item,index);
        })
        this.update(this.state.selectedData);
    },
    toggleDeleteMode: function() {
        _.map(this.state.selectedData,function(item,index){
            item = getSelectedData(item,index);
        })
        this.update(this.state.selectedData);
        this.state.deleteMode = !this.state.deleteMode;
        this.setState({setData:this.state.setData});
    },
    deleteBtnClick: function(e) {
        var index = $(e.currentTarget).attr('data-index');
        this.state.selectedData.splice(index, 1);
        _stateData = [];
        $.extend(_stateData,this.state.selectedData);
        this.setState({selectedData:this.state.selectedData});
    },
    getRight: function(info, index) {
        var inputData = this.props.inputData;
        var selectedData = this.state.selectedData;
        var handleOprSelectedItem = this.handleOprSelectedItem;
        var item ={};

        item.name = info.field;
        item.type = info.fieldType;
        item.codeTag = info.codeTag;
        if (item.codeTag == 0) {
            if (item.type == "string") {
                return (
                    <div className="string">
                        <div className="col-md-5 pn pr5">
                            <MultiSelect id="string-opr"
                                config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50',
                                         buttonWidth: '100%',
                                     }}
                                identity={{index: index}}
                                updateData={true}
                                onChange={handleOprSelectedItem} 
                                data={
                                        _.map(info.oprSelectedItems, function(column) {
                                            return {
                                                label: column.name,
                                                title: column.name,
                                                value: column.key,
                                                selected: info.opType === column.key
                                            }
                                })
                            }/>
                        </div>
                        <div className="col-md-7 pn pr5">
                            <KeywordToDo style={{height: '40px'}} id="tagsinput" 
                                data={{
                                    children: info.opValue,
                                    index: index,
                                    field: item
                                    }} 
                                type="text"/>
                        </div>
                    </div>
                )
            } else if (item.type == "decimal") {
                return (
                    <div className="decimal">
                        <div className="col-md-5 pn pr5">
                            <MultiSelect id="int-opr"
                                config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50',buttonWidth: '100%'}}
                                identity={{index: index}}
                                updateData={true}
                                onChange={handleOprSelectedItem} 
                                data={
                                    _.map(info.oprSelectedItems, function(column) {
                                            return {
                                                label: column.name,
                                                title: column.name,
                                                value: column.key,
                                                selected: info.opType === column.key
                                            }
                                    })
                            }/>
                        </div>
                        <div className="col-md-7 pn pr5">
                            <KeywordToDo style={{height: '40px'}} id="tagsinput" 
                                data={{
                                    children: info.opValue,
                                    index: index,
                                    field: item
                                    }} type="text"/>
                        </div>
                    </div>
                )
            } else if (item.columnType == "DATE" || item.columnType == "DATETIME") {
                return (
                    <div className="date">
                        <DateTimer style={{height: '40px'}} data={{
                            children: "",
                            index: index,
                            field: item
                        }}/>
                    </div>
                )
            }
        } else {
            return (
                <div className="codeTag1">
                    <div className="col-md-5 pn pr5">
                        <MultiSelect id="codeTag1-opr"
                            config={{buttonClass: 'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50',buttonWidth: '100%'}}
                            identity={{index: index}}
                            updateData={true}
                            onChange={handleOprSelectedItem} 
                            data={
                                _.map(info.oprSelectedItems, function(column) {
                                    return {
                                        label: column.name,
                                        title: column.name,
                                        value: column.key,
                                        selected: info.opType === column.key
                                    }
                                })
                        }/>
                    </div>
                    <span className="col-md-7 pl5 pr5">
                    <div className="" style={{width: '100%', height: '40px'}}>
                        <Select name="codeTag" className="valueInput" multi={true} value={selectedData[index].opValue} clearable={false}
                            placeholder="" cacheAsyncResults={false} noResultsText="没有匹配的结果" searchPromptText="输入进行搜索"
                            asyncOptions={(input, callback) => {
                                if(typeof input === 'string' || input.length == 0) {
                                    input = input.length == 0? "":input;
                                    $.getJSON('/pcmanage/searchCodeTable', {
                                            fieldName: info.field,
                                            typeId:inputData.dataTypeId,
                                            queryWord: input
                                        }, (rsp) => {
                                            if(rsp.code == 0) {
                                                var rlt = _.map(rsp.data, (dataItem) => {
                                                    return {
                                                        value: dataItem.text,
                                                        label: dataItem.text
                                                    }
                                                })
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
                    </span>
                </div>
            )
        }
    },
    render:function(){
        var selectedData = this.state.selectedData;
        if(_consFlag){
            var len = selectedData.length;
            selectedData.splice(0,len);
            _stateData = [];
            _consFlag = false;
        }else{
            $.extend(true,selectedData,_stateData);
        }
        var deleteModeFlag = this.state.deleteMode;
        var deleteBtnClick1 = this.deleteBtnClick;
        var getRight = this.getRight;
        var handleSelectedRule = this.handleSelectedRule;
        var handleSelectField = this.handleSelectField;
        var getInputValue = this.getInputValue;
        var btns = (<div className={this.props.inputData.flag?"col-md-12 row mt10 btn-group":"col-md-12 row mt10 btn-group pn"}>
                <div className = "col-md-2 " style={{width:'12%'}}>
                <button type="button" onClick={this.addBtnClick} className="btn btn-primary btn-sm btn-block">
                    新增
                </button>
                </div>
                <div className ="col-md-2 " style={{width:'12%' ,margin :'0px 0px 0px -18px'}}>
                <button type="button" onClick={this.toggleDeleteMode} className="btn btn-danger btn-sm btn-block">
                    删除
                </button>
                </div>
                </div>
            )
        if(this.state.deleteMode) {
            btns = (<div className="col-md-12 row mt10 pn" style={{align:'right'}}>
                <div className ="col-md-2" style={{padding:'0px 20px 0px 0px'}}>
                <button type="button" onClick={this.toggleDeleteMode} className="btn btn-system btn-sm btn-block" style={{width:'60%'}}>
                    完成
                </button>
                </div>
                </div>
            )
        }

        return (
            <div className="col-md-12">
                <div className="col-md-1">
                    
                </div>
                <div className="col-md-9">
                    {btns}
                    <div className="col-md-12 row mt10">
                            {
                                deleteModeFlag?<label  className="col-md-1" ></label>:null
                            }
                            {
                                this.props.inputData.flag?<label className="col-md-2 ">选择规则集</label>:null
                            }
                            <label className="col-md-2 pn">输入过滤规则名</label>
                            <label className={deleteModeFlag? "col-md-2" :"col-md-3"}>选择字段</label>
                            <label className="col-md-2 pn">选择操作符</label>
                            <label className="col-md-3 ">输入阀值</label>
                    </div>
                    <div id="conditionModule">
                    {
                    _.map(selectedData,_.bind(function(itemData,index){
                    return (<div className={deleteModeFlag? "col-md-12 form-group pn" :"col-md-12 form-group "} key={index}>
                        {
                            deleteModeFlag?<button type="button" onClick={deleteBtnClick1} data-index={index} className="col-md-1 hide-show btn btn-danger" >-</button>:null
                        }
                        {
                                this.props.inputData.flag?<div className="col-md-2 ">
                                <MultiSelect onChange={handleSelectedRule}
                                updateData={true}
                                identity={{index: index,flagItem:"ruleItem"}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '100%',
                                    allSelectedText: '全选',
                                }}
                                data={
                                        _.map(this.props.inputData.ruleData,function(item,indexNum)
                                        {
                                            return {
                                                label: item.caption,
                                                title: item.caption,
                                                value: item.caption,
                                                selected: itemData.rule === item.caption
                                            }
                                        })
                                }/>
                        </div>:null
                        }
                        
                        <div className={deleteModeFlag ? "col-md-2 admin-form" : "col-md-2 pn admin-form"} >
                            <input  data-index={index} type="text" className="gui-input" 
                                value={itemData.filterRuleName}  
                                onChange={getInputValue} 
                                placeholder="过滤规则名">
                            </input>
                        </div>
                        <div className={deleteModeFlag? "col-md-2" :"col-md-3"}>
                                <MultiSelect onChange={handleSelectField}
                                updateData={true}
                                identity={{index: index,flagItem:"fieldItem"}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '100%',
                                    enableFiltering: true,
                                }}
                                data={
                                        _.map(this.props.inputData.columnData,function(item,indexNum)
                                        {
                                            return {
                                                label: item.caption,
                                                title: item.caption,
                                                value: item.name,
                                                selected: itemData.field === item.name
                                            }
                                        })
                                }/>
                        </div>
                        <div className = "col-md-5 pn">
                            {
                                getRight(itemData,index)
                            }
                        </div>
                        </div>)
                    },this))
                    }
                    </div>
                    </div>
                <div className="col-md-2 pn">
                    <div className="col-md-12 mt50">
                        <label className="text-danger mn">提示:</label> 
                        <p>请先点击新增按钮以增加条件</p>
                        <p>该步骤为数据过滤过程,以数据中的字段为单位进行过滤,通过对字段中的数据设置阀值,满足条件的字段数据被保存下来,第一步中若选择高级模式,此页会展示规则集</p>
                    </div>
                </div>
            </div>
            )
    }
});

function getSelectedData(selectedData,index) {
    var module = $('#conditionModule').children('div');
    _.each(module, function (item, indexNum) {
        if(index == indexNum){
            if ($(item).hasClass('form-group')) {
                var selection = "";
                if(_inputFlag){
                    selection = $($(item).children('div')[3]).children('div');
                }else{
                    selection = $($(item).children('div')[2]).children('div');
                }
            if(selectedData) {
                // if (selection.hasClass('codeTag1')) {
                //     var vals = selection.find('li.select2-selection__choice');
                //     selectedData.opValue = [];
                //     _.each(vals,function(liValue){
                //         selectedData.opValue.push($(liValue).attr("title"));
                //     })
                //     // selectedData.opValue = selection.find('li.select2-selection__choice').val();
                // } else {
                if (!selection.hasClass('codeTag1')) {
                    var tags;
                    if (selection.hasClass('string')) {
                            tags = $(selection.children('div')[1]).children('div').children('span');
                            selectedData.opValue = [];
                            _.each(tags, function (span) {
                                selectedData.opValue.push($(span).text());
                            });
                    } else if (selection.hasClass('decimal')) {
                            tags = $(selection.children('div')[1]).children('div').children('span');
                            selectedData.opValue = [];
                            _.each(tags, function (span) {
                                selectedData.opValue.push($(span).text());
                            });
                    } else if (selection.hasClass('DATE') || selection.hasClass('DATETIME')) {
                            selectedData.opValue = selection.children('div').children('input').val();
                    }
                }
            }
        }
        }
        
    });
    // totalSelectedData = children;
    return selectedData;
}

module.exports.getSelectedState = function(){
    return _stateData;
}

module.exports.setInitSelectedState = function(){
    _stateData = [];
}

module.exports.getInputData = function(){
    var selectedData = _stateData;
    if(selectedData){
        _.map(selectedData,function(item,index){
            item = getSelectedData(item,index);
        })
    }
    $.extend(true,_stateData,selectedData);
}

module.exports.render = function(container,flag,ruleData,fieldData,dataTypeId) {
    var inputData = {
        flag:flag,
        ruleData:ruleData,
        columnData:fieldData,
        oprData:oprData,
        dataTypeId:dataTypeId
    }
    _inputFlag = flag;
    var selectedItem = []

    ReactDOM.render(<ShowSecondPartContent inputData={inputData}/>, container);
}

module.exports.renderSecond = function(container,flag,ruleData,fieldData,initState,dataTypeId) {
    var inputData = {
        flag:flag,
        ruleData:ruleData,
        columnData:fieldData,
        oprData:oprData,
        dataTypeId:dataTypeId
    }

    _inputFlag = flag;
    if(initState.length >0){
        $.extend(true,_stateData,initState);
    }else{
        _stateData = [];
        _consFlag = true;
    }

    var selectedItem = []

    ReactDOM.render(<ShowSecondPartContent inputData={inputData}/>, container);
}