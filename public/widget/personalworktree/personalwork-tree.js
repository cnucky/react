define('widget/personalwork-tree', [
    'config',
    'underscore',
    'jquery',
    'nova-notify',
    './css/personalWorkTree.css',
    'jquery-ui',
    'fancytree-all',
    'utility/contextmenu/jquery.ui-contextmenu'
], function(Config, _, $, Notify) {
    var _instance;
    var _opts;
    var _permissions;
    var _selecetedNode;
    var _isEdit = false;
    var _isTrue = false;

    function buildTree(opts) {
        _opts = opts;
        var treeFlag = [];
        var _powerDef = {
            sysDataManage: '100000:function:sysDataMgr',
            modelManage: '100000:function:modelMgr',
            reportManage: '100000:function:reportMgr'
        };

        if (_opts.treeAreaFlag == "default" || _opts.treeAreaFlag == "saveTask") {
            treeFlag.push(21);
            initTree(_opts, treeFlag);
        } else {
            $.getJSON('/workspacedir/checkPermissions', {
                permissions: _.values(_powerDef)
            }).done(function(rsp) {
                if (rsp.data) {
                    _permissions = rsp.data;
                }

                switch (_opts.treeAreaFlag) {
                    case "saveModel":
                        if (_.contains(_permissions, _powerDef.modelManage)) {
                            treeFlag.push(6);
                        }
                        treeFlag.push(21);
                        break;
                    case "saveData":
                        if (_.contains(_permissions, _powerDef.sysDataManage)) {
                            treeFlag.push(5);
                        }
                        treeFlag.push(21);
                        break;
                    case "saveReport":
                        if (_.contains(_permissions, _powerDef.reportManage)) {
                            treeFlag.push(7);
                        }
                        treeFlag.push(21);
                        break;
                    case "moveSysModel":
                        if (_.contains(_permissions, _powerDef.modelManage)) {
                            treeFlag.push(6);
                        } else {
                            Notify.show({
                                title: i18n.t('base:workspace.alert-havenosysmodemanage'),
                                type: "failed"
                            });
                        }
                        break;
                    case "moveSysData":
                        if (_.contains(_permissions, _powerDef.sysDataManage)) {
                            treeFlag.push(5);
                        } else {
                            Notify.show({
                                title: i18n.t('base:workspace.alert-havenosysdatamanage'),
                                type: "failed"
                            });
                        }
                        break;
                    case "moveSysReport":
                        if (_.contains(_permissions, _powerDef.reportManage)) {
                            treeFlag.push(7);
                        } else {
                            Notify.show({
                                title: i18n.t('base:workspace.alert-havenosysreportmanage'),
                                type: "failed"
                            });
                        }
                        break;
                }

                _isTrue = true;
                initTree(_opts, treeFlag);
            })
        }
        return _instance;
    }

    function initTree(opt, treeFlag) {
        // Util.dynamicLoadingCss("/public/widget/personalworktree/css/personalWorkTree.css");
        $(opt.container).fancytree({
            extensions: ["filter", "edit"],
            autoScroll: opt.autoScroll || true,
            clickFolderMode: opt.clickFolderMode || 1,
            selectMode: opt.selectMode || 3,
            quicksearch: true,
            source: {
                url: "/utility/showdirtree?treeFlag=" + treeFlag
            },
            filter: {
                mode: "hide",
                autoApply: true
            },
            edit: {
                // triggerStart: ["f2", "dblclick", "shift+click", "mac+enter"],
                triggerCancel: ['esc', 'click'],
                beforeClose: function(event, data) {
                    if (data.input.val() == "") {
                        return true;
                    } else {
                        return true;
                    }
                },
                save: function(event, data) {
                    setTimeout(function() {
                        data.node.setTitle(data.node.title);
                    }, 2000);
                    return true;
                },
                close: function(event, data) {
                    if (data.save) {
                        var tree = $(opt.container).fancytree('getTree');
                        if (!_isEdit) {
                            var childrenNode = _selecetedNode.getChildren();
                            var postFlag = true;
                            var nodeTitles = [];
                            if (childrenNode.length > 1) {
                                _.map(childrenNode, function(nodeItem, index) {
                                    if (_.contains(nodeTitles, nodeItem.title)) {
                                        Notify.show({
                                            title: i18n.t('base:workspace.alert-dirnamerepeat'),
                                            type: "danger",
                                        });

                                        postFlag = false;
                                    } else {
                                        nodeTitles.push(nodeItem.title);
                                    }
                                })
                            }

                            if (postFlag) {
                                $.post('/workspacedir/add', {
                                    dirName: data.node.title,
                                    dirDesc: "",
                                    parentDirId: _selecetedNode.key,
                                    dirType: _selecetedNode.data.dirType
                                }).done(function(rspData) {
                                    rspData = JSON.parse(rspData);
                                    if (rspData.code != 0) {
                                        Notify.show({
                                            title: rspData.message,
                                            type: "danger",
                                        });
                                    } else {
                                        data.node.key = "" + rspData.data;
                                        tree.reload().done(function() {
                                            tree.activateKey("" + rspData.data);
                                        });
                                    }
                                });
                            } else {
                                tree.reload();
                            }
                        } else {
                            var oldname = data.node.data.name;
                            var newname = data.node.title;
                            var dirId = data.node.data.id;
                            var desc = data.node.data.desc;
                            $.post('/udp/modifyDir', {
                                dirId: dirId,
                                newName: newname,
                                newDesc: desc
                            }).done(function(rsp) {
                                rsp = JSON.parse(rsp);
                                if (rsp.code != 0) {
                                    Notify.show({
                                        title: i18n.t('base:workspace.alert-renameDirFail'),
                                        type: "danger",
                                    });
                                    tree.reload();
                                } else {
                                    data.node.setActive(true);
                                }
                            })
                        }

                    }
                }

            },
            postProcess: function(event, data) {
                if (data.response) {
                    data.result = data.response.data;
                }
            },
            lazyLoad: function(event, data) {
                data.result = {
                    url: "./ajax-sub2.json"
                }
            },
            icon: function(event, data) {
                return "fa fa-folder-o fancytree-icon-color";
            },
        }).on("nodeCommand", function(event, data) {
            var tree = $(this).fancytree("getTree");
            _selecetedNode = tree.getActiveNode();
            if (_selecetedNode.isFolder()) {
                switch (data.cmd) {
                    case "createNewFolder":
                        _isEdit = false;
                        _selecetedNode.editCreateNode("child", {
                            title: "",
                            folder: true
                        });
                        break;
                    case "editFolderName":
                        _isEdit = true;
                        var dirId = _selecetedNode.data.parentId;
                        var dirList = ["1", "2", "3", "4", "5", "6", "7", "21"];
                        if (_.contains(dirList, dirId)) {
                            Notify.show({
                                title: i18n.t('base:workspace.alert-dircannotrename'),
                                type: "danger",
                            });
                        } else {
                            _selecetedNode.editStart();
                        }
                        break;
                }
            }
        });

        $(opt.container).contextmenu({
            delegate: '.fancytree-folder',
            menu: [{
                title: i18n.t('base:workspace.label-mkdir'),
                cmd: 'createNewFolder',
                uiIcon: 'add-newFolder-icon'
            }, {
                title: i18n.t('base:workspace.button-renameDir'),
                cmd: 'editFolderName',
                uiIcon: 'edit-folderName-icon'
            }],
            beforeOpen: beforeOpen,
            select: contextMenuSelect
        });
        _config()
    }

    function beforeOpen(event, ui) {
        var node = $.ui.fancytree.getNode(ui.target);
        $(_opts.container).contextmenu("enableEntry", "createNewFolder", node.isFolder());
        $(_opts.container).contextmenu("enableEntry", "editFolderName", node.isFolder());
        node.setActive();
    }

    function contextMenuSelect(event, ui) {
        //延时0.1秒执行命令，以确保菜单关闭和执行命令两件事情不冲突
        var that = this;
        setTimeout(function() {
            $(that).trigger("nodeCommand", {
                cmd: ui.cmd
            });
        }, 100);
    }

    function _config () {
        $(_opts.container).fancytree("option", configValue, configValue2);
        return _instance;
    }

    var configValue, configValue2;
    function config(name, value) {
        configValue = name;
        configValue2 = value;
    }

    return _instance = {
        opts: _opts,
        buildTree: buildTree,
        config: config
    };
})