initLocales(require.context('../../../locales/system-manage', false, /\.js/));
require([
    '../../widget/department-tree',
    '../../tpl/log/tpl-log-query-table',
    '../../widget/jc-datetimepicker',
    'nova-dialog',
    'nova-notify',
    'utility/loaders',
    'jquery',
    'underscore',
    'utility/multiselect/bootstrap-multiselect',
    'utility/jquery/jqmaskedinput',
    'utility/bootstrap/bootstrap-maxlength'
], function(Tree, tplTable, Datetimepicker, Dialog, Notify, loaders, $, _) {
    hideLoader();

    tplTable = _.template(tplTable);

    var _departmentListData;
    var _moduleArrayID,_moduleArrayName;
    var _OperationArrayID,_OperationArrayName;
    var queryParams = {};
    queryParams.selectedModuleTypesID=[];
    queryParams.selectedModuleTypeName=[];
    queryParams.selectedOperationTypesID=[];
    queryParams.selectedOperationTypeName=[];

    var countPerPage = 200;
    var currentPage = 1;
    var lastItemId;
    var firstItemId;
    var currentLogData = {};

    var DEBUG = false;

    function _logd(args) {
        if (DEBUG) {
            console.log(args);
        }
    }
   


    // 初始化操作
    initUser();
    initModuleTypes();
    initOperationTypes();
    _daterangeInput('lastyear');

    function initModuleTypes() {
        var initPara = {
            maxHeight: 300,
            includeSelectAllOption:true,
            selectAllText:'全选',
            enableFiltering: true,
            enableCollapsibleOptGroups: true,
            nonSelectedText: i18n.t('logquery.select-noneselect'),
            nSelectedText: i18n.t('logquery.select-nselect'),
            allSelectedText: i18n.t('logquery.select-allselect'),
            buttonWidth: '140px',
            buttonClass: 'multiselect dropdown-toggle btn btn-sm btn-primary',
            onChange: function(option, checked, select) {
                 if (option) {
                if (checked) {
                        queryParams.selectedModuleTypesID.push(parseInt(option.val()));
                        queryParams.selectedModuleTypeName.push(option.attr('title'));
                    } else {
                       queryParams.selectedModuleTypesID.splice(_.indexOf(queryParams.selectedModuleTypesID, parseInt(option.val())), 1);
                       queryParams.selectedModuleTypeName.splice(_.indexOf(queryParams.selectedModuleTypeName, option.attr('title')), 1);
                    }
                }
                else{
                     if (checked) {
                        queryParams.selectedModuleTypesID = getALLModuleTypesID();
                        queryParams.selectedModuleTypesName = getALLModuleTypesName();
                    } else {
                        queryParams.selectedModuleTypesID = [];
                        queryParams.selectedModuleTypesName = [];
                        notifyEmptyModuleTypes();
                    }

                }
                // queryParams.selectedModuleTypesID = option.val();
                // queryParams.selectedModuleTypeName = option.attr('title');

                 _logd('SELECTED MODULE TYPES    ' + queryParams.selectedModuleTypesID);
            }
        };
        $('#modueltypes-multiselect').multiselect(initPara);

        $.getJSON('/log/getmoduletypes', function(rsp) {
            if (rsp.code !== 0) {
                Notify.show({
                    title: i18n.t('logquery.notify-getmodulefailed'),
                    message: rsp.message,
                    type: "error"
                });
            } else {
                var optGroups = rsp.data;
                var emptyModule = {
                    label: i18n.t('usermanage.option-null'),
                    children: [{
                        label: i18n.t('usermanage.option-null'),
                        value: -1
                    }]
                };
                optGroups.unshift(emptyModule);
                $('#modueltypes-multiselect').multiselect('dataprovider', rsp.data);
                queryParams.selectedModuleTypesID.push($('#modueltypes-multiselectmodueltypes-multiselect').val());
               // queryParams.selectedModuleTypesID = $('#modueltypes-multiselectmodueltypes-multiselect').val();
            }
        });
    }

    function initOperationTypes() {
        $('#operationtypes-multiselect').multiselect({
            maxHeight: 300,
            includeSelectAllOption:true,
            selectAllText:'全选',
            enableFiltering: true,
            nonSelectedText: i18n.t('logquery.select-noneselect'),
            nSelectedText: i18n.t('logquery.select-nselect'),
            allSelectedText: i18n.t('logquery.select-allselect'),
            buttonWidth: '140px',
            buttonClass: 'multiselect dropdown-toggle btn btn-sm btn-primary',
            onChange: function(option, checked, select) {
               
                // queryParams.selectedOperationTypesID = option.val();
                // queryParams.selectedOperationTypeName = option.attr('title');

                // _logd('SELECTED OPERATION TYPES    ' + queryParams.selectedOperationTypesID);
                     if (option) {
                    if (checked) {
                        queryParams.selectedOperationTypesID.push(parseInt(option.val()));
                        queryParams.selectedOperationTypeName.push(option.attr('title'));
                    } else {
                        queryParams.selectedOperationTypesID.splice(_.indexOf(queryParams.selectedOperationTypesID, parseInt(option.val())), 1);
                        queryParams.selectedOperationTypeName.splice(_.indexOf(queryParams.selectedModuleTypeName, option.attr('title')), 1);
                    }
                  }
                    else
                    {
                        if (checked) {
                        queryParams.selectedOperationTypesID = getALLOperationTypesID();
                        queryParams.selectedOperationTypeName = getALLOperationTypesName();
                    } else {
                        queryParams.selectedOperationTypesID = [];
                        queryParams.selectedOperationTypeName = [];
                        notifyEmptyOperationTypes();
                    }
                    }
                    _logd('SELECTED OPERATION TYPES    ' + queryParams.selectedOperationTypesID);

            }
        });

        $.getJSON('/log/getoperationtypes', function(rsp) {
            if (rsp.code !== 0) {
                Notify.show({
                    title: i18n.t('logquery.notify-getoprfailed'),
                    message: rsp.message,
                    type: "error"
                });
            } else {
                var operationTypesData = rsp.data;
                var optGroups = _.map(operationTypesData, function(item) {
                    var group = {
                        label: item.typeName,
                        value: item.typeId,
                        title: item.typeName
                    }
                    return group;
                });
                var emptyOperation = {
                    label: i18n.t('usermanage.option-null'),
                    value: -1,
                    title: i18n.t('usermanage.option-null')
                }
                optGroups.unshift(emptyOperation);
                $('#operationtypes-multiselect').multiselect('dataprovider', optGroups);
                queryParams.selectedOperationTypesID.push($('#operationtypes-multiselect').val());
                //queryParams.selectedOperationTypesID = $('#operationtypes-multiselect').val();
            }
        });
    }

    function _daterangeInput(startday) {
        Datetimepicker.init(startday);
        $('.custom').mask('9999/99/99-9999/99/99');
        $('input[maxlength]').maxlength({
            threshold: 21,
            placement: 'right'
        })
    }

    function initUser() {
        $.getJSON('/department/listall',{
            roleType:3
        }, function(rsp) {
            if (rsp.code !== 0) {
                Notify.show({
                    title: i18n.t('logquery.notify-getdepfailed'),
                    message: rsp.message,
                    type: "error"
                });
            } else {
                _departmentListData = rsp.data;
                reconstructDepartmentData(_departmentListData);
            }
        });
    }

    function reconstructDepartmentData(data) {
        _.each(data, function(item) {
            if (isDepartment(item)) {
                item = _.extend(item, {
                    hideCheckbox: true
                });
                reconstructDepartmentData(item.children);
            } else {
                item = _.extend(item, {
                    hideCheckbox: false
                });
            }
        });
    }

  function getALLModuleTypesID() {
        return _.map(_moduleArrayID, function (module) {
            return module.value;
        });
    }
     function getALLModuleTypesName() {
        return _.map(_moduleArrayName, function (module) {
            return module.value;
        });
    }
     function getALLOperationTypesID() {
        return _.map(_OperationArrayID, function (module) {
            return module.value;
        });
    }
     function getALLOperationTypesName() {
        return _.map(_OperationArrayName, function (module) {
            return module.value;
        });
    }
 function notifyEmptyModuleTypes() {
        Notify.show({
            title: '请至少选择一个模块',
            type: 'error'
        });

    }
    function notifyEmptyOperationTypes() {
        Notify.show({
            title: '请至少选择一种操作类型',
            type: 'error'
        });

    }
    function isDepartment(node) {
        if (node.extraClasses === 'nv-department') {
            return true;
        } else {
            return false;
        }
    }

    $('#search-log').on('click', function() {
        var time = $('#date-range-input').val().split('-');
        queryParams.startTime = time[0].replace(/\//g, '-') + ' 00:00:00';
        queryParams.endTime = time[1].replace(/\//g, '-') + ' 23:59:59';
        queryParams.keyword = $('#keyword-input').val().trim();
        queryParams.ip = $('#ip-input').val().trim();
        queryParams.mac = $('#mac-input').val().trim();

        _logd('SELECTED USER ID    ' + queryParams.selectedUserID);
        _logd('SELECTED MODULE TYPES    ' + queryParams.selectedModuleTypesID);
        _logd('SELECTED OPERATION TYPES    ' + queryParams.selectedOperationTypesID);
        _logd('START TIME    ' + queryParams.startTime);
        _logd('END TIME    ' + queryParams.endTime);
        _logd('KEYWORD    ' + queryParams.keyword);
        _logd('IP    ' + queryParams.ip);
        _logd('MAC NAME    ' + queryParams.mac);

        getOnePageLog(0, countPerPage);
    })

    function getOnePageLog(startpos, count) {

        _logd('START POS    ' + startpos);
        _logd('COUNT    ' + count);

        var params = {
            userid: queryParams.selectedUserID,
            username: queryParams.selectedUserName,
            ip: queryParams.ip,
            mac: queryParams.mac,
            starttime: queryParams.startTime,
            endtime: queryParams.endTime,
            keyword: queryParams.keyword,
            startpos: startpos,
            count: count
        }
        if (!_.isEmpty(queryParams.selectedModuleTypesID )) {

            params.moduletype = queryParams.selectedModuleTypesID;
            params.modulename = queryParams.selectedModuleTypeName;
        }
        if (!_.isEmpty(queryParams.selectedOperationTypesID) ) {
            params.operationtype = queryParams.selectedOperationTypesID;
            params.operationname = queryParams.selectedOperationTypeName;
        }

        //$('#log-query-div').empty();
        var loader = loaders($('#log-query-div'));

        $.getJSON('/log/querylog', params, function(rsp) {
            var loader = loaders($('#log-query-div'));
            loader.hide();
            if (rsp.code != 0) {
                Notify.show({
                    title: i18n.t('logquery.notify-queryfailed'),
                    message: rsp.message,
                    type: 'error'
                });
            }
            var logData = rsp.data;

            //var num = Math.ceil(logData.length/countPerPage);
            //console.log(num, logData.length,logData);
            //$('#pagination>span').text('共计'+logData.length+'条 ，共'+num+'页');
            currentLogData = logData;
            _.each(logData, function(item) {
                // IP 删掉 '::ffff:'
                if (item.ip.indexOf('::ffff:') === 0) {
                    item.ip = item.ip.slice(7);
                }
                // content 过长
                if (item.content.length > 80) {
                    item.contenttooltip = item.content;
                    //item.content = item.content.slice(0, 80) + '...';
                }
                //不显示任务标识0
                if (item.relationId == 0) {
                    item.relationId = null;
                }

            });

            if (_.size(logData) === 0) {
                $('#log-query-table-wrapper').empty();
                if (currentPage === 1) {
                    $('#notify-text').text(i18n.t('logquery.label-nodata'));
                    // $('#log-query-div').append('<label class="control-label pln col-md-3" id="notify-text">' +
                    //     i18n.t('logquery.label-noresult') + '</label>');

                    $('#pagination').hide();
                } else {
                    $('#next-page').addClass('disabled');
                    $('#pre-page').trigger('click');
                }
                $('#notify-text').show();
                $('#notify-text').text(i18n.t('logquery.label-nodata'));
                $('#current-page').text(currentPage);
            } else {
                $('#notify-text').hide();
                $('#pagination').show();
                $('#current-page').text(currentPage);

                if (currentPage === 1) {
                    $('#pre-page').addClass('disabled');
                    $('#next-page').removeClass('disabled');
                } else {
                    $('#pre-page').removeClass('disabled');
                    $('#next-page').removeClass('disabled');
                }

                if (_.size(logData) < countPerPage) {
                    $('#next-page').addClass('disabled');
                    $('#next-page').attr('data-lastpage-mark', 'true');
                } else {
                    $('#next-page').attr('data-lastpage-mark', 'false');
                }

                firstItemId = logData[0].id;
                lastItemId = logData[_.size(logData) - 1].id;

                _logd('FIRST ITEM ID    ' + firstItemId);
                _logd('LAST ITEM ID    ' + lastItemId);

                $('#log-query-table-wrapper').empty();

                var logTable = tplTable({
                    logData: logData
                })

                //console.log("logTable", logTable);
                $('#log-query-table-wrapper').append(logTable);
                //console.log("wrapper", $('#log-query-table-wrapper')[0].innerHTML);
                if (logTable.length === 0) {
                    $('#log-query-div').append('<div><lable>' +
                        i18n.t('logquery.label-noresult') + '</lable></div>');
                }

                //$('#log-query-div').append(logTable);

                $('#log-query-table-wrapper').localize();
    
                $('#log-query-table').DataTable({
                    "scrollY": 450,
                    "autoWidth": true,
                    'paging': false,
                    'ordering': false,
                    'info': false,
                    'searching': true,
                    'lengthMenu': [
                        [10, 25, 50, 100, -1],
                        [10, 25, 50, 100, i18n.t('logquery.datatable-all')]
                    ],
                    'language': {
                        'lengthMenu': i18n.t('logquery.datatable-lengthmenu'),
                        'zeroRecords': i18n.t('logquery.datatable-zerorecord'),
                        'info': i18n.t('logquery.datatable-info'),
                        'infoEmpty': i18n.t('logquery.datatable-infoempty'),
                        'infoFiltered': i18n.t('logquery.datatable-infofiltered'),
                        'search': i18n.t('logquery.datatable-search'),
                        'emptyTable': i18n.t('logquery.datatable-lemptytable'),
                        'loadingRecords': i18n.t('logquery.datatable-loading'),
                        'processing': i18n.t('logquery.datatable-processing'),
                        'paginate': {
                            'first': i18n.t('logquery.datatable-first'),
                            'last': i18n.t('logquery.datatable-last'),
                            'next': i18n.t('logquery.datatable-next'),
                            'previous': i18n.t('logquery.datatable-previous')
                        },
                        'aria': {
                            'sortAscending': i18n.t('logquery.datatable-ascending'),
                            'sortDescending': i18n.t('logquery.datatable-descending')
                        }
                    },
                    'dom': 'Bfrtip',
                    'buttons': [{
                        extend: 'csv',
                        text: i18n.t('logquery.datatable-export')
                    }],
                    "oTableTools": {
                        "aButtons": [{
                            "sExtends": "csv",
                            "fnComplete": function(nButton, oConfig, oFlash, sFlash) {
                                alert('Button action complete');
                            }
                        }]
                    }
                });

$(window).on("resize", function() {
        var leftTray = $('.dataTables_scrollBody');
        var leftHeight = window.innerHeight - leftTray.offset().top-60;

        $('.dataTables_scrollBody').height(leftHeight);
    
    });
    $(window).trigger("resize");

                //$('#log-query-table td').addClass

                // 多选行导出
                var selectedRowCounter = 0;
                $('#log-query-table tbody').on('click', 'tr', function() {
                    $(this).toggleClass('active');

                    if ($(this).hasClass('active')) {
                        selectedRowCounter++;
                        $('#log-query-table').attr('data-export-mark', 'selectable');
                    } else {
                        selectedRowCounter--;
                    }

                    if (selectedRowCounter === 0) {
                        $('#log-query-table').attr('data-export-mark', 'all');
                    }

                });

                $('#log-query-div .dt-buttons .buttons-csv').attr('id', 'query-export');
                $('#query-export').on('click', function() {
                    $.post('/log/recordlog', {
                        moduletype: 421,
                        operationtype: 9,
                        content: i18n.t('logquery.loginfo-export'),
                        detailtype: 0
                    }).done(function(data) {
                        data = JSON.parse(data);
                    });
                });

            }

        });
    }

    $('#department').on('click', function(e) {
        e.preventDefault();

        Dialog.build({
            title: i18n.t('logquery.dialog-chooseuser'),
            content: "<div id='user-filter' class='row mln mrn pb5' style='background-color: white'><div class='col-md-9 pn'><input class='form-control' name='searchUser' data-i18n='[placeholder]usermanage.holder-filter' AUTOCOMPLETE='OFF'></div><div class='col-md-3 prn'><button type='button' class='btn btn-primary btn-block' id='btnResetSearchUser' data-i18n='usermanage.button-clear'></button></div></div><div id='department-picker'> " + i18n.t('logquery.dialog-loading') + "</div>",
            rightBtnCallback: function(e) {
                e.preventDefault();

                var selectedNodes = $('#department-picker').fancytree('getTree').getSelectedNodes();
                if (!_.isEmpty(selectedNodes)) {
                    queryParams.selectedUserID = selectedNodes[0].data.userId;
                    queryParams.selectedUserName = selectedNodes[0].data.loginName;
                    $('#department-input').val(selectedNodes[0].data.loginName);
                } else {
                    queryParams.selectedUserID = undefined;
                    queryParams.selectedUserName = undefined;
                    $('#department-input').val('');
                }
                $.magnificPopup.close();

                _logd('SELECTED USER ID    ' + queryParams.selectedUserID);
            }
        }).show(function() {
            $('#department-picker').empty();
            Tree.build({
                container: $('#department-picker'),
                selectMode: 1,
                checkbox: true,
                expandAll: false,
                source: _departmentListData
            });
            if (queryParams.selectedUserID) {
                var tree = $('#department-picker').fancytree('getTree');
                var node = tree.getNodeByKey('user-' + queryParams.selectedUserID.toString());
                node.setSelected(true);
                _logd(queryParams.selectedUserID)
            }
            $('#user-filter').localize();
            var userTree = $("#department-picker").fancytree("getTree");
            $("input[name=searchUser]").keyup(function(e) {
                $(".fancytree-node").parent().removeClass("hide");
                var rootNode = userTree.getRootNode();
                if(rootNode._isLoading){
                    Notify.show({
                        title: "数据正在加载,请稍等!",
                        type: "danger"
                    });
                    return;
                }
                var n;
                var opts = {
                    autoExpand: true
                };
                var match = $(this).val();

                if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                    $("button#btnResetSearchUser").click();
                    return;
                }
                n = userTree.filterNodes(match, opts);
                $("li .fancytree-hide").parent().addClass("hide");

                $("button#btnResetSearchUser").attr("disabled", false);
                $("button#btnResetSearchUser").text(i18n.t('usermanage.button-clear')+ "(" + n + ")");
            });
            $("button#btnResetSearchUser").click(function() {
                $("input[name=searchUser]").val("");
                $("button#btnResetSearchUser").text(i18n.t('usermanage.button-clear'));
                userTree.clearFilter();
                $(".fancytree-node").parent().removeClass("hide");
            }).attr('disabled', 'true');
        })
    })

    $('#pre-page').on('click', function() {
        currentPage = currentPage - 1;
        if (currentPage < 1) {
            currentPage = 1;
        } else {
            var negativecountPerPage = -countPerPage;
            getOnePageLog(firstItemId, negativecountPerPage);
        }
    });

    $('#next-page').on('click', function() {
        if ($('#next-page').attr('data-lastpage-mark') === 'false') {
            currentPage = currentPage + 1;
            getOnePageLog(lastItemId, countPerPage);
        }
    });
})