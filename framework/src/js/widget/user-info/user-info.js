define('widget/user-info', [
    './tpl-userinfo',
    'nova-dialog',
    'nova-alert',
    'underscore',
    'jquery',
    'jquery.validate',
    "moment",
    "moment-locale",
    'utility/datepicker/bootstrap-datetimepicker'
], function(tpl, Dialog, Alert, _, $, validate, moment) {
    var sysConfig = window.__CONF__.config_system;
    var _opts;
    var _user;
    var _position;

    tpl = _.template(tpl);

    function init(opts) {
        _opts = opts;
        getAllUserPosition();
    }

    function getAllUserPosition() {
        $.getJSON('/user/position', function(rsp) {
            if (rsp.code != 0) {
                alert(rsp.message)
                return;
            } else {
                _position = rsp.data;
            }
        });
    }

    function renderUserInfo(info) {
        _user = info;
        $.getJSON('/user/info?id=' + info.userId, function(rsp) {
            if (rsp.code != 0) {
                console.log('failed to get user info!');
            } else {
                _user = rsp.data;
            }

            // add gender
            _user.displayGender = (_user.gender == 1 ? i18n.t('usermanage.gender-male') : _user.gender == 2 ? i18n.t('usermanage.gender-female') : i18n.t('usermanage.gender-null'));

            // add position
            _.each(_position, function(item) {
                if (_user.position == item.key) {
                    _user.displayPosition = item.caption;
                }
            });
            if (!_user.displayPosition) {
                _user.displayPosition = i18n.t('usermanage.option-null');
            }

            // add group
            _user.displayGroupNames = _user.userGroupNames.join("，")
            _user.displayDepartment = _user.departmentPath;


            $(_opts.container).empty().append(tpl(_user));

            $('#user-gender').val(_user.gender);
            $('#user-name').val(_user.trueName || (_user.loginName + i18n.t('usermanage.suffix-username')));
            if (_opts.disableEdit) {
                $('#edit-menu').hide();
            }

            $('#delete-user').click(function() {
                _opts.deleteCallback(_user);
            });
            $('#edit-user').click(function() {
                _opts.editCallback(_user);
            });
            $('#reset-password').click(function() {
                _opts.resetPasswordCallback(_user);
            });

            // 时间过期的话显示为红色
            var expireTime = moment(_user.accountExpireTime);
            var now = moment();
            if (expireTime.isBefore(now)) {
                $("#user-expire").css('color', '#DB524B');
            }

            // 用户是否锁定
            if (_user.userId > 0) {
                if (_user.accountLockState == 1) {
                    $("#user-locked-icon").show();
                    $("#user-locked-icon").tooltip();

                    $("#user-locked-icon").click(function() {
                        _opts.unLockUserCallback(_user);
                    });
                } else if (_user.accountLockState == 0) {
                    $("#lock-user").show();
                    $("#lock-user").click(function() {
                        _opts.lockUserCallback(_user);
                    })
                }
            }
            if(sysConfig.is_oversea){
                $('#div-position').hide();
            }
            $(_opts.container).localize();
        });
    }

    function edit() {
        $('.user-item').removeAttr('readonly');
        $('#edit-menu').hide();

        $('#user-gender-display').hide();
        $('#user-gender').show();

        $('#user-position-display').hide();
        $('#user-position').show();

        // 编辑用户信息是隐藏部门和用户组
        $("#user-department-section").hide();
        $("#user-group-section").hide();

        // 下拉列表项
        var position_item = $("#user-position");
        _.each(_position, function(item) {
            position_item.append("<option value=" + "'" + item.key + "'>" + item.caption + "</option>");
        });
        position_item.val(_user.position);

        var datatimeLocale = "zh-cn";
        if(sysConfig.is_oversea){
            moment.locale('en-us');
            datatimeLocale = "en-us";
        }else{
            moment.locale('zh-cn');
        }
        $('#user-expire').datetimepicker({
            format: 'YYYY-MM-DD HH:mm:ss',
            locale:datatimeLocale,
        });

        $('#user-edit-footer').show();
        $('#user-name').val(_user.trueName || "");
        var validator = $("#user-info-form").validate({
            rules: {
                "user-email": {
                    email: true
                },
                "user-birthday": {
                    date: true
                },
                "user-expire": {
                    date: true
                }
            },
            messages: {
                "user-email": {
                    email: i18n.t('usermanage.validate-email')
                },
                "user-birthday": {
                    date: i18n.t('usermanage.validate-date')
                },
                "user-expire": {
                    date: i18n.t('usermanage.validate-date')
                }
            },
            /* @validation highlighting + error placement
            ---------------------------------------------------- */
            errorClass: "state-error",
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
            }
        });
        $('#cancel-edit-user').click(function() {
            endEdit();
        });
        $('#complete-edit-user').click(function() {
            if (validator.form()) {
                _user.trueName = $('#user-name').val().trim();
                _user.gender = $('#user-gender').val();
                _user.certNumber = $('#user-certNumber').val().trim();
                _user.birthday = $('#user-birthday').val().trim();
                _user.email = $('#user-email').val().trim();
                _user.telphone = $('#user-telphone').val().trim();
                _user.address = $('#user-address').val().trim();
                _user.position = $('#user-position').val();
                _user.accountExpireTime = $("#user-expire").val().trim();
                _opts.completeCallback(_user);
            }
        });
    }

    function endEdit() {
        renderUserInfo(_user);
    }

    return {
        init: init,
        renderUserInfo: renderUserInfo,
        edit: edit,
        endEdit: endEdit
    };
});