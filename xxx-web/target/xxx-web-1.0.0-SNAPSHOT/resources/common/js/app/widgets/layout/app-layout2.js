define(["app/core/app-jquery", "app/core/app-core", "app/core/app-options", "jquery/jquery-ui", "app/widgets/panel/app-panel", "app/widgets/layout/app-containerLayout"], function($, $A,
		Options,resizable,Panel,Widget) {
	var resizing = false;
	//console.log(Panel.parseOptions)
	/**
	 * @class
	 * @name Layout
	 * @classdesc 布局控件
	 * @extends Widget
	 * @example
	 * 
	 * //html
	 *  //<div class="app-layout" style="height:100%;width:100%">
	 *  	<div data_options="{region:""}">
	 *  
	 *  //</div>
	 * //
	 * 
	 * 
	 */
	var Layout = ContainerLayout.extend({
				initialize : function(options) {
					if (!options){
						options={};
					};
					options= $.extend(options,this.parseOptions(options.element));
				
					Layout.superclass.initialize.call(this, options);
					this.padding=this.padding||this.getPadding(this.element);
					this.margins=this.margins||this.getMargins(this.element);
					this.panels=this.init();
					this.bindEvents();
					
					this._setSize();
				},
				 /**
				 * @memberof Layout
			     * 设置布局面板大小 
			     * @param param 
			     * @namespace param
			     * @property param.width {number} 
			     * @property  param.height {number} 
			     */
				resize : function(jq,param) {
					this._setSize(param);
				},
				parseOptions:function(element){
					
					var t = $(element);
					return $.extend({}, t.parseOptions(element, [{"fit":"boolean"}]));
				},
				updateChildBoxes : function(boxes) {
					for (var i = 0, length = boxes.length; i < length; i++) {
						var box = boxes[i], comp = box.component;

						//if (box.dirtySize) {
							comp.panel("resize",box)
						//}
						// Don't set positions to NaN
						if (isNaN(box.left) || isNaN(box.top)) {
							continue;
						}
						//comp.setPosition(box.left, box.top);
					}
				},
				/**
				 * 获取布局内面板初始化参数
				 */
				parsePanelOptions:function(panel){
					var t = $(panel);
					var options=$.extend({}, Panel.parseOptions(panel), t
						.parseOptions(panel, ["region", {
											split : "boolean",
											collpasedSize : "number",
											minWidth : "number",
											minHeight : "number",
											maxWidth : "number",
											maxHeight : "number",
												width : "number",
												height : "number"
										}]));
					if (options["width"]&&options["width"]!="auto"){
						options["width"]=parseInt(options["width"]);
					}
					if (options["height"]&&options["height"]!="auto"){
						options["height"]=parseInt(options["height"]);
					}
					return options;
				},
			    /**
			     * 设置布局大小
			     * @param param 
			     * @namespace param
			     * @property param.width {number} 
			     * @property  param.height {number} 
			     */
				_setSize : function(param) {
					var opts = this.attrs;
					var panels = this.panels;
					var container=this.element
					if (param) {
						$.extend(opts, {
									width : param.width,
									height : param.height
								});
					}
					var cc = $(container);
					if (this.get("fit") == true) {
					
							var p = cc.parent();
						if (p.width()!=0&&p.height()!=0){
							cc.width(p.width()).height(p.height());
						}
					}
					var tSize = this.getLayoutTargetSize();
					var boxs=this.calculateChildBoxes(tSize);
					
					this.updateChildBoxes(boxs)
					/*var cpos = {
						top : 0,
						left : 0,
						width : cc.width(),
						height : cc.height()
					};

					// set north panel size
					function setNorthSize(pp) {
						if (pp.length == 0)
							return;
						pp.panel('resize', {
									width : cc.width(),
									height : pp.panel('options').height,
									left : 0,
									top : 0
								});
						cpos.top +=  parseInt(pp.panel('options').height);
						cpos.height -=  parseInt(pp.panel('options').height);
					}
					if (this.isVisible(panels.expandNorth)) {
						setNorthSize(panels.expandNorth);
					} else {
						setNorthSize(panels.north);
					}

					// set south panel size
					function setSouthSize(pp) {
						if (pp.length == 0)
							return;
						pp.panel('resize', {
									width : cc.width(),
									height : pp.panel('options').height,
									left : 0,
									top : cc.height()
											-  parseInt(pp.panel('options').height)
								});
						cpos.height -= pp.panel('options').height;
					}
					if (this.isVisible(panels.expandSouth)) {
						setSouthSize(panels.expandSouth);
					} else {
						setSouthSize(panels.south);
					}

					// set east panel size
					function setEastSize(pp) {
						if (pp.length == 0)
							return;
						pp.panel('resize', {
									width : pp.panel('options').width,
									height : cpos.height,
									left : cc.width()
											- parseInt(pp.panel('options').width),
									top : cpos.top
								});
						cpos.width -= pp.panel('options').width;
					}
					if (this.isVisible(panels.expandEast)) {
						setEastSize(panels.expandEast);
					} else {
						setEastSize(panels.east);
					}

					// set west panel size
					function setWestSize(pp) {
						if (pp.length == 0)
							return;
						pp.panel('resize', {
									width : pp.panel('options').width,
									height : cpos.height,
									left : 0,
									top : cpos.top
								});
						cpos.left += parseInt(pp.panel('options').width);
						cpos.width -= parseInt(pp.panel('options').width);
					}
					if (this.isVisible(panels.expandWest)) {
						setWestSize(panels.expandWest);
					} else {
						setWestSize(panels.west);
					}

					panels.center.panel('resize', cpos);*/
				},
				calculateChildBoxes:function(targetSize){
					var width=targetSize.width,height=targetSize.height,panels=this.panels,
					padding      = this.padding,
		            topOffset    = padding.top,
		            leftOffset   = padding.left,
		          //  paddingVert  = topOffset  + padding.bottom,
		            //paddingHoriz = leftOffset + padding.right,
					width = targetSize.width ,
					height = targetSize.height,
					availableHeight=height-0,
					availableWidth=width-0,
					boxes=[],box;
					var regions = {
						north : null,
						south :null,
						west : null,
						east : null,
						center : null
					};
					for(var key in regions){
						box={};
						var child=panels[key],opt=child.panel("options"),childMargins=opt.margins,region=opt.region;
						if (panels[key].length==0){
							continue;
						}
						if (child.length>0&&!this.isVisible(child)){
								child=panels["expand"+key];
								if (!child||child.length==0){
									continue;
								}
								region=opt.region;
								opt=child.panel("options");
						}
						switch(region){
							case "west" :
								// topOffset  += childMargins.top;
								// leftOffset   += childMargins.left;
								//availableHeight=availableHeight-childMargins.top-childMargins.bottom
								 availableWidth=availableWidth- childMargins.left-childMargins.right-opt.width;
								 box["height"]=availableHeight-childMargins.top-childMargins.bottom;
								 box["wdth"]=opt.width;
								 box["top"]=topOffset+childMargins.top;
								 box["left"]=leftOffset+childMargins.left;
								 box["component"]=child;
								 leftOffset=opt.width+leftOffset+childMargins.left+ childMargins.right;
								 //availableHeight=availableHeight- childMargins.top- childMargins.left
								break;
							case "east" :
								// topOffset  += childMargins.top;
								// leftOffset   += childMargins.left;
								 availableWidth=availableWidth- childMargins.left-opt.width- childMargins.right;
								 box["height"]=availableHeight-childMargins.top-childMargins.bottom;
								 box["wdth"]=opt.width;
								 box["top"]=topOffset+childMargins.top;
								 box["left"]=width-opt.width-childMargins.left;
								 box["component"]=child;
								break;
							case "north" :
 								 availableHeight=availableHeight- childMargins.top- childMargins.bottom-opt.height;
 								 //availableWidth=availableWidth-childMargins.left-childMargins.right;
								 box["height"]=opt.height;
								 box["width"]=availableWidth-childMargins.left- childMargins.right;
								 box["top"]=topOffset+childMargins.top;
								 box["left"]=topOffset+childMargins.left;
								 box["component"]=child;
								 topOffset=opt.height+childMargins.top+childMargins.bottom;
								break;
							case "south" :
								 availableHeight=availableHeight-childMargins.top-childMargins.bottom-opt.height;
 								// availableWidth=availableWidth-childMargins.left-childMargins.right;
								 box["height"]=opt.height;
								 box["width"]=availableWidth-childMargins.left- childMargins.right;;
								 box["top"]=height-opt.height-childMargins.top-childMargins.bottom;
								 box["left"]=leftOffset+childMargins.left;
								 box["component"]=child;
								break;
							case "center" :
							 	 box["height"]=availableHeight- childMargins.top- childMargins.bottom;
								 box["width"]=availableWidth;
								 box["top"]=topOffset+childMargins.top;
								 box["left"]=leftOffset+childMargins.left;
								 box["component"]=child;
								break;
								
						}
						if (child.length>0){
							box["region"]=region;
							boxes.push(box);
						}
						
					};
					return boxes;
				
				},
				getLayoutTargetSize : function() {
					var target = $(this.element), ret=null;;
					if (target) {
						ret={};
						ret.height = target.innerHeight();
						ret.width = target.innerWidth();
					}
					return ret;
				},
				/**
				 * initialize and wrap the layout
				 */
				init : function() {
					var container=this.element;
					var cc = $(container);
					var _self = this;
					if (cc[0].tagName == 'BODY') {
						$('html').css({
									height : '100%',
									overflow : 'hidden'
								});
						$('body').css({
									height : '100%',
									overflow : 'hidden',
									border : 'none'
								});
					}
					cc.addClass('layout');
					cc.css({
								margin : 0,
								padding : 0
							});
						
					function createPanel(panel,options,dir) {
						var pp = $(panel, container)
								.addClass('layout-body');

						var toolCls = null;
						if (dir == 'north') {
							toolCls = 'layout-button-up';
						} else if (dir == 'south') {
							toolCls = 'layout-button-down';
						} else if (dir == 'east') {
							toolCls = 'layout-button-right';
						} else if (dir == 'west') {
							toolCls = 'layout-button-left';
						}
	
						var cls = 'layout-panel layout-panel-' + dir+" layout-panel-broder-" + dir;
						if (options['split'] == 'true'||options['split']===true) {
							cls += ' layout-split-' + dir;
						}
						var toolItem={
										iconCls : toolCls,
										handler : function() {
											_self.collapsePanel(dir);
										}
									};
						if (dir == 'center'){
							toolItem={};
						}
						if (!options.collapsible){
							toolItem={};
						}
						var opt = $.extend({}, options,{
							//width : (pp.length ? parseInt(pp[0].style.width)
								//	|| pp.outerWidth() : "auto"),
							//height : (pp.length ? parseInt(pp[0].style.height)
								//	|| pp.outerHeight() : "auto"),
							doSize : pp.height()<=0,
							collapsible : false,
							cls : cls,
							tools : [toolItem],
							bodyCls : "layout-body"
								/*
								 * onOpen : function() { var _1c =
								 * $(this).panel("header")
								 * .children("div.panel-tool");
								 * _1c.children("a.panel-tool-collapse").hide();
								 * var _1d = { north : "up", south : "down",
								 * east : "right", west : "left" }; if
								 * (!_1d[dir]) { return; } var _1e =
								 * "layout-button-" + _1d[dir]; var t =
								 * _1c.children("a." + _1e); if (!t.length) { t =
								 * $("<a href=\"javascript:void(0)\"></a>")
								 * .addClass(_1e).appendTo(_1c); t.bind("click", {
								 * dir : dir }, function(e) { _2b(_18,
								 * e.data.dir); return false; }); }
								 * $(this).panel("options").collapsible ?
								 * t.show() : t .hide(); }
								 */
							});
						if (dir == "center"){
							opt["height"]=1;
						}
						pp.panel(opt);

						if (opt['split'] == 'true'||opt['split']===true) {
							var panel = pp.panel('panel');

							var handles = '';
							if (dir == 'north')
								handles = 's';
							if (dir == 'south')
								handles = 'n';
							if (dir == 'east')
								handles = 'w';
							if (dir == 'west')
								handles = 'e';

							panel.resizable({
								handles : handles,
								helper:function(){
									if (dir == 'north' || dir == 'south') {
											var proxy = $(
													'>div.layout-split-proxy-v',
													container);
										} else {
											var proxy = $(
													'>div.layout-split-proxy-h',
													container);
										}
										return proxy;
								},
								start : function(e,data) {
					
									resizing = true;

									if (dir == 'north' || dir == 'south') {
										var proxy = $(
												'>div.layout-split-proxy-v',
												container);
									} else {
										var proxy = $(
												'>div.layout-split-proxy-h',
												container);
									}
									var top = 0, left = 0, width = 0, height = 0;
									var pos = {
										display : 'block'
									};
									if (dir == 'north') {
										pos.top = parseInt(panel.css('top'))
												+ panel.outerHeight()
												- proxy.height();
										pos.left = parseInt(panel.css('left'));
										pos.width = panel.outerWidth();
										pos.height = proxy.height();
									} else if (dir == 'south') {
										pos.top = parseInt(panel.css('top'));
										pos.left = parseInt(panel.css('left'));
										pos.width = panel.outerWidth();
										pos.height = proxy.height();
									} else if (dir == 'east') {
										pos.top = parseInt(panel.css('top'))
												|| 0;
										pos.left = parseInt(panel.css('left'))
												|| 0;
										pos.width = proxy.width();
										pos.height = panel.outerHeight();
									} else if (dir == 'west') {
										pos.top = parseInt(panel.css('top'))
												|| 0;
										pos.left = panel.outerWidth()
												- proxy.width();
										pos.width = proxy.width();
										pos.height = panel.outerHeight();
									}
									proxy.css(pos);
									$('<div class="layout-mask"></div>').css({
												left : 0,
												top : 0,
												width : cc.width(),
												height : cc.height()
											}).appendTo(cc);
								},
								resize : function(e) {
									if (dir == 'north' || dir == 'south') {
										var proxy = $(
												'>div.layout-split-proxy-v',
												container);
										proxy.css('top',e.pageY- $(container).offset().top- proxy.height()/ 2);
									} else {
										var proxy = $('>div.layout-split-proxy-h',container);
										proxy.css('left',e.pageX- $(container).offset().left- proxy.width()/ 2);
									}
									return false;
								},
								stop : function(event,data) {
									
									$('>div.layout-split-proxy-v', container)
											.css('display', 'none');
									$('>div.layout-split-proxy-h', container)
											.css('display', 'none');
									var size=data.size
									var opts = pp.panel('options');
									opts.width = panel.outerWidth();
									opts.height = panel.outerHeight();
									opts.left = panel.css('left');
									opts.top = panel.css('top');
									pp.panel('resize');
									_self._setSize();
									resizing = false;

									cc.find('>div.layout-mask').remove();
								}
							});
						}
						return pp;
					}
					var panels = {
						north : $(),
						south : $(),
						west : $(),
						east : $(),
						center : $()
					};
					var _self = this;
						cc.children("div").each(function() {
								var panelOptions = _self.parsePanelOptions(this);
								panelOptions["layout"]=cc;
									$(this).removeClass("app-panel");
								if ("north,south,east,west,center".indexOf(panelOptions.region) >= 0) {
									 panelOptions["padding"]=_self.getPadding(this);
			    		 				panelOptions["margins"]=_self.getMargins(this);
									panels[panelOptions.region]=createPanel(this, panelOptions,panelOptions.region);
								}
							});

					$('<div class="layout-split-proxy-h"></div>').appendTo(cc);
					$('<div class="layout-split-proxy-v"></div>').appendTo(cc);
					$(container).bind('_resize', function() {
								if (_self.get("fit") == true) {
									_self._setSize();
								}
								return false;
							});

					/*
					 * $(window).resize(function() { _self._setSize(container);
					 * });
					 */

					return panels;
				},
				
				/**
				 * 
				 * 根据位置获取布局中的面板 west,center,east,south,north
				 * @memberof Layout
				 * @param region {String}  
				 */
				getPanel : function(region) {
					var panels = this.panels;
					if (!panels)
						return null;
					return panels[region];
				},
				/**
				 * 
				 * 根据位置隐藏布局中的面板 west,center,east,south,north
				 * @memberof Layout
				 * @param region {String}  
				 */
				collapsePanel : function(region) {
					var container=this.element;
					var panels = this.panels;
					var _self = this;
					var cc = $(container);
					var expandPanel="expand"+region;
					function createExpandPanel(dir) {
						var icon;
						if (dir == 'east')
							icon = 'layout-button-left'
						else if (dir == 'west')
							icon = 'layout-button-right'
						else if (dir == 'north')
							icon = 'layout-button-down'
						else if (dir == 'south')
							icon = 'layout-button-up';
						var options=panels[dir].panel("options");
						var p = $('<div></div>').appendTo(cc).panel({
									cls : 'layout-expand',
									title : '&nbsp;',
									title:options.title,
									closed : true,
									doSize : false,
									height:28,
									width:28,
									margins:options.margins,
									tools : [{
												iconCls : icon,
												handler : function() {
													_self.expandPanel(region);
												}
											}]
								});
						p.panel('panel').hover(function() {
									$(this).addClass('layout-expand-over');
								}, function() {
									$(this).removeClass('layout-expand-over');
								});
						return p;
					};
					if (panels[region]){
						panels[region].panel('close');
					}
			
					if (!panels[expandPanel]) {
							panels[expandPanel] = createExpandPanel(region);
							panels[expandPanel].panel('panel').click(function() {
								_self.expandPanel(region);
								return false;
							});
					};
					panels[expandPanel].panel('open');
					this._setSize();
			
					//if expandEast
					/*if (region == 'east') {
						if (panels.east.panel('options').onBeforeCollapse
								.call(panels.east) == false)
							return;
						panels.center.panel('resize', {
									width : panels.center.panel('options').width
											+ panels.east.panel('options').width
											- 28
								});
						panels.east.panel('panel').animate({
									left : cc.width()
								}, function() {
									panels.east.panel('close');
									panels.expandEast.panel('open').panel(
											'resize', {
												top : panels.east
														.panel('options').top,
												left : cc.width() - 28,
												width : 28,
												height : panels.east
														.panel('options').height
											});
									panels.east.panel('options').onCollapse
											.call(panels.east);
								});
						if (!panels.expandEast) {
							panels.expandEast = createExpandPanel('east');
							panels.expandEast.panel('panel').click(function() {
								panels.east.panel('open').panel('resize', {
											left : cc.width()
										});
								panels.east.panel('panel').animate({
									left : cc.width()
											- panels.east.panel('options').width
								});
								return false;
							});
						}
					} else if (region == 'west') {
						if (panels.west.panel('options').onBeforeCollapse
								.call(panels.west) == false)
							return;

						panels.center.panel('resize', {
									width : panels.center.panel('options').width
											+ panels.west.panel('options').width
											- 28,
									left : 28
								});
						panels.west.panel('panel').animate({
									left : -panels.west.panel('options').width
								}, function() {
									panels.west.panel('close');
									panels.expandWest.panel('open').panel(
											'resize', {
												top : panels.west
														.panel('options').top,
												left : 0,
												width : 28,
												height : panels.west
														.panel('options').height
											});
									panels.west.panel('options').onCollapse
											.call(panels.west);
								});
						if (!panels.expandWest) {
							panels.expandWest = createExpandPanel('west');
							panels.expandWest.panel('panel').click(function() {
								panels.west.panel('open').panel('resize', {
											left : -panels.west
													.panel('options').width
										});
								panels.west.panel('panel').animate({
											left : 0
										});
								return false;
							});
						}
					} else if (region == 'north') {
						if (panels.north.panel('options').onBeforeCollapse
								.call(panels.north) == false)
							return;

						var hh = cc.height() - 28;
						if (_self.isVisible(panels.expandSouth)) {
							hh -= panels.expandSouth.panel('options').height;
						} else if (_self.isVisible(panels.south)) {
							hh -= panels.south.panel('options').height;
						}
						panels.center.panel('resize', {
									top : 28,
									height : hh
								});
						panels.east.panel('resize', {
									top : 28,
									height : hh
								});
						panels.west.panel('resize', {
									top : 28,
									height : hh
								});
						if (_self.isVisible(panels.expandEast))
							panels.expandEast.panel('resize', {
										top : 28,
										height : hh
									});
						if (_self.isVisible(panels.expandWest))
							panels.expandWest.panel('resize', {
										top : 28,
										height : hh
									});

						panels.north.panel('panel').animate({
									top : -panels.north.panel('options').height
								}, function() {
									panels.north.panel('close');
									panels.expandNorth.panel('open').panel(
											'resize', {
												top : 0,
												left : 0,
												width : cc.width(),
												height : 28
											});
									panels.north.panel('options').onCollapse
											.call(panels.north);
								});
						if (!panels.expandNorth) {
							panels.expandNorth = createExpandPanel('north');
							panels.expandNorth.panel('panel').click(function() {
								panels.north.panel('open').panel('resize', {
											top : -panels.north
													.panel('options').height
										});
								panels.north.panel('panel').animate({
											top : 0
										});
								return false;
							});
						}
					} else if (region == 'south') {
						if (panels.south.panel('options').onBeforeCollapse
								.call(panels.south) == false)
							return;

						var hh = cc.height() - 28;
						if (_self.isVisible(panels.expandNorth)) {
							hh -= panels.expandNorth.panel('options').height;
						} else if (_self.isVisible(panels.north)) {
							hh -= panels.north.panel('options').height;
						}
						panels.center.panel('resize', {
									height : hh
								});
						panels.east.panel('resize', {
									height : hh
								});
						panels.west.panel('resize', {
									height : hh
								});
						if (_self.isVisible(panels.expandEast))
							panels.expandEast.panel('resize', {
										height : hh
									});
						if (_self.isVisible(panels.expandWest))
							panels.expandWest.panel('resize', {
										height : hh
									});

						panels.south.panel('panel').animate({
									top : cc.height()
								}, function() {
									panels.south.panel('close');
									panels.expandSouth.panel('open').panel(
											'resize', {
												top : cc.height() - 28,
												left : 0,
												width : cc.width(),
												height : 28
											});
									panels.south.panel('options').onCollapse
											.call(panels.south);
								});
						if (!panels.expandSouth) {
							panels.expandSouth = createExpandPanel('south');
							panels.expandSouth.panel('panel').click(function() {
								panels.south.panel('open').panel('resize', {
											top : cc.height()
										});
								panels.south.panel('panel').animate({
									top : cc.height()
											- panels.south.panel('options').height
								});
								return false;
							});
						}
					}*/
				},
/**
				 * 
				 * 根据位置展开布局中的面板 west,center,east,south,north
				 * @memberof Layout
				 * @param region {String}  
				 */
				expandPanel : function(region) {
					var container=this.element;
					var panels =this.panels;
					var cc = $(container);
					var _self=this;
					var expandPanel="expand"+region;
					panels[expandPanel].panel('close');
					panels[region].panel('open');
					this._setSize();
					/*if (region == 'east' && panels.expandEast) {
						if (panels.east.panel('options').onBeforeExpand
								.call(panels.east) == false)
							return;

						panels.expandEast.panel('close');
						panels.east.panel('panel').stop(true, true);
						panels.east.panel('open').panel('resize', {
									left : cc.width()
								});
						panels.east.panel('panel').animate({
							left : cc.width()
									- panels.east.panel('options').width
						}, function() {
							_self._setSize();
							panels.east.panel('options').onExpand
									.call(panels.east);
						});
					} else if (region == 'west' && panels.expandWest) {
						if (panels.west.panel('options').onBeforeExpand
								.call(panels.west) == false)
							return;

						panels.expandWest.panel('close');
						panels.west.panel('panel').stop(true, true);
						panels.west.panel('open').panel('resize', {
									left : -panels.west.panel('options').width
								});
						panels.west.panel('panel').animate({
									left : 0
								}, function() {
									_self._setSize();
									panels.west.panel('options').onExpand
											.call(panels.west);
								});
					} else if (region == 'north' && panels.expandNorth) {
						if (panels.north.panel('options').onBeforeExpand
								.call(panels.north) == false)
							return;

						panels.expandNorth.panel('close');
						panels.north.panel('panel').stop(true, true);
						panels.north.panel('open').panel('resize', {
									top : -panels.north.panel('options').height
								});
						panels.north.panel('panel').animate({
									top : 0
								}, function() {
									_self._setSize();
									panels.north.panel('options').onExpand
											.call(panels.north);
								});
					} else if (region == 'south' && panels.expandSouth) {
						if (panels.south.panel('options').onBeforeExpand
								.call(panels.south) == false)
							return;

						panels.expandSouth.panel('close');
						panels.south.panel('panel').stop(true, true);
						panels.south.panel('open').panel('resize', {
									top : cc.height()
								});
						panels.south.panel('panel').animate({
							top : cc.height()
									- panels.south.panel('options').height
						}, function() {
							_self._setSize();
							panels.south.panel('options').onExpand
									.call(panels.south);
						});
					}*/
				},
				/**
				 *绑定布局内面板事件
				 */
				bindEvents : function() {
					var container=this.element;
					var _slef = this;
					var panels = this.panels;
					var cc = $(container);

					// bind east panel events
					if (panels.east.length) {
						panels.east.panel('panel').bind('mouseover', 'east',
								collapsePanel);
					}

					// bind west panel events
					if (panels.west.length) {
						panels.west.panel('panel').bind('mouseover', 'west',
								collapsePanel);
					}

					// bind north panel events
					if (panels.north.length) {
						panels.north.panel('panel').bind('mouseover', 'north',
								collapsePanel);
					}

					// bind south panel events
					if (panels.south.length) {
						panels.south.panel('panel').bind('mouseover', 'south',
								collapsePanel);
					}

					panels.center.panel('panel').bind('mouseover', 'center',
							collapsePanel);

					function collapsePanel(e) {
						if (resizing == true)
							return;

						if (e.data != 'east' && _slef.isVisible(panels.east)
								&& _slef.isVisible(panels.expandEast)) {
							panels.east.panel('panel').animate({
										left : cc.width()
									}, function() {
										panels.east.panel('close');
									});
						}
						if (e.data != 'west' && _slef.isVisible(panels.west)
								&& _slef.isVisible(panels.expandWest)) {
							panels.west.panel('panel').animate({
										left : -panels.west.panel('options').width
									}, function() {
										panels.west.panel('close');
									});
						}
						if (e.data != 'north' && _slef.isVisible(panels.north)
								&& _slef.isVisible(panels.expandNorth)) {
							panels.north.panel('panel').animate({
										top : -panels.north.panel('options').height
									}, function() {
										panels.north.panel('close');
									});
						}
						if (e.data != 'south' && _slef.isVisible(panels.south)
								&& _slef.isVisible(panels.expandSouth)) {
							panels.south.panel('panel').animate({
										top : cc.height()
									}, function() {
										panels.south.panel('close');
									});
						}
						return false;
					}

				},
				isVisible : function(pp) {
					if (!pp)
						return false;
					if (pp.length) {
						return  pp.panel('panel').css("display")!="none";
					} else {
						return false;
					}
				}
			});
	

	
	$.fn.layout = function(options, param) {
		var methodReturn=null;
		 $set=this.each(function() {
					var $this = $(this);
					var state = $.data(this, 'layout');
					var data = $.data(this, 'layoutObj');
					if (!data) {
						var opts = $.extend({}, {
									element:this
									//fit : $(this).attr('fit') == 'true'
								});
						$this.data('layoutObj', (data = new Layout(opts)));
					}
					if (typeof options == 'string') {

						methodReturn = data[options](this, param);
						
					}
				});
		return (methodReturn === undefined) ? $set : methodReturn;
	};
	return Layout;
});
