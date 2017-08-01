//init i18n
initLocales(require.context('../../../locales/system-manage', false, /\.js/));
var choosenDepartment;
var choosenGroups;
var departmentTree;
window.onbeforeunload = function() {
    event.returnValue = i18n.t('usermanage.alert-lostform');
}

require([
    '../../module/user/jc-password-strength-progress-bar',
    'nova-alert',
    'jquery.validate'
], function(PasswordTip, Alert) {
    var sysConfig = window.__CONF__.config_system;
    if (sysConfig.is_oversea) {
        $('#div-position').hide();
    }
    hideLoader();
    PasswordTip.render($("#password-tip"), $("#password"));

    /* 用户名规则 */
    $.validator.addMethod("userName", function(value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5_.·\w]+$/.test(value);
    }, i18n.t('usermanage.validate-name'));

    $.validator.addMethod("laterThanNow", function(value, element) {
        if(this.optional(element)){
            return true;
        }else{
            var now = new Date();
            var timeValue = new Date(value);
            return timeValue > now;
        }
    }, i18n.t('usermanage.validate-endtime'));

    $("#form-add").validate({
        rules: {
            username: {
                required: true,
                userName: true
            },
            password: {
                required: true,
                minlength: 6
            },
            confirmPassword: {
                required: true,
                minlength: 6,
                equalTo: "#password"
            },
            department: {
                required: true
            },
            email: {
                email: true
            },
            birthday: {
                date: true
            },
            effectiveDate: {
                date: true,
                laterThanNow: true
            }
        },
        messages: {
            username: {
                required: i18n.t('usermanage.validate-namemust')
            },
            password: {
                required: i18n.t('usermanage.validate-pwmust'),
                minlength: i18n.t('usermanage.validate-pwlength')
            },
            confirmPassword: {
                required: i18n.t('usermanage.validate-pwagain'),
                minlength: i18n.t('usermanage.validate-pwlength'),
                equalTo: i18n.t('usermanage.validate-pwequal')
            },
            department: {
                required: i18n.t('usermanage.validate-depmust')
            },
            email: {
                email: i18n.t('usermanage.validate-email')
            },
            birthday: {
                date: i18n.t('usermanage.validate-date')
            },
            effectiveDate: {
                date: i18n.t('usermanage.validate-date')
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
            $.post('/user/add', {
                loginName: $('#username').val().trim(),
                password: $('#password').val().trim(),
                loginType: "1",
                departmentId: choosenDepartment.departmentId,
                trueName: $('#trueName').val().trim(),
                gender: $('#gender').val(),
                userGroupArray: choosenGroups ? JSON.stringify(choosenGroups.map(function(group) {
                    return group.userGroupId;
                })) : '[]',
                certNumber: $('#certNumber').val().trim(),
                birthday: $('#birthday').val(),
                email: $('#email').val().trim(),
                telphone: $('#telphone').val().trim(),
                workPhone: $('#telphone').val().trim(),
                address: $('#address').val().trim(),
                accountExpireTime: $('#effectiveDate').val().trim(),
                position: $('#position').val()
            }).done(function(data) {
                data = JSON.parse(data);
                // 因为有导航栏遮盖，所以跳到最上面，才能看见通知
                window.location.href = "#topbar";
                if (data.code == 0) {
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-add-success",
                        alertclass: "alert-success",
                        content: "<i class='fa fa-check pr10'></i> <strong>" + i18n.t('usermanage.alert-addsuccess') + "</strong>"
                    });
                    PasswordTip.endrender();
                    departmentTree.reload();
                } else {
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-add-fail",
                        alertclass: "alert-danger",
                        content: "<i class='fa fa-remove pr10'></i> <strong>" + i18n.t('usermanage.alert-addfailed') + data.message + " </strong>"
                    });
                    PasswordTip.endrender();
                }
            });
            return false;
        }
    });
});

require(['widget/department-tree', 'nova-dialog', 'nova-notify',
    "moment",
    "moment-locale",
    'utility/datepicker/bootstrap-datetimepicker'
], function(Tree, Dialog, Notify, moment) {
var sysConfig = window.__CONF__.config_system;
    Tree.build({
        container: $('#right-container'),
        checkbox: false,
        selectMode: 1
    });
    departmentTree = $('#right-container').fancytree('getTree');
    var isInternation = false;
    var datetimepickerLocale = "zh-cn";
    if (sysConfig.is_oversea) {
        isInternation = true;
        datetimepickerLocale = "en-us";
    }
    isInternation ? moment.locale('en-us') : moment.locale('zh-cn');
    $('#effectiveDate').datetimepicker({
        format: 'YYYY/MM/DD HH:mm:ss',
        locale: datetimepickerLocale
    });

    function getNodeFullName(node) {
        var parent = node.parent;
        var name = node.data.departmentName;
        while (parent.data.departmentName) {
            name = parent.data.departmentName + "/" + name;
            parent = parent.parent;
        }
        name = "/" + name;
        return name;
    }

    $("#department").on("click", function(e) {
        e.preventDefault();

        Dialog.build({
            title: i18n.t('usermanage.dialog-choosedep'),
            content: "<div id='department-picker'> 加载中... </div>",
            rightBtnCallback: function(e) {
                e.preventDefault();

                var selectedNode = $("#department-picker").fancytree("getTree").getActiveNode();
                if (selectedNode) {
                    choosenDepartment = selectedNode.data;
                    $("#department").val(getNodeFullName(selectedNode));
                }

                $.magnificPopup.close();
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

    $("#group").on("click", function(e) {
        e.preventDefault();

        Dialog.build({
            title: i18n.t('usermanage.dialog-choosegroup'),
            content: "<div id='group-picker'>" + i18n.t('usermanage.dialog-loading') + "</div>",
            rightBtnCallback: function(e) {
                e.preventDefault();
                var selectNodes = $("#group-picker").fancytree("getTree").getSelectedNodes();
                choosenGroups = selectNodes.map(function(node) {
                    return node.data;
                });
                $("#group").val(choosenGroups ? choosenGroups.map(function(group) {
                    return group.userGroupName;
                }).join("，") : "");

                $.magnificPopup.close();
            }
        }).show(function() {
            $.getJSON('/usergroup/list', function(rsp) {
                if (rsp.code != 0) {
                    Notify.show({
                        title: i18n.t('usermanage.notify-getgrpfailed'),
                        text: rsp.message,
                        type: "error"
                    });
                    return;
                }
                var groups = rsp.data;

                $("#group-picker").empty();
                $('#group-picker').fancytree({
                    checkbox: true,
                    source: groups,
                    autoScroll: true,
                    iconClass: function(event, data) {
                        return "fa fa-group";
                    }
                });
            });
        });
    });

    // 选择职位信息下拉列表
    function getAllUserPosition() {
        $.getJSON('/user/position', function(rsp) {
            if (rsp.code != 0) {
                Notify.show({
                    title: i18n.t('usermanage.notify-getposfailed'),
                    text: rsp.message,
                    type: "error"
                });
                return;
            }
            var position = rsp.data;

            var position_item = $("#position");
            _.each(position, function(item) {
                position_item.append("<option value=" + item.key + ">" + item.caption + "</option>");
            });
        });
    }

    getAllUserPosition();

    // collapse
    $("#collapse-click").click(function() {
        if ($("#collapseOne").attr("class") == "collapse") {
            $("#plus-minus").attr("class", "fa fa-minus");
        } else if ($("#collapseOne").attr("class") == "collapse in") {
            $("#plus-minus").attr("class", "fa fa-plus");
        }
    });
});