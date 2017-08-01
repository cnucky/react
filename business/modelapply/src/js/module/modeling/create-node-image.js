define([
    "./operations",
    "./colors",
    "nova-notify",
    "jquery",
    "underscore"
], function(OPERATIONS, TakeColor, Notify) {
    function defaultStyle(type) {
        return {
            canvas: {
                width: 260,
                height: 60
            },
            icon: {
                background: TakeColor(type),
                // color: '#ffffff',
                color: TakeColor(type),
                size: 40,
                fontSize: 30,
                // fontFamily: 'FontAwesome',
                fontFamily: 'icomoonOp',
                marginLeft: 5
            },
            title: {
                color: '#666',
                fontSize: 24,
                fontFamily: 'Helvetica',
                marginLeft: 8,
                maxWidth: 150
            },
            status: {
                color: '#289de9',
                fontSize: 30,
                fontFamily: 'NovaCommon',
                marginRight: 5
            }
        };
    }

    function createImage(opts) {
        // var opts = generateInfo(opts);
        var styles = $.extend(true, {}, defaultStyle(opts.type), opts.styles);
        var canvas = document.createElement('canvas');
        canvas.width = styles.canvas.width;
        canvas.height = styles.canvas.height;
        var baseline = canvas.height / 2;
        var ctx = canvas.getContext('2d');
        //draw icon
        var r = styles.icon.size / 2;
        var left = styles.icon.marginLeft + r;
        // ctx.fillStyle = styles.icon.background;
        // ctx.arc(left, baseline, r, 0, 2 * Math.PI);
        // ctx.fill();
        ctx.fillStyle = styles.icon.color;
        ctx.font = styles.icon.fontSize + 'px ' + styles.icon.fontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        //code of xiaochun
        // var OPERATIONS = require('./operations');
        if(opts.type == OPERATIONS.DATA_SOURCE){
            opts.icon = '\ue904';
        }
        ctx.fillText(opts.icon, left, baseline);
        //draw title
        left = left + r + styles.title.marginLeft;
        ctx.font = 'bold ' + styles.title.fontSize + 'px ' + styles.title.fontFamily;
        ctx.fillStyle = styles.title.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        if (ctx.measureText(opts.name).width > styles.title.maxWidth) {
            var newName = '';
            for (var i = 0; i < opts.name.length; i++) {
                if ((ctx.measureText(newName).width + ctx.measureText(opts.name[i]).width) < styles.title.maxWidth) {
                    newName = newName + opts.name[i];
                } else {
                    break;
                }
            }
            opts.name = newName + '...';
        }
        ctx.fillText(opts.name, left, baseline);
        //draw status
        if(opts.status) {
            left = styles.canvas.width - styles.status.marginRight;
            ctx.font = styles.status.fontSize + 'px ' + styles.status.fontFamily;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = styles.status.color;
            ctx.fillText(opts.status, left, baseline);
        }

        var newImage = new Image();
        newImage.src = canvas.toDataURL("image/png");
        opts.callback(newImage);
    }

    function generateInfo(opts) {
        return {
            canvasSize: {
                width: opts.canvasSize.width ? opts.canvasSize.width : 210,
                height: opts.canvasSize.height ? opts.canvasSize.height : 90
            },
            image: opts.image ? opts.image : '/img/avatar-placeholder.png',
            imagePositions: {
                x: opts.imagePositions.x ? opts.imagePositions.x : 5,
                y: opts.imagePositions.y ? opts.imagePositions.y : 20
            },
            imageSize: {
                width: opts.imageSize.width ? opts.imageSize.width : 70,
                height: opts.imageSize.height ? opts.imageSize.height : 50
            },
            nameFontSize: opts.nameFontSize ? opts.nameFontSize : 22,
            remarksFontSize: opts.remarksFontSize ? opts.remarksFontSize : 20,
            name: opts.name ? opts.name : '新节点',
            icon: opts.icon ? opts.icon : '\uf1c0',
            namePositions: {
                x: opts.namePositions.x ? opts.namePositions.x : 80,
                y: opts.namePositions.y ? opts.namePositions.y : 38
            },
            remarks: opts.remarks ? opts.remarks : '',
            remarksPositions: {
                x: opts.remarksPositions.x ? opts.remarksPositions.x : 80,
                y: opts.remarksPositions.y ? opts.remarksPositions.y : 72
            },
            callback: opts.callback ? opts.callback : undefined
        };
    }

    return {
        createImage: createImage
    };
});
