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
var _count = 0;
function dapType(type){
    var returnType = "";
    type = type.toUpperCase();
    switch(type){
        case "STRING" :
            returnType = "string";
            break;
        case "NUMBER":
            returnType = "decimal";
            break;
        case "DECIMAL":
            returnType = "decimal";
            break;
        case "DATE":
            returnType = "date";
            break;
        case "DATETIME":
            returnType = "date";
            break;
        case "FILE_LINK":
            returnType = "file_link";
            break;
    }
    return returnType;
}

function getKeyProps(returnProps,insertProps){
    _.map(insertProps,function(itemProp,index1){
        if(!_.contains(returnProps,itemProp)){
            returnProps.push(itemProp);
        }
    })
    return returnProps;
}

var ShowThirdPartContent = React.createClass({
    getInitialState: function(){
        var inputData = this.props.inputData;
        var selectedProp = inputData.propertyData[0];
        var selectedFields = [];
        var keyProps = [];
        $.extend(true,selectedFields,inputData.fieldData);
        // _.map(inputData.fieldData,function(fieldItem,index){
        //     var propType = dapType(selectedProp.propertyType);
        //     var temp = (fieldItem.type).toLowerCase();
        //     if(propType == "string"){
        //         if(fieldItem.codeTag == 1 || propType == temp){
        //             selectedFields.push(fieldItem);
        //         }
        //     }else{
        //         if(fieldItem.codeTag != 1 && propType == temp){
        //             selectedFields.push(fieldItem);
        //         }
        //     }
        // })
        var selectedDataItem =[];
        selectedDataItem.push({
            selectedEntitysId:[],
            selectedEntitysKeyPropsName:[],
            selectedEntitysKeyPropsId:[],
            propRuleName:selectedProp.propertyName,
            propid:parseInt(selectedProp.propertyId),
            proptype:selectedProp.propertyType,
            selectedFields:selectedFields,
            field:selectedFields[0].name
        });
        if(_stateData.length <=0){
            $.extend(_stateData,selectedDataItem);
        }
        $.extend(true,_tempData,selectedDataItem);
        _count = _count + 1; 
        return {
            selectedData:selectedDataItem,
        }
    },
    // componentWillReceiveProps: function(nextProps) {
    //     this.setState({selectedData:nextProps.data});
    // },
    handleSelectedEntitys:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        var inputData = this.props.inputData;
        var value = parseInt(option.val());
        var keyPropsName = [];
        var keyPropsId = [];
        _.map(selectedData,function(selectedItem,index){
            if(checked){
                selectedItem.selectedEntitysId.push(value);
            }else{
                var deleteIndex;
                _.map(selectedItem.selectedEntitysId,function(itemProp,indexNum){
                        if(itemProp == value){
                            deleteIndex = indexNum;
                        }
                })
                selectedItem.selectedEntitysId.splice(deleteIndex,1);
            }            
        })

        _.map(inputData.entityType,function(entityItem,entityIndex){
            if(_.contains(selectedData[0].selectedEntitysId,entityItem.entityTypeId)){
                var keyProp = entityItem.keyPropertyId;
                keyPropsId = getKeyProps(keyPropsId,keyProp);
            }
        })

        _.map(inputData.propertyData,function(propItem,propIndex){
             if(_.contains(keyPropsId,propItem.propertyId)){
                keyPropsName.push(propItem.propertyName);
             }
        })

        _.map(selectedData,function(data,dex){
            data.selectedEntitysKeyPropsName = [];
            data.selectedEntitysKeyPropsId = [];
            data.selectedEntitysKeyPropsName = keyPropsName;
            data.selectedEntitysKeyPropsId = keyPropsId;
        })

        
        this.update(selectedData);

    },
    handlePropertySelectedItem:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        var value = parseInt(option.val());
        var selectedFields = [];
        // _.map(this.props.inputData.fieldData,function(fieldItem,index){
        //     var propType = dapType(option.attr('title'));
        //     var temp = (fieldItem.type).toLowerCase();
        //     if(propType == "string"){
        //         if(fieldItem.codeTag == 1 || propType == temp){
        //             selectedFields.push(fieldItem);
        //         }
        //     }else{
        //         if(fieldItem.codeTag != 1 && propType == temp){
        //             selectedFields.push(fieldItem);
        //         }
        //     }
        // })
        $.extend(true,selectedFields,this.props.inputData.fieldData);
        if(selectedFields.length > 0){
            selectedData[item.index].selectedFields = selectedFields;
            selectedData[item.index].propid = value;
            selectedData[item.index].proptype = option.attr('title');
            selectedData[item.index].propRuleName = option.attr('label');
            this.update(selectedData);
        }else{
            Notify.show({
                title: "与属性类型相同的字段不存在，请重新选择!",
                type: "warning"
            });
        }
    },
    handleFieldSelectedItem:function(item, option, checked, select){
        var selectedData = this.state.selectedData;
        var value = option.val();
        selectedData[item.index].field = value;
        this.update(selectedData);
    },
    handlePropNameValueChanged:function(e){
        var selectedData = this.state.selectedData;
        var index = $(e.currentTarget).attr('data-index');
        this.state.selectedData[index].propRuleName = e.target.value;
        this.update(this.state.selectedData);
    },
    update: function(state) {
        _stateData = [];
        $.extend(true,_stateData,state);
        this.setState({selectedData:state});
    },
    addBtnClick: function(e) {
        var inputData = this.props.inputData;
        var selectedData = this.state.selectedData;
        var selectedProp = inputData.propertyData[0];
        var selectedFields = [];
        var keyProps = [];
        // _.map(inputData.fieldData,function(fieldItem,index){
        //     var propType = dapType(selectedProp.propertyType);
        //     if(propType == fieldItem.type){
        //         selectedFields.push(fieldItem);
        //     }
        // })
        $.extend(true,selectedFields,inputData.fieldData);
        selectedData.push({
            selectedEntitysId:[],
            selectedEntitysKeyPropsName:[],
            selectedEntitysKeyPropsId:[],
            propRuleName:selectedProp.propertyName + _count,
            propid:parseInt(selectedProp.propertyId),
            proptype:selectedProp.propertyType,
            selectedFields:inputData.fieldData,
            field:selectedFields[0].name
        });
        _count = _count +1;
        this.update(selectedData);
    },
    toggleDeleteMode: function() {
        this.state.deleteMode = !this.state.deleteMode;
        this.setState({selectedData:this.state.selectedData});
    },
    deleteBtnClick: function(e) {
        if(this.state.selectedData.length > 1) {
            var index = $(e.currentTarget).attr('data-index');
            this.state.selectedData.splice(index, 1);
        }
        _stateData = [];
        $.extend(_stateData,this.state.selectedData);
        this.setState({selectedData:this.state.selectedData});
    },
    render:function(){
        var selectedData = this.state.selectedData;
        if(_consFlag){
            var len = selectedData.length;
            selectedData.splice(0,len);
            $.extend(true,selectedData,_tempData);
            _stateData = [];
            _consFlag = false;
        }else{
            $.extend(true,selectedData,_stateData);
            if(selectedData.length == 1){
                var fields = [];
                $.extend(true,fields,this.props.inputData.fieldData);
                selectedData[0].selectedFields = [];
                selectedData[0].selectedFields = fields;
            }
        }
        var deleteModeFlag = this.state.deleteMode;
        var deleteBtnClick = this.deleteBtnClick;
        var handleSelectedEntitys = this.handleSelectedEntitys;
        var handleEntitySelectedItem = this.handleEntitySelectedItem;
        var handlePropertySelectedItem = this.handlePropertySelectedItem;
        var handlePropNameValueChanged = this.handlePropNameValueChanged;
        var handleFieldSelectedItem = this.handleFieldSelectedItem;
        var btns = (<div className={this.props.inputData.flag?"col-md-12 row mt10":"col-md-12 row mt10 pn"} style={{align:'right'}}>
                <div className = "col-md-2">
                <button type="button" onClick={this.addBtnClick} className="btn btn-primary btn-sm btn-block">
                    新增
                </button>
                </div>
                <div className ="col-md-2" style={{margin:'0px 0px 0px -18px'}}>
                <button type="button" onClick={this.toggleDeleteMode} className="btn btn-danger btn-sm btn-block">
                    删除
                </button>
                </div>
                </div>
            )
        if(this.state.deleteMode) {
            btns = (<div className={this.props.inputData.flag?"col-md-12 row mt10":"col-md-12 row mt10 pn"} style={{align:'right'}}>
                <div className ="col-md-2">
                <button type="button" onClick={this.toggleDeleteMode} className="btn btn-system btn-sm btn-block">
                    完成
                </button>
                </div>
                </div>
            )
        }

        return (
            <div className="col-md-12">
                <div className="col-md-3">
                    <div className="col-md-12 row mt10">
                        <label className="col-md-6 pn"></label>
                        <label className="col-md-6 pn"></label>
                    </div>
                    
                    <div className="col-md-12 row mt40">
                        <label className="col-md-6 pn">选择操作的实体</label>
                        <label className="col-md-6 ">必配的属性</label>
                    </div>
                    <div className="col-md-12 form-group">
                        <div className="col-md-6 pn">
                            <MultiSelect multiple="multiple" onChange={handleSelectedEntitys}
                            updateData={true}
                            identity={{flagItem:"propertyName"}}
                                config={{
                                maxHeight: 250,
                                minWidth:450,
                                buttonWidth: '99%',
                                allowClear:true,
                                enableFiltering: true,
                                enableClickableOptGroups: true,
                                nonSelectedText: "选择实体",
                                nSelectedText: "个已选择",
                                allSelectedText: "全选",
                                numberDisplayed: 2
                            }}
                                data={
                                    _.map(this.props.inputData.entityType,function(item,indexNum)
                                    {
                                        return {
                                            label: item.entityTypeName,
                                            title: item.keyPropertyId,
                                            value: item.entityTypeId,
                                            selected: selectedData[0].selectedEntitysId.length > 0?_.contains(selectedData[0].selectedEntitysId,item.entityTypeId):false
                                        }
                                    })
                                }/>
                        </div>
                        <div className = "col-md-6 pn">
                            {selectedData[0].selectedEntitysKeyPropsName.length >0?
                                _.map(selectedData[0].selectedEntitysKeyPropsName,function(propsName,dexNum){
                                    return (<label className = "text-danger" style={{margin:'0px 0px 0px 10px' ,fontSize: "18px", fontWeight: 'bold'}} key={dexNum}>{propsName}</label>)
                                }):null
                            }
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    {btns}
                    <div className="col-md-12 row mt10">
                            {
                                deleteModeFlag?<label  className="col-md-1"></label>:null
                            }
                            <label className="col-md-4 pn">选择属性</label>
                            <label className="col-md-4 pn">选择字段</label>
                            <label className={deleteModeFlag ? "col-md-3 pn" : "col-md-4 pn"}>填写属性名</label>
                    </div>
                    {
                    _.map(selectedData,_.bind(function(itemData,index){
                    return (<div className="col-md-12 form-group" key={index}>
                        {
                            deleteModeFlag?<button type="button" onClick={deleteBtnClick} data-index={index} className="col-md-1 hide-show btn btn-danger" >-</button>:null
                        }
                        <div className="col-md-4 pn">
                                <MultiSelect onChange={handlePropertySelectedItem}
                                updateData={true}
                                identity={{index: index,flagItem:"propertyItem"}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '99%',
                                    enableFiltering: true,
                                    buttonClass:'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50'
                                }}
                                data={
                                        _.map(this.props.inputData.propertyData,function(item,indexNum)
                                        {
                                            return {
                                                label: item.propertyName,
                                                title: item.propertyType,
                                                value: item.propertyId,
                                                selected: itemData.propid === item.propertyId
                                            }
                                        })
                                }/>
                        </div>
                        <div className="col-md-4 pn">
                                <MultiSelect onChange={handleFieldSelectedItem}
                                updateData={true}
                                identity={{index: index,flagItem:"fieldItem"}}
                                    config={{
                                    maxHeight: 250,
                                    buttonWidth: '99%',
                                    enableFiltering: true,
                                    selectAllText:false,
                                    buttonClass:'multiselect dropdown-toggle btn btn-system fw600 fs14 mnw50'
                                }}
                                data={
                                        _.map(itemData.selectedFields,function(item,indexNum)
                                        {
                                            return {
                                                label: item.caption,
                                                title: item.type,
                                                value: item.name,
                                                selected: itemData.field === item.name
                                            }
                                        })
                                }/>
                        </div>
                        <div className={deleteModeFlag ? "col-md-3 pn admin-form" : "col-md-4 pn admin-form"}>
                            <input  data-index={index} type="text" className="gui-input" 
                                value={itemData.propRuleName}  
                                onChange={handlePropNameValueChanged} 
                                placeholder="属性名">
                            </input>
                        </div>
                        </div>)
                    },this))
                    }
                </div>
                <div className="col-md-3">
                    <div className="col-md-12 pn row mt30">
                        <label className="text-danger mn">提示:</label>
                        <p>请先点选左侧的要操作的实体,之后会提示有哪些必配的属性</p> 
                        <p>必配的属性必须进行配置,否则进行不到下一步,此步骤为设置属性页面,属性跟字段类型须一致,输入框中的属性名不能重复</p> 
                    </div>
                </div>
            </div>
            )
    }
});

module.exports.getSelectedState = function(){
    return _stateData;
}

module.exports.setInitSelectedState = function(){
    _stateData = [];
}

module.exports.render = function(container,propertyData,fieldData,entityType) {
    var data = {
        propertyData:propertyData,
        fieldData:fieldData,
        entityType:entityType,
    };

    ReactDOM.render(<ShowThirdPartContent inputData={data}/>, container);
}

module.exports.renderThird = function(container,propertyData,fieldData,entityType,initState) {
    var data = {
        propertyData:propertyData,
        fieldData:fieldData,
        entityType:entityType,
    };

    if(initState.length > 0){
        $.extend(true,_stateData,initState);
    }else{
        _stateData = [];
        _consFlag = true;
    }

    ReactDOM.render(<ShowThirdPartContent inputData={data}/>, container);
}