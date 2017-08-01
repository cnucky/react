define(
    [
        'underscore',
        './library'
    ], function (_,lib) {
        //+++++++++++++定义的变量++++++++++

        var tempCode=''; //临时代码数据

        //++++++++++++++++++业务方法++++++++++++++
        //加载编码信息
        function load_encode_info(){
            lib.loadCodes("#contEnCode");
        }

        //加载通讯录内容
        function load_addr_cont(obj) {
            if(!lib.checkBlank(obj)){
                return;
            }
            lib.set_wrap_width_height();
            var addrCont=$("#addr-cont");
            addrCont.html('<h4>'+obj.title+'</h4>');
            //描述
            if(lib.checkBlank(obj.desc)){
                tempCode='<h6 class="checkkeyword">'+obj.desc[0].title+':';
                if(lib.checkBlank(obj.desc[0].value)){
                    tempCode+=obj.desc[0].value;
                }
                tempCode+='</h6>';
                addrCont.append(tempCode);
            }
            //内容
            if(lib.checkBlank(obj.headers)&&lib.checkBlank(obj.bodies)){
                var headInfo={};
                for(var i=0;i<obj.headers.length;i++){
                    headInfo[obj.headers[i].code.toUpperCase()]=obj.headers[i].title;
                }
                tempCode='';
                for(var i=0;i<obj.bodies.length;i++){
                    var b=obj.bodies[i];
                    tempCode+='<ul class="checkkeyword">';
                    for(var j=0;j< b.length;j++){
                        var c= b[j];
                        if(lib.checkBlank(c.value)){
                            tempCode+='<li>'+ headInfo[c.code.toUpperCase()]+'：'+c.value+'</li>';
                        }
                    }
                    tempCode+='</ul>'
                }

                //addrCont.append(tempCode);
                lib.append_txtCont_by_steps(addrCont,tempCode,"string",51200,5) //4参数:容器,数据,逐步数据,延迟毫秒
            }
        }

        return {
            load_encode_info:load_encode_info,
            load_addr_cont: load_addr_cont
        }
    });
