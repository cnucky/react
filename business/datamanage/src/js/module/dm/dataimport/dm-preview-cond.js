/**
 * Created by root on 3/14/16.
 */
define([],
    function () {
        var curRowIndexOfCondition = -1;

        //向规则生效条件表增加新的条件，即增加新的一行
        function addCondition() {
            var conditionsTable = document.getElementById("conditionsTable");
            var curRow = conditionsTable.insertRow();
            curRow.style.height = '25px';

            cell = curRow.insertCell();
            cell.innerHTML = '<select><option value="包含">包含</option>' +
                '<option value="不包含" >不包含</option>' +
                '<option value="长度大于" >长度大于</option>' +
                '<option value="长度等于" >长度等于</option>' +
                '<option value="长度小于" >长度小于</option>' +
                '<option value="为空" >为空</option>' +
                '<option value="以...结尾" >以...结尾</option>' +
                '<option value="不以...结尾" >不以...结尾</option>' +
                '<option value="以...开头" >以...开头</option>' +
                '<option value="不以...开头" >不以...开头</option>' +
                '<option value="不为空" >不为空</option>' +
                '</select>';

            var cell = curRow.insertCell();
            cell.innerHTML = '<input type="text" class="gui-input" style="width:90%">';
        }

        //从规则生效条件表中删除条件，即删除一行
        function delCondition() {
            var conditionsTable = document.getElementById("conditionsTable");
            if (curRowIndexOfCondition > 0) {
                conditionsTable.deleteRow(curRowIndexOfCondition);
            }
        }

        return {
            addCondition: addCondition,
            delCondition: delCondition,
            setcurRowIndexOfCondition: function (_index) {
                curRowIndexOfCondition = _index;
            },

        }

    });
