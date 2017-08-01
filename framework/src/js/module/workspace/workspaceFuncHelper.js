define('module/workspace/workspace-operateFunc', ["jquery", 'nova-utils', 'q', 'nova-dialog', 'nova-notify', 'udp-file-util',
    'utility/FileSaver/FileSaver','widget/filebatchdownload', 'widget/personalworktree', 'widget/department-tree', 'nova-double-bootbox-dialog', '../../widget/name-validator', "../workprocess/process-operate",'utility/tagmanager/tagmanager',
    'utility/select2/select2.min', 'utility/contextmenu/jquery.ui-contextmenu', 'utility/select2/i18n/zh-CN'
],function($, Util, Q, Dialog, Notify, FileUtil, FileHelper, FileBatchDownload, PersonalWorkTree, Tree, bootbox, NameValidator, approval) {

    function turnInSearch() {
        $("#tree_and_files").hide();
        // $("#mytable").empty();
        $("#mytable").hide();
        $("#searchtable").show();
        $("#disk-default-toolbar").hide();
        $("#search_text").addClass("col-md-8");
        $("#search_text").text(i18n.t('workspace.label-search') + "“" + $("#search_input").val() + "”：");
        $("#search_text").show();
        $(".view-mode-dropdown").hide();
        $("#mainPathBar").hide();
    }

    function turnOutSearch(_lastSearchKeyword, _resourceMode, callBackFunc) {
        $("#search_input").val("");
        callBackFunc();
        $("#tree_and_files").show();
        $("#mytable").show();
        $("#searchtable").empty().hide();
        $("#disk-default-toolbar").show();
        $("#search_text").removeClass("col-md-8");
        $("#search_text").hide();
        $("#filetable .th-recordCount").show();
        if (_resourceMode == 4) {
            $(".view-mode-dropdown").show();
        }
    }

    function generatePath(dirs) {
        var mainPath = [];
        _.each(dirs, function(dir) {
            var pa = {
                id: parseInt(dir.id),
                name: dir.name,
                type: dir.dirType,
                shareFlag: dir.shareFlag,
                path: dir.path,
                parentDn: dir.parentDn
            };
            mainPath.push(pa);
        })
        return mainPath;
    }

    function generateMainPath(node, _currentPath) {
        var curNode = node;
        if (curNode) {
            var path = [];
            var pa = {
                id: node.key,
                name: node.title,
                type: node.data.dirType,
                shareFlag: node.data.shareFlag,
                path: node.data.path,
                parentDn: node.data.parentDn
            };
            path.push(pa);
            while (curNode.getParent()) {
                curNode = curNode.getParent();
                if (curNode.title != 'root') {
                    path.push({
                        id: curNode.key,
                        name: curNode.title,
                        type: curNode.data.dirType,
                        shareFlag: node.data.shareFlag,
                        path: node.data.path,
                        parentDn: node.data.parentDn
                    });
                }
            }
            path.push({
                id: -1,
                name: i18n.t('home.menu-WORK_AREA'),
                type: 1,
                shareFlag: 0,
                path: '/' + i18n.t('home.menu-WORK_AREA'),
                parentDn: '-1'
            });
            path.reverse();
            _currentPath = path;
        }
        return _currentPath;
    }

    function addMainPath(folder, _currentPath) {
        var pa = {
            id: parseInt(folder.id),
            name: folder.name,
            type: folder.type,
            shareFlag: folder.shareFlag,
            path: folder.path,
            parentDn: folder.parentDn
        };
        _currentPath.push(pa);
        return _currentPath;
    }

    function cutMainPath(id, _currentPath) {
        var i;
        for (i = 0; i < _currentPath.length; i++) {
            if (id == _currentPath[i].id)
                break;
        }
        _currentPath = _currentPath.slice(0, i + 1);
        return _currentPath;
    }

    function setFileAttributes(child, file, title_content, _fileTypeEnum) {
        child.setAttribute("fileid", file.id);
        child.setAttribute("source", file.source);
        child.setAttribute("shareflag", file.shareFlag);
        child.setAttribute("dirtype", file.dirType);
        child.setAttribute("filetype", file.type);
        child.setAttribute("subtype", file.subType);
        child.setAttribute("filename", file.name);
        child.setAttribute("filedesc", file.desc);
        child.setAttribute("title", title_content);
        child.setAttribute("parentId", file.parentId);
        child.setAttribute("parentDirType", file.parentDirType);
        child.setAttribute("finishratio", file.finishRatio);
        child.setAttribute("path", file.path);
        child.setAttribute("parentdn", file.parentDn);
        child.setAttribute("recordCount", file.recordCount);
        child.setAttribute("centerCode", file.centerCode);
        child.setAttribute("zoneId", file.zoneId);
        var filedetail = '';
        if (file.type == _fileTypeEnum.doc) {
            filedetail = file.destDocumentPath;
        } else if (file.type == _fileTypeEnum.report) {
            filedetail = file.reportPath;
        }
        child.setAttribute("filedetail", filedetail);
        return child;
    }

    function dataAdapter(newdata){
        var olddata = {};
        olddata.id = newdata.taskId;
        olddata.subType = newdata.taskType;
        olddata.name = newdata.taskName;
        olddata.desc = newdata.operateDesc;
        olddata.path = "";
        olddata.recordCount = newdata.resultCount;
        olddata.createTime = newdata.submitTime;
        olddata.creator = newdata.creator;
        olddata.status = newdata.taskStatus;
        return olddata;
    }
    function getTitleContent(task_in_task, file, _fileTypeEnum, _taskIconMap, _taskTypeCaptionMap, fileImgMap) {
        var type = file.type;
        if (task_in_task == 'taskIntask') { file = dataAdapter(file); type = 1; }
        var subType = file.subType;
        var icon_flag = "";
        var title_content_name = i18n.t('workspace.label-name')+"：" + file.name;
        var title_content_type = "\n" + i18n.t('workspace.menu-dir');
        var creator = file.creator || "";
        var desc = file.desc || "";
        var title_content_other;
        if(_.isEmpty(file.lastModifyTime)){
            file.lastModifyTime = file.createTime;
        }
        if (task_in_task == 'taskIntask'){
            title_content_other = "\n" + i18n.t('workspace.label-shareornot') + "：" + (file.shareFlag == "1" || file.shareFlag == "2" ? i18n.t('workspace.label-yes') : i18n.t('workspace.label-no')) + "\n" + i18n.t('workspace.label-creator') + "：" + creator + "\n" + i18n.t('workspace.label-createtime') + "：" + file.createTime ;
        }else {
            title_content_other = "\n" + i18n.t('workspace.label-path') + "：" + file.path + "\n" + i18n.t('workspace.label-shareornot') + "：" + (file.shareFlag == "1" || file.shareFlag == "2" ? i18n.t('workspace.label-yes') : i18n.t('workspace.label-no')) + "\n" + i18n.t('workspace.label-creator') + "：" + creator + "\n" + i18n.t('workspace.label-createtime') + "：" + file.createTime + "\n" + i18n.t('workspace.label-lastchange') + "：" + file.lastModifyTime;
        }
        if(!_.isEmpty(file.desc)){
            title_content_other = title_content_other + "\n"+i18n.t('workspace.label-desc')+"：" + file.desc;
        }
        var title_content = "";
        if (type == _fileTypeEnum.task) {
            icon_flag = _taskIconMap[file.subType] || "icon-numbers";
            var typeCaption = _taskTypeCaptionMap[subType] || i18n.t('workspace.menu-task');
            title_content_type = "\n"+i18n.t('workspace.label-type')+"：" + typeCaption + i18n.t('workspace.menu-task');
            var taskStatus = _taskStatusCaptionMap[file.status] || i18n.t('workspace.label-unknown');
            if(subType == _taskTypeEnum.personcore){
                taskStatus = i18n.t('workspace.label-finish');
                file.finishRatio = 100;
            }
            var resultCountStr = subType == _taskTypeEnum.relationship || subType == _taskTypeEnum.personcore ? "":"\n"+i18n.t('workspace.label-resultcount')+"：" + file.recordCount;
            var only_task_content;

            if(task_in_task == 'taskIntask'){
                only_task_content = "\n"+i18n.t('workspace.label-status')+"：" + taskStatus;
            }else {
                only_task_content = "\n" + i18n.t('workspace.label-finishedpercent') + "(%)：" + file.finishRatio + resultCountStr + "\n" + i18n.t('workspace.label-status') + "：" + taskStatus;
            }
            title_content = title_content_name + title_content_type + title_content_other + only_task_content;
            title_content = title_content + "\n"+i18n.t('workspace.label-taskid')+"：" + file.id;
        } else if (type == _fileTypeEnum.data) {
            icon_flag = "icon-file";
            title_content_type = "\n"+i18n.t('workspace.label-typedata');
            title_content = title_content_name + title_content_type + title_content_other;
        } else if (type == _fileTypeEnum.doc) {
            title_content_type = "\n" + i18n.t('workspace.label-typedoc');
            var docStatus = _docStatusCaptionMap[file.status] || i18n.t('workspace.label-unknown');
            title_content = title_content_name + title_content_type + "\n" + i18n.t('workspace.label-size') + "：" + file.resourceSize + title_content_other + "\n" + i18n.t('workspace.label-status') + "：" + docStatus;
            var dotIndex = file.name.lastIndexOf('.');
            if (dotIndex != -1) {
                var suffix = file.name.substr(dotIndex + 1).toLowerCase();
                icon_flag = fileImgMap[suffix] || "icon-docdefault";
            } else {
                icon_flag = "icon-docdefault";
            }
        } else if (type == _fileTypeEnum.folder) {
            icon_flag = "icon-folder";
            title_content = title_content_name + title_content_type + title_content_other;
        } else if (type == _fileTypeEnum.report) {
            title_content_type = "\n" +i18n.t('workspace.label-typereport');
            title_content = title_content_name + title_content_type + title_content_other;
        } else if (type == _fileTypeEnum.model) {
            icon_flag = _taskIconMap[file.subType] || "icon-numbers";
            var typeCaption = _taskTypeCaptionMap[subType] || i18n.t('workspace.menu-modeling');
            title_content_type = "\n"+i18n.t('workspace.label-type')+"：" + typeCaption + i18n.t('workspace.menu-modeling');
            title_content = title_content_name + title_content_type + title_content_other;
        }
        return {
            "icon_flag": icon_flag,
            "title_content": title_content
        }
    }

    function getInnerHtml(file, _fileTypeEnum, icon_flag) {
        var innerHTML = "";
        var shareImgIn = '<img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-65px;margin-left:65px;width:20px;height:15px;z-index: 0; position:relative;"></img>';
        var shareImgOut = '<img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-63px;margin-left:67px;width:20px;height:15px;z-index: 0; position:relative;"></img>';
        if (file.type == _fileTypeEnum.task || file.type == _fileTypeEnum.model) {
            // var progressbar_share = '<div class="progress progress-bar-xs ml10 mr10" style="margin-top:32px;z-index: 0; position:relative;margin-bottom:0px;"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + file.finishRatio + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + file.finishRatio + '%;"><span class="sr-only"></span></div></div>';
            var model_progressbar_share = '<div class="ml20" style="width:60%;align-items:center;"><div class="progress progress-bar-xs mr10" style="margin-top:42px;margin-left:14px;z-index: 0; position:relative;margin-bottom:0px;"><div class="progress-bar progress-bar-success " role="progressbar" aria-valuenow="' + file.finishRatio + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + file.finishRatio + '%;align-items:center"><span class="sr-only"></span></div></div></div>';
            var model_progressbar = '<div class="ml20" style="width:60%;align-items:center;"><div class="progress progress-bar-xs mr10" style="margin-top:-8px;margin-left:14px;z-index: 0; position:relative;margin-bottom:0px;"><div class="progress-bar progress-bar-success " role="progressbar" aria-valuenow="' + file.finishRatio + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + file.finishRatio + '%;align-items:center"><span class="sr-only"></span></div></div></div>';

            // var progressbar = '<div class="progress progress-bar-xs ml10 mr10" style="margin-top:60px;z-index: 0; position:relative;margin-bottom:0px;"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + file.finishRatio + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + file.finishRatio + '%;"><span class="sr-only"></span></div></div>';
            if (file.type == _fileTypeEnum.model) {
                model_progressbar_share = '';
                model_progressbar = '';;
            }
            if (file.subType == _taskTypeEnum.modeling || file.subType == _taskTypeEnum.pcmanage) {
                if (file.shareFlag == 1 && file.isShareRoot == 1) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/icon-modeling.png" style="width:64px;height:64px;"></img></div><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-65px;margin-left:65px;width:20px;height:15px;z-index: 0; position:relative;"></img>' + model_progressbar_share + '</i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/icon-modeling.png" style="width:64px;height:64px;"></img></div><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-65px;margin-left:65px;width:20px;height:15px;z-index: 0; position:relative;"></img>' + model_progressbar_share + '</i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                } else {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><img src="/img/workspace/icon-modeling.png" style="width:64px;height:64px;"></img>' + model_progressbar + '</i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                }
            } else {
                if (file.shareFlag == 1 && file.isShareRoot == 1) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/' + icon_flag + '.png" style="width:64px;height:64px;"></img></div><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-65px;margin-left:65px;width:20px;height:15px;z-index: 0; position:relative;"></img>' + model_progressbar_share + '</i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/' + icon_flag + '.png" style="width:64px;height:64px;"></img></div><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-65px;margin-left:65px;width:20px;height:15px;z-index: 0; position:relative;"></img>' + model_progressbar_share + '</i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                } else {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><img src="/img/workspace/' + icon_flag + '.png" style="width:64px;height:64px;"></img>' + model_progressbar + '</i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                }
            }
        } else if (file.type == _fileTypeEnum.data) {
            if (file.shareFlag == 1 && file.isShareRoot == 1) {
                innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/icon-data.png" style="width:64px;height:64px;"></img></div><img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:-65px;margin-left:77px;width:20px;height:15px;z-index: 0; position:relative;"></img></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
            } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
                innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/icon-data.png" style="width:64px;height:64px;"></img></div><img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:-65px;margin-left:77px;width:20px;height:15px;z-index: 0; position:relative;"></img></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
            } else {
                innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><img src="/img/workspace/icon-data.png" style="width:64px;height:64px;"></img></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
            }
        } else if (file.type == _fileTypeEnum.doc) {
            if (icon_flag == "icon-eml") {
                if (file.shareFlag == 1 && file.isShareRoot == 1) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/icon-eml.png" style="width:64px;height:64px;"></img>' + shareImgOut + '</div></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/icon-eml.png" style="width:64px;height:64px;"></img>' + shareImgIn + '</div></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                } else {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><img src="/img/workspace/icon-eml.png" style="width:64px;height:64px;"></img></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span>' + file.name + '</span></em></p></span></div>';
                }
            } else {
                if (file.shareFlag == 1 && file.isShareRoot == 1) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i  class="filetype  ' + icon_flag + '"><div>' + '<img class ="img-responsive" src="/img/workspace/share2.png" style="margin-top:0px;margin-left:45px;width:20px;height:15px;z-index: 0; position:relative;"></img></div></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i  class="filetype  ' + icon_flag + '"><div>' + '<img class ="img-responsive" src="/img/workspace/unshare2.png" style="margin-top:0px;margin-left:45px;width:20px;height:15px;z-index: 0; position:relative;"></img></div></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                } else {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i  class="filetype  ' + icon_flag + '">' + '</i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
                }
            }

        } else if (file.type == _fileTypeEnum.report) {
            if (file.shareFlag == 1 && file.isShareRoot == 1) {
                innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/icon-report.png" style="width:64px;height:64px;"></img>' + shareImgOut + '</div></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
            } else if (file.shareFlag == 2 && file.isShareRoot == 1) {
                innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><div><img src="/img/workspace/icon-report.png" style="width:64px;height:64px;"></img>' + shareImgIn + '</div></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span  title="' + file.name + '">' + file.name + '</span></em></p></span></div>';
            } else {
                innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i><img src="/img/workspace/icon-report.png" style="width:64px;height:64px;"></img></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span>' + file.name + '</span></em></p></span></div>';
            }
        } else {
            if (file.dirType == 22) {
                innerHTML = '<div class="list clear "><span  class="img"><i  class="filetype  ' + icon_flag + '"></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span>' + file.name + '</span></em></p></span></div>';
            } else {
                if (file.isShareRoot == 1 && file.shareFlag == 1) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i  class="filetype  ' + icon_flag + '"><div><img class ="img-responsive " src="/img/workspace/share1.png" style="padding-top:20px;padding-left:12px;width:55px;height:60px;z-index: 0; position:relative;"></img></div></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span>' + file.name + '</span></em></p></span></div>';
                } else if (file.isShareRoot == 1 && file.shareFlag == 2) {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i  class="filetype  ' + icon_flag + '"><div><img class ="img-responsive " src="/img/workspace/unshare1.png" style="padding-top:20px;padding-left:12px;width:55px;height:60px;z-index: 0; position:relative;"></img></div></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span>' + file.name + '</span></em></p></span></div>';
                } else {
                    innerHTML = '<div class="list clear "><label class="checkbox" style="margin:0px auto;"></label><span  class="img"><i  class="filetype  ' + icon_flag + '"></i></span><span class="name"><p class="text"><em style="padding-top:0;"><span>' + file.name + '</span></em></p></span></div>';
                }
            }
        }
        return innerHTML;
    }

    function showdir() {
        $("#tree_div").removeClass("col-md-0");
        $("#tree_div").addClass("col-md-2");
        $("#main-content").removeClass("col-md-12");
        $("#main-content").addClass("col-md-10");
        $("#tree_div").show();
    }

    function hidedir() {
        $("#tree_div").hide();
        $("#tree_div").removeClass("col-md-2");
        $("#tree_div").addClass("col-md-0");
        $("#main-content").removeClass("col-md-10");
        $("#main-content").addClass("col-md-12");
    }

    //move operation
    function moveFunction(selectItems, currentDirType, dirTypeDef, callBackFunc) {
        if (selectItems.length == 0) {
            Notify.show({
                title: i18n.t('workspace.alert-selectonefiles'),
                type: "danger"
            });
            return;
        }
        Dialog.build({
            title: i18n.t('workspace.btn-move'),
            content: "<div id='folder-picker' class='folder-picker-menu'> Loading... </div>",
            rightBtnCallback: function() {
                var newParentNode = $("#folder-picker").fancytree("getTree").getActiveNode();
                var getParentNodeList = newParentNode.getParentList();
                var parentNodeNameList = [];
                _.each(getParentNodeList, function(nodeItem, index) {
                    parentNodeNameList.push(nodeItem.title);
                })
                var obj = [];
                for (var i = 0; i < selectItems.length; i++) {
                    var selectedItemFileId = parseInt($(selectItems[i]).attr("fileid"));
                    var selectedItemFileType = parseInt($(selectItems[i]).attr("filetype"));
                    var selectedItemFileName = $(selectItems[i]).attr("filename");
                    if (selectedItemFileType == 4 && _.contains(parentNodeNameList, selectedItemFileName)) {
                        Dialog.dismiss();
                        Notify.show({
                            title: i18n.t('workspace.alert-cannotmove'),
                            type: "danger"
                        });
                        return;
                    } else {
                        obj.push({
                            id: selectedItemFileId,
                            type: selectedItemFileType,
                            name: selectedItemFileName
                        });
                    }
                }
                $.post('/workspacedir/moveDir', {
                    item: obj,
                    destDirId: newParentNode.key,
                    destDirName: newParentNode.title,
                    tgt: Util.getCookiekey('tgt'),
                    dirType: currentDirType
                }).done(function(data) {
                    Dialog.dismiss();
                    data = JSON.parse(data);
                    if (data.code == 0) {
                        Notify.show({
                            title: i18n.t('workspace.alert-movesuccess'),
                            type: "success"
                        });
                        callBackFunc();
                    } else {
                        Notify.show({
                            title: i18n.t('workspace.alert-movefail'),
                            type: "danger",
                            text: data.message
                        });
                    }
                });
            }
        }).show(function() {
            $("#folder-picker").empty();
            var treeAreaFlag = "";
            if (currentDirType == dirTypeDef.SYSTEM_MODEL) {
                treeAreaFlag = "moveSysModel"
            } else if (currentDirType == dirTypeDef.SYSTEM_DATA) {
                treeAreaFlag = "moveSysData";
            } else if (currentDirType == dirTypeDef.SYSTEM_REPORT) {
                treeAreaFlag = "moveSysReport";
            } else {
                treeAreaFlag = "default";
            }
            PersonalWorkTree.buildTree({
                container: $("#folder-picker"),
                treeAreaFlag: treeAreaFlag
            });
        });
    }

    //dataImport
    function dataImportFunction(selectItems) {
        if (selectItems.length > 0) {
            var dataTypeId = $(selectItems[0]).attr('fileid');
            var zoneId = $(selectItems[0]).attr('zoneId');
            var centerCode = $(selectItems[0]).attr('centerCode');
            window.open('/datamanage/dm-datamanage.html?datatypeid=' + dataTypeId + "&centercode=" + centerCode + "&zoneid=" + zoneId + "&oprtype=3");
        }
    }

    //dataManage
    function dataManageFunction(selectItems) {
        if (selectItems.length > 0) {
            var dataTypeId = $(selectItems[0]).attr('fileid');
            var zoneId = $(selectItems[0]).attr('zoneId');
            var centerCode = $(selectItems[0]).attr('centerCode');
            window.open('/datamanage/dm-datamanage.html?datatypeid=' + dataTypeId + "&centercode=" + centerCode + "&zoneid=" + zoneId + "&oprtype=1");
        }
    }

    //modeling restart
    function taskRestartFunction(selectItems){
        if (selectItems.length > 0) {
            var taskId = $(selectItems[0]).attr('fileid');
            window.open('/modelanalysis/modeling.html?taskid=' + taskId + '&submittype=1');
        }
    }

    //modeling restart
    function taskCreateasFunction(selectItems){
        if (selectItems.length > 0) {
            var taskId = $(selectItems[0]).attr('fileid');
            window.open('/modelanalysis/modeling.html?taskid=' + taskId + '&submittype=2');
        }
    }

    //share
    function shareFunction(selectItems, dirTypeDef, callBackFunc) {
        if (selectItems.length == 0) {
            Notify.show({
                title: i18n.t('workspace.alert-selectsource'),
                type: "danger"
            });
            return;
        } else if (selectItems.length > 1) {
            Notify.show({
                title: i18n.t('workspace.alert-selectonetoshare'),
                type: "danger"
            });
            return;
        }
        var dirType = $(selectItems[0]).attr("dirtype");
        if (dirType == dirTypeDef.USER_SHARE) {
            Notify.show({
                title: i18n.t('workspace.alert-noshare'),
                type: "danger"
            });
            return;
        }
        $.get("resource-share.html", function(result) {
            var fileid = parseInt($(selectItems[0]).attr("fileid"));
            var type = parseInt($(selectItems[0]).attr("filetype"));
            var filename = $(selectItems[0]).attr("filename");
            Dialog.build({
                title: i18n.t('workspace.label-sharesetting'),
                content: result,
                maxHeight: 400,
                minHeight: 240,
                rightBtn: i18n.t('workspace.label-sure'),
                rightBtnCallback: function() {
                    // 提交
                    var shareUserNames = $("#users-tagmanager").tagsManager('tags');
                    var shareInfos = [];
                    _.each(selectedUserIds, function(userId) {
                        shareInfos.push({
                            shareUserId: userId,
                            permission: 1
                        });
                    })
                    $.post('/workspacedir/shareresource', {
                        resourceId: fileid,
                        resourceName: filename,
                        resourceType: type,
                        shareInfos: shareInfos,
                        shareUserNames:shareUserNames
                    }).done(function(data) {
                        Dialog.dismiss();
                        data = JSON.parse(data);
                        if (data.code == 0) {
                            Notify.show({
                                title: i18n.t('workspace.alert-sharesuccess'),
                                type: "success",
                            });
                            callBackFunc();
                        } else {
                            Notify.show({
                                title: i18n.t('workspace.alert-sharefail'),
                                content: data.message,
                                type: "danger",
                            });
                        }
                    });
                }
            }).show(function() {
                $("#form-share").localize();
                $('#users-tagmanager').tagsManager({
                    //tagsContainer: '#user-roles',
                    externalTagId: true,
                    tagClass: 'tm-tag-info'
                });

                $(".tm-input").on('tm:spliced', function(e, tag) {
                    treeSelectedFlag = false;
                    for (var i = 0; i < selectedUsers.length; i++) {
                        if (selectedUsers[i].name == tag) {
                            var depTree = $("#users-choose").fancytree("getTree");
                            var node = depTree.getNodeByKey("user-" + selectedUsers[i].id);
                            node.setSelected(false);
                            var indexNum = _.indexOf(selectedUserIds, selectedUsers[i].id);
                            selectedUserIds.splice(indexNum, 1);
                            selectedUsers.splice(i, 1);
                            break;
                        }
                    }
                    treeSelectedFlag = true;
                })
                $.getJSON('/workspacedir/shareinfo', {
                    resourceType: type,
                    resourceId: fileid
                }).done(function(rsp) {
                    var shareList = rsp.data;
                    $('#users-tagmanager').tagsManager('empty');
                    selectedUsers = [];
                    selectedUserIds = [];
                    _.each(shareList, function(user) {
                        selectedUsers.push({
                            name: user.userName,
                            id: user.shareUserId
                        })
                        selectedUserIds.push(user.shareUserId);
                        $('#users-tagmanager').tagsManager('pushTag', user.userName, false, user.shareUserId);
                    })

                    $.get('/workspacedir/selectusers', {
                        shareUserList: shareList
                    }).done(function(rspData) {
                        rspData = JSON.parse(rspData);
                        if (rspData.code == 0) {
                            $("#users-choose").empty();
                            Tree.build({
                                source: rspData.data,
                                container: $("#users-choose"),
                                autoCollapse: true,
                                expandAll: false,
                                filter: {
                                    mode: "hide",
                                    autoAppaly: true,
                                    hightlight: true,
                                    nodata:true,
                                },
                                init: function(event, data) {
                                    data.tree.visit(function(node) {
                                        if (node.data.departmentId == -1) {
                                            node.setExpanded(true);
                                        }
                                    })
                                },
                            }).config('select', function(event, data) {
                                if (treeSelectedFlag) {
                                    getProcessData();
                                }
                            })

                            var shareUserTree = $("#users-choose").fancytree("getTree");
                            $("input[name=searchUser]").keyup(function(e) {
                                $(".fancytree-node").parent().removeClass("hide");
                                var rootNode = shareUserTree.getRootNode();
                                if(rootNode._isLoading){
                                    Notify.show({
                                        title: "数据正在加载,请稍等!",
                                        type: "danger"
                                    });
                                    return;
                                }
                                var n;
                                var opts = {
                                    autoExpand: true
                                };
                                var match = $(this).val();

                                if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                                    $("button#btnResetSearchUser").click();
                                    return;
                                }
                                n = shareUserTree.filterNodes(match, opts);
                                $("li .fancytree-hide").parent().addClass("hide");

                                $("button#btnResetSearchUser").attr("disabled", false);
                                $("button#btnResetSearchUser").text(i18n.t('workspace.button-clear')+"(" + n + ")");
                            });
                            $("button#btnResetSearchUser").click(function() {
                                $("input[name=searchUser]").val("");
                                $("button#btnResetSearchUser").text(i18n.t('workspace.button-clear'));
                                shareUserTree.clearFilter();
                                $(".fancytree-node").parent().removeClass("hide");
                            }).attr('disabled', 'true');

                        } else {
                            Notify.show({
                                title: i18n.t('workspace.alert-selecttreesharedfail'),
                                type: "warning",
                            });
                        }
                    })
                })
            });
        });
    }
    function taskApprovalFunction(selectItems, callBackFunc) {
        if (selectItems.length == 0) {
            Notify.show({
                title: i18n.t('workspace.alert-selapprovaltask'),
                type: "danger"
            });
            return;
        } else if (selectItems.length > 1) {
            Notify.show({
                title: i18n.t('workspace.alert-seloneapprovaltask'),
                type: "danger"
            });
            return
        }
        var $itemData = $(selectItems[0]).data();
        $.get('/workspacedir/reApprovalTask',
            {taskId:$itemData.id}
        ).done(function(rsp){
                var data = JSON.parse(rsp);
                if(data.code == 0){
                    var name = $itemData.name;
                    //var taskId = $itemData.id;
                    _.each(data.data.examInfos, function(subtask) {
                        var subtaskId = subtask.subtaskId;
                        _.each(subtask.processFlows, function(process) {
                            start_process(subtaskId, process.processKey, name);
                        })
                    })
                    callBackFunc();
                }else {
                    Notify.show({
                        title: i18n.t('workspace.alert-getappdetailfail'),
                        type: "danger",
                        text: i18n.t('workspace.alert-tasktypeerror')//data.message
                    });
                }
                //callBackFunc();
            });

    }

    function start_process(businessID, businessType, digest) {
        approval.startProcess({
            data: [{
                businessID: businessID,
                digest: digest,
            }],
            businessType: businessType
        });
    }
    //task start
    function taskStartFunction(selectItems, callBackFunc){
        if (selectItems.length == 0) {
            Notify.show({
                title: i18n.t('workspace.alert-selecttask'),
                type: "danger"
            });
            return;
        }
        callBackFunc();
    }

    //task stop
    function taskStopFunction(selectItems, callBackFunc){
        if (selectItems.length == 0) {
            Notify.show({
                title: i18n.t('workspace.alert-selecttask'),
                type: "danger"
            });
            return;
        }
        callBackFunc();
    }

    var selectedUsers = [];
    var selectedUserIds = [];
    var treeSelectedFlag = true;

    function getProcessData() {
        selectedUsers = [];
        selectedUserIds = [];
        var departmentTree = $("#users-choose").fancytree("getTree");
        var selectedNodes = departmentTree.getSelectedNodes();
        $('#users-tagmanager').tagsManager('empty');
        if (selectedNodes.length > 0) {
            _.each(selectedNodes, function(node) {
                if (!node.isFolder()) {
                    selectedUsers.push({
                        name: node.title,
                        id: parseInt(node.data.userId)
                    })
                    selectedUserIds.push(parseInt(node.data.userId));
                    var nodeName = node.title;
                    var nodeId = parseInt(node.data.userId);
                    $('#users-tagmanager').tagsManager('pushTag', nodeName, false, nodeId);
                }
            })
        }
    }

    //rename
    function renameFunction(selectItems, currentDirType, callBackFunc) {
        if (selectItems.length == 0) {
            Notify.show({
                title: i18n.t('workspace.alert-selectonefiles'),
                type: "danger"
            });
            return;
        } else if (selectItems.length > 1) {
            Notify.show({
                title: i18n.t('workspace.alert-renameonefile'),
                type: "danger"
            });
            return;
        }

        $.get("update-file-dialog.html", function(result) {
            var fileid = parseInt($(selectItems[0]).attr("fileid"));
            var type = parseInt($(selectItems[0]).attr("filetype"));
            var oldname = $(selectItems[0]).attr("filename");
            var olddesc = $(selectItems[0]).attr("filedesc");
            Dialog.build({
                title: i18n.t('workspace.label-renamefiles'),
                content: result,
                rightBtn: i18n.t('workspace.label-sure'),
                rightBtnCallback: function() {
                    // 提交
                    var name = $("#update-file-name").val().trim();
                    var desc = $("#update-file-description").val().trim();
                    if (!NameValidator.VfWS(name,i18n.t('workspace.label-name')))
                        return;

                    $.post('/workspacedir/updateDir', {
                        id: fileid,
                        newName: name,
                        oldName: oldname,
                        desc: desc,
                        type: type,
                        tgt: Util.getCookiekey('tgt'),
                        dirType: currentDirType,
                        force: "0"
                    }).done(function(data) {
                        data = JSON.parse(data);
                        if (data.code == 0) {
                            Notify.show({
                                title: i18n.t('workspace.alert-renamsuccess'),
                                type: "success",
                            });
                            Dialog.dismiss();
                            callBackFunc();
                        } else if (data.code == 4) {
                            bootbox.confirm(i18n.t('workspace.alert-continuerenamecancelshare'), function(rlt) {
                                if (rlt) {
                                    $.post('/workspacedir/updateDir', {
                                        id: fileid,
                                        newName: name,
                                        oldName: oldname,
                                        type: type,
                                        desc: desc,
                                        tgt: Util.getCookiekey('tgt'),
                                        dirType: currentDirType,
                                        force: "1"
                                    }).done(function(rspData) {
                                        data = $.parseJSON(rspData);
                                        bootbox.dismiss();
                                        if (data.code == 0) {
                                            Notify.show({
                                                title: i18n.t('workspace.alert-renamsuccess'),
                                                type: "success",
                                            });
                                            callBackFunc();
                                        } else {
                                            Notify.show({
                                                title: i18n.t('workspace.alert-renamefail'),
                                                text: data.message,
                                                type: "danger",
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            Notify.show({
                                title: i18n.t('workspace.alert-renamefail'),
                                text: data.message,
                                type: "danger",
                            });
                            Dialog.dismiss();
                        }
                    });
                }
            }).show(function() {
                $("#form-table").localize();
                $("#update-file-name").val(oldname);
                $("#update-file-description").text(olddesc);
            });
        });
    }

    //mkdir
    function mkdirFunction(currentDirId, currentDirType, callBackFunc) {
        $.get("update-file-dialog.html", function(result) {
            Dialog.build({
                title: i18n.t('workspace.btn-mkdir'),
                content: result,
                rightBtn: i18n.t('workspace.label-sure'),
                rightBtnCallback: function() {
                    // 提交
                    var name = $("#update-file-name").val().trim();
                    var desc = $("#update-file-description").val().trim();
                    if (!NameValidator.VfWS(name,i18n.t('workspace.label-name')))
                        return;
                    $.post('/workspacedir/add', {
                        dirName: name,
                        dirDesc: desc,
                        parentDirId: currentDirId,
                        dirType: currentDirType
                    }).done(function(data) {
                        Dialog.dismiss();
                        data = JSON.parse(data);
                        if (data.code == 0) {
                            Notify.show({
                                title: i18n.t('workspace.alert-mkdirsuccess'),
                                type: "success",
                            });
                            callBackFunc();
                        } else {
                            Notify.show({
                                title: i18n.t('workspace.alert-mkdirfail'),
                                type: "danger",
                                text: data.message
                            });
                        }
                    });
                }
            }).show(function() {
                $("#form-table").localize();
                $("#update-file-name").val("");
            });
        });
    }

    //delete
    function deleteFunction(selectItems, currentDirType, callBackFunc) {
        if (selectItems.length == 0) {
            Notify.show({
                title: i18n.t('workspace.alert-selectfiletodalete'),
                type: "danger"
            });
            return;
        }
        var obj = [];
        var systemReportDelFlag = false;
        for (var i = 0; i < selectItems.length; i++) {
            var selectedFileType = parseInt($(selectItems[i]).attr("filetype"));
            var selectedFileId = parseInt($(selectItems[i]).attr("fileid"));
            var selectedFileName = $(selectItems[i]).attr("filename").toString();
            if (selectedFileType == 5) { //删除系统报表
                systemReportDelFlag = true;
                Notify.show({
                    title: i18n.t('workspace.alert-cannotdeletesysreport'),
                    type: "danger",
                });
                return;
            } else {
                obj[i] = {
                    id: selectedFileId,
                    type: selectedFileType,
                    name: selectedFileName
                };
            }
        }
        bootbox.confirm(i18n.t('workspace.alert-deleteornot'), function(firstRlt) {
            if (firstRlt) {
                $.post('/workspacedir/deleteResource', {
                    item: obj,
                    force: "0",
                    tgt: Util.getCookiekey('tgt'),
                    dirType: currentDirType
                }).done(function(data) {
                    data = JSON.parse(data);
                    if (data.code == 0) {
                        Notify.show({
                            title: (i18n.t('workspace.alert-deletesuccess'))
                        });
                        callBackFunc();
                        bootbox.dismiss();
                    } else if (data.code == 4) {
                        bootbox.confirm(i18n.t('workspace.alert-continuedeletecancelshare'), function(rlt) {
                            if (rlt) {
                                bootbox.dismiss();
                                $.post('/workspacedir/deleteResource', {
                                    item: obj,
                                    force: "1",
                                    tgt: Util.getCookiekey('tgt'),
                                    dirType: currentDirType
                                }).done(function(rsp) {
                                    var returnValue = JSON.parse(rsp);
                                    if (returnValue.code == 0) {
                                        Notify.show({
                                            title: (i18n.t('workspace.alert-deletesuccess'))
                                        });
                                        callBackFunc();
                                    } else {
                                        Notify.show({
                                            title: (i18n.t('workspace.alert-deletefail')),
                                            type: "danger",
                                            text: returnValue.message
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        Notify.show({
                            title: (i18n.t('workspace.alert-deletefail')),
                            type: "danger",
                            text: data.message
                        });
                        bootbox.dismiss();
                    }

                });
            }
        });
    }

    //download
    function downloadFunction(selectItems, fileTypeEnum) {
        if (selectItems.length == 0) {
            Notify.show({
                title: i18n.t('workspace.alert-selectonefileresource'),
                type: "danger"
            });
            return;
        } else {
            var toDownloadFiles = [];
            var strName = "";
            _.each(selectItems, function(item) {
                if ($(item).attr("filetype") == fileTypeEnum.doc) {
                    var fileName = $(item).attr("filename");
                    var filePath = $(item).attr("filedetail");
                    toDownloadFiles.push({
                        fileName: fileName,
                        uuidName: filePath
                    });
                }
            });
            if (toDownloadFiles.length == 0) {
                Notify.show({
                    title: i18n.t('workspace.alert-selectdoctype'),
                    type: "danger"
                });
            } else {
                if (toDownloadFiles.length == 1) {
                    FileUtil.downloadFile(toDownloadFiles[0]);
                } else {
                    var indexNum = toDownloadFiles[0].fileName.lastIndexOf(".");
                    strName = toDownloadFiles[0].fileName.slice(0, indexNum);
                    FileBatchDownload.filebatchdownload(toDownloadFiles, strName, "#winpop");
                }

                if (selectItems.length > toDownloadFiles.length) {
                    Notify.show({
                        title: i18n.t('workspace.alert-nodoccandownload'),
                        type: "warning"
                    });
                }
            }
        }
    }

    function hasOthersSharedFiles(selectItems){
        for(var i = 0; i<selectItems.length; i++){
            if($(selectItems[i]).attr("shareflag") == '2')
                return true
        }
        return false;
    }
    //export model
    function exportFunction(selectItems) {
        if (selectItems.length == 0) {
            Notify.show({
                title: i18n.t('workspace.alert-selectonemodel'),
                type: "danger"
            });
            return;
        } else {
            var selectedSubtype = parseInt($(selectItems[0]).attr("subtype"));
            var selectedModelId = parseInt($(selectItems[0]).attr("fileid"));
            var selectedFileName = $(selectItems[0]).attr("filename");

            var promises = [];
            var modelDetail;
            switch (selectedSubtype) {
                case 107:
                    modelDetail = Util.makeRetryGet('/modeling/loadmodel', {
                        id: selectedModelId
                    });
                    break;
                default:
                    modelDetail = Util.makeRetryGet('/smartquery/openModel', {
                        modelId: selectedModelId
                    });
                    break;
            }
            promises.push(modelDetail);

            Q.all(promises).then(function(returnData) {
                _.each(returnData, function(returnInfo) {
                    var strData = JSON.stringify(returnInfo);
                    var fileData = new Blob([strData], {
                        type: 'application/json'
                    });
                    FileHelper.saveAs(fileData, selectedFileName + '.mdl');
                })
            }).catch(function(ex) {
                hideLoader();
                Notify.show({
                    title: i18n.t('workspace.alert-getmodelinfofail'),
                    type: 'danger'
                });
            });
            // var toDownloadModel = [];
            // _.each(selectItems, function(item) {
            //     if ($(item).attr("filetype") == fileTypeEnum.model) {
            //         var id = parseInt($(item).attr("fileid"));
            //         toDownloadModel.push({
            //             modelId: id
            //         })
            //     }
            // });

            // $.get('/workspacedir/getFile', {
            //     resourceDetail: toDownloadModel
            // }).done(function(rsp) {
            //     rsp = JSON.parse(rsp);
            //     if (rsp.code == 0) {
            //         FileBatchDownload.filebatchdownload(rsp.data, "#winpop");
            //     }
            // })
        }
    }

    //approval detail
    function showApprovalDetail(selectedIds){
        var tpl_approval = require('../../tpl/workspace/tpl-approval-result');
        Dialog.build({
                    title: i18n.t('workspace.label-approvalinfo'),
                    content: '<div id = "approval-info"></div>',
                    hideLeftBtn:true,
                }).show(function() {
            $.getJSON('/workspacedir/getApprovalData', {
                data: selectedIds
            }).done(function (res) {
                if(res.code == '0') {
                    var data = res.data[0];
                    var approvalResult = {
                        'processType': data.strProcessType,
                        'processName': data.strProcessName,
                        'taskStatus': data.strBusinessStatus,
                        'currentAssignee': data.tCurrentAssignee[0].strUserName,
                        'result': data.strResult,
                        'details':data.tReason
                    };
                    $("#approval-info").append(_.template(tpl_approval)(approvalResult));
                }else {
                    Notify.show({
                        title: i18n.t('workspace.alert-getapprovalfail'),
                        text: data.message,
                        type: "danger",
                    });
                }
                $('#approval-info [data-i18n]').localize();
            });
        });
    }

    function renameSearchFunction(ui) {
        var parent = ui.target.parents('.hasmenu');
        $.get("update-file-dialog.html", function(result) {
            var fileid = parseInt(parent.attr("fileid"));
            var type = parseInt(parent.attr("filetype"));
            Dialog.build({
                title: i18n.t('workspace.label-renamefile'),
                content: result,
                rightBtn: i18n.t('workspace.label-sure'),
                rightBtnCallback: function() {
                    // 提交
                    var name = $("#update-file-name").val().trim();

                    $.post('/workspacedir/updateDir', {
                        did: fileid,
                        newName: name,
                        type: type
                    }).done(function(data) {
                        Dialog.dismiss();
                        data = JSON.parse(data);
                        if (data.code == 0) {
                            Notify.show({
                                title: i18n.t('workspace.alert-renamsuccess'),
                                type: "success",
                            });
                            reloadMainContent(false);
                            var keyword = $("#search_input").val();
                            searchByKeyword(keyword);
                        } else {
                            Notify.show({
                                title: i18n.t('workspace.alert-renamefail'),
                                text: data.message,
                                type: "danger",
                            });
                        }
                    });
                }
            }).show(function() {
                $("#update-file-name").val(parent.attr("filename"));
                $("#update-file-description").text(parent.attr("filedesc"));
            });
        });
    };

    function patchUrl (originalUrl, datas) {
        var formattedUrl = originalUrl;
        if(formattedUrl.match('{taskId}')) {
            formattedUrl = formattedUrl.replace('{taskId}', BASE64.encoder(''+datas.id));
        }
        if(formattedUrl.match('{taskName}')) {
            formattedUrl = formattedUrl.replace('{taskName}', BASE64.encoder(datas.name));
        }
        return formattedUrl;
    }
    return {
        turnInSearch: turnInSearch,
        turnOutSearch: turnOutSearch,
        addMainPath: addMainPath,
        cutMainPath: cutMainPath,
        setFileAttributes: setFileAttributes,
        generateMainPath: generateMainPath,
        getTitleContent: getTitleContent,
        showdir: showdir,
        hidedir: hidedir,
        getInnerHtml: getInnerHtml,
        moveFunction: moveFunction,
        downloadFunction: downloadFunction,
        dataImportFunction: dataImportFunction,
        dataManageFunction: dataManageFunction,
        shareFunction: shareFunction,
        renameFunction: renameFunction,
        deleteFunction: deleteFunction,
        generatePath: generatePath,
        mkdirFunction: mkdirFunction,
        exportFunction: exportFunction,
        hasOthersSharedFiles: hasOthersSharedFiles,
        taskApprovalFunction: taskApprovalFunction,
        taskStartFunction: taskStartFunction,
        taskStopFunction: taskStopFunction,
        showApprovalDetail: showApprovalDetail,
        patchUrl: patchUrl,
        taskRestartFunction:taskRestartFunction,
        taskCreateasFunction:taskCreateasFunction
    };
});
