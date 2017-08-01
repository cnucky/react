initLocales(require.context('../../../locales/base-frame', false, /\.js/), 'zh');
require(['jquery',
        '../../../../config.js',
        'nova-utils',
        'q',
        'nova-dialog',
        'nova-notify',
        'udp-file-util',
        'moment',
        'widget/work-tree',
        'nova-bootbox-dialog',
        'module/workspace/workspaceFuncHelper',
        'fancytree-all',
        'utility/utility',
        'utility/contextmenu/jquery.ui-contextmenu',
        'utility/footable/footable.all.min',
        'utility/footable/footable.sort.min',
    ],
    function ($, appConfig, Util, Q, Dialog, Notify, FileUtil, moment, WorkTree, bootbox, WorkspaceHelper, localeContext) {
        var sysConfig = window.__CONF__.config_system;
        //init i18n
        var test = i18n.t('login.pagetitle');

        function resetSearchKeyWord() {
            _lastSearchKeyword = '';
        }

        //oversea
        if(sysConfig.is_oversea){
            $("#upload-file").hide();
            $("#nav_data").hide();
            $("#nav_doc").hide();
            $("#nav_bi").hide();
            $("#nav_model").hide();
            $("#search_input").hide();

        }

        function reloadFiles() {
            if (_resourceMode != 4) {
                reloadResourceTable(_resourceMode);
            } else {
                reloadMainContent(false);
                tree.reload(); //modify by zhangu --bug修复
            }
        }

        function searchByKeyword(keyword) {
            //document.getElementById("searchtable-body").innerHTML = '';
            //$('#searchtable').empty()
            if (_.isEmpty(keyword)) {
                WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
            } else {
                var data = {
                    'keyword': keyword
                };
                WorkspaceHelper.turnInSearch();
                $.getJSON('/workspacedir/searchResource', data).done(function (rsp) {
                    if (rsp.data) {
                        var searchResult = rsp.data;
                        //_.each(searchResult, function (file) {
                        //    addfile(file, 1, true);
                        //});
                        //addEventToSearchFileTable();
                        for (var i = 0; i < searchResult.length; i++) {
                            //addfile(fileList[i], 1, false);
                            addExtraData(searchResult[i]);
                        }
                        searchtable = loadTables('searchtable', rsp.data, 0);
                    }
                });
            }
        }

        //upload file click
        $("#upload-file").click(function () {
            var ipExp = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
            var ipStr = ipExp.exec(_UDPFilePath);
            var opts = {
                getDirIdCallbackFunc: function () {
                    return _currentDirId;
                },
                dirID: _currentDirId,
                dirType: _currentDirType,
                callback: reloadMainContent,
                ip: ipStr,
                UDPPath: _UDPFilePath,
                args: {
                    isReloadPath: false
                }
            };
            FileUtil.uploadFile(opts);
        });

        //搜索事件
        $("#search_input").keyup(function (event) {
            lastInputTime = event.timeStamp;
            setTimeout(function () {
                if (lastInputTime - event.timeStamp == 0) {
                    var keyword = $("#search_input").val();
                    if (_lastSearchKeyword != keyword) {
                        _lastSearchKeyword = keyword;
                        searchByKeyword(keyword);
                    }
                }
            }, 300)
        });

        /*全选框事件*/
        $("#disk-all-checker").on('click',function () {
            $("#disk-all-checker").toggleClass("checkalled");
            if (_isCheckAll) {
                if (_showMode == "list") {
                    $("#filelist .list-wrap").removeClass("ui-selected");
                } else {
                    $("#mytable tr").removeClass("checkbox-checked");
                }
            } else {
                if (_showMode == "list") {
                    $("#filelist .list-wrap[dirtype!='22']").addClass("ui-selected");
                } else {
                    $("#mytable tr").addClass("checkbox-checked");
                }
            }
            _isCheckAll = !_isCheckAll;
        });
        $("#mytable").on('click','#tb-all-checker', function(){
            $("#tb-all-checker").toggleClass("checkalled");
			if (_isCheckAll) {
                $("#mytable tr").removeClass("checkbox-checked");
            }else{
			    $("#mytable tr").addClass("checkbox-checked");
			}
            _isCheckAll = !_isCheckAll;
        });

        /*全局变量*/
        var _datacenterDir;
        $.getJSON('/workspacedir/getDatacenterDir').done(function(res){
            _datacenterDir = res;
        });
        var table;
        var searchtable;
        var _UDPFilePath = "hdfs://" + appConfig['uploadFilePath'] + "/data/udp_upload/";
        var lastInputTime = '';
        var _allContextMenu = ['delete', 'open', 'download', 'move', 'rename', 'share', 'data-manage', 'data-import', 'export', 'start', 'stop', 'reapproval','createas','restart'];

        var _dirTypeDef = {
            'ROOT': '1',
            'SYSZONE_ROOT': '2',
            'USERZONE_ROOT': '3',
            'SYSTEM_FUNC': '4',
            'SYSTEM_DATA': '5',
            'SYSTEM_MODEL': '6',
            'SYSTEM_REPORT': '7',

            'USER_WORKZONE': '21',
            'USER_SHARE': '22',
            'USER_SHARE_OWNER': '23',
            'USER_SHARE_DIR': '24'
        };

        var _dirShowBtnDef = {
            '1': ['btn_refresh'],
            '2': ['btn_refresh'],
            '3': ['btn_upload', 'btn_download', 'btn_share', 'btn_move', 'btn_rename', 'btn_mkdir', 'btn_del', 'btn_refresh', 'btn_import'],
            '4': ['btn_refresh'],
            '5': ['btn_refresh'],
            '6': ['btn_refresh'],
            '7': ['btn_refresh'],
            '21': ['btn_upload', 'btn_download', 'btn_share', 'btn_move', 'btn_rename', 'btn_mkdir', 'btn_del', 'btn_refresh', 'btn_import'],
            '22': ['btn_refresh'],
            '23': ['btn_download', 'btn_refresh'],
            '24': ['btn_download', 'btn_refresh']
        };

        var _powerDef = {
            sysDataManage: '100000:function:sysDataMgr',
            modelManage: '100000:function:modelMgr',
            reportManage: '100000:function:reportMgr'
        };

        var _permissions = [];

        var _sourceDef = {
            'SYSTEM': '1',
            'PERSONAL': '2',
            'SHARE': '3'
        };

        var _preference = {
            isShowTree: false,
            showType: "list"
        };
        var _isFirstLoad = true;
        var isCollapse = true;
        var _currentDirId = '-1';
        var _currentDirType = '1';
        var _currentDirShareFlag = '0';
        var _currentPathStr = '/' + i18n.t('home.menu-WORK_AREA');
        var _currentDn = '-1';

        var _currentPath = [];
        var _showMode = "list";
        var _isCheckAll = false;
        var _lastSearchKeyword = "";
        var _resourceMode = 4;
        var _fileTypeEnum = {
            search: "0",
            folder: "4",
            task: "1",
            data: "2",
            doc: "3",
            report: "5",
            model: "6",
            subTask: "7"
        };
        //imgMap
        var fileImgMap = {

            doc: "icon-doc",
            docx: "icon-docx",
            vsd: "icon-vsd",
            wps: "icon-wps",
            ppt: "icon-ppt",
            pptx: "icon-pptx",
            dps: "icon-dps",
            msg: "icon-msg",
            xls: "icon-xls",
            xlsx: "icon-xlsx",
            pdf: "icon-pdf",
            jpg: "icon-jpg",
            jpeg: "icon-jpeg",
            png: "icon-png",
            gif: "icon-gif",
            bmp: "icon-bmp",
            psd: "icon-psd",
            avi: "icon-avi",
            mp4: "icon-mp4",
            mkv: "icon-mkv",
            mov: "icon-mov",
            mod: "icon-mod",
            mpe: "icon-mpe",
            '3gp': "icon-3gp",
            rmvb: "icon-rmvb",
            wmv: "icon-wmv",
            wmf: "icon-wmf",
            mpg: "icon-mpg",
            mpeg: "icon-mpeg",
            rm: "icon-rm:",
            dat: "icon-dat",
            flv: "icon-flv",
            mp3: "icon-mp3",
            wma: "icon-wma",
            wav: "icon-wav",
            wave: "icon-wave",
            ipa: "icon-ipa",
            apk: "icon-apk",
            exe: "icon-exe",
            msi: "icon-msi",
            bat: "icon-bat",
            log: "icon-log",
            htm: "icon-htm",
            html: "icon-html",
            c: "icon-c",
            xml: "icon-xml",
            asp: "icon-asp",
            chm: "icon-chm",
            bak: "icon-bak",
            tmp: "icon-tmp",
            zip: "icon-zip",
            '7z': "icon-7z",
            rar: "icon-rar",
            iso: "icon-iso",
            ace: "icon-ace",
            cab: "icon-cab",
            jar: "icon-jar",
            tar: "icon-tar",
            txt: "icon-txt",
            eml: "icon-eml"
        };

        _taskTypeEnum = {
            smartquery: 101, //专项查询
            intersection: 103, //交集分析
            union: 104, //并集分析
            difference: 105, //差集分析
            modeling: 107, //建模分析
            relationship: 108, //关系图谱
            pcmanage: 440, //人立方导入
            dataImport: 201,    //数据导入
            personcore:112,    //人立方

            fenceSmartquery: 111, //围栏专项查询
            fenceIntersection: 113, //围栏交集分析
            fenceUnion: 114, //围栏并集分析
            fenceDifference: 115, //围栏差集分析

            searchall: 401,     //一键搜索
            searchsort: 402,    //分类查询
            searchtemplate: 403,//模板查询
            searchfile: 404,    //文件查询
            searchdianwei: 405,    //电围查询

            mobilearchive: 406, //手机档案

            //思维导图集合运算
            minddiagram_intersection: 421, //数据集运算
            keylist_import: 422,        //码址集导入
            
            //智能扩线任务类型
            phone_relate: 460,  //伴随分析
            obscure: 461,       //相似账号扩线-模糊
            regular: 462,       //相似账号扩线-正则
            account_correlation: 463,   //密码关联扩线
            precise_account: 464,//账号查询密码
            precise_password: 465,//密码查询账号

            //区域调研
            areaperceive: 470,
        };

        businessTypeMap = {
            401: "search_all",
            402: "search_sort",
            403: "search_template",
            404: "search_file",
            405: "search_dianwei",
            406: "mobile_archive",
            460: "mobile_expand",
            461: "account_expand",
            462: "account_expand",
            463: "account_expand",
            464: "account_query",
            465: "account_query",
            470: "area_perceive",

        };
        _taskTypeCaptionMap = {
            "101": i18n.t('home.menu-SMART_QUERY'),
            "103": i18n.t('workspace.menu-INTERSECTION_ANALYSIS'),
            "104": i18n.t('workspace.menu-UNION_ANALYSIS'),
            "105": i18n.t('workspace.menu-DIFFERENCE_ANALYSIS'),
            "111": i18n.t('home.menu-SMART_QUERY'),
            "113": i18n.t('workspace.menu-INTERSECTION_ANALYSIS'),
            "114": i18n.t('workspace.menu-UNION_ANALYSIS'),
            "115": i18n.t('workspace.menu-DIFFERENCE_ANALYSIS'),
            "107": i18n.t('home.menu-STREAM_ANALYSIS'),
            "108": i18n.t('home.menu-GRAPH_ANALYSIS'),
            "440": i18n.t('workspace.menu-PERSON_IMPORT'),
            "201": i18n.t('workspace.menu-DATA_IMPORT'),
            "112": i18n.t('home.menu-PERSON_CORE'),
            "401": i18n.t('home.menu-SEARCH_ALL'),
            "402": i18n.t('home.menu-SEARCH_SORT'),
            "403": i18n.t('home.menu-SEARCH_TEMPLATE'),
            "404": i18n.t('home.menu-SEARCH_FILE'),
            "405": i18n.t('workspace.menu-ELEC_SEARCH'),
            "406": i18n.t('workspace.menu-MOBILE_ARCHIVE'),
            "421": i18n.t('workspace.menu-MINDDIAGRAM_INTERSECTION'),
            //"422": i18n.t('workspace.menu-MINDDIAGRAM_COMBINE'),
            //"423": i18n.t('workspace.menu-MINDDIAGRAM_EXCLUSIVE'),
            "422": i18n.t('workspace.menu-KEYLIST_IMPORT'),

            "460": i18n.t('workspace.menu-LOC_ANALYSIS'),
            "461": i18n.t('workspace.menu-ACCOUT_EXPAND'),
            "462": i18n.t('workspace.menu-ACCOUT_EXPAND'),
            "463": i18n.t('workspace.menu-PASWORD_EXPAND'),
            "464": i18n.t('workspace.menu-ACCOUT_SEARCH'),
            "465": i18n.t('workspace.menu-ACCOUT_SEARCH'),
            "470": i18n.t('home.menu-AREA_PERCEIVE'),

        };

        _taskStatusCaptionMap = {
            queue: i18n.t('workspace.label-inqueue'),
            running: i18n.t('workspace.label-running'),
            finished: i18n.t('workspace.label-finish'),
            cancelling: i18n.t('workspace.label-canceling'),
            cancelled: i18n.t('workspace.label-canceled'),
            error: i18n.t('workspace.label-error'),
            null: i18n.t('workspace.label-null'),
            toexam: i18n.t('workspace.label-toexam'),
            examing: i18n.t('workspace.label-examing'),
            examfailed: i18n.t('workspace.label-examfailed'),
            examed: i18n.t('workspace.label-examed'),
            parterror: i18n.t('workspace.label-parterror')
        };

        _docStatusCaptionMap = {
            "0": i18n.t('workspace.label-uploading'),
            "1": i18n.t('workspace.label-uploadsuccess'),
            "2": i18n.t('workspace.label-uploadfailed'),
        }

        _taskIconMap = {
            "101": "icon-smartquery",
            "103": "icon-intersection",
            "104": "icon-union",
            "105": "icon-difference",
            "111": "icon-smartquery",
            "113": "icon-intersection",
            "114": "icon-union",
            "115": "icon-difference",
            "107": "icon-modeling",
            "108": "icon-relationship",
            "201": "icon-dataimport",
            "440": "icon-modeling",
            "112": "icon-personcore",
            "401": "icon-smartquery",
            "402": "icon-smartquery",
            "403": "icon-smartquery",
            "404": "icon-smartquery",
            "405": "icon-smartquery",
            
            "406": "icon-mobilearchive",

            "421": "icon-minddiagram",
            "422": "icon-minddiagram",
            //"423": "icon-intersection",
            //"424": "icon-intersection",

            "460": "icon-clueexpand",
            "461": "icon-clueexpand",
            "462": "icon-clueexpand",
            "463": "icon-clueexpand",
            "464": "icon-clueexpand",
            "465": "icon-clueexpand",

            "470": "icon-areaperceive",

        };
        //用来标注不同类   型下哪些列显示哪些列不显示

        var tableColumnMap = [
            /* 选中 展开    图标  任务类型 名称 路径 大小 数据中心  状态 进度 结果数  创建者   时间   编辑*/
               [0,   1,     1,    0,        1,   0,    1,    0,       1,  1,   1,      1,     1,      0],  //搜索
               [1,   1,     1,    1,        1,   0,    0,    0,       1,  1,   1,      1,     1,      0],  //任务
               [0,   0,     1,    0,        1,   1,    0,    0,       0,  0,   0,      1,     1,      0],  //数据
               [0,   0,     1,    0,        1,   1,    1,    0,       0,  0,   0,      1,     1,      0],  //文档
               [1,   1,     1,    0,        1,   0,    1,    0,       1,  1,   1,      1,     1,      0],  //目录
               [0,   0,     1,    0,        1,   1,    0,    0,       0,  0,   0,      1,     1,      0],  //报告 0
               [0,   0,     1,    0,        1,   1,    0,    0,       0,  0,   0,      1,     1,      0],  //模型
            //[0,  0,  0,   0,   0,   0,  0,       0,     0,     0,    0 ]   //子任务
        ];
        /*end全局变量*/

        $.getJSON('/workspacedir/checkPermissions', {
            permissions: _.values(_powerDef)
        }).done(function (rsp) {
            if (rsp.data) {
                _permissions = rsp.data;
                if (_.contains(_permissions, _powerDef.sysDataManage)) {
                    _dirShowBtnDef[_dirTypeDef.SYSTEM_DATA] = ['btn_move', 'btn_mkdir', 'btn_refresh'];
                }
                if (_.contains(_permissions, _powerDef.modelManage)) {
                    _dirShowBtnDef[_dirTypeDef.SYSTEM_MODEL] = ['btn_move', 'btn_rename', 'btn_mkdir', 'btn_del', 'btn_refresh'];
                }
                if (_.contains(_permissions, _powerDef.reportManage)) {
                    _dirShowBtnDef[_dirTypeDef.SYSTEM_REPORT] = ['btn_move', 'btn_mkdir', 'btn_del', 'btn_refresh'];
                }
            }
        })
        /*初始化页面*/
        $.getJSON('/workspacedir/queryPreference', {
            name: 'workarea'
        }).done(function (rsp) {
            if (rsp.data) {
                var preference = rsp.data;
                if (preference.isShowTree == "true") {
                    _preference.isShowTree = true;
                    WorkspaceHelper.showdir();
                    $("#btn_show_hide_dir").addClass("dbview-focus");
                    $("#btn_show_hide_dir").attr("title", i18n.t('workspace.label-hidedirtree'));
                    isCollapse = false;
                }
                if (preference.showType == "table") {
                    _preference.showType = "table";
                    $("#main-filelist").hide();
                    $("#filetable").show();
                    $("#btn_show_mode_switch").addClass("dbview-focus");
                    _showMode = "table";
                }
            }
            WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
            _currentPath = [];
            _currentPath.push({
                id: -1,
                name: i18n.t('home.menu-WORK_AREA'),
                type: 1,
                shareFlag: 0
            });
            reloadMainContent(true);
        })

        $('.footable').footable({
            pageSize: 1000
        });

        /*隐藏显示目录树*/
        $("#btn_show_hide_dir").click(function () {
            if (isCollapse) {
                WorkspaceHelper.showdir();
                $("#btn_show_hide_dir").toggleClass("dbview-focus");
                isCollapse = !isCollapse;
                $("#btn_show_hide_dir").attr("title", i18n.t('workspace.label-hidedirtree'));
                _preference.isShowTree = true;
                $.post('/workspacedir/recordPreference', {
                    name: 'workarea',
                    detail: _preference
                });
            } else {
                WorkspaceHelper.hidedir();
                $("#btn_show_hide_dir").toggleClass("dbview-focus");
                isCollapse = !isCollapse;
                $("#btn_show_hide_dir").attr("title", i18n.t('workspace.label-showdirtree'));
                _preference.isShowTree = false;
                $.post('/workspacedir/recordPreference', {
                    name: 'workarea',
                    detail: _preference
                });
            }
        });

        /*显示方式*/
        $("#btn_show_mode_switch").click(function () {
            if (_showMode == "list") {
                $("#main-filelist").hide();
                $("#mytable").show();
                $("#btn_show_mode_switch").toggleClass("dbview-focus");
                reloadFileTable();
                _showMode = "table";

                _preference.showType = "table";
                $.post('/workspacedir/recordPreference', {
                    name: 'workarea',
                    detail: _preference
                });
            } else {
                $("#main-filelist").show();
                $("#mytable").hide();
                $("#btn_show_mode_switch").toggleClass("dbview-focus");
                reloadFileList();
                _showMode = "list";

                _preference.showType = "list";
                $.post('/workspacedir/recordPreference', {
                    name: 'workarea',
                    detail: _preference
                });
            }
        });

        function turnInDirNav() {
            WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
            $('#mytable').empty()
            $("#ul_nav .nav-color").removeClass("nav-color");
            $("#nav_dir").addClass("nav-color");
            $("#filetable .th-path").hide();
            $("#filetable .th-check").show();
            $("#filetable .th-custom").attr("data-i18n", "workspace.label-size");
            $("#filetable .th-name").attr("style", "width:49%");
            $("#filetable .th-custom").show();
            $("#filetable .th-recordCount").show();
            _resourceMode = 4;
            if (isCollapse) {
                WorkspaceHelper.hidedir();
            } else {
                WorkspaceHelper.showdir();
            }
            if (_currentDirType == _dirTypeDef.USER_WORKZONE || _currentDirType == _dirTypeDef.USERZONE_ROOT) {
                $("#upload-file").removeAttr("disabled");
            }

            $(".g-btn-blue").hide();
            _.each(_dirShowBtnDef[_currentDirType], function(btn) {
                if(sysConfig.is_oversea){
                    if(btn != "btn_download" && btn != "btn_import"){
                        $("#" + btn).show();
                    }
                }else{
                    $("#" + btn).show();
                }

            })
            $(".view-mode-dropdown").show();
            $("#mainPathBar").show();
            if (_showMode == "list") {
                $("#filetable").hide();
                $("#main-filelist").show();
                reloadFileList();
            } else {
                reloadFileTable();
            }
        }

        /*最左侧目录导航栏click事件 */
        $("#nav_dir").click(function () {
            turnInDirNav();
            $(".nav-color").removeClass("nav-color");
            $("#nav_dir").addClass("nav-color");
        });

        //左侧导航栏任务click事件
        $("#nav_task").click(function () {
            WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
            $(".nav-color").removeClass("nav-color");
            $("#nav_task").addClass("nav-color");
            $("#filetable .th-path").show();
            $("#filetable .th-check").hide();
            $("#filetable .th-custom").text(i18n.t('workspace.label-progress'));
            $("#filetable .th-name").attr("style", "width:20%");
            $("#filetable .th-path").attr("style", "width:29%");
            $("#filetable .th-custom").show();
            $("#filetable .th-recordCount").show();
            _resourceMode = 1;
            WorkspaceHelper.hidedir();
            $("#upload-file").attr("disabled", "disabled");
            $(".g-btn-blue").hide();
            $(".show-in-task").show();
            $(".view-mode-dropdown").hide();
            $("#mainPathBar").hide();
            $("#ul_nav .active").removeClass("active");
            $("#nav_task").addClass("active");
            $("#main-filelist").hide();
            $("#filetable").show();
            reloadResourceTable(1);
        });
        //左侧导航栏数据click事件
        $("#nav_data").click(function () {
            WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
            $(".nav-color").removeClass("nav-color");
            $("#nav_data").addClass("nav-color");
            $("#filetable .th-custom").hide();
            $("#filetable .th-path").attr("style", "width:39%");
            $("#filetable .th-path").show();
            $("#filetable .th-check").hide();
            $("#filetable .th-name").attr("style", "width:20%");
            $("#filetable .th-recordCount").hide();
            $("#filetable .th-createor").attr("style", "width:10%");
            $("#filetable .th-time").attr("style", "width:20%");
            _resourceMode = 2;
            WorkspaceHelper.hidedir();
            $("#upload-file").attr("disabled", "disabled");
            $(".g-btn-blue").hide();
            $(".show-in-data").show();
            $(".view-mode-dropdown").hide();
            $("#mainPathBar").hide();
            $("#ul_nav .active").removeClass("active");
            $("#nav_data").addClass("active");
            $("#main-filelist").hide();
            $("#filetable").show();
            reloadResourceTable(2);
        });
        //左侧导航栏文档click事件
        $("#nav_doc").click(function () {
            WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
            $(".nav-color").removeClass("nav-color");
            $("#nav_doc").addClass("nav-color");
            $("#filetable .th-path").attr("style", "width:29%");
            $("#filetable .th-custom").show();
            $("#filetable .th-path").show();
            $("#filetable .th-check").hide();
            $("#filetable .th-custom").text(i18n.t('workspace.label-size'));
            $("#filetable .th-name").attr("style", "width:20%");
            $("#filetable .th-recordCount").hide();
            $("#filetable .th-createor").attr("style", "width:10%");
            $("#filetable .th-time").attr("style", "width:20%");
            _resourceMode = 3;
            WorkspaceHelper.hidedir();
            $("#upload-file").attr("disabled", "disabled");
            $(".g-btn-blue").hide();
            $(".show-in-doc").show();
            $(".view-mode-dropdown").hide();
            $("#mainPathBar").hide();
            $("#ul_nav .active").removeClass("active");
            $("#nav_doc").addClass("active");

            $("#main-filelist").hide();
            $("#filetable").show();
            reloadResourceTable(3);
        });


        //左侧导航栏报告click事件
        $("#nav_bi").click(function () {
            WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
            $(".nav-color").removeClass("nav-color");
            $("#nav_bi").addClass("nav-color");
            $("#filetable .th-path").show();
            $("#filetable .th-check").hide();
            $("#filetable .th-custom").hide();
            $("#filetable .th-path").attr("style", "width:39%");
            $("#filetable .th-name").attr("style", "width:20%");
            $("#filetable .th-recordCount").hide();
            $("#filetable .th-createor").attr("style", "width:10%");
            $("#filetable .th-time").attr("style", "width:20%");
            _resourceMode = 5;
            WorkspaceHelper.hidedir();
            $("#upload-file").attr("disabled", "disabled");
            $(".g-btn-blue").hide();
            $(".show-in-doc").show();
            $(".view-mode-dropdown").hide();
            $("#mainPathBar").hide();
            $("#ul_nav .active").removeClass("active");
            $("#nav_bi").addClass("active");

            $("#main-filelist").hide();
            $("#filetable").show();
            reloadResourceTable(5);
        });

        //左侧导航栏模型click事件
        $("#nav_model").click(function () {
            WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
            $(".nav-color").removeClass("nav-color");
            $("#nav_model").addClass("nav-color");
            $("#filetable .th-path").show();
            $("#filetable .th-check").hide();
            $("#filetable .th-custom").hide();
            $("#filetable .th-path").attr("style", "width:39%");
            $("#filetable .th-name").attr("style", "width:20%");
            $("#filetable .th-recordCount").hide();
            $("#filetable .th-createor").attr("style", "width:10%");
            $("#filetable .th-time").attr("style", "width:20%");
            _resourceMode = 6;
            WorkspaceHelper.hidedir();
            $("#upload-file").attr("disabled", "disabled");
            $(".g-btn-blue").hide();
            $(".show-in-doc").show();
            $(".view-mode-dropdown").hide();
            $("#mainPathBar").hide();
            $("#ul_nav .active").removeClass("active");
            $("#nav_model").addClass("active");

            $("#main-filelist").hide();
            $("#filetable").show();
            reloadResourceTable(6);
        });


        //左侧导航栏报告click事件
        $("#nav_guidemap").click(function () {
            WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
            $(".nav-color").removeClass("nav-color");
            $("#nav_guidemap").addClass("nav-color");
            $("#filetable .th-path").show();
            $("#filetable .th-check").hide();
            $("#filetable .th-custom").text(i18n.t('workspace.label-size'));
            $("#filetable .th-name").attr("style", "width:20%");
            _resourceMode = 5;
            WorkspaceHelper.hidedir();
            $("#upload-file").attr("disabled", "disabled");
            $(".g-btn-blue").hide();
            $(".show-in-doc").show();
            $(".view-mode-dropdown").hide();
            $("#mainPathBar").hide();
            $("#ul_nav .active").removeClass("active");
            $("#nav_guidemap").addClass("active");

            $("#main-filelist").hide();
            $("#filetable").show();

        });

        //添加文件,flag==0:list;flag==1:table
        function addfile(file, flag, isInSearch) {
            var obj = WorkspaceHelper.getTitleContent(file.type, file, _fileTypeEnum, _taskIconMap, _taskTypeCaptionMap, fileImgMap, _taskTypeEnum);
            if (isInSearch) {
                addsearchfile_in_table(file, obj.title_content, obj.icon_flag);
            } else {
                if (flag == 0) {
                    addfile_in_list(file, obj.title_content, obj.icon_flag);
                } else {
                    addfile_in_table(file, obj.title_content, obj.icon_flag);
                }
            }
        }

        function addfile_in_list(file, title_content, icon_flag) {
            var content = document.getElementById("filelist");
            var child = document.createElement("div");
            child.className = "list-wrap hasmenu";
            child = WorkspaceHelper.setFileAttributes(child, file, title_content, _fileTypeEnum);
            child.innerHTML = WorkspaceHelper.getInnerHtml(file, _fileTypeEnum, icon_flag);
            content.appendChild(child);
        }

        function getColumnsByType(resourceMode) {

            var commonColumns = [
                {
                    //选中框
                    title: resourceMode == _fileTypeEnum.folder ? '':'<label id="tb-all-checker" class="checkall mn"></label>',//'',//'<label id="disk-all-checker" class="checkbox-in-table" style="margin-bottom: -8px;margin-top: -4px;margin-left: 4px;width: 20px;"></label>',
                    orderable: false,
                    data: null,
                    width: '0.5%',
                    render: function (data, type, row, meta) {
                        return data.name == i18n.t("workspace.tablerow-sharedir")? '':'<label class="checkbox-in-table" style="margin-bottom:-3px;width:20px"></label>';
                    }
                },
                {   //展开
                    //"className":      'details-control',
                    "orderable": false,
                    "data": null,
                    "defaultContent": '',
                    width: '0.5%',
                    render: function (data, type, row, meta) {
                        if(row.type == _fileTypeEnum.task && !_.isUndefined(row.subTaskInfoList) && row.subTaskInfoList.length > 0){
                            return '<span class = "details-control" style="padding:9px"></span>';
                        }else{
                            return '';
                        }
                        //return row.type == _fileTypeEnum.task ? '<span class = "details-control" style="padding:9px"></span>' : "";
                    }
                },
                {   //图标
                    data: "extra",
                    render: function (data, diplay, row, meta) {
                        //if(type == _fileTypeEnum['task']||type == _fileTypeEnum['search']){
                        //    return get_icon_png(data)+'<span style="padding-left:15px">'+_taskTypeCaptionMap[row.subType]+"</span>";
                        //}else{
                            return get_icon_png(data);
                        //}
                    },
                    //title: "#",
                    orderable: false,
                    //width: type == _fileTypeEnum['task']||type == _fileTypeEnum['search'] ? '8%':'0.5%'
                    width:'0.5%'
                },
                {   //任务类型
                    data: "subType",
                    title: i18n.t('workspace.tabletitle-tasktype'),
                    width: '6%',
                    render: function (data, type, row, meta) {
                        return row.type == _fileTypeEnum['task']? (_.isUndefined(_taskTypeCaptionMap[data])?i18n.t("workspace.label-unknown"):_taskTypeCaptionMap[data]) : '';
                    }
                },
                {   //名称
                    data: "name",
                    title: i18n.t('workspace.tabletitle-name'),
                    width: '15%',
                    render: function (data, type, row, meta) {
                         // return '<div title="' + row.extra.title_content + '">' + data + '</div>';
                         return data;
                    }
                },
                {   //路径
                    data: "path",
                    title: i18n.t('workspace.tabletitle-path'),
                    width: '20%',

                },
                {
                    //大小
                    data: "resourceSize",
                    orderable: true,
                    title: i18n.t('workspace.tabletitle-size'),
                    width: '5%',
                    render: function (data, type, row, meta) {
                        return row.type == _fileTypeEnum.doc ? data : "";
                    }
                },
                {
                    //主任务的数据中心
                    title: i18n.t('workspace.tabletitle-datacenter'),
                    width: "15%",
                    //orderable: false,
                    data: "dataCenter",
                    render: function (data, type, row, meta) {
                        if (_.isUndefined(data)){
                            return '';
                        }
                        var centers = data.trim().split(',');
                        for(var i = 0; i < centers.length; i++){
                            var translated_name = _datacenterDir['datacenter'][centers[i]];
                            centers[i] = _.isUndefined(translated_name) ? centers[i] : translated_name;
                        }
                        return centers;
                    }
                },

                {   //状态
                    data: "status",//"finishRatio",
                    //orderable: false,
                    title: i18n.t('workspace.tabletitle-status'),
                    width: '5%',
                    render: function (data, type, row, meta) {
                        if (data == 'toexam') {
                            return '<div subtaskId="' + row.subtaskId + '">' + _taskStatusCaptionMap[data] + '</div>';
                        }else {
                            return row.type == _fileTypeEnum.task && !isNull(data) ? _taskStatusCaptionMap[data] : "";
                        }
                    }
                },
                {
                    data:"finishRatio",
                    title: i18n.t('workspace.tabletitle-progress'),
                    width: '5%',
                    render: function (data, type, row, meta) {
                        return row.type == _fileTypeEnum['task']? '<div class="progress" style="margin-bottom:0px;"><div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="'
                        + data + '" aria-valuemin="0" aria-valuemax="100" style="width: '
                        + data + '%;">' + data + '%</div></div>': '';
                    }
                },

                {   //结果数
                    data: "recordCount",
                    //orderable: false,
                    title: i18n.t('workspace.tabletitle-results'),
                    width: '5%',
                    render: function (data, type, row, meta) {
                        return row.type == _fileTypeEnum.task ? data : "";
                    }
                },

                {   //创建者
                    data: "creator",
                    title: i18n.t('workspace.tabletitle-creator'),
                    width: '5%'
                },
                {   //创建时间
                    data: "createTime",
                    title: i18n.t('workspace.tabletitle-createtime'),
                    width: '10%'
                },
                {
                    //悬浮按钮
                    width:'3%',
                    orderable:false,
                    render:function(data, type, row, meta){
                        var buttons = '';
                        if(resourceMode != _fileTypeEnum['folder']){
                            buttons += '<span class="glyphicon glyphicon-folder-open editICO" title="' +
                            i18n.t('workspace.label-opendir')+'" style="display:none"></span><span style="margin: 0 18%"></span>';
                        }
                        if(row.type == _fileTypeEnum['task']){
                            buttons += '<span class="glyphicon glyphicon-edit editICO" title="' +
                            i18n.t('workspace.btn-rename')+'" style="display:none"></span>';
                        }
                        return '<div><nobr>'+ buttons +'</nobr></div>';
                    }
                }

            ];
            //var taskColumns = [
            //    {
            //        //选中框
            //        title: "",
            //        orderable: false,
            //        data: null,
            //        width: '0.5%',
            //        render: function (data, type, row, meta) {
            //            return '<label class="checkbox-in-table" style="margin-bottom:-3px;width:20px"></label>'
            //        }
            //    },
            //
            //    {   //图标
            //        data: "extra",
            //        render: function (data, type, row, meta) {
            //            return get_icon_png(data);
            //        },
            //        title: "#",
            //        orderable: false,
            //        width: '0.5%'
            //    },
            //    {   //展开
            //        //"className":      'details-control',
            //        "orderable": false,
            //        "data": null,
            //        "defaultContent": '',
            //        width: '0.5%',
            //        render: function (data, type, row, meta) {
            //            return '<span class = "details-control" style="padding:9px"></span>';
            //        }
            //    },
            //
            //    {   //名称
            //        data: "taskName",
            //        title: "名称",
            //        width: '15%',
            //        render: function (data, type, row, meta) {
            //            return '<div title="' + row.extra.title_content + '">' + data + '</div>';
            //        }
            //    },
            //    /*{   //路径
            //     data:             "path",
            //     title:            "路径",
            //     width:            '20%',
            //     },*/
            //    {
            //        //主任务的数据中心
            //        title: "数据中心",
            //        width: "15%",
            //        orderable: false,
            //        data: "datacenter",
            //        render: function (data, type, row, meta) {
            //            return data === undefined ? "" : data;
            //        }
            //    },
            //
            //    {   //状态
            //        data: "taskStatus",
            //        orderable: false,
            //        title: "状态",
            //        width: '8%',
            //        render: function (data, type, row, meta) {
            //            return _taskStatusCaptionMap[data] || "";
            //        }
            //    },
            //
            //    {   //结果数
            //        data: "resultCount",
            //        orderable: false,
            //        title: "结果数",
            //        width: '8%',
            //        /*render:function(data, type, row, meta) {
            //         return row.type == _fileTypeEnum.task ? data : "";
            //         }*/
            //    },
            //
            //    {   //创建者
            //        data: "submitterName",
            //        title: "创建者",
            //        width: '8%',
            //        render: function (data, type, row, meta) {
            //            return data || "";
            //        }
            //    },
            //    {   //创建时间
            //        data: "submitTime",
            //        title: "创建时间",
            //        width: '10%'
            //    }
            //];
            var subtaskColumns = [
                {
                    //子任务的数据中心
                    title: i18n.t('workspace.tabletitle-datacenter'),
                    width: "15%",
                    //orderable: false,
                    data: "dataCenter",
                    render: function (data, type, row, meta) {
                        if (_.isUndefined(data)){
                            return '';
                        }
                        var centers = data.trim().split(',');
                        for(var i = 0; i < centers.length; i++){
                            var translated_name = _datacenterDir['datacenter'][centers[i]];
                            centers[i] = _.isUndefined(translated_name) ? centers[i] : translated_name;
                        }
                        return centers;
                    }
                },
                //子任务侦控系统
                {
                    title: i18n.t('workspace.tabletitle-investigationsys'),
                    width: "30%",
                    //orderable: false,
                    data: "dataSystem",
                    render: function (data, type, row, meta) {
                        if (_.isUndefined(data)){
                            return '';
                        }
                        var centers = data.trim().split(',');
                        for(var i = 0; i < centers.length; i++){
                            var translated_name = _datacenterDir['datasystem'][centers[i]];
                            centers[i] = _.isUndefined(translated_name) ? centers[i] : translated_name;
                        }
                        return centers;
                    }
                },
                {   //子任务状态
                    data: "subtaskStatus",
                    //orderable: false,
                    title: i18n.t('workspace.tabletitle-status'),
                    width: '15%',
                    render: function (data, type, row, meta) {
                        if(!isNull(data)) {
                             //if (data == 'error') {
                             //    return '<div href="#" title="' + row.errorMessage + '" subtaskId="' + row.subTaskId + '">' + _taskStatusCaptionMap[data] + '</div>';
                             //} else if (data == 'examing') {
                             //    return '<a href="#" subtaskId="' + row.subTaskId + '">' + _taskStatusCaptionMap[data] + '</a>';
                             //} else {
                                return _taskStatusCaptionMap[data];
                             //}
                        }else{
                            return "";
                        }
                    }

                },
                {   //子任务结果数
                    data: "resultCount",
                    //orderable: false,
                    title: i18n.t('workspace.tabletitle-results'),
                    width: '15%',
                    //render:function(data, type, row, meta) {
                    //    return row.type == _fileTypeEnum.task ? data : "";
                    //}
                },
                {
                    //结束时间
                    data: "finishTime",
                    title: i18n.t('workspace.tabletitle-finishtime'),
                    width: '15%'
                }
            ];
            var resultColumns = [];

            if (resourceMode == 7) {                     //类型为子表
                resultColumns = subtaskColumns;
            } /*else if (type == 1) {
             //类型为任务表
             resultColumns = taskColumns;
             } */else {
                for (var i = 0; i < commonColumns.length; i++) {

                    if (tableColumnMap[resourceMode][i] == 1)
                        resultColumns.push(commonColumns[i]);
                }
            }
            return resultColumns;
        }

        function createTimeDec(type) {
            if (type == _fileTypeEnum['subTask'])
                return [[0, 'asc']];
            if (type == _fileTypeEnum['folder']){
                return [[0, 'asc']];
            }
            var createTimesCol = [8, 9, 4, 5, 0, 4, 4];

            return [[createTimesCol[type], 'desc']];
        }

        function getTableLanguageSetting(){

            return {
                'processing': i18n.t('workspace.table-processing'),
                'lengthMenu': i18n.t('workspace.table-lengthMenu'),
                'sZeroRecords': i18n.t('workspace.table-sZeroRecords'),
                'info': i18n.t('workspace.table-info'),
                'search': i18n.t('workspace.table-search'),
                'paginate': {
                    'sFirst': i18n.t('workspace.table-sFirst'),
                    'previous': i18n.t('workspace.table-previous'),
                    'next': i18n.t('workspace.table-next'),
                    'sLast': i18n.t('workspace.table-sLast')
                }
            }
        }

        //function loadTaskTables(container, type){
        //
        //    $('#' + container).empty().html('<table class="table  table-hover " cellspacing="0"> </table>');
        //    $tableSelector = $('#' + container + ' table');
        //    tables = $tableSelector.DataTable({
        //        'bDestroy': true,
        //        'bAutoWidth': false,
        //        'paging': true,
        //        'info': false,
        //        'searching': false,
        //        'scrollX': false,
        //        "iDisplayLength": 15,
        //        lengthChange: true,
        //        "aLengthMenu":  [15,30,50,100],
        //        "bPaginate":true,
        //        'sAjaxDataProp':'data.taskInfos',
        //        'processing':true,
        //        'serverSide':true,
        //        'fnServerData':function(sSource,asData,fnCallback){
        //            var upData = {
        //                startIndex:asData[3].value,
        //                fetchNum:asData[4].value,
        //            };
        //            $.ajax({
        //                "url":"/workspacedir/getAlltasks",
        //                "dataType":"json",
        //                "data":upData,
        //                "success":function(rsp)
        //                {
        //                    if (rsp.code != 0) {
        //                        Notify.show({
        //                            title: rsp.message,
        //                            type: "error"
        //                        });
        //                    } else {
        //                        if (rsp.data) {
        //                            var fileList = rsp.data.taskInfos;
        //                            for (var i = 0; i < fileList.length; i++) {
        //                                addExtraData(fileList[i], 'taskIntask');
        //                            }
        //                        }
        //                    }
        //                    fnCallback(rsp);
        //                }
        //            });
        //        },
        //
        //        'sDom': '<"top">rt<"bottom"flip><"clear">',
        //        'language': getTableLanguageSetting(),
        //        createdRow: function (row, data) {
        //
        //            row.setAttribute("filetype", 1);
        //            row.setAttribute("fileid", data.taskId);
        //            row.setAttribute("shareflag", data.shareFlag);
        //            row.setAttribute("subtype", data.taskType);
        //            row.setAttribute("taskstatus", data.taskStatus);
        //            row.setAttribute("filename", data.taskName);
        //            row.setAttribute("parentid", data.dirId);
        //            row.setAttribute("parentdn", data.dirType);
        //            row.setAttribute("source", 2);
        //            row.setAttribute("class", "hasmenu");
        //            row.setAttribute("filedesc", data.operateDesc);
        //        },
        //        //"data": data,
        //        "columns": getColumnsByType(type),
        //        "order": createTimeDec(type)
        //    });
        //
        //    return tables;
        //}

        function loadSubtaskTables(container, data, type){
            data = data.subTaskInfoList;
            //data = mockData();
            $('#main-content .' + container).empty().html('<table class="table  table-hover " cellspacing="0"> </table>');
            $('#searchtable .' + container).empty().html('<table class="table  table-hover " cellspacing="0"> </table>');
            var $tableSelector = $('.' + container + ' table')
            var tables = $tableSelector.DataTable({
                'bDestroy': true,
                'bAutoWidth': false,
                'paging': false,
                'info': false,
                'searching': false,
                'scrollX': false,
                "iDisplayLength": 10,
                lengthChange: false,
                'sDom': '<"top">rt<"bottom"flip><"clear">',
                'language': getTableLanguageSetting(),
                "data": data,
                "columns": getColumnsByType(type),
                "order": createTimeDec(type)
            });

            return tables;
        }

        function loadTables(container, data, type) {
            console.log(data);
            $('#' + container).empty().html('<table class="table  table-hover " cellspacing="0"> </table>');
            var $tableSelector = $('#' + container + ' table');
            var tables = $tableSelector.DataTable({
                'bDestroy': true,
                'bAutoWidth': false,
                'paging': data.length > 10,
                'info': false,
                'searching': false,
                'scrollX': false,
                "iDisplayLength": 15,
                lengthChange: data.length >=10,
                "aLengthMenu":  [10,15,30,50,100],
                'sDom': '<"top">rt<"bottom"flip><"clear">',
                'language': getTableLanguageSetting(),
                createdRow: function (row, data) {
                    $(row).data(data);
                    row.setAttribute("filetype", data.type);
                    row.setAttribute("fileid", data.id);
                    row.setAttribute("shareflag", data.shareFlag);
                    row.setAttribute("dirtype", data.dirType);
                    row.setAttribute("subtype", data.subType);
                    row.setAttribute("finishratio", data.finishRatio);
                    row.setAttribute("filename", data.name);
                    row.setAttribute("path", data.path);
                    row.setAttribute("parentid", data.parentId);
                    row.setAttribute("parentdn", data.parentDn);
                    row.setAttribute("parentdirtype", data.parentDirType);
                    row.setAttribute("source", data.source);
                    row.setAttribute("class", "hasmenu");
                    row.setAttribute("centerCode", data.centerCode);
                    row.setAttribute("zoneId", data.zoneId);
                    row.setAttribute("filedesc", data.desc);
                    row.setAttribute("taskStatus", data.status);
                    if(!isNull(data.resultUrl)){
                    	row.setAttribute("dest", data.resultUrl);
                    }
                    if(!_.isUndefined(data.extra.title_content)){
                        row.setAttribute("title", data.extra.title_content);
                    }
                    
                    var filedetail = '';
                    if (data.type == _fileTypeEnum.doc) {
                        filedetail = data.destDocumentPath;
                    } else if (data.type == _fileTypeEnum.report) {
                        filedetail = data.reportPath;
                    }
                    row.setAttribute("filedetail", filedetail);

                },
                "data": data,
                "columns": getColumnsByType(type),
                "order": createTimeDec(type)
            });

            return tables;
        }

        function get_icon_png(data) {
            var icon_flag = data.icon_flag;
            var iconHTML = "";
            if (data.type == _fileTypeEnum.report) {
                if (data.shareFlag == 1 && data.isShareRoot == 1) {
                    iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-report.png" style="width:32px;height:32px;" ></img><div style="padding-top:0.1px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                } else if (data.shareFlag == 2 && data.isShareRoot == 1) {
                    iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-report.png" style="width:32px;height:32px;" ></img><div style="padding-top:0.1px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                } else {
                    iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-report.png" style="width:32px;height:32px;" ></img></i></a>';
                }
            } else if (data.type == _fileTypeEnum.task || data.type == _fileTypeEnum.model) {
                if (data.subType == _taskTypeEnum.modeling || data.subType == _taskTypeEnum.pcmanage) {
                    if (data.shareFlag == 1 && data.isShareRoot == 1) {
                        iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-modeling.png" style="width:32px;height:32px;" /><div style="padding-top:0.1px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                    } else if (data.shareFlag == 2 && data.isShareRoot == 1) {
                        iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-modeling.png" style="width:32px;height:32px;" /><div style="padding-top:0.1px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                    } else {
                        iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-modeling.png" style="width:32px;height:32px;"></img></i></a>';
                    }
                } else {
                    if (data.shareFlag == 1 && data.isShareRoot == 1) {
                        iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:32px;height:32px;" /><div style="padding-top:0.1px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                    } else if (data.shareFlag == 2 && data.isShareRoot == 1) {
                        iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:32px;height:32px;" /><div style="padding-top:0.1px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                    } else {
                        iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:32px;height:32px;"></img></i></a>';
                    }
                }
            } else if (data.type == _fileTypeEnum.doc) {
                if (icon_flag == "icon-eml") {
                    if (data.shareFlag == 1 && data.isShareRoot == 1) {
                        iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-eml.png" style="width:32px;height:32px;" ></img><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-46px;margin-left:12px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                    } else if (data.shareFlag == 2 && data.isShareRoot == 1) {
                        iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-eml.png" style="width:32px;height:32px;" ></img><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-46px;margin-left:12px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                    } else {
                        iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-eml.png" style="width:32px;height:32px;" ></img></i></a>';
                    }
                } else {
                    if (data.isShareRoot == 1 && data.shareFlag == 1) {
                        iconHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-15px;margin-left:10px;width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
                    } else if (data.isShareRoot == 1 && data.shareFlag == 2) {
                        iconHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-15px;margin-left:10px;width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
                    } else {
                        iconHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '"></i></a>';
                    }
                }
            } else if (data.type == _fileTypeEnum.data) {
                if (data.shareFlag == 1 && data.isShareRoot == 1) {
                    iconHTML = '<a style="width:100%;"><i><div><img src="/img/workspace/icon-data.png" style="width:32px;height:32px;" /><div style="padding-top:0.1px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                } else if (data.shareFlag == 2 && data.isShareRoot == 1) {
                    iconHTML = '<a style="width:100%;"><i><div><img src="/img/workspace/icon-data.png" style="width:32px;height:32px;" /><div style="padding-top:0.1px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
                } else {
                    iconHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-data.png" style="width:32px;height:32px;"></img></i></a>';
                }
            } else {
                if (data.isShareRoot == 1 && data.shareFlag == 1) {
                    iconHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '" style="width:33px;height:32px"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/share1.png" style="width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
                } else if (data.isShareRoot == 1 && data.shareFlag == 2) {
                    iconHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '" style="width:33px;height:32px"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/unshare1.png" style="width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
                } else {
                    iconHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '" style="width:33px;height:32px"></i></a>';
                }
            }
            return iconHTML;
        }
        //
        //function addfile_in_table(file, title_content, icon_flag) {
        //    var content = document.getElementById("filetable-body");
        //    var child = document.createElement("tr");
        //    child.setAttribute("class", "hasmenu");
        //    child = WorkspaceHelper.setFileAttributes(child, file, title_content, _fileTypeEnum);
        //
        //    var subchild0 = document.createElement("td");
        //    if (file.dirType == 22) {
        //        subchild0.innerHTML = '';
        //    } else {
        //        subchild0.innerHTML = '<label class="checkbox-in-table"></label>';
        //    }
        //    if (_resourceMode != 4) {
        //        subchild0.setAttribute("style", "display:none");
        //    }
        //    child.appendChild(subchild0);
        //
        //    var subchild1 = document.createElement("td");
        //    if (file.type == _fileTypeEnum.report) {
        //        if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //            subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-report.png" style="width:32px;height:32px;" ></img><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //            subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-report.png" style="width:32px;height:32px;" ></img><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else {
        //            subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-report.png" style="width:32px;height:32px;" ></img></i></a>';
        //        }
        //    } else if (file.type == _fileTypeEnum.task || file.type == _fileTypeEnum.model) {
        //        if (file.subType == _taskTypeEnum.modeling || file.subType == _taskTypeEnum.pcmanage) {
        //            if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //                subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-modeling.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //                subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-modeling.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else {
        //                subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-modeling.png" style="width:32px;height:32px;"></img></i></a>';
        //            }
        //        } else {
        //            if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //                subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //                subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else {
        //                subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:32px;height:32px;"></img></i></a>';
        //            }
        //        }
        //    } else if (file.type == _fileTypeEnum.doc) {
        //        if (icon_flag == "icon-eml") {
        //            if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //                subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-eml.png" style="width:32px;height:32px;" ></img><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-46px;margin-left:12px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //                subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-eml.png" style="width:32px;height:32px;" ></img><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-46px;margin-left:12px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else {
        //                subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-eml.png" style="width:32px;height:32px;" ></img></i></a>';
        //            }
        //        } else {
        //            if (file.isShareRoot == 1 && file.shareFlag == 1) {
        //                subchild1.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-15px;margin-left:10px;width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else if (file.isShareRoot == 1 && file.shareFlag == 2) {
        //                subchild1.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-15px;margin-left:10px;width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else {
        //                subchild1.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '"></i></a>';
        //            }
        //        }
        //    } else if (file.type == _fileTypeEnum.data) {
        //        if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //            subchild1.innerHTML = '<a style="width:100%;"><i><div><img src="/img/workspace/icon-data.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //            subchild1.innerHTML = '<a style="width:100%;"><i><div><img src="/img/workspace/icon-data.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else {
        //            subchild1.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-data.png" style="width:32px;height:32px;"></img></i></a>';
        //        }
        //    } else {
        //        if (file.isShareRoot == 1 && file.shareFlag == 1) {
        //            subchild1.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '" style="width:33px;"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/share1.png" style="width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else if (file.isShareRoot == 1 && file.shareFlag == 2) {
        //            subchild1.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '" style="width:33px;"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/unshare1.png" style="width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else {
        //            subchild1.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '" style="width:33px;"></i></a>';
        //        }
        //    }
        //    child.appendChild(subchild1);
        //
        //    var subchild2 = document.createElement("td");
        //    subchild2.innerHTML = '<span class="name" style="word-wrap:break-word;word-break:break-all;">' + file.name + '</span>'
        //    child.appendChild(subchild2);
        //
        //    var subchild4 = document.createElement("td");
        //    if (_resourceMode == 4) {
        //        subchild4.setAttribute("style", "display:none");
        //    }
        //    subchild4.innerHTML = '<span>' + file.path + '</span>'
        //    child.appendChild(subchild4);
        //
        //    if (file.type == 1) {
        //        var subchild3 = document.createElement("td");
        //        subchild3.innerHTML = '<div class="progress" style="margin-bottom:0px;"><div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="' + file.finishRatio + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + file.finishRatio + '%;">' + file.finishRatio + '%</div></div>';
        //        child.appendChild(subchild3);
        //    } else if (file.type == 3) {
        //        var subchild3 = document.createElement("td");
        //        subchild3.innerHTML = '<span>' + file.resourceSize + 'KB</span>'
        //        child.appendChild(subchild3);
        //    } else {
        //        var subchild3 = document.createElement("td");
        //        subchild3.innerHTML = '<span></span>'
        //        child.appendChild(subchild3);
        //        if (_resourceMode != 4 && (file.type == 2 || file.type == 5 || file.type == 6)) {
        //            subchild3.setAttribute("style", "display:none");
        //        }
        //    }
        //
        //    var subchild5 = document.createElement("td");
        //    if ((_resourceMode == 1 || _resourceMode == 4)) {
        //        if (file.type == _fileTypeEnum.task) {
        //            subchild5.innerHTML = '<span>' + file.recordCount + '</span>';
        //        } else {
        //            subchild5.innerHTML = '<span></span>';
        //        }
        //    } else {
        //        subchild5.setAttribute("style", "display:none");
        //    }
        //    child.appendChild(subchild5);
        //
        //
        //    var subchild6 = document.createElement("td");
        //    var creator = "";
        //    if (file.creator) {
        //        creator = file.creator;
        //    }
        //    subchild6.innerHTML = '<span>' + creator + '</span>'
        //    child.appendChild(subchild6);
        //
        //    var subchild7 = document.createElement("td");
        //    subchild7.setAttribute("data-value", "time" + file.createTime);
        //    subchild7.innerHTML = '<span>' + file.createTime + '</span>'
        //    child.appendChild(subchild7);
        //
        //    content.appendChild(child);
        //}
        //
        //function addsearchfile_in_table(file, title_content, icon_flag) {
        //    var content = document.getElementById("searchtable-body");
        //    var child = document.createElement("tr");
        //    child.setAttribute("class", "hasmenu");
        //    child = WorkspaceHelper.setFileAttributes(child, file, title_content, _fileTypeEnum);
        //
        //    var subchild0 = document.createElement("td");
        //    if (file.type == _fileTypeEnum.report) {
        //        if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //            subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-report.png" style="width:32px;height:32px;" ></img><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //            subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-report.png" style="width:32px;height:32px;" ></img><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else {
        //            subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-report.png" style="width:32px;height:32px;" ></img></i></a>';
        //        }
        //    } else if (file.type == _fileTypeEnum.task || file.type == _fileTypeEnum.model) {
        //        if (file.subType == _taskTypeEnum.modeling || file.subType == _taskTypeEnum.pcmanage) {
        //            if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //                subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-modeling.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //                subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-modeling.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else {
        //                subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-modeling.png" style="width:32px;height:32px;"></img></i></a>';
        //            }
        //        } else {
        //            if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //                subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //                subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else {
        //                subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:32px;height:32px;"></img></i></a>';
        //            }
        //        }
        //    } else if (file.type == _fileTypeEnum.doc) {
        //        if (icon_flag == "icon-eml") {
        //            if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //                subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-eml.png" style="width:32px;height:32px;" ></img><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-46px;margin-left:12px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //                subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-eml.png" style="width:32px;height:32px;" ></img><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-46px;margin-left:12px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else {
        //                subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-eml.png" style="width:32px;height:32px;" ></img></i></a>';
        //            }
        //        } else {
        //            if (file.isShareRoot == 1 && file.shareFlag == 1) {
        //                subchild0.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-15px;margin-left:10px;width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else if (file.isShareRoot == 1 && file.shareFlag == 2) {
        //                subchild0.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-15px;margin-left:10px;width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
        //            } else {
        //                subchild0.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '"></i></a>';
        //            }
        //        }
        //    } else if (file.type == _fileTypeEnum.data) {
        //        if (file.shareFlag == 1 && file.isShareRoot == 1) {
        //            subchild0.innerHTML = '<a style="width:100%;"><i><div><img src="/img/workspace/icon-data.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
        //            subchild0.innerHTML = '<a style="width:100%;"><i><div><img src="/img/workspace/icon-data.png" style="width:32px;height:32px;" /><div style="padding-top:2px;padding-left:19px;"><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-35px;margin-left:3px;width:14px;height:10px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else {
        //            subchild0.innerHTML = '<a style="width:100%;"><i><img src="/img/workspace/icon-data.png" style="width:32px;height:32px;"></img></i></a>';
        //        }
        //    } else {
        //        if (file.isShareRoot == 1 && file.shareFlag == 1) {
        //            subchild0.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '" style="width:33px;"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/share1.png" style="width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else if (file.isShareRoot == 1 && file.shareFlag == 2) {
        //            subchild0.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '" style="width:33px;"><div style="padding-top:13px;padding-left:10px;"><img class ="img-responsive" src="/img/workspace/unshare1.png" style="width:20px;height:12px;z-index: 0; position:relative;"></img></div></i></a>';
        //        } else {
        //            subchild0.innerHTML = '<a style="width:100%;"><i class="filetype ' + icon_flag + '" style="width:33px;"></i></a>';
        //        }
        //    }
        //    child.appendChild(subchild0);
        //
        //    var str = file.name;
        //    var reg = new RegExp("(" + _lastSearchKeyword + ")", "g");
        //    var newstr = str.replace(reg, '<span style="font-weight: bold;color: #1284F6;">$1</span>');
        //    var subchild1 = document.createElement("td");
        //    subchild1.innerHTML = '<span>' + newstr + '</span>';
        //    child.appendChild(subchild1);
        //
        //    var subchild2 = document.createElement("td");
        //    subchild2.innerHTML = '<span>' + file.path + '</span>'
        //    child.appendChild(subchild2);
        //
        //    if (file.type == 1) {
        //        var subchild3 = document.createElement("td");
        //        subchild3.innerHTML = '<div class="progress" style="margin-bottom:0px;"><div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="' + file.finishRatio + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + file.finishRatio + '%;">' + file.finishRatio + '%</div></div>';
        //        child.appendChild(subchild3);
        //    } else {
        //        var subchild3 = document.createElement("td");
        //        subchild3.innerHTML = '<span>' + file.resourceSize + 'KB</span>'
        //        child.appendChild(subchild3);
        //    }
        //
        //    var subchild4 = document.createElement("td");
        //    subchild4.innerHTML = '<span></span>';
        //    if (file.type == _fileTypeEnum.task) {
        //        subchild4.innerHTML = '<span>' + file.recordCount + '</span>';
        //    }
        //    child.appendChild(subchild4);
        //
        //    var subchild5 = document.createElement("td");
        //    subchild5.innerHTML = '<span>' + file.createTime + '</span>'
        //    child.appendChild(subchild5);
        //
        //    content.appendChild(child);
        //}

        /*初始化目录树*/
        loadTree();
        var tree = $("#directory_tree").fancytree("getTree");
        $("#directory_tree").contextmenu({
            delegate: '.fancytree-folder',
            menu: [{
                title: i18n.t('workspace.btn-mkdir'),
                cmd: 'createNewFolder',
                uiIcon: 'fa fa-folder-o'
            }],
            beforeOpen: function (event, ui) {
                console.log("1");
            },
            select: function (event, ui) {
                console.log("2");
            },
        });

        function loadTree() {
            WorkTree.build({
                container: $("#directory_tree"),
                autoScroll: true,
                clickFolderMode: 1,
                selectMode: 3
            }).config("activate", function (event, data) {
                _currentDirId = data.node.key;
                _currentDirType = data.node.data.dirType;
                _currentDirShareFlag = data.node.data.shareFlag;
                _currentPathStr = data.node.data.path;
                _currentPath = WorkspaceHelper.generateMainPath(data.node, _currentPath);
                reloadMainContent(true);
            })
            tree = $("#directory_tree").fancytree('getTree');
        }

        /*reload main_content*/
        function reloadMainContent(isReloadPath) {
            if (_currentDirType == _dirTypeDef.USER_WORKZONE || _currentDirType == _dirTypeDef.USERZONE_ROOT) {
                $("#upload-file").removeAttr("disabled");
            } else {
                $("#upload-file").attr("disabled", "disabled");
            }
            $('.g-btn-blue').hide();
            var btnIds = _dirShowBtnDef[_currentDirType];
            _.each(btnIds, function(id) {
                if(sysConfig.is_oversea){
                    if(id != "btn_download" && id != "btn_import"){
                        $("#" + id).show();
                    }
                }else{
                    $("#" + id).show();
                }
            });
            if (isReloadPath) {
                reloadMainPath();
            }
            if (_showMode == "list") {
                reloadFileList();
            } else {
                reloadFileTable();
            }
            $("#disk-all-checker").removeClass("checkalled");
            _isCheckAll = false;
        }

        function reloadMainPathFunction() {
            var mainPath = document.getElementById("main-path");
            mainPath.innerHTML = '';
            var index = _currentPath.length + 1;
            for (var i = 0; i < _currentPath.length; i++) {
                var name = _currentPath[i].name;
                if (name.length > 8) {
                    name = name.substr(0, 8) + "..";
                }
                var id = _currentPath[i].id;
                var type = _currentPath[i].type;
                var shareFlag = _currentPath[i].shareFlag;
                var path = _currentPath[i].path || "";
                var parentDn = _currentPath[i].parentDn;

                var child = document.createElement("a");
                child.setAttribute("id", id);
                child.setAttribute("type", type);
                child.setAttribute("shareflag", shareFlag);
                child.setAttribute("path", path);
                child.setAttribute("parentdn", parentDn);
                child.setAttribute("class", 'path  ui-droppable');
                child.setAttribute("style", 'z-index:' + index + ';');
                child.onclick = function () {
                    _currentDirId = $(this).attr("id");
                    _currentDirType = $(this).attr("type");
                    _currentDirShareFlag = $(this).attr("shareflag");
                    _currentPathStr = $(this).attr("path");
                    _currentDn = _currentDirId + ',' + $(this).attr("parentdn");
                    _currentPath = WorkspaceHelper.cutMainPath(_currentDirId, _currentPath);
                    reloadMainContent(true);
                    /*$.getJSON('/workspacedir/getContainingDir', {
                     parentId: _currentDirId,
                     parentDn: _currentDn,
                     parentDirType: _currentDirType
                     }).done(function(rsp) {
                     if (rsp.data) {
                     var dirs = rsp.data;
                     _currentPath = WorkspaceHelper.generatePath(dirs);
                     reloadMainContent(true);
                     }
                     })*/
                };
                index--;
                child.innerHTML = '<span>' + name + '</span>';
                mainPath.appendChild(child);
            }
        }

        /*加载路径条*/
        function reloadMainPath() {
            reloadMainPathFunction();
            var children = $("#main-path").children();
            var sum = 0;
            _.each(children, function (child) {
                sum += child.clientWidth;
            })
            var computeWidth = sum - 18 * (children.length);
            var mainPath = document.getElementById("main-path");
            mainPathWidth = mainPath.clientWidth - 30;
            if (computeWidth > mainPathWidth) {
                var distance = computeWidth - mainPathWidth;
                var tempWidth = 0;
                var index = 0;
                for (var i = 0; i < children.length; i++) {
                    tempWidth += children[i].clientWidth - 18;
                    index++;
                    if (tempWidth > distance) {
                        break;
                    }
                }
                _currentPath = _currentPath.slice(index);
                _currentPath[0].name = "...";
                reloadMainPathFunction();
            }
        }

        /*加载主文件列表*/
        function reloadFileList() {
            if (_isFirstLoad) {
                _isFirstLoad = !_isFirstLoad;
            } else {
                showLoader();
            }
            $.getJSON('/workspacedir/onelevel', {
                'dirId': _currentDirId,
                'dirType': _currentDirType,
                'shareFlag': _currentDirShareFlag,
                'path': _currentPathStr
            }).done(function (rsp) {
                document.getElementById("filelist").innerHTML = '';
                if (rsp.data) {
                    var fileList = rsp.data;
                    for (var i = 0; i < fileList.length; i++) {
                        addfile(fileList[i], 0, false);
                    }
                    addEventToFilelist();
                }
                hideLoader();
            });
        }

        /*加载文件table（详细信息）*/
        function reloadFileTable() {
            showLoader();
            //document.getElementById("filetable-body").innerHTML = '';
            $.getJSON('/workspacedir/onelevel', {
                'dirId': _currentDirId,
                'dirType': _currentDirType,
                'shareFlag': _currentDirShareFlag,
                'path': _currentPathStr
            }).done(function (rsp) {
                if (rsp.data) {
                    var fileList = rsp.data;
                    for (var i = 0; i < fileList.length; i++) {
                        //addfile(fileList[i], 1, false);
                        addExtraData(fileList[i]);
                    }
                    table = loadTables('mytable', rsp.data, 4);
                    //DetailControlFilter();
                    //addEventToFiletable();
                }
                hideLoader();
            });
        }

        //加载任务列表
        function reloadTaskTable() {
            //showLoader();
            //$.getJSON('/workspacedir/getAllTasks', {}).done(function (rsp) {
            //    console.log(rsp);
            //    if (rsp.code != 0) {
            //        Notify.show({
            //            title: rsp.data.message,
            //            type: "warning"
            //        });
            //    } else {
            //        if (rsp.data) {
            //            var fileList = rsp.data.taskInfos;
            //            for (var i = 0; i < fileList.length; i++) {
            //                addExtraData(fileList[i], 'taskIntask');
            //            }
            //            table = loadTaskTables('mytable', fileList, 1);
            //        }
            //    }
            //    hideLoader();
            //});
            showLoader();
            table = loadTaskTables('mytable', 1);
            hideLoader();
        }

        /*加载所有任务*/
        function reloadResourceTable(type) {
            showLoader();
            //if (_resourceMode == 1){
            //    table = loadTaskTables('mytable',type);
            //    hideLoader();
            //}else{
            $.getJSON('/workspacedir/getAllResource', {
                'type': type
            }).done(function (rsp) {
                if (rsp.data) {
                    var fileList = rsp.data;
                    for (var i = 0; i < fileList.length; i++) {
                        addExtraData(fileList[i], type);
                    }

                    table = loadTables('mytable', rsp.data, type);
                    //DetailControlFilter();
                    //addEventToFiletable();
                }
                $("#tb-all-checker").removeClass("checkalled");
                _isCheckAll = false;
                hideLoader();
            });
            //}
        }

        function addExtraData(data, intype) {
            var type = data.type || intype;
            var obj = WorkspaceHelper.getTitleContent(type, data, _fileTypeEnum, _taskIconMap, _taskTypeCaptionMap, fileImgMap, _taskTypeEnum);
            data.extra = {};
            if (intype == 'taskIntask') {
                data.extra.type = _fileTypeEnum['task'];
                data.extra.subType = data.taskType;
                data.extra.isShareRoot = 1;
            } else {
                data.extra.type = data.type;
                data.extra.subType = data.subType;
                data.extra.isShareRoot = data.isShareRoot;
            }
            data.extra.title_content = obj.title_content;
            data.extra.icon_flag = obj.icon_flag;
            data.extra.shareFlag = data.shareFlag;


        }

        /*为文件列表添加单击双击操作*/
        function addEventToFilelist() {
            addDoubleClickToFilelist("#filelist i");
            addDoubleClickToFilelist("#filelist img");
            $("#filelist label").click(function () {
                $(this).parent().parent().toggleClass("ui-selected");
            });
        }


        /*file double click*/
        function folderDbClick(opts) {
            _currentDirId = opts.clickId;
            _currentDirType = opts.dirType;
            _currentDirShareFlag = opts.shareFlag;
            _currentPathStr = opts.path;
            if (opts.isInSearch == true) {
                WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
                turnInDirNav(true);
                $.getJSON('/workspacedir/getContainingDir', {
                    parentId: opts.clickId,
                    parentDn: opts.clickId + "," + opts.parentDn,
                    parentDirType: opts.dirType
                }).done(function (rsp) {
                    if (rsp.data) {
                        var dirs = rsp.data;
                        var curDir = dirs[dirs.length - 1];
                        _currentPath = WorkspaceHelper.generatePath(dirs);
                        reloadMainContent(true);
                    }
                })
            } else {
                var folder = {
                    id: opts.clickId,
                    name: opts.name,
                    type: opts.dirType,
                    shareFlag: opts.shareFlag,
                    path: opts.path,
                    parentDn: opts.parentDn
                };
                _currentPath = WorkspaceHelper.addMainPath(folder, _currentPath);
                reloadMainContent(true);
            }
        }

        function modelDbClick(opts) {
            if (opts.subType == _taskTypeEnum.smartquery) {
                window.open('/smartquery/smart-query-frame.html?modelid=' + opts.clickId + '&modelname=' + opts.name);
            } else if (opts.subType == _taskTypeEnum.modeling) {
                window.open('/modelanalysis/modeling.html?modelid=' + opts.clickId);
            } else if (opts.subType == _taskTypeEnum.pcmanage) {
                window.open('/pcmanage/pcmanage-taskmanage.html?modelid=' + opts.clickId);
            } else if (opts.subType == _taskTypeEnum.dataImport) {
                window.open('/datamanage/dm-datamanage.html?oprtype=3&modelid=' + opts.clickId);
            }
        }

        function dataDbClick(opts) {
            window.open('/datamanage/dm-datamanage.html?datatypeid=' + opts.clickId +
                '&centercode=' + opts.centerCode + '&zoneid=' + opts.zoneId + '&oprtype=4');
        }

        function taskDbClick(opts, $row) {
            if (opts.subType == _taskTypeEnum.smartquery) {
                if (opts.finishRatio == "100"||opts.taskStatus == 'finished') {
                    window.open('/smartquery/smart-query-frame.html?taskid=' + opts.clickId + '&taskname=' + opts.name);
                } else {
                    Notify.show({
                        title: i18n.t('workspace.alert-cannotopen'),
                        type: "warning"
                    });
                }
            } else if (opts.subType == _taskTypeEnum.fenceSmartquery) {
                if (opts.finishRatio == "100"||opts.taskStatus == 'finished') {
                    window.open('/datafence/data-fence.html?taskid=' + opts.clickId + '&tasktype=' + opts.subType + '&&taskname=' + opts.name);
                } else {
                    Notify.show({
                        title: i18n.t('workspace.alert-cannotopen'),
                        type: "warning"
                    });
                }
            }else if (opts.subType == _taskTypeEnum.relationship) {
                window.open('/relationgraph/index.html?taskid=' + opts.clickId + '&taskname=' + opts.name);
            } else if (opts.subType == _taskTypeEnum.intersection || opts.subType == _taskTypeEnum.union || opts.subType == _taskTypeEnum.difference) {
                if (opts.finishRatio == "100"||opts.taskStatus == 'finished') {
                    window.open('/modelanalysis/collision.html?taskid='+ opts.clickId + '&tasktype=' + opts.subType + '&taskname=' + opts.name);
                } else {
                    Notify.show({
                        title: i18n.t('workspace.alert-cannotopen'),
                        type: "warning"
                    });
                }
            } else if (opts.subType == _taskTypeEnum.fenceIntersection || opts.subType == _taskTypeEnum.fenceUnion || opts.subType == _taskTypeEnum.fenceDifference) {
                if (opts.finishRatio == "100"||opts.taskStatus == 'finished') {
                    window.open('/datafence/data-fence.html?taskid=' + opts.clickId + '&tasktype=' + opts.subType + '&&taskname=' + opts.name);
                } else {
                    Notify.show({
                        title: i18n.t('workspace.alert-cannotopen'),
                        type: "warning"
                    });
                }
            } else if (opts.subType == _taskTypeEnum.modeling) {
                window.open('/modelanalysis/modeling.html?taskid=' + opts.clickId);
            } else if (opts.subType == _taskTypeEnum.searchall
                || opts.subType == _taskTypeEnum.searchsort
                || opts.subType == _taskTypeEnum.searchtemplate
                || opts.subType == _taskTypeEnum.searchfile
                || opts.subType == _taskTypeEnum.searchdianwei) {
                window.open('/dataprocess/data-process.html?taskId=' + BASE64.encoder(opts.clickId) + '&taskName=' + BASE64.encoder(opts.name));
            }
            else if (opts.subType == _taskTypeEnum.phone_relate
                || opts.subType == _taskTypeEnum.obscure
                || opts.subType == _taskTypeEnum.regular
                || opts.subType == _taskTypeEnum.account_correlation
                || opts.subType == _taskTypeEnum.precise_account
                || opts.subType == _taskTypeEnum.precise_password) {
                if (opts.finishRatio == "100"||opts.taskStatus == 'finished') {
                    window.open('/clueexpand/clue-expand.html?taskId=' + BASE64.encoder(opts.clickId));
                } else {
                    Notify.show({
                        title: i18n.t('workspace.alert-cannotopen'),
                        type: "warning"
                    });
                }
            } else if (opts.subType == _taskTypeEnum.areaperceive) {
                if (opts.finishRatio == "100"||opts.taskStatus == 'finished') {
                    window.open('/areaperceive/area-result.html?taskId=' + opts.clickId + '&taskName=' + BASE64.encoder(opts.name));
                } else {
                    Notify.show({
                        title: i18n.t('workspace.alert-cannotopen'),
                        type: "warning"
                    });
                }
            } else if (opts.subType == _taskTypeEnum.mobilearchive){
                if (opts.finishRatio == "100"||opts.taskStatus == 'finished') {
                    window.open(WorkspaceHelper.patchUrl($row.data().resultUrl, $row.data()));
                    // window.open('/mobilearchive/mobile-archive-3.html?taskId=' + opts.clickId + '&taskName=' + BASE64.encoder(opts.name));
                } else {
                    Notify.show({
                        title: i18n.t('workspace.alert-cannotopen'),
                        type: "warning"
                    });
                }
            } else if (opts.subType == _taskTypeEnum.personcore) {
                $.getJSON('/renlifang/personcore/getpersoncoreurl',{
                    taskId:opts.clickId
                }).done(function(rsp){
                    if(rsp.data){
                        window.open(rsp.data);
                    }
                })
            } else {
                if (opts.finishRatio == "0"||opts.taskStatus == 'finished') {
                    window.open(WorkspaceHelper.patchUrl($row.data().resultUrl, $row.data()));
                } else {
                    Notify.show({
                        title: i18n.t('workspace.alert-cannotopen'),
                        type: "warning"
                    });
                }
            }

        }

        function reportFileDbClick(opts) {
            $.getJSON('/workspacedir/getReportUrl', {
                type: opts.subType,
                path: opts.detail
            }).done(function (rsp) {
                if (rsp.data) {
                    var url = rsp.data;
                    if (opts.subType == "0") {
                        var tgt = Util.getCookiekey('tgt');
                        url += "&ssoAction=login&tgt=" + tgt;
                    }
                    window.open(url);
                } else {
                    Notify.show({
                        title: i18n.t('workspace.alert-getaddrfail'),
                        type: "danger"
                    });
                }
            });
        }

        function fileDoubleClick(opts, $row) {
            if (opts.type == _fileTypeEnum.folder) {
                folderDbClick(opts);
            } else if (opts.type == _fileTypeEnum.task) {
                taskDbClick(opts, $row);
            } else if (opts.type == _fileTypeEnum.model) {
                modelDbClick(opts);
            } else if (opts.type == _fileTypeEnum.report) {
                reportFileDbClick(opts);
            } else if (opts.type == _fileTypeEnum.doc) {
                var uuidName = opts.detail;
                var fileName = opts.name;
                var option = {
                    fileName: fileName,
                    uuidName: uuidName
                };
                FileUtil.openFile(option);
            } else if (opts.type == _fileTypeEnum.data) {
                dataDbClick(opts);
            }
        }

        /*为文件list添加单击双击操作*/
        function addDoubleClickToFilelist(container) {
            $(container).dblclick(function () {
                var opts = {};
                opts.clickId = $(this).parent().parent().parent().attr("fileid");
                opts.shareFlag = $(this).parent().parent().parent().attr("shareflag");
                opts.dirType = $(this).parent().parent().parent().attr("dirtype");
                opts.type = $(this).parent().parent().parent().attr("filetype");
                opts.subType = $(this).parent().parent().parent().attr("subtype");
                opts.detail = $(this).parent().parent().parent().attr("filedetail");
                opts.finishRatio = $(this).parent().parent().parent().attr("finishratio");
                opts.name = $(this).parent().parent().parent().attr("filename");
                opts.path = $(this).parent().parent().parent().attr("path");
                opts.parentDn = $(this).parent().parent().parent().attr("parentdn");
                opts.source = $(this).parent().parent().parent().attr("source");
                opts.centerCode = $(this).parent().parent().parent().attr("centerCode");
                opts.zoneId = $(this).parent().parent().parent().attr("zoneId");
                opts.isInsearch = false;
                fileDoubleClick(opts);
            });
        }

        /*为文件table添加单击双击操作*/
        function addEventToFiletable() {

            //$("#filetable-body label").click(function () {
            //    $(this).parent().parent().toggleClass("checkbox-checked");
            //});

            //$("#filetable-body tr").dblclick(function () {
            //    var opts = {};
            //    opts.clickId = $(this).attr("fileid");
            //    opts.shareFlag = $(this).attr("shareflag");
            //    opts.dirType = $(this).attr("dirtype");
            //    opts.type = $(this).attr("filetype");
            //    opts.detail = $(this).attr("filedetail");
            //    opts.subType = $(this).attr("subtype");
            //    opts.finishRatio = $(this).attr("finishratio");
            //    opts.name = $(this).attr("filename");
            //    opts.isInsearch = false;
            //    opts.path = $(this).attr("path");
            //    opts.parentDn = $(this).attr("parentdn");
            //    opts.source = $(this).attr("source");
            //    opts.centerCode = $(this).attr("centerCode");
            //    opts.zoneId = $(this).attr("zoneId");
            //
            //    fileDoubleClick(opts);
            //});

            var labelClicked = false;

            // 打开子任务的响应事件
            var $allTables = $("#mytable,#searchtable");
            $("#mytable").on('click', 'tbody span.details-control', function (e) {
                labelClicked = true;
                var tr = $(this).closest('tr');
                var row = table.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    // Open this row
                    row.child(format(row.data())).show();
                    loadSubtaskTables(row.data().id, row.data(), _fileTypeEnum['subTask']);
                    tr.addClass('shown');
                }
                setTimeout(function () {
                    labelClicked = false;
                }, 600);
            });
            $("#searchtable").on('click', 'tbody span.details-control', function (e) {
                labelClicked = true;
                var tr = $(this).closest('tr');
                var row = searchtable.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    // Open this row
                    row.child(format(row.data())).show();
                    loadSubtaskTables(row.data().id, row.data(), _fileTypeEnum['subTask']);
                    tr.addClass('shown');
                }
                setTimeout(function () {
                    labelClicked = false;
                }, 600);
            });

            $allTables.delegate("tbody label", "click", function () {
                labelClicked = true;
                $(this).parent().parent().toggleClass("checkbox-checked");
                setTimeout(function () {
                    labelClicked = false;
                }, 300);
            });

            $allTables.on("click", "tbody tr table td a", function () {
                var subtaskId = $(this).attr('subtaskId');
                var selectedIds = [];
                selectedIds.push(subtaskId);
                WorkspaceHelper.showApprovalDetail(selectedIds);
            });

            $allTables.on("mouseover", "tbody tr", function(event){
                $(this).addClass("editable");
                $('tbody .editable .editICO').show();
            });
            $allTables.on("mouseleave", "tbody tr", function(){
                $('tbody .editable .editICO').hide();
                $(this).removeClass("editable");
            });

            $allTables.on('click','tbody .editICO',function(){
                var selectItems;
                var parent = $(this).parents('.hasmenu');
                if (!parent.hasClass("checkbox-checked")) {
                    $("#mytable .checkbox-checked").removeClass("checkbox-checked");
                    parent.addClass("checkbox-checked");
                }
                selectItems = $("#mytable .checkbox-checked");
                if(this.classList.contains('glyphicon-folder-open')){
                    openContainingFolder({target:$(this)});
                }else if(this.classList.contains('glyphicon-edit')){
                    $('#btn_rename').trigger('click');
                }
            })

            $('#mytable').delegate("tr", "tbody dblclick", function () {
                if (labelClicked == true) {
                    labelClicked = false;
                    return;
                }

                var opts = {};
                opts.clickId = $(this).attr("fileid");
                opts.shareFlag = $(this).attr("shareflag");
                opts.dirType = $(this).attr("dirtype");
                opts.type = $(this).attr("filetype");
                opts.detail = $(this).attr("filedetail");
                opts.subType = $(this).attr("subtype");
                opts.finishRatio = $(this).attr("finishratio");
                opts.taskStatus = $(this).attr("taskStatus");
                opts.name = $(this).attr("filename");
                opts.isInsearch = false;
                opts.path = $(this).attr("path");
                opts.parentDn = $(this).attr("parentdn");
                opts.source = $(this).attr("source");
                opts.centerCode = $(this).attr("centerCode");
                opts.zoneId = $(this).attr("zoneId");

                fileDoubleClick(opts, $(this));
            });

            $('#searchtable').delegate("tr", "tbody dblclick", function () {
                var opts = {};
                opts.type = $(this).attr("filetype");
                opts.shareFlag = $(this).attr("shareflag");
                opts.dirType = $(this).attr("dirtype");
                opts.clickId = $(this).attr("fileid");
                opts.detail = $(this).attr("filedetail");
                opts.subType = $(this).attr("subtype");
                opts.finishRatio = $(this).attr("finishratio");
                opts.name = $(this).attr("filename");
                opts.isInSearch = true;
                opts.path = $(this).attr("path");
                opts.parentDn = $(this).attr("parentdn");
                opts.centerCode = $(this).attr("centerCode");
                opts.zoneId = $(this).attr("zoneId");

                fileDoubleClick(opts, $(this));
                event.stopPropagation();
            });

        }

        function addEventToSearchFileTable() {
            $("#searchtable-body tr").dblclick(function (event) {
                var opts = {};
                opts.type = $(this).attr("filetype");
                opts.shareFlag = $(this).attr("shareflag");
                opts.dirType = $(this).attr("dirtype");
                opts.clickId = $(this).attr("fileid");
                opts.detail = $(this).attr("filedetail");
                opts.subType = $(this).attr("subtype");
                opts.finishRatio = $(this).attr("finishratio");
                opts.name = $(this).attr("filename");
                opts.isInSearch = true;
                opts.path = $(this).attr("path");
                opts.parentDn = $(this).attr("parentdn");
                opts.centerCode = $(this).attr("centerCode");
                opts.zoneId = $(this).attr("zoneId");

                fileDoubleClick(opts, $(this));
                event.stopPropagation();
            });

        }

        function getSelectItems() {
            var selectItems = [];
            var showMode = _showMode;
            if (_resourceMode != 4) {
                showMode = "table";
            }
            if (showMode == "list") {
                selectItems = $("#filelist .ui-selected");
            } else {
                selectItems = $("#mytable tbody .checkbox-checked");
            }
            return selectItems;
        }

        function checkPermission(selectItems) {
            if (WorkspaceHelper.hasOthersSharedFiles(selectItems)) {
                Notify.show({
                    title: i18n.t("workspace.alert-notpersonalfile"),
                    type: "danger",
                });
                return false;
            } else {
                return true;
            }
        }
		//上传文件
		$('#btn_upload').on('click', function (){
		    $('#upload-file').trigger('click');
		}
		);
        //下载文件
        $("#btn_download").on("click", function (event) {
            var selectItems = getSelectItems();
            WorkspaceHelper.downloadFunction(selectItems, _fileTypeEnum);
        });

        //共享
        $("#btn_share").on("click", function (event) {
            var selectItems = getSelectItems();
            if (!checkPermission(selectItems))  return;
            WorkspaceHelper.shareFunction(selectItems, _dirTypeDef, reloadFiles);
        })

        //重命名文件
        $("#btn_rename").on("click", function (event) {
            var selectItems = getSelectItems();
            if (!checkPermission(selectItems))  return;
            WorkspaceHelper.renameFunction(selectItems, _currentDirType, reloadFiles);
        });

        //删除文件
        $("#btn_del").on("click", function (event) {
            var selectItems = getSelectItems();
            if (!checkPermission(selectItems))  return;
            WorkspaceHelper.deleteFunction(selectItems, _currentDirType, reloadFiles);
        });

        //移动文件
        $("#btn_move").on("click", function (event) {
            var selectItems = getSelectItems();
            WorkspaceHelper.moveFunction(selectItems, _currentDirType, _dirTypeDef, reloadFiles);
        });

        //新建目录
        $("#btn_mkdir").on("click", function (event) {
            WorkspaceHelper.mkdirFunction(_currentDirId, _currentDirType, reloadFiles);
        });

        //模型导入
        $("#btn_import").on("click", function (event) {
            var dirId = _currentDirId;
            if (_currentDirId == 2) {
                dirId = -10000 - Util.getCookiekey("userid");
            }
            importFunction(dirId);
        })

        //End
        //刷新
        $("#btn_refresh").on("click", function () {
            if (_resourceMode != 4) {
                reloadResourceTable(_resourceMode);
            } else {
                reloadMainContent(false);
            }
        });

        //start
        $("#btn_start").on("click", function (event) {
            var selectItems = getSelectItems();
            WorkspaceHelper.taskStartFunction(selectItems, reloadFiles);
        });

        //stop
        $("#btn_stop").on("click", function (event) {
            var selectItems = getSelectItems();
            WorkspaceHelper.taskStopFunction(selectItems, reloadFiles);
        });

        //import model
        function importFunction(currentDirId) {
            var fileChooser = $('<input type="file" accept=".mdl" multiple="true"/>');
            fileChooser.change(function (event) {
                var len = event.target.files.length;
                if (len == 0) {
                    return;
                }

                var promises = [];
                _.each(event.target.files, function (file) {
                    if (!/.*\.mdl$/.test(file.name)) {
                        Notify.simpleNotify(i18n.t('workspace.label-cannotopen') + file.name, i18n.t('workspace.label-selectmodelfile'));
                        return;
                    }

                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        try {
                            var data = event.target.result;
                            var strData = JSON.parse(data);
                            // data = JSON.parse(data);
                            // var strData = "";
                            // for (var i = 0;; i++) {
                            //     if (data["" + i]) {
                            //         strData = strData + data["" + i];
                            //     } else {
                            //         break;
                            //     }
                            // }
                            var saveModelDetail;
                            var modelTempName = file.name.substring(0, file.name.length - 4) + moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                            switch (strData.modelType) {
                                case 107:
                                    saveModelDetail = Util.makePost('/modeling/savemodel', {
                                        id: strData.modelId || 0,
                                        name: modelTempName,
                                        desc: strData.modelDesc || "",
                                        dirid: currentDirId,
                                        modelType: strData.modelType,
                                        detail: strData.modelDetail
                                    });
                                    break;
                                default:
                                    saveModelDetail = Util.makePost('/smartquery/saveModel', {
                                        modelId: strData.modelId || 0,
                                        modelName: modelTempName,
                                        modelDesc: strData.modelDesc || "",
                                        dirId: currentDirId,
                                        modelType: strData.modelType,
                                        modelDetail: strData.modelDetail
                                    });
                                    break;
                            }
                            promises.push(saveModelDetail);
                            if (promises.length == len) {
                                Q.all(promises).then(function (returnData) {
                                    reloadMainContent(false);
                                }, function (err) {
                                    console.log(err);
                                })
                            }
                        } catch (err) {
                            console.log(err);
                            Notify.simpleNotify(i18n.t('workspace.label-fileanalysisfail'), i18n.t('workspace.label-importcorrectfile'));
                        }
                    };

                    fileReader.onerror = function() {
                        Notify.simpleNotify(i18n.t('workspace.label-cannotopen'), i18n.t('workspace.label-filereadfail'));
                        return;
                    };
                    fileReader.readAsText(file);
                })


            }).click();
            if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                return;
            }
        }

        //generate context menu
        function getContextMenu(ui) {
            var selectItems = [];
            var parent = ui.target.parents('.hasmenu');
            var showMode = _showMode;
            var menu = [];
            if (_resourceMode != 4) {
                showMode = "table";
            }
            if (showMode == "list") {
                if (!parent.hasClass("ui-selected")) {
                    $("#filelist .ui-selected").removeClass("ui-selected");
                    if (parent.attr('dirType') != '22')
                        parent.addClass("ui-selected");
                }
                selectItems = $("#filelist .ui-selected");
            } else {
                if (!parent.hasClass("checkbox-checked")) {
                    //$("#filetable-body .checkbox-checked").removeClass("checkbox-checked");
                    $("#mytable .checkbox-checked").removeClass("checkbox-checked");
                    parent.addClass("checkbox-checked");
                }
                //selectItems = $("#filetable-body .checkbox-checked");
                selectItems = $("#mytable .checkbox-checked");
            }
            if (selectItems.length > 1) {
                if (_resourceMode == 4) {
                    if (_currentDirType == _dirTypeDef.USERZONE_ROOT ||
                        _currentDirType == _dirTypeDef.USER_WORKZONE) {
                        menu = ['delete', 'move'];
                    } else if (_currentDirType == _dirTypeDef.SYSTEM_DATA) {
                        if (_.contains(_permissions, _powerDef.sysDataManage)) {
                            menu = ['delete', 'move'];
                        }
                    } else if (_currentDirType == _dirTypeDef.SYSTEM_MODEL) {
                        if (_.contains(_permissions, _powerDef.modelManage)) {
                            menu = ['delete', 'move'];
                        } else {
                            menu = [];
                        }
                    }
                } else {
                    menu = [];
                }
            } else {
                var resourceType = $(selectItems[0]).attr('filetype');
                var dirType = $(selectItems[0]).attr('dirtype');
                var source = $(selectItems[0]).attr('source');
                var subType = $(selectItems[0]).attr('subtype');
                switch (resourceType) {
                    case _fileTypeEnum.folder:
                        if (source == _sourceDef.SYSTEM) {
                            if (dirType == _dirTypeDef.SYSTEM_DATA) {
                                if (_.contains(_permissions, _powerDef.sysDataManage)) {
                                    menu = ['delete', 'rename', 'move'];
                                }
                            } else if (dirType == _dirTypeDef.SYSTEM_MODEL) {
                                if (_.contains(_permissions, _powerDef.modelManage)) {
                                    menu = ['delete', 'rename', 'move'];
                                }
                            } else if (dirType == _dirTypeDef.SYSTEM_REPORT) {
                                if (_.contains(_permissions, _powerDef.reportManage)) {
                                    menu = ['move'];
                                }
                            }
                        } else if (source == _sourceDef.PERSONAL) {
                            if (dirType == _dirTypeDef.USER_SHARE) {
                                menu = [];
                            } else {
                                menu = ['delete', 'rename', 'move', 'share'];
                            }
                        }
                        break;
                    case _fileTypeEnum.task:
                        if (_resourceMode == 4) {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['delete', 'rename', 'share', 'move', 'start', 'stop'];
                                if(subType == _taskTypeEnum.modeling){
                                    /*menu.push('createas');
                                    menu.push('restart');*/
                                }
                            }else if(source == _sourceDef.SHARE){
                                if(subType == _taskTypeEnum.modeling){
                                    /*menu = ['createas'];*/
                                }
                            }
                        } else {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['open', 'delete', 'rename', 'share', 'start', 'stop'];
                                /*if(subType == _taskTypeEnum.modeling){
                                    menu.push('createas');
                                    menu.push('restart');
                                }*/
                            }else if(source == _sourceDef.SHARE){
                                if(subType == _taskTypeEnum.modeling)
                                    menu = ['open'/*, 'createas'*/];
                            }
                            //menu = ['delete', 'rename', 'start', 'stop'];
                            //else
                            //    menu = ['open'];
                        }
                        break;
                    case _fileTypeEnum.data:
                        if (_resourceMode == 4) {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['delete', 'rename', 'share', 'data-import', 'data-manage'];
                                if (_resourceMode == 4) {
                                    menu.push('move');
                                }
                            } else if (source == _sourceDef.SYSTEM) {
                                if (_.contains(_permissions, _powerDef.sysDataManage)) {
                                    menu = ['data-manage','data-import'];
                                    if (_resourceMode == 4) {
                                        menu.push('move');
                                    }
                                }
                                //if (_.contains(_permissions, _powerDef.sysDataManage)) {
                                //    menu.push('data-import');
                                //}
                            }
                        } else {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['open', 'delete', 'rename', 'share', 'data-import', 'data-manage'];
                                if (_resourceMode == 4) {
                                    menu.push('move');
                                }
                            } else if (source == _sourceDef.SYSTEM) {
                                menu = ['open'];
                                if (_.contains(_permissions, _powerDef.sysDataManage)) {
                                    menu = ['open', 'data-manage','data-import'];
                                }
                                //if (_.contains(_permissions, _powerDef.sysDataManage)) {
                                //    menu.push('data-import');
                                //}
                            } else {
                                menu = ['open'];
                            }
                        }
                        break;
                    case _fileTypeEnum.doc:
                        if (_resourceMode == 4) {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['delete', 'rename', 'share', 'download'];
                                if (_resourceMode == 4) {
                                    menu.push('move');
                                }
                            } else if (source == _sourceDef.SHARE) {
                                menu = ['download'];
                            }
                        } else {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['open', 'delete', 'rename', 'share', 'download'];
                            } else if (source == _sourceDef.SHARE) {
                                menu = ['open', 'download'];
                            } else {
                                menu = ['open'];
                            }
                        }
                        break;
                    case _fileTypeEnum.report:
                        if (_resourceMode == 4) {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['delete', 'rename', 'share', 'move'];
                            } else if (source == _sourceDef.SYSTEM) {
                                if (_.contains(_permissions, _powerDef.reportManage)) {
                                    menu = ['move'];
                                }
                            }
                        } else {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['open', 'delete', 'rename', 'share'];
                            } else {
                                menu = ['open'];
                            }
                        }
                        break;
                    case _fileTypeEnum.model:
                        if (_resourceMode == 4) {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['delete', 'rename', 'share', 'move', 'export'];
                            } else if (source == _sourceDef.SYSTEM) {
                                if (_.contains(_permissions, _powerDef.modelManage)) {
                                    menu = ['delete', 'rename', 'export'];
                                } else {
                                    menu = [];
                                }
                            }
                        } else {
                            if (source == _sourceDef.PERSONAL) {
                                menu = ['open', 'delete', 'rename', 'share', 'export'];
                            } else if (source == _sourceDef.SYSTEM) {
                                if (_.contains(_permissions, _powerDef.modelManage)) {
                                    menu = ['open', 'delete', 'rename', 'export'];
                                } else {
                                    menu = ['open'];
                                }
                            } else {
                                menu = ['open'];
                            }
                        }
                        break;
                }
            }
            switch (resourceType) {
                case _fileTypeEnum.task:
                    if (source == _sourceDef.PERSONAL) {
                        if($(selectItems[0]).data().status == 'toexam'){
                            menu.push('reapproval');
                        }
                    }
            }
            return menu;
        }

        function initContextMenu(event, ui) {
            var menu = getContextMenu(ui);
            if (menu.length == 0) {
                event.preventDefault();
                return;
            }
            if (_resourceMode == 4 && (_currentDirType == _dirTypeDef.ROOT || _currentDirType == _dirTypeDef.SYSZONE_ROOT)) {
                event.preventDefault();
                return;
            }
            _.each(_allContextMenu, function (item) {
                $("#main-body").contextmenu("showEntry", item, false);
            })
            _.each(menu, function (item) {
                $("#main-body").contextmenu("showEntry", item, true);
            })
        }

        //右键响应事件
        $("#main-body").contextmenu({
            delegate: ".hasmenu",
            menu: "#option",
            beforeOpen: initContextMenu,
            select: function (event, ui) {
                var selectItems = getSelectItems();
                if (ui.cmd == "rename") {
                    WorkspaceHelper.renameFunction(selectItems, _currentDirType, reloadFiles);
                } else if (ui.cmd == "move") {
                    WorkspaceHelper.moveFunction(selectItems, _currentDirType, _dirTypeDef, reloadFiles);
                } else if (ui.cmd == "delete") {
                    WorkspaceHelper.deleteFunction(selectItems, _currentDirType, reloadFiles);
                } else if (ui.cmd == "open") {
                    openContainingFolder(ui);
                } else if (ui.cmd == "reapproval") {
                    WorkspaceHelper.taskApprovalFunction(selectItems,  reloadFiles);
                } else if (ui.cmd == "download") {
                    WorkspaceHelper.downloadFunction(selectItems, _fileTypeEnum);
                } else if (ui.cmd == "share") {
                    WorkspaceHelper.shareFunction(selectItems, _dirTypeDef, reloadFiles);
                } else if (ui.cmd == "data-import") {
                    WorkspaceHelper.dataImportFunction(selectItems);
                } else if (ui.cmd == "data-manage") {
                    WorkspaceHelper.dataManageFunction(selectItems);
                } else if (ui.cmd == "export") {
                    WorkspaceHelper.exportFunction(selectItems);
                } else if (ui.cmd == "start") {
                    WorkspaceHelper.taskStartFunction(selectItems, reloadFiles);
                } else if (ui.cmd == "stop") {
                    WorkspaceHelper.taskStopFunction(selectItems, reloadFiles);
                } else if (ui.cmd == "createas") {
                    WorkspaceHelper.taskRestartFunction(selectItems);
                } else if (ui.cmd == "restart") {
                    WorkspaceHelper.taskCreateasFunction(selectItems);
                }
            }
        });

        $("#searchtable").contextmenu({
            delegate: ".hasmenu",
            menu: "#option1",
            beforeOpen: function (event, ui) {
                var parent = ui.target.parents('.hasmenu');
            },
            select: function (event, ui) {
                if (ui.cmd == "open") {
                    openContainingFolder(ui);
                }
            }
        });

        function openContainingFolder(ui) {
            var parent = ui.target.parents('.hasmenu');
            $.getJSON('/workspacedir/getContainingDir', {
                parentId: parent.attr("parentId"),
                parentDn: parent.attr("parentDn"),
                parentDirType: parent.attr("parentDirType")
            }).done(function (rsp) {
                if (rsp.data) {
                    var dirs = rsp.data;
                    WorkspaceHelper.turnOutSearch(_lastSearchKeyword, _resourceMode, resetSearchKeyWord);
                    var curDir = dirs[dirs.length - 1];
                    _currentDirId = curDir.id;
                    _currentDirType = curDir.dirType;
                    _currentDirShareFlag = curDir.shareFlag;
                    _currentPathStr = curDir.path;
                    _currentPath = WorkspaceHelper.generatePath(dirs);
                    turnInDirNav();
                    reloadMainPath();
                }
            })
        }


        //设定子表的外框位置
        function format(d) {
            return '<div class = "' + d.id + '" style="padding-left:60px"></div>'
        }


        /*给datatable添加响应事件*/
        addEventToFiletable();

        //判断一个值是不是undefined 或者是不是 空值
        function isNull(key){
            if(_.isUndefined(key) || key == ""){
                return true;
            }else{
                return false;
            }
        }


    });
