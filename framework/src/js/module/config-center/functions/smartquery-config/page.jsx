define([
    'fancytree-all',
    'nova-dialog',
    'nova-utils',
    'nova-notify',
    'nova-alert',
    'module/config-center/functions/smartquery-config/tpl-config-group-container',
    'jquery',
], function(Tree, Dialog, Util, Notify, Alert, tpl_container) {
    const smartqueryConfigInit = (function(){
    initLocales();
    tpl_container = _.template(tpl_container);

    var _dataList = [];
    var _firstInit = true;
    var _dragDatafieldActivated = false;
    var _curNodeData = null;
    var _curDataType = undefined;
    var _editGroupNameActivated = false;

    initPage();

    function initPage() {
        $.getJSON('/smartquery/getdatasource').done(function(rsp) {
            initDatatypeTree($('#dir-tree'), rsp.data.tree, rsp.data.favoredDir, function(event, data) {
                if (data.node.folder) {
                    return "fa fa-folder fa-fw";
                } else {
                    return "fa fa-database fa-fw";
                }
            });

        });
        initControlButtons();

    }

    function initDatatypeTree($container, treeData, favorDir, iconMapper) {

        treeData = filterPersonalDatatypes(treeData);
        var nodeTpl = _.template('<span class="fancytree-title unselectable"><%- title %></span><span id="favor-toggle" class="fancytree-action-icon fs16 ml10 text-muted fa fa-star"></span>');
        $container.fancytree({
            extensions: ["filter"],
            quicksearch: true,
            filter: {
                mode: "dimn",
                autoAppaly: true,
                hightlight: true
            },
            selectMode: 2,
            clickFolderMode: 1,
            checkbox: false,
            autoScroll: true,
            source: treeData,
            iconClass: iconMapper,



            lazyLoad: function(event, data) {
                data.result = {
                    url: "/collision/listmodelingtask",
                    data: {
                        taskId: data.node.data.typeId
                    }
                };
            },
            activate: function(event, data) {
                if (!data.node.folder) {
                    if (_firstInit) {
                        $('#top-container').css({
                            'display': 'block'
                        });


                    }
                    initDatatype(data.node.data);
                }
            }
        });
        //标签树搜索(过滤)逻辑
        $("input[name=search-input-left]").keyup(function(event) {
            var targetTree = $container.fancytree('getTree');
            if (!targetTree) {
                return;
            }

            var count, opts = {
                autoExpand: true
            };
            var match = $(this).val();

            if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                $("button#btn-reset-left").click();
                return;
            }
            count = targetTree.filterNodes(match, opts);

            $("button#btn-reset-left").attr("disabled", false);
            $("span#matches-left").text("(" + count + ")");
        });
        //搜索条件清除按钮
        $("button#btn-reset-left").click(function() {
            var targetTree = $container.fancytree('getTree');
            if (!targetTree) {
                return;
            }

            $("input[name=search-input-left]").val("");
            $("span#matches-left").text("");
            targetTree.clearFilter();
            $(this).attr('disabled', 'disabled');
        });

    }

    function filterPersonalDatatypes(treeData) {
            var result = [];
            result.push(_.find(treeData,function(e){return e.dirId==12;}))
            return result;
  
    };


    //config logic begins here


    function initDatatype(curDatatype) {
        _curDataType = curDatatype;
        $.getJSON('/smartquery/getdatatypequeryconfig', curDatatype).done(function(rsp) {
            var oDataList = rsp.data;
            var groupInfo = generateGroupInfo(oDataList);
            renderGroupInfo(groupInfo);
            renderDataFields(curDatatype.caption);


        });
        $('#topbar .breadcrumb .crumb-trail').remove();
        $('.breadcrumb').append('<li class="crumb-trail">' + curDatatype.caption + '</li>');
        $('#caption').empty().append(curDatatype.caption);
    }

    function generateGroupInfo(oDataList) {
        var oInfo = [];
        var groupInfo = [];
        _dataList = [];

        //为每个field添加id
        for (var i = 0; i < oDataList.length; i++) {
            //把当前数据类型所有对应字段抽出
            _dataList.push(_.omit(oDataList[i], ['fieldOrder']));
            //抽出分组信息
            oInfo.push(_.pick(oDataList[i], ['fieldOrder', 'fieldName', 'groupOrder', 'group']));
        }

        //中间分组显示不包括groupOrder为-1的未分组字段
        oInfo = _.reject(oInfo, function(e) {
            return e.groupOrder == -1;
        });
        if (oInfo.length == 0) {
            $('#preview-container').empty();
            addGroup('默认分组');
            return groupInfo;
        } else {
            var oGroup = _.groupBy(oInfo, 'group');
            for (var groupName in oGroup) {
                oGroup[groupName] = _.sortBy(oGroup[groupName], 'fieldOrder');
                groupInfo.push(oGroup[groupName]);

            }
            groupInfo = _.sortBy(groupInfo, function(e) {
                return e[0].groupOrder;
            });
            return groupInfo;

        }
    }

    function renderGroupInfo(groupInfo) {
        //中间分组显示不包括groupOrder为-1的未分组字段
        if (groupInfo.length == 0) {
            return;
        } else {
            $('#preview-container').empty();
            for (var i = 0; i < groupInfo.length; i++) {
                var curGroup = groupInfo[i];
                var tpl_params = {};
                tpl_params.groupName = curGroup[0].group;
                tpl_params.groupId = 'group-' + curGroup[0].group;
                tpl_params.items = [];
                for (var j = 0; j < curGroup.length; j++) {
                    var item = {};
                    var curItem = _.find(_dataList, function(e) {
                        return e.fieldName == curGroup[j].fieldName;
                    })
                    item.itemName = curItem.caption;
                    item.itemId = 'field-' + curItem.fieldName;
                    tpl_params.items.push(item);

                }
                var groupHTML = tpl_container(tpl_params);
                $('#preview-container').append(groupHTML);
                for (var j = 0; j < tpl_params.items.length; j++) {
                    bindRemoveField($('#' + tpl_params.items[j].itemId + ' i.remove-span'));
                }
                bindFieldSortable($('#' + tpl_params.groupId + ' .group-list'));
                bindGroupEditEvents($('#' + tpl_params.groupId));



            }
            bindGroupSortable($('#preview-container'));
        }

    }

    function renderDataFields(caption) {
        if (_firstInit) {
            var treeData = generateTreeData(caption);
            inflateTree($('#datafields-tree'), treeData, defaultIconMapper);
            _firstInit = false;
        } else {
            refreshTree(caption);
        }


    }

    function generateTreeData(caption) {
        var freeFields = [];
        for (var i = 0; i < _dataList.length; i++) {
            if (_dataList[i].groupOrder == -1) {
                var freeField = _.extend({}, _dataList[i]);
                freeField.title = _dataList[i].caption;
                freeField.key = _dataList[i].fieldName;
                freeField.extraClasses = 'nv-data';
                freeFields.push(freeField);
            }

        }
        var treeData = [];
        var rootNode = {};
        rootNode.children = freeFields;
        rootNode.extraClasses = 'nv-dir';
        rootNode.folder = true;
        rootNode.expanded = true;
        rootNode.title = caption;
        rootNode.key = 'rootNode';
        treeData.push(rootNode);
        return treeData;
    }

    function inflateTree($container, treeData, iconMapper) {
        $container.fancytree({
            extensions: ["filter"],
            quicksearch: true,
            filter: {
                mode: "dimn",
                autoAppaly: true,
                hightlight: true
            },
            selectMode: 2,
            clickFolderMode: 1,
            checkbox: false,
            autoScroll: true,
            source: treeData,
            iconClass: iconMapper,

            // 第一次创建时
            createNode: function(event, data) {
                makeNodeDraggable(data);

            },

        });
        //标签树搜索(过滤)逻辑
        $("input[name=search-input-right]").keyup(function(event) {
            var targetTree = $container.fancytree('getTree');
            if (!targetTree) {
                return;
            }

            var count, opts = {
                autoExpand: true
            };
            var match = $(this).val();

            if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                $("button#btn-reset-right").click();
                return;
            }
            count = targetTree.filterNodes(match, opts);

            $("button#btn-reset-right").attr("disabled", false);
            $("span#matches-right").text("(" + count + ")");
        });
        //搜索条件清除按钮
        $("button#btn-reset-right").click(function() {
            var targetTree = $container.fancytree('getTree');
            if (!targetTree) {
                return;
            }

            $("input[name=search-input-right]").val("");
            $("span#matches-right").text("");
            targetTree.clearFilter();
            $(this).attr('disabled', 'disabled');
        });
    }

    function refreshTree(caption) {
        caption = caption || _curDataType.caption;
        var treeData = generateTreeData(caption);
        $('#datafields-tree').fancytree('getTree').reload(treeData);

    }


    var defaultIconMapper = function(event, data) {
        if (data.node.folder) {
            return "fa fa-folder fa-fw";
        } else {
            return "fa fa-database fa-fw";
        }
    };


    function makeNodeDraggable(nodeData) {
        var $span = $(nodeData.node.span);
        if ($span.hasClass('nv-data')) {
            draggablize(nodeData, $span, function() {
                var elementWidth = $('.group-list').width() * 0.29;
                var dragEl = "<li class='group-item' id='field-" + nodeData.node.data.fieldName + "' style='width:" + elementWidth + "px'><span class='media'>" + nodeData.node.data.caption + "</span><i class='remove-span fa fa-times'></i></li>";

                return dragEl;
            });
        }
    }


    function draggablize(nodeData, target, helper) {
        target.draggable({
            cursor: 'pointer',
            cursorAt: {
                left: 195
            },
            revert: "invalid",
            zIndex: 100,
            connectToSortable: '.group-list',
            appendTo: '#preview-container',
            helper: helper ? helper : 'clone',
            distance: 10,
            start: function(event, ui) {
                _dragDatafieldActivated = true;
                _curNodeData = nodeData;
            },
            stop: function(event, ui) {
                _dragDatafieldActivated = false;
                _curNodeData = null;
                // nodeData.tree.getNodeByKey('rootNode').removeChild(nodeData.tree.getNodeByKey(nodeData.node.key));
            },

        });
    }

    function bindRemoveField($span) {
        $span.on('click', function() {
            var id = $(this).closest('.group-item').attr('id');
            var fieldName = id.slice(6);

            for (var i = 0; i < _dataList.length; i++) {
                if (_dataList[i].fieldName == fieldName) {
                    _dataList[i].groupOrder = -1;
                    break;
                }
            }
            $(this).closest('.group-item').remove();
            refreshTree();

        })
    }

    function bindFieldSortable($groupContainer) {
        $groupContainer.sortable({
            connectWith: '.group-list',
            // helper: 'clone',
            stop: function(event, ui) {
                // ui.item.removeAttr('style');
                $(event.target).closest('.group-container').removeClass('concave-box');
                ui.item.removeAttr('style');
            },
            receive: function(event, ui) {
                if (_dragDatafieldActivated && _curNodeData) {
                    _curNodeData.tree.getNodeByKey('rootNode').removeChild(_curNodeData.tree.getNodeByKey(_curNodeData.node.key));
                    var curField = _.find(_dataList, function(e) {
                        return e.fieldName == _curNodeData.node.key;
                    });
                    if (!curField) {
                        console.log('找不到对应的fieldName!');
                    } else {
                        curField.groupOrder = -2;
                        bindRemoveField($('#field-' + _curNodeData.node.key + ' i.remove-span'));
                    }
                }
                $(event.target).closest('.group-container').removeClass('concave-box');

            },
            over: function(event, ui) {

                $(event.target).closest('.group-container').addClass('concave-box');
            },
            out: function(event, ui) {
                $(event.target).closest('.group-container').removeClass('concave-box');
            }

        });
    }

    function bindGroupSortable($previewContainer) {
        $previewContainer.sortable({

        });

    }

    function bindGroupEditEvents($groupContainer) {

        //bind tooltip
        $groupContainer.children('div.group-line').children('i').tooltip();

        //bind edit groupName
        $groupContainer.children('div.group-line').children('i.edit-span').on('click', function(event) {
            if (!_editGroupNameActivated) {
                _editGroupNameActivated = true;
                var originalGroupName = $groupContainer.children('div.group-line').children('span.group-name').html();
                $(this).hide();
                var that = this;
                $groupContainer.children('div.group-line').children('span.group-name').remove();
                $groupContainer.children('div.group-line').prepend('<div class="temp-div"><input class="edit-input gui-input" placeholder="' + originalGroupName + '""></input><i class="confirm-edit-group-name-btn fa fa-check"></i><i class="cancel-edit-group-name-btn fa fa-times"></i></div>');
                $('.confirm-edit-group-name-btn').on('click', function() {
                    confirmEdit();
                });

                $('.cancel-edit-group-name-btn').on('click', function() {
                    $groupContainer.children('div.group-line').children('div.temp-div').remove();
                    $groupContainer.children('div.group-line').prepend('<span class="group-name">' + originalGroupName + '</span>');
                    $(that).css({
                        display: 'inline-block'
                    });
                    _editGroupNameActivated = false;
                });

                $(window).on('keydown', function(event) {
                    if (event.keyCode == 13) {
                        if (_editGroupNameActivated) {
                            confirmEdit();
                        }
                    }
                })

                function confirmEdit() {
                    var newGroupName = $('.edit-input').val()
                    if (newGroupName == '' || newGroupName == null || newGroupName == undefined) {
                        Notify.show({
                            title: '分组名称不能为空！',
                            type: "warning"
                        });
                    } else if (validateRepetition(newGroupName)) {
                        $groupContainer.children('div.group-line').children('div.temp-div').remove();
                        $groupContainer.children('div.group-line').prepend('<span class="group-name">' + newGroupName + '</span>');
                        $(that).css({
                            display: 'inline-block'
                        });
                        _editGroupNameActivated = false;
                    }

                }
            } else {

                Notify.show({
                    title: '请勿同时编辑两个分组名称！',
                    type: "warning"
                });
            }

        });

        //bind clear all fields
        $groupContainer.children('div.group-line').children('i.group-clear').on('click', function(event) {
            clearAllFields();
        });


        function clearAllFields() {
            $groupContainer.children('ul.group-list').children('li').each(function(e) {
                var id = $(this).attr('id');
                var fieldName = id.slice(6);

                for (var i = 0; i < _dataList.length; i++) {
                    if (_dataList[i].fieldName == fieldName) {
                        _dataList[i].groupOrder = -1;
                        break;
                    }
                }

                refreshTree();
                $groupContainer.children('ul.group-list').empty();

            });
        }


        //bind clear fields and remove group
        $groupContainer.children('div.group-line').children('i.group-remove').on('click', function(event) {
            clearAllFields();
            $groupContainer.remove();
            if ($('#preview-container').children('.group-container').length == 0) {
                addGroup('默认分组');
            }
        });
    }

    function initControlButtons() {
        $('.top-panel-button-form').tooltip();
        $('#btn-create-new-group').on('click', function() {
            var newGroupName = $('.top-panel-button-form input').val();
            if (newGroupName == "" || newGroupName == null || newGroupName == undefined) {
                Notify.show({
                    title: '新建分组名不能为空！',
                    type: "warning"
                });
            } else if (validateRepetition(newGroupName)) {
                addGroup(newGroupName);
                $('.top-panel-button-form input').val('');
            }
        });
        $('#btn-clear-all-fields').on('click', function() {
            clearAllFields();
        });
        $('#btn-remove-all-groups').on('click', function() {
            clearAllFields();
            $('#preview-container').empty();
            addGroup('默认分组');
        });

        $('#btn-cancel').on('click', function() {
            initDatatype(_curDataType);
        });
        $('#btn-save-changes').on('click', function() {
            saveConfig();
        });
        $('#btn-sync').on('click', function() {
            Dialog.build({
                title: "确定同步？",
                content: "<div id='warning-message'>同步字段会丢弃当前选中数据类型的所有分组展示信息，然后获取该类型最新所有字段并添加到一个默认分组。仅当你确认该数据类型的字段发生改变，或不再想要当前分组展示信息才应该进行此操作。</div>",
                rightBtnCallback: function(e) {
                    e.preventDefault();

                    syncDatatype();

                    $.magnificPopup.close();
                }
            }).show();
        });
    }

    function addGroup(newGroupName) {
        var tpl_params = {};
        tpl_params.groupName = newGroupName;
        tpl_params.groupId = 'group-' + newGroupName;
        tpl_params.items = [{
            itemName: '',
            itemId: ''
        }];

        var groupHTML = tpl_container(tpl_params);
        $('#preview-container').append(groupHTML);
        $('#' + tpl_params.groupId + ' ul.group-list').empty();
        bindFieldSortable($('#' + tpl_params.groupId + ' .group-list'));
        bindGroupEditEvents($('#' + tpl_params.groupId));
    }

    function clearAllFields() {
        $('ul.group-list').each(function() {
            $(this).empty();
        });
        for (var i = 0; i < _dataList.length; i++) {
            _dataList[i].groupOrder = -1;
        }
        refreshTree();
    }

    function validateRepetition(newGroupName) {
        var result = true;
        $('span.group-name').each(function() {
            if ($(this).html() == newGroupName) {
                Notify.show({
                    title: '分组名已存在！',
                    type: "warning"
                });
                result = false;
            }
        });
        return result;
    }

    function saveConfig(isSync) {
        isSync = isSync || false;
        var post_params = {};
        post_params.centerCode = _curDataType.centerCode;
        post_params.zoneId = _curDataType.zoneId;
        post_params.dataTypeId = _curDataType.typeId;
        var config = [];
        $('#preview-container .group-container').each(function(oIndex) {
            let coIndex = oIndex;
            let groupName = $('span.group-name', this).html();
            $('li.group-item', this).each(function(iIndex) {
                var fieldName = $(this).attr('id').slice(6);
                var field = _.extend(_.find(_dataList, function(e) {
                    return e.fieldName == fieldName;
                }), {
                    groupOrder: coIndex,
                    fieldOrder: iIndex,
                    group: groupName

                });
                if(!field.hasOwnProperty('isGisField')){
                    field.isGisField = 0;
                }
                // field.isGisField = field.isGisField == undefined ? 0 : field.isGisField;
                config.push(field);

            });

        });
        for (var i = 0; i < _dataList.length; i++) {
            if (_dataList[i].groupOrder == -1) {
                config.push(_dataList[i])
            }
        }
        post_params.config = config;
        $.post('/smartquery/updatedatatypequeryconfig', post_params).done(function(rsp) {
            if (JSON.parse(rsp).code != 0) {
                Notify.show({
                    title: '保存失败！',
                    type: "error"
                });
            } else {
                if (isSync) {
                    Notify.show({
                        title: '同步成功！',
                        type: "success"
                    });
                } else {
                    Notify.show({
                        title: '保存成功！',
                        type: "success"
                    });
                }

            }
        });
    }

    function syncDatatype() {
        $.getJSON('/smartquery/getDataTypeColDef', _.extend(_.pick(_curDataType, ['centerCode', 'typeId', 'zoneId']),{'isWithFavor':0})).done(function(rsp) {
            if (rsp.code == 0) {
                var groupInfo = generateSyncGroupInfo(rsp.data.outputColumnDescList);
                renderGroupInfo(groupInfo);
                renderDataFields(_curDataType.caption);
                setTimeout(saveConfig(true),200);

            } else {
                Notify.show({
                    title: '同步出错！',
                    type: "error"
                });
            }

        });
    }

    function generateSyncGroupInfo(oDataList) {
        var groupInfo = [];
        var defaultGroup = [];
        _dataList = [];

        for (var i = 0; i < oDataList.length; i++) {
            let index = i;
            var obj = {};
            obj.fieldName = oDataList[i].columnName;
            obj.groupOrder = 0;
            obj.group = '默认分组';
            obj.caption = oDataList[i].displayName;
            obj.codeTag = oDataList[i].codeTag;
            obj.common = (oDataList[i].common != 0);
            obj.fieldType = oDataList[i].columnType;
            obj.isGisField = 0;
            _dataList.push(obj);
            //抽出分组信息
            defaultGroup.push(_.extend(_.pick(obj, ['fieldName', 'groupOrder', 'group']), {
                'fieldOrder': index
            }));
        }
        groupInfo.push(defaultGroup)
        return groupInfo;


    }


    hideLoader();

});
    return {
        smartqueryConfigInit:smartqueryConfigInit
    }
});