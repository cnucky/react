/**
 * Created by root on 1/20/16.
 */

define([],
    function(){
        //为每一列生成推荐字段数组
        function generateRecFieldsForCols(params) {
            //每一列生成推荐字段数组,返回值
            var recommendFiledsArray = new Array();
            var isHaveHead = params.isHaveHead;
            var headArray = params.headArray;
            var fieldsNameArray = params.fieldsNameArray;
            var nameArray = params.nameArray;
            var colNum = params.colNum;
            var colsContentArray = params.colsContentArray;
            var fieldIndexArray = params.fieldIndexArray;
            console.log("fieldIndexArray", fieldIndexArray);

            //有表头
            //if(isHaveHead)
            {
                //console.log("fieldsNameArray" + fieldsNameArray);
                for(var i=0;i<headArray.length;++i){
                    //var maxComparePercent = 0;
                    var suitFiledNameArray = [];

                    for(var j=0; j<fieldsNameArray.length && j<nameArray.length; ++j){
                        var suitRecName = {};
                        if(headArray[i]!==""){
                            var fieldsNameCompareRes = compare(headArray[i],fieldsNameArray[j]);
                            var nameCompareRes = compare(headArray[i],nameArray[j]);

                            //if(compare(headArray[i],fieldsNameArray[j]) >= maxComparePercent
                            //    && compare(headArray[i],fieldsNameArray[j])!==0){
                            if(fieldsNameCompareRes >= 50 || nameCompareRes>=70){
                                //maxComparePercent = compare(headArray[i],fieldsNameArray[j]);
                                //comparePercentArray.push(compare(headArray[i],fieldsNameArray[j]));
                                suitRecName.maxComparePercent =
                                    fieldsNameCompareRes>=nameCompareRes?fieldsNameCompareRes:nameCompareRes;
                                //compare(headArray[i],fieldsNameArray[j]);
                                suitRecName.suitFiledName = fieldIndexArray[j]; //j; //
                                suitRecName.filedName = fieldsNameArray[j];
                                suitFiledNameArray.push(suitRecName);//(fieldsNameArray[j]);
                            }
                            if(fieldsNameCompareRes == 100 || nameCompareRes == 100){
                                suitRecName.maxComparePercent = 100;
                                suitRecName.suitFiledName = fieldIndexArray[j]; //j; //
                                suitRecName.filedName = fieldsNameArray[j];
                                suitFiledNameArray=[suitRecName];//[fieldsNameArray[j]];
                                break;
                            }
                        }
                    }

                    recommendFiledsArray.push(suitFiledNameArray);
                }
                //console.log(recommendFiledsArray);
                return recommendFiledsArray;
            }
            //else{
            //$.post('/dataMap/MapTableRecommend', {
            //    "params" : params,
            //}).done(function(res){
            //        var data = JSON.parse(res);
            //        console.log("data.recommendFiledsArray:", data.recommendFiledsArray);
            //        return data.recommendFiledsArray;
            //    }
            //);
            //}
        }

        function compare(a,b){
            var z = 0;
            var s = a.length + b.length;

            str1 = a.split("");
            str2 = b.split("");
            str1.sort();
            str2.sort();
            var str1shift = str1.shift();
            var str2shift = str2.shift();

            while(str1shift !== undefined && str2shift!== undefined){
                if(str1shift === str2shift){
                    z++;
                    str1shift = str1.shift();
                    str2shift = str2.shift();
                } else if(str1shift < str2shift){
                    str1shift = str1.shift();
                }else if(str1shift > str2shift){
                    str2shift = str2.shift();
                }
            }

            return z/s * 200;
        }

        return {
            generateRecFieldsForCols: function(params){
                return generateRecFieldsForCols(params);
            }
        }

    }
);
