/**
 * 下拉框控件--继承Combo
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 
        'app/widgets/form/app-combo', 'app/core/app-options', 'app/widgets/form/app-suggest'],
        function($, App, Combo, Options, Suggest) {
	'use strict';
	/**
	 * @class 
	 * @classdesc 下拉框
	 * <span class="type-signature static">extend</span>combo
	 * @see {@link combo-class} 查看combo组件
	 * @name combobox-class
	 * @desc 下拉框的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @example &lt;input &#9;class="app-combobox"
	 * &#9;_options="{
	 * &#9;&#9;action: 'platform/sample/base/ui/suggestData.do',
	 * &#9;&#9;panelheight: 200,
	 * &#9;&#9;tips: '请选择...',
	 * &#9;&#9;formatter: '{code}+{name}',
	 * &#9;&#9;onChange: function(newVal,oldVal){
	 * &#9;&#9;&#9;logOnChange('comboboxLog',newVal,oldVal);
	 * &#9;&#9;}
	 * &#9;}"
	 * />
	 * @example $('#demo').combobox({
	 * &#9;action: 'platform/sample/base/ui/suggestData.do',
	 * &#9;panelheight: 200,
	 * &#9;tips: '请选择...',
	 * &#9;formatter: '{code}+{name}',
	 * &#9;onChange: function(newVal,oldVal){
	 * &#9;&#9;logOnChange('comboboxLog',newVal,oldVal);
	 * &#9;}
	 * });
	 */
	var Combobox = Combo.extend({
		initialize: function(input, options){
			if(!options){
				options = {};
			}
			options._ = Options.appDefaults.Combobox;
			Combobox.superclass.initialize.call(this, input, options);
			this._init();
		},
		/** 
		 * 初始化
		 */
		_init: function(){
			this._initPanelContent();
			this._registEvents();
			this.mapData = {};
			if(this.setting.usesuggest){
				this._suggest = new Suggest(this.$input, this.options);
				this._suggest.context = this;
			}
			this._eventRegister();
			this.$input.data('context', this);
			/**
			 * 节点删除事件，当存在该事件时，节点末尾跟随一个删除按钮
			 * @event combobox-class#onDeleteNode
			 * @param {Node} node 被选择的节点
			 */
			if($.isFunction(this.setting.onDeleteNode)){
				this.setting.nodeDelete = true;
			}
		},
		/**
		 * 事件注册器
		 */
		_eventRegister: function(){
			var s = this.setting;
			if($.isFunction(s.afterSelected)){
				this.on('afterSelected', s.afterSelected);
			}
			if($.isFunction(s.beforeSelected)){
				this.on('beforeSelected', s.beforeSelected);
			}
			if($.isFunction(s.onDeleteBtnRender)){
				this.on('onDeleteBtnRender', s.onDeleteBtnRender);
			}
			if($.isFunction(s.onDeleteNode)){
				this.on('onDeleteNode', s.onDeleteNode);
			}
			if($.isFunction(s.onLoadSuccess)){
				this.on('onLoadSuccess', s.onLoadSuccess);
			}
			if($.isFunction(s.addDiyDom)){
				this.on('addDiyDom', s.addDiyDom);
			}
			if($.isFunction(s.addHoverDom)){
				this.on('addHoverDom', s.addHoverDom);
			}
			if($.isFunction(s.removeHoverDom)){
				this.on('removeHoverDom', s.removeHoverDom);
			}
		},
		/**
		 * 注册控件事件
		 */
		_registEvents: function(){
			var that = this;
			this.$list.on('click.combobox.api', 'li', function(){
				that._clickActive$Node($(this));
			});
			this.$list.on('click.combobox-delete.api', '>li>.btn-delete', function(e){
				that._clickDelete$Node($(this).parent());
				e.stopPropagation();
			});
			this.$list.on('mouseover', '>li', function(e){
				if(that.hasBindEvent('addHoverDom')){
					var $this = $(this);
					/**
					 * 用于当鼠标移动到节点上时，显示用户自定义控件
					 * @todo 请务必与 removeHoverDom 同时使用
					 * @event combobox-class#addHoverDom
					 * @param {Jquery} $node 下拉项DOM
					 * @param {Object} node 下拉项数据
					 */
					that.trigger('addHoverDom', $this, that._getNode($this));
				}
			});
			this.$list.on('mouseout', '>li', function(e){
				if(that.hasBindEvent('removeHoverDom')){
					var $this = $(this);
					if($(e.toElement).closest('li').is($this)){
						return;
					}
					if($this.hasClass('selected') || $this.hasClass('current')){
						return;
					}
					/**
					 * 用于当鼠标移出节点时，隐藏用户自定义控件
					 * @todo 请务必与 addHoverDom 同时使用
					 * @event combobox-class#removeHoverDom
					 * @param {Jquery} $node 下拉项DOM
					 * @param {Object} node 下拉项数据
					 */
					that.trigger('removeHoverDom', $this, that._getNode($this));
				}
			});
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
		 * 按键导航事件
		 */
		_keyManager: function(e){
			if(this._dealSysKey(e)){
				return;
			}
			if(this._isSuggestContext()){//联想框主控 则返回
				return;
			}
			if(this._mainDivIsVisiable()){
				this._keyForVisiblePanel(e);
			}else{
				this._keyForHiddenPanel(e);
			}
		},
		/**
		 * 面板可见状态下的按键事件处理
		 */
		_keyForVisiblePanel: function(e){
			var keyCode = e.keyCode
				,s = this.setting;
			e.stopPropagation();
			if(App.containKeyCode(e, s.keyNextNode)){
				this._keyNextNode(e);
			}else if(App.containKeyCode(e, s.keyPrevNode)){
				this._keyPrevNode(e);
			}else if(App.containKeyCode(e, s.keyPickNode)){
				this._keyPickNode(e);
			}else if(App.containKeyCode(e, s.keyHidePanel)){
				this._keyHidePanel(e);
			}else if(this._keyFilterSuggest(e)){
				this.suggest();
			}
		},
		/**
		 * 面板不可见状态下的按键事件处理
		 */
		_keyForHiddenPanel: function(e){
			var keyCode = e.keyCode
				,s = this.setting;
			if(App.containKeyCode(e, s.keyShowPanel)){
				this._keyShowPanel(e);
			}else if(this._isKeyCursorPos(keyCode)){
				this._keyCursorPos(e);
			}else if(this._keyFilterSuggest(e)){
				this.suggest();
			}
		},
		/**
		 * 定位上一个节点
		 */
		_keyPrevNode: function(e){
			e.preventDefault();
			this._stopSuggest(true);
			var $l = this.$list;
			if($l.find('>li').length == 0){
				return;
			}
			var $c = $l.find('.current')
				,$n = $c.prev();
			if($n.length == 0){
				$n = $l.find('li:last-child');
			}
			$c.removeClass('current');
			$n.addClass('current');
			this.trigger('addHoverDom', $n, this._getNode($n));
			if(!$c.hasClass('selected') && !$c.hasClass('current')){
				this.trigger('removeHoverDom', $c, this._getNode($c));
			}
			this._locateCurrent();
		},
		/**
		 * 定位下一个节点
		 */
		_keyNextNode: function(e){
			e.preventDefault();
			this._stopSuggest(true);
			var $l = this.$list;
			if($l.find('>li').length == 0){
				return;
			}
			var $c = $l.find('.current')
				,$n = $c.next();
			if($n.length == 0){
				$n = $l.find('li:first-child');
			}
			$c.removeClass('current');
			$n.addClass('current');
			this.trigger('addHoverDom', $n, this._getNode($n));
			if(!$c.hasClass('selected') && !$c.hasClass('current')){
				this.trigger('removeHoverDom', $c, this._getNode($c));
			}
			this._locateCurrent();
		},
		/**
		 * 选中一个节点
		 */
		_keyPickNode: function(e){
			e.preventDefault();
			this._stopSuggest(true);
			var $c = this.$list.find('.current');
			if($c.length == 0){
				return;
			}
			if(this.setting.multiple){
				this._keyNextNode(e);
			}
			this._clickActive$Node($c);
		},
		/**
		 * 联想项的定位到当前项
		 */
		_locateCurrent: function(){
			var $c = this.$list.find('li.current');
			if($c.length != 1){
				return;
			}
			var top = $c.offset().top + $c.outerHeight() - this.$list.offset().top
				,containerHeight = this.$dropPanel.outerHeight() -2
				,scrollTop = this.$dropPanel.scrollTop();
			if(top <= scrollTop){
				this.$dropPanel.scrollTop(top - $c.outerHeight());
			}else if(top >= scrollTop + containerHeight){
				this.$dropPanel.scrollTop(top - containerHeight);
			}
		},
		/**
		 * 显示下拉面板
		 * @todo 填充下拉面板内容
		 * @todo 根据隐藏值渲染选择项
		 * @todo 显示面板，根据面板内容进行面板位置的调整
		 * @example $('#demo').combobox('showPanel');
		 * @memberof combobox-class
		 * @instance
		 */
		showPanel: function(){
			if(this._suggest){
				this.$dropPanel.append(this.$dropPanelCustom);
			}
			this._showPanel(function(){
				this._initData();
				this._rendSelectedItems();
			});
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 显示或隐藏下拉面板，该方法已绑定在组件的右边按钮中
		 * @todo 判断当前面板是否可见：
		 * @todo 1如果不可见，调用showPanel
		 * @todo 2如果可见，则关闭面板
		 * @example $('#demo').combobox('togglePanel');
		 * @memberof combobox-class
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
		 * 载入数据，并根据数据渲染面板中的列表项
		 * @param {Array.<Node>} data 载入的数据列表
		 * @todo 根据数据渲染下拉面板的内容
		 * @todo 如果下拉面板为打开状态，则重新打开面板（由于面板内容改变，可能导致面板高度改变，用于矫正位置）
		 * @example $('#demo').combobox('loadData',[{id:1,name:'是'},{id:0,name:'否'}]);
		 * @memberof combobox-class
		 * @instance
		 */
		loadData: function(data){
			this.setting.data = data;
			if(this._suggest){
				this._suggest.setting.data = data;
				if(this._suggest.isSuggesting()){
					this._suggest.refreshSuggest();
				}
			}
			this._renderData();
			//内容填充后，显示面板，重新定位
			if(this._mainDivIsVisiable()){
				this.place();
			}
		},
		/**
		 * 在列表末尾加入一个节点
		 * @example $('#demo').combobox('appendNode', {id:2, name:'不确定'});
		 * @memberof combobox-class
		 * @instance
		 */
		appendNode: function(node){
			if(!node || $.isArray(node)){
				return;
			}
			this.$dropPanelEmpty.hide();
			var $node = this._create$Node(node);
			this.$list.append($node);
			if(this.setting.data){
				$.merge(this.setting.data, [node]);
			}else{
				this.setting.data = [node];
			}
			if(this._suggest && this._suggest.setting){
				if(this._suggest.setting.data){
					$.merge(this._suggest.setting.data, [node]);
				}else{
					this._suggest.setting.data = [node];
				}
			}
			//内容填充后，显示面板，重新定位
			if(this._mainDivIsVisiable()){
				this.place();
			}
		},
		/**
		 * 渲染数据
		 */
		_renderData: function(){
			var data = this.setting.data == undefined ? [] : this.setting.data;
			this.$list.empty();
			for ( var i = 0; i < data.length; i++) {
				var $node = $(this._create$Node(data[i]));
				this.$list.append($node);
				/**
				 * 用于在节点上固定显示用户自定义控件
				 * @event combobox-class#addDiyDom
				 * @param {Jquery} $node 下拉项DOM
				 * @param {Object} node 下拉项数据
				 */
				this.trigger('addDiyDom', $node, data[i]);
			}
			if(data.length == 0){
				this.$dropPanelEmpty.show();
			}else{
				this.$dropPanelEmpty.hide();
			}
			this._resetPanelHeight(data.length);
			this._resetPanelWidth();
			this._rendSelectedItems();
			this._afterDataRender();
		},
		/**
		 * 生成一个node节点
		 */
		_create$Node: function(node){
			var itemId = App.uuid();
			this.mapData[itemId] = node;
			return '<li id="' + itemId + '" _v="' + node[this.setting.valuefield] +
					'"><i class="icon-ok"></i>' + node[this.setting.textfield] +
					 this._create$DeleteNode(node)+ '</li>';
		},
		/**
		 * 根据回调过滤节点
		 */
		_create$DeleteNode: function(node){
			var html = '';
			if(this.hasBindEvent('onDeleteBtnRender')){
				/**
				 * 节点的删除按钮过滤器
				 * @event combobox-class#onDeleteBtnRender
				 * @param {Node} node 要渲染的节点
				 * @returns {Boolean} boolean 返回值为true 需要一个删除按钮
				 */
				if(this.trigger('onDeleteBtnRender', node) === true){
					html = '<i class="btn-delete"></i>';
				}
			}else{
				html = this.hasBindEvent('onDeleteNode')?'<i class="btn-delete"></i>':'';
			}
			return html;
		},
		/**
		 * 选择项点击事件
		 * 1、如果存在自定义选中前事件，先执行该事件，如果返回false则结束选择，否则执行2
		 * 2、单选则设值当前选择项为值，并关闭下拉框；多选则追加当前选择项为值
		 * 3、如果存在自定义选中后事件，则执行该事件
		 * @param $node
		 */
		_clickActive$Node: function($node){
			if(this._isSelected($node) && this.setting.multiple){
				this._unselect$Node($node);
				this._setSelectedNodeBy$Node();
			}else{
				/**
				 * 节点选择前事件，并返回一个值，当为false时取消选择操作
				 * @event combobox-class#beforeSelected
				 * @param {Node} node 被选择的节点
				 * @returns {Boolean} boolean 返回值为false 取消选择
				 */
				if(this._activeItemEvent('beforeSelected', $node) === false){
					return;
				}
				this._select$Node($node);
				this._setSelectedNodeBy$Node();
				/**
				 * 节点选择后事件
				 * @event combobox-class#afterSelected
				 * @param {Node} node 被选择的节点
				 */
				this._activeItemEvent('afterSelected', $node);
			}
		},
		/**
		 * 激活节点点击事件
		 * @param li 当前被点击的选择项
		 * @returns {Boolean} false 结束点击事件
		 */
		_activeItemEvent: function(eventName, $node){
			if(this.hasBindEvent(eventName)){
				return this.trigger(eventName, this._getNode($node));
			}
		},
		/**
		 * 判断该节点是否已经被选中
		 */
		_isSelected: function($node){
			return $node.hasClass('selected');
		},
		/**
		 * 点击删除按钮
		 */
		_clickDelete$Node: function($node){
			if(this.hasBindEvent('onDeleteNode')){
				this.trigger('onDeleteNode', this._getNode($node), $node.index());
			}
		},
		/**
		 * 根据行号删除节点
		 * @param {Number} index 已删除的行号
		 * @example $('#demo').combobox('deleteNode', 1);
		 * @memberof combobox-class
		 * @instance
		 */
		deleteNode: function(index){
			var type = typeof(index)
				,exp = '';
			if(!isNaN(index)){
				exp = '>li:eq(' + index + ')';
			}else if(type == 'string'){
				exp = '>li[_v="' + index + '"]';
			}else if(type == 'object'){
				exp = '>li[_v="' + index[this.setting.valuefield] + '"]';
			}
			var $node = this.$list.find(exp);
			if($node.length == 1){
				this._delete$Node($node);
			}
			if(this.$list.find('li').length == 0){
				this.$dropPanelEmpty.show();
			}
		},
		/**
		 * 删除节点
		 */
		_delete$Node: function($node){
			if(this._isSelected($node)){
				this._unselect$Node($node);
				this._setSelectedNodeBy$Node();
			}
			var node = this.mapData[$node.attr('id')]
				,vf = this.setting.valuefield;
			if(this._suggest){
				var data = this._suggest.setting.data;
				for(var i = 0; i < data.length; i++){
					if(data[i][vf] == node[vf]){
						data.splice(i, 1);
						this._suggest.prevKey = undefined;//清除关键字 重新开始搜索
						break;
					}
				}
			}
			delete this.mapData[$node.attr('id')];
			$node.remove();
		},
		/**
		 * 将节点设置为选中的样式
		 */
		_select$Node: function($node){
			if(this.setting.multiple){
				$node.addClass('selected');
			}else{
				var $selectedNode = this.$list.find('li.selected');
				$selectedNode.removeClass('selected');
//				if($selectedNode.attr('id') != $node.attr('id')){
					$node.addClass('selected');
					this.hidePanel();
//				}
			}
		},
		/**
		 * 将节点设置为未选中的样式
		 */
		_unselect$Node: function($node){
			$node.removeClass('selected');
		},
		/**
		 * 根据已选的节点设置选中的项
		 */
		_setSelectedNodeBy$Node: function(){
			var result = null
				,nodes = []
				,$nodes = this.$list.find('li.selected');
			for(var i = 0,l = $nodes.length; i < l; i++){
				var node = this._getNode($($nodes[i]));
				nodes.push(node);
			}
			if(this.setting.multiple){
				result = nodes;
			}else{
				result = nodes[0];
				if(result == undefined){
					result = null;
				}
			}
			this.setSelectedNode(result);
		},
		/**
		 * 根据选择项获取当前节点
		 * @param $node 选择项
		 * @returns {}
		 */
		_getNode: function($node){
			return this.mapData[$node.attr('id')];
		},
		/**
		 * 根据当前下拉框的隐藏值查询出相关的选择项，
		 * 渲染选择项为选中状态，并根据值设置显示值
		 */
		_rendSelectedItems: function(){
			this._clearSelectedItems();
			this._render$NodeByValue();
		},
		/**
		 * 根据value等值匹配出选择项
		 * @result 值属于value的选择项
		 */
		_render$NodeByValue: function(){
			var vs = this.getValue().split(',');
			for ( var i = 0; i < vs.length; i++) {
				this.$list.find('li[_v="' + vs[i] + '"]').addClass('selected');
			}
		},
		/**
		 * 根据传入的url进行远程加载数据并渲染
		 * @param {url} url 要载入的url
		 * @todo 请求时并加入parameter参数，获取到数据后调用loadData
		 * @example $('#demo').combobox('reload','a.do');
		 * @memberof combobox-class
		 * @instance
		 */
		reload: function(url){
			this._ajax(url, function(data){
				this.loadData(data);
			});
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 清除值
		 * @todo 清除隐藏值
		 * @todo 清除显示值
		 * @todo 清除下拉面板的选择项
		 * @memberof combobox-class
		 * @instance
		 */
		clearValue: function(){
			this.setText('');
			this.setValue('');
			this._clearSelectedItems();
		},
		/**
		 * 清除选择项的样式
		 */
		_clearSelectedItems: function(){
			this.$list.find('li.selected').removeClass('selected');
		}
	});
	$.fn.combobox = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'combobox';
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
					
					if(option == 'on' && component._suggest){
						component._suggest.on.apply(component._suggest, methodArgs);
					}
					if(option == 'bind' && component._suggest){
						component._suggest.bind.apply(component._suggest, methodArgs);
					}
				}catch(e){
					App.throwCompMethodError($this, componentName, option, e);
				}
			}else{
				if(!component){
					component = new Combobox(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};
	return $;
});