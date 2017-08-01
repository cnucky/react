/**
 * Created by zhangxinyue on 2016/3/2.
 */

(function (window, document, undefined){
    function _setPosition(options)
    {
        this.options = options;
    }

    _setPosition.prototype = {
        addTo: function (toolbar){
            this._container = toolbar._container;
            this._map = toolbar._map;
            this._initialize();
        },
        _initialize:function(){
           /* var toolButton = document.createElement('img');
            toolButton.src = "../js/components/gisWidget/setPositionModule/image/earth_location.png";*/

            var toolButton = document.createElement('span');
            toolButton.height = 24;
            toolButton.width = 24;
            toolButton.title = i18n.t('gismodule.setPosition.toolBtn');
            toolButton.className = "button-style fa fa-crosshairs";
            
            this._container.appendChild(toolButton);

            var parentId = document.getElementById(this.options.panelParentID);
            var innerHtml = this._createPanelInnerHtml();
            parentId.innerHTML = innerHtml;

            this.btn = toolButton;
            this.hidePanelImg = document.getElementById("hidePanel");

            L.DomEvent.on(document.getElementById("setPosition"),'click',function(){
                document.getElementById("longitudeErrorTip").innerHTML = "";
                document.getElementById("latitudeErrorTip").innerHTML = "";

                var longitude = parseFloat(document.getElementsByName("longitude")[0].value); //经度
                var latitude = parseFloat(document.getElementsByName("latitude")[0].value); //纬度

                if (isNaN(longitude)||isNaN(latitude)||(longitude < -180) || (longitude > 180) || (latitude < -90) || (latitude > 90)) {
                    if((longitude < -180) || (longitude > 180))
                    {
                        document.getElementById("longitudeErrorTip").innerHTML = i18n.t('gismodule.setPosition.info1');
                    }
                    if((latitude < -90) || (latitude > 90))
                    {
                        document.getElementById("latitudeErrorTip").innerHTML = i18n.t('gismodule.setPosition.info2');
                    }
                    return;
                }

                this._map.setView([latitude, longitude]);
                document.getElementsByName("longitude")[0].value = "";
                document.getElementsByName("latitude")[0].value = "";
            },this);

        },
        getBtn:function(){
            return this.btn;
        },
        getHidePanelImg:function(){
            return this.hidePanelImg;
        },
        _createPanelInnerHtml:function(){
            var innerHtml =
                '<div class="group-title">'+
                    '<label style="position: absolute;top:8px;left: 5px;">'+i18n.t('gismodule.setPosition.toolBtn')+'</label>'+
                    '<img id="hidePanel" src="../js/components/gisWidget/setPositionModule/image/remove-icon-small.png" style="position: absolute;top:10px;right: 8px;cursor: pointer;"/>'+
                '</div>'+
                '<div class="setPos-group-body">'+
                    '<table border = "0" style="position: relative;top:15px;width: 100%;">'+
                        '<tr>'+
                            '<td style="width: 20%;text-align: center;height: 30px;">'+i18n.t('gismodule.setPosition.tableCol.lng')+':</td>'+
                            '<td><input type="text" name="longitude" class="lonlat_input" placeholder="-180 ~ 180";></td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="width: 20%;text-align: center;height: 12px;"></td>'+
                            '<td id="longitudeErrorTip" style="text-align: left;height: 10px;font-size: 12px;color: red"></td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="width: 20%;text-align: center;height: 3px;">'+i18n.t('gismodule.setPosition.tableCol.lat')+':</td>'+
                            '<td><input type="text" name="latitude" class="lonlat_input" placeholder="-90 ~ 90";></td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td style="width: 20%;text-align: center;height: 12px;"></td>'+
                            '<td id="latitudeErrorTip" style="text-align: left;height: 10px;font-size: 12px;color: red"></td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td colspan="2" style="text-align: center;height: 40px;vertical-align: middle;">'+
                                '<button id = "setPosition" type="button" class="setPosition_button" title="'+i18n.t('gismodule.setPosition.info3')+'">'+i18n.t('gismodule.setPosition.tableCol.location')+'</button>'+
                            '</td>'+
                        '</tr>'+
                    '</table>'+
                '</div>';
            return innerHtml;
        }
    };

    setPosition = function (options){
        return new _setPosition(options);
    };
}(window, document));