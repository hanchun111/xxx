define(["app/core/app-jquery","app/core/app-core",localeFile,
        'app/core/app-options','app/widgets/form/app-textbox'],function($,App,AppLang,Options){
	//add by tw
	App.regInitMethod(function($box){
		/*if ($("#_pageBar").length>0){
			
			
		}
		$("body").append("<div  id=\"_pageBar\" class=\"page-bar\" style=\"display: none;\"></div>")*/
		
		var filter = ":not(.tab-content .lazy *)";//add by tw（对于指定懒加载且不显示的元素不初始化）
		var initObjs = {},requires=[];
		
		var $jqgrids = $('.jqgrid[init!=true]',$box).filter(filter);
		if($jqgrids.length>0){
			initObjs["initJqGrid"] = $jqgrids;
			requires.push("app/widgets/app-jqgrid");
		}
		
		//add by tw
		
		
		
		var $portlets = $(".app-portlet",$box);
		if($portlets.length>0){
			initObjs["portlet"] = $portlets;
			requires.push("app/widgets/portlet/app-portlet");
		}
		
		/*文本框*/
		var $textbox = $(".app-textbox",$box).filter(filter);
		if($textbox.length > 0){
			initObjs["textbox"] = $textbox;
			requires.push("app/widgets/form/app-textbox");
		}
		/*金额控件*/
		var $money = $(".app-money",$box).filter(filter);
		if($money.length > 0){
			initObjs["money"] = $money;
			requires.push("app/widgets/form/app-money");
		}
		/*数值控件*/
		var $number = $(".app-number",$box).filter(filter);
		if($number.length > 0){
			initObjs["number"] = $number;
			requires.push("app/widgets/form/app-number");
		}
		/*预输入*/
		var $typeahead = $(".app-typeahead",$box).filter(filter);
		if($typeahead.length > 0){
			initObjs["typeahead"] = $typeahead;
			requires.push("app/widgets/form/app-typeahead");
		}
		/*下拉面板*/
		var $combo = $(".app-combo",$box).filter(filter);
		if($combo.length > 0){
			initObjs["combo"] = $combo;
			requires.push("app/widgets/form/app-combo");
		}
		/*下拉框*/
		var $combobox = $(".app-combobox",$box).filter(filter);
		if($combobox.length > 0){
			initObjs["combobox"] = $combobox;
			requires.push("app/widgets/form/app-combobox");
		}
		/*下拉树*/
		var $comboztree = $(".app-comboztree",$box).filter(filter);
		if($comboztree.length > 0){
			initObjs["comboztree"] = $comboztree;
			requires.push("app/widgets/form/app-comboztree");
		}
		/*引用框*/
		var $references = $(".app-reference",$box).filter(filter);
		if($references.length > 0){
			initObjs["reference"] = $references;
			requires.push("app/widgets/form/app-reference");
		}
		/*下拉表格组件*/
		var $combogrid = $(".app-combogrid",$box).filter(filter);
		if($combogrid.length > 0){
			initObjs["combogrid"] = $combogrid;
			requires.push("app/widgets/form/app-combogrid");
		}
		/*联想框*/
		var $suggest = $(".app-suggest",$box).filter(filter);
		if($suggest.length > 0){
			initObjs["suggest"] = $suggest;
			requires.push("app/widgets/form/app-suggest");
		}
		/*日期框*/
		var $datetimes = $("input.app-datetime",$box).filter(filter);
		if($datetimes.length > 0){
			initObjs["datetime"] = $datetimes;
			requires.push("app/widgets/form/app-datetime");
		}
		/*复选框*/
		var $checkbox = $("input.app-checkbox",$box).filter(filter);
		if($checkbox.length > 0){
			initObjs["checkbox"] = $checkbox;
			requires.push("app/widgets/form/app-checkbox");
		}
		/*上传组件*/
		var $upload = $(".app-upload",$box).filter(filter);
		if($upload.length > 0){
			initObjs["upload"] = $upload;
			requires.push("app/widgets/form/app-upload");
		}
		
		var $dropdowns = $("[data-toggle=dropdown]", $box).filter(filter);
		if($dropdowns.length > 0){
			requires.push("bootstrap/bootstrap-dropdown");
		}
		
		/* Tab组件 */
		var $appTabs = $(".app-tabs", $box).filter(filter);
		if($appTabs.length > 0){
			initObjs["tabs"] = $appTabs;
			requires.push("app/widgets/tabs/app-tabs");
		}
		/* xquerybox */
		var $xquerybox = $(".app-xquerybox", $box).filter(filter);
		if($xquerybox.length > 0){
			initObjs["xquerybox"] = $xquerybox;
			requires.push("app/widgets/form/app-xquerybox");
		}
		/* Tab组件 
		var $tabcontents = $(".tab-container", $box).filter(filter);
		if($tabcontents.length > 0){
			initObjs["appTabs"] = $tabcontents;
			requires.push("app/widgets/tabs/app-tab");
		}
*/
		/* ZTREE组件 */
		var $ztrees = $('.apptree',$box).filter(filter);
		if($ztrees.length>0){
			initObjs["initZTree"] = $ztrees;
			requires.push("app/widgets/tree/app-ztree");
		}
		/* 查询组件 */
		var $xquerys = $('.xquery',$box).filter(filter);
		if($xquerys.length>0){
			initObjs["initXquery"] = $xquerys;
			requires.push("app/widgets/form/app-xquery");
		}
		var appdatagrid = $('.app-datagrid',$box).filter(filter);
		if(appdatagrid.length>0){
			initObjs["datagrid"] = appdatagrid;
			requires.push("app/widgets/treegrid/app-datagrid");
		}
		var apptreegrid = $('.app-treegrid',$box).filter(filter);
		if(apptreegrid.length>0){
			initObjs["treegrid"] = apptreegrid;
			requires.push("app/widgets/treegrid/app-treegrid");
		}
		
		/*表单校验*/
		var $form = $("form.required-validate", $box).filter(filter);
		if($form.length > 0 
				&& $form.find('input[validations]').length > 0){
			$form.each(function(){
				$(this).validate({
					debug: true,
					success: "valid",
					submitHandler : function() {
						alert("验证通过!");
					}
				});
			});
		}
		
		/*注册表单提交*/
		var $forms = $("div.form>form",$box).filter(filter);
		if($forms.length>0){
			initObjs["initForm"] = $forms;
			requires.push("app/widgets/form/app-form");
		}
		/*联动规则*/
		var $gearRules = $("[gearRules]", $box).filter(filter);
		if($gearRules.length > 0 ){
			requires.push("app/widgets/form/app-rule");
			initObjs["gearRule"] = $gearRules;
		}
		/*按钮状态*/
		var $buttonStates = $(".btnarea>div.button-state", $box).filter(filter);
		if($buttonStates.length > 0 ){
			requires.push("app/widgets/button/app-buttons");
			initObjs["initButtonState"] = $buttonStates;
		}
		var $buttons= $(".app-button", $box).filter(filter);
		if($buttons.length > 0 ){
			requires.push("app/widgets/button/app-button");
			initObjs["button"] = $buttons;
		}
		var $menubutton= $(".app-menubutton", $box).filter(filter);
		if($menubutton.length > 0 ){
			requires.push("app/widgets/button/app-menubutton");
			initObjs["menubutton"] = $menubutton;
		}
		
		var $layout= $(".app-layout", $box).filter(filter);
		if($layout.length > 0 ){
			requires.push("app/widgets/layout/app-layout2");
			initObjs["layout"] = $layout;
		}	
		var $panel= $(".app-vboxLayout", $box).filter(filter);
		if($panel.length > 0 ){
			requires.push("app/widgets/layout/app-boxlayout");
			initObjs["VBoxLayout"] = $panel;
		}
		
		var $panel= $(".app-hboxLayout", $box).filter(filter);
		if($panel.length > 0 ){
			requires.push("app/widgets/layout/app-boxlayout");
			initObjs["HBoxLayout"] = $panel;
		}
		
		var $panel= $(".app-panel", $box).filter(filter);
		if($panel.length > 0 ){
			requires.push("app/widgets/panel/app-panel");
			initObjs["panel"] = $panel;
		}
		/*表格组件*/
		var $grid = $(".app-grid",$box).filter(filter);
		if($grid.length > 0){
			initObjs["grid"] = $grid;
			requires.push("app/widgets/grid/app-grid");
		}
		var $menus= $(".app-menu", $box).filter(filter);
		if($menus.length > 0 ){
			requires.push("app/widgets/menu/app-menu");
			initObjs["menu"] = $menus;
		}
		
		//console.log($buttons)
		/*滚动页签*/
		var $scrollspys = $(".scrollspy", $box).filter(filter);
		if($scrollspys.length > 0 ){
			requires.push("app/app-scroll");
			initObjs["scrollspy"] = $scrollspys;
		}
		initObjs["initEvent"]=function(){
			$("[handle][handleType=JS]",$box).filter(filter).each(function(){
				var $this = $(this);
				var handle = $this.attr("handle");
				$this.removeAttr("handle");
				if(!handle)
					return;
				var func=null;
				try{
					func = $box.getJsFunction(handle);
				}catch(e){
					return;
				}
				$this.click(function(e){
					if($this.isTag("a"))
						e.preventDefault();
					if($this.attr("disabled")||$this.hasClass("disabled"))
						return;
					func.call($this);
				});
			});
			$("[events][eventSelf!=true]",$box).filter(filter).each(function(){
				$this = $(this);
				var evts = $this.attr("events");
				if(!evts)
					return;
				var es = $this.getJsEvent(evts);
				$this.on(es);
			});
		};
		/*统一初始化*/
		if(requires.length>0){
			require(requires,function(){
				$.each(initObjs,function(key){
					try{
					var o = initObjs[key];
					if($.isFunction(o)){
						o();
					}else{
						o[key]();
					}
					}catch(ex){
						if (window.console){
							console.log(ex);
						}
					}
				});
		/*		console.log($box);
				console.log($A.eventType.pageLoad)*/
				$box.triggerHandler($A.eventType.pageLoad);
				
				//setTimeout(function(){
					$("#_tabmask").hide();
				//	$("#_tabmask").remove();
				//},100);
				
//				initKey();
			});
		}else{
			$.each(initObjs,function(key){
				try{
				var o = initObjs[key];
				if($.isFunction(o)){
					o();
				}else{
					o[key]();
				}
				}catch(ex){
					if (window.console){
						console.log(ex);
					}
				}
			});
//			initKey();
			$box.triggerHandler($A.eventType.pageLoad);
			/*$("#_tabmask").hide(function(){$("#_tabmask").remove();});*/
			//setTimeout(function(){
				$("#_tabmask").hide();
			
				//$("#_tabmask").remove();
			//}, 100);
		}
		
	});
	
//	 function initKey() {
//		$A(':input:text:first:enabled:visible').focus();
//		$A(':input:enabled:visible').addClass('enterIndex');
//		// get only input tags with class data-entry
//		textboxes = $('.enterIndex');
//		// now we check to see which browser is being used
//		if ($.browser.mozilla) {
//			$A(textboxes).unbind('keypress.formkey',CheckForEnter)
//			$A(textboxes).bind('keypress.formkey', CheckForEnter);
//		} else {
//			$A(textboxes).unbind('keydown.formkey',CheckForEnter)
//
//			$A(textboxes).bind('keydown.formkey', CheckForEnter);
//		}
//
//		function CheckForEnter(event) {
//			if (event.keyCode == 13 && $A(this).attr('type') != 'button'
//					&& $A(this).attr('type') != 'submit'
//					&& $A(this).attr('type') != 'textarea'
//					&& $A(this).attr('type') != 'reset') {
//				var i = $A('.enterIndex').index($A(this));
//				var n = $A('.enterIndex').length;
//				if (i < n - 1) {
//					if ($A(this).attr('type') != 'radio') {
//						NextDOM($A('.enterIndex'), i);
//					} else {
//						var last_radio = $A('.enterIndex')
//								.index($A('.enterIndex[type=radio][name='
//										+ $A(this).attr('name')
//										+ ']:last'));
//						NextDOM($A('.enterIndex'), last_radio);
//					}
//				}
//				return false;
//			}
//		}
//		function NextDOM(myjQueryObjects, counter) {
//			if (myjQueryObjects.eq(counter + 1)[0].disabled) {
//				NextDOM(myjQueryObjects, counter + 1);
//			} else {
//				myjQueryObjects.eq(counter + 1).trigger('focus');
//			}
//		}
//	}
});