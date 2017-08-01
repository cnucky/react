var _ = require('underscore');

function _toInt(s, def) {
    var v = parseInt(s);
    if (isNaN(v)) {
        return def || 0;
    }
    return v;
}

function _toNumber(s, def){
    var v = Number(s);
    if (isNaN(v)) {
        return def || 0
    }
    return v;
}
function _stringtoDate(s, def) {
    var v = Date.parse(s);
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
    },
    toNumber: function(s, def){
        if(_.isEmpty(s)){
            return def || 0
        }
        if(_.isArray(s)){
            var res = [];
            _.each(s, function(v){
                res.push(_toNumber(v,def));
            });
            return res;
        }
        return _toNumber(s,def)
    },
    stringToDate: function(s,def){
        if (_.isEmpty(s)) {
            return def || new Date("1990-00-00 00:00:00");
        }

        if (_.isArray(s)) {
            var res = [];
            _.each(s, function(v) {
                res.push(_stringtoDate(v, def));
            });
            return res;
        }

        return _stringtoDate(s, def);
    }
};
