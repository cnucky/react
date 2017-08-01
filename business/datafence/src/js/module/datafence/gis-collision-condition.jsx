var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var _ = require('underscore');
var Notify = require('nova-notify');
var utils = require('nova-utils');

var tagmanager = require('../collision/collision-tag-manager');

var MultiSelect = require('widget/multiselect');
var FancyTree = require('widget/fancytree.jsx');
require('./gis-collision-condition.less');
var datasourcePanel = require('../../tpl/collision/datasource-panel');
var Dialog = require('nova-dialog');
var FieldFilter = require('../collision/collision-filter-react.jsx');
var appConfig = window.__CONF__.business.datafence;
var datafenceHelper = require('./datafenceFuncHelper');
var datasourceDialog = require('../../tpl/collision/datasource-dialog');

var taskType;
var semanticDef;
var fieldsData;
var selectedSematicId;
var condMap;//存放过滤条件
var sematicMap;//存放自定义语义
var dialogSelecetedDs = [];
var fenceTreeSource = [];

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
    handleSelectType: function(item, option, checked, select) {
        if (this.props.onChange && typeof this.props.onChange === 'function') {
            this.props.onChange(parseInt(option.val()));
        }
    },
    render: function() {
        var type = [{
            label: "交集分析",
            value: 113,
            selected: this.props.type == 113
        }, {
            label: "并集分析",
            value: 114,
            selected: this.props.type == 114
        }, {
            label: "差集分析",
            value: 115,
            selected: this.props.type == 115
        }];
        return (
            <div>
                <div className="form-group">
                    <label className="col-md-3 control-label">碰撞类型</label>
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
    handleSelectSemantic: function(item, option, checked, select) {
        if (checked) {
            this.props.onChange(parseInt(option.val()), true);
        } else {
            this.props.onChange(parseInt(option.val()), false);
        }
    },
    handleAddSemantic: function(event) {
        var new_semantic = $("#self-semantic").val(); //新语义的值
        new_semantic = new_semantic.trim();
        if (new_semantic == "") {
            Notify.show({
                title: '请输入自定义的语义',
                type: 'warning'
            });
        } else if (!utils.checkValidName(new_semantic)) {
            Notify.show({
                title: '输入不合法',
                type: 'warning'
            });
        } else {
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
                    title: '该语义已存在，请重新输入',
                    type: 'warning'
                });
            }
        }
    },
    render: function() {
        var semantic = this.props.semantic;
        var semanticId = this.props.semanticId;

        return (
            <div>
                <div className="form-group">
                    <label className="col-md-3 control-label">碰撞语义</label>
                    <div className="col-md-6">
                    {
                        <MultiSelect config={{
                            buttonClass: 'multiselect dropdown-toggle btn btn-info btn-sm fw600 fs14',
                            nonSelectedText: "请选择",
                            nSelectedText: "个已选择",
                            allSelectedText: "全选"}} updateData={true} onChange={this.handleSelectSemantic} multiple="multiple"
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
                        <a className="control-label section-toggle" data-toggle="collapse" href="#selfseman-panle" aria-controls="selfseman-panle" aria-expanded="false">自定义</a>
                    </div>
                </div>
                <div className="collapse" id="selfseman-panle">
                    <div className="form-group">
                            <label className="col-md-3 control-label">自定义语义</label>
                            <div className="col-md-6">
                                <input className="form-control" id="self-semantic" type="text"/>
                            </div>
                            <div className="col-md-3">
                                <button type="button" className="btn btn-primary mnw50" onClick={this.handleAddSemantic}>添加</button>
                            </div>
                    </div>
                </div>
                <div className="form-group hidden" id="show-semantic">
                        <label className="col-md-3 control-label">已添加语义</label>
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
    getInitialState: function() {
        return {
            collisionCount: collisionCount,
            fenceTreeSource: fenceTreeSource,
            checkboxChecked: false,
        };
    },
    handleNum: function(e){
        collisionCount = e.target.value;
        this.setState({
            collisionCount: collisionCount
        });
    },
    handleSelectField: function(selectedfield, option, checked, select) {
        console.log(selectedfield)
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
    fenceTreeShow: function(e){
        $.getJSON('/gisapi/gisGetQuery', {
            hostname: appConfig['gis-server'],
            path: '/GisService/enclosure/GetAllEnclosure',
            dirId: this.props.rootID
        }).done((result) => {
            var a = eval(result);      
            this.setState({
                fenceTreeSource: a
            });
        })
        var index = $(e.currentTarget).attr('data-index');
        var index2 = $(e.currentTarget).attr('data-index2');
        var id = "#" + index2 + String(index) + "-tree";
        $(id).toggle();
    },
    fenceTreeHide: function(e){
        var index = $(e.currentTarget).attr('data-index');
        var index2 = $(e.currentTarget).attr('data-index2');
        var id = "#" + index2 + index + "-tree";
        $(id).hide();
    },
    componentWillReceiveProps: function (nextProps) {
        nextProps.forceUpdate = true;
    },
    queryFieldschange: function(e){
        this.setState({
            checkboxChecked: true
        });
        var currentTarget = $(e.currentTarget);
        var data = this.props.data; 
        var index1 = $(event.target).attr("data-index1");
        var index2 = $(event.target).attr("data-index2");
        var selectedQueryFields = data[index1].selectedQueryFields ||[];
        var queryField = data[index1].queryFields[index2].fieldName;
        var queryFieldIndex = selectedQueryFields.indexOf(queryField);

        var isChecked = currentTarget[0].checked;
        if(isChecked){
            if (queryFieldIndex == -1){
                selectedQueryFields.push(queryField);
            }  
        }else{
            selectedQueryFields.splice(queryFieldIndex,1);
        };
        data[index1].selectedQueryFields = selectedQueryFields;
    },
    render: function() {
        if (!_.isEmpty(this.props.data)) {
            var addon;
            var updateSemanticFields = this.updateSemanticFields;
            var handleSelectField = this.handleSelectField;

            var queryFieldschange = this.queryFieldschange;
            var fenceChange = this.fenceChange;
            var fenceTreeShow = this.fenceTreeShow;
            var fenceTreeHide = this.fenceTreeHide;

            var semanticId = this.props.semanticId;  
            var gisDataSource = this.props.gisDataSource;

            var forceUpdate = this.props.forceUpdate;
            // var fenceTreeSource = this.props.fenceTreeSource;

            var queryFields = this.props.queryFields;       
            var data = this.props.data; 
            var numMax = Object.getOwnPropertyNames(data).length;

            var fancytreeConfig = {
                    checkbox: true,
                    selectMode: 3,
                    source : this.state.fenceTreeSource,
                    imagePath: "../js/components/gisWidget/enclosureManageModule/fancyTree/image/", 
                    select:function(event, data2){
                    event.preventDefault();
                    var thisIndex = $(event.target).parent().parent().attr("data-index");
                    var key = $(event.target).parent().parent().attr("data-index2");
                    var nodes = $(event.target).parent().parent().find(".react-fancytree").fancytree("getTree").getSelectedNodes();
                    var Path=[];
                    var fenceId = [];

                    for(var i=0;i<nodes.length;i++){
                        if(!nodes[i].folder){
                            Path.push(datafenceHelper.generateMainPath(nodes[i]));
                            fenceId.push(nodes[i].key);
                            }
                        }
                    var inputId = "#" + key + thisIndex + '-input';
                    $(inputId).empty().val(Path);
                    $(inputId).attr('fenceId', fenceId);
                    $(inputId).attr('title', Path);
                    data[thisIndex].fenceName = Path;
                    data[thisIndex].fenceId = fenceId;
                    }.bind(this)
                }
            if(numMax < 2){numMax=2;}
            _.map(data,function(item){
                if(!item.selectedFields){
                    item.selectedFields = [];
                    _.map(semanticId,function(sitem){
                        item.selectedFields.push({codeUsage:sitem , field :[]});
                    });
                }
            });
            if (this.props.taskType == 115) { //差集分析
                addon = (<div>
                <hr className="alt litmargin"/>
                <div className="section datasource-addon">
                <div className="form-group">
                    <label className="col-md-3 field-label">首集合</label>
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
            }else if (this.props.taskType == 113) { //交集分析
                var numMax = data.length;
                if(numMax < 2){numMax=2;}
                collisionMax = numMax;
                addon = (
                    <div>
                        <hr className="alt litmargin"/>
                        <div className="form-group">
                            <label className="col-md-3 control-label">碰撞次数</label>
                            <div className="col-md-6">
                                <input className="form-control" id="self-num" type="number" min="2" max={numMax} value={this.state.collisionCount} onChange={this.handleNum}/>
                            </div>
                            {
                                (numMax == 2)?
                                    (<span className="help-block fw500" style={{marginTop:"13px", fontSize: "6px"}}>
                                        {'范围为整数'+" 2"}
                                    </span>):
                                    (<span className="help-block fw500" style={{marginTop:"13px", fontSize: "6px"}}>
                                        {'范围为整数'+" 2~"+numMax}
                                     </span>
                                    )
                            }
                        </div>
                </div>)
            }

return (
    <div>
    <hr className="alt litmargin" />
    <div>
          {
                <div className="section datasource-fields">
                <div className="form-group">
                <label htmlFor="collision-field" className="control-label">围栏</label>
                <a className="control-label section-toggle fields-control" data-toggle="collapse" href="#enclosureId" aria-expanded="true" aria-controls="enclosureId">
                收起</a>
                </div>
                <div id="enclosureId" className="collapse in">
                {
                    _.map(data, _.bind(function(item,index){
                        var text = item.centerCode + String(item.srcTypeId);                        
                        const fieldMap = {};
                        if(gisDataSource.indexOf(text) !== -1){
                            return(
                            <div className="form-group">
                                <div className="col-md-3">
                                <label className="field-label" style={{maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis'}} title={item.caption}>{item.caption}</label>
                                </div>
                                <div className="col-md-9">
                                 {
                                    _.map(item.queryFields, _.bind(function(field,index2){
                                        if(item.queryFields.length > 1){
                                             return(
                                                <span className="queryFieldCheck checkbox-custom">
                                                <input type="checkbox" checked = {!!!item.selectedQueryFields ? false : !(item.selectedQueryFields.indexOf(field.fieldName) == -1)} id={field.fieldName + item.key} data-index1={index} data-index2={index2} onChange={queryFieldschange}/>
                                                <label htmlFor={field.fieldName + item.key}>{field.caption}</label>
                                                </span>
                                            )
                                          }else{
                                            item.selectedQueryFields = [item.queryFields[0].fieldName];
                                          }
                                        })
                                      )
                                    }
                                    <div>
                                      <span className="fenceInputDiv">
                                      <a>在围栏中</a>
                                      <input className="z_input" id={item.key+String(index)+'-input'} key={item.key} data-index2={item.key} title={item.fenceName} autoComplete="off" className={"fenceInput"} readonly={"readonly"} data-index={index} value={item.fenceName} onClick={fenceTreeShow} onBlur={fenceTreeHide}/>
                                      </span>
                                      <div id={item.key+String(index)+"-tree"} data-index={index} key={item.key} data-index2={item.key} className="fenceTreeDiv" style={{display:"none"}}>
                                      <FancyTree  config={fancytreeConfig} forceReload={forceUpdate}/>
                                      </div>
                                    </div>
                                </div>
                            </div>
                        )
                        }                                              
                    })
                    )
                }
                </div>
                </div>  
    }
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
                <hr className="alt litmargin" />
                <div className="form-group">
                <label htmlFor="collision-field" className="control-label">{name}</label>
                <a className="control-label section-toggle fields-control" data-toggle="collapse" href={id_per} aria-expanded="true" aria-controls={id}>
                收起</a>
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
        buttonClass: 'multiselect btn btn-info btn-sm fw600 fs14',
        enableClickableOptGroups: true,
        nonSelectedText: "请选择",
        nSelectedText: "个已选择",
        allSelectedText: "全选"
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
    _semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource, gisDataSource, fenceTreeSource, rootID) {

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
        buttonClass: 'multiselect dropdown-toggle btn btn-info btn-sm fw600 fs14'
    }
    var typeChange = function(type) {
        taskType = type;
        task.analysisType = type;
        selectTypeAndSemantic(task.analysisType);
        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource , task.semanticId);
    }
    ReactDOM.render(<CollisionType configType={configType} onChange={typeChange} type={task.analysisType}/>, typeContainer);

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
        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource, task.semanticId);
    }

    ReactDOM.render(<CollisionSemantic semantic={semanticDef} onChange={semanticChange} semanticId={selectedSematicId}/>, semanticContainer);
    initSemTag();

    initDataSource(dataSource);
    updateDSTags();
    updateSemanticTags();
    updateDSFields();
    // initFenceTree();
    // _.each(task.selectedDataSource, function(ds, key) {
    //     updateDSTrees(key, true);
    // });

    taskType = task.analysisType;

    function initSemTag() { //初始化自定义语义tag区域
        $('#semanticmanager').tagsManager({
            tagsContainer: '#collision-semantic-tag',
            externalTagId: true,
            tagClass: 'tm-tag-info'
        });

        $('#semanticmanager').on('tm:spliced', function(e, tag, tagId) {
            //TODO 这里实现删除自定义标签时候的操作
            _.each(sematicMap, function(value, key) {
                if (value && key == tagId) { //删除属性
                    semanticChange(value.id, false);
                    delete sematicMap[key];
                }
            });
            if (_.isEmpty(sematicMap)) { //自定义标签已全部删除
                $('#show-semantic').addClass('hidden');
            }

        });
    }

    function renderCollisionFields(fieldsContainer, _fieldsData, semanticId) {
        fieldsData = _fieldsData; 
         if(fieldsData != undefined && fieldsData.length !== 0){
            fieldsData.forEach((data) => {
            var text = data.centerCode + String(data.srcTypeId);

            const fieldMap = {};
            if(gisDataSource.indexOf(text) !== -1){
                var datatype = {
                    typeId: data.srcTypeId,
                    srcTypeId: data.srcTypeId,
                    centerCode: data.centerCode,
                    zoneId: 1,
                    name: data.caption
                }
                $.getJSON('/smartquery/smartquery/getdatatypequeryconfig', datatype).done((rsp) => {
                        const list = rsp.data;
                        list.forEach((field) => {
                            fieldMap[field.fieldName] = field;
                        })
                        const queryFields = [];
                        $.getJSON('/smartquery/smartquery/getGisQueryConfig', datatype).done((rsp) => {
                            const gisconfig = rsp.data.BussinessToGISFieldList;
                            // console.log(gisconfig);
                            if(gisconfig[0].BussinessPhysicalName){
                            gisconfig.forEach((gisfield) => {
                            queryFields.push(fieldMap[gisfield.BussinessPhysicalName.toUpperCase()]);
                        })
                        }
                        // console.log(queryFields);
                        data.queryFields = queryFields;
                        ReactDOM.render(<CollisionFields data={fieldsData} semanticId={semanticId} taskType={taskType} gisDataSource={gisDataSource} rootID={rootID}/>, fieldsContainer);

                    })
                })
          }else{
            ReactDOM.render(<CollisionFields data={fieldsData} semanticId={semanticId} taskType={taskType} gisDataSource={gisDataSource} rootID={rootID}/>, fieldsContainer);
          }
         })
           }else{
            ReactDOM.render(<CollisionFields data={fieldsData} semanticId={semanticId} taskType={taskType} gisDataSource={gisDataSource} rootID={rootID}/>, fieldsContainer);
           }    
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
                if (!condi) {
                    $('#tagmanager').tagsManager('pushTag', value.caption, false, value.tagId, "fa fa-filter", bindFilterToggle);
                } else {
                    $('#tagmanager').tagsManager('pushTag', value.caption, false, value.tagId, "filter-tag fa fa-filter", bindFilterToggle);
                }
            }
        });
    }

    function selectHandler(event, data) {
        //如果是数据源
        if (data.node.extraClasses.indexOf("nv-data") != -1 || data.node.extraClasses.indexOf("nv-task") != -1) {
            var node = data.node;
            var filterToggle = $(node.li).find('#filter-toggle');
            if (data.node.isSelected()) { //被选中;
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
                $.getJSON("/datafence/collision/getdatasourceinfo", {
                    centercode: ds.centerCode,
                    zoneid: ds.zoneId,
                    typeid: ds.typeId
                }, function(rsp) {
                    if (rsp.code == 0) {
                        ds.semantic = rsp.data;
                        if (!ds.allFields) {
                            let allFields = [];
                            _.each(ds.semantic, sitem => {
                                if (sitem.fieldList) {
                                    _.each(sitem.fieldList, fitem => {
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
                        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource, task.semanticId);
                    }
                })
            }
        });
        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource, task.semanticId);
    }

    function bindFilterToggle(tagId) {
        var nodeData = _.find(fieldsData, fitem => {
            return tagId == fitem.key;
        });
        if (nodeData) {
            // 显示dialog
            Dialog.build({
                title: "数据源过滤",
                content: '<div id="filter-dialog-content" style="padding:15px"></div>',
                width: 700,
                minHeight: 400,
                leftBtnCallback: function() {
                    Dialog.dismiss();
                },
                rightBtnCallback: function() {
                    let detail = FieldFilter.constructTaskDetail();
                    if (detail.message) {
                        Notify.show({
                            title: detail.message,
                            type: 'warning'
                        });
                    } else if(detail.detail && (detail.detail.cond.children.length==0)){
                        delete condMap[detail.detail.inputNode];
                        Dialog.dismiss();
                        updateDSTags();
                    }else if (detail.detail && !(detail.detail.isEmpty)) {
                        condMap[detail.detail.inputNode] = detail.detail.cond;
                        Dialog.dismiss();
                        updateDSTags();
                    } else {
                        // delete condMap[detail.detail.inputNode];
                        // Dialog.dismiss();
                        // updateDSTags();
                        Notify.show({
                            title: "请完成条件填写",
                            type: 'warning'
                        });
                    }
                }
            }).show(function() {
                let filterdata = {};
                $.extend(true, filterdata, nodeData);
                $('#nv-dialog-body').addClass('pn');
                var cond;
                _.each(condMap,function(value,key){
                    if(key == nodeData.key)
                    {
                        cond = value;
                    }
                });
                if (cond) {
                    filterdata.cond = {};
                    $.extend(true, filterdata.cond, cond); //不能直接传值，会导致数据被修改
                }
                FieldFilter.render(document.getElementById('filter-dialog-content'), filterdata);
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
            if (condIndex) {
                delete condMap[condIndex];
            }
            selectDataSource(tagId, null, false);
            renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource, task.semanticId);
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
                title: '选择数据源',
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
                                url: "/datafence/collision/listmodelingtask",
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

function isDifferentType(newField, selectedFields, codeUsage) {
    return _.find(selectedFields[codeUsage], function(item) {
        return !isTypeEqual(item.fieldType, newField.fieldType);
    })
}

module.exports.constructTaskDetailMixed = function() {
    //selectedSematicId是一个数组
    //selectedSematic是一个对象
    if(taskType == 113){
        if(!Number.isInteger(collisionCount)){
            return {message: "碰撞次数必须为整数"};
        }else if(collisionCount > collisionMax){
            return { message: '碰撞次数不能超过' + collisionMax + '次'};
        }else if(collisionCount < 2){
            return { message: '碰撞次数不能低于2次'};
        }
    }
    var selectedSematics = [];
    _.each(selectedSematicId, function(item) {
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
    var differentTypeField, comparedField = [];
    var allFields = {};
    var nodeInfo;
    _.each(fieldsData, function(item) {
        if (!_.isEmpty(item.selectedFields)) {
            _.each(item.selectedFields, fitem => {
                if (_.isEmpty(fitem.field)) {
                    noPass = true;
                    if (!nodeInfo) {
                        nodeInfo = {};
                        nodeInfo['codeUsage'] = fitem.codeUsage;
                        nodeInfo['caption'] = item.caption;
                    }
                }
                if (!differentTypeField) {
                    _.each(fitem.field, field => {
                        var origField = _.find(item.allFields, function(iitem) {
                            return iitem.fieldName == field;
                        });
                        comparedField = isDifferentType(origField, allFields, fitem.codeUsage);
                        if (comparedField) {
                            differentTypeField = origField;
                        }
                        var field_tmp = allFields[fitem.codeUsage] || [];
                        field_tmp.push(origField);
                        allFields[fitem.codeUsage] = field_tmp;
                    });
                }
            });
            var condi;
            _.each(condMap, function(value, key) {
                if (key == item.key) {
                    condi = value;
                }
            });


            if (condi == undefined) {
                if(!!!item.fenceId || item.fenceId == ""){
                  taskDetail.srcDataTypes.push({
                    index: item.index || 0,
                    inputNode: item.key,
                    dataType: {
                        centerCode: item.centerCode || "",
                        zoneId: item.zoneId || 0,
                        typeId: item.typeId || 0,
                        srcTypeId: item.srcTypeId || 0,                    
                    },
                    fieldList: item.selectedFields,
                  });
                }else{
                  taskDetail.srcDataTypes.push({
                    index: item.index || 0,
                    inputNode: item.key,
                    dataType: {
                        centerCode: item.centerCode || "",
                        zoneId: item.zoneId || 0,
                        typeId: item.typeId || 0,
                        srcTypeId: item.srcTypeId || 0,                    
                    },
                    fieldList: item.selectedFields,
                    fence: {
                        fenceName: item.fenceName,
                        fenceId: item.fenceId,
                        queryField: item.selectedQueryFields
                    },
                  });
                }
            } else {
                 if(!!!item.fenceId || item.fenceId == ""){
                  taskDetail.srcDataTypes.push({
                    index: item.index || 0,
                    inputNode: item.key,
                    dataType: {
                        centerCode: item.centerCode || "",
                        zoneId: item.zoneId || 0,
                        typeId: item.typeId || 0,
                        srcTypeId: item.srcTypeId || 0,                   
                    },
                    fieldList: item.selectedFields,
                    baseCond: condi,
                  });
                }else{
                  taskDetail.srcDataTypes.push({
                    index: item.index || 0,
                    inputNode: item.key,
                    dataType: {
                        centerCode: item.centerCode || "",
                        zoneId: item.zoneId || 0,
                        typeId: item.typeId || 0,
                        srcTypeId: item.srcTypeId || 0,                    
                    },
                    fieldList: item.selectedFields,
                    baseCond: condi,
                    fence: {
                        fenceName: item.fenceName,
                        fenceId: item.fenceId,
                        queryField: item.selectedQueryFields
                    },
                  });
                }
            }
        }
    });
    if (noPass) {
        var semantic = _.find(selectedSematics, sitem => {
            return sitem.semanticId == nodeInfo.codeUsage;
        })
        return { message: semantic.semanticName + '语义下的' + nodeInfo.caption + '条件未编辑完成，无法运行' };
    }
    if (differentTypeField) {
        return {
            message: '"' + differentTypeField.displayName + '"与"' + comparedField.displayName + '"的类型不一致'
        }
    }
    _.each(selectedSematics, function(item) {
        taskDetail.output.push({
            codeUsage: item.semanticId,
            displayName: item.semanticName || ""
        });
    });

    // _.each(sematicMap,function(value,key){
    //     taskDetail.output.push({
    //         codeUsage:value.id,
    //         displayName:value.name||""
    //     });
    // });
    // console.log(taskDetail);
    return {
        detail: taskDetail
    };
}
