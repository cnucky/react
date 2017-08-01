define("./udp-file-util", ['./upload-panel', 'jquery', 'underscore',
        './udp-dropzone',
        //'utility/udp/dropzone',
       'nova-notify', 'utility/udp/build', 'utility/utility'],
    function(tpl, $, _, Dropzone, Notify) {
        tpl = _.template(tpl);
        var initUploadPanel = true;
        var uploadingFileCount = 0;
        var myDropzone;
        var opts;

        var delay = 2000;

        function openFile(opts) {
            fileName = opts.fileName;
            uuidName = opts.uuidName;
            dataTypeId = opts.dataTypeId || -1;

            if (uuidName.split(".").pop() == "eml") {
                // uuidName = uuidName + ".html";
                fileName = uuidName;
            } else if (uuidName.split(".").pop() == "block") {
                fileName = uuidName + ".txt";
            }

            $.getJSON('/uploadfiles/getFilePath?fileName=' + fileName + '&fileId=' + encodeURIComponent(uuidName) + '&dataTypeId=' + dataTypeId, function(rsp) {
                if (rsp.code == 0) {
                    //var alink = document.createElement('a');
                    //var evt = document.createEvent("HTMLEvents");
                    //evt.initEvent("click", false, false);
                    //alink.target = "_blank";
                    //alink.href = rsp.data.filePath;
                    //alink.dispatchEvent(evt);
                    window.open(rsp.data.filePath);
                }
            });
        }

        function downloadFile(opts) {
            fileName = opts.fileName;
            uuidName = opts.uuidName;
            dataTypeId = opts.dataTypeId || -1;
            //initUploadPanel = true;
            $.getJSON('/uploadfiles/getFilePath?fileName=' + encodeURIComponent(fileName) + '&fileId=' + encodeURIComponent(uuidName) + '&dataTypeId=' + dataTypeId, function(rsp) {
                if (rsp.code == 0) {
                    var alink = document.createElement('a');
                    var evt = document.createEvent("HTMLEvents");
                    evt.initEvent("click", false, false);
                    alink.download = fileName;
                    alink.href = rsp.data.filePath;
                    console.log(rsp.data.filePath);
                    alink.click();
                    //window.open(rsp.data.filePath);
                }
            });
        }

        function uploadFile(optsParam) {
            opts = optsParam || {};
            console.log("uploadFile opts", opts);
            buttons = [];
            // initUploadPanel = true;

            console.log("filePath", opts.filePath);
            if (initUploadPanel) {
                uploadingFileCount = 0;
                $("#upload-panel").remove();
                initUploadPanel = false;
                $('body').append(tpl);
                // Dropzone.autoDiscover = false;

                // Get the template HTML and remove it from the doument
                var previewNode = document.querySelector("#template");
                previewNode.id = "";
                var previewTemplate = previewNode.parentNode.innerHTML;
                previewNode.parentNode.removeChild(previewNode);

                myDropzone = new Dropzone("#previews", {
                    url: "/uploadfiles/uploadFile?isUDP=0&uploadDir=/data/udp_upload/tmp&ip=" + opts.ip + "&UDPfilepath=" + opts.UDPPath,
                    parallelUploads: 15,
                    maxFilesize: 10240,
                    previewTemplate: previewTemplate,
                    autoQueue: false, // Make sure the files aren't queued until manually added
                    previewsContainer: "#previews", // Define the container to display the previews
                    clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
                });

                myDropzone.on("addedfile", function(file) {
                    // Hookup the start button
                    file.previewElement.querySelector(".start").onclick = function() {
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

                    console.log("sending file", file);
                    // Notify.show({
                    //     title: '开始上传处理文件【' + file.name + '】, 请耐心等待!',
                    //     type: 'info'
                    // });
                });

                var files = [];

                myDropzone.on("success", function(fileComponemtInfo, res) {
                    var resData = JSON.parse(res);
                    //console.log("success resData", resData);
                    if (resData) {
                        uploadingFileCount++;
                        console.log("uploadingFileCount", uploadingFileCount);
                        // showLoader();
                        var fileSize = resData.fileSize / 1024;
                        fileSize = fileSize.toFixed(0) == 0 ? 1 : fileSize;
                        var file = {
                            //documentName: resData.newName,
                            //documentSize: fileSize
                            fileName: resData.oldName,
                            fileId: resData.newName,
                            fileType: resData.fileType.toLowerCase(),
                            fileSize: fileSize,
                            filePath: opts.UDPPath + resData.newName,
                        };
                        files.push(file);

                        var uploadDir = '/data/udp_upload/' + resData.userId + '/';
                        var fileType = 3;
                        var registFilesInfo = [];
                        var registFileInfo = {
                            fileName: resData.tmpNewName,
                            dir: uploadDir + resData.newName,
                            createTime: '',
                            fileType: fileType,
                            fileState: 1,
                            rowDelimiter: '',
                            colDelimiter: '',
                            encoding: '',
                            preview_string: '',
                        };
                        registFilesInfo.push({
                            fileName: resData.tmpNewName,
                            dir: uploadDir + resData.newName,
                            createTime: '',
                            fileType: fileType,
                            fileState: 1,
                            rowDelimiter: '',
                            colDelimiter: '',
                            encoding: '',
                            preview_string: '',
                        });

                        registUploadFile(resData, file, registFileInfo, fileComponemtInfo, registUploadFileCallBack);
                    }
                });

                // Hide the total progress bar when nothing's uploading anymore
                myDropzone.on("queuecomplete", function(progress) {
                    // document.querySelector("#total-progress").style.opacity = "0";
                });

                // Setup the buttons for all transfers
                // The "add files" button doesn't need to be setup because the config
                // `clickable` has already been specified.
                $("#startupload").on('click', function() {
                    myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED));
                });

                $("#cancelupload").on('click', function() {
                    myDropzone.removeAllFiles(true);

                    if (uploadingFileCount > 0) {
                        uploadingFileCount = 0;
                        console.log("uploadingFileCount", uploadingFileCount);
                        hideLoader();
                    }
                });
            }

            $('#upload-panel').dockmodal({
                minimizedWidth: 260,
                width: opts.width || 600,
                height: opts.height || 500,
                title: opts.title || '文件上传',
                initialState: "docked",
                buttons: [{
                    html: "关闭",
                    buttonClass: "btn btn-primary btn-sm",
                    click: function(e, dialog) {
                        // do something when the button is clicked
                        dialog.dockmodal("close");

                        // after dialog closes fire a success notification
                        setTimeout(function() {
                            //msgCallback();
                        }, 500);
                    }
                }]
            });
        }

        function registUploadFile(resData, file, registFileInfo, fileComponemtInfo, registUploadFileCallBack){
            var registFilesInfo = [];
            registFilesInfo.push(registFileInfo);
            $.post('/uploadfiles/UploadFileRegist', {
                "uploadFiles": JSON.stringify(registFilesInfo)
            }).done(function(res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    registUploadFileCallBack(resData, file, registFileInfo, fileComponemtInfo);
                }
                else {
                    uploadingFileCount--;
                    console.log("uploadingFileCount", uploadingFileCount);
                    Notify.show({
                        title: '上传文件【' + resData.oldName + '】失败！',
                        type: 'error'
                    });
                    console.log("uploadFileRegist失败:" + data.message);
                    myDropzone.failed(fileComponemtInfo);
                }
            });
        }

        function registUploadFileCallBack(resData, file, registFileInfo, fileComponemtInfo) {
            moveFileToUploadDir(resData, file, registFileInfo, fileComponemtInfo, moveFileToUploadDirCallBack);
        }
        
        function moveFileToUploadDir(resData, file, registFileInfo, fileComponemtInfo, moveFileToUploadDirCallBack) {
            var uploadDir = '/data/udp_upload/' + resData.userId + '/';
            $.post('/uploadfiles/moveFileToUploadDir', {
                oldFileName: resData.oldName,
                newFileName: resData.newName,
                uploadDir: uploadDir
            }).done(function(res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    moveFileToUploadDirCallBack(resData, file, registFileInfo, fileComponemtInfo);
                }
                else {
                    uploadingFileCount--;
                    if (uploadingFileCount <= 0) {
                        hideLoader();
                    }
                    console.log("uploadingFileCount", uploadingFileCount);
                    Notify.show({
                        title: '上传文件【' + resData.oldName + '】失败！',
                        type: 'error'
                    });
                    console.log("moveFileToUploadDi失败:" + data.message);
                    myDropzone.failed(fileComponemtInfo);
                }
            });
        }
        
        function moveFileToUploadDirCallBack(resData, file, registFileInfo, fileComponemtInfo) {
            checkUploadResult(resData, file, registFileInfo, fileComponemtInfo, checkUploadResultCallBack);
        }
        
        function checkUploadResult(resData, file, registFileInfo, fileComponemtInfo, checkUploadResultCallBack) {
            // Notify.show({
            //     title: '后台开始上传【' + resData.oldName + '】, 请耐心等待!',
            //     type: 'info'
            // });
            $.post('/uploadfiles/checkUploadResult', {
                    'fileName': resData.tmpNewName,
                },
                function(res) {
                    var checkUploadResultData = JSON.parse(res);
                    if (checkUploadResultData.code == 0) {
                        uploadingFileCount--;
                        // console.log("uploadingFileCount", uploadingFileCount);
                        if (uploadingFileCount <= 0) {
                            hideLoader();
                        }
                        //Notify.show({
                        //    title: '后台已上传好文件【' + resData.oldName + '】!',
                        //    type: 'success'
                        //});

                        // console.log('后台已处理好文件【' + checkUploadResultData.data.oldName + '】!');
                        checkUploadResultCallBack(resData, file, registFileInfo, fileComponemtInfo);
                        // setTimeout(function() {
                        // }, 500)
                    }
                    else {
                        uploadingFileCount--;
                        console.log("uploadingFileCount", uploadingFileCount);
                        if (uploadingFileCount <= 0) {
                            hideLoader();
                        }
                        Notify.show({
                            title: '后台处理文件【' + resData.oldName + '】失败!',
                            type: 'error'
                        });
                        console.log("moveFileToUploadDi失败:" + data.message);
                        myDropzone.failed(fileComponemtInfo);
                    }
                });
        }

        function checkUploadResultCallBack(resData, file, registFileInfo, fileComponemtInfo) {
            registerBatch(resData, file, registFileInfo, fileComponemtInfo, registerBatchCallBack);
        }
        
        function registerBatch(resData, file, registFileInfo, fileComponemtInfo, registerBatchCallBack) {
            var fileNamesArray = new Array();
            var rulesArray = new Array();
            var fileInfoArray = new Array();
            var outputColArray = new Array();
            var files = [];
            files.push(file);
            fileNamesArray.push(file.fileName);
            fileInfoArray.push({
                ERROR_COUNT: 0,
                ERROR_FILE_DOWNLOADED: -1,
                ERROR_FILE_NAME: "",
                ERROR_REASON: "",
                FILE_ID: 0,
                FILE_LOCATION_IP: "",
                FILE_PATH: opts.UDPPath + file.fileId,
                FILE_SIZE: "",
                INSERT_TIME: null,
                LOAD_BATCH_ID: -1,
                LOAD_FINISH_TIME: null,
                LOAD_RATIO: 0,
                LOAD_RECORD_COUNT: 0,
                LOAD_START_TIME: null,
                LOAD_STATE: -1,
                NEW_NAME: file.fileId,
                OLD_NAME: file.fileName,
                PREP_TIME: null,
                PROC_RECORD_COUNT: 0,
                TBL_NAME: "",
                UNOUT_RECORD_COUNT: 0
            });
            // for (var i = 0; i < files.length; ++i) {
            //     fileNamesArray.push(files[i].fileName);
            //     fileInfoArray.push({
            //         ERROR_COUNT: 0,
            //         ERROR_FILE_DOWNLOADED: -1,
            //         ERROR_FILE_NAME: "",
            //         ERROR_REASON: "",
            //         FILE_ID: 0,
            //         FILE_LOCATION_IP: "",
            //         FILE_PATH: opts.UDPPath + files[i].fileId,
            //         FILE_SIZE: "",
            //         INSERT_TIME: null,
            //         LOAD_BATCH_ID: -1,
            //         LOAD_FINISH_TIME: null,
            //         LOAD_RATIO: 0,
            //         LOAD_RECORD_COUNT: 0,
            //         LOAD_START_TIME: null,
            //         LOAD_STATE: -1,
            //         NEW_NAME: files[i].fileId,
            //         OLD_NAME: files[i].fileName,
            //         PREP_TIME: null,
            //         PROC_RECORD_COUNT: 0,
            //         TBL_NAME: "",
            //         UNOUT_RECORD_COUNT: 0
            //     });
            // }

            //console.log("opts.getDirIdCallbackFunc()", opts.getDirIdCallbackFunc());
            $.post('/uploadfiles/RegisterBatchAndFileID', {
                "dataTypeId": -777,
                "zoneId": "1",
                "batchName": "",
                "fileFilter": "",
                "rowDelimeter": "b",
                "colDelimeter": "c",
                "encoding": "a",
                "errorNumLimit": 500,
                "fileCount": fileInfoArray.length,
                "fileNames": JSON.stringify(fileNamesArray),
                "haveHeadDef": 0,
                "m_outColsIndex": JSON.stringify(outputColArray),
                "m_rules": JSON.stringify(rulesArray),
                "recordSeparator": "",
                "taskType": 8,
                "userID": -1,
                "watchDir": opts.UDPPath,
                "dbType": 1,
                "userName": "",
                "passWord": "",
                "dbIP": "",
                "dbInstance": "",
                "whereClause": "",
                "dbTableName": "",
                "columnCount": "",
                "fileInfo": JSON.stringify(fileInfoArray),
                "dirID": opts.getDirIdCallbackFunc() || -1,
                "dirType": opts.dirType || -1,
                "files": JSON.stringify(files),
            }).
            done(function(res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    //Notify.show({
                    //    title: i18n.t('base:workspace.alert-fileuploadsucc'),
                    //    type: 'success'
                    //});
                    // console.log("RegisterBatchAndFileID:", data.data);
                    registerBatchCallBack(resData, file, registFileInfo, fileComponemtInfo, data.data.documentID)
                    // files = [];
                }
                else {
                    // Notify.show({
                    //     title: i18n.t('base:workspace.alert-fileuploadfail'),
                    //     type: 'danger'
                    // });
                    Notify.show({
                        title: '后台处理文件【' + resData.oldName + '】失败!',
                        type: 'error'
                    });
                    console.log("文件上传失败", data.message);
                    uploadingFileCount--;
                    console.log("uploadingFileCount", uploadingFileCount);
                    if (uploadingFileCount <= 0) {
                        hideLoader();
                    }
                    myDropzone.failed(fileComponemtInfo);

                }
            });
        }

        function registerBatchCallBack(resData, file, registFileInfo, fileComponemtInfo, idList){
            getDocumentsInfo(resData, file, registFileInfo, fileComponemtInfo, getDocumentsInfoCallBack, idList);
        }

        function getDocumentsInfo(resData, file, registFileInfo, fileComponemtInfo, getDocumentsInfoCallBack, idList){
            var documentInterval = setInterval(function() {
                $.post('/workspacedir/getDocumentsInfo', {
                    idList: idList
                }).done(function(res) {
                    var data = JSON.parse(res);
                    if (data.code == 0) {
                        // console.log("getDocumentsInfo:" + data.data);
                        if(data.data.length <= 0 || data.data[0].documentState != 0){
                            clearInterval(documentInterval);
                            //success
                            if(data.data[0].documentState == 1){
                                // Notify.show({
                                //     title: '文件【' + resData.oldName + '】上传成功!',
                                //     type: 'success'
                                // });
                                getDocumentsInfoCallBack(resData, file, registFileInfo, fileComponemtInfo);
                            }
                            else{
                                uploadingFileCount--;
                                console.log("uploadingFileCount", uploadingFileCount);
                                if (uploadingFileCount <= 0) {
                                    hideLoader();
                                }
                                Notify.show({
                                    title: '后台处理文件【' + resData.oldName + '】失败!',
                                    type: 'error'
                                });
                                myDropzone.failed(fileComponemtInfo);
                            }
                        }
                        else{
                            //continue
                        }
                    }
                    else {
                        clearInterval(documentInterval);
                        uploadingFileCount--;
                        if (uploadingFileCount <= 0) {
                            hideLoader();
                        }
                        console.log("uploadingFileCount", uploadingFileCount);
                        // Notify.show({
                        //     title: '上传文件【' + data.oldName + '】失败！',
                        //     type: 'error'
                        // });
                        console.log("getDocumentsInfo失败:" + data.message);
                        myDropzone.failed(fileComponemtInfo);
                    }
                });
            }, delay);
        }

        function getDocumentsInfoCallBack(resData, file, registFileInfo, fileComponemtInfo){
            updatePanel(fileComponemtInfo);
        }

        function updatePanel(fileComponemtInfo) {
            var callback = _.isFunction(opts.callback) ? opts.callback : null;
            args = opts.args || {};
            if (callback) {
                callback(args);
            }
            myDropzone.finished(fileComponemtInfo);
        }
        
        function uuid(len, radix) {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var uuid = [],
                i;
            if (len) {
                for (i = 0; i < len; i++) {
                    uuid[i] = chars[0 | Math.random() * radix];
                }
            } else {
                var r;
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }
            return uuid.join('');
        }

        return {
            downloadFile: downloadFile,
            uploadFile: uploadFile,
            openFile: openFile,
            uuid: uuid
        }
    });