define(["app/widgets/app-widget","app/core/app-options","formdesign/attrdefinition"],function(Widget,DefaultOptions,AttrDefinition){

	
	function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
	FormDesignConverter= Widget.extend({
				attrs : {
					controlData:null
				},
				ConverterConfig:{
				 "function":{
				 	attrNames:["handler","formatter","onChange","events","afterSelected","beforeLoad"],
				 	converFun:function(value){
				 		try{
				 			if (typeof value=="string"){
				 				if (value.indexOf(".")<0){
				 					return value;	
				 				}
				 				
				 			}
				 			if (typeof value=="object"){
				 				value=JSON.stringify(value);
				 			}
				 			if (typeof value=="function"){
				 				if (value["funname"]){
				 					value=value["funname"];
				 				}else{
				 					value=value.toString();
				 				}
				 			};
				 		
				 		if (value!=""){
				 			value="_{"+value+"}_";
				 		}
				 		return value;
				 	}catch(ex){
				 		if (console){
				 			console.log(value)
				 		}
				 	}
				 	}
				 	
				 }
			
				 
				}
				,CrossConfig:{
					ControlType : {
						button:{
							defaultOptKey : "Button"
						},
						menubutton:{
							defaultOptKey : "MenuButton"
						},
						textbox : {
							defaultOptKey : "Textbox"
						},
						number : {
							defaultOptKey : "Number"
						},
						datetime : {
							defaultOptKey : "DateTime"
						},
						combobox : {
							defaultOptKey : "Combobox"
						},
						combogrid : {
							defaultOptKey : "ComboGrid"
						},
						comboztree : {
							defaultOptKey : "Comboztree"
						},
						money : {
							defaultOptKey : "Money"
						},
						suggest:{
							defaultOptKey : "Combobox"
						
						},
						reference:{
							defaultOptKey : "Reference"
						},
						grid : {
							defaultOptKey : "Grid"
						},
						column:{
							defaultOptKey : "Column"
						},
						columnbutton:{
								defaultOptKey : "ColumnButton"
						},
						tree:{
							defaultOptKey: null
						}
						// "label" : LabelControl,
						/*
						 * "grid" : GridControl, "page":PageControl,
						 * "tabpanel":TabControl, "panel":PanelControl,
						 * "hidden":HiddenFieldControl
						 */
					}
				
				},
				initialize : function(options) {
					FormDesignConverter.superclass.initialize.call(this, options);
				},
				childToHtml:function(item){
					var html=[];
					if (item.items){
							for(var i=0;i<item.items.length;i++){
									html.push(this.controlToHtml(item,item.items[i]));
								}
					}
						return html.join(" ");
				},
				dataConverColumn:function(colnums){
					
				  	if (colnums){
				  		for(var i=0;i<colnums.length;i++){
				  				var children=colnums[i].children;
				  				colnums[i]=this.dataConver("column",colnums[i]);
				  				colnums[i].children=children;
				  			/*
							 * if (colnums[i]["editor"]){
							 * colnums[i]["editor"]=_self.dataConver(colnums[i]["editor"].type,colnums[i]["editor"]);
							 *  }
							 */
				  				if (colnums[i]["buttons"]){
					  				for(var j=0;j<colnums[i].buttons.length;j++){
										colnums[i].buttons[j].editorType="ColumnButton";
										colnums[i].buttons[j]=this.dataConver("columnbutton",colnums[i].buttons[j]);
									}
				  				}
				  		}
				  	
				
					  	colnums=this.convertColData(colnums);
					  	if (colnums){
							for(var i=0;i<colnums.length;i++){
								for(var j=0;j<colnums[i].length;j++){
									var col=colnums[i][j];
									if (col.children&&col.children.length>0){
										col.rowspan=1;
										col.colspan=col.children.length;
									}else{
										col.rowspan=colnums.length-i;
										col.colspan=1;
									}
									delete col.children;
								}
							}
						}
				  		}
					  	return colnums;
					  },
				gridDataConver:function(formitem){
					var _self=this;
					var item=$.extend(true,{},formitem);
				  /*	if (item["url"]){
									item["url"]=_contextPath +"/"+ item["url"];
					}*/
					  	var _self=this;
				
					  	 item.columns=this.dataConverColumn(item.columns);
					  	 item.frozenColumnsRight=this.dataConverColumn(item.frozenColumnsRight);
					  	 item.frozenColumns=this.dataConverColumn(item.frozenColumns);
				   
					item=this.dataTypeConvert("grid",item)
				   return item;
				},
				jqGridDataConver:function(type,formitem){
				  if (type=="jqgrid"){
				  	var item=JSON.parse(JSON.stringify(formitem));
				  	if (item["url"]){
									//item["url"]=_contextPath +"/"+ item["url"];
								}
				  	 var columns=item.columns,colnum,newColnums=[],frozenColumnsRight=[],buttonObj={};
					  	 for(var i=0,len=columns.length;i<len;i++){
					  	 	colnum=columns[i];
					  	 	if (colnum.columnType == "OP") {
								// colnum.title = "操作"
								/*
								 * if (colnum.buttons) { colnum.title = 0 var
								 * buttons = [], newButtons = []; if
								 * ($.isArray(colnum.buttons.Button)) { buttons =
								 * colnum.buttons.Button; } else { buttons =
								 * [colnum.buttons.Button] };
								 *  //
								 * $A('#"+item.id+"').grid('appendRow',{});$A('#"+item.id+"').grid('locateCurrent',{});
								 * buttonObj={ name : "新增", ico : "btn-addList",
								 * handler:"function(){$A('#"+item.id+"').grid('appendRow',{});$A('#"+item.id+"').grid('locateCurrent',{});}" }
								 * newButtons.push(this.dataConver( "button",
								 * buttonObj)); for (var j = 0; j <
								 * buttons.length; j++) {
								 * newButtons.push(this.dataConver("button",{
								 * name : buttons[j].name, icon :
								 * buttons[j].icon, handler:"function(rowData,
								 * rowIndex){$A('#"+item.id+"').grid('deleteRow',rowIndex)}"
								 * })); } colnum.buttons = newButtons; }
								 */
								frozenColumnsRight.push(this.dataConver(
										"column", colnum));
							} else {
								/*
								 * if (colnum.editor){ colnum.editor[""] }
								 */
								newColnums.push(this.dataConver("column",
										colnum));

							}
					
					  	 }
					  	 item.columns=[newColnums];
					  	 item.frozenColumnsRight=[frozenColumnsRight];
				   }
					item=this.dataTypeConvert("grid",item)
				   return item;
				},
				dataConver:function(type,item){
					var crossConfig = this.CrossConfig, appDefaults = DefaultOptions.appDefaults;
					var newdata = item;
					if (type && item) {
						if (item.events){
							item= $.extend({}, item,item.events);
						}
							delete item.events;
						if (crossConfig["ControlType"][type]) {
							var optionsKey = crossConfig["ControlType"][type]["defaultOptKey"];
								if (item["url"]){
									//item["url"]=_contextPath +"/"+ item["url"];
								}
							if (optionsKey) {
								var options = appDefaults[optionsKey];
								var newOptions = $.extend(true,{}, item);;
							
								for (var key in item) {
									// console.log(newOptions[key]);
								
									/*if (options){
										if (options.hasOwnProperty(key)){
											newOptions[key] = item[key];
										}
									}else{
										newOptions[key] = item[key];
									}*/
									
									for(var converKey in this.ConverterConfig){
										var converterConfig=this.ConverterConfig[converKey];

										if ($.inArray(key, converterConfig.attrNames)>-1){
											
										if (key=="events"){
											delete newOptions[key];
										}else{
											newOptions[key]=converterConfig.converFun(item[key]);
										}
											/*
											 * console.log(key="=");
											 * console.log(newOptions[key])
											 */
										}
									}
									/*
									 * if (this.FunctionConverterConfig[key]){
									 * newOptions[key]=this.FunctionConverterConfig[key](item[key]); }
									 */
								}
								
									if (newOptions["editor"]){
									
										var fieldType=newOptions["editor"].fieldType;
										newOptions["editor"]=this.dataConver(newOptions["editor"].fieldType,newOptions["editor"]);
										newOptions["editor"]={type:fieldType,options:newOptions["editor"]};
										/*if (newOptions["editor"]["options"]["columns"]){
											newOptions["editor"]["options"]["columns"]=this.dataConverColumn(newOptions["editor"]["options"]["columns"]);
								    	}
										if (newOptions["editor"]["options"]["frozenColumnsRight"]){
											newOptions["editor"]["options"]["frozenColumnsRight"]=this.dataConverColumn(newOptions["editor"]["options"]["frozenColumnsRight"]);
								    	}
										if (newOptions["editor"]["options"]["frozenColumns"]){
											newOptions["editor"]["options"]["frozenColumns"]=this.dataConverColumn(newOptions["editor"]["options"]["frozenColumns"]);
								    	}*/
								    	
								}
								newOptions = $.extend({}, newOptions);
							    if (fieldType=="combogrid"||type=="combogrid"){
							    	if (newOptions.columns){
							    		newOptions.columns=this.dataConverColumn(newOptions.columns);
							    	}
							    	if (newOptions.frozenColumnsRight){
							    	newOptions.frozenColumnsRight=this.dataConverColumn(newOptions.frozenColumnsRight);
							    	}
							    	if (newOptions.frozenColumns){
							    	newOptions.frozenColumns=this.dataConverColumn(newOptions.frozenColumns);
							    	}
							    }
								newdata = newOptions;
							}
						}
					}
					newdata=JSON.parse(JSON.stringify(newdata));
					newdata=this.dataTypeConvert(type,newdata);
					return newdata;
				},
				dataTypeConvert:function(type,newdata){
					if (type){
						type=type.toLowerCase()
							var crossConfig = this.CrossConfig;
					var optionsKey = crossConfig["ControlType"][type]["defaultOptKey"];
					var attrs= AttrDefinition.getControlAttrs(optionsKey);
					
					if (attrs){
					for(var i=0;i<attrs.length;i++){
						var attr=attrs[i];
						if (attr.dataType&&newdata[attr.id]){
							
							newdata[attr.id]=this.parseData(attr.dataType,newdata[attr.id])
							
						}
					}
					}
				
					
				}
					return newdata;
				},parseData:function(dataType,value){
					var newValue=value;
					switch(dataType){
						
						case "Boolean":
						if (value==""||value==null){
							newValue=false;
						}else{
							if (value=="false"){
								newValue=false;
							}
							if (value=="true"){
								newValue=true;
							}
							
						}
						break;
					/*
					 * case "String": newValue=value.toString();
					 * newValue=newValue.replace(/_\{/gi,"").replace(/\}_/gi,"");
					 * break;
					 */
					}
					return newValue;
					
				},
				
				
				attrConvertHtmlAtt:function(item){
					var html=[];
					for(key in item){
						if (item[key]){
						if (typeof item[key]=="object"){
								html.push(key+"='"+JSON.stringify(item[key])+"'");

						}else{
							html.push(key+"="+item[key]);
						}
						}
					}
					return html.join(" ");
				},
				convertColData:function(colnums,level){
					var newCol=null;
					level=level||0;
					if (colnums&&colnums.length>0){
						newCol=[];
						for(var i=0;i<colnums.length;i++){
							var col=colnums[i];
							
							if (!newCol[level]){
								newCol[level]=[];
							}
							newCol[level].push(col);
							if (col.children&&col.children.length>0){
								if (!newCol[level+1]){
									newCol[level+1]=[];
								}
								var childCol=this.convertColData(col.children,level+1);
								if (childCol){
									// col.colspan=childCol[level+1].length;
									newCol[level+1]=newCol[level+1].concat(childCol[level+1])
								};
							}/*
								 * else{ if (!col.colspan){
								 * col[colspan]=level+1; } }
								 */
							
						}
						
					}
				
					
					return newCol;
					
				
				},
			   toFormInputHtml:function(queryItem){
		        	
		          	var options=this.dataConver(queryItem.fieldType,queryItem);
					options.readonly=queryItem.readOnly=="true"?true:false;
					var optionsStr=JSON.stringify(options);
	   				var input="<input  class=\"app-"+queryItem["fieldType"]+"\" _options='"+optionsStr+ "'  width=\"100%\"  field=\""+queryItem["field"]+"\" name=\""+queryItem["id"]+"\" id=\""+queryItem["id"]+"\"/>";
	   				var required="";
	   				if (queryItem.required=="true")
							required="<span class=\"required\">*</span>";
	   				var lable="<label>"+required+queryItem["labelText"]+"</label>";
					return {
						label:lable,
				        input:input
					}
		        },
				
			 outQueryItems:function(items,maxCol,isQuick){

					var queryItemsHtml=[],subItemsHtml=[],hidebuffer=[];
					//var maxCol=2;
					maxCol=maxCol*2;
					var beginGroup="";
				
					var labelTemplate = "<td class=\"clabel ${css}\" " +
							" ${jUtil.replaceExp(style,'style')} >" +
							"<label class=\"left\">" +
									"${if(required)'<span class=\"required\">*</span>';}${name}</label></td>";
						var col=0;
						queryItemsHtml.push("<table class=\"query-itmes-table\"><tr>");
						for(var i = 0; i < items.length; i++){
						var  item = items[i];
						var options=this.dataConver(item.fieldType,item);
						options.readonly=item.readOnly=="true"?true:false;
						var optionsStr=JSON.stringify(options);
						
						if (item["visible"]!="true"){
							hidebuffer.push(this.toFormInputHtml(item)["input"]);
						}else{
						//当分组与上一个分组不一样结束分组
						if (beginGroup&&beginGroup!=item["group"]){	
								beginGroup=item["group"]
								subItemsHtml.push("</tr></table>");
								queryItemsHtml.push(subItemsHtml.join(""));
								queryItemsHtml.push("</td>");
								subItemsHtml.setLength(0);
								if (maxCol==col&&i!=items.length){
									queryItemsHtml.push("</tr>");
									queryItemsHtml.push("<tr>");
									col=0;
								}
						}
						//判断是否有分组
						if (item["group"]){
							//判断如果前一个分组还没结束则在子表格内输出控件
							if (beginGroup!=""){
								subItemsHtml.push("<td  class=\"clabel\">"+this.toFormInputHtml(item)["label"]+"</td>");
							}else{
								queryItemsHtml.push("<td  class=\"clabel\">"+this.toFormInputHtml(item)["label"]+"</td>");
								beginGroup=item["group"];
								subItemsHtml.push("<table class=\"query-itmes-sub-table\"><tr>");
								if (item["colSpan"]){
									var colSpan=parseInt(item["colSpan"]);
									var filedCol=colSpan*2-1;
									queryItemsHtml.push("<td class=\"cfield\" colspan=\""+filedCol+"\"> ");
									col+=colSpan;
								}else{
									queryItemsHtml.push("<td class=\"cfield \">");
									col++;
								}
							}	
						}else{
							queryItemsHtml.push("<td  class=\"clabel\">"+this.toFormInputHtml(item)["label"]+"</td>");
							 col++;
						}		
						if (!beginGroup){
							if (item["colSpan"]){
								var colSpan=parseInt(item["colSpan"]);
								var filedCol=colSpan*2-1;
								queryItemsHtml.push("<td class=\"cfield\" colspan=\""+filedCol+"\"> ");
								col+=filedCol;
							}else{
								queryItemsHtml.push("<td class=\"cfield \">");
								col++;
							}
							queryItemsHtml.push(this.toFormInputHtml(item)["input"]);
							queryItemsHtml.push("</td>");
						}else{
							subItemsHtml.push("<td class=\"cfield\">");
							subItemsHtml.push(this.toFormInputHtml(item)["input"]);
							subItemsHtml.push("</td>");
						}
						if (!beginGroup){
							if (maxCol==col&&i!=items.length){
								queryItemsHtml.push("</tr>");
								queryItemsHtml.push("<tr>");
								col=0;
							}
						}
						}
					}
					//结束子表格
					if (!!beginGroup){	
							subItemsHtml.push("</tr></table>");
							queryItemsHtml.push(subItemsHtml.join(""));
							queryItemsHtml.push("</td>");
							subItemsHtml=[];
							
					}
					if (!isQuick){
						
						if (col!=0&&col!=maxCol){
							for (var i=col;i<maxCol;i++){
								queryItemsHtml.push("<td class=\"clabel\"></td><td class=\"cfield\"></td>");
							}
						}
					}
					
					queryItemsHtml.push("</tr>");
					
					queryItemsHtml.push("</table>");
					queryItemsHtml.push("<div style=\"display:none\">");
					queryItemsHtml.push(hidebuffer.join(""));
					queryItemsHtml.push("</div>");
					return queryItemsHtml.join("");
						
						
					}
				 
			 ,
				
				controlToHtml:function(parent,item){
					var html=[];
					// var controlDatas=this.get("controlData"),item;
					if (item){
	
/*
 * var defautOption= console.log(defaultOptions)
 */
						// for(var i=0;i<controlDatas.length;i++){
							// item=controlDatas[i];
							switch(item.type){
							case "page":
								if (item.js){
												html.push("<input type=\"hidden\" id=\""+item.jsId+"\"  name=\"jsRequire\" value=\""+item.js+"\" />");
										}
										if (item.onPageLoad){
													html.push("<div class=\"__uiPageLoad\" style=\"display:none;\">");
										// html.push("<input type=\"hidden\"
										// id=\""+item.jsId+"\"
										// name=\"jsRequire\"
										// value=\""+item.js+"\" />");
														html.push(item.onPageLoad);
												html.push("</div>");
										}
							var layout={"border":"app-layout","vbox":"app-vboxLayout","hbox":"app-hboxLayout"}
										/*if (item.layout!=""){
											html.push("<div style=\"width:100%;height:100%\" class=\""+layout[item.layout]+"\" >");
										}else{
											html.push("<div style=\"position: absolute;height:"+item.height+"px;width:"+item.width+"px\">")
										}
									*/
										html.push(this.childToHtml(item));
										//html.push("</div>");
							break;
							case "hidden":
							
								// <input type="hidden" style="" value=""
								// manual="false">
								html.push("<div style=\"display:none;position: absolute;top:"+item.top+"px;left:"+item.left+"px;height:"+item.height+"px;width:"+item.width+"px\"><div class=\"formitem control-field\"  forForm=\""+item["forForm"]+"\" item-field=\""+(item["field"]?item["field"]:item["id"])+"\"  item-showfield=\""+item["showfield"]+"\"   style=\"width:"+inputWidth+"px\"><div class=\"editor\"><input  type=\"hidden\"  hiddencomp=\"true\"  	name=\""+item["id"]+"\" id=\""+item["id"]+"\"/></div></div></div>");

							break;
							case "button":
							case "menubutton":
								var creatMenuHtml=function(menuItems){
										var menuHtml=[];
										for(var i=0,len=menuItems.length;i<len;i++){
											var menuItem=menuItems[i];
											if (!menuItem.menu){
												menuHtml.push("<div data-options='"+JSON.stringify(menuItem)+"'>"+menuItem["text"]+"</div>");
											}else{
													menuHtml.push("<div>")
													menuHtml.push("<span>"+menuItem["text"]+"</span>")
													menuHtml.push("<div>")
													menuHtml.push(creatMenuHtml(menuItem.menu))
													menuHtml.push("</div>")
													menuHtml.push("</div>")
											}
										}
										return menuHtml.join("");
								} 
							  var options=this.dataConver(item.type,item);
							  if (item.menu){
							  	options.menu=item.id+"_menu";
							  }
							  html.push("<div style=\"position: absolute;top:"+item.top+"px;left:"+item.left+"px;height:"+item.height+"px;width:"+item.width+"px\"><a class=\"app-"+item.type+"\" id=\""+item.id+"\" data-options='"+JSON.stringify(options)+"'>"+item.text+"</a>");

							   if (item.menu){
							   	 html.push("<div id=\""+options.menu+"\">");
							   	 html.push(creatMenuHtml(item.menu))
							   	 html.push("</div>");
							   }
						 	 html.push("</div>");
							
							break;
							case "combobox":
							case "numberfield":
							case "moneyfield":
							case "datetimefield":
							case "comboztree":
							case "reference":
							case "combogrid":
							case "textfield":
								var fieldType=item["fieldType"];
								
								
								var options=this.dataConver(fieldType,item);
								options.readonly=item.readOnly=="true"?true:false;
							  	if (!options.data){
							  	delete options.data;
							  	}
								var labelWidth=item["labelWidth"]-5;
								var inputWidth=item["width"]-item["labelWidth"];
								options["width"]=inputWidth;
								var optionsStr=JSON.stringify(options)
								optionsStr=optionsStr.replace(/"_\{/gi,"").replace(/\}_"/gi,"").replace(/"/gi,"&quot;");

								var required="";
								if (item.required=="true")
								required="<span class=\"required\">*</span>";
							// console.log(item["width"])
								
								var hiddenHtml="",showFieldHtml="";;
								if (item.type=="hidden"){
									hiddenHtml=" hiddencomp=true";
								}
								if (item["showfield"]){
									showFieldHtml=" item-showfield=\""+item["showfield"]+"\"";
								}
								var hideStyle="";
								if (item.hidden=="true"||item.hidden==true){
									
									 hideStyle=";display:none;"
								}
								/*
								 * var options={}; options["data"]=item["data"];
								 */
								var gearRules="";
								if (item["gearRules"]){
						
									gearRules=" gearRules=\""+JSON.stringify(item["gearRules"]).replace(/"_\{/gi,"").replace(/\}_"/gi,"").replace(/"/gi,"&quot;")+"\"";
								}							
							
								html.push("<div  class=\""+item["id"]+"\" forpanel=\""+item["forPanel"]+"\"  style=\""+hideStyle+"position: absolute;top:"+item.top+"px;left:"+item.left+"px;height:"+item.height+"px;width:"+item.width+"px\"><label id=\"label_"+item["id"]+"\" class=\"control-field-label\" style=\"width:"+labelWidth+"px\">"+required+item["labelText"] +"</label><div class=\"formitem control-field\" forForm=\""+item["forForm"]+"\" item-field=\""+(item["field"]?item["field"]:item["id"])+"\"   "+showFieldHtml+"  style=\"width:"+inputWidth+"px\"><div class=\"editor\" style=\"text-align:left;\"><input "+hiddenHtml+" class=\"app-"+item["fieldType"]+"\" _options='"+optionsStr+ "' "+gearRules+"  width=\"100%\"  field=\""+item["field"]+"\" name=\""+item["id"]+"\" id=\""+item["id"]+"\"/></div></div></div>");
								break;
							case "formpanel":
								item.form="true";
							
								if (parent&&parent.type=="panel"){
									// style=\"height:"+item.height+"px;"+item.style+"\"
									html.push("<div class=\"desing-from form\" style=\"height:"+item.height+"px;"+item.style+"\">"); 
								html.push("<form id=\""+item.formId+"\" style=\"display:block;position: relative;height:100%;\"  action=\""+(item.action||"")+"\" loadurl=\""+item.loadUrl+"\" class=\"required-validate\" opstate=\"\"> ");
								if (item.items){
									html.push(this.childToHtml(item));
						
								}
								
								html.push("</form>");
								html.push("</div>");
								break;
								}
									
								
								// item.formId=item.id;
								// item.id=item.id+"formPanel";
							case "panel":
									var region={"top":"north","bottom":"south","left":"west","east":"north",fill:"center"};
									var style=item["style"]||"";
									if (parent&&parent.type=="tabpanel"){
										var active="inactive";
											if (item.active==true){
												active="active"
											}
											html.push("<div id=\""+item.id+"\"  title=\""+item["title"]+"\" class=\"tab-panel "+active+"\" >");
									}else{
										
									
										
										if (parent.layout!=""){
											var options=$.extend({},item);
											if (parent.layout=="border"){
												
												delete options.items;
												delete options.style;
												if (region[item.dock]=="north"||region[item.dock]=="south"){
													delete options.width;
													delete options.top;
													delete options.left;
												}
												if (region[item.dock]=="west"||region[item.dock]=="east"){
													// delete options.height;
													// delete options.top;
													// delete options.left;
												}
												if (region[item.dock]=="center"){
													delete options.height;
													delete options.width;
													delete options.top;
													delete options.left;
												}
												var layout={"border":"app-layout","vbox":"app-vboxLayout","hbox":"app-hboxLayout"}
												var type;
												if (item.layout&&item.layout!=""){
													type=layout[item.layout];
							
												}else{
													type="app-panel";
												}
												html.push("<div class=\""+type+"\" id=\""+item.id+"\"  data-options='"+JSON.stringify(options)+"' region=\""+region[item.dock]+"\" style=\"height:"+item.height+"px;width:"+item.width+"px;"+style+"\">");

											}else if (parent.layout!="vbox"||parent.layout!="hbox"){
												if (item.dock=="width"){
													
													delete options.width;
													html.push("<div  id=\""+item.id+"\"  data-options='"+JSON.stringify(options)+"' style=\"height:"+item.height+"px;"+style+"\">");
												}
												if (item.dock=="height"){
													delete options.height;
													html.push("<div  id=\""+item.id+"\"  data-options='"+JSON.stringify(options)+"' style=\"width:"+item.width+"px;"+style+"\">");
												}
												if (item.dock=="fill"){
													delete options.height;
													delete options.width;
													html.push("<div  id=\""+item.id+"\" data-options='"+JSON.stringify(options)+"' flex=\""+item.flex+"\" style=\""+style+"\">");
												}
											}
										}else{
													html.push("<div style=\"position: absolute;top:"+item.top+"px;bottom:"+item.bottom+"px;left:"+item.left+"px;height:"+item.height+"px;width:"+item.width+"px;"+style+"\">")
										}
									}
									if (item.form=="true"&&item.formId!=""){
										// class=\"required-validate\"
										// opstate=\"\"
										// novalidate=\"novalidate\"
										// initedit=\"true\"
										html.push("<form id=\""+item.formId+"\" style=\"position: relative;\"  action=\""+item.action+"\" loadurl=\""+item.loadUrl+"\" class=\"required-validate\" opstate=\"\"> ");
										
									}
									if (item.items){
											html.push(this.childToHtml(item));
								
									}
										if (item.form=="true"&&item.formId!=""){
										html.push("</form>");
										
									}
								html.push("</div>");
							break;
							case "tabpanel":
							var temItem=$.extend(true,{},item);
							 delete temItem.items;
						
							if (parent.layout!="absolute"||parent.layout==""){
								temItem.fit=true;
								var _options=JSON.stringify(temItem);
								html.push("<div  id=\""+item.id+"\" class=\"app-tabs \"  data-options=\'"+ _options + "\'  >");

							}else{
								var _options=JSON.stringify(temItem);
									html.push("<div style=\"position: absolute;top:"+item.top+"px;left:"+item.left+"px;height:"+item.height+"px;width:"+item.width+"px\">")
									html.push("<div  id=\""+item.id+"\" class=\"app-tabs \"  data-options=\'"+ _options + "\'  >");
							}
							
						
								
								if (item.items){
									html.push(this.childToHtml(item));
								}
							
								html.push("	</div >");
								if (!(parent.dock=="fill"&&parent.layout!="absolute")){
									html.push("</div >");
								}
							break;
								case "jqgrid":
										if (parent.dock=="fill"&&parent.layout!="absolute"){
									delete item.width;
									delete item.height;
									item["autoheight"]=false;
								}
									var options=this.jqGridDataConver("jqgrid",item);
						
						
						
								var optionsStr=JSON.stringify(options);
								optionsStr=optionsStr.replace(/"_\{/gi,"").replace(/\}_"/gi,"").replace(/"/gi,"&quot;");
								// console.log(optionsStr);
								var gridHtml="<table id=\""+item["id"]+"\"  class=\"app-grid\" _options=\""+optionsStr+"\"></table>";
								if (item.dock=="none"){
											html.push("<div style=\"position: absolute;top:"+item.top+"px;left:"+item.left+"px;height:"+item.height+"px;width:"+item.width+"px\">"+gridHtml+"</div>")
								}else{
									if( item.dock=="fill"){
											html.push(gridHtml);
									}else{
											html.push("<div style=\"height:"+item.height+"px;width:"+item.width+"px\">"+gridHtml+"</div>")
									}
								}
								// console.log(gridHtml)
								// var gridHtml="<table id=\""+item["id"]+"\"
								// class=\"app-grid\"
								// _options='"+JSON.stringify(item)+"'></table>";
	
								break;
							case "grid":
								var data={};
				
								if (item.dock=="fill"){
									delete item.width;
									delete item.height;
									item["autoheight"]=false;
								}
								
								
									var options=this.gridDataConver(item);
									
									var optionsStr=JSON.stringify(options);
								optionsStr=optionsStr.replace(/"_\{/gi,"").replace(/\}_"/gi,"").replace(/"/gi,"&quot;");
								var gridHtml="<table id=\""+item["id"]+"\" class=\"app-grid\" _options='"+optionsStr+"'></table>";
								if (item.dock=="none"){
											html.push("<div style=\"position: absolute;top:"+item.top+"px;left:"+item.left+"px;height:"+item.height+"px;width:"+item.width+"px\">"+gridHtml+"</div>")
								}else{
									if( item.dock=="fill"){
											html.push(gridHtml);
									}else{
											html.push("<div style=\"height:"+item.height+"px;width:"+item.width+"px\">"+gridHtml+"</div>")
									}
								}
								// <table id="gridDataJson" class="" _options="{
					
								break;
							case "query":{
								// var options=this.gridDataConver(item);
								
								var quicks=item.quicks||[],advances=item.advances||[],_slef=this,queryHtml=[];
							
								queryHtml.push("<div id=\""+item["id"]+"\" class=\"xquery\" displayMode=\""+item["displayMode"]+"\"style=\""+item["style"]+"\" quick_validator=\""+item["quickValidator"]+"\" query-target=\""+item["queryTarget"]+"\" manual=\""+item["manual"]+"\">");
								
								if (quicks&&quicks.length>0){
									queryHtml.push("<div  class=\"xquery-quicks-items\">");
									queryHtml.push("<div  class=\"xquery-header\"><div class=\"xquery-title\"><span class=\"xquery-groupicon\"></span><span class=\"xquery-grouptitle\">常用条件</span></div><div class=\"xquery-arrow\"><span class=\"arrow arrow-up\"></span></div></div>");
									queryHtml.push("<div  class=\"xquery-content\">");
									
									var  quicksMaxCol=0,advMaxCol=0;
									if ("float"==item["displayMode"]){
										quicksMaxCol=2;
										advMaxCol=2;
										displayModeCss="xquery-absolute";
									}else{
										quicksMaxCol=item["quicksMaxCol"]||15;
										advMaxCol=item["advColCount"];
										displayModeCss="";
									}
									
									if (item["displayMode"]=="float"){
										
											queryHtml.append(this.outQueryItems(quicks,quicksMaxCol,false));
									}else{
										queryHtml.push("<div  class=\"queryleft\">");
										queryHtml.push(this.outQueryItems(quicks,quicksMaxCol,true));
										queryHtml.push("</div>");
										queryHtml.push("<div  class=\"queryleft\">");
										queryHtml.push("<button class=\"xquery-quick-button\" >&nbsp;</button>");
										if(advances&&advances.length>0){
												queryHtml.push("<a class=\"xquery-adv-button\">高级查询</a>");
										
										}
										queryHtml.push("</div>");
										
									}
									queryHtml.push("</div></div>");

								}
								
								if (item["displayMode"]=="float"){
									if(advances&&advances.length>0){
										queryHtml.append("<div  class=\"xquery-advance-items\">");
										queryHtml.append("<div  class=\"xquery-header\"><div class=\"xquery-title\"><span class=\"xquery-groupicon\"></span><span class=\"xquery-grouptitle\">其它条件</span></div><div class=\"xquery-arrow\"><span class=\"arrow arrow-down\"></span></div></div>");
										queryHtml.append("<div  class=\"xquery-content\">");
										queryHtml.append(this.outQueryItems(uiQuery.advances,advMaxCol,false));
										queryHtml.append("</div></div>");
									}
									queryHtml.append(createXqueryToolbar());
									
								}else{
									if(advances&&advances.length>0){
										var buffer=[],style=item["style"];
										if (item["advDlgWidth"]){
											style=style+"width:"+item["advDlgWidth"]+"px;";
										}
										if (item["advDlgHeight"]){
											style=style+"height:"+item["advDlgHeight"]+"px;";
										}
										
										buffer.push("<div class=\"dialog-content\" ");
										buffer.push(style);
										buffer.push(">");
										buffer.push("<div id=\"");
										
										buffer.push(item["id"]);
										
										buffer.push("adv\"");
										buffer.push(" manual=\""+item["manual"]+"\"");
										buffer.push(" class=\"xquery-adv-dlg ");
										buffer.push(item["css"]==null?"":item["css"]);
										buffer.push("\" query-target=\"");
										buffer.push(item["queryTarget"]);
										buffer.push("\"");
										buffer.push((item["advValidator"]==null)?"":(" adv_validator=\""+item["advValidator"]+"\" "));
										buffer.push(">");
										buffer.push(this.outQueryItems(advances,advMaxCol,false));
										buffer.push("</div>");
										buffer.push("</div>");
										buffer.push("<div class=\"dialog-footer\">");
										
										buffer.push("<div class=\"xquery-toolbar\">");
										buffer.push("<div class=\"buttonarea\">");
										buffer.push("<a class=\"advancequery ok btn btn-primary\" >确定</a>");
										buffer.push("<a class=\"advancequery rest btn\"  >重置</a>");
										buffer.push("<a class=\"advancequery cancel btn\" >取消</a>");
										buffer.push("</div>");
										buffer.push("</div>");
										buffer.push("</div>");
										var content  = buffer.join("");
										content="<input type=\"hidden\" id=\""+item["id"]+"_advance_content"+"\" value=\""+htmlEscape(content)+"\"/>";
										queryHtml.push(content);
									}
								}
							
							
						 
							queryHtml.push("</div>");
							html.push(queryHtml.join(""))
								/*	html.push("<div class=\"queryleft\">");
							  	
							  	quicks.forEach(function(queryItem){
							  	var options=_slef.dataConver(queryItem.fieldType,queryItem);
								options.readonly=item.readOnly=="true"?true:false;
								var optionsStr=JSON.stringify(options);
								var visible=queryItem["visible"]=="false"?"false":"true";
							  	  html.push("<span class=\"queryitem \" visible=\""+visible+"\"><label>"+queryItem["labelText"]+"</label><span>");
				   				  html.push("<input  class=\"app-"+queryItem["fieldType"]+"\" _options='"+optionsStr+ "'  width=\"100%\"  field=\""+queryItem["field"]+"\" name=\""+queryItem["id"]+"\" id=\""+queryItem["id"]+"\"/>");
				   				  html.push("</span></span>");
							  	});
						         
							  	html.push("<button class=\"queryquick\">&nbsp;</button>");
							  	html.push("<div class=\"queryadv\">");
							  	
							  	if (advances.length>0){
							  	    var dlgHtml=[],hideHtml=[];
							  	    item["style"]=item["style"]||"";
							  	    item["css"]=item["css"]||"";
							  	    item.colCount=item.colCount||2;
							  		dlgHtml.push("<div class=\"dialog-content\">");
							  		dlgHtml.push("<div id=\""+item["id"]+"adv\" manual=\""+item["manual"]+"\" class=\"form onecolumn "+item["css"]+"\" query-target=\""+item["queryTarget"]+"\"");
							  		dlgHtml.push("<div class=\"onecolumn\"><center><table class=\"advForm\"><tbody>");
									dlgHtml.push("<tr>");
									var col=0;
									advances.forEach(
											function(queryItem, index) {
												var options = _slef.dataConver(
														queryItem.fieldType,
														queryItem);
												// options.readonly=queryItem.readOnly=="true"?true:false;
												var optionsStr = JSON
														.stringify(options);
												queryItem["css"] = queryItem["css"]
														|| "";
												queryItem["style"] = queryItem["style"]
														|| "";
														
												if (queryItem["visible"]=="false"){
													  hideHtml.push("<input  class=\"app-"
																+ queryItem["fieldType"]
																+ "\" _options='"
																+ optionsStr
																+ "'  width=\"100%\"  field=\""
																+ queryItem["field"]
																+ "\" name=\""
																+ queryItem["id"]
																+ "\" id=\""
																+ queryItem["id"]
																+ "\"/>")
												}else{
												dlgHtml.push("<td class=\"clabel "
																+ queryItem["css"]
																+ "\" "
																+ " style=\""
																+ queryItem["style"]
																+ "\" >"
																+ "<label class=\"left\">"
																+ queryItem["labelText"]
																+ "</label></td>")
												if (queryItem.colSpan) {
													var colSpan = parseInt(
															queryItem.colSpan, 10);
													var filedCol = colSpan * 2
															- 1;
													dlgHtml
															.push("<td colspan=\""
																	+ filedCol
																	+ "\"> ");
													col += colSpan;
												} else {
													dlgHtml.push("<td>");
													col++;
												}
												dlgHtml.push("<input  class=\"app-"
																+ queryItem["fieldType"]
																+ "\" _options='"
																+ optionsStr
																+ "'  width=\"100%\"  field=\""
																+ queryItem["field"]
																+ "\" name=\""
																+ queryItem["id"]
																+ "\" id=\""
																+ queryItem["id"]
																+ "\"/>");
												dlgHtml.push("</td>");
												if (item.advColCount == col) {
													dlgHtml.push("</tr>");
													dlgHtml.push("<tr>");
													col = 0;
												}
												}
											});
									
							  		dlgHtml.push("</tr>");
									dlgHtml.push("</table></center>");
									dlgHtml.push("<div style=\"display:none\">");
									dlgHtml.push(hideHtml.join(""))
									dlgHtml.push("</div>");
							  		dlgHtml.push("</div>");
							  		dlgHtml.push("</div>");  		
							  		dlgHtml.push("<div class=\"dialog-footer\"><div class=\"buttonarea\"><a href=\"#\" class=\"advancequery ok btn btn-primary\" >确定</a><a class=\"advancequery cancel btn\" href=\"#\" >取消</a></div></div>");
							  		
							  		html.push("<input type=\"hidden\" id=\""+item.id+"_advance_content"+"\" value=\""+htmlEscape(dlgHtml.join(""))+"\"/>");
							  		// html.push(dlgHtml.join(""))
							  		html.push("<a href=\"#\">高级</a>");
							  	}
							
								html.push("</div>");
								html.push("</div>");
								html.push("<div class=\"queryright\"></div>");
								
								html.push("</div>");*/

						
								break;
							}
							case "buttonarea":
							
							var BUTTON_TYPE = {
									BUTTON : {
										css : "btn-toolbar",
										buttonOpt : {
											plain : false
										}
									},
									MENU : {
										css : "menubar",
										buttonOpt : {
											plain : true
										}
									},

									DIALOG : {
										css : "menubar btn-dlg-toolbar",
										buttonOpt : {
											plain : true,
											size : 'large',
											iconAlign : "top"
										}
									}
								}
	
							var style=item.style||"";
						
							//html.push("<div style=\"position: absolute;top:"+item.top+"px;bottom:"+item.bottom+"px;left:"+item.left+"px;height:"+item.height+"px;width:"+item.width+"px\">" )
							html.push("<div id=\""+item.id+"\" style=\"position: absolute;top:"+(item.top||"auto")+"px;bottom:"+(item.bottom||"auto")+"px;left:"+(item.left||"auto")+"px;height:"+item.height+"px;width:"+item.width+"px;"+style+"\"class=\"btnarea "+BUTTON_TYPE[item.displayType].css+"\">");
							$.each(item.buttons,function(index,button){
								
								var newButton=$.extend(true,BUTTON_TYPE[item.displayType].buttonOpt,button);
								newButton.name=newButton.text;
								delete newButton.text;
								var buttonStr=JSON.stringify(newButton);
								html.push("<a id=\""+button.id+"\" class=\"app-button\" style=\""+button.style+"\" data-options='"+buttonStr +"'>"+newButton["name"]+"</a>");
							})
							
							html.push("</div>");
						//	html.push("</div>");

							break;
							case "tree":
								if (parent.dock=="fill"&&parent.layout!="absolute"){
									delete item.width;
									delete item.height;
									item["autoheight"]=false;
								}
							var options=this.dataConver("tree",item);
							if (item.dock=="fill"){
								options["fit"]=true;
							}
							delete options.id;
							delete options.hidden;
							var optionsStr=this.attrConvertHtmlAtt(options);
							optionsStr=optionsStr.replace(/"_\{/gi,"").replace(/\}_"/gi,"").replace(/"/gi,"&quot;");
							var treeHtml='<div id="'+item.id+'"  class="ztree-container"><ul  class="ztree apptree" '+optionsStr+' /></div>';

							// console.log()
							if (item.dock=="none"){
											html.push("<div style=\"position: absolute;top:"+item.top+"px;left:"+item.left+"px;height:"+item.height+"px;width:"+item.width+"px\">"+treeHtml+"</div>")
								}else{
									if( item.dock=="fill"){
											html.push(treeHtml);
									}else{
											html.push("<div style=\"height:"+item.height+"px;width:"+item.width+"px\">"+treeHtml+"</div>")
									}
								}
							break;
							}
							// html.push("<div style=\"position:
							// absolute;top:"+item.top+";left:"+item.left+"\"><label>"+item[""]
							// +"</label></div>");
						}
				// }
					return html.join(" ");
				}
				});

			return FormDesignConverter;
});