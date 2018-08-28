/**
 * 按钮控件
 * 
 * @author sjq
 */
define(["app/core/app-jquery", "app/core/app-core", "app/core/app-options","app/widgets/app-widget"], function($, $A,
		Options,Widget) {
	var Menu = Widget.extend({
		initialize : function(el, options) {
			Menu.superclass.initialize.call(this, options);
			if (!options) {
				options = {};
			};
            this.element = el;
			$.data(el, "menu", {
						options : $.extend({}, Options.appDefaults.Menu,
								options, this.parseOptions(el))
					});

		},
		/**
		 * 转换
		 */
		parseOptions : function(target) {
			var t = $(target);
			return $.extend({}, t.parseOptions(target, [{
										minWidth : 'number',
										duration : 'number',
										hideOnUnhover : 'boolean'
									}]));
		},
		init : function(target) {
			var _self = this;
			// console.log($A)
			// $(target).appendTo('body');
			$(target).addClass('menu-top'); // the top menu

			$(document).unbind('.menu').bind('mousedown.menu', function(e) {
						// var allMenu = $('body>div.menu:visible');
						// var m = $(e.target).closest('div.menu', allMenu);
						var m = $(e.target).closest('div.menu,div.combo-p');
						if (m.length) {
							return
						}
						$('body>div.menu-top:visible').menu('hide');
					});

			var menus = splitMenu($(target));
			for (var i = 0; i < menus.length; i++) {
				createMenu(menus[i]);
			}

			function splitMenu(menu) {
				var menus = [];
				menu.addClass('menu');
				menus.push(menu);
				if (!menu.hasClass('menu-content')) {
					menu.children('div').each(function() {
								var submenu = $(this).children('div');
								if (submenu.length) {
									submenu.insertAfter(target);
									this.submenu = submenu; // point to the sub
									// menu
									var mm = splitMenu(submenu);
									menus = menus.concat(mm);
								}
							});
				}
				return menus;
			}

			function createMenu(menu) {
				//TODO 暂时丢appPanelContainer里面，后续优化
				menu.appendTo($A.getContainer());
				var wh = $(menu).parseOptions(menu[0], ['width', 'height']);
				menu[0].originalHeight = wh.height || 0;
				if (menu.hasClass('menu-content')) {
					menu[0].originalWidth = wh.width || menu._outerWidth();
				} else {
					menu[0].originalWidth = wh.width || 0;
					menu.children('div').each(function() {
						var item = $(this);
						var itemOpts = $.extend({}, item.parseOptions(this, [
												'name', 'iconCls', 'href', {
													separator : 'boolean'
												}]), {
									disabled : (item.attr('disabled')
											? true
											: undefined)
								});
						if (itemOpts.separator) {
							item.addClass('menu-sep');
						}
						if (!item.hasClass('menu-sep')) {
							item[0].itemName = itemOpts.name || '';
							item[0].itemHref = itemOpts.href || '';

							var text = item.addClass('menu-item').html();
							item.empty()
									.append($('<div class="menu-text"></div>')
											.html(text));
							if (itemOpts.iconCls) {
								$('<div class="menu-icon"></div>')
										.addClass(itemOpts.iconCls)
										.appendTo(item);
							}
if (!itemOpts.iconCls){
	item.addClass("menu-item-noico")
}
							if (itemOpts.disabled) {
								_self._setDisabled(target, item[0], true);
							}
							// if (itemOpts.height){
							// item.height(itemOpts.height);
							// }
							if (item[0].submenu) {
								$('<div class="menu-rightarrow"></div>')
										.appendTo(item); // has sub menu
							}

							_self.bindMenuItemEvent(target, item);
						}
					});
					$('<div class="menu-line"></div>').prependTo(menu);
				}
				_self._setMenuSize(target, menu);
				menu.hide();

				_self.bindMenuEvent(target, menu);
			}
		},
		_setMenuSize : function(target, menu) {
			if (target.length&&target.length>0){
				target=target[0];
			}
			var opts = $.data(target, 'menu').options;
			var style = menu.attr('style') || '';
			menu.css({
						display : 'block',
						left : -10000,
						height : 'auto',
						width:'auto',
						overflow : 'hidden'
					});

			var el = menu[0];
			var width = el.originalWidth || 0;

			if (!width) {
				width = 0;
				menu.find('div.menu-text').each(function() {
					//console.log( $(this)._outerWidth())
					if (width < $(this)._outerWidth()) {
						width = $(this)._outerWidth();
					}
					$(this).closest('div.menu-item')._outerHeight($(this)
							._outerHeight()
							+ 2);
				});
			width += 12;
			}

			width = Math.max(width, opts.minWidth);
			// var height = el.originalHeight || menu.outerHeight();
			var height = el.originalHeight || 0;
			if (!height) {
				height = menu.outerHeight();

				if (menu.hasClass('menu-top') && opts.alignTo) {
					var at = $(opts.alignTo);
					var h1 = at.offset().top - $(document).scrollTop();
					var h2 = $(window)._outerHeight() + $(document).scrollTop()
							- at.offset().top - at._outerHeight();
					height = Math.min(height, Math.max(h1, h2));
				} else if (height > $(window)._outerHeight()) {
					height = $(window).height();
					style += ';overflow:auto';
				} else {
					style += ';overflow:hidden';
				}

				// if (height > $(window).height()-5){
				// height = $(window).height()-5;
				// style += ';overflow:auto';
				// } else {
				// style += ';overflow:hidden';
				// }
			}
			var lineHeight = Math.max(el.originalHeight, menu.outerHeight())
					- 2;
			menu._outerWidth(width)._outerHeight(height);
			menu.children('div.menu-line')._outerHeight(lineHeight);

			style += ';width:' + el.style.width + ';height:' + el.style.height;

			menu.attr('style', style);
		},

		/**
		 * bind menu event
		 */
		bindMenuEvent : function(target, menu) {
			var state = $(target).data('menu');
			var _self = this;
			menu.unbind('.menu').bind('mouseenter.menu', function() {
						if (state.timer) {
							clearTimeout(state.timer);
							state.timer = null;
						}
					}).bind('mouseleave.menu', function() {
						if (state.options.hideOnUnhover) {
							state.timer = setTimeout(function() {
										_self._hideAll(target);
									}, state.options.duration);
						}
					});
		},

		/**
		 * bind menu item event
		 */
		bindMenuItemEvent : function(target, item) {
			if (!item.hasClass('menu-item')) {
				return
			}
			var _self = this;
			item.unbind('.menu');
			item.bind('click.menu', function() {
						if ($(this).hasClass('menu-item-disabled')) {
							return;
						}
						// only the sub menu clicked can hide all menus
						if (!this.submenu) {
							_self._hideAll(target);
							var href = this.itemHref;
							if (href) {
								location.href = href;
							}
						}
						var item = $(target).menu('getItem', this);
						$.data(target, 'menu').options.onClick.call(target,
								item);
					}).bind('mouseenter.menu', function(e) {
						// hide other menu
						item.siblings().each(function() {
									if (this.submenu) {
										_self._hideMenu(this.submenu);
									}
									$(this).removeClass('menu-active');
								});
						// show this menu
						item.addClass('menu-active');

						if ($(this).hasClass('menu-item-disabled')) {
							item.addClass('menu-active-disabled');
							return;
						}

						var submenu = item[0].submenu;

						if (submenu) {
							$(target).menu('show', {
										menu : submenu,
										parent : item
									});
						}
					}).bind('mouseleave.menu', function(e) {
						item.removeClass('menu-active menu-active-disabled');
						var submenu = item[0].submenu;
						if (submenu) {
							
							if (e.pageX >= parseInt(submenu.css('left'))) {
								item.addClass('menu-active');
							} else {
								_self._hideMenu(submenu);
							}

						} else {
							item.removeClass('menu-active');
						}
					});
		},

		/**
		 * hide top menu and it's all sub menus
		 */
		_hideAll : function(target) {
			var state = $.data(target, 'menu');
			if (state) {
				if ($(target).is(':visible')) {
					this._hideMenu($(target));
					state.options.onHide.call(target);
				}
			}
			return false;
		},

		/**
		 * show the menu, the 'param' object has one or more properties: left:
		 * the left position to display top: the top position to display menu:
		 * the menu to display, if not defined, the 'target menu' is used
		 * parent: the parent menu item to align to alignTo: the element object
		 * to align to
		 */
		_showMenu : function(target, param) {
			var left, top;
			param = param || {};
			var menu = $(param.menu || target);
			if (param.alignTo && param.autoWidth) {
				var at = $(param.alignTo);
				$(target).menu('setSize', {
							width : at.width()
						});

			}
			$(target).menu('resize', menu[0]);
			if (menu.hasClass('menu-top')) {
				var opts = $.data(target, 'menu').options;
				$.extend(opts, param);
				left = opts.left;
				top = opts.top;
				if (opts.alignTo) {
					var at = $(opts.alignTo);
					var pos;
					if (menu.parent()[0]==at.parent()[0]){
						pos = at.position();
					}else{
						pos = at.offset();
					}
					

					left = pos.left;
					top = pos.top + at._outerHeight();
					if (opts.align == 'right') {
						left += at.outerWidth() - menu.outerWidth();
					}
				}
				if (left + menu.outerWidth() > $(window)._outerWidth()
						+ $(document)._scrollLeft()) {
					left = $(window)._outerWidth() + $(document).scrollLeft()
							- menu.outerWidth() - 5;
				}
				if (left < 0) {
					left = 0;
				}
				top = _fixTop(top, opts.alignTo);
			} else {

				var parent = param.parent; // the parent menu item
				// console.log(parent.offset())
				left = parent.offset().left + parent.outerWidth() - 2;
				if (left + menu.outerWidth() + 5 > $(window)._outerWidth()
						+ $(document).scrollLeft()) {
					left = parent.offset().left - menu.outerWidth() + 2;
				}
				top = _fixTop(parent.position().top - 3);
			}

			function _fixTop(top, alignTo) {
				if (top + menu.outerHeight() > $(window)._outerHeight()
						+ $(document).scrollTop()) {
					if (alignTo) {
						top = $(alignTo).offset().top - menu._outerHeight();
					} else {
						top = $(window)._outerHeight()
								+ $(document).scrollTop() - menu.outerHeight();
					}
				}
				if (top < 0) {
					top = 0;
				}
				return top;
			}

			menu.css({
						left : left,
						top : top
					});
			menu.show(0, function() {
						if (!menu[0].shadow) {
							menu[0].shadow = $('<div class="menu-shadow"></div>')
									.insertAfter(menu);
						}
						menu[0].shadow.css({
									display : 'block',
									zIndex : Options.appDefaults.Menu.zIndex++,
									left : menu.css('left'),
									top : menu.css('top'),
									width : menu.outerWidth(),
									height : menu.outerHeight()
								});
						menu.css('z-index', Options.appDefaults.Menu.zIndex++);
						if (menu.hasClass('menu-top')) {
							$.data(menu[0], 'menu').options.onShow
									.call(menu[0]);
						}
					});
		},
		hide : function(jq) {
			var _slef = this;
			return jq.each(function() {
						_slef._hideAll(this);
					});
		},
		_hideMenu : function(menu) {
			var _self = this;
			if (!menu)
				return;

			hideit(menu);
			menu.find('div.menu-item').each(function() {
						if (this.submenu) {
							_self._hideMenu(this.submenu);
						}
						$(this).removeClass('menu-active');
					});

			function hideit(m) {
				m.stop(true, true);
				if (m[0].shadow) {
					m[0].shadow.hide();
				}
				m.hide();
			}
		},

		show : function(jq, pos) {
			var _self = this;
			return jq.each(function() {
						_self._showMenu(this, pos);
					});
		},
		resize : function(jq, menuEl) {
			var _self = this;
			return jq.each(function() {
						_self._setMenuSize(this, $(menuEl));
					});
		},
		findItem : function(target, text) {
			var result = null;
			var tmp = $('<div></div>');
			function find(menu) {
				menu.children('div.menu-item').each(function() {
							var item = $(target).menu('getItem', this);
							var s = tmp.empty().html(item.text).text();
							if (text == $.trim(s)) {
								result = item;
							} else if (this.submenu && !result) {
								find(this.submenu);
							}
						});
			}
			find($(target));
			tmp.remove();
			return result;
		},
		_setDisabled : function(target, itemEl, disabled) {
			var t = $(itemEl);
			if (!t.hasClass('menu-item')) {
				return
			}

			if (disabled) {
				t.addClass('menu-item-disabled');
				if (itemEl.onclick) {
					itemEl.onclick1 = itemEl.onclick;
					itemEl.onclick = null;
				}
			} else {
				t.removeClass('menu-item-disabled');
				if (itemEl.onclick1) {
					itemEl.onclick = itemEl.onclick1;
					itemEl.onclick1 = null;
				}
			}
		},

		appendItem : function(target, param) {
			var menu = $(target);
			if (param.parent) {
				if (!param.parent.submenu) {
					var submenu = $('<div class="menu"><div class="menu-line"></div></div>')
							.appendTo('body');
					submenu.hide();
					param.parent.submenu = submenu;
					$('<div class="menu-rightarrow"></div>')
							.appendTo(param.parent);
				}
				menu = param.parent.submenu;
			}
			if (param.separator) {
				var item = $('<div class="menu-sep"></div>').appendTo(menu);
			} else {
				var item = $('<div class="menu-item"></div>').appendTo(menu);
				$('<div class="menu-text"></div>').html(param.text)
						.appendTo(item);
			}
			if (param.iconCls)
				$('<div class="menu-icon"></div>').addClass(param.iconCls)
						.appendTo(item);
			if (param.id)
				item.attr('id', param.id);
			if (param.name) {
				item[0].itemName = param.name
			}
			if (param.href) {
				item[0].itemHref = param.href
			}
			if (param.onclick) {
				if (typeof param.onclick == 'string') {
					item.attr('onclick', param.onclick);
				} else {
					item[0].onclick = eval(param.onclick);
				}
			}
			if (param.handler) {
				item[0].onclick = eval(param.handler)
			}
			if (param.disabled) {
				this._setDisabled(target, item[0], true)
			}

			this.bindMenuItemEvent(target, item);
			this.bindMenuEvent(target, menu);
			this._setMenuSize(target, menu);
		},
		removeItem : function(target, itemEl) {
			function removeit(el) {
				if (el.submenu) {
					el.submenu.children('div.menu-item').each(function() {
								removeit(this);
							});
					var shadow = el.submenu[0].shadow;
					if (shadow)
						shadow.remove();
					el.submenu.remove();
				}
				$(el).remove();
			}
			var menu = $(itemEl).parent();
			removeit(itemEl);
            this._setMenuSize(target, menu);
		},
		options:function(target){
				var opts = $(target).data('menu').options;
				return opts;
		},

		_setVisible : function(target, itemEl, visible) {
			var menu = $(itemEl).parent();
			if (visible) {
				$(itemEl).show();
			} else {
				$(itemEl).hide();
			}
			this._setMenuSize(target, menu);
		},

		destroy : function(target) {
			var _slef = this;
            this._destroyMenu(_slef.element);
		},
		_destroyMenu : function(target) {
			var _self=this;
			$(target).children('div.menu-item').each(function() {
						_self.removeItem(target, this);
					});
			if (target.shadow)
				target.shadow.remove();
			$(target).remove();
		},
		setText : function(jq, param) {
			return jq.each(function() {
						$(param.target).children('div.menu-text')
								.html(param.text);
					});
		},
/**
 * set the menu icon class param: { target: DOM object, indicate the menu item
 * iconCls: the menu item icon class }
 */
		setIcon : function(jq, param) {
			return jq.each(function() {
						$(param.target).children('div.menu-icon').remove();
						if (param.iconCls) {
							$('<div class="menu-icon"></div>')
									.addClass(param.iconCls)
									.appendTo(param.target);
						}
					});
		},
/**
 * get the menu item data that contains the following property: { target: DOM
 * object, the menu item id: the menu id text: the menu item text iconCls: the
 * icon class href: a remote address to redirect to onclick: a function to be
 * called when the item is clicked }
 */
		getItem : function(jq, itemEl) {
			var t = $(itemEl);
			var item = {
				target : itemEl,
				id : t.attr('id'),
				text : $.trim(t.children('div.menu-text').html()),
				disabled : t.hasClass('menu-item-disabled'),
				// href: t.attr('href'),
				// name: t.attr('name'),
				name : itemEl.itemName,
				href : itemEl.itemHref,
				onclick : itemEl.onclick
			};
			var icon = t.children('div.menu-icon');
			if (icon.length) {
				var cc = [];
				var aa = icon.attr('class').split(' ');
				for (var i = 0; i < aa.length; i++) {
					if (aa[i] != 'menu-icon') {
						cc.push(aa[i]);
					}
				}
				item.iconCls = cc.join(' ');
			}
			return item;
		},
		enableItem : function(jq, itemEl) {
			var _slef = this;
			return jq.each(function() {
						_slef._setDisabled(this, itemEl, false);
					});
		},
		disableItem : function(jq, itemEl) {
			var _slef = this;
			return jq.each(function() {
						_slef._setDisabled(this, itemEl, true);
					});
		},
		showItem : function(jq, itemEl) {
			var _slef = this;
			return jq.each(function() {
						_slef._setVisible(this, itemEl, true);
					});
		},
		hideItem : function(jq, itemEl) {
			var _slef = this;
			return jq.each(function() {
						_slef._setVisible(this, itemEl, false);
					});
		},
		_setSize : function(target, param) {

			var opts = $.data(target, 'menu').options;

			if (param) {
				if (param.width)
					opts.width = param.width;
				if (param.height)
					opts.height = param.height;
			}
			if (opts.width) {
				$(target).outerWidth(opts.width);
			}
			if (opts.height) {
				$(target).outerHeight(opts.height);
			}
			//$(target).menu('resize', menu[0]);

		},
		setSize : function(jq, param) {
			var _slef = this;
			return jq.each(function() {

						_slef._setSize(this, param);
					});
		}
	});

	
	$.fn.menu = function(option, param){
		var methodReturn = undefined;
		var $set = this.each(function() {
					var $this = $(this);
					var data = $this.data('menuObj'),state = $this.data('menu');
					var options = typeof option === 'object' && option;
					if (!state){
						$this.data('menuObj', (data = new Menu(this,options)));	
						data.init(this);
					}else{
						$.extend(state.options, options);
						
					}
					
					if (typeof option === 'string')
						methodReturn = data[option]($this,param);
				});
		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.menu.Constructor = Menu;
	return Menu;
});