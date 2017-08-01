initLocales(require.context('../../locales/base-frame', false, /\.js/));
require([
    'module/home/homeService',
    'menu/menu-permission',
    'nova-home-dialog',
    'nova-bootbox-dialog',
    'nova-utils',
    'tpl/leftmenu-item',
    'nova-notify',
    //'../../../config',
    'jquery',
    'nova-alert',
    "underscore",
    'utility/radialindicator/radialIndicator',
    'jquery-ui'
], function(homeService, menuPermission, Dialog, confirmDialog, Util, leftmenu_item, Notify,// Config
    ) {
    var Config  = window.__CONF__.framework; 
    hideLoader();
    var tpl_app_container = _.template($('#tpl_app_container').html().trim());
    var tpl_app_file = _.template($('#tpl_app_file').html().trim());
    var dialogtpl = _.template($('#tpl_dialogmenu').html().trim());
    var tpl_leftmenu_item = _.template(leftmenu_item);
    var app_data = [];
    var data = [];
    var favorites_data = [];
    // var menuItems = {};
    var drag_flag = false; //to distinguish click and drag,also used in hover
    var location_in_popup_flag = true;
    var sidebar_flag = false;
    var tgt = Util.getCookiekey('tgt');
    var wikiSearchIp = Config['wikiSearchIp'];
    var wikiurl = wikiSearchIp + '/ada/main.html?tgt=' + tgt;

    //当检测到返回的appIndex非法或apps不是json数组时，进入此函数，清空appgroup信息并重新下载前10应用，记录新的appgroup
    function clearAndDownload() {
        data = [];
        var sorted_app_data = [];
        sorted_app_data = _.sortBy(app_data, 'pubdate');
        sorted_app_data.reverse();
        sorted_app_data = sorted_app_data.slice(0, 10);
        var index = 0;
        var appIds = [];
        _.each(sorted_app_data, function(item) {
            appIds.push(item.id);
            var apps = [];
            if (item != undefined) {
                apps.push({
                    appId: item.id,
                    appDisp: item.title,
                    appImg: item.img,
                    appLink: item.url,
                    appOpenmode: item.openmode,
                    appIndex: 0
                });
                var groupId = 'root-' + item.id;
                data.push({
                    groupId: groupId,
                    groupName: item.title,
                    index: index++,
                    apps: apps
                });
            }
        });
        // var downloadFail = false;
        //更新应用下载次数
        homeService.updateAppDownloads(appIds).then((rsp4) => {

            //记录当前桌面已安装应用
            postAppgroupData();
        });
    }
    // function filterCallback(filter) {
    //     if (filter.length == 0) {
    //         showAll = true;
    //     }
    //     serviceinfo = filter;
    //     _.extend(localinfo, serviceinfo);

    //     _.each(menuData.menu, function(item) {

    //         if (item.type != 'label') {
    //             if (item.children != undefined) {
    //                 _.each(item.children, function(child) {
    //                     menuItems[child.index] = child;
    //                 })

    //             } else {
    //                 menuItems[item.index] = item;
    //             }
    //         }
    //     })

    //     create();
    // }

    // menuPermission.authorize(filterCallback);
    // clearPreferences();

    //获取当前用户所有授权的应用详情
    homeService.getAppsByCategory(-1).then((rsp1) => {
        app_data = rsp1;
        //获取当前用户的侧边栏偏好应用ID
        homeService.queryPreference('favorites').then((rsp2) => {
            //从详情列表中找到favorites_data记录的id对应的应用详情，使用extend方法扩展到favorites_data
            if (Array.isArray(rsp2)) {
                favorites_data = rsp2;
                favorites_data.forEach((v, i, a) => {
                    const appDetail = _.find(app_data, (val) => {
                        return val.id == v;
                    });
                    if (appDetail) {
                        a[i] = appDetail;
                    }
                });
            }
            //获取当前用户首页应用安装情况
            homeService.queryPreference('appgroup').then((rsp3) => {
                //若接口无返回，则用户没有安装应用，此处逻辑为用户添加下载排名前10的应用到首页。
                //即首页刷新时不会没有应用
                if (rsp3.length == 0) {
                    clearAndDownload();
                } else {
                    var index = 0;
                    var allIndexValid = true;
                    _.each(rsp3, function(d, i) {

                        var apps = [];
                        var allAppsValid = true;
                        var isFolder = (d.apps&&(d.apps.length>1));
                        _.each(d.apps, function(d2, j) {
                            var item = _.find(app_data, function(d3) {
                                return parseInt(d2.appId) == d3.id;
                            });
                            if (item) {
                                var app = {
                                    appId: d2.appId,
                                    appIndex: d2.appIndex,
                                    appDisp: item.title,
                                    appImg: item.img,
                                    appLink: item.url,
                                    appOpenmode: item.openmode,

                                };
                                apps.push(app);
                                if (isNaN(parseInt(d.index))) {
                                    allIndexValid = false;
                                }
                            } else {
                                allAppsValid = false;
                                // console.log('appId:' + d2.appId + " not found in app_data");
                            }
                        });
                        if (allAppsValid) {
                            var groupName;
                            if(isFolder){
                                groupName = d.groupName
                            }else{
                                groupName = apps[0].appDisp;
                            }
                            data.push({
                                groupId: d.groupId,
                                groupName: groupName,
                                index: d.index,
                                apps: apps
                            });
                        }

                    });

                    if (allIndexValid) {
                        postAppgroupData();
                    } else {
                        clearAndDownload();
                    }
                }

                sortElementByIndex();

                bindSortable();
                // bindClearBtn();
                _.each(data, function(e) {
                    showApp(e);
                    bindDroppable(e);
                    bindUninstall(e);
                });

                bindAddBtn();

                $('#app-menu .app').each(function(index, e) {
                    if (judgeElementType($(e).attr('id')) == 'FOLDER') {
                        bindFolderClick(e);
                    }
                });

                bindSidebar();

                $('.app a[id="WIKI_SEARCH"]').attr('target', 'view_window');

            });
        });
    });
    // clear database record
    function clearPreferences() {
        $.post('/workspacedir/recordPreference', {
            name: 'appgroup',
            detail: '',
        }, function(rsp) {
        });
        $.post('/workspacedir/recordPreference', {
            name: 'favorites',
            detail: '',
        }, function(rsp) {
        });
    }
    function sortElementByIndex() {
        data = _.sortBy(data, function(e) {
            return parseInt(e.index);
        });
        _.each(data, function(e) {
            e.apps = _.sortBy(e.apps, function(el) {
                return parseInt(el.index);
            });
        });
    }
    function showApp(e) {
        var container = {};
        container.id = e.groupId;
        container.count = e.apps.length;
        container.title = e.groupName;
        var containerHTML = $(tpl_app_container(container));
        $('#app-menu').append(containerHTML);
        if (e.groupId.slice(0, 5) != 'root-') {
            for (var i = 0; i < e.apps.length; i++) {
                var el = e.apps[i];
                var single_app = {};
                single_app.finish_class = "done";
                single_app.size_class = "multiple";
                single_app.img_src = el.appImg; //getImage(el.appId);
                single_app.app_link = '#';
                single_app.title = el.appDisp;
                single_app.app_open_mode = el.appOpenmode;
                var fileHTML = $(tpl_app_file(single_app));
                $('#' + e.groupId + ' .sub-menu').append(fileHTML);
                // console.log(e.groupId);
                $('#' + e.groupId).addClass('folder');
                if (i == 3) {
                    break;
                } //4 elements at most
            }
        } else {
            var el = e.apps[0];
            var single_app = {};
            single_app.finish_class = "done";
            single_app.size_class = "single";
            single_app.img_src = el.appImg; //getImage(el.appId);
            single_app.app_link = el.appLink;
            if (el.appOpenmode == 3) {
                single_app.app_link = '/home-frame.html?redirectUrl=' + el.appLink + '&pageName=' + el.appDisp
            }
            if (el.appId == '110') {
                var username = Util.getCookiekey('username');
                var areaName = Config["areaName"];
                var address = Config['faultPlatformIp'] + '?tgt=' + Util.enCodeString(decodeURIComponent(username) + areaName)+'&guid='+new Date().getTime();
                single_app.app_link = address;
            }
            if (el.appId == '104') {
                var tgt = Util.getCookiekey('tgt');
                var address = Config['wikiSearchIp'] + '/ada/main.html?tgt=' + tgt;
                single_app.app_link = address;
            }
            single_app.title = el.appDisp;
            single_app.app_open_mode = el.appOpenmode;
            var fileHTML = $(tpl_app_file(single_app));
            $('#' + e.groupId + ' .sub-menu').append(fileHTML);
        }
    }

    function bindFolderClick(e) {
        $(e).closest('li').on('click', function() {
            // console.log('in folder click');
            // console.log(e);

            if (!drag_flag) {
                var folderObject = findObjectInData($(e));
                // console.log(folderObject);
                openPopup(folderObject);
                drag_flag = false;
            }
        });
    }

    function bindAddBtn() {
        var container = {};
        container.id = 'add-btn';
        container.count = 0;
        container.title = '添加应用';
        var containerHTML = $(tpl_app_container(container));
        $('#add-btn-ul').append(containerHTML);
        var fileHTML = '<a  class="app-file" href="/appstore/index.html" ><i class="fa fa-plus"></i></a>';
        $('#add-btn .sub-menu').append(fileHTML);
        $('#add-btn .uninstall-span').remove();
    }

    //使用该版本首页需要清空原用户偏好，由于无法统一清空管理库(存在仍旧使用原前端代码的情况)，此处做兼容处理
    //添加一个按钮置空用户偏好并刷新
    function bindClearBtn() {
        var container = {};
        container.id = 'clear-btn';
        container.count = 0;
        container.title = '首次使用请点击';
        var containerHTML = $(tpl_app_container(container));
        $('#add-btn-ul').append(containerHTML);
        var fileHTML = '<a  class="app-file" href="#" ><i class="fa fa-refresh"></i></a>';
        $('#clear-btn .sub-menu').append(fileHTML);
        $('#clear-btn .uninstall-span').remove();
        $('#clear-btn').attr('data-original-title', '首次使用新框架首页请点击该按钮，清空之前的用户偏好。若之后使用过程中出现问题请联系黄经纬')
        $('#clear-btn').tooltip();
        $('#clear-btn').on('click', (event) => {
            clearPreferences();
            window.location.reload();
        })
    }
    var popupHelper;
    function openPopup(e) {
        var dialogHTML = dialogtpl();
        Dialog.build({
            title: e.groupName,
            content: dialogHTML,
            width: 500,
        }).show();

        //if hide mfp-bg before,you need to show them when opening popup the second time
        $('.mfp-bg').show();
        // $('.mfp-wrap').hide();
        $('.mfp-container').show();

        addRenameModule(e);
        $('#app-menu-popup').attr('origin-id', e.groupId);
        //$('#app-menu-popup').css('position', 'relative');
        //$('#app-menu-popup').addClass('connectedSortable');
        var appHTML = '';
        _.each(e.apps, function(el) {
            var container = {};
            container.count = 1;
            container.title = el.appDisp;
            container.id = 'inner-' + el.appId;
            container.app_open_mode = el.appOpenmode;
            var containerHTML = $(tpl_app_container(container));
            $('#app-menu-popup').append(containerHTML);
            var single_app = {};

            single_app.finish_class = "done";
            single_app.size_class = "single";
            single_app.img_src = el.appImg; //getImage(el.appId);
            single_app.app_link = el.appLink;
            if (el.appOpenmode == 3) {
                single_app.app_link = '/home-frame.html?redirectUrl=' + el.appLink + '&pageName=' + el.appDisp
            }
            if (el.appId == '110') {
                var username = Util.getCookiekey('username');
                var areaName = Config["areaName"];
                var address = Config['faultPlatformIp'] + '?tgt=' + Util.enCodeString(decodeURIComponent(username) + areaName)+'&guid='+new Date().getTime();
                single_app.app_link = address;
            }
            if (el.appId == '104') {
                var tgt = Util.getCookiekey('tgt');
                var address = Config['wikiSearchIp'] + '/ada/main.html?tgt=' + tgt;
                single_app.app_link = address;
            }

            single_app.title = el.appDisp;
            single_app.app_open_mode = el.appOpenmode;
            var fileHTML = $(tpl_app_file(single_app));
            $('#inner-' + el.appId + ' .sub-menu').append(fileHTML);
        });

        $('#app-menu-popup').sortable({
            tolerance: "intersect",
            connectWith: '#app-menu',
            scroll: false,
            zIndex: 1045,
            cursor: 'move',
            // revert: 200,
            appendTo: 'body',
            helper: 'clone',
            start: function(event, ui) {
                drag_flag = true;
                location_in_popup_flag = true;
                ui.item.addClass('in-popup-item');
                ui.helper.addClass('in-popup-item');
                ui.item.addClass('from-popup');
                ui.helper.addClass('from-popup');
                //$('#app-menu-popup').sortable('option','connectWith','#app-menu');
                // console.log(ui);
                // $(ui.helper).css('z-index', 0);
                // popupHelper = ui.helper;
                // $('.mfp-bg').hide();
                // $('.mfp-wrap').hide();
                //$.magnificPopup.close();
                //$(ui.item).css('z-index',1100)
            },
            stop: function(event, ui) {
                // console.log(location_in_popup_flag);
                if (!location_in_popup_flag) {
                    $.magnificPopup.close();
                }
                location_in_popup_flag = true;
                drag_flag = false;
                //updateMainIndex();
            },
            out: function(event, ui) {

            },
            remove: function(event, ui) {

            }
        });

        //拖出popup框检测，方法为在panel上加上droppable,使用out检测
        $('#modal-panel .panel').droppable({
            over: function() {
                location_in_popup_flag = true;
            },
            out: function(event, ui) {
                // console.log('out');
                location_in_popup_flag = false;
                ui.helper.css('z-index', 0);
                //ui.draggable.removeClass('in-popup-item');
                //$('#app-menu-popup').sortable('option','appendTo','body');
                // $('#app-menu-popup').sortable('option','connectWith','#app-menu');
                // $('#app-menu-popup').sortable('refresh');
                $('.mfp-bg').hide();
                // $('.mfp-wrap').hide();
                $('.mfp-container').hide();

            }
        });
        $('#app-menu-popup .app').each(function(e) {
            // console.log('popup each id' + $(this).attr('id'));
            var uninstallApp = {
                groupId: $(this).attr('id'),
                groupName: $(this).children('.app-title').html()
            };
            bindUninstall(uninstallApp);
        });
    }

    function bindSortable() {
        $('#app-menu').sortable({
            tolerance: "intersect",
            connectWith: ".connectedSortable",
            revert: 200,
            zIndex: 1050,
            appendTo: 'body',
            cursor: 'move',
            
            //cancel:'.in-popup-item',
            // placeholder: "green",
            //forcePlacehoderSize:true,
            // forceHelperSize:true,
            helper: 'clone',
            update: function(event, ui) {
            },
            deactivate: function(event, ui) {
            },
            start: function(event, ui) {
                drag_flag = true;
                //if drag target is not a APP,add class no-accept to avoid accept by left bar

                var id = $('.app', ui.item).attr('id');
                ui.helper.addClass('sorting');

                var srcType = judgeElementType(id);
                if (srcType != 'APP') {
                    ui.item.addClass('no-accept');
                }
            },
            stop: function(event, ui) {
                drag_flag = false;

                updateMainIndex();
                postAppgroupData();
            },
            beforeStop: function(event, ui) {
                ui.helper.removeClass('sorting');
                setTimeout(function() {
                    if (sidebar_flag) {
                        $('#app-menu').sortable('cancel');
                        sidebar_flag = false;
                    }
                }, 50);
            },
            change: function(event, ui) {

                $('.drag-in').removeClass('drag-in');
            },
            receive: function(event, ui) {
                // console.log('receive');
                // console.log(ui);
                var srcId = $('.app', ui.item).attr('id');
                var op_mode = generateOpMode(srcId, 'ONLY_SORT');
                var newId = dragDataUpdate(op_mode, srcId);
                dragDomUpdate(op_mode, event, ui, this, newId);
                updateMainIndex();
                postAppgroupData();
                $.magnificPopup.close();
                // $('.mfp-wrap').remove();
                // $('.mfp-bg').remove();
                drag_flag = false;
            }
        });
        $('#app-menu ul').disableSelection();
    }

    function bindDroppable(e) {
        $('#' + e.groupId).droppable({
            // tolerance:"intersect",
            accept: ':not(.in-popup-item,.sidebar-draggable)',
            drop: function(event, ui) {
                var dropElementData = e;
                var dragElementData = findObjectInData($('.app', ui.draggable));
                var offset = dropElementData.index > dragElementData.index ? 1 : 0; //due to the element increasement in <ul>(there will be one additional <li>(placeholder) at sort start to help sort.) 
                var dropExpectedIndex = dropElementData.index + offset;

                $('#app-menu li').each(function(index, element) {
                    if ($('.app', this)) { //not a helper element,which has no .app inside
                        if ($('.app', this).attr('id') == e.groupId) { //find drop element
                            if (dropExpectedIndex == index) {
                                //drop code

                                var appid = e.groupId;
                                var srcId = $('.app', ui.draggable).attr('id');
                                var destId = appid;
                                var op_mode;
                                op_mode = generateOpMode(srcId, destId);
                                // console.log(op_mode);
                                var newId;
                                newId = dragDataUpdate(op_mode, srcId, destId);
                                dragDomUpdate(op_mode, event, ui, this, newId);


                                updateMainIndex();
                                postAppgroupData();

                                //updateMainIndex();
                            }
                            // break;
                        }
                    }
                });

                // if (!ui.draggable.hasClass('change')) {
                //not use this judgement anymore
                // }

                $(this).removeClass('drag-in');

            },
            over: function(event, ui) {
                //if dragged element is a folder,no drop-in style
                var eType = judgeElementType($('.app', ui.draggable).attr('id'));
                if (eType != 'FOLDER') {

                    $(this).addClass('drag-in');


                }
            },
            out: function(event, ui) {
                $(this).removeClass('drag-in');
                //$('#app-menu').sortable('refreshPositions');
            },

        });
    }

    function bindUninstall(e) {
        $('#' + e.groupId + ' .uninstall-span').click(function(event) {
            // event.preventDefault();
            // event.stopPropagation();
            var message = '确认要卸载应用"' + e.groupName + '"吗?';
            var cb = function(confirm) {
                // console.log('in cb');
                if (confirm) {
                    $('#' + e.groupId).closest('li').remove();
                    // console.log(data);
                    // console.log(e.groupId.slice(0, 4));
                    if (e.groupId.slice(0, 4) == 'root') {
                        data = _.reject(data, function(d) {
                            return d.groupId == e.groupId;
                        });
                        var appId = e.groupId.slice(5, e.groupId.length);
                        $.getJSON('/appstore/delAppFromDesktop', {
                            appId: appId
                        }, function(rsp) {});

                    } else {
                        var appId = e.groupId.slice(6, e.groupId.length);
                        $.getJSON('/appstore/delAppFromDesktop', {
                            appId: appId
                        }, function(rsp) {
                            window.location.reload();
                        });
                    }
                }

            };
            confirmDialog.confirm(message, cb);
            $('.mfp-bg').show();
            $('.mfp-container').show();
            // console.log('in click:' + e.groupName);
        });


    }


    function findObjectInData(selector) {
        var id = $(selector).attr('id');
        return _.find(data, function(e) {
            return e.groupId == id;
        });
    }



    function judgeElementType(elementId) {
        if (elementId == 'ONLY_SORT') {
            return 'ONLY_SORT';
        }
        if (elementId.slice(0, 4) == 'root') {
            return 'APP';
        } else if (elementId.slice(0, 6) == 'folder') {
            return 'FOLDER';
        } else if (elementId.slice(0, 5) == 'inner') {
            return 'APP_INNER';
        } else {
            return 'UNDEFINED';
        }
    }

    function generateOpMode(srcId, destId) {
        var op_mode;
        var srcType = judgeElementType(srcId);
        var destType = judgeElementType(destId);
        if (srcType == 'APP') {
            if (destType == 'APP') {
                op_mode = 'NEW_FOLDER';
            } else if (destType == 'FOLDER') {
                op_mode = 'DRAG_INTO_FOLDER';
            } else {
                op_mode = 'UNDEFINED';
            }
        } else if (srcType == 'APP_INNER') {
            if (destType == 'APP') {
                op_mode = 'NEW_FOLDER_SRC_INNER';
            } else if (destType == 'FOLDER') {
                op_mode = 'DRAG_INTO_FOLDER_SRC_INNER';
            } else if (destType == 'ONLY_SORT') {
                op_mode = 'DRAG_OUT_OF_POPUP_ONLY_SORT';
            } else {
                op_mode = 'UNDEFINED_SRC_INNER';
            }
        } else if (srcType == 'FOLDER') {
            if (destType == 'APP') {
                op_mode = 'NEW_FOLDER_SRC_FOLDER';
            } else if (destType == 'FOLDER') {
                op_mode = 'DRAG_INTO_FOLDER_SRC_FOLDER';
            } else {
                op_mode = 'UNDEFINED_SRC_FOLDER';
            }
        }
        return op_mode;
    }

    function dragDomUpdate(op_mode, event, ui, context, newId) {
        switch (op_mode) {
            case 'DRAG_INTO_FOLDER':
                $('.img-single', ui.draggable).removeClass('img-single').addClass('img-multiple');
                var count = parseInt($('.sub-menu', context).attr('count'));
                if (count < 4) {
                    $('.app-file', ui.draggable).attr('href', '#');
                    $('.sub-menu', context).append($('.sub-menu', ui.draggable).html());
                }
                $('.sub-menu', context).attr('count', count + 1);

                $('.app', context).attr('id', newId);
                $(ui.draggable).unbind();
                $(ui.draggable).remove();

                bindFolderClick($('.app', context));

                break;

            case 'NEW_FOLDER':
                $('.img-single', ui.draggable).removeClass('img-single').addClass('img-multiple');
                $('.img-single', context).removeClass('img-single').addClass('img-multiple');
                $('.app-file', ui.draggable).attr('href', '#');
                $('.app-file', context).attr('href', '#');
                $('.sub-menu', context).append($('.sub-menu', ui.draggable).html());
                $('.app', context).attr('id', newId);
                $('.app', context).addClass('folder');
                $('.app-title', context).html('文件夹');
                var count = parseInt($('.sub-menu', context).attr('count'));
                $('.sub-menu', context).attr('count', count + 1);
                $(ui.draggable).unbind();
                $(ui.draggable).remove();

                bindFolderClick($('.app', context));
                break;

            case 'DRAG_OUT_OF_POPUP_ONLY_SORT':
                var oldId = 'inner-' + newId.slice(5, newId.length);
                $('#' + oldId).attr('id', newId);
                $('#' + newId).closest('li').removeClass('ui-sortable-handle');
                $('#' + newId).closest('li').removeClass('in-popup-item');
                $('#' + newId).closest('li').removeClass('from-popup');
                $('#' + newId).removeClass('folder');
                var newElement = _.find(data, function(e) {
                    return e.groupId == newId;
                });

                bindDroppable(newElement);
                bindUninstall(newElement);

                // updateMainIndex();



                break;
            default:
                break;
        }

    }

    function dragDataUpdate(op_mode, srcId, destId) {
        var newId;
        switch (op_mode) {
            case 'NEW_FOLDER':
                var srcObject = _.find(data, function(e) {
                    return e.groupId == srcId;
                });


                data = _.filter(data, function(e) {
                    return e.groupId != srcId;
                }); // delete srcObject from data array



                var destObject = _.find(data, function(e) {
                    return e.groupId == destId;
                });

                destObject.groupId = 'folder-' + destObject.apps[0].appId + '-' + srcObject.apps[0].appId;
                destObject.groupName = '文件夹';
                destObject.apps.push(srcObject.apps[0]);
                newId = destObject.groupId;

                break;
            case 'DRAG_INTO_FOLDER':
                var srcObject = _.find(data, function(e) {
                    return e.groupId == srcId;
                });

                data = _.filter(data, function(e) {
                    return e.groupId != srcId;
                }); // delete srcObject from data array

                var destObject = _.find(data, function(e) {
                    return e.groupId == destId;
                });

                destObject.apps.push(srcObject.apps[0]);

                var newDestId = 'folder';
                _.each(destObject.apps, function(e) {
                    newDestId += ('-' + e.appId);
                });
                destObject.groupId = newDestId;
                newId = destObject.groupId;
                break;

            case 'DRAG_OUT_OF_POPUP_ONLY_SORT':
                //here destId is undefined because no destId needed,don't use it
                var targetAppId = srcId.slice(6, srcId.length);
                var srcObj;
                var newFolderId;
                var oldFolderId;
                var newTitle;
                var apps_index;
                var srcObj_index;
                var appGroup;
                var i = 0;
                while (srcObj === undefined && i < data.length) {

                    _.each(data[i].apps, function(e, index) {
                        if (e.appId == targetAppId) {
                            srcObj = e;
                            apps_index = index;
                            appGroup = data[i].apps;
                        }
                    });
                    if (srcObj != undefined) {
                        data[i].apps.splice(apps_index, 1);
                        srcObj_index = i;
                        if (data[i].apps.length == 1) {
                            newFolderId = 'root-' + data[i].apps[0].appId;
                            data[i].groupName = data[i].apps[0].appDisp;
                            newTitle = data[i].apps[0].appDisp;

                        } else {
                            newFolderId = 'folder';
                            _.each(data[i].apps, function(e) {
                                newFolderId += '-' + e.appId;
                            });
                        }


                        oldFolderId = data[i].groupId;
                        break;

                    }
                    i++;
                }
                // console.log(oldFolderId);
                // console.log(newFolderId);
                $('#' + oldFolderId).attr('id', newFolderId);
                data[srcObj_index].groupId = newFolderId;
                var newFolder = $('#' + newFolderId);
                var count = $('.sub-menu', newFolder).attr('count');
                count--;
                $('.sub-menu', newFolder).attr('count', count);
                var fourImgSrcArray = [];
                var remove_flag = false;
                $('img', newFolder).each(function(index, e) {
                    fourImgSrcArray.push($(this).attr('src'));
                    if ($(this).attr('src') == srcObj.appImg) {
                        $(this).closest('a').remove();
                        remove_flag = true;
                        return false;
                    }
                });

                if (count >= 4 && remove_flag) {
                    for (var j = 0; j < appGroup.length; j++) {
                        if (_.find(fourImgSrcArray, function(e) {
                                return e == appGroup[j].appImg
                            }) == undefined) {
                            // console.log(appGroup[j]);
                            var insertHTML = '<a id="' + appGroup[j].appName + '" class="app-file folder done" href="#">' + '<img class="img-multiple" src="' + appGroup[j].appImg + '">' + '</a>';
                            $('.sub-menu', newFolder).append(insertHTML);
                            break;
                        }
                    }
                }

                if ($('.sub-menu', newFolder).attr('count') == '1') {
                    $('img', newFolder).removeClass('img-multiple');
                    $('img', newFolder).addClass('img-single');
                    $('.app-title', newFolder).html(newTitle);
                    var newElement = findObjectInData(newFolder);
                    $('a', newFolder).attr('href', newElement.apps[0].appLink);
                    // console.log($('#' + newElement.groupId).closest('li'));
                    $('#' + newElement.groupId).closest('li').unbind('click');
                    bindDroppable(newElement);
                    bindUninstall(newElement);
                    $('#' + newElement.groupId).removeClass('folder');
                } else {
                    bindFolderClick($('#' + newFolderId));
                }




                var newItem = {};
                newItem.apps = [];
                newItem.apps.push(srcObj);
                newItem.groupId = 'root-' + srcObj.appId;
                newItem.groupName = srcObj.appDisp;
                newItem.index = 100;
                data.push(newItem);


                newId = newItem.groupId;
                // console.log(newItem);




                break;

            default:
                break;

        }
        return newId;
    }

    function updateMainIndex() {
        var offset = 0;
        $('#app-menu .app').each(function(index, e) {
            if (!$(e).closest('li').hasClass('ui-sortable-placeholder')) {
                var updateElement = _.find(data, function(el) {
                    return el.groupId == $(e).attr('id');
                });
                updateElement.index = index - offset;
            } else {
                offset++;
            }
        });
    }

    function postAppgroupData(type) {
        type = type || '';
        var savedata = [];
        _.each(data, function(d) {
            var group = {};
            group.groupId = d.groupId;
            group.groupName = d.groupName;
            group.index = d.index;

            var apps = [];
            if (!d.apps) {
                d.apps = [];
                d.apps.push({
                    appId: d.groupId.slice(5, d.groupId.length),
                    appIndex: 0
                })
            }
            _.each(d.apps, function(app) {
                apps.push({
                    appId: app.appId,
                    appIndex: app.appIndex
                });

            })
            group.apps = apps;
            savedata.push(group);
        })

        $.post('/workspacedir/recordPreference', {
            name: 'appgroup',
            detail: savedata
        }).done(function(rsp) {
            if (type == 'rename') {
                if (JSON.parse(rsp).code == 0) {
                    Notify.show({
                        title: '重命名成功！',
                        type: "success"
                    });


                } else {
                    Notify.show({
                        title: JSON.parse(rsp).message,
                        type: "failed"
                    });
                }



                $('#nv-dialog-title span.panel-title').show();
                $('#folder-rename-input').css('display', 'none');
            }
        })
    }

    function postFavoriteData() {
        // console.log(favorites_data)
        var detail = favorites_data.length == 0 ? '' : _.pluck(favorites_data, 'id');
        $.post('/workspacedir/recordPreference', {
            name: 'favorites',
            detail: detail
        }).done(function(rsp) {
            // console.log(rsp);
        });
    }
    var out_flag = false;

    function bindSidebar() {
        $('.sidebar-left-content').droppable({
            accept: ':not(.no-accept)',
            hoverClass: 'sidebar-hover',
            drop: function(event, ui) {
                if ($('a', ui.draggable).hasClass('app-container')) {
                    var fullId = $('.app', ui.draggable).attr('id');
                    var id;
                    if (judgeElementType(fullId) == 'APP') {
                        id = parseInt(fullId.slice(5, fullId.length));
                    } else if (judgeElementType(fullId) == 'APP_INNER') {
                        Notify.show({
                            title: '暂不支持直接从文件夹中拖至快捷方式，请从桌面拖入',
                            type: "error"
                        });
                        return;

                        // id = parseInt(fullId.slice(6, fullId.length));

                    }

                    //menuItems[id];
                    var menuDataObj = _.find(app_data, (val) => {
                        return val.id == id;
                    })

                    var newFavObj = {}; // new favorites item object,transformed from menuItem

                    //deep copy
                    // for (var key in menuDataObj) {
                    //     if(typeOf(menuDataObj[key])=='object'){
                    //         newFavObj[key] = null;
                    //     }else{
                    //         newFavObj[key] = menuDataObj[key];
                    //     }

                    // }
                    for (var key in menuDataObj) {
                        newFavObj[key] = menuDataObj[key];
                    }
                    //newFavObj.icon = null;
                    newFavObj.parent = null;
                    newFavObj.children = null;
                    var existed = _.find(favorites_data, function(e) {
                        return e.id == newFavObj.id
                    });

                    if (existed == undefined) {
                        if (newFavObj.key == 'WIKI_SEARCH') {

                            newFavObj.isOutsideLink = true;
                        }
                        favorites_data.push(newFavObj);
                        // console.log('before post favorites_data');
                        // console.log(favorites_data);
                        postFavoriteData();

                        var item = newFavObj;
                        //update dom right away
                        var li = $('<li>');
                        if (item.type == 'label') {
                            li.html(item.title).addClass('sidebar-label pt20');
                        } else {
                            item.key = item.key || '';
                            item.children = item.children || null;
                            item.badge = item.badge || null;
                            item.link =  item.url || 'javascript:;';
                            item.depth = 0;
                            item.icon = item.icon || '';
                            item.favorites_icon = item.favorites_icon || '';
                            // item.isOutsideLink = item.isOutsideLink || false;
                            // item.link = 'index.html';
                            item.openmode = item.openmode || 1;
                            item.id = item.id;
                            var a = $(tpl_leftmenu_item(item));
                            li.append(a);

                        }
                        // console.log(newFavObj);
                        // console.log(li);
                        $('#left-menu-wrapper>ul').append(li);
                        var newLi = $('#favorites-' + item.title).closest('li');
                        bindSidebarDraggable(newLi);
                        $('a', newLi).tooltip({
                            container: "body"
                        });

                        sidebar_flag = true;
                    } else {
                        // out_flag = false;
                    }


                }


            },
            out: function(event, ui) {
                if (!$('a', ui.draggable).hasClass('app-container')) {
                    out_flag = true;
                }
            },
            over: function(event, ui) {
                if (!$('a', ui.draggable).hasClass('app-container')) {
                    out_flag = false;
                }
            },
            deactivate: function(event, ui) {
                if (!$('a', ui.draggable).hasClass('app-container')) {
                    if (out_flag) {
                        var id = $('a', ui.draggable).attr('id');
                        var title = id.slice(10, id.length);
                        if (title != '首页' && title != '工作区' && title != '我的应用') {
                            $('#' + id).tooltip('destroy');

                            $('#' + id).closest('li').remove();
                            var index;
                            _.each(favorites_data, function(e, i, list) {
                                if (e.title == title) {
                                    index = i;
                                }
                            });
                            if (index != undefined) {
                                favorites_data.splice(index, 1);
                                postFavoriteData();
                            }
                        }
                    }
                }

            },


        });
        setTimeout(function() {
            $('#left-menu-wrapper>ul>li').each(function() {
                bindSidebarDraggable($(this));
            });
        }, 500);

        function bindSidebarDraggable(e) {
            e.draggable({
                revert: true,
                revertDuration: 200,
                // appendTo: 'body',
                // helper: 'clone',
                start: function(event, ui) {
                    // ui.helper.addClass('no-accept');
                    ui.helper.addClass('sidebar-draggable');
                },
                stop: function(event, ui) {
                    ui.helper.removeClass('sidebar-draggable');
                },


            });
        }
    }

    function addRenameModule(e) {
        var originValue;
        var button = "<button id = 'folder-rename' class='btn btn-warning' style='padding:3px;width:27px;'><span><i class='fa fa-edit'></i><span></button>"
        var button2 = "<button id = 'folder-rename-submit' class='btn btn-success' style='padding:3px;width:27px;'><span><i class='fa fa-check'></i><span></button>"
        var button3 = "<button id = 'folder-rename-cancel' class='btn btn-danger' style='padding:3px;width:27px;'><span><i class='fa fa-times'></i><span></button>"
        var inputHTML = "<input id='folder-rename-input' style='line-height:1.5em;border:1px;padding-bottom:3px;'></input>";
        $('#nv-dialog-title').prepend(button);
        $('#nv-dialog-title').prepend(button3);
        $('#nv-dialog-title').prepend(button2);
        $('#nv-dialog-title').append(inputHTML);
        $('#folder-rename-input').css('display', 'none');
        $('#folder-rename-submit').hide();
        $('#folder-rename-cancel').hide();
        $('#folder-rename').on('click', function() {
            $('#folder-rename').hide();
            $('#folder-rename-submit').show();
            $('#folder-rename-cancel').show();

            originValue = $('#nv-dialog-title span.panel-title').html();
            $('#nv-dialog-title span.panel-title').hide();
            $('#folder-rename-input').css('display', 'inline-block');

        });
        $('#folder-rename-cancel').on('click', function() {
            $('#folder-rename').show();
            $('#folder-rename-submit').hide();
            $('#folder-rename-cancel').hide();
            $('#nv-dialog-title span.panel-title').show();
            $('#folder-rename-input').css('display', 'none');
        });
        $('#folder-rename-submit').on('click', function() {
            $('#folder-rename').show();
            $('#folder-rename-submit').hide();
            $('#folder-rename-cancel').hide();

            e.groupName = $('#folder-rename-input').val();
            postAppgroupData('rename');

            $('#nv-dialog-title span.panel-title').html(e.groupName);
            var folder = $('#' + e.groupId);
            $('.app-title', folder).html(e.groupName);

        });
    }


});