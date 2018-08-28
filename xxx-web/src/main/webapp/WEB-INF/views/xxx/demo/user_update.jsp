<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<%@taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@taglib uri="http://www.bosssoft.com.cn/tags" prefix="af"%>
<title>用户管理</title>
<style>
<!--
#afaUserPage_query{display:none;height:90px !important;}
-->
</style>
<af:jsfile path="resources/js/user_add.js"  id="user_add"  onPageLoad="user_add.init" />
<div class="dlg-box-head">
	<div class="dlg-box-head-right">
		<af:btnarea id="btns" displayType="DIALOG">

			<af:button id="afaUserPage_saveaddBtn" name="保存" icon="save48"
					   iconMode="TOP" css="hidden"></af:button>
			<af:button id="afaUserPage_closeBtn" name="关闭" icon="close48"
					   iconMode="TOP" css="hidden"></af:button>
		</af:btnarea>
	</div>
</div>
<div class="dialog-content">
	<af:page id="updateUserPage" />
</div>
