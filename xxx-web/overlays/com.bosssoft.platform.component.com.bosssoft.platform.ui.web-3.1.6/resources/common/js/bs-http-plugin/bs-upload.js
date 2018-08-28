
define(['bs-http-plugin/base-pluginvoke',
    'app/widgets/grid/app-grid'], function(BasePluginvoke) {

    /**
     * @desc 文件上传控件 使用请引入 'bs-http-plugin/bs-upload'
     * @class
     * @classdesc
     * @name bs-upload
     * @extends base-pluginvoke
     */
    var Upload = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-upload
         * @instance
         * @example
         * module:'upload'
         */
        module:'upload',
        /**
         * @description 自动生成函数列表
         */
        functions:[
            /**
             * @function uploadFile
             * @instance
             * @memberOf bs-upload
             * @description 上传文件
             * @param {object} options
             * @param {string} options.file 文件上传名称
             * @param {string} options.url 保存url
             * @returns {object}
             *
             * @example
             * var instance = Upload.getInstance();
             * instance.uploadFile({
			 * 	file:'xxxx',
			 * 	url:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'uploadFile',

            'uploadIsComplete',

            'getCurrentProgress',

            'getFileList',

            'removeFile',

            'resumeUpload',

            /**
             * @function executeFile
             * @instance
             * @memberOf bs-upload
             * @description 调用DataInteraction.dll中executeFile方法
             * @param {object} options
             * @param {string} options.file 文件全路径
             * @returns {object}
             *
             * @example
             * var instance = Upload.getInstance();
             * instance.executeFile({
			 * 	file:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'executeFile'
        ],
        init: function () {
            var dfd = $.Deferred();
            var my = this;
            my.render();
            my.bindEvents();
            dfd.resolve();
            return dfd;
        },
        render:function () {
            var my = this;
            //ui-draggable ui-draggable-handle
            //<input type="text" name="files[]" multiple="">
            this.$container =$('<div class="upload-box ">\
                <div class="upload-box-header ">\
                    <span class="upload-box-title">文件上传进度</span>\
                    <span id="closeBtn" class="title-btn" title="关闭">×</span>\
                    <span id="zoomBtn" max=true class="title-btn" title="最小化">-</span>\
                </div>\
                <div class="upload-box-body">\
                    <table style="display: none;"/>\
                </div>\
                </div>');
            this.$zoomBtn = this.$container.find('#zoomBtn');
            this.$closeBtn = this.$container.find('#closeBtn');
            this.$body = this.$container.find('.upload-box-body');
            this.$table = this.$container.find('table');
            this.$file = this.$container.find('.upload-add-btn');
            this.$table.grid({
                url: '',
                rownumbers: 'normal',
                height: 165,
                pager: 'none',
                columns: [[
                    {
                        title: '文件名称', field: 'path', width: 121, align: 'left',showTitle:true
                    },
                    {
                        title: '进度', field: 'percent',width:150, align: 'left',
                        formatter:function (val) {
                            var data = {
                                width:val,
                                radius:(val>96)?'10px':'10px 0px 0px 10px'
                            }
                            return dotpl.applyTpl('<div class="upload-progress-bar">' +
                                '<div class="progress-percent" style="width:${width}%;border-radius: ${radius};"></div>' +
                                '<span class="progress-text">${width}%</span>' +
                                '</div>',data);
                        }
                    },
                    {
                        title: '操作', field: 'state', width: 80, align: 'center',
                        formatter: function(val,data){
                            //0 暂停，1 上传， 2 完成, 3 错误
                            var btns = '\
                                    <div><i class="upload-btn bs-font bs-ui-start" title="开始"></i>\
                                    <i class="upload-btn bs-font bs-ui-pause" title="暂停"></i>\
                                    <i class="upload-btn bs-font bs-ui-delete" title="删除"></i></div>\
                            ';
                            var $btns = $(btns);
                            $btns.css('padding-top','3px');
                            $btns.find('.bs-font').hide();
                            $btns.find('i').attr('data-item',encodeURIComponent(JSON.stringify(data)));
                            $btns.find('i').attr('data-file',data.path);
                            switch (val){
                                case 0://0 暂停
                                    $btns.find('.bs-ui-start').show();
                                    $btns.find('.bs-ui-delete').show();
                                    break;
                                case 1://1 上传
                                    $btns.find('.bs-ui-delete').show();
                                    break;
                                case 2://2 完成

                                    break;
                                case 3://3 错误
                                    $btns.find('.bs-ui-delete').show();
                                    break;
                            }
                            return $btns.html();
                        }
                    }
                ]]
            });
            my.setAutoRefresh(true);
            my.$container.hide().prependTo('body');
        },
        bindEvents:function(){
            var my = this;
            // this.$container.resizable({
            //     maxHeight: 350,
            //     maxWidth: 400,
            // });
            my.$container.find('.upload-box-body').on('click',function (e) {
                if($(e.target).is('.bs-ui-start')){
                    my.resumeUpload({file:$(e.target).data('file')}).done(function () {
                        my.setAutoRefresh(true);
                    }).fail(function () {
                        my.setAutoRefresh(false);
                    });
                }
                if($(e.target).is('.bs-ui-pause')){
                    my.pauseUpload({file:$(e.target).data('file')}).done(function () {
                        my.setAutoRefresh(true);
                    }).fail(function () {
                        my.setAutoRefresh(false);
                    });
                }
                if($(e.target).is('.bs-ui-delete')){
                    var $bn =$(e.target);
                    var data = JSON.parse(decodeURIComponent($bn.data('item')));
                    my.removeFile({file:$bn.data('file'),DelSrvFile:1}).done(function () {
                        my.emitDelSuccess(arguments,data);
                        my.setAutoRefresh(true);
                    }).fail(function () {
                        my.emitDelError(arguments,data);
                        my.setAutoRefresh(false);
                    });
                }
            })
            this.$container.draggable({
                handle: '.upload-box-header',
                distance: 20,
                scroll:true,
                containment: 'body',
                stop: function(event){
                    my.containerTop = my.$container.css('top');
                    my.containerLeft = my.$container.css('left');
                }
            });
            this.$closeBtn.on('click',function(){
                my.setAutoRefresh(false);
                my.close()
            });
            this.$zoomBtn.on('click',function(){
                if(my.$zoomBtn.attr('max')==='true'){
                    my.minimize();
                }else{
                    my.setAutoRefresh(true);
                    my.maximize();
                }
            });
            this.$file.on('click',function(){
                my.addFile()
            });
        },
        setAutoRefresh:function(flg){
            this.auto = flg;
            if(flg){
                !this.timeout&&this.refresh();
            }else {
                clearTimeout(this.timeout);
                this.timeout = undefined;
            }
        },
        emitDelSuccess:function (args,extParam) {
            var _args =  ['deleteSuccess',extParam].concat([].slice.call(args,0))
            this.emit.apply(this,_args);
        },
        emitDelError:function (args,extParam) {
            var _args =  ['deleteError',extParam].concat([].slice.call(args,0))
            this.emit.apply(this,_args);
        },
        frequency:2000,
        setUpSucTip:function (flg) {
          this.successTip =  flg;
        },

        /**
         * @event uploadSuccess
         * @instance
         * @memberOf bs-upload
         * @description 打开上传窗口
         *
         * @example
         * var instance = Upload.getInstance();
         * instance.bind('uploadSuccess',function(completeFiles){
         *      //   completeFiles 上传成功文件列表
         *      //   [
         *      //      "path":"上传文件物理路径",
         *      //      "state":0 暂停，1 上传， 2 完成，3 删除
         *      //    ]
         *
         *
         *      //TODO
         * })
         */


        /**
         * @event uploadError
         * @instance
         * @memberOf bs-upload
         * @description 打开上传窗口
         *
         * @example
         * var instance = Upload.getInstance();
         * instance.bind('uploadError',function(errorFiles){
         *      //   errorFiles 上传失败文件列表
         *      //   [
         *      //      "path":"上传文件物理路径",
         *      //      "state":0 暂停，1 上传， 2 完成，3 删除
         *      //    ]
         *
         *      //TODO
         * })
         */



        refresh:function () {
            var my = this;
            if(!this.auto){
                return;
            }
            my.timeout = setTimeout(function () {
                my.getFileList().done(function (data) {
                    my.$table.grid('loadData',data);
                    my.emit('refresh',data);
                    var completeFiles = [];
                    var errorFiles = [];
                    var hasUploding = false;
                    $(data).each(function (index,item) {
                        if(item.percent == 100 && item.state == 2){
                            completeFiles.push(item);
                            my.removeFile({file:item.path,DelSrvFile:0});
                        }
                        if(item.state == 3){
                            errorFiles.push(item);
                        }
                        if(item.state == 1){
                            hasUploding = true;
                        }
                    })
                    if(completeFiles.length){
                        my.successTip&&$A.messager.correct(completeFiles.join("、") +" 上传成功！");
                        my.emit("uploadSuccess",completeFiles);
                    }
                    if(errorFiles.length){
                        my.emit("uploadError",errorFiles);
                    }
                    if(hasUploding&&data.length){
                        my.refresh();
                    }else{
                        my.setAutoRefresh(false);
                    }
                }).fail(function () {
                    my.setAutoRefresh(false);
                });
            },my.frequency);
        },
        addFile:function (op) {
            var my = this;
            var params = this.params;
            if($.type(params)!=='object'){
                params = {};
            }
            if(my.$container.css("display")==='none'){
                my.show();
            }
            my.setAutoRefresh(true);
            return this.uploadFile(op).done(function () {
            }).fail(function () {

            });
        },
        /**
         * 最大化
         */
        maximize: function(){
            var my = this;
            my.$container.animate({
                top: document.body.clientHeight - 200,
                left: document.body.clientWidth - 420,
                width: 400,
                height: 200
            }, 'normal', 'swing', function(){
                // my.openAutoReload(timeRoll);
                my.$container.find('.upload-box-body').slideDown();
                my.$zoomBtn.attr({'max': true, 'title': '最大化'}).text('-');
            });
        },
        /**
         * 最小化
         * @param callback 缩小后执行的函数
         */
        minimize: function(){
            var my = this;
            my.$container.animate({
                left: document.body.clientWidth - 200,
                top: document.body.clientHeight - 30,
                width: 180,
                height: 30
            }, 'normal', 'swing', function(){
                // my.closeAutoReload();
                my.$container.find('.upload-box-body').slideUp();
                my.$zoomBtn.attr({'max': false, 'title': '最小化'}).text('□');
            });
        },


        /**
         * @function show
         * @instance
         * @memberOf bs-upload
         * @description 打开上传窗口
         *
         * @example
         * var instance = Upload.getInstance();
         * instance.show()
         */
        show:function () {
            var my = this;
            my.$container.css({
                display:'block',
                left: document.body.clientWidth - 180,
                top: document.body.clientHeight - 30
            });
            my.maximize();
            my.setAutoRefresh(true);
        },
        /**
         * @function close
         * @instance
         * @memberOf bs-upload
         * @description 关闭上传窗口
         *
         * @example
         * var instance = Upload.getInstance();
         * instance.close()
         */
        close:function () {
            this.$container.hide();
        },
        Statics:{
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-upload
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @param {object} op.params 附加參數
             * @example
             *         var instantce = Upload.getInstance({
             *          config:{
             *              appId:'123'
             *          },
             *          params:{
             *              key1:1,
             *              key2:2,
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance =new Upload(op);
                }
                return this.instance;
            }
        }
    });
    return Upload;
});