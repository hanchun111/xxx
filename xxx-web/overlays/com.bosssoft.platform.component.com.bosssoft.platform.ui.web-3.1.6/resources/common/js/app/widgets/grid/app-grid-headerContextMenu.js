define(['app/core/app-class', 'app/core/app-jquery', 'app/core/app-options', 
	'app/core/app-core', 'jquery/jquery.ztree'], function(Class, $, Options, App) {
	
	'use strict';
	
	/**
	 * 导出网格的扩展方法
	 */
	var GridHeaderContextMenu = Class.create({
		/**
		 * 初始化网格的导出模块
		 */
		_initContextMenu: function(){
			if(!this.setting.columnManager){
				return;
			}
			var $headerContextMenu = $('<div class="grid-column-tree" oncontextmenu="return false"><div>' +
									       '<ul id="' + App.uuid('app_ztree_') + '" class="ztree"></ul>' +
									   '</div></div>').appendTo($.$appPanelContainer)
				,$headerContextMsg = $('<div class="grid-tree-msg">主视图区域至少保留一个列</div>').appendTo($.$appPanelContainer);
			this.$headerContextMenu = $headerContextMenu;
			this.$headerContextMsg = $headerContextMsg;
			var context = this;
			this.$tableHeader.on('mouseup.grid.api', '>div,td', function(e){
				if(e.button !== 2){
					return;
				}
				var pageX = e.pageX || e.screenX
					,pageY = e.pageY || e.screenY
		        	,pos = {left:pageX-1, top: pageY-1, 'z-index': Options.zindexs.droppanel++, display: 'block'}
				$headerContextMenu.css(pos);
				initContextMenu(context);
			});
			this.$headerContextMenu.on('mouseleave.grid-context-menu.api', function(e){
				var opacity = 10
				$headerContextMenu.hideTimer = setInterval(function(){
					opacity -= 1;
					$headerContextMenu.css('opacity', 0.1*opacity);
					if(opacity == 0){
						$headerContextMenu.hide();
						clearInterval($headerContextMenu.hideTimer);
					}
				}, 130);
			});
			this.$headerContextMenu.on('mouseenter.grid-context-menu.api', function(e){
				clearInterval($headerContextMenu.hideTimer);
				$headerContextMenu.css('opacity', 1);
			});
		}
	});
	/**
	 * 初始化网格列菜单
	 */
	function initContextMenu(context){
		if(!context._contextMenuZtree){
			var treeList = context.getColumnTree()
				,$ul = context.$headerContextMenu.find('>div>ul')
				,data = [];
			for(var i = 0 ; i < treeList.length; i++){
				pushCol(treeList[i], data);
			}
			$.fn.zTree.init($ul, getZtreeSetting(context), data);
			context._contextMenuZtree = $.fn.zTree.getZTreeObj($ul.attr('id'));
		}
	}
	/**
	 * 递归放入表格列
	 */
	function pushCol(col, list){
		if(col.sysCol){
			return;
		}
		if(!col.showTree){
			return;
		}
		var node = {}; 
		node.chkDisabled = col.lockTree;
		node.checked = !col.hidden;
		node.id = col._cid;
		if(col.parentColumn){
			node.parent = col.parentColumn._cid;
		}
		node.name = col.title;
		node.open = true;
		node.viewPos = col.viewPos;
		list.push(node);
		var children = col.children;
		if(children){
			for(var i = 0; i < children.length; i++){
				pushCol(children[i], list);
			}
		}
	}
	/**
	 * 获取树的设置参数
	 */
	function getZtreeSetting(context){
		var s = context.setting;
		var setting = {
			view: {
				selectedMulti: false,
				dblClickExpand: true,
				showLine: true,
				showIcon: false					
			},
			data:{
				key:{
					name: 'name'
				},
				simpleData: {
					enable: true,
					idKey: 'id',
					pIdKey: 'parent',
					rootPId: ''
				}
			},
			check: {
				enable: true
			},
			callback: {
				onClick: function(event, treeId, treeNode){
					context._contextMenuZtree.checkNode(treeNode, !treeNode.checked, true, true);
				},
				onCheck: function(event, treeId, treeNode){
					if(treeNode.checked){
						showColumn(treeNode.id, context);
					}else{
						hideColumn(treeNode.id, context);
					}
				},
				beforeCheck: function(treeId, treeNode){
					var level = treeNode.level
						,mainNodes = context._contextMenuZtree.getNodesByFilter(function(node){
							return node.level == level && node.viewPos == 'main' && node.checked;
						});
					if(treeNode.viewPos == 'main' && mainNodes.length == 1 && treeNode.checked){
						var rect = $('#' + treeNode.tId + '_a')[0].getBoundingClientRect();
						context.$headerContextMsg.css({left: rect.left+ rect.width, top:rect.top});
						context.$headerContextMsg.show();
						setTimeout(function(){
							context.$headerContextMsg.hide(500);
						}, 2000);
						return false;
					}else{
						return true;
					}
				}
			}
		};
		return setting;
	}
	/**
	 * 根据内部列id显示列
	 * @param cid
	 */
	function showColumn(cid, context){
		var column = context._column[cid];
		if(column.children){
			var children = column.children;
			for(var i = 0 ; i < children.length; i++){
				var child = children[i]; 
				if(child.children){
					showColumn(child._cid, context);
				}else{
					context.showColumn(child.field);
				}
			}
		}else{
			context.showColumn(column.field);
		}
	}
	/**
	 * 根据内部列id隐藏列
	 * @param cid
	 */
	function hideColumn(cid, context){
		var column = context._column[cid];
		if(column.children){
			var children = column.children;
			for(var i = 0 ; i < children.length; i++){
				var child = children[i]; 
				if(child.children){
					hideColumn(child._cid, context);
				}else{
					context.hideColumn(child.field);
				}
			}
		}else{
			context.hideColumn(column.field);
		}
	}
	return GridHeaderContextMenu;
});