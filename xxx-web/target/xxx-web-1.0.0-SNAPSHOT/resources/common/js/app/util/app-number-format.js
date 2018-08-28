define([], function(){
	/**
	 * @class
	 * @classdesc 数字工具类
	 * @name NumberFormat-class
	 * @desc 提供数字的格式化方法
	 */
	var NumberFormat = {};
	/**
	 * 格式化数值
	 * @param num 数值
	 * @param pattern 格式化串
	 * <PRE>
	 * 1、格式化串以;;#结束 则说明0不显示
	 * 2、如果格式化串数字部分以%结束 则说明进行百分比显示 
	 * <PRE>
	 * @returns {String}
	 * @example $A.NumberFormat.format(1234, '#,###.##');->1,234
	 * @example $A.NumberFormat.format(1234, '#,###.00');->1,234.00
	 * @example $A.NumberFormat.format(0, '#,###.00');->0.00
	 * @example $A.NumberFormat.format(0, '#,###.00;;#');->
	 * @example $A.NumberFormat.format('', '#,###.00;;#');->
	 * @example $A.NumberFormat.format(null, '#,###.00;;#');->
	 * @example $A.NumberFormat.format(14, '#,###.00%');->1,400.00%
	 * @memberof NumberFormat-class
	 * @instance
	 */
	NumberFormat.format = function(num, pattern) {
		if(num == undefined){
			return '';
		}
		var result = '';
		if(pattern.indexOf(';;#') == pattern.length-3){
			if(num == 0){
				return '';
			}
			pattern = pattern.substr(0, pattern.length-3);
		}
		var hasPercent = pattern.indexOf('%') == pattern.length - 1; 
		if(hasPercent){
			num = num*100;
			pattern = pattern.substr(0, pattern.length-1);
		}
		var strarr = num ? num.toString().split('.') : [ '0' ]
			,fmtarr = pattern ? pattern.split('.') : [ '' ]
			,intStr = formatInteger(strarr, fmtarr)
			,decimalStr = formatDecimal(strarr, fmtarr)
			,result = '';
		if(decimalStr){
			result = intStr + '.' + decimalStr;
		}else{
			result = intStr;
		}
		if(hasPercent){
			result += '%';
		}
		return result;
		function formatInteger(strarr, fmtarr){
			var result = ''
				,str = strarr[0]
				,fmt = fmtarr[0]
				,i = str.length - 1
				,comma = false;
			for (var f = fmt.length - 1; f >= 0; f--) {
				switch (fmt.substr(f, 1)) {
				case '#':
					if (i >= 0)
						result = str.substr(i--, 1) + result;
					break;
				case '0':
					if (i >= 0)
						result = str.substr(i--, 1) + result;
					else
						result = '0' + result;
					break;
				case ',':
					comma = true;
					result = ',' + result;
					break;
				}
			}
			if (i >= 0) {
				if (comma) {
					var l = str.length;
					for (; i >= 0; i--) {
						result = str.substr(i, 1) + result;
						if (i > 0 && ((l - i) % 3) == 0)
							result = ',' + result;
					}
				} else
					result = str.substr(0, i + 1) + result;
			}
			return result.replace(/^,+/,'').replace(/^(-,)/,'-');
		}
		function formatDecimal(strarr, fmtarr){
			var str = strarr.length > 1 ? strarr[1] : ''
				,fmt = fmtarr.length > 1 ? fmtarr[1] : ''
				,i = 0
				,result = '';
			for (var f = 0; f < fmt.length; f++) {
				switch (fmt.substr(f, 1)) {
				case '#':
					if (i < str.length)
						result += str.substr(i++, 1);
					break;
				case '0':
					if (i < str.length)
						result += str.substr(i++, 1);
					else
						result += '0';
					break;
				}
			}
			return result;
		}
	};
	/**
	 * 三位一个逗号隔开的展现，保留s为小数
	 * @param num 数值
	 * @param precision 保留小数位
	 * @param ixMax 是否按原数值的最大小数位
	 * @returns {String}
	 */
	NumberFormat.toThousands = function(num, precision, isMax){
		var pattern = '#,##0';
		if(precision > 0){
			var decimalPattern = '';
			for(var i = 0; i < precision; i++){
				if(isMax){
					decimalPattern += '#';
				}else{
					decimalPattern += '0';
				}
			}
			pattern += '.' + decimalPattern;
		}
		return NumberFormat.format(num, pattern);
	};
	/**
	 * 转换为大写金额
	 * @param num 数值
	 * @returns {String}
	 */
	NumberFormat.toChinese = function(num){
		if (isNaN(num))
			return '';
		if(num > Math.pow(10, 12)){
			return '还未处理这么大的值';
		}
		var cn = '零壹贰叁肆伍陆柒捌玖'
			,unit = new Array('拾佰仟', '分角')
			,unit1 = new Array('万亿', '')
			,numArray = num.toString().split('.')
			,start = new Array(numArray[0].length - 1, 2);
		for ( var i = 0; i < numArray.length; i++) {
			var tmp = '';
			for ( var j = 0; j * 4 < numArray[i].length; j++) {
				var strIndex = numArray[i].length - (j + 1) * 4
					,str = numArray[i].substring(strIndex, strIndex + 4)
					,start = i ? 2 : str.length - 1
					,tmp1 = getChinese(str, i);
				tmp1 = tmp1.replace(/(零.)+/g, '零').replace(/零+$/,'');
				tmp = (tmp1 + (tmp1 ? unit1[i].charAt(j - 1) : '')) + tmp;
			}
			numArray[i] = tmp;
		}
		numArray[1] = numArray[1] ? numArray[1] : '';
		numArray[0] = numArray[0] ? numArray[0] + '元' : numArray[0];
		numArray[1] = numArray[1].match(/分/) ? numArray[1] : numArray[1] + '整';
		return numArray[0] + numArray[1];
		/**
		 * 转换为大写
		 * @param num 数字
		 * @param 数字所在索引
		 * @returns {String} 大写值
		 */
		function getChinese(num, index) {
			num = num.replace(/\d/g, function($1) {
				return cn.charAt($1)+ unit[index].charAt(start-- % 4 ? start % 4: -1);
			});
			return num;
		}
	};
	return NumberFormat;
});