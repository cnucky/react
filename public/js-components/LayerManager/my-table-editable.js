var TableEditable = function () {

    return {

        init: function (id,itemList) {
            var ITEMLIST = itemList;  //已存在的字段

            //恢复行本来状态
            function restoreRow(oTable, nRow) {
                var aData = oTable.fnGetData(nRow);
                var jqTds = $('>td', nRow);

                for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
                    oTable.fnUpdate(aData[i], nRow, i, false);
                }

                oTable.fnDraw();
            }

            //编辑一行
            function editRow(oTable, nRow, isNew) {
                var aData = oTable.fnGetData(nRow);
                var jqTds = $('>td', nRow);
                jqTds[0].innerHTML = '<input type="text" class="m-wrap small" style="height: 25px;background-color:white;" value="' + aData[0] + '">';
                jqTds[1].innerHTML = '<select class="medium m-wrap" style="height: 25px !important;width: 150px !important;border: 1px solid #A8A8A8;">'+
                                        '<option value="1">'+i18n.t('gismodule.LayerManager.editTable.fieldType.string')+'</option>'+
                                        '<option value="2">'+i18n.t('gismodule.LayerManager.editTable.fieldType.num')+'</option>'+
                                        '<option value="3">'+i18n.t('gismodule.LayerManager.editTable.fieldType.time')+'</option>'+
                                      '</select>';
                jqTds[2].innerHTML = '<input type="text" class="m-wrap small" style="height: 25px;background-color:white;" value="' + aData[2] + '">';
                jqTds[3].innerHTML = '<input type="text" class="m-wrap small" style="height: 25px;background-color:white;" value="' + aData[3] + '">';
                jqTds[4].innerHTML = '<a class="edit" href=""><img src="../../layermanager/img/LayerManager/image/disk_blue_24_p.png" title="'+i18n.t('gismodule.LayerManager.editTable.btn.save')+'" style="width: 20px;height: 20px;"></a>';

                if(isNew)
                {
                    jqTds[5].innerHTML = '<a class="cancel" data-mode="new" href=""><img src="../../layermanager/img/LayerManager/image/undo_24_p.png" title="'+i18n.t('gismodule.LayerManager.editTable.btn.cancelAdd')+'" style="width: 20px;height: 20px;"></a>';
                }
                else
                {
                    jqTds[5].innerHTML = '<a class="cancel" href=""><img src="../../layermanager/img/LayerManager/image/undo_24_p.png" title="'+i18n.t('gismodule.LayerManager.editTable.btn.cancelEdit')+'" style="width: 20px;height: 20px;"></a>';
                }

                $(jqTds[0]).attr("width","25%");
                $(jqTds[1]).attr("width","25%");
                $(jqTds[2]).attr("width","15%");
                $(jqTds[3]).attr("width","15%");
                $(jqTds[4]).css({"width":"10%","text-align": "center"});
                $(jqTds[5]).css({"width":"10%","text-align": "center"});
            }

            //保存
            function saveRow(oTable, nRow) {
                var jqInputs = $('input', nRow);
                var jqSelect = $('select',nRow);
                oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
                oTable.fnUpdate(getTypeString($(jqSelect[0]).val()), nRow, 1, false);
                oTable.fnUpdate(jqInputs[1].value, nRow, 2, false);
                oTable.fnUpdate(jqInputs[2].value, nRow, 3, false);
                oTable.fnUpdate('<a class="edit" href="javascript:;"><img src="../../layermanager/img/LayerManager/image/edit_24_p.png" title="'+i18n.t('gismodule.LayerManager.editTable.btn.editField')+'" style="width: 20px;height: 20px;"</a>', nRow, 4, false);
                oTable.fnUpdate('<a class="delete" href="javascript:;"><img src="../../layermanager/img/LayerManager/image/delete_24_p.png" title="'+i18n.t('gismodule.LayerManager.editTable.btn.deleteField')+'" style="width: 20px;height: 20px;"></a>', nRow, 5, false);
                oTable.fnDraw();
//                $('#' + id).removeAttr("style");
            }

            //获取枚举值
            function getTypeString(num)
            {
                switch(num)
                {
                    case "1":return i18n.t('gismodule.LayerManager.editTable.fieldType.string');
                    case "2":return i18n.t('gismodule.LayerManager.editTable.fieldType.num');
                    case "3":return i18n.t('gismodule.LayerManager.editTable.fieldType.time');
                }
            }

            //校验数据能否被保存
            function validate(name,type,length,precision)
            {
                if(name == "")
                {
                    alert(i18n.t('gismodule.LayerManager.editTable.alert1'));
                    return false;
                }

                //展示命名不能重复
                if(jQuery.inArray(name,ITEMLIST) >= 0)
                {
                    alert(i18n.t('gismodule.LayerManager.editTable.alert2') + name + i18n.t('gismodule.LayerManager.editTable.alert3'));
                    return false;
                }

                //类型为“字符串”时，长度在1~65535之间，精度为0或“”
                if(type == "1")
                {
                    if(isNaN(length) || length < 1 || length > 65535)
                    {
                        alert(i18n.t('gismodule.LayerManager.editTable.alert2') + name + i18n.t('gismodule.LayerManager.editTable.alert4'));
                        return false;
                    }
                    if(isNaN(precision) || precision != 0)
                    {
                        alert(i18n.t('gismodule.LayerManager.editTable.alert2') + name + i18n.t('gismodule.LayerManager.editTable.alert5'));
                        return false;
                    }
                }

                //类型为“数值”时，长度在1~1000之间，精度为-10~10之间
                if(type == "2")
                {
                    if(isNaN(length)|| length < 1 || length > 1000)
                    {
                        alert(i18n.t('gismodule.LayerManager.editTable.alert2') + name + i18n.t('gismodule.LayerManager.editTable.alert6'));
                        return false;
                    }
                    if(isNaN(precision) || precision < -10 || precision > 10)
                    {
                        alert(i18n.t('gismodule.LayerManager.editTable.alert2') + name + i18n.t('gismodule.LayerManager.editTable.alert7'));
                        return false;
                    }
                }

                //类型为“时间”时，长度和精度都没有限制，设置为0，或空
                if(type == "3")
                {
                    if(isNaN(length)|| length != 0)
                    {
                        alert(i18n.t('gismodule.LayerManager.editTable.alert2') + name + i18n.t('gismodule.LayerManager.editTable.alert8'));
                        return false;
                    }
                    if(isNaN(precision) || precision != 0)
                    {
                        alert(i18n.t('gismodule.LayerManager.editTable.alert2') + name + i18n.t('gismodule.LayerManager.editTable.alert9'));
                        return false;
                    }
                }
            }

            function cancelEditRow(oTable, nRow) {
                var jqInputs = $('input', nRow);
                oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
                oTable.fnUpdate(jqInputs[1].value, nRow, 1, false);
                oTable.fnUpdate(jqInputs[2].value, nRow, 2, false);
                oTable.fnUpdate(jqInputs[3].value, nRow, 3, false);
                oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 4, false);
                oTable.fnDraw();
            }

            //初始化表格
            var oTable = $('#' + id).dataTable({
                "aLengthMenu": [
                    [5, 15, 20, -1],
                    [5, 15, 20, "All"] // change per page values here
                ],
                // set the initial value
                "iDisplayLength":  -1,
                "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
                "sPaginationType": "bootstrap",
                "oLanguage": {
                    "sLengthMenu": "_MENU_ records per page",
                    "oPaginate": {
                        "sPrevious": "Prev",
                        "sNext": "Next"
                    }
                },
                "aoColumnDefs": [{
                        'bSortable': false,
                        'aTargets': [0]
                    }
                ],
                "bLengthChange":false, //是否显示每页长度的选择分
                "bPaginate":false,     //是否显示分页器
                "bFilter":false,       //是否显示过滤器
                "bInfo":false          //是否显示页码信息
            });

            jQuery('#' + id + '_wrapper .dataTables_filter input').addClass("m-wrap medium"); // modify table search input
            jQuery('#' + id + '_wrapper .dataTables_length select').addClass("m-wrap small"); // modify table per page dropdown
            jQuery('#' + id + '_wrapper .dataTables_length select').select2({
                showSearchInput : false //hide search box with special css class
            }); // initialzie select2 dropdown

            var nEditing = null;

            $('#' + id + '_new').click(function (e) {

                if (nEditing !== null && nEditing != nRow)
                {
                    alert(i18n.t('gismodule.LayerManager.editTable.alert10'));
                    return;
                }

                e.preventDefault();
                var aiNew = oTable.fnAddData(['', '', '', '',
                        '<a class="edit" href=""><img src="../../layermanager/img/LayerManager/image/edit_24_p.png" style="width: 20px;height: 20px;"></a>', '<a class="cancel" data-mode="new" href=""><img src="../../layermanager/img/LayerManager/image/delete_24_p.png" style="width: 20px;height: 20px;"></a>'
                ]);
                var nRow = oTable.fnGetNodes(aiNew[0]);
                editRow(oTable, nRow, true);
                nEditing = nRow;
            });

            $('#' + id + ' a.delete').live('click', function (e) {
                e.preventDefault();

                if (confirm(i18n.t('gismodule.LayerManager.editTable.alert11')) == false) {
                    return;
                }

                var nRow = $(this).parents('tr')[0];
                oTable.fnDeleteRow(nRow);

                var name = nRow.childNodes[0].innerHTML;
                ITEMLIST.splice($.inArray(name,ITEMLIST),1);//在已有字段列表中删除该字段
            });

            $('#' + id + ' a.cancel').live('click', function (e) {
                e.preventDefault();
                if ($(this).attr("data-mode") == "new") {
                    var nRow = $(this).parents('tr')[0];
                    oTable.fnDeleteRow(nRow);
                } else {
                    restoreRow(oTable, nEditing);
//                    nEditing = null;
                }
                nEditing = null;
            });

            $('#' + id + ' a.edit').live('click', function (e) {
                e.preventDefault();

                /* Get the row as a parent of the link that was clicked on */
                var nRow = $(this).parents('tr')[0];

                if (nEditing !== null && nEditing != nRow) {
                    alert(i18n.t('gismodule.LayerManager.editTable.alert12'));
                    return;
                }
                else
                if (nEditing == nRow && this.children[0].title == i18n.t('gismodule.LayerManager.editTable.btn.save')) {
                    var parent = $(this).parent().parent();
                    var tds = parent[0].children;
                    var name = tds[0].children[0].value;
                    var type = tds[1].children[0].value;
                    var length = tds[2].children[0].value;
                    var precision =  tds[3].children[0].value;
                    if(validate(name,type,length,precision) == false) //校验是否能保存
                    {
                        return;
                    }
                    ITEMLIST.push(name);

                    if(length == "")
                    {
                        nEditing.childNodes[2].children[0].value = "0";
                    }
                    if(precision == "")
                    {
                        nEditing.childNodes[3].children[0].value = "0";
                    }
                    saveRow(oTable, nEditing);
                    nEditing = null;
                }
                else {
                    var name = nRow.childNodes[0].innerHTML;
                    ITEMLIST.splice($.inArray(name,ITEMLIST),1);//在已有字段列表中删除该字段
                    editRow(oTable, nRow, false);
                    nEditing = nRow;
                }
            });
        }

    };

}();