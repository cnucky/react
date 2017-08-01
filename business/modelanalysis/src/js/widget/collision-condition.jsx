var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var _ = require('underscore');
var Notify = require('nova-notify');
var tagmanager = require('utility/tagmanager/tagmanager');
// require('bootstrap-multiselect');
var MultiSelect = require('widget/multiselect');
require('./collision-condition.less');
var datasourcePanel = require('../tpl/collision/datasource-panel')

var taskType;
var semanticDef;
var fieldsData;
var selectedSematicId;

var tagGenerateId = 0;

var TypeSelect = React.createClass({
    checkoutBenHandle: function() {
        /*
        data.onAdvancedMode = !data.onAdvancedMode;
        this.setState({
            onAdvancedMode: data.onAdvancedMode
        });
        */
        this.props.onChange();
    },
    render:function(){
        var checkoutBenHandle = this.checkoutBenHandle;
        return (<button type="button" onClick={checkoutBenHandle} className="btn btn-default btn-sm pull-right">切换到高级模式</button>)
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
        return (<div className="form-group">
            <label className="col-md-3 control-label">碰撞类型</label>
                <div className="col-md-9">
                {
                    <MultiSelect config={this.props.configType} updateData={true} onChange={this.handleSelectType} data={type}/>
                }
                </div>
        </div>)
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
})


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
        _.each(this.props.data, function(dataItem) {
            if (dataItem.key == selectedKey) {
                dataItem.index = -1;
            } else {
                dataItem.index = 0;
            }
        });
    },
    updateSemanticFields: function(item, semanticId) {
        if (semanticId) {
            item.selectedFields = item.selectedFields || [];
            var index = _.findIndex(item.semantic, function(semantic) {
                return semantic.semanticId == semanticId;
            });
            if (index >= 0 && _.isEmpty(item.selectedFields)) {
                var tmp = item.semantic[index];
                // item.selectedFields = [];
                _.each(tmp.fieldList, function(field) {
                    if (field.preferd > 0) {
                        item.selectedFields.push(field.fieldName);
                    }
                });
                item.semantic.splice(index, 1);
                item.semantic.unshift(tmp);
                return true;
            }
        }
        return false;
    },
    render: function() {
        if (!_.isEmpty(this.props.data)) {
            var addon;
            var updateSemanticFields = this.updateSemanticFields;
            var handleSelectField = this.handleSelectField;
            var semanticId = this.props.semanticId;

            if (this.props.taskType == 105) { //差集分析
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
                        _.map(this.props.data, function(item){
                            var needUpdateField = updateSemanticFields(item, semanticId);
                            return (
                            <div className="form-group">
                            <div className="col-md-3">
                            <label className="field-label" style={{maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis'}} title={item.caption}>{item.caption}</label>
                            </div>
                            <div className="col-md-9">
                            <MultiSelect multiple="multiple" identity={item} updateData={true} onChange={handleSelectField}
                            config={{
                                buttonWidth: '200px',
                                enableFiltering: true,
                                enableClickableOptGroups: false,
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
})


var CollisionCondition = React.createClass({
    getInitialState: function() {
        var semanticId = !this.props.semanticId ? selectedSematicId : undefined;
        return {
            semanticId: selectedSematicId,
            applyId: semanticId
        };
    },
    onSemanticChange: function(semanticId) {
        selectedSematicId = semanticId;
        this.setState({
            semanticId: semanticId,
            applyId: semanticId
        });
    },
    render: function() {
        return (
            <div className="form-horizontal">
            <CollisionSemantic semantic={this.props.semantic} onChange={this.onSemanticChange} semanticId={this.state.semanticId}/>
            <CollisionFields data={this.props.fieldsData} semanticId={this.state.applyId} taskType={this.props.taskType}/>
            </div>)
    }
})

module.exports.render = function(container, _semanticDef, _fieldsData, _taskType, _semanticId) {
    semanticDef = _semanticDef;
    fieldsData = _fieldsData;
    taskType = _taskType;
    if (_semanticId) {
        selectedSematicId = _semanticId;
    } else {
        selectedSematicId = semanticDef[0].semanticId;
    }
    ReactDOM.render(<CollisionCondition semantic={semanticDef} semanticId={_semanticId} fieldsData={fieldsData} taskType={taskType}/>, container);
}

module.exports.constructTaskDetail = function() {
    var selectedSematic = _.find(semanticDef, function(item) {
        return item.semanticId == selectedSematicId;
    });
    var taskDetail = {
        srcDataTypes: [],
        semanticId: selectedSematicId,
        output: selectedSematic.semanticName || ""
    };
    _.each(fieldsData, function(item) {
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
    });
    return taskDetail;
}

module.exports.renderMixed = function(typeContainer, semanticContainer,
    _semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource ,selectMode) {
    var modeChange = function(){
        //alert("modeChange");
        selectMode("low");
    }
    ReactDOM.render(<TypeSelect onChange = {modeChange} /> , document.getElementById('mode-change'));

    // render CollisionType
    var configType = {
        disableIfEmpty: false,
        enableFiltering: false,
        buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14'
    }
    var typeChange = function(type) {
        taskType = type;
        task.analysisType = type;
        selectTypeAndSemantic(task.analysisType, task.semanticId);
        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource , task.semanticId);
    }
    ReactDOM.render(<CollisionType configType={configType} onChange={typeChange} type={task.analysisType}/>, typeContainer);

    // render CollisionSemantic
    semanticDef = _semanticDef;
    console.log(semanticDef);
    selectedSematicId = task.semanticId || (!_.isEmpty(semanticDef) ? semanticDef[0].semanticId : undefined);
    var semanticChange = function(semanticId) {
        task.semanticId = semanticId;
        selectedSematicId = task.semanticId;
        selectTypeAndSemantic(task.analysisType, task.semanticId);

        // 语义改变，条件也改变
        renderCollisionFields(document.getElementById('collision-fields'), task.selectedDataSource , task.semanticId);
    }
    ReactDOM.render(<CollisionSemantic semantic={semanticDef} onChange={semanticChange} semanticId={selectedSematicId}/>, semanticContainer);

    // render CollisionDataSource
    initDataSource(dataSource);
    _.each(task.selectedDataSource, function(ds, key) {
        updateDSTrees(key, true);
    });

    taskType = task.analysisType;

    function renderCollisionFields(fieldsContainer, _fieldsData, semanticId) {
        // render CollisionFieldsData
        fieldsData = _fieldsData;
        ReactDOM.render(<CollisionFields data={fieldsData} semanticId={semanticId} taskType={taskType}/>, fieldsContainer);
    }


    function updateDSTags() {
        $('#tagmanager').tagsManager('empty');
        _.each(task.selectedDataSource, function(value, key) {
            if (value) {
                if (!_.isNumber(value.tagId)) {
                    value.tagId = ++tagGenerateId;
                }
                $('#tagmanager').tagsManager('pushTag', value.caption, false, value.tagId);
            }
        });
    }

    function selectHandler(event, data) {
        if (data.node.extraClasses.indexOf("nv-data") != -1||data.node.extraClasses.indexOf("nv-task") != -1) {
            selectDataSource(data.node.key, data.node.data, data.node.isSelected());
            updateDSTags();
            updateDSFields();
        }
    }

    function updateDSFields() {
        //low
        _.each(task.selectedDataSource, function(ds) {
            if (!ds.semantic) {
                $.getJSON("/modelanalysis/collision/getdatasourceinfo", {
                    centercode: ds.centerCode,
                    zoneid: ds.zoneId,
                    typeid: ds.typeId
                }, function(rsp) {
                    if (rsp.code == 0) {
                        ds.semantic = rsp.data;
                        if(!ds.allFields){//获取所有列定义
                            let allFields = [];
                            _.each(ds.semantic,function(sitem){
                                _.each(sitem.fieldList,function(fitem){
                                    allFields.push({
                                        fieldName: fitem.fieldName,
                                        fieldType: fitem.fieldType,
                                        displayName: fitem.caption
                                    });
                                });
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


    function updateDSTrees(key, selected) {
        var sysTree = $("#system-data").fancytree("getTree");
        var personalTree = $("#personal-data").fancytree("getTree");

        var node = sysTree.getNodeByKey(key);
        if (node) {
            node.setSelected(selected);
        }
        node = personalTree.getNodeByKey(key);
        if (node) {
            node.setSelected(selected);
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
            var dataKey;
            _.each(task.selectedDataSource, function(value, key) {
                if (value && value.tagId == tagId) {
                    dataKey = key;
                }
            });
            if (dataKey) {
                updateDSTrees(dataKey, false);
            }
        });

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

        $('#datasource-panel').on('shown.bs.collapse', function() {
            $('#datasource-edit').html("收起");
        });
        $("#datasource-panel").on('hidden.bs.collapse', function() {
            $('#datasource-edit').html("编辑");
        });
        if (_.isEmpty(task.selectedDataSource)) {
            $('#datasource-panel').collapse('show');
        } else {
            $('#datasource-panel').collapse('hide');
        }
    }
}

function isDifferentType(newField, selectedFields){
    return _.find(selectedFields, function(item){
        return !isTypeEqual(item.fieldType, newField.fieldType);
    })
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

module.exports.constructTaskDetailMixed = function() {
    //console.log(semanticDef);
    var selectedSematic = _.find(semanticDef, function(item) {
        return item.semanticId == selectedSematicId;
    });
    var taskDetail = {
        srcDataTypes: [],
        semanticId: selectedSematicId,
        output: [{codeUsage: selectedSematic.semanticId, displayName:selectedSematic.semanticName || ""}]//selectedSematic.semanticName || ""
    };

    var differentTypeField, comparedField, allFields = [];
    _.each(fieldsData, function(item) {
        if (!differentTypeField) {
            _.each(item.selectedFields, function (filed) {
                var origField = _.find(item.allFields, function (item) {
                    return item.fieldName == filed;
                });
                comparedField = isDifferentType(origField, allFields);
                if (comparedField) {
                    differentTypeField = origField;
                }
                allFields.push(origField);
            });
        }

        taskDetail.srcDataTypes.push({
            index: item.index || 0,
            inputNode: item.key,
            dataType: {
                centerCode: item.centerCode || "",
                zoneId: item.zoneId || 0,
                typeId: item.typeId || 0
            },
            fieldList: [{codeUsage:selectedSematic.semanticId,field:item.selectedFields}]//item.selectedFields
        });
    });

    if (differentTypeField) {
        return {
            message: '"' + differentTypeField.displayName + '"与"' + comparedField.displayName + '"的类型不一致'
        }
    }
    return {
        detail: taskDetail
    };
}
