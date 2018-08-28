define(["app/core/app-jquery","app/core/app-core"],function($,App){
	$.fn.drager = function(options){
		if (typeof options == 'string') {
			if (options == 'destroy') 
				return this.each(function(){
					$(this).unbind('mousedown', App.dragTool.start);
					$.data(this, 'app/widgets/drag/app-dragdata', null);
				});
		}
		return this.each(function(){
			var el = $(this);
			$.data(App.dragTool, 'app/widgets/drag/app-dragdata', {
				options: $.extend({
					el: el,
					obj: el
				}, options)
			});
			if (options.event) 
				App.dragTool.start(options.event);
			else {
				var select = options.selector;
				$(select, obj).bind('mousedown', App.dragTool.start);
			}
		});
	};
	App.dragTool = {
		start: function(e){
			document.onselectstart=function(e){return false};//禁止选择

			var data = $.data(this, 'app/widgets/drag/app-dragdata');
			var el = data.options.el[0];
			$.data(el, 'app/widgets/drag/app-dragdata', {
				options: data.options
			});
			if (!App.dragTool.current) {
				App.dragTool.current = {
					el: el,
					oleft: parseInt(el.style.left) || 0,
					otop: parseInt(el.style.top) || 0,
					ox: e.pageX || e.screenX,
					oy: e.pageY || e.screenY
				};
				$(document).bind("mouseup", App.dragTool.stop).bind("mousemove", App.dragTool.drag);
			}
		},
		drag: function(e){
			if (!e)  var e = window.event;
			var current = App.dragTool.current;
			var data = $.data(current.el, 'app/widgets/drag/app-dragdata');
			var left = (current.oleft + (e.pageX || e.clientX) - current.ox);
			var top = (current.otop + (e.pageY || e.clientY) - current.oy);
			if (top < 1) top = 0;
			if (data.options.move == 'horizontal') {
				if ((data.options.minW && left >= $(data.options.obj).cssNum("left") + data.options.minW) && (data.options.maxW && left <= $(data.options.obj).cssNum("left") + data.options.maxW)) 
					current.el.style.left = left + 'px';
				else if (data.options.scop) {
					if (data.options.relObj) {
						if ((left - parseInt(data.options.relObj.style.left)) > data.options.cellMinW) {
							current.el.style.left = left + 'px';
						}
					} else 
						current.el.style.left = left + 'px';
				}
			} else if (data.options.move == 'vertical') {
					current.el.style.top = top + 'px';
			} else {
				var selector = data.options.selector ? $(data.options.selector, data.options.obj) : $(data.options.obj);
				if (left >= -selector.outerWidth() * 2 / 3 && top >= 0 && (left + selector.outerWidth() / 3 < $(window).width()) && (top + selector.outerHeight() < $(window).height())) {
					current.el.style.left = left + 'px';
					current.el.style.top = top + 'px';
				}
			}
			
			if (data.options.drag) {
				data.options.drag.apply(current.el, [current.el]);
			}
			
			return App.dragTool.preventEvent(e);
		},
		stop: function(e){
			var current = App.dragTool.current;
			var data = $.data(current.el, 'app/widgets/drag/app-dragdata');
			$(document).unbind('mousemove', App.dragTool.drag).unbind('mouseup', App.dragTool.stop);
			if (data.options.stop) {
				data.options.stop.apply(current.el, [current.el]);
			}
			App.dragTool.current = null;

			document.onselectstart=function(e){return true};//启用选择
			return App.dragTool.preventEvent(e);
		},
		preventEvent:function(e){
			if (e.stopPropagation) e.stopPropagation();
			if (e.preventDefault) e.preventDefault();
			return false;			
		}
	};
	return App.dragTool;
});
