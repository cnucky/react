/**
 * Created by user on 2016/5/25.
 */
(function (window, document, undefined){
    var drawRect;
    var featureLayers = [];
    var map;
    var Dialog;//dialog对象
    var GetLatLngRange;//实例
    var callback;//回调
    var drawnItems;

    function _getLatLngRange(options)
    {
        this.options = options;
        callback = this.options.callback;
        this.XYRange = {
            xmax:0,
            xmin:0,
            ymax:0,
            ymin:0
        };
    }

    _getLatLngRange.prototype = {
        addTo: function (toolbar,GetLatLng){
            this._container = toolbar._container;
            map = this._map = toolbar._map;
            GetLatLngRange = GetLatLng;
            this._initialize();
        },

        _initialize:function() {
            this._addPanel();
            this._initEvent();

            //定义dialog
            Dialog = new _defineDialog();
            Dialog.initialize();
        },

        //（私有）添加图层面板上的元素
        _addPanel: function() {
            //添加工具栏
            this._container.innerHTML = this._createToolbarInnerHtml();
            //生成经纬度面板
            var parentId = document.getElementById(this.options.panelParentID);
            parentId.innerHTML = '<div id = "infoPanel"></div>';
            //添加菜单
            document.getElementById("menu-panel").innerHTML=this._createMapMenuInnerHtml();
        },

        //初始化地图事件和矩形框选事件
        _initEvent: function(){
            var menu = document.getElementById("mapMenu");
            drawRect = new myLatLngRectangleRange(menu);//四边形对象
            drawRect.addTo(this._map);

            $("#rectangle").click(function(){
                drawRect._finishEditSingleRect();
                for(var i in featureLayers)
                {
                    map.removeLayer(featureLayers[i]);
                    delete featureLayers[i];
                }

                if(document.getElementById("out-panel").style.display == 'block')
                    document.getElementById("out-panel").style.display = 'none';
                if($("#rectangle").hasClass("item-active"))
                    $("#rectangle").removeClass("item-active"); //取消原围栏点击样式
                if (drawRect.isEnabled) {
                    drawRect.disabled();
                }
                else {
                    drawRect.enabled(); //设置围栏可用状态
                    $(this).addClass("item-active"); //设置围栏按钮点击状态
                }
            });

            //地图右击菜单相关事件
            $("#map").bind("contextmenu",function(){ return false;});
            $("#mapMenu").bind("contextmenu",function(){ return false;});

            drawnItems = new L.FeatureGroup();//定义图层
            this._map.addLayer(drawnItems);
            this._map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;
                drawnItems.addLayer(layer);
                featureLayers.push(layer);
                GetLatLngRange.getXYRange();
                GetLatLngRange.ShowLatLngRange();
            });
            this._map.on('draw:deleted',function(e){
                GetLatLngRange.XYRange.xmax = 0;
                GetLatLngRange.XYRange.xmin = 0;
                GetLatLngRange.XYRange.ymax = 0;
                GetLatLngRange.XYRange.ymin = 0;
                GetLatLngRange.ShowLatLngRange();
            });
            this._map.on('draw:changed',function(e){
                GetLatLngRange.getXYRange();
                GetLatLngRange.ShowLatLngRange();
            });
            this._map.on({
                mousedown: hideMenu,
                movestart: hideMenu,
                zoomstart: hideMenu
            },menu);
            function hideMenu(){
                this.style.display="none";
            }
        },
        //获取坐标接口
        getXYRange:function(){
            this.XYRange.xmax = drawRect.options.xmax;
            this.XYRange.xmin = drawRect.options.xmin;
            this.XYRange.ymax = drawRect.options.ymax;
            this.XYRange.ymin = drawRect.options.ymin;
            return this.XYRange;
        },
        //生成工具条内部HTML
        _createToolbarInnerHtml:function(){
            var innerHtml =
                '<div style="border: 1px solid:#e2e2e2;background: #FFFFFF;box-shadow: 1px 2px 1px;padding: 5px;border-radius: 3px">'+
                '<div id="rectangle" style="cursor: pointer">'+//type="button" class="btn btn-primary btn-gradient btn-alt btn-block btn-xs"
                '<img  style="width: 24px;height: 24px" title="'+i18n.t('gismodule.getLatLngRangeModule.drawToolbar.drawrectangle')+'" src="../js/components/gisWidget/enclosureManageModule/image/rectangle.png"/>' +
                '<span>'+i18n.t('gismodule.getLatLngRangeModule.drawToolbar.rectangle')+'</span>'+
                '</div>'+
                '</div>';
            return innerHtml;
        },
        //右击菜单栏的面板
        _createMapMenuInnerHtml:function(){
            var innerHtml =
                '<div id="mapMenu" class="mapMenuParent-style">'+
                '<table class="mapMenu-style">'+
                '<tr class="mapMenu-oneItem" id="popEdit">' +
                '<td>'+
                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/getLatLngRangModule/image/mapMenu/layout_center_16_p.png" style="height: 16px;width: 16px;"></div>'+
                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">'+i18n.t('gismodule.common.mapmenu.edit')+'</div>'+
                '</td>' +
                '</tr>'+
                '<tr class="mapMenu-oneItem" id="popDelete">' +
                '<td>'+
                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/getLatLngRangModule/image/mapMenu/error_16_p.png" style="height: 16px;width: 16px;"></div>'+
                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">'+i18n.t('gismodule.common.mapmenu.delete')+'</div>'+
                '</td>' +
                '</tr>'+
                '<tr class="mapMenu-oneItem" id="popSave">' +
                '<td>'+
                '<div style="float: left;width: 25px;"><img src="../js/components/gisWidget/getLatLngRangModule/image/mapMenu/disk_blue_ok_16_p.png" style="height: 16px;width: 16px;"></div>'+
                '<div style="float:left;font-size: 12px;height: 16px;margin-top: 2px;">'+i18n.t('gismodule.common.mapmenu.save')+'</div>'+
                '</td>' +
                '</tr>'+
                '</table>'+
                '</div>'
            return innerHtml
        },

        //生成经纬度范围显示面板内容
        _createBSDetailTable:function(){
            var innerHtml = '<div class="alert alert-info">'+
                                '<span class="alert-link">'+i18n.t('gismodule.getLatLngRangeModule.rangePanel.lngRange')+this.XYRange.xmin+' - '+this.XYRange.xmax+'</span>'+
                            '</div>'+
                            '<div class="alert alert-info">'+
                                '<span class="alert-link">'+i18n.t('gismodule.getLatLngRangeModule.rangePanel.latRange')+this.XYRange.ymin+' - '+this.XYRange.ymax+'</span>'+
                            '</div>';
            return innerHtml;
        },

        //显示经纬度范围信息
        ShowLatLngRange:function(){
            if(this.XYRange.xmin == 0 || this.XYRange.xmax == 0 || this.XYRange.ymin == 0 || this.XYRange.ymax == 0)
            {
                document.getElementById("out-panel").style.display = 'none';
                document.getElementById("infoPanel").innerHTML = "";
                return;
            }
            else
            {
                if(document.getElementById("out-panel").style.display == 'none')
                {
                    document.getElementById("out-panel").style.display = 'block';
                    $("#out-panel").addClass("fadeInDown");
                    setTimeout(function(){
                        $("#out-panel").removeClass("fadeInDown");
                    },1000);
                }
            }

            var panel = Dialog.build({
                title: i18n.t('gismodule.getLatLngRangeModule.rangePanel.title'),
                content: this._createBSDetailTable(),
                leftBtnCallback:function(){
                    drawnItems.clearLayers();
                    if(document.getElementById("out-panel").style.display == 'block')
                        document.getElementById("out-panel").style.display = 'none';
                },
                rightBtnCallback:function(){
                    callback();
                }
            });
            document.getElementById("infoPanel").innerHTML = panel;
            Dialog.show(function() {});
        }
    }

    getLatLngRange = function (options){
        return new _getLatLngRange(options);
    };


    _defineDialog = function(){
        var attrs;
        var source;
        var tpl;

        this.initialize = function()
        {
            tpl = _.template(this._createPanel());
        }

        this._createPanel = function(){
            var innerHtml =
                '<div class="panel">'+
                '<div class="panel-heading">'+
                '<span id="nv-dialog-title" class="panel-title"> <%= title %> </span>'+
                '</div>'+
                '<div id="nv-dialog-body" class="panel-body " style="height:160px; overflow-x: hidden; overflow-y: hidden">'+
                '<%= content %>'+
                '</div>'+
                '<div class="panel-footer text-center" id="nv-dialog-footer">'+
                '<button id="nv-dialog-leftbtn" class="btn btn-default" type="button" style="margin-right:15px;min-width:60px">'+
                '<%= leftBtn %>'+
                '</button>'+
                '<button id="nv-dialog-rightbtn" class="btn btn-primary" type="button" style="min-width:60px">'+
                '<%= rightBtn %>'+
                '</button>'+
                '</div>'+
                '</div>';
            return innerHtml;
        }


        this.build = function(opts) {
            attrs = {
                title: opts.title || "",
                content: opts.content || "",
                leftBtn: opts.leftBtn || i18n.t('gismodule.getLatLngRangeModule.rangePanel.cancle'),
                rightBtn: opts.rightBtn || i18n.t('gismodule.getLatLngRangeModule.rangePanel.OK'),
                hideLeftBtn: opts.hideLeftBtn,
                hideRightBtn: opts.hideRightBtn,
                hideFooter: opts.hideFooter,
                minHeight: opts.minHeight,
                leftBtnCallback: opts.leftBtnCallback || function() {
                    document.getElementById("infoPanel").innerHTML = "";
                },
                rightBtnCallback: opts.rightBtnCallback || function() {
                    document.getElementById("infoPanel").innerHTML = "";
                },
                extraBtn: opts.extraBtn || [],
                extraListener: opts.extraListener || [],
                style: opts.style || 'basic',  // ENUM(basic: 450px, sm: 300px, lg: 700px, xl: 1000px, full: 90%)
                width: opts.width || 0,
                minHeight: opts.minHeight,
                closeOnBgClick: opts.closeOnBgClick || true
            };
            source = tpl(attrs);
            return source;
        }

        this.show = function(callback) {
            callback();
            if (attrs.minHeight) {
                $('#nv-dialog-body').css('min-height', attrs.minHeight);
            }
            if (attrs.hideLeftBtn == true) {
                $('#nv-dialog-leftbtn').hide();
            };
            if (attrs.hideRightBtn == true) {
                $('#nv-dialog-rightbtn').hide();
            };
            if (attrs.hideFooter) {
                $('#nv-dialog-footer').hide();
            }
            $('#nv-dialog-leftbtn').on('click', attrs.leftBtnCallback);
            $('#nv-dialog-rightbtn').on('click', attrs.rightBtnCallback);

        }
    }
}(window, document));
