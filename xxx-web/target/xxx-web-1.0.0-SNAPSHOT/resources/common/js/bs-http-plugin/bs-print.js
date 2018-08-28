define(['bs-http-plugin/base-pluginvoke',
    "bs-http-plugin/data-transmit/socket",
    "bs-http-plugin/config",
    "bs-http-plugin/util/img-lazyload",
], function (BasePluginvoke, Socket, Config) {


    /**
     * @desc 打印控件 使用请引入 'bs-http-plugin/bs-print'
     * @class
     * @classdesc
     * @name bs-print
     * @extends base-pluginvoke
     */
    var BsPrint = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-print
         * @instance
         * @example
         * module:'print'
         */
        module: 'print',
        /**
         * @description 自动生成函数列表
         */
        functions: [

            {
                jsName: 'initParams',  //js对象实例化后生成的方法吗
                dllName: 'initParams',//js对象方法调用后发送的请求参数，func:'initParams'
                initRequired: false////默认true，需要init返回的$.Deferred() 对象为resolve状态才能执行，为false时不需init返回的Deferred对象
            },

            /**
             * @function doPrintRemoteImage
             * @instance
             * @memberOf bs-print
             * @description 打印图片
             * @param {object} options
             * @param {object} options.PrintPreview  是否预览 默认值false
             * @param {object} options.ShowPrintSet  是否显示打印份数设置 默认值false
             * @param {int} options.ShowMode  1：裁剪、2：铺满、3：按比例缩放、4：完整显示、5：平铺 。默认值4
             * @param {object} options.PrintSet
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doPrintRemoteImage({
             *      Url: "",
             *      PrintPreview: true, //是否预览
             *      ShowPrintSet: true, //是否显示打印份数设置
             *      ShowMode: 4,        //1：裁剪、2：铺满、3：按比例缩放、4：完整显示、5：平铺
             *      Name: "" ,           //打印任务名称
             *      PrintSet:{}         //打印设置，默认获取ModuleId:00000000
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            "doPrintRemoteImage",

            /**
             * @deprecated 已废弃，不建议使用
             * @function getTemplateList
             * @instance
             * @memberOf bs-print
             * @description 一种票据可能会配置多个模板，所以通过ModuleId可以获取到多个模板
             * @param {object} options
             * @param {string} options.ModuleId 模块编号
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getTemplateList({
			 * 	ModuleId:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getTemplateList',

            /**
             * @deprecated 已废弃，不建议使用
             * @function getDefaultTemplete
             * @instance
             * @memberOf bs-print
             * @description 获取默认模板
             * @param {object} options
             * @param {string} options.ModuleId 模块ID
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getDefaultTemplete({
			 * 	ModuleId:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getDefaultTemplete',


            /**
             * @deprecated 已废弃，不建议使用
             * @function getLocal
             * @instance
             * @memberOf bs-print
             * @description 获取存储本地信息
             * @param {object} options
             * @param {string} options.Node 模块编号
             * @param {string} options.Key 模块编号
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getLocal({
			 * 	Node:'xxxx',
			 * 	Key:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getLocal',

            /**
             * @deprecated 已废弃，不建议使用
             * @function setLocal
             * @instance
             * @memberOf bs-print
             * @description 存储本地信息
             * @param {object} options
             * @param {string} options.Node 模块编号
             * @param {string} options.Key 模块编号
             * @param {string} options.Value 模块编号
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.setLocal({
			 * 	Node:'xxxx',
			 * 	Key:'xxxx',
			 * 	Value:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'setLocal',


            /**
             * @function getPrinter
             * @instance
             * @memberOf bs-print
             * @description 获取预览图片
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @param {string} options.PrintTemplateUrl 打印模板地址
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getPrinter({
			 * 	PrintData:{...},
			 * 	PrintSet:{...},
			 * 	PrintTemplateUrl:{...}
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getPrinter',

            /**
             * @function setPrinter
             * @instance
             * @memberOf bs-print
             * @description 打印设置
             * @param {object} options
             * @param {string} options.ModuleId 模块编号
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.setPrinter({
			 * 	ModuleId:''
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'setPrinter',

            /**
             * @function getPrintSet
             * @instance
             * @memberOf bs-print
             * @description 获取打印设置
             * @param {object} options
             * @param {object} options.ModuleId 模块编号
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getPrintSet({
			 * 	ModuleId:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getPrintSet',


            /**
             * @deprecated 已废弃，不建议使用
             * @function getTemplatePath
             * @instance
             * @memberOf bs-print
             * @description 获取模板路径
             * @param {object} options
             * @param {string} options.ModuleId 模块ID
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getTemplatePath({
			 * 	ModuleId:''
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getTemplatePath',


            /**
             * @function getPrintPreviewImage
             * @instance
             * @memberOf bs-print
             * @description 获取预览图片
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @param {string} options.PrintTemplateUrl 打印模板地址
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getPrintPreviewImage({
			 * 	PrintData:{...},
			 * 	PrintSet:{...},
			 * 	PrintTemplateUrl:'xxx'
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getPrintPreviewImage',

            /**
             * @function doDesign
             * @instance
             * @memberOf bs-print
             * @description 打印模板设计
             * @param {object} options
             * @param {string} options.LoadReportURL 模板加载地址
             * @param {string} options.SaveReportURL 模板保存地址
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doDesign({
			 * 	SaveReportURL:'xxxx',
			 * 	LoadReportURL:'xxxx'
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doDesign',

            /**
             * @function doPreview
             * @instance
             * @memberOf bs-print
             * @description 打印预览。支持批量打印，PrintData传入数组，PrintSize参数是切割PrintData，每次发送的大小
             * @param {object} options
             * @param {string} options.LoadReportURL 模板加载地址
             * @param {boolean} options.PrintPreview 是否打印预览
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet 打印设置
             * @param {integer} options.PrintSize 打印或者预览每次发送数据大小，默认打印全部
             * @param {function} options.ProcessChange 打印或者预览处理回调函数
             * @param {function} options.PrintCallBack 打印按钮回调函数，预览的时候才有打印按钮
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doPreview({
			 * 	LoadReportURL:'xxxx',
			 * 	PrintPreview:false,
			 * 	PrintData:{...},
			 * 	PrintSet:{...}
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doPreview',

            /**
             * @function printReport
             * @instance
             * @memberOf bs-print
             * @description 打印报表
             * @param {object} options
             * @param {boolean} options.PrintPreview 是否打印预览
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet 打印设置
             * @param {object} options.Header 报表头
             * @param {object} options.Detail 详细数据
             * @param {integer} options.ColumnPrintAdaptMethod 打印适配方法
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.printReport({
			 * 	PrintPreview:false,
			 * 	PrintData:{...},
			 * 	PrintSet:{...},
			 * 	Header:{...},
			 * 	Detail:{...},
			 * 	ColumnPrintAdaptMethod:1
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'printReport',

            /**
             * @function doPrintMultiSubReport
             * @instance
             * @memberOf bs-print
             * @description  打印多重子报表
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @param {string} options.LoadReportURL 模板加载地址
             * @param {object/array} options.SubReports 子报表数据
             * @param {boolean} options.PrintPreview 是否打印预览
             * @param {object} options.Groups 打印控制等信息
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doPrintMultiSubReport({
			 * 	PrintData:{...},
			 * 	PrintSet:{...},
			 * 	LoadReportURL:'xxxxx',
			 * 	SubReports:{...},
			 * 	PrintPreview:false,
			 * 	Groups:{...}
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doPrintMultiSubReport',

            /**
             * @function doCoordinate
             * @instance
             * @memberOf bs-print
             * @description 点阵打印
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doCoordinate({
			 * 	PrintData:{...},
			 * 	PrintSet:{...}
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doCoordinate',
            /**
             * @function doCustomPrint
             * @instance
             * @memberOf bs-print
             * @description 自定义打印
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doCustomPrint({
			 * 	PrintData:{...},
			 * 	PrintSet:{...}
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doCustomPrint',


            /**
             * @function openFile
             * @instance
             * @memberOf bs-print
             * @description 选择文件夹
             * @param {object} options
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.openFile().done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'openFile',

            /**
             * @function exportMedia
             * @instance
             * @memberOf bs-print
             * @description 导出多媒体文件
             * @param {object} options
             * @param {object} options.PrintData    打印数据
             * @param {object} options.PrintSet     打印设置
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.exportMedia({
                    "PrintData": [{
                        "Name": "导出文件名",
                        "Data": {}
                    }],
                    "PrintSet": {},
                    "ExportType": "PDF/Excel(默认PDF)",
                    "LoadReportURL": "模板地址(支持http下载模板和使用本地模板)",
                    "tempVersion": "模板版本"
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'exportMedia'
        ],
        init: function () {
            var _self = this;
            var initOptions = _self.initOptions;
            var defer = $.Deferred();
            _self.initParams(initOptions).done(function (data, state, Rs) {
                defer.resolve();
            }).fail(function (data, state, Rs) {
                defer.reject({code: -1, msg: '初始化失败！！！！'});
            });
            return defer;
        },

        template: {
            /**
             * 打印预览窗口
             * @type {string}
             */
            printPreViewDialog: '\
                <div class="dlg-box-head">\
                    <div class="dlg-box-head-left">\
                        <span class="dlg-box-head-title">打印预览</span>\
                        <span class="pre-view-msg"></span>\
                    </div>\
                    <div class="dlg-box-head-right">\
                        <div class=" btnarea menubar btn-dlg-toolbar">\
                        </div>\
                    </div>\
                </div>\
                <div class="dialog-content print-pre-view" style="padding: 30px;">\
                </div>',
            /**
             * 打印窗口
             * @type {string}
             */
            printDialog: '\
            <div class="dlg-box-head">\
                <div class="dlg-box-head-left">\
                    <span class="dlg-box-head-title">打印</span>\
                </div>\
            </div>\
            <div class="dialog-content print-pre-view">\
                <span class="print-view-msg"></span>\
            </div>'
        },


        exportMedia: function (data) {
            var self = this;
            return self.openFile().then(function (path) {
                data.ExportPath = path;
                return self.operate({
                    data: [data],
                    func: 'exportMedia'
                })
            })
        },
        /**
         * @return {*}
         */
        doPreview: function () {
            var _self = this;
            var op = _self._initArgs(arguments);
            var dfd = $.Deferred();
            $.when(_self.initStateDefer)
                .done(function () {
                    //初始化参数
                    var index = 0;
                    var dialogOptions = _self.getItem(op, 'DialogOptions');
                    dialogOptions = $.type(dialogOptions) === 'undefined' ? {} : dialogOptions;
                    //是否由前端展示窗体，false的时候由前端展示窗体。默认false
                    var showForm = _self.getItem(op, 'ShowForm');
                    var printPreView = _self.getItem(op, 'PrintPreview');
                    var msgDlg = _self.getItem(op, 'MessageDialog');
                    var defImg = _self.getItem(op, 'DefImg');
                    if ($.type(msgDlg) === 'undefined') {
                        msgDlg = true
                    }
                    showForm = showForm === false ? showForm : true;
                    _self.setItem(op, 'ShowForm', showForm);
                    var isPreview = !showForm && printPreView;
                    //打印数据
                    var printData = _self.getItem(op, 'PrintData');
                    printData = $.isArray(printData) ? printData : [printData];
                    var printLength = printData.length;
                    //打印或者预览每次调用dll的数据大小
                    var frequency = _self.getItem(op, 'PrintSize');
                    frequency = $.isNumeric(frequency) ? frequency : printLength;

                    //打印按钮回调
                    var printCallBack = _self.getItem(op, 'PrintCallBack');
                    printCallBack = _self.isFunction(printCallBack);
                    //过程改变回调
                    var processChange = _self.getItem(op, 'ProcessChange');
                    processChange = _self.isFunction(processChange);

                    //默认图片
                    if(!!!defImg)
                        defImg = $A.getHostUrl() + 'resources/common/themes/images/print/default.gif';
                    var message = {
                        printSuccessMsg: '打印成功！',
                        printErrorMsg: '预览失败！',
                        preViewSuccessMsg: '预览成功！',
                        preViewErrorMsg: '预览成功！',
                        printDoingMsg: '正在打印',
                        preViewDoingMsg: '正在预览',
                        getSuccessMsg: function () {
                            if (printPreView) {
                                return this.preViewSuccessMsg;
                            }
                            return this.printSuccessMsg;
                        },
                        getErrorMsg: function () {
                            if (printPreView) {
                                return this.preViewErrorMsg;
                            }
                            return this.printErrorMsg;
                        },
                        getDoingMsg: function () {
                            if (printPreView) {
                                return this.preViewDoingMsg;
                            }
                            return this.printDoingMsg;
                        }
                    };
                    $.extend(message, _self.getItem(op, 'Message'));

                    //打印图片数组
                    var printImg = [];
                    //保证页面只有一个滚动条
                    var bodyOverflow = $(document.body).css('overflow');
                    msgDlg&&$(document.body).css('overflow', 'hidden');
                    //打开对话框配置
                    var html = "";
                    var dlgOptions = {
                        dialogId: "_dlgdoPreViewImg",
                        hasheader: false,
                        title: ' ',
                        height: '75%',
                        width: '60%',
                        mode: "node",
                        buttons: [
                            {
                                id: 'btnPrint',
                                text: '打印',
                                visible: false,
                                click: function () {
                                    op.func = 'doPrintImage';
                                    _self.newOperation(op);
                                    _self.setItem(op, 'PrintData', printImg);

                                    var printDlgOp = $.extend(true, {}, dlgOptions)
                                    printDlgOp.dialogId = "_printDlg";
                                    printDlgOp.beforeClose = $.noop;
                                    printDlgOp.url = dotpl.applyTpl(_self.template.printDialog, {
                                        msg: message.printDoingMsg + '请稍后...'
                                    });
                                    printDlgOp.width = '600px';
                                    printDlgOp.height = '200px';
                                    msgDlg && $.openModalDialog(printDlgOp);
                                    var printDlg = $("#" + printDlgOp.dialogId);

                                    $.when(_self.operate(op)).done(function (data) {
                                        printDlg.find('.print-view-msg')
                                            .removeClass("print-view-msg")
                                            .addClass("print-view-msg-success")
                                            .text(message.printSuccessMsg);
                                        printDlg.fadeOut(2600, function () {
                                            printDlg.closeDialog();
                                        });
                                        dfd.resolve.apply(dfd, arguments);
                                    }).fail(function (data) {
                                        dfd.resolve.apply(dfd, arguments);
                                        printDlg.find('.print-view-msg')
                                            .removeClass("print-view-msg")
                                            .addClass("print-view-msg-success")
                                            .text(message.printErrorMsg);
                                    });
                                    printCallBack();
                                }
                            },
                            {
                                id: 'btnClose',
                                text: '关闭',
                                click: function () {
                                    var $dlg = $('#' + dlgOptions.dialogId);
                                    $dlg.closeDialog();
                                }
                            }
                        ],
                        buttonsExt: [],
                        buttonGen: function () {
                            var $dlg = $('#' + dlgOptions.dialogId);
                            var $right = $dlg.find('.dlg-box-head-right>div');
                            var template = '<a id="${id}" class="app-button hidden l-btn l-btn-large l-btn-plain">\
                                        <span class="l-btn-left l-btn-icon-top">\
                                            <span class="l-btn-text">${text}</span>\
                                            <i class="l-btn-icon add48">&nbsp;</i>\
                                        </span>\
                                    </a>';
                            var buttons = this.buttons.concat(this.buttonsExt);
                            $(buttons).each(function (index, btnOp) {
                                var $button = $(dotpl.applyTpl(template, btnOp));
                                $button.on('click', btnOp.click);
                                btnOp.visible === false && $button.hide();
                                $right.append($button);
                            })
                        },
                        beforeClose: function () {
                            $(document.body).css('overflow', bodyOverflow);
                        }
                    };
                    if (isPreview) {
                        html = _self.template.printPreViewDialog;
                    } else {
                        html = _self.template.printDialog;
                        dlgOptions.height = '220px';
                        dlgOptions.width = '600px';
                    }
                    $.extend(true, dlgOptions, dialogOptions);

                    dlgOptions.url = $(html);
                    if ($('#' + dlgOptions.dialogId).length) {
                        $('#' + dlgOptions.dialogId).closeDialog();
                    }
                    msgDlg && $.openModalDialog(dlgOptions);
                    dlgOptions.buttonGen();
                    var $dlg = $('#' + dlgOptions.dialogId);
                    var $content = $dlg.find('.dialog-content');
                    var $msg = isPreview ? $dlg.find(".pre-view-msg") : $dlg.find(".print-view-msg");

                    doPreView(op, index);

                    function doPreView(options, index) {
                        options.func = 'doPreview';
                        var end = index + frequency;
                        if (end > printLength) end = printLength;
                        _self.setItem(options, 'PrintData', printData.slice(index, end));
                        var curIndex = {
                            index: end == 0 ? 1 : end,
                            total: printLength == 0 ? 1 : printLength
                        }
                        index = end;
                        _self.newOperation(options);
                        $.when(_self.operate(options)).done(function (data) {
                            //过程回调
                            var processRs = processChange(data, index, printLength);
                            var showMsg = "(${index}/${total})";
                            showMsg = dotpl.applyTpl(showMsg, curIndex);
                            if (isPreview) {
                                printImg = printImg.concat(data.list);
                                $(data.list).each(function (i, imgPath) {
                                    var $img = $('<img style="display: block;margin: 100px auto;" />');
                                    $img.attr('data-src', data.url + '?fn=' + imgPath);
                                    // $img.attr('data-src',data.url+'/'+imgPath);
                                    $content.append($img)
                                });
                                $content.imgLazyLoad('img',
                                    defImg,
                                    function ($img) {
                                        $img.addClass('print-img-loaded');
                                        $img.attr('style', '');
                                    }
                                );
                                showMsg = "正在生成预览图片" + showMsg;
                            } else {
                                showMsg = message.getDoingMsg() + showMsg;
                            }
                            if ($.type(processRs) !== 'undefined') {
                                showMsg = processRs;
                            }
                            $msg.text(showMsg);
                            //传输结束
                            if (index == printLength) {

                                if (isPreview) {
                                    $dlg.find('#btnPrint').css('display', 'inline-block');
                                    $msg.fadeOut(600, function () {
                                        $msg.remove();
                                    });
                                } else {
                                    setTimeout(function () {
                                        $msg.removeClass("print-view-msg")
                                            .addClass("print-view-msg-success").text(message.getSuccessMsg());
                                        $dlg.fadeOut(2600, function () {
                                            $dlg.closeDialog();
                                        });
                                    }, 800);
                                }
                                dfd.resolve.apply(dfd, arguments);
                                return;
                            }
                            doPreView(options, index);
                        }).fail(function () {
                            dfd.reject.apply(dfd, arguments);
                            if (!showForm) {

                            } else {
                                $msg.removeClass("print-view-msg")
                                    .addClass("print-view-msg-success").text(message.getErrorMsg());
                                $dlg.fadeOut(2600, function () {
                                    $dlg.closeDialog();
                                });
                            }
                        });
                    }
                })
                .fail(function () {

                });
            return dfd;
        },
        /**
         * @instance
         * @memberOf bs-print
         * @description 生成预览图片，图片路径为本地客户端为服务器
         * @param {object} options
         * @param {string} options.LoadReportURL 模板加载地址
         * @param {object} options.PrintData 打印数据
         * @param {object} options.PrintSet 打印设置
         * @returns {object}
         *
         * @example
         * var print = BsPrint.getInstance();
         * print.doImage({
         * 	LoadReportURL:'xxxx',
         * 	PrintData:{...},
         * 	PrintSet:{...}
         * }).done(function(data){
         * 		//TODO success
         * }).fail(function(){
         * 		//TODO error
         * })
         */
        doImage: function () {
            var _self = this;
            var dfd = $.Deferred();
            var op = _self._initArgs(arguments);
            $.when(_self.initStateDefer).done(function () {
                _self.setItem(op, 'ShowForm', false);
                _self.setItem(op, 'PrintPreview', true);
                var printData = _self.getItem(op, 'PrintData');
                if (!$.isArray(printData)) {
                    printData = [printData];
                    _self.setItem(op, 'PrintData', printData);
                }
                op.func = 'doPreview';
                _self.newOperation(op);
                _self.operate(op).done(function () {
                    dfd.resolveWith(op, arguments);
                }).fail(function (arg) {
                    dfd.rejectWith(op, arguments);
                })
            }).fail(function () {
                dfd.reject();
            });
            return dfd;
        },
        getItem: function (options, key) {
            return options.data[0][key];
        },
        setItem: function (options, key, val) {
            return options.data[0][key] = val;
        },
        isFunction: function (fn) {
            return $.isFunction(fn) ? fn : function () {
            };
        },
        Statics: {
            getDefInstance: function (op) {
                var defOp = {
                    initOptions: {
                        Cookie: Config.cookies,
                        HostUrl: $A.getHostUrl(),
                        DownLoadUrl: 'undefined',
                        QueryTempListUrl: 'undefined',
                        QueryTempNameUrl: 'undefined'
                    }
                };
                if ($.type(op) === 'undefined') {
                    op = {};
                }
                $.extend(true, op, defOp);
                if (!this.instance || this.instance.getInitState().state() === 'rejected') {
                    this.instance = new BsPrint(op);
                }
                return this.instance;
            },
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-print
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @param {object} op.initOptions 初始化函数
             * @param {string} op.initOptions.Cookie cookie
             * @param {string} op.initOptions.HostUrl 主机地址
             * @param {string} op.initOptions.DownLoadUrl 模板下载地址
             * @param {string} op.initOptions.QueryTempListUrl 模板查询地址
             * @param {string} op.initOptions.QueryTempNameUrl 模板查询地址
             * @example
             *         var instantce = BsPrint.getInstance({
             *          config:{
             *              appId:'123'
             *          },
             *          initOptions:{
             *          	Cookie:_cookies,
             *          	HostUrl:$A.getHostUrl(),
             *          	DownLoadUrl:'xxxx/yyyy/download.do',
             *          	QueryTempListUrl:'xxxx/yyyy/queryList.do',
             *          	QueryTempNameUrl:'xxxx/yyyy/query.do'
             *          }
             *         });
             */
            getInstance: function (op) {
                if (!this.instance || this.instance.getInitState().state() === 'rejected') {
                    this.instance = new BsPrint(op);
                }
                return this.instance;
            }
        }
    });
    return BsPrint;
});