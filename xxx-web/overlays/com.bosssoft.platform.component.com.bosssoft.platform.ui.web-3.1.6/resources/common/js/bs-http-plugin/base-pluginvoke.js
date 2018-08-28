
define(["app/core/app-class",
    "app/core/app-attribute",
    "app/core/app-events",
    "bs-http-plugin/config",
    "bs-http-plugin/data-transmit/socket",
    "bs-http-plugin/util/uuid",
    "app/widgets/window/app-dialog",
    "app/widgets/window/app-messager",
    "base/dotpl-js",
    "app/app-funcbase",
    "base/base64"
], function (Class, Attribute, Events,Config,Socket,uuid) {

    //状态
    var STATE = {
        initParams:{
            code:0,
            name:'initializing',
            msg:'初始化'
        },
        initialized:{
            code:1,
            name:'',
            msg:'初始化完成'
        },
        state:function(name,op){
            return $.extend(true,{},STATE[name],op);
        }
    };


    /**
     * @desc 使用请引入 'bs-http-plugin/base-pluginvoke'
     * @class
     * @classdesc dll http 调用基类
     * @name base-pluginvoke
     * @extends Class
     *
     */
    var BasePluginvoke = Class.create({
        Implements: [Attribute, Events],
        /**
         * @type {string}
         * @description dll名称，可在第一次实例化时指定
         * @memberOf base-pluginvoke
         * @instance
         * @example
         * var p = BasePluginvoke.create({
         *      module:'print',
         *      config:{appId:'xxxx'}
         *  });
         */
        module:'',
        /**
         *
         * @type {object}
         * @description dll名称 ，可在第一次实例化时指定。
         * @memberOf base-pluginvoke
         * @example
         * BasePluginvoke.getInstance({
		 * 	config:{
		 * 		appId:'xxxx'
		 * 	}
		 * })
         *@instance
         */
        config:{appId:'bosssoft'},
        /**
         *
         * @type {boolean}
         * @description 调用博思客户端助手失败时是否自动弹出帮助对话框,如果设置为true请配置url地址。
         * @memberOf base-pluginvoke
         * @example
         * var instance = BasePluginvoke.getInstance({
		 * 	config:{
		 * 		appId:'xxxx'
		 * 	},
		 * 	isShowHelp:true
		 * })
         * instance.enableShowHelp();
         * instance.enableShowHelp('downloadUrl');
         * instance.disableShowHelp();
         *@instance
         */
        isShowHelp:true,

        /**
         *
         * @private
         * @type {string}
         * @description 博思客户端下载地址
         * @memberOf base-pluginvoke
         * @example
         * var instance = BasePluginvoke.getInstance({
		 * 	config:{
		 * 		appId:'xxxx'
		 * 	},
		 * 	isShowHelp:true,
		 * 	downloadUrl:'xxxxxxxxxxx'
		 * })
         * BasePluginvoke.setDownloadUrl('xxxxxxxxxx');
         *@instance
         */
        downloadUrl:Config.downloadUrl,
        /**
         * @memberOf base-pluginvoke
         * @type {array}
         * @description 自动生成函数列表。
         * @example
         *  var BsPrintX = BasePluginvoke.extend({
         *      functions:[
         *          {
         *           jsName:'initParams',    //js对象实例化后生成的方法吗
         *            dllName:'INIT_PARAMS',  //js对象方法调用后发送的请求参数，proc:'INIT_PARAMS'
         *            initRequired:false      //默认true，需要init返回的$.Deferred() 对象为resolve状态才能执行，为false时不需init返回的Deferred对象
         *        },
         *        'funts'//jsName = 'funts'，dllName = 'funts',initRequired = true
         *      ]
         *      //..........此处省略一坨代码
         * });
         *    var instance = BsPrintX.getIntance();
         *    instance.funts();
         * @instance
         */
        functions:[],
        /**
         * @memberOf base-pluginvoke
         * @type {array}
         * @description 自动生成函数列表。
         * @example
         *  var BsPrintX = BasePluginvoke.extend({
         *      processes:[
         *          {
         *           jsName:'initParams',    //js对象实例化后生成的方法吗
         *            dllName:'INIT_PARAMS',  //js对象方法调用后发送的请求参数，proc:'INIT_PARAMS'
         *            initRequired:false      //默认true，需要init返回的$.Deferred() 对象为resolve状态才能执行，为false时不需init返回的Deferred对象
         *        },
         *        'funts'//jsName = 'funts'，dllName = 'funts',initRequired = true
         *      ]
         *      //..........此处省略一坨代码
         * });
         *    var instance = BsPrintX.getIntance();
         *    instance.initParams()
         * @instance
         */
        processes:[],
        /**
         * @private
         * @param op
         */
        initialize: function (op) {
            var _self = this;
            $.extend(_self,op);
            if(Config.initUpdate){
                BasePluginvoke.clientUpdate(Config.updateUrl);
            }
            _self.addConfig('version',Config.version);
            if(typeof _self['module'] === "undefined"){
                throw new Error('请设置module属性!');
            }
            //方法初始化functions
            _self.initMethods(_self.functions,'func');
            //过程初始化processes
            _self.initMethods(_self.processes,'proc');
            //初始化
            _self.initStateDefer = _self.init();
        },
        /**
         * @private
         * @memberOf base-pluginvoke
         * 初始化方法集
         * @param array
         * @param type
         */
        initMethods:function (array,type) {
            var _self = this;
            if($.isArray(array)){
                $(array).each(function (index,funName,callType) {
                    if(typeof _self[funName] === "undefined"){
                        _self.generateFun(funName,type);
                    }
                })
            }
        },
        /**
         *
         * @private
         * @memberOf base-pluginvoke
         * @description 在调用由functions或者processes方法列表生成的js方法，如果需要添加配置项比如success、
         * error、stateChange等配置项时可先调用operateConfig方法提前设置，然后该方法会返回一个可调用自带function
         * @param operate   dll方法（必填）
         * @param options 方法调用配置（必填）
         * @example
         *  printInstance.operateConfig('doPos',{
         *      stateChange:function (event,state,data) {
         *          console.info('stateChange',state,data,new Date());
         *      }
         *  })('appCode',{Module:'dll'},{A:'AA'}).done(function (data) {
         *      console.log('config dos success',data);
         *  }).fail(function (obj) {
         *      console.log('config dos error',obj);
         *  });
         * @returns {Function}
         * @instance
         */
        operateConfig:function (operate,options) {
            var _self = this;
            if(!$.isFunction(_self[operate])) {
                throw new Error(operate+ " 不是函数...");
            }
            options['-isOptions-'] = true;
            return function () {
                var funcArray = [].slice.apply(arguments);
                funcArray.unshift(options);
                return  _self[operate].apply(_self,funcArray);
            }
        },
        /**
         * @private
         * @memberOf base-pluginvoke
         * 生成调用function
         */
        generateFun:function(funObj,callType){
            var _self = this;
            var jsName = '';
            var dllName = '';
            //校验并赋值
            if($.type(funObj)==='string'){
                jsName = dllName = funObj;
            }else if($.type(funObj)==='object'){
                jsName = funObj.jsName;
                dllName = funObj.dllName;
                if($.type(jsName)==='string' && $.type(dllName)==='undefined' ){
                    dllName = jsName;
                }
                if($.type(jsName)==='undefined' && $.type(dllName)==='string' ){
                    jsName = dllName;
                }
                if($.type(jsName)==='undefined' && $.type(dllName)==='undefined' ){
                    throw new Error('必须定义一个jsName 或者 dllName')
                }
            }
            var options = {
                module:_self.module
            };
            options[callType] = dllName;
            //根据-isOptions-属性判断是否是配置对象，如果没有配置对象则自动生成。
            _self[jsName] = function (op) {
                var callOp = _self._initArgs(arguments);
                $.extend(true,callOp,options);
                var operateDefer = _self.newOperation(callOp);
                var exec = function(){
                    return _self.operate.apply(_self,[callOp]);
                }
                //不需要初始化直接执行
                if(funObj.initRequired===false){
                    exec();
                    return operateDefer;
                }
                $.when(_self.initStateDefer)
                .done(function () {
                    exec();
                })
                .fail(function(){
                    operateDefer.reject.apply(operateDefer,arguments);
                    if(_self.isShowHelp){
                        _self.showHelp();
                    }
                });
                return operateDefer;
            };
        },
        /**
         * @private
         * @returns {object}
         * @instance
         */
        _initArgs:function (args) {
            var funArgs = [].slice.apply(args,[1]);
            var callOp = args[0];
            if(!($.type(callOp)==='object'&&callOp['-isOptions-']===true)){
                callOp = {};
                funArgs = [].slice.apply(args);
            }
            callOp.data = funArgs;
            return callOp;
        },
        /**
         * @private
         * @returns $.Deferred
         * @instance
         */
        newOperation:function (op) {
            return op['-operateDefer'] = $.Deferred();
        },
        setOperation:function (op) {
            if(op['-operateDefer']){
                return op['-operateDefer'];
            }
            return op['-operateDefer'] = $.Deferred();
        },
        /**
         * @private
         * @memberOf base-pluginvoke
         * @description 获取初始化状态$.Deferred对象
         * @returns  $.Deferred()
         * @example
         * printInstance.getInitState();
         * @instance
         */
        getInitState:function () {
            var _self = this;
            return _self.initStateDefer;
        },
        /**
         *
         * @private
         * @description 初始化回调函数，子类需要覆盖，必须返回$.Deferred(); $.Deferred() jquery版的promise实现，虽然不好，将就着用吧，等待兼容高版本浏览器
         * @returns $.Deferred();
         * @see 关于 $.Derferred http://www.ruanyifeng.com/blog/2011/08/a_detailed_explanation_of_jquery_deferred_object.html
         */
        init:function () {
            var defer = $.Deferred();
            defer.resolve();
            return defer;
        },
        /**
         *
         * @memberOf base-pluginvoke
         * @event
         * @virtual
         * @description 调用错误统一回调接口，子类需要覆盖
         * @param data {object} dll调用返回结果
         * @param state {object} 状态
         * @param state.code {number} 状态code
         * @param state.msg {number} 状态中文描述
         * @param state.name {number} 状态英文描述
         * @param ret  {object} dll调用返回结果,包含成功失败code
         * @instance
         */
        onError:function (data, state, ret) {
        },
        /**
         *
         * @memberOf base-pluginvoke
         * @private
         * @description 调用dll的公共操作方法{func:'funName',data:[]}
         * @param {object}  options
         * @param {string}  options.func dll调用方法名，func和proc只能存在一个
         * @param {string}  options.proc dll调用方法名，func和proc只能存在一个
         * @param {array}   object.data dll方法参数列表，按照dll方法参数顺序填写
         * @param {function}   object.stateChange 调用dll方法状态更新回调；第一个参数回调事件，第二个参数为回调返回的数据，只有invoked才有结果，其他都为undefined
         * @param {function}   object.success 调用dll方法成功回调；第一个参数为返回结果，第二个参数为事件
         * @param {function}   object.error 调用dll方法失败回调；第一个参数为返回结果，第二个参数为事件
         * @example
         *  var instantce = BasePluginvoke.create({
         *          module:'print',
         *          config:{
         *              app:'123'
         *          }
         *         });
         * instantce.operate(
         * {
         *    data:[ //dll方法参数列表，按照dll方法参数顺序填写
         *       'templateId',
         *       '001'
         *   ],
         *    func:'queryPrintTemplate',//dll方法名，相对的process为 proc:'queryPrintTemplate'
         *   stateChange:function (event,state,data) {   //调用dll方法状态更新回调
         *       console.info(state,data,new Date());
         *   }
         * }
         * ).done(function (data,state) { //成功后的回调，也可以在options中定义success:function(data,state){}
         *   console.info('done base call success      ',data);
         * }).fail(function (data,state) {//失败后的回调，也可以在options中定义error:function(data,state){}
         *   console.info('base call error      ',data);
         * });
         * @returns $.Deferred();
         *
         * @instance
         */
        operate: function (op) {
            var _self = this;
            var operateDefer = _self.setOperation(op);
            var id = uuid.v4().replace(/-/g,'');
            var data = {
                id:id,
                payload:Base64.encode(JSON.stringify({
                    config:_self.config,
                    data:op.data
                }))
            };
            if(op.func){
                data.func = op.func;
            }else if(op.proc){
                data.proc = op.proc;
            }
            var options = $.extend({},op,{
                id:id,
                url:Config.url + _self.module,
                data:data,
                sliceSize:op.sliceSize
            });
            //当发生错误时，回调onError
            var socketDefer = Socket.sendByIframe(options);
            var heartbeat = BasePluginvoke.heartbeat().fail(function () {
                _self.getInitState().reject.apply(_self.getInitState(),arguments);
                if(_self.isShowHelp){
                    _self.showHelp();
                }
            });
            var deferArray = [
                heartbeat,
                operateDefer,
                socketDefer
            ];
            $.when.apply($,deferArray).fail(function () {
                var args = [];
                args = args.concat([].slice.call(arguments,0));
                _self.onError.apply(_self,args);
                operateDefer.rejectWith(op,args);
            })
            return operateDefer;
        },
        /**
         * @memberOf base-pluginvoke
         * @private
         * @description 添加config配置
         * @example printInstance.addConfig('key',1);
         * @param key
         * @param value
         * @instance
         */
        addConfig:function (key,value) {
            if($.type(key)!=='string'){
                return;
            }
            this.config[key] = value;
        },
        /**
         *
         * @private
         * @description 删除config配置
         * @example printInstance.removeConfig('key');
         * @param key
         * @instance
         */
        removeConfig:function (key) {
            delete this.config[key];
        },
        /**
         * 注销方法
         * @private
         * @instance
         */
        destroy: function () {
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
        },
        /**
         * 绑定事件
         * @private
         * @param eventName
         * @param eventCallFun
         * @instance
         */
        bind: function (eventName, eventCallFun) {
            this.on(eventName, eventCallFun, this);
        },
        /**
         * 解除绑定
         * @private
         * @param eventName
         * @instance
         */
        unbind: function (eventName) {
            if (typeof eventName == "string") {
                this.off(eventName, null, this);
            }
        },
        /**
         * @private
         * @description  启用自动弹出帮助窗口,请配置url地址。
         * @memberOf base-pluginvoke
         * @param {string} url 下载url
         * @example
         * instance.enableShowHelp();
         * instance.enableShowHelp('downloadUrl');
         *@instance
         */
        enableShowHelp:function (url) {
            this.setDownloadUrl(url);
            this.isShowHelp = true;
        },
        /**
         *
         * @description  禁用自动弹出帮助窗口
         * @memberOf base-pluginvoke
         * @private
         * @example
         * instance.disableShowHelp();
         *@instance
         */
        disableShowHelp:function () {
            this.isShowHelp = false;
        },
        /**
         * @private
         * @description  配置下载url
         * @memberOf base-pluginvoke
         * @param {string} url 下载url
         * @example
         * instance.setDownloadUrl('xxxx');
         *@instance
         */
        setDownloadUrl:function (url) {
            // if($.type(url)==='string'){
            //     this.downloadUrl = url;
            // }
        },
        /**
         * @memberOf base-pluginvoke
         * @private
         * @description 添加config配置
         * @example printInstance.addConfig('key',1);
         * @instance
         */
        showHelp:function () {
            var _self = this;
            if($('#bsClientHelpDlg').length){
                return;
            }
            var html = '\
                    <div class="dlg-box-head" id="unInstallControl_dialog" style="height:50px;">\
                    <div class="dlg-box-head-left" id="dragTarget" style="height:40px;width:480px;display:inline;">\
                      <span class="dlg-box-head-title" style="font-size:18px">控件提示</span> <span class="dlg-box-head-text"></span>\
                        </div>\
                    <div class="dlg-box-head-right" style="width:60px;float:right;display:inline;">\
                    </div>\
                    </div>	\
                    <div class="dialog_content" style="height: 210px;">\
                    <div style="box-sizing: border-box;height:100px;padding:40px 20px 20px 20px;;font-size:16px;font-weight:normal;text-align:center;">本系统需要安装    <span style="color:red;">博思客户端助手</span>   才能保证正常运行</div> \
                    <div style="height:60px;padding:20px 20px;font-size:16px;font-weight:normal;text-align:center;"> \
                    <a id="startBtn" class="app-button l-btn l-btn-small" style="height:35px;background:#449d44;color:#fff;margin-right:20px;filter:none;">\
                            <span class="l-btn-left">\
                                <span class="l-btn-text" style="font-size:14px;padding-top:3px;">启动博思客户端</span>\
                            </span>\
                        </a>\
                    <a id="handlerStartBtn" data-url="${startUrl}" class="app-button l-btn l-btn-small" \style="height:35px;background: rgba(206, 52, 38, 0.8);color:#fff;margin-right:20px;filter:none;display:none;">\
                            <span class="l-btn-left">\
                                <span class="l-btn-text" style="font-size:14px;padding-top:3px;">手动启动博思客户端</span>\
                            </span>\
                        </a>\
                    <a id="downBtn" data-url="${downloadUrl}" class="app-button l-btn l-btn-small" \style="height:35px;background:#ec971f;color:#fff;margin-right:20px;filter:none;">\
                            <span class="l-btn-left">\
                                <span class="l-btn-text" style="font-size:14px;padding-top:3px;">下载博思客户端助手</span>\
                            </span>\
                        </a>\
                    <a id="closeBtn" class="app-button l-btn l-btn-small" style="height:35px;background:#e6e6e6;color:#333;margin-right:20px;">\
                            <span class="l-btn-left">\
                                <span class="l-btn-text" style="font-size:14px;padding-top:3px;">关闭提示</span>\
                            </span>\
                        </a>\
                    </div> \
                    </div>';

            // 获取未安装打印控件界面
            var $node = $(dotpl.applyTpl(html,{
                downloadUrl:_self.downloadUrl,
                startUrl:Config.startUrl
            }));
            $node.find('#downBtn').on('click',function () {
                window.open($(this).data('url'),'下载博思客户端')
            });
            $node.find('#handlerStartBtn').on('click',function () {
                window.open($(this).data('url'),'通过浏览器手动启动博思客户端')
            });
            $node.find('#startBtn').on('click',function () {
                var timeout = 2500;
                Socket.get({
                    url:Config.guardUrl+"?ct=2",
                    timeout:10000,
                    data:{
                        payload:{

                        }
                    }
                }).done(function () {
                    $('#bsClientHelpDlg').fadeOut(1000);
                    $A.messager.correct('启动成功!',3000);
                    setTimeout(function () {
                        $('#bsClientHelpDlg').closeDialog();
                        if(Config.initUpdate){
                            BasePluginvoke.clientUpdate(Config.updateUrl);
                        }
                    },timeout);
                }).fail(function () {
                    $A.messager.warn('启动失败，请尝试手动启动或重新安装博思客户端...');
                    $('#startBtn').hide();
                    $('#handlerStartBtn').css('display','inline-block');
                }).always(function () {
                });
            });
            // 绑定取消事件
            $node.find("#closeBtn").bind("click",function(){
                $('#bsClientHelpDlg').closeDialog();
            });
            var options = {
                dialogId : "bsClientHelpDlg",
                hasheader : false,
                height : '260px',
                width : '200px',
                mode : "node",
                url : $node,
                beforeClose:function () {

                },
                onPageLoad:function(){

                }
            }
            $.openModalDialog(options);
        },

        Statics:{
            /**
             * @static
             * @memberOf base-pluginvoke
             * @function create
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)

             * @param {string} op.module 模块名称(<span style="color:red">必填</span>)
             * @example
             *         var instantce = BasePluginvoke.create({
             *          module:'print',
             *          config:{
             *              app:'123'
             *          }
             *         });
             */
            create:function (op) {
                return new BasePluginvoke(op);
            },
            /**
             * @static
             * @function heartbeat
             * @memberOf base-pluginvoke
             * @param {number} time
             * @description 心跳检查bs客户端是否启动。心跳检查响应时间设置，默认是3000毫秒
             * @example
             * BasePluginvoke.heartbeat(1500).done(function(){
             *  console.log('success');
             * }).fail(function(){
             *  console.log('error');
             * })
             */
            heartbeat:function (time) {
                if(!$.isNumeric(time)){
                    time = Config.timeout;
                }
                var heart = $.Deferred();
                var jsonp = 'heartbeat_'+ uuid.v4().replace(/-/g,'');
                window[jsonp] = function () {
                    heart.resolve();
                }
                var headNode = document.getElementsByTagName('head')[0];
                var scriptNode = document.createElement('script');
                scriptNode.type = 'text/javascript';
                scriptNode.charset = 'utf-8';
                scriptNode.async = true;
                scriptNode.src = Config.url + Config.heartbeat + '?jsonp='+jsonp;
                var step = time/2;
                var timeconsum = 0;
                var interval = setInterval(function () {
                    timeconsum += step;
                    if(timeconsum>=time){
                        window[jsonp] = undefined;
                        clearInterval(interval);
                        if(heart.state() == 'pending'){
                            heart.reject({code:'timeout',msg:'超时'})
                        }
                    }
                },step);
                headNode.appendChild(scriptNode);
                return heart;
            },
            clientUpdate:function (url,time) {
                if(!$.isNumeric(time)){
                    time = Config.timeout;
                }
                return Socket.get({
                    url:Config.url+Config.update,
                    timeout:time,
                    data:{
                        url:url,
                        payload:{

                        }
                    }
                }).done(function () {

                }).fail(function () {

                });
            }
        }
    });



    return BasePluginvoke;
});