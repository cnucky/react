(function($) {

    $.widget('ui.multiInput', {
        options: {},
        _init: function() {
            var o = this.options;
            if (o.init) {
                return;
            }
            o.init = true;
            this.element.html("<label><input readOnly/><i class='arrow'/></label>");
            this.values = null;
            var multiInput = this;

            this.element.bind('click', function() {
                //event.stopPropagation();
                if(multiInput.readOnly())return;

                if($('.multiDiv').length&&$('.multiDiv').data('source')==coder){
                    $('.multiDiv').remove();
                    return;
                }

                setTimeout(function() {
                    var puts = [];
                    if (multiInput.values) {
                        for (var i = 0; i < multiInput.values.length; i++) {
                            var v = multiInput.values[i];
                            if (v === null || v === undefined) v = '';
                            if (typeof v == 'string') {
                                v = v.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, ' ').replace(/\r/g, '')
                            }
                            // puts.push('<input type="text" class="form-control" value="' + v + '"/>');
                            puts.push('<li><input class="form-control" value="'+v+'"/></li>');
                        }
                    }
                    if (puts.length == 0) {
                        // puts.push('<input type="text" class="form-control"/>');
                        puts.push('<li><input class="form-control"/></li>');
                        multiInput.values = [""];
                    }
                    // var div = $('<div class="multiDiv">' + puts.join('') + '</div>').width(multiInput.element.width()).css('padding', '6px 12px').click(function() {
                    //     event.stopPropagation();
                    // });
                    var div=$('<div class="multiDiv"><ul>'+puts.join('')+'</ul></div>').width(multiInput.element.width()).click(function(){
                        event.stopPropagation();
                    });

                    multiInput.element.after(div);
                    div.data('source',multiInput).find('li:eq(0)').find('input').focus();

                    multiInput.setPos(multiInput.element.get(0), div);
                    div.on('keyup', 'input', function() {
                        if (multiInput.values == null) {
                            multiInput.values = [];
                        }

                        var index=$(this).parent().index();

                        if (event.keyCode == 13) {
                            $(this).parent().after('<li ><input class="form-control"/></li>').next().find('input').focus();                 
                            multiInput.values.splice(index+1,0,""); 
                        } else if (event.keyCode == 8) {
                            if ($(this).val() == '' && $('input', div).length > 1) {
                                multiInput.values.splice(index, 1);
                                $(this).parent().remove();
                                $('input',div).eq(index>0?index-1:0).focus().parent();
                            } else {
                                multiInput.values[index]=$(this).val();
                            }
                        } else {
                            multiInput.values[index]=$(this).val();
                        }

                        multiInput.element.find('input').val(multiInput.values.join(','));
                    }).on("input","click",function(){
                    	alert();
                    	alert($(this).prop('outerHTML'));
                    }).find("input:last").focus();
                }, 1);
            });

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
                left = Math.max(0, coords[0] - moveObj.prop('scrollWidth') + targetObj.offsetWidth);
            }
            // left += $('body').prop('scrollLeft');

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
                this.values = vs || [];
                this.element.find('input').val((vs || []).join(','));
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
        }
    });

    $.extend($.ui.multiInput, {
        getter: ['val', 'txt', 'readOnly', 'change'],
        defaults: {}
    });

})(jQuery);