define(["app/core/app-jquery", "app/core/app-core", "app/widgets/app-widget"], function($, $A,
				Widget) {
			ContainerLayout = Widget.extend({
						parseMargins : function(v) {
							if ($.isNumeric(v)) {
								v = v.toString();
							}
							var ms = v.split(' '), len = ms.length;

							if (len == 1) {
								ms[1] = ms[2] = ms[3] = ms[0];
							} else if (len == 2) {
								ms[2] = ms[0];
								ms[3] = ms[1];
							} else if (len == 3) {
								ms[3] = ms[1];
							}

							return {
								top : parseInt(ms[0], 10) || 0,
								right : parseInt(ms[1], 10) || 0,
								bottom : parseInt(ms[2], 10) || 0,
								left : parseInt(ms[3], 10) || 0
							};
						},
						getPadding : function(target) {
							var padding = [];
							$.map(	["padding-top", "padding-right",
											"padding-bottom", "padding-left"],
									function(p) {
										var pv = $.trim(target.style[p] || '0');
										if (pv) {
											if (pv.indexOf('%') == -1) {
												pv = parseInt(pv) || 0;
											}
											padding.push(pv);
										}
									});
							return this.parseMargins(padding.join(" "));
						},
						getMargins : function(target) {
							var margins = [];
							$.map(	["margin-top", "margin-right",
											"margin-bottom", "margin-left"],
									function(p) {
										var pv = $.trim(target.style[p] || '0');
										if (pv) {
											if (pv.indexOf('%') == -1) {
												pv = parseInt(pv) || 0;
											}
											margins.push(pv);
										}

									});
							return this.parseMargins(margins.join(" "));
						}
					});
			return ContainerLayout;

		});