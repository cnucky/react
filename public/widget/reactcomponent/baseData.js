/**
 * Created by root on 17-3-1.
 */
//地区相关基础数据
var areaKeyNameMap={};
var areaGroupArray=[];

module.exports.getAreaGroupArray=function(){
    var cloneAreaGroupArray=[];
    for(var i=0;i<areaGroupArray.length;i++){
        var areaGroup=areaGroupArray[i];
        var cloneAreaGroup={type:areaGroup.type,areaArray:[]};

        cloneAreaGroup.areaArray=_cloneProvinceArray(areaGroup.areaArray);

        cloneAreaGroupArray.push(cloneAreaGroup);
    }
    return cloneAreaGroupArray;
};

module.exports.getDepartmentArray=function(){
    return departmentArray;
};


//系统相关基础数据
var dataCenterArray=[];
var dataCenterLevelMap={};
var mergeSystemMap={};
var objectMap={};
module.exports.getDataCenterArray=function(){
    return dataCenterArray;
};
module.exports.getAreaKeyNameMap=function(){
    return areaKeyNameMap;
};
module.exports.getDataCenterLevelMap=function(){
    return dataCenterLevelMap;
};
module.exports.getMergeSystemMap=function(){
    return mergeSystemMap;
};
module.exports.getObjectMap=function(){
    return objectMap;
};

//单位相关基础数据
var departmentArray=[];

//操作相关基础数据
var operationsArray=[];
var operationMap={};
var operationArrayOrderByType=[];
module.exports.getOperationsArray=function(){
    return operationsArray;
};
module.exports.getOperationMap=function(){
    return operationMap;
};
module.exports.getOperationArrayOrderByType=function(){
    return operationArrayOrderByType;
};


//current language
var currentLanguage='zn-ch';
module.exports.getCurrentLanguage=function(){
    return currentLanguage;
};


/**
 * 格式化时间
 * @param date
 * @param format
 * @returns {*}
 */
module.exports.formatDate=function(date,format){
    var o = {
        "M+":date.getMonth()+1,
        "d+":date.getDate(),
        "h+":date.getHours(),
        "m+":date.getMinutes(),
        "s+":date.getSeconds(),
        "q+":Math.floor((date.getMonth()+3)/3),
        "S":date.getMilliseconds()
    }
    if(/(y+)/.test(format)){
        format =  format.replace(RegExp.$1,(date.getFullYear()+"").substr(4-RegExp.$1.length));
    }
    for(var k in o){
        if(new RegExp("("+k+")").test(format)){
            format = format.replace(RegExp.$1,RegExp.$1.length==1?o[k]:("00"+o[k]).substr((""+o[k]).length));
        }
    }
    return format;
};


//todo
module.exports.init =function(){
    $.get('/businessmanage/businessmanage/getLocalAreaInfo',{}).done(function(rsp){
        var local = JSON.parse(rsp);
        if(local.code == 0){
            var localInfo = JSON.parse(rsp).data;
            var localAreaId=localInfo.id;
            $.get('/businessmanage/businessmanage/getDistrictData',{}).done(function(rsp){
                var location = JSON.parse(rsp);
                if(location.code == 0){
                    var locationList = JSON.parse(rsp).data;
                    areaGroupArray=_translateAreaData(locationList,localAreaId);
                    areaKeyNameMap=_generalAreaKeyNameMap(locationList);
                }else{
                    Notify.show({
                        title: i18n.t('businessManage.failure'),
                        type: "error",
                        text: localInfo.message
                    });
                }
            });
        }else{
            Notify.show({
                title: i18n.t('businessManage.failure'),
                type: "error",
                text: local.message
            });
        }
    });


    $.get('/businessmanage/businessmanage/getDataSources',{}).done(function(rsp){
        var systems = JSON.parse(rsp);
        if(systems.code == 0){
            var systemsData = JSON.parse(rsp).data;
            dataCenterArray = _initSystemDataByDataSourceManageLevel(systemsData);
            for(var i=0;i<dataCenterArray.length;i++){
                var dataCenter=dataCenterArray[i];
                dataCenterLevelMap[dataCenter.key]=dataCenter.minManage;

                for(var j=0;j<dataCenter.children.length;j++){
                    var mergeSystem=dataCenter.children[j];
                    for(var k=0;k<mergeSystem.systemId.length;k++){
                        mergeSystemMap[mergeSystem.systemId[k]]=mergeSystem;
                    }
                }

            }
        }else{
            Notify.show({
                title: i18n.t('businessManage.failure'),
                type: "error",
                text: systems.message
            });
        }
    });

    $.get("/businessmanage/businessmanage/get_current_language",function(rsp){
        var rsp = JSON.parse(rsp);
        if(rsp != null){
            currentLanguage=rsp;
        }else{
            Notify.show({
                title: i18n.t('businessManage.failure'),
                type: "error",
                text: ""
            });
        }
    });

    $.get('/businessmanage/businessmanage/getDepartments',{}).done(function(rsp){
        var departments = JSON.parse(rsp);
        if(departments.code == 0){
            departmentArray=_changeDepartTreeForArray(departments.data);
        }else{
            Notify.show({
                title: i18n.t('businessManage.failure'),
                type: "error",
                text: departments.message
            });
        }
    });


    $.get('/businessmanage/businessmanage/getOperations',{}).done(function(rsp){
        rsp = JSON.parse(rsp);
        if(rsp.code == 0){
            operationsArray=rsp.data;
            for( var i=0;i<operationsArray.length;i++){
                var  operation=operationsArray[i];
                operationMap[operation.id]=operation.name;
            }
            operationArrayOrderByType=_getBusinessTypeByOprerationBaseConfig(operationsArray);
        }else{
            Notify.show({
                title: i18n.t('businessManage.failure'),
                type: "error",
                text: rsp.message
            });
        }
    });
};


module.exports.dealMethod = function(systems){
    var returnData = [];
    var methodMap={};
    var methodNameArray=[];
    for(var i=0;i<systems.length;i++){
        var system=systems[i];
        if(methodMap[system.method]==null){
            var methodSystem={
                key:system.key,
                name:system.method,
                systemId:[system.key]
            };
            methodMap[system.method]=methodSystem;
            methodNameArray.push(system.method);
        }
        else{
            var methodSystem=methodMap[system.method];
            methodSystem.key=methodSystem.key+","+system.key;
            methodSystem.systemId.push(system.key);
        }
    }

    for(var i=0;i<methodNameArray.length;i++){
        returnData.push(methodMap[methodNameArray[i]]);
    }

    return returnData;
};

//clone province array
var _cloneProvinceArray=function(provinceArray){
    var cloneProvinceArray=[];
    for(var j=0;j<provinceArray.length;j++){
        var province=provinceArray[j];
        var cloneProvince=_cloneProvince(province);
        cloneProvinceArray.push(cloneProvince);
    }
    return cloneProvinceArray;
};

//clone province
var _cloneProvince=function(area){
    var cloneArea={id:area.id,name:area.name,type:area.type,cities:[]};

    for(var j=0;j<area.cities.length;j++){
        var city=area.cities[j];
        cloneArea.cities.push({id:city.id,name:city.name});
    }
    return cloneArea;
};



var _getBusinessTypeByOprerationBaseConfig = function(array){
    var returnData = [];
    for(var i=0;i<array.length;i++){

        var flag = false;
        for(var j=0;j<returnData.length;j++){
            if(array[i].type == returnData[j].type){
                var child = {};
                child.id = array[i].id;
                child.name = array[i].name;
                returnData[j].children.push(child);
                flag = true;
                break;
            }
        }
        if(!flag){
            var type = {};
            type.type = array[i].type;
            type.name = array[i].type_name;
            type.children = [];
            var child = {};
            child.id = array[i].id;
            child.name = array[i].name;
            type.children.push(child);
            returnData.push(type);
        }

    }
    return returnData;
};

var _changeDepartTreeForArray = function(arrayObj){
    var array = [];
    var element = this;
    $(arrayObj).each(function(index){
        var data = {};
        data.key = arrayObj[index].key;
        data.id = arrayObj[index].key.split('-')[1];
        data.name = arrayObj[index].name;
        data.type = arrayObj[index].type;
        data.parentId = arrayObj[index].key.split('-')[0];
        data.folder = arrayObj[index].folder;
        array.push(data);
        if(arrayObj[index].children!=null){
            array = array.concat(_changeDepartTreeForArray(arrayObj[index].children));
        }
    });
    return array;
};

var _initSystemDataByDataSourceManageLevel = function(arrayObj){

    for( var i=0;i<arrayObj.length;i++){
        var  dataArea=arrayObj[i];
        objectMap[dataArea.key]=dataArea.name;
        for(var j=0; j<dataArea.children.length;j++){
            var system=dataArea.children[j];
            objectMap[system.key]=system.name;
        }
    }

    var targetCenterArray = [];
    $(arrayObj).each(function(index){
        var manage = _getLevel(arrayObj[index].manage);
        var data = {};
        data.key = arrayObj[index].key;
        data.type=arrayObj[index].type;
        data.manage=arrayObj[index].manage;
        data.name = arrayObj[index].name;
        data.systemId = [];
        data.children = [];
        //直接展示数据中心
        if(manage==null){
            data.minManage = 'area';
            $(arrayObj[index].children).each(function(i,child){
                data.systemId.push(child.key);
            });
            data.children=[{'key':data.key,'name':data.name,'systemId':data.systemId}];
        }else if(manage=='method'){//汇总
            data.minManage = 'method';
            data.children = _dealMethod(arrayObj[index].children);
        }else if(manage=='system'){//直接加载
            data.minManage = 'system';
            data.children = _dealSystem(arrayObj[index].children);
        }
        targetCenterArray.push(data);
    });
    return targetCenterArray;
};


var _getLevel = function(array){
    var first = null;
    $(array).each(function(index){
        if(array[index].level=='system') {
            first = 'system';
        }else if(first!='system'&&array[index].level=='method'){
            first = 'method'
        }
    });
    return first;
};

var _dealMethod = function(systems){
    var returnData = [];
    var methodMap={};
    var methodNameArray=[];
    for(var i=0;i<systems.length;i++){
        var system=systems[i];
        if(methodMap[system.method]==null){
            var methodSystem={
                key:system.key,
                name:system.method,
                systemId:[system.key]
            };
            methodMap[system.method]=methodSystem;
            methodNameArray.push(system.method);
        }
        else{
            var methodSystem=methodMap[system.method];
            methodSystem.key=methodSystem.key+","+system.key;
            methodSystem.systemId.push(system.key);
        }
    }

    for(var i=0;i<methodNameArray.length;i++){
        returnData.push(methodMap[methodNameArray[i]]);
    }

    return returnData;
};

var _dealSystem = function(array){
    var returnData = [];
    $(array).each(function(index,child){
        child.systemId = [];
        child.systemId.push(child.key);
        returnData.push(child);
    })
    return returnData;
};

var _generalAreaKeyNameMap=function(locationList){
    var areaKeyNameMap={};
    for(var i=0;i<locationList.length;i++){
        var province=locationList[i];
        areaKeyNameMap[province.id]=province.name;
        for(var j=0;j<province.cities.length;j++){
            var city=province.cities[j];
            areaKeyNameMap[city.id]=city.name;
        }
    }
    return areaKeyNameMap;
};


var _translateAreaData=function(locationList,localAreaId){
    var typeMap={};
    var typeSet=[];

    for(var i=0;i<locationList.length;i++){
        var province=locationList[i];
        if(localAreaId==province.id){
            province.isLocal=true;
        }
        if(province.cities.length==0){
            var city={
                id:province.id,
                name:province.name
            }
            province.cities.push(city);
        }
    }

    for(var i=0;i<locationList.length;i++){
        var type=locationList[i].type;
        if(typeMap[type]==null){
            typeMap[type]=[];
            typeSet.push(type);
        }
        typeMap[type].push(locationList[i]);
    }

    var areaGroupArray=[];
    for(var i=0;i<typeSet.length;i++){
        var type=typeSet[i];
        areaGroupArray.push({type:type,areaArray:typeMap[type]});
    }

    return areaGroupArray;
};

