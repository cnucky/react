define('widget/group-info', [
    '../tpl/group/tpl-groupinfo',
    '../tpl/group/tpl-groupinfo-edit',
    'underscore',
    'jquery'
], function(tpl, tpl_edit, _) {
    var _group;
    var _opts;
    tpl = _.template(tpl);
    tpl_edit = _.template(tpl_edit);

    function init(opts) {
        _opts = opts;
    }

    function renderGroupInfo(info) {
        if (_.isUndefined(info.userGroupName) || _.isUndefined(info.userGroupId)) {
            $(_opts.container).empty();
            return;
        };
        _group = info;
        $(_opts.container).empty().append(tpl(info));
        $('#delete-group').click(function() {
            _opts.deleteCallback(_group);
        });
        // $('#move-group').click(function() {
        //     _opts.moveCallback(_group);
        // });
        $('#edit-group').click(function() {
            _opts.editCallback(_group);
        });
    }

    function edit() {
        $(_opts.container).empty().append(tpl_edit(_group));
        $('#cancel-edit-group').click(function() {
            endEdit();
            $('group-name').val(_group.userGroupName);
            $('group-description').val(_group.description);
        });
        $('#complete-edit-group').click(function() {
            _group.userGroupName = $('#group-name').val().trim();
            _group.description = $('#group-description').val().trim();
            _opts.completeEditCallback(_group);
        });
    }

    function endEdit() {
        renderGroupInfo(_group);
    }

    return {
        init: init,
        renderGroupInfo: renderGroupInfo,
        edit: edit,
        endEdit: endEdit
    };
});