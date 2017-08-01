define([
    '../../widget/department-tree',
], function(usertree) {
    function config(_$) {
        $ = _$;
        $('head').append('\
            <style>\
                .userpicker-dropdown {\
                    position: fixed;\
                    z-index: 9999;\
                    padding: 4px;\
                    border: 1px solid rgba(0, 0, 0, 0.15);\
                    border-radius: 4px;\
                    background-color: #f8f8f8;\
                }\
                .userpicker-dropdown:before{\
                  content: "";\
                  display: inline-block;\
                  border-left: 7px solid transparent;\
                  border-right: 7px solid transparent;\
                  border-bottom: 7px solid #ccc;\
                  border-bottom-color: rgba(0, 0, 0, 0.2);\
                  position: absolute;\
                  top: -7px;\
                  left: 7px;\
                }\
                .userpicker-dropdown:after{\
                  content: "";\
                  display: inline-block;\
                  border-left: 6px solid transparent;\
                  border-right: 6px solid transparent;\
                  border-bottom: 6px solid white;\
                  position: absolute;\
                  top: -6px;\
                  left: 8px;\
                }\
                .userpicker-dropdown-content {\
                    width: 100%;\
                    height: 100%;\
                    overflow-x: hidden;\
                    overflow-y: auto;\
                }\
            </style>\
        ');
        $.fn.userPicker = function(opt) {
            /*opt = {
                source:[],//自定义tree数据源
                multi:boolean,//单选false,多选true
                init: callback
            }*/
            $element = this;
            var getTree;
            var html = "<div class='userpicker-dropdown hidden' style='height:300px;width:300px'>" +
                "<input type='text' class='form-control usersearch' style='height:32px'>" +
                "<div class='userpicker-dropdown-content' style='height:260px'>" +
                "</div>" +
                "</div>";
            $(".userpicker-dropdown").remove();
            $("body").append(html);
            //dropdown
            var $dropdown = $(".userpicker-dropdown");
            var $search = $dropdown.children('.usersearch');
            var operate = opt.multi ? "select" : "activate";
            var tree = usertree.build({
                container: $dropdown.children(".userpicker-dropdown-content"),
                expandAll: true,
                checkbox: opt.multi,
                source: opt.source || {
                    url: "/department/listallnoauth"
                },
                init: function(event, data) {
                    if (opt.init)
                        opt.init(event, data)
                }
            }).config(operate, function(event, data) {
                var _ids = "";
                var _users = "";
                var nodes = [];
                if (operate == "activate") {
                    getTree.visit(function(node) {
                        node.setSelected(false);
                    })
                    nodes.push(tree.getActiveNode());
                } else {
                    nodes = tree.getSelectedNodes();
                }
                _.each(nodes, function(treeNode) {
                    if (treeNode.data.userName) {
                        _users = _users + treeNode.data.userName + ";";
                        _ids = _ids + treeNode.data.userId + ";";
                    }
                })
                $element.val(_users.slice(0, _users.length - 1));
                $element.data("id", _ids.slice(0, _ids.length - 1));
            });
            getTree = $dropdown.children(".userpicker-dropdown-content").fancytree('getTree');
            $("body").on('click', function(e) {
                $dropdown.addClass("hidden");
            });
            $dropdown.on('keydown', function(e) {
                if (e.keyCode === 27) {
                    $dropdown.addClass("hidden");
                }
            });
            $dropdown.on('click', function(e) {
                e.stopPropagation();
            });
            $element.on('click', function(e) {
                e.stopPropagation();
                $dropdown.toggleClass('hidden');
                var A_top = $element.offset().top + $element.outerHeight(true) - $(window).scrollTop();
                var A_left = $element.offset().left - $(window).scrollLeft();
                $dropdown.css({
                    'top': A_top + 'px',
                    'left': A_left + 'px',
                });
            })
            $search.keyup(function(event) {
                getTree.clearFilter();
                if ($(this).val().trim() != '')
                    getTree.filterNodes($(this).val().trim());
            }).focus();

            function setSelectedUser(selectData) {
                var ids = '';
                var names = '';
                getTree.visit(function(node) {
                    node.setSelected(false);
                })
                _.each(selectData, function(item) {
                    var nodes;
                    ids = ids + item.id + ';';
                    names = names + item.name + ';';
                    nodes = getTree.getNodeByKey('user-' + item.id);
                    nodes.setSelected(true);
                });
                $element.data('id', ids.slice(0, ids.length - 1));
                $element.val(names.slice(0, names.length - 1));
            }

            function getSelectedUser() {
                if (!$element.data("id"))
                    return [];
                var names = $element.val().split(";");
                var ids = $element.data("id").split(";");
                return _.map(ids, function(id, index) {
                    return {
                        id: id,
                        name: names[index]
                    };
                });
            }
            return {
                setSelectedUser: setSelectedUser,
                getSelectedUser: getSelectedUser,
            };
        };
    }
    config(window.jQuery);
    return {
        config: config,
    }
});