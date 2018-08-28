define(["app/core/app-jquery","app/core/app-core","app/data/app-ajax","app/widgets/drag/app-drag"],function($,$a,$ajax){
	var dialogDragTarget=".dialog-header,.dlg-box-head";
	
	function disableSelection(){
//		document.onselectstart=function(){return false;};
//		$("body").css("-moz-user-select","none");
	}
	
	function enableSelection(){
//		document.onselectstart=function(){return true;};
//		$("body").css("-moz-user-select","inherit");
	}
	
	$.fn.dialogDrag = function(options){
		if (options&&options.dragTarget){
			dialogDragTarget=options.dragTarget;
		}else{
			dialogDragTarget=".dialog-header,.dlg-box-head";
		}
        if (typeof options == 'string') {
            if (options == 'destroy') 
				return this.each(function() {
						var dialog = this;
						
						$(dialogDragTarget, dialog).unbind("mousedown");
                });
        }
		return this.each(function(){
			var $dlg = $(this);
			$(dialogDragTarget, $dlg).mousedown(function(e){
//				//如果是在dialogheader中的A上触发的，则不拖拽
				disableSelection();
				var $target = $(e.target);
				if($target.is('label')|| $target.is('input')
					||$target.is("a")||$target.parents("a").size()>0){
					return;
				}
				$a.dialog.switchDialog($dlg);
				$dlg.data("task",true);
				setTimeout(function(){
					if($dlg.data("task"))
						$.dialogDrag.start($dlg,e);
				},100);
				
				//modify by tw，拖拽的mouseup事件绑定在document上，并且在mouseup后自动删除该事件
				$(document).on("mouseup",{"$dlg":$dlg},function(e){
					$dlg.data("task",false);
					$(document).unbind("mouseup",arguments.callee);
					enableSelection();
					return true;
				});
				
				return true;//Mr.t 事件继续传播
			});
		});
	};
	$.dialogDrag = {
		_init:function($dlg) {
			var $shadow = $("#dialogProxy");
			if (!$shadow.size()) {
				$shadow = $($a.frags["dialogProxy"]);
				$("body").append($shadow);
			}
			$("h5", $shadow).html($(dialogDragTarget+" h5", $dlg).html());
		},
		start:function($dlg,event){
				this._init($dlg);
				var $shadow = $("#dialogProxy");
				$shadow.css({
					left: $dlg.css("left"),
					top: $dlg.css("top"),
					marginLeft: $dlg.css("marginLeft"),
					height: $dlg.css("height"),
					width: $dlg.css("width"),
					zIndex:parseInt($dlg.css("zIndex")) +1
				}).show();
				$("div.dialog-content",$shadow).css("height",$("div.dialog-content",$dlg).css("height"));
				$shadow.data("dialog",$dlg);
				//$dlg.css({left:"-10000px",top:"-10000px"});
				$shadow.drager({
					selector:dialogDragTarget,
					stop: this.stop,
					event:event
				});
				return false;
		},
		stop:function(){
			var $shadow = $(arguments[0]);
			var $dlg = $shadow.data("dialog");
			$dlg.css({left:$shadow.css("left"),top:$shadow.css("top")});
			$shadow.hide();
		}
	};
});