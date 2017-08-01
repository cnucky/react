define(
    [
        "jquery",
        'underscore',
        'nova-notify',
        'nova-dialog',
        '../tpl/tpl-data-detail',

    ], function ($,_,Notify,Dialog,TplMobileDetail) {

        function init(container,opt) {
            template = _.template(TplMobileDetail);
            var frame='<iframe id="ifm2" src="../../mobilearchive/mobile-archive.html?hideFrame=true&phoneNumber='
                + opt.phone_number
                +'" width="'
                +$(container).width()
                +'" height="'
                +$(container).height()
                +'" scrolling="yes"></iframe>';
            var panel_tpl=template({Data:opt.phone_number,frame:frame});
            $(container).html(panel_tpl);

        }

        function get_mobile_detail_html(opt) {
            template = _.template(TplMobileDetail);
            var frame='<iframe id="ifm2" src="../../mobilearchive/mobile-archive.html?hideFrame=true&phoneNumber='
                + opt.phone_number
                +'" width="'
                +opt.width
                +'" height="'
                +opt.height
                +'" scrolling="yes"></iframe>';
            var panel_tpl=template({Data:opt.phone_number,frame:frame});

            return panel_tpl;
        }

        return {
            init:init,
            get_mobile_detail_html:get_mobile_detail_html
        };
    });
