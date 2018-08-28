/**
 * 对话框扩展
 */
define(
		[ "app/core/app-jquery", "app/core/app-core", "app/util/app-utils", "app/data/app-ajax",
				"app/widgets/app-widget", "app/widgets/button/app-button"],
		function($, $A, $utils, ajax, Widget) {
			/**
			 * 页签组件
			 */
			var AppTabs = Widget.extend({

				initialize : function(element, option) {
					if (!option) {
						option = {};
					}
					option.element = element;

					AppTabs.superclass.initialize.call(this, option);
					this.element = element;

					// TODO 暂时处理一下，日后改善
					this.option = option;
					/* 初始化找到对应的页签头 */
					var $this = $(element);
					this.element = $this;
					var $header = $this.find(">ul.nav-header");
					if ($header.length > 0) {
						this.$header = $header;
					}
					
					setHeaderButton($header, option);

					var $content = $this.find(">div.tab-content");
					this.$content = $content;

					var $currTab = (function() {
						var $currTab = $content.find(">.tab-pane.active");
						if ($currTab.length == 0) {
							$currTab = $content.find(">.tab-pane:first");
						} else {
							$currTab = $($currTab[0]);
						}
						return $currTab;
					})($this);

					$content.find(">.tab-pane").each(
							function() {
								if (this != $currTab[0]) {
									$(this).addClass("inactive").removeClass(
											"active");
								} else {
									$(this).removeClass("inactive").addClass(
											"active").removeClass("lazy");
								}
							});
					// this.setScroll($currTab);
					var _self = this;
					setTimeout(function() {
						_self.setScroll($currTab);

					}, 100)
					/* 初始化话切换页签事件 */
					var onSwitchTab = $this.attr("beforeSwitchTab");
					if (onSwitchTab) {
						onSwitchTab = $this.getPageJsProperty(onSwitchTab);// 获取页面绑定的js方法对象
						this.on("beforeSwitchTab", onSwitchTab);
					}
					
					var _self = this;
					//if (option.fit == true) {

						$content.find(">.tab-pane").addClass("layout-body");
						this.element.bind("_resize",
										function(event, r, w, h) {
											var mt = $header.css("marginTop")
													.replace('px', '');
											var mb = $header
													.css("marginBottom")
													.replace('px', '');
											h = h - mt - mb;
											if (option.fit == true) {
												$this.outerHeight(h);
												$this.outerWidth(w);
												var th = $header.outerHeight();
												h = h - th;// (th+parseInt(mt)+parseInt(mb));
												$content.outerHeight(h);
												$content.find(">.tab-pane").outerHeight(h);
											}
										
											$content.outerWidth($this.width());
											
											$content.find(">.tab-pane").outerWidth($this.width());
											_self.doLayout();
											if (_self.activateTab){
												_self.setScroll(_self.activateTab);
											}
										});
					//}
					var afterSwitchTab = $this.attr("afterSwitchTab");
					if (afterSwitchTab) {
						afterSwitchTab = $this.getPageJsProperty(afterSwitchTab);// 获取页面绑定的js方法对象
						this.on("afterSwitchTab", afterSwitchTab);
					}
					//this.doLayout();

					/* 在切换后的时间中对页签内容进行懒初始化 
					this.on("afterSwitchTab", function(activeTab) {
						var $pane = e.activeTab;
						if ($pane.is(".lazy")) {
							if ($pane.length > 0) {
								$pane.removeClass("lazy");
								$pane.initPageUI(option);
								$pane.attr("init", true);
							}
						}

						if (afterSwitchTab) {
							afterSwitchTab(e);
						}
					});*/
				},
			doLayout : function() {
				var $this = this.element, $content = this.$content
				var $prev = $content.find(">.tab-pane.active");
				var h = $prev.height();
				var w = $prev.width();

				$prev.children("div.panel:visible,div.app-grid:visible,div.accordion:visible,div.tabs-container:visible,div.layout:visible,div.xquery:visible,div.grid-container:visible,div.ztree-container:visible,div.app-vboxLayout,div.app-hboxLayout,div.datagrid:visible").each(
								function() {
									$(this).triggerHandler("_resize",
											[ true, w, h ]);
								});

			},

			/**
			 * 显示页签
			 */
			show : function($tab) {
				var $this = this.element, $ul = this.$header, $content = this.$content, $tabHead, $prev, $prevHead, e;
				if (!$tab) {
					$tab = $content.find(">.tab-pane:first");
				}
				if (typeof $tab == "string") {
					if ($tab.indexOf("#") != 0) {
						$tab = "#" + $tab;
					}
					$tab = $content.find($tab);
				}
				if ($tab.hasClass('active'))
					return;
				$prev = $content.find(">.tab-pane.active");
				if ($ul) {
					$prevHead = $ul.find(">.active>a");
					$tabHead = $ul.find("a[data-toggle=tab][data-target=#"
							+ $tab.attr("id") + "]");
				}

				e = $.Event('beforeSwitchTab', {
					previousTab : $prev,
					previousHead : $prevHead,
					activeTab : $tab,
					activeHead : $tabHead
				});
				$this.trigger(e);
				if (e.isDefaultPrevented())
					return;
				if ($prevHead) {
					$prevHead.parent("li").removeClass("active");
				}
				if ($tabHead) {
					$tabHead.parent("li").addClass("active");
				}
				var _self=this;
				this.activate($tab, $prev, function() {
					var $pane = $tab;
					if ($pane.is(".lazy")) {
						if ($pane.length > 0) {
							$pane.removeClass("lazy");
							$pane.initPageUI(_self.option);
							$pane.attr("init", true);
						}
					}
					_self.trigger("afterSwitchTab",$prev, $prevHead,$prevHead, $tab, $tabHead);
				});
				this.doLayout();
			},
			setScroll : function(cruTab) {
				var $cur = cruTab

				if (this.option.fit == true) {
					// modify by tw
					// 暂时处理一下，回头让小苏再看看
					// $cur.css("overflow-y","auto");
					// $cur.css("overflow-x","auto");

					if ($cur[0].scrollHeight - $cur[0].offsetHeight > 5) {
						$cur.css("overflow-y", "auto");
					} else {
						$cur.css("overflow-y", "hide");

					}
					if ($cur[0].scrollWidth - $cur[0].offsetWidth > 5) {
						$cur.css("overflow-x", "auto");
					} else {
						$cur.css("overflow-x", "hide");

					}

				}
			}
			/**
			 * 激活
			 */
			,
			activate : function($cur, $pre, callback) {
				var transition = callback && $.support.transition
						&& $pre.hasClass('fade');
				function next() {
					$pre.removeClass('active').addClass('inactive');
					$cur.addClass('active').removeClass('inactive');
					if (transition) {
						$cur[0].offsetWidth;// reflow for transition
						$cur.addClass('in');
					} else {
						$cur.removeClass('fade');
					}
					callback && callback();
				}
				transition ? $active.one($.support.transition.end, next)
						: next();
				$pre.removeClass('in');
				// this.setScroll($cur);

				// this.setScroll($currTab);
				var _self = this;
				this.activateTab=$cur;
				setTimeout(function() {
					_self.setScroll($cur);

				}, 100)

			},
			getCurrPane : function() {
				var $panel = this.$content.find(">.tab-pane.active");
				return $panel;
			}
			});

			
			/**
			 * 页签定义
			 */
	
			$.fn.appTabs = function(option, param) {
				var result = undefined;
				var $this = $(this).each(
						function() {
							var $this = $(this), data = $this.data('appTabs');
							if (!data) {
								
								option = $.extend($this.parseOptions(this, [{
									fit : "boolean"
								}]), option);
							}
							if (!data)
								$this.data('appTabs', (data = new AppTabs(this,
										option)));
							if (typeof option == 'string') {
								result = data[option](param);
							}
						});
				if (result !== undefined) {
					return result;
				}
				return $this;
			};

			/* TAB DATA-API
			 * ============ */
			$(document).on(
					'click.tab.data-api',
					'[data-toggle="tab"], [data-toggle="pill"]',
					function(e) {
						e.preventDefault();
						var selector = $(this).attr('data-target');
						if (!selector)
							return;
						if (!selector) {
							selector = $this.attr('href');
							selector = selector
									&& selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
						}
						var $target = $A(selector);
						if ($target.length == 0)
							return;
						var $appTabs = $target.parent(".tab-content").parent();
						if ($appTabs.length == 0)
							return;
						$appTabs.appTabs('show', $target);
					});
			return $;
			/**
			 * 生成按钮区
			 */
			function setHeaderButton($header, option){
				var btns = option.buttons;
				if(btns){
					$header.wrap('<div class="tabs-header" />');
					var $wrap = $header.parent();
					$wrap.append(createButton(btns));
				}
			}
			function createButton(btns){
				var $btnarea = $('<div class="tabs-header-btns"></div>');
				for(var i = 0; i < btns.length; i++){
					var btn = btns[i];
					var $btn = $('<a class="app-button" title="' + btn.tips + '">' + btn.text+ '</a>')
					$btnarea.append($btn);
					$btn.button(btn);
				}
				return $btnarea;
			}
		});