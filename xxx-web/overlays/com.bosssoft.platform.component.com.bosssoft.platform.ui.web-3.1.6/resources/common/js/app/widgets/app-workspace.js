define(	["app/core/app-jquery", "app/core/app-core", "app/core/app-options", "app/widgets/app-widget"], function($, $A, Opts,
				 Widget) {
	
	var WorkSpace = Widget.extend({
		initialize : function(el, options) {
			if (!options) {
				options = {};
			}
			WorkSpace.superclass.initialize.call(this, options);
		},
		getActionPage:function(){
			
			return null;
			
		},
		/**
		 * @pageInfo {pageTitle:pageTitle,pageId:pageId,pageUrl:pageUrl}
		 */
		addPage:function(pageInfo){
			
			
		}
		

	})
	
	return WorkSpace;
})