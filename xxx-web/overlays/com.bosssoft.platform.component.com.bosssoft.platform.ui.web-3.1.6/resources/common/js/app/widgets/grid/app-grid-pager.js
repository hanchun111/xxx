define(['app/core/app-class'], function(Class) {

    'use strict';
    /**
     * 网格分页栏
     */
    var GridPager = Class.create({
    	/**
         * 初始化分页栏
         */
        _initPagination: function(){
            var s = this.setting;
            if(s.pager == 'none'){
                return;
            }
            var $p = this._initPagerElement();
            if(s.pager == 'all' || s.pager == 'up'){
            	if(!s.title && s.toolbar && s.toolbar.length > 0){
                    $p.appendTo(this.$toolbar);
            	}else{
            		$p.appendTo(this.$title);
            	}
            }
            if(s.pager == 'all' || s.pager == 'down'){
                $p.clone().appendTo(this.$element);
            }
            this.$pagers = this.$element.find('.grid-pager');
            this.$pagerUp = this.$element.find('.grid-header-title>.grid-pager');
            this.$pagerDown = this.$element.find('>.grid-pager');
            this.$switchView = this.$element.find('.grid-switchview');
            this._bindPagerEvents();
        },
        /**
         * 生成分页栏的html元素
         */
        _initPagerElement: function(){
            var s = this.setting;
            var to = s.pageNumber * s.pageSize
                ,from = to - s.pageSize + 1
                ,downloadIcon = ''
                ,printIcon = ''
                ,switchViewIco='';
            if(s.pagerToolbarIcon && s.pagerToolbarIcon.download){
                downloadIcon = '<td><span class="icon icon-download"></span></td>';
            }
            if(s.pagerToolbarIcon && s.pagerToolbarIcon.print){
                printIcon = '<td><span class="icon icon-print"></span></td>';
            }

            //开启切换视图 by sjq
            if (s.switchView){

                switchViewIco = '<td><span title="网格视图" class="icon icon-gridview grid-switchview"></span></td><td><span class="icon icon-cardview grid-switchview"  title="卡片视图"></span></td>';

            }

            return $('<div class="grid-pager">'+
                '<div class="pager-infos"> <label>' + from + '</label> - <label>' + to
                + '</label>　共 <label>0</label> 条</div>' +
                '<table class="pager-tool" cellspacing="0" cellpadding="0">' +
                '<tbody>' +
                '<tr>' +
                '<td>' +
                '<span class="icon icon-seek-first"></span>' +
                '</td>' +
                '<td>' +
                '<span class="icon icon-seek-prev"></span>' +
                '</td>' +
                '<td style="width: 4px;">' +
                '<span class="separator"></span>' +
                '</td>' +
                '<td>' +
                '<input tabindex="-1" class="currPage" value="' + s.pageNumber
                + '"/>共<label class="totalPages">1</label>页' +
                '</td>' +
                '<td style="width: 4px;">' +
                '<span class="separator"></span>' +
                '</td>' +
                '<td>' +
                '<span class="icon icon-seek-next"></span>' +
                '</td>' +
                '<td>' +
                '<span class="icon icon-seek-end"></span>' +
                '</td>' +
                '<td>' +
                '<span class="icon icon-refresh"></span>' +
                '</td>' +
                downloadIcon + printIcon +switchViewIco+
                '<td>' + this._getPageSizeSltHtml() + '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '</div>');
        },
        /**
         * 获取当前分页数
         */
        getCurrentPageSize: function(){
            var result = this.$pagers.find('.pager-pagesize input').val();
            if(result){
                return Number(result);
            }else{
                return -1;
            }
        },
        /**
         * 获取分页的下拉框html
         */
        _getPageSizeSltHtml: function(){
        	inCludePageSize.call(this);
            var s = this.setting
                ,pageSizeSlt = '<div class="pager-pagesize"><select tabindex="-1" class="currPageSize">';
            for(var i = 0; i < s.pageList.length; i++){
                var val = s.pageList[i];
                pageSizeSlt += '<option value="' + val + '"'
                    + (s.pageSize == val ? 'selected="selected"' : '') + '>' + val + '</option>';
            }
            pageSizeSlt += '</select><input value="' + s.pageSize + '"/></div>';
            return pageSizeSlt;
            function inCludePageSize(){
            	var pageList = this.setting.pageList
            		,pageSize = this.setting.pageSize
            		,index = 0;
            	for(var i = 0; i < pageList.length; i++){
            		var size = pageList[i];
            		if(size == pageSize){
            			return;
            		}
            		if(pageSize > size){
            			index = i;
            		}
            	}
            	if(index >= 0){
            		this.setting.pageList.splice(index, 0, pageSize);
            	}
            }
        },
        /**
         * 对分页控件绑定事件
         */
        _bindPagerEvents: function(){
            var grid = this
                ,$ps = this.$pagers
                ,$currPage = $ps.find('.currPage')
                ,$total = $ps.find('.totalPages');
            $ps.find('.currPageSize').on('change.grid.pagination.api', function(){
            	var currPageSize = $(this).val();
                $ps.find('.currPageSize').val(currPageSize);
                $ps.find('.pager-pagesize input').val(currPageSize);
                grid.loadForPage(1);
            }).on('click.grid.pagination.api', function(e){
                e.stopPropagation();
            });
            $ps.find('.icon-seek-first').on('click.grid.pagination.api', function(){
                grid.loadForPage(1);
            });
            $ps.find('.icon-seek-prev').on('click.grid.pagination.api', $.proxy(this.prevPage, this));
            $currPage.on('focus.grid.pagination.api', function(e){
                var $this = $(this);
                $this.data('oriText', $this.val());
                $this.one('blur.grid.pagination.api', function(e){
                    var $this = $(this);
                    $this.val($this.data('oriText'));
                });
            }).on('keydown.grid.pagination.api', function(e){
                var keyCode = e.keyCode;
                if ((keyCode >= 48 && keyCode <= 57) || keyCode == 8
                    || keyCode == 46) {
                    return true;
                }
                if(keyCode == 13){
                    var $this = $(this)
                        ,curr = parseInt($this.val())
                        ,allPage = parseInt($total.html());
                    if(!isNaN(curr) &&
                        curr >= 1 && curr <= allPage){
                    	$this.data('oriText', curr);
                        grid.loadForPage(curr);
                    }
                    if(grid._combogrid){
                        grid._combogrid.focus();
                    }
                }
            }).on('click.grid.pagination.api', function(e){
                e.stopPropagation();
            });
            $ps.find('.icon-seek-next').on('click.grid.pagination.api', $.proxy(this.nextPage, this));
            $ps.find('.icon-seek-end').on('click.grid.pagination.api', function(){
                var totalPage = $total.html();
                if(totalPage == '0'){
                    totalPage = 1;
                }
                grid.loadForPage(totalPage);
            });
            $ps.find('.icon-refresh').on('click.grid.pagination.api', function(){
                grid.reload();
            });
            $ps.find('.icon-download').on('click.grid.pagination.api', function(){
                grid.exportExcel();
            });
            $ps.find('.icon-print').on('click.grid.pagination.api', function(){
                grid.print();
            });

            $ps.find('.pager-pagesize input').on('focus.grid.pagination.api', function(){
            	var $this = $(this);
                $this.data('oriText', $this.val());
                $this.one('blur.grid.pagination.api', function(e){
                    var $this = $(this);
                    $this.val($this.data('oriText'));
                });
            }).on('keydown.grid.pagination.api', function(e){
                var keyCode = e.keyCode;
                if ((keyCode >= 48 && keyCode <= 57) || keyCode == 8
                    || keyCode == 46) {
                    return true;
                }
                var $this = $(this);
                if(keyCode == 13){
                	var val = $this.val()
                		,pageSize = parseInt(val, 10);
                    if(!isNaN(pageSize)){
	            		var pageSize = parseInt(val, 10)
	            			,maxPageSize = getMaxPageSize();
	            		if(pageSize > maxPageSize){
	            			pageSize = maxPageSize;
	            		}
	            		$ps.find('.pager-pagesize input').val(pageSize);
	            		$ps.find('.pager-pagesize input').data('oriText', pageSize);
	            		$ps.find('.currPageSize').val(pageSize);
	            		grid.loadForPage(1);
	            	}
                }
                function getMaxPageSize(){
            		var list = grid.setting.pageList
            			,max = 0;
            		for(var i =0 ; i < list.length; i++){
            			if(list[i] > max){
            				max = list[i];
            			}
            		}
            		return max;
            	}
            });
            this.$switchView.on("click.grid.pagination.api",function(){
                var $this=$(this);
                if ($this.hasClass("icon-gridview")){
                    grid.viewType='GridView'
                }
                if ($this.hasClass("icon-cardview")){

                    grid.viewType='CardView'
                }
                grid._switchView(grid.viewType,true)
            })
        },
        /**
         * 上一页
         * @example $('#demo').grid('prevPage');
         * @memberof grid-class
         * @instance
         */
        prevPage: function(){
            if(!(this.$pagers && this.$pagers.length > 0)){
                return;
            }
            var $currPage = this.$pagers.find('.currPage')
                ,$total = this.$pagers.find('.totalPages')
                ,prev = 1
                ,curr = parseInt($currPage.val());
            if(curr == 1){
                prev = parseInt($total.html());
            }else{
                prev = curr - 1;
            }
            if(prev == 0){
                prev = 1;
            }
            this.loadForPage(prev);
        },
        /**
         * 下一页
         * @example $('#demo').grid('nextPage');
         * @memberof grid-class
         * @instance
         */
        nextPage: function(){
            if(!(this.$pagers && this.$pagers.length > 0)){
                return;
            }
            var $currPage = this.$pagers.find('.currPage')
                ,$total = this.$pagers.find('.totalPages')
                ,next = 1
                ,curr = parseInt($currPage.val())
                ,allPage = parseInt($total.html());
            if(curr == allPage){
                next = 1;
            }else{
                next = curr + 1;
            }
            if(allPage == 0){
                next = 1;
            }
            this.loadForPage(next);
        },
        /**
         * 载入传入页码的载入数据
         * @param {Number} page 页码
         * @example $('#demo').grid('loadForPage',1);
         * @memberof grid-class
         * @instance
         */
        loadForPage: function(page){
            if(isNaN(page)){
                return;
            }
            var grid = this
                ,footer = keepFooter();

            this._ajax(function(data) {
                grid._loadPagers(page, data[grid.setting.jsonReader.total]);
                grid._loadData(data, grid._getStarRowNumber());
                appendKeepFooter(footer);

            }, {page: page});
            /**
             * 保留上次表格尾
             */
            function keepFooter(){
                if(page > 1){
                    return grid.getFooterRows();
                }
            }
            /**
             * 输出表格尾
             */
            function appendKeepFooter(footer){
                if(grid.setting.keepFooter){
                    grid.appendFooter(footer);
                }
            }
        },
        /**
         * 载入分页信息，当total为空时，不进行更新总行数
         * @param curr 当前页索引
         * @param total 一共几行
         */
        _loadPagers: function(curr, total){
            if(!this.$pagers || this.$pagers.length == 0){
                return;
            }
            var $ps = this.$pagers;
            $ps.find('.currPage').val(curr);
            if(!$ps){
                return;
            }
            var currPageSize = parseInt($ps.find('.pager-pagesize input').val())
                ,to = curr * currPageSize
                ,from = this._rownumbers = to - currPageSize + 1
                ,$from = $ps.find('.pager-infos>label:first');
            $from.html(from);
            $from.next().html(to);

            if(total == undefined){
                return;
            }
            var pages = Math.ceil(total / currPageSize);
            $ps.find('.pager-tool .totalPages').html(pages);
            $from.next().next().html($A.utils.formatNumber(total,0));
            if(this.setting.rownumbers == 'repeat'){
                this._rownumbers = 1;
            }
        },
        /**
         * 获取当前分页信息
         * @returns {Object} result 数据对象
         * @returns {Integer} result.page 当前页码
         * @returns {Integer} result.rows 每页行数
         * @example $('#demo').grid('getCurrentPager');
         * @memberof grid-class
         * @instance
         */
        getCurrentPager: function(){
            if(this.$pagers && this.$pagers.length > 0){
                var result = {};
                result.page = parseInt(this.$pagers.find('.currPage').val());
                result.rows = parseInt(this.$pagers.find('.pager-pagesize input').val());
                return result;
            }
            return null;
        },
        _pagerAddRow: function(){
        	if(this.$pagers){
                var $total = this.$pagers.find('.pager-infos label:last')
                    ,total = $total.text();
                total = parseInt(total.replaceAll(',','')) + 1;
                $total.text($A.utils.formatNumber(total,0));
            }
        },
        _pagerDeleteRow: function(){
        	if(this.$pagers){
				var $total = this.$pagers.find('.pager-infos label:last')
					,total = $total.text();
				total = parseInt(total.replaceAll(',','')) - 1;
				$total.text($A.utils.formatNumber(total,0));
			}
        },
     	hidePager: function(){
            this.$pagers.hide();
            this.resize();
        },
        showPager: function(){
            this.$pagers.show();
            this.resize();
        },
        _hasPager: function(){
        	return this.$pagers && this.$pagers.length > 0;
        },
        _setPagerDownCss: function(css){
        	if(this.$pagerDown){
                this.$pagerDown.css(css);
            }
        },
        _getPagerDownHeight: function(){
        	return this.$pagerDown && this.$pagerDown.is(':visible') ? this.$pagerDown.outerHeight():0;
        },
         /**
         * 获取当前页码
         * @returns {Integer} result 当前页码
         * @example $('#demo').grid('getPageIndex');
         * @memberof grid-class
         * @instance
         */
        getPageIndex: function(){
        	if(this.$pagers && this.$pagers.length > 0){
	        	return this.$pagers.find('.currPage').val();
        	}
        	return -1;
        },
        /**
         * 获取当前页面的起始行号
         */
        _getStarRowNumber: function(){
            var starNum = 1;
            if(this.setting.rownumbers != 'repeat' && this.$pagers && this.$pagers.length > 0){
                starNum = parseInt(this.$pagers.find('.pager-infos>label:first').html());
            }
            return starNum;
        },
        _hasTitlePager: function(){
        	return this.$title.find('.grid-pager').length > 0;
        }
    });
    return GridPager;
});