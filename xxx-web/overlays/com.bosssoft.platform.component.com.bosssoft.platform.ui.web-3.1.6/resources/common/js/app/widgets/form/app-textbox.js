/**
 * 文本框控件
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/core/app-options', 
    'app/core/app-base', 'app/util/app-localstorage'],
	function($, App, Options, Base, LocalStorage) {
	
	'use strict';
	/**
	 * @abstract
	 * @class 
	 * @classdesc 文本框组件，基础组件
	 * @name textbox-class
	 * @desc 文本框的初始化方法
	 * <PRE style="color:red;">组件的属性来源分为三种
	 * &#9;1、初始化组件时传入的options设置属性
	 * &#9;2、来源于input的_options的json串配置的属性
	 * &#9;3、来源于input的属性配置（不建议使用-后期考虑废弃）[无法配置拥有大小写的属性]
	 * 属性的优先顺序为 1>2>3>默认值，options传入的属性优先使用
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @see {@link combo-class} 继承该组件
	 * @see {@link number-class} 继承该组件
	 * @see {@link datetime-class} 继承该组件
	 * @see {@link reference-class} 继承该组件
	 * @example &lt;input &#9;class="app-textbox"
	 * &#9;_options="{
	 * &#9;&#9;readonly: true,
	 * &#9;&#9;clearbtn: true,
	 * &#9;&#9;value: '中国 China',
	 * &#9;&#9;tips: '请输入...',
	 * &#9;&#9;onChange:function(newVal,oldVal){
	 * &#9;&#9;&#9;logOnChange('textboxLog',newVal,oldVal);
	 * &#9;&#9;}
	 * &#9;}"
	 * />
	 * @example $('#demo').textbox({
	 * &#9;clearbtn: true,
	 * &#9;value: '中国 China',
	 * &#9;tips: '请输入...',
	 * &#9;onChange:function(newVal,oldVal){
	 * &#9;&#9;logOnChange('textboxLog',newVal,oldVal);
	 * &#9;}
	 * });
	 */
	var Textbox = Base.extend({
		initialize: function(input, options) {
          	if(!options){
				options = {};
			}
			options._ = $.extend({}, Options.appDefaults.Textbox, options._);
			this.$input = $(input);
			this.$input.data('context', this);
			this.options = options;
			this._baseInit();
        },
        /**
		 * 初始化
		 */
		_baseInit: function(){
			this._baseInitOptions();
			this._baseEventRegister();
			this._wrapByDiv();
			this.$element = this.$input.parent();
			this.$element.data('context', this);
			this.$text = this.$element.find('[type=showValue]');
			this.$value = this.$input;
			this.$clearBtn = this.$element.find('.wrapper-clear');
			this.$openBtn = this.$element.find('.wrapper-open');
			this._registWrapperEvents();
			var s = this.setting;
			this.setValue(s.value, true);
			if(s.text){
				this.setText(s.text);
			}
			if(s.disabled){
				this.disable();
			}
			if(s.readonly){
				this.readonly();
			}
			if(s.autoHideOpenBtn){
				this.$openBtn.hide();
			}
			this._textChangeEvent();
			var formatter = s.formatter; 
			if(formatter){
				if(typeof(formatter) == 'string' && formatter.indexOf('{') >= 0){
					s.template = new Template(formatter);
				}
			}
			this._afterRender();
		},
		/**
		 * 显示值改变事件
		 */
		_textChangeEvent: function(){
			var that = this;
			this.$text.on('change.textbox.api',function(){
				var text = this.value
					,pos = that.$text.getCurPos(); 
				if(that.setting.trim){
					text = $.trim(text); 					
				}
				if(that.forbidReg){
					var forbidRegMatch = text.match(that.forbidReg);
					if(forbidRegMatch){
						pos = text.indexOf(forbidRegMatch[0]);
					}
					text = text.replace(that.forbidReg, '');
				}
				if(that.permitReg){
					var permitRegMatch = text.match(that.permitReg);
					if(permitRegMatch){
						pos = text.indexOf(permitRegMatch[0]);
					}
					text = text.replace(that.permitReg, '');
				}
				that.$text.val(text);
				that.setValue(text);
				if(pos !== null){
					that.$text.setCurPos(pos);
				}
			});
		},
		/**
		 * 显示提示信息
		 */
		_showTips: function(){
			var tips = this.setting.tips
				,text = this.getText();
			if(!tips){
				return;
			}
			if(text == ''){
				this.$text.addClass('wrapper-tips');
				this.$text.val(tips);
			}else{
				this.$text.removeClass('wrapper-tips');
			}
		},
		/**
		 * 初始化尝试
		 */
		_baseInitOptions: function(){
			var customSetting = $.extend(App.getAttrFromElement(this.$input), this.options);
			if($.isFunction(customSetting.beforeRender)){
				customSetting.beforeRender.call(this, customSetting);
			}
			this.customSetting = customSetting;
			if(customSetting.multiple){
				this.options._.clearbtn = true;
			}
			if(isNaN(customSetting.panelheight)){
				delete customSetting.panelheight;
			}
			this.setting = $.extend({}, this.options._, customSetting);
			delete this.options._;
			if(!this.setting.url){
				this.setting.url = this.setting.action;
			}
			//初始化查询参数
			if(this.setting.parameter){
				var parameter = this.setting.parameter;
				if(typeof(parameter) == 'string'){
					parameter = App.jsonEval(this.setting.parameter);					
				}
				this.setParameter(parameter);
			}
			if(this.setting.otherParam){
				if(typeof(this.setting.otherParam) == 'string'){
					this.setting.otherParam = App.jsonEval(this.setting.otherParam);					
				}
			}
			if(this.setting.forbidWord){
				this.forbidReg = new RegExp('[' + this.setting.forbidWord + ']', 'g');
			}
			if(this.setting.permitWord){
				this.permitReg = new RegExp('[^' + this.setting.permitWord + ']', 'g');
			}else{
				var filter = this.setting.filter; 
				var reg = '';
				if(filter == '0-9'){
					reg = '0-9';
				}else if(filter == 'number'){
					reg = '0123456789\\-\\+\\.';
				}else if(filter == 'positiveNumber'){
					reg = '0123456789\\.';
				}
				if(reg){
					this.permitReg = new RegExp('[^' + reg + ']', 'g');
				}
			}
			if(this.setting.historyKey){
				this._localStorage = new LocalStorage({key: this.setting.historyKey, expire: 7});
			}
		},
		/**
		 * 事件的注册器
		 */
		_baseEventRegister: function(){
			var s = this.setting;
			if($.isFunction(s.afterRender)){
				this.on('afterRender', s.afterRender);
			}
			if($.isFunction(s.onBlur)){
				this.on('onBlur', s.onBlur);
			}
			if($.isFunction(s.onChange)){
				this.on('onChange', s.onChange);
			}
			if($.isFunction(s.onClearValue)){
				this.on('onClearValue', s.onClearValue);
			}
			if($.isFunction(s.onClickOpen)){
				this.on('onClickOpen', s.onClickOpen);
			}
			if($.isFunction(s.onFocus)){
				this.on('onFocus', s.onFocus);
			}
			if($.isFunction(s.onReadonlyClick)){
				this.on('onReadonlyClick', s.onReadonlyClick);
			}
			if($.isFunction(s.enterKeyDown)){
				this.on('enterKeyDown', s.enterKeyDown);
			}
		},
		/**
		 * 注册控件事件
		 */
		_registWrapperEvents: function(){
			this.$element.on('mouseover.textbox.api', ':not(.wrapper-readonly-mask,.wrapper-readonly-mask *)'
									, $.proxy(this._mouseover$element, this));
			this.$element.on('mouseout.textbox.api', $.proxy(this._mouseout$element, this));
			this.$element.on('click.textbox.api', function(e){e.stopPropagation();});
			this.$element.on('mousedown.textbox.api', '.wrapper-btn.wrapper-open', function(e){
				e.stopPropagation();
				e.preventDefault();
			});
			this.$clearBtn.on('click.textbox.api', $.proxy(this._click$clearBtn, this));
			this.$openBtn.on('mousedown.textbox.api', $.proxy(this._mousedown$openBtn, this));
			this.$text.on('click.textbox.api', $.proxy(this._click$text, this));
			this.$text.on('focus.textbox.api', $.proxy(this._focus$text, this));
			this.$text.on('blur.textbox.api', $.proxy(this._blur$text, this));
			this.$text.on('keydown.' + this.setting.className + '.api', $.proxy(this._keyManager, this));
			if(this.forbidReg || this.permitReg){
				if(window.applicationCache){
					this.$text.on('input.' + this.setting.className + '.api', $.proxy(this._keyUpManager, this));
				}else{
					this.$text.on('keyup.' + this.setting.className + '.api', $.proxy(this._keyUpManager, this));
				}
			}
		},
		/**
		 * 顶层元素的mouseover事件
		 */
		_mouseover$element: function(){
			this.$element.addClass('app-wrapper-hover');
			this._autoShowOpenBtn();
			if(this.setting.clearbtn){
				if(this.getText() || this.getValue()){
					var right = 28 * this.$element.find('a.wrapper-btn:visible').length;
					this.$clearBtn.css({display: 'block',right: right});
				}
			}
			this.trigger('onMouseOver');
		},
		/**
		 * 顶层元素的mouseout事件
		 */
		_mouseout$element: function(){
			this.$clearBtn.css('display','none');
			this.$element.removeClass('app-wrapper-hover');
			this._autoHideOpenBtn();
			this.trigger('onMouseOut');
		},
		/**
		 * 清除按钮点击事件
		 */
		_click$clearBtn: function(){
			this.clearValue();
			/**
			 * 删除按钮点击事件
			 * @event textbox-class#onClearValue
			 */
			this.trigger('onClearValue');
		},
		/**
		 * 打开按钮mousedown事件
		 */
		_mousedown$openBtn: function(){
			if(this.togglePanel){ this.togglePanel(); }
			this.focus();
			/**
			 * 打开按钮点击事件
			 * @event textbox-class#onClickOpen
			 */
			this.trigger('onClickOpen');
		},
		/**
		 * 显示文本点击事件
		 */
		_click$text: function(){
			this._setCursorSign();
			if(!this._isEditable()){
				if(this.togglePanel){ this.togglePanel(); }
			}
		},
		/**
		 * 显示值的focus事件
		 */
		_focus$text: function(){
			this._attchCounterTimer();
			this._setCursorSign();
			this.$element.addClass('app-wrapper-active');
			if(this.$text.val() == this.setting.tips){
				this.$text.val('')
				this.$text.removeClass('wrapper-tips');
			}
			this._autoShowOpenBtn();
			/**
			 * onFocus事件
			 * @event textbox-class#onFocus
			 */
			this.trigger('onFocus');
		},
		/**
		 * 计算字符的间隔器
		 */
		_attchCounterTimer: function(){
			var $text = this.$text
				,maxLen = this.setting.maxLength; 
			if(maxLen > 0){
				var i = 0
					,that = this;
				this.counterTimer = setInterval(function(){
					var text = $text.val();
					if (maxLen - text.length >= 0){
						$text.off('keypress.textbox.counter.api');
					}else{
						$text.on('keypress.textbox.counter.api', function(e){
							if(8 !== e.keyCode) return false;						
						});
				   	}
				   	setTimeout(function(){
				   		var text = $text.val();
						if (maxLen - text.length < 0){
							that.showError('已按最大长度'+maxLen+'进行截取',1200);
							$text.val($text.val().substring(0, maxLen));
						}
					}, 0);
				}, 500);
			}
		},
		/**
		 * 显示值的blur事件
		 */
		_blur$text: function(){
			this._detachCounterTimer();
			this.$element.removeClass('app-wrapper-active');
			if(this.getText() == '' && this.setting.tips){
				this.setText(this.setting.tips);
				this.$text.addClass('wrapper-tips');
			}
			this._autoHideOpenBtn();
			/**
			 * onBlur事件
			 * @event textbox-class#onBlur
			 */
			this.trigger('onBlur');
		},
		/**
		 * 清除计算字符的间隔器
		 */
		_detachCounterTimer: function(){
			if(this.counterTimer){
				clearInterval(this.counterTimer);
			}
		},
		/**
		 * 自动显示按钮
		 */
		_autoShowOpenBtn: function(){
			if(this.setting.autoHideOpenBtn){
				this.$openBtn.show();
			}
		},
		/**
		 * 自动隐藏按钮
		 */
		_autoHideOpenBtn: function(){
			if(this.setting.autoHideOpenBtn){
				if(!this.isActive()){
					this.$openBtn.hide();
				}
			}
		},
		/**
		 * 按键事件
		 */
		_keyManager: function(e){
			this._keyCursorPos(e);
		},
		_keyUpManager: function(){
			var that = this;
			setTimeout(function(){
				that.$text.trigger('change');
			}, 100);
		},
		/**
		 * 处理特殊作用的按键
		 * @return true 则为被处理的特殊件
		 */
		_dealSysKey: function(e){
			if(e.keyCode == App.keyCode.TAB){
				if(this._mainDivIsVisiable()){
					this.hidePanel();
				}
				return true;
			}else if(e.ctrlKey && (e.keyCode == App.keyCode.DELETE 
					|| e.keyCode == App.keyCode.BACKSPACE) && this.setting.clearable !== false){
				this.clearValue();
				return true;
			}else if(e.keyCode == App.keyCode.DELETE 
					|| e.keyCode == App.keyCode.BACKSPACE){
				if(!this._isEditable() && this.setting.clearable !== false){
					this.clearValue();
					return true;
				}
			}else if(e.ctrlKey && e.keyCode == App.keyCode.Z){
				e.preventDefault();
				return true;
			}else if(e.keyCode == App.keyCode.PgUp){
				if(this.$dropPanel){
					this.$dropPanel.scrollTop(this.$dropPanel.scrollTop() - this.$dropPanel.outerHeight());
					return true;
				}
			}else if(e.keyCode == App.keyCode.PgDn){
				if(this.$dropPanel){
					this.$dropPanel.scrollTop(this.$dropPanel.scrollTop() + this.$dropPanel.outerHeight());
					return true;
				}
			}
			if(e.keyCode == App.keyCode.ENTER && !e.shiftKey){
				var $target = $(e.target)
					,timeStamp = $target.data('enterKeyTimeStamp');
				if(!timeStamp || (timeStamp && e.timeStamp - timeStamp > 1000) ){
					if(!this._mainDivIsVisiable()){
						$target.data('enterKeyTimeStamp', e.timeStamp);
						this.trigger('enterKeyDown');
					}
				}
				return true;
			}
			return false;
		},
		/**
		 * 代理光标在文本中移动的操作
		 */
		_keyCursorPos: function(e){
			if(this._dealSysKey(e)){
				return;
			}
			var keyCode = e.keyCode;
			if(this._isKeyCursorPos(keyCode)){
				if(e.ctrlKey){
					return;
				}
				switch(keyCode){
					case App.keyCode.LEFT: 
					case App.keyCode.HOME:
					case App.keyCode.UP:
						if(this._isEditable()){
							this._setCursorSign();
							if(!this._beforeFirstChar){
								e.stopPropagation();
							}
						}
						break;
					case App.keyCode.RIGHT: 
					case App.keyCode.END:
					case App.keyCode.DOWN:
						var len = this.getText().length;
						if(this._isEditable()){
							this._setCursorSign();
							if(!this._afterLastChar){
								e.stopPropagation();
							}
						}
						break;
				}
			}else{
				if(this.setting.filter){
					this._filterKeyDown(e);
				}
				this._setCursorSign();
			}
		},
		/**
		 * 是否为控制光标位置的按键
		 */
		_isKeyCursorPos: function(keyCode){
			if(keyCode == App.keyCode.LEFT || keyCode == App.keyCode.RIGHT
				|| keyCode == App.keyCode.HOME || keyCode == App.keyCode.END){
				return true;
			}
			return false;
		},
		/**
		 * 延迟设置是否要继续冒泡的标志
		 */
		_setCursorSign: function(){
			var that = this;
			setTimeout(function(){
				var pos = that._getSelection();
				if(pos.start == 0){
					that._beforeFirstChar = true;
				}else{
					that._beforeFirstChar = false;
				}
				if(pos.end == that.getText().length){
					that._afterLastChar = true;
				}else{
					that._afterLastChar = false;
				}
			},0);
		},
		/**
		 * 获取当前选中文本的起始位置
		 */
		_getSelection: function() {
			var el = this.$text[0]
				,result = {};
			if ('selectionStart' in el) {
				result.start = el.selectionStart;
				result.end = el.selectionEnd;
			}else if('selection' in document) {
				var val = el.value,
				range = document.selection.createRange().duplicate();
				range.moveEnd('character', val.length);
				result.start = range.text == '' ? val.length:val.lastIndexOf(range.text);
				range = document.selection.createRange().duplicate();
				range.moveStart('character', -val.length);
				result.end = range.text.length;
			}
			return result;
		},
		/**
		 * 键盘过滤事件
		 * @param e
		 */
		_filterKeyDown: function(e){
			var filter = this.setting.filter
				,keyCode = e.keyCode;
			if($.isFunction(filter)){
				if(filter(e) === false){
					e.preventDefault();
				}
			}else if(typeof(filter) == 'string'){
				if(keyCode == App.keyCode.DELETE || keyCode == App.keyCode.BACKSPACE){
					return ;
				}
				if(filter == 'number'){
					if(keyCode >= 48 && keyCode <= 57){//横排数字
					
					}else if(keyCode >= 96 && keyCode <= 105){//小键盘数字
					
					}else{
						e.preventDefault();
						if(keyCode == App.keyCode.PLUS || keyCode == App.keyCode.PLUS1){
							this._setNumberSign('');
						}else if(keyCode == App.keyCode.MINUS || keyCode == App.keyCode.MINUS1){
							this._setNumberSign('-');
						}else if(keyCode == App.keyCode.POINT || keyCode == App.keyCode.POINT1){
							this._setNumberPoint();
						}
					}
				}else if(filter == 'positiveNumber'){
					if(keyCode >= 48 && keyCode <= 57){//横排数字
					
					}else if(keyCode >= 96 && keyCode <= 105){//小键盘数字
					
					}else{
						e.preventDefault();
						if(keyCode == App.keyCode.POINT || keyCode == App.keyCode.POINT1){
							this._setNumberPoint();
						}
					}
				}else if(filter == '0-9'){
					if(keyCode >= 48 && keyCode <= 57){//横排数字
					
					}else if(keyCode >= 96 && keyCode <= 105){//小键盘数字
					
					}else{
						e.preventDefault();
					}
				}
			}
		},
		/**
		 * 数值对正负号的控制
		 */
		_setNumberSign: function(sign){
			var text = '';
			if(hasSelectedText()){
				text = '';
				this.setText(text);
			}else{
				text = this.getText()
			}
			if(text.indexOf('-') == 0){
				this.setText(sign + text.substring(1));
			}else{
				this.setText(sign + text);
			}
			setCusor(this.$text[0]);
			function setCusor(input){
				if(input.createTextRange){
					var range = input.createTextRange();
			        range.collapse(true);
			        var pos = input.value.length;
			        range.moveEnd('character', pos);
			        range.moveStart('character', pos);
			        range.select();
				}
			}
			function hasSelectedText(){
				if(window.getSelection) {
	            	return window.getSelection().toString() != '';
	            }else if(document.selection && document.selection.createRange) {
		            return document.selection.createRange().text != '';
		        }
		        return false;
			}
		},
		/**
		 * 数值对小数点的控制
		 */
		_setNumberPoint: function(){
			var text = this.getText();
			if(text.indexOf('.') == -1){
				if(text.length == 0){
					this.setText('0.');
				}else{
					this.setText(text + '.');
				}
			}
		},
		/**
		 * 禁用组件
		 * @todo 使用一个遮罩将组件屏蔽住
		 * @example $('#demo').textbox('disable');
		 * @memberof textbox-class
		 * @instance
		 */
		disable: function(){
			this._outReadonly();
			var $mask = this.$element.find('.wrapper-disabled-mask');
			if($mask.length > 0){
				this.$disabledMask = $mask;
				this._setLabelText();
				this.$disabledMask.show();
			}else if(this.$disabledMask == undefined){
				this.$disabledMask = $('<div class="wrapper-disabled-mask"><label></label></div>');
				this.$element.append(this.$disabledMask);
				this._setLabelText();
			}else{
				this.$disabledMask.show();
			}
			this.$text.attr('tabindex', -1);
			this.$element.addClass('wrapper-disabled');
		},
		/**
		 * 启用组件
		 * @todo 将遮罩移除
		 * @example $('#demo').textbox('enable');
		 * @memberof textbox-class
		 * @instance
		 */
		enable: function(){
			if(this.$disabledMask){
				this.$disabledMask.hide();
			}
			this.$text.removeAttr('tabindex');
			this.$element.removeClass('wrapper-disabled');
		},
		/**
		 * 获取组件的是否可用状态
		 * <PRE>
		 * 	true：可用
		 * 	false：禁用
		 * </PRE>
		 * @returns {Boolean} enable 可用状态
		 * @example $('#demo').textbox('isEnabled');
		 * @memberof textbox-class
		 * @instance
		 */
		isEnabled: function(){
			if(this.$disabledMask && this.$disabledMask.is(':visible')){
				return false;
			}
			return true;
		},
		/**
		 * 设置是否可以输入
		 * @param {Boolean} [editable=true] 允许编辑  
		 */
		_editable: function(editable){
			if(editable == undefined || editable == true){
				this.$text.removeAttr('readonly');
			}else{
				this.$text.attr('readonly', 'readonly');
			}
		},
		/**
		 * 是否可以输入
		 */
		_isEditable: function(){
			var editable = this.$text.attr('readonly');
			if(editable){
				return false;
			}
			return true;
		},
		/**
		 * 切换可用状态
		 * @memberof textbox-class
		 * @instance
		 */
		toggleEnable: function(){
			if(this.$disabledMask && this.$disabledMask.is(':visible')){
				this.enable();
			}else{
				this.disable();
			}
		},
		/**
		 * 设置是否只读
		 * @param {Boolean} [readonly=true] 允许编辑  
		 * @example $('#demo').textbox('readonly');
		 * @example $('#demo').textbox('readonly', false);
		 * @example $('#demo').textbox('readonly', true);
		 * @memberof textbox-class
		 * @instance
		 */
		readonly: function(readonly){
			if(readonly == undefined || readonly == true
					|| readonly == 'true'){
				this._intoReadonly();
			}else{
				this._outReadonly();
			}
		},
		/**
		 * 只读状态
		 * @returns {Boolean} readonly 只读状态
		 * @memberof textbox-class
		 * @instance
		 */
		isReadonly: function(){
			if(this.$readonlyMask && this.$readonlyMask.is(':visible')){
				return true;
			}
			return false;
		},
		/**
		 * 进入只读状态
		 */
		_intoReadonly: function(){
			this.enable();
			var $mask = this.$element.find('.wrapper-readonly-mask');
			if($mask.length > 0){
				this.$readonlyMask = $mask;
				this._setLabelText();
				this.$readonlyMask.show();
			}else if(this.$readonlyMask == undefined){
				var style = '';
				if(this.setting.style){
					style = 'style="text-align:left;' + this.setting.style + ';display:block;"';
				}
				this.$readonlyMask = $('<div class="wrapper-readonly-mask" ' + style + '><label></label></div>');
				this.$element.append(this.$readonlyMask);
				this._setLabelText();
				/**
				 * 只读状态下 内容点击
				 * @event textbox-class#onReadonlyClick
				 * @param {Jquery} $label 内容元素
				 */
				var click = this.setting.onReadonlyClick;
				if($.isFunction(click)){
					click(this.$readonlyMask.find('>label'));
				}
			}else{
				this.$readonlyMask.show();
			}
			this.$element.addClass('wrapper-readonly');
			this.$text.attr('tabindex', -1);
		},
		/**
		 * 离开只读状态
		 */
		_outReadonly: function(){
			if(this.$readonlyMask){
				this.$readonlyMask.hide();
			}
			this.$element.removeClass('wrapper-readonly');
			this.$text.removeAttr('tabindex');
		},
		/**
		 * 切换只读状态
		 * @memberof textbox-class
		 * @instance
		 */
		toggleReadonly: function(){
			this.readonly(!this.isReadonly());
		},
		/**
		 * 设置标签的值
		 */
		_setLabelText: function(){
			if(this.$readonlyMask){
				var text = this.getText();
				this.$readonlyMask.find('label').html(text).attr('title', text);
			}
			if(this.$disabledMask){
				var text = this.getText();
				this.$disabledMask.find('label').html(text).attr('title', text);
			}
		},
		/**
		 * 将焦点聚焦到组件
		 * @memberof textbox-class
		 * @instance
		 */
		focus: function(){
			if(this.isReadonly() || !this.isEnabled()){
				return;
			}
			this.$text.focus();
		},
		/**
		 * 使得组件失去焦点
		 * @memberof textbox-class
		 * @instance
		 */
		blur: function(handle){
			if(this.isReadonly() || !this.isEnabled()){
				return;
			}
			this.$text.one('blur.textbox-one.api', handle);
			this.$text.blur();
		},
		/**
		 * 该组件是否为活动状态
		 * @memberof textbox-class
		 * @instance
		 */
		isActive: function(){
			return this.$element.hasClass('app-wrapper-active');
		},
		/**
		 * 设置请求远程数据时的查询参数
		 * @param {object} param 查询参数
		 * @example $('#demo').textbox('setParameter',{year:2014});
		 * @memberof textbox-class
		 * @instance
		 */
		setParameter: function(param){
			if(!param){
				param = {};
			}
			this.$input.data('_parameter', param);
		},
		/**
		 * 获取请求数据的查询参数
		 * @returns {object} param 查询参数
		 * @example $('#demo').textbox('getParameter');
		 * @memberof textbox-class
		 * @instance
		 */
		getParameter: function(){
			var parameter = this.$input.data('_parameter');
			if($.isFunction(parameter)){
				return parameter();
			}
			return parameter;
		},
		/**
		 * 设置隐藏值和显示值
		 * @param {String} val 值
		 * @param {boolean} [noTrigger] 是否触发change
		 * @todo 如果noTrigger不为true，则触发change事件
		 * @example $('#demo').textbox('setValue','val');
		 * @memberof textbox-class
		 * @instance
		 */
		setValue: function(val, noTrigger){
			this.setText(val);
			this._setValue(val, noTrigger);
		},
		/**
		 * 设置隐藏值和显示值，不触发onChange事件
		 * @param {String} val 值
		 * @example $('#demo').textbox('setValueNoChange','val');
		 * @memberof textbox-class
		 * @instance
		 */
		setValueNoChange: function(val){
			this.setValue(val, true);
		},
		/**
		 * 设置隐藏值
		 */
		_setValue: function(val, noTrigger){
			this.$value.val(val);
			//强制触发onchange事件，验证框架使用change事件机制进行验证
			if(!noTrigger){
				this.$value.trigger('change');
			}
			this._triggerOnChange(val, noTrigger);
		},
		/**
		 * 获取隐藏值
		 * @returns {String} String 隐藏值
		 * @example alert('隐藏值:' + $('#demo').textbox('getValue'));
		 * @memberof textbox-class
		 * @instance
		 */
		getValue: function(){
			return this.$value.val();
		},
		/**
		 * 设置显示值
		 * @example $('#demo').textbox('setText','text');
		 * @memberof textbox-class
		 * @instance
		 */
		setText: function(text){
			this.$text.val(text);
			this._setLabelText();
			this._showTips();
		},
		/**
		 * 获取显示值
		 * @returns {String} String 显示值
		 * @example alert('显示值:' + $('#demo').textbox('getText'));
		 * @memberof textbox-class
		 * @instance
		 */
		getText: function(){
			var text = this.$text.val();
			if(text == this.setting.tips){
				text = '';
			}
			return text;
		},
		/**
		 * 设置提示信息
		 * @example $('#demo').textbox('setTips', '提示信息');
		 * @memberof textbox-class
		 * @instance
		 */
		setTips: function(title){
			this.$element.off('mouseenter.textbox-tips.api')
				.off('mouseleave.textbox-tips.api')
				.off('mousemove.textbox-tips.api');
			if(!title){
				return;
			}
			var that = this;
			this.$element.on('mouseenter.textbox-tips.api', function(e){
			 	that.$tooltip = $('<div class="panel-tooltip">'+ title +'</div>');
		        $.$appPanelContainer.append(that.$tooltip);
		        that.$tooltip.css({
		        	top: (e.pageY + 20) + 'px',
		        	left: (e.pageX + 10)  + 'px',
		        	'z-index': Options.zindexs.droppanel+1
		        }).show('fast');
			}).on('mouseleave.textbox-tips.api', function(e){
				if(that.$tooltip){
		        	that.$tooltip.remove();
				}
			}).on('mousemove.textbox-tips.api', function(e){
				if(that.$tooltip){
		        	that.$tooltip.css({
		                top: (e.pageY + 20) + 'px',
		                left: (e.pageX + 10)  + 'px'
		            });
				}
			});
		},
		/**
		 * 清除值
		 * @todo 清除显示值
		 * @todo 清除隐藏值
		 * @example $('#demo').textbox('clearValue');
		 * @memberof textbox-class
		 * @instance
		 */
		clearValue: function(){
			this.setText('');
			this.setValue('');
		},
		/**
		 * 销毁组件
		 * @todo 清除dom元素，如果有
		 * @memberof textbox-class
		 * @instance
		 */
		destroy: function(){
			if(this.$dropPanel){
				this.$dropPanel.remove();
			}
			this._detachCounterTimer();
			var $errprWrapper = this.$element.data('errorWrapper');
			if($errprWrapper){
				$errprWrapper.remove();
			}
			this.$element.remove();
			if(this.setting.usesuggest && this._suggest){
				this._suggest.$dropPanel.remove();
			}
			this.$input.removeData(this.setting.className.substr(4));
		},
		/**
		 * 触发onChange事件
		 * @param newVal 新值
		 */
		_triggerOnChange: function(newVal, noTrigger){
			var oldVal = this.$input.data('oldVal'); 
			if( oldVal == newVal){
				return;
			}
			this._makeHistory();
			this.$input.data('oldVal', newVal);
			if(noTrigger){
				return;
			}
			/**
			 * onChange事件
			 * 		新设置的值与原值不同时，触发onChange事件
			 * @event textbox-class#onChange
			 * @param {String} newNode 新值
			 * @param {String} oldVal 旧值
			 */
			if(this.hasBindEvent('onChange')){
				this.trigger('onChange', newVal, oldVal);
			}
		},
		_makeHistory: function(){
			if(!this._localStorage){
				return;
			}
			var curr = null;
			if($.isFunction(this.getSelectedNode)){
				curr = this.getSelectedNode();
			}else{
				curr = this.getValue();
			}
			if(!curr){
				return;
			}
			if(typeof curr){
				curr = {
					data: curr,
					keyField: this.setting.valuefield
				}
			}
			this._localStorage.put(curr);
		},
		/**
		 * 将input渲染成自定义控件
		 * @param $input 原始input元素
		 * @param opts 渲染参数
		 */
		_wrapByDiv: function(opts){
			if(this.$input.parent().hasClass('app-wrapper')){
				return;
			}
			if(!this.$input.is('input')){
				return;
			}
			var $input = this.$input
				,s = this.setting;
			var innerHtml = this._initInnerHtml()
				,style = '';
			if(s.width){
				var width = s.width + '';
				if(width.charAt(width.length-1) == '%'){
					style = 'width:' + width +';';
				}else{
					style = 'width:' + parseInt(width) +'px;';
				}
			}
			if(s.wrapstyle){
				style += s.wrapstyle;
			}
			if(s.hiddencomp){
				style = 'display:none;';
			}
			if(style){
				style = 'style="' + style +'"';
			}
			$input.css('display','none');
			$input.removeClass(s.className);
			$input.wrap('<div class="app-wrapper ' + s.className + '" ' + style + '></div>').parent().append(innerHtml);
		},
		/**
		 * 生成控件内部的html
		 * @param $input
		 * @param opts
		 * @returns {String}
		 */
		_initInnerHtml: function(){
			var result =''
				,exp = ''
				,imeStyle = ''
				,s = this.setting;
			if(s.text){
				exp += 'value="' + s.text +'" ';
			}
			if(s.showfield){
				exp += ' name="' + s.showfield + '" field="' + s.showfield + '" ';
			}
			if(s.filter == 'number'
				|| s.filter == '0-9'){
				if(s.style){
					s.style = 'ime-mode: disabled;' + s.style;
				}else{
					s.style = 'ime-mode: disabled;';
				}
			}
			if(s.style){
				exp += ' style="' + s.style + '"';
			}
			if(s.multiline){
				result = '<textarea type="showValue" autocomplete="off" ' + exp + '/>';
			}else{
				result = '<input type="showValue" autocomplete="off" ' + exp + '/>';
			}
			result += '<span class="wrapper-btn wrapper-clear"><i></i></span>';
			if(s.openbtn){
				result += '<a class="wrapper-btn wrapper-open" tabindex="-1"><i></i></a>';
			}
			return result;
		},
		/**
		 * 查看下拉面板是否已显示
		 * @returns true 为显示
		 */
		_mainDivIsVisiable: function(){
			return this.$dropPanel && this.$dropPanel.is(':visible');
		},
		_afterRender: function(){
			var that = this
				,className = this.setting.className.substring(4);
			if(this.$element.hasClass(this.setting.className)){
				var t = setInterval(function(){
					if(that.$input.data(className)){
						clearInterval(t);
						/**
						 * afterRender事件
						 * @event textbox-class#afterRender
						 */
						that.trigger('afterRender');
					}
				}, 1);
			}
		},
		/**
		 * 隐藏错误信息
		 * @memberof textbox-class
		 * @instance
		 */
		hideError: function(){
			var $e = this.$element;
			$e.removeClass('errorTarger');
			var $wrap = $e.data('errorWrapper');
			if($wrap){
				$wrap.hide();
				$e.data('errorWrapper', null);
				$wrap.remove();
				$e.off('mouseenter.textbox.err.api mouseleave.textbox.err.api');
			}
		},
		/**
		 * 显示错误信息
		 * @param {String} errorMsg 错误信息
		 * @param {int} delay 延迟关闭(不设置则不关闭)
		 * @memberof textbox-class
		 * @instance
		 */
		showError: function(errorMsg, delay){
			var $e = this.$element;
			$e.addClass('errorTarger');
			var $wrap = $e.data('errorWrapper');
			if(!$wrap){
				var $wrapper = $('<div class=\"errorWrapper\"><div><div></div></div></div>');
				$wrapper.css('width',$e.outerWidth());
				$wrapper.appendTo($.$appPanelContainer);
				$e.data('errorWrapper', $wrapper);
				var $label = $('<span for="' + this.setting.id + '" generated="true" class="help-inline">' + errorMsg + '</span>');
				$label.insertBefore($wrapper.find('div div'));
				$e.on('mouseenter.textbox.err.api', function(){
					showError($(this));
				}).on('mouseleave.textbox.err.api', function(){
					hideError($(this));
				});
			}else{
				$wrap.find('div>span').text(errorMsg);
			}
			showError($e);
			if(delay){
				var that = this;
				setTimeout(function(){
					that.hideError();
				},delay);
			}
			return $wrap;
			function showError($e){
				var $wrapper = $e.data('errorWrapper');
				if($wrapper && $wrapper.text()){
					$e.addClass('errorTarger');
					var css = $e.offset()
						,$thisTop = $e.offset().top;
					css.display = 'block';
					if($thisTop < $wrapper.outerHeight()){
						css.top = css.top + $e.outerHeight();
						$wrapper.addClass('up');
					}else{
						css.top = css.top -  $wrapper.outerHeight();
						$wrapper.removeClass('up');
					}
					$wrapper.css(css);
				}
			}
			function hideError($e){
				$e.removeClass('errorTarger');
				var $wrapper = $e.data('errorWrapper');
				if($wrapper){
					$wrapper.hide();
				}
			}
		}
	});
	
	$.fn.textbox = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'textbox';
		this.each(function(){
			var $this = $(this);
			if(!$this.is('input')){
				return true;
			}
			var component = App.getComponent($this, componentName);
			if(!component){
				var opts = option;
				if(typeof option === 'string'){
					opts = false;
				}
				component = new Textbox(this, opts);
				$this.data(componentName, component);
			}
			if(typeof option === 'string'){
				var methodArgs = Array.prototype.slice.call(args, 1);
				methodReturn = App.componentMethodApply(component, option, methodArgs);
			}
		});
		return methodReturn;
	};
	/**
	 * jquery对象
	 * @namespace jquery
	 */
	$.fn.extend({
		/**
		 * 获取当前光标位置的方法
		 * @memberof jquery
		 * @instance
		 */
		getCurPos:function() {
			if(!$(this).is(":focus")){
				return null;
			} 
			var curCurPos = '';
			var all_range = '';
			if (navigator.userAgent.indexOf("MSIE") > -1) { //IE
				if( $(this).get(0).tagName == "TEXTAREA" ){ 
					// 根据body创建textRange
					all_range = document.body.createTextRange();
					// 让textRange范围包含元素里所有内容
					all_range.moveToElementText($(this).get(0));
				} else {
					// 根据当前输入元素类型创建textRange
					all_range = $(this).get(0).createTextRange();
				}
				// 输入元素获取焦点
				$(this).focus();
				// 获取当前的textRange,如果当前的textRange是一个具体位置而不是范围,textRange的范围从start到end.此时start等于end
				var cur_range = document.selection.createRange();
				// 将当前的textRange的end向前移"选中的文本.length"个单位.保证start=end
				cur_range.moveEnd('character',-cur_range.text.length)
				// 将当前textRange的start移动到之前创建的textRange的start处, 此时当前textRange范围变为整个内容的start处到当前范围end处
				cur_range.setEndPoint("StartToStart",all_range);
				// 此时当前textRange的Start到End的长度,就是光标的位置
				curCurPos = cur_range.text.length;
			} else {
				// 文本框获取焦点
				$(this).focus();
				// 获取当前元素光标位置
				curCurPos = $(this).get(0).selectionStart;
			}
			// 返回光标位置
			return curCurPos;
		},
		/**
		 * 设置当前光标位置方法
		 * @memberof jquery
		 * @instance
		 */
		setCurPos:function(start,end) {
			if(end === undefined){
				end = start;
			}
			if(navigator.userAgent.indexOf("MSIE") > -1){
				var all_range = '';
				if( $(this).get(0).tagName == "TEXTAREA" ){ 
					// 根据body创建textRange
					all_range = document.body.createTextRange();
					// 让textRange范围包含元素里所有内容
					all_range.moveToElementText($(this).get(0));
				} else {
					// 根据当前输入元素类型创建textRange
					all_range = $(this).get(0).createTextRange();
				}
				$(this).focus();
				// 将textRange的start设置为想要的start
				all_range.moveStart('character',start);
				// 将textRange的end设置为想要的end. 此时我们需要的textRange长度=end-start; 所以用总长度-(end-start)就是新end所在位置
				all_range.moveEnd('character',-(all_range.text.length-(end-start)));
				// 选中从start到end间的文本,若start=end,则光标定位到start处
				all_range.select();
			}else{
				// 文本框获取焦点
				$(this).focus();
				// 选中从start到end间的文本,若start=end,则光标定位到start处
				$(this).get(0).setSelectionRange(start,end);
			}
		}
	});
	/** 
	 * 初始化下拉面板容器
	 */
	function initPanelContainer(){
		var $container = $('body').find('.appPanelContainer');
		if($container.length == 0){
			$container = $('<div class="appPanelContainer" />');
			$('body').append($container);
		}
		$.$appPanelContainer = $container;
	}
	initPanelContainer();
	return Textbox;
});