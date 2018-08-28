
define(['bs-http-plugin/base-pluginvoke'], function(BasePluginvoke,Socket) {

    /**
     * @desc ca认证控件 使用请引入 'bs-http-plugin/bs-ca-auth'
     * @class
     * @classdesc
     * @name bs-ca-auth
     * @extends base-pluginvoke
     */
    var CaAuth = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-ca-auth
         * @instance
         * @example
         * module:'ca'
         */
        module:'ca',
        /**
         * @description 自动生成函数列表
         */
        functions:[
            /**
             * @function doSign
             * @instance
             * @memberOf bs-ca-auth
             * @description CA签名验证
             * @param {object} options
             * @param {string} options.signText 待签名串
             * @param {string} options.provider 签名供应者 'Jit'、'Kinsec'、'LNJH'
             * @returns {object}
             *
             * @example
             * var instance = CaAuth.getInstance();
             * instance.doSign({
			 * 	signText:'xxxx',
			 * 	provider:'Jit'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             *
             *
             * //会自动获取后台配置项，前提有配置全局变量     window._caProvider
             * var instance = CaAuth.getInstance();
             * instance.doSign('xxxx').done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doSign',

            'initParams'
        ],
        doSign:function (data) {
            if($.type(data)=='string'){
                data ={
                    signText:data,
                }
            }
            if($.type(data.provider)!='string'){
                data.provider = $A.getCaProvider();
            }
            if($.type(data.provider)!='string'){
                return $.Deferred().reject('CA验证提供商为空');
            }
            if($.type(data.cryptoType)!='string'){
                data.cryptoType = $A.getCaCryptoType();
            }
            //用户
            return this.operate({
                data:[data],
                func:'doSign'
            })
        },
        validateSN:function (data) {
            var cardInfo = $A.getCaInfo();
            if(!cardInfo||!cardInfo.caNo){
                var msg = "Ukey信息与当前ca产商不一致，请联系管理员！";
                return $.Deferred().reject(msg);
            }
            if($.type(data)=='string'){
                data ={
                    signText:data,
                }
            }
			data.certNo = cardInfo.caNo;
            return this.doSign(data)
        },
        Statics:{
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-ca-auth
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = CaAuth.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance =new CaAuth(op);
                }
                return this.instance;
            }
        }
    });
    return CaAuth;
});