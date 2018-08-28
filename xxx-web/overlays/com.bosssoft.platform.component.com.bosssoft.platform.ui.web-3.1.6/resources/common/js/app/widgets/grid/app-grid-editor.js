define(['app/core/app-class', 'app/core/app-jquery', 'app/core/app-options', 'app/core/app-core'], function(Class, $, Options, App) {
	
	'use strict';
	
	/**
	 * 网格编辑的扩展方法
	 */
	var GridEditor = Class.create({
		/**
		 * 初始行编辑器
		 */
		_initEditor: function(){
			var s = this.setting
				,requestFiles = []
				,editorMap = this.editor
				,grid = this;
			this._gatherViewEditor(s.frozenColumns);
			this._gatherViewEditor(s.frozenColumnsRight);
			this._gatherViewEditor(s.columns);
			
			for(var editorField in editorMap){
				var fileName = 'app/widgets/form/app-' + editorMap[editorField].type;
				if($.inArray(fileName, requestFiles) == -1){
					requestFiles.push(fileName);
				}
			}
			require(requestFiles,function(){
				for(var editorField in editorMap){
					var editorInfo = editorMap[editorField];
					editorInfo.$editor[editorInfo.type](editorInfo.options);
					editorInfo.editor = editorInfo.$editor.data(editorInfo.type);
				}
				grid._linkEditor();
			});
			this._registEditorEvent();
		},
		/**
		 * 收集编辑器组件的信息
		 * @param viewColumns 视图列
		 */
		_gatherViewEditor: function(viewColumns){
			for ( var i = 0; i < viewColumns.length; i++) {
				for(var j = 0; j < viewColumns[i].length; j++){
					var col = viewColumns[i][j]
						,editor = col.editor;
					if(editor){
						this._initEditorOptions(editor, col);
						this.$rowEditor.append(editor.$editor);
						this.editor[col.field] = editor;					
						this.setting.hasEditor = true;
					}
				}
			}
		},
		/**
		 * 生成编辑器的默认参数
		 */
		_initEditorOptions: function(editor, col){
			editor.$editor = $('<input/>');
			editor.column = col;
			if(!editor.type){ editor.type = 'textbox'; }
			if(!editor.options){ editor.options = {}; }
			if(editor.type == 'combobox' && !editor.options.panelwidth){
				editor.options.panelwidth = '100%';
			}
			var grid = this;
			editor.options.editorField = col.field;
			editor.options.onFocus = function(){
				var field = this.setting.editorField;
				var $td = grid.$tableHeaderMain.find('[field=' + field + ']');
				if($td.length == 0){
					return;
				}
				var containerWidth = grid.$tableHeaderMain.outerWidth()  + 3
					,scrollLeft = grid.$tableHeaderMain.scrollLeft()
					,leftBorder = $td.offset().left - grid.$tableHeaderMain.offset().left + scrollLeft
					,rightBorder = leftBorder +  $td.outerWidth();
				if(leftBorder <= scrollLeft){
					grid.$xProxyScroll.scrollLeft(leftBorder);
					return;
				}
				if(rightBorder >= scrollLeft + containerWidth){
					grid.$xProxyScroll.scrollLeft(rightBorder - containerWidth);
				}
			};
			if(this.setting.editorDelBtn){
				editor.options.onMouseOver = function(){
					if(this.$proxyDelBtn == undefined){
						var proxy = this;
						this.$proxyDelBtn = $('<span class="proxy-delete-btn"><i></i></span>');
						this.$proxyDelBtn.on('mouseup', function(e){
							proxy.clearValue();
							e.stopPropagation();
						});
						this.$proxyDelBtn.on('mouseover', function(e){
							$(this).show();
						});
						this.$proxyDelBtn.on('mouseout', function(e){
							$(this).hide();
						});
						this.$proxyDelBtn.appendTo(grid.$absoluteComp);
					}
					if(this.getValue() || this.getText()){
						var pos = this.$element.position();
						pos.left += this.$element.outerWidth();
						this.$proxyDelBtn.css(pos);
						this.$proxyDelBtn.show();
					}
				};
				editor.options.onMouseOut =function(){
					if(this.$proxyDelBtn){
						this.$proxyDelBtn.hide();
					}
				};
			}
		},
		/**
		 * 将网格的编辑器按双向链表连接起来，并构成环状
		 */
		_linkEditor: function(){
			if(!this.setting.hasEditor){
				return;
			}
			var leftEdts = this._linkEditorForView(this.frozenColumns)
				,mainEdts = this._linkEditorForView(this.columns)
				,rightEdts = this._linkEditorForView(this.frozenColumnsRight);
			
			if(!leftEdts && !mainEdts && !rightEdts){
				return;
			}
			if(leftEdts && !mainEdts && !rightEdts){
				linkOne(leftEdts);
				return;
			}else if(mainEdts && !leftEdts && !rightEdts){
				linkOne(mainEdts);
				return;
			}else if(rightEdts && !leftEdts && !mainEdts){
				linkOne(rightEdts);
				return;
			}
			if(leftEdts && mainEdts){
				leftEdts.lastEditor._next = mainEdts.firstEditor;
				mainEdts.firstEditor._prev = leftEdts.lastEditor;
			}
			if(mainEdts && rightEdts){
				mainEdts.lastEditor._next = rightEdts.firstEditor;
				rightEdts.firstEditor._prev = mainEdts.lastEditor;
			}
			if(leftEdts && rightEdts){
				leftEdts.firstEditor._next = rightEdts.lastEditor;
				rightEdts.lastEditor._prev = leftEdts.firstEditor;
			}else if(leftEdts && mainEdts){
				leftEdts.firstEditor._prev = mainEdts.lastEditor;
				mainEdts.lastEditor._next = leftEdts.firstEditor;
			}else if(mainEdts && rightEdts){
				mainEdts.firstEditor._prev = rightEdts.lastEditor;
				rightEdts.lastEditor._next = mainEdts.firstEditor;
			}
			function linkOne(edts){
				edts.lastEditor._next = edts.firstEditor;
				edts.firstEditor._prev = edts.lastEditor;
			}
		},
		/**
		 * 将视图内的编辑器按双向链表连接起来，并返回视图内第一个和最后一个编辑器
		 */
		_linkEditorForView: function(cols){
			var firstEditor = null
				,lastEditor = null;
			for(var i=0; i< cols.length; i++){
				var currEditor = cols[i].editor; 
				if(currEditor){
					var nextEditor = this._getNextEditor(cols, i+1);
					if(nextEditor){
						currEditor._next = nextEditor;
						nextEditor._prev = currEditor; 
					}
					if(firstEditor == null){
						firstEditor = currEditor;
					}
					lastEditor = currEditor;
				}
			}
			if(firstEditor){
				return {firstEditor:firstEditor, lastEditor:lastEditor};
			}else{
				return null;
			}
		},
		/**
		 * 获取下一个编辑器
		 * @param cols
		 * @param index
		 */
		_getNextEditor: function(cols, index){
			var nextEditor = null;
			for(var i = index; i < cols.length; i++){
				nextEditor = cols[i].editor; 
				if(nextEditor){
					break;
				}
			}
			return nextEditor;
		},
		/**
		 * 注册编辑器相关事件
		 */
		_registEditorEvent: function(){
			if(this.setting._hasOperator){
				this.$tableHeader.on('click.grid.operator.api', '.rowBtn', $.proxy(this._onRowOperatorBtnClick, this));
				this.$tableBody.on('click.grid.operator.api', '.rowBtn', $.proxy(this._onRowOperatorBtnClick, this));
			}
			if(this.setting.hasEditor){
				this.$tableBody.on('click.grid-edit.api', 'td', $.proxy(this._onAutoBeginEdit, this));
				this.$element.on('mouseup.grid-edit.api', $.proxy(this._onAutoEndEdit, this));
				this.$tableBody.on('keydown.grid-edit.api', 'td', $.proxy(this._onTdKeyDown, this));
			}
		},
		/**
		 * 点击数据行开始编辑
		 */
		_onAutoBeginEdit: function(e){
			if(e.target.tagName == 'A'){
				return;
			}
			var	$td = $(e.currentTarget)
				,rowIndex = $td.parent().index();
			if(this.setting.autoBeginEdit){
				this.beginEdit(rowIndex);
				var field = $td.attr('field')
					,editorInfo = this.editor[field];
				if(editorInfo){
					editorInfo.editor.focus();		
				}
			}
		},
		/**
		 * 点击非数据行结束编辑
		 */
		_onAutoEndEdit: function(e){
			if($(e.target).closest('.grid-body-content').length > 0
					|| this.$xProxyScroll.is(e.target)
					|| this.$yProxyScroll.is(e.target)){
				return;
			}
			if(this.setting.autoEndEdit){
				if(this._currentEditRowId){
					var rowIndex = this._convertRowIdToRowIndex(this._currentEditRowId);
					this.endEdit(rowIndex);
				}
			}
		},
		/**
		 * 单元格接受按键按下的事件 控制编辑器的焦点切换
		 */
		_onTdKeyDown: function(e){
			var s = this.setting;
			if(App.containKeyCode(e, s.keyLeftEditor)){
				this._keyLeftEditor(e);
			}else if(App.containKeyCode(e, s.keyRightEditor)){
				this._keyRightEditor(e);
			}else if(App.containKeyCode(e, s.keyUpEditor)){
				this._keyUpEditor(e);
			}else if(App.containKeyCode(e, s.keyDownEditor)){
				this._keyDownEditor(e);
			}
			if(s.keySpecEnabled){
				if(App.containKeyCode(e, s.keyPrevEditor)){
					this._keyPrevEditor(e);
				}else if(App.containKeyCode(e, s.keyNextEditor)){
					this._keyNextEditor(e);
				}else if(App.containKeyCode(e, s.keyAppendRow)){
					this._keyAppendRow(e);
				}else if(App.containKeyCode(e, s.keyDeleteRow)){
					this._keyDeleteRow(e);
				}
			}
		},
		/**
		 * 让编辑器失去焦点
		 */
		_editorBlur: function(activeEditor, handle){
			activeEditor.editor.blur(handle);
		},
		/**
		 * 让编辑器获取焦点
		 */
		_editorFocus: function(activeEditor){
			var that = this;
			setTimeout(function(){
				if(!activeEditor.editor.isActive()){
					activeEditor.editor.focus();
				}
			}, 0);
		},
		/**
		 * 聚焦左边一个编辑器
		 */
		_keyLeftEditor: function(e){
			var editor = this.editor[$(e.currentTarget).attr('field')]
				,grid = this;
			this._editorBlur(editor, function(){
				var activeEditor = editor._prev;
				while(true){
					if(!activeEditor.editor.isReadonly() && activeEditor.editor.isEnabled()
						&& grid.columnIsVisible(activeEditor.column.field)){
						break;
					}
					activeEditor = activeEditor._prev;
				}
				grid._editorFocus(activeEditor);
			});
			e.preventDefault();
		},
		/**
		 * 聚焦右边一个编辑器
		 */
		_keyRightEditor: function(e){
			var editor = this.editor[$(e.currentTarget).attr('field')]
				,grid = this;
			this._editorBlur(editor, function(){
				var activeEditor = editor._next;
				while(true){
					if(!activeEditor.editor.isReadonly() && activeEditor.editor.isEnabled()
							&& grid.columnIsVisible(activeEditor.column.field)){
						break;
					}
					activeEditor = activeEditor._next;
				}
				grid._editorFocus(activeEditor);
			});
			e.preventDefault();
		},
		/**
		 * 聚焦上边一个编辑器
		 */
		_keyUpEditor: function(e){
			var editor = this.editor[$(e.currentTarget).attr('field')]
				,rowIndex = this.getCurrentEditRowIndex()
				,prevRowIndex = this._getPrevVisibleRowIndex(rowIndex)
				,grid = this;
			this._editorBlur(editor, function(){
				grid.beginEdit(prevRowIndex);
				grid.locateRow(grid._currentEditRowId);
				grid._editorFocus(editor);
			});
			e.preventDefault();
		},
		/**
		 * 聚焦下边一个编辑器
		 */
		_keyDownEditor: function(e){
			var editor = this.editor[$(e.currentTarget).attr('field')]
				,rowIndex = this.getCurrentEditRowIndex()
				,nextRowIndex = this._getNextVisibleRowIndex(rowIndex)
				,grid = this;
			this._editorBlur(editor, function(){
				grid.beginEdit(nextRowIndex);
				grid.locateRow(grid._currentEditRowId);
				grid._editorFocus(editor);
			});
			e.preventDefault();
		},
		/**
		 * 聚焦下一个编辑器
		 */
		_keyNextEditor: function(e){
			var editor = this.editor[$(e.currentTarget).attr('field')]
				,grid = this;
			this._editorBlur(editor, function(){
				if(grid._isLastEditor(editor)){
					var rowIndex = grid.getCurrentEditRowIndex()
					,totalRowLen = grid.$tableBodyMain.find('tr').length;
					if(rowIndex == totalRowLen - 1){
						grid.appendRow();
						grid.beginEdit(totalRowLen);
					}else{
						var nextRowIndex = grid._getNextVisibleRowIndex(rowIndex);
						grid.beginEdit(nextRowIndex);
					}
				}
				grid._keyRightEditor(e);
			});
		},
		/**
		 * 聚焦上一个编辑器
		 */
		_keyPrevEditor: function(e){
			var editor = this.editor[$(e.currentTarget).attr('field')]
				,grid = this;
			this._editorBlur(editor, function(){
				if(grid._isFirstEditor(editor)){
					var rowIndex = grid.getCurrentEditRowIndex()
						,prevRowIndex = grid._getPrevVisibleRowIndex(rowIndex);
					grid.beginEdit(prevRowIndex);
				}
				grid._keyLeftEditor(e);
			});
		},
		/**
		 * 在末尾追加一行并进入编辑状态
		 */
		_keyAppendRow: function(e){
			var editor = this.editor[$(e.currentTarget).attr('field')]
				,grid = this;
			this._editorBlur(editor, function(){
				var totalRowLen = grid.$tableBodyMain.find('tr').length;
				grid.appendRow();
				grid.beginEdit(totalRowLen);
				grid._editorFocus(editor);
			});
			e.preventDefault();
		},
		/**
		 * 删除当前编辑的行
		 */
		_keyDeleteRow: function(e){
			var editor = this.editor[$(e.currentTarget).attr('field')]
				,rowIndex = this.getCurrentEditRowIndex()
				,nextRowIndex = -1
				,grid = this;
			this._editorBlur(editor, function(){
				if(grid.setting.markChange){
					nextRowIndex = grid._getNextVisibleRowIndex(rowIndex);
				}else{
					if(grid._isLastEditorRow(rowIndex)){
						nextRowIndex = grid._getPrevVisibleRowIndex(rowIndex);
					}else{
						nextRowIndex = grid._getNextVisibleRowIndex(rowIndex);
					}
				}
				grid.beginEdit(nextRowIndex);
				grid.deleteRow(rowIndex);
				grid._editorFocus(editor);
			});
			e.preventDefault();
		},
		/**
		 * 从当前行向下按顺序获取一个可视行，
		 * 	当到结尾还没取到则从第一行开始向下搜索可视行，
		 * 如果没有取到则返回本行
		 */
		_getNextVisibleRowIndex: function(rowIndex){
			var result = rowIndex + 1
				,lenTr = this.$tableBodyMain.find('tr').length;
			while(result != lenTr){
				var $tr = this.$tableBodyMain.find('tr:eq(' + result + '):visible'); 
				if($tr.length == 1){
					break;
				}
				result++;
			};
			if(result == lenTr){
				result = 0;
				while(result != rowIndex){
					var $tr = this.$tableBodyMain.find('tr:eq(' + result + '):visible'); 
					if($tr.length == 1){
						break;
					}
					result++;
				};
			}
			return result;
		},
		/**
		 * 从当前行向上按顺序获取一个可视行，
		 * 	当到第一行还没取到则从末尾开始往上搜索可视行，
		 * 如果没有取到则返回本行
		 */
		_getPrevVisibleRowIndex: function(rowIndex){
			var result = rowIndex - 1
				,lenTr = this.$tableBodyMain.find('tr').length;
			while(result != -1){
				var $tr = this.$tableBodyMain.find('tr:eq(' + result + '):visible'); 
				if($tr.length == 1){
					break;
				}
				result--;
			};
			if(result == -1){
				result = lenTr;
				while(result != rowIndex){
					var $tr = this.$tableBodyMain.find('tr:eq(' + result + '):visible'); 
					if($tr.length == 1){
						break;
					}
					result--;
				};
			}
			return result;
		},
		/**
		 * 判断编辑器是否在网格的最末尾
		 */
		_isLastEditor: function(editor){
			var $lastEditorWrapper = this.$tableBody.find('.app-wrapper:not(.wrapper-disabled):not(.wrapper-readonly):last');
			if(editor.editor.$element.is($lastEditorWrapper)){
				return true;
			}
			return false;
		},
		/**
		 * 判断编辑器是否在网格的最前边
		 */
		_isFirstEditor: function(editor){
			var $firstEditorWrapper = this.$tableBody.find('.app-wrapper:not(.wrapper-disabled):not(.wrapper-readonly):first');
			if(editor.editor.$element.is($firstEditorWrapper)){
				return true;
			}
			return false;
		},
		/**
		 * 是否为最后一行编辑器
		 */
		_isLastEditorRow: function(rowIndex){
			var $row = this.$tableBodyMain.find('tr:visible:last');
			if($row.index() == rowIndex){
				return true;
			}else{
				return false;
			}
		},
		/**
		 * 将行下索引转为行id
		 */
		_convertRowIndexToRowId: function(rowIndex){
			if(isNaN(rowIndex)){
				return rowIndex;				
			}
			return this.$tableBodyMain.find('tr:eq(' + rowIndex + ')').attr('id');
		},
		/**
		 * 将行Id转为行下索引
		 */
		_convertRowIdToRowIndex: function(rowId){
			if(!isNaN(rowId)){
				return rowId;				
			}
			return this.$tableBodyMain.find('tr#' + rowId + '').index();
		},
		/**
		 * 开始编辑行（一个网格只保持一行编辑状态）
		 * <PRE>
		 * 1、如果rowIndex为空或超过当前行号，则不处理
		 * 2、如果rowIndex编辑的行号正在编辑，则不处理
		 * </PRE>
		 * @param {Number} rowIndex 行号
		 * @todo 当已有行正在进行编辑时，则调用{@link geid#endEdit}关闭编辑
		 * @todo 将本行进入编辑状态
		 * @fires grid-class#beforeBeginEdit
		 * @fires grid-class#onBeginEdit
		 * @memberof grid-class
		 * @instance
		 */
		beginEdit: function(rowIndex){
			if(this.setting.editable == false){
				return;
			}
			var rowId = this._convertRowIndexToRowId(rowIndex);
			if(rowId == undefined){
				return;
			}
			if(rowId == this._currentEditRowId){
				return;
			}
			var g = this
				,exp = this._getRowExpr(rowId)
				,$trs = this.$tableBody.find(exp)
				,oriRowData = this._rowData[rowId]
				,rowData = this._getUpdateRowForBegin(rowId, oriRowData);
			if(!rowData){
				return;
			}
			if(this._currentEditRowId != null){
				if(this.endEdit(this._currentEditRowId) != true){
					return;
				}
			}
			this._resetEditorValue();
			/**
			 * 编辑行前事件
			 * @event grid-class#beforeBeginEdit
			 * @param {Object} rowData 行数据
			 * @param {Number} rowIndex 行号
			 * @returns {Boolean} boolean 返回值为false 取消编辑
			 */
			if(this.trigger('beforeBeginEdit', rowData, rowIndex) === false){
				return;
			}
			this._currentEditRowId = rowId;
			for(var i = 0; i < $trs.length; i++){
				var $tr = $($trs[i])
					,$tds = $tr.find('>td');
				for(var j = 0; j < $tds.length; j++){
					g._cellIntoEdit($($tds[j]), rowData);
				}
			}
			setHiddenEditor.call(this, rowData);
            this._fixXProxyScroll();
            this.$tableBodyMain.find(exp).addClass('currEdit');
			/**
			 * 当行变为编辑模式时触发的事件
			 * @event grid-class#onBeginEdit
			 * @param {Object} rowData 行数据
			 * @param {Number} rowIndex 行号
			 */
			this.trigger('onBeginEdit', rowData, rowIndex);
			/**
			 * 设置隐藏编辑器的值
			 */
			function setHiddenEditor(rowData){
				var editors = this.editor;
				for(var field in editors){
					if(editors[field].hasSet){
						continue;
					};
					editors[field].hasSet = true;
					editors[field].editor.setValue(rowData[field], true);
				}
			}
		},
		/**
		 * 获取编辑对象
		 */
		_getUpdateRowForBegin: function(rowId, oriRowData){
			var result = this._newData.updated[rowId];
			if(result){
				return result;
			}
			var result = this._newData.inserted[rowId];
			if(result){
				return result;
			}
			return oriRowData;
		},
		/**
		 * 将单元格转入编辑状态
		 * @param {Jquery} $td 要被编辑的单元格
		 * @param {Object} rowData 被编辑的行数据
		 */
		_cellIntoEdit: function($td, rowData){
			var col = this._column[$td.attr('_cid')]
				,field = col.field
				,editorInfo = this.editor[field];
			if(col && editorInfo){
				var editor = editorInfo.editor;
				var $inner = $td.find('>div:first-child');
				$inner.css('display', 'none');
				$td.css('width', $inner.outerWidth());
				var text = $.trim($td.text())
					,val = rowData[field];
				editor.setValue(val, true);
				editor.setText(text);
				editorInfo.hasSet = true;
				if($.isFunction(editor.setSelectedNode) && val){
					var node = {};
					if($.isFunction(editor.setting.createNode)){
						node = editor.setting.createNode(rowData, text);
					}else{
						node[editor.setting.valuefield] = val;
						node[editor.setting.textfield] = text;
					}
					editor.setSelectedNode(node, true);
				}
				$td.append(editor.$element);
			}
		},
		/**
		 * 结束编辑行，如果该行数据未被修改 不触发{@link grid-class#onEndEdit}
		 * <PRE>
		 * 1、如果传入的rowIndex不是正在编辑的行号，则不处理
		 * 2、如果传入的rowIndex为undefined，则认为是上一次编辑的行号
		 * </PRE>
		 * @param {Number} [rowIndex] 行号
		 * @fires grid-class#beforeEndEdit
		 * @fires grid-class#onEndEdit
		 * @returns {boolean} result true完成结束编辑
		 * @memberof grid-class
		 * @instance
		 */
		endEdit: function(rowIndex){
			$(document).trigger('mousedown.droppanel.api');
			if(this.setting.editable == false){
				return;
			}
			var rowId;
			if(rowIndex === undefined){
				if(this._currentEditRowId == null){
					return;
				}
				rowId = this._currentEditRowId;
			}else{
				rowId = this._convertRowIndexToRowId(rowIndex);
				if(rowId != this._currentEditRowId){
					return;
				}
			}
            var rowExp = this._getRowExpr(rowId);
            if(!this.$tableBodyMain.find(rowExp).hasClass('currEdit')){
                return;
            }
			if(this._beforeEndEdit(rowId) === false){
				return;
			}
			var editInfo = {
				$trs: this.$tableBody.find(this._getRowExpr(rowId))
			};
			var oriRowData = this._rowData[rowId]
				,triggerEnd = true;
			editInfo.oriRowData = oriRowData;
			editInfo.newRowData = this._getUpdateRowForEnd(rowId, oriRowData);
			if(oriRowData){//编辑原始行
				this._endEditOri(editInfo);
				if(!editInfo.realChange){
					this._cancelUpdateRow(rowId);
					triggerEnd = false;
				}
			}else{//编辑新增行
				this._endEditNew(editInfo);
			}
			this._restoreEditor();
			this.trigger('onDataChange');
            this.$tableBodyMain.find(rowExp).removeClass('currEdit');
			if(triggerEnd){
				this._onEndEdit(rowIndex, oriRowData, editInfo.newRowData);
			}
			this._currentEditRowId = null;
			$(document).off('mousedown.grid-edit.api');
			return true;
		},
		/**
		 * 编辑前事件
		 */
		_beforeEndEdit: function(rowId){
			var rowIndex = this._convertRowIdToRowIndex(rowId)
				,rowData = this._rowData[rowId];
			if(!rowData)
				rowData = this._newData[rowId];
			/**
			 * 编辑行前事件
			 * @event grid-class#beforeEndEdit
			 * @param {Object} rowData 行数据
			 * @param {Number} rowIndex 行号
			 * @returns {Boolean} boolean 返回值为false 取消选择
			 */
			return this.trigger('beforeEndEdit', rowData, rowIndex);
		},
		/**
		 * 编辑事件
		 */
		_onEndEdit: function(rowIndex, rowData, newData){
			/**
			 * 当行变为编辑模式时触发的事件，新增行则rowData和newData相同
			 * @event grid-class#onEndEdit
			 * @param {Object} rowData 行数据
			 * @param {Object} newData 编辑后的数据
			 * @param {Number} rowIndex 行号
			 */
			this.trigger('onEndEdit', rowData, newData, rowIndex);
		},
		/**
		 * 还原编辑器的值
		 */
		_resetEditorValue: function(){
			var editors = this.editor;
			for(var field in editors){
				var editor = editors[field].editor;
				editor.setValue('', true);
				editor.setText('');
				editors[field].hasSet = false;
				if(editor.setSelectedNode){
					editor.setSelectedNode(null, true);
				}
			}
		},
		/**
		 * 还原编辑器到编辑器容器
		 */
		_restoreEditor: function(){
			var editors = this.editor;
			for(var field in editors){
				if(editors[field].editor){
					var $editor = editors[field].editor.$element;
					$editor.parent().css('width', 'auto');
					this.$rowEditor.append($editor);
				}
			}
		},
		/**
		 * 获取要编辑的编辑对象
		 * 	1、如果编辑对象为空，且存在源对象，则复制源对象为编辑对象
		 *  2、如果编辑对象为空，且不存在源对象，则源对象为新增的行
		 */
		_getUpdateRowForEnd: function(rowId, oriRowData){
			var result = this._newData.updated[rowId];
			if(result){
				
			}else if(oriRowData){
				result = this._newData.updated[rowId] = $.extend({}, oriRowData);
			}else{
				result = this._newData.inserted[rowId];
			}
			return result;
		},
		/**
		 * 搜集编辑行数据 并标记编辑的单元格
		 */
		_endEditOri: function(editInfo){
			var $trs = editInfo.$trs
				,grid = this;
			editInfo.realChange = false;
			editInfo.callback = function(e){
				e.newRowData[e.col.field] = e.value;
				if(e.value != e.oriRowData[e.col.field]){
					grid._markEditDisplay(e.$td);
					e.realChange = true;
				}
			};
			this._cellApplyEdit(editInfo);
		},
		/**
		 * 搜集新增行数据
		 */
		_endEditNew: function(editInfo){
			var $trs = editInfo.$trs;
			editInfo.callback = function(e){
				e.newRowData[e.col.field] = e.value;
			};
			this._cellApplyEdit(editInfo);
		},
		/**
		 * 对修改的单元格进行标记
		 * @param {JQuery} $td 单元格
		 */
		_markEditDisplay: function($td){
			if(this.setting.markChange){
				$td.addClass('updated');
			}
		},
		/**
		 * 应用编辑的修改
		 * @param {Jquery} $td 被编辑的单元格
		 * @param {Object} oriRowData 编辑前的行数据
		 * @param {Object} newRowData 编辑后的行数据
		 * @param {callback} callback 回调函数
		 */
		_cellApplyEdit: function(editInfo){
			var editors = this.editor;
			for(var field in editors){
				var editor = editors[field]
					,text = editor.editor.getText()
					,val = editor.editor.getValue()
					,$td = editInfo.$trs.find('td[_cid=' + editor.column._cid +']');
				if($td.length == 1){
					var $innerDiv = $td.find('>div:first-child');
					$innerDiv.text(text);
					$innerDiv.css('display', 'block');
					editInfo.$td = $td;
				}
				editInfo.col = editor.column;
				editInfo.value = val;
				if(editInfo.callback)
					editInfo.callback(editInfo);
			}
		},
		/**
		 * 撤销编辑行数据，恢复编辑前的状态
		 * @param {Number} rowIndex 行号
		 * @memberof grid-class
		 * @instance
		 */
		cancelEdit: function(rowIndex){
			if(this.setting.editable == false){
				return;
			}
			var rowId = this._convertRowIndexToRowId(rowIndex);
			if(rowId == this._currentEditRowId){
				this._restoreEditor();
				this._currentEditRowId = null;
			}
			this._cancelUpdateRow(rowId);
			this._cancelEditDisplay(rowId);
		},
		/**
		 * 还原行的展现
		 * @param {String} rowId
		 */
		_cancelEditDisplay: function(rowId){
			var rowData = this._rowData[rowId];
			if(!rowData){
				rowData = this._newData.inserted[rowId];
			}
			this._applyRowEditDisplay(rowId, rowData);
            this.$tableBodyMain.find(this._getRowExpr(rowId)).removeClass('currEdit');
		},
		/**
		 * 应用行的展现
		 * @param {String} rowId 行id
		 * @param {Object} rowData 要应用的行数据
		 */
		_applyRowEditDisplay: function(rowId, rowData){
			var exp = this._getRowExpr(rowId)
				,$trs = this.$tableBody.find(exp)
				,rowIndex = this._convertRowIdToRowIndex(rowId);
			for(var i = 0; i < $trs.length; i++){
				var $tr = $($trs[i])
					,$tds = $tr.find('>td');
				for(var j = 0; j < $tds.length; j++){
					this._applyCellEditDisplay($($tds[j]), rowData, rowIndex);
				}
			}
		},
		/**
		 * 还原单元格的展现
		 * @param {Jquery} $td 要取消编辑的单元格
		 * @param {Object} rowData 要应用的行数据
		 * @param {Number} rowIndex 行号
		 */
		_applyCellEditDisplay: function($td, rowData, rowIndex){
			var col = this._column[$td.attr('_cid')]
				,editor = this.editor[col.field];
			if(col && editor){
				var $tdInner = $td.find('>div:first-child')
					,text = this._getFormatText(col, rowData, rowIndex);
				$tdInner.text(text);
				$tdInner.css('display', 'block');
				this._unmarkEditDisplay($td);
			}
		},
		/**
		 * 取消对修改的单元格进行标记
		 * @param {JQuery} $td 单元格
		 */
		_unmarkEditDisplay: function($td){
			if(this.setting.markChange){
				$td.removeClass('updated');
			}
		},
		/**
		 * 取消被编辑的行的数据
		 */
		_cancelUpdateRow: function(rowId){
			delete this._newData.updated[rowId];
		},
		/**
		 * 获取编辑器
		 * @param {String} field 列属性
		 * @returns {JQuery} $editor 编辑器的Jquery元素
		 * @example {
		 * &#9;title : '格式化显示列',
		 * &#9;align : 'left',
		 * &#9;field : 'f1',
		 * &#9;editor : {
		 * &#9;&#9;type : 'combobox',
		 * &#9;&#9;options : {
		 * &#9;&#9;&#9;valuefield : 'value',
		 * &#9;&#9;&#9;textfield : 'text',
		 * &#9;&#9;&#9;data : data,
		 * &#9;&#9;&#9;afterSelected: function(node){
		 * &#9;&#9;&#9;&#9;var $f2 = $('#gridEditorOnClickTr').grid('getEditor','f2');
		 * &#9;&#9;&#9;&#9;var $f3 = $('#gridEditorOnClickTr').grid('getEditor','f3');
		 * &#9;&#9;&#9;&#9;$f2.combobox('setValue', node.value);
		 * &#9;&#9;&#9;&#9;$f2.combobox('setText', node.text);
		 * &#9;&#9;&#9;&#9;$f3.combobox('setValue', node.value);
		 * &#9;&#9;&#9;&#9;$f3.combobox('setText', node.text);
		 * &#9;&#9;&#9;}
		 * &#9;&#9;}
		 * &#9;}
		 * }
		 * @memberof grid-class
		 * @instance
		 */
		getEditor: function(field){
			return this.editor[field].$editor;
		},
		/**
		 * 允许编辑
		 * @memberof grid-class
		 * @instance
		 */
		enableEdit: function(){
			this.setting.editable = true;
		},
		/**
		 * 允许编辑
		 * @memberof grid-class
		 * @instance
		 */
		disableEdit: function(){
			this.setting.editable = false;
		},
		/**
		 * 允许编辑
		 * @memberof grid-class
		 * @instance
		 */
		getEditable: function(){
			return this.setting.editable;
		},
		/**
		 * 允许编辑
		 * @memberof grid-class
		 * @instance
		 */
		toggleEdit: function(){
			if(this.setting.editable == false){
				this.setting.editable = true;
			}else{
				this.setting.editable = false;
			}
		},
		/**
		 * 搜集新增行数据
		 * @param rowId
		 * @param rowData
		 */
		_insertRow: function(rowId, rowData){
			this._newData.inserted[rowId] = rowData;
			this.trigger('onDataChange');
		},
		/**
		 * 删除行
		 * <PRE>
		 * 1、当该行为原网格数据时，则只标记改行为删除行
		 * 2、当该行为新增的网格数据时，则直接移除该行
		 * </PRE>
		 * @param {Number} rowIndex 行号
		 * @example $('#demo').grid('deleteRow',0);
		 * @memberof grid-class
		 * @instance
		 */
		deleteRow: function(rowIndex){
			if(this.setting.editable == false){
				return;
			}
			var rowId = this._convertRowIndexToRowId(rowIndex);
			this._deleteRow(rowId);
			this._toggleMessage();
		},
		/**
		 * 对删除的行展现进行标记
		 * @param {String} exp 行搜索串
		 */
		_markDeleteDisplay: function(exp){
			if(this.setting.markChange){
				this.$tableBodyLeft.find(exp).addClass('deleted');
				this.$tableBodyMain.find(exp).addClass('deleted');
				this.$tableBodyRight.find(exp).addClass('deleted');
			}else{
				this.$tableBodyLeft.find(exp).hide();
				this.$tableBodyMain.find(exp).hide();
				this.$tableBodyRight.find(exp).hide();
			}
		},
		/**
		 * 搜集删除行数据
		 * @param rowId
		 */
		_deleteRow: function(rowId){
			var oriRowData = this._rowData[rowId];
			if(oriRowData){
				this._newData.deleted[rowId] = this._rowData[rowId];	
			}else{
				this._cancleInsertRow[rowId];
			}
			this._deleteRowDisplay(rowId);
			this.trigger('onDataChange');
		},
		/**
		 * 删除行
		 * @param rowIndex
		 */
		_deleteRowDisplay: function(rowId){
			var exp = this._getRowExpr(rowId);
			if(this._newData.inserted[rowId] != null){
				if(rowId == this._currentEditRowId){
					this._restoreEditor();
				}
				this.$tableBodyLeft.find(exp).remove();
				this.$tableBodyMain.find(exp).remove();
				this.$tableBodyRight.find(exp).remove();
				this._footerFollow();
				this._fixYProxyScrollHeight();
			}else{
				this._markDeleteDisplay(exp);
			}
			if(rowId == this._currentEditRowId){
				delete this._currentEditRowId;
			}
			this._reOrderNumber();
			this._pagerDeleteRow();
		},
		/**
		 * 撤销新增行
		 * @param rowId
		 */
		_cancleInsertRow: function(rowId){
			delete this._newData.inserted[rowId];
		},
		/**
		 * 撤销删除行
		 * @param {Number} rowIndex 行号
		 * @example $('#demo').grid('deleteRow',0);
		 * @memberof grid-class
		 * @instance
		 */
		cancelDelete: function(rowIndex){
			var rowId = this._convertRowIndexToRowId(rowIndex);
			this._unmarkDeleteDisplay(rowId);
			this._cancelDeleteRow(rowId);
		},
		/**
		 * 取消对删除的行展现标记
		 * @param rowId
		 */
		_unmarkDeleteDisplay: function(rowId){
			var exp = this._getRowExpr(rowId);
			if(this.setting.markChange){
				this.$tableBodyLeft.find(exp).removeClass('deleted');
				this.$tableBodyMain.find(exp).removeClass('deleted');
				this.$tableBodyRight.find(exp).removeClass('deleted');
			}else{
				this.$tableBodyLeft.find(exp).show();
				this.$tableBodyMain.find(exp).show();
				this.$tableBodyRight.find(exp).show();
			}
		},
		/**
		 * 撤销删除行
		 * @param rowId
		 */
		_cancelDeleteRow: function(rowId){
			delete this._newData.deleted[rowId];
		},
		/**
		 * 应用所有的改变
		 * @memberof grid-class
		 * @instance
		 */
		acceptChanges: function(){
			var changeds = this.getChanges()
				,deleted = changeds.deleted
				,inserted = changeds.inserted
				,updated = changeds.updated;
			if(deleted){
				for(var rowId in deleted){
					var rowIndex = this._convertRowIdToRowIndex(rowId);
					this.acceptChange(rowIndex);
				}
			}
			if(inserted){
				for(var rowId in inserted){
					var rowIndex = this._convertRowIdToRowIndex(rowId);
					this.acceptChange(rowIndex);
				}
			}
			if(updated){
				for(var rowId in updated){
					var rowIndex = this._convertRowIdToRowIndex(rowId);
					this.acceptChange(rowIndex);
				}
			}
		},
		/**
		 * 根据类型获取更改的行数据，当类型参数未指定，返回所有更改的行
		 * <PRE>
		 * type的可选参数:
		 * 新增：inserted
		 * 删除：deleted
		 * 新增：updated
		 * </PRE>
		 * @param {String} [type] 更改类型
		 * @returns 被改变的数据
		 * @memberof grid-class
		 * @instance
		 */
		getChanges: function(type){
			if(type){
				return $.extend({}, this._newData[type]);
			}else{
				return $.extend({}, this._newData);
			}
		},
		/**
		 * 应用改变
		 * <span style="color:red;">当改行被编辑 又被删除时，删除操作优先于编辑操作</span>
		 * @param {Number} rowIndex
		 * @memberof grid-class
		 * @instance
		 */
		acceptChange: function(rowIndex){
			var changed = this.getChange(rowIndex);
			if(changed){
				switch(changed.type){
					case('updated'):
						this._acceptUpdated(rowIndex, changed.data);
						break;
					case('inserted'):
						this._acceptInserted(rowIndex, changed.data);
						break;
					case('deleted'):
						this._acceptDeleted(rowIndex, changed.data);
						break;
				}
			}
		},
		/**
		 * 获取改变后的数据
		 * @param {Number} rowIndex
		 * @returns {Object} result 被改变的数据
		 * @property {String} returns.type 改变类型
		 * @property {Object} returns.data 改变数据
		 * @memberof grid-class
		 * @instance
		 */
		getChange: function(rowIndex){
			var rowId = this._convertRowIndexToRowId(rowIndex);
			if(rowId == this._currentEditRowId){
				this.endEdit(rowId);
			}
			var changed = this._newData.deleted[rowId]
				,result = {};
			if(changed){
				result.type = 'deleted';
				result.data = $.extend({}, changed);
				return result;
			}
			changed = this._newData.updated[rowId];
			if(changed){
				result.type = 'updated';
				result.data = $.extend({}, changed);
				return result;
			}
			changed = this._newData.inserted[rowId];
			if(changed){
				result.type = 'inserted';
				result.data = $.extend({}, changed);
				return result;
			}
			return result;
		},
		/**
		 * 应用修改后的数据
		 * @param rowIndex
		 * @param rowData
		 */
		_acceptUpdated: function(rowIndex, rowData){
			var rowId = this._convertRowIndexToRowId(rowIndex);
			$.extend(this._rowData[rowId], rowData);
			this._applyRowEditDisplay(rowId, rowData);
			this._cancelUpdateRow(rowId);
		},
		/**
		 * 应用新增后的数据
		 * @param rowIndex
		 * @param rowData
		 */
		_acceptInserted: function(rowIndex, rowData){
			var rowId = this._convertRowIndexToRowId(rowIndex);
			if(rowIndex == 0){
				this.getRows().unshift(rowData);
			}else{
				this.getRows()[rowIndex] = rowData;
			}
			this._rowData[rowId] = rowData;
			this._cancleInsertRow(rowId);
			this._acceptInsertDisplay(rowId);
		},
		/**
		 * 应用新增后的数据的展现
		 * @param rowId
		 */
		_acceptInsertDisplay: function(rowId){
			if(this.setting.markChange){
				var exp = this._getRowExpr(rowId);
				this.$tableBody.find(exp).removeClass('inserted');
			}
		},
		/**
		 * 应用删除后的数据
		 * @param rowIndex
		 * @param rowData
		 */
		_acceptDeleted: function(rowIndex, rowData){
			var rowId = this._convertRowIndexToRowId(rowIndex);
			this.getRows().splice(rowIndex, 1);
			delete this._rowData[rowId];
			this._cancelDeleteRow(rowId);
			this._cancelUpdateRow(rowId);
			this._acceptDeletedDisplay(rowId);
		},
		/**
		 * 应用删除后的展现
		 * @param rowIndex
		 */
		_acceptDeletedDisplay: function(rowId){
			var exp = this._getRowExpr(rowId);
			this.$tableBody.find(exp).remove();
			this._reOrderNumber();
			this._footerFollow();
			this._fixYProxyScrollHeight();
		},
		/**
		 * 对单元格为无效数据
		 * @param {Object} info 单元格信息
		 * @param {Number} info.rowIndex 第几行
		 * @param {String} info.field 列名
		 * @param {String} info.msg 提示信息
		 * @example $('#grid').grid('setCellInvalid');
		 * @memberof grid-class
		 * @instance
		 */
		setCellInvalid: function(info){
			var $td = this._findTdByInfo(info);
			$td.addClass('invalid');
			this._initInvalidMsg($td, info.msg);
		},
		/**
		 * 根据info查询td
		 * @param info（rowIndex,field）
		 */
		_findTdByInfo: function(info){
			var $td = this.$tableBodyMain.find('tr:eq(' + info.rowIndex + ') td[field="' + info.field +'"]');
			if($td.length == 0){
				$td = this.$tableBodyLeft.find('tr:eq(' + info.rowIndex + ') td[field="' + info.field +'"]');
				if($td.length == 0){
					$td = this.$tableBodyRight.find('tr:eq(' + info.rowIndex + ') td[field="' + info.field +'"]');
				}
			}
			return $td;
		},
		/**
		 * 清除单元格的无效信息
		 * @param {Object} info 单元格信息
		 * @param {Number} info.rowIndex 第几行
		 * @param {String} info.field 列名
		 * @example $('#grid').grid('setCellValid');
		 * @memberof grid-class
		 * @instance
		 */
		setCellValid: function(info){
			var $td = this._findTdByInfo(info);
			$td.removeClass('invalid');
			this._hideInvalidMsg($td);
		},
		/**
		 * 隐藏提示框
		 * @param $target
		 */
		_hideInvalidMsg: function($target){
			if($target.length == 1){
				var $msg = $target.data('invalidMsg');
				if($msg){
					$msg.hide();
				}
			}else{
				$target.each(function(){
					var $msg = $(this).data('invalidMsg');
					if($msg){
						$msg.hide();
					}
				});
			}
		},
		/**
		 * 设置一行数据为无效数据
		 * @param {Object} info 单元格信息
		 * @param {Number} info.rowIndex 第几行
		 * @param {String} info.msg 提示信息
		 * @example $('#grid').grid('setRowInvalid', 0);
		 * @memberof grid-class
		 * @instance
		 */
		setRowInvalid: function(info){
			var rowIndex = info.rowIndex
				,$left = this.$tableBodyLeft.find('tr:eq(' + rowIndex + ')')
				,$main = this.$tableBodyMain.find('tr:eq(' + rowIndex + ')')
				,$right = this.$tableBodyRight.find('tr:eq(' + rowIndex + ')');
			$left.addClass('invalid');
			$main.addClass('invalid');
			$right.addClass('invalid');
			this._initInvalidMsg($main, info.msg);
			$left.data('invalidMsg',$main.data('invalidMsg'));
			$right.data('invalidMsg',$main.data('invalidMsg'));
		},
		/**
		 * 清除一行的无效信息，该行上设置的单元格无效信息也会被清除
		 * @param {Object} info 行号
		 * @example $('#grid').grid('setRowInvalid', 0);
		 * @example $('#grid').grid('setRowInvalid', {rowIndex:0});
		 * @memberof grid-class
		 * @instance
		 */
		setRowValid: function(info){
			var rowIndex = info;
			if(isNaN(info)){
				rowIndex = info.rowIndex;
			}
			var $leftTr = this.$tableBodyLeft.find('tr:eq(' + rowIndex + ')')
				,$mainTr = this.$tableBodyMain.find('tr:eq(' + rowIndex + ')')
				,$rightTr = this.$tableBodyRight.find('tr:eq(' + rowIndex + ')')
				,$leftTd = this.$tableBodyLeft.find('tr:eq(' + rowIndex + ')>td.invalid')
				,$mainTd = this.$tableBodyMain.find('tr:eq(' + rowIndex + ')>td.invalid')
				,$rightTd = this.$tableBodyRight.find('tr:eq(' + rowIndex + ')>td.invalid');
			$leftTr.removeClass('invalid');
			$mainTr.removeClass('invalid');
			$rightTr.removeClass('invalid');
			$leftTd.removeClass('invalid');
			$mainTd.removeClass('invalid');
			$rightTd.removeClass('invalid');
			this._hideInvalidMsg($mainTr);
			this._hideInvalidMsg($leftTd);
			this._hideInvalidMsg($mainTd);
			this._hideInvalidMsg($rightTd);
		},
		/**
		 * 清除全部的无效标志
		 * @param {Number} rowIndex 行号
		 * @example $('#grid').grid('setRowInvalid', 0);
		 * @memberof grid-class
		 * @instance
		 */
		clearAllInvalid: function(){
			this.$tableBody.find('tr.invalid').removeClass('invalid');
			this.$tableBody.find('td.invalid').removeClass('invalid');
			this.$absoluteComp.find('>div').hide();
		},
		/**
		 * 生成一个错误信息的显示框
		 */
		_initInvalidMsg: function($target, msg){
			var $msg = $target.data('invalidMsg');
			if($msg){
				$msg.find('>div>span').html(msg);
				$msg.show();
			}else{
				$msg = $('<div class="errorWrapper"><div><span>' + msg + '</span><div></div></div></div>');
				this.$absoluteComp.append($msg);
				this._initInvalidMsgCss($target, $msg);
				$target.data('invalidMsg', $msg); 
			}
		},
		/**
		 * 错误信息的初始样式
		 */
		_initInvalidMsgCss: function($target, $msg){
			var position = $target.position()
				,css = {display: 'block', left: position.left, top: position.top - 42};
			$msg.css(css);
			/**
			 * 修复提示信息的位置
			 */
			if(this.$element.offset().top > $msg.offset().top){
				css.top += ($target.outerHeight() + $msg.outerHeight());
				$msg.css(css);
				$msg.addClass('up');
			}else{
				$msg.removeClass('up');
			}
		},
		/**
		 * 绑定错误信息的显示事件
		 */
		_bindInvalidMsgEvent: function(){
			var g = this;
			this.$tableBody.on('mousemove.grid.api', 'td.invalid,tr.invalid>td', function(e){
				var $this = $(this)
					,position = $this.position()
					,$msg = null;
				if($this.find('div>.rowBtn').length > 0){
					return;
				}
				if($this.hasClass('invalid')){
					$msg = $this.data('invalidMsg');
				}else{
					$msg = $this.parent().data('invalidMsg');
				}
                if($msg){
                	g._initInvalidMsgCss($this, $msg);
                }
			});
			this.$tableBody.on('mouseout.grid.api', '.invalid', function(e){
				var errMsg = $(this).data('invalidMsg');
                if(errMsg){
                	errMsg.hide();
                }
			});
		},
		/**
		 * 保存（新增、修改、删除）行数据
		 * <PRE>
		 * infos为一个对象
		 * infos.command: 删除[del]、新增[add]、修改[update]，新增修改时 可以无需指定command，由rowData的主键进行判断
		 * infos.rowIndex: 要操作的行号
		 * infos.rowData: 要执行的行对象数据
		 * 1、当该表格有设置主键时，可以根据rowData推算出rowIndex，即rowIndex可以不需要指明
		 * 2、当该表格没有设置主键时，必须指明更新第几行 即该对象 存在两个属性：rowIndex 和 rowData
		 * </PRE>
		 * @todo 优先使用指定的rowIndx属性作为更新的行号，当没有指定rowIndex时，尝试根据主键搜索rowIndex
		 * @todo 如果根据信息能够计算出rowIndex，则认为是更新行，否则认为是追加行
		 * @param {Object|RowData} infos 保存信息
		 * @param {String} [infos.command] 命令
		 * @param {Number} [infos.rowIndex] 行号
		 * @param {Object} [infos.rowData] 行数据
		 * @example $('#grid').grid('saveRow', {id:'idVal',......}); 
		 * 有主键 直接传入rowData 对象，如果网格存在该id的行，则进行更新，不存在则进行追加
		 * @example $('#grid').grid('saveRow', {rowData:{id:'idVal'}, command:'del'}); 
		 * 删除操作，必须指定command为del，有主键 可以只指定rowData，如果网格存在该id的行，则进行删除操作
		 * @example $('#grid').grid('saveRow', {rowData:{id:'idVal'}, command:'del'}); 
		 * 删除操作，必须指定command为del，没有主键 可以指定rowIndex
		 * @example $('#grid').grid('saveRow', {rowIndex:2, rowData:{} }); 
		 * 没有主键 必须指明rowIndex，并将行数据设置在rowData属性上
		 * @example $('#grid').grid('saveRow', {rowIndex:2, command:'del'}); 
		 * 没有主键 必须指明rowIndex，指定命令del
		 * @memberof grid-class
		 * @instance
		 */
		saveRow: function(infos){
			var rowIndex = infos.rowIndex
				,command = infos.command
				,rowData = null
				,idField = this.setting.idField;
			if(infos.rowData && typeof(infos.rowData) == 'object'){
				rowData = infos.rowData;
			}else{
				rowData = infos;
			}
			if(rowIndex == undefined){
				if(rowData[idField] != undefined){
					rowIndex = this.$tableBodyMain.find('tr[_v="' + rowData[idField] + '"]').index();
					rowIndex = rowIndex == -1 ? undefined : rowIndex;
				}
			}
			var totalRows = this.$tableBodyMain.find('tr').length - 1;
			if(rowIndex == undefined 
				|| rowIndex > totalRows){
				this.appendRow(rowData);
				if(!infos.manualCommit){
					this.acceptChange(totalRows + 1);
				}
			}else{
				if(command == 'del'){
					var rowId = this._convertRowIndexToRowId(rowIndex);
					this._deleteRow(rowId);
					if(!infos.manualCommit){
						this.acceptChange(rowIndex);
					}
						
				}else{
					this._updateRow(rowIndex, rowData);
					if(!infos.manualCommit){
						this.acceptChange(rowIndex);
					}
				}
			}
		},
		/**
		 * 更新行
		 * @param rowIndex
		 * @param rowData
		 */
		_updateRow: function(rowIndex, rowData){
			var rows = this.data[this.setting.jsonReader.rows];
			if(rows.length < rowIndex){
				return;
			}
			rows[rowIndex] = rowData;
			var rowId = this._convertRowIndexToRowId(rowIndex);
			this._newData.updated[rowId] = rowData;	
			this._updateRowDisplay(rowIndex, rowData);
			this.trigger('onDataChange');
		},
		/**
		 * 更新展现
		 */
		_updateRowDisplay: function(rowIndex, rowData){
			var columns = this._column
				,that = this;
			update$tr(this.$tableBodyLeft.find('tr:eq(' + rowIndex + ')'));
			update$tr(this.$tableBodyMain.find('tr:eq(' + rowIndex + ')'));
			update$tr(this.$tableBodyRight.find('tr:eq(' + rowIndex + ')'));
			function update$tr($tr){
				if($.isFunction(that.setting.rowCheckable)){
					if(that.setting.rowCheckable(rowData, rowIndex) === false){
						$tr.addClass('row-uncheckable');
					}else{
						$tr.removeClass('row-uncheckable');
					}
				}
				var $tds = $tr.find('td');
				$tds.each(function(){
					update$td($(this));
				});
			}
			function update$td($td){
				var col = columns[$td.attr('_cid')];
				if(!col){
					return;
				}
				if(col.field == '_rownumbers'){
					return;
				}
				if(col._html){
					return;
				}
				if($td.find('.app-wrapper').length == 1){
					col.editor.editor.setValue(rowData[col.field]);	
				}
				var html = '';
				if(col.buttons){
					html = that._getBtnHtml(col, rowData);
				}else{
					html = that._getFormatText(col, rowData);
				}
				if(typeof($td.attr('title')) != 'undefined'){
					var title = html;
					if(typeof html == 'string'){
						var $html = $('<div>' + html + '</div>');
						if($html.children().length != 0){
							title = $html.text();
						}
					}
					$td.attr('title', title);
				}
				$td.find('div:first').html(html);
				var css = '';
				if($.isFunction(col.styler)){
					css = col.styler(rowData[col.field], rowData);
				}else if(col.styler){
					css = col.styler;	
				}
				if(css){
					$td.attr('style', css);
				}
			}
		}		
	});
	return GridEditor;
});