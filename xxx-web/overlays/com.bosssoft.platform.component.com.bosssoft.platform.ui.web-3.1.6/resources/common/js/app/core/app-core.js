/**
 * App系统核心对象
 */
define(["jquery", "app/core/app-jquery", "base/json2"], function($) {

	var $A = undefined,$hostUrl="",$contextPath,$caInfo=null,_caCryptoType;
	$A = function(selector, context) {
		if (typeof $A._exfn == "function") {
			return $A._exfn(selector, context);
		}
		return $(selector, context);
	};
    $A.debug = false;
    (function (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable && pair[1]=='true'){
            	$A.debug = true;
            	return;
            }
        }
    })("__debug");
	return $.extend($A, {
		/**
		 * 设置为开发状态
		 */
		develop : true,
		/**
		 * 常用键盘码常量
		 */
		keyCode : {
			ENTER : 13,
			ESC : 27,
			END : 35,
			HOME : 36,
			SHIFT : 16,
			TAB : 9,
			LEFT : 37,
			RIGHT : 39,
			UP : 38,
			DOWN : 40,
			DELETE : 46,
			BACKSPACE : 8,
			HOME : 36,
			END : 35,
			PLUS : 187,
			PLUS1 : 107,
			MINUS : 189,
			MINUS1 : 109,
			POINT : 190,
			POINT1 : 110,
			PgUp : 33,
			PgDn : 34,
			Z : 90
		},
		/**
		 * 是否属于数组按键中
		 */
		containKeyCode : function(e, keys) {
			for (var i = 0; i < keys.length; i++) {
				var keyInfo = keys[i];
				if (isNaN(keyInfo)) {
					if (keyInfo.keyCode != e.keyCode) {
						continue;
					}
					if (keyInfo.ctrlKey != undefined) {
						if (keyInfo.ctrlKey != e.ctrlKey) {
							continue;
						}
					}
					if (keyInfo.shiftKey != undefined) {
						if (keyInfo.shiftKey != e.shiftKey) {
							continue;
						}
					}
					return true;
				} else if (e.keyCode == keyInfo) {
					return true;
				}
			}
			return false;
		},
		/**
		 * 远程访问的状态码
		 */
		statusCode : {
			ok : 200,
			error : 300,
			timeout : "250",
			internalError : 500,
			notFound : 404
		},

		/**
		 * require 脚本文件时缓存的参数及对象使用的属性
		 */
		jsattrs : {
			PARAM : "__jsparam",
			OBJECT : "__jsobj"
		},
		/**
		 * 系统初始化方法集合
		 */
		initMethods : {},
		/**
		 * 系统销毁方法集合
		 */
		destroyMethods : {},
		/**
		 * 状态对象
		 */
		status : {
			spliter : true
		},
		/**
		 * 自定义事件类型
		 */
		eventType : {
			pageLoad : "onload",
			pageDestroy : "pageDestroy"
		},
		/**
		 * 注册初始化方法
		 * 
		 * @param key{String/Object}
		 *            包含多个初始化方法的集合
		 * @param func{Function}
		 *            构造方法
		 */
		regInitMethod : function(key, func) {
			var othis = this;
			var initMethods = othis.initMethods;
			if ($.isPlainObject(key)) {
				initMethods = $.extend(initMethods, key);
			} else if ($.isFunction(key)) {
				if (key.appid) {
					initMethods[key.appid] = null;
					delete initMethods[key.appid];
				} else {
					key.appid = othis.nextId();
					initMethods[key.appid] = key;
				}
			} else if (typeof key === "string") {
				if (func && $.isFunction(func)) {
					func.appid = key;
					initMethods[key] = func;
				} else {
					initMethods[key] = null;
					delete initMethods[key];
				}
			} else {
				throw "valid component's constructor";
			}
		},
		getPageComponens:function(box){
			var box=box||$A.getContainer();
			if (!$(box).data("componens")){
				var $componens = $("[name=componens]",box),componens=null;
				if ($componens.length>0){
					var cmpstr=$componens.val().trim();
					componens=$.parseJSON(cmpstr)
				}
				$(box).data("componens",componens);
				 $("[name=componens]",box).remove();
			}
			return $(box).data("componens");
		},
		//根据控件id检测控件权限
		cehckPageComponensById:function(id){
			var cmps=this.getPageComponens();
			var hasRight=true;
			if (cmps){
				
				for (var i=0;i<cmps.length;i++){
					cmp=cmps[i]
					if (cmp.id==id&&cmp.hidden==true){
						hasRight=false;
					}
				}
				
			}
			return hasRight;
		},
		/**
		 * 检验页面控件权限
		 */
		checkPageComponens:function($box){
			//获取当前页面控件权限
			var cmps=this.getPageComponens($box),cmp;
		
			if (cmps){
			
				for (var i=0;i<cmps.length;i++){
					cmp=cmps[i]
					if (cmp.hidden==true){
						 $("[id="+cmp.id+"]",$box).remove();
					}
				}
				/*var pageComponens=cmp["pageComponens"],checkUserCmp=cmp["userComponens"];
				if (pageComponens!=""){
					var pagecmps=pageComponens.split(",");
					for(var i=0,len=pagecmps.length;i<len;i++){
						if (pagecmps[i]&&!checkUserCmp[pagecmps[i]]){
							 $("[id="+pagecmps[i]+"]",$box).remove();
						}
					}
				}*/
				
			}
			
			
		},
		/**
		 * 初试化方法调用
		 */
		initCalls : function($box) {
			var othis = this;
			var initMethods = $A.initMethods;
			for (name in initMethods) {
				initMethods[name]($box);
			}
		},
		/**
		 * 初始化方法，包括组件和布局等
		 */
		init : function(box) {
			var $box=$(box||"body");
			$box.clearAppJsObject();
			var $js = $("[name=jsRequire]",$box);
		
			this.checkPageComponens($box);
			if($js.length == 0){
				$A.initCalls($box);
				return;
			}
		
			var rs =new Array;
			var ids=new Array;
			$js.each(function(idx,item){
				var $item=$(this),jspath = $item.val();
				if(jspath){
					ids.push($item.attr("id"));
					rs.push(jspath);
				}
			});
			if(rs.length == 0){
				$box.css('visibility','');
				$A.initCalls($box);
				return;
			}
			require(rs,function(){
				var jsobj = new Array,nids=new Array,args=arguments;
				$.each(args,function(i){
					if(args[i] != null && ids[i]!=null){
						jsobj.push(args[i]);
						nids.push(ids[i]);
					}
				});
				if(nids.length > 0){
					$box.setAppJsObject(nids,jsobj);
					triggerBeforePageInit(jsobj, $box);
					//add by tw
					if($box.data("onPageLoad")){
						var funcName = $box.data("onPageLoad");
						try{
							var f = new Function(nids,"return ("+funcName+")");
							var onPageLoadFunc = f.apply(this,jsobj);
							$box.one($A.eventType.pageLoad,{"pageLoadFunc":onPageLoadFunc,"uiPageModel":$box.data("uiPageModel")},function(e){
								if (e.data["pageLoadFunc"]){
									
									e.data["pageLoadFunc"].call(jsobj[0],e.data["uiPageModel"],$box)
									//e.data["pageLoadFunc"].appli(e.data["uiPageModel"],$box);
								}
							});
						}catch(e){
							window.alert(e);
							return {};
						}
					}
					
				}
				$A.initCalls($box);
			});
			$js.remove();
			$A.resolveUiPageModel($box);
			$box.removeData("onPageLoad");
			var $uiPageLoad = $(">div.__uiPageLoad",$box);
			if($uiPageLoad.length>0){
				var pageLoadFuncName = $uiPageLoad.text();
				$box.data("onPageLoad",pageLoadFuncName);
				$uiPageLoad.remove();
			}
			/**
			 * 页面对象声明的pageBeforeInit方法
			 */
			function triggerBeforePageInit(jsobj, $box){
				if(!(jsobj && jsobj[0])){
//					$box.css('visibility','');
					return;
				}
				var func = jsobj[0].beforePageInit;
				if(!$.isFunction(func)){
//					$box.css('visibility','');
					return;
				}
				func($box, $box.data('uiPageModel'));
				$box.css('visibility','');
			}
			//end add by tw
		},
		resolveUiPageModel: function($box){
			//add by tw
			var $pageModel = $(">div.__uiPageModel",$box);
			if($pageModel.length>0){
				var json = $pageModel.text();
				$box.data("uiPageModel",$.parseJSON(json));
				$pageModel.remove();
			}else{
				$box.data("uiPageModel", {innerModel: true});
			}
		},
		/**
		 * 页面销毁时处理方法
		 */
		regDestroyMethod : function(key, func) {
			var othis = this;
			var destroyMethods = othis.destroyMethods;
			if ($.isPlainObject(key)) {
				destroyMethods = $.extend(destroyMethods, key);
			} else if ($.isFunction(key)) {
				if (key.appid) {
					destroyMethods[key.appid] = null;
					delete destroyMethods[key.appid];
				} else {
					key.appid = othis.nextId();
					destroyMethods[key.appid] = key;
				}
			} else if (typeof key === "string") {
				if (func && $.isFunction(func)) {
					func.appid = key;
					destroyMethods[key] = func;
				} else {
					destroyMethods[key] = null;
					delete destroyMethods[key];
				}
			} else {
				throw "valid component's destroy";
			}
		},
		/**
		 * 销毁方法调用
		 */
		destroyCalls : function($box, e) {
			var othis = this;
			var destroyMethods = othis.destroyMethods;
			for (name in destroyMethods) {
				destroyMethods[name]($box, e);
			}
		},
		/**
		 * 页面加载时调动，非ajax加载
		 * 
		 * @param options
		 */
		boot : function(options) {
			this.options = $.extend(this.options, options);
			this.init();
			var _doc = $(document);
			var $this = this;
			if (!_doc.isBind(this.eventType.pageDestroy)) {
				_doc.bind(this.eventType.pageDestroy, function(e) {
							var box = e.target;
							$this.destroyCalls(box, e);
						});
			}
		},

		/**
		 * 生成下一个id或一组id
		 * 
		 * @param count{Number}
		 *            生成id的个数
		 */
		nextId : (function() {
			var idno = 0;
			return function(count) {
				if (count && count > 1) {
					var ids = new Array();
					for (var i = 0; i < count; i++) {
						idno++;
						ids.push("app_" + idno);
					}
					return ids;
				}
				return ++idno;
			};
		})(),
		/**
		 * 字符串转换为json对象
		 * 
		 * @param json{Object}
		 *            json对象
		 */
		jsonEval : function(json, context) {// add by tw
			try {
				// add by tw
				if (context) {
					var evalstr = "";
					for (var key in context) {
						evalstr += "var " + key + "=context[\"" + key + "\"];";
					}
					eval(evalstr);
					return eval('(' + json + ')');
				}
				// end add by tw
				return eval('(' + json + ')');
			} catch (e) {
				return {};
			}
		},
		/**
		 * json转换为字符串
		 * 
		 * @param json{Object}
		 *            json对象
		 * @param {string}
		 *            字符串
		 */
		toJsonString : function(value, replacer, space) {
			return JSON.stringify(value, replacer, space);
		},
		/**
		 * 调试信息输出
		 */
		log : function(msg) {
			if (this.develop) {
				if (window.console)
					console.log(msg);
				else
					alert(msg);
			}
		},
		/**
		 * 生成唯一的id字符串：前缀+当前时间毫秒数
		 * 
		 * @param prefix
		 *            前缀
		 * @returns {String}
		 */
		uuid : function(prefix) {
			prefix = prefix === undefined ? 'bs_' : prefix;
			return prefix + this.nextId();
		},
		/**
		 * 获取页面元素的属性
		 * 
		 * @returns 元素属性
		 */
		getAttrFromElement : function($element) {
			try{
				var attrs = getAttrs($element[0]), _options = $element
						.getJsonAttr('_options');
				// 初始化数据源
				if (attrs.data) {
					attrs.data = $element.getJsonAttr('data');
				}
				// 初始化以选中节点
				if (attrs.selectednode) {
					attrs.selectednode = $element.getJsonAttr('selectednode');
				}
				// 初始化回调事件
				if (attrs.events) {
					$.extend(attrs, $element.getJsEvent(attrs.events));
				}
				return $.extend(attrs, _options);
			}catch(e){
				var id = $element.attr('id');
				if(!id){
					id = $element[0].outerHTML;
				}
				throw new Error('组件[' + id + ']获取属性出错.');
			}
			/**
			 * 获取元素的属性
			 * 
			 * @param $el
			 * @returns {___anonymous2415_2416}
			 */
			function getAttrs($el) {
				var attrs = {};
				if ($el.attributes) {
					// 继承html的原有属性
					$.each($el.attributes, function(i, att) {
								var name = att.name.toLowerCase();
								if (att.value == 'true') {
									attrs[name] = true;
								} else if (att.value == 'false') {
									attrs[name] = false;
								} else {
									if (att.value)
									attrs[name] = $.fn.escapeHtml(att.value);
								}
							});
				}
				return attrs;
			}
		},
		destroyDom : function(dom) {
			var plugins = $A.options.getPlugins();
			var comps = [];
			for (var i = 0; i < plugins.length; i++) {
				var plugin = plugins[i];
				var r;
				
				if (!plugin.className){
					 r=$('.app-' + plugin.pluginName, dom);
				}else{
					 r=$('.' + plugin.className, dom);
				}
				
				if (r.length) {
					if (r[plugin.pluginName]) {
						comps.push({
									name : plugin.pluginName,
									jq : r
								});
					}
				}
			}
			var destroy=false;
			for (var i = 0; i < comps.length; i++) {
				var destoryItem = comps[i];
				destroy=false;
				$.each(destoryItem.jq, function(index, item) {
					var data = $("input:first-child", item).data(destoryItem.name);
					if(data){
						data.destroy();
						destroy=true;
					}
				});
				if (destroy==false){
				destoryItem.jq[destoryItem.name]('destroy');
				}
			}
			if (!typeof CollectGarbage == "undefined") {
				CollectGarbage()
			}
		},
		getComponent: function($input, componentName){
			if(!$A.debug){
				return $input.data(componentName);
			}
			var data = $input.data();
			if(!data){
				return;
			}
			var componentNames = ['textbox', 'number', 'money', 
                  'comboztree', 'combogrid', 'checkbox', 'suggest',
                  'datetime', 'typeahead', 'reference', 'combobox']
				,names = [];
			for(var i = 0; i < componentNames.length; i++){
				var name = componentNames[i]
				if(data[name]){
					names.push(name);
				}
			}
			if(names.length == 0){
				return null;
			}else if(names.length == 1){
				if(names[0] == componentName){
					return data[componentName];
				}else{
					throw new Error('该组件已经声明为[' + names[0] +
							'],无法重复声明为[' + componentName + ']');
				}
			}else{
				throw new Error('无法捕获的异常');
			}
		},
		/**
		 * 调用组件的方法
		 */
		componentMethodApply: function(component, methodName, methodArgs){
			if(!component){
				throw new Error('调用未初始化的组件方法');
			}
			var method = component[methodName];
			if($.isFunction(method)){
				return method.apply(component, methodArgs);
			}else{
				throw new Error('组件未声明[' + methodName + ']方法');
			}
		},
		/**
		 * 组件方法调用异常包装
		 */
		throwCompMethodError: function($element, className, methodName, e){
			var id = $element.attr('id')
				,msg = ''
				,type = getTypeMsg(e, $element);
			if(!id){
				id = $element[0].outerHTML;
			}
			msg = '通过元素[' + id + ']调用类型为[' + className + ']组件的[' + methodName + ']方法时出现异常';
			if(type){
				msg += ':元素已声明为类型[' + type + ']的组件:' + e;
			}else{
				msg += ':' + e;
			}
			throw new Error(msg);
			function getTypeMsg(e, $element){
				if(e.message == '调用未初始化的组件方法'){
					var $parent = $element.parent();
					if(!$parent.hasClass('app-wrapper')){
						return ''; 
					}
					if($parent.hasClass('app-textbox')){
						return 'textbox';
					}
					if($parent.hasClass('app-combobox')){
						return 'combobox';
					}
					if($parent.hasClass('app-number')){
						return 'number';
					}
					if($parent.hasClass('app-money')){
						return 'money';
					}
					if($parent.hasClass('app-comboztree')){
						return 'comboztree';
					}
					if($parent.hasClass('app-combogrid')){
						return 'combogrid';
					}
					if($parent.hasClass('app-typeahead')){
						return 'typeahead';
					}
					if($parent.hasClass('app-suggest')){
						return 'suggest';
					}
					if($parent.hasClass('app-datatime')){
						return 'datatime';
					}
				}
				return '';
			}
		},
		/**
		 * 组件初始化调用异常包装
		 */
		throwCompInitError: function($element, className){
			var id = $element.attr('id');
			if(!id){
				id = $element[0].outerHTML;
			}
			throw new Error('元素[' + id + ']已经初始化为[' + className + ']组件:无法重复初始化');
		},
		showWaitScreen: function(msg){
			if(typeof msg === 'undefined'){
				msg = '正在努力加载中...'
			}
			if(!$a.$wait){
				$a.$wait = $('<div id="waitMask" class="dialog-mask" style="z-index:999999999;display:block;"><div>');
				$a.$wait.append($('<div style="width: 150px;height: 150px;margin: auto;position: absolute;top: 0;left: 0;bottom: 0;right: 0;color: #fff;font-size: 18px;">\
									<div style="width: 124px;height: 124px;background:url(resources/common/themes/default/images/loading2.gif) no-repeat center center;margin-bottom: 5px;"></div>\
									<div id="waitScreenMsg">' + msg + '</div></div>'));
				$a.$wait.appendTo('body');
			}else{
				$a.$wait.find("#waitScreenMsg").text(msg);
				$a.$wait.show();
			}
		},
		hideWaitScreen: function(){
			if($a.$wait){
				$a.$wait.hide();
			}
		},
		setContextPath:function(contextPath){
			$contextPath=contextPath
		},
		getContextPath:function(){
			return $contextPath;
		},
		getCaProvider:function(){
			
			return _caProvider;
			
		},
		setCaInfo:function(caInfo){
			
			$caInfo=caInfo;
		},
		getCaInfo:function(){
			return $caInfo;
		},
		getHostUrl:function(){
			var location=window.location;
			try{
				if (!$contextPath){
					$contextPath=_contextPath;
				}
			}catch(ex){
				
			}
			if ($hostUrl==""){
				$hostUrl=location.protocol+"//"+location.host+$contextPath+"/";
			}
			return $hostUrl;
		},
		getCaCryptoType:function(){
			
			return _caCryptoType;
			
		},
		setCaCryptoType:function(caCryptoType){
			_caCryptoType=caCryptoType
			
		}

	});
});