define(	["app/widgets/app-widget", "app/data/app-ajax", "app/core/app-options",
			"formdesign/attrdefinition", "formdesign/formDesignConverter",
			"formdesign/xmlDataDesignConverter", "app/widgets/window/app-messager",
			"app/widgets/button/app-menubutton", "formdesign/jquery.tabs",
			"formdesign/jquery.ribbon", "formdesign/jquery.propertygrid",
			"formdesign/jquery.window", "formdesign/jquery.accordion",
			"formdesign/jquery-ui", "app/widgets/form/app-combobox", "app/widgets/form/app-form", "app/widgets/layout/app-layout2",
			"formdesign/jquery.treegrid", "formdesign/jquery.tree"],
		function(Widget, AppAjax, DefaultOptions, AttrDefinition,
				FormDesignConverter, XmlDataDesignConverter) {

			var DesignCanvasHelper = {
				designCanvas : null,
				getDesignCanvas : function() {
					return this.designCanvas
				},
				setDesignCanvas : function(designCanvas) {
					this.designCanvas = designCanvas;
				}
			};
			$.fn.extend({
						/*
						 * select : function() { av.firstSelected; if
						 * (!$s().length) { av.data("first-selected") && av
						 * .data("first-selected")
						 * .removeClass("ui-selected-first");
						 * av.data("first-selected", $(this)
						 * .addClass("ui-selected-first")) } return
						 * $(this).addClass("ui-selected") }, unselect :
						 * function() { return
						 * $(this).removeClass("ui-selected")
						 * .removeClass("ui-selected-first") }, selected :
						 * function() { return
						 * $(this[0]).hasClass("ui-selected") },
						 */
						vals : function(aL, aJ) {
							var aK = $.fn[aL[0]], j = aL.slice(1);
							return this.each(function() {
										aJ.push(aK.apply($(this), j))
									})
						},
						attr2 : function(aL, aK) {
							var aJ = U.apply(this, arguments);
							if (aK != undefined || aL != "_codestyle" || aJ) {
								return aJ
							} else {
								var j = this
										.parent()
										.html()
										.match(/\b_codestyle\s*=\s*(['"])(.*?)\1/);
								return j ? j[2] : ""
							}
						},
						cssFrom : function(aK, aJ) {
							var j = this;
							$.each(aJ, function() {
										j.css(this, $(aK).css(this))
									});
							return this
						},
						_css : function(aJ, aL) {
							var aK = [], j = ["css", aJ];
							this.vals(j, aK).css(aJ, aL);
							aq.add(new w(this, j, aK, aL));
							return this
						},
						_object : function() {
							return this.find("object,embed").first()
						},
						borderStyle : function(aL) {
							var j = {}, aK = this, aJ = ($(this).attr("style") || "")
									.split(";");
							if (typeof(aL) == "undefined") {
								$.each(aJ, function() {
											var aM = this.split(":");
											if (aM.length == 2
													&& $
															.trim(aM[0])
															.match(/^border.*$/)) {
												j[$.trim(aM[0])] = $
														.trim(aM[1])
											}
										});
								return j
							} else {
								$.each(aJ, function() {
											var aM = this.split(":");
											if (aM.length == 2
													&& $
															.trim(aM[0])
															.match(/^border.*$/)) {
												$(aK).css($.trim(aM[0]), "")
											}
										});
								return this.css(aL)
							}
						},
						_outerHTML : function() {
							return jQuery("<p>").append(this.eq(0).clone())
									.html()
						},
						_border : function() {
							var aJ = {}, aK = "", j = true, aL = this[0];
							$.each(["Top", "Right", "Bottom", "Left"],
									function(aM, aO) {
										var aN = $.css(aL, "border" + aO
														+ "Style")
												+ " "
												+ $.css(aL, "border" + aO
																+ "Color")
												+ " "
												+ $.css(aL, "border" + aO
																+ "Width");
										aJ["border-" + aO.toLowerCase()] = aN
												.match(/^none.*/) ? "" : aN;
										if (aM) {
											if (aK != aN) {
												j = false
											}
										}
										aK = aN
									});
							return j ? {
								border : aJ["border-top"]
							} : aJ
						},
						_codeData : function(aJ) {
							var aK = this.is("object");
							if (aJ == undefined) {
								var j = {};
								if (aK) {
									this.find("param").each(function() {
										j[$(this).attr("name")] = $(this)
												.attr("value")
									})
								} else {
									j._codestyle = this.attr("_codestyle");
									j._code = this.attr("_code")
								}
								return j
							} else {
								if (aK) {
									this.find("param").each(function() {
										$(this).attr("value",
												aJ[$(this).attr("name")])
									})
								} else {
									this.attr(aJ)
								}
								try {
									this[0].setData(aJ._code, aJ._codestyle)
								} catch (aL) {
								}
								return this
							}
						},
						_style : function(j) {
							return $.style(this[0], j)
						},
						_copyClass : function(aJ, j) {
							if ($(aJ).is("." + j)) {
								this.addClass(j)
							} else {
								this.removeClass(j)
							}
							return this
						},
						_copyCss : function(aK, aJ) {
							if (!$.isArray(aJ)) {
								aJ = [aJ]
							}
							var j = this;
							$.each(aJ, function(aL, aM) {
										j.css(aM, $(aK).css(aM))
									});
							return this
						},
						_copyAttr : function(aL, aK, aJ) {
							if (!$.isArray(aK)) {
								aK = [aK]
							}
							var j = this;
							$.each(aK, function(aM, aN) {
										if (aJ) {
											j.attr(aN, $(aL).attr(aN) || aJ)
										} else {
											j.attr(aN, $(aL).attr(aN))
										}
									});
							return this
						},
						_appendTo : function(j) {
							if (!j) {
								this.remove()
							} else {
								c($(this).appendTo(av).select())
							}
							return this
						},
						_removeFrom : function(j) {
							if (!j) {
								c($(this).appendTo(av).select())
							} else {
								this.remove()
							}
							return this
						},
						_uClass : function(aL) {
							if (typeof(aL) == "undefined") {
								var aJ = /\bjp\-comp\-[0-9]+/;
								var aK = $(this).attr("class");
								var j = aK.match(aJ);
								return j ? j[0] : ""
							} else {
								this.addClass(aL);
								return this
							}
						}
					});
			Array.prototype._last = function(j) {
				this[this.length - 1] = j;
				return this
			};
			/*
			 * function ah(aL) { try { var aM = ab().getFonts(); if (aM) { var
			 * aJ = $(aL)[0]; for (var j = 0; j < aM.length; j++) {
			 * aJ.options[j] = new Option(aM[j], aM[j]) } } } catch (aK) { } }
			 */
			$.widget("ui.mydraggable", $.ui.draggable, {
				_create : function() {

					this.element
							.data(
									$.ui.draggable.prototype.widgetName,
									this.element
											.data($.ui.mydraggable.prototype.widgetName));
					$.ui.draggable.prototype._create.call(this)
				},
				_generatePosition : function(event) {
					var drawCanvas = this.options.canvas;
					event.target = $(event.target).closest(".form-component")[0];
					var position = $.ui.draggable.prototype._generatePosition
							.call(this, event), dragTarget = $(event.target);
					var aN = this;
					if ($(event.target).data("dragging")) {
						var aJ = function(aU, aV, aT, aX) {
							var aW = aT ? "top" : "left";
							position[aW] = aV + aU[aT] - aU[aX]
									- aN.offset.parent[aW]
						};
						var connector = dragTarget.data("connectors").slice(0), siblingConnectors = dragTarget
								.data("sibling-connectors"), aR = event.pageX
								- this.lastPageX, aQ = event.pageY
								- this.lastPageY;
						for (var aK = 0; aK < 6; aK++) {
							connector[aK] += ((aK < 3) ? aR : aQ)
						}
						var aO = drawCanvas.drawLine(connector,
								siblingConnectors, [1, 2, 0], [4, 5, 3], aJ);
						$(event.target).data("rulers", aO)
					}
					return position;
				},
				_mouseStart : function(evnet) {
					var drawCanvas = this.options.canvas;
					var selecteds = drawCanvas.getSelected();
					this.lastPageX = evnet.pageX;
					this.lastPageY = evnet.pageY;
					evnet.target = $(evnet.target).closest(".form-component")[0];
					// 获取当前拖动对象相对父元素的偏移
					var targetPos = $(evnet.target).position(), newPos = [
							targetPos.left, targetPos.top];
					selecteds.not(evnet.target).each(function() {
								var aM = $(this).position();
								(aM.left < newPos[0]) && (newPos[0] = aM.left);
								(aM.top < newPos[1]) && (newPos[1] = aM.top)
							});
					// 获取画布元素在当前视口的相对偏移
					var parentOffset = $(evnet.target).parent().offset();
					newPos[0] = parentOffset.left + targetPos.left - newPos[0];
					newPos[1] = parentOffset.top + targetPos.top - newPos[1];
					newPos[2] = newPos[3] = 1000000;
					this.options.containment = newPos;
					// 创建控件连接器
					drawCanvas.creatConnectors(evnet.target);
					$.ui.draggable.prototype._mouseStart.call(this, evnet);
				}
			});
			var formdesignGudi = 0;

			// 控件属性配置
			ControlAttrDefine = {
				BaseControl : "BaseComponent",
				FieldControl : "Field",
				DateTimeFieldControl : "DateTime",
				TextFieldControl : "Textbox",
				ComboBoxControl : 'Combobox',
				CheckBoxControl : 'Checkbox',
				HiddenFieldControl : "Hidden",
				PanelControl : 'Panel',
				JqGridControl : 'JqGrid',
				GridControl : 'Grid',
				NumberFieldControl : 'Number',
				MoneyFieldControl : 'Money',
				ComboGridControl : 'ComboGrid',
				ComboZtreeControl : 'Comboztree',
				TextAreaControl : 'TextArea',
				PageControl : "Page",
				TabControl : "Tab",
				ButtonControl : "Button",
				MenuButtonControl : "ButtonMenu",
				ReferenceControl : "Reference",
				FormPanelControl : "FormPanel",
				QueryControl : "Query",
				ButtonAreaControl:'ButtonArea'

			};

			/**
			 * 表单设计器控件基类
			 */
			BaseControl = Widget.extend({
				controlAttrs : null,
				droppable : false,
				selectabel : false,
				removeAttrs : [],
				disabelAttrs : [],
				resize : true,
				attrsDefineKey : ControlAttrDefine.BaseControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.BaseControl),
				items : null,
				parentControl : null,
				propsInAttrs : ['element', 'type', 'id', 'controlAttrs'],
				rendered : false,
				getHeight : function() {
					return this.getEl().outerHeight();
				},
				getWidth : function() {
					return this.getEl().outerWidth();
				},
				remove : function(item) {
					if (this.items) {
						var itemIndex = this.items.indexOf(item);
						if (itemIndex > -1) {
							this.items.splice(itemIndex, 1);
						}

					}
				},
				destroy : function() {
					if (this.trigger('befordestroy', this) !== false) {

						this.getEl().remove();
						if (this.parentControl) {
							this.parentControl.remove(this);
						};
						this.trigger('destroy', this)
						BaseControl.superclass.destroy.call(this);

					}
				},
				initialize : function(options) {

					// var controlAttrs=this.controlAttrs;
					BaseControl.superclass.initialize.call(this, options);
					/*
					 * var defaultAttrs=[{ id : "id", editor : 'text', value :
					 * this.get("id"), name : '控件id' }, { id : "height", editor :
					 * 'text', value : this.get("height"), name : '高度' }, { id :
					 * "width", editor : 'text', value : this.get("width"), name :
					 * '宽度' }, { id : "left", //editor : 'text', value :
					 * this.get("left"), name : 'left坐标' }, { id : "top",
					 * //editor : 'text', value : this.get("top"), name :
					 * 'top坐标' },{ id : "hidden", //editor : 'text', value :
					 * this.get("hidden"), name : '是否隐藏' },{ id : "events",
					 * //editor : 'text', //value : this.get("hidden"), name :
					 * '事件' }];
					 */
					this.controlAttrs = AttrDefinition.getControlAttrs(
							this.attrsDefineKey, this);// controlAttrs?defaultAttrs.concat(controlAttrs):defaultAttrs;

					if (!this.get("id")) {
						formdesignGudi++;
						var id = "fromDesignId_" + formdesignGudi;
						this.id = id;
						this.setControlAttr("id", this.id);
					}
					this.render();
					this.element.data("formControl", this);
					this.initAttrData();
					this.createSelectable();
					this.createDroppable();
					var _self=this;
					
					// this.element=$('<div class="toolbox-item"><span
					// class='+this.get("cls")+'></span><span
					// class="itemcaption">'+this.get("text")+'</span><div>');
				},
				bindControlAttrEvent : function(attrName, fn) {

				},
				initAttrData : function() {
					var attrData = {};
					for (key in this.attrs) {
						attrData[key] = this.get(key);
					}
					this.setControlAttrs(attrData);
				},
				initAttrKeys : function() {

					if (!this.attrKeys) {
						var removeAttrs = this.removeAttrs, disabelAttrs = this.disabelAttrs, _self = this;;

						if ($.isArray(removeAttrs)) {
							var removeAttrIds = [];
							var controlAttrs = this.controlAttrs;
							for (var i = 0, len = removeAttrs.length; i < len; i++) {
								var removeAttr = removeAttrs[i];
								for (var j = 0; j < controlAttrs.length; j++) {
									if (controlAttrs[j]["id"] == removeAttr)
										removeAttrIds.push(j);
								}
							};

							$.each(removeAttrIds, function(index, item) {
										_self.controlAttrs.splice(item, 1)
									});
						}
						this.attrKeys = {};
						var controlAttrs = this.controlAttrs;
						for (var j = 0; j < controlAttrs.length; j++) {
							this.attrKeys[controlAttrs[j]["id"]] = j;
						}
						if ($.isArray(disabelAttrs)) {
							$.each(disabelAttrs, function(index, item) {
								var attrIndex = _self.attrKeys[item];
								if (attrIndex) {
									_self.controlAttrs[attrIndex].editor = null;
								}

							})
						}

					}
				},
				changeAttrAfter : function() {
					if (this.element) {
						var width = this.controlAttrs[this.attrKeys["width"]].value;
						var height = this.controlAttrs[this.attrKeys["height"]].value;
						var top = this.controlAttrs[this.attrKeys["top"]].value;
						var left = this.controlAttrs[this.attrKeys["left"]].value;
						/*
						 * console.log(left); console.log(top)
						 * console.log(this.id); console.log(this.element)
						 */
						// this.element.height(height);
						// this.element.outerWidth(width);
						this.element.outerWidth(width);
						this.element.outerHeight(height);
						this.element.css({
									left : left + "px",
									top : top + "px"
								});
						if (top == 'auto') {
							this.element.css({
										top : ""
									});
						}
						if (left == 'auto') {
							this.element.css({
										left : ""
									});
						}
						if (this.get("hidden") == "true"
								|| this.get("hidden") == true) {
							this.element.hide();
						} else {
							this.element.show();
						}
					}
				},
				setControlAttr : function(attr, value) {
					var attrs = {};
					attrs[attr] = value;
					this.setControlAttrs(attrs);
					/*
					 * var attrs={attr:value}; if (this.attrKeys[attr]!=null){
					 * this.controlAttrs[this.attrKeys[attr]].value=value;
					 * this.set(attr,value); } this.trigger('changeAttr',
					 * this.controlAttrs); this.changeAttrAfter();
					 */
				},
				getControlAttr : function(attr) {
					if (!this.attrKeys) {
						return null;
					}
					var temControlAttrs = $.extend({}, this.controlAttrs);
					return temControlAttrs[this.attrKeys[attr]].value;
				},
				setControlAttrs : function(attrs, change) {
					// console.log(attrs);
					var arg = arguments, change = arguments.length > 1
							? change
							: true;
					this.initAttrKeys();
					if ($.isArray(attrs)) {
						for (var i = 0; i < attrs.length; i++) {
							if (this.attrKeys[attrs[i]["id"]]) {
								this.controlAttrs[this.attrKeys[attrs[i]["id"]]].value = attrs[i].value;
								this.set(attrs[i]["id"], attrs[i].value);
							}
						}
					} else {
						for (var key in attrs) {
							if (this.attrKeys[key] != null) {
								this.controlAttrs[this.attrKeys[key]].value = attrs[key];
								this.set(key, attrs[key]);
							}
						}
					}

					this.trigger('changeAttr', this.controlAttrs);
					if (change) {
						this.changeAttrAfter();
					}

					/*
					 * var controlAttrs=this.controlAttrs; for(var i=0; i<attrs.length;
					 * i++){ for(var j=0;j<controlAttrs.length;j++){ if
					 * (rows[i].id==controlAttrs[j].id){
					 * oldAttrs[j]=$.extend({},controlAttrs[j],rows[i]) } }
					 */
				},
				getControlAttrs : function() {
					return this.controlAttrs;
				},
				getAttrData : function() {
					var data = {};
					for (var key in this.attrKeys) {
						if (this.controlAttrs[this.attrKeys[key]].value !== "") {
							data[key] = this.controlAttrs[this.attrKeys[key]].value;
						}

					}
					data["type"] = this.type;
					if (this.items) {
						data["items"] = [];
						for (var i = 0; i < this.items.length; i++) {
							data["items"].push(this.items[i].getAttrData());
						}
					}
					return data;
				},
				setParentControl : function(parentControl) {
					this.parentControl = parentControl;
				},
				getParentControl : function() {
					return this.parentControl;
				},
				render : function() {
					this.element = $('<div id="' + this.id
							+ ' "class="form-group form-component design-form-'
							+ this.type + '"><p class="jp-selected-layer"></p>'
							+ '</div>');
					this.renderControlEl();
				},
				renderControlEl : function() {
					var controlEl = $('<input type="' + this.type
							+ '"class="form-control"  />');
					this.element.append(controlEl);
				},
				getEl : function() {
					return this.element;
				},
				getId : function() {
					return this.id;
				},
				selected : function() {

					return this.getEl().hasClass("ui-selected");
				},
				getDesingContainer : function() {
					return null;
				},
				unselect : function() {
					// console.log("removeSelected");
					return this.getEl().removeClass("ui-selected")
							.removeClass("ui-selected-first");
				},
				select : function() {
					// console.log("addSelected")
					this.getEl().addClass("ui-selected");
				},
				setRendered : function() {
					this.rendered = true;
					this.renderAfter();
				},
				renderAfter : function() {

				},
				addItem : function(control) {
					if (!this.items) {
						this.items = [];
					}
					var container;
					this.items.push(control);
					
					if (this.type == "panel") {
						control.setControlAttr("forPanel", this.get("id"));
					} else  if (this.type == "formpanel"){
						control.setControlAttr("forPanel", this.get("forPanel"));
					}
					control.setParentControl(this);
					container = this.getDesingContainer();
					/*
					 * if (this instanceof PageControl) { container =
					 * this.getEl(); } else { container =
					 * this.getEl().children(".desing-container");
					 *  }
					 */
					if (!container || container.length == 0) {
						console.log("找不到设计面板")
						return;
					}
					if (this.trigger('beforaddItem', control) !== false) {

						container.append(control.getEl());
						var canvasPos = container.offset();
						var selected = null, offset;
						var top = Math.max(control.get("top") - canvasPos.top,
								0);
						var left = Math.max(control.get("left")
										- canvasPos.left, 0);
						control.getEl().css({
									left : left,
									top : top
								});
						control.setControlAttr("left", left);
						control.setControlAttr("top", top);
						this.trigger('addItemAfter', control);
						control.setRendered();
						this.addItemAfter();
					}
				},
				addItemAfter:function(){
					
				},
				createSelectable : function() {

					if (this.selectabel) {
						var seSelectableCfg = {
							distance : 1,
							filter : ".form-component",
							start : function(event) {

								var designCanvas = DesignCanvasHelper
										.getDesignCanvas();
								designCanvas.resizeHandle
										.data("selected", null);
								designCanvas.unselect();
								$(event.target).data("isselectable", null)
								// var
								// selectableObj=$(event.target).data("selectable-item",null).data("ui-selectable");
								/*
								 * console.log(arguments) var j =
								 * $(event.target).data("selectable-item",null).data("ui-selectable");
								 * console.log(j); console.log("start")
								 */
							},
							selecting : function(event, selectItems) {

								// console.log(selectItems)
								n();
							},
							unselecting : function(event, unselectItems) {
								n();
							},
							stop : function(event) {
								var selectableObj = $(event.target)
										.data("ui-selectable");
								var selectItems = selectableObj.selectees;
								// console.log(event.data="r");
								var l, t, r, b, ww, hh, c = [];

								selectItems.filter(".ui-selected").each(
										function(i, o) {
											var tt, ll, ww, hh, control = $(o)
													.data("formControl")
											var selectableitem = $(o)
													.data("selectable-item");
											if (selectableitem.selected) {
												var bbox, isSVG = o.raphael, id = o.id;

												var offset = $(o).offset();
												var position = $(o).position();
												// o=xui([o]);
												bbox = {
													x : offset.left,
													y : offset.top,
													width : control.getWidth(),
													height : control
															.getHeight()

												};
												if (i === 0) {
													l = bbox.x;
													t = bbox.y;
													r = l + (ww = bbox.width);
													b = t + (hh = bbox.height);
													c.push([{
																left : position.left,
																top : position.top
															}, {
																width : ww,
																height : hh
															}, control]);
												} else {
													l = Math
															.min(l, ll = bbox.x);
													t = Math
															.min(t, tt = bbox.y);
													r = Math
															.max(
																	r,
																	ll
																			+ (ww = bbox.width));
													b = Math
															.max(
																	b,
																	tt
																			+ (hh = bbox.height));
													c.push([{
																left : position.left,
																top : position.top
															}, {
																width : ww,
																height : hh
															}, control]);
												}
											}
										});
								$(event.target).data("isselectable", true);

								var designCanvas = DesignCanvasHelper
										.getDesignCanvas();
								designCanvas.resizeHandle.data("selected", c)

								var targetOffset = designCanvas.canvas.offset();
								//console.log(t - targetOffset.top)
								// console.log(designCanvas.canvas);
								designCanvas.resizeHandle.css({
											top : Math.round(t
													- targetOffset.top),
											left : Math.round(l
													- targetOffset.left),
											width : Math.round(r - l),
											height : Math.round(b - t)
										});
								$(".xui-advresizer-line",
										designCanvas.resizeHandle).css({

											width : Math.round(r - l) - 2,
											height : Math.round(b - t) - 2
										})
								designCanvas.resizeHandle.show();
							}
						}, selectableEl;
						/*
						 * if (control instanceof FormDesignCanvas){
						 * selectableEl=control.canvas; }else{
						 * selectableEl=control.getEl(); //
						 * dropCfg["greedy"]=true; }
						 */
						selectableEl = this.getEl();
						// console.log(selectableEl)
						selectableEl.selectable(seSelectableCfg);
					}
				},
				createDroppable : function() {
					var _self = this;
					if (this.droppable) {
						var dropEl, dropCfg = {
							accept : ".toolbox-item",
							activeClass : "ui-state-hover",
							hoverClass : "ui-state-active",
							greedy : true,
							start : function() {
								// console.log(arguments)
							},
							drop : function(event, ui) {
								// console.log(arguments)
								var controlData = ui.draggable
										.data("controlData")
										|| {};

								var type = controlData.type;
								if (type) {
									var controlCfg = $.extend({}, {
												type : type
											}, ui.offset), container;
									/*
									 * if (control instanceof PageControl){
									 * container=control.getEl(); }else{
									 * container=$(".desing-container",
									 * control.getEl()); }
									 */
									if (!controlCfg.type) {
										controlCfg.type = TextFieldControl;
									}
									var controlType;
									if (typeof controlCfg.type == "string") {
										controlType = ControlReg[controlCfg.type];

									} else {
										controlType = controlCfg.type;
									}
									if (!controlType) {
										return;
									}
									var copyObj = $.extend({}, controlData);

									delete copyObj.type;
									var control = new controlType($.extend({
												id : controlCfg.id,
												top : controlCfg.top,
												left : controlCfg.left
											}, copyObj));

									_self.addItem(control);

									// _self.addFormControl(controlCfg,container,control);

								}

							}
						};
						/*
						 * if (control instanceof FormDesignCanvas){
						 * dropEl=control.canvas; }else{ dropEl=control.getEl();
						 * dropCfg["greedy"]=true; }
						 */
						dropEl = this.getEl();
						dropEl.droppable(dropCfg);
					}
				}
			});

			PageControl = BaseControl.extend({
				droppable : true,
				selectabel : true,
				attrsDefineKey : ControlAttrDefine.PageControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.PageControl),
				type : 'page',
				initialize : function(options) {
					/*
					 * var
					 * layoutList=[{id:"",name:"none"},{id:"border",name:"border"},{id:"vbox",name:"vbox"},{id:'absolute',name:'absolute'}];
					 * this.controlAttrs = [{ id : "layout", editor
					 * :{type:"combobox",options:{data:layoutList}}, name : '布局'
					 * },{ id : "js", name : 'js路径' },{ id : "jsId",
					 * 
					 * name : 'jsId' },{ id : "onPageLoad", name : '页面初始化事件' } ];
					 */
					PageControl.superclass.initialize.call(this, options);
					this.setControlAttrs({
								width : this.get("width"),
								height : this.get("height"),
								layout : this.get("layout"),
								js : this.get("js"),
								jsId : this.get("jsId"),
								onPageLoad : this.get("onPageLoad")
							});
				this.changeLayout();
				this.on("change:layout",this.changeLayout)
				},
				changeLayout:function(){
					this.element.removeClass("desing-panel-layoutBox");
					this.element.removeClass("desing-panel-layoutBroder");
					if (this.get("layout")=="vbox"||this.get("layout")=="hbox"){
						this.element.addClass("desing-panel-layoutBox");
					}
					if (this.get("layout")==""||this.get("layout")=="none"||this.get("layout")=="boder"||this.get("layout")=="absolute"){
						this.element.addClass("desing-panel-layoutBroder");
					}
				},
				addItemAfter:function(){
					if (this.items&&this.items.length>1){
						var item=this.items[0];
						if (item.doLayout){
							item.doLayout(this);
						}
						/*for(var i=0;i<this.items.length;i++){
							var item=this.items[i];
							if (item.setPanelDock){
								item.setPanelDock(item.get("dock"),true);
							}
						}*/
						
					}
					
				},
				render : function() {
					this.element = $('<div class="desing-panel desing-container"><div class="jp-paper-background screen-only" /><p class="jp-h-ruler jp-ruler-element"></p><p class="jp-v-ruler jp-ruler-element"></p></div>');
					this.__ready = true;
				},
				getDesingContainer : function() {
					return this.element;
				}
			});

			PanelControl = BaseControl.extend({
				droppable : true,
				selectabel : true,
				attrsDefineKey : ControlAttrDefine.PanelControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.PanelControl),
				type : 'panel',

				items : null,
				initialize : function(options) {
					
					PanelControl.superclass.initialize.call(this, options);
					this.setControlAttrs({
								"dock" : this.get("dock"),
								"height" : this.get("height"),
								"width" : this.get("width"),
								title : this.get("title"),
								border : this.get("border"),
								form : this.get("form"),
								formId : this.get("formId")
							});
					var _self = this;
					this.on("change:height", function(newVal, oldVal, attrKey) {
						// console.log("newVal:"+newVal,"oldVal"+oldVal);

						// _self.setPanelDock(_self.get("dock"),true);
						// var st=new Date().getTime();
						var parentControl = _self.getParentControl();
						_self.doLayout(parentControl);
						if (_self.items) {
							for (var i = 0; i < _self.items.length; i++) {
								var item = _self.items[i];
								if (item.get("dock")
										&& item.get("dock") != "none") {
									item.doLayout(_self);
								}
							}

						}
							// var st2=new Date().getTime() - st;
							// /console.log(_self.get("id")+":"+_self.get("dock"))
							// /console.log("改变高度的执行时间为"+st2+"毫秒");

						});
					this.on("change:width", function(newVal, oldVal, attrKey) {
						// console.log("newVal:"+newVal,"oldVal"+oldVal);

						// _self.setPanelDock(_self.get("dock"),true);
						// var st=new Date().getTime();
						var parentControl = _self.getParentControl();
						_self.doLayout(parentControl);
						if (_self.items) {
							for (var i = 0; i < _self.items.length; i++) {
								var item = _self.items[i];
								if (item.get("dock")
										&& item.get("dock") != "none") {
									item.doLayout(_self);
								}
							}

						}
							// var st2=new Date().getTime() - st;
							// /console.log(_self.get("id")+":"+_self.get("dock"))
							// /console.log("改变高度的执行时间为"+st2+"毫秒");

						});
					this.on("change:dock", function(newVal, oldVal, attrKey) {
								// console.log(newVal);
								_self.setPanelDock(newVal, true);

							});
					this.changeLayout();
					this.on("change:layout",this.changeLayout)
					},
					changeLayout:function(){
						this.element.removeClass("desing-panel-layoutBox");
						this.element.removeClass("desing-panel-layoutBroder");
						if (this.get("layout")=="vbox"||this.get("layout")=="hbox"){
							this.element.addClass("desing-panel-layoutBox");
						}
						if (this.get("layout")==""||this.get("layout")=="none"||this.get("layout")=="boder"||this.get("layout")=="absolute"){
							this.element.addClass("desing-panel-layoutBroder");
						}
				},
				renderControlEl : function() {
					this.desingContainer = $('<div class="form-panel desing-container" ></div>');
					this.element.append(this.desingContainer);
				},
				getDesingContainer : function() {
					return this.desingContainer;
				},
				changeAttrAfter : function() {

					PanelControl.superclass.changeAttrAfter.call(this);
					// console.log(this.get("dock"))
					// var dock=this.get("dock");
					if (this.getEl()) {
						
						this.element.css({
									bottom : this.get("bottom"),
									right : this.get("right")
								});
					}
				},
				setControlAttrs : function(attrs, change) {
					var arg = arguments, change = arguments.length > 1
							? change
							: true;
					var dock = this.getControlAttr("dock");
					if (dock && dock == this.oldDock && !attrs["isSetDock"]) {
						switch (dock) {
							case "top" :
							case "bottom" :
								delete attrs["width"];
								delete attrs["left"];
								delete attrs["top"];
								break;
							case "left" :
							case "right" :
								delete attrs["height"];
								delete attrs["left"];
								delete attrs["top"];
								break;
							case "width" :
								delete attrs["width"];
								delete attrs["left"];
							case "height" :
								delete attrs["top"];
								delete attrs["height"];
								break;
							case "fill" :
								delete attrs["top"];
								delete attrs["height"];
								delete attrs["left"];
								delete attrs["width"];
								break;
							case "none" :
								break;
						}
					};
					PanelControl.superclass.setControlAttrs.call(this, attrs,
							change);
				},
				renderAfter : function() {
					this.setPanelDock(this.get("dock"), true);
					this.__ready = true;
				},
				setPanelDock : function(dock, change) {
					// console.log(this.getEl().parent(".desing-container").outerWidth(true));
					// console.log(this.getEl().parent(".desing-container").width());
					// var
					// parentHeight=this.getEl().parent(".desing-container").outerHeight();
					if (this.rendered) {
						var parentControl = this.getParentControl();
						// var parentWidth=parentControl.getWidth();
						// var parentHeight=parentControl.getHeight();
						// this.resetBox(parentControl);
						var box = this.getPanelBox(parentControl), changeDock = false;
						if (this.oldDock != dock) {
							this.oldDock = dock;
							changeDock = true;
						}
						if (dock == "top") {
							if (changeDock) {
								this.setControlAttrs({
											isSetDock : true,
											"width" : box.width,
											top : box.top,
											left : 0,
											right : 0,
											bottom : 'auto',
											"height" : changeDock ? 100 : this
													.get("height")
										}, change);

								var panels = this.doLayout(parentControl);
								/*
								 * var leftpanels=panels["left"]; for(var i=0;i<leftpanels.length;i++){
								 * console.log(leftpanels[i].getPanelBox(parentControl)); }
								 */

								// this.resetBox(parentControl,"left");
							}
						}
						if (dock == "bottom") {
							this.setControlAttrs({
										isSetDock : true,
										"width" : box.width,
										top : 'auto',
										left : 0,
										right : 0,
										bottom : box.bottom
									}, change);
							var panels = this.doLayout(parentControl);

						}
						if (dock == "right") {
							if (changeDock) {
								this.setControlAttrs({
											isSetDock : true,
											"width" : changeDock ? 200 : this
													.get("width"),
											top : box.top,
											left : 'auto',
											right : box.right,
											bottom : 'auto',
											height : box.height
										}, change);
								var panels = this.doLayout(parentControl);
							}
						}
						if (dock == "width") {
							if (changeDock) {
								this.setControlAttrs({
											isSetDock : true,
											"width" : box.width,
											top : changeDock ? box.top : this
													.get("top"),
											left : 0,
											right : 0,
											bottom : 'auto'
										}, change);
								var panels = this.doLayout(parentControl);
							}
						}
						if (dock == "height") {
							if (changeDock) {
								this.setControlAttrs({
											isSetDock : true,
											"width" : box.width,
											"height" : changeDock ? 100 : this
													.get("height"),
											left : 0,
											right : 0,
											bottom : 'auto'
										}, change);
								var panels = this.doLayout(parentControl);
							}
						}
						if (dock == "left") {
							/*
							 * if (changeDock){
							 * this.resetBox(parentControl,"left"); }
							 */
							if (changeDock) {
								this.setControlAttrs({
											isSetDock : true,
											"width" : changeDock ? 200 : this
													.get("width"),
											top : box.top,
											left : box.left,
											bottom : 'auto',
											right : 'auto',
											height : box.height
										}, change);

								var panels = this.doLayout(parentControl);

							}
						}
						if (dock == "fill") {
							/*
							 * if (changeDock){
							 * this.resetBox(parentControl,"left"); }
							 */
							if (changeDock) {
								
								this.setControlAttrs({
											isSetDock : true,
											"width" : box.width,
											top : box.top,
											left : box.left,
											bottom : 'auto',
											right : 'auto',
											height : box.height
										}, change);

								var panels = this.doLayout(parentControl);

							}
						}
					}
				},
				doLayout : function(parentControl) {

					// console.log("doLayout");
					// var st=new Date().getTime();
					var $dock_args = ['top', 'bottom', 'left', 'right',
							'width', 'height', 'fill'];// 'center','middle',
					var panes = {};
					for (var i = 0; i < $dock_args.length; i++) {
						if (!panes[$dock_args[i]]) {
							panes[$dock_args[i]] = [];
						}
						/*
						 * for (var key in parentControl.items) { var
						 * item=parentControl.items[key]; if
						 * (item.get("dock")==$dock_args[i]){
						 * panes[$dock_args[i]].push(item); } }
						 */
						$.each(parentControl.items, function(index, item) {
									if (item.get("dock") == $dock_args[i]) {
										panes[$dock_args[i]].push(item);
									}
								});
					}

					// var width=this.get("width");
					// var height=this.get("height");

					var parentWidth = parentControl.getWidth();
					var parentHeight = parentControl.getHeight();
					var layout=parentControl.get("layout");
					if (parentControl.type == "tabpanel") {
						parentHeight = parentControl.getContentHeight()
					}
					var layout=parentControl.get("layout");
						
						
					var top = 0, left = 0, bottom = 0, right = 0;
					for (var key in panes) {
						switch (key) {
							case "top" :
								var ps = panes["top"];
								for (var j = 0; j < ps.length; j++) {
									var p = ps[j];
									var box = {};
									box.top = parseFloat(top);
									box.left = parseFloat(left);
									box.bottom = 'auto';
									// box.right='auto';
									box.height = parseFloat(p.get("height"));
									box.width = parseFloat(parentWidth);
									top = top + parseFloat(p.get("height"));
									box["isSetDock"] = true;
									parentHeight = parentHeight
											- parseFloat(p.get("height"));
									p.setControlAttrs(box, true);
									/*
									 * if (p.items){ p.doLayout(p); }
									 */
								}
								break;
							case "bottom" :
								var ps = panes["bottom"];
								for (var j = 0; j < ps.length; j++) {
									var p = ps[j];
									var box = {};
									// box.top='auto';
									// box.left=0;
									box.bottom = bottom;
									// box.right='auto';
									box.height = parseFloat(p.get("height"));
									box.width = parentWidth;
									bottom = bottom + parseFloat(p.get("height"));
									parentHeight = parentHeight
											- parseFloat(p.get("height"));
									box["isSetDock"] = true;
									p.setControlAttrs(box, true);
									/*
									 * if (p.items){ p.doLayout(p); }
									 */
								}
								break;
							case "left" :
								var ps = panes["left"];
								for (var j = 0; j < ps.length; j++) {
									var p = ps[j]
									var box = {};
									box.top = top;
									// box.left=left;
									box.bottom = bottom;
									// box.right=right;
									box.width = parseFloat(p.get("width"));
									box.height = parentHeight;
									left = left + parseFloat(p.get("width"));
									parentWidth = parentWidth - parseFloat(p.get("width"));
									box["isSetDock"] = true;
									p.setControlAttrs(box, true);

									/*
									 * if (p.items){ p.doLayout(p); }
									 */
								}
								break;
							case "right" :
								var ps = panes["right"];
								for (var j = 0; j < ps.length; j++) {
									var p = ps[j]
									var box = {};
									box.top = top;
									// box.left='auto';
									box.bottom = 'auto';
									box.right = right;
									box.width = parseFloat(p.get("width"));
									box.height = parentHeight;
									right = right + parseFloat(p.get("width"));
									parentWidth = parentWidth - parseFloat(p.get("width"));
									box["isSetDock"] = true;
									p.setControlAttrs(box, true);

									/*
									 * if (p.items){ p.doLayout(p); }
									 */
								}
								break;
							case "width" :
								var ps = panes["width"];
								for (var j = 0; j < ps.length; j++) {
									var p = ps[j]
									var box = {};
									 if (layout=="vbox"||layout=="hbox"){
										 box.top="auto";
									 }else{
										box.top = parseFloat(top);
										top = top + box.height;
									 }
									//box.top=top;
									//box.left = left;
									// box.bottom='auto';
									// box.right=right;
									box.width = parentWidth;
									box.height = parseFloat(p.get("height"));
									box["isSetDock"] = true;
									//
									parentHeight = parentHeight
									- parseFloat(p.get("height"));
									// right=right+p.get("width");
									// parentWidth=parentWidth-p.get("width");
									//delete box.top;
									//delete box.left;
									p.setControlAttrs(box, true);
									/*
									 * if (p.items){ p.doLayout(p); }
									 */
								}
								break;
							case "height" :
								var ps = panes["height"];
								for (var j = 0; j < ps.length; j++) {
									var p = ps[j]
									var box = {};
									box.top = top;
								
									// box.left='auto';
									// box.bottom='auto';
									// box.right=right;
									box.width = parseFloat(p.get("width"));
									box.height = parentHeight;
									 if (layout=="vbox"||layout=="hbox"){
										 box.left="auto";
									 }else{
										box.left = parseFloat(left);
										left = left + box.width;
									 }
									box["isSetDock"] = true;
									// right=right+p.get("width");
									// parentWidth=parentWidth-p.get("width");
									p.setControlAttrs(box, true);
									/*
									 * if (p.items){ p.doLayout(p); }
									 */
								}
								break;
							case "fill" :
								var ps = panes["fill"];
								var flexCount=0;
								if (layout=="vbox"||layout=="hbox"){
									felxHeight=parentHeight;
									felxWidth=parentHeight;
									for (var i=0;i< parentControl.items.length;i++) {
										var item = parentControl.items[i];
										if (item.get("flex")){
											flexCount+=parseInt(item.get("flex"));
										}
									}
								
							     }
								
								for (var j = 0; j < ps.length; j++) {
									var p = ps[j]
									var box = {};
									
									box.top = top;
									box.left = left;
									// box.bottom='auto';
									// box.right=right;
									box.width = parentWidth;
									box.height = parentHeight;
									if (layout=="vbox"){
										box.top="auto";
										var temHeight=Math.ceil((parseInt(p.get("flex")) / flexCount)
												* felxHeight);
										
										top = top + temHeight;
										box.height=temHeight;
									}
									if (layout=="hbox"){
										box.top="auto";
										var temWidth=Math.ceil((parseInt(p.get("flex")) / flexCount)
												* felxWidth);
										parentWidth = parentHeight-temWidth;
										left = left + temWidth;
										box.height=temHeight;
									}
									box["isSetDock"] = true;
									// right=right+p.get("width");
									// parentWidth=parentWidth-p.get("width");
									p.setControlAttrs(box, true);
									/*
									 * if (p.items){ p.doLayout(p); }
									 */
								}
						};

					}
					// var st2=new Date().getTime() - st;
					// console.log("控件:"+this.id+"重置大小执行时间："+st2+"ms")
					return panes

				},
				getPanelBox : function(parentControl) {

					var parentWidth = parentControl.getWidth();
					var parentHeight = parentControl.getHeight();
					var top = 0, left = 0, bottom = 0, right = 0, item = null, dock,flexCount=0,felxHeight=parentHeight,felxWidth=parentWidth;

					var layout=parentControl.get("layout");
					
					if (parentControl.items) {
						/*if (layout=="vbox"||layout=="hbox"){
							
							for (var i=0;i< parentControl.items.length;i++) {
								item = parentControl.items[i];
								if (item.get("flex")){
									flexCount+=parseInt(item.get("flex"));
								}else{
									felxHeight=felxHeight-parseInt(item.get("height"));
									felxWidth=felxWidth-parseInt(item.get("width"));
								}
							}
						
					     }*/
						var item;
						for (var i=0;i< parentControl.items.length;i++) {
							item = parentControl.items[i];
							dock = item.get("dock");
							if (item.get("id") != this.get("id")) {
								switch (dock) {
									case "top" :
										top = top + item.get("height");
										parentHeight = parentHeight
												- item.get("height");
										break;
									case "width" :
										 if (layout=="vbox"||layout=="hbox"){
											 top = "auto";
										 }else{
											 top = top + item.get("height");
										 }
										parentHeight = parentHeight
												- item.get("height");
										break;
									case "height" :
										if (this.get("dock") == "top") {
											break;
										}
										parentWidth = parentWidth
												- item.get("width");
										 if (layout=="vbox"||layout=="hbox"){
											 left ="auto";
										 }else{
											 left = left + item.get("width");
										 }
										
										break;
									case "left" :
										if (this.get("dock") == "top") {
											break;
										}
										parentWidth = parentWidth
												- item.get("width");
										left = left + item.get("width");
										break;
									case "right" :
										parentWidth = parentWidth
												- item.get("width");
										right = right + item.get("width");
										break;
									case "bottom" :
										parentHeight = parentHeight
												- item.get("height");
										bottom = bottom + item.get("height");
										break;
									case "fill" :
										/*if (flexCount>0){
											if (layout=="vbox"){
												var temHeight=Math.ceil((parseInt(item.get("flex")) / flexCount)
														* felxHeight);
												parentHeight =parentHeight-temHeight ;
												top = top + temHeight;
												if (i==0){
													top=0
												}
											}
											if (layout=="hbox"){
												var temWidth=Math.ceil((parseInt(item.get("flex")) / flexCount)
														* felxWidth);
												parentWidth = parentHeight-temWidth;
												left = left + temWidth;
												if (i==0){
													left=0
												}

											}
										}*/
										break;
								}

							} else {
								break;
							}
						}
						
						return {
							width : parentWidth,
							height : parentHeight,
							top : top,
							bottom : bottom,
							left : left,
							right : right
						};

					} else {

						return {
							width : parentWidth,
							height : parentHeight,
							top : 0,
							bottom : 0,
							left : 0,
							right : 0
						};
					}

				}

			});

			FormPanelControl = PanelControl.extend({
						droppable : true,
						selectabel : true,
						attrsDefineKey : ControlAttrDefine.FormPanelControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.FormPanelControl),
						type : 'formpanel',
						items : null,
						initialize : function(options) {
							FormPanelControl.superclass.initialize.call(this,
									options);
						}
					})
			/**
			 * 输入控件基类
			 */

			TabControl = PanelControl.extend({
				type : 'tabpanel',
				droppable : false,
				selectabel : false,
				attrsDefineKey : ControlAttrDefine.TabControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.TabControl),
				// attrs:{actionTab:null,autoCtreateTab:true,dock:'width'},
				initialize : function(options) {

					/*
					 * this.controlAttrs=[{ id : "actionTab", //editor : 'text',
					 * value : this.get("actionTab"), name : '当前活动页' }];
					 */
					TabControl.superclass.initialize.call(this, options);

					// this.setActionTab(0);
				},
				renderAfter : function() {
					TabControl.superclass.renderAfter.call(this);
					if (this.get("autoCtreateTab")) {
						var item = {};
						for (var i = 0; i < 3; i++) {
							var id = "tab" + ++formdesignGudi;
							item = {
								id : id,
								title : "tab" + (i + 1),
								dock : 'fill',
								hidden : i == 0 ? false : true
							};
							// var st=new Date().getTime();
							this.addItem(new PanelControl(item));

							// console.log(st2-st)
						}
						this.set("autoCtreateTab", false)
					}
				},
				getDesingContainer : function() {
					return this.desingContainer;
				},
				getWidth : function() {
					var width = TabControl.superclass.getWidth.call(this);
					return width - 2;
				},
				/*
				 * getEl:function(){ return this.element; },
				 */
				addItem : function(control) {
					TabControl.superclass.addItem.call(this, control);
					var header = $(".tabs", this.element);
					var actionClass = "";
					if (this.get("actionTab") == this.items.length - 1) {
						actionClass = "tabs-selected";
					}
					var tabHeader = $('<li class=\"'
							+ actionClass
							+ '\"> <a href="javascript:void(0)" class="tabs-inner"><span class="tabs-title">'
							+ control.get('title')
							+ '</span><span class="tabs-icon"></span></a><span class="tabs-p-tool"></span></li>');
					header.append(tabHeader);
					/*
					 * header.find("li").unbind("click").bind("click",function(){
					 * console.log(this)
					 * 
					 * });
					 */
					var _self = this;
					tabHeader.mousedown(function(event) {
								event.stopPropagation();
								header.find("li").removeClass("tabs-selected");
								var index = header.find("li").index(this);
								$(this).addClass("tabs-selected");
								_self.setActionTab(index);

							});
					/*
					 * tabHeader.on("click",function(){
					 *  })
					 */
					/*
					 * var panels=$(".tabs-panels",this.element);
					 * panels.append(control.getEl());
					 */
				},
				getContentHeight : function() {

					return this.tabContent.outerHeight();
				},
				changeAttrAfter : function() {
					if (this.rendered) {
						TabControl.superclass.changeAttrAfter.call(this);
						var header = $(".tabs-header", this.element);
						var headerHeight = header.outerHeight();
						var panelsHeight = this.getHeight() - headerHeight;
						var width = this.getEl().width();
						var panels = $(".tabs-panels", this.element);
						// this.tabContent.css({width:width,height:panelsHeight});
						this.tabContent.outerWidth(width);
						this.tabContent.outerHeight(panelsHeight);
						// console.log(panelsHeight)
						/*
						 * if (this.items){
						 * $.each(this.items,function(index,item){
						 * item.setControlAttrs({height:panelsHeight,width:width,isSetDock:true});
						 * }); }
						 */
						this.setActionTab(this.get("actionTab"));
					}
				},
				setActionTab : function(index) {
					if (this.items && this.items[index]) {
						var oldActionTab = this.get("actionTab");
						if (oldActionTab == index) {
							return;
						}
						if (oldActionTab != null) {
							this.items[oldActionTab].setControlAttrs({
										hidden : true
									});
						}
						this.setControlAttrs({
									actionTab : index
								}, false);
						this.items[index].setControlAttrs({
									hidden : false
								});
						this.items[index].getEl().trigger("mousedown");
					}
				},
				renderControlEl : function() {
					var controlEl = $('<div  class="tabs-container">'
							+ '<div class="tabs-header">'
							+ '<div class="tabs-wrap" >'
							+ '<ul class="tabs"></ul>'
							+ '</div>'
							+ '</div>'
							+ '<div class="tabs-panels desing-container" style="position: absolute;">'
							+ '</div>' + '</div>' + '');
					this.tabContent = $(".tabs-panels", controlEl)
					this.desingContainer = this.tabContent;
					this.element.append(controlEl);
				}
			});

			TreeControl = PanelControl.extend({
				attrs : {
					checkField : null,
					childrenField : null,
					nameField : null,
					titleField : null,
					idField : null,
					parentField : null,
					rootName : null,
					rootId : null,
					url : null,
					qryUrl : null,
					data : null,
					hasRoot : false,
					oneRoot : false,
					isAsync : false
				},
				type : 'tree',
				initialize : function(options) {
					this.controlAttrs = [{
								id : "rootId",
								editor : 'text',
								name : "根节点值"
							}, {
								id : "rootName",
								editor : 'text',
								name : "根节点名称"
							}, {
								id : "isAsync",
								editor : {
									type : 'checkbox',
									options : {
										on : true,
										off : false
									}
								},
								name : "是否异步树"
							}, {
								id : "url",
								editor : 'text',
								name : "数据地址"
							}, {
								id : "checkField",
								editor : 'text',
								name : "复选框字段"
							}, {
								id : "childrenField",
								editor : 'text',
								name : "子节点字段"
							}, {
								id : "nameField",
								editor : 'text',
								name : "显示字段"
							}, {
								id : "titleField",
								editor : 'text',
								name : "标题字段"
							}, {
								id : "idField",
								editor : 'text',
								name : "值字段"
							}, {
								id : "parentField",
								editor : 'text',
								name : "父级字段"
							}, {
								id : "hasRoot",
								editor : {
									type : 'checkbox',
									options : {
										on : true,
										off : false
									}
								},
								name : "是否有根节点"
							}, {
								id : "oneRoot",
								editor : {
									type : 'checkbox',
									options : {
										on : true,
										off : false
									}
								},
								name : "是否单个根节点"
							}].concat(this.controlAttrs || []);
					TreeControl.superclass.initialize.call(this, options);
					this.initAttrData();

				},
				renderControlEl : function() {
					this.desingContainer = $('<div class="form-panel"><ul class="easyui-tree tree"><li><div id="_easyui_tree_1" class="tree-node"><span class="tree-hit tree-expanded"></span><span class="tree-icon tree-folder tree-folder-open"></span><span class="tree-title">RootNode</span></div></div><ul style="display: block;"><li><div id="_easyui_tree_2" class="tree-node tree-node-hover"><span class="tree-indent"></span><span class="tree-hit tree-expanded"></span><span class="tree-icon tree-folder tree-folder-open"></span><span class="tree-title">Photos</span></div></li></ul></li></ul></div>');
					this.element.append(this.desingContainer);
				}

			});
			FieldControl = BaseControl.extend({
				attrsDefineKey : ControlAttrDefine.FieldControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.FieldControl),
				type : 'field',
				initialize : function(options) {
					// this.controlAttrs=AttrDefinition.getControlAttrs(this.attrsDefineKey)
					// 初始化属性
					/*
					 * this.controlAttrs = [{ id : "value", editor : 'text',
					 * value : this.get("value"), name : '值' }, { id :
					 * "labelWidth", editor : 'text', //value :
					 * this.get("labelWidth"), name : '标签大小' }, { id :
					 * "labelText", editor : 'text', //value :
					 * this.get("labelText"), name : '标签文字' }, { id : "field",
					 * editor : 'text', //value : this.get("labelText"), name :
					 * '数据项字段' }, { id : "showField", editor : 'text', //value :
					 * this.get("labelText"), name : '数据显示字段' }, { id :
					 * "showValue", editor : 'text', //value :
					 * this.get("labelText"), name : '数据隐藏字段' }, { id :
					 * "required",
					 * editor:{type:'checkbox',options:{on:'true',off:'false'}},
					 * value : this.get("required"), name : '是否必填'
					 * }].concat(this.controlAttrs||[]);
					 */
					FieldControl.superclass.initialize.call(this, options);
					var _self=this;
					this.on("change:hidden", function(newVal, oldVal, attrKey) {
						
					
						if (_self.get("left")>1000){
							
							_self.setControlAttr("left",20);
						}
					});
					this.__ready=true;
					// ,"showValue":this.get("showValue")
					// this.setControlAttrs({
					// "labelText":this.get("labelText"),"labelWidth":this.get("labelWidth"),"required":this.get("required"),"showField":this.get("showField"),"field":this.get("field")});

				},
				renderControlEl : function() {
					this.labelEl = this.createLabel();
					this.controlEl = this.createControlEl();
					this.element.append(this.labelEl);
					this.element.append(this.controlEl);
				},
				createLabel : function() {
					var labelEl = $('<label class="control-field-label" style="width:'
							+ this.get("labelWidth")
							+ '">'
							+ this.get("labelText") + '</label>');
					return labelEl;
				},
				createControlEl : function() {
					var controlEl = $('<div class="control-field control-field-'
							+ this.type
							+ '"><input type="'
							+ this.type
							+ '" class="form-control" /></div>');
					return controlEl;
				},
				changeAttrAfter : function() {
					if (this.labelEl) {
						FieldControl.superclass.changeAttrAfter.call(this);
						var width = this.controlAttrs[this.attrKeys["width"]].value;
						var labelWidth = this.controlAttrs[this.attrKeys["labelWidth"]].value;
						var labelText = this.controlAttrs[this.attrKeys["labelText"]].value;
						if (!width)
							return;
						this.element._outerWidth(width);
						this.labelEl._outerWidth(labelWidth - 5);
						var textFieldWidth = width - labelWidth - 6;
						this.controlEl._outerWidth(textFieldWidth);
						this.labelEl.html(labelText);
						// console.log(this.attrKeys["labelWidth"])
						// this.controlEl.css({width:textFieldWidth});
						// this.labelEl.css({width:labelWidth});
					}
				}
			});

			HiddenFieldControl = FieldControl.extend({
				type : 'hidden',
				resize : false,
				attrsDefineKey : ControlAttrDefine.HiddenFieldControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.HiddenFieldControl),
				removeAttrs : ["labelWidth", "hidden"],
				disabelAttrs : ["width", "height"],
				attrs : {
					width : 18,
					height : 15
				},
				changeAttrAfter : function() {
					FieldControl.superclass.changeAttrAfter.call(this);
				},
				initialize : function(options) {
					if (!options) {
						options = {};
					}
					options.width = 18;
					options.height = 18;
					HiddenFieldControl.superclass.initialize
							.call(this, options);
					// this.setControlAttr("width", 18);
					// this.setControlAttr("height", 15);

				},
				renderControlEl : function() {
					this.controlEl = $('<div class=\"hidden-input\"><input type="'
							+ this.type + '" class="form-control" /></div>');
					this.element.append(this.controlEl);
				}
			})
			
			/*
			 * 按钮组件
			 */
			ButtonAreaControl = BaseControl.extend({
				type : 'buttonarea',
				attrsDefineKey : ControlAttrDefine.ButtonAreaControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.ButtonAreaControl),
				initialize : function(options) {
					ButtonAreaControl.superclass.initialize.call(this, options);
					var _self=this;
					this.on("change:buttons",function(newVal, oldVal){
					  _self.updateButtons();
					})
				},
				renderControlEl : function() {
					var buttonHtml = "<div class=\"btnarea menubar\"></div>"

					this.controlEl = $('<div class="control-field control-field-'
							+ this.type + '">' + buttonHtml + '</div>');
					this.element.append(this.controlEl);
				},
				updateButtons:function(){
				
					var buttons=this.get("buttons"),buttonHtml=[];
					$.each(buttons,function(index,button){
						buttonHtml.push("<a  class=\"app-button l-btn l-btn-small\" ><span class=\"l-btn-left\"><span class=\"l-btn-text\">"
							+ button["text"] + "</span></span></a>")
					});
				    this.controlEl.find(".btnarea").html(buttonHtml.join(""));
				},
				renderAfter : function() {
					this.updateButtons();		
					this.__ready = true;
				}
			});

			/**
			 * 按钮组件
			 */
			ButtonControl = BaseControl.extend({
				type : 'button',
				attrsDefineKey : ControlAttrDefine.ButtonControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.ButtonControl),
				initialize : function(options) {
					ButtonControl.superclass.initialize.call(this, options);

					this.on("change:text", function() {
								this.resizeWidth();
							});
					// var width=this.get("text").length*12;
				},
				renderAfter : function() {
					this.__ready = true;
					this.resizeWidth()
				},
				renderControlEl : function() {
					var buttonHtml = "<a  class=\"app-button l-btn l-btn-small\" style=\"width:100%;height:100%\"><span class=\"l-btn-left\"><span class=\"l-btn-text\">"
							+ this.get("text") + "</span></span></a>"
					this.controlEl = $('<div class="control-field control-field-'
							+ this.type + '">' + buttonHtml + '</div>');
					this.element.append(this.controlEl);
				},
				changeAttrAfter : function() {
					ButtonControl.superclass.changeAttrAfter.call(this);
					if (this.controlEl){
					var $text = $(".l-btn-text", this.controlEl), text = this
							.get("text");
							
					$text.html(text);
					}
				},
				resizeWidth : function() {
					var $text = $A(".l-btn-text", this.controlEl), text = this
							.get("text");
							console.log($text)
					if ($text.height() > 23) {
						var len = text.length;
						var strNum = 0;
						for (var i = 0; i < len; i++) {
							if (escape(text.charAt(i)).length > 4) {
								strNum = strNum + 2;
							} else {
								strNum++;
							}
						}
						var width;
						var textWidth = strNum * 7;
						if (this.type == "menubutton") {
							width = textWidth + 30;
						} else {
							width = textWidth + 23;
						}

						this.setControlAttr("width", width);
					}
				}
			});
			/**
			 * 按钮组件
			 */
			MenuButtonControl = ButtonControl.extend({
				type : 'menubutton',
				attrsDefineKey : ControlAttrDefine.MenuButtonControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.MenuButtonControl),
				renderControlEl : function() {
					var buttonHtml = "<a  class=\"app-button l-btn l-btn-small m-btn m-btn-small\" style=\"width:100%;height:100%\"><span class=\"l-btn-left \"><span class=\"l-btn-text\">"
							+ this.get("text")
							+ "</span><span class=\"m-btn-downarrow\"></span></span></a>"
					this.controlEl = $('<div class="control-field control-field-'
							+ this.type + '">' + buttonHtml + '</div>');
					this.element.append(this.controlEl);
				}
			});

			/**
			 * 文本框控件
			 */
			TextFieldControl = FieldControl.extend({
						type : 'textfield',
						attrsDefineKey : ControlAttrDefine.TextFieldControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.TextFieldControl),
						/*
						 * attrs : { height:40, width:200 },
						 */
						initialize : function(options) {
							/*
							 * var
							 * fieldTypeList=[{id:"textbox",name:"textbox"},{id:"number",name:"number"},{id:"datetime",name:"datetime"}];
							 * this.controlAttrs = [{ id : "fieldType", editor
							 * :{type:"combobox",options:{data:fieldTypeList}},
							 * name : '编辑框类型' }];
							 */
							TextFieldControl.superclass.initialize.call(this,
									options);
							this.setControlAttrs({
										"fieldType" : this.get("fieldType"),
										height : this.get("height"),
										width : this.get("width")
									});
						}
					});

			DateTimeFieldControl = TextFieldControl.extend({
						type : 'datetimefield',
						attrsDefineKey : ControlAttrDefine.MoneyFieldControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.MoneyFieldControl)
					});
			NumberFieldControl = TextFieldControl.extend({
						type : 'numberfield',
						attrsDefineKey : ControlAttrDefine.NumberFieldControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.NumberFieldControl)
					});
			MoneyFieldControl = NumberFieldControl.extend({
						type : 'moneyfield',
						attrsDefineKey : ControlAttrDefine.MoneyFieldControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.MoneyFieldControl)
					});

			TextAreaControl = FieldControl.extend({
				attrsDefineKey : ControlAttrDefine.TextAreaControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.TextAreaControl),
				type : 'textarea'
				/*
				 * attrs : { height:60, width:400 }
				 */
				,
				createControlEl : function() {
					var controlEl = $('<div class="control-field control-field-'
							+ this.type
							+ '"><textarea class="form-control" ></textarea></div>');
					return controlEl;
				},
				initialize : function(options) {

					TextAreaControl.superclass.initialize.call(this, options);
					this.setControlAttrs({
								height : this.get("height"),
								width : this.get("width")
							});
				}
			});
			/**
			 * 文本框控件
			 */
			CheckBoxControl = FieldControl.extend({
				type : 'checkbox',
				attrsDefineKey : ControlAttrDefine.CheckBoxControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.CheckBoxControl),

				/*
				 * attrs : { height:25, width:200, labelText:"checkbox1"
				 *  },
				 */
				initialize : function(options) {
					// var
					// fieldTypeList=[{id:"textbox",name:"textbox"},{id:"number",name:"number"},{id:"datetime",name:"datetime"}]

					CheckBoxControl.superclass.initialize.call(this, options);
					this.setControlAttrs({
								"fieldType" : this.get("fieldType"),
								labelText : this.get("labelText"),
								height : this.get("height")
							});
				},
				changeAttrAfter : function() {
					if (this.labelEl) {
						FieldControl.superclass.changeAttrAfter.call(this);
						var labelText = this.controlAttrs[this.attrKeys["labelText"]].value;
						this.labelEl.html(labelText);
						/*
						 * var
						 * width=this.controlAttrs[this.attrKeys["width"]].value;
						 * var
						 * labelWidth=this.controlAttrs[this.attrKeys["labelWidth"]].value;
						 * var
						 * labelText=this.controlAttrs[this.attrKeys["labelText"]].value;
						 * if (!width) return; this.element._outerWidth(width);
						 * this.labelEl._outerWidth(labelWidth-5); var
						 * textFieldWidth=width-labelWidth-6;
						 * this.controlEl._outerWidth(textFieldWidth);
						 * this.labelEl.html(labelText);
						 */
						// console.log(this.attrKeys["labelWidth"])
						// this.controlEl.css({width:textFieldWidth});
						// this.labelEl.css({width:labelWidth});
					}
				},
				renderControlEl : function() {
					this.labelEl = this.createLabel();
					this.controlEl = this.createControlEl();
					var chehboxPanel = $("<div class=\"checkbox\"></div>")
					chehboxPanel.append(this.controlEl);
					chehboxPanel.append(this.labelEl);
					this.element.append(chehboxPanel);
				},
				createLabel : function() {
					var labelEl = $('<span class="">' + this.get("labelText")
							+ '</span>');
					return labelEl;
				},
				createControlEl : function() {
					var controlEl = $('<span class=" control-field-'
							+ this.type
							+ '" style="height:auto;"><input type="'
							+ this.type + '" class="form-control" /></div>');
					return controlEl;
				}
			});

			RadioControl = CheckBoxControl.extend({
						type : 'radio',
						attrsDefineKey : ControlAttrDefine.CheckBoxControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.CheckBoxControl),
						initialize : function(options) {
							// var
							// fieldTypeList=[{id:"textbox",name:"textbox"},{id:"number",name:"number"},{id:"datetime",name:"datetime"}]

							RadioControl.superclass.initialize.call(this,
									options);
						}
					});
			/**
			 * 下拉框控件
			 */
			ComboBoxControl = FieldControl.extend({
				type : "combobox",
				/*
				 * attrs : { fieldType : 'combobox', width:200, height:40,
				 * data:null, url:null, valuefield:'id', textfield:'name',
				 * async:true, url:'' },
				 */
				attrsDefineKey : ControlAttrDefine.ComboBoxControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.ComboBoxControl),
				initialize : function(options) {
					/*
					 * var _self=this; var
					 * fieldTypeList=[{id:"combobox",name:"combobox"},{id:"combogrid",name:"combogrid"},{id:"comboztree",name:"comboztree"}]
					 * this.controlAttrs = [ { id : "textfield", editor :'text',
					 * name : "显示字段", value : this.get("textfield") }, { id :
					 * "valuefield", editor:'text', name : '隐藏值', value :
					 * this.get("valuefield") },{ id : "async",
					 * editor:{type:'checkbox',options:{on:'是',off:'否'}}, value :
					 * this.get("async"), name : '是否异步加载' },{ id : "url", editor
					 * :'text', name : '加载地址', value : this.get("url") } ,{ id :
					 * "fieldType", editor
					 * :{type:"combobox",options:{data:fieldTypeList}}, name :
					 * '编辑框类型' },{ id : "data", editor :
					 * {type:'button',options:{onClick:function(){ var dlg=new
					 * ItemsGridDialog({ dataKey:"data",
					 * columns:[{field:"name",editor:"text",title:"文本",width:200},{field:"id",editor:"text",title:"值",width:100}]
					 * }); dlg.setBindControl(_self) dlg.show();
					 * 
					 * }}}, name : '项目列表' }];
					 */
					ComboBoxControl.superclass.initialize.call(this, options);

					this.on("change:data", function() {

								// console.log("change data");
							})
					this.setControlAttrs({
								"fieldType" : this.get("fieldType"),
								"data" : this.get("data"),
								"url" : this.get("url"),
								"textfield" : this.get("textfield"),
								"valuefield" : this.get("valuefield")
							});
				},
				createControlEl : function() {
					var controlEl = $('<div class="control-field control-field-'
							+ this.type
							+ '"><select  class="form-control "></select></div>');
					return controlEl;
				},
				renderAfter : function() {

					this.__ready = true;
				}

			});

			ComboGridControl = ComboBoxControl.extend({
						type : "combogrid",
						attrsDefineKey : ControlAttrDefine.ComboGridControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.ComboGridControl)
					});

			ComboZtreeControl = ComboBoxControl.extend({
						type : "comboztree",
						attrsDefineKey : ControlAttrDefine.ComboZtreeControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.ComboZtreeControl)
					});

			ReferenceControl = ComboBoxControl.extend({
						type : "reference",
						attrsDefineKey : ControlAttrDefine.ReferenceControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.ReferenceControl)
					});

			QueryControl = BaseControl.extend({
				droppable : true,
				selectabel : true,
				attrsDefineKey : ControlAttrDefine.QueryControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.QueryControl),
				type : 'query',

				items : null,
				initialize : function(options) {
					QueryControl.superclass.initialize.call(this, options);
					this.on("change:quicks", this.changeQuicks);
				},
				renderControlEl : function() {
					this.desingContainer = $('<div class="form-xquery xquery" style=\"width:100%;\"></div>');
					this.element.append(this.desingContainer);
				},
				getDesingContainer : function() {
					return this.desingContainer;
				},
				renderAfter:function(){
					this.setControlAttrs({width:this.parentControl.get("width")});
					this.changeQuicks();
					this.__ready = true;
					//console.log()
				},
				changeQuicks:function(){
				   this.desingContainer.html("");
				   
				   var quicks=this.get("quicks");
				   var html=[];
				   html.push("<div class=\"xquery-quicks-items\"><div class=\"xquery-content\"><div class=\"queryleft\"><table class=\"query-itmes-table\"><tr>");
				   quicks.forEach(function(queryItem){
				   	if (queryItem["visible"]=="true"){
				   		
				   		
				    html.push("<td class=\"clabel\" visible=\""+queryItem["visible"]+"\"><label>"+queryItem["labelText"]+"</label></td>");
				    html.push("<td class=\"cfield\"><input type=\""+ queryItem["type"]+ "\" class=\"form-control\"  style=\"border:1px solid #ccc\" /></td>")
				   }
				   })
				   html.push("</tr></table></div></div></div>");
				   this.desingContainer.html(html.join(""));
				
				}
			})
			/**
			 * label控件
			 */
			LabelControl = BaseControl.extend({
				type : "label",
				initialize : function(options) {
					LabelControl.superclass.initialize.call(this, options);
				},
				renderControlEl : function() {
					this.controlEl = $('<label class="control-label" >'
							+ this.get("value") + '</label>');
					this.element.append(this.controlEl);
				},
				changeAttrAfter : function() {
					var el = this.getEl();
					if (this.controlEl) {
						this.controlEl
								.html(this.controlAttrs[this.attrKeys["value"]].value)
					}
					// this.controlEl.val()

				}
			});

			/**
			 * 网格控件
			 */
			GridControl = PanelControl.extend({
				attrsDefineKey : ControlAttrDefine.GridControl,
				attrs : AttrDefinition
						.getClassAttrs(ControlAttrDefine.GridControl),
				/*
				 * attrs : { cls : '', value : '', title:'网格',
				 * columns:[{title:'列1',field:'column1',width:100},{title:'列2',field:'column2',width:200},{title:'列3',field:'column3',width:200}],
				 * type : "grid", height:'300', width:'400' },
				 */
				type : "grid",
				initialize : function(options) {
					var _self = this;
					/*
					 * this.controlAttrs=[{ id : "columns", editor :
					 * {type:'button',options:{ onClick:function(){ var
					 * columns=_self.get("columns"); var dlg=new
					 * TreeGridDialog({ dataKey:"columns",
					 * columns:[{field:"title",editor:"text",title:"列名",width:80}
					 * ,{field:"field",editor:"text",title:"字段名",width:100}
					 * ,{field:"width",editor:{type:'number',options:{}},title:"宽度",width:100}
					 * ,{field:"hidden",editor:{type:'checkbox',options:{on:'true',off:'false'}},title:"是否隐藏",width:100}
					 * ,{field:"isEdit",editor:{type:'checkbox',options:{on:'true',off:'false'}},title:"是否可编辑",width:100}
					 * ,{field:"editor",editor:{type:'combobox',options:{validate:null,data:[{id :
					 * 1,name : "文本框"}]}},title:"宽度",width:100}] });
					 * dlg.setBindControl(_self) dlg.show(); var $dlg=$('<div
					 * style="padding:5px;"> <div id="gridLayout"
					 * data-options="fit:true"><div
					 * data-options="region:\'center\',border:false" >'+ '<table
					 * id="dg" class="easyui-datagrid" title="Row Editing in
					 * DataGrid" style="width:600px;height:350px;">'+ '<thead><tr>'+ '<th data-options="field:\'title\',width:80,editor:\'text\'">列名</th>'+ '<th data-options="field:\'field\',width:80,editor:\'text\'">字段名</th>'+ '<th data-options="field:\'width\',width:80,editor:{type:\'number\',options:{}}">宽度</th>'+ '<th data-options="field:\'hidden\',width:80,editor:{type:\'checkbox\',options:{on:\'P\',off:\'\'}}">是否隐藏</th>'+ '<th data-options="field:\'isEdit\',width:80,editor:{type:\'checkbox\',options:{on:\'P\',off:\'\'}}">是否可编辑</th>'+ '<th data-options="field:\'editor\',width:80,editor:{type:\'combobox\',options:{validate:\'\',data:[{id : \'1\',name : \'文本框\'}]}}">编辑框类型</th>'+ '</tr></thead>'+ '</table>' + '</div>
					 * <div
					 * data-options="region:\'south\',border:false,height:40"
					 * style="height:40px;text-align:right;padding:5px 0 0;"><a
					 * id="gridCfgBtn" style="width:80px">确定</a> <a
					 * style="width:80px" id="gridCanelBtn">取消</a></div>
					 * </div></div>'); var editIndex = undefined;
					 * 
					 * function onClickRow(index) { if (editIndex != index) { if
					 * (endEditing()) { $('#dg').datagrid('selectRow',
					 * index).datagrid( 'beginEdit', index); editIndex = index; }
					 * else { $('#dg').datagrid('selectRow', editIndex); } } }
					 * function endEditing(){ if (editIndex == undefined){return
					 * true} if ($('#dg').datagrid('validateRow', editIndex)){
					 * var ed = $('#dg').datagrid('getEditor',
					 * {index:editIndex,field:'productid'}); var productname =
					 * $(ed.target).combobox('getText');
					 * $('#dg').datagrid('getRows')[editIndex]['productname'] =
					 * productname; $('#dg').datagrid('endEdit', editIndex);
					 * editIndex = undefined; return true; } else { return
					 * false; } } function append() { if (endEditing()) {
					 * $('#dg').datagrid('appendRow', { }); editIndex = $('#dg')
					 * .datagrid('getRows').length - 1;
					 * 
					 * $('#dg').datagrid('selectRow', editIndex)
					 * .datagrid('beginEdit', editIndex);; } }; function
					 * removeit(){ if (editIndex == undefined){return}
					 * $('#dg').datagrid('cancelEdit', editIndex)
					 * .datagrid('deleteRow', editIndex); editIndex = undefined; }
					 * $("body").append($dlg); $dlg.window({ title:'网格列设置',
					 * width:600, height:400 }); var toolbar = [{ text : '新增列',
					 * iconCls : 'icon-add', handler : append }, { text : '删除列',
					 * iconCls : 'icon-cut', handler :removeit }];
					 * 
					 * $('#dg',$dlg).datagrid({toolbar:toolbar,singleSelect:true,fit:true,
					 * onClickRow:onClickRow});
					 * $('#dg',$dlg).datagrid("loadData",columns);
					 * $('#gridLayout',$dlg).layout();
					 * $('#gridCfgBtn',$dlg).button({onClick:function(){
					 * endEditing(); var rows=$('#dg',$dlg).datagrid("getRows");
					 * for (var i=0;i<rows.length;i++){
					 * rows[i].width=parseInt(rows[i].width); }
					 * _self.setControlAttr("columns",rows);
					 * $dlg.window('close'); $dlg.window('destroy'); }});
					 * $('#gridCanelBtn',$dlg).button({onClick:function(){
					 * $dlg.window('close'); $dlg.window('destroy');
					 * 
					 * }}); } }}, value : this.get("columns"), name : '列信息' } ];
					 */
					GridControl.superclass.initialize.call(this, options);
					// this.controlAttrs=$.extend
					this.setControlAttrs({
								"columns" : this.get("columns")
							});

				},
				renderControlEl : function() {
					this.controlEl = $('<table class="table table-bordered"></table>');
					this.element.append(this.controlEl);
					this.rendreHeader();
				},
				rendreHeader : function() {
					if (this.controlEl) {
						this.controlEl.html("");
						var thead = $("<thead></thead>");
						var tr = $("<tr></tr>");
						thead.append(tr);
						var columns = this.get("columns"), html = "";

						for (var i = 0; i < columns.length; i++) {
							var col = columns[i];
							if (col.hidden != "true")
								html = html + '<td width="' + col.width + '">'
										+ col.title + '</td>';
						}
						tr.html(html);
						this.controlEl.append(thead);
					}
				},
				changeAttrAfter : function() {
					GridControl.superclass.changeAttrAfter.call(this);
					this.rendreHeader();
					// this.controlEl.val()

				}

			});

			JqGridControl = GridControl.extend({
						type : "jqgrid",
						attrsDefineKey : ControlAttrDefine.JqGridControl,
						attrs : AttrDefinition
								.getClassAttrs(ControlAttrDefine.JqGridControl),
						initialize : function(options) {
							JqGridControl.superclass.initialize.call(this,
									options);
						}
					});
			ControlReg = {
				"textfield" : TextFieldControl,
				"numberfield" : NumberFieldControl,
				"moneyfield" : MoneyFieldControl,
				"combobox" : ComboBoxControl,
				"datetimefield" : DateTimeFieldControl,
				"reference" : ReferenceControl,
				"label" : LabelControl,
				"grid" : GridControl,
				"page" : PageControl,
				"tabpanel" : TabControl,
				"panel" : PanelControl,
				"hidden" : HiddenFieldControl,
				"jqgrid" : JqGridControl,
				"textarea" : TextAreaControl,
				"tree" : TreeControl,
				"comboztree" : ComboZtreeControl,
				"combogrid" : ComboGridControl,
				"button" : ButtonControl,
				"menubutton" : MenuButtonControl,
				"formpanel" : FormPanelControl,
				"checkbox" : CheckBoxControl,
				"query" : QueryControl,
				"buttonarea" : ButtonAreaControl
			};

			function u(j) {
				var av = $(".desing-panel")
				var aK = [100], aJ = $(".form-component", av);
				if (j) {
					aJ = aJ.not(j)
				}
				aJ.vals(["css", "z-index"], aK);
				return Math.max.apply(null, aK) + 1
			}
			function n() {
				var av = $(".desing-panel")
				var j = av.find(".ui-selecting");
				if (j.length == 1) {
					av.data("first-selected")
							&& av.data("first-selected")
									.removeClass("ui-selected-first");
					av.data("first-selected", $(j[0])
									.addClass("ui-selected-first"))
				}
			}
			var V = false;
			/**
			 * 表单画布
			 */
			FormDesignCanvas = Widget.extend({
				formDesign : null,
				selected : null,
				controlCollection : {},
				items : {},
				attrs : {
					width : 796,
					height : 800
				},

				getAllControls : function() {
					return this.controlCollection;
				},
				getPosition : function(pos) {
					var rootpos = this.canvas.offset();
					var elpos = pos;
					var pos = {
						top : elpos.top - rootpos.top,
						left : elpos.left - rootpos.left
					};
					return pos;
				},
				propsInAttrs : ['formDesign', 'element'],
				initialize : function(options) {
					FormDesignCanvas.superclass.initialize.call(this, options);
					this.page = new PageControl();
					this.initPage(this.page);
					var _self = this;
					$(document).keydown(function(event) {
						if (event.keyCode == '46') {
							var selected = _self.getSelected();
							/*
							 * var
							 * designCanvas=DesignCanvasHelper.getDesignCanvas();
							 */

							var selectedItems = _self.resizeHandle
									.data("selected");
							if (selectedItems) {
								for (var i = 0; i < selectedItems.length; i++) {

									var selectedItem = selectedItems[i];
									var elpos = selectedItem[0];
									var control = selectedItem[2];

									control.destroy();
									/*
									 * if
									 * (control.parentControl&&control.parentControl.items){
									 * console.log(control.parentControl.items.indexOf(control)); }
									 */

								}
							}
							_self.unselect();
							// _self.canvas.data("first-selected", null);
							selected.remove();
							var propertyGridPanel = _self.formDesign.propertyGridPanel;
							$(propertyGridPanel).propertygrid('loadData', {
										rows : []
									});
						}
							// console.log(arguments)
					}).mousedown(function() {
								// _self.resizeHandle.hide();

							});

					var pageTree = this.formDesign.pageTree;
					$(pageTree).tree({
						onBeforeLoad : function() {
							// console.log("onBeforeLoad")
							// console.log(arguments)
						},
						onSelect : function(node) {
							if (node["controlObj"]) {

								if (node["controlObj"].type == "page") {

									node["controlObj"].getEl()
											.find(".jp-paper-background")
											.trigger("click");
								} else {
									node["controlObj"].getEl().trigger("click");
								}
							}
							// console.log(node)
						},
						onLoadSuccess : function() {
							// console.log("onLoadSuccess")
						}
					})

				},
				getPage : function() {

					return this.page;
				},
				initPage : function(page) {
					this.controlCollection = {};
					$(this.element).html("");
					this.page = page;
					// this.canvas = $('<div class="desing-panel
					// desing-container"><img class="jp-paper-background
					// screen-only" src="images/blank.png"><p class="jp-h-ruler
					// jp-ruler-element"></p><p class="jp-v-ruler
					// jp-ruler-element"></p></div>');
					var _self = this;
					var propertyGridPanel = this.formDesign.propertyGridPanel;

					var beforaddItem = function(control) {
						if (_self.controlCollection[control.id]) {
							return false;
						}
						return true;
					}
					var itemDestroy = function(control) {
						
						
					
						var deleteControl=function(control){
							
							if (control.items){
								for(var i=0;i<control.items.length;i++){
									deleteControl(control.items[i]);
								}
							}
							delete _self.controlCollection[control.id];
						
						}
						deleteControl(control);
						var pageTree = _self.formDesign.pageTree;
						var node = $(pageTree).tree("find", control.id);
						if (node) {
							$(pageTree).tree("remove", node.target);
						}
						// console.log($(pageTree).tree("find",control.id))
					}
					var addItemAfter = function(control) {

						var st = new Date().getTime();
						_self.controlCollection[control.id] = control;
						control.on("beforaddItem", beforaddItem);
						var timename;
						control.on("changeAttr", function(attrs) {
									/*
									 * if (timename){ clearInterval(timename) }
									 */
									/*
									 * timename=setTimeout(function() {
									 *  }, 50);
									 */
									$(propertyGridPanel).propertygrid(
											'loadData', {
												rows : attrs
											});
								});
						control.getEl().bind("click", function(event) {
							var isselectable = $(event.target)
									.data("isselectable")

							if (isselectable) {
								$(event.target).data("isselectable", null);
								return;
							}
							// $.data(event.target, this.widgetName +
							// ".preventClickEvent", true)
							// if (!isSelectableEvent){
							event.stopPropagation();
							var control = $(this).data("formControl");
							_self.select(control);
								// }
								// console.log(el.css("z-index"));
								// }

						});
						_self.select(control);
						control.on("addItemAfter", addItemAfter);
						control.on("destroy", itemDestroy);
						_self.refreshPageTree("addControl");

					};
					this.page.on("addItemAfter", addItemAfter);
					this.page.on("beforaddItem", beforaddItem);
					var _self=this;
					this.page.getEl().find(".jp-paper-background").bind(
							"click", function(j) {
								var isSelectableEvent = $(this)
										.data("selectable.preventClickEvent");

								if (!isSelectableEvent) {
									j.stopPropagation();

									if ($(j.target).is(".jp-paper-background")) {
										_self.unselect()
										// _self.select(_self.page);
										var propertyGridPanel = _self.formDesign.propertyGridPanel;
										$(propertyGridPanel).propertygrid(
												'loadData', {
													rows : _self.page
															.getControlAttrs()
												});
										_self.canvas.data("first-selected", _self.page.getEl());
									}
								}
							});

					/*
					 * this.canvas.css({ width : this.get("width"), height :
					 * this.get("height") });
					 */
					this.canvas = this.page.getEl();
					$(this.element).append(this.page.getEl());
					var _self = this;
					this.resizeHandle = $('<div class="xui-advresizer">'
							+ '<div class="xui-advresizer-line" style="position: absolute; cursor: default; border: 1px dashed blue; left: 0px; top: 0px; display: block;"></div>'
							+ '</div>');
					$(this.canvas).append(this.resizeHandle);
					// this.resizeHandle.hide();
					this.resizeHandle.hide();
					this.resizeHandle.click(function(event) {
						var isresize = _self.resizeHandle.resizeing;;
						if (isresize) {
							_self.resizeHandle.resizeing = false;
							return;
						}
						// console.log("click")
						// _self.unselect();
						// console.log(event);event.pageX, top:event.pageX
						var ep = {
							left : event.pageX,
							top : event.pageY
						};
						var fun2 = function(arr, ep, parent) {
							if (!arr)
								return false;
							var me = arguments.callee, m, rt, pos, w, h,
							// mouse abs pos offset
							epoff = {},
							// parent abs pos
							ppos = parent.offset(),
							// parent size
							rgw = parent.width(), rgh = parent.height();
							epoff.left = ep.left - ppos.left;
							epoff.top = ep.top - ppos.top;
							for (var i = 0; i < arr.length; i++) {
								if (arr[i].items) {
									m = arr[i].getEl();
									if (rt = me(arr[i].items, ep, m))
										break;
								}
								// console.log(arr[i].getEl().is(":hidden"))
								if (arr[i].getEl().is(":hidden") == true) {
									continue;
								}
								m = arr[i].getEl();
								pos = m.position();
								w = m.width();
								h = m.height();
								if (epoff.left > pos.left
										&& epoff.top > pos.top
										&& epoff.left < pos.left + w
										&& epoff.top < pos.top + h
										&& epoff.left < rgw && epoff.top < rgh) {
									rt = arr[i];
									break;
								}
							}

							return rt;
						};
						var selectItems = _self.getSelected(), ret
						selectItems.each(function(index, item) {
									var control = $(item).data("formControl");
									// console.log(contro.items)

									ret = fun2(control.items, ep, $(item)
													.parent())
									if (ret) {
										return false;
									}
								});
						if (ret) {
							_self.select(ret);
						}
						event.stopPropagation();
							// console.log($(event.position))

					});
					this.resizeHandle.draggable({
						canvas : this,
						// helper: ".xui-advresizer",
						containment : ".desing-container",
						revert : function() {
							var dockRevet = {
								top : true,
								bottom : true,
								left : true,
								right : true,
								fill : true,
								none : false,
								width : false,
								height : false
							};
							var selected = _self.getSelected();
							if (selected.length > 0) {
								var control = $(selected[0])
										.data("formControl");
								var dock = control.get("dock");
								if (!dock) {
									return false;
								} else {
									return dockRevet[dock];
								}
							}
						},
						start : function(event, draggableObj) {
							$(event.target).data("offset",
									$(event.target).offset());
							/*
							 * $(event.target).data({
							 * oldOffset:draggableObj.offset });
							 */
							// 获取所有选中控件
							/*
							 * var selected =
							 * _self.getSelected().each(function() { var item =
							 * $(this); item.data("offset", item.offset());//
							 * 保存选中控件坐标 });
							 * 
							 * 
							 * if (!control.selected()) {// 如果不存在选中控制指定当前控件选中
							 * _self.select(control); } // 获取当前控制坐标 //offset =
							 * control.getEl().offset(); var aN = [], aM =
							 * ["offset"]; selected.vals(aM, aN);
							 * $(event.target).data({ oldOffsets : aN, dragging :
							 * selected.length == 1 })
							 */
						},
						stop : function(event, draggableObj) {
							var selectedItems = $(event.target)
									.data("selected"), dock = 'none';;
							var offset = $(event.target).data("offset");
							var newoffset = draggableObj.offset;

							var pos = {
								top : newoffset.top - offset.top,
								left : newoffset.left - offset.left
							};
							/*
							 * var selected = _self.getSelected(); if
							 * (selected.length == 0 || selected.length > 1) {
							 * console.log("没有选中") return; }
							 */

							if (selectedItems) {
								for (var i = 0; i < selectedItems.length; i++) {

									var selectedItem = selectedItems[i];
									var elpos = selectedItem[0];
									var control = selectedItem[2]
									elpos.top = elpos.top + pos.top;
									elpos.left = elpos.left + pos.left;
									control.setControlAttr("top", elpos.top);
									control.setControlAttr("left", elpos.left);
								}
							}

							/*
							 * if (selected.length > 0) { var control =
							 * $(selected[0]).data("formControl"); var dock =
							 * control.get("dock");
							 * 
							 * if (dock) { switch (dock) { case "top" : case
							 * "left" : case "right" : case "bottom" : break;
							 * case "width" : control.setControlAttr("top",
							 * elnewpos.top); case "height" :
							 * control.setControlAttr("left", elnewpos.left);
							 * break; case "none" :
							 * control.setControlAttr("top", elnewpos.top);
							 * control.setControlAttr("left", elnewpos.left);
							 * 
							 * break;
							 *  } } else { control.setControlAttr("top",
							 * elnewpos.top); control.setControlAttr("left",
							 * elnewpos.left); } }
							 */
						}
					}).resizable({
						handles : "all",
						resize : function(event, resizeObj) {
							$(event.target).css({
										width : resizeObj.size.width,
										height : resizeObj.size.height
									});
							$(".xui-advresizer-line", event.target).css({
										width : resizeObj.size.width,
										height : resizeObj.size.height
									});

						},
						start : function(event, resizeObj) {
							// $(event.target).data("size",resizeObj.size);
							_self.resizeHandle.resizeing = false;
							$(".xui-advresizer-line", event.target).css({
										width : resizeObj.size.width,
										height : resizeObj.size.height
									});
						},
						stop : function(event, resizeObj) {
							var originalSize = resizeObj.originalSize, originalPosition = resizeObj.originalPosition, dock = 'none';
							var changeSize = {
								width : resizeObj.size.width
										- originalSize.width,
								height : resizeObj.size.height
										- originalSize.height
							};
							/*
							 * var el = control.getEl(); var elpos =
							 * el.offset(); var pos = _self.getPosition(elpos);
							 */
							var selectedItems = $(event.target)
									.data("selected");
							if (selectedItems) {
								for (var i = 0; i < selectedItems.length; i++) {
									var selectedItem = selectedItems[i];
									var elsize = selectedItem[1];
									var control = selectedItem[2];
									if (dock != control.get("dock")
											&& control.get("dock") != "none") {
										dock = control.get("dock");
									}
									elsize.height = elsize.height
											+ changeSize.height;
									elsize.width = elsize.width
											+ changeSize.width;
									if (control.resize) {
										control.setControlAttr("height",
												elsize.height);
										control.setControlAttr("width",
												elsize.width);
									}
								}
							}

							if (dock) {
								switch (dock) {
									case "top" :
									case "bottom" :
										_self.resizeHandle.animate({
													top : originalPosition.top,
													left : originalPosition.left,
													height : resizeObj.size.height,
													width : originalSize.width
												}, 300);
										$(".xui-advresizer-line",
												_self.resizeHandle).animate({
													width : originalSize.width
															- 2,
													height : resizeObj.size.height
															- 2
												}, 300)
										break;
									case "left" :
									case "right" :
										_self.resizeHandle.animate({
													top : originalPosition.top,
													left : originalPosition.left,
													height : originalSize.height,
													width : resizeObj.size.width
												}, 300);
										$(".xui-advresizer-line",
												_self.resizeHandle).animate({
													width : resizeObj.size.width
															- 2,
													height : originalSize.height
															- 2
												}, 300)
										break;
									case "width" :

										_self.resizeHandle.animate({
													height : resizeObj.size.height,
													width : originalSize.width
												}, 300);
										$(".xui-advresizer-line",
												_self.resizeHandle).animate({
													width : originalSize.width
															- 2,
													height : resizeObj.size.height
															- 2
												}, 300)
									case "height" :
										_self.resizeHandle.animate({
													height : originalSize.height,
													width : resizeObj.size.width
												}, 300);
										$(".xui-advresizer-line",
												_self.resizeHandle).animate({
													width : resizeObj.size.width
															- 2,
													height : originalSize.height
															- 2
												}, 300)
										break;
									case "fill" :
										_self.resizeHandle.animate({
													top : originalPosition.top,
													left : originalPosition.left,
													height : originalSize.height,
													width : originalSize.width
												}, 300);
										$(".xui-advresizer-line",
												_self.resizeHandle).animate({
													width : originalSize.width
															- 2,
													height : originalSize.height
															- 2
												}, 300)
										break;
									case "none" :
										_self.resizeHandle.css({
													/*
													 * top : pos.top, left :
													 * pos.left,
													 */
													width : resizeObj.size.width,
													height : resizeObj.size.height
												});
										$(".xui-advresizer-line",
												_self.resizeHandle).css({
													width : resizeObj.size.width
															- 2,
													height : resizeObj.size.height
															- 2
												});
										break;
								}
							} else {

								_self.resizeHandle.css({
											// top : pos.top,
											// left : pos.left,
											width : resizeObj.size.width,
											height : resizeObj.size.heihgt
										});
								$(".xui-advresizer-line", _self.resizeHandle)
										.css({
													width : resizeObj.size.width
															- 2,
													height : resizeObj.size.heihgt
															- 2
												})
							};

							_self.resizeHandle.resizeing = true;

						}
					});
					this.canvas.click(function(j) {
								if ($(j.target).is(".jp-paper-background")
										&& !V) {
									_self.unselect();
									// var selecteds=_self.getSelected();

									/*
									 * if (selecteds.length){ for(i=0;i<selecteds.length;i++){
									 * var
									 * control=selecteds[i].data("formControl");
									 * control } }
									 * //_self.unselect().unselect();
									 * _self.resizeHandle.hide();
									 */
								}
								V = false
							});
					this.refreshPageTree("initPage")
				},
				addFormControl : function(controlCfg, ctx, parentControl) {
					var _self = this, control, resizeObj = {};
					if (!controlCfg.type) {
						controlCfg.type = TextFieldControl;
					}
					var controlType;
					if (typeof controlCfg.type == "string") {
						controlType = ControlReg[controlCfg.type];

					} else {
						controlType = controlCfg.type;
					}
					if (!controlType) {
						return;
					}
					control = new controlType({
								id : controlCfg.id
							});
					parentControl.addItem(control);
					control.setParentControl(parentControl);
					var propertyGridPanel = this.formDesign.propertyGridPanel;
					if (control.type != "grid") {
						// resizeObj={min}
					}
					control.on("changeAttr", function(attrs) {
								$(propertyGridPanel).propertygrid('loadData', {
											rows : attrs
										});
							});
					this.items[control.getId()] = control;
					/*
					 * if (ctx){ var parentControl=ctx.data("formControl");
					 * 
					 * $(".desing-container",
					 * parentControl.getEl()).append(control.getEl());
					 * 
					 * }else{ this.canvas.append(control.getEl()); }
					 */
					ctx.append(control.getEl());
					this.createDroppable(control);
					this.createSelectable(control);
					/*
					 * control.getEl().droppable({ greedy: true, accept :
					 * ".toolbox-item", // activeClass: "ui-state-highlight",
					 * drop : function(event, ui) { // console.log(arguments)
					 * var type = ui.draggable.data("type"); if (type) { var
					 * parent=$(event.target); var
					 * controlCfg=$.extend({},{type:ui.draggable.data("type")},ui.offset);
					 * 
					 * _self.addFormControl(controlCfg,parent);
					 *  }
					 *  } }).selectable({ distance : 1, filter :
					 * ".form-component", start : function(event) { var j =
					 * $(event.target).data("selectable-item",null).data("ui-selectable");
					 * console.log(j) } })
					 */
					var canvasPos = ctx.offset();
					var selected = null, offset;
					var top = Math.max(controlCfg.top - canvasPos.top, 0);
					var left = Math.max(controlCfg.left - canvasPos.left, 0);
					control.getEl().css({
								left : left,
								top : top
							});
					control.setControlAttr("left", left);
					control.setControlAttr("top", top);
					// control.setControlAttr("width",control.getEl().width());
					// control.setControlAttr("height",control.getEl().height());
					control.getEl()/*
									 * .mydraggable({ canvas : this, // helper:
									 * ".xui-advresizer", containment :
									 * ".desing-container", start :
									 * function(event, draggableObj) { //
									 * 获取所有选中控件 selected =
									 * _self.getSelected().each(function() { var
									 * item = $(this); item.data("offset",
									 * item.offset());// 保存选中控件坐标 });
									 * 
									 * if (!control.selected()) {//
									 * 如果不存在选中控制指定当前控件选中 _self.select(control); } //
									 * 获取当前控制坐标 offset =
									 * control.getEl().offset(); var aN = [], aM =
									 * ["offset"]; selected.vals(aM, aN);
									 * $(event.target).data({ oldOffsets : aN,
									 * dragging : selected.length == 1 }) },
									 * stop : function(event,draggableObj) {
									 * 
									 * $(event.target).data({ dragging : false,
									 * rulers : null });
									 * $(".jp-ruler-element").css("display",
									 * "none"); var aN = [], aM = ["offset"];
									 * _self.getSelected().vals(aM, aN);
									 * selected.each(function() { var aR =
									 * $(this),
									 * control=aR.data("formControl"),aRpos=aR.position();
									 * 
									 * control.setControlAttr("left",aRpos.left);
									 * control.setControlAttr("top",aRpos.top);
									 * 
									 * 
									 * var aR = $(this), aS = aR
									 * .data("offset"); aR.css({ top : aS.top +
									 * aN, left : aS.left + aM }) }); var
									 * control=$(event.target).data("formControl");
									 * var el=control.getEl(); var
									 * pos=el.position();
									 * _self.resizeHandle.css({ top : pos.top,
									 * left : pos.left });
									 * control.setControlAttr("left",draggableObj.position.left);
									 * control.setControlAttr("top",draggableObj.position.top); //
									 * aq.add(new w(_self.getSelected(), aM, //
									 * $(event.target).data("oldOffsets"), //
									 * aN)) }, drag : function(event,
									 * draggableObj) {
									 * 
									 * var rulers =
									 * $(event.target).data("rulers"); var
									 * control=$(event.target).data("formControl");
									 * if (control.get("dock")){ return false; }
									 * var aN = draggableObj.position.top -
									 * offset.top, aM =
									 * draggableObj.position.left - offset.left;
									 * selected.not(this).each(function() { var
									 * aR = $(this), aS = aR .data("offset");
									 * aR.css({ top : aS.top + aN, left :
									 * aS.left + aM }) });
									 * 
									 * 
									 * var el=control.getEl(); var
									 * pos=el.position();
									 * _self.resizeHandle.css({ top : pos.top,
									 * left : pos.left }); if (rulers) {
									 * _self.showConnectors(event.target,
									 * rulers) } } })
									 */.mousedown(function(event) {
						// console.log(aM)
						event.stopPropagation();
						var control = $(this).data("formControl");

						/*
						 * _self.resizeHandle.css({ left:pos.left, top:pos.top,
						 * width:el.width(), height:el.height() });
						 */
						// if (!control.selected()) {
						// if (!aM.ctrlKey) {
						/*
						 * control.getEl().siblings() .unselect()
						 */
						// }
						_self.select(control);

							// console.log(el.css("z-index"));
							// }

						});
					/*
					 * control.getEl().resizable({ stop:
					 * function(evnet,resizeObj){
					 * control.setControlAttr("height",resizeObj.size.height);
					 * control.setControlAttr("width",resizeObj.size.width); }
					 * });
					 */
					control.setRendered(true);
					this.select(control);

					return control;

				},
				refreshPageTree : function(formFun) {
					// console.log(formFun)
					var pageTree = this.formDesign.pageTree;
					var convertTreeData = function(data) {
						var nodeData = {};

						nodeData["text"] =data.type+" [id="+data.id+"]";
						nodeData["id"] = data.id;
						nodeData["controlObj"] = data;

						// data.children = data.items;
						if (data.items) {
							nodeData.children = [];
							for (var i = 0; i < data.items.length; i++) {

								nodeData.children
										.push(convertTreeData(data.items[i]));
							}
						}
						return nodeData;
					}

					// var pageData=$.extend(true,{},this.page);
					var pageData = convertTreeData(this.page);

					$(pageTree).tree("loadData", [pageData])

				},
				controlBindEvent : function(control) {

				},
				getSelected : function() {
					return $(".ui-selected", $(".desing-container"));
				},

				unselect : function(control) {

					if (control) {
						control.unselect();
					} else {
						var selecteds = this.getSelected();
						for (var i = 0; i < selecteds.length; i++) {
							var controlItem = $(selecteds[i])
									.data("formControl");
							controlItem.unselect();
						}
					}
					this.resizeHandle.hide();
					var propertyGridPanel = this.formDesign.propertyGridPanel;
					var firstSelected = this.canvas.data("first-selected");
					if (firstSelected) {
						var allRows = $(propertyGridPanel)
								.propertygrid("getRows");
						// $(propertyGridPanel).propertygrid('acceptChanges')
						for (var i = 0; i < allRows.length; i++) {
							$(propertyGridPanel).propertygrid('endEdit', i)
						}
						var rows = $(propertyGridPanel)
								.propertygrid('getChanges');
						/*
						 * for(var i=0;i<rows.length;i++){ if
						 * (rows[i].editor&&rows[i].editor.type=="checkbox"){
						 * rows[i].value=Boolean(rows[i].value); } }
						 */

						var controlItem = firstSelected.data("formControl");
						if (controlItem) {
							controlItem.setControlAttrs(rows);
						}
						// s += rows[i].name + ':' + rows[i].value + ',';
					}
					$(propertyGridPanel).propertygrid('loadData', {
								rows : []
							})
					this.canvas.data("first-selected", null);
					/*
					 * if (control){ control.unselect(); }else{ var
					 * selecteds=this.getSelected(); for(var i=0;i<selecteds.length;i++){
					 * var controlItem=$(selecteds[i]).data("formControl");
					 * controlItem.unselect(); } } var
					 * firstSelected=this.canvas.data("first-selected"); if
					 * (firstSelected){ //var
					 * rows=$(propertyGridPanel).propertygrid("getRows"); var
					 * rows = $(propertyGridPanel).propertygrid('getChanges');
					 * var controlItem=firstSelected.data("formControl");
					 * controlItem.setControlAttrs(rows); // s += rows[i].name +
					 * ':' + rows[i].value + ','; }
					 * $(propertyGridPanel).propertygrid('loadData', { rows : [] })
					 * this.canvas.data("first-selected",null);
					 * 
					 * this.resizeHandle.hide();
					 */
				},
				select : function(control) {

					this.unselect();

					var el = control.getEl();
					var eloffset = el.offset();
					var elpos = el.position();

					var pos = this.getPosition(eloffset);
					// console.log(el.position(this.canvas));
					// console.log(el.offset());
					// var pos=el.position();
					this.resizeHandle.show();
					var cc = [[{
								left : elpos.left,
								top : elpos.top
							}, {
								width : el.outerWidth(),
								height : el.outerHeight()
							}, control]]
					this.resizeHandle.data("selected", cc);

					this.resizeHandle.css({
								top : pos.top,
								left : pos.left,
								width : el.outerWidth(),
								height : el.outerHeight()
							});
					$(".xui-advresizer-line", this.resizeHandle).css({
								width : el.outerWidth() - 2,
								height : el.outerHeight() - 2
							})

					var propertyGridPanel = this.formDesign.propertyGridPanel;
					$(propertyGridPanel).propertygrid('loadData', {
								rows : control.getControlAttrs()
							});
					if (!this.getSelected().length) {
						this.canvas.data("first-selected")
								&& this.canvas.data("first-selected")
										.removeClass("ui-selected-first");
						this.canvas.data("first-selected", control.getEl()
										.addClass("ui-selected-first"));
					}
					control.select();
					/*
					 * var propertyGridPanel =
					 * this.formDesign.propertyGridPanel; //if (!this.selected) {
					 * //this.selected = control; //} else { this.unselect();
					 * //this.selected.unselect(); // } // this.selected =
					 * control; if (!this.getSelected().length) {
					 * this.canvas.data("first-selected") &&
					 * this.canvas.data("first-selected")
					 * .removeClass("ui-selected-first");
					 * this.canvas.data("first-selected", control.getEl()
					 * .addClass("ui-selected-first")); } control.select();
					 * 
					 * $(propertyGridPanel).propertygrid('loadData', { rows :
					 * control.getControlAttrs() }); var el=control.getEl(); var
					 * pos=el.position(); this.resizeHandle.show();
					 * this.resizeHandle.css({top:pos.top,left:pos.left,width:el.outerWidth(),height:el.outerHeight()});
					 * return $(this).addClass("ui-selected")
					 */
				},
				creatConnectors : function(dragObj) {
					var j = [], _self = this;
					$(".ui-draggable", $(".desing-panel")).each(function() {
						var aM = $(this).offset();
						var aL = $(this).data("connectors");
						if (true || !aL) {
							aL = _self.getConnectorPos(this);
							$(this).data("connectors", aL);
						}
						var connectorEl = $(this).data("connector");
						if (!connectorEl) {
							connectorEl = $('<p class="jp-connector jp-ruler-element"></p>')
									.appendTo($(dragObj).parent());
							$(this).data("connector", connectorEl);
							$(this)
									.data(
											"connector2",
											$('<p class="jp-connector jp-ruler-element"></p>')
													.appendTo($(dragObj)
															.parent()))
						}
						connectorEl.offset({
									left : aL[1] - 3,
									top : aL[4] - 3
								});
						if (this != dragObj) {
							j.push(aL)
						} else {
							$(dragObj).data("sibling-connectors", j)
						}
					});
				},
				drawLine : function(j, aM, aL, aK, aP) {
					var _self = this;
					$(".jp-ruler-element").css("display", "none");
					var aJ = false;
					var aO = false;
					var aN = [];
					$.each(aM, function() {
						var aQ = this;
						$.each(aK, function(aR, aT) {
									var aS = j[aT], aU = aT;
									$.each([4, 5, 3], function(aW, aY) {
												var aV = aQ[aY];
												if (aV - 2 <= aS
														&& aS <= aV + 2) {
													aP(j, aV, 3, aU);
													var a0 = _self.getLinePos(
															j, aQ, aU - 3, aY
																	- 3, 0);
													var aZ = a0[0], aX = a0[1];
													aN.push({
																name : "h",
																from : [j[8],
																		aZ, aU],
																to : [aQ[8],
																		aX, aY]
															});
													aO = true;
													return !aO
												}
											});
									return !aO
								});
						$.each(aL, function(aS, aT) {
							var aR = j[aT], aU = aT;
							$.each([1, 2, 0], function(aW, aX) {
								var aV = aQ[aX];
								if (aV - 2 <= aR && aR <= aV + 2) {
									aP(j, aV, 0, aU);
									var a0 = _self.getLinePos(j, aQ, aU, aX, 3);
									var aZ = a0[0], aY = a0[1];
									aN.push({
												name : "v",
												from : [j[8], aU, aZ],
												to : [aQ[8], aX, aY]
											});
									aJ = true;
									return !aJ
								}
							});
							return !aJ
						});
						return !(aO && aJ)
					});
					return aN;
				},
				getLinePos : function(aP, aN, aT, aS, aJ) {
					var aL = Number.MAX_VALUE, aW = [];
					var aK = (aT == 1) ? aJ + 1 : aJ;
					var j = (aS == 1) ? aJ + 1 : aJ;
					var aR = (aT == 1) ? aK + 1 : aJ + 3;
					var aQ = (aS == 1) ? j + 1 : aJ + 3;
					for (var aO = aK; aO < aR; aO++) {
						var aV = aP[aO];
						for (var aM = j; aM < aQ; aM++) {
							var aU = aN[aM];
							if (Math.abs(aU - aV) < aL) {
								aW[0] = aO;
								aW[1] = aM;
								aL = Math.abs(aU - aV)
							}
						}
					}
					return aW
				},
				showConnectors : function(formControlEl, aJ) {
					var j = this.getConnectorPos(formControlEl);
					$.each(aJ, function(aO) {
								var aM = j[this.from[1]];
								var aP = j[this.from[2]];
								$(formControlEl).data(aO
										? "connector2"
										: "connector").css("display", "block")
										.offset({
													left : aM - 3,
													top : aP - 3
												});
								var aQ = this.to[0].data("connectors");
								var aL = aQ[this.to[1]];
								var aN = aQ[this.to[2]];
								this.to[0].data("connector").css("display",
										"block").offset({
											left : aL - 3,
											top : aN - 3
										});
								if (this.name == "h") {
									$(".jp-h-ruler").css({
												width : Math.abs(aM - aL),
												display : "block"
											}).offset({
												left : Math.min(aM, aL),
												top : aN
											})
								} else {
									$(".jp-v-ruler").css({
												height : Math.abs(aP - aN),
												display : "block"
											}).offset({
												left : aL,
												top : Math.min(aP, aN)
											})
								}
							})
				},
				getConnectorPos : function(formControlEl) {
					var offset = $(formControlEl).offset(), width = $(formControlEl)
							.outerWidth(), height = $(formControlEl)
							.outerHeight();
					// []
					return [offset.left, offset.left + Math.round(width / 2),
							offset.left + width, offset.top,
							offset.top + Math.round(height / 2),
							offset.top + height, width, height,
							$(formControlEl)];
				},
				getControlData : function() {
					var data = this.page.getAttrData();
					/*
					 * console.log(this.page); var
					 * components=$(".form-component",
					 * this.canvas),comp,control,data=[]; if
					 * (components.length>0){
					 * 
					 * for(var i=0;i<components.length;i++){
					 * comp=components[i]; control=$(comp).data("formControl");
					 * if (control!=null){ var
					 * controlCfg=$.extend({},control.getAttrData(),{type:control.type});
					 * data.push(controlCfg); } } }
					 */
					return data;
				},
				createControl : function(controlCfg) {
					if (!controlCfg.type) {
						controlCfg.type = TextFieldControl;
					}
					var controlType;
					if (typeof controlCfg.type == "string") {
						controlType = ControlReg[controlCfg.type];
						if (!controlType) {
							console.log(controlCfg.type + "找不到对应控制类型")
							return;
						}
					} else {
						controlType = controlCfg.type;
					}
					if (!controlType) {
						return;
					}
					var control = new controlType(controlCfg);

					return control;
				},
				loadControlData : function(pageData) {
					var _self = this;
					var addItems = function(parentControl, items) {
						for (var i = 0; i < items.length; i++) {
							var child = items[i].items
							delete items[i].items;
							items[i]["autoCtreateTab"] = false;
							if (items[i].action) {
								items[i].url = items[i].action;
							}
							var control = _self.createControl(items[i]);

							parentControl.addItem(control);
							if (items[i].forPanel){
								delete items[i].forPanel;
							}
							control.setControlAttrs(items[i]);
							if (child) {
								addItems(control, child);
							}
						}
					};
					if (pageData.type == "page") {
						var items = pageData.items;
						delete pageData.items;
						var page = this.createControl(pageData);
						/*
						 * if (_self.page.get("js")!=null){
						 * page.setControlAttrs({js:_self.page.get("js"),jsId:_self.page.get("jsId"),onPageLoad:_self.page.get("onPageLoad")}); }
						 */
						this.initPage(page);
						addItems(page, items);
					}

				},
				getHeight : function() {
					return this.canvas.outerHeight();
				},
				getWidth : function() {
					return this.canvas.outerWidth();
				}

			});
			/**
			 * 表单工具箱
			 */
			FormToolBox = Widget.extend({
				panels : [],
				attrs : {
					toolBoxConfig : null
				},
				propsInAttrs : ['formDesign', 'element'],
				initialize : function(options) {
					FormToolBox.superclass.initialize.call(this, options);
					// this.element.append()
					// this.addToolTab("表单控件");
					this.initToolBox();
					$(this.element).accordion({fit:true});

					$(".toolbox-item", $(this.element)).draggable({
								cancel : "a.ui-icon", // clicking an icon
								// won't initiate
								// dragging
								appendTo : "body",
								revert : "invalid", // when not dropped, the
								// item will revert back to
								// its initial position
								containment : "document",
								helper : "clone",
								position : 'fixed',
								cursor : "move"
							});
					// this.loadBusiControl();
					// this.addToolItem(0,new
					// FormControl({text:'文本框',cls:'toolbox-item-text'}));
				},
				initToolBox : function() {
					var data = {
						selected : 0,
						tabs : [{

									title : '容器控件',
									groups : [{
												text : "面板控件",
												cls : 'toolbox-item-panel',
												type : PanelControl
											}, {
												text : "表单面板",
												cls : 'toolbox-item-panel',
												type : FormPanelControl
											}, {
												text : "标签页控件",
												cls : 'toolbox-item-tabpanel',
												type : TabControl
											}]
								}, {

									title : '业务控件',
									groups : [/*
												 * { text : "NO.",
												 * data:{id:'fno',type:'textfield',fieldType:'number',labelWidth:80,labelText:"NO."}
												 * },{ text : "票据种类",
												 * data:{id:'fbillId',type:'combobox',labelWidth:80,labelText:"票据种类"}
												 * },{ text : "票据代码",
												 * data:{id:'fbillBatchCode',type:'combobox',labelWidth:80,labelText:"票据代码"}
												 * },{ text : "缴款人",
												 * data:{id:'fpayerName',type:'textfield',labelWidth:80,labelText:"缴款人"}
												 * },{ text : "开票开始日期",
												 * data:{id:'fdate1',type:'textfield',labelWidth:80,labelText:"开票开始日期"}
												 * },{ text : "开票结束日期",
												 * data:{id:'fdate2',type:'textfield',fieldType:'datetime',labelWidth:80,labelText:"开票结束日期"}
												 * },{ text : "开始票号",
												 * data:{id:'fbillNo1',type:'textfield',fieldType:'datetime',labelWidth:80,labelText:"开始票号"}
												 * },{ text : "结束票号",
												 * data:{id:'fbillNo2',type:'textfield',fieldType:'number',labelWidth:80,labelText:"结束票号"}
												 * },{ text : "备注",
												 * data:{id:'fmemo',type:'textfield',labelWidth:80,labelText:"备注"}
												 * },{ text : "收费明细",
												 * data:{id:'fmemo',type:'grid',columns:[{title:'项目编码',field:'column1',width:100},{title:'项目名称',field:'column2',width:200},{title:'计量单位',field:'column3',width:200},{title:'数量',field:'column4',width:200},{title:'标准',field:'column5',width:200},{title:'金额',field:'column6',width:200}]}
												 * },{ text : "作费明细",
												 * data:{id:'fmemo',type:'grid',columns:[{title:'作废数',field:'column1',width:100},{title:'起始号',field:'column2',width:200},{title:'终止号',field:'column3',width:200}]} }
												 */
									]
								}, {
									title : '表单编辑',
									groups : [{
												text : "查询控件",
												cls : 'toolbox-item-panel',
												type : QueryControl
											}, {
												text : "普通按钮",
												cls : 'toolbox-item-button',
												type : ButtonControl
											}, {
												text : "下拉按钮",
												cls : 'toolbox-item-buttonmenu',
												type : MenuButtonControl
											}, {
												text : "文字标签",
												cls : 'toolbox-item-label ',
												type : LabelControl
											}, {
												text : "文本框",
												cls : 'toolbox-item-text',
												type : TextFieldControl
											}, {
												text : "数字文本框",
												cls : 'toolbox-item-text',
												type : NumberFieldControl
											}, {
												text : "金钱文本框",
												cls : 'toolbox-item-text',
												type : MoneyFieldControl
											}, {
												text : "日期文本框",
												cls : 'toolbox-item-text',
												type : DateTimeFieldControl
											}, {
												text : "下拉框",
												cls : 'toolbox-item-combobox',
												type : ComboBoxControl
											}, {
												text : "下拉树",
												cls : 'toolbox-item-combobox',
												type : ComboZtreeControl
											}, {
												text : "下拉网格",
												cls : 'toolbox-item-combobox',
												type : ComboGridControl
											}, {
												text : "下拉弹出窗口",
												cls : 'toolbox-item-combobox',
												type : ComboGridControl
											}

											, {
												text : "复选框",
												cls : 'toolbox-item-checkbox',
												type : CheckBoxControl
											}, {
												text : "单选框",
												cls : '	toolbox-item-radio',
												type : RadioControl
											}

											, {
												text : "网格",
												cls : 'toolbox-item-grid',
												type : GridControl
											}, {
												text : "Jquery网格",
												cls : 'toolbox-item-grid',
												type : GridControl
											}, {
												text : "树控件",
												cls : 'toolbox-item-tree',
												type : TreeControl
											}

									]
								}]
					};
					for (var i = 0; i < data.tabs.length; i++) {
						var panel = $('<div  style="" title="'
								+ data.tabs[i].title + '"></div>');
						var groups = data.tabs[i].groups;
						for (var j = 0; j < groups.length; j++) {
							var boxItem = $('<div class="toolbox-item"><span class='
									+ groups[j].cls
									+ '></span><span class="itemcaption">'
									+ groups[j].text + '</span><div>');
							// boxItem.data("type", groups[j].type);
							var controlData = {};
							if (groups[j].data) {
								controlData = groups[j].data
							} else {
								controlData["type"] = groups[j].type;
							}
							// if (groups[j].type){

							boxItem.data("controlData", controlData);
							// }
							panel.append(boxItem);
						}
						$(this.element).append(panel);

					}

				},
				addToolItem : function(index, groups) {
					var panel = this.getGroupTabPanel(index);
					for (var j = 0; j < groups.length; j++) {
						var boxItem = $('<div class="toolbox-item"><span class='
								+ groups[j].cls
								+ '></span><span class="itemcaption">'
								+ groups[j].text + '</span><div>');
						// boxItem.data("type", groups[j].type);
						var controlData = {};
						if (groups[j].data) {
							controlData = groups[j].data
						} else {
							controlData["type"] = groups[j].type;
						}
						// if (groups[j].type){

						boxItem.data("controlData", controlData);
						// }
						panel.append(boxItem);
					}
					$(".toolbox-item", panel).draggable({
								cancel : "a.ui-icon", // clicking an icon
								// won't initiate
								// dragging
								appendTo : "body",
								revert : "invalid", // when not dropped, the
								// item will revert back to
								// its initial position
								containment : "document",
								helper : "clone",
								position : 'fixed',
								cursor : "move"
							});
				},
				getGroupTabPanel : function(index) {
					var panels = $(this.element).accordion("panels"), panel;
					return panels[index - 1];
				},
				addToolTab : function(title) {
					var panel = $('<div title="' + title + '"></div>');
					$(this.element).append(panel);
					return panel;
				}
					/*
					 * addToolItem : function(tabIndex, toolItem) { var panels =
					 * $(this.element).accordion("panels"), panel; if (panels) {
					 * panel = panels[tabIndex]; } if (panels && toolItem) { var
					 * body = panel.panel("body"); body.append(toolItem.getEl()) } },
					 */

			});

			FormDesign = Widget.extend({
				attrs : {
					toolBoxConfig : null,
					verifyControl : {}
				},
				initialize : function(options) {
					if (!options) {
						options = {};
					}
					if (!options.element) {
						alert('');
					}
					FormDesign.superclass.initialize.call(this, options);

					var formDesignCanvas, _self = this, data = {
						selected : 0,
						tabs : [{
							title : '表单编辑',
							groups : [{
								title : '文件',
								dir : 'v',
								tools : [{
									type : 'toolbar',
									tools : [{
												name : 'new-page',

												iconCls : 'ico-new-page'
											}, {
												name : 'open-page',
												iconCls : 'ico-open-page',
												onClick : function() {
													$.openModalDialog({
														title : "加载模块",
														url : "<div class=\"dialog-content\">模版名称:<select id=\"_tmp_list\"></select> <button id=\"_openbutton\">加载</button></div>",
														mode : "node",
														width : 400,
														height : 200,
														afterShow : function() {
															var storage = window.localStorage;

															for (var i = 0; i < storage.length; i++) {

																$A("#_tmp_list")
																		.append($("<option value=\""
																				+ storage
																						.key(i)
																				+ "\">"
																				+ storage
																						.key(i)
																				+ "</option>"))
															}

															$A("#_openbutton")
																	.click(
																			function() {

																				var temName = $A("#_tmp_list")
																						.val();
																				if (temName) {

																					var data = $
																							.parseJSON(localStorage
																									.getItem(temName));
																					_self.formDesignCanvas
																							.loadControlData(data);
																					/*
																					 * localStorage.setItem(temName,JSON
																					 * .stringify(formDesignCanvas.getControlData()))
																					 */
																				} else {
																					alert("请输入模版名称");
																				}
																			})
														}
													});

													// var
													// data=[{"id":"fromDesignId_1","height":"34","width":"185","left":493,"top":0,"labelWidth":"25","labelText":"NO"},{"id":"fromDesignId_2","height":34,"width":"240","left":1,"top":64,"labelWidth":"80","labelText":"票据类型"},{"id":"fromDesignId_3","height":34,"width":"240","left":247,"top":64,"labelWidth":"80","labelText":"开票时间"},{"id":"fromDesignId_4","value":"","height":"34","width":"185","left":495,"top":64,"labelWidth":"25","labelText":"至"},{"id":"fromDesignId_5","height":34,"width":"240","left":1,"top":101,"labelWidth":"80","labelText":"票据代码"},{"id":"fromDesignId_6","height":34,"width":"240","left":247,"top":101,"labelWidth":"80","labelText":"起止票号"},{"id":"fromDesignId_7","height":34,"width":"185","left":493,"top":101,"labelWidth":"25","labelText":"至"},{"id":"fromDesignId_8","height":34,"width":"240","left":1,"top":148,"labelWidth":"80","labelText":"缴款人"},{"id":"fromDesignId_9","height":34,"width":"431","left":247,"top":148,"labelWidth":"80","labelText":"备注"},{"id":"fromDesignId_10","height":55,"width":683,"left":1,"top":193}];
													/*
													 * var
													 * data=$.parseJSON(localStorage.getItem("fromData"));
													 * formDesignCanvas.loadControlData(data);
													 */
													// console.log(formDesignCanvas.getControlData());
												}
											}, {
												name : 'save-page',
												iconCls : 'ico-save-page',
												onClick : function() {
													_self.saveTemplate();
													return;

												}
											}, {
												name : 'print-page',
												iconCls : 'ico-print-page'
											}]
								}, {
									type : 'toolbar',
									tools : [{
										name : 'item-preview',

										iconCls : 'ico-item-preview',
										onClick : function() {

											var page = _self.formDesignCanvas
													.getPage();
											var width = page.get("width"), height = page
													.get("height")
													+ 80;

											var data = _self.formDesignCanvas
													.getControlData();
											// console.log(data)
											var formDesignConverter = new FormDesignConverter(
													{
														controlData : data
													});

											
											
											var htmlStr = "";
									
										
										var layout={"border":"app-layout","vbox":"app-vboxLayout","hbox":"app-hboxLayout"}
										if (data.layout!=""){
											htmlStr="<div style=\"width:100%;height:100%\" class=\""+layout[data.layout]+"\" >";
										}else{
											tmlStr="<div style=\"position: absolute;height:"+data.height+"px;width:"+data.width+"px\">";
										}
											htmlStr=htmlStr+formDesignConverter.controlToHtml(null, data);
											htmlStr=htmlStr+"</div>";
											$.openModalDialog({
												title : "预览",
												url : "<div class=\"dialog-content\">"
														+ htmlStr
														+ "</div>"
														+ "<div class=\"dialog-footer\"><div  class=\"btnarea btn-toolbar\" ><a id=\"_getDataBtn\">获取数据</a><a id=\"_loadDataBtn\">加载数据</a><a id=\"_viewBtn\">查看模式</a></div></div>",
												mode : "node",
												width : width,
												height : height
											});
											// ;
										}
									}]
								}]
							}, {
								title : '操作',
								dir : 'v',
								tools : [{
											type : 'toolbar',
											tools : [{
														name : 'bullets',
														iconCls : 'ico-item-copy'
													}, {
														name : 'numbers',
														iconCls : 'ico-item-cut'
													}, {
														name : 'bullets',
														iconCls : 'ico-item-paste',
														onClick : function() {
															alert('111')
														}
													}, {
														name : 'numbers',
														iconCls : 'ico-item-remove'
													}]
										}, {
											type : 'toolbar',
											tools : [{
														name : 'bullets',
														iconCls : 'ico-undo-page'
													}, {
														name : 'numbers',
														iconCls : 'ico-redo-page'
													}]
										}]
							}, {
								title : '编辑',
								dir : 'v',
								tools : [{
											type : 'toolbar',
											tools : [{
														name : 'new-page',

														iconCls : 'ico-item-label'
													}, {
														name : 'open-page',
														iconCls : 'ico-item-text'
													}, {
														name : 'save-page',
														iconCls : 'ico-item-bold'
													}, {
														name : 'print-page',
														iconCls : 'ico-item-italic'
													}, {
														name : 'print-page',
														iconCls : 'ico-item-underline'
													}]
										}, {
											type : 'toolbar',
											tools : [{
														name : 'new-page',

														iconCls : 'ico-item-editup'
													}, {
														name : 'open-page',
														iconCls : 'ico-item-editdown'
													}, {
														name : 'save-page',
														iconCls : 'ico-item-textcolor'
													}, {
														name : 'print-page',
														iconCls : 'ico-item-background'
													}, {
														type : 'menubutton',
														iconCls : 'ico-item-borderdraw',
														id : 'test1',
														menuItems : [{
															name : 'paste',
															text : 'Paste',
															iconCls : 'ico-item-border'
														}, {
															name : 'paste-special',
															text : 'Paste Special...',
															iconCls : 'ico-item-noneborder'
														}, {
															name : 'paste-special',
															text : 'Paste Special...',
															iconCls : 'ico-item-customborder'
														}]
													}]
										}]
							}]
						}]
					};
					$(this.element).css({
								width : '100%',
								height : '100%'
							});
					var layout = $('<div class="app-layout" style="width:100%;height:100%"></div>');
					var topPanel = $('<div region="north" data-options="border:false" border="false"  style="height:141px;"><div id="_designtool"></div></div>');
					layout.append(topPanel);

					// 加入画布
					var centerPanel = $('<div  region="center"></div>');
					var designCanvas = $('<div  class="form-desing-canvas"></div>');
					centerPanel.append(designCanvas);
					layout.append(centerPanel);

					// 加入 工具箱面板
					var toolBoxPanel = $('<div></div>');
					var westPanel = $('<div  region="west" title="工具箱" border="false" style="width:200px;"></div>');
					westPanel.append(toolBoxPanel);
					layout.append(westPanel);

					// 加入属性列表
					var eastPanel = $('<div class="app-layout" region="east"  title="视图属性"  split="true" style="width:320px"><div id="north_panel"  region="north" style="height:180px"></div><div id="center_panel"  region="center" style="overflow: hidden;"></div></div>');

					var propertyGridPanel = $('<div class="propertyGridPanel" fit="true" ></div>');
					var treePanel = $('<div class="treePanel" ></div>');
					$("#center_panel", eastPanel).append(propertyGridPanel);
					$("#north_panel", eastPanel).append(treePanel);
					layout.append(eastPanel);
					this.pageTree = treePanel.tree({
								lines : true
							});
					// propertyGridPanel.propertygrid();
					// <div id="__form-content" class="form-content"><div>
					// <div region="west" style="width:200px;"></div><div
					// region="center"></div>
					$(this.element).append(layout);
					layout.layout();
					eastPanel.layout();
					this.propertyGridPanel = propertyGridPanel.propertygrid({
								fit : true,
								showGroup : true,
								scrollbarSize : 0,
								columns : [[{
											field : 'name',
											title : '属性',
											width : 100,
											sortable : true
										}, {
											field : 'value',
											title : '值',
											width : 100,
											resizable : false
										}]]
							});
					this.propertyGridPanel.propertygrid("loadData", []);
					// toolbarPanel.accordion();
					layout.find("#_designtool").ribbon({
								data : data
							});
					this.formDesignCanvas = new FormDesignCanvas({
								formDesign : this,
								element : designCanvas
							});
					this.fromtoolBox = new FormToolBox({
								formDesign : this,
								element : toolBoxPanel,
								toolBoxConfig : this.get("toolBoxConfig")
							});
					DesignCanvasHelper.setDesignCanvas(this.formDesignCanvas);
					this.loadBusiControl();
				},
				loadBusiControl : function() {
					var toolBoxConfig=this.get("toolBoxConfig");
					var pageConfigData=this.get("pageConfigData");
					var _self = this;
					if (toolBoxConfig && toolBoxConfig.busiControlUrl) {

						AppAjax.ajaxCall({
							url : toolBoxConfig.busiControlUrl,
							data : toolBoxConfig.busiControlParam,
							dataType : 'json',
							type : 'POST',
							success : function(data) {
								if (data) {
									var compenents = data["compenents"];
									var pageXmlData = $.parseJSON(compenents);

									
									if (pageXmlData.Page.js) {
										require([pageXmlData.Page.js],
												function(jsObj) {

													var appJsObject = {
														"param" : "",
														"objs" : []
													};
													appJsObject["param"] = pageXmlData.Page.jsId;
													appJsObject["objs"]
															.push(jsObj);
													var converter = new XmlDataDesignConverter(
															{
																appJsObject : appJsObject
															});
													var busiControlCfg = converter
															.createBusiControls(pageXmlData);
													if (busiControlCfg
															&& busiControlCfg.busiControlsGroup) {
														_self.fromtoolBox
																.addToolItem(
																		2,
																		busiControlCfg.busiControlsGroup);
														var verifyControl = {};
														for (var i = 0; i < busiControlCfg.busiControlsGroup.length; i++) {
															var control = busiControlCfg.busiControlsGroup[i]["data"];
															if (control.id
																	&& control.isCustom == "false") {
																verifyControl[control.id] = control.id;

															}
														}
														// console.log(verifyControl);
														_self.set("verifyControl",verifyControl)
													}

													if (busiControlCfg
															&& busiControlCfg.control) {
														var pageData = $
																.extend(
																		true,
																		{},
																		busiControlCfg.control);
														// console.log(busiControlCfg.control);
														_self.formDesignCanvas
																.loadControlData(pageData)
													}
												});
									} else {
										var converter = new XmlDataDesignConverter();
										var converData = $.extend(true, {},
												pageXmlData);
										var busiControlCfg = converter
												.createBusiControls(converData);

										// var
										// groupToolItems=converter.createBusiControls(pageXmlData);
										if (busiControlCfg
												&& busiControlCfg.busiControlsGroup) {
											_self.fromtoolBox
													.addToolItem(
															2,
															busiControlCfg.busiControlsGroup);
											var verifyControl = {};
											for (var i = 0; i < busiControlCfg.busiControlsGroup.length; i++) {
												var control = busiControlCfg.busiControlsGroup[i]["data"];
												if (control.id
														&& control.isCustom == "false") {
													verifyControl[control.id] = control.id;

												}
											}
											// console.log(verifyControl);
											_self.set("verifyControl",
													verifyControl)
										}
										
										if (!pageConfigData){
												if (busiControlCfg
												&& busiControlCfg.control) {
											var pageData = $.extend(true, {},
													busiControlCfg.control);
											// console.log(busiControlCfg.control);
											_self.formDesignCanvas
													.loadControlData(pageData)
										}
									}else{
													_self.formDesignCanvas.loadControlData(pageConfigData);
										}
										
									}

									

								}

							}
						});
					}
				},
				validate : function() {
					var controls = this.formDesignCanvas.getAllControls();
					var verifyControl = this.get("verifyControl")
					for (var key in verifyControl) {
						if (!controls[key]) {
							return false;
						}

					}
					return true;
				},
				saveTemplate : function() {
					if (this.validate()) {

						var pageData = this.formDesignCanvas.getControlData();
						// console.log(data)
						var formDesignConverter = new FormDesignConverter();
						var htmlStr = formDesignConverter.controlToHtml(null,
								pageData);
						this.trigger('save', pageData, htmlStr);
					} else {
						alert("模版信息不全");
					}

				}
			});

			
			return FormDesign;
		});
