/**
 * 网格控件
 * @author Mr.T
 */
define(['app/core/app-base', 'app/core/app-jquery', 'app/core/app-options', 'app/core/app-core',
        'app/data/app-ajax', 'app/widgets/grid/app-grid-headerContextMenu', 'app/widgets/grid/app-grid-editor',
        'app/widgets/grid/app-grid-formatter', 'app/widgets/grid/app-grid-print', 'app/widgets/grid/app-grid-sort',
        'app/widgets/grid/app-grid-summary', 'app/widgets/grid/app-grid-ext', 'app/widgets/grid/app-grid-pager', 
        'app/widgets/grid/app-grid-merger', 'app/widgets/grid/app-grid-toolbar', 'jquery/jquery.mousewheel'],
    function(Base, $, Options, App, AppAjax, GridHeaderContextMenu,
             GridEditor, Formatter, GridPrint, GridSort, GridSummary,
             GridExt, GridPager, GridMerger, GridToolbar) {

	'use strict';
	var scrollBarWidth = 18
		,cellBorderWidth = 1
		,minWidth = 20
		,currentRowCls = 'row-current'
		,hoverRowCls = 'row-hover'
		,selectedRowCls = 'row-selected'
		,checkedRowCls = 'row-checked'
		,loading = '正在努力加载中...'
		,empty = '无记录'
		,error = '数据加载出错'
		,IE8_TD_EMPTY = ' '
		,VIEW_TYPE={GRID_VIEW:'GridView',CARD_VIEW:'CardView'};//视圉类型，GRID_VIEW为网格视力,CARD_VIEW为卡片式视图

	/**
	 * @class
	 * @classdesc 表格
	 * @name grid-class
	 * @desc 表格的初始化方法
	 * @param {input} table 要渲染的table组件
	 * @param {object} options 组件的选项设置
	 * @author Mr.T
	 * @example $('#demo').grid({
	 * &#9;title: '数据控制',
	 * &#9;rownumbers: true,
	 * &#9;url: 'platform/sample/base/ui/gridDemo.do',
	 * &#9;columns: [
	 * &#9;[
	 * &#9;&#9;{title:'组合1-3',colspan:3},
	 * &#9;&#9;{title:'主列标题7=1',field:'c1',width:200,rowspan:2},
	 * &#9;&#9;{title:'组合3-6',colspan:3}
	 * &#9;],[
	 * &#9;&#9;{title: '主列标题1',field: 'c1',width: 100},
	 * &#9;&#9;{title: '主列标题2',field: 'c2',width: 120},
	 * &#9;&#9;{title: '主列标题3',field: 'c3',width: 150},
	 * &#9;&#9;{title: '主列标题4',field: 'c4',width: 200},
	 * &#9;&#9;{title: '主列标题5',field: 'c5',width: 250},
	 * &#9;&#9;{title: '主列标题6',field: 'c6',width: 500}
	 * &#9;]]
	 * });
	 *
	 */
	var Grid = Base.extend({
		Implements: [GridHeaderContextMenu, GridEditor, GridPrint, GridSort, GridSummary, GridExt, GridPager, GridMerger, GridToolbar],
		initialize: function(table, options) {
			this.$t = $(table).css({display:'none'});
			this.$t.removeClass('app-grid');
			this.options = $.extend(true, {}, options);
			this._init();

		},
		/**
		 * 初始化网格
		 */
		_init: function(){
			this._initOptions();
			this._eventRegister();
			this._initElement();
			this._initToolbar();
			this._initPagination();
			this._initHeaderHtml();
			this._switchView(this.viewType,false);
			this._fixHeight();
			this._initData();
			this._fit();
			this._registEvents();
			this._initEditor();
			this._initContextMenu();
		},
		/**
		 * 视力切换 by sjq
		 */
		_switchView:function(viewType,isLoadData){
			this.$tableBodyMain.find('>div>table>tbody').html('');
			if (viewType==VIEW_TYPE.GRID_VIEW){
				this.$tableBody.removeClass("grid-card-view");
				this.$tableHeader.show();
				if (this.setting.view&&this.setting.view["region"]){
					this.$cardRegion[this.setting.view["region"]].find('.grid-body-card-form').hide();
				}
				if (this.setting.view.cardListTpl){
					
					if (this.$cardRegion["center"].find(".grid-card-view-list").length>0){
						 var $firstChild=this.$cardRegion["center"].find(".grid-body-content");
						 var carListTpl=$firstChild.children();
						 $firstChild.append(this.$cardRegion["center"].find('.grid-view'));
						 carListTpl.remove();
						//this.$cardRegion["center"].find(".grid-body-content").append(();
					}
					this.$cardRegion["center"].find('.grid-view').show();
					
				}
			   
			}
			if (viewType==VIEW_TYPE.CARD_VIEW){
				this.$cardRegion[this.setting.view["region"]].find('.grid-body-card-form').show();
				if (this.setting.view.formEl){
					if (!this.setting.view.loadForm){
						if (typeof this.setting.view.formEl=="string"){
							this.$cardRegion[this.setting.view["region"]].find('.grid-body-card-form').append($A("#"+this.setting.view.formEl));

							this.setting.view.formEl=$A("#"+this.setting.view.formEl);
						}else{
							
							this.$cardRegion[this.setting.view["region"]].find('.grid-body-card-form').append(this.setting.view.formEl);

						}
						this.setting.view.loadForm=true;
					}
					this.setting.view.formEl.show();
				}
				this.$tableBody.addClass("grid-card-view");
				if (this.setting.view.cardListTpl){
					if (this.$cardRegion["center"].find(".grid-card-view-list").length==0){
						var cardListTpl=$(this.setting.view.cardListTpl);
						this.$cardRegion["center"].find(".grid-body-content").append(cardListTpl);
						cardListTpl.find(".grid-card-view-list").append(this.$cardRegion["center"].find('.grid-view'));
					}
				}
				this.$tableHeader.hide();
				 this.$tableBodyMessage.hide();
			}
			if (isLoadData){
			   /// this.reflashData();
				this._loadData(this.data, 1);
				this.resize();
			}
		},
		/**
		 * 初始化设置
		 * @param options
		 */
		_initOptions: function (){
			var customSetting = $.extend(this._getAttrOptions(), this.options);
			if($.isFunction(customSetting.beforeRender)){
				customSetting.beforeRender.call(this, customSetting);
			}
			var s = this.setting = $.extend({}, Options.appDefaults.Grid, customSetting);
			this.setting.columnManager = false;
			this._column = {};
			this._fieldColumns = {};
			this._operator = {};
			this._rowData = {};
			this._ts = {};
			this._newData = {updated:{}, inserted:{}, deleted:{}};
			this.editor = {};
			if(!s.id){
				s.id = App.uuid();
			}
			if(s.headRowHeight == 0){
				s.headRowHeight = Options.appDefaults.Grid.headRowHeight;
			}
			if(!s.url){
				s.url = s.action;
			}
			if(s.height != 'push'){
				if(!customSetting.follow){
					s.follow = 'none';
				}
				this.$t.parent().addClass('app-grid-wrap');
			}
			s.checkbox = s.checkbox || s.multiple == true;
			this.data = {};
			this.data[this.setting.jsonReader.rows] = [];
			if(!s.columns){
				s.columns = [[]];
			}
			if(!s.frozenColumns){
				s.frozenColumns = [[]];
			}
			if(!s.frozenColumnsRight){
				s.frozenColumnsRight = [[]];
			}

			this._splitColumns();

			if(s.queryParams){
				this.setParameter(s.queryParams);
			}
			if(s.fixedParams){
				this.setFixedParameter(s.fixedParams);
			}
			this._sumCols = [];
			this._sumColMap = {};
			this._initSystemCol();
			this._initFormula();
			this._initViewColumns();
			this._markChildrenAndParent();
			this._rownumbers = 1;
			if(s.summary && s.summary.template){
				s.summary._template = new Template(s.summary.template);
			}
			if(!$.isArray(s.columns[0]) || s.columns[0].length < 1){
				throw new Error('columns非二维数组，或无实体列存在');
				$messager.error('表格配置错误，无法展现');
			}
			/* this.setting.switchView=true;

			 this.setting.view={
			 type:'CardView',region:'left',
			 formEl:'afaAppMenuPage_form_show',
			 cardWidth:400,

			 rowRender:function(rowData){

			 return "<div style='height:300px;'></div>"

			 }

			 }*/
			//新增卡片视图  by sjq begin
			if (this.setting.view&&this.setting.view.isDefault){
				this.viewType=this.setting.view.type;
			}else{
				this.viewType=VIEW_TYPE.GRID_VIEW;
			}
			//新增卡片视图  by sjq end
		},
		/**
		 * 分割列到各自的视图中
		 */
		_splitColumns: function(){
			var s = this.setting
				,cols = s.columns;
			for(var i = 0 ; i < cols.length; i++){
				for(var j = 0 ; j < cols[i].length; j++){
					var col = cols[i][j];
					if(col.frozen == 'left'){
						pushMulArray(s.frozenColumns, col, i);
					}else if(col.frozen == 'right'){
						pushMulArray(s.frozenColumnsRight, col, i);
					}
				}
			}
			for(var i = 0 ; i < cols.length; i++){
				for(var j = 0 ; j < cols[i].length; j++){
					var col = cols[i][j];
					if(col.frozen == 'left' || col.frozen == 'right'){
						cols[i].splice(j, 1);
						j--;
					}
				}
			}
			function pushMulArray(arr, col, level){
				if(arr.length <= level){
					for(var i = 0; i <= level; i++){
						if(!$.isArray(arr[level])){
							arr.push([]);
						}
					}
				}
				var lvlCol = arr[level];
				lvlCol.push(col);
			}
		},
		/**
		 * 事件的注册器
		 */
		_eventRegister: function(){
			var s = this.setting;
			if($.isFunction(s.afterDataRender)){
				this.on('afterDataRender', s.afterDataRender);
			}
			if($.isFunction(s.beforeBeginEdit)){
				this.on('beforeBeginEdit', s.beforeBeginEdit);
			}
			if($.isFunction(s.beforeEndEdit)){
				this.on('beforeEndEdit', s.beforeEndEdit);
			}
			if($.isFunction(s.beforeLoad)){
				this.on('beforeLoad', s.beforeLoad);
			}
			if($.isFunction(s.beforeSelect)){
				this.on('beforeSelect', s.beforeSelect);
			}
			if($.isFunction(s.beforeSortColumn)){
				this.on('beforeSortColumn', s.beforeSortColumn);
			}
			if($.isFunction(s.onBeginEdit)){
				this.on('onBeginEdit', s.onBeginEdit);
			}
			if($.isFunction(s.onClickCell)){
				this.on('onClickCell', s.onClickCell);
			}

			if($.isFunction(s.onClickRow)){
				this.on('onClickRow', s.onClickRow);
			}
			if($.isFunction(s.onDataChange)){
				this.on('onDataChange', s.onDataChange);
			}
			if($.isFunction(s.onDblClickCell)){
				this.on('onDblClickCell', s.onDblClickCell);
			}
			if($.isFunction(s.onDblClickRow)){
				this.on('onDblClickRow', s.onDblClickRow);
			}
			if($.isFunction(s.onEndEdit)){
				this.on('onEndEdit', s.onEndEdit);
			}

			if($.isFunction(s.onLoadSuccess)){
				this.on('onLoadSuccess', s.onLoadSuccess);
			}
			if($.isFunction(s.onSelect)){
				this.on('onSelect', s.onSelect);
			}
			if($.isFunction(s.onSelectAll)){
				this.on('onSelectAll', s.onSelectAll);
			}
			if($.isFunction(s.onSortColumn)){
				this.on('onSortColumn', s.onSortColumn);
			}
			if($.isFunction(s.onUnselect)){
				this.on('onUnselect', s.onUnselect);
			}
			if($.isFunction(s.onUnselectAll)){
				this.on('onUnselectAll', s.onUnselectAll);
			}
			if($.isFunction(s.rowCls)){
				this.on('rowCls', s.rowCls);
			}
		},
		/**
		 * 获取页面元素的属性作为组件对象的属性
		 */
		_getAttrOptions: function(){
			var attr = App.getAttrFromElement(this.$t)
				,columns = this._getColumnOptions();
			if(columns.length > 0){
				attr.columns = columns;
			}
			return attr;
		},
		/**
		 * 获取页面元素的列配置作为组件对象的列
		 */
		_getColumnOptions: function(){
			var $tr = this.$t.find('>thead>tr')
				,columns = [];
			$tr.each(function(){
				var t = [];
				var $th = $(this).find('>th');
				$th.each(function(){
					var col = App.getAttrFromElement($(this));
					col.title = this.innerHTML;
					t.push(col);
				});
				columns.push(t);
			});
			return columns;
		},
		/**
		 * 设置系统列
		 */
		_initSystemCol: function(){
			var s = this.setting;
			if(s.checkbox){
				var checkbox = {};
				checkbox.sysCol = true;
				checkbox.resizable = false;
				checkbox.field = '_checkbox';
				checkbox.title = '<input type="checkbox" />';
				checkbox._html = checkbox.title;
				checkbox.width = 30;
				checkbox.showTree = false;
				checkbox.rowspan = s.columns.length;
				s.frozenColumns[0].unshift(checkbox);
			}else if(s.radiobox){
				var radiobox = {};
				radiobox.sysCol = true;
				radiobox.resizable = false;
				radiobox.field = '_radiobox';
				radiobox.title = '<input name="' + App.uuid() + '" type="radio"/>';
				radiobox._html = radiobox.title;
				radiobox.width = 30;
				radiobox.showTree = false;
				radiobox.rowspan = s.columns.length;
				s.frozenColumns[0].unshift(radiobox);
			}
			if(s.rownumbers == 'normal' || s.rownumbers == 'repeat'){
				var rownumbers = {};
				rownumbers.sysCol = true;
				rownumbers.resizable = false;
				rownumbers.field = '_rownumbers';
				rownumbers.title = '序号';
				rownumbers.cls = 'grid-row-head';
				rownumbers.width = 30;
				rownumbers.showTree = false;
				rownumbers.rowspan = s.columns.length;
				s.frozenColumns[0].unshift(rownumbers);
			}
		},
		/**
		 * 收集表达式列填充到容器中
		 */
		_initFormula: function(){
			var s = this.setting;
			s.formulaContainer = [];
			this._initFormulaColumn(s.frozenColumns);
			this._initFormulaColumn(s.frozenColumnsRight);
			this._initFormulaColumn(s.columns);
		},
		/**
		 * 收集表达式列
		 */
		_initFormulaColumn: function(cols){
			for ( var i = 0; i < cols.length; i++) {
				for(var j = 0; j < cols[i].length; j++){
					var col = cols[i][j];
					if(col.field && col.formula){
						var formula = col.formula;
						formula = formula.replace(new RegExp('getNum\\(\'', 'gm'), 'formulaHelper.getNum(__obj__, \'');
						formula = formula.replace(new RegExp('getStr\\(\'', 'gm'), 'formulaHelper.getStr(__obj__, \'');
						try{
							new Function([], 'return (' + formula + ');');
							this.setting.formulaContainer.push({field: col.field, formula: formula});
						}catch(e){
							this.setting.formulaContainer.push({field: col.field, formula: '"表达式错误"'});
						}
					}
				}
			}
		},
		/**
		 * 初始化网格列的设置
		 * 固定列、右固定列和主视图列
		 */
		_initViewColumns: function(){
			var s = this.setting;
			s.viewLeftWidth = this._initColumnsGroup(s.frozenColumns, 'left');
			s.viewRightWidth = this._initColumnsGroup(s.frozenColumnsRight, 'right');
			s.viewMainWidth = this._initColumnsGroup(s.columns, 'main') - cellBorderWidth; //第一列没有左边框
		},
		/**
		 * 初始化列组，并返回列组的合计宽度
		 * @param cols
		 */
		_initColumnsGroup: function(cols, viewPos){
			var fixWidth = 0;
			if(cols){
				for ( var i = 0; i < cols.length; i++) {
					for(var j = 0; j < cols[i].length; j++){
						var col = cols[i][j];
						if(col.hidden){
							if(col.lockTree == undefined){
								col.lockTree = true;
							}
							if(col.showTree == undefined){
								col.showTree = false;
							}
						}
						col = cols[i][j] = $.extend({}, Options.appDefaults.Column, col);
						this._initColumn(col);
						fixWidth += getColumnWidth(col);
						col.viewPos = viewPos;
					}
				}
			}
			return fixWidth;
			/**
			 * 获取列的占位宽度
			 */
			function getColumnWidth(col){
				var result = 0;
				if(col.field){
					result = col.width + cellBorderWidth;
				}
				if(col.hidden){
					result = 0;
				}
				return result;
			}
		},
		/**
		 * 根据列设置预定义变量，
		 * 	并返回列宽，如果列colspan大于1，则列宽为0
		 */
		_initColumn: function(col){
			var buttons = col.buttons;
			if(buttons){
				col.sysCol = true;
				this.setting._hasOperator = true;
				var hasDisabledFunc = false;
				for(var i = 0 ; i < buttons.length; i++){
					var btn = buttons[i];
					if(!btn.id){
						btn.id = App.uuid();
					}
					if($.isFunction(btn.disabled)){
						hasDisabledFunc = true;
					}
					this._operator[btn.id] = btn.handler;
				}
				initHeadColumnButton.call(this, col, buttons);
				if(!hasDisabledFunc){//缓存按钮的html
					col._html = '';
					for(var i = 0; i < buttons.length; i++){
						col._html += this._createRowBtn(buttons[i]);
					}
				}
			}
			if(col.colspan && col.colspan > 1){
				delete col.field;
			}else if(col.field){
				if(typeof(col.width) == 'string'){
					col.width = parseInt(col.width);
				}
			}
			var formatter = col.formatter;
			if(formatter){
				if(typeof(formatter) == 'string' && formatter.indexOf('{') >= 0){
					col.template = new Template(formatter);
				}
			}
			if(col.summary && !this._sumColMap[col.field]){
				this._sumCols.push(col);
				this._sumColMap[col.field] = col;
			}
			if(col.rowHeader){
				col.cls = ' grid-row-head';
			}
			if(col.cls){
				col.cls += ' grid-cell-'+col.align;
			}else{
				col.cls = ' grid-cell-'+col.align;
			}
			if(!col.title){
				col.title = col.field;
			}
			col._cid = App.uuid();
			this._column[col._cid] = col;
			this._fieldColumns[col.field] = col;
			if(col.titleVar){
				if(!this._titleVarColumns){
					this._titleVarColumns = {};
				}
				col.oriTitle = col.title;
				this._titleVarColumns[col._cid] = col;
			}
			initBodyTdAttrExp(col);
			initFooterTdAttrExp(col);
			function initBodyTdAttrExp(col){
				if(!col.field){
					return;
				}
				var attr = '_cid="' + col._cid + '"';
				if(col.editor && (!col.editor.options || (col.editor.options && !col.editor.options.readonly ))){
					col.cls = col.cls ? col.cls + ' grid-td-editable' : 'grid-td-editable'
				}
				if(col.field){
					attr += ' field="' + col.field + '"';
				}
				if(col.buttons){
					attr += ' opts="true"';
				}
				col.bodyTdAttrExp = attr;
			}
			function initFooterTdAttrExp(col){
				if(!col.field){
					return;
				}
				var attr = '_cid="' + col._cid + '"';
				if(col.field){
					attr += ' field="' + col.field + '"';
				}
				if(col.buttons){
					attr += ' opts="true"';
				}
				col.footerTdAttrExp = attr;
			}
			/**
			 * 生成表头按钮
			 */
			function initHeadColumnButton(col, buttons){
				var title = col.title + '';
				if(isNaN(title.replaceAll(',', ''))){
					return;
				}
				var bis = title.split(',')
					,btitle = '';
				for(var i = 0; i < bis.length; i++){
					var bi = bis[i]
						,btn = buttons[bi];
					if(!btn){
						return;
					}else{
						btitle += this._createRowBtn(btn);
					}
				}
				bis.sort();
				for(var i = bis.length - 1; i >= 0; i--){
					buttons.splice(bis[i], 1);
				}
				col._isBtn = true;
				col.title = btitle;
			}
		},
		/**
		 * 生成按钮
		 */
		_createRowBtn: function(btn, rowData, rowIndex){
			var disabled = '';
			if($.isFunction(btn.disabled)){
				if(btn.disabled(rowData, rowIndex)){
					disabled = ' disabled';
				}
			}else if(btn.disabled === true){
				disabled = ' disabled';
			}
			return '<a id="' + btn.id + '" class="rowBtn' +
				disabled + '" tab-index="-1">' +
				'<i class="' + btn.iconCls + '" title="' + btn.text + '"></i>' +
				'</a>';
		},
		/**
		 * 绑定行的编辑
		 */
		_onRowOperatorBtnClick: function(e){
			var $btn = $(e.currentTarget);
			if($btn.hasClass('disabled')){
				e.stopPropagation();
				return;
			}
			var bid = $btn.attr('id')
				,$row = $btn.closest('tr')
				,rowIndex = $row.index()
				,rowData = this._converRowToData($row)[0];
			this._renderRow(rowIndex);
			if(this._operator[bid]){
				this._operator[bid].call(this, rowData, rowIndex);
				e.stopPropagation();
			}
		},
		/**
		 * 标注列的上下级关系
		 */
		_markChildrenAndParent: function(){
			var level = this.setting.columns.length
				,colMap = this._column;
			try{
				mark(this.setting.frozenColumns);
			}catch(e){
				throw new Error('左固定列设置错误：' + e);
			}
			try{
				mark(this.setting.columns);
			}catch(e){
				throw new Error('主视图列设置错误：' + e);
			}
			try{
				mark(this.setting.frozenColumnsRight);
			}catch(e){
				throw new Error('右固定列设置错误：' + e);
			}
			/**
			 * 标注父节点和子节点
			 */
			function mark(view){
				if(!view){
					return;
				}
				var matrix = buildMatrix(view);
				for(var i = 1; i < matrix.length; i++){
					for(var j = 0; j < matrix[i].length; j++){
						var parentColumn = matrix[i-1][j]
							,thisColumn = matrix[i][j];
						if(typeof(thisColumn) == 'string'){
							continue;
						}
						if(typeof(parentColumn) == 'string'){
							parentColumn = colMap[parentColumn];
						}
						thisColumn.parentColumn = parentColumn;
						var children = parentColumn.children;
						if(!children){
							children = parentColumn.children = [];
						}
						children.push(thisColumn);
						delete parentColumn.field;
					}
				}
			}
			/**
			 * 构造列矩阵
			 */
			function buildMatrix(oriArr){
				var matrix = [];
				for(var i = 0 ;i < level; i++){
					matrix.push([]);
				}
				if(level > 1 && oriArr.length == 1){
					for(var i = 0; i < oriArr[0].length; i++){
						oriArr[0][i].rowspan = level;
					}
				}
				for(var i = 0; i < oriArr.length; i++){
					for(var j = 0 ;j < oriArr[i].length; j++){
						var col = oriArr[i][j];
						tileCol(col, i, matrix);
					}
				}
				checkMatrix(matrix);
				return matrix;
				/**
				 * 检验矩阵是否对齐
				 */
				function checkMatrix(matrix){
					for(var i = 0; i < matrix.length - 1; i++){
						if(matrix[i].length != matrix[i + 1].length){
							$a.messager.warn('列的colspan或rowspan设置错误');
							throw new Error('列的colspan或rowspan设置错误');
						}
					}
				}
			}
			/**
			 * 根据单元格，设置到目标数组
			 * @param col
			 * @param rowIndex
			 * @param matrix
			 */
			function tileCol(col, rowIndex, matrix){
				var rowspan = col.rowspan == undefined ? 1 : col.rowspan
					,colspan = col.colspan == undefined ? 1 : col.colspan
					,colIndex = 0;
				for(var i = 0; i < rowspan; i++){
					for(var j = 0; j < colspan; j++){
						var element = col._cid;
						if(i == 0 && j == 0){
							element = col;
						}
						if(i > 0){
							matrix[rowIndex + i][colIndex] = element;
						}else{
							colIndex = appendCol(matrix[rowIndex + i], element);
						}
					}
				}
			}
			/**
			 * 元素放入数组，并返回放入的数组下标
			 * @param target 数组
			 * @param col 元素
			 * @returns {Number}
			 */
			function appendCol(target, col){
				var i = 0;
				while(target[i] != undefined){
					i++;
				}
				target[i] = col;
				return i;
			}
		},
		/**
		 * 禁用数据行的按钮
		 * @param rowIndex {Number} 行号
		 * @param btnId {String} 按钮id
		 * @example $('#demo').grid('disableRowBtn', 'addBtn');
		 * @memberof grid-class
		 * @instance
		 */
		disableRowBtn: function(rowIndex, btnId){
			var exp = this._getRowExpr(rowIndex);
			if(!exp){
				return;
			}
			var $btn = this.$tableBodyRight.find(exp).find('#'+btnId);
			$btn.addClass('disabled');
		},
		/**
		 * 启用数据行的按钮
		 * @param rowIndex {Number} 行号
		 * @param btnId {String} 按钮id
		 * @example $('#demo').grid('enableRowBtn', 'addBtn');
		 * @memberof grid-class
		 * @instance
		 */
		enableRowBtn: function(rowIndex, btnId){
			var exp = this._getRowExpr(rowIndex);
			if(!exp){
				return;
			}
			var $btn = this.$tableBodyRight.find(exp).find('#'+btnId);
			$btn.removeClass('disabled');
		},
		/**
		 * 初始化整体html结构
		 */
		_initElement: function(){
			this._initElementStruct();
			var $e = this.$element
				,grid = this;
			$e.data('grid', this);
			this.$wrap = $e.parent();
			this.$rowEditor = $e.find('.grid-row-editor');
			this.$absoluteComp = $e.find('.grid-absolute-comp');
			this.$focusInput = $e.find('.focusInput');
			this.$focusInput.on('keydown.grid-proxy-focus.api', $.proxy(this._keyLocateCell, this));
			this.$focusInput.on('focus.grid-proxy-focus.api', function(){
				grid.$table.addClass('table-active');
				grid._fixXProxyScroll();
			});
			this.$focusInput.on('blur.grid-proxy-focus.api', function(){
				grid.$table.removeClass('table-active');
				grid.$focusInput.css('position', 'absolute');
				grid.$focusInput.appendTo(grid.$absoluteComp);
			});


			this.$header = $e.find('.grid-header');
			this.$title = this.$header.find('.grid-header-title');
			this.$toolbar = this.$header.find('.grid-header-toolbar');
			this.$headerCustom = this.$header.find('.grid-header-custom');

			this.$table = $e.find('.grid-table');
			this.$tableHeader = $e.find('.grid-table-header');
			this.$tableHeaderLeft = this.$tableHeader.find('.grid-header-left');
			this.$tableHeaderMain = this.$tableHeader.find('.grid-header-main');
			this.$tableHeaderRight = this.$tableHeader.find('.grid-header-right');
			this.$tableBody = $e.find('.grid-table-body');
			this.$tableBodyMessage = $e.find('.grid-table-message');
			this.$tableBodyLeft = this.$tableBody.find('.grid-body-left');
			this.$tableBodyMain = this.$tableBody.find('.grid-body-main');
			this.$tableBodyRight = this.$tableBody.find('.grid-body-right');
			this.$tableFooter = $e.find('.grid-table-footer');
			this.$tableFooterLeft = this.$tableFooter.find('.grid-footer-left');
			this.$tableFooterMain = this.$tableFooter.find('.grid-footer-main');
			this.$tableFooterRight = this.$tableFooter.find('.grid-footer-right');
			this.$tableFooterCustom = this.$tableFooter.find('.grid-footer-custom');
			this.$cardRegion={
				left:this.$tableBodyLeft,
				right:this.$tableBodyRight,
				center:this.$tableBodyMain
			};
			if(this.setting.headerCustom){
				this.$headerCustom.append($A(this.setting.headerCustom));
			}
		},
		/**
		 * 显示提示信息
		 */
		_showMessage: function(msg){
			this.$tableBodyMessage.html(msg).show();
		},
		/**
		 * 隐藏提示信息
		 */
		_hideMessage: function(){
			this.$tableBodyMessage.hide();
		},
		/**
		 * 设置网格的最小宽度，
		 * 		防止固定列与主视图在缩放时位置错乱
		 * 		防止分页栏在缩放时位置错乱
		 * @param {Number} minWidth 最小宽度
		 * @memberof grid-class
		 * @instance
		 */
		setGridMinWidth: function(minWidth){
			var min = 0;
			if(this._hasPager()){
				min = 400;
			}
			if(minWidth < min){
				minWidth = min;
			}
			this.$element.css('min-width', minWidth);
		},
		/**
		 * 初始化网格结构
		 */
		_initElementStruct: function(){
			var s = this.setting
				,footerHtml = '<div class="grid-table-footer">' +
				'<div>' +
				'<div class="grid-footer-left">' +
				'<div>' +
				'<table cellpadding="0" cellspacing="0">' +
				'<tbody></tbody>' +
				'</table>' +
				'</div>' +
				'</div>' +
				'<div class="grid-footer-right">' +
				'<div>' +
				'<table cellpadding="0" cellspacing="0">' +
				'<tbody></tbody>' +
				'</table>' +
				'</div>' +
				'</div>' +
				'<div class="grid-footer-main">' +
				'<div>' +
				'<table cellpadding="0" cellspacing="0">' +
				'<tbody></tbody>' +
				'</table>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'<div class="grid-footer-custom"></div>' +
				'</div>';
			this.$element = $(
				'<div class="app-grid">' +
				'<div class="grid-header">' +
				'<div class="grid-header-title">' +
				'<span>' + s.title + '</span>' +
				'</div>' +
				'<div class="grid-header-toolbar" style="max-height:' + s.toolbarHeight + 'px;">' +
				'<ul></ul>' +
				'</div>' +
				'<div class="grid-header-custom">' +
				'</div>' +
				'</div>' +
				'<div class="grid-table' + (s.height == 'push' ?' autoHeight':' fixHeight') + '">' +
				'<div class="row-dragging-mask"></div>' +
				'<div class="grid-table-header" oncontextmenu="return false">' +
				'<div class="col-resize-proxy"></div>' +
				'<div class="grid-header-left">' +
				'<div>' +
				'<table cellpadding="0" cellspacing="0">' +
				'<tbody></tbody>' +
				'</table>' +
				'</div>' +
				'</div>' +
				'<div class="grid-header-right">' +
				'<div>' +
				'<table cellpadding="0" cellspacing="0">' +
				'<tbody></tbody>' +
				'</table>' +
				'</div>' +
				'</div>' +
				'<div class="grid-header-main">' +
				'<div>' +
				'<table cellpadding="0" cellspacing="0">' +
				'<tbody></tbody>' +
				'</table>' +
				'</div>' +
				'</div>' +
				(this.setting.summaryPos == 'top' ? footerHtml : '') +
				'</div>' +
				'<div class="grid-table-body' + (s.striped?' useStriped':'') + '">' +
				'<div class="grid-table-message"></div>' +
				'<div class="grid-body-left" >' +
				'<div class="grid-body-content">' +
				'<table cellpadding="0"  class="grid-view" cellspacing="0">' +
				'<tbody></tbody>' +
				'</table>' +
				'<div class="grid-body-card-form" style="display:none"></div>'	+
				'</div>' +
				'</div>' +
				'<div class="grid-body-right" >' +
				'<div class="grid-body-content">' +
				'<table cellpadding="0"  class="grid-view" cellspacing="0">' +
				'<tbody></tbody>' +
				'</table>' +

				'<div class="grid-body-card-form form" style="display:none"></div>'	+
				'</div>' +
				'</div>' +
				'<div class="grid-body-main">' +
				'<div class="grid-body-content">' +
				'<table cellpadding="0"  class="grid-view" cellspacing="0">' +
				'<tbody></tbody>' +
				'</table>'  +
				'</div>' +
				'</div>' +
				'<div class="grid-row-editor"></div>' +
				'<div class="grid-absolute-comp">' +
				'<input class="focusInput" style="position:absolute;"/>' +
				'</div>' +
				'</div>' +
				(this.setting.summaryPos == 'bottom' ? footerHtml : '') +
				'</div>' +
				'</div>').insertAfter(this.$t);
		},
		/**
		 * 根据当前的表头展现调整当前的列顺序
		 * 左固定列 右固定列和主数据列
		 */
		_resetColumnsInOrder: function(){
			this.frozenColumns = this._getColumnsInTable(this.$tableHeaderLeft.find('>div>table'));
			this.frozenColumnsRight = this._getColumnsInTable(this.$tableHeaderRight.find('>div>table'));
			this.columns = this._getColumnsInTable(this.$tableHeaderMain.find('>div>table'));
		},
		/**
		 * 根据当前的表头展现获取当前的列顺序
		 * @param $table
		 */
		_getColumnsInTable: function($table){
			var trs = $table.find('>tbody>tr')
				,trLen = trs.length
				,result = [];
			for ( var i = trLen - 1; i >= 0; i--) {
				var tds = $(trs[i]).find('>td');
				if(i == trs.length-1){
					for ( var j = 0; j < tds.length; j++) {
						var cid = $(tds[j]).attr('_cid');
						result.push(this._column[cid]);
					}
				}else{
					for ( var j = 0; j < tds.length; j++) {
						var rowspan = $(tds[j]).attr('rowspan');
						rowspan = rowspan == undefined ? 1 : parseInt(rowspan);
						if(rowspan + i == trLen){
							var order = this._getColumnOrder(j, tds)
								,cid = $(tds[j]).attr('_cid');
							result.splice(order, 0, this._column[cid]);
						}
					}
				}
			}
			linkCol(result);
			return result;
			function linkCol(cols){
				var len = cols;
				if(len <= 1){
					return;
				}
				for(var i = 1; i < result.length; i++){
					result[i].__prev = result[i-1];
				}
			}
		},
		/**
		 * 获取该td属于第几顺序列
		 */
		_getColumnOrder: function(tdi, tds){
			var result = 0;
			for ( var i = 0; i < tdi; i++) {
				var colspan = $(tds[i]).attr('colspan');
				colspan = colspan == undefined ? 1 : parseInt(colspan);
				result += colspan;
			}
			return result;
		},
		/**
		 * 生成网格头
		 */
		_initHeaderHtml: function(){
			this.gridHeadHeight = this.setting.columns.length * (this.setting.headRowHeight+1);
			this._initFrozenViewHtml();
			this._initFrozenRightViewHtml();
			if(this.setting.fitColumns == 'E' || this.setting.fitColumns == 'ES'){
				this._setColumnPercent();
				this._fitMainViewWidth();
			}
			this._initMainViewHtml();
			this._resetColumnsInOrder();
		},
		/**
		 * 设置网格列的百分比
		 */
		_setColumnPercent: function(){
			var s = this.setting
				,cols = s.columns
				,allWidth = this._getColumnsWidth(cols);
			if(s.fitColumns != 'E' && s.fitColumns != 'ES'){
				return;
			}
			for ( var i = 0; i < cols.length; i++) {
				for(var j = 0; j < cols[i].length; j++){
					var col = cols[i][j];
					if(col.field && !col.hidden){
						col.percent = parseFloat((col.width / allWidth).toFixed(4));
					}
				}
			}
		},
		/**
		 * 获取数组列的总宽度
		 */
		_getColumnsWidth: function(cols){
			var result = 0;
			for ( var i = 0; i < cols.length; i++) {
				for(var j = 0; j < cols[i].length; j++){
					var col = cols[i][j];
					if(col.hidden){
						continue;
					}
					if(!col.field){
						continue;
					}
					result += col.width;
				}
			}
			return result;
		},
		/**
		 * 自适应主视图的宽度大小
		 * 如果视图不可见，则根据逻辑宽度进行设置
		 */
		_fitMainViewWidth: function(){

			if (this.viewType==VIEW_TYPE.CARD_VIEW){
				var gridWidth = this.$element.outerWidth();
				var cardFromWidth=gridWidth-this.setting.view.cardWidth;
				this.$cardRegion[this.setting.view["region"]].find('.grid-body-card-form').outerWidth(cardFromWidth);

			}
			var s = this.setting
				,freeWidth = 0;
			if(this.$element.is(':visible')){
				var gridWidth = this.$element.outerWidth()
					,diffWidth = this._getYProxyScrollWidth();
				freeWidth = gridWidth - this.$tableHeaderLeft.outerWidth() - this.$tableHeaderRight.outerWidth() - diffWidth;
			}else{
				freeWidth = this.setting.viewMainWidth;
			}
			if(s.fitColumns == 'ES'){
				this._fitMainColumnsWidth(freeWidth);
			}else if(s.fitColumns == 'E'){
				if(freeWidth >= s.viewMainWidth - scrollBarWidth){
					this._fitMainColumnsWidth(freeWidth);
				}
			}
		},
		/**
		 * 获取y轴的宽度
		 */
		_getYProxyScrollWidth: function(){
			var result = 1;
			if(this.setting.height == 'push'){
				this.$wrap.scrollTop(1);
				var scrollTop = this.$wrap.scrollTop();
				if(scrollTop == 1){
					result += scrollBarWidth;
				}
			}else if(this._hasYProxyScroll()){
				if(!this.setting.autoScroll){
					result += scrollBarWidth;
				}
			}
			return result;
		},
		/**
		 * 根据传入的主视图宽度按比例调整主视图的列宽
		 */
		_fitMainColumnsWidth: function(mainViewWidth){
			var cols = this.setting.columns
				,calc = 0;
			for ( var i = 0; i < cols.length; i++) {
				for( var j = 0; j < cols[i].length; j++){
					var col = cols[i][j];
					if(col.field && !col.hidden){
						col.width = parseInt((col.percent * mainViewWidth).toFixed());
						calc += col.width;
						col.width -= 1;
					}
				}
			}
			col.width += mainViewWidth - calc;
			this.setting.viewMainWidth = mainViewWidth;
		},
		/**
		 * 初始化左固定视图的html
		 * 	返回左固定视图宽度
		 */
		_initFrozenViewHtml: function(){
			var s = this.setting
				,css = {width: s.viewLeftWidth}
				,cols = s.frozenColumns;
			if(cols){
				this.$tableHeaderLeft.find('>div>table>tbody').append(this._initHeaderTrHtml(cols));
				this.$tableHeaderLeft.height(this.gridHeadHeight);
				this.$tableHeaderLeft.css('overflow','hidden');
			}
		},
		/**
		 * 初始化右固定视图的html
		 * 	返回右固定视图宽度
		 */
		_initFrozenRightViewHtml: function(){
			var s = this.setting
				,css = {width:s.viewRightWidth}
				,cols = s.frozenColumnsRight;
			if(cols){
				this.$tableHeaderRight.find('>div>table>tbody').append(this._initHeaderTrHtml(cols));
				this.$tableHeaderRight.height(this.gridHeadHeight);
				this.$tableHeaderRight.css('overflow','hidden');
			}
		},
		/**
		 * 初始化主视图的html
		 */
		_initMainViewHtml: function(){
			var s = this.setting
				,w = s.viewMainWidth
				,$tr = this._initHeaderTrHtml(s.columns);
			setLastTdShowBorder($tr);
			this.$tableHeaderMain.find('>div>table>tbody').append($tr);
			this.$tableHeaderMain.height(this.gridHeadHeight);
			this.$tableHeaderMain.css('overflow','hidden');
			this.$focusInput.appendTo(this.$tableHeaderMain.find('td:visible:first>div'));
			function setLastTdShowBorder($tr){
				if($tr.length == 1){
					return;
				}
				for(var i = 1; i < $tr.length; i++){
					$($tr[i]).find('td:last-child').addClass('show-right-border');
				}
			}
		},
		/**
		 * 获取网格的信息
		 */
		_initHeaderTrHtml: function(cols){
			var _g = this
				,$trs = []
				,height = this.setting.headRowHeight
				,trHmtl = '<tr style="height:' + height + 'px;line-height:' + height + 'px;"></tr>';
			for ( var i = 0; i < cols.length; i++) {
				var $tr = $(trHmtl);
				for ( var j = 0; j < cols[i].length; j++) {
					var $td = initHeader$Td(cols[i][j]);
					$tr.append($td);
				}
				$trs.push($tr);
			}
			return $trs;

			function initHeader$Td(col){
				var $col = $('<td ' + createTdStyle(col) + createHeaderTdAttr(col) + '>' +
					'<div ' + createTdInnerStyle(col) + '><span class="column-title">' + col.title + '</span></div>' +
					'</td>');
				_g._appendSortable(col, $col);
				if(col.headerBtns){
					var btns = col.headerBtns;
					for(var i = 0; i < btns.length; i++){
						appendHeaderBtn($col, btns[i]);
					}
				}
				return $col;
				function appendHeaderBtn($col, btn){
					var $btn = $('<span class="' + btn.iconCls + ' grid-header-btn"></span>');
					if(btn.title){
						$btn.attr('title', btn.title);
					}
					$btn.on('click', function(e){
						e.stopPropagation();
						btn.handler();
					});
					if(btn.hoverShow){
						$btn.hide();
						$col.on('mouseenter', function(e){
							$btn.show();
						}).on('mouseleave', function(){
							$btn.hide();
						});
					}
					$col.find('>div').append($btn);
				}
				function createTdStyle(col){
					var result = '';
					if(col.rowspan && col.rowspan > 1){
						var height = _g.setting.headRowHeight *col.rowspan +(col.rowspan -1);
						result += 'height:' + height  + 'px;line-height:' + height  + 'px;';
					}
					if(result){
						result = 'style="' + result + '" ';
					}
					return result;
				}

				function createHeaderTdAttr(){
					var attr = '_cid="' + col._cid + '"'
						,cls = col.cls;
					if(!_g.setting.halign){
						cls = cls.replace('grid-cell-left','grid-cell-center');
						cls = cls.replace('grid-cell-right','grid-cell-center');
					}
					if(col.hidden){
						cls += ' grid-cell-hidden';
					}
					attr += ' class="' + cls + '"';
					if(col.field){
						attr += ' field="' + col.field + '"';
					}
					if(col.buttons){
						attr += ' opts="true"';
					}
					var colspan = getColspan(col);
					if(colspan == 0){
						colspan = 1;
					}
					attr += ' colspan="' + colspan + '"';
					if(col.rowspan){
						attr += ' rowspan="' + col.rowspan + '"';
					}
					if(col._isBtn){
						attr += ' isBtn="true"';
					}
					return attr;
					/**
					 * 获取要合并的列数
					 */
					function getColspan(col){
						var result = 0
							,children = col.children;
						if(children && children.length > 0){
							for(var i = 0; i < children.length; i++){
								result += getColspan(children[i]);
							}
						}else if(!col.hidden){
							result = 1;
						}
						return result;
					}
				}
				function createTdInnerStyle(col){
					var result = '';
					if(col.field){
						result = 'style="width:' + col.width + 'px;"';
					}
					return result;
				}
			}
		},
		/**
		 * 注册事件
		 */
		_registEvents: function(){
			this.$tableBody.on('click.grid-cell.api', 'tr.data-row td', $.proxy(this._onClickCell, this));
			this.$tableBody.on('mouseup.grid-cell.api', 'tr.data-row td', $.proxy(this._onMouseUpCell, this));
			this.$tableBody.on('dblclick.grid-cell.api', 'tr.data-row td', $.proxy(this._onDblClickCell, this));
			this.$tableBody.on('click.grid-row.api', 'tr.data-row td', $.proxy(this._onClickRow, this));
			this.$tableBody.on('dblclick.grid-row.api', 'tr.data-row td', $.proxy(this._onDblClickRow, this));

			this.$tableBody.on('mousewheel.grid.api', $.proxy(this._onMouseWheel, this));
			this.$tableBody.on('mouseover.grid.api', 'tr.data-row', $.proxy(this._onBodyTrMouseOver, this));
			this.$tableBody.on('mouseleave.grid.api', 'tr.data-row', $.proxy(this._onBodyTrMouseLeave, this));
			this.$tableHeader.on('click.grid.api', 'td[isbtn="true"]', headBtnTdClick);
			if(this.setting.checkbox){
				this.$tableHeaderLeft.on('click.grid.api', 'td[field="_rownumbers"]', $.proxy(this._onHeaderRowNumberTdClick, this));
				this.$tableHeaderLeft.on('click.grid.api', 'td[field="_checkbox"]', $.proxy(this._onHeaderCheckboxTdClick, this));
				this.$tableHeaderLeft.on('click.grid.api', 'td[field="_checkbox"] input', $.proxy(this._onHeaderCheckboxClick, this));
				this.$tableBodyLeft.on('click.grid.api', 'td[field="_checkbox"]', $.proxy(this._onBodyCheckboxTdClick, this));
				this.$tableBodyLeft.on('click.grid.api', 'td[field="_checkbox"] input', $.proxy(this._onBodyCheckboxClick, this));
			}
			this._registResizeColumnProxy();

			this._bindInvalidMsgEvent();
			this._bindResize();
			this.onMouseEvent();
			this._onCheckSummary();
		},
		/**
		 * 表格体的鼠标滚轮事件
		 */
		_onMouseWheel: function(event, delta, deltaX, deltaY){
			if(this._hasYProxyScroll()){
				setDataRowHeight.call(this);
				var rowHeight = this._rowHeight
					,scrollTop = this.$yProxyScroll.scrollTop()
                    ,scrollIndex = Math.ceil(scrollTop/rowHeight);
				if(delta < 0){
					this.$yProxyScroll.scrollTop((scrollIndex + 1) * rowHeight);
				}else{
					this.$yProxyScroll.scrollTop((scrollIndex - 1) * rowHeight);
				}
			}
		},
		/**
		 * 表格体的单元格单击事件
		 * @param e
		 */
		_onClickCell: function(e){
			var $td = $(e.currentTarget)
				,$row = $td.parent()
				,rowData = this._getDataByRowId($row.attr('id'))
				,rowIndex = $row.index()
				,field = $td.attr('field');
			/**
			 * 单元格单击事件
			 * @event grid-class#onClickCell
			 * @param {Object} rowData 行数据
			 * @param {Number} rowIndex 行号
			 * @param {String} field 单元格的列名
			 */
			this.trigger('onClickCell', rowData, rowIndex, field, e);
		},
		/**
		 * 是否进行焦点获取以进行上下左右的按键导航
		 */
		_onMouseUpCell: function(e){
			if(getCellSelectText() != ''){
				return;
			}
			var $td = $(e.currentTarget);
			if(!this.setting.hasEditor){
				this._focusProxyInput($td);
			}
			function getCellSelectText(){
				if(window.getSelection) {
					return window.getSelection().toString();
				} else if(document.selection && document.selection.createRange) {
					return document.selection.createRange().text;
				}
				return '';
			}
		},
		/**
		 * 将焦点移入到代理的输入框中
		 */
		_focusProxyInput: function($td){
			this.setCurrentRow($td.parent().index());
			try{
				this.$focusInput[0].focus();
			}catch(e){
				
			}
		},
		/**
		 * 代理单元格定位的事件
		 */
		_keyLocateCell: function(e){
			e.preventDefault();
			e.stopPropagation();
			var keyCode = e.keyCode;
			switch(keyCode){
				case App.keyCode.LEFT:
					this.$xProxyScroll.scrollLeft(this.$xProxyScroll.scrollLeft() - 35);
					break;
				case App.keyCode.RIGHT:
					this.$xProxyScroll.scrollLeft(this.$xProxyScroll.scrollLeft() + 35);
					break;
				case App.keyCode.UP:
					this.prevRow();
					this.locateCurrent();
					break;
				case App.keyCode.DOWN:
					this.nextRow();
					this.locateCurrent();
					break;
				case App.keyCode.ENTER:
					this.toggleSelectCurrent();
					break;
			}
		},
		/**
		 * 表格体的单元格双击事件
		 * @param e
		 */
		_onDblClickCell: function(e){
			if(atOnceMoment(e, 'onDblClickCell', this)){
				return;
			}
			var $td = $(e.currentTarget)
				,$row = $td.parent()
				,rowData = this._getDataByRowId($row.attr('id'))
				,rowIndex = $row.index()
				,field = $td.attr('field');
			/**
			 * 单元格双击事件
			 * @event grid-class#onDblClickCell
			 * @param {Object} rowData 行数据
			 * @param {Number} rowIndex 行号
			 * @param {String} field 单元格的列名
			 */
			this.trigger('onDblClickCell', rowData, rowIndex, field, e);
		},
		/**
		 * 网格单击事件
		 */
		_onClickRow: function(e){
			var $tr = $(e.currentTarget).parent()
				,rowId = $tr.attr('id')
				,rowIndex = this._convertRowIdToRowIndex(rowId)
				,rowData = this._getDataByRowId(rowId);
			this.setCurrentRow(rowIndex);
			if(!$tr.hasClass('row-uncheckable')){
				if(this.isSelectedRow(rowIndex)){
					this.unselectRow(rowIndex);
				}else{
					this.selectRow(rowIndex);
				}
			}
			/**
			 * 行点击事件
			 * @event grid-class#onClickRow
			 * @param {Object} rowData 行数据
			 * @param {Number} rowIndex 行号
			 */
			this.trigger('onClickRow', rowData, rowIndex, e);
		},
		/**
		 * 网格双击事件
		 */
		_onDblClickRow: function(e){
			if(atOnceMoment(e, 'onDblClickRow', this)){
				return;
			}
			var $tr = $(e.currentTarget).parent()
				,rowId = $tr.attr('id')
				,rowIndex = this._convertRowIdToRowIndex(rowId)
				,rowData = this._getDataByRowId(rowId);
			if(!$tr.hasClass('row-uncheckable')){
				if(this.isSelectedRow(rowIndex)){
					this.unselectRow(rowIndex);
				}else{
					this.selectRow(rowIndex);
				}
			}
			/**
			 * 行双击事件
			 * @event grid-class#onDblClickRow
			 * @param {Object} rowData 行数据
			 * @param {Number} rowIndex 行号
			 */
			this.trigger('onDblClickRow', rowData, rowIndex, e);
		},
		/**
		 * 鼠标经过tr时 将tr渲染为当前行的样式
		 * @param e
		 */
		_onBodyTrMouseOver: function(e){
			this._setRowClass(e.currentTarget.id, hoverRowCls);
		},
		/**
		 * 表格头的rownumber所在的td点击事件
		 * @param e
		 */
		_onHeaderRowNumberTdClick: function(e){
			this._onHeaderCheckboxTdClick(e);
		},
		/**
		 * 表格头的checkbox所在的td点击事件
		 * @param e
		 */
		_onHeaderCheckboxTdClick: function(e){
			var checkbox = this.$tableHeaderLeft.find('td[field="_checkbox"] input')[0];
			checkbox.checked = !checkbox.checked;
			this._onHeaderCheckboxClick(e);
		},
		/**
		 * 表格头的checkbox点击事件
		 * @param e
		 */
		_onHeaderCheckboxClick: function(e){
			if(this.$tableHeaderLeft.find('td[field="_checkbox"] input')[0].checked){
				this.selectAll();
			}else{
				this.unselectAll();
			}
			e.stopPropagation();
		},
		/**
		 * 表格体的checkbox点击事件
		 * @param e
		 */
		_onBodyCheckboxTdClick: function(e){
			var $curr = $(e.currentTarget)
				,checkbox = $curr.find('input')[0]
				,id = $curr.closest('tr')[0].id;
			if(checkbox.checked){
				this.unselectRow(id);
			}else{
				this.selectRow(id);
			}
			e.stopPropagation();
		},
		/**
		 * 表格体的checkbox点击事件
		 * @param e
		 */
		_onBodyCheckboxClick: function(e){
			var checkbox = e.currentTarget
				,id = $(e.currentTarget).closest('tr')[0].id;
			if(!checkbox.checked){
				this.unselectRow(id);
			}else{
				this.selectRow(id);
			}
			e.stopPropagation();
		},
		/**
		 * 调整高度和宽度
		 */
		_fit: function(){
			var s = this.setting;
			if(!s.title){
				if(!this._hasTitlePager()){
					this.$title.css('display', 'none');
				}
			}
			if(!s.toolbar || s.toolbar.length == 0){
				this.$toolbar.css('display','none');
				this.$title.css('border-bottom-width', 0);
			}
			this._initProxyScroll();
			this._fixHeight();
			if(s.width){
				this.$element.css({width:s.width});
			}
			this.setGridMinWidth(s.viewLeftWidth + s.viewRightWidth + 30);
		},
		/**
		 * 生成代理滚动条
		 */
		_initProxyScroll: function(){
			this._initXProxyScroll();
			this._initYProxyScroll();
			this._bindWrapYScrollEvent();
		},
		/**
		 * 生成横向代理滚动条
		 */
		_initXProxyScroll: function(){
			this.$xProxyScroll =
				$('<div class="grid-body-xscrollproxy" style="margin-left:' +
					this.$tableHeader.find('.grid-header-left>div').outerWidth() +
					'px; margin-right:' +
					this.$tableHeader.find('.grid-header-right>div').outerWidth() + 'px;">' +
					'<div style="width:' + (this.$tableHeader.find('.grid-header-main>div>table').outerWidth()-3) + 'px;"></div>' +
					'</div>');
			this.$xProxyScroll.insertAfter(this.$tableBody);
			var grid = this;
			this.$xProxyScroll.scroll(function() {
				grid.$tableHeaderMain.scrollLeft($(this).scrollLeft());
				grid.$tableBodyMain.scrollLeft($(this).scrollLeft());
				grid.$tableFooterMain.scrollLeft($(this).scrollLeft());
			});
			this._setFooterBorderTop();
		},
		/**
		 * 是否显示有横向向滚动条
		 */
		_hasXProxyScroll: function(){
			return this.$xProxyScroll && this.$xProxyScroll.outerWidth() < this.$xProxyScroll.find('>div').outerWidth();
		},
		/**
		 * 生成纵向代理滚动条
		 */
		_initYProxyScroll: function(){
			if(this.setting.autoScroll){
				return;
			}
			this.$yProxyScroll =
				$('<div class="grid-body-yscrollproxy" style="height:' + this.$tableBody.find('.grid-body-main').outerHeight()
					+ 'px;margin-top:' + this.$tableHeader.outerHeight() + 'px">' +
					'<div style="height:' + (this.$tableBody.find('.grid-body-main>div').outerHeight()) + 'px;"></div>' +
					'</div>');
			this.$yProxyScroll.insertBefore(this.$tableHeader);
			var grid = this;
			this.$yProxyScroll.scroll(function() {
				setDataRowHeight.call(grid);
				var ele = grid.$yProxyScroll[0]
					,scrollTop = ele.scrollTop
					,scrollHeight = ele.scrollHeight
					,clientHeight = ele.clientHeight;
				if(scrollTop == 0){
					 grid.$tableBodyLeft.scrollTop(0);
					 grid.$tableBodyMain.scrollTop(0);
					 grid.$tableBodyRight.scrollTop(0);
					 return;     
				}
				var scrollTop = $(this).scrollTop()
					,rowHeight = grid._rowHeight;
				if(scrollTop + clientHeight > rowHeight * (grid.getAllData().length-0.5)){
					scrollTop =  scrollHeight - clientHeight;
				}else{
					scrollTop = parseInt(scrollTop/rowHeight) * rowHeight;
				}
				grid.$tableBodyLeft.scrollTop(scrollTop);
				grid.$tableBodyMain.scrollTop(scrollTop);
				grid.$tableBodyRight.scrollTop(scrollTop);
			});
		},
		/**
		 * 是否显示有纵向滚动条
		 */
		_hasYProxyScroll: function(){
			if(!this.$yProxyScroll){
				return false;
			}
			if(this.$yProxyScroll.css('display') == 'none'){
				return false;
			}
			if(this.$yProxyScroll.outerHeight() < this.$yProxyScroll.find('>div').outerHeight()){
				return true;
			}
			return false;
		},
		/**
		 * 外部纵向滚动事件
		 */
		_bindWrapYScrollEvent: function(){
			var grid = this
				,s = this.setting;
			if(s.follow == 'all'){
				this.$wrap.scroll(function() {
					grid._headerFollow();
					grid._footerFollow();
				});
			}else if(s.follow == 'header'){
				this.$wrap.scroll(function() {
					grid._headerFollow();
				});
			}else if(s.follow == 'footer'){
				this.$wrap.scroll(function() {
					grid._footerFollow();
				});
			}
		},
		/**
		 * 修复网格高度,动态设置纵向滚动条的高度
		 */
		_fixHeight: function(){
			if(this.setting.height == 'push'){
				return;
			}
			this._fixGridHeight();
			this._fixYProxyScrollHeight();
		},
		/**
		 * 修复网格主体的高度
		 */
		_fixGridHeight: function(){
			var height = 0;
			if(!this.$element.is(':visible')){
				return;
			}
			if(!this.setting.height){
				height = this.$element.parent().height();
			}else{
				height = parseInt(this.setting.height);
			}
			height -= this.$header.outerHeight() + 1 ;
		   //卡片网格不需要计算合计长高度
			if (this.viewType&&this.viewType==VIEW_TYPE.GRID_VIEW){

				if(this.setting.summaryPos == 'top'){
					height -= this.$tableHeader.outerHeight();
				}else{
					height -= this.$tableHeader.outerHeight() + this.$tableFooter.outerHeight();
				}
			}
			height -= this._getPagerDownHeight();
			if(this._hasXProxyScroll()){
				height -= 16;
			}
			this.$tableBodyLeft.css({height:height});
			this.$tableBodyRight.css({height:height});
			this.$tableBodyMain.css({height:height});
		},
		/**
		 * 高度变化，修复滚动条的高度
		 */
		_fixYProxyScrollHeight: function(){
			if(!this.$yProxyScroll || this.setting.height == 'push'){
				return;
			}
			var oriHasYScroll = this.$yProxyScroll[0].scrollHeight > this.$yProxyScroll.outerHeight()
				,wrapHeight = this.$tableBody.outerHeight()
				,innerHeight = this.$tableBody.find('.grid-body-main>div').outerHeight();

			this.$yProxyScroll.css('height', wrapHeight).css('margin-top', this.$tableHeader.outerHeight());
			this.$yProxyScroll.find('>div').css('height', innerHeight);

			var currHasYScroll = innerHeight > this.$yProxyScroll.outerHeight();
			if(currHasYScroll == oriHasYScroll){
				if(currHasYScroll && this.$yProxyScroll.outerWidth() == 0){
					var css = {};
					css.width = scrollBarWidth;
					css.display = 'block';
					css['overflow-y'] = 'scroll';
					this.$yProxyScroll.css(css);
					if(this.setting.summaryPos == 'bottom'){
						this.$tableFooterRight.css('margin-right', scrollBarWidth);
					}
				}
				return;
			}
			if(currHasYScroll){
				var css = {};
				css.width = scrollBarWidth;
				css.display = 'block';
				css['overflow-y'] = 'scroll';
				this.$yProxyScroll.css(css);
				if(this.setting.summaryPos == 'bottom'){
					this.$tableFooterRight.css('margin-right', scrollBarWidth);
				}
			}else{
				this.$yProxyScroll.css('display', 'none');
				if(this.setting.summaryPos == 'bottom'){
					this.$tableFooterRight.css('margin-right', 0);
				}
			}
			this.resize();
		},
		_fixXProxyScroll: function(){
			if(this._hasXProxyScroll()){
				this.$xProxyScroll.scroll();
			}
		},
		/**
		 * 网格头跟随滚动
		 */
		_headerFollow: function(){
			var gridTop = this.$element.offset().top
				,wrapTop = this.$wrap.offset().top
				,bodyHeight = this.$tableBodyMain.outerHeight()
				,css = {top : wrapTop - gridTop};
			if(css.top < 0){
				css.top = 0;
			}else if(css.top > bodyHeight ){
				css.top = bodyHeight;
			}
			this.$header.css(css);
			this.$tableHeader.css(css);
		},
		/**
		 * 网格尾跟随滚动
		 */
		_footerFollow: function(){
			if(this.setting.follow != 'all' && this.setting.follow != 'footer'){
				return;
			}
			var wrapTop = this.$wrap.offset().top
				,gridFooterTop = this.$element.offset().top + this.$element.outerHeight()
				,wrapHeight = this.$wrap.outerHeight()
				,bodyHeight = this.$tableBody.outerHeight()
				,css = {top: wrapTop - gridFooterTop + wrapHeight};
			if(css.top > 0){
				css.top = 0;
			}else if(css.top < -bodyHeight ){
				css.top = -bodyHeight;
			}
			if(this.$xProxyScroll){
				this.$xProxyScroll.css(css);
			}
			this.$tableFooter.css(css);
			this._setPagerDownCss(css);
			if(css.top != 0){
				this.$tableFooter.addClass('relativeFooter');
			}else{
				this.$tableFooter.removeClass('relativeFooter');
			}
		},
		/**
		 * 初始化数据到网格中
		 */
		_initData: function(){
			var s = this.setting;
			this._initSort();
			if(s.data){
				this._loadPagers(1, s.data[s.jsonReader.total]);
				this._loadData(s.data);
				updateColumnTitle.call(this);
			}else if(s.url){
				if(s.autoLoad){
					this.load(s.url);
				}
			}
		},
		/**
		 * 异步请求数据
		 * @param successHandle 加载成功事件
		 * @param params 查询参数
		 */
		_ajax: function(successHandle, params){
			/**
			 * 远程数据加载前事件，并返回一个值，当为false时不进行远程加载
			 * @event grid-class#beforeLoad
			 * @returns {Boolean} boolean 返回值为false 不加载数据
			 */
			if(this.trigger('beforeLoad') === false){
				return;
			}
			var url = this.setting.url
				,grid = this;
			if(!url){
				return;
			}
			var rowData = this.getRows();
			if(rowData && rowData.length > 0){
				this._loadData([], null, true);
			}
			this._showMessage(loading);
			AppAjax.ajaxCall({
				url: url,
				data: this._getQueryParam(params),
				dataType: 'json',
				type: 'POST',
				success: function(data){
					updateColumnTitle.call(grid);
					grid._hideMessage();
					/**
					 * 远程数据加载完成事件
					 * <PRE>
					 * 	该事件传入加载的数据，可以通过该函数对数据进一步加工
					 * </PRE>
					 * @event grid-class#onLoadSuccess
					 * @param {Object} data 加载的数据
					 */
					grid.trigger('onLoadSuccess', data);
					if(!data){data = [];}
					successHandle(data);
				},
				errorHandle: function(){
					grid._showMessage(error);
				}
			});
		},
		/**
		 * 获取请求的查询参数
		 */
		_getQueryParam: function(params){
			var sortParam = {};
			if(this.setting.remoteSort){
				var sort = this.getCurrentSort();
				sortParam = {__sort__: JSON.stringify(sort)};
			}
			return $.extend({}, this.getFixedParameter(), this.getParameter(), this.getCurrentPager(), sortParam, params);
		},
		/**
		 * 设置固定查询参数，当下次请求远程数据的时候加入该固定查询参数
		 * @param {Object} param 设置查询参数
		 * @example $('#demo').grid('setFixedParameter',{a:1, b:2});
		 * @memberof grid-class
		 * @instance
		 */
		setFixedParameter: function(params){
			this._FixedParameter = params;
		},
		/**
		 * 获取当前的固定查询参数
		 * @returns {Object} String 查询参数
		 * @example $('#demo').grid('getFixedParameter');
		 * @memberof grid-class
		 * @instance
		 */
		getFixedParameter: function(){
			return this._FixedParameter;
		},
		/**
		 * 设置查询参数，当下次请求远程数据的时候加入该查询参数
		 * @param {Object} param 设置查询参数
		 * @example $('#demo').grid('setParameter',{a:1, b:2});
		 * @memberof grid-class
		 * @instance
		 */
		setParameter: function(params){
			this._parameter = params;
		},
		/**
		 * 获取当前的查询参数
		 * @returns {Object} String 查询参数
		 * @example $('#demo').grid('getParameter');
		 * @memberof grid-class
		 * @instance
		 */
		getParameter: function(){
			if(this._parameter){
				return this._parameter;
			}else{
				return null;
			}
		},
		/**
		 * 加载数据
		 * @param {object/string} obj 如果是对象则作为查询参数，如果为字符串做为远程url地址
		 * @todo 如有分页则定位到第一页
		 * @fires grid-class#beforeLoad
		 * @fires grid-class#onLoadSuccess
		 * @example $('#demo').grid('load','a.do');
		 * @memberof grid-class
		 * @instance
		 */
		load: function(obj){
			if(typeof(obj) == 'string'){
				this.setting.url = obj;
			}else if(typeof(obj) == 'object'){
				this.setParameter(obj);
			}
			var g = this
				,params = null;
			if(this._hasPager()){
				params = {page: 1};
			}
			this._ajax(function(data){
				g._loadPagers(1, data[g.setting.jsonReader.total]);
				g._loadData(data, 1);
			}, params);
		},
		/**
		 * 根据条件查询数据
		 */
		query: function(params){
			this.setParameter(params);
			this.load();
		},
		/**
		 * 重新加载行，就像 load 方法一样，但是保持在当前页。
		 * @param {object/string} obj 如果是对象则作为查询参数，如果为字符串做为远程url地址
		 * @fires grid-class#beforeLoad
		 * @fires grid-class#onLoadSuccess
		 * @example $('#demo').grid('reload');
		 * @memberof grid-class
		 * @instance
		 */
		reload: function(obj){
			if(typeof(obj) == 'string'){
				this.setting.url = obj;
			}else if(typeof(obj) == 'object'){
				this.setParameter(obj);
			}
			var g = this;
			this._ajax(function(data){
				g._loadPagers(g.getPageIndex(), data[g.setting.jsonReader.total]);
				g._loadData(data, g._getStarRowNumber());
			});
		},
		/**
		 * 载入静态数据，清除编辑信息
		 * @param {Object|Array} data 行数组数据{Array} 或 数据对象{rows,footer}
		 * @todo 行号重置为1
		 * @todo 替换表格体数据，如果存在footer，替换footer
		 * @example $('#demo').grid('loadData',[{col1:1,col2:2,col3:3}]);
		 * @example $('#demo').grid('loadData',{rows:[{col1:1,col2:2,col3:3}],footer:[{col1:100,col3:100}]});
		 * @memberof grid-class
		 * @instance
		 */
		loadData: function(data){
			this._loadData(data, 1);
			this._newData = {updated:{}, inserted:{}, deleted:{}};
		},
		/**
		 * 重新渲染表格数据，清除编辑信息
		 * @example $('#demo').grid('reflashData');
		 * @memberof grid-class
		 * @instance
		 */
		reflashData: function(){
			this._loadData(this.getRows(), this._getStarRowNumber());
			this._newData = {updated:{}, inserted:{}, deleted:{}};
		},
		/**
		 * 加载数据，包括数据体和数据尾
		 * 	清除表格原本数据，再载入新数据
		 */
		_loadData: function(data, starNum, noDataRender){
			var that = this
				,rows = null
				,footer = null;
			resetNewData();
			if($.isArray(data)){
				rows = data;
				this._setRows(rows);
			}else{
				rows = data[this.setting.jsonReader.rows];
				footer = data[this.setting.jsonReader.footer];
				this.data = data;
				if(data.dicts){
					if(this.dicts){
						$.extend(true, this.dicts, data.dicts);
					}else{
						this.dicts = data.dicts;
					}
				}
				this._setRows(rows);
				if(footer){
					this._setFooterRows(footer);
				}else{
					this._setFooterRows([]);
				}
			}
			this._calculateData(this.getRows());
			this._sortData();
			this._loadBody(rows, starNum);
			this.loadFooter(footer);
			this._fitWordColumn();
			if(!noDataRender){
				this._afterDataRender(data);
			}
			setTimeout(function(){
				that.resize();
			}, 100);
			function resetNewData(){
				that._newData.updated = {};
				that._newData.inserted = {};
				that._newData.deleted = {};
			}
		},
		setDicts: function(dicts){
			this.dicts = dicts;
		},
		getDicts: function(){
			return this.dicts;
		},
		/**
		 * 初始化计算函数
		 */
		_initCalcFunc: function(data){
			var formulaContainer = this.setting.formulaContainer;
			if(formulaContainer[0].func != undefined){
				return;
			}
			if(data.length > 0){
				var row = data[0];
				var argKeys = [];
				argKeys.push('__obj__');
				for(var attr in row){
					if(attr.indexOf('|') == -1){
						argKeys.push(attr);
					}
				}
				for(var i = 0 ; i < formulaContainer.length; i++){
					var formula = formulaContainer[i];
					formula.func = new Function(argKeys, 'return (' + formula.formula + ');');
				}
			}
		},
		/**
		 * 计算数据
		 */
		_calculateData: function(data){
			var formulaContainer = this.setting.formulaContainer;
			if(formulaContainer.length == 0){
				return;
			}
			this._initCalcFunc(data);
			for(var i = 0 ; i < data.length; i++){
				for(var j = 0; j < formulaContainer.length; j++){
					this._calculateRow(formulaContainer[j], data[i]);
				}
			}
		},
		/**
		 * 计算行数据
		 */
		_calculateRow: function(formula, row){
			var args = [];
			args.push(row);
			for(var attr in row){
				args.push(row[attr]);
			}
			row[formula.field] = formula.func.apply(row, args);
		},
		/**
		 * 载入表格体数据
		 * @param {Array} rows 尾数据数据
		 */
		_loadBody: function(rows, starNum){
			if(!rows){
				return;
			}
			if(!isNaN(starNum)){
				this._rownumbers = starNum;
			}
			this._clearBodyHtml();
			if(rows.length > 0){
				this._hideMessage();
			}else{
				this._showMessage(empty);
			}
			this._loadBodyHtml(rows);
			/**
			 * 当网格体的数据发生改变的事件
			 * @event grid-class#onDataChange
			 */
			this.trigger('onDataChange');
		},
		/**
		 * 清除数据体Html
		 * 清除前 将编辑器移动回编辑器容器
		 */
		_clearBodyHtml: function(){

			this._currentEditRowId = null;

			this._restoreEditor();
			this.$tableBodyLeft.find('>div>table>tbody').html('');
			this.$tableBodyRight.find('>div>table>tbody').html('');
			this.$tableBodyMain.find('>div>table>tbody').html('');
		   if (this.$cardRegion["center"]){
				this.$cardRegion["center"].find('.grid-view>tbody').html('');
			}



		},
		/**
		 * 追加数据行的网格体
		 * @param {Array} rows
		 */
		_loadBodyHtml: function(rows){
			//视图内容加载 by sjq
			if (this.viewType==VIEW_TYPE.GRID_VIEW){
				this._fixRowNumberWidth(rows);
				this._loadBodyHtmlSimpleRow(rows);
			}else{
				this._loadBodyCardRow(rows)
			}
			this.$tableHeaderLeft.find('td[field="_checkbox"] input').prop('checked', false);
		},
		_loadBodyCardRow:function(rows){
			//不显示无记录
			  this._hideMessage();
			var mainHtml = []
				,trHead = ''
				,trEnd = '</tr>'
				,rowsLen = rows.length;
			for (var i = 0; i < rowsLen ; i++) {
				var rowData = rows[i]
					,trId = App.uuid();
				rowData.__rowId = trId;
				trHead = this._createRowTr(rowData, i);
				//leftHtml += trHead + this._initRowTrInnerHtml(this.frozenColumns, rowData) + trEnd;
				mainHtml.push(trHead+this._createViewRow(rowData, i)+trEnd);
				//rightHtml += trHead + this._initRowTrInnerHtml(this.frozenColumnsRight, rowData) + trEnd;
				this._rowData[trId] = rowData;
				this._rownumbers++;
			}
		   
		
			this.$cardRegion["center"].find('.grid-view>tbody').append(mainHtml.join(""));
			this._footerFollow();
			this._fixXProxyScroll();
			this._fixYProxyScrollHeight();

		},
		_createViewRow:function(rowData,index){
			var view=this.setting.view,	result="<td>";

			if ($.isFunction(view.rowRender)){
				result+=view.rowRender.call(this,rowData)

			}
			return result+"</td>";

		},
		/**
		 * 安装普通数据行输出网格展现
		 */
		_loadBodyHtmlSimpleRow: function(rows){
			var leftHtml = ''
				,mainHtml = ''
				,rightHtml = ''
				,trHead = ''
				,trEnd = '</tr>'
				,rowsLen = rows.length;
			for (var i = 0; i < rowsLen ; i++) {
				var rowData = rows[i]
					,trId = App.uuid();
				rowData.__rowId = trId;
				trHead = this._createRowTr(rowData, i);
				leftHtml += trHead + this._initRowTrInnerHtml(this.frozenColumns, rowData) + trEnd;
				mainHtml += trHead + this._initRowTrInnerHtml(this.columns, rowData) + trEnd;
				rightHtml += trHead + this._initRowTrInnerHtml(this.frozenColumnsRight, rowData) + trEnd;
				this._rowData[trId] = rowData;
				this._rownumbers++;
			}
			this.$tableBodyLeft.find('>div>table>tbody').append(leftHtml);
			this.$tableBodyRight.find('>div>table>tbody').append(rightHtml);
			this.$tableBodyMain.find('>div>table>tbody').append(mainHtml);
			this._footerFollow();
			this._fixXProxyScroll();
			this._fixYProxyScrollHeight();
			fixYProxyScroll(this);
			function fixYProxyScroll(grid){
				grid.$tableBodyLeft.scrollTop(0);
				grid.$tableBodyMain.scrollTop(0);
				grid.$tableBodyRight.scrollTop(0);
			}
		},
		_createRowTr: function(rowData, index){
			var result = ''
				,rowClass = '';
			/**
			 * 行是否可勾选
			 * @event grid-class#rowCheckable
			 * @returns {Boolean} boolean 返回值为false 则为不可勾选
			 */
			if($.isFunction(this.setting.rowCheckable)){
				if(this.setting.rowCheckable(rowData, this._rownumbers) === false){
					rowClass = 'row-uncheckable';
				}
			}
			var rowCusCls = '';
			/**
			 * 自定义行样式输出
			 * @event grid-class#rowCls
			 * @returns {String} string 返回值行样式
			 */
			if(this.hasBindEvent('rowCls')){
				rowCusCls = ' ' + this.__events.rowCls[0](rowData, index);
			}
			if(rowData._rowType  == 'subtotal'){
				rowClass += ' subtotal' + rowCusCls;
				result = '<tr id="' + rowData.__rowId + '" class="' + rowClass + '">';
			}else{
				rowClass += ' data-row ' + (index%2 == 0 ? 'even' : 'odd') + rowCusCls; 
				var idAttr = rowData[this.setting.idField] ? '_v="' + rowData[this.setting.idField] + '"' : '';
				result = '<tr id="' + rowData.__rowId + '" ' + idAttr + ' class="' + rowClass + '">';
			}
			return result;
		},
		/**
		 * 根据行号自适应调整行号列的宽度
		 */
		_fixRowNumberWidth: function(rows){
			if(this.setting.rownumbers != 'normal' && this.setting.rownumbers != 'repeat'){
				return;
			}
			var rownumber = 0;
			if(this.setting.rownumbers == 'normal'){
				rownumber += this._rownumbers + rows.length;
			}else{
				rownumber += rows.length;
			}
			var width = 30;
			if(rownumber > 99 && rownumber < 999){
				width = 38;
			}else if(rownumber > 999 && rownumber < 9999){
				width = 47;
			}else if(rownumber > 9999 && rownumber < 99999){
				width = 56;
			}else if(rownumber > 99999 && rownumber < 999999){
				width = 64;
			}else if(rownumber > 999999 && rownumber < 9999999){
				width = 73;
			}
			var hasOriScroll = this._hasXProxyScroll();
			if(Math.abs(this.$tableHeaderLeft.find('td[field="_rownumbers"]').outerWidth() - width) > 5){
				var $td = this.$tableHeader.find('td[field="_rownumbers"]')
					,cid = $td.attr('_cid')
					,viewWidth = this.$tableHeader.find('table').outerWidth()
					+ (width - this._column[cid].width);
				if(this.$xProxyScroll){
					this.$xProxyScroll.css('margin-left',viewWidth);
				}
				this._setFooterBorderTop();
				this.$table.find('td[_cid=' + cid + ']>div').css('width', width);
				this._column[cid].width = width;
				if(this.setting.fitColumns && !hasOriScroll){
					this.resize();
				}
			}
		},
		/**
		 * 数据渲染完成事件
		 */
		_afterDataRender: function(data){
			if(this.setting.mergeColumns){
				this.mergeColumns(this.setting.mergeColumns);
			}
			/**
			 * 数据渲染完成事件
			 * @event grid-class#afterDataRender
			 * @param {Object} data 渲染的数据
			 */
			this.trigger('afterDataRender', data);
		},
		/**
		 * 清除当前行的样式
		 */
		_clearCurrent: function(){
			this.$tableBodyLeft.find('>div>table tr.' + currentRowCls).removeClass(currentRowCls);
			this.$tableBodyRight.find('>div>table tr.' + currentRowCls).removeClass(currentRowCls);
			this.$tableBodyMain.find('>div>table tr.' + currentRowCls).removeClass(currentRowCls);
		},
		/**
		 * 生成数据行的内容html
		 */
		_initRowTrInnerHtml: function(cols, row){
			var result = '';
			for ( var i = 0; i < cols.length; i++) {
				result += this._initCellHtml(cols[i], row);
			}
			return result;
		},
		/**
		 * 生成数据单元格html
		 */
		_initCellHtml: function(col, row){
			if(col.hidden){
				return '';
			}
			var titleAttr = ''
				,divCss = ''
				,tdCss = ''
				,tdCls = ''
				,showTitle = this._getFormatText(col, row);
			if(col.showTitle){
				if (showTitle){
					titleAttr = 'title="'+ escapeHtml(showTitle) +'"';
				}
			}
			if(row._rowType  == 'subtotal' && col.subtotalText){
				tdCss = col.subtotalCss;
				tdCls = col.subtotalCls;
				row[col.field] = col.subtotalText;
			}
			if(row[col.field + '_style']){
				divCss += row[col.field + '_style'];
			}
			return '<td ' + this._getBodyTdExp(col, row, tdCss) + col.bodyTdAttrExp + this._getTdClassAttr(col, tdCls) + titleAttr + '>' +
				'<div style="width:' + col.width + 'px;' + divCss + '">' + this._initTdInnerHtml(col, row, showTitle) + '</div>' +
				'</td>';
		},
		/**
		 * 获取数据单元格的样式表达式
		 */
		_getBodyTdExp: function(col, row){
			var result = '';
			if($.isFunction(col.styler)){
				var css = col.styler(row[col.field], row);
				if(css){
					result += css;
				}
			}else if(col.styler){
				result += col.styler;
			}
			if(result){
				result = 'style="' + result + '" '
			}
			return result;
		},
		_getTdClassAttr: function(col, tdCls){
			var result = '';
			if(col.cls){
				result = col.cls;
			}
			if(tdCls){
				result += ' ' + tdCls ;
			}
			if(col.hidden){
				result += ' grid-cell-hidden';
			}
			if(result){
				result = ' class="' + result + '"';
			}
			return result;
		},
		/**
		 * 获取行内数据单元格div内的html
		 */
		_initTdInnerHtml: function(col, row, showTitle){
			var html = '';
			if(col.sysCol){
				if(col.field == '_rownumbers'){
					html = this._rownumbers+'';
				}else if(col._html){
					html = col._html;
				}else if(col.buttons){
					html = this._getBtnHtml(col, row);
				}
				return html;
			}else if(showTitle != IE8_TD_EMPTY){
				return showTitle;
			}else{
				return this._getFormatText(col, row)
			}
		},
		/**
		 * 获取行操作按钮的文本
		 * @param col 列信息
		 * @param row 行数据
		 */
		_getBtnHtml: function(col, row){
			var html = ''
				,btns = col.buttons;
			for(var i= 0; i < btns.length; i++){
				var btn = btns[i];
				html += this._createRowBtn(btn, row, this._rownumbers);
			}
			return html;
		},
		/**
		 * 获取列展现值
		 */
		_getFormatText: function(col, row){
			var text = row[col.field]
				,formatter = col.formatter;
			if(col.formatPattern){
				formatter = 'numberFormatter';
			}
			if(formatter){
				if($.isFunction(formatter)){
					text = formatter(text, row, this._rownumbers, col);
				}else if(typeof(formatter) == 'string'){
					if(!col.formatPattern){
						if(formatter.charAt(0) == '[' && formatter.charAt(formatter.length-1) == ']'){
							col.formatPattern = formatter.substr(1, formatter.length-2)
							formatter = 'numberFormatter';
						}
					}
					if(col.template){
						text = col.template.apply(row);
					}else{
						text = Formatter.formatter(formatter, text, row, this._rownumbers, col);
					}
				}
			}else if(this.dicts){
				var dict = this.dicts[col.field]; 
				if(dict){
					text = dict[text];
				}
			}
			return escapeScriptTag(text);
			function escapeScriptTag(str){
				if(str == undefined){
					str = IE8_TD_EMPTY;
				}else if(typeof(str) == 'string'){
					str = str.replace(/<script/g, '&lt;script');
					var blank = str.match(/^[ ]*/);
					if(blank && blank[0]){
						var htmlBlank = '&nbsp;'
							,len = blank[0].length;
						for(var i = 1; i < len; i++){
							htmlBlank += '&nbsp;';
						}
						str = str.replace(/^[ ]*/, htmlBlank);
					}
				}
				return str;
			}
		},
		/**
		 * 载入数据尾
		 * @todo 清除尾{@link grid#clearFooter}
		 * @todo 追加尾{@link grid#appendFooter}
		 * @param {Array} footer 尾数据数据
		 * @example $('#demo').grid('loadFooter',[{col1:1,col2:1,col3:1},{col1:2,col2:2,col3:2}]);
		 * @memberof grid-class
		 * @instance
		 */
		loadFooter: function(footer){
			this.clearFooter();
			this._appendSummary();
			this.appendFooter(footer);
		},
		/**
		 * 清除尾
		 * @example $('#demo').grid('clearFooter');
		 * @memberof grid-class
		 * @instance
		 */
		clearFooter: function(){
			this.$tableFooterLeft.find('>div>table>tbody').html('');
			this.$tableFooterRight.find('>div>table>tbody').html('');
			this.$tableFooterMain.find('>div>table>tbody').html('');
			this.$tableFooterCustom.html('');
			this._frowsnumber = 1;
			this._setFooterRows([]);
			this._footerFollow();
			this._fixHeight();
			this.$tableFooter.css('display', 'none');
		},
		/**
		 * 追加表尾
		 * @param {Array} footer 尾数据数据
		 * @example $('#demo').grid('appendFooter',[{col1:1,col2:1,col3:1},{col1:2,col2:2,col3:2}]);
		 * @memberof grid-class
		 * @instance
		 */
		appendFooter: function(footer){
			if(!footer){
				return;
			}
			this._appendFooter(footer);
			this._appendFooterData(footer);
		},
		/**
		 * 追加数据到网格输出
		 * @param footer
		 */
		_appendFooter: function(footer){
			if(!$.isArray(footer) && footer){
				footer = [footer];
			}
			if(footer.length == 0){
				return;
			}
			var leftHtml = ''
				,rightHtml = ''
				,mainHtml = '';
			for ( var i = 0; i < footer.length; i++) {
				leftHtml += this._initFootRowHtml(this.frozenColumns, footer[i]);
				rightHtml += this._initFootRowHtml(this.frozenColumnsRight, footer[i]);
				mainHtml += this._initFootRowHtml(this.columns, footer[i]);
				this._frowsnumber++;
			}
			this.$tableFooterLeft.find('>div>table>tbody').append(leftHtml);
			this.$tableFooterRight.find('>div>table>tbody').append(rightHtml);
			this.$tableFooterMain.find('>div>table>tbody').append(mainHtml);
			this.$tableFooter.css('display', 'block');
			this._fixHeight();
			this._footerFollow();
			this._fixXProxyScroll();
		},
		/**
		 * 追加结尾的数据
		 */
		_appendFooterData: function(footer){
			var oriFooter = this.getFooterRows();
			if(oriFooter){
				if($.isArray(footer)){
					$.merge(oriFooter, footer);
				}else{
					oriFooter.push(footer);
				}
			}else{
				this._setFooterRows(footer);
			}
		},
		/**
		 * 生成数据行html
		 */
		_initFootRowHtml: function(cols, row, index){
			var html = '<tr>';
			for ( var i = 0; i < cols.length; i++) {
				html += this._initFootCellHtml(cols[i], row, index);
			}
			return html + '</tr>';
		},
		/**
		 * 生成数据单元格html
		 */
		_initFootCellHtml: function(col, row, index){
			var titleAttr = ''
				,divCss = ''
				,tdCss = ''
				,tdCls = '';
			if(col.totalText){
				tdCss = col.totalCss;
				tdCls = col.totalCls;
				row[col.field] = col.totalText;
			}
			var showTitle = this._getFormatText(col, row);
			if(col.showTitle && showTitle){
					titleAttr = ' title="'+ escapeHtml(showTitle) +'"';
			}
			if(row[col.field + '_style']){
				divCss += row[col.field + '_style'];
			}
			return '<td style="' + this._getBodyTdExp(col, row, tdCss) + '" ' + col.footerTdAttrExp + this._getTdClassAttr(col, tdCls) + titleAttr +'>' +
				'<div style="width:' + col.width + 'px;' + divCss +'">' + this._initFooterTdInnerHtml(col, row, index, showTitle) + '</div>' +
				'</td>';
		},
		/**
		 * 获取尾行内数据单元格div内的html
		 */
		_initFooterTdInnerHtml: function(col, row, index, showTitle){
			var html = '';
			if(col.sysCol){
				if(col.field == '_rownumbers'){
					if(this.setting.footerRowNumber){
					   html =  this._frowsnumber + '';
					}else if(row._rownumbers){
					   html = this._getFormatText(col, row, index);         
					}else{
					   html =  '合计';           
					}
				}
			}else if(showTitle){
				return showTitle;
			}else{
				html = this._getFormatText(col, row, index);
			}
			return html;
		},
		/**
		 * 获取当前网格的数据
		 * @property {Object} [returns] 数据对象
		 * @property {Array} [returns.rows] 数据行
		 * @property {Array} [returns.footer] 尾数据行
		 * @property {Number} [returns.total] 行总数
		 * @returns {Object} data 数据对象
		 * @example $('#demo').grid('getData');
		 * @memberof grid-class
		 * @instance
		 */
		getData: function(){
			return this.data;
		},
		/**
		 * 网格上的数据是否为合法，当存在非法数据时返回false
		 * @returns {Boolean} valid true为合法
		 * @example $('#demo').grid('isValid');
		 * @memberof grid-class
		 * @instance
		 */
		isValid: function(){
			if(this.$tableBody.find('.invalid').length > 0){
				return false;
			}else{
				return true;
			}
		},
		/**
		 * 获取当前网格展现的数据
		 * @returns {Array} rows 数据行
		 * @example $('#demo').grid('getAllData');
		 * @memberof grid-class
		 * @instance
		 */
		getAllData: function(copy){
			var trs = this.$tableBodyMain.find('tr')
				,data = [];
			for(var i = 0; i< trs.length; i++){
				var rowData = this._getDataByRowId(trs[i].id);
				if(rowData){
					if(copy){
						rowData = $.extend(true, {}, rowData);
						delete rowData.__rowId;
					}
					data.push(rowData);
				}
			}
			return data;
		},
		/**
		 * 获取当前编辑行的数据
		 * @returns {Object} rowData 数据行
		 * @example $('#demo').grid('getCurrentEditRowData');
		 * @memberof grid-class
		 * @instance
		 */
		getCurrentEditRowData: function(){
			return this._getDataByRowId(this._currentEditRowId);
		},
		/**
		 * 获取当前编辑行的数据
		 * @returns {Object} rowData 数据行
		 * @example $('#demo').grid('getCurrentEditRowIndex');
		 * @memberof grid-class
		 * @instance
		 */
		getCurrentEditRowIndex: function(){
			if(this._currentEditRowId == null){
				return -1;
			}else{
				return this._convertRowIdToRowIndex(this._currentEditRowId);
			}
		},
		/**
		 * 根据行内置id获取数据，编辑的数据优先获取
		 */
		_getDataByRowId: function(rowId){
			var data = this._newData.deleted[rowId];
			if(data){
				return null;
			}
			data = this._newData.updated[rowId];
			if(data){
				var t = $.extend(true, {}, this._rowData[rowId], data);
				return $.extend(true, data, t);
			}
			data = this._newData.inserted[rowId];
			if(data){
				return data;
			}
			data = this._rowData[rowId];
			return data;
		},
		/**
		 * 获取当前网格的的数据行
		 * @returns {Array} rows 数据行
		 * @example $('#demo').grid('getRows');
		 * @memberof grid-class
		 * @instance
		 */
		getRows: function(){
			return this.data[this.setting.jsonReader.rows];
		},
		/**
		 * 设置当前网格的的数据行
		 */
		_setRows: function(rows){
			this.data[this.setting.jsonReader.rows] = rows;
		},
		/**
		 * 获取当前网格的的尾数据行
		 * @returns {Array} footer 数据行
		 * @example $('#demo').grid('getFooterRows');
		 * @memberof grid-class
		 * @instance
		 */
		getFooterRows: function(){
			return this.data[this.setting.jsonReader.footer];
		},
		/**
		 * 获取计算行数据
		 * @returns {Array} summaryRow 计算行数据
		 * @example $('#demo').grid('getSummaryRow');
		 * @memberof grid-class
		 * @instance
		 */
		getSummaryRow: function(){
			return this.summaryRow;
		},
		/**
		 * 设置当前网格的的尾数据行
		 */
		_setFooterRows: function(footer){
			this.data[this.setting.jsonReader.footer] = footer;
		},
		/**
		 * 根据行号获取行数据
		 * @param {Number} rowIndex 行号
		 * @returns {Object} row 数据
		 * @example $('#demo').grid('getDataByRowIndex', 0);
		 * @memberof grid-class
		 * @instance
		 */
		getDataByRowIndex: function(rowIndex){
			var rowId = this._convertRowIndexToRowId(rowIndex);
			return this._getDataByRowId(rowId);
		},
		/**
		 * 选中行，勾选行
		 * @todo 如果行不可选中，则不触发beforeSelect和onSelect事件
		 * @param {Number|String} rowIndex 尾数据数据
		 * @returns {Object} data 数据对象{rows,footer}
		 * @fires grid-class#beforeSelect
		 * @fires grid-class#onSelect
		 * @example $('#demo').grid('selectRow',1);
		 * @example $('#demo').grid('selectRow','表格主键值');
		 * @memberof grid-class
		 * @instance
		 */
		selectRow: function(rowIndex){
			var exp = this._getRowExpr(rowIndex)
				,selectable = this.$tableBodyMain.find(exp).is(':not(.row-uncheckable)')
				,rowData = this.getDataByRowIndex(rowIndex);
			if(selectable){
				/**
				 * 选择行前事件
				 * @event grid-class#beforeSelect
				 * @param {Object} rowData 行数据对象
				 * @param {Number} rowIndex 行号
				 * @returns {Boolean} boolean 返回值为false 取消选择
				 */
				if(this.trigger('beforeSelect', rowData, rowIndex) === false){
					return;
				}
			}
			this._renderRow(rowIndex, rowData);
			if(selectable){
				/**
				 * 选择行事件
				 * @event grid-class#onSelect
				 * @type {object}
				 * @param {Object} rowData 行数据
				 * @param {Number} rowIndex 行号
				 */
				this.trigger('onSelect', rowData, rowIndex);
			}
		},
		/**
		 * 行是否可以勾选
		 * @param {Number|String} rowIndex
		 * @return {boolean} true 为可以勾选
		 * @example $('#demo').grid('isCheckable',1);
		 * @example $('#demo').grid('isCheckable','表格主键值');
		 * @memberof grid-class
		 * @instance
		 */
		isCheckable: function(rowIndex){
			var exp = this._getRowExpr(rowIndex);
			return !this.$tableBodyMain.find(exp).hasClass('row-uncheckable');
		},
		/**
		 * 设置行为可勾选状态
		 * @param {Number|String} rowIndex
		 * @example $('#demo').grid('uncheckable',1);
		 * @example $('#demo').grid('uncheckable','表格主键值');
		 * @memberof grid-class
		 * @instance
		 */
		checkable: function(rowIndex){
			var exp = this._getRowExpr(rowIndex);
			this.$tableBodyLeft.find(exp).removeClass('row-uncheckable');
			this.$tableBodyMain.find(exp).removeClass('row-uncheckable');
			this.$tableBodyRight.find(exp).removeClass('row-uncheckable');
		},
		/**
		 * 设置行为不可勾选状态
		 * @param {Number|String} rowIndex
		 * @example $('#demo').grid('uncheckable',1);
		 * @example $('#demo').grid('uncheckable','表格主键值');
		 * @memberof grid-class
		 * @instance
		 */
		uncheckable: function(rowIndex){
			var exp = this._getRowExpr(rowIndex);
			this.$tableBodyLeft.find(exp).addClass('row-uncheckable');
			this.$tableBodyMain.find(exp).addClass('row-uncheckable');
			this.$tableBodyRight.find(exp).addClass('row-uncheckable');
		},
		/**
		 * 渲染行，如果行可以选中则选中，如果行可以勾选则勾选
		 * @param rowIndex 行号
		 */
		_renderRow: function(rowIndex){
			var exp = this._getRowExpr(rowIndex);
			if(!exp){
				return;
			}
			if(!this.setting.checkbox){
				this._renderUnselectRow('tr.' + selectedRowCls);
			}
			this._renderSelectRow(exp);
			this._renderBoxValue(exp, true);
		},
		/**
		 * 根据行数据的属性搜索，获取条件完全匹配的节点数据 JSON 对象
		 * @param {String} key 需要精确匹配的属性名称
		 * @param {?} value 需要精确匹配的属性值，可以是任何类型，只要保证与 key 指定的属性值保持一致即可
		 * @returns 匹配精确搜索的节点数据 1、如无结果，返回 null 2、如有多个节点满足查询条件，只返回第一个匹配到的节点
		 * @example $('#demo').grid('getRowByParam', 'field1', 'val1');
		 * @memberof grid-class
		 * @instance
		 */
		getRowByParam: function(key, val){
			var rows = this.getRows();
			for(var i = 0; i < rows.length; i++ ){
				var row = rows[i];
				if(row[key] == val){
					return row;
				}
			}
			return null;
		},
		/**
		 * 根据自定义规则搜索节点数据 JSON 对象集合 或 单个节点数据
		 * @param {Function} filter 自定义过滤器函数 function filter(node) {...} filter 参数：node (节点数据 JSON)filter 返回值：boolean (true 表示符合搜索条件；false 表示不符合搜索条件)
		 * @returns {JSON} 第一个找到的节点数据 JSON，无结果时返回 null
		 * @example $('#demo').grid('getRowByFilter', function(row){if(row.field1 == 'val1'){return true}else{return false}});
		 * @memberof grid-class
		 * @instance
		 */
		getRowByFilter: function(filter){
			if(!$.isFunction(filter)){
				throw new Error('类型错误：getRowByFilter方法要传入一个过滤函数');
			}
			var rows = this.getRows();
			for(var i = 0; i < rows.length; i++ ){
				var row = rows[i];
				if(filter(row) === true){
					return row;
				}
			}
			return null;
		},
		/**
		 * 根据内部行对象获取行号
		 * @param node
		 * @returns {Number} 行号 ，如果未找到返回-1
		 * @memberof grid-class
		 * @instance
		 */
		getRowIndex: function(row){
			if(!row){
				throw new Error('无法获取空值');
			}
			if(!row.__rowId){
				throw new Error('该对象不是内部对象，无法获取行号');
			}
			return this.$tableBodyMain.find('#'+ row.__rowId).index();
		},
		/**
		 * 获取行的jquery选择器表达式
		 * @param {Number|String|Object} exp 行选择器
		 * 		Number为行号选择
		 * 		String为行id选择（内部）
		 * 		object为主键值选择
		 * @param {String} exp.type 选择器类型 id|index
		 * @param {String} exp.value 选择器值 index值或表主键值
		 */
		_getRowExpr: function(exp){
			var type = typeof(exp)
				,result = '';
			if(!isNaN(exp)){
				result = 'tr:eq(' + exp + ')';
			}else if(type == 'string'){
				result = 'tr#' + exp;
			}else if(type == 'object'){
				if(!exp.type || exp.type == 'id'){
					result = 'tr[_v="' + exp.value + '"]';
				}
			}
			return result;
		},
		/**
		 * 取消选中行
		 * @todo 如果行不可选中，则不触发onUnselect事件
		 * @param {Number} rowIndex 行号
		 * @fires grid-class#onUnselect
		 * @example $('#demo').grid('unselectRow',1);
		 * @memberof grid-class
		 * @instance
		 */
		unselectRow: function(rowIndex){
			var exp = this._getRowExpr(rowIndex)
				,selectable = this.$tableBodyMain.find(exp).is(':not(.row-uncheckable)');
			if(!exp){
				return;
			}
			this._renderUnselectRow(exp);
			this._renderBoxValue(exp, false);
			if(selectable){
				var rowData = this.getDataByRowIndex(rowIndex);
				/**
				 * 取消选择行事件
				 * @event grid-class#onUnselect
				 * @type {object}
				 * @param {Object} rowData 行数据
				 * @param {Number} rowIndex 行号
				 */
				this.trigger('onUnselect', rowData, rowIndex);
			}
		},
		/**
		 * 反选中行，反勾选行
		 * @param {Number} rowIndex 行号
		 * @example $('#demo').grid('toggleSelectRow',1);
		 * @memberof grid-class
		 * @instance
		 */
		toggleSelectRow: function(rowIndex){
			var exp = this._getRowExpr(rowIndex);
			if(!exp){
				exp = 'tr';
			}
			this._renderToggleSelectRow(exp);
			this._renderToggleBoxValue(exp);
		},
		/**
		 * 选中全部
		 * @fires grid-class#onSelectAll
		 * @example $('#demo').grid('selectAll');
		 * @memberof grid-class
		 * @instance
		 */
		selectAll: function(){
			this._renderSelectRow('>div>table>tbody>tr');
			this._renderBoxValue('', true);
			/**
			 * 全选则事件
			 * @param {Array} rows 所有行数据
			 * @event grid-class#onSelectAll
			 * @type {object}
			 */
			this.trigger('onSelectAll');
		},
		/**
		 * 全部不选中
		 * @example $('#demo').grid('unselectAll');
		 * @fires grid-class#onUnselectAll
		 * @memberof grid-class
		 * @instance
		 */
		unselectAll: function(){
			this._renderUnselectRow('>div>table>tbody>tr');
			this._renderBoxValue('', false);
			/**
			 * 全取消选则事件
			 * @event grid-class#onUnselectAll
			 */
			this.trigger('onUnselectAll');
		},
		/**
		 * 根据选择器设置选中行，勾选行
		 * @param exp 选择器
		 */
		_renderSelectRow: function(exp){
			var checkable = this.setting.checkbox;
			rowRender(this.$tableBodyLeft.find(exp));
			rowRender(this.$tableBodyMain.find(exp));
			rowRender(this.$tableBodyRight.find(exp));
			function rowRender($trs){
				if(checkable){
					$trs.filter(':not(.row-uncheckable)').addClass(checkedRowCls);
				}else{
					$trs.addClass(selectedRowCls);
				}
			}
		},
		/**
		 * 根据选择器取消选中行、取消勾选行
		 * @param exp 选择器
		 */
		_renderUnselectRow: function(exp){
			var checkable = this.setting.checkbox;
			rowRender(this.$tableBodyLeft.find(exp));
			rowRender(this.$tableBodyMain.find(exp));
			rowRender(this.$tableBodyRight.find(exp));
			function rowRender($trs){
				if(checkable){
					$trs.filter(':not(.row-uncheckable)').removeClass(checkedRowCls);
				}else{
					$trs.removeClass(selectedRowCls);
				}
			}
		},
		/**
		 * 根据选择器反选中行，反勾选行
		 * @param exp 选择器
		 */
		_renderToggleSelectRow: function(exp){
			var checkable = this.setting.checkbox;
			if(!checkable){
				this.unselectAll();
			}
			rowRender(this.$tableBodyLeft.find(exp));
			rowRender(this.$tableBodyMain.find(exp));
			rowRender(this.$tableBodyRight.find(exp));
			function rowRender($trs){
				if(checkable){
					$trs.filter(':not(.row-uncheckable)').toggleClass(checkedRowCls);
				}
			}
		},
        /**
		 * @function checkRow
         * @param rowIndex 行号
         * @param check 是否选中，默认不填选中
		 * @example $('#demo').grid('checkRow',0);
		 * @example $('#demo').grid('checkRow',0,false);
		 *
         */
		checkRow:function(rowIndex,check){
			if(check === undefined){
				check = true;
			}
            var exp = this._getRowExpr(rowIndex);
            this._renderSelectRow(exp);
            this._renderBoxValue(exp, check);
		},
		/**
		 * 根据选择器设置复选框或单选框的勾选情况
		 * @param exp
		 * @param checked
		 */
		_renderBoxValue: function(exp, checked){
			if(this.setting.checkbox){
				var $trs = this.$tableBodyLeft.find(exp);
				this.$tableBodyLeft.find(exp + ':not(.row-uncheckable) td[field="_checkbox"] input').each(function() {
					this.checked = checked;
				});
			}else if(this.setting.radiobox){
				this.$tableBodyLeft.find(exp + ' td[field="_radiobox"] input').each(function() {
					this.checked = checked;
				});
			}
			this._renderTopCheckboxValue();
		},
		/**
		 * 根据选择器反选复选框或单选框
		 * @param exp
		 */
		_renderToggleBoxValue: function(exp){
			if(this.setting.checkbox){
				this.$tableBodyLeft.find(exp + ':not(.row-uncheckable) td[field="_checkbox"] input').each(function() {
					this.checked = !this.checked;
				});
			}else if(this.setting.radiobox){
				this.$tableBodyLeft.find(exp + ' td[field="_radiobox"] input').each(function() {
					this.checked = !this.checked;
				});
			}
			this._renderTopCheckboxValue();
		},
		_renderTopCheckboxValue: function(){
			var checkedLen = this.$tableBodyMain.find('tr.' + checkedRowCls).length
				,checkableLen = this.$tableBodyMain.find('tr:not(.row-uncheckable)').length;
			if(checkableLen == 0){
				return;
			}
			if(checkedLen == checkableLen){
				this.$tableHeaderLeft.find('td[field="_checkbox"] input').prop('checked', true);
			}else{
				this.$tableHeaderLeft.find('td[field="_checkbox"] input').prop('checked', false);
			}
		},
		/**
		 * 判断传入的行号是否已被选中
		 * @returns {Number} rowIndex 行号
		 * @example $('#demo').grid('isSelectedRow');
		 * @memberof grid-class
		 * @instance
		 */
		isSelectedRow: function(rowIndex){
			return this.$tableBodyMain.find('tr:eq(' + rowIndex + ')').hasClass(selectedRowCls)
				|| this.$tableBodyMain.find('tr:eq(' + rowIndex + ')').hasClass(checkedRowCls);
		},
		/**
		 * 获取选中的第一行行号
		 * @returns {Number} rowIndex 行号
		 * @example $('#demo').grid('getSelectedRowIndex');
		 * @memberof grid-class
		 * @instance
		 */
		getSelectedRowIndex: function(){
			var selecteds
				,result = null;
			if(this.setting.radiobox){
				selecteds = this.$tableBodyLeft.find('td[field="_radiobox"] input:checked').closest('tr');
			}else{
				selecteds = this.$tableBodyMain.find('tr.' + selectedRowCls + ':first');
			}
			result = selecteds.index();
			return result;
		},
		/**
		 * 获取选中的第一行
		 * @returns {object} rowData 行数据
		 * @example $('#demo').grid('getSelected');
		 * @memberof grid-class
		 * @instance
		 */
		getSelected: function(){
			var selecteds
				,result = null;
			if(this.setting.radiobox){
				selecteds = this.$tableBodyLeft.find('td[field="_radiobox"] input:checked').closest('tr');
			}else{
				selecteds = this.$tableBodyMain.find('tr.' + selectedRowCls + ':first');
			}
			result = this._converRowToData(selecteds)[0];
			if(result == undefined){
				return null;
			}
			return result;
		},
		/**
		 * 获取选中的行
		 * @returns {Array} rows 选中行的数据数组
		 * @example $('#demo').grid('getSelections');
		 * @memberof grid-class
		 * @instance
		 */
		getSelections: function(){
			var selecteds;
			if(this.setting.checkbox){
				selecteds = this.$tableBodyMain.find('tr.' + checkedRowCls);
			}else{
				selecteds = this.$tableBodyMain.find('tr.' + selectedRowCls);
			}
			return this._converRowToData(selecteds);
		},
		/**
		 * 根据传入的行获取对于的数据
		 * @param $selectedRows
		 * @return []
		 */
		_converRowToData: function($selectedRows){
			var result = []
				,that = this;
			$selectedRows.each(function(){
				var row = that._getDataByRowId(this.id);
				result.push(row);
			});
			return result;
		},
		/**
		 * 当前行移动到下一行
		 * @todo 如果当前行没有，则定位到第一行
		 * @example $('#demo').grid('nextRow');
		 * @memberof grid-class
		 * @instance
		 */
		nextRow: function(){
			var index = this.getCurrentRowIndex()
				,length = this.$tableBodyMain.find('tr').length;
			if(index == -1){
				index = 0;
			}else{
				index = (++index)%length;
			}
			this.setCurrentRow(index);
		},
		/**
		 * 当前行移动到上一行
		 * @todo 如果当前行没有，则定位到第一行
		 * @example $('#demo').grid('prevRow');
		 * @memberof grid-class
		 * @instance
		 */
		prevRow: function(){
			var index = this.getCurrentRowIndex()
				,length = this.$tableBodyMain.find('tr').length;
			if(index == -1){
				index = 0;
			}else{
				index = ( --index + length)%length;
			}
			this.setCurrentRow(index);
		},
		/**
		 * 获取当前行的行索引
		 * 如果没有当前行，则返回-1
		 * @example $('#demo').grid('getCurrentRowIndex');
		 * @memberof grid-class
		 * @instance
		 */
		getCurrentRowIndex: function(){
			var $curr = this.$tableBodyMain.find('tr.' + currentRowCls);
			if($curr.length == 1){
				return $curr.index();
			}
			return -1;
		},
		/**
		 * 根据传入的行号设置对应行为当前行
		 * @param {Number} rowIndex 行号
		 * @example $('#demo').grid('setCurrentRow', 2);
		 * @memberof grid-class
		 * @instance
		 */
		setCurrentRow: function(rowIndex){
			this._setRowClass(rowIndex, currentRowCls);
		},
		/**
		 * 设置行为表格的唯一行样式，如果先撤销该样式的行
		 * @param {Number} rowIndex 行号
		 * @param {Class} cls 类型
		 */
		_setRowClass: function(rowIndex, cls){
			var exp = this._getRowExpr(rowIndex);
			this._removeRowClass(cls);
			this.$tableBodyLeft.find(exp).addClass(cls);
			this.$tableBodyMain.find(exp).addClass(cls);
			this.$tableBodyRight.find(exp).addClass(cls);
		},
		/**
		 * 清除已选行的样式
		 */
		_onBodyTrMouseLeave: function(){
			this._removeRowClass(hoverRowCls);
		},
		/**
		 * 清除已选行的样式
		 */
		_removeRowClass: function(cls){
			var exp = 'tr.' + cls;
			this.$tableBodyLeft.find(exp).removeClass(cls);
			this.$tableBodyMain.find(exp).removeClass(cls);
			this.$tableBodyRight.find(exp).removeClass(cls);
		},
		/**
		 * 获取当前行的数据，如果没有当前行 则返回null
		 * @returns {object} RowData 当前行的数据
		 * @example $('#demo').grid('getCurrentRowData');
		 * @memberof grid-class
		 * @instance
		 */
		getCurrentRowData: function(){
			var index = this.getCurrentRowIndex();
			if(index > -1){
				return this.getRows()[index];
			}
			return null;
		},
		/**
		 * 选中当前行
		 * @see {@link grid#selectRow}
		 * @example $('#demo').grid('selectCurrent');
		 * @memberof grid-class
		 * @instance
		 */
		selectCurrent: function(){
			var index = this.getCurrentRowIndex();
			if(index != -1){
				this.selectRow(index);
			}
		},
		/**
		 * 取消当前行
		 * @see {@link grid#unselectRow}
		 * @example $('#demo').grid('unselectCurrent');
		 * @memberof grid-class
		 * @instance
		 */
		unselectCurrent: function(){
			var index = this.getCurrentRowIndex();
			if(index != -1){
				this.unselectRow(index);
			}
		},
		/**
		 * 反选当前行
		 * @see {@link grid#toggleSelectRow}
		 * @example $('#demo').grid('toggleSelectCurrent');
		 * @memberof grid-class
		 * @instance
		 */
		toggleSelectCurrent: function(){
			var index = this.getCurrentRowIndex();
			if(index != -1){
				this.toggleSelectRow(index);
			}
		},
		/**
		 * 定位当前行到可视区域
		 * @example $('#demo').grid('locateCurrent');
		 * @memberof grid-class
		 * @instance
		 */
		locateCurrent: function(){
			var rowIndex = this.getCurrentRowIndex();
			if(rowIndex == -1){
				return;
			}
			this.locateRow(rowIndex);
		},
		/**
		 * 根据行号将对应的数据行定位到可视区域
		 * @example $('#demo').grid('locateRow', 2);
		 * @memberof grid-class
		 * @instance
		 */
		locateRow: function(rowIndex){
			var $row = this.$tableBodyMain.find(this._getRowExpr(rowIndex));
			if($row.length == 0){
				return;
			}
			this._scroll_yProxyScroll($row);
		},
		/**
		 * 滚动纵向代理滚动条定位到传入的行
		 * @param $row 要定位的行
		 */
		_scroll_yProxyScroll: function($row){
			if(this.setting.height == 'push'){
				var viewHeight = this.$wrap.outerHeight() - this.$header.outerHeight()
					- this.$tableHeader.outerHeight() - this.$tableFooter.outerHeight()
					- this._getPagerDownHeight();
				var oriTop = 0
					,children = this.$wrap.children();
				for(var i = 0; i < children.length; i++){
					var $child = $(children[i]);
					if($child.is(this.$element)){
						break;
					}
					oriTop += $child.outerHeight();
				}
				this.$wrap.scrollTop($row.position().top + oriTop - viewHeight);
			}else if(this.$yProxyScroll){
				var containerHeight = this.$tableBodyMain.outerHeight()  + 3
					,scrollTop = this.$tableBodyMain.scrollTop()
					,top = $row.offset().top + $row.outerHeight() - this.$tableBodyMain.offset().top + scrollTop;
				if(top <= scrollTop){
					this.$yProxyScroll.scrollTop(top - $row.outerHeight());
				}else if(top >= scrollTop + containerHeight){
					this.$yProxyScroll.scrollTop(top - containerHeight);
				}
			}
		},
		/**
		 * 注册标题列拖拽事件
		 */
		_registResizeColumnProxy: function(){
			var g = this;
			this.$table.on('mousemove.grid-column.resizable.api','.grid-table-header td', function(e){
				var $td = $(this);
				if(g._preventColumnResize($td) !== true){
					return;
				}
				var cursor = g._getCursor($td, e);
				if(cursor){
					$td.css('cursor', cursor);
				}else{
					$td.css('cursor', 'default');
				}
			}).on('mousedown.grid-column.resizable.api','.grid-table-header td', function(e){
				if(!g._isLeftMouseKey(e)){
					return;
				}
				var $td = $(this);
				if(g._preventColumnResize($td) !== true){
					return;
				}
				if(g._getCursor($td, e)){
					g.$targetTd = $td;
					g._onStartResizeColumn(e);
				}
			});
			this.$columnResizeProxy = this.$element.find('.col-resize-proxy');
		},
		/**
		 * 左按键判断
		 */
		_isLeftMouseKey: function(e){
			var result = false;
			if($.browser.msie){
				if(document.documentMode == 8){
					if(e.button === 1){
						result = true;
					}
				}else{
					if(e.button === 0){
						result = true;
					}
				}
			}else if(e.button === 0){
				result = true ;
			}
			return result;
		},
		/**
		 * 获取当前td的鼠标样式
		 * @param $td
		 * @param e
		 * @returns {String}
		 */
		_getCursor: function($td, e){
			var left = $td.offset().left
				,width = $td.width()
				,scope = 5
				,pageX = e.pageX || e.screenX
				,colspan = $td.attr('colspan')
				,result = '';
			if (pageX <= left + width && pageX > left + width - scope
				&& (colspan == undefined || colspan == 1) && $td.attr('field'))
				result = 'e-resize';
			return result;
		},
		/**
		 * 是否独自列宽设置
		 */
		_preventColumnResize: function($td){
			if(!this.setting.columnResizable){
				return false;
			}
			var col = this._column[$td.attr('_cid')];
			return col.resizable;
		},
		/**
		 * 标题列开始拖拽状态
		 * @param e
		 */
		_onStartResizeColumn: function(e){
			var g = this
				,$target = g.$targetTd;
			$target.oriX = $target.position().left + $target.outerWidth() - 1;
			g.$columnResizeProxy.css({
				left: $target.oriX,
				display: 'block'
			});
			$(document).bind("selectstart.grid-column.resizable.api", function(){ return false; });
			$(document).bind('mouseup.grid-column.resizable.api', function(){
				g._onStopResizeColumn();
			});
			$(document).bind('mousemove.grid-column.resizable.api', function(e){
				g._onResizeColumn(e);
			});
		},
		/**
		 * 标题列正在拖拽
		 * @param e
		 */
		_onResizeColumn: function(e){
			var pageX = e.pageX || e.screenX
				,left = pageX - this.$tableHeader.offset().left;
			this.$columnResizeProxy.css({
				left: left,
				cursor: 'e-resize'
			});
			this.$targetTd.diffX = parseInt(this.$columnResizeProxy.css('left')) - this.$targetTd.oriX;
		},
		/**
		 * 标题列结束拖拽状态
		 * @param e
		 */
		_onStopResizeColumn: function(){
			this._applyResizeColumn();
			this.$columnResizeProxy.hide();
			$(document).unbind("selectstart.grid-column.resizable.api");
			$(document).unbind('mousemove.grid-column.resizable.api');
			$(document).unbind('mouseup.grid-column.resizable.api');
		},
		/**
		 * 应用列宽的设置
		 */
		_applyResizeColumn: function(){
			this.$targetTd.diffX = parseInt(this.$targetTd.diffX);
			if(isNaN(this.$targetTd.diffX)){
				this.$targetTd.diffX = 0;
			}
			var oriWidth = this.$targetTd.outerWidth()
				,newWidth = parseInt(oriWidth + this.$targetTd.diffX);
			if(newWidth < minWidth){
				this.$targetTd.diffX = minWidth - oriWidth;
			}
			this._setColumnWidth(this.$targetTd, this.$targetTd.diffX);
			this._fullAfterResizeColumn();
		},
		/**
		 * 拉伸最后一列的宽度以填充空白
		 */
		_fullAfterResizeColumn: function(){
			var firstFill = this._fullFreeWidth();
			if(firstFill){
				return;
			}
			var $lastTd = this._getLast$Td()
				,$targetTd = this.$targetTd;
			if($targetTd.attr('_cid') == $lastTd.attr('_cid')){
				return;
			}
			if($targetTd.diffX < 0){
				return;
			}
			this._shinkFreeWidth();
		},
		/**
		 * 收缩被拉伸的列以去除滚动
		 */
		_shinkFreeWidth: function(){
			if(this.setting.fitColumns != 'E' && this.setting.fitColumns != 'ES'){
				return ;
			}
			var coverWidth = this.$tableHeaderMain.find('>div>table').width() - this.$tableHeaderMain.width();
			if(coverWidth <= 0){
				return;
			}
			var cols = this.columns;
			for(var i = cols.length - 1; i >= 0; i--){
				var col = cols[i];
				if(col.hidden){
					continue;
				}
				var $td = this.$tableHeader.find('td[_cid="' + col._cid + '"]')
					,freeWidth = $td.data('freeWidth');
				if(freeWidth == undefined){
					continue;
				}
				if(freeWidth > coverWidth){
					$td.data('freeWidth', freeWidth - coverWidth);
					this._setColumnWidth($td, -coverWidth);
					return;
				}else{
					coverWidth = coverWidth - freeWidth;
					$td.removeData('freeWidth');
					this._setColumnWidth($td, -freeWidth);
				}
			}
		},
		/**
		 * 最后一列填充空白
		 */
		_fullFreeWidth: function(){
			if(this.setting.fitColumns != 'E' && this.setting.fitColumns != 'ES'){
				return ;
			}
			var freeWidth = this.$tableHeaderMain.width() - this.$tableHeaderMain.find('>div>table').width();
			if(freeWidth > 0){
				var $lastTd = this._getLast$Td();
				this._setColumnWidth($lastTd, freeWidth);
				var lastWidth = $lastTd.data('freeWidth');
				if(lastWidth != undefined){
					freeWidth = freeWidth + lastWidth
				}
				$lastTd.data('freeWidth', freeWidth);
				return true;
			}
		},
		/**
		 * 获取最后一个可视列
		 */
		_getLast$Td: function(){
			var lastVisible = this.columns.length - 1;
			while(this.columns[lastVisible].hidden
					&& lastVisible >= 0){
				lastVisible--;
			}
			var lastCol = this.columns[lastVisible]
				,lastTdCid = lastCol._cid;
			return this.$tableHeader.find('td[_cid="' + lastTdCid + '"]');
		},
		/**
		 * @param {Object} info 列信息
		 * @param {String} info.field 列名
		 * @param {Number} info.width 列宽
		 * @example $('#demo').grid('setColumnWidth', {field:'f1',width: 150});
		 * @memberof grid-class
		 * @instance
		 */
		setColumnWidth: function(info){
			var $td = this.$tableHeader.find('td[field="' + info.field + '"]')
				,oriWidth = $td.outerWidth()
				,diff = info.width - oriWidth;
			this._setColumnWidth($td, diff);
		},
		/**
		 * 设置标题列的宽度
		 * @param $td 标题列Td
		 * @param diffWidth 变更的宽度值
		 */
		_setColumnWidth: function($td, diffWidth){
			var cid = $td.attr('_cid');
			this._setFooterBorderTop();
			var tdWidth = $td.outerWidth() - cellBorderWidth + diffWidth;
			this.$table.find('td[_cid=' + cid + ']>div:not(.app-wrapper)').css('width', tdWidth);
			this._column[cid].width = tdWidth;
			this._setColumnPercent();
			this._refitColumnWidth();
		},
		/**
		 * 隐藏列
		 * @param {String} field 列名
		 * @example $('#demo').grid('hideColumn', 'f1');
		 * @memberof grid-class
		 * @instance
		 */
		hideColumn: function(field){
			var column = this._fieldColumns[field]
				,that = this;
			if(column.lockTree){
				return;
			}
			if(!this._fieldColumns[field].hidden){
				var $tds = this.$table.find('td[field="' + field + '"]:not(.grid-cell-merger)');
				$tds.hide();
				column.hidden = true;
				setParent(column);
				this._setViewSize($tds, function($headerView, tdWidth){
					if($headerView.hasClass('grid-header-left')){
						this.setting.viewMainWidth += tdWidth;
						this.setting.viewLeftWidth -= tdWidth;
					}else if($headerView.hasClass('grid-header-right')){
						this.setting.viewMainWidth += tdWidth;
						this.setting.viewRightWidth -= tdWidth;
					}
				});
				this._refitColumnWidth();
				this._fullFreeWidth();
			}
			function setParent(column){
				if(column.parentColumn){
					var $parent = that.$tableHeader.find('td[_cid="' + column.parentColumn._cid + '"]');
					if($parent.length > 0){
						var colspan = $parent.attr('colspan');
						if(colspan > 1){
							$parent.attr('colspan', colspan-1);
						}else{
							$parent.css('display', 'none');
						}
					}
					setParent(column.parentColumn);
				}
			}
		},
		/**
		 * 列是否可见
		 * @param {String} field 列名
		 * @example $('#demo').grid('columnIsVisible', 'f1');
		 * @memberof grid-class
		 * @instance
		 */
		columnIsVisible: function(field){
			var $td = this.$tableHeader.find('td[field="' + field + '"]')
				,display = $td.css('display');
			if(display != 'none'){
				return true;
			}else{
				return false;
			}
		},
		/**
		 * 如果视图可见则，不设置逻辑宽度
		 * @param $tds
		 */
		_setViewSize: function($tds, callback){
			if(this.$element.is(':visible')){
				return;
			}
			var td = $tds[0];
			if(!td){
				return;
			}
			var $td = $(td)
				,$headerView = $td.closest('div').parent()
				,tdWidth = parseInt($td.css('width'));
			callback.call(this, $headerView, tdWidth);
		},
		/**
		 * 显示列
		 * @param {String} field 列名
		 * @example $('#demo').grid('showColumn', 'f1');
		 * @memberof grid-class
		 * @instance
		 */
		showColumn: function(field){
			var column = this._fieldColumns[field]
				,that = this;
			if(column.lockTree){
				return;
			}
			if(column.hidden){
				column.hidden = false;
				initHiddenColumn.call(this, column);
				var $tds = this.$table.find('td[field="' + field + '"]:not(.grid-cell-merger)');
				$tds.show();
				setParent(column);
				this._setViewSize($tds, function($headerView, tdWidth){
					if($headerView.hasClass('grid-header-left')){
						this.setting.viewMainWidth -= tdWidth;
						this.setting.viewLeftWidth += tdWidth;
					}else if($headerView.hasClass('grid-header-right')){
						this.setting.viewMainWidth -= tdWidth;
						this.setting.viewRightWidth += tdWidth;
					}
				});
				this._refitColumnWidth();
				this._shinkFreeWidth();
			}
			function initHiddenColumn(column){
				if(this.$tableBody.find('td[_cid=' + column._cid + ']').length > 0){
					return;
				}
				var prevTdid = null
					,prevColumn = column.__prev;
				while(prevColumn){
					if(this.$tableBody.find('td[_cid=' + prevColumn._cid + ']').length > 0){
						break;
					}
					prevColumn = prevColumn.__prev;
				}
				var rows = this.getRows();
				if(rows.length > 0){
					initTableBody.call(this, rows, column, prevColumn);
				}
				this._setColumnPercent();
				function initTableBody(rows, column, prevColumn){
					var $viewPos = this.$tableBodyMain;
					if(column.viewPos == 'left'){
						$viewPos = this.$tableBodyLeft;
					}else if(column.viewPos == 'right'){
						$viewPos = this.$tableBodyRight;
					}
					for(var i = 0; i < rows.length; i++){
						var tdHtml = this._initCellHtml(column, rows[i]);
						if(prevColumn){
							$viewPos.find('tr:eq('+i+') td[_cid='+prevColumn._cid+']').after(tdHtml);
						}else{
							$viewPos.find('tr:eq('+i+')').prepend(tdHtml)
						}
					}
				}
			}
			function setParent(column){
				if(column.parentColumn){
					var $parent = that.$tableHeader.find('td[_cid="' + column.parentColumn._cid + '"]');
					if($parent.length > 0){
						var display = $parent.css('display');
						if(display == 'none'){
							$parent.css('display', 'table-cell');
						}else{
							var colspan = $parent.attr('colspan');
							if(!colspan){
								colspan = 1;
							}
							$parent.attr('colspan',  parseInt(colspan)+1);
						}
					}
					setParent(column.parentColumn);
				}
			}
		},
		/**
		 * 重新调整网格列的自适应宽度
		 */
		_refitColumnWidth: function(){
			this._resetViewWidth();
			this.resize();
		},
		/**
		 * 重新适应列大小
		 * <PRE>
		 * 如果网格没有设置填充和自适应列 则不自适应
		 * 如果该网格不可见，则根据逻辑宽度进行设置
		 * </PRE>
		 * @example $('#demo').grid('resize');
		 * @memberof grid-class
		 * @instance
		 */
		resize: function(){
			var that = this;
			if(this.hasTriggerResize){
				if(this.resizeTimeout){
					clearTimeout(this.resizeTimeout);
				}			
				this.resizeTimeout = setTimeout(function(){
					that.resize();
					delete that.resizeTimeout;
				}, 120);
				return;
			}
			this.hasTriggerResize = true;
			setTimeout(function(){
				delete that.hasTriggerResize;
			}, 110);
			if(this.setting.fitColumns == 'E' || this.setting.fitColumns == 'ES'){
				var cols = this.columns;
				if(cols == undefined){
					return;
				}
				this._fitMainViewWidth();
				for(var i = 0; i< cols.length; i++){
					var col = cols[i];
					if(col.field && !col.hidden){
						this.$table.find('td[_cid=' + cols[i]._cid + ']>div:not(.app-wrapper)').css('width', col.width);
					}
				}
			}
			this._resetViewWidth();
			this._fixHeight();
			this._footerFollow();
		},
		/**
		 * 设置视图的宽度
		 * 如果视图不可见，则根据逻辑宽度进行设置
		 */
		_resetViewWidth: function(){
			var leftViewWidth = 0
				,mainViewWidth = 0
				,rightViewWidth = 0;
			if(this.$element.is(':visible')){
				leftViewWidth = this.$tableHeaderLeft.find('>div>table').outerWidth();
				mainViewWidth = this.$tableHeaderMain.find('>div>table').outerWidth() - 2;
				rightViewWidth = this.$tableHeaderRight.find('>div>table').outerWidth();
			}else{
				leftViewWidth =  this.setting.viewLeftWidth;
				mainViewWidth = this.setting.viewLeftWidth - 2;
				rightViewWidth =  this.setting.viewRightWidth;
			}
			var css = {};
			css['margin-left'] = leftViewWidth;
			css['margin-right'] = rightViewWidth;
			if(this._hasXProxyScroll()){
				this.$xProxyScroll.css(css);
				this.$xProxyScroll.find('>div').css('width', mainViewWidth);
			}
			this._setFooterBorderTop();
			this._footerFollow();
		},
		/**
		 * 设置网格脚的上边框
		 */
		_setFooterBorderTop: function(){
			if(this._hasXProxyScroll()){
				this.$tableFooter.addClass('splitBorder');
			}else{
				this.$tableFooter.removeClass('splitBorder');
			}
		},
		/**
		 * 追加一行数据到第一行，并标记该行为新增的样式
		 * @param {Object} [rowData] 单行数据对象
		 * @example $('#demo').grid('prependRow');
		 * @example $('#demo').grid('prependRow',{col1:1,col2:1,col3:1});
		 * @memberof grid-class
		 * @instance
		 */
		prependRow: function(rowData){
			if(this.setting.editable == false){
				return;
			}
			if(rowData == undefined){
				rowData = {};
			}
			if($.isArray(rowData)){
				return;
			}
			this._prependOneRowToBody(rowData);
			this._reOrderNumber();
			this.locateCurrent();
			this._toggleMessage();
			this._pagerAddRow();
		},
		/**
		 * 追加一行数据到第一行，并选中该行
		 * @param {Object} [rowData] 单行数据对象
		 * @example $('#demo').grid('prependRowThenSelect');
		 * @example $('#demo').grid('prependRowThenSelect',{col1:1,col2:1,col3:1});
		 * @memberof grid-class
		 * @instance
		 */
		prependRowThenSelect: function(rowData){
			this.prependRow(rowData);
			this.selectRow(0);
		},
		/**
		 * 追加一行数据到网格尾，并标记该行为新增的样式
		 * @param {Object} [rowData] 单行数据对象
		 * @param {Integer} [rowIndex] 要插入的行号
		 * @example $('#demo').grid('appendRow');
		 * @example $('#demo').grid('appendRow',{col1:1,col2:1,col3:1});
		 * @memberof grid-class
		 * @instance
		 */
		appendRow: function(rowData, rowIndex){
			if(this.setting.editable == false){
				return;
			}
			if(rowData == undefined){
				rowData = {};
			}
			if($.isArray(rowData)){
				return;
			}
			this._appendOneRowToBody(rowData, rowIndex);
			this._reOrderNumber();
			this.locateCurrent();
			this._toggleMessage();
			this._pagerAddRow();
		},
		/**
		 * 追加一行数据到网格尾，并选中该行
		 * @param {Object} [rowData] 单行数据对象
		 * @example $('#demo').grid('appendRowThenSelect');
		 * @example $('#demo').grid('appendRowThenSelect',{col1:1,col2:1,col3:1});
		 * @memberof grid-class
		 * @instance
		 */
		appendRowThenSelect: function(rowData){
			this.appendRow(rowData);
			var lastRowIndex = this.$tableBodyMain.find('>div>table>tbody>tr').length;
			this.selectRow(lastRowIndex-1);
		},
		/**
		 * 隐藏显示信息
		 */
		_toggleMessage: function(){
			if(this.$tableBodyMain.find('tr').length > 0){
				this._hideMessage();
			}else{
				this._showMessage(empty);
			}
		},
		_prependOneRowToBody: function(rowData){
			var insertedCls = currentRowCls;
			this._clearCurrent();
			if(this.setting.markChange){
				insertedCls += ' inserted';
			}
			var trId = App.uuid()
				,idAttr = rowData[this.setting.idField] ? '_v="' + rowData[this.setting.idField] + '"' : ''
				,trHead = '<tr id="' + trId + '" ' + idAttr + ' class="data-row ' + (this._rownumbers%2 == 0 ? 'odd' : 'even') + ' ' + insertedCls + '">'
				,trEnd = '</tr>'
				,leftHtml = trHead + this._initRowTrInnerHtml(this.frozenColumns, rowData) + trEnd
				,mainHtml = trHead + this._initRowTrInnerHtml(this.columns, rowData) + trEnd
				,rightHtml = trHead + this._initRowTrInnerHtml(this.frozenColumnsRight, rowData) + trEnd;
			rowData.__rowId = trId;
			this.$tableBodyLeft.find('>div>table>tbody').prepend(leftHtml);
			this.$tableBodyRight.find('>div>table>tbody').prepend(rightHtml);
			this.$tableBodyMain.find('>div>table>tbody').prepend(mainHtml);
			this._insertRow(trId, rowData);
			this._rownumbers++;
			this._footerFollow();
			this._fixXProxyScroll();
			this._fixYProxyScrollHeight();
		},
		/**
		 * 输出一行数据到网格体
		 */
		_appendOneRowToBody: function(rowData, rowIndex){
			var insertedCls = currentRowCls;
			this._clearCurrent();
			if(this.setting.markChange){
				insertedCls += ' inserted';
			}
			var trId = App.uuid()
				,idAttr = rowData[this.setting.idField] ? '_v="' + rowData[this.setting.idField] + '"' : ''
				,trHead = '<tr id="' + trId + '" ' + idAttr + ' class="data-row ' + (this._rownumbers%2 == 0 ? 'odd' : 'even') + ' ' + insertedCls + '">'
				,trEnd = '</tr>'
				,leftHtml = trHead + this._initRowTrInnerHtml(this.frozenColumns, rowData) + trEnd
				,mainHtml = trHead + this._initRowTrInnerHtml(this.columns, rowData) + trEnd
				,rightHtml = trHead + this._initRowTrInnerHtml(this.frozenColumnsRight, rowData) + trEnd;
			rowData.__rowId = trId;
			if(!isNaN(rowIndex)){
				this.$tableBodyLeft.find('>div>table tr:eq(' + rowIndex + ')').after(leftHtml);
				this.$tableBodyRight.find('>div>table tr:eq(' + rowIndex + ')').after(rightHtml);
				this.$tableBodyMain.find('>div>table tr:eq(' + rowIndex + ')').after(mainHtml);
			}else{
				this.$tableBodyLeft.find('>div>table>tbody').append(leftHtml);
				this.$tableBodyRight.find('>div>table>tbody').append(rightHtml);
				this.$tableBodyMain.find('>div>table>tbody').append(mainHtml);
			}
			this._insertRow(trId, rowData);
			this._rownumbers++;
			this._footerFollow();
			this._fixXProxyScroll();
			this._fixYProxyScrollHeight();
		},
		/**
		 * 按顺序重新输出当前的序号
		 */
		_reOrderNumber: function(){
			if(this.$tableHeaderLeft.find('td[field=_rownumbers]').length == 0){
				return;
			}
			var $tdDivs = this.$tableBodyLeft.find('tr:visible>td[field=_rownumbers]>div');
			var starNum = this._getStarRowNumber();
			this._rownumbers = starNum + $tdDivs.length;
			$tdDivs.each(function(){
				$(this).text(starNum++);
			});
		},
		/**
		 * 显示自定义面板
		 * @example $('#grid').grid('showCustom');
		 * @memberof grid-class
		 * @instance
		 */
		showCustom: function(){
			this.$headerCustom.children().show();
			this._fixHeight();
			this._footerFollow();
		},
		/**
		 * 显示自定义面板
		 * @example $('#grid').grid('showCustom');
		 * @memberof grid-class
		 * @instance
		 */
		hideCustom: function(){
			this.$headerCustom.children().hide();
			this._fixHeight();
			this._footerFollow();
		},
		/**
		 * 切换显示自定义面板
		 * @example $('#grid').grid('toggleCustom');
		 * @memberof grid-class
		 * @instance
		 */
		toggleCustom: function(){
			if(this.$headerCustom.children().is(':visible')){
				this.hideCustom();
			}else{
				this.showCustom();
			}
		},
		/**
		 * 更新合计行，忽略公式合计和自定义合计
		 * @param {Object} footer 合计行数据
		 * @example $('#grid').grid('updateFooter', {id:'idVal',......}); 合计行的数据
		 * @memberof grid-class
		 * @instance
		 */
		updateFooter: function(footer){
			if(!footer){
				return;
			}
			if(!$.isArray(footer)){
				footer = [footer];
			}
			this.clearFooter();
			this.appendFooter(footer);
		},
		/**
		 * 绑定顶层容器的_resize事件
		 */
		_bindResize: function(){
			var g = this;
			this.$element.on('_resize.grid.api', function(){
				g.resize();
			});
		},
		/**
		 * 执行网格的的时间间隔器
		 */
		setGridInterval: function(callback, time){
			this.autoReflashTimer = setInterval(callback, time);
			return this.autoReflashTimer;
		},
		/**
		 * 清除网格的的时间间隔器
		 */
		clearGridInterval: function(timer){
			if(!timer){
				timer = this.autoReflashTimer;
			}
			clearInterval(timer);
		},
		/**
		 * 绑定鼠标对自动滚动的事件
		 */
		onMouseEvent: function(){
			if(!this.setting.autoScroll){
				return;
			}
			this.startScroll();
			var that = this;
			this.$tableBody.on('mouseenter', function(){
				that.stopScroll();
			}).on('mouseleave', function(){
				that.startScroll();
			});
		},
		/**
		 * 启动自动滚动数据
		 */
		startScroll: function(){
			if(this._scrollRunning){
				return;
			}
			var that = this
				,$scrollTable = that.$tableBodyMain
				,$leftTable = that.$tableBodyLeft
				,$rightTable = that.$tableBodyRight;
			if(this.setting.autoScroll == 'upward'){
				this.autoScrollTimer = setInterval(function(){
					if(!$scrollTable.is(':visible')){
						return;
					}
					if($scrollTable.scrollTop() + $scrollTable[0].clientHeight >= $scrollTable[0].scrollHeight){
						$scrollTable.scrollTop(0);
						$leftTable.scrollTop(0);
						$rightTable.scrollTop(0);
					}else{
						var mainTop = $scrollTable.scrollTop() + 5;
						$scrollTable.scrollTop(mainTop);
						$leftTable.scrollTop(mainTop);
						$rightTable.scrollTop(mainTop);
					}
				}, 200);
				this._scrollRunning = true;
			}else if(this.setting.autoScroll == 'downward'){
				this.autoScrollTimer = setInterval(function(){
					if(!$scrollTable.is(':visible')){
						return;
					}
					if($scrollTable.scrollTop() <= 0){
						$scrollTable.scrollTop($scrollTable[0].scrollHeight);
						$leftTable.scrollTop($scrollTable[0].scrollHeight);
						$rightTable.scrollTop($scrollTable[0].scrollHeight);
					}else{
						var mainTop = $scrollTable.scrollTop() - 5;
						$scrollTable.scrollTop(mainTop);
						$leftTable.scrollTop(mainTop);
						$rightTable.scrollTop(mainTop);
					}
				}, 200);
				this._scrollRunning = true;
			}
		},
		/**
		 * 关闭自动滚动数据
		 */
		stopScroll: function(){
			if(!this._scrollRunning){
				return;
			}
			clearInterval(this.autoScrollTimer);
			this._scrollRunning = false;
			delete this.autoScrollTimer;
		},
		/**
		 * 获取网格的列信息
		 * @property {Object} [returns] 数据对象
		 * @returns {Object} data 数据对象
		 * @example $('#demo').grid('getColumns');
		 * @memberof grid-class
		 * @instance
		 */
		getColumns: function(){
			var result = {};
			result.left = this.setting.frozenColumns;
			result.center = this.setting.columns;
			result.right = this.setting.frozenColumnsRight;
			return result;
		},
		/**
		 * 获取网格的列信息,以树形的方式展现
		 * @property {Object} [returns] 数据对象
		 * @returns {Object} data 数据对象
		 * @example $('#demo').grid('getColumns');
		 * @memberof grid-class
		 * @instance
		 */
		getColumnTree: function(){
			var result = [];
			jion(result, this.setting.frozenColumns);
			jion(result, this.setting.columns);
			jion(result, this.setting.frozenColumnsRight);
			return result;
			function jion(target, multiAttr){
				var level0 = multiAttr[0];
				if($.isArray(level0)){
					for(var i = 0 ; i < level0.length; i++){
						target.push(level0[i]);
					}
				}
			}
		},
		/**
		 * 销毁方法
		 */
		destroy: function(){
			this.clearGridInterval(this.autoReflashTimer);
			this.stopScroll();
			var editors = this.editor;
			for(var editorField in editors){
				if(editors[editorField].editor){
					editors[editorField].editor.destroy();
				}
			}
			if(this.$headerContextMenu){
				this.$headerContextMenu.remove();
				this.$headerContextMsg.remove();
			}
			this.$t.removeData('grid');
			this.$element.remove();
		}
	});

	$.fn.grid = function (option) {
		var methodReturn = undefined
			,args = arguments;
		this.each(function () {
			var $this = $(this)
				,component = $this.data('grid');
			if(typeof option === 'string'){
				try{
					var methodArgs = Array.prototype.slice.call(args, 1);
					methodReturn = App.componentMethodApply(component, option, methodArgs);
				}catch(e){
					var id = $this.attr('id');
					if(!id){
						id = $this[0].outerHTML;
					}
					throw new Error('组件grid[' + id + ']调用' + option +'方法:' + e);
				}
			}else{
				if(!component){
					component = new Grid(this, option);
					$this.data('grid', component);
				}else{
					var id = $this.attr('id');
					if(!id){
						id = $this[0].outerHTML;
					}
					throw new Error('组件grid[' + id + ']无法重复初始化');
				}
			}
		});
		return methodReturn;
	};
	/**
	 * 表达式的函数支持
	 */
	window.formulaHelper = {
		/**
		 * 获取数值
		 */
		getNum: function(obj, field){
			var val = obj[field];
			if(val == undefined){
				val = 0;
			}
			return val;
		},
		/**
		 * 获取字符串
		 */
		getStr: function(obj, field){
			var val = obj[field];
			if(val == undefined){
				val = '';
			}
			return val;
		}
	};
	function atOnceMoment(e, sign, context){
		var ts = context._ts[sign];
		context._ts[sign] = e.timeStamp;
		if(ts){
			return e.timeStamp - ts < Options.appDefaults.Grid.dblOnce;
		}else{
			return false;
		}
	}
	function escapeHtml(str){
		return $('<div>' + str + '</div>').text();
	}
	return Grid;
	/**
	 * 更新列标题
	 */
	function updateColumnTitle(){
		var cols = this._titleVarColumns
			,params = this.getParameter();
		if(!cols || !params){
			return;
		}
		for(var _cid in cols){
			var col = cols[_cid]
				,title = resolveTitleVar(col.titleVar, params);
			if(title){
				col.title = title;
			}else{
				col.title = col.oriTitle;
			}
			this.$tableHeader.find('td[_cid=' + col._cid + ']>div:first').text(col.title);;
		}
	}
	/**
	 * 解析变量表达式
	 */
	function resolveTitleVar(exp, params){
		var result = ''
			,expReg = /\{([\w-]+)\}/g; 
		if(expReg.test(exp)){
			result = exp.replace(expReg, function(m, name){
				var val = params[name];
				if(val !== undefined ){
					val = params[name];
				}else{
					val = '{' + name + '}';
				}
				return val;
			});
			if(expReg.test(result)){
				result = '';
			}else{
				try{
					result = eval(result);
				}catch(e){
				}
			}
		}else{
			result = params[exp];
		}
		return result;
	}
	
	function setDataRowHeight(){
		if(this._rowHeight){
			return;
		}
		if(this.setting.rownumbers == 'normal' || this.setting.rownumbers == 'repeat'){
			this._rowHeight = this.$tableBodyLeft.find('tr:eq(0)').outerHeight();
		}else if(this.setting.mergeColumns && this.setting.mergeColumns.length > 0){
			var $tempTr = $('<tr><td><div></div></td></tr>');
			this.$tableBodyMain.find('table').prepend($tempTr);
			this._rowHeight = $tempTr.outerHeight();
			$tempTr.remove();
		}else{
			this._rowHeight = this.$tableBodyMain.find('tr:eq(0)').outerHeight();
		}
		if(!!!(window.ActiveXObject || 'ActiveXObject' in window)){
			this._rowHeight += 1;
		}
	}
	function headBtnTdClick(e){
		var $btns = $(this).find('a');
		if($btns.length == 1){
			$btns.trigger('click');
		}
	}
});