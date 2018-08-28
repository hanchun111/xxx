/**
 * 控件基础类
 * @class bs.plugin.XObject
 */
define(['app/core/app-base', 'bs-plugin/Env'],function(Base, Env){
	var XObject = Base.extend({
		/**
		 * @property {String} name 控件名
		 */
		name : null,
		/**
		 * @property {String} clsid CLSID
		 */
		clsid : null,
		/**
		 * @property {String} xPath 控件的主目录(相对JS库文件)
		 */
		xPath : '/resources/bsnetfun/',
		/**
		 * @property {String} codebase 在线安装文件的目录和文件名(相对xPath)
		 */
		codebase : null,
		/**
		 * @property {String} exebase 可执行文件的目录和文件名(相对xPath)
		 */
		exebase : null,
		/**
		 * @property {String} version 版本号
		 */
		version : null,
		/**
		 * @property {String|HTMLElement} renderTo 渲染的容器
		 */
		renderTo : null,
		/**
		 * @property {String} checker 测试控件是否正确，一般用控件的方法或属性来测试
		 */
		checker : null,
		/**
		 * @property {Array} functions 控件的方法集合
		 */
		functions : null,
		//private
		container : null,
		//private
		ctl : null,
		width: 0,
		height: 0,
		//private
		rendered : false,
		initialize : function(cfg){
			XObject.superclass.initialize.apply(this, arguments);
			this.construct();
			if (this.checker == null) {
				var fs = this.functions || [];
				if (fs.length >= 1) {
					this.checker = fs[0];
				}
			}
			cfg = cfg || {};
			if (cfg.renderTo) {
				this.render(cfg.renderTo);
			}
		},
		/**
		 * 检测控件是否准备就绪
		 *  1.浏览器是否支持
		 *  2.控件是否已安装
		 *  3.控件是否已加载
		 * @private
		 */
		ready : function(){
		},
		/**
		 * 测试控件状态
		 * @param ct {HTMLElement} 容器
		 * @param cu {Boolean} 是否检测更新
		 * @private
		 */
		test : function(ct, cu){
			var d, ret = XObject.READY;
	
			if (this.checker === null) {
				throw new Error('XObject : checker is empty.');
			}
	
			if (this.ctl === null) {
				try {
					ct = ct || document.body;
					d = document.createElement('div');
					d.style.height='100%';
					d.style.width='100%'
					ct.appendChild(d);
					d.innerHTML = this.getHtml();
					this.ctl = d.firstChild;
					this.container = d;
					this.rendered = true;
				} catch(e) {
					this.destory();
				}
			}
	
			if (this.ctl) {
				var s = typeof(this.ctl[this.checker]);
				if (s != 'undefined') {
					if (cu && this.checkUpdate()) {
						ret = XObject.OUTDATED;
						this.destory();
					} else {
						ret = XObject.READY;
					}
				} else {
					ret = XObject.UNREADY;
					this.destory();
				}
			}
			return ret;
		},
		//private
		construct : function(){
			var fs = this.functions || [];
			for (var i = 0; i < fs.length; i++) {
				var fn = new String(fs[i]);
				//如果当前对象中有定义同名方法，不覆盖
				if(this[fn] != undefined) continue;
				this[fn] = function(f){
					return function(){
						if (!this.ready()) return;
						if (typeof(this.ctl[f]) != undefined) {
							var args = Array.prototype.slice.call(arguments),
							    buffer = [];
							buffer.push('this.ctl.');
							buffer.push(f);
							buffer.push('(');
							for (var j = 0; j < args.length; j++) {
								buffer.push('args[' + j + ']');
								if (j < args.length - 1) {
									buffer.push(',');
								}
							}
							buffer.push(');');
							return eval(buffer.join(''));
						}
					}
				}(fn);
			}
		},
		/**
		 * 生成控件的HTML片段
		 * @return {String} <object>标签代码
		 * @private
		 */
		getHtml : function(){
			var buffer = [];
			buffer.push('<object');
			buffer.push(' width="'+this.width+'"');
			buffer.push(' height="'+this.height+'"');
			if (Env.isIE){
				buffer.push(' classid="clsid:' + this.clsid + '"');
			}else{
				buffer.push(' type="'+this.chromeClsId+'"')
			}
			buffer.push(' codebase="' + this.codebase + '"');;
			buffer.push('></object>');
			return buffer.join('');
		}, 
		/**
		 * 渲染控件到指定的容器
		 * @param {String|HTMLElement} ct 容器
		 */
		render : function(ct){
			if (!this.rendered) {
				if (typeof(ct) === 'string') {
					ct = document.getElementById(ct);
				}
				if (this.test(ct, true)) {
					this.ctl.width = this.width;
					this.ctl.height = this.height;
				}
			}
		},
		/**
		 * 销毁控件，移除控件所在的HTML节点
		 */
		destory : function(){
			var c = this.container;
			if (c && c.parentNode) {
				c.parentNode.removeChild(c);
			}
			this.contaniner = null;
			this.ctl = null;
			this.rendered = false;
		},
		/**
		 * 获取/设置属性，由于对控件封装后不能直接生成对应属性，因此控件的属性需要用方法来获取
		 * @param {String} p 属性名
		 * @param {String} v 属性值
		 */
		prop : function(p, v){
			if (!this.ready()) return;
			var r = undefined;
			try {
				if (v !== undefined) {
					this.ctl[p] = v;
				} else {
					r = this.ctl[p];
				}
			} catch (e) {
				r = undefined;
			}
			if (v === undefined) {
				return r;
			}
		},
		/**
		 * 获取当前已安装控件的版本号
		 * @return {String} 当前安装控件的版本号
		 * @private
		 */
		getInstalledVersion : function(){
			var version = null;
			if (this.ctl) {
				if (typeof(this.ctl.Version) != 'undefined') {
					version = this.ctl.Version;
				}
			}
			return version;
		},
		/**
		 * 检测控件是否有更新
		 * @return {Boolean} 更新标识
		 * @private
		 */
		checkUpdate : function(){
			var r = false 
				,v1 = this.getInstalledVersion()
				,v2;
			if (v1 !== null && v1 !== undefined) {
				v2 = new String(this.version);
				v1 = parseInt(v1.replace(/[,\.\s]/g, ''), 10);
				v2 = parseInt(v2.replace(/[,\.\s]/g, ''), 10);
				r = v2 > v1;
			}
			return r;
		},
		/**
		 * 获取cab包路径
		 */
		getCabPath: function(){
			return [Env.getPath(), this.xPath, this.codebase, '#version=' + this.version].join('');
		},
		/**
		 * 获取exe包路径
		 */
		getExePath: function(){
			return  [Env.getPath(), this.xPath, this.exebase].join('');
		}
	});
	/**
	 * 文本：控件对象未初始成功
	 * @property PLUGIN_UNREADY
	 * @type {String}
	 */
	XObject.PLUGIN_UNREADY=  '控件对象未初始成功.';
	/**
	 * 控件对象未初始成功
	 * @property UNREADY
	 * @type {Number}
	 */
	XObject.UNREADY= -1;
	/**
	 * 控件对象过期(可更新)
	 * @property OUTDATED
	 * @type {Number}
	 */
	XObject.OUTDATED=  -2;
	/**
	 * 控件准备就绪
	 * @property READY
	 * @type {Number}
	 */
	XObject.READY= 1;
	XObject.SUCCESS=1
	XObject.FAILURE=-1
	XObject.IS_IE = (navigator.userAgent.toLowerCase().indexOf('msie')>0)? true : false;
	return XObject;
});