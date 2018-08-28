define(["app/core/app-jquery","app/core/app-core","app/widgets/app-frags","app/widgets/window/app-messager",localeFile,"app/widgets/app-workspace"],function($,$A,$frags,Messager,locale,AppWorkSpace){
	
	var workSpace=new AppWorkSpace();
	
	var PORTAL={
			portalets:[]
			
	}
	$.extend($A,{
		/**
		 * 扩展$A的方法
		 */
		_exfn:function(selector, context){
			var $con = this.getContainer();
			var $ctrl;
			if(!selector){
				if(context)
					return context;
				return $con; 
			}
				
			if(context&&$con.has(context)){
				$ctrl = $(context,$con).find(selector);
			}else{
				$ctrl = $con.find(selector);
			}
			if($ctrl.isGrid&& $ctrl.isGrid()){
				return $ctrl.getJqGrid();
			}else if($ctrl.isZTree&&$ctrl.isZTree()){
				return $ctrl.getAppZTree();
			}
			return $ctrl;
		}
		,
		
		getWorkSpace:function(){
			return workSpace;
		},
		
		setPortal:function(portal){
			
			PORTAL=portal;
		},
		
		getPortal:function(){
			
			return PORTAL;
		},
		
		getPortalet:function(code){
	
			if (PORTAL){		
		
		var portalets=PORTAL["portalets"];
			if (portalets){
				for(var i=0;i<portalets.length;i++){
				var portale=portalets[i];
				if (portale["code"]==code)
					
					return portale;
				}
				
			}
			}
		},
               
        /**
         * 取得当前选项卡
        */
       getCurrentNavTab:function(){
    	   return $A.getWorkSpace().getActionPage();
         },
		registerWorkSpace:function(workspaceObj){
			workSpace=workspaceObj;
		},

		/**
		 * 取得当前对话框对象
		 */
		getCurrentDialog:function(){
			if(this.dialog&&this.dialog.getCurrent()){
				return this.dialog.getCurrent();
			}
		},
		/**
		 * 取得当前选项卡
		 */
		
		/**
		 *  取得当钱所在容器(对话框/选项卡);
		 */
		getContainer:function(){
			var container;
			if (this.getCurrentDialog){
				container= this.getCurrentDialog();
			}
			if (workSpace){
				if(!container||container.length==0){
					
						container=workSpace.getActionPage();
					
				}
			}
			if(!container||container.length==0){
				container=$(document.body);
			}
			return container;
		},
		/**
		 * 查找当前对象所处容器
		 * @param 指定jquery selector对象
		 */
		findContainer:function(selector){
			var $o = $(selector);
			if($o.size == 0)
				return null;
			var $con = null;
			if($o.is($(document)) || $o.hasClass("dialog")|| $o.hasClass("tabpage")){
				$con = $o;
			}else{
				$con = $o.parents("(.dialog,.tabpage):first");
			}
			if($con.size() == 0){
				$con = $(document);
			}
			return $con;
		},
		/**
		 * 添加初始化事件处理
		 * @param func{function} 事件处理方法
		 * @param target{jquery object} 事件触发对象
		 */
		pageLoad:function(func,target){
			if(!func || typeof func!="function")
				return;
			if(!target){
				target = this.getContainer();
			}
			if($(target).is(document)){
				$(document).ready(func);
			}else{
				$(target).on(this.eventType.pageLoad,func);
			}
		},
		loadLogin:function(){
			window.location=_contextPath+"/login.do";
		}
	});

	
	$A.regInitMethod("appmain",function(){
		$("body").append($frags["globalBodyFrag"]);
		if ($.browser.msie && /6.0/.test(navigator.userAgent) ) {
			try {
				document.execCommand("BackgroundImageCache", false, true);
			}catch(e){}
		}
		//清理浏览器内存,只对IE起效
		if ($.browser.msie) {
			window.setInterval("CollectGarbage();", 10000);
		}
		

		
		$A.regInitMethod("appmain");
	});
	
	
	/**
	 *兼容2.0网格单元框事件绑定
	 */
	$(document).on('click',"a[target=function]", function (e) {
		e.preventDefault();
		var $this = $(this);
		var param = $this.getJsonAttr("data_funcparam");
		var func = $this.getJsonAttr("data_funcname");
		if(typeof(func)=='function'){
			func(param);
		}
	});
	return $A;
	
	
});


