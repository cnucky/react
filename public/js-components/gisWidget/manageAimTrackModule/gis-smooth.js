/**
 * Created by wangqiang on 2015/12/28.
 */
//#####################################################################################################################
//wq 2015.12.21 曲线拟合添加的控制点计算
//#####################################################################################################################
(function (window, document, undefined){
    //模拟点的结构
    Point2D = function (x,y,m){
        this.x = x || 0.0;
        this.y = y || 0.0;
        this.m = m || 0.0;
    };
    function MySmooth(){
        this.p1 = new Point2D();
        this.p2 = new Point2D();
        this.insertPointsCount = 0;
        this.twist = 0;
        this.inputPoints = new Array();
    };
    MySmooth.prototype={
        //曲线拟合功能接口
        smooth:function(inputPoints){
            //  9.7831419491130589
            this.twist = Math.random() * 4 + 8.0;
            //  twist =  9.7831419491130589;
            var smoothPoints = new Array();
            if (inputPoints.length == 0) {
                return smoothPoints;
            }
            if (inputPoints.length == 1) {
                inputPoints[0].m = 1;
                smoothPoints.push(inputPoints[0]);
                return smoothPoints;
            }
            if (inputPoints.length == 2) {
                inputPoints[0].m = 1;
                inputPoints[1].m = 1;
                smoothPoints = this.LinearInterpolation(inputPoints[0], inputPoints[1]);//两点直线插入一个点
                return smoothPoints;
            }
            //控制点

            var count = inputPoints.length;
            inputPoints[0].m = 1;
            smoothPoints.push(inputPoints[0]);
            //第一段
            if (this.HasEqual(inputPoints[0], inputPoints[1], inputPoints[2])) {
                var tr = this.twist;
                //circlelast(inputPoints[0],inputPoints[1],smoothPoints);
                this.circle(inputPoints[0], inputPoints[1], smoothPoints);
            }
            else {
                this.GenerateControlPoints(inputPoints[0], inputPoints[1], null, inputPoints[2], this.twist);
                this.smooth1(inputPoints[0], inputPoints[1], this.p1, this.p2, smoothPoints, this.insertPointsCount)
            }
            var controlPoint1 = new Array();
            var controlPoint2 = new Array();
            controlPoint1.push(this.p1);
            controlPoint2.push(this.p2);


            //第二段至倒数第二段
            for (var i = 2; i < count - 1; i++) {
                var flag = false;
                var tempPoint1 = inputPoints[i - 1];
                var tempPoint2 = inputPoints[i];
                for (var j = 0; j < controlPoint1.length; j++) {
                    if ((controlPoint1[j].x == tempPoint1.x) && (controlPoint1[j].y == tempPoint1.y) && (controlPoint2[j].x == tempPoint2.x) && (controlPoint2[j].y == tempPoint2.y)) {
                        this.smooth1(inputPoints[i - 1], inputPoints[i], controlPoint1[j], controlPoint2[j], smoothPoints);
                        flag = true;
                        break;
                    }
                    else continue;

                }
                if (flag) continue;

                if (this.HasEqual(inputPoints[i - 1], inputPoints[i], inputPoints[i - 2])) {
                    this.circle(inputPoints[i - 1], inputPoints[i], smoothPoints);
                }
                else if (this.HasEqual(inputPoints[i - 1], inputPoints[i], inputPoints[i + 1])) {
                    this.circle(inputPoints[i - 1], inputPoints[i], smoothPoints);
                }
                else if (this.IsOnLine(inputPoints[i - 2], inputPoints[i - 1], inputPoints[i])) {
                    this.circle(inputPoints[i - 1], inputPoints[i], smoothPoints);
                }
                else {
                    this.GenerateControlPoints(inputPoints[i - 1], inputPoints[i], inputPoints[i - 2], inputPoints[i + 1], this.twist);
                    this.smooth1(inputPoints[i - 1], inputPoints[i], this.p1, this.p2, smoothPoints, this.insertPointsCount);
                }
                //添加控制点
                controlPoint1.push(this.p1);
                controlPoint2.push(this.p2);

            }

            //最后一段
            var tempPoint11 = inputPoints[count - 2];
            var tempPoint22 = inputPoints[count - 1];
            for (var j = 0; j < controlPoint1.length; j++) {
                if ((controlPoint1[j].x == tempPoint11.x) && (controlPoint1[j].y == tempPoint11.y) && (controlPoint2[j].x == tempPoint22.x) && (controlPoint2[j].y == tempPoint22.y)) {
                    this.smooth1(inputPoints[count - 2], inputPoints[count - 1], controlPoint1[j], controlPoint2[j], smoothPoints);
                    return smoothPoints;
                }
                else continue;

            }

            if (this.HasEqual(inputPoints[count - 1], inputPoints[count - 3], inputPoints[count - 2])) {
                this.circle(inputPoints[count - 2], inputPoints[count - 1], smoothPoints);
                //circlelast(inputPoints[count - 2], inputPoints[count - 1], smoothPoints);
            }
            else if (this.IsOnLine(inputPoints[count - 3], inputPoints[count - 2], inputPoints[count - 1])) {
                this.circle(inputPoints[count - 2], inputPoints[count - 1], smoothPoints);
            }
            else {
                this.GenerateControlPoints(inputPoints[count - 2], inputPoints[count - 1], inputPoints[count - 3], null, this.twist);
                this.smooth1(inputPoints[count - 2], inputPoints[count - 1], this.p1, this.p2, smoothPoints, this.insertPointsCount);
            }
            return smoothPoints;
        },
        //两点直线插入一个点
        LinearInterpolation:function(pp1, pp2) {
            var ps = new Array();
            ps.push(pp1);
            var insertPointsCount = 1;
            for (var i = 1; i <= insertPointsCount; i++) {
                var t = i / (insertPointsCount + 1);
                var pp = new Point2D((1 - t) * pp1.x + t * pp2.x, (1 - t) * pp1.y + t * pp2.y);
                ps.push(pp);
            }
            ps.push(pp2);
            return ps;
        },
        IsOnLine:function(p1, p2, targetPoint) {
            if (Math.abs(p1.x - p2.x) < 0.00000001 && Math.abs(p2.x - targetPoint.x) < 0.0000001) {
                return (p1.x - p2.x) * (p2.x - targetPoint.x) <= 0;
            }
            var k1 = (p1.y - p2.y) / (p1.x - p2.x);
            var k2 = (targetPoint.y - p2.y) / (targetPoint.x - p2.x);
            if (Math.abs(k2 - 0) < 0.01) {
                if (Math.abs(k1 - 0) < 0.01) {
                    return k1 * k2 >= 0;
                }
                return false;
            }
            var rate = k1 / k2;
            return rate < 1.1 && rate > 0.9;
        },
        //来回曲线
        circlelast:function(fromPoint, toPoint, smoothPoints) {
            //smoothPoints.push(fromPoint);
            var distance = this.CalculateDistance(fromPoint, toPoint);
            var s = Math.sqrt(4);
            var R = distance * Math.sqrt(2) / 2;
            for (var i = 1; i <= 45; i++) {
                var dis1 = 2 * R * Math.sin(Math.PI / 2 - i * Math.PI / 180);
                var tmp = new Point2D();
                tmp.m = 0;
                tmp.x = fromPoint.x + dis1 * Math.cos(Math.PI / 2 - i * Math.PI / 180);
                tmp.y = fromPoint.y + dis1 * Math.sin(Math.PI / 2 - i * Math.PI / 180);
                smoothPoints.push(tmp);

            }
            // smoothPoints.push(toPoint);
        },
        circle:function(fromPoint, toPoint, smoothPoints) {
            var thirdPoint = new Point2D();
            var dx = toPoint.x - fromPoint.x;
            var dy = toPoint.y - fromPoint.y;
            if (Math.abs(dy - 0) < 0.0000001 && Math.abs(dx - 0) < 0.0000001) {
                return;
            }
            var angle = Math.atan2(dy, dx) - Math.PI * 0.25;
            var distance = this.CalculateDistance(fromPoint, toPoint);
            thirdPoint.x = toPoint.x + distance * Math.cos(angle);
            thirdPoint.y = toPoint.y + distance * Math.sin(angle);
            //控制点
            this.insertPointsCount = 50;
            var tre = this.twist;
            this.p2.x = toPoint.x - (thirdPoint.x - fromPoint.x) / (this.twist);
            this.p2.y = toPoint.y - (thirdPoint.y - fromPoint.y) / (this.twist);
            this.p1.x = (this.p2.x + fromPoint.x) / 2;
            this.p1.y = (this.p2.y + fromPoint.y) / 2;
            this.smooth1(fromPoint, toPoint, this.p1, this.p2, smoothPoints, this.insertPointsCount);
        },
        //曲线
        smooth1:function(fromPoint, toPoint, p1, p2, smoothPoints, insertPointsCount){
            fromPoint.m = 1;
            toPoint.m = 1;
            if (fromPoint.x == toPoint.x && fromPoint.y == toPoint.y && fromPoint.m == toPoint.m) {
                return;
            }
            //不需添加，外层已加
            for (var i = 1; i <= insertPointsCount; i++) {
                var point = new Point2D();
                var t = (i / (insertPointsCount + 1));
                point.x = fromPoint.x * Math.pow(1 - t, 3) + 3 * p1.x * Math.pow(1 - t, 2) * t + 3 * p2.x * (1 - t) * Math.pow(t, 2) + toPoint.x * Math.pow(t, 3);


                point.y = fromPoint.y * Math.pow(1 - t, 3) + 3 * p1.y * Math.pow(1 - t, 2) * t + 3 * p2.y * (1 - t) * Math.pow(t, 2) + toPoint.y * Math.pow(t, 3);
                smoothPoints.push(point);
            }
            smoothPoints.push(toPoint);
        },
        GenerateControlPoints:function(fromPoint, toPoint, previousPoint, nextPoint, twist) {
            var distance = this.CalculateDistance(fromPoint, toPoint);
            if (previousPoint == null && nextPoint == null) {
                return;
            }

            this.insertPointsCount = 1;
            if (previousPoint != null) {
                var dis1 = this.CalculateDistance(fromPoint, previousPoint);
                var pp1 = previousPoint;
                if (dis1 > 4 * distance) {
                    pp1 = this.GetPartPoint(fromPoint, previousPoint, 4 * distance);
                }
                this.p1.x = fromPoint.x + (toPoint.x - pp1.x) / twist;
                this.p1.y = fromPoint.y + (toPoint.y - pp1.y) / twist;
                this.insertPointsCount += parseInt(2 * (this.CalculateDistance(pp1, fromPoint)) / this.CalculateDistance(fromPoint, toPoint));
                this.insertPointsCount = this.insertPointsCount * 5;//wq
            }
            if (nextPoint != null) {
                var dis2 = this.CalculateDistance(toPoint, nextPoint);
                var pp2 = nextPoint;
                if (dis2 > 4 * distance) {
                    pp2 = this.GetPartPoint(toPoint, nextPoint, 4 * distance);
                }
                this.p2.x = toPoint.x - (pp2.x - fromPoint.x) / twist;
                this.p2.y = toPoint.y - (pp2.y - fromPoint.y) / twist;
                this.insertPointsCount += parseInt((2 * (this.CalculateDistance(pp2, toPoint)) /
                    this.CalculateDistance(fromPoint, toPoint)));
                this.insertPointsCount = this.insertPointsCount * 5;//wq
            }
            if (previousPoint == null) {

                this.p1.x = (this.p2.x + fromPoint.x) / 2;
                this.p1.y = (this.p2.y + fromPoint.y) / 2;

            }

            if (nextPoint == null) {
                this.p2.x = (this.p1.x + toPoint.x) / 2;
                this.p2.y = (this.p1.y + toPoint.y) / 2;
            }
        },
        CalculateDistance: function (p1, p2) {
            var dis = 0;
            dis = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
            return dis;
        },
        GetPartPoint: function (startPoint, endPoint, distance) {
            var totalDistance = this.CalculateDistance(startPoint, endPoint);
            var proportion = distance * 1.0 / totalDistance;
            return new Point2D(startPoint.x + (endPoint.x - startPoint.x) * proportion, startPoint.y + (endPoint.y - startPoint.y) * proportion)
        },
        IsEqual:function(g1, g2) {
            if (g1 == null || g2 == null) {
                return false;
            }
            if (g1.x == g2.x && g1.y == g2.y && g1.m == g2.m) {
                return true;
            }
            else {
                return false;
            }
        },
        HasEqual:function(g1, g2, g3){
            return this.IsEqual(g1, g2) || this.IsEqual(g2, g3) || this.IsEqual(g1, g3);
        }
    };
    mySmooth=function(){
        return new MySmooth();
    };
}(window, document));
