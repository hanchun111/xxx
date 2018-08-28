/**
 *
 *
 *
 */
var BOSS_CAS_CONFIG = {
    Title : ' '
}

var LoginClass=new function(){
	var LOGIN_CAS={}

	var initPage=function(){

		if (LOGIN_CAS.isNeedVerity != "true") {

			$('#verityExtDisplayStyle').remove();//验证码隐藏
		}

		loadConfig();
		var isFirst=0;

		$("#J-loginMethod-tabs li").click(function() {
			if (isFirst>0){
				$(".error-box").html("");
			}
			isFirst++;
			$("#J-loginMethod-tabs li").removeClass("active");
			$(this).addClass("active");

			var id = $(this).attr("data-status");
			$(".login-modern").hide();

			$("#" + id).show();
		})

		var uiLoginType = LOGIN_CAS.loginType;

		var LOGIN_TYPE_MAP = {
			"1" : "tab-userLogin",
			"2" : "tab-caLogin"
		}
		if (LOGIN_TYPE_MAP[uiLoginType]) {

			$("#" + LOGIN_TYPE_MAP[uiLoginType]).trigger("click");

			for (key in LOGIN_TYPE_MAP) {
				if (key != uiLoginType.toString()) {
					var contentId = $("#" + LOGIN_TYPE_MAP[key]).attr(
							"data-status");
					$("#" + LOGIN_TYPE_MAP[key]).remove();
					$("#" + contentId).remove();
				} else {
					$("#" + LOGIN_TYPE_MAP[key]).css("width", "100%");
					$("#" + LOGIN_TYPE_MAP[key]).show();
				}

			}
		} else {
			for (key in LOGIN_TYPE_MAP) {
				$("#" + LOGIN_TYPE_MAP[key]).show();
			}
			$("#" + LOGIN_TYPE_MAP["1"]).trigger("click");
		}

		$("#send-btn").bind("click",function(){
			$("#loginForm").Validform({
				//btnSubmit:'#send-btn',log
				tiptype:function(msg,o,cssctl){
				var objtip=$(".error-box");
				objtip.text("");
				cssctl(objtip,o.type);
				if (o.type==3){
					objtip.text(msg);
				}

			},
			beforeSubmit:function(curform){
				var username=$("#username").val();
				var password=$("#password").val();
				//
				if (LOGIN_CAS.isEncryptPassword=="1"){
					var pswd = MD5(username+"#"+password);
					$("#password").val(pswd);
				}else{

					var pswd = MD5(password);
					$("#password").val(pswd);
				}
			    $("#send-btn").attr("disabled", "disabled");
	            $("#send-btn").val("登录中")
				return true;
			},callback:function(result){
				var objtip=$(".error-box");
				if(result && result.status != 200){
					objtip.text(result.message);;
	    			$('#password').val('');
	    			  $("#send-btn").removeAttr("disabled");
	  	            $("#send-btn").val("登  陆")
	    			return;
	    		}else{
	    			objtip.text('登录成功！');
	    			window.location.href= result.back_url || "main.do";
	    		}
				//返回数据data是json格式，{"info":"demo info","status":"y"}
				//info: 输出提示信息;
				//status: 返回提交数据的状态,是否提交成功。如可以用"y"表示提交成功，"n"表示提交失败，在ajax_post.php文件返回数据里自定字符，主要用在callback函数里根据该值执行相应的回调操作;
				//你也可以在ajax_post.php文件返回更多信息在这里获取，进行相应操作；
				//ajax遇到服务端错误时也会执行回调，这时的data是{ status:**, statusText:**, readyState:**, responseText:** }；
				
				//这里执行回调操作;
				//注意：如果不是ajax方式提交表单，传入callback，这时data参数是当前表单对象，回调函数会在表单验证全部通过后执行，然后判断是否提交表单，如果callback里明确return false，则表单不会提交，如果return true或没有return，则会提交表单。
			},
			ajaxPost:true
			});
		})


		
		
		$(".i-text").focus(function(){
			$(this).parent(".fm-item").addClass('fm-item-focus');
		}).focusout(function(){
			$(this).parent(".fm-item").removeClass('fm-item-focus');
		})/*.hover(
				  function () {
					  $(this).parent(".fm-item").addClass('fm-item-hover');
					  },
					  function () {
						  $(this).parent(".fm-item").removeClass('fm-item-hover');
					 
					  }
					);*/

		

		$("#username").focus(function(){
			 var username = $(this).val();
			 if(username=='输入账号'){
				 $(this).val('');
			 }
		});

		$("#username").focusout(function(){
			var username = $(this).val();

		});


		$("#password").focus(function(){
			 var username = $(this).val();
			 if(username=='输入密码'){
				 $(this).val('');
			 }
		});


		$("#validateCode").focus(function(){
			 var username = $(this).val();
			 if(username=='输入验证码'){
				 $(this).val('');
			 }
		});

		/*$("#validateCode").focusout(function(){
			 var username = $(this).val();
			 if(username==''){

			 }
		});*/

	}
	//deConfig{isEncryptPassword:'密码是否加密'isNeedVerity:'是否需要验证验证'}
	var init=function(initConfig){
		var deConfig = {
				isNeedVerity : null,
				isEncryptPassword : null,
				loginType:'',
				authContent:"",
				theme:null,
				caprovider:null,
				caCryptoType:null

			};
		LOGIN_CAS = jQuery.extend(deConfig,initConfig);

		$(document).ready(function(){
			initPage();
		})
	//	loadTheme();
		/*if (LOGIN_CAS.theme){
			try{
			var theme=JSON.parse(LOGIN_CAS.theme)
			LOGIN_CAS.theme=theme;
			}catch(e){
				if (console.log){

					console.log("登陆配置出错")
				}

			}

		}*/




	}

	var  jitLogin=function(){
			
			var Auth_Content = LOGIN_CAS.authContent;
			if (Auth_Content == "") {
				alert("认证原文不能为空!");
				return;
			} 
        	$("#original_jsp").val(Auth_Content);
            var postData = {};
            $("#ca-send-btn").attr("disabled", "disabled");
            $("#ca-send-btn").val("登录中")
            casLogin.doSign({
                    signText:Auth_Content,
                    provider:LOGIN_CAS.caprovider,
                    cryptoType:LOGIN_CAS.caCryptoType,
                    success:function (data) {
                        $("#signed_data").val(data.sign_text);
                        
                        $.ajax({
							url : "u/doCALogin.do",
							data : {signType:LOGIN_CAS.caCryptoType,signContext:Auth_Content,signature:data.sign_text,certInfo:data.cert_info},
							type : "post",
							dataType : "json",
							success : function(data) {
								if(data.status=="200"){
									window.location.href=data.back_url;
								}
								if(data.status=="500"){
									 $(".error-box").html(data.message);
								}
							},
							error:function(){
								 alert('登录服务出错，请稍后再试！');
							}
						})
                    },
                    error:function (errorMsg) {
                        $("#ca-send-btn").removeAttr("disabled"); 
                        $("#ca-send-btn").val("登  陆");
                        $(".error-box").html(errorMsg);
                    },
                    clientError:function () {
                        alert('博思客户端未启动！');
                        $("#ca-send-btn").removeAttr("disabled"); 
                           $("#ca-send-btn").val("登  陆");
                    }
                })

            }
    window.jitLogin = jitLogin;

	var loadTheme=function(){
		var skin=LOGIN_CAS.theme["skin"]||"default";
		$("head").append('<link rel="stylesheet"href="'+LOGIN_CAS.context+'/frame/themes/'+LOGIN_CAS.theme.name+'/skins/'+skin+'/css/login.css"/>')
	    $("head").append('<link rel="stylesheet"href="'+LOGIN_CAS.context+'/frame/themes/'+LOGIN_CAS.theme.name+'/skins/'+skin+'/css/icon.css"/>')
	}
	var loadConfig=function(){
		document.title=LOGIN_CAS.theme.title;



	    var showType=LOGIN_CAS.theme.showType;

	    switch(showType){
	    case "2":
	    	$("#login_form_left").css({float:"right"});
	    	$("#login_form_right").css({float:"left"});
	    	 break;
	    case "3":
	    	$("#login_form_right").remove();
	    	break;
	    }

	   $("#version").html(LOGIN_CAS.theme.version);
	    if (LOGIN_CAS.theme.toolbar){
			var toolbar=LOGIN_CAS.theme.toolbar;
			$("#login_toolbar").find("ul").html("")

			for(var i=0;i<toolbar.length;i++){

				var item=toolbar[i];
				$("#login_toolbar").find("ul").append("<li><i class='"+item["icon"]+"'></i><span><a href='"+item["href"]+"'>"+item["text"]+"</a></span></li>")
			}

		}

	}

	return {
		 init:init

	}

}