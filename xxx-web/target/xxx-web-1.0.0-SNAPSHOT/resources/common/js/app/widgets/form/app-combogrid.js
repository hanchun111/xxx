/**
 * 下拉表格控件--继承Combo
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/data/app-ajax', 'app/widgets/form/app-combo',
        'app/core/app-options', 'app/widgets/grid/app-grid'],
        function($,App, AppAjax, Combo, Options, Grid, Suggest) {
	
	
	'use strict';
	/**
	 * @class 
	 * @classdesc 下拉表格
	 * <span class="type-signature static">extend</span>combo
	 * <span class="type-signature static">reference</span>grid
	 * @see {@link combo-class} 查看combo组件
	 * @see {@link grid-class} 查看grid组件
	 * @name comboGrid-class
	 * @desc 下拉表格的初始化方法，初始化grid时会优先使用combogrid的options属性
	 * @param {DOMElement} input 要渲染的input组件
	 * @param {Object} options 组件的选项设置 
	 * @author Mr.T
	 * @example &lt;input &#9;class="app-combogrid"
	 * &#9;_options="{
	 * &#9;&#9;url: 'platform/sample/base/ui/combogridData.do',
	 * &#9;&#9;columns: [[
	 * &#9;&#9;&#9;{title: 'id列',field: 'id',hidden:true},
	 * &#9;&#9;&#9;{title: '名称列',field: 'name',width: 100},
	 * &#9;&#9;&#9;{title: '主列标题3',field: 'c3',width: 150},
	 * &#9;&#9;&#9;{title: '主列标题4',field: 'c4',width: 200},
	 * &#9;&#9;&#9;{title: '主列标题5',field: 'c5',width: 250},
	 * &#9;&#9;&#9;{title: '主列标题6',field: 'c6',width: 500}
	 * &#9;&#9;]]
	 * &#9;}"
	 * />
	 * @example $('#demo').combogrid({
	 * &#9;url: 'platform/sample/base/ui/combogridData.do',
	 * &#9;columns: [[
	 * &#9;&#9;{title: 'id列',field: 'id',hidden:true},
	 * &#9;&#9;{title: '名称列',field: 'name',width: 100},
	 * &#9;&#9;{title: '主列标题3',field: 'c3',width: 150},
	 * &#9;&#9;{title: '主列标题4',field: 'c4',width: 200},
	 * &#9;&#9;{title: '主列标题5',field: 'c5',width: 250},
	 * &#9;&#9;{title: '主列标题6',field: 'c6',width: 500}
	 * &#9;]]
	 * });
	 */
	var Combogrid = Combo.extend({
		initialize: function(input, options) {
			if(!options){
				options = {};
			}
			options._ = $.extend({}, Options.appDefaults.Combogrid, options._); 
			Combogrid.superclass.initialize.call(this, input, options);
			this._init();
		},
		/**
		 * 初始化
		 */
		_init: function(){
			this._initOptions();
			this._initPanelContent();
			this._registEvents();
			this._eventRegister();
			this.$input.data('context', this);
		},
		/**
		 * 初始化网格设置
		 */
		_initOptions: function(){
			var s = this.setting;
			s.multiple = s.checkbox || s.multiple;
			if(!s.suggestfield){
				s.suggestfield = this.setting.textfield;
			}
			if(this.setting.search || this.setting.usesuggest){
				this.setting.search = true;
			}
			this.$dropPanelMain.css('overflow','hidden');//由内部网格代理滚动
		},
		/**
		 * 初始化下拉面板的内容
		 */
		_initPanelContent: function(){
			this.$grid = $('<table></table>');;
			this.$grid.appendTo(this.$dropPanelMain);
		},
		/**
		 * 事件注册器
		 */
		_eventRegister: function(){
			var s = this.setting;
			this.$dropPanelMain.off('mousewheel.combo.api')
			this.$dropPanelMain.off('scroll.combo.api');
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
			if(this.setting.search){
				this._editable();
				this.$text.on('click.combogrid-local.api', $.proxy(this._textFocusEvent,this));
			}
		},
        _textChangeEvent: function(){
			var that = this;
			this.$text.on('change.textbox.api',function(){
				var $this = $(this);
				if(that.setting.acceptText){
					var node = {};
					node[that.setting.textfield] = $this.val();
					node[that.setting.valuefield] = $this.val();
					that.setSelectedNode(node);
				}
			})
		},
		/**
		 * 显示值文本框获得焦点事件
		 * 	并绑定一次焦点失去恢复文本事件
		 */
		_textFocusEvent: function(){
			var that = this;
			this.$text[0].select();
			if(this.$text.data('oriText')!==undefined){
				return;
			}
			this.$text.data('oriText',this.getText());
			this.$text.one('blur.combogrid-local.api', function(){
				var oriText = that.$text.data('oriText');
				that.$text.removeData('oriText');
				if(!that._grid){
					return;
				}
				var nodes = that._grid.getSelections()
					,$this = $(this);
				if(that.setting.acceptText){

				}else if(nodes.length == 0){
					$this.val(oriText);
				}
			});
		},
		/**
		 * 设置请求远程数据时的查询参数
		 * @param {object} param 查询参数
		 * @example $('#demo').combogrid('setParameter',{year:2014});
		 * @memberof comboGrid-class
		 * @instance
		 */
		setParameter: function(param){
			if(!param){
				param = {};
			}
			this.$input.data('_parameter', param);
			if(this._grid){
				this._grid.setParameter(this.getParameter());
			}
		},
		/**
		 * 根据传入的url进行远程加载数据并渲染
		 * @param {url} url 要载入的url
		 * @todo 请求时并加入parameter参数，获取到数据后调用loadData
		 * @example $('#demo').combogrid('reload','a.do');
		 * @memberof comboGrid-class
		 * @instance
		 */
		reload: function(url){
			var grid = this._grid;
			if(grid){
				grid.load(url);
			}else{
				this.setting.url = url;
			}
		},
		/**
		 * 载入数据，并根据数据渲染面板中的网格数据
		 * @param {Array.<Node>} data 载入的数据列表
		 * @todo 请求时并加入parameter参数，获取到数据后调用loadData
		 * @example $('#demo').combogrid('loadData',[]);
		 * @memberof comboGrid-class
		 * @instance
		 */
		loadData: function(data){
			this._grid.loadData(data);
			this._rendSelectedItems();
			//内容填充后，显示面板，重新定位
			if(this._mainDivIsVisiable()){
				this.place();
			}
		},
		/**
		 * 按键事件
		 */
		_keyManager: function(e){
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
			}else if(App.containKeyCode(e, s.keyNextPage)){
				this._keyNextPage(e);
			}else if(App.containKeyCode(e, s.keyPrevPage)){
				this._keyPrevPage(e);
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
				if(e.keyCode == App.keyCode.ENTER){
					return;
				}
				this.suggest();
			}
		},
		/**
		 * 选中一个节点
		 */
		_keyPickNode: function(e){
			e.preventDefault();
			var g = this._grid
				,cureentRowIndex = g.getCurrentRowIndex()
				,cureentRowData = g.getCurrentRowData()
				,isSelectedRow = g.isSelectedRow(cureentRowIndex);
			if(cureentRowIndex == -1){
				return;				
			}
			if(isSelectedRow){
				g.unselectRow(cureentRowIndex);
				this._setBySelections();
			}else{
				g.selectRow(cureentRowIndex);
				this._setBySelections();
			}
		},
		/**
		 * 定位上一个节点
		 */
		_keyPrevNode: function(e){
			e.preventDefault();
			this._grid.prevRow();
			this._grid.locateCurrent();
		},
		/**
		 * 定位下一个节点
		 */
		_keyNextNode: function(e){
			e.preventDefault();
			this._grid.nextRow();
			this._grid.locateCurrent();
		},
		/**
		 * 上一页
		 */
		_keyPrevPage: function(e){
			e.preventDefault();
			this._grid.prevPage();
		},
		/**
		 * 下一页
		 */
		_keyNextPage: function(e){
			e.preventDefault();
			this._grid.nextPage();
		},
		/**
		 * 根据输入内容进行延迟联想
		 */
		suggest: function(){
			if(!this.setting.search){
				return;
			}
			//如果联想面板不是打开状态，则打开渲染。否则只进行联想
			if(!this._mainDivIsVisiable()){
				this.showPanel();
			}
			//保持延迟时间内只触发一次联想操作
			clearTimeout(this.timeout);
			var that = this;
			this.timeout = 
				setTimeout(function(){
					that._suggestFunc();
				},this.setting.lazy);
		},
		/**
		 * 根据输入的值进行联想
		 * 	保持联想面板打开状态
		 */
		_suggestFunc: function(){
			if(this._preventSuggest()){
				return;
			}
			var key = this.getText();
			if(this._grid.$pagers && this._grid.$pagers.length > 0){
				this._suggestByRemote(key);
			}else{
				this._suggestByLocal(key);
			}
		},
		/**
		 * 还原数据
		 */
		_backDataSource: function(){
			if(!this.setting.search){
				return;
			}
			if(!this.isSuggestData){
				return;
			}
			if(this._grid.$pagers && this._grid.$pagers.length > 0){
				this._suggestByRemote('');
			}else{
				this._suggestByLocal('');
			}
			this.isSuggestData = false;
		},
		/**
		 * 阻止联想事件
		 * 1、当联想的关键字与上次联想的相同
		 * 2、当上次联想为空 且这次的关键字以上次的关键字开头
		 * @returns true 进行阻止
		 */
		_preventSuggest: function(){
			var key = this.getText()
				,items = this._grid.getData()[this._grid.setting.jsonReader.rows];
			if(this.prevKey == key){
				return true;
			}else if(this.prevKey && key.length >= this.prevKey.length
					&& key.indexOf(this.prevKey) == 0
					&& (items == undefined || items.length == 0)){
				return true;
			}
			this.prevKey = key;
			return false;
		},
		/**
		 * 根据远程设置地址进行联想
		 */
		_suggestByRemote: function(key){
			var url = this.setting.url;
			if(url){
				var parameter = this.getParameter();
				if(parameter){
					parameter._key = key;
				}else{
					parameter = {_key: key};
				}
				this.isSuggestData = true;
				parameter.suggestfield = this.setting.suggestfield;
				this._grid.setParameter(parameter);
				this._grid.load();
			}
		},
		/**
		 * 根据本地数据源进行匹配
		 * 1、如果存在本地数据源则直接进行匹配
		 * 2、如果不存在，本地数据源，则根据suggest资源地址初始化数据源后，再进行匹配
		 */
		_suggestByLocal: function(key){
			this._cachePageData();
			var data = this._filterByKey(key);
			this.isSuggestData = true;
			this._grid.loadData(data);
		},
		/**
		 * 将当前页面的数据当做数据源
		 */
		_cachePageData: function(){
			if(!this.dataSource){
				this.dataSource = this._grid.getData()[this._grid.setting.jsonReader.rows];
			}
		},
		/**
		 * 根据数据源按照key模糊匹配节点，并设置联想项
		 * @param data 节点数据源数组
		 * @param key 匹配关键字
		 * @returns {Array} 匹配的节点数组
		 */
		_filterByKey: function(key){
			var data = this.dataSource
				,upKey = key.toUpperCase()
				,field = this.setting.suggestfield
				,result = [];
			var fs = field.split(',');
			if(fs.length == 1){
				fs = fs[0];
				for(var i = 0; i < data.length; i++){
					var t = data[i][fs].toUpperCase();
					if(t.indexOf(upKey) != -1)
						result.push(data[i]);
				}
			}else{
				for(var i = 0; i < data.length; i++){
					for ( var j = 0; j < fs.length; j++) {
						var t = data[i][fs[j]].toUpperCase();													
						if(t.indexOf(upKey) != -1){
							result.push(data[i]);
							break;
						}
					}
				}
			}
			return result;
		},
		/**
		 * 显示下拉面板
		 * @todo 初始化一次网格
		 * @todo 根据隐藏值渲染选择项
		 * @todo 显示面板，根据面板内容进行面板位置的调整
		 * @example $('#demo').combogrid('showPanel');
		 * @memberof comboGrid-class
		 * @instance
		 */
		showPanel: function(){
			this._showPanel(function(){
				this._initGrid();
				this._rendSelectedItems();
				this._backDataSource();
			});
		},
		/**
		 * 初始化网格
		 */
		_initGrid: function(){
			if(!this._grid){
				var s = this.setting
					,that = this;
				if(!this.option){
					s.innerGrid = $.extend({}, Options.appDefaults.Grid, Options.appDefaults.Combogrid.Grid, s);
				}else{
					s.innerGrid = $.extend({}, Options.appDefaults.Grid, Options.appDefaults.Combogrid.Grid, s, this.option);
				}
				delete s.innerGrid.width;
				s.innerGrid.height = s.panelheight;
				if(!isNaN(s.customPanelHeight)){
					s.innerGrid.height -= s.customPanelHeight;
				}
				s.innerGrid.beforeSelect = function(rowData, rowIndex){
					/**
					 * 节点选择前事件，并返回一个值，当为false时取消选择操作
					 * @event comboGrid-class#beforeSelected
					 * @param {Object} rowData 被选择的行数据
					 * @param {Number} rowIndex 被选择的行号
					 * @returns {Boolean} boolean 返回值为false 取消选择
					 */
					return that._activeItemEvent('beforeSelected', rowData, rowIndex);
				};
				s.innerGrid.onSelect = function(rowData, rowIndex){
					that._setBySelections();
					/**
					 * 节点选择后事件
					 * @event comboGrid-class#afterSelected
					 * @param {Object} rowData 被选择的行数据
					 * @param {Number} rowIndex 被选择的行号
					 */
					that._activeItemEvent('afterSelected', rowData, rowIndex);
				};
				s.innerGrid.afterDataRender = function(){
					that._resetPanelWidth(this.$xProxyScroll);
					that.place();
					that._rendSelectedItems();
					that._locateRowAfterRender();
					that._afterDataRender();
				};
				s.innerGrid.queryParams = this.getParameter();
				s.innerGrid.columnManager = false;
				this.lastParam = s.innerGrid.queryParams;
				this.$grid.grid(s.innerGrid);
				this._grid = this.$grid.data('grid');
				this._grid._combogrid = this;
				this.onceRender = true;
				this._setMinSize();
			}else{
				this._initData();
			}
		},
		/**
		 * 设置下拉面板的最小宽度和高度
		 */
		_setMinSize: function(){
			var css = {}
				,s = this.setting
				,minWidth = 0
				,minHeight = 30;
			if(this._grid.setting.pager == 'down'){
				minWidth += 90;
				minWidth += this._grid.$pagerDown.find('.pager-infos').outerWidth();
				minWidth += this._grid.$pagerDown.find('.pager-tool').outerWidth();
				minHeight += this._grid.$pagerDown.outerHeight();
			}else if(this._grid.setting.pager == 'up'){
				minWidth += this._grid.$title.find('>span').outerWidth();
				minWidth += this._grid.$title.find('.grid-pager').outerWidth();
			}else{
				minWidth = this.$element.outerWidth();
			}
			if(!isNaN(s.customPanelHeight)){
				minHeight += s.customPanelHeight;
			}
			minHeight += this._grid.$title.outerHeight();
			minHeight += this._grid.$tableHeader.outerHeight();
			minHeight += this._grid.$tableFooter.outerHeight();
			css['min-width'] = minWidth;
			css['min-height'] = minHeight;
			this.$dropPanel.css(css);
		},
		/**
		 * 数据渲染完成后 对当前行的设置和定位
		 */
		_locateRowAfterRender: function(){
			var grid = this._grid
				,selectedRowIndex = grid.getSelectedRowIndex();
			if(selectedRowIndex >= 0){
				grid.setCurrentRow(selectedRowIndex);
				grid.locateRow(selectedRowIndex);
			}else{
				grid.setCurrentRow(0);
				grid.locateRow(0);
			}
		},
		/**
		 * 激活行点击事件 
		 * @param rowData 行数据
		 * @param rowIndex 行号
		 * @returns {Boolean} false 结束点击事件
		 */
		_activeItemEvent: function(eventName, rowData, rowIndex){
			return this.trigger(eventName, rowData, rowIndex);
		},
		/**
		 * <span class="type-signature static">override</span>
		 * 显示或隐藏下拉面板，该方法已绑定在组件的右边按钮中
		 * @todo 判断当前面板是否可见：
		 * @todo 1如果不可见，调用showPanel
		 * @todo 2如果可见，则关闭面板
		 * @see combo#togglePanel
		 * @example $('#demo').combogrid('togglePanel');
		 * @memberof comboGrid-class
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
		 * 获取下拉网格的中的网格元素
		 * @see combo#getTable
		 * @example $('#demo').combogrid('getTable');
		 * @memberof comboGrid-class
		 * @instance
		 */
		getTable: function(){
			return this.$grid;
		},
		/**
		 * 根据网格的选中项进行设置值
		 */
		_setBySelections: function(){
			var rows = this._grid.getSelections();
			if(this.setting.multiple){
				this._grid.nextRow();
				this._grid.locateCurrent();
			}else{
				rows = rows[0];
				if(rows){
					this.hidePanel();
				}
			}
			this.setSelectedNode(rows);
		},
		/**
		 * 根据id值 设置网格的选中项
		 */
		_rendSelectedItems: function(){
			this._grid.unselectAll();
			var valueStr = this.getValue();
			if(!valueStr){
				return;
			}
			var vs = valueStr.split(',')
				,filter = {type: 'id'};
			for ( var i = 0; i < vs.length; i++) {
				filter.value = vs[i];
				this._grid._renderRow(filter);
			}
		},
		/**
		 * 结束拖动进行表格的高度自适应
		 * 宽度自适应有don结构和css自动解决
		 */
		_endResize: function(){
			var s = this.setting;
			this._grid.setting.height = this.$dropPanel.outerHeight();
			if(!isNaN(s.customPanelHeight)){
				this._grid.setting.height -= s.customPanelHeight;
			}
			this._grid._fixHeight();
		}
	});

	$.fn.combogrid = function (option, value) {
		var methodReturn = undefined
			,args = arguments
			,componentName = 'combogrid';
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
					component = new Combogrid(this, option);
					$this.data(componentName, component);
				}else{
					App.throwCompInitError($this, componentName);
				}
			}
		});
		return methodReturn;
	};
	return Combogrid;
});