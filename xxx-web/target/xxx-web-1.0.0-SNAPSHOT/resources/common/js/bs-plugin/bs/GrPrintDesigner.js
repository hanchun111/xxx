/**
 * 
 */
define(["bs-plugin/XObject","bs-plugin/Env","bs-plugin/bs/GrPrint"],function(XObject,Env,GrPrint){
	var GrPrintDesigner=GrPrint.extend({
		clsid : '3C19F439-B64D-4dfb-A96A-661FE70EA04D',
		chromeClsId:'application/x-grplugin-designer',
		checker:'UserName',
		propsInAttrs:["width","height"],
		initialize : function(cfg){
			GrPrintDesigner.superclass.initialize.apply(this, arguments);
		},getHtml : function(){
			var buffer = [];
			buffer.push('<object');
			buffer.push('  width="'+this.width+'"');
			buffer.push('  height="'+this.height+'"');
			if (Env.isIE){
				buffer.push('  classid="clsid:' + this.clsid + '"');
			}else{
				buffer.push(' type="'+this.chromeClsId+'"')
			}
			buffer.push('>')
			buffer.push('<param name="SerialNo" value="' + this.serialNo + '"/>');
			buffer.push('<param name="UserName" value="' + this.userName + '"/>');
			buffer.push('</object>');
			return buffer.join('');
		},
	})
	return GrPrintDesigner;
})