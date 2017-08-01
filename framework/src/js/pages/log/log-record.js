initLocales();
require([
    'nova-dialog',
    'nova-utils',
    'nova-notify',
    'nova-alert',
    'utility/udp/dropzone',
    'utility/FileSaver/FileSaver',
    'moment',
    //'../../../../config',
    'jquery',
    'jquery.datatables',
    'utility/datatables/datatables.select.min',
], function(Dialog, Util, Notify, Alert, Dropzone, FileHelper, moment//Config
    ) {
    var Config =  window.__CONF__.framework;
    hideLoader();
    var uploadBaTablePath = Config['uploadBaTablePath'];

    $("[data-toggle='page-tooltip']").tooltip({
        container: "body",
    });
    var logGroup1 = [];
    var logGroup2 = [];
    var selectedLogs = [];

    var tableData = [{
        taskName: '',
        logId: '',
        taskType: '',
        state: '',
        uploadPath: ''
    }];
    var btnSelState = false;

    loadTable();

    var oTable = $('#log-record-table').DataTable({
        "bAutoWidth": false,
        'scrollX': true,
        'scrollY': 446,
        'fixedHeader': true,
        'ordering': false,
        'stateSave': true,
        "oLanguage": {
            "sLengthMenu": "每页显示_MENU_条记录",
            "sInfo": "当前显示_START_到_END_条，共_TOTAL_条记录",
            "sInfoEmpty": "未查询到相关的日志信息",
            "sZeroRecords": "对不起，查询不到相关日志信息",
            "sInfoFiltered": "",
            "sSearch": "搜索",
            "oPaginate": {
                "sPrevious": "前一页",
                "sNext": "后一页"
            }
        },
        "bPaginate": false,
        'bLengthChange': false,
        "sDom": '<"clearfix"r>Zt<"dt-panelfooter clearfix"lp>',
        'colResize': {
            'tableWidthFixed': false,
        },
        data: tableData,
        'columns': [{
                'title': '#',
                'data': function(row, type, val, meta) {
                    return meta.row + 1;
                },
                'width': 50

            }, {
                'title': '选中',
                'data': function(row, type, val, meta) {
                    return '<div class="checkbox-in-table" data-log-id="' + row.logId + '" data-state="' + row.state + '" data-upload-path="' + row.uploadPath + '"></div>';
                },
            }, {
                'title': '任务名称',
                'data': 'taskName'
            }, {
                'title': '任务类型',
                'data': 'taskType',
            }, {
                'title': '任务状态',
                'data': function(row, type, val, meta) {
                    var badgeClass = '';
                    var context = '';
                    switch (row.state) {
                        case 0:
                            badgeClass = 'default';
                            context = '未备案';
                            break;
                        case 1:
                            badgeClass = 'warning';
                            context = '待上传';
                            break;
                        case 2:
                            badgeClass = 'success';
                            context = '已备案';
                            break;
                        default:
                            break;
                    }
                    return '<div class="label badge-' + badgeClass + '">' + context + '</div>';
                },
            },
        ],
        'columnDefs': [{
                'targets': 1,
                'searchable': true
            }, {
                'targets': '_all',
                'searchable': false
            },
        ],
    });


    $('#btn-gen').on('click', function() {
        var logIds = [];
        for (var i = 0; i < selectedLogs.length; i++) {
            logIds.push(selectedLogs[i].logId);
        }

        $.getJSON('/log/createBaTable', {
            logIds: logIds
        }).done(function(rsp) {
            console.log(rsp);
            if (rsp.code != 0) {
                Notify.show({
                    title: "生成备案文档出错！",
                    type: "error"
                });

            } else {
                console.log(rsp.data);

                var url = rsp.data;
                var urlObj = parseUrl(url);
                console.log(urlObj);
                // $('#hidden-link').attr('href','/udp/downloadFile?filePath='+urlObj.path+'&fileName='+urlObj.fileName);
                // $('#hidden-link').attr('download',urlObj.fileName);
                // $('#trigger-click').trigger('click');
                window.location.href = '/log/downloadFile?filePath=' + urlObj.path + '&fileName=' + urlObj.fileName;

                // var pattern = //;
                loadTable();
            }
        });
    });
    $('#btn-sel').on('click', function() {
        if (!btnSelState) {
            $('#btn-sel span.sel').html('全不选');
            btnSelState = true;
            $('#log-record-table tr').each(function(e) {
                if (!$(this).hasClass('checkbox-checked')) {
                    $(this).find('.checkbox-in-table').trigger('click');
                }
            });
        } else {
            $('#btn-sel span.sel').html('全选');
            btnSelState = false;
            $('#log-record-table tr').each(function(e) {
                if ($(this).hasClass('checkbox-checked')) {
                    $(this).find('.checkbox-in-table').trigger('click');
                }
            });
        }
    });


    function loadTable() {
        $.getJSON('/log/getAllBaTasks', function(rsp) {
            if (rsp.code != 0) {
                Notify.show({
                    title: "获取日志信息出错!",
                    type: "error"
                });

            } else {
                if (rsp.data.length == 0) {
                    // $('#log-record-table').dataTable().fnClearTable();
                    $('#log-record-table').dataTable().fnClearTable();
                    tableData = [];

                } else {
                    tableData = rsp.data;
                    refreshTable(tableData);
                    bindMenu();


                }
            }


        });

    };

    function refreshTable(data) {
        $('#log-record-table').dataTable().fnClearTable();
        if (data.length > 0) {
            $('#log-record-table').dataTable().fnAddData(data);
        }
        bindCheckbox();
        if (btnSelState) {
            selectedLogs = [];
            btnSelState = false;
            $('#btn-sel span.sel').html('全选');
        }

    }

    function bindMenu() {
        genGroup();
        appendItems();
        calAmount();
        bindMenuClick();
    };

    function genGroup() {
        logGroup1 = [];
        logGroup2 = [];
        var group1 = _.groupBy(tableData, 'uploadPath');
        for (key in group1) {
            if (key != '' && group1[key][0].state == 1) {
                logGroup1.push(key);
            }
            if (key != '' && group1[key][0].state == 2) {
                logGroup2.push(key);
            }
        }
    };

    function appendItems() {
        $('#waiting-for-upload li').remove();
        $('#recorded li').remove();
        for (var i = 0; i < logGroup1.length; i++) {
            var tpl = '<li data-name="' + logGroup1[i] + '">' + namefilter(logGroup1[i]) + '</li>';
            $('#waiting-for-upload').append(tpl);

        }

        for (var i = 0; i < logGroup2.length; i++) {
            var tpl = '<li data-name="' + logGroup2[i] + '">' + namefilter(logGroup2[i]) + '</li>';
            $('#recorded').append(tpl);

        }

    }

    function namefilter(name) {
        var result = '';
        var fileName = parseUrl(name).fileName;
        if (fileName != undefined) {
            if (fileName.length == 18) {
                result = fileName.slice(0, 4) + '-' + fileName.slice(4, 6) + '-' + fileName.slice(6, 8) + ' ' + fileName.slice(8, 10) + ':' + fileName.slice(10, 12) + ':' + fileName.slice(12, 14);
            }
        }
        return result;
    }

    function calAmount() {
        $('#waiting-for-upload span.badge').html(logGroup1.length);
        $('#recorded span.badge').html(logGroup2.length);
        var countNR = 0;

        for (var i = 0; i < tableData.length; i++) {
            if (tableData[i].state == 0) {
                countNR++;
            }
        }
        $('#not-recorded span.badge').html(countNR);
    }

    function bindMenuClick() {
        $('ul.my-nav').unbind();
        $('ul.my-nav').click(function() {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).children('li').hide();
                filterState('cancelFilter');
            } else {
                $('ul.my-nav').removeClass('active');
                $('ul.my-nav li').hide();
                $(this).addClass('active');

                $(this).children('li').show();
                $(this).children('li').removeClass('active');

                filterState($(this).attr('data-state'));
            }
            if (btnSelState) {
                selectedLogs = [];
                btnSelState = false;
                $('#btn-sel span.sel').html('全选');
            }

        });
        $('ul.my-nav li').click(function(e) {

            e.stopPropagation();
            $('ul.my-nav').removeClass('active');
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                filterState('cancelFilter');
                if (btnSelState) {
                    selectedLogs = [];
                    btnSelState = false;
                    $('#btn-sel span.sel').html('全选');
                }
            } else {
                $(this).siblings('li').removeClass('active');
                $(this).addClass('active');
                filterGroupByName($(this).attr('data-name'));
                if (btnSelState) {
                    $('#btn-sel').trigger('click');
                }
                $('#btn-sel').trigger('click');

            }
        })
    };

    function bindCheckbox() {
        selectedLogs = [];
        $('#btn-gen').attr('disabled', 'disabled');
        $('#btn-upload').attr('disabled', 'disabled');
        $('.checkbox-in-table').on('click', function() {
            var that = this;
            var parentTr = $(that).closest('tr');

            if (parentTr.hasClass('checkbox-checked')) {
                parentTr.removeClass('checkbox-checked');

                selectedLogs = _.reject(selectedLogs, function(v) {
                    return v.logId == $(that).attr('data-log-id');
                });
            } else {
                parentTr.addClass('checkbox-checked');
                selectedLogs.push({
                    logId: $(that).attr('data-log-id'),
                    state: $(that).attr('data-state'),
                    uploadPath: $(that).attr('data-upload-path')
                });
            }
            checkButtonState();
            // console.log(selectedLogs);
        });
    };

    function checkButtonState() {
        if (selectedLogs.length == 0) {
            $('#btn-gen').attr('disabled', 'disabled');
            $('#btn-upload').attr('disabled', 'disabled');
        } else {
            var stateCollisionFlag = false;
            var pathCollisionFlag = false;
            var firstState = selectedLogs[0].state;
            var firstUploadPath = selectedLogs[0].uploadPath;
            for (var i = 1; i < selectedLogs.length; i++) {
                if (selectedLogs[i].state != firstState) {
                    stateCollisionFlag = true;
                    break;
                }
                if (selectedLogs[i].uploadPath != firstUploadPath) {
                    pathCollisionFlag = true;
                }
            }
            if (stateCollisionFlag) {
                $('#btn-gen').attr('disabled', 'disabled');
                $('#btn-upload').attr('disabled', 'disabled');
            } else {
                switch (firstState) {
                    case '0':
                        $('#btn-gen').removeAttr('disabled');
                        $('#btn-upload').attr('disabled', 'disabled');
                        break;
                    case '1':
                        $('#btn-gen').attr('disabled', 'disabled');
                        if (!pathCollisionFlag) {
                            $('#btn-upload').removeAttr('disabled');
                        } else {
                            $('#btn-upload').attr('disabled', 'disabled');
                        }

                        break;
                    case '2':
                        $('#btn-gen').attr('disabled', 'disabled');
                        if (!pathCollisionFlag) {
                            $('#btn-upload').removeAttr('disabled');
                        } else {
                            $('#btn-upload').attr('disabled', 'disabled');
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    };

    function filterState(state) {
        if (state == 'cancelFilter') {
            refreshTable(tableData);
        } else {
            if (tableData.length > 0) {
                var filteredData = _.filter(tableData, function(td) {
                    return parseInt(state) == td.state;
                });
                refreshTable(filteredData);
            }
        }
    };

    function filterGroupByName(name) {
        var filteredData = _.filter(tableData, function(td) {
            return name == td.uploadPath;
        });
        refreshTable(filteredData);
    };

    var files = [];
    var myDropzone;
    uploadFile();

    function uploadFile() {
        var tpl = _.template($('#preview-tpl').html().trim());
        var tpl_html = $(tpl());
        $('#previews').append(tpl_html);

        // Get the template HTML and remove it from the doument
        var previewNode = document.querySelector("#template");
        // previewNode.id = "";
        var previewTemplate = previewNode.parentNode.innerHTML;
        previewNode.parentNode.removeChild(previewNode);

        // var uploadDir = uploadBaTablePath;
        myDropzone = new Dropzone("#previews", {
            url: "/log/uploadFile?uploadDir=" + encodeURIComponent(uploadBaTablePath), // Set the url-
            parallelUploads: 5,
            maxFiles: 1,
            maxFilesize: 1024,
            acceptedFiles: ".doc",
            previewTemplate: previewTemplate,
            autoQueue: false, // Make sure the files aren't queued until manually added
            previewsContainer: "#previews", // Define the container to display the previews
            clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
        });
        // myDropzone.on('processing',function(file){
        //     uploadDir = selectedLogs[0].uploadPath;
        //     myDropzone.options.url = "/udp/uploadFile?uploadDir=" + encodeURIComponent(uploadDir);
        // });

        myDropzone.on("addedfile", function(file) {
            $("#btn-upload").attr("disabled", true);
            $('#canceled').on('click', function() {
                loadTable();
            });
            // Hookup the start button
            file.previewElement.querySelector(".start").onclick = function() {
                $("#btn-upload").attr("disabled", true);
                myDropzone.enqueueFile(file);
            };
        });

        // Update the total progress bar
        myDropzone.on("totaluploadprogress", function(progress) {
            // document.querySelector("#total-progress .progress-bar").style.width = progress + "%";
        });

        myDropzone.on("sending", function(file) {
            // Show the total progress bar when upload starts
            // document.querySelector("#total-progress").style.opacity = "1";
            // And disable the start button
            file.previewElement.querySelector(".start").setAttribute("disabled", "disabled");
        });

        myDropzone.on("success", function(file, res) {
            data = JSON.parse(res);
            if (data) {
                fileSize = data.fileSize / 1024;
                fileSize = fileSize.toFixed(0) == 0 ? 1 : fileSize;
                file = {
                    documentName: data.newName,
                    documentSize: fileSize
                };
                files.push(file);
            }

            var logIds = [];
            for (var i = 0; i < selectedLogs.length; i++) {
                logIds.push(selectedLogs[i].logId);
            }

            var fileName = parseUrl(selectedLogs[0].uploadPath).fileName;
            $.post('/log/uploadBaTable', {
                logIds: logIds,
                fileName: data.newName
            }).done(function(rsp) {
                console.log(rsp);
                loadTable();
                myDropzone.destroy();
                uploadFile();
            });

        });

        // Hide the total progress bar when nothing's uploading anymore
        myDropzone.on("queuecomplete", function(progress) {
            // document.querySelector("#total-progress").style.opacity = "0";
        });
    }

    function parseUrl(url) {
        var fileName;
        var pattern = /\w+\.doc$/;
        var index = url.search(pattern);
        fileName = url.slice(index, url.length);
        return {
            fileName: fileName,
            path: url
        };
    };


});