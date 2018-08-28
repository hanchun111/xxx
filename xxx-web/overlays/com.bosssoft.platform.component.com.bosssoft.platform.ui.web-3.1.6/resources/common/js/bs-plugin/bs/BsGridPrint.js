/**
 * 网格打印
 */define(["app/core/app-jquery","app/core/app-core"],function($,$A){
 		var initControllerOption = {
		StaticBox : {
			Center : 0,
			Point : 15,
			Bold : true,
			Top : 0.4,
			Left : 0,
			Width : 5.64,
			Height : 0.58
		},
		MemoBox : {
			Center : 0,
			Point : 15,
			Bold : true,
			Top : 0.4,
			Left : 0,
			Width : 5.64,
			Height : 0.79
		}
	};
	var  gridReport={}
	var controlWidthList,gridWidth;
	var header = {
		title : {
			font : {
				Bold : true,
				Point : 16.0
			}
		},
		height : '2',
		controls : [{
					id : 'title',
					name : '报表标题',
					type : 'title',
					control : 'StaticBox',
					needValue : false,
					center : 1,
					valueWidth : 4.5
				}, {
					id : 'condition',
					name : '查询单位',
					needValue : true,
					valueWidth : 1.2,
					type : 'condition',
					control : 'StaticBox',
					option : {
						target : 'title',
						position : 'y'
					},
					exp : '[title]'
				}, {
					id : 'condition1',
					name : '时间',
					needValue : true,
					valueWidth : 1.2,
					type : 'condition',
					control : 'StaticBox',
					option : {
						target : 'condition',
						position : 'x'
					},
					exp : '[title]'
				}]
	};

	/* 打印列的参数
	 */
	var reportGrid = {
		titleHeight : '',
		contentHeight : 0.78
	};

	/**
	 * 对齐方式
	 */
	var textAlign = {
		left : 33,
		right : 36,
		center : 34
	};
	/**
	 * 设置打印策略
	 */
	var printAdaptMethod={
			grcpamToNewPageRFCEx:8,
			grcpamToNewPageRFC:7,
			grcpamToNewPageEx:6,
			grcpamResizeToFit :3,
			grcpamShrinkToFit:4
	};
	var staticFont = "微软雅黑";
	// 每个控件之间的水平分割距离
	var splitdistance = 0.3;
	var paperWidth = 21;
	 /**
		 * 生成网格模板
		 */
		
return {
	// 获取网格数据，并根据绑定格式化事件 格式化
	getGridData:function (gridId) {
		var dataObj = [];
		if($A("#" + gridId).data("grid")){
			var model = $A("#" + gridId).grid("getColumns");
			var fn = this.getFormatterColumn(model);
			var layer = model.center.length ;
			dataObj = $A("#" + gridId).grid('getAllData');
			
			// 添加当前页合计行数据
			var currPagefooter = $A("#" + gridId).grid("getSummaryRow");
			if(currPagefooter){
				dataObj.push(currPagefooter) ;
			}			
			// 添加总合计行数据
			var footer = $A("#" + gridId).grid('getFooterRows');
			if(footer&&footer.length>0){
				for(var k in footer){
					dataObj.push(footer[k]) ;
				}
			}
			// /对所有数据进行格式化
			for (var i in dataObj) {
				var od = dataObj[i];
				if (fn.length > 0) {
					for (var j = 0; j < fn.length; j++) {
						var fun = fn[j].formatter;
						od[fn[j].field] = fun.call(this, od[fn[j].field], null, od,"print");
						od.rowdata = od;
					}
				}
			}			

			
		}else{
			// /载入数据
			var IDS = $A("#" + gridId).bsgrid("getDataIDs");
			var model = $A("#" + gridId).bsgrid("getGridParam", "colModel");
			var fn = this.getFormatterColumn(model);
			
			for (var i = 0; i < IDS.length; i++) {
				var od = $A("#" + gridId).bsgrid("getRowData", IDS[i]);
				// 判断这个对象中那一列的数据需要进行格式化的
				// alert(od.fcode);
				dataObj.push(od);
			}
			

			// /添加后台返回的总合计行数据
			var footer = $A("#" + gridId).bsgrid("getGridParam", "footerrow");
			if(footer&&footer.length>0){
				dataObj.push(footer) ;
			}
			// /对所有数据进行格式化
			for (var i in dataObj) {
				var od = dataObj[i];
				if (fn.length > 0) {
					for (var j = 0; j < fn.length; j++) {
						var fun = fn[j].formatter;
						od[fn[j].field] = fun.call(this, od[fn[j].field], null, od,"print");
						od.rowdata = od;
					}
				}
			}
		}
		return dataObj;
	},
	mergeDataOfOldGrid:function(columnStyle, colNames, gridWidth) {
		var styleObj = [];
		styleObj.countField = [];// 记录统计字段
		// /判断当前column 是否存在操作列，获取操作列的宽度
		var ope_width = 0;// 操作列宽度
		for (var j = 0; j < columnStyle.length; j++) {
			if (columnStyle[j].name == "operation") {
				ope_width += columnStyle[j].width;
			}
		}
		if (columnStyle != null && columnStyle.length > 0) {
			for (var i = 0; i < columnStyle.length; i++) {
				if (!columnStyle[i].hidden
						&& $.trim(columnStyle[i].index).length > 0) {
					var obj = {};
					// 宽度单位转换
					if (columnStyle[i].width > 17) {
						obj.width = columnStyle[i].width - 17;// columnStyle[i].width/(gridWidth-ope_width);//获取比例
					} else {
						obj.width = columnStyle[i].width;
					}
					// 按比例计算
					obj.summaryType = columnStyle[i].summaryType;
					obj.controlType = columnStyle[i].summaryType
							? "SummaryBox"
							: "MemoBox";
					obj.name = colNames[i];
					obj.id = columnStyle[i].index;
					obj.align = textAlign[columnStyle[i].align];
					styleObj.push(obj);
				}
			}
		}
		return styleObj;
	},
	/**
	 * 获取网格对象信息，包括 列名-字段名 值
	 * Modify by C.j.b  2015-09-16 修改兼容新网格
	 */
	getGridObjDetail:function (gridId) {
		var gridObj = $A("#" + gridId);
		// 获取网格每个列的样式，包括长度，是否显示，field
		var columnStyle = undefined; // 网格列样式
		var colNames = undefined; // 获取网格显示列明
		var gridWidth = undefined; // 网格列宽度
		var data = undefined ;
		//如果是旧网格。就用旧网格的取数方法
		if (!gridObj.data('grid')) {
			columnStyle = gridObj.bsgrid("getGridParam", "colModel");
			colNames = gridObj.bsgrid("getGridParam", "colNames");
			gridWidth = gridObj.bsgrid("getGridParam", "width");
			data = this.mergeDataOfOldGrid(columnStyle, colNames, gridWidth);
		} else {
			var gridColumns = gridObj.grid("getColumns") ;
			var layer = 0 ;
			if(gridColumns){
				layer = gridColumns.center.length ;
				columnStyle = gridColumns.center[layer-1];
				var columnLeft = gridColumns.left[layer-1] ;
				var columnRight = gridColumns.right[layer-1] ;
//				for(var n=0;n<columnLeft.length;n++){
//					columnStyle.push(columnLeft[n]) ;
//				}
//				for(var n=0;n<columnRight.length;n++){
//					columnStyle.push(columnRight[n]) ;
//				}		
				var mergeData = columnLeft.concat(columnStyle);  
				mergeData = mergeData.concat(columnRight);
				//Array.prototype.push.apply(columnLeft,columnStyle,columnRight) ;
//				colNames = gridObj.bsgrid("getGridParam", "colNames");
//				gridWidth = gridObj.bsgrid("getGridParam", "width");	
				data = this.mergeDataOfNewGrid(mergeData) ;
				
			}
		}
		/**
		 * 获取合并后的数据
		 */
		return data;
	},
	/**
	 * 处理新网格数据集
	 */
	mergeDataOfNewGrid:function (columnStyle){
		var styleObj = [];
		styleObj.countField = [];// 记录统计字段
		// /判断当前column 是否存在操作列，获取操作列的宽度
		var ope_width = 0;// 操作列宽度
		for (var j = 0; j < columnStyle.length; j++) {			
			//操作列，序号列
			if (columnStyle[j].sysCol == true) {
				ope_width += columnStyle[j].width;
			}
		}
		
		if (columnStyle != null && columnStyle.length > 0) {
			for (var i = 0; i < columnStyle.length; i++) {
				if (!columnStyle[i].hidden
						&& !columnStyle[i].sysCol) {
					var obj = {};
					// 宽度单位转换
					if (columnStyle[i].width > 17) {
						obj.width = columnStyle[i].width - 17;// columnStyle[i].width/(gridWidth-ope_width);//获取比例
					} else {
						obj.width = columnStyle[i].width;
					}
					// 按比例计算
					obj.summaryType = columnStyle[i].summaryType;
					obj.controlType = columnStyle[i].summaryType
							? "SummaryBox"
							: "MemoBox";
					obj.name = columnStyle[i].title;
					if(columnStyle[i].id)
						obj.id = columnStyle[i].id;						
					else
						obj.id = columnStyle[i].field;
					obj.align = textAlign[columnStyle[i].align];
					if(columnStyle[i].sysCol)
						obj.sysCol = true;
					else
						obj.sysCol = false ;
					styleObj.push(obj);
				}
			}
		}
		return styleObj;
	},
	getColorValue:function (r,g,b){
	  return r + g*256 + b*256*256;
	} 	,
	convertToCm:function (width) {
		var bili = 1 / 28.346;
		return width * bili;
		},
	 	/**
	 * 判断是否需要添加网格头为自由格
	 */
	isNeedSetFree:function (groups, viewPaper) {
		var titleControl = {};
		var length = 0;
		var preLen = 0;

		if (groups != null && groups.length > 0) {

			for (var i = 0; i < groups.length; i++) {
				titleControl[groups[i].name] = [];
				preLen += length;
				length = 0;
				if (groups[i].headers != null && groups[i].headers.length > 0) {
					for (var h = 0; h < groups[i].headers.length; h++) {

						length += this.convertToCm(groups[i].headers[h].width - 17);
						if ((length + preLen) > viewPaper) {
							length = length
									- this.convertToCm(groups[i].headers[h].width
											- 17);
							h--;
							if (length > 0) {
								var obj = {
									width : length,
									title : groups[i].titleText
								};
								titleControl[groups[i].name].push(obj);
							}
							length = 0;
							preLen = 0;
						}
					}
				}

				// /第二页标题行网格列的设置
				if (length > 0) {
					var obj = {
						width : length,
						title : groups[i].titleText
					};
					titleControl[groups[i].name].push(obj);
				}

			}
		}

		return titleControl;
	},

	 	
	 	/**
	 * 生成统计控件
	 * 
	 * @Param 数据集合
	 * @reportFooter 容器
	 * @sumTitle 统计标题
	 * @args 统计字段
	 */
	setGroupCountControl:function (data, reportFooter, sumTitle, args) {

		var defaultTitle = $.extend({
					name : '合计'
				}, sumTitle);
		var footSumary = {};
		var pos = 0;
		for (var i = 0; i < data.length; i++) {
			footSumary[i] = this.controlFactory(reportFooter.Footer, i == 0
							? "MemoBox"
							: data[i].controlType);
			// //设置大小，以及位置
			footSumary[i].Height = 0.58;
			footSumary[i].Left = pos;
			footSumary[i].Width = data[i].realWidth;
			pos += data[i].realWidth;
			footSumary[i].Font.Name = "微软雅黑";// 设置内容格字体
			footSumary[i].Font.Point = 11;// 设置内容格字体大小
			// /设置首列标题
			if (i == 0) {
				footSumary[i].Text = defaultTitle.name;
				footSumary[i].TextAlign = textAlign.center;
			} else {
				// 如果该列需要统计,绑定统计字段
				if (data[i].summaryType) {
					footSumary[i].DataField = data[i].id;
					footSumary[i].Format = '#,##0.00';
					footSumary[i].TextAlign = data[i].align;
				}
			}

		}
	},
	 	/**
		 * @type 控件类型
		 */
	controlFactory:function (reportheader, type) {
		// var obj=reportheader.Footer||reportheader
		// var factory={
		// StaticBox:obj.Controls.Add(1).AsStaticBox,
		// MemoBox:obj.Controls.Add(8).AsMemoBox,
		// SystemVarBox:obj.Footer.Controls.Add(3).AsSystemVarBox,
		// SummaryBox:obj.Footer.Controls.Add(5).AsSummaryBox
		// };
		// return factory[type];
		if (type == "StaticBox") {
			return reportheader.Controls.Add(1).AsStaticBox;
		}
		if (type == "MemoBox") {
			return reportheader.Controls.Add(8).AsMemoBox;
		}
		if (type == "SystemVarBox") {
			return reportheader.Controls.Add(3).AsSystemVarBox;
		}
		if (type == "SummaryBox") {
			return reportheader.Controls.Add(5).AsSummaryBox;
		}
	},
	 	 setFreeControl:function(report, viewPaper, rs) {
		// 清空自由格控件
		for (var i in rs.freeControls) {
			var controls = rs.freeControls[i];
			for (var j = 0; j < controls.length; j++) {
				controls[j].TitleControl.Visible = false;
			}
		}
		var titleControl = this.isNeedSetFree(rs.grouper, viewPaper);
		for (var i in rs.columnTitles) {
			var ColumnTitleCell1 = rs.columnTitles[i];
			ColumnTitleCell1.Controls.RemoveAll();
			if (titleControl[i] != null && titleControl[i].length > 0) {
				var freeControl = [];
				for (var j = 0; j < titleControl[i].length; j++) {
					var _title_control = this.controlFactory(ColumnTitleCell1,
							"MemoBox");
					// //设置控件的宽度

					_title_control.Width = titleControl[i][j].width;
					_title_control.Text = titleControl[i][j].title;
					_title_control.Name = i + j;
					_title_control.TextAlign = textAlign.center;
					_title_control.Height = ColumnTitleCell1.Height;
					if (titleControl[i][j - 1]) {
						_title_control.Left = titleControl[i][j - 1].width;
					}

					var pj = {};
					pj.ColumnTitleCell1 = ColumnTitleCell1;
					pj.TitleControl = _title_control;
					freeControl.push(pj);
				}
				rs.freeControls[i] = freeControl;
			}
		}
		// report.SaveToFile("d:\\Program2.grf");
		return rs;
	},
	/**
	 * 获取colmodel中需要进行格式化的
	 */
	getFormatterColumn:function (clmodel) {
		var len = clmodel.length ;
		var fn = [];
		if(clmodel.center&&clmodel.center.length>0){
			len = clmodel.center.length ;
			for (var i = 0; i < clmodel.center[len-1].length; i++) {
				if (clmodel.center[len-1][i].formatter
						&& typeof(clmodel.center[len-1][i].formatter) == "function") {
					var obj = new Object();
					obj.field = clmodel.center[len-1][i].field;
					obj.formatter = clmodel.center[len-1][i].formatter;
					fn.push(obj);
				}
			}				
		}else{
			for (var i = 0; i < clmodel.length; i++) {
				if (clmodel[i].formatter
						&& typeof(clmodel[i].formatter) == "function") {
					var obj = new Object();
					obj.field = clmodel[i].name;
					obj.formatter = clmodel[i].formatter;
					fn.push(obj);
				}
			}			
		}
			
		

		return fn;
	}
	,
	 	/**
		 * 设置网格报表数据
		 */
	 setGridReportData:function(report, dataobj, column) {
		report.PrepareRecordset();
		for (var i = 0; i < dataobj.length; i++) {
			report.DetailGrid.Recordset.Append();
			for (var j in column) {
				// 设置对齐方式
				if(dataobj[i][column[j]])
					report.FieldByName(column[j]).AsString = dataobj[i][column[j]];

			}
			report.DetailGrid.Recordset.Post();
		}

	},
		/**
	 * @controls 所有控件集合
	 * @curIndex 当前要运算的索引
	 */
	getAutoLayOut:function (controls, curIndex, gridId, type) {
		var curCtrol = controls[curIndex];
		var preCtrol = controls[curIndex - 1];
		// 设置对照对象
		curCtrol.option.target = preCtrol.id;
		// 判断布局方式
		width =this.getControlSpace(gridReport, preCtrol, curCtrol, gridId, type);
		if (parseFloat(width) > parseFloat(21)) {
			curCtrol.option.position = "y";
			if (curIndex > 2) {
				curCtrol.option.target = getReferToObjectFlag(gridReport,
						controls, curIndex);
				curCtrol.option.linefeed = true;
			}
		} else {
			curCtrol.option.position = "x";
		}

	},
	/**
	 * 设置一个属性的控件属性
	 * 
	 * @target 相对定位的对照对象
	 * @option 默认配置
	 */
	setControlOption:function (control, option, controls, index, valueField,
			gridId, type) {
		var posoption = null;
		var center = null;
		var controlOption = null;
		// 获取参照对象的位置信息
		var target_x = null;
		var target_y = null;
		if ("value" == type) {
			word = controls[index].value[valueField];
		} else {
			word = controls[index][valueField];
		}
		if (controls[index].option != null) {
			posoption = controls[index].option;
		}
		center = controls[index].center;
		controlOption = controls[index];
		// 如果position为auto ,则判断一下当前控件需要采取的排列方式

		if (posoption != null && posoption.position == "auto") {
			this.getAutoLayOut(controls, index, gridId, type);
		}
		if (posoption != null && posoption.target != null
				&& $.trim(posoption.target).length > 0) {

			var targetoption = null;
			if (posoption.linefeed) {
				targetoption = gridReport[posoption.target];
			} else {
				targetoption = gridReport[posoption.target + "_value"];
			}
			if (targetoption == control || targetoption == null) {
				targetoption = gridReport[posoption.target];
			}
			// 判断当前控件所要采取的控件定位方式
			var pos = posoption.position.split(",");

			for (var i = 0; i < pos.length; i++) {
				var style = pos[i];
				if (style == "x") {
					if (controlOption != null && controlOption.needSplit
							&& type != "value") {
						target_x = targetoption.Left + targetoption.Width
								+ splitdistance;
					} else {
						target_x = targetoption.Left + targetoption.Width
					}
					// 获取是否该控件存在对应的值框

				}
				if (style == "y") {
					target_y = targetoption.Top + targetoption.Height + 0.2;
				}
				if (target_y == null) {
					target_y = targetoption.Top;
				}
				if (target_x == null) {
					target_x = targetoption.Left;
				}
			}
		}

		if (target_x == null) {
			control.Left = option.Left;
		} else {
			control.Left = target_x;
		}
		if (target_y == null) {
			control.Top = option.Top;
		} else {
			control.Top = target_y;
		}
		var width;
		// 如果用户有设置，值显示的宽度，则取用户设置的，否则，计算文字所占的虚拟空间
		if (controlOption != null && controlOption.valueWidth != null
				&& 'title' == type) {
			width = controlOption.valueWidth;
		} else {
			width = this.getVirualWidth(word, type);

			if (controlOption != null && "value" == type) {
				var _width = this.getReportControlWidth(controlOption.id, gridId);
				width = width > _width ? width : _width;
				if (controlOption.valueWidth != null)
					width = parseFloat(controlOption.valueWidth);
			}

			// 判断当前控件是否填满一行

		}
		control.Width = width + 0.1;
		control.Height = option.Height;

	},
	getGridWidth:function (gridId) {
		var gridObj = $A("#" + gridId);
		var gridWidth = 21 ;
		if(gridObj.data("grid")){
			var parent = gridObj.parent() ;
			gridWidth = parent.width() ;
		}else
			gridWidth = gridObj.bsgrid("getGridParam", "width");
		return gridWidth;
	},
		/**
	 * 获取指定控件在报表上的真实宽度，以厘米计算
	 */
	getReportControlWidth:function (id, gridId) {
		// 获取网页网格的宽度
	
		var controlWidth = controlWidthList[id]
		var bili = controlWidth / gridWidth;
		return bili * paperWidth;
	},
	/**
	 * 获取这端文字在网页上所能显示出来的所需要的宽度
	 */
	getVirualWidth:function (word, type) {
		var span = $("<span id='virtualWidth' style='display:none,font-family:微软雅黑'></span>");

		if ("value" == type) {
			span.css("fontSize", "10.5px");
		}
		span.html($.trim(word));
		$("body").append(span);
		var width = span.width();
		width = this.convertToCm(width);
		span.remove();
		return width;
	},
	/**
	 * @gridReport 已经转成锐浪控件的对象
	 * @curControl 要计算的控件
	 */
	 getControlSpace:function(gridReport, preControl, curControl, gridId, type) {
		// 如果用户有设置，值显示的宽度，则取用户设置的，否则，计算文字所占的虚拟空间
		// 先计算标签控件
		if (curControl != null && curControl.valueWidth != null) {
			width = curControl.valueWidth;
		} else {
			width = this.getVirualWidth(word, type);

		}
		// 计算值控件
		if (curControl != null)
			width = parseFloat(this.getReportControlWidth(curControl.id, gridId))
					+ parseFloat(width);

		// /判断当前这个坐标会不会超出页面
		var _control = null;
		if (preControl.needValue) {
			_control = gridReport[preControl.id + "_value"];
		} else {
			_control = gridReport[preControl.id];
		}
		return (parseFloat(_control.Left) + parseFloat(_control.Width) + parseFloat(width))

	},
	 	/**
		 * 生成网格报表底
		 */
		setGridreportFooter:function (report, grid) {
				// 报表尾放的数据只有当前页码
				var pg = report.InsertPageFooter();
				report.PageFooter.Height = 0.6;
				var Reportfoot = report.InsertReportFooter();
				Reportfoot.Height = 0.2;
				gridReport["page"] = this.controlFactory(pg, "MemoBox");
				gridReport["page"].Width = 2.6;
				gridReport["page"].Height = 0.6;
				gridReport["page"].Center = 1;
				gridReport["page"].Font.Name = staticFont;
				gridReport["page"].TextAlign = textAlign.center;
				gridReport["page"].Text = '[#SystemVar(PageNumber)#]/[#SystemVar(PageCount)#]';

			},

			/**
			 * 生成网格报表头
			 */
			setGripReportHead:function (report, options, gridId) {
				
				gridReport={};
				controlWidthList={};
				var option = $.extend({}, header, options);

				gridWidth = this.getGridWidth(gridId);
				for (var i = 0; i < option.controls.length; i++) {
					var id=option.controls[i].id;
					if ($A("#" + id).length>0){
						controlWidthList[id]= $A("#" + id).parent().width();
					}
				}
				report.InsertPageHeader();
				report.PageHeader.Height = 0.11;
				
				report.Printer.PaperName = 'A3';
				report.Printer.LeftMargin = 1 ;
				report.Printer.RightMargin = 1 ;
				report.Printer.TopMargin = 1 ;
				report.Printer.BottomMargin = 1 ;			
				
				var option = $.extend({}, header, options);
				var Reportheader = report.InsertReportHeader();
				Reportheader.Height = option.height;
				Reportheader.RepeatOnPage = true;// 每页重复打印
				for (var i = 0; i < option.controls.length; i++) {

					gridReport[option.controls[i].id] = this.controlFactory(Reportheader,option.controls[i].control);
					gridReport[option.controls[i].id].Text = option.controls[i].name;

					// 设置字体 和文字大小
					gridReport[option.controls[i].id].Font.Name = staticFont;
					gridReport[option.controls[i].id].Font.Point = 11;
					if (option.controls[i].center != null) {
						gridReport[option.controls[i].id].Center = option.controls[i].center;
					} else {
						gridReport[option.controls[i].id].Center = 0;
					}
					// 判断该控件是否有定义字体属性
					if (option.controls[i].type == "title") {
						// gridReport[option.controls[i].id].Font.Bold=option.title.font.Bold;
						gridReport[option.controls[i].id].Font.Name = staticFont;
						// 设置文字间隔
						gridReport[option.controls[i].id].CharacterSpacing = 600;
						gridReport[option.controls[i].id].Font.Point = option.title.font.Point;
						option.controls[i].valueWidth = paperWidth;
						gridReport[option.controls[i].id].TextAlign = textAlign.center;
					}else{
				   	        gridReport[option.controls[i].id].Width = option.controls[i].name.length * 1 ;		   	 
					  }
					if (option.controls[i].option != null) {// 开发人员未设置
						var cur_option = $.extend(true,{},initControllerOption[option.controls[i].control]);
						this.setControlOption(gridReport[option.controls[i].id], cur_option,
								option.controls, i, "name", gridId,
								option.controls[i].type);
					} else {
						// 使用我们默认的参数
						var cur_option = $.extend(true,{},initControllerOption[option.controls[i].control]);
						this.setControlOption(gridReport[option.controls[i].id], cur_option,
								option.controls, i, "name", gridId,
								option.controls[i].type);

					}
					// 根据
					if (option.controls[i].needValue) {// 如果该控件需要创建一个对应的值控件
						var cur_option = initControllerOption[option.controls[i].control];
						cur_option.Width = cur_option.Width * 1.5 ;
						gridReport[option.controls[i].id + "_value"] = this.controlFactory(Reportheader, option.controls[i].control);
						gridReport[option.controls[i].id + "_value"].DataField = option.controls[i].exp;
						gridReport[option.controls[i].id + "_value"].BorderWidth = 1;
						gridReport[option.controls[i].id + "_value"].BorderStyles = 8;
						gridReport[option.controls[i].id + "_value"].Font.Name = staticFont;
						gridReport[option.controls[i].id + "_value"].Font.Point = 10;
						// gridReport[option.controls[i].id+"_value"].ShrinkFontToFit=true;
						option.controls[i].option = {
							target : option.controls[i].id,
							position : 'x'
						};
						// 设置改值对应的属性信息
						this.setControlOption(gridReport[option.controls[i].id + "_value"],cur_option, option.controls, i, option.controls[i].exp,gridId, "value");
						if (option.controls[i].value[option.controls[i].exp] != null) {
							gridReport[option.controls[i].id + "_value"].Text = option.controls[i].value[option.controls[i].exp];
						}
					}

					// 如果当前操作的是最后一个，则通过最后一个，算出报表头的高度
					if ((i == option.controls.length - 1) && option.controls.length > 1) {
						var y = gridReport[option.controls[i].id + "_value"].Top;
						var height = gridReport[option.controls[i].id + "_value"].Height;
						var realHeight = y + height + 0.35;
						Reportheader.Height = realHeight;
					} else {
						var y = gridReport[option.controls[i].id].Top;
						var height = gridReport[option.controls[i].id].Height;
						var realHeight = y + height + 0.35;
						Reportheader.Height = realHeight;
					}

				}

			},getNewGridGroupColumns:function (headerGroup){
			var group = [];
			if(headerGroup&&headerGroup.length>0){
					for(var j=0 ;j<headerGroup.length;j++){
						
							var _groupHeader = {};
							var k = 0;
							var colSpan = headerGroup[j].colspan==null ? 1 : headerGroup[j].colspan;
							var startColumnName = headerGroup[j].id;
							_groupHeader.name = "bsGroup" + j;
							_groupHeader.numberOfColumns = colSpan;
							_groupHeader.startColumnName = startColumnName;
							_groupHeader.titleText = headerGroup[j].title;
							_groupHeader.headers = [];

							if(headerGroup[j].children){
									var childs = headerGroup[j].children ;
									for (var n=0; n <childs.length;n++) {													
											var itemChild = childs[n] ;
											if(!itemChild.sysCol){
													if(itemChild.children){
															var header = getNewGridGroupColumns(itemChild);
															//header.name = childs[n].id;
															//header.width = childs[n].width;
															_groupHeader.headers.push(header);		
													}else{
															var header = {};
															header.name = childs[n].id;
															header.width = childs[n].width;
															_groupHeader.headers.push(header);		
													}
											}								
									}
							}
							group.push(_groupHeader);
					}						
			}
			return group ;
	},
			/**
	 * 获取双网格头的分组情况,即一级网格头下面 有几个二级网格头
	 */
	getGroupColumns:function (gridId) {
		var group = [];
		if($A("#" + gridId).data("grid")){
				var columns = $A("#" + gridId).grid("getColumnTree") ;
				group = this.getNewGridGroupColumns(columns) ;
		}else{
			var model = $A("#" + gridId).bsgrid("getGridParam", "colModel");
			var groupHeader = $A("#" + gridId).bsgrid("getGridParam","gridheadersCfg");	
			for (var j = 0; j < groupHeader.groupHeaders.length; j++) {
				var _groupHeader = {};
				var k = 0;
				var colSpan = groupHeader.groupHeaders[j].numberOfColumns;
				var startColumnName = groupHeader.groupHeaders[j].startColumnName;
				_groupHeader.name = "bsGroup" + j;
				_groupHeader.numberOfColumns = colSpan;
				_groupHeader.startColumnName = startColumnName;
				_groupHeader.titleText = groupHeader.groupHeaders[j].titleText;
				_groupHeader.headers = [];
	
				var i = 0;
				for (; i < model.length; i++) {
					if (model[i].name == startColumnName) {
						k = i + colSpan;
						break;
					}
				}
				// i=i-1;
				for (; i < k; i++) {
					if (!model[i].hidden) {
						var header = {};
						header.name = model[i].name;
						header.width = model[i].width;
						_groupHeader.headers.push(header);
					}
				}
				group.push(_groupHeader);
			}
		}

		return group;

	},
		 /**
			 * 生成网格模板
			 */
		    setGridReportMain:function(report, gridId, opt) {
				// 是否新网格
				var isNewGrid = false ;
				if($A("#"+gridId).data("grid"))
					isNewGrid = true ;
					
				// /网格列显示有效宽度

				report.Printer.PaperName = 'A3';
				
				var printer = report.Printer;
				report.Printer.LeftMargin = 1 ;
				report.Printer.RightMargin = 1 ;
				report.Printer.TopMargin = 1 ;
				report.Printer.BottomMargin = 1 ;		
				var viewPaper = paperWidth - printer.LeftMargin - printer.RightMargin;
				var rs = {
					multitle : false
				};
				rs.freeControls = {};// 自由格控件
				rs.columnTitles = {};
				report.InsertDetailGrid();
				report.DetailGrid.ColumnTitle.Height = 0.48 * 2;
				report.DetailGrid.ColumnTitle.Font.Name = "微软雅黑";// 设置内容格字体
				report.DetailGrid.ColumnTitle.Font.Point = 11;// 设置内容格字体大小
				report.DetailGrid.ColumnTitle.RepeatStyle = 2;// 标题行每页重复打印
				report.DetailGrid.ColumnContent.Height = reportGrid.contentHeight;// 设置内容格高度

				report.DetailGrid.ColumnContent.Font.Name = "微软雅黑";// 设置字体
				report.DetailGrid.ColumnContent.Font.Point = 10;// 设置文字大小
				report.DetailGrid.PrintAdaptMethod = printAdaptMethod.grcpamToNewPageRFCEx;// 设置打印策略

				report.DetailGrid.ColumnTitle.BackColor=this.getColorValue(224, 224, 224) ;
				
				report.DetailGrid.ColumnTitle.CanGrow = true ;
				report.DetailGrid.ColumnTitle.CanShrink = true ;
				report.DetailGrid.ColumnTitle.WordWrap=true;// 文字超出折行
					  
				report.DetailGrid.ColumnContent.Height = reportGrid.contentHeight;// 设置内容格高度

// report.DetailGrid.PrintAdaptFitText = true ;
				report.DetailGrid.PrintAdaptMethod= printAdaptMethod.grcpamShrinkToFit  ;// printAdaptMethod.grcpamToNewPageRFCEx;//设置打印策略
				
				var RecordSet = report.DetailGrid.Recordset;
				var data = this.getGridObjDetail(gridId);

				// 定义数据集
				for (var i = 0; i < data.length; i++) {			
					RecordSet.AddField(data[i].id, 1);		
				}
				var column = [];
				//
				for (var i = 0; i < data.length; i++) {
					// 去掉操作列
					if(isNewGrid){
						if (data[i].sysCol)
							break;
					}else
						if ("operation" == data[i].id)
							break;
					// 表格每个单元格的宽度
					var cellwidth = this.convertToCm(data[i].width);// data[i].width*paperWidth;
					// 记录网格单元的宽度
					data[i].realWidth = cellwidth;
					gridReport[data[i].id + "_column"] = report.DetailGrid.AddColumn(
							data[i].id, data[i].name, data[i].id, cellwidth);
					var columns = gridReport[data[i].id + "_column"];
					// 设置标题行属性
					var titleCell = columns.TitleCell;
					titleCell.TextAlign = textAlign.center;
					titleCell.WordWrap = true;// 文字超出折行
					titleCell.CanGrow = true;// 行高可伸展
					// 设置内容行属性
					var cell = columns.ContentCell;
					cell.TextAlign = data[i].align;
					cell.WordWrap = true;// 文字超出折行
					cell.CanGrow = true;// 行高可伸展
					column.push(data[i].id);
				}

				// /判断网格是否需要分组
				var groupHeader = undefined ;
				if(isNewGrid){
					// 新网格是否有头部分组的判断
					groupHeader = $A("#" + gridId).grid("getColumnTree");
					// 判断如果网格头的列数小于最底行的列数。就是有多行网格头
					if(groupHeader.length ==column.length)
						groupHeader = null ;
					
				}else
					   groupHeader = $A("#" + gridId).bsgrid("getGridParam","gridheadersCfg");
				

				if (groupHeader != null) {
					rs.multitle = true;
					report.DetailGrid.ColumnTitle.Height = opt.grid.titleHeight;			
					var grouper = this.getGroupColumns(gridId);
					for (var i = 0; i < grouper.length; i++) {
						var ColumnTitleCell1 = report.DetailGrid.AddGroupTitle(
								grouper[i].name, grouper[i].titleText);
						ColumnTitleCell1.TextAlign = textAlign.center;
						ColumnTitleCell1.Height = 1.0;
						// /判断是否需要添加自由格属性,适用于双层网格头，超出单页，而新叶不显示网格头
						var titleControl = this.isNeedSetFree(grouper, viewPaper);
						rs.grouper = grouper;
						if (titleControl[grouper[i].name] != null
							&& titleControl[grouper[i].name].length > 0) {
							// /设置双网格头 标题控件
							ColumnTitleCell1.FreeCell = true;// /设置为自由格
							var freeControl = [];
							for (var j = 0; j < titleControl[grouper[i].name].length; j++) {
								var _title_control = this.controlFactory(ColumnTitleCell1,
										"MemoBox");
								// 设置控件的宽度
								_title_control.Width = titleControl[grouper[i].name][j].width;
								_title_control.Text = grouper[i].titleText;
								_title_control.Name = grouper[i].name + j;
								_title_control.TextAlign = textAlign.center;
								_title_control.Height = ColumnTitleCell1.Height;
								if (titleControl[grouper[i].name][j - 1]) {	
									_title_control.Left = titleControl[grouper[i].name][j	- 1].width;
								}
								var pj = {};
								pj.ColumnTitleCell1 = ColumnTitleCell1;

								pj.TitleControl = _title_control;
								freeControl.push(pj);
							}
							rs.freeControls[grouper[i].name] = freeControl;
						}
						// 添加这个组下面的标题
						for (var j = 0; j < grouper[i].headers.length; j++) {
							if(grouper[i].headers.headers.length>1){
								for(var k = 0; k < grouper[i].headers.headers.length; k++){
								
								}
							}else
								ColumnTitleCell1.EncloseColumn(grouper[i].headers[j].name);
						}
						rs.columnTitles[grouper[i].name] = ColumnTitleCell1;
					}	
				}
				if($A("#" + gridId).data("grid")){
				
					
				}else{
					// /判断是否进行分组计算
					var _groupingView = $A("#" + gridId).bsgrid("getGridParam",
							"groupingView");
					var _groups = _groupingView.groups;
					if (_groups != null && _groups.length > 0) {
						var field = "";
						for (var _i = 0; _i < _groups.length; _i++) {
							field += _groups[_i].dataIndex + ";";
						}
						var groupIndex = report.DetailGrid.Groups.Add();
						groupIndex.Header.Height = 0;
						groupIndex.ByFields = field;
						groupIndex.Footer.Height = reportGrid.contentHeight;
			
						// /根据网格的宽度 创建统计控件，同时，控件在合适的位置
						this.setGroupCountControl(data, groupIndex);
					}
					// /添加所有记录分组
					var footer = $A("#" + gridId).bsgrid("getGridParam", "footerrow");
					if (footer) {
						var groupIndex = report.DetailGrid.Groups.Add();
						groupIndex.Header.Height = 0;
						groupIndex.Footer.Height = reportGrid.contentHeight;
						this.setGroupCountControl(data, groupIndex);
					}
				}

				
				// /载入数据
				var dataobj =this. getGridData(gridId);
				this.setGridReportData(report, dataobj, column);
				// report.SaveToFile("d:\\Program2.grf");
				return rs;
			}
	 }
	 
	 
 })