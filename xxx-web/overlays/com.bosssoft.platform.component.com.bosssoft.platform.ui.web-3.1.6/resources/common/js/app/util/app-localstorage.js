/**
 * 本地存储
 * @author Mr.T
 */
define([], function() {
	var Storage = function(opts){
		this.opts = opts;
		if(!opts.key){
			throw new Error('为设置key值，无法初始化LocalStorage');
		}
		this.key = opts.key;
	};
	Storage.prototype = {
		get: function(){
			var innerObj = this._get();
			if(innerObj){
				return innerObj.data;
			}
			return;
		},
		_get: function(){
			var val = localStorage.getItem(this.key);
			if(!val){
				return;
			}
			return JSON.parse(val);
		},
		put: function(val){
			if(!val){
				return;
			}
			var innerObj = this._get()
				,dataType = $.isArray(val) ? typeof val[0]: typeof val; 
			if(!innerObj){
				innerObj = {type: dataType, data: []};
			}
			if(innerObj.type != dataType){
				throw new Error('与已存储的数据类型不匹配，无法完成存储');
			}
			var nodes = val
				,keyField = null;
			if(dataType == 'object'){
				nodes = val.data;
				keyField = val.keyField;
			}
			if($.isArray(nodes)){
				for(var i = 0; i < nodes.length; i++){
					this._put(innerObj, nodes[i], keyField);	
				}
			}else{
				this._put(innerObj, nodes, keyField);	
			}
			localStorage.setItem(this.key, JSON.stringify(innerObj));
		},
		_put: function(innerObj, node, keyField){
			var arr = innerObj.data;
			if(this._contain(arr, node, keyField)){
				return;
			}
			if(arr.length >= 20){
				arr.pop();
			}
			arr.unshift(node);
		},
		_contain: function(arr, node, keyField){
			if(keyField){
				for(var i = 0; i < arr.length; i++){
					if(arr[i][keyField] == node[keyField]){
						return true;
					}
				}
			}else{
				for(var i = 0; i < arr.length; i++){
					if(arr[i] == node){
						return true;
					}
				}
			}
			return false;
		}
	};
	return Storage;
});