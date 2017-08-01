define([], function() {
    function nowrap($table, tipCallback, isHtml) {
        $table.addClass("table-nowrap");
        if($table.css("table-layout") !== "fixed"){
            var css = "table.table-nowrap" +
                "{ table-layout: fixed; }" +
                "table.table-nowrap >thead >tr >th, table.table-nowrap >tbody >tr >td" +
                "{ white-space: nowrap; overflow-x: hidden; text-overflow: ellipsis; }" +
                "table >tbody >tr >td.td-child" +
                "{ overflow-x: visible; }";
            $table.parents("body").siblings("head").append("<style>" + css + "</style>");
        }
        $table.children().children("tr").children(":not(.td-child)").each(function() {
            if (this.clientWidth < this.scrollWidth) {
                $(this).tooltip({
                    title : tipCallback ? tipCallback($(this)) : $(this).text(),
                    html : isHtml,
                    container : $table.parents("body"),
                    placement : "auto"
                });
            }
        });
    }
    
    function parseQuery() {
        var args = {}
        var search = window.location.search.substring(1);
        var pairs = search.split("&");
        for (var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf("=")
            if (pos == -1) continue;
            var key = pairs[i].substring(0, pos);
            var value = pairs[i].substring(pos + 1);
            value = decodeURIComponent(value);
            args[key] = value;
        }
        return args;
    }
    function buildQuery(obj) {
        for(var key in obj){
            if(obj[key] == undefined || obj[key] == null || obj[key] == NaN)
                delete obj[key]
        }
        return _.map(Object.keys(obj), function(key){
            return key + "=" + encodeURIComponent(obj[key]);
        }).join("&");
    }

    function daterange($container, start, end){
        var opt = {
            autoApply: true,
            autoUpdateInput: false,
            locale: {
                format: "YYYY-MM-DD",
                cancelLabel: "Clear"
            }
        };
        if(start && end){
            opt.startDate = start;
            opt.endDate = end;
        }
        $container.daterangepicker(opt);
        $container.on("apply.daterangepicker", function(ev, picker){
            $(this).val(picker.startDate.format("YYYY-MM-DD") + " ~ " + picker.endDate.format("YYYY-MM-DD"));
        });
        $container.on("cancel.daterangepicker", function(ev, picker){
            $(this).val("");
        });
        if(start && end)
            $container.val(start + " ~ " + end);
    }

    function showLoader(){
        var $ = window.top.$;
        if($("#utility-screen-loader").length === 0){
            var html = "<div id='utility-screen-loader'>" +
                            "<div class='loader-inner line-scale'>" +
                                "<div></div>" +
                                "<div></div>" +
                                "<div></div>" +
                                "<div></div>" +
                                "<div></div>" +
                            "</div>" +
                        "</div>";
            $("body").append(html);
            $("#utility-screen-loader").css({
                "position": "fixed",
                "z-index": "1050", //bigger than magnific popup
                "width": "100%",
                "height": "100%",
                "left": "0",
                "top": "0",
                "background-color": "rgba(0, 0, 0, 0.15)",
                "display": "none",
            });
            $("#utility-screen-loader>.loader-inner").css({
                "position": "absolute",
                "top": "45%",
                "left": "50%",
                "margin-left": "-25px",
            });
        }
        $("#utility-screen-loader").show();
    }

    function hideLoader(){
        window.top.$("#utility-screen-loader").hide();
    }

    return {
        nowrap : nowrap,
        parseQuery : parseQuery,
        buildQuery: buildQuery,
        daterange: daterange,
        showLoader: showLoader,
        hideLoader: hideLoader,
    }
})