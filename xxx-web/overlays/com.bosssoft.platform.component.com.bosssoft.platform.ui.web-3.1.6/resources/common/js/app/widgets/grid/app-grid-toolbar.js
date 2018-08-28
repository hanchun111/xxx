define(['app/core/app-class', 'app/core/app-core', 
        'app/widgets/button/app-menubutton'], function(Class, App) {

    'use strict';

    var GridToolbar = Class.create({
    	/**
		 * 初始化工具栏
		 */
		_initToolbar: function(){
			var btns = this.setting.toolbar;
			if(!btns || btns.length == 0){
				return;
			}
			var result = ''
				,$ul = this.$toolbar.find('>ul');
			for(var i = 0 ;i < btns.length; i++){
				var btn = btns[i]
					,$btn = null;
				if(!btn.id){
					btn.id = App.uuid();
				}
				if(btn.children && btn.children.length > 0){
					$btn = initMenuButtonHtml(btn);
				}else{
					$btn = initButtonHtml(btn);
				}
				$ul.append($('<li>').append($btn));
			}
		},
		/**
		 * 禁用工具条的按钮
		 * @param btnId {String} 按钮id
		 * @example $('#demo').grid('disableToolbarBtn', 'addBtn');
		 * @memberof grid-class
		 * @instance
		 */
		disableToolbarBtn: function(btnId){
			var $btn = this.$toolbar.find('#' + btnId);
			$btn.button('disable');
		},
		/**
		 * 启用工具条的按钮
		 * @param btnId {String} 按钮id
		 * @example $('#demo').grid('enableToolbarBtn', 'addBtn');
		 * @memberof grid-class
		 * @instance
		 */
		enableToolbarBtn: function(btnId){
			var $btn = this.$toolbar.find('#' + btnId);
			$btn.button('enable');
		}
    });
    /**
	 *生成菜单按钮
	 */
	function initMenuButtonHtml(btn){
		var $btn = $('<a id="' + btn.id + '" >' + btn.text + '</a>');
		btn.menuId = App.uuid();
		initMenu(btn);
		$btn.menubutton({
			iconCls: btn.iconCls,
			onClick: btn.handler,
			plain: false,
			menu: btn.menuId,
			menuStyle: btn.style ? btn.style : 'width:150px'
		});
		return $btn;
		function initMenu(btn){
			var children = btn.children
				,$menu = $('<div id="' + btn.menuId + '" style="' + btn.menuStyle + ';display:none;"></div>');
			for(var i = 0; i < children.length; i++){
				var child = children[i];
				if(child.menuSep){
					$menu.append('<div class="menu-sep"></div>');
				}else{
					initMenuItem(child);
				}
			}
			$.$appPanelContainer.append($menu);
			function initMenuItem(child){
				if(!child.id){
					child.id = App.uuid();
				}
				var $child = $('<div id="' + child.id 
					+ '" ' + getDataOptions(child) + '>' + child.text + '</div>');
				$menu.append($child);
				$child.on('click.grid.toolbar.api', function(e){
					if(child.handler){
						child.handler();
					}
				});
			}
			function getDataOptions(btn){
				var result = '';
				if(btn.iconCls){
					result += 'iconCls:\'' + btn.iconCls + '\'';
				}
				if(result){
					result = 'data-options="'+ result +'"';
				}
				return result;
			}
		}
	}
	/**
	 * 生成普通按钮
	 */
	function initButtonHtml(btn){
		var $btn = $('<a id="' + btn.id + '" >' + btn.text + '</a>');
		$btn.button({
			iconCls: btn.iconCls,
			onClick: btn.handler
		});
		return $btn;
	}
    return GridToolbar;
});