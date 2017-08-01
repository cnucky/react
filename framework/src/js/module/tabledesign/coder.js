(function($) {

    $.widget('ui.coder', {
        options: {
            dict: null,
            multi: false
        },
        _init: function() {
            var o = this.options;
            if (o.init) {
                return;
            }


            o.init = true;
            this.values = null;
            var coder = this;

            this.element.html("<label><input readOnly/><i class='arrow'/></label>");

            this.element.bind('click', function() {
                if(coder.readOnly())return;

                if($('.coderDiv').length&&$('.coderDiv').data('source')==coder){
                    $('.coderDiv').remove();
                    return;
                }

                var coderHtml = "";

                $.getJSON("/spycommon/getTableFieldCodeTable", {
                    // dicName: dict
                    tableId: o.tableId,
                    fieldId: o.fieldId
                }).done(function(rsp) {
                    if (rsp.code == 0) {

                        var lis = [];
                        for (var i = 0; i < rsp.data.length; i++) {
                            var chk = false;
                            if (coder.values) {
                                if (o.multi) {
                                    chk = $.inArray(rsp.data[i].id, coder.values) > -1;
                                } else {
                                    chk = rsp.data[i].id == coder.values;
                                }
                            }
                            lis.push("<li><input id='i_"+i+"' class=='form-control' type='"+(o.multi?"checkbox":"radio")+"' name='_' value='"+rsp.data[i].id+"' "+(chk?" checked":"")+"/><label for='i_"+i+"'>"+rsp.data[i].text+"</label>");
                        }

                        if(rsp.data.length==0){
                            lis.push("<li><label>\u6CA1\u6709\u9009\u9879</label></li>");
                        }
                        /*var selInput=$('<div class="coder4SearchDiv"><label class="field"><input type="text" class="form-control"></label></div>');
                        var div = $('<div class="coderDiv"><ul>' + lis.join('') + '</ul></div>').css('padding', '6px 12px').click(function() {
                            event.stopPropagation();
                        });*/
                        var selInput=$('<div class="coder4SearchDiv"><label class="field"><input type="text" class="form-control"></label><span /></div>');
                        var div = $('<div class="coderDiv"><ul>' + lis.join('') + '</ul></div>').click(function() {
                            event.stopPropagation();
                        });
                        if(rsp.data.length>0){
                            div.prepend(selInput);
                        }
                        // o.div = div;
                        // $('#modal-panel').append(div);
                        // $('body').append(div);
                        coder.element.after(div);

                        setTimeout(function(){
                        div.width(coder.element.find('input').width());
                        },1);
                        
                        coder.setPos(coder.element.get(0), div);

                        div.data('source',coder).on('mouseover','li',function(){
                            $('.selectLi',div).removeClass('selectLi');
                            $(this).addClass('selectLi');
                        }).on('click', 'input:radio,input:checkbox', function() {
                            if (o.multi) {
                                var vs = [];
                                var ts = [];
                                $("input:checked", div).each(function() {
                                    vs.push($(this).val());
                                    ts.push($(this).next().text())
                                });

                                coder.values = vs;
                                coder.element.find('input').val(ts.join(','));
                            } else {
                                coder.element.find('input').val($(this).next().text());
                                coder.values = $(this).val();

                                $('.coderDiv').remove();
                            }
                        }).find('.coder4SearchDiv input').focus();
                        
                        selInput.on('keyup','input',function(){
                            $('.zeroLi',div).remove();
                            var t=$(this).val();
                            if(t){
                                var hasItem=false;
                                div.find('li').each(function(){
                                    if($(this).children('label').text().indexOf(t)>-1){
                                        $(this).show();
                                        hasItem=true;
                                    }else{
                                        $(this).hide();
                                    }
                                });

                                if(!hasItem){
                                    div.children('ul').append("<li class='zeroLi'><label>\u6CA1\u6709\u9009\u9879</label></li>");
                                }                     
                            }else{
                                div.find('li').show();
                            }
                        });

                        selInput.on('click','span',function(){
                            coder.element.find('input').val('');
                            coder.values='';
                            $('.coderDiv').remove();                        
                        });
                    }
                });

            });

            // $('body').click(function() {
            //     if (o.div) {
            //         o.div.remove();
            //         delete o.div;
            //     }
            // });
        },
        setPos: function(targetObj, moveObj) {
            var coords = [0,0];//this.findPos(targetObj);

            var top = coords[1] + targetObj.offsetHeight; //
            if (top + moveObj.prop('scrollHeight') > $('body').height()) {
                top = Math.max(0, coords[1] - moveObj.prop('scrollHeight') - 1);
            }
            // top += $('body').prop('scrollTop');

            var left = coords[0];
            if (left + moveObj.prop('scrollWidth') > $('body').width()) {
                left = Math.max(0, coords[0] - moveObj.prop('scrollWidth') - 4 + targetObj.offsetWidth);
            }
            left += $('body').prop('scrollLeft');

            moveObj.css('position', 'absolute').css('left', "12px").css('top', top);
        },
        findPos: function(obj) {
            var curleft = curtop = 0;
            if (obj.offsetParent) {
                curleft = obj.offsetLeft;
                curtop = obj.offsetTop;
                while (obj = obj.offsetParent) {
                    var origcurleft = curleft;
                    curleft += obj.offsetLeft - obj.scrollLeft;
                    if (curleft < 0) {
                        curleft = origcurleft;
                    }
                    curtop += obj.offsetTop - obj.scrollTop;
                }
            }
            return [curleft, curtop];
        },
        val: function(vs) {
            if (arguments == null || arguments.length == 0) {
                return this.values;
            } else {
                this.values=this.options.multi? vs||[] : vs||null;
                // this.element.find('input').val(this.options.multi?(vs||[]).join(','):vs||''); 
            }
        },
        change: function(meth) {},
        readOnly: function(d) {
            if(arguments==null||arguments.length==0){
                return this.element.children().hasClass('disabled');
            }else{
                if(d){
                    this.element.children().addClass('disabled');
                }else{
                    this.element.children().removeClass('disabled');
                }
            }
        },
        txt: function() {
            return this.element.find('input').val();
        },
        valAndText:function(vt){
            if(arguments==null||arguments.length==0){
                return {value:this.values,text:this.element.find('input').val()};
            } else {
                var vs=vt.value;
                var ts=vt.text;
                this.values=this.options.multi?vs||[]:vs||null;
                this.element.find('input').val(this.options.multi?(ts||""):ts||'');
            }
        }
    });

    $.extend($.ui.coder, {
        getter: ['val', 'txt', 'readOnly', 'change'],
        defaults: {}
    });

})(jQuery);