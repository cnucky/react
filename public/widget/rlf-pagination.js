define("widget/rlf-pagination", [
    "jquery",
    "underscore"
], function($, _) {
    var _opts;
    var currentPage;
    var max = 5;
    var tplPagination;

    function init(opts) {
        _opts = opts;
        max = opts.max || max;
        // $(opts.container).append('123')
        $(opts.container).append("<ul class='page-ul pagination pull-right'></ul>");
        currentPage = 1;
    }

    function renderPagination(page) {
        if (page < 1) {
            return;
        }

        var pageul = $(_opts.container).find(".page-ul");
        pageul.empty();

        // 上一页
        var tplPagePre = $("<li id='page-pre' class=''><a href=''><i class='fa fa-angle-left'></i> 上一页 </a></li>");
        if (currentPage == 1) {
            tplPagePre.attr('class', 'prev disabled');
        }
        pageul.append(tplPagePre);

        tplPagination = _.template("<li id='<%- i %>' class=''><a id='<%- i %>' href=''><%- i %></a></li>");
        var start = Math.min(Math.ceil(currentPage - max / 2), page - max + 1);
        start = Math.max(1, start);
        var end = Math.min(start + max - 1, page);
        var clickHandler = function(e) {
            currentPage = parseInt($(e.target).attr('id'));
            renderPagination(page);
            e.preventDefault();
            _opts.pageCallback(currentPage);
        };
        if (start > 1) {
            var page1 = $(tplPagination({
                i: 1
            }));
            page1.find('a#1').text(start > 2 ? '1...' : '1');
            pageul.append(page1);
            page1.on("click", clickHandler);
        }
        for (var i = start; i <= end; i++) {
            var pageLi = $(tplPagination({
                'i': i
            }));
            pageul.append(pageLi);
            if (i == currentPage) {
                pageLi.attr('class', 'active');
            }

            pageLi.on("click", clickHandler);
        }
        if (end < page) {
            var pageEnd = $(tplPagination({
                i: page
            }));
            pageEnd.find('a#' + page).text((end < page - 1) ? '...' + page : page);
            pageul.append(pageEnd);
            pageEnd.on("click", clickHandler);
        }


        // 下一页
        var tplPageNext = $("<li id='page-next' class=''><a href=javascript:void(0);> 下一页 <i class='fa fa-angle-right'></i></a></li>");
        if (currentPage == page) {
            tplPageNext.attr('class', 'next disabled');
        }
        pageul.append(tplPageNext);


        $("li#page-next").on("click", function(e) {
            currentPage += 1;
            // 特殊情况，到最后一页了，上一页下一页竟然还能点，当前页加一后再判断是否超过总页数，超过了就把 currentPage 设置成总页数
            e.preventDefault();
            if (currentPage > page) {
                currentPage = page;
                return;
            }
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
            }
            renderPagination(page);
            _opts.pageCallback(currentPage);

        });
    }


    return {
        init: init,
        renderPagination: renderPagination
    }
});
