define(["app/core/app-core","app/data/app-ajax","app/widgets/app-widget","base/dotpl-js"], function(App,ajax,Widget,dotpl){
	var DEFAULTOPTIONS = {};

	var Portlet = Widget.extend({
		initialize : function(el, options) {
			if (!options) {
				options = {};
			}
			Portlet.superclass.initialize.call(this, options);

			//var t = $(el);
			this.element=el;			
			var opts = $.extend({}, Portlet.defaults, Portlet
					.parseOptions(el), options);
		    this.options=opts;
			$.data(el, "portletData", {
				options :opts
			});
			this.render();
		},render:function(){
			var el=$(this.element);
			var portalPanel=$(dotpl.applyTpl(Portlet.tpl,this.options));
			this.header=$(".portal-panel-heading",portalPanel);
			el.append(portalPanel);
			if (!this.options.title){
				this.header.hide();	
			}
			this.portalBody=portalPanel.find(".portal-panel-body");
			if (this.options.url){
				this.portalBody.empty().loadAppURL({
					"url":this.options.url,
					"noloading":true
				});
				
			}
			
		},reload:function(){
			
			if (this.options.url){
				this.portalBody.empty().loadAppURL({
					"url":this.options.url,
					"noloading":true
				});
				
			}
		}
		
	});
	$.fn.portlet=function(options,param){
		var methodReturn;

		options = options || {};
		$set = this.each(function() {
					var $this = $(this);
					var state = $.data(this, 'portletData');
					var data = $this.data('portlet');
					if (state) {
						if (typeof options === 'object') {
							opts = $.extend(state.options, options);
						}
					} else {
						data = new Portlet(this, options);
						$this.data('portlet', data);
					
					}
					if (typeof options === 'string')
						methodReturn = data[options](this, param);
				});
		return (methodReturn === undefined) ? $set : methodReturn;
		
	}


	Portlet.defaults={
		code:"",
		url:"",
		maximizable:false,
		closable:false,
		refresh:false,
		title:'',
		iconCls:""
			
	};
	
	Portlet.tpl='<div class="portal-panel portal-panel-default"><div class="portal-panel-heading"><i class="icon-runaway" ></i>${title}</div> <div class="portal-panel-body"> </div></div>';
	Portlet.parseOptions = function(target) {
		var t = $A(target);
		var padding = [];
		var margins = [];
		var options=t.parseOptions(target , {
									closable : "boolean",
							
									maximized : "boolean"
								});
		if (options["code"]){
			if ($A.getPortalet){	
				var portal=$A.getPortalet(options["code"]);								
				options=$.extend(options,portal)
			}

		

	}
		return options;	
	}
	
	
	
	
	
	

	return Portlet;
});
		