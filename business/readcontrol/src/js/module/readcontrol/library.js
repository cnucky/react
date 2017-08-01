define(
    [
        'underscore'

    ], function (_) {
        //+++++++++++++定义的变量++++++++++

        //编码库  *编码分组，中间增加分隔线 {"c": "divider", "v": ""}*
        var encodesLib = [
            {"c": "unicode", "v": "Unicode"},
            {"c": "utf-8", "v": i18n.t("dataprocess.encode.utf-8")},
            {"c": "us-ascii", "v": "US-ASCII"},
            {"c": "divider", "v": ""},
            {"c": "EUC-CN", "v": i18n.t("dataprocess.encode.EUC-CN")},
            {"c": "gb2312", "v": i18n.t("dataprocess.encode.gb2312")},
            {"c": "gb18030", "v": i18n.t("dataprocess.encode.gb18030")},
            {"c": "big5", "v": i18n.t("dataprocess.encode.big5")},
            {"c": "divider", "v": ""},
            {"c": "euc-jp", "v": i18n.t("dataprocess.encode.euc-jp")},
            {"c": "iso-2022-jp", "v": i18n.t("dataprocess.encode.iso-2022-jp")},
            {"c": "shift_jis", "v": i18n.t("dataprocess.encode.shift_jis")},
            {"c": "ks_c_5601-1987", "v": i18n.t("dataprocess.encode.ks_c_5601-1987")},
            {"c": "euc-kr", "v": i18n.t("dataprocess.encode.euc-kr")},
            {"c": "iso-2022-kr", "v": i18n.t("dataprocess.encode.iso-2022-kr")},
            {"c": "windows-1258", "v": i18n.t("dataprocess.encode.windows-1258")},
            {"c": "windows-874", "v": i18n.t("dataprocess.encode.windows-874")},
            {"c": "divider", "v": ""},
            {"c": "ASMO-708", "v": i18n.t("dataprocess.encode.ASMO-708")},
            {"c": "iso-8859-6", "v": i18n.t("dataprocess.encode.iso-8859-6")},
            {"c": "windows-1256", "v": i18n.t("dataprocess.encode.windows-1256")},
            {"c": "ibm775", "v": i18n.t("dataprocess.encode.ibm775")},
            {"c": "iso-8859-4", "v": i18n.t("dataprocess.encode.iso-8859-4")},
            {"c": "windows-1257", "v": i18n.t("dataprocess.encode.windows-1257")},
            {"c": "ibm852", "v": i18n.t("dataprocess.encode.ibm852")},
            {"c": "iso-8859-2", "v": i18n.t("dataprocess.encode.iso-8859-2")},
            {"c": "windows-1250", "v": i18n.t("dataprocess.encode.windows-1250")},
            {"c": "cp866", "v": i18n.t("dataprocess.encode.cp866")},
            {"c": "iso-8859-5", "v": i18n.t("dataprocess.encode.iso-8859-5")},
            {"c": "koi8-r", "v": i18n.t("dataprocess.encode.koi8-r")},
            {"c": "koi8-u", "v": i18n.t("dataprocess.encode.koi8-u")},
            {"c": "windows-1251", "v": i18n.t("dataprocess.encode.windows-1251")},
            {"c": "ibm737", "v": i18n.t("dataprocess.encode.ibm737")},
            {"c": "iso-8859-7", "v": i18n.t("dataprocess.encode.iso-8859-7")},
            {"c": "windows-1253", "v": i18n.t("dataprocess.encode.windows-1253")},
            {"c": "ibm869", "v": i18n.t("dataprocess.encode.ibm869")},
            {"c": "iso-8859-8", "v": i18n.t("dataprocess.encode.iso-8859-8")},
            {"c": "windows-1255", "v": i18n.t("dataprocess.encode.windows-1255")},
            {"c": "CP870", "v": i18n.t("dataprocess.encode.CP870")},
            {"c": "CP1026", "v": i18n.t("dataprocess.encode.CP1026")},
            {"c": "ebcdic-cp-us", "v": i18n.t("dataprocess.encode.ebcdic-cp-us")},
            {"c": "IBM437", "v": i18n.t("dataprocess.encode.IBM437")},
            {"c": "ibm861", "v": i18n.t("dataprocess.encode.ibm861")},
            {"c": "iso-8859-3", "v": i18n.t("dataprocess.encode.iso-8859-3")},
            {"c": "iso-8859-15", "v": i18n.t("dataprocess.encode.iso-8859-15")},
            {"c": "ibm857", "v": i18n.t("dataprocess.encode.ibm857")},
            {"c": "iso-8859-9", "v": i18n.t("dataprocess.encode.iso-8859-9")},
            {"c": "windows-1254", "v": i18n.t("dataprocess.encode.windows-1254")},
            {"c": "ibm850", "v": i18n.t("dataprocess.encode.ibm850")},
            {"c": "iso-8859-1", "v": i18n.t("dataprocess.encode.iso-8859-1")},
            {"c": "Windows-1252", "v": i18n.t("dataprocess.encode.Windows-1252")}
        ];

        //字体库
        var fontsLib = [
            {"c": "BZDBT", "v": i18n.t("dataprocess.fontLib.BZDBT")},
            {"c": "'Microsoft Himalaya'", "v": i18n.t("dataprocess.fontLib.Microsoft Himalaya")},
            {"c": "TIBETBT", "v": i18n.t("dataprocess.fontLib.TIBETBT")},
            {"c": "'UyghurEdit Lotus'", "v": i18n.t("dataprocess.fontLib.UyghurEdit Lotus")},
            {"c": "'UighurSoft HG Song'", "v": i18n.t("dataprocess.fontLib.UighurSoft HG Song")},
            {"c": i18n.t("dataprocess.encode.songti"), "v": i18n.t("dataprocess.fontLib.songti")}
        ];

        //默认字体
        var defaultFont='\"Open Sans\", Helvetica, Arial, sans-serif';

        //++++++++++++++++++业务方法++++++++++++++

        //获得保存文件地址
        function get_file_href(a, t, v) {
            for (var i = 0; i < a.length; i++) {
                if (a[i][t] == v) return a[i];
            }
            return null;
        }

        //去除html中js css
        function remove_js(data){
            return data.replace(/<script/ig,"<b style='display:none;'")
                .replace(/script>/ig,"b>")
                .replace(/webkit-scrollbar/ig,"kkkk");
        }


        //替换< >
        function replaceBkts(str) {
            if(checkBlank(str)) return str.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
        }

        //容器宽高度的一些设置
        function set_wrap_width_height(){
            var $wrapBox=$("#wrapBox");
            $("#tplContBox").width($wrapBox.width()-5).height($wrapBox.height()-15-35-30);
        }

        // 加载编码库
        function loadCodes(warp) {
            var code = '<li><a code="" class="a">'+i18n.t("dataprocess.encode.defaultCode")+'</a></li>' +
                       '<li class="divider">'+i18n.t("dataprocess.encode.divider")+'</li>';
            for (var i = 0; i < encodesLib.length; i++) {
                var ei = encodesLib[i];
                if (ei.c != "divider") {
                    code += '<li><a code="' + ei.c + '">' + ei.v + '</a></li>'
                } else {
                    code += '<li class="divider">'+i18n.t("dataprocess.encode.divider")+'</li>'
                }
            }
            $(warp).html(code);

        }

        // 加载字体库
        function loadFonts(warp) {
            var code = '<li><a code="'+defaultFont+'" class="a">'+i18n.t("dataprocess.fontLib.defaultFont")+'</a></li>' +
                       '<li class="divider">'+i18n.t("dataprocess.encode.divider")+'</li>';
            for (var i = 0; i < fontsLib.length; i++) {
                var fi = fontsLib[i];
                code += '<li><a code="' + fi.c + '">' + fi.v + '</a></li>';

            }
            $(warp).html(code);

            /*alert($(warp).html());*/
        }

        //高亮显示
        function SearchHighlight(wrap, keyword) {
            if (keyword=="") return;
            var tempCode='';
            if($(wrap).get(0).tagName=="IFRAME"){
                tempCode = $(wrap).contents().find("body").html();
            }else{
                tempCode = $(wrap).html();
            }
            var htmlReg = new RegExp("\<.*?\>", "i");
            var arrA = [];
            //替换HTML标签
            for (var i = 0; true; i++) {
                var m = htmlReg.exec(tempCode);
                if (m) arrA[i] = m; else break;
                tempCode = tempCode.replace(m, "{[(" + i + ")]}");
            }
            var words = unescape(keyword.replace(/\+/g, ' ')).split(/\s+/);
            //替换关键字
            for (w = 0; w < words.length; w++) {
                var r = new RegExp("(" + words[w].replace(/[(){}.+*?^$|\\\[\]]/g, "\\$&") + ")", "ig");
                tempCode = tempCode.replace(r, "<b class='mark'>$1</b>");
            }
            //恢复HTML标签
            for (var i = 0; i < arrA.length; i++) {
                tempCode = tempCode.replace("{[(" + i + ")]}", arrA[i]);
            }
            //pucl.innerHTML = temp;
            if($(wrap).get(0).tagName=="IFRAME"){
                $(wrap).contents().find("body").html(tempCode);
            }else{
                $(wrap).html(tempCode);
            }
        }

        function mark(txt,markWord){
            if (markWord==""||txt=="") return txt;
            var htmlReg = new RegExp("\<.*?\>", "i");
            var arrA = [];
            //替换HTML标签
            for (var i = 0; true; i++) {
                var m = htmlReg.exec(txt);
                if (m) arrA[i] = m; else break;
                txt = txt.replace(m, "{[(" + i + ")]}");
            }
            var words = markWord.replace(/\+/g, ' ').split(/\s+/);
            //替换关键字
            for (w = 0; w < words.length; w++) {
                var r = new RegExp("(" + words[w].replace(/[(){}.+*?^$|\\\[\]]/g, "\\$&") + ")", "ig");
                txt = txt.replace(r, "<b class='mark'>$1</b>");
            }
            //恢复HTML标签
            for (var i = 0; i < arrA.length; i++) {
                txt = txt.replace("{[(" + i + ")]}", arrA[i]);
            }
            return txt;
        }

        //检测参数是否为空
        function checkBlank(data){
            if(typeof(data)!="undefined" && data!="" && data!=null)
                return true;
            else
                return false;
        }

        //服务器地址替换
        function replace_server_IP(href,serverIp){
            var tempArry=[];
            var tail='';
            if(href.indexOf('http://')>-1){ //判断是否带有"http://"
                tempArry=href.split("http://")[1].split("/");
            }else
                tempArry=href.split("/");
            for(var i=1;i<tempArry.length;i++){
                tail+="/"+tempArry[i];
            }
            if(tempArry[0].indexOf(":")>-1){ //判断是否有端口
                return "http://"+serverIp+":"+tempArry[0].split(":")[1]+tail;
            }else{
                return "http://"+serverIp+tail;
            }

        }
        //对于文本内容分布追加
        function append_txtCont_by_steps(warp,data,type,stepNum,sec){
            if (data.length > stepNum){
                var code;
                if(type=="array"){
                    for(var i=0;i<stepNum;i++){
                        code+=data[i];
                    }
                    warp.append(code);
                    data.splice(0,stepNum);

                }else{
                    code=data.substring(0,stepNum);
                    warp.append(code);
                    data = data.substring(stepNum);
                }
                if(data.length>0){
                    setTimeout(function(){append_txtCont_by_steps(warp,data,type,stepNum,100)},100);
                }
            }else{
                var code;
                if(type=="array") {
                    for (var i = 0; i < stepNum; i++) {
                        code += data[i];
                    }
                }else{
                    code=data;
                }
                warp.append(data);
            }

        }

        return {
            checkBlank:checkBlank,
            mark:mark,
            get_file_href:get_file_href,
            loadCodes:loadCodes,
            loadFonts:loadFonts,
            SearchHighlight:SearchHighlight,
            remove_js:remove_js,
            set_wrap_width_height:set_wrap_width_height,
            replace_server_IP:replace_server_IP,
            replaceBkts:replaceBkts,
            append_txtCont_by_steps:append_txtCont_by_steps
        }
    });
