initLocales();
require([
    'jquery',
    'nova-dialog',
    'nova-alert',
    'nova-utils',
    '../../../../../../public/widget/personalworktree',
    'utility/contextmenu/jquery.ui-contextmenu',
    '../../module/renlifang/rlf-pic-select.js'
], function($, Dialog, Alert, Util, PersonalWorkTree, Contextmenu, RlfPicSelect) {
    var Config = window.__CONF__.business.renlifang;
    hideLoader();
    setSearchMode();
    var wikiSearchIp = Config['wikiSearchIp'];
    var wikiSearchPermission = '100000:function:wikiSearch';

    var SaveDirId = '';

    if(Config && Config['bonusCategory']==true){
        $('#category-car').show();
        $('#category-hkid').show();
        $('#category-twid').show();
    }

    $.getJSON('/workspacedir/checkPermissions', {
        permissions: [wikiSearchPermission]
    }).done(function(rsp) {
        if (rsp.data) {
            var myPermissions = rsp.data;
            if (_.contains(myPermissions, wikiSearchPermission)) {
                $("#keyword").contextmenu({

                    menu: "#option",
                    beforeOpen: function(event, ui) {
                        var parent = ui.target.parents('#keyword');
                    },
                    select: function(event, ui) {
                        if (ui.cmd == "open") {
                            openContainingFolder(ui);
                        }
                    }
                });
            }
        }
    });

    $.getJSON('/workspacedir/querypreference', {
        name: 'PersonCoreSavePath'
    }).done(function(rsp) {
        if (rsp.data) {
            var dirId = rsp.data;
            $.getJSON('/workspacedir/getdir', {
                dirId: dirId
            }).done(function(rsp) {
                if (rsp.data) {
                    $('#savepath').text(rsp.data.name);
                    $('#savepath').attr('title', rsp.data.path);
                    SaveDirId = dirId;
                } else {
                    $('#savepath').text('请选择');
                    console.log('获取路径失败');
                }
            })
        } else {
            $('#savepath').text('请选择');
        }
    });

    function buildDirDialog(isSubmit, callback, para) {
        Dialog.build({
            title: '选择保存目录',
            content: "<div id='folder-picker'> Loading... </div>",
            rightBtnCallback: function() {
                var selectedNode = $("#folder-picker").fancytree("getTree").getActiveNode();
                if (isSubmit == true) {
                    chooseDirCallback(selectedNode, true, callback, para);
                } else {
                    chooseDirCallback(selectedNode, false);
                }
            }
        }).show(function() {
            $("#folder-picker").empty();
            PersonalWorkTree.buildTree({
                container: $("#folder-picker"),
                treeAreaFlag: 'saveTask'
            });
        });
    }

    $('#choose-button').on('click', function(e) {
        e.preventDefault();
        buildDirDialog(false);
    })

    $.getJSON('/workspacedir/checkPermissions', {
        permissions: [wikiSearchPermission]
    }).done(function(rsp) {
        if (rsp.data) {
            var myPermissions = rsp.data;
            console.log(rsp);
            if (_.contains(myPermissions, wikiSearchPermission)) {
                $("#keyword").contextmenu({

                    menu: "#option",
                    beforeOpen: function(event, ui) {
                        var parent = ui.target.parents('#keyword');
                    },
                    select: function(event, ui) {
                        if (ui.cmd == "open") {
                            openContainingFolder(ui);
                        }
                    }
                });
            }
        }
    });


    function openContainingFolder(ui) {
        var cookie = document.cookie.split(';');

        window.open(wikiSearchIp + '/ada/main.html?' + cookie[0] + '&query=' + document.getSelection().toString());
    }

    // 清除查询stash
    Util.stash.clearPageStash('/renlifang/profile.html');

    function submitPersonCore() {
        if (searchType == 2) {
            checkFuzzyQueryEntityExist(searchKeyword);
        } else {
            $.getJSON('/renlifang/personcore/checkentityexist', {
                entityId: searchKeyword,
                entityType: searchCategory
            }).done(function(rsp) {
                if (rsp.code != 0) {
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-keyword-no-result",
                        alertclass: "alert-warning",
                        content: "<i class='fa fa-keyboard-o pr10'></i><strong>" + rsp.message ? rsp.message : '网络请求失败' + "</strong>"
                    });
                    return;
                }
                if (rsp.data == 0) {
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-keyword-no-result",
                        alertclass: "alert-warning",
                        content: "<i class='fa fa-keyboard-o pr10'></i><strong> 没有符合条件的结果 </strong>"
                    });
                } else if (rsp.data == 2) {
                    Alert.show({
                        container: $("#alert-container"),
                        alertid: "alert-keyword-illegal",
                        alertclass: "alert-danger",
                        content: "<i class='fa fa-keyboard-o pr10'></i><strong>" + rsp.message + "</strong>"
                    });
                } else if (rsp.data == 1) {
                    var taskDetail = {
                        type: 'accurate',
                        entityId: searchKeyword,
                        entityType: searchCategory
                    };
                    var categoryName = $('.category[value=' + searchCategory + ']').find('p')[0].innerText;
                    $.getJSON('/renlifang/personcore/submitpersoncoretask', {
                        name: '精确(' + categoryName + ':' + searchKeyword + '),ID:',
                        taskDetail: taskDetail,
                        dirId: SaveDirId
                    }).done(function(rsp){
                        var _taskid;
                        if(rsp.code==0){
                            _taskid = rsp.data;
                        }
                        var hrefString = UrlUtil.getProfileUrl(searchKeyword, searchCategory);
                        if(_taskid){
                            hrefString+=('&taskid='+BASE64.encoder(_taskid+''))
                        }
                        window.location.href = hrefString;
                        
                    });
                    
                }
            });
        }
    }

    function chooseDirCallback(selectedNode, isSubmit, submitFunc, submitPara) {
        SaveDirId = selectedNode.key;
        $('#savepath').text(selectedNode.title);
        if (selectedNode.data.path) {
            $('#savepath').attr('title', selectedNode.data.path);
        } else {
            $.getJSON('/workspacedir/getdir', {
                dirId: selectedNode.key
            }).done(function(rsp) {
                if (rsp.data) {
                    $('#savepath').attr('title', rsp.data.path);
                }
            })
        }
        Dialog.dismiss();
        $.post('/workspacedir/recordpreference', {
            name: 'PersonCoreSavePath',
            detail: SaveDirId
        }).done(function(rsp) {
            if (rsp.code != 0) {
                console.log('failed to record preference');
            }
        })
        if (isSubmit == true) {
            submitFunc(submitPara);
        }
    }

    // 获取查询关键字 通过 URL 传到结果页面
    $("#search-form").on('submit', function(event) {
        // 获取查询关键字
        searchKeyword = $("#keyword").val().trim();
        searchType = $("#precisemode").is(':checked') ? 1 : 2;
        event.preventDefault(); //暂时取消模糊查询
        if (_.isEmpty(searchKeyword)) {
            Alert.show({
                container: $("#alert-container"),
                alertid: "alert-keyword-empty",
                alertclass: "alert-warning",
                content: "<i class='fa fa-keyboard-o pr10'></i><strong> 请输入查询关键字！ </strong>"
            });
            return;
        }

        if (searchType == 1 && searchCategory == 0) {
            Alert.show({
                container: $("#alert-container"),
                alertid: "alert-keyword-empty",
                alertclass: "alert-warning",
                content: "<i class='fa fa-keyboard-o pr10'></i><strong> 请选择类别！ </strong>"
            });
            return;
        }

        if (_.isEmpty(SaveDirId)) {
            buildDirDialog(true, submitPersonCore);
        } else {
            submitPersonCore();
        }


    });

    var searchType = 1;
    var searchCategory = 0;
    var categoryStabled = false; // 手动选择了一个类别，不要让自动匹配再生效
    var previconClass = "fa fa-search";

    var certPattern = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/;
    var mobilePattern = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    var mailPattern = /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i;
    var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

    $("#keyword").on("input", function() {
        // 没有手动选择类别才进行正则匹配
        if (!categoryStabled) {
            var searchinput = $('#keyword').val();
            if (certPattern.test(searchinput)) {
                selectItem($("#category-user"));
            } else if (mobilePattern.test(searchinput)) {
                selectItem($("#category-mobile"));
            } else if (mailPattern.test(searchinput)) {
                selectItem($("#category-mail"));
            } else if (ipPattern.test(searchinput)) {
                selectItem($("#category-ip"));
            } else {
                unselecteItem($(".category.checked"));
            }
        }
    })


    $(".category").click(function() {
        previconClass = $('#search-icon').attr('class');

        if (!$(this).hasClass('checked')) {
            selectItem($(this));
            categoryStabled = true;
        } else if ($(this).hasClass('checked')) {
            unselecteItem($(this));
            categoryStabled = false;
        }
    })

    $("#precise").change(function() {
        setSearchMode();
    })

    function setSearchMode() {
        if ($("#precisemode").is(':checked')) {
            $("#search-category").show();
            $('#search-icon').addClass(previconClass);
            $('#fuzzy-hint').hide();
            var categoryIcons = $('.category-icon');
            for (var i = 0, len = categoryIcons.length; i < len; i++) {
                var item = $(categoryIcons[i]);
                if (item.children('span').hasClass(previconClass)) {
                    $('#keyword').attr('placeholder', item.next().children().text());
                    $("#search-icon").css('color', item.css('background'));
                    break;
                }
            }

        } else {
            $("#search-category").hide();
            $('#fuzzy-hint').show();
            $('#search-icon').removeClass(previconClass);
            $('#search-icon').addClass('fa fa-search');
            $("#search-icon").css('color', '#4ea5e0');
            $('#keyword').attr('placeholder', "关键词");
        }
    }

    // 选择
    function selectItem(item) {
        $(item).addClass('checked');
        $(item).siblings().removeClass('checked');

        $('#search-icon').removeClass(previconClass);
        previconClass = $(item).find('.category-icon span').attr('class');
        $('#search-icon').addClass(previconClass);
        $('#search-icon').css('color', $(item).find(".category-icon").css("background-color"));
        $('#keyword').attr('placeholder', $(item).find('.category-text p').text());

        searchCategory = $(item).attr('value');
    }

    //判断模糊查询对象是否存在
    function checkFuzzyQueryEntityExist(searchKeyword) {

        //标签模糊查询接口获取任务id
        $.getJSON('/tag/tag/submitPersonSearch', {
            keyword: $("#keyword").val(),
        }).done(function(rsp) {
            if (rsp.code != 0) {
                Alert.show({
                    container: $("#alert-container"),
                    alertid: "alert-load-fail",
                    alertclass: "alert-danger",
                    content: "<i class='fa fa-coffee pr10'></i><strong> 查询请求失败 </strong>"
                });
                return;
            }
            _taskId = rsp.data.taskId;
            if (_.isEmpty(_taskId)) {
                Alert.show({
                    container: $("#alert-container"),
                    alertid: "alert-keyword-no-result",
                    alertclass: "alert-warning",
                    content: "<i class='fa fa-keyboard-o pr10'></i><strong> 没有符合条件的结果 </strong>"
                });
                return;
            } else {
                //根据任务id获取entityList
                $.getJSON('/tag/tag/getTagSearchResult', {
                    taskId: _taskId,
                    pos: 0,
                    size: 1
                }).done(function(rsp) {
                    if (rsp.code != 0) {
                        Alert.show({
                            container: $("#alert-container"),
                            alertid: "alert-load-fail",
                            alertclass: "alert-danger",
                            content: "<i class='fa fa-coffee pr10'></i><strong> 服务器出错，请稍候 </strong>"
                        });
                        return;
                    }
                    if (rsp.data.timeOut == 1) {
                        Alert.show({
                            container: $("#alert-container"),
                            alertid: "alert-keyword-no-result",
                            alertclass: "alert-warning",
                            content: "<i class='fa fa-keyboard-o pr10'></i><strong> 查询超时 </strong>"
                        });
                    } else {
                        var data = rsp.data.entities;
                        if (data.length == 0) {
                            Alert.show({
                                container: $("#alert-container"),
                                alertid: "alert-keyword-no-result",
                                alertclass: "alert-warning",
                                content: "<i class='fa fa-keyboard-o pr10'></i><strong> 没有符合条件的结果 </strong>"
                            });
                        } else {
                            var taskDetail = {
                                type: 'blur',
                                entityId: searchKeyword,
                            };
                            $.getJSON('/renlifang/personcore/submitpersoncoretask', {
                                name: '模糊(' + searchKeyword +'),ID:',
                                taskDetail: taskDetail,
                                dirId: SaveDirId
                            });
                            window.location.href = "/renlifang/index.html?entityid=" + encodeURIComponent(searchKeyword) + "&taskid=" + _taskId;
                        }
                    }
                });
            }
        });
    }

    // 取消选择
    function unselecteItem(item) {
        $(item).removeClass('checked');
        $(item).siblings().removeClass('checked');

        $('#search-icon').removeClass(previconClass);
        $('#search-icon').addClass('fa fa-search');
        previconClass = "fa fa-search";
        $("#search-icon").css('color', '#4ea5e0');
        $('#keyword').attr('placeholder', "关键词");

        searchCategory = 0;
    }

    var hasFaceDB = Config['hasFaceDB'];
    if (hasFaceDB) {
      $("#sisuo-select-pic").removeClass('hide');
    }

    //四所弹出选择图片对话框
    $("#sisuo-select-pic").click(function() {
        //每次清空，防止不能多次打开同一张图片
        $("#sisuo-file-input").val("");
        //弹出文件选择对话框
        $("#sisuo-file-input").click();
    })

    function submitFaceRec(faceRecogTaskId) {
        var taskDetail = {
            type: 'photo',
            taskId: faceRecogTaskId,
        };
        $.getJSON('/renlifang/personcore/submitpersoncoretask', {
            name: '人脸识别,ID:',
            taskDetail: taskDetail,
            dirId: SaveDirId
        });
        window.open("/renlifang/index.html?faceRecogTaskId=" + faceRecogTaskId);
    }

    //四所选择图片对话框 选择后
    $("#sisuo-file-input").change(function() {
        var a = document.getElementById('sisuo-file-input');
        var file = a.files[0];

        var imgFile = new FileReader();
        if (file && file.type.match('image.*')) {
            imgFile.readAsDataURL(file);
            imgFile.onload = function() {
                var picBase64 = this.result;
                RlfPicSelect.buildPicSelectDialog(picBase64, function(faceRecogTaskId) {
                    if (faceRecogTaskId) {
                        if (_.isEmpty(SaveDirId)) {
                            buildDirDialog(true, submitFaceRec, faceRecogTaskId);
                        } else {
                            submitFaceRec(faceRecogTaskId);
                        }
                    }
                });
            }
        }
    })
});