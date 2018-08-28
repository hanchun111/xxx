<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@page
	import="com.bosssoft.platform.runtime.spi.configuration.PropertiesUtil"%>
<%
	response.setHeader("Pragma", "No-cache");
	response.setHeader("Cache-Control", "no-cache");
	response.setDateHeader("Expires", -10);
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<title>登录</title>
<meta
	content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />
	<script type="text/javascript" src="<%=request.getContextPath()%>/resources/login/js/jquery.js"></script>
	<script type="text/javascript" src="<%=request.getContextPath()%>/resources/login/js/Validform_v5.3.2.js"></script>

	<script type="text/javascript" src="<%=request.getContextPath()%>/resources/login/js/MD5.js"></script>
	<script type="text/javascript" src="<%=request.getContextPath()%>/resources/login/js/login.js"></script>
	<script type="text/javascript" src="<%=request.getContextPath()%>/resources/login/js/cas-login.js"></script>
	<script type="text/javascript" src="<%=request.getContextPath()%>/resources/login/js/base64.js"></script>


<%
	String theme = PropertiesUtil.getProperty("web.theme");

	request.setAttribute("theme", theme);
%>
${ss}
<script>

<%String num = "1234567890abcdefghijklmnopqrstopqrstuvwxyz";
			int size = 6;
			char[] charArray = num.toCharArray();
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < size; i++) {
				sb.append(charArray[((int) (Math.random() * 10000) % charArray.length)]);
			}
			request.getSession().setAttribute("original_data", sb.toString());


			// 设置认证原文到页面，给页面程序提供参数，用于产生认证请求数据包
			request.setAttribute("original", sb.toString());
			
			String loginConfig = PropertiesUtil.getProperty("web.login.config");
			request.setAttribute("loginConfig", loginConfig);

			%>
			var themeConfig=${loginConfig};
			var loginConfig={
					theme:themeConfig,
					context:"<%=request.getContextPath()%>",
					loginType:<%=PropertiesUtil.getProperty("web.login.uilogintype")%>,
					authContent:"${original}",
					caprovider:"<%=PropertiesUtil.getProperty("sign.client.service.provider")%>",
					caCryptoType:"<%=PropertiesUtil.getProperty("sign.provider.crypto.type")%>"
			}
	LoginClass.init(loginConfig); 

</script>
</head>
<jsp:include page="../../resources/login/themes/nontax/login.jsp"></jsp:include>

</html>


