define('widget/department-info', [
    '../tpl/group/tpl-departmentinfo',
    '../tpl/group/tpl-departmentinfo-edit',
    'underscore',
    'nova-notify',
    'jquery',
], function(tpl, tpl_edit, _, Notify) {
    var _department;
    var _opts;
    tpl = _.template(tpl);
    tpl_edit = _.template(tpl_edit);

    function init(opts) {
        _opts = opts;
    }

    function renderDepartmentInfo(info) {
        if (_.isUndefined(info.departmentName) || _.isUndefined(info.departmentId)) {
            $(_opts.container).empty();
            return;
        };
        _department = info;
        $(_opts.container).empty().append(tpl(info));
        $('#delete-department').click(function() {
            _opts.deleteCallback(_department);
        });
        $('#move-department').click(function() {
            _opts.moveCallback(_department);
        });
        $('#edit-department').click(function() {
            _opts.editCallback(_department);
        });
        $(_opts.container).localize();
    }

    function edit() {
        $(_opts.container).empty().append(tpl_edit(_department));
        $(_opts.container).localize();
        $('#cancel-edit-department').click(function() {
            endEdit();
            $('#department-name').val(_department.departmentName);
            $('#department-description').val(_department.description);
        });
        $('#complete-edit-department').click(function() {
            //add by zhangu
            var departmentNameValue = $('#department-name').val().trim();
            var Tree = $("#department-tree").fancytree("getTree");
            var node = Tree.getActiveNode();
            var nodeList = node.getParentList();
            var nameList = [];
            _.each(nodeList, function(nodeItem, index) {
                nameList.push(nodeItem.data.departmentName);
            })
            if (_.contains(nameList, departmentNameValue)) {
                Notify.show({
                    title: i18n.t('usermanage.notify-depnameequal'),
                    type: "warning"
                });
                return;
                //the end
            } else {
                _department.departmentName = departmentNameValue;
                _department.description = $('#department-description').val().trim();
                _opts.completeCallback(_department);
            }
        });
    }

    function endEdit() {
        renderDepartmentInfo(_department);
    }

    return {
        init: init,
        renderDepartmentInfo: renderDepartmentInfo,
        edit: edit,
        endEdit: endEdit
    };
});