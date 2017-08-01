var tpl = require('./tpl/tpl-dialog');
require('../../js-components/magnific-popup/jquery.magnific-popup');

tpl = _.template(tpl);

var attrs;


function build(opts) {

    // 0、'' = false
    attrs = {
        title: opts.title || i18n.t('base:workspace.label-suredialog'),
        content: opts.content || i18n.t('base:workspace.label-sure'),
        leftBtn: opts.leftBtn || i18n.t('base:index.button-cancel'),
        rightBtn: opts.rightBtn || i18n.t('base:workspace.label-sure'),
        hideLeftBtn: opts.hideLeftBtn,
        hideRightBtn: opts.hideRightBtn,
        hideHeader: opts.hideHeader || false,
        hideFooter: opts.hideFooter || false,
        maxHeight: opts.maxHeight || 500,
        minHeight: opts.minHeight || 10,
        innerHeight: opts.innerHeight || 0,
        leftBtnCallback: opts.leftBtnCallback || function () {
            dismiss();
        },
        rightBtnCallback: opts.rightBtnCallback || function () {
            dismiss();
        },
        closeBtnCallback: opts.closeBtnCallback || function () {
            $.magnificPopup.close();
        },
        extraBtn: opts.extraBtn || [],
        extraListener: opts.extraListener || [],
        style: opts.style || 'basic', // ENUM(basic: 450px, sm: 300px, lg: 700px, xl: 1000px, full: 90%)
        width: opts.width || 0,
        closeOnBgClick: _.isUndefined(opts.closeOnBgClick) ? true : opts.closeOnBgClick,
        focus: opts.focus || ""
    };
    var source = tpl(attrs);

    function show(callback) {
        // 先关掉之前的dialog
        var instance = $.magnificPopup.instance;
        if (instance.isOpen) {
            instance.st.callbacks.afterClose = function (e /*, params */) {
                show(callback);
            };
            instance.close();
            return;
        }

        $.magnificPopup.open({
            removalDelay: 300, //delay removal by X to allow out-animation,
            items: {
                src: source
            },
            // overflowY: 'hidden', //
            callbacks: {
                beforeOpen: function (e) {
                    if (typeof(style) == "undefined")
                        this.st.mainClass = "mfp-zoomIn";
                    else
                    //this.st.mainClass = "mfp-rotateLeft"
                        this.st.mainClass = style;
                },
                open: callback
            },
            midClick: true, // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
            closeOnBgClick: attrs.closeOnBgClick,
            focus: attrs.focus
        });
        if (attrs.minHeight) {
            $('#nv-dialog-body').css('min-height', attrs.minHeight);
        }
        if (attrs.maxHeight) {
            $('#nv-dialog-body').css('max-height', attrs.maxHeight);
        }
        if (attrs.hideLeftBtn == true) {
            $('#nv-dialog-leftbtn').hide();
        }
        if (attrs.hideRightBtn == true) {
            $('#nv-dialog-rightbtn').hide();
        }
        if (attrs.hideHeader == true) {
            $('#nv-dialog-header').hide();
        }
        if (attrs.hideFooter == true) {
            $('#nv-dialog-footer').hide();
        }
        $('#nv-dialog-leftbtn').on('click', attrs.leftBtnCallback);
        $('#nv-dialog-rightbtn').on('click', attrs.rightBtnCallback);
        $('.mfp-close').removeAttr('title');
        $('.mfp-close').on('click', attrs.closeBtnCallback);
    }

    return {
        show: show,
        dismiss: dismiss
    };
}

function dismiss() {
    $.magnificPopup.close();
}

module.exports = {
    attrs: attrs,
    build: build,
    dismiss: dismiss
};
