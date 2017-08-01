var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var _ = require('underscore');
var Notify = require('nova-notify');
var tagmanager = require('./collision-tag-manager');
// require('bootstrap-multiselect');
var utils = require("nova-utils");
var MultiSelect = require('widget/multiselect');
require('./collision-condition.less');
var datasourcePanel = require('../../tpl/collision/datasource-panel');
var Dialog = require('nova-dialog');
var FieldFilter = require('./collision-filter-react');
var Provider = require('widget/i18n-provider');
var datasourceDialog = require('../../tpl/collision/datasource-dialog');
var uuid = require('node-uuid');

var OPERATIONS = require('../modeling/operations');

var taskType;
var semanticDef;
var fieldsData;
var selectedSematicId;
var condMap;//存放过滤条件
var sematicMap;//存放自定义语义
var dialogSelecetedDs = [];

var tagGenerateId = 0;
var self_semanticId = 1;

var collisionCount = 2;
var collisionMax = 2;

var TypeSelect = React.createClass({
    checkoutBenHandle: function() {
        this.props.onChange();
    },
    render:function(){
        var checkoutBenHandle = this.checkoutBenHandle;
        return (<button type="button" onClick={checkoutBenHandle} className="btn btn-default btn-sm pull-right">切换到普通模式</button>)
    }
});

var CollisionType = React.createClass({

    contextTypes:{i18n:React.PropTypes.object},

    handleSelectType: function(item, option, checked, select) {
        if (this.props.onChange && typeof this.props.onChange === 'function') {
            this.props.onChange(parseInt(option.val()));
        }
    },
    render: function() {
        var {i18n} = this.context;
        var type = [{
            label: "交集分析",
            value: 103,
            selected: this.props.type == 103
        }, {
            label: "并集分析",
            value: 104,
            selected: this.props.type == 104
        }, {
            label: "差集分析",
            value: 105,
            selected: this.props.type == 105
        }];
        return (
            <div>
                <div className="form-group">
                    <label className="col-md-3 control-label">{i18n.t('collisionType')}</label>
                        <div className="col-md-9">
                        {
                            <MultiSelect config={this.props.configType} updateData={true} onChange={this.handleSelectType} data={type}/>
                        }
                        </div>
                </div>
            </div>)
    }
});

var CollisionSemantic = React.createClass({

    contextTypes:{i18n:React.PropTypes.object},

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
        var new_semantic = $("#self-semantic").val();//新语义的值
        new_semantic = new_semantic.trim();
        if (new_semantic == "") {
            Notify.show({
                title: i18n.t("please-enter-customize-semantic"),
                type: 'warning'
            });
        }else if(!utils.checkValidName(new_semantic)){
            Notify.show({
                title: i18n.t("the-input-is-invalid"),
                type: 'warning'
            });
        }else {
            $("#self-semantic").val("");
            var isContain = false;

            //自定义标签区域的初始化在renderMixed方法中
            _.each(sematicMap, function(value, key) {
                if (value && value.name == new_semantic) {
                    isContain = true;
                }
                while(self_semanticId<=key){
                    self_semanticId++;
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
                let new_id = self_semanticId++;//新语义的随机id，因为tagmanager的id只支持纯数字
                let semantic = new Object();
                semantic.name = new_semantic;
                semantic.id = -new_id;
                sematicMap[new_id] = semantic;
                this.props.onChange(semantic.id,true);
                updateSemanticTags();//更新
            }else{
                Notify.show({
                    title: i18n.t("customize-semantic-is-duplicate"),
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
                    <label className="col-md-3 control-label">{i18n.t('collisionSemantic')}</label>
                    <div className="col-md-6">
                    {
                        <MultiSelect config={{
                            nonSelectedText: i18n.t("none-selected-text"),
                            nSelectedText: i18n.t("n-selected-text"),
                            allSelectedText: i18n.t("all-selected")}} updateData={true} onChange={this.handleSelectSemantic} multiple="multiple"
                        data={_.map(semantic, function(item) {
                            return {
                                label: item.semanticName,
                                title: item.semanticName,
                                value: item.semanticId,
                                selected: _.contains(semanticId,item.semanticId)
                            }
                        })
                        }/>
                    }
                    </div>
                    <div className="col-md-3">
                        <a className="control-label section-toggle" data-toggle="collapse" href="#selfseman-panle" aria-controls="selfseman-panle" aria-expanded="false">{i18n.t('custom')}</a>
                    </div>
                </div>
                <div className="collapse" id="selfseman-panle">
                    <div className="form-group">
                            <label className="col-md-3 control-label">{i18n.t('customSemantic')}</label>
                            <div className="col-md-6">
                                <input className="form-control" id="self-semantic" type="text"/>
                            </div>
                            <div className="col-md-3">
                                <button type="button" className="btn btn-primary mnw50" onClick={this.handleAddSemantic}>{i18n.t('add-button')}</button>
                            </div>
                    </div>
                </div>
                <div className="form-group hidden" id="show-semantic">
                        <label className="col-md-3 control-label">{i18n.t('semanticAdded')}</label>
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
})

var CollisionFields = React.createClass({

    contextTypes:{i18n:React.PropTypes.object},

    getInitialState: function() {
        return {
            collisionCount: collisionCount
        };
    },
    handleNum: function(e){
        collisionCount = parseFloat(e.target.value,10);
        this.setState({
            collisionCount: collisionCount
        });
    },
    handleSelectField: function(selectedfield, option, checked, select) {
        //console.log(checked);
        var selected = option.val();
        var index = _.findIndex(selectedfield.field, function(fieldname) {
            return fieldname == selected;
        });
        if (index < 0) {
            selectedfield.field.push(selected);
        } else {
            selectedfield.field.splice(index, 1);
        }
    },
    handleSelectFirst: function(item, option, checked, select) {
        var selectedKey = option.val();
        _.each(this.props.data, function(dataItem) {
            if (dataItem.key == selectedKey) {
                dataItem.index = -1;
            } else {
                dataItem.index = 0;
            }
        });
    },
    updateSemanticFields: function(item, selectedfield,semanticId) {
        if (semanticId) {
            var index = _.findIndex(item.semantic, function(semantic) {
                return semantic.semanticId == semanticId;
            });
            if (index >= 0&& _.isEmpty(selectedfield.field)) {
                var tmp = item.semantic[index];
                _.each(tmp.fieldList, function(field) {
                    selectedfield.field.push(field.fieldName);
                }.bind(this));
                item.semantic.splice(index, 1);
                item.semantic.unshift(tmp);
                return true;
            }
        }
        return false;
    },
    render: function() {
        var {i18n} = this.context;
        if (!_.isEmpty(this.props.data) && !_.isEmpty(this.props.semanticId)) {
            var addon;
            var updateSemanticFields = this.updateSemanticFields;
            var handleSelectField = this.handleSelectField;
            var semanticId = this.props.semanticId;  //选中的语义属性
            var data = this.props.data;  //数据源s
            _.map(data,function(item){
                if(!item.selectedFields){
                    item.selectedFields = [];
                    _.map(semanticId,function(sitem){
                        item.selectedFields.push({codeUsage:sitem , field :[]});
                    });
                }
            });
            if (this.props.taskType == 105) { //差集分析
                addon = (<div>
                <hr className="alt litmargin"/>
                <div className="form-group datasource-addon">
                    <label htmlFor="collision-field" className="col-md-3 control-label">{i18n.t('other')}</label>
                    <div className="col-md-9">
                    </div>
                </div>
                <div className="section datasource-addon">
                <div className="form-group">
                    <label className="col-md-3 field-label">{i18n.t('firstSet')}</label>
                    <div className="col-md-9">
                    <MultiSelect onChange={this.handleSelectFirst} data={
                        _.map(this.props.data, function(item) {
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
            }else if (this.props.taskType == 103) { //交集分析
                var numMax = data.length;
                if(numMax < 2){numMax=2;}
                collisionMax = numMax;
                addon = (
                    <div>
                        <hr className="alt litmargin"/>
                        <div className="form-group datasource-addon">
                            <label htmlFor="collision-field" className="col-md-3 control-label">{i18n.t('other')}</label>
                            <div className="col-md-9">
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-md-3 control-label">{i18n.t('collisionNumber')}</label>
                            <div className="col-md-6">
                                <input className="form-control" id="self-num" type="number" min="2" max={numMax} value={this.state.collisionCount} onChange={this.handleNum}/>
                            </div>
                            {
                                (numMax == 2)?
                                    (<span className="help-block fw500" style={{marginTop:"13px", fontSize: "6px"}}>
                                        {i18n.t("the-range-is")+" 2"}
                                    </span>):
                                    (<span className="help-block fw500" style={{marginTop:"13px", fontSize: "6px"}}>
                                        {i18n.t("the-range-is")+" 2~"+numMax}
                                     </span>
                                    )
                            }
                        </div>
                </div>)
            }

            return (
                <div>
                    <div className="form-group datasource-fields">
                        <label htmlFor="collision-field" className="col-md-3 control-label">{i18n.t('collisionCondition')}</label>
                        <div className="col-md-9">
                        </div>
                    </div>
                    <div>
                    {
                    	_.map(semanticId, function(sitem){
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
                    		<div className="section datasource-fields">
                                <div className="form-group">
                                    <label htmlFor="collision-field" className="control-label" style={{fontWeight:"500"}}>{name}</label>
                                    <a className="control-label section-toggle fields-control" data-toggle="collapse" href={id_per} aria-expanded="true" aria-controls={id}>
                                    收起</a>
                                    <hr className="alt litmargin"/>
                                 </div>
                                 <div id={id} className="collapse in">
                        		{
                        			_.map(data, function(item){
                                        var selectedField = _.find(item.selectedFields,function(selectedF){
                                            return selectedF.codeUsage == sitem;
                                        });
                                        var needUpdateField = updateSemanticFields(item,selectedField, sitem);
                        				return(
                        					<div className="form-group">
                        						<div className="col-md-3">
                        							<label className="field-label" style={{maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis'}} title={item.caption}>{item.caption}</label>
                        						</div>
                        						<div className="col-md-9">
                        							<MultiSelect multiple="multiple" identity={selectedField} updateData={true} onChange={handleSelectField}
                        							config={{
                                    					maxHeight: 250,
                                    					enableFiltering: true,
                                    					enableClickableOptGroups: false,
                                    					nonSelectedText: i18n.t("none-selected-text"),
                                                        nSelectedText: i18n.t("n-selected-text"),
                                                        allSelectedText: i18n.t("all-selected")
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
})

function updateSemanticTags(){
    //TODO 这里需要实现更新自定义语义之后的操作
        $('#semanticmanager').tagsManager('empty');
        _.each(sematicMap, function(value, key) {
            if (value) {
                $('#show-semantic').removeClass('hidden');
                $('#semanticmanager').tagsManager('pushTag', value.name, false, Number.parseInt(key, 10));
            }
        });
}
module.exports.renderMixed = function(typeContainer, semanticContainer,
    _semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource) {

    condMap = new Object();
    sematicMap = new Object();

    //复原过滤条件
    _.each(task.selectedDataSource, function(item, index) {
        if (item.cond) {
            condMap[item.key] = item.cond;
        }
    });
    //复原自定义语义
    if(task.sematicMap){
        sematicMap = task.sematicMap;
    }

	// render CollisionType
    var configType = {
        disableIfEmpty: false,
        enableFiltering: false,
        buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14'
    }
    var typeChange = function(type) {
        taskType = type;
        task.analysisType = type;
        selectTypeAndSemantic(task.analysisType);
        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource , task.semanticId);
    }
    ReactDOM.render(<Provider.default><CollisionType configType={configType} onChange={typeChange} type={task.analysisType}/></Provider.default>, typeContainer);

	semanticDef = _semanticDef;
	selectedSematicId = task.semanticId || (!_.isEmpty(semanticDef) ? semanticDef[0].semanticId : undefined);
	var semanticChange = function(semanticId , checked) {
		if(checked)
		{
			task.semanticId.push(semanticId);
		}
		else
		{
			task.semanticId.splice(_.indexOf(task.semanticId, semanticId), 1);
		}
		selectedSematicId = task.semanticId;
        _.map(task.selectedDataSource,function(item){
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
        // 语义改变，条件也改变
        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource , task.semanticId);
    }

	ReactDOM.render(<Provider.default><CollisionSemantic semantic={semanticDef} onChange={semanticChange} semanticId={selectedSematicId}/></Provider.default>, semanticContainer);
    initSemTag();

	initDataSource(dataSource);
    updateDSTags();
    updateSemanticTags();
    updateDSFields();
    // selectTypeAndSemantic(task.analysisType)
    // _.each(task.selectedDataSource, function(ds, key) {
    //     updateDSTrees(key, true);
    // });

    taskType = task.analysisType;

    function initSemTag(){//初始化自定义语义tag区域
        $('#semanticmanager').tagsManager({
            tagsContainer: '#collision-semantic-tag',
            externalTagId: true,
            tagClass: 'tm-tag-info'
        });

        $('#semanticmanager').on('tm:spliced', function(e, tag, tagId) {
            //TODO 这里实现删除自定义标签时候的操作
            _.each(sematicMap, function(value, key) {
                if (value && key == tagId) { //删除属性
                    semanticChange(value.id,false);
                    delete sematicMap[key];
                }
            });
            if(_.isEmpty(sematicMap)){//自定义标签已全部删除
                $('#show-semantic').addClass('hidden');
            }

        });
    }

    function renderCollisionFields(fieldsContainer, _fieldsData, semanticId) {
        // render CollisionFieldsData
        fieldsData = _fieldsData;
        ReactDOM.render(<Provider.default><CollisionFields data={fieldsData}  semanticId={semanticId} taskType={taskType}/></Provider.default>, fieldsContainer);
    }

    // function updateDSTrees(key, selected) {
    //     var sysTree = $("#system-data").fancytree("getTree");
    //     var personalTree = $("#personal-data").fancytree("getTree");

    //     var node = sysTree.getNodeByKey(key);
    //     if (node) {
    //         node.setSelected(selected);
    //     }
    //     node = personalTree.getNodeByKey(key);
    //     if (node) {
    //         node.setSelected(selected);
    //     }
    // }

    function updateDSTags() {
        $('#tagmanager').tagsManager('empty');
        _.each(task.selectedDataSource, function(value, index) {
            if (value) {
                if (!_.isNumber(value.tagId)) {
                    // value.tagId = ++tagGenerateId;
                    value.tagId = value.key;
                }
                var condi;
                _.each(condMap,function(citem,index){
                    if(index == value.key)
                    {
                        condi = citem;
                    }
                });
                if(!condi){
                    $('#tagmanager').tagsManager('pushTag', value.caption, false, value.tagId, "fa fa-filter",bindFilterToggle);
                }else{
                    $('#tagmanager').tagsManager('pushTag', value.caption, false, value.tagId, "filter-tag fa fa-filter",bindFilterToggle);
                }
            }
        });
    }

    function selectHandler(event, data) {
        //如果是数据源
        if (data.node.extraClasses.indexOf("nv-data") != -1||data.node.extraClasses.indexOf("nv-task")!=-1) {
            var node = data.node;
            var filterToggle = $(node.li).find('#filter-toggle');
            if (data.node.isSelected()) {//被选中;
                filterToggle.removeClass('hide');
            } else {
                filterToggle.addClass('hide');
            }
            var ds = data.node.data;
            //创建唯一key
            var key = data.node.key;
            var isContain = _.find(task.selectedDataSource,ditem=>{
                return ditem.key == key;
            });
            while (task.selectedDataSource && isContain) {
                key++;
                isContain = _.find(task.selectedDataSource,ditem=>{
                    return ditem.key == key;
                });
            }
            ds.key = key;
            //构建唯一命名
            var newCaption = ds.caption;
            var isRepeated = true;
            while (isRepeated) {
                isRepeated = false;
                var count = 1;
                _.each(task.selectedDataSource, function(item) {
                    if (item.caption == newCaption) {
                        isRepeated = true;
                        newCaption = ds.caption + count;
                        count++;
                    }
                })
            }
            ds.caption = newCaption;

            dialogSelecetedDs.push({
                key: key,
                ds: ds,
                isSelected: data.node.isSelected()
            });

            // selectDataSource(key, ds, data.node.isSelected());
            // updateDSTags();
            // updateDSFields();
        }
    }

    function updateDSFields() {
        _.each(task.selectedDataSource, function(ds) {
            if (!ds.semantic) {
                $.getJSON("/modelanalysis/collision/getdatasourceinfo", {
                    centercode: ds.centerCode,
                    zoneid: ds.zoneId,
                    typeid: ds.typeId
                }, function(rsp) {
                    if (rsp.code == 0) {
                        ds.semantic = rsp.data;
                        if(!ds.allFields){
                            let allFields = [];
                            _.each(ds.semantic,sitem=>{
                                if(sitem.fieldList){
                                    _.each(sitem.fieldList,fitem=>{
                                        allFields.push({
                                            fieldName: fitem.fieldName,
                                            fieldType: fitem.fieldType,
                                            displayName: fitem.caption
                                        });
                                    });
                                }
                            });
                            ds.allFields = allFields;
                        }
                        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource , task.semanticId);
                    }
                })
            }
        });
        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource , task.semanticId);
    }
    function bindFilterToggle(tagId) {
        var nodeData = _.find(fieldsData,fitem=>{
            return tagId == fitem.key;
        });
        if(nodeData){
            // 显示dialog
            Dialog.build({
                title: window.i18n.t("datasource-filter"),
                content: '<div id="filter-dialog-content" style="padding:15px"></div>',
                width: 700,
                minHeight: 400,
                leftBtnCallback: function() {
                    Dialog.dismiss();
                },
                rightBtnCallback: function() {
                    let detail = FieldFilter.constructTaskDetail();
                    if(detail.message){
                        Notify.show({
                            title: detail.message,
                            type: 'warning'
                        });
                    }else if(detail.detail && (detail.detail.cond.children.length==0)){
                        delete condMap[detail.detail.inputNode];
                        Dialog.dismiss();
                        updateDSTags();
                    }else if (detail.detail && !(detail.detail.isEmpty)) {
                        condMap[detail.detail.inputNode] = detail.detail.cond;
                        Dialog.dismiss();
                        updateDSTags();
                    } else{
                        // delete condMap[detail.detail.inputNode];
                        // Dialog.dismiss();
                        // updateDSTags();
                        Notify.show({
                            title: window.i18n.t("please-complete-sub-conditions"),
                            type: 'warning'
                        });
                    }
                }
            }).show(function() {
                let filterdata = {};
                $.extend(true,filterdata,nodeData);
                $('#nv-dialog-body').addClass('pn');
                var cond;
                _.each(condMap,function(value,key){
                    if(key == nodeData.key)
                    {
                        cond = value;
                    }
                });
                if(cond){
                    filterdata.cond = {};
                    $.extend(true,filterdata.cond,cond);//不能直接传值，会导致数据被修改，大坑
                }
                FieldFilter.render(document.getElementById('filter-dialog-content'),filterdata);
            });
        }
    }
	function initDataSource(dataSource) {
        $("#collision-datasource").empty();
        $("#collision-datasource").append(datasourcePanel);
        $('#tagmanager').tagsManager({
            tagsContainer: '#collision-datasource-tag',
            externalTagId: true,
            tagClass: 'tm-tag-info'
        });
        $('#tagmanager').on('tm:spliced', function(e, tag, tagId) {
            var condIndex;
            _.each(condMap,function(citem,index){
                if(index == tagId)
                {
                    condIndex = index;
                }
            });
            if(condIndex){
                delete condMap[condIndex];
            }
            selectDataSource(tagId, null, false);
            renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource , task.semanticId);
            // var dataKey;
            // _.each(task.selectedDataSource, function(value, key) {
            //     if (value && value.tagId == tagId) {
            //         dataKey = key;
            //     }
            // });
            // if (dataKey) {
            //     updateDSTrees(dataKey, false);
            // }
        });

        $('#datasource-edit').click(function() {
            dialogSelecetedDs = [];
            // datasource-dialog
            Dialog.build({
                title: window.i18n.t("datasource-select"),
                content: datasourceDialog,
                rightBtnCallback: function() {
                    _.each(dialogSelecetedDs, function(item) {
                        selectDataSource(item.key, item.ds, item.isSelected);
                    })
                    updateDSTags();
                    updateDSFields();
                    Dialog.dismiss();
                }
            }).show(function() {
                $('#nv-dialog-body').css('max-height', '600px');
                $('#system-data').fancytree({
                    extensions: ["filter"],
                    quicksearch: true,
                    filter: {
                        mode: "dimn",
                        autoAppaly: true,
                        hightlight: true
                    },
                    selectMode: 2,
                    clickFolderMode: 1,
                    checkbox: true,
                    autoScroll: true,
                    source: function() {
                        return dataSource.sysTree;
                    },
                    iconClass: function(event, data) {
                        if (data.node.extraClasses.indexOf("nv-dir") != -1) {
                            return "fa fa-folder fa-fw";
                        } else {
                            return "fa fa-database fa-fw";
                        }
                    },
                    select: selectHandler
                });
                if (dataSource.personalTree) {
                    $('#personal-data').fancytree({
                        extensions: ["filter"],
                        quicksearch: true,
                        filter: {
                            mode: "dimn",
                            autoAppaly: true,
                            hightlight: true
                        },
                        selectMode: 2,
                        clickFolderMode: 1,
                        checkbox: true,
                        autoScroll: true,
                        source: function() {
                            return dataSource.personalTree;
                        },
                        iconClass: function(event, data) {
                            if (data.node.extraClasses.indexOf("nv-dir") != -1) {
                                return "fa fa-folder fa-fw";
                            } else {
                                return "fa fa-database fa-fw";
                            }
                        },
                        lazyLoad: function(event, data) {
                            data.result = {
                                url: "/modelanalysis/collision/listmodelingtask",
                                data: {
                                    taskId: data.node.data.typeId
                                }
                            };
                        },
                        select: selectHandler
                    });
                    $("#personalTree-filter").show();
                } else {
                    $("#personalTree-filter").hide();
                }

                // fancytree 过滤
                var sysTree = $("#system-data").fancytree("getTree");
                $("input[name=searchSystem]").keyup(function(e) {
                    var n;
                    var opts = {
                        autoExpand: true
                    };
                    var match = $(this).val();

                    if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                        $("button#btnResetSearchSystem").click();
                        return;
                    }
                    n = sysTree.filterNodes(match, opts);

                    $("button#btnResetSearchSystem").attr("disabled", false);
                    $("span#matchesSystem").text("(" + n + ")");
                });
                $("button#btnResetSearchSystem").click(function() {
                    $("input[name=searchSystem]").val("");
                    $("span#matchesSystem").text("");
                    sysTree.clearFilter();
                }).attr('disabled', 'true');

                var personalTree = $("#personal-data").fancytree("getTree");
                $("input[name=searchPersonal]").keyup(function(e) {
                    var n;
                    var opts = {
                        autoExpand: true
                    };
                    var match = $(this).val();

                    if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                        $("button#btnResetSearchPersonal").click();
                        return;
                    }
                    n = personalTree.filterNodes(match, opts);

                    $("button#btnResetSearchPersonal").attr("disabled", false);
                    $("span#matchesPersonal").text("(" + n + ")");
                });
                $("button#btnResetSearchPersonal").click(function() {
                    $("input[name=searchPersonal]").val("");
                    $("span#matchesPersonal").text("");
                    personalTree.clearFilter();
                }).attr('disabled', 'true');
            });
            // datasource-dialog
        });
    }
}

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

function isDifferentType(newField, selectedFields, codeUsage){
    return _.find(selectedFields[codeUsage], function(item){
        return !isTypeEqual(item.fieldType, newField.fieldType);
    })
}

module.exports.constructTaskDetailMixed = function() {
    //selectedSematicId是一个数组
    //selectedSematic是一个对象
    if(taskType == OPERATIONS.INTERSECTION){
        if(!Number.isInteger(collisionCount)){
            return {message: window.i18n.t("collision-times-not-integer")};
        }else if(collisionCount > collisionMax){
            return {message: window.i18n.t("collision-times-no-more",{collisionMax :collisionMax})};
        }else if(collisionCount < 2){
            return {message: window.i18n.t("collision-times-no-less")};
        }
    }
    var selectedSematics = [];
    _.each(selectedSematicId,function(item){
        var selectedSematic = _.find(semanticDef, function(sitem) {
            return sitem.semanticId == item;
        });
        if(selectedSematic == undefined)
        {
            var temp = _.find(sematicMap,sitem=>{
                    return sitem.id == item;
                });
            if(temp){
                selectedSematic={};
                selectedSematic.semanticId = temp.id;
                selectedSematic.semanticName = temp.name;
            }
        }
        selectedSematics.push(selectedSematic);
    });
    var taskDetail = {
        srcDataTypes: [],
        semanticId: selectedSematicId,
        collisionCount: collisionCount,
        output: []
    };

    var noPass = false;
    var nodeInfo;
    var differentTypeField, comparedField, allFields = {};
    _.each(fieldsData, function(item) {
        if(!_.isEmpty(item.selectedFields)) {
                _.each(item.selectedFields,fitem=>{
                    if(_.isEmpty(fitem.field)){
                        noPass = true;
                        if (!nodeInfo) {
                            nodeInfo = {};
                            nodeInfo['codeUsage'] = fitem.codeUsage;
                            nodeInfo['caption'] = item.caption;
                        }
                    }
                    if(!differentTypeField){
                        _.each(fitem.field,field=>{
                            var origField = _.find(item.allFields, function (iitem) {
                                    return iitem.fieldName == field;
                            });
                            comparedField = isDifferentType(origField, allFields, fitem.codeUsage);
                            if (comparedField) {
                                // differentTypeField = origField;
                            }
                            allFields[fitem.codeUsage] = allFields[fitem.codeUsage]?allFields[fitem.codeUsage]:[];
                            allFields[fitem.codeUsage].push(origField);
                        });
                    }
                });
            var condi;
            _.each(condMap,function(value,key){
                if(key == item.key)
                {
                    condi = value;
                }
            });
            if(condi == undefined)
            {
                taskDetail.srcDataTypes.push({
                    index: item.index || 0,
                    inputNode: item.key,
                    dataType: {
                        centerCode: item.centerCode || "",
                        zoneId: item.zoneId || 0,
                        typeId: item.typeId || 0
                    },
                    fieldList: item.selectedFields
                });
            }else{
                taskDetail.srcDataTypes.push({
                    index: item.index || 0,
                    inputNode: item.key,
                    dataType: {
                        centerCode: item.centerCode || "",
                        zoneId: item.zoneId || 0,
                        typeId: item.typeId || 0
                    },
                    fieldList: item.selectedFields,
                    cond:condi
                });
            }
        }
    });
    if(noPass) {
        var semantic = _.find(selectedSematics,sitem=>{
            return sitem.semanticId == nodeInfo.codeUsage;
        });
        return {
            message: window.i18n.t("conditions-have-not-been-completed",{semanticName: semantic.semanticName,caption: nodeInfo.caption})
        };
    }
    // if (differentTypeField) {
    //     return {
    //         message: '"' + differentTypeField.displayName + '"与"' + comparedField.displayName + '"的类型不一致'
    //     }
    // }
    _.each(selectedSematics,function(item){
        taskDetail.output.push({
            codeUsage:item.semanticId,
            displayName:item.semanticName||""
        });
    });

    // _.each(sematicMap,function(value,key){
    //     taskDetail.output.push({
    //         codeUsage:value.id,
    //         displayName:value.name||""
    //     });
    // });
    return {
        detail: taskDetail
    };
}