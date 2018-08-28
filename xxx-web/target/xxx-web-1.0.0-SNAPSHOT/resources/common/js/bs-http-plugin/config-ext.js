
define(["app/core/app-core",],function ($A) {
    var config = {
        "bs-client-config":{
            //控件下载地址
            downloadUrl:$A.getHostUrl()+'resources/bsnetfun/bosssoft-assistant-v1.5.7.exe',
            //前端控件实例初始化时更新，如果客户端未启动，会在启动成功后再发一次更新请求
            initUpdate:true,
            //客户端更新地址，initUpdate为true时才起作用
            updateUrl:$A.getHostUrl()

        }
    }
    return config;
});