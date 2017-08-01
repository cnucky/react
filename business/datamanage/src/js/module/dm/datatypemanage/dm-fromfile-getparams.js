/**
 * Created by root on 3/14/16.
 */

define(['../../dm/dataimport/dm-preview-util', 'jschardet', 'nova-notify'],
    function (util, jschardet, Notify) {
        var viewSize = 8 * 5000 * 100;

        function getFileType() {
            return $('#filetype-select').val();
        }

        function setEncoding(encoding) {
            if (encoding != undefined) {
                for (var i = 0; i < $("#file-encoding-select")[0].options.length; ++i) {
                    if ($("#file-encoding-select")[0].options[i].value == encoding) {
                        $("#file-encoding-select")[0].selectedIndex = i;
                        return;
                    }
                }
            }
        }

        function autoGetEncoding() {
            if ($('#file-encoding-select')[0].value == 2) {
                setEncoding('UTF-8');
                return;
            }

            $("#file-encoding-select")[0].selectedIndex = 7;
            var file = document.getElementById("selectfile-btn").files[0];
            if (file == undefined) {
                Notify.show({
                    title: "请先选择样本文件！",
                    type: "error"
                });
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
                    for (var i = 0; i < $("#file-encoding-select")[0].options.length; ++i) {
                        if ($("#file-encoding-select")[0].options[i].value == encoding
                            || encoding.search($("#file-encoding-select")[0].options[i].value) >= 0) {
                            //Notify.show({
                            //    title: "文件编码:" + encoding,
                            //    type: "info"
                            //});
                            $("#file-encoding-select")[0].selectedIndex = i;
                            return;
                        }
                    }
                    $("#file-encoding-select")[0].selectedIndex = 7;
                    Notify.show({
                        title: "无法自动识别该文件编码！",
                        type: "info"
                    });
                    $("#file-encoding-select")[0].selectedIndex = 7;
                }
                else {
                    $("#file-encoding-select")[0].selectedIndex = 7;
                    Notify.show({
                        title: "无法自动识别该文件编码！",
                        type: "info"
                    });
                }
            }
        }

        function getRowSplit() {
            var rowdelimiter = $('#row-delimiter-select').val();
            switch (rowdelimiter) {
                case "1":
                    return "\r\n";
                case "2":
                    return "\n";
                case "__other__":
                    if ($("#row-delimiter-checkbox").is(":checked")) {
                        return util.hexToString($('#row-delimiter-input').val().trim());
                    }
                    else {
                        return $('#row-delimiter-input').val().trim();
                    }
                default :
                    return;
            }
            return;
        }

        function getColSplit() {
            var coldelimiter = $('#col-delimiter-select').val();
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
                    if ($("#col-delimiter-checkbox").is(":checked")) {
                        return util.hexToString($('#col-delimiter-input').val().trim());
                    }
                    else {
                        return $('#col-delimiter-input').val().trim();
                    }
                    break;

                default :
                    return;
            }
            return;
        }

        function getIsFirstRowHead() {
            var isFirstRowHead = true;
            if ($("#tableheader-Checkbox").prop("checked") == true)
                isFirstRowHead = true;
            else
                isFirstRowHead = false;

            return isFirstRowHead;
        }

        function getfileEncoding() {
            var fileEcoding = $("#file-encoding-select").val();
            if (fileEcoding == "auto")
                fileEcoding = autoGetEncoding();
            return fileEcoding;
        }

        return {
            getFileType: getFileType,
            getRowSplit: getRowSplit,
            getColSplit: getColSplit,
            getIsFirstRowHead: getIsFirstRowHead,
            getfileEncoding: getfileEncoding,
            autoGetEncoding: autoGetEncoding,
        }

    });
