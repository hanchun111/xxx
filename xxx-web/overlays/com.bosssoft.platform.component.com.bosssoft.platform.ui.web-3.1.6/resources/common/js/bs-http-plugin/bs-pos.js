
define(['bs-http-plugin/base-pluginvoke'], function(BasePluginvoke,Socket) {

    /**
     * @desc  POS刷卡 使用请引入 'bs-http-plugin/bs-pos'
     * @class
     * @classdesc
     * @name bs-pos
     * @extends base-pluginvoke
     */
    var Pos = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-pos
         * @instance
         * @example
         * module:'print'
         */
        module:'pos',
        /**
         * @description 自动生成函数列表
         */
        functions:[
            /**
             * @function doPos
             * @instance
             * @memberOf bs-pos
             * @description CA签名验证
             * @param {object} options
             * @param {string} options.totalAmt 金额
             * @param {string} options.posNo POS机号
             * @param {string} options.posPNo POS员工号
             * @param {string} options.transDate 交易日期
             * @param {string} options.transNo 交易号
             * @param {string} options.transVoucher 交易凭证
             * @param {string} options.letterNo 缴款码
             * @param {string} options.transType 交易类型
             * @param {string} options.account 账号
             * @returns {object}
             *
             * @example
             * var instance = Pos.getInstance();
             * instance.doPos({
			 * 	totalAmt:'xxxx',
			 * 	posNo:'xxxx',
			 * 	posPNo:'xxxx',
			 * 	transDate:'xxxx',
			 * 	transNo:'xxxx',
			 * 	transVoucher:'xxxx',
			 * 	letterNo:'xxxx',
			 * 	transType:'xxxx',
			 * 	account:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doPos',

            'initParams'
        ],
        Statics:{
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-pos
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = Pos.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance =new Pos(op);
                }
                return this.instance;
            }
        }
    });
    return Pos;
});