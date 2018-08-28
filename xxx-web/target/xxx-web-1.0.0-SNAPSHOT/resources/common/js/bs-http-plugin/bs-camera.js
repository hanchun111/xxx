define(['bs-http-plugin/base-pluginvoke',"bs-http-plugin/util/uuid"], function (BasePluginvoke,uuid) {

    /**
     * @desc 高拍仪 使用请引入 'bs-http-plugin/bs-camera'
     * @class
     * @classdesc
     * @name bs-camera
     * @extends base-pluginvoke
     */
    var Doccamera = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-camera
         * @instance
         * @example
         * module:'Doccamera'
         */
        module: 'camera',
        /**
         * @description 自动生成函数列表
         */
        functions: [
            'TakePhotoes',
            'GetImageList',
            'GetImageListWithoutBase64',
            'GetImages',
            'ClearImages'
        ],
        getPicture: function (id,method) {
            var me = this;
            var dfd = $.Deferred();
            var fn = function () {
                me[method]().then(function (data) {
                    if (data[id]) {
                        dfd.resolve(data[id]);
                    }
                    if (data[id] || data['state'] == 0) {
                        return
                    }
                    setTimeout(function () {
                        fn();
                    }, 2500);
                }).fail(function () {
                    dfd.rejectWith(dfd, arguments);
                })
            };
            fn();
            return dfd;
        },
        /**
         * @function takePicture
         * @instance
         * @memberOf bs-camera
         * @description 拍照
         * @returns {object}  $.Deferred().done(function(data){});
         * <pre>操作成功后 data数据结构 {
         *      success:true|false,
         *      message:'xxx',
         *      pictures:[
         *          {
         *              filename:'文件名',
         *              picture:'base64',
         *              type:'图片类型后缀'
         *          }
         *      ]
         * }
         * </pre>
         *
         * @example
         * var instance = CaAuth.getInstance();
         * instance.takePicture().done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
         */
        takePicture: function () {
            var me = this;
            var id = uuid.v4().replace(/-/g, '');
            return me.TakePhotoes({id:id}).then(function () {
                return me.getPicture(id,'GetImageList');
            })
        },

        /**
         * @function bufferTakePicture
         * @instance
         * @memberOf bs-camera
         * @description 高拍仪所拍摄拍的照片预存硬盘上，再读取
         * @returns {object}  $.Deferred().done(function(data){});
         * <pre>操作成功后 data数据结构 {
         *      success:true|false,
         *      message:'xxx',
         *      pictures:[
         *          {
         *              filename:'文件名',
         *              picture:'base64',
         *              type:'图片类型后缀'
         *          }
         *      ]
         * }
         * </pre>
         *
         * @example
         * var instance = CaAuth.getInstance();
         * instance.bufferTakePicture().done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
         */
        bufferTakePicture:function(){
            var dfd = $.Deferred();
            var me = this;
            var id = uuid.v4().replace(/-/g, '');
            return me.TakePhotoes({id:id}).then(function () {
                return me.getPicture(id,'GetImageListWithoutBase64');
            }).then(function (data) {
                return me.getImagesAndClean(id,data);
            })
        },
        getImgSize:2,
        getImagesAndClean:function (id,picInfo) {
            var me = this;
            var dfd = $.Deferred();
            var pictures = picInfo['pictures'];
            if(!$.isArray(pictures)){
                dfd.rejectWith(this,['picture is not array!']);
            }
            pictures = $(pictures).map(function (index,item) {
                return item['filename']
            }).toArray();
            var result = {};
            var respics = [];
            var fn = function () {
                if(pictures.length==0){
                    dfd.resolve(result);
                    me.ClearImages();
                    return;
                }
                me.GetImages({pictures:pictures.splice(0,me.getImgSize)}).then(function (data) {
					result = data[id];
                    respics = respics.concat(result['pictures']);
                    result['pictures'] = respics;
                    fn();
                    if (data[id] || data['state'] == 0) {
                        return
                    }
                }).fail(function () {
                    dfd.rejectWith(dfd, arguments);
                })
            }
            fn();
            return dfd;
        },
        Statics: {
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-camera
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = Doccamera.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance: function (op) {
                if (!this.instance) {
                    this.instance = new Doccamera(op);
                }
                return this.instance;
            }
        }
    });
    return Doccamera;
});