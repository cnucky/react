define("udp/udp-pagination", [
    "jquery",
    "underscore",
], function() {
    var _opts;
    var currentPage;
    var max = 5;
    var tplPagination;
    var pagerLength = undefined;
    var totalRecords;

    function init(opts) {
        _opts = opts;
        console.log('in init')
        console.log(opts)
        
        // if(_opts.pagerLengthAlterable == true){
        //     $(opts.container).append("<div class='dataTables_length' id='pager_length'><label>每页显示<select name='pager_length' aria-controls='pager_length' id='pager_length_options' class='form-control input-sm'><option value='10'>10</option><option value='15'>15</option><option value='30'>30</option><option value='50'>50</option><option value='100'>100</option></select>条数据</label></div>");
        //     if(_opts.pagerLengthOptions && _opts.pagerLengthOptions.length>0 ){
        //         $('#pager_length_options').empty();
        //         _.each(_opts.pagerLengthOptions,function(v){
        //             $('#pager_length_options').append('<option value="'+v+'">'+v+'</option>')
        //         })
        //     }
        // }
        $(opts.container).append("<ul id='page-ul' class='pagination pull-right></ul>");
        currentPage = 1;

        // if(_opts.pagerLengthAlterable == true && _opts.totalRecords!=undefined){
        //     $('#pager_length_options').on('change', function(e) {
            
        //     var l = parseInt($(this).val());
        //     pagerLength = l;
        //     var AlteredPages = Math.ceil(totalRecords/l)
        //     renderPagination(AlteredPages)
            
        // })
        // }
        
    }

    function renderPagination(page) {
        if (page < 0) {
            return;
        };
        page = page == 0?1:page;
        var pageul = $("#page-ul");
        pageul.empty();
        
        // 上一页
        var tplPagePre = $("<li id='page-pre' class=''><a href=''><i class='fa fa-angle-left'></i> 上一页 </a></li>");
        if(currentPage == 1) {
            tplPagePre.attr('class', 'prev disabled');
        };
        pageul.append(tplPagePre);

        tplPagination = _.template("<li id='<%- i %>' class=''><a id='<%- i %>' href=''><%- i %></a></li>");
        var start = Math.min(Math.ceil(currentPage-max/2),page-max+1);
        start = Math.max(1, start);
        var end = Math.min(start+max-1,page);
        var clickHandler = function(e) {
                currentPage = parseInt($(e.target).attr('id'));
                
                renderPagination(page);
                e.preventDefault();
                _opts.pageCallback(currentPage);
            };
        if(start > 1) {
            var page1 = $(tplPagination({i:1}));
            page1.find('a#1').text(start>2?'1...':'1');
            pageul.append(page1);
            page1.on("click", clickHandler);
        }
        for(var i = start; i <= end; i++) {
            var pageLi = $(tplPagination({'i': i}));
            pageul.append(pageLi);
            if(i == currentPage) {
                pageLi.attr('class', 'active');
            }

            pageLi.on("click", clickHandler);
        }
        if(end < page) {
            var pageEnd = $(tplPagination({i:page}));
            pageEnd.find('a#'+page).text((end<page-1)?'...'+page:page);
            pageul.append(pageEnd);
            pageEnd.on("click", clickHandler);
        }

        
        // 下一页
        var tplPageNext = $("<li id='page-next' class=''><a href=javascript:void(0);> 下一页 <i class='fa fa-angle-right'></i></a></li>");
        if(currentPage == page) {
            tplPageNext.attr('class', 'next disabled');
        };
        pageul.append(tplPageNext);

        
        $("li#page-next").on("click", function(e) {
            currentPage += 1;
            // 特殊情况，到最后一页了，上一页下一页竟然还能点，当前页加一后再判断是否超过总页数，超过了就把 currentPage 设置成总页数
            e.preventDefault();
            if (currentPage > page) {
                currentPage = page;
                return;
            };
            renderPagination(page);

            _opts.pageCallback(currentPage);        

        });

        $("li#page-pre").on("click", function(e) {
            currentPage -= 1;
            // 上一页点击，当前页减一后如果小于一，就把当前页设置回第一页
            e.preventDefault();
            if (currentPage < 1) {
                currentPage = 1;
                return;
            };
            renderPagination(page);
            _opts.pageCallback(currentPage);

        });




    }

    function setCurPage(page){
        currentPage = page;
    }

    function setTotalRecords(t){
        totalRecords = t;
    }


    return {
        init: init,
        renderPagination: renderPagination,
        setCurPage : setCurPage,
        setTotalRecords : setTotalRecords
    }
});
