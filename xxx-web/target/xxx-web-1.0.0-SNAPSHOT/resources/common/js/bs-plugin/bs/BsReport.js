/**
 * 
 */

define(["app/app-base","bs-plugin/Env","bs-plugin/bs/GrPrint","bs-plugin/bs/BsNetCtl","bs-plugin/bs/GrPrintViewer","bs-plugin/bs/GrPrintDesigner","bs-plugin/bs/BsGridPrint"],function(Base,Env,GrPtrint,BsNetCtl,GrPrintViewer,GrPrintDesigner,BsGridPrint){
	BsReport=Base.extend({
		propsInAttrs: ['downLoadUrl','queryTempleteUrl', 'queryTemplistUrl', 'printTemplateUrl',"gridPrintTemplateurl","subReportCofnig"],
		downLoadUrl: '',
		queryTempleteUrl: '',
		queryTemplistUrl :'',
		printTemplateUrl:'',
		gridPrintTemplateurl:'',
		subReportCofnig:{"sub1":{dataUrl:''},sub2:{dataUrl:''}},
		bsNetCtl:null,
		grPtrint:null,
		grPrintDesigner:null,
		GrPrintViewer:null,
		initialize : function(cfg){
			BsReport.superclass.initialize.apply(this, arguments);
			this.bsNetCtl=new BsNetCtl({downLoadUrl: this.downLoadUrl,
				queryTempleteUrl: this.queryTempleteUrl,
				queryTemplistUrl :this.queryTemplistUrl})
			this.grPtrint=new GrPtrint();
			//this.GrPrintViewer=new GrPrintViewer();
		}
		,getDefaultTemplateId:function(type){
		var menuId = $A.getCurrentNavTab().data("__menuid");
		if(!$('#_'+menuId+'_templateId').attr('_templateId')){
			//存本地默认模板ID
			var str = '<div id="_'+menuId+'_templateId" style="display:none;"></div>';
			$('body').append(str);
			// 获取模块id
			var moduleId = $('#_'+menuId+'_moduleId').attr('_moduleId');
			var defaultTemplateId = _bsNetFun.QueryDefaultTemplateId(moduleId,type);
			// 处理\\
			if(defaultTemplateId != null){ 
				defaultTemplateId = defaultTemplateId.replaceAll('\\\\\\\\','\\');
			}
			// 保存默认模板id本地
			$('#_'+menuId+'_templateId').attr('_templateId', defaultTemplateId);
		}
			return $('#_'+menuId+'_templateId').attr('_templateId');
		},
		/**
		 * 根据模板id(打印或预览)
		 * @param data 数据源data 
		 * @param templateId 模板id
		 * @param isPreview false 打印 true 预览 默认为false
		 */
		printByTemplateData : function(data, templateId, isPreview){
			// 此判断，待谷歌浏览器可使用后删除
			if (!Env.isIE) {
				$messager.warn("暂时只支持IE浏览器！");
				return;
			}
			if(data == null||data == ''){
				$messager.warn("请设置数据源data");
				return;
			}
			if(templateId == null||templateId == ''){
				templateId = this.getDefaultTemplateId();
			}
			if(isPreview == null||isPreview == ''){
				isPreview = false;
			}
			var tempId = templateId.replace("\"", "").replace("\"", "");
			if(tempId==null||$.trim(tempId).length==0){
				$messager.warn("未找到打印模板");
				 
				return;
			}
			appendTypeToUrl("?type=form");
			var templateUrl=this.bsNetCtl.getTempletePath(templateId);
			this.printbyLocal(templateUrl, data, isPreview);
			
		},
		 printbyLocal:function(LoadReportURL, data, isPreview, conf) {
			data = null;

			grPtrint.LoadFromURL(LoadReportURL);
			// 加载打印配置
			if (conf != null && conf != "undefined" && $.trim(conf).length > 0) {
				var setJson = eval("(" + conf + ")");
				this._setPrint(grPtrint.ctl, setJson);
			}
			try {
				// 加载数据
				if (data != null) {
					for (var i in data) {
						Report.ParameterByName(i).AsString = data[i]
					}
				}
			} catch (e) {
				$A.messager.warn("未找到打印字段");
				return;
			}
			if (!isPreview) {
				grPtrint.Print(true);
			} else {
				grPtrint.PrintPreview(true);
			}

		},
		 getFormPrintTemplate:function(moduleId) {
			var json = $.ajax({
						url : this.printTemplateUrl,
						async : false,
						data : {
							moduleId : moduleId
						},
						dataType : 'json',
						type : 'POST'
					}).responseText;
			return json;
		},
		getbillPrintTemplate:function(moduleId) {
			var json = $.ajax({
						url : this.printTemplateUrl,
						async : false,
						data : {
							batchCode : moduleId
						},
						dataType : 'json',
						type : 'POST'
					}).responseText;
			return json;
		},
		
		/**
		 * @moduleId 模块编号  
		 * @dataUrl 取数据的url
		 */
		showFormReportView:function(moduleId,dataUrl,conf,type,isCloseDlg,renderTo){
			
			var templateId= "" ;
			if(type==null){
			     templateId=this.getFormPrintTemplate(moduleId);
			     appendTypeToUrl("?type=form");
			}
			if(type=="bill"){
			     templateId=this.getBillPrintTemplate(moduleId);
			     appendTypeToUrl("?type=bill");
			}
			var tempId = templateId.replace("\"", "").replace("\"", "").replace("\"", "").replace("\"", "");
			
			if(tempId==null||$.trim(tempId).length==0){
				$messager.warn("未找到打印模板");				 
				return;
			}
			var templateUrl= "" ;
			try{
				templateUrl = this.grPtrint.getTempletePath(templateId);
			}catch(error){
				alert(templateId + '    [ERROR]'+error.message) ;
			}
	
			this._createViewReport(templateUrl,dataUrl,null)
			//printUtil.createViewReport(templateUrl,dataUrl,null);
			return tempId;//返回模板Id,共后面调用时使用
		},
		
	
		/**
		 * 根据模板id(打印或预览)
		 * @param dataUrl 数据源Url  
		 * @param templateId 模板id
		 * @param isPreview false 打印 true 预览 默认为false
		 */
		printByTemplateUrl : function(dataUrl, templateId, isPreview){
			
			// 此判断，待谷歌浏览器可使用后删除
			if (!Env.isIE) {
				$messager.warn("暂时只支持IE浏览器！");
				return;
			}
			if (dataUrl){
				if (typeof dataUrl=="string"){
					if(dataUrl == ''){
						$messager.warn("请设置数据源url");
						return;
					}
				}else if (dataUrl instanceof Array){
					if (dataUrl.length==0){
						$messager.warn("请设置子报表配置");
						return;
						
					}
					
				}else{
					$messager.warn("参数错误，数据源只能是String(单报表配置)/Array(多报表配置)");
					return;
				}
				
			}else{
				$messager.warn("请设置报表数据源url");
				return;
			}
			
			if (typeof dataUrl=="string")
			if(templateId == null||templateId == ''){
				templateId = _self.getDefaultTemplateId();
			}
			if(isPreview == null||isPreview == ''){
				isPreview = false;
			}
			var tempId = templateId.replace("\"", "").replace("\"", "");
			 
			if(tempId==null||$.trim(tempId).length==0){
				$A.messager.warn("未找到打印模板!");
				return;
			}
			this._appendTypeToUrl("?type=form");
			var templateUrl=this.bsNetCtl.getTempletePath(templateId);
			this.printUrl(templateUrl, dataUrl, isPreview);
		},
		/**
		 * 过滤json数据，若出现undefined则用" "代替
		 */
		 jsonObjectFilter:function(data) {
			for (var i in data) {

				if (typeof(data[i]) == "string") {
					if (data[i] == null || $.trim(data[i]).length == 0) {
						data[i] = "";
					}
				}
				if (typeof(data[i]) == "object" && data[i] != null) {
					this.jsonObjectFilter(data[i]);
				}
				if (data[i] == null) {
					data[i] = "";
				}
			}
		},
		
		/**
		 * 打印模板
		 * 
		 * @templateId 类别Id
		 * @dataUrl 获取数据的地址
		 * @isPreview true 预览 false 打印
		 */
		 printUrl:function(loadReportURL, dataUrl, isPreview, conf) {

			 this.grPtrint.LoadFromURL(loadReportURL);
			 var _self=this;
				if (typeof dataUrl=="string"){
			$.post(dataUrl, {}, function(data, ststus, xhr) {
				_self.jsonObjectFilter(data);
				data = JSON.stringify(data);
				_self.grPtrint.LoadDataFromAjaxRequest(data, xhr.getAllResponseHeaders());
				if (conf != null && conf != "undefined" && $.trim(conf).length > 0) {
					var setJson = eval("(" + conf + ")");
					_self.setPrint(_self.bsNetCtl.ctl, setJson);
				}
				//2016-04-28 C.J.B Modify  
				//取消打印前显示打印机设置界面
				if (!isPreview) {
					_self.grPtrint.Print(false);
				} else {
					_self.grPtrint.PrintPreview(false);
				}

			}, 'json');
			}else{
				try {
				var subReportList=[],subReport;
				for(var i=0,len=dataUrl.length;i<len;i++){
					subReport=dataUrl[i];
					var reportId=subReport["id"];
					var reportDataUrl=subReport["dataUrl"];

						//设置子报表
						//无害化 01
					try{
						var subRpObjet=this.grPtrint.ControlByName(reportId).AsSubReport.Report;
						if (subRpObjet){
							subReportList.push({subRpObjet:subRpObjet,dataUrl:reportDataUrl})
						}
					}catch(ex){	
					}
					 
				}
				}catch(ex){	
				}
				
				for(var i=0,len=subReportList.length;i<len;i++){
					subReport=subReportList[i];
					subReport["subRpObjet"].LoadDataFromURL(subReport["dataUrl"])
				}
				if (!isPreview) {
					_self.grPtrint.Print(false);
				} else {
					_self.grPtrint.PrintPreview(false);
				}		
			}
			// Report.LoadDataFromURL(dataUrl);
			// 加载打印配置

		},
		showPrintPreview:function(loadReportURL){
			 this.grPtrint.LoadFromURL(loadReportURL);

			 this.grPtrint.PrintPreview(false);
		},
		showGridPrintPreview:function(gridId,option,renderTo){
			var newOpt=this.gridReportOptions(option);
	
			var _self=this;
			
			this.grPrintViewer=new GrPrintViewer({renderTo:renderTo,width:"100%",height:"100%"});
			this.grPrintViewer.ctl.LoadReportURL=this.gridPrintTemplateurl;
			var container=this.grPrintViewer.container
			var width = window.screen.availWidth;
			var height = window.screen.availHeight;
			var report = this.grPrintViewer.ctl.Report;
			if(newOpt!=null){
			  //  printUtil.PrintGridReport(gridId,newOpt,conf);
				this.grPrintViewer.ctl.object.OnToolbarButtonClick=function(btnId){
					/*if (btnId == 3 && rs.multitle) {
						_self.grPrintViewer.ctl.DefaultToolbarCommand = false;
						var printer = _self.grPrintViewer.ctl.Report.Printer;
						var bt = printer.PageSetupDialog();
						if (bt) {//修改了页面配置,如果页面为双层网格头，则需要进行判断，避免多个网格头出现
							reportView.Stop();
							var viewPaper = printer.PaperWidth - printer.RightMargin - printer.LeftMargin;
							rs = BsGridPrint.setFreeControl(report, viewPaper, rs);
							_self.grPrintViewer.ctl.Start();
						}
					}*/
					
				}
				
				$.openModalDialog({mode:'html',url:container,title:'打印',width:width,height:height})
				var indexDlg=$A.dialog._current[$A.dialog._current.length-1];
				
				$A.dialog._current[$A.dialog._current.length-1]=null;
				BsGridPrint.setGripReportHead(report, newOpt,gridId);
				var rs = BsGridPrint.setGridReportMain(report, gridId,newOpt);
				BsGridPrint.setGridreportFooter(report);
				$A.dialog._current[$A.dialog._current-1]=indexDlg;
				report.OnExportEnd = OnExportEnd;
				report.OnExportBegin = OnExportBegin;
				this.grPrintViewer.ctl.Start();

				

			}
			
			function OnExportBegin(OptionObject) {
				var opt = OptionObject.AsE2XLSOption;
				//var title = document.getElementById("hiddenTitle").value;
				//OptionObject.AsE2XLSOption.FileName = title;
				opt.ColumnAsDetailGrid = false;
				opt.SameAsPrint = false;
				opt.ExportPageHeaderFooter = false;
				opt.ExportPageBreak = false;
			}

			function OnExportEnd(OptionObject) {
				//Report.DetailGrid.PageColumnCount = 2; //导出后恢复报表的多栏设置，数字2应该替换为实际的页栏数值 
			}

			
		},
		/**
		 * 报表打印的选项设置处理
		 */
		 gridReportOptions:function(opt){
			//判断是否IE浏览器,若是IE 浏览器提示不能打印
			
			var heaerTitle={
				id:'title',
				name:opt.title,
				type:'title',
				control:'MemoBox',
				needValue:false,
				center:1
			};
			//普通控件样式定义
			var com_controls={
				needValue:true,
				type:'condition',
				control:'StaticBox',//控件类行
				exp:'',//表达式
				value:{},//值
				option:{
					target:'',//对照对象，以前一个对象的位置属性进行定位
					position:'x'//布局方式 x y ,若为"auto",则对照方式，安照控件写入顺序
				},
				needSplit:false//是否与前一个控件隔开
			};
			var gridOpt={titleHeight:1.8};
			
			var reportOpt={};
			reportOpt.controls=[];
			reportOpt.controls.push(heaerTitle);
			for(var i=0;i<opt.controls.length;i++)
			{
				var _copt=$.extend({},com_controls,opt.controls[i]);
				_copt.exp=opt.controls[i].id;
				var fillvalue=opt.controls[i].value[opt.controls[i].id];
				if(fillvalue==null||$.trim(fillvalue).length==0){
					continue;
				}
				reportOpt.controls.push(_copt);
			}
			var grid=$.extend({},gridOpt,opt.grid);
			reportOpt.grid=grid;
			return reportOpt;
		},
		createPrintDesigner:function(loadReportURL, saveReportURL, dataURL,renderTo){
			var renderTo=renderTo||""
			this.grPrintDesigner=new GrPrintDesigner({renderTo:renderTo,width:"100%",height:"100%"});
			this.grPrintDesigner.ctl.LoadReportURL=loadReportURL;
			this.grPrintDesigner.ctl.SaveReportURL=saveReportURL;
			this.grPrintDesigner.ctl.dataURL=dataURL;
			this.grPrintDesigner.width="93%";
			return this.grPrintDesigner.container;
		},
		showPrintDesigner:function(loadReportURL, saveReportURL, dataURL,renderTo){
			var container=this.createPrintDesigner(loadReportURL, saveReportURL, dataURL,renderTo);
			var width = window.screen.availWidth;
			var height = window.screen.availHeight;
			$.openModalDialog({mode:'html',url:container,title:'报表设计',width:width,height:height})
		},
		_createViewReport:function(reportUrl, dataUrl, conf, olddata,renderTo) {
			var isPreview = true;
			this.grPrintViewer=new GrPrintViewer({renderTo:renderTo});
			var _self=this;
			$.post(dataUrl, {}, function(data, ststus, xhr) {
				_self.jsonObjectFilter(data);
				//将传过来的数据添加至打印数据源
				if (olddata != null && olddata.fbillNo != null) {
					data.fbillNo = olddata.fbillNo;
				}

				data = JSON.stringify(data);
				report.Report.LoadDataFromAjaxRequest(data, xhr
								.getAllResponseHeaders());
				conf = null;
				if (conf != null && conf != "undefined" && $.trim(conf).length > 0) {
					var setJson = eval("(" + conf + ")");
					_self.setPrint(_self.grPrintViewer.ctl, setJson);
				}
				report.Start();

			}, 'json');

		},
		/**
		 * 显示选择打印模板窗口
		 */
		_showTemplatePanel :function () {
			
			var html = "";
			html += "<div class=\"dialog-header\" id=\"print_dialog\">";
			html += "<div class=\"closebg\"><a id=\"btn_print_close\" vclass=\"close\" href=\"#close\"></a></div><h5>选择模板</h5></div>";
			
			html += "<div class=\"dialog_content\" style=\"height: 210px;\">";
			html += "<div id=\"_print_grid\" class=\"grid-container\" style=\"width:550px;\" style=\"height: 210px;\"> ";
			html += "<div class=\"grid-header\"> ";
			html += "<div id=\"_print_grid_pageTool\" class=\"grid-page\"></div> ";
			html += "</div > ";
			html += "<table id=\"_print_table\" pageId=\"_print_grid_pageTool\" usePage=\"false\" class=\"jqgrid\" showFooter=\"false\"  manualFooter=\"false\" ";
			html += "autoHeight=\"false\" shrinkToFit=\"true\" pageSize=\"0\" width=\"550px\" height=\"200\" checkboxable=\"false\" editRow=\"false\" eventSelf=\"true\" ";
			html += "sortname=\"fno\" sortorder=\"desc\" autoLoad=\"false\" fillNum=\"0\" export=\"false\" > ";
			html += "<thead> ";
			html += "<tr> ";
			html += "<th id=\"id\" columnType=\"DEFAULT\" chidden=\"true\" align=\"CENTER\" ";  
			html += "sortable=\"false\" frozen=\"false\" footerType=\"TEXT\" editable=\"false\" edittype=\"TEXTBOX\">id</th> ";
			html += "<th id=\"code\" columnType=\"DEFAULT\" chidden=\"false\" align=\"CENTER\" ";  
			html += "sortable=\"false\" frozen=\"false\" footerType=\"TEXT\" editable=\"false\" edittype=\"TEXTBOX\" width=\"60\" >编码</th> ";
			html += "<th id=\"name\" columnType=\"DEFAULT\" chidden=\"false\" align=\"LEFT\" ";  
			html += "sortable=\"false\" frozen=\"false\" footerType=\"TEXT\" editable=\"false\" edittype=\"TEXTBOX\">名称</th> ";
			html += "</tr> ";
			html += "</thead> ";
			html += "</table> ";
			html += "</div> ";
			html += "</div> ";
			
			html += "<div class=\"dialog-footer\">";
			html += "<div class=\"btnarea btn-toolbar\">";
			html += "<a id=\"btn_print_set\" class=\"app-button l-btn l-btn-small\"><span class=\"l-btn-left\"><span class=\"l-btn-text\">设置</span></span></a>";
			html += "<a id=\"btn_print_print\" class=\"app-button l-btn l-btn-small\"><span class=\"l-btn-left\"><span class=\"l-btn-text\">打印</span></span></a>";
			html += "<a id=\"btn_print_preview\" class=\"app-button l-btn l-btn-small\"><span class=\"l-btn-left\"><span class=\"l-btn-text\">预览</span></span></a>";
			html += "<a id=\"btn_print_cancel\" class=\"app-button l-btn l-btn-small\"><span class=\"l-btn-left\"><span class=\"l-btn-text\">关闭</span></span></a>";
			html += "</div></div>";
			
			return html;
		},
		
		queryTemplateList:function(moduleId,type){
			
			if(type==null){
				type="form";
			}
			var json = $.ajax({
				url :this.queryTemplistUrl,
				async : false,
				data : {
					moduleCode : moduleId
				},
				dataType : 'json',
				type : 'POST'
			}).responseText;
			return json;
			
		},
		
		/**
		 * 显示模板列表
		 * @param moduleId 模块Id[分类Id]
		 * @Param printFunc 弹窗之后事件 打印
		 * @param previewFunc 弹窗之后事件 预览
		 * @param openBefore 弹窗之前事件
		 * @param closeBefore 关闭之前事件
		 * @param params 参数集
		 */
		showPrintTemplateDialog : function(moduleId,  
				printFunc, previewFunc, openBefore, closeBefore, params){
			var _self=this;
			// 获取选择模板界面
			var $node = $(this._showTemplatePanel());
			// 获取模板列表
			var data = $A.jsonEval(this.queryTemplateList(moduleId));
			/*if(conf==undefined)
				conf = "" ;*/
			//var netFun = $('#_bsNetFun') ;
			//if(netFun!=null&&netFun!=undefined&&netFun.length>0)
			var conf=this.bsNetCtl.getPrintSet(moduleId);
			// 绑定打印事件
			$node.find("#btn_print_print").bind("click",function(){
				
				var templateId = $A("#_print_grid").bsgrid('getSelectRowId');
				if(templateId == null || templateId == ''){
					$messager.warn("请选择模板");
					return;
				}
				
				printFunc(templateId, params);
			
			});
			
			// 绑定打印预览事件
			$node.find("#btn_print_preview").bind("click",function(){
				
				var templateId = $A("#_print_grid").bsgrid('getSelectRowId');
				if(templateId == null || templateId == ''){
					$messager.warn("请选择模板");
					return;
				}
				previewFunc(templateId, params);
			});
			
			
			// 打印设置事件
			$node.find("#btn_print_set").bind("click",function(){
				
				_self.bsNetCtl.setPrinter(moduleId);
			});
			
			// 绑定取消事件
			$node.find("#btn_print_cancel").bind("click",function(){
				// 打开窗口之前事件
				if(closeBefore){
					closeBefore();
				}
				$.closeDialog();
			});
			
			// 打开窗口之前事件
			if(openBefore){
				openBefore();
			}
			
			// 打开选择打印模板窗口
			var options = {
					dialogId : "printDlg",
					hasheader : false,
					height : '260px',
					width : '200px',
					mode : "node",
					url : $node,
					onPageLoad:function(){
						// 加载 模板数据
						$A("#_print_grid").bsgrid('loadData',data);
						// 默认选择第一条记录
						var rowids = $A('#_print_grid').bsgrid('getDataIDs');
						if(rowids.length>0){
							$A('#_print_grid').bsgrid('setSelection',rowids[0],true);
						}
					}
				}	 
			$.openModalDialog(options);
			
			// 控制显示按钮
			if(params != null){
				if(params.bnts != null){
					if(params.bnts.print != null&&params.bnts.print == false){
						$A('#btn_print_print').hide();
					}
					if(params.bnts.preview != null&&params.bnts.preview == false){
						$A('#btn_print_preview').hide();
					}
					if(params.bnts.set != null&&params.bnts.set == false){
						$A('#btn_print_set').hide();
					}
				}
			}
		},
		_setPrint:function(report, localSet) {
			report.Printer.LeftMargin = localSet.MarginLeft;
			report.Printer.RightMargin = localSet.MarginRight;
			report.Printer.TopMargin = localSet.MarginUp;
			report.Printer.BottomMargin = localSet.MarginDown;
			report.Printer.PrinterName = localSet.Printer;
			report.Printer.PrintOffsetX = localSet.OffsetX;
			report.Printer.PrintOffsetY = localSet.OffsetY;
		},
		_appendTypeToUrl:function(word){
			if(this.bsNetCtl.ctl.DownloadUrl.indexOf("?type")>=0){
				var newUrl=this.bsNetCtl.ctl.DownloadUrl.substring(0,this.bsNetCtl.ctl.DownloadUrl.indexOf("?type")); 
				this.bsNetCtl.ctl.DownloadUrl=newUrl+word;
				
			}else{
				this.bsNetCtl.ctl.DownloadUrl=this.bsNetCtl.ctl.DownloadUrl+word;
			}
		}
	
	})

	return BsReport;
});