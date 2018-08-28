<%@ page isErrorPage="true" contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%
	response.setStatus(HttpServletResponse.SC_OK); //这句也一定要写,不然IE不会跳转到该页面
	String path=request.getContextPath();
	%>
 <%
	boolean ajax = "XMLHttpRequest".equals(request.getHeader("X-Requested-With")); 

%>

<%
	if(ajax){
		request.setAttribute("__enterReturn", "\r");
		request.setAttribute("__enterEnter", "\n");
		request.setAttribute("__other", "'");
		request.setAttribute("__other1", "\"");
		request.setAttribute("__other2", "\\");
		
%>
<c:set var="messeger" value="${fn:replace(error.stackTrace,__enterReturn,'')}"/>  
<c:set var="messeger" value="${fn:replace(messeger,__enterEnter,'<br/>')}"/>
<c:set var="messeger" value="${fn:replace(messeger,__other,'')}"/>
<c:set var="messeger" value="${fn:replace(messeger,__other1,'')}"/>
<c:set var="messeger" value="${fn:replace(messeger,__other2,'/')}"/>

<c:set var="msg" value="${fn:replace(error.message,__enterReturn,'')}"/>  
<c:set var="msg" value="${fn:replace(msg,__enterEnter,'<br/>')}"/>
<c:set var="msg" value="${fn:replace(msg,__other,'')}"/>
<c:set var="msg" value="${fn:replace(msg,__other1,'')}"/>
<c:set var="msg" value="${fn:replace(msg,__other2,'/')}"/>


{
	statusCode:300
	,message:"${msg}"
	<c:if test="${!error.isBusinessException}">
	,detail:"<div>错误发生页面是：${pageContext.errorData.requestURI}</div><!--${messeger}-->"
	</c:if>  
}
<%
	}else{
%>
<html>
<head>
<%@include file="/WEB-INF/include/header.jsp" %>
<title>404 ~ 页面不存在</title>
</head>
<body>
<div class="error">
    <h1> <span></span><span class="red" style="font-size:16px;">${error.message}</span></h1>
    <h3><a href="javascript:void(0)" onclick="$A('#details').toggle();">查看详细信息</a></h3>
</div>
<div class="errorDiv" id="details" style="display: none;">
	<div>错误发生页面是：${pageContext.errorData.requestURI}</div>
	<!-- ${error.stackTrace} -->
</div>
</body>
</html>
<%}%>