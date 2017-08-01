initLocales(require.context('../../../locales/system-manage/', false, /\.js/));
require([
    'tpl/role/tpl-authdetail-table',
    './spyDataAuthorization',
    'widget/authority-tree',
    'nova-dialog',
    'nova-notify',
    'jquery',
    'underscore',
    'utility/utility'
], function(tpl, spyAuth, Tree, Dialog, Notify, $, _) {
    var Config = window.__CONF__.framework;
    var sysConfig = window.__CONF__.config_system;
    var _dataAuthLevelMap = new Object();
    _dataAuthLevelMap[i18n.t('rolemanage.level-none')] = 0;
    _dataAuthLevelMap[i18n.t('rolemanage.level-low')] = 1;
    _dataAuthLevelMap[i18n.t('rolemanage.level-middle')] = 2;
    _dataAuthLevelMap[i18n.t('rolemanage.level-high')] = 3;

    var systemCenterAuthable = Config['systemCenterAuthable'];
    var spyIntegrationAuthable = Config['spyIntegrationAuthable'];

    $('#btn-add-new').on('click', function(e) {
        showAddRoleDialog(false);
    });

    function showAddRoleDialog(emptyMark) {
        $.get("add-role-dialog.html", function(result) {
            Dialog.build({
                title: i18n.t('rolemanage.dialog-addrole'),
                content: result,
                rightBtn: i18n.t('rolemanage.dialog-rightbtn'),
                rightBtnCallback: function() {
                    // 提交
                    var name = $("#add-role-name").val().trim();
                    if (_.isEmpty(name)) {
                        Notify.show({
                            title: i18n.t('rolemanage.notify-inputname'),
                            type: "error"
                        });
                        return;
                    }

                    var type = $("#add-role-type").val().trim();
                    var desc = $("#add-role-description").val().trim();

                    $.post('/userrole/createrole', {
                        name: name,
                        type: type,
                        description: desc
                    }).done(function(data) {
                        Dialog.dismiss();
                        data = JSON.parse(data);
                        if (data.code == 0) {
                            loadRoles();
                            Notify.show({
                                title: i18n.t('usermanage.notify-createsuccess'),
                                type: "success"
                            });
                        } else {
                            Notify.show({
                                title: i18n.t('usermanage.notify-createfailed'),
                                text: data.message,
                                type: "error"
                            });
                        }
                    });
                }
            }).show(function() {
                $('#form-add').localize();
                if (emptyMark == true) {
                    jqueryI18next.init(i18next, $);
                    $(document).localize();
                    $("#alert-container-fixed").show();
                }
            });
        });
    }

    var curRole;
    tpl = _.template(tpl);

    $('#btn-edit').on('click', function(e) {
        $('#role-name-edit').val(curRole.name);
        $('#role-description-edit').val(curRole.desc);

        $('#info-edit').removeClass('hide');
        $('#info-view').addClass('hide');
    });

    $('#btn-remove').on('click', function(e) {
        var result = confirm(i18n.t('rolemanage.confirm-deleterole') + curRole.name);
        if (result) {
            $.post('/userrole/deleterole', {
                roleName: curRole.name,
                id: curRole.roleID
            }).done(function(result) {
                result = JSON.parse(result);
                if (result.code == 0) {
                    loadRoles();
                    Notify.show({
                        title: i18n.t('usermanage.notify-deletesuccess'),
                        type: "success"
                    });
                } else {
                    Notify.show({
                        title: i18n.t('usermanage.notify-deletefailed'),
                        text: result.message,
                        type: "error"
                    });
                }
            });
        }
    });

    var exitEditMode = function() {
        $('#info-edit').addClass('hide');
        $('#info-view').removeClass('hide');
    };
    $('#btn-cancel').on('click', function(e) {
        exitEditMode();
    });

    $('#btn-save').on('click', function(e) {
        var name = $('#role-name-edit').val().trim();
        if (_.isEmpty(name)) {
            Notify.show({
                title: i18n.t('rolemanage.notify-inputname'),
                type: "error"
            });
            return;
        }

        var description = $('#role-description-edit').val().trim();
        // 更新角色信息
        $.post('/userrole/updaterole', {
                id: curRole.roleID,
                name: name,
                roleName: curRole.name,
                description: description
            })
            .done(function(result) {
                result = JSON.parse(result);
                if (result.code == 0) {
                    loadRoles();
                    exitEditMode();
                    Notify.show({
                        title: i18n.t('usermanage.notify-updatesuccess'),
                        type: "success"
                    });
                } else {
                    Notify.show({
                        title: i18n.t('usermanage.notify-updatefailed'),
                        text: result.message,
                        type: "error"
                    });
                }
            });
    });

    loadRoles();
    var done = {};

    function showRoleDetail() {
        if (curRole) {
            showLoader();
            $('#role-detail').show();
            $('#role-detail-tray').removeClass('hide');
            $('#role-description').text(curRole.desc || i18n.t('usermanage.option-null'));
            $('#role-type').text(getAuthorityTypeName());

            checkRoleType();
            var types = getAuthorityTypes();
            done = {};
            _.each(types, function(type, index) {
                var treeContainer = $("#tab-type" + type);
                done[type] = false;
                if (treeContainer.hasClass("auth-tree") && type != 8) {
                    treeContainer.fancytree("getTree").reload();
                } else if (type == 8) {
                    treeContainer.addClass("auth-tree");
                    spyAuth.build({
                        container: treeContainer,
                        role: curRole,
                        expandAll: true,
                        initCallback: function() {
                            done[type] = true;
                            if (_.reduce(_.values(done), function(memo, val) {
                                    return memo && val;
                                })) {
                                hideLoader();
                            }
                        },
                    });
                } else {
                    treeContainer.addClass("auth-tree");
                    Tree.build({
                        container: treeContainer,
                        selectMode: type == 2 ? 2 : 3,
                        source: function() {
                            return {
                                url: "/userrole/roledetail",
                                data: {
                                    roleId: curRole.roleID,
                                    resourceType: type,
                                    roleType:2
                                }
                            }
                        },
                        lazyLoad: function(event, data) {
                            if (data.node.isFolder()) {
                                data.result = {
                                    url: "/userrole/roledetail",
                                    data: {
                                        id: curRole.roleID,
                                        type: type,
                                        dirid: data.node.key
                                    }
                                };
                            }
                        },
                        loadEnd: function(event, data) {
                            done[type] = true;
                            if (_.reduce(_.values(done), function(memo, val) {
                                    return memo && val;
                                })) {
                                hideLoader();
                                $('.form-detail').localize();
                            }
                        },
                        //勾选权限
                        select: function(event, data) {
                            var allNodes = [];

                            function addNodes(node) {
                                var curNode = {
                                    roleId: parseInt(curRole.roleID),
                                    roleName: curRole.name,
                                    privateId: node.key,
                                    privateName: node.data.name,
                                    isDir: parseInt(node.data.isDir),
                                    type: parseInt(node.data.resourceType),
                                    selectedSubPermission: node.data.selectedSubPermission
                                };
                                allNodes.push(curNode);

                                if ((type == 0 || type == 1 || type == 5) && node.hasChildren()) {
                                    _.each(node.getChildren(), function(child) {
                                        addNodes(child);
                                    })
                                }
                            }

                            addNodes(data.node);

                            if (data.node.isSelected() && data.node.data.selectedSubPermission[0] != i18n.t('rolemanage.level-none')) {
                                $.post("/userrole/addresource", {
                                    node: allNodes
                                }).done(function(rsp) {
                                    rsp = JSON.parse(rsp);
                                    if (rsp.code != 0) {
                                        Notify.show({
                                            title: i18n.t('rolemanage.notify-authfailed'),
                                            text: rsp.message,
                                            type: "error"
                                        });
                                    }
                                    // data.node.load(true);
                                });
                            } else {
                                $.post("/userrole/removeresource", {
                                    node: allNodes
                                }).done(function(rsp) {
                                    rsp = JSON.parse(rsp);
                                    if (rsp.code != 0) {
                                        Notify.show({
                                            title: i18n.t('rolemanage.notify-cancelauthfailed'),
                                            text: rsp.message,
                                            type: "error"
                                        });
                                    }
                                    // data.node.load(true);
                                });
                            }
                        },
                        //权限详情
                        showDetail: (type == 1 ? function(event, data) {
                            var level = data.node.data.selectedSubPermission[0];
                            $.getJSON("/userrole/getresourcedetail", {
                                id: data.node.key,
                                type: type,
                                authlevel: _dataAuthLevelMap[level]
                            }, function(rsp) {
                                if (rsp.code == 0) {
                                    showAuthDetail(rsp.data);
                                }
                            });
                        } : undefined)
                    });
                }
            });

        } else {
            hideLoader();
        }
    }

    function showAuthDetail(detail) {
        Dialog.build({
            title: i18n.t('rolemanage.dialog-roledetail'),
            content: tpl({
                data: detail
            }),
            hideFooter: true
        }).show(function() {
            $('#nv-dialog-body').localize();
            $('#nv-dialog-body').addClass('pn');
        });
    }

    function loadRoles() {
        var roleList = $('#role-list');
        roleList.empty();

        $.getJSON('/userrole/list', function(rsp) {
            // hideLoader();
            if (rsp.code == 0) {
                var ul = makeupRoleList(rsp.data);
                ul.find('.role-list-item:first').addClass('active').siblings().removeClass('active');
                roleList.append(ul);

                var emptyCount = 0;
                var initMarked = true;
                _.each(rsp.data, function(item) {
                    if (_.isEmpty(item.children)) {
                        emptyCount++
                    } else {
                        if (initMarked == true) {
                            curRole = item.children[0];
                            showRoleDetail();
                            initMarked = false;
                        }
                    }
                    if (emptyCount == _.size(rsp.data)) {
                        $("#role-detail-tray").removeClass('hide');
                        $("#role-detail").hide();
                        showAddRoleDialog(true);
                    }
                });
            } else {
                Notify.show({
                    title: i18n.t('rolemanage.notify-getrolelistfailed'),
                    text: rsp.message,
                    type: "error"
                });
                hideLoader();
            }
        });
    }

    function makeupRoleList(items) {
        var ul = $('<ul>').addClass('nav tray-nav').attr('data-nav-animate', 'zoomIn');
        _.each(items, function(item) {
            if (item.folder) {
                var li = $('<li>');
                li.addClass('animated animated-short zoomIn role-list-title');
                li.append(item.title);
                ul.append(li);
                if (item.children && item.children.length > 0) {
                    _.each(item.children, function(child) {
                        var li = $('<li>');
                        li.addClass('animated animated-short zoomIn role-list-item');
                        var a = $('<a>');
                        a.attr('href', '#');
                        a.append($('<span>').addClass('fa fa-lg fa-group'));
                        a.append($('<span>').append(child.title));
                        li.click(function() {
                            curRole = child;
                            $(this).addClass('active').siblings().removeClass('active');
                            exitEditMode();
                            showRoleDetail();
                        });
                        li.append(a);
                        ul.append(li);
                    });
                }
            }
        });
        return ul;
    }

    function checkRoleType() {
        if (curRole) {
            var types = getAuthorityTypes();
            switch (curRole.roleType) {
                case 1: //用户管理员
                case 3: //日志管理员
                    $('#auth-tabs li').hide();
                    _.each(types, function(type) {
                        $('#tab' + type).show();
                    })
                    $('#auth-tabs > .type-tab').removeClass('active');
                    $('#auth-content > .tab-pane').removeClass('active');
                    $('#tab2').addClass('active');
                    $('#tab-type2').addClass('in active');
                    break;
                case 2: //权限管理员
                    $('#auth-tabs li').hide();
                    _.each(types, function(type) {
                        $('#tab' + type).show();
                    })
                    $('#auth-tabs > .type-tab').removeClass('active');
                    $('#auth-content > .tab-pane').removeClass('active');
                    $('#tab0').addClass('active');
                    $('#tab-type0').addClass('in active');
                    break;
                default:
                    $('#auth-tabs li').hide();
                    _.each(types, function(type) {
                        $('#tab' + type).show();
                    })
                    $('#auth-tabs > .type-tab').removeClass('active');
                    $('#auth-content > .tab-pane').removeClass('active');
                    $('#tab0').addClass('active');
                    $('#tab-type0').addClass('in active');
                    break;
            }
        }
    }

    function getAuthorityTypes() {
        switch (curRole.roleType) {
            case 0:
                if (sysConfig.is_oversea) {
                    return [0];
                } else {
                    if (spyIntegrationAuthable == 2) {
                        return [0, 8];
                    } else if (spyIntegrationAuthable == 1) {
                        return [0, 1, 5, 8];
                    } else {
                        return [0, 1, 5];
                    }
                }
                break;
            case 2:
                if (sysConfig.is_oversea) {
                    return [0, 2];
                } else {
                    if (spyIntegrationAuthable == 2) {
                        return [0, 8];
                    } else if (spyIntegrationAuthable == 1) {
                        return [0, 1, 2, 5, 8];
                    } else {
                        return [0, 1, 2, 5];
                    }
                }
                break;
            case 1:
            case 3:
                return [2];
                break;
        }
    }

    function getAuthorityTypeName() {
        switch (curRole.roleType) {
            case 0:
                return i18n.t('rolemanage.enum-nomal');
                break;
            case 1:
                return i18n.t('rolemanage.enum-useradmin');
                break;
            case 2:
                return i18n.t('rolemanage.enum-authadmin');
                break;
            case 3:
                return i18n.t('rolemanage.enum-logadmin');
                break;
        }
    }
});