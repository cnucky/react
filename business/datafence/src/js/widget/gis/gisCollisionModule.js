/**
 * Created by root on 11/21/16.
 */
define("module/gis/gisCollisionModule", [
    '../../tpl/gis/tpl-collision-box',
    '../../module/datafence/gis-collision-condition',
    // 'widget/collision-condition-sup',
    '../../module/collision/collision-result',
    '../../widget/save-task',
    'nova-notify',
    'nova-utils',
    // '../../../../config',
    "jquery",
    "underscore",
    'utility/select2/select2',
    'utility/select2/i18n/zh-CN',
    'utility/multiselect/bootstrap-multiselect'
], function(tpl_collision_box, ConditionReact, Result, SaveTask, Notify, Util) {
    var appConfig = window.__CONF__.business.datafence;
    var _options;
    var userID;
    var dataTypeList = [];
    var dataTypeMap = {};
    var submitDataType = {};
    tpl_collision_box = _.template(tpl_collision_box);

    var dataSource;
    var semanticDef;
    var gisDataSource = [];
    var rootID;
    var fenceTreeSource;

    var task = {
        analysisType: 113
    };

    function gisCollisionBox(options) {
        _options = options;
    }

    function loadPageData() {
        var userId = Util.getCookiekey('userid');
        $.ajaxSettings.async = false;
        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: appConfig['gis-server'],
                path: '/GisService/enclosure/getRootDirectoryID',
                userID: userId
            },
            async: false,
            dataType: 'text',
            success: function(result) {
                rootID = result
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert1'))
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert1'),
                    type: "warning"
                });
            }
        });

        $.ajax({
            type: 'GET',
            url: '/gisapi/gisGetQuery',
            data: {
                hostname: appConfig['gis-server'],
                path: '/GisService/enclosure/GetAllEnclosure',
                dirId: rootID
            },
            async: false,
            dataType: 'text',
            success: function(result) {
                // var data = '[{"title":"' + i18n.t('gismodule.enclosureManage.dirName') + '","folder":true,"lazy":false,"icon":"branch_16_p.png","key":"' + rootID + '","children":' + result + '}]';
                fenceTreeSource = eval(result);
            },
            error: function(result) {
                // alert(i18n.t('gismodule.enclosureManage.alert11'));
                Notify.show({
                    title: i18n.t('gismodule.enclosureManage.alert11'),
                    type: "warning"
                });
            }
        });
        $.ajaxSettings.async = true;

        modeChosen = "high";
        var dsDefer = Q.defer();
        $.getJSON('/datafence/collision/listdatasource', function(rsp) {
            if (rsp.code == 0) {
                dsDefer.resolve(rsp.data);
            } else {
                dsDefer.reject(rsp.data);
            }
        });
        var defDefer = Q.defer();
        $.getJSON('/datafence/collision/getsemanticdef', function(rsp) {
            if (rsp.code == 0) {
                defDefer.resolve(rsp.data);
            } else {
                defDefer.reject(rsp.data);
            }
        });
        var gisDefer = Q.defer();
        $.getJSON('/smartquery/smartquery/getGisDataType', function(rsp) {
            if (rsp.code == 0) {
                gisDefer.resolve(rsp.data);
            } else {
                gisDefer.reject(rsp.data);
            }
        })
        Q.all([dsDefer.promise, defDefer.promise, gisDefer.promise])
            .spread(function(datasource, semantic, gisData) {
                dataSource = datasource;
                semanticDef = semantic;
                // gisDataSource = gisData;
                for (var i = 0; i < gisData.length; i++) {
                    var text = gisData[i].centerCode + String(gisData[i].typeId);
                    gisDataSource.push(text);
                }
                // gisDataSource = gisData;
                task.semanticId = [];
                task.semanticId.push(semanticDef[0].semanticId);

                // 普通组件
                // Condition.init(task, dataSource, semanticDef, selectDataSource, selectTypeAndSemantic);

                // React 组件、普通组件混合

                // ConditionReact.renderMixed(
                //     document.getElementById('collision-type'),
                //     document.getElementById('collision-semantic'),
                //     semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource, selectMode);

                ConditionReact.renderMixed(
                    document.getElementById('collision-type'),
                    document.getElementById('collision-semantic'),
                    semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource, gisDataSource, fenceTreeSource, rootID
                );

                // selectTypeAndSemantic(task.analysisType, task.semanticId);
                selectTypeAndSemantic(task.analysisType);
                loadTask();
            })
            .catch(function() {
                hideLoader();
                // Notify.show({
                //     title: '服务器数据加载失败',
                //     type: 'danger'
                // });
            });
    }

    function loadTask() {
        task.id = Util.getURLParameter('taskid') || undefined;
        task.analysisType = Util.getURLParameter('tasktype') || 113;
        task.taskname = Util.getURLParameter('taskname') || undefined;
        if (task.id && task.analysisType != 111) {
            task.saved = true;
            $.getJSON('/datafence/datafence/gettaskBaseCond', {
                taskId: task.id
            }, function(rsp) {
                if (rsp.code == 0) {
                    hideLoader();

                    task.sematicMap = new Object();
                    task.selectedDataSource = [];

                    var params = _.map(rsp.data.srcDataTypes, function(data) {
                        return {
                            centerCode: data.dataType.centerCode,
                            typeId: data.dataType.typeId,
                            zoneId: data.dataType.zoneId
                        };
                    })

                    $.getJSON('/datafence/collision/batchQueryDataType', {
                        params: params
                    }, function(rsp2) {
                        hideLoader();

                        if (rsp2.code == 0) {
                            var data = rsp2.data;
                            _.each(rsp.data.srcDataTypes, function(typeItem) {
                                // var key = item.inputNode;
                                var key = typeItem.dataType.centerCode + typeItem.dataType.typeId + typeItem.dataType.zoneId;
                                var ds = _.find(rsp2.data, function(type) {
                                    return type.centerCode + type.typeId + type.zoneId == key;
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
                                    ds.srcTypeId = typeItem.dataType.srcTypeId;
                                    ds.cond = typeItem.baseCond;
                                    ds.index = typeItem.index;
                                    ds.fenceId = [];
                                    ds.selectedQueryFields = [];
                                    ds.fenceName = [];
                                    if (typeItem.fence) {
                                        ds.fenceId = typeItem.fence.fenceId;
                                        ds.selectedQueryFields = typeItem.fence.queryField;
                                        ds.fenceName = typeItem.fence.fenceName;
                                    }
                                    task.selectedDataSource.push(ds);
                                } else {
                                    Notify.simpleNotify('错误', '数据源不存在：' + key, 'error');
                                }
                            });
                            _.each(rsp.data.output, function(item) {
                                var id = parseInt(item.codeUsage, 10);
                                if (id < 0) {
                                    var temp = {};
                                    temp.id = id;
                                    temp.name = item.displayName;
                                    task.sematicMap[-id] = temp;
                                }
                            });
                            task.semanticId = [];
                            _.each(rsp.data.semanticId, sitem => {
                                task.semanticId.push(parseInt(sitem, 10));
                            });
                            task.analysisType = rsp.data.type || task.analysisType;
                            // 还原
                            // if(modeChosen == "high")
                            // {
                            // var s = task.semanticId;
                            // task.semanticId = [];
                            // task.semanticId.push(s);

                            ConditionReact.renderMixed(
                                document.getElementById('collision-type'),
                                document.getElementById('collision-semantic'),
                                semanticDef, dataSource, task, selectTypeAndSemantic, selectDataSource, gisDataSource, fenceTreeSource, rootID);
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
                            task.loading = true;
                            Result.showProgress(0);
                            setTimeout(function() {
                                Result.loadResult(task, function() {}, function(err) {
                                    Notify.simpleNotify('错误', '查询结果失败' + (err ? ':' + err : ''), 'error');
                                });
                            }, 1000);

                            if (task.taskname) {
                                setPageDescription('当前任务：<b>' + task.taskname + '</b>', true);
                            }
                        } else {
                            Notify.simpleNotify('错误', rsp2.message, 'error');
                        }
                    })
                }
            });
        } else {
            task.id =  undefined;
            task.analysisType = 113;
            task.taskname = undefined;
            hideLoader();
        }
    }


    function findDataSource(key) {
        var ds = findDSInTree(key, dataSource.sysTree);
        if (!ds) {
            ds = findDSInTree(key, dataSource.personalTree)
        }
        var datasource = {};
        $.extend(true, datasource, ds);
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
            //task.selectedDataSource[key] = ds;
            task.selectedDataSource.push(ds);
        } else {
            //delete task.selectedDataSource[key];
            var source = _.filter(task.selectedDataSource, function(item) {
                return item.key != key;
            });
            task.selectedDataSource = source;
        }

        var captionArray = [];
        _.each(task.selectedDataSource, function(item) {
            captionArray.push(item.caption);
        });
    }

    // function selectTypeAndSemantic(type, semanticId) {
    function selectTypeAndSemantic(type) {
        // if (semanticId) {
        //     var semantic = _.find(semanticDef, function(item) {
        //         return item.semanticId == semanticId;
        //     });
        // }
    }

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
        var taskDetail = ConditionReact.constructTaskDetailMixed();

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
            submitTask(data.title, data.dirid, data.desc).then(function() {
                updateTaskTitle(data.title);
                task.saved = true;
            }).catch(function(err) {
                if (err) {
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

        var analysisType = {
            113: '交集分析',
            114: '并集分析',
            115: '差集分析'
        }
        var logArr = [];
        /*      var semanticMap = {};
        _.each(task.selectedDataSource, function(ds, index) {
            _.each(ds.semantic, function(item) {
                semanticMap[item.semanticName] = _.pluck(item.fieldList, 'fieldName');
            })

        })*/
        logArr.push('分析类型:' + analysisType[task.analysisType]);

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
            _.each(ds.selectedFields, function(sf) {

                logArr.push('碰撞字段:' + fieldMap[sf.field])
            })
        })

        return logArr.join('\r\n');
    }

    // 提交任务
    function submitTask(taskName, dirId, taskDesc) {
        var submitDefer = Q.defer();

        var taskDetail = ConditionReact.constructTaskDetailMixed();

        // if(modeChosen == "low")
        // {
        //     taskDetail = ConditionReact.constructTaskDetailMixed();
        // }

        $.post("/datafence/datafence/submitcollisiontask", {
            name: taskName,
            dirid: dirId,
            taskdesc: taskDesc,
            mode: 1,
            tasktype: task.analysisType,
            priority: 1,
            taskdetail: taskDetail.detail,
            condStr: makeLogStr(taskDetail)
        }, function(rsp) {
            if (rsp.code == 0) {
                task.id = rsp.data;
                submitDefer.resolve();
                task.loading = true;
                // showLoading();
                Result.showProgress(0);
                setTimeout(function() {
                    Result.loadResult(task, function() {}, function(err) {
                        Notify.simpleNotify('错误', '查询结果失败' + (err ? ':' + err : ''), 'error');
                    });
                    // hideLoading();
                }, 1000);
            } else {
                submitDefer.reject(rsp.message);
            }
        }, 'json');

        return submitDefer.promise;
    }

    function showLoading() {
        $("#pathBox").show();
        $("#pathLoadingBox").show();
        $("#collisionBox").hide();
    }

    function hideLoading() {
        $("#pathBox").hide();
        $("#pathLoadingBox").hide();
        $("#collisionBox").show();
    }

    gisCollisionBox.prototype = {
        _initialize: function() {
            this._appendBox()
            this._initPanel();
            // this.removeFocus();
            this._resizeHeight();
        },
        _initPanel: function() {
            $('#collisionBox').append(tpl_collision_box);
            loadPageData();

            $("#btn-add").on('click', function() {
                $('#datasource-panel').collapse('show');
            });

            $(".btn-collision-run").on('click', function() {
                if (!(task.loading)) {
                    run();
                    $("#result-toggle").hide();
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
            $(document).on("click", ".fields-control", function() {
                if ($(this).html() == "收起") {
                    $(this).html("展开");
                } else {
                    $(this).html("收起");
                }
            })
            $(document).on("click", "#closeOffBox", function() {
                $("#collisionBox").hide();
            })



        },

        _appendBox: function() {

            $('#boxes .RefuseMove').append("<div class='lightblue-scoll-bar'><div id='collisionBox' style='background:white'></div></div>");
        },

        //针对小屏幕显示器，结果高度需要限制。在结果可见之后才能调用此函数
        _resizeHeight: function() {
            var panelHeight = $(window).innerHeight() - $('#toolbar').offset().top - 50;
            var collisionHeight = panelHeight - 100;
            console.log(collisionHeight)
            $('#collisionBox').css({
                "max-height": collisionHeight + 'px'
            });
        },

        showCollisionBox: function() {
            $("#collisionBox").show();
        }
    }


    return {
        gisCollisionBox: gisCollisionBox,
    }
});