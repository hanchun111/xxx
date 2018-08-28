define(['app/core/app-class', 'app/core/app-jquery', 'app/core/app-core', 
	'app/data/app-ajax'], function(Class, $, App, AppAjax) {
	
	'use strict';
	
	/**
	 * 网格排序
	 */
	var GridSort = Class.create({
		/**
		 * 根据列的排序信息初始化排序功能
		 * @param col
		 * @param $col
		 */
		 _appendSortable: function(col, $col){
		 	if(!col.sortable || (col.colspan > 1)){
		 		return;
		 	}
		 	var $sort = $('<span class="grid-header-sort"></span>')
				,that = this;
			$sort.appendTo($col.find('>div'));
			$col.css('cursor','pointer');
			$col.on('click.grid.api', function(){
				var $this = $(this)
					,cid = $this.attr('_cid')
					,col = that._column[cid]
					,order = ''
					,nextOrder = '';
				if($this.hasClass('asc')){
					order = 'asc';
					nextOrder = 'desc';
				}else if($this.hasClass('desc')){
					order = 'desc';
					nextOrder = '';
				}else{
					order = '';
					nextOrder = 'asc';
				}
				/**
				 * 排序前事件
				 * <PRE>
				 * 	order: asc 升序， desc降序, 空-不排序
				 * </PRE>
				 * @event grid-class#beforeSortColumn
				 * @param {String} field 字段
				 * @param {String} order 方向
				 * @returns {Boolean} 返回false 取消排序
				 */
				if(that.trigger('beforeSortColumn', col.field, nextOrder) === false){
					return;
				}
				nextOrder = doSort.call(that, col, nextOrder);
				$this.removeClass(order);
				$this.addClass(nextOrder);
			});
		},
		/**
		 * 初始化排序信息
		 */
		_initSort: function(){
			initSort.call(this);
			var data = this.setting.data;
			if(this._sort.length > 0 && data){
				var rows = null;
				if($.isArray(data)){
					rows = data;
				}else{
					rows = data[this.setting.jsonReader.rows];
				}
				sortData.call(this, rows);
			}
		},
		/**
		 * 获取当前排序方式
		 * @returns {Array<Object>} result 设置查询参数
		 * @returns {String} result.field 字段
		 * @returns {String} result.order 方向
		 * @example $('#demo').grid('getCurrentSort');
		 * @memberof grid-class
		 * @instance
		 */
		getCurrentSort: function(){
			var orders = this._sort
				,result = [];
			if(orders.length == 0){
				return result;
			}
			for(var i = 0; i < orders.length; i++){
				if(orders[i].order){
					result.push({field: orders[i].col.field, order: orders[i].order});
				}
			}
			return result;
		},
		/**
		 * 如果当前表格存在排序设置 则根据排序设置进行数据排序
		 */
		_sortData: function(){
			if(this.setting.remoteSort){
				return;
			}
			var rows = this.getRows();
			if(!rows || rows.length == 0){
				return;
			}
			delete this._oriRows;
			if(this._sort.length > 0){
				sortData.call(this, rows);
			}
		}
	});
	/**
	 * 初始化排序信息
	 */
	function initSort(){
		var sort = this.setting.sort;			
		if($.isArray(sort)){
			var _sort = []
				,that = this;
			$(sort).each(function(){
				var col = that._fieldColumns[this.field]
					,$col = that.$tableHeader.find('[_cid=' + col._cid + ']');
				if($col.length == 1){
					_sort.push({col: col, order: this.order});
					$col.addClass(this.order);
				}
			});
			this._sort = _sort;
		}else{
			this._sort = [];
		}
	}
	/**
	 * 根据传入的列和排序方式进行排序
	 * @param col 要排序的列
	 * @param order 排序方式
	 */
	function doSort(col, order){
		order = setSort.call(this, col, order);
		if(this.setting.remoteSort){
			doRemoteSort.call(this);
		}else{
			doLocalSort.call(this);
		}
		return order;
	}
	/**
	 * 设置当前排序参数
	 */
	function setSort(col, order){
		var orders = this._sort;
		if(orders.length == 1 && order == ''){
			order = 'asc';
		}
		if(this.setting.multiSort){
			var append = true;
			for ( var i = 0; i < orders.length; i++) {
				if(orders[i].col == col){
					orders.splice(i, 1);
					if(order){
						orders.push({col:col, order:order});
					}
					append = false;
					break;
				}
			}
			if(append){
				orders.push({col:col, order:order});
			}
		}else{
			this._sort = [{col:col, order:order}];
			this.$tableHeader.find('td.asc').removeClass('asc');
			this.$tableHeader.find('td.desc').removeClass('desc');
		}
		return order;
	}
	/**
	 * 远程排序
	 */
	function doRemoteSort(){
		var that = this;
		this._ajax(function(data){
			that._loadPagers(1, data[that.setting.jsonReader.total]);
			that._loadData(data, 1);
			/**
			 * 排序完成事件
			 * @event grid-class#onSortColumn
			 */
			that.trigger('onSortColumn');
		});
	}
	/**
	 * 本地排序
	 */
	function doLocalSort(){
		if(this._sort.length > 0){
			sortData.call(this, this.getRows());
		}else{
			this._setRows(this._oriRows.slice(0));
		}
		this._rownumbers = this._rownumbers - this.getRows().length;
        this._loadBody(this.getRows(), this._rownumbers);
        if(this.$yProxyScroll){
	        this.$yProxyScroll.scrollTop(0);
        }
        this._checkSummary();
		this.trigger('onSortColumn');
	}
	/**
	 * 将数据进行排序 并缓存原数据
	 */
	function sortData(rows){
		if(!this._oriRows){
			this._oriRows = rows.slice(0);
		}
		rows.sort($.proxy(sortBySetting, this));
	}
	function sortBySetting(a, b){
		return getComparator.call(this, a, b, this._sort, 0);
		function getComparator(a, b, orders, i){
			var t = orders[i];
			if(!t){
				return 0;
			}
			var col = t.col
				,order = t.order
				,val = 0;
				i++;
			if(col){
				if($.isFunction(col.sorter)){
					val= col.sorter(a, b);
				}else{
					var field = col.field;
					var x = a[field]
						,y = b[field];
					if(!isNaN(x) && !isNaN(y)){
						x = parseFloat(x);
						y = parseFloat(y);
					}
					if(col.printType && col.printType.indexOf('Number') >= 0){
						if(isNaN(x)&&isNaN(y)){
							return 0;
						}
						if(isNaN(x)){
							return -1;
						}
						if(isNaN(y)){
							return 1;
						}
					}
					if(x > y){
						val = 1;
					}else if(x == y){
						val = 0;
					}else{
						val = -1;
					}
				}
				if(order == 'desc'){
					val = -val;
				}
				if(val == 0){
					return getComparator.call(this, a, b, orders, i);
				}else{
					return val;
				}
			}
			return val;
		}
	}
	return GridSort;
});