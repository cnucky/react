initLocales();
require([], function() {
        hideLoader();
        var colors = new Array("#949449", "#2894ff", "#66b3ff", "#005ab5");

        var textContent = new Array("五纵五横系统", "网络公开数据", "业务积累数据", "对接", "链路标准", "数据标准", "接口标准", "清洗", "垃圾号码过滤", "号码规整", "身份证校验",
            "分析", "隐关系发现", "实体抽取", "异常行为标签", "亲密度计算", "融合", "实体关联", "伴随关联", "属性合并", "人立方", "话单库", "专题库");

        var strokeStyleArray = new Array("#CCCC66", "#CCCC66", "3366ff", "#505050");
        var fillStyleArray = new Array("#000000", "#ffffff", "#ffffff");

        var leftWidth = 120;
        var colWidth = 180;
        var topHeight = 70;
        var col1RowHeight = 150;
        var col2RowHeight = 100;
        var RectHeight = 50;
        var RectWidth = 100;
        var RectHeight1 = 60;
        var RectWidth1 = 100;

        var RectHeight2 = 65;
        var RectWidth2= 100;

        var width1 = 30;

        var aEllipse = 40;
        var bEllipse = 20;

        var topXText = -25;
        var topYText = 8;

        var rightXText = -31;
        var rightYText = 18;

        function Point() {
            this.x = 0;
            this.y = 0;
            this.radii = 0;
            this.color = "";
        }

        CanvasRenderingContext2D.prototype.roundRect =
            function(x, y, width, height, radius, fill, stroke) {
                if (typeof stroke == "undefined") {
                    stroke = true;
                }
                if (typeof radius === "undefined") {
                    radius = 5;
                }
                this.beginPath();
                this.moveTo(x + radius, y);
                this.lineTo(x + width - radius, y);
                this.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.lineTo(x + width, y + height - radius);
                this.quadraticCurveTo(x + width, y + height, x + width - radius, y+ height);
                this.lineTo(x + radius, y + height);
                this.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.lineTo(x, y + radius);
                this.quadraticCurveTo(x, y, x + radius, y);
                this.closePath();
                if (stroke) {
                    this.stroke();
                }
                if (fill) {
                    this.fill();
                }
            };

        CanvasRenderingContext2D.prototype.dashedLineTo = function (fromX, fromY, toX, toY, pattern) {
            // default interval distance -> 5px
            if (typeof pattern === "undefined") {
                pattern = 5;
            }

            // calculate the delta x and delta y
            var dx = (toX - fromX);
            var dy = (toY - fromY);
            var distance = Math.floor(Math.sqrt(dx*dx + dy*dy));
            var dashlineInteveral = (pattern <= 0) ? distance : (distance/pattern);
            var deltay = (dy/distance) * pattern;
            var deltax = (dx/distance) * pattern;

            // draw dash line
            this.beginPath();
            for(var dl=0; dl<dashlineInteveral; dl++) {
                if(dl%2) {
                    this.lineTo(fromX + dl*deltax, fromY + dl*deltay);
                } else {
                    this.moveTo(fromX + dl*deltax, fromY + dl*deltay);
                }
            }
            this.stroke();
        };

        function roundedRect(cornerX, cornerY, width, height, cornerRadius) {
            if (width> 0) context.moveTo(cornerX + cornerRadius, cornerY);
            else  context.moveTo(cornerX - cornerRadius, cornerY);
            context.arcTo(cornerX+width,cornerY,cornerX + width,cornerY+height,cornerRadius);
            context.arcTo(cornerX+width,cornerY + height,cornerX,cornerY+height,cornerRadius);
            context.arcTo(cornerX,cornerY+height,cornerX,cornerY,cornerRadius);
            if(width> 0) {
                context.arcTo(cornerX,cornerY,cornerX+cornerRadius,cornerY,cornerRadius);
            }
            else{
                context.arcTo(cornerX,cornerY,cornerX-cornerRadius,cornerY,cornerRadius);
            }
        }

        function drawRoundedRect(strokeStyle,fillStyle,cornerX,cornerY,width,height,cornerRadius) {
            context.beginPath();
            roundedRect(cornerX, cornerY, width, height, cornerRadius);
            context.strokeStyle = strokeStyle;
            context.fillStyle = fillStyle;
            context.stroke();
            context.fill();
        }

        function getPoints(){
            var point = new Array();
            point[0] = new Point();
            point[0].x = leftWidth;
            point[0].y = topHeight;
            point[0].radii = 10;
            point[0].color = colors[0];
            point[0].strokeStyle = strokeStyleArray[0];
            point[0].fillStyle = fillStyleArray[0];
            point[0].xText = -40;
            point[0].yText = 4;

            point[1] = new Point();
            point[1].x = leftWidth;
            point[1].y = topHeight+col1RowHeight;
            point[1].radii = 10;
            point[1].color = colors[0];
            point[1].strokeStyle = strokeStyleArray[0];
            point[1].fillStyle = fillStyleArray[0];
            point[1].xText = -40;
            point[1].yText = 4;

            point[2] = new Point();
            point[2].x = leftWidth;
            point[2].y = topHeight+col1RowHeight*2;
            point[2].radii = 10;
            point[2].color = colors[0];
            point[2].strokeStyle = strokeStyleArray[0];
            point[2].fillStyle = fillStyleArray[0];
            point[2].xText = -40;
            point[2].yText = 4;

            //对接
            point[3] = new Point();
            point[3].x = leftWidth + colWidth;
            point[3].y = topHeight;
            point[3].radii = 10;
            point[3].color = colors[1];
            point[3].strokeStyle = strokeStyleArray[1];
            point[3].fillStyle = fillStyleArray[1];
            point[3].xText = topXText;
            point[3].yText = topYText;

            point[4] = new Point();
            point[4].x = leftWidth + colWidth;
            point[4].y = topHeight + col2RowHeight;
            point[4].radii = 10;
            point[4].color = colors[2];
            point[4].strokeStyle = strokeStyleArray[2];
            point[4].fillStyle = fillStyleArray[2];
            point[4].xText = -25;
            point[4].yText = 4;

            point[5] = new Point();
            point[5].x = leftWidth + colWidth;
            point[5].y = topHeight + 2*col2RowHeight;
            point[5].radii = 10;
            point[5].color = colors[2];
            point[5].strokeStyle = strokeStyleArray[2];
            point[5].fillStyle = fillStyleArray[2];
            point[5].xText = -25;
            point[5].yText = 4;

            point[6] = new Point();
            point[6].x = leftWidth + colWidth;
            point[6].y = topHeight + 3*col2RowHeight;
            point[6].radii = 10;
            point[6].color = colors[2];
            point[6].strokeStyle = strokeStyleArray[2];
            point[6].fillStyle = fillStyleArray[2];
            point[6].xText = -25;
            point[6].yText = 4;

            //清洗
            point[7] = new Point();
            point[7].x = leftWidth + 2*colWidth;
            point[7].y = topHeight;
            point[7].radii = 10;
            point[7].color = colors[1];
            point[7].strokeStyle = strokeStyleArray[1];
            point[7].fillStyle = fillStyleArray[1];
            point[7].xText = topXText;
            point[7].yText = topYText;

            point[8] = new Point();
            point[8].x = leftWidth + 2*colWidth;
            point[8].y = topHeight + col2RowHeight;
            point[8].radii = 10;
            point[8].color = colors[2];
            point[8].strokeStyle = strokeStyleArray[2];
            point[8].fillStyle = fillStyleArray[2];
            point[8].xText = -40;
            point[8].yText = 4;

            point[9] = new Point();
            point[9].x = leftWidth + 2*colWidth;
            point[9].y = topHeight + 2*col2RowHeight;
            point[9].radii = 10;
            point[9].color = colors[2];
            point[9].strokeStyle = strokeStyleArray[2];
            point[9].fillStyle = fillStyleArray[2];
            point[9].xText = -28;
            point[9].yText = 4;

            point[10] = new Point();
            point[10].x = leftWidth + 2*colWidth;
            point[10].y = topHeight + 3*col2RowHeight;
            point[10].radii = 10;
            point[10].color = colors[2];
            point[10].strokeStyle = strokeStyleArray[2];
            point[10].fillStyle = fillStyleArray[2];
            point[10].xText = -33;
            point[10].yText = 4;

            //分析
            point[11] = new Point();
            point[11].x = leftWidth + 3*colWidth;
            point[11].y = topHeight;
            point[11].radii = 10;
            point[11].color = colors[1];
            point[11].strokeStyle = strokeStyleArray[1];
            point[11].fillStyle = fillStyleArray[1];
            point[11].xText = topXText;
            point[11].yText = topYText;

            point[12] = new Point();
            point[12].x = leftWidth + 3*colWidth;
            point[12].y = topHeight + col2RowHeight;
            point[12].radii = 10;
            point[12].color = colors[2];
            point[12].strokeStyle = strokeStyleArray[2];
            point[12].fillStyle = fillStyleArray[2];
            point[12].xText = -33;
            point[12].yText = 4;

            point[13] = new Point();
            point[13].x = leftWidth + 3*colWidth;
            point[13].y = topHeight + 2*col2RowHeight;
            point[13].radii = 10;
            point[13].color = colors[2];
            point[13].strokeStyle = strokeStyleArray[2];
            point[13].fillStyle = fillStyleArray[2];
            point[13].xText = -28;
            point[13].yText = 4;

            point[14] = new Point();
            point[14].x = leftWidth + 3*colWidth;
            point[14].y = topHeight + 3*col2RowHeight;
            point[14].radii = 10;
            point[14].color = colors[2];
            point[14].strokeStyle = strokeStyleArray[2];
            point[14].fillStyle = fillStyleArray[2];
            point[14].xText = -40;
            point[14].yText = 4;

            point[15] = new Point();
            point[15].x = leftWidth + 3*colWidth;
            point[15].y = topHeight + 4*col2RowHeight;
            point[15].radii = 10;
            point[15].color = colors[2];
            point[15].strokeStyle = strokeStyleArray[2];
            point[15].fillStyle = fillStyleArray[2];
            point[15].xText = -33;
            point[15].yText = 4;

            //融合
            point[16] = new Point();
            point[16].x = leftWidth + 4*colWidth;
            point[16].y = topHeight;
            point[16].radii = 10;
            point[16].color = colors[1];
            point[16].strokeStyle = strokeStyleArray[1];
            point[16].fillStyle = fillStyleArray[1];
            point[16].xText = topXText;
            point[16].yText = topYText;

            point[17] = new Point();
            point[17].x = leftWidth + 4*colWidth;
            point[17].y = topHeight + col2RowHeight;
            point[17].radii = 10;
            point[17].color = colors[2];
            point[17].strokeStyle = strokeStyleArray[2];
            point[17].fillStyle = fillStyleArray[2];
            point[17].xText = -25;
            point[17].yText = 4;

            point[18] = new Point();
            point[18].x = leftWidth + 4*colWidth;
            point[18].y = topHeight + 2*col2RowHeight;
            point[18].radii = 10;
            point[18].color = colors[2];
            point[18].strokeStyle = strokeStyleArray[2];
            point[18].fillStyle = fillStyleArray[2];
            point[18].xText = -25;
            point[18].yText = 4;

            point[19] = new Point();
            point[19].x = leftWidth + 4*colWidth;
            point[19].y = topHeight + 3*col2RowHeight;
            point[19].radii = 10;
            point[19].color = colors[2];
            point[19].strokeStyle = strokeStyleArray[2];
            point[19].fillStyle = fillStyleArray[2];
            point[19].xText = -25;
            point[19].yText = 4;

            //右侧
            point[20] = new Point();
            point[20].x = leftWidth + 5*colWidth;
            point[20].y = topHeight;
            point[20].radii = 10;
            point[20].color = colors[3];
            point[20].strokeStyle = strokeStyleArray[3];
            point[20].fillStyle = fillStyleArray[0];
            point[20].xText = rightXText;
            point[20].yText = rightYText;

            point[21] = new Point();
            point[21].x = leftWidth + 5*colWidth;
            point[21].y = topHeight+col1RowHeight;
            point[21].radii = 10;
            point[21].color = colors[3];
            point[21].strokeStyle = strokeStyleArray[3];
            point[21].fillStyle = fillStyleArray[0];
            point[21].xText = rightXText;
            point[21].yText = rightYText;

            point[22] = new Point();
            point[22].x = leftWidth + 5*colWidth;
            point[22].y = topHeight+col1RowHeight*2;
            point[22].radii = 10;
            point[22].color = colors[3];
            point[22].strokeStyle = strokeStyleArray[3];
            point[22].fillStyle = fillStyleArray[0];
            point[22].xText = rightXText;
            point[22].yText = rightYText;

            return point;
        }

        function Utils() {};
        Utils.captureMouse = function(element) {
            var mouse = {
                x: 0,
                y: 0
            };
            element.addEventListener('click',
                function(event) {
                    var x, y;
                    if (event.pageX || event.pageY) {
                        x = event.pageX;
                        y = event.pageY;
                    } else {
                        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                    }
                    x -= element.offsetLeft;
                    y -= element.offsetTop;
                    mouse.x = x;
                    mouse.y = y;
                    //document.getElementById("point").value = "x=" + mouse.x + ";y=" + mouse.y;
                },
                false);
            return mouse;
        };

        function Arrow() {
            this.start_x = 0;
            this.start_y = 0;
            this.end_x = 0;
            this.end_y = 0;
            this.length = 0;
            this.radii = 0;
            this.arrow_len = 10;
            this.color = 'orange';//'#1e90ff';//"#ffff00";
            this.rotation = 0;
        }
        Arrow.prototype.draw = function(context) {
            context.save();
            context.translate(this.start_x, this.start_y);
            context.rotate(this.rotation);
            context.lineWidth = 2;
            context.fillStyle = this.color;
            context.strokeStyle = this.color;
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(0, -1);
            context.lineTo( - (this.length - this.radii - this.arrow_len), -1);
            context.lineTo( - (this.length - this.radii - this.arrow_len), -5);
            context.lineTo( - (this.length - this.radii), 0);
            context.lineTo( - (this.length - this.radii - this.arrow_len), 5);
            context.lineTo( - (this.length - this.radii - this.arrow_len), 1);
            context.lineTo(0, 1);
            context.closePath();
            context.stroke();
            context.restore();
        };

        var pageHeight = $("#container")[0].offsetWidth*0.5;
        var pageWidth = $("#container")[0].offsetWidth;
        document.getElementById("canvas1").style.height = (pageHeight-200) + "px";
        document.getElementById("canvas1").style.width = (pageWidth-500) + "px";
        var canvas = document.getElementById("canvas1");
        var context = canvas.getContext('2d');
        var mouse = Utils.captureMouse(canvas)

        var point = getPoints();
        for (var i = 0; i < point.length; i++) {
            if(i<=19 && i!=3 && i!=7 && i!=11 && i!=16){
                context.fillStyle = point[i].color;
                context.beginPath();
                context.strokeStyle = point[i].strokeStyle;
                context.linewidth = 20;
                drawRoundedRect(point[i].strokeStyle, point[i].color,  point[i].x-RectWidth/2,  point[i].y-RectHeight/2,
                    RectWidth,  RectHeight, 10);
                //context.fillRect(point[i].x-RectWidth/2, point[i].y-RectHeight/2, RectWidth, RectHeight);
                //context.strokeRect(point[i].x-RectWidth/2, point[i].y-RectHeight/2, RectWidth, RectHeight);
                context.fillStyle = point[i].fillStyle;

                context.font = "14px Arial";
                context.fillText(textContent[i], point[i].x+point[i].xText, point[i].y+point[i].yText);
            }
            else if(i==3 || i==7 || i==11 || i==16){
                context.fillStyle = point[i].color;
                context.beginPath();
                context.strokeStyle = point[i].strokeStyle;
                context.linewidth = 20;
                drawRoundedRect(point[i].strokeStyle, point[i].color,  point[i].x-RectWidth2/2,  point[i].y-RectHeight2/2,
                    RectWidth2,  RectHeight2, 10);
                //context.fillRect(point[i].x-RectWidth/2, point[i].y-RectHeight/2, RectWidth, RectHeight);
                //context.strokeRect(point[i].x-RectWidth/2, point[i].y-RectHeight/2, RectWidth, RectHeight);
                context.fillStyle = point[i].fillStyle;
                context.font = "bold 25px Arial";
                context.fillText(textContent[i], point[i].x+point[i].xText, point[i].y+point[i].yText);
            }
            else{
                context.fillStyle = point[i].color;
                context.beginPath();
                context.stroke();
                context.strokeStyle = point[i].strokeStyle;
                context.linewidth = 20;
                context.fillRect(point[i].x-aEllipse, point[i].y-30, aEllipse*2, 70);
                drawEllipse(point[i].x,  point[i].y-30, aEllipse, bEllipse, point[i].color, point[i].strokeStyle);

                drawEllipse1(point[i].x,  point[i].y+40, aEllipse, bEllipse, point[i].color, point[i].strokeStyle);

                //context.fillStyle = point[i].color;
                //context.beginPath();
                //context.strokeStyle = point[i].strokeStyle;
                //context.linewidth = 20;
                //drawRoundedRect(point[i].strokeStyle, point[i].color,  point[i].x-RectWidth1/2,  point[i].y-RectHeight1/2,
                //    RectWidth1,  RectHeight1, 10);

                context.fillStyle = "#ffffff"; //point[i].fillStyle;
                context.font = "bold 20px Arial";
                context.fillText(textContent[i], point[i].x+point[i].xText, point[i].y+point[i].yText);
            }
        }

        function drawEllipse(x, y, a, b, fillStyle, strokeStyle){
            context.beginPath();
            context.fillStyle = fillStyle;
            context.linewidth = 5;
            context.strokeStyle = "#000000"; //"#cccccc";//strokeStyle;
            var r = (a > b) ? a : b;
            var ratioX = a / r;
            var ratioY = b / r;
            context.scale(ratioX, ratioY);
            context.moveTo((x + a) / ratioX , y / ratioY);
            context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
            context.scale(r/a, r/b);
            context.closePath();
        }

        function drawEllipse1(x, y, a, b, fillStyle, strokeStyle){
            context.beginPath();
            context.fillStyle = fillStyle;
            context.linewidth = 5;
            context.strokeStyle = "#aaa"; //"#cccccc";//strokeStyle;
            var r = (a > b) ? a : b;
            var ratioX = a / r;
            var ratioY = b / r;
            context.scale(ratioX, ratioY);
            context.moveTo((x + a) / ratioX , y / ratioY);
            context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI);
            context.fill();
            //context.stroke();
            context.scale(r/a, r/b);
            context.closePath();
        }

        //var arrow = new Arrow();
        //arrow.start_x = point[0].x+RectWidth/2;
        //arrow.start_y = point[0].y;
        //arrow.end_x = point[3].x-RectWidth2/2;
        //arrow.end_y = point[3].y;
        ////arrow.radii = point[i + 1].radii;
        //var dy = arrow.start_y - arrow.end_y;
        //var dx = arrow.start_x - arrow.end_x;
        //arrow.rotation = Math.atan2(dy, dx);
        //if (dy == 0) arrow.length = Math.abs(dx);
        //else if (dx == 0) arrow.length = Math.abs(dy);
        //else arrow.length = Math.sqrt(dx * dx + dy * dy);
        //arrow.draw(context);
        //
        ////对接-》清洗
        //var arrow = new Arrow();
        //arrow.start_x = point[3].x+RectWidth2/2;
        //arrow.start_y = point[3].y;
        //arrow.end_x = point[7].x-RectWidth2/2;
        //arrow.end_y = point[7].y;
        ////arrow.radii = point[i + 1].radii;
        //var dy = arrow.start_y - arrow.end_y;
        //var dx = arrow.start_x - arrow.end_x;
        //arrow.rotation = Math.atan2(dy, dx);
        //if (dy == 0) arrow.length = Math.abs(dx);
        //else if (dx == 0) arrow.length = Math.abs(dy);
        //else arrow.length = Math.sqrt(dx * dx + dy * dy);
        //arrow.draw(context);
        //
        ////清洗-》分析
        //var arrow = new Arrow();
        //arrow.start_x = point[7].x+RectWidth2/2;
        //arrow.start_y = point[7].y;
        //arrow.end_x = point[11].x-RectWidth2/2;
        //arrow.end_y = point[11].y;
        ////arrow.radii = point[i + 1].radii;
        //var dy = arrow.start_y - arrow.end_y;
        //var dx = arrow.start_x - arrow.end_x;
        //arrow.rotation = Math.atan2(dy, dx);
        //if (dy == 0) arrow.length = Math.abs(dx);
        //else if (dx == 0) arrow.length = Math.abs(dy);
        //else arrow.length = Math.sqrt(dx * dx + dy * dy);
        //arrow.draw(context);

        //分析->融合
        //var arrow = new Arrow();
        //arrow.start_x = point[11].x+RectWidth2/2;
        //arrow.start_y = point[11].y;
        //arrow.end_x = point[16].x-RectWidth2/2;
        //arrow.end_y = point[16].y;
        ////arrow.radii = point[i + 1].radii;
        //var dy = arrow.start_y - arrow.end_y;
        //var dx = arrow.start_x - arrow.end_x;
        //arrow.rotation = Math.atan2(dy, dx);
        //if (dy == 0) arrow.length = Math.abs(dx);
        //else if (dx == 0) arrow.length = Math.abs(dy);
        //else arrow.length = Math.sqrt(dx * dx + dy * dy);
        //arrow.draw(context);

        //var arrow = new Arrow();
        //arrow.start_x = point[16].x+RectWidth2/2;
        //arrow.start_y = point[16].y;
        //arrow.end_x = point[20].x-RectWidth1/2;
        //arrow.end_y = point[20].y;
        ////arrow.radii = point[i + 1].radii;
        //var dy = arrow.start_y - arrow.end_y;
        //var dx = arrow.start_x - arrow.end_x;
        //arrow.rotation = Math.atan2(dy, dx);
        //if (dy == 0) arrow.length = Math.abs(dx);
        //else if (dx == 0) arrow.length = Math.abs(dy);
        //else arrow.length = Math.sqrt(dx * dx + dy * dy);
        //arrow.draw(context);
        //
        //var arrow = new Arrow();
        //arrow.start_x = point[16].x+width1+RectWidth/2;
        //arrow.start_y = point[21].y;
        //arrow.end_x = point[21].x-RectWidth1/2;
        //arrow.end_y = point[21].y;
        ////arrow.radii = point[i + 1].radii;
        //var dy = arrow.start_y - arrow.end_y;
        //var dx = arrow.start_x - arrow.end_x;
        //arrow.rotation = Math.atan2(dy, dx);
        //if (dy == 0) arrow.length = Math.abs(dx);
        //else if (dx == 0) arrow.length = Math.abs(dy);
        //else arrow.length = Math.sqrt(dx * dx + dy * dy);
        //arrow.draw(context);
        //
        //var arrow = new Arrow();
        //arrow.start_x = point[16].x+width1+RectWidth2/2;
        //arrow.start_y = point[22].y;
        //arrow.end_x = point[22].x-RectWidth1/2;
        //arrow.end_y = point[22].y;
        ////arrow.radii = point[i + 1].radii;
        //var dy = arrow.start_y - arrow.end_y;
        //var dx = arrow.start_x - arrow.end_x;
        //arrow.rotation = Math.atan2(dy, dx);
        //if (dy == 0) arrow.length = Math.abs(dx);
        //else if (dx == 0) arrow.length = Math.abs(dy);
        //else arrow.length = Math.sqrt(dx * dx + dy * dy);
        //arrow.draw(context);

        context.beginPath();
        context.lineWidth = 3;
        context.fillStyle = '#1e90ff';
        context.strokeStyle = '#1e90ff';
        //context.moveTo(point[1].x+RectWidth/2+width1, point[1].y);
        //context.lineTo(point[0].x+RectWidth/2+width1, point[0].y);
        //
        //context.moveTo(point[1].x+RectWidth/2, point[1].y);
        //context.lineTo(point[1].x+RectWidth/2+width1, point[1].y);
        //
        //context.moveTo(point[2].x+RectWidth/2+width1, point[2].y);
        //context.lineTo(point[0].x+RectWidth/2+width1, point[0].y);
        //
        //context.moveTo(point[2].x+RectWidth/2, point[2].y);
        //context.lineTo(point[2].x+RectWidth/2+width1, point[2].y);


        context.moveTo(point[4].x, point[4].y-RectHeight/2);
        context.lineTo(point[3].x, point[3].y+RectHeight2/2);

        context.moveTo(point[5].x, point[5].y-RectHeight/2);
        context.lineTo(point[4].x, point[4].y+RectHeight/2);

        context.moveTo(point[6].x, point[6].y-RectHeight/2);
        context.lineTo(point[5].x, point[5].y+RectHeight/2);


        context.moveTo(point[8].x, point[8].y-RectHeight/2);
        context.lineTo(point[7].x, point[7].y+RectHeight2/2);

        context.moveTo(point[9].x, point[9].y-RectHeight/2);
        context.lineTo(point[8].x, point[8].y+RectHeight/2);

        context.moveTo(point[10].x, point[10].y-RectHeight/2);
        context.lineTo(point[9].x, point[9].y+RectHeight/2);


        context.moveTo(point[12].x, point[12].y-RectHeight/2);
        context.lineTo(point[11].x, point[11].y+RectHeight2/2);

        context.moveTo(point[13].x, point[13].y-RectHeight/2);
        context.lineTo(point[12].x, point[12].y+RectHeight/2);

        context.moveTo(point[14].x, point[14].y-RectHeight/2);
        context.lineTo(point[13].x, point[13].y+RectHeight/2);

        context.moveTo(point[15].x, point[15].y-RectHeight/2);
        context.lineTo(point[14].x, point[14].y+RectHeight/2);


        context.moveTo(point[17].x, point[17].y-RectHeight/2);
        context.lineTo(point[16].x, point[16].y+RectHeight2/2);

        context.moveTo(point[18].x, point[18].y-RectHeight/2);
        context.lineTo(point[17].x, point[17].y+RectHeight/2);

        context.moveTo(point[19].x, point[19].y-RectHeight/2);
        context.lineTo(point[18].x, point[18].y+RectHeight/2);



        //context.moveTo(point[16].x+width1+RectWidth/2, point[22].y);
        //context.lineTo(point[16].x+width1+RectWidth/2, point[20].y);
        context.stroke();


        context.fillStyle="RGBA(100,255,100, 0.5)";
        //context.roundRect(50, 50, 150, 150, 5, true);
        context.strokeStyle="#009f43";
        var pattern = 5;
        context.dashedLineTo(0, topHeight+col2RowHeight*4+40, leftWidth+1200, topHeight+col2RowHeight*4+40, pattern);
        //context.dashedLineTo(point[1].x+RectWidth/2+width1+10, 0, point[1].x+RectWidth/2+width1+10, topHeight+col2RowHeight*4+60, pattern);
        //context.dashedLineTo(point[16].x+width1+RectWidth/2+10, 0, point[16].x+width1+RectWidth/2+10, topHeight+col2RowHeight*4+60, pattern);

        //var personText = $('#personText');
        //if(!personText.is(":animated")) {
        //    personText.animate({scrollTop: "-=50"}, 400);
        //}
        //
        //var myMainMessage="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
        //var speed=100;
        //var scrollingRegion=50;
        //var startPosition=0;
        //function mainTextScroller() {
        //    var mainMessage=myMainMessage;
        //    var tempLoc=(scrollingRegion*3/mainMessage.length)+1;
        //    if (tempLoc<1) {tempLoc=1}
        //    var counter;
        //    for(counter=0;counter<=tempLoc;counter++)
        //        mainMessage+=mainMessage;
        //    $('.textClass')[0].value = mainMessage.substring(startPosition,startPosition+scrollingRegion);
        //    startPosition++;
        //    if(startPosition>scrollingRegion) startPosition=0;
        //    setTimeout("mainTextScroller()",speed);
        //}
        //
        //mainTextScroller();

        var startNum0 = 1;
        var countNum = 4000;
        var maxCount = 4000;
        var textArray0 = new Array();
        var textArray1 = new Array();
        var textArray2 = new Array();
        var textArray3 = new Array();
        var textArray4 = new Array();

        function updateTextClass(){
            $('.textClass')[0].value = "";
            $('.textClass')[1].value = "";
            $('.textClass')[2].value = "";
            $('.textClass')[3].value = "";
            $('.textClass')[4].value = "";

            for(var i=0; i<5; ++i){
                if(i>0){
                    $('.textClass')[0].value += "\n"+textArray0[startNum0-1];
                    $('.textClass')[1].value += "\n"+textArray1[startNum0-1];
                    $('.textClass')[2].value += "\n"+textArray2[startNum0-1];
                    $('.textClass')[3].value += "\n"+textArray3[startNum0-1];
                    //$('.textClass')[4].value += "\n"+textArray4[startNum0-1];
                }else{
                    $('.textClass')[0].value += textArray0[startNum0-1];
                    $('.textClass')[1].value += textArray1[startNum0-1];
                    $('.textClass')[2].value += textArray2[startNum0-1];
                    $('.textClass')[3].value += textArray3[startNum0-1];
                    //console.log("startNum0", startNum0);
                    $('.textClass')[4].value += textArray4[parseInt((startNum0)/5)];
                }
                startNum0++;
                if(startNum0 >= maxCount){
                    //maxCount+=countNum;
                    startNum0 = 1;
                    initTextClass();
                }
            }
            if(startNum0 >= maxCount){
                //maxCount+=countNum;
                startNum0 = 1;
                initTextClass();
            }
            else{
                setTimeout(updateTextClass, 500);
            }
        }

        function initTextClass(){
            $.post('/datamanage/dataimport/GetSimpleData', {
                "type": 1,
                "startNum": startNum0,
                "countNum": countNum
            }).done(function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    textArray0 = data.data.data;
                    //console.log("textArray0", textArray0);
                    $.post('/datamanage/dataimport/GetSimpleData', {
                        "type": 2,
                        "startNum": startNum0,
                        "countNum": countNum
                    }).done(function (res) {
                        var data = JSON.parse(res);
                        if (data.code == 0) {
                            textArray1 = data.data.data;
                            $.post('/datamanage/dataimport/GetSimpleData', {
                                "type": 3,
                                "startNum": startNum0,
                                "countNum": countNum
                            }).done(function (res) {
                                var data = JSON.parse(res);
                                if (data.code == 0) {
                                    textArray2 = data.data.data;
                                    $.post('/datamanage/dataimport/GetSimpleData', {
                                        "type": 4,
                                        "startNum": startNum0,
                                        "countNum": countNum
                                    }).done(function (res) {
                                        var data = JSON.parse(res);
                                        if (data.code == 0) {
                                            textArray3 = data.data.data;
                                            $.post('/datamanage/dataimport/GetSimpleData', {
                                                "type": 5,
                                                "startNum": startNum0,
                                                "countNum": countNum
                                            }).done(function (res) {
                                                var data = JSON.parse(res);
                                                if (data.code == 0) {
                                                    textArray4 = data.data.data;
                                                    startNum0 = 1;
                                                    updateTextClass();
                                                }
                                                else {
                                                    alert(data.message);
                                                }
                                            });
                                        }
                                        else {
                                            alert(data.message);
                                        }
                                    });
                                }
                                else {
                                    alert(data.message);
                                }
                            });
                        }
                        else {
                            alert(data.message);
                        }
                    });
                }
                else {
                    alert(data.message);
                }
            });
        }


        initTextClass();
        //initTextClass1();
        //initTextClass2();
        //initTextClass3();

        //arrow.start_x = point[11].x+RectWidth2/2;
        //arrow.start_y = point[11].y;
        //arrow.end_x = point[16].x-RectWidth2/2;
        //arrow.end_y = point[16].y;
        var color = 'orange';
        var loaders = [
            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .5,
                pointDistance: .01,
                fps: 50,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[0].x+RectWidth2/2+3, point[0].y, point[3].x-RectWidth2/2-14, point[3].y]
                ]
            },
            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .5,
                pointDistance: .01,
                fps: 50,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[3].x+RectWidth2/2+3, point[3].y, point[7].x-RectWidth2/2-14, point[7].y]
                ]
            },
            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .5,
                pointDistance: .01,
                fps: 50,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[7].x+RectWidth2/2+3, point[7].y, point[11].x-RectWidth2/2-14, point[11].y]
                ]
            },
            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .5,
                pointDistance: .01,
                fps: 50,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[11].x+RectWidth2/2+3, point[11].y, point[16].x-RectWidth2/2-14, point[16].y]
                ]
            },
            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .5,
                pointDistance: .01,
                fps: 50,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[16].x+RectWidth/2+4, point[20].y, point[20].x-RectWidth1/2-14, point[20].y]
                ]
            },
            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .5,
                pointDistance: .01,
                fps: 50,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[16].x+width1+RectWidth/2+4, point[21].y, point[20].x-RectWidth1/2-14, point[21].y]
                ]
            },
            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .5,
                pointDistance: .01,
                fps: 50,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[16].x+width1+RectWidth/2+4, point[22].y, point[20].x-RectWidth1/2-14, point[22].y]
                ]
            },

            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .10,
                pointDistance: .01,
                fps: 30,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[16].x+width1+RectWidth/2, point[20].y, point[16].x+width1+RectWidth/2, point[22].y]
                ]
            },

            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .10,
                pointDistance: .01,
                fps: 30,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[2].x+RectWidth/2+width1, point[2].y, point[0].x+RectWidth/2+width1, point[0].y]
                ]
            },

            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .5,
                pointDistance: .01,
                fps: 30,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[1].x+RectWidth/2+4, point[1].y, point[1].x+RectWidth/2+width1-8, point[1].y]
                ]
            },

            {
                width: 600,
                height: 500,

                stepsPerFrame: 7,
                trailLength: .5,
                pointDistance: .01,
                fps: 30,
                fillColor: 'orange',//'1e90ff',

                setup: function() {
                    this._.lineWidth = 1;
                },

                path: [
                    ['line', point[2].x+RectWidth/2+4, point[2].y, point[2].x+RectWidth/2+width1-6, point[2].y]
                ]
            },
        ];
        //context.moveTo(point[1].x+RectWidth/2+width1, point[1].y);
        //context.lineTo(point[0].x+RectWidth/2+width1, point[0].y);
        //
        //context.moveTo(point[1].x+RectWidth/2, point[1].y);
        //context.lineTo(point[1].x+RectWidth/2+width1, point[1].y);
        //
        //context.moveTo(point[2].x+RectWidth/2+width1, point[2].y);
        //context.lineTo(point[0].x+RectWidth/2+width1, point[0].y);
        //
        //context.moveTo(point[2].x+RectWidth/2, point[2].y);
        //context.lineTo(point[2].x+RectWidth/2+width1, point[2].y);


        var arrow = new Arrow();
        arrow.start_x = point[3].x-RectWidth/2-10;
        arrow.start_y = point[0].y;
        arrow.end_x = point[3].x-RectWidth2/2;
        arrow.end_y = point[3].y;
        //arrow.radii = point[i + 1].radii;
        var dy = arrow.start_y - arrow.end_y;
        var dx = arrow.start_x - arrow.end_x;
        arrow.rotation = Math.atan2(dy, dx);
        if (dy == 0) arrow.length = Math.abs(dx);
        else if (dx == 0) arrow.length = Math.abs(dy);
        else arrow.length = Math.sqrt(dx * dx + dy * dy);
        arrow.draw(context);

        //对接-》清洗
        var arrow = new Arrow();
        arrow.start_x = point[7].x-RectWidth2/2-10;
        arrow.start_y = point[3].y;
        arrow.end_x = point[7].x-RectWidth2/2;
        arrow.end_y = point[7].y;
        //arrow.radii = point[i + 1].radii;
        var dy = arrow.start_y - arrow.end_y;
        var dx = arrow.start_x - arrow.end_x;
        arrow.rotation = Math.atan2(dy, dx);
        if (dy == 0) arrow.length = Math.abs(dx);
        else if (dx == 0) arrow.length = Math.abs(dy);
        else arrow.length = Math.sqrt(dx * dx + dy * dy);
        arrow.draw(context);

        //清洗-》分析
        var arrow = new Arrow();
        arrow.start_x = point[11].x-RectWidth2/2-10;
        arrow.start_y = point[7].y;
        arrow.end_x = point[11].x-RectWidth2/2;
        arrow.end_y = point[11].y;
        //arrow.radii = point[i + 1].radii;
        var dy = arrow.start_y - arrow.end_y;
        var dx = arrow.start_x - arrow.end_x;
        arrow.rotation = Math.atan2(dy, dx);
        if (dy == 0) arrow.length = Math.abs(dx);
        else if (dx == 0) arrow.length = Math.abs(dy);
        else arrow.length = Math.sqrt(dx * dx + dy * dy);
        arrow.draw(context);

        //分析->融合
        var arrow = new Arrow();
        arrow.start_x = point[16].x-RectWidth2/2-10;//point[11].x+RectWidth2/2;
        arrow.start_y = point[11].y;
        arrow.end_x = point[16].x-RectWidth2/2;
        arrow.end_y = point[16].y;
        //arrow.radii = point[i + 1].radii;
        var dy = arrow.start_y - arrow.end_y;
        var dx = arrow.start_x - arrow.end_x;
        arrow.rotation = Math.atan2(dy, dx);
        if (dy == 0) arrow.length = Math.abs(dx);
        else if (dx == 0) arrow.length = Math.abs(dy);
        else arrow.length = Math.sqrt(dx * dx + dy * dy);
        arrow.draw(context);


        var arrow = new Arrow();
        arrow.start_x = point[20].x-RectWidth1/2-10; //point[16].x+RectWidth2/2;
        arrow.start_y = point[16].y;
        arrow.end_x = point[20].x-RectWidth1/2;
        arrow.end_y = point[20].y;
        //arrow.radii = point[i + 1].radii;
        var dy = arrow.start_y - arrow.end_y;
        var dx = arrow.start_x - arrow.end_x;
        arrow.rotation = Math.atan2(dy, dx);
        if (dy == 0) arrow.length = Math.abs(dx);
        else if (dx == 0) arrow.length = Math.abs(dy);
        else arrow.length = Math.sqrt(dx * dx + dy * dy);
        arrow.draw(context);

        var arrow = new Arrow();
        arrow.start_x = point[21].x-RectWidth1/2-10;//point[16].x+width1+RectWidth/2;
        arrow.start_y = point[21].y;
        arrow.end_x = point[21].x-RectWidth1/2;
        arrow.end_y = point[21].y;
        //arrow.radii = point[i + 1].radii;
        var dy = arrow.start_y - arrow.end_y;
        var dx = arrow.start_x - arrow.end_x;
        arrow.rotation = Math.atan2(dy, dx);
        if (dy == 0) arrow.length = Math.abs(dx);
        else if (dx == 0) arrow.length = Math.abs(dy);
        else arrow.length = Math.sqrt(dx * dx + dy * dy);
        arrow.draw(context);

        var arrow = new Arrow();

        arrow.start_x = point[22].x-RectWidth1/2-10;//point[16].x+width1+RectWidth2/2;
        arrow.start_y = point[22].y;
        arrow.end_x = point[22].x-RectWidth1/2;
        arrow.end_y = point[22].y;
        //arrow.radii = point[i + 1].radii;
        var dy = arrow.start_y - arrow.end_y;
        var dx = arrow.start_x - arrow.end_x;
        arrow.rotation = Math.atan2(dy, dx);
        if (dy == 0) arrow.length = Math.abs(dx);
        else if (dx == 0) arrow.length = Math.abs(dy);
        else arrow.length = Math.sqrt(dx * dx + dy * dy);
        arrow.draw(context);

        for(i=0; i<loaders.length; ++i){
            var a = new Sonic(loaders[i]);
            a.play();
        }
    }
);