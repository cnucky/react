/**
 * Created by root on 9/23/16.
 */
/**
 * Created by user25 on 2099/1/1.
 */
define(
    [
        '../../tpl/dataProcess/time-line',
        '../../tpl/dataProcess/time-day',
        '../../tpl/dataProcess/D3draw',
        '../../utility/D3/d3.min',
        'datetimepicker',
        '../../utility/D3/topojson'

    ], function (timeline, timeday, d3draw) {

        var svg = _.template(d3draw);
        $('#draw', parent.document).append(svg());

        //收件方绘制
        var dataset = [];
        var color = d3.scale.category20();
        for (var i = 0; i < 20; i++) {
            var number = Math.random();
            dataset.push(parseInt((number * 100) + 50));
        }

        var drawdown = d3.select('.drawdown').append('svg').attr('width', 500).attr('height', 22 * dataset.length);
        var drawup = d3.select('.drawup').append('svg').attr('width', 500).attr('height', 22 * dataset.length);
        var bardown = drawdown.selectAll('.rect').data(dataset).enter().append('g').attr('transform', function (d, i) {
            return 'translate(' + 40 + ', ' + (22 * i) + ')';
        });
        var barup = drawup.selectAll('.rect').data(dataset).enter().append('g').attr('transform', function (d, i) {
            return 'translate(' + 40 + ', ' + (22 * i) + ')';
        });
        var yScale = d3.scale.ordinal()
            .domain(d3.range(dataset.length))
            .rangeRoundBands([0, 22 * dataset.length]);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");
        drawdown.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(40, 0)")
            .call(yAxis);
        drawup.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(40, 0)")
            .call(yAxis);

        var drawdownaxis = d3.select('.drawdownaxis').append('svg').attr('width', 500).attr('height', 40);
        var drawupaxis = d3.select('.drawupaxis').append('svg').attr('width', 500).attr('height', 40);
        var xScale = d3.scale.linear()
            .domain([0, d3.max(dataset)])
            .range([0, 400]);
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");
        drawupaxis.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(20, 0)")
            .call(xAxis);
        drawdownaxis.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(20, 0)")
            .call(xAxis);
        bardown.append("rect")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("class", "bar")
            .attr("width", function (d, i) {
                return xScale(d);
            })
            .attr("height", 20);
        bardown.append("text")
            .attr("x", function (d, i) {
                return xScale(d) + 10;
            })
            .attr("y", 10)
            .attr('class', 'text')
            .attr("fill", "#444")
            .attr("dy", ".35em")
            .text(function (d) {
                return d;
            });
        barup.append("rect")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("class", "bar")
            .attr("width", function (d, i) {
                return xScale(d);
            })
            .attr("height", 20);
        barup.append("text")
            .attr("x", function (d, i) {
                return xScale(d) + 10;
            })
            .attr("y", 10)
            .attr('class', 'text')
            .attr("fill", "#444")
            .attr("dy", ".35em")
            .text(function (d) {
                return d;
            });

        //地图树

        var treemapdataset = {
            "name": "flare",
            "children": [
                {
                    "name": "analytics",
                    "children": [
                        {
                            "name": "cluster",
                            "children": [
                                {"name": "英国", "size": 3938},
                                {"name": "刚果", "size": 3812},
                                {"name": "阿根廷", "size": 6714},
                                {"name": "希腊", "size": 743}
                            ]
                        },
                        {
                            "name": "graph",
                            "children": [
                                {"name": "美国", "size": 3534},
                                {"name": "日本", "size": 5731},
                                {"name": "法国", "size": 7840},
                                {"name": "台湾", "size": 5914},
                                {"name": "香港", "size": 3416}
                            ]
                        },
                        {
                            "name": "optimization",
                            "children": [
                                {"name": "中国", "size": 7074}
                            ]
                        }
                    ]
                },
                {
                    "name": "animate",
                    "children": [
                        {"name": "朝鲜", "size": 17010},
                        {"name": "印度", "size": 5842},
                        {
                            "name": "interpolate",
                            "children": [
                                {"name": "泰国", "size": 1983},
                                {"name": "越南", "size": 2047},
                                {"name": "不丹", "size": 1375},
                                {"name": "波兰", "size": 8746},
                                {"name": "瑞士", "size": 2202},
                                {"name": "马耳他", "size": 1382},
                                {"name": "黑山", "size": 1629},
                                {"name": "安哥拉", "size": 1675},
                                {"name": "摩洛哥", "size": 2042}
                            ]
                        },
                        {"name": "多哥", "size": 1041},
                        {"name": "肯尼亚", "size": 5176},
                        {"name": "南非", "size": 449},
                        {"name": "加拿大", "size": 5593},
                        {"name": "巴拿马", "size": 5534},
                        {"name": "玻利维亚", "size": 9201},
                        {"name": "古巴", "size": 19975},
                        {"name": "智利", "size": 1116},
                        {"name": "汤加", "size": 6006}
                    ]
                }
            ]
        }
        var margin = {top: 40, right: 10, bottom: 10, left: 10},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var color = d3.scale.category20c();

        var treemap = d3.layout.treemap()
            .size([width, height])
            .sticky(true)
            .value(function (d) {
                return d.size;
            });

        var div = d3.select(".flaer").append("div")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", (height + margin.top + margin.bottom) + "px")
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

        var node = div.datum(treemapdataset).selectAll(".node")
            .data(treemap.nodes)
            .enter().append("div")
            .attr("class", "node")
            .call(position)
            .style("background", function (d) {
                return d.children ? color(d.name) : null;
            })
            .text(function (d) {
                return d.children ? null : d.name + ': ' + d.size;
            });

        d3.selectAll("input").on("change", function change() {
            var value = this.value === "count"
                ? function () {
                return 1;
            }
                : function (d) {
                return d.size;
            };

            node
                .data(treemap.value(value).nodes)
                .transition()
                .duration(1500)
                .call(position);
        });

        function position() {
            this.style("left", function (d) {
                return d.x + "px";
            })
                .style("top", function (d) {
                    return d.y + "px";
                })
                .style("width", function (d) {
                    return Math.max(0, d.dx - 1) + "px";
                })
                .style("height", function (d) {
                    return Math.max(0, d.dy - 1) + "px";
                });
        }


        $('.tiemlist input').datetimepicker({
            format: 'YYYY-MM-DD HH:mm:ss',
            defaultDate: "2014-1-1 00:00"
        });


        function show_draw(data){
            console.log(data);
            $(".navBtn-dataPivot.hbtn", parent.document).css("display", "inline-block" );
            $('.navbar-btnlist span', parent.document).removeClass('active').eq(2).addClass('active');
            $('#body-wrapper .pages', parent.document).hide().eq(2).show();
            $('.triangle', parent.document).hide().eq(2).show();
        }

        return {
            show_draw: show_draw
        }


    });
