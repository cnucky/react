define(
    [
        '../audioplayer',
        '../voicematerial-edit',
        'underscore',
        './library'
    ], function (aplayer, materialedit, _, lib) {
        //+++++++++++++定义的变量++++++++++
        var tempCode=''; //临时代码数据

        //++++++++++++++++++业务方法++++++++++++++

        //加载http内容
        function load_audio_cont(obj) {
            if(!lib.checkBlank(obj)||obj.files.length==0){
                return;
            }
            lib.set_wrap_width_height();
            $('#tplContBox .content').css({"overflow-x":"scroll","overflow-y":"auto"});
            tempCode='<div id="audioplayer-content" class="tray tray-center ph5 pn br-n" style="min-width: 590px;  height:230px;">';
            var wavArray=[],jsonArray=[];
            
            for(var i=0; i < obj.files.length; i++){
                if(obj.files[i] == undefined)
                    continue;

                var f_i=obj.files[i];

                var tempArray1=f_i.split("/");
                var fileFullName=tempArray1[tempArray1.length-1];

                var tempArray2=fileFullName.split('.');
                var fileType=tempArray2[tempArray2.length-1].toUpperCase();

                switch (fileType){
                    case "WAV":
                        wavArray.push(f_i);
                        break;
                    case "JSON":
                        jsonArray.push(f_i);
                        break;
                    case 'DAT':
                        jsonArray.push(f_i);
                        break;
                }
            }
            $('#tplContBox .content').empty().append(tempCode);            
            aplayer.init({
                container: $("#audioplayer-content"),
                channel: wavArray,
                wave: jsonArray,
                height: 235,
            });
        }

        //加载出材编辑
        function load_materialedit_cont(materialParam){
            $('#tplContBox .content').append('<hr style="margin-top: 0; margin-bottom: 15px;">');
            var $editnote_height=$("#wrapBox").height()-37-50-225-16-45-25;

            console.log($editnote_height);
            var temp = '<div id="materialcontent" style="min-width:590px;margin-right:5px;">'
                    +  '</div>';

            $('#tplContBox .content').append(temp);
            
            materialedit.init({
                cdrId: materialParam.cdrId,
                materialed: materialParam.materialed,
                caseId: materialParam.caseId,
                objectId: materialParam.objectId,
                objectNum: materialParam.objectNum,
                oppoNum: materialParam.oppoNum,
                callBeginTime: materialParam.callBeginTime,
                callLength: materialParam.callLength,
                audioName: materialParam.audioName,
                savedCallback: materialParam.savedCallback,
            });
            materialedit.render({
                container: '#materialcontent',
                height: $editnote_height > 300 ? $editnote_height : 300,
            });
        }

        //++++++++++++++++++事件响应++++++++++++++


        return {
            load_audio_cont: load_audio_cont,
            load_materialedit_cont: load_materialedit_cont,
        }
    });
