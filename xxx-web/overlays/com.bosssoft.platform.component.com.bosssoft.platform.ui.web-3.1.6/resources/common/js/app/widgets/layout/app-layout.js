/**
 * 应用框架布局
 */
define(["app/core/app-jquery","app/core/app-core"],function($,$A){
	$.fn.extend({
		/**
		 * 取得窗口大小
		 */
		getWindowSize: function(){
			if ($.browser.opera) { return { width: window.innerWidth, height: window.innerHeight }; }
			return { width: $(window).width(), height: $(window).height() };
		},
		/**
		 * 滚动到屏幕中间
		 * @param options 选项
		 */		
		scrollCenter: function(options){
			// 扩展参数
			var op = $.extend({ z: 1000000, mode:"WH"}, options);
			
			// 追加到 document.body 并设置其样式
			var windowSize = this.getWindowSize();
	
			return this.each(function(){
				var $this = $(this).css({
					'position': 'absolute',
					'z-index': op.z
				});
				
				// 当前位置参数
				var bodyScrollTop = $(document).scrollTop();
				var bodyScrollLeft = $(document).scrollLeft();
				var movedivTop = (windowSize.height - $this.height()) / 2 + bodyScrollTop;
				var movedivLeft = (windowSize.width - $this.width()) / 2 + bodyScrollLeft;
				
				if (op.mode == "W") {
					$this.appendTo(document.body).css({
						'left': movedivLeft + 'px'
					});
				} else if (op.model == "H"){
					$this.appendTo(document.body).css({
						'top': movedivTop + 'px'
					});	
				} else {
					$this.appendTo(document.body).css({
						'top': (windowSize.height - $this.height()) / 2 + $(window).scrollTop() + 'px',
						'left': movedivLeft + 'px'
					});
				}
				
				// 滚动事件
				$(window).scroll(function(e){
					var windowSize = $this.getWindowSize();
					var tmpBodyScrollTop = $(document).scrollTop();
					var tmpBodyScrollLeft = $(document).scrollLeft();
					
					movedivTop += tmpBodyScrollTop - bodyScrollTop;
					movedivLeft += tmpBodyScrollLeft - bodyScrollLeft;
					bodyScrollTop = tmpBodyScrollTop;
					bodyScrollLeft = tmpBodyScrollLeft;
	
					// 以动画方式进行移动
					if (op.mode == "W") {
						$this.stop().animate({
							'left': movedivLeft + 'px'
						});
					} else if (op.mode == "H") {
						$this.stop().animate({
							'top': movedivTop + 'px'
						});
					} else {
						$this.stop().animate({
							'top': movedivTop + 'px',
							'left': movedivLeft + 'px'
						});
					}
					
				});
				
				// 窗口大小重设事件
				$(window).resize(function(){
					var windowSize = $this.getWindowSize();
					movedivTop = (windowSize.height - $this.height()) / 2 + $(document).scrollTop();
					movedivLeft = (windowSize.width - $this.width()) / 2 + $(document).scrollLeft();
					
					if (op.mode == "W") {
						$this.stop().animate({
							'left': movedivLeft + 'px'
						});
					} else if (op.mode == "H") {
						$this.stop().animate({
							'top': movedivTop + 'px'
						});
					} else {
						$this.stop().animate({
							'top': movedivTop + 'px',
							'left': movedivLeft + 'px'
						});
					}
					
				});
			});
			
		},
		/**
		 * 自动调节相对高度
		 * @param $refBox{$DOM} 需要调节的范围
		 */
		layoutHeight: function($refBox){
			return this.each(function(){
				var $this = $(this);
				
				if (! $refBox) $refBox = $this.parents("div.layoutBox:first");
				var iRefH = $refBox.height();
				var ilayoutHeight = parseInt($this.attr("layoutHeight"));
				if(isNaN(ilayoutHeight))
					return;
				var iH = iRefH - ilayoutHeight > 50 ? iRefH - ilayoutHeight : 50;
				
				if ($this.isTag("table")) {
			
					if($this.hasClass("flexigrid")){
						if($this.grid)
							$this.grid.fixHeight(iH);
						else
							$this.attr("height",iH);
					}else if($this.hasClass("jqgrid")){
						if($this.attr("init")=="true"){
							var h = $this.attr("pageHeight")*1;
							if(!h){
								h = 0;
							}
							$this.jqGrid('setGridHeight',iH-h);
						}else{
							$this.attr("height",iH);
						}
					}else{
						$this.removeAttr("layoutHeight").wrap('<div layoutHeight="'+ilayoutHeight+'" style="overflow:auto;height:'+iH+'px"></div>');
					}
				} else {
					$this.height(iH).css("overflow","auto");
				}
			});
		},
		/**
		 * 自动填充
		 */
		fillSpace:function(){
			var $this = $(this)
			,padd = $this.attr("fillpadd")
			,$fillEl = $this.find($this.attr("fillSpace"));
			padd= parseInt(padd,10);
			padd = isNaN(padd)?0:padd;
			
			var parent = $this.parent();
			var height = parent.height() - padd;
	
			var os = parent.children().not($this);
			$.each(os, function(i){
				height -= $(os[i]).outerHeight();
			});
			if($fillEl.length==0){
				$fillEl = $this;
			}
			$fillEl.height(height/$fillEl.length);
			if($this.attr("_fillSpaceEvent")==null){
				$this.on("fillSpace",function(){
					setTimeout(function(){
						$this.fillSpace();
					}, 100);
				});
				$this.attr("_fillSpaceEvent","true");
			}
		}
	});

	
	/**
	 * 注册初始化处理方法
	 */
	$A.regInitMethod(function($box){
		//$("[fillSpace]",$box).fillSpace();
		//$("[layoutHeight]",$box).layoutHeight();
	});
	return $A;
});


