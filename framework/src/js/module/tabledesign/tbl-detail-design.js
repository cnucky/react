define([
    'nova-notify',
    'nova-bootbox-dialog',
    'nova-dialog',
    '../../tpl/tabledesign/tpl-tabledetail-design',
], function (Notify, bootBox, Dialog, tplDetailDesign) {
    tplDetailDesign = _.template(tplDetailDesign);
    var _opts;

    function init(opts) {
        _opts = opts;
    }
    

    function renderForTblDesign(info) {
        init(info);
        $(_opts.container).empty().append(tplDetailDesign({}));
    }

    return {
        renderForTblDesign: renderForTblDesign,
    }
});