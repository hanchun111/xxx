/**
 * 预输入控件--继承Combo
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/core/app-options', 'app/data/app-ajax',
        'app/widgets/form/app-combo'], function($, App, Options, AppAjax, Combo) {
	
	'use strict';
	/**
	 * @class 
	 * @classdesc 预输入框
	 * <span class="type-signature static">extend</span>combo
	 * @see {@link combo-class} typeahead继承至combo
	 * @name typeahead-class
	 * @desc 预输入框的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @example &lt;input &#9;class="app-typeahead"
	 * &#9;_options="{
	 * &#9;&#9;suggest: 'html/example/app-input/data/typeahead.do'
	 * &#9;}"
	 * />
	 * @example $('#demo').typeahead({
	 * &#9;suggest: 'html/example/app-input/data/typeahead.do'
	 * });
	 */
	var Typeahead = Combo.extend({
		initialize: function (input, options) {
			if(!options){
				options = {};
			}
			options._ = Options.appDefaults.Typeahead;
			Typeahead.superclass.initialize.call(this, input, options);
			this._init();
		},
		/**
		 * 初始化
		 */
		_init: function(){
			this._editable();
			this._initOptions();
			this._initPanelContent();
			this._registEvents();
			if(this.setting.value){
				this.setText(this.setting.value);
			}
		},
		/**
		 * 初始化设置
		 */
		_initOptions: function(){
			var s = this.setting;
			//如果没有设置suggest地址，则使用url
			if((s.suggest == '' || s.suggest == true)
					&& s.url){
				s.suggest = s.url;
			}
			if(s.suggest == false){
				s.suggest = '';
			}
			//远程加载，可以是remote 或 async
			if(!s.remote && s.async){
				s.remote = true; 
			}
		},
		/**
		 * 初始化下拉面板的内容
		 */
		_initPanelContent: function(){
			var $list = $('<ul class="combo-list"></ul>');
			$list.appendTo(this.$dropPanelMain);
			this.$list = $list;
		},
		/**
		 * 注册事件
		 */
		_registEvents: function(){
			var typeahead = this;
			this.$openBtn.on('click.typeahead.api',function(e){
				typeahead.$text.focus();
			});
			this.$text.on('change.typeahead.api',function(){
				typeahead.setValue(this.value);
			});
			this._liveItemClickEvent();
		},
		/**
		 * 绑定点击事件
		 */
		_liveItemClickEvent: function(){
			var typeahead = this;
			/**
			 * Li选择项点击事件
			 * 1、如果存在自定义点击前事件，先执行该事件，如果不返回true则结束选择，否则执行2
			 * 2、单选则设值当前选择项为值，并关闭下拉框；多选则追加当前选择项为值
			 * 3、如果存在自定义点击后事件，则执行该事件
			 */
			this.$list.on('click.typeahead.api', 'li', function(){
				var $this = $(this);
				typeahead.setValue($this.text());
				typeahead.hidePanel();
				typeahead.$text.focus();
			});
		},
		/**
		 * 按键事件
		 * 1、联想
		 * 2、导航
		 */
		_keyManager: function(e){
			if(this._dealSysKey(e)){
				return;
			}
			if(this._mainDivIsVisiable()){
				keyForVisiblePanel.call(this, e);
			}else{
				keyForHiddenPanel.call(this, e);
			}
		},
		/**
		 * 根据输入内容进行延迟联想
		 */
		suggest: function(){
			var typeahead = this;
			//保持延迟时间内只触发一次联想操作
			clearTimeout(typeahead.timeout);
			typeahead.timeout = 
				setTimeout(function(){
					typeahead._suggestFunc();
				},typeahead.setting.lazy);
		},
		/**
		 * 根据输入框的文本进行联想
		 * 1、保持联想面板打开状态
		 */
		_suggestFunc: function(){
			//如果联想面板不是打开状态，则打开渲染。否则只进行联想
			if(!this._mainDivIsVisiable()){
				this.showPanel();
			}
			if(this._preventSuggest()){
				return;
			}
			if(this.setting.remote){
				this._suggestByRemote();
			}else{
				this._suggestByLocal();
			}
		},
		/**
		 * 阻止联想事件
		 * 1、当联想的关键字为空
		 * 2、当联想的关键字与上次联想的相同
		 * 3、当上次联想为空 且这次的关键字以上次的关键字开头
		 * @returns true 进行阻止
		 */
		_preventSuggest: function(){
			var key = this.getText();
			if(!$.trim(key)){
				return true;
			}
			if(!this.prevKey){
				
			}else if(this.prevKey == key){
				return true;
			}else if((this.suggestItems == undefined || this.suggestItems.length == 0)
					&& key.length >= this.prevKey.length
					&& key.indexOf(this.prevKey) == 0){
				return true;
			}
			this.prevKey = key;
			return false;
		},
		/**
		 * 根据本地数据源进行匹配
		 */
		_suggestByLocal: function(){
			this._initDataByParameter();
			if(this.setting.data != undefined){
				this._setSuggestItemsByNameLazy();
				this._renderSuggestItem();
				this.showPanel();
			}else{
				var url = this.setting.suggest
					,typeahead = this;
				if(url){
					AppAjax.ajaxCall({
						url: url,
						data: this.getParameter(),
						dataType: 'json',
						type: 'POST',
						success: function(data){
							typeahead.setting.data = data;
							typeahead._suggestByLocal();
						}
					});	
				}
			}
		},
		/**
		 * 根据查询参数重置预输入的数据源
		 */
		_initDataByParameter: function(){
			var currParam = this.getParameter();
			if(currParam){
				if(this.lastParam != currParam){
					this.setting.data = undefined;
				}
				this.lastParam = currParam;
			}
		},
		/**
		 * 根据远程设置地址进行联想
		 */
		_suggestByRemote: function(){
			var url = this.setting.suggest
				,typeahead = this;
			if(url){
				if(url.indexOf('?') != -1){
					url += '&_key=' + this.getText();
				}else{
					url += '?_key=' + this.getText();
				}
				AppAjax.ajaxCall({
					url: url,
					data: this.getParameter(),
					dataType: 'json',
					type: 'POST',
					success: function(data){
						typeahead.suggestItems = data;
						typeahead._renderSuggestItem();
					}
				});	
			}
		},
		/**
		 * 根据数据源按照key模糊匹配节点，并设置联想项
		 * @param data 节点数据源数组
		 * @param key 匹配关键字
		 */
		_setSuggestItemsByNameLazy: function(){
			var data = this.setting.data
				,key = this.getText()
				,result = [];
			for(var i = 0; i<data.length; i++){
				var text = data[i];
				if(text.indexOf(key) != -1)
					result.push(text);
			}
			this.suggestItems = result;
		},
		/**
		 * 渲染联想项列表
		 */
		_renderSuggestItem: function(){
			var data = this.suggestItems
				,key = this.getText()
				,items = [];
			this.$list.html('');
			if(!data) return;
			for ( var i = 0; i < data.length; i++) {
				items.push(this._createSuggestItems(i, data[i], key));
			}
			this.$list.append(items);
			
		},
		/**
		 * 追加联想项
		 * @param index 当前联想项的index
		 * @param item 联想数据
		 */
		_createSuggestItems: function(i, text, key){
			var $suggestItem = $('<li ' + (i%2 == 1 ? 'class="li-odd"' : '') +
					'><i class="icon-ok"></i>' + 
					this._getName(text, key) + '</li>');
			return $suggestItem;
		},
		/**
		 * 获取显示名称
		 * @param name
		 * @param key
		 * @returns {String}
		 */
		_getName: function(name, key){
			if(key == ''){
				return name;
			}
			var index = name.indexOf(key);
			if(index == -1){
				return name;
			}
			var keyLen = key.length;
			return name.substring(0,index) +
				'<em>'+key+'</em>' +
				name.substring(keyLen + index);
		},
		/**
		 * 显示当前对象的联想面板
		 * 1、关闭其他可见的联想面板
		 * 2、根据隐藏值进行渲染选择项
		 * 3、开启点击html关闭该面板的操作
		 */
		showPanel: function(){
			this._showPanel();
		},
		/**
		 * 载入联想数据源
		 * @param {Array} data 联想的数据源
		 * @todo 根据数据渲染下拉面板的内容
		 * @todo 设置联想为本地联想
		 * @example $('#demo').typeahead('loadData',['选项1','选项2','选项3']);
		 * @memberof typeahead-class
		 * @instance
		 */
		loadData: function(data){
			this.setting.data = data;
			this.setting.remote = false; 
		},
		/**
		 * 根据url载入数据源作为联想的数据源
		 * @param {url} url 要加载的url
		 * @todo 根据数据渲染下拉面板的内容
		 * @todo 设置联想为本地联想
		 * @example $('#demo').typeahead('reload','a.do');
		 * @memberof typeahead-class
		 * @instance
		 */
		reload: function(url){
			if(url){
				var suggest = this;
				AppAjax.ajaxCall({
					url: url,
					data: this.getParameter(),
					dataType: 'json',
					type: 'POST',
					success: function(data){
						suggest.data = data;
					}
				});	
			}
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 设置隐藏值，尝试设置显示值
		 * @param {String} val 隐藏值
		 * @see typeahead#setValue
		 * @todo 当隐藏值为空时，显示值也为空
		 * @example $('#demo').typeahead('setValue','val');
		 * @memberof typeahead-class
		 * @instance
		 */
		setValue: function(val, noTrigger){
			this.setText(val);
			this._setValue(val, noTrigger);
		}
	});
	$.fn.typeahead = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'typeahead';
		this.each(function () {
			var $this = $(this);
			if(!$this.is('input')){
				return true;
			}
			var component = App.getComponent($this, componentName);
			if(typeof option === 'string'){
				try{
					var methodArgs = Array.prototype.slice.call(args, 1);
					methodReturn = App.componentMethodApply(component, option, methodArgs);
				}catch(e){
					App.throwCompMethodError($this, componentName, option, e);
				}
			}else{
				if(!component){
					component = new Typeahead(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};
	/**
	 * 面板可见状态下的按键事件处理
	 */
	function keyForVisiblePanel(e){
		var keyCode = e.keyCode
			,s = this.setting;
		e.stopPropagation();
		if(App.containKeyCode(e, s.keyNextNode)){
			keyNextNode.call(this, e);
		}else if(App.containKeyCode(e, s.keyPrevNode)){
			keyPrevNode.call(this, e);
		}else if(App.containKeyCode(e, s.keyPickNode)){
			keyPickNode.call(this, e);
		}else if(App.containKeyCode(e, s.keyHidePanel)){
			this._keyHidePanel(e);
		}else if(this._keyFilterSuggest(e)){
			this.suggest();
		}
	}
	/**
	 * 面板不可见状态下的按键事件处理
	 */
	function keyForHiddenPanel(e){
		var keyCode = e.keyCode;
		if(this._isKeyCursorPos(keyCode)){
			this._keyCursorPos(e);
		}else if(this._keyFilterSuggest(e)){
			this.suggest();
		}
	}
	/**
	 * 上一个节点
	 */
	function keyPrevNode(e){
		var $l = this.$list;
		if($l.find('>li').length == 0){
			return;
		}
		var $c = $l.find('.current')
			,$n = $c.prev();
		if($n.length == 0){
			$n = $l.find('li:last-child');
		}
		this.setValue($n.text());
		$c.removeClass('current');
		$n.addClass('current');
	}
	/**
	 * 下一个节点
	 */
	function keyNextNode(e){
		var $l = this.$list;
		if($l.find('>li').length == 0){
			return;
		}
		var $c = $l.find('.current')
			,$n = $c.next();
		if($n.length == 0){
			$n = $l.find('li:first-child');
		}
		this.setValue($n.text());
		$c.removeClass('current');
		$n.addClass('current');
	}
	/**
	 * 选中节点
	 */
	function keyPickNode(e){
		var $c = this.$dropPanel.find('.current');
		if($c.length == 0){
			return;
		}
		this.setValue($c.text());
		this.hidePanel();
		e.stopPropagation();
	}
	return Typeahead;
});