/**
 * Created by qiu.yong on 2017/5/16.
 */
define(["app/core/app-jquery","app/core/app-core","bs-http-plugin/config-ext"], function (AppCore,$A,GlobalConfig) {

    var Config = {
        version:'1.0',
        url:'http://127.0.0.1:13526/',
        guardUrl:'http://127.0.0.1:13528/controlMainApp',
        heartbeat:'heart',
        update:'update',
        startUrl:'BosssoftAssistant://',
        cookies: window._cookies||'no-cookies',
        timeout:2000,
        sliceSize:1024
    }
    if(location.href.match('^https://')!==null){
        Config.url = 'https://127.0.0.1:13526/';
        Config.guardUrl = 'https://127.0.0.1:13528/controlMainApp';
    }
    var gcfg = GlobalConfig["bs-client-config"];
    if(gcfg){
        $.extend(Config,gcfg);
    }
    return Config;
});