define(["app/core/app-jquery","app/core/app-core","app/widgets/app-frags",localeFile],function($,$A,$frags,$lang) {
	var $msglang = $lang.messager;
	var that = null;
	that = {
			
		/**
		 * 消息框id
		 */
		_boxId: "#_alertMsgBox",
		
		/**
		 * Tips框ID
		 */
		_tipsId:"#_tipsMsgBox",
		
		/**
		 * 消息框背景
		 */
		_bgId: "#_alertBackground",
		
		/**
		 * 关闭时长
		 */
		_closeTimer: null,
		
		/**
		 * 消息类型
		 */
		_types: {error:"error", info:"info", warn:"warn", correct:"correct", confirm:"confirm"},

		/**
		 * 取得消息框标题
		 */
		_getTitle: function(key){
			return $msglang[key.toUpperCase()];
		},
		
		/**
		 * 按回车键事件
		 */
		_keydownOk: function(event){
			if (event.keyCode == $A.keyCode.ENTER) event.data.target.trigger("click");
		},
		
		/**
		 * 按取消键事件
		 */
		_keydownEsc: function(event){
			if (event.keyCode == $A.keyCode.ESC||event.keyCode == $A.keyCode.ENTER) event.data.target.trigger("click");
		},
		toggleDetail:function(){
			$('#__alertDetails').toggle();
			this.relayout();
		},
		relayout:function(){
			var $box=$(this._boxId);
			var pos = $box.attr("pos");
			if(pos == "top"){
				$box.css( {"left":($(window).width() - $box.width())/2 + "px","top":"0px"});
			}else if(pos=="bottom"){
				$box.css( {"bottom":"0px","right":"0px"});
			}else{
				$box.css( {"left":($(window).width() - $box.width())/2 + "px","top":($(window).height() - $box.height())/2 + "px"} );
			}
		},
		/**
		 * 打开消息框
		 * @param {Object} type 消息类型
		 * @param {Object} msg 消息内容
		 * @param {Object} buttons [button1, button2] 消息按钮
		 */
		_open: function(type, msg, buttons,pos){
			$(this._boxId).remove();
			var butsHtml = "";
			if (buttons) {
				for (var i = 0; i < buttons.length; i++) {
					var sRel = buttons[i].call ? "callback" : "";
					var css = buttons[i].css ? buttons[i].css : "";
					butsHtml += $frags["alertButFrag"].replace("#butMsg#", buttons[i].name).replace("#callback#", sRel).replace("#css#", css);
				}
			}
			var msgObj;
			if(typeof msg=="string"){
				msgObj=$A.jsonEval(msg);
			}else{
				msgObj=msg;
			}
			
			if(msgObj.message == null&&msgObj.detail==null){
				msgObj={
					type:type,
					icon:type,
					title:this._getTitle(type),
					message:msg,
					butFragment:butsHtml
				};
			}else{
				msgObj = $.extend({
					type:type,
					icon:type,
					title:this._getTitle(type),
					butFragment:butsHtml
				},msgObj);
			}
			var tpl = msgObj.detail?$frags["alertBoxFrag"]:$frags["alertBoxFrag_NoDetail"];
			
			var boxHtml = $template(tpl,msgObj);
			$(boxHtml).appendTo("body");
			var $box=$(this._boxId);
			$box.attr("pos",pos);
			this.relayout();
			
			if (this._closeTimer) {
				clearTimeout(this._closeTimer);
				this._closeTimer = null;
			}
			if (this._types.info == type || this._types.correct == type){
				this._closeTimer = setTimeout(function(){that.close();}, 3500);
			} else {
				$(this._bgId).show();
			}
			
			var jButs = $(this._boxId).find("a.btn");
			var jCallButs = jButs.filter("[rel=callback]");
			var jDoc = $(document);
			for (var i = 0; i < buttons.length; i++) {
				if (buttons[i].call) jCallButs.eq(i).click(buttons[i].call);
				if (buttons[i].keyCode == $A.keyCode.ENTER) {
					jDoc.bind("keydown",{target:jButs.eq(i)}, this._keydownOk);
				}
				if (buttons[i].keyCode == $A.keyCode.ESC) {
					jDoc.bind("keydown",{target:jButs.eq(i)}, this._keydownEsc);
				}
			}
			return $box;
		},
		
		/**
		 * 关系消息框
		 */
		close: function(fadeSpeed){
			$(document).unbind("keydown", this._keydownOk).unbind("keydown", this._keydownEsc);
			$msgBox = $(this._boxId);
			//var pos = $msgBox.attr("pos");
			if(fadeSpeed){
				$msgBox.fadeOut(fadeSpeed,function(){
					$msgBox.remove();
				});
			}else{
				$msgBox.hide();
				setTimeout(function(){
						$msgBox.remove();
				}, 500);
				$(this._bgId).hide();
			}
			
		},
		
		/**
		 * 打开错误消息框
		 */
		error: function(msg, options) {
			this._alert(this._types.error, msg, options);
		},
		
		/**
		 * 打开普通消息框
		 */
		info: function(msg, options) {
			this._alert(this._types.info, msg, options,"bottom");
		},
		
		/**
		 * 打开警告消息框
		 */
		warn: function(msg, options) {
			this._alert(this._types.warn, msg, options);
		},
		
		/**
		 * 打开成功消息框
		 */
		correct: function(msg, options) {
			this._tips(this._types.correct, msg, options,"center");
		},
		
		/**
		 * 打开消息框
		 */
		_alert: function(type, msg, options,pos) {
			
			var op = {okName:$msglang.OK, okCall:null,okCss:"btn-primary singlebtn"};
			$.extend(op, options);
			var buttons = [
				{name:op.okName, call: op.okCall, keyCode:$A.keyCode.ENTER,css:op.okCss}
			];
			var $dlg=this._open(type, msg, buttons,pos);
			$("a",$dlg).focus();
		},
		
		_tips:function(type,msg,options,pos){
			$(this._tipsId).remove();
			var msgObj = {
					"icon":type,
					"message":msg
			};
			
			options = options||{};
			var displayTime = options.displayTime || 1500;//默认两秒
			var fadeSpeed = options.fadeSpeed || 800;//默认两秒
			
			var tpl = $frags["tipsBoxFrag"];
			var boxHtml = $template(tpl,msgObj);
			
			$(boxHtml).appendTo("body");
			
			var $box=$(this._tipsId);
			$box.show();
			$box.attr("pos",pos);
			var pos = $box.attr("pos");
			if(pos == "top"){
				$box.css( {"left":($(window).width() - $box.width())/2 + "px","top":"0px"});
			}else if(pos=="bottom"){
				$box.css( {"bottom":"0px","right":"0px"});
			}else{
				$box.css( {"left":($(window).width() - $box.width())/2 + "px","top":45 + "px"} );
			}
			$box.show();
			setTimeout(function(){
/*				$box.fadeOut(fadeSpeed,function(){
					$box.remove();
				});*/
				$box.animate({
					"top":"-=38",
					"opacity":0
				},fadeSpeed,function(){
					$box.remove();
				});
				
			},displayTime);
		},
		
		/**
		 * 打开确认消息框
		 * @param {Object} msg 消息内容
		 * @param {Object} options {okName, okCal, cancelName, cancelCall} 按钮
		 */
		confirm: function(msg, options) {
			var op = {okName:$msglang.OK, okCall:null,okCss:"btn-primary", cancelName:$msglang.CANCEL, cancelCall:null,button:null};
			$.extend(op, options);

			var _self=this;
			/*
			var buttons = [
				{name:op.okName, call: op.okCall, keyCode:$A.keyCode.ENTER,css:op.okCss},
				{name:op.cancelName, call: op.cancelCall, keyCode:$A.keyCode.ESC}
			];
			*/
			//暂时去掉热键
			var buttons = [
				{name:op.okName, call: op.okCall, css:(op.button&&op.button==_self.BUTTONS.OK)?op.okCss:""},
				{name:op.cancelName, call: op.cancelCall, keyCode:$A.keyCode.ESC,css:((!op.button)||op.button==_self.BUTTONS.CANCEL)?op.okCss:""}
			];
			this._open(this._types.confirm, msg, buttons);
		},
		BUTTONS:{
		  OK:'OK',
		  CANCEL:'CANCEL'
		}
	};
	$A.messager = that;
	return $A.messager;
});

