define(["app/core/app-jquery","app/core/app-core","app/util/app-utils"],function($,App,AppUtils){
	var that ={
		locale:"zh_CN",
		msg:function(code,args){
			return AppUtils.format(this._messages[code], args);
		},
		/**
		 * 基于编码的信息，可以带有{0}…{n}的变量
		 */
		_messages:{
			validateFormError:"提交数据不完整，{0}个字段有错误，请改正后再提交! ",
			alertSelectMsg:"请选择信息!"
		},
		messager:{
			OK:"确定",
			CANCEL:"取消",
			CONFIRM:"确认",
			ERROR:"错误",
			WARN:"警告",
			INFO:"信息",
			CORRECT:"成功",
			PROMPT:"提示"
		},
		/**
		 * 表格多语
		 */
		dataTable:{
			oLanguage:{
				oPaginate:{
					sFirst: "首页",
					sLast: "末页",
					sPrevious:"上一页",
					sNext:"下一页"
				},
				sLengthMenu: "每页显示 _MENU_ 条",
				sSearch:"查找:_INPUT_",
				sEmptyTable: "无符合条件的数据",
				sInfo: "当显示&nbsp;从 _START_ 到 _END_ 条记录&nbsp;&nbsp;&nbsp;总共 _TOTAL_ 记录",
				sInfoEmpty: "无显示记录",
				sLoadingRecords: "加载中...",
				sProcessing: "处理中...",
				sZeroRecords: "无符合条件的数据"
			}
		},
		pagination:{
			previous:"上一页",
			next:"下一页",
			pageInfo:"总共{0}记录,共{2}页,&nbsp;&nbsp;&nbsp;当显示第{3}页&nbsp;从{4}到{5}条记录",
			pageSizeInfo:"<ul class='ulnostyle uloneline'><li class='controltxt' >每页</li><li>{0}</li><li class='controltxt'>条记录</li></ul>"
		},
		validator:{
			
		},
		datetimepicker:{
			days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
			daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
			daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
			months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			today: "今日",
			suffix: [],
			meridiem: []
		},
		magicsuggest:{
			noSuggestionText:"无相关数据"
		},
		flexigrid:{
			errormsg:"加载数据错误",
			pagestat:"当前显示从 {from}到{to}条记录&nbsp;&nbsp;&nbsp;总共{total}记录 ",
			pagetext:"",
			outof:"/",
			procmsg:"数据加载中……",
			nomsg:"无符合条件的数据"
		}
	};
	App.lang = that;
	
	$.jgrid = $.jgrid || {};
	$.extend($.jgrid,{
	    defaults : {
	        recordtext: "{0} - {1}\u3000共 {2} 条", // 共字前是全角空格
	        emptyrecords: "无符合条件的记录。",
	        loadtext: "读取中...",
	        pgtext : " {0} 共 {1} 页"
	    },
	    search : {
	        caption: "搜索...",
	        Find: "查找",
	        Reset: "重置",
	        odata: [{ oper:'eq', text:'等于\u3000\u3000'},{ oper:'ne', text:'不等\u3000\u3000'},{ oper:'lt', text:'小于\u3000\u3000'},{ oper:'le', text:'小于等于'},{ oper:'gt', text:'大于\u3000\u3000'},{ oper:'ge', text:'大于等于'},{ oper:'bw', text:'开始于'},{ oper:'bn', text:'不开始于'},{ oper:'in', text:'属于\u3000\u3000'},{ oper:'ni', text:'不属于'},{ oper:'ew', text:'结束于'},{ oper:'en', text:'不结束于'},{ oper:'cn', text:'包含\u3000\u3000'},{ oper:'nc', text:'不包含'}],
	        groupOps: [ { op: "AND", text: "所有" },    { op: "OR",  text: "任一" } ]
	    },
	    edit : {
	        addCaption: "添加记录",
	        editCaption: "编辑记录",
	        bSubmit: "提交",
	        bCancel: "取消",
	        bClose: "关闭",
	        saveData: "数据已改变，是否保存？",
	        bYes : "是",
	        bNo : "否",
	        bExit : "取消",
	        msg: {
	            required:"此字段必需",
	            number:"请输入有效数字",
	            minValue:"输值必须大于等于 ",
	            maxValue:"输值必须小于等于 ",
	            email: "这不是有效的e-mail地址",
	            integer: "请输入有效整数",
	            date: "请输入有效时间",
	            url: "无效网址。前缀必须为 ('http://' 或 'https://')",
	            nodefined : " 未定义！",
	            novalue : " 需要返回值！",
	            customarray : "自定义函数需要返回数组！",
	            customfcheck : "Custom function should be present in case of custom checking!"
	        }
	    },
	    view : {
	        caption: "查看记录",
	        bClose: "关闭"
	    },
	    del : {
	        caption: "删除",
	        msg: "删除所选记录？",
	        bSubmit: "删除",
	        bCancel: "取消"
	    },
	    nav : {
	        edittext: "",
	        edittitle: "编辑所选记录",
	        addtext:"",
	        addtitle: "添加新记录",
	        deltext: "",
	        deltitle: "删除所选记录",
	        searchtext: "",
	        searchtitle: "查找",
	        refreshtext: "",
	        refreshtitle: "刷新表格",
	        alertcap: "注意",
	        alerttext: "请选择记录",
	        viewtext: "",
	        viewtitle: "查看所选记录"
	    },
	    col : {
	        caption: "选择列",
	        bSubmit: "确定",
	        bCancel: "取消"
	    },
	    errors : {
	        errcap : "错误",
	        nourl : "没有设置url",
	        norecords: "没有要处理的记录",
	        model : "colNames 和 colModel 长度不等！"
	    },
	    formatter : {
	        integer : {thousandsSeparator: ",", defaultValue: '0'},
	        number : {decimalSeparator:".", thousandsSeparator: ",", decimalPlaces: 2, defaultValue: '0.00'},
	        currency : {decimalSeparator:".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0.00'},
	        date : {
	            dayNames:   [
	                "日", "一", "二", "三", "四", "五", "六",
	                "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六",
	            ],
	            monthNames: [
	                "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二",
	                "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
	            ],
	            AmPm : ["am","pm","上午","下午"],
	            S: function (j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th';},
	            srcformat: 'Y-m-d',
	            newformat: 'Y-m-d',
	            parseRe : /[Tt\\\/:_;.,\t\s-]/,
	            masks : {
	                // see http://php.net/manual/en/function.date.php for PHP format used in jqGrid
	                // and see http://docs.jquery.com/UI/Datepicker/formatDate
	                // and https://github.com/jquery/globalize#dates for alternative formats used frequently
	                // one can find on https://github.com/jquery/globalize/tree/master/lib/cultures many
	                // information about date, time, numbers and currency formats used in different countries
	                // one should just convert the information in PHP format
	                ISO8601Long:"Y-m-d H:i:s",
	                ISO8601Short:"Y-m-d",
	                // short date:
	                //    n - Numeric representation of a month, without leading zeros
	                //    j - Day of the month without leading zeros
	                //    Y - A full numeric representation of a year, 4 digits
	                // example: 3/1/2012 which means 1 March 2012
	                ShortDate: "n/j/Y", // in jQuery UI Datepicker: "M/d/yyyy"
	                // long date:
	                //    l - A full textual representation of the day of the week
	                //    F - A full textual representation of a month
	                //    d - Day of the month, 2 digits with leading zeros
	                //    Y - A full numeric representation of a year, 4 digits
	                LongDate: "l, F d, Y", // in jQuery UI Datepicker: "dddd, MMMM dd, yyyy"
	                // long date with long time:
	                //    l - A full textual representation of the day of the week
	                //    F - A full textual representation of a month
	                //    d - Day of the month, 2 digits with leading zeros
	                //    Y - A full numeric representation of a year, 4 digits
	                //    g - 12-hour format of an hour without leading zeros
	                //    i - Minutes with leading zeros
	                //    s - Seconds, with leading zeros
	                //    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
	                FullDateTime: "l, F d, Y g:i:s A", // in jQuery UI Datepicker: "dddd, MMMM dd, yyyy h:mm:ss tt"
	                // month day:
	                //    F - A full textual representation of a month
	                //    d - Day of the month, 2 digits with leading zeros
	                MonthDay: "F d", // in jQuery UI Datepicker: "MMMM dd"
	                // short time (without seconds)
	                //    g - 12-hour format of an hour without leading zeros
	                //    i - Minutes with leading zeros
	                //    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
	                ShortTime: "g:i A", // in jQuery UI Datepicker: "h:mm tt"
	                // long time (with seconds)
	                //    g - 12-hour format of an hour without leading zeros
	                //    i - Minutes with leading zeros
	                //    s - Seconds, with leading zeros
	                //    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
	                LongTime: "g:i:s A", // in jQuery UI Datepicker: "h:mm:ss tt"
	                SortableDateTime: "Y-m-d\\TH:i:s",
	                UniversalSortableDateTime: "Y-m-d H:i:sO",
	                // month with year
	                //    Y - A full numeric representation of a year, 4 digits
	                //    F - A full textual representation of a month
	                YearMonth: "F, Y" // in jQuery UI Datepicker: "MMMM, yyyy"
	            },
	            reformatAfterEdit : false
	        },
	        baseLinkUrl: '',
	        showAction: '',
	        target: '',
	        checkbox : {disabled:true},
	        idName : 'id'
	    }
	});
	return that;
});