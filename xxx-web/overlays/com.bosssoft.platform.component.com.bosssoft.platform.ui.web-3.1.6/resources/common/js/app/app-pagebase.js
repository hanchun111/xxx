define(
		[ "app/core/app-base" ],
		function(Base){
			
			PageBase = Base.extend({
				initialize:function(){
					PageBase.superclass.initialize.call(this);
					this.initUIExtConfig();
				},
				init:function(){
					this.bindEvents();
					this.initPage(arguments[0]);
				},
				/**
				 * @event
				 * 页如初始化
				 */
				initPage:function(model){
				
				},
				initUIExtConfig:function(){},
				listeners :{
				},
				contorlType:{
				"button":"button",
				"form":"form",
				"menubutton":"menubutton",
				"panel":"panel",
				"jqgrid":"jqgrid",
				"grid":"grid",
				"textbox":"textbox",
				"money":"money",
				"number":"number",
				"typeahead ":"typeahead",
				"combobox":"combobox",
				"combo":"combo",
				"comboztree":"comboztree",
				"reference":"reference",
				"combogrid":"combogrid",
				"suggest":"suggest",
				"datetime":"datetime",
				"checkbox":"checkbox",
				"upload":"upload",
				"appTabs":"appTabs",
				"tabs":"tabs",
				"ztree":"ztree",
				"xquery":"xquery",
				"treegrid":"treegrid"
				},
				/**
				 * @event
				 * 初始事件绑定
				 */
			  	bindEvents:function(){
			  		for(var key in this.listeners){
			  		
			  		var events=this.listeners[key],control=$A("#"+key),findEvent=false,className="";
			  		
			  		 
			  		  	if (!control){
			  		  		if (window.console){
			  		  			console.log("id:"+key+"控件不在在");
			  		  		}
			  		  	}
			  		 
				  		if (control.data){
				  			for(var controlTypeKey in this.contorlType){
					  			if (control.data(controlTypeKey)!=undefined){
					  				 className=this.contorlType[controlTypeKey];
				  					 break;
					  			}  
					  		} 
					  		for(var eventName in events){
					  			if (className){
						  			var eventObj={};
				  					eventObj[eventName]=events[eventName];
				  					control[className]("unbind",eventName);
				  					control[className]("bind",eventObj);
					  			}else{
					  				control.off(eventName,events[eventName]);
					  				control.on(eventName,events[eventName]);
					  				
					  			}
					  		}
				  		}else if (control.setting){
				  			for(var eventName in events){
				  				control.off(eventName,events[eventName]);
				  				control.on(eventName,events[eventName]);
					  		}
				  		}
			  		}
			  		/*if (key.indexOf("_")>-1){
			  			var eventparams=key.split("_");
			  			if (eventparams.length==2){
			  				var id=eventparams[0],eventName=eventparams[1],control=$A("#"+id),findEvent=false;;
			  				for(var controlTypeKey in this.contorlType){
			  					if (control){
			  					if (control.data(controlTypeKey)){
			  						var className=this.contorlType[controlTypeKey];
			  						var eventObj={};
			  						eventObj[eventName]=this.listeners[key];
			  						control[className]("bind",eventObj);
			  						findEvent=true;
			  						break;
			  					}
			  					}
			  				}
			  				if (!findEvent){
			  					control.on(eventName,this.listeners[key]);
			  				}
			  
			  			}
			  		}*/
			  	
			  	
			  	}

		       
    		});
			
		 return PageBase;
			
		
});