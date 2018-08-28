/**
 * 下拉树控件---继承Combo
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/data/app-ajax', 'app/widgets/form/app-combo',
        'app/core/app-options', 'jquery/jquery.ztree', 'app/widgets/form/app-suggest'],
        function($, App, AppAjax, Combo, Options, Ztree, Suggest) {
	'use strict';
	/**
	 * @class 
	 * @classdesc 下拉树
	 * <span class="type-signature static">extend</span>combo
	 * @see {@link combo-class} comboztree继承至combo
	 * @name comboztree-class
	 * @desc 下拉树的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @example &lt;input &#9;class="app-comboztree"
	 * &#9;_options="{
	 * &#9;&#9;action: 'html/example/app-input/data/data.valueAndText',
	 * &#9;&#9;
	 * &#9;}"
	 * />
	 * @example $('#demo').comboztree({
	 * &#9;action: 'html/example/app-input/data/data.valueAndText'
	 * });
	 */
	var Comboztree = Combo.extend({
		initialize: function(input, options) {
			if(!options){
				options = {};
			}
			options._ = Options.appDefaults.Comboztree;
			Comboztree.superclass.initialize.call(this, input, options);
			this._init();
		},
		/**
		 * 初始化
		 */
		_init: function(){
			this._initOptions();
			this._initPanelContent();
			this._eventRegister();
			if(this.setting.usesuggest){
				this._suggest = new Suggest(this.$input, this.options);
				this._suggest.context = this;
			}
			this.$input.data('context', this);
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
		},
		/**
		 * 初始化参数
		 */
		_initOptions: function(){
			var setting = this.setting;
			if(setting.autoparam == null){
				//异步提交时，默认跟上的参数为隐藏值属性名+隐藏值
				setting.autoparam = [setting.valuefield];
			}else{
				setting.autoparam = setting.autoparam.split(',');
			}
			if(!setting.idfield){
				setting.idfield = setting.valuefield;
			}
		},
		/**
		 * 初始化下拉内容
		 */
		_initPanelContent:function(){
			var $template = $('<div class="combo-ztree">' +
							  	'<ul id="' + App.uuid('app_ztree_') + '" class="ztree"></ul>' +		
							  '</div>');
			$template.appendTo(this.$dropPanelMain);
			this.$ztreeDiv = $template.find('.combo-ztree');
			this.$ztree = $template.find('ul');
		},
		/**
		 * 按键导航事件
		 */
		_keyManager: function(e){
			if(this._dealSysKey(e)){
				return;
			}
			var keyCode = e.keyCode
				,s = this.setting;
			if(this._isSuggestContext()){//联想框主控 则返回
				return;
			}
			if(this._mainDivIsVisiable()){
				this._keyForVisiblePanel(e);
			}else{
				this._keyForHiddenPanel(e);
			}
			this.focus();
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
			}else if(App.containKeyCode(e, s.keyParentNode)){
				this._keyParentNode(e);
			}else if(App.containKeyCode(e, s.keyChildNode)){
				this._keyChildNode(e);
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
		 * 	1、当同级只有一个节点时，上按键定位到父节点
		 */
		_keyPrevNode: function(e){
			e.preventDefault();
			this._stopSuggest(true);
			var c = this._getCurrentNode();
			if(c){
				var len = this._z.getNodesByParam('level', c.level, c.getParentNode()).length;
				if(len <= 1){
					this._switchParentNode(c);
					return;
				}
			}
			this._switchPrevNode(c);
		},
		/**
		 * 定位到下一个节点
		 * 特例：当同级只有一个节点:
		 * 	1、本身为叶子节点时，下按键定位到父节点
		 * 	2、本身为父节点时，下按键定位到子节点
		 */
		_keyNextNode: function(e){
			e.preventDefault();
			this._stopSuggest(true);
			if(!this._mainDivIsVisiable()){
				this.showPanel();
			}
			if(!this._z){
				return;
			}
			var c = this._getCurrentNode();
			if(c){
				var len = this._z.getNodesByParam('level', c.level, c.getParentNode()).length;
				if(len <= 1){
					if(c.isParent){
						this._switchChildNode(c);
					}else{
						this._switchParentNode(c);
					}
					return;
				}
			}
			this._switchNextNode(c);
		},
		/**
		 * 定位到父节点
		 *  特例：当前节点不存在父节点，则定位到上一个节点
		 */
		_keyParentNode: function(e){
			e.preventDefault();
			this._stopSuggest(true);
			var c = this._getCurrentNode();
			if(c && c.getParentNode()){
				this._switchParentNode(c);
			}else{
				this._switchPrevNode(c);
			}
		},
		/**
		 * 定位到第一个子节点
		 *  特例：当前节点节点不是父节点，则定位到下一个节点
		 */
		_keyChildNode: function(e){
			e.preventDefault();
			this._stopSuggest(true);
			var c = this._z.getSelectedNodes()[0];
			if(c && c.isParent){
				this._switchChildNode(c);
			}else{
				this._switchNextNode(c);
			}
		},
		/**
		 * 选中一个节点
		 */
		_keyPickNode: function(e){
			e.preventDefault();
			this._stopSuggest(true);
			var node = this._z.getSelectedNodes()[0];
			if(!node){
				return
			}
			this._onSelect(node);
		},
		/**
		 * 获取当前选中节点
		 */
		_getCurrentNode: function(){
			return this._z.getSelectedNodes()[0];
		},
		/**
		 * 选中前一个节点
		 * @param c 当前选中节点
		 */
		_switchPrevNode: function(c){
			var n = null;
			if(c){
				n = c.getPreNode();
				if(n == undefined){
					var ns = this._z.getNodesByParam('level', c.level, c.getParentNode());
					if(ns.length > 0){
						n = ns[ns.length-1];
					}
				}
			}else{
				var ns = this._z.getNodes();
				if(ns.length > 0){
					n = ns[ns.length-1];
				}
			}
			this._focusCurrentNode(c, n);
		},
		/**
		 * 选中后一个节点
		 * @param c 当前选中节点
		 */
		_switchNextNode: function(c){
			var n = null;
			if(c){
				n = c.getNextNode();
				if(n == undefined){
					var ns = this._z.getNodesByParam('level', c.level, c.getParentNode());
					if(ns.length > 0){
						n = ns[0];
					}
				}
			}else{
				var ns = this._z.getNodes();
				if(ns.length > 0){
					n = ns[0];
				}
			}
			this._focusCurrentNode(c, n);
		},
		/**
		 * 选中父节点
		 * @param c 当前选中节点
		 */
		_switchParentNode: function(c){
			var n = null;
			if(!c){
				var ns = this._z.getNodes();
				if(ns.length > 0){
					c = ns[0];
				}
			}
			if(c){
				n = c.getParentNode();
			}
			if(n){
				this._z.expandNode(n, false, false, false);
			}
			this._focusCurrentNode(c, n);
		},
		/**
		 * 选中子节点
		 * @param c 当前选中节点
		 */
		_switchChildNode: function(c){
			var n = null;
			if(!c){
				var ns = this._z.getNodes();
				if(ns.length > 0){
					c = ns[0];
				}
			}
			if(c && c.isParent){
				this._z.expandNode(c, true, false, false, true);
				var ns = this._z.getNodesByParam('level', c.level + 1, c);
				if(ns.length > 0){
					n = ns[0];
				}
			}
			this._focusCurrentNode(c, n);
		},
		/**
		 * 当下一个节点存在，切换到下一个节点
		 * @param c 当前选中节点
		 * @param n 下一个选中节点
		 */
		_focusCurrentNode: function(c,n){
			if(n){
				this._z.cancelSelectedNode(c);
				this._z.selectNode(n);
				this.focus();
			}
		},
		/**
		 * 其他按键按下
		 */
		_otherKeyDown: function(){
			var suggest = this.$element.data('suggest');
			if(suggest){
				suggest.stopKeyEvent = false;
			}
			this.hidePanel();
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 显示或隐藏下拉面板，该方法已绑定在组件的右边按钮中
		 * @todo 判断当前面板是否可见
		 * @todo 1如果不可见，调用showPanel
		 * @todo 2如果可见，则关闭面板

		 * @example $('#demo').comboztree('togglePanel');
		 * @memberof comboztree-class
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
		 * 显示下拉面板
		 * @todo 填充下拉面板内容
		 * @todo 根据隐藏值渲染选择项
		 * @todo 显示面板，根据面板内容进行面板位置的调整
		 * @example $('#demo').comboztree('showPanel');
		 * @memberof comboztree-class
		 * @instance
		 */
		showPanel: function(){
			if(this._suggest){
				this.$dropPanel.append(this.$dropPanelCustom);
			}
			this._showPanel(function(){
				this._initData();
				this._rendSelectedItems();
				this.focus();
			});
		},
		/**
		 * 载入数据，并根据数据渲染下拉面板
		 * @param {Array.<Node>} data 载入的数据列表
		 * @todo 渲染下拉框中的ztree
		 * @todo 根据隐藏值渲染ztree节点选中状态
		 * @todo 如果下拉面板为打开状态，则重新打开面板（由于面板内容改变，可能导致面板高度改变，用于矫正位置）
		 * @example $('#demo').comboztree('loadData',[
		 * &#9;{value:1, text:"节点 1", open:true, noR:true,
		 * &#9;&#9;children:[
		 * &#9;&#9;&#9;{value:11, text:"节点 11", noR:true},
		 * &#9;&#9;&#9;{value:12, text:"节点 12", noR:true}
		 * &#9;&#9;]
		 * &#9;},
		 * &#9;{value:2, text:"节点 2", open:true,
		 * &#9;&#9;children:[
		 * &#9;&#9;&#9;{value:21, text:"节点 21"},
		 * &#9;&#9;&#9;{value:22, text:"节点 22"},
		 * &#9;&#9;&#9;{value:23, text:"节点 23"},
		 * &#9;&#9;&#9;{value:24, text:"节点 24"}
		 * &#9;&#9;]
		 * &#9;},
		 * &#9;{value:3, text:"节点 3", open:true,
		 * &#9;&#9;children:[
		 * &#9;&#9;&#9;{value:31, text:"节点 31"},
		 * &#9;&#9;&#9;{value:32, text:"节点 32"},
		 * &#9;&#9;&#9;{value:33, text:"节点 33"},
		 * &#9;&#9;&#9;{value:34, text:"节点 34"}
		 * &#9;&#9;]
		 * &#9;}
		 * ]);
		 * @memberof comboztree-class
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
		 * 设置请求远程数据时的查询参数
		 * @param {object} param 查询参数
		 * @example $('#demo').comboztree('setParameter',{year:2014});
		 * @memberof comboztree-class
		 * @instance
		 */
		setParameter: function(param){
			if(!param){
				param = {};
			}
			this.$input.data('_parameter', param);
			this._injectParam();
		},
		/**
		 * 注入查询参数
		 */
		_injectParam: function(){
			var param = this.getParameter();
			if(this._z && param){
				if(this._z.setting.async.otherParam){
					$.extend(this._z.setting.async.otherParam, param);
				}else{
					this._z.setting.async.otherParam = param;
				}
			}
		},
		/**
		 * 渲染数据
		 */
		_renderData: function(){
			this._resetZtree();
			this._resetPanelWidth();
			this._rendSelectedItems();
			this._afterDataRender();
		},
		/**
		 * 渲染ztree
		 */
		_resetZtree: function(){
			var data = this.setting.data == undefined ? [] : this.setting.data;
			if(this._z){
				this._z.destroy();
			}
			if(data.length == 0){
				var root = {};
				root[this.setting.valuefield] = '__ROOTID__';
				root[this.setting.textfield] = '无对应结果';
				$.fn.zTree.init(this.$ztree, this._getZtreeSetting(), [root]);
			}else{
				$.fn.zTree.init(this.$ztree, this._getZtreeSetting(), data);
				storeData.call(this, data);
			}
			this._z = $.fn.zTree.getZTreeObj(this.$ztree.attr('id'));
			this._injectParam();
			if(data.length == 0){
				this._z.refresh();
				this.$dropPanelEmpty.show();
			}else{
				this.$dropPanelEmpty.hide();
			}
		},
		/**
		 * 生成ztree的设置
		 */
		_getZtreeSetting: function(){
			var s = this.setting;
			var setting = {
				view: {
					selectedMulti: false,
					dblClickExpand: false,
					showLine: false,
					showIcon: s.showIcon,
					fontCss: function(treeId, treeNode) {
						return (!!treeNode.highlight) ? {'color':'#A60000', 'font-weight':'bold'} : {'color':'#333', 'font-weight':'normal'};
					},
					addHoverDom: s.addHoverDom,
					removeHoverDom: s.removeHoverDom,
					addDiyDom: s.addDiyDom
				},
				data:{
					key:{
						name: s.textfield
					},
					simpleData: {
						enable: true,
						idKey: s.idfield,
						pIdKey: s.pidfield,
						rootPId: s.rootpidvalue
					}
				}
			};
			if(s.async){
				var url = s.url;
				if(s.asyncUrl) 
					url = s.asyncUrl;
				setting.async = {
					enable: true,
					url: url,
					autoParam: s.autoparam,
					otherParam: s.otherParam
				};
			}
			if(s.multiple){
				setting.check = {enable:true};
				if(s.onlyleaf){
					setting.check.chkboxType = {Y: '', N: ''};
				}
				if(s.checkBySelf){
					setting.check.chkboxType = {Y: '', N: ''};
				}
			}else{
				setting.selectedMulti = false;
			}
			setting['callback'] = this._getZtreeCallback();
			return setting;
		},
		/**
		 * 生成ztree树的回调方法
		 * @returns {} 
		 */
		_getZtreeCallback: function(){
			var result = {}
				,that = this;
			result.onClick = function(event, treeId, treeNode){
				that._onSelect(treeNode);
			};
			result.beforeCheck = function(treeId, treeNode){
				if(that.setting.onlyleaf && treeNode.isParent){
					return false;
				}
			};
			result.beforeClick = result.beforeCheck;
			result.onCheck = function(event, treeId, treeNode){
				that._onCheck(treeNode);
			};
			result.onAsyncSuccess = function(event, treeId, treeNode, msg){
				that._onAsyncSuccess(event, treeId, treeNode, msg);
				appendStoreData.call(that, msg);
			};
			result.onExpand = function(event, treeId, treeNode){
				that._onExpand(event, treeId, treeNode);
				that.place();
			};
			result.onCollapse = function(event, treeId, treeNode){
				that.place();
			};
			return result;
		},
		/**
		 * ztree节点的选择事件
		 * @param treeNode 
		 */
		_onSelect: function(treeNode){
			if(this.setting.multiple){
				if(treeNode.checked){
					this._z.checkNode(treeNode, false, true);
					this._setSelectedNodes();
				}else{
					/**
					 * 节点选择前事件，并返回一个值，当为false时取消选择操作
					 * @event comboztree-class#beforeSelected
					 * @param {Node} node 被选择的节点
					 * @returns {Boolean} boolean 返回值为false 取消选择
					 */
					if(this.trigger('beforeSelected', treeNode) === false){
						return;
					}
					this._z.checkNode(treeNode, true, true);
					this._setSelectedNodes();
					/**
					 * 节点选择后事件
					 * @event comboztree-class#afterSelected
					 * @param {Node} node 被选择的节点
					 */
					this.trigger('afterSelected', treeNode);
				}
			}else{
				if(this.trigger('beforeSelected', treeNode) === false){
					return;
				}
				this._z.selectNode(treeNode);
				this._setSelectedNodes();
				this.trigger('afterSelected', treeNode);
			}
		},
		/**
		 * 勾选事件
		 */
		_onCheck: function(treeNode){
			if(treeNode.checked){
				this._setSelectedNodes();
			}else{
				if(this.trigger('beforeSelected', treeNode) === false){
					return;
				}
				this._setSelectedNodes();
				this.trigger('afterSelected', treeNode);
			}
		},
		/**
		 * 根据树节点的checked状态的取值并设置下拉树的文本显示控件和值隐藏控件
		 */
		_setSelectedNodes: function(){
			if(this.setting.multiple){
				var nodes = this._z.getCheckedNodes(true);
				if(this.setting.shrinkValue){
					nodes = this._removeHalfCheckNode(nodes);
					nodes = this._removeRepeat(nodes);
				}else if(this.setting.ignoreHalfCheck){
					nodes = this._removeHalfCheckNode(nodes);
				}
				setSelectedNode.call(this, nodes);
			}else{
				var nodes = this._z.getSelectedNodes();
				if(nodes.length >= 1){
					setSelectedNode.call(this, nodes);
				}
				this.hidePanel();
			}
		},
		/**
		 * 去掉半勾选状态的父节点
		 * @param nodes
		 */
		_removeHalfCheckNode: function(nodes){
			var result = [];
			for(var i = 0; i < nodes.length; i ++){
				var node = nodes[i];
				if(node['check_Child_State'] != 1)
					result.push(node);
			}
			return result;
		},
		/**
		 * 去掉全选节点下的子节点
		 * @param nodes
		 */
		_removeRepeat: function(nodes){
			var result = $.extend([],nodes);
			for(var i = 0; i < nodes.length; i ++){
				var node = nodes[i];
				if(node['check_Child_State'] == 2){
					result = this._removeRepeatChildren(result, node);
				}
			}
			return result;
		},
		_removeRepeatChildren: function(nodes, pNode){
			var result = [];
			for(var i = 0; i < nodes.length; i ++){
				var flag = this._z.getNodeByParam('tId', nodes[i].tId , pNode);
				if(!flag)
					result.push(nodes[i]);
			}
			return result;
		},
		/**
		 * ztree树节点异步加载成功事件
		 * 如果本地搜索开启，则刷新本地搜索结果的值
		 * @param event
		 * @param treeId
		 * @param treeNode
		 * @param msg
		 */
		_onAsyncSuccess: function(event, treeId, treeNode, msg){
			this._rendSelectedItems();
		},
		/**
		 * （配合键盘导航事件）
		 * 展开节点后 选中第一个子节点，如果没有子节点
		 * 	则选中当前节点
		 * @param event
		 * @param treeId
		 * @param treeNode
		 */
		_onExpand: function(event, treeId, treeNode){
			var n = null;
			if(treeNode && treeNode.isParent){
				var ns = this._z.getNodesByParam('level', treeNode.level + 1, treeNode);
				if(ns.length > 0){
					n = ns[0];
				}
			}
			if(n){
				this._z.cancelSelectedNode(treeNode);
				this._z.selectNode(n);
			}else{
				this._z.selectNode(treeNode);
			}
			this.focus();
		},
		/**
		 * 根据传入的url进行远程加载数据并渲染
		 * @todo 请求时并加入parameter参数，获取到数据后调用loadData
		 * @param {url} url 要载入的url
		 * @param {callback} callback 加载完成后事件
		 * @example $('#demo').comboztree('reload','data.do');
		 * @memberof comboztree-class
		 * @instance
		 */
		reload: function(url,callback){
			if(!url){
				url = this.setting.url;
			}
			this._ajax(url, function(data){
				this.loadData(data);
				if($.isFunction(callback)){
					callback.call(this, data);
				}
			});
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 清除值
		 * @todo 清除隐藏值
		 * @todo 清除显示值
		 * @todo 清除下拉面板中ztree的选中状态
		 * @memberof comboztree-class
		 * @instance
		 */
		clearValue: function(){
			this.setText('');
			this.setValue('');
			if(this._z != null){
				this._rendSelectedItems();
			}
		},
		/**
		 * 根据当前下拉树的隐藏值查询出相关的节点，
		 * 渲染节点为选中状态，并根据值设置显示值
		 */
		_rendSelectedItems: function(){
			this._clearSelectedNodes();
			var valStr = this.getValue()
				,ztree = this._z;
			if(valStr && ztree){
				var nodes = this._getNodesByValue();
				if(this.setting.multiple){
					for( var i = 0; i < nodes.length; i++) {
						if(this.setting.shrinkValue || this.setting.ignoreHalfCheck)
							ztree.checkNode(nodes[i],true,true);
						else
							ztree.checkNode(nodes[i]);
					}
				}else if(nodes.length == 1){
					ztree.selectNode(nodes[0]);
				}
			}
		},
		/**
		 * 根据隐藏值的等值匹配出ztree的节点
		 */
		_getNodesByValue: function(){
			var result = []
				,ztree = this._z
				,valueField = this.setting.valuefield;
			var vs = this.getValue().split(',');
			for ( var i = 0; i < vs.length; i++) {
				var nodes = ztree.getNodesByParam(valueField,vs[i]);
				for( var j = 0; j < nodes.length; j++) {
					result.push(nodes[j]);
				}
			}
			return $(result);
		},
		/**
		 * 清除已选的节点状态
		 * @param comboztree 下拉树全局对象
		 */
		_clearSelectedNodes: function(){
			var ztree = this._z;
			if(ztree == null){
				//ztree 树还未初始化，无需清理
				return ;
			}
			if(this.setting.multiple){
				ztree.checkAllNodes(false);
			}else{
				var selectedNodes = ztree.getSelectedNodes();
				if(selectedNodes.length == 1){
					ztree.cancelSelectedNode(selectedNodes[0]);
				}
			}
		}
	});
	
	
	$.fn.comboztree = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'comboztree';
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
					component = new Comboztree(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};
	function storeData(data){
		this._mapData = {};
		if(!data){
			return;
		}
		var field = this.setting.idfield;
		for(var i = 0; i < data.length; i++){
			var node = $.extend(true, {}, data[i]);
			this._mapData[node[field]] = node;
		}
	};
	function appendStoreData(msg){
		var data = JSON.parse(msg);
		if(!data){
			return;
		}
		var field = this.setting.idfield;
		for(var i = 0; i < data.length; i++){
			var node = $.extend(true, {}, data[i]);
			this._mapData[node[field]] = node;
		}
	};
	function setSelectedNode(nodes){
		var result = null
			,idField = this.setting.idfield;
		if(this.setting.multiple){
			result = [];
			if(nodes){
				for(var i = 0; i < nodes.length; i++){
					var id = nodes[i][idField];
					if(this._mapData[id]){
						result.push(this._mapData[id]);
					}else{
						result.push(nodes[i]);
					}
				}
			}
		}else{
			if(nodes && nodes[0]){
				var id = nodes[0][idField];
				if(this._mapData[id]){
					result = this._mapData[id];
				}else{
					result = nodes[0];
				}
			}
		}
		this.setSelectedNode(result);
	};
	return Comboztree;
});