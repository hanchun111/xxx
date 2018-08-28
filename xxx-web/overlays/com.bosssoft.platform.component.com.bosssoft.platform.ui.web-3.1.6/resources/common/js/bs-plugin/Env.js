/**
 * 环境参数
 * @class bs.plugin.Env
 * @static
 */
define([],function(){
	
	var libPath = "",
	    loc = window.location,
	    pathname = loc.pathname,
	    contextPath = "/",
	    pos = -1;

	if (pathname.charAt(0) != "/") {
		pathname = "/" + pathname;
	} else {
		//防止出现多个"/"
		pathname = pathname.replace(/^\/+/, "/");
	}

	pos = pathname.indexOf("/", 1);
	if (pos > 0) {
		contextPath = pathname.substr(0, pos);
	}
	var isIE = !!(window.ActiveXObject || "ActiveXObject" in window),
    isIE6 = /MSIE 6.0/ig.test(navigator.appVersion);
	return {

		/**
		 * @property 应用根路径
		 * @type {String}
		 */
		contextPath : contextPath,

		/**
		 * @property 插件根路径
		 * @type {String}
		 */
		libPath : libPath,

		/**
		 * 获取插件库的完整路径
		 */
		getPath : function(){
			return [loc.protocol, "//", loc.host, this.contextPath, this.libPath].join("");
		},
		getHostUrl:function(){
			return [loc.protocol, "//", loc.host, this.contextPath].join("");

		},
		isIE:isIE,
		isIE6:isIE6

	};
}
)