/**
 * 通用控件安装辅助类
 * @class bs.plugin.PluginAssist
 * @static
 */
define([],function(){

	var dialog, mask,
	    header, title,
	    closer, content,
	    buttons, ok, cancel;

	var INSTALL_PLUGIN = '<div style="font-size:1.1em;font-weight:bold;margin:15px 5px;">${GuideTitle}。您可以：</div><div style="font-size:1.1em;line-height:25px;margin:20px 10px 0px 0px;"><ol style="margin-top:-10px;"><li><span style="cursor:pointer;color:#800000;margin-left:3px;text-decoration:underline" id="_pa_install">在线安装</span>：弹出窗口方式，请按照弹窗内说明操作。<br/>如果不能正确弹出窗口，请检查浏览器设置(工具-&gt;弹出窗口阻止程序)或者第三方插件/工具条的窗口拦截设置。</li><li><span style="cursor:pointer;color:#800000;margin-left:3px;text-decoration:underline" id="_pa_download">下载安装</span>：手动下载后，请运行安装程序。</li></ol></div>',
	    PLUGIN_UN_SUPPORT = '<div style="font-size:1.1em;font-weight:bold;margin:20px 15px;">您需要安装插件才能使用此功能<br/><br/>当前浏览器不支持安装本功能插件，请使用以下浏览器<ul><li>Internet Explorer 8.0 以上版本</li></ul></div>',
	    INSTALL_GUIDE = '<div style="font-size:1.1em;font-weight:bold;margin:15px 5px;">控件安装引导</div><div style="font-size:1.1em;line-height:25px;margin:20px 10px 0px 0px;"><ol style="margin-top:-10px;"><li>在页面顶部是否出现了黄色的信息栏，请点击然后选择“安装ActiveX控件”</li><li>会出现IE插件安装的请求框，请点击“立即安装”</li><li>如果您的浏览器没有出现加载项信息栏黄条，或者通过以上步骤无法正确安装插件，请尝试<span onclick="location.href=\'${exebase}\'" style="cursor:pointer;color:red;margin-left:3px;text-decoration:underline">下载安装</span></li></ol></div>';

	var isIE = !!(window.ActiveXObject || "ActiveXObject" in window),
	    isIE6 = /MSIE 6.0/ig.test(navigator.appVersion);

	function pageWidth(){
		return window.innerWidth != null ? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body != null ? document.body.clientWidth : null;
	}

	function pageHeight(){
		return window.innerHeight != null? window.innerHeight : document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body != null? document.body.clientHeight : null;
	}

	function topPosition(){
		return typeof window.pageYOffset != 'undefined' ? window.pageYOffset : document.documentElement && document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ? document.body.scrollTop : 0;
	}

	function leftPosition(){
		return typeof window.pageXOffset != 'undefined' ? window.pageXOffset : document.documentElement && document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft ? document.body.scrollLeft : 0;
	}

	function showAssist(p){
		if(dialog == null) {
			dialog = document.createElement('div');
			dialog.style.cssText = 'position:absolute; width:425px; padding:1px; z-index:100000; background:#fff;';
			header = document.createElement('div');
			header.style.cssText = 'display:block; position:relative; width:411px; padding:7px 6px 0px; height:22px; font-size:14px; font-weight:bold;background-color:#ABBFCC;color:#355468; border:1px solid #4f6d81;';
			title = document.createElement('div');
			title.style.cssText = 'float:left;';
			closer = document.createElement('div');
			closer.innerHTML = "X";
			closer.style.cssText = 'float:right; cursor:pointer; margin:-1px 0 0 0; height:16px; width:16px; text-align:center;font-family: Arial Black;font-size:12px;color:white;';
			content = document.createElement('div');
			content.style.cssText = 'display:block; height:180px; padding:6px; color:#666666; font-size:13px;border:1px solid #4f6d81; border-top:none;border-bottom:solid 1px #ddd';
			buttons = document.createElement('div');
			buttons.style.cssText = 'display:block; height:28px; padding:8px; color:#666666; font-size:13px;border:1px solid #4f6d81; border-top:none;';
			cancel = document.createElement('div');
			cancel.style.cssText = 'float:right;cursor:pointer;width:60px;color:black;border:solid 1px #ddd;text-align:center;padding:5px 3px 2px 3px;padding:3px;margin:3px 5px';
			cancel.innerHTML = "关 闭";
			mask = document.createElement('div');
			mask.style.cssText = 'position:absolute; top:0; left:0; min-height:100%; width:100%; background:#FFF; opacity:.75; filter:alpha(opacity=75); z-index:100';
			document.body.appendChild(mask);
			document.body.appendChild(dialog);
			dialog.appendChild(header);
			header.appendChild(title);
			header.appendChild(closer);
			buttons.appendChild(cancel);
			dialog.appendChild(content);
			dialog.appendChild(buttons);
			closer.onclick = function(){hide();};
			closer.onmouseover = function(){closer.style.backgroundColor="#355468";};
			closer.onmouseout = function(){closer.style.backgroundColor="";};
			cancel.onclick = function(){hide();};

			if (isIE6) {
	            shim = document.createElement('iframe');
	            shim.src = 'about:blank';
	            shim.style.position = 'absolute';
	            shim.style.visibility = 'hidden';
	            shim.style.border = 'none';
	            shim.style.zIndex = '9998';
	            document.body.insertBefore(shim, document.body.firstChild);
	        }
		} else {
			mask.style.visibility = 'visible';
			dialog.style.visibility = 'visible';
			if (isIE6) {
				shim.style.visibility = 'visible';
			}
		}

		var gt = p.update ? '该功能所需要的插件有更新'
		           : '该功能需要插件的支持，请先安装插件';

		title.innerHTML = '插件安装助手';
		content.innerHTML = !isIE ? PLUGIN_UN_SUPPORT
		                      : INSTALL_PLUGIN.replace(/\$\{GuideTitle\}/i, gt);
		if (isIE) {
			var a = document.getElementById("_pa_install"),
			    b = document.getElementById("_pa_download");
			a.onclick = function(){install(p);};
			b.onclick = function(){download(p);};
		}

		var pw = pageWidth();
		var ph = pageHeight();
		var left = leftPosition();
		var top = topPosition();
		var dialogWidth = dialog.offsetWidth;
		var dialogHeight = dialog.offsetHeight;
		var tp = top + (ph / 3) - (dialogHeight / 2.5);
		var lp = left + (pw / 2) - (dialogWidth / 2);
		dialog.style.top = tp + "px";
		dialog.style.left = lp + "px";
		mask.style.height = Math.max(ph, document.body.scrollHeight) + 'px';

		if (isIE6) {
			shim.style.width = dialogWidth + 'px';
			shim.style.height = dialogHeight + 'px';
			shim.style.left = lp + 'px';
			shim.style.top = tp + 'px';
			shim.style.visibility = 'visible';
		}
	}

	function hide(){
		dialog.style.visibility = "hidden";
		mask.style.visibility = "hidden";
		if (isIE6) {
			shim.style.visibility = "hidden";
		}
	}

	function install(p){
		var win, buffer = [];

		buffer.push('<title>控件安装引导</title>');
		buffer.push('<object');
		buffer.push('  width="0"');
		buffer.push('  height="0"');
		if (isIE){
			buffer.push('  classid="clsid:' + p.classid + '"');
		}else{
			buffer.push(' type="'+p.chromeClsId+'"')
		}
		buffer.push('  codebase="' + p.codebase + '"');
		buffer.push('></object>');
		buffer.push(INSTALL_GUIDE.replace(/\$\{exebase\}/i, p.exebase));

		win = window.open("about:blank", "test", "resizable=0,title=no,menubar=no,toolbar=no,scrollbars=no,width=600,height=400");
		win.document.write(buffer.join(''));
	}

	function download(p){
		document.location = p.exebase;
	}

	return {
		/**
		 * 安装控件
		 * @param {Object} p 控件的配置属性, 包括：
		 * <ul><li><b>classid</b> : <div class="sub-desc">控件的classid</div></li>
		 * <li><b>codebase</b> : <div class="sub-desc">cab包的路径</div></li>
		 * <li><b>exebase</b> : <div class="sub-desc">可选，exe安装包的路径</div></li></ul>
		 */
		install : function(p){
			showAssist(p);
		}

	};

});