registerLocales(require.context('../../../locales/smalltoolset/', false, /\.js/));
require([
    'widget/md5-hash',
    'nova-notify',
    'nova-empty-dialog',
    '../../tpl/smalltoolset/tpl-smalltoolset-topbar',
    '../../tpl/smalltoolset/tpl-smalltoolset-ipAddress',
    '../../tpl/smalltoolset/tpl-smalltoolset-phoneAddress',
    '../../tpl/smalltoolset/tpl-smalltoolset-baseStation',
    '../../tpl/smalltoolset/tpl-smalltoolset-MD5',
    '../../tpl/smalltoolset/tpl-smalltoolset-enAndDecode',
    'utility/jbase64.js'
], function (
    md5_hash,
    Notify,
    Dialog,
    tpl_smalltoolset_topbar,
    tpl_smalltoolset_ipAddress,
    tpl_smalltoolset_phoneAddress,
    tpl_smalltoolset_baseStation,
    tpl_smalltoolset_MD5,
    tpl_smalltoolset_enAndDecode

) {
    $(function(){
        //var smalltoolset_topbar_ipsAddr = i18n.t("smalltoolset.ipAddress.searchName");
        //alert(smalltoolset_topbar_ipsAddr)


        var carriers = null;
        var carriers_object = {};
        $.ajax({
            url:"/smalltoolset/get_carriers",
            type:"post",
            async: false,
            success:function(data){
                carriers = data;
                _.each(data,function(item){
                    carriers_object[item.key] = item.value;
                })
            }
        });

        var topBarPage = _.template(tpl_smalltoolset_topbar);

        $('#content_wrapper').prepend(topBarPage());

        $('#topbar-dropmenu [data-i18n]').localize();

        $('.topbar-applet').on('click',function(){
            $('#topbar-dropmenu').slideToggle(230);
        });

        var contentType = $('#topbar-dropmenu');

        contentType.on('click', '.metro-tile', function(e) {
            e.preventDefault();
            var title = $(this).find('.metro-title').text()
            var key = $(this).find('.metro-title').data('key')
            var page = function(){};
            if(key == 'ipsAddr'){
                page = _.template(tpl_smalltoolset_ipAddress)
            }
            if(key == 'numberAttribute'){
                page = _.template(tpl_smalltoolset_phoneAddress)
            }
            if(key == 'baseStationInfo'){
                page = _.template(tpl_smalltoolset_baseStation)
            }
            if(key == 'MD5Encode'){
                page = _.template(tpl_smalltoolset_MD5)
            }
            if(key == 'CharacterString'){
                page = _.template(tpl_smalltoolset_enAndDecode)
                isEncode = "base64";
            }
            //$('.small-tool-set-i18n [data-i18n]').localize();
            Dialog.build({
                title: title,
                content: page({carriers:carriers}),
                width:800,
                hideLeftBtn: true,
                hideRightBtn: true,
                hideFooter: true,
                closeBtnCallback: function(){

                }
            }).show(function(){$('.small-tool-set-i18n [data-i18n]').localize()});
        });





        $('body').on('click', "#sts-ipsAddress", function (){
            var ipInput = $("#sts-ip-address-search").val();

            var ipAddreses = $('#sts-ip-address-search').val().split('\n');
            var sendIpAddreses = [];
            if(ipAddreses.length > 0){
                for(var k = 0 ; k < ipAddreses.length ; k++){
                    if(ipAddreses[k]){
                        var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
                        if(!reg.test(ipAddreses[k])){
                            //Notify.show({
                            //    text: ' is not a ipAddress',
                            //    type: "info"
                            //});
                            //$("#ip-address-search").val("");
                            //return;
                            continue;
                        }else{
                            sendIpAddreses.push(ipAddreses[k]);
                        }
                    }else{
                        continue;
                    }
                }
            }else{
                Notify.show({
                    text: 'ipAddreses is empty',
                    type: "info"
                });
                $("#sts-ip-address-search").val("");
                return;
            }
            $.ajax({
                url:"/smalltoolset/getIpsAddrInfo",
                type:"post",
                data:{queryContent:sendIpAddreses},
                success:function(data){
                    var idAddressHtml= '';
                    $("#sts-ip-address-search").val("");
                    data = JSON.parse(data.data);
                    for(var i = 0;i<data.length;i++){
                        idAddressHtml+="<tr style='border-bottom:1px solid gray;'>" +
                            "<td width='8%'>" + (i+ 1) + "</td>" +
                            "<td width='20%'>" + sendIpAddreses[i] +"</td>" +
                            "<td width='72%'>" + data[i] + "</td>" +
                            "</tr>";
                    }
                    $('#sts-ipTab').html(idAddressHtml);
                }
            });

        });


        //$(".bgnoscroll").scroll(function(){
        //    $("body").css("overflow-y","hidden");
        //})

        //   /^1[3|4|5|7|8][0-9]{9}$/
        //号码归属地查询
        //$('#MSISDNRad').attr("checked","checked");



        $('body').on('click', "#sts-IMSIRad", function (){
            if($(this).is(":checked")){
                var phone1 = $('#sts-phoneComment1');
                var phone2 = $('#sts-phoneComment2');
                phone1.css('display', 'none');
                phone2.css('display', 'block');
                $('#sts-MSISDNRad').attr("checked",false);
            }else{
                phone1.css('display', 'none');
                phone2.css('display', 'block');
                $('#sts-MSISDNRad').attr("checked","checked");
            }
        });
        $('body').on('click', "#sts-MSISDNRad", function (){
            if($(this).is(":checked")){
                var phone1 = $('#sts-phoneComment1');
                var phone2 = $('#sts-phoneComment2');
                phone1.css('display', 'block');
                phone2.css('display', 'none');
                $('#sts-IMSIRad').attr("checked",false);
            }else{
                phone1.css('display', 'block');
                phone2.css('display', 'none');
                $('#sts-IMSIRad').attr("checked","checked");
            }
        });

        $('body').on('click', "#sts-telNumberTel", function (){
            var TelNumberArray = [];

            var telNumber = [];
            var telsNum = [];
            var MISIValue = $('#sts-phoneComment1').val();
            var IMSIValue = $('#sts-phoneComment2').val();

            if($("#sts-MSISDNRad").is(":checked")){
                telsNum = $('#sts-phoneComment1').val().split('\n');

                if(telsNum.length > 0){
                    for(var k = 0 ; k < telsNum.length ; k++){
                        if(telsNum[k]){
                            var reg = /^1[3|4|5|7|8][0-9]{9}$/
                            if(!reg.test(telsNum[k])){
                                //Notify.show({
                                //    text: ' is not a telAddreses',
                                //    type: "info"
                                //});
                                //$("#phoneComment1").val("");
                                //return;
                                continue;
                            }else{
                                telNumber.push(telsNum[k]);
                            }
                        }else{
                            continue
                        }
                    }
                }else{
                    Notify.show({
                        text: 'telAddreses is empty',
                        type: "info"
                    });
                    $("#sts-tel-address-search").val("");
                    return;
                }
                console.log(telNumber);
            }else{
                telNumber = $('#sts-phoneComment2').val().split('\n');
                telsNum = $('#sts-phoneComment2').val().split('\n');

                if(telsNum.length > 0){
                    for(var k = 0 ; k < telsNum.length ; k++){
                        if(telsNum[k]){
                            var reg = /^1[3|4|5|7|8][0-9]{9}$/
                            if(!reg.test(telsNum[k])){
                                //Notify.show({
                                //    text: ' is not a telAddreses',
                                //    type: "info"
                                //});
                                //$("#phoneComment1").val("");
                                //return;
                                continue
                            }else{
                                telNumber.push(telsNum[k]);
                            }
                        }else{
                            continue;
                        }
                    }
                }else{
                    Notify.show({
                        text: 'telAddreses is empty',
                        type: "info"
                    });
                    $("#sts-tel-address-search input").val("");
                    return;
                }
                console.log(telNumber);
            }

            var Typelabels=$("input[name='telradio']:checked").next("label").text();

            for(var i = 0; i < telNumber.length; i++){
                var TelNumber = {};
                TelNumber['type'] = Typelabels;
                TelNumber['number'] = telNumber[i];
                TelNumberArray.push(TelNumber);
                console.log(TelNumberArray);
            }

            $.ajax({
                url:"/smalltoolset/getTelNumberAddrInfo",
                type:"post",
                data:{queryContent:TelNumberArray},

                success:function(data){
                    var telAddressHtml= '';
                    data = JSON.parse(data.data);
                    for(var i = 0;i<data.length;i++){
                        telAddressHtml+="<tr style='border-bottom:1px solid gray;'>" +
                            "<td width='10%'>" + (i+ 1) + "</td>" +
                            "<td width='25%'>" + TelNumberArray[i].number +"</td>" +
                            "<td width='65%'>" + data[i] + "</td>" +
                            "</tr>";
                    }
                    $("#sts-tel-address-search input").val("");

                    $('#sts-phoneComment1').val("");
                    $('#sts-phoneComment2').val("");
                    if(MISIValue!="" || IMSIValue!=""){
                        $('#sts-telsTab').html(telAddressHtml);
                    }
                }

            });
        });



        //$('#baserad1').attr("checked","checked");

        //基站信息 精确查询
        //$("#baserad1").on('click',function(){
        $('body').on('click', "#sts-baserad1", function (){
            if($(this).is(":checked")){
                var tabOne = $('#sts-tab1');
                var tabTwo = $('#sts-tab2');
                tabOne.css('display', 'block');
                tabTwo.css('display', 'none');
                $('#sts-baserad2').attr("checked",false);
            }else{
                tabOne.css('display', 'none');
                tabTwo.css('display', 'block');
                $('#sts-baserad2').attr("checked","checked");
            }
        });

        //模糊查询
        $('body').on('click', "#sts-baserad2", function (){
        //$("#baserad2").on('click',function(){
            if($(this).is(":checked")){
                var tabOne = $('#sts-tab1');
                var tabTwo = $('#sts-tab2');
                tabOne.css('display', 'none');
                tabTwo.css('display', 'block');
                $('#sts-baserad1').attr("checked",false);
            }else{
                tabTwo.css('display', 'none');
                tabOne.css('display', 'block');
                $('#sts-baserad1').attr("checked","checked");
            }
        });


        $('body').on('click', "#sts-LACCI1", function (){
        //$('#LACCI1').on('click',function(){

            var baseStaType = $('#sts-baseStationType option:selected').val();
            var LACSear = $('#sts-LACSearch').val();
            var CISear = $('#sts-CISearch').val();


            var baseStationNumberArray = [];
            var baseStationNumber = {};

            baseStationNumber['carrier'] = baseStaType;
            baseStationNumber['lac'] = LACSear;
            baseStationNumber['ci'] = CISear;
            baseStationNumberArray.push(baseStationNumber);
            $.ajax({
                url:"/smalltoolset/getBaseStationInfo",
                type:"post",
                data:{queryContent:baseStationNumberArray},
                success:function(data){
                    var accutreBaseInfoHtml= '';
                    data = JSON.parse(data.data);
                    for(var i = 0;i<data.length;i++){
                        accutreBaseInfoHtml+="<tr style='border-bottom:1px solid gray;'>" +
                            "<td style='width:6%;'>" + (i+ 1) + "</td>" +
                            "<td style='width:10%;'>" +  carriers_object[data[i].carrier] +"</td>" +
                            "<td style='width:9%;'>" + data[i].lac +"</td>" +
                            "<td style='width:9%;'>" + data[i].ci +"</td>" +
                            "<td style='width:35%;'>" + data[i].address+ "</td>" +
                            "<td style='width:15%;'>" + data[i].longitude + "</td>" +
                            "<td style='width:15%;'>" + data[i].latitude + "</td>" +
                            "</tr>";
                    }
                    $('#sts-longitudeTab').html(accutreBaseInfoHtml);
                }
            });

        });

        $('body').on('click', "#sts-LACCI2", function (){
            var baseAddress = [];
            baseAddress.puth({'condition':$('#sts-address').val()});
            console.log(baseAddress);
            $.ajax({
                url:"/smalltoolset/getBaseStationFuzzyInfoe",
                type:"post",
                data:{queryContent:baseAddress},
                success:function(data){
                    var accutreBaseInfoHtml= '';
                    data = JSON.parse(data.data);
                    for(var i = 0;i<data.length;i++){
                        accutreBaseInfoHtml+="<tr style='border-bottom:1px solid gray;'>" +
                            "<td style='width:6%;'>" + (i+ 1) + "</td>" +
                            "<td style='width:10%;'>" +  data[i].carrier +"</td>" +
                            "<td style='width:9%;'>" + data[i].lac +"</td>" +
                            "<td style='width:9%;'>" + data[i].ci +"</td>" +
                            "<td style='width:35%;'>" + data[i].address+ "</td>" +
                            "<td style='width:15%;'>" + data[i].longitude + "</td>" +
                            "<td style='width:15%;'>" + data[i].latitude + "</td>" +
                            "</tr>";
                    }
                    $('#sts-longitudeTab').html(accutreBaseInfoHtml);
                }
            });
        });


        //md5
        //var md5_hash = new Md5();
        var md5Button = $('#sts-md5Btn');
        var selectFile=[];

        $('body').on('change', "#sts-md5_file_selector", function (e){
        //$('#md5_file_selector').change(function(e){

            var files = document.getElementById("sts-md5_file_selector").files;
            console.log(files);
            var fileName='';
            for(var i = 0;i<files.length;i++){
                fileName+=files[i].name+",";
            }
            $('#sts-fileText').val(fileName);
            selectFile = e.target.files || e.dataTransfer.files;

        });

        $('body').on('click', "#sts-md5Btn", function (){
        //$(document).on("click","#md5Btn",function(){
            $('#sts-md5Tab tr:not(:first)').empty("");
            var files = document.getElementById("sts-md5_file_selector").files;
            for(var i = 0;i<files.length;i++){
                md5_hash.ParseFile(selectFile[i],hashmd5_callback);
            }

        });

        //获取文件名
        function getFileName(o){
            var pos = o.lastIndexOf("\\");
            return o.substring(pos+1);
        }

        function hashmd5_callback(md5){
            var fileVal = $('#sts-fileText').val();
            var files = document.getElementById("sts-md5_file_selector").files;
            var md5Html= '';
            for(var i = 0;i<files.length;i++){
                md5Html += "<tr>";
                md5Html += "<td style='width: 10%;'>" + (i+1) + "</td>";
                md5Html += "<td style='width: 15%;'>" + files[i].name + "</td>";
                md5Html += "<td style='width: 75%;'>" + md5 +"</td>";
                md5Html +=  "</tr>";

            }
            $("#sts-md5Tab tbody tr").remove();
            $('#sts-md5Tab').append(md5Html);
        }


        //字符串编码
        //$('#optionsRadios1').attr("checked","checked");

        //var base64Option = $('#optionsRadios1').next('label').text();
        //console.log(base64Option);
        //var uriOption = $('#optionsRadios2').text();
        //var htmlOption = $('#optionsRadios3').text();
        //
        //var stringOptions = $("input[name='optionsRadios']:checked").next('label').text();
        //console.log(stringOptions);

        var isEncode = "";

        $('body').on('click', "#sts-optionsRadios1", function (){
            isEncode = "base64";
        })


        $('body').on('click', "#sts-optionsRadios2", function (){
            isEncode = "uri";
        })

        $('body').on('click', "#sts-optionsRadios3", function (){
            isEncode = "html";
        })

        $('body').on('click', "#sts-codeBtn", function (){

            var leftText = $("#sts-leftArea").val();
            var rightText = "";

            if(isEncode=='base64'){
                rightText = BASE64.encoder(leftText);
            }
            if(isEncode=='uri'){
                rightText = encodeURIComponent(leftText);
            }
            if(isEncode=='html'){
                rightText = htmlEncode(leftText);
            }

            $("#sts-rightArea").val(rightText);

        });

        $('body').on('click', "#sts-decodeBtn", function (){
        //$('#decodeBtn').on('click',function(){
            var rightText = $("#sts-rightArea").val();
            var leftText = '';
            if(isEncode=='base64'){
                leftText = BASE64.decoder(rightText);
            }
            if(isEncode=='uri'){
                leftText = decodeURIComponent(rightText);
            }
            if(isEncode=='html'){
                leftText = htmlDecode(rightText);
            }
            $('#sts-leftArea').val(leftText)

        });

        $('body').on('click', "#sts-clearBtn", function (){
            $("#sts-leftArea").val("");
            $("#sts-rightArea").val("");
        });


        $('body').on('click', "input[name='optionsRadios']", function (){
            $('#sts-leftArea').val("");
            $('#sts-rightArea').val("");
        });

        //html解码编码
        function htmlEncode(value){
            if(value){
                return $('<div/>').text(value).html();
            }else{
                return '';
            }
        }
        function htmlDecode(value){
            if(value){
                return $('<div/>').html(value).text();
            }else{
                return '';
            }
        }
    });
})