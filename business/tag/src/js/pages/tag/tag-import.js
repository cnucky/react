initLocales();
require(['../../tpl/tag/dropdown-tag-meta',
    'moment',
    'udp-file-util',
    'nova-dialog',
    'nova-alert',
    'nova-notify',
    '../../../../utils/util',
    'utility/udp/dropzone',
    'utility/select2/select2',
    'utility/select2/i18n/zh-CN',
    'jquery.datatables',
    'jquery.validate'
], function(tpl_tagMeta, moment, fileUtil, Dialog, Alert, Notify, Util, Dropzone) {
    hideLoader();

    //tpl_tagMeta = _.template(tpl_tagMeta);

    $('#delimiter').select2({
        language: 'zh-CN',
        allowClear: false,
        minimumResultsForSearch: Infinity,
        data: [{
            id: 1,
            text: 'TAB'
        }, {
            id: 2,
            text: '分号'
        }, {
            id: 3,
            text: '空格'
        }, {
            id: 4,
            text: '逗号'
        }, {
            id: '__other__',
            text: '其他'
        }]
    });


    var viewSize = 8 * 5000 * 100;

    $('#delimiter').on('select2:select', function(event) {
        // var file = document.getElementById("selectFile").files[0];
        if ($(this).val() == '__other__') {
            $('#otherDelimiter').show();
            $('#previewTable').html("");
            $('#preview').on('click', function(event) {
                event.preventDefault();

                var viewText = selectedFile.slice(0, viewSize);
                var read = new FileReader();
                //ecoding = getparams.getfileEncoding();
                read.readAsText(selectedFile, "UTF-8");
                read.onload = function(e) {
                    textContent = this.result;
                    isFirstRowHead = false;
                    colSplit = getColSplit();
                    previewFile();
                }

            })

        } else {
            $('#otherDelimiter').hide();

            var viewText = selectedFile.slice(0, viewSize);
            var read = new FileReader();
            //ecoding = getparams.getfileEncoding();

            read.readAsText(selectedFile, 'UTF-8'); //, "GB2312");
            read.onload = function(e) {
                textContent = this.result;
                isFirstRowHead = false;
                colSplit = getColSplit();
                previewFile();
            }

        }

    });

    function setTypeHeader(previewTable, colNum) {

        curRow = previewTable.insertRow(0);
        var offSet = 2;
        for (var i = 0; i < colNum; ++i) {
            var colHead = '请选择标签';
            if (i == 0) {
                colHead = '请选择实体';
            }
            cell = curRow.insertCell();
            var htmlStr = '<a data-container="body" data-toggle="popover" data-placement="top" id="' + i + '" >';

            htmlStr += '<span key=-1><' + colHead + '></span>';
            htmlStr += ' </a>';

            cell.innerHTML = htmlStr;

        }
        $('[data-toggle="popover"]').each(function(item) {

            if (item == 0) {

                $(this).on('click', function() {
                    Dialog.build({
                        title: '设置实体类型',
                        content: '<div id="tag-picker"></div>',
                        rightBtnCallback: function() {
                            var tagNode = $("#tag-picker").fancytree("getTree").getActiveNode();
                            if (!tagNode.folder) {
                                $('#' + item + ' span').attr('key', tagNode.data.id);
                                $('#' + item + ' span').empty().text(tagNode.title);
                                $('#removeColumn' + item).remove();
                                $('#' + item).after('<label id="removeColumn' + item + '" style="cursor:pointer" class="fa fa-remove"></label>');
                                $('#removeColumn' + item).on('click', function(event) {
                                    event.preventDefault();
                                    $('#' + item + ' span').attr('key', '-1');
                                    $('#' + item + ' span').empty().text('<请选择实体>');
                                })
                            }
                            $.magnificPopup.close();
                        }
                    }).show(function() {

                        $('#tag-picker').fancytree({
                            autoScroll: true,
                            quicksearch: true,
                            source: {
                                url: '/tag/tag/getEntityType'
                            },
                            init: function(event, data) {},
                            iconClass: function(event, data) {
                                if (data.node.folder == true) {
                                    return "fa fa-folder fa-fw";
                                } else {
                                    return "fa fa-tag fa-fw";
                                }
                            },
                            lazyLoad: function(event, data) {

                            },
                            postProcess: function(event, data) {
                                if (data.response) {
                                    data.result = data.response.data;
                                }
                            },
                            extensions: ['edit', 'filter'],
                            edit: {
                                close: function(event, data) {
                                    alert('close edit!');
                                    //post operation
                                }
                            },
                            filter: {
                                mode: "dimn",
                                autoAppaly: true,
                                hightlight: true
                            },
                        });
                    });

                })

            } else {
                $(this).on('click', function() {
                    Dialog.build({
                        title: '设置标签名',
                        content: '<div class="center fancytree-filter">' + '<input style="margin-right:20px;width:220px" name="filter-input" class="tree-filter-input" placeholder="过滤...">' + '<button id="btn-clear-filter" style="height:25px;" class="btn btn-xs btn-primary" disabled>清除<span id="matches"></span></button>' + '</div>' + '<div id="tag-picker"></div>',

                        rightBtnCallback: function() {
                            var tagNode = $("#tag-picker").fancytree("getTree").getActiveNode();
                            if (!tagNode.folder) {
                                $('#' + item + ' span').attr('key', tagNode.data.tagId);
                                $('#' + item + ' span').empty().text(tagNode.title);
                                $('#removeColumn' + item).remove();
                                $('#' + item).after('<label id="removeColumn' + item + '" style="cursor:pointer" class="fa fa-remove"></label>');
                                $('#removeColumn' + item).on('click', function(event) {
                                    event.preventDefault();
                                    $('#' + item + ' span').attr('key', '-1');
                                    $('#' + item + ' span').empty().text('<请选择标签>');
                                })
                            }
                            $.magnificPopup.close();
                        }
                    }).show(function() {

                        /*edit by huangjingwei BEGIN*/

                        $('#tag-picker').fancytree({
                            autoScroll: true,
                            quicksearch: true,
                            source: {
                                url: '/tag/tag/getTagTree'
                            },
                            init: function(event, data) {},
                            iconClass: function(event, data) {
                                if (data.node.folder == true) {
                                    return "fa fa-folder fa-fw";
                                } else {
                                    return "fa fa-tag fa-fw";
                                }
                            },
                            // lazyLoad: function(event, data) {
                            //     data.result = {
                            //         url: "/tag/queryTags",
                            //         data: {
                            //             categary1: data.node.parent.title,
                            //             categary2: data.node.data.categary2,
                            //             start: 0,
                            //             length: 1000,
                            //         }
                            //     };
                            // },
                            postProcess: function(event, data) {
                                if (data.response) {
                                    data.result = data.response.data;
                                }
                            },
                            extensions: ['edit', 'filter'],
                            edit: {
                                close: function(event, data) {
                                    alert('close edit!');
                                    //post operation
                                }
                            },
                            filter: {
                                mode: "dimn",
                                autoAppaly: true,
                                hightlight: true
                            },
                        });


                        $("input[name=filter-input]").keyup(function(event) {
                            var targetTree = $('#tag-picker').fancytree('getTree');
                            if (!targetTree) {
                                return;
                            }

                            var count, opts = {
                                autoExpand: true
                            };
                            var match = $(this).val();

                            if (event && event.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                                $("button#btn-clear-filter").click();
                                return;
                            }
                            count = targetTree.filterNodes(match, opts);

                            $("button#btn-clear-filter").attr("disabled", false);
                            $("span#matches").text("(" + count + ")");
                        });
                        //搜索条件清除按钮
                        $("button#btn-clear-filter").click(function() {
                            var targetTree = $('#tag-picker').fancytree('getTree');
                            if (!targetTree) {
                                return;
                            }

                            $("input[name=filter-input]").val("");
                            $("span#matches").text("");
                            targetTree.clearFilter();
                            $(this).attr('disabled', 'disabled');
                        });

                        /*edit by huangjingwei END*/
                    });

                })
            }


        })
    }

    function getColSplit() {
        var coldelimiter = $('#delimiter').val();
        switch (coldelimiter) {
            case "1":
                return "\t";
                break;
            case "2":
                return ";";
                break;
            case "3":
                return " ";
                break;
            case "4":
                return ",";
                break;
            case "__other__":
                if ($("#checkboxInput").is(":checked")) {
                    return hexToString($('#customDelimiter').val().trim());
                } else {
                    return $('#customDelimiter').val();
                }
                break;

            default:
                return;
        }
        return;
    }

    function hexToString(str) {
        var val = "";
        for (var i = 0; i < str.length; i += 2) {
            val += String.fromCharCode(parseInt(str.substring(i, i + 2), 16));
        }
        //.charAt(i);//fromCharCode(i);

        return val;
    }

    var fileLength;

    function previewFile() {
        var previewTable = document.getElementById("previewTable");
        preViewText = "";


        fileLength = textContent.split('\n').length - 1;
        var rowArray = textContent.split('\n', 10);

        for (var i = previewTable.rows.length - 1; i >= 0; --i)
            previewTable.deleteRow(i);
        colNum = 0;
        for (var i = 0; i < rowArray.length - 1; ++i) {

            colArray = rowArray[i].replace('\r', '').split(colSplit, 500);

            curRow = previewTable.insertRow();
            if (colNum < colArray.length)
                colNum = colArray.length;
            for (var j = 0; j < colArray.length; ++j) {
                cell = curRow.insertCell();
                cell.innerHTML = colArray[j];
            }
        }
        if (!isFirstRowHead) {
            setTypeHeader(previewTable, colArray.length);
        }


    }

    var files = [];
    var srcFileDir;
    var myDropzone;
    $.get('/tag/tag/makeDirSync', function(rsp) {
        uploadFile(rsp);
    });

    var selectedFile;

    function uploadFile(rsp) {
        // Get the template HTML and remove it from the doument
        var previewNode = document.querySelector("#template");
        // previewNode.id = "";
        var previewTemplate = previewNode.parentNode.innerHTML;
        previewNode.parentNode.removeChild(previewNode);

        uploadDir = rsp;
        myDropzone = new Dropzone("#previews", {
            url: "/tag/tag/uploadFile?uploadDir=" + encodeURIComponent(uploadDir), // Set the url-
            parallelUploads: 5,
            maxFiles: 1,
            maxThumbnailFilesize: 1,
            maxFilesize: 1024,
            acceptedFiles: "",
            previewTemplate: previewTemplate,
            autoQueue: false, // Make sure the files aren't queued until manually added
            previewsContainer: "#previews", // Define the container to display the previews
            clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
        });

        myDropzone.on("addedfile", function(file) {

            $('#selectFile').val(file.name)
            if (myDropzone.files.length > 1) {
                myDropzone.removeFile(myDropzone.files[0]);
            }
            selectedFile = file;

            var viewText = selectedFile.slice(0, viewSize);
            var read = new FileReader();
            //ecoding = getparams.getfileEncoding();

            read.readAsText(selectedFile, "UTF-8");
            read.onload = function(e) {
                    textContent = this.result;
                    isFirstRowHead = false;
                    colSplit = getColSplit();
                    previewFile();
                }
                // Hookup the start button
            file.previewElement.querySelector(".start").onclick = function() {
                $("#selectFile").attr("disabled", true);
                myDropzone.enqueueFile(file);
            };
        });


        // Update the total progress bar
        myDropzone.on("totaluploadprogress", function(progress) {
            document.querySelector("#total-progress .progress-bar").style.width = progress + "%";
        });

        myDropzone.on("sending", function(file) {
            // Show the total progress bar when upload starts
            document.querySelector("#total-progress").style.opacity = "1";
            // And disable the start button
            file.previewElement.querySelector(".start").setAttribute("disabled", "disabled");
        });


        srcFileDir = "";
        dirID = -1;

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
                srcFileDir = data.srcFileDir;
                var filePath = data.srcFileDir + '/' + data.newName;



                var head = {};
                head.createTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                head.dataSource = 1;

                head.dataTagTypeList = [];
                head.dataTagNameList = [];


                head.emptyValueList = [""];


                var previewTable = document.getElementById("previewTable");
                _.each(previewTable.rows[0].childNodes, function(item) {

                    if (item.cellIndex == 0) {
                        head.entityTypeId = Util.toInt(item.childNodes[0].childNodes[0].attributes.key.value);
                        head.entityType = item.innerText;
                    } else {
                        head.dataTagTypeList.push(Util.toInt(item.childNodes[0].childNodes[0].attributes.key.value));
                        head.dataTagNameList.push(item.innerText);
                    }

                    head.emptyValueList = [];
                })

                head.delimeter = getColSplit();

                head.entityNum = fileLength;


                $.post('/tag/tag/createImportTask', {
                    taskName: $('#taskname').val().trim(),
                    remark: $('#remark').val().trim(),
                    filePath: filePath,
                    head: head
                }).done(function(data) {
                    data = JSON.parse(data);
                    // 因为有导航栏遮盖，所以跳到最上面，才能看见通知
                    window.location.href = "#topbar";
                    if (data.code == 0) {
                        Alert.show({
                            container: $("#alert-container"),
                            alertid: "alert-add-success",
                            alertclass: "alert-success",
                            content: "<i class='fa fa-check pr10'></i> <strong> 添加成功! </strong>"
                        });
                        window.location.href = 'tag-import-table.html';
                    } else {
                        Alert.show({
                            container: $("#alert-container"),
                            alertid: "alert-add-fail",
                            alertclass: "alert-danger",
                            content: "<i class='fa fa-remove pr10'></i> <strong> 添加失败! </strong>"
                        });
                    }
                });
            }

        });

        // Hide the total progress bar when nothing's uploading anymore
        myDropzone.on("queuecomplete", function(progress) {
            document.querySelector("#total-progress").style.opacity = "0";
        });
    }

    $("#cancelBtn").on('click', function(event) {
        event.preventDefault();
        window.location.href = 'tag-import-table.html';
    })


    $("#form-add").validate({
        rules: {
            taskname: {
                required: true
            },
            remark: {
                required: true
            },
            delimeter: {
                required: true
            },
            selectFile: {
                required: true
            }
        },
        messages: {
            taskname: {
                required: "任务名称为必填项"
            },
            remark: {
                required: "备注为必填项"
            },
            delimeter: {
                required: "没有选择列分隔符"
            },
            selectFile: {
                required: "请选择数据文件"
            }
        },
        errorClass: "state-error",
        validClass: "state-success",
        errorElement: "em",
        highlight: function(element, errorClass, validClass) {
            $(element).closest('.field').addClass(errorClass).removeClass(validClass);
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.field').removeClass(errorClass).addClass(validClass);
        },
        errorPlacement: function(error, element) {
            if (element.is(":radio") || element.is(":checkbox")) {
                element.closest('.option-group').after(error);
            } else {
                error.insertAfter(element.parent());
            }
        },

        submitHandler: function() {

            if ($('#previewTable a').length < 2) {
                Notify.show({
                    title: "至少需要两列数据！",
                    type: "warning"
                });
                return;
            }
            /*          if ($('#previewTable span')[0].attributes.key.value == '-1') {
                          Notify.show({
                              title: "需要选择实体类型！",
                              type: "warning"
                          });
                          
                      }*/
            var flag = false;
            $('#previewTable span').each(function(item) {
                if (item == 0) {
                    if ($(this)[0].attributes.key.value == -1) {
                        flag = true;
                    }
                } else {
                    if ($(this)[0].attributes.key.value == -1) {
                        flag = true;
                    }
                }
            })

            if (flag) {
                Notify.show({
                    title: "存在标签或实体类型未被选定",
                    type: "warning"
                });
                return;
            }

            /*    _.each(previewTable.rows[0].childNodes, function(item) {

                    if (item.cellIndex > 0 && Util.toInt(item.childNodes[0].childNodes[0].attributes.key.value) = -1) {
                        Notify.show({
                            title: "需要选定所以标签！",
                            type: "warning"
                        });
                        return;
                    }

                })*/

            myDropzone.uploadFile(selectedFile);
            return false;
        }
    });



})