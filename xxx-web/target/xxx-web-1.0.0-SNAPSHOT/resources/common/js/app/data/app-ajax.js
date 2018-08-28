
/**
 * 针对jquery增加ajax的扩展
 */
define(["app/core/app-jquery","app/core/app-core","app/util/app-utils",
        "app/widgets/window/app-messager","app/core/app-options",
        "app/data/app-json-result"],
        function($,$A,$utils,$messager,$options,JsonResult) {
	
	
	var _ajaxProgressBar = $("#_ajaxProgressBar");
	
	if (_ajaxProgressBar.length==0){
	
		$("body").prepend('<div id="_ajaxProgressBar" class="ajaxProgressBar" style="display:none;"><!--<div class="ajaxProgressBarText">数据处理中..</div>--></div>')
		_ajaxProgressBar= $("#_ajaxProgressBar");
	}
	
	$(document).ajaxStart(function(){
		_ajaxProgressBar.show();
	}).ajaxStop(function(){
		_ajaxProgressBar.hide();
	}).ajaxError(function(){
		_ajaxProgressBar.hide();
	})
	var browser=$.fn.getBrowser()
	if(browser.msie && browser.version === '8.0'){
		$.ajaxSetup({ cache: false });
	}
	$A.loadLogin=function(){
		
		//	window.location.href="main.do";
			window.location.reload();	
		}
	
	/**
	 * 回调用方法列表
	 */
	function _callback(funcs,json,$toggle){
		if(funcs == null)
			return;
		if(typeof funcs === "string")
			funcs = funcs.split(",");
		if(!$.isArray(funcs))
			return
		for(var i = 0; i < funcs.length; i++){
			if($.isFunction($A.ajax.callbackFunctions[funcs[i]])){
				$A.ajax.callbackFunctions[funcs[i]](json,$toggle);
			}
		}
	};
	/**
	 * ajax之前调用的方法
	 * @param $toggle 触发元素
	 * @param options ajax选项
	 * @returns 是否可以继续调用
	 */
	function _breforeCall(options){
		var $toggle=options.toggle
			,funcs = options.beforeCall||($toggle?$toggle.attr("ajax-before"):null);
		if(!funcs)
			return true;
		funcs = funcs.split(",");
		var i = options['_beforeCallIndex']||0;
		for(;i < funcs.length; i++){
			var fn = $A.ajax.beforeCallFunctions[funcs[i]];
			options['_beforeCallIndex'] = i+1;
			if(!$.isFunction(fn))
				continue;
			if(!fn(options))
				return false;
		}
		return true;
	}
	var autoEncodeURI = false;
	if(window.__BsAppConfig && window.__BsAppConfig.ajax && window.__BsAppConfig.ajax.autoEncodeURI){
        autoEncodeURI = true;
	}

/**
	 * 表单提交后的方法处理
	 */
	var that = {
		autoEncodeURI:autoEncodeURI,
		callbackFunctions:{
			/**
			 * 刷新表格对象
			 */
			refreshTable:function(json,options){
				var $toggle = options.toggle;
				if($toggle && $toggle.attr("refreshTable")){
					$A($toggle.attr("refreshTable")).bsgrid("reload");
				}else if(options["refreshTable"]){
					$A(options["refreshTable"]).bsgrid("reload");
				}else{
					$A(".jqgrid").bsgrid("reload");
				}
			},
			/**
			 * 刷新表格对象
			 */
			refreshMainDetail:function(json,options){
				var params = json.params;
				if(!params)
					return;
				$(params).each(function(key,value){
					var $ctrl = $A(key);
					if($ctrl.length == 0)
						return;
					if($ctrl.isForm()){
						$ctrl.refreshFormData(value);
					}else if($ctrl.isGrid()){
						if(!value)
							return;
						if(options.submitMode=="all"){
							$ctrl.bsgrid("refreshAllData",value);
						}else{
							$ctrl.bsgrid("refreshEditData",value);
						}
					}
				});
			},
			/**
			 * 通过ajax方式刷新当前页面
			 */
			refreshAjaxPage:function(json,options){
				var $toggle = options.toggle;
				var box = json.refreshBox||options['refreshBox']||$toggle.attr('refreshBox')||$toggle.attr('data-target')
					,$box=$(box)
					,url = json.url||options['refreshUrl']||$toggle.attr('refreshUrl')||$box.attr("url");
				if(url && $box.length>0)
					$box.htmlAJAX({url:url});
			},
			/**
			 * 刷新当前页面
			 */
			refreshPage:function(json,options){
				window.location.reload();
			},
			/**
			 * 刷新数据加载器
			 */
			reloadDataLoader:function(json,options){
				var $toggle = options.toggle;
				var target = json.dataloader||options["dataloader"]||($toggle?$toggle.attr("dataloader"):null);
				$(target).dataloader("load");
			},
			/**
			 * 跳转到其他页面
			 */
			forwardUrl:function(json,options){
				var $toggle = options.toggle;
				var url=json.forwardUrl||options["forwardUrl"]||($toggle?$toggle.attr("forwardUrl"):null);
				if(window.location.href == url)
					return;
				window.location=url;
			},
			/**
			 * 关闭自己
			 */
			closeSelf:function(json,options){
				var $dialog = $A.getCurrentDialog();
				if($dialog&&$dialog.length>0){
					$A.dialog.close($dialog);
					return;
				}
				$A.navTab.closeCurrentTab();
			},
			/**
			 * 切换页签
			 */
			switchTab:function(json,options){
				var tabId=json.tabId||options.tabId;
				var $tab = $("#"+tabId,$A.getContainer());
				$tab.tab("show");
			},
			/**
			 * 回调方法
			 */
			callMethod:function(json,options){
				var $toggle = options.toggle;
				var method = json.method||options["callMethod"]||($toggle?$toggle.attr("callMethod"):null);
				if(method){
					method = decodeURIComponent(method);
					setTimeout(new Function(methodName), 100);
				}
			}
		},
		beforeCallFunctions:{
			/**
			 * 收集数据并作为参数
			 * @param options ajax调用选项
			 */
			collectData:function(options){
				var $toggle=options.toggle
					,finder = options.collectFinder||($toggle?$toggle.attr("collectFinder"):null)
					,valAttr = options.collectAttr||($toggle?$toggle.attr("collectAttr"):'value')
					,param = options.collectParam||($toggle?$toggle.attr("collectParam"):'checkId')
					,box = options.collectBox||($toggle?$toggle.attr("collectBox"):document)
					,$box = $(box);
				if(!finder)
					return true;
				var paramVal = [];
				$(finder,$box).each(function(){
					paramVal.push($(this).attr(valAttr));
				});
				if(paramVal.length>0){
					if(paramVal.length == 1)
						paramVal = paramVal[0];
					var data = options['data'];
					if(!data){
						data = options['data'] = {};
					}
					data[param]=paramVal;
				}
				return true;
			},
			/**
			 * 调用前确认提示
			 */
			confirmPrompt:function(options){
				var $toggle=options.toggle
					,prompt=options.confirm||($toggle?$toggle.attr("confirm"):null);
				if (prompt) {
					prompt = prompt.evalTemplate($toggle);
					if(!prompt)
						return;
					$messager.confirm(prompt, {
						okCall: function(ok){
							return ok&&$A.ajax.ajaxCall(options);
						}
					});
					return false;
				}
				return true;
			}
		},
		/**
		 * ajax成功后调用的方法
		 */
		successCall:function(json,options){
			/*that.ajaxSuccess(json);
			if (json.statusCode != null&&json.statusCode != $A.statusCode.ok)
				return;
			var $toggle = options.toggle;
			_callback(json.callbackType,json,options);
			var cb = options.afterCall;
			if(cb){
				_callback(cb,json,options);
			}
			if($toggle && $toggle.length>0)
				_callback($toggle.attr("callback"),json,options);
			if(options.callback){
				options.callback(json,options);
			}*/
		},
		
		respToResult:function(src){
	    	var o=null;
	    	var reuslt
	    	if ($.type(src) === "string") {
	    		try{
	    			
	    		 o = $.parseJSON(src);
	    		}catch(ex){
	    			o=src;
	    		}
	    	} else if ($.isPlainObject(src) && src.responseText) {
	    		try{
	    		o = $.parseJSON(src.responseText);
	    		}catch(ex){
	    			try{
	    			o = $A.jsonEval(src.responseText);
	    			
	    			
	    			}
	    			catch(ex){
	    				o=src.responseText;
	    			}
	    		}
	    	} else {
	    		o = src;
	    	}
	    	if (o && o["type"]&&o["type"]=="__bosssoft"){
	    		reuslt = new JsonResult(o);
	    	}else{
	    		reuslt=o;
	    	}
	    	return reuslt;
	    },
		paramEncode:function(url){
            var QueryPattern = /([^?]*)\?(.*)/;
            var urlGroup = 	url.match(QueryPattern);
			if(urlGroup === null || !urlGroup[1]){
				return url;
			}
			var urlEncode = urlGroup[1]+'?';
			var queryString = urlGroup[2];
			var queryArray = queryString.split('&');
			for(var i = 0, size = queryArray.length; i < size; i++){
				var splitEqu = queryArray[i].split('=');
				var field = splitEqu[0];
				var value = splitEqu[1];
				var paramStr = field+'=';
				if(value){
					paramStr+=encodeURIComponent(value);
				}
                urlEncode = urlEncode + paramStr;
                urlEncode = urlEncode + ((i==size-1)?'':'&');
			}
			return urlEncode;
		},
		/**
		 * ajax 远程调用
		 */
		ajaxCall:function(config){
			var _self=this;
			var options = $.extend({
				type:'POST',
				dataType:"json",
				cache: false,
				failure : function(data,jr) {
					$messager.error(jr.getMessage());
				}
			},config);
			if (options.success || options.failure) {
				var processSuccess = options.success||options.callback;
				var processFailure = options.failure;
                processSuccess = $.isFunction(processSuccess)?processSuccess:$.noop;
                processFailure = $.isFunction(processFailure)?processFailure:$.noop;
                options.success = function(resp, opts) {
					
					try{
					var json=_self.respToResult(resp);
					_self.ajaxSuccess(json, opts)
					if (json instanceof JsonResult){
						code = json.getCode();
						message = json.getMessage();
						if (code === JsonResult.SUCCESS) {
							processSuccess(json.getData(),json, opts);
						} else {
							processFailure(json.getData(),json, opts);
						}
					}else{
						processSuccess(json, opts);
					}
					}catch(ex){
						if (window.console){
							window.console.log(ex);
						}else{
							$messager.error('系统繁忙！请稍后重试...');
						}
						ajaxDebugInfo(options, resp, opts);
					}
				}
			}
			
			if (options.error) {
				var processError=options.error;
				options.error=function(xhr, ajaxOptions, thrownError, options){
						var json=_self.respToResult(xhr);
						processError(json,xhr, ajaxOptions, thrownError, options)
				}
				
			}else{
				options.error=that.ajaxError;
			}
			
			if(!_breforeCall(options))
				return;
			if (options.data){
			if('object' == $.type(options)){//Mr.T 如果为对象 则将对象按照请求类型进行字符串拼接
				if((options.contentType && options.contentType.indexOf('application/json') > -1)){
					options.data = JSON.stringify(options.data);
				}else{
					options.data = $.param(options.data, true);
				}
			}
			}

			if(that.autoEncodeURI){
                options.url = that.paramEncode(options.url);
			}
			var result = $.ajax(options);
			//如果為同步代碼，验证返回是否
			if(options.async==false){
				try{
                    result = eval(result);
                    if($.type(result)==='object'){
                        result.statusCode&&$A.ajax.ajaxSuccess(result);
                    }
                }catch(e) {
					//TODO
				}

			}
			return result;
		},

		/**
		 * ajax访问错误处理
		 */
		ajaxError:function (xhr, ajaxOptions, thrownError, op){
			if(xhr.status=="401"){
				//$A.ajaxLogin();
			}else if(xhr.status=="405"){
				
			}else if(xhr.status=="404"){
				$messager.error("找不到对应的URL地址");
			}
			else{
				var json=that.respToResult(xhr);
				if (json instanceof JsonResult){
					$messager.error(json.getMessage());
				}else{
					var message=json["message"]||"网络异常,请求出错!"
					$messager.error(message);
				}
			}
				/**
				$messager.error("<div>Http status: " + xhr.status + " " + xhr.statusText + "</div>" 
						+ "<div>ajaxOptions: "+ajaxOptions + "</div>"
						+ "<div>thrownError: "+thrownError + "</div>"
						+ "<div>"+xhr.responseText+"</div>");
						**/
//			}else{
//				$messager.error("系统发生异常,请联系管理员");
//			}
			if( this.errorHandle && $.isFunction(this.errorHandle)){
				this.errorHandle();
			}
		},
		/**
		 * ajax访问成功后的处理
		 */
		ajaxSuccess:function (json){
			if(json.statusCode == $A.statusCode.error || json.statusCode == $A.statusCode.internalError|| json.statusCode == $A.statusCode.notFound) {
				if(json.message)
					$messager.error(json.message);
			} else if (json.statusCode == $A.statusCode.timeout) {
				
					$messager.error(json.message, {okCall:$A.loadLogin});
			
			} else {
				if(json.message)
					$messager.correct(json.message);
			};
		}
	};
	$A.ajax = that;
	$.fn.extend({
		/**
		 * 通过ajax请求向元素内部增加请求结果html
		 * @url{string}请求的地址
		 * @data{object}请求数据
		 * @callback{function}回调方法
		 */
		loadUrl: function(url,data,callback){
			$(this).htmlAJAX({url:url, data:data, callback:callback});
		},
		/**
		 * 当前容器加载URL内容
		 * @param options 加载选项
		 * {
		 * 		type:请求方式POST/GET默认POST
		 * 		cache:是否缓存true/false默认false 
		 * 		async:是否异步true/false默认true
		 * 		global:是否为全局请求(是否会触发ajaxStart和ajaxEnd的事件)默认为true
		 * 		success:请求成功时的方法处理
		 * 		error:请求失败的方法处理
		 * 		operator:加载内容后内容处理append/prepend/before/after/inner，默认设置为当前元素的内容
		 * 		init:是否进行界面初始化，默认为true
		 * 		history:true
		 * }
		 * 
		 */
		loadAppURL: function(options){
			var $this = $(this);
			
			if ($.fn.xheditor) {
				$("textarea.editor", $this).xheditor(false);
			}
            var op = {
				type:'POST',
				cache:false,
				async:true,
				init:true,
				history:false,
				title:window.title,
			};
            op = $.extend(op,$options.ajax,options,{

                complete:function(response,flag,responses, responseHeaders ){
                    if (response.status=="404"){
                        $messager.error("找不到对应的URL地址");

                    }

                },
                success:function(response,flag,xhr){
                    var loadMask;
                    if(op.history){
                        var title=this.title;
                        var url=this.url;
                        History.pushState({title:title,url:url},title,url);
                    }
                    var json = $A.jsonEval(response);
                    if (json.statusCode==$A.statusCode.timeout){
                        /*session超时处理*/
                        if(json.message)
                            $messager.error(json.message, {okCall:$A.loadLogin});
                        else
                            $A.loadLogin();
                    } else if (json.statusCode==$A.statusCode.error|| json.statusCode == $A.statusCode.internalError|| json.statusCode == $A.statusCode.notFound){
                        /*错误处理*/
                        if(json.message)
                            $messager.error(json);
                        if (options.error&&$.isFunction(options.error)){

                            options.error.call(this,arguments)

                        }
                    } else {
//						var funcId = xhr.getResponseHeader("funcid");
//						var menuId = xhr.getResponseHeader("menuid");
//						var subSysId = xhr.getResponseHeader("subSysId");
//						if(funcId&&menuId){
//							$this.data("__funcid",funcId);
//							$this.data("__menuid",menuId);
//							$this.data("__subsysid",subSysId);
//						}
                        $this.css('visibility','hidden');
                        switch(this.operator){
                            case "append":
                                $this.append(response);
                                break;
                            case "prepend":
                                $this.prepend(response);
                                break;
                            case "before":
                                $this.before(response);
                                break;
                            case "after":
                                $this.after(response);
                                break;
                            case "replace":
                                $this=$this.replaceWith(response);
                                break;
                            default:

                                if(op.loading){
                                    loadMask=$("<div class=\"loadingPage-mask\"></div>");
                                    $this.html(response)
                                    loadMask.height( $this.innerHeight());
                                    loadMask.width( $this.innerWidth());
                                    $this.prepend(loadMask);
                                }else{
                                    $this.html(response)
                                }
                        }


                        if ($.isFunction(this.beforePageInit)){
                            $A.resolveUiPageModel($this);
                            this.beforePageInit($this, model);
                        }
                        if(this.onPageLoad){
                            $this.one($A.eventType.pageLoad,{"pageLoadFunc":this.onPageLoad,"uiPageModel":$this.data("uiPageModel")},function(e){
                                e.data["pageLoadFunc"]($this.data("uiPageModel"));
                                if (loadMask){
                                    loadMask.remove();
                                }
                                $this.css('visibility', '');
                            });
                        }else {
                            $this.one($A.eventType.pageLoad, function () {
                                if (loadMask) {
                                    loadMask.remove();
                                }
                                $this.css('visibility', '');
                            })
                        }
                        // 如果可能页面没js 执行速度回比较快，执行不到监听回调  $this.one($A.eventType.pageLoad
                        if(options.init !==false){
                            $this.initPageUI();
                        }
                        if ($.isFunction(this.callback)){
                            //add by tw
                            this.callback(response,$this.data("uiPageModel"));
                        }
                    }
                    $this.fadeIn();
                },
                error:function (xhr, ajaxOptions, thrownError){
                    that.ajaxError(xhr, ajaxOptions, thrownError);
                    if (options.error&&$.isFunction(options.error)){
                        options.error.call(this,arguments)
                    }
                    //that.ajaxError(xhr, ajaxOptions, thrownError);
                    $this.fadeIn();
                }
			});
            //如果是ie，url进行中文 encodeURI
			if (!$.browser.webkit){
				if (op.url){
					op.url=encodeURI(op.url)
				}
			}
			$.ajax(op);
		},
		appendAJAX:function(options){
			options.operator='append';
			$(this).loadAppURL(options);
		},
		prependAJAX:function(options){
			options.operator='prepend';
			$(this).loadAppURL(options);
		},
		breforeAJAX:function(options){
			options.operator='before';
			$(this).loadAppURL(options);
		},
		afterAJAX:function(options){
			options.operator='after';
			$(this).loadAppURL(options);
		},
		replaceAJAX:function(options){
			options.operator='replace';
			$(this).loadAppURL(options);
		},
		htmlAJAX:function(options){
			options.operator=null;
			$(this).loadAppURL(options);
		}

	});
	$("body").on("click.data-api","[ajax-toggle='ajax']", function(event){
		event.preventDefault();
		var $this = $(this)
			,url = $utils.evalElementAttr($this);
		if (!url) {
			return false;
		}
		that.ajaxCall({url:url,toggle:$this});
	});
	return that;
	/**
	 * ajax请求回执处理异常信息打印
	 */
	function ajaxDebugInfo(options, resp, status){
		if(window.debugModel){
			var msg = ['请求地址：' + options.url];
			msg.push('请求处理状态：' + status);
			msg.push('请求处理结果：' + resp);
			alert(msg.join('。'));
		}
	}
});