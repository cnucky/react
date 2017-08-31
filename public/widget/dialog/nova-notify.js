/**
 * 使用pnotify实现
 * options: title, text, type, stack, confirm 
 * type：notice | info | success | error
 * 使用Bootstrap样式,type也可以是bootsrap中的success warning error danger等
 */
require('pnotify');

// styling 可以是bootstrap2，bootstrap3，fontawesome, brighttheme(default)
PNotify.prototype.options.styling = "bootstrap3";

var _opts;
var Stacks = {
    'stack-top-right': {
        "dir1": "down",
        "dir2": "left",
        "push": "top",
        "spacing1": 10,
        "spacing2": 10
    },
    'stack-top-left': {
        "dir1": "down",
        "dir2": "right",
        "push": "top",
        "spacing1": 10,
        "spacing2": 10
    },
    'stack-bottom-left': {
        "dir1": "right",
        "dir2": "up",
        "push": "top",
        "spacing1": 10,
        "spacing2": 10
    },
    'stack-bottom-right': {
        "dir1": "left",
        "dir2": "up",
        "push": "top",
        "spacing1": 10,
        "spacing2": 10
    },
    'stack-bar-top': {
        "dir1": "down",
        "dir2": "right",
        "push": "top",
        "spacing1": 0,
        "spacing2": 0
    },
    'stack-bar-bottom': {
        "dir1": "up",
        "dir2": "right",
        "spacing1": 0,
        "spacing2": 0
    },
    'stack-context': {
        "dir1": "down",
        "dir2": "left",
        "context": $("#stack-context")
    }
}

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
    _opts = opts;
    if (_.isString(opts)) {
        new PNotify(opts);
        return;
    }

    if (_.isEmpty(opts.text)) {
        opts.text = opts.title;
        opts.title = '';
    }
    
    var noteStack = opts.stack || 'stack-top-right';
    var selectedStack = Stacks[noteStack];

    new PNotify({
            title: opts.title,
            text: opts.text,
            opacity: 1,
            addclass: noteStack,
            type: opts.type || 'info',
            stack: selectedStack,
            width: opts.width || _findWidth(noteStack),
            confirm: opts.confirm,
            delay: 1200,
            buttons: {
                sticker: false
            },
            animate_speed: 'fast',
            afterOpen: opts.afterOpen,
            afterClose: opts.afterClose
        });
}

module.exports = {
    options: _opts,
    simpleNotify: simpleNotify,
    show: show
};
