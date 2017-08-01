/**
 * Created by songqiankun on 2016/12/10.
 */
define([
    "../lib/d3/d3.min",
    "./taishi_map"
], function (d3, taishi_map) {
    var mapControl = taishi_map.getmap();
    var relationDraw = {
        relaData: {},
        selectList: new Object(),
        initRelation: function () {
            var data = {
                "nodes": [{
                    "cname": "陈奕宏",
                    "id": "0691073402"
                }, {
                    "cname": "凃峰明",
                    "id": "1033100201"
                }, {
                    "cname": "方韦翔",
                    "id": "1035556301"
                }, {
                    "cname": "熊皓元",
                    "id": "1034858101"
                }, {
                    "cname": "刘时宏",
                    "id": "0834573602"
                }, {
                    "cname": "徐祥贺",
                    "id": "1032477501"
                }, {
                    "cname": "方瑞声",
                    "id": "1005979101"
                }, {
                    "cname": "钟秀荣",
                    "id": "0229722804"
                }, {
                    "cname": "林清标",
                    "id": "0649707002"
                }, {
                    "cname": "马嘉宏",
                    "id": "0878032001"
                }, {
                    "cname": "杨渊盛",
                    "id": "0951717701"
                }, {
                    "cname": "熊昱翔",
                    "id": "0878031501"
                }, {
                    "cname": "廖家庆",
                    "id": "0557211203"
                }, {
                    "cname": "陈厚宇",
                    "id": "0649478102"
                }, {
                    "cname": "廖元琳",
                    "id": "0878032201"
                }, {
                    "cname": "高冠璘",
                    "id": "0594750504"
                }, {
                    "cname": "胡培安",
                    "id": "0538941203"
                }, {
                    "cname": "陈德喜",
                    "id": "0005058103"
                }, {
                    "cname": "黄咏晨",
                    "id": "1034858301"
                }, {
                    "cname": "陈畯泽",
                    "id": "0617630503"
                }],
                "edges": []
            };
            for (var i = 0; i < 20; i++) {
                for (var j = i + 1; j < 20; j++) {
                    var edge = {};
                    edge.source = i;
                    edge.target = j;
                    data.edges.push(edge);
                }
            }
            d3.select("#relation svg").remove();
            var hScale = $("#relation").height() / 894;
            var wScale = $("#relation").width() / 1142;
            var height = 894 * hScale;
            var width = 1142 * wScale;
            var img_w = 110;
            var img_h = 110;
            var svg = d3.select("#relation")
                .append("svg")
                .attr("width", width)
                .attr("height", height);
            // d3.selectAll(".tooltip").remove();
            //var tooltip = d3.select("body")
            //    .append("div")
            //    .attr("class", "tooltip")
            //    .style("visibility", "hidden");
            var force = d3.layout.force()
                .nodes(data.nodes)
                .links(data.edges)
                .size([width, height])
                .linkDistance(function (d) {
                    // return Math.random() * 200 + 100;
                    return 500;
                })
                .friction(0.9)
                .charge(-2000)
                .start();

            console.log(data);

            var edges = svg.selectAll("line")
                .data(data.edges)
                .enter()
                .append("line")
                .style("stroke", function (d) {
                    return "#ccc";
                })
                .style("stroke-dasharray", "5,5")
                .style("stroke-width", function (d) {
                    return 0;
                });

            var edges_text = svg.selectAll(".linetext")
                .data(data.edges)
                .enter()
                .append("text")
                .attr("class", "linetext")
                .text(function (d) {
                    return d.relation;
                });

            var nodes_img = svg.selectAll("image")
                .data(data.nodes)
                .enter()
                .append("ellipse")
                .attr("class", "circleImg")
                .attr("rx", function (d) {
                    if (d.isPoint) {
                        return 15;
                    }
                    return 40;
                })
                .attr("ry", function (d) {
                    if (d.isPoint) {
                        return 15;
                    }
                    return 55;
                })
                .attr("stroke", "#4A9AFF")
                .attr("stroke-width", "5")
                .attr("fill", function (d, i) {
                    if (d.isPoint) {
                        return "#ffffff";
                    }
                    var defs = svg.append("defs").attr("calss", "imgdefs");

                    var catpattern = defs.append("pattern")
                        .attr("id", "catpattern" + i)
                        .attr("height", 1)
                        .attr("width", 1);

                    catpattern.append("image")
                        .attr("x", -15)
                        .attr("y", 0)
                        .attr("width", img_w)
                        .attr("height", img_h)
                        .attr("xlink:href", "img/" + d.id + ".jpg");

                    return "url(#catpattern" + i + ")";
                })
                .on("mouseover", function (d, i) {
                    d.show = true;
                    edges_text.style("fill-opacity", function (d) {
                        return d.source.show || d.target.show ? 1.0 : 0.0;
                    });
                })
                .on("mouseout", function (d, i) {
                    d.show = false;
                    edges_text.style("fill-opacity", function (d) {
                        return d.source.show || d.target.show ? 1.0 : 0.0;
                    });
                })
                .on("click", function (d) {
                    relationDraw.selectList(d.id);
                })
                .on("dblclick", function (d, i) {
                    var id = "#" + d.id;
                    $(id).parent(".list-item").children(".list-arrow").click();
                })
                .call(force.drag);


            var text_dx = -18;
            var text_dy = -5;

            var nodes_text = svg.selectAll(".nodetext")
                .data(data.nodes)
                .enter()
                .append("text")
                .attr("class", "nodetext")
                .attr("dx", text_dx)
                .attr("dy", text_dy)
                .text(function (d) {
                    if (d.isPoint) {
                        return "";
                    }
                    return d.cname;
                });

            force.on("tick", function () {
                data.nodes.forEach(function (item, index) {
                    item.x = item.x - img_w / 2 < 0 ? img_w / 2 : item.x;
                    item.x = item.x + img_w / 2 > width ? width - img_w / 2 : item.x;
                    item.y = item.y - img_h / 2 < 55 ? img_h / 2 + 50 : item.y;
                    item.y = item.y + img_w / 2 + text_dy + 10 > height ? height - img_w / 2 - text_dy - 8 : item.y;
                    if (item.id == "1") {
                        item.y = height / 2;
                        item.x = width / 3;
                    }
                    if (item.id == "2") {
                        item.y = height / 2;
                        item.x = 2 * width / 3;
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

                edges_text.attr("x", function (d) {
                    return (d.source.x + d.target.x) / 2;
                });
                edges_text.attr("y", function (d) {
                    return (d.source.y + d.target.y) / 2;
                });

                nodes_img.attr("cx", function (d) {
                        //console.log(d);
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });

                nodes_text.attr("x", function (d) {
                        return d.x;
                    })
                    .attr("y", function (d) {
                        return d.y + img_w / 2;
                    })
            });
        },
        drawRelation: function () {
            var data = {
                "nodes": [{
                    "cname": "陈奕宏",
                    "id": "0691073402"
                }, {
                    "cname": "凃峰明",
                    "id": "1033100201"
                }, {
                    "cname": "方韦翔",
                    "id": "1035556301"
                }, {
                    "cname": "熊皓元",
                    "id": "1034858101"
                }, {
                    "cname": "刘时宏",
                    "id": "0834573602"
                }, {
                    "cname": "徐祥贺",
                    "id": "1032477501"
                }, {
                    "cname": "方瑞声",
                    "id": "1005979101"
                }, {
                    "cname": "钟秀荣",
                    "id": "0229722804"
                }, {
                    "cname": "林清标",
                    "id": "0649707002"
                }, {
                    "cname": "马嘉宏",
                    "id": "0878032001"
                }, {
                    "cname": "杨渊盛",
                    "id": "0951717701"
                }, {
                    "cname": "熊昱翔",
                    "id": "0878031501"
                }, {
                    "cname": "廖家庆",
                    "id": "0557211203"
                }, {
                    "cname": "陈厚宇",
                    "id": "0649478102"
                }, {
                    "cname": "廖元琳",
                    "id": "0878032201"
                }, {
                    "cname": "高冠璘",
                    "id": "0594750504"
                }, {
                    "cname": "胡培安",
                    "id": "0538941203"
                }, {
                    "cname": "陈德喜",
                    "id": "0005058103"
                }, {
                    "cname": "黄咏晨",
                    "id": "1034858301"
                }, {
                    "cname": "陈畯泽",
                    "id": "0617630503"
                }, {
                    "cname": "旅行社1",
                    "id": "1",
                    isPoint: true
                }, {
                    "cname": "旅行社2",
                    "id": "2",
                    isPoint: true
                }],
                "edges": [{
                    "source": 20,
                    "target": 0,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 1,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 2,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 3,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 4,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 5,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 6,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 7,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 8,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 9,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 10,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 11,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 13,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 14,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 17,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 18,
                    "relation": "同行"
                }, {
                    "source": 20,
                    "target": 19,
                    "relation": "同行"
                }, {
                    "source": 21,
                    "target": 12,
                    "relation": "同行"
                }, {
                    "source": 21,
                    "target": 15,
                    "relation": "同行"
                }, {
                    "source": 21,
                    "target": 16,
                    "relation": "同行"
                }]
            };

            relationDraw.relaData = data;
            d3.select("#relation svg").remove();
            var hScale = $("#relation").height() / 894;
            var wScale = $("#relation").width() / 1142;
            var height = 894 * hScale;
            var width = 1142 * wScale;
            var img_w = 110;
            var img_h = 110;
            var svg = d3.select("#relation")
                .append("svg")
                .attr("width", width)
                .attr("height", height);
            d3.selectAll(".tooltip").remove();
            //var tooltip = d3.select("body")
            //    .append("div")
            //    .attr("class", "tooltip")
            //    .style("visibility", "hidden");
            var force = d3.layout.force()
                .nodes(data.nodes)
                .links(data.edges)
                .size([width, height])
                .linkDistance(function (d) {
                    // return Math.random() * 200 + 100;
                    return 200;
                })
                .friction(0.9)
                .charge(-2000)
                .start();

            console.log(data);

            var edges = svg.selectAll("line")
                .data(data.edges)
                .enter()
                .append("line")
                .style("stroke", function (d) {
                    return "#ccc";
                })
                .style("stroke-dasharray", "5,5")
                .style("stroke-width", function (d) {
                    return 2;
                });

            var edges_text = svg.selectAll(".linetext")
                .data(data.edges)
                .enter()
                .append("text")
                .attr("class", "linetext")
                .text(function (d) {
                    return d.relation;
                });

            var nodes_img = svg.selectAll("image")
                .data(data.nodes)
                .enter()
                .append("ellipse")
                .attr("class", "circleImg")
                .attr("rx", function (d) {
                    if (d.isPoint) {
                        return 15;
                    }
                    return 40;
                })
                .attr("ry", function (d) {
                    if (d.isPoint) {
                        return 15;
                    }
                    return 55;
                })
                .attr("stroke", "#4A9AFF")
                .attr("stroke-width", "5")
                .attr("fill", function (d, i) {
                    if (d.isPoint) {
                        return "#ffffff";
                    }
                    var defs = svg.append("defs").attr("calss", "imgdefs");

                    var catpattern = defs.append("pattern")
                        .attr("id", "catpattern" + i)
                        .attr("height", 1)
                        .attr("width", 1);

                    catpattern.append("image")
                        .attr("x", -15)
                        .attr("y", 0)
                        .attr("width", img_w)
                        .attr("height", img_h)
                        .attr("xlink:href", "img/" + d.id + ".jpg");

                    return "url(#catpattern" + i + ")";
                })
                .on("mouseover", function (d, i) {
                    d.show = true;
                    edges_text.style("fill-opacity", function (d) {
                        return d.source.show || d.target.show ? 1.0 : 0.0;
                    });
                })
                .on("mouseout", function (d, i) {
                    d.show = false;
                    edges_text.style("fill-opacity", function (d) {
                        return d.source.show || d.target.show ? 1.0 : 0.0;
                    });
                })
                .on("click", function (d) {
                    relationDraw.selectList(d.id);
                })
                .on("dblclick", function (d, i) {
                    var id = "#" + d.id;
                    $(id).parent(".list-item").children(".list-arrow").click();
                })
                .call(force.drag);


            var text_dx = -18;
            var text_dy = -5;

            var nodes_text = svg.selectAll(".nodetext")
                .data(data.nodes)
                .enter()
                .append("text")
                .attr("class", "nodetext")
                .attr("dx", text_dx)
                .attr("dy", text_dy)
                .text(function (d) {
                    if (d.isPoint) {
                        return "";
                    }
                    return d.cname;
                });

            force.on("tick", function () {
                data.nodes.forEach(function (item, index) {
                    item.x = item.x - img_w / 2 < 0 ? img_w / 2 : item.x;
                    item.x = item.x + img_w / 2 > width ? width - img_w / 2 : item.x;
                    item.y = item.y - img_h / 2 < 55 ? img_h / 2 + 50 : item.y;
                    item.y = item.y + img_w / 2 + text_dy + 10 > height ? height - img_w / 2 - text_dy - 8 : item.y;
                    if (item.id == "1") {
                        item.y = height / 2;
                        item.x = width / 3;
                    }
                    if (item.id == "2") {
                        item.y = height / 2;
                        item.x = 2 * width / 3;
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

                edges_text.attr("x", function (d) {
                    return (d.source.x + d.target.x) / 2;
                });
                edges_text.attr("y", function (d) {
                    return (d.source.y + d.target.y) / 2;
                });

                nodes_img.attr("cx", function (d) {
                        //console.log(d);
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });

                nodes_text.attr("x", function (d) {
                        return d.x;
                    })
                    .attr("y", function (d) {
                        return d.y + img_w / 2;
                    })
            });
        },

        initList: function (listData) {
            var $ul = $("#list");
            listData.forEach(function (item, index) {
                var addLi = '<li>' +
                    '<div class="list-item">' +
                    '<img class="list-img" src="img/' + item.id + '.jpg" alt=""/>' +
                    '<img class="list-arrow" src="img/Arrow.png" alt=""/>' +
                    '<p class="list-name">' + item.cname + '</p>' +
                    '<p class="list-country">' + item.gender + '.' + item.nationality + '</p>' +
                    '<p class="list-number">证件号：' + item.id + '</p>' +
                    '<p class="list-id" id="' + item.id + '" >' + index + '</p>' +
                    '</div>' +
                    '</li>';

                $ul.append(addLi);
            });
        },

        listClick: function () {
            $(".list-item").removeClass("selected");
            $(this).addClass("selected");
            var id = $(this).children(".list-id").attr("id");
            console.log(id);
            mapControl.SelectCaseData(id);
        },

        initSearch: function () {

        },

        buildGUI: function () {
            var docHeight = $(document).height();
            var open = false;
            $("#options").css({
                "visibility": "visible",
                "top": docHeight / 2,
                "bottom": docHeight / 2,
                "border-right-width": 0,
                "box-shadow": "none"
            }).animate({
                "top": 0,
                "bottom": 0
            }, 800, function complete() {
                $("#thumbprint").animate({
                    opacity: 1
                });
                $("#thumbprint").click(function () {
                    if (!open) {
                        open = true;
                        relationDraw.openOptions();
                    } else {
                        open = false;
                        relationDraw.closeOptions();
                    }
                });

                // setTimeout(function () {
                //   open = true;
                //   gallery.openOptions();
                // }, 1500);
            });
        },

        openOptions: function () {
            var headerTopPosition = $("#header-top").position().top;
            var headerBottomPosition = $("#header-bottom").position().top;
            var headerHeight = $("#header-top").outerHeight();
            /* margins or something, whatever */
            $(".header-animator").offset({
                top: $(document).height() / 2,
                left: 25
            });
            $(".header-animator").height(0);

            $("#options").css({
                "border-right-width": "1px solid #17308a;",
                "box-shadow": "0px 0px 2px rgba(30, 55, 170, 0.75);"
            });

            $("#options").data("left", $("#options").css("left"));
            $("#thumbprint").data("left", $("#thumbprint").css("left"));
            //$("#threejs-container").data("marginLeft", $("#threejs-container").css("marginLeft"));
            $("#options").animate({
                left: 0,
                opacity: 1
            }, 500);
            $("#thumbprint").animate({
                left: 260
            }, 500);
            $({
                deg: '90deg'
            }).animate({
                deg: '-90deg'
            }, {
                duration: 500,
                step: function (now) {
                    $("#thumbprint").css({
                        transform: 'rotate(' + now + 'deg)'
                    });
                }
            });
            //$("#threejs-container").animate({ marginLeft: 150 }, 500);
            $("#options-content").delay(1200).animate({
                opacity: 1
            }, 500);

            setTimeout(function () {
                $(".header-animator").css("visibility", "visible");

                $("#header-animator-outside").animate({
                    top: headerTopPosition,
                    height: headerBottomPosition - headerTopPosition + headerHeight
                }, 500);

                $("#header-animator-inside").animate({
                    top: headerTopPosition + headerHeight,
                    height: headerBottomPosition - headerTopPosition - headerHeight
                }, 500);
            }, 500);

            setTimeout(function () {
                $(".header-animator").css("visibility", "hidden");
                $(".header").css("visibility", "visible");
            }, 1000);
        },

        closeOptions: function () {
            $("#options").animate({
                left: $("#options").data("left"),
                opacity: 0
            }, 500);
            $("#thumbprint").animate({
                left: $("#thumbprint").data("left")
            }, 500);
            $({
                deg: '270deg'
            }).animate({
                deg: '90deg'
            }, {
                duration: 500,
                step: function (now) {
                    $("#thumbprint").css({
                        transform: 'rotate(' + now + 'deg)'
                    });
                }
            });
            $("#options").css({
                "border-right-width": "0;",
                "box-shadow": "none;"
            });
            $("#threejs-container").animate({
                marginLeft: $("#threejs-container").data("marginLeft")
            }, 500);
            $("#options-content").animate({
                opacity: 0
            }, 500);
            $(".header").css("visibility", "hidden");
        }
    };

    function getDraw() {
        return relationDraw;
    }

    return {
        getDraw: getDraw
    }
});