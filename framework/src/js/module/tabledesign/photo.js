 
(function($) {
$.widget('ui.photo', {
	options:{
	},
	_init: function() {
		this.value=null;
		this.element.height(this.element.parent().height());
		var self=this;
		var o=this.options;
		
		var $img = this.element;

		var uploadDir = "/data/udp_upload/";
 		$img.dropzone({ url: "/spycommon/uploadFile?uploadDir=" + uploadDir,
			paramName:'file',
			headers:o.headers,
			previewsContainer:"",
			addedfile: function(file) {
				$img.empty();
				o.showLoader();
			},
			success:function(file, response, e){	
			 									
				$img.empty();
				if(self.values==null)self.values=[];

				var resdata = JSON.parse(response);

				var tmp = $img.empty().html("<img/>").find("img");

				self.value = resdata.newName;
				tmp.attr('src', '/spycommon/getLocalImg?path=/data/tmp/' + resdata.newName);

				var w = tmp.parent().width();
                var h = tmp.parent().height();
                var w2 = tmp.prop("offsetWidth");
                var h2 = tmp.prop("offsetHeight");

                if (w * h2 > w2 * h) {
                    var tmpWidth = w2 * h / h2;
                    tmp.css({
                        height: h,
                        width: tmpWidth
                    });
                } else {
                    var tmpHeight = h2 * w / w2;
                    tmp.css({
                        width: w,
                        height: tmpHeight
                    });
                }

				setTimeout(function(){
					var tmp = $img.find("img");

					var w = tmp.parent().width();
	                var h = tmp.parent().height();
	                var w2 = tmp.prop("offsetWidth");
	                var h2 = tmp.prop("offsetHeight");

	                if (w * h2 > w2 * h) {
	                    var tmpWidth = w2 * h / h2;
	                    tmp.css({
	                        height: h,
	                        width: tmpWidth
	                    });
	                } else {
	                    var tmpHeight = h2 * w / w2;
	                    tmp.css({
	                        width: w,
	                        height: tmpHeight
	                    });
	                }
				}, 200);
                
                o.hideLoader();

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
				   // 		   $.get('/tbl-design/downloadPhoto', {
				   //              fileId: resdata.newName
				   //          }, function(rsp) {
				   //          	hideLoader();
				   //              rsp = JSON.parse(rsp);
				   //              if (rsp.code == 0) {
				   //                  self.value = resdata.newName;
				   //                  tmp.attr('src', 'data:image/jpg;base64,' + rsp.data);

				   //                  var w = tmp.parent().width();
				   //                  var h = tmp.parent().height();
				   //                  var w2 = tmp.prop("offsetWidth");
				   //                  var h2 = tmp.prop("offsetHeight");

				   //                  if (w * h2 > w2 * h) {
				   //                      var tmpWidth = w2 * h / h2;
				   //                      tmp.css({
				   //                          height: h,
				   //                          width: tmpWidth
				   //                      });
				   //                  } else {
				   //                      var tmpHeight = h2 * w / w2;
				   //                      tmp.css({
				   //                          width: w,
				   //                          height: tmpHeight
				   //                      });
				   //                  }
				   //              } else {
				   //                  o.Notify.show({
				   //                      title: '获取图片失败',
				   //                      type: 'error'
				   //                  });
				   //              }
				   //          });
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
										    $.post('/spycommon/checkUploadResult', {
										        'fileName': resdata.tmpNewName,
										    }).done(function(rsp) {
										        rsp = JSON.parse(rsp);
										        if (rsp.code == 0) {

										            // $.get('/tbl-design/downloadPhoto', {
										            //     fileId: resdata.newName
										            // }, function(rsp) {
										            // 	hideLoader();
										            //     rsp = JSON.parse(rsp);
										            //     if (rsp.code == 0) {
										            //         self.value = resdata.newName;
										            //         tmp.attr('src', 'data:image/jpg;base64,' + rsp.data);

										            //         var w = tmp.parent().width();
										            //         var h = tmp.parent().height();
										            //         var w2 = tmp.prop("offsetWidth");
										            //         var h2 = tmp.prop("offsetHeight");

										            //         if (w * h2 > w2 * h) {
										            //             var tmpWidth = w2 * h / h2;
										            //             tmp.css({
										            //                 height: h,
										            //                 width: tmpWidth
										            //             });
										            //         } else {
										            //             var tmpHeight = h2 * w / w2;
										            //             tmp.css({
										            //                 width: w,
										            //                 height: tmpHeight
										            //             });
										            //         }
										            //     } else {
										            //         o.Notify.show({
										            //             title: '获取图片失败',
										            //             type: 'error'
										            //         });
										            //     }
										            // });
										        } else {
										            o.hideLoader();
										            o.Notify.show({
										                title: '后台处理文件【' + resdata.oldName + '】失败!',
										                type: 'error'
										            });
										            return;
										        }
										    });
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

					// var tmp = $img.empty().html("<img/>").find("img");
				}
				
				// tmp.attr('src', '/tbl-design/getpersonphoto?peopleId=' + 516985);
				// self.value = 516985;
				// setTimeout(function(){
				// 	var w=tmp.parent().width();
				// 	var h=tmp.parent().height();
				// 	var w2=tmp.prop("offsetWidth");
				// 	var h2=tmp.prop("offsetHeight");
										
				// 	if(w*h2>w2*h){
				// 		var tmpWidth = w2*h/h2;
				// 		tmp.css({height:h,width:tmpWidth});
				// 	}else{
				// 		var tmpHeight = h2*w/w2;
				// 		tmp.css({width:w,height:tmpHeight});
				// 	}
				// },100);

			}
		});

		this.element.dblclick(function(){
			if(o.disabled)return;
			var elem=event.srcElement;
		});		
	},
	afterFresh:function(a){
		if(arguments.length==0){
			return this._afterFresh||null;
		}else{
			this._afterFresh=a;
		}
	},	
	val:function(v){
		var o=this.options;
		if(arguments==null||arguments.length==0){
			return this.value;
		}else{
			this.value=v || null;
			if(v){
				this.img=this.element.find("img");
				if(this.img.length==0){
					this.img=this.element.html("<img/>").find("img");
				}
				$tmp = this.img;
				// this.img.show().prop("src",'/tbl-design/getpersonphoto?peopleId=' + v);
				$.get('/tbl-design/showPhoto', {
					fileId: v
				}, function(rsp){
					rsp = JSON.parse(rsp);
					if(rsp.code == 0){
						$tmp.show().prop('src', 'data:image/jpg;base64,' + rsp.data);

						var w=$tmp.parent().width();
						var h=$tmp.parent().height();
						var w2=$tmp.prop("offsetWidth");
						var h2=$tmp.prop("offsetHeight");
											
						if(w*h2>w2*h){
							var tmpWidth = w2*h/h2;
							$tmp.css({height:h,width:tmpWidth});
						}else{
							var tmpHeight = h2*w/w2;
							$tmp.css({width:w,height:tmpHeight});
						}

					}else{
						o.Notify.show({
							title: '获取图片失败',
							type: 'error'
						});
					}
				});
				
				// var elem=this.element;
				// this.element.click(function(){
				// 	if(o.popupMenu){
				// 		var x=event.clientX-event.offsetX-2;
				// 		var y=event.clientY-event.offsetY+2+$(event.srcElement).height()
				// 		if(event.srcElement.tagName=='LABEL'){
				// 			x-=self.element.attr("offsetWidth")-25;
				// 			y--;
				// 		}
				// 		var position={x:x,y:y};
				// 		o.popupMenu.showMenu(position);						
				// 	}
				// 	if(o._click){
				// 		o._click(elem);
				// 	}
				// });
				// var img=this.img;
				// setTimeout(function(){
				// 	var w=img.parent().width();
				// 	var h=img.parent().height();
				// 	var w2=img.prop("offsetWidth");
				// 	var h2=img.prop("offsetHeight");
										
				// 	if(w*h2>w2*h){
				// 		var tmpWidth = w2*h/h2;
				// 		img.css({height:h,width:tmpWidth});
				// 	}else{
				// 		var tmpHeight = h2*w/w2;
				// 		img.css({width:w,height:tmpHeight});
				// 	}
				// },100);
			}
		}					
	},
	open:function(){
		this.element.dblclick();
	},
	click:function(c){
		this.options._click=c;
	},
	dblclick:function(c){
		this.options._dblclick=c;
	},
	readOnly: function(d) {
		if(arguments==null||arguments.length==0){
			return this.element.hasClass('disabled');
		}else{
			if(d){
				this.element.addClass('disabled');
				this.element.css("pointer-events","none");
			}else{
				this.element.removeClass('disabled');
				this.element.css("pointer-events","all");
			}
		}
	}
});

$.extend($.ui.photo, {
	getter:["val","readOnly"],
	defaults: {
	}
});

})(jQuery);
