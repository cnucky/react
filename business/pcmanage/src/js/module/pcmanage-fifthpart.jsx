var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var Dialog = require('nova-dialog');
var _ = require('underscore');
var MultiSelect = require('widget/multiselect');
var Notify = require('nova-notify');
var Util = require('../../../../../framework/utils/util');

var _stateData = [];
var _consFlag = false;
var _relationCout = 1
var ShowFifthPartContent = React.createClass({
    getInitialState: function() {
        return {
            selectedData:[]
        };
    },
    handleSelectedRule:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        selectedData[item.index].rule = option.val();
        var entityName = [];
        _.map(this.props.inputData.inputEntity,function(entityItem){
            if(entityItem.rule == option.val()){
                entityName.push(entityItem);
            }
        })
        selectedData[item.index].selectedEntityOption = entityName;
        selectedData[item.index].entityRuleName1 = entityName[0].entityRuleName;
        selectedData[item.index].entityRuleName2 = entityName[0].entityRuleName;
        this.update(selectedData);
    },
    handleSelectedRelationType:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        var data = this.props.inputData;
        _.map(data.relationType,function(relationItem){
            if(relationItem.relationTypeId == Util.toInt(option.val())){
                selectedData[item.index].relationCaptionName = relationItem.relationTypeName;
                selectedData[item.index].relationType = option.val();
            }
        })
        this.update(selectedData);
    },
    handleSelectedEntity:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        var index = item.index;
        if(item.flagItem == "entityName1"){
            selectedData[index].entityRuleName1 = option.val();

        }else if(item.flagItem == "entityName2"){
            selectedData[index].entityRuleName2 = option.val();
        }
        this.update(selectedData);

    },
    handleSelectedProps:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        var index = item.index;
        if(checked){
            selectedData[index].relationProp.push(option.val());
        }else{
            var deleteIndex;
            _.map(selectedData[index].relationProp,function(itemProp,indexNum){
                if(itemProp == option.val()){
                    deleteIndex = indexNum;
                }
            })
            selectedData[index].relationProp.splice(deleteIndex,1);
        }
        this.update(selectedData);
    },
    getInputState:function(e){
        var selectedData = this.state.selectedData;
        var index = $(e.currentTarget).attr('data-index');
        selectedData[index].bidirection = !selectedData[index].bidirection;
        this.update(selectedData);
    },
    update: function(state) {
        _stateData = [];
        $.extend(true,_stateData,state);
        this.setState({selectedData:state});
    },
    addBtnClick: function() {
        var data = this.props.inputData;
        var entityName = [];
        _.map(data.inputEntity,function(item){
            if(item.rule == data.rule[0]){
                entityName.push(item);
            }
        })
        var relationPropName = [];
        relationPropName.push(data.inputProperty[0].propRuleName);
        this.state.selectedData.push({
            rule:data.rule[0],
            relationRuleName:"实体间关系"+_relationCout,
            relationCaptionName:data.relationType[0].relationTypeName,
            relationType:data.relationType[0].relationTypeId,
            needMerge:true,
            bidirection:false,
            selectedEntityOption:entityName,
            entityRuleName1:entityName[0].entityRuleName,
            entityRuleName2:entityName[0].entityRuleName,
            relationProp:relationPropName
        });
        _relationCout ++;
        this.update(this.state.selectedData);
    },
    toggleDeleteMode: function() {
        this.state.deleteMode = !this.state.deleteMode;
        this.setState(this.state);
    },
    deleteBtnClick: function(e) {
        var selectedData = this.state.selectedData;
        var index = $(e.currentTarget).attr('data-index');
        selectedData.splice(index,1);
        _stateData = [];
        $.extend(_stateData,this.state.selectedData);
        this.setState({selectedData:this.state.selectedData});
    },
    render:function(){
        var selectedData = this.state.selectedData;
        if(_consFlag){
            var len = selectedData.length;
            selectedData.splice(0,len);
            _stateData = [];
            _consFlag = false;
        }else{
            selectedData = [];
            this.state.selectedData = [];
            $.extend(true,selectedData,_stateData);
            $.extend(true,this.state.selectedData,selectedData);
        }
        var handleSelectedRule = this.handleSelectedRule;
        var handleSelectedRelationType = this.handleSelectedRelationType;
        var handleSelectedEntity = this.handleSelectedEntity;
        var handleSelectedProps = this.handleSelectedProps;
        var getInputState = this.getInputState;
        var deleteModeFlag = this.state.deleteMode;
        var deleteBtnClick1 = this.deleteBtnClick;
        var btns = (<div className={this.props.inputData.flag?"col-md-12 row mt10":"col-md-12 row mt10 pn"} style={{align:'right'}}>
                <div className = "col-md-2" style={{width:'12%'}}>
                <button type="button" onClick={this.addBtnClick} className="btn btn-primary btn-sm btn-block">
                    新增
                </button>
                </div>
                <div className ="col-md-2" style={{width:'12%',margin:'0px 0px 0px -18px'}}>
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
                    <div className = {this.props.inputData.flag? "0" :"col-md-1"}>
                    </div>
                    <div className={this.props.inputData.flag? "col-md-10" :"col-md-9"}>
                    {btns}
                    <div className="col-md-12 row mt10">
                            {
                                deleteModeFlag?<label  className="col-md-1" ></label>:null
                            }
                            {
                                this.props.inputData.flag?<label className="col-md-2 ">选择规则集</label>:null
                            }
                            <label className="col-md-2 pn">选择关系类型</label>
                            <label className={this.props.inputData.flag? "col-md-2" :"col-md-3"}>选择实体1</label>
                            <label className={this.props.inputData.flag? "col-md-2 pn" :"col-md-3 pn"}>选择实体2</label>
                            <label className="col-md-2">选择关系属性</label>
                            <label className={deleteModeFlag? "col-md-1 pn" :"col-md-2 pn"}>是否双向</label>
                    </div>
                    {
                    _.map(selectedData,_.bind(function(itemData,index){
                    return(<div className={deleteModeFlag? "col-md-12 form-group pn" :"col-md-12 form-group "} key={index}>
                        {
                            deleteModeFlag?<button type="button" onClick={deleteBtnClick1} data-index={index} className="col-md-1 hide-show btn btn-danger" >-</button>:null
                        }
                        {
                            this.props.inputData.flag?<div className="col-md-2 ">
                                <MultiSelect onChange={handleSelectedRule}
                                updateData={true}
                                identity={{index: index}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '100%',
                                    allSelectedText: '全选',
                                }}
                                data={
                                        _.map(this.props.inputData.rule,function(item,indexNum)
                                        {
                                            return {
                                                label: item,
                                                title: item,
                                                value: item,
                                                selected: itemData.rule === item
                                            }
                                        })
                                }/>
                        </div>:null
                        }
                        
                        <div className="col-md-2 pn">
                                <MultiSelect onChange={handleSelectedRelationType}
                                updateData={true}
                                identity={{index: index,flagItem:"relationType"}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '100%',
                                    enableFiltering: true,
                                }}
                                data={
                                        _.map(this.props.inputData.relationType,function(item,indexNum)
                                        {
                                            return {
                                                label: item.relationTypeName,
                                                title: item.relationTypeName,
                                                value: item.relationTypeId,
                                                selected: itemData.relationCaptionName === item.relationTypeName
                                            }
                                        })
                                }/>
                        </div>
                        <div className={this.props.inputData.flag? "col-md-2" :"col-md-3"}>
                                <MultiSelect onChange={handleSelectedEntity}
                                updateData={true}
                                identity={{index: index,flagItem:"entityName1"}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '100%',
                                    allSelectedText: '全选',
                                    enableFiltering: true,
                                    buttonClass:'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50'
                                }}
                                data={
                                        _.map(itemData.selectedEntityOption,function(item,indexNum)
                                        {
                                            return {
                                                label: item.entityRuleName,
                                                title: item.entityRuleName,
                                                value: item.entityRuleName,
                                                selected: itemData.entityRuleName1 === item.entityRuleName
                                            }
                                        })
                                }/>
                        </div>
                        <div className={this.props.inputData.flag? "col-md-2 pn" :"col-md-3 pn"}>
                                <MultiSelect onChange={handleSelectedEntity}
                                updateData={true}
                                identity={{index: index,flagItem:"entityName2"}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '100%',
                                    allSelectedText: '全选',
                                    enableFiltering: true,
                                    buttonClass:'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50'
                                }}
                                data={
                                        _.map(itemData.selectedEntityOption,function(item,indexNum)
                                        {
                                            return {
                                                label: item.entityRuleName,
                                                title: item.entityRuleName,
                                                value: item.entityRuleName,
                                                selected: itemData.entityRuleName2 === item.entityRuleName
                                            }
                                        })
                                }/>
                        </div>
                        <div className="col-md-2 ">
                            <MultiSelect multiple="multiple" onChange={handleSelectedProps}
                            updateData={true}
                            identity={{index: index,flagItem:"propertyName"}}
                                config={{
                                maxHeight: 250,
                                buttonWidth: '100%',
                                nonSelectedText: '请选择',
                                nSelectedText: '项选中',
                                allSelectedText: '全选',
                                numberDisplayed: 1,
                                enableFiltering: true,
                            }}
                                data={
                                    _.map(this.props.inputData.inputProperty,function(item,indexNum)
                                    {
                                        return {
                                            label: item.propRuleName,
                                            title: item.propRuleName,
                                            value: item.propRuleName,
                                            selected: _.contains(itemData.relationProp,item.propRuleName) 
                                        }
                                    })
                            }/>
                        </div>
                        <div className={deleteModeFlag? "col-md-1 pn" :"col-md-2 pn"}>
                            <label style={{padding:'5px 0px 0px 0px'}}>
                                <input checked={itemData.bidirection} data-index={index} onChange={getInputState} type="checkbox" />是否双向
                            </label>
                        </div>
                        </div>)
                    },this))
                    }
                </div>
                <div className = "col-md-2">
                    <div className="col-md-12 mt50">
                            <label className="text-danger mn">提示:</label>
                            <p>请先点击新增按钮以增加条件</p> 
                            <p>此页面为设置关系页面,条件允许为空</p>
                        </div>
                </div>
            </div>
            )
    }
});

function getRule(data,ruleData){
    var temp = [];
    var rules = [];
    _.map(ruleData,function(ruleInfo){
        rules.push(ruleInfo.caption);
    })
    _.map(data,function(item){
        if (!_.contains(temp, item.rule) && _.contains(rules, item.rule)){
            temp.push(item.rule);
        }
    })

    return temp;
}

function getEntity(entity){
    var entityNames = [];
    _.map(entity,function(entityItem,index){
        entityNames.push({
            rule:entityItem.rule,
            entityRuleName:entityItem.entityRuleName,
        });
    })

    if(_stateData.length > 0){
        _.map(_stateData,function(stateDataItem,itemIndex){
            stateDataItem.selectedEntityOption = [];
            _.map(entityNames,function(item){
                if(item.rule == stateDataItem.rule){
                    stateDataItem.selectedEntityOption.push(item);
                }
            })
        })
    }
    
    return entityNames;
}

function getPropNames(property){
    var propNames = [];
    _.map(property,function(prop,index){
        propNames.push({propRuleName:prop.propRuleName});
    })
    return propNames;
}

module.exports.getSelectedState = function(){
    return _stateData;
}

module.exports.setInitSelectedState = function(){
    _stateData = [];
}

module.exports.render = function(container,flag, ruleData,property, entity,relationType) {
    var rule = getRule(entity,ruleData);
    var entityNames = getEntity(entity);
    var propNames = getPropNames(property);
    var data = {
        flag:flag,
        rule:rule,
        inputEntity:entityNames,
        inputProperty:propNames,
        relationType:relationType
    }
    ReactDOM.render(<ShowFifthPartContent inputData = {data}/>, container);
}

module.exports.renderFifth = function(container,flag, ruleData,property, entity,relationType,initState) {
    var rule = getRule(entity,ruleData);
    var entityNames = getEntity(entity);
    var propNames = getPropNames(property);
    var data = {
        flag:flag,
        rule:rule,
        inputEntity:entityNames,
        inputProperty:propNames,
        relationType:relationType
    }

    if(initState.length > 0){
        $.extend(true,_stateData,initState);
    }else{
        _stateData = [];
        _consFlag = true;
    }
    ReactDOM.render(<ShowFifthPartContent inputData = {data}/>, container);
}