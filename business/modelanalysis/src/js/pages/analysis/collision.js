initLocales(require.context('../../../locales/collision', false, /\.js/), 'zh');
registerLocales(require.context('../../../locales/operator', false, /\.js/), 'operator');
require([
    '../../module/collision/collision-nodes-in-circle',
    '../../widget/save-task',
    '../../tpl/collision/add-data-source',
    'nova-dialog',
    'nova-notify',
    'nova-alert',
    'utility/loaders',
    'jquery',
    'underscore',
    'q',
    '../../module/collision/collision-condition-sup',
    '../../module/collision/collision-result',
    'nova-utils',
    'fancytree-all'
], function(NodesCircle, SaveTask, addSource, Dialog, Notify, Alert, loaders, $, _, Q, ConditionReactSup, Result, Util) {
    var dataSource;
    var semanticDef;
    var modeChosen;

    var task = {
        analysisType: 103
    };

    function resizeCanvas() {
        var height =$(window).height() - $('#network-container').offset().top-5;//蜜汁高度差，如果不减去5，会超出屏幕然后出现滚动条
        $('#drawing').height(height);
        $('#thecanvas').height(height);
        $('#thecanvas').width($('#drawing').width());
        $('#thecanvas').attr('width', $('#drawing').width());
        $('#thecanvas').attr('height', height);

        NodesCircle.createoCanvas();
    }
    function loadPageData() {

        modeChosen = "high";
        var dsDefer = Q.defer();
        $.getJSON('/modelanalysis/collision/listdatasource', function(rsp) {
            if (rsp.code == 0) {
                dsDefer.resolve(rsp.data);
            } else {
                dsDefer.reject(rsp.data);
            }
        });
        var defDefer = Q.defer();
        $.getJSON('/modelanalysis/collision/getsemanticdef', function(rsp) {
            if (rsp.code == 0) {
                defDefer.resolve(rsp.data);
            } else {
                defDefer.reject(rsp.data);
            }
        });
        Q.all([dsDefer.promise, defDefer.promise])
            .spread(function(datasource, semantic) {
                dataSource = datasource;
                semanticDef = semantic;
                task.semanticId = [];
                task.semanticId.push(semanticDef[0].semanticId);

                // 普通组件
                // Condition.init(task, dataSource, semanticDef, selectDataSource, selectTypeAndSemantic);

                // React 组件、普通组件混合

                // ConditionReact.renderMixed(
                //     document.getElementById('collision-type'),
                //     document.getElementById('collision-semantic'),
                //     semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource, selectMode);

                ConditionReactSup.renderMixed(
                    document.getElementById('collision-type'),
                    document.getElementById('collision-semantic'),
                    semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource
                    );

                // selectTypeAndSemantic(task.analysisType, task.semanticId);
                selectTypeAndSemantic(task.analysisType);
                loadTask();
            })
            .catch(function() {
                hideLoader();
                Notify.show({
                    title: '服务器数据加载失败',
                    type: 'danger'
                });
            });
    }

    function loadTask() {
        task.id = Util.getURLParameter('taskid') || undefined;
        task.analysisType = Util.getURLParameter('tasktype') || 103;
        task.taskname = Util.getURLParameter('taskname') || undefined;
        if (task.id) {
            task.saved = true;
            $.getJSON('/modelanalysis/collision/gettaskinfo', {
                taskid: task.id
            }, function(rsp) {
                if (rsp.code == 0) {
                    hideLoader();

                    task.sematicMap = new Object();
                    task.selectedDataSource = [];

                    var params = _.map(rsp.data.srcDataTypes, function(data){
                        return {
                            centerCode: data.dataType.centerCode,
                            typeId: data.dataType.typeId,
                            zoneId: data.dataType.zoneId
                        };
                    })

                    $.getJSON('/modelanalysis/collision/batchQueryDataType', {
                        params: params
                    }, function(rsp2) {
                        hideLoader();

                        if (rsp2.code == 0) {
                            var data = rsp2.data;
                            _.each(rsp.data.srcDataTypes, function(typeItem) {
                                // var key = item.inputNode;
                                var key = typeItem.dataType.centerCode+typeItem.dataType.typeId+typeItem.dataType.zoneId;
                                var ds = _.find(rsp2.data, function (type) {
                                    return type.centerCode+type.typeId+type.zoneId == key;
                                });
                                if (ds) {
                                    //构建唯一命名
                                    var newCaption = ds.caption;
                                    var count = 1;
                                    _.each(task.selectedDataSource, function(item) {
                                        if (item.caption == newCaption) {
                                            isRepeated = true;
                                            newCaption = ds.caption + count;
                                            count++;
                                        }
                                    })
                                    ds.caption = newCaption;
                                    ds.key = typeItem.inputNode;
                                    ds.selectedFields = typeItem.fieldList;
                                    ds.index = typeItem.index;
                                    ds.cond = typeItem.cond;
                                    task.selectedDataSource.push(ds);
                                } else {
                                    Notify.simpleNotify('错误', '数据源不存在：' + key, 'error');
                                }
                            });
                            _.each(rsp.data.output,function(item){
                                var id = parseInt(item.codeUsage, 10);
                                if (id<0) {
                                    var temp = {};
                                    temp.id = id;
                                    temp.name = item.displayName;
                                    task.sematicMap[-id] = temp;
                                }
                            });
                            task.semanticId = [];
                            _.each(rsp.data.semanticId,sitem=>{
                                task.semanticId.push(parseInt(sitem, 10));
                            });
                            task.analysisType = rsp.data.type || task.analysisType;
                            // 还原
                            // if(modeChosen == "high")
                            // {
                            // var s = task.semanticId;
                            // task.semanticId = [];
                            // task.semanticId.push(s);

                            ConditionReactSup.renderMixed(
                                document.getElementById('collision-type'),
                                document.getElementById('collision-semantic'),
                                semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource);
                            // }
                            // else
                            // {
                            //     ConditionReact.renderMixed(
                            //     document.getElementById('collision-type'),
                            //     document.getElementById('collision-semantic'),
                            //     semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource , selectMode);
                            // }
                            // selectTypeAndSemantic(task.analysisType, task.semanticId);
                            selectTypeAndSemantic(task.analysisType);
                            var captionArray = [];
                            _.each(task.selectedDataSource, function(item) {
                                captionArray.push(item.caption);
                            });
                            NodesCircle.setDataSource(_.size(captionArray), captionArray);
                            //加载
                            NodesCircle.animation();
                            task.loading = true;
                            Result.showProgress(0);
                            setTimeout(function() {
                                Result.loadResult(task, function() {
                                    NodesCircle.reverseAnimation();
                                }, function(err) {
                                    NodesCircle.reverseAnimation();
                                    Notify.simpleNotify('错误', '查询结果失败' + (err ? ':' + err : ''), 'error');
                                });
                            }, 1000);

                            if (task.taskname) {
                                setPageDescription('当前任务：<b>' + task.taskname + '</b>', true);
                            }
                        }
                        else{
                            Notify.simpleNotify('错误', rsp2.message, 'error');
                        }
                    })
                }
            });
        } else {
            hideLoader();
        }
    }

    function findDataSource(key) {
        var ds = findDSInTree(key, dataSource.sysTree);
        if (!ds) {
            ds = findDSInTree(key, dataSource.personalTree)
        }
        var datasource = {};
        $.extend(true,datasource,ds);
        return datasource;

    }

    function findDSInTree(key, array) {
        if (!_.isEmpty(array)) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].key == key) {
                    return array[i];
                } else {
                    var rlt = findDSInTree(key, array[i].children);
                    if (rlt) {
                        return rlt;
                    }
                }
            }
        }
        return undefined;
    }

    function selectDataSource(key, ds, selected) {
        task.selectedDataSource = task.selectedDataSource || [];
        if (selected) {
            ds.key = key;
            task.selectedDataSource.push(ds);
        } else {
            // delete task.selectedDataSource[key];
            // var data = _.filter(task.selectedDataSource,ditem=>{
            //     return ditem.key == key;
            // });
            // delete data;
            task.selectedDataSource = _.filter(task.selectedDataSource,ditem=>{
                                                    return ditem.key != key;
                                                });
        }

        var captionArray = [];
        _.each(task.selectedDataSource, function(item) {
            captionArray.push(item.caption);
        });
        NodesCircle.setDataSource(_.size(captionArray), captionArray);
    }

    // function selectTypeAndSemantic(type, semanticId) {
    function selectTypeAndSemantic(type) {
        // if (semanticId) {
        //     var semantic = _.find(semanticDef, function(item) {
        //         return item.semanticId == semanticId;
        //     });
            // NodesCircle.setTypeDataSource(type, semantic.semanticName);
            NodesCircle.setTypeDataSource(type);
        // }
    }

    // function selectMode(mode){
    //     if(mode == "high")
    //     {
    //         modeChosen = "low";
    //         task.semanticId = semanticDef[0].semanticId;
    //         ConditionReact.renderMixed(
    //                 document.getElementById('collision-type'),
    //                 document.getElementById('collision-semantic'),
    //                 semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource , selectMode);
    //     }
    //     else{
    //         modeChosen = "high";
    //         task.semanticId = [];
    //         task.semanticId.push(semanticDef[0].semanticId);

    //         ConditionReactSup.renderMixed(
    //             document.getElementById('collision-type'),
    //             document.getElementById('collision-semantic'),
    //             semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource , selectMode);
    //     }
    //     selectTypeAndSemantic(task.analysisType, task.semanticId);
    //     loadTask();
    // }

    function updateTaskTitle(title) {
        task.title = title;
        $("#task-title").html(title);
    }

    function run() {

        if ((!task.selectedDataSource) || task.selectedDataSource.length < 2) {
            Notify.show({
                title: "至少要选择两个碰撞数据源",
                type: "warning"
            });
            return;
        }
        var emptyField = _.find(task.selectedDataSource, function(ds) {
            return _.isEmpty(ds.selectedFields);
        });
        if (emptyField) {
            Notify.show({
                title: "'" + emptyField.caption + "'未选择碰撞字段",
                type: "warning"
            });
            return;
        }

        // var taskDetail = ConditionReact.constructTaskDetailMixed();
        var taskDetail = ConditionReactSup.constructTaskDetailMixed();

        // if(modeChosen == "low")
        // {
        //     taskDetail = ConditionReact.constructTaskDetailMixed();
        // }

        if (!taskDetail.detail) {
            Notify.show({
                title: taskDetail.message,
                type: 'warning'
            });
            return;
        }
        // 保存任务
        // if (!task.saved) {
        SaveTask.buildSaveDialog(function(data) {
            submitTask(data.title, data.dirid,data.desc).then(function() {
                updateTaskTitle(data.title);
                task.saved = true;
            }).catch(function(err){
                if(err){
                    Notify.show({
                            title: "提交失败",
                            text: err,
                            type: "error"
                        });
                }
            });
        });
        // } else {
        //     submitTask();
        // }
    }

    function makeLogStr(taskDetail) {

        var analysisType ={
            103:'交集分析',
            104:'并集分析',
            105:'差集分析'
        }
        var logArr = [];
  /*      var semanticMap = {};
        _.each(task.selectedDataSource, function(ds, index) {
            _.each(ds.semantic, function(item) {
                semanticMap[item.semanticName] = _.pluck(item.fieldList, 'fieldName');
            })

        })*/
        logArr.push('分析类型:'+analysisType[task.analysisType]);
        _.each(task.selectedDataSource, function(ds, index) {

            var fieldMap = {};
            var fieldList = _.pluck(ds.semantic, 'fieldList');
            _.each(fieldList, function(field) {
                _.each(field, function(f) {
                    fieldMap[f.fieldName] = f.caption;
                })
            })

            logArr.push('数据源:' + ds.caption);
            //logArr.push('碰撞语义:' + )
            _.each(ds.selectedFields,function(sf){

                 logArr.push('碰撞字段:' + fieldMap[sf.field])
            })
        })

        return logArr.join('\r\n');
    }

    // 提交任务
    function submitTask(taskName, dirId, taskDesc) {
        var submitDefer = Q.defer();

        NodesCircle.animation();

        var taskDetail = ConditionReactSup.constructTaskDetailMixed();

        // if(modeChosen == "low")
        // {
        //     taskDetail = ConditionReact.constructTaskDetailMixed();
        // }

        $("#result-toggle").hide()
        $.post("/modelanalysis/collision/submittask", {
            name: taskName,
            dirid: dirId,
            taskdesc: taskDesc,
            mode: 1,
            tasktype: task.analysisType,
            priority: 1,
            taskdetail: taskDetail.detail,
            condStr:makeLogStr(taskDetail)
        }, function(rsp) {
            if (rsp.code == 0) {
                task.id = rsp.data;
                submitDefer.resolve();
                task.loading = true;
                Result.showProgress(0);
                setTimeout(function() {
                    Result.loadResult(task, function() {
                        NodesCircle.reverseAnimation();
                    }, function(err) {
                        NodesCircle.reverseAnimation();
                        Notify.simpleNotify('错误', '查询结果失败' + (err ? ':' + err : ''), 'error');
                    });
                }, 1000);
            } else {
                NodesCircle.reverseAnimation();
                submitDefer.reject(rsp.message);
            }
        }, 'json');

        return submitDefer.promise;
    }

    // bind resize events
    (function() {
        $(window).on('nv-resize resize', resizeCanvas);
        resizeCanvas();
    })();

    loadPageData();

    $("#btn-add").on('click', function() {
        $('#datasource-panel').collapse('show');
    });

    $(".btn-collision-run").on('click', function() {
        if (!(task.loading)) {
            run();
        }
    });

    $("#result-toggle").click(function() {
        if ($("#result-toggle").html() == "收起结果") {
            $("#result-toggle").html("显示结果");
        } else {
            $("#result-toggle").html("收起结果");
        }
        $("#collision-condition").fadeToggle();
        $("#collision-result").fadeToggle();
    })
    //控制条件模块
    $(document).on("click",".fields-control",function() {
        if ($(this).html() == "收起") {
            $(this).html("展开");
        } else {
            $(this).html("收起");
        }
    })
});