/**
 * 数值控件--继承Textbox
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/core/app-options', 'app/widgets/form/app-textbox',
        'app/util/app-utils'], function($, App, Options, Textbox, Utils) {
	'use strict';
	/**
	 * @class 
	 * @classdesc 数值框
	 * <span class="type-signature static">extend</span>textbox
	 * @see {@link textbox-class} number继承至textbox
	 * @name number-class
	 * @desc 数值框的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @example &lt;input &#9;class="app-number" />
	 * @example $('#demo').number({});
	 */
	var Number = Textbox.extend({
		initialize: function(input, options) {
			if(!options){
				options = {};
			}
			options._ = $.extend({}, Options.appDefaults.Number, options._); 
			Number.superclass.initialize.call(this, input, options);
			this._init();
		},
		/**
		 * 初始化
		 */
		_init: function(){
			var s = this.setting
				,us = this.customSetting;
			if(s.formatter == 'chinese'){
				if(us.prefix === undefined){
					s.prefix = '';
				}
				if(us.suffix === undefined){
					s.suffix = '';
				}
				if(us.precision === undefined){
					s.precision = 2;
				}
			}else if(this.setting.formatter == 'thousand'){
				if(us.precision === undefined){
					s.precision = 2;
				}
			}
			this._editable();
			this._registEvents();
			var val = this.getValue();
			if(val != ''){
				var text = this._formatValue(val); 
				this.setText(text);
			}
		},
		/**
		 * 覆盖父类的绑定方法
		 */
		_textChangeEvent: function(){},
		/**
		 * 获取数值框的数值
		 * @returns {Number} Number 隐藏值
		 * @example alert('隐藏值:' + $('#demo').number('getNumber'));
		 * @memberof number-class
		 * @instance
		 */
		getNumber: function(){
			return parseFloat(this.$input.val());
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 设置金额
		 * @param {Number} val 金额
		 * @param {boolean} [noTrigger] 是否触发change
		 * @see textbox-class#setValue
		 * @todo 设置隐藏值，并根据隐藏值尝试设置显示值
		 * @example $('#demo').number('setValue',123.1);
		 * @memberof number-class
		 * @instance
		 */
		setValue: function(val, noTrigger){
			if(typeof(val) == 'string' && val == ''){
				this.setText('');
				this._setValue('', noTrigger);
				return;
			}
			var value = this._parseNumber(val);
			if(!isNaN(value)){
				if(this.setting.min !== null && value < this.setting.min){
					this.setValue(this.getValue(), true);
					return;
				}
				if(this.setting.max !== null && value > this.setting.max){
					this.setValue(this.getValue(), true);
					return;
				}
				var text = this._formatValue(value);
				this.setText(text);
				if(value == 0 && this.setting.zeroIsNull){
					value = '';
				}
				this._setValue(value, noTrigger);
			}else{
				this.setText('');
				this._setValue('', true);
			}
		},
		/**
		 * 字符串转为数值
		 * @param val
		 * @returns {Number} [valid] 如果格式化无法转为数值，则返回undefined
		 */
		_parseNumber: function(val){
			if(isNaN(val)){
				if(val){
					val = val.replaceAll(',','');
					if(isNaN(val)){
						return;
					}
				}else{
					return;
				}
			}
			var s = this.setting
				,valStr = new String(val);
			if(s.varlen){
				var r = valStr.split('.')[1];
				if(r && r.length > s.precision){
					return parseFloat(valStr).toFixed(s.precision);
				}else{
					return parseFloat(valStr);
				}
			}else{
				return parseFloat(valStr).toFixed(s.precision);
			}
		},
		/**
		 * 格式化显示值
		 * @param {Number} val
		 * @returns {String} result
		 */
		_formatValue: function(val){
			if(val == 0 && this.setting.zeroIsNull){
				return '';
			}
			var s = this.setting
				,format = s.formatter
				,result = val;
			if(!format){
				result = this._parseNumber(val);
			}else if($.isFunction(format)){
				result = format(val);
			}else if(typeof(format) == 'string'){
				if(format == 'chinese'){
					result = Utils.formatChinese(val);
				}else if(format == 'thousand'){
					result = Utils.formatNumber(val, s.precision);
				}
			}
			if(s.prefix){
				result = s.prefix + result;
			}
			if(s.suffix){
				result = result + s.suffix;
			}
			return result;
		},
		/**
		 * 注册控件事件
		 */
		_registEvents: function(){
			var number = this;
			this.$text.on('blur.number.api',function(e){
				number.setValue(this.value);
			});
			this.$text.on('focus.number.api',function(e){
				this.value = number.getValue();
				if(this.value == 0 && number.setting.zeroIsNull){
					this.value = '';
				}else{
					this.select();
				}
			});
		}
	});
	$.fn.number = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'number';
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
					component = new Number(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};

	return Number;
});