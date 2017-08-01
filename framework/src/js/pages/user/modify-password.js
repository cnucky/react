//init i18n
initLocales(require.context('../../../locales/base-frame', false, /\.js/));
require([
    '../../module/user/jc-password-strength-progress-bar',
    'nova-alert',
    'nova-utils',
    'jquery.validate'
], function(PasswordTip, Alert, Util) {

    hideLoader();

    PasswordTip.render($("#password-tip"), $("#user_new_password"));

    $('#modify-password').validate({
        rules: {
            user_current_password: {
                required: true
            },
            user_new_password: {
                required: true,
                minlength: 6
            },
            user_confirm_password: {
                required: true,
                minlength: 6,
                equalTo: "#user_new_password"
            }
        },
        messages: {
            user_current_password: {
                required: i18n.t('password.validate-nocurpassword')
            },
            user_new_password: {
                required: i18n.t('password.validate-nonewpassword'),
                minlength: i18n.t('password.validate-minlength')
            },
            user_confirm_password: {
                required: i18n.t('password.validate-newpasswordagain'),
                minlength: i18n.t('password.validate-minlength'),
                equalTo: i18n.t('password.validate-equalto')
            }
        },
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
                element.closest('.form-group').after(error);
            } else {
                error.insertAfter(element.parent());
            }
        },
        submitHandler: function() {

            var cookies = document.cookie.split('; ');
            var map = {};
            cookies.forEach(function(cookie) {
                var kv = cookie.split('=');
                map[kv[0]] = kv[1];
            });

            $.post('/user/updatepassword', {
                oldpassword: $("#user_current_password").val().trim(),
                newpassword: $("#user_new_password").val().trim(),
                username: decodeURI(map['username'])
            }).done(function(data) {
                data = JSON.parse(data);

                if (data.code == 0) {
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-update-success",
                        alertclass: "alert-success",
                        content: "<i class='fa fa-check pr10'></i> <strong>" + i18n.t('password.alert-success') + "</strong>"
                    });
                    clearInput();
                    setTimeout(Util.logout, 5000);
                    PasswordTip.endrender();
                } else {
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-update-fail",
                        alertclass: "alert-danger",
                        content: "<i class='fa fa-remove pr10'></i> <strong>" + i18n.t('password.alert-failed') + data.message + " </strong>"
                    });
                    clearInput();
                    PasswordTip.endrender();
                }
            });
            return false;
        }
    });

    function clearInput() {
        $("#user_current_password").val("");
        $("#user_new_password").val("");
        $("#user_confirm_password").val("");
    }

});
