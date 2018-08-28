/**
 * 针对jquery增加核心的扩展
 */
define(["jquery","app/core/app-core","base/pinyin","app/core/app-options-helper"],function($,$A,$pinyin,ConfigHelper){
	
	
	/**
	 * 空方法
	 */
	$.emptyFunction = function(){};
	
	$.isEmpty = function(v, allowBlank){
            return v === null || v === undefined || (($.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
    };
	$.extend($.fn,{
		getBrowser : function(){
			   
			   var userAgent = navigator.userAgent.toLowerCase();
			   return {
				    version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
			        safari: /webkit/.test(userAgent),
			        opera: /opera/.test(userAgent),
			        msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
			        mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
			        }
		   },
		escapeHtml : function(str) {
			if (str) {
				//str = str.replace(/&/g, '&amp;');
				str = str.replace(/</g, '&lt;');
				str = str.replace(/>/g, '&gt;');
				str = str.replace(/"/g, '&quot;');
				str = str.replace(/'/g, '&#039;');
			}
			return str;
		},
		unescapeHtml:function(str){
			if (str) {
				//str = str.replace(/&amp;/g, '&');
				str = str.replace(/&lt;/g, '<');
				str = str.replace(/&gt;/g, '>');
				str = str.replace(/&quot;/g, '"');
				str = str.replace(/&#039;/g, '\'');
			}
			return str;
		},
		/**
		 * 初始化方法
		 */
		initPageUI:function(){
			$A.init(this);
		},
		/**
		 * 清除js对象缓存
		 */
		clearAppJsObject:function(){
			$(this).removeAttr("__jsappobj");
			$(this)[0].__jsappobj=null;
		},
		/**
		 * 设置js对象缓存
		 */
		setAppJsObject:function(jsParam,jsobjs){
			$(this).attr("__jsappobj","true");
			$(this)[0].__jsappobj={
				param:jsParam,
				objs:jsobjs
			};
		},
		/**
		 * 取得js对象缓存
		 * @return {Object}带有param和objs属性,param为参数名,objs为js对象数组
		 */
		getAppJsObject:function(){
			var $this=$(this)
			,$parents = $this.parents("[__jsappobj]")
			,jsobj = $this[0].__jsappobj
			,params=null
			,jsobjs=null;
			if(jsobj != null && typeof jsobj=="object" && $.isArray(jsobj.param) && $.isArray(jsobj.objs)){
				params=jsobj.param;
				jsobjs = jsobj.objs;
			}else{
				params=[];
				jsobjs =[];
			}
			$parents.each(function(){
				var $p=$(this)
				,j = this.__jsappobj;
				if(j == null)
					return;
				if(!$.isArray(j.param) || !$.isArray(j.objs))
					return;
				var jp=j.param,jo=j.objs;
				for(var i = 0; i < jp.length; i++){
					if($.inArray(jp[i],params)<0){
						params.push(jp[i]);
						jsobjs.push(jo[i]);
					}
				}
			});
			if(params.length == 0)
				return null;
			return {param:params.join(","),objs:jsobjs};
		},
		/**
		 * 获取带有引入js对象的方法
		 */
		getJsFunction:function(funcstr,target){
			var o = $(this).getAppJsObject();
			if(o){
				var f = new Function(o.param,"return function(){"+funcstr+"};");
				return f.apply(o,o.objs);
			}
			return new Function(funcstr);
		},
		/**
		 * 获取一个元素上的json形式的属性值
		 * add by tw
		 * @param attrName
		 * @returns
		 */
		getJsonAttr:function(attrName){
			var o = $(this).getAppJsObject() || {
				"param":"",
				"objs":[]
			};
			var attrValue = $(this).attr(attrName);
			var id= $(this).attr("id");
			
			
		//	try{
				var f = new Function(o.param,"return ("+attrValue+")");
				//console.log(o.objs);
				var attrValue=f.apply(this,o.objs);
				if (o.objs&&o.objs.length>0&&id){
					var initJsObj=o.objs[0];
					if (initJsObj.uiExtConfig){
						var uiExtConfig=initJsObj.uiExtConfig;
						if (uiExtConfig[id]&&$.isFunction(uiExtConfig[id])){
							attrValue["beforeRender"]=function(config){
									//重置初始化对象
									var confighelper=new ConfigHelper(config);
									uiExtConfig[id].call(this,confighelper);
								
							};
						}
						
					}
					
				}
				//console.log(id);
				//console.log(attrValue)
				return attrValue;
			/*}catch(e){
				alert(attrValue);
					alert(o.param);
				window.alert(e);
				return {};
			}*/
		},
		// 2014-09-24 add function  by sjq
		/**
		 * 
		 * @example  
		 * var funobj=$A.getPageJsFunction("test.add");
		 * if ($.isFunction(funobj)){
		 *     //funobj() or funobj.call() or funobj.apply;
		 * }
		 * 
		 * 获取页面中的js方法
		 * @param funcstr
		 * @param target
		 * @returns
		 *
		 */
		getPageJsProperty:function(funcstr,target){
			var o = $(this).getAppJsObject();
			if(o){
				var f = new Function(o.param,"if (typeof "+funcstr+" !== 'undefined') return "+funcstr+";");
				return f.apply(o,o.objs);
			}
			return null;
		},
		/**
		 * 获取带有引入js对象的方法
		 */
		getJsCacheFunc:function(funcstr,target){
			var $this = $(this)
			,func = $this.data("jsfunction");
			if(func){
				return func;
			}
			func = $this.getJsFunction(funcstr,target);
			$this.data("jsfunction",func);
			return func;
		},
		/**
		 * 获取带有引入js对象的方法
		 */
		getJsEvent:function(events){
			var o = $(this).getAppJsObject();
			if(o){
				var f = new Function(o.param,'var e = '+events+';return e;');
				return f.apply(o,o.objs);
			}
			return $A.jsonEval(events);
		},
		/**
		 * 判断当前元素的是否为指定的标签
		 * @param tn 指定的标签
		 */
		isTag:function(tn) {
			if(!tn) return false;
			return $(this)[0].tagName.toLowerCase() == tn?true:false;
		},
		/**
		 * 鼠标悬浮样式处理
		 * @param className{String}样式名
		 * @param speed 加载速度
		 */
		hoverClass: function(className, speed){
			var _className = className || "hover";
			return this.each(function(){
				var $this = $(this), mouseOutTimer;
				$this.hover(function(){
					if (mouseOutTimer) clearTimeout(mouseOutTimer);
					$this.addClass(_className);
				},function(){
					mouseOutTimer = setTimeout(function(){$this.removeClass(_className);}, speed||10);
				});
			});
		},
		/**
		 * 聚焦样式处理
		 * @param className{String}样式名
		 */
		focusClass: function(className){
			var _className = className || "textInputFocus";
			return this.each(function(){
				$(this).focus(function(){
					$(this).addClass(_className);
				}).blur(function(){
					$(this).removeClass(_className);
				});
			});
		},
		/**
		 * 判断当前元素是否已经绑定某个事件
		 * @param {Object} type
		 */
		isBind:function(type) {
			var _events = $(this).data("events");
			return _events && type && _events[type];
		},
		/**
		 * 取得dom元素的指定数值属性值
		 * @param pre{string} 数值属性一般为left,width等
		 * @param {number} 属性值
		 */
		cssNum:function(pre){
			var cssPre = $(this).css(pre);
			return cssPre.substring(0, cssPre.indexOf("px")) * 1;
		},
		
		/**
		 * 判断两个jquery对象是否相等
		 * @param obj2{jqueryObject} jquery对象
		 */
		equalObject:function(obj){
			var $this = (this);
			if($this.length == 0 && (obj == null||obj.length==0))
				return true;
			if(obj == null)
				return false;
			if($this.length != obj.length)
				return false;
			for(var i = 0; i < obj.length; i++){
				if($this[i] != obj[i])
					return false;
			}
			return true;
		},
		/**
		 * parse options, including standard 'data-options' attribute.
		 * 
		 * calling examples:
		 * parseOptions(target);
		 * parseOptions(target, ['id','title','width',{fit:'boolean',border:'boolean'},{min:'number'}]);
		 */
		parseOptions: function(target, properties){
			var t = $(target);
			var options = {};
			var o = $(target).getAppJsObject() || {
				"param":"",
				"objs":[]
			};
			var s = $.trim(t.attr('data-options'));
			if (s){
				if (s.substring(0, 1) != '{'){
					s = '{' + s + '}';
				}
				//options = (new Function(o.param'return ' + s))();
				
				
				var f = new Function(o.param,"return ("+s+")");
				//console.log(o.objs);
				var options=f.apply(this,o.objs);
			}
			for( key in options){
				if ($.isEmpty(options[key])){
					delete options[key];
				}
			}
			$.map(['width','height','left','top','minWidth','maxWidth','minHeight','maxHeight'], function(p){
				if (!target.style){
					console.log(target);
				}
			
				var pv = $.trim(target.style[p] || '');
				if (pv){
					if (pv.indexOf('%') == -1){
						pv = parseInt(pv) || undefined;
					}
					options[p] = pv;
				}
			});
				
			if (properties){
				var opts = {};
				for(var i=0; i<properties.length; i++){
					var pp = properties[i];
					if (typeof pp == 'string'){
						opts[pp] = t.attr(pp);
					} else {
						for(var name in pp){
							var type = pp[name];
							if (type == 'boolean'){
								opts[name] = t.attr(name) ? (t.attr(name) == 'true') : undefined;
							} else if (type == 'number'){
								opts[name] = t.attr(name)=='0' ? 0 : parseFloat(t.attr(name)) || undefined;
								if(!opts[name]&&options[name]){
									options[name]=parseFloat(options[name]);
								}
							}
						}
					}
				}
				$.extend(options, opts);
			}
            var id= t.attr("id");

            if (o.objs&&o.objs.length>0&&id){
                var initJsObj=o.objs[0];
                if (initJsObj.uiExtConfig){
                    var uiExtConfig=initJsObj.uiExtConfig;
                    if (uiExtConfig[id]&&$.isFunction(uiExtConfig[id])){
                        options["beforeRender"]=function(config){
                            //重置初始化对象
                            var confighelper=new ConfigHelper(config);
                            uiExtConfig[id].call(this,confighelper);
                        };
                    }

                }

            }
			return options;
		},
		
		/**
	 * extend plugin to set box model width
	 */
	_outerWidth : function(width){
		if (width == undefined){
			if (this[0] == window){
				return this.width() || document.body.clientWidth;
			}
			return this.outerWidth()||0;
		}
		return this._size('width', width);
	},
	
	/**
	 * extend plugin to set box model height
	 */
	_outerHeight : function(height){
		if (height == undefined){
			if (this[0] == window){
				return this.height() || document.body.clientHeight;
			}
			return this.outerHeight()||0;
		}
		return this._size('height', height);
	},
	
	_scrollLeft : function(left){
		if (left == undefined){
			return this.scrollLeft();
		} else {
			return this.each(function(){$(this).scrollLeft(left)});
		}
	},
	parseValue:function (property, value, parent, delta){
		delta = delta || 0;
		var v = $.trim(String(value||''));
		var endchar = v.substr(v.length-1, 1);
		if (endchar == '%'){
			v = parseInt(v.substr(0, v.length-1));
			if (property.toLowerCase().indexOf('width') >= 0){
				v = Math.floor((parent.width()-delta) * v / 100.0);
			} else {
				v = Math.floor((parent.height()-delta) * v / 100.0);
			}
		} else {
			v = parseInt(v) || undefined;
		}
		return v;
	},
	_size : function(options, parent){
		var _slef=this;
		if (typeof options == 'string'){
			if (options == 'clear'){
				return this.each(function(){
					$(this).css({width:'',minWidth:'',maxWidth:'',height:'',minHeight:'',maxHeight:''});
				});
			} else if (options == 'unfit'){
				return this.each(function(){
					_fit(this, $(this).parent(), false);
				});
			} else {
				if (parent == undefined){
					return _css(this[0], options);
				} else {
					return this.each(function(){
						_css(this, options, parent);
					});
				}
			}
		} else {
			return this.each(function(){
				parent = parent || $(this).parent();
				$.extend(options, _fit(this, parent, options.fit)||{});
				var r1 = _setSize(this, 'width', parent, options);
				var r2 = _setSize(this, 'height', parent, options);
				if (r1 || r2){
					$(this).addClass('app-fluid');
				} else {
					$(this).removeClass('app-fluid');
				}
			});
		}
		
		function _fit(target, parent, fit){
			var t = $(target)[0];
			var p = parent[0];
			var fcount = p.fcount || 0;
			if (fit){
				if (!t.fitted){
					t.fitted = true;
					p.fcount = fcount + 1;
					$(p).addClass('panel-noscroll');
					if (p.tagName == 'BODY'){
						$('html').addClass('panel-fit');
					}
				}
				return {
					width: ($(p).width()||1),
					height: ($(p).height()||1)
				};
			} else {
				if (t.fitted){
					t.fitted = false;
					p.fcount = fcount - 1;
					if (p.fcount == 0){
						$(p).removeClass('panel-noscroll');
						if (p.tagName == 'BODY'){
							$('html').removeClass('panel-fit');
						}
					}
				}
				return false;
			}
		}
		
		function _setSize(target, property, parent, options){
			var t = $(target);
			var p = property;
			var p1 = p.substr(0,1).toUpperCase() + p.substr(1);
			var min = _slef.parseValue('min'+p1, options['min'+p1], parent);// || 0;
			var max = _slef.parseValue('max'+p1, options['max'+p1], parent);// || 99999;
			var val = _slef.parseValue(p, options[p], parent);
			var fluid = (String(options[p]||'').indexOf('%') >= 0 ? true : false);
			if (!isNaN(val)){
				var v = Math.min(Math.max(val, min||0), max||99999);
				if (!fluid){
					options[p] = v;
				}
				t._size('min'+p1, '');
				t._size('max'+p1, '');
				t._size(p, v);
			} else {
				t._size(p, '');
				t._size('min'+p1, min);
				t._size('max'+p1, max);
			}
			return fluid || options.fit;
		}
		function _css(target, property, value){
			var t = $(target);
			if (value == undefined){
				value = parseInt(target.style[property]);
				if (isNaN(value)){return undefined;}
				if ($._boxModel){
					value += getDeltaSize();
				}
				return value;
			} else if (value === ''){
				t.css(property, '');
			} else {
				if ($._boxModel){
					value -= getDeltaSize();
					if (value < 0){value = 0;}
				}
				t.css(property, value+'px');
			}
			function getDeltaSize(){
				if (property.toLowerCase().indexOf('width') >= 0){
					return t.outerWidth() - t.width();
				} else {
					return t.outerHeight() - t.height();
				}
			}
		}
	}
	});
	
	
	
	/**
	 * 扩展String方法
	 */
	$.extend(String.prototype, {
		/**
		 * 字符串是否为正整数
		 */
		isPositiveInteger:function(){
			return (new RegExp(/^[1-9]\d*$/).test(this));
		},
		/**
		 * 字符串是否为整数
		 */
		isInteger:function(){
			return (new RegExp(/^\d+$/).test(this));
		},
		/**
		 * 字符串是否为数值型
		 */
		isNumber: function(value, element) {
			return (new RegExp(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/).test(this));
		},
		/**
		 * 去字符串的前后空格
		 */
		trim:function(){
			return this.replace(/(^\s*)|(\s*$)|\r|\n/g, "");
		},
		/**
		 * 当前字符串进行转码
		 */
		trans:function() {
			return this.replace(/&lt;/g, '<').replace(/&gt;/g,'>').replace(/&quot;/g, '"');
		},
		/**
		 * 全部替换字符串
		 * @param os 需要替换字符串正则表达式
		 * @param ns 替换的字符串
		 * @return 替换结果
		 */
		replaceAll:function(os, ns) {
			return this.replace(new RegExp(os,"gm"),ns);
		},
		/**
		 * 模板替换
		 * @param $data 上下文书局
		 * @return 替换结果串
		 */
		evalTm:function($data) {
			if (!$data) return this;
			return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_{\\\\\\.}]*})","g"), function($1){
				var v = $data[$1.replace(/[{}]+/g, "")];
				return v?v:$1;
			});
		},
		/**
		 * 通过指定元素内容里包含的元素id为上下文的变量名，元素值为变量值进行模板替换
		 * @param _box 模板替换的范围
		 * @return 替换结果
		 */
		evalTmById:function(_box) {
			var $parent = _box || $(document);
			return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_{\\\\\\.}]*})","g"), function($1){
				var $input = $parent.find("#"+$1.replace(/[{}]+/g, ""));
				return $input.size() > 0 ? $input.val() : $1;
			});
		},
		/**
		 * 通过指定元素内容里包含的元素id为上下文的变量名，元素值为变量值进行模板替换
		 * @param _box 模板替换的范围
		 * @return 替换结果
		 */
		evalTmByAttr:function(t) {
			if(!t)
				return this.toString();
			var $t =$(t);
			return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_{\\\\\\.}]*})","g"), function($1){
				var attr= $1.replace(/[{}]+/g, "");
				var v = attr=='text'?$t.text():(attr=='value'|| attr=='val')?$t.val()||$t.attr(attr):$t.attr(attr);
				return v || $1;
			});
		},
		/**
		 * 转换模板串
		 */
		evalTemplate:function(el){
			if(this.isFinishedTm())
				return this.toString();
			var $el = $(el)
			,box = $el.attr("evalTarget")||el||document
			,$box=$(box);
			var val = this.evalTmById($box);
			val = this.evalTmByAttr($el.attr("evalTarget")||el);
			if (!val.isFinishedTm() && $el.attr("eval-warn")) {
				$A.messager.error($el.attr("eval-warn"));
				return false;
			}
			return val;
		},
		/**
		 * 模板替换是否完成
		 * @return 布尔值
		 */
		isFinishedTm:function(){
			return !(new RegExp("{[A-Za-z_]+[A-Za-z0-9_]*}").test(this)); 
		},
		/**
		 * 去掉字符串前面指定的字母
		 */
		skipChar:function(ch) {
			if (!this || this.length===0) {return '';}
			if (this.charAt(0)===ch) {return this.substring(1).skipChar(ch);}
			return this;
		},
		/**
		 * 判断是否为合格的密码串
		 */
		isValidPwd:function() {
			return (new RegExp(/^([_]|[a-zA-Z0-9]){6,32}$/).test(this)); 
		},
		/**
		 * 判断是否为邮件地址串
		 */
		isValidMail:function(){
			return(new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/).test(this.trim()));
		},
		/**
		 * 判断当前串是否为空串
		 */
		isSpaces:function() {
			for(var i=0; i<this.length; i+=1) {
				var ch = this.charAt(i);
				if (ch!=' '&& ch!="\n" && ch!="\t" && ch!="\r") {return false;}
			}
			return true;
		},
		/**
		 * 是否为电话号码
		 */
		isPhone:function() {
			return (new RegExp(/(^([0-9]{3,4}[-])?\d{3,8}(-\d{1,6})?$)|(^\([0-9]{3,4}\)\d{3,8}(\(\d{1,6}\))?$)|(^\d{3,8}$)/).test(this));
		},
		/**
		 * 是否为url地址
		 */
		isUrl:function(){
			return (new RegExp(/^[a-zA-z]+:\/\/([a-zA-Z0-9\-\.]+)([-\w .\/?%&=:]*)$/).test(this));
		},
		/**
		 * 判断是否为外部地址
		 */
		isExternalUrl:function(){
			return this.isUrl() && this.indexOf("://"+document.domain) == -1;
		},
		/**
		 * 获取汉字拼音首字母串
		 * @return {String}拼音首字母串
		 */
		toInitials:function() {
			return $pinyin.toInitials(this);
		},
		/**
		 * 获取汉字拼音大写首字母串
		 * @return {String}大写的拼音首字母串
		 */
		toUpperInitials:function() {
			return $pinyin.toUpperInitials(this);
		},
		
		/**
		 * 获取汉字拼音串
		 * @param ch{String}拼音字符串
		 * @return {String}汉字拼音串
		 */
		toPinyin:function() {
			return $pinyin.toPinyin(this);
		},
		
		/**
		 * 获取汉字首字母大写的拼音串
		 * @return {String}首字母大写的拼音串
		 */
		toCapPinyin:function() {
			return $pinyin.toCapPinyin(this);
		}
		
	});
	return $;
});