//init i18n
initLocales(require.context('../../../locales/system-manage', false, /\.js/));
require([
    'widget/department-tree',
    'widget/department-info',
    'widget/user-info',
    '../../tpl/group/tpl-reset-password-dialog',
    '../../module/user/jc-password-strength-progress-bar',
    'nova-dialog',
    'nova-alert',
    'nova-bootbox-dialog',
    'nova-notify',
    'nova-utils',
    'underscore',
    'utility/utility'
], function(Tree, DepartmentInfo, UserInfo, tplResetDialog, PasswordTip, Dialog, Alert, bootbox, Notify, Util, _) {
    //bootbox.setDefaults('locale', 'zh_CN');
    tplResetDialog = _.template(tplResetDialog);

    var selectedPeople;
    hideLoader(); // 放到合适的位置

    function processSelect(selectedNodes) {
        selectedPeople = [];
        _.each(selectedNodes, function(node) {
            if (node.extraClasses.indexOf('nv-department-people') != -1) {
                selectedPeople.push(node.key);
            }
        })
    }

    function getParams(department) {
        return {
            name: department.departmentName,
            description: department.description,
            id: department.departmentId,
            pid: department.parentDepartmentId
        };
    }

    function reloadTree(key) {
        departmentTree.reload().then(function() {
            if (key != undefined) {
                departmentTree.activateKey(key);
                var activeNode = departmentTree.getActiveNode();
                activeNode.setExpanded(true);
                UserInfo.renderUserInfo(activeNode.data);
            }
            var rootNode = departmentTree.getRootNode().children[0];
            rootNode.setExpanded(true);
        });
    }

    //部门详情
    DepartmentInfo.init({
        container: $('#form-container'),
        deleteCallback: function(department) {
            if (department.departmentId < 0) {
                Notify.show({
                    title: i18n.t('usermanage.notify-cantdeletetop'),
                    type: 'warning'
                });
                return;
            }
            bootbox.confirm(i18n.t('usermanage.bootbox-deletedepconfirm'), function(rlt) {
                if (rlt) {
                    $.post('/department/delete', {
                        departmentId: department.departmentId,
                        departmentName: department.departmentName
                    }, function(rsp) {
                        if (rsp.code == 0) {
                            reloadTree();
                            $('#form-container').html('');
                            Notify.show({
                                title: i18n.t('usermanage.notify-deletesuccess'),
                                type: "success"
                            });
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
        editCallback: function(department) {
            DepartmentInfo.edit();
        },
        completeCallback: function(department) {
            $.post('/department/update', getParams(department), function(rsp) {
                if (rsp.code != 0) {
                    Notify.show({
                        title: i18n.t('usermanage.notify-updatefailed'),
                        text: rsp.message,
                        type: "error"
                    });
                } else {
                    var activeNode = departmentTree.getActiveNode();
                    reloadTree(activeNode.key);
                    DepartmentInfo.endEdit();
                    Notify.show({
                        title: i18n.t('usermanage.notify-updatesuccess'),
                        type: "success"
                    });
                }
            }, 'json');
        },
        moveCallback: function(department) {
            Dialog.build({
                title: i18n.t('usermanage.dialog-moveto'),
                content: "<div id='department-picker'> Loading... </div>",
                rightBtnCallback: function() {
                    var selectDepartment = $("#department-picker").fancytree("getTree").getActiveNode();

                    var data = getParams(department);
                    data.pid = selectDepartment.data.departmentId;

                    $.post('/department/move', data, function(rsp) {
                        Dialog.dismiss();
                        if (rsp.code == 0) {
                            Notify.show({
                                title: i18n.t('usermanage.notify-movesuccess'),
                                type: "success"
                            });
                            var activeNode = departmentTree.getActiveNode();
                            reloadTree(activeNode.key);
                        } else {
                            Notify.show({
                                title: i18n.t('usermanage.notify-movefailed'),
                                text: rsp.message,
                                type: "error"
                            });
                        }
                    }, 'json');
                }
            }).show(function() {
                $("#department-picker").empty();
                Tree.build({
                    container: $("#department-picker"),
                    selectMode: 1,
                    checkbox: false,
                    expandAll: true,
                    source: {
                        url: "/department/list",
                        data:{roleType:1}
                    }
                });
            });
        }
    });

    //用户详情
    UserInfo.init({
        container: $('#form-container'),
        editCallback: function(user) {
            UserInfo.edit();
        },
        deleteCallback: function(user) {
            if (user.userId < 0) {
                Notify.show({
                    title: i18n.t('usermanage.notify-cantdeleteadmin'),
                    type: 'warning'
                });
                return;
            }
            bootbox.confirm(i18n.t('usermanage.bootbox-deleteuserconfirm'), function(rlt) {
                if (rlt) {
                    $.post('/user/delete', {
                        ids: [user.userId],
                        userNames: [user.loginName]
                    }, function(rsp) {
                        if (rsp.code == 0) {
                            reloadTree();
                            $('#form-container').html('');
                            Notify.show({
                                title: i18n.t('usermanage.notify-deletesuccess'),
                                type: "success"
                            });
                        } else {
                            Notify.show({
                                title: i18n.t('usermanage.notify-deletefailed'),
                                text: rsp.message,
                                type: "error"
                            });
                        }
                    }, 'json');
                }
            })
        },
        completeCallback: function(user) {
            $.post('/user/update', user, function(rsp) {
                if (rsp.code != 0) {
                    Notify.show({
                        title: i18n.t('usermanage.notify-updatefailed'),
                        text: rsp.message,
                        type: "error"
                    });
                } else {
                    var activeNode = departmentTree.getActiveNode();
                    reloadTree(activeNode.key);
                    UserInfo.endEdit();
                    Notify.show({
                        title: i18n.t('usermanage.notify-updatesuccess'),
                        type: "success"
                    });
                }
            }, 'json');
        },
        resetPasswordCallback: function(user) {
            resetPasswordDialog(user.userId, user.loginName);
        },
        unLockUserCallback: function(user) {
            unlockUserBootbox(user);
        },
        lockUserCallback: function(user) {
            lockUserBootbox(user);
        }
    });

    function lockUserBootbox(user) {
        bootbox.confirm(i18n.t('usermanage.bootbox-lockuserconfirm'), function(rlt) {
            if (rlt) {
                $.post('/user/lockuser', {
                    userid: user.userId,
                    username: user.loginName
                }).done(function(data) {
                    data = JSON.parse(data);

                    if (data.code == 0) {
                        Notify.show({
                            title: i18n.t('usermanage.notify-lockusersuccess'),
                            type: "success"
                        });
                        UserInfo.renderUserInfo(user);
                    } else {
                        Notify.show({
                            title: i18n.t('usermanage.notify-lockuserfailed'),
                            text: data.message,
                            type: "error"
                        });
                    }

                });
            }
        });
    }

    function unlockUserBootbox(user) {
        bootbox.confirm(i18n.t('usermanage.bootbox-unlockuserconfirm'), function(rlt) {
            if (rlt) {
                $.post('/user/unlockuser', {
                    userid: user.userId,
                    username: user.loginName
                }).done(function(data) {
                    data = JSON.parse(data);

                    if (data.code == 0) {
                        Notify.show({
                            title: i18n.t('usermanage.notify-unlockusersuccess'),
                            type: "success"
                        });
                        $("#user-locked-icon").removeClass('fa-lock').addClass("fa-unlock").fadeOut();
                        UserInfo.renderUserInfo(user);
                    } else {
                        Notify.show({
                            title: i18n.t('usermanage.notify-unlockuserfailed'),
                            text: data.message,
                            type: "error"
                        });
                    }

                });
            }
        });
    }


    function resetPasswordDialog(userid, loginname) {
        Dialog.build({
            title: i18n.t('usermanage.dialog-reset'),
            content: tplResetDialog({
                replace: i18n.t('usermanage.tpl-thiswill', {
                    "loginname": loginname
                })
            }),
            hideLeftBtn: true,
            hideRightBtn: true
        }).show(function() {
            PasswordTip.render($("#password-tip"), $("#new_password_input"));

            $('#form-resetpassword-dialog').validate({
                rules: {
                    new_password_input: {
                        required: true,
                        minlength: 6
                    }

                },
                messages: {
                    new_password_input: {
                        required: i18n.t('usermanage.validate-nopassword'),
                        minlength: i18n.t('usermanage.validate-minlength'),
                    }
                },
                /* @validation highlighting + error placement
                ---------------------------------------------------- */
                errorClass: "state-error",
                validClass: "state-success",
                errorElement: "em",
                highlight: function(element, errorClass, validClass) {
                    $(element).closest('.field').addClass(errorClass).removeClass(validClass);
                },
                unhighlight: function(element, errorClass, validClass) {
                    $(element).closest('.field').removeClass(errorClass).addClass(validClass);
                },
                errorPlacement: function(error, element) {
                    if (element.is(":radio") || element.is(":checkbox")) {
                        element.closest('.option-group').after(error);
                    } else {
                        error.insertAfter(element.parent());
                    }
                },
                submitHandler: function() {

                    //var loginname = Util.getCookiekey("username");

                    $.post('/user/resetpassword', {
                        userid: userid,
                        newpassword: $("#new_password_input").val().trim(),
                        username: loginname
                    }).done(function(data) {
                        data = JSON.parse(data);

                        if (data.code == 0) {
                            $("#new_password_input").val('');
                            Alert.show({
                                container: $("#alert-container"),
                                alertid: "alert-update-success",
                                alertclass: "alert-success",
                                content: "<i class='fa fa-check pr10'></i> <strong>" + i18n.t('usermanage.alert-resetsuccess') + "</strong>"
                            });
                            setTimeout(closeDialog, 1500);
                        } else {
                            $("#new_password_input").val('');
                            Alert.show({
                                container: $("#alert-container"),
                                alertid: "alert-update-fail",
                                alertclass: "alert-danger",
                                content: "<i class='fa fa-remove pr10'></i> <strong>" + i18n.t('usermanage.alert-resetfailed') + data.message + " </strong>"
                            });
                        }
                    });
                    return false;
                }
            });
            $('#form-resetpassword-dialog').localize();
        })
    }

    function closeDialog() {
        $.magnificPopup.close();
    }

    //创建部门树
    Tree.build({
        container: $('#department-tree'),
        expandAll: false,
        checkbox: false,
        filter: {
            mode: "hide",
            autoAppaly: true,
            hightlight: true,
            nodata:true,
        },
        init: function(event, data) {
            data.tree.visit(function(node) {
                if (node.data.departmentId == -1) {
                    node.setExpanded(true);
                }
            })
        }
    }).config('activate', function(event, data) {
        if (Tree.isUser(data.node)) {
            $("#btn-move-users").removeAttr("disabled");
            UserInfo.renderUserInfo(data.node.data);
        } else {
            $("#btn-move-users").attr("disabled", "disabled");
            DepartmentInfo.renderDepartmentInfo(data.node.data);
        }
    });

    var departmentTree = $("#department-tree").fancytree("getTree");

    //移动部门人员
    $("#btn-move-users").on("click", function(event) {
        var person = departmentTree.getActiveNode();
        if (person.key < 0) {
            Notify.show({
                title: i18n.t('usermanage.notify-cantmoveadmin'),
                type: "warning"
            });
            return;
        }
        Dialog.build({
            title: i18n.t('usermanage.dialog-moveto'),
            content: "<div id='department-picker'> Loading... </div>",
            rightBtnCallback: function() {
                var selectDepartment = $("#department-picker").fancytree("getTree").getActiveNode();
                var person = departmentTree.getActiveNode();

                $.post('/user/movetodepartment', {
                    ids: [person.data.userId],
                    departmentId: selectDepartment.data.departmentId
                }).done(function(data) {
                    Dialog.dismiss();
                    data = JSON.parse(data);
                    if (data.code == 0) {
                        Notify.show({
                            title: i18n.t('usermanage.notify-movesuccess'),
                            type: "success"
                        });
                        var activeNode = departmentTree.getActiveNode();
                        reloadTree(activeNode.key);
                    } else {
                        Notify.show({
                            title: i18n.t('usermanage.notify-movefailed'),
                            text: data.message,
                            type: "error"
                        });
                    }
                });
            }
        }).show(function() {
            $("#department-picker").empty();
            Tree.build({
                container: $("#department-picker"),
                selectMode: 1,
                checkbox: false,
                expandAll: true,
                source: {
                    url: "/department/list",
                    data:{roleType:1}
                }
            });
        });
    });

    //添加部门
    $("#btn-add-department").on("click", function(event) {
        var activeNode = departmentTree.getActiveNode();
        var activePid = -1;
        if (!(_.isNull(activeNode) || Tree.isUser(activeNode))) {
            activePid = activeNode.data.departmentId;
            showAddDepartmentDialog(activeNode, activePid);
        } else {
            Notify.show({
                title: i18n.t('usermanage.notify-choosedepartment'),
                type: 'warning'
            });
            return;
        }

    });

    function showAddDepartmentDialog(activeNode, activePid) {
        $.get("add-department-dialog.html", function(result) {
            Dialog.build({
                title: i18n.t('usermanage.title-adddepartment'),
                content: result,
                rightBtn: i18n.t('common.datetime-ok'),
                rightBtnCallback: function() {
                    // 提交
                    var name = $("#add-department-name").val().trim();
                    var desc = $("#add-department-description").val().trim();

                    if (name.length <= 0) {
                        Notify.show({
                            title: i18n.t('usermanage.notify-depnameempty'),
                            type: "error"
                        });
                        return;
                    }
                    var reg = new RegExp("[\\/:*?\"\"<>|@''~!#$]", "g");
                    if (reg.test(name)) {
                        Notify.show({
                            title: i18n.t('usermanage.notify-depnameillegal'),
                            type: "error"
                        });
                        return;
                    }

                    $.post('/department/add', {
                        name: name,
                        description: desc,
                        pid: activePid
                    }).done(function(data) {
                        Dialog.dismiss();
                        data = JSON.parse(data);
                        if (data.code == 0) {
                            Notify.show({
                                title: i18n.t('usermanage.notify-createsuccess'),
                                type: "success"
                            });
                            reloadTree(activeNode.key);
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
                $("#form-add").localize();
                $("#add-department-parent-container").show();
                $("#add-department-parent").val(activeNode.data.departmentName);
            });
        });
    }

    // 跳转添加用户页面
    $("#btn-add-user").on("click", function() {
        window.location.href = '/user/add-user.html';
    });

    // fancytree 过滤
    $("input[name=searchDepartment]").keyup(function(e) {
        $(".fancytree-node").parent().removeClass("hide");
        var rootNode = departmentTree.getRootNode();
        if(rootNode._isLoading){
            Notify.show({
                title: "数据正在加载,请稍等!",
                type: "danger"
            });
            return;
        }
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
        $("li .fancytree-hide").parent().addClass("hide");

        $("button#btnResetSearchDepartment").attr("disabled", false);
        $("button#btnResetSearchDepartment").text(i18n.t('usermanage.button-clear') + "(" + n + ")");
    });
    $("button#btnResetSearchDepartment").click(function() {
        $("input[name=searchDepartment]").val("");
        $("button#btnResetSearchDepartment").text(i18n.t('usermanage.button-clear'));
        // $("span#matchesDepartment").text("");
        departmentTree.clearFilter();
        $(".fancytree-node").parent().removeClass("hide");
    }).attr('disabled', 'true');
});