define(["app/core/app-jquery","app/core/app-core", 
        'app/util/app-number-format', 'app/util/app-xss-utils'], function ($, App, NumberFormat){
	
	var DEFAULT_DATE_PATTERN = "yyyy-MM-dd";
	
	var IDCARD1_PATTERN = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
	
	var IDCARD2_PATTERN = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/;
	
	var _PrivateFuncs = {
			"formatDateNum":function(num,len){
				var v = num.toString();
				if(v.length<len){
					var tmp = [len-v.length];
					for(var i=0;i<tmp.length;i++){
						tmp[i] = "0";
					}
					v = tmp.join("")+v;
				}else if(v.length>len){
					v = v.substring(v.length-len,v.length);
				}
				return v;
			}
	};
	
	/**
	 * 定义工具方法
	 */
	App.utils={
		/**
		 * 过滤特殊的html和js标签
		 */
		htmlencode: function(s){  
		    var div = document.createElement('div');  
		    div.appendChild(document.createTextNode(s));  
		    return div.innerHTML;  
		},
		/**
		 * 收集指定html元素指定属性，生成选项对象
		 */
		collectOptions:function(el,opNames){
			if(!opNames||!jQuery.isArray(opNames))
				return null;
			$el = $(el);
			var options = {};
			for(var i=0; i< opNames.length;i++){
				var val,name = opNames[i];
				if(name.indexOf(":")>-1){
					var t = name.split(":");
					val=$el.attr(t[0]);
					name=t[1];
				}else{
					val = $el.attr(name);
				}
				if(val){
					if(val.isInteger()){
						options[name] = parseInt(val,10);
					}else{
						options[name] = val;
					}
				}
			}
			return options;
		},
		/**
		 * 转换元素属性中的模板变量
		 */
		evalElementAttr:function(el,attrName){
			var $el = $(el),attr=attrName||"href";
			var val = this.attr($el,attr);
			if(!val || val.isFinishedTm())
				return val;
			val = val.evalTemplate(el);
			return val;
		},
		
		/**
		 * 取得当前元素的指定属性值包括val text html属性
		 */
		attr:function(el,attr){
			if(!attr)
				return null;
			return attr=='text'?$(el).text():(attr=='html'?$(el).html():(attr=='val'||attr=='value'?$(el).val():$(el).attr(attr)));
		},
		/**
		 * 格式化消息串
		 */
		format:function(msg,args){
			args = args || [];
			var result = msg;
			for (var i = 0; i < args.length; i++){
				result = result.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
			}
			return result;
		},
		/**
		 * 获取传入日期的月份范围，月份的第一天到最后一天
		 * @param date
		 * @result {begin,end}
		 */
		getMonthRange: function(date){
			var year = date.getFullYear()
				,month = date.getMonth()
				,days = new Date(year, month + 1, 0).getDate()
				,begin = new Date(year,month,1)
				,end = new Date(year,month,days); 
			return {begin:begin,end:end};
		},
		/**
		 * 获取传入年度的范围，年度的第一天到最后一天
		 * @param year
		 * @result {begin,end}
		 */
		getYearRange: function(year){
			var begin = new Date(year,0,1)
				,end = new Date(year,11,31); 
			return {begin:begin,end:end};
		},
		/**
		 * 获取传入日期所在季度的范围，季度第一天和最后一天
		 * @param date
		 * @returns {string} begin,end
		 */
		getSeasonRange: function(date){
			var year = date.getFullYear()
				,month = date.getMonth()
				,season = getMonth_Season(month + 1)
				,firstMonth = 0
				,lastMonth = 0;
			switch (season) {
			case 1:
				firstMonth = 1;
				lastMonth = 3;
				break;
			case 2:
				firstMonth = 4;
				lastMonth = 6;
				break;
			case 3:
				firstMonth = 7;
				lastMonth = 9;
				break;
			case 4:
				firstMonth = 10;
				lastMonth = 12;
				break;
			default:
				break;
			}
			var lastDate = new Date(year, lastMonth, 0).getDate()
				,begin = new Date(year, firstMonth - 1, 1)
				,end = new Date(year, lastMonth - 1, lastDate);
			return {begin:begin,end:end};
			/**
			 * 返回当前的日期为第几季度
			 * @param date
			 * @returns {Number}
			 */
			function getMonth_Season(month){
				var result = 0;
				if(month <= 3){
					result = 1;
				}else if(month <= 6){
					result = 2;
				}else if(month <= 9){
					result = 3;
				}else if(month <= 12){
					result = 4;
				}
				return result;
			}
		},
		/**
		 * 三位一个逗号隔开的展现，保留s为小数
		 * @param s 数值
		 * @param n 保留小数位(默认保留2位)
		 * @returns {String}
		 */
		formatNumber: function(s, n){
			if(n == undefined || typeof n != 'number'){
				n = 2;
			}
			return NumberFormat.toThousands(s, n);
		},
		/**
		 * 三位一个逗号隔开展现，最大保留x为小数
		 * @param s 数值
		 * @param x 最大保留小数位
		 */
		formatNumberSpc: function(s, n){
			return NumberFormat.toThousands(s, n, true);
		},
		/**
		 * 转换为大写金额
		 * @param n 数值
		 * @returns {String}
		 */
		formatChinese: function(n){
			return NumberFormat.toChinese(n);
		},
		/**
		 * 解析一个字符串变成Date对象
		 * @param str
		 * @param pattern
		 * @returns {Date}
		 */
		"parseDate" : function(str,pattern){
			if(!str){
				return;
			}
			if(!pattern){
				pattern = DEFAULT_DATE_PATTERN;
			}
			var tmp = [],nms = [];
			var r = pattern.replace(/[y|M|d|H|m|s]+/g,function($0){
				tmp.push($0);
				return "(\\d+)";
			});
			var reg = new RegExp(r,"g");
			if(!reg.test(str)){
				alert("解析日期时间出错");
				return  null;
			}
			str.replace(reg,function(){
				nms = $.makeArray(arguments).slice(1,tmp.length+1);
			});
			var date = new Date();
			for(var i=0;i<tmp.length;i++){
				var k = tmp[i];
				var n = parseInt(nms[i],10);
				switch(k.charAt(0)){
					case 'y':{date.setFullYear(n);break;}
					case 'M':{date.setMonth(n-1);break;}
					case 'd':{date.setDate(n);break;}
					case 'H':{date.setHours(n);break;}
					case 'm':{date.setMinutes(n);break;}
					case 's':{date.setSeconds(n);break;}
					case 'S':{date.setMilliseconds(n);break;}
				}
			}
			return date;
		},
		
		/**
		 * 格式化Date
		 * @param {date} date
		 * @param {string} pattern
		 * @return {string}
		 */
		"formatDate" : function(date,pattern){
			if(!date){
				return;
			}
			if(!pattern){
				pattern = DEFAULT_DATE_PATTERN;
			}
			var result = pattern.replace(/[y|M|d|H|m|s]+/g,function($0){
				var value="",len = $0.length,c=$0.charAt(0);
				switch(c){
					case 'y':{value = date.getFullYear();break;}
					case 'M':{value = date.getMonth()+1;break;}
					case 'd':{value = date.getDate();break;}
					case 'H':{value = date.getHours();break;}
					case 'm':{value = date.getMinutes();break;}
					case 's':{value = date.getSeconds();break;}
					case 'S':{value = date.getMilliseconds();break;}
				}
				return _PrivateFuncs.formatDateNum(value,len);
			});
			return result;
		},
		/**
		 * 是否是身份证
		 */
		"isIDCard":function(idCard){
			return /^((1[1-5])|(2[1-3])|(3[1-7])|(4[1-6])|(5[0-4])|(6[1-5])|71|(8[12])|91)\d{4}((19\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(19\d{2}(0[13578]|1[02])31)|(19\d{2}02(0[1-9]|1\d|2[0-8]))|(19([13579][26]|[2468][048]|0[48])0229))\d{3}(\d|X|x)?$/.test(idCard);
		},
		/**
		 * 判断是否是正整数
		 * @param {string}
		 * @returns {Boolean}
		 */
		"isPlusInteger" : function(str){
			//包括零
			return /^(0|[1-9][0-9]*)$/.test(str) && str.length<11;
		},
		/**
		 * 判断是否是座机号码
		 * @param {string}phoneNum
		 * @return {boolean}
		 */
		"isPhone":function (phoneNum){
			return /^(\d{3,4}-?)?[1-9]\d{6,7}([-|转]\d{2,4})?$/.test(phoneNum);
			//return (new RegExp(/^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$/)).test(phoneNum);
		},
		/**
		 * 是否是手机号码
		 */
		"isMobile":function (mobileNum){
			return (new RegExp(/^((\(\d{3}\))|(\d{3}\-))?1[358]\d{9}$/)).test(mobileNum);
		},
		/**
		 * 是否是邮件
		 */
		"isMail" : function (mail){
			return (new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/)).test(mail);
		},
		/**
		 * 是否是URL
		 */
		"isURL":function (u){
			return (new RegExp(/^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/)).test(u);
		},
		/**
		 * 是否是邮编
		 */
		"isZipCode":function (zipCode){
			return (new RegExp(/^[1-9]\d{5}$/)).test(zipCode);
		},
		//校验只能是数字
		"isDigits" : function(field) {
			return (new RegExp(/^[0-9]*$/)).test(field)&& field.length<=32;
		},
        /**
		 *
		 * @param {array|function}
		 * @description 快速排序
		 *
         */
		sort:function (array,fn) {
			var len = array.length;
			if(len<=1){
				return array;
			}
			var middleIndex = Math.floor(len/2);
			var middleVal = array[middleIndex];
			var leftArray = [],rightArray = [];
			$(array).each(function (index,item) {
                var r = fn(middleVal,item);
				if(r>=1){
					leftArray.push(item);
				}else if(r<0){
                   	rightArray.push(item);
				}else if(r==0&&index>middleIndex){
                    rightArray.push(item);
				}else if(r==0&&index<middleIndex){
                    leftArray.push(item);
                }
            })
			return App.utils.sort(leftArray,fn).concat(middleVal,App.utils.sort(rightArray,fn));
        }
	};



	/**
	 * 扩展jQuery匹配表达式
	 */
	function innerTextExactMatch(elem, text) {
		return (elem.textContent || elem.innerText || $(elem).text() || '').toLowerCase() === (text || '').toLowerCase();
	}
	
	$.expr[':'].innerTextExactMatch = $.expr.createPseudo?
		$.expr.createPseudo(function (text) {
			return function (elem) {
				return innerTextExactMatch(elem, text);
			};
		}) :
		function (elem, i, match) {
			return innerTextExactMatch(elem, match[3]);
	};
	/**
	 * 获取字符串长度(英文占1个字符，中文汉字占2个字符)
	 */
	String.prototype.gblen = function(){    
	    var len = 0;    
	    for (var i=0; i<this.length; i++) {    
	        if (this.charCodeAt(i)>127 || this.charCodeAt(i)==94) {    
	             len += 2;    
	         } else {    
	             len ++;    
	         }    
	     }    
	    return len;    
	}
	App.NumberFormat = NumberFormat;
	App.utils.addTreeBtn = function(node, btn){
		var nodeId = node.tId
			,btnId = nodeId + '_' +btn.id;
		if ($('#' + btnId).length>0) return;
		var $btn = $('<span class="button ' + btn.icon + '" id="' + 
				btnId + '" title="' + btn.title +
				'"></span>'); 
		$btn.on('click', function(e){
			btn.handler(node);
			e.stopPropagation();
		});
		$('#' + nodeId + '_span').after($btn);
	};
	return App.utils;
});