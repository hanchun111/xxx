/**
 * 进度条控件
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/core/app-options'], function($, App, Options) {
	
	'use strict';
	/**
	 * @class 
	 * @classdesc 进度条
	 * @name progressbar
	 * @desc 进度条的初始化方法
	 * @param {input} input 要渲染的input组件
	 * @param {object} options 组件的选项设置 
	 * @author Mr.T
	 */
	var ProgressBar = function (input, options) {
		this.$input = $(input).css('display','none');
		this.options = options;
		this._init();
		
	};
	ProgressBar.prototype = {
		constructor: ProgressBar,
		/**
		 * 初始化
		 */
		_init: function(){
			this._initOptions();
			this._wrapper();
		},
		_wrapper: function(){
			var s = this.setting
				,percent = this.getPercent()
				,perExp = '';
			if(parseInt(s.height) > 16){
				perExp = '<span style="color:' + s.color + ';">' + percent + '%</span>';
			}
			this.$element = $('<div style="width:' + s.width + ';height:' + s.height + ';" class="app-progressbar ' 
										+ (s.striped ? 'activebar stripedbar' : '') + '">' +
								'<div style="width: ' + percent + '%;background-color:' + s['background-color'] 
									+ ';"></div>' +	perExp +
				 			'</div>').insertAfter(this.$input);
		},
		/**
		 * 初始化配置
		 */
		_initOptions: function(){
			var attrs = {}
				,ia = this.$input[0].attributes;
			if(ia){
				// 继承html的原有属性
				$.each(ia, function(i, att){
					if(att.value == 'true'){
						attrs[att.name] = true;
					}else if(att.value == 'false'){
						attrs[att.name] = false;
					}else{
						attrs[att.name] = att.value;
					}
				});
			}
			var s = this.setting = $.extend({}, Options.appDefaults.progressbar, attrs, this.options);
			s.value = parseInt(s.value);
			s.max = parseInt(s.max);
		},
		/**
		 * 获取进度百分比保留两位小数=当前值/最大值 * 100
		 * @return {Number} number 组件的进度
		 * @example $('#demo').progressbar('getPercent');
		 * @memberof progressbar
		 * @instance
		 */
		getPercent: function(){
			return (this.setting.value / this.setting.max * 100).toFixed(2);
		},
		/**
		 * 设置值
		 * @param val
		 */
		_setValue: function(val){
			this.setting.value = val;
			var percent = this.getPercent()+'%';
			this.$element.find('>div').css('width',percent);
			this.$element.find('>span').html(percent);
		},
		/**
		 * 设置进度值
		 * @param {Number} val 组件的进度
		 * @example $('#demo').progressbar('setValue', 15);
		 * @memberof progressbar
		 * @instance
		 */
		setValue: function(val){
			var s = this.setting;
			if(isNaN(val)){
				return;
			}
			if(val < 0){
				val = 0;
			}
			if(val > s.max){
				val = s.max;
			}
			this._setValue(val);
		},
		/**
		 * 开始动画
		 * @example $('#demo').progressbar('active');
		 * @memberof progressbar
		 * @instance
		 */
		active: function(){
			this.$element.addClass('activebar');
		},
		/**
		 * 停止动画
		 * @example $('#demo').progressbar('unactive');
		 * @memberof progressbar
		 * @instance
		 */
		unactive: function(){
			this.$element.removeClass('activebar');
		},
		/**
		 * 获取当前进度
		 * @returns {Number} number 当前进度值
		 * @example $('#demo').progressbar('getValue');
		 * @memberof progressbar
		 * @instance
		 */
		getValue: function(){
			return this.setting.value;
		},
		/**
		 * 设置最大的进度值
		 * @param {Number} max 最大的进度值
		 * @example $('#demo').progressbar('setMax', 200);
		 * @memberof progressbar
		 * @instance
		 */
		setMax: function(max){
			if(!isNaN(max) && max > 0){
				this.setting.max = max;
				this.setValue(this.setting.value);
			}
		},
		/**
		 * 获取最大的进度值
		 * @return {Number} max 最大的进度值
		 * @example $('#demo').progressbar('getMax');
		 * @memberof progressbar
		 * @instance
		 */
		getMax: function(){
			return this.setting.max;
		},
		destroy: function(){
			
		}
	};
	$.fn.progressbar = function (option, value) {
		var methodReturn = undefined;
		this.each(function () {
			var $this = $(this)
				,data = $this.data('progressbar')
				,options = typeof option === 'object' && option;
			if (!data) $this.data('progressbar', (data = new ProgressBar(this, options)));
			if (typeof option === 'string') methodReturn = data[option](value);
		});
		return methodReturn;
	};

	$.fn.progressbar.Constructor = ProgressBar;
	return ProgressBar;
});