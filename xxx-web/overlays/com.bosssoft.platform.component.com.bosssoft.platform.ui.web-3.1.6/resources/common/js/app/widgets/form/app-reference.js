/**
 * 引用控件--继承Textbox
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/widgets/window/app-dialog',
        'app/core/app-options', 'app/widgets/form/app-textbox', 'app/widgets/form/app-suggest', 'app/widgets/drag/app-droppanel'],
        function ($, App, Dialog, Options, Textbox, Suggest, Expandable) {
		
	'use strict';

	/**
	 * @class 
	 * @classdesc 引用框
	 * <span class="type-signature static">extend</span>textbox
	 * @see {@link textbox-class} reference继承至textbox
	 * @name reference-class
	 * @desc 引用框的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @example &lt;input &#9;class="app-reference"
	 * &#9;_options="{
	 * &#9;&#9;action: 'html/example/app-input/ui/refDemo.html'
	 * &#9;}"
	 * />
	 * @example $('#demo').reference({
	 * &#9;action: 'html/example/app-input/ui/refDemo.html'
	 * });
	 */
	var Reference = Textbox.extend({
		Implements: Expandable,
		initialize: function(input, options) {
			if(!options){
				options = {};
			}
			options._ = Options.appDefaults.Reference;
			Reference.superclass.initialize.call(this, input, options);
			this._init();
		},
		/**
		 * 初始化
		 */
		_init: function(){
			this._initOptions();
			if(this.setting.usesuggest){
				new Suggest(this.$input, this.options);
			}else{
				if($.isFunction(this.setting.onClickOpen)){
					this.$text.on('click.reference.api', $.proxy(this._mousedown$openBtn, this));
				}
			}
			this._registEvents();
			this.$input.data('context', this);
		},
		/**
		 * 覆盖父类的绑定方法
		 */
		_textChangeEvent: function(){},
		/**
		 * 初始化属性
		 */
		_initOptions: function(){
			if(!this.setting.url){
				this.setting.url = _contextPath + '/ref.do?code=' + this.setting.code;
			}
			if(this.setting.readFields){
				this.setting.readFields = this.setting.readFields.split(',');
			}
			if(this.setting.writeFields){
				this.setting.writeFields = this.setting.writeFields.split(',');
			}
		},
		/**
		 * 注册控件事件
		 */
		_registEvents: function(){
			if(!this.setting.usesuggest){
				this._editable(false);
				this.$text.on('click.reference.api',$.proxy(this.openReference, this));
			}
			this.$openBtn.on('click.reference.api',$.proxy(this.openReference, this));
			if($.isFunction(this.setting.afterClose)){
				this.on('afterClose', this.setting.afterClose);
			}
			if($.isFunction(this.setting.beforeOpenReference)){
				this.on('beforeOpenReference', this.setting.beforeOpenReference);
			}
		},
		/**
		 * 打开参照对话框，该方法已绑定在组件的右边按钮中
		 * @todo 关闭其他显示的下拉框
		 * @example $('#demo').reference('openReference');
		 * @memberof reference-class
		 * @instance
		 */
		openReference: function(){
			if(this.trigger('beforeOpenReference') === false){
				return;
			}
			var that = this
				,s = this.setting;
			var dialogCode = 'reference' + $A.nextId();
			var options = {
				hasheader: s.hasheader,
				width: s.digWidth,
				height: s.digHeight,
				title: s.title,
				src: this.$button,
				url: s.url,
				params: this.getParameter(),
				'data-target': '#' + dialogCode,
				dialogId: dialogCode,
				closeCallback: function(ref){
					var referenceData = ref.data('referenceData');
					if(referenceData){
						that.setReferenceData(referenceData);
						ref.removeData('referenceData');
					}
					that.trigger('afterClose');
				},
				callback: function(ref){
					ref.delegate('[data-dismiss="refClear"]', 'click.reference',function(){
						ref.data('referenceData',{text:'',value:''});
						ref.closeDialog();
					});
					ref.delegate('[data-dismiss="refCancel"]', 'click.reference',function(){
						ref.removeData('referenceData');
						ref.closeDialog();
					});
					ref.data('referenceData', that.getReferenceData());
				}
			};
			this._closeVisiblePanel();
			$.openModalDialog(options);
		},
		/**
		 * 设置参照url
		 * @param {url} url 参照页面url
		 * @example $('#demo').reference('setAction','a.do');
		 * @memberof reference-class
		 * @instance
		 */
		setAction: function(url){
			this.setting.url = url;
		},
		/**
		 * 获取当前引用框的数据对象
		 * @returns {object} result 参照页面的数据对象
		 * @example $('#demo').reference('getReferenceData');
		 * @memberof reference-class
		 * @instance
		 */
		getReferenceData: function(){
			return this.$input.data('referenceData');
		},
		/**
		 * 设置当前引用框的数据对象
		 * @param {object} referenceData 参照页面的数据对象
		 * @todo 根据数据对象设置显示值和隐藏值
		 * @example $('#demo').reference('setReferenceData',{object});
		 * @memberof reference-class
		 * @instance
		 */
		setReferenceData: function (referenceData) {
			if(!referenceData){
				referenceData = {
					text:'',
					value:''
				};
			}
			this.setText(referenceData.text);
			this.setValue(referenceData.value);
			this.$input.data('referenceData', referenceData);
		},
		/**
		 * <span class="type-signature static">override</span>combo
		 * 清除数据对象、显示值、隐藏值
		 * @todo 清除数据对象
		 * @todo 清除显示值
		 * @todo 清除隐藏值
		 * @example $('#demo').reference('clearValue');
		 * @memberof reference-class
		 * @instance
		 */
		clearValue: function(){
			this.$input.removeData('referenceData');
			this.setText('');
			this.setValue('');
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 设置隐藏值
		 * @param {String} val 隐藏值
		 * @param {boolean} [noTrigger] 是否触发change
		 * @see textbox#setValue
		 * @todo 如果隐藏值为空，则设置显示值为空
		 * @example $('#demo').reference('setValue','val');
		 * @memberof reference-class
		 * @instance
		 */
		setValue: function(val, noTrigger){
			this._setValue(val, noTrigger);
			var obj = this.getReferenceData();
			if(obj){
				obj.value = val;
			}else{
				obj = {
					value: val
				};
				this.$input.data('referenceData', obj);
			}
			if(!val){
				this.setText('');
			}
		},
		/**
		 * 设置显示值
		 * @todo 设置值后
		 * @example $('#demo').textbox('setText','text');
		 * @memberof reference-class
		 * @instance
		 */
		setText: function(text, noTrigger){
			Reference.superclass.setText.call(this, text);
			var obj = this.getReferenceData();
			if(obj){
				obj.text = text;
			}else{
				obj = {
					text: text
				};
				this.$input.data('referenceData', obj);
			}
		},
		/**
		 * 设置Reference弹出的对话框的标题
		 * @param title
		 */
		setDialogTitle:function(title){
			this.setting.title = title;
		}
	});
	
	$.fn.reference = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'reference';
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
					component = new Reference(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};

	
	
	$.fn.reference.Constructor = Reference;
	/**
	 * 关闭顶层的对话框，该方法已注册到jquery对象中
	 * @param {object} data 数据
	 * @todo 关闭顶层对话框
	 * @todo 将数据缓存到对话框中
	 * @example $('#demo').closeReference({object});
	 * @memberof jquery
	 * @function closeReference
	 */
	$.closeReference = function(data){
		var ref = Dialog.getCurrent();
		ref.data('referenceData',data);
		ref.closeDialog();
	};
	return Reference;
});