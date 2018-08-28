/**
 * 系统选项设置
 */
define(["app/core/app-core"],function($A){
	$A.frags={
			//aoo.dialog
			dialogFrag:'<div class="dialog" id="${dialogId}" >'
					+'<div class="dialog-header" onselectstart="return false;" oncopy="return false;" onpaste="return false;" oncut="return false;">'
						+'<div class="closebg"><a class="close">×</a></div>'
						+'<h5>${title}</h5>'
					+'</div>'
				+'</div>'
			,
			//app.dialog
			dialogNoHeaderFrag:'<div class="dialog" id="${dialogId}" style="visibility:hidden;"></div>'
			,
			// app.dialog shadow
			dialogProxy:'<div id="dialogProxy" class="dialog dialogProxy">'
						//+'<div class="dialog-header" >'
						//+'<div class="closebg"></div>'
						//+'<h5></h5>'
						//+'</div>'
					+'</div>'
			,
			//other  fragment
			globalBodyFrag:'<!--遮盖屏幕-->'
				+'<div id="_alertBackground" class="alertBackground"></div>'
				+'<div id="_dialogMask" class="dialog-mask"></div>'
			,
			//app.alertMsg
			alertBoxFrag:'<div id="_alertMsgBox" class="alert"><div class="alertContent"><i class="${icon}"></i><span><a href="javascript:void(0)" onclick="$A.messager.toggleDetail();">${message}</a></span><tpl if=\"\'${detail}\'!=\'\'\"><div id="__alertDetails" class="alertDetail" style=\"display:none;\">${detail}</div></tpl></div><div class="alertFooter"><div class="btn-toolbar">${butFragment}</div></div></div>'
			,
			alertBoxFrag_NoDetail:'<div id="_alertMsgBox" class="alert"><div class="alertContent"><i class="${icon}"></i><span>${message}</span><tpl if=\"\'${detail}\'!=\'\'\"><div id="__alertDetails" class="alertDetail" style=\"display:none;\">${detail}</div></tpl></div><div class="alertFooter"><div class="btn-toolbar">${butFragment}</div></div></div>'
			,
			//tips
			tipsBoxFrag:'<div id="_tipsMsgBox" class="tips"><div class="tipsContent"><i class="${icon}"></i><span><a href="javascript:void(0)">${message}</a></span></div></div>'
			,
			alertButFrag:'<a class="btn #css#" rel="#callback#" onclick="$A.messager.close()" href="javascript:">#butMsg#</a>'
			,
			navTabCM:'<ul id="navTabCM">'
					+'<li rel="reload">刷新标签页</li>'
					+'<li rel="closeCurrent">关闭标签页</li>'
					+'<li rel="closeOther">关闭其它标签页</li>'
					+'<li rel="closeAll">关闭全部标签页</li>'
				+'</ul>'
			,
			dialogCM:'<ul id="dialogCM">'
					+'<li rel="closeCurrent">关闭弹出窗口</li>'
					+'<li rel="closeOther">关闭其它弹出窗口</li>'
					+'<li rel="closeAll">关闭全部弹出窗口</li>'
				+'</ul>'
			,
			externalFrag:'iframe src="{url}" style="width:100%;height:{height};" frameborder="no" border="0" marginwidth="0" marginheight="0"></iframe>'
			,
			statusCode_503:'服务器当前负载过大或者正在维护!'
			,
			validateFormError:'提交数据不完整，{0}个字段有错误，请改正后再提交!'
			,
			sessionTimout:'会话超时，请重新登录!'
			,
			alertSelectMsg:'请选择信息!'
			,
			forwardConfirmMsg:'继续下一步!'
			,
			mainTabTitle:'我的主页'
	};
	return $A.frags;
});