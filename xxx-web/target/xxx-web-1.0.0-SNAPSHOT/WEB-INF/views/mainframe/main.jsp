<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<%@page import="com.alibaba.fastjson.JSON"%>
<%@page import="com.bosssoft.cloud.xxx.utils.MenuUtils"%>


<%@page import="com.bosssoft.platform.shiro.token.TokenManager"%>
<%@page import="com.bosssoft.platform.runtime.spi.configuration.PropertiesUtil"%>


<%
	 String theme = PropertiesUtil.getProperty("web.theme");
	  request.setAttribute("theme", theme);
	 %>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8; IE=7; IE=EDGE" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<title></title>
<%@include file="/WEB-INF/include/header.jsp"%>

<link href="${ctx}/resources/frame/css/common.css?v=201604201034" rel="stylesheet" type="text/css" />
<link href="${ctx}/resources/common/themes/default/jqgrid.css?v=201604201034" rel="stylesheet" type="text/css" />

<link />
	  
<script type="text/javascript"> 


/*	var defaultConfig={
			 title:'',
			 theme:'',	
			 userInfo:'',
			 contextPath:'',
			 menus:null,
			 favoriteMenus:null,
			 isMultiApp:false,
			 indexPageUrl:,
		}*/
		
		var menus=<%=JSON.toJSONString(MenuUtils.getCurrentUserAndCurrentApplicationMenus())%>;
		var favoriteMenus=null;
		var portalets=null;

		 
		var userInfo={
				userCode:"system",
				userName:"测试用户",
				orgList:"",
				userOrgList:[]
		}
		 
		
		var _MainWebConfig={
		    userInfo:userInfo,
		  	menus:menus,
			editUserUrl:"platform/appframe/afauser/showPersonalSettings.do",

		  	theme:'<%=PropertiesUtil.getProperty("web.theme")%>',
		   	isMultiApp:'<%=PropertiesUtil.getProperty("web.ismultiapp")%>',
			favoriteMenus:favoriteMenus,
			 favoriteMenusConfig:{
					saveUrl:"platform/appframe/menu/afashortcutmenu/addShortcutMenu.do",
					editUrl:"platform/appframe/menu/afashortcutmenu/showIndex.do",
					getUrl:"platform/appframe/menu/afashortcutmenu/getShortcutMenuByUserCode.do"
				 },
				
			contextPath:'${ctx}',
		   	indexPageUrl:'${portletPage}',
		   	portal: {portalets:portalets},
			title:'<%=PropertiesUtil.getProperty("web.title")%>'
		};
	</script>

<jsp:include page="/resources/frame/themes/nontax/index.jsp"></jsp:include>

<script>
	var initAppJSPath="resources/frame/js/index";
</script>
<%@include file="/WEB-INF/include/footer.jsp"%>



<script data-main="${ctx}/resources/common/js/requireConfig.js" src="${ctx}/resources/common/js/require.js"></script>
 </html>
