var $ = require('jquery');
var _ = require('underscore');
var tagmanager = require('utility/tagmanager/tagmanager');
var Notify = require('nova-notify');
// require('bootstrap-multiselect');

var task;
var dataSource;
var semanticDef;
var selectedDataSource = {};
var tagGenerateId = 0;

function updateDSTags() {
    $('#tagmanager').tagsManager('empty');
    _.each(selectedDataSource, function(value, key) {
        if (value) {
            if (!_.isNumber(value.tagId)) {
                value.tagId = ++tagGenerateId;
            }
            $('#tagmanager').tagsManager('pushTag', value.caption, false, value.tagId);
        }
    });
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

function updateDSTreesWithDS(datasource) {
    var sysTree = $("#system-data").fancytree("getTree");
    var personalTree = $("#personal-data").fancytree("getTree");

    sysTree.visit(function(node) {
        if (datasource[node.key]) {
            node.selcted = true;
        } else {
            node.selected = false;
        }
    });
    personalTree.visit(function(node) {
        if (datasource[node.key]) {
            node.selected = true;
        } else {
            node.selected = false;
        }
    });
    sysTree.render();
    personalTree.render();
}

function updateDSFields(semanticId) {

    function updateDSField(ds, field) {
        var select = $(field).find('select');
        var optGroups = _.map(ds.semantic, function(semantic) {
            var group = {
                label: semantic.semanticName
            };
            group.children = _.map(semantic.fieldList, function(item) {
                return {
                    label: item.caption,
                    title: item.caption,
                    value: item.fieldName,
                    selected: _.contains(ds.selectedFields, item.fieldName)
                };
            });
            return group;
        })
        select.multiselect('dataprovider', optGroups);
        $("#datasource-fields").append(field);
    }

    function updateSemanticFields(ds, semanticId) {
        if (semanticId) {
            var index = _.findIndex(ds.semantic, function(semantic) {
                return semantic.semanticId == semanticId;
            });
            if (index >= 0) {
                var tmp = ds.semantic[index];
                ds.selectedFields = [];
                _.each(tmp.fieldList, function(item) {
                    if (item.preferd > 0) {
                        ds.selectedFields.push(item.fieldName);
                    }
                });
                ds.semantic.splice(index, 1);
                ds.semantic.unshift(tmp);
            }
        }
    }

    if (_.isEmpty(selectedDataSource)) {
        $(".datasource-fields").hide();
    } else {
        $(".datasource-fields").show();
        // $("#datasource-fields select").multiselect('destory');
        $("#datasource-fields").empty();
        var tpl = _.template('<div class="form-group"><label class="col-md-3 field-label"><%- caption %></label><div class="col-md-9"><select multiple="multiple"></select></div></div>');
        _.each(selectedDataSource, function(ds) {
            var field = $(tpl(ds));
            ds.selectedFields = ds.selectedFields || [];
            field.find('select').multiselect({
                // disableIfEmpty: true,
                maxHeight: 300,
                enableFiltering: true,
                enableClickableOptGroups: false,
                nonSelectedText: "未选择字段",
                buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14',
                onChange: function(option, checked, select) {
                    if (checked) {
                        ds.selectedFields.push(option.val());
                    } else {
                        ds.selectedFields.splice(_.indexOf(ds.selectedFields, option.val()), 1);
                    }
                }
            });
            if (ds.semantic) {
                updateSemanticFields(ds, semanticId);
                updateDSField(ds, field);
            } else {
                $.getJSON("/modelanalysis/collision/getdatasourceinfo", {
                    centercode: ds.centerCode,
                    zoneid: ds.zoneId,
                    typeid: ds.typeId
                }, function(rsp) {
                    if (rsp.code == 0) {
                        ds.semantic = rsp.data;
                        updateSemanticFields(ds, semanticId);
                        updateDSField(ds, field);
                    } else {

                    }
                })
            }
        });

        //其他条件
        if (task.analysisType == 105) {
            //差集分析
            $(".datasource-addon").show();
            // $("#datasource-fields select").multiselect('destory');
            $("#datasource-addon").empty();
            var addonTpl = _.template('<div class="form-group"><label class="col-md-3 field-label"><%- caption %></label><div class="col-md-9"><select></select></div></div>');
            var addon = $(addonTpl({
                caption: "首集合"
            }));
            addon.find('select').multiselect({
                maxHeight: 300,
                buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14',
                onChange: function(option, checked, select) {
                    var selectedKey = option.val();
                    _.each(selectedDataSource, function(ds, key) {
                        if (key == selectedKey) {
                            ds.index = -1;
                        } else {
                            ds.index = 0;
                        }
                    })
                }
            });
            var optGroups = _.map(selectedDataSource, function(item, key) {
                return {
                    label: item.caption,
                    title: item.caption,
                    value: key
                };
            })
            addon.find('select').multiselect('dataprovider', optGroups)
            $("#datasource-addon").append(addon);
        } else {
            $(".datasource-addon").hide();
        }
    }
}

module.exports.init = function(_task, _dataSource, _semanticDef, selectDataSource, selectTypeAndSemantic) {
    task = _task;
    task.selectedDataSource = selectedDataSource;
    dataSource = _dataSource;
    semanticDef = _semanticDef;

    $('#collision-type').multiselect({
        buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14',
        onChange: function(option, checked, select) {
            task.analysisType = parseInt(option.val());
            if (task.analysisType == 104) {
                //差集分析
                updateDSFields(task.semanticId);
            }
            selectTypeAndSemantic(task.analysisType, task.semanticId);
        }
    });

    var semanticTpl = _.template('<option value="<%- semanticId %>"><%- semanticName %></option>');
    var semanticSelect = $('#collision-content');
    _.each(semanticDef, function(item) {
        semanticSelect.append(semanticTpl(item));
    });
    semanticSelect.val(0);
    semanticSelect.multiselect({
        disableIfEmpty: true,
        enableFiltering: true,
        maxHeight: 300,
        nonSelectedText: "请选择",
        buttonClass: 'multiselect dropdown-toggle btn btn-info fw600 fs14',
        onChange: function(option, checked, select) {
            task.semanticId = parseInt(option.val());
            selectTypeAndSemantic(task.analysisType, task.semanticId);
            updateDSFields(task.semanticId);
        }
    });

    $('#tagmanager').tagsManager({
        tagsContainer: '#collision-datasource',
        externalTagId: true,
        tagClass: 'tm-tag-info'
    });
    $('#tagmanager').on('tm:spliced', function(e, tag, tagId) {
        var dataKey;
        _.each(selectedDataSource, function(value, key) {
            if (value && value.tagId == tagId) {
                dataKey = key;
            }
        });
        if (dataKey) {
            updateDSTrees(dataKey, false);
        }
    });

    $('#datasource-panel').on('shown.bs.collapse', function() {
        $('#datasource-edit').html("收起");
    });
    $("#datasource-panel").on('hidden.bs.collapse', function() {
        $('#datasource-edit').html("编辑");
    });
    if (_.isEmpty(selectedDataSource)) {
        $('#datasource-panel').collapse('show');
    }

    var selectHandler = function(event, data) {
        if (data.node.extraClasses.indexOf("nv-data") != -1 || data.node.extraClasses.indexOf("nv-task")) {
            selectDataSource(data.node.key, data.node.data, data.node.isSelected());
            updateDSTags();
            updateDSFields(task.semanticId);
        }
    };
    $('#system-data').fancytree({
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
    }
}

module.exports.updateDataSources = function(datasource) {
    selectedDataSource = datasource;
    updateDSTreesWithDS(datasource);
    updateDSTags();
    updateDSFields(task.semanticId);
}