define('./relationship-overview', ['jquery', 'underscore'], function() {
    var network;
    var overviewNetwork;
    var shown = false;
    var ratio = 0.25;
    var scale = ratio;

    function initSize() {
        var w = $('#drawing').width();
        var h = $('#drawing').height();

        w = w * ratio;
        h = h * ratio;

        $('#mini-scope').width(w).height(h);
        $('#mini-scope canvas').width(w).height(h);
        overviewNetwork && overviewNetwork.setSize(w + 'px', h + 'px');
    }

    function createOverviewNetwork(canvas) {
        var newNetwork = new vis.Network(canvas, {
            nodes: [],
            edges: []
        }, {
            edges: {
                smooth: false
            },
            layout: {
                randomSeed: 1
            },
            interaction: {
                dragView: false,
                dragNodes: false,
                zoomView: false,
                selectable: false
            },
            physics: {
                enabled: false,
                stabilization: {
                    onlyDynamicEdges: true
                }
            }
        });
        return newNetwork;
    }

    function bindNetworkEvent() {
        network.on('afterDrawing', update);
        overviewNetwork.on('click', onClick);
        $("#mini-scope").on('mousedown',onMousedown);
        $("#mini-scope").on('mousewheel',onMousewheel);
    }

    function unbindNetworkEvent() {
        network.off('afterDrawing', update);
        overviewNetwork.off('click', onClick);
        $("#mini-scope").off('mousedown',onMousedown);
        $("#mini-scope").off('mousewheel',onMousewheel);
    }

    function onClick(params) {
        network.moveTo({
            position: params.pointer.canvas
        })
    }

    function  onMousedown(params){
        var temp = overviewNetwork.DOMtoCanvas({
            x: params.offsetX,
            y: params.offsetY
        });
        if  (isInMiniscopeOverlap(params)){
                $('#mini-scope').on('mousemove',function(e){
                     var cur = overviewNetwork.DOMtoCanvas({
                     x: e.offsetX,
                     y: e.offsetY
                     });
                     var curDOM = network.canvasToDOM(cur);
                     var tempDOM = network.canvasToDOM(temp);
                     network.moveTo({
                        offset:{x: tempDOM.x-curDOM.x,y:tempDOM.y-curDOM.y}
                     });
                    temp = cur;
                });

                $('#mini-scope').on('mouseup',function(e){
                     $("#mini-scope").off('mouseup');
                     $("#mini-scope").off('mousemove');
                 });
        }
    }

    function isInMiniscopeOverlap(params){
        var scopeOverlapLeft = $('#mini-scope-overlap').position().left;
        var scopeOverlapRight = $('#mini-scope-overlap').position().left+$('#mini-scope-overlap').width();
        var scopeOverlapTop = $('#mini-scope-overlap').position().top;
        var scopeOverlapBottom = $('#mini-scope-overlap').position().top+$('#mini-scope-overlap').height();
        if (params.offsetX >= scopeOverlapLeft && params.offsetX <= scopeOverlapRight 
            && params.offsetY >= scopeOverlapTop && params.offsetY <= scopeOverlapBottom){
            return true;
        }
        return false;
    }

    function onMousewheel(event){
        var delta = 0;
        if (event.originalEvent.wheelDelta) {
          delta = event.originalEvent.wheelDelta / 120;
        } else if (event.originalEvent.detail) {
          delta = -event.originalEvent.detail / 3;
        }

        if (delta !== 0) {

          var scale = network.body.view.scale;
          var zoom = delta / 10;
          if (delta < 0) {
            zoom = zoom / (1 - zoom);
          }
          scale *= 1 + zoom;

          var pointer = network.interactionHandler.getPointer({ x: event.originalEvent.clientX, y: event.originalEvent.clientY });
          network.interactionHandler.zoom(scale, pointer);
        }
    }

    function update() {
        if (!shown) return;
        updateNetwork(overviewNetwork);
        drawBoundsRect();
    }

    function updateNetwork(newNetwork) {
        network.storePositions();
        newNetwork.setData(network.body.data);
    }

    function drawBoundsRect() {
        var canvasWidth = $('#drawing').width();
        var canvasHeight = $('#drawing').height();
        var overviewWidth = $('#mini-scope canvas').width();
        var overviewHeight = $('#mini-scope canvas').height();
        var leftTop = network.DOMtoCanvas({
            x: 0,
            y: 0
        });
        var rightBottom = network.DOMtoCanvas({
            x: canvasWidth,
            y: canvasHeight
        });
        leftTop = overviewNetwork.canvasToDOM(leftTop);
        rightBottom = overviewNetwork.canvasToDOM(rightBottom);
        leftTop.x = Math.max(leftTop.x, 0);
        leftTop.x = Math.min(leftTop.x, overviewWidth)
        leftTop.y = Math.max(leftTop.y, 0);
        leftTop.y = Math.min(leftTop.y, overviewHeight);
        rightBottom.x = Math.min(rightBottom.x, overviewWidth);
        rightBottom.x = Math.max(rightBottom.x, 0);
        rightBottom.y = Math.min(rightBottom.y, overviewHeight);
        rightBottom.y = Math.max(rightBottom.y, 0);
        var w = rightBottom.x - leftTop.x;
        var h = rightBottom.y - leftTop.y;
        if (w > 0 && h > 0) {
            $('#mini-scope-overlap').css({
                'top': leftTop.y + 'px',
                'left': leftTop.x + 'px',
                'width': w + 'px',
                'height': h + 'px',
                'pointer-events': 'none',
                'display': 'block'
            })
        } else {
            $('#mini-scope-overlap').css({
                'display': 'none'
            })
        }
    }

    function show() {
        shown = true;
        $('#mini-scope').show();
        overviewNetwork = createOverviewNetwork($('#mini-scope-drawing').get(0));
        network.overview = overviewNetwork;
        bindNetworkEvent();
        initSize();
        update();
        $('#mini-scope-drawing .vis-network canvas').css('cursor', 'crosshair');
    }

    return {
        create: function(_network, _shown) {
            network = _network;
            if (_shown) {
                show();
            }
        },
        resize: function() {
            initSize();
        },
        show: show,

        hide: function() {
            $('#mini-scope').hide();
            unbindNetworkEvent();
            shown = false;
        },
        GetPreview: function(_network, _canvas) {
            var save = network;
            network = _network;
            var newNetwork = createOverviewNetwork(_canvas);
            updateNetwork(newNetwork);
            network = save;
        }
    }
});
