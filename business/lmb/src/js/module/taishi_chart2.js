/**
 * Created by songqiankun on 2016/11/24.
 */
define([
    "../lib/echarts/echarts.min",
    "../lib/d3/d3.min"
], function (echarts, d3) {
    var draw = {
        relationControl: $(".relation-control-margin"),
        relationType: "全部",
        barType: "全部",
        radarChart: echarts.init(document.getElementById('radar-div')),
        barChart: echarts.init(document.getElementById('bar-div')),
        barCallback: new Object(),
        opendlgdiv: new Object(),
        openOneDlgDiv: new Object(),
        myForceData: new Object(),
        relationCilck: function () {
            draw.relationType = $(".relation-select:checked + a").text();
            console.log(draw.relationType);
            draw.drawForce(draw.myForceData);
        },
        barClick: function () {
            draw.barType = $(".bar-select:checked + a").text();
            //console.log(draw.barType);
            draw.barCallback(draw.barType);
        },
        drawRadar: function (radarData, state) { // 绘制雷达图
            if (state == "" || state == undefined) {
                $("#radar-select").css("visibility", "hidden");
            } else {
                $("#radar-select").text(state);
                $("#radar-select").css("visibility", "visible");
            }
            var legendData = radarData.data.map(function (item) {
                return item.name;
            });
            var option = {
                color: ["#e67f00"],
                title: {
                    show: false
                },
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: "rgba(0,0,40,0.9)",
                    textStyle: {
                        color: "rgb(71, 148, 247)",
                        fontSize: 10
                    }
                },
                legend: {
                    orient: 'vertical',
                    x: 'right',
                    y: '30%',
                    textStyle: {
                        color: "auto",
                        fontSize: 14
                    },
                    data: legendData
                },
                toolbox: {
                    show: false
                },
                polar: [{
                    indicator: radarData.indicator,
                    center: ['50%', '60%'],
                    radius: '70%',
                    name: {
                        textStyle: {
                            color: "rgba(74, 154, 255, 0.8)",
                            fontSize: 14
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: "rgba(38, 46, 146, 1.0)",
                            width: 1
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: "rgba(38, 46, 146, 1.0)",
                            width: 1
                        }
                    },
                    splitArea: {
                        areaStyle: {
                            color: 'rgba(38, 46, 146, 0.0)'
                        }
                    }
                }],
                calculable: false,
                series: [{
                    name: '威胁程度指标图',
                    type: 'radar',
                    data: radarData.data
                }]
            };
            draw.radarChart.setOption(option);
        },
        drawBarCon: function (legendData) {
            var $barControl = $('#bar-control-div');
            $barControl.empty();
            $barControl.append('<input type="radio" class="bar-select" name="bar-type" checked="checked" /><a href="#">全部</a>');
            if (legendData.length !== undefined)
                legendData.forEach(function (item) {
                    var dom = '<input type="radio" class="bar-select" name="bar-type" />' +
                        '<a href="#">' + item + '</a>';
                    $barControl.append(dom);
                });
        },
        drawBar: function (barData) { // 绘制柱状图
            var barItemStyle = {
                normal: {
                    color: function (params) {
                        if (params.seriesIndex == 0) {
                            return "#008aea";
                        }
                        if (params.seriesIndex == 1) {
                            return "#339192";
                        }
                        if (params.seriesIndex == 2) {
                            return "#e67f00";
                        }
                    }
                },
                emphasis: {
                    color: function (params) {
                        if (params.seriesIndex == 0) {
                            return "#008aea";
                        }
                        if (params.seriesIndex == 1) {
                            return "#339192";
                        }
                        if (params.seriesIndex == 2) {
                            return "#e67f00";
                        }
                    }
                }
            };
            barData.series.forEach(function (item, index) {
                item.name = barData.legend.data[index];
                item.barGap = '50%';
                item.barCategoryGap = '35%';
                item.type = 'bar';
                //item.itemStyle = barItemStyle;
            });
            draw.barChart.clear();
            //var zrColor = zrender.tool.color;
            ////var color1 = new echarts.graph.Linea
            //color: [(function() {
            //    return zrColor.getLinearGradient(0,0,2000,0,[[0,'#000000'],[1,'#FFFFFF']]);
            //})(),"#339192","#e67f00"],
            var option = {
                color: ["#008aea", "#339192", "#e67f00", "#90dac0", "#5d5bff", "#ff747a"],
                title: {
                    show: false
                },
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: "rgba(0,0,40,0.9)",
                    textStyle: {
                        color: "rgb(71, 148, 247)"
                    }
                },
                legend: {
                    show: true,
                    orient: 'horizontal',
                    x: '5%',
                    y: '20%',
                    textStyle: {
                        color: "auto",
                        fontSize: 14
                    },
                    data: barData.legend.data
                },
                toolbox: {
                    show: false
                },
                grid: {
                    x: "5%",
                    y: "30%",
                    x2: "25%",
                    y2: "14%",
                    borderWidth: 1,
                    borderColor: "rgba(38, 46, 146, 0.8)"
                },
                calculable: false,
                xAxis: [{
                    type: "category",
                    data: barData.xAxis.data,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(38, 46, 146, 0.8)",
                            width: 1
                        }
                    },
                    axisLabel: {
                        margin: 8,
                        textStyle: {
                            color: "rgba(74, 154, 255, 0.8)",
                            fontSize: 10
                        }
                    },
                    axisTick: {
                        show: false,
                        lineStyle: {
                            color: "rgba(38, 46, 146, 0.8)",
                            width: 1
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(38, 46, 146, 0.8)",
                            width: 1
                        }
                    }
                }],
                yAxis: [{
                    type: 'value',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(38, 46, 146, 0.8)",
                            width: 1
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: "rgba(74, 154, 255, 0.8)",
                            fontSize: 14
                        }
                    },
                    axisTick: {
                        show: true,
                        lineStyle: {
                            color: "rgba(38, 46, 146, 0.8)",
                            width: 1
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(38, 46, 146, 0.8)",
                            width: 1
                        }
                    }
                }],
                series: barData.series
            };
            draw.barChart.setOption(option);
        },
        drawForce: function (forceData) { // 绘制多人关系图
            draw.relationControl.css("visibility", "visible");
            console.log(forceData);
            draw.myForceData = forceData;
            var dataSet = draw.myForceData;
            console.log(dataSet);
            d3.select("#relation-div svg").remove();
            var hScale = $("#relation-div").height() / 340;
            var wScale = $("#relation-div").width() / 540;
            var height = 340 * hScale;
            var width = 540 * wScale;
            var svg = d3.select("#relation-div")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            var tooltip = d3.select("#tooltip")
                .style("visibility", "hidden");

            var colors = d3.scale.category20();

            var force = d3.layout.force()
                .nodes(dataSet.persons)
                .links(dataSet.edges)
                .size([width * 0.8, height * 1.15])
                .linkDistance(function (d) {
                    return 20;
                })
                .friction(0.7)
                .charge(-4)
                .start();

            console.log(dataSet);

            var edges = svg.selectAll("line")
                .data(dataSet.edges)
                .enter()
                .append("line")
                .style("stroke", function (d) {
                    var title = d.linkedTitle.split(",");

                    if (title.length == 1) {
                        return "#965af0";
                    } else if (title.length == 2) {
                        return "#fed04d";
                    } else if (title.length > 2) {
                        return "#35bc73";
                        //if (d.linkedTitle[0] == "火车同行") {
                        //    return "#3de574";
                        //}
                        //if (d.linkedTitle[0] == "飞机同程") {
                        //    return "#b12cd7";
                        //}
                        //if (d.linkedTitle[0] == "旅游大巴") {
                        //    return "#f07320";
                        //}
                    }
                    if (draw.relationType != "全部") {
                        return "#965af0";
                    }
                })
                .style("stroke-width", function (d) {
                    var title = d.linkedTitle.split(",");
                    if (draw.relationType != "全部") {
                        if (title.indexOf(draw.relationType) < 0) {
                            return 0;
                        }
                    }
                    return 1;
                });
            console.log(edges);

            var nodes = svg.selectAll("circle")
                .data(dataSet.persons)
                .enter()
                .append("circle")
                .attr("r", 2.5)
                .style("fill", "rgba(95,170,255,0.9)")
                .on("click", function (d) {
                    console.log(d);
                    draw.opendlgdiv(d.personId);
                });
            // .call(force.drag);

            force.on("tick", function () {
                dataSet.persons.forEach(function (item, index) {
                    if (item.x > width * 0.8) {
                        item.x = width * 0.8;
                    }
                    if (item.y > height * 0.95) {
                        item.y = height * 0.95;
                    }
                    if (item.x < width * 0.03) {
                        item.x = width * 0.03;
                    }
                    if (item.y < height * 0.15) {
                        item.y = height * 0.15;
                    }
                });
                edges.attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                nodes.attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });
            });

            setTimeout(function () {
                force.alpha(0);
            }, 2000);

            force.on("end", function () {
                console.log("多人end");
            });

            nodes.on("mouseover", function (d) {
                tooltip.html("关系人：" + d.personName)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY + 10) + "px")
                    .style("visibility", "visible");
            });
            nodes.on("mousemove", function (d) {
                tooltip.style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            });
            nodes.on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            });

            // edges.on("mouseover", function (d) {
            //     var title = d.linkedTitle.split(",").join("<br />");
            //     tooltip.html(d.source.personName + " 与 " + d.target.personName + "的关系：" + "<br />" + title)
            //         .style("left", (d3.event.pageX + 10) + "px")
            //         .style("top", (d3.event.pageY + 10) + "px")
            //         .style("visibility", "visible");
            // });
            // edges.on("mousemove", function (d) {
            //     tooltip.style("left", (d3.event.pageX + 10) + "px")
            //         .style("top", (d3.event.pageY + 10) + "px");
            // });
            // edges.on("mouseout", function () {
            //     tooltip.style("visibility", "hidden");
            // });
        },
        drawTree: function (treeData) { // 绘制单人关系图
            draw.relationControl.css("visibility", "hidden");
            $("#relation-title").text("亲密度分析");
            console.log(treeData);
            var dataset = treeData;
            var temp = Math.floor((treeData.max - treeData.min) / 3);
            var scoreData = ['一级关系', '二级关系', '三级关系'];
            d3.select("#relation-div svg").remove();
            var hScale = $("#relation-div").height() / 340;
            var wScale = $("#relation-div").width() / 540;
            var h = 340 * hScale;
            var w = 540 * wScale;
            console.log(h);
            var svg = d3.select("#relation-div").append("svg")
                .attr("width", w)
                .attr("height", h);
            var tooltip = d3.select("#tooltip")
                .style("visibility", "hidden");

            console.log(dataset);
            var force = d3.layout.force()
                .nodes(dataset.persons)
                .links(dataset.edges)
                .size([w - 25, h + 20])
                .linkDistance(function (d) {
                    var lineLong = 150 * hScale;
                    if (d.target.totalScore > 20) {
                        lineLong = 50 * hScale;
                    } else if (d.target.totalScore <= 20 && d.target.totalScore > 10) {
                        lineLong = 100 * hScale;
                    } else if (d.target.totalScore <= 10) {
                        lineLong = 150 * hScale;
                    }
                    return lineLong;
                })
                .friction(0.7)
                .charge(-80 * hScale);

            force.start();
            console.log(dataset);

            svg.append("circle")
                .attr("class", "bg")
                .attr("fill", "none")
                .attr("stroke", "rgba(38, 46, 146, 0.8)")
                //.attr("opacity", 0)
                .attr("cx", w / 2 - 50)
                .attr("cy", h / 2 + 20)
                .attr("r", 140 * hScale);
            svg.append("circle")
                .attr("class", "bg")
                .attr("fill", "none")
                .attr("stroke", "rgba(38, 46, 146, 0.8)")
                //.attr("opacity", 0)
                .attr("cx", w / 2 - 50)
                .attr("cy", h / 2 + 20)
                .attr("r", 100 * hScale);
            svg.append("circle")
                .attr("class", "bg")
                .attr("fill", "none")
                .attr("stroke", "rgba(38, 46, 146, 0.8)")
                //.attr("opacity", 0)
                .attr("cx", w / 2 - 50)
                .attr("cy", h / 2 + 20)
                .attr("r", 50 * hScale);
            svg.append("circle")
                .attr("class", "bg")
                .attr("fill", "none")
                .attr("stroke", "rgba(38, 46, 146, 0.8)")
                //.attr("opacity", 0)
                .attr("cx", w / 2 - 50)
                .attr("cy", h / 2 + 20)
                .attr("r", 10 * hScale);

            var edges = svg.selectAll("line")
                .data(dataset.edges)
                .enter()
                .append("line")
                .style("stroke", "rgba(38, 46, 146, 0.8)")
                .style("opacity", 0.3)
                .style("stroke-width", 1 * hScale);

            var nodes = svg.selectAll(".Pcircle")
                .data(dataset.persons)
                .enter()
                .append("circle")
                .attr("class", "Pcircle")
                .attr("r", function (d) {
                    if (d.isCenter) {
                        return 10 * hScale;
                    }
                    return 5 * hScale;
                })
                .style("fill", function (d) {
                    if (d.totalScore > 20) {
                        return "#e67f00";
                    } else if (d.totalScore <= 20 && d.totalScore > 10) {
                        return "#339192";
                    } else if (d.totalScore <= 10) {
                        return "#008aea";
                    }
                    if (d.isCenter) {
                        return "#e00";
                    }
                })
                .on("click", function (d) {
                    draw.openOneDlgDiv(d.nodes[0].nodeId, d.nodes[0].nodeType);
                });
            // .call(force.drag);

            var legend = svg.selectAll(".legend")
                .data(scoreData)
                .enter()
                .append("circle")
                .attr("fill", function (d) {
                    if (d == "一级关系") {
                        return "#008aea";
                    }
                    if (d == "二级关系") {
                        return "#339192";
                    }
                    if (d == "三级关系") {
                        return "#e67f00";
                    }
                })
                .attr("cx", w * 0.77)
                .attr("cy", function (d) {
                    if (d == "一级关系") {
                        return 340 * 0.4 * hScale;
                    }
                    if (d == "二级关系") {
                        return (340 * 0.4 + 25) * hScale;
                    }
                    if (d == "三级关系") {
                        return (340 * 0.4 + 25 * 2) * hScale;
                    }
                })
                .attr("r", 5);
            var legendText = svg.selectAll(".legend-text")
                .data(scoreData)
                .enter()
                .append("text")
                .attr("fill", function (d) {
                    if (d == "一级关系") {
                        return "#008aea";
                    }
                    if (d == "二级关系") {
                        return "#339192";
                    }
                    if (d == "三级关系") {
                        return "#e67f00";
                    }
                })
                .attr("font-size", "14px")
                //.attr("text-anchor", "middle")
                .attr("x", w * 0.8)
                .attr("y", function (d) {
                    if (d == "一级关系") {
                        return 340 * 0.4 * hScale;
                    }
                    if (d == "二级关系") {
                        return (340 * 0.4 + 25) * hScale;
                    }
                    if (d == "三级关系") {
                        return (340 * 0.4 + 25 * 2) * hScale;
                    }
                })
                .attr("dy", "0.45em")
                .text(function (d) {
                    if (d == "一级关系") {
                        return "亲密度:[0,10]";
                    }
                    if (d == "二级关系") {
                        return "亲密度:(10,20]";
                    }
                    if (d == "三级关系") {
                        return "亲密度:(20, *)";
                    }
                });

            force.on("tick", function () {
                dataset.persons.forEach(function (item) {
                    if (item.isCenter) {
                        item.x = w / 2 - 50;
                        item.y = h / 2 + 20;
                    }
                });

                edges.attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                nodes.attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });
            });
            force.on("start", function () {
                console.log("start");
            });
            force.on("end", function () {
                console.log("end");
            });

            nodes.on("mouseover", function (d) {
                var text = "关系人：" + d.personName + "<br />亲密度：" + d.totalScore;
                if (d.isCenter) {
                    text = "关系人：" + d.personName;
                }
                tooltip.html(text)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY + 10) + "px")
                    .style("visibility", "visible");
            });
            nodes.on("mousemove", function (d) {
                tooltip.style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            });
            nodes.on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            });
        }
    };

    function getDraw() {
        return draw;
    }

    return {
        getDraw: getDraw
    }
});