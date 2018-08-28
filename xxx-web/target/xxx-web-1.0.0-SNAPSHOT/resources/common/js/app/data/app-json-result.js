/**
 * @class JsonResult
 * <p>此类封装服务调用返回信息</p>
 * @constructor
 * @param {Object} src JSON格式的源数据
 * @param {Object} onlyData 仅含数据(没有调用结果等信息)
 * @return {XY.data.JsonResult} 创建的对象
 */
define(["jquery"],function($){
var JsonResult = function(src, onlyData) {
	var o = null, status = null;

	if ($.type(src) === "string") {
		o = $.parseJSON(src);
	} else if ($.isPlainObject(src) && src.responseText) {
		o = $.parseJSON(src.responseText);
	} else {
		o = src;
	}

	if (onlyData) {
		status = {code : JsonResult.SUCCESS, message : null};
	} else {
		status={code:o.statusCode,message:o.message}
		
	}

	//private
	//TODO : 不需要暴露这些属性
	this.code = parseInt(status.code, 10);
	this.message = status.message
	this.translator=o["translator"];
	this.translateBodys=o["translateBodys"];
	this.data = null;

	/*
	 * 读取数据部分
	 * 1.如果 onlyData == true, 则整个对象就是数据
	 *   否则认为对象中的 result 属性为数据
	 * 2.上述所得数据可能为对象，也可能为基本类型的数据
	 */
	var data = onlyData ? o : o.data;
	if ($.isPlainObject(data)) {
		this.data = {};
		$.extend(this.data, data);
	} else {
		this.data = data;
	}
};

JsonResult.prototype = {

	/**
	 * 返回运行结果代码
	 * @return {Number} 代码
	 */
	getCode : function(){
		return this.code;
	},

	/**
	 * 返回运行结果消息
	 * @return {String} 消息
	 */
	getMessage : function(){
		return this.message;
	},

	/**
	 * 返回原始数据
	 * @param {String} name 属性名，支持多级(a.b.c)
	 * @return {Object} 对象中对应的属性
	 */
	getRawData : function(name){
		var o = this.data;

		// o 为基本类型时, 应该直接返回
		if ($.isPlainObject(o) && (name!=""&&name!=null&&name!=undefined)) {
			var d = name.split("."),
			    len = d.length;

			for (var i = 0; i < len; i++) {
				o = o[d[i]];
				if (o === null || o === undefined) break;
			}
		}
		
		return o;
	},

	/**
	 * 返回有类型的数据
	 * 如果没有定义类型，则返回原始数据
	 * @param {String} name 属性名，支持多级(a.b.c)
	 * @return {Object} 对象中对应的属性
	 */
	getData : function(name){
		var data = this.getRawData(name);

		if ($.isPlainObject(data)) {
			if (data["totalPage"]){
				data["translator"]=this.translator;
				data["dicts"]=this.translateBodys;
			}
		}

		return data;
	}

};
/**
 * 服务调用返回值 : 成功
 * @property SUCCESS
 * @type {Number}
 */
JsonResult.SUCCESS = 200;
/**
 * 服务调用返回值 : 失败
 * @property FAILURE
 * @type {Number}
 */
JsonResult.FAILURE = -1;
/**
 * 服务调用返回值 : 警告
 * @property WARN
 * @type {Number}
 */
JsonResult.WARN = 1;
/**
 * 服务调用返回值 : 未认证
 * @property UN_AUTHED
 * @type {Number}
 */
JsonResult.UN_AUTHED = -999;
return JsonResult;
});
