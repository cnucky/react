initLocales(require.context('../../../locales/system-manage/', false, /\.js/));
require([
    'widget/group-tree',
    'widget/department-tree',
    'nova-bootbox-dialog',
    'nova-dialog',
    'nova-notify',
    'underscore',
    'widget/group-info',
    'widget/user-info',
    'widget/name-validator',
    'utility/utility'
], function(Tree, DepartmentTree, bootbox, Dialog, Notify, _, GroupInfo, UserInfo, NameValidator) {
    var selectPeople;
    //BootBox.setDefaults('locale', 'zh_CN');

    function processSelect(selectNodes) {
        selectPeople = [];
        _.each(selectNodes, function(node) {
            if (node.extraClasses.indexOf('nv-group-people') != 1) {
                selectPeople.push(node.key);
            }
        });
    }

    function getParams(group) {
        return {
            name: group.userGroupName,
            description: group.description,
            id: group.userGroupId
        };
    }

    function reloadTree() {
        groupTree.reload();
    }


    // 用户组详情
    GroupInfo.init({
        container: $('#form-container'),
        deleteCallback: function(group) {
            bootbox.confirm('确认删除当前用户组？', function(rlt) {
                if (rlt) {
                    $.post('/usergroup/delete', {
                        id: group.userGroupId
                    }, function(rsp) {
                        if (rsp.code == 0) {
                            reloadTree();
                            $('#form-container').html('');
                        }
                        if (!_.isEmpty(rsp.message)) {
                            Notify.show({
                                title: rsp.message,
                                type: 'warning'
                            });
                        }
                    }, 'json');
                }
            });
        },
        editCallback: function(group) {
            GroupInfo.edit();
        },
        completeEditCallback: function(group) {
            $.post('/usergroup/update', getParams(group), function(rsp) {
                if (rsp.code != 0) {
                    Notify.show({
                        title: "更新失败",
                        text: rsp.message,
                        type: "error"
                    });
                } else {
                    reloadTree();
                    GroupInfo.endEdit();
                    Notify.show({
                        title: "更新成功",
                        type: "success"
                    });
                }
            }, 'json');
        }
    });


    // 用户详情
    UserInfo.init({
        container: $('#form-container'),
        disableEdit: true,
        editCallback: function(user) {
            UserInfo.edit();
        },
        completeCallback: function(user) {
            $.post('/user/update', user, function(rsp) {
                if (rsp.code != 0) {
                    Notify.show({
                        title: "更新失败",
                        text: rsp.message,
                        type: "error"
                    });
                } else {
                    reloadTree();
                    UserInfo.endEdit();
                    Notify.show({
                        title: "更新成功",
                        type: "success"
                    });
                }
            }, 'json');
        }
    });


    var choosenGroup;
    var userToDel;
    var choosenGroupNode; //add by zhangu
    // 创建用户组树
    //用户组树
    $('#group-tree').fancytree({
        extensions: ["filter", "childcounter"],
        quicksearch: true,
        filter: {
            mode: "dimn",
            autoAppaly: true,
            hightlight: true
        },
        selectMode: 3,
        checkbox: false,
        clickFolderMode: 1,
        source: {
            url: "/usergroup/list"
        },
        // init: function(event, data) {
        //     data.tree.visit(function(node) {
        //         node.setExpanded(true);
        //     });
        // },
        postProcess: function(event, data) {
            hideLoader();
            var groups = data.response.data;
            _.each(groups, function(g) {
                g.hideCheckbox = true;
            });
            data.result = groups;
        },
        autoScroll: true,
        childcounter: {
            deep: true,
            hideZeros: true,
            hideExpanded: true
        },
        iconClass: function(event, data) {
            if (data.node.extraClasses.indexOf('nv-group') != -1) {
                return "fa fa-group";
            } else {
                return "fa fa-user";
            }
        },
        loadChildren: function(event, data) {
            // Apply parent's state to new child nodes
            if (this.selectMode == 3) {
                data.node.fixSelection3AfterClick();
            }
        },
        activate: function(event, el) {
            choosenGroup = null;
            if (el.node.extraClasses == "nv-group") {
                $('#btn-delete-users').attr('disabled', '');
                GroupInfo.renderGroupInfo(el.node.data);
                choosenGroup = el.node.data;
                choosenGroupNode = el.node;
            } else {
                userToDel = el.node.data;
                $('#btn-delete-users').removeAttr('disabled');
                choosenGroup = el.node.parent.data;
                choosenGroupNode = el.node.parent;
                UserInfo.renderUserInfo(el.node.data);
            }
        }
    });
    // Tree.build({
    //     container: $('#group-tree')
    // }).config('activate', function(event, data) {
    //     if (Tree.isUser(data.node)) {
    //         UserInfo.renderUserInfo(data.node.data);
    //     } else {
    //         GroupInfo.renderGroupInfo(data.node.data);
    //     };
    // });


    // fancytree 过滤
    var groupTree = $("#group-tree").fancytree("getTree");
    $("input[name=searchGroup]").keyup(function(e) {
        var n;
        var opts = {
            autoExpand: true
        };
        var match = $(this).val();

        if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
            $("button#btnResetSearchGroup").click();
            return;
        }
        n = groupTree.filterNodes(match, opts);

        $("button#btnResetSearchGroup").attr("disabled", false);
        $("span#matchesGroup").text("(" + n + ")");
    });
    $("button#btnResetSearchGroup").click(function() {
        $("input[name=searchGroup]").val("");
        $("span#matchesGroup").text("");
        groupTree.clearFilter();
    }).attr('disabled', 'true');

    // 添加用户组
    $("#btn-add-group").on("click", function(event) {
        $.get("add-group-dialog.html", function(result) {
            Dialog.build({
                title: "新增用户组",
                content: result,
                rightBtnCallback: function() {
                    // 确认
                    var name = $("#add-group-name").val().trim();
                    var description = $("#add-group-description").val().trim();
                    if (!NameValidator.validate(name,"名称"))
                        return;

                    $.post('/usergroup/add', {
                        name: name,
                        description: description
                    }).done(function(data) {
                        Dialog.dismiss();
                        data = JSON.parse(data);
                        if (data.code == 0) {
                            Notify.show({
                                title: "新增用户组成功",
                                type: "success"
                            });
                        } else {
                            Notify.show({
                                title: "新增用户组失败",
                                text: data.message,
                                type: "error"
                            });
                        }
                        reloadTree();
                    });
                }
            }).show();
        });
    });

    $('#btn-add-users').on('click', function(e) {
        if (!choosenGroup) {
            alert("请选择用户组");
            return;
        }

        var userIdsToAdd;

        Dialog.build({
            title: "添加到用户组：" + choosenGroup.userGroupName,
            content: '<div id="department-tree"></div>',
            rightBtnCallback: function() {
                if (userIdsToAdd == undefined || userIdsToAdd.length <= 0) {
                    Notify.show({
                        text: "未读取到需要添加的用户，请先选择用户！",
                        type: "error"
                    });
                } else {
                    $.post('/usergroup/addusers', {
                        id: choosenGroup.userGroupId,
                        userids: userIdsToAdd
                    }).done(function(data) {
                        choosenGroup = null;
                        Dialog.dismiss();
                        data = JSON.parse(data);

                        var succeed = data.code == 0;
                        if (succeed) {
                            groupTree.reload();
                        }

                        Notify.show({
                            title: succeed ? "添加成功" : "添加失败：",
                            text: succeed ? "" : data.message,
                            type: succeed ? "success" : "error"
                        });
                    });
                }
            }
        }).show(function() {
            //创建部门树
            var groupChildrenNodes = choosenGroupNode.getChildren();
            var groupChildrenNodesId = [];
            _.each(groupChildrenNodes, function(nodeItem, index) {
                groupChildrenNodesId.push(nodeItem.data.userId);
            })
            $.get('/usergroup/getGroupUsers', {
                userList: groupChildrenNodesId
            }).done(function(rspData) {
                rspData = JSON.parse(rspData);
                DepartmentTree.build({
                    container: $('#department-tree'),
                    source: rspData.data,
                    clickFolderMode: 1,
                    expandAll: true,
                    selectMode: 3
                }).config('select', function(event, data) {
                    userIdsToAdd = [];
                    _.each(data.tree.getSelectedNodes(), function(node) {
                        if (node.extraClasses == 'nv-department-people')
                            return userIdsToAdd.push(node.data.userId);
                    });
                }).config('activate', function(event, data) {

                });
                var tree = $("#department-tree").fancytree("getTree");
            });
        })
    });

    $('#btn-delete-users').on('click', function(e) {
        if (!userToDel) {
            bootbox.alert("请选择要删除的用户");
            return;
        }
        bootbox.confirm('确认从用户组"' + choosenGroup.userGroupName + '" 删除用户' + userToDel.loginName + '吗？', function(rlt) {
            if (rlt) {
                $.post('/usergroup/deleteusers', {
                    id: choosenGroup.userGroupId,
                    userids: [userToDel.userId]
                }).done(function(data) {
                    userToDel = null;
                    data = JSON.parse(data);

                    if (data.code == 0) {
                        groupTree.reload();
                        Notify.show({
                            title: "删除成功",
                            type: "success"
                        });
                    } else {
                        Notify.show({
                            title: "删除失败",
                            text: data.message,
                            type: "error"
                        });
                    }
                });
            }
        });
    });
});