/**
 * 
 * @class BosssoftPlugin
 */
define(['bs-plugin/XObject','bs-plugin/Env','bs-plugin/PluginAssist'],function(XObject,Env,PluginAssist){
	var BosssoftPlugin = XObject.extend({
		/**
		 * 检测控件是否准备就绪
		 *  1.浏览器是否支持
		 *  2.控件是否已安装
		 *  3.控件是否已加载
		 * @private
		 */
		ready : function(){
			var X = XObject,
		    r = this.test(null, true);
			if (r !== X.READY) {
				PluginAssist.install({
					classid : this.clsid,
					chromeClsId: this.chromeClsId,
					codebase : this.getCabPath(),
					exebase : this.getExePath(),
					update : r === X.OUTDATED
				});
				//控件的安装可能需要
				//刷新页面、重启浏览器等
				//相当于是异步进行
				//因此返回 false，中断后续步骤
				throw new Error(XObject.PLUGIN_UNREADY);
				return false;
			}
			return true;
		}
	});
	return BosssoftPlugin;
})


