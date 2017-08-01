var tpl = _.template($('#tpl_dialog').html().trim());

var instance, attrs, source;

function build(opts) {
    instance = $.magnificPopup.instance;

    // 0、'' = false
    attrs = {
        title: opts.title || i18n.t('gismodule.LayerManager.novaDialog.title'),
        content: opts.content || i18n.t('gismodule.LayerManager.novaDialog.content'),
        leftBtn: opts.leftBtn || i18n.t('gismodule.LayerManager.novaDialog.leftBtn'),
        rightBtn: opts.rightBtn || i18n.t('gismodule.LayerManager.novaDialog.rightBtn'),
        hideLeftBtn: opts.hideLeftBtn,
        hideRightBtn: opts.hideRightBtn,
        hideFooter: opts.hideFooter,
        minHeight: opts.minHeight,
        leftBtnCallback: opts.leftBtnCallback || function() {
            instance.close();
        },
        rightBtnCallback: opts.rightBtnCallback || function() {
            instance.close();
        },
        extraBtn: opts.extraBtn || [],
        extraListener: opts.extraListener || [],
        style: opts.style || 'basic',  // ENUM(basic: 450px, sm: 300px, lg: 700px, xl: 1000px, full: 90%)
        width: opts.width || 0,
        closeOnBgClick: _.isUndefined(opts.closeOnBgClick) ? true : opts.closeOnBgClick
    };
    source = tpl(attrs);

    return this;
}

function show(callback) {
    instance.open({
        removalDelay: 500, //delay removal by X to allow out-animation,
        items: {
            src: source
        },
        // overflowY: 'hidden', //
        callbacks: {
            beforeOpen: function(e) {
                this.st.mainClass = "mfp-zoomIn";
            },
            open: callback
        },
        midClick: true, // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
        closeOnBgClick: attrs.closeOnBgClick
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
    if (attrs.hideFooter) {
        $('#nv-dialog-footer').hide();
    }
    $('#nv-dialog-leftbtn').on('click', attrs.leftBtnCallback);
    $('#nv-dialog-rightbtn').on('click', attrs.rightBtnCallback);

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


