/**
 * Created by root on 12/1/15.
 */
define(['nova-dialog', 'nova-notify', 'jschardet',
        '../../dm/dataimport/dm-fileimport',
        '../../dm/dataimport/dm-fieldsmap',
        '../../dm/dataimport/dm-preview-util',
        '../../dm/dataimport/dm-getparams',
        '../../dm/dataimport/dm-setparams',
        '../../dm/dataimport/dm-di-innerfun',
        '../../../tpl/tpl-generateTableHead',
        '../../../tpl/tpl-getDataConfig',],
    function (Dialog, Notify, jschardet, FileUtil, fieldsMap, util, getparams,
              setparams, innerfun, tplGenerateTableHead, tplGetDataConfig) {
        tplGenerateTableHead = _.template(tplGenerateTableHead);
        tplGetDataConfig = _.template(tplGetDataConfig);
        //解析文件获得的列数
        var colNum = 0;
        //预处理结果的列数
        var preColNum = 0;
        var rowSplit;
        var colSplit;
        var textContent;
        var rowArray = [];
        var colArray;
        var preViewText;
        var isFirstRowHead;
        var outputColArray;
        //当前已被使用的fieldndex构成的数组
        var usedFieldIndexArray;
        var ecoding;
        var viewSize = 8 * 5000 * 100;
        var newFileName;
        var oldFileName;
        var tmpNewName = '';
        var maxRowNum = 50;
        var maxcolNum = 500;
        var toRefreshMapTable = true;
        var toRefreshPreViewTable = true;
        var dataTypeId = 0;
        var centerCodeOfCurDataType = "";
        var zoneIdOfCurDataType = 1;
        var categoryOfCurDataType = 1;
        var xlsxDataArray;
        var dbDataArray;
        //1:txt; 2:xlsx; 3:dump; 4:数据库
        var fileType = 'txt';

        var dbType = 1;
        var userName = "";
        var passWord = "";
        var dbIP = "";
        var instanceName = "";
        var dbTableName = "";
        var whereClause = "";
        var columnCount = "";

        const xlsxRowDelimeter = "\r\n";
        const xlsxColDelimeter = "\t";
        var recommendFieldsParams = {};
        //智能映射占用的行数
        var rowMapIndex = 0;
        var headArray = [];
        var fileRootPath = "";
        var colInfoArrayOfDataType = [];

        var mapConfigDBParams = new Object({
            'dbType': 'Oracle',
            'dbIP': '',
            'dbInstance': '',
            'userName': '',
            'passWord': '',
            'isByBatch': false
        });
        var dataTypeInfoArrayForMap = [];
        var isUpdateHead = false;

        //响应用户重新选择任务类型
        function taskTypeSelectedChanged() {
            console.log("taskTypeSelectedChanged");
            var a = document.getElementById('taskType-Select');
            //导航设置
            if (a.value == 4 || a.value == 5) {
                $("#step2_href").hide();
                $("#step3_href").hide();
                $("#step4_href").hide();
                $("#step5_href")[0].text = "第 2 步：提交导入任务";
                $("#h3_step5")[0].textContent = "第 2 步：创建导入任务";
                //$("#step5_href").hide();
            }
            else {
                $("#step2_href").show();
                $("#step3_href").show();
                $("#step4_href").show();
                $("#step5_href")[0].text = "第 5 步：提交导入任务";
                $("#h3_step5")[0].textContent = "第 5 步：创建导入任务";
            }

            //最后一步，上传文件名区域
            if (a.value == 4 || a.value == 1) {
                $("#upLoadFileLable").show();
                $("#upLoadFileDiv").show();
                $("#upLoadFileSpan").show();
                $("#fileUploaded").show();
            }
            else {
                $("#upLoadFileLable").hide();
                $("#upLoadFileDiv").hide();
                $("#upLoadFileSpan").hide();
                $("#fileUploaded").hide();
            }

            //数据库抽取
            if (a.value == 6) {
                fileType = 'dataBase';
                setparams.setFileType(fileType);
                $("#selectFileBtn").addClass('hide');
                $("#submit_preview")[0].textContent = '连接数据库并预览';
                document.getElementById("submit_preview").style.width = 150 + "px";

                setparams.setRowDelimeter(xlsxRowDelimeter);
                setparams.setColDelimeter(xlsxColDelimeter);

                setparams.hideControlsForStep2();
                fileTypeChanged();
            }
            else {
                fileType = 'txt';
                setparams.setFileType(fileType);
                $("#selectFileBtn").removeClass('hide');
                $("#submit_preview")[0].innerHTML = '<span class="fa fa-book pr3"></span>预览';
                document.getElementById("submit_preview").style.width = 60 + "px";

                setparams.showControlsForStep2();
                fileTypeChanged();
            }

            //对接
            if (a.value == 2 || a.value == 5) {
                $("#collapseDetail").show();//   .style.visible = true;
                $("#excelOption").addClass('hide');
                fileTypeChanged();
                innerfun.setFileEcodingForDJ();
            }
            else {
                $("#collapseDetail").hide();//.style.display = "none";
                if (a.value != 6)
                    $("#excelOption").removeClass('hide');
                innerfun.cancelFileEcodingForDJ();
            }

            if (a.value == 2)
                $("#unStructedDiv").show();
            else
                $("#unStructedDiv").hide();
        }

        function setUseableTaskType(categoryOfCurDataType) {
            console.log("categoryOfCurDataType", categoryOfCurDataType);
            switch (categoryOfCurDataType) {
                case 1: //结构化
                    $("#file-import").show();
                    $("#DJ-import").show();
                    $("#DB-import").show();
                    $("#unstruct-file-import").hide();
                    $("#unstruct-DJ-import").hide();
                    $("#taskType-Select")[0].selectedIndex = 0;
                    $("#collapseDetail").hide();
                    break;
                case 2: //非结构化
                    $("#file-import").hide();
                    $("#DJ-import").hide();
                    $("#DB-import").hide();
                    $("#unstruct-file-import").show();
                    $("#unstruct-DJ-import").show();
                    $("#taskType-Select")[0].selectedIndex = 3;
                    $("#collapseDetail").hide();
                    break;
                case 3: //复合
                    $("#file-import").show();
                    $("#DJ-import").show();
                    $("#DB-import").show();
                    $("#unstruct-file-import").hide();
                    $("#unstruct-DJ-import").hide();
                    $("#taskType-Select")[0].selectedIndex = 1;
                    $("#collapseDetail").show();
                    break;
                default :
                    $("#file-import").show();
                    $("#DJ-import").show();
                    $("#DB-import").show();
                    $("#unstruct-file-import").show();
                    $("#unstruct-DJ-import").show();
                    $("#taskType-Select")[0].selectedIndex = 0;
                    $("#collapseDetail").hide();
                    break;
            }
            taskTypeSelectedChanged();
        }

        //获取选择文件的文件名称
        function getSelectedFilePath() {
            var obj = $("#selectFile-Button")[0];
            if (obj) {
                $("#filepath-Input").attr("value", obj.files.item(0).name);//obj.value;
                console.log("type", obj.files.item(0).type);
                if (obj.files.item(0).type.indexOf("text") >= 0) {
                    $("#autoGetEncodingBtn").removeClass("disabled");
                    $("#id_delimiter_row0-Select")[0].disabled = false;
                    $("#id_delimiter_col0")[0].disabled = false;
                }
                else if (obj.files.item(0).name.indexOf(".bcp") >= 0) {
                    $("#autoGetEncodingBtn").removeClass("disabled");
                    $("#id_delimiter_row0-Select")[0].disabled = false;
                    $("#id_delimiter_col0")[0].disabled = false;
                }
                else {
                    $("#autoGetEncodingBtn").addClass("disabled");
                    $("#id_delimiter_row0-Select")[0].disabled = true;
                    $("#id_delimiter_col0")[0].disabled = true;
                }

                $("#uploadfilepath").attr("value", obj.files.item(0).name);

                initRefresh();
            }
        }

        function getDataType() {
            //$.getJSON('/datamanage/dataimport/listdatasource').done(function (rsp) {
            $.getJSON('/datamanage/dataimport/datatypetree').done(function (rsp) {
                var data = rsp.data;

                Dialog.build({
                    title: "选择数据类型",
                    content: "<div id='system-data' class='tab-pane active'></div><br><div id='personal-data' class='tab-pane active'></div>",
                    rightBtnCallback: function () {
                        initRefresh();
                        // 确认
                        var selectedTree = $("#system-data");//$("#dataTypeChoose");
                        var selectedNode = $(selectedTree).fancytree("getTree").getActiveNode();
                        if (selectedNode) {
                            choosenDataType = selectedNode.data;
                            $.magnificPopup.close();
                            dataTypeId = choosenDataType.typeId;
                            centerCodeOfCurDataType = choosenDataType.centerCode;
                            zoneIdOfCurDataType = choosenDataType.zoneId;
                            categoryOfCurDataType = choosenDataType.category;
                            setUseableTaskType(categoryOfCurDataType);
                            console.log(dataTypeId);
                            $("#dataType-Select").val(choosenDataType.caption);
                        }
                        else {
                            Notify.show({
                                title: "请选择正确的数据类型！",
                                type: "failed"
                            });
                        }
                    }
                }).show(function () {
                    $('#system-data').fancytree({
                        selectMode: 2,
                        clickFolderMode: 1,
                        autoScroll: true,
                        source: function () {
                            return rsp.data;//rsp.data.sysTree;
                        },
                        iconClass: function (event, data) {
                            if (data.node.extraClasses.indexOf("nv-dir") != -1) {
                                return "fa fa-folder fa-fw";
                            } else {
                                return "fa fa-database fa-fw";
                            }
                        }
                    });
                });
            })
        }

        function getWatchDir() {
            $.getJSON('/datamanage/dataimport/GetAllDir').done(function (rsp) {
                console.log(rsp.data);
                Dialog.build({
                    title: "选择监视目录",
                    content: "<div id='WatchDirButtonDiv' style='height:40px;'>" +
                    "<button id='btn-addDir' class='btn btn-primary ml10 mb10'>新建</button>" +
                    "<button id='btn-refreshDir' class='btn btn-primary ml10 mb10'>刷新</button></div>" +
                    "<div><input type='text' id='newDirName' placeholder='请输入新建目录名' style='display:none;margin-left:10px;width:80%' class='gui-input'>" +
                    "<button id='btn-MakesureDir' style='display:none;' class='btn btn-primary ml5 mb10'>确认</button></div>" +
                    "<div id='WatchDirChoose'></div>",
                    rightBtnCallback: function () {
                        var selectedTree = $("#WatchDirChoose");
                        var selectedNode = $(selectedTree).fancytree("getTree").getActiveNode();
                        if (selectedNode) {
                            choosenWatchDir = selectedNode;
                            //console.log(choosenWatchDir);
                            $.magnificPopup.close();
                            //console.log(choosenWatchDir.caption);
                            if (rsp.data.array[0].dirName == choosenWatchDir.data.dirName)
                                $("#watchDir-Input").val(choosenWatchDir.data.dirName);
                            else
                                $("#watchDir-Input").val(rsp.data.array[0].dirName + choosenWatchDir.data.dirName);
                            //$("#watchDir-Input").val(choosenWatchDir.data.dirName);
                        }
                        else {
                            Notify.show({
                                title: "请选择正确的监视目录！",
                                type: "failed"
                            });
                        }
                    }
                }).show(function () {
                    $('#WatchDirChoose').fancytree({
                        //extensions:["edit"],
                        selectMode: 2,
                        clickFolderMode: 1,
                        autoScroll: true,
                        source: rsp.data.array,
                        iconClass: function (event, data) {
                            return "fa fa-folder fa-fw";
                        },
                    });


                    $("#btn-addDir").on("click", function () {
                        $("#newDirName").show();
                        $("#btn-MakesureDir").show();
                    });
                    $("#btn-MakesureDir").on("click", function () {
                        $("#newDirName").hide();
                        $("#btn-MakesureDir").hide();
                        var newDirName = $("#newDirName").val();
                        $.post('/datamanage/dataimport/CreateDir', {
                            "dirName": newDirName
                        }).done(function (res) {
                            console.log(res);
                            $('#WatchDirChoose').fancytree("destroy");
                            $.getJSON('/datamanage/dataimport/GetAllDir').done(function (rsp) {
                                $('#WatchDirChoose').fancytree({
                                    selectMode: 2,
                                    clickFolderMode: 1,
                                    autoScroll: true,
                                    source: rsp.data.array,
                                    iconClass: function (event, data) {
                                        return "fa fa-folder fa-fw";
                                    },
                                });
                            });
                        })
                    });
                    $("#btn-refreshDir").on("click", function () {
                        $("#newDirName").hide();
                        $("#btn-MakesureDir").hide();
                        $('#WatchDirChoose').fancytree("destroy");
                        $.getJSON('/datamanage/dataimport/GetAllDir').done(function (rsp) {
                            $('#WatchDirChoose').fancytree({
                                selectMode: 2,
                                clickFolderMode: 1,
                                autoScroll: true,
                                source: rsp.data.array,
                                iconClass: function (event, data) {
                                    return "fa fa-folder fa-fw";
                                },
                            });
                        });
                    });
                });
            })
        }

        function autoGetEncoding() {
            if ($('#taskType-Select')[0].value == 2) {
                setparams.setEncoding('UTF-8');
                return;
            }

            $("#fileEcoding-Select")[0].selectedIndex = 7;
            var file = document.getElementById("selectFile-Button").files[0];
            if (file == undefined) {
                alert("请先选择样本文件！");
                return;
            }
            var viewText = file.slice(0, viewSize);
            var read = new FileReader();
            read.readAsBinaryString(viewText);
            read.onload = function (e) {
                //showLoader();
                //$("#fileContent").attr("value", this.result);

                var encodingStr = this.result;
                if (encodingStr.length > 10000) {
                    encodingStr = encodingStr.substr(0, 10000);
                }
                try {
                    encoding = jschardet.detect(encodingStr).encoding;
                }
                catch (e) {
                    Notify.show({
                        title: "自动识别文件编码失败！",
                        type: "error"
                    });
                    encoding = undefined;
                }
                //console.log(jschardet.detect(this.result));
                //hideLoader();

                console.log("encoding", encoding);
                if (encoding != undefined) {
                    if (encoding == 'ISO-8859-2')
                        encoding = 'UTF-8';
                    for (var i = 0; i < $("#fileEcoding-Select")[0].options.length; ++i) {
                        if ($("#fileEcoding-Select")[0].options[i].value == encoding
                            || encoding.search($("#fileEcoding-Select")[0].options[i].value) >= 0) {
                            //Notify.show({
                            //    title: "文件编码:" + encoding,
                            //    type: "info"
                            //});
                            $("#fileEcoding-Select")[0].selectedIndex = i;
                            return;
                        }
                    }
                    $("#fileEcoding-Select")[0].selectedIndex = 3;
                    Notify.show({
                        title: "无法自动识别该文件编码！",
                        type: "info"
                    });
                    //$("#fileEcoding-Select")[0].selectedIndex = 3;
                }
                else {
                    $("#fileEcoding-Select")[0].selectedIndex = 3;
                    Notify.show({
                        title: "无法自动识别该文件编码！",
                        type: "info"
                    });
                }
            }
        }

        function showOracleConnDialog() {
            Dialog.build({
                title: "连接数据库",
                content: '<div class="section"> <label class="field-label"> 数据库类型：</label><select id="dbTypeSelect"><option value="1" selected="selected">Oracle数据库</option> '
                    //+ '<option value="2">MySql数据库</option>'
                + ' </select></div>'
                + '<div class="section"> <label class="field-label"> 用户名：</label><input type="text" class="form-control" id="dbUserName" style="padding-right:0px;" > </div>'
                + '<div class="section"> <label class="field-label"> 密码：</label> <input type="password" class="form-control" id="dbPassWord" style="padding-right:0px;" ></div>'
                + '<div class="section"> <label class="field-label"> 数据库IP：</label> <input type="text" class="form-control" id="dataBaseIP" style="padding-right:0px;" ></div>'
                + '<div class="section"> <label class="field-label"> 数据库实例名：</label> <input type="text" class="form-control" id="dBInstance" style="padding-right:0px;" ></div>'
                + '<div class="section" > <button type="button" id="dbTestBtn" class="btn btn-success" style="float:right;horiz-align: right;"><span >测试连接数据库</span></button></div><br>'
                + '<div class="section"> <label class="field-label"> 表名称：</label> <input type="text" class="form-control" id="dbTable" style="padding-right:0px;" ></div>'
                + '<div class="section"> <label class="field-label"> where语句：</label> <input type="text" class="form-control" id="whereClause" style="padding-right:0px;" ></div>',

                rightBtnCallback: function () {// 确认
                    var dbType = $("#dbTypeSelect")[0].value;
                    var url = "";
                    var driver = "";
                    switch (dbType) {
                        case "1":
                            url = "jdbc:oracle:thin:@" + $("#dataBaseIP")[0].value.trim() + "/" + $("#dBInstance")[0].value.trim();
                            driver = "oracle.jdbc.driver.OracleDriver";
                            break;
                        case "2":
                            url = "jdbc:mysql://" + $("#dataBaseIP")[0].value.trim() + "/" + $("#dBInstance")[0].value.trim();
                            driver = "com.mysql.jdbc.Driver";
                            break;
                        default :
                            break;
                    }
                    $.post('/datamanage/dataimport/ShowTableInfo', {
                        "dbType": $("#dbTypeSelect")[0].value,
                        "url": url, //"jdbc:oracle:thin:@" + $("#dataBaseIP")[0].value +"/" + $("#dBInstance")[0].value, //url, //"jdbc:oracle:thin:@192.168.20.50/diadmin",
                        "user": $("#dbUserName")[0].value, //userName, //"diadmin",
                        "password": $("#dbPassWord")[0].value, //passWord, //"841_sjzc",
                        "driver": driver, //"oracle.jdbc.driver.OracleDriver",
                        "tableName": $("#dbTable")[0].value,
                        "whereClause": $("#whereClause")[0].value.trim().length > 0 ? ("where " + $("#whereClause")[0].value.trim()) : ""
                    }).done(function (res) {
                        var data = JSON.parse(res);
                        if (data.code == 0) {
                            //console.log(data.data);
                            //alert("数据成功！");
                            //$("#filepath-Input").val($("#dbTable").val());
                            dbType = $("#dbTypeSelect")[0].value;
                            $("#filepath-Input").attr("value", $("#dbTable")[0].value);
                            userName = $("#dbUserName")[0].value;
                            passWord = $("#dbPassWord")[0].value;
                            dbIP = $("#dataBaseIP")[0].value;
                            instanceName = $("#dBInstance")[0].value;
                            dbTableName = $("#dbTable")[0].value;
                            whereClause = $("#whereClause")[0].value.trim().length > 0 ? ("where " + $("#whereClause")[0].value.trim()) : "";
                            columnCount = data.data.heads.length;
                            dbDataArray = data.data.rows;
                            dbDataArray.unshift(data.data.heads);
                            viewDBContent(data.data.heads, data.data.rows);
                            headArray = data.data.heads;
                            $.magnificPopup.close();
                        }
                        else {
                            //$.magnificPopup.close();
                            alert(data.message);
                        }
                    });
                    //$.magnificPopup.close();
                }
            }).show(function () {
                //var userName = $("#dbUserName")[0].value;
                //var passWord = $("#dbPassWord")[0].value;
                //var url = "jdbc:oracle:thin:@";
                //url += $("#dataBaseIP")[0].value +"/"  + $("#dBInstance")[0].value;
                setOracleConnDialog();
                $("#dbTestBtn").click(function () {
                    //alert($("#dbUserName")[0].value);
                    var dbType = $("#dbTypeSelect")[0].value;
                    var url = "";
                    var driver = "";
                    switch (dbType) {
                        case "1":
                            url = "jdbc:oracle:thin:@" + $("#dataBaseIP")[0].value.trim() + "/" + $("#dBInstance")[0].value.trim();
                            driver = "oracle.jdbc.driver.OracleDriver";
                            break;
                        case "2":
                            url = "jdbc:mysql://" + $("#dataBaseIP")[0].value.trim() + "/" + $("#dBInstance")[0].value.trim();
                            driver = "com.mysql.jdbc.Driver";
                            break;
                        default :
                            break;
                    }

                    $.post('/datamanage/dataimport/ShowTables', {
                        "dbType": $("#dbTypeSelect")[0].value,
                        "url": url, //"jdbc:oracle:thin:@" + $("#dataBaseIP")[0].value +"/"  + $("#dBInstance")[0].value, //url, //"jdbc:oracle:thin:@192.168.20.50/diadmin",
                        "user": $("#dbUserName")[0].value, //userName, //"diadmin",
                        "password": $("#dbPassWord")[0].value, //passWord, //"841_sjzc",
                        "driver": driver, //"oracle.jdbc.driver.OracleDriver",
                    }).done(function (res) {
                        var data = JSON.parse(res);
                        if (data.code == 0) {
                            //console.log(data.data);
                            Notify.show({
                                title: "连接数据库成功！",
                                type: "success"
                            });
                        }
                        else {
                            Notify.show({
                                title: "连接数据库失败！",
                                type: "error"
                            });
                            alert(data.message);
                        }
                    });
                });
            });
        }

        function setOracleConnDialog() {
            $("#filepath-Input").attr("value", dbTableName);
            $('#dbTypeSelect option[value="' + dbType + '"]').attr("selected", "true");
            $("#dbUserName").attr("value", userName);
            $("#dbPassWord").attr("value", passWord);
            $("#dataBaseIP").attr("value", dbIP);
            $("#dBInstance").attr("value", instanceName);
            $("#dbTable").attr("value", dbTableName);
            var clause = whereClause.split('where');
            if (clause.length > 1)
                $("#whereClause").attr("value", clause[1].trim());
            else
                $("#whereClause").attr("value", '');
        }

        function setDBConnInfo(dbConnInfo) {
            console.log("setDBConnInfo dbConnInfo", dbConnInfo);
            dbType = dbConnInfo.dbType;
            userName = dbConnInfo.userName;
            passWord = dbConnInfo.passWord;
            dbIP = dbConnInfo.dbServerIP;
            instanceName = dbConnInfo.dbInstance;
            dbTableName = dbConnInfo.extractTBName;
            whereClause = dbConnInfo.whereClause;
            columnCount = dbConnInfo.columnCount;
            $("#filepath-Input").attr("value", dbTableName);
        }

        //用户选择的文件类型变化
        function fileTypeChanged() {
            fileType = getparams.getFileType();
            console.log("fileTypeChanged fileType", fileType);
            FileUtil.setInitUploadPanel();
            switch (fileType) {
                case 'txt':
                    $("#selectFile-Button")[0].type = 'file';
                    $("#selectFileBtn").show();
                    $("#submit_preview")[0].textContent = '预览';
                    document.getElementById("submit_preview").style.width = 60 + "px";
                    $("#autoGetEncodingBtn").removeClass("disabled");
                    $("#id_delimiter_row0-Select")[0].disabled = false;
                    $("#id_delimiter_col0")[0].disabled = false;
                    break;
                case 'excel':
                    $("#selectFile-Button")[0].type = '';
                    $("#submit_preview")[0].textContent = '预览';
                    document.getElementById("submit_preview").style.width = 60 + "px";
                    $("#autoGetEncodingBtn").addClass("disabled");
                    $("#id_delimiter_row0-Select")[0].disabled = true;
                    $("#id_delimiter_col0")[0].disabled = true;
                    setparams.setRowDelimeter(xlsxRowDelimeter);
                    setparams.setColDelimeter(xlsxColDelimeter);
                    setparams.setHeadDef(1);
                    break;
                case 'dataBase':
                    $("#submit_preview")[0].textContent = '连接数据库并预览';
                    document.getElementById("submit_preview").style.width = 150 + "px";
                    setparams.setRowDelimeter(xlsxRowDelimeter);
                    setparams.setColDelimeter(xlsxColDelimeter);
                    setparams.setHeadDef(1);
                    break;
                default:
                    $("#selectFile-Button")[0].type = 'file';
                    $("#submit_preview")[0].textContent = '预览';
                    document.getElementById("submit_preview").style.width = 60 + "px";
                    $("#selectFileBtn").show();
                    $("#autoGetEncodingBtn").removeClass("disabled");
                    $("#id_delimiter_row0-Select")[0].disabled = false;
                    $("#id_delimiter_col0")[0].disabled = false;
                    break;
            }

            //switch (fileType) {
            //    case 1:
            //        $("#selectFileBtn").show();
            //        $("#submit_preview")[0].textContent = '预览';
            //        document.getElementById("submit_preview").style.width = 60 + "px";
            //        $("#autoGetEncodingBtn").removeClass("disabled");
            //        $("#id_delimiter_row0-Select")[0].disabled = false;
            //        $("#id_delimiter_col0")[0].disabled = false;
            //        break;
            //    case 2:
            //        $("#submit_preview")[0].textContent = '上传文件并预览';
            //        document.getElementById("submit_preview").style.width = 120 + "px";
            //        $("#selectFileBtn").hide();
            //        $("#autoGetEncodingBtn").addClass("disabled");
            //        $("#id_delimiter_row0-Select")[0].disabled = true;
            //        $("#id_delimiter_col0")[0].disabled = true;
            //        setparams.setRowDelimeter(xlsxRowDelimeter);
            //        setparams.setColDelimeter(xlsxColDelimeter);
            //        setparams.setHeadDef(1);
            //        break;
            //    case 4:
            //        $("#submit_preview")[0].textContent = '连接数据库并预览';
            //        document.getElementById("submit_preview").style.width = 150 + "px";
            //        setparams.setRowDelimeter(xlsxRowDelimeter);
            //        setparams.setColDelimeter(xlsxColDelimeter);
            //        setparams.setHeadDef(1);
            //        break;
            //    default:
            //        $("#submit_preview")[0].textContent = '预览';
            //        document.getElementById("submit_preview").style.width = 60 + "px";
            //        $("#selectFileBtn").show();
            //        $("#autoGetEncodingBtn").removeClass("disabled");
            //        $("#id_delimiter_row0-Select")[0].disabled = false;
            //        $("#id_delimiter_col0")[0].disabled = false;
            //        break;
            //}
        }

        function initRefresh() {
            toRefreshMapTable = true;
            toRefreshPreViewTable = true;
        }

        function uploadExcelForPreview() {
            try {
                var path = fileRootPath;
                var ipExp = /\{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
                var ipStr = ipExp.exec(path);
                console.log(ipStr);
                var opts = {
                    isPreView: true,
                    ip: ipStr,
                    isexcel: true,
                    accept: '.xls,.xlsx'
                };
                FileUtil.uploadFile(opts);
            } catch (e) {
                hideLoader();
                Notify.show({
                    title: "发生异常！",
                    type: "error"
                });
            }
        }

        //根据用户设置，切分、展示文件
        function displayFile() {
            //excel文件
            if (fileType == 'excel') {
                getFilePreViewRes();
            }
            //连接数据库
            else if (fileType == 'dataBase') {
                showOracleConnDialog();
            }
            else {
                var file = document.getElementById("selectFile-Button").files[0];
                console.log("displayFile file", file);
                if (file == undefined) {
                    Notify.show({
                        title: "未能读取到样本文件！",
                        type: "error"
                    });
                }
                if (file.type.indexOf("text") >= 0) {//文本文件
                    ecoding = getparams.getfileEncoding();
                    if (ecoding == undefined || ecoding.length <= 0) {
                        Notify.show({
                            title: "请先选择编码格式！",
                            type: "error"
                        });
                        return;
                    }
                    else
                        txtParse(file);
                }
                else if (file.type.indexOf("sheet") >= 0) {
                    try {
                        var opts = {
                            isPreView: true,
                            isexcel: true,
                            accept: '.xls, .xlsx'
                        };
                        FileUtil.uploadFile(opts);
                    } catch (e) {
                        hideLoader();
                        alert(e);
                    }
                }
                else {
                    var fileNameArray = file.name.split(".", 1000);
                    if (fileNameArray.length > 0) {
                        var postfixStr = fileNameArray[fileNameArray.length - 1];
                        switch (postfixStr) {
                            case "bcp":
                                txtParse(file);
                                break;
                            default :
                                Notify.show({
                                    title: "该文件类型暂时不能解析！",
                                    type: "warn"
                                });
                                break;
                        }
                    }
                    else {
                        Notify.show({
                            title: "该文件类型暂时不能解析！",
                            type: "warn"
                        });
                    }
                }
            }
        }

        function txtParse(file) {
            var viewText = file.slice(0, viewSize);
            //console.log(viewText.size);
            var read = new FileReader();
            ecoding = getparams.getfileEncoding();
            console.log("ecoding", ecoding);
            read.readAsText(viewText, ecoding);//, "GB2312");
            read.onload = function (e) {
                //$("#fileContent").attr("value", this.result);
                textContent = this.result;
                //console.log("textContent", textContent);
                isFirstRowHead = getparams.getIsFirstRowHead();
                rowSplit = getparams.getRowSplit();
                colSplit = getparams.getColSplit();
                viewFileContent();
                //viewFileContent(textContent, rowSplit, colSplit);
            }
        }

        function xlsxParse() {
            $("#filepath-Input").attr("value", oldFileName);
            showLoader();
            $.post('/datamanage/dataimport/xlsxParse', {
                newName: newFileName,
                oldFileName: oldFileName
            }).done(function (res) {
                hideLoader();
                var data1 = JSON.parse(res);
                if (data1.code == 0) {
                    var dataArray = data1.data;
                    console.log("xlsxParse", dataArray);
                    isFirstRowHead = getparams.getIsFirstRowHead();
                    xlsxDataArray = dataArray;

                    preViewText = "";
                    for (var i = 0; i < dataArray.length && i < 20; ++i) {
                        colArray = dataArray[i];
                        var rowContent = "";
                        for (var j = 0; j < colArray.length; ++j) {
                            preViewText += colArray[j];
                            preViewText += xlsxColDelimeter;
                            rowContent += colArray[j];
                            rowContent += xlsxColDelimeter;
                        }
                        rowArray.push(rowContent);
                        preViewText += xlsxRowDelimeter;
                    }
                    viewXlsxContent(dataArray);
                }
            });
            //hideLoader();
        }

        function getFilePreViewRes() {
            $("#filepath-Input").attr("value", oldFileName);
            showLoader();
            console.log("getFilePreViewRes1");
            $.post('/datamanage/dataimport/checkUploadResult', {
                fileName: tmpNewName
            }).done(
                function (res) {
                    hideLoader();
                    var data1 = JSON.parse(res);
                    console.log("getFilePreViewRes data1", data1);
                    console.log("getFilePreViewRes", data1);
                    if (data1.code == 0) {
                        var dataArray = data1.data.resultArray;
                        console.log("xlsxParse", dataArray);
                        isFirstRowHead = getparams.getIsFirstRowHead();
                        xlsxDataArray = dataArray;

                        preViewText = "";
                        for (var i = 0; i < dataArray.length && i < 20; ++i) {
                            colArray = dataArray[i];
                            var rowContent = "";
                            for (var j = 0; j < colArray.length; ++j) {
                                preViewText += colArray[j];
                                preViewText += xlsxColDelimeter;
                                rowContent += colArray[j];
                                rowContent += xlsxColDelimeter;
                            }
                            rowArray.push(rowContent);
                            preViewText += xlsxRowDelimeter;
                        }
                        viewXlsxContent(dataArray);
                    }
                    else {
                        console.log("checkUploadResult", data1.message);
                        hideLoader();
                    }
                }
            );
        }

        function viewDBContent(headArray, dataArray) {
            var viewTable = document.getElementById("viewTable");
            for (var i = viewTable.rows.length - 1; i >= 0; --i)
                viewTable.deleteRow(i);
            colNum = 0;
            preViewText = "";
            rowArray.length = 0;
            var rowContent = "";

            console.log("viewDBContent, headArray", headArray);
            //if (headArray != undefined && headArray.length > 0) {
            //    curRow = viewTable.insertRow();
            //    for (var i = 0; i < headArray.length; ++i) {
            //        cell = curRow.insertCell();
            //        cell.innerHTML = headArray[i];
            //        rowContent += headArray[j];
            //        rowContent += xlsxColDelimeter;
            //        preViewText += headArray[j];
            //        preViewText += xlsxColDelimeter;
            //    }
            //    rowArray.push(rowContent);
            //    rowContent = "";
            //    preViewText += xlsxRowDelimeter;
            //}
            //else {
            //    curRow = viewTable.insertRow(); //.insertRow();
            //    for (var i = 1; i <= colNum; ++i) {
            //        cell = curRow.insertCell();
            //        cell.innerHTML = "列" + i.toString(); //'<select> </select>';
            //    }
            //}

            rowContent = "";
            for (var i = 0; i < dataArray.length && i < 20; ++i) {
                colArray = dataArray[i];

                curRow = viewTable.insertRow();
                if (colNum < colArray.length)
                    colNum = colArray.length;
                for (var j = 0; j < colArray.length; ++j) {
                    //console.log(colArray[j]);
                    cell = curRow.insertCell();
                    cell.innerHTML = colArray[j];
                    preViewText += colArray[j];
                    preViewText += xlsxColDelimeter;
                    rowContent += colArray[j];
                    rowContent += xlsxColDelimeter;
                }
                rowArray.push(rowContent);
                rowContent = "";
                preViewText += xlsxRowDelimeter;
            }
            viewTable.rows[0].classList.add('tableHead');
        }

        function viewXlsxContent(dataArray) {
            var viewTable = document.getElementById("viewTable");

            for (var i = viewTable.rows.length - 1; i >= 0; --i)
                viewTable.deleteRow(i);
            colNum = 0;
            preViewText = "";
            rowArray.length = 0;
            var rowContent = "";
            for (var i = 0; i < dataArray.length && i < 20; ++i) {
                colArray = dataArray[i];

                curRow = viewTable.insertRow();
                if (colNum < colArray.length)
                    colNum = colArray.length;
                for (var j = 0; j < colArray.length; ++j) {
                    //console.log(colArray[j]);
                    cell = curRow.insertCell();
                    cell.innerHTML = colArray[j];
                    preViewText += colArray[j];
                    preViewText += xlsxColDelimeter;
                    rowContent += colArray[j];
                    rowContent += xlsxColDelimeter;
                }
                preViewText += xlsxRowDelimeter;
                rowArray.push(rowContent);
                rowContent = "";
            }
            if (!isFirstRowHead) {
                curRow = viewTable.insertRow(0); //.insertRow();
                curRow.classList.add('tableHead');
                for (var i = 1; i <= colNum; ++i) {
                    cell = curRow.insertCell();
                    cell.innerHTML = "列" + i.toString(); //'<select> </select>';
                }
            }
            else {
                viewTable.rows[0].classList.add('tableHead');
            }
        }

        function viewFileContent() {
            var viewTable = document.getElementById("viewTable");
            preViewText = "";

            rowArray = textContent.split(rowSplit, maxRowNum);
            console.log("rowArray", rowArray);

            for (var i = viewTable.rows.length - 1; i >= 0; --i)
                viewTable.deleteRow(i);
            colNum = 0;
            if (rowArray.length - 1 <= 0) {
                Notify.show({
                    title: "文件切分失败，可能是行列分割符设置错误！",
                    type: "error"
                });
            }
            for (var i = 0; i < rowArray.length; ++i) {
                colArray = rowArray[i].split(colSplit, maxcolNum);
                //console.log("colArray", colArray);

                curRow = viewTable.insertRow();
                if (colNum < colArray.length) {
                    colNum = colArray.length;// + getparams.getnewAddColsNum();
                }

                for (var j = 0; j < colArray.length; ++j) {
                    //console.log(colArray[j]);
                    cell = curRow.insertCell();
                    cell.innerHTML = util.processStr(colArray[j]);
                    //cell.innerHTML = colArray[j];
                    //cell.innerText = colArray[j];
                }
            }
            if (!isFirstRowHead) {
                curRow = viewTable.insertRow(0); //.insertRow();
                curRow.classList.add('tableHead');
                for (var i = 1; i <= colNum; ++i) {
                    cell = curRow.insertCell();
                    cell.innerHTML = "列" + i.toString(); //'<select> </select>';
                }
            }
            else {
                viewTable.rows[0].classList.add('tableHead');
            }
        }

        function setPreViewTableForFirstTimeOfDB() {
            var preViewTable = document.getElementById("preView-Table");

            for (var i = preViewTable.rows.length - 1; i >= 0; --i)
                preViewTable.deleteRow(i);
            colNum = 0;
            for (var i = 0; i < dbDataArray.length && i < 20; ++i) {
                colArray = dbDataArray[i];

                curRow = preViewTable.insertRow();
                if (colNum < colArray.length)
                    colNum = colArray.length;
                for (var j = 0; j < colArray.length; ++j) {
                    //console.log(colArray[j]);
                    cell = curRow.insertCell();
                    cell.innerHTML = colArray[j];
                }
            }
            //if (!isFirstRowHead) {
            //    curRow = preViewTable.insertRow(0); //.insertRow();
            //    for (var i = 1; i <= colNum; ++i) {
            //        cell = curRow.insertCell();
            //        cell.innerHTML = "列" + i.toString(); //'<select> </select>';
            //    }
            //}
            //else {
            headArray = dbDataArray[0];
            preViewTable.rows[0].classList.add('tableHead');
            console.log("headArray", headArray);
            //}
        }

        function setPreViewTableForFirstTimeOfXlsx() {
            var preViewTable = document.getElementById("preView-Table");

            for (var i = preViewTable.rows.length - 1; i >= 0; --i)
                preViewTable.deleteRow(i);
            colNum = 0;
            for (var i = 0; i < xlsxDataArray.length && i < 20; ++i) {
                colArray = xlsxDataArray[i];

                curRow = preViewTable.insertRow();
                if (colNum < colArray.length)
                    colNum = colArray.length;
                for (var j = 0; j < colArray.length; ++j) {
                    //console.log(colArray[j]);
                    cell = curRow.insertCell();
                    cell.innerHTML = colArray[j];
                }
            }
            if (!isFirstRowHead) {
                curRow = preViewTable.insertRow(0); //.insertRow();
                curRow.classList.add('tableHead');
                for (var i = 1; i <= colNum; ++i) {
                    cell = curRow.insertCell();
                    cell.innerHTML = "列" + i.toString(); //'<select> </select>';
                }
            }
            else {
                headArray = xlsxDataArray[0];
                preViewTable.rows[0].classList.add('tableHead');
                console.log("headArray", headArray);
            }
        }

        function setPreViewTableForFirstTimeOfTxt(splitResult) {
            textContent = splitResult;

            isFirstRowHead = getparams.getIsFirstRowHead();
            rowSplit = getparams.getRowSplit();
            colSplit = getparams.getColSplit();

            var preViewTable = document.getElementById("preView-Table");

            rowArray = textContent.split(rowSplit, maxRowNum);


            for (var i = preViewTable.rows.length - 1; i >= 0; --i)
                preViewTable.deleteRow(i);

            preViewText = "";
            for (var i = 0; i < rowArray.length; ++i) {
                preViewText += rowArray[i] + rowSplit;
                colArray = rowArray[i].split(colSplit, maxcolNum);

                curRow = preViewTable.insertRow();
                if (colNum < colArray.length)
                    colNum = colArray.length;
                for (var j = 0; j < colArray.length; ++j) {
                    cell = curRow.insertCell();
                    cell.innerHTML = colArray[j];
                }
            }

            if (!isFirstRowHead) {
                curRow = preViewTable.insertRow(0); //.insertRow();
                curRow.classList.add('tableHead');
                for (var i = 1; i <= colNum; ++i) {
                    cell = curRow.insertCell();
                    cell.innerHTML = "列" + i.toString(); //'<select> </select>';
                }
            }
            else {
                headArray = rowArray[0].split(colSplit, maxcolNum);
                preViewTable.rows[0].classList.add('tableHead');
                console.log("headArray", headArray);
            }
            //console.log("preViewText", preViewText);
        }

        function setPreViewTableForFirstTime(fileType, splitResult) {
            switch (fileType) {
                case 'txt':
                    setPreViewTableForFirstTimeOfTxt(splitResult);
                    break;
                case 'excel':
                    setPreViewTableForFirstTimeOfXlsx();
                    break;
                case 'dataBase':
                    setPreViewTableForFirstTimeOfDB();
                    break;
                default:
                    break;
            }
        }

        //字段映射表下拉菜单选择改变响应事件，
        // 1，改变outputColArray数组，即字段映射数组；2，更新已使用字段filedIndex数组，更新每个select下拉菜单的选项
        function selectedItemChangedForMapTable(objId) {
            // console.log("usedFieldIndexArray", usedFieldIndexArray);
            //var obj = event.data.obj;
            var e = window.event;
            var obj = e.srcElement;
            var objArray = obj.id.split('-');
            if(objArray.length < 5){
                return;
            }
            if(objArray[4].length <= 0)
                var objValue = -1;
            else
                var objValue = objArray[4]; //String("#" + objId)[0].value;//obj.id.split('-');//
            // if (obj) {
            //     if (outputColArray[obj.id] != -1 && outputColArray[obj.id] != undefined) {
            //         usedFieldIndexArray.splice(usedFieldIndexArray.indexOf(outputColArray[obj.id]), 1);
            //     }
            //     outputColArray[obj.id] = obj.value;
            //     usedFieldIndexArray.push(parseInt(obj.value));
            // }
            if (obj) {
                if (outputColArray[objId] != -1 && outputColArray[objId] != undefined) {
                    usedFieldIndexArray.splice(usedFieldIndexArray.indexOf(outputColArray[objId]), 1);
                }
                outputColArray[objId] = objValue;
                usedFieldIndexArray.push(parseInt(objValue));
            }
            console.log("selectedItemChangedForMapTable objValue", objValue);
            console.log("outputColArray", outputColArray);
            //console.log("usedFieldIndexArray", usedFieldIndexArray);

            // console.log("usedFieldIndexArray", usedFieldIndexArray);
            updateSelectForMapTable();
            // console.log("usedFieldIndexArray", usedFieldIndexArray);
        }

        //列映射有变化后，更新所有的下拉菜单
        function updateSelectForMapTable() {
            // return;

            var setTable = document.getElementById("setTable");
            if (setTable.rows.length > 0) {
                setTable.deleteRow(rowMapIndex);
            }
            var curRow = setTable.insertRow(rowMapIndex);

            //for (var i = 0; i < outputColArray.length; ++i) {
            for (var i = 0; i < preColNum; ++i) {
                var cell = curRow.insertCell();
                var htmlStr = '<select class="select2-white form-control edit mapSelect" id="' + i + '">';

                htmlStr += ' <option value="-1">' + "  " + '</option> ';
                for (var fIndex = 0; fIndex < colInfoArrayOfDataType.length; ++fIndex) {
                    if (i < outputColArray.length && colInfoArrayOfDataType[fIndex].fieldIndex == outputColArray[i]) {
                        htmlStr += ' <option value="'
                            + colInfoArrayOfDataType[fIndex].fieldIndex + '" selected="selected" >'
                            + colInfoArrayOfDataType[fIndex].displayName + '</option> ';
                        outputColArray[i] = colInfoArrayOfDataType[fIndex].fieldIndex;
                    }
                    else {
                        if (usedFieldIndexArray.indexOf(colInfoArrayOfDataType[fIndex].fieldIndex) < 0)
                            htmlStr += ' <option value="' + colInfoArrayOfDataType[fIndex].fieldIndex
                                + '" >' + colInfoArrayOfDataType[fIndex].displayName + '</option> ';
                    }
                }

                htmlStr += ' </select>'
                cell.innerHTML = htmlStr;

                var itemStr = String("#" + i);

                // $(itemStr).bind("change", function () {
                //     console.log("change", $(itemStr)[0].id);
                //     selectedItemChangedForMapTable($(itemStr)[0].id);
                //     // selectedItemChangedForMapTable(i);
                // });

                // $(itemStr).select2();
            }

            $('.mapSelect').bind("change", function () {
                // console.log("change", $(this));
                selectedItemChangedForMapTable($(this)[0].id);
                // selectedItemChangedForMapTable(i);
            });

            $('#setTable tbody tr td').find("select").each(function () {
                $(this).select2();
            });
        }

        //为每一列设置，可选字段下拉菜单
        function setDataTypeColumFieldsForFirstTime(setColNum) {
            rowMapIndex = 0;
            toRefreshMapTable = false;
            preColNum = setColNum;
            //colNum = colNum + getparams.getnewAddColsNum();
            outputColArray = new Array(setColNum);

            //根据fieldIndex对字段进行排序
            colInfoArrayOfDataType.sort(function (a, b) {
                return a.fieldIndex - b.fieldIndex;
            });
            recommendFieldsParams.fieldsNameArray = new Array();
            recommendFieldsParams.nameArray = new Array();
            recommendFieldsParams.fieldIndexArray = new Array();
            //console.log("colInfoArrayOfDataType", colInfoArrayOfDataType);
            for (var fIndex = 0; fIndex < colInfoArrayOfDataType.length; ++fIndex) {
                if (colInfoArrayOfDataType[fIndex].name != 'RECORD_ID' && colInfoArrayOfDataType[fIndex].name != 'LOAD_ID') {
                    recommendFieldsParams.fieldsNameArray.push(colInfoArrayOfDataType[fIndex].displayName);
                    recommendFieldsParams.fieldIndexArray.push(colInfoArrayOfDataType[fIndex].fieldIndex);
                    recommendFieldsParams.nameArray.push(colInfoArrayOfDataType[fIndex].name);
                }
            }

            var setTable = document.getElementById("setTable");
            var curRow = setTable.insertRow(0); //.insertRow();
            var offSet = 0;
            usedFieldIndexArray = util.initUsedFieldIndexArray(setColNum, offSet, colInfoArrayOfDataType);
            // console.log("usedFieldIndexArray", usedFieldIndexArray);

            for (var i = 0; i < setColNum; ++i) {
                var cell = curRow.insertCell();
                var htmlStr = '<select class="select2-white form-control edit mapSelect" id="' + i + '">';

                htmlStr += ' <option value="-1">' + "  " + '</option> ';
                for (var fIndex = 0; fIndex < colInfoArrayOfDataType.length; ++fIndex) {
                    //if (colInfoArrayOfDataType[fIndex].fieldIndex - i == offSet) {
                    if (fIndex - i == offSet) {
                        htmlStr += ' <option value="'
                            + colInfoArrayOfDataType[fIndex].fieldIndex + '" selected="selected" >'
                            + colInfoArrayOfDataType[fIndex].displayName + '</option> ';
                        outputColArray[i] = colInfoArrayOfDataType[fIndex].fieldIndex;
                    }
                    else {
                        if (usedFieldIndexArray.indexOf(colInfoArrayOfDataType[fIndex].fieldIndex) < 0)
                            htmlStr += ' <option value="' + colInfoArrayOfDataType[fIndex].fieldIndex
                                + '" >' + colInfoArrayOfDataType[fIndex].displayName + '</option> ';
                    }
                }
                htmlStr += ' </select>'
                cell.innerHTML = htmlStr;

                var itemStr = String("#" + i);

                $(itemStr).bind("change", function () {
                    // selectedItemChangedForMapTable($(itemStr)[0].id);
                    selectedItemChangedForMapTable($(this)[0].id);
                    // selectedItemChangedForMapTable(i);
                });

                // $(itemStr).select2();
            }

            $('#setTable tbody tr td').find("select").each(function () {
                $(this).select2();
            });

            for (var i = 0; i < outputColArray.length; ++i) {
                if (outputColArray[i] == undefined) {
                    outputColArray[i] = -1;
                }
            }
        }

        function updateFieldsColor(cellIndex, id) {
            var rowFields = $("#setTable")[0].rows[0];
            for (var i = 0; i < rowFields.cells[cellIndex].children.length; ++i) {
                rowFields.cells[cellIndex].children[i].style.color = 'blue';
                rowFields.cells[cellIndex].children[id].style.color = 'orangered';
            }
            //console.log(rowFields.cells[cellIndex]);
        }

        //智能推荐功能，生成参数，调取生成推荐字段的方法和服务
        function setRecommendFiledsParams() {
            recommendFieldsParams.isHaveHead = getparams.getIsFirstRowHead();
            recommendFieldsParams.colNum = colNum;
            recommendFieldsParams.colsContentArray = new Array();
            //txt
            if (fileType == 'txt') {
                if (textContent == undefined)
                    return;
                else {
                    //console.log("textContent", textContent);
                    rowArray = textContent.split(getparams.getRowSplit(), maxRowNum);
                    if (getparams.getIsFirstRowHead() || isUpdateHead) {
                        recommendFieldsParams.headArray = rowArray[0].split(getparams.getColSplit(), maxcolNum);
                        for (var i = 1; i < rowArray.length - 1; ++i) {
                            colArray = rowArray[i].split(getparams.getColSplit(), maxcolNum);
                            recommendFieldsParams.colsContentArray[i] = new Array();
                            for (var j = 0; j < colArray.length; ++j) {
                                recommendFieldsParams.colsContentArray[i][j] = colArray[j];
                            }
                        }
                    }
                    else {
                        for (var i = 0; i < rowArray.length; ++i) {
                            colArray = rowArray[i].split(getparams.getColSplit(), maxcolNum);
                            recommendFieldsParams.colsContentArray[i] = new Array();
                            for (var j = 0; j < colArray.length; ++j) {
                                recommendFieldsParams.colsContentArray[i][j] = colArray[j];
                            }
                        }
                    }
                }
            }
            //xlsx，数据库
            else if (fileType == 'excel' || fileType == 'dataBase') {
                if (preViewText == undefined)
                    return;
                else {
                    rowArray = preViewText.split(xlsxRowDelimeter, maxRowNum);
                    if (getparams.getIsFirstRowHead()) {
                        recommendFieldsParams.headArray = rowArray[0].split(xlsxColDelimeter, maxcolNum);
                        for (var i = 1; i < rowArray.length - 1; ++i) {
                            colArray = rowArray[i].split(xlsxColDelimeter, maxcolNum);
                            recommendFieldsParams.colsContentArray[i] = new Array();
                            for (var j = 0; j < colArray.length; ++j) {
                                recommendFieldsParams.colsContentArray[i][j] = colArray[j];
                            }
                        }
                    }
                    else {
                        for (var i = 0; i < rowArray.length; ++i) {
                            colArray = rowArray[i].split(xlsxColDelimeter, maxcolNum);
                            recommendFieldsParams.colsContentArray[i] = new Array();
                            for (var j = 0; j < colArray.length; ++j) {
                                recommendFieldsParams.colsContentArray[i][j] = colArray[j];
                            }
                        }
                    }
                }

                //if (getparams.getIsFirstRowHead()) {
                //    recommendFieldsParams.headArray = xlsxDataArray[0];
                //    for (var i = 1; i < xlsxDataArray.length - 1; ++i) {
                //        colArray = xlsxDataArray[i];
                //        recommendFieldsParams.colsContentArray[i] = new Array();
                //        for (var j = 0; j < colArray.length; ++j) {
                //            recommendFieldsParams.colsContentArray[i][j] = colArray[j];
                //        }
                //    }
                //}
                //else {
                //    for (var i = 0; i < xlsxDataArray.length - 1; ++i) {
                //        colArray = xlsxDataArray[i];
                //        recommendFieldsParams.colsContentArray[i] = new Array();
                //        for (var j = 0; j < colArray.length; ++j) {
                //            recommendFieldsParams.colsContentArray[i][j] = colArray[j];
                //        }
                //    }
                //}
            }
            //数据库

            console.log("recommendFieldsParams", recommendFieldsParams);
            if (recommendFieldsParams.isHaveHead || isUpdateHead) {
                var recommendFiledsArray = fieldsMap.generateRecFieldsForCols(recommendFieldsParams);
                console.log("recommendFiledsArray", recommendFiledsArray);
                //将获取推荐字段，显示在界面上
                smartMapFields(recommendFieldsParams, recommendFiledsArray);
            }
            else {
                Notify.show({
                    title: "暂不支持无表头的智能映射！",
                    type: "failed"
                });
                return;

                showLoader();
                $.post('/datamanage/dataMap/MapTableRecommend', {
                    "params": recommendFieldsParams,
                }).done(function (res) {
                        hideLoader();
                        var data = JSON.parse(res);
                        console.log("data.recommendFiledsArray:", data.recommendFiledsArray);
                        //将获取推荐字段，显示在界面上
                        smartMapFields(recommendFieldsParams, data.recommendFiledsArray);
                    }
                );
            }
        }

        //将获取推荐字段，显示在界面上
        //智能映射字段
        function smartMapFields(recommendFieldsParams, recommendFiledsArray) {
            //console.log("smartMapFields");

            //有表头
            if (recommendFieldsParams.isHaveHead || isUpdateHead) {
                //console.log("有表头!");
                outputColArray = new Array(colNum);

                var rowMap = $("#setTable")[0].rows[rowMapIndex];
                var setTable = document.getElementById("setTable");
                if (rowMapIndex > 0) {
                    for (var i = rowMapIndex; i >= 1; --i)
                        setTable.deleteRow(i - 1);
                }
                rowMapIndex = 0;
                cancelMapFields();
                curRow = setTable.insertRow(0);
                rowMapIndex = 1;
                var offSet = 1;

                for (var i = 0; i < rowMap.cells.length; ++i) {
                    if (recommendFiledsArray[i] == undefined) {
                        cell = curRow.insertCell();
                        cell.innerHTML = "无推荐";
                        continue;
                    }
                    recommendFiledsArray[i].sort(function (a, b) {
                        return a.maxComparePercent - b.maxComparePercent;
                    });
                    if (recommendFiledsArray[i].length <= 0 || recommendFiledsArray[i][0].maxComparePercent <= 0) {
                        rowMap.cells[i].children[0].selectedIndex = 0;
                        outputColArray[i] = -1;
                        cell = curRow.insertCell();
                        cell.innerHTML = "无推荐";
                    }
                    else {
                        rowMap.cells[i].children[0].selectedIndex =
                            recommendFiledsArray[i][recommendFiledsArray[i].length - 1].suitFiledName;
                        outputColArray[i] = recommendFiledsArray[i][recommendFiledsArray[i].length - 1].suitFiledName;

                        cell = curRow.insertCell();

                        for (var j = recommendFiledsArray[i].length - 1; j >= 0; --j) {
                            if (j == recommendFiledsArray[i].length - 1 && recommendFiledsArray[i][j].maxComparePercent > 0) {
                                cell.innerHTML += "<lable id='" + i + "_" + (recommendFiledsArray[i][j].suitFiledName) + "_" + j
                                    + "' style='color:orangered; cursor:pointer'>"
                                    + recommendFiledsArray[i][j].filedName
                                        //+ (recommendFieldsParams.fieldsNameArray[recommendFiledsArray[i][j].suitFiledName])
                                    + "("
                                        //+ recommendFieldsParams.nameArray[recommendFiledsArray[i][j].suitFiledName]
                                        //+ ","
                                    + recommendFiledsArray[i][j].maxComparePercent.toFixed(0) + ")" + "</lable><br>";

                                $("#setTable").on("click", "#" + i + "_"
                                    + (recommendFiledsArray[i][j].suitFiledName) + "_" + j, lableClick);
                                //i, recommendFiledsArray[i][j].suitFiledName
                            }
                            else if (recommendFiledsArray[i][j].maxComparePercent > 0) {
                                cell.innerHTML += "<lable id='" + i + "_" + (recommendFiledsArray[i][j].suitFiledName) + "_" + j
                                    + "' style='color:blue; cursor:pointer'>"
                                    + recommendFiledsArray[i][j].filedName
                                        //+ (recommendFieldsParams.fieldsNameArray[recommendFiledsArray[i][j].suitFiledName])
                                    + "("
                                        //+ recommendFieldsParams.nameArray[recommendFiledsArray[i][j].suitFiledName]
                                        //+ ","
                                    + recommendFiledsArray[i][j].maxComparePercent.toFixed(0) + ")" + "</lable><br>";

                                $("#setTable").on("click", "#" + i + "_"
                                    + (recommendFiledsArray[i][j].suitFiledName) + "_" + j, lableClick);
                            }
                        }

                        cell.innerHTML += "<lable id='" + i + "_-1_" + 0
                            + "' style='color:blue; cursor:pointer'>"
                            + "不映射" + "</lable><br>";
                        $("#setTable").on("click", "#" + i + "_-1_" + 0, lableClick);
                    }
                }

                for (var i = 0; i < outputColArray.length; ++i) {
                    if (outputColArray[i] == undefined) {
                        outputColArray[i] = -1;
                    }
                }
            }
            //无表头
            else {
                console.log("无表头!");
                outputColArray = new Array(colNum);

                var rowMap = $("#setTable")[0].rows[rowMapIndex];
                var setTable = document.getElementById("setTable");
                if (rowMapIndex > 0) {
                    for (var i = rowMapIndex; i >= 1; --i)
                        setTable.deleteRow(i - 1);
                }
                rowMapIndex = 0;
                curRow = setTable.insertRow(0);
                rowMapIndex = 1;
                var offSet = 1;
                for (var i = 0; i < rowMap.cells.length; ++i) {
                    if (recommendFiledsArray[i] != undefined && recommendFiledsArray[i].length == 0) {
                        rowMap.cells[i].children[0].selectedIndex = 0;
                        outputColArray[i] = -1;
                        cell = curRow.insertCell();
                        cell.innerHTML = "无推荐";
                        continue;
                    }
                    recommendFiledsArray[i].sort(function (a, b) {
                        return a.maxComparePercent - b.maxComparePercent;
                    });
                    console.log("pd", recommendFiledsArray[i]);
                    if (recommendFiledsArray[i].length == undefined || recommendFiledsArray[i].length <= 0
                        || recommendFiledsArray[i][0].maxComparePercent <= 0) {
                        rowMap.cells[i].children[0].selectedIndex = 0;
                        outputColArray[i] = -1;
                        cell = curRow.insertCell();
                        cell.innerHTML = "无推荐";
                        console.log("无推荐");
                    }
                    else {
                        rowMap.cells[i].children[0].selectedIndex =
                            recommendFiledsArray[i][recommendFiledsArray[i].length - 1].suitFiledName;
                        outputColArray[i] = recommendFiledsArray[i][recommendFiledsArray[i].length - 1].suitFiledName;

                        cell = curRow.insertCell();
                        //cell.innerHTML = "<div id='div1'>";
                        //class='tagc1'

                        for (var j = recommendFiledsArray[i].length - 1; j >= 0; --j) {
                            if (j == recommendFiledsArray[i].length - 1 && recommendFiledsArray[i][j].maxComparePercent > 0) {
                                cell.innerHTML += "<lable id='" + i + "_" + (recommendFiledsArray[i][j].suitFiledName) + "_" + j
                                    + "' style='color:orangered; cursor:pointer'>"
                                    + (recommendFieldsParams.fieldsNameArray[recommendFiledsArray[i][j].suitFiledName])
                                    + "(" + recommendFiledsArray[i][j].maxComparePercent.toFixed(0) + ")" + "</lable><br>";

                                $("#setTable").on("click", "#" + i + "_" + (recommendFiledsArray[i][j].suitFiledName) + "_" + j, lableClick);
                                //i, recommendFiledsArray[i][j].suitFiledName
                            }
                            else if (recommendFiledsArray[i][j].maxComparePercent > 0) {
                                cell.innerHTML += "<lable id='" + i + "_" + (recommendFiledsArray[i][j].suitFiledName) + "_" + j
                                    + "' style='color:blue; cursor:pointer'>"
                                    + (recommendFieldsParams.fieldsNameArray[recommendFiledsArray[i][j].suitFiledName])
                                    + "(" + recommendFiledsArray[i][j].maxComparePercent.toFixed(0) + ")" + "</lable><br>";

                                $("#setTable").on("click", "#" + i + "_" + (recommendFiledsArray[i][j].suitFiledName) + "_" + j, lableClick);
                            }
                        }
                        //cell.innerHTML += "</div>"
                    }
                }

                for (var i = 0; i < outputColArray.length; ++i) {
                    if (outputColArray[i] == undefined) {
                        outputColArray[i] = -1;
                    }
                }
            }

            // console.log("outputColArray", outputColArray);
            usedFieldIndexArray = util.updateUsedFieldIndexArray(outputColArray);
            // console.log("usedFieldIndexArray", usedFieldIndexArray);
            updateSelectForMapTable();
        }

        //单击推荐的字段
        function lableClick() {
            console.log("lableClick");
            var id = this.id;
            var cellIndex = 0;
            var fieldIndex = 0;
            var orderIndex = 0;
            console.log("id", id);
            cellIndex = id.split("_")[0];
            fieldIndex = id.split("_")[1];
            orderIndex = id.split("_")[2];


            // var rowMap = $("#setTable")[0].rows[rowMapIndex];
            // rowMap.cells[cellIndex].children[0].selectedIndex =
            //     util.getselectedIndex(rowMap.cells[cellIndex].children[0], fieldIndex);

            var itemStr = String("#" + cellIndex);
            $(itemStr).val(fieldIndex);
            $(itemStr).trigger('change');
            outputColArray[cellIndex] = fieldIndex;

            updateFieldsColor(cellIndex, id);
        }

        //顺序映射字段
        function orderMapFields() {
            var offSetStr = $("#autoMap-offSet").val().trim();
            if (util.checkIsNum(offSetStr)) {
                Notify.show({
                    title: "\"顺序映射偏移量\"必须为整数！",
                    type: "error"
                });
                return;
            }
            var offSet = parseInt(offSetStr);//2;
            console.log("offSet", offSet);

            var setTable = document.getElementById("setTable");
            if (rowMapIndex > 0) {
                for (var i = rowMapIndex; i >= 1; --i)
                    setTable.deleteRow(i - 1);
            }
            rowMapIndex = 0;
            cancelMapFields();
            outputColArray = new Array(colNum);
            var rowMap = $("#setTable")[0].rows[rowMapIndex];
            usedFieldIndexArray = [];
            for (var i = 0; i < rowMap.cells.length; ++i) {
                if (i + offSet < 0) {
                    // if (rowMap.cells[i].children[0].selectedIndex != 0) {
                    //     usedFieldIndexArray.splice(usedFieldIndexArray.indexOf(rowMap.cells[i].children[0].selectedIndex), 1);
                    // }
                    rowMap.cells[i].children[0].selectedIndex = 0;
                    outputColArray[i] = -1;
                }
                else {
                    if (rowMap.cells[i].children[0][i + offSet] != undefined) {
                        // if (rowMap.cells[i].children[0].selectedIndex != 0) {
                        //     usedFieldIndexArray.splice(usedFieldIndexArray.indexOf(rowMap.cells[i].children[0].selectedIndex), 1);
                        // }
                        rowMap.cells[i].children[0].selectedIndex = i + offSet;
                        outputColArray[i] = parseInt(rowMap.cells[i].children[0][i + offSet].value);
                        usedFieldIndexArray.push(parseInt(rowMap.cells[i].children[0][i + offSet].value));
                    }
                    else {
                        // if (rowMap.cells[i].children[0].selectedIndex != 0) {
                        //     usedFieldIndexArray.splice(usedFieldIndexArray.indexOf(rowMap.cells[i].children[0].selectedIndex), 1);
                        // }
                        rowMap.cells[i].children[0].selectedIndex = 0;
                        outputColArray[i] = -1;
                    }
                }
            }

            for (var i = 0; i < outputColArray.length; ++i) {
                if (outputColArray[i] == undefined || outputColArray[i] < -1) {
                    outputColArray[i] = -1;
                }
            }

            console.log("outputColArray", outputColArray);
            console.log("usedFieldIndexArray", usedFieldIndexArray);
            updateSelectForMapTable();
        }

        //取消字段映射
        function cancelMapFields() {
            var setTable = document.getElementById("setTable");
            if (rowMapIndex > 0) {
                for (var i = rowMapIndex; i >= 1; --i)
                    setTable.deleteRow(i - 1);
            }
            rowMapIndex = 0;

            outputColArray = new Array(colNum);
            usedFieldIndexArray = [];
            var rowMap = $("#setTable")[0].rows[rowMapIndex];
            for (var i = 0; i < rowMap.cells.length; ++i) {
                // if (rowMap.cells[i].children[0].selectedIndex != 0) {
                //     usedFieldIndexArray.splice(usedFieldIndexArray.indexOf(rowMap.cells[i].children[0].selectedIndex), 1);
                // }
                rowMap.cells[i].children[0].selectedIndex = 0;
                outputColArray[i] = -1;
            }

            for (var i = 0; i < outputColArray.length; ++i) {
                if (outputColArray[i] == undefined) {
                    outputColArray[i] = -1;
                }
            }

            updateSelectForMapTable();
        }

        //检查字段映射
        function checkMapFields() {
            $("#setTable tbody tr td").removeClass("preViewColSelected");
            var mappedFieldsArray = new Array();
            for (var i = 0; i < outputColArray.length; ++i) {
                if (outputColArray[i] == undefined) {
                    outputColArray[i] = -1;
                }
                else if (outputColArray[i] != -1) {
                    if (mappedFieldsArray[outputColArray[i]] == undefined) {
                        mappedFieldsArray[outputColArray[i]] = new Object({
                            "colsArray": []
                        });
                        mappedFieldsArray[outputColArray[i]].colsArray.push(i);
                    }
                    else {
                        mappedFieldsArray[outputColArray[i]].colsArray.push(i);
                    }
                    if (mappedFieldsArray[outputColArray[i]].colsArray.length > 1) {
                        warnFieldsMapConflict(mappedFieldsArray[outputColArray[i]].colsArray);
                        return false;
                    }
                }
            }

            Notify.show({
                title: " 检查字段映射成功！",
                type: "success"
            });
            return true;
        }

        //显示冲突列
        function warnFieldsMapConflict(colsArray) {
            if (colsArray == undefined || colsArray.length <= 1)
                return;

            var td;
            var tableRows = $("#setTable tbody tr");

            for (var colIndex = 0; colIndex < colsArray.length; ++colIndex) {
                var curColIndex = colsArray[colIndex];
                for (var i = 0; i < tableRows.length; ++i) {
                    if ($("#setTable")[0].rows[i].cells.length > 0
                        && $("#setTable")[0].rows[i].cells[curColIndex] != null) {
                        td = $("#setTable")[0].rows[i].cells[curColIndex].classList;
                        td.add('preViewColSelected');
                    }
                }
            }
            Notify.show({
                title: "列映射有冲突！",
                type: "error"
            });
        }

        function setDataTypeId(batchDataTypeId, batchCenterCode, categoryOfDataType) {
            console.log(batchDataTypeId);
            if (batchDataTypeId !== undefined) {
                //alert("batchDataTypeId："+batchDataTypeId);
                //$.getJSON('/datamanage/dataimport/listdatasource').done(function (rsp) {
                $.getJSON('/datamanage/dataimport/datatypetree').done(function (rsp) {
                    dataTypeId = batchDataTypeId;
                    var dataTypesArray = rsp.data[0].children;
                    //console.log(dataTypesArray);
                    for (var i = 0; i < dataTypesArray.length; ++i) {
                        if (dataTypesArray[i].children != null) {
                            for (var j = 0; j < dataTypesArray[i].children.length; ++j) {
                                if (batchDataTypeId == dataTypesArray[i].children[j].typeId) {
                                    $("#dataType-Select").val(dataTypesArray[i].children[j].title);
                                    setUseableTaskType(categoryOfDataType);
                                    return;
                                }
                            }
                        }
                    }

                    var dataTypesArray = rsp.data[1].children;
                    //console.log(dataTypesArray);
                    for (var i = 0; i < dataTypesArray.length; ++i) {
                        if (dataTypesArray[i].children != null) {
                            for (var j = 0; j < dataTypesArray[i].children.length; ++j) {
                                if (batchDataTypeId == dataTypesArray[i].children[j].typeId) {
                                    $("#dataType-Select").val(dataTypesArray[i].children[j].title);
                                    setUseableTaskType(categoryOfDataType);
                                    return;
                                }
                            }
                        }
                    }
                })
            }
        }

        function setDataTypeInfo(DataTypeInfo, iscopyormodel) {
            console.log("DataTypeInfo", DataTypeInfo);
            dataTypeId = DataTypeInfo.typeId;
            centerCodeOfCurDataType = DataTypeInfo.centerCode;
            zoneIdOfCurDataType = DataTypeInfo.zoneId;
            categoryOfCurDataType = DataTypeInfo.category;
            $("#dataType-Select").val(DataTypeInfo.caption);
            if (!iscopyormodel)
                setUseableTaskType(categoryOfCurDataType);
        }

        function setOutputColArray(val) {
            outputColArray = val;
            usedFieldIndexArray = util.updateUsedFieldIndexArray(outputColArray);
            updateSelectForMapTable();
        }

        function generateTableHead() {
            Dialog.build({
                title: "选择数据类型",
                content: tplGenerateTableHead({
                    //loginname: "高级设置"
                }),
                rightBtnCallback: function () {
                    $.magnificPopup.close();
                }
            }).show(function () {
            });
        }

        //获取数据类型映射配置
        function getMapSet() {
            showDataConfigDialog();
        }

        //设置【获取配置映射对话框】的参数值
        function setDataConfigDialog(srcDatatypeInfo) {
            $('#dbTypeSelectForMap option[value="' + mapConfigDBParams.dbType + '"]').attr("selected", "true");
            $("#dbUserNameForMap").attr("value", mapConfigDBParams.userName);
            $("#dbPassWordForMap").attr("value", mapConfigDBParams.passWord);
            $("#dataBaseIPForMap").attr("value", mapConfigDBParams.dbIP);
            $("#dBInstanceForMap").attr("value", mapConfigDBParams.dbInstance);
            if(mapConfigDBParams.isByBatch){
                $("#batchCheckbox")[0].checked = true;
                $("#byBatchDiv").show();
            }
            else{
                $("#batchCheckbox")[0].checked = false;
                $("#byBatchDiv").hide();
            }
            //$("#dbTable").attr("value", dbTableName);

            var srcDatatypeInfoArray = [];
            var systemSelectHtml = '';
            var dataTypeSelectHtml = '';
            for (var i = 0; i < srcDatatypeInfo.length; ++i) {
                srcDatatypeInfoArray[srcDatatypeInfo[i].systemId] = srcDatatypeInfo[i];
                if (i <= 0) {
                    systemSelectHtml += ('<option selected value="' + srcDatatypeInfo[i].systemId + '">'
                    + srcDatatypeInfo[i].systemName + '</option>');
                    for (var j = 0; j < srcDatatypeInfo[i].srcDataTypeInfo.length; ++j) {
                        if (j <= 0) {
                            dataTypeSelectHtml += ('<option selected value="'
                            + srcDatatypeInfo[i].srcDataTypeInfo[j].ID + '">'
                            + srcDatatypeInfo[i].srcDataTypeInfo[j].NAME + '</option>');
                        }
                        else {
                            dataTypeSelectHtml += ('<option value="'
                            + srcDatatypeInfo[i].srcDataTypeInfo[j].ID + '">'
                            + srcDatatypeInfo[i].srcDataTypeInfo[j].NAME + '</option>');
                        }
                    }
                }
                else {
                    systemSelectHtml += ('<option value="' + srcDatatypeInfo[i].systemName + '">'
                    + srcDatatypeInfo[i].displayName + '</option>');
                }
            }
            $("#systemSelectForMap")[0].innerHTML = systemSelectHtml;
            $("#dataTypeSelectForMap")[0].innerHTML = dataTypeSelectHtml;

            $("#systemSelectForMap").change(function () {
                var systemId = $("#systemSelectForMap")[0].value;
                var curSrcDatatypeInfo = srcDatatypeInfoArray[systemId];
                if (curSrcDatatypeInfo != undefined) {
                    for (var j = 0; j < curSrcDatatypeInfo.srcDataTypeInfo.length; ++j) {
                        if (j <= 0) {
                            dataTypeSelectHtml += ('<option selected value="'
                            + curSrcDatatypeInfo.srcDataTypeInfo[j].ID + '">'
                            + curSrcDatatypeInfo.srcDataTypeInfo[j].NAME + '</option>');
                        }
                        else {
                            dataTypeSelectHtml += ('<option value="'
                            + curSrcDatatypeInfo.srcDataTypeInfo[j].ID + '">'
                            + curSrcDatatypeInfo.srcDataTypeInfo[j].NAME + '</option>');
                        }
                    }
                }
            });
        }

        //保存【获取配置映射对话框】的参数值
        function saveDataConfigDialog() {
            mapConfigDBParams.dbType = $("#dbTypeSelectForMap")[0].value;
            mapConfigDBParams.userName = $("#dbUserNameForMap")[0].value;
            mapConfigDBParams.passWord = $("#dbPassWordForMap")[0].value;
            mapConfigDBParams.dbIP = $("#dataBaseIPForMap")[0].value;
            mapConfigDBParams.dbInstance = $("#dBInstanceForMap")[0].value;
            mapConfigDBParams.isByBatch = $("#batchCheckbox").prop("checked");
        }

        //显示获取配置映射对话框
        function showDataConfigDialog() {
            Dialog.build({
                title: "获取配置映射",
                content: tplGetDataConfig({
                    //loginname: "高级设置"
                }),
                rightBtn: '获取配置',

                rightBtnCallback: getSrcHeaderInfo
            }).show(function () {
                getSrcDatatypeInfoByType(getSrcDatatypeInfoByTypeCallBack);
            });
        }

        function getSrcHeaderInfo() {// 确认
            cancelMapFields();
            var dbType = $("#dbTypeSelectForMap")[0].value;
            var url = $("#dataBaseIPForMap")[0].value.trim() + "/" + $("#dBInstanceForMap")[0].value.trim();
            saveDataConfigDialog();

            //基于对接任务获取配置
            if ($("#batchCheckbox").prop("checked") == true){
                if($("#dataTypeTaskSelectForMap")[0].value <= 0){
                    Notify.show({
                        title: "未选取对接任务或者对接任务异常！",
                        type: "warn"
                    });
                    return;
                }

                $.post('/datamanage/dataimport/GetSrcHeaderInfo', {
                    "database": $("#dbTypeSelectForMap")[0].value,
                    "url": url,
                    "user": $("#dbUserNameForMap")[0].value,
                    "password": $("#dbPassWordForMap")[0].value,
                    "centerCode": centerCodeOfCurDataType,
                    "systemId": $("#systemSelectForMap")[0].value,
                    "dataTypeId": $("#dataTypeSelectForMap")[0].value,
                    "batchId": $("#dataTypeTaskSelectForMap")[0].value
                }).done(function (res) {
                    var data = JSON.parse(res);
                    if (data.code == 0) {
                        console.log('GetSrcHeaderInfo', data.data);
                        saveDataConfigDialog();
                        var arrayTmp = [];
                        arrayTmp = data.data;
                        //arrayTmp.push(new Object({
                        //    'headName': '用户号码',
                        //    'srcType': 0,
                        //}));
                        //arrayTmp.push(new Object({
                        //    'headName': '对端号码',
                        //    'srcType': 1,
                        //}));
                        updateTableHead(data.data);
                        $.magnificPopup.close();
                    }
                    else {
                        console.log("GetSrcHeaderInfo失败！", data.message);
                        Notify.show({
                            title: "基于对接任务获取映射配置信息失败！",
                            type: "warn"
                        });
                        //$.magnificPopup.close();
                    }
                });
            }
            //基于数据类型获取配置
            else{
                $.post('/datamanage/dataimport/GetSrcHeaderInfoByType', {
                    "centerCode": centerCodeOfCurDataType,
                    'dataTypeId': dataTypeId,
                    "headerInfo": headArray, //["h1","h2","h3"],
                    "srcSystemId": $("#systemSelectForMap")[0].value, //80002,
                    "srcDataTypeId": $("#dataTypeSelectForMap")[0].value, //501
                }).done(function (res) {
                    var data = JSON.parse(res);
                    if (data.code == 0) {
                        console.log('GetSrcHeaderInfoByType', data.data);
                        saveDataConfigDialog();
                        var arrayTmp = [];
                        arrayTmp = data.data;
                        //arrayTmp.push(new Object({
                        //    'headName': '用户号码',
                        //    'srcType': 0,
                        //}));
                        //arrayTmp.push(new Object({
                        //    'headName': '对端号码',
                        //    'srcType': 1,
                        //}));
                        updateTableHead(data.data);
                        $.magnificPopup.close();
                    }
                    else {
                        console.log("GetSrcHeaderInfoByType失败！", data.message);
                        Notify.show({
                            title: "基于数据类型获取映射配置信息失败！",
                            type: "warn"
                        });
                        //$.magnificPopup.close();
                    }
                });
            }
        }

        function getSrcDatatypeInfoByType(getSrcDatatypeInfoByTypeCallBack) {
            $.post('/datamanage/dataimport/GetSrcDatatypeInfoByType', {
                "centerCode": centerCodeOfCurDataType,
                "dataTypeId": dataTypeId
            }).done(function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    console.log("GetSrcDatatypeInfoByType！", data.data);
                    var srcDatatypeInfo = data.data;
                    if (srcDatatypeInfo.length <= 0) {
                        Notify.show({
                            title: "该数据类型无可用配置信息！",
                            type: "info"
                        });
                        $.magnificPopup.close();
                    }
                    getSrcDatatypeInfoByTypeCallBack(srcDatatypeInfo);
                }
                else {
                    console.log("GetSrcDatatypeInfoByType失败！", data.message);
                    Notify.show({
                        title: "获取数据源数据类型信息失败！",
                        type: "error"
                    });
                    $.magnificPopup.close();
                }
            });
        }

        function getSrcDatatypeInfoByTypeCallBack(srcDatatypeInfo) {
            initDataConfigDialog(srcDatatypeInfo);
        }

        function initDataConfigDialog(srcDatatypeInfo) {
            setDataConfigDialog(srcDatatypeInfo);
            initBindEvent();

            //数据类型变化，触发时间，更新任务列表
            $("#dataTypeSelectForMap").change(function () {
                var taskSelectHtml = '';
                if (dataTypeInfoArrayForMap[$("#dataTypeSelectForMap")[0].value].batchList.length > 0) {
                    _.each(dataTypeInfoArrayForMap[$("#dataTypeSelectForMap")[0].value].batchList, function (item) {
                        taskSelectHtml += ('<option value="' + item + '">' + item + '</option>');
                    });
                }
                else
                    taskSelectHtml = ('<option selected value="0">无</option>');
                $("#dataTypeTaskSelectForMap")[0].innerHTML = taskSelectHtml;
            });
        }

        //获得字段映射配置后，更新表头
        function updateTableHead(headArray) {
            console.log("updateTableHead headArray", headArray);
            var setTable = document.getElementById("setTable");
            if (isUpdateHead)
                setTable.deleteRow(1);
            else
                isUpdateHead = true;
            var curRow = setTable.insertRow(1);
            curRow.classList.add('srcTableHead');

            var i = 0;
            var headArrayStr = '';
            var colSplitStr = getparams.getColSplit();
            for (i = 0; i < headArray.length && i < outputColArray.length; ++i) {
                cell = curRow.insertCell();
                cell.innerHTML = headArray[i].headName;
                if (headArray[i].srcType == 0)
                    cell.classList.add('oldHead');
                if (i != 0)
                    headArrayStr += colSplitStr + headArray[i].headName;
                else
                    headArrayStr += headArray[i].headName;
            }
            if (i < outputColArray.length) {
                for (; i < outputColArray.length; ++i) {
                    cell = curRow.insertCell();
                    cell.innerHTML = "列" + (i + 1).toString();
                    if (i != 0)
                        headArrayStr += colSplitStr + "列" + (i + 1).toString();
                    else
                        headArrayStr += "列" + (i + 1).toString();
                }
            }
            console.log("headArrayStr", headArrayStr);
            updateTextContent(headArrayStr);
        }

        //获得字段映射配置后，更新textContent
        function updateTextContent(headArrayStr) {
            if (fileType == 'txt') {
                textContent = headArrayStr + getparams.getRowSplit() + textContent;
                //console.log("updateTextContent textContent", textContent);
            }
            else if (fileType == 'excel' || fileType == 'dataBase') {
                preViewText = headArrayStr + xlsxRowDelimeter + preViewText;
            }
        }

        //给控件绑定事件
        function initBindEvent() {
            $("#batchCheckbox").change(function () {
                if ($("#batchCheckbox").prop("checked") == true){
                    $("#byBatchDiv").show();
                }
                else{
                    $("#byBatchDiv").hide();
                }
            });

            $("#getBatchListBtn").click(function () {
                var dbType = $("#dbTypeSelectForMap")[0].value;
                var url = $("#dataBaseIPForMap")[0].value.trim() + "/" + $("#dBInstanceForMap")[0].value.trim();

                $.post('/datamanage/dataimport/GetSrcDatatypeInfo', {
                    "database": $("#dbTypeSelectForMap")[0].value,
                    "url": url,
                    "user": $("#dbUserNameForMap")[0].value,
                    "password": $("#dbPassWordForMap")[0].value,
                    "systemId": $("#systemSelectForMap")[0].value,
                    "dataTypeId": $("#dataTypeSelectForMap")[0].value
                }).done(function (res) {
                    var data = JSON.parse(res);
                    if (data.code == 0) {
                        console.log("GetSrcDatatypeInfo成功！", data.data);
                        var taskSelectHtml = '';
                        if (data.data.length > 0) {
                            _.each(data.data, function (item) {
                                taskSelectHtml += ('<option value="' + item.batchID + '">' + item.batchName + '</option>');
                            });
                        }
                        else {
                            taskSelectHtml = ('<option selected value="0">无</option>');
                        }
                        $("#dataTypeTaskSelectForMap")[0].innerHTML = taskSelectHtml;
                    }
                    else {
                        console.log("GetSrcDatatypeInfo失败！", data.message);
                        Notify.show({
                            title: "获取该数据类型的对接任务失败！",
                            type: "error"
                        });
                    }
                });
            });
        }

        return {
            initRefresh: initRefresh,
            uploadExcelForPreview: uploadExcelForPreview,
            getMapSet: getMapSet,
            generateTableHead: generateTableHead,
            setDBConnInfo: setDBConnInfo,
            setColInfoArrayOfDataType: function (columnList) {
                colInfoArrayOfDataType = columnList;
            },
            taskTypeSelectedChanged: taskTypeSelectedChanged,
            setUseableTaskType: setUseableTaskType,
            setfileType: function (setfileType) {
                fileType = setfileType;
            },
            centerCodeOfCurDataType: function () {
                return centerCodeOfCurDataType;
            },
            zoneIdOfCurDataType: function () {
                return zoneIdOfCurDataType;
            },
            //categoryOfCurDataType: categoryOfCurDataType,
            setDataTypeInfo: setDataTypeInfo,
            setDataTypeId: setDataTypeId,
            getFileRootPath: function () {
                return fileRootPath;
            },
            setFileRootPath: function (_fileRootPath) {
                fileRootPath = _fileRootPath;
            },
            getHeadArray: function () {
                return headArray;
            },
            checkMapFields: checkMapFields,
            cancelMapFields: cancelMapFields,
            orderMapFields: orderMapFields,
            setRecommendFiledsParams: setRecommendFiledsParams,
            getColumnCount: function () {
                return columnCount;
            },
            getdbIP: function () {
                return dbIP;
            },
            getdbType: function () {
                return dbType;
            },
            getUserName: function () {
                return userName;
            },
            getPassWord: function () {
                return passWord;
            },
            getInstanceName: function () {
                return instanceName;
            },
            getdbTableName: function () {
                return dbTableName;
            },
            getWhereClause: function () {
                return whereClause;
            },
            getFileType: function () {
                return fileType;
            },
            setTmpNewName: function (tmpName) {
                tmpNewName = tmpName;
            },
            setOldFileName: function (oldName) {
                oldFileName = oldName;
            },
            fileTypeChanged: function () {
                return fileTypeChanged();
            },
            xlsxParse: function () {
                return xlsxParse();
            },
            getFilePreViewRes: function () {
                return getFilePreViewRes();
            },
            setNewFileName: function (fileName) {
                newFileName = fileName;
            },
            autoGetEncoding: function () {
                return autoGetEncoding();
            },
            getWatchDir: function () {
                return getWatchDir();
            },
            getDataType: function () {
                return getDataType();
            },
            getDataTypeId: function () {
                return dataTypeId;
            },
            getCenterCodeOfCurDataType: function () {
                return centerCodeOfCurDataType;
            },
            setCenterCode: function (centerCode) {
                centerCodeOfCurDataType = centerCode;
            },
            setTypeId: function (dataNum) {
                dataTypeId = dataNum;
            },
            hexToString: function (str) {
                return util.hexToString(str);
            },
            getMaxRowNum: function () {
                return maxRowNum;
            },
            getTextContent: function () {
                return textContent;
            },
            setOutputColArray: setOutputColArray,
            setDataTypeColumFieldsForFirstTime: function (setColNum) {
                setDataTypeColumFieldsForFirstTime(setColNum);
            },
            setPreViewTableForFirstTime: function (fileType, splitResult) {
                setPreViewTableForFirstTime(fileType, splitResult);
            },
            getToRefreshMapTable: function () {
                return toRefreshMapTable;
            },
            setToRefreshMapTable: function (val) {
                toRefreshMapTable = val;
            },
            getToRefreshPreViewTable: function () {
                return toRefreshPreViewTable;
            },
            setToRefreshPreViewTable: function (val) {
                toRefreshPreViewTable = val;
            },
            getOutputColArray: function () {
                return outputColArray;
            },
            getColRowNum: function () {
                return maxcolNum;
            },
            getRowArray: function () {
                return rowArray;
            },
            getfileEncoding: function () {
                return getparams.getfileEncoding();
            },
            getViewSize: function () {
                return viewSize;
            },
            getColSplit: function () {
                return getparams.getColSplit();
            },
            getRowSplit: function () {
                return getparams.getRowSplit();
            },
            getPreViewText: function () {
                return preViewText;
            },
            getColNum: function () {
                return colNum;
            },
            setColNum: function (val) {
                colNum = val;
            },
            getIsFirstRowHead: function () {
                return getparams.getIsFirstRowHead();
            },
            saveParameterSet: function () {
                return saveParameterSet();
            },
            addNode: function () {
                return addNode();
            },
            getSelectedFilePath: function () {
                return getSelectedFilePath();
            },
            displayFile: function () {
                return displayFile();
            },
            dataTypeChanged: function () {
                return dataTypeChanged();
            },
            initRulsTree: function () {
                return initRulsTree();
            },
            setOutCols: function (m_outColsIndex) {
                return setOutCols(m_outColsIndex);
            },
        }

    }
);

