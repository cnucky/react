
(function($) {
$.widget('ui.dateInput', {
	options:{
		disabled:false,
		length:8
	},
	_init: function() {
		var o=this.options;
		if(o.init){
			return;
		}
		o.init=true;

		this.element.html("<span><input/><i class='fa fa-calendar-o'/></span>");
	    var setting={
			format:o.length==8?"YYYY/MM/DD":o.length==10?"YYYY/MM/DD hh":o.length==12?'YYYY/MM/DD hh:mm':'YYYY/MM/DD HH:mm:ss'
	    };
	    this.element.find('input').datetimepicker(setting); 
	},
	val:function(vs){
		if(arguments==null||arguments.length==0){
			return this.element.find('input').val();//.replace(/[^\d]/ig,'');
		}else{
			this.element.find('input').val(vs);
		}
	},
	change:function(meth){
	},
	readOnly:function(d){
		if(arguments==null||arguments.length==0){
			// return this.element.children().hasClass('disabled');
			return this.element.find('input').hasClass("readOnly");
		}else{
			if(d){
				// this.element.children().addClass('disabled');
				this.element.find('input').attr("readOnly",'readOnly');
			}else{
				// this.element.children().removeClass('disabled');
				this.element.find('input').removeAttr("readOnly");
			}
		}
	},
	txt:function(){
		return this.element.find('input').val();
	}	
});

$.extend($.ui.dateInput, {
	getter: ['val','txt','readOnly','change'],
	defaults:{
	}
});

})(jQuery);
