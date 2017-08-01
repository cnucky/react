define('widget/authority-tree', [
    './tpl-authtree-title-dropdown',
    'underscore',
    'jquery',
    'fancytree-all'
], function(tpl, _, jQuery) {
    tpl = _.template(tpl);

    function _processData(result, instance) {
        if (result.length > 0) {
            var resource = result[0];
            if (resource.resourceType == 1) {
                instance.opts.checkbox = false;
                instance.opts.dropdown = true;
            } else {
                instance.opts.checkbox = true;
                instance.opts.dropdown = false;
            }
        }
    }

    function _applyNodeSelect(node, select) {
        if (_.contains(node.data.subPermissionList, select)) {
            node.data.selectedSubPermission = [select];
        } else {
            node.data.selectedSubPermission = node.data.subPermissionList[node.data.subPermissionList.length - 1];
        }
        _.each(node.children, function(child) {
            _applyNodeSelect(child, select);
            child.render();
        });
    }

    function _applyNodeCheck(node, check, isSelected) {
        node.data.selectedSubPermission = [check];
        node.setSelected(isSelected);
        _.each(node.children, function(child) {
            _applyNodeCheck(child, check, isSelected);
        });
    }

    function build(opts) {
        var _instance = {
            opts: opts,
            config: config
        };
        $(_instance.opts.container).fancytree({
            selectMode: opts.selectMode || 3,
            // checkbox: _.isUndefined(_instance.opts.checkbox) ? true : _instance.opts.checkbox,
            clickFolderMode: _instance.opts.clickFolderMode || 1,
            source: opts.source,
            lazyLoad: opts.lazyLoad,
            postProcess: function(event, data) {
                if (data.response.data) {
                    data.result = data.response.data;
                    _processData(data.result, _instance);
                    if (_instance.opts.checkbox) {
                        $(_instance.opts.container).fancytree("option", "checkbox", true);
                    }
                }
                if (_instance.opts.loadEnd) {
                    _instance.opts.loadEnd(event, data);
                }
            },
            loadError: function(event, data) {
                if (_instance.opts.loadEnd) {
                    _instance.opts.loadEnd(event, data);
                }
            },
            createNode: function(event, data) {
                if (data.node.data.partsel) {
                    data.node.partsel = true;

                }

                if (data.node.data.resourceType == 1) {
                    var select = $(data.node.li).find('.auth-select');
                    select.on('change', function() {
                        if (this.value != '--') {
                            _applyNodeSelect(data.node, this.value);
                        }
                        if (_instance.opts.select) {
                            _instance.opts.select(event, data);
                        }
                    });
                    var detail = $(data.node.li).find('.auth-detail');
                    if (opts.showDetail && !data.node.data.isDir) {
                        //数据叶节点
                        detail.removeClass('hidden');
                        detail.on('click', function() {
                            if (_instance.opts.showDetail) {
                                _instance.opts.showDetail(event, data);
                            }
                        });
                    }
                }
            },
            minExpandLevel: opts.minExpandLevel,
            autoScroll: true,
            iconClass: function(event, data) {
                if (data.node.data.resourceType == 2) {
                    return "fa fa-lock";
                } else {
                    if (data.node.hasChildren()) {
                        return "fa fa-folder-o"
                    } else {
                        return "fa fa-lock";
                    }
                }
            },
            select: function(event, data) {
                if (data.node.data.resourceType != 1) {
                    _applyNodeCheck(data.node, data.node.data.subPermissionList[0], data.node.isSelected());
                }
                data.node.data.selected = data.node.isSelected();
                if (_instance.opts.select) {
                    _instance.opts.select(event, data);
                }
            },
            renderNode: function(event, data) {
                var select = $(data.node.li).children('span').find('.auth-select');
                if (data.node.data.resourceType == 1 && data.node.statusNodeType != "loading") {
                    //apply selectValue
                    select.val(data.node.data.selectedSubPermission[0]);
                }
            },
            renderTitle: function(event, data) {
                if (_instance.opts.dropdown && "loading" != data.node.statusNodeType) {
                    var itemTpl = _.template("<option value='<%- value %>'><%- value %></option>");
                    var select = $("<select class='auth-select'></select>");
                    _.each(data.node.data.subPermissionList, function(flag) {
                        var newFlag = {
                            'value': flag
                        };
                        var option = $(itemTpl(newFlag));
                        select.append(option);
                    });
                    return tpl({
                        title: data.node.title,
                        dropdown: select.prop('outerHTML'),
                        detail:'详情'
                    });
                }
            },
            loadChildren: function(event, data) {
                // Apply parent's state to new child nodes
                if (this.selectMode == 3) {
                    data.node.fixSelection3AfterClick();
                }
            }
        });

        function config(name, value) {
            $(_instance.opts.container).fancytree("option", name, value);
            return _instance;
        }

        return _instance;
    }

    return {
        build: build
    };
})