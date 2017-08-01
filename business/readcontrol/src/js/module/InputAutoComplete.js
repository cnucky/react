/**
 * Created by root on 16-9-28.
 */
define([], function () {
    var $_ = function (id) {
        return "string" == typeof id ? document.getElementById(id) : id;
    }

    var Bind = function(object, fun) {
        return function() {
            return fun.apply(object, arguments);
        }
    }


    function AutoComplete(obj,autoObj,upAndDownIcoObj,dataKey,parentObj,arr){
        var $this = this;
        $.ajax({
            "url": '/dataprocess/dataprocess/getExtract',
            "type": "POST",
            //"async":false,
            "data": arr,
            "success": function (json) {
                $this.value_arr=json.results; //不要包含重复值
            }
        })
        this.parentObj=parentObj;
        this.dataKey=dataKey;
        this.parentObj.parents('.select-init').find('.end-select').css("position","relative").html('' +
            '<input type="text" style="width:260px;"  placeholder="' + this.dataKey + '" id="' + obj + '">' +
            '<div id="' + upAndDownIcoObj + '" class="check-icon up" style="position: absolute; top:9px;right:5px;"></div>' +
            '<div class="auto_hidden" id="' + autoObj + '"></div>' +
            '');
        this.obj=$_(obj); //输入框
        this.autoObj=$_(autoObj);//DIV的根节点
        this.upAndDownIcoObj=$_(upAndDownIcoObj);
        this.index=-1; //当前选中的DIV的索引
        this.search_value=""; //保存当前搜索的字符
        this.obj_blur_value = "";
        this.autoObj_mouseleave_value = "yes";
        this.initvisualHeight = 100;
        this.visualHeight = 0;
        this.lineHeight = 20;
        this.minVisualIndex = 0;
        this.maxVisualIndex = (this.initvisualHeight / this.lineHeight) - 1;


    }
    AutoComplete.prototype={
        //初始化DIV的位置
        init: function(){
            this.autoObj.style.left = this.obj.offsetLeft + "px";
            this.autoObj.style.top = this.obj.offsetTop + this.obj.offsetHeight + "px";
            this.autoObj.style.width= this.obj.offsetWidth + "px";//减去边框的长度2px
        },
        //删除自动完成需要的所有DIV
        deleteDIV: function(){
            while(this.autoObj.hasChildNodes()){
                this.autoObj.removeChild(this.autoObj.firstChild);
            }
            this.autoObj.className="auto_hidden";
        },
        hiddenDIV: function(){
            this.autoObj.className="auto_hidden";
        },
        //设置值
        setValue: function(_this){
            return function(){
                _this.upAndDownIcoObj.className = "check-icon up";
                _this.obj.value=this.seq;
                _this.autoObj.className="auto_hidden";
            }
        },
        setInitValue: function(val){
            this.seq = val;
            this.obj.value=val;
        },
        //模拟鼠标移动至DIV时，DIV高亮
        autoOnmouseover: function(_this,_div_index){
            return function(){
                _this.index=_div_index;
                var length = _this.autoObj.children.length;
                for(var j=0;j<length;j++){
                    if(j!=_this.index ){
                        _this.autoObj.childNodes[j].className='auto_onmouseout';
                        //_this.autoObj.childNodes[j].childNodes[0].className='auto_left auto_onmouseout';
                        //_this.autoObj.childNodes[j].childNodes[1].className='auto_right auto_onmouseout';
                    }else{
                        _this.autoObj.childNodes[j].className='auto_onmouseover';
                        //_this.autoObj.childNodes[j].childNodes[0].className='auto_left auto_onmouseover';
                        //_this.autoObj.childNodes[j].childNodes[1].className='auto_right auto_onmouseover';
                    }
                }
                _this.obj.obj_blur_value=this.seq;
            }
        },
        //更改classname
        changeClassname: function(length){
            for(var i=0;i<length;i++){
                if(i!=this.index ){
                    this.autoObj.childNodes[i].className='auto_onmouseout';
                    //this.autoObj.childNodes[i].childNodes[0].className='auto_left auto_onmouseout';
                    //this.autoObj.childNodes[i].childNodes[1].className='auto_right auto_onmouseout';
                }else{
                    this.autoObj.childNodes[i].className='auto_onmouseover';
                    //this.autoObj.childNodes[i].childNodes[0].className='auto_left auto_onmouseover';
                    //this.autoObj.childNodes[i].childNodes[1].className='auto_right auto_onmouseover';
                    this.obj.value=this.autoObj.childNodes[i].seq;
                }
            }
        }
        ,
        //响应键盘
        pressKey: function(event){
            var length = this.autoObj.children.length;
            //光标键"↓"
            if(event.keyCode==40){
                ++this.index;
                if(this.index > this.maxVisualIndex){
                    ++this.minVisualIndex;
                    ++this.maxVisualIndex;
                }
                if(this.index>length){
                    this.index=0;
                    this.minVisualIndex = 0;
                    this.maxVisualIndex = (this.initvisualHeight / this.lineHeight) - 1;
                }else if(this.index==length){
                    this.obj.value=this.search_value;
                }
                $(this.autoObj).scrollTop(this.visualHeight + (this.lineHeight * this.minVisualIndex));
                this.changeClassname(length);
            }
            //光标键"↑"
            else if(event.keyCode==38){
                this.index--;
                if(this.index < this.minVisualIndex){
                    --this.minVisualIndex;
                    --this.minVisualIndex;
                }
                if(this.index<-1){
                    this.index=length - 1;
                    this.minVisualIndex = length - 1 + this.initvisualHeight / this.lineHeight;
                    this.maxVisualIndex = length - 1;
                }else if(this.index==-1){
                    this.obj.value=this.search_value;
                }
                $(this.autoObj).scrollTop(this.visualHeight + (this.lineHeight * this.minVisualIndex));
                this.changeClassname(length);
            }
            //回车键
            else if(event.keyCode==13){
                this.autoObj.className="auto_hidden";
                this.index=-1;
            }else{
                this.index=-1;
            }

        },
        //程序入口
        start: function(event){
            if(event.keyCode!=13&&event.keyCode!=38&&event.keyCode!=40){
                this.init();
                this.deleteDIV();
                this.search_value=this.obj.value;
                var valueArr=this.value_arr;
//                valueArr.sort();
//                if(this.obj.value.replace(/(^\s*)|(\s*$)/g,'')==""){ return; }//值为空，退出
                try{ var reg = new RegExp("(" + this.obj.value + ")","i");}
                catch (e){ return; }
                var div_index=0;//记录创建的DIV的索引
                for(var i=0;i<valueArr.length;i++){
                    if(reg.test(valueArr[i][0])){
                        var div = document.createElement("div");
                        div.className="auto_onmouseout";
                        div.seq=valueArr[i][0] == "" ? "(空)" : valueArr[i][0];
                        div.onclick=this.setValue(this);
                        div.onmouseover=this.autoOnmouseover(this,div_index);
                        var span_col = document.createElement("div");
                        span_col.className = "auto_left";
                        span_col.innerHTML = valueArr[i][0] == "" ? "(空)" : valueArr[i][0];
                        var span_count = document.createElement("div");
                        span_count.className = "auto_right";
                        span_count.innerHTML = valueArr[i][1];
                        div.appendChild(span_col);
                        div.appendChild(span_count);
                        this.autoObj.appendChild(div);
                        this.autoObj.className="auto_show";
                        div_index++;
                    }
                }
            }
            this.pressKey(event);
            window.onresize=Bind(this,function(){this.init();});
        }
    }


    return AutoComplete;
});