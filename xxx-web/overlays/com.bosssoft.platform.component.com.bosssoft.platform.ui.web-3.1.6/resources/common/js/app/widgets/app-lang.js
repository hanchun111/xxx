/**
 * 国际化
 *
 *
 * <%@ page import="com.bosssoft.platform.common.i18n.ResourceMessagesResolver" %>
 * <%@ page import="com.alibaba.fastjson.JSONObject" %>
 * <%
 *  request.setAttribute("resourceMessages",JSONObject.toJSONString(ResourceMessagesResolver.getInstance().getI18n()));
 * %>
 * <script>
 *  var _resourceMessages = ${resourceMessages};
 * <script>
 *
 * 使用$A.locale(key)
 *
 *
 */
(function (scope) {

    var defaultLocale = 'zh_cn';
    var resourceMessages = {
        test:'testMessage'
    };
    //设置国际化
    if(scope._resourceMessages){
        resourceMessages = scope._resourceMessages
    }
    var locale = function(key,locale){
        if(!locale){
            locale = defaultLocale;
        }
        return resourceMessages[locale][key];
    }
    if(window.require){
        define(['app/core/app-core'],function ($A) {
            $A.locale = locale
        });
    }
})(window);
