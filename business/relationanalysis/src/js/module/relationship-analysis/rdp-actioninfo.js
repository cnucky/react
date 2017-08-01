define('./rdp-actioninfo', [
    '../../tpl/rlf/rlf-actioninfo-timeline-item',
    '../../tpl/rlf/rlf-actioninfo-timeline-groupitem',
    'utility/loaders',
    'nova-notify'
], function(tpl, tplGroup, loaders, Notify) {


    var actionTypes = {
        1: {
            name: '火车',
            class: 'fa fa-train',
            color: '#EC952E'
        },
        2: {
            name: '飞机',
            class: 'fa fa-plane',
            color: '#4BC87F'
        }
    }

    tpl = _.template(tpl);
    tplGroup = _.template(tplGroup);


    function init(opts) {
        var position, idInfo;
        var data = null;
        var _opts;
        _opts = opts;
        idInfo = opts.idInfo;
        position = opts.position;

        function render() {
            if (data == null) {
                loadData();
            } else {
                dorender();
            }
        }

        function loadData() {
            if (!_opts.type || !_opts.value)
                return;
            var loader = loaders($(position + " " + '#actioninfo' + idInfo).css({ //
                'min-height': '400px'
            }));
            $.getJSON('/relationanalysis/personcore/actioninfo', {
                    type: _opts.type,
                    value: _opts.value
                }).done(function(rsp) {
                    loader.hide();
                    if (rsp.code == 0) {
                        data = rsp.data;
                        dorender();
                    } else {
                        Notify.show({
                            title: '服务器异常',
                            text: rsp.message,
                            type: 'danger'
                        })
                    }
                })
                .fail(function(err) {
                    loader.hide();
                    Notify.show({
                        title: '服务器异常',
                        text: err,
                        type: 'danger'
                    })
                })
        }

        function dorender() {
            var htmls = [];
            if (data.group) {
                _.each(data.actions, function(action) {
                    htmls.push(tplGroup(action));
                });
            } else {
                _.each(data.actions, function(action) {
                    formatAction(action);
                    htmls.push(tpl(action));
                });
            }
            $(position + " " + '#actioninfo-timeline-items').html(htmls.join('')); //

            var tagContainer = $(position + " " + '#actioninfo-tag'); //
            tagContainer.empty();
            _.each(data.topCityList, function(item) {
                var content = item.cityName + "(" + item.freq + ")";
                var tag = $('<span>').addClass('tm-tag');
                tag.append($('<span>').text(content));
                tag.addClass(item.freq < 5 ? 'tm-tag-primary' : 'tm-tag-warning');
                tagContainer.append(tag);
            })
        }

        function formatAction(action) {
            action.viewProps = actionTypes[action.type] || {
                name: '--',
                class: 'fa fa-user',
                color: 'gray'
            }
        }

        return {
            render: render
        };
    }



    return {
        init: init
    }
})
