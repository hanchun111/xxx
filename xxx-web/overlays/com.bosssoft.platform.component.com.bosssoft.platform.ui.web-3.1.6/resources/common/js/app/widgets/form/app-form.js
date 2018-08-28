/**
 * 表单方法扩展
 */
define(["app/core/app-jquery","app/data/app-ajax","app/widgets/form/app-validate","app/widgets/form/app-comp"],function($,$ajax) {
	
	/**
	 * @class 
	 * @name appform
	 * @desc  jquery methods set表单对象的jquery方法集
	 */
	$.fn.extend({
		/*
		 * 初始化表单
		 */
		initForm:function(){
			return $(this).each(function () {
				var $el = $(this),$form=$el.isTag('form')?$el:$($el.attr("app-form"))
				,state=$form.attr("opstate")||"EDIT";
				var $items=$form.find(".formitem");
				$form.bind($A.eventType.pageLoad, function() {
					state=$form.attr("opstate") || "EDIT";
					//切换状态时 先清除旧状态  以免被返回 by sjq 2014/11/06
					$form.attr("opstate","");
					$form.switchFormState(state);
				});
				var initFormUI=false;
				$items.each(function(){
					var $o=$(this)
					,$r=$o.find("div.render")
					,editor = $o.attr("editor");
					if($o.find(".editor").length==0){
					if (editor){
						$e=$("<div class=\"editor\">"+editor+"</div>");
						//改表单状态切换时，复选及单选的展示方式 by sjq 2014/09/26
						var $edior=$e.getFormEditor(),type=$edior.getCompType();
						$e.appendTo($o);
						initFormUI=true;
						}
					}
				
				});
				if (initFormUI){
					
					$form.initPageUI();
				}
				//$form.attr("init","true");
				//改表单状态切换时，复选及单选的展示方式 by sjq 2014/09/26
				//$form.attr("opstate","");
				//控制初始化后表单切状态 sjq 2014/10/30
				//
				$form.attr("initedit","true");
				
			});
			
		},
		/**
		 * @memberof appform
		 * @function
		 * @instance
		 * @name loadFormData
		 * @desc 通过ajax加载表单数据
		 * @param {object} [params] - 新参数
		 * @param {function} [callback] - 加载完成后的回调函数
		 */
		loadFormData:function(params,callback){
			$(this).each(function(){
				var $el = $(this),
				$form=$el.isTag('form')?$el:$($el.attr("app-form")),
				loadurl = (params?(params["loadurl"]?params["loadurl"]:$el.attr('loadUrl')):$el.attr('loadUrl'));
				if(!loadurl)
					return;
				var formParams=$form.attr("loadParams");
				if(formParams){
					formParams=$.extend(formParams,params);
				}else{
					formParams = params;
				}
				var transor = $form.attr("transor");
				if(transor){
					formParams["__transor"]=transor;
				}
				$form.attr("loadParams",formParams);
				op = {
					type:$form.attr("method") || 'POST',
					url:loadurl,
					data:formParams,
					dataType:"json",
					cache: false,
					toggle:$form,
					success: function(json){
						$form.refreshFormData(json);
						if(callback){
							callback(json);
						}
					},
					error: $ajax.ajaxError
				};
				$ajax.ajaxCall(op);
			});
			
			
		},
		
		/*
		 * 清空表单Editor的值(暂不提供取消checkbox选中的方法)
		 * add by tw
		 */
		clearFormEditorValue : function(){
			var $e = $(this);
			var field=$e.parent().attr("item-field");
			$e.find("input[id="+field+"],textarea[id="+field+"]").clearCompValue();
		},
		
		/*
		 * 设置表单项目编辑器的值
		 * @param value 值对象
		 * @param showValue 显示值
		 */
		setFormEditorValue:function(value,showValue){
			var $e = $(this);
			var field=$e.parent().attr("item-field");
			$e.find("input[id="+field+"],textarea[id="+field+"]").setCompData(value,showValue);
		},
		
		addFieldRequired : function(field){
			var $label =  $A("#label_"+field);
			if($label.find("span.required").length>0){
				$label.find("span.required").text("*");
			}else{
				$label.prepend("<span class=\"required\">*</span>");
			}
			$A("#"+field).attr('required',true);
		},
		//隐藏某个字段
		hideField : function(field){
			$A("."+field).hide();
		},
		removeFieldRequired : function(field){
			var $label =  $A("#label_"+field);
			$label.find("span.required").remove();
			$A("#"+field).attr('required',false);
		},
		/*
		 * 取得表单项目的编辑器值
		 * @return 
		 */
		getFormEditorValue:function(){
			var $e=$(this);
			var field=$e.parent().attr("item-field");
			return $e.find("input[id="+field+"],textarea[id="+field+"]").getCompData();
		},
		
		getFormEditor:function(){
			var $e=$(this);
			var field=$e.parent().attr("item-field");
			return $e.find("input[id="+field+"],textarea[id="+field+"]");
		},
		/*
		 * 设置表单项目的显示值
		 * @param value 值
		 * @param showValue 显示值
		 */
		setFormRenderValue:function(value,showValue){
			var $o=$(this),$r=$o.find("div.render");;
			if($r.length == 0)
				return;
			var rendertype=$o.attr("rendertype")
			
			,render = $o.attr("render");
			var $edior=$o.getFormEditor(),type=$edior.getCompType();
			if(type=="radio"||type=="checkbox"){
					if (value==$edior.val()){
						$edior[0].checked=true;
					}else{
						$edior[0].checked=false;

					}
					return;
			}
			
			if(rendertype=="TEMPLATE"){
				$r.html($template(render,{value:value,showValue:showValue}));
			}else if(rendertype=="FUNC"){
				/*先取缓存*/
				var cach = $r.data("render");
				if(cach){
					render = cach;
				}else{
					render= $o.getJsFunction("return "+render)();
					$r.data("render",render);
				}
				var rhtml = render(value,showValue,$r);
				if(rhtml !==false){
					$r.html(rhtml);
					$r.attr("title",rhtml);
				}
			}else{
				if(showValue == null)
					showValue = value;
				$r.html(showValue);
				$r.attr("title",showValue);
			}
		},
		/*
		 * 设置表单项目的值
		 * @param value {string} 表单值
		 * @param showValue {string} 表单显示值
		 */
		setFormItemValue:function(value,showValue,md){
			var $o=$(this)
			,$e=$o.find("div.editor");
			$o.attr("fieldvalue",value);
			if(showValue){
				$o.attr("fieldshowvalue",showValue);
			}
			if($e.size()>0){
				if (value===undefined||value===null){
					value="";
				}
				$e.setFormEditorValue(value,showValue);
				
				if (!showValue){
					var objVal=$e.getFormEditorValue();
					if (objVal){
						showValue=objVal["showValue"];
					}
				}
			}
			$o.setFormRenderValue(value,showValue);
		},
		
		/*
		 *清空表单项的值 
		 */
		clearFormItemValue : function(){
			var $o=$(this)
			,$e=$o.find("div.editor");
			$o.attr("fieldvalue","");
			$o.attr("fieldshowvalue","");
			if($e.size()>0){
				$e.clearFormEditorValue();
			}
			//TODO
			$o.setFormRenderValue("","");
		},
		
		clearFormData : function(){
			return this.each(function () {
				var $el = $(this),$form=$el.isTag('form')?$el:$($el.attr("app-form"))
				,$items=$form.find(".formitem"),$hitems =$form.find("[hiddencomp=true]");
				
				$hitems.each(function(){
					var $o=$(this);
					$o.val("");
				});
				$items.each(function(){
					var $o=$(this);
					$o.clearFormItemValue();
				});
				if($form.attr("init")!="true"){
					$form.attr("refresh","true");
				}
			});
		},
		
		/**
		 * @memberof appform
		 * @function
		 * @instance
		 * @name loadFormData
		 * @desc 刷新整个表单数据
		 * @param {json} [data]
		 */
		refreshFormData:function(data){
			return this.each(function () {
				var $el = $(this),$form=$el.isTag('form')?$el:$($el.attr("app-form"))
				,$items=$form.find(".formitem"),model=$form.attr("model"),$hitems =$form.find("[hiddencomp=true]");
				var md = data;
				if(model){
					if(model.indexOf(".")>1){
						$.each(model.split("."),function(i){
							md = md[this];
							if(md==null)
								return false;
						});
					}else{
						md = md[model];
					}
					if(md == null)
						md=data;
				}
				$hitems.each(function(){
					var $o=$(this),itemmodel=$o.attr("model"),field=$o.attr("field");
					var imd = md;
					if(itemmodel!=model){
						if(itemmodel.indexOf(".")>1){
							$.each(itemmodel.split("."),function(i){
								imd = imd[this];
								if(imd==null)
									return false;
							});
						}else{
							imd = imd[itemmodel];
						}
						if(imd == null)
							imd=md;
					}
					var v=imd[field];
					$o.val(v);
				});
				$items.each(function(){
					var $o=$(this),itemmodel=$o.attr("item-model"),field=$o.attr("item-field"),showField=$o.attr("item-showfield");
					var imd = md;
					if(itemmodel!=model){
						if(itemmodel.indexOf(".")>1){
							$.each(itemmodel.split("."),function(i){
								imd = imd[this];
								if(imd==null)
									return false;
							});
						}else{
							imd = imd[itemmodel];
						}
						if(imd == null)
							imd=md;
					}
					var v=imd[field];
					var sv=null;
					if(showField){
						sv=imd[showField];
					}
					
					$o.setFormItemValue(v,sv,md);
				});
				if($form.attr("init")!="true"){
					$form.attr("refresh","true");
				}
			});
		},
		/*
		 * 触发状态切换
		 */
		toggleFormState:function(){
			var $el = $(this),$form=$el.isTag('form')?$el:$($el.attr("app-form"))
			,state=$form.attr("opstate")||"EDIT";
			if(state == "VIEW")
				$form.switchFormState("EDIT");
			else
				$form.switchFormState("VIEW");
		},
		toggleFormState2:function(state){
			if(state == "VIEW")
				$form.switchFormState("VIEW");
			else
				$form.switchFormState("EDIT");
		},
		/*
		 * 切换表单状态
		 * @param state 新的表单状态
		 */
		switchFormState:function(state){
			this.each(function () {
				var $el = $(this),$form=$el.isTag('form')?$el:$($el.attr("app-form"))
				,$items=$form.find(".formitem"),oldstate=$form.attr("opstate")||"EDIT";
				if(state == oldstate||(state!="EDIT"&&state!="VIEW"))
					return;
				$form.attr("opstate",state);
				$form.addClass("formview");
				$items.each(function(index,element){
					var customwidth=$(element).attr("customwidth");
					
					var $o=$(this)
					,$r=$o.find("div.render")
					,$e=$o.find("div.editor")
					,$edior=$e.getFormEditor()
					, type=$edior.getCompType();
					if(state=="VIEW"){
						
						if($e.size()>0){
							//console.log($e.getFormEditor());
							
							var v = $e.getFormEditorValue();
							if(v){
								if(typeof v =="string"){
									$o.attr("fieldvalue",v);
								}else if(typeof v=="object"){
									$o.attr("fieldvalue",v.value);
									$o.attr("fieldshowvalue",v.showValue);
								}
							}
							$e.hide();
						}
						
						if($r.size()==0){
							if(customwidth!=undefined){
								$r=$("<div class=\"render "+type+"-render\" style=\"width:"+customwidth+";\"></div>");
							}else{
								$r=$("<div class=\"render "+type+"-render\"  ></div>");
							}
							
							$r.appendTo($o);
						}else{
							
							$r.show();
						}
						var value =$o.attr("fieldvalue")
						,showValue=$o.attr("fieldshowvalue")
						,rendertype=$o.attr("rendertype")
						,render = $o.attr("render")
						;
						if(type=="radio"||type=="checkbox"){//控制表单切换成查看 时 复选框及单选框 显示方式  by sjq   2014-09-26
							$e.show();
							$edior.attr("disabled",true);
							$r.html("");
							$r.attr("title","")
							//$r.hide();
							return;
						}
						if(rendertype=="TEMPLATE"){
							$r.html($template(render,{value:value,showValue:showValue}));
						}else if(rendertype=="FUNC"){
							render= $o.getJsFunction("return "+render)();
							if (render){
								$r.html(render(value,showValue,$r));
							}
						}else{
							if(!showValue)
								showValue = value;
							
							var htmlEncode = function (value){
								return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
							};
							$r.attr("title",showValue)
							$r.html(htmlEncode(showValue));
						}
						$form.find("div.formmore").show();
					}else if(state=="EDIT"){
						
						if($r.size()>0){
							$r.hide();
						}
						if($e.size()>0){
							$e.show();
							//控制表单切换成查看 时 复选框及单选框 显示方式  by sjq 2014-09-26
							var $edior=$e.getFormEditor()
							,type=$edior.getCompType();
							if(type=="radio"||type=="checkbox"){
								$edior.attr("disabled",false);
								$r.html("");
								return;
							}
						}else{
							var value =$o.attr("fieldvalue")
							,showValue=$o.attr("fieldshowvalue")
							,field=$o.attr("item-field")
							,showField=$o.attr("item-showfield")
							,editor = $o.attr("editor");
							if (editor){
								$e=$("<div class=\"editor\">"+editor+"</div>");
								$e.appendTo($o);
							}
							var ev = $e.find("[field="+field+"]");
							if(ev.isTag("input")||ev.isTag("select")){
								ev.val(value);
							}else{
								ev.html(value);
							}
							if(showField){
								var sev = $e.find("[field="+showField+"]");
								if(sev.length>0){
									if(sev.isTag("input")||sev.isTag("select")){
										sev.val(showValue);
									}else{
										ev.html(sev);
									}
								}
							}
							
							var $edior=$e.getFormEditor(),type=$edior.getCompType();
							if(type=="radio"||type=="checkbox"){
								$edior.attr("disabled",false);
								$r.html("");
								return;
							}
						}
						$form.find("div.formmore").hide();
						$form.openFormDetail(null,"all");
					}
				});
				if(state == "EDIT" && $form.attr("initedit")!="true"){
					$form.initPageUI();
					$form.attr("initedit","true");
				}
			});
			
		},
		/*
		 * 打开表单详细内容
		 * @param {string} [target] - jquery filter指定的表单对象
		 */
		openFormDetail:function(target,sstate){
			var $e =$(this),$form = target?$(target):($e.isTag("form")?$e:($e.attr("app-form")?$($e.attr("app-form")):$e.parents("form:first")));
			var exSum=$form.attr("summary")=="true"
				,durl=$form.attr("detailurl")
				,dparam=$form.attr("detailparameter")
				,sumCount=$form.attr("sumcount")*1
				,sumstate=$form.attr("sumstate")||"simple";
			if(sstate==sumstate)
				return;
			if(exSum && sumCount>0){
				var $trs=$form.find("table>tbody>tr:gt("+(sumCount-1)+")");
				if(sumstate == "simple"){
					$trs.show();
					$form.attr("sumstate","all");
					$form.find("div.formmore>a").html("收起");
				}else{
					$trs.hide();
					$form.attr("sumstate","simple");
					$form.find("div.formmore>a").html("更多信息");
				}
			}else if(durl){
				if(!dparam){
					dparam="id:${id}";
				}
				var params={};
				$form.find("[field]").each(function(){
					var $o =$(this),fd=$o.attr("field"),v=$o.val()||$o.attr("fieldvalue")||$o.html();
					param[fd]=v;
				});
				var pa=$template(dparam,param);
				params=eval("{"+pa+"}");
				var options = {
					href:_contextPath+durl,
					param:params,
					isWrapper:true,
					isReload:true
				};
				require(["app/widgets/window/app-dialog"],function(){
					$.openModalDialog(options);
				});
			}
		},
		isForm:function(){
			$form = $(this).getForm();
			return $form.length>0;
		},
		getForm:function(){
			var $t = $(this)
			,$form = $t.isTag('form')?$t:$($t.attr("app-form"));
			return $form;	
		},

		/**
		 * @memberof appform
		 * @function
		 * @instance
		 * @name getSumbitData
		 * @desc 取得所有组件的数据
		 * @param {object} [options] - 提交选项如{url:"",model:false,params:{gridId:gridParamName}}
		 */
		getSumbitData:function(options){
			if(!options){
				options={};
			}
			var submitData={}
			,url = options.url
			,$toggle = null
			,valid = true
			,transorObj = {}
			,hasTrans = false;
			$(this).each(function () {
				var $el = $(this);
				if($el.isForm()){
					var $form = $el.getForm();
					if(!$toggle)
						$toggle=$form;
					if($form.attr("validate")!="false" && !$form.valid()){
						valid = false;
						return;
					}
					if(!url){
						url = $form.attr("action");
					}
					if(options["model"] == true){
						var $fields = $form.find("input[model][field],select[model][field]");
						if($fields.length == 0){
							return;
						}
						var data = {};
						$fields.each(function(){
							var $t = $(this);
							data[$t.attr("field")]=$.fn.unescapeHtml($t.val());
						});
						$.extend(submitData,data);
					}else{
						$.each($form.serializeArray(),function(i,obj){
							submitData[obj.name]=$.fn.unescapeHtml(obj.value);
						});
					}
					var transor = $form.attr("transor");
					if(transor){
						transor = $A.jsonEval(transor);
						transorObj[$form.attr("id")] = transor;
						hasTrans = true;
					}
				}else if($el.data("grid")){
					$el.data("grid").endEdit();
					if($el.grid('isValid') == false){
						valid = false;
						return;
					}
					var data = $el.grid("getAllData");
					var id = $el.attr('id');
					data = JSON.stringify(data);
					var target = options.params?(options.params[id]||id):id;
					submitData[target] = data;
					
					var fixeddata = $el.grid("getFixedParameter");
					if(fixeddata && fixeddata.__transor){
						//data["__transor"] = fixeddata["__transor"];
						var transor = fixeddata.__transor;
						if(transor){
							transorObj[$el.attr("id")] = transor;
							hasTrans = true;
						}
					}
				
				}else if($el.isGrid()){
					$el=$A($el);
					
					var id = $el.bsgrid("getGridId");
					var target = options.params?(options.params[id]||id):id;
					var data;
					if(options.submitMode=="all"){
						if(!$el.bsgrid("setEditEnabled",false)){
							valid = false;
							return;
						}
						data = $el.bsgrid("getRowData");
						$el.bsgrid("setEditEnabled",true);
					}else{
						data = $el.bsgrid("getSubmitData");
						if(data == null){
							valid = false;
							return;
						}
					}
					submitData[target]=JSON.stringify(data);
					var transor = $el.attr("transor");
					if(transor){
						transor = $A.jsonEval(transor);
						transorObj[$el.attr("id")] = transor;
						hasTrans = true;
					}
				}
			});
			if(!valid)
				return valid;
			if(hasTrans)
				submitData.__transor = JSON.stringify(transorObj);
			return {url:url,toggle:$toggle,data:submitData};
		},
		/**
		 * @memberof appform
		 * @function
		 * @instance
		 * @name sumbitData
		 * @desc 提交指定的数据
		 * @param {object} [options] - 提交选项如{url:"",type:'POST',dataType:'json',cache:false}
		 * @param {json} [data] - 提交的json数据
		 */
		sumbitData:function(options,data){
			var op = $.extend({
				type:'POST',
				dataType:"json",
				cache: false
				},options,data);
			$ajax.ajaxCall(op);
		},
		/**
		 * @memberof appform
		 * @function
		 * @instance
		 * @name sumbitAllComp
		 * @desc 提交所有组件数据
		 * @param {object} [options] - 提交选项如{url:"",type:'POST',dataType:'json',cache:false,model:false,params:{gridId:gridParamName}}
		 */
		sumbitAllComp:function(options){
			var data = this.getSumbitData(options);
			if(data)
				this.sumbitData(options,data);
		},
		serializeFieldArray:function(){
			return this.map(function(){
				var elements = $.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			}).filter(function(){
				var type = this.type;
				// Use .is(":disabled") so that fieldset[disabled] works
				return this.field && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !manipulation_rcheckableType.test( type ) );
			}).map(function( i, elem ){
				var val = jQuery( this ).val();

				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val ){
							return { name: elem.field, value: val.replace( rCRLF, "\r\n" ) };
						}) :
						{ name: elem.field, value: val.replace( rCRLF, "\r\n" ) };
			}).get();
		},
		/**
		 * @memberof appform
		 * @function
		 * @instance
		 * @name submitForm
		 * @desc 表单提交方法
		 * @param {object} [options] - 提交选项如{url:"",type:'POST',dataType:'json',cache:false,model:false}
		 */
		submitForm:function(options){
			//add by tw
			options = options||{};
			return this.each(function () {
				var el = $(this),$form=el.isTag('form')?el:$(el.attr("app-form"));
				if($form.attr("validate")!="false"){
					if (!$form.valid()) {
						return;
					}
				}
				//add by tw如果参数中带了url，使用参数中的url
				var url = options.url || $form.attr("action");
				if (!url) {
					return false;
				}
				url =url.evalTemplate(el);
				var op = null,data=null;
				var $div = $("<div style=\"display:hidden;\"></div>");
				//add by tw 添加附加值
				if(options.attachData){
					for(var key in options.attachData){
						var val = options.attachData[key];
						if($.isArray(val)){
							for(var i=0;i<val.length;i++){
								var $input = $("<input type=\"hidden\" name=\""+key+"\" />").appendTo($div);
								$input.val(val[i]);
							}
						}else{
							var $input = $("<input type=\"hidden\" name=\""+key+"\" />").appendTo($div);
							$input.val(options.attachData[key]);
						}
						
					}
				}
				$form.append($div);
				
				if(options["model"]==true){
					data = $form.serializeFieldArray();
				}else{
					data=$form.serializeArray();
				}
				//移除附加值
				$div.remove();
				op = $.extend({
					"type":$form.attr("method") || 'POST',
					"url":url,
					"data":data,
					"dataType":"json",
					"cache": false,
					"toggle":$form
					},options);
				
				$ajax.ajaxCall(op);
			});
		}
	});
	$("body").on("click.data-api","[app-form]",function ( e ) {
		if(e)e.preventDefault();
		$(this).submitForm();
	});
});