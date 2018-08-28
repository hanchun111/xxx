/**
 * 上传控件
 * @author Mr.T
 */
define(['app/core/app-base', 'app/core/app-jquery', 'app/core/app-core', 'app/core/app-options', 'app/widgets/app-progressbar',
        'app/data/app-ajax', 'app/util/app-utils', 'jquery/jquery.upload'],
        function(Base, $, App, Options, ProgressBar, AppAjax, Utils) {
	
	'use strict';
	/**
	 * @class 
	 * @classdesc 上传组件，该组件上传的文件会加入一个groupId，代表该文件所属的组
	 * 		文件上传完成会返回fileId，前台可以通过fileId删除该文件
	 * @name upload-class
	 * @desc 上传组件的初始化方法
	 * @param {input} input 要渲染的input组件
	 * @param {object} options 组件的选项设置 
	 * @author Mr.T
	 * @example $('#demo').upload({
	 * &#9;groupId: 'testGroupId2',
	 * &#9;progress: true,
	 * &#9;toolbarPosition: 'bottom',
	 * &#9;style: 'border:1px solid green;border-radius: 4px;top:260px;left: 0px;',
	 * &#9;css: 'uploadDemoClass',
	 * &#9;fileWidth:'200px',
	 * &#9;requestFile: true
	 * });
	 */
	var Upload = Base.extend({
		initialize: function (input, options) {
			this.$input = $(input);
			this.options = options;
			this._init();
			this._eventRegister();
		},
		/**
		 * 初始化
		 * @param options
		 */
		_init: function(){
			this._initOptions();
			this.$input.css('display','none');
			this._initHTML();
			if(this.setting.requestFile){
				this.initLoadedFile(this.setting.fileUrl);
			}
			var upload = this;
			this.$element.on('click', '.file-item .file-icon', function(e){
				if(upload.setting.selectable){
					$(this).parent().toggleClass('selected');
				}
			});
			if($.isFunction(upload.setting.createDownloadUrl)){
				this.$element.on('click', '.file-name', function(e){
					var fileId = $(this).closest('.file-item').attr('fileId');
					var url = upload.setting.createDownloadUrl(fileId);
					download(url, {});
				});
			}else{
				this.$element.addClass('un-download');
			}
			function download(url,params,_blank){
				var $form = $("<form style=\"display:none;\"></form>").attr("action",url).attr("method","post");
				if(_blank){
					$form.attr("target","_blank");
				}
				for(var key in params){
					$("<input type=\"hidden\" />").attr("name",key).val(params[key]).appendTo($form);
				}
				$("body").append($form);
				$form.submit();
				$form.remove();
			}
		},
		/**
		 * 初始化配置
		 */
		_initOptions: function(){
			var customSetting = $.extend(App.getAttrFromElement(this.$input), this.options);
			if($.isFunction(customSetting.beforeRender)){
				customSetting.beforeRender.call(this, customSetting);
			}
			this.setting = $.extend({}, Options.appDefaults.upload, customSetting);
			if(this.setting.exts){
				var exts = this.setting.exts.toLowerCase();
				this._exts = exts.split(',');
			}
			//初始化回调事件
			var callback = {}; 
			var events = this.setting.events;
			if(events){
				if(typeof(events) == 'string'){
					callback = this.$input.getJsEvent(events);
				}else{
					callback = events;
				}
			}
			this.callback = callback;
			if(this.setting.groupId){
				this.groupId = this.setting.groupId; 
			}else{
				this.groupId = 'g-'+ new Date().getTime(); 
			}
		},
		/**
		 * 事件注册器
		 */
		_eventRegister: function(){
			var s = this.setting;
			if($.isFunction(s.afterDelete)){
				this.on('afterDelete', s.afterDelete);
			}
			if($.isFunction(s.startUpload)){
				this.on('startUpload', s.startUpload);
			}
			if($.isFunction(s.uploadError)){
				this.on('uploadError', s.uploadError);
			}
			if($.isFunction(s.uploadSuccess)){
				this.on('uploadSuccess', s.uploadSuccess);
			}
		},
		/**
		 * 初始化HTML
		 */
		_initHTML: function(){
			var s = this.setting;
			this.$element = 
			$('<div class="app-upload empty ' +s.css + '" ' + ( s.style ? 'style="' + s.style + '"' : '' ) + '>' +
				'<div class="content">' +
					'<div class="upload-btn">' +
						'<div class="file-icon icon-upload"></div>' +
					'</div>' +
				'</div>' +
				'<input class="upload-progress"></input>' +
				'<div class="upload-mask"></div>' +
			'</div>').insertAfter(this.$input);
			this.$uploadItem = this.$element.find('.upload-btn');
			this.$uploadBtn = this.$element.find('.upload-btn .icon-upload');
			this.$fileList = this.$element.find('.content');
			this.progressbar = new ProgressBar(this.$element.find('.upload-progress'), {width: '70%', height:'20px'});
			this.$mask = this.$element.find('.upload-mask');
			this.$input.appendTo(this.$element);
			this.$input.removeClass('app-upload');
			this.$element.data('upload', this);
			this._new$File();
		},
		/**
		 * 初始化已上传文件的列表，请求文件列表时会传入groupId
		 * @param {Url} url 根据url进行加载文件
		 * @example $('#demo').upload('initLoadedFile', 'fileList.do');
		 * @memberof upload-class
		 * @instance
		 */
		initLoadedFile: function(url){
			if(url){
				var upload = this;
				AppAjax.ajaxCall({
					url: url,
					dataType: 'json',
					data: {groupId: upload.groupId},
					type: 'POST',
					success: function(files){
						upload.appendHasLoadFile(files);
					}
				});
			}
		},
		/**
		 * 清除删除前台展现的文件列表，不清除文件
		 * @example $('#demo').upload('resetFileList');
		 * @memberof upload-class
		 * @instance
		 */
		resetFileList: function(){
			this.$fileList.find('.file-item').remove();
			afterFileListChange.call(this);

		},
		/**
		 * 载入新的已上传完成的文件
		 * @param {Object|Array} files 文件列表
		 * @param {String} files.name 文件名
		 * @param {Number} [files.size] 字节数
		 * @example $('#demo').upload('appendHasLoadFile', [{name:'file1',size:100},{name:'file2'}]);
		 * @memberof upload-class
		 * @instance
		 */
		appendHasLoadFile: function(files){
			if(!$.isArray(files)){
				files = [files];
			}
			for ( var i = files.length-1; i >= 0; i--) {
				var file = files[i];
				file.ext = getFileExt(file.name);
				this._initFileElement(file).show();
			}
			this.$element.scrollTop(this.$element[0].scrollHeight);
		},
		/**
		 * 在选择文件按钮上加入一个新的文件选择组件
		 */
		_new$File: function(){
			var $fileInput = this.$fileInput = $('<input id="' + App.uuid('upload-') 
					+ '" type="file" name="file"/>')
				,upload = this;
			if(this.setting.extsApply){
				$fileInput.attr('accept', this.setting.exts);
			}
			this.$uploadBtn.empty().append($fileInput);
			$fileInput.on('change.upload-append.api',function(){
				var fileName = $(this).val().replace(/.*(\/|\\)/, '')
					,ext = getFileExt(fileName);
				if(includeExt(ext, upload._exts)){
					var $file = upload._initFileElement({name: fileName, ext: ext});
					upload._ajaxUpload($file);
				}else{
					$messager.warn('请上传扩展名为[' + upload.setting.exts + ']的文件');
				}
				upload._new$File();
			});
			$fileInput.on('click.upload-append.api',function(e){
				if(!upload.setting.promptMessage){
					return;
				}
				if(!upload.$fileInput.parent().hasClass('.upload-btn')){
					return;
				}
				e.stopPropagation();
				e.preventDefault();
				$messager.confirm(upload.setting.promptMessage);
				$($('#_alertMsgBox .btn')[0]).css('position','relative').append(upload.$fileInput);
				$('#_alertMsgBox .btn').on('click', function(){
					upload.$uploadBtn.append(upload.$fileInput);
				});
			});
		},
		/**
		 * 设置提示信息
		 * @example $('#demo').upload('setPromptMessage', '是否继续上传？');
		 * @memberof upload-class
		 * @instance
		 */
		setPromptMessage: function(msg){
			this.setting.promptMessage = msg;
		},
		/**
		 * 获取提示信息
		 * @return {String} msg 
		 * @example $('#demo').upload('getPromptMessage');
		 * @memberof upload-class
		 * @instance
		 */
		getPromptMessage: function(){
			return this.setting.promptMessage;
		},
		/**
		 * 生成界面的文件
		 */
		_initFileElement: function(fileInfos){
			var download = '';
			if(this.setting.createDownloadUrl){
				download = this.setting.createDownloadUrl(fileInfos);
			}else{
				download = 'javascript:void(0);';
			}
			var $file = $('<div class="file-item" title="' + fileInfos.name + '">' +
							'<div ' + getFileIconCls(fileInfos.ext) + '></div>' +
							nameHtml(fileInfos.name) + 
							'<div class="file-selected"><i></i></div>' +
							'<div class="file-delete"><i></i></div>' +
						'</div>');
			if(fileInfos.id){
				$file.attr('fileId', fileInfos.id);
			}
			$file.hide();
			this.$uploadItem.after($file);
			this._liveDelete($file);
			afterFileListChange.call(this);
			return $file;
		},
		/**
		 * 文件绑定删除事件
		 */
		_liveDelete: function($file){
			if(this.setting.canDelete){
				var upload = this;
				$file.find('.file-delete').on('click.upload.api',function(){
					$messager.confirm('是否确认删除？', {
						okCall: function(ok){
							upload._deleteFile($file);
						}
					});
				});
			}else{
				$file.addClass('un-delete');
			}
		},
		/**
		 * 设置该组件上传的组文件id
		 * @param {String} groupId 组文件id
		 * @example $('#demo').upload('setGroupId','String');
		 * @memberof upload-class
		 * @instance
		 */
		setGroupId: function(groupId){
			if(groupId){
				this.groupId = groupId;
			}
		},
		/**
		 * 获取该组件上传的一组文件id
		 * @return {String} groupId 组文件id
		 * @example $('#demo').upload('getGroupId');
		 * @memberof upload-class
		 * @instance
		 */
		getGroupId: function(){
			return this.groupId;
		},
		/**
		 * 上传文件
		 * @param $file
		 */
		_ajaxUpload: function($file){
			var upload = this
				,fileId = this.$fileInput.attr('id');
			this.progressbar.setValue(0);
			this.progressbar.active();
			this.progressbar.$element.show();
			localProgress(this.progressbar);
			this.$mask.show();
			/**
			 * 开始上传事件
			 * @event upload-class#startUpload
			 */
			this.trigger('startUpload');
			$.ajaxFileUpload({
				url: this.setting.uploadUrl,
				secureuri: false,
				dataType: 'json',
				data: {groupId: upload.groupId},
				fileElementId: fileId,
				success: function(infos) {
					if(infos.errorMsg){
						upload._fileUploadError(infos, $file);
						return;
					}
					upload._onFileFinish(infos, $file);
				},
				error: function(obj) {
					upload._fileUploadError(obj, $file);
				}
			});
		},
		/**
		 * 上传完成时触发的事件
		 * @param $file
		 * @param progressbar
		 * @param infos
		 */
		_onFileFinish: function(infos, $file){
			$file.attr('fileId', infos.id);
			clearInterval(this.progressbar.interval);
			this.progressbar.setValue(100);
			this.progressbar.unactive();
			var upload = this;
			setTimeout(function(){
				upload.progressbar.$element.hide(200);
			}, 300);
			this.$mask.hide();
			$file.show(500, function(){
				upload.$element.scrollTop(upload.$element[0].scrollHeight);
			});
			/**
			 * 上传完成事件
			 * @param {Object} fileInfos 文件信息
			 * @event upload-class#uploadSuccess
			 */
			this.trigger('uploadSuccess', infos);
		},
		/**
		 * 上传失败
		 */
		_fileUploadError: function(obj, $file){
			$file.remove();
			afterFileListChange.call(this);
			clearInterval(this.progressbar.interval);
			this.progressbar.unactive();
			if(!this.setting.ignorUploadError){
				var msg = '上传失败';
				if(obj.errorMsg){
					msg += ':' + obj.errorMsg;
				}else if(obj.responseText){
					msg += ':' + $(obj.responseText).find('h1').text();
				}
				$messager.warn(msg);
			}
			this.progressbar.$element.hide();
			this.$mask.hide();
			/**
			 * 上传失败事件
			 * @event upload-class#uploadError
			 */
			this.trigger('uploadError', obj);
		},
		/**
		 * 删除文件
		 * @param $file
		 */
		_deleteFile: function($file){
			var fileId = $file.attr('fileId')
				,upload = this;
			if(this.setting.deleteUrl && fileId){
				AppAjax.ajaxCall({
					url: this.setting.deleteUrl,
					dataType: 'json',
					type: 'POST',
					data: {fileId: fileId},
					success: function(flag){
						if(flag){
							$file.remove();
							afterFileListChange.call(upload);
							upload.trigger('afterDelete');
						}else{
							$messager.warn('文件无法完成删除！');
						}
					}
				});
			}else{
				$file.remove();
				afterFileListChange.call(this);
				this.trigger('afterDelete');
			}
		},
		/**
		 * 获取已上传文件列表
		 * @return {Array} files 上传文件的列表
		 * @example $('#demo').upload('getFileList');
		 * @memberof upload-class
		 * @instance
		 */
		getFileList: function(){
			var $file = this.$fileList.find('.file-item')
				,files = [];
			$file.each(function(){
				var file = {}
					,$file = $(this);
				file.name = $file.attr('title');
				file.id = $file.attr('fileid');
				files.push(file);
			});
			return files;
		},
		/**
		 * 获取勾选的文件列表
		 * @return {Array} files 上传文件的列表
		 * @example $('#demo').upload('getSelectedFiles');
		 * @memberof upload-class
		 * @instance
		 */
		getSelectedFiles: function(){
			var $file = this.$fileList.find('.file-item.selected')
				,files = [];
			$file.each(function(){
				var file = {}
					,$file = $(this);
				file.name = $file.attr('title');
				file.id = $file.attr('fileid');
				files.push(file);
			});
			return files;
		},
		/**
		 * 禁用上传组件
		 * @example $('#demo').upload('disableUpload');
		 * @memberof upload-class
		 * @instance
		 */
		disableUpload: function(){
			this.readonly(true);
		},
		/**
		 * 启用上传组件
		 * @example $('#demo').upload('enableUpload');
		 * @memberof upload-class
		 * @instance
		 */
		enableUpload: function(){
			this.readonly(false);
		},
		/**
		 * 切换只读状态
		 * @example $('#demo').upload('readonly', false);
		 * @memberof upload-class
		 * @instance
		 */
		readonly: function(readonly){
			if(readonly === false){
				this.$element.removeClass('readonly');
			}else{
				this.$element.addClass('readonly');
			}
		},
		/**
		 * 销毁删除组件
		 */
		destroy: function(){
			
		}
	});
	
	$.fn.upload = function (option, value) {
		var methodReturn = undefined;
		var args = arguments;
		this.each(function () {
			var $this = $(this)
				,component = $this.data('upload');
			if(typeof option === 'string'){
				try{
					var methodArgs = Array.prototype.slice.call(args, 1);
					methodReturn = App.componentMethodApply(component, option, methodArgs);
				}catch(e){
					var id = $this.attr('id');
					if(!id){
						id = $this[0].outerHTML;
					}
					throw new Error('组件upload[' + id + ']调用' + option +'方法:' + e);
				}
			}else{
				if(!component){
					component = new Upload(this, option);
					$this.data('upload', component);
				}else{
					var id = $this.attr('id');
					if(!id){
						id = $this[0].outerHTML;
					}
					throw new Error('组件upload[' + id + ']无法重复初始化');
				}
			}
		});
		return methodReturn;
	};

	$.fn.upload.Constructor = Upload;
	/**
	 * 上传文件列表数量变化后
	 */
	function afterFileListChange(){
		var listLen = this.getFileList().length;
		if(listLen > 0){
			this.$element.removeClass('empty');
		}else{
			this.$element.addClass('empty');
		}
		if(!this.setting.multiple){
			if(listLen > 0){
				this.$element.addClass('un-upload');
			}else{
				this.$element.removeClass('un-upload');
			}
		}
	}
	/**
	 * 对文件类型进行检查
	 */
	function getFileExt(fileName){
		return fileName.substring(fileName.lastIndexOf('.')+1,fileName.length);
	}
	/**
	 * 根据文件扩展名获取文件类型图标样式
	 * @param ext
	 */
	function getFileIconCls(ext){
		var result = 'file-icon'
			,ext = ext.toLowerCase()
			,icon = '';
		switch (ext) {
		case 'txt':
			icon = 'icon-txt';
			break;
		case 'rar':
			icon = 'icon-rar';
			break;
		case 'zip':
			icon = 'icon-zip';
			break;
		case 'doc':
		case 'docx':
			icon = 'icon-word';
			break;
		case 'ppt':
		case 'pptx':
			icon = 'icon-ppt';
			break;
		case 'xls':
		case 'xlsx':
			icon = 'icon-excel';
			break;
		case 'pdf':
			icon = 'icon-pdf';
			break;
		case 'gif':
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'bmp':
			icon = 'icon-image';
			break;
		case 'avi':
		case 'rmvb':
		case 'qmv':
		case 'mkv':
		case 'rm':
			icon = 'icon-video';
			break;
		default:
			break;
		}
		return 'class="' + result + ' '+ icon +'"';
	}
	/**
	 * 名称分割
	 */
	function nameHtml(fileName){
		var namegbLen = fileName.gblen()
			,firstLen = 12;
		if(namegbLen <= firstLen){
			return '<div class="file-name" title="' + fileName + '">' + fileName + '</div>'; 
		}
		var name1 = ''
			,name2 = ''
		if(namegbLen <= 20){
			name1 = cutstr(fileName, namegbLen - 12);
			name2 = fileName.replace(name1, '');
		}else{
			name1 = cutstr(fileName, firstLen);
			if(name1.gblen() == name1.length){
				name1 = name1.substr(0,11);
			}
			name2 = fileName.replace(name1, '');
		}
		return ('<div class="file-name" title="' + fileName + '">' + name1 + '</div>'
				+ '<div class="file-name" title="' + fileName + '">' + name2 + '</div>'); 
	}
	/**
	 * 本地进度（假进度）
	 * @param progressbar
	 */
	function localProgress(progressbar){
		progressbar.interval = setInterval(function(){
			if(progressbar.getPercent() < 50){
				progressbar.setValue(progressbar.getValue() + Math.random()*2);
			}else if(progressbar.getPercent() < 80){
				progressbar.setValue(progressbar.getValue() + Math.random());
			}else if(progressbar.getPercent() < 95){
				progressbar.setValue(progressbar.getValue() + Math.random()*0.5);
			}else if(progressbar.getPercent() < 99){
				progressbar.setValue(progressbar.getValue() + Math.random()*0.1);
			}else if(progressbar.getPercent() < 99.9){
				progressbar.unactive();
				clearInterval(progressbar.interval);
			}
		},500);
	}
	/**
	 * 对文件类型进行检查
	 */
	function includeExt(ext, exts){
		var result = false;
		ext = '.' + ext;
		if(exts){
			for (var i = 0; i < exts.length; i++) {
				if(exts[i].toLowerCase() == ext.toLowerCase()){
					result = true;
					break;
				}
			}
		}else{
			result = true;
		}
		return result;
	}
	/**
	 * 获取文字的字符串长度
	 */
	function cutstr(str, len) {
        var str_length = 0;
        var str_len = str.length;
        var result = new String();
        for (var i = 0; i < str_len; i++) {
            var a = str.charAt(i);
            str_length++;
            if (escape(a).length > 4) {
                //中文字符的长度经编码之后大于4  
                str_length++;
            }
            result = result.concat(a);
            if (str_length >= len) {
                return result;
            }
        }
        //如果给定字符串小于指定长度，则返回源字符串；  
        if (str_length < len) {
            return str;
        }
    }
	return Upload;
});