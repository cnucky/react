
define([
    'jquery',
    'underscore',
    'nova-notify',
    '../tpl/spyDataAuthorization',
    '../module/store'
], function ($, _, Notify, authTpl,{store}) {
    var authTemplate = _.template(authTpl);

    var config = {
        add: "add",
        edit: "edit",
        delete: "delete",
        share: "share",
    };

    var nodeType = {
        table: 8,
        rule: 9,
        dir: 'dir',
    }

    var _role;

    var commandCheckData = [];
    var commandNotData = [];
    var commandTableCheckData = [];
    var commandTableNotData = [];

    /*{
     container:容器
     roleId:需要分配的角色ID
     }*/
    function build(args) {
        _role = args.role;
        $(args.container).empty().append(authTemplate());

        $.getJSON("/spycommon/getDataAuthResource", {
            roleId: _role.roleID,
        }).done(function (rsp) {
            if (rsp.code == 0) {
                if ($("#spy-resource-container").length > 0)
                    $("#spy-resource-container").jqxGrid('destroy');
                $("#spyAuthorization-panel .checkbox-table").append('<table id="spy-resource-container" style="outline: none;">'
                        //+ '<colgroup><col width="300px"></col><col width="75px"></col><col width="75px"></col><col width="75px"></col><col width="75px"></col></colgroup>'
                    + '<thead><tr><th class="task-head" style="padding: 8px 14px;">名称</th><th class="task-head" style="padding: 8px 14px;">添加</th><th class="task-head" style="padding: 8px 14px;">编辑</th><th class="task-head" style="padding: 8px 14px;">删除</th><th class="task-head" style="padding: 8px 14px;">传阅</th></tr></thead>'
                    + '<tbody></tbody></table>');
                // console.log(rsp.data);
                initTree(args, rsp.data);
            } else {
                Notify.show({
                    title: "获取指挥授权失败",
                    text: rsp.message,
                    type: "error"
                });
            }
        });
    }

    function initTree(args, data) {
        $('#spy-resource-container').fancytree({
            extensions: ["filter", "childcounter"],
            quicksearch: true,
            filter: {
                mode: "dimn",
                autoAppaly: true,
                hightlight: true
            },
            autoScroll: false,
            selectMode: 3,
            checkbox: true,
            source: data,
            //勾选权限
            select: function (event, data) {
                var result = {
                    resource: [],
                    AuditInfo: '',
                };

                function addNodes(node) {
                    if (node.data.isDir != 1) {
                        var temp = {
                            roleId: _role.roleID,
                            roleName: _role.name,
                            privateId: node.data.id,
                            privateName: node.data.name,
                            isDir: 0,
                            type: node.data.resourceType,   //资源类型
                        };
                        if (node.data.resourceType == nodeType['rule'])
                            temp.selectedSubPermission = ['read'];
                        result.resource.push(temp);
                    }

                    if (!data.node.isSelected() && node.data.resourceType != nodeType['rule']) {
                        for (var key in config) {
                            $("#" + coventResourceId(node.data.id) + "_" + config[key]).removeAttr('checked');
                        }
                    }

                    if (node.hasChildren()) {
                        _.each(node.getChildren(), function (child) {
                            addNodes(child);
                        })
                    }
                }


                addNodes(data.node);
                //result.resource = JSON.stringify(result.resource);
                if (data.node.isSelected()) {
                    commandCheckData=result.resource;
                    store.dispatch({type:'COMMONDCHECKDATA_GET',commandCheckData:commandCheckData});
                    //result.resource = JSON.stringify(result.resource);
                    // $.getJSON("/spycommon/addAuthResource", result).done(function (rsp) {
                    //     if (rsp.code != 0) {
                    //         Notify.show({
                    //             title: "授权失败",
                    //             text: rsp.message,
                    //             type: "error"
                    //         });
                    //     }
                    //     // data.node.load(true);
                    // });
                } else {
                    commandNotData= result.resource;
                    store.dispatch({type:'COMMONDNOTDATA_GET',commandNotData:commandNotData});
                    //result.resource = JSON.stringify(result.resource);
                    // $.getJSON("/spycommon/removeAuthedResource", result).done(function (rsp) {
                    //     if (rsp.code != 0) {
                    //         Notify.show({
                    //             title: "取消授权失败",
                    //             text: rsp.message,
                    //             type: "error"
                    //         });
                    //     }
                    //     // data.node.load(true);
                    // });
                }
            },
            minExpandLevel: 2,
            iconClass: function (event, data) {
                if (data.node.data.iconClass)
                    return data.node.data.iconClass;
                else if (data.node.data.isDir == 1)
                    return "fa fa-folder-open-o";
                else if (data.node.data.resourceType == nodeType['table'])
                    return "fa fa-table";
                else if (data.node.data.resourceType == nodeType['rule'])
                    return "fa fa-clipboard";
            },
            init: function (event, data) {
                if (args.expandAll) {
                    data.tree.visit(function (node) {
                        node.setExpanded(true);
                    });
                }

                $("#spyAuthorization-panel").on('click', '.checkbox-tree label', function (event) {
                    event.stopPropagation();

                    var $id = $(this).attr("for") || "";
                    var $idArray = $id.split("_");
                    //console.log($id,'ewd')
                    //console.log($idArray,'ewwecfewd')
                    setTreeData($idArray[$idArray.length - 1], $(this).prev().is(":checked"));
                });
                //var key = args.container.data("active-node");
                //key && data.tree.activateKey(key);
                if (_.isFunction(args.initCallback)) {
                    args.initCallback();
                }
            },
            activate: function (event, data) {
                if (!_.isUndefined(args.activateCallback))
                    args.activateCallback(event, data);
            },
            extensions: ["table"],
            table: {
                nodeColumnIdx: 0,
                indentation: 20,
            },
            renderColumns: function (event, data) {
                var node = data.node,
                    $tdlist = $(node.tr).find(">td");
                if (node.data.resourceType != nodeType['rule']) {
                    $tdlist.eq(0).css("padding-top", "0px").css("padding-bottom", "0px");
                    if (_.indexOf(node.data.selectedSubPermission, config['add']) >= 0)
                        $tdlist.eq(1).html('<div class="checkbox-tree checkbox-custom"><input type="checkbox" id="' + coventResourceId(node.data.id) + '_' + config['add'] + '" checked><label for="' + coventResourceId(node.data.id) + '_' + config['add'] + '" class="abled">&nbsp;</label></div>');
                    else
                        $tdlist.eq(1).html('<div class="checkbox-tree checkbox-custom"><input type="checkbox" id="' + coventResourceId(node.data.id) + '_' + config['add'] + '"><label for="' + coventResourceId(node.data.id) + '_' + config['add'] + '" class="abled">&nbsp;</label></div>');
                    if (_.indexOf(node.data.selectedSubPermission, config['edit']) >= 0)
                        $tdlist.eq(2).html('<div class="checkbox-tree checkbox-custom"><input type="checkbox" id="' + coventResourceId(node.data.id) + '_' + config['edit'] + '" checked><label for="' + coventResourceId(node.data.id) + '_' + config['edit'] + '" class="abled">&nbsp;</label></div>');
                    else
                        $tdlist.eq(2).html('<div class="checkbox-tree checkbox-custom"><input type="checkbox" id="' + coventResourceId(node.data.id) + '_' + config['edit'] + '"><label for="' + coventResourceId(node.data.id) + '_' + config['edit'] + '" class="abled">&nbsp;</label></div>');
                    if (_.indexOf(node.data.selectedSubPermission, config['delete']) >= 0)
                        $tdlist.eq(3).html('<div class="checkbox-tree checkbox-custom"><input type="checkbox" id="' + coventResourceId(node.data.id) + '_' + config['delete'] + '" checked><label for="' + coventResourceId(node.data.id) + '_' + config['delete'] + '" class="abled">&nbsp;</label></div>');
                    else
                        $tdlist.eq(3).html('<div class="checkbox-tree checkbox-custom"><input type="checkbox" id="' + coventResourceId(node.data.id) + '_' + config['delete'] + '" ><label for="' + coventResourceId(node.data.id) + '_' + config['delete'] + '" class="abled">&nbsp;</label></div>');
                    if (_.indexOf(node.data.selectedSubPermission, config['share']) >= 0)
                        $tdlist.eq(4).html('<div class="checkbox-tree checkbox-custom"><input type="checkbox" id="' + coventResourceId(node.data.id) + '_' + config['share'] + '" checked><label for="' + coventResourceId(node.data.id) + '_' + config['share'] + '" class="abled">&nbsp;</label></div>');
                    else
                        $tdlist.eq(4).html('<div class="checkbox-tree checkbox-custom"><input type="checkbox" id="' + coventResourceId(node.data.id) + '_' + config['share'] + '"><label for="' + coventResourceId(node.data.id) + '_' + config['share'] + '" class="abled">&nbsp;</label></div>');
                } else {
                    $tdlist.eq(0).css("padding-top", "0px").css("padding-bottom", "0px").attr("colspan", 5);
                    $tdlist.eq(1).addClass('hidden');
                    $tdlist.eq(2).addClass('hidden');
                    $tdlist.eq(3).addClass('hidden');
                    $tdlist.eq(4).addClass('hidden');
                }
            },
            //strings: {
            //    loading: i18n.t("casemanage.treeinfo.loading"),checkbox-custom
            //    loadError: i18n.t("casemanage.treeinfo.loadError"),
            //    moreData: i18n.t("casemanage.treeinfo.moreData"),
            //    noData: i18n.t("casemanage.treeinfo.noData")
            //}
        });
    }

    function setTreeData(right, isChecked) {
        //console.log(isChecked,'asasasasasasasasasasasas')
        var activeNode = $('#spy-resource-container').fancytree('getTree').getActiveNode();

        var result = {
            resource: [],
            AuditInfo: ''
        };
        if (activeNode.data.resourceType == nodeType['table'] && activeNode.data.isDir != 1) {
            result.resource.push({
                roleId: _role.roleID,
                roleName: _role.name,
                privateId: activeNode.data.id,
                privateName: activeNode.data.name,
                isDir: 0,
                type: nodeType['table'],   //资源类型
                selectedSubPermission: [right],
            });
        }

        if (!isChecked) { //是否选中
            activeNode.setSelected(true);
            activeNode.visit(function (node) {
                if (node.data.resourceType != nodeType['rule']) {
                    node.setSelected(true);
                    $("#" + coventResourceId(node.data.id) + "_" + right).prop("checked", true);
                    if (node.data.resourceType == nodeType['table'] && node.data.isDir != 1) {
                        result.resource.push({
                            roleId: _role.roleID,
                            roleName: _role.name,
                            privateId: node.data.id,
                            privateName: node.data.name,
                            isDir: 0,
                            type: nodeType['table'],   //资源类型
                            selectedSubPermission: [right],
                        });
                    }
                }
            });
            if (result.resource.length > 0) {
                commandTableCheckData=result.resource;
                store.dispatch({type:'COMMONDTABLECHECKDATA_GET',commandTableCheckData:commandTableCheckData});
                // result.resource = JSON.stringify(result.resource);
                // $.getJSON("/spycommon/addAuthResource", result).done(function (rsp) {
                //     if (rsp.code != 0) {
                //         Notify.show({
                //             title: "授权失败",
                //             text: rsp.message,
                //             type: "error"
                //         });
                //     }
                // });
            }
        } else {
            // Set children selected
            //activeNode.setSelected(false);
            activeNode.visit(function (node) {
                if (node.data.resourceType != nodeType['rule']) {
                    $("#" + coventResourceId(node.data.id) + "_" + right).removeAttr('checked');
                    if (node.data.resourceType == nodeType['table'] && node.data.isDir != 1) {
                        result.resource.push({
                            roleId: _role.roleID,
                            roleName: _role.name,
                            privateId: node.data.id,
                            privateName: node.data.name,
                            isDir: 0,
                            type: nodeType['table'],   //资源类型
                            selectedSubPermission: [right],
                        });
                    }
                }
            });

            if (result.resource.length > 0) {
                commandTableNotData= result.resource;
                store.dispatch({type:'COMMONDTABLENOTDATA_GET',commandTableNotData:commandTableNotData});
                // result.resource = JSON.stringify(result.resource);
                // $.getJSON("/spycommon/removeAuthedResource", result).done(function (rsp) {
                //     if (rsp.code != 0) {
                //         Notify.show({
                //             title: "取消授权失败",
                //             text: rsp.message,
                //             type: "error"
                //         });
                //     }
                // });
            }
        }
    }

    function coventResourceId(resourceId) {
        var part = resourceId.split(':');
        return part.join('-');
    }

    function reload() {
        $('#spy-resource-container').fancytree("getTree").reload();
    }

    return {
        build: build,
        reload: reload,
    }
});
