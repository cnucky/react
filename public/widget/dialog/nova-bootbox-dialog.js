define('nova-bootbox-dialog', ['./tpl/tpl-bootbox-dialog', 'utility/magnific-popup/jquery.magnific-popup'],
    function(tpl) {

        tpl = _.template(tpl);
        tplDeleteConfirm = _.template('<div>\
            <h4><%= info %></h4>\
            </div>\
            ');
        // bootbox.setDefaults('locale', 'zh_CN');
        var attrs;
        var source;

        function _build(opts) {
            attrs = {
                content: opts.content,
                leftBtn: opts.leftBtn || "取消",
                rightBtn: opts.rightBtn || "确定",
                hideLeftBtn: opts.hideLeftBtn,
                leftBtnCallback: opts.leftBtnCallback || function() {
                    $.magnificPopup.close();
                },
                rightBtnCallback: opts.rightBtnCallback || function() {
                    $.magnificPopup.close();
                },
                style: opts.style || 'basic',
                width: opts.width || 0,
                closeOnBgClick: opts.closeOnBgClick || true
            };
            source = tpl(attrs);
        }

        function _show(callback) {
            $.magnificPopup.open({
                removalDelay: 500, //delay removal by X to allow out-animation,
                items: {
                    src: source
                },
                callbacks: {
                    beforeOpen: function(e) {
                        this.st.mainClass = "mfp-zoomIn";
                    },
                    open: callback
                },
                midClick: true,
                closeOnBgClick: attrs.closeOnBgClick,
                showCloseBtn: false
            });
            if (attrs.hideLeftBtn == true) {
                $('#nv-dialog-leftbtn').hide();
            }
            $('#nv-dialog-leftbtn').on('click', attrs.leftBtnCallback);
            $('#nv-dialog-rightbtn').on('click', attrs.rightBtnCallback);
        }

        function confirm(message, callback) {
        	_build({
        		content: tplDeleteConfirm({
        			info: message
        		}),
                leftBtnCallback: function () {
                    _.isFunction(callback) && callback(false);
                    $.magnificPopup.close();
                },
        		rightBtnCallback: function() {
    			    _.isFunction(callback) && callback(true);
                    $.magnificPopup.close();
                }
        	});
        	_show();
        }

        function alert(message, callback) {
        	_build({
        		content: tplDeleteConfirm({
        			info: message
        		}),
        		hideLeftBtn: true,
                leftBtnCallback: function () {
                    _.isFunction(callback) && callback(false);
                    $.magnificPopup.close();
                },
        		rightBtnCallback: function() {
    			    _.isFunction(callback) && callback(true);
                    $.magnificPopup.close();
                }
        	});
        	_show();
        }

        return {
            confirm: confirm,
            alert: alert
        };
    });
