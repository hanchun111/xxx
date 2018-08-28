define(['app/core/app-class'], function(Class) {
	
	'use strict';
	
	/**
	 * 网格行合并
	 */
	var GridSummary = Class.create({
		 /**
         * 按列自动合并相同值单元格
         * @param {String|Array<String>} fields 合并列字段
         * @example $('#grid').grid('mergeColumns', 'type');
         * @example $('#grid').grid('mergeColumns', ['type', 'subType']);
         * @memberof grid-class
         * @instance
         */
        mergeColumns: function(fields){
            if($.isArray(fields)){
            	if(this.setting.mergeGroup){
            		mergeColumns.call(this, fields);
            	}else{
            		for(var i = 0; i < fields.length; i++){
            			mergeColumn.call(this, fields[i]);
            		}
            	}
            }else{
                mergeColumn.call(this, fields);
            }
        }
	});
	function mergeColumns(fields){
		var $firstTds = null
			,$prevTds = null
			,spanNum = 1
			,fieldsLen = fields.length
			,$fieldTds = getFieldTds.call(this, fields);
		for(var i = 0; i < $fieldTds[0].length; i++){
			var $tds = getTrTds($fieldTds, i);
			if(i == 0){
				$firstTds = $tds;
				spanNum = 1;
			}else{
				 if(whetherMerge($prevTds, $tds)){
                    spanNum++;
                    merge($firstTds, $tds, spanNum);
                }else{
                    $firstTds = $tds;
                    spanNum = 1;
                }
			}
			$prevTds = $tds;
		}
		function getFieldTds(fields){
			var result = [];
			for(var i = 0; i < fieldsLen; i++){
				result.push(this.$tableBody.find('td[field="' + fields[i] + '"]'))
			}
			return result;
		}
		function getTrTds($fieldTds, index){
			var result = [];
			for(var i = 0; i < fieldsLen; i++){
				result.push($($fieldTds[i][index]));
			}
			return result;
		}
		function whetherMerge($prevTds, $tds){
			for(var i = 0; i < $tds.length; i++){
				var $td = $tds[i]
					,$prevTd = $prevTds[i]
					,text = $td.text(); 
				if($prevTd.text() != text){
					return false;
				}
			}
			return true;
		}
		function merge($firstTds, $tds, spanNum){
			for(var i = 0; i < $tds.length; i++){
				 $tds[i].addClass('grid-cell-merger');
                 $firstTds[i].attr('rowSpan',spanNum);
			}
		}
	}
    /**
     * 合并列中相同值的单元格
     */
    function mergeColumn(filed){
        var $firstTd = null
            ,$prevTd = null
            ,spanNum = 1
            ,$fieldTd = this.$tableBody.find('td[field="' + filed + '"]');
        for(var i = 0; i < $fieldTd.length; i++){
            var $td = $($fieldTd[i]);
            if(i==0){
                $firstTd = $td;
                spanNum = 1;
            }else{
                if(whetherMerge($prevTd, $td)){
                    spanNum++;
                    $td.addClass('grid-cell-merger');
                    $firstTd.attr('rowSpan',spanNum);
                }else{
                    $firstTd = $td;
                    spanNum = 1;
                }
            }
            $prevTd = $td;
        }
        /**
         * 是否为内容相同且紧邻的单元格
         * @param $tdA
         * @param $tdB
         */
        function whetherMerge($tdA, $tdB){
            var text = $tdA.text();
            if(text != '' && text == $tdB.text()){
               return true;
            }
            return false;
        }
    };
	return GridSummary;
});