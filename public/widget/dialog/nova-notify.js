/**
 * 使用pnotify实现
 * options: title, text, type, stack, confirm 
 * type：notice | info | success | error
 * 使用Bootstrap样式,type也可以是bootsrap中的success warning error danger等
 */
require('pnotify');
var PNotify = window.PNotify;
// styling 可以是bootstrap2，bootstrap3，fontawesome, brighttheme(default)
PNotify.prototype.options.styling = "bootstrap3";

var _opts, openedNotify = {};
var stackTopRight = {
        "dir1": "down",
        "dir2": "left",
        "push": "top"
    },
    stackTopLeft = {
        "dir1": "down",
        "dir2": "right",
        "push": "top",
        "spacing1": 10,
        "spacing2": 10
    },
    stackBottomLeft = {
        "dir1": "right",
        "dir2": "up",
        "push": "top",
        "spacing1": 10,
        "spacing2": 10
    },
    stackBottomRight = {
        "dir1": "left",
        "dir2": "up",
        "push": "top",
        "spacing1": 10,
        "spacing2": 10
    },
    stackBarTop = {
        "dir1": "down",
        "dir2": "right",
        "push": "top",
        "spacing1": 0,
        "spacing2": 0
    },
    stackBarBottom = {
        "dir1": "up",
        "dir2": "right",
        "spacing1": 0,
        "spacing2": 0
    };

function _findWidth(noteStack) {
    if (noteStack == "stack-bar-top") {
        return "100%";
    }
    if (noteStack == "stack-bar-bottom") {
        return "70%";
    } else {
        return "300px";
    }
}

/**
 * @param title 标题，必选参数
 * @param text 内容
 * @param type 通知类型,默认为'info',蓝色样式
 */
function simpleNotify(title, text, type) {
    var opts = {};
    opts.type = type;
    opts.title = title;
    opts.text = text;
    show(opts);
}

function show(opts) {
    if (_.isString(opts)) {
        opts = {text: opts}
    }
    opts.title = opts.title || '';
    opts.text = opts.text || opts.title;
    // text为必选字段
    if (opts.title == opts.text) {
        opts.title = '';
    }
    opts.type = opts.type || 'info';

    var noteStack = opts.stack || 'stack-topright';
    var selectedStack = getStackOf(noteStack);
    opts.width = opts.width || _findWidth(noteStack);

    _opts = opts;

    var notifyKey = opts.title + opts.text + opts.type;
    if (openedNotify[notifyKey]) {
        return;
    }
    openedNotify[notifyKey] = _opts;

    new PNotify({
            title: opts.title,
            text: opts.text,
            opacity: 1,
            addclass: noteStack,
            type: opts.type,
            // stack: selectedStack,
            width: opts.width,
            confirm: opts.confirm,
            delay: opts.type === 'error' ? 5000 : 2000,
            buttons: {
                sticker: false
            },
            animate_speed: 'fast',
            afterOpen: function(notice, options) {
                opts.afterOpen && opts.afterOpen(notice, options)
            },
            afterClose: function(notice, options) {
                delete openedNotify[notifyKey];
                opts.afterClose && opts.afterClose(notice, options)
            }
        });
}

function getStackOf(type) {
    switch (type) {
        case 'stack-topright':
            return stackTopRight;
        case 'stack-topleft':
            return stackTopLeft;
        case 'stack-bottomleft':
            return stackBottomLeft;
        case 'stack-bottomright':
            return stackBottomRight;
        case 'stack-bar-top':
            return stackBarTop;
        case 'stack-bar-bottom':
            return stackBarBottom;
    }
}

module.exports = {
    options: _opts,
    simpleNotify: simpleNotify,
    show: show
};
