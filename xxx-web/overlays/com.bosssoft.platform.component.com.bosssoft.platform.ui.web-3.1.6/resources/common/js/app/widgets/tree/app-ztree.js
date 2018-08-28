/**
 * 表格扩展
 */
define(["app/core/app-jquery","app/core/app-core","app/data/app-ajax",
"app/core/app-events", "jquery/jquery.ztree"],function($,$A,$ajax, Events) {
	
	/**
	 * 取得ztree的jquery对象
	 */
	$.fn.getAppZTree=function(){
		var $this=$(this);
		if(!$this.isZTree())
			return
		if($this.attr("isztree")=="true"){
			return $.fn.zTree.getZTreeObj($this.attr("id"));
		}
		return  $.fn.zTree.getZTreeObj($this.attr("ztreeid"));
	};
	
	/**
	 * 判断当前对象是否是jqgrid对象
	 */
	$.fn.isZTree=function(){
		return $(this).attr("isztree")=="true" || $(this).attr("ztreeid");
	};
	
//	/**
//	 * 更新搜索列表中的节点
//	 * add by tw
//	 */
//	$.fn.zTree.updateSearchRow = function(row){
//		var treePnl = $("#"+id).parent().parent();
//		var $slst = treePnl.find(".serachList");
//		var $a = $slst.find("li>a[val="+row[idKey]+"]");
//		$a.text(row[nameKey]).data("bindData",row);
//	};
	
	/**
	 * 树搜索
	 */
	$.fn.zTree.search=function(id){
		var $ele = $("#"+id);
		var treeObj = $ele.getAppZTree();//树对象
		var setting = treeObj.setting;//取树配置
		var dataSet = setting.data
			,idKey=dataSet.simpleData.idKey
			,titKey=dataSet.key.title
			,nameKey=dataSet.key.name;//取树数据配置
		var searchFields=dataSet.searchFields
		var treePnl = $("#"+id).parent().parent();
		var slst = treePnl.find(".serachList");
		var edt =  treePnl.find(".searchBar input");
		var txtVal = edt.val();//树搜索框值
		var data={};
		if(txtVal){
			if (searchFields){
				data["searchFields"]=searchFields;
				data["_key"]=txtVal;
			}else{
				data[idKey]=txtVal;
			};			
		}else{//无值
			$("#"+id).show();//隐藏树
			slst.hide();//显示搜索列表
			treePnl.find(".searchBar a").attr("title","请输入内容后再执行搜索。");
			setTimeout(function(){
				treePnl.find(".searchBar a").attr("title","执行搜索");
			}, 3000);
			return ;
		}
		if(setting.async && setting.async.otherParam) {//其它参数
			$.extend(data,setting.async.otherParam);
			//data.otherParam=setting.otherParam;
		}
		
		try{
			$ajax.ajaxCall({
				 url:setting.qryUrl,
				 data:data,
				 dataType:'json',
				 type:setting.method,
				 success:function(data){
					 edt.focus();
					 edt[0].select();
					 $("#"+id).hide();//隐藏树
					 slst.empty();
					 if(data && data.length>0){//生成搜索列表
						for(var i=0;i<data.length;i++){
								var row = data[i];
								var $el = $('<li><a val="'+row[idKey]+'" title="'+row[titKey]+'" href="javascript:void(0)" onkeyup="$.fn.zTree.searchListKey.call(this,event)">'+row[nameKey]+'</a></li>');
								slst.append($el);
								$el.find(">a").data("bindData",row);
								
						}
					 }else{
						  //html.push("<li>没有找到数据。</li>");
						 slst.empty().append($("<li>没有找到数据。</li>"));
					 }
					 //slst.html(html.join(''));
					if(!setting.clickSearchNode){
						setting.clickSearchNode = setting.callback.onClick;
					}
					if(setting.clickSearchNode){//与树的单击事件绑定
							var aObj = slst.find("a");
							aObj.click(aObj,function(e){
								aObj.removeClass("select");
								$(this).addClass("select");
								var $ths= $(this);//,json = {};
								
								//json[idKey]=$ths.attr("val");
								//json[titKey]=$ths.attr("title");
								//json[nameKey]=$ths.html();
								//json["bindData"] = $this.data("bindData");
								//add by tw
								var nodeData = $ths.data("bindData");
								nodeData["idKey"] = $ths.attr("val");
								nodeData["titKey"] = $ths.attr("title");
								nodeData["nameKey"] = $ths.html();
                                treeObj.selectNode(treeObj.getNodeByParam($ele.attr('idField'),nodeData["idKey"],null))
								setting.clickSearchNode(e,$ths.attr("val"),nodeData);

                            });
					}
					if(setting.callback.onDblClick){//与树的双击事件绑定
							var aObj = slst.find("a");
							aObj.dblclick(function(e){
								aObj.removeClass("select");
								$(this).addClass("select");
								var $ths= $(this),json = {};
								json[idKey]=$ths.attr("val");
								json[titKey]=$ths.attr("title");
								json[nameKey]=$ths.html();
                                treeObj.selectNode(treeObj.getNodeByParam($ele.attr('idField'),nodeData["idKey"],null))

								setting.callback.onDblClick(e,$ths.attr("val"),json);
							});
					}
					slst.show();//显示搜索列表
				}
			});
		}catch (e) {
		}
	};
	/**
	 * 搜索列表通过方向键移动选中行
	 */
	$.fn.zTree.searchListKey = function(e){
		if(e.keyCode==40 || e.keyCode==38){//按了↓键或↓键
			var down =e.keyCode==40;//是否↓键
			var lst= this.nodeName.toUpperCase()=="INPUT"?$(this).parent().parent().find(".serachList"):$(this).parent().parent();
			var row = lst.find("a"),rowCnt = row.size();
			if(rowCnt>0){//如果搜索列表有记录时
				var sltRow = lst.find("a.select"),index = row.index(sltRow),willRow;
				if(sltRow.size()==0 || (index+1==rowCnt && down)){//如果没有选中行时或者是按↓键且最后一行时
					willRow = down?row.first():row.last();
				}else if(!down && index==0){
					willRow = row.last();
				}else{
					willRow = down?sltRow.parent().next():sltRow.parent().prev();
					willRow = willRow.find("a");
				}
				sltRow.removeClass("select");
				willRow.addClass("select").focus();
			}
		}
	};
	/**
	 * 生成树的搜索栏
	 * 20140528 lzj 增加
	 */
	$.fn.zTree.bulidSearchBar=function(id){
		var $this = $(this),con = $this.parent();
		var h = con.innerHeight();//,w = con.width();
		con.resize(function(){
			var h = $(this).innerHeight();
			$(this).find(".treePnl").height(h-pnl.find(".searchBar").outerHeight());
		});
		//生成搜索栏
		$this.wrap('<div class="treePnl"></div>');
		var pnl = $this.parent().parent();
		pnl.prepend('<div class="searchBar"><input  placeholder="搜索"/><div><a href="javascript:$.fn.zTree.search(\''+id+'\')" title="执行搜索"><span></span></a></div></div>');
		pnl.height(h-pnl.find(".searchBar").outerHeight());//父容器高度减去搜索栏高度
		
		$this.parent(".treePnl").append("<ul class='serachList'></ul>");//追加搜索列表
		pnl.find(".searchBar input").unbind("keyup").keyup(id,function(e){
			if(!this.value){//无值时显示树，隐藏列表
				$(this).parent().parent().find(".serachList").hide();
				$("#"+id).show();
			}else{//有值时,回车执行搜索
				if(e.keyCode==13){
					$.fn.zTree.search(id);
					e.stopPropagation();//阻止冒泡
					return false;
				}else{
					$.fn.zTree.searchListKey.call(this,e);
				}
			}
		});
	};
	/**
	 * 初始化树
	 */
	$.fn.initZTree=function(){
		this.each(function(){
			var $this = $(this)
			,id=$this.attr("id")||("ztree"+$A.nextId())
			,url=$this.attr("url")
			,qryUrl=$this.attr("qryUrl")||url //搜索栏的服务端请求地址,2013-05-28 lzj增加
			,hasQry=$this.attr("hasQry")!="false"//是否需要搜索栏,2013-05-28 lzj增加
			,async=$this.attr("isasync")=="true"
			,autoParams=$this.attr("autoParam")?$this.attr("autoParam").split(","):[]
			,otherParam=$this.attr("otherParam")?$this.getJsonAttr("otherParam"):{}    
			,method=$this.attr("method")||"POST"
			,checkable=$this.attr("checkable")=="true"
			,checkboxType=$this.attr("checkboxType")
            ,checkField=$this.attr("checkField")||"checked"
            ,childrenField=$this.attr("childrenField")||"children"
            ,nameField=$this.attr("nameField")||"name"
            ,titleField=$this.attr("titleField")||nameField
            ,idField=$this.attr("idField")||"id"
            ,parentField=$this.attr("parentField")||"pid"
            ,rootId=$this.attr("rootId")
            ,oneroot=$this.attr("oneRoot")=="true"
            ,events=$this.attr("events")||$this.html()
            ,hasRoot=$this.attr("hasRoot")=="true"
            ,rootNode = $this.getJsonAttr("rootNode")
            ,rootName=$this.attr("rootName")
            ,showIcon=$this.attr("showIcon")!="false"
            ,searchFields=$this.attr("searchFields")
            ,showLine=$this.attr("showLine")
            //,autoLoad = $this.attr("autoLoad")!="false"
			,sortable = $this.attr("sortable")=="true"
			//add by tw 是否允许同时选中多个节点
			,selectedMulti = $this.attr("selectedMulti")=="true"
			,clickSearchNode = $this.getJsonAttr("clickSearchNode")	
			$this.html("");
			$this.attr("isztree","true");
			var setting={treeId:id};
			$this.attr("id",id),$container=null,fit=$this.attr("fit")=="true";
			//20140528 lzj 增加，树搜索
			if(hasQry){//需要搜索时
//				qryUrl="http://localhost/platform/agency/qryDw.do";//测试用，临时增加
				setting["qryUrl"]=qryUrl;
				if(!setting['async']){
					setting['async'] = {};
				}
				
				setting['async']['otherParam']=otherParam;
				setting['method']=method;
				setting['clickSearchNode'] = clickSearchNode;
				$.fn.zTree.bulidSearchBar.call(this, id);
				//add by tw
			
				//暂时先处理一下，由于有搜索框的时候结构变了，这是个bug
				if($this.parent().parent().hasClass("ztree-container")){
					$container = $this.parent().parent();
					
				}
			}else{
				//add by tw
				//暂时先处理一下，由于有搜索框的时候结构变了，这是个bug
				if($this.parent().hasClass("ztree-container")){
					$container = $this.parent();
				
				}
			}
			$container.attr("ztreeid",id);
			
			$container.css("overflow","auto");
			if (fit){
				$container.bind("_resize",function(){
					var treePanel=$(this);
					var p=$(this).parent();
					var pwidth=p.width();
					var pheight=p.height();
					var cwidth=$container.width();
					var cheight=$container.height();
				
					if (pwidth>cwidth){
						p.css({'overflow-x':'hidden'});
					}
					if (pheight>cheight){
						p.css({'overflow-y':'hidden'});
					}
					treePanel.width(pwidth);
					treePanel.height(pheight);
					if (hasQry){
						treePanel.find()
						treePanel.find(".treePnl").height(pheight-treePanel.find(".searchBar").outerHeight());
					}
				});
			};
			
			
			if(async){
				setting["async"]={
					enable:true,
					url:url,
					dataType:"json",
					autoParam:autoParams,
					otherParam:otherParam,
					type:method
				};
			}else{
				setting["async"]={enable:false};
			}
			if(events){
				setting["callback"]=$this.getJsEvent(events);
			}
			if(checkable){
				setting["check"]={enable:true,check:true};
				if(checkboxType){
					setting["check"]["chkboxType"]=$A.jsonEval(checkboxType);
				}
			}else{
				setting["check"]={enable:false};
			}
			
			var dataSetting={
				key:{
					checked:checkField,
					children:childrenField,
					name:nameField,
					title:titleField
				},
				simpleData:{
					enable:true,
					idKey:idField,
					pIdKey:parentField,
					rootPId:rootId
				},
				keep:{
					parent : true
				},
				searchFields:searchFields
			};
			setting["data"]=dataSetting;
			setting["view"]={
				showIcon:showIcon,
				selectedMulti:selectedMulti
			};
			
		/*	if(oneroot){
				setting["view"]["showLine"] = function(treeId, treeNode){
					return treeNode.level > 0;
				};
			}*/
			if (showLine=="true"){
				setting["view"]["showLine"]=true
			}else{
				setting["view"]["showLine"]=false
			}

			var root={isParent:true,open:true};
			root[idField]=rootId;
			root[nameField]=rootName;
			if(rootNode){
				$.extend(root,rootNode);
			}
		
			if(!async && url){
				$ajax.ajaxCall({
					 url:url,
					 data:otherParam,
					 dataType:'json',
					 type:method,
					 success:function(data){
							if(hasRoot)
								data.push(root);
						if(hasRoot){
							initZtree();
							var treeObj=$this.getAppZTree();
							treeObj.addNodes(null,data);
						}else{
							initZtree(data);
						}
					}
				});
				
			}else{
				var data=[];
				if(hasRoot){
					data.push(root);
				}
				if(sortable){
					setting.edit = {
							drag: {
								autoExpandTrigger: true,
								prev: true,
								inner: false,
								next: true
							},
							enable: true,
							showRemoveBtn: false,
							showRenameBtn: false
					};
				}
				//添加initUIExtConfig属性注入
                if(!$container.attr("_options")){
                    $container.attr("_options","{}")
				}
                var customSetting = $container.getJsonAttr('_options');
                if($.isFunction(customSetting.beforeRender)){
                    customSetting.beforeRender.call(this, setting);
                }
				initZtree(data);
			}
			/**
			 * 抽取共同的初始化方法
			 * @author Mr.T
			 */
			function initZtree(data){
				$.fn.zTree.init($this, setting, data);
				var ztree = $.fn.zTree.getZTreeObj(id);
				if(hasRoot){
					var node = ztree.getNodesByParam("id",root[idField]);
					if (node != null) {
						ztree.expandNode(node[0], true, false, false);
					}
				}
				
				attachEvent(ztree);
			}
			/**
			 * 给树对象 附加事件机制
			 * @author Mr.T
			 */		
			function attachEvent(ztree){
				Events.enhance(ztree);
				
				var cb = ztree.setting.callback;
				for(var event in cb){
					if(cb[event]){
						ztree.on(event, cb[event]);
					}
					cb[event] = (function(e){
						return function(){
							var args = Array.prototype.slice.call(arguments, 0);
							args.splice(0, 0, e);
							return ztree.trigger.apply(ztree, args);
						}
					})(event);
				}
			}
		});
		
	};
		
});