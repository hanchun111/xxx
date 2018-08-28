/**
 * * Auto generated by Bossssoft Studio version 1.0 beta
 * Sun Sep 18 11:45:38 CST 2016
 */
//define(['引入外部js模块或控件'],function('引入外部js或控件的别名'){})
define(
		[ 
		  "app/widgets/window/app-dialog",
		  "app/app-pagebase",
		  "resources/js/user_add.js",
			"resources/js/user_update.js"
		  ],
		function(Dialog,PageBase,dlg,udlg) {
		   var AfaAppFunctionModel = PageBase.extend({
		             //类初始化
		            initialize : function() {
						AfaAppFunctionModel.superclass.initialize.call(this);
					},
					showPageCallBack: null,
					IndexAction: null,
					treeObj:null,
					copyObject:{},
					ACTION:{
						DELETE: "DELETE",
						ENABLE: "ENABLE",
						DISABLE: "DISABLE",
						SHOW: "SHOW",
						HIDDEN: "HIDDEN"
					},
					//控件监听事件  格式：#控件id#:{事件名:事件方法}
					listeners:{

					    //新增按钮事件
                        afaUserPanel_add:{
							click: function(){
								dlg.showPage(dlg.ACTION.ADD,$A("#afaOrgPanel_User_details"),function(){
									//AfaAppFunctionModel.getInstance().treeObj=$A("#afaOrgPanel_User_details");
									AfaAppFunctionModel.getInstance().refreshData();
								});
							}
						},
						//查询按钮事件
						AfaAppFunctionPage_btnQuery:{
							click:function(){
								$("#AfaAppFunctionPage_query").xquery("toggle");
							}
						},
						//保存按钮事件
						AfaAppFunctionPage_btnSave:{
							click: function(){
								var _self = AfaAppFunctionModel.getInstance();
								_self.doSave();
							}
						},
					},
					//页面加载后初始化
					initPage:function(){
						//$A("#functiontree").setting.async.dataFilter = AfaAppFunctionModel.getInstance().functionTreeFilter;
						
					},
					//在前端展示的树中添加 已添加保存在后台的节点 
					refreshData:function(){
						$("#afaAppFunctionPage_grid_resource").grid("reload");
						$("#afaAppFunctionPage_grid_resourcerule").grid("reload");
						
						var treeObj=AfaAppFunctionModel.getInstance().treeObj;
						if(treeObj!=null){
							treeObj.reAsyncChildNodes(treeObj.getNodes()[0], "refresh"); //根节点刷新树
							AfaAppFunctionModel.getInstance().treeObj=null;
						}
					},
					
					doSelections: function(action,callback){
						var data = $("#afaAppFunctionPage_grid_resourcerule").grid("getSelections");
						if(data.length == 0){
							$a.messager.error("请选择数据");
							return false;
						}
						var _self = this;
						_self.showPageCallBack = callback || function(){
						};
						_self.IndexAction = action;
						var url = "platform/appframe/resourcerule/afaappresourcerule/";
						if(_self.IndexAction == _self.ACTION.DELETE){
							url += "doDeleteSelections.do";
						}else if(_self.IndexAction == _self.ACTION.ENABLE){
							url += "doEnableSelections.do";
						}else if(_self.IndexAction == _self.ACTION.DISABLE){
							url += "doDisableSelections.do";
						}else if(_self.IndexAction == _self.ACTION.HIDDEN){
							url += "doHiddenSelections.do";
						}else if(_self.IndexAction == _self.ACTION.SHOW){
							url += "doShowSelections.do";
						}
						$app.ajax.ajaxCall({
							url: url,
							data: {data: JSON.stringify(data)},
							callback: function(json){
								if(_self.showPageCallBack){
									_self.showPageCallBack();
								}
							}
						});
					},
					//删除数据
					doDeleteData:function(data,e,confirm,callback){
						confirm = confirm || "确认删除当前记录？";
						 var _self=this;
						 _self.showPageCallBack = callback || function(){
						 };
						 $a.messager.confirm(confirm, {
							okCall : function() {
								var url = "";
								if(typeof data.ruleId != "undefined"){
									url = "platform/appframe/resourcerule/afaappresourcerule/doDelete.do";
								}else if(typeof data.resourceId != "undefined"){
									url = "platform/appframe/resource/afaappresource/doDelete.do";
								}else if(data.funcCode != "undefined"){
									url = "platform/appframe/function/afaappfunction/doDelete.do";
								}
								$app.ajax.ajaxCall({
									url : url,
									data : data,
									callback : function() {
										AfaAppFunctionModel.getInstance().refreshData();
										if(_self.showPageCallBack){
											_self.showPageCallBack();
										}
									}
								});
							}
						});
					},
					showEditPage: function(data,e){
						udlg.showPage(udlg.ACTION.EDIT,null,function(){
							$A("#afaUserPage_form").refreshFormData(data);
							 AfaAppFunctionModel.getInstance().refreshData();
						});
					},
					formatter: function(val,row,i){
						if(val == "disabled") return "禁用";
						if(val == "enable") return "启用";
						if(val == "hidden") return "隐藏";
						if(val == "show") return "显示";
					},
					showEditRulePage:function(data,e){
						dlg.showPage(dlg.ACTION.EDIT,data,function(){
							AfaAppFunctionModel.getInstance().refreshData();
						});
					},
					//控件属性重置
					initUIExtConfig : function() {
					    var _self=this;
						this.uiExtConfig={
							//格式 #控件id#:function(控件属性集类){ config.setAttr("控件属性名","属性值"),// 网格，下拉网格，特殊设置config.getColumn("网列id").setAttr("列属性名","列属性值")config.getButton("网格内包含的按钮id").setAttr("handler","点击事件")  }
                            afaUserPanelUserdetails:function(config){
								config.getButton("afaAppResourcePage_btnDelResource").setAttr("handler",_self.doDeleteData);
								config.getButton("afaUserPanel_grid_btnOrg").setAttr("handler",_self.showEditPage);
							}
						}
					}

		 });
		 AfaAppFunctionModel.getInstance=function(){
		     if (!this.instance){
		    	 this.instance =new AfaAppFunctionModel();
		     }
		     return this.instance;
		 }
		
		 return  AfaAppFunctionModel.getInstance();
	   })