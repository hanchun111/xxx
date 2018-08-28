/**
 * 日期本地化初始化方法
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', localeFile, 'app/widgets/form/app-textbox',
        'app/util/app-utils','app/core/app-options', 'app/widgets/drag/app-droppanel', 'bootstrap/bootstrap-datetimepicker'],
        function($, App, AppLang, Textbox, Utils, Options, Expandable){
	
	'use strict';

	/**
	 * @class 
	 * @classdesc 日期时间框
	 * <span class="type-signature static">extend</span>textbox
	 * @see {@link textbox-class} datetime继承至textbox
	 * @name datetime-class
	 * @desc 日期时间框的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 */
	var Datetime = Textbox.extend({
		Implements: Expandable,
		initialize: function(input, options) {
			if(!options){
				options = {};
			}
			options._ = $.extend({}, Options.appDefaults.Combo, Options.appDefaults.DateTime);
			Datetime.superclass.initialize.call(this, input, options);
			var that = this;
			setTimeout(function(){
				that._init();
				if(that.tempStartDate){
                    that.datetimepicker.setStartDate(that.tempStartDate);
                    delete that.tempStartDate;
                }
                if(that.tempEndDate){
                    that.datetimepicker.setEndDate(that.tempEndDate);
                    delete that.tempEndDate;
                }
                if(that.tempValue){
                    that.setValue(that.tempValue, that.tempNoTrigger);
                    delete that.tempValue;
                    delete that.tempNoTrigger;
                }
                if(that.tempDate){
                    that.setDate(that.tempDate);
                    delete that.tempDate;
                }
			}, 1);
		},
		/**
		 * 初始化
		 */
		_init: function(){
			if(this.setting.onlySelect){
				this._editable(false);
			}
			this._translator();
			this._setType();
			this.setting._datetime = this;
			this.$text.datetimepicker(this.setting);
			this.datetimepicker = this.$text.data('datetimepicker');
			this.datetimepicker._datetime = this;
			this.$dropPanel = this.datetimepicker.picker;
			this.$dropPanel.on('mousedown.datetime.api',function (e){e.stopPropagation();});
			this.$dropPanel.on('click.datetime.api', $.proxy(this.focus, this));
			if(!this.setting.custom){
				this.setting.custom = this.$input.getJsonAttr('custom');
			}
			this._initDateRange();
			if(this.setting.value){
				this.setValue(this.setting.value, true);
			}
			
			this._onPanelFadeOut();
		},
		/**
		 * 根据类型更改默认属性
		 */
		_setType: function(){
			var c = this.customSetting
				,s = this.setting;
			switch (s.type) {
			case 'year':
				s.startView = 4;
				s.minView = 4;
				s.format = 'yyyy';
				s.todayBtn = false;
				break;
			case 'year-month':
				if(!c.startView){
					s.startView = 3;
				}
				s.minView = 3;
				if(!c.format){
					s.format = 'yyyy-mm';
				}
				s.todayBtn = false;
				break;
			case 'month':
				s.startView = 3;
				s.minView = 3;
				s.format = 'mm';
				s.todayBtn = false;
				break;
			case 'date':
				if(!c.startView){
					s.startView = 2;
				}
				s.minView = 2;
				if(!c.format){
					s.format = 'yyyy-mm-dd';
				}
				break;
			case 'datetime':
				if(!c.startView){
					s.startView = 2;
				}
				s.minView = 0;
				if(!c.format){
					s.format = 'yyyy-mm-dd hh:ii';
				}
				break;
			case 'hour-minute':
				if(!c.startView){
					s.startView = 1;
				}
				s.minView = 0;
				if(!c.format){
					s.format = 'hh:ii';
				}
				s.todayBtn = false;
				break;
			case 'hour':
				if(!c.startView){
					s.startView = 1;
				}
				s.minView = 1;
				if(!c.format){
					s.format = 'hh';
				}
				s.todayBtn = false;
				break;
			case 'minute':
				if(!c.startView){
					s.startView = 0;
				}
				s.minView = 0;
				if(!c.format){
					s.format = 'ii';
				}
				s.todayBtn = false;
				break;
			default:
				break;
			}
		},
		/**
		 * 将属性翻译为datetimepicker的属性
		 */
		_translator: function(){
			var s = this.setting;
			if(s['weekstart'] != null){
				s.weekStart = s['weekstart'];
			}
			if(s['todaybtn'] != null){
				s.todayBtn = s['todaybtn'];
			}
			if(s['todayhighlight'] != null){
				s.todayHighlight = s['todayhighlight'];
			}
			if(s['startview'] != null){
				s.startView = parseFloat(s['startview']);
			}
			if(s['minview'] != null){
				s.minView = parseFloat(s['minview']);
			}
			if(s['forceparse'] != null){
				s.forceParse = s['forceparse'];
			}
			if(s['minutestep'] != null){
				s.minuteStep = s['minutestep'];
			}
			if(s['pickerposition'] != null){
				s.pickerPosition = s['pickerposition'];
			}
		},
		/**
		 * 初始化日期范围选择
		 */
		_initDateRange: function(){
			var begin = this.setting['datebegin']
				,end = this.setting['dateend'];
			if(begin || end){
				this.$rangeBtn = $('<a class="wrapper-btn wrapper-range" tabindex="-1"><i></i></a>');
				this.$openBtn.addClass('wrapper-date');
				this.$rangeBtn.insertBefore(this.$openBtn);
				var custom = this.setting.custom;
				if(custom && custom.onlyCustom){
					this.$dateRange = $('<div class="drop-panel"><ul class="date-range">' +
							this._getCustomRangeHtml() +
					'</ul></div>').appendTo($.$appPanelContainer);
					
				}else{
					this.$dateRange = $('<div class="drop-panel"><ul class="date-range">' +
							'<li>昨天</li>' +
							'<li>上月</li>' +
							'<li>去年</li>' +
							'<li>当天</li>' +
							'<li>本月</li>' +
							'<li>本季</li>' +
							'<li>本年</li>' +
							this._getCustomRangeHtml() +
					'</ul></div>').appendTo($.$appPanelContainer);
				}
				var that = this;
				this.$rangeBtn.on('click.datetime.api',function(e){
					that.toggleDateRange();
				});
				this.$dateRange.on('click.datetime-range.api', 'li', $.proxy(this._rangeClick,this));
				this.$dateRange.on('click.datetime-range.api', function(e){e.stopPropagation();});
				if(!this.setting.fadeout){
	            	return;
	            }
				this.$dateRange.on('mouseleave.datetime-range.api', $.proxy(this._fadeOut$DateRange, this));
				this.$dateRange.on('mouseenter.datetime-range.api', $.proxy(this._fadeIn$DateRange, this));
				this.$element.on('mouseout.datetime-range.api', $.proxy(this._fadeOut$DateRange, this));
				this.$element.on('mouseover.datetime-range.api', $.proxy(this._fadeIn$DateRange, this));
			}
		},
		/**
		 * 渐渐隐藏
		 */
		_fadeOut$DateRange: function(){
			if(!this.$dateRange.is(':visible')){
				return;
			}
			var opacity = 10
				,that = this;
			this._hideTimer1 = setInterval(function(){
				opacity -= 1;
				that.$dateRange.css('opacity', 0.1*opacity);
				if(opacity == 0){
					clearInterval(that._hideTimer1);
					that._hideRange();
					that.$dateRange.css('opacity', 1);
				}
			}, 130);
		},
		/**
		 * 停止渐渐隐藏 并显示
		 */
		_fadeIn$DateRange: function(){
			this.$dateRange.css('opacity', 1)
			clearInterval(this._hideTimer1);
		},
		/**
		 * 获取自定义日期
		 */
		_getCustomRangeHtml: function(){
			var custom = this.setting.custom
				,result = '';
			if(custom){
				result +=  '<div/>';
				this.customHander = custom.handle;
				var arr = custom.text.split(',');
				for ( var i = 0; i < arr.length; i++) {
					result += '<li>' + arr[i] + '</li>';
				}
			}
			return result;
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 设置隐藏值，根据隐藏值格式化函数格式化隐藏值
		 * @param {String} val 隐藏值
		 * @see textbox-class#setValue
		 * @todo 当隐藏值为空时，显示值也为空
		 * @example $('#demo').datetime('setValue','20151212');
		 * @memberof datetime-class
		 * @instance
		 */
		setValue: function(val, noTrigger){
			val = $.trim(val);
			if(!val){
				this.setText('');
				this._setValue('', noTrigger);
				return;
			}
			var text = val
				,value = val;
			var picker = this.datetimepicker;
			if(picker){
				var DPGlobal = $.fn.datetimepicker.DPGlobal;
				picker._setDateConvenient(val);
				var text = picker.getFormattedDate()
					,value = text;
				if(this.setting.valueFormat){
					var vf = DPGlobal.parseFormat(this.setting.valueFormat, picker.formatType);
					value = picker.getFormattedDate(vf);
				}
				
			}else{
                this.tempValue = val;
                this.tempNoTrigger = noTrigger;
                noTrigger = true;
			}
			this.setText(text);
			this._setValue(value, noTrigger);
		},
		/**
		 * 设置一个日期 
		 * @param {Date} date 设置的日期
		 * @todo 判断为日期类型，则设置日期
		 * @example $('#demo').datetime('setDate',new Date());
		 * @memberof datetime-class
		 * @instance
		 */
		setDate: function(date){
			if(date instanceof Date){
				if(this.datetimepicker){
					this.datetimepicker.viewDate = date;
					this.datetimepicker.setValue();
				}else{
                    this.tempDate = date;
                }
			}else{
				throw new Error('请设置日期对象');
			}
		},
		/**
		 * 显示或隐藏日期面板，该方法已绑定在组件的右边按钮中
		 * @todo 判断当前面板是否可见：
		 * @todo 1如果不可见，调用showPanel
		 * @todo 2如果可见，则关闭面板
		 * @example $('#demo').datetime('togglePanel');
		 * @memberof datetime-class
		 * @instance
		 */
		togglePanel: function(){
			if(this._mainDivIsVisiable()){
				this.hidePanel();
			}else{
				this.showPanel();
			}
		},
		/**
		 * 显示组件的日期时间面板
		 * @todo 判断当前面板是否可见：
		 * @todo 1如果不可见，调用showPanel
		 * @todo 2如果可见，则关闭面板
		 * @example $('#demo').datetime('showPanel');
		 * @memberof datetime-class
		 * @instance
		 */
		showPanel: function(){
			this._closeVisiblePanel();
			this.datetimepicker.show();
			$(document).on('mousedown.droppanel.api', $.proxy(this.hidePanel,this));
			limitDate(this);
		},
		/**
		 * 关闭组件的日期时间面板
		 * @example $('#demo').datetime('hidePanel');
		 * @memberof datetime-class
		 * @instance
		 */
		hidePanel: function(){
			this.datetimepicker.hide();
			$(document).off('mousedown.droppanel.api');
			limitDate(this);
		},
		/**
		 * 显示或关闭日期范围选择面板
		 * @todo 关闭其他显示的下拉面板
		 * @example $('#demo').datetime('toggleDateRange');
		 * @memberof datetime-class
		 * @instance
		 */
		toggleDateRange: function(){
			if(!this.$dateRange.is(':visible')){
				this._showRange();
			}else{
				this._hideRange();
			}
		},
		/**
		 * 显示时间范围选择面板
		 */
		_showRange: function(){
			this._closeVisiblePanel();
			var mainCss = {
					top: this._getDropPanelTop(this.$dateRange),
					left: this.$element.outerWidth() + this.$element.offset().left - this.$dateRange.outerWidth(),
					display: 'block'
				};
			mainCss['z-index'] = Options.zindexs.droppanel++;
			this.$dateRange.css(mainCss);
			$(document).on('click.date-range.api', $.proxy(this._hideRange,this));
		},
		/**
		 * 隐藏时间范围选择面板
		 */
		_hideRange: function(){
			this.$dateRange.hide();
			$(document).off('click.date-range.api');
		},
		/**
		 * 日期范围点击事件
		 */
		_rangeClick: function(e){
			var begin = this.setting['datebegin']
				,end = this.setting['dateend']
				,text = e.currentTarget.innerText
				,today = new Date()
				,range = undefined;
			if(!this._dateBegin){
				if(begin){
					this._dateBegin = $A('#' + begin).data('datetime');
					this._dateEnd = this;
				}else{
					this._dateBegin = this;
					this._dateEnd = $A('#' + end).data('datetime');
				}
			}
			var custom = this.setting.custom;
			if(custom && custom.onlyCustom){
				range = this.customHander(text);
			}else{
				switch (text) {
				case '昨天':
					var yesterday = new Date(today.setDate(today.getDate() - 1));
					range = {begin:today,end:yesterday};
					break;
				case '上月':
					var lastMonth = new Date(today.setMonth(today.getMonth() - 1));
					range = Utils.getMonthRange(lastMonth);
					break;
				case '去年':
					var lastYear= today.getFullYear() - 1;
					range = Utils.getYearRange(lastYear);
					break;
				case '当天':
					range = {begin:today,end:today};
					break;
				case '本月':
					var currentMonth = new Date(today.setMonth(today.getMonth()));
					range = Utils.getMonthRange(currentMonth);
					break;
				case '本季':
					range = Utils.getSeasonRange(today);
					break;
				case '本年':
					var currentYear= today.getFullYear();
					range = Utils.getYearRange(currentYear);
					break;
				default:
					range = this.customHander(text);
					break;
				}
			}
			this._hideRange();
			range.begin.setHours(8);
			range.end.setHours(8);
			this._dateBegin.setDate(range.begin);
			if(this._dateEnd){
				this._dateEnd.setDate(range.end);
			}
		},
		/**
		 * 设置最小日期值
		 * @example $('#demo').datetime('setStartDate', new Date());
		 * @memberof datetime-class
		 * @instance
		 */
		setStartDate: function(startDate, force){
			var val = '';
			if(force){
				val = startDate;
				this.setting.startDate = startDate;
			}else{
				if(startDate){
					val = startDate;
				}else{
					val = this.setting.startDate;
				}
			}
			if(this.datetimepicker){
            	this.datetimepicker.setStartDate(val);
            }else{
                this.tempStartDate = startDate;
            }
		},
		/**
		 * 设置最大日期值
		 * @example $('#demo').datetime('setEndDate', new Date());
		 * @memberof datetime-class
		 * @instance
		 */
		setEndDate: function(endDate, force){
			var val = '';
			if(force){
				val = endDate;
				this.setting.endDate = endDate;
			}else{
				if(endDate){
					val = endDate;
				}else{
					val = this.setting.endDate;
				}
			}
			if(this.datetimepicker){
            	this.datetimepicker.setEndDate(val);
            }else{
                this.tempEndDate = val;
            }
		},
		destroy: function(){
			if(this.$dropPanel){
				this.$dropPanel.remove();
			}
			if(this.$dateRange){
				this.$dateRange.remove();
			}
			this.$element.remove();
			this.$input.removeData('datetime');
		}	
	});
	$.fn.datetime = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'datetime';
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
					component = new Datetime(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};
	$.fn.datetimepicker.dates[AppLang.locale] = AppLang.datetimepicker;
	/**
	 * DatetimePicker对象
	 * @namespace DatetimePicker
	 */

	var exDpPrototype = {
		_attachEvents: function () {
			this._detachEvents();
			if (this.isInput) {
				this._events = [
					[this.element, {
						//单控件下 禁止聚焦时 展开面板事件 Mr.T
//						focus:   $.proxy(this.show, this),
						keyup:   $.proxy(this.update, this),
						keydown: $.proxy(this.keydown, this),
						blur:  $.proxy(this._myblur, this)//焦点失去事件 Mr.T
					}]
				];
			}
			else if (this.component && this.hasInput) { // component: input + button
				this._events = [
					// For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
						focus:   $.proxy(this.show, this),
						keyup:   $.proxy(this.update, this),
						keydown: $.proxy(this.keydown, this)
					}],
					[this.component, {
						click: $.proxy(this.show, this)
					}]
				];
				if (this.componentReset) {
					this._events.push([
						this.componentReset,
						{click: $.proxy(this.reset, this)}
					]);
				}
			}
			else if (this.element.is('div')) {  // inline datetimepicker
				this.isInline = true;
			}
			else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			for (var i = 0, el, ev; i < this._events.length; i++) {
				el = this._events[i][0];
				ev = this._events[i][1];
				el.on(ev);
			}
		},
		/** 
		 * 重写设置值的方法
		 * <PRE>
		 * 当设置值的时候，有存在_datetime的属性，则调用datetime.setValue(formatted)进行赋值
		 * </PRE>
		 * @memberof DatetimePicker
		 * @function setValue
		 */
		setValue: function () {
//			var formatted = this.getFormattedDate();
			//使用视图日期代替控件原日期设置值
			var formatted = $.fn.datetimepicker.DPGlobal.formatDate(this.viewDate, this.format, this.language, this.formatType);
			if (!this.isInput) {
				if (this.component) {
					this.element.find('input').val(formatted);
				}
				this.element.data('date', formatted);
			} else {
				this.element.val(formatted);
				if(this._datetime){
					this._datetime.setValue(formatted);
				}
			}
			if (this.linkField) {
				$('#' + this.linkField).val(this.getFormattedDate(this.linkFormat));
			}
		},
		/** 
		 * 重写弹出框的位置方法
		 * <PRE>
		 * 每次弹出框都计算下弹出框的位置
		 * </PRE>
		 * @memberof DatetimePicker
		 * @function place
		 */
		place: function () {
			if (this.isInline) return;

			/**
			 * 显示日期时间面板
			 * 1、计算本身加面板高度是否大于当前的body的高度
			 * 2、不大于则下拉，否则上拉
			 */
			var dropDown = Expandable.prototype._isDropPanelUpside(this.element,this.picker);
			if(dropDown){
				this.pickerPosition = 'bottom-left';
			}else{
				this.pickerPosition = 'top-left';
			}
			
//			var index_highest = 0;
//			$('div').each(function () {
//				var index_current = parseFloat($(this).css("zIndex"), 10);
//				if (index_current > index_highest) {
//					index_highest = index_current;
//				}
//			});
//			var zIndex = index_highest + 10;
			//使用已管理的zindexs代替动态计算  2015年1月6日17:15:28 Mr.T
			var zIndex = Options.zindexs.droppanel++;
			var offset, top, left;
			if (this.component) {
				offset = this.component.offset();
				left = offset.left;
				if (this.pickerPosition == 'bottom-left' || this.pickerPosition == 'top-left') {
					left += this.component.outerWidth() - this.picker.outerWidth();
				}
			} else {
				offset = this.element.offset();
				left = offset.left;
			}
			if (this.pickerPosition == 'top-left' || this.pickerPosition == 'top-right') {
				top = offset.top - this.picker.outerHeight();
			} else {
				top = offset.top + this.height;
			}
			this.picker.css({
				top:    top,
				left:   left,
				zIndex: zIndex
			});
		},
		/** 
		 * 重写按键事件方法
		 * <PRE>
		 * 对简单字符的输入进行日期格式化
		 * </PRE>
		 * @memberof DatetimePicker
		 * @function keydown
		 */
		keydown: function (e) {
			var keyCode = e.keyCode;
			if(this._datetime._dealSysKey(e)){
				return;
			}
			if (this.picker.is(':not(:visible)')) {
				//按键操作打开面板 Mr.T2014年11月21日17:50:19
				if(keyCode >= 48 && keyCode <= 57){
					this._datetime.showPanel();
				}else if(keyCode >= 96 && keyCode <= 105){//小键盘数字
					this._datetime.showPanel();
				}else if(App.containKeyCode(e, this._datetime.setting.keyShowPanel)){
					this._datetime.showPanel();
					e.stopPropagation();
				}else if($.inArray(keyCode, [App.keyCode.LEFT, App.keyCode.RIGHT, App.keyCode.UP, App.keyCode.DOWN]) != -1){
					
				}else if(keyCode == App.keyCode.DELETE 
						|| keyCode == App.keyCode.BACKSPACE){
					if(!this._datetime._isEditable()){
						this._datetime.clearValue();
					}
				}else if((keyCode == 67 || keyCode == 86)// ctrl+C, ctrl+V
						&& e.ctrlKey == true){
					
				}else{
					e.preventDefault();
				}
				return;
			}
			var dateChanged = false,
				dir, viewMode,
				newDate = '', newViewDate = '';
			switch (keyCode) {
				case App.keyCode.ESC: // escape
					//关闭前 先设置日期
					this._setDateConvenient();
					this.hide();
					e.preventDefault();
					break;
				case App.keyCode.LEFT: // left
				case App.keyCode.RIGHT: // right
					if (!this.keyboardNavigation) break;
					dir = keyCode == 37 ? -1 : 1;
					viewMode = this.viewMode;
					if (e.ctrlKey) {
						viewMode += 2;
					} else if (e.shiftKey) {
						viewMode += 1;
					}
					if (viewMode == 4) {
						newDate = this.moveYear(this.date, dir);
						newViewDate = this.moveYear(this.viewDate, dir);
					} else if (viewMode == 3) {
						newDate = this.moveMonth(this.date, dir);
						newViewDate = this.moveMonth(this.viewDate, dir);
					} else if (viewMode == 2) {
						newDate = this.moveDate(this.date, dir);
						newViewDate = this.moveDate(this.viewDate, dir);
					} else if (viewMode == 1) {
						newDate = this.moveHour(this.date, dir);
						newViewDate = this.moveHour(this.viewDate, dir);
					} else if (viewMode == 0) {
						newDate = this.moveMinute(this.date, dir);
						newViewDate = this.moveMinute(this.viewDate, dir);
					}
					if (this.dateWithinRange(newDate)) {
						this.date = newDate;
						this.viewDate = newViewDate;
						this.setValue();
						this.update();
						e.preventDefault();
						dateChanged = true;
					}
					e.stopPropagation();
					break;
				case App.keyCode.UP: // up
				case App.keyCode.DOWN: // down
					if (!this.keyboardNavigation) break;
					dir = keyCode == 38 ? -1 : 1;
					viewMode = this.viewMode;
					if (e.ctrlKey) {
						viewMode += 2;
					} else if (e.shiftKey) {
						viewMode += 1;
					}
					if (viewMode == 4) {
						newDate = this.moveYear(this.date, dir);
						newViewDate = this.moveYear(this.viewDate, dir);
					} else if (viewMode == 3) {
						newDate = this.moveMonth(this.date, dir);
						newViewDate = this.moveMonth(this.viewDate, dir);
					} else if (viewMode == 2) {
						newDate = this.moveDate(this.date, dir * 7);
						newViewDate = this.moveDate(this.viewDate, dir * 7);
					} else if (viewMode == 1) {
						if (this.showMeridian) {
							newDate = this.moveHour(this.date, dir * 6);
							newViewDate = this.moveHour(this.viewDate, dir * 6);
						} else {
							newDate = this.moveHour(this.date, dir * 4);
							newViewDate = this.moveHour(this.viewDate, dir * 4);
						}
					} else if (viewMode == 0) {
						newDate = this.moveMinute(this.date, dir * 4);
						newViewDate = this.moveMinute(this.viewDate, dir * 4);
					}
					if (this.dateWithinRange(newDate)) {
						this.date = newDate;
						this.viewDate = newViewDate;
						this.setValue();
						this.update();
						e.preventDefault();
						dateChanged = true;
					}
					e.stopPropagation();
					break;
				case App.keyCode.ENTER: // enter
					if (this.viewMode != 0) {
						var oldViewMode = this.viewMode;
						this.showMode(-1);
						this.fill();
						if (oldViewMode == this.viewMode && this.autoclose) {
							//关闭前 先设置日期
							this._setDateConvenient();
							this.hide();
						}
					} else {
						this.fill();
						if (this.autoclose) {
							//关闭前 先设置日期
							this._setDateConvenient();
							this.hide();
						}
					}
					e.preventDefault();
					e.stopPropagation();
					break;
				case App.keyCode.TAB: // tab
					//关闭前 先设置日期
					this._setDateConvenient();
					this.hide();
					break;
			}
			if (dateChanged) {
				var element = undefined;
				if (this.isInput) {
					element = this.element;
				} else if (this.component) {
					element = this.element.find('input');
				}
				if (element) {
					element.change();
				}
				this.element.trigger({
					type: 'changeDate',
					date: this.date
				});
			}
		},
		/**
		 * 失去焦点 重新设置一遍值，清除无效数据
		 */
		_myblur: function(){
			var text = this.element.val();
			if(!text){
				return;
			}
			var textDate = this._parseDate(text)
				,valueDate = this._parseDate(this._datetime.getValue());
			if(textDate && valueDate 
				&& textDate.toString() == valueDate.toString()){
				return;
			}
			if(text == this._datetime.setting.tips){
				return;
			}
			this._setDateConvenient(text);
			this.setValue();
			//修复日期年度月份类型进行格式化时 需要点击两次才能设置值的bug
			//每次视图值会根据显示框的值进行更新 从而导致需要两次点击
//			this.update();
			
		},
		/**
		 * 设置日期值
		 */
		_setDateConvenient: function(text){
			if(text === undefined){
				text = this.element.val();
			}
			if(!this._datetime){
				return;
			}
			if(text == $.trim(this._datetime.setting.tips)){
				return;
			}
			var d = this._parseDate(text);
			if(d){
				this.date = d;
				this.viewDate = d;
			}
		},
		/**
		 * 将字符串类型转换为日期类型
		 */
		_parseDate: function(text){
			text = $.trim(text);
			if(!text){
				return null;
			}
			var date = new Date();
			var infos = this._specialCase(text,date.getFullYear()+'');
			computeDate(date,infos);
			return date;
            /**
             * 将时间按照日期信息进行计算
             * @param date
             * @param obj
             */
            function computeDate(date,obj){
                if(!obj){
                    return;
                }
                if(obj.year && obj.year < 10000){
                    date.setFullYear(obj.year);
                }
                date.setDate(1);
                if(obj.month){
                    date.setMonth(obj.month-1);
                }
                if(obj.date){
                    date.setDate(obj.date);
                }
                if(obj.hours){
                    date.setHours(obj.hours);
                }
                if(obj.minute){
                    date.setMinutes(obj.minute);
                }
                date.setHours(date.getHours() + 8);//组件datetimepicker 使用utc时间输出
            }
		},
		/**
		 * 几种特殊的格式
		 * 1、纯数字格式  yyyymmdd 或 yyyymmddhhii 或大于12位格式的数字截取前12位
		 * 2、用分割符分割后，按分割的数组arr长度
		 * 		一：长度为2，如果arr[1]长度为4，则推断arr[1]为时间（hhii），arr[0]为日期
		 * 					如果分割符为 :，则推断为时间，arr[0]为时，arr[1]为分
		 * 		二：长度为4，如果同时满足arr[0]长度<5，arr[1]长度<3，arr[2]长度<3
		 * 				则推断 arr[0]为年，arr[1]为月，arr[2]为日，arr[3]为时间
		 * 		三：长度为5，如果同时满足arr[0]长度<5，arr[1]长度<3，arr[2]长度<3
		 * 				则推断 arr[0]为年，arr[1]为月，arr[2]为日，arr[3]为时，arr[4]为分
		 */
		_specialCase: function(text,currYear){
			if(!isNaN(text)){//[d+] 纯数字的格式
				return this._getDateInfos(text.substr(0,8),currYear);
			}else{//[*分隔符*] 分割符[可以使用任何非数字]格式
                var rs = {}
                    ,vs = parseArray(text);
                switch (vs.length) {
                case 1:
					return rs;
				case 2://日期+时 或 日期
					var v0 = parseFloat(vs[0])
					,v1 = parseFloat(vs[1]);
					if(isNaN(v0) && !isNaN(v1)){
						rs.date = v1;
					}else if(!isNaN(v0) && isNaN(v1)){
						rs.month = v0;
					}else if(vs[1].length == 4){//[*分隔符XXXX]  日期(X)  + 时间(时+分[hhii])
						$.extend(rs,this._getDateInfos(vs[0].substr(0,8),currYear));
						rs.hours = parseFloat(vs[1].substr(0,2));
						rs.minute = parseFloat(vs[1].substr(2,2));
					}else if(text.indexOf(':') > -1){//[XX:XX] 时+分
						rs.hours = parseFloat(vs[0]);
						rs.minute = parseFloat(vs[1]);
					}else if(vs[0].length == 4){//[XXXX分隔符*] 月日 + 时 或  年(yyyy) + 月
						var v00 = parseFloat(vs[0].substr(0,2))
						,v01 = parseFloat(vs[0].substr(2,2)),
						v1 =  parseFloat(vs[1]);
						if(v00 <= 12 && v01 <= 31 && v1 <= 24){
							rs.month = v00;
							rs.date = v01;
							rs.hours = v1;
						}else if(v1 <= 12){
							rs.year = parseFloat(vs[0]);
							rs.month = v1;
						}
					}else{//[*分隔符*] 月+日
						rs.month = parseFloat(vs[0]);
						rs.date = parseFloat(vs[1]);
					}
					return rs;
				case 3://[*分隔符*分隔符*]年+月+日
					if(vs[0].length <= 4 && vs[1].length <= 2 && vs[2].length <= 2){
						var dateStr = vs[0] +fitZero(vs[1]) + fitZero(vs[2]);
						$.extend(rs,this._getDateInfos(dateStr,currYear));
						return rs;
					}
				case 4://[*分隔符*分隔符*分隔符*] 年+月+日+时
					if(vs[0].length <= 4 && vs[1].length <= 2 && vs[2].length <= 2){
						var dateStr = vs[0] +fitZero(vs[1]) + fitZero(vs[2]);
						$.extend(rs,this._getDateInfos(dateStr,currYear));
						if(vs[3].length <= 2){
							rs.hours = parseFloat(vs[3]);
						}else{
							rs.hours = parseFloat(vs[3].substr(0,2));
							rs.minute = parseFloat(vs[3].substr(2,2));
						}
						return rs;
					}
				default://[*分隔符*分隔符*分隔符*分隔符*] 年+月+日+时+分
					if(vs[0].length <= 4 && vs[1].length <= 2 && vs[2].length <= 2){
						var dateStr = vs[0] +fitZero(vs[1]) + fitZero(vs[2]);
						$.extend(rs,this._getDateInfos(dateStr,currYear));
						rs.hours = parseFloat(vs[3]);
						rs.minute = parseFloat(vs[4]);
						return rs;
					}
				}
			}
            /**
             * 将文本按照非数值进行分割并返回数组
             */
            function parseArray(text){
                var rs = [];
                var temp = '';
                for(var i = 0; i < text.length; i++){
                    if(!isNaN(text[i]) && text[i] != ' '){
                        temp += text[i];
                    }else if($.trim(temp)){
                        rs.push(temp);
                        temp = '';
                    }
                }
                rs.push(temp);
                return rs;
            };
			/**
			 * 如果长度为1，则在前面补一个0
			 */
			function fitZero(t){
				if(t.length == 1)
					return '0' + t;
				return t;
			}
		},
		/**
		 * 根据输入字符串获取日期的年月日准确值
		 */
		_getDateInfos: function(dateStr,currYearStr){
            var format = this._datetime.setting.format;
            if(format == 'i' || format == 'ii'){
                return {minute: parseFloat(dateStr)};
            }else if(format == 'h' || format == 'hh'){
                return {hours: parseFloat(dateStr)};
            }else if(format == 'dd' || format == 'd'){
                return {date: parseFloat(dateStr)};
            }else if(format == 'm' || format == 'mm'){
                return {month: parseFloat(dateStr)};
            }else if(format == 'yyyy'){
                var year = 0
                    ,len = dateStr.length;
                if(len <= 4){
                    year = parseFloat(currYearStr.substr(0,4-len) + dateStr);
                }else{
                    year = parseFloat(dateStr.substr(0,4));
                }
                return {year: year};
            }
            var rs = {}
                ,minView = this._datetime.setting.minView;
            switch (dateStr.length) {
            case 1://d or m
                var x = parseFloat(dateStr);
                if(minView == 3){
                    rs.month = x;
                }else{
                    rs.date = x;
                }
                return rs;
            case 2://dd or mm
                var x = parseFloat(dateStr);
                if(minView == 3){
                    rs.month = x;
                }else{
                    rs.date = x;
                }
                return rs;
			case 3://ymm or mdd
                if(minView == 3){
                    rs.year = parseFloat(currYearStr.substr(0,3) + dateStr.substr(0,1));
                    rs.month = parseFloat(dateStr.substr(1,2));
                }else{
                    rs.month = parseFloat(dateStr.substr(0,1));
                    rs.date = parseFloat(dateStr.substr(1,2));
                }
				return rs;
			case 4://mmdd or yyyy or yymm
                if(parseFloat(dateStr.substr(0,2)) > 12){
					rs.year = parseFloat(dateStr);
                }else{
					var v0 = parseFloat(dateStr.substr(0,2))
					,v1 = parseFloat(dateStr.substr(2,2));
					if(v0 <= 12){
						rs.month = v0;
					}
					if(v1 <= 31){
						rs.date = v1;
					}
				}
				return rs;
			case 5://yyyym
                rs.year = parseFloat(dateStr.substr(0,4));
                rs.month = parseFloat(dateStr.substr(4,1));
				return rs;
			case 6://yyyymm
                rs.year = parseFloat(dateStr.substr(0,4));
                rs.month = parseFloat(dateStr.substr(4,2));
				return rs;
			case 7://yyyymmd
                rs.year = parseFloat(dateStr.substr(0,4));
                rs.month = parseFloat(dateStr.substr(4,2));
                rs.date = parseFloat(dateStr.substr(6,1));
				return rs;
            default://yyyymmdd
				rs.year = parseFloat(dateStr.substr(0,4));
				rs.month = parseFloat(dateStr.substr(4,2));
				rs.date = parseFloat(dateStr.substr(6,2));
				return rs;
			}
		}
	};
	$.extend($.fn.datetimepicker.Constructor.prototype,exDpPrototype);
	return Datetime;
	function limitDate(that){
		var $date = null
			,val = null
			,date = null;
		if(that.setting.datebegin){
			$date = $A('#' + that.setting.datebegin).data('datetime');
			val = $date.getText();
			if(val){
				date = $date.datetimepicker.getDate();
			}
			that.setStartDate(date);
		}else if(that.setting.dateend){
			$date = $A('#' + that.setting.dateend).data('datetime');
			val = $date.getText();
			if(val){
				date = $date.datetimepicker.getDate();
			}
			that.setEndDate(date);
		}
	};
});
