/**
 * 锐浪打印控件
 */

define(['bs-plugin/XObject','bs-plugin/Env','bs-plugin/bs/BsPlugin'],function(XObject,Env,BsPlugin){
	var GrPrint=BsPlugin.extend({
		name : '锐浪打印',
		clsid : '25240C9A-6AA5-416c-8CDA-801BBAF03928',
		chromeClsId: 'application/x-grplugin-report',
		codebase: 'grbsctl5.cab',
		exebase: 'BSPRINT.exe',
		userName: 'FujianBossSoftwareDevelopmentCoLtd',
		serialNo: 'ARWB9RLDN5GJDP5AP2B9BCHG3ANI75WFUR9BAWQ9C3Q75AFLR9L0UI514YD4B8XQ93Y2L92RP798RWQ9ICJ78LKAX4',
		version: '5,8,0,6',
		functions: ['Print', 'PrintPreview', 'Register', 'LoadFromURL', 'LoadReportURL', 'LoadDataFromAjaxRequest','ControlByName'],
		initialize: function(cfg){
			GrPrint.superclass.initialize.apply(this, arguments);
			this.Register(this.userName, this.serialNo);
		}
	});
	return  GrPrint;
	
});