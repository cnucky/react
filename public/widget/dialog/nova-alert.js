define('nova-alert', ['./tpl/tpl-alert', 'jquery', 'underscore'], function(tpl) {
    tpl = _.template(tpl);
    var _opts;

    function show(opts) {
    	_opts = opts;
    	$(".nova-alert").remove();
        $(opts.container).append(tpl({
        	alertid: opts.alertid,
        	content: opts.content
        }));
        var alert = $("#"+opts.alertid);
        alert.addClass(opts.alertclass || "alert-info");
        alert.slideToggle("fast");
    }

    return {
        options: _opts,
        show: show
    };
});
