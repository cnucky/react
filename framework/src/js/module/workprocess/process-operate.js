require('i18n');
registerLocales(require.context('../../../locales/workprocess', false, /\.js/));
define([
    'jquery',
    'widget/dialog/nova-dialog',
    'widget/dialog/nova-notify',
    'widget/dialog/nova-bootbox-dialog',
    './processTrace',
    './utility',
    './constants',
    './tileselect',
    './userpicker',
    'bootstrap-multiselect'],
    function($, dialog, notify, bootbox, processTrace, utility, constants, tileselect, userpicker) {
        function init(_$, _dialog, _notify, _bootbox){
            $ = _$;
            dialog = _dialog;
            notify = _notify;
            bootbox = _bootbox;
            userpicker.config($);
            return this;
        }

        /*
        * opt: {
        *     $container: $, //图片加载节点jquery对象
        *     processType: '', //流程的类型
        *     processID: '', //processID与businessID选填一个
        *     businessID: '', //rocessID与businessID选填一个
        * }
        */
        function renderTrace(opt){
            processTrace.render(opt);
        }
        
        /* opt = {
        *     formId:'',//表单id
        *     data:'',//表单数据
        *     callback:function,// 远程保存执行回调
        *     tableType:'', //表单类型
        * }
        */
        
        function save(opt) {
            $.post("/tableDesign/updateTableDetail", {
                data: opt.data,
            }, function(res) {
                res = JSON.parse(res);
                utility.hideLoader();
                if (_.isFunction(opt.callback))
                    opt.callback(res.code);
            });
        }
        /* opt: {
        *    data = [{
        *        digest: '', //摘要
        *        businessID: '', 
        *        recID:'', // 数据记录ID 
        *        tableID:'', // 表单ID
        *        associatedDataTitle: '', //关联数据标题
        *        associatedDataURL: '', //关联数据URL
                 variables: {key: value},
        *    }]
        *    businessType: '', 流程的类型
        *    callback: function(code, dataItem), //回调
        * }
        */
        function startProcess(opt) {
            if (opt.data.length === 0) return;
            utility.showLoader();
            $.getJSON("/workflow/GetFirstAssignees", {
                type: opt.businessType,
            }, function(res) {
                utility.hideLoader();
                if (res.code != 0)
                    return notify.show({
                        title: i18n.t("workprocess.processoperate.getCandidateFail"),
                        text: res.message,
                        type: 'error',
                    });
                showDialog(
                    res.data.users,
                    res.data.preferUsers,
                    res.data.multi,
                    res.data.nodeName, 
                    _.template(i18n.t("workprocess.processoperate.selectNextAssignee"))({actName:res.data.nodeName}),
                    function(result, users, comment) {
                        if (result) _startProcess(opt.data, opt.businessType, users, comment, opt.callback);
                });
            });
        }
        function _startProcess(data, businessType, users, comment, callback) {
            utility.showLoader();
            $.getJSON("/user/curuserinfo", function(res) {
                if(res.code != 0) return notify.show({ text: res.message, type: 'error', });
                var currentUser = res.data;
                if(data[0].tableID === undefined || data[0].recID === undefined)
                    return submit(data);
                data.forEach(function(item){
                    item.businessID = item.recID + "_" + item.tableID;
                });
                getDataVersion(data, function(data){
                    submit(data);
                });
                function submit(items){
                    var toprocess = items.length;
                    items.forEach(function(item){
                        var vars = item.variables ? item.variables : {};
                        vars[constants.processVariables.moduleID] = item.moduleID;
                        vars[constants.processVariables.tableID] = item.tableID;
                        vars[constants.processVariables.recID] = item.recID;
                        vars[constants.processVariables.startDataVersion] = item.versionID;
                        vars[constants.processVariables.associatedDataTitle] = item.associatedDataTitle;
                        vars[constants.processVariables.associatedDataURL] = item.associatedDataURL;
                        $.getJSON("/workflow/startProcess", {
                            tStartInfo: {
                                strUserID: currentUser.userId,
                                strUserName: currentUser.loginName,
                                nUserType: 0
                            },
                            strBusinessID: item.businessID, //formid
                            strBusinessDigest: item.digest,
                            strBusinessType: businessType,
                            tNextAssignee: users,
                            strComment: comment,
                            tProcessVariables: vars,
                        }, function(res) {
                            item.code = res.code;
                            toprocess--;
                            if(toprocess !== 0) return;
                            utility.hideLoader();
                            $.magnificPopup.close();
                            var fail = data.find(function(i){ return i.code != 0; }) !== undefined;
                            notify.show({
                                title: i18n.t(fail ? 'workprocess.commontip.submitFail' : 'workprocess.commontip.submitSuccess'),
                                text: fail ? res.message : '',
                                type: fail ? 'error' : 'success',
                            });
                            if (callback) callback(fail, data);
                        });
                    });
                }
            });
        }

        function getDataVersion(items, callback) {
            var data = [];
            items.forEach(function(i) {
                if(i.tableID != undefined && i.recID != undefined)
                    data.push({
                        tableId: i.tableID,
                        recId: i.recID
                    });
            });
            if(data.length == 0)
                return callback(items);
            $.getJSON('/tabledesign/getRecordVersionId', {
                data: data
            }, function(res) {
                if (res.code != 0) return notify.show({
                    text: res.message,
                    type: 'error'
                });
                var versions = {};
                res.data.forEach(function(i) {
                    versions[i.tableId + "_" + i.recId] = i.versionId;
                });
                items.forEach(function(t) {
                    t.versionID = versions[t.tableID + "_" + t.recID];
                });
                callback(items);
            });
        }


        /* opt: {
        *    data = [{
        *        recID: '',
        *        tableID: '',
        *        moduleID: ''
        *        taskID: '', // 任务id
        *        processID: '', //流程的Id
        *        processType:'', //流程类型
        *    }],
        *    strResultDesc: '', 操作描述
        *    result: '', //处理结果, 用于分支选择
        *    callback: function(code, item), //回调
        *}
        */
        function completeTask(opt) {
            if (opt.data.length === 0) return;
            utility.showLoader();
            $.getJSON("/workflow/getnextassigneesbyoperate", {
                strProcessType: opt.data[0].processType,
                strTaskID: opt.data[0].taskID,
                strOperate: opt.result,
            }, function(res) {
                utility.hideLoader();
                if (res.code != 0)
                    return notify.show({
                        title: i18n.t("workprocess.processoperate.getCandidateFail"),
                        text: res.message,
                        type: 'error',
                    });
                showDialog(
                    res.data.users,
                    res.data.preferUsers,
                    res.data.multi,
                    res.data.nodeName, 
                    _.template(i18n.t("workprocess.processoperate.selectNextAssignee"))({actName:res.data.nodeName}),
                    function(result, users, comment) {
                        if (result) getDataVersion(opt.data, function(item){
                            _completeTask(item, opt.result, users, comment, opt.callback, opt.strResultDesc);
                        });
                });
            });
        }
        function _completeTask(data, result, users, comment, callback, strResultDesc) {
            var toprocess = data.length;
            utility.showLoader();
            data.forEach(function(item) {
                var tv = {};
                tv[constants.processVariables.dataVersion] = item.versionID;
                $.post("/workflow/completepersonaltask", {
                    strProcessInsID: item.processID,
                    strTaskID: item.taskID,
                    strResult: result,
                    strComment: comment,
                    tNextAssignee: users,
                    tTaskVariables: tv,
                    strResultDesc: strResultDesc,
                }, function(res) {
                    item.code = res.code;
                    toprocess--;
                    if(toprocess !== 0) return;
                    utility.hideLoader();
                    $.magnificPopup.close();
                    var fail = data.find(function(i){ return i.code != 0; }) !== undefined;
                    notify.show({
                        title: i18n.t(fail ? 'workprocess.commontip.submitFail' : 'workprocess.commontip.submitSuccess'),
                        text: fail ? res.message : '',
                        type: fail ? 'error' : 'success',
                    });
                    if (callback) callback(fail, data);
                }, 'json');
            });
        }

        /* 撤回已提交但未处理的任务
         *     taskID:'', //任务id
         *     processID:'', //流程的Id
         *     strActID:'',//环节id
         *     callback: function(code),//回调
         */
        function recallTask(processID, taskID, strActID, callback) {
            utility.showLoader();
            $.getJSON("/workflow/recalltask", {
                strProcessInsId: processID,
                strTaskId: taskID,
                strActId: strActID
            } ,function(res){
                utility.hideLoader();
                if (res.code != 0){
                    return notify.show({
                        title: i18n.t("workprocess.commontip.resetFail"),
                        text: res.message,
                        type: 'error',
                    });
                }else{
                    return notify.show({
                        title: i18n.t("workprocess.commontip.resetSuccess"),
                        type: 'success',
                    });
                }
            });
        }

        function showDialog(users, preusers, multi, nodename, title, callback, comment) {
            var $usershow;
            dialog.build({
                title: i18n.t("workprocess.processoperate.tasksubmittitle"),
                content: '<div id="processing-form" style="overflow-y:auto;margin:-15px;padding:15px;"></div>',
                style: "min-height:200px;",
                width: 500,
                leftBtnCallback: function() {
                    $.magnificPopup.close();
                    callback(false);
                },
                rightBtnCallback: function() {
                    var selectedID = [];
                    if (users.length != 0) {
                        var selectedData = [];
                        if ($('#allusers').is(":checked"))
                            selectedData = $usershow.getSelectedUser();
                        else
                            selectedData = tileselect.getSelectedItem();
                        _.each(selectedData, function(item) {
                            selectedID.push(item.id);
                        });
                        if (_.isEmpty(selectedID))
                            return notify.show({
                                title: i18n.t("workprocess.processoperate.emptyselecttip"),
                                type: 'error',
                            });
                        selectedID = selectedID.map(function(i) {
                            return users.find(function(user) {
                                return user.strUserID == i;
                            });
                        });
                    }
                    callback(true, selectedID, $("#comment").val());
                }
            }).show(function(){
                initDialog();
                $('.mfp-wrap').removeAttr('tabindex');
            });
            function initDialog(){
                var html = '<div id="userselect"><label>' + title + '</label>'+
                                '<div style="margin-left:10px"><p style="margin-bottom:5px"><label style="font-weight:600" class="radio-inline"><input type="radio" checked="checked" name="inlineRadioOptions" id="commonusers" value="option1"> ' + i18n.t('workprocess.processoperate.commonuser') + '</label></p>'+
                                '<div id="commonusers-content" style="margin-bottom:5px"></div></div>'+
                                '<div style="margin-left:10px"><p><label style="font-weight:600" class="radio-inline"><input type="radio" name="inlineRadioOptions" id="allusers" value="option2"> ' + i18n.t('workprocess.processoperate.alluser') + '</label></p>'+
                                '<div id="allusers-content" class="form-group mbn hidden">'+
                                    '<input type="text" class="form-control" style="width:100%;height:33px;cursor:text" readonly="readonly" id="usershow">'+
                                '</div></div>'+
                            '</div>'+
                            '<div style="margin-top:15px"><label>' + i18n.t('workprocess.processoperate.comment') + '</label>' +
                            '<textarea id="comment" style="resize: none;width: 100%;height: 150px;border-radius: 2px;"></textarea><div>';
                $("#processing-form").empty().append(html);
                if(users.length == 0)
                    return $("#userselect").hide();
                $.getJSON("/department/listallnoauth", function(res){
                    var preusersData=[];
                    var userData = getUserData(res.data[0], users);
                    _.each(userData.users, function(user) {
                        _.each(preusers, function(item, index) {
                            if (item == user.id)
                                preusersData.push({
                                    id: user.id,
                                    name: user.name
                                })
                        })
                    });
                    if(preusersData.length == 0)
                        preusersData = userData.users;
                    if(userData.users.length == 0)
                        return notify.show({
                            title: i18n.t("workprocess.processoperate.novaliduser"),
                            type: 'error',
                        });
                    var preuseropt = {
                        $container: $("#commonusers-content"),
                        data: preusersData.slice(0, 6),
                        multi: multi === "1"
                    }
                    var alluseropt = {
                        source: [userData.usertree],
                        multi:multi === "1"
                    }
                    tileselect.init(preuseropt);
                    tileselect.setSelectedItem([preusersData[0]]);
                    $usershow = $('#usershow').userPicker(alluseropt);
                    $("#allusers").on("click", function(){
                        $usershow.setSelectedUser(tileselect.getSelectedItem());   
                        $("#commonusers-content").addClass('hidden');
                        $("#allusers-content").removeClass('hidden');
                        setTimeout(function(){
                            $("#usershow").trigger('click');
                        },0)
                    });
                    $("#commonusers").on("click", function() {
                        tileselect.setSelectedItem($usershow.getSelectedUser())
                        $("#commonusers-content").removeClass('hidden');
                        $("#allusers-content").addClass('hidden');
                    });
                });
                if(comment)
                    $('#comment').val(comment);
            }
            function getUserData(usertree, users){
                var data = {
                    usertree:{},
                    users:[]
                };
                data.usertree = userFilter(usertree, users);
                function userFilter(subtree, users) {
                    function isMatch(item) {
                        return users.find(function(user) {
                            return user.strUserID == item.userId;
                        });
                    }
                    if(subtree.children == undefined || subtree.children.length == 0)
                        return;
                    subtree.children = subtree.children.filter(function(item, index) {
                        if (item.userName && isMatch(item)) {
                            data.users.push({
                                id: item.userId.toString(),
                                name: item.userName
                            })
                            return true;
                        } else if (!item.userName) {
                            return userFilter(item, users);
                        } else {
                            return false;
                        }
                    });
                    if (subtree.children.length)
                        return subtree;
                }
                return data;
            }
        }

        return {
            init: init,
            startProcess: startProcess,
            completeTask: completeTask,
            recallTask: recallTask,
            rendTrace: renderTrace,
            save: save,
        };
    }
);