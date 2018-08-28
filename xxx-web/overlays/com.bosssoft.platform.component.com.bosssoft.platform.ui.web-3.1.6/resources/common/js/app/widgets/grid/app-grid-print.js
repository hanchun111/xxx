define(['app/core/app-class', 'app/core/app-jquery', 'app/core/app-core', 
		'app/data/app-ajax', 'app/widgets/grid/app-grid-formatter',
		'bs-http-plugin/bs-print'],
		function(Class, $, App, AppAjax, Formatter, BSPrint) {
	'use strict';
	
	if(!$.grid){
		$.grid = {};
	}
	$.grid.getColumnFormatPattern = function(col){
		if(col.formatPattern){
			return col.formatPattern;
		}
		var format = col.format;
		if(format && format.charAt(0) == '[' && format.charAt(format.length-1) == ']'){
			return format.substr(1, format.length-2);
		}
		if(col.printType && 
				col.printType.indexOf('Number') != -1){
			var precision = parseInt(col.printType.substring('6'))
				,result = '#,##0';
			if(precision > 0){
				result += '.'
				for(var x = 0 ; x < precision; x++){
					result += '0';
				}
			}
			return result;
		}
		if(col.formatter == 'thousandsFormatter'){
			return '#,##0.00;;#';
		}
		if(col.formatter == 'thousand'){
			return '#,##0.00';
		}
		if(col.formatter == '###,###(0)'){
			return '#,##0;;#';
		}
	}
	
	//最大导出条数
	var MAX_EXPORT_ROW_COUNT = 5000;
	/**
	 * 导出网格的扩展方法
	 */
	var GridPrint = Class.create({
		/**
		 * 打印
		 * @param {PrintOption} [opts] 报表配置参数
		 * @property {Object} [PrintOption] 报表配置参数
		 * @property {String} [PrintOption.Name] 报表名称(导出文件名称)
		 * @property {Object} [PrintOption.ReportDetail] 明细表格
		 * @property {Boolean} [PrintOption.ReportDetail.PrintOnePage=true] 报表横向分页输出时，尽量将横向产生的页面组合在一页中
		 * @property {Boolean} [PrintOption.ReportDetail.CellAdaptMethod=1] 单元格内容显示策略
		 * <PRE>
		 * 可选值
		 * 1 缩小适应
		 * 2 内容会被修剪
		 * 3 内容换行显示
		 * 4 自动宽度 
		 * </PRE>
		 * @property {Number} [PrintOption.ReportDetail.PrintAdaptMethod=8] 打印策略
		 * <PRE>
		 * 可选值
		 * 1 在打印输出时，超出页面输出范围的列内容将被忽略掉，即不输出显示。
		 * 2 在打印输出时，超出页面输出范围的列内容将另起新行输出显示。
		 * 3 在打印输出时，根据列的宽度按比列将所有要输出的列的总宽度调整到页面输出区域的宽度。 
		 * 4 在打印输出时，如果列的总宽度超出页面输出范围，与3相同，反之按设计时宽度输出。
		 * 5 在打印输出时，超出页面输出范围的列内容将另起新页输出显示，按先从上到下的顺序输出。
		 * 6 在打印输出时，超出页面输出范围的列内容将另起新页输出显示，按先从左到右的顺序输出。
		 * 7 在打印输出时，超出页面输出范围的列内容将另起新页输出显示，且左边的固定列在每页中重复输出，按先从上到下的顺序输出。 
		 * 8 在打印输出时，超出页面输出范围的列内容将另起新页输出显示，且左边的固定列在每页中重复输出，按先从左到右的顺序输出。 
		 * </PRE>
		 * @property {Object} [PrintOption.ReportDetail.FullBlank] 填充空白
		 * @property {Enum} [PrintOption.ReportDetail.FullBlank.Method=0] 填充类型
		 * <PRE>
		 * 可选值
		 * 0: 不填充
		 * 1: 填充列
		 * 2: 填充行
		 * 3: 填充行列
		 * </PRE>
		 * @property {Number} [PrintOption.ReportDetail.FullBlank.Width=0] 填充列宽
		 * <PRE>
		 * 当填充列宽为0时，根据每页的最后一列列宽进行填充
		 * </PRE>
		 * @property {Object} [PrintOption.ReportDetail.RowNumber] 行号
		 * @property {String} [PrintOption.ReportDetail.RowNumber.Title=序号] 标题
		 * @property {String} [PrintOption.ReportDetail.RowNumber.SummaryText] 合计行文本
		 * @property {String} [PrintOption.ReportDetail.HeaderBgColor] 表格头背景色
		 * @property {String} [PrintOption.ReportDetail.FooterBgColor] 表格合计背景色
		 * @property {Object} [PrintOption.PageHeader] 页眉
		 * @property {Object} [PrintOption.PageHeader.Left] 左页眉
		 * @property {String} [PrintOption.PageHeader.Left.Title] 左页眉文字
		 * @property {Object} [PrintOption.PageHeader.Center] 中页眉
		 * @property {String} [PrintOption.PageHeader.Center.Title] 中页眉文字
		 * @property {Object} [PrintOption.PageHeader.Right] 右页眉
		 * @property {String} [PrintOption.PageHeader.Right.Title] 右页眉文字
		 * @property {Object} [PrintOption.PageFooter] 页脚
		 * @property {Object} [PrintOption.PageFooter.Left] 左页脚
		 * @property {String} [PrintOption.PageFooter.Left.Title] 左页脚文字
		 * @property {Object} [PrintOption.PageFooter.Center] 中页脚
		 * @property {String} [PrintOption.PageFooter.Center.Title] 中页脚文字
		 * @property {Object} [PrintOption.PageFooter.Right] 右页脚
		 * @property {String} [PrintOption.PageFooter.Right.Title] 右页脚文字
		 * @property {Object} [PrintOption.ReportHeader] 报表标题
		 * @property {Boolean} [PrintOption.ReportHeader.Repeat] 是否每页重复
		 * @property {Object} [PrintOption.ReportHeader.MainTitle] 主标题
		 * @property {String} [PrintOption.ReportHeader.MainTitle.Title] 主标题文本
		 * @property {Array} [PrintOption.ReportHeader.SubTitles] 副标题集合
		 * @property {SubTitle} [PrintOption.ReportHeader.SubTitles.SubTitle] 副标题
		 * @property {Object} [PrintOption.ReportHeader.SubTitles.SubTitle.Left] 左标题
		 * @property {String} [PrintOption.ReportHeader.SubTitles.SubTitle.Left.Title] 左标题文本
		 * @property {Object} [PrintOption.ReportHeader.SubTitles.SubTitle.Center] 中标题
		 * @property {String} [PrintOption.ReportHeader.SubTitles.SubTitle.Center.Title] 中标题文本
		 * @property {Object} [PrintOption.ReportHeader.SubTitles.SubTitle.Right] 右标题
		 * @property {String} [PrintOption.ReportHeader.SubTitles.SubTitle.Right.Title] 右标题文本
		 * @property {Object} [PrintOption.ReportFooter] 报表尾标题
		 * @property {Boolean} [PrintOption.ReportFooter.Repeat] 是否每页重复
		 * @property {Array} [PrintOption.ReportFooter.SubTitles] 副标题集合
		 * @property {SubTitle} [PrintOption.ReportFooter.SubTitles.SubTitle] 副标题
		 * @property {Object} [PrintOption.ReportFooter.SubTitles.SubTitle.Left] 左标题
		 * @property {String} [PrintOption.ReportFooter.SubTitles.SubTitle.Left.Title] 左标题文本
		 * @property {Object} [PrintOption.ReportFooter.SubTitles.SubTitle.Center] 中标题
		 * @property {String} [PrintOption.ReportFooter.SubTitles.SubTitle.Center.Title] 中标题文本
		 * @property {Object} [PrintOption.ReportFooter.SubTitles.SubTitle.Right] 右标题
		 * @property {String} [PrintOption.ReportFooter.SubTitles.SubTitle.Right.Title] 右标题文本
		 * @param {PaperSet} [paperSet] 纸张设置
		 * @property {PaperSet} [PaperSet] 纸张设置
		 * @property {Enum} [PaperSet.Paper=A4] 纸张类型
		 * <PRE>
		 * 可选值：A3、A4、A5、B4、B5
		 * </PRE>
		 * @property {Enum} [PaperSet.Direction=纵向] 纸张方向
		 * <PRE>
		 * 可选值:纵向、横向
		 * </PRE>
		 * @property {Number} [PaperSet.MarginUp] 上边距（厘米）
		 * @property {Number} [PaperSet.MarginDown] 下边距（厘米）
		 * @property {Number} [PaperSet.MarginLeft] 左边距（厘米）
		 * @property {Number} [PaperSet.MarginRight] 右边距（厘米）
		 * @property {Number} [PaperSet.OffsetX] 横向偏移（厘米）
		 * @property {Number} [PaperSet.OffsetY] 纵向偏移（厘米）
		 * @param {Array} [rows] 打印表格内容行
		 * @example $('#demo').grid('print');
		 * @memberof grid-class
		 * @instance
		 */
		print: function(opts, paperSet, rows){
			exportGrid.call(this, opts, paperSet, 'Print', rows);
		},
		/**
		 * 快速打印
		 * @todo 按照默认打印设置进行打印，不弹出打印设置
		 * @todo 参数请参照打印接口
		 * @example $('#demo').grid('fastPrint');
		 * @memberof grid-class
		 * @instance
		 */
		fastPrint: function(opts, paperSet){
			exportGrid.call(this, opts, paperSet, 'FastPrint');
		},
		/**
		 * 打印预览
		 * @todo 参数请参照打印接口
		 * @example $('#demo').grid('printPreview');
		 * @memberof grid-class
		 * @instance
		 */
		printPreview: function(opts, paperSet, rows){
			exportGrid.call(this, opts, paperSet, 'Preview', rows);
		},
		/**
		 * 导出excel
		 * @todo 参数请参照打印接口
		 * @example $('#demo').grid('exportExcel');
		 * @memberof grid-class
		 * @instance
		 */
		exportExcel: function(opts, paperSet){
			exportGrid.call(this, opts, paperSet, 'Excel');
		},
		/**
		 * 打印全部数据
		 * @todo 参数请参照打印接口
		 * @example $('#demo').grid('printAll');
		 * @memberof grid-class
		 * @instance
		 */
		printAll: function(opts, paperSet){
			exportAll.call(this, opts, paperSet, 'Print');
		},
		/**
		 * 快速全部打印
		 * @todo 按照默认打印设置进行打印，不弹出打印设置
		 * @todo 参数请参照打印接口
		 * @example $('#demo').grid('fastPrint');
		 * @memberof grid-class
		 * @instance
		 */
		fastPrintAll: function(opts, paperSet){
			exportAll.call(this, opts, paperSet, 'FastPrint');
		},
		/**
		 * 预览全部数据
		 * @todo 参数请参照打印接口
		 * @memberof grid-class
		 * @instance
		 */
		printPreviewAll: function(opts, paperSet){
			exportAll.call(this, opts, paperSet, 'Preview');
		},
		/**
		 * 导出全部数据excel
		 * @todo 参数请参照打印接口
		 * @memberof grid-class
		 * @instance
		 */
		exportAllExcel: function(opts, paperSet){
			exportAll.call(this, opts, paperSet, 'Excel');
		},
		/**
		 * 获取打印模型
		 * @todo 参数请参照打印接口
		 * @memberof grid-class
		 * @instance
		 */
		getPrintModel: function(opts, rows){
			return getPrintInfo.call(this, opts, rows)
		}
	});
	function exportAll(opts, paperSet, opType){
		if(isLocalExport.call(this)){
			exportGrid.call(this, opts, paperSet, opType);
		}else{
			var that = this
				,totalRows = this.data[this.setting.jsonReader.total];
			if(totalRows >= MAX_EXPORT_ROW_COUNT){
				$messager.confirm('当前内容总数[<strong style="color:red;">' + totalRows 
						+ '</strong>]超过[' + MAX_EXPORT_ROW_COUNT + ']条，</br>数据处理需要较多时间，确认继续？',{
					okCall: function(){
						if(!opts){
							opts = {};
						}
						if(!opts.ReportDetail){
							opts.ReportDetail = {};
						}
						if(!opts.ReportDetail.DetailLoader){
							opts.ReportDetail.DetailLoader = {
								LimitRowNum: totalRows
							}
						}else{
							opts.ReportDetail.DetailLoader.LimitRowNum = totalRows;
						}
						exportGrid.call(that, opts, paperSet, opType, true);
					}}
				);
			}else{
				exportGrid.call(this, opts, paperSet, opType, true);
			}
		}
		/**
		 * 是否为本地打印
		 */
		function isLocalExport(){
			if(this.setting.pager == 'none'){
				return true;
			}
			if(this.getCurrentPageSize() >= this.data[this.setting.jsonReader.total]){
				return true;
			}
			return false;
		}
	}
	/**
	 * 打印数据
	 */
	function exportGrid(opts, paperSet, opType, allData){
		var printData = getPrintInfo.call(this, opts, allData);
		paperSet = applyDefaultPrintPaperSet(printData, paperSet);
		if(!printData.PageFooter){
			printData.PageFooter = {Center:{Title: '第[#SystemVar(PageNumber)#]页 共[#SystemVar(PageCount)#]页'}};
		}
		if(paperSet){
			doExportGrid.call(this, printData, paperSet, opType, allData)
		}else{
			var that = this
				,printSetDfd = BSPrint.getDefInstance().getPrintSet({ModuleId:'00000000'});
			$A.showWaitScreen('正在获取打印设置...');
			$.when(printSetDfd).done(function (printSet) {
				doExportGrid.call(that, printData, printSet, opType, allData);
			}).fail(function(){
				$a.hideWaitScreen();
			});
		}
	}
	
	function doExportGrid(printData, printSet, opType, allData){
		var data = {
			PrintData: printData,
            PrintSet: printSet
        };
		if(opType == 'FastPrint'){
			
		}else if(opType == 'Print'){
			data.ShowPrintSet = true;
		}else if(opType == 'Preview'){
			data.PrintPreview = true;
		}else{
			data.ExportFile = opType;
		}
		$A.showWaitScreen('正在打印中...');
		BSPrint.getDefInstance().doCustomPrint(data).done(function () {
			$a.hideWaitScreen();
        }).fail(function (e) {
        	$A.hideWaitScreen();
        	if(e && e.code == 'timeout'){
        		return;
        	}
        	$A.messager.error('打印插件调用异常');
        	if(window.console){
        		window.console.log('打印插件调用异常', arguments); 
        	}
        });
	}

	var ALIGN = {
		left: 4,
		center: 5,
		right: 6
	};
	var ALIGN_UPPER = {
		left: 'Left',
		center: 'Center',
		right: 'Right'
	};
	var SUMMARY = {
		sum: 1,
		avg: 2,
		count: 3,
		min: 4,
		max: 5
	};
	
	function getPrintInfo(opts, allData){
		var result = {};
		result.ReportDetail = getReportDetail.call(this, allData);
		$.extend(true, result, opts);
		return result;
	};
	function getReportDetail(allData){
		var result = {};
		result.DetailHeaders = getGridColumns.call(this);
		result.FixCols = getFrozenCount(result.DetailHeaders);
		if(this.setting.rownumbers != 'none'){
			result.FixCols++;
		}
		if($.isArray(allData)){
			result.DetailDatas = getGridData.call(this, allData);
		}else if(allData 
				&& this.data[this.setting.jsonReader.total] > 0){
			result.DetailLoader = {
				Url: 'http://'+window.location.host+window._contextPath +'/' +this.setting.url,
				QueryParam: JSON.stringify(this._getQueryParam()),
				JsonReader: {
					Total: 'totalRecords',
					Rows: 'data',
					Footer: 'footer'
				}
			};
		}else{
			result.DetailDatas = getGridData.call(this);
		}
		result.HAlign = this.setting.halign;
		result.Nowrap = true;
		if(this.setting.rownumbers == 'normal'){
			result.RowNumber = {
				SummaryText: ''
			};
		}
    	return result;
    	function getGridColumns(){
    		var cols = this.getColumnTree();    		
    		return convert(cols, this.setting.summaryMerger);
    		function convert(cols, summaryMerger){
    			if(!cols || cols.length == 0){
    				return;
    			}
    			var result = [];
    			for(var i = 0; i < cols.length; i++){
    				var temp = {}
    					,col = cols[i];
    				if(col.sysCol || col.hidden){
    					continue;
    				}
    				result.push(temp);
    				temp.Name = col.field;
    				temp.Title = col.title;
					temp.Align = ALIGN[col.align];
    				temp.Frozen = col.viewPos;
    				if(col.printWidth){
						temp.Width = col.printWidth/10;
    				}
    				var format = $.grid.getColumnFormatPattern(col);
    				if(format){
    					temp.Format = format;
    					temp.DataType = 'Number';
    				}
    				if(col.summary){
    					if(col.summary.text){
    						temp.Summary = {
    							Text: col.summary.text
    						};
    					}else{
    						temp.Summary = {
    							Function: SUMMARY[col.summary.type]
    						};
    					}
    				}
    				if(summaryMerger && summaryMerger.beginField == col.field){
    					if(!temp.Summary){
    						temp.Summary = {};
    					}
						temp.Summary.AlignColumnEx = summaryMerger.endField;
						if(summaryMerger.text){
							temp.Summary.Text = summaryMerger.text;
						}
						if(summaryMerger.align){
							temp.Summary.Align = ALIGN[summaryMerger.align];
						}
					}
    				if(col.children){
    					temp.SubHeaders = convert(col.children);
    					temp.Name = $a.uuid();
    				}
    			}
    			return result;
    		}
    	}
    	function getFrozenCount(cols){
    		var result = 0;
    		for(var i = 0; i < cols.length; i++){
    			var col = cols[i];
    			if(col.SubHeaders){
    				result += getFrozenCount(col.SubHeaders)
    			}else if(col.Frozen == 'left'){
    				result++;
    			}
    			delete col.Frozen;
    		}
    		return result;
    	}
    	function getGridData(rows){
    		if(!rows){
    			rows = this.data[this.setting.jsonReader.rows];
    		}
    		return formatterData.call(this, rows);
    		function formatterData(data){
    			var fieldColumns = this._fieldColumns
    				,formatterFields = {}
    				,result = [];
    			for(var field in fieldColumns){
    				var col = fieldColumns[field]
    					,formatter = col.formatter; 
    				if(formatter){
    					if(col.printType.indexOf('Number') != -1){
    						continue;
    					}
    					if(col.template){
    						formatterFields[field] = col.template;
    						continue;
    					}
    					if(!$.isFunction(formatter)){
    						formatter = Formatter.get(col.formatter);
    					}
    					if($.isFunction(formatter)){
    						formatterFields[field] = formatter;
    					}
    				}
    			}
    			for(var i = 0; i < data.length; i++){
    				var row = $.extend({}, data[i]);
    				delete row.__rowId;
    				result.push(row);
    				for(var field in formatterFields){
    					if($.isFunction(formatterFields[field])){
    						var text = formatterFields[field](row[field], row, i, fieldColumns[field]);
    						row[field] = getPrintText(text);
    					}else{
    						row[field] = formatterFields[field].apply(row);
    					}
    				}
    			}
    			return result;
    			function getPrintText(str){
    				var $t = $('<span>'+str+'</span>')
						,children = $t.children();
					if(children.length >= 1){
						return children.attr('printText') || children.attr('title') || children.text();
					}
    				return str;
    			}
    		}
    	}
	};

	function applyDefaultPrintPaperSet(printData, paperSet){
		var defaults = null;
		if(!$.isFunction($.getDefaultPrintPaperSet)){
			return paperSet;
		}
		defaults = $.getDefaultPrintPaperSet(printData);
		if(!defaults){
			return paperSet;
		}
		if(!paperSet){
			paperSet = {};
		}
		if(!paperSet.Pager){
			paperSet.Pager = defaults.Pager;
		}
		if(!paperSet.Direction){
			paperSet.Direction = defaults.Direction;
		}
		if(paperSet.MarginUp == undefined){
			if(!isNaN(defaults.MarginUp)){
				paperSet.MarginUp = defaults.MarginUp;
			}
		}
		if(paperSet.MarginDown == undefined){
			if(!isNaN(defaults.MarginDown)){
				paperSet.MarginDown = defaults.MarginDown;
			}
		}
		if(paperSet.MarginLeft == undefined){
			if(!isNaN(defaults.MarginLeft)){
				paperSet.MarginLeft = defaults.MarginLeft;
			}
		}
		if(paperSet.MarginRight == undefined){
			if(!isNaN(defaults.MarginRight)){
				paperSet.MarginRight = defaults.MarginRight;
			}
		}
		if(paperSet.OffsetX == undefined){
			if(!isNaN(defaults.OffsetX)){
				paperSet.OffsetX = defaults.OffsetX;
			}
		}
		if(paperSet.OffsetY == undefined){
			if(!isNaN(defaults.OffsetY)){
				paperSet.OffsetY = defaults.OffsetY;
			}
		}
		return paperSet;
	}
	return GridPrint;
});