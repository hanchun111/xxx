
define(['bs-http-plugin/base-pluginvoke'], function(BasePluginvoke,Socket) {

    /**
     * @desc  POS刷卡 使用请引入 'bs-http-plugin/bs-webbillcard'
     * @class
     * @classdesc
     * @name bs-webbillcard
     * @extends base-pluginvoke
     */
    var WebBillCard = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-webbillcard
         * @instance
         * @example
         * module:'webbillcard'
         */
        module:'webbillcard',
        /**
         * @description 自动生成函数列表
         */
        functions:[


            /**
             * @property {string} ret_code 返回代码，除了0，其他都是错误的
             * @property {string} ret_msg 返回信息
             */

            /**
             * @function findCard
             * @instance
             * @memberOf bs-webbillcard
             * @description 找卡 若是新卡，则返回新卡信息列表
             {
                 "cardtype": "卡类型",
                 "carddevnum": "设备号",
                 "carddirnum": "逻辑卡号"
             }



             * @param {object} options
             * @param {string} options.haswritecard 是否写卡，0 未写卡 1 已写卡
             * @param {string} options.serialno  卡唯一标识，原二代卡号
             * @param {string} options.deptid C21285270CFB00B5764662909220F045
             * @returns {Result} 123123
             *
             * @example
             * var instance = WebBillCard.getInstance();
             * instance.findCard ({
             *      "haswritecard": "是否写卡，0 未写卡 1 已写卡",
             *      "serialno":  "卡唯一标识，原二代卡号",
             *      "deptid": "C21285270CFB00B5764662909220F045",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'findCard',


            /**
             * @function writeCard
             * @instance
             * @memberOf bs-webbillcard
             * @description 写卡
             * @param {object} options
             * @returns  {Result}
             *
             * @example
             * var instance = WebBillCard.getInstance();
             * instance.writeCard ({
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'writeCard',


            /**
             * @function finStkOutWriteCard
             * @instance
             * @memberOf bs-webbillcard
             * @description 财政端日常发放写卡
             * @param {object} options
             * @returns  {Result}
             *
             * @example
             * var instance = WebBillCard.getInstance();
             * instance.finStkOutWriteCard ({
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'finStkOutWriteCard',


            /**
             * @function agenStkOutWriteCard
             * @instance
             * @memberOf bs-webbillcard
             * @description 单位端票据下发写卡
             * @param {object} options
             * @returns  {Result}
             *
             * @example
             * var instance = WebBillCard.getInstance();
             * instance.agenStkOutWriteCard ({
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'agenStkOutWriteCard',


            /**
             * @function receiveReadCard
             * @instance
             * @memberOf bs-webbillcard
             * @description 数据采集读卡操作
             * @param {object} options
             * @returns  {Result}
             *
             * @example
             * var instance = WebBillCard.getInstance();
             * instance.receiveReadCard ({
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'receiveReadCard',


            /**
             * @function receiveAndUploadData
             * @instance
             * @memberOf bs-webbillcard
             * @description 数据采集开始采集
             * @param {object} options
             * @returns  {Result}
             *
             * @example
             * var instance = WebBillCard.getInstance();
             * instance.receiveAndUploadData ({
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'receiveAndUploadData',

            /**
             * @function receiveWriteCard
             * @instance
             * @memberOf bs-webbillcard
             * @description 数据采集完成写卡
             * @param {object} options
             * @returns  {Result}
             *
             * @example
             * var instance = WebBillCard.getInstance();
             * instance.receiveWriteCard ({
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'receiveWriteCard',

            /**
             * @function collectDelayWriteCard
             * @instance
             * @memberOf bs-webbillcard
             * @description 延长开票时间写卡
             * @param {object} options
             * @returns  {Result}
             *
             * @example
             * var instance = WebBillCard.getInstance();
             * instance.collectDelayWriteCard({
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'collectDelayWriteCard ',

            /**
             * @function collectDelayWriteCard
             * @instance
             * @memberOf bs-webbillcard
             * @description 延长开票时间写卡
             * @param {object} options
             * @returns  {Result}
             *
             * @example
             * var instance = WebBillCard.getInstance();
             * instance.collectDelayWriteCard({
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'collectDelayWriteCard ',
        ],
        Statics:{
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-webbillcard
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = WebBillCard.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance = new WebBillCard(op);
                }
                return this.instance;
            }
        }
    });
    return WebBillCard;
});