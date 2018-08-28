define(["app/core/app-base"],function(Base){

	ConfigHelper = Base.extend({
				propsInAttrs : ["configData", "columns","buttons","editors"],
				attrs : {
					configData : {},
					columns : {},
					buttons : {},
					editors:{}
				},
				initialize : function(opt) {
					opt=opt||{};
					if (!opt.configData){
						opt={configData:opt}
					}
					this.sourceData=opt.configData||opt;
					ConfigHelper.superclass.initialize.call(this,opt);
					
					if (this.configData) {
						if (this.configData.columns) {
							this.addColumns(this.configData.columns);
						}
						if (this.configData.frozenColumns) {
							this.addColumns(this.configData.frozenColumns);
						}
						if (this.configData.frozenColumnsRight) {
							this.addColumns(this.configData.frozenColumnsRight);
						}
						if (this.configData.toolbar) {
							this.addButtons(this.configData.toolbar);
						}
					
					}
				},
				
				//添加列集合
				addColumns : function(columns) {
					if (columns) {
						for (var i = 0; i < columns.length; i++) {
							for (var j = 0; j < columns[i].length; j++) {
								this.columns[columns[i][j].id] = columns[i][j];
								if (columns[i][j]&&columns[i][j].buttons){
									this.addButtons(columns[i][j].buttons);
								}
							if (columns[i][j]&&columns[i][j].editor){
									this.addEditors(columns[i][j].id,columns[i][j].editor);
								}
						}
					}
				}
				},
				addEditors:function(id,editor){
					editor.options = editor.options||{};
				  	this.editors[id] = editor.options;
				},
				//添加按钮集合
				addButtons : function(buttons) {
					if (buttons) {
						var removeBtns=[];
						for (var i = 0; i < buttons.length; i++) {
							this.buttons[buttons[i].id]=buttons[i];
							if (!$A.cehckPageComponensById(buttons[i].id)){
								//buttons[i]=null;
								removeBtns.push(i);
							}
						}
						for(var i=0;i<removeBtns.length;i++){
							buttons.splice((removeBtns[i]-i),1);
						}
					}
					
					
				},
				getButton:function(id){
					var button=this.buttons[id],temp=new ConfigHelper(button);
					return temp;
				},
				getColumn:function(id){
					var column=this.columns[id],tem=new ConfigHelper(column);
					return tem;
					
				},
				getEditor:function(id){
					var editor=this.editors[id],temp=new ConfigHelper(editor);
					return temp;
				},
			    setAttr:function(attrName,value){
			    	this.sourceData[attrName]=value;
			    },
			    setAttrs:function(attrs){
			    	if (attrs){
				    	for(var key in attrs){
				    		this.sourceData[key]=attrs[key];
				    	}
			    	}
			    }
			});
			return ConfigHelper;
	
})