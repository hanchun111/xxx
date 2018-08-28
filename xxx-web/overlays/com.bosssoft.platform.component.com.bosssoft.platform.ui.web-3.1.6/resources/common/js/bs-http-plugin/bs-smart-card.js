
define(['bs-http-plugin/base-pluginvoke'], function(BasePluginvoke,Socket) {

    /**
     * @desc  POS刷卡 使用请引入 'bs-http-plugin/bs-smart-card'
     * @class
     * @classdesc
     * @name bs-smart-card
     * @extends base-pluginvoke
     */
    var SmartCard = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-smart-card
         * @instance
         * @example
         * module:'smart-card'
         */
        module:'smart-card',
        /**
         * @description 自动生成函数列表
         * @private
         */
        functions:[


            /**
             * @typedef {Object} Result  失败时返回
             * @property {string} errorCode 错误代码
             * @property {string} errorMsg 错误信息
             */


            /**
             * @typedef {Object} FindCardListResult
             * @property {String} serialNo 卡唯一识别码
             * @property {string} agenIdCode 单位识别码
             * @property {String} agenCode 单位编码
             * @property {string} agenName 单位名称
             */

            /**
             * @typedef {Object} ReadDataResult
             * @property {Object} data 业务数据
             */

            /**
             *
             * @typedef {ReadDataObjectResult[]} ReadDataByListResult
             */

            /**
             * @typedef {Object} ReadDataObjectResult
             * @property {String} bussType 业务类别
             * @property {Object} data 业务数据
             */

            /**
             * @typedef {Object} ReadDataByFileResult
             * @property {String} filePath 文件路径
             */


            /**
             * @typedef {Object} ReadCardInfoResult
             * @property {String} serialNo 卡唯一识别码
             * @property {string} rgnCode 区划
             * @property {String} agenIdCode 单位识别码
             * @property {string} agenCode 单位编码
             * @property {string} agenName 单位名称
             * @property {String} placeId 开票点ID
             * @property {string} cardOrgNo 发卡机构码
             * @property {string} cardType 卡类别
             */






            /**
             * @function FormatCard
             * @instance
             * @memberOf bs-smart-card
             * @description 格式化卡
             * @param {object} options
             * @param {string} options.serialNo 卡唯一标识
             * @param {string} options.producer 厂家
             * @returns {Result}
             *
             * @example
             * var instance = SmartCard.getInstance();
             * instance.FormatCard({
			 * 	    serialNo:"卡唯一标识",
			 * 	    producer:"厂家"
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'FormatCard',

            /**
             * @function InitCard
             * @instance
             * @memberOf bs-smart-card
             * @description 初始化卡
             * @param {object} options
             * @param {string} options.serialNo 卡唯一识别码
             * @param {string} options.rgnCode 区划
             * @param {string} options.agenIdCode 单位识别码
             * @param {string} options.agenCode 单位编码
             * @param {string} options.agenName 单位名称
             * @param {string} options.placeId 开票点ID
             * @param {string} options.cardOrgNo 发卡机构码
             * @param {string} options.cardType 卡类别
             * @param {string} options.producer 厂家
             * @returns {Result}
             *
             * @example
             * var instance = SmartCard.getInstance();
             * instance.InitCard({
             *      "serialNo":"卡唯一识别码",
             *      "rgnCode":"区划",
             *      "agenIdCode":"单位识别码",
             *      "agenCode":"单位编码",
             *      "agenName":"单位名称",
             *      "placeId":"开票点ID",
             *      "cardOrgNo":"发卡机构码",
             *      "cardType":"卡类别"，
             *      "producer": "厂家"
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'InitCard',


            /**
             * @function UpdateCard
             * @instance
             * @memberOf bs-smart-card
             * @description 更新卡信息
             * @param {object} options
             * @param {string} options.serialNo 卡唯一识别码
             * @param {string} options.rgnCode 区划
             * @param {string} options.agenIdCode 单位识别码
             * @param {string} options.agenCode 单位编码
             * @param {string} options.agenName 单位名称
             * @param {string} options.placeId 开票点ID
             * @param {string} options.cardOrgNo 发卡机构码
             * @param {string} options.cardType 卡类别
             * @param {string} options.producer 厂家
             * @returns {Result}
             *
             * @example
             * var instance = SmartCard.getInstance();
             * instance.UpdateCard({
             *      "serialNo":"卡唯一识别码",
             *      "rgnCode":"区划",
             *      "agenIdCode":"单位识别码,
             *      "agenCode":"单位编码",
             *      "agenName":"单位名称",
             *      "placeId":"开票点ID",
             *      "cardOrgNo":"发卡机构码",
             *      "cardType":"卡类别",
             *      "producer":"厂家",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'UpdateCard',


            /**
             * @function FindCardListByRgnCode
             * @instance
             * @memberOf bs-smart-card
             * @description 获取卡列表(按区划)
             * @param {object} options
             * @param {string} options.rgnCode 区划
             * @param {string} options.producer 厂家
             * @returns {FindCardListResult}
             * @example
             * var instance = SmartCard.getInstance();
             * instance.FindCardListByRgnCode({
             *      "rgnCode":"区划",
             *      "producer":"厂家",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(data){
			 * 		//TODO error
			 * })
             */
            'FindCardListByRgnCode',


            /**
             * @function FindCardListByAgenIdCode
             * @instance
             * @memberOf bs-smart-card
             * @description 获取卡列表(按单位识别码)
             * @param {object} options
             * @param {string} options.agentIdCode 单位识别码
             * @param {string} options.producer 厂家
             * @returns {FindCardListResult}
             * @example
             * var instance = SmartCard.getInstance();
             * instance.FindCardListByAgenIdCode({
             *      "agentIdCode":"单位识别码",
             *      "producer":"厂家",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(data){
			 * 		//TODO error
			 * })
             */
            'FindCardListByAgenIdCode',


            /**
             * @function WriteData
             * @instance
             * @memberOf bs-smart-card
             * @description 写卡(数据)
             * @param {object} options
             * @param {string} options.serialNo 卡唯一识别码
             * @param {string} options.bussType 业务类别
             * @param {string} options.producer 厂家
             * @param {object} options.data 业务数据
             * @returns {Result}
             * @example
             * var instance = SmartCard.getInstance();
             * instance.WriteData({
             *      "serialNo":"卡唯一识别码",
             *      "bussType":"业务类别",
             *      "producer":"厂家",
             *      "data":"业务数据"
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(data){
			 * 		//TODO error
			 * })
             */
            'WriteData',


            /**
             * @function ReadData
             * @instance
             * @memberOf bs-smart-card
             * @description 读卡(数据)
             * @param {object} options
             * @param {string} options.serialNo 单位识别码
             * @param {string} options.bussType 业务类别
             * @param {string} options.producer 厂家
             * @returns {ReadDataResult}
             * @example
             * var instance = SmartCard.getInstance();
             * instance.ReadData({
             *      "serialNo":"卡唯一识别码",
             *      "bussType":"业务类别"
             *      "producer":"厂家",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(data){
			 * 		//TODO error
			 * })
             */
            'ReadData',

            /**
             * @function ReadDataByList
             * @instance
             * @memberOf bs-smart-card
             * @description 读卡(数据)
             * @param {object} options
             * @param {string} options.serialNo 单位识别码
             * @param {Array} options.bussType 业务类别
             * @param {string} options.producer 厂家
             * @returns {ReadDataByListResult}
             * @example
             * var instance = SmartCard.getInstance();
             * instance.ReadDataByList({
             *      "serialNo":"卡唯一识别码",
             *      "bussType":"业务类别",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(data){
			 * 		//TODO error
			 * })
             */
            'ReadDataByList',



            /**
             * @function ReadDataByFile
             * @instance
             * @memberOf bs-smart-card
             * @description 读卡(文件)
             * @param {object} options
             * @param {string} options.serialNo 单位识别码
             * @param {string} options.bussType 业务类别
             * @param {string} options.producer 厂家
             * @returns {ReadDataByFileResult}
             * @example
             * var instance = SmartCard.getInstance();
             * instance.ReadData({
             *      "serialNo":"卡唯一识别码",
             *      "bussType":"业务类别",
             *      "producer":"厂家",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(data){
			 * 		//TODO error
			 * })
             */
            'ReadFile',


            /**
             * @function ReadCardInfo
             * @instance
             * @memberOf bs-smart-card
             * @description 读取基本信息
             * @param {object} options
             * @param {string} options.serialNo 卡唯一识别码
             * @param {string} options.producer 厂家
             * @returns {ReadCardInfoResult}
             * @example
             * var instance = SmartCard.getInstance();
             * instance.ReadCardInfo({
             *      "serialNo":"卡唯一识别码",
             *      "producer":"厂家",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(data){
			 * 		//TODO error
			 * })
             */
            'ReadCardInfo',


            /**
             * @function DeleteCardDataByBussType
             * @instance
             * @memberOf bs-smart-card
             * @description 删除卡数据(按业务类型删除)
             * @param {object} options
             * @param {string} options.serialNo 卡唯一识别码
             * @param {string} options.bussType 业务类别
             * @param {string} options.producer 厂家
             * @returns {Result}
             * @example
             * var instance = SmartCard.getInstance();
             * instance.DeleteCardDataByBussType({
             *      "serialNo":"卡唯一识别码",
             *      "bussType":"业务类别",
             *      "producer":"厂家",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(data){
			 * 		//TODO error
			 * })
             */
            'DeleteCardDataByBussType',


            /**
             * @function DeleteCardDataByBussId
             * @instance
             * @memberOf bs-smart-card
             * @description 删除卡数据(按业务单笔删除)
             * @param {object} options
             * @param {string} options.serialNo 卡唯一识别码
             * @param {string} options.bussType 业务类别
             * @param {string} options.bussId 业务识别码
             * @param {string} options.producer 厂家
             * @returns {Result}
             * @example
             * var instance = SmartCard.getInstance();
             * instance.DeleteCardDataByBussId({
             *      "serialNo":"卡唯一识别码",
             *      "bussType":"业务类别",
             *      "bussId":"业务识别码",
             *      "producer":"厂家",
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(data){
			 * 		//TODO error
			 * })
             */
            'DeleteCardDataByBussId',
        ],
        Statics:{
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-smart-card
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = SmartCard.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance =new SmartCard(op);
                }
                return this.instance;
            }
        }
    });
    return SmartCard;
});