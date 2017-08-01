module.exports = {
    login: { role: 'app-common', url: '/CloudUserManagement/services/LoginService?wsdl'},
    ums: { role: 'app-common', url: '/CloudUserManagement/services/UserManageService?wsdl'},
    role: { role: 'app-common', url: '/CloudAuthorization/services/CloudAuthorizationService?wsdl'},
    directory: { role: 'app-common', url: '/CloudUtility/services/DirService?wsdl'},
    log: { role: 'app-common', url: '/CloudUtility/services/LogService?wsdl'},
    workarea: { role: 'app-common', url: '/CloudWorkArea/services/WorkAreaService?wsdl'},
    taskService: {role: 'app-common',url: '/TaskManage/services/TaskManageService?wsdl'},
    appstore: { role: 'app-common', url: '/CloudUtility/services/AppService?wsdl'},
    messagecenter: { role: 'app-common', url: '/CloudMessage/services/MessageService?wsdl'},
    commonProperty: { role: 'app-common', url: '/CloudUtility/services/CommonPropertyService?wsdl'},

    businesslib: { role: 'app-common', url: '/BusinessLib/services/BusinessLibService?wsdl'},
    businesslibdesign: { role: 'app-common', url: '/BusinessLib/services/BusinessLibDesignService?wsdl'},
    businesscommon: { role: 'app-common', url: '/BusinessCommon/services/BusinessCommonService?wsdl'},

    dataimport: { role: 'dc-analysis', url: '/DI_WS/services/DataImportService?wsdl'},
    workflowmanager: { role: 'app-common', url: '/WorkflowManager/services/ProcessService?wsdl'},
    udpFileService: { role: 'dc-analysis', url: '/UDP_WS/services/UdpFileService?wsdl'},

    commonConfig: { role: 'app-common', url: '/ConfigManage/services/ConfigManageService?wsdl'}
};
