define([
    'utility/udp/dropzone',
    'nova-notify',
    "moment",
    "../../../../config",
    'moment-locale',
    'utility/jquerymask/jquery.maskedinput.min',
    'utility/select2/select2',
    'utility/select2/i18n/zh-CN',
    './coder',
    './multiInput',
    './dateInput',
    './upload',
    './photo',
    'utility/datepicker/bootstrap-datetimepicker',
    '../../../less/skin/tabledesign/cy.css',
    '../../../less/skin/tabledesign/multiInput.css',
    '../../../less/skin/tabledesign/dateInput.css',
    '../../../less/skin/tabledesign/coder.css',
    '../../../less/skin/tabledesign/upload.css',
    '../../../less/skin/tabledesign/photo.css',
    '../../../less/skin/bootstrap-datetimepicker.css',
    '../../../less/skin/tabledesign/dropzone.css',
], function(Dropzone, Notify, moment, Config) {
    var constant = {
        uploadType : Config.uploadType
    }
    $('body').click(function() {
        $('.coderDiv,.multiDiv').remove();
    });

    var dialogMap = {};
    var avaNotify = Notify;
    var loader;

    function openDialog(opt) {
        top._topMpdal(opt);
    }

    function _topMpdal(opt) {
        var w = opt.width;
        var h = opt.height;
        var code = '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="overflow:hidden;width:' + (w + 52) + 'px;margin-left:-' + (w + 52) / 2 + 'px;height:' + (h + 120) + 'px;max-height:' + (h + 120) + 'px"> ' +
            //'<div class="modal-dialog"> '+
            //'<div class="modal-content"> '+
            '<div class="modal-header"> ' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> ' +
            '<h4 class="modal-title" >' + (opt.title || '') + '</h4>' +
            '</div>' +
            '<div class="modal-body" style="height:' + (h + 10) + 'px;max-height:' + (h + 10) + 'px;overflow:hidden"><iframe src="' + opt.iframe + '" style="width:' + w + 'px;height:' + h + 'px" frameborder=0></iframe></div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>' +
            '<button type="button" class="btn btn-primary">确定</button>' +
            '</div>' +
            //'</div>'+
            //'</div>'+
            '</div>';

        var _t = $(code).appendTo('body').modal().on('hide.bs.modal', function() {

        }).on('hidden.bs.modal', function() {
            $(this).remove();
        });

        _t.find('.btn-primary').click(function() {
            if (_t.find('iframe').get(0).contentWindow.ok) {
                _t.find('iframe').get(0).contentWindow.ok();
            } else {}
        });

        var t = new Date().getTime();
        var frame = _t.find('iframe');
        frame.attr('_t', t);
        dialogMap[t] = {
            dialog: _t,
            opt: opt
        };
    }


    function closeDialog(ret) {
        var t = $(frameElement).attr('_t');

        top.dialogMap[t].dialog.modal('hide');
        if (top.dialogMap[t].opt.callback) {
            top.dialogMap[t].opt.callback(ret);
        }
        delete top.dialogMap[t];
    }

    function getParam() {
        var t = $(frameElement).attr('_t');
        return top.dialogMap[t].opt.param;
    }


    function loadCode(lyinfo, container, callback) {
        if(_.has(lyinfo, "notify")) avaNotify = lyinfo.notify;

        try{
            loader = {
                showLoader: showLoader,
                hideLoader: hideLoader,
            }
        }catch(e){
            loader = {
                showLoader: tbl_showLoader,
                hideLoader: tbl_hideLoader,
            }
        }

         // moment.locale('zh-cn');
        $.getJSON('/tbl-design/getRunTimeTblTemplate', {
            ly_key: _.isUndefined(lyinfo.viewId) ? -1 : lyinfo.viewId,
            ly_tblId: lyinfo.tblId
        }).done(function(rsp) {
            if (rsp.code == 0) {
                var json = JSON.parse(rsp.data.layoutContent);
                if (json) {
                    container.html(json.html).addClass("cy");
                    // var set = new RecordSet({
                    //     fieldSet: json.fields
                    // });

                    $(".col-md-2",container).addClass("col-xs-2");
                    $(".col-md-4",container).addClass("col-xs-4");
                    $(".col-md-6",container).addClass("col-xs-6");
                    $(".col-md-8",container).addClass("col-xs-8");
                    $(".col-md-10",container).addClass("col-xs-10");
                    $(".col-md-12",container).addClass("col-xs-12");

                    var set=new RecordSet({fieldSet:json.fields,container:container});
                    
                    if ($('.summernote', container).length) {

                        var theadSummernoteJS = '<script type="text/javascript" class="summernote" src="/js/components/summernote/summernote.min.js"></script>';
                        var theadSummernoteCN = '<script type="text/javascript" class="summernote" src="/js/components/summernote/summernote-zh-CN.js"></script>';
                        var theadSummernoteCss = '<link rel="stylesheet" class="summernote" type="text/css" href="/css/skin/summernote.css">';
                        if (!$("head").find(".summernote").length) {
                            $("head").append(theadSummernoteJS);
                            $("head").append(theadSummernoteCN);
                            $("head").append(theadSummernoteCss);
                        }

                        $('.summernote', container).each(function() {
                            $(this).summernote({
                                height: $(this).height() - 40,
                                toolbar: [
                                    ['fontname', ['fontname']],
                                    ['style', ['bold', 'italic', 'underline', 'clear']],
                                    ['para', ['ul', 'ol', 'paragraph']],
                                    ['fontsize', ['fontsize']],
                                    ['color', ['color']],
                                    ['table', ['table']],
                                    ['misc', ['fullscreen', 'redo']],

                                    // ['height', ['height']],
                                ],
                                lang: 'zh-CN',
                                codemirror: {
                                    mode: 'text/html',
                                    htmlMode: true,
                                    lineNumbers: true,
                                    theme: 'monokai',
                                    zindex: 100000,
                                },
                                height: 275,
                                focus: false,
                            });
                        })
                    }
                    if ($('.multiInput', container).length) {
                        $('.multiInput', container).multiInput();
                    }

                    $('.dateInput',container).each(function(){
                        var elem = $(this);
                        var field = set.getField(elem.attr('cfield'));
                        var length = field && field.length;
                        elem.dateInput({
                            "length":length
                        });
                    });

                    $('.coder', container).each(function() {
                        // var field = set.getField($(this).attr('cfield'));
                        var elem = $(this);
                        var field=set.getField(elem.attr('cfield'));
                        var dict = field && field.dict;
                        var multi=field&&field.multi;
                        elem.coder({
                            "dict": dict,
                            multi:multi,
                            tableId: lyinfo.tblId,
                            fieldId: field.name,
                        });
                    });

                    $('.upload', container).each(function() {
                        // var field = set.getField($(this).attr('cfield'));
                        var elem = $(this);
                        var field=set.getField(elem.attr('cfield'));
                        elem.upload({
                            tableId: lyinfo.tblId,
                            fieldId: field.name,
                            Notify: avaNotify,
                            constant: constant,
                            uploadCallBack: lyinfo.uploadCallBack,
                            showLoader: loader.showLoader,
                            hideLoader: loader.hideLoader,
                        });
                    });

                    $('.photo', container).each(function() {
                        // var field = set.getField($(this).attr('cfield'));
                        var elem = $(this);
                        var field=set.getField(elem.attr('cfield'));
                        elem.photo({
                            Notify: avaNotify,
                            tableId: lyinfo.tblId,
                            fieldId: field.name,
                            constant: constant,
                            showLoader: loader.showLoader,
                            hideLoader: loader.hideLoader,
                        });
                    });

                    $('textarea',container).each(function(){
                        var elem = $(this);
                        elem.empty();
                    });
                    
                    $('select', container).each(function() {
                        // var field = set.getField($(this).attr('cfield'));
                        var elem = $(this);
                        var field=set.getField(elem.attr('cfield'));
                        var dict = field.dict;
                        if (dict) {
                            $.getJSON("/spycommon/getTableFieldCodeTable", {
                                // dicName: dict
                                tableId: lyinfo.tblId,
                                fieldId: field.name
                            }).done(function(rsp) {
                                if (rsp.code == 0) {
                                    // $(elem).append('<option></option>');
                                    // $(elem).select2({
                                    //     language: 'zh-CN',
                                    //     allowClear: true,
                                    //     placeholder: "请选择",
                                    //     data: rsp.data
                                    // });

                                    var opts = ["<option value=''></option>"];
                                    _.each(rsp.data, function(item) {
                                        opts.push("<option value='" + item.id + "'>" + item.text + "</option>");
                                    });
                                    elem.html(opts.join(""));
                                }
                            });
                        }
                    });
                    
                    $("input[type='number']",container).each(function(){
                        var elem = $(this);
                        elem.attr("min",0);
                    });
                    /*$('select', container).each(function() {
                        var field = set.getField($(this).attr('cfield'));
                        var elem = $(this);
                        var dict = field.dict;
                        if (dict) {
                            $.getJSON("/spycommon/getDictionaryByName", {
                                dicName: dict
                            }).done(function(rsp) {
                                if (rsp.code == 0) {
                                    var opts = ["<option value=''></option>"];
                                    _.each(rsp.data, function(item) {
                                        opts.push("<option value='" + item.code + "'>" + item.name + "</option>");
                                    });
                                    elem.html(opts.join(""));
                                }
                            });
                        }
                    });*/
                    set.init();

                    if(lyinfo.entityId.toString() == "-1"){
                        var initDefaultValue = Q.defer();

                        $.getJSON("/tbl-design/GetTableDefaultValue", {
                            tableId: lyinfo.tblId
                        }).done(function(r) {
                            if (r.code == 0) {
                                initDefaultValue.resolve(r.data);
                            }else{
                                initDefaultValue.reject(r);
                            }

                        });

                        initDefaultValue.promise.then(function(idata){
                            set.openKVData(idata);
                        }).then(function(){
                            callback(set); 
                        });
                        // $.ajaxSettings.async = false;
                        // $.getJSON("/tbl-design/GetTableDefaultValue", {
                        //     tableId: lyinfo.tblId
                        // }).done(function(r) {
                        //     set.openKVData(r.data);

                        // });
                        // callback(set);
                        // $.ajaxSettings.async = true;
                    }else{
                        callback(set);
                    }
                    
                }
            } else {

            }
        });
    }

    ////////////////////////////////////////////////////////////////////////


    function FieldSet(opt) {
        this.dataType = "fieldSet";
        this.field = {
            name: '',
            label: '',
            type: 'C',
            dict: '',
            format: '',
            length: 0,
            dfValue: null,
            dfType: "1",
            notNull: false,
            unique: false,
            readOnly: false
        };
        this.field = $.extend(this.field, opt);
        if (this.field["dfType"] == '1') {
            this.value = this.field["dfValue"];
            this.text = this.value;
        } else if (this.field["dfType"] == '2') {
            this.value = eval(this.field["dfValue"]);
            this.text = this.value;
        }
    }

    FieldSet.prototype.getField = function() {
        return this.field;
    }
    FieldSet.prototype.setValue = function(v) {
        if (this.field.type == 'L' && typeof v == 'string') {
            this.value = v == '1';
        } else {
            this.value = v;
        }
    }



    function RecordSet(opt) {
        this.id = opt && opt.id;
        this.dataType = "recordSet";
        this.container=opt&&opt.container;
        this.type = null;
        this.map = {}; //字段和控件关联
        this.fieldMap = {}; //字段和FieldSet关联
        this.fieldSet = []; //多个FieldSet
        this.cfg = $.extend({}, opt);
        if (opt) {
            if (opt.map) {
                this.map = opt.map;
            } else {
                this.map = {};
            }
            if (opt.fieldSet) {
                for (var i = 0, len = opt.fieldSet.length; i < len; i++) {
                    this.fieldSet.push(new FieldSet(opt.fieldSet[i]));
                    this.map[opt.fieldSet[i].name] = "[cfield=" + opt.fieldSet[i].name + "]";
                }
                this.setFieldSet(this.fieldSet);
            }
        }
    }

    RecordSet.prototype.merge = function(record) {
        this.map = $.extend(this.map, record.map);
        this.fieldSet = this.fieldSet.concat(record.fieldSet);
        this.fieldMap = $.extend(this.fieldMap, record.fieldMap);
    }

    RecordSet.prototype.init = function() {
        var dicts = [];
        var dictsPos = [];
        var recordSet = this;

        for (var x in this.map) {
            if (this.fieldMap[x] == null) {
                alert(x + ":相关配置不见了!");
                continue;
            }
            var dfv = this.fieldMap[x].field["dfValue"];
            if (dfv) {
                var type = this.fieldMap[x].field["type"];
                if (this.fieldMap[x].field["dfType"] == '3') {
                    var dataset = dfv.substring(0, dfv.indexOf(':'));
                    var field = dfv.substring(dfv.indexOf(':') + 1);
                    this.fieldMap[x].value = eval(dataset).getFieldValue(field);
                } else if (this.fieldMap[x].field["dfType"] == '4') {
                    this.fieldMap[x].value = this.eval(dfv);
                } else if (this.fieldMap[x].field["dfType"] == '7') {
                    this.fieldMap[x].value = eval(dfv)();
                } else if (/^V\d*$/.test(type)) {
                    this.fieldMap[x].value = parseInt(dfv, 10);
                } else if (/^F\d*$/.test(type)) {
                    this.fieldMap[x].value = parseFloat(dfv);
                } else if (type == 'L') {
                    this.fieldMap[x].value = dfv !== '0' && dfv != 'false';
                }
                var dict = this.fieldMap[x].field["dict"];
                var format = this.fieldMap[x].field["format"];

            }
        }

        for (var x in this.map) {
            var control = this.map[x];
            if (typeof control == 'string') {
                var $control = $(control,this.container);

                if (this.fieldMap[x].field.notNull) {
                    $control.parent().prev().append("<label style='color:red;font-weight: bold;'>(必填)</label>");
                    $control.addClass('notNull');
                }
                if (this.fieldMap[x].field.readOnly) {
                    // $control.addClass('readOnly').prop("readOnly", true);
                    this.readOnly(x,true);
                }

                var v = this.fieldMap[x].value;
                if (v === 0 || v) {
                    if ($control.prop("tagName") == 'SPAN' || $control.prop("tagName") == 'DIV') {
                        if ($control.hasClass("summernote")) {
                            // $control.summernote().code(v || "");
                            $control.summernote("code", v || "");
                        } else if ($control.hasClass("multiInput")) {
                            $control.multiInput('val', v);
                        }else if($control.hasClass("dateInput")){
                            $control.dateInput('val',v);
                        } else if ($control.hasClass("coder")) {
                            $control.coder('val', v);
                        } else if($control.hasClass("upload")){
                            $control.upload('val',v);
                        }else if($control.hasClass("photo")){
                            $control.photo('val',v);
                        } else {
                            $control.html(v || "");
                        }
                    } else if ($control.attr("type") == 'checkbox' || $control.attr("type") == 'radio') {
                        $control.prop("checked", v || false);
                    } else {
                        if ($control.prop('type') == 'datetime-local' || $control.prop('type') == 'datetime') {
                            if (v) {
                                $control.val(v.replace(/\s/, 'T').replace(/\//ig,'-'));
                            } else {
                                $control.val("");
                            }
                        } else {
                            $control.val(v === 0 ? 0 : v || "");
                        }
                        // $control.val(v === 0 ? 0 : v || "");
                    }
                }
            }
        }
    }


    RecordSet.prototype.openData = function(ds) {
        if (ds == null) return;

        var dictTerm = [];
        // var xfields=[];
        for (var x in this.fieldMap) {
            this.fieldMap[x].value = ds[x];
            if (this.fieldMap[x].field.type == 'B') {
                if (typeof ds[x] == 'number') {
                    this.fieldMap[x].value = ds[x] + '';
                }

                // dictTerm.push({dict:this.fieldMap[x].field.dict,code:this.fieldMap[x].value});
                if (!_.isEmpty(this.fieldMap[x].value)) {
                    // xfields.push(x);
                    // dictTerm.push({dict:this.fieldMap[x].field.name,code:this.fieldMap[x].value});
                    var tmpCodes = [];
                    if (_.isArray(this.fieldMap[x].value)) {
                        tmpCodes = this.fieldMap[x].value;
                    } else {
                        tmpCodes.push(this.fieldMap[x].value);
                    }
                    dictTerm.push({
                        dict: this.fieldMap[x].field.name,
                        code: tmpCodes
                    });
                }

            } else if (this.fieldMap[x].field.type == 'D' || this.fieldMap[x].field.type == 'E') {
                if (ds[x]) {
                    if(this.fieldMap[x].field.length == "8"){
                        ds[x] = ds[x].substring(0,10);
                    }else{
                        ds[x] = ds[x].substring(0,19);
                    }
                    this.fieldMap[x].value = ds[x].replace(/[^\d]/ig, '');//8位和12位
                }
            }
        }

        // for (var x in this.fieldMap) {
        //     this.fieldMap[x].value = ds[x];
        //     if (this.fieldMap[x].field.type == 'B' && typeof ds[x] == 'number') {
        //         this.fieldMap[x].value = ds[x] + '';
        //     }
        // }

        for (var x in this.map) {
            if (this.fieldMap[x].field.type == 'B') {
                continue;
            }

            var control = this.map[x];
            if (typeof control == 'string') {
                var $control = $(control,this.container);

                var v = ds[x];

                if ($control.prop("tagName") == 'SPAN' || $control.prop("tagName") == 'DIV') {
                    if ($control.hasClass("summernote")) {
                        // $control.summernote().code(v || "");
                        $control.summernote("code", v || "");
                    } else if ($control.hasClass("multiInput")) {
                        $control.multiInput('val', v);
                    }else if($control.hasClass("dateInput")){
                        $control.dateInput('val',v);
                    } else if ($control.hasClass("upload")) {
                        $control.upload('val', v);
                    } else if($control.hasClass("photo")){
                        $control.photo('val',v);
                    } else {
                        $control.html(v || "");
                    }
                } else if ($control.attr("type") == 'checkbox' || $control.attr("type") == 'radio') {
                    $control.prop("checked", v || false);
                } else {
                    if ($.isEmptyObject(v)) v = "";
                    // $control.val(v === 0 ? 0 : v || "");
                    if ($control.prop('type') == 'datetime-local' || $control.prop('type') == 'datetime') {
                        if (v) {
                            $control.val(v.replace(/\s/, 'T').replace(/\//ig,'-'));
                        } else {
                            $control.val("");
                        }
                    } else {
                        $control.val(v === 0 ? 0 : v || "");
                    }
                }

            } else {}
        }

        $.ajaxSettings.async = false;
        if (dictTerm.length > 0) {
            var set = this;
            console.log(JSON.stringify(dictTerm));
            $.getJSON("/tbl-design/transFieldFromCodeToValue", {
                dictCodeIds: dictTerm
            }).done(function(rsp) {
                if (rsp.code == 0) {
                    var ms = rsp.data;
                    _.each(ms, function(m) {
                        var control = set.map[m.fieldId];
                        var $control = $(control,set.container);
                        if ($control.hasClass("coder")) {
                            // $control.coder('valAndTxt',{code:v,label:ms[i]});
                            $control.coder('valAndText', {
                                value: set.fieldMap[m.fieldId].value,
                                text: m.text
                            });
                        } else {
                            $control.val(v === 0 ? 0 : v || "");
                        }
                    });

                    if (set.afterOpen) {
                        set.afterOpen();
                    }
                }
            });
        } else {
            if (this.afterOpen) {
                this.afterOpen();
            }
        }
        $.ajaxSettings.async = true;

        // if (this.afterOpen) {
        //     this.afterOpen();
        // }
    }



    RecordSet.prototype.clearData = function(flag) {
            this.isNew = true;
            for (var x in this.fieldMap) {
                var fieldSet = this.fieldMap[x];

                delete fieldSet.value;

                if (flag) {
                    var name = fieldSet.field.name;
                    var dft = fieldSet.field["dfType"];
                    var dfv = fieldSet.field["dfValue"];

                    if (dfv !== undefined && dfv !== null) {
                        if (dft == '3') {
                            var dataset = dfv.substring(0, dfv.indexOf(':'));
                            var field = dfv.substring(dfv.indexOf(':') + 1);

                            try {
                                fieldSet.value = eval(dataset).getFieldValue(field);
                            } catch (e) {
                                alert('数据项默认值错误:' + [this.id, name, dfv])
                            }
                        } else if (dft == '4') {
                            fieldSet.value = this.eval(dfv);
                        } else if (dft == '7') {
                            fieldSet.value = eval(dfv)();
                        } else if (dft == '2' || dft == '4') {
                            fieldSet.value = eval(dfv);
                        } else {
                            fieldSet.value = dfv;
                        }
                    }
                }
            }
            for (var x in this.map) {
                var control = this.map[x];
                if (typeof control == 'string') {
                    var $control = $(control,this.container);

                    if ($control.prop("tagName") == 'SPAN' || $control.prop("tagName") == 'DIV') {
                        // $control.html(v || "");
                        if ($control.hasClass("summernote")) {
                            // $control.summernote().code(v || "");
                            $control.summernote("code", v || "");
                        } else if ($control.hasClass("multiInput")) {
                            $control.multiInput('val', v);
                        }else if($control.hasClass("dateInput")){
                            $control.dateInput('val',v);;
                        } else if ($control.hasClass("coder")) {
                            $control.coder('val', v);;
                        } else if($control.hasClass("upload")){
                            $control.upload('val',v);;
                        } else if($control.hasClass("photo")){
                            $control.photo('val',v);
                        } else {
                            $control.html(v || "");
                        }
                    } else if ($control.attr("type") == 'checkbox' || $control.attr("type") == 'radio') {
                        $control.prop("checked", false);
                    } else {
                        // $control.val("");
                        if ($control.prop('type') == 'datetime-local' || $control.prop('type') == 'datetime') {
                            if (v) {
                                $control.val(v.replace(/\s/, 'T').replace(/\//ig,'-'));
                            } else {
                                $control.val("");
                            }
                        } else {
                            $control.val(v === 0 ? 0 : v || "");
                        }
                    }

                } else {}
            }
        }
        //获取field
    RecordSet.prototype.getField = function(fieldName) {
        var fieldSet = this.fieldMap[fieldName];
        if (fieldSet) {
            return fieldSet.field;
        } else {
            return null;
        }
    }
    RecordSet.prototype.getFields = function() {
        var arr = [];
        for (var i = 0, len = this.fieldSet.length; i < len; i++) {
            var f = this.fieldSet[i].getField();
            if (f.dfType !== '5' && f.dfType !== '6') {
                arr.push({
                    name: f.name,
                    type: f.type
                });
            }
        }
        return arr;
    }
    RecordSet.prototype.getFieldNames = function() {
        var arr = [];
        for (var i = 0, len = this.fieldSet.length; i < len; i++) {
            arr.push(this.fieldSet[i].field["name"]);
        }
        return arr;
    }

    //获取fieldset
    RecordSet.prototype.getFieldSet = function(name) {
        return this.fieldMap[name];
    }

    //设置fieldset,初始化方法
    RecordSet.prototype.setFieldSet = function(fieldSet) {
        this.fieldSet = fieldSet;
        this.fieldMap = {};
        for (var i = 0, len = fieldSet.length; i < len; i++) {
            this.fieldMap[fieldSet[i].field.name] = fieldSet[i];
        }
        for (var i in this.map) {
            try {
                if (typeof this.map[i] == 'string') {
                    var $elem = $(this.map[i],this.container);
                    if ($elem.length > 0) {

                        if (this.fieldMap[i].field['notNull'] && $elem.parent().prop('tagName') == 'TD') {
                            $elem.parent().prev().addClass('notNull');
                            if ($elem.parent().prev().find('.notNullEx').length == 0) {
                                $("<font class='notNullEx'>*</font>").appendTo($elem.parent().prev().children('.innerLabel:first'));
                            }
                        }
                    }
                }
            } catch (e) {
                alert('RecordSet:' + this.id + ".setFieldSet:" + i + ' ' + e.message)
            }
        }
    }

    //20161130 update bak
    // RecordSet.prototype.readOnly = function(name, nvl) {
    //     if (arguments.length == 1) {
    //         return this.fieldMap[name].field['readOnly'];
    //     } else {
    //         this.fieldMap[name].field['readOnly'] = nvl;
    //         if (nvl) {
    //             $(this.map[name]).addClass('readOnly').prop('readOnly', true);
    //         } else {
    //             $(this.map[name]).removeClass('readOnly').prop('readOnly', false);
    //         }
    //     }
    // }

    RecordSet.prototype.readOnly = function(name, nvl) {
        if (arguments.length == 1) {
            return this.fieldMap[name].field['readOnly'];
        } else {
            this.fieldMap[name].field['readOnly'] = nvl;
            var $control=$(this.map[name],this.container);

            if($control.prop("tagName")=='SPAN'||$control.prop("tagName")=='DIV'){
                if($control.hasClass("summernote")){
                    $control.summernote().code(v||"");
                }else if($control.hasClass("multiInput")){
                    $control.multiInput('readOnly',nvl);
                }else if($control.hasClass("dateInput")){
                    $control.dateInput('readOnly',nvl);
                }else if($control.hasClass("coder")){
                    $control.coder('readOnly',nvl);
                }else if($control.hasClass("upload")){
                    $control.upload('readOnly',nvl)
                }else if($control.hasClass("photo")){
                    $control.photo('readOnly',nvl);
                }else{
                    if(nvl){
                        $control.addClass('readOnly').prop('readOnly',true);
                    }else{
                        $control.removeClass('readOnly').prop('readOnly',false);
                    }
                }
            }else{
                if(nvl){
                    $control.addClass('readOnly').prop('readOnly',true);
                }else{
                    $control.removeClass('readOnly').prop('readOnly',false);
                }
            }
        }
    }

    RecordSet.prototype.readOnlyAll = function(nvl) {
        for (var i = 0, len = this.fieldSet.length; i < len; i++) {
            var field = this.fieldSet[i].field;
            field['readOnly'] = nvl;
            var name = field.name;
            this.readOnly(name,nvl);
        }
    }

    RecordSet.prototype.notNull = function(name, nvl) {
        if (arguments.length == 1) {
            return this.fieldMap[name].field['notNull'] || false;
        } else if (this.fieldMap[name]) {
            this.fieldMap[name].field['notNull'] = nvl;

            if (nvl) {
                $(this.map[name],this.container).addClass('notNull');
            } else {
                $(this.map[name],this.container).removeClass('notNull');
            }
        } else {
            $.alert(name + '字段不存在!');
        }
    }
    RecordSet.prototype.notNullAll = function(nvl) {
        for (var i = 0, len = this.fieldSet.length; i < len; i++) {
            var field = this.fieldSet[i].field;
            field['notNull'] = nvl;
            var name = field.name;

            if (nvl) {
                $(this.map[name],this.container).addClass('notNull');
            } else {
                $(this.map[name],this.container).removeClass('notNull');
            }
        }
    }
    RecordSet.prototype.setDataValue = function(row, name, value) {
            this.setFieldValue(name, value);
        }
        //设置字段值
    RecordSet.prototype.setFieldValue = function(name, value) {
        var field4Name = this.fieldMap[name];
        if (field4Name) {
            field4Name.setValue(value);
        }
        var text = value;
        if (value) {
            var field = field4Name.field;
            var dataType = field.type;
            var dataDict = field.dict;

            this._setFieldValueAndText(name, {
                value: value,
                text: text
            });
        }
    }

    RecordSet.prototype._setFieldValueAndText = function(name, vt) {
        var field4Name = this.fieldMap[name];
        if (field4Name) {
            field4Name.setValue(vt.value);
            field4Name.text = vt.text || vt.value;
        }

        if (typeof this.map[name] == 'string') {
            var $control = $(this.map[name],this.container);

            if ($control.prop("tagName") == 'SPAN' || $control.prop("tagName") == 'DIV') {
                // $control.html(v || "");
                if ($control.hasClass("summernote")) {
                    // $control.summernote().code(v || "");
                    $control.summernote("code", v || "");
                } else if ($control.hasClass("multiInput")) {
                    $control.multiInput('val', v);
                }else if($control.hasClass("dateInput")){
                    $control.dateInput('val',v);
                } else if ($control.hasClass("coder")) {
                    $control.coder('val', v);;
                } else if($control.hasClass("upload")){
                    $control.upload('val',v);
                } else if($control.hasClass("photo")){
                    $control.photo('val',v);
                } else {
                    $control.html(v || "");
                }
            } else if ($control.attr("type") == 'checkbox' || $control.attr("type") == 'radio') {
                $control.prop("checked", vt.value || false);
            } else {
                if ($control.prop('type') == 'datetime-local' || $control.prop('type') == 'datetime') {
                    if (vt) {
                        $control.val(vt.value.replace(/\s/, 'T').replace(/\//ig,'-'));
                    } else {
                        $control.val("");
                    }
                } else {
                    $control.val(vt.value === 0 ? 0 : vt.value || "");
                }
                // $control.val(vt.value === 0 ? 0 : vt.value || "");
            }

        }
    }

    //获取字段的顺序
    RecordSet.prototype.getFieldIndex = function(name) {
        return $.inArray(this.fieldMap[name], this.fieldSet);
    }
    RecordSet.prototype.getDataValue = function(row, name) {
        return this.getFieldValue(name);
    }
    RecordSet.prototype.getFieldValue = function(name) {
        if (typeof this.map[name] == 'string') {
            var $control = $(this.map[name],this.container);

            if ($control.prop("tagName") == 'SPAN' || $control.prop("tagName") == 'DIV') {
                // return $control.html();
                if ($control.hasClass("summernote")) {
                    // return $control.summernote().code();
                    return $control.summernote("code");
                } else if ($control.hasClass("multiInput")) {
                    return $control.multiInput('val');
                }else if($control.hasClass("dateInput")){
                    return $control.dateInput('val');
                } else if ($control.hasClass("coder")) {
                    return $control.coder('val');
                } else if($control.hasClass("upload")){
                    return $control.upload('val');
                } else if($control.hasClass("photo")){
                    return $control.photo('val');
                } else {
                    return $control.html();
                }
            } else if ($control.attr("type") == 'checkbox' || $control.attr("type") == 'radio') {
                return $control.prop('checked');
            } else if ($control.prop("tagName") == 'TEXTAREA') {
                var v0 = $control.val();
                if ($.trim(v0)) {
                    return v0;
                }
            } else {
                // return $.trim($control.val());
                if ($control.prop('type') == 'datetime-local' || $control.prop('type') == 'datetime') {
                    return $control.val().replace('T', ' ').replace(/-/ig,'/');
                } else {
                    return $.trim($control.val());
                }
            }
        } else {
            try {
                return this.fieldMap[name].value;
            } catch (e) {
                alert(this.id + "不存在" + name + "字段!")
                throw e;
            }
        }
    }
    RecordSet.prototype.getFieldText = function(name) {
        if (typeof this.map[name] == 'string') {
            var $control = $(this.map[name],this.container);

            if ($control.prop("tagName") == 'SPAN' || $control.prop("tagName") == 'DIV') {
                // return $control.html();
                if ($control.hasClass("summernote")) {
                    // return $control.summernote().code();
                    return $control.summernote("code");
                } else if ($control.hasClass("multiInput")) {
                    return $control.multiInput('val');
                }else if($control.hasClass("dateInput")){
                    return $control.dateInput('val');
                } else if ($control.hasClass("coder")) {
                    return $control.coder('val');
                } else if($control.hasClass("upload")){
                    return $control.upload('val');
                } else if($control.hasClass("photo")){
                    return $control.photo('val');
                } else {
                    return $control.text();
                }
            } else if ($control.attr("type") == 'checkbox' || $control.attr("type") == 'radio') {
                return $control.prop('checked');
            } else if ($control.prop("tagName") == 'TEXTAREA') {
                var v0 = $control.val();
                if ($.trim(v0)) {
                    return v0;
                }
            } else {
                // return $.trim($control.val());
                if ($control.prop('type') == 'datetime-local' || $control.prop('type') == 'datetime') {
                    return $control.val().replace('T', ' ').replace(/-/ig,'/');
                } else {
                    return $.trim($control.val());
                }
            }
        } else {
            return this.fieldMap[name].text;
        }
    }

    RecordSet.prototype.getKeyValue = function() {
        var keyValue = {};
        for (var i = 0, len = this.fieldSet.length; i < len; i++) {
            var name = this.fieldSet[i].field.name;
            var dft = this.fieldSet[i].field["dfType"];
            var dfv = this.fieldSet[i].field["dfValue"];
            var elem = this.map[name];
            if (elem) {
                var $elem = $(elem,this.container);
                if ($elem.attr("type") == 'checkbox' || $elem.attr("type") == 'radio') {
                    keyValue[name] = $elem.prop('checked');
                } else if ($elem.prop("tagName") == 'TEXTAREA') {
                    var v = $elem.val();
                    //if ($.trim(v)) {
                    //    keyValue[name] = v;
                    //} else {
                    //    continue;
                    //}
                    keyValue[name] = v;
                } else if ($elem.prop("tagName") == 'SPAN' || $elem.prop("tagName") == 'DIV') {
                    if ($elem.hasClass("summernote")) {
                        // keyValue[name] = $elem.summernote().code();
                        keyValue[name] = $elem.summernote("code");
                    } else if ($elem.hasClass("multiInput")) {
                        keyValue[name] = $elem.multiInput('val');
                    }else if($elem.hasClass("dateInput")){
                        keyValue[name]=$elem.dateInput('val');
                    } else if ($elem.hasClass("coder")) {
                        keyValue[name] = $elem.coder('val');
                    } else if ($elem.hasClass("upload")) {
                        keyValue[name] = $elem.upload('val');
                    } else if ($elem.hasClass("photo")) {
                        keyValue[name] = $elem.photo('val');
                    } else {
                        keyValue[name] = $elem.html();
                    }
                    // alert([name, keyValue[name]])
                }else {
                    /*var v = $.trim($elem.val());
                    if (v) {
                        // keyValue[name] = v;
                        if ($elem.prop('type') == 'datetime-local' || $elem.prop('type') == 'datetime') {
                            keyValue[name] = v.replace(/T/, ' ').replace(/-/ig,'/');
                        } else {
                            keyValue[name] = v;
                        }
                    } else {
                        continue;
                    }*/
                    if($elem.length === 0){
                        // keyValue[name] = this.fieldSet[i].value;
                    }else{
                        var v = $.trim($elem.val());
                        if ($elem.prop('type') == 'datetime-local' || $elem.prop('type') == 'datetime') {
                            keyValue[name] = v.replace(/T/, ' ').replace(/-/ig,'/');
                        } else {
                            keyValue[name] = v;
                        }
                    }
                }
            }
        }

        for (var i = 0, len = this.fieldSet.length; i < len; i++) {
            var name = this.fieldSet[i].field.name;
            var type = this.fieldSet[i].field.type;
            var dft = this.fieldSet[i].field["dfType"];
            var dfv = this.fieldSet[i].field["dfValue"];
            var elem = this.map[name];
            if (elem) {} else if (dfv !== undefined && dfv !== null) {
                if (dft == '3') {
                    var dataset = dfv.substring(0, dfv.indexOf(':'));
                    var field = dfv.substring(dfv.indexOf(':') + 1);

                    try {
                        this.fieldSet[i].value = eval(dataset).getFieldValue(field);
                        keyValue[name] = this.fieldSet[i].value;
                    } catch (e) {
                        alert('数据项默认值错误:' + [this.id, name, dfv])
                    }
                } else if (dft == '4') {
                    this.fieldSet[i].value = this.eval(dfv);
                    keyValue[name] = this.fieldSet[i].value;
                } else if (dft == '7') {
                    this.fieldSet[i].value = eval(dfv)();
                    keyValue[name] = this.fieldSet[i].value;
                } else if (this.fieldMap[name].value) {
                    keyValue[name] = this.fieldMap[name].value;
                } else {
                    keyValue[name] = this.fieldSet[i].value;
                }
            } else if (typeof this.fieldMap[name].value !== 'undefined' && this.fieldMap[name].value !== null) {
                keyValue[name] = this.fieldMap[name].value;
            }

            if (type == 'L') {
                if (keyValue[name] == '1') {
                    keyValue[name] = true;
                } else if (keyValue[name] == '0') {
                    keyValue[name] = false;
                } else {
                    delete keyValue[name];
                }
            } else if (keyValue[name] === "" && (/^V\d*$/.test(type) || /^F\d*$/.test(type))) {
                keyValue[name] = null;
            }
        }

        for (var i = 0, len = this.fieldSet.length; i < len; i++) {
            var name = this.fieldSet[i].field.name;
            var dft = this.fieldSet[i].field["dfType"];
            if (dft == '5' || dft == '6') {
                delete keyValue[name];
            }
        }

        var rtKeys = _.keys(keyValue);
        _.each(rtKeys, function(rtk) {
            if (_.isArray(keyValue[rtk])) {

            } else {
                if (keyValue[rtk] == null) {
                    keyValue[rtk] = "";
                }
            }

        });


        var notNullFields = this.checkData(keyValue,false);
        if(_.isEmpty(notNullFields)){

        }else{
            avaNotify.show({
                title : "必填字段不能为空",
                text : notNullFields.join(" ; "),
                type : "danger"
            });
            throw SyntaxError();
        }
        
        return keyValue;
    }



    RecordSet.prototype.getValue2 = function() {
        return this.getKeyValue();
    }

    RecordSet.prototype.getValue = function() { //=====获取表单所有字段值，key-value形式
        var keys = this.getKeyValue();
        _.each(_.keys(keys), function(k) {
            var tmp = keys[k];
            if (_.isArray(tmp)) {
                var v_str = "";
                _.each(tmp, function(v) {
                    v_str = v_str + v + ";"
                });
                keys[k] = v_str;
            }
        });

        return keys;
    }

    RecordSet.prototype.getMetaDataValue = function() { //=====获取表单数据类型，以key，value的字段数组形式
        // var notNullFields = this.checkData(null,false);
        // if(_.isEmpty(notNullFields)){

        // }else{
        //     Notify.show({
        //         title : "必填字段不能为空",
        //         text : notNullFields.join(" ; "),
        //         type : "danger"
        //     });
        //     throw SyntaxError();
        // }
        var keys = this.getKeyValue();
        // alert(JSON.stringify(keys));
        var os = [];
        _.each(_.keys(keys), function(item) {
            var tmp = keys[item];
            if (_.isArray(tmp)) {
                if(_.isEmpty(tmp)){
                    os.push({
                        fieldId: item,
                        fieldValue: ""
                    });
                }else{
                    _.each(tmp, function(v) {
                        os.push({
                            fieldId: item,
                            fieldValue: v
                        });
                    });
                }
                
            } else {
                os.push({
                    fieldId: item,
                    fieldValue: tmp
                });
            }
        });
        // alert(JSON.stringify(os));
        return os;

    }

    RecordSet.prototype.getOrigionMetaDataValue = function() { //=====获取表单数据类型，以key，value的字段数组形式
        var keys = this.getKeyValue();
        var os = [];
        for (var key in keys) {
            os.push({
                fieldId: key,
                fieldValue: keys[key]
            });
        }
        return os;
    }


    RecordSet.prototype.openKVData = function(ds) { //====以key,value的形式初始化表单数据

        console.log("=================begin=================");
        if (_.isEmpty(ds)) {
            return;
        }

        var multiKeys = [];
        if (!_.isEmpty(this.fieldSet)) {
            _.each(this.fieldSet, function(fs) {
                if (fs.field.type == "CS") {
                    multiKeys.push(JSON.stringify(fs.field.name));
                }
            });
        }
        var uploadKeys = [];
        if (!_.isEmpty(this.fieldSet)) {
            _.each(this.fieldSet, function(fs) {
                if (fs.field.type == "X") {
                    uploadKeys.push(JSON.stringify(fs.field.name));
                }
            });
        }
        console.log(JSON.stringify(multiKeys));
        var result = {};
        _.each(ds, function(item) {
            if (_.has(result, item.fieldId)) {
                if (_.isArray(result[item.fieldId])) {
                    result[item.fieldId].push(item.fieldValue);
                } else {
                    var tmp = result[item.fieldId];
                    result[item.fieldId] = [];
                    result[item.fieldId].push(tmp);
                    result[item.fieldId].push(item.fieldValue);
                }
            } else {
                if (_.contains(multiKeys, item.fieldId + "")) {

                    result[item.fieldId] = [];
                    result[item.fieldId].push(item.fieldValue);
                } else if(_.contains(uploadKeys, item.fieldId + "")){
                    result[item.fieldId] = [];
                    result[item.fieldId].push(item.fieldValue);
                }else {
                    result[item.fieldId] = item.fieldValue;
                }

            }
        });


        console.log(JSON.stringify(result));
        console.log("=================end=================");
        this.openData(result);
    }

    RecordSet.prototype.openOrigionKVData = function(ds) { //====以key,value的形式初始化表单数据
        this.openData(result);
        if (_.isEmpty(ds)) {
            return;
        }
        var dsKey = [];
        var dsValue = [];
        _.each(ds, function(item) {
            dsKey.push(item.fieldId);
            dsValue.push(item.fieldValue);
        });
        var ds_kv = _.object(dsKey, dsValue);
        this.openData(ds_kv);
    }

    RecordSet.prototype.buildControl = function(targetDiv) {}

    function uploadFile() {
        $.getJSON('/tbl-design/uploadFile', function(rsp) {
            if (rsp.code == 0) {
                myDropzone = new Dropzone("#previews", {
                    url: "", // Set the url-
                    parallelUploads: 5,
                    maxFiles: 1,
                    maxFilesize: 1024,
                    // acceptedFiles: ".xls",
                    // previewTemplate: previewTemplate,
                    autoQueue: false, // Make sure the files aren't queued until manually added
                    previewsContainer: "#previews", // Define the container to display the previews
                    clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
                });
                myDropzone.on("success", function(file, res) {
                    data = JSON.parse(res);
                    if (data) {
                        fileSize = data.fileSize / 1024;
                        fileSize = fileSize.toFixed(0) == 0 ? 1 : fileSize;
                        file = {
                            documentName: data.newName,
                            documentSize: fileSize
                        };
                        files.push(file);
                        srcFileDir = data.srcFileDir;
                    }

                });
            }
        });
    }

    RecordSet.prototype.checkData = function(keyValue,isAll) {
        // if (keyValue == null) keyValue = this.getValue2();
        var errInfo = [];
        for (var i = 0, len = this.fieldSet.length; i < len; i++) {
            var fieldName = this.fieldSet[i].field['name'];
            var fieldLabel = this.fieldSet[i].field['label'];
            if(isAll || $(this.map[this.fieldSet[i].field.name],this.container).length){
                if (this.fieldSet[i].field.type != 'L' && this.fieldSet[i].field["notNull"]) {
                    if (keyValue[fieldName] === undefined || keyValue[fieldName] === null || keyValue[fieldName] === '') {
                        errInfo.push(fieldLabel + "不能为空!");
                    }
                }
            }
            
        }
        return errInfo;
    }

    function tbl_showLoader(){
        var $ = window.top.$;
        if($("#utility-screen-loader").length === 0){
            var html = "<div id='utility-screen-loader'>" +
                            "<div class='loader-inner line-scale'>" +
                                "<div></div>" +
                                "<div></div>" +
                                "<div></div>" +
                                "<div></div>" +
                                "<div></div>" +
                            "</div>" +
                        "</div>";
            $("body").append(html);
            $("#utility-screen-loader").css({
                "position": "fixed",
                "z-index": "1050", //bigger than magnific popup
                "width": "100%",
                "height": "100%",
                "left": "0",
                "top": "0",
                "background-color": "rgba(0, 0, 0, 0.15)",
                "display": "none",
            });
            $("#utility-screen-loader>.loader-inner").css({
                "position": "absolute",
                "top": "45%",
                "left": "50%",
                "margin-left": "-25px",
            });
        }
        $("#utility-screen-loader").show();
    }

    function tbl_hideLoader(){
        window.top.$("#utility-screen-loader").hide();
    }

    return {
        loadCode: loadCode,
    }

});