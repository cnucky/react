var $ = require('jquery');
var _ = require('underscore');
var html2canvas = require('utility/html2canvas/html2canvas');
var tplNode = require('../../tpl/modeling/tpl-node-item.html');
tplNode = _.template(tplNode);

require('./modeling-create-image.css');
var svg = _.template('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50" fill="transparent">' +
    '<rect rx="12" ry="12" width="100%" height="100%" stroke-width="0" stroke="black"></rect>' +
    '<foreignObject width="100%" height="100%"><%= html %></foreignObject></svg>')

module.exports.createImage = function(opt) {
    var node = $(tplNode({title:opt.name}));
    node.attr('id', 'tpl-node-item');
    node.find('.node-icon > span').addClass('fa fa-flag');
    $(document.body).append(node);
    html2canvas(node[0], {
        width: 240,
        height: 60
    }).then(function(canvas) {
        var newImage = new Image();
        newImage.src = canvas.toDataURL("image/png");
        $('#tpl-node-item').remove();
        opt.callback(newImage);
    });
}
