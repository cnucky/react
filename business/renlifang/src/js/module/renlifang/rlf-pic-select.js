var $ = require('jquery');
var Dialog = require('nova-dialog');
var rlfPicSelect = require("../../tpl/rlf/rlf-pic-select");
var Notify = require("nova-notify");
var Util = require("nova-utils");

rlfPicSelect=_.template(rlfPicSelect);


function buildPicSelectDialog(imgData,onPicSearch) {
    var face_image_id_str,timer,picUrlPrefix,src,faceData,flag;
    function getPicUrlPrefix() {
        $.getJSON("/picsearch/picrecogcore/getPicUrlPrefix", {
        }, function(getPicUrlPrefixRsp) {
            if (getPicUrlPrefixRsp.code == 0) {
                picUrlPrefix = getPicUrlPrefixRsp.data;
            }
        });
    }
    getPicUrlPrefix();
    //获取人像库
    $.getJSON("/renlifang/personcore/getRlfFaceRepository", {
    }, function(rsp) {

        if (rsp.code != 0) {
            Notify.show({
                container: $("#alert-container"),
                alertid: "alert-keyword-no-result",
                alertclass: "alert-warning",
                content: "<i class='fa fa-keyboard-o pr10'></i><strong>" + rsp.message ? rsp.message : '网络请求失败' + "</strong>"
            });
            return;
        }
        else if (rsp.data.rtn == 0) {
            var result = rsp.data.results;
            faceData = [];
            for(var i = 0; i < result.length; i++) {
                faceData.push(result[i].id);
            }

        }
        else {
            Notify.simpleNotify("加载人像库失败");
            return;
        }
    });
    function url_add (url) {
        var face_image_uri = "";
        face_image_uri = picUrlPrefix + Util.enCodeString(url);
        return face_image_uri;
    }
    Dialog.build({
        title: "提交人脸图片",
        content: rlfPicSelect({
            imgData: imgData
        }),
        minHeight: '300px',
        rightBtnCallback: function () {
            if(flag){
                Notify.simpleNotify("请选择一张人像");
                return;
            }
            $.getJSON('/renlifang/personcore/getFaceRecogTaskId', {
                face_image_id_str: face_image_id_str,
                face_image_uri: src,
                repository_ids:faceData
            }).done(function (rsp) {
                var faceRecogTaskId = rsp.data;


                _.isFunction(onPicSearch) && onPicSearch(faceRecogTaskId);
                Dialog.dismiss();
            });


            /*var picBase64 = $("#imgShow").attr("src");
            $.post('/renlifang/personcore/checkFaceQuality', {
                picture_image_content_base64: picBase64,
            }).done(function (rsp) {
                rsp = eval("(" + rsp + ")");
                $("#imgShow").parent().css({"position":"relative"})
                if (rsp.code != 0) {
                    Notify.show({
                        container: $("#alert-container"),
                        alertid: "alert-keyword-no-result",
                        alertclass: "alert-warning",
                        content: "<i class='fa fa-keyboard-o pr10'></i><strong>" + rsp.message ? rsp.message : '网络请求失败' + "</strong>"
                    });
                    return;
                }
                else if (rsp.data.rtn == 0) {
                    if (rsp.data.results.length == 1) {
                        var result = rsp.data.results[0];
                        var div = document.createElement("div");
                        div.style.position = "absolute";
                        div.style.left = result.face_rect.l + "";
                        div.style.top = result.face_rect.t + "";
                        div.style.width = result.face_rect.w + "";
                        div.style.height = result.face_rect.h + "";
                        div.style.border = "1px solid #f00";
                        $("#imgShow").parent().append(div);
                        console.log(result.face_rect);
                        $.getJSON('/renlifang/personcore/getFaceRecogTaskId', {
                            face_image_id_str: result.face_image_id_str
                        }).done(function (rsp) {

                            _.isFunction(onPicSearch) && onPicSearch(rsp.data);
                            Dialog.dismiss();
                        });
                    }
                }
                else {
                    Notify.simpleNotify("图片中未检测到人脸");
                    return;
                }
            });*/
        }
    }).show(function () {
        /*$("#btn-sisuo-reselect-pic").click(function () {
            $("#sisuo-file-input").click();

            //alert("btn-sisuo-reselect-pic");
        });*/
        flag = false;
        var picBase64 = $("#imgShow").attr("src");
        var img = new Image();
        img.src = picBase64;

        $.post('/renlifang/personcore/checkFaceQuality', {
            picture_image_content_base64: picBase64,
            complete:function () {
                var div = document.createElement("div");
                div.id = "progress_d";
                $("#modal-panel").css({position:"relative"});
                div.className = "col-md-12 col-sm-12";
                div.style.position = "absolute";
                div.style.left = "50%";
                div.style.top = "50%";
                div.style.transform = "translate(-50%,-50%)";
                $("#modal-panel").append(div);
                $("#progress_d").html('<div class="panel" style="opacity: 0.8"><div class="panel-heading"><span class="panel-title"><code>.progress-bar-striped</code></span></div><div class="panel-body"><div class="progress"><div id="bar_d" class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%</div></div></div></div>')
                var len = 0;
                $(".panel-title code").html("正在识别,请稍候")
                timer = setInterval(function () {
                    len += 20;
                    $("#bar_d").css({width : len + "%"});
                    $("#bar_d").html(len + "%");
                    if(len >= 100){
                        clearInterval(timer);
                    }
                },400)
            }
        }).done(function (rsp) {

            $("#bar_d").css({width : 100 + "%"});
            $("#bar_d").html(100 + "%");
            setTimeout(function () {
                $("#progress_d").remove();
            },150);
            rsp = eval("(" + rsp + ")");
            $("#imgShow").parent().css({"position":"relative"})
            if (rsp.code != 0) {
                Notify.show({
                    container: $("#alert-container"),
                    alertid: "alert-keyword-no-result",
                    alertclass: "alert-warning",
                    content: "<i class='fa fa-keyboard-o pr10'></i><strong>" + rsp.message ? rsp.message : '网络请求失败' + "</strong>"
                });
                return;
            }
            else if (rsp.data.rtn == 0) {
                var result = rsp.data.results;
                console.log(result.length)
                if (result.length == 1) {
                    var uri = result[0].face_image_uri;
                    src = url_add(uri);
                    $("#imgShow").attr({src:src});
                    face_image_id_str = result[0].face_image_id_str;
                    console.log(face_image_id_str);
                    /*$.getJSON('/picsearch/picrecogcore/getFaceRecogTaskId', {
                        face_image_id_str: result.face_image_id_str
                    }).done(function (rsp) {
                        console.log(rsp)
                        _.isFunction(onPicSearch) && onPicSearch(rsp.data);
                    });*/
                } else if (result.length == 0) {
                    flag = true;
                    Notify.simpleNotify("图片中未检测到人脸");
                    return;
                } else {
                    flag = true;
                    var scale = document.getElementById("imgShow").clientHeight / img.height;
                    for (var i = 0; i < result.length; i++) {
                        console.log($("#imgShow").offset().left)
                        var div = document.createElement("div");
                        div.style.position = "absolute";
                        div.style.width = result[i].face_rect.w * scale + "px";
                        div.style.height = result[i].face_rect.h * scale + "px";
                        div.style.left = result[i].face_rect.x * scale + $("#imgShow").offset().left - $("#imgShow").parent().offset().left + "px";
                        div.style.top = result[i].face_rect.y * scale + "px";
                        div.style.border = "1px solid #f00";
                        div.imgid = result[i].face_image_id_str;
                        div.index = i;
                        div.className = "redDiv";
                        $("#imgShow").parent().append(div);
                        $(div).click(function () {
                            flag = false;
                            face_image_id_str = $(this).prop("imgid");
                            $(".redDiv").css({"border":"1px solid #f00"});
                            $(this).css({"border":"1px solid #0f0"});
                            console.log(result);
                            src = url_add(result[this.index].face_image_uri);
                        })
                    }

                }
            }
            else {
                flag = true;
                Notify.simpleNotify("图片中未检测到人脸");
                return;
            }
        });
        $("#sisuo-file-input").change(function () {
            var a = document.getElementById('sisuo-file-input');
            var file = a.files[0];
            var imgFile = new FileReader();
            if (file && file.type.match('image.*')) {
                imgFile.readAsDataURL(file);
                imgFile.onload = function () {
                    var imgData = this.result;
                    var $imgShow = $("#imgShow");
                    $imgShow.attr("src", imgData);
                }
            }
        })
    });
}

module.exports.buildPicSelectDialog = buildPicSelectDialog;
