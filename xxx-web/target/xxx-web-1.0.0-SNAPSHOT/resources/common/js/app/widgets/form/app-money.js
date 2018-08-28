/**
 * 金额控件--继承Textbox
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/core/app-options', 'app/widgets/form/app-number',
        'app/util/app-utils'], function($, App, Options, Number, Utils) {
	'use strict';
	
	/**
	 * @class 
	 * @classdesc 金额框
	 * <span class="type-signature static">extend</span>number
	 * @see {@link number-class} money继承至number
	 * @name money-class
	 * @desc 金额框的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @example &lt;input &#9;class="app-money" />
	 * @example $('#demo').money({});
	 */
	var Money = Number.extend({
		initialize: function (input, options) {
			if(!options){
				options = {};
			}
			options._ = Options.appDefaults.Money;
			Money.superclass.initialize.call(this, input, options);
		}	
	});
	$.fn.money = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'money';
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
					component = new Money(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};
	return Money;
});