define(	["app/core/app-jquery", "app/core/app-core", "app/core/app-options",
				"jquery/jquery-ui", "app/widgets/app-widget"], function($, $A, Opts,
				resizable, Widget) {
			var timeout = null;
			$(window).unbind('.panel').bind('resize.panel', function() {
				// console.log('sdfsdf');
				if (timeout) {
					clearTimeout(timeout);
				}
				timeout = setTimeout(function() {
							var layout = $A('body.layout');
							// var layout = $('body.layout');
							if (layout.length) {
								layout.layout('resize');
							} else {
								var layouts = $A('.app-layout');
								var boxLayout = $A('.app-vboxLayout,.app-hboxLayout');
								if (layouts.length) {
									$A(layouts[0]).layout('resize');
								} else if (boxLayout.length) {
									boxLayout.triggerHandler('_resize');

								} else {
									$A('body>div.panel')
											.triggerHandler('_resize');
								}
							}
						}, 100);
			});

			var Panel = Widget.extend({
				initialize : function(el, options) {
					if (!options) {
						options = {};
					}
					Panel.superclass.initialize.call(this, options);

					var t = $(el);
					this.element=el;
					var opts = $.extend({}, Opts.appDefaults.Panel, Panel
									.parseOptions(el), options);
					$.data(el, "panel", {
								options : opts,
								panel : this.wrapPanel(el),
								isLoaded : false
							});

				},
				_init : function(target) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;

					if (opts.content) {
						$(this).html(opts.content);
						if ($.parser) {
							$.parser.parse(this);
						}
					}

					this.addEvents("onBeforeLoad","onLoad","onLoadError","onBeforeOpen","onOpen","onBeforeClose","onClose","onBeforeDestroy","onDestroy","BeforeCollapse","onCollapse","onBeforeExpand","onExpand","onResize","onMove","onMove","onMaximize","onRestore","onMinimize");
					this.addHeader(target);
					this.setBorder(target);
					// loadData(this);

					if (opts.doSize == true) {
						// panel.css('display', 'block');
						this._setSize(target);
					}
					if (opts.closed == true || opts.minimized == true) {
						panel.hide();
					} else {
						this._openPanel(target);
					}
				},
				panel : function(target) {
					
					var panel = $.data(target, 'panel').panel;
					return panel;
				},
				removeNode : function(node) {
					node.each(function() {
								$(this).remove();
								if ($.browser.msie) {
									this.outerHTML = '';
								}
							});
				},

				_setSize : function(target, param) {

					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;
					var pheader = panel.find('>div.panel-header');
					var pbody = panel.find('>div.panel-body');

					if (param) {
						if (param.width)
							opts.width = param.width;
						if (param.height)
							opts.height = param.height;
						if (param.left != null)
							opts.left = param.left;
						if (param.top != null)
							opts.top = param.top;
					}

					if (opts.fit == true) {
						var p = panel.parent();
						opts.width = p.width();
						opts.height = p.height();
					}

					panel.css({
								left : opts.left,
								top : opts.top
							});
					panel.css(opts.style);
					panel.addClass(opts.cls);
					pheader.addClass(opts.headerCls);
					pbody.addClass(opts.bodyCls);
					if (!isNaN(opts.width)) {
						panel.outerWidth(opts.width);
						/*
						 * if ($.boxModel == true){ panel.width(opts.width -
						 * (panel.outerWidth() - panel.width()));
						 * console.log(panel.width())
						 * pheader.width(panel.width() - (pheader.outerWidth() -
						 * pheader.width())); pbody.width(panel.width() -
						 * (pbody.outerWidth() - pbody.width())); } else {
						 * panel.width(opts.width);
						 * pheader.width(panel.width());
						 * pbody.width(panel.width()); }
						 */
					} else {
						panel.width('auto');
						pbody.width('auto');
					}
					// console.log(panel.width())
					pheader.add(pbody)._outerWidth(panel.width());

					if (!isNaN(opts.height)) {
						// var height = opts.height -
						// (panel.outerHeight()-panel.height()) -
						// pheader.outerHeight();
						// if ($.boxModel == true){
						// height -= pbody.outerHeight() - pbody.height();
						// }
						// pbody.height(height);

						panel.outerHeight(opts.height);
						pbody.outerHeight(panel.outerHeight()
								- pheader.outerHeight());
						/*
						 * if ($.boxModel == true){ panel.height(opts.height -
						 * (panel.outerHeight() - panel.height()));
						 * pbody.height(panel.height() - pheader.outerHeight() -
						 * (pbody.outerHeight() - pbody.height())); } else {
						 * panel.height(opts.height);
						 * pbody.height(panel.height() - pheader.outerHeight()); }
						 */
					} else {
						pbody.height('auto');

					}
					panel.css('height', "");
					this.trigger("onResize",opts.width, opts.height)
					//opts..apply(target, [opts.width, opts.height]);
					// panel.find('>div.panel-body>div').triggerHandler('_resize');
					$(target).panel("doLayout");
				},

				_movePanel : function(target, param) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;
					if (param) {
						if (param.left != null)
							opts.left = param.left;
						if (param.top != null)
							opts.top = param.top;
					}
					panel.css({
								left : opts.left,
								top : opts.top
							});
					opts.onMove.apply(target, [opts.left, opts.top]);
				},

				wrapPanel : function(target) {
					var panel = $(target).addClass('panel-body').css({
								margin : 0
							}).wrap('<div class="panel"></div>').parent();
					var _self = this;
					panel.bind('_resize', function() {
								var opts = $.data(target, 'panel').options;
								if (opts.fit == true) {
									_self._setSize(target);
								}
								return false;
							});

					return panel;
				},

				addHeader : function(target) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;
					var _self = this;
					this.removeNode(panel.find('>div.panel-header'));

					if (opts.title && !opts.noheader) {
						var header = $('<div class="panel-header"><div class="panel-title">'
								+ opts.title + '</div></div>').prependTo(panel);
						if (opts.iconCls) {
							header.find('.panel-title')
									.addClass('panel-with-icon');
							$('<div class="panel-icon"></div>')
									.addClass(opts.iconCls).appendTo(header);
						}
						var tool = $('<div class="panel-tool"></div>')
								.appendTo(header);
						if (opts.closable) {
							$('<a class="panel-tool-close"></a>')
									.appendTo(tool).bind('click', function(){
										
										_self.trigger("onClose",target)
									});
						}
						if (opts.maximizable) {
							$('<a class="panel-tool-max"></a>')
									.appendTo(tool).bind('click', function(){
										
										_self.trigger("onMax",target)
									} );
						}
						if (opts.minimizable) {
							$('<a class="panel-tool-min"></a>')
									.appendTo(tool).bind('click',  function(){
										
										_self.trigger("onMin",target)
									} );
						}
						if (opts.collapsible) {
							$('<a class="panel-tool-collapse"></a>')
									.appendTo(tool).bind('click', function(){
										
										onToggle($(this));
										_self.trigger("onToggle",target)
									} );
						}
						if (opts.tools) {
							if (typeof opts.tools == "string") {
								$(opts.tools).children().each(function() {
									$(this).addClass($(this).attr("iconCls"))
											.addClass("panel-tool-a")
											.appendTo(tool);
								});
							} else {
								for (var i = 0; i < opts.tools.length; i++) {
									var t = $("<a href=\"javascript:void(0)\"></a>")
											.addClass(opts.tools[i].iconCls)
											.appendTo(tool);
									if (opts.tools[i].handler) {
										t.bind("click",
												eval(opts.tools[i].handler));
									}
								}
							}

							/*
							 * for(var i=opts.tools.length-1; i>=0; i--){ var t =
							 * $('<div></div>').addClass(opts.tools[i].iconCls).appendTo(tool);
							 * if (opts.tools[i].handler){ t.bind('click',
							 * eval(opts.tools[i].handler)); } }
							 */
						}
						tool.find('div').hover(function() {
									$(this).addClass('panel-tool-over');
								}, function() {
									$(this).removeClass('panel-tool-over');
								});
						panel.find('>div.panel-body')
								.removeClass('panel-body-noheader');
					} else {
						panel.find('>div.panel-body')
								.addClass('panel-body-noheader');
					};

					function onToggle(toggleTarget) {
						if (toggleTarget.hasClass('panel-tool-expand')) {
							_self._expandPanel(target, false);
						} else {
							_self._collapsePanel(target, false);
						}
						return false;
					};

					function onMin() {
						_self._minimizePanel(target);
						return false;
					};

					function onMax() {
						if ($(this).hasClass('panel-tool-restore')) {
							_self._restorePanel(target);
						} else {
							_self._maximizePanel(target);
						}
						return false;
					};

					function onClose() {
						_self._closePanel(target);
						return false;
					};
				},

				/**
				 * load content from remote site if the href attribute is
				 * defined
				 */
				loadData : function(target) {

					var panel = $.data(target, "panel");
					var opts = panel.options;
					var me=this;
					if (opts.href) {
						if (!panel.isLoaded || !opts.cache) {
							
						
							if (this.trigger("onBeforeLoad",target) == false) {
								return;
							}
							panel.isLoaded = false;
							destroyContent(target);
							if (opts.loadingMessage) {
								$(target)
										.html($("<div class=\"panel-loading\"></div>")
												.html(opts.loadingMessage));
							}
							$.ajax({
										url : opts.href,
										cache : false,
										dataType : "html",
										success : function(data, textStatus) {
											setHtml(opts.extractor.call(target,
													data));
											me.trigger("onLoad",target,arguments) 
											
											panel.isLoaded = true;
										}
									});
						}
					} else {
						if (opts.content) {
							if (!panel.isLoaded) {
								destroyContent(target);
								setHtml(opts.content);
								panel.isLoaded = true;
							}
						}
					}
					function setHtml(html) {
						$(target).html(html);
						if ($.parser) {
							$.parser.parse($(target));
						}
					};
					/*
					 * var state = $.data(target, 'panel'); if
					 * (state.options.href && (!state.isLoaded ||
					 * !state.options.cache)){ state.isLoaded = false; var pbody =
					 * state.panel.find('>div.panel-body'); pbody.html($('<div
					 * class="panel-loading"></div>').html(state.options.loadingMessage));
					 * pbody.load(state.options.href, null, function(){ if
					 * ($.parser){ $.parser.parse(pbody); }
					 * state.options.onLoad.apply(target, arguments);
					 * state.isLoaded = true; }); }
					 */
				},

				destroyContent : function(target) {
					var t = $(target);
					t.find(".combo-f").each(function() {
								$(this).combo("destroy");
							});
					t.find(".m-btn").each(function() {
								$(this).menubutton("destroy");
							});
					t.find(".s-btn").each(function() {
								$(this).splitbutton("destroy");
							});
					// t.find(".tooltip-f").tooltip("destroy");
				},
				destroy : function(target, forceOpen) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;

					if (forceDestroy != true) {
						if (this.trigger("onBeforeDestroy",target) == false)
							return;
					}
					this.removeNode(panel);
				
					this.trigger("onDestroy",target)
				},
				_openPanel : function(target, forceOpen) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;

					if (forceOpen != true) {
						if (this.trigger("onBeforeOpen",target) == false)
							return;
					}

					panel.show();
					opts.closed = false;
					opts.minimized = false;
					var restore = panel.children("div.panel-header")
							.find("a.panel-tool-restore");
					if (restore.length) {
						opts.maximized = true;
					}
				
					this.trigger("onOpen",target)
					if (opts.maximized == true) {
						_maximizePanel(target);
						opts.maximized = false;
					}
					// if (opts.minimized == true) _minimizePanel(target);
					if (opts.collapsed == true) {
						opts.collapsed = false;
						this._collapsePanel(target);
					}
					if (!opts.collapsed) {
						this.loadData(target);
						this.doLayout(target);
					}
				},

				_closePanel : function(target, forceClose) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;

					if (forceClose != true) {
						if (this.trigger("onBeforeClose",target) == false)
							return;
					}
					panel.hide();
					opts.closed = true;
					//opts.onClose.call(target);

					this.trigger("onClose",target) 

				},

				_destroyPanel : function(target, forceDestroy) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;

					if (forceDestroy != true) {
						if (this.trigger("onBeforeDestroy",target)  == false)
							return;
					}
					this.removeNode(panel);
					this.trigger("onDestroy",target);
				},

				_collapsePanel : function(target, animate) {
					var _self=this;
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;
					var body = panel.find('>div.panel-body');
					var tool = panel
							.find('>div.panel-header .panel-tool-collapse');

					/*
					 * if (tool.hasClass('panel-tool-expand')) return;
					 */
					
					body.stop(true, true); // stop animation
					if (this.trigger("onBeforeCollapse",target) == false)
						return;

					tool.addClass('panel-tool-expand');
					if (animate == true) {
						body.slideUp('normal', function() {
						
									opts.collapsed = true;
									_self.trigger("onCollapse",target) 

								});
					} else {
						body.hide();
						opts.collapsed = true;
						_self.trigger("onCollapse",target) 

					}
				

				},

				_expandPanel : function(target, animate) {
					var _self=this;
					var opts = $.data(target, "panel").options;
					var panel = $.data(target, "panel").panel;
					var body = panel.children("div.panel-body");
					var _self = this;
					var header = panel.children("div.panel-header")
							.find("a.panel-tool-collapse");
					if (opts.collapsed == false) {
						return;
					}
					body.stop(true, true);
					if (this.trigger("onBeforeExpand",target) == false) {
						return;
					}
					header.removeClass("panel-tool-expand");
					if (animate == true) {
						body.slideDown("normal", function() {
									opts.collapsed = false;
								
									_self.trigger("onExpand",target)
								
									_self.loadData(target);
									_self.doLayout(target);

								});
					} else {
						body.show();
						
						opts.collapsed = false;
						_self.trigger("onExpand",target)
						_self.loadData(target);
						_self.doLayout(target);

					}

				
					/*
					 * var opts = $.data(target, 'panel').options; var panel =
					 * $.data(target, 'panel').panel; var body =
					 * panel.find('>div.panel-body'); var tool =
					 * panel.find('>div.panel-header .panel-tool-collapse');
					 * 
					 * if (!tool.hasClass('panel-tool-expand')) return;
					 * 
					 * body.stop(true, true); // stop animation if
					 * (opts.onBeforeExpand.call(target) == false) return;
					 * 
					 * tool.removeClass('panel-tool-expand'); if (animate ==
					 * true){ body.slideDown('normal', function(){
					 * opts.collapsed = false; opts.onExpand.call(target);
					 * loadData(target); }); } else { body.show();
					 * opts.collapsed = false; opts.onExpand.call(target);
					 * loadData(target); }
					 */
				},

				doLayout : function(target) {
					var $body = $(target).panel("body");
					var h = $body.height();
					var w = $body.width();

					if ($body.data("layoutObj")) {
						$body.layout("resize");
					}
					if ($body.data("HBoxLayout") || $body.data("VBoxLayout")) {
						$body.triggerHandler('_resize');

					} else {
						$body
								.children("div.panel:visible,div.app-grid:visible,div.accordion:visible,div.tabs-container:visible,div.layout:visible,div.xquery:visible,div.grid-container:visible,div.ztree-container:visible,div.app-vboxLayout:visible,div.app-hboxLayout:visible,div.datagrid:visible,div.tab-container:visible")
								.each(function() {
							
									$(this).triggerHandler("_resize",
											[true, w, h, $(target)]);
									
								});
					}
				},
				_maximizePanel : function(target) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;
					var tool = panel.find('>div.panel-header .panel-tool-max');

					if (tool.hasClass('panel-tool-restore'))
						return;

					tool.addClass('panel-tool-restore');

					$.data(target, 'panel').original = {
						width : opts.width,
						height : opts.height,
						left : opts.left,
						top : opts.top,
						fit : opts.fit
					};
					opts.left = 0;
					opts.top = 0;
					opts.fit = true;
					this._setSize(target);
					opts.minimized = false;
					opts.maximized = true;
					this.trigger("onMaximize",target,target)

				},

				_minimizePanel : function(target) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;
					panel.hide();
					opts.minimized = true;
					opts.maximized = false;
					//opts.onMinimize.call(target);
					this.trigger("onMinimize",target,target)
				},

				_restorePanel : function(target) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;
					var tool = panel.find('>div.panel-header .panel-tool-max');

					if (!tool.hasClass('panel-tool-restore'))
						return;

					panel.show();
					tool.removeClass('panel-tool-restore');
					var original = $.data(target, 'panel').original;
					opts.width = original.width;
					opts.height = original.height;
					opts.left = original.left;
					opts.top = original.top;
					opts.fit = original.fit;
					this._setSize(target);
					opts.minimized = false;
					opts.maximized = false;
					//opts.onRestore.call(target);
					this.trigger("onResize",target)
				},

				setBorder : function(target) {
					var opts = $.data(target, 'panel').options;
					var panel = $.data(target, 'panel').panel;
					var header = $(target).panel("header");
					var body = $(target).panel("body");
					panel.css(opts.style);
					panel.addClass(opts.cls);

					if (opts.border == true) {
						panel.find('>div.panel-header')
								.removeClass('panel-header-noborder');
						panel.find('>div.panel-body')
								.removeClass('panel-body-noborder');
					} else {
						panel.find('>div.panel-header')
								.addClass('panel-header-noborder');
						panel.find('>div.panel-body')
								.addClass('panel-body-noborder');
					}
					header.addClass(opts.headerCls);
					body.addClass(opts.bodyCls);
					if (opts.id) {
						$(target).attr("id", opts.id);
					} else {
						$(target).attr("id", "");
					}
				},
				setTitle : function(target, title) {
					$.data(target, 'panel').options.title = title;
					$(target).panel('header').find('div.panel-title')
							.html(title);
				},
				options : function(target) {
					return $.data(target, 'panel').options;
				},
				panel : function(target) {
					return $.data(target, 'panel').panel;
				},
				header : function(target) {
					return $.data(target, 'panel').panel
							.find('>div.panel-header');
				},
				body : function(target) {
					return $.data(target, 'panel').panel
							.find('>div.panel-body');
				},
				open : function(target, param) {
					var opts = this.options(target);
					this._openPanel(target, param);
					if (opts["layout"]) {
						opts["layout"].layout("resize");
					}
					$(".xquery",target).show();
				},
				close : function(target, param) {
					var opts = this.options(target);

					this._closePanel(target, param);
					if (opts["layout"]) {
						opts["layout"].layout("resize");
					}
					$(".xquery",target).hide();
				},
				destroy : function(target, param) {
					this._destroyPanel(target, param);
				},
				refresh : function(target, param) {
					$.data(target, 'panel').isLoaded = false;
					this.loadData(this);
				},
				resize : function(target, param) {
					this._setSize(target, param);
				},
				move : function(target, param) {
					this._movePanel(target, param);
				},
				hide : function(target, param) {
					this.close(target, param);

				},
				show : function(target, param) {
					this.open(target, param);

				},

				maximize : function(target, param) {
					this._maximizePanel(target, param);
				},
				minimize : function(target, param) {
					this._minimizePanel(target, param);
				},
				restore : function(target) {
					this._restorePanel(target);
				},
				collapse : function(target, param) {
					this._collapsePanel(target, param);
				},
				expand : function(target, param) {
					this._expandPanel(target, param);
				}
			});
			Panel.parseOptions = function(target) {
				var t = $(target);
				var padding = [];
				var margins = [];
				var options=t.parseOptions(target, ["id",
										"width", "height", "left", "top",
										"title", "iconCls", "cls", "headerCls",
										"bodyCls", "tools", "region", "href", {
											cache : "boolean",
											fit : "boolean",
											border : "boolean",
											noheader : "boolean"
										}, {
											collapsible : "boolean",
											minimizable : "boolean",
											maximizable : "boolean",
											width : "number",
											height : "number"
										}, {
											closable : "boolean",
											collapsed : "boolean",
											minimized : "boolean",
											maximized : "boolean",
											closed : "boolean"
										}])
				 options= $.extend(options,  {
							loadingMessage : (t.attr("loadingMessage") != undefined
									? t.attr("loadingMessage")
									: undefined)
						});

				if (options["width"] && options["width"] != "auto") {
					options["width"] = parseInt(options["width"]);
				}
				if (options["height"] && options["height"] != "auto") {
					options["height"] = parseInt(options["height"]);
				}
				return options;

			};
			$.fn.panel = function(options, param) {
			// console.log(arguments)
				var methodReturn;

				options = options || {};
				$set = this.each(function() {
							var $this = $(this);
							var state = $.data(this, 'panel');
							var data = $this.data('panelObj');
							if (state) {
								if (typeof options === 'object') {
									opts = $.extend(state.options, options);
								}
							} else {
								data = new Panel(this, options);
								$this.data('panelObj', data);
								data._init(this);
							}
							if (typeof options === 'string')
								methodReturn = data[options](this, param);
						});
				return (methodReturn === undefined) ? $set : methodReturn;
			};

			return Panel;
		});
