/**
 * 联想框控件--继承Combo
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/core/app-options', 'app/data/app-ajax',
        'app/widgets/form/app-combo'], function($, App, Options, AppAjax, Combo) {
	
	'use strict';

	/**
	 * @class 
	 * @classdesc 联想框
	 * <span class="type-signature static">extend</span>combo
	 * @see {@link combo-class} suggest继承至combo
	 * @name suggest-class
	 * @desc 联想框的初始化方法
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @example &lt;input &#9;class="app-suggest"
	 * &#9;_options="{
	 * &#9;&#9;suggest: 'html/example/app-input/data/data.idAndName'
	 * &#9;}"
	 * />
	 * @example $('#demo').suggest({
	 * &#9;suggest: 'html/example/app-input/data/data.idAndName'
	 * });
	 */
	var Suggest = Combo.extend({
		initialize: function (input, options) {
			if(!options){
				options = {};
			}
			options._ = Options.appDefaults.Suggest;
			Suggest.superclass.initialize.call(this, input, options);
			this._init();
		},
		/**
		 * 初始化
		 */
		_init: function(){
			this._editable();
			this._initOptions();
			this._initPanelContent();
			this._registEvents();
			this._eventRegister();
		},
		/**
		 * 初始化设置
		 */
		_initOptions: function(){
			var s = this.setting;
			//如果没有设置suggest地址，则使用url
			if((s.suggest == '' || s.suggest == true)
					&& s.url){
				s.suggest = s.url;
			}
			if(s.suggest == false){
				s.suggest = '';
			}
			//远程加载，可以是remote 或 async
			if(!s.remote && s.async){
				s.remote = true; 
			}
			if(s.textfield == s.valuefield){
				this.setText(s.value);
			}
			if(!s.suggestfield){
				s.suggestfield = s.textfield;
			}
			if(s.suggestClear && !s.multiple){
				s.suggestClear = true;
			}else{
				s.suggestClear = false;
			}
		},
		/**
		 * 初始化下拉面板的内容
		 */
		_initPanelContent: function(){
			initCustomPanel.call(this);
			this.$dropPanelMain.append('<div class="suggest-list">' +
				      				'<ul></ul>' +		
				      			'</div>');
			this.$suggest = this.$dropPanel.find('.suggest-list');
			this.$suggestList = this.$suggest.find('>ul');
			initSelectPanel.call(this);
			fixPosition.call(this);
			function initCustomPanel(){
				var s = this.setting;
				if(s.customPanelHeight && !isNaN(s.customPanelHeight)){
					var customCss = {};
					customCss.height = s.customPanelHeight;
					if(s.customPanelPosition == 'bottom'){
						customCss.bottom = 0;
						customCss['border-top-width'] = 1;
					}else{
						customCss.top = 0;
						customCss['border-bottom-width'] = 1;
					}
					this.$dropPanelCustom.css(customCss);
				}
			}
			function initSelectPanel(){
				this.$dropPanelCustom.before('<div class="selected-list"></div>');
				this.$selectedList = this.$dropPanel.find('.selected-list');
				var slt_height = 0
					,s = this.setting;
				if(s.acceptText){
					slt_height = 0;
				}else if(s.slt_area){
					slt_height = parseInt(s.slt_area);
					if(isNaN(slt_height)){
						slt_height = 0;
					}
				}
				this.$selectedList.css('height', slt_height);
			}
			function fixPosition(){
				var customHeight = this.$dropPanelCustom.height()
					,sltHeight = this.$selectedList.height()
					,dropPanelCss = {};
				dropPanelCss['min-height'] = customHeight + sltHeight + 30;
				if(this.setting.customPanelPosition == 'bottom'){
					this.$dropPanel.css('padding-bottom', customHeight + sltHeight);
					this.$selectedList.css('bottom', customHeight);
				}else{
					this.$dropPanel.css('padding-bottom', sltHeight);
					this.$dropPanel.css('padding-top', customHeight);
				}
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
		},
		/**
		 * 注册控件事件
		 */
		_registEvents: function(){
			this.$text.on('focus.suggest.api', $.proxy(this._textFocusEvent, this));
			var that = this;
			//当联想框作为单独的主体控件
			if(this.$element.hasClass('app-suggest')){
				this.$openBtn.off('click.textbox.api');
				this.$openBtn.on('click.suggest.api', function(e){
					that.$text.focus();
				});
			}else{
				this.$element.data('suggest', this);
			}
			this.$suggestList.on('click.suggest.api', 'li', function(){
				that._suggestItemActive($(this));
			});
			this._onSelectedNodeDeleteEvent();
			this._bindShowHistory();
		},
		/**
		 * 覆盖父类的绑定方法
		 */
		_textChangeEvent: function(){
			if(this.setting.acceptText){
				var that = this;
				this.$text.on('change.textbox.api',function(){
					var selectedNode = that.getSelectedNode()
						,nodeText = that._getSelectedNodeText(selectedNode)
						,text = that.getText()
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
					if(nodeText != text){
						selectedNode = that._createSelectedNode(text);
					}
					that.setSelectedNode(selectedNode);
					if(pos !== null){
						that.$text.setCurPos(pos);
					}
				});
			}
		},
		/**
		 * 显示值文本框获得焦点事件
		 */
		_textFocusEvent: function(){
			var $text = this.$text;
			$text.data('oriText', $text.val());
		},
		_bindShowHistory: function(){
			if(!this._localStorage){
				return;
			}
			var that = this;
			this.$text.on('fucus.suggest.api click.suggest.api', function(){
				if($.trim(that.getText())){
					return;
				}
				that._showHistory();
			}).on('keyup.suggest.api', function(e){
				if(that._mainDivIsVisiable()){
					return;
				}
				if(e.keyCode == App.keyCode.DOWN){
					that._showHistory();
					return;
				}
				if($.trim(that.getText())){
					return;
				}
				that._showHistory();
			});
		},
		_showHistory: function(){
			var nodes = this._localStorage.get();
			if(!nodes){
				return;
			}
			this._render$SuggestNode(nodes);
			this._showPanel();
		},
		/**
		 * 设置已选项的删除按钮事件
		 */
		_onSelectedNodeDeleteEvent: function(){
			var that = this;
			this.$selectedList.on('click.suggest.api', '.sd-close-btn', function(){
				var $selectedNode = $(this).parent()
					,node = that._getNode($selectedNode);
				that.$suggestList.find('.selected[_v="' + node[that.setting.valuefield] + '"]').removeClass('selected');
				$selectedNode.remove();
				that._setSelectedNodeBySltArea();
			});
		},
		/**
		 * 按键事件
		 * 1、联想
		 * 2、导航
		 */
		_keyManager: function(e){
			if(this.stopKeyEvent){
				return;
			}
			if(this._dealSysKey(e)){
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
			}else if(App.containKeyCode(e, s.keyNextSltNode)){
				this._keyNextSltNode(e);
			}else if(App.containKeyCode(e, s.keyPrevSltNode)){
				this._keyPrevSltNode(e);
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
			var keyCode = e.keyCode;
			if(this._isKeyCursorPos(keyCode)){
				this._keyCursorPos(e);
			}else if(this._keyFilterSuggest(e)){
				this.suggest();
			}
		},
		/**
		 * 切换到联想项区域
		 *    并从当前滚动到的可视选项中开始导航
		 */
		_switchSuggest: function(){
			var $c = this.$selectedList.find('.selected-item.current');
			if($c.length > 0){
				$c.removeClass('current');
				var top = this.$suggest.scrollTop()
					,$nodes = this.$suggestList.find('>li')
					,h = $($nodes[0]).outerHeight()
					,index =  Math.floor(top/h);
				$($nodes[index]).addClass('current');
			}
		},
		/**
		 * 切换到联想区域，定位上一个节点
		 */
		_keyPrevNode: function(e){
			e.preventDefault();
			var $l = this.$suggestList;
			if($l.find('>li').length == 0){
				return;
			}
			var $c = $l.find('.current')
				,$n = $c.prev();
			if($n.length == 0){
				$n = $l.find('li:last-child');
			}
			this._switchSuggest();
			$c.removeClass('current');
			$n.addClass('current');
			this._locateSuggest();
		},
		/**
		 * 切换到联想区域，并定位下一个节点
		 */
		_keyNextNode: function(e){
			e.preventDefault();
			this._locateNextNode();
		},
		/**
		 * 定位下一个节点
		 */
		_locateNextNode: function(){
			var $l = this.$suggestList;
			if($l.find('>li').length == 0){
				return;
			}
			var $c = $l.find('.current')
				,$n = $c.next();
			if($n.length == 0){
				$n = $l.find('li:first-child');
			}
			this._switchSuggest();
			$c.removeClass('current');
			$n.addClass('current');
			this._locateSuggest();
		},
		/**
		 * 选中一个节点
		 */
		_keyPickNode: function(e){
			e.preventDefault();
			var $c = this.$dropPanel.find('.current');
			if($c.length == 0){
				return;
			}
			if($c.hasClass('selected-item')){
				$c.find('.sd-close-btn').click();
				this._keyNextSltNode(e);
			}else{
				this._suggestItemActive($c);
				this._locateNextNode();
			}
		},
		/**
		 * 联想项的定位到当前项
		 */
		_locateSuggest: function(){
			var $c = this.$suggestList.find('li.current');
			if($c.length != 1){
				return;
			}
			var top = $c.offset().top + $c.outerHeight() - this.$suggestList.offset().top
				,containerHeight = this.$suggest.outerHeight() -2
				,scrollTop = this.$suggest.scrollTop();
			if(top <= scrollTop){
				this.$suggest.scrollTop(top - $c.outerHeight());
			}else if(top >= scrollTop + containerHeight){
				this.$suggest.scrollTop(top - containerHeight);
			}
		},
		/**
		 * 切换到已选项区域
		 */
		_switchSelected: function(){
			this.$suggestList.find('li.current').removeClass('current');
		},
		/**
		 * 切换到已选区域，定位上一个已选择节点
		 */
		_keyPrevSltNode: function(e){
			e.preventDefault();
			var $slts = this.$selectedList.find('>div');
			if($slts.length == 0){
				return;
			}
			var $c = this.$selectedList.find('>div.current')
				,$n = $c.prev();
			if($n.length == 0){
				$n = $($slts[$slts.length-1]);
			}
			this._switchSelected();
			$c.removeClass('current');
			$n.addClass('current');
			this._locateSelected();
		},
		/**
		 * 切换到已选区域，定位下一个已选择节点
		 */
		_keyNextSltNode: function(e){
			var $slts = this.$selectedList.find('>div');
			if($slts.length == 0){
				return;
			}
			var $c = this.$selectedList.find('>div.current')
				,$n = $c.next();
			if($n.length == 0){
				$n = $($slts[0]);
			}
			this._switchSelected();
			$c.removeClass('current');
			$n.addClass('current');
			this._locateSelected();
		},
		/**
		 * 选择项的定位
		 */
		_locateSelected: function(){
			var $c = this.$selectedList.find('>div.current');
			if($c.length != 1){
				return;
			}
			var t = $c.offset().top - $c.parent().offset().top;
			this.$selectedList.scrollTop(t);
		},
		/**
		 * 根据输入内容进行延迟联想
		 */
		suggest: function(){
			var that = this;
			if(!this.hasBlur){
				this.$text.one('blur.suggest.api',function(){
					var selectedNode = that.getSelectedNode();
 					that.setSelectedNode(selectedNode);
				});
				that.hasBlur = true;
			}
			//保持延迟时间内只触发一次联想操作
			clearTimeout(this.timeout);
			this.timeout = 
				setTimeout(function(){	
					that.$text.off('blur.suggest.api');
					that.hasBlur = false;
					that._suggestFunc();
				}, this.setting.lazy);
		},
		/**
		 * 根据输入的值进行联想
		 * 	保持联想面板打开状态
		 */
		_suggestFunc: function(){
			if(this.stopKeyEvent){
				return;
			}
			if(this.setting.suggestClear){
				this.setSelectedNode(null, true);
				this._setValue('');
			}
			if(!this.isActive()){
				return;
			}
			//如果联想面板不是打开状态，则打开渲染。否则只进行联想
 			if(!this._mainDivIsVisiable() && !this.setting.acceptText){
 				this.showPanel();
 			}
			if(this._preventSuggest()){
				this._selected$SuggestNode();
				return;
			}
			if(this.setting.acceptText){
				this.$selectedList.html('');
			}
			if(this._onBeforeLoad() === false){
				return;
			}
			this.refreshSuggest();
		},
		isSuggesting: function(){
			return this._mainDivIsVisiable(); 
		},
		refreshSuggest: function(){
			if(this.setting.remote){
				this._suggestByRemote();
			}else{
				this._suggestByLocal();
			}
		},
		/**
		 * 阻止联想事件
		 * 1、当联想的关键字为空
		 * 2、当联想的关键字与上次联想的相同
		 * 3、当上次联想为空 且这次的关键字以上次的关键字开头
		 * @returns true 进行阻止
		 */
		_preventSuggest: function(){
			var key = this.getText()
				,stop = false;
			if(!$.trim(key)){
				stop = true;
			}else if(!this.prevKey){
				
			}else if(!this.setting.acceptText 
					&& this.prevKey == key 
					&& this.prevParameter == JSON.stringify(this.getParameter())){
				stop = true;
			}
			this.prevParameter = JSON.stringify(this.getParameter());
			this.prevKey = key;
			return stop;
		},
		/**
		 * 根据远程设置地址进行联想
		 * @param sugest 联想框全局对象
		 */
		_suggestByRemote: function(){
			var url = this.setting.suggest
				,onlyleaf = this.setting.onlyleaf
				,that = this;
			if(url){
				var queryParams = $.extend({}, this.getParameter());
				queryParams._key = this.getText();
				queryParams.suggestfield = this.setting.suggestfield;
				this.$dropPanelLoading.show();
				AppAjax.ajaxCall({
					url: url,
					data: queryParams,
					dataType: 'json',
					type: 'POST',
					success: function(data){
						that.$dropPanelLoading.hide();
						var result = [];
						if(onlyleaf){
							for(var i = 0; i < data.length; i ++){
								if(that._isLeaf(data, data[i]))
									result.push(data[i]);
							}
						}else
							result = data;
						that._render$SuggestNode(result);
					}
				});	
			}
		},
		/**
		 * 根据本地数据源进行匹配
		 * 1、如果存在本地数据源则直接进行匹配
		 * 2、如果不存在，本地数据源，则根据suggest资源地址初始化数据源后，再进行匹配
		 */
		_suggestByLocal: function(){
			this._initDataByParameter();
			if(this.setting.data != undefined){
				var suggestData = this._filterByKey();
				this._render$SuggestNode(suggestData);
			}else{
				var url = this.setting.suggest
					,that = this;
				if(url){
					this.$dropPanelLoading.show();
					AppAjax.ajaxCall({
						url: url,
						data: this.getParameter(),
						dataType: 'json',
						type: 'POST',
						success: function(data){
							that.$dropPanelLoading.hide();
							that.setting.data = data;
							that._suggestByLocal();
						}
					});	
				}
			}
		},
		
		/**
		 * 根据查询参数重置联想框的数据源
		 */
		_initDataByParameter: function(){
			var currParam = this.getParameter();
			if(currParam){
				if(JSON.stringify(this.lastParam) != JSON.stringify(currParam)){
					this.setting.data = undefined;
				}
				this.lastParam = currParam;
			}
		},
		/**
		 * 根据数据源按照key模糊匹配节点，并设置联想项
		 * @param data 节点数据源数组
		 * @param key 匹配关键字
		 * @returns {Array} 匹配的节点数组
		 */
		_filterByKey: function(){
			var data = this.setting.data
				,key = this.getText().toUpperCase()
				,field = this.setting.suggestfield
				,onlyleaf = this.setting.onlyleaf
				,result = [];
			if(!field){
				field = this.setting.textfield;
			}
			var fs = field.split(',');
			for(var i = 0; i < data.length; i++){
				for ( var j = 0; j < fs.length; j++) {
					var val = data[i][fs[j]];
					if(val){
						val = val.toUpperCase();													
						if(val.indexOf(key) != -1){
							if(onlyleaf && !this._isLeaf(data, data[i])){
								break;
							}
							result.push(data[i]);
							break;
						}
					}
				}
			}
			return result;
		},
		/**
		 * 当只能选择叶子节点时，判断传入的该节点是否为叶子节点，否则返回true
		 * @param id
		 */
		_isLeaf: function(data, node){
			var pidfield = this.setting.pidfield
				,valuefield = this.setting.valuefield;
			if(node['isParent'] == 'true' || node['isParent'] == true)
				return false;
			for(var i = 0; i < data.length; i++){
				if(data[i][pidfield] == node[valuefield])
					return false;
			}
			return true;
		},
		/**
		 * 渲染联想项列表
		 */
		_render$SuggestNode: function(data){
			this.$suggestList.html('');
			var vf = this.setting.valuefield
				,tf = this.setting.textfield
				,key = this.getText();
			if(data.length == 0){
				this.$dropPanelEmpty.show();
			}else{
				this.$dropPanelEmpty.hide();
			}
			for ( var i = 0; i < data.length; i++) {
				var node = data[i]
					,$suggestItem = $('<li _v="' + node[vf] + '"><i class="icon-ok"></i>' + 
									this._getSuggestText(node[tf], key) + '</li>');
				this.$suggestList.append($suggestItem);
				this._setNode($suggestItem, node);
			}
			this._selected$SuggestNode();
			if(data.length == 1){
				this._locateNextNode();
			}
			if(this.setting.acceptText){
				if(data.length == 0){
					this.hidePanel();
				}else{
					this.showPanel();
				}
			}
			this._resetPanelWidth();
		},
		/**
		 * 获取显示名称
		 * @param text
		 * @param key
		 * @returns {String}
		 */
		_getSuggestText: function(text, key){
			if(key == ''){
				return text;
			}
			var index = text.indexOf(key);
			if(index == -1){
				index = text.toUpperCase().indexOf(key.toUpperCase());
				if(index == -1){
					return text;
				}
			}
			var keyLen = key.length;
			return text.substring(0,index) +
				'<em>' + text.substring(index, index+keyLen) +'</em>' +
				text.substring(keyLen + index);
		},
		/**
		 * 按照已选节点进行渲染联想项
		 */
		_selected$SuggestNode: function(){
			var selectedNode = this.getSelectedNode()
				,vf = this.setting.valuefield
				,that = this;
			if(!selectedNode){
				selectedNode = [];
			}else{
				if(!$.isArray(selectedNode)){
					selectedNode = [selectedNode];
				}
			}
			for(var i = 0; i < selectedNode.length; i++){
				var $select = this.$suggestList.find('li[_v="' + selectedNode[i][vf] + '"]');
				$select.addClass('selected');
			}
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 显示或隐藏下拉面板，该方法已绑定在组件的右边按钮中
		 */
		togglePanel: function(){
			
		},
		/**
		 * 显示当前对象的联想面板
		 * 1、关闭其他可见的联想面板
		 * 2、根据隐藏值进行渲染选择项
		 * 3、开启点击html关闭该面板的操作
		 */
		showPanel: function(){
			if(this.context && !this.setting.suggestCustomPanel){
				this.$dropPanelCustom.hide();
				this.$dropPanel.append(this.context.$dropPanelCustom);
			}
			this._render$SelectedNode();
			this._showPanel();
		},
		/**
		 * 根据隐藏值进行渲染选择项
		 * 1、如果已设置显示值，则根据显示值结合隐藏值进行匹配设置，
		 * 		如果显示值和隐藏值不匹配，则无法完成渲染
		 * 2、如果没有设置显示值，而使用本地数据源，则根据隐藏值匹配出显示值，并渲染选择项
		 */
		_render$SelectedNode: function(){
			this._resetRender();
			this._reset$SelectedNode();
			var selectedNode = this.getSelectedNode();
			if(!selectedNode){
				return;
			}
			if($.isArray(selectedNode)){
				for (var i = 0; i < selectedNode.length; i++) {
					this._appendSelectedItem(selectedNode[i]);
				}
			}else{
				this._appendSelectedItem(selectedNode);
			}
		},
		/**
		 * 设置选中节点
		 */
		_reset$SelectedNode: function(){
			var node = this.getSelectedNode();
			if(node){
				return;
			}
			var value = this.getValue();
			if(!value){
				return;
			}
			var vs = value.split(',')
				,text = this.$text.data('oriText')
				,vf = this.setting.valuefield
				,tf = this.setting.textfield
				,multiple = this.setting.multiple
				,selectedNode = [];
			if(text){
				var ts = text.split(',');
				for ( var i = 0; i < vs.length; i++) {
					var node = {};
					node[vf] = vs[i];
					node[tf] = ts[i];
					selectedNode.push(node);
				}
			}else if(this._isLocalSuggest()){
				selectedNode = this._getSelectedNodeByValue(vs);
			}
			if(multiple){
				this.setSelectedNode(selectedNode, true);
			}else{
				this.setSelectedNode(selectedNode[0], true);
			}
		},
		/**
		 * 根据隐藏值匹配数据源，并生成选择项数据
		 * @param vs 隐藏值数组
		 */
		_getSelectedNodeByValue: function(vs){
			var result = []
				,data = this.setting.data
				,valueField = this.setting.valuefield;
			for ( var i = 0; i < vs.length; i++) {
				for(var j =0; j < data.length; j++){
					if(vs[i] == data[j][valueField]){
						result.push(data[j]);
						continue;
					}
				}
			}
			return result;
		},
		/**
		 * 判断是否为本地数据源联想
		 * @returns true
		 */
		_isLocalSuggest: function(suggest){
			if(this.setting.data != undefined 
					&& !this.setting.async){
				return true;
			}
			return false;
		},
		/**
		 * 隐藏联想框
		 * 1、关闭html的click.suggest.api事件代理
		 * 2、根据当前选择项设置联想框的显示值和隐藏值
		 */
		hidePanel: function(){
			if(this._mainDivIsVisiable()){
				this.$dropPanel.hide();
				$(document).off('click.combo.api');
				if(!this.setting.acceptText){
					this.setSelectedNode(this.getSelectedNode());
				}
			}
		},
		/**
		 * 根据文本生成一个固定节点
		 */
		_createSelectedNode: function(text){
			var selectedNode = {};
			selectedNode[this.setting.textfield] = text;
			selectedNode[this.setting.valuefield] = text;
			return selectedNode;
		},
		/**
		 * 获取以选中节点的文本
		 */
		_getSelectedNodeText: function(nodes){
			if(!nodes){
				return '';
			}
			var text = ''
				,tf = this.setting.textfield;
			if($.isArray(nodes)){
				for(var i = 0; i < nodes.length; i++){
					text += nodes[i][tf] + ',';
				}
				if (text.length > 0 ) text = text.substring(0, text.length-1);
			}else{
				text = nodes[tf] ? nodes[tf] : '';
			}
			return text;
		},
		/**
		 * 载入数据，并根据数据渲染下拉面板
		 * @param {Array.<Node>} data 载入的数据列表
		 * @todo 根据数据渲染下拉面板的内容
		 * @todo 设置联想为本地联想
		 * @example $('#demo').suggest('loadData',[{id:1,name:'是'},{id:0,name:'否'}]);
		 * @memberof suggest-class
		 * @instance
		 */
		loadData: function(data){
			this.setting.data = data;
			this.setting.remote = false; 
		},
		/**
		 * 根据url载入数据源作为联想的数据源
		 * @param {url} url 要加载的url
		 * @todo 根据数据渲染下拉面板的内容
		 * @todo 设置联想为本地联想
		 * @example $('#demo').combobox('reload','a.do');
		 * @memberof suggest-class
		 * @instance
		 */
		reload: function(url){
			if(url){
				var that = this;
				this.$dropPanelLoading.show();
				AppAjax.ajaxCall({
					url: url,
					data: this.getParameter(),
					dataType: 'json',
					type: 'POST',
					success: function(data){
						that.$dropPanelLoading.hide();
						that.loadData(data);
					}
				});	
			}
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 清除值
		 * @todo 清除隐藏值
		 * @todo 清除显示值
		 * @todo 清除面板的选择项
		 * @memberof suggest-class
		 * @instance
		 */
		clearValue: function(){
			this.setText('');
			this.setValue('');
			this._resetRender();
			this.setSelectedNode(null);
		},
		/**
		 * 重置当前联想项列表的选中状态和已选项项节点
		 */
		_resetRender: function(){
			this.$suggestList.find('li.selected').removeClass('selected');
			this.$selectedList.html('');
		},
		/**
		 * 根据已选框的选项设置组件的已选节点
		 */
		_setSelectedNodeBySltArea: function(){
			var $selectedNodes = this.$selectedList.children()
				,selectedNode = [];
			for(var i = 0; i< $selectedNodes.length; i++){
				selectedNode.push(this._getNode($($selectedNodes[i])));
			}
			if(!this.setting.multiple){
				selectedNode = selectedNode[0];
				if(selectedNode == undefined){
					selectedNode = null;
				}
			}
			this.setSelectedNode(selectedNode, !this.setting.acceptText);
		},
		/**
		 * 联想被激发
		 * 1、如果存在自定义选择前事件，先执行该事件，如果返回false 则结束选择，否则执行2
		 * 2、单选则设值当前选择项为值，并关闭下拉框；多选则追加当前选择项为值
		 * 3、如果存在自定义选择后事件，则执行该事件
		 * @param $node 被激发的联想项
		 */
		_suggestItemActive: function($node){
			if(this._isSelected($node)){
				this._unselect$SuggestNode($node);
				this._setSelectedNodeBySltArea();
			}else{
				this._select$SuggestNode($node);
			}
		},
		/**
		 * 判断该节点是否已经被选中
		 */
		_isSelected: function($node){
			return $node.hasClass('selected');
		},
		/**
		 * 将节点设置为选中的样式
		 */
		_select$SuggestNode: function($node){
			/**
			 * 节点被选择前事件，并返回一个值，当为false时取消选择操作
			 * @event suggest-class#beforeSelected
			 * @param {Node} node 被选择的节点
			 * @returns {Boolean} boolean 返回值为false 取消选择
			 */
			if(this._active$NodeEvent('beforeSelected', $node) === false){
				return;
			}
			var node = this._getNode($node);
			if(this.setting.multiple){
				$node.addClass('selected');
				this._appendSelectedItem(node);
				this._setSelectedNodeBySltArea();
			}else{
				this.$suggestList.find('li.selected').removeClass('selected');
				this.$selectedList.html('');
				$node.addClass('selected');
				this._appendSelectedItem(node);
				this._setSelectedNodeBySltArea();
				this.hidePanel();
			}
			/**
			 * 节点选择后事件
			 * @event suggest-class#afterSelected
			 * @param {Node} node 被选择的节点
			 */
			this._active$NodeEvent('afterSelected', $node);
		},
		/**
		 * 将节点设置为未选中的样式
		 */
		_unselect$SuggestNode: function($node){
			$node.removeClass('selected');
			var node = this._getNode($node);
			this.$selectedList.find('.selected-item[_v="' + node[this.setting.valuefield] + '"]').remove();
		},
		/**
		 * 执行自定义选择前事件
		 * @param $node 当前被点击的选择项
		 * @returns {Boolean} false 结束点击事件
		 */
		_active$NodeEvent: function(eventName, $node){
			if(this.hasBindEvent(eventName)){
				return this.trigger(eventName, this._getNode($node));
			}
		},
		/**
		 * 根据Li选择项获取当前节点
		 * @param li Li选择项
		 * @returns {}
		 */
		_getNode: function ($node){
			return $node.data('node');
		},
		/**
		 * 设置Li选择项获取当前节点
		 * @param li Li选择项
		 * @returns {}
		 */
		_setNode: function ($node, node){
			$node.data('node', node);
		},
		/**
		 * 追加选择项到已选面板
		 * @param node 节点数据
		 */
		_appendSelectedItem: function(node){
			if(this.$selectedList.find('.selected-item[_v="' + node[this.setting.valuefield] + '"]').length == 0){
				var $selectedNode = $('<div class="selected-item" _v="' + node[this.setting.valuefield] + '">' + 
						node[this.setting.textfield] + '<span class="sd-close-btn"></span></div>');
				this._setNode($selectedNode, node);
				this.$selectedList.append($selectedNode);
			}
		}
	});
	
	$.fn.suggest = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'suggest';
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
					component = new Suggest(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};

	return Suggest;
});