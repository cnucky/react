require([
    'nova-notify',
    'nova-dialog',
    'utility/jqwidgets4/jqxcore',
    'utility/jqwidgets4/jqxbuttons',
    'utility/jqwidgets4/jqxslider',
    "utility/D3/d3.min"
], function(Notify, Dialog) {
    $('.statusBar .navStatus li').each(function(index){
        $(this).on('click', function(){
            $('.statusBar .navStatus li').removeClass('active');
            $(this).addClass('active');
            $('.statusBar .status .pages').addClass('hide').eq(index).removeClass('hide')
        })
    });
    $('#downloadImg').on('click', function(){
        var name = $('#relation_charts svg').attr('id');
        svgenie.save(document.getElementById(name), { name:name + ".jpg" } );
    });
    var winW = $(window).width();
    var winH = $(window).height();
    //$('.moveLeft').click(function(){
    //    var $tray = $(this).parent('.tray');
    //    if($tray.css('right') == '-200px'){
    //        $tray.css('right', '0');
    //        $('.draw').css('width', '85.5%');
    //    }else{
    //        $tray.css('right', '-200px');
    //        $('.draw').css('width', '97%');
    //    }
    //});
    //
    //$('.timeList h1').click(function(){
    //    var $timeList = $('.timeList');
    //    console.log($timeList.css('bottom'));
    //    if($timeList.css('bottom') == '-225px'){
    //        $timeList.css('bottom', '.5%');
    //        $('.conduct').css('height', winH -280 - 60);
    //    }else{
    //        $timeList.css('bottom', '-225px');
    //        $('.conduct').css('height', winH - 60);
    //    }
    //})
    $('.statusBar').height(winH - 15);
    $('.draw').height(winH -280).width(winW - 270);
    $('.timeList').width(winW - 270);
    $(".contents").height(winH -280-60);
    $(window).resize(function(){
        winW = $(window).width();
        winH = $(window).height();
        $('.statusBar').height(winH - 15);
        $('.draw').height(winH -280).width(winW - 270);
        $('.timeList').width(winW - 270);

    });

    //导出文件
    function fnDownloadFile(fileName, content) {
        var domLink = document.createElement('a');
        var oBlob = new Blob([content]);
        var domEvt = document.createEvent('HTMLEvents');
        domEvt.initEvent('click', false, false);
        domLink.download = fileName;
        domLink.href = URL.createObjectURL(oBlob);
        domLink.dispatchEvent(domEvt);
    }
    $('body').on('click', '#download', function(){
        $.ajax({
            "url": '/dataprocess/conduct/getDownloadFile',
            "type": "POST",
            "success": function (json) {
                fnDownloadFile('1.csv', json)
            }
        });
    });
    //显示load页面
    function shadeShow(){
        $('.shade').show();
        $('.loading').show();
    }
    //隐藏load页面
    function shadeHide(){
        $('.shade').hide();
        $('.loading').hide();
    }
    var stateType;
    function queryProcess(data){
        $.ajax({
            "url": '/dataprocess/conduct/queryProcess',
            "type": "POST",
            "data":{jsonArg:{sessionId: data.data.sessionId}},
            "success": function (json) {
                $('.loading p').html(json.message);
                //var json={
                //    "data":{
                //        "startTime":1448257843800,
                //        "endTime": 1449987843800,
                //        "cacheStatus":4,
                //        "minWeight":1,
                //        "maxWeight":10,
                //        "sessionId":"33333"
                //    }};
                if (json.data.cacheStatus ==4) {
                    getRelationData(json);
                    clearInterval(stateType);
                }
            }
        });
    }

    window.initQuery = function(data) {
        $('.loading p').html(data.message);
        stateType = setInterval(function(){
            queryProcess(data);
        }, 3000)
    };


    //筛选边
    $('.sizer-dian .confirmDegree').on('click', function(){
        var degree = {};
        var extend = $('.statusBar .sizer-dian');
        if(extend.find('.maxTotalDegree').val() != ''){
            degree['maxTotalDegree'] = extend.find('.maxTotalDegree').val();
        }
        if(extend.find('.minTotalDegree').val() != ''){
            degree['minTotalDegree'] = extend.find('.minTotalDegree').val();
        }
        $.ajax({
            "url": '/dataprocess/conduct/getDegree',
            "type": "POST",
            "data":{jsonArg:degree},
            "success": function (json) {
                make_force_chart(json,"force");
            }
        });

    });

    //筛选点
    $('.confirmDesignAtion').on('click', function(){
        var designAtion = {};
        var sizer = $('.statusBar .type');
        if(sizer.find('.designAtion').val() != '') {
            designAtion['designAtion'] = sizer.find('.designAtion').val();
        }

        var extend = $('.statusBar .sizer-bian');
        if(extend.find('.maxTotalDegree').val() != '') {
            designAtion['maxTotalDegree'] = extend.find('.maxTotalDegree').val();
        }
        if(extend.find('.minTotalDegree').val() != '') {
            designAtion['minTotalDegree'] = extend.find('.minTotalDegree').val();
        }
        if(extend.find('.maxOutDegree').val() != '') {
            designAtion['maxOutDegree'] = extend.find('.maxOutDegree').val();
        }
        if(extend.find('.minOutDegree').val() != '') {
            designAtion['minOutDegree'] = extend.find('.minOutDegree').val();
        }
        if(extend.find('.maxInDegree').val() != ''){
            designAtion['maxInDegree'] = extend.find('.maxInDegree').val();
        }
        if(extend.find('.minInDegree').val() != '') {
            designAtion['minInDegree'] = extend.find('.minInDegree').val();
        }
        $.ajax({
            "url": '/dataprocess/conduct/getDesignAtion',
            "type": "POST",
            "data":{jsonArg:designAtion},
            "success": function (json) {
                make_force_chart(json,"force");
            }
        });

    });
    //*************************自定义变量*************************
    var dataset;  //返回数据
    var startTime= 0,endTime=0; //开始结束时间
    var minRank=0,maxRank=0;  // 最小 最大权重
    var $timeBox=$("#timeBox"); //时间选择容器
    var chartsBoxID="#relation_charts"; // 关系图表容器ID
    var brushsvg,brushXScale,brushYScale,brushForce,brushCircles,brushLines,brushNodeImg,brushTexts; //局部选择参数
    var $selectType=0,$selectNode=null,$selectNodeNum=-1,$lastSelectNode; //选择的点和点序号
    var $imgSize=[20,32,48]; //图片大小
    var $lineColor,$lineSize,$lindSizeRank=5; //线条粗度等级
    var $keyCode=-1; //键盘按键编码

    //时间选择器 宽高度设置
    $timeBox.find(".select_ranger")
        .height($timeBox.height()-20).width($timeBox.width()-30-10) //padding.left padding.right
        .find(".ranger_square").css("top",($timeBox.height()-10-10-8)/2+"px"); //padding.top

    //*************************事件方法*************************
    //第一次根据平均权重筛选数据
    function getRelationData(data){
        minRank=data.data.minWeight;
        maxRank=data.data.maxWeight;
        var midRank=(minRank+maxRank)/2; //平均权重

        $.ajax({
            "url": '/dataprocess/conduct/getRelationData',
            "type": "POST",
            "data":{"s_rank":Math.floor(midRank),"e_rank":Math.ceil(midRank),"sid":data.data.sessionId},
            "success": function (json) {
                dataset=json;
                startTime=new Date(get_time(data.data.startTime,"ymd")+" 00:00:00").getTime();
                endTime=new Date(get_time(data.data.endTime,"ymd")+" 00:00:00").getTime()+24*3600*1000;
                load_data_selector(); //加载日期选择器
                make_rect_chart(json.link); //加载柱状图
                make_force_chart(json,"force");

            }
        });
    }

    //生成力导向图  矩形图 孔雀图
    function make_force_chart(data,type){
        //清空画布
        $(chartsBoxID).html("");

        //图片 节点大小
        var img_w = $imgSize[0];
        var img_h = $imgSize[0];
        var radius=$imgSize[0]/2;

        //画布周边的空白
        var padding = {left: 0, right: 0, top: 0, bottom: 0};

        //根据显示图类型设置画布大小
        var width = $(chartsBoxID).width();
        var height = $(chartsBoxID).height();

        var svg;

        if(type=="rect"){
            var sourceNodeID,sourceNodeX=0,sourceNodeY=0;
            var rectWidth=0;
            width  = 700;
            $(chartsBoxID).html('<div id="rect_chart" style="width: '+width+'px; height: '+height+'px; margin: 0 auto;"></div>');
            rectWidth=$("#rect_chart").width();
            svg = d3.select("#rect_chart")
                .append("svg");
        }else{
            svg = d3.select(chartsBoxID)
                .append("svg");
        }
        svg.attr("id","chartSVG")
            .attr("width", width)
            .attr("height", height);

        var g=svg.append("g");

        //确定初始数据
        var nodes=data.node;
        var edges=data.link;

        //如果是矩形图，计算根节点
        if(type=="rect") sourceNodeID=edges[0].sourceId;

        //转换数据
        var force = d3.layout.force()
            .nodes(nodes)
            .links(edges)
            .size([width,height])
            .linkDistance(80) //设定边的距离
            .charge(-200)  //设定节点的电荷数
            .start();

        //绘制连线
        var lines = g.selectAll(".forceLine")
            .data(edges)
            .enter()
            .append("line")
            .attr("class","forceLine")
            .attr("start",function(d){
                return d.source._id;
            })
            .attr("end",function(d){
                return d.target._id;
            })
            .style("stroke","#666")
            .style("stroke-width",function(d){
                return return_line_weight(d.weight)+"px";
            });

        //边上的文字
        var lines_text = g.selectAll(".linetext")
            .data(edges)
            .enter()
            .append("text")
            .attr("class","linetext")
            .text(function(d){
                return d.weight;
            });

        //绘制节点
        var circles = g.selectAll(".forceCircle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("class","forceCircle")
            .attr("r",radius)
            .attr("fill", "none");


        //绘制图片
        var nodes_img = g.selectAll(".nodeImg")
            .data(nodes)
            .enter()
            .append("image")
            .attr("class","nodeImg")
            .attr("key",function(d){
                return d.mac;
            })
            .attr("width",img_w)
            .attr("height",img_h)
            .attr("xlink:href","./img/dataprocess/node.png")
            .attr("pid",function(d){
                return d._id;
            });

        if(type=="force"){ //力导图 可拖动
            nodes_img.call(force.drag);
        }
        //    return rectPadding.left+i%$number*dot_w-img_w/2;
        //});
        //nodes_img.attr("y",function(d,i){
        //    return rectPadding.top+Math.floor(i/$number)*dot_h-img_h/2;


        //节点文字
        var texts = g.selectAll(".forceText")
            .data(nodes)
            .enter()
            .append("text")
            .attr("class","forceText")
            .text(function(d){ return d.mac; });

        //节点信息
        var infoTip = d3.select("body")
            .append("div")
            .attr("id","infoTip")
            .style("opacity",0.0);

        //节点事件
        nodes_img.on("mouseover",function(d,i){
            //显示节点信息
            infoTip.html("<b>MAC：</b>"+ d.mac+"<br><b>入度：</b>"+d.inDegree+"<br><b>出度:</b>"+ d.outDegree+"<br><b>总度:</b>"+ d.totalDegree)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity",1.0);

            //显示边线信息
            lines_text.style("fill-opacity",function(edge){
                if( edge.source === d || edge.target === d ){
                    return 1.0;
                }
            });
        })
            .on("mousemove",function(d){
                //鼠标移动 更改提示框的位置
                infoTip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px");
            })
            .on("mouseout",function(d){
                //隐藏节点信息
                infoTip.style("opacity",0.0);

                //隐藏边线信息
                lines_text.style("fill-opacity",function(edge){
                    if( edge.source === d || edge.target === d ){
                        return 0.0;
                    }
                });
            })
            .on("click",function(d,i){
                if($selectType!=1){
                    $selectType=1;
                    $selectNode=d;
                    $selectNodeNum=i;
                    $lastSelectNode=null;
                    $(".forceLine").css("stroke","#666");
                }
                var $thisNode= $(".forceCircle").eq(i);
                if( $thisNode.css("stroke")!="none"){
                    $thisNode.css("stroke","none");
                }else{
                    $thisNode.css("stroke","#f00");
                }
                if($keyCode!=17){
                    $thisNode.siblings(".forceCircle").css("stroke","none");
                }
                $lastSelectNode=$selectNode._id;
                $selectNode=d;
                $selectNodeNum=i;
                $(".forceLine").css("stroke","#666");
                $(".forceLine[start='"+$lastSelectNode+"'][end='"+$selectNode._id+"']").css("stroke","red");
                $(".forceLine[end='"+$lastSelectNode+"'][start='"+$selectNode._id+"']").css("stroke","red");

                $changeSize.attr("max","3");
            });

        //连线事件
        lines.on("mouseover",function(d){
            var info='';
            for(var i=0;i< d.massage.length;i++){
                var msg=d.massage[i];
                info+="<br>时间:"+get_time(msg.stamp_time,"ymd_hm")+"，接收方IP:"+msg.client_ip+"，发送方IP:"+msg.server_ip;
            }
            infoTip.html("weight："+d.weight+info)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity",1.0);
        })
            .on("mouseout",function(d){
                infoTip.style("opacity",0.0);
            })
            .on("click",function(d,i){
                if($selectType!=2){
                    $lastSelectNode=null;
                    $(".forceCircle").css("stroke","none");
                }
                $selectType=2;
                $selectNode=d;
                $selectNodeNum=i;
                var $thisNode= $(".forceLine").eq(i).css("stroke","red");
                if($keyCode!=17){
                    $thisNode.siblings(".forceLine").css("stroke","#666");
                }
                $lineSize= parseInt($(".forceLine").eq(i).css("stroke-width"));
                $changeSize.attr("max","10");
            });

        //拖拽事件
        var drag = force.drag()
            .on("dragstart",function(d,i){
                //d.fixed = true;
                //d3.select(this).style("border","1px solid #f00");
            })
            .on("drag",function(d){

            })
            .on("dragend",function(d,i){
                //d3.select(this).style("stroke","none");
            });

        //tick事件的监听器
        force.on("tick", function(){
            if(type=="rect"){
                var rectPadding={left: 10, right: 10, top: 20, bottom: 0};
                var $number=10; //一行节点数目
                var dot_w=(rectWidth-rectPadding.left-rectPadding.right)/$number; // 每个节点宽度
                var dot_h=$imgSize[2]+5; //节点高度

                //更新节点
                circles.attr("cx",function(d,i){
                    if(d._id==sourceNodeID){
                        sourceNodeX=rectPadding.left+i%$number*dot_w;
                    }
                    return rectPadding.left+i%$number*dot_w;
                });

                circles.attr("cy",function(d,i){
                    if(d._id==sourceNodeID){
                        sourceNodeY=rectPadding.top+Math.floor(i/$number)*dot_h;
                    }
                    return rectPadding.top+Math.floor(i/$number)*dot_h;
                });

                //更新边
                lines.attr("x1",function(d,i){
                    return rectPadding.left+i%$number*dot_w;
                })
                    .attr("y1",function(d,i){
                        return rectPadding.top+Math.floor(i/$number)*dot_h;
                    })
                    .attr("x2",function(d,i){
                        return sourceNodeX;
                    })
                    .attr("y2",function(d,i){
                        return sourceNodeY;
                    });

                //更新图片
                nodes_img.attr("x",function(d,i){
                    return rectPadding.left+i%$number*dot_w-img_w/2;
                });
                nodes_img.attr("y",function(d,i){
                    return rectPadding.top+Math.floor(i/$number)*dot_h-img_h/2;
                });

                //更新连接线上文字的位置
                lines_text.attr("x",function(d,i){ return (rectPadding.left+i%$number * dot_w + sourceNodeX) / 2 ; });
                lines_text.attr("y",function(d,i){ return (rectPadding.top+Math.floor(i/$number)*dot_h + sourceNodeY) / 2 ; });

            }else{
                //更新连线
                lines.attr("x1",function(d){ return d.source.x; });
                lines.attr("y1",function(d){ return d.source.y; });
                lines.attr("x2",function(d){ return d.target.x; });
                lines.attr("y2",function(d){ return d.target.y; });

                //更新节点
                circles.attr("cx",function(d){ return d.x; });
                circles.attr("cy",function(d){ return d.y; });

                //更新节点图片
                nodes_img.attr("x",function(d){ return d.x-img_w/2; });
                nodes_img.attr("y",function(d){ return d.y-img_h/2; });

                //更新节点文字
                texts.attr("x",function(d){ return d.x; })
                    .attr("y",function(d){ return d.y; })
                    .attr("dy","20px");

                //更新连接线上文字的位置
                lines_text.attr("x",function(d){ return (d.source.x + d.target.x) / 2 ; });
                lines_text.attr("y",function(d){ return (d.source.y + d.target.y) / 2 ; });
            }
        });

        //x轴的比例尺
        var xScale = d3.scale.linear()
            .domain([0, 10])
            .range([padding.left, width - padding.right]);

        //y轴的比例尺
        var yScale = d3.scale.linear()
            .domain([10, 0])
            .range([padding.top, height - padding.bottom]);
        brushsvg=svg;
        brushXScale=xScale;
        brushYScale=yScale;
        brushForce=force;
        brushCircles=circles;
        brushLines=lines;
        brushNodeImg=nodes_img;
        brushTexts=texts;


        shadeHide();
    }

    //生成树型图
    function make_tree_chart(data){
        //var width  = $(chartsBoxID).width();
        //var height = $(chartsBoxID).height();
        var width  = 800;
        var height = 500;
        $(chartsBoxID).html("");

        var svg = d3.select(chartsBoxID)
            .append("svg")			//在<body>中添加<svg>
            .attr("width", width)	//设定<svg>的宽度属性
            .attr("height", height);//设定<svg>的高度属性

        var root= {
            "mail": "liming@163.com",
            "_id": "32344",
            "children": [
                {
                    "mail": "6767804@qq.com",
                    "_id": "32344"
                },
                {
                    "mail": "xiaomign920101@163.com",
                    "_id": "4325"
                },
                {
                    "mail": "missyou@sohu.com",
                    "_id": "5325"
                },
                {
                    "mail": "789789@qq.com",
                    "_id": "5325"
                },
                {
                    "mail": "zhangnili@sina.com.cn",
                    "_id": "32344",
                    "children": []
                },
                {
                    "mail": "789789@qq.com",
                    "_id": "5325"
                },
                {
                    "mail": "zhangnili@sina.com.cn",
                    "_id": "32344"
                },
                {
                    "mail": "789789@qq.com",
                    "_id": "5325"
                },
                {
                    "mail": "zhangnili@sina.com.cn",
                    "_id": "32344"
                }
            ]
        };
        var gCluster = svg.append("g")
            .attr("transform","translate(280,0)");

        var cluster = d3.layout.cluster()
            .size([height, width-500])
            .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) ; });


        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var nodes = cluster.nodes(root);
        var links = cluster.links(nodes);

        var link = gCluster.selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "diagonalLine")
            .attr("d", diagonal)	//使用对角线生成器
            .on("mouseover",function(d){

            })
            .on("mouseout",function(d){

            });

        var node = gCluster.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + (d.y-10) + "," + (d.x-10) + ")"; });

        node.append("image")
            .attr("class","nodeImg")
            .attr("width",20)
            .attr("height",20)
            .attr("xlink:href",function(d){
                return "./img/dataprocess/node.png";
            })
            .on("mousemove",function(d){

            })

            .on("mouseout",function(d){
                tooltip.style("opacity",0.0);
            });


        node.append("text")
            .attr("dx", function(d) { return d.children ? 100 : 0; })
            .attr("dy", function(d) { return d.children ? 32 : 32; })
            .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.mail; });
    }

    //生成层级图
    function make_level_chart(data){
        var  width  = $(chartsBoxID).width();
        var height  = $(chartsBoxID).height();
        var img_w = 30;
        var img_h = 30;
        var padding_h=20;
        var padding_v=30;
        $(chartsBoxID).html("");

        var svg = d3.select(chartsBoxID)			//选择<body>
            .append("svg")			//在<body>中添加<svg>
            .attr("width", width)	//设定<svg>的宽度属性
            .attr("height", height); //设定<svg>的高度属性

        var infoTip = d3.select("body")
            .append("div")
            .attr("id","infoTip")
            .style("opacity",0.0);

        var $all=Math.floor(Math.random()*10)+1;
        var $in=Math.floor(Math.random()*$all)+1;

        var nodes=[{x:5,y:0,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:3,y:1,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:5,y:1,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:7,y:1,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:10,y:1,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:0,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:1,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:2,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:3,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:4,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:5,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:6,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:7,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:8,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:9,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:10,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in},
            {x:11,y:2,"inDegree":$in,"totalDegree":$all,"outDegree":$all-$in}];
        var lines=[{x1:5,y1:0,x2:3,y2:1},
            {x1:5,y1:0,x2:5,y2:1},
            {x1:5,y1:0,x2:7,y2:1},
            {x1:5,y1:0,x2:10,y2:1},
            {x1:3,y1:1,x2:0,y2:2},
            {x1:3,y1:1,x2:1,y2:2},
            {x1:3,y1:1,x2:2,y2:2},
            {x1:3,y1:1,x2:3,y2:2},
            {x1:5,y1:1,x2:4,y2:2},
            {x1:5,y1:1,x2:5,y2:2},
            {x1:5,y1:1,x2:6,y2:2},
            {x1:7,y1:1,x2:7,y2:2},
            {x1:7,y1:1,x2:8,y2:2},
            {x1:7,y1:1,x2:9,y2:2},
            {x1:10,y1:1,x2:10,y2:2},
            {x1:10,y1:1,x2:11,y2:2},
        ];
        var nodeline= svg.selectAll(".nodeLine")
            .data(lines)
            .enter()
            .append("line")
            .attr("class","nodeLine")
            .style("stroke","#444")
            .style("stroke-width",function(){
                return (Math.floor(Math.random()*5)+1)+"px";
            })
            .attr("x1",function(d,i){
                return d.x1*img_w+ d.x1*padding_h;
            })
            .attr("y1",function(d,i){
                return d.y1*img_h+ d.y1*padding_v;
            })
            .attr("x2",function(d,i){
                return d.x2*img_w+ d.x2*padding_h;
            })
            .attr("y2",function(d,i){
                return d.y2*img_h+ d.y2*padding_v;
            })
            .attr("transform","translate(400,100)");
        svg.selectAll(".nodeImg")
            .data(nodes)
            .enter()
            .append("image")
            .attr("class","nodeImg")
            .attr("width",img_w)
            .attr("height",img_h)
            .attr("xlink:href",function(d){
                return "./img/dataprocess/node.png";
            })
            .attr("x",function(d,i){
                return d.x*img_w+ d.x*padding_h-img_w/2;
            })
            .attr("y",function(d,i){
                return d.y*img_h+ d.y*padding_v-img_h/2;
            })
            .attr("transform","translate(400,100)")
            .on("mouseover",function(d){
                //显示节点信息
                infoTip.html("<b>信箱：</b>"+emails[Math.floor(Math.random()*emails.length)]+"<br><b>入度：</b>"+d.inDegree+"<br><b>出度:</b>"+ d.outDegree+"<br><b>总度:</b>"+ d.totalDegree)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity",1.0);
            })
            .on("mousemove",function(d){
                //鼠标移动 更改提示框的位置
                infoTip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px");
            })
            .on("mouseout",function(d){
                //隐藏节点信息
                infoTip.style("opacity",0.0);
            })


        nodeline.on("mouseover",function(d){
            var info='';
            for(var i=0;i< d.weight;i++){
                info+="<br>stamp_time:"+get_ymd_hms(tempStartTime+Math.floor(Math.random()*(tempEndTime-tempStartTime)))+"，server_ip:"+get_IP()+"，client_ip:"+get_IP();
            }
            infoTip.html("weight："+d.weight+info)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity",1.0);
        })
            .on("mouseout",function(d){
                infoTip.style("opacity",0.0);
            })
            .on("click",function(d,i){
                if($selectType!=2){
                    $lastSelectNode=null;
                    $(".forceCircle").css("stroke","none");
                }
                $selectType=2;
                $selectNode=d;
                $selectNodeNum=i;
                var $thisNode= $(".forceLine").eq(i).css("stroke","red");
                if($keyCode!=17){
                    $thisNode.siblings(".forceLine").css("stroke","#666");
                }
                $lineSize= parseInt($(".forceLine").eq(i).css("stroke-width"));
                $changeSize.attr("max","10");
            });
    }

    //生成柱状图
    function make_rect_chart(data){
        //画布大小
        var $box=$timeBox.find(".select_ranger_box");
        var width = $box.width();
        var height = $box.height();

        //添加一个 SVG 画布
        var svg = d3.select(".charts")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        var padding = {left:30, right:10, top:10, bottom:10}; //画布周边的空白
        var periods=90; //时间分段

        //统计数据
        var rectData=[];
        for(var i=0;i<periods;i++){
            rectData.push(Math.ceil(Math.random()*200));
        }
        for(var i=0;i<data.length;i++){
            var msg=data[i].massage;
            for(var j=0;j<msg.length;j++){
                var stamp_time=msg[j].stamp_time;
                rectData[Math.floor((stamp_time-startTime)/(endTime-startTime)*periods)]++;
            }
        }

        //x轴数据
        var xData=[];
        for(var i=0;i<=periods;i++){
            var timeSpan=(endTime-startTime)/periods;
            xData.push(startTime+timeSpan*i);
        }

        //柱状图宽度
        var rectWidth=(width - padding.left - padding.right)/periods;

        //x轴的比例尺
        var xScale = d3.scale.ordinal()
            .domain(xData)
            .rangeBands([0, width - padding.left - padding.right + rectWidth]);


        //y轴的比例尺
        var yScale = d3.scale.linear()
            .domain([0,d3.max(rectData)])
            .range([height - padding.top - padding.bottom,0 ]);

        //添加矩形元素
        var rects = svg.selectAll(".MyRect")
            .data(rectData)
            .enter()
            .append("rect")
            .attr("class","MyRect")
            .attr("transform","translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function(d,i){
                return rectWidth*i;
            })
            .attr("y",function(d){
                return yScale(d);
            })
            .attr("border", 1 )
            .attr("width", rectWidth)

            .attr("height", function(d){
                return height - padding.bottom -padding.top - yScale(d);
            })
            .on("mouseover",function(d,i){
                $("#timeBox .charts .MyText").eq(i).show();
            })
            .on("mouseout",function(d,i){
                $("#timeBox .charts .MyText").eq(i).hide();
            });

        //添加文字元素
        var texts = svg.selectAll(".MyText")
            .data(rectData)
            .enter()
            .append("text")
            .attr("class","MyText")
            .attr("transform","translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function(d,i){
                return rectWidth*i;
            } )
            .attr("y",function(d){
                return yScale(d);
            })
            .attr("dx",function(){
                return rectWidth/2;
            })
            .attr("dy",function(d){
                return d>6 ?  15: -5;
            })
            .text(function(d){
                return d;
            })
            .attr("fill", function(d){
                return d>6 ?  "#fff": "#000";
            });

        //增加X轴
        //var xAxis = d3.svg.axis()
        //    .scale(xScale)
        //    .orient("bottom")
        //    .tickFormat(function(d,i){
        //        //return get_time(d,"ymd");
        //        return i;
        //    });
        //
        //svg.append("g")
        //    .attr("class","axis")
        //    .attr("transform","translate("+(padding.left-rectWidth/2)+","+(height - padding.bottom)+")")
        //    .call(xAxis);

        //增加y轴
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        svg.append("g")
            .attr("class","axis")
            .attr("transform","translate("+padding.left+","+padding.top+")")
            .call(yAxis);
    }

    //生成时间选择器
    function load_data_selector(){
        bindResize(".left_square");
        bindResize(".right_square");
        bindResize(".ranger");
        function bindResize(el){
            var $left_square,$right_square,$ranger;
            var mouseX=0,$left= 0,$right= 0,$ranger_left= 0,$ranger_width=0;
            var flag=0;
            $(el).mousedown(function (e) {
                if($(el).hasClass("left_square")){
                    flag=1;
                }else if($(el).hasClass("right_square")){
                    flag=2;
                }else{
                    flag=3;
                }
                $left_square=$(el).parent().find(".left_square");
                $right_square=$(el).parent().find(".right_square");
                $ranger=$(el).parent().find(".ranger");

                $left=parseInt($left_square.css("left"));
                $right=parseInt($right_square.css("right"));
                $ranger_left=parseInt($ranger.css("left"));
                $ranger_width=$ranger.width();

                mouseX= e.clientX;
                el.setCapture ? (
                    el.setCapture(),
                        el.onmousemove = function (ev) {
                            mouseMove(ev || event)
                        },
                        el.onmouseup = mouseUp
                ) : (
                    $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
                );
                e.preventDefault();
            });
            function mouseMove(e) {
                var passX=e.clientX-mouseX; //移动的位移
                var $allWidth=$(".select_ranger").width();
                var spanPx=(endTime-startTime)/$allWidth; //每像素代表的时间
                var leftTime,rightTime;
                var newLeft=0, newRight=0;
                if(flag==1){
                    newLeft=$left+passX;
                    if(newLeft >=-4 && $ranger_width-passX > 8){
                        //设置宽度
                        $left_square.css("left",(newLeft)+"px").prevAll(".left_space").width(newLeft+4);
                        $ranger.css("left",($ranger_left+passX)+"px").width($ranger_width-passX);
                        //计算时间
                        leftTime=startTime+spanPx*(newLeft+4);
                        $left_square.find(".num").show().html(get_time(leftTime,"ymd_hm"));
                    }
                }else if(flag==2){
                    newRight=$right-passX;
                    if($right-passX>=-4 && $ranger_width+passX > 8){
                        //设置宽度
                        $right_square.css("right",newRight+"px").prevAll(".right_space").width(newRight+4);
                        $ranger.width($ranger_width+passX);
                        //计算时间
                        rightTime=endTime-spanPx*(newRight+4);
                        $right_square.find(".num").show().html(get_time(rightTime,"ymd_hm"));
                    }
                }else if(flag==3){
                    newLeft=$left+passX;
                    newRight=$right-passX;
                    if(newLeft >=-4 && newRight>=-4){
                        //设置宽度
                        $left_square.css("left",newLeft+"px").prevAll(".left_space").width(newLeft+4);
                        $ranger.css("left",($ranger_left+passX)+"px");
                        $right_square.css("right",($right-e.clientX + mouseX)+"px") ;
                        $right_square.prevAll(".right_space").width($right-e.clientX + mouseX+4);
                        //计算时间
                        leftTime=startTime+spanPx*(newLeft+4);
                        $left_square.find(".num").show().html(get_time(leftTime,"ymd_hm"));
                        rightTime=endTime-spanPx*(newRight+4);
                        $right_square.find(".num").show().html(get_time(rightTime,"ymd_hm"));
                    }
                }
                var $width=$left_square.prevAll(".left_space").width()+$right_square.prevAll(".right_space").width();

                if($width/$allWidth<0.1){
                    $(".forceCircle").css("fill","red");
                }else if($width/$allWidth<0.5&&$width/$allWidth>=0.1){
                    $(".forceCircle").css("fill","none");
                    $(".forceCircle:odd").css("fill","red");
                } else if($width/$allWidth>=0.5){
                    $(".forceCircle").css("fill","none");
                    $(".forceCircle:even").css("fill","red");
                }

            }
            function mouseUp(e){
                el.releaseCapture ? (
                    el.releaseCapture(),
                        el.onmousemove = el.onmouseup = null
                ) : (
                    $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp),
                        $(".select_ranger_box .ranger_square .num").html("").hide()
                )
            }
        }
    }

    //局部选图
    function startBrush(svg,xScale,yScale,force,circles,lines,nodeImg,texts){
        var brush = d3.svg.brush()
            .x(xScale)
            .y(yScale)
            .extent([[0, 0], [0, 0]])
            .on("brushend",brushend);

        function brushend(){
            //选择框的范围
            var extent = brush.extent();
            var xmin = extent[0][0];
            var xmax = extent[1][0];
            var ymin = extent[0][1];
            var ymax = extent[1][1];
            circles.style("display",function(d){
                //如果散点的坐标在选择框范围内，变为红色，否则为黑色
                if(!(xScale.invert(d.x) >= xmin && xScale.invert(d.x) <= xmax &&
                    yScale.invert(d.y) >= ymin && yScale.invert(d.y) <= ymax)){
                    return "none";
                }else{
                    return ""
                }
            });
            lines.style("display",function(d){
                //如果散点的坐标在选择框范围内，变为红色，否则为黑色
                if(!((xScale.invert(d.source.x) >= xmin && xScale.invert(d.source.x) <= xmax &&
                    yScale.invert(d.source.y) >= ymin && yScale.invert(d.source.y) <= ymax)&&
                    (xScale.invert(d.target.x) >= xmin && xScale.invert(d.target.x) <= xmax &&
                    yScale.invert(d.target.y) >= ymin && yScale.invert(d.target.y) <= ymax))){
                    return "none";
                }else{
                    return ""
                }
            });
            nodeImg
                .attr("display",function(d){
                    if(!(xScale.invert(d.x) >= xmin && xScale.invert(d.x) <= xmax &&
                        yScale.invert(d.y) >= ymin && yScale.invert(d.y) <= ymax)){
                        return "none";
                    }else{
                        return ""
                    }
                });
            texts.attr("display",function(d){
                if(!(xScale.invert(d.x) >= xmin && xScale.invert(d.x) <= xmax &&
                    yScale.invert(d.y) >= ymin && yScale.invert(d.y) <= ymax)){
                    return "none";
                }else{
                    return ""
                }
            });
            $("#relation_charts svg").css("transform","scale(1.5)");
            $("#relation_charts svg > g:last").remove();
        }

        //添加刷子的相关元素到一个g里
        svg.append("g")
            .call(brush)
            .selectAll("rect")
            .style("fill-opacity",0.3);
    }

    //根据权重返回线条粗度
    function return_line_weight(weight){
        var rankpie=(maxRank-minRank+1)/$lindSizeRank;
        return Math.floor((weight-minRank)/rankpie+1)
    }

    //获取时间格式
    function get_time(data,format){
        var t=new Date(data);
        var m=(t.getMonth()+1)<10?("0"+(t.getMonth()+1)):(t.getMonth()+1);
        var d=t.getDate()<10?("0"+t.getDate()):t.getDate();
        var h=t.getHours()<10?("0"+t.getHours()):t.getHours();
        var mm=t.getMinutes()<10?("0"+t.getMinutes()):t.getMinutes();
        var s=t.getSeconds()<10?("0"+t.getSeconds()):t.getSeconds();
        switch (format){
            case "ym":
                return t.getFullYear()+"-"+m;
                break;
            case "ymd":
                return t.getFullYear()+"-"+m+"-"+d;
                break;
            case "ymd_h":
                return t.getFullYear()+"-"+m+"-"+d+" "+h;
                break;
            case "ymd_hm":
                return t.getFullYear()+"-"+m+"-"+d+" "+h+":"+mm;
                break;
            case "ymd_hms":
                return t.getFullYear()+"-"+m+"-"+d+" "+h+":"+mm+":"+s;
                break;
        }
    }

    //获取矩形数据
    function getRectData(json,fun) {
        $.ajax({
            "url": '/dataprocess/conduct/getRectData',
            "type": "POST",
            "data":{jsonArg:json},
            "success": function (data) {
                fun(data)
            }
        })
    }

    //获取树型数据
    function getTreeData(json,fun) {
        $.ajax({
            "url": '/dataprocess/conduct/getTreeData',
            "type": "POST",
            "data":{jsonArg:json},
            "success": function (data) {
                fun(data)
            }
        })
    }

    //树形数据处理
    function redo_tree_data(obj){

    }


    //*************************响应事情*************************
    //切换各种类型图表
    var zoom=1;
    var zoomW,zoomH;
    $('.conduct .header .button').each(function(){
        $(this).on('click', function(){
            var chartType=$(this).attr("type");
            var $svg=$("#chartSVG");
            var g=$svg.children("g");
            if($(this).hasClass("drawSVG")){
                if(chartType=="force"){
                    make_force_chart(dataset,"force")
                }else{
                    Dialog.build({
                        title: $('.text' ,this).html(),
                        content: "<div class='drawSVGDialogContent'><p><label>节点ID:</label> <input type='text' value='12204' /></p></div>",
                        rightBtnCallback: function(){
                            var nodeID=$(".drawSVGDialogContent input").val();
                            if(typeof(nodeID)!="undefined" && nodeID!="" && nodeID!=null) {
                                var preJSON={ nodeId:nodeID,minWeight: minRank,maxWeight: maxRank};
                                switch (chartType){
                                    case "rect": //矩形
                                        getRectData(preJSON,function(data){
                                            make_force_chart(data,"rect");
                                        });
                                        break;
                                    case "round": //圆形
                                        getRectData(preJSON,function(data){
                                            make_force_chart(data,"round");
                                        });
                                        break;
                                    case "tree": //树形
                                        getTreeData(preJSON,function(data){
                                            make_tree_chart(data);
                                        });
                                        break;
                                    case "level": //层次
                                        getTreeData(preJSON,function(data){
                                            make_level_chart(data);
                                        });
                                        break;

                                }
                                Dialog.dismiss();
                            }else{
                                Notify.show({
                                    title: "提示：",
                                    text: "请先输入查询节点的ID",
                                    type: "error"
                                });
                                return;
                            }
                        }
                    }).show();
                }
            }else{
                switch (chartType){
                    case "bigger": //放大
                        if(zoom<2){
                            zoom=zoom+0.1;
                            zoomW=$svg.width()*zoom*0.05;
                            zoomH=$svg.height()*zoom*0.05;
                            g.attr("transform",
                                "translate("+(-zoomW)+","+(-zoomH)+")" +	//平移量
                                "scale(" + zoom + ")");
                        }
                        break;
                    case "smaller": //缩小
                        if(zoom>0.2){
                            zoom=zoom-0.1;
                            zoomW=$svg.width()*zoom*0.05;
                            zoomH=$svg.height()*zoom*0.05;
                            g.attr("transform",
                                "translate("+zoomW+","+zoomH+")" +	//平移量
                                "scale(" + zoom + ")");
                        }
                        break;
                    case "whole": //全部
                        make_force_chart(dataset,"force");
                        break;
                    case "part": //局部
                        startBrush(brushsvg,brushXScale,brushYScale,brushForce,brushCircles,brushLines,brushNodeImg,brushTexts);
                        break;

                }
            }
        })
    });

    //更改点线样式
    var $type_type=$(".conduct .statusBar .editor .type");
    var $changeColor=$type_type.find("input.changeColor");
    var $changeSize=$type_type.find("input.changeSize");

    //改颜色
    $changeColor.change(function(){
        if($selectType==1){
            $(".forceCircle").eq($selectNodeNum).css({"fill":$(this).val(),"stroke":"none"});
        }
    });
    $changeSize.change(function(){
        var tempSize;
        if($selectType==1){
            switch (parseInt($(this).val())){
                case 1:
                    tempSize=20;
                    break;
                case 2:
                    tempSize=32;
                    break;
                case 3:
                    tempSize=48;
                    break;
            }
            $(".forceCircle").eq($selectNodeNum).attr("r",tempSize/2).css("stroke","none")
                .attr("cx",$selectNode.x)
                .attr("cy",$selectNode.y);
            $(".nodeImg").eq($selectNodeNum)
                .attr("x",$selectNode.x-tempSize/2)
                .attr("y",$selectNode.y-tempSize/2)
                .attr("width",tempSize)
                .attr("height",tempSize);
        }
    });
})