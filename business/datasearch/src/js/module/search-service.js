/**
 * Created by root on 16-6-25.
 */
registerLocales(require.context('../../locales/datasearch/', false, /\.js/));
define('module/datasearch/datasearch/search-service',
    [
        '../../../../../framework/src/js/module/workprocess/process-operate.js',
        'nova-dialog',
        'nova-notify',
        'utility/jbase64/jbase64'
    ], function (approval,
                 Dialog,
                 Notify) {
        var ConfigSystem = window.__CONF__.config_system;

        function get_translate(name) {
            var options = [];
            if (name == undefined) {
                return options;
            }
            $.ajax({
                url: '/datasearch/datasearch/get_select_options',
                type: 'POST',
                async: false,
                data: {dic_name: name},
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        options = rsp.data;
                    }
                    else {

                    }
                }
            });
            return options;

        }

        function get_exam_flag(func) {
            $.ajax({
                url: '/datasearch/datasearch/get_exam_flag',
                type: 'POST',
                async: true,
                data: {},
                dataType: 'json',
                success: function (exam_flag) {
                    if (typeof func === 'function') {
                        func(exam_flag);
                    }
                }
            });


        }

        /*function get_checkresult_info(submit_param, func) {
         $.ajax({
         url: '/datasearch/datasearch/get_checkresult_info',
         type: 'POST',
         async: true,
         data: submit_param,
         dataType: 'json',
         success: function (rsp) {
         if (rsp.code == 0) {

         if (typeof func === 'function') {
         func(false);
         }

         }
         else if (rsp.code == 11) {
         var notify_message = "";
         $.each(rsp.data, function(){
         if(notify_message == ""){
         notify_message = this.keywordParamList[0].value;
         }
         else{
         notify_message += ", " + this.keywordParamList[0].value;
         }
         });
         notify_message += " 搜索失败!";
         Notify.show({
         title: "有失败的搜索条件!",
         text: notify_message,
         type: "error"
         });
         }
         else if (rsp.code == 12) {
         Notify.show({
         title: "系统资源不足!",
         text: "",
         type: "error"
         });
         }
         else if (rsp.code == 13) {
         var workflows = rsp.data;

         if (workflows.length == 0) {
         Notify.show({
         title: "所选择系统无共同审批流程，请分别提交!",
         text: "",
         type: "error"
         });
         return;
         }

         var businessType = workflows[0].processKey;
         if (typeof func === 'function') {
         func(true, businessType);
         }

         }
         else{
         Notify.show({
         title: i18n.t("datasearch.search-service.checkresult_faild"),
         text: "",
         type: "error"
         });
         }
         }
         });

         }*/

        function submit_task(url, submit_param, func) {
            $.ajax({
                url: url,
                type: 'POST',
                async: true,
                data: submit_param,
                dataType: 'json',
                success: function (rsp) {
                    if (rsp.code == 0) {
                        var task_result = rsp.data;

                        if (typeof func === 'function') {
                            func(task_result);
                        }

                    }
                    else {
                        Notify.show({
                            title: i18n.t("datasearch.search-service.failed"),
                            type: "error"
                        });
                    }
                }
            });
        }

        function start_process(businessID, businessType, digest) {
            approval.startProcess({
                data: [{
                    businessID: businessID,
                    digest: digest
                }],
                businessType: businessType,
                callback: function(fail, data){
                    //window.top.IframeDialog.dismiss();
                }
            });
        }

        function common_submit_task(submit_param, func, framemode, parent_frame_param) {

            submit_param.exam_flag = ConfigSystem.get_exam_flag;

            submit_task("/datasearch/datasearch/search_task_post", submit_param, function (task_result) {

                if (framemode == "modal" || framemode == "panel") {
                    var task_param = {
                        task_id: task_result.taskId,
                        condition: submit_param.search_condition,
                        condition_text: submit_param.task_name,
                        condition_detail_text: submit_param.detail,
                        img: 'task.png'
                    };

                    if(window.parent.location.pathname.indexOf("minddiagram") > -1){
                        window.parent.add_task_node("search-all", i18n.t("datasearch.searchall.js.one_key_search"), "dataprocess/data-process.html", task_param);
                    }
                    else if(framemode == "modal"){
                        var pickup_value = "";
                        if(parent_frame_param.search_code == "lacci"){
                            var laccis = $('#basestation_table').DataTable().data();
                            _.each(laccis, function(lacci){
                                var lacci_item = lacci.lacci.split(',');
                                if(pickup_value == ""){
                                    pickup_value = lacci.carrier + " " + lacci_item[0] + " " + lacci_item[1];
                                }
                                else{
                                    pickup_value += "\n" + lacci.carrier + " " + lacci_item[0] + " " + lacci_item[1];
                                }
                            });

                        }
                        else{
                            pickup_value = $("#txtConditions").val();
                        }
                        //window.parent.add_pickup_node_and_task_node(task_param, pickup_value);

                        var pickup_param = {
                            task_id: parent_frame_param.pickup_taskid,
                            search_code: parent_frame_param.pickup_code,
                            search_code_name: parent_frame_param.search_code_name,
                            conditions: pickup_value

                        };

                        var param_data = {
                            task_type: "search-all",
                            task_name: i18n.t("datasearch.searchall.js.one_key_search"),
                            url: "dataprocess/data-process.html",
                            pickup_param: pickup_param,
                            task_param: task_param
                        };

                        $.ajax({
                            url: '/minddiagram/minddiagram/add_pickup_and_task_node',
                            type: 'POST',
                            async: true,
                            data: param_data,
                            dataType: 'json',
                            success: function (res) {
                                if (res.code == 0) {
                                    Notify.show({
                                        title: i18n.t("datasearch.searchall.notify.pick-up-success"),
                                        text: res.message,
                                        type: "success"
                                    });
                                }
                                else if(res.code == 9){
                                    Notify.show({
                                        title: i18n.t("datasearch.searchall.notify.no-related-diagram"),
                                        text: res.message,
                                        type: "warning"
                                    });
                                }
                                else {
                                    Notify.show({
                                        title: i18n.t("datasearch.searchall.notify.pick-up-faild"),
                                        text: res.message,
                                        type: "error"
                                    });
                                }
                            }
                        });
                    }

                }

                var task_id = task_result.taskId;
                var check_pass = task_result.checkPass;

                if (check_pass == "true") {
                    Notify.show({
                        title: i18n.t("datasearch.search-service.succeeded"),
                        type: "success"
                    });

                    if (typeof func === 'function') {
                        func(task_id);
                    }

                    if (submit_param.open_window) {
                        window.open('../dataprocess/data-process.html?taskId=' + BASE64.encoder(task_id + "") + '&taskName=' + BASE64.encoder(submit_param.task_name));
                    }
                }
                else {
                    var need_exam = task_result.needExam;

                    if (need_exam == "true") {
                        Notify.show({
                            title: i18n.t("datasearch.search-service.succeeded"),
                            type: "success"
                        });

                        if (typeof func === 'function') {
                            func(task_id, submit_param.exam_flag);
                        }

                        if (task_result.examInfos.length == 0) {
                            Notify.show({
                                title: i18n.t("datasearch.search-service.examinfos_failed"),
                                text: "",
                                type: "error"
                            });
                            return;
                        }

                        var subtaskid = task_result.examInfos[0].subtaskId;
                        var businessType = task_result.examInfos[0].processFlows[0].processKey;

                        if (framemode == "modal" || framemode == "panel") {
                            approval.init(window.top.$, window.top.Dialog, window.top.Notify, window.top.bootbox);
                        }
                        start_process(subtaskid, businessType, submit_param.detail);

                    }
                    else {
                        var failed_info = task_result.failedInfo;
                        if (failed_info.failedClueList && failed_info.failedClueList.length > 0) {
                            Notify.show({
                                title: i18n.t("datasearch.search-service.failed_cluelist"),
                                text: "",
                                type: "error"
                            });
                        }
                        else if (failed_info.failedResourceList && failed_info.failedResourceList.length > 0) {
                            Notify.show({
                                title: i18n.t("datasearch.search-service.failed_resourcelist"),
                                text: "",
                                type: "error"
                            });
                        }

                    }
                }


            });

        }

        function onekey_submit_task(submit_param, func) {
            submit_param = $.extend(submit_param, {
                search_type: "onekey_search",
                event_type_desc: i18n.t("datasearch.onekey-search")
            });

            console.log(JSON.stringify(submit_param, null, 2));

            common_submit_task(submit_param, func);

        }

        function modal_onekey_submit_task(submit_param, parent_frame_param, func) {
            submit_param = $.extend(submit_param, {
                search_type: "onekey_search",
                event_type_desc: i18n.t("datasearch.onekey-search")
            });

            console.log(JSON.stringify(submit_param, null, 2));

            common_submit_task(submit_param, func, "modal", parent_frame_param);

        }

        function panel_onekey_submit_task(submit_param, parent_frame_param, func) {
            submit_param = $.extend(submit_param, {
                search_type: "onekey_search",
                event_type_desc: i18n.t("datasearch.onekey-search")
            });

            console.log(JSON.stringify(submit_param, null, 2));

            common_submit_task(submit_param, func, "panel", parent_frame_param);

        }

        function file_submit_task(submit_param, func) {
            submit_param = $.extend(submit_param, {
                search_type: "file_search",
                event_type_desc: i18n.t("datasearch.file-search")
            });

            console.log(JSON.stringify(submit_param, null, 2));

            common_submit_task(submit_param, func);

        }

        function sort_submit_task(submit_param, func) {
            submit_param = $.extend(submit_param, {
                search_type: "sort_search",
                event_type_desc: i18n.t("datasearch.sort-search")
            });

            console.log(JSON.stringify(submit_param, null, 2));

            common_submit_task(submit_param, func);


        }

        function template_submit_task(submit_param, func) {
            submit_param = $.extend(submit_param, {
                search_type: "template_search",
                event_type_desc: i18n.t("datasearch.template-search")
            });

            console.log(JSON.stringify(submit_param, null, 2));

            common_submit_task(submit_param, func);

        }

        function system_submit_task(submit_param, func) {
            submit_param = $.extend(submit_param, {
                search_type: "system_search"
            });

            console.log(JSON.stringify(submit_param, null, 2));

            common_submit_task(submit_param, func);


        }


        return {
            get_translate: get_translate,
            onekey_submit_task: onekey_submit_task,
            modal_onekey_submit_task: modal_onekey_submit_task,
            panel_onekey_submit_task: panel_onekey_submit_task,
            file_submit_task: file_submit_task,
            sort_submit_task: sort_submit_task,
            template_submit_task: template_submit_task,
            system_submit_task: system_submit_task
        };
    });