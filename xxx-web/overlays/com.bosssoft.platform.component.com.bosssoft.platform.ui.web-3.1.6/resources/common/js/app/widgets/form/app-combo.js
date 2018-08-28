/**
 * 下拉面板控件--继承Textbox
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/core/app-options',
        'app/data/app-ajax', 'app/widgets/form/app-textbox', 'app/widgets/drag/app-droppanel'], 
        function($, App, Options, AppAjax, Textbox, Expandable) {
	
	'use strict';
	
	/**
	 * @class 
	 * @classdesc 下拉面板
	 * <span class="type-signature static">extend</span>textbox
	 * @name combo-class
	 * @desc 下拉面板的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @see {@link textbox-class} combo继承至textbox
	 * @see {@link typeahead-class} 继承该组件
	 * @see {@link suggest-class} 继承该组件
	 * @see {@link combobox-class} 继承该组件
	 * @see {@link comboztree-class} 继承该组件
	 * @see {@link combogrid-class} 继承该组件
	 */
	var Combo = Textbox.extend({
		Implements: Expandable,
		initialize: function(input, options){
			if(!options){
				options = {};
			}
			options._ = $.extend({}, Options.appDefaults.Combo, options._); 
			Combo.superclass.initialize.call(this, input, options);
			this._comboInit();
			this._comboEventRegister();
		},
		/**
		 * 初始化
		 */
		_comboInit: function(){
			if(this.setting.rowHeight){
				this._rowHeight = this.setting.rowHeight;
			}
			this._editable(false);
			this._initDropPanel();
			this.$dropPanel.data('context', this);
			if(this.setting.selectednode){
				this.setSelectedNode(this.setting.selectednode);
			}
			this._onPanelResize();
			this._onPanelFadeOut();
		},
		/**
		 * 事件注册器
		 */
		_comboEventRegister: function(){
			var s = this.setting;
			if(s.afterDataRender){
				this.on('afterDataRender', s.afterDataRender);
			}
			if(s.beforeLoad){
				this.on('beforeLoad', s.beforeLoad);
			}
			if(s.beforeShowPanel){
				this.on('beforeShowPanel', s.beforeShowPanel);
			}
			if(s.onHidePanel){
				this.on('onHidePanel', s.onHidePanel);
			}
			if(s.onShowPanel){
				this.on('onShowPanel', s.onShowPanel);
			}
		},
		/**
		 * 覆盖父类的绑定方法
		 */
		_textChangeEvent: function(){},
		/**
		 * 初始化下拉面板
		 */
		_initDropPanel: function(){
			var s = this.setting;
			var $dropPanel = $('<div class="drop-panel">' +
								'<div class="drop-panel-main">' +
									'<div class="drop-panel-loading">正在努力加载中...</div>' + 
									'<div class="drop-panel-empty">无符合条件的记录。</div>' + 
								'</div>' + 
								'<div class="drop-panel-custom"></div>' + 
							'</div>');
			$dropPanel.appendTo($.$appPanelContainer);
			this.$dropPanel = $dropPanel;
			this.$dropPanelMain = $dropPanel.find('.drop-panel-main');
			this.$dropPanelCustom = $dropPanel.find('.drop-panel-custom');
			this.$dropPanelLoading = $dropPanel.find('.drop-panel-loading');
			this.$dropPanelEmpty = $dropPanel.find('.drop-panel-empty');
			this.$dropPanelMain.on('mousewheel.combo.api', $.proxy($dropPanelMainOnMouseWheel, this))
			this.$dropPanelMain.on('scroll.combo.api', $.proxy($dropPanelMainScroll, this));
		},
		/**
		 * 显示或隐藏下拉面板，该方法已绑定在组件的右边按钮中
		 * @todo 判断当前面板是否可见：
		 * @todo 1如果不可见，则打开面板
		 * @todo 2如果可见，则关闭面板
		 * @example $('#demo').combo('togglePanel');
		 * @memberof combo-class
		 * @instance
		 */
		togglePanel: function(){
			if(this._mainDivIsVisiable()){
				this.hidePanel();
			}else{
				this._showPanel();
			}
		},
		/**
		 * 显示当前对象的下拉面板
		 * 		1、显示前先关闭其他所有打开的下拉面板面板
		 * 		2、开启mousedown.droppanel.api事件，点击html代理关闭该面板的操作
		 * @param callback
		 */
		_showPanel: function(callback){
			initDropPanel.call(this);
			/**
			 * 面板展示前事件，返回false不显示面板
			 * @event combo-class#beforeShowPanel
			 */
			if(this.trigger('beforeShowPanel') === false){
				return;
			}
			this._closeVisiblePanel();
			this.$dropPanel.show();
			this.place();
			if($.isFunction(callback)){
				callback.call(this);
			}
			/**
			 * 面板展示事件
			 * @event combo-class#onShowPanel
			 */
			this.trigger('onShowPanel');
		},
		/**
		 * 设置下拉框的位置
		 */
		place: function(){
			var mainCss = {
					top: this._getDropPanelTop(),
					left: this._getDropPanelLeft(),
					'z-index': Options.zindexs.droppanel++
				};
			this.$dropPanel.css(mainCss);
			$(document).on('mousedown.droppanel.api', $.proxy(this.hidePanel,this));
		},
		/**
		 * 关闭组件对象的下拉面板
		 * @todo 关闭当前下拉面板
		 * @todo 关闭点击html代理的click.combo.api的事件
		 * @example $('#demo').combo('hidePanel');
		 * @memberof combo-class
		 * @instance
		 */
		hidePanel: function(){
			var fireHideEvent = this._mainDivIsVisiable();
			this.$dropPanel.hide();
			if(!$.$appPanelContainer.find('.drop-panel,.datetimepicker').is(':visible')){
				$(document).off('mousedown.droppanel.api');
			}
			if(fireHideEvent){
				/**
				 * 面板关闭事件
				 * @event combo-class#onHidePanel
				 */
				this.trigger('onHidePanel');
			}
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 将焦点聚焦到组件
		 * @memberof combo-class
		 * @instance
		 */
		focus: function(){
			this.$text.focus();
		},
		/**
		 * 是否阻止联想组件的行为
		 * @param flag true为阻止
		 */
		_stopSuggest: function(flag){
			var suggest = this.$element.data('suggest');
			if(suggest){
				suggest.stopKeyEvent = flag;
			}
		},
		/**
		 * 是否为联想框来控制按键操作
		 */
		_isSuggestContext: function(){
			var context = this
				,suggest = this._suggest;
			if(suggest){
				suggest.stopKeyEvent = false;
				if(suggest._mainDivIsVisiable()){
					setTimeout(function(){
						if(suggest.getText() == ''){//联想时 关键字为空 则切换到主控件的下拉面板
							suggest.stopKeyEvent = true;
							context.showPanel();
						}
					},10);
					return true;
				}
			}
			return false;
		},
		/**
		 * 要进行联想的按键
		 * true进行联想
		 */
		_keyFilterSuggest: function(e){
			var keyCode = e.keyCode
				,result = false;
			if(keyCode >= 48 && keyCode <= 90){//0-1 a-z A-Z
				result = true;
			}else if(keyCode >= 96 && keyCode <= 105){//小键盘数字
				result = true;
			}else{
				//299 拼音输入法特殊按键
				var keys = [App.keyCode.BACKSPACE, App.keyCode.ENTER, App.keyCode.DELETE, 229];
				result = $.inArray(keyCode, keys) > -1;
			}
			return result;
		},
		/**
		 * 按键显示面板
		 */
		_keyShowPanel: function(e){
			var keyCode = e.keyCode
				,s = this.setting;
			if(!this._mainDivIsVisiable()){
				this.showPanel();
				e.preventDefault();
				e.stopPropagation();
			}
		},
		/**
		 * 隐藏面板
		 */
		_keyHidePanel: function(e){
			e.preventDefault();
			this._stopSuggest(true);
			if(this._mainDivIsVisiable()){
				this.hidePanel();
			}
		},
		/**
		 * 根据输入内容进行延迟联想
		 */
		suggest: function(){
			var suggest = this._suggest;
			if(suggest){
				setTimeout(function(){
					if(suggest && suggest.getText() != ''){
						suggest.suggest();
					}
				},10);
			}
		},
		/**
		 * 根据隐藏值检索显示值
		 * @param value 隐藏值
		 * @returns 名称
		 */
		_findTextByValue: function(value){
			if(value === undefined || value === ''){
				return '';
			}
			var result = undefined
				,data = this.setting.data
				,textField = this.setting.textfield
				,valueField = this.setting.valuefield;
			for ( var i = 0; i < data.length; i++) {
				if(data[i][valueField] == value){
					result = data[i][textField];
					break;
				}
			}
			return result;
		},
		/**
		 * 加载数据前事件
		 */
		_onBeforeLoad: function(){
			/**
			 * 加载数据前事件，如果返回false 则不进行加载数据
			 * @event combo-class#beforeLoad
			 */
			if(this.hasBindEvent('beforeLoad')){
				return this.trigger('beforeLoad', this.getParameter());
			}
		},
		/**
		 * 数据加载方法
		 * @param url 加载的参数
		 * @param callback 加载完成事件
		 */
		_ajax: function(url, callback){
			if(!url){
				return;
			}
			if(this._onBeforeLoad() === false){
				return;
			}
			this.$dropPanelLoading.show();
			this.$dropPanelEmpty.hide();
			var that = this;
			AppAjax.ajaxCall({
				url: url,
				data: this.getParameter(), 
				dataType: 'json',
				type: 'POST',
				success: function(data){
					that.$dropPanelLoading.hide();
					that._onLoadSuccess(data);
					callback.call(that, data);
				}
			});	
		},
		/**
		 * 初始化数据源
		 */
		_initData: function(){
			var currParam = this.getParameter();
			if(this.setting.url && currParam){
				if(this.lastParam != JSON.stringify(currParam)){
					this.reload(this.setting.url);
				}
				this.lastParam = JSON.stringify(currParam);
			}else if(!this.onceRender){
				if($.isArray(this.setting.data)){
					this.loadData(this.setting.data);
				}else{
					this.reload(this.setting.url, this.firstLoadSuccess);
				}
				this.onceRender = true;
			}
		},
		/**
		 * 数据载入完成事件
		 */
		_onLoadSuccess: function(data){
			/**
			 * 远程数据加载完成事件
			 * <PRE>
			 * 	该事件传入加载的数据，可以通过该函数对数据进一步加工
			 * </PRE>
			 * @event combo-class#onLoadSuccess
			 * @param {Object} data 加载的数据
			 */
			this.trigger('onLoadSuccess', data);
		},
		/**
		 * 获取选中节点，单选时为一个节点对象，多选时为一个节点数组
		 * @returns {Object|Array} selectedNode
		 * @example $('#demo').textbox('getSelectedNode');
		 * @memberof combo-class
		 * @instance
		 */
		getSelectedNode: function(){
			var node = this.$input.data('selectNode');
			if(!node){
				node = null;
			}
			return node;
		},
		/**
		 * 设置一个选中节点
		 * @todo 根据节点设置value和text值
		 * @param {Object|Array} node 数据节点 
		 * @example $('#demo').textbox('setSelectNode', {value:'隐藏值',text:'显示值',cusField:'自定义字段'});
		 * @memberof textbox
		 * @instance
		 */
		setSelectedNode: function(node, noSet){
			this.$input.data('selectNode', node);
			if(noSet == true){
				return;
			}
			this._setValueAndTextByNodes();
		},
		/**
		 * 根据节点设置隐藏值和显示值
		 * @param node
		 */
		_setValueAndTextByNodes: function(){
			var nodes = this.getSelectedNode()
				,value = ''
				,text = ''
				,vf = this.setting.valuefield
				,tf = this.setting.textfield
				,formatter = this.setting.formatter;
			if(nodes){
				if($.isArray(nodes)){
					for(var i = 0; i < nodes.length; i++){
						value += nodes[i][vf] + ',';
						text += this._formatter(nodes[i], formatter, tf) + ',';
					}
					if(text.length > 0 ) text = text.substring(0, text.length-1);
					if(value.length > 0 ) value = value.substring(0, value.length-1);
				}else{
					value = nodes[vf] ? nodes[vf] : '';
					text = this._formatter(nodes, formatter, tf);
				}
			}
			this.setText(text);
			this._setValue(value);
			if(!this.setting.acceptText && this.isActive()){
				this.$text[0].select();
			}
		},
		/**
		 * 格式化显示值
		 */
		_formatter: function(node, formatter, tf){
			var text = '';
			if(formatter){
				if($.isFunction(formatter)){
					text = formatter(node);
				}else if(typeof(formatter) == 'string'){
					if(this.setting.template){
						text = this.setting.template.apply(node);
					}else{
						text = node[formatter];
					}
				}
			}else{
				text = node[tf];
			}
			return text;
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 设置隐藏值，并尝试设置显示值
		 * @param {String} val 隐藏值
		 * @see textbox#setValue
		 * @todo 当隐藏值为空时，显示值也为空
		 * @todo 当数据源为本地数据源时，且找到显示值的情况下设置显示值
		 * @todo 清空选中节点的值 setSelectedNode(null)
		 * @example $('#demo').combobox('setValue','val');
		 * @memberof combobox
		 * @instance
		 */
		setValue: function(val, noTrigger){
			this._setValue(val, noTrigger);
			this._setTextByValue(val);
			this.setSelectedNode(null, true);
		},
		/**
		 * 根据隐藏值设置显示值
		 * 1、当隐藏值为空时，显示值也为空
		 * 2、当数据源为本地数据源时，且找到显示值的情况下设置显示值
		 * @param value
		 */
		_setTextByValue: function(value){
			if(!value){
				this.setText('');
				return;
			}
			if(!this.setting.data){
				return;
			}
			var text = '';
			if(this.setting.multiple && value){
				var vs = value.split(',');
				for ( var i = 0; i < vs.length; i++) {
					text += this._findTextByValue(vs[i]) + ',';
				}
				text = text.substr(0, text.length - 1);
			}else{
				text = this._findTextByValue(value);
			}
			if(text != undefined && text != ''){
				this.setText(text);
			}
		},
		/**
		 * 数据渲染完成事件
		 */
		_afterDataRender: function(){
			/**
			 * 数据渲染完成事件
			 * @event combo-class#afterDataRender
			 */
			this.trigger('afterDataRender');
		},
		/**
		 * 获取选择面板的自定义区域
		 * @example $('#demo').combobox('getCustomPanel');
		 * @memberof combobox
		 * @instance
		 */
		getCustomPanel: function(){
			return this.$dropPanelCustom;
		},
		/**
		 * 获取联想面板的自定义区域
		 * @example $('#demo').combobox('getSuggestCustomPanel');
		 * @memberof combobox
		 * @instance
		 */
		getSuggestCustomPanel: function(){
			var context = this.$input.data('context'); 
			if(context && context.setting.className == 'app-suggest'){
				return this.getCustomPanel();
			}else if(this._suggest){
				return this._suggest.getCustomPanel();
			}
		},
		/**
		 * 获取数据集
		 * @example $('#demo').combobox('getData');
		 * @memberof combobox
		 * @instance
		 */
		getData: function(){
			return this.setting.data;
		},
		_resetPanelHeight: function(len){
			var listHeight = len * getRowHeight.call(this)
				,customHeight = this.$dropPanelCustom.height()
				,panelHeight = listHeight + customHeight;
			if(panelHeight > this.setting.panelheight){
				panelHeight = this.setting.panelheight;
			}else{
				panelHeight += getMainPanelScrollBarWidth(this.$dropPanelMain);
			}
			this.$dropPanel.height(panelHeight);
			function getMainPanelScrollBarWidth($dropPanelMain){
				var result = 0
					,scrollWidth = $dropPanelMain[0].scrollWidth
					,width = $dropPanelMain.width();
				if(scrollWidth > width){
					result += 18;
				}
				return result;
			}
		},
		_resetPanelWidth: function($dropPanelMain){
			var panelWidth = this.setting.panelwidth;
			if(panelWidth){
				return;
			}
			if(!$dropPanelMain){
				$dropPanelMain = this.$dropPanelMain;
			}
			var mainWidth = getMainPanelWidth($dropPanelMain)
				,inputWidth = this.$element.outerWidth();
			if(mainWidth < inputWidth){
				return;
			}else if(mainWidth < inputWidth*1.5){
				panelWidth = mainWidth + 15;
			}else{
				panelWidth = inputWidth*1.5;
			}
			this.$dropPanel.width(panelWidth);
			function getMainPanelWidth($dropPanelMain){
				var result = $dropPanelMain[0].scrollWidth
					,scrollHeight = $dropPanelMain[0].scrollHeight
					,height = $dropPanelMain.height();
				if(scrollHeight > height){
					result += 18;
				}
				return result;
			}
		}
	});
	
	
	$.fn.combo = function(option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'combo';
		this.each(function() {
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
					component = new Combo(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};
	function initDropPanel(){
		if(this.hasInitDropPanel){
            return;
        }
		this.hasInitDropPanel = true;
		var s = this.setting;
		var dropPanelCss = {
			height: s.panelheight
		};
		if(s.customPanelHeight && !isNaN(s.customPanelHeight)){
			var customCss = {};
			customCss.height = s.customPanelHeight;
			if(s.customPanelPosition == 'bottom'){
				customCss.bottom = 0;
				customCss['border-top-width'] = 1;
				dropPanelCss['padding-bottom'] = s.customPanelHeight;
			}else{
				customCss.top = 0;
				customCss['border-bottom-width'] = 1;
				dropPanelCss['padding-top'] = s.customPanelHeight;
			}
			this.$dropPanelCustom.css(customCss);
			dropPanelCss['min-height'] = Number(s.customPanelHeight) + 30;
		}else{
			dropPanelCss['min-height'] = 30;
		}
		//设置面板宽度
		var panelWidth = this.setting.panelwidth; 
		if(panelWidth != ''){
			if(typeof(panelWidth) == 'string' && panelWidth.charAt(panelWidth.length-1) == '%'){
				panelWidth = this.$element.outerWidth() * parseFloat(panelWidth) / 100;
			}
			dropPanelCss.width = panelWidth;
		}else{
			dropPanelCss.width = this.$element.outerWidth();
		}
		this.$dropPanel.css(dropPanelCss);
		this.$dropPanel.on('click.combo.api', $.proxy(this.focus, this));
	};
	function $dropPanelMainOnMouseWheel(event, delta, deltaX, deltaY){
		var rowHeight = getRowHeight.call(this)
			,scrollTop = this.$dropPanelMain.scrollTop()
			,scrollIndex = parseInt(scrollTop/rowHeight);
		if(delta < 0){
			this.$dropPanelMain.scrollTop((scrollIndex + 1) * rowHeight);
		}else{
			this.$dropPanelMain.scrollTop((scrollIndex - 1) * rowHeight);
		}
	};
	function $dropPanelMainScroll(){
		var ele = this.$dropPanelMain[0]
			,scrollTop = ele.scrollTop
			,scrollHeight = ele.scrollHeight
			,clientHeight = ele.clientHeight;
		if(scrollTop == 0){
			this.$dropPanelMain.scrollTop(0);
			return;     
		}
		var scrollTop = this.$dropPanelMain.scrollTop()
			,rowHeight = getRowHeight.call(this);
		if(scrollTop + clientHeight > rowHeight * (this.$dropPanelMain.find('li:visible').length-0.5)){
			scrollTop =  scrollHeight - clientHeight;
		}else{
			scrollTop = Math.ceil(scrollTop/rowHeight) * rowHeight;
		}
		this.$dropPanelMain.scrollTop(scrollTop);
	};
	function getRowHeight(){
		if(!this._rowHeight){
			if(this.setting.className == 'app-comboztree'){
				var $temp = $('<li style="visibility: hidden;"><a class="level0"><span></span></a></li>');
				this.$dropPanelMain.find('.ztree').append($temp);
				this._rowHeight = $temp.outerHeight();
				$temp.remove();
			}else{
				this._rowHeight = this.$dropPanelMain.find('li:first').outerHeight();
			}
		}
		return this._rowHeight;
	};
	return Combo;
});