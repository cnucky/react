define("./rlf-suspicious-action", [
    "../../tpl/rlf/rlf-profile-suspicious-action",
    "jquery",
    "underscore"
], function(tplSuspicious, $, _) {
    tplSuspicious = _.template(tplSuspicious);
    var _opts;

    function init(opts) {
        _opts = opts;
        if (_opts.container) {
            _opts.container.append('<table class="table table-bordered" id="suspicious-table"><tbody id="suspicious-item"></tbody></table>');
        }
    }

    function render(tagsData) {
        if (tagsData) {

            var suspiciousRow;
            var suspiciousItem = _opts.container.find("#suspicious-item");
            var tagsRow = {};
            if (_.isUndefined(suspiciousItem.attr('rendered'))) {
                suspiciousItem.empty();
                suspiciousItem.attr('rendered', 1);

                for (var i = 0; i < _.size(tagsData); i++) {
                    var obj={tagName:tagsData[i].tagName,tagValue:tagsData[i].tagValue}
                    tagsRow[i] =obj;
                }

                _.each(tagsRow, function(item) {
                    suspiciousRow = $(tplSuspicious(item));
                    suspiciousItem.append(suspiciousRow);
                });
            }
        }
    }


    return {
        init: init,
        render: render
    }
});

