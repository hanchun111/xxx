/**
 * 
 * 
 * 
 * 
 * 
 */
define(["jquery","app/widgets/window/app-messager","app/data/app-ajax"],function($,$messager,$ajax){

	var MAIN_FRAME_CONFIG={};	
	var favoriteEl;
	var logout=function(){

			$messager.confirm("您确定要退出本次登录吗？",{okCall:function(){
				window.location.href = MAIN_FRAME_CONFIG.contextPath+"/logout";
			}});

	}

	
	var addFavoriteMenu=function(menuid,callbak){
		
		$ajax.ajaxCall({
			"data":{"menuId":menuid},
			"url":MAIN_FRAME_CONFIG.favoriteMenusConfig["saveUrl"],
			"success":function(data){
				if (callbak){
					
					callbak(data);
				}
				//var $dlg = $A.dialog.getCurrent();
				//$A.favoriteMenu.buildMenus(data.params["usedMenuList"]);
				//var $portlet = $A("#favorite_portlet",$A.getCurrentNavTab());
				
			}
		})
	}

	var buildFavoriteMenu=function(el,menus){
		if (!favoriteEl){
			
			favoriteEl=el;
		}
		var $ul=$(el);
		if (!menus){
			menus=MAIN_FRAME_CONFIG.favoriteMenus;
		}
		 
		if (!menus){
			
			return;
		}
		$ul.find("li:not(.setting)").remove();
		var n = menus.length>15?15:menus.length;
		for(var i=0;i<n;i++){
		var menu=menus[i]
			var $li = $("<li><a class=\"link\"  target=\"navTab\"  ><i class=\"icon-shoucang\"></i>"+menu.menuName+"</a></li>");
			$li.find("a")
			.attr("href",menu.menuUrl)
			.attr("data-id",menu.menuId)
			.attr("data-funCode",menu.funCode);
			$ul.append($li);
		}
		
		
	}
	
	
	
	var setFavoriteMenu = function(callback){
		$.openModalDialog({
			"url":MAIN_FRAME_CONFIG.favoriteMenusConfig["editUrl"],
			"dlgid":"portlet_commonlyusedmenu_setting",
			"title":"设置常用菜单",
			"dragTarget":"#dragTarget",
			"params":{},
			"hasheader" : false,
			"width":800,
			"height":600,
			afterClose:function(){
				$ajax.ajaxCall({
					"url":MAIN_FRAME_CONFIG.favoriteMenusConfig["getUrl"],
					"success":function(data){
					
						buildFavoriteMenu(favoriteEl,data.params["usedMenuList"]);
					}
				})
			}
		});
	}

	
	var updatePassWord = function(){
			$.openModalDialog({
				"url":MAIN_FRAME_CONFIG["editUserUrl"],
				"dlgid":"portlet_commonlyusedmenu_setting",
				"title":"个人设置",
				"params":{},
				"dragTarget":"#dragTarget",
				"hasheader" : false,
				"width":500,
				"height":500
			});
	}
	
	var tranPortlInfo=function(portal){
		
		var newPortal={
				portalets:[]
		}
		if (portal&&portal.portalets){
			for(var i=0,len=portal.portalets.length;i<len;i++){
				
				var portalet=portal.portalets[i];
				
				var newPortalet={
					code:portalet["portalCode"],
					title:portalet["portalTitle"],
					url:portalet["portalUrl"],
				}
				newPortal.portalets.push(newPortalet)
			}
			
		}
		return newPortal;
	}
	var init=function(config){
		var defaultConfig={
			 title:'',
			 theme:'',	
			 userInfo:'',
			 editUserUrl:"userProfile.do",
			 contextPath:'',
			 menus:null,
			 favoriteMenus:null,
			 favoriteMenusConfig:{
				saveUrl:'platform/portal/commonlyusedmenu/addUsedMenu.do',
				editUrl:'platform/portal/commonlyusedmenu/showSetting.do', 
				getUrl:'platform/portal/commonlyusedmenu/getCommonlyUsedMenus.do'
			 },
			 isMultiApp:false,
			 portal:null
		}
		MAIN_FRAME_CONFIG=$.extend(defaultConfig,config)

		if (MAIN_FRAME_CONFIG.title){
		  window.document.title=MAIN_FRAME_CONFIG.title;
			
		}
	
		$A.setPortal(tranPortlInfo(MAIN_FRAME_CONFIG.portal));	
		MAIN_FRAME_CONFIG["favorite"]={
			setFavoriteMenu:setFavoriteMenu,
			buildFavoriteMenu:buildFavoriteMenu,
			addFavoriteMenu:addFavoriteMenu
			
		}
		$("#userCode").html(MAIN_FRAME_CONFIG.userInfo["fcode"]||MAIN_FRAME_CONFIG.userInfo["userCode"]);
		var caInfo=null;
		if (MAIN_FRAME_CONFIG.userInfo["properties"]){
			//用户中心session
			if (MAIN_FRAME_CONFIG.userInfo["properties"]["caNo"]){
				caInfo={};
				caInfo["caNo"]=MAIN_FRAME_CONFIG.userInfo["properties"]["caNo"];
				caInfo["caSn"]=MAIN_FRAME_CONFIG.userInfo["properties"]["caSn"];
					
			}
			
		}else{
			if (MAIN_FRAME_CONFIG.userInfo["fcaNo"]){
				caInfo={};
				caInfo["caNo"]=MAIN_FRAME_CONFIG.userInfo["fcaNo"];
				caInfo["caSn"]=MAIN_FRAME_CONFIG.userInfo["fsn"];
			}
			
		}
		if (caInfo){
			
			$A.setCaInfo(caInfo);
		}
		var orgTree=MAIN_FRAME_CONFIG.userInfo["orgList"];
		if (orgTree&&orgTree.length>0){
			$("#orgName").html(orgTree[orgTree.length-1]["orgName"]);
		}else{
			$("#orgName").html("无部门");
		}
		var userOrgList=MAIN_FRAME_CONFIG.userInfo["userOrgList"];
		
		if (userOrgList&&userOrgList.length>0){
			
			for(var i=0;i<userOrgList.length;i++){
				var org=userOrgList[i];
				var actionCss="";
				if (org.main){
					actionCss="action";
				}
				var li=$('<li class="'+actionCss+'"><a href=\'javascript:void(0);\'><i class="icon-caret-right"></i><span>'+ org["orgName"] +'</span></a> </li>');
				var a=$("#orgList").append(li);
				
				li.data("org",org);
			}
			$("#orgList").addClass("dropdown-menu pull-center");
			$("#orgList").css({"width":"100%"})
			$('#bnt_orgList').find("li").on("click",function(){
				var $li=$(this);
				var indexOrg=$li.data("org")
				if (!$li.hasClass("action")){

					$ajax.ajaxCall({
						"data":indexOrg,
						"url":"doSwitchOrg.do",
						"success":function(data){
						 $('#bnt_orgList').find("li").removeClass("action");
							$li.addClass("action");
							
							 $("#orgName").html(indexOrg["orgName"]);
							 window.location.reload();
						}
					});
				}
				
				
				
				
			})
			
		}
		
		
		
		$("#btn_passwrod").on("click",updatePassWord);
		$("#btn_logout").on("click",logout);
		
		$(document).on('click',"a[target=navTab]", function (e) {
			e.preventDefault();
			var $this = $(this);
			var title = $this.attr("title") || $this.text();
			var tabid = $this.attr("rel") || "_blank";
			var fresh = eval($this.attr("fresh") || "true");
			var external = eval($this.attr("external") || "false");
			var menuId = $this.attr("menuId");
			var funcId = $this.attr("funcid");
			//var subSysId = $this.attr("subsysid");
		//	var url = unescape($this.attr("href")).evalTmById($(e.target).parents(".tabpage:first"));
			
			
			
			$A.getWorkSpace().addPage.call(this);
			//maintab.openTab(tabid, url,{title:title, fresh:fresh, external:external,menuId:menuId,funcId:funcId,subSysId:subSysId});
		});
		
		require(["resources/frame/themes/"+MAIN_FRAME_CONFIG.theme+"/js/index"],function(mainFrame){
			
			mainFrame.init(MAIN_FRAME_CONFIG);
			
		})
		
		
		
	}
	
	return {
		
		init:init
		
	}

})