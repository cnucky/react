/**
 * Created by root on 3/14/16.
 */

define(['../../dm/dataimport/dm-preview-util'],
    function (previewUtil) {
        function setFileType(fileType) {
            switch (fileType) {
                case 'txt':
                    $('#fileType-Select')[0].selectedIndex = 0;
                    $('#fileType-Select option[value="txt"]').removeClass('hide');
                    $('#fileType-Select option[value="excel"]').removeClass('hide');
                    $('#fileType-Select option[value="dataBase"]').addClass('hide');
                    break;
                case 'excel':
                    $('#fileType-Select')[0].selectedIndex = 1;
                    $('#fileType-Select option[value="txt"]').removeClass('hide');
                    $('#fileType-Select option[value="excel"]').removeClass('hide');
                    $('#fileType-Select option[value="dataBase"]').addClass('hide');
                    break;
                case 'dataBase':
                    $('#fileType-Select')[0].selectedIndex = 3;
                    $('#fileType-Select option[value="txt"]').addClass('hide');
                    $('#fileType-Select option[value="excel"]').addClass('hide');
                    $('#fileType-Select option[value="dataBase"]').removeClass('hide');
                    break;
                default:
                    break;
            }
        }

        function setTaskType(taskType) {
            //console.log(taskType);
            if(taskType == 3){
                $("#unStructed-Checkbox")[0].checked = true;
                taskType = 2;
            }
            if (taskType != undefined) {
                if (taskType != 6 ) {
                    $("#taskType-Select")[0].selectedIndex = taskType - 1;
                }
                else
                    $("#taskType-Select")[0].selectedIndex = 2;

                if (taskType == 2) {
                    $("#collapseDetail").show();
                }
                else
                {
                    $("#collapseDetail").hide();
                }
            }
        }

        function setFileFilterRule(fileFilterRule){
            var rules = new Array();
            rules = fileFilterRule.split("/", 3);
            for(var i=0; i<rules.length; ++i){
                switch(i){
                    case 0:
                        $('#filterStart-Input')[0].value = rules[0];
                        break;
                    case 1:
                        $('#filterEnd-Input')[0].value = rules[1];
                        break;
                    case 2:
                        $('#filterInclude-Input')[0].value = rules[2];
                        break;
                    default :
                        break;
                }
            }
        }

        function setWatchDir(watchDir) {
            if (watchDir != undefined) {
                $('#watchDir-Input')[0].value = watchDir;
            }
        }

        function setHeadDef(haveHeadDef) {
            if (haveHeadDef == 0) {
                $("#tableTitle-Checkbox")[0].checked = false;
            }
            else {
                $("#tableTitle-Checkbox")[0].checked = true;
            }
        }

        function setEncoding(encoding) {
            if (encoding != undefined) {
                for (var i = 0; i < $("#fileEcoding-Select")[0].options.length; ++i) {
                    if ($("#fileEcoding-Select")[0].options[i].value == encoding) {
                        $("#fileEcoding-Select")[0].selectedIndex = i;
                        return;
                    }
                }
            }
        }

        function setRowDelimeter0(rowDelimeter) {
            switch (rowDelimeter) {
                case "\r\n":
                    $("#id_delimiter_row0-Select")[0].selectedIndex = 0;
                    break;
                case "\n":
                    $("#id_delimiter_row0-Select")[0].selectedIndex = 1;
                    break;

                default :
                    $("#id_delimiter_row0-Select")[0].selectedIndex = 2;
                    $("#id_delimiter_row1").show();
                    //$("#delimiter_row_check").show();
                    $("#delimiter_row_check")[0].style.display = "inline";
                    $("#delimiter_row_text").show();
                    $("#delimiter_row_check")[0].checked = previewUtil.changeHexCheck(rowDelimeter);//isDelimeterVisible(rowDelimeter);
                    $('#id_delimiter_row1')[0].value = previewUtil.changeUnvisibleCode(rowDelimeter);
                    break;
            }
        }

        function setColDelimeter0(colDelimeter) {
            switch (colDelimeter) {
                case "\t":
                    $("#id_delimiter_col0")[0].selectedIndex = 0;
                    break;
                case ";":
                    $("#id_delimiter_col0")[0].selectedIndex = 1;
                    break;
                case " ":
                    $("#id_delimiter_col0")[0].selectedIndex = 2;
                    break;
                case ",":
                    $("#id_delimiter_col0")[0].selectedIndex = 3;
                    break;

                default :
                    $("#id_delimiter_col0")[0].selectedIndex = 4;
                    $("#id_delimiter_col1").show();
                    //$("#delimiter_col_check").show();
                    $("#delimiter_col_check")[0].style.display = "inline";
                    $("#delimiter_col_text").show();
                    $("#delimiter_col_check")[0].checked = previewUtil.changeHexCheck(colDelimeter);//isDelimeterVisible(colDelimeter);
                    $('#id_delimiter_col1')[0].value = previewUtil.changeUnvisibleCode(colDelimeter);
                    break;
            }
        }

        function setRowDelimeter(rowDelimeter) {
            switch (rowDelimeter) {
                case "\r\n":
                    $("#id_delimiter_row0-Select")[0].selectedIndex = 0;
                    $("#id_delimiter_row1").hide();
                    $("#delimiter_row_check").hide();
                    $("#delimiter_row_text").hide();
                    break;
                case "\n":
                    $("#id_delimiter_row0-Select")[0].selectedIndex = 1;
                    $("#id_delimiter_row1").hide();
                    $("#delimiter_row_check").hide();
                    $("#delimiter_row_text").hide();
                    break;

                default :
                    $("#id_delimiter_row0-Select")[0].selectedIndex = 2;
                    $("#id_delimiter_row1").show();
                    //$("#delimiter_row_check").show();
                    $("#delimiter_row_check")[0].style.display = "inline";
                    $("#delimiter_row_text").show();
                    $("#delimiter_row_check")[0].checked = previewUtil.changeHexCheck(rowDelimeter);//isDelimeterVisible(rowDelimeter);
                    $('#id_delimiter_row1')[0].value = previewUtil.changeUnvisibleCode(rowDelimeter);
                    break;
            }
        }

        function setColDelimeter(colDelimeter) {
            switch (colDelimeter) {
                case "\t":
                    $("#id_delimiter_col0")[0].selectedIndex = 0;
                    $("#id_delimiter_col1").hide();
                    $("#delimiter_col_check").hide();
                    $("#delimiter_col_text").hide();
                    break;
                case ";":
                    $("#id_delimiter_col0")[0].selectedIndex = 1;
                    $("#id_delimiter_col1").hide();
                    $("#delimiter_col_check").hide();
                    $("#delimiter_col_text").hide();
                    break;
                case " ":
                    $("#id_delimiter_col0")[0].selectedIndex = 2;
                    $("#id_delimiter_col1").hide();
                    $("#delimiter_col_check").hide();
                    $("#delimiter_col_text").hide();
                    break;
                case ",":
                    $("#id_delimiter_col0")[0].selectedIndex = 3;
                    $("#id_delimiter_col1").hide();
                    $("#delimiter_col_check").hide();
                    $("#delimiter_col_text").hide();
                    break;
                default :
                    $("#id_delimiter_col0")[0].selectedIndex = 4;
                    $("#id_delimiter_col1").show();
                    //$("#delimiter_col_check").show();
                    $("#delimiter_col_check")[0].style.display = "inline";
                    $("#delimiter_col_text").show();
                    $("#delimiter_col_check")[0].checked = previewUtil.changeHexCheck(colDelimeter);//isDelimeterVisible(colDelimeter);
                    $('#id_delimiter_col1')[0].value = previewUtil.changeUnvisibleCode(colDelimeter);
                    break;
            }
        }

        //显示第二步中控件
        function showControlsForStep2() {
            $("#tableTitleLable").show();
            $("#fileEcodingLable").show();
            $("#rowSplitLable").show();
            $("#colSplitLable").show();
            $("#tableTitleDiv").show();
            $("#fileEcodingDiv").show();
            $("#rowSplitDiv").show();
            $("#colSplitDiv").show();
        }

        //隐藏第二步中控件
        function hideControlsForStep2() {
            $("#tableTitleLable").hide();
            $("#fileEcodingLable").hide();
            $("#rowSplitLable").hide();
            $("#colSplitLable").hide();
            $("#tableTitleDiv").hide();
            $("#fileEcodingDiv").hide();
            $("#rowSplitDiv").hide();
            $("#colSplitDiv").hide();
        }

        return {
            setFileType: setFileType,
            setTaskType: setTaskType,
            setWatchDir: setWatchDir,
            setHeadDef: setHeadDef,
            setEncoding: setEncoding,
            setRowDelimeter: setRowDelimeter,
            setColDelimeter: setColDelimeter,
            hideControlsForStep2: hideControlsForStep2,
            showControlsForStep2: showControlsForStep2,
            setFileFilterRule: setFileFilterRule,
        }

    });
