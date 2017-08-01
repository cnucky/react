var tpl = require('./tpl/tpl-empty-dialog');
//require('utility/magnific-popup/jquery.magnific-popup');
require('../../js-components/magnific-popup/jquery.magnific-popup.min');

tpl = _.template(tpl);

var instance, attrs, source;



function build(opts) {
    instance = $.magnificPopup.instance;

    // 0、'' = false
    attrs = {
        title: opts.title || "确定框",
        content: opts.content || "确定？",
        leftBtn: opts.leftBtn || "取消",
        rightBtn: opts.rightBtn || "确定",
        hideLeftBtn: opts.hideLeftBtn,
        hideRightBtn: opts.hideRightBtn,
        hideHeader: opts.hideHeader,
        hideFooter: opts.hideFooter,
        maxHeight: opts.maxHeight || 1000,
        minHeight: opts.minHeight || 10,
        innerHeight: opts.innerHeight || 0,
        leftBtnCallback: opts.leftBtnCallback || function() {
            instance.close();
        },
        rightBtnCallback: opts.rightBtnCallback || function() {
            instance.close();
        },
        closeBtnCallback: opts.closeBtnCallback || function() {
            $.magnificPopup.close();
        },
        extraBtn: opts.extraBtn || [],
        extraListener: opts.extraListener || [],
        style: opts.style || 'basic',  // ENUM(basic: 450px, sm: 300px, lg: 700px, xl: 1000px, full: 90%)
        width: opts.width || 0,
        closeOnBgClick: _.isUndefined(opts.closeOnBgClick) ? true : opts.closeOnBgClick,
        focus: opts.focus || ""
    };
    source = tpl(attrs);

    return this;
}

function show(callback,style) {
    instance.open({
        removalDelay: 500, //delay removal by X to allow out-animation,
        items: {
            src: source
        },
        // overflowY: 'hidden', //
        callbacks: {
            beforeOpen: function(e) {
                if(typeof(style)=="undefined")
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
    if (attrs.hideLeftBtn == true) {
        $('#nv-dialog-leftbtn').hide();
    }
    if (attrs.hideRightBtn == true) {
        $('#nv-dialog-rightbtn').hide();
    }
    if (attrs.hideHeader) {
        $('#nv-dialog-header').hide();
    }
    if (attrs.hideFooter) {
        $('#nv-dialog-footer').hide();
    }
    $('#nv-dialog-leftbtn').on('click', attrs.leftBtnCallback);
    $('#nv-dialog-rightbtn').on('click', attrs.rightBtnCallback);
    $('.mfp-close').on('click', attrs.closeBtnCallback);
   /* var contentBody = $('#nv-dialog-body');
    var outerHeight = contentBody.height();
    var innerHeight = contentBody.children().height();
    if (innerHeight > outerHeight) {
        contentBody.addClass('scroller');
        contentBody.wrapInner('<div class="scroller-content pn"></div>');
         contentBody.prepend('<div class="scroller-bar"><div class="scroller-track"><div class="scroller-handle"></div></div></div>');
         var scrollbar = contentBody.find('.scroller-bar');
         scrollbar.height(outerHeight - 1);
         scrollbar.find('.scroller-track').height(scrollbar.height());
         scrollbar.find('.scroller-handle').height(scrollbar.height() * outerHeight / innerHeight);
    }*/

    return this;
}

function dismiss() {
    instance.close();
}

module.exports = {
    attrs: attrs,
    build: build,
    show: show,
    dismiss: dismiss
};