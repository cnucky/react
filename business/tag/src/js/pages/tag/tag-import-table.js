initLocales();
require([
    'jquery.datatables',
    'datatables.bootstrap',
    'utility/datatables/datatables.select.min',
    'utility/select2/select2.min',
    'datatables.colResize'
], function() {
    
    $('#btn-create-task').click(function() {
        window.location.href = 'tag-import.html';
    });
    var oTable;
    setTimeout(function() {
        oTable = $('#taskDetailTable').DataTable({
            "bAutoWidth": false,
            'scrollX': true,
            'fixedHeader': true,
            'ordering': false,
            'select':true,

            // 'aaSorting': [
            //     [0, 'desc']
            // ],
            // "aoColumnDefs": [{
            //  "sDefaultContent":"",
            //  "aTargets":-1
            // }],
            "oLanguage": {
                // "sProcessing": "正在加载任务信息...",
                "sLengthMenu": "每页显示_MENU_条记录",
                "sInfo": "当前显示_START_到_END_条，共_TOTAL_条记录",
                "sInfoEmpty": "未查询到相关的任务信息",
                "sZeroRecords": "对不起，查询不到相关任务信息",
                "sInfoFiltered": "",
                "sSearch": "搜索",
                "oPaginate": {
                    "sPrevious": "前一页",
                    "sNext": "后一页"
                }
            },
            "bPaginate": true,
            "iDisplayLength": 12,
            'bLengthChange': false,
            // "aLengthMenu": [
            //     [5, 10, 25, 50, -1],
            //     [5, 10, 25, 50, "All"]
            // ],
            // "sDom": 'frtlp',
            "sDom": '<"clearfix"r>Zt<"dt-panelfooter clearfix"lp>',
            'colResize': {
                'tableWidthFixed': false,
            },


            'serverSide': true,
            'ajax': {
                'url': '/tag/tag/getImportTaskInfo',
                'dataSrc': 'data.tasks',
                // 'data': function(d) {

                // }
            },
            'columns': [{
                'data': 'taskName'
            }, {
                'data': 'userId',

            }, {
                'data': 'importTime'
            }, {
                'data': 'entityType'
            }, {
                'data': 'entityNum'
            }, {
                'data': 'dataTagType'
            }, {
                'data': 'taskStatus'
            }, {
                'data': 'remark'
            }],
            'columnDefs': [
                //{
                //     'targets': 1,
                //     'searchable': true
                // }, {
                //     'targets': '_all',
                //     'searchable': false
                // },
                // {
                //     'targets':[7,8],
                //     'render':$.fn.dataTable.render.moment('YYYY-MM-DD hh:mm:ss','d YYYY','cn')
                // },


            ],

        });
        $('#btn-refresh').click(function(){
            oTable.ajax.reload();
        });

    }, 400);


    //工具函数，判断传入元素是否超出显示范围，即text-overflow(css style)是否为 ellipsis
    function judgeEllipsis(e) {
        if (e.offsetWidth < e.scrollWidth) {
            return true;
        } else {
            return false;
        }
    }
    $('#taskDetailTable').on('draw.dt', function() {
        $('table tr td').each(function() {
            if (judgeEllipsis($(this)[0])) {
                $(this).tooltip({
                    container: "body",
                    title: $(this).html(),
                });
            }

        });
    });
    hideLoader();

});