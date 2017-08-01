define('utility/loaders', ['jquery'], function() {
    function loader(dom) {
        dom = $(dom);
        var maskerContainer = $('<div>').css({
            position: 'relative',
            top: 0,
            left: 0,
            width: 0,
            height: 0
        }).addClass('nova-container-loader');

        var masker = $('<div>').css({
            position: 'absolute',
            top: 0,
            left: 0,
            width: dom.width() + 'px',
            height: dom.height() + 'px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            zIndex: 1000,
        });

        masker.append([
            '<div class="loader-container" style="margin: auto;">',
            '<div class="loader-inner line-scale">',
            '<div></div><div></div><div></div><div></div><div></div>',
            '</div>',
            '</div>'
        ].join(''))

        dom.prepend(maskerContainer.append(masker));

        return {
            hide: function() {
                dom.find('.nova-container-loader').remove();
            }
        }
    }

    return loader;
});
