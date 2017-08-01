initLocales(require.context('../../../locales/system-manage/', false, /\.js/));
require(['widget/department-tree', 
         'nova-dialog', 
         'nova-notify',
         'utility/utility',
         'utility/tagmanager/tagmanager'],
    function(Tree, Dialog, Notify) {
        var sysConfig = window.__CONF__.config_system;
        var selectedPeople = [];
        var selectedPeopleNames;
        var departmentTree;
        var roleTreeData;
        var roleTree;

        if(sysConfig.is_oversea){
            bootbox.setDefaults('locale', 'en_US');
        }else{
            bootbox.setDefaults('locale', 'zh_CN');
        }
        // bootbox.setDefaults('locale', 'zh_CN');

        function getRoleTreeData() {
            if (!roleTreeData) {
                $.getJSON("/userrole/list", function(rsp) {
                    hideLoader();
                    if (rsp.code == 0) {
                        roleTreeData = rsp.data;
                    }
                });
            }
            return roleTreeData;
        }

        function processSelect() {
            selectedPeople = [];
            selectedPeopleNames = [];
            var selectedNodes = departmentTree.getSelectedNodes();
            if (_.size(selectedNodes) > 0) {
                _.each(selectedNodes, function(node) {
                    if (Tree.isUser(node)) {
                        selectedPeople.push(node);
                        selectedPeopleNames.push(node.title);
                    }
                })
            }
        }

        function getSelectedPeopleIds() {
            return _.map(selectedPeople, function(item) {
                return item.data.userId;
            });
        }

        function getSelectedPeopleNames() {
            var userNames = _.map(selectedPeople, function(item) {
                return item.title;
            });
            return userNames.join(',');
        }

        function getSelectedRoleIds() {
            if (roleTree) {
                return _.map(roleTree.getSelectedNodes(), function(node) {
                    return node.key;
                });
            }
        }

        function getSelectedRoleNames() {
            if (roleTree) {
                var roleNames = _.map(roleTree.getSelectedNodes(), function(node) {
                    return node.title;
                });
                return roleNames.join(',');
            }
        }

        function getTypeName(type) {
            switch (type) {
                case 1:
                    return i18n.t('rolemanage.enum-addrole');
                case 2:
                    return i18n.t('rolemanage.enum-deleterole');
                case 3:
                    return i18n.t('rolemanage.enum-resetrole');
            }
        }

        function updateUserRoles(type) {
            var selectedPeopleIds = getSelectedPeopleIds();
            if (_.size(selectedPeopleIds) == 0) {
                Notify.show({
                    title: i18n.t('rolemanage.notify-selectuser'),
                    type: "warning"
                });
                return;
            }
            if (_.size(getSelectedRoleIds()) == 0) {
                Notify.show({
                    title: i18n.t('rolemanage.notify-selectrole'),
                    type: "warning"
                });
                return;
            }

            var msg = _.size(selectedPeopleIds) > 1 ?
                i18n.t('rolemanage.bootbox-changeusers') : i18n.t('rolemanage.bootbox-changeuser');
            bootbox.confirm(msg, function(rlt) {
                if (rlt) {
                    $.post("/userrole/updateuserrole", {
                        userid: selectedPeopleIds,
                        roleid: getSelectedRoleIds(),
                        type: type,
                        userName: getSelectedPeopleNames(),
                        roleName: getSelectedRoleNames(),
                        typeName: getTypeName(type)
                    }, function(rsp) {
                        if (rsp.code == 0) {
                            Notify.show({
                                title: i18n.t('rolemanage.notify-updaterolesuccess'),
                                type: "success"
                            });
                            renderInfo();
                        } else {
                            Notify.show({
                                title: i18n.t('rolemanage.notify-updaterolefailed'),
                                type: "danger"
                            });
                        }
                    }, 'json');
                }
            });
        }

        function renderInfo() {
            if (_.size(selectedPeople) > 1) {
                $('#auth-pane').show();
                $('#roles-section').hide();
                $('#user-name-label').text(i18n.t('rolemanage.label-selectedusers'));
                $('#user-name').val(selectedPeopleNames.join(','));
                renderRoleTree();
            } else if (_.size(selectedPeople) == 1) {
                var activeNode = selectedPeople[0];
                $('#auth-pane').show();
                $('#roles-section').show();
                $('#user-roles').empty();
                $('#user-name-label').text(i18n.t('rolemanage.label-username'));
                $('#user-name').val(activeNode.title);
                $.getJSON('/userrole/queryuserroles?userid=' + activeNode.data.userId, function(rsp) {
                    if (rsp.code != 0) {
                        Notify.show({
                            title: i18n.t('rolemanage.notify-getrolefailed'),
                            text: rsp.message,
                            type: "error"
                        });
                        return;
                    }

                    $('#tagmanager').tagsManager('empty');
                    _.each(rsp.data, function(role) {
                        $('#tagmanager').tagsManager('pushTag', role.name, false, role.roleID);
                    });
                });
                renderRoleTree();
            } else {
                $('#auth-pane').hide();
            }
        }

        function renderSingleUserInfo(node) {
            $('#auth-pane').show();
            $('#roles-section').show();
            $('#user-roles').empty();
            $('#user-name-label').text(i18n.t('rolemanage.label-username'));
            $('#user-name').val(node.title);
            $.getJSON('/userrole/queryuserroles?userid=' + node.data.userId, function(rsp) {
                if (rsp.code != 0) {
                    Notify.show({
                        title: i18n.t('rolemanage.notify-getrolefailed'),
                        text: rsp.message,
                        type: "error"
                    });
                    return;
                }

                $('#tagmanager').tagsManager('empty');
                _.each(rsp.data, function(role) {
                    $('#tagmanager').tagsManager('pushTag', role.name, false, role.roleID);
                });
            });
            renderRoleTree();
        }

        function renderRoleTree() {
            var treeContainer = $('#role-container');
            if (roleTree) {
                roleTree.reload();
            } else {
                treeContainer.addClass('role-tree');
                $(treeContainer).fancytree({
                    selectMode: 2,
                    clickFolderMode: 3,
                    checkbox: true,
                    iconClass: function(event, data) {
                        if (data.node.isFolder()) {
                            return "fa fa-folder";
                        } else {
                            return "fa fa-group";
                        }
                    },
                    // init: function(event, data) {
                    //     data.tree.visit(function(node) {
                    //         node.setExpanded(true);
                    //     });
                    // },
                    source: getRoleTreeData,
                    postProcess: function(event, data) {

                    },
                    select: function(event, data) {

                    }
                });
                roleTree = treeContainer.fancytree("getTree");
            }
        }

        function initTagManager() {
            $('#tagmanager').tagsManager({
                tagsContainer: '#user-roles',
                externalTagId: true,
                tagClass: 'tm-tag-info',
                handleSpliceTag: function(tagId, action) {
                    bootbox.confirm(i18n.t('rolemanage.bootbox-takerole'), function(rlt) {
                        if (rlt) {
                            action(); //原操作
                        }
                    });
                    return true;
                }
            });
            $('#tagmanager').on('tm:spliced', function(e, tag, tagId) {
                var selectedPeopleIds = getSelectedPeopleIds();
                if (_.size(selectedPeopleIds) == 0) {
                    Notify.show({
                        title: i18n.t('rolemanage.notify-selectuser'),
                        type: "warning"
                    });
                    return;
                }
                $.post("/userrole/updateuserrole", {
                    userid: selectedPeopleIds,
                    roleid: [tagId],
                    type: 2,
                    userName: getSelectedPeopleNames,
                    roleName: tag,
                    typeName: getTypeName(2)
                }, function(rsp) {
                    if (rsp.code != 0) {
                        Notify.show({
                            title: i18n.t('usermanage.notify-deletefailed'),
                            text: rsp.message,
                            type: "error"
                        });
                    } else {
                        Notify.show({
                            title: i18n.t('usermanage.notify-deletesuccess'),
                            type: "success"
                        });
                    }
                }, 'json');
            });
        }

        //创建部门树
        Tree.build({
            container: $('#department-tree'),
            expandAll: false,
            source: {
                url: '/department/listallnosuperadmin',
                data:{roleType:2}
            }
        }).config('select', function(event, data) {
            processSelect();
            renderInfo();
        }).config('click', function(event, data) {
            var node = data.node;
            if (data.targetType == 'title' && Tree.isUser(node)) {
                if (_.isEmpty(selectedPeople)) {
                    renderSingleUserInfo(node);
                } else {
                    if (!node.isSelected()) {
                        renderSingleUserInfo(node);
                    } else {
                        renderInfo();
                    }
                }
            }
        });
        departmentTree = $("#department-tree").fancytree("getTree");
        getRoleTreeData();
        initTagManager();

        // fancytree 过滤
        $("input[name=searchDepartment]").keyup(function(e) {
            var n;
            var opts = {
                autoExpand: true
            };
            var match = $(this).val();

            if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                $("button#btnResetSearchDepartment").click();
                return;
            }
            n = departmentTree.filterNodes(match, opts);

            $("button#btnResetSearchDepartment").attr("disabled", false);
            $("button#btnResetSearchDepartment").text(i18n.t('usermanage.button-clear')+"(" + n + ")");
            // $("span#matchesDepartment").text("(" + n + ")");
        });
        $("button#btnResetSearchDepartment").click(function() {
            $("input[name=searchDepartment]").val("");
            $("button#btnResetSearchDepartment").text(i18n.t('usermanage.button-clear'));
            // $("span#matchesDepartment").text("");
            departmentTree.clearFilter();
        }).attr('disabled', 'true');


        $('#role-add').click(function() {
            updateUserRoles(1);
        });
        $('#role-remove').click(function() {
            updateUserRoles(2);
        });
        $('#role-reset').click(function() {
            updateUserRoles(3);
        });

    });