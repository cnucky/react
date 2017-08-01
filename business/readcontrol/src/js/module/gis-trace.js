define(
    [
        "jquery",
        'underscore',
        'nova-notify',
        'nova-bootbox-dialog',
        '../../../../giswidget/src/js/module/gis-manageAimTrackModule',
        'jquery.datatables',
        'datatables.bootstrap'
    ], function ($,_,Notify,bootbox, manageAimTrack) {

        function init()
        {
            $('#map-wrapper').empty().append(_.template(manageAimTrack.TplContent()));
            manageAimTrack.Init();
        }

        function clearMap()
        {
            if($('#map-wrapper').children().length != 0)
            {
                manageAimTrack.ClearTargetDatas();
                $('#map-wrapper').empty();
            }
        }

        function showData(datas)
        {
            var jsonObjs = {};
            var len = datas.length;
            clearMap();
            for(var i=0; i<len; i++)
            {
                var tempObj = datas[i];
                if(typeof jsonObjs[tempObj.PHONE_NUMBER] == 'undefined')
                {
                    var jsonObj = {
                        time:"时间",
                        latitude:"纬度",
                        longitude:"经度",
                        name:tempObj.PHONE_NUMBER,
                        columns:["时间","经度","纬度","号码","描述"],
                        data:[]
                    }
                    jsonObjs[tempObj.PHONE_NUMBER] = jsonObj;
                }
                var lat = parseFloat(tempObj.LOCATION.LATITUDE);
                var lon = parseFloat(tempObj.LOCATION.LONGITUDE);
                if (isNaN(lat) || isNaN(lon) || (lon < -180) || (lon > 180) || (lat < -90) || (lat > 90))
                    continue;
                jsonObjs[tempObj.PHONE_NUMBER].data.push([tempObj.TIME,tempObj.LOCATION.LONGITUDE,tempObj.LOCATION.LATITUDE,tempObj.PHONE_NUMBER,tempObj.DESC]);
            }
            for(var aim in jsonObjs)
            {
                // if(aim.toString().trim() == '')
                //     continue;
                if(jsonObjs[aim].data.length >= 1)
                    manageAimTrack.AddTargetDatas(jsonObjs[aim]);
            }
        }

        return {
            init:init,
            clearMap:clearMap,
            showDataOnMap:showData
        };
    });
