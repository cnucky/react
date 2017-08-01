var $ = require('jquery');
var _ = require('underscore');
var Util = require('nova-utils');

module.exports.initLink = function(_a, _title, _targetLink) {
        (function(a, title, targetLink) {
                $(a).click(function() {
                    var stash = Util.stash.getPageStash(window.location.pathname);
                    var index = _.findIndex(stash, function(item) {
                        return item.key === window.location.href;
                    });
                    if (index >= 0) {
                        stash.splice(index, 1);
                    }
                    stash.push({
                        key: window.location.href,
                        title: title,
                        link: window.location.href
                    });
                    Util.stash.setPageStash(window.location.pathname, stash);
                    window.location.href = targetLink;
                })               
            })(_a, _title, _targetLink);
        }