/**
 * Created by root on 1/12/17.
 */
var tpl = require('./tpl/tpl-iframe-dialog');
// require('../../js-components/magnific-popup/jquery.magnific-popup');

tpl = _.template(tpl);

var attrs;

var iframe_mode_id = "#iframe-modal";

function build(opts) {

    // 0、'' = false
    attrs = {
        title: opts.title || "",
        url: opts.url || ""

    };
    var source = tpl(attrs);

    if($(iframe_mode_id)){
        $(iframe_mode_id).remove();
    }

    $("body").append(source);

    function show(callback) {

        $(iframe_mode_id).modal("show");

    }

    $(iframe_mode_id).on('hiden.bs.modal', function(){
        $(iframe_mode_id).remove();
    });

    return {
        show: show,
        dismiss: dismiss
    };
}

function dismiss() {
    $(iframe_mode_id).modal("hide");

}

module.exports = {
    attrs: attrs,
    build: build,
    dismiss: dismiss
};
