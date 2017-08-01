registerLocales(require.context('../../locales/casemanage/', false, /\.js/));
define([
    'underscore',
    '../tpl/tpl-material-edit.html',
    'nova-notify',
    'nova-utils',
    "utility/select2/select2"
], function(_, tpl_materialedit, notify, Util){
        
    var _initParam,
        _opts,
        _caseInfo,
        _objectInfo,
        _materialInfo,
        _materialContentTable;

    var _saveType,
        _summernoteInited = false;

    var _tableFieldName2IDTransDic = {},
        _tableFieldID2NameTransDic = {};

    var _materialRecID,
        _materialSerialNumber;   //material number

    var _toolbarOption = [
                ['fontname', ['fontname']],
                ['style', ['bold', 'italic', 'underline', 'clear']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['fontsize', ['fontsize']],
                ['color', ['color']],
                ['table', ['table']],
                ['misc', ['undo', 'redo']]];

    function init(initParam){
        _initParam = initParam;
        $.getJSON('/spycommon/getFieldIdAndFieldNameMap', {
            tableId: 100007
        }, function(rsp){
            if(rsp.code != 0)
                return notify.show({
                    title: i18n.t('dataprocess.spyprocess.materialeditinfo.gettabletransdicerr'),
                    type: 'error'
                });

            if(_.has(rsp, 'data') == true){
                _tableFieldName2IDTransDic = rsp.data['100007'].nameToId;
                _tableFieldID2NameTransDic = rsp.data['100007'].idToName;
            }


        });
    }

    function render(opts){
        _summernoteInited = false;
        _opts = opts;

        if(_opts.container == undefined)
            return;

        //get bill info which have materialed
        getDetailInfo();

        $(_opts.container).empty().append(_.template(tpl_materialedit));

        $('#materialcontent [data-i18n]').localize();
        $('.summernote').summernote({
            fontNames: ['Helvetica', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', '宋体', '隶书', '楷体','华文楷体'],
            toolbar: _toolbarOption,
            placeholder: i18n.t('dataprocess.spyprocess.materialeditinfo.editcontent'),
            lang: 'zh-CN',
            height: _opts.height,
            disableDragAndDrop: false,
            codemirror: {
                mode: 'text/html',
                htmlMode: true,
                lineNumbers: true,
                theme: 'monokai',
                zindex: 100000,
            },
            focus: false, //set focus editable area after Initialize summernote
            callbacks: {
                onInit: function() {
                    addMaterialSaveBtn();

                    _summernoteInited = true;
                    setMaterialControlValue();

                    $('#btn-material-save').on('click', function(){
                        var paramData;

                        if(_materialSerialNumber == '')
                            _materialSerialNumber = 'CL00' + (new Date().Format('yyyyMMddhhmmss'));

                        genVoiceMaterialParam();

                        if(_saveType == 'insert'){
                            paramData = {
                                data: {
                                    moduleId: 201,
                                    tableId: 100007,
                                    recId: -1,
                                    fields: _materialContentTable
                                }

                            };
                            saveVoiceMaterialData('/tabledesign/insertTableDetail', paramData, function(recordId){
                                saveMaterialManageData('/spymgr/addAudioMaterial', recordId);
                            });
                        }else if(_saveType == 'update'){
                            paramData = {
                                data: {
                                    moduleId: 201,
                                    tableId: 100007,
                                    recId: _materialRecID,
                                    fields: _materialContentTable
                                }

                            };
                            saveVoiceMaterialData('/tabledesign/updateTableDetail', paramData);
                            saveMaterialManageData('/spymgr/updateAudioMaterial', _materialRecID);
                        }
                    });
                },
            },
        });
    }

    function addMaterialSaveBtn(){
        //增加出材‘保存’按钮
        var saveTemp =  '<div class="note-btn-group btn-group" style="margin-left: 0px;">' +
                            '<button id="btn-material-save" type="button" class="note-btn btn btn-primary btn-sm" title="" data-i18n="casemanage.operations.save;[data-origin-title]casemanage.operations.save"></button>' +
                        '</div>';
        $('.note-toolbar').prepend(saveTemp);
        $('.note-editing-area').css({
            'min-height': '150px',
            'background': '#f5f5f5',
        });
        $("#material-otherinfo-edit").css("background-color","rgb(245, 245, 245)");
        $('.note-editor').css('margin-bottom', '5px');
        $('.note-statusbar').hide();
        $('.note-editable').css('min-height', '150px');
        $('#material-otherinfo-edit').insertBefore('.note-editing-area .note-editable');

        $('#materialcontent [data-i18n]').localize();
    }

    //根据获取的材料内容进行控件值的回填
    function setMaterialControlValue () {

        if(_materialContentTable == undefined || _materialContentTable.length == 0)
            return;

        _.each(_materialContentTable, function(item){
            switch(item.fieldName){
                case 'MAIN_CALL_MAN':
                    $('#input-callername').val(item.fieldValue);
                    break;
                case 'MAIN_CALL_MAN_SEX':
                    var callSexIndex = _.findIndex($('#select-callersex')[0].options, function(optionItem){return optionItem.text === item.fieldValue});
                    $('#select-callersex')[0].selectedIndex = callSexIndex;
                    break;
                case 'CALLED_MAN':
                    $('#input-receivername').val(item.fieldValue);
                    break;
                case 'CALLED_MAN_SEX':
                    var receiveSexIndex = _.findIndex($('#select-receiversex')[0].options, function(optionItem){return optionItem.text === item.fieldValue});
                    $('#select-receiversex')[0].selectedIndex = receiveSexIndex;
                    break;
                case 'CALL_LANGUAGE':
                    $('#input-language').val(item.fieldValue);
                    break;
                case 'TELCOM_SPY_MATERIAL':
                    $('.summernote').summernote('code', item.fieldValue);
                    break;
            }
        });
    }

    //保存翻音出材材料数据
    function saveVoiceMaterialData(optUrl, paramData, callback){
        $.ajax({
            'url': optUrl,
            'type': 'POST',
            'data': paramData,
            'success': function(result){
                result = JSON.parse(result);
                if(result.code != 0)
                    return notify.show({
                        title: i18n.t('dataprocess.spyprocess.materialeditinfo.savefileerror'),
                        type: 'error'
                    });
                if(_.isFunction(callback))
                    callback(result.data.recId);
            },
        });
    }

    //保存翻音出材管理数据
    function saveMaterialManageData(optionUrl, recordId){
        genMaterialManageParam();

        _materialInfo.formId = recordId;

        digestInit(getDigestDetail(_materialContentTable), 100007, function(code, digestDesc){
            _materialInfo.formDesc = digestDesc;
            if(code == 0)
                $.post(optionUrl,
                {
                    data: _materialInfo,
                },
                function(res, status){
                    res = JSON.parse(res);
                    if(res.code != 0)
                        return notify.show({
                            title: i18n.t('dataprocess.spyprocess.materialeditinfo.savedataerror'),
                            type: 'error',
                        });

                    if(_.isFunction(_initParam.savedCallback))
                        _initParam.savedCallback();
                });
        });
    }

    //获取详情
    function getDetailInfo(){
        _saveType = '';
        _materialRecID = '';
        _materialSerialNumber = '';
        _materialInfo = {};
        _materialContentTable = [];

        //对于已经出材的话单，进行出材数据的回填，此时对出材内容的编辑保存采用更新方式
        if(_initParam.materialed != undefined && _initParam.cdrId != undefined && _initParam.materialed === '1'){
            _saveType = 'update';
            getMaterialInfo(_initParam.cdrId, function(){
                if(_initParam.caseId != undefined && _initParam.caseId != '')
                    getCaseDetailInfo(_initParam.caseId);
                if(_initParam.objectId != undefined && _initParam.objectId != '')
                    getObjectDetailInfo(_initParam.objectId);
            });
        }
        else{   //新增出材内容
            _saveType = 'insert';
            if(_initParam.caseId != undefined && _initParam.caseId != '')
                getCaseDetailInfo(_initParam.caseId);

            if(_initParam.objectId != undefined && _initParam.objectId != '')
                getObjectDetailInfo(_initParam.objectId);
        }
    }

    //获取当前翻音出材对应对象的对象信息
    function getObjectDetailInfo(objectId){
        if(objectId == undefined)
            return notify.show({
                title: i18n.t('dataprocess.spyprocess.materialeditinfo.getobjctinfoerror'),
                type: 'error'
            });

        $.ajax({
            'url': '/spymgr/getobjectdetail',
            'type': 'GET',
            'data': {
                id: objectId,
            },
            'success': function(result){
                result = JSON.parse(result);
                if(result.code != 0)
                    return notify.show({
                        title: i18n.t('dataprocess.spyprocess.materialeditinfo.getobjectinfoerror'),
                        type: 'error',
                    });

                _objectInfo = result.data;
            },
        });
    }

    //获取当前出材话单所属案件的详细信息
    function getCaseDetailInfo(caseId){
        if(caseId == undefined)
            return notify.show({
                title: i18n.t('dataprocess.spyprocess.materialeditinfo.getcaseinfoerror'),
                type: 'error',
            });

        $.ajax({
            'url': '/spymgr/getcasedetail',
            'type': 'GET',
            'data': {
                id: caseId,
            },
            'success': function(result){
                result = JSON.parse(result);
                if(result.code != 0)
                    return notify.show({
                        title: i18n.t('dataprocess.spyprocess.materialeditinfo.getcaseinfoerror'),
                        type: 'error',
                    });
                _caseInfo = result.data;
            },
        });
    }

    //根据话单获取对应已出材的材料基本信息
    function getMaterialInfo(cdrId, callback){
        if(cdrId == undefined)
            return notify.show({
                title: i18n.t('dataprocess.spyprocess.materialeditinfo.getcontenterror'),
                type: 'error',
            });

        $.ajax({
            'url': '/spymgr/queryAudioMaterial',
            'type': 'GET',
            'data': {
                start: 0,
                length: 65535,
                cdrId: cdrId,
            },
            'success': function(result){
                result = JSON.parse(result);
                if(result.code != 0 || result.data == undefined)
                    return notify.show({
                        title: i18n.t('dataprocess.spyprocess.materialeditinfo.getcontenterror'),
                        type: 'error'
                    });

                if(result.data.forms.length == 0){
                    _saveType = 'insert';
                    if(_.isFunction(callback))
                        callback();

                    return notify.show({
                        title: i18n.t('dataprocess.spyprocess.materialeditinfo.contentdeleted'),
                        type: 'alert'
                    });
                }

                var alianResult = result.data.forms[0];

                _materialRecID = alianResult.formId;
                _materialSerialNumber = alianResult.formNumber;
                _materialInfo = {
                    cdrId: alianResult.cdrId,
                    formId: alianResult.formId,
                    formNumber: alianResult.formNumber,
                    objectId: alianResult.objectId,
                    objectName: alianResult.objectName,
                    caseId: alianResult.caseId,
                    caseName: alianResult.caseName,
                    objectNumber: alianResult.objectNumber,
                    oppoNumber: alianResult.oppoNumber,
                    language: alianResult.language,
                    audio: alianResult.audio,
                    callBeginTime: alianResult.callBeginTime,
                    creatorId: alianResult.creatorId,
                    creatorName: alianResult.creatorName,
                    createTime: alianResult.createTime,
                    hasPrinted: alianResult.hasPrinted,
                    hasTransmit: alianResult.hasTransmit,
                    auditState: alianResult.auditState,
                };

                getMaterialContent(alianResult.formId);
            }
        });
    }

    //获取存储的出材具体内容
    function getMaterialContent(recordId){
        if(recordId == undefined)
            return notify.show({
                title: i18n.t('dataprocess.spyprocess.materialeditinfo.getcontentidnull'),
                type: 'error'
            });

        $.ajax({
            'url': '/tabledesign/getTableDetail',
            'type': 'GET',
            'data': {
                tableId: 100007,
                recId: recordId
            },
            'success': function(result){
                result = JSON.parse(result);
                if(result.code != 0)
                    return notify.show({
                        title: i18n.t('dataprocess.spyprocess.materialeditinfo.getcontenterror'),
                        type: 'error'
                    });

                _materialContentTable = [];
                _.each(result.data.fields, function(item){
                    _materialContentTable.push({
                        fieldId: item.fieldId,
                        fieldName: _.has(_tableFieldID2NameTransDic, item.fieldId) ? _tableFieldID2NameTransDic[item.fieldId] : '',
                        fieldValue: item.fieldValue
                    });
                });
                if(_summernoteInited == true)
                    setMaterialControlValue();
            }
        });
    }

    //生成出材管理数据参数
    function genMaterialManageParam(){

        if(_.keys(_materialInfo).length == 0){
            _materialInfo = {
                cdrId: _initParam.cdrId,
                formId: 0,
                formNumber: _materialSerialNumber,
                objectId: _objectInfo == undefined ?  undefined : _objectInfo.id,
                objectName: _objectInfo == undefined ?  undefined : _objectInfo.name,
                caseId: _objectInfo == undefined ? undefined : _objectInfo.caseId,
                caseName: _objectInfo == undefined ? undefined : _objectInfo.caesName,
                objectNumber: _initParam.objectNum,
                oppoNumber: _initParam.oppoNum,
                language: $('#input-language').val(),
                audio: _initParam.audioName,
                callBeginTime: _initParam.callBeginTime,
                creatorId: 0,
                creatorName: '',
                createTime: new Date().Format('yyyy-MM-dd hh:mm:ss'),
                hasPrinted: 0,
                hasTransmit: 0,
                auditState: 0,
            };
        }else{
            _materialInfo.language = $('#input-language').val();
        }
    }

    //生成语音出材材料内容参数
    function genVoiceMaterialParam(){
        var callName = '',
            callSex = '',
            receiveName = '',
            receivesex = '',
            nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss'),
            language = '';

        if(!_.isEmpty($('#input-callername').val()))
            callName = $('#input-callername').val();
        if(!_.isEmpty($('#select-callersex').val()))
            callSex = $('#select-callersex').find('option:selected').text();
        if(!_.isEmpty($('#input-receivername').val()))
            receiveName = $('#input-receivername').val();
        if(!_.isEmpty($('#select-receiversex').val()))
            receivesex = $('#select-receiversex').find('option:selected').text();
        if(!_.isEmpty($('#input-language').val()))
            language = $('#input-language').val();

        if(_materialContentTable.length == 0){
            if(_objectInfo == undefined)
                return;

            _materialContentTable = [{
                fieldId: _.has(_tableFieldName2IDTransDic, 'SERIAL_NUMBER') ? _tableFieldName2IDTransDic['SERIAL_NUMBER'] : 0,
                fieldName: 'SERIAL_NUMBER',
                fieldValue: _materialSerialNumber
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'REC_ID') ? _tableFieldName2IDTransDic['REC_ID'] : 0,
                fieldName: 'REC_ID',
                fieldValue: ''
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'APPROVAL_NO') ? _tableFieldName2IDTransDic['APPROVAL_NO'] : 0,
                fieldName: 'APPROVAL_NO',
                fieldValue: _objectInfo == undefined ? '' : _objectInfo.approvalNo
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'OBJECT_NAME') ? _tableFieldName2IDTransDic['OBJECT_NAME'] : 0,
                fieldName: 'OBJECT_NAME',
                fieldValue: _objectInfo == undefined ? '' : _objectInfo.name
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'CASE_PROPERTY') ? _tableFieldName2IDTransDic['CASE_PROPERTY'] : 0,
                fieldName: 'CASE_PROPERTY',
                fieldValue: _caseInfo == undefined ? '' : (_caseInfo.type == 0 ? i18n.t('dataprocess.spyprocess.materiallabel.ordinarytype'):i18n.t('casemanage.spyProcess.materiallabel.specialtype'))
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'SPY_CATEGORY') ? _tableFieldName2IDTransDic['SPY_CATEGORY'] : 0,
                fieldName: 'SPY_CATEGORY',
                fieldValue: ''
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'EXEMPLARY_CASE_CODE') ? _tableFieldName2IDTransDic['EXEMPLARY_CASE_CODE'] : 0,
                fieldName: 'EXEMPLARY_CASE_CODE',
                fieldValue: _caseInfo == undefined ? '' : _caseInfo.code
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'SPY_OBJECT_NO') ? _tableFieldName2IDTransDic['SPY_OBJECT_NO'] : 0,
                fieldName: 'SPY_OBJECT_NO',
                fieldValue: _objectInfo == undefined ? '' : _objectInfo.code
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'MAIN_CALL_NUM') ? _tableFieldName2IDTransDic['MAIN_CALL_NUM'] : 0,
                fieldName: 'MAIN_CALL_NUM',
                fieldValue: _initParam.objectNum
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'MAIN_CALL_MAN') ? _tableFieldName2IDTransDic['MAIN_CALL_MAN'] : 0,
                fieldName: 'MAIN_CALL_MAN',
                fieldValue: callName
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'MAIN_CALL_MAN_SEX') ? _tableFieldName2IDTransDic['MAIN_CALL_MAN_SEX'] : 0,
                fieldName: 'MAIN_CALL_MAN_SEX',
                fieldValue: callSex
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'CALLED_NUM') ? _tableFieldName2IDTransDic['CALLED_NUM'] : 0,
                fieldName: 'CALLED_NUM',
                fieldValue: _initParam.oppoNum
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'CALLED_MAN') ? _tableFieldName2IDTransDic['CALLED_MAN'] : 0,
                fieldName: 'CALLED_MAN',
                fieldValue: receiveName
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'CALLED_MAN_SEX') ? _tableFieldName2IDTransDic['CALLED_MAN_SEX'] : 0,
                fieldName: 'CALLED_MAN_SEX',
                fieldValue: receivesex
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'CALL_START_TIME') ? _tableFieldName2IDTransDic['CALL_START_TIME'] : 0,
                fieldName: 'CALL_START_TIME',
                fieldValue: _initParam.callBeginTime
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'CALL_TIME_LENGTH') ? _tableFieldName2IDTransDic['CALL_TIME_LENGTH'] : 0,
                fieldName: 'CALL_TIME_LENGTH',
                fieldValue: _initParam.callLength
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'CALL_LANGUAGE') ? _tableFieldName2IDTransDic['CALL_LANGUAGE'] : 0,
                fieldName: 'CALL_LANGUAGE',
                fieldValue: language
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'TELCOM_SPY_MATERIAL') ? _tableFieldName2IDTransDic['TELCOM_SPY_MATERIAL'] : 0,
                fieldName: 'TELCOM_SPY_MATERIAL',
                fieldValue: $('.summernote').summernote('code')
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'MATERIAL_DEPT') ? _tableFieldName2IDTransDic['MATERIAL_DEPT'] : 0,
                fieldName: 'MATERIAL_DEPT',
                fieldValue: ''
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'MATERIAL_TIME') ? _tableFieldName2IDTransDic['MATERIAL_TIME'] : 0,
                fieldName: 'MATERIAL_TIME',
                fieldValue: nowTime
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'MATERIAL_MAN') ? _tableFieldName2IDTransDic['MATERIAL_MAN'] : 0,
                fieldName: 'MATERIAL_MAN',
                fieldValue: ''
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'TABLE_DEPT') ? _tableFieldName2IDTransDic['TABLE_DEPT'] : 0,
                fieldName: 'TABLE_DEPT',
                fieldValue: ''
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'REPORT_TIME') ? _tableFieldName2IDTransDic['REPORT_TIME'] : 0,
                fieldName: 'REPORT_TIME',
                fieldValue: nowTime
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'TABLE_MAN') ? _tableFieldName2IDTransDic['TABLE_MAN'] : 0,
                fieldName: 'TABLE_MAN',
                fieldValue: ''
            },{
                fieldId: _.has(_tableFieldName2IDTransDic, 'TABLE_EXAMER') ? _tableFieldName2IDTransDic['TABLE_EXAMER'] : 0,
                fieldName: 'TABLE_EXAMER',
                fieldValue: ''
            }];

        }else{
            _.each(_materialContentTable, function(item){
                switch(item.fieldName){
                    case 'MAIN_CALL_MAN':
                        item.fieldValue = callName;
                        break;
                    case 'MAIN_CALL_MAN_SEX':
                        item.fieldValue = callSex;
                        break;
                    case 'CALLED_MAN':
                        item.fieldValue = receiveName;
                        break;
                    case 'CALLED_MAN_SEX':
                        item.fieldValue = receivesex;
                        break;
                    case 'CALL_LANGUAGE':
                        item.fieldValue = language;
                        break;
                    case 'TELCOM_SPY_MATERIAL':
                        item.fieldValue = $('.summernote').summernote('code');
                        break;
                    default:
                        return;
                }
            });
        }
    }

    //翻音出材内容摘要
    function getDigestDetail(mainTableContent){
        var digestParam = {};

        _.each(mainTableContent, function(item){
            digestParam['CASE_NAME'] = _objectInfo == undefined ? '' : _objectInfo.caesName;
            switch(item.fieldName){
                case 'MAIN_CALL_MAN':
                    digestParam[item.fieldName] = item.fieldValue;
                    break;
                case 'CALLED_MAN':
                    digestParam[item.fieldName] = item.fieldValue;
                    break;
                case 'CALL_LANGUAGE':
                    digestParam[item.fieldName] = item.fieldValue;
                    break;
            }
        });
        return digestParam;
    }

    function digestInit(data, tableType, callback){
        var digestDesc = '';
        $.get('/tabledesign/getInitTableData?tableId=' + tableType).done(function(res){
            var result = JSON.parse(res);
            if(result.code == 0){
                for(var key in data){
                    if(key == 'CASE_NAME')
                        digestDesc += ',' + i18n.t('dataprocess.spyprocess.materiallabel.casename') + data[key];
                    else if(_.isString(data[key]) && !_.isEmpty(data[key]))
                        digestDesc += ',' + transDigest(key, result) + '：' + data[key];
                }
                digestDesc = '<span>' + digestDesc.slice(1) + '</span>';
            }

            if(_.isFunction(callback)){
                callback(result.code, digestDesc);
            }
        });
    }

    function transDigest(key, paramDic){
        var fieldName = _.find(paramDic.data.mainTable, function(item){
            return key == item.fieldName;
        });

        if(fieldName != undefined){
            return fieldName.fieldDisplayName;
        }
        else if(paramDic.translate != undefined)
            _.each(paramDic.translate.subTables, function(items){
                _.each(items, function(item){
                    if(key == item.fieldName)
                        fieldName == item.fieldName;
                });
            });
        return fieldName;
    }

    Date.prototype.Format = function(fmt){
        var o = {
            "M+": this.getMonth() + 1,      //month
            "d+": this.getDate(),           //day
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds(),
        };
        if(/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    return {
        init: init,
        render: render
    }
});