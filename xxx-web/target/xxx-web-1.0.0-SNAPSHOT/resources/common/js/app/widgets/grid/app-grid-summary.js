define(['app/core/app-class', 'app/core/app-jquery', 'app/core/app-core', 
	'app/data/app-ajax'], function(Class, $, App, AppAjax) {
	
	'use strict';
	
	/**
	 * 网格数据本地小计
	 */
	var GridSummary = Class.create({
		/**
         * 输出合计行
         */
        _appendSummary: function(){
           this._appendDefinedSummary();
           this._appendCustomSummary();
           this._applySummaryMerger();
        },
        /**
         * 输出预定义合计行
         */
        _appendDefinedSummary: function(){
            if(this._sumCols.length == 0){
                return;
            }
            var rows = this.getRows();
            this.summaryRow = this._summary(rows);
            if(this.summaryRow){
                this._appendFooter([this.summaryRow]);
            }
        },
        /**
         * 输出自定义合计栏
         */
        _appendCustomSummary: function(){
            var s = this.setting;
            if(!s.summary){
                return;
            }
            if(!s.summary._template){
                return;
            }
            var summaryData = null;
            if(s.summary.method){
                summaryData = s.summary.method(this.getData());
            }else{
                summaryData = this.getData();
            }
            var temp = s.summary._template
                ,html = temp.apply(summaryData);
            this.$tableFooterCustom.append(html);
            this.$tableFooter.css('display', 'block');
            this._fixHeight();
            this._footerFollow();
        },
        /**
         * 计算合计值
         */
        _summary: function(rows){
            var cols = this._sumCols;
            if(cols.length == 0){
            	return null;
            }
            var result = {};
            if(rows.length > 0){
                for(var i = 0; i < rows.length; i++){
                    for(var j = 0; j < cols.length; j++){
                        summaryColumn(result, cols[j], rows[i]);
                    }
                }
            }else{
                for(var j = 0 ; j < cols.length; j++){
                    var col = cols[j],
                        colSumOpt = col.summary;
                    if(!colSumOpt){
                        continue;
                    }
                    if(colSumOpt.text){
                        result[col.field] = colSumOpt.text;
                    }else{
                        result[col.field] = 0;
                    }
                }
            }
            return result;
        },
        _applySummaryMerger: function(){
        	var info = this.setting.summaryMerger;
        	if(!info){
        		return;
        	}
        	if(this.$tableFooter.find('tr').length == 0){
        		return;
        	}
        	applyMerge.call(this, info);
        }
	});
	return GridSummary;
	
	/**
     * 合计值计算
     * @param col
     * @param row
     */
    function summaryColumn(summaryRow, col, row){
        if(!col.summary){
            return;
        }
        var val = row[col.field];
        if(!val){
            val = 0;
        }
        summaryTheValue(summaryRow, col.summary, col.field, parseFloat(val));
    }
    /**
     * 累加合计值
     * @param summary 汇总对象
     * @param type 汇总类型
     * @param field 汇总的字段
     * @param val 被汇总的值
     */
    function summaryTheValue(summaryRow, summaryOpt, field, val){
        if(summaryOpt.text){
            summaryRow[field] = summaryOpt.text;
            return;
        }
        if(!val){
            val = 0;
        }
        switch(summaryOpt.type) {
            case 'sum' :
                if(summaryRow[field] == undefined){
                    summaryRow[field] = val;
                }else{
                    summaryRow[field] = sum(summaryRow[field], val);
                }
                break;
            case 'avg' :
                if(summaryRow[field] == undefined){
                    summaryRow['__'+field] = val;
                    summaryRow['__count'+field] = 1;
                }else{
                    summaryRow['__'+field] = sum(summaryRow['__'+field], val);
                    summaryRow['__count'+field]++;
                }
                summaryRow[field] = summaryRow['__'+field]/summaryRow['__count'+field];
                break;
            case 'min' :
                if(summaryRow[field] == undefined){
                    summaryRow[field] = val;
                }else if(val < summaryRow[field]){
                    summaryRow[field] = val;
                }
                break;
            case 'max' :
                if(summaryRow[field] == undefined){
                    summaryRow[field] = val;
                }else if(val > summaryRow[field]){
                    summaryRow[field] = val;
                }
                break;
            case 'count' :
                if(summaryRow[field] == undefined){
                    summaryRow[field] = 1;
                }else{
                    summaryRow[field]++;
                }
                break;
            default:
        }
    }
    /**
     * 解决js浮点数运算不精确的问题
     * 原理 放大倍数为整数后 得出结果在相除
     */
	function sum(arg1,arg2){
		var r1,r2,m;
		try{r1 = arg1.toString().split(".")[1].length}catch(e){r1 = 0}
 		try{r2 = arg2.toString().split(".")[1].length}catch(e){r2 = 0}
 		m = Math.pow(10, Math.max(r1, r2));
 		return ( Math.round(arg1*m) + Math.round(arg2*m) ) / m;
	}
	
	function applyMerge(info){
		var beginField = info.beginField
			,endField = info.endField;
		var beginCol = this._fieldColumns[beginField]
			,endCol = this._fieldColumns[endField];
		if(!beginCol || !endCol){
			return;
		}
		if(beginCol.viewPos != endCol.viewPos){
			$a.messager.warn('要合并的列跨区，无法合并');
			return;
		}
		var $beginCell = this.$tableFooter.find('td[field=' + beginField + ']:eq(0)')
			,$endCell = this.$tableFooter.find('td[field=' + endField + ']:eq(0)');
		var beginIndex = $beginCell.index()
			,endIndex = $endCell.index();
		var $mergeCell = null
			,colspan = 0;
		if(beginIndex < endIndex){
			$mergeCell = $beginCell;
			colspan = endIndex - beginIndex + 1;
		}else{
			$mergeCell = $endCell;
			colspan = beginIndex - endIndex + 1;
		}
		mergeCell.call(this, $mergeCell, colspan);
		if(info.text){
			$mergeCell.find('div').text(info.text);
		}
		if(info.align){
			$mergeCell.find('div').css('text-align', info.align);
		}
		this._currSummaryMerger = $.extend({}, this.setting.summaryMerger);
		function mergeCell($cell, colspan){
			var width = getColspanWidth.call(this, $cell, colspan);
			var $cur = $cell;
			for(var i = 1; i < colspan; i++){
				$cur = $cur.next();
				$cur.hide();
			}
			$cell.attr('colspan', colspan);
			$cell.find('div').css('width',width);
		}
		function getColspanWidth($cell, colspan){
			var $cur = $cell
				,fieldColumns = this._fieldColumns;
			var width = fieldColumns[$cur.attr('field')].width;
			for(var i = 1; i < colspan; i++){
				$cur = $cur.next();
				width += fieldColumns[$cur.attr('field')].width + 1;
			}
			return width;
		}
	}
});