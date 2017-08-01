define('./relationship-snapshot', ['nova-dialog',
    '../../tpl/relationship/tpl-save-snapshot',
    '../../tpl/relationship/tpl-load-snapshot',
    'utility/loaders',
    'nova-notify',
    '../../../../../../public/widget/personalworktree',
    'moment',
    'jquery',
    'fancytree-all',
    'underscore',
    'jquery.validate',
    'utility/FileSaver/Blob',
    'utility/FileSaver/canvas-toBlob'
], function(Dialog, tplSaveSnapshot, tplloadSnapshots, loaders, Notify, PersonalWorkTree, moment) {
    var network;
    var getSnapShot;
    var restoreSnapShot;
    var task = {
        id: 0,
        name: null
    }; // 未分配任务
    var pageSize = 20;
    var autoSaveInLoad = 2;
    var snapshotImageSize = 200;

    var tplSnapshotItem = _.template($('#tpl-load-snapshot-item').html().trim());

    function setTask(id, name) {
        task.id = id;
        task.name = name;
        setPageDescription('当前任务：<b>' + name + '</b>', true);
    }

    function openTask(id, name) {
        setTask(id, name);
        $.getJSON('/relationgraph/relationgraph/snapshotlist', {
            taskid: id,
            start: 0,
            pageSize: pageSize,
            autosave: autoSaveInLoad
        }, function(rsp) {
            if (rsp.code == 0) {
                var snapshot = rsp.data.snapshotList[0];
                try {
                    var graph = JSON.parse(snapshot.graph);
                    restoreSnapShot(graph, true);
                } catch (e) {
                    Notify.show({
                        text: '无效的快照数据',
                        type: 'danger'
                    });
                    console.log(e);
                }
            } else {
                Notify.show({
                    title: '加载快照失败',
                    text: rsp.message,
                    type: 'danger'
                })
            }
        });
    }

    function init(_network, _getSnapShot, _restoreSnapShot) {
        network = _network;
        getSnapShot = _getSnapShot;
        restoreSnapShot = _restoreSnapShot;
        bindEvents();
    }

    function getImage(size) {
        var canvas = $('#drawing canvas').get(0);
        var width = $('#drawing').width(),
            height = $('#drawing').height();
        var ratio = size / Math.max(width, height);
        var w = ratio * width,
            h = ratio * height;

        var newCanvas = $('<canvas>').get(0);
        newCanvas.width = w;
        newCanvas.height = h;

        newCanvas.getContext('2d').drawImage(canvas, 0, 0, w, h);

        // TODO: 有马赛克
        return newCanvas.toDataURL();
    }

    function bindEvents() {
        $('#btn-storefile').click(showSaveSnapshotDialog);
        $('#btn-importfile').click(showRestoreSnapshotDialog);
    }

    function autoSave() {
        if (task.id == 0) {
            return;
        }
        var time = new Date();
        $.post('/relationgraph/relationgraph/savesnapshot',{
                taskid: task.id,
                title: 'AutoSave(' + moment().format("YYYY-MM-DD HH:mm:ss") + ")",
                image: getImage(snapshotImageSize),
                remark: 'AutoSave ' + (new Date()),
                graph: JSON.stringify(getSnapShot()),
                autosave: 1
            }, function(rsp) {

        }, 'json');
    }

    function showSaveSnapshotDialog() {
        var validator;
        Dialog.build({
            title: "保存快照",
            content: tplSaveSnapshot,
            width: 500,
            rightBtnCallback: function() {
                if (!validator.form()) return;
                var dirId = "";
                if (task.id == 0) {
                    var selectedDirectory = $('#save-position-picker').fancytree("getTree").getActiveNode();
                    if (!_.isNull(selectedDirectory)) {
                        dirId = selectedDirectory.key;
                    } else {
                        dirId = "";
                    }
                    if (_.isEmpty(dirId)) {
                        Notify.show({
                            title: "请选择保存位置",
                            type: "error"
                        });
                        return;
                    }
                }
                $.post('/relationgraph/relationgraph/savesnapshot',{
                        taskid: task.id,
                        taskname: task.id != 0 ? '' : $('#form-save-snapshot-taskname').val().trim(),
                        title: $('#form-save-snapshot-name').val().trim(),
                        image: $('#form-save-snapshot-image').attr('src'),
                        remark: $('#form-save-snapshot-remark').val().trim(),
                        graph: JSON.stringify(getSnapShot()),
                        dirid: dirId,
                        autosave: 0
                    }, function(rsp) {
                        if (rsp.code == 0) {
                            if (task.id == 0) {
                                setTask(rsp.data.taskid, rsp.data.taskname);
                            }
                            Notify.show({
                                title: '保存成功',
                                type: 'success'
                            });
                            $.magnificPopup.close();
                        } else {
                            Notify.show({
                                title: '保存失败',
                                text: rsp.message,
                                type: 'danger'
                            });
                        }
                    },'json');
            }
        }).show(function() {
            $('#form-save-snapshot-image').attr('src', getImage(snapshotImageSize));
            validator = $('#form-save-snapshot').validate({
                rules: {
                    'taskname': "required",
                    'name': "required"
                },
                messages: {
                    'taskname': '不能为空',
                    'name': "不能为空"
                },
                errorClass: "has-error",
                validClass: 'has-success',
                highlight: function(element, errorClass, validClass) {
                    $(element).closest('div.form-group').addClass(errorClass).removeClass(validClass);
                },
                unhighlight: function(element, errorClass, validClass) {
                    $(element).closest('div.form-group').removeClass(errorClass).addClass(validClass);
                }
            });
            if (task.id == 0) {
                $("#save-position-picker").empty();
                PersonalWorkTree.buildTree({
                    container: $("#save-position-picker"),
                    treeAreaFlag: 'saveTask'
                });
            } else {
                $("#save-position").hide();
            }
            $('#form-save-snapshot-taskname').val(task.name || '');
            if (task.id != 0) {
                $('#form-save-snapshot-taskname').attr('readonly', '');
            }
        });
    }

    function showRestoreSnapshotDialog() {
        if(task.id == 0){
            Notify.show({
                title:"请先保存任务",
                type:'warning'
            });
            return;
        }
        Dialog.build({
            title: "加载快照",
            content: tplloadSnapshots,
            style: 'lg',
            hideFooter: true,
        }).show(function() {
            $('#nv-dialog-body').addClass('pn');
            autoSaveInLoad = 2;
            $('#load-snapshot-toolbar input').click(function() {
                autoSaveInLoad = parseInt($(this).val());
                // var task = getSelectTask() || task;
                if (task.id > 0) {
                    loadSnapshots(task.id);
                }
            });
            // loadTasks();
            if (task.id > 0) {
                loadSnapshots(task.id);
            }
        });
    }

    function getSelectTask() {
        var el = $('#load-snapshot-tasks li.active');
        if (el.length == 0) {
            return null;
        }
        return {
            id: parseInt(el.attr('data-id')),
            name: el.find('a').html()
        }
    }

    function loadSnapshots(taskid, page) {
        page = page || 1;
        var loader = loaders($('#load-snapshot-list'));
        $.getJSON('/relationgraph/relationgraph/snapshotlist', {
            taskid: taskid,
            start: (page - 1) * pageSize,
            pageSize: pageSize,
            autosave: autoSaveInLoad
        }, function(rsp) {
            loader.hide();
            if (rsp.code == 0) {
                renderSnapshots(rsp.data.snapshotList);
                (page == 1 && renderSnapPages(rsp.data.snapshotCount));
            } else {
                Notify.show({
                    title: '加载快照列表失败',
                    text: rsp.message,
                    type: 'danger'
                })
            }
        });
    }

    function renderSnapshots(snapshots) {
        $('#load-snapshot-list ul').empty();

        _.each(snapshots, function(snapshot, index) {
            snapshot.index = index;
            var $snapshotItem = $(tplSnapshotItem(snapshot));

            _bindItemEvents(snapshots, index, $snapshotItem);

            $('#load-snapshot-list ul').append($snapshotItem);
        });

        var listHeight = $('nv-dialog-body').height() - $('#load-snapshot-toolbar').height() - $('#load-snapshot-footer').height();
        $('#load-snapshot-list').height(listHeight);
    }

    function renderSnapPages(count) {
        require(['widget/rlf-pagination'], function(Pagination) {
            Pagination.init({
                container: $("#load-snapshot-footer").html(''),
                pageCallback: function(currentPage) {
                    //var task = getSelectTask();
                    loadSnapshots(task.id, currentPage);
                }
            })
            Pagination.renderPagination(Math.ceil(count / pageSize));
        });
    }

    function _bindItemEvents(snapshots, index, $snapshotItem) {
        var snapshot = snapshots[index];

        $snapshotItem.find('.snapshot-image').click(function() {
            try {
                var graph = JSON.parse(snapshot.graph);
                restoreSnapShot(graph, true);
                $.magnificPopup.close();
            } catch (e) {
                Notify.show({
                    text: '无效的快照数据',
                    type: 'danger'
                });
                console.log(e);
            }
        });

        $snapshotItem.find('.snapshot-name-edit').click(function() {
            var titleDiv = $snapshotItem.find('.snapshot-title');
            titleDiv.addClass('hide')
            .siblings('.snapshot-title-change').removeClass('hide')
            .find('.snapshot-title-editor').val(titleDiv.text().trim()).focus();
        });

        $snapshotItem.find('.snapshot-item-delete').click(function() {
            _deleteSnapshot(snapshots, index);
        });

        $snapshotItem.find('.snapshot-title-editor').blur(function() {
            var snapshotTitle = $snapshotItem.find('.snapshot-title-change').addClass('hide')
                .siblings('.snapshot-title').removeClass('hide');

            var newTitle = event.target.value.trim();
            if (_.isEmpty(newTitle)) {
                Notify.simpleNotify('快照名称不能为空', '', 'warning');
                return;
            } else if (newTitle != snapshot.title) {
                snapshot.title = newTitle;
                _updateSnapshotTitle(snapshots, index, newTitle);

                snapshotTitle.text(newTitle);
            }
        });
    }

    function _updateSnapshotTitle(allSnapshot, index, newTitle) {
        var snapshot = allSnapshot[index];
        $.post('/relationgraph/relationgraph/updatesnapshot', {
            taskid: snapshot.analysisId,
            snapshotid: snapshot.id,
            title: newTitle,
            remark: snapshot.remark
        }, function(rsp) {
            if (rsp.code == 0) {

            } else {

            }
        }, 'json');
    }

    function _deleteSnapshot(allSnapshot, index) {
        var snapshot = allSnapshot[index];
        $.post('/relationgraph/relationgraph/deletesnapshot', {
            taskid: snapshot.analysisId,
            snapshotid: snapshot.id,
            title: snapshot.title
        }, function(rsp) {
            if (rsp.code == 0) {

            } else {

            }
        }, 'json');

        allSnapshot.splice(index, 1);

        renderSnapshots(allSnapshot);
    }

    return {
        init: init,
        autoSave: autoSave,
        setTask: setTask,
        openTask: openTask
    }
});
