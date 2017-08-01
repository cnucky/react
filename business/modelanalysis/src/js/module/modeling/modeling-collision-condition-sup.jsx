var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var _ = require('underscore');
var MultiSelect = require('widget/multiselect');
require('../../widget/collision-condition.less');
var OPERATIONS = require('./operations');
var Notify = require('nova-notify');
var tagmanager = require('utility/tagmanager/tagmanager');
var utils = require("nova-utils");
var Provider = require('widget/i18n-provider');

var inputData;
var taskType;
var semanticDef;
var fieldsData;
var selectedSematicId;
var sematicMap;//存放自定义语义
var semanticId = 1;
var conditionCount = 2;
var collisionMax = 2;

var CollisionSemantic = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    handleSelectSemantic: function(item, option, checked, select) {
        if(checked)
        {
            this.props.onChange(parseInt(option.val()),true);
        }
        else
        {
            this.props.onChange(parseInt(option.val()),false);
        }
    },
    handleAddSemantic :function(event){
        var {i18n} = this.context;
        var new_semantic = $("#self-semantic").val();//新语义的值
        new_semantic = new_semantic.trim();
        if (new_semantic == "") {
            Notify.show({
                title: i18n.t("warning.please-enter-customize-semantic"),
                type: 'warning'
            });
        }else if(!utils.checkValidName(new_semantic)){
            Notify.show({
                title: i18n.t("warning.the-input-is-invalid"),
                type: 'warning'
            });
        }else {
            $("#self-semantic").val("")
            var isContain = false;

            //自定义标签区域的初始化在renderMixed方法中
            _.each(sematicMap, function(value, key) {
                if (value && value.name == new_semantic) {
                    isContain = true;
                }
            });
            if(!isContain){
                var existSematic = _.find(semanticDef, function(sitem) {
                    return sitem.semanticName == new_semantic;
                });
                if(existSematic){
                    isContain = true;
                }
            }
            if(!isContain){ //只有新语义会被添加
                let new_id = semanticId++;//新语义的随机id，因为tagmanager的id只支持纯数据
                let semantic = new Object();
                semantic.name = new_semantic;
                semantic.id = -new_id;//约定：自定义语义id为负数，与预设语义区分
                sematicMap[new_id] = semantic;
                this.props.onChange(semantic.id,true);
                //更新
                $('#semanticmanager').tagsManager('empty');
                _.each(sematicMap, function(value, key) {
                    if (value) {
                        $('#semanticmanager').tagsManager('pushTag', value.name, false, Number.parseInt(key, 10));
                    }
                });
                $('#show-semantic').removeClass('hidden');
            }else{
                Notify.show({
                    title: i18n.t("warning.customize-semantic-is-duplicate"),
                    type: 'warning'
                });
            }
        }
    },
    render: function() {
        var {i18n} = this.context;
        var semantic = this.props.semantic;
        var semanticId = this.props.semanticId;
        return (
            <div>
                <div className="form-group">
                    <label className="col-md-3 control-label no-padding-left">{i18n.t("collision-condition.collision-semantics")}</label>
                    <div className="col-md-6">
                    {
                        <MultiSelect config={{
                            nonSelectedText: i18n.t("collision-condition.none-selected-text"),
                            nSelectedText: i18n.t("collision-condition.n-selected-text"),
                            allSelectedText: i18n.t("collision-condition.all-selected")}}
                            updateData={true} onChange={this.handleSelectSemantic} multiple="multiple"
                        data={_.map(semantic, function(item) {
                            return {
                                label: item.semanticName,
                                title: item.semanticName,
                                value: item.semanticId,
                                selected: _.findIndex(semanticId, function(id) {
                                    return id == item.semanticId;
                                }) >= 0
                            }
                        })
                        }/>
                    }
                    </div>
                    <div className="col-md-3">
                        <a className="control-label section-toggle" id="self-controller" data-toggle="collapse" href="#selfseman-panle" aria-controls="selfseman-panle" aria-expanded="false">{i18n.t("collision-condition.customize")}</a>
                    </div>
                </div>
                <div className="collapse" id="selfseman-panle">
                     <div className="form-group">
                            <label className="col-md-3 control-label no-padding-left">{i18n.t("collision-condition.customize-semantics")}</label>
                            <div className="col-md-6">
                                <input className="form-control" id="self-semantic" type="text"/>
                            </div>
                            <div className="col-md-3">
                                <button type="button" className="btn btn-primary mnw50" onClick={this.handleAddSemantic}>{i18n.t("add-btn")}</button>
                            </div>
                    </div>
                </div>
                <div className="form-group hidden" id="show-semantic">
                        <label className="col-md-3 control-label no-padding-left">{i18n.t("collision-condition.added-semantics")}</label>
                        <div className="hidden">
                            <input type="hidden" id="semanticmanager" className="form-control tm-input"/>
                        </div>
                        <div className="col-md-7">
                            <div id="collision-semantic-tag"></div>
                        </div>
                </div>
                <hr className="alt litmargin"/>
            </div>)
    }
});

var CollisionFields = React.createClass({
    contextTypes: {
        i18n: React.PropTypes.object
    },
    getInitialState: function() {
        return {
            conditionCount: this.props.conditionCount
        };
    },
    handleNum: function(e){
        conditionCount = parseFloat(e.target.value,10);
        this.setState({
            conditionCount: conditionCount
        });
    },
    handleSelectField: function(selectedfield, option, checked, select) {
        if (checked) {
            var selected = option.val();
            var index = _.findIndex(selectedfield.field, function(fieldname) {
                return fieldname == selected;
            });
            if(index<0){
                selectedfield.field.push(selected);
            }
        } else {
            selectedfield.field.splice(_.indexOf(selectedfield.field, option.val()), 1);
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
    updateSemanticFields: function(item,selectedfield,semanticId) {
        if (semanticId) {
            var index = _.findIndex(item.semantic, function(semantic) {
                return semantic.semanticId == semanticId;
            });
            if (index >= 0 && _.isEmpty(selectedfield.field)) {
                var tmp = item.semantic[index];
                _.each(tmp.fieldList, function(field) {
                    selectedfield.field.push(field.fieldName);
                });
                item.semantic.splice(index, 1);
                item.semantic.unshift(tmp);
                return true;
            }
        }
        return false;
    },
    render: function() {
        var {i18n} = this.context;
        if (!_.isEmpty(this.props.fieldsData) && !_.isEmpty(this.props.semanticId)) {
            var addon;
            var handleSelectField = this.handleSelectField;
            var updateSemanticFields = this.updateSemanticFields;
            var semanticId = this.props.semanticId;  //选中的语义属性
            var fieldsData = this.props.fieldsData;
            _.map(fieldsData,function(item){
                if(!item.selectedFields){
                    item.selectedFields = [];
                    _.map(semanticId,function(sitem){
                        item.selectedFields.push({codeUsage:sitem , field :[]});
                    });
                }
            });

            if (this.props.taskType == OPERATIONS.DIFFERENCE) { //差集分析
                addon = (<div>
                <div className="form-group datasource-addon">
                    <label htmlFor="collision-field" className="col-md-3 control-label no-padding-left">{i18n.t("collision-condition.other")}</label>
                    <div className="col-md-9">
                    </div>
                </div>
                <div className="section datasource-addon">
                <div className="form-group">
                    <label className="col-md-3 field-label no-padding-left">{i18n.t("collision-condition.first-set")}</label>
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
            }else if(this.props.taskType == OPERATIONS.INTERSECTION){ //交集分析
                var numMax = this.props.fieldsData.length;
                if(numMax < 2){numMax=2;}
                collisionMax = numMax;
                addon = (
                    <div>
                        <div className="form-group datasource-addon">
                            <label htmlFor="collision-field" className="col-md-3 control-label no-padding-left">{i18n.t("collision-condition.other")}</label>
                            <div className="col-md-9"></div>
                        </div>
                        <div className="form-group">
                            <label className="col-md-3 control-label no-padding-left">{i18n.t("collision-condition.collision-times")}</label>
                            <div className="col-md-6">
                                <input className="form-control" id="self-num" type="number" min="2" max={numMax} value={this.state.conditionCount} onChange={this.handleNum}/>
                            </div>
                            {
                                (numMax == 2)?
                                    (<span className="help-block fw500" style={{marginTop:"13px", fontSize: "6px"}}>
                                        {i18n.t("collision-condition.the-range-is")+" 2"}
                                    </span>):
                                    (<span className="help-block fw500" style={{marginTop:"13px", fontSize: "6px"}}>
                                        {i18n.t("collision-condition.the-range-is")+" 2~"+numMax}
                                     </span>
                                    )
                            }
                        </div>
                    </div>)
            }

            return (
                <div>
                    <div className="form-group datasource-fields">
                        <label htmlFor="collision-field" className="col-md-3 control-label no-padding-left">{i18n.t("collision-condition.condition")}</label>
                        <div className="col-md-9">
                        </div>
                    </div>
                    <div>
                    {
                        _.map(selectedSematicId, function(sitem, fIndex){
                            var selectedSematic = _.find(semanticDef, function(item) {
                                return item.semanticId == sitem;
                            });
                            var id;
                            var id_per;
                            var name;
                            if(selectedSematic == undefined)
                            {
                                _.each(sematicMap, function(value, key) {
                                    if(value.id == sitem)
                                    {
                                        id = "section-"+value.id;
                                        id_per = "#section-"+value.id;
                                        name = value.name;
                                    }
                                });

                            }
                            else
                            {
                                id="section-"+selectedSematic.semanticId;
                                id_per="#section-"+selectedSematic.semanticId;
                                name = selectedSematic.semanticName;
                            }
                            return(
                            <div className="section datasource-fields" key={fIndex}>
                                <div className="form-group">
                                    <label className="control-label" style={{fontWeight:"500"}}>{name}</label>
                                    <a className="control-label section-toggle fields-control" data-toggle="collapse" href={id_per} aria-expanded="true" aria-controls={id}>
                                    {i18n.t("collision-condition.fold")}</a>
                                    <hr className="alt litmargin"/>
                                 </div>
                                 <div id={id} className="collapse in">
                            {
                                _.map(fieldsData, function(item, sIndex){
                                    var selectedField = _.find(item.selectedFields,function(selectedF){
                                            return selectedF.codeUsage == sitem;
                                        });
                                    var needUpdateField = updateSemanticFields(item, selectedField, sitem);
                                    return (
                                    <div className="form-group" key={sIndex}>
                                        <div className="col-md-4 no-padding-left">
                                            <label className="field-label" style={{maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis'}} title={item.caption}>{item.caption}</label>
                                        </div>
                                        <div className="col-md-8">
                                            <MultiSelect multiple="multiple" identity={selectedField} updateData={true} onChange={handleSelectField}
                                            config={{
                                                maxHeight: 250,
                                                enableFiltering: true,
                                                enableClickableOptGroups: false,
                                                nonSelectedText: i18n.t("collision-condition.none-selected-text"),
                                                nSelectedText: i18n.t("collision-condition.n-selected-text"),
                                                allSelectedText: i18n.t("collision-condition.all-selected"),
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
                                                            selected: _.contains(selectedField.field, field.fieldName)
                                                        };
                                                    });
                                                    return group;
                                                })
                                            }
                                            />
                                        </div>
                                    </div>
                                    )
                                })
                            }
                            </div>
                            </div>
                            )
                        })
                    }
                    {addon}
                    </div>
                </div>
            )
        }
        return (<div></div>);
    }
});


var CollisionCondition = React.createClass({
    getInitialState: function() {
        var semanticId = !this.props.semanticId ? selectedSematicId : undefined;
        //this.updateFieldsData(semanticId);
        return {
            semanticId: selectedSematicId,
            fieldsData: this.props.fieldsData,
        };
    },
    onSemanticChange: function(semanticId , checked) {
        if(semanticId == undefined)
        {
            return;
        }
        if(checked)
        {
            selectedSematicId.push(semanticId);
        }
        else
        {
            selectedSematicId.splice(_.indexOf(selectedSematicId, semanticId), 1);
        }
        var fieldData = this.props.fieldsData;
        _.map(fieldData,function(item){
                if(!item.selectedFields){
                    item.selectedFields = [];
                    _.map(selectedSematicId,function(sitem){
                        item.selectedFields.push({codeUsage:sitem , field :[]});
                    });
                }else{
                    let tmpFields = [];
                    _.map(selectedSematicId,function(sitem){
                        var indeX = _.findIndex(item.selectedFields, function(fitem) {
                            return fitem.codeUsage == sitem;
                        });
                        if(indeX<0){
                            tmpFields.push({codeUsage:sitem , field :[]});
                        }else{
                            tmpFields.push({codeUsage:item.selectedFields[indeX].codeUsage,field:item.selectedFields[indeX].field});
                        }
                    });
                    item.selectedFields = tmpFields;
                }
            });
        this.setState({
            semanticId: selectedSematicId,
            fieldsData: fieldData,
        });
    },
    componentDidMount:function(){
        var initSemTag = this.initSemTag;
        initSemTag();
    },
    onModeChange:function(){
        this.props.onChange();
    },
    initSemTag:function(){//初始化自定义语义tag区域
        var onSemanticChange = this.onSemanticChange;
        $('#semanticmanager').tagsManager({
            tagsContainer: '#collision-semantic-tag',
            externalTagId: true,
            tagClass: 'tm-tag-info'
        });

        $('#semanticmanager').on('tm:spliced', function(e, tag, tagId) {
            // 这里实现删除自定义标签时候的操作
            var idSelected;
            _.each(sematicMap, function(value, key) {
                if (value && key == tagId) { //删除属性
                    idSelected = value.id;
                    delete sematicMap[key];
                }
            });
            if(_.isEmpty(sematicMap)){//自定义标签已全部删除
                $('#show-semantic').addClass('hidden');
            }
            onSemanticChange(idSelected,false);
        });
        _.each(sematicMap, function(value, key) {//绘制自定义标签
            if (value) {
                $('#semanticmanager').tagsManager('pushTag', value.name, false, Number.parseInt(key, 10));
                $('#show-semantic').removeClass('hidden');
            }
        });
    },
    render: function() {
        return (
            <div className="form-horizontal">
            <CollisionSemantic semantic={this.props.semantic} onChange={this.onSemanticChange} semanticId={this.state.semanticId}/>
            <CollisionFields fieldsData={this.state.fieldsData} conditionCount={this.props.conditionCount} taskType={this.props.taskType} semanticId={this.state.semanticId}/>
            </div>
            )
    }
});

module.exports.render = function(container, _semanticDef, _taskType, _inputData,selectMode) {
    inputData = _inputData;
    taskType = _taskType;
    sematicMap = new Object();
    conditionCount = inputData.output ? inputData.output.collisionCount : inputData.input.length

    var srcDataTypes = inputData.output ? inputData.output.srcDataTypes : null;
    var hasOutput = inputData.output ? true : false;

    var hasFirstItem = false;

    var _fieldsData = _.map(inputData.input, function(inputItem, index) {
        var srcData = srcDataTypes ? _.find(srcDataTypes, src => {
            return src.inputNode === inputItem.nodeId
        }) : null;

        var semantics = {};
        var allFields = [];
        _.each(inputItem.outputColumnDescList, function(item) {
            var semantic = semantics[item.codeUsage];
            if (!semantic) {
                semantics[item.codeUsage] = semantic = {
                    semanticId: item.codeUsage,
                    semanticName: item.codeUsage == 0 ? window.i18n.t("collision-condition.other") : item.semanticName,
                    fieldList: []
                };
            }
            semantic.fieldList.push({
                caption: item.displayName,
                fieldName: item.aliasName,
                columnType: item.columnType
            });
            allFields.push({
                fieldName: item.aliasName,
                fieldType: item.columnType,
                displayName: item.displayName
            });
        });
        semantics = _.map(semantics, function(item) {
            return item;
        });
        semantics = _.sortBy(semantics,  function(item) {
            return - parseInt(item.semanticId);
        });
        return {
            key: inputItem.nodeId,
            caption: inputItem.title,
            semantic: semantics,
            selectedFields: srcData ? srcData.fieldList : null,
            index: srcData ? srcData.index : 0,
            allFields: allFields
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
    selectedSematicId = [];

    if (hasOutput) {
        let outputColumnList = inputData.output.outputColumnDescList;
        _.each(outputColumnList,function(column){
            selectedSematicId.push(column.codeUsage);
            let index = _.findIndex(semanticDef,function(semantic){
               return semantic.semanticId == column.codeUsage;
            });
            if(index<0){
                while(semanticId<=(-column.codeUsage)){
                    semanticId++;
                }
                let new_id = semanticId++;
                let semantic = new Object();
                semantic.name = column.displayName;
                semantic.id = column.codeUsage;
                sematicMap[new_id] = semantic;
            }
        });
    } else {
        selectedSematicId.push(semanticDef[0].semanticId);
    }

    var modeChange = function(){
        selectMode("high");
    }
    ReactDOM.render(<Provider.default><CollisionCondition onChange = {modeChange} conditionCount={conditionCount} semantic={semanticDef} semanticId={selectedSematicId} fieldsData={fieldsData} taskType={taskType}/></Provider.default>, container);
    //控制条件模块
    $(document).on("click",".fields-control",function() {
        if ($(this).html() == "收起" || $(this).html() == "Fold") {
            $(this).html(window.i18n.t("collision-condition.unfold"));
        } else {
            $(this).html(window.i18n.t("collision-condition.fold"));
        }
    });
    $(document).on("click","#self-controller",function() {
        if ($(this).html() == "自定义" || $(this).html() == "Customize") {
            $(this).html(window.i18n.t("collision-condition.fold"));
        } else {
            $(this).html(window.i18n.t("collision-condition.customize"));
        }
    });
};

function isTypeEqual(type1, type2) {
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

function isDifferentType(newField, selectedFields){
    return _.find(selectedFields, function(item){
        return !isTypeEqual(item.fieldType, newField.fieldType);
    })
}

module.exports.constructTaskDetail = function() {
    if(taskType == OPERATIONS.INTERSECTION){
        if(!Number.isInteger(conditionCount)){
            return {message: window.i18n.t("collision-condition.collision-times-not-integer")};
        }else if(conditionCount > collisionMax){
            return {message: window.i18n.t("collision-condition.collision-times-no-more",{collisionMax :collisionMax})};
        }else if(conditionCount < 2){
            return {message: window.i18n.t("collision-condition.collision-times-no-less")};
        }
    }
    var taskDetail = {
        srcDataTypes: [],
        outputColumnDescList: [],
        collisionCount: conditionCount
    };
    var selectedSematic = _.map(selectedSematicId, function(id) {
        return _.find(semanticDef, item=>{
            return item.semanticId == id;
        });
    });
    var noPass = false;
    var nodeInfo;
    var differentTypeField, comparedField, allFields = [];
    _.each(fieldsData, function(item) {
        if(!_.isEmpty(item.selectedFields)) {
            if(!differentTypeField){
                _.each(item.selectedFields,fitem=>{
                    if(_.isEmpty(fitem.field)){
                        noPass = true;
                        if (!nodeInfo) {
                            nodeInfo = {};
                            nodeInfo['codeUsage'] = fitem.codeUsage;
                            nodeInfo['caption'] = item.caption;
                        }
                    }
                    _.each(fitem.field,field=>{
                        var origField = _.find(item.allFields, function (iitem) {
                                return iitem.fieldName == field;
                        });
                        comparedField = isDifferentType(origField, allFields);
                        if (comparedField) {
                            // differentTypeField = origField;
                        }
                        allFields.push(origField);
                    });
                });
            }
            taskDetail.srcDataTypes.push({
                index: item.index || 0,
                inputNode: item.key,
                fieldList: item.selectedFields
            });
        }

    });
    if(noPass) {
         var semantic = _.find(selectedSematic,sitem=>{
            return sitem.semanticId == nodeInfo.codeUsage;
        });
        return {message: window.i18n.t("collision-condition.conditions-have-not-been-completed",{semanticName: semantic.semanticName,caption: nodeInfo.caption})};
    }
    // if (differentTypeField) {
    //     return {
    //         message: '"' + differentTypeField.displayName + '"' + window.i18n.t("warning.and") + '"' + comparedField.displayName + '"' + window.i18n.t("warning.types-are-inconsistent")
    //     }
    // }
    _.each(selectedSematic,function(sitem){
        taskDetail.outputColumnDescList.push({
            displayName: sitem.semanticName||"",
            codeUsage: sitem.semanticId
        });
    });
    _.each(sematicMap,function(value,key){
        taskDetail.outputColumnDescList.push({
            displayName:value.name||"",
            codeUsage:value.id
        });
    });
    return {
        detail: taskDetail
    };
};
