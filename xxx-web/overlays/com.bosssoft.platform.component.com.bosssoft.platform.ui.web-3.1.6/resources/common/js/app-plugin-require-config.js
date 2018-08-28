window.localeFile = (window.localeFile ? window.localeFile : "app/widgets/app-lang_zh_CN");
window.bossJS = {
    init: function (options) {
        if(!!!options || typeof options != "object"){
            options = {};
        }
        if (!!!options.jquery) {
            if (window.jQuery&&jQuery.fn.jquery){
                options.jquery = window.jQuery
            }else if(window.$&&$.fn.jquery){
                options.jquery = window.$
            }else {
                throw new Error("jquery undefied");
            }
        }
        if(!!!options.path){
            options.path =  "";
        }
        require.reg({
            "id":"jquery",
            "export":options.jquery
        })
        window._contextPath = options.path;
        require.config({
            baseUrl: _contextPath
            , shim: {
                "base/json2": {
                    exports: "JSON"
                },
                "base/dotpl-js": {
                    exports: "dotpl"
                }
            }
        });
        /**
         * establish history variables
         */

        var initJsList = [
            "app/core/app-jquery",
            "app/core/app-core",
            "base/dotpl-js",
            "app/app-funcbase",
            "app/widgets/window/app-messager",
            "app/util/app-utils",
            "app/widgets/window/app-dialog"];
        require.sync(initJsList, function ($, App, template, func, $messager, $utils, dialog) {
            window.jQuery = $;
            window.$ = $;
            window.$template = function (render, vars) {
                return template.applyTpl(render, vars);
            };
            window.$messager = $messager;
            window.$utils = $utils;
            /**
             * 增加启动方法
             */
            window.$app = window.$A = window.$a = App;
            require.sync([
                "bs-http-plugin/bs-ca-auth",
                "bs-http-plugin/bs-doccamera",
                "bs-http-plugin/bs-pd",
                "bs-http-plugin/bs-pos",
                "bs-http-plugin/bs-print",
                "bs-http-plugin/data-transmit/socket"], function (CA, DocCamera, PD, POS, Print, Socket) {
                window.bossJS = {
                    CA: CA,
                    DocCamera: DocCamera,
                    PD: PD,
                    POS: POS,
                    Print: Print,
                    Socket: Socket
                }
            });
        });
        return bossJS;
    }
};

