/**
 * Bs内部往来加载控制
 */
define(['bs-plugin/XObject','bs-plugin/Env','bs-plugin/bs/BsPlugin'], function(XObject, Env, BsPlugin){
	var BsNetCtl = BsPlugin.extend({
		version: '1,0,3,0',
		clsid : '703D2712-EC7D-48DF-904F-55E5B2DEDF99',
		chromeClsId: 'application/x-grplugin-printviewer',
		codebase: 'BsNetCtl.CAB',
		exebase: 'BSPRINT.EXE',
		downLoadUrl: '',
		queryTempleteUrl: '',
		queryTemplistUrl :'',
		propsInAttrs: ['downLoadUrl', 'queryTempleteUrl', 'queryTemplistUrl', 'cookies'],
		functions: ['getTempletePath', 'setPrinter', 'getPrintSet'],
		getHtml: function(){
			var buffer = [];
			buffer.push('<object');
			buffer.push(' width="'+this.width+'"');
			buffer.push(' height="'+this.height+'"');
			if (Env.isIE){
				buffer.push(' classid="clsid:' + this.clsid + '"');
			}else{
				buffer.push(' type="'+this.chromeClsId+'"')
			}
			buffer.push('>');
			buffer.push('<param name="Cookie" value="Cookie:' + this.cookies + '"> ')
			buffer.push('<param name="HostUrl" value="' + Env.getHostUrl() + '"> ')
			buffer.push('<param name="DownloadUrl" value="' + this.downLoadUrl + '"> ')
			buffer.push('<param name="QueryTemplistUrl" value="' + this.queryTemplistUrl + '"> ')
			buffer.push('<param name="QueryTempnameUrl" value="' + this.queryTempleteUrl + '"> ')
			buffer.push('</object>');
			return buffer.join('');
		}
	})
	return BsNetCtl;
})