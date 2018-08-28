/**
 * 按钮控件
 * 
 * @author sjq
 */
define(["app/core/app-jquery", "app/core/app-core", "app/core/app-options","app/widgets/app-widget"], function($, $A,
		Options,Widget) {
    /**
     *
     * @class
     * @extends Widget
     * @classdesc 按钮控件。
     * @name Button
     * @example
     * //html
     *  //<a class="app-button" id="btn1">btn1</a>
     * //javascript
     *  //var btn1=$("#btn1").button({})
     *
     */
	var Button = Widget.extend({
				initialize : function(options) {
					if (!options) {
						options = {};
					}
					Button.superclass.initialize.call(this, options);
					this.attrs=$.extend({},
										Options.appDefaults.Button, 
										this.parseOptions(),options);
					/*$.data(el, "linkbutton", {
								options : $.extend({},
										Options.appDefaults.Button, options,
										this.parseOptions())
							});*/
				  this.createButton();

				},
				parseOptions : function() {
					var t = $(this.element);
					return $.extend({}, t.parseOptions(this.element, ["id",
											"iconCls", "iconAlign", "group", {
												plain : "boolean",
												toggle : "boolean",
												selected : "boolean"
											}]), {
								disabled : (t.attr("disabled")
										? true
										: undefined),
								text : $.trim(t.html()),
								iconCls : (t.attr("icon") || t.attr("iconCls"))
							});
				},
				createButton : function() {
					var _self=this;
					var opts =this.attrs;
					var target=this.element
					var t = $(target).empty();
					t.addClass('l-btn').removeClass('l-btn-plain l-btn-selected l-btn-plain-selected');
					t.removeClass('l-btn-small l-btn-medium l-btn-large').addClass('l-btn-' + opts.size);
					if (opts.plain) {
						t.addClass('l-btn-plain')
					}
					if (opts.selected) {
						t.addClass(opts.plain
								? 'l-btn-selected l-btn-plain-selected'
								: 'l-btn-selected');
					}
                    opts.iconCls&&t.addClass(opts.iconCls+'-icon');
                    if (opts.disabled) {
						$(target).attr("disabled", opts.disabled);
					}
					t.attr('group', opts.group || '');
					t.attr('id', opts.id || '');

					var inner = $('<span class="l-btn-left"></span>')
							.appendTo(t);
					if (opts.text) {
						$('<span class="l-btn-text"></span>').html(opts.text)
								.appendTo(inner);
					} else {
						$('<span class="l-btn-text l-btn-empty">&nbsp;</span>')
								.appendTo(inner);
					}
					if (opts.iconCls) {
						$('<i class="l-btn-icon">&nbsp;</i>')
								.addClass(opts.iconCls).appendTo(inner);
						inner.addClass('l-btn-icon-' + opts.iconAlign);
					}
					if (opts.onClick) {
						_self.on("click",opts.onClick,target);
					}
					t.unbind('.linkbutton').bind('focus.linkbutton',
							function() {
								if (!opts.disabled) {
									$(this).addClass('l-btn-focus');
								}
							}).bind('blur.linkbutton', function() {
								$(this).removeClass('l-btn-focus');
							}).bind('click.linkbutton', function() {
						if (!opts.disabled) {
							if (opts.toggle) {
								if (opts.selected) {
									$(this).linkbutton('unselect');
								} else {
									$(this).linkbutton('select');
								}
							}

							_self.trigger("click");
						}
							// return false;
						});

					this._setSelected(opts.selected)
					this._setDisabled(opts.disabled);
				},
				options : function() {
					return this.attrs;
				},
				_setDisabled : function(disabled) {
					var target=this.element;
					var opts =this.attrs;
					$(target)
							.removeClass("l-btn-disabled l-btn-plain-disabled");
					if (disabled) {
						opts.disabled = true;
						var href = $(target).attr("href");
						if (href) {
							this.href = href;
							$(target).attr("href", "javascript:void(0)");
						}
						/*if (target.onclick) {
							this.onclick = target.onclick;
							target.onclick = null;
						}*/
						opts.plain
								? $(target)
										.addClass("l-btn-disabled l-btn-plain-disabled")
								: $(target).addClass("l-btn-disabled");
					} else {
						opts.disabled = false;
						if (this.href) {
							$(target).attr("href", this.href);
						}
					/*	if (this.onclick) {
							target.onclick = this.onclick;
						};
					};*/
					$(target).attr("disabled", opts.disabled);
				}},
                /**
                 * 启用按钮
                 * @memberof Button
                 * @example
                 * // html <a class="app-button" id="btn1">btn1</a>
                 * //$("#btn1").button("enable");
                 */
				enable : function(jq) {
					this._setDisabled(false);
				},
                /**
                 * 禁用按钮
                 * @memberof Button
                 * @example
                 * // html <a class="app-button" id="btn1">btn1</a>
                 * //$("#btn1").button("disable");
                 */
				disable : function(jq) {
					this._setDisabled(true);
				},
                /**
                 * 选中按钮，当设置group有效
                 * @memberof Button
                 * @example
                 * // html <a class="app-button" id="btn1">btn1</a>
                 * //$("#btn1").button("select");
                 */
				select : function() {
					 this._setSelected(true);
				
				},
                /**
                 *
                 * 取消按钮选中，当设置group有效
                 * @memberof Button
                 * @example
                 * // html <a class="app-button" id="btn1">btn1</a>
                 * //$("#btn1").button("select");
                 */
				unselect : function() {
					this._setSelected(this, false);
				},
				
				_setSelected : function(selected) {
					var opts = this.attrs;
					var target=this.element;
					if (selected) {
						if (opts.group) {
							$('a.l-btn[group="' + opts.group + '"]').each(
									function() {
										var o = $(this).linkbutton('options');
										if (o.toggle) {
											$(this)
													.removeClass('l-btn-selected l-btn-plain-selected');
											o.selected = false;
										}
									});
						}
						$(target).addClass(opts.plain
								? 'l-btn-selected l-btn-plain-selected'
								: 'l-btn-selected');
						opts.selected = true;
					} else {
						if (!opts.group) {
							$(target)
									.removeClass('l-btn-selected l-btn-plain-selected');
							opts.selected = false;
						}
					}
				}
			});

	$.fn.button = function(option, param) {
		var methodReturn = undefined;
	
		var $set = this.each(function() {
					var $this = $(this);
					var data = $this.data('button');
					var state = $this.data('linkbutton');
					var options = typeof option === 'object' && option;
					if (!data) {
						options=$.extend(options,{element:this});
						$this.data('button', (data = new Button(options)));
						
						$(this).removeAttr('disabled');
						/*$(this).bind('_resize', function(e, force) {
									if ($(this).hasClass('app-fluid')
											|| force) {
										data.setSize(this);
									}
									return false;
								});*/
						
					} else {
						$.extend(data.attrs, options);
					}
					if (typeof option === 'string')
						methodReturn = data[option]($this,param);
				});
		return (methodReturn === undefined) ? $set : methodReturn;

	};

	$.fn.button.Constructor = Button;
	return Button;

});