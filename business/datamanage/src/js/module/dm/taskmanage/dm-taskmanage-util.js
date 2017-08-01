define([], function () {
    //通过传来的loadstate数值判断任务状态
    function getTaskype(taskType) {
        var batchState = "";
        switch (taskType) {
            case 1:
                batchState = "导入任务";
                break;
            case 2:
                batchState = "对接任务";
                break;
            case 3:
                batchState = "复合对接";
                break;
            case 4:
                batchState = "非结构化导入";
                break;
            case 5:
                batchState = "非结构化对接";
                break;
            case 6:
                batchState = "数据库抽取";
                break;
            default:
                batchState = "";
                break;
        }
        return batchState;
    }

    //通过传来的loadState返回任务状态
    function getloadState(loadState) {
        var batchState = "";
        switch (loadState) {
            case 1:
                batchState = "导入成功";
                break;
            case 2:
                batchState = "部分成功";
                break;
            case 3:
                batchState = "待导入";
                break;
            case 4:
                batchState = "失败";
                break;
            case 5:
                batchState = "导入中";
                break;
            case 6:
                batchState = "暂停";
                break;
            case 7:
                batchState = "停止";
                break;
            case 9:
                batchState = "预处理完成";
                break;
            case 10:
                batchState = "删除中";
                break;
            case 11:
                batchState = "删除失败";
                break;
            default:
                batchState = "未知状态";
                break;
        }
        return batchState;
    }

    //根据任务状态设置任务按钮的状态
    function setButtonStat(taskState) {
        $('#btn-copy-loadtask').removeClass('disabled');
        switch (taskState) {
            case "导入中": //running
                $('#btn-begin-loadtask').addClass('disabled');
                $('#btn-suspend-loadtask').removeClass('disabled');
                $('#btn-stop-loadtask').removeClass('disabled');
                $('#btn-delete-loadtask').addClass('disabled');
                break;
            case "暂停": //suspend
                $('#btn-begin-loadtask').removeClass('disabled');
                $('#btn-suspend-loadtask').addClass('disabled');
                $('#btn-stop-loadtask').removeClass('disabled');
                $('#btn-delete-loadtask').addClass('disabled');
                break;
            case "停止": //stop
                $('#btn-begin-loadtask').addClass('disabled');
                $('#btn-suspend-loadtask').addClass('disabled');
                $('#btn-stop-loadtask').addClass('disabled');
                $('#btn-delete-loadtask').removeClass('disabled');
                break;
            case "待导入":
                $('#btn-begin-loadtask').addClass('disabled');
                $('#btn-suspend-loadtask').removeClass('disabled');
                $('#btn-stop-loadtask').removeClass('disabled');
                $('#btn-delete-loadtask').addClass('disabled');
                break;
            default:
                $('#btn-begin-loadtask').addClass('disabled');
                $('#btn-suspend-loadtask').addClass('disabled');
                $('#btn-stop-loadtask').addClass('disabled');
                $('#btn-delete-loadtask').removeClass('disabled');
                break;
        }
    }

    function setViewdataBtnStat(counts) {
        //$('#btn-viewdata-task').addClass('disabled');
        if (counts > 0)
            $('#btn-viewdata-task').removeClass('disabled');
        else
            $('#btn-viewdata-task').addClass('disabled');
    }

    return {
        getTaskype: getTaskype,
        getloadState: getloadState,
        setButtonStat: setButtonStat,
        setViewdataBtnStat: setViewdataBtnStat,
    }

});
