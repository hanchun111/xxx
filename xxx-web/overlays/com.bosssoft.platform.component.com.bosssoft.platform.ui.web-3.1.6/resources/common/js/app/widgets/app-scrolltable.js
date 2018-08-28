define([], function() {
	function ScrollTable($div,options){
		var DefaultSetting = {
			"scrollHeight":170,//滚动内容的高度
			"timer":1000*3,//每过10秒滚动一次
			"startRowIndex":0,//从第多少条记录开始滚动
			"columns":[]//数据列定义
		};
		
		this.$div = $div;
		this.data = [];
		this.loading = false;
		this.running = false;
		this.status = 0;//0
		
		if(!options){
			options = {};
		}
		this.setting = $.extend(DefaultSetting,options);
		this.pageIndex = 0;
		this.threadId = new Date().getTime();
		this._init();
	};
	
	ScrollTable.prototype._init = function(){
		this.$div.data("scrollTable",this);
		this.$div.data("scrollTable_threadId",this.threadId);
		this.$div.find(".scrollTable_body").height(this.setting.scrollHeight);
		this.$div.find(".scrollTable_body").hover(function(){
			$(this).addClass("pause");
		},function(){
			$(this).removeClass("pause");
		});
		this.$div.find(".scrollTable_header table tbody").append(this._createTitle());
	};
	
	ScrollTable.prototype.stop = function(){
		this.running = false;
	};
	
	ScrollTable.prototype.start = function(){
		this.running = true;
		var scrollTable = this;
		(function(){
			//检查元素是否还在
			var $scrollTable = $(".scrollTable").filter(function(){
				return $(this).data("scrollTable_threadId")==scrollTable.threadId;
			});
			if($scrollTable.length==0){
				return;
			}
			
			var $div = scrollTable.$div;
			var setting = scrollTable.setting;
			var running = scrollTable.running;
			var pause = scrollTable.$div.find(".scrollTable_body").hasClass("pause");
			
			if(!running){
				return;
			}
			if(scrollTable.loading){
				scrollTable.reset();
				scrollTable.loading = false;
			}
			if(!pause){
				var rowCount = $div.find(".scrollTable_scrollContent table tr").length;
//				var scrollHeight = setting.rowHeight*setting.scrollRowCount;
				//一共多少页
				var maxPage = (function(rowCount,pageRowCount){
					var tmp = rowCount%pageRowCount;
					var result = (rowCount-tmp)/pageRowCount;
					if(tmp>0){
						result ++;
					}
					return result;
				})(rowCount,setting.scrollRowCount);
				if(scrollTable.pageIndex>=maxPage){
					scrollTable.pageIndex = 0;
					$div.find(".scrollTable_scrollContent").css("top","0px");
				}else{
					if(maxPage>0){
						var $tr = $div.find(".scrollTable_scrollContent table tr:eq("+(scrollTable.pageIndex*setting.scrollRowCount)+")");
//						var scrollTop =scrollTable.pageIndex*scrollHeight;
						var scrollTop = $tr.position().top;
						$div.find(".scrollTable_scrollContent").animate({
							"top":"-"+scrollTop+"px"
						},500);
					}
				}
				scrollTable.pageIndex++;
			}
			setTimeout(arguments.callee, setting.timer);
		})();
	};
	
	ScrollTable.prototype.loadData = function(data){
		this.data = data;
		this.loading = true;
	};
	
	ScrollTable.prototype.reset = function(){
		this.pageIndex = 0;
		var $tbody = this.$div.find(".scrollTable_scrollContent table tbody");
		$tbody.empty();
		for(var i=0,n=this.data.length;i<n;i++){
			$tbody.append(this._createRow(this.data[i]));
		}
		this.$div.find(".scrollTable_scrollContent").css("top","0px");
	};
	
//	ScrollTable.prototype._createCell = function(){
//		var $td = $("<td><div></div></td>");
//		$td.find("div").text(value);
//		return $td;
//	};
	ScrollTable.prototype._createRow = function(rowData){
		var $tr = $("<tr></tr>");
		for(var i=0;i<this.setting.columns.length;i++){
			var $td = $("<td><div></div></td>");
			$td.css("width",this.setting.columns[i].width);
			if(rowData[this.setting.columns[i].name]){
				var format = this.setting.columns[i].format;
				if(!format){
					format = function(val,rowData){
						return val;
					};
				}
				var val = format(rowData[this.setting.columns[i].name],rowData);
				if(val===undefined || val===null){
					val = "";
				}
				if(this.setting.columns[i].style){
					$td.find(">div").attr("style",this.setting.columns[i].style);
				}
				$td.find("div").text(val);
			}
			$tr.append($td);
		}
		return $tr;
	};
	
	ScrollTable.prototype._createTitle = function(){
		var $tr = $("<tr></tr>");
		for(var i=0;i<this.setting.columns.length;i++){
			var $th = $("<th></th>");
			$th.text(this.setting.columns[i].title);
			$th.css("width",this.setting.columns[i].width);
			$tr.append($th);
		}
		return $tr;
	};
	

	$.fn.ScrollTable = function(option,value){
		var result = undefined;
		this.each(function () {
			var $this = $(this);
			var scrollTable = $this.data('scrollTable');
			
			var options = typeof option === 'object' && option;
			if(!scrollTable){
				scrollTable = new ScrollTable($this,options);
			}
			if (typeof option === 'string') {
				result = scrollTable[option](value);
			}
		});
		return result;
	};
	
	return ScrollTable;
});