define('nova-home-dialog', [
    './tpl/tpl-home-dialog',
    'jquery', 
    'underscore',
    'utility/magnific-popup/jquery.magnific-popup'
    ], function(tpl) {

        tpl = _.template(tpl);
        var instance;
        var attrs;
        var source;

        function build(opts) {
            attrs = {
                title: opts.title || "",
                content: opts.content || "",
                hideFooter: opts.hideFooter,
                extraBtn: opts.extraBtn || [],
                extraListener: opts.extraListener || [],
                style: opts.style || 'basic',  // ENUM(basic: 450px, sm: 300px, lg: 700px, xl: 1000px, full: 90%)
                width: opts.width || 0,
                closeOnBgClick: opts.closeOnBgClick || true
            };
            source = tpl(attrs);

            return instance;
        }

        function show(callback) {
            $.magnificPopup.open({
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
            if (attrs.hideFooter) {
                $('#nv-dialog-footer').hide();
            }

            return instance;
        }

        function dismiss() {
            $.magnificPopup.close();
        }

        return instance = {
            attrs: attrs,
            build: build,
            show: show,
            dismiss: dismiss
        };
    });
