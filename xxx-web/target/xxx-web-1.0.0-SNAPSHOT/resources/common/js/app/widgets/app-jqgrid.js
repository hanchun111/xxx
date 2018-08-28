/**
 * 表格扩展
 */
define(	["app/core/app-jquery", "app/core/app-core", "app/core/app-options",
				"app/widgets/window/app-messager", "app/data/app-ajax", localeFile,
				"jquery/jquery.jqgrid","app/widgets/button/app-button","app/widgets/form/app-number","app/widgets/form/app-money","app/widgets/form/app-combobox","app/widgets/form/app-datetime","app/widgets/form/app-combogrid","app/widgets/form/app-comboztree","app/widgets/form/app-reference", 'jquery/jquery.upload'], function($, $A, $options, $messager,
				$ajax) {
			/**
			 * 通过模板进行数据格式化
			 * 
			 * @param cellvalue
			 *            单元格值
			 * @param options
			 *            选项
			 * @param rowObject
			 *            行数据
			 * @returns 格式化后串
			 */
			function templateFormat(cellvalue, options, rowObject) {
				return $template(options.template, rowObject);
			};
			/**
			 * 扩展网格绑定的组件
			 */
			function extendCompent($table) {
				return {
					"PASSWORD" : { // 密码框
						// 参数说明:pnlObj 组件父容器对象,colVal 列值,rowIndex 行号,colIndex
						// 列号,colModel列属性对象集合,colTxt列文本,attachHiddens附加值隐藏域数组集合
						init : function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens) {// 组件创建
							var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID;
							var name = colModel[colIndex].name, validations = colModel[colIndex].validations, events = colModel[colIndex].events, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;
							validations = (validations ? ' validations="'
									+ validations + '"' : '');
							events = (events ? ' events="' + events + '"' : '');
							required = (required ? ' required="true"' : '');
							requiredMsg = (requiredMsg ? ' requiredMsg="'
									+ requiredMsg + '"' : '');
							gearRules = (gearRules ? ' gearRules="' + gearRules
									+ '"' : '');

							var html = '<input type="password" id="' + id
									+ '" name="' + name + '" ';
							html += ' value="' + colVal + '" ' + validations
									+ events + required + requiredMsg
									+ gearRules
									+ ' class="editable" width="100%"/>';
							$obj.html(html);
							require(["app/core/app-jquery"], function(jq) {
										$obj.initPageUI();
										
									});
						},
						getEditor:function(){
								var comp = $(pnlObj).attr("id") + "-comp";
								return $(pnlObj).find('#' + comp).data("textbox");
						},
						xtype:'textbox'
					},
					"RADIOBOX" : {// 单选
						init : function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens) {// 组件创建
							var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID;
							var name = colModel[colIndex].name, validations = colModel[colIndex].validations, events = colModel[colIndex].events, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;
							validations = (validations ? ' validations="'
									+ validations + '"' : '');
							events = (events ? ' events="' + events + '"' : '');
							required = (required ? ' required="true"' : '');
							requiredMsg = (requiredMsg ? ' requiredMsg="'
									+ requiredMsg + '"' : '');
							gearRules = (gearRules ? ' gearRules="' + gearRules
									+ '"' : '');

							var editOption = colModel[colIndex].editOptions;// json格式：[{value:'',text:''},{value:'',text:''}]
							editOption = editOption ? editOption : '[]';
							editOption = new Function("return " + 

									+ ";")();
							var html = new Array();
							for (var i = 0; i < editOption.length; i++) {
								var rs = editOption[i];
								var chk = colVal == rs.value
										? "checked='true'"
										: "";
								html.push('<label><input type="radio" id="'
										+ id + i + '" name="' + name + '" '
										+ chk);
								html
										.push(' value="'
												+ rs.value
												+ '" '
												+ validations
												+ events
												+ required
												+ requiredMsg
												+ gearRules
												+ ' class="editable" style="width:auto;"/>'
												+ rs.text + '</label>');
							}
							$obj.html(html.join(''));
							require(["app/core/app-jquery"], function(jq) {
										$obj.initPageUI();
									});
						},
						getVal : function(pnlObj) {
							var chk = $(pnlObj).find(':radio:checked');
							var val = chk.size() > 0 ? chk.val() : ($(pnlObj)
									.attr("val") || $(pnlObj).attr("txt"));
							return val;
						},
						getTxt : function(pnlObj) {
							var chk = $(pnlObj).find(':radio:checked');
							var val = chk.size() > 0 ? chk.val() : ($(pnlObj)
									.attr("val") || $(pnlObj).attr("txt"));
							return val;
						}
					},
					"TEXTAREA" : {// 文本域
						init : function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens) {// 组件创建
							var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID;
							var name = colModel[colIndex].name, validations = colModel[colIndex].validations, events = colModel[colIndex].events, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;
							validations = (validations ? ' validations="'
									+ validations + '"' : '');
							events = (events ? ' events="' + events + '"' : '');
							required = (required ? ' required="true"' : '');
							requiredMsg = (requiredMsg ? ' requiredMsg="'
									+ requiredMsg + '"' : '');
							gearRules = (gearRules ? ' gearRules="' + gearRules
									+ '"' : '');

							var html = '<textarea id="' + id + '" name="'
									+ name + '" ';
							html += validations
									+ events
									+ required
									+ requiredMsg
									+ gearRules
									+ ' class="editable" style="resize: none;" width="100%">'
									+ colVal + '</textarea>';
							$obj.html(html);
							require(["app/core/app-jquery"], function(jq) {
										$obj.initPageUI();
									});
						},
						xtype:'textbox'
					},
					"MONEY" : {
						// 参数说明:pnlObj 组件父容器对象,colVal 列值,rowIndex 行号,colIndex
						// 列号,colModel列属性对象集合,colTxt列文本,attachHiddens附加值隐藏域数组集合
						init : function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens) {// 组件创建
							var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID;
							var name = colModel[colIndex].name, validations = colModel[colIndex].validations, events = colModel[colIndex].events, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;
							validations = (validations ? ' validations="'
									+ validations + '"' : '');
							events = (events ? ' events="' + events + '"' : '');
							required = (required ? ' required="true"' : '');
							requiredMsg = (requiredMsg ? ' requiredMsg="'
									+ requiredMsg + '"' : '');
							gearRules = (gearRules ? ' gearRules="' + gearRules
									+ '"' : '');

							var html = '<input type="text" id="' + id
									+ '" name="' + name + '" ';
							html += ' value="' + colVal + '" ' + validations
									+ events + required + requiredMsg
									+ gearRules
									+ ' class="app-money" width="100%"/>';
							var options = colModel[colIndex].editOptions;
							var $el = $(html);
							$el.attr("_options",options);
							$obj.html($el);
							$el.money();
							/*require(["app/core/app-jquery"], function(jq) {
										$obj.initPageUI();
									});*/
						},getVal : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.money('getValue');
						},
						getEditor:function(pnlObj){
								var comp = $(pnlObj).attr("id") + "-comp";
								return $(pnlObj).find('#' + comp).data("money");
						} ,
						xtype:'money'
					},
					"COMBOGRID" : {// 下拉表
						init : function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens) {// 组件创建
							var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID
							var options = colModel[colIndex].editOptions;

							var name = colModel[colIndex].name, validations = colModel[colIndex].validations
							// ,events = colModel[colIndex].events
							, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;

							var suggest = false;
							if (options.suggest != null) {
								suggest = true;
							}

							var $html = $("<input id=\""
									+ id
									+ "\" name=\""
									+ name
									+ "\" class=\"app-combogrid\" value=\""+ colVal+"\" width=\"100%\" />");
							$html.attr("value", colVal);
							$html.attr("text", colTxt);
							$html.attr("suggest", suggest);
							$html.attr("validations", validations);
							$html.attr("required", required);
							$html.attr("requiredMsg", requiredMsg);
							if (gearRules) {
								$html.attr("gearRules", gearRules);
							}
							$html.attr("_options", options);
							$obj.empty().append($html);
							$html.combogrid();
						},
						getVal : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.combogrid('getValue');
						},
						getTxt : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.combogrid('getText');
						},
						getEditor:function(pnlObj){
								var comp = $(pnlObj).attr("id") + "-comp";
								return $(pnlObj).find('#' + comp).data("combogrid");
						},
						xtype:'combogrid'
					},
					"COMBOZTREE" : {// 下拉树
						init : function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens) {// 组件创建
							var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID
							var options = colModel[colIndex].editOptions;
							var name = colModel[colIndex].name, validations = colModel[colIndex].validations
							// ,events = colModel[colIndex].events
							, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;

							var $html = $("<input id=\""
									+ id
									+ "\" name=\""
									+ name
									+ "\" class=\"app-comboztree\" width=\"100%\">");
							if (validations) {
								$html.attr("validations", validations);
							}
							if (required) {
								$html.attr("required", true);
							}
							if (requiredMsg) {
								$html.attr("requiredMsg", requiredMsg);
							}
							if (gearRules) {
								$html.attr("gearRules", gearRules);
							}
							if (options){
									options=options.replace(/{/,'{keyShowPanel:[220], ');
							}
							if(options){
								$html.attr("_options", options);
							}

							if (colModel[colIndex].showField) {
								var fopt = colModel[colIndex]["formatoptions"];
								var rowdata = $(this).jqGrid('getRowData',
										this.p.selrow);
								colTxt = colModel[colIndex].formatter(colVal,
										fopt, rowdata);
							}
							$html.attr("value", colVal);
							$html.attr("text", colTxt);
							// p.text=colTxt;
							// p.value=colVal;

							$obj.empty().append($html);
							
							$html.comboztree()
						
						},
						getVal : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.comboztree('getValue');
						},
						getTxt : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.comboztree('getText');
						},
						getEditor:function(pnlObj){
								var comp = $(pnlObj).attr("id") + "-comp";
								return $(pnlObj).find('#' + comp).data("comboztree");
						},
						xtype:'comboztree'
					},
					"COMBOBOX" : {// 下拉列表
						init : function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens) {// 组件创建
							var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID
							var options = colModel[colIndex].editOptions||{};
							var name = colModel[colIndex].name, validations = colModel[colIndex].validations, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;
							var suggest = false;
							if (options.suggest != null) {
								suggest = true;
							}
						/*	if (options){
									options=options.replace(/{/,'{keyShowPanel:[220], ');
							}*/
							var $html = $("<input id=\""
									+ id
									+ "\" name=\""
									+ name
									+ "\" class=\"app-combobox\"  width=\"100%\"  />");
							$html.attr("suggest", suggest);
							if (validations) {
								$html.attr("validations", validations);
							}
							if (required) {
								$html.attr("required", true);
							}
							if (requiredMsg) {
								$html.attr("requiredMsg", requiredMsg);
							}
							if (gearRules) {
								$html.attr("gearRules", gearRules);
							}
							if(options){
								$html.attr("_options", options);
							}

							if (colModel[colIndex].showField) {
								var fopt = colModel[colIndex]["formatoptions"];
								var rowdata = $(this).jqGrid('getRowData',
										this.p.selrow);
										if ( colModel[colIndex].formatter){
								colTxt = colModel[colIndex].formatter(colVal,
										fopt, rowdata);
										}
							}

							$html.attr("value", colVal);
							$html.attr("text", colTxt);

							$obj.empty().append($html);
							
							$html.combobox()
							
						},
						getVal : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.combobox('getValue');
						},
						getTxt : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.combobox('getText');
						},
						getEditor:function(pnlObj){
								var comp = $(pnlObj).attr("id") + "-comp";
								return $(pnlObj).find('#' + comp).data("combobox");
						},
						xtype:'combobox'

					},
					"REFERENCE" : {// 下拉引用
						init : function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens) {// 组件创建
							var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID
							var name = colModel[colIndex].name, url = colModel[colIndex].url, validations = colModel[colIndex].validations, events = colModel[colIndex].events, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;
							validations = (validations ? ' validations="'
									+ validations + '"' : '');
							events = (events ? ' events="' + events + '"' : '');
							required = (required ? ' required="true"' : '');
							requiredMsg = (requiredMsg ? ' requiredMsg="'
									+ requiredMsg + '"' : '');
							gearRules = (gearRules ? ' gearRules="' + gearRules
									+ '"' : '');

							url = (url ? ' action="' + url + '" ' : '');
							var html = '<input id="' + id + '"  name="' + name
									+ '"  value="' + colVal + '" text="'
									+ colTxt + '" ';
							html += ' class="app-reference" width="98%"';
							html += validations + events + required
									+ requiredMsg + gearRules + url + ' />';
							var options = colModel[colIndex].editOptions;
							var $el = $(html);
							if(options){
								$el.attr("_options",options);
							}
							$obj.html($el);
							
							$el.reference()
						
						},
						getVal : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.reference('getValue');
						},
						getTxt : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.reference('getText');
						},
						getEditor:function(pnlObj){
								var comp = $(pnlObj).attr("id") + "-comp";
								return $(pnlObj).find('#' + comp).data("reference");
						} ,
						xtype:'reference'
					},
					"DATETIME" : {
						init : function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens) {// 组件创建
							var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID
							var name = colModel[colIndex].name;
							var width = $obj.width() - 30;
							var options = colModel[colIndex].editOptions;

							var validations = colModel[colIndex].validations, events = colModel[colIndex].events, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;
							validations = (validations ? ' validations="'
									+ validations + '"' : '');
							events = (events ? ' events="' + events + '"' : '');
							required = (required ? ' required="true"' : '');
							requiredMsg = (requiredMsg ? ' requiredMsg="'
									+ requiredMsg + '"' : '');
							gearRules = (gearRules ? ' gearRules="' + gearRules
									+ '"' : '');

							var html = '';
							html += '<input class="app-datetime" id="' + id
									+ '" name="' + name + '" ';
							html += ' value="' + colVal + '" width="98%"';
							html +=  validations + events + required
									+ requiredMsg + gearRules + '/>';
							var $el = $(html);
							$el.attr("_options",options);
							$obj.html($el);
							$el.datetime();
						},
						getVal : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.datetime('getValue');
						},
						getTxt : function(pnlObj) {
							return this.getVal(pnlObj);
						},
						getEditor:function(pnlObj){
								var comp = $(pnlObj).attr("id") + "-comp";
								return $(pnlObj).find('#' + comp).data("datetimepicker");
						} ,
						xtype:'datetimepicker'
					}
					 ,"NUMBER":{
						 init:function(pnlObj, colVal, rowIndex, colIndex,
								colModel, colTxt, attachHiddens){
						 	var $obj = $(pnlObj), id = $obj.attr("id")
									+ "-comp";// 生成ID;
							var name = colModel[colIndex].name, validations = colModel[colIndex].validations, events = colModel[colIndex].events, required = colModel[colIndex].required, requiredMsg = colModel[colIndex].requiredMsg, gearRules = colModel[colIndex].gearRules;
							validations = (validations ? ' validations="'
									+ validations + '"' : '');
							events = (events ? ' events="' + events + '"' : '');
							required = (required ? ' required="true"' : '');
							requiredMsg = (requiredMsg ? ' requiredMsg="'
									+ requiredMsg + '"' : '');
							gearRules = (gearRules ? ' gearRules="' + gearRules
									+ '"' : '');
							var options = colModel[colIndex].editOptions;

							var html = '<input type="text" id="' + id
									+ '" name="' + name + '" ';
							html += ' value="' + colVal + '" ' + validations
									+ events + required + requiredMsg
									+ gearRules
									+ ' class="app-number" width="100%"/>';
							var $el = $(html);
							if(options){
								$el.attr("_options",options);
							};
							$obj.html($el);
							$el.number();
						 },getVal : function(pnlObj) {
							var comp = $(pnlObj).attr("id") + "-comp";
							return $(pnlObj).find('#' + comp)
									.number('getValue');
						},
						getEditor:function(pnlObj){
								var comp = $(pnlObj).attr("id") + "-comp";
								return $(pnlObj).find('#' + comp).data("number");
						} 
					 	,
						xtype:'number'
					 }
				};
			}
			var getDefaultCompent=$.jgrid.getDefaultCompent;
			$.extend($.jgrid,{getDefaultCompent:function(){
					return $.extend(true,getDefaultCompent(),extendCompent());
			}});
			
			/**
			 * 取得jqGrid的jquery对象
			 */
			$.fn.getJqGrid = function() {
				var $this = $(this);
				if (!$this.isGrid())
					return null;
				
				if ($this.attr("jqgrid") == "true")
					return $this;
				if ($this.length>1){
					var ids=[];
					$this.each(function(){
						var tem=$(this);
						ids.push("#" + tem.attr("jqgridid"));
						
					})
					return  $(ids.join(","))
				}else{
					return $("#" + $this.attr("jqgridid"));
				}
			};
			/**
			 * 判断当前对象是否是jqgrid对象
			 */
			$.fn.isGrid = function() {
				return $(this).attr("jqgrid") == "true"
						|| $(this).attr("jqgridid");
			};
			/**
			 * 初始化jqgrid方法
			 */
			$.fn.initJqGrid = function() {
				this.each(function() {
					var $this = $(this)
						,$container = $this.parent(".grid-container")
						,id = $this.attr("id")|| ("jqgrid" + $A.nextId())
						,url = $this.attr("url")
						,dataType = $this.attr("dataType")|| "json"
						,autoLoad = !($this.attr("autoLoad") == "false") 
						,usePage = !($this.attr("usePage") == "false")
						,pageId = $this.attr("pageId")
						,pageList = $this.attr("pageList")? $this.attr("pageList").split(","): $options.jqgrid.pageList
						,rowNum = ($this.attr("pageSize") || pageList[0])* 1
						,sortname = $this.attr("sortname")
						,sortorder = $this.attr("sortorder")|| "asc"
						,height = $this.attr("height")
						,width = $container.width()
						,showFooter = $this.attr("showFooter") == "true"
						,manualFooter = $this.attr("manualFooter") == "true"
						,page = ($this.attr("page") || 1)* 1
						,method = $this.attr("method") || "POST"
						,multiselect = $this.attr("checkboxable") == "true"
						,loadOnce = $this.attr("loadOnce") == "true"
						,striped = $this.attr("striped") != "false"
						,treeGrid = $this.attr("treeGrid") == "true"
						,multiboxonly = ($this.attr("checkboxOnly") != "false")
						,autoHeight = ($this.attr("autoHeight") != "false")
						,shrinkToFit = ($this.attr("shrinkToFit") != "false")
						,repeatitems = ($this.attr("repeatitems") != "false")
						,events = $this.attr("events")
						,params = $this.attr("params")
						,transor = $this.attr("transor")
						,jsonReader = $this.attr("jsonReader")
						,editRow = $this.attr("editRow") == "true" // 是否可以编辑行
						,editUrl = $this.attr("editUrl")// 编辑提交地址
						,editSuccesfunc = $this.attr("editSuccesfunc")// 编辑保存成功执行的函数名
						,rownumbers = true
						,fit =  $this.attr("fit")=="true"
						,gridheaders=$this.attr("gridheaders")
						,fillNum=$this.attr("fillNum")
						,gridExport=$this.attr("export")== "true",
						fileName=$this.attr("fileName"),
						extOptions=$this.attr("extOptions");

					if (typeof($this.attr("rownumbers")) != "undefined") {
						rownumbers = ($this.attr("rownumbers") == "true");
					}
					if (height && height.indexOf("px")) {
						height = height.replace("px", "");
					}
				//	if (!usePage) {
						//$this.attr("pageHeight", "0");
					//} else {
						//$this.attr("pageHeight", "33");
						//height = height - 33;
					//}
					if (autoHeight) {
						height = "100%";
					}

					var cols = [], colNames = [], $colTds = $("thead>tr>th",
							$this), colFuncs = [];
					$colTds.each(function() {
						var $o = $(this), label = $o.html() || ""
								, name = $o.attr("name")|| $o.attr("id") || $o.attr("field") || label
								, field = $o.attr("field")|| name
								, valueField = $o.attr("valueField")
								, w = $o.attr("width"), sortable = $o.attr("sortable") == "true"? true: false
								, align = ($o.attr("align") || "left").toLowerCase()
								, columnType = $o.attr("columnType")
								, columnContent = $o.attr("columnContent")
								, columnHeadFunc = $o.attr("columnHeadFunc")
								, hidden = $o.attr("chidden") == "true"
								, formatterType = $o.attr("formatterType")
								, formatter = $o.attr("formatter")
								, foptions = $o.attr("formatterOptions")
								, editable = $o.attr("editable") != "false"
								, edittype = $o.attr("edittype")? $o.attr("edittype"): "TEXTBOX"
								, editOptions = $o.attr("editOptions")
								, footerType = $o.attr("footerType")
								, footerDef = $o.attr("footerDef")
								, footerFormatter = $o.attr("footerFormatter")
								, required = $o.attr("required") && true
								, requiredMsg = $o.attr("requiredMsg")
								, gearRules = $o.attr("gearRules")
								, events = $o.attr("events")
								, url = $o.attr("url")
								, frozen = $o.attr("frozen")
								, showField = $o.attr("showField")
								, validations = $o.attr("validations")// "校验选项"
								, colTransor = $o.attr("transor")// "校验选项"
								,autoencode = true;//是否自动encode
							
						if (required && edittype != "RADIOBOX") {
							label = '<span class=\"required\">*</span>' + label;
							autoencode = false;
						}
						if (footerDef) {
							footerDef = footerDef.toLowerCase();
							if (footerType == "TEXT") {
								footerDef =footerDef;
							} else if (footerType == "FORMULA") {
								footerDef = $o.getJsFunction(footerDef);
							}
						}
						var isTransor=false;
						if (colTransor){
							isTransor=true;
						}
						var c = {
							name : name,
							index : field,
							sortable : sortable,
							align : align,
							hidden : hidden,
							required : required,
							requiredMsg : requiredMsg,
							summaryType : footerDef,
							summaryTpl : footerFormatter,
							validations : validations,
							events : events,
							footerType:footerType,
							editable : editable,
							edittype : edittype,
							editOptions : editOptions,
							url : url,
							isTransor:colTransor,
							columnHeadFunc : columnHeadFunc,// 20140925
															// sjq新增表头内容替换允许字符串或Js
															// Function
							valueField : valueField,
							
							"attachField" : $o.attr("attachField"),
							"validations" : validations,
							"gearRules" : gearRules,
							frozen : frozen,
							//add by tw
							//新增参数，设置该列是否自动encode
							"autoencode":autoencode
						};
						if (formatter) {
							if (foptions) {
								foptions = $A.jsonEval(foptions);
							}
							if (formatterType == "FUNC") {
								formatter = $o.getJsFunction("return "
										+ formatter)();
							} else if (formatterType == "TEMPLATE") {
								if (!foptions) {
									foptions = {};
								}
								foptions.template = formatter;
								formatter = templateFormat;
							}
							c["formatter"] = formatter;
							c["formatoptions"] = foptions;
							c["autoencode"] = false;
						}

						if (showField) {
							c["showField"] = showField;
							c["formatter"] = function(cellvalue, options,
									rowdata) {
								var txt = "";
								var v = rowdata[showField];
								if (v) {
									txt = v;
								}
								return txt;
							};
						}

						if (w)
							c["width"] = w;
						if (columnType == "FUNC" || columnType == "TEMPLATE"
								|| columnType == "OP") {
							colFuncs.push({
										name : name,
										content : columnContent,
										type : columnType
									});
							//add by tw
							//如果是OP，FUNC或者是TEMPLATE则不自动encode
							c["autoencode"] = false;
						}
						c["columnType"]=columnType;
						colNames.push(label);
						// if(c.)
						cols.push(c);
					});

					// console.log(cols);
					$this.removeAttr("height");
					$this.removeAttr("width");
					$this.empty();
					if ($container.length > 0) {
						/* 无数据提示层 */
						$container.find(".grid-info")
								.html($.jgrid.defaults.emptyrecords);
						/* 调整id,将jqgrid id改为全局唯一id */
						$container.attr("jqgridid", id);
						$this.attr("id", id);
						var conid = $container.attr("id");
						$this.attr("origionId", conid || id);

						// $("#"+conid+"_gridinfo",$container).attr(id,id+"_gridinfo");
					} else {
						var newid = "jqgrid" + $A.nextId();
						$this.attr("id", newid);
						$this.attr("origionId", id);
						// var $refDiv = $("<div id=\""+id+"\"
						// jqgridid=\""+newid+"\"
						// style='display:none;'></div>");
						// $this.after($refDiv);
						// console.log("add");
						id = newid;
					}
					if (usePage) {
						var $page = $A("#" + pageId);
						if ($page.size() > 0) {
							pageId = id + "_pageTool";
							$page.attr("id", pageId);
						}
					}
					
					$this.attr("cwidth", $container.width());
					$container.bind('_resize', function(e,isresize,w,h) {
						
						var p=$container.parent(".layout-body,.panel-body");
						if (p.length>0){
						 if (fit == true) {
								
							p.css("overflow","hidden");
								$container.innerWidth(w);
								$container.innerHeight(h);
								$this.jqGrid('setGridHeight', $container.height());
								$this.jqGrid('setGridWidth', $container.width());
								//p.css("overflow","");
						}else{

							if (p[0].offsetHeight<p[0].scrollHeight){
								w=w-18;
							}
							$container.innerWidth(w);
							$this.jqGrid('setGridWidth', $container.width());
						}
						}

						return false;
					});
					/**
					 * 表格结束处理方法
					 */
					var gridComplete = ($container.length == 0 && colFuncs.length == 0)? null: function() {
								var ids = $this.jqGrid('getDataIDs');	
							
								if ($container.length > 0) {
									var $gridInfo = $container.find(".grid-info");
									if (ids.length == 0) {
										$gridInfo.css("display", "");
									} else {
										$gridInfo.css("display", "none");
									}
								}
								
								var rc = $this.jqGrid('getGridParam','reccount');
								if (rc == 0){
									
									if (fillNum) {

										fillNum = parseInt(fillNum, 10);
										var rowid, rowDatas = [];
										if (ids <= 0) {

											for (var i = 0; i < fillNum; i++) {
												rowid = $.jgrid.randId();
												rowData = {};
												// rowData[reader.id] = rowid;
												rowDatas.push(rowData);
											}
											$this.jqGrid("addRowData", null,
													rowDatas);
											window.setTimeout(function() {
														fillNum = 0;
													});
										}
									}
								}

								if (colFuncs.length == 0)
									return;
								for (var i = 0; i < ids.length; i++) {
									var cl = ids[i];
									for (var j = 0; j < colFuncs.length; j++) {
										var cf = colFuncs[j];
										var cc;
										if (cf.type == "FUNC") {
											cc = $this.getJsFunction("return "
													+ cf.content
													+ ".apply(this,arguments)")(
													$this, cl);
										} else {
											var rowd = $this.jqGrid('getRowData', cl);
											if (!rowd.id) {
												rowd.id = cl;
											}
											cc = $template(cf.content, rowd);
										}
										var celld = {};
										celld[cf.name] = cc;
										$this.jqGrid('setRowData', cl, celld);
									}
								};
								$("[handle][handleType=JS]", $this).each(
										function() {
											var $a = $(this);
											var handle = $a.attr("handle");
											if (!handle)
												return;
											var func = null;
											try {
												func = $this
														.getJsFunction(handle);
											} catch (e) {
												return;
											}
											$a.removeAttr("handle");
											$a.click(function(e) {
														if ($a.isTag("a"))
															e.preventDefault();
															if($a.attr("disabled")||$a.hasClass("disabled"))
															return;
														func.call(this);
													});
										});
										
								
							};

					if (jsonReader == null) {
						if (repeatitems) {
							jsonReader = {
								root : "data",
								page : "page",
								total : "totalPage",
								cell : "cell",
								records : "totalRecords",
								id : "id"
							};
						} else {
							jsonReader = {
								root : "data",
								page : "page",
								total : "totalPage",
								records : "totalRecords",
								repeatitems : false,
								id : "id"
							};
						}
					}
					var dt = autoLoad ? dataType : "local";

					// 组件扩展
					var myCompent = extendCompent($(this));
					/**
					 * 网格默认合计
					 */
					var gridTotal=function(){
						var ids = $this.jqGrid('getDataIDs');
							var summerObj = {};
							summary = [];
							for (var i = 0; i < cols.length; i++) {
								if (cols[i].summaryType) {
									summary.push({
												nm : cols[i].name,
												st : cols[i].summaryType,
												formatter : cols[i].formatter,
												v : cols[i].footerType == "TEXT"
														? cols[i].summaryType
														: "",
												footerType : cols[i].footerType
											});
								}
							}
							for (var i = 0; i < ids.length; i++) {
								var cl = ids[i];
								var record = $this.jqGrid('getRowData', cl);
								$.each(summary, function() {
											if ($.isFunction(this.st)) {
												this.v = this.st.call($this,
														this.v, this.nm, record);
											} else {
												if (this.footerType != "TEXT")
													this.v = $this
															.jqGrid(
																	'groupingCalculations.handler',
																	this.st,
																	this.v,
																	this.nm, null,
																	null, record);
												/*
												 * if(this.st.toLowerCase() ===
												 * 'avg' && this.sd) { this.vd =
												 * $this.jqGrid('groupingCalculations.handler',this.st,
												 * this.vd, this.sd, this.sr,
												 * this.srt, record); }
												 */
											}
										});
							}
							$.each(summary, function() {
										/*if ($.isFunction(this.formatter)) {
											this.v = this.formatter.call(this,
													this.v);
										}*/
										summerObj[this.nm] = this.v;
									});
							$this.footerData("set", summerObj);
					};

					var op = {
						url : url, /* 请求地址 */
						editurl : editUrl,// 编辑保存URL
						datatype : dt,/* 数据类型 */
						mtype : method, /* 请求方法 */
						colNames : colNames,
						colModel : cols,
						// /caption:title,/*使用自己的title*/
						altRows : striped,
						height : height,
						shrinkToFit : shrinkToFit,
						width : width,
						loadonce : loadOnce,
						multiselect : multiselect,
						multiboxonly : multiboxonly,
						viewrecords : true,
						recordpos : "left",
						pagerpos : "right",
						loadui : false,
						treeGrid : treeGrid,
						ExpandColumn : 'name',
						gridComplete : gridComplete,
						jsonReader : jsonReader,
						component : myCompent,
						editSuccesfunc : editSuccesfunc,
						rownumbers : rownumbers,
						editRow : editRow,
						footerrow : showFooter,
						userDataOnFooter : manualFooter,
						isExport:gridExport,
						fileName:fileName,
						gridTotal:gridTotal
					/*	grouping:true,
						groupingView : {
					   		groupField : ['fchgAgenCode'],
					   		groupColumnShow : [true],
					   		groupText : ['<b>{0}</b>'],
					   		groupCollapse : false,
							groupOrder: ['asc'],
							groupSummary : [true],
							groupDataSorted : true
					   	},*/
					};
					
					if (extOptions){
						var extCfg = new Function("return " + extOptions

								+ ";")();
					if (extCfg){
								op=$.extend(op,extCfg);
					}
						
					}
					if (usePage) {
						op["pager"] = "#" + pageId;
						op["rowNum"] = rowNum == 0 ? (pageList[0] * 1) : rowNum;
						op["rowList"] = pageList;
						op["page"] = page;
					} else {
						op["rowNum"] = -1;
					}
					if (sortname) {
						op["sortname"] = sortname;
						op["sortorder"] = sortorder;
					}

					if (treeGrid) {
						op["treeGridModel"] = 'adjacency';
						var treeColumn = $this.attr("treeColumn");
						if (treeColumn) {
							op["ExpandColumn"] = treeColumn;
						}
						var treeReader = {
							level_field : $this.attr("levelField") || "level",
							parent_id_field : $this.attr("parentField")
									|| "parent",
							leaf_field : $this.attr("leafField") || "leaf",
							expanded_field : $this.attr("expandedField")
									|| "expanded",
							loaded : $this.attr("loadedField") || "loaded",
							icon_field : $this.attr("iconField") || "icon"
						};
						op["treeReader"] = treeReader;
					}
					if (events) {
						var es = $this.getJsEvent(events);
						/* 对gridcomplete事件进行处理防止内置处理和外部事件处理冲突 */
						var completHandler = es["gridComplete"];
						if (completHandler) {
							var gridHandle = op.gridComplete;
							es["gridComplete"] = function() {
								gridHandle.apply(this, arguments);
								completHandler.apply(this, arguments);
							};
						}
						$.extend(op, es);
					}
					/**
					 * 外部参数
					 */
					params = params ? $A.jsonEval(params) : {};
					if (transor) {
						params["__transor"] = transor;
					}
					op["postData"] = params;
				
					if (multiselect&&editRow){
						if (!op["beforeSelectRow"]){
						op["beforeSelectRow"]= function (rowid, e) {
						    var $myGrid = $(this),
						        i = $.jgrid.getCellIndex($(e.target).closest('td')[0]),
						        cm = $myGrid.jqGrid('getGridParam', 'colModel');
						    return (cm[i].name === 'cb');
						}
						}
						
					}
					
				/*	if (fit == true) {
							var p = $container.parent();
										var w = p.outerWidth();
										var h = p.outerHeight();
										op.width=w;
										op.height=h;
					}*/
				$this.jqGrid(op);
				/**
				 * 多表头
				 */
				if (gridheaders){
					var gridheadersCfg=$.parseJSON(gridheaders);
					var inColumnHeaders = function(colHeader) {
						var length = colHeader.groupHeaders.length, i;
						$this.jqGrid('setGroupHeaders', colHeader);
						for (i = 0; i < length; i++) {
						if (colHeader.groupHeaders[i].groupHeaders) {
							colHeader.groupHeaders[i]["useColSpanStyle"]=colHeader["useColSpanStyle"];
							inColumnHeaders(colHeader.groupHeaders[i]);
						}
					}
					}
					inColumnHeaders(gridheadersCfg);
					$this[0].p.gridheadersCfg=gridheadersCfg;

				}
					
					
					//$this.jqGrid('setGroupHeaders', gridheadersCfg);
					
					
					//$this.jqGrid('bindKeys', {});
					/*sjq新增自动合计*/
					if (showFooter) {
						$this.bind("jqGridAfterGridComplete", function() {
							gridTotal();

						});
					};
					$container.bind('_resize', function(e,isresize,w,h) {
							
								var p=$container.parent(".layout-body");
								if (p.length>0){
								if (fit == true) {
										
									p.css("overflow","hidden");
										$container.innerWidth(w);
										$container.innerHeight(h);
										$this.jqGrid('setGridHeight', $container.height());
										$this.jqGrid('setGridWidth', $container.width());
										//p.css("overflow","");
								}else{
									
									if (p[0].offsetHeight<p[0].scrollHeight){
										w=w-18;
									}
									$container.innerWidth(w);
									$this.jqGrid('setGridWidth', $container.width());
								}
								}

								return false;
							});
					// $this.jqGrid("setFrozenColumns");

					if (editRow) {// 需要编辑行时
						var editOp = {
							keys : true
						};
						if (editSuccesfunc) {// 保存服务器上,成功后回调函数
							editOp.succesfunc = eval(editSuccesfunc);
						}
						var editTag = true;
						// 由单击产生编辑行
						$this.jqGrid('setGridParam', {
									onClickRow : function(rowid,rowid,colIndex) {
										var editOp = {
													keys: true,
													focus:colIndex
											};
										window.setTimeout(function() {
													if (editTag) {
														editTag = false;
														$this.jqGrid('editRow',
																rowid, editOp);
														editTag = true;
													}
												}, 0);
									}
								});
					}

					$this.attr("jqgrid", "true");
					$this.attr("init", "true");
					$this.attr("datatype", dataType);
				});

				// $("#test").addClass("appgrid jqgrid");
				// $("#test").jqGrid({});
				// alert($("#test").jqGrid("getGridId"));
				// alert($("#jqgrid3")[0].p.component.text.init());
				// alert($("#test")[0].p.component.text.init());
				// $("#mainGrid")[0].p.component.text.init =
				// function(pnlObj,colVal,rowIndex,colIndex,colModel){
				// $(pnlObj).html('改变了组件绑定！');
				// };
			};
			/**
			 * 重新加载表格
			 */
			$.fn.reloadJqGrid = function(params) {
				$(this).each(function() {
							var $this = $(this);
							var $grid = $this.getJqGrid();
							if ($grid && $grid.attr("init") == "true") {
								var dt = $grid.attr("datatype") || "json";
								params = params ? params : {};
								var transor = $this.attr("transor");
								if (transor) {
									params["__transor"] = transor;
								}
								
								if (params["baseParams"]){
										$this.data("baseParams",params["baseParams"]);
										delete params["baseParams"];
									}
								var baseParams=$this.data("baseParams");
								params=$.extend(true,params,baseParams);
								
								$grid.jqGrid('setGridParam', {
											datatype : dt,
											treedatatype : dt,
											postData : params
										}).trigger("reloadGrid");
							} else if (params) {
								if ($this.hasClass(".jqgrid")) {
									$grid = $this;
								} else {
									$grid = $(".jqgrid[init!=true]", $this);
								}
								$grid.attr("autoLoad", "true");
								$grid.attr("params", $A.toJsonString(params));
							}
						});
			};
			/**
			 * @class
			 * @name bsgriD
			 * @description <jquery methods class> 网格控件jquery方法
			 *              @example
			 *              向id为mainGrid的网格追加新行|
			 * 	$("#mainGrid").bsgrid("appendRow","first");|
			 *              @example
			 *              例2：取id为mainGrid的网格编辑完成后数据对象|
			 *              $("#mainGrid").bsgrid("getEditData");//返回json对象|
			 */
			$.fn.bsgrid = function(pin) {
				if (typeof pin === 'string') {
					var methods = {
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name getGridId
						 * @desc 取得表格id
						 * @return {String} 表格id
						 */
						getGridId : function() {
							return this.attr("origionId");
						},
						/**
						 * 取网格属性 参数说明 pName 属性名
						 */
						getGridParam : function(pName) {
							return this.jqGrid("getGridParam", pName);
						},
						/**
						 * 设置网格属性 参数 newParams 网格属性对象
						 */
						setGridParam : function(newParams) {
							this.jqGrid("setGridParam", newParams);
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name appendRow
						 * @desc 追加一行数据到网格
						 * @param {string|int}
						 *            [rowPos=last] -
						 *            新行插入位置，可空。值说明："first"为追加在首行，"last"为追加在未行，"after"为目标行之后，"before"目标行前。默认为“last”
						 * @param {object}
						 *            [rowData=null] - 新增行的预置数据,可为空
						 * @param {string}
						 *            srcRowId -
						 *            新行插入位置的目标行ID,当rowindex参数值为after或是before时，必须指定该参数值，否则值应为空
						 * @param {boolean}
						 *            [isEdit=true] - 是否编辑行，可空,默认为true
						 */
						appendRow : function(rowData, rowPos, srcRowId, isEdit) {
							rowPos = rowPos ? rowPos : "last";
							rowData = rowData ? rowData : {};
							isEdit = (isEdit != "false" && isEdit != false);

							return this.each(function() {
								if (!this.grid) {
									return;
								}// 网格未创建时，结束
								var obj = $(this), reader = obj.jqGrid(
										"getGridParam", "jsonReader"), rowid = rowData[reader.id]
										|| $.jgrid.randId();

								rowData[reader.id] = rowid;
								var b = obj.jqGrid('addRowData', rowid,
										rowData, rowPos, srcRowId);

								if (b) {
									obj.jqGrid("setSelection", rowid);// add
																		// by tw
																		// 先选中该行
									if (isEdit) {
										obj.jqGrid('editRow', rowid, {
													keys : true
												}); // 设置grid单元格可编辑
									}
									// 滚动条滚动到新增行
									var ri = obj
											.jqGrid('getGridRowById', rowid).rowIndex;// 行下标
									var ch = $(this.grid.bDiv).outerHeight(), st = this.grid.bDiv.scrollTop, rpos = $(this.rows[ri])
											.position().top, rh = $(this.rows[ri])
											.outerHeight();
									if (rpos + rh >= ch + st) {
										this.grid.bDiv.scrollTop = rpos
												- (ch + st) + rh + st;
									} else if (rpos < ch + st) {
										if (rpos < st) {
											this.grid.bDiv.scrollTop = rpos;
										}
									}
								}
								return rowid;
							});
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name deleteRow
						 * @desc 删除网格一个已选中的行，或删除指定行号
						 * @param {string|array}
						 *            [rowid=当前选中行] - 行ID,可为id数组,默认为当前选中行
						 */
						deleteRow : function(rowid) {
							return this.each(function() {
								var rowids;
								if (rowid) {// 有指定行号时
									rowids = $.isArray(rowid) ? rowid : [rowid];
								} else {
									if (this.p.multiselect
											&& this.p.selarrrow.length > 0) {
										rowids = this.p.selarrrow;
									} else {
										rowids = [this.p.selrow];
									}
								}
								for (var i = 0; i < rowids.length; i++) {
									var id = rowids[i];
									if (!id)
										return;
									$(this).jqGrid('delRowData', id);
								}
							});
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name submitData
						 * @desc 提交网格数据到服务器
						 * @param {string}
						 *            url - 提交的地址，可空，为空时提交的地址为网格editUrl属性值
						 * @param {function}
						 *            success - 成功时执行的回调函数，参数为服务端返回的数据对象
						 * @param {function}
						 *            error - 错误时执行的回调函数
						 * @param {function}
						 *            exception - 异常时执行的回调函数
						 * @param {function}
						 *            before - 提交数据之前执行的函数
						 */
						submitData : function(url, success, error, exception,
								before) {
							return this.each(function() {
										$(this).jqGrid('submitData', success,
												url, error, exception, before);
									});
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name getSubmitData
						 * @desc 获取网格编辑后的需要提交服务的数据
						 * @return {object}
						 *         数据对象,数据对象格式：{"add":[{},{}],"update":[{},{}],"del":[{},{}]}
						 */
						getSubmitData : function() {
							return $(this).jqGrid("getSubmitData");
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name getComponent
						 * @desc 获取某个网格的组件对象,取到该对象后，根据实际业务进行改写组件
						 * @param {string}
						 *            editType - 组件类型
						 * @return {component} 组件对象
						 */
						getComponent : function(editType) {
							if (!editType || this.length == 0)
								return null;
							return this[0].p.component[editType];
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name hideCol
						 * @desc 隐藏指定列
						 * @param {string|array}
						 *            colName - 列名字符串，或者是列名数组对象
						 */
						hideCol : function(colName) {
							if (colName) {
								var arys = $.isArray(colName)
										? colName
										: [colName];
								$(this).jqGrid("hideCol", arys, "none");
							};
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name showCol
						 * @desc 显示指定列
						 * @param {string|array}
						 *            colName - 列名字符串，或者是列名数组对象
						 */
						showCol : function(colName) {
							if (colName) {
								var arys = $.isArray(colName)
										? colName
										: [colName];
								$(this).jqGrid("showCol", arys, 'display');
							}
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name setCell
						 * @desc 设置指定单元格的值
						 * @param {string}
						 *            rowid - 行id
						 * @param {string}
						 *            colName - 列名
						 * @param {string}
						 *            data - 指定的单元格值
						 * @param {string||object}
						 *            css - 指定单元格样式名
						 * @param {string}
						 *            properties - 单元格属性
						 * @param {boolean}
						 *            forceupd - 指定单元格为空时需要此表示设置为true
						 */
						setCell : function(rowid, colName, data, css,
								properties, forceupd) {
							$(this).jqGrid("setCell",rowid, colName, data, css,
									properties);
						},

						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name getCell
						 * @desc 取得指定单元格的值
						 * @param {string}
						 *            rowid - 行id
						 * @param {string}
						 *            colName - 列名
						 * @return 指定单元格的显示值
						 */
						getCell : function(rowid, colName) {
							return $(this).jqGrid("getCell", rowid, colName);
						},
						getCellEditor : function(colName) {

							var rowid = this.bsgrid("getSelectRowId");
							if (!rowid)
								return null;
						

									
				var $t = $(this).jqGrid("getJqGridObj"), pos =-1;
					if(!$t.grid) {return;}
					if(isNaN(colName)) {
						$($t.p.colModel).each(function(i){
							if (this.name === colName) {
								pos = i;return false;
							}
						});
					}
						if(pos>=0) {
							var ind = $($t).jqGrid('getGridRowById', rowid); 
							var cellDom = $("td:eq("+pos+")",ind);
						
							if (!cellDom)
								return null;
							var $cellDom= $(cellDom);
							var $input = $cellDom.find("input:first-child");
							if ($input.length > 0) {
								return $("#" + $input[0].id);
							}else{
								if ($cellDom.length>0){
									return $("#" + $cellDom[0].id);
								}else{
									return null;
								}
							}
						}
							return null;
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name setEditEnabled
						 * @desc 动态设置网格是否可编辑
						 * @param {boolean}
						 *            enabled - 是否可编辑
						 */
						setEditEnabled : function(enabled) {
							return this.each(function() {
										if (!this.grid) {
											return;
										}// 网格未创建时，结束
										if (!enabled) {// 失效
											var rs = $(this).jqGrid("saveRows",
													this);
											if (rs) {
												this.p.editRow = false;
											}
											return rs;
										} else {
											this.p.editRow = true;
											return true;
										}
									});
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name getEditRow
						 * @desc 取得当前编辑的行
						 * @param {json}
						 *            编辑行
						 */
						getEditRow : function() {
							var rows = this.getGridParam("savedRow");
							if (rows == null || rows.length == 0)
								return null;
							return rows[0];
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name getDataIDs
						 * @desc 取得所有行id
						 * @return {array} 所有id集合
						 */
						getDataIDs : function() {
							return this.jqGrid('getDataIDs');
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name getRowData
						 * @desc 选择或者反选行数据，有复选框时也支持
						 * @param {string}
						 *            rowid - 行ID
						 * @return 指定行数据
						 */
						getRowData : function(rowid) {
							return this.jqGrid('getRowData', rowid);
						}
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name setRowData
						 * @desc 选择或者反选行数据，有复选框时也支持
						 * @param {string}
						 *            rowid - 行ID
						 * @param {object}
						 *            data - 数据集
						 * @param {string}
						 *            [css=null] -
						 *            设置行样式,可空。值说明：可以是类名或者css配置对象，如:
						 *            "nev"或{"background":"red",border:"solid"}
						 */
						,
						setRowData : function(rowid, data, css) {
							this.jqGrid('setRowData', rowid, data, css);
						}
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name setSelection
						 * @desc 选择或者反选行数据，有复选框时也支持
						 * @param {string}
						 *            rowid - 行ID
						 * @param {boolean}
						 *            [onsr=true] - 选中行后是否触发行选中事件,默认为true
						 * @param {event}
						 *            e - 事件对象，可空
						 */
						,
						setSelection : function(rowid, onsr, e) {
							this.jqGrid('setSelection', rowid, onsr, e);
						}
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name resetSelection
						 * @desc 选择或者反选行数据，有复选框时也支持
						 * @param {string}
						 *            [rowid=全部行] - 行id,可空。不指定行id时，为所有行
						 */
						,
						resetSelection : function(rowid) {
							this.jqGrid('resetSelection', rowid);
						},

						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name resetEditData
						 * @desc 去除'由原网格编辑而生成要提交服务器上的数据'
						 */
						resetEditData : function() {
							$(this).jqGrid("resetEditData");
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name resetEditData
						 * @desc 去除'由原网格编辑而生成要提交服务器上的数据'
						 */
						refreshEditData : function(datas, isEdit) {
							var local = this.bsgrid("getSubmitData"), adds = local.add
									|| [], count = 0;
							$.each(data, function(i, row) {
										if (row.internalStatus == "ADD") {
											if (adds.length > count) {
												var posId = adds[count].id;
												this.bsgrid("appendRow", row,
														"after", pos, false);
												this.bsgrid("deleteRow", posId);
												count++;
											} else {
												this.bsgrid("appendRow", row,
														null, null, false);
											};
										} else if (row.internalStatus == UPDATE) {
											this.bsgrid("setRowData", row.id,
													row);
										};
									});
							this.bsgrid("resetEditData");
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name refreshAllData
						 * @desc 刷新表格所有数据,用新的数据数组替换原有的
						 * @param {array} datas - 数据数组
						 */
						refreshAllData : function(datas) {
							var o = this;
							o.bsgrid("clearData");
							$(datas).each(function(index, element) {
								o.bsgrid("appendRow", element, null, null,
										false);
							});
							o.bsgrid("resetEditData");
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name editRow
						 * @desc 编辑指定行
						 * @param {string} rowid - 行id
						 */
						editRow : function(rowid) {
							this.jqGrid('editRow', rowid);
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name restoreRow
						 * @desc 行恢复到非编辑状态,原编辑行还原到非编辑状态，且当前行正在编辑的值改动不保存
						 * @param {string} rowid - 行id
						 */
						restoreRow : function(rowid) {
							this.jqGrid('restoreRow', rowid);
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name setWidth
						 * @desc 动态设置网格宽，默认以px为单位
						 * @param {int|string} width - 宽度值
						 * @param {boolean} shrink - 表格列宽是否自适应
						 */
						setWidth : function(width, shrink) {
							this.jqGrid('setGridWidth', width, shrink);
						}
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name setHeight
						 * @desc 动态设置网格高度，默认以px为单位
						 * @param {int|string} height - 高度值
						 */
						,
						setHeight : function(height) {
							this.jqGrid('setGridHeight', height);
						},
					/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name reload
						 * @desc 设置基本参数，
						 * @param {object} params - 加载参数
						 */
						setBaseParams:function(params){
							$(this).each(function() {
								var $this = $(this);
								$this.data("baseParams",params);
							});
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name reload
						 * @desc 获取基本参数，
						 * @param {object} params - 加载参数
						 */
						getBaseParams:function(){
							var baseParams=null;
							$(this).each(function() {
								var $this = $(this);
								baseParams=$this.data("baseParams");
							});
							return baseParams;
						},
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name reload
						 * @desc 重新加载数据
						 * @param {object} params - 加载参数
						 */

						reload : function(params) {
							$(this).each(function() {
								var $this = $(this);
								var $grid = $this.getJqGrid();
								if ($grid && $grid.attr("init") == "true") {
									var dt = $grid.attr("datatype") || "json";
									params = params ? params : {};
									var transor = $this.attr("transor");
									if (transor) {
										params["__transor"] = transor;
									}
									if (params["baseParams"]){
										$this.data("baseParams",params["baseParams"]);
										delete params["baseParams"];
									}
									var baseParams=$this.data("baseParams");
									params=$.extend(true,params,baseParams);
									$grid.jqGrid('setGridParam', {
												datatype : dt,
												treedatatype : dt,
												postData : params
											}).trigger("reloadGrid");
								} else if (params) {
									if ($this.hasClass(".jqgrid")) {
										$grid = $this;
									} else {
										$grid = $(".jqgrid[init!=true]", $this);
									}
									$grid.attr("autoLoad", "true");
									$grid.attr("params", $A.toJsonString(params));
								}
							});
						},
						load : function(params) {
							$(this).each(function() {
								var $this = $(this);
								var $grid = $this.getJqGrid();
								if ($grid && $grid.attr("init") == "true") {
									var dt = $grid.attr("datatype") || "json";
									params = params ? params : {};
									var param = {
										page : 1
									};
									if (params.parma
											&& $.isPlainObject(params.parma)) {
										$.extend(param, params.parma);
									}
									if (params["baseParams"]){
										$this.data("baseParams",params["baseParams"]);
										delete params["baseParams"];
									}
									var transor = $this.attr("transor");
									if (transor) {
										params["__transor"] = transor;
									}
									var baseParams=$this.data("baseParams");
									params=$.extend(true,params,baseParams);
									$grid.jqGrid('setGridParam', {
												datatype : dt,
												treedatatype : dt,
												postData : params,
												isLoad:true
											}).trigger("reloadGrid", param);
								} else if (params) {
									if ($this.hasClass(".jqgrid")) {
										$grid = $this;
									} else {
										$grid = $(".jqgrid[init!=true]", $this);
									}
									$grid.attr("autoLoad", "true");
									$grid.attr("params", $A.toJsonString(params));
								}
							});
						},
						/**
						 * 网格下一页方法
						 */
						nextPage:function(){
							$(this).each(function() {
										var $this = $(this);
										var $grid = $this.getJqGrid();
										if ($grid&& $grid.attr("init") == "true") {
											var id=$this.attr("id");
											var nextBtnId="#next_"+id+"_pageTool";
											$(nextBtnId).click();
										}
									});
						},
						/**
						 * 网格上一页
						 */
						prvePage:function(){
						
								$(this).each(function() {
										var $this = $(this);
										var $grid = $this.getJqGrid();
										if ($grid&& $grid.attr("init") == "true") {
											var id=$this.attr("id");
											var nextBtnId="#prev_"+id+"_pageTool";
											$(nextBtnId).click();
										}
									});
					
						}
							
						/**
						 * @memberof bsgriD
						 * @function
						 * @instance
						 * @name clearData
						 * @desc 清除表格数据
						 */
						,
						clearData : function() {
							$(this).jqGrid("clearGridData", false);
						}
						/**
						 * @memberof bsgriD 
						 * @function
						 * @instance
						 * @name getSelectRowId
						 * @desc 取得最后选中行id
						 * @return {string}选中行id
						 */
						,
						getSelectRowId : function() {
							return this.jqGrid("getGridParam", "selrow");
						}
						/**
						 * @memberof bsgriD 
						 * @function
						 * @instance
						 * @name getSelectRow
						 * @desc 取得最后选中行数据
						 * @return {string}选中行id
						 */
						,
						getSelectRow : function() {
							var id = this.bsgrid("getSelectRowId");
							if (id)
								return this.bsgrid("getRowData", id);
						},
						/**
						 * @memberof bsgriD 
						 * @function
						 * @instance
						 * @name getSelectIds
						 * @desc 取得多个选中行id
						 * @return {array}选中行id
						 */
						getSelectIds : function() {
							return this.bsgrid("getGridParam", "selarrrow");
						},
						/**
						 * @memberof bsgriD 
						 * @function
						 * @instance
						 * @name loadData
						 * @desc 加载数据
						 * @return {json} data - json数据
						 */
						loadData : function(data) {
							$(this).each(function() {
								this.addJSONData(data);
							});
							//this[0].addJSONData(data);
						}
					};
					var fn = methods[pin];
					if (!fn) {
						throw ("该方法未定义: " + pin);
					}
					var args = $.makeArray(arguments).slice(1);
					return fn.apply(this, args);
				}
				return this;
			};
		});
