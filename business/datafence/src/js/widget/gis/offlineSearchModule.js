/**
 * Created by root on 11/15/16.
 */
define("module/gis/offlineSearchModule", [
    '../../tpl/gis/tpl-offlineSearch-box',
    'nova-notify',
    'nova-utils',
    "underscore",
    'utility/select2/select2',
    'utility/select2/i18n/zh-CN',
    'utility/multiselect/bootstrap-multiselect',
    'bootstrap-tagsinput',
], function(tpl_offlineSearch_box, Notify, Util) {
    var _options;
    var userID;
    var dataTypeList = [];
    var dataTypeMap = {};
    var submitDataType = {};
    tpl_offlineSearch_box = _.template(tpl_offlineSearch_box);

    function offlineSearchBox(options) {
        _options = options;
        userID = options.userID;
    }

    offlineSearchBox.prototype = {
        _initialize: function() {
            this._appendBox();
            this._initQueryCond();
            this._submitQuery();
        },
        _initPanel: function() {
            $('#offlineSearchBox').append(tpl_offlineSearch_box);
        },
        _initQueryCond: function() {
            $('#offlineSearchBox').empty().append(tpl_offlineSearch_box);
            this._collapseLogic();
            $.getJSON('/smartquery/smartquery/getGisDataType').done(function(rsp) {
                gisDataTypeList = rsp.data;
                _.each(gisDataTypeList, function(gisDataType) {

                    dataTypeList.push({
                        id: gisDataType.typeId,
                        text: gisDataType.caption
                    })

                    dataTypeMap[gisDataType.typeId] = {
                        typeId: gisDataType.typeId,
                        centerCode: gisDataType.centerCode,
                        zoneId: gisDataType.zoneId,
                        name: gisDataType.caption
                    }
                })

                dataTypeList.sort(function(a, b) {
                    var id1 = a.id;
                    var id2 = b.id;
                    return id1 - id2;
                })

                $('#DataType').select2({
                    language: 'zh-CN',
                    //minimumResultsForSearch: Infinity,
                    data: dataTypeList
                });

                var dataTypeId = $('#DataType').val();
                var dataType = dataTypeMap[dataTypeId];

                _options.datafenceHelper.mkQueryConfigByDatatype(dataType);
            })

            this._initFencetree();

            var curDate = _options.moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            $('#taskname-input').val("围栏查询" + "(" + curDate + ")");

            $("#taskPath").empty();
            _options.PersonalWorkTree.buildTree({
                container: $("#taskPath"),
                treeAreaFlag: "default"
            }).config("dblclick", function(event, data) {
                var curPath = _options.datafenceHelper.generateMainPath(data.node);
                $('#taskpath-input').empty().val(curPath);
                $("#taskPath").hide('normal');
                $('#taskpath-input').attr('dirId', data.node.key);
            })

            $('#taskpath-input').on('click', function(event) {
                $("#taskPath").toggle('normal');
            }).on('blur', function(event) {
                if (event.originalEvent.relatedTarget == null || event.originalEvent.relatedTarget.parentNode.id != 'taskPath') {
                    $("#taskPath").hide('normal');
                }
            })

            $('#DataType').on('change', function(event) {
                event.preventDefault();
                dataTypeId = $('#DataType').val();
                dataType = dataTypeMap[dataTypeId];
                _options.datafenceHelper.mkQueryConfigByDatatype(dataType);
            })
        },

        _submitQuery: function() {
            //var that =this;
            $('#fence-input').on('click', function(event) {
                //event.preventDefault();
                $("#fencetree").toggle("normal");
            }).on('blur', function(event) {
                //event.preventDefault();
                if (event.originalEvent.relatedTarget == null || event.originalEvent.relatedTarget.parentNode.id != 'fence-input') {
                    //$("#taskPath").hide();
                    $("#fencetree").hide("normal");
                }
            });
            $("#offlineSearchBox").on("click", "#intelligentQuery", function(event) {
                // event.preventDefault();
                // this.hide();
                dataTypeId = $('#DataType').val();
                // console.log(dataTypeId)
                $("#intelligentQuery").focus();
                submitDataType = dataTypeMap[dataTypeId];
                var taskName = $('#taskname-input').val();
                taskName = $.trim(taskName);
                var taskDirId = $('#taskpath-input').attr('dirId');
                var fenceId;
                var fenceName;
                var curFenceShape;
                var isCurfence = $('#fence-input').attr('curfence');
                if( isCurfence == "true"){
                    fenceId = "";
                    fenceName = "";
                    curFenceShape = _getCurFence();
                }else{
                    fenceId = $('#fence-input').attr('fenceId');
                    fenceName = $('#fence-input').val();
                }

                if (taskName == "") {
                    Notify.show({
                        title: "请填写任务名称",
                        type: "warning"
                    });
                } 
                else if (taskDirId == "" || taskDirId == undefined) {
                    Notify.show({
                        title: "请选择保存路径",
                        type: "warning"
                    });
                }
                 else {

                    var datafenceHelperOpt = {
                        dataType: submitDataType,
                        taskName: taskName,
                        taskDirId: taskDirId,
                        datafenceId: fenceId,
                        curFenceShape: curFenceShape,
                        datafenceName: fenceName,
                        makeGisJSON: _options.makeGisJSON,
                        switchBox: _switchBox
                    }
                    _options.pathBox.ClearTargetData();
                    _options.pathBox.execSmartQuery(datafenceHelperOpt);
                }
            })

            $("#offlineSearchBox").on("click", "#backToResult", function(event) {
                _switchBox();
            })
        },

        _getAllEnclosure: function() {
            var rootID = this._getRootID(userID);
            var source;
            $.ajaxSettings.async = false;
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: _options.appConfig['gis-server'],
                    path: '/GisService/enclosure/GetAllEnclosure',
                    dirId: rootID
                },
                dataType: 'text',
                success: function(result) {
                    source = eval(result);
                },
                error: function(result) {
                    // alert(i18n.t('gismodule.enclosureManage.alert11'));
                    Notify.show({
                        title: i18n.t('gismodule.enclosureManage.alert11'),
                        type: "warning"
                    });
                }
            });
            return source;
        },

        _initFencetree: function() {
            // var rootID = this._getRootID(userID);
            // var source;
            // source = this._getAllEnclosure();
            // console.log(source);
            $("#fencetree").fancytree({
                checkbox: true,
                selectMode: 3,
                imagePath: "../js/components/gisWidget/enclosureManageModule/fancyTree/image/", //设置树节点图片路径
                // lazyLoad: this.lazyLoad, //延时加载
                // loadError: this.loadError, //延时加载时，获取数据失败，加载错误信息
                source: this._getAllEnclosure(),
                // select:fancytreeSelect,]
                select: function(event, data) {
                    //if (!data.node.folder) {
                    //    var curPath = _options.datafenceHelper.generateMainPath(data.node);
                    var Path = [];
                    var fenceId = [];
                    var nodes = $("#fencetree").fancytree("getTree").getSelectedNodes();
                    for (var i = 0; i < nodes.length; i++) {
                        console.log(nodes[i]);
                        if (!nodes[i].folder) {
                            Path.push(_options.datafenceHelper.generateMainPath(nodes[i]));
                            fenceId.push(nodes[i].key);
                        }


                    }
                    // console.log(Path);
                    // console.log(fenceId);
                    $('#fence-input').empty().val(Path);
                    //$("#fencetree").hide('normal');
                    // _opts.container.fancytree("getTree").getSelectedNodes()
                    $('#fence-input').attr('fenceId', fenceId);
                    $('#fence-input').attr('title', Path);
                    $("#fence-input").attr("curfence",false);
                    //}
                }
            })
        },

        reloadTree: function() {
            var source;
            source = this._getAllEnclosure();
            var tree = $('#fencetree').fancytree('getTree');
            tree.reload(source);
        },

        _getRootID: function(userId) {
            var rootID;
            $.ajaxSettings.async = false;
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: _options.appConfig['gis-server'],
                    path: '/GisService/enclosure/getRootDirectoryID',
                    userID: userId
                },
                dataType: 'text',
                success: function(result) {
                    console.log(result);
                    rootID = result;
                    // $("#fencetree").append('<ul><li id="' + result + '" class="lazy folder">' + i18n.t('gismodule.intelligentQuery.dirName') + '</ul>');
                },
                error: function(result) {
                    // alert(i18n.t('gismodule.intelligentQuery.alert3'))
                    Notify.show({
                        title: i18n.t('gismodule.intelligentQuery.alert3'),
                        type: "warning"
                    });
                }
            });
            return rootID;
        },
        _appendBox: function() {
            $('#boxes').append("<div id='offlineSearchBox' class='bg-light-yellow'></div>")
        },
        _collapseLogic: function() {
            var that = this;
            // $('#collapseOffBox').on('click', function() {
            //     $('#offlineSearchBox').hide();
            // })

            // $('#closeOffBox').on('click', function() {
            //     that.clearBox();
            //     $('#offlineSearchBox').hide();
            // })
            $("#offlineSearchBox").on("click", "#closeOffBox", function() {
                $("#offlineSearchBox").hide();
            })
        },
        clearBox: function() {},
        _loadData: function() {
            var task = {};
            task.id = Util.getURLParameter('taskid') || undefined;
            task.taskname = Util.getURLParameter('taskname') || undefined;
            _options.pathBox.showLoadingBox();
            $('#openAllResult').attr("taskId", task.id);
            _options.datafenceHelper.tryGetTaskResult(task.id).then(function(rsp) {
                $.getJSON('/datafence/datafence/gettaskBaseCond', {
                    taskId: task.id
                }).done(function(rsp2) {
                    console.log(rsp2);
                    var rows = [];
                    for (var i = 0; i < rsp.records.length; i++) {
                        var row = {};
                        for (var j = 0; j < rsp.meta.length; j++) {
                            var name = rsp.meta[j].name;
                            row[name] = rsp.records[i][j]
                        }
                        rows.push(row)
                    }
                    if (rows.length > 0) {
                        $("#noResult").hide();
                        _options.makeGisJSON(rows, rsp2.data.dataType);
                    } else {
                        $("#noResult").show();
                        _options.makeGisJSON(rows, rsp2.data.dataType);
                    }
                    // offlineSearchBox._initialize();
                    _switchBox();
                    $("#backToResult").show();
                    setTimeout(function() {
                        // _options.datafenceHelper.mkQueryConfigByDatatype(rsp2.data.dataType);
                        $('#DataType').val(rsp2.data.dataType.typeId).trigger("change");
                        if (rsp2.data.baseCond) {
                            _options.datafenceHelper.showInput(rsp2.data.baseCond.children);
                        }
                        if (rsp2.data.fence) {
                            showFenceInput(rsp2.data.fence);
                        }
                    }, 1000);
                })
            })
        }
    }

    function _switchBox() {
        //this.hideBox();
        // $('#offlineSearchBox').hide();
        $('#offlineSearchBox').hide();
        $('#pathBox').show();
        $('#pathLoadingBox').hide();
        $('#pathDisplayBox').show();
    }

    function _getCurFence() {
        var menu = document.getElementById("mapMenu");
        var curFence = {};
        var shapeType;
        var shape;

        switch (menu._parent.options.name) {
            case "DrawCircle":
                shapeType = '1';
                shape = JSON.stringify({
                    center: [menu._parent.currentTarget.getLatLng().lat, menu._parent.currentTarget.getLatLng().lng],
                    radius: menu._parent.currentTarget.getRadius()
                });
                break;
            case "DrawPolygon":
                shapeType = '2';
                var xys = [];
                var latlngs = menu._parent.currentTarget.getLatLngs();
                for (var i = 0; i < latlngs.length; i++) {
                    xys.push([latlngs[i].lat, latlngs[i].lng]);
                }
                shape = JSON.stringify({
                    latlngs: xys
                });
                break;
            case "DrawRectangle":
                shapeType = '3';
                var xys = [];
                var latlngs = menu._parent.currentTarget.getLatLngs();
                for (var i = 0; i < latlngs.length; i++) {
                    xys.push([latlngs[i].lat, latlngs[i].lng]);
                }
                shape = JSON.stringify({
                    latlngs: xys
                });
                break;
        }
        curFence.shape = shape;
        curFence.shapeType = shapeType;
        return curFence;
    }

    function showFenceInput(data) {
        $("#fence-input").val(data.fenceName);
        $("#fence-input").attr('title', data.fenceName);
        $("#fence-input").attr('fenceId', data.fenceId);
        data.queryField.forEach(function(field) {
            $("#" + field)[0].checked = true;
        })
    }

    // function getRows() {
    //     var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');
    //     if (selectedRowIndexs.length == 0) {
    //         Notify.show({
    //             title: '',
    //             type: "info"
    //         });
    //         return false;
    //     }
    //     var rows = [];
    //     var dateCol = _.union(_.where(columns, {
    //         datatype: 'date'
    //     }), _.where(columns, {
    //         datatype: 'datetime'
    //     }));


    //     var datafieldMap = {};
    //     _.each(dateCol, function(col) {
    //         datafieldMap[col.datafield] = col;
    //     })
    //     for (var i = 0; i < selectedRowIndexs.length; i++) {
    //         var index = selectedRowIndexs[i];
    //         var row = $('#dataGrid').jqxGrid('getrowdata', index);
    //         for (var item in row) {
    //             var matched = datafieldMap[item];
    //             if (matched) {
    //                 var dateformat = "YYYY-MM-DD";
    //                 if (matched.datatype == 'datetime') {
    //                     dateformat = "YYYY-MM-DD HH:mm:ss";
    //                 }
    //                 var data = row[item];
    //                 if (data) {
    //                     row[item] = _options.moment(data).format(dateformat);
    //                 }
    //             }
    //         }
    //         rows.push(row)
    //     }
    //     return rows;
    // }

    return {
        offlineSearchBox: offlineSearchBox,
    }
});