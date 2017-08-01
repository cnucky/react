define("widget/filebatchdownload", [
    'underscore',
    'jquery',
    'nova-notify',
], function(_, $, Notify) {

    var count = 0;

    function filebatchdownload(listData, strName, container) {
        $(container).show();
        count++;
        $(container).html(count + i18n.t('base:workspace.label-countresourceforcompress'));
        $.post('/workspacedir/batchDownload', {
            returnName: strName,
            fileInfo: listData
        }).done(function(rsp) {
            rsp = JSON.parse(rsp);
            if (rsp.code == 0) {
                var alink = document.createElement('a');
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("click", false, false);
                alink.download = rsp.data.fileName;
                alink.href = rsp.data.filePath;
                // console.log(rsp.data.filePath);
                alink.click();
            } else {
                Notify.show({
                    title: i18n.t('base:workspace.alert-failtocompress'),
                    type: "fail",
                });
            }
            count--;
            if (count > 0) {
                $(container).html(count + i18n.t('base:workspace.label-countresourceforcompress'))
            } else {
                $(container).hide();
            }
        });
    }

    return {
        filebatchdownload: filebatchdownload,
    }
})