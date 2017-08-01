/**
 * Created by root on 3/14/16.
 */

define(['../../dm/dataimport/dm-preview-util'],
    function (previewUtil) {
        var newAddColsNum = 0;

        function getFileType() {
            return $("#fileType-Select").val();

            //if ($("#txtRadio")[0].checked)
            //    return 1;
            //if ($("#xlsxRadio")[0].checked)
            //    return 2;
            //if ($("#dumpRadio")[0].checked)
            //    return 3;
            //if ($("#OracleRadio")[0].checked)
            //    return 4;
        }

        function getRowSplit() {
            var rowdelimiter = $('#id_delimiter_row0-Select').val();
            switch (rowdelimiter) {
                case "1":
                    return "\r\n";
                    break;
                case "2":
                    return "\n";
                    break;
                case "__other__":
                    if ($("#delimiter_row_check").is(":checked")) {
                        return previewUtil.hexToString($('#id_delimiter_row1').val().trim());
                    }
                    else {
                        return $('#id_delimiter_row1').val().trim();
                    }
                    break;

                default :
                    return;
            }
            return;
        }

        function getRowSplitFor16() {
            var rowdelimiter = $('#id_delimiter_row0-Select').val();
            switch (rowdelimiter) {
                case "1":
                    return "0d0a";
                    break;
                case "2":
                    return "0a";
                    break;
                case "__other__":
                    if ($("#delimiter_row_check").is(":checked")) {
                        return $('#id_delimiter_row1').val().trim();
                    }
                    else {
                        return previewUtil.stringToHex($('#id_delimiter_row1').val().trim());
                    }
                    break;

                default :
                    return;
            }
            return;
        }

        function getRowSplitForModel() {
            var rowdelimiter = $('#id_delimiter_row0-Select').val();
            switch (rowdelimiter) {
                case "1":
                    return "\\r\\n";
                    break;
                case "2":
                    return "\\n";
                    break;
                case "__other__":
                    if ($("#delimiter_row_check").is(":checked")) {
                        return previewUtil.hexToStringForModel($('#id_delimiter_row1').val().trim());
                    }
                    else {
                        return $('#id_delimiter_row1').val().trim();
                    }
                    break;

                default :
                    return;
            }
            return;
        }

        function getColSplitForModel() {
            var coldelimiter = $('#id_delimiter_col0').val();
            switch (coldelimiter) {
                case "1":
                    return "\\t";
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
                    if ($("#delimiter_col_check").is(":checked")) {
                        var colStr =  previewUtil.hexToStringForModel($('#id_delimiter_col1').val().trim());
                        return colStr;
                    }
                    else {
                        return $('#id_delimiter_col1').val().trim();
                    }
                    break;

                default :
                    return;
            }
            return;
        }

        function getColSplit() {
            var coldelimiter = $('#id_delimiter_col0').val();
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
                    if ($("#delimiter_col_check").is(":checked")) {
                        return previewUtil.hexToString($('#id_delimiter_col1').val().trim());
                    }
                    else {
                        return $('#id_delimiter_col1').val().trim();
                    }
                    break;

                default :
                    return;
            }
            return;
        }

        function getIsFirstRowHead() {
            //console.log($("#tableTitle-Checkbox").attr("checked"));

            if ($("#tableTitle-Checkbox").prop("checked") == true)
                isFirstRowHead = true;
            else
                isFirstRowHead = false;

            return isFirstRowHead;
        }

        function getfileEncoding() {
            return $("#fileEcoding-Select").val();
        }

        return {
            getnewAddColsNum: function () {
                return newAddColsNum;
            },
            setnewAddColsNum: function (nums) {
                newAddColsNum = nums;
            },
            getFileType: getFileType,
            getRowSplit: getRowSplit,
            getRowSplitFor16: getRowSplitFor16,
            getColSplit: getColSplit,
            getIsFirstRowHead: getIsFirstRowHead,
            getfileEncoding: getfileEncoding,
            getRowSplitForModel: getRowSplitForModel,
            getColSplitForModel: getColSplitForModel,
        }

    });
