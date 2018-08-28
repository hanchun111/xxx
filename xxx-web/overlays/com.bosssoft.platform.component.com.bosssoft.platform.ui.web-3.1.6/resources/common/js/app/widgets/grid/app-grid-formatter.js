/**
 * 格式化函数库
 * @author Mr.T
 */
define(['app/util/app-utils'], function(Utils) {
	/**
	 * 格式化管理器
	 */
	var FormatterManager = function(){
		this.formatterPool = {};
	};
	FormatterManager.prototype = {
		/**
		 * 添加格式化函数
		 * @param formatterCode 格式化函数编码
		 */
		add: function(formatterCode, formatterFunc, formatterName){
			if(this.formatterPool[formatterCode]){
				throw new Error('已经存在编码为[' + formatterCode + ']的格式化函数，请更换编码');
			}
			this.formatterPool[formatterCode] = {
				name: formatterName,
				func: formatterFunc
			};
		},
		/**
		 * 移除格式化函数
		 */
		remove: function(formatterCode){
			this.formatterPool[formatterCode];
		},
		/**
		 * 获取格式化方法
		 */
		get: function(formatterCode){
			var format = this.formatterPool[formatterCode];
			if(format && $.isFunction(format.func)){
				return format.func;
			}
			return null;
		},
		/**
		 * 格式化
		 */
		formatter: function(formatterCode, text, row, rowIndex, col){
			var func = this.get(formatterCode);
			if(func){
				text = func(text, row, rowIndex, col);
			}else{
				text = row[formatterCode];
			}
			return text;
		},
		/**
		 * 获取格式化名称的列表
		 */
		getNameList: function(){
			var list = []
				,pool = this.formatterPool;
			for(var code in pool){
				var name = pool[code].name;
				if(name){
					list.push({name:name,id:code});
				}
			}
			return list;
		}
	};
	var formatterManager = new FormatterManager();
	/**
	 * 千分数值
	 */
	formatterManager.add('thousandsFormatter', function(text, row, index){
		return $A.NumberFormat.format(text, '#,##0.00;;#');
	}, '千分格式化(0不显示)');
	/**
	 * 千分数值
	 */
	formatterManager.add('thousand', function(text, row, index){
		return $A.NumberFormat.format(text, '#,##0.00');
	}, '千分格式化');
	/**
	 * 整数千分数值
	 */
	formatterManager.add('###,###(0)', function(text, row, index){
		return $A.NumberFormat.format(text, '#,##0;;#');
	}, '###,###(0不显示)');
	formatterManager.add('yyyy-MM-dd', function(text, row, index){
		if(text){
			if(text.length == 8){
				return text.substr(0,4) + '-' + text.substr(4,2) + '-' + text.substr(6,2);
			}else{
				return text;
			}
		}else{
			return '';
		}
	}, 'yyyy-MM-dd');
	formatterManager.add('yyyy年MM月dd日', function(text, row, index){
		if(text){
			if(text.length == 8){
				return text.substr(0,4) + '年' + text.substr(4,2) + '月' + text.substr(6,2) + '日';
			}else{
				return text;
			}
		}else{
			return '';
		}
	}, 'yyyy年MM月dd日');
	formatterManager.add('oneYesZeroNo', function(text, row, index){
		if(text == '1'){
			return '是';
		}else{
			return '否';
		}
	}, '1是0否');
	formatterManager.add('numberFormatter', function(text, row, index, col){
		if(col.formatPattern){
			return $A.NumberFormat.format(text, col.formatPattern);
		}else{
			return text;
		}
	});
	return formatterManager;
});