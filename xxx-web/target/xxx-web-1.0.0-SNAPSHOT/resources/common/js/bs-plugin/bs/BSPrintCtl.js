/**
 * BSPrint表格打印控件
 */
define(["bs-plugin/XObject","bs-plugin/Env","bs-plugin/bs/BsPlugin"],function(XObject,Env,BsPlugin){
	var BSPrintCtl=BsPlugin.extend({
		version:'1,5,0,0',
		/*
		* @property clsid CLSID
		 */
		clsid : '8607A8CE-2EB3-4A59-AD8C-314C17879064',
		chromeClsId:'application/x-grplugin-printviewer',
		codebase:'BSPrint.cab',
		exebase:'BSPRINT.exe',
		downLoadUrl: '',
		queryTempleteUrl: '',
		queryTemplistUrl :'',
		propsInAttrs: [],
		functions : ['Print'],
		getHtml : function(){
			var buffer = [];
			buffer.push('<object');
			buffer.push(' width="0"');
			buffer.push(' height="0"');
			if (Env.isIE){
				buffer.push(' classid="clsid:' + this.clsid + '"');
			}else{
				buffer.push(' type="'+this.chromeClsId+'"')
			}
			buffer.push('>');
			buffer.push('</object>');
			return buffer.join('');
		}
	})
	BSPrintCtl.getInstance=function(){
	     if (!this.instance){
	    	 this.instance =new BSPrintCtl();
	     }
	     return this.instance;
	 }
	return BSPrintCtl;
})