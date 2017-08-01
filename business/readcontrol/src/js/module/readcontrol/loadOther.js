define(
    [
        'underscore',
        './library'

    ], function (_,lib) {
        //++++++++++++++++++定义变量++++++++++++++
        var tempCode='';
        var download_audio=i18n.t("dataprocess.action.download_audio");
        var download_video=i18n.t("dataprocess.action.download_video");
        var change_text_code=i18n.t("dataprocess.action.change_text_code");

        //++++++++++++++++++业务方法++++++++++++++
        //加载编码信息
        function load_encode_info(){
            lib.loadCodes("#contEnCode");
        }

        //检测文件类型
        function returnFileType(hrefType){
            //常见文件类型
            var fileType=[['MP4','3GP','MPG','AVI','WMV','FLV','SWF','VOB','MOV'],['MP3','WMA','MMF','AMR','OGG','M4A','WAV'],['JPG','JEPG','GIF','PNG','BMP'],['TXT','HTML','HTM','JSP','PHP','ASP','XML','JSON']];
            var indexNum=0;
            for(var i=0;i<fileType.length;i++){
                if(fileType[i].indexOf(hrefType)>-1){
                    indexNum=i+1;
                    return indexNum;
                }
            }
            return indexNum;

        }

        //加载http内容
        function load_other_cont(data) {
            if(!lib.checkBlank(data)){
                return;
            }

            //保存文件
            if (data.metaFiles.length>0) {
                var fileHref=lib.get_file_href(data.metaFiles, "ctype", "offxx").path;
                var tempArray=fileHref.split(".");
                var hrefType=tempArray[tempArray.length-1].toUpperCase();
                //音视频、图片类型文件 直接放入div容器，其他类型放入iframe
                tempCode='';
                switch (returnFileType(hrefType)){
                    case 0:
                        tempCode='<div class="other">' +
                            '<iframe id="ifm" class="diyScroll" marginwidth="0" marginheight="0" frameborder="0" scrolling="yes" src="'+lib.get_file_href(data.metaFiles, "ctype", "offxx").path+'"></iframe></div>';
                        break;

                    case 1:
                        tempCode='<div class="video">' +
                            '<video controls><source src="'+fileHref+'"></video>' +
                            '<p><a href="'+fileHref+'" download>'+download_video+'</a></p>' +
                            '</div>';
                        break;
                    case 2:
                        tempCode='<div class="audio">' +
                            '<audio controls><source src="'+fileHref+'"></audio>' +
                            '<p><a href="'+fileHref+'" download>'+download_audio+'</a></p>' +
                            '</div>';
                        break;
                    case 3:
                        tempCode='<div class="img">' +
                            '<img src="'+ fileHref+'" style="max-width:100%;">' +
                            '</div>';
                        break;
                    case 4:
                        $('#encode-btn-group').html('<button class="btn btn-default btn-sm" data-toggle="dropdown">' +
                            '<i class="fa icon-cogs"></i> ' +change_text_code+
                            '<span class="caret"></span>'+
                            '</button>'+
                            '<ul class="dropdown-menu code" id="contEnCode">' +
                            '</ul>');
                        load_encode_info();
                        tempCode='<div class="txt">' +
                            '<iframe id="ifm" class="diyScroll" marginwidth="0" marginheight="0" frameborder="0" scrolling="yes" src="'+lib.get_file_href(data.metaFiles, "ctype", "offxx").path+'"></iframe></div>';
                        break;

                }

                $("#other-cont").html(tempCode);
                var $wrapBox=$("#wrapBox");
                var ifmIDWidth=$wrapBox.width()-10;
                var ifmIDHeight=$wrapBox.height()-15-37-40;
                $("#ifm").width(ifmIDWidth).height(ifmIDHeight);
            }
        }

        //++++++++++++++++++事件响应++++++++++++++

        return {
            load_encode_info:load_encode_info,
            load_other_cont: load_other_cont
        }
    });
