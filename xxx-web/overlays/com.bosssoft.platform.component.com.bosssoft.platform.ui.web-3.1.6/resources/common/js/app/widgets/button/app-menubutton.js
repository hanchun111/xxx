/**
 * 按钮控件
 * 
 * @author sjq
 */
define(["app/core/app-jquery", "app/core/app-core", "app/core/app-options", "app/widgets/menu/app-menu", "app/widgets/button/app-button"], function($, $A,
		Options,Menu,Button) {
	/**
	 * @class
	 * @name MenuButton
	 * @classdesc 下拉按钮
	 * @extends Button
	 * 
	 */
	var MenuButton = Button.extend({
				initialize : function(options) {
					if (!options) {
						options = {};
					}
					Button.superclass.initialize.call(this, options);
					this.attrs= $.extend({},
										Options.appDefaults.MenuButton,
										options, this.parseOptions());
				   this.init();
				},
				parseOptions : function() {
					var t = $(this.element);
					return $.extend({}, t.parseOptions(this.element, {
								disabled : $(this).attr('disabled') == 'true',
								plain : ($(this).attr('plain') == 'false'
										? false
										: true),
								menu : $(this).attr('menu'),
								duration : (parseInt($(this).attr('duration')) || 100)
							}));
				},
				/**
				 * 初始化
				 */
				init : function() {
					var target=this.element;
					var opts = this.attrs;
					if (typeof opts.menu=="string"){
						if (opts.menu && opts.menu.indexOf("#") < 0) {
							opts.menu = "#" + opts.menu;
						}
					}
					var _slef = this;
					var btn = $(target);
					btn.removeClass('m-btn-active m-btn-plain-active').addClass("m-btn");
					btn.button(opts);
					var txtcon = btn.find(".l-btn-left");
		$("<span></span>").addClass("m-btn-downarrow").appendTo(txtcon);
		$("<span></span>").addClass("m-btn-line").appendTo(txtcon);
					if (opts.menu) {
						$(opts.menu).menu({
							onShow : function() {
								btn.addClass((opts.plain == true)
										? 'm-btn-plain-active'
										: 'm-btn-active');
							},
							onHide : function() {
								btn.removeClass((opts.plain == true)
										? 'm-btn-plain-active'
										: 'm-btn-active');
							}
						});
					};
					btn.unbind('.menubutton');
					if (opts.menu) {
						btn.bind('click.menubutton', function() {
									if (!getButtonState()) {
										showMenu();
										return false;
									}
								});
						var timeout = null;
						btn.bind('mouseenter.menubutton', function() {

									if (!getButtonState()) {
										timeout = setTimeout(function() {
													showMenu();
												}, opts.duration);
										return false;
									}
								}).bind('mouseleave.menubutton', function() {
									if (timeout) {
										clearTimeout(timeout);
									}
									$(opts.menu).triggerHandler("mouseleave");
								});
					}

					function showMenu() {
						var left = btn.offset().left;
						if (left + $(opts.menu).outerWidth() + 5 > $(window)
								.width()) {
							left = $(window).width()
									- $(opts.menu).outerWidth() - 5;
						}

						$('.menu-top').menu('hide');
						$(opts.menu).menu('show', {
									alignTo : btn,
									autoWidth : true,
									menuAlign : opts.menuAlign
								});
						btn.blur();
					};

					function getButtonState() {
						return $(target).button("options").disabled;
					};
				},
				_setDisabled : function(target, disabled) {
					var opts = this.attrs;
					var target=this.element;
					// $(target).removeClass("l-btn-disabled
					// l-btn-plain-disabled");
					if (disabled) {
						opts.disabled = true;
						$(target).button("disable");
					} else {
						opts.disabled = false;
						$(target).enable("enable");
					}
				},
				/**
				 * 启用
				 * @memberof Button
				 */
				enable : function(jq) {
					this._setDisabled(false);
				},
				/**
				 * 禁用
				 * @memberof Button
				 */
				disable : function(jq) {
					this._setDisabled( true);
				},
				destroy:function () {
					var opts = this.attrs;
					opts.menu&&$(opts.menu).length&&$(opts.menu).data('menuObj').destroy();
				}
			});


	$.fn.menubutton = function(option) {
		var methodReturn = undefined;
		var $set = this.each(function() {
					var $this = $(this);
					var data = $this.data('menubuttonObj'), state = $this
							.data('menubutton');
					var options = typeof option === 'object' ?option:{};
					if (data) {
						$.extend(data.attrs, options);
					} else {
						options=$.extend({},options,{"element":this});
						$this.data('menubuttonObj', (data = new MenuButton(options)));
						$(this).removeAttr('disabled');
					}
					if (typeof option === 'string')
						methodReturn = data[option]($this);

				});
		return (methodReturn === undefined) ? $set : methodReturn;

	};

	return MenuButton;
});