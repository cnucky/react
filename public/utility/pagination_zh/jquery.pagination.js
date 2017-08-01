/**
 * This jQuery plugin displays pagination links inside the selected elements.
 *
 * @author Gabriel Birke (birke *at* d-scribe *dot* de)
 * @version 1.2
 * @param {int} maxentries Number of entries to paginate
 * @param {Object} opts Several options (see README for documentation)
 * @return {Object} jQuery Object
 */
jQuery.fn.pagination = function(maxentries, opts){
	opts = jQuery.extend({
		items_per_page:10,
		num_display_entries:10,
		current_page:0,
		num_edge_entries:0,
		link_to:"#",
		prev_text:"Prev",
		next_text:"Next",
		ellipse_text:"...",
		prev_show_always:true,
		next_show_always:true,
		page_length:[10,20,30,40,50],
		page_length_id: "pageInfo_length",
		callback:function(){return false;}
	},opts||{});

	return this.each(function() {
		/**
		 * 计算最大分页显示数目
		 */
		function numPages() {
			return Math.ceil(maxentries/opts.items_per_page);
		}
		/**
		 * 极端分页的起始和结束点，这取决于current_page 和 num_display_entries.
		 * @返回 {数组(Array)}
		 */
		function getInterval()  {
			var ne_half = Math.ceil(opts.num_display_entries/2);
			var np = numPages();
			var upper_limit = np-opts.num_display_entries;
			var start = current_page>ne_half?Math.max(Math.min(current_page-ne_half, upper_limit), 0):0;
			var end = current_page>ne_half?Math.min(current_page+ne_half, np):Math.min(opts.num_display_entries, np);
			return [start,end];
		}

		/**
		 * 分页链接事件处理函数
		 * @参数 {int} page_id 为新页码
		 */
		function pageSelected(page_id, evt){
			current_page = page_id;
			drawLinks();
			var continuePropagation = opts.callback(page_id, panel);
			if (!continuePropagation) {
				if (evt.stopPropagation) {
					evt.stopPropagation();
				}
				else {
					evt.cancelBubble = true;
				}
			}
			return continuePropagation;
		}

		/**
		 * 此函数将分页链接插入到容器元素中
		 */
		function drawLinks() {
			panel.empty();
			var interval = getInterval();
			var np = numPages();
			var page_length_element = '<select id="' + opts.page_length_id + '">';

			for(i in opts.page_length){
				if(opts.items_per_page == opts.page_length[i]){
					page_length_element += '<option selected="selected" value="' + opts.page_length[i] + '">' + opts.page_length[i] + '</option>'
				}else {
					page_length_element += '<option  value="' + opts.page_length[i] + '">' + opts.page_length[i] + '</option>'
				}
			}
			page_length_element += "</select>";
			var page_length_html = i18n.t('dataprocess.common.per_page');
			page_length_html = page_length_html.format(page_length_element);

			var description = i18n.t("dataprocess.common.page_description");
			description = description.format(parseInt(parseInt((current_page)*opts.items_per_page) + parseInt(1)), (current_page+1)*opts.items_per_page, parseInt(maxentries_));

			panel.append("<div class='pageInfo'>" + description + page_length_html + "</div>")
			// 这个辅助函数返回一个处理函数调用有着正确page_id的pageSelected。
			var getClickHandler = function(page_id) {
				return function(evt){ return pageSelected(page_id,evt); }
			}
			//辅助函数用来产生一个单链接(如果不是当前页则产生span标签)
			var appendItem = function(page_id, appendopts){
				page_id = page_id<0?0:(page_id<np?page_id:np-1); // 规范page id值
				appendopts = jQuery.extend({text:page_id+1, classes:""}, appendopts||{});
				if(page_id == current_page){
					var lnk = jQuery("<span class='current'>"+(appendopts.text)+"</span>");
				}else{
					var lnk = jQuery("<a>"+(appendopts.text)+"</a>")
						.bind("click", getClickHandler(page_id))
						.attr('href', opts.link_to.replace(/__id__/,page_id));
				}
				if(appendopts.classes){lnk.addClass(appendopts.classes);}
				panel.children('.page').append(lnk);
			}
			// 产生"Previous"-链接
			if(opts.prev_text && (current_page > 0 || opts.prev_show_always)){
				panel.append("<div class='page'>");
				appendItem(current_page-1,{text:opts.prev_text, classes:"prev"});
			}
			// 产生起始点
			if (interval[0] > 0 && opts.num_edge_entries > 0)
			{
				var end = Math.min(opts.num_edge_entries, interval[0]);
				for(var i=0; i<end; i++) {
					appendItem(i);
				}
				if(opts.num_edge_entries < interval[0] && opts.ellipse_text)
				{
					jQuery("<span>"+opts.ellipse_text+"</span>").appendTo(panel.children('.page'));
				}
			}
			// 产生内部的些链接
			for(var i=interval[0]; i<interval[1]; i++) {
				appendItem(i);
			}
			// 产生结束点
			if (interval[1] < np && opts.num_edge_entries > 0)
			{
				if(np-opts.num_edge_entries > interval[1]&& opts.ellipse_text)
				{
					jQuery("<span>"+opts.ellipse_text+"</span>").appendTo(panel.children('.page'));
				}
				var begin = Math.max(np-opts.num_edge_entries, interval[1]);
				for(var i=begin; i<np; i++) {
					appendItem(i);
				}

			}
			// 产生 "Next"-链接
			if(opts.next_text && (current_page < np-1 || opts.next_show_always)){
				appendItem(current_page+1,{text:opts.next_text, classes:"next"});
			}

			var str_tpl= i18n.t("dataprocess.common.jump_to_page");
			var maxche_info=str_tpl.format('<input id="jumpPageInput" type="text" style="width:30px;margin-right:5px">');

			panel.children('.page').append(maxche_info);
			var jumpPageInput = jQuery('<button class="btn btn-info btn-rounded btn-sm" style="width:30px;padding:3px; vertical-align: top;line-height:1.45;" data-i18n="[title]dataprocess.action.jump_to"><i class="glyphicons glyphicons-right_arrow"></i></button>')
				.bind("click", function(){
					var reg = new RegExp("^[0-9]*$");
					var jumpPageInputVal = $('#jumpPageInput').val();
					if(reg.test(jumpPageInputVal)){
						if(jumpPageInputVal <= np && jumpPageInputVal > 0){
							pageSelected(jumpPageInputVal-1);
						}
					}else{
						return;
					}
				});
			panel.children('.page').append(jumpPageInput);

		}

		//从选项中提取current_page
		var current_page = opts.current_page;
		//创建一个显示条数和每页显示条数值
		maxentries_ = maxentries;
		maxentries = (!maxentries || maxentries < 0)?1:maxentries;
		opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0)?1:opts.items_per_page;
		//存储DOM元素，以方便从所有的内部结构中获取
		var panel = jQuery(this);
		// 获得附加功能的元素
		this.selectPage = function(page_id){ pageSelected(page_id);}
		this.prevPage = function(){
			if (current_page > 0) {
				pageSelected(current_page - 1);
				return true;
			}
			else {
				return false;
			}
		}
		this.nextPage = function(){
			if(current_page < numPages()-1) {
				pageSelected(current_page+1);
				return true;
			}
			else {
				return false;
			}
		}
		// 所有初始化完成，绘制链接
		drawLinks();
		// 回调函数
		opts.callback(current_page, this);
	});
}


