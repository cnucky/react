define(
    [
        'underscore',
        './library'
    ], function (_,lib) {
        //+++++++++++++定义的变量++++++++++
        var tempCode='',tempCode2=''; //临时代码数据
        var user_list=i18n.t("dataprocess.name.user_list");
        var user_number=i18n.t("dataprocess.name.user_number");
        var user_id=i18n.t("dataprocess.name.user_id");
        var user_account=i18n.t("dataprocess.name.user_account");
        var user_nickname=i18n.t("dataprocess.name.user_nickname");
        var login_id=i18n.t("dataprocess.name.login_id");
        var chat_cont=i18n.t("dataprocess.name.chat_cont");
        var view_details=i18n.t("dataprocess.action.view_details");
        var close_details=i18n.t("dataprocess.action.close_details");
        var download_audio=i18n.t("dataprocess.action.download_audio");
        var download_video=i18n.t("dataprocess.action.download_video");

        //++++++++++++++++++业务方法++++++++++++++

        //加载编码信息
        function load_encode_info(){
            lib.loadFonts("#fontFamily");
        }
        //返回值不为空的人物信息
        function userTag(data,label){ //label为要展现的标签
            var code='';
            for(var i=0;i< data.length;i++){
                var data_i=data[i];
                if(lib.checkBlank(data_i.key))code+='<'+label+'>'+data_i.val+':'+data_i.key+'</'+label+'>';
            }
            return code;
        }

        //检测用户信息是否都为空
        function check_allInfo_null(data){
            var nullCount=0;
            var length=0;
            $.each(data, function(k, v) {
                length++;
                if(!lib.checkBlank(v)) nullCount++;
            });
            if(length==nullCount) return false; else return true;
        }
        //加载聊天内容
        function load_chat_cont(obj) {
            if(!lib.checkBlank(obj)){
                return;
            }
            lib.set_wrap_width_height();
            var chatCont=$("#chat-cont").html('');
            var muted = "text-gray";

            //人物列表
            if(lib.checkBlank(obj.user)||lib.checkBlank(obj.friends)){
                tempCode='',tempCode2='';
                chatCont.append('<div class="cont" id="userList">' +
                                '<h5><a class="fa fa-minus-square"></a>'+user_list+'</h5>' +
                                '<div class="contBox checkkeyword"></div>' +
                                '</div>');
                var userListContBox=$("#userList").children('.contBox');

                //显示登录方用户信息
                if(lib.checkBlank(obj.user)&&check_allInfo_null(obj.user)){
                    var u=obj.user;
                    tempCode='<dl class="dl-horizontal">' +
                             '<dt><span class="glyphicons glyphicons-user text-host"></span></dt>'+
                             userTag([{"key": u.userid,"val":user_id},{"key": u.account,"val":user_account},{"key": u.nickname,"val":user_nickname},{"key": u.ip,"val":"IP"}],"dd")+
                             '</dl>';
                    userListContBox.html(tempCode);
                    //在第1个dd后面添加“登录方”
                    var firstDl=userListContBox.children("dl:first");
                    if(userListContBox.children("dl:first").find("dd").length==0){
                        firstDl.append('<dd><span class="pull-right">'+login_id+'</span></dd>');
                    }else{
                        firstDl.find("dd:first").prepend('<span class="pull-right">'+login_id+'</span>');
                    }
                }
                //显示参与方用户信息
                if(lib.checkBlank(obj.friends)&&check_allInfo_null(obj.friends)){
                    for(var i=0;i<obj.friends.length;i++){
                        var f=obj.friends[i];
                        tempCode='<dl class="dl-horizontal"><dt><span class="glyphicons glyphicons-user text-guest"></span></dt>';
                        tempCode+=userTag([{"key": f.userid,"val":user_id},{"key": f.account,"val":user_account},{"key": f.nickname,"val":user_nickname},{"key": f.ip,"val":"IP"}],"dd");
                        tempCode+='</dl>';
                        userListContBox.append(tempCode);
                    }
                }
            }

            //聊天内容
            if(lib.checkBlank(obj.records)){
                chatCont.append('<div class="cont" id="chatCont">' +
                                    '<h5><a class="fa fa-minus-square"></a>'+chat_cont+'</h5>' +
                                    '<div class="contBox checkkeyword"></div>' +
                                '</div>');
                var chatArry=[];
                tempCode='';
                var wordViewCode='';
                for(var i=0;i<obj.records.length;i++){
                    var ri=obj.records[i];
                    var arrow='<span class="glyphicons glyphicons-right_arrow"></span>',leftInfo='',rightInfo='',bClass='';
                    if(lib.checkBlank(ri.from)){
                        leftInfo=userTag([{"key": ri.from.userid,"val":user_id},{"key": ri.from.account,"val":user_account},{"key": ri.from.nickname,"val":user_nickname},{"key": ri.from.ip,"val":"IP"}],"p");
                    }
                    if(lib.checkBlank(ri.to)){
                        rightInfo=userTag([{"key": ri.to.userid,"val":user_id},{"key": ri.to.account,"val":user_account},{"key": ri.to.nickname,"val":user_nickname},{"key": ri.to.ip,"val":"IP"}],"p");
                    }
                    if(ri.send=="I"){
                        tempCode='<dl class="dl-horizontal in"><dt><span class="glyphicons glyphicons-user text-host"></span></dt>';
                    }else if(ri.send=="F"){
                        tempCode='<dl class="dl-horizontal out"><dt><span class="glyphicons glyphicons-user text-guest"></span></dt>';
                    }else{
                        tempCode='<dl class="dl-horizontal"><dt></dt>';
                        arrow='';
                    }
                    tempCode+='<dd class="msg">' +
                                '<span class="arrow"></span>' +
                                '<div class="time">' +
                                    '<a class="pull-right">'+view_details+'</a>';
                    if(lib.checkBlank(ri.from)&&lib.checkBlank(ri.from.userid)) tempCode+='<b>'+ri.from.userid+'</b>';
                    tempCode+='<span class="text-muted"> at: '+ri.date+'</span>' +
                                '</div>'+
                                '<div class="userInfo text-muted">' +
                                    '<div class="col-md-5">'+leftInfo+'</div>' +
                                    '<div class="col-md-2">'+arrow+'</div>' +
                                    '<div class="col-md-5">'+rightInfo+'</div>' +
                                '</div>'+
                                '<div class="chatInfos">';
                    wordViewCode+='<div></div><span class="text-muted">'+ri.date+'</span> ['+leftInfo+'] '+i18n.t("dataprocess.action.sendTo")+' ['+rightInfo+']：';
                    for(var j=0;j<ri.infos.length;j++){
                        var ij=ri.infos[j];
                        if(ij.type=="txt"){
                            tempCode+='<div class="txt" style="font-family: '+ij.fontFamily+'">'+lib.replaceBkts(ij.info)+'</div>';
                            wordViewCode+=ij.info+'</div>';
                        }else if(ij.type=="audio"){
                            tempCode+='<div class="audio">';
                            wordViewCode+=i18n.t("dataprocess.name.a_audio")+'</div>';
                            for(var k=0;k<ij.chatFiles.length;k++){
                                var ck=ij.chatFiles[k];
                                if(k==0){
                                    var audioNum="";
                                    if(ij.chatFiles.length>1) audioNum='('+(k+1)+')';
                                    tempCode+='<p><audio controls id="firstAudio"><source src="'+ck.path+'"></audio></p><p><a id="firstAudioAddr" href="'+ck.path+'" download>'+download_audio+audioNum+'</a></p>';
                                }else{
                                    tempCode+='<p><audio controls class="otherAudio"><source src="'+ck.path+'"></audio></p><p><a class="otherAudioAddr" href="'+ck.path+'" download>'+download_audio+'('+(k+1)+')</a></p>';
                                }
                            }
                            tempCode+='</div>'
                        }else if(ij.type=="img"){
                            wordViewCode+=i18n.t("dataprocess.name.a_pic")+'</div>';
                            for(var k=0;k<ij.chatFiles.length;k++){
                                var ck=ij.chatFiles[k];
                                tempCode+='<div class="img"><img class="img-responsive" src="'+ck.path+'" title="'+ck.name+'"></div>';
                            }

                        }else if(ij.type=="file"){
                            wordViewCode+=i18n.t("dataprocess.name.a_file")+'</div>';
                            for(var k=0;k<ij.chatFiles.length;k++){
                                var ck=ij.chatFiles[k];
                                tempCode+='<div class="file"><a href="'+ck.path+'" download>'+ck.name+'('+ck.size+')</a></div>';
                            }
                        }else if(ij.type=="video"){
                            wordViewCode+=i18n.t("dataprocess.name.a_video")+'</div>';
                            for(var k=0;k<ij.chatFiles.length;k++){
                                var ck=ij.chatFiles[k];
                                tempCode+='<div class="video"><p><video controls><source src="'+ck.path+'"></video></p><p><a href="'+ck.path+'" download>'+download_video+'</a></p></div>';
                            }
                        }
                    }
                    tempCode+='</div>'+
                              '</dd></dl>';
                    chatArry.push(tempCode);

                    //音频播放器绑定事件
                    var firstAudio=$("#firstAudio");
                    firstAudio.on("play", function() {
                        $(".otherAudio")[0].play();
                    });
                    firstAudio.on("pause", function() {
                        $(".otherAudio")[0].pause();
                    });
                    firstAudio.on("timeupdate", function() {
                        $(".otherAudio")[0].currentTime=firstAudio[0].currentTime;
                    });
                    firstAudio.on("volumechange", function() {
                        $(".otherAudio")[0].volume=firstAudio[0].volume;
                    });


                }
                lib.append_txtCont_by_steps($("#chatCont .contBox"),chatArry,"array",100,5);//4参数:容器,数据,逐步数据,延迟毫秒

                // 文字视图
                var wordCode='<div class="checkkeyword">'+wordViewCode+'</div>';
                //$("#tplContBox").children('.content:eq(1)').html(wordCode);
                var txtViewBox=$("#tplContBox").children('.content:eq(1)');
                lib.append_txtCont_by_steps(txtViewBox,wordCode,"string",51200,5); //4参数:容器,数据,逐步数据,延迟毫秒
            }

        }

        //++++++++++++++++++事件响应++++++++++++++
        //聊天内容 查看详情
        $(document).on('click', 'dd a.pull-right ', function (e) {
            e.preventDefault();
            $(this).parent().next().fadeToggle("fast");
            if($(this).html()==view_details){
                $(this).html(close_details);
            }else{
                $(this).html(view_details);
            }
        });

        return {
            load_encode_info:load_encode_info,
            load_chat_cont: load_chat_cont
        }
    });
