<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="">
<meta name="author" content="">
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib uri="http://www.bosssoft.com.cn/tags" prefix="af"%>
<%@ include file="/WEB-INF/include/import.jsp" %>
<%@ page
	import="com.bosssoft.platform.runtime.spi.configuration.PropertiesUtil" %>
<link href="${ctx}/resources/common/themes/default/bossui.min.css?v=201604201034" rel="stylesheet" type="text/css" />
<link href="${ctx}/resources/common/themes/default/bosspage.min.css?v=201604201034" rel="stylesheet" type="text/css" />

<link href="${ctx}/resources/common/themes/default/formdesign/designico.css?v=201604201034" rel="stylesheet" type="text/css" />	
<link href="${ctx}/resources/common/themes/default/report/report.css?v=201604201034" rel="stylesheet" type="text/css" />


<%--
<link href="${ctx}/${app.name}/style/global.css?v=201604201034" rel="stylesheet" type="text/css" />
 --%>
	
<!--[if IE]>
<link href="${ctx}/resources/common/themes/css/ieHack.css?v=201604201034" rel="stylesheet" type="text/css" media="screen"/>
<![endif]-->
<!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
<!--[if lt IE 9]>
<script src="${ctx}/resources/common/js/base/html5.js?v=201604201034"></script>
<![endif]-->
<!--[if lte IE 9]>
<%--<script src="${ctx}/resources/common/js/speedup.js?v=201604201034" type="text/javascript"></script>--%>
<![endif]-->

<script>
	var _global_sessionId = "<%=session.getId()%>";
	<%
	   String cookieStr="";
		Cookie[] cookies=request.getCookies();
		if (null!=cookies){
			for (int i=0;i<cookies.length;i++){
				  Cookie cookie=cookies[i];
				  if (cookie.getName().equals("bosssoft.com.cn")||cookie.getName().equals("JSESSIONID")){
				  if (cookieStr.equals("")){
				 	 cookieStr=cookieStr+cookie.getName()+"="+cookie.getValue();
				  }else{
				  	cookieStr=cookieStr+";"+cookie.getName()+"="+cookie.getValue();
				  }
				}
			}
		}
		request.setAttribute("cookies", cookieStr);
		
	%>

	var _cookies="${cookies}";
	var _contextPath = "${ctx}";
	var _global_sessionId = "<%=session.getId()%>";
	var _caProvider="<%=PropertiesUtil.getProperty("sign.client.service.provider")%>";
	var _caCryptoType="<%=PropertiesUtil.getProperty("sign.provider.crypto.type")%>";
</script>