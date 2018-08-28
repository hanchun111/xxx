
define(['bs-http-plugin/base-pluginvoke'], function(BasePluginvoke,Socket) {

    /**
     * @desc  PD刷卡 使用请引入 'bs-http-plugin/bs-pd'
     * @class
     * @classdesc
     * @name bs-pd
     * @extends base-pluginvoke
     */
    var Pd = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-pd
         * @instance
         * @example
         * module:'print'
         */
        module:'pd',
        /**
         * @description 自动生成函数列表
         */
        functions:[
            /**
             * @function doPd
             * @instance
             * @memberOf bs-pd
             * @description CA签名验证
             * @param {object} options
             * @returns {string} options.aUrl
             * @returns {string} options.aPdaName
             * @returns {string} options.aOrgCode
             * @returns {string} options.aPdId
             * @returns {string} options.aPdCode
             *
             * @example
             * var instance = Pd.getInstance();
             * instance.expPd({
             * aUrl: '',
             * aPdaName: '',
             * aOrgCode: '',
             * aPdId: '',
             * aPdCode: ''
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'expPd',


            /**
             * @function impPd
             * @instance
             * @memberOf bs-pd
             * @description CA签名验证
             * @returns {string} options.aUrl
             * @returns {string} options.aPdaName
             * @returns {string} options.aOrgCode
             * @returns {object}
             *
             * @example
             * var instance = Pd.getInstance();
             * instance.impPd({
             * aUrl: '',
             * aPdaName: '',
             * aOrgCode: '',
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'impPd'
        ],
        Statics:{
            /**
             * @static
             * @memberOf bs-pd
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = Pd.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance =new Pd(op);
                }
                return this.instance;
            }
        }
    });
    return Pd;
});