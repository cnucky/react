var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var _ = require('underscore');
var MultiSelect = require('widget/multiselect');
var KeywordToDo = require('./keyword-todo');
var Notify = require('nova-notify');

var _stateData = [];
var _consFlag = false;
var _tempData = [];
function createInitialState(props){
    var data = {
        ruleData:props.data.ruleData,
        propertyData:props.data.propertyData,
        entityData:props.data.entityData
    }
    return data;
}

function getKeyProps(str){
    var data = str.split(',');
    var returnData = [];
    var i = 0;
    for(i = 0;i<data.length ; i++){
        returnData.push(parseInt(data[i]));
    }
    return returnData;
}

function getSortKeyProp(data1,data2){
    var temp = [];
    for(var i = 0;i<data1.length;i++){
        for(var j = 0 ;j<data2.length;j++){
            if(data1[i] == data2[j].propId){
                temp.push(data2[j]);
            }
        }
    }
    return temp;
}

var ShowForthPartContent = React.createClass({
    getInitialState: function() {
        var inputData = this.props.inputData;
        var selectedItemData = [];
        // var keyPropsId = inputData.entityItems[0].keyPropertyId;
        var keyPropTemp = inputData.entityItems[0].keyPropertyId;
        // _.map(inputData.propRuleNames,function(propItem,index){
        //     if(_.contains(keyPropsId,propItem.propId)){
        //         keyPropTemp.push(propItem);
        //     }
        // })
        
        selectedItemData.push({
            rule:inputData.ruleData[0].caption,
            needMerge:true,
            entityType:inputData.entityItems[0].entityTypeId,
            keyPropTemp:keyPropTemp,
            keyProp:[],
            prop:[],
            entityRuleName:inputData.entityItems[0].entityTypeName+"实体",
        });
        if(_stateData.length <= 0){
            $.extend(_stateData,selectedItemData);
        }
        return {
            selectedData:selectedItemData
        }
    },
    handleRuleSelectedItem:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        var value = option.val();
        selectedData[item.index].rule = value;
        this.update(selectedData);
    },
    handleEntitySelectedItem:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        var inputData = this.props.inputData;
        var value = option.val();
        var entityName = option.attr('label');
        var keyStr = option.attr('title'); 
        // var keyPropsId = getKeyProps(keyStr);
        var keyPropTemp = getKeyProps(keyStr);
        // _.map(inputData.propRuleNames,function(propItem,propIndex){
        //     if(_.contains(keyPropsId,propItem.propId)){
        //         keyPropTemp.push(propItem);
        //     }
        // })

        selectedData[item.index].keyPropTemp = keyPropTemp;
        selectedData[item.index].keyProp = [];
        selectedData[item.index].prop = [];
        selectedData[item.index].entityType = value;
        selectedData[item.index].entityRuleName = entityName +"实体";

        this.update(selectedData);
    },
    handlePropSelectedItem:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        var value = option.val();
        var propid = parseInt(option.attr('title')); 
        var flag = false;
        if(checked){
            selectedData[item.index].prop.push(value);
            if(_.contains(selectedData[item.index].keyPropTemp,propid)){
                _.map(selectedData[item.index].keyProp,function(keyPropItem){
                    if(propid == keyPropItem.propId){
                        flag = true;
                        Notify.show({
                            title: "必配属性重复!",
                            type: "warning"
                        });
                    }
                })

                selectedData[item.index].keyProp.push({
                    propName:value,
                    propId: propid,
                })
                selectedData[item.index].keyProp = getSortKeyProp(selectedData[item.index].keyPropTemp,selectedData[item.index].keyProp);
            }
        }else{
            var deletePropIndex;
            var deleteKeyPropIndex;
            _.map(selectedData[item.index].prop,function(itemProp,indexNum){
                if(itemProp == value){
                    deletePropIndex = indexNum;
                }
            })

            if(_.contains(selectedData[item.index].keyPropTemp,propid)){
                if(selectedData[item.index].keyProp.length >0){
                    _.map(selectedData[item.index].keyProp,function(keyPropItem,index){
                        if(value == keyPropItem.propName){
                            deleteKeyPropIndex = index;
                        }
                    })
                    selectedData[item.index].keyProp.splice(deleteKeyPropIndex,1);
                }
            }

            selectedData[item.index].prop.splice(deletePropIndex,1);
                
        }

        this.update(selectedData);
    },
    handleEntityNameValueChanged:function(e){
        var selectedData = this.state.selectedData;
        var index = $(e.currentTarget).attr('data-index');
        selectedData[index].entityRuleName = e.target.value;
        this.update(selectedData);
    },
    update: function(state) {
        _stateData = [];
        $.extend(true,_stateData,state);
        this.setState({selectedData:state});
    },
    addBtnClick: function(e) {
        var selectedData = this.state.selectedData;
        var inputData = this.props.inputData;
        // var keyPropsId = inputData.entityItems[0].keyPropertyId;
        var keyPropTemp = inputData.entityItems[0].keyPropertyId;
        // _.map(inputData.propRuleNames,function(propItem,index){
        //     if(_.contains(keyPropsId,propItem.propId)){
        //         keyPropTemp.push(propItem);
        //     }
        // })

        selectedData.push({
            rule:inputData.ruleData[0].caption,
            needMerge:true,
            entityType:inputData.entityItems[0].entityTypeId,
            keyPropTemp:keyPropTemp,
            keyProp:[],
            prop:[],
            entityRuleName:inputData.entityItems[0].entityTypeName+"实体",
        });
        this.update(selectedData);
    },
    toggleDeleteMode: function() {
        this.state.deleteMode = !this.state.deleteMode;
        this.setState({selectedData:this.state.selectedData});
    },
    deleteBtnClick: function(e) {
        var index = $(e.currentTarget).attr('data-index');
        this.state.selectedData.splice(index, 1);
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
        var deleteModeFlag = this.state.deleteMode;
        var deleteBtnClick = this.deleteBtnClick;
        var handleRuleSelectedItem = this.handleRuleSelectedItem;
        var handleEntitySelectedItem = this.handleEntitySelectedItem;
        var handlePropSelectedItem = this.handlePropSelectedItem;
        var handleEntityNameValueChanged = this.handleEntityNameValueChanged;
        var btns = (<div className={this.props.inputData.flag?"col-md-12 row mt10":"col-md-12 row mt10 pn"} style={{align:'right'}}>
                <div className = "col-md-2" style={{width:'12%'}}>
                <button type="button" onClick={this.addBtnClick} className="btn btn-primary btn-sm btn-block">
                    新增
                </button>
                </div>
                <div className ="col-md-2" style={{width:'12%' ,margin:'0px 0px 0px -18px'}}>
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
            <div className="col-md-12 ">
                <div className="col-md-1">
                    
                </div>
                <div className="col-md-9">
                    {btns}
                    <div className="col-md-12 row mt10">
                            {
                                deleteModeFlag?<label  className="col-md-1 pn"></label>:null
                            }
                            {
                                this.props.inputData.flag?<label className="col-md-2 ">选择规则集</label>:null
                            }
                            <label className="col-md-3 pn">实体类型</label>
                            <label className="col-md-4 ">属性(多选)</label>
                            <label className={deleteModeFlag ? "col-md-2 pn" : "col-md-3 pn"}>实体名称</label>
                    </div>
                    {
                    _.map(selectedData,_.bind(function(itemData,index){
                    return (<div className={deleteModeFlag? "col-md-12 form-group pn" :"col-md-12 form-group "} key={index}>
                        {
                            deleteModeFlag?<button type="button" onClick={deleteBtnClick} data-index={index} className="col-md-1 hide-show btn btn-danger" >-</button>:null
                        }
                        {
                            this.props.inputData.flag?<div className="col-md-2 ">
                                <MultiSelect onChange={handleRuleSelectedItem}
                                updateData={true}
                                identity={{index: index,flagItem:"ruleItem"}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '99%',
                                    allSelectedText: '全选',
                                }}
                                data={
                                        _.map(this.props.inputData.ruleData,function(item,indexNum)
                                        {
                                            return {
                                                label: item.caption,
                                                title: item.caption,
                                                value: item.caption,
                                                selected: itemData.rule == item.caption
                                            }
                                        })
                                }/>
                        </div>:null
                        }
                        
                        <div className="col-md-3 pn">
                                <MultiSelect onChange={handleEntitySelectedItem}
                                updateData={true}
                                identity={{index: index}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '100%',
                                    enableFiltering: true,
                                    allSelectedText: '全选',
                                    buttonClass:'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50'
                                }}
                                data={
                                        _.map(this.props.inputData.entityItems,function(item,indexNum)
                                        {
                                            return {
                                                label: item.entityTypeName,
                                                title: item.keyPropertyId,
                                                value: item.entityTypeId,
                                                selected: itemData.entityType == item.entityTypeId
                                            }
                                        })
                                }/>
                        </div>
                        <div className="col-md-4 ">
                            <MultiSelect multiple="multiple" onChange={handlePropSelectedItem}
                            updateData={true}
                            identity={{index: index,flagItem:"propertyName"}}
                                config={{
                                maxHeight: 250,
                                buttonWidth: '100%',
                                nonSelectedText: '请选择',
                                nSelectedText: '项选中',
                                allSelectedText: '全选',
                                enableFiltering: true,
                            }}
                                data={
                                    _.map(this.props.inputData.propRuleNames,function(item,indexNum)
                                    {
                                        return {
                                            label: item.propName,
                                            title: item.propId,
                                            value: item.propName,
                                            selected: _.contains(itemData.prop,item.propName) 
                                        }
                                    })
                            }/>
                        </div> 
                        <div className={deleteModeFlag ? "col-md-2 pn admin-form" : "col-md-3 pn admin-form"}>
                            <input  data-index={index} type="text" 
                                value={itemData.entityRuleName}  
                                onChange={handleEntityNameValueChanged} className="gui-input" 
                                placeholder="实体名称">
                            </input>
                        </div>
                        </div>)
                    },this))
                    }
                </div>
                <div className="col-md-2">
                    <div className="col-md-12 mt50">
                        <label className="text-danger mn">提示:</label>
                        <p>该步骤条件不许为空,若为空请点击新增按钮以增加条件</p> 
                        <p>此页面为设置实体页面,每一个实体都有一些必须的属性,这些必须的属性已默认选中,且不支持去除</p>
                    </div>
                </div>
            </div>
            )
    }
});

function getPropRuleNames(getThirdState){
    var propRuleNames = [];
    _.map(getThirdState, function(propItem,index){
        propRuleNames.push({
            propId:propItem.propid,
            propName:propItem.propRuleName
        });
    })

    var thirdPropNames = _.pluck(propRuleNames,"propName");
    if(_stateData.length > 0){
        _.map(_stateData,function(dataInfo){
            if(dataInfo.keyProp.length > 0){
                for(var i=0;i<= dataInfo.keyProp.length;i++){
                    if(dataInfo.keyProp[i]){
                        if(!_.contains(thirdPropNames,dataInfo.keyProp[i].propName)){
                            dataInfo.keyProp.splice(i,1);
                            i==0 ? i=-1 : i--;
                        }
                    }
                }
            }

            if(dataInfo.prop.length > 0){
                for(var j=0;j<=dataInfo.prop.length;j++){
                    if(dataInfo.prop[j]){
                        if(!_.contains(thirdPropNames,dataInfo.prop[j])){
                            dataInfo.prop.splice(j,1);
                            j==0 ? j=-1 : j--;
                        }
                    }
                }
            }
        })
    }
    return propRuleNames;
}

function getSelectedEntitys(entityType,getThirdState){
    var entitysId = getThirdState[0].selectedEntitysId;
    var selectedEntitys = [];
    _.map(entityType,function(entityItem){
        if(_.contains(entitysId,entityItem.entityTypeId)){
            selectedEntitys.push(entityItem);
        }
    })
    return selectedEntitys;
}

module.exports.getSelectedState = function(){
    return _stateData;
}

module.exports.setInitSelectedState = function(){
    _stateData = [];
}

module.exports.render = function(container,flag,ruleData,entityType,getThirdState) {
    var propNames = getPropRuleNames(getThirdState);
    var selectedEntitys = getSelectedEntitys(entityType,getThirdState);
    var data = {
        flag:flag,
        ruleData:ruleData,
        entityItems:selectedEntitys,
        propRuleNames:propNames,
    };

    ReactDOM.render(<ShowForthPartContent inputData={data}/>, container);
}

module.exports.renderForth = function(container,flag,ruleData,entityType,getThirdState,initState) {
    var propNames = getPropRuleNames(getThirdState);
    var selectedEntitys = getSelectedEntitys(entityType,getThirdState);
    var data = {
        flag:flag,
        ruleData:ruleData,
        entityItems:selectedEntitys,
        propRuleNames:propNames,
    };

    if(initState.length > 0){
        _stateData = [];
        $.extend(true,_stateData,initState);
    }else{
        _stateData = [];
        _consFlag = true;
    }
    ReactDOM.render(<ShowForthPartContent inputData={data}/>, container);
}