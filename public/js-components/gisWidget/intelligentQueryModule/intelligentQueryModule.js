/**
 * Created by zhangxinyue on 2016/3/2.
 */

(function(window, document, undefined) {
    var _options;
    var userID = '511';
    var dataTypeList = [];
    var dataTypeMap = {};
    var submitDataType = {};

    function _intelligentQuery(options) {
        _options = options;
    }

    _intelligentQuery.prototype = {
        addTo: function(toolbar) {
            this._container = toolbar._container;
            this._map = toolbar._map;
            this._initialize();
        },
        _initialize: function() {
            this._initPanel();
            this._initQueryCond();
            this._submitQuery();
            this._locate();
        },
        _initPanel: function() {
            var toolButton = document.createElement('span');
            toolButton.height = 24;
            toolButton.width = 24;
            toolButton.title = i18n.t('gismodule.intelligentQuery.toolBtn');
            toolButton.className = "button-style fa fa-eye";
            this._container.appendChild(toolButton);

            var parentId = document.getElementById(_options.panelParentID);
            var innerHtml = this._createPanelInnerHtml();
            parentId.innerHTML = innerHtml;

            this.btn = toolButton;
            this.hidePanelImg = document.getElementById("hideQueryPanel");

            this.hidePanelImg.onclick = function() {
                $("#out-panel").animate({
                    width: "hide"
                }, 500);
            };

        },
        _initQueryCond: function() {
            $('#query-div').empty().append(_options.tpl_common());

            $.getJSON('/gisapi/getGisDataType').done(function(rsp) {
                gisDataTypeList = rsp.data;
                _.each(gisDataTypeList, function(gisDataType) {

                    dataTypeList.push({
                        id: gisDataType.typeId,
                        text: gisDataType.caption
                    })

                    dataTypeMap[gisDataType.typeId] = {
                        typeId: gisDataType.typeId,
                        centerCode: gisDataType.centerCode,
                        zoneId: gisDataType.zoneId
                    }
                })

                dataTypeList.sort(function(a, b) {
                    var id1 = a.id;
                    var id2 = b.id;
                    return id1 - id2;
                })

                $('#DataType').select2({
                    language: 'zh-CN',
                    minimumResultsForSearch: Infinity,
                    data: dataTypeList
                });

                var dataTypeId = $('#DataType').val();
                var dataType = dataTypeMap[dataTypeId];

                _options.datafenceHelper.mkQueryConfigByDatatype(dataType);
            })

            this._initFencetree();

            var curDate = _options.moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            $('#taskname-input').val(i18n.t('gismodule.intelligentQuery.toolBtn') + "(" + curDate + ")");

            $("#taskPath").empty();
            _options.PersonalWorkTree.buildTree({
                container: $("#taskPath"),
                treeAreaFlag: "default"
            }).config("dblclick", function(event, data) {
                var curPath = _options.datafenceHelper.generateMainPath(data.node);
                $('#taskpath-input').empty().val(curPath);
                $("#taskPath").hide('normal');
                $('#taskpath-input').attr('dirId', data.node.key);

                $.post('/workspacedir/recordPreference', {
                    name: 'gistaskpath',
                    detail: {
                        pathName: curPath,
                        dirId: data.node.key
                    }
                })

            })

            $('#taskpath-input').on('click', function(event) {
                // event.preventDefault();
                $("#taskPath").show();
            }).on('blur', function(event) {
                //  event.preventDefault();
                if (event.originalEvent.relatedTarget == null || event.originalEvent.relatedTarget.parentNode.id != 'taskPath') {
                    $("#taskPath").hide();
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
            $("#intelligentQuery").on("click", function(event) {
                event.preventDefault();
                dataTypeId = $('#DataType').val();
                submitDataType = dataTypeMap[dataTypeId];
                var taskName = $('#taskname-input').val();
                var taskDirId = $('#taskpath-input').attr('dirId');
                var fenceId = $('#fence-input').attr('fenceId');
                _options.datafenceHelper.init({
                    addTargetDatas: _options.addTargetDatas,
                    addAimTrackPanel: _options.addAimTrackPanel
                });
                _options.datafenceHelper.submitQuery(submitDataType, taskName, taskDirId, fenceId);

            })
        },
        _locate: function() {
            $("#locate-button").on("click", function(event) {
                event.preventDefault();
                $('#mainSplitter').jqxSplitter('collapse');


                var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');
                var rows = [];

                for (var i = 0; i < selectedRowIndexs.length; i++) {
                    var index = selectedRowIndexs[i];
                    var row = $('#dataGrid').jqxGrid('getrowdata', index);
                    rows.push(row)
                }

                _options.makeGisJSON(getRows(), submitDataType);
                $("[title='"+i18n.t('gismodule.intelligentQuery.locateBtn')+"']").trigger('click');
            });

        },
        getBtn: function() {
            return this.btn;
        },
        _createPanelInnerHtml: function() {
            var innerHtml =
                '<div class="group-title">' +
                '<label style="position: absolute;top:8px;left: 5px;">'+i18n.t('gismodule.intelligentQuery.toolBtn')+'</label>' +
                '<img id="hideQueryPanel" src="../js/components/gisWidget/intelligentQueryModule/image/remove-icon-small.png" style="position: absolute;top:10px;right: 8px;cursor: pointer;"/>' +
                '</div>' +
                '<div class="" id="query-div">' +

                '</div>';
            return innerHtml;
        },
        _initFencetree: function() {
            this._getRootID(userID);

            $("#fencetree").fancytree({
                checkbox: true,
                selectMode: 3,
                imagePath: "../js/components/gisWidget/enclosureManageModule/fancyTree/image/", //设置树节点图片路径
                lazyLoad: this.lazyLoad, //延时加载
                loadError: this.loadError, //延时加载时，获取数据失败，加载错误信息
                // select:fancytreeSelect,]
                select: function(event, data) {
                    if (!data.node.folder) {
                        var curPath = _options.datafenceHelper.generateMainPath(data.node);
                        $('#fence-input').empty().val(curPath);
                        $("#fencetree").hide('normal');
                        $('#fence-input').attr('fenceId', data.node.key);
                    }
                }
            })

            $('#fence-input').on('click', function(event) {
                //event.preventDefault();
                $("#fencetree").toggle('normal');

            })
        },

        //延时加载
        lazyLoad: function(event, data) {
            $.ajaxSettings.async = false;
            $.ajax({
                type: 'GET',
                url: '/gisapi/gisGetQuery',
                data: {
                    hostname: _options.appConfig['gis-server'],
                    path:'/GisService/enclosure/GetChildren',
                    key:data.node.key
                },
                //url: _options.appConfig['gisServer'] + ':8080/GisService/enclosure/GetChildren?key=' + data.node.key,
                dataType: 'text',
                success: function(result) {
                    data.result = eval(result);
                },
                error: function(result) {
                    data.result = $.Deferred(function(dfd) {
                        dfd.reject(new Error(i18n.t('gismodule.intelligentQuery.alert1')));
                    });
                }
            });
        },

        //加载错误提示
        loadError: function(e, data) {
            var error = data.error;
            if (error.status && error.statusText) {
                data.message = "Ajax error: "+i18n.t('gismodule.intelligentQuery.alert2');
            } else {
                data.message = "Custom error: " + data.message;
            }
        },

        _getRootID: function(userId) {
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
                    $("#fencetree").append('<ul><li id="' + result + '" class="lazy folder">'+i18n.t('gismodule.intelligentQuery.dirName')+'</ul>');
                },
                error: function(result) {
                    alert(i18n.t('gismodule.intelligentQuery.alert3'))
                }
            });
        }
    }

    function getRows() {
        var selectedRowIndexs = $('#dataGrid').jqxGrid('getselectedrowindexes');
        if (selectedRowIndexs.length == 0) {
            Notify.show({
                title: '',
                type: "info"
            });
            return false;
        }
        var rows = [];
        var dateCol = _.union(_.where(columns, {
            datatype: 'date'
        }), _.where(columns, {
            datatype: 'datetime'
        }));


        var datafieldMap = {};
        _.each(dateCol, function(col) {
            datafieldMap[col.datafield] = col;
        })
        for (var i = 0; i < selectedRowIndexs.length; i++) {
            var index = selectedRowIndexs[i];
            var row = $('#dataGrid').jqxGrid('getrowdata', index);
            for (var item in row) {
                var matched = datafieldMap[item];
                if (matched) {
                    var dateformat = "YYYY-MM-DD";
                    if (matched.datatype == 'datetime') {
                        dateformat = "YYYY-MM-DD HH:mm:ss";
                    }
                    var data = row[item];
                    if (data) {
                        row[item] = _options.moment(data).format(dateformat);
                    }
                }
            }
            rows.push(row)
        }
        return rows;
    }

    intelligentQuery = function(options) {
        return new _intelligentQuery(options);
    };
}(window, document));