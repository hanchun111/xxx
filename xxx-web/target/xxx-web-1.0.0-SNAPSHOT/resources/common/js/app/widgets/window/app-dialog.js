/**
 * 对话框
 */
define(["app/core/app-jquery","app/core/app-core","app/data/app-ajax","app/core/app-options","app/widgets/drag/app-dialogdrag"],function($,$A,$ajax,$options) {
    //对话框状态
    var DIALOG_STATE ={
        OPENING:0,
        OPENED:1,
        TAG:'_dialog_open_statue'
    };

	/**
	 * 内部方法显示对话框
	 */
	function showDialog($dlg,options){
		 if (options.mask) {
				var $mask = $("#_dialogMask");
				if($mask.size() == 0){
					$("body").append("<div id='_dialogMask' class='dialog-mask'></div>");
				}
				$mask.css("zIndex",$options.zindexs.dialogMask);
				$("#_dialogMask").show();
			 }
		 var $h5 = $("div.dialog-header h5,div.dlg-box-head h5",$dlg);
		 if($h5.length>0&& !$h5.html()){
			 var $ti = $("title",$dlg);
			 var html = $ti.html();
			 $ti.remove();
			 if(!html){
				 html=options["title"]||"对话框";
			 }
			 var icon = $ti.attr("icon")||options.icon;
			 if(icon){
				 html= '<i class="'+icon+'"></i><span>'+html+"</span>";
			 }
			 $h5.html(html);
		 }
		 $dlg.one('hide', function () {
			 if(options.src)
			 	$(options.src).focus();
			 var hideHandle = options['closeCallback'];
			 if(hideHandle && $.isFunction(hideHandle)){
				 hideHandle($dlg,options);
			 }
		 });
	
		 if ($("body").height()<$dlg.height()){
		 	$dlg.height($("body").height());
		 }

		 	var $dlgContent=$(".dialog-content",$dlg);
			 var $header=$(".dialog-header,.dlg-box-head",$dlg);
			 $header.on("selectstart",function(){return false;});
			 $header.on("copy",function(){return false;});
			 $header.on("paste",function(){return false;});
			 $header.on("cut",function(){return false;});
			 var $footer=$(".dialog-footer",$dlg);
			 	var height=Math.min($dlg.height(),$(document).height());
			 	var ch=$dlg.outerHeight()-$header.outerHeight()-$footer.outerHeight();
				$dlgContent.innerHeight(ch);
				if (options.width){

					if ($dlgContent.outerWidth()>options.width){

						$dlg.width($dlgContent.outerWidth())
					}
				}
			 	
		 $A.dialog.relayout($dlg);
		
	
		
		 $A.dialog.setCurrent($dlg);
		 var callback = options['callback'];
		 if(callback && $.isFunction(callback)){
			 callback($dlg,options);
		 }
		 	if (options&&options.afterShow){
				options.afterShow.call(this,$dlg);
		}
		 	
		 if(options.mode=="url"){
		  $dlg.on($A.eventType.pageLoad,function(){
					timeout = setTimeout(function() {
						$dlg.css("visibility", "");
						$dlg.show();
					}, 50);
					
					
					
		})
		 	}else{
		 		
		 		$dlg.css("visibility", "");
				$dlg.show();
		 	}

        $dlg.data(DIALOG_STATE.TAG,DIALOG_STATE.OPENED);
	 };
	/**
	 * 对话框堆栈
	 */
	$A.dialog = {
		_op:{
			hasheader:true,
			mask:true, 
			dragTarget:null,
			drawable:true,
			reload:true,
			mode:"url",
			beforShow:function(){},
			afterShow:function(){},
			afterClose:function(){}
		},
		_current:[],
		_zIndex:42,
		/**
		 * 取得当前对话框
		 */
		getCurrent:function(){
			if(this._current.length==0)
				return null;
			return this._current[this._current.length-1];
		},
		getDialog:function(dlgId){
			for(var i=0,n=this._current.length;i<n;i++){
				if(this._current[i].is("#"+dlgId)){
					return this._current[i];
				}
			}
			return null;
		},
		/**
		 * 取得当前对话框
		 */
		relayout:function($dlg){
			if(!$dlg)
				$dlg = this.getCurrent();
			$dlg.css( "left", Math.max(($(window).width() - $dlg.width())/2,0) + "px" );
			$dlg.css( "top",  Math.max((document.body.clientHeight - $dlg.height())/2,0) + "px" );
			
		},
		/**
		 * 重新载入对话框内容
		 */
		reload:function(url, options){
			var $dlg = (options.dialogId && $("#_dialogs #"+options.dialogId)) || this.getCurrent();
			if (!$dlg||$dlg.size()==0)
				return;
			var op = $.extend({},$dlg.data("options"), options);
			$dlg.data("options",op);
			if(op.hasheader)
				$dlg.find(">:not(:first)").remove();
//			else
//				$dlg.html("");
			$dlg.data("url",url);
			if(op.reload){
				$dlg.attr("reload","true");
			}else{
				$dlg.removeAttr("reload");
			}
			if(options.mode=="url"){
				  
				var p = {
					type:"POST", 
					url:url,
					data:op.params,
					history:false,
					operator: op.operator ? op.operator : "append",
					callback:function(response){
						
					
						//$dlg.find("[layoutHeight]").layoutHeight($dlg);
						$(".btn.close", $dlg).click(function(){
							$A.dialog.close($dlg);
							return false;
						});
						if (op.dragTarget){
							$dlg.dialogDrag(op);
						}else if(op.drawable&&!op.hasheader){
							$dlg.dialogDrag(op);
						}
						 $A.dialog.setCurrent($dlg)
						if (options && options.beforShow) {
							options.beforShow.call(this, $dlg);
						}
						//$dlg.css("visibility","hidden");

						showDialog($dlg, op);
					},error:function(){
						  $dlg.data(DIALOG_STATE.TAG,"");
					}
				};
				if(options.onPageLoad){
					p["onPageLoad"] = options.onPageLoad;
				}
				if(options.beforePageInit){
					p["beforePageInit"] = options.beforePageInit;
				}	
				$dlg.loadAppURL(p);
			
			}else if(options.mode=="html"){
				$dlg.append(url);
				//$dlg.find("[layoutHeight]").layoutHeight($dlg);
				$(".btn.close", $dlg).click(function(){
					$A.dialog.close($dlg);
					return false;
				});
				if (options && options.beforShow) {
							options.beforShow.call(this, $dlg);
						}
				//add by tw 在initPageUI之后在重新计算一次位置
				$dlg.one($A.eventType.pageLoad,{"$dlg":$dlg},function(e){
					$A.dialog.relayout(e.data.$dlg);
				});
				
				$dlg.initPageUI();
				showDialog($dlg,op);
			}else if(options.mode=="node"){
				if(options.hasheader){
	                $dlg.find(">:not(.dialog-header)").remove();
				}else{
					$dlg.empty();
				}
				$dlg.append($(url));
				//$dlg.find("[layoutHeight]").layoutHeight($dlg);
				$(".btn.close", $dlg).click(function(){
					$A.dialog.close($dlg);
					return false;
				});
				if(options.onPageLoad){
					$dlg.one($A.eventType.pageLoad,{"$dlg":$dlg},function(e){
						options.onPageLoad(options,$dlg);
						
						
					});
				}
				$dlg.initPageUI();
				if (options && options.beforShow) {
					options.beforShow.call(this, $dlg);
				}
						
				$dlg.dialogDrag(options);
						
				showDialog($dlg,op);
			}
			
		},
		/**
		 * 打开对话框
		 */
		open:function(url, dlgid, title, options) {
			var $dialogs = $('#_dialogs');
			if($dialogs.size() == 0){
				$('body').append('<div id="_dialogs"></div>');
				$dialogs = $('#_dialogs');
			}
			if(typeof url == "object"){
				options=url;
				url=options.url;
				dlgid=options.dialogId;
				title=options.title;
			}else if(typeof dlgid == "object"){
				options=dlgid;
				dlgid=options.dialogId;
				title=options.title;
			}else if(typeof title == "object"){
				options=title;
				title=options.title;
			}
			var $dlg = $("#"+dlgid,$dialogs);
			if($dlg.size() == 0 && url=="#")
				 return;
			if(!dlgid){
				dlgid = "dialog"+$A.nextId();
			}
			options["dialogId"]=dlgid;
			options["title"]=title;
			var op = $.extend({},$A.dialog._op, options);
			//重复打开一个层
			if($dlg.size()>0) {
//				if(width>0){
//					$dlg.css("width",width);
//					$dlg.css("marginLeft",0-width/2);
//				}
                //获取dialog 目前状态
                var dlgOpState = $dlg.data(DIALOG_STATE.TAG);
                if(dlgOpState===DIALOG_STATE.OPENING){
                    return;
                }
                $dlg.data(DIALOG_STATE.TAG,DIALOG_STATE.OPENING);

				if(op.reload || url != $dlg.data("url")){
					this.reload(url,op);
				}else{
					showDialog($dlg,op);
				}
				//初始化对话框时，加载自定义绑定数据
				$dlg.removeData("bindData");
				if(op.bindData){
					$dlg.data("bindData",op.bindData);
				}

			} else { //打开一个全新的层
				if(op.hasheader){
					var ht=$template($A.frags["dialogFrag"],op);
					$dialogs.append($(ht.toString()));
				}else{
					var ht=$template($A.frags["dialogNoHeaderFrag"],op);
					$dialogs.append($(ht.toString()));
				}
				$dlg = $(">.dialog:last-child", $dialogs);
				//对话框添加状态
                $dlg.data(DIALOG_STATE.TAG,DIALOG_STATE.OPENING);
                //初始化对话框时，加载自定义绑定数据
				if(op.bindData){
					$dlg.data("bindData",op.bindData);
				}
				
				($.fn.bgiframe && $dlg.bgiframe());
				/*注册事件*/
				var pageLoad = op[$A.eventType.pageLoad];
				if(typeof pageLoad =="function"){
					$dlg.on($A.eventType.pageLoad,pageLoad);
				}else if(op.pageLoad===false){
					$dlg.unbind($A.eventType.pageLoad);
				}
//				if(width>0){
//					$dlg.css("width",width);
//					$dlg.css("marginLeft",0-width/2);
//				}
				
				$dlg.find(".dialog-header").find("h5").html(title);
				 if(options.width){
					 $dlg.css( "width", options.width);
				 }
				 if(options.height){
					// $dlg.css( "height", options.height);
				 		$dlg.innerHeight(options.height);
					 
				 }
				if(!op.mask){
					$dlg.click(function(){
						$A.dialog.switchDialog($dlg);
					});
				}
				
//				if(op.resizable)
//					$dlg.jresize();
				
				if(op.drawable&&op.hasheader)
					$dlg.dialogDrag();
				$("a.close", $dlg).click(function(event){ 
					$A.dialog.close($dlg,event);
					return false;
				});
				
//				$("div.dialog-header a", $dlg).mousedown(function(){
//					return false;
//				});
				$dlg.attr("reload",op.reload);
				this.reload(url,op);
				return $dlg;
			}
		},

		/**
		 * 设置当前对话框
		 */
		setCurrent:function($dlg) {
			var old = this.getCurrent();
			if(old&&old.is($dlg))
				return;
			$dlg.css("zIndex", ($options.zindexs.dialog));
			this._current.push($dlg);
			if(old)
				old.css("zIndex",$options.zindexs.dialogBack);
		},
		/**
		 * 切换当前层
		 * @param {Object} dialog
		 */
		switchDialog:function($dlg) {
			if($dlg == null || $dlg.length == 0)
				return;
			if($dlg.is(this.getCurrent()))
				return;
			var index = $dlg.css("zIndex");
			if(this.getCurrent()) {
				var cindex = $(this.getCurrent()).css("zIndex");
				$(this._current).css("zIndex", index);
				$dlg.css("zIndex", cindex);
				for(var i = 0; i< this._current.length; i++){
					if($dlg.equalObject(this._current[i])){
						this._current.splice(i,1);
					}
				}
				this._current.push($dlg);
			}
		},
		/**
		 * 关闭对话框
		 */
		close:function($dlg,event) {
			if ($dlg){
			var opt=$dlg.data("options");
			if (opt&&opt.beforeClose){
				
				if (opt.beforeClose.call(this,$dlg,event) === false){
					
					return;
				}
				
			}}
			if(typeof $dlg == 'string') 
				$dlg = $("#_dialogs #"+$dlg);
			if($dlg == null || $dlg.length == 0)
				return;
			$dlg.css("display","none");
			for(var i = 0; i< this._current.length; i++){
				if($dlg.equalObject(this._current[i])){
					this._current.splice(i,1);
				}
			}
			var cr= this.getCurrent();
			
			if(cr!=null)
				cr.css("zIndex", $options.zindexs.dialog);
			else
				$("#_dialogMask").hide();
			$dlg.trigger("hide");
			if($dlg.attr("reload")=="true"){
				$A.destroyDom($dlg);
				$dlg.trigger($A.eventType.pageDestroy).remove();
			}
			if (opt&&opt.afterClose){
				opt.afterClose.call(this,$dlg)
			}
		},
		/**
		 * 关闭当前对话框
		 */
		closeCurrent:function(){
			this.close(this.getCurrent());
		},
		//添加绑定数据功能
		getBindData:function($dlg){
			if(!$dlg){
				$dlg = this.getCurrent();
			}
			return $dlg.data("bindData");
		},
		checkTimeout:function(){
			var $conetnt = $(".dialog-content", this.getCurrent());
			var json = $A.jsonEval($conetnt.html());
			if (json && json.statusCode == $A.statusCode.timeout) this.closeCurrent();
		}
	};
	
	/**
	 * 对话框
	 */
	$.fn.closeDialog = function(){
		$A.dialog.close($(this));
	};
	
	$.fn.showDialog = function(){
		 $A.dialog.setCurrent($(this));
		 $(this).show();
	};
	/**
	 * 定义全局方法
	 */
	$.closeDialog = function($dlg){
		if($dlg){
			$dlg.closeDialog();
		}else{
			$A.dialog.closeCurrent();
		}
	};
	/**
	 * 定义全局方法
	 */
	$.openModalDialog = function(options){
		return $A.dialog.open(options);
	};
	
	$(document).on('click',"a[target=dialog]", function (e) {
		e.preventDefault();
		var $this = $(this);
		var opt = $this.getJsonAttr("_dialog_options");
		$.openModalDialog(opt);
	});
	
	return $A.dialog;
	
});


