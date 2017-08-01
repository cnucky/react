define(
    [
        'underscore',
        './library'
    ], function (_,lib) {
        //+++++++++++++定义的变量++++++++++
        var muted = "text-gray";
        var tempCode='',tempCode2='',tabCode=''; //临时代码数据
        var $word=i18n.t("dataprocess.common.word");
        var $cont=i18n.t("dataprocess.common.$cont");

        //++++++++++++++++++业务方法++++++++++++++

        //加载编码信息
        function load_encode_info(){
            lib.loadCodes("#contEnCode");
            lib.loadFonts("#fontFamily");
        }
        //编码相关操作
        function encodeDo(obj,markWord,$iframe){
            //响应HTTP正文 类型也有4种
            if (lib.checkBlank(obj.respBody)) {
                var $ifm_respBody=$iframe.contents().find("#respBody").show();
                var $respBody='';
                var tempCode='',tempCode2='';
                var cont=$("#respBody").children(".contBox");
                for(var i=0;i<obj.respBody.length;i++){
                    var h=obj.respBody[i];
                    if(h.type=="TXT"||h.type=="FILE"){
                        if(h.type=="TXT"){
                            tempCode='<tr><td>'+ lib.mark(h.name,markWord)+'</td><td>'+ lib.mark(h.val,markWord)+'</td></tr>';
                        }else{
                            tempCode+='<tr><td>'+ lib.mark(h.name,markWord)+'</td><td><a href="'+ h.path+'">'+lib.mark(h.val,markWord)+'('+ h.size+')</a></td></tr>';
                        }
                    }else if(h.type=="HTML"){
                        $respBody+=lib.remove_js(h.val);
                    }else if(h.type=="IMG"){
                        for(var j=0;j< h.imgInfos.length;j++){
                            var hj=h.imgInfos[j];
                            tempCode2+='<tr><td>'+lib.mark(hj.title,markWord)+'</td><td>'+lib.mark(hj.val,markWord)+'</td></tr>'
                        }
                        $respBody+='<div class="IMG">' +
                            '<div><img src="'+ h.path+'"></div>' +
                            '<table class="table table-bordered'+muted+'"><tr><td>'+$word+'</td><td>'+$cont+'</td></tr>'+tempCode2+'</table>' +
                            '</div>';

                    }
                }
                if(tempCode!=''){
                    $respBody+='<div class="TXT">' +
                        '<table class="table table-bordered '+muted+'">' +
                        '<tr><td>'+$word+'</td><td>'+$cont+'</td></tr>'
                        +tempCode+'' +
                        '</table></div>';
                }
                if($respBody!=""){
                    $ifm_respBody.children(".contBox").html($respBody);
                }
            }
        }
        //加载http内容
        function load_http_cont(obj,markWord,flag) {
            if(!lib.checkBlank(obj)){
                return;
            }
            lib.set_wrap_width_height();
            var $tplContBox=$("#tplContBox");
            //console.log(JSON.stringify(obj,"",2))
            //源码视图
            var $sourceCodeBox=$tplContBox.children(".content:eq(1)").empty();
            //请求头
            if (lib.checkBlank(obj.reqHeaderStr)) {
                $sourceCodeBox.append('<div class="cont">' +
                    '<h5><a class="fa fa-plus-square"></a> '+i18n.t("dataprocess.name.reqHeader_info")+'</h5>' +
                    '<div class="contBox checkkeyword" style="display: none;">' +
                    '<pre>'+obj.reqHeaderStr+'</pre>' +
                    '</div>'+
                    '</div>');
            }
            //请求正文
            if (lib.checkBlank(obj.reqBody)){
                var $reqHeaderStr='';
                for(var i=0;i<obj.reqBody.length;i++){
                    var b=obj.reqBody[i];
                    if(b.type=="TXT"||b.type=="HTML"){
                        $reqHeaderStr+='<pre>'+ b.val.replace(/</ig,"&lt;").replace(/>/ig,"&gt;")+'</pre>';
                    }
                }
                if($reqHeaderStr!=""){
                    $sourceCodeBox.append('<div class="cont">' +
                        '<h5><a class="fa fa-minus-square"></a> '+i18n.t("dataprocess.name.reqBody_info")+'</h5>' +
                        '<div class="contBox checkkeyword" style="display: inline-block;">'+$reqHeaderStr+'</div>'+
                        '</div>');
                }
            }

            //响应头
            if (lib.checkBlank(obj.respHeaderStr)) {
                $sourceCodeBox.append('<div class="cont">' +
                    '<h5><a class="fa fa-plus-square"></a> '+i18n.t("dataprocess.name.respHeader_info")+'</h5>' +
                    '<div class="contBox checkkeyword" style="display: none;"><pre>'+obj.respHeaderStr+'</pre></div>'+
                    '</div>');
            }
            //响应正文
            if (lib.checkBlank(obj.respBody)){
                var $respBody='';

                for(var i=0;i<obj.respBody.length;i++){
                    var b=obj.respBody[i];
                    if(b.type=="TXT"||b.type=="HTML"){

                        if (is_json(obj.respHeader))
                        {
                            $respBody+='<pre>'+JSON.stringify(JSON.parse(b.val),"",2)+'</pre>';
                        }
                        else
                        {
                            $respBody+='<pre>'+ b.val.replace(/</ig,"&lt;").replace(/>/ig,"&gt;")+'</pre>';
                        }

                        /*var fileType=false;
                        if(lib.checkBlank(obj.respHeader)){
                            $.each(obj.respHeader,function(i,o){
                                if(o.name=="Content-Type"&&o.val.indexOf("text/json")>-1){
                                    fileType=true;
                                }
                            })
                        }
                        if(fileType){
                            $respBody+='<pre>'+JSON.stringify(JSON.parse(b.val),"",2)+'</pre>';
                        }else{
                            $respBody+='<pre>'+ b.val.replace(/</ig,"&lt;").replace(/>/ig,"&gt;")+'</pre>';
                        }*/

                    }
                }

                if($respBody!=""){
                    $sourceCodeBox.append('<div class="cont">' +
                        '<h5><a class="fa fa-minus-square"></a> '+i18n.t("dataprocess.name.respBody_info")+'</h5>' +
                        '<div class="contBox checkkeyword" style="display: inline-block;">'+$respBody+'</div>'+
                        '</div>');
                }
            }


            //网页视图
            var $iframe=$tplContBox.children("#httpIFM");

            if(flag){
                //判断iframe是否加载完成
                $iframe.load(function() {
                    var muted = "text-muted";
                    // 请求HTTP头信息  肯定是表格
                    if (lib.checkBlank(obj.reqHeader)) {
                        var $reqHeader='';
                        for(var i=0;i<obj.reqHeader.length;i++){
                            var h=obj.reqHeader[i];
                            $reqHeader+='<tr><td>'+ lib.mark(h.name,markWord)+'</td><td>'+ lib.mark(h.val,markWord)+'</td></tr>';
                        }
                        $iframe.contents().find("#reqHeader").show().children("table").html($reqHeader);
                    }

                    // 请求HTTP正文 类型 txt img file HTML
                    if (lib.checkBlank(obj.reqBody)) {
                        var $ifm_reqBody=$iframe.contents().find("#reqBody").show();
                        var $reqBody='';
                        var tempCode='',tempCode2='';
                        for(var i=0;i<obj.reqBody.length;i++){
                            var b=obj.reqBody[i];
                            if(b.type=="TXT"||b.type=="FILE"){
                                if(b.type=="TXT"){
                                    tempCode='<tr>' +
                                        '<td>'+ lib.mark(b.name,markWord)+'</td>' +
                                        '<td>'+ lib.mark(b.val,markWord)+'</td>' +
                                        '</tr>';
                                }else{
                                    tempCode+='<tr>' +
                                        '<td>'+ lib.mark(b.name,markWord)+'</td>' +
                                        '<td><a href="'+ b.path+'">'+lib.mark(b.val,markWord)+'('+ b.size+')</a></td>' +
                                        '</tr>';
                                }
                            }else if(b.type=="IMG"){
                                for(var j=0;j< b.imgInfos.length;j++){
                                    var bj=b.imgInfos[j];
                                    tempCode2+='<tr>' +
                                        '<td>'+lib.mark(bj.title,markWord)+'</td>' +
                                        '<td>'+lib.mark(bj.val,markWord)+'</td>' +
                                        '</tr>'
                                }
                                $reqBody+='<div class="IMG">' +
                                    '<div><img src="'+ b.path+'"></div>' +
                                    '<table class="table table-bordered '+muted+'">' +
                                    '<tr><td>'+$word+'</td><td>'+$cont+'</td></tr>'+tempCode2+
                                    '</table>' +
                                    '</div>';
                            }else if(b.type=="HTML"){
                                $reqBody+='<div class="HTML">'+ lib.mark(b.val,markWord)+'</div>'
                            }
                        }
                        if(tempCode!=''){
                            $reqBody+='<div class="TXT">' +
                                '<table class="table table-bordered '+muted+'">' +
                                '<tr><td>'+$word+'</td><td>'+$cont+'</td></tr>'+tempCode+
                                '</table>' +
                                '</div>'
                        }
                        $ifm_reqBody.children(".contBox").html($reqBody);
                    }
                    //响应HTTP头信息 肯定是表格
                    if (lib.checkBlank(obj.respHeader)) {
                        var $respHeader='';
                        for(var i=0;i<obj.respHeader.length;i++){
                            var h=obj.respHeader[i];
                            $respHeader+='<tr>' +
                                '<td>'+ lib.mark(h.name,markWord)+'</td>' +
                                '<td>'+ lib.mark(h.val,markWord)+'</td>' +
                                '</tr>';
                        }
                        $iframe.contents().find("#respHeader").show().children("table").html($respHeader);
                    }
                    encodeDo(obj,markWord,$iframe);
                });
            }else{
                encodeDo(obj,markWord,$iframe);
            }

        }

        function is_json(httpHeaderLines)
        {
            var isJson = false;
            if(lib.checkBlank(httpHeaderLines)){
                $.each(httpHeaderLines,function(i,o){
                    if(o.name=="Content-Type"&&o.val.indexOf("text/json")>-1){
                        isJson=true;
                        return false;
                    }
                })
            }

            return isJson;
        }

        return {
            load_encode_info:load_encode_info,
            load_http_cont: load_http_cont
        }
    });
