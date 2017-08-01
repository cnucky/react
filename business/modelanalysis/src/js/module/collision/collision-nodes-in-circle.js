define('./collision-nodes-in-circle', [
    'jquery',
    'underscore'
], function($, _) {

    var ocanvas;
    var _nodeCount;
    var _captionArray;
    var _type;
    // var _name;
    var database;
    var originDatabase;

    var zoomLevel = window.devicePixelRatio; // 当前页面缩放等级
    var multiple = 4; // ocanvas 画图的座标必须除 4，高清屏非高清屏都是 4
    var oddStartAngle = 90, // 奇数个节点 开始角度，从上面开始
        evenStartAngle = 0; // 偶数个节点 开始角度，从右边开始

    // function resizeCanvas() {
    //     var height =$(window).height() - $('#network-container').offset().top-5;//蜜汁高度差，如果不减去5，会超出屏幕然后出现滚动条
    //     console.log('resize', height)
    //     // var height = $(window).height() - $('#network-container').offset().top;
    //     $('#drawing').height(height);
    //     $('#thecanvas').height(height);
    //     $('#thecanvas').width($('#drawing').width());
    //     $('#thecanvas').attr('width', $('#drawing').width());
    //     $('#thecanvas').attr('height', height);

    //     ocanvas = oCanvas.create({
    //         canvas: "#thecanvas",
    //         background: "#F0F0F0",
    //         fps: 60
    //     });

    //     // 窗口大小改变，重新绘制
    //     render();
    // }
    function createoCanvas(){
        ocanvas = oCanvas.create({
            canvas: "#thecanvas",
            background: "#F0F0F0",
            fps: 60
        });

        // 窗口大小改变，重新绘制
        if(_type){
            render();
        }
    }
    // // bind resize events
    // (function() {
    //     $(window).on('nv-resize resize', resizeCanvas);
    //     resizeCanvas();
    // })(); // end resize events

    // 重选语义、选多个数据源、取消选择数据源时重新绘制语义和数据源
    function render() {
        ocanvas.reset();
        // drawTypeImage(_type, _name);
        drawTypeImage(_type);
        generateNodes(_nodeCount, _captionArray);
    }


    // 语义
    function setTypeDataSource(type) {
        _type = type;// 全局使用
        // _name = name;
        render();
    }

    function drawTypeImage(type) {

        var imageSrc;
        var name = "集合分析";
        if (type == 103) {
            imageSrc = "../modelanalysis/img/collision/icon-intersection.png";
            name = "交集分析";
        } else if (type == 104) {
            imageSrc = "../modelanalysis/img/collision/icon-union.png";
            name = "并集分析";
        } else if (type == 105) {
            imageSrc = "../modelanalysis/img/collision/icon-subtraction.png";
            name = "差集分析";
        } else if (type == 106) {
            imageSrc = "../modelanalysis/img/collision/icon-differentiation.png";
            name = "异或分析";
        }

        var image = ocanvas.display.image({
            x: Math.round($('#thecanvas').attr('width') / 2 + 15),
            y: Math.round($('#thecanvas').attr('height') / 2 - 30),
            width: 105,
            height: 72,
            origin: { x: "center", y: "center" },
            image: imageSrc
        });
        ocanvas.addChild(image);

        // if (!_.isEmpty(name)) {
            var text = ocanvas.display.text({
                x: Math.round($('#thecanvas').attr('width') / 2 + 15),
                y: Math.round($('#thecanvas').attr('height') / 2 + 15),
                origin: { x: "center", y: "center" },
                font: "14px sans-serif",
                text: name,
                fill: "#000"
            });
            ocanvas.addChild(text);
            var rectanglewidth = text.width;
            if (rectanglewidth < image.width) {
                rectanglewidth = image.width;
            } else {
                rectanglewidth += 15;
            }
        // }

        var rectangle = ocanvas.display.rectangle({
            x: Math.round($('#thecanvas').attr('width') / 2 + 15),
            y: Math.round($('#thecanvas').attr('height') / 2 - 20),
            origin: { x: "center", y: "center" },
            width: rectanglewidth,
            height: 100,
            stroke: "outside 1px #A1C9FC"
        });
        ocanvas.addChild(rectangle);
    }


    // 数据源
    function setDataSource(nodeCount, captionArray) {
        _nodeCount = nodeCount;
        _captionArray = captionArray; // 全局使用
        render();
    }

    function generateNodes(nodeCount, captionArray) {

        var circleCenter = {
            x: Math.round($('#thecanvas').attr('width') / multiple),
            y: Math.round($('#thecanvas').attr('height') / multiple)
        }; // 圆心座标

        var r = Math.min(circleCenter.x, circleCenter.y) - 40; // 园的半径

        if (nodeCount % 2 == 1) {
            database = [];
            originDatabase = [];
            for (var i = 0; i < nodeCount; i++) {
                var radian = (oddStartAngle + i * (360 / nodeCount)) / 180 * Math.PI;
                var node = {
                    x: Math.round(circleCenter.x + r * Math.cos(radian)),
                    y: Math.round(circleCenter.y - r * Math.sin(radian)),
                    name: captionArray[i]
                };

                drawCylinderWithOCanvas(node.x, node.y, node.name, function(data) {
                    database.push(data);
                    originDatabase.push({
                        x: data.x,
                        y: data.y
                    });
                });
            }
        } else if (nodeCount % 2 == 0) {
            database = [];
            originDatabase = [];
            for (var j = 0; j < nodeCount; j++) {
                var radianj = (evenStartAngle + j * (360 / nodeCount)) / 180 * Math.PI;
                var nodej = {
                    x: Math.round(circleCenter.x + r * Math.cos(radianj)),
                    y: Math.round(circleCenter.y - r * Math.sin(radianj)),
                    name: captionArray[j]
                };

                drawCylinderWithOCanvas(nodej.x, nodej.y, nodej.name, function(data) {
                    database.push(data);
                    originDatabase.push({
                        x: data.x,
                        y: data.y
                    });
                });
            }
        }
    }


    function drawCylinderWithOCanvas(cx, cy, nodeName, callback) {
        ocanvas.display.register("cylinder", {
            shapeType: "raidal"
        }, function(ocanvas) {
            var cx = this.x,
                cy = this.y,
                nodeName = this.nodeName;

            ocanvas.font = "60px FontAwesome";
            ocanvas.fillStyle = "#A1C9FC";
            ocanvas.fillText('\uf1c0', cx - 12, cy - 18);

            ocanvas.font = "14px sans-serif";
            ocanvas.fillStyle = "#000";
            var w = ocanvas.measureText(nodeName).width;
            ocanvas.fillText(nodeName, cx - w / multiple, cy + 10);
        });

        var cylinder = ocanvas.display.cylinder({
            x: cx,
            y: cy,
            nodeName: nodeName
        });
        ocanvas.addChild(cylinder);
        callback(cylinder);
    }


    // 动画
    function animation() {
        _.each(database, function(item) {
            var curDatabase = item;
            curDatabase.stop();
            curDatabase.animate({
                x: Math.round($('#thecanvas').attr('width') / multiple),
                y: Math.round($('#thecanvas').attr('height') / multiple)
            }, {
                duration: 600,
                easing: "ease-in-back",
                callback: function() {
                    $('#drawing').hide();
                    _loader();
                }
            });
        });

        // setTimeout(_loader, 700);
    }


    // 逆向动画
    function reverseAnimation() {
        $('#drawing').show();
        _hideLoader();
        for (var i = 0; i < _.size(database); i++) {
            database[i].stop();
            database[i].animate({
                x: originDatabase[i].x,
                y: originDatabase[i].y
            }, {
                duration: 600,
                easing: "ease-in-out-cubic"
            });
        }
    }


    // loader
    function _loader() {
        var position = {
            x: Math.round($('#drawing').width() / 2),
            y: Math.round($('#drawing').height() / 2)
        }
        _showLoader(position);
        // setTimeout(_hideLoader, 1600);
    }

    function _showLoader(position) {
        var container = $('<div class="extend-loader">').css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': $('#drawing').width(),
            'height': $('#drawing').height(),
            'z-index': 3
        });
        var loader = $('<div class="loader"><div class="loader-inner square-spin"><div></div></div></div>');
        loader.css({
            'position': 'absolute',
            'top': (position.y - 60) + 'px',
            'left': (position.x - 28) + 'px'
        });
        loader.find('.loader-inner > div').css({
            'border': '0px',
            'background-color': '#02C4F4',
            'width': '80px',
            'height': '80px'
        });
        $('#network-container').append(container);
        container.append(loader);
    }

    function _hideLoader() {
        $('#network-container .extend-loader').remove();
    }


    return {
        setTypeDataSource: setTypeDataSource,
        setDataSource: setDataSource,
        animation: animation,
        reverseAnimation: reverseAnimation,
        createoCanvas: createoCanvas
    };
});
