define([
    './tbl-meta-data',
], function(tblMetaData) {
    var fields = [];
    var currentDocument = null;
    var timerSave = 1000;
    var stopsave = 0;
    var startdrag = 0;
    var demoHtml = $(".demo").html();
    var currenteditor = null;
    var layouthistory;

    function init() {
        $(document).ready(function() {
                // CKEDITOR.disableAutoInline = true;
                // //restoreData();
                // var contenthandle = CKEDITOR.replace( 'contenteditor' ,{
                //  language: 'zh-cn',
                //  contentsCss: ['css/bootstrap-combined.min.css'],
                //  allowedContent: true
                // });
                // $("body").css("min-height", $(window).height() - 90);
                $(".demo").css("min-height", $(window).height() - 160);
                $("#tab-layout .lyrow").draggable({
                    connectToSortable: ".demo",
                    helper: "clone",
                    handle: ".drag",
                    start: function(e, t) {
                        if (!startdrag) stopsave++;
                        startdrag = 1;
                    },
                    drag: function(e, t) {
                        t.helper.width('100%')
                    },
                    stop: function(e, t) {
                        if (t && t.helper) {
                            t.helper.removeAttr('style');
                        }
                        // t.helper.removeAttr('style');
                        // $(".demo .column").sortable({
                        //     opacity: .35,
                        //     connectWith: ".column",
                        //     start: function(e, t) {
                        //         if (!startdrag) stopsave++;
                        //         startdrag = 1;
                        //     },
                        //     stop: function(e, t) {
                        //         if (stopsave > 0) stopsave--;
                        //         startdrag = 0;
                        //     }
                        // });
                        if (stopsave > 0) stopsave--;
                        startdrag = 0;
                        initContainer();
                    }
                });
                $("#tab-layout .box").draggable({
                    connectToSortable: ".column",
                    helper: "clone",
                    handle: ".drag",
                    start: function(e, t) {
                        if (!startdrag) stopsave++;
                        startdrag = 1;
                    },
                    drag: function(e, t) {
                        t.helper.width('100%')
                    },
                    stop: function(e, t) {
                        if (t && t.helper) {
                            t.helper.removeAttr('style');
                        }
                        // if (t.helper.find('.col-md-2').length && t.helper.parent().hasClass('col-md-12')) {
                        //     t.helper.find('.col-md-2').removeClass('col-md-2').addClass('col-md-1');
                        //     t.helper.find('.col-md-10').removeClass('col-md-10').addClass('col-md-11');
                        // }
                        // t.helper.removeAttr('style');
                        handleJsIds();
                        if (stopsave > 0) stopsave--;
                        startdrag = 0;
                        initContainer();
                    }
                });
                initContainer();
                $('body.edit .demo').on("click", "[data-target=#editorModal]", function(e) {
                    e.preventDefault();
                    currenteditor = $(this).parent().parent().find('.view');
                    var eText = currenteditor.html();
                    contenthandle.setData(eText);
                });
                $("#savecontent").click(function(e) {
                    e.preventDefault();
                    currenteditor.html(contenthandle.getData());
                    initContainer();
                });
                $("[data-target=#downloadModal]").click(function(e) {
                    e.preventDefault();
                    downloadLayoutSrc();
                });
                $("[data-target=#shareModal]").click(function(e) {
                    e.preventDefault();
                    handleSaveLayout();
                });
                $("#download").click(function() {
                    downloadLayout();
                    return false
                });
                $("#downloadhtml").click(function() {
                    downloadHtmlLayout();
                    return false
                });
                $("#edit").click(function() {
                    $("#main-content-area").removeClass("devpreview sourcepreview");
                    $("#main-content-area").addClass("edit");
                    removeMenuClasses();
                    $(this).addClass("active");
                    return false
                });
                $("#new").click(function(e) {
                    e.preventDefault();
                    clearDemo()
                });
                $("#clear").click(function(e) {
                    e.preventDefault();
                    clearDemo()
                });
                $("#open").click(function() {
                    $.getJSON('/tbl-design/getTblTemplate', {

                    }).done(function(rsp) {
                        if (rsp.code == 0) {
                            var ret = rsp.data;
                            if (ret) {
                                // $('#pathTxt').val(ret.path||'');
                                // $('#keyTxt').val(ret.key||'');
                                // $('#nameTxt').val(ret.name||'')
                                $('.demo').html(ret.code);
                                initContainer();
                                window.fields.splice(0, window.fields.length);
                                for (var i = 0; i < ret.fields.length; i++) {
                                    window.fields.push(ret.fields[i]);
                                }
                            }
                        } else {

                        }
                    });

                    // openDialog({title:'打开文件',iframe:'openFile.html',param:fields,height:490,width:400,callback:function(ret){
                    //  if(ret){
                    //      $('#pathTxt').val(ret.path||'');
                    //      $('#keyTxt').val(ret.key||'');
                    //      $('#nameTxt').val(ret.name||'')
                    //      $('.demo').html(ret.code);              
                    //      initContainer();
                    //      window.fields.splice(0,window.fields.length);
                    //      for(var i=0;i<ret.fields.length;i++){
                    //          window.fields.push(ret.fields[i]);
                    //      }
                    //  }
                    // }});     
                });
                $("#saveBtn").click(function() {
                    // var json={"path":$('#pathTxt').val(),"key":$('#keyTxt').val(),"name":$('#nameTxt').val(),code:$('.demo').html(),html:formLayoutSrc(),fields:fields};
                    var json = {
                        "path": "",
                        "key": "11111",
                        "name": "",
                        code: $('.demo').html(),
                        html: formLayoutSrc(),
                        fields: fields
                    };
                    if (json.key) {
                        $.getJSON('/tbl-design/saveTblTemplate', {
                            tblTemplate: json
                        }).done(function(rsp) {
                            if (rsp.code == 0) {

                            } else {

                            }
                        });

                        $.ajax({
                            type: "post",
                            dataType: "json",
                            processData: false,
                            async: true,
                            data: JSON.stringify({
                                "gwdpKey": json
                            }),
                            timeout: 300000,
                            url: "../gwdpPlatform/bootstrapService?method=saveForm",
                            beforeSend: function(xhr, settings) {
                                xhr.setRequestHeader("ajax-encoding", "YES");
                            },
                            success: function(odata, status, xhr) {
                                $('#shareModal').modal();
                            },
                            complete: function(xhr, ts) {
                                xhr = null;
                            }
                        });
                    }
                });
                $('#metaData').click(function() {
                    openDialog({
                        title: '配置元数据',
                        iframe: 'metaData.html',
                        param: window.fields,
                        height: 700,
                        width: 1000,
                        callback: function(ret) {
                            if (ret) {
                                window.fields.splice(0, window.fields.length);
                                for (var i = 0; i < ret.fields.length; i++) {
                                    window.fields.push(ret.fields[i]);
                                }
                                if (ret.code) {
                                    $('.demo').append(ret.code);
                                    initContainer();
                                }
                            }
                        }
                    });
                });
                $("#devpreview").click(function() {
                    $("body").removeClass("edit sourcepreview");
                    $("body").addClass("devpreview");
                    removeMenuClasses();
                    $(this).addClass("active");
                    return false
                });
                $("#sourcepreview").click(function() {
                    $("#main-content-area").removeClass("edit");
                    $("#main-content-area").addClass("devpreview sourcepreview");
                    removeMenuClasses();
                    $(this).addClass("active");
                    return false
                });
                $("#fluidPage").click(function(e) {
                    e.preventDefault();
                    changeStructure("container", "container-fluid");
                    $("#fixedPage").removeClass("active");
                    $(this).addClass("active");
                    downloadLayoutSrc()
                });
                $("#fixedPage").click(function(e) {
                    e.preventDefault();
                    changeStructure("container-fluid", "container");
                    $("#fluidPage").removeClass("active");
                    $(this).addClass("active");
                    downloadLayoutSrc()
                });
                // $(".nav-header").click(function() {
                //     $("#tab-layout .boxes, #tab-layout .rows").hide();
                //     $(this).next().slideDown()
                // });
                $('#undo').click(function() {
                    stopsave++;
                    if (undoLayout()) initContainer();
                    stopsave--;
                });
                $('#redo').click(function() {
                    stopsave++;
                    if (redoLayout()) initContainer();
                    stopsave--;
                });
                $('#previewBtn').click(function() {
                    window.open('preview/preview.html#' + $('#keyTxt').val());
                });

                removeElm();
                gridSystemGenerator();
                setInterval(function() {
                    handleSaveLayout()
                }, timerSave);

                $('.demo').on('click', "label,input,select,textarea,.row,.column,.summernote,.multiInput,.dateInput,.coder,.photo,upload", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var props;
                    var currElem = $(this);
                    var tn = currElem.prop('tagName').toLowerCase();
                    if (currElem.hasClass('row')) {
                        var trs = [];
                        var vs = [];
                        var cols = currElem.children();
                        for (var i = 0; i < cols.length; i++) {
                            var cs = cols.eq(i).prop('className').split(' ');
                            for (var j = 0; j < cs.length; j++) {
                                if (cs[j].indexOf('col-md-') == 0) {
                                    vs.push(cs[j].substring(7));
                                    break;
                                }
                            }
                        }

                        trs.push('<tr><td>column</td><td><input value="' + vs + '"/></tr>');

                        $('#propTable').html('<table class="table"><thead><th>属性名</th><th>属性值</th><thead><tbody>' + trs.join('') + '</tbody></table>').find('input').change(function() {
                                var cols = currElem.children();
                                var pfield = $(this).parent().prev().text();
                                if (pfield == 'column') {
                                    var v = $(this).val();
                                    if (v) {
                                        var ns = v.split(',');
                                        if (cols.length > ns.length) {
                                            for (var x = ns.length; x < cols.length; x++) {
                                                cols.eq(x).remove();
                                            }
                                        } else if (cols.length < ns.length) {
                                            for (var x = cols.length; x < ns.length; x++) {
                                                currElem.append("<div class='col-md-" + ns[x] + " column ui-sortable'/>");
                                            }
                                            initContainer();
                                        }

                                        for (x = 0; x < Math.min(cols.length, ns.length); x++) {
                                            cols.eq(x).removeClass('col-md-' + vs[x]).addClass('col-md-' + ns[x]);
                                            if (vs[x] == 6 && ns[x] == 12) {
                                                cols.eq(x).find(".col-md-4").removeClass("col-md-4").addClass("col-md-2");
                                                cols.eq(x).find(".col-md-8").removeClass("col-md-8").addClass("col-md-10");
                                            } else if (vs[x] == 6 && ns[x] == 12) {
                                                cols.eq(x).find(".col-md-2").removeClass("col-md-2").addClass("col-md-4");
                                                cols.eq(x).find(".col-md-10").removeClass("col-md-10").addClass("col-md-8");
                                            }
                                        }
                                        vs = ns;
                                    }
                                }
                            })
                            // $('#propTable').html('<table class="table"><thead><th>属性名</th><th>属性值</th><thead><tbody>' + trs.join('') + '</tbody></table>').find('input').change(function() {
                            //     var cols = currElem.children().children();
                            //     var pfield = $(this).parent().prev().text();
                            //     if (pfield == 'column') {
                            //         var v = $(this).val();
                            //         if (v) {
                            //             var ns = v.split(',');
                            //             if (cols.length > ns.length) {
                            //                 for (var x = ns.length; x < cols.length; x++) {
                            //                     cols.eq(x).remove();
                            //                 }
                            //             } else if (cols.length < ns.length) {
                            //                 for (var x = cols.length; x < ns.length; x++) {
                            //                     currElem.children().append("<div class='col-md-" + ns[x] + " column ui-sortable " + (x % 2 == 0 ? "control-label" : "") + "'/>");
                            //                 }
                            //             }

                        //             for (x = 0; x < Math.min(cols.length, ns.length); x++) {
                        //                 cols.eq(x).removeClass('col-md-' + vs[x]).addClass('col-md-' + ns[x]);
                        //             }
                        //             vs = ns;
                        //         }
                        //         initContainer();
                        //     }
                        // });
                    } else if (currElem.hasClass('column')) {
                        var trs = [];
                        var vs = [];

                        var cs = currElem.prop('className').split(' ');
                        for (var j = 0; j < cs.length; j++) {
                            if (cs[j] != 'column' && cs[j] != 'ui-sortable') {
                                vs.push(cs[j]);
                                break;
                            }
                        }

                        trs.push('<tr><td>class</td><td><input value="' + vs + '"/></tr>');

                        $('#propTable').html('<table class="table"><thead><th>属性名</th><th>属性值</th><thead><tbody>' + trs.join('') + '</tbody></table>').find('input').change(function() {
                            var pfield = $(this).parent().prev().text();
                            if (pfield == 'class') {
                                var v = $(this).val();
                                if (v) {
                                    for (var i = 0; i < vs.length; i++) {
                                        currElem.removeClass(vs[i]);
                                    }

                                    var ns = v.split(',');
                                    for (var i = 0; i < ns.length; i++) {
                                        currElem.addClass(ns[i]);
                                    }
                                    vs = ns;
                                    initContainer();
                                }
                            }
                        });
                    } else {
                        if (tn == 'input') {
                            props = propMap[currElem.prop('type')];
                        } else if (currElem.hasClass("summernote")) {
                            props = propMap["summernote"];
                        } else if (currElem.hasClass("multiInput")) {
                            props = propMap["multiInput"];
                        }else if(currElem.hasClass("dateInput")){
                            props=propMap["dateInput"];
                        } else if (currElem.hasClass("upload")) {
                            props = propMap["upload"];
                        } else if (currElem.hasClass("coder")) {
                            props = propMap["coder"];
                        } else if (currElem.hasClass("photo")) {
                            props = propMap["photo"];
                        } else {
                            props = propMap[tn];
                        }
                        var trs = [];

                        for (var i = 0; i < defaultProp.length; i++) {
                            var prop = defaultProp[i];
                            var pfield = prop.name;
                            var val = ((pfield == 'cfield' || pfield == 'style'|| pfield =='rows' ? currElem.attr(pfield) : currElem.prop(pfield)) || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\'/ig, '&quot;');
                            var propElem;
                            if (prop.type == 'B') {
                                var dict = prop.dict;
                                var opts = ['<option/>'];
                                for (var j = 0; j < dict.length; j++) {
                                    opts.push('<option value="' + dict[j].name + '">' + dict[j].label + '</option>');
                                }
                                propElem = '<select class="form-control">' + opts.join('') + '</select>';
                            } else {
                                propElem = '<input class="form-control" type="text" value="' + val + '">';
                            }

                            trs.push('<tr><td>' + pfield + '</td><td>' + propElem + '</tr>');
                        }

                        for (var i = 0; i < props.length; i++) {
                            var prop = props[i];
                            var pfield = prop.name;
                            var val = (pfield == 'cfield' || pfield == 'style'|| pfield =='rows'||pfield=='multi' ? currElem.attr(pfield) : currElem.prop(pfield));
                            if (typeof val == 'string') {
                                val = val.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\'/ig, '&quot;');
                            } else if (typeof val != 'boolean') {
                                val = '';
                            }

                            var propElem;
                            if (prop.type == 'B') {
                                var dict = prop.dict;
                                var opts = ['<option/>'];
                                for (var j = 0; j < dict.length; j++) {
                                    if (pfield == 'cfield' && currElem.attr(pfield) == dict[j].name) {
                                        opts.push('<option value="' + dict[j].name + '" selected>' + dict[j].label + '</option>');
                                    } else {
                                        opts.push('<option value="' + dict[j].name + '">' + dict[j].label + '</option>');
                                    }

                                }
                                propElem = '<select class="form-control">' + opts.join('') + '</select>';
                            } else if (prop.type == 'L') {
                                propElem = '<input class="form-control" type="checkbox" ' + (val ? "checked" : "") + '/>';
                            } else {
                                propElem = '<input class="form-control" type="text" value="' + val + '"</td>';
                            }

                            trs.push('<tr><td>' + pfield + '</td><td>' + propElem + '</tr>');
                        }

                        $('#propTable').html('<table class="table"><thead><th>属性名</th><th>属性值</th><thead><tbody>' + trs.join('') + '</tbody></table>').find('input,select').change(function() {
                            var pfield = $(this).parent().prev().text();
                            if ($(this).prop('type') == 'checkbox') {
                                if (pfield == 'multi') {
                                    currElem.attr(pfield, $(this).prop('checked'));
                                } else {
                                    currElem.prop(pfield, $(this).prop('checked'));
                                }
                                // currElem.prop(pfield, $(this).prop('checked'));
                            } else {
                                // if (pfield == 'cfield' || pfield == 'style') {

                                //     currElem.attr(pfield, $(this).val());
                                // } else {
                                //     currElem.prop(pfield, $(this).val());
                                // }
                                if(pfield=='cfield'){
                                    currElem.attr(pfield,$(this).val());
                                    var tx=$(this).children(':selected').text();
                                    if(tx.indexOf(':')>-1){
                                        tx=tx.split(':')[0];
                                    }
                                    currElem.parent().prev().children('label').text(tx);
                                }else if(pfield=='style'||pfield=='rows'){
                                    currElem.attr(pfield,$(this).val());
                                }else{
                                    currElem.prop(pfield,$(this).val());
                                }
                            }
                        });
                    }

                });
            })
            /////////////////////////////////
            //var currElem;

        var propMap = {
            "label": [{
                "name": "for",
                "type": "C"
            }, {
                "name": "innerText",
                "type": "C"
            }],
            "text": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "readOnly",
                "type": "L"
            }],
            "password": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "readOnly",
                "type": "L"
            }],
            "radio": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }],
            "checkbox": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "readOnly",
                "type": "L"
            }],
            "date": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "min",
                "type": "V"
            }, {
                "name": "max",
                "type": "V"
            }],
            "time": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "min",
                "type": "V"
            }, {
                "name": "max",
                "type": "V"
            }],
            "datetime": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "min",
                "type": "V"
            }, {
                "name": "max",
                "type": "V"
            }],
            "week": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "min",
                "type": "V"
            }, {
                "name": "max",
                "type": "V"
            }],
            "month": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "min",
                "type": "V"
            }, {
                "name": "max",
                "type": "V"
            }],
            "range": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "min",
                "type": "V"
            }, {
                "name": "max",
                "type": "V"
            }],
            "number": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "step",
                "type": "V"
            }, {
                "name": "min",
                "type": "V"
            }, {
                "name": "max",
                "type": "V"
            }],
            "select": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "dict",
                "type": "C"
            }, {
                "name": "multi",
                "type": "L"
            }],
            "textarea": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            },{
                "name": "rows",
                "type": "V"
            }],
            "file": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "rela",
                "type": "B",
                "dict": fields
            }],
            "multiInput": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }],
            "summernote": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }],
            "coder": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }, {
                "name": "dict",
                "type": "C"
            }, {
                "name": "multi",
                "type": "L"
            }],
            "photo": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }],
            "upload": [{
                "name": "name",
                "type": "C"
            }, {
                "name": "placeholder",
                "type": "C"
            }, {
                "name": "cfield",
                "type": "B",
                "dict": fields
            }]
        }

        var defaultProp = [{
            "name": "id",
            "type": "C"
        }, {
            "name": "className",
            "type": "C"
        }, {
            "name": "style",
            "type": "C"
        }];
        // clearTblDesign();
    }

    function supportstorage() {
        if (typeof window.localStorage == 'object')
            return true;
        else
            return false;
    }

    function handleSaveLayout() {
        var e = $(".demo").html();
        if (!stopsave && e != window.demoHtml) {
            stopsave++;
            window.demoHtml = e;
            saveLayout();
            stopsave--;
        }
    }

    function saveLayout() {
        var data = layouthistory;
        if (!data) {
            data = {};
            data.count = 0;
            data.list = [];
        }
        if (data.list.length > data.count) {
            for (i = data.count; i < data.list.length; i++)
                data.list[i] = null;
        }
        data.list[data.count] = window.demoHtml;
        data.count++;
        if (supportstorage()) {
            localStorage.setItem("layoutdata", JSON.stringify(data));
        }
        layouthistory = data;
        //console.log(data);
        /*$.ajax({  
            type: "POST",  
            url: "/build/saveLayout",  
            data: { layout: $('.demo').html() },  
            success: function(data) {
                //updateButtonsVisibility();
            }
        });*/
    }

    function downloadLayout() {

        $.ajax({
            type: "POST",
            url: "/build/downloadLayout",
            data: {
                layout: $('#download-layout').html()
            },
            success: function(data) {
                window.location.href = '/build/download';
            }
        });
    }

    function downloadHtmlLayout() {
        $.ajax({
            type: "POST",
            url: "/build/downloadLayout",
            data: {
                layout: $('#download-layout').html()
            },
            success: function(data) {
                window.location.href = '/build/downloadHtml';
            }
        });
    }

    function undoLayout() {
        var data = layouthistory;
        //console.log(data);
        if (data) {
            if (data.count < 2) return false;
            window.demoHtml = data.list[data.count - 2];
            data.count--;
            $('.demo').html(window.demoHtml);
            if (supportstorage()) {
                localStorage.setItem("layoutdata", JSON.stringify(data));
            }
            return true;
        }
        return false;
        /*$.ajax({  
            type: "POST",  
            url: "/build/getPreviousLayout",  
            data: { },  
            success: function(data) {
                undoOperation(data);
            }
        });*/
    }

    function redoLayout() {
        var data = layouthistory;
        if (data) {
            if (data.list[data.count]) {
                window.demoHtml = data.list[data.count];
                data.count++;
                $('.demo').html(window.demoHtml);
                if (supportstorage()) {
                    localStorage.setItem("layoutdata", JSON.stringify(data));
                }
                return true;
            }
        }
        return false;
        /*
        $.ajax({  
            type: "POST",  
            url: "/build/getPreviousLayout",  
            data: { },  
            success: function(data) {
                redoOperation(data);
            }
        });*/
    }

    function handleJsIds() {
        handleModalIds();
        handleAccordionIds();
        handleCarouselIds();
        handleTabsIds()
    }

    function handleAccordionIds() {
        var e = $(".demo #myAccordion");
        var t = randomNumber();
        var n = "panel-" + t;
        var r;
        e.attr("id", n);
        e.find(".panel .panel-default").each(function(e, t) {
            r = "panel-element-" + randomNumber();
            $(t).find(".panel-toggle").each(function(e, t) {
                $(t).attr("data-parent", "#" + n);
                $(t).attr("href", "#" + r)
            });
            $(t).find(".panel-collapse").each(function(e, t) {
                $(t).attr("id", r)
            })
        })
    }

    function handleCarouselIds() {
        var e = $(".demo #myCarousel");
        var t = randomNumber();
        var n = "carousel-" + t;
        e.attr("id", n);
        e.find(".carousel-indicators li").each(function(e, t) {
            $(t).attr("data-target", "#" + n)
        });
        e.find(".left").attr("href", "#" + n);
        e.find(".right").attr("href", "#" + n)
    }

    function handleModalIds() {
        var e = $(".demo #myModalLink");
        var t = randomNumber();
        var n = "modal-container-" + t;
        var r = "modal-" + t;
        e.attr("id", r);
        e.attr("href", "#" + n);
        e.next().attr("id", n)
    }

    function handleTabsIds() {
        var e = $(".demo #myTabs");
        var t = randomNumber();
        var n = "tabs-" + t;
        e.attr("id", n);
        e.find(".tab-pane").each(function(e, t) {
            var n = $(t).attr("id");
            var r = "panel-" + randomNumber();
            $(t).attr("id", r);
            $(t).parent().parent().find("a[href=#" + n + "]").attr("href", "#" + r)
        })
    }

    function randomNumber() {
        return randomFromInterval(1, 1e6)
    }

    function randomFromInterval(e, t) {
        return Math.floor(Math.random() * (t - e + 1) + e)
    }

    function gridSystemGenerator() {
        $(".lyrow .preview input").bind("keyup", function() {
            var e = 0;
            var t = "";
            var n = $(this).val().split(" ", 12);
            $.each(n, function(n, r) {
                e = e + parseInt(r);
                t += '<div class="span' + r + ' column"></div>'
            });
            if (e == 12) {
                $(this).parent().next().children().html(t);
                $(this).parent().prev().show()
            } else {
                $(this).parent().prev().hide()
            }
        })
    }

    function removeElm() {
        $(".demo").delegate(".remove", "click", function(e) {
            e.preventDefault();
            $(this).parent().remove();
            if (!$(".demo .lyrow").length > 0) {
                clearDemo()
            }
        })
    }

    function clearDemo() {
        $(".demo").empty();
        layouthistory = null;
        if (supportstorage())
            localStorage.removeItem("layoutdata");
    }

    function removeMenuClasses() {
        $("#menu-layoutit li button").removeClass("active")
    }

    function changeStructure(e, t) {
        $("#download-layout ." + e).removeClass(e).addClass(t)
    }

    function cleanHtml(e) {
        $(e).parent().append($(e).children().html())
    }

    function downloadLayoutSrc() {
        var e = "";
        $("#download-layout").children().html($(".demo").html());
        var t = $("#download-layout").children();
        t.find(".preview, .configuration, .drag, .remove").remove();
        t.find(".lyrow").addClass("removeClean");
        t.find(".box-element").addClass("removeClean");
        t.find(".lyrow .lyrow .lyrow .lyrow .lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".lyrow .lyrow .lyrow .lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".lyrow .lyrow .lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".lyrow .lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".removeClean").remove();
        $("#download-layout .column").removeClass("ui-sortable");
        $("#download-layout .row").removeClass("clearfix").children().removeClass("column");
        if ($("#download-layout .container").length > 0) {
            changeStructure("row", "row")
        }
        formatSrc = $.htmlClean($("#download-layout").html(), {
            format: true,
            allowedAttributes: [
                ["id"],
                ["class"],
                ["cfield"],
                ["rows"],
                ["data-toggle"],
                ["data-target"],
                ["data-parent"],
                ["role"],
                ["data-dismiss"],
                ["aria-labelledby"],
                ["aria-hidden"],
                ["data-slide-to"],
                ["data-slide"]
            ]
        });
        $("#download-layout").html(formatSrc);
        $("#downloadModal textarea").empty();
        $("#downloadModal textarea").val(formatSrc)
    }

    function formLayoutSrc() {
        var e = "";
        $("#download-layout").children().html($(".demo").html());
        var t = $("#download-layout").children();
        t.find(".preview, .configuration, .drag, .remove").remove();
        t.find(".lyrow").addClass("removeClean");
        t.find(".box-element").addClass("removeClean");
        t.find(".lyrow .lyrow .lyrow .lyrow .lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".lyrow .lyrow .lyrow .lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".lyrow .lyrow .lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".lyrow .lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".lyrow .removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".removeClean").each(function() {
            cleanHtml(this)
        });
        t.find(".removeClean").remove();
        $("#download-layout .column").removeClass("ui-sortable");
        $("#download-layout .row").removeClass("clearfix").children().removeClass("column");
        if ($("#download-layout .container").length > 0) {
            changeStructure("row", "row")
        }
        var formatSrc = $.htmlClean(t.html(), {
            format: true,
            allowedAttributes: [
                ["id"],
                ["class"],
                ["cfield"],
                ["rows"],
                ["data-toggle"],
                ["data-target"],
                ["data-parent"],
                ["role"],
                ["data-dismiss"],
                ["aria-labelledby"],
                ["aria-hidden"],
                ["data-slide-to"],
                ["data-slide"],
                ["multi"],
                ["dict"],
                ["style"]
            ]
        });
        return formatSrc;
    }

    $(window).resize(function() {
        $("body").css("min-height", $(window).height() - 90);
        $(".demo").css("min-height", $(window).height() - 160)
    });

    function restoreData() {
        if (supportstorage()) {
            layouthistory = JSON.parse(localStorage.getItem("layoutdata"));
            if (!layouthistory) return false;
            window.demoHtml = layouthistory.list[layouthistory.count - 1];
            if (window.demoHtml) $(".demo").html(window.demoHtml);
        }
    }

    function initContainer() {
        $(".demo, .demo .column").sortable({
            connectWith: ".column",
            opacity: .35,
            handle: ".drag",
            start: function(e, t) {
                if (!startdrag) stopsave++;
                startdrag = 1;
            },
            stop: function(e, t) {
                if (stopsave > 0) stopsave--;
                startdrag = 0;
                setTimeout(initContainer, 100);
            }
        });

        $(".demo .column").each(function() {
            var t = $(this);
            var divs = t.children().children(".view").children("div");
            // if (divs.hasClass("col-md-4") && t.hasClass("col-md-12")) {
            //     divs.filter('.col-md-4').removeClass('col-md-4').addClass('col-md-2');
            //     divs.filter('.col-md-8').removeClass('col-md-8').addClass('col-md-10');
            // } else if (divs.hasClass("col-md-2") && t.hasClass("col-md-6")) {
            //     divs.filter('.col-md-2').removeClass('col-md-2').addClass('col-md-4');
            //     divs.filter('.col-md-10').removeClass('col-md-10').addClass('col-md-8');
            // }

            if (divs.hasClass("col-md-4") && t.hasClass("fullrow")) {
                divs.filter('.col-md-4').removeClass('col-md-4').addClass('col-md-2');
                divs.filter('.col-md-8').removeClass('col-md-8').addClass('col-md-10');
            } else if (divs.hasClass("col-md-2") && t.hasClass("halfrow")) {
                divs.filter('.col-md-2').removeClass('col-md-2').addClass('col-md-4');
                divs.filter('.col-md-10').removeClass('col-md-10').addClass('col-md-8');
            }
        });

        var menu = new BootstrapMenu('.demo .column', {
            fetchElementData: function($elem) {
                return $elem;
            },
            actions: [{
                name: '删除',
                onClick: function($elem) {
                    $elem.remove();
                }
            }, {
                name: '在之前插入',
                onClick: function($elem) {
                    $elem.before('<div class="col-md-12 column ui-sortable"></div>');
                }
            }, {
                name: '在之后插入',
                onClick: function($elem) {
                    $elem.after('<div class="col-md-12 column ui-sortable"></div>');
                }
            }, {
                name: '向前移动',
                onClick: function($elem) {
                    $elem.after($elem.prev());
                }
            }, {
                name: '向后移动',
                onClick: function($elem) {
                    $elem.before($elem.next());
                }
            }]
        });

        configurationElm();
    }

    function configurationElm(e, t) {
        $(".demo").delegate(".configuration > a", "click", function(e) {
            e.preventDefault();
            var t = $(this).parent().next().next().children();
            $(this).toggleClass("active");
            t.toggleClass($(this).attr("rel"))
        });
        $(".demo").delegate(".configuration .dropdown-menu a", "click", function(e) {
            e.preventDefault();
            var t = $(this).parent().parent();
            var n = t.parent().parent().next().next().children();
            t.find("li").removeClass("active");
            $(this).parent().addClass("active");
            var r = "";
            t.find("a").each(function() {
                r += $(this).attr("rel") + " "
            });
            t.parent().removeClass("open");
            n.removeClass(r);
            n.addClass($(this).attr("rel"))
        })
    }

    function rendFromTblMetaDt(info,tableID) {
        tblMetaData.renderFromMetaData2(info,tableID);
        initContainer();
        fields.splice(0, fields.length);
        for (var i = 0; i < info.length; i++) {
            fields.push(info[i]);
        }

    }

    function clearTblDesign(e) {
        e.preventDefault();
        clearDemo();
        fields.splice(0, fields.length);
        // $("#clearTblDesign").click(function(e) {

        // });
    }

    function openTblDesign(info) {
        clearDemo();
        $.getJSON('/tbl-design/getTblTemplate', {
            ly_key: info.currentLayout.ly_key,
            ly_tblId: info.currentTblId
        }).done(function(rsp) {
            if (rsp.code == 0) {
                if (rsp.data.layoutContent.length == 0) {
                    return;
                }
                var ret = JSON.parse(rsp.data.layoutContent);
                if (ret) {
                    // $('#pathTxt').val(ret.path||'');
                    // $('#keyTxt').val(ret.key||'');
                    // $('#nameTxt').val(ret.name||'')
                    $('.demo').html(ret.code);
                    initContainer();
                    fields.splice(0, fields.length);
                    for (var i = 0; i < ret.fields.length; i++) {
                        fields.push(ret.fields[i]);
                    }
                }
            } else {

            }
        });
    }

    function saveTblDesign(info) {

        var json = {
            "path": info.ly_path,
            "key": info.ly_key,
            "name": info.ly_title,
            code: $('.demo').html(),
            html: formLayoutSrc(),
            fields: fields
        };

        if (json.key) {
            $.post('/tbl-design/saveTblTemplate', {
                layoutId: info.ly_key,
                layoutName: info.ly_title,
                layoutDesc: info.ly_desc,
                layoutContent: JSON.stringify(json),
                state: 0,
                layoutDefault: info.ly_default
            }).done(function(rsp) {
                rsp = JSON.parse(rsp);
                if (rsp.code == 0) {
                    console.log("save tbl template success.");
                } else {
                    console.log("save tbl template failed.");
                }
            });
        }
    }

    function newTblDesign(e) {
        e.preventDefault();
        clearDemo()
    }

    function previewTblDesign() {
        $("#main-content-area").removeClass("edit");
        $("#main-content-area").addClass("devpreview sourcepreview");
        removeMenuClasses();
        $(this).addClass("active");
        return false
    }

    function editviewTblDesign() {
        $("#main-content-area").removeClass("devpreview sourcepreview");
        $("#main-content-area").addClass("edit");
        removeMenuClasses();
        $(this).addClass("active");
        return false
    }

    function getFields() {
        return fields;
    }

    return {
        init: init,
        rendFromTblMetaDt: rendFromTblMetaDt,
        clearTblDesign: clearTblDesign,
        openTblDesign: openTblDesign,
        saveTblDesign: saveTblDesign,
        newTblDesign: newTblDesign,
        previewTblDesign: previewTblDesign,
        editviewTblDesign: editviewTblDesign,
        getFields: getFields,
    }
});