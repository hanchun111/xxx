/**
 * tabs页
 * @author sjq
 * 
 */
define([ "app/core/app-jquery", "app/core/app-core", "app/util/app-utils",
		"app/data/app-ajax", "app/widgets/app-widget","app/core/app-options",
		"app/widgets/button/app-menubutton","app/widgets/panel/app-panel"],
		function($, $A, $utils, ajax, Widget,Opt,button,panel) {

			var Tabs = Widget.extend({
				initialize : function(el, options) {
					if (!options) {
						options = {};
					}
					Tabs.superclass.initialize.call(this, options);

					var t = $(el);
					this.element=el;
					var opts = $.extend({}, Tabs.defaults, Tabs
									.parseOptions(el), options);
					$.data(el, "tabsObj", {
						options:opts,
						tabs: [],
						selectHis: []
							});
					this._init();
				},
			    _init:function(){
			    	this._wrapTabs();
			    	this._addTools();
			    	this._setProperties();
			    	this._setSize();
			    	this._bindEvents();
					this.addEvents("onLoad","onSelect","onBeforeClose","onUnselect","onClose","onAdd","onBeforeDestroy","onUpdate","onContextMenu");

			    	this._doFirstSelect();
			    }
			    ,options: function(){
					var cc = this.element;
					var opts = $.data(cc, 'tabsObj').options;
					var s =this._getSelectedTab();
					opts.selected = s ? this._getTabIndex(s) : -1;
					return opts;
				},
				tabs: function(){
					return $.data(this.element, 'tabsObj');
				},
				resize: function(param){
				
						this._setSize(param);
						this.setSelectedSize();
				
				},
				add: function(options){
					return this._addTab(options);
					
				},
				close: function(which){
					return this._closeTab(which);
					
				},
				getTab: function( which){
					return this._getTab(which);
					
				},
				getTabIndex: function(tab){
					return this._getTabIndex(tab);
				},
				getSelected: function(){
					return this._getSelectedTab();
				},
				select: function( which){
                    if($.type(which) === 'string'){
                        var container=this.element;
                        var tabs = $.data(container, 'tabsObj').tabs;
                        for(var i=0;i<tabs.length;i++){
                        	var $tab = tabs[i];
                            if($tab.attr('id')===which){
                                which = i;
                                break;
                            }
						}
                    }
					this._selectTab(which);
				},
				unselect: function(which){
					this._unselectTab(which);
					
				},
				exists: function( which){
					
					return this.exists(which);
				},
				update: function( options){
					return this._updateTab(options);
					
				},
				enableTab: function(which){
					var opts =  this.getTab(which).panel('options')
					opts.tab.removeClass('tabs-disabled');
					opts.disabled = false;
					
				},
				disableTab: function(which){
					var opts =  this.getTab(which).panel('options')
					opts.tab.addClass('tabs-disabled');
					opts.disabled = true;
				},
				showHeader: function(){
					
						this._showHeader(true);
					
				},
				hideHeader: function(){
					this._showHeader( false);
					
				},
				showTool: function(){
				
					this._showTool(true);
					
				},
				hideTool: function(jq){
					this._showTool(this, false);
				},
				scrollBy: function( deltaX){	// scroll the tab header by the specified amount of pixels
					var container=this.element;

						var opts =this.options();
						var wrap = $(container).find('>div.tabs-header>div.tabs-wrap');
						var pos = Math.min(wrap._scrollLeft() + deltaX, getMaxScrollWidth());
						wrap.animate({scrollLeft: pos}, opts.scrollDuration);
						
						function getMaxScrollWidth(){
							var w = 0;
							var ul = wrap.children('ul');
							ul.children('li').each(function(){
								w += $(this).outerWidth(true);
							});
							return w - wrap.width() + (ul.outerWidth() - ul.width());
						}
					
				},
				
				_showHeader:function(visible){
					var opts = $.data(this.element, 'tabsObj').options;
					opts.showHeader = visible;
					this.resize();
				},
				
				_showTool:function(visible){
					var tool = $(this.element).find('>.tabs-header>.tabs-tool');
					if (visible){
						tool.removeClass('tabs-tool-hidden').show();
					} else {
						tool.addClass('tabs-tool-hidden').hide();
					}
					this.resize();
					this.scrollBy(0)
					
				}, _getContentWidth:function(c){
					var w = 0;
					$(c).children().each(function(){
						w += $(this).outerWidth(true);
					});
					return w;
				},	/**
				 * set the tabs scrollers to show or not,
				 * dependent on the tabs count and width
				 */
				 _setScrollers:function() {
					var opts = $.data(this.element, 'tabsObj').options;
					if (opts.tabPosition == 'left' || opts.tabPosition == 'right' || !opts.showHeader){return}
					
					var header = $(this.element).children('div.tabs-header');
					var tool = header.children('div.tabs-tool:not(.tabs-tool-hidden)');
					var sLeft = header.children('div.tabs-scroller-left');
					var sRight = header.children('div.tabs-scroller-right');
					var wrap = header.children('div.tabs-wrap');
					
					// set the tool height
					var tHeight = header.outerHeight();
					if (opts.plain){
						tHeight -= tHeight - header.height();
					}
					tool._outerHeight(tHeight);
					
					var tabsWidth = this._getContentWidth(header.find('ul.tabs'));
					var cWidth = header.width() - tool._outerWidth();
					
					if (tabsWidth > cWidth) {
						sLeft.add(sRight).show()._outerHeight(tHeight);
						if (opts.toolPosition == 'left'){
							tool.css({
								left: sLeft.outerWidth(),
								right: ''
							});
							wrap.css({
								marginLeft: sLeft.outerWidth() + tool._outerWidth(),
								marginRight: sRight._outerWidth(),
								width: cWidth - sLeft.outerWidth() - sRight.outerWidth()
							});
						} else {
							tool.css({
								left: '',
								right: sRight.outerWidth()
							});
							wrap.css({
								marginLeft: sLeft.outerWidth(),
								marginRight: sRight.outerWidth() + tool._outerWidth(),
								width: cWidth - sLeft.outerWidth() - sRight.outerWidth()
							});
						}
					} else {
						sLeft.add(sRight).hide();
						if (opts.toolPosition == 'left'){
							tool.css({
								left: 0,
								right: ''
							});
							wrap.css({
								marginLeft: tool._outerWidth(),
								marginRight: 0,
								width: cWidth
							});
						} else {
							tool.css({
								left: '',
								right: 0
							});
							wrap.css({
								marginLeft: 0,
								marginRight: tool._outerWidth(),
								width: cWidth
							});
						}
					}
				},
				_addTools:function (){
					var opts = $.data(this.element, 'tabsObj').options;
					var header = $(this.element).children('div.tabs-header');
					if (opts.tools) {
						if (typeof opts.tools == 'string'){
							$(opts.tools).addClass('tabs-tool').appendTo(header);
							$(opts.tools).show();
						} else {
							header.children('div.tabs-tool').remove();
							var tools = $('<div class="tabs-tool"><table cellspacing="0" cellpadding="0" style="height:100%"><tr></tr></table></div>').appendTo(header);
							var tr = tools.find('tr');
							for(var i=0; i<opts.tools.length; i++){
								var td = $('<td></td>').appendTo(tr);
								if(opts.tools[i].children){
									var btn = $.extend(true, {}, opts.tools[i], {
										plain: true
									});
									var $btn = initMenuButtonHtml(btn);
									td.append($btn);
								}else{
									var tool = $('<a></a>').appendTo(td);
									tool[0].onclick = eval(opts.tools[i].handler || function(){});
									tool.button($.extend({}, opts.tools[i], {
										plain: true
									}));
								}
							}
						}
					} else {
						header.children('div.tabs-tool').remove();
					}
				},_setSize:function(param) {
					var state = $.data(this.element, 'tabsObj');
					var opts = state.options;
					var cc = $(this.element);
					
					if (!opts.doSize){return}
					if (param){
						$.extend(opts, {
							width: param.width,
							height: param.height
						});
					}
					cc._size(opts);

					var header = cc.children('div.tabs-header');
					var panels = cc.children('div.tabs-panels');
					var wrap = header.find('div.tabs-wrap');
					var ul = wrap.find('.tabs');
					ul.children('li').removeClass('tabs-first tabs-last');
					ul.children('li:first').addClass('tabs-first');
					ul.children('li:last').addClass('tabs-last');
					
					if (opts.tabPosition == 'left' || opts.tabPosition == 'right'){
						header._outerWidth(opts.showHeader ? opts.headerWidth : 0);
						panels._outerWidth(cc.width() - header.outerWidth());
						header.add(panels)._size('height', isNaN(parseInt(opts.height)) ? '' : cc.height());
						wrap._outerWidth(header.width());
						ul._outerWidth(wrap.width()).css('height','');
					} else {
						header.children('div.tabs-scroller-left,div.tabs-scroller-right,div.tabs-tool:not(.tabs-tool-hidden)').css('display', opts.showHeader?'block':'none');
						header._outerWidth(cc.width()).css('height','');
						if (opts.showHeader){
							header.css('background-color','');
							wrap.css('height','');
						} else {
							header.css('background-color','transparent');
							header._outerHeight(0);
							wrap._outerHeight(0);
						}
						ul._outerHeight(opts.tabHeight).css('width','');
						ul._outerHeight(ul.outerHeight()-ul.height()-1+opts.tabHeight).css('width','');
						
						panels._size('height', isNaN(parseInt(opts.height)) ? '' : (cc.height()-header.outerHeight()));
						panels._size('width', cc.width());
					}

					if (state.tabs.length){
						var d1 = ul.outerWidth(true) - ul.width();
						var li = ul.children('li:first');
						var d2 = li.outerWidth(true) - li.width();
						var hwidth = header.width() - header.children('.tabs-tool:not(.tabs-tool-hidden)')._outerWidth();
						var justifiedWidth = Math.floor((hwidth-d1-d2*state.tabs.length)/state.tabs.length);
						
						$.map(state.tabs, function(p){
							setTabSize(p, (opts.justified && $.inArray(opts.tabPosition,['top','bottom'])>=0) ? justifiedWidth : undefined);
						});
						if (opts.justified && $.inArray(opts.tabPosition,['top','bottom'])>=0){
							var deltaWidth = hwidth - d1 - this._getContentWidth(ul);
							setTabSize(state.tabs[state.tabs.length-1], justifiedWidth+deltaWidth);
						}
					}
					this._setScrollers();

					function setTabSize(p, width){
						var p_opts = p.panel('options');
						var p_t = p_opts.tab.find('a.tabs-inner');
						var width = width ? width : (parseInt(p_opts.tabWidth||opts.tabWidth||undefined));
						if (width){
							p_t._outerWidth(width);
						} else {
							p_t.css('width', '');
						}
						p_t._outerHeight(opts.tabHeight);
						p_t.css('lineHeight', p_t.height()+'px');
						p_t.find('.app-fluid:visible').triggerHandler('_resize');
					}
				},
				/**
				 * set selected tab panel size
				 */
				_setSelectedSize:function(){
					var opts = $.data(this.element, 'tabsObj').options;
					var tab = this._getSelectedTab();
					if (tab){
						var panels = $(this.element).children('div.tabs-panels');
						var width = opts.width=='auto' ? 'auto' : panels.width();
						var height = opts.height=='auto' ? 'auto' : panels.height();
						tab.panel('resize', {
							width: width,
							height: height
						});
					}
				},	/**
				 * wrap the tabs header and body
				 */
				_wrapTabs:function () {
					var tabs = $.data(this.element, 'tabsObj').tabs;
					var _self=this;
					var cc = $(this.element).addClass('tabs-container');
					var panels = $('<div class="tabs-panels"></div>').insertBefore(cc);
					cc.children('div').each(function(){
						panels[0].appendChild(this);
					});
					cc[0].appendChild(panels[0]);
					$('<div class="tabs-header">'
							+ '<div class="tabs-scroller-left"></div>'
							+ '<div class="tabs-scroller-right"></div>'
							+ '<div class="tabs-wrap">'
							+ '<ul class="tabs"></ul>'
							+ '</div>'
							+ '</div>').prependTo(this.element);
					
					cc.children('div.tabs-panels').children('div').each(function(i){
						var opts = $.extend({}, $(this).parseOptions(this), {
							disabled: ($(this).attr('disabled') ? true : undefined),
							selected: ($(this).attr('selected') ? true : undefined)
						});
						_self._createTab(opts, $(this));
					});
					
					cc.children('div.tabs-header').find('.tabs-scroller-left, .tabs-scroller-right').hover(
							function(){$(this).addClass('tabs-scroller-over');},
							function(){$(this).removeClass('tabs-scroller-over');}
					);
					var _self=this;
					cc.bind('_resize', function(e,force){
						if ($(this).hasClass('app-fluid') || force){
							_self._setSize();
							_self._setSelectedSize();
						}
						return false;
					});
				},_bindEvents:function(){
					var state = $.data(this.element, 'tabsObj')
					var opts = state.options;
					var _self=this;
					$(this.element).children('div.tabs-header').unbind().bind('click', function(e){
						if ($(e.target).hasClass('tabs-scroller-left')){
							$(_self.element).tabs('scrollBy', -opts.scrollIncrement);
						} else if ($(e.target).hasClass('tabs-scroller-right')){
							$(_self.element).tabs('scrollBy', opts.scrollIncrement);
						} else {
							var li = $(e.target).closest('li');
							if (li.hasClass('tabs-disabled')){return false;}
							var a = $(e.target).closest('a.tabs-close');
							if (a.length){
								_self._closeTab(getLiIndex(li));
							} else if (li.length){
//								selectTab(this.element, getLiIndex(li));
								var index = getLiIndex(li);
								var popts = state.tabs[index].panel('options');
								if (popts.collapsible){
									popts.closed ? _self._selectTab(index) : _self._unselectTab( index);
								} else {
									_self._selectTab(index);
								}
							}
							return false;
						}
					}).bind('contextmenu', function(e){
						var li = $(e.target).closest('li');
						if (li.hasClass('tabs-disabled')){return;}
						if (li.length){
							
							_self.trigger("onContextMenu",e, li.find('span.tabs-title').html(),getLiIndex(li))
							//opts.onContextMenu.call(_self.element, e, li.find('span.tabs-title').html(), getLiIndex(li));
						}
					});
					
					function getLiIndex(li){
						var index = 0;
						li.parent().children('li').each(function(i){
							if (li[0] == this){
								index = i;
								return false;
							}
						});
						return index;
					}
				}, _setProperties:function(){
					var opts = $.data(this.element, 'tabsObj').options;
					var header = $(this.element).children('div.tabs-header');
					var panels = $(this.element).children('div.tabs-panels');
					
					header.removeClass('tabs-header-top tabs-header-bottom tabs-header-left tabs-header-right');
					panels.removeClass('tabs-panels-top tabs-panels-bottom tabs-panels-left tabs-panels-right');
					if (opts.tabPosition == 'top'){
						header.insertBefore(panels);
					} else if (opts.tabPosition == 'bottom'){
						header.insertAfter(panels);
						header.addClass('tabs-header-bottom');
						panels.addClass('tabs-panels-top');
					} else if (opts.tabPosition == 'left'){
						header.addClass('tabs-header-left');
						panels.addClass('tabs-panels-right');
					} else if (opts.tabPosition == 'right'){
						header.addClass('tabs-header-right');
						panels.addClass('tabs-panels-left');
					}
					
					if (opts.plain == true) {
						header.addClass('tabs-header-plain');
					} else {
						header.removeClass('tabs-header-plain');
					}
					header.removeClass('tabs-header-narrow').addClass(opts.narrow?'tabs-header-narrow':'');
					var tabs = header.find('.tabs');
					tabs.removeClass('tabs-pill').addClass(opts.pill?'tabs-pill':'');
					tabs.removeClass('tabs-narrow').addClass(opts.narrow?'tabs-narrow':'');
					tabs.removeClass('tabs-justified').addClass(opts.justified?'tabs-justified':'');
					if (opts.border == true){
						header.removeClass('tabs-header-noborder');
						panels.removeClass('tabs-panels-noborder');
					} else {
						header.addClass('tabs-header-noborder');
						panels.addClass('tabs-panels-noborder');
					}
					opts.doSize = true;
				}, _createTab:function( options, pp) {
					options = options || {};
					var container=this.element;
					var state = $.data(container, 'tabsObj');
					var tabs = state.tabs;
					var _self=this;
					if (options.index == undefined || options.index > tabs.length){options.index = tabs.length}
					if (options.index < 0){options.index = 0}
					
					var ul = $(container).children('div.tabs-header').find('ul.tabs');
					var panels = $(container).children('div.tabs-panels');
					var tab = $(
							'<li>' +
							'<a href="javascript:void(0);" class="tabs-inner">' +
							'<span class="tabs-title"></span>' +
							'<span class="tabs-icon"></span>' +
							'</a>' +
							'</li>');
					if (!pp){pp = $('<div></div>');}
					if (options.index >= tabs.length){
						tab.appendTo(ul);
						pp.appendTo(panels);
						tabs.push(pp);
					} else {
						tab.insertBefore(ul.children('li:eq('+options.index+')'));
						pp.insertBefore(panels.children('div.panel:eq('+options.index+')'));
						tabs.splice(options.index, 0, pp);
					}

					// create panel
					pp.panel($.extend({}, options, {
						tab: tab,
						border: false,
						noheader: true,
						closed: true,
						doSize: false,
						iconCls: (options.icon ? options.icon : undefined),
						onLoad: function(){
							/*if (options.onLoad){
								options.onLoad.call(this, arguments);
							}*/
							_self.trigger("onLoad",container)
							//state.options.onLoad.call(container, $(this));
						},
						onBeforeOpen: function(target){
							
							if (_self.trigger("onBeforeOpen",container) == false){return false;};
							var p = _self.getSelected();
							var  tabIndex=_self.getTabIndex(p);
							var tabPanel=_self._getTab(tabIndex);
							_self.trigger("beforeSwitchTab", tabIndex,tabPanel);
							if (p){
								if (p[0] != this){
									
									_self.unselect(tabIndex);
									p = _self.getSelected();
									if (p){
										return false;
									}
								} else {
									_self._setSelectedSize();
									return false;
								}
							}
							
							var popts = $(target).panel('options');
							popts.tab.addClass('tabs-selected');
							// scroll the tab to center position if required.
							var wrap = $(container).find('>div.tabs-header>div.tabs-wrap');
							var left = popts.tab.position().left;
							var right = left + popts.tab.outerWidth();
							if (left < 0 || right > wrap.width()){
								var deltaX = left - (wrap.width()-popts.tab.width()) / 2;
								_self.scrollBy(deltaX);
							} else {
								_self.scrollBy(0);
							}
							
							var panel = $(target).panel('panel');
							panel.css('display','block');
							_self._setSelectedSize();
							panel.css('display','none');
						},
						onOpen: function(target){
							var popts = $(target).panel('options');
							var  tabIndex=_self.getTabIndex(pp);
							var tabPanel=_self._getTab(tabIndex);
							/*if (options.onOpen){
								//options.onOpen.call(this);
								
								_self.trigger("onOpen", popts.title, tabIndex,tabPanel);
							}
						*/
							_self.trigger("onOpen", popts.title, tabIndex,tabPanel);
							state.selectHis.push(popts.title);
							
							_self.trigger("onSelect", popts.title, tabIndex,tabPanel);
							_self.trigger("afterSwitchTab", popts.title, tabIndex,tabPanel);

							//state.options.onSelect.call(container, popts.title, _self.getTabIndex(this));
						},
						onBeforeClose: function(target){
							if (options.onBeforeClose){
								if (options.onBeforeClose.call(this) == false){return false;}
							}
							if (_self.trigger("onBeforeClose",container) == false){return false;};
							$(target).panel('options').tab.removeClass('tabs-selected');
						},
						onClose: function(target){
							var  tabIndex=_self.getTabIndex(pp);
							var tabPanel=_self._getTab(tabIndex);
							/*if (options.onClose){
								options.onClose.call(this);
							}*/
							_self.trigger("onClose",container);
							var popts = $(target).panel('options');
							_self.trigger("onUnselect", popts.title,tabIndex,tabPanel)

							//state.options.onUnselect.call(container, popts.title, _self.getTabIndex(this));
						}
					}));
					this.update({
						tab: pp,
						options: pp.panel('options'),
						type: 'header'
					})
					// only update the tab header
					//$(container).tabs('update', );
				},_addTab:function(options) {
					var container=this.element;
					var state = $.data(container, 'tabsObj');
					var opts = state.options;
					if (options.selected == undefined) options.selected = true;
					
					this._createTab( options);
					this.trigger("onAdd", options.title,options.index)
					//opts.onAdd.call(container, options.title, options.index);
					if (options.selected){
						this._selectTab(options.index);	// select the added tab panel
					}
				},/**
				 * update tab panel, param has following properties:
				 * tab: the tab panel to be updated
				 * options: the tab panel options
				 * type: the update type, possible values are: 'header','body','all'
				 */
				_updateTab:function ( param){
					var container=this.element;
					param.type = param.type || 'all';
					var selectHis = $.data(container, 'tabsObj').selectHis;
					var pp = param.tab;	// the tab panel
					var opts = pp.panel('options');	// get the tab panel options
					var oldTitle = opts.title;
					$.extend(opts, param.options, {
						iconCls: (param.options.icon ? param.options.icon : undefined)
					});

					if (param.type == 'all' || param.type == 'body'){
						pp.panel();
					}
					if (param.type == 'all' || param.type == 'header'){
						var tab = opts.tab;
						
						if (opts.header){
							tab.find('.tabs-inner').html($(opts.header));
						} else {
							var s_title = tab.find('span.tabs-title');
							var s_icon = tab.find('span.tabs-icon');
							s_title.html(opts.title);
							s_icon.attr('class', 'tabs-icon');
							
							tab.find('a.tabs-close').remove();
							if (opts.closable){
								s_title.addClass('tabs-closable');
								$('<a href="javascript:void(0);" class="tabs-close"></a>').appendTo(tab);
							} else{
								s_title.removeClass('tabs-closable');
							}
							if (opts.iconCls){
								s_title.addClass('tabs-with-icon');
								s_icon.addClass(opts.iconCls);
							} else {
								s_title.removeClass('tabs-with-icon');
							}
							if (opts.tools){
								var p_tool = tab.find('span.tabs-p-tool');
								if (!p_tool.length){
									var p_tool = $('<span class="tabs-p-tool"></span>').insertAfter(tab.find('a.tabs-inner'));
								}
								if ($.isArray(opts.tools)){
									p_tool.empty();
									for(var i=0; i<opts.tools.length; i++){
										var t = $('<a href="javascript:void(0);"></a>').appendTo(p_tool);
										t.addClass(opts.tools[i].iconCls);
										if (opts.tools[i].handler){
											t.bind('click', {handler:opts.tools[i].handler}, function(e){
												if ($(this).parents('li').hasClass('tabs-disabled')){return;}
												e.data.handler.call(this);
											});
										}
									}
								} else {
									$(opts.tools).children().appendTo(p_tool);
								}
								var pr = p_tool.children().length * 12;
								if (opts.closable) {
									pr += 8;
									p_tool.css('right', '');
								} else {
									pr -= 3;
									p_tool.css('right','5px');
								}
								s_title.css('padding-right', pr+'px');
							} else {
								tab.find('span.tabs-p-tool').remove();
								s_title.css('padding-right', '');
							}
						}
						if (oldTitle != opts.title){
							for(var i=0; i<selectHis.length; i++){
								if (selectHis[i] == oldTitle){
									selectHis[i] = opts.title;
								}
							}
						}
					}
					if (opts.disabled){
						opts.tab.addClass('tabs-disabled');
					} else {
						opts.tab.removeClass('tabs-disabled');
					}
					
					this._setSize();
					
					$.data(container, 'tabsObj').options.onUpdate.call(container, opts.title, this._getTabIndex(pp));
				},_closeTab:function (which) {
					var container=this.element;
					var opts = $.data(container, 'tabsObj').options;
					var tabs = $.data(container, 'tabsObj').tabs;
					var selectHis = $.data(container, 'tabsObj').selectHis;
					
					if (!this._exists( which)) return;
					
					var tab = this._getTab(which);
					var title = tab.panel('options').title;
					var index = this._getTabIndex(tab);
					
					
					if (this.trigger("onBeforeClose",title, index) == false){return false;};
					
					var tab = this._getTab(which, true);
					tab.panel('options').tab.remove();
					tab.panel('destroy');
					
				
					this.trigger("onClose",title, index)
//					setScrollers(container);
					this._setSize();
					// remove the select history item
					for(var i=0; i<selectHis.length; i++){
						if (selectHis[i] == title){
							selectHis.splice(i, 1);
							i --;
						}
					}
					// select the nearest tab panel
					var hisTitle = selectHis.pop();
					if (hisTitle){
						this._selectTab(hisTitle);
					} else if (tabs.length){
						this._selectTab(0);
					}
				},
				
				/**
				 * get the specified tab panel
				 */
				_getTab:function (which, removeit){
					var container=this.element;
					var tabs = $.data(container, 'tabsObj').tabs;
					var tab = null;
					if (typeof which == 'number'){
						if (which >=0 && which < tabs.length){
							tab = tabs[which];
							if (removeit){
								tabs.splice(which, 1);
							}
						}
					} else {
						var tmp = $('<span></span>');
						for(var i=0; i<tabs.length; i++){
							var p = tabs[i];
							var panelOpt=p.panel('options');
							if (panelOpt.id){
								if (panelOpt.id == which){
									tab = p;
									if (removeit){
										tabs.splice(i, 1);
									}
									break;
								}
								
							}else{
								tmp.html(p.panel('options').title);
								if (tmp.text() == which){
									tab = p;
									if (removeit){
										tabs.splice(i, 1);
									}
									break;
								}
							}
							
						}
						tmp.remove();
					}
					return tab;
				},
				
				 _getTabIndex:function(tab){
					 var container=this.element;
					var tabs = $.data(container, 'tabsObj').tabs;
					for(var i=0; i<tabs.length; i++){
						if (tabs[i][0] == $(tab)[0]){
							return i;
						}
					}
					return -1;
				},
				
				_getSelectedTab:function (){
					var container=this.element;
					var tabs = $.data(container, 'tabsObj').tabs;
					for(var i=0; i<tabs.length; i++){
						var tab = tabs[i];
						if (tab.panel('options').tab.hasClass('tabs-selected')){
							return tab;
						}
					}
					return null;
				},
				
				/**
				 * do first select action, if no tab is setted the first tab will be selected.
				 */
				_doFirstSelect:function (){
					var container=this.element;
					var state = $.data(container, 'tabsObj')
					var tabs = state.tabs;
					for(var i=0; i<tabs.length; i++){
						var opts = tabs[i].panel('options');
						if (opts.selected && !opts.disabled){
							this._selectTab(i);
							return;
						}
					}
					this._selectTab(state.options.selected);
				},
				
				_selectTab:function ( which){
					var p = this._getTab( which);
					if (p && !p.is(':visible')){
						this._stopAnimate();
						if (!p.panel('options').disabled){
							p.panel('open');				
						}
					}
				},
				
				_unselectTab:function (which){
					var p = this._getTab( which);
					if (p && p.css('display') != 'none'){
						this._stopAnimate();
						p.panel('close');
					}
				},

				 _stopAnimate:function(){
					 var container=this.element;
					$(container).children('div.tabs-panels').each(function(){
						$(this).stop(true, true);
					});
				},
				
				_exists:function ( which){
					 var container=this.element;
					return this._getTab(which) != null;
				},
				hideTab:function(whichs){
					
					var witchList=whichs.split(","),which;
					for(var i=0;i<witchList.length;i++){
						which=witchList[i]
						var tabPanel=this.getTab(which);
						var opts =  tabPanel.panel('options');		
						if (opts){
							opts.tab.hide();
							 tabPanel.panel('hide');
						}
					}
				},
				showTab:function(whichs){
					var witchList=whichs.split(","),which;
					for(var i=0;i<witchList.length;i++){
						which=witchList[i]
						var tabPanel=this.getTab(which);
						var opts =  tabPanel.panel('options');		
						if (opts){
							opts.tab.show();
							 tabPanel.panel('show');
						}
					}
					
				}
			});
			
		
			
			

			Tabs.parseOptions = function(target){
				var t = $(target);
				return $.extend({}, t.parseOptions(target, [
					'tools','toolPosition','tabPosition',
					{fit:'boolean',border:'boolean',plain:'boolean'},
					{headerWidth:'number',tabWidth:'number',tabHeight:'number',selected:'number'},
					{showHeader:'boolean',justified:'boolean',narrow:'boolean',pill:'boolean'}
				]));
			};
			
			Tabs.defaults = {
				width : 'auto',
				height : 'auto',
				headerWidth : 150, // the tab header width, it is valid only when tabPosition set to 'left' or 'right' 
				tabWidth : 'auto', // the tab width
				tabHeight : 27, // the tab height
				selected : 0, // the initialized selected tab index
				showHeader : true,
				plain : false,
				fit : false,
				border : true,
				justified : false,
				narrow : false,
				pill : false,
				tools : null,
				toolPosition : 'right', // left,right
				tabPosition : 'top', // possible values: top,bottom
				scrollIncrement : 100,
				scrollDuration : 400,
				onLoad : function(panel) {
				},
				onSelect : function(title, index) {
				},
				onUnselect : function(title, index) {
				},
				onBeforeClose : function(title, index) {
				},
				onClose : function(title, index) {
				},
				onAdd : function(title, index) {
				},
				onUpdate : function(title, index) {
				},
				onContextMenu : function(e, title, index) {
				}
			}
		$.fn.tabs = function(options, param) {
		
				var methodReturn;

				options = options || {};
				$set = this.each(function() {
							var $this = $(this);
							var state = $.data(this, 'tabsObj');
							var data = $this.data('tabs');
							if (state) {
								if (typeof options === 'object') {
									opts = $.extend(state.options, options);
								}
							} else {
								data = new Tabs(this, options);
								$this.data('tabs', data);
								//data._init(this);
							}
							if (typeof options === 'string')
								methodReturn = data[options](param);
						});
				return (methodReturn === undefined) ? $set : methodReturn;
			};
	/**
	 *生成菜单按钮
	 */
	function initMenuButtonHtml(btn){
		var $btn = $('<a id="' + btn.id + '" >' + btn.text + '</a>');
		btn.menuId = $A.uuid();
		initMenu(btn);
		$btn.menubutton({
			iconCls: btn.iconCls,
			onClick: btn.onClick,
			plain: false,
			menu: btn.menuId,
			menuStyle: btn.style ? btn.style : 'width:150px'
		});
		return $btn;
		function initMenu(btn){
			var children = btn.children
				,$menu = $('<div id="' + btn.menuId + '" style="' + btn.menuStyle + ';display:none;"></div>');
			for(var i = 0; i < children.length; i++){
				var child = children[i];
				if(child.menuSep){
					$menu.append('<div class="menu-sep"></div>');
				}else{
					initMenuItem(child);
				}
			}
			$.$appPanelContainer.append($menu);
			function initMenuItem(child){
				if(!child.id){
					child.id = $A.uuid();
				}
				var $child = $('<div id="' + child.id 
					+ '" ' + getDataOptions(child) + '>' + child.text + '</div>');
				$menu.append($child);
				$child.on('click', function(e){
					if(child.onClick){
						child.onClick();
					}
				});
			}
			function getDataOptions(btn){
				var result = '';
				if(btn.iconCls){
					result += 'iconCls:\'' + btn.iconCls + '\'';
				}
				if(result){
					result = 'data-options="'+ result +'"';
				}
				return result;
			}
		}
	};
	return Tabs;
})