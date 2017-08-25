var _ = require('underscore');

function _toInt(s, def) {
    var v = parseInt(s);
    if (isNaN(v)) {
        return def || 0;
    }
    return v;
}

module.exports = {
    toInt: function(s, def) {
        if (_.isEmpty(s)) {
            return def || 0;
        }

        if (_.isArray(s)) {
            var res = [];
            _.each(s, function(v) {
                res.push(_toInt(v, def));
            });
            return res;
        }

        return _toInt(s, def);
    }
};
