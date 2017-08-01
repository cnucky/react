var $ = require('jquery');
var _ = require('underscore');
var tplProgressBar = require('tpl/user/tpl-password-strength-progress-bar');
tplProgressBar = _.template(tplProgressBar);
var _passwordInput;


function render(passwordTipContainer, passwordInputContainer) {
    passwordTipContainer.append(tplProgressBar);
    _passwordInput = passwordInputContainer;

    var wordUpperLowerCombo = new RegExp(/^([a-z].*[A-Z])|([A-Z].*[a-z])$/);
    var aleradyDown = false;
    $(_passwordInput).on('input', function() {
        var password = $(_passwordInput).val().trim();
        var passwordLength = password.length;

        if (!_.isEmpty(password)) {
            if (aleradyDown == false) {
                $("#password-strength-progress-bar").slideDown(200);
                aleradyDown = true;
            }
            var pStrength = $("#progress-strength-bar");
            var pStrengthTip = $("#password-strength-tip");

            if (passwordLength > 6 && wordUpperLowerCombo.test(password)) {
                pStrength.removeClass('progress-bar-danger');
                pStrength.removeClass('progress-bar-warning');
                pStrength.addClass('progress-bar-success');
                pStrength.attr('aria-valuenow', '100');
                pStrength.css('width', '100%');
                pStrengthTip.text("强");
            } else if (passwordLength >= 10) {
                pStrength.removeClass('progress-bar-danger');
                pStrength.removeClass('progress-bar-warning');
                pStrength.addClass('progress-bar-success');
                pStrength.attr('aria-valuenow', '100');
                pStrength.css('width', '100%');
                pStrengthTip.text("强");
            } else if (passwordLength > 6 && passwordLength < 10) {
                pStrength.removeClass('progress-bar-danger');
                pStrength.removeClass('progress-bar-success');
                pStrength.addClass('progress-bar-warning');
                pStrength.attr('aria-valuenow', '66');
                pStrength.css('width', '66%');
                pStrengthTip.text("普通");
            } else if (passwordLength <= 6) {
                pStrength.removeClass('progress-bar-warning');
                pStrength.removeClass('progress-bar-success');
                pStrength.addClass('progress-bar-danger');
                pStrength.attr('aria-valuenow', '33');
                pStrength.css('width', '33%');
                pStrengthTip.text("弱");
            }
        } else {
            if (aleradyDown == true) {
                $("#password-strength-progress-bar").slideUp(200);
                aleradyDown = false;
            }
        }
    })
}

function endrender() {
    $("#password-strength-progress-bar").slideUp(200);
}


module.exports.render = render;
module.exports.endrender = endrender;
