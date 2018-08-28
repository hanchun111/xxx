/**
 * 
 * 
 * 
 */
define(	["app/core/app-jquery", "app/data/app-ajax", "app/widgets/form/app-form", "app/widgets/form/app-validate",
				"app/widgets/form/app-comp","app/widgets/app-jqgrid"], function($, $ajax) {
			var r20 = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i, manipulation_rcheckableType = /^(?:checkbox|radio)$/i;
			var AppFormGroup = function() {
				return {

					/**
					 * 加载分组表单数据
					 */
					loadGroupFromData : function(id, url, params, callback) {
						var op = {
							type : 'POST',
							url : url,
							data : params,
							dataType : "json",
							cache : false,
							// toggle : $form,
							success : function(json) {
								$.fn.refreshGroupFormData(id, json);
								if (callback) {
									callback(json);
								}
							},
							error : $ajax.ajaxError
						};
						$ajax.ajaxCall(op);

					},
					/**
					 * @memberof appform
					 * @function
					 * @instance
					 * @name sumbitGroupAllComp
					 * @desc 提交所有组件数据及分组数据
					 * @param {object}
					 *            [options] -
					 *            提交选项如{id:'groupId',url:"",type:'POST',dataType:'json',cache:false,model:false,params:{gridId:gridParamName}}
					 */
					sumbitGroupAllComp : function(options) {
						var data = this.getSubmitGroupFormData(options);
						if (data)
							$.fn.sumbitData(options, {data:data});
					},

					submitGroupForm : function(options) {
						options = options || {};
						// return this.each(function() {
						if (!options.id) {
							return null;
						}
						/*
						 * if (!this.validGroupForm(options.id)){ return ; }
						 */
						// add by tw如果参数中带了url，使用参数中的url
						var url = options.url;
						if (!url) {
							return false;
						}
						// url = url.evalTemplate($el);
						var op = null, data = null;
						var $div = $("<div style=\"display:hidden;\"></div>");
						// add by tw 添加附加值
						if (options.attachData) {
							for (var key in options.attachData) {
								var val = options.attachData[key];
								if (typeof(val) == "array") {
									for (var i = 0; i < val.length; i++) {
										var $input = $("<input hiddencomp=true forForm=\""
												+ options.id
												+ "\" type=\"hidden\" name=\""
												+ key + "\" />").appendTo($div);
										$input.val(val[i]);
									}
								} else {
									var $input = $("<input type=\"hidden\" hiddencomp=true forForm=\""
											+ options.id
											+ "\" name=\""
											+ key
											+ "\" />").appendTo($div);
									$input.val(options.attachData[key]);
								}

							}
						}
						$A.getContainer().append($div);
						var data = this.getSubmitGroupFormData(options);

						// 移除附加值
						$div.remove();
						op = $.extend({
									"type" : 'POST',
									//"url" : url,
									"data" : data,
									"dataType" : "json",

									"cache" : false
								}, options);
						$ajax.ajaxCall(op);
					},
					findGroupForms : function(id) {

						var $items = $A(".formitem[forform='" + id + "']"), $hitems = $A("[forform='"
								+ id + "'][hiddencomp=true]");
						var fromMap = {};
						var fromList = [];
						var elments = $items
								.find("input[type!=showValue], select, textarea");
						elments.each(function() {
									if (this.form) {
										var id = $(this.form).attr("id");
										if (!fromMap[id]) {
											fromMap[id] = this.form;
											fromList.push(this.form);
										}
									}

								});
						return fromList;
					},
					hideFormItem:function(id,parentHide){
						var item=$A("."+id);
						item.hide();
						var panelId= item.attr("forpanel");
				
						  if (parentHide&&panelId){
						  	$A("#"+panelId).panel("hide");
						  }else{
							  if ($A("."+id).parents("div.form").length>0){
								  var formObj=$A("."+id).parents("div.form").children("form").children("div");
								  
								  if (formObj.children(":visible").length==0){
									  $A("."+id).parents("div.form").hide();
								  }
							  }
							}
							 
					   
					},
					showFormItem:function(id,parentHide){
						
						var item=$A("."+id);
						item.show();
						var panelId= item.attr("forpanel");
						  if (parentHide&&panelId){
						  	$A("#"+panelId).panel("show");
						  }else{
							  if ($A("."+id).parents("div.form").length>0){
								  var formObj=$A("."+id).parents("div.form").children("form").children("div");
								  
								  if (formObj.children(":visible").length==0){
									  $A("."+id).parents("div.form").show();
								  }
							  }
						  }
					},
					validGroupForm : function(id) {

						var valid = true;
						var fromList = this.findGroupForms(id)
						for (var i = 0; i < fromList.length; i++) {
							valid = valid && $(fromList[i]).valid();
						}
						return valid;
					},
					/**
					 * @memberof appformgroup
					 * @function
					 * @instance
					 * @name getSubmitGroupFormData
					 * @desc 获取分组数据
					 * @param {object}
					 *            [options] -
					 *            提交选项如{id:'groupId',url:"",type:'POST',dataType:'json',cache:false,model:false,params:{gridId:gridParamName}}
					 */
					getSubmitGroupFormData : function(options) {
						var submitData = {}, fromData = null, valid = true, transorObj = {}, hasTrans = false;
						if (options.id) {
							var ids = options.id.split(",");
							for (var i=0;i<ids.length;i++) {
								var id=ids[i];
								var $el = $A("#" + id);
								if ($el.data("grid")) {
									$el.data("grid").endEdit();
									if ($el.grid('isValid') == false) {
										valid = false;
										return;
									}
									var data = $el.grid("getAllData");
									var id = $el.attr('id');
									data = JSON.stringify(data);
									var target = options.params
											? (options.params[id] || id)
											: id;
									submitData[target] = data;

									var fixeddata = $el
											.grid("getFixedParameter");
									if (fixeddata && fixeddata.__transor) {
										// data["__transor"] =
										// fixeddata["__transor"];
										var transor = fixeddata.__transor;
										if (transor) {
											transorObj[$el.attr("id")] = transor;
											hasTrans = true;
										}
									}

								} else if ($el.isGrid()) {
									

									var id = $el.bsgrid("getGridId");
									var target = options.params
											? (options.params[id] || id)
											: id;
									var data;
									if (options.submitMode == "all") {
										if (!$el
												.bsgrid("setEditEnabled", false)) {
											valid = false;
											return;
										}
										data = $el.bsgrid("getRowData");
										$el.bsgrid("setEditEnabled", true);
									} else {
										data = $el.bsgrid("getSubmitData");
										if (data == null) {
											valid = false;
											return;
										}
									}
									submitData[target] = JSON.stringify(data);
									var transor = $el.attr("transor");
									if (transor) {
										transor = $A.jsonEval(transor);
										transorObj[$el.attr("id")] = transor;
										hasTrans = true;
									}
								} else {

									var $items = $A(".formitem[forform='" + id
											+ "']"), $hitems = $A("[forform='"
											+ id + "'][hiddencomp=true]");

									if (!$.fn.validGroupForm(id)) {
										return null;
									}
									var fromData = $items.getGroupFormData(id,
											options["model"]);

									$.each(fromData, function(i, obj) {

												submitData[obj.name] = obj.value;

											});
								}
							}

						}

						if (!valid)
							return valid;
						if (hasTrans)
							submitData.__transor = JSON.stringify(transorObj);
							
						 return submitData;

					},
					findGroupFormItem : function(id) {
						var $items = $A("[forform='" + id + "']");
						var formItem = $items.map(function() {
							var elements = $.attr(this, "hiddencomp");
							if (elements=="true"){
								return this;
							}else{
								var inputs=[];
								$A("input,select, textarea",this).each(function(){
									
									inputs.push(this);
								})
								return inputs
							}
							
						});
						return formItem;
					},
					/**
					 * @memberof appformgroup
					 * @function
					 * @instance
					 * @name getGroupFormData
					 * @desc 获取分组数据
					 * @param {String}
					 *            [id] -分组id
					 * @param {Boolean}
					 *            [isField] -是否以字名为key键
					 */

					getGroupFormData : function(id, isField) {

						return this.findGroupFormItem(id).filter(function() {
							var type = this.type;
							// Use .is(":disabled") so that fieldset[disabled]
							// works
							var hasField = true;
							if (isField) {
								hasField = this.field;
							}
							return hasField
									&& !jQuery(this).is(":disabled")
									&& rsubmittable.test(this.nodeName)
									&& !rsubmitterTypes.test(type)
									&& (this.checked || !manipulation_rcheckableType
											.test(type));
						}).map(function(i, elem) {
							var val = jQuery(this).val();
						
							if (val==null){
								return null;
							}else if ( jQuery.isArray(val)){
								
								return jQuery.map(val, function(val) {
									return {
										name : isField
												? elem.field
												: elem.name
														|| elem.id,
										value : $.fn
												.unescapeHtml(val
														.replace(
																rCRLF,
																"\r\n"))
									};
								});
							}else{
								return {
									name : isField ? elem.field : elem.name
											|| elem.id,
									value : $.fn.unescapeHtml(val.replace(
											rCRLF, "\r\n"))
								};
							}
							
						}).get();
					},
					refreshGroupFormData : function(id, data) {

						var $items = $A(".formitem[forform='" + id + "']"), $hitems = $A("[forform='"
								+ id + "'][hiddencomp=true]");
						var md = data, model;
						/*
						 * if (model) { if (model.indexOf(".") > 1) {
						 * $.each(model.split("."), function(i) { md = md[this];
						 * if (md == null) return false; }); } else { md =
						 * md[model]; } if (md == null) md = data; }
						 */
						$hitems.each(function() {
							var $o = $(this), itemmodel = $o.attr("model"), field = $o
									.attr("field");
							var imd = md;
							if (itemmodel != model) {
								if (itemmodel.indexOf(".") > 1) {
									$.each(itemmodel.split("."), function(i) {
												imd = imd[this];
												if (imd == null)
													return false;
											});
								} else {
									imd = imd[itemmodel];
								}
								if (imd == null)
									imd = md;
							}
							var v = imd[field];
							$o.val(v);
						});
						$items.each(function() {
							var $o = $(this), itemmodel = $o.attr("item-model"), field = $o
									.attr("item-field"), showField = $o
									.attr("item-showfield");
							var imd = md;
							if (itemmodel != model) {
								if (itemmodel.indexOf(".") > 1) {
									$.each(itemmodel.split("."), function(i) {
												imd = imd[this];
												if (imd == null)
													return false;
											});
								} else {
									imd = imd[itemmodel];
								}
								if (imd == null)
									imd = md;
							}
							var v = imd[field];
							var sv = null;
							if (showField) {
								sv = imd[showField];
							}
							$o.setFormItemValue(v, sv, md);
						});
						/*if ($form.attr("init") != "true") {
							$form.attr("refresh", "true");
						}*/
					}
				}
			}();

			$.fn.extend(AppFormGroup)

			return AppFormGroup;
		});