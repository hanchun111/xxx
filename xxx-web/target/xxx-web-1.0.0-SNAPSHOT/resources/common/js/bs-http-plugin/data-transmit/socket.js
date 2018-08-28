/**
 * 跨域http数据传输
 * Created by qiu.yong on 2017/5/15.
 */

define(["jquery",
    "bs-http-plugin/util/uuid",
    "bs-http-plugin/config",
    "bs-http-plugin/data-transmit/message",
    "base/dotpl-js",
    "base/base64"
], function ($,uuid,config,msg) {

    //切割默认大小
    var sliceSize = config.sliceSize;
    //url最大长度 TODO 根据浏览器设置
    var urlMaxLen = 2000;
    var sendByIframeTimeout = 5*60*1000;
    //状态
    var STATE = {
        pending:{
            code:0,
            name:'pending',
            msg:'准备阶段'
        },
        sendData:{
            code:1,
            name:'sendData',
            msg:'发送数据'
        },
        sendDataCompleted:{
            code:2,
            name:'sendDataCompleted',
            msg:'发送数据完成'
        },
        invoking:{
            code:3,
            name:'invoking',
            msg:'dll调用'
        },
        invoked:{
            code:4,
            name:'invoked',
            msg:'dll调用完成并返回结果'
        },
        state:function(name,op){
            return $.extend(true,{},STATE[name],op);
        },
        //注册事件
        register:function (obj,fn) {
            if($.type(obj)==='undefined'){
                obj = {};
            }
            //注册状态事件
            var $eventObj = $(obj);
            var stateChange = $.isFunction(fn)?fn:$.noop;
            $eventObj.on('stateChange',stateChange);
            $eventObj.trigger('stateChange',[STATE.state('pending')]);
            return $eventObj;
        },
        //触发
        trigger:function ($eventObj,state,args) {
            if($.type(args)==='undefined'){
                args = [];
            }
            $eventObj.trigger('stateChange',[STATE.state(state)].concat([].slice.call(args,0)));
        }
    };

    var getRs = function () {
      return this.ret.ret_msg;
    };
    var Socket = function () {
    };
    Socket.prototype = {
        constructor:Socket,
        /**
         * 通过get跨域发送数据 后端给实现jsonp返回执行函数包裹结果集
         * @param op
         * {
         *  url:'xxx',
         *  sliceSize:500,//切割大小
         *  data:{
         *      xx:d,
         *      xx2:d2,
         *      payload:d3   //只有这个属性会被拆分编码
         *      },
         *  success:function(){
         *
         *  },
         *  error:function(){
         *
         *  },
         *  stateChange:function(){
         *
         *  }
         *  }
         */
        get: function (op) {
            var _self = this;
            //注册状态事件
            var $eventObj = STATE.register({},op.stateChange);
            //参数初始化
            op.success = $.isFunction(op.success)?op.success:$.noop;
            op.error = $.isFunction(op.error)?op.error:$.noop;
            //payload 初始化
            var payload = op.data;
            payload = $.type(payload)==='undefined'?{}:payload;
            // $.extend(op.data,{id:uuid.v4().replace(/-/g,'')});

            payload = JSON.stringify(payload);
            payload = _self.encodeURI(payload);
            var size = op.sliceSize?op.sliceSize:sliceSize;
            //校验url长度是否超标
            var _op = $.extend(true,{},op);
            delete _op.data.payload;
            var urlLen = op.url.length + JSON.stringify(_op.data).length+size;
            if(urlLen>urlMaxLen){
                throw new Error('url 长度超过超过可发送最大长度，请重新设置sliceSize!');
            }
            //切割
            var fragements = _self.sliceData(payload,size);
            //生成调用列表
            var ajaxRS = _self.generateAjaxArray(op,fragements);
            var dataSendCompletedAjaxConfig = ajaxRS.dataSendCompletedAjaxConfig;
            var ajaxConfig = ajaxRS.ajaxConfig;
            var deferreds = ajaxRS.deferreds;


            //发送数据包
            $(ajaxConfig).each(function (index,item) {
               $.ajax(item).done(item.success).fail(item.error);
            });
            STATE.trigger($eventObj,'sendData');
            var retDef = $.Deferred();
            //获取操作结果
            $.when.apply($,deferreds).done(function() {
                retDef.resolve.apply($,arguments);
                STATE.trigger($eventObj,'sendDataCompleted');
                dataSendCompletedAjaxConfig.success = function (data) {
                    STATE.trigger($eventObj,'invoked',arguments);
                    op.success.apply(op,arguments);
                };
                dataSendCompletedAjaxConfig.error = function (data) {
                    STATE.trigger($eventObj,'invoked',arguments);
                    op.error.apply(op,arguments);
                }
                //$.ajax(dataSendCompletedAjaxConfig);
                STATE.trigger($eventObj,'invoking');
            }).fail(function() {
                retDef.reject.apply($,arguments);
                STATE.trigger($eventObj,'invoked',arguments);
                op.error.apply(op,arguments);
            })
            return retDef;
        },
        /**
         * 通过post跨域发送，后端返回头部给添加相应跨域设置
         *
         * Access-Control-Allow-Origin 为允许哪些Origin发起跨域请求. 这里设置为”*”表示允许所有，通常设置为所有并不安全，最好指定一下。
         * Access-Control-Allow-Methods 为允许请求的方法.
         * Access-Control-Max-Age 表明在多少秒内，不需要再发送预检验请求，可以缓存该结果
         * Access-Control-Allow-Headers 表明它允许跨域请求包含content-type头，这里设置的x-requested-with ，表示ajax请求
         *
         * resp.setHeader( "Access-Control-Allow-Origin", "http://localhost:8080" );
         * resp.setHeader( "Access-Control-Allow-Headers", "x-requested-with" );
         * resp.setHeader( "Access-Control-Allow-Methods", "POST" );
         * resp.setHeader( "Access-Control-Max-Age", "3628800" );
         * @param op
         */
        post:function (op) {
            var _self = this;
            //注册状态事件
            var $eventObj = STATE.register({},op.stateChange);
            //参数初始化
            op.success = $.isFunction(op.success)?op.success:$.noop;
            op.error = $.isFunction(op.error)?op.error:$.noop;
            //payload 初始化
            var payload = op.data;
            payload = $.type(payload)==='undefined'?{}:payload;
            op.data = {id:uuid.v4().replace(/-/g,'')};
            payload = JSON.stringify(payload);
            payload = _self.base64Encode(payload);
            op.crossDomain = true;
            op.data.payload = payload;
            op.contentType = "application/x-www-form-urlencoded; charset=utf-8";
            op.dataType = "json";
            op.type = "POST";

            $.support.cors = true;
            //获取操作结果
            $.when($.ajax(op)).done(function() {
                STATE.trigger($eventObj,'invoked',arguments);
                op.success.apply(op,arguments);
            }).fail(function() {
                STATE.trigger($eventObj,'invoked',arguments);
                op.error.apply(op,arguments);
            });
            STATE.trigger($eventObj,'invoking');
        },
        send:function (op) {
            if(op.data){
                op.data = {
                    id:uuid.v4().replace(/-/g,''),
                    payload:JSON.stringify(op.data)
                }
                op.id = op.data.id;
            }
            return this.sendByIframe(op);
        },
        /**
         * 通过 form iframe post跨域发送数据 后端给实现window.parent.postMessage()返回执行执行
         * @param op
         * {
         *  url:'xxx',
         *  timeout:30000, //default 30000
         *  base64:true, //default true
         *  data:{
         *      xx:d,
         *      xx2:d2,
         *      payload:d3
         *      },
         *  success:function(){
         *
         *  },
         *  error:function(){
         *
         *  },
         *  stateChange:function(){
         *
         *  }
         *  }
         */
        sendByIframe:function (op) {
            var operateDefer = op['-operateDefer'];
            if($.type(operateDefer)==='undefined'){
                operateDefer = $.Deferred();
                op['-operateDefer'] = operateDefer;
            }
            var socketDefer = operateDefer;
            var _self = this;
            //注册状态事件
            var $eventObj = STATE.register({},op.stateChange);
            //参数初始化
            op.success = $.isFunction(op.success)?op.success:$.noop;
            op.error = $.isFunction(op.error)?op.error:$.noop;
            var $iframe = _self.createIframe(op);
            var $form = _self.createForm(op);
            var callback = function (data) {
                if($.type(data)==='undefined'){
                    data = {};
                }
                data['getResult'] = getRs;
                try {
                    var args = [data.getResult(),STATE.state('invoked')];
                    op.success.apply(this,args);
                    if(data.ret['ret_code']==='0'){
                        op.success.apply(op,args);
                        operateDefer.resolve.apply(operateDefer,args);
                    }else{
                        op.error.apply(op,args);
                        operateDefer.reject.apply(operateDefer,args);
                    }
                    $form.remove();
                    $iframe.remove();
                }catch (e){
                    args.push(e);
                    op.error.apply(this,args);
                    if(window.console){
                        window.console.error(e);
                    }else {
                        throw e;
                    }
                }
            };
            msg.set(op.data.id,callback);
            //保证 defer 方法队列先绑定
            setTimeout(function () {
                $form.submit();
            },0);
            //超时
            var timeout = op.timeout?op.timeout:sendByIframeTimeout;
            var startTime = new Date();
            var timer = setInterval(function(){
                var endTime = new Date();
                if(socketDefer.state()!=='pending'){
                    clearInterval(timer);
                    return;
                };
                if((endTime-startTime)>timeout){
                    op.error.apply(this,[{code:'timeout',msg:'超时'}]);
                    socketDefer.reject({code:'timeout',msg:'超时'});
                    clearInterval(timer);
                }
            },800);
            STATE.trigger($eventObj,'invoking');
            return socketDefer;
        },
        createIframe:function (op) {
            var template= '<iframe \
                                id="socketIframe${id}" \
                                name="socketIframe${id}" \
                                style="position:absolute; top:-9999px; left:-9999px">\
                            </iframe>';
            var $iframe = $(dotpl.applyTpl(template,op));
            $iframe.appendTo('body');
            return $iframe;
        },
        createForm:function (op) {
            if(!!op.func){
                op.invokeType = 'func';
                op.invokeValue = op.func;
            }else{
                op.invokeType = 'proc';
                op.invokeValue = op.proc;
            }
            var template= '<form id="socketForm${id}" name="socketForm${id}" \
                target="socketIframe${id}" \
                action="${url}" \
                method="post" \
                accept-charset="UTF-8" \
                > \
                </form>';
            var $form = $(dotpl.applyTpl(template,op));
            var fieldTemp = '<input type="hidden" name="" value="" />';
            if($.type(op.data)==='object'){
                for(field in op.data){
                    var $field = $(fieldTemp);
                    $field.prop('name',field);
                    $field.prop('value',op.data[field]);
                    $form.append($field);
                }
            }
            $form.appendTo('body');
            return $form;
        },
        /**
         * 拆分数据块
         */
        sliceData: function (data, size) {
            var fragments = [];
            var dataStr = '';
            if ($.type(data) === 'string') {
                dataStr = data;
            } else{
                dataStr = JSON.stringify(data);
            }
            var sum = Math.ceil(dataStr.length / size);
            for (var i = 0, start = 0; i < sum; i++, start += size) {
                fragments.push(dataStr.substr(start, size));
            }
            return fragments;
        },
        /**
         * 生成发送ajax数组
         * @param op
         * @param fragments
         * @returns {{ajaxConfig: Array, ajaxArray: Array}}
         */
        generateAjaxArray: function (op,fragments) {
            //ajax配置
            var ajaxConfig = [];
            //配置调用ajax调用
            var deferreds = [];
            var options =  {};
            $.extend(true,options,op);
            delete options.data.payload;
            var len = fragments.length;
            if(len===0){
                len = 1;
            }

            options.data.sum = len;
            var baseConfig = {
                url:op.url,
                timeout:options.timeout?options.timeout:5000,
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                dataType: 'jsonp',
                jsonp: 'jsonp',
                type:'GET'
            };
            for(var i = 0;i < len;i++){
                var data = {};
                var dfd = $.Deferred();
                deferreds.push(dfd.promise());
                $.extend(true,data,options.data);
                data.curr = i;
                if(typeof fragments[i]!=="undefined"){
                    data.payload = fragments[i];
                }
                var config = $.extend(true,{},baseConfig);
                config.success = (function(dfd){
                    return function(data){
                        dfd.resolve();
                    }
                })(dfd);
                config.error = (function(dfd){
                    return function(data){
                        dfd.reject();
                    }
                })(dfd);
                config.data = data;
                ajaxConfig.push(config);
            }
            var result ={
                dataSendCompletedAjaxConfig:$.extend(
                    true,{},
                    baseConfig,
                    options,
                    {
                        data:{
                            res:1
                        },
                        timeout:0
                    }
                ),
                ajaxConfig:ajaxConfig,
                deferreds:deferreds
            }
            return result;
        },
        /**
         */
        encodeURI: function (data) {
            return encodeURIComponent(data);
        },
        base64Encode:function (data) {
            return Base64.encode(data);
        }
    };

    var instant = new Socket();
    return instant;
});
