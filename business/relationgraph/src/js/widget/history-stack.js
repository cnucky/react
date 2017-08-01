define('widget/history-stack', ['jquery', 'underscore'], function() {
    function History(data, action) {
        this.data = data;
        this.action = action;
    }

    var _stack = [];
    var _pointer = -1;
    var _opts;
    var MAX = 30;

    function init(opts) {
        _opts = opts;
        if (_opts.max) {
            MAX = _opts.max;
        }
    }

    function push(history) {
        while(_stack.length > _pointer + 1) {
            _stack.pop();
        }
        _stack.push(history);
        while(_stack.length > MAX) {
            _stack.shift();
        }
        _pointer = _stack.length - 1;
        _invokeCallback();
    }

    function canRedo() {
        return _pointer < _stack.length - 1;
    }

    function canUndo() {
        return _pointer > 0;
    }

    function undo() {
        if (canUndo()) {
            _pointer--;
            var history = _stack[_pointer];
            history.action(history.data);
            _invokeCallback();
        }
    }

    function redo() {
        if (canRedo()) {
            _pointer++;
            var history = _stack[_pointer];
            history.action(history.data);
            _invokeCallback();
        }
    }

    function clear() {
        _stack = [];
        _pointer = -1;
    }

    function _invokeCallback() {
        if (_opts.callback) {
            _opts.callback(canRedo(), canUndo());
        }
    }

    return {
        History: History,
        init: init,
        push: push,
        canRedo: canRedo,
        canUndo: canUndo,
        undo: undo,
        redo: redo,
        clear: clear,
        getStack: function() {
            return _stack;
        },
        getPointer: function() {
            return _pointer;
        },
        update: function(index, history) {
            if(index < _stack.length && index >= 0) {
                _stack[index] = history;
            } else if(index < 0 && _stack.length + index >= 0) {
                _stack[_stack.length + index] = history;
            }
        }
    }
});
