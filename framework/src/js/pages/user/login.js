//init i18n
initLocales(require.context('../../../locales/base-frame', false, /\.js/), 'zh');
require(['nova-utils', 'nova-notify', 'utility/canvasbg/canvasbg', 'utility/ladda/ladda.min', 'jquery.validate'
], function(NovaUtils, Notify) {
    var sysConfig = window.__CONF__.config_system;
    if(sysConfig.is_oversea){
        $("#youcan1").text(i18n.t('login.label-casespy'));
        $("#youcan2").text(i18n.t('login.label-datasearch'));
        $("#youcan3").text(i18n.t('login.label-manage'));
        $("#youcan4").text(i18n.t('login.label-usermanage'));
    }

    var lastLoginName = NovaUtils.getCookiekey('lastloginname');
    if(lastLoginName != undefined){
        $('#username').val(decodeURIComponent(lastLoginName));
        $('#password').val('');
    }

    CanvasBG.init({
        Loc: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 3.3
        }
    });

   

    var fromUrl = decodeURIComponent(NovaUtils.getURLParameter('fromurl'));
    if (!(fromUrl && /.*\.html?(\?.*)?/.test(fromUrl))) {
        fromUrl = null;
    }

    $('#form-login').validate({
        rules: {
            username: {
                required: true
            },
            password: {
                required: true
            }
        },
        messages: {
            username: {
                required: i18n.t('base:login.label-usernamevalidate')
            },
            password: {
                required: i18n.t('base:login.label-passwordvalidate')
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
                element.closest('.option-group').after(error);
            } else {
                error.insertAfter(element.parent());
            }
        },
        submitHandler: function() {
            var username = $('#username').val().trim();
            var password = $('#password').val().trim();
            var isRemember = $('#remember')[0].checked;
            $.post('/user/login', {
                username: username,
                password: password,
                isRemember:isRemember
            }, null, 'json').done(function(data) {
                if (data.code == 0) {
                    window.location.href = fromUrl || sysConfig.homeUrl;
                } else {
                    Notify.simpleNotify(i18n.t('base:login.notify-loginfailed'), data.message, 'error');
                }
            });
            return false;
        }
    });
});
