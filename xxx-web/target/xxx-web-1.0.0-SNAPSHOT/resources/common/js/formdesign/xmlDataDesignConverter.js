define(["app/widgets/app-widget", "app/core/app-options", "formdesign/attrdefinition"],
		function(Widget, DefaultOptions, AttrDefinition) {
			XmlDataDesignConverter = Widget.extend({
				attrs : {
					appJsObject : {
						"param" : "",
						"objs" : []
					}
				},
				CrossConfig : {
					pubConvertAttr : {
						"name" : "labelText",
						"action" : "url",
						"showField" : "showfield",
						"suggestField"	: "suggestfield"
					},
					pubOptions : {
						labelWidth : 100,
						isCustom : "false",
						autoLayout : "true"
					},
					ControlType : {
						NUMBER : {
							options : {
								type : "numberfield",
								fieldType : "number"
							}
						},

						DATETIME : {
							options : {
								type : "datetimefield",
								fieldType : "datetime"
							}
						},
						REFERENCE : {
							options : {
								type : "reference",
								fieldType : "reference"
							},
							convertAttr : {
								"comboFieldValue" : "valuefield",
								"comboFieldText" : "textfield"

							}
						},
						MONEY : {
							options : {
								type : "moneyfield",
								fieldType : "money"
							}
						},
						TEXTBOX : {
							options : {
								type : "textfield",
								fieldType : "textbox"
							}
						},
						TEXTFIELD : {
							options : {
								type : "textfield",
								fieldType : "textbox"
							}
						},
						TYPEAHEAD : {},
						TEXTAREA : {
							options : {
								type : "textarea"
							}

						},
						RADIOBOX : {
							options : {
								type : "radiobox"
							}
						},
						CHECKBOX : {
							options : {
								type : "checkbox"
							}
						},
						SUGGEST : {
							options : {
								type : "combobox",
								fieldType : "suggest"
							}
						},
						COMBOZTREE : {
							options : {
								type : "comboztree",
								fieldType : "comboztree"
							}
						},
						COMBOGRID : {
							options : {
								type : "combogrid",
								fieldType : "combogrid"
							}
							
						},
						COMBOBOX : {
							options : {
								type : "combobox",
								fieldType : "combobox"
							},
							convertAttr : {
								"comboFieldValue" : "valuefield",
								"comboFieldText" : "textfield"
							}
						},

						HIDDEN : {
							options : {
								type : "hidden"
							}
						},

						PASSWORD : {},
						JQGRID : {
							type : "jqGrid",
							convertAttr : {
								"loadUrl" : "url"

							}

						},
						ColumnButton : {
							convertAttr : {
								"handle" : "handler",
								"name" : "text",
								"icon":"iconCls"
							}
						},
						
						Button : {
							type : 'button',
							convertAttr : {
								"handle" : "handler",
								"name" : "text",
								"icon":"iconCls"
								
							}
						},
						MenuItem : {
							convertAttr : {
								"handle" : "handler",
								"name" : "text",
								"icon":"iconCls"
							}

						},
						GRID : {
							options : {
								autoLayout : "true"
							},
							autoLayout : "true",
							type : "grid",
							convertAttr : {
								"loadUrl" : "url"
							}

						},
						TREE : {
							options : {
								type : "tree"
							},
							convertAttr : {
								"loadUrl" : "url"
							}
						},
						PANEL : {
							options : {
								type : "panel"
							},
							convertAttr : {
								"name" : "title"
							}
						}
					}
				},

				parseJson : function(attrValue) {
					var o = this.get("appJsObject");

					// try{
					var f = new Function(o.param, "return (" + attrValue + ")");
					var param = f.apply(this, o.objs);
					var isJsObjFun = false;
					if (o && o.objs) {
						for (var key in param) {
							isJsObjFun = false;
							if (typeof param[key] == "function") {

								for (var i = 0; i < o.objs.length; i++) {
									var params = o.param.split(",")
									var obj = o.objs[i];
									for (var key2 in obj) {
										if (obj[key2] === param[key]) {
											var name = params[i] + "." + key2;
											param[key]["funname"] = name;
											isJsObjFun = true;
										}
									}
									/*
									 * if (obj.isPrototypeOf(param[key])){
									 * console.log(param[key]) }
									 */

								}
								if (!isJsObjFun) {
									param[key] = param[key].toString();
								}

							}
						}
					}
					return param;
					/*
					 * }catch(e){ alert(attrValue); alert(o.param);
					 * window.alert(e); return {}; }
					 */
				},
				eventConverter : function(events) {
					var newEvents = {};
					if (events) {
						if ($.isArray(events.Event)) {
							events = events.Event;
						} else {
							events = [events.Event];
						}
						for (var i = 0, len = events.length; i < len; i++) {
							var event = events[i], params = [];
							var eventName = event["id"], eventFun = event["$"]
									|| event["handle"] || event["#text"];
							delete event.id;
							delete event.$;
							delete event.handle;
							for (key in event) {
								params.push(event[key]);
							}
							eventFun = eventFun.replace(/\t/g, '').replace(
									/\n/g, '');
							// var function_name = new
							// Function(params.join(","), function_body)
							var newfun = "function(" + params.join(",") + "){"
									+ eventFun + "}";
							newEvents[eventName] = newfun;
						}
						return newEvents;
					}
				},
				queryConveter : function(item) {
					if (item) {
						
						var _self=this;
						var converQueryItem=function(queryItems){
							
							var newQueryItems=[];
							 queryItems.forEach(function(queryItem,index){
								 queryItem=_self.formItemConver(queryItem, false);
								 if (!queryItem.field){
								 	queryItem.field=queryItem.id;
								 }
								 newQueryItems.push(queryItem)
							 })
								
						return newQueryItems;
						}
						if (item.quicks) {

							if ($.isArray(item.quicks.QueryItem)) {
								item.quicks = item.quicks.QueryItem;
							} else {
								item.quicks = [item.quicks.QueryItem];
							}
							item.quicks=converQueryItem(item.quicks)
						}
						if (item.advances) {

							if ($.isArray(item.advances.QueryItem)) {
								item.advances = item.advances.QueryItem;
							} else {
								item.advances = [item.advances.QueryItem];
							}
							
							item.advances=converQueryItem(item.advances)
						}
						
						
					}
					return item;
				},
				buttonItemConver : function(item) {
					if (item) {
						var _self = this;
						var converMenu = function(item) {
							if (item.menus) {
								if ($.isArray(item.menus.MenuItem)) {
									item.menu = item.menus.MenuItem;
								} else {
									item.menu = [item.menus.MenuItem];
								}
								for (var i = 0; i < item.menus.length; i++) {
									_self.buttonItemConver(item.menus[i]);
									_self.convertAttrData("MenuItem",
											item.menus[i]);
								}
								delete item.menus.MenuItem;
							}
						}
						converMenu(item);
						if (item.menu) {
							item.type = "menubutton";
						} else {
							item.type = "button";
						}
						item = this.convertAttrData("Button", item);

						return item;
						// console.log(item);

					}
					// this.formItemConver(item,false);

				},
				converXgridColumns:function(columns) {
					
					        var converXgridButtons=function(buttons){
					        	if ($.isArray(buttons)){
					        		for(var i=0;i<buttons.length;i++){
					        			buttons[i]["iconCls"]=buttons[i].icon;
					        		}
					        	}
					        	
					        }
							if (columns) {
								var treeCol = {};
								for (var i = 0, len = columns.length; i < len; i++) {
									columns[i] = this.formItemConver(
											columns[i], true);
									// columns[i].title=columns[i].name;
									columns[i].id = columns[i].field;
									if (!columns[i].parentColumn) {
										columns[i].parentColumn = "";
									}
									if (columns[i].Button) {
										if ($.isArray(columns[i].Button)) {
											columns[i].buttons = columns[i].Button;

										} else {
											columns[i].buttons = [columns[i].Button];
										}
										for (var j = 0; j < columns[i].buttons.length; j++) {
											columns[i].buttons[j].editorType = "ColumnButton";
											columns[i].buttons[j] = this.formItemConver(
															columns[i].buttons[j],
															true);
										}
									}
									delete columns[i].Button;
									if (columns[i].editor) {
										if (columns[i].editor.columns) {
											columns[i].editor.columns = columns[i].editor.columns[0];
											columns[i].editor.columns = this
													.converXgridColumns(columns[i].editor.columns);
										}
										if (columns[i].editor.frozenColumnsRight) {
											columns[i].editor.frozenColumnsRight = columns[i].editor.frozenColumnsRight[0];
											columns[i].editor.frozenColumnsRight = this
													.converXgridColumns(columns[i].editor.frozenColumnsRight);
		
										}
										if (columns[i].editor.frozenColumns) {
											columns[i].editor.frozenColumns = columns[i].editor.frozenColumns[0];
											columns[i].editor.frozenColumns = this
													.converXgridColumns(columns[i].editor.frozenColumns);
		
										}
										if (columns[i].editor.fieldType){
											columns[i].fieldType=columns[i].editor.fieldType;
										}
									}else{
										columns[i].fieldType="";
									}
								}

							}
							var newColData = [];
							var createTreeData = function(columns, parentId) {

								var newCols = [];
								if (columns){
								for (var i = 0; i < columns.length; i++) {
									var col = columns[i];
									if (col.parentColumn == parentId) {
										col.children = createTreeData(columns,
												col.field);
										newCols.push(col);
									}

								}
								}
								return newCols;

							}
							columns = createTreeData(columns, "");

							return columns;
						},
				xGridItemConver : function(item) {
					if (item) {
						var _self = this;
						if (item.columns) {
							if (item.columns.XGridColumn) {
								item.columns = item.columns ? $
										.isArray(item.columns.XGridColumn)
										? item.columns.XGridColumn
										: [item.columns.XGridColumn] : [];
							} else {
								item.columns = item.columns;
							}
						}
						if (item.toolbar) {

							if ($.isArray(item.toolbar.Button)) {
								item.toolbar = item.toolbar.Button;
							} else {
								item.toolbar  = [item.toolbar.Button];
							}
							
							for (var j = 0; j < item.toolbar.length; j++) {
											item.toolbar[j].editorType = "ColumnButton";
											item.toolbar[j] = this.formItemConver(
															item.toolbar[j],
															true);
								}
						}
						if (item.frozenColumnsRight) {
							if (item.frozenColumnsRight.XGridColumn) {
								item.frozenColumnsRight = item.frozenColumnsRight
										? $.isArray(item.frozenColumnsRight.XGridColumn)
												? item.frozenColumnsRight.XGridColumn
												: [item.frozenColumnsRight.XGridColumn]
										: [];
							} else {
								item.frozenColumnsRight = item.frozenColumnsRight;
							}
						}
						if (item.frozenColumns) {
							if (item.frozenColumns.XGridColumn) {
								item.frozenColumns = item.frozenColumns
										? $
												.isArray(item.frozenColumns.XGridColumn)
												? item.frozenColumns.XGridColumn
												: [item.frozenColumns.XGridColumn]
										: [];
							} else {
								item.frozenColumns = item.frozenColumns;

							}
						} else {
							item.frozenColumns = [];
						}
						item.type = "grid";
						item.columns = this.converXgridColumns(item.columns);
						item.frozenColumnsRight = this.converXgridColumns(item.frozenColumnsRight);
						item.frozenColumns = this.converXgridColumns(item.frozenColumns);
						item.editorType = "GRID";
						item = this.formItemConver(item, true);
						return item;
					}
				},
				jqGridItemConver : function(item) {
					// var pubConvertAttr=this.CrossConfig.pubConvertAttr;
					if (item) {
						var columns = item.Column;
						item.type = "jqgrid";
						if (columns) {
							for (var i = 0, len = columns.length; i < len; i++) {
								columns[i] = this.formItemConver(columns[i],
										true);
								columns[i].title = columns[i].name;
								columns[i].field = columns[i].id;
								if (columns[i].buttons) {
									if (typeof columns[i].buttons.Button == "object") {
										columns[i].buttons = [columns[i].buttons.Button];
									} else {
										columns[i].buttons = columns[i].buttons;
									}

								}

								delete columns[i].name;
								// title:'列1',field:'column1',width:100
							}
						}
						item.columns = columns;
						delete item.Column;
						item.editorType = "JQGRID";
						this.formItemConver(item, true);
						return item;
					}
				},

				formItemConver : function(item, isGrid) {
					var pubConvertAttr = this.CrossConfig.pubConvertAttr;
					var controlTypes = this.CrossConfig.ControlType;
					item = $
							.extend(true, {}, this.CrossConfig.pubOptions, item);
					if (item.visible==undefined){
						item.visible="true";
					}
					if (item) {
						if (!item.editorType) {

							if (item.visible == "false") {
								item.editorType = "HIDDEN";
							} else {
								item.editorType = "TEXTBOX";
							}
							if (isGrid) {
								if (!item["editable"]
										|| item["editable"] == "false") {
											item["editable"]=false;
									item.editorType = null;
								}
							}
						}else{
								if (item.visible == "false") {
									 item.hidden="true";
								}
						}
						/*if (item.visible == "false") {
							item.editorType = "HIDDEN";
						}*/

						// item=this.parseJson(editorOptions)
						if (item.editOptions || item.editorOptions) {
							var editorOptions = item.editOptions
									|| item.editorOptions;
							if (typeof(editorOptions) == "string") {

								var editOptions = this.parseJson(editorOptions);

								if (isGrid) {
									// editOptions.type=item.editorType
									// toLowerCase
									item["editor"] = editOptions || {};
									item["editor"]["events"] = item["events"];
									delete item["events"];
									// item["editor"]=item["editor"]
								} else {
									$.extend(item, editOptions);
								}

							} else if (typeof(editorOptions) == "object") {
								if (isGrid) {
									item["editor"]=editorOptions;
									if (item["events"]){
										item["editor"]["events"] = item["events"];
									}
									delete item["events"];
								}else{
									$.extend(item, item.editOptions);
								}
							}
							delete item.editOptions;
							delete item.editorOptions
						}
						if (controlTypes[item.editorType]) {
							var type = controlTypes[item.editorType];
							if (isGrid) {
								if (item.editorType == "GRID") {
									item = $.extend(item, type.options);
									item = this.convertAttrData(
											item.editorType, item);

								} else {
									$.extend(item["editor"], type.options);
									if (item["editor"]) {
										item["editor"] = this
												.convertAttrData(
														item.editorType,
														item["editor"]);
									}
								}
								// item["editor"]=this.convertAttrData(item.editorType,item["editor"]);
							} else {
								$.extend(item, type.options);
							}
							item = this.convertAttrData(item.editorType, item);

							/*
							 * var convertAttr=type.convertAttr; if
							 * (convertAttr){ for(var key in convertAttr){
							 * item[convertAttr[key]]=item[key]; delete
							 * item[key]; } }
							 */
						}
					//	delete item.editorType
						if (!isGrid) {
							for (var key in pubConvertAttr) {
								if (item[key]){
								item[pubConvertAttr[key]] = item[key];
								delete item[key];
								}
							}
						}
						if (!isGrid) {
							if (item.columns){
								item.columns=item.columns[0];
								item.columns = this.converXgridColumns(item.columns);
							}
							if (item.frozenColumnsRight){
								item.frozenColumnsRight=item.frozenColumnsRight[0];
								item.frozenColumnsRight = this.converXgridColumns(item.frozenColumnsRight);
	
							}
							if (item.frozenColumns){
								item.frozenColumns=item.frozenColumns[0];
								item.frozenColumns = this.converXgridColumns(item.frozenColumns);
	
							}
						}
							return item;
					}
					return null;
				},
				mergeOptions : function(type, item) {
					
					var controlTypes = this.CrossConfig.ControlType;
					var type = controlTypes[type];
					if (type) {
						item = $.extend(item, type.options);
					}
					return item;
				},
				convertAttrData : function(type, item) {
					var controlTypes = this.CrossConfig.ControlType;
					var type = controlTypes[type];
					if (type) {
						var convertAttr = type.convertAttr;
						if (convertAttr) {
							for (var key in convertAttr) {
								if (item[key]){
									item[convertAttr[key]] = item[key];
									delete item[key];
								}
							}
						}
					}
					if (item["events"]) {
						item["events"] = this.eventConverter(item["events"])
					}
					return item;
				},
				createBusiControls : function(busiControData, parentControl) {
					var busiControlsGroup = [];
					var xmlData = busiControData;
					if (busiControData) {
						// var xmlData = busiControData["Page"];
						// console.log(xmlData)
						for (key in xmlData) {
							switch (key) {

								case "Page" :
									var pageItem = $.extend(true, {},
											xmlData[key]);
									var pageControl = pageItem;
									pageControl.type = "page"
									pageControl.items = [];
									parentControl = pageControl;
									if (xmlData[key].items) {
										var childControlObj = this
												.createBusiControls(
														xmlData[key].items,
														pageControl);
										busiControlsGroup = busiControlsGroup
												.concat(childControlObj.busiControlsGroup)
									}

									break;
								case "Form" :
									var panelItems = xmlData[key];
									panelItems = [].concat(panelItems);
									for (var i = 0, len = panelItems.length; i < len; i++) {
										var panel = $.extend(true, {},
												panelItems[i]);
										panel = this.mergeOptions("PANEL",
												panel);
										panel = this.convertAttrData("PANEL",
												panel);
										panel.items = [];
										panel.type = "formpanel";
										if (panel.width){
											panel.dock="left"
										}else{
											panel.dock = "width";
										}
										
										panel.formId=panel.id;
										panel.id=panel.id+"_formPanel";
										if (!panel.height){
											panel.height=parentControl.height;
										}
										if (parentControl) {

											parentControl.items.push(panel);

										}

										if (panelItems[i].items) {
											var childControlObj = this
													.createBusiControls(
															panelItems[i].items,
															panel);
											busiControlsGroup = busiControlsGroup
													.concat(childControlObj.busiControlsGroup)
										}
									}
									break;
								case "TabPanel" :
								case "Panel" :
									var docks = {
										"north" : "top",
										"south" : "bottom",
										center : "fill",
										west : "left",
										east : "right"
									};
									var panelItems = xmlData[key];
									panelItems = [].concat(panelItems);
									for (var i = 0, len = panelItems.length; i < len; i++) {

										var panel = $.extend(true, {},
												panelItems[i]);
										panel = this.mergeOptions("PANEL",
												panel);
										panel = this.convertAttrData("PANEL",
												panel);
										panel.items = [];
										panel.type = "panel";

										if (panel.region) {
											panel.dock = docks[panel.region];
										}
										if (parentControl.layout=="vbox"){
											if (!panel.flex){
												panel.dock="width";
											}else{
												panel.dock="fill";
											}
										}
										if (parentControl.layout=="hbox"){
											if (!panel.flex){
												panel.dock="height";
												
											}else{
												panel.dock="fill";
											}
										}
										
										if (parentControl) {
											if (parentControl.type == "tabpanel") {
												panel.dock = "fill";
												if (i != 0) {
													panel.hidden = true;
												}
												parentControl.items.push(panel);
											} else {
												if (panel.autoLayout == "true"
														|| panel.autoLayout == undefined) {
													parentControl.items
															.push(panel);
												}
											}
										}

										if (panelItems[i].items) {
											var childControlObj = this
													.createBusiControls(
															panelItems[i].items,
															panel);
											busiControlsGroup = busiControlsGroup
													.concat(childControlObj.busiControlsGroup)
										}
									}
									break;
								case "Row" :
									var rowItems = xmlData[key];
									rowItems = [].concat(rowItems);
									var startIndex = 0;
									for (var i = 0, len = rowItems.length; i < len; i++) {
										var row = rowItems[i];
										var left = 2;
										if (row.items) {
											var childControlObj = this
													.createBusiControls(
															row.items,
															parentControl);

											for (var j = startIndex; j < parentControl.items.length; j++) {

												// var
												// width=parentControl.items[j-1]?parentControl.items[j-1].width:0;
												var top = i * 40+4;

												if (!parentControl.items[j].labelWidth) {
													parentControl.items[j].labelWidth = 100;
												}else{
													parentControl.items[j].labelWidth=parentControl.items[j].labelWidth+8
												}
												if (!parentControl.items[j].width) {
													parentControl.items[j].width = 220;
												} else {
													parentControl.items[j].width = parseInt(parentControl.items[j].width)
															+ parseInt(parentControl.items[j].labelWidth)+8;
												}
												if (parentControl.items[j].visible == "false") {
													/*parentControl.items[j].width = 0;
													if (!parentControl.items[j].editorType) {
														parentControl.items[j].editorType = "HIDDEN"
														parentControl.items[j].width = 18;
													}
*/
												}
												parentControl.items[j].top = top;
												parentControl.items[j].left = left;
												
												if (parentControl.items[j].editorType != "HIDDEN"&&!parentControl.items[j].hidden){

													left = left+ parseInt(parentControl.items[j].width,10);
												}
											
												

											}
											startIndex = parentControl.items.length;
											busiControlsGroup = busiControlsGroup
													.concat(childControlObj.busiControlsGroup);
										}
									}

									break;
								case "Query" :
									var querylItems = xmlData[key];
									querylItems = [].concat(querylItems);
									for (var i = 0, len = querylItems.length; i < len; i++) {

										var tabItem = $.extend(true, {},this.queryConveter(querylItems[i]));
										tabItem.type = "query";
										tabItem.items = [];
										
									
										/*
										 * if (querylItems[i].items){ var
										 * childControlObj=this.createBusiControls(querylItems[i].items,tabItem);
										 * busiControlsGroup=busiControlsGroup.concat(childControlObj.busiControlsGroup) }
										 */

										if (parentControl) {
											parentControl.items.push(tabItem);
										}
									}

									break;
								case "Tabs" :
									var tabslItems = xmlData[key];
									tabslItems = [].concat(tabslItems);
									for (var i = 0, len = tabslItems.length; i < len; i++) {

										var tabItem = $.extend(true, {},
												tabslItems[i]);;
										tabItem.type = "tabpanel";
										tabItem.autoCtreateTab = "true";
										tabItem.items = [];
										if (tabItem.fit){
											tabItem.dock="fill";
										}
										if (tabslItems[i].items) {
											var childControlObj = this
													.createBusiControls(
															tabslItems[i].items,
															tabItem);
											busiControlsGroup = busiControlsGroup
													.concat(childControlObj.busiControlsGroup)
										}
										if (parentControl) {
											parentControl.items.push(tabItem);
										}
									}

									break;
								case "FormItem" :
									var formitems = [];
									if ($.isArray(xmlData[key])) {
										formitems = xmlData[key];
									} else {
										formitems = [xmlData[key]];
									}
									for (var i = 0, len = formitems.length; i < len; i++) {
										var newFromData = this.formItemConver(
												formitems[i], false);
										if (newFromData) {
											busiControlsGroup.push({
												text : newFromData["labelText"],
												data : newFromData
											})
											if (parentControl) {
												var formItemData = $.extend(
														true, {}, newFromData);
												formItemData.forForm = parentControl.formId || parentControl.forForm|| parentControl.id;
												if (formItemData.autoLayout == "true") {
													parentControl.items
															.push(formItemData);
												}
											}
										}
									}

									break;
								case "Grid" :
									var griditems = [];
									if ($.isArray(xmlData[key])) {
										griditems = xmlData[key];
									} else {
										griditems = [xmlData[key]]
									}
									for (var i = 0, len = griditems.length; i < len; i++) {
										var newFromData = this
												.jqGridItemConver(griditems[i]);
										if (newFromData) {
											busiControlsGroup.push({
														text : newFromData["text"]
																|| "网格列表"
																+ (i + 1),
														data : newFromData
													})
											if (parentControl) {
												var gridItemData = $.extend(
														true, {}, newFromData);
												if (parentControl.type == "panel"
														|| parentControl.type == "tabpanel") {
													if (!gridItemData.dock) {
														gridItemData.dock = "fill";
													}
												}
												if (gridItemData.autoLayout == "true") {
													parentControl.items
															.push(gridItemData);
												}
											}
										}
									}
									break;
								case "XGrid" :
									var griditems = [];
									if ($.isArray(xmlData[key])) {
										griditems = xmlData[key];
									} else {
										griditems = [xmlData[key]]
									}
									for (var i = 0, len = griditems.length; i < len; i++) {
										// console.log(griditems[i])
										var newFromData = this
												.xGridItemConver(griditems[i]);
										if (newFromData) {
											busiControlsGroup.push({
														text : newFromData["text"]
																|| "网格列表"
																+ (i + 1),
														data : newFromData
													});
											if (parentControl) {
												var gridItemData = $.extend(
														true, {}, newFromData);
												if (parentControl.type == "panel"
														|| parentControl.type == "tabpanel") {
													if (!gridItemData.dock) {
														gridItemData.dock = "fill";
													}
												}
												if (gridItemData.autoLayout == "true") {
													parentControl.items
															.push(gridItemData);
												}
											}
										}
									}
									break;
									
								case "ButtonArea" :
									var buttonAreas = [];
									if ($.isArray(xmlData[key])) {
										buttonAreas = xmlData[key];
									} else {
										buttonAreas = [xmlData[key]]
									}
									for (var i = 0, len = buttonAreas.length; i < len; i++) {
										var buttons=[];
										var buttonArea=buttonAreas[i];
										if ($.isArray(buttonArea["Button"])){
											buttons=buttonArea["Button"];
										}else{
											buttons=[buttonArea["Button"]];
										}
										buttonArea.buttons=[];
										buttonArea.type="buttonarea";
										var _self=this;
										$.each(buttons,function(index,button){								
											buttonArea.buttons.push(_self.buttonItemConver(button));
										});			
										delete buttonArea.Button;
										if (parentControl) {
											//var lastItem=parentControl.items[parentControl.items.length];
											//lastItem.top
											var left=0;
											$.each(parentControl.items,function(intex,item){
												if (item.width){
												left=parseInt(item.width)+left;
												
												}
											})
											
											if (left){
												buttonArea.left=left
											}
											parentControl.items.push(buttonArea);
										}
										busiControlsGroup.push({text : buttonArea["text"]
																|| "工具条"
																+ (i + 1),
														data : buttonArea})
									}
								break;
								case "Button" :
									var buttonitems = [];
									if ($.isArray(xmlData[key])) {
										buttonitems = xmlData[key];
									} else {
										buttonitems = [xmlData[key]]
									}

									for (var i = 0, len = buttonitems.length; i < len; i++) {

										var newFromData = this
												.buttonItemConver(buttonitems[i])
										/*
										 * var
										 * newFromData=this.xGridItemConver(griditems[i]);
										 */
										if (newFromData) {
											// console.log(newFromData)
											busiControlsGroup.push({
														text : newFromData["text"],
														data : newFromData
													})
										}
									}
									break;
							
								
								case "Tree" :
									var treeitems = [];
									if ($.isArray(xmlData[key])) {
										treeitems = xmlData[key];
									} else {
										treeitems = [xmlData[key]]
									}
									for (var i = 0, len = treeitems.length; i < len; i++) {

										var newFromData = this.mergeOptions(
												"TREE", treeitems[i]);
										newFromData = this.convertAttrData(
												"TREE", newFromData);
										/*if (newFromData["events"]){
											
										}*/
										//newFromData.type="tree";
										if (newFromData) {
											busiControlsGroup.push({
														text : newFromData["text"]
																|| "树"
																+ (i + 1),
														data : newFromData
													})
										}
									}
							}
						}

					}

					//console.log(busiControlsGroup)
					return {
						busiControlsGroup : busiControlsGroup,
						control : parentControl
					};

				}

			})

			return XmlDataDesignConverter;
		})