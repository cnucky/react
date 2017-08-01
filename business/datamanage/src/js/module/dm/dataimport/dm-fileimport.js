/**
 * Created by root on 12/21/15.
 */
define("dm-fileimport",
    ['../../../tpl/upload-panel',
        '../../dm/dataimport/dm-dropzone',
        'nova-notify'],
    function (uploadTpl, Dropzone, Notify) {
        uploadTpl = _.template(uploadTpl);
        var initUploadPanel = true;
        var files = [];

        function uploadFile(opts) {
            var uploadingFileCount = 0;
            console.log("dm uploadFile opts", opts);
            opts = opts || {};
            buttons = [];
            if (initUploadPanel == true) {
                $("#upload-panel").remove();
                initUploadPanel = false;
                files = [];
                if (opts.isFromDialog) {
                    $('#nv-dialog-body').append(uploadTpl);
                }
                else {
                    $('body').append(uploadTpl);
                }

                Dropzone.autoDiscover = false;

                // Get the template HTML and remove it from the doument
                var previewNode = document.querySelector("#template");
                previewNode.id = "";
                var previewTemplate = previewNode.parentNode.innerHTML;
                previewNode.parentNode.removeChild(previewNode);

                if (opts.isUDP) {
                    var myDropzone = new Dropzone("#previews", {
                        acceptOption: opts.accept,
                        //1
                        url: "/datamanage/dataimport/uploadFile?isUDP=0&uploadDir=/data/udp_upload/tmp&ip="
                        + opts.ip + "&UDPfilepath=" + opts.UDPfilepath,
                        parallelUploads: 100,
                        maxFilesize: 102400,
                        previewTemplate: previewTemplate,
                        autoQueue: false, // Make sure the files aren't queued until manually added
                        previewsContainer: "#previews", // Define the container to display the previews
                        clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
                    });
                }
                else if (opts.isexcel) {
                    var myDropzone = new Dropzone("#previews", {
                        //8
                        acceptOption: opts.accept,
                        url: "/datamanage/dataimport/uploadFile?isUDP=1&uploadDir=/data/personaldata/xlsxtmp/&ip=" + opts.ip,
                        parallelUploads: 100,
                        maxFilesize: 102400,
                        previewTemplate: previewTemplate,
                        autoQueue: false, // Make sure the files aren't queued until manually added
                        previewsContainer: "#previews", // Define the container to display the previews
                        clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
                    });
                }
                else if (opts.isAddExcel) {
                    var myDropzone = new Dropzone("#previews", {
                        //7
                        acceptOption: opts.accept,
                        url: "/datamanage/dataimport/uploadFile?isUDP=1&uploadDir=/data/personaldata/&ip=" + opts.ip,
                        parallelUploads: 100,
                        maxFilesize: 102400,
                        previewTemplate: previewTemplate,
                        autoQueue: false, // Make sure the files aren't queued until manually added
                        previewsContainer: "#previews", // Define the container to display the previews
                        clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
                    });
                }
                else {
                    var myDropzone = new Dropzone("#previews", {
                        //4
                        acceptOption: opts.accept,
                        url: "/datamanage/dataimport/uploadFile?isUDP=1&uploadDir=/data/personaldata/&ip=" + opts.ip
                        + "&fileEncoding=" + opts.fileEncoding+ "&rowSplit=" + opts.rowSplit,
                        parallelUploads: 100,
                        maxFilesize: 102400,
                        previewTemplate: previewTemplate,
                        autoQueue: false, // Make sure the files aren't queued until manually added
                        previewsContainer: "#previews", // Define the container to display the previews
                        clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
                    });
                }

                myDropzone.on("addedfile", function (file) {
                    // Hookup the start button
                    file.previewElement.querySelector(".start").onclick = function () {
                        myDropzone.enqueueFile(file);
                    };
                });

                // Update the total progress bar
                myDropzone.on("totaluploadprogress", function (progress) {
                    document.querySelector("#total-progress .progress-bar").style.width = progress + "%";
                });

                myDropzone.on("sending", function (file) {
                    //console.log("sending!!!", file);
                    //.setAttribute("disabled", "disabled");
                    // Show the total progress bar when upload starts
                    document.querySelector("#total-progress").style.opacity = "1";
                    // And disable the start button
                    file.previewElement.querySelector(".start").setAttribute("disabled", "disabled");
                });

                myDropzone.on("success", function (file, res) {
                    var resdata = JSON.parse(res);
                    console.log("success", resdata);

                    file = {
                        oldName: resdata.oldName,
                        newName: resdata.newName,
                        documentSize: resdata.fileSize
                    };

                    if (opts.isUDP && file.documentSize <=0){
                        console.log("非结构化空文件");
                        Notify.show({
                            title: '空文件不能处理！',
                            type: 'error'
                        })
                        //uploadingFileCount--;
                        //if (uploadingFileCount <= 0){
                        //    $('#submit-Button').removeClass('disabled');
                        //}
                    }
                    else{
                        //if (resdata.oldName !== undefined) {
                        //    Notify.show({
                        //        title: '文件上传成功！',
                        //        type: 'success'
                        //    })
                        //}

                        //$.getJSON('/dataimport/checkFileExist', {
                        //        'filePath': resdata.dstPath,
                        //    },
                        //    function (rsp) {
                        //        if (rsp.isExist) {
                        //            setTimeout(function () {
                        //                timeTicket = setInterval(
                        //                    function () {
                        //                        $.getJSON('/dataimport/checkFileExist', {
                        //                                'filePath': resdata.dstPath,
                        //                            },
                        //                            function (rsp) {
                        //                                if (rsp.isExist) {
                        //                                    Notify.show({
                        //                                        title: '后台在处理文件，暂时不能提交任务，请稍后...',
                        //                                        type: 'warn'
                        //                                    });
                        //                                }
                        //                                else {
                        //                                    clearInterval(timeTicket);
                        //                                    uploadingFileCount--;
                        //                                    if (uploadingFileCount <= 0){
                        //                                        $('#submit-Button').removeClass('disabled');
                        //                                        //Notify.show({
                        //                                        //    title: '后台已处理好文件!'+resdata.oldName,
                        //                                        //    type: 'success'
                        //                                        //});
                        //                                    }
                        //                                }
                        //                            });
                        //                    }, 5000);
                        //            }, 1000);
                        //        }
                        //        else {
                        //            uploadingFileCount--;
                        //            if (uploadingFileCount <= 0){
                        //                $('#submit-Button').removeClass('disabled');
                        //                Notify.show({
                        //                    title: '后台已处理好文件!'+resdata.oldName,
                        //                    type: 'success'
                        //                });
                        //            }
                        //        }
                        //    });

                        $('#submit-Button').addClass('disabled');
                        uploadingFileCount++;
                        if (uploadingFileCount > 0)
                            $("#submit-lable").show();
                        else
                            $("#submit-lable").hide();
                        var uploadDir = '';
                        var fileType = 1;
                        if (opts.isUDP){
                            uploadDir = '/data/udp_upload/' + resdata.userId + '/';
                            fileType = 3;
                        }
                        else{
                            uploadDir = '/data/personaldata/' + resdata.userId + '/';
                            if(opts.isexcel || opts.isAddExcel)
                                fileType = 2;
                            else
                                fileType = 1;
                        }
                        var uploadFiles = [];
                        uploadFiles.push({
                            fileName: resdata.tmpNewName,
                            dir: uploadDir + resdata.newName,
                            createTime: '',
                            fileType: fileType,
                            fileState: 1,
                            rowDelimiter: opts.rowSplit,
                            colDelimiter: '',
                            encoding: opts.fileEncoding,
                            preview_string: '',
                        });

                        $.post('/datamanage/dataimport/UploadFileRegist', {
                            "uploadFiles": JSON.stringify(uploadFiles)
                        }).done(function (res) {
                            var data = JSON.parse(res);
                            if (data.code == 0) {
                                $.post('/datamanage/dataimport/moveFileToUploadDir', {
                                    oldFileName: resdata.oldName,
                                    newFileName: resdata.newName,
                                    uploadDir: uploadDir
                                }).done(function (res) {
                                    var data = JSON.parse(res);
                                    if (data.code == 0) {
                                        $.post('/datamanage/dataimport/checkUploadResult', {
                                                'fileName': resdata.tmpNewName,
                                            },
                                            function (res) {
                                                var checkUploadResultData = JSON.parse(res);
                                                if (checkUploadResultData.code == 0) {
                                                    Notify.show({
                                                        title: '后台已处理好文件【'+resdata.oldName+'】!',
                                                        type: 'success'
                                                    });
                                                    uploadingFileCount--;
                                                    if (uploadingFileCount <= 0) {
                                                        $('#submit-Button').removeClass('disabled');
                                                        $("#submit-lable").hide();
                                                    }
                                                }
                                                else {
                                                    uploadingFileCount--;
                                                    if (uploadingFileCount <= 0) {
                                                        $('#submit-Button').removeClass('disabled');
                                                        $("#submit-lable").hide();
                                                    }
                                                    Notify.show({
                                                        title: '后台处理文件【'+resdata.oldName+'】失败!',
                                                        type: 'error'
                                                    });
                                                    return;
                                                }
                                            });
                                    }
                                    else {
                                        Notify.show({
                                            title: '上传文件【'+resdata.oldName+'】失败！',
                                            type: 'error'
                                        });
                                        return;
                                        console.log("moveFileToUploadDi失败:" + data.message);
                                    }
                                });

                                if (!opts.isexcel){
                                    files.push(file);
                                    console.log("files", files);

                                    $("#fileUploaded").html($("#fileUploaded").html()
                                        + '<div class="file-row"><span class="name" resdata-dz-name>'
                                        + resdata.oldName
                                        + '&nbsp'
                                        + '</span>'
                                            //+ '<span class="size" resdata-dz-name>'
                                            //+ (resdata.fileSize/1000/1000).toFixed(2)
                                            //+ 'MB'
                                            //+ '</span>'
                                        + '</div>');
                                    //+ '<span style="position: absolute;left:180px;margin-top: 5px;height: 20px;line-height: 20px;font-size: 14px;">'
                                    //+ resdata.oldName + '</span><br>');
                                }
                            }
                            else {
                                Notify.show({
                                    title: '上传文件【'+resdata.oldName+'】失败！',
                                    type: 'error'
                                });
                                console.log("uploadFileRegist失败:" + data.message);
                            }
                        });
                    }

                    if (opts.isPreView) {
                        var basicSetup = require('../../dm/dataimport/dm-basicsetup');
                        basicSetup.setNewFileName(resdata.newName);
                        basicSetup.setOldFileName(resdata.oldName);
                        basicSetup.setTmpNewName(resdata.tmpNewName);
                        initUploadPanel = true;
                        //basicSetup.xlsxParse();
                        basicSetup.getFilePreViewRes();
                        $('#upload-panel').dockmodal("close");
                    }

                    if (opts.isFromDialog) {
                        var fromfile = require('../../dm/datatypemanage/dm-createdatatype-fromfile');
                        initUploadPanel = true;
                        fromfile.getFilePreViewRes(resdata.newName, resdata.oldName, resdata.tmpNewName);
                        //fromfile.xlsxParse(resdata.newName, resdata.oldName);
                        $('#upload-panel').dockmodal("close");
                    }
                });

                // Hide the total progress bar when nothing's uploading anymore
                myDropzone.on("queuecomplete", function (progress) {
                    //console.log("queuecomplete!!!", progress);

                    document.querySelector("#total-progress").style.opacity = "0";
                });

                myDropzone.on("removedfile", function (file) {
                    console.log("removedfile!!!", file);
                    console.log("removedfile", $("#fileUploaded")[0].children[0].innerText);
                    for(var index in files){
                        if(files[index].oldName == file.name){
                            files.splice(index, 1);
                            //return;
                        }
                    }

                    $("#fileUploaded").html('');
                    for(var index in files){
                        $("#fileUploaded").html($("#fileUploaded").html()
                            + '<div class="file-row"><span class="name" resdata-dz-name>'
                            + files[index].oldName
                            + '&nbsp'
                            + '</span>'
                                //+ '<span class="size" resdata-dz-name>'
                                //+ (resdata.fileSize/1000/1000).toFixed(2)
                                //+ 'MB'
                                //+ '</span>'
                            + '</div>');
                    }
                });

                // Setup the buttons for all transfers
                // The "add files" button doesn't need to be setup because the config
                // `clickable` has already been specified.
                $("#startupload").on('click', function () {
                    myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED));
                });

                $("#cancelupload").on('click', function () {
                    console.log("cancelupload");
                    if(uploadingFileCount > 0)
                        uploadingFileCount = 0;
                    files = [];
                    myDropzone.removeAllFiles(true);
                });
            }

            var initState = "docked";
            if (opts.initState != undefined)
                initState = opts.initState;
            $('#upload-panel').dockmodal({
                minimizedWidth: 260,
                width: opts.width || 600,
                height: opts.height || 500,
                title: opts.title || '文件上传',
                initialState: initState,
                buttons: [{
                    html: "关闭",
                    buttonClass: "btn btn-primary btn-sm",
                    click: function (e, dialog) {
                        // do something when the button is clicked
                        dialog.dockmodal("close");

                        // after dialog closes fire a success notification
                        setTimeout(function () {
                            //msgCallback();
                        }, 500);
                    }
                }]
            });
        }

        function getFileInfo() {
            return files;
        }

        function clearFileInfo() {
            files = [];
        }

        function setInitUploadPanel(){
            files = [];
            initUploadPanel = true;
            // $("#fileUploaded").html('');
        }

        return {
            uploadFile: uploadFile,
            getFileInfo: getFileInfo,
            clearFileInfo: clearFileInfo,
            setInitUploadPanel: setInitUploadPanel
        }

    });