initLocales();
require([
    '../../module/udp/udp-tree',
    'nova-dialog',
    'nova-utils',
    'tpl/leftmenu-item',
    'nova-notify',
    'nova-alert',
    'jquery',
    'utility/contextmenu/jquery.ui-contextmenu',
    // 'utility/fancytree/extensions/jquery.fancytree.edit',
    //'utility/jquery-contextmenu/jquery.contextMenu',
    // 'utility/fancytree/extensions/jquery.fancytree.contextMenu',
    "underscore",
    'utility/radialindicator/radialIndicator',
    'jquery-ui',
    'jquery.datatables',
    'datatables.bootstrap',
    'utility/datatables/datatables.select.min',
    'utility/select2/select2.min',
    'datatables.colResize'
], function(Tree, Dialog, Util, leftmenu_item, Notify, Alert) {

    hideLoader();


    var tpl_dialogcontext = _.template($('#tpl_dialogcontext').html().trim());
    var mainSelectedNode;
    var oTable;



    //生成左边栏标签目录树


    var reload_flag = false;
    var newCategary;
    $('#tag-treeview').fancytree({
        selectMode: 2,
        clickFolderMode: 1,
        autoScroll: true,
        quicksearch: true,
        source: {
            url: '/tag/tag/getCategaryTree?useCase=tagManage',
        },
        postProcess: function(event, data) {
            // console.log(data);
            if (data.response) {
                data.result = data.response.data;
            }
        },
        //fancytree的reload居然没有回调，这里设标志位和全局变量提供reload后展开新建分类结点使用
        init: function(event, data) {
            if (reload_flag) {
                setNodeActive(newCategary.categary1, newCategary.categary2);

            }
        },
        iconClass: function(event, data) {
            // if (data.node.folder == true) {
            //     return "fa fa-folder fa-fw";
            // } else {
            //     return "fa fa-tag fa-fw";
            // }
            return "fa fa-folder fa-fw";
        },
        extensions: ['edit', 'filter'],
        edit: {
            triggerCancel: ['esc', 'click'],

            save: function(event, data) {
                var tree = $('#tag-treeview').fancytree('getTree');

                newCategary = {
                    'categary1': data.node.parent.title,
                    'categary2': data.input.val()
                };
                $.post('/tag/tag/addCategary', newCategary, function(rsp) {
                    var rspParsed = JSON.parse(rsp);
                    if (rspParsed.code != 0 && rspParsed.code != null) {
                        alert('添加分类失败!');
                        return false;
                    } else if (rspParsed.data.categaryId == -1) {
                        alert('分类名称与已有分类重复!');
                         
                         newCategary = {'categary1': data.node.parent.title};
                         reload_flag = true;
                        tree.reload();





                    } else {

                        reload_flag = true;
                        tree.reload();
                        // alert('添加分类成功');
                        // Alert.show({
                        //     container: $("#alert-container"),
                        //     // alertid: "alert-check-hasattachment",
                        //     alertclass: "alert-success",
                        //     content: "<i class='fa fa-keyboard-o pr10'></i><strong>分类名称不能为空! </strong>"
                        // });
                    }
                });
            }
        },
        filter: {
            mode: "dimn",
            autoAppaly: true,
            hightlight: true
        },
        activate: function(event, data) {
            mainSelectedNode = data.node;
            oTable.ajax.reload();
        },

        //响应'nodeCommand'事件
    }).on('nodeCommand', function(event, data) {
        var tree = $(this).fancytree('getTree');
        var node = tree.getActiveNode();
        switch (data.cmd) {
            case 'addChild':
                if (node.children == undefined) {
                    node.parent.editCreateNode('child', '');
                } else {
                    node.editCreateNode('child', '');
                }

                break;
        }
    });

    //定义右键菜单项点击触发'nodeCommand'事件
    $('#tag-treeview').contextmenu({
        delegate: '.hasmenu',
        menu: [{
            title: '添加标签分类',
            cmd: 'addChild',
            uiIcon: 'my-ui-icon-plus'
        }, ],
        select: function(event, ui) {
            var that = this;
            setTimeout(function() {
                $(that).trigger('nodeCommand', {
                    cmd: ui.cmd
                });
            }, 100);
        },
        beforeOpen: function(event, ui) {
            var node = $.ui.fancytree.getNode(ui.target);
            node.setActive();
        }
    });

    //标签树搜索(过滤)逻辑
    $("input[name=search-input]").keyup(function(event) {
        var targetTree = $('#tag-treeview').fancytree('getTree');
        if (!targetTree) {
            return;
        }

        var count, opts = {
            autoExpand: true
        };
        var match = $(this).val();

        if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
            $("button#btn-reset").click();
            return;
        }
        count = targetTree.filterNodes(match, opts);

        $("button#btn-reset").attr("disabled", false);
        $("span#matches").text("(" + count + ")");
    });
    //搜索条件清除按钮
    $("button#btn-reset").click(function() {
        var targetTree = $('#tag-treeview').fancytree('getTree');
        if (!targetTree) {
            return;
        }

        $("input[name=search-input]").val("");
        $("span#matches").text("");
        targetTree.clearFilter();
        $(this).attr('disabled', 'disabled');
    });

    function setNodeActive(ca1, ca2) {

        if (ca2 != undefined) {
            $('#tag-treeview').fancytree('getTree').visit(function(node) {
                if (node.title == ca2 && node.parent.title == ca1) {
                    node.parent.setExpanded();
                    node.setActive();
                    return false;
                }
            });
        }else{
            $('#tag-treeview').fancytree('getTree').visit(function(node) {
                if (node.title == ca1 ) {
                    node.setExpanded(true);
                    return false;
                }
            });
        }

    }





    //点击新建标签，弹出新建对话框
    var dialogSelectedNode;
    $('#btn-create-tag').on('click', function() {

        Dialog.build({
            title: '新建标签',
            content: tpl_dialogcontext(),
            //对话框的确定回调函数，包括表单验证和表单提交逻辑
            rightBtnCallback: function() {
                var validate_flag = validateDialogForm();
                if (validate_flag) {
                    postDialogForm();

                }

            },
        }).show(function() {


            var curNode = $('#tag-treeview').fancytree('getTree').getActiveNode();
            var expand_flag = false;
            if (curNode != undefined && curNode.children == null) {
                $('#tag-directory').val(curNode.parent.title + ' / ' + curNode.title);
                $('#tag-directory').attr('categaryId', curNode.data.categaryId);
                $('#tag-directory').attr('categary1', curNode.parent.title);
                $('#tag-directory').attr('categary2', curNode.data.categary2);

                expand_flag = true;
            }

            //生成标签目录树
            $('#dialog-treeview').fancytree({
                //selectMode: 2,
                //clickFolderMode: 1,
                autoScroll: true,
                source: {
                    url: '/tag/tag/getCategaryTree?useCase=tagManageDialogTree',
                },
                postProcess: function(event, data) {
                    if (data.response) {
                        data.result = data.response.data;
                    }
                },
                init: function(event, data) {
                    if (expand_flag) {
                        data.tree.visit(function(node) {
                            if (node.data.categaryId == curNode.data.categaryId) {
                                node.parent.setExpanded();
                            }
                        });
                    }

                },
                iconClass: function(event, data) {
                    // if (data.node.folder == true) {
                    //     return "fa fa-folder fa-fw";
                    // } else {
                    //     return "fa fa-tag fa-fw";
                    // }
                    return "fa fa-folder fa-fw";
                },
                //点击树上结点时，绑定结点数据到文本框，收起所有被展开一级目录，隐藏树，同时消去文本框的验证错误状态
                activate: function(event, data) {
                    dialogSelectedNode = data.node;
                    if (dialogSelectedNode.children == null) {
                        $('#tag-directory').val(dialogSelectedNode.parent.title + ' / ' + dialogSelectedNode.title);
                        $('#tag-directory').attr('categaryId', dialogSelectedNode.data.categaryId);
                        $('#tag-directory').attr('categary1', dialogSelectedNode.parent.title);
                        $('#tag-directory').attr('categary2', dialogSelectedNode.data.categary2);
                        $('#dialog-treeview').fancytree('getRootNode').visit(function(node) {
                            node.setExpanded(false);
                        });



                        $('#dialog-treeview').hide('slow');
                        resumeSuccessState($('#tag-directory'));
                    }
                },

            });
        });


        function validateDialogForm() {
            var flag = true;
            if ($('#tag-directory').attr('categary1') == undefined) {
                setErrorState($('#tag-directory'));
                flag = false;
            }
            if ($('#tag-name').val() == '') {
                setErrorState($('#tag-name'));
                flag = false;
            }
            if ($('#tag-description').val() == '') {
                setErrorState($('#tag-description'));
                flag = false;
            }
            return flag;

        }



        function setErrorState(selector) {
            selector.closest('.section').addClass('has-error');
            selector.removeClass('gui-input');
            selector.removeClass('gui-textarea');
            selector.addClass('form-control');
            $('.validate-info', selector.closest('.section')).show();
            //console.log($('.validate-info',selector.closest('.section')));


        }

        function resumeSuccessState(selector) {
            selector.removeClass('form-control');
            selector.closest('.section').removeClass('has-error');
            $('.validate-info', selector.closest('.section')).hide();
            $('.validate-info-collision', selector.closest('.section')).hide();
            switch (selector.attr('id')) {
                case 'tag-directory':
                    selector.addClass('gui-input');
                    break;
                case 'tag-name':
                    selector.addClass('gui-input');
                    break;
                case 'tag-description':
                    selector.addClass('gui-textarea');
                    break;
                default:
                    break;

            }
        }

        function postDialogForm() {
            // alert('post!');
            var args = {
                'tagDisplayName': $('#tag-name').val(),
                'categary1': $('#tag-directory').attr('categary1'),
                'categary2': $('#tag-directory').attr('categary2'),
                'tagType': $('#tag-type').val(),
                'remark': $('#tag-description').val()


            };
            $.post('/tag/tag/addDataTag', args, function(rsp) {
                var rspParsed = JSON.parse(rsp);
                if (rspParsed.code != 0 && rspParsed.code != null) {
                    alert('新建标签失败!');
                } else if (rspParsed.data.dataTagId == -1) {
                    var selector = $('#tag-name');
                    selector.closest('.section').addClass('has-error');
                    selector.removeClass('gui-input');
                    selector.removeClass('gui-textarea');
                    selector.addClass('form-control');
                    $('.validate-info-collision', selector.closest('.section')).show();
                } else {
                    setNodeActive(args.categary1, args.categary2);
                    oTable.ajax.reload();
                    $.magnificPopup.close();
                }

            });
            // console.log(args);
        }

        //输入框文本改变时，取消验证错误状态
        $('#tag-name,#tag-description').change(function() {

            if ($(this).closest('.section').hasClass('has-error')) {
                resumeSuccessState($(this));
            }
        });

        //单击目录文本框弹出或收起目录树
        $('#tag-directory').on('click', function() {
            $('#dialog-treeview').toggle('slow');
        });
    });



    //build datatables

    // var tableHeight; 
    oTable = $('#tagDetailTable').DataTable({
        "bAutoWidth": false,
        'scrollX': true,
        'scrollY': 446,
        'fixedHeader': true,
        'ordering': false,
        'select': true,
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
            "sInfoEmpty": "未查询到相关的标签信息",
            "sZeroRecords": "对不起，查询不到相关标签信息",
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
            // 'url': 'getdatatablesdata',
            'url': '/tag/tag/queryDataTagInfo',
            'dataSrc': 'data.tags',
            'data': function(d) {
                var curNode = mainSelectedNode;
                if (curNode) {

                    if (curNode.children != null) {
                        if (curNode.extraClasses != undefined) {
                            d.categary1 = curNode.title;
                        }

                    } else {
                        d.categary1 = curNode.parent.title;
                        d.categary2 = curNode.data.categary2;
                    }
                }
            }
        },
        'columns': [{
                'data': 'tagId'
            }, {
                'data': 'tagDisplayName',
                // 'orderDataType':'dom-text',
                // 'type':'string',
            }, {
                'data': 'tagType'
            }, {
                'data': 'categary1'
            }, {
                'data': 'categary2'
            }, {
                'data': 'numOfEntity'
            }, {
                'data': 'numOfPerson'
            }, {
                'data': 'createTime'
            }, {
                'data': 'lastTime'
            }, {
                'data': 'createUserId'
            }, {
                'data': 'queryCount'
            },
            // {
            //     'data': 'likeCount'
            // }, 
            {
                'data': 'remark'
            }
        ],
        'columnDefs': [{
                'targets': 1,
                'searchable': true
            }, {
                'targets': '_all',
                'searchable': false
            },
            // {
            //     'targets':[7,8],
            //     'render':$.fn.dataTable.render.moment('YYYY-MM-DD hh:mm:ss','d YYYY','cn')
            // },


        ],

    });

    // $('div.dataTables_filter input').unbind();

    $("input[name=table-filter]").keyup(function(event) {
        var match = $(this).val();
        if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
            $("button#btn-table-filter-reset").click();
            return;
        }
        //响应回车
        if (event && event.which == 13) {
            $("button#btn-table-filter").click();
        }
        $("button#btn-table-filter-reset").attr("disabled", false);
    });
    $("button#btn-table-filter-reset").click(function() {
        $("input[name=table-filter]").val("");
        oTable.search($("input[name=table-filter]").val()).draw();
        $(this).attr('disabled', 'disabled');
    }).attr('disabled', 'disabled');

    $("button#btn-table-filter").click(function() {
        oTable.search($("input[name=table-filter]").val()).draw();
    });

    //工具函数，判断传入元素是否超出显示范围，即text-overflow(css style)是否为 ellipsis
    function judgeEllipsis(e) {
        if (e.offsetWidth < e.scrollWidth) {
            return true;
        } else {
            return false;
        }
    }
    $('#tagDetailTable').on('draw.dt', function() {
        $('table tr td').each(function() {
            if (judgeEllipsis($(this)[0])) {
                $(this).tooltip({
                    container: "body",
                    title: $(this).html(),
                });
            }

        });
    });

    // $(document).ready(function() {
    //     console.log(document.getElementsByClassName("navbar navbar-fixed-top").item(0).offsetHeight);
    //     console.log(document.getElementById("topbar").offsetHeight);
    //     console.log(window.innerHeight);

    //     console.log(document.querySelectorAll('div.dt-panelfooter.clearfix'));

    // });

});