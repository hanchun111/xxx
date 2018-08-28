define(
		["app/core/app-jquery", "app/core/app-core", "app/core/app-options",
				"app/widgets/app-resizable", "app/widgets/panel/app-panel", "app/widgets/layout/app-containerLayout"],
		function($, $A, Options, resizable, Panel, ContainerLayout) {

			var BoxLayout = ContainerLayout.extend({
				attrs : {
					type : null,
					items : [],
					fit : null,
					width : null,
					height : null,
					padding : null,
					margins : null
				},
				initialize : function(options) {
					if (!options) {
						options = {};
					};
					BoxLayout.superclass.initialize.call(this, options);
					options = $.extend({}, this.parseOptions(), options);
					this.initAttrs(options);
					this.padding = this.padding
							|| this.getPadding(this.element);
					this.margins = this.margins
							|| this.getMargins(this.element);
					this.init();

					if (!this.get("width")) {
						if ($(this.element).width()){
							this.set("width", $(this.element).width());
						}
					}
					if (!this.get("height")) {
						if ($(this.element).width()){
						this.set("height", $(this.element).height());
						}
					}
					this.setSize({
								width : this.get("width"),
								height : this.get("height")
							});
					var _self = this;
					$(this.element).bind('_resize', function() {
								//if (_self.get("fit") == true) {
									_self.setSize();
								//}
								return false;
							});
				},
				parseOptions : function() {
					var t = $(this.element);
					return $.extend({}, t.parseOptions(this.element, ["fit",
											"id"]));
				},
				setSize : function(param) {
					var opts = this.attrs;
					var container = this.element;
					var cc = $(container);
					if (param) {
						$.extend(opts, {
									width : param.width||1,
									height : param.height||1
								});
						cc.width(opts.width).height(opts.height);
					}

					if (this.get("fit") == true) {
						var p = cc.parent();
						var width=p.innerWidth()?p.innerWidth():1;
						var height=p.innerHeight()?p.innerHeight():1;
						cc.outerWidth(width).outerHeight(height);
					}
					this.doLayout();
				},
				resize : function() {
				},
				//需要反复用到的
				initProps : function() {
					this.items = this.get('items');
					this.padding = this.get('padding');
					this.padding = this.get('margins');
				},

				init : function() {
					var _self = this;

					$(this.element).addClass('layout').children("div").each(
							function() {
								var panelOptions = _self
										.parsePanelOptions(this);
								panelOptions["padding"] = _self
										.getPadding(this);
								panelOptions["margins"] = _self
										.getMargins(this);

								$(this).removeClass("app-panel");
								_self.items.push(_self.createPanel(this,
										panelOptions));
							});
				},
				parsePanelOptions : function(panel) {
					var t = $(panel);
					return $.extend({}, Panel.parseOptions(panel), t
									.parseOptions(panel, [{"fit":"boolean", "flex":"number", "height":"number", "width":"number"}]));
				},
				createPanel : function(panel, options) {
					var pp = $(panel, this.element).addClass('layout-body');
					var config={};
					var _self=this;
					var onExpand=function(target){
						bodyHeight=$(target).data("_panelBodyHeight")||0;
						var opts = $.data(target, 'panel').options;
						opts.height=opts.height+bodyHeight;
						_self.doLayout();
					};
					var onCollapse=function(target){
						bodyHeight=$(target).panel("body").height();
						var opts = $.data(target, 'panel').options;
						opts.height=opts.height-bodyHeight;
						$(target).data("_panelBodyHeight",bodyHeight);
						_self.doLayout();

					}
					if (options.onExpand){
						options.onExpand=function(target){
							options.onExpand.call(target);
							onCollapse(target);
						}
					}else{
						options.onExpand=onExpand;
					}
					if (options.onCollapse){
						options.onCollapse=function(target){
							options.onCollapse.call(target);
							onCollapse(target);
						}
					}else{
						options.onCollapse=onCollapse
					}
					if (this.get("type")=="vbox"){
						
						config={
								width : (pp.length
										? parseInt(pp[0].style.width)
												|| pp.outerWidth()
										: "auto"),
								height : (options["flex"] ? "auto" : pp.length
										? parseInt(pp[0].style.height)
												|| pp.outerHeight()
										: "auto"),
								doSize : false,
								//tools : [toolItem],
								
								bodyCls : "layout-body",
								cls : 'x-box-item'
							}
					}else{
						
						config={
								height : $(this.element).height(),
								width : (options["flex"] ? "auto" : pp.length
										? parseInt(pp[0].style.width)
												|| pp.outerWidth()
										: "auto"),
								doSize : false,
								bodyCls : "layout-body",
								cls : 'x-box-item'
							}
					}
					var opt = $.extend({},config , options);
					/*if (this.get("type")=="vbox"&&options["flex"]){
						delete opt["height"];
					}
					if (this.get("type")=="hbox"&&options["flex"]){
						delete opt["height"];
					}*/
					return $(pp).panel(opt);
				},
				updateInnerCtSize : function() {

				},
				getVisibleItems : function() {
					var items = [], panels = this.items, len = panels.length, i, p;
					for (i = 0; i < len; i++) {
						p = panels[i];
						var opts = p.panel("options");
						var panel = p.panel("panel");
						// && opts.collapsed !== true
						if (opts.closed !== true&& panel.css("display")!="none") {
							items.push(p);
						}
					}

					return items;
				},
				getLayoutTargetSize : function() {
					var target = $(this.element), ret = null;;
					if (target) {
						ret = {};
						ret.height = target.innerHeight();
						ret.width = target.innerWidth();
					}
					return ret;
				},
				doLayout : function() {
					var items = this.getVisibleItems(this.element), tSize = this
							.getLayoutTargetSize();
					/**
					 * @private
					 * @property layoutTargetLastSize
					 * @type Object Private cache of the last measured size of
					 *       the layout target. This should never be used except
					 *       by BoxLayout subclasses during their onLayout run.
					 */
					this.layoutTargetLastSize = tSize;

					/**
					 * @private
					 * @property childBoxCache
					 * @type Array Array of the last calculated height, width,
					 *       top and left positions of each visible rendered
					 *       component within the Box layout.
					 */
					this.childBoxCache = this.calculateChildBoxes(items, tSize);
					//this.updateInnerCtSize(tSize, this.childBoxCache);
					this.updateChildBoxes(this.childBoxCache.boxes);
					// Putting a box layout into an overflowed container is NOT
					// correct and will make a second layout pass necessary.
					//this.handleTargetOverflow(tSize, container, target);
				},
				updateChildBoxes : function(boxes) {
					for (var i = 0, length = boxes.length; i < length; i++) {
						var box = boxes[i], comp = box.component;

						if (box.dirtySize) {
							comp.panel("resize", box)
						}
						// Don't set positions to NaN
						if (isNaN(box.left) || isNaN(box.top)) {
							continue;
						}
						//comp.setPosition(box.left, box.top);
					}
				}
			});

			var VBoxLayout = BoxLayout.extend({
				attrs : {
					type : 'vbox'
				},
				calculateChildBoxes : function(visibleItems, targetSize) {
					var visibleCount = visibleItems.length, padding = this.padding, topOffset = padding.top, leftOffset = padding.left, paddingHoriz = leftOffset
							+ padding.right,

					paddingVert = topOffset + padding.bottom, paddingHoriz = leftOffset
							+ padding.right, width = targetSize.width, height = targetSize.height, availWidth = Math
							.max(0, width - paddingHoriz),

					nonFlexHeight = 0, maxWidth = 0, totalFlex = 0, childMargins,

					//used to cache the calculated size and position values for each child item
					boxes = [],

					//used in the for loops below, just declared here for brevity
					child, childWidth, childHeight, i, calcs, flexedHeight, opts;
					for (i = 0; i < visibleCount; i++) {
						child = visibleItems[i], opts = child.panel("options");
						childHeight = opts.height;
						childWidth = opts.width;
						// Static height (numeric) requires no calcs
						//if (!$.isNumeric(childHeight)) {
						// flex and not 'auto' height
						if (opts.flex) {
							totalFlex += opts.flex;
							childHeight = 0;
						}
						//}
						childMargins = opts.margins;
						nonFlexHeight += (childHeight || 0) + childMargins.top
								+ childMargins.bottom;
						// Max width for align - force layout of non-layed out subcontainers without a numeric width
						if (!$.isNumeric(childWidth)) {
							childWidth = child._outerWidth();
						}
						maxWidth = Math.max(maxWidth, childWidth);

						//cache the size of each child component
						boxes.push({
									component : child,
									height : childHeight || undefined,
									width : availWidth || undefined
								});
					}

					//the height available to the flexed items
					var availableHeight = Math.max(0,
							(height - nonFlexHeight - paddingVert));

					//temporary variables used in the flex height calculations below
					var remainingHeight = availableHeight, remainingFlex = totalFlex;

					//calculate the height of each flexed item, and the left + top positions of every item
					for (i = 0; i < visibleCount; i++) {
						child = visibleItems[i], opts = child.panel("options");
						childHeight = opts.height;
						childWidth = opts.width;
						calcs = boxes[i];
						childMargins = opts.margins;

						topOffset += childMargins.top;
						if (opts.flex) {
							flexedHeight = Math
									.ceil((opts.flex / remainingFlex)
											* remainingHeight);
							remainingHeight -= flexedHeight;
							remainingFlex -= opts.flex;

							calcs.height = flexedHeight;

						}
						calcs.dirtySize = true;
						calcs.left = leftOffset;
						calcs.top = topOffset;
						topOffset += calcs.height;
					}
					return {
						boxes : boxes,
						meta : {
							maxWidth : maxWidth
						}
					};
				}
			});
			$.fn.VBoxLayout = function(options, param) {
				var methodReturn = null;
				var $set = this.each(function() {
					var $this = $(this);

					var data = $.data(this, 'VBoxLayout');
					if (!data) {
						var opts = $.extend({}, {
									element : this
								});
						$this.data('VBoxLayout', (data = new VBoxLayout(opts)));
					}
					if (typeof options == 'string') {
						methodReturn = data[options](this, param);

					}
				});
				return (methodReturn === undefined) ? $set : methodReturn;
			};

			var HBoxLayout = BoxLayout.extend({
				attrs : {
					type : 'hbox'
				},
				calculateChildBoxes : function(visibleItems, targetSize) {
					var visibleCount = visibleItems.length, padding = this.padding, topOffset = padding.top, leftOffset = padding.left, paddingHoriz = leftOffset
							+ padding.right,

					paddingVert = topOffset + padding.bottom, paddingHoriz = leftOffset
							+ padding.right, width = targetSize.width, height = targetSize.height, availHeight = Math
							.max(0, height - paddingVert),

					nonFlexWidth = 0, maxHeight = 0, totalFlex = 0, childMargins,

					//used to cache the calculated size and position values for each child item
					boxes = [],

					//used in the for loops below, just declared here for brevity
					child, childWidth, childHeight, i, calcs, flexedWidth, opts;
					for (i = 0; i < visibleCount; i++) {
						child = visibleItems[i], opts = child.panel("options");
						childHeight = opts.height;
						childWidth = opts.width;
						// Static height (numeric) requires no calcs
						//if (!$.isNumeric(childWidth)) {
						// flex and not 'auto' height
						if (opts.flex) {
							totalFlex += opts.flex;
							childWidth = 0;
						}
						//}
						childMargins = opts.margins||this.getMargins(child);
						nonFlexWidth += (childWidth || 0) + childMargins.left
								+ childMargins.right;
						// Max width for align - force layout of non-layed out subcontainers without a numeric width
						if (!$.isNumeric(childHeight)||childHeight==0) {
							childHeight = child._outerHeight();
						}
						maxHeight = Math.max(maxHeight, childHeight);

						//cache the size of each child component
						boxes.push({
									component : child,
									height : availHeight || undefined,
									width :  childWidth|| undefined
								});
					}

					//the height available to the flexed items
					var availableWidth = Math.max(0,
							(width - nonFlexWidth - paddingVert));

					//temporary variables used in the flex height calculations below
					var remainingWidth = availableWidth, remainingFlex = totalFlex;

					//calculate the height of each flexed item, and the left + top positions of every item
					for (i = 0; i < visibleCount; i++) {
						child = visibleItems[i], opts = child.panel("options");
						childHeight = opts.height;
						childWidth = opts.width;
						calcs = boxes[i];
						childMargins = opts.margins;
						topOffset += childMargins.top;
						topOffset += childMargins.bottom;
					
						if (opts.flex) {
							flexedWidth = Math.ceil((opts.flex / remainingFlex)
									* remainingWidth);
							remainingWidth -= flexedWidth;
							remainingFlex -= opts.flex;
							calcs.width = flexedWidth;
						}
						calcs.dirtySize = true;
						calcs.left = leftOffset;
						calcs.top = topOffset;
						leftOffset+=childMargins.left;
						leftOffset+=childMargins.right;
						leftOffset += calcs.width;
					}
					return {
						boxes : boxes,
						meta : {
							maxHeight : maxHeight
						}
					};
				}
			});
			$.fn.HBoxLayout = function(options, param) {
				var methodReturn = null;
				var $set = this.each(function() {
					var $this = $(this);

					var data = $.data(this, 'HBoxLayout');
					if (!data) {
						var opts = $.extend({}, {
									element : this
								});
						$this.data('HBoxLayout', (data = new HBoxLayout(opts)));
					}
					if (typeof options == 'string') {
						methodReturn = data[options](this, param);

					}
				});
				return (methodReturn === undefined) ? $set : methodReturn;
			}

		});
