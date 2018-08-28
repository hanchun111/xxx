define(["app/core/app-jquery","app/core/app-core"],function ($,$A) {
	/**
	 * 系统函数库
	 */
	return {
		
		/**
		 * 打开对话框
		 */
		openDialog:function(options){
			if(typeof options === "string"){
				options = {url:options};
			}
			var path = options["url"];
			if(!path)
				return;
			if(path.indexOf(_contextPath)!=0){
				if(path.indexOf("/")!=0){
					path="/"+path;
				}
				path=_contextPath+path;
			}
			var dialogId = options["dialogId"];
			if(!dialogId){
				dialogId = "dialog"+$A.nextId();
				options["dialogId"]=dialogId;
				options["data-target"]="#"+dialogId;
			}
			options["url"]=path;
			require(["app/widgets/window/app-dialog"],function(){
				$.openModalDialog(options);
			});
		},
		
		/**
		 * 通过指定的表单地址在对话框中编辑当前选中列表数据
		 */
		editGridRowDialog:function(options){
			var that = this;
			require(["app/widgets/window/app-dialog","app/widgets/window/app-messager"],function($dialog,$messager){
				var gridId = options["gridId"];
				if(!gridId){
					$messager.error("请指定列表对象！");
					return;
				}
				var $grid = $A("#"+gridId);
				if($grid.length==0){
					$messager.error("请指定列表对象！");
					return;
				}
				var id = $grid.bsgrid('getSelectRowId');
				if (id)	{
					options["params"]={id:id};
					$.openModalDialog(options);
				} else { $messager.warn("请选中一行数据后再编辑！");}
			});
		},
		/**
		 * 通过指定的表单地址在对话框中编辑当前选中列表数据
		 */
		deleteGridSelRows:function(options){
			require(["app/widgets/window/app-messager","app/data/app-ajax"],function($messager,$ajax){
				var gridId = options["gridId"];
				if(!gridId){
					$messager.error("请指定列表对象！");
					return;
				}
				var $grid = $("#"+gridId);
				if($grid.length==0){
					$messager.error("请指定列表对象！");
					return;
				}
				var delUrl = options["delUrl"];
				if(!delUrl){
					$messager.error("请指定删除数据的服务地址！");
					return
				}
				if(!delUrl.startsWith("/")){
					delUrl="/"+delUrl;
				}
				delUrl = _contextPath + delUrl;
				var ids = $grid.bsgrid('getSelectRowId');
				if (ids&& ids.length>0)	{
					var op = {
							type:'POST',
							url:delUrl,
							data:{ids:ids},
							dataType:"json",
							cache: false,
							beforeCall:'confirmPrompt',
							confirm:"确认删除这些数据吗？",
							afterCall:'refreshTable'
						};
					$ajax.ajaxCall(op);
				} else { $messager.warn("请选中需要删除的数据！");}
			});
		},
		/**
		 * 通过指定的表单地址在对话框中编辑当前选中列表数据
		 */
		editSingleDataDialog:function(options){
			var that = this;
			require(["app/widgets/window/app-dialog","app/widgets/window/app-messager"],function($dialog,$messager){
				var loadUrl = options["url"];
				if(!loadUrl){
					$messager.error("请指定加载表单数据的服务地址！");
					return;
				}
				if(!loadUrl.startsWith("/")){
					loadUrl="/"+loadUrl;
				}
				loadUrl = _contextPath + loadUrl;
				var id=options["id"];
				if(!id){
					$messager.error("参数设置错误！");
					return;
				}
				options["params"]={id:id};
				options["url"]=loadUrl;
				$.openModalDialog(options);
			});
		},
		/**
		 * 通过指定的表单地址在对话框中编辑当前选中列表数据
		 */
		deleteSingleData:function(options){
			require(["app/widgets/window/app-messager","app/data/app-ajax"],function($messager,$ajax){
				var delUrl = options["url"];
				if(!delUrl){
					$messager.error("请指定删除数据的服务地址！");
					return;
				}
				if(!delUrl.startsWith("/")){
					delUrl="/"+delUrl;
				}
				delUrl = _contextPath + delUrl;
				var id=options["id"];
				if(!id){
					$messager.error("参数设置错误！");
					return;
				}
				var op = {
					type:'POST',
					url:delUrl,
					data:{id:id},
					dataType:"json",
					cache: false,
					beforeCall:'confirmPrompt',
					confirm:options[confirm]||"确认删除这些数据吗？",
					afterCall:'refreshTable'
				};
				$ajax.ajaxCall(op);
			});
		},
		/**
		 *  保存表单对话框
		 */
		saveFormDialog:function(options){
			if(typeof options === "string"){
				options = {formId:options};
			}
			var container = $A.getContainer();
			require(["app/widgets/form/app-form"],function(){
				var formId = options["formId"];
				if(formId){
					$("#"+options["formId"],container).submitForm(options);
				}else{
					$("form",container).submitForm(options);
				}
			});
		},
		/**
		 * grid列转义 0-->""  1-->√
		 */
		transferGridColumn:function(cellvalue, options, rowObject){
			
			return cellvalue == '1' ? "<font color='green'>√</font>" : "";
		},
		transferGridColumn2:function(cellvalue, options, rowObject){
			if(cellvalue == undefined){
				return '';
			}else{
				return cellvalue == '1' ? "<font color='green'>√</font>" : "<font style='color:red !Important'>╳</font>";
			}

		},
		/**
		 * form列转义 0-->""  1-->√
		 */
		transferFormColumn:function(value){
			 
			return value == '1' ? "<font color='green'>√</font>" : "";
			 
		},
		/**
		 * 关闭对话框
		 */
		closeDialog:function(){
			$A.dialog.closeCurrent();
		}
	}
});