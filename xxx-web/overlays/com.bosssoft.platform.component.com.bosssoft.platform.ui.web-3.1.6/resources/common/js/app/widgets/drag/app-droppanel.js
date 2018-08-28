/**
 * 下拉面板的工具类
 * @author Mr.T
 */
define(['app/core/app-jquery', 'app/core/app-core', 'app/core/app-options', 'app/core/app-class'],
		function($, App, Options, Class) {
	
	'use strict';
	
	var DropPanel = Class.create({
		/**
		 * 关闭当前显示的面板
		 */
		_closeVisiblePanel: function(){
			var $panels = $.$appPanelContainer.find('>.drop-panel:visible,>.datetimepicker:visible');
			if($panels.length == 0){
				return;
			}
			var $parentPanel = null;
			if(event){
				var curElement = event.currentTarget;
				if(!curElement){
					curElement = event.srcElement;
				}
				$parentPanel = $(curElement).closest('.drop-panel:visible,.datetimepicker:visible');
			}
			$panels.each(function(i, item){
				var $panel = $(item)
				if($parentPanel && $panel.is($parentPanel)){
					return true;
				}
				var context = $panel.data('context');
				if(context){
					context.hidePanel();
				}else{
					$panel.hide();
				}
			});
		},
		/** 
		 * 获取下拉面板距离页面的top值
		 * @param {Jquery} [$dropPanel] 下拉面板，当下拉面板为空，则引用组件本身的$dropPanel
		 * @returns {Number} top 返回距离上边的高度Number
		 */
		_getDropPanelTop: function($dropPanel){
			if($dropPanel === undefined){
				$dropPanel = this.$dropPanel;
			}
			var oriTop = this.$element.offset().top
				,height = this.$element.outerHeight()
				,panelHeight = parseInt($dropPanel.css('height'))
				,bottomLine = oriTop + height + panelHeight;
			if(bottomLine < getPageHeight()){
				return oriTop + height - 1;
			}else{
				return oriTop - panelHeight + 1;
			}
		},
		/** 
		 * 获取下拉面板距离页面的top值
		 * @param {Jquery} [$dropPanel] 下拉面板，当下拉面板为空，则引用组件本身的$dropPanel
		 * @returns {Number} top 返回距离上边的高度Number
		 */
		_getDropPanelLeft: function($dropPanel){
			if($dropPanel === undefined){
				$dropPanel = this.$dropPanel;
			}
			var oriLeft = this.$element.offset().left
				,width = $dropPanel.outerWidth()
				,rightLine = oriLeft + width;
			if(rightLine <= getPageWidth()){
				return oriLeft;
			}else{
				var eleWidth = this.$element.outerWidth();
				return oriLeft - width + eleWidth + 1;
			}
		},
		/** 
		 * 下拉面板是显示在组件上方还是下方
		 * @param {Jquery} [$dropPanel] 下拉面板，当下拉面板为空，则引用组件本身的$dropPanel
		 * @returns {Boolean} isUpside true为上拉
		 */
		_isDropPanelUpside: function($element, $dropPanel){
			if($element === undefined){
				$element = this.$element;
			}
			if($dropPanel === undefined){
				$dropPanel = this.$dropPanel;
			}
			var oriTop = $element.offset().top
				,height = $element.outerHeight()
				,panelHeight = parseInt($dropPanel.css('height'))
				,bottomLine = oriTop + height + panelHeight;
			if(bottomLine < getPageHeight()){
				return true;
			}else{
				return false;
			}
		},
		/**
		 * 面板可以调整宽度高度
		 */
		_onPanelResize: function(){
			var combo = this;
			this.$dropPanel.on('mousemove.combo.api', $.proxy(this._r_$targetMouseMove, this));
			this.$dropPanel.on('mousedown.combo.api', function(e){
                e.stopPropagation();
                if(combo._r_dir){
                    combo._r_startDrag(e);
                }
            });
		},
		/**
		 * 面板自动隐藏
		 */
		_onPanelFadeOut: function(){
			if(!this.setting.fadeout){
            	return;
            }
			this.$dropPanel.on('mouseleave.combo.api', $.proxy(this._fadeOut$DropPanel, this));
			this.$dropPanel.on('mouseenter.combo.api', $.proxy(this._fadeIn$DropPanel, this));
			this.$element.on('mouseout.combo.api', $.proxy(this._fadeOut$DropPanel, this));
			this.$element.on('mouseover.combo.api', $.proxy(this._fadeIn$DropPanel, this));
		},
		/**
		 * 渐渐隐藏
		 */
		_fadeOut$DropPanel: function(){
			if(!this._mainDivIsVisiable()){
				return;
			}
			var opacity = 10
				,combo = this;
			this._hideTimer = setInterval(function(){
				opacity -= 1;
				combo.$dropPanel.css('opacity', 0.1*opacity);
				if(opacity == 0){
					clearInterval(combo._hideTimer);
					combo.hidePanel();
					combo.$dropPanel.css('opacity', 1);
				}
			}, 130);
		},
		/**
		 * 停止渐渐隐藏 并显示
		 */
		_fadeIn$DropPanel: function(){
			this.$dropPanel.css('opacity', 1)
			clearInterval(this._hideTimer);
		},
		/**
		 * 设置鼠标的样式
		 */
		_r_$targetMouseMove: function(e){
			this._r_dir = this._r_getDragDir(e);
            if(this._r_dir)
                this.$dropPanel.css('cursor', this._r_dir + '-resize');
            else if(this.$dropPanel.css('cursor').indexOf('-resize') > 0)
                this.$dropPanel.css('cursor', 'default');
		},
		/**
		 * 获取鼠标要进行拉动的方向
		 */
		_r_getDragDir: function(e){
            var dir = ''
				,xy = this.$dropPanel.offset()
				,width = this.$dropPanel.outerWidth()
				,height = this.$dropPanel.outerHeight()
				,scope = 5
				,pageX = e.pageX || e.screenX
				,pageY = e.pageY || e.screenY;
            if (pageY >= xy.top && pageY < xy.top + scope){
                dir += 'n';
            }else if (pageY <= xy.top + height && pageY > xy.top + height - scope){
                dir += 's';
            }
            if (pageX >= xy.left && pageX < xy.left + scope){
                dir += 'w';
            }else if (pageX <= xy.left + width && pageX > xy.left + width - scope){
                dir += 'e';
            }
            if ($.inArray(dir, this._r_getAllowDragDir()) != -1) return dir;
            return '';
		},
		/**
		 * 获取拖动大小的方向
		 */
		_r_getAllowDragDir: function(){
			if(this.$dropPanel.offset().top > this.$text.offset().top){
				return ['s', 'se', 'e'];
			}else{
				return ['n', 'ne', 'e'];
			}
		},
		/**
		 * 开始拖动大小
		 */
		_r_startDrag: function(e){
            this._r_create$proxy();
            this.$resizeProxy.css({
                left: this.$dropPanel.offset().left,
                top: this.$dropPanel.offset().top,
                position: 'absolute'
            });
            this._r_current = {
                dir: this._r_dir,
                left: this.$dropPanel.offset().left,
                top: this.$dropPanel.offset().top,
                startX: e.pageX || e.screenX,
                startY: e.pageY || e.clientY,
                width: this.$dropPanel.outerWidth(),
                height: this.$dropPanel.outerHeight()
            };
			var that = this;
            $(document).bind("selectstart.resizable", function(){ return false; });
            $(document).bind('mouseup.resizable', function(){
                that._r_stop.apply(that, arguments);
            });
            $(document).bind('mousemove.resizable', function(){
                that._r_drag.apply(that, arguments);
            });
            this.$resizeProxy.show();
		},
		/**
		 * 生成一个代理拖动的层
		 */
		_r_create$proxy: function(){
            this.$resizeProxy = $('<div class="panel-resize-proxy"></div>');
            this.$resizeProxy.width(this.$dropPanel.outerWidth()).height(this.$dropPanel.outerHeight());
            this.$resizeProxy.appendTo('body');
		},
		/**
		 * 生成代理拖动的层
		 */
		 _r_remove$Proxy: function(){
            if(this.$resizeProxy){
                this.$resizeProxy.remove();
                this.$resizeProxy = null;
            }
        },
		/**
		 * 拖动时计算大小
		 */
		_r_drag: function(e){
            if(!this._r_current) return;
            if(!this.$resizeProxy) return;
            this.$resizeProxy.css('cursor', this._r_current.dir == '' ? 'default' : this._r_current.dir + '-resize');
            var pageX = e.pageX || e.screenX
				,pageY = e.pageY || e.screenY;
            this._r_current.diffX = pageX - this._r_current.startX;
            this._r_current.diffY = pageY - this._r_current.startY;
            this._r_applyResize(this.$resizeProxy);
        },
        /**
         * 停止拖动，将大小应用到目标
         */
        _r_stop: function(e){
            this._r_applyResize();
            this._r_remove$Proxy();
            $(document).unbind("selectstart.resizable");
            $(document).unbind('mousemove.resizable');
            $(document).unbind('mouseup.resizable');
            if(this._endResize){
            	this._endResize();
            }
        },
        /**
         * 拖动改变的方向
         */
        _r_changeBy: {
            t: ['n', 'ne', 'nw'],
            l: ['w', 'sw', 'nw'],
            w: ['w', 'sw', 'nw', 'e', 'ne', 'se'],
            h: ['n', 'ne', 'nw', 's', 'se', 'sw']
        },
        /**
         * 将设置信息应用到目标中
         */
        _r_applyResize: function($resizeProxy){
            var that = this
            	,cur = {
	                left: this._r_current.left,
	                top: this._r_current.top,
	                width: this._r_current.width,
	                height: this._r_current.height
	            }
				,applyToTarget = false;
            if(!$resizeProxy){
                $resizeProxy = this.$dropPanel;
                applyToTarget = true;
                if(!isNaN(parseInt(this.$dropPanel.css('top')))){
                    cur.top = parseInt(this.$dropPanel.css('top'));
                }else{
                    cur.top = 0;
                }
                if(!isNaN(parseInt(this.$dropPanel.css('left')))){
                    cur.left = parseInt(this.$dropPanel.css('left'));
                }else{
                    cur.left = 0;
                }
            }
            if($.inArray(this._r_current.dir, this._r_changeBy.l) > -1){
                cur.left += this._r_current.diffX;
                this._r_current.diffLeft = this._r_current.diffX;
            }else if(applyToTarget){
                delete cur.left;
            }
            if($.inArray(this._r_current.dir, this._r_changeBy.t) > -1){
                cur.top += this._r_current.diffY;
                this._r_current.diffTop = this._r_current.diffY;
            }else if(applyToTarget){
                delete cur.top;
            }
            if($.inArray(this._r_current.dir, this._r_changeBy.w) > -1){
                cur.width += (this._r_current.dir.indexOf('w') == -1 ? 1 : -1) * this._r_current.diffX;
                this._r_current.newWidth = cur.width;
            }else if(applyToTarget){
                delete cur.width;
            }
            if($.inArray(this._r_current.dir, this._r_changeBy.h) > -1){
                cur.height += (this._r_current.dir.indexOf('n') == -1 ? 1 : -1) * this._r_current.diffY;
                this._r_current.newHeight = cur.height;
            }else if(applyToTarget){
                delete cur.height;
            }
            $resizeProxy.css(cur);
        }
	});
	function getPageHeight(){
		if($.browser.msie){ 
			return document.compatMode == 'CSS1Compat'? document.documentElement.clientHeight : 
			document.body.clientHeight; 
		}else{ 
			return window.innerHeight; 
		}
	};
	function getPageWidth(){
		if($.browser.msie){ 
			return document.compatMode == 'CSS1Compat'? document.documentElement.clientWidth : 
			document.body.clientWidth; 
		}else{ 
			return window.innerWidth; 
		}
	}
	return DropPanel;
});