var timer;
var stopTimer;
var _opt;
function show(container, interval) {
    var step = 0;
    timer = setInterval(function() {
        step++;
        if (step == 3) {
            step = 1;
        }
        if (step == 1) {
            $(container).hide();
        }
        if (step == 2) {
            $(container).show();
        }
    }, interval);
    return timer;
}

function stopflash() {
    if(!_opt || !_opt.container)
        return;
    if (timer) {
        clearInterval(timer);
        $(_opt.container).show();
        $(_opt.container).attr('style','');
    }
}

function flash(opt) {
    if (!opt.container) {
        return;
    }
    if(timer){
        clearInterval(timer);
    }
    if(stopTimer){
        clearTimeout(stopTimer);
    }
    _opt = opt;
    show(_opt.container, _opt.interval || 500);
    stopTimer = setTimeout(function() {
        stopflash();
    }, _opt.period || 3000);
}

module.exports = {
    flash: flash,
    stopflash:stopflash
};