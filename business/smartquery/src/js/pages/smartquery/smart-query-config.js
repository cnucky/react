'use strict';
require([
    'fancytree-all',
    'nova-dialog',
    'nova-utils',
    'nova-notify',
    'nova-alert',
    '../../tpl/smartquery/tpl-config-group-container',
    'jquery',
], function(Tree, Dialog, Util, Notify, Alert, tpl_container) {
    tpl_container = _.template(tpl_container);

    var _groupInfo = [];
    var _dataList = [];
    var _request_params = {
        caption: 'IM即时聊天通联表',
        category: 1,
        centerCode: 100000,
        dirId: 202,
        dirType: 1,
        name: 'IM',
        ownerId: 0,
        source: 1,
        srcTypeId: 314,
        taskType: -1,
        typeId: 314,
        zoneId: 1,
        favored: true,
        parentId: 1,
    };
    var _datatypename = 'IM即时聊天通联表';

    init();


    function init() {
        refreshGroupInfo();
        $('#topbar .breadcrumb .crumb-trail').remove();
        $('.breadcrumb').append('<li class="crumb-trail">' + _datatypename + '</li>');
    }

    function refreshGroupInfo() {
        $.getJSON('/smartquery/smartquery/getdatatypequeryconfig', _request_params).done(function(rsp) {
            var oDataList = rsp.data;
            var oInfo = [];
            //为每个field添加id
            for (var i = 0; i < oDataList.length; i++) {
                oDataList[i].id = i;
                //把当前数据类型所有对应字段抽出
                _dataList.push(_.omit(oDataList[i], ['fieldOrder', 'groupOrder', 'group']));
                //抽出分组信息
                oInfo.push(_.pick(oDataList[i], ['fieldOrder', 'groupOrder', 'group', 'id']));
            }
            var oGroup = _.groupBy(oInfo, 'group');
            for (var groupName in oGroup) {
                oGroup[groupName] = _.sortBy(oGroup[groupName], 'fieldOrder');
                _groupInfo.push(oGroup[groupName]);

            }
            _groupInfo = _.sortBy(_groupInfo, function(e) {
                return e[0].groupOrder;
            });
            renderGroupInfo();
            renderDataList();
        });
    }

    function renderGroupInfo() {
        for (var i = 0; i < _groupInfo.length; i++) {
            var curGroup = _groupInfo[i];
            var tpl_params = {};
            tpl_params.groupName = curGroup[0].group;
            tpl_params.groupId = 'group-' + curGroup[0].group;
            tpl_params.items = [];
            for (var j = 0; j < curGroup.length; j++) {
                var item = {};
                var curItem = _.find(_dataList, function(e) {
                    return e.id == curGroup[j].id;
                })
                item.itemName = curItem.caption;
                item.itemId = 'field-' + curItem.fieldName;
                tpl_params.items.push(item);

            }
            var groupHTML = tpl_container(tpl_params);
            $('#preview-container').append(groupHTML);


        }
    }

    function renderDataList() {
        for (var i = 0; i < _dataList.length; i++) {
            _dataList[i].title = _dataList[i].caption;
            _dataList[i].extraClass = 'nv-data';

        }
        var treeData = [];
        var tree = {};
        tree.children = _dataList;
        tree.extraClass = 'nv-dir';
        tree.folder = true;
        tree.expanded = true;
        tree.title = _datatypename;
        treeData.push(tree);

        inflateTree($('#datalist-tree'), treeData, defaultIconMapper);
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
        $("input[name=search-input]").keyup(function(event) {
            var targetTree = $container.fancytree('getTree');
            if (!targetTree) {
                return;
            }

            var count, opts = {
                autoExpand: true
            };
            var match = $(this).val();

            if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                $("button#btn-reset").click();
                return;
            }
            count = targetTree.filterNodes(match, opts);

            $("button#btn-reset").attr("disabled", false);
            $("span#matches").text("(" + count + ")");
        });
        //搜索条件清除按钮
        $("button#btn-reset").click(function() {
            var targetTree = $container.fancytree('getTree');
            if (!targetTree) {
                return;
            }

            $("input[name=search-input]").val("");
            $("span#matches").text("");
            targetTree.clearFilter();
            $(this).attr('disabled', 'disabled');
        });
    }
    var defaultIconMapper = function(event, data) {
        if (data.node.folder) {
            return "fa fa-folder fa-fw";
        } else {
            return "fa fa-database fa-fw";
        }
    };

    function makeNodeDraggable(data) {

    }

    hideLoader();






});