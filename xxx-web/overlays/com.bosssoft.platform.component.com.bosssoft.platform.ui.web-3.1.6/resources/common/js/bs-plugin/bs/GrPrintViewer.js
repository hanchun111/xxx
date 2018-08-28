/**
 * 
 */
define(["bs-plugin/XObject","bs-plugin/Env","bs-plugin/bs/GrPrint"],function(XObject,Env,GrPrint){
	var GrPrintViewer=GrPrint.extend({
		/**
		 * @property clsid CLSID
		 */
		propsInAttrs: ['width','height'],
		clsid : 'B7EF88E6-A0AD-4235-B418-6F07D8533A9F',
		functions:['Start','Stop','Register'],
		chromeClsId:'application/x-grplugin-printviewer',
		getHtml : function(){
				var buffer = [];
				buffer.push('<object');
				buffer.push('  width="'+this.width+'"');
				buffer.push('  height="'+this.height+'"');
				if (Env.isIE){
					buffer.push('  classid="clsid:' + this.clsid + '"');
				}else{
					buffer.push(' type="'+this.chromeClsId+'"')
				}
				buffer.push('>');
				buffer.push('<param name="SerialNo" value="' + this.serialNo + '">');
				buffer.push('<param name="UserName" value="' + this.userName + '">');
				buffer.push('</object>');
				return buffer.join('');
			},
			initialize : function(cfg){
				GrPrintViewer.superclass.initialize.apply(this, arguments);
			}
	}
	
	)
	return GrPrintViewer;
	

});

