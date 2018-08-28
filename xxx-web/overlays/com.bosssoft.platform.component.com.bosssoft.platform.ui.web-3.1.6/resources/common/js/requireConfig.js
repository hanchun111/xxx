require.config({
urlArgs: 'v=201603272040',
	baseUrl: _contextPath+"/resources/common/js/"
	, shim: {

		
		"base/json2": {
			exports: "JSON"
      	},
      	"base/dotpl-js": {
			exports: "dotpl"
      	},
      	"bootstrap/bootstrap": {
      		deps: ["jquery"],
      		exports: '$.fn.popover'
      	},
      	"jquery/jquery.validate": {
      		deps: ["jquery"],
      		exports: '$'
      	},
      	"jquery/jquery.history": {
      		deps: ["jquery","base/json2"],
      		exports: '$'
      	},
      	"jquery/jquery.jqgrid": {
      		deps: ["jquery"],
      		exports: '$'
      	},
      	"jquery/jquery.resize": {
      		deps: ["jquery"],
      		exports: '$'
      	},
      	"jquery/jquery.metadata": {
      		deps: ["jquery"],
      		exports: '$'
      	},
        "jquery/jquery.upload": {
            deps: ["jquery"],
            exports: '$'
        }
        // ,"dist/app": {
        //     deps: [
        //         "jquery"
        //     ]
        // }
	}
	, paths: {
		resources: _contextPath+"/resources/"
	},
    map: {
        '*': {
            'css': 'require-plugin/css.min' // or whatever the path to require-css is
        }
    }
});
/**
 * establish history variables
 */
var History = window.History; // Note: We are using a capital H instead of a lower h
var localeFile=(window.localeFile?window.localeFile:"app/widgets/app-lang_zh_CN");

var initJsList=["app/core/app-jquery","app/core/app-core","base/dotpl-js","app/app-funcbase","app/widgets/window/app-messager",
        		"app/util/app-utils","app/widgets/window/app-dialog","app/core/app-register","app/core/app-main","app/widgets/form/app-validate","base/template","app/widgets/app-lang"];

if (initAppJSPath){
	initJsList.push(initAppJSPath)
}

// require(["dist/app"],function () {
//
// }
require(initJsList, function ($,App,template,func,$messager,$utils,dialog,register,appmain,validate,extTemplate,appLang,appJSObj){
	window.jQuery = $;
	window.$=$;
	$.browser = {};
	$.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
	$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
	$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
	$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
	
	//当焦点在input中时，用退格键删除文字不会造成浏览器后退的问题
	$(document).on("keydown",function(e){
		if(e.keyCode==App.keyCode["BACKSPACE"]){
			var $target = $(e.target);
			if($target.is("input,textarea")){
				if($target.val()==""){
					return false;
				}else if($target.attr("readonly")){
					return false;
				}
			}
		}
	});
	
	window.$template=function(render,vars){
		return template.applyTpl(render,vars);
	};
	window.funcs = window.$funcs= func;
	window.$messager = $messager;
	window.$utils = $utils;
	/**
	 * 增加启动方法
	 */
	window.$app =window.$A=window.$a= App;
	$A.setContextPath(_contextPath);
	if (appJSObj&&appJSObj.init){
		if (typeof _MainWebConfig!="undefined"&&_MainWebConfig){
			
			appJSObj.init(_MainWebConfig);
		}else{
			appJSObj.init();
			
		}
		
	}
		

	App.boot();
	
});