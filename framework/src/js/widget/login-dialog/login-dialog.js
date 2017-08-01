var $ = require('jquery');
if(!$.validator)
    require('jquery.validate');
var Dialog = require('nova-dialog');
var loginContent = require('./login-dialog-content');
var Notify = require("nova-notify");

function buildLoginDialog() {
    Dialog.build({
        title: "登录",
        content: loginContent,
        hideFooter: true
    }).show(function(){
        check();
    });   
}

function check(){
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
                required: "用户名不能为空"
            },
            password: {
                required: "密码不能为空"
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
            $.post('/user/login', {
                username: username,
                password: password
            }, null, 'json').done(function(data) {
                if (data.code == 0) {
                    Dialog.dismiss();
                    Notify.show({
                        title: "提示",
                        text: '登录成功',
                        type: "success"
                    });
                } else {
                    Notify.simpleNotify('登录失败', data.message, 'error');
                }
            });
            return false;
        }
    });
}

module.exports.buildLoginDialog = buildLoginDialog;