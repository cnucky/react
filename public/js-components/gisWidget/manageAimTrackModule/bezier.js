function bezier(pts) {
    function curve(points) {
        var c = [];
        var steps = 100;

        for (var i = 0; i <= steps; i++) {
            var t = i / steps;

            var pt = [
                Math.pow(1 - t, 3) * points[0][0]
                 + 3 * t * Math.pow(1 - t, 2) * points[1][0]
                 + 3 * (1 - t) * Math.pow(t, 2) * points[2][0]
                 + Math.pow(t, 3) * points[3][0],
                Math.pow(1 - t, 3) * points[0][1]
                 + 3 * t * Math.pow(1-t,2) * points[1][1]
                 + 3 * (1-t) * Math.pow(t,2) * points[2][1]
                 + Math.pow(t, 3) * points[3][1]
            ];
            c.push(pt);
        }
        return c;
    }

    function createPoints(fromPoint,toPoint){
        var twist = Math.random() * 4 + 8.0;
        var p2=[],p1=[];
        var dx = toPoint[0] - fromPoint[0];
        var dy = toPoint[1] - fromPoint[1];
        if (Math.abs(dy - 0) < 0.0000001 && Math.abs(dx - 0) < 0.0000001) {
            return [fromPoint,toPoint];
        }
        var distance = CalculateDistance(fromPoint, toPoint);
        var angle = Math.atan2(dx,dy);
        p1[0] = fromPoint[0]+(dx/5) +(distance/5)* Math.cos(angle);
        p1[1] = fromPoint[1]+(dy/5) +(distance/5) * Math.sin(angle);
        p2[0] = toPoint[0]-(dx/5) +(distance/5)* Math.cos(angle);
        p2[1] = toPoint[1]-(dy/5) +(distance/5) * Math.sin(angle);
        var pts=[];
        pts.push(fromPoint);
        pts.push(p1);
        pts.push(p2);
        pts.push(toPoint);
        return pts;
    }
    function CalculateDistance(p1, p2) {
        var dis = 0;
        dis = Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
        return dis;
    }

    var c = [];

    if(pts.length==2){
        pts=createPoints(pts[0],pts[1]);
    }

    if (pts.length < 4) return pts;

    for (var i = 0; i < pts.length; i += 3) {
        if (i + 4 <= pts.length) {
            c = c.concat(curve(pts.slice(i, i + 4)));
        }
    }

    return c;
}
