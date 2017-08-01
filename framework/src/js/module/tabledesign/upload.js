(function($) {
$.widget('ui.upload', {
	options:{
		headers:null
	},
	_init: function() {
		var self=this;
		this.values=[];
		this._beforeUpload=function(){return true;}
		
		this.element.html("<label><ul/><b class='arrow'/></label>");
		
		var o=this.options;
		var $b=this.element.find('b');

		var $div=this.element.find('ul');
		var uploadDir = "/data/udp_upload/";
		$b.dropzone({ url: "/spycommon/uploadFile?uploadDir=" + uploadDir,
				paramName:'file',
				headers:o.headers,
				previewsContainer:"",
				addedfile: function(file) {
					$b.empty();
					o.showLoader();
				},
				success:function(file, response, e){										
					$b.empty();
					if(self.values==null)self.values=[];

					var resdata = JSON.parse(response);

					if(o.constant.uploadType == "WeedFS"){
						$.getJSON('/tabledesign/uploadAttachment', {
							tableId: o.tableId,
							fieldId: o.fieldId,
							recId: -1,
							files: [{
								fileName: resdata.oldName,
								fileId: resdata.newName,
								fileFullPath: '/data/tmp/' + resdata.newName,
							}]
						}, function(rsp){
							if(rsp.code == 0){
								o.hideLoader();

								self.values.push({
									fileName: resdata.oldName,
									fileId: resdata.newName,
									fileFullPath: resdata.filePath + resdata.newName,
								});

								var html = "";
								if (!(o.onlyAdd || o.disabled)) {
								    html += "<label class='delLabel fa fa-times' title=' 删除附件' id='D" + resdata.newName + "'>&nbsp;</label>";
								}
								html += "<label class='fileLabel' id='L" + resdata.newName + "' title='" + resdata.oldName + "'>" + resdata.oldName + "</label>";
								$div.append('<li>' + html + '</li>')
								o.Notify.show({
									title: '上传成功',
									message: rsp.message,
									type: 'success'
								});

								if(_.has(o, "uploadCallBack")){
									o.uploadCallBack();
								}
							}else{
								o.hideLoader();
								o.Notify.show({
									title: '上传失败',
									message: rsp.message,
									type: 'error'
								});
							}
						});
					}else if(o.constant.uploadType == "HDFS"){
						var uploadFiles = [];
			            uploadFiles.push({
			                fileName: resdata.tmpNewName,
			                dir: uploadDir + resdata.newName,
			                createTime: '',
			                fileType: 3,
			                fileState: 1,
			                rowDelimiter: '',
			                colDelimiter: '',
			                encoding: '',
			                preview_string: '',
			            });

						$.post('/spycommon/uploadFileRegist', {
							"uploadFiles": JSON.stringify(uploadFiles)
						}).done(function(rsp){
							rsp = JSON.parse(rsp);
							if(rsp.code == 0){
								$.post('/spycommon/moveFileToUploadDir', {
			                        oldFileName: resdata.oldName,
			                        newFileName: resdata.newName,
			                        uploadDir: uploadDir
			                    }).done(function (rsp) {
			                    	rsp = JSON.parse(rsp);
			                        if (rsp.code == 0) {
			                            $.post('/spycommon/checkUploadResult', {
			                                    'fileName': resdata.tmpNewName,
			                                }).done(function (rsp){
			                                    rsp = JSON.parse(rsp);
			                                    if (rsp.code == 0) {
													$.getJSON('/tabledesign/uploadAttachment', {
														tableId: o.tableId,
														fieldId: o.fieldId,
														recId: -1,
														files: [{
															fileName: resdata.oldName,
															fileId: resdata.newName,
															fileFullPath: uploadDir + resdata.newName,
														}]
													}, function(rsp){
														if(rsp.code == 0){
															o.hideLoader();

															self.values.push({
																fileName: resdata.oldName,
																fileId: resdata.newName,
																fileFullPath: resdata.filePath + resdata.newName,
															});

															var html = "";
															if (!(o.onlyAdd || o.disabled)) {
															    html += "<label class='delLabel fa fa-times' title=' 删除附件' id='D" + resdata.newName + "'>&nbsp;</label>";
															}
															html += "<label class='fileLabel' id='L" + resdata.newName + "' title='" + resdata.oldName + "'>" + resdata.oldName + "</label>";
															$div.append('<li>' + html + '</li>')
															o.Notify.show({
																title: '上传成功',
																message: rsp.message,
																type: 'success'
															});

															if(_.has(o, "uploadCallBack")){
																o.uploadCallBack();
															}
														}else{
															o.hideLoader();
															o.Notify.show({
																title: '上传失败',
																message: rsp.message,
																type: 'error'
															});
														}
													});
			                                    }
			                                    else {
			                                    	o.hideLoader();
			                                        o.Notify.show({
			                                            title: '后台处理文件【'+resdata.oldName+'】失败!',
			                                            type: 'error'
			                                        });
			                                        return;
			                                    }
			                                });
			                        }
			                        else {
			                        	o.hideLoader();
			                            o.Notify.show({
			                                title: '上传文件【'+resdata.oldName+'】失败！',
			                                type: 'error'
			                            });
			                            return;
			                            // console.log("moveFileToUploadDi失败:" + rsp.message);
			                        }
			                    });
							}else{
								o.hideLoader();
			                    o.Notify.show({
			                        title: '上传文件【'+resdata.oldName+'】失败！',
			                        type: 'error'
			                    });
			                    // console.log("uploadFileRegist失败:" + rsp.message);
							}
						});

					}
				}
		 });

		var $input=this.element.find('input');
		if(o.hideBtn){
			$div.css('margin-right',0);
			$input.css('margin-right',0);
			$b.hide();
		}else if(o.txtBtn){
			var w=$b.width('none').html(o.txtBtn).width()+6;
			$div.css('margin-right',w);
			$input.css('margin-right',-w);
			$b.css('width',w).css('background-image','none');//.css('background-image','url(css/blue/button.gif)');
		}		
		this.element.mousedown(function(){
			if(o.disabled)return;
			$(this).children().addClass('selected');
		}).mouseup(function(){
			if(o.disabled)return;
			$(this).children().removeClass('selected');
		}).mouseover(function(){
			if(o.disabled)return;
			$(this).children().addClass('mouseover');
		}).mouseout(function(){
			if(o.disabled)return;
			$(this).children().removeClass('mouseover');
		});		
		
		$b.attr("title","附件上传");
		if(o.disabled){
			this.element.children().addClass("disabled");		
		}
		
		$div.click(function(){
			if(self.readOnly())return;

			if(event.target==$div.get(0)&&$(event.target).width()-event.offsetX<36){
				$b.click();
			}
		});
		
		self.element.on("click",".delLabel",function(){
			if(self.readOnly())return;
			if(o.disabled)return;
			var label=$(this);

			var pos=label.parent().index();
			label.parent().remove();
			self.values.splice(pos);
			if(o.afterFresh)o.afterFresh(self.datas);
			if(self._afterFresh)self._afterFresh(self.datas);

		});
		self.element.on("click",".editLabel",function(){
			if(self.readOnly())return;
			if(o.disabled)return;
			var label=$(this);
			var id=label.attr("id").substring(1);
			$.prompt('输入文件描述',label.prev().text(),function(newDesc){
				var newDesc=$.trim(newDesc);
				if(newDesc){//!==undefined
					new AjaxServer({service:"share",method:"updLobDesc",callback:function(){
						label.prev().text(newDesc).prop('title',newDesc);
					}}).callServer([o.type,id,newDesc]);
				}
			},null,null,o.descMaxLength);
		});		
		self.element.on("click",".fileLabel",function(){
			//if(o.disabled)return;
			var r=o.clickMode;
			var label=$(this);
			var id=label.attr("id").substring(1);

			_.each(self.values, function(item){
				if(item.fileId == id){
					o.Notify.show({
						title: '通知',
						text: '开始下载...',
						type: 'info'
					});

					$.getJSON('/tabledesign/downloadAttachment', {
						fileId: [id]
					}, function(rsp){
						if(rsp.code == 0){
							var alink = document.createElement('a');
					        var evt = document.createEvent("HTMLEvents");
					        evt.initEvent("click", false, false);
					        alink.download = item.fileName;
					        alink.href = rsp.data[0].filePath;
					        alink.click();
						}else{
							o.Notify.show({
								title: '错误',
								text: '下载失败',
								type: 'error'
							});
						}
					});
				}
			});

			// if(r=='3'){
			// 	$.select('选择',{label:['打开','下载']},function(s){
			// 		if(s===0){
			// 			self._openFile(label,id);
			// 		}else if(s===1){
			// 			self._downFile(label,id);
			// 		}
			// 	});
			// }else if(r=='1'){
			// 	self._openFile(label,id);
			// }else if(r=='2'){
			// 	self._downFile(label,id);
			// }
		});		
	},
	_openFile:function(label,id){
		var o=this.options;
		$.win({"title":label.text()||'',iframe:PlatformBase+"platform/media/media.jsp?type="+o.type+"&key="+id,width:"800",height:"600"});
	},
	_downFile:function(label,id){
		var o=this.options;
		window.open(PlatformBase+"download?type="+o.type+"&id="+id,'_blank','height=100,width=100,status=no,toolbar=no,menubar=no,location=no,titlebar=no,directories=no,channelmode=no');
	},	
	beforeUpload:function(a){
		this._beforeUpload=a;
	},
	afterUpload:function(a){
		this._afterUpload=a;
	},
	afterFresh:function(a){
		if(arguments.length==0){
			return this._afterFresh||null;
		}else{
			this._afterFresh=a;
		}
	},
	val:function(vs){
		this.values = this.values==undefined ? [] : this.values;
		if(arguments==undefined || arguments==null || arguments.length==0 || arguments[0]==""){
			return this.values;
		}else{
			var o=this.options;
			var $div=this.element.find('ul');
			this.values=vs;
			var data=this.values||[];
			var imgs=[];
			for(var i=0;i<data.length;i++){
				var n=data[i].fileName;
				var fId=data[i].fileId;
				
				var html="";
				if(!(o.onlyAdd||o.disabled)){
					html+="<label class='delLabel fa fa-times' title='删除附件' id='D"+fId+"'>&nbsp;</label>";
				}
				if(!o.disabled&&data[i].hasOwnProperty('wjmszdm')&&o.edit){
					html+="<label class='editLabel' title='修改描述' id='D"+fId+"'>&nbsp;</label>";
				}
				if(o.sel){
					html+="<input name='"+eid+"_Radio' type='radio'/>";
				}
				html+="<label class='fileLabel' id='L"+fId+"' title='"+n+"'>"+n+"</label>";					
				
				imgs.push("<li>"+html+"</li>");
			}
			$div.html(imgs.join(""));
			if(self._afterFresh)self._afterFresh(data);
		}
	},	
	readOnly: function(d) {
		if(arguments==null||arguments.length==0){
			return this.element.children().hasClass('disabled');
			// return this.options.disabled;
		}else{
			// this.options.disabled = d;
			if(d){
				this.element.children().addClass('disabled');
			}else{
				this.element.children().removeClass('disabled');
			}
		}
	},
	count:function(){
		var $div=this.element.find('ul');
		return $div.children().length;		
	},
	clear:function(){
		this.values=[];
		this.element.find('li').remove();
	}	
});

$.extend($.ui.upload, {
	getter:["count","readOnly","afterFresh","val"],
	defaults: {
	}
});

})(jQuery);
