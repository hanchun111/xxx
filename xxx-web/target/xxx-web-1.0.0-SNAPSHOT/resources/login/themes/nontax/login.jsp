<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<script src="<%=request.getContextPath()%>/resources/login/themes/nontax/js/index.js"></script>

<link rel="stylesheet"href="<%=request.getContextPath()%>/resources/login/themes/nontax/skins/default/login.css">
<link rel="stylesheet" href="<%=request.getContextPath()%>/resources/login/themes/nontax/skins/default/icon.css">

<body>
	<div class="login-wrapper">
		<div class="login-header">
			<div class="login-header-body">
				<div class="logo">
					<img src="<%=request.getContextPath()%>/resources/login/themes/nontax/custom/logo.png" width="605" height="76" />
				</div>
				<div id="login_toolbar" class="tool-wrapper">
					<ul>
						<li><a>插件下载</a></li>
						<li><a>帮助文档</a></li>
					</ul>
				</div>
			</div>
		</div>
		<div class="login-body">
		  
				<div class="login-body-bg">
		
			<div class="login-form">
				<div class="login-form-left" id="login_form_left">
					<div class="login-form-left-body">
					<div class="login-from-tabs">
						<ul class="ui-nav" id="J-loginMethod-tabs">
							<li data-status="J-login" id="tab-userLogin" class="active">账密登录</li>
							<li data-status="ca-login" id="tab-caLogin">CA登录</li>
							<br class="clear-float">
						</ul>
						<div class="login login-modern" id="J-login">
							<div class="error-box"></div>
					<form:form name="loginForm" id="loginForm" action="u/submitLogin.do" method="post">
							<div class="fm-item">
								<label id="J-label-user" class="ui-label"> <i
									class="icon-user"></i>
								</label> <input type="text" value="" placeholder="输入账号"
									 maxlength="100" name="ciphername"
									id="username" class="i-text" datatype="s3-32"
									nullmsg="请输入输入账号！" errormsg="用户名至少3个字符,最多18个字符！">
								<div class="ui-form-explain"></div>
							</div>
							<div class="fm-item">
								<label id="J-label-user" class="ui-label"> <span
									class="ui-icon ui-icon-userDEF"><i class="icon-password"></i></span>
								</label> <input type="password" placeholder="输入密码" value=""
									 maxlength="100" id="password"
									name="ciphercode" class="i-text" nullmsg="请输入密码！" datatype="*"
									errormsg="密码范围在6~16位之间！">
								<div class="ui-form-explain"></div>
							</div>
					
							<div class="fm-item">
								<label for="logonId" class="form-label"></label> <input
									type="submit" value="登  录" tabindex="4" id="send-btn"
									class="btn-login">
								<div class="ui-form-explain"></div>
							</div>
							<input
								type="hidden" name="rememberMe" value="false" /> <input
								type="hidden" name="_eventId" value="submit" /> <input
								type="hidden" name="loginType" value='1' />
						</form:form>
						</div>

					<div class="login login-modern" id="ca-login" style="display: none;">
					<div class="error-box"></div>
					
					<form:form id="jitLoginForm" name="jitLoginForm" method="post"
						class="jitLoginForm">
						<div>
							<input type="hidden" id="RootCADN" value="" style="width: 100px;" />
							<input type="hidden" id="signed_data" name="signed_data" /> <input
								type="hidden" id="original_jsp" name="original_jsp" />
						</div>
	<div class="fm-item" style="text-align: center;">
	<span style="font-size: 18px">请插入U-Key</span>
	</div>
				<div class="fm-item" >
							<input type="button" value="登  录" tabindex="4" id="ca-send-btn"
								onclick="jitLogin()" class="btn-login"> <input
								type="hidden" name="lt" value="${loginTicket}" /> <input
								type="hidden" name="execution" value="${flowExecutionKey}" /> <input
								type="hidden" name="_eventId" value="submit" /> <input
								type="hidden" name="loginType" value='2' /> <input
								type="hidden" name="password" value='1' /> <input type="hidden"
								name="username" value='1' />
						</div>
					</form:form>
				</div>
					</div>
				
				
				
				
				</div>
				<div class="login-form-right" id="login_form_right">
					<div class="login-form-right-body">
						<!--<div class="news">
							<div class="news-header">
								<i class="icon-gonggao"></i> <span>公告</span>
							</div>
							<div class="news-body">
								<ul id="ticker">

								</ul>
							</div>
						</div>-->
					</div>
				</div>

			</div>
			</div>
			</div>
		</div>
		<div class="login-footer">
			<div class="login-footer-body">版本信息：<span id="version"></span></div>
		</div>
		<script>
			<c:forEach var="error" items="${messages}">
			
					var objtip=$(".error-box");
					objtip.text('${error.text}');
			</c:forEach>
		</script>
</body>
</html>
