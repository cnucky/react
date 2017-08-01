define([], function(){
    var processVariables = {
        moduleID: 'moduleId',
        tableID: 'tableId',
        recID: 'recId',
        startDataVersion: 'startDataVersion',
        dataVersion: 'dataVersion',
        associatedDataTitle: 'associatedDataTitle',
        associatedDataURL: 'associatedDataURL',
    };
    var dataTable = {
        "sProcessing": i18n.t("workprocess.datatable.sProcessing"),
        "sLengthMenu": i18n.t("workprocess.datatable.sLengthMenu"),
        "sZeroRecords": i18n.t("workprocess.datatable.sZeroRecords"),
        "sInfo": i18n.t("workprocess.datatable.sInfo"),
        "sInfoEmpty": i18n.t("workprocess.datatable.sInfoEmpty"),
        "sInfoFiltered": i18n.t("workprocess.datatable.sInfoFiltered"),
        "sInfoPostFix": i18n.t("workprocess.datatable.sInfoPostFix"),
        "sSearch": i18n.t("workprocess.datatable.sSearch"),
        "sUrl": i18n.t("workprocess.datatable.sUrl"),
        "sEmptyTable": i18n.t("workprocess.datatable.sEmptyTable"),
        "sLoadingRecords": i18n.t("workprocess.datatable.sLoadingRecords"),
        "sInfoThousands": i18n.t("workprocess.datatable.sInfoThousands"),
        "oPaginate": {
            "sFirst": i18n.t("workprocess.datatable.oPaginate.sFirst"),
            "sPrevious": i18n.t("workprocess.datatable.oPaginate.sPrevious"),
            "sNext": i18n.t("workprocess.datatable.oPaginate.sNext"),
            "sLast": i18n.t("workprocess.datatable.oPaginate.sLast"),
        },
        "oAria": {
            "sSortAscending": i18n.t("workprocess.datatable.oAria.sSortAscending"),
            "sSortDescending": i18n.t("workprocess.datatable.oAria.sSortDescending"),
        }
    };
    return {
        processVariables: processVariables,
        dataTable: dataTable
    };
});