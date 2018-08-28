/**
 * 下拉面板控件--继承Textbox
 * @author Mr.T
 */
define(['app/core/app-base', 'app/core/app-jquery', 'app/core/app-core', 'app/core/app-options',
        'app/data/app-ajax'], function(Base, $, App, Options, AppAjax) {

	'use strict';
	
	/**
	 * @abstract
	 * @class 
	 * @classdesc 复选框
	 * @name checkbox-class
	 * @desc 复选框的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 */
	var Checkbox = Base.extend({
		initialize: function(input, options) {
			this.$input = $(input);
			if(!options){
				options = {};
			}
			this.options = options; 
			this.setting = $.extend({}, Options.appDefaults.Checkbox, App.getAttrFromElement(this.$input), this.options);
			this._init();
		},
		_init: function(){
			this._initOptions();
			this._wrapDiv();
			this._initData();
			this._registEvent();
			if($.isFunction(this.setting.onClick)){
				this.on('onClick', this.setting.onClick);
			}
			if(this.setting.disabled){
				this.disable();
			}
		},
		_initOptions: function(){
			if(this.setting.id == undefined){
				this.setting.id = App.uuid();
			}
			if(this.setting.name == undefined){
				this.setting.name = App.uuid();
			}
		},
		_initData: function(){
			if(this.setting.data){
				this._render$Node(this.setting.data);
			}else{
				this.reload();
			}
		},
		_registEvent: function(){
			var that = this;
			this.$element.on('click.checkbox.api', 'input[type=checkbox]', function(e){
				var checkedLen = parseInt(that.setting.checkedLen);
				if(checkedLen == 1){
					that.$element.find('input[type=checkbox]').prop('checked', false);
					$(this).prop('checked', true);
				}else if(checkedLen > 1){
					/**
					 * 点击复选框时触发
					 * @event checkbox-class#onClick
					 * @param {e} e 点击事件
					 */
					var checked = this.checked;
					if(checked && $.isNumeric(that.setting.checkedLen)){//控制最多可选中项数量
						var val = that.getValue();
						if(val && val.split(',').length > that.setting.checkedLen){//超过数据,不选中且不触发onClick
							$(this).prop("checked", false);
							return;
						}
					}
				}
				that.trigger('onClick', e);
			});
		},
		/**
		 * 获取被勾选的项的隐藏值
		 * @returns {Array} result 数组
		 * @example $('#demo').checkbox('getValue');
		 * @memberof checkbox-class
		 * @instance
		 */
		getValue: function(){
			var $node =  this.$element.find('input:checked')
				,vs = [];
			$node.each(function(){
				vs.push(this.value);				
			});
			return vs.join(',');
		},
		/**
		 * 设置勾选的项
		 * @example $('#demo').checkbox('setValue', 1,2);
		 * @example $('#demo').checkbox('setValue', [1,2]);
		 * @memberof checkbox-class
		 * @instance
		 */
		setValue: function(vals){
			if(!$.isArray(vals)){
				if(typeof(vals) == 'string'){
					vals = vals.split(',');
				}else{
					vals = '' + vals;
				}
			}
			this.clearValue();
			for(var i = 0; i < vals.length; i++){
				this.$element.find('input[value="' + vals[i] + '"]').prop('checked', true);
			}
		},
		setText: function(){
		},
		focus: function(){
		},
		/**
		 * 获取被勾选项的显示值
		 * @returns {Array} result 数组
		 * @example $('#demo').checkbox('getValue');
		 * @memberof checkbox-class
		 * @instance
		 */
		getText: function(){
			if($.isFunction(this.setting.textFormatter)){
				var value = this.getValue();
				return this.setting.textFormatter(value);
			}else{
				var $node =  this.$element.find('input:checked')
					,vs = [];
				$node.each(function(){
					vs.push($(this).attr('title'));				
				});
				return vs.join(',');
			}
		},
		/**
		 * 重新载入选择项数据
		 * @example $('#demo').checkbox('reload');
		 * @example $('#demo').checkbox('reload', 'a.do');
		 * @example $('#demo').checkbox('reload', [{id:'1',name:'石山水'},{id:'12',name:'凤飞飞'}]);
		 * @memberof checkbox-class
		 * @instance
		 */
		reload: function(option){
			if($.isArray(option)){
				this.loadData(option);
				return;
			}
			if(option){
				this.setting.url = option;
			}else if(!this.setting.url){
				return;
			}
			var that = this;
			AppAjax.ajaxCall({
				url: this.setting.url,
				dataType: 'json',
				type: 'POST',
				success: function(data){
					that.setting.data = data;
					that.$element.find('.checkboxDiv').remove();
					that._render$Node(data);
				}
			});	
		},
		/**
		 * 载入选择项数据
		 * @example $('#demo').checkbox('loadData', [{id:'1',name:'石山水'},{id:'12',name:'凤飞飞'}]);
		 * @memberof checkbox-class
		 * @instance
		 */
		loadData: function(data){
			this.$element.find('.checkboxDiv').remove();
			this._render$Node(data);
		},
		/**
		 * 禁用组件
		 * @todo 使用一个遮罩将组件屏蔽住
		 * @example $('#demo').checkbox('disable');
		 * @memberof checkbox-class
		 * @instance
		 */
		disable: function(){
			if(this.$disabledMask == undefined){
				this.$disabledMask = $('<div class="wrapper-disabled-mask"></div>');
				this.$element.append(this.$disabledMask);
			}else{
				this.$disabledMask.show();
			}
			this.$element.addClass('wrapper-disabled');
		},
		/**
		 * 启用组件
		 * @todo 将遮罩移除
		 * @example $('#demo').checkbox('enable');
		 * @memberof checkbox-class
		 * @instance
		 */
		enable: function(){
			if(this.$disabledMask){
				this.$disabledMask.hide();
			}
			this.$element.removeClass('wrapper-disabled');
		},
		/**
		 * 切换可用状态
		 * @memberof checkbox-class
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
		 * 清除值
		 * @todo 清除显示值
		 * @todo 清除隐藏值
		 * @example $('#demo').checkbox('clearValue');
		 * @memberof checkbox-class
		 * @instance
		 */
		clearValue: function(){
			this.$element.find('input:checked').prop('checked', false);
		},
		_wrapDiv: function(){
			this.$input.css('display', 'none');
			this.$input.wrap('<div class="multipleboxDiv ' + this.setting.orient + '" style="' + this.setting.style + '"></div>');
			this.$element = this.$input.parent();
		},
		_render$Node: function(data){
			var nodesHtml = ''
				,id = this.setting.id
				,name = this.setting.name
				,vf = this.setting.valuefield
				,tf = this.setting.textfield;
			for (var i = 0; i < data.length; i++) {
				var node = data[i];
				nodesHtml += '<div class="checkboxDiv">' +
								'<input type="checkbox"' +
									'id="' + id + i + '"' +
									'name="' + id + '"' +
									'value="' + node[vf] + '"' + 
									'title="' + node[tf] + '"' +
									(node.checked ? 'checked="true"' : '') + 
								'/>' + 
								'<label for="' + id + i + '">' + node[tf] + '</label>' +
							'</div>';
			}
			this.$element.append($(nodesHtml));
		}
	});
	$.fn.checkbox = function(option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'checkbox';
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
					component = new Checkbox(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};

	$.fn.checkbox.Constructor = Checkbox;
	return Checkbox;
});