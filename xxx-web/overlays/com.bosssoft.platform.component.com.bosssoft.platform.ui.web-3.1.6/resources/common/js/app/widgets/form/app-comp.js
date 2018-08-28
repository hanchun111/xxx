/**
 * 下拉面板控件
 */
define(['app/core/app-jquery','app/core/app-core','app/widgets/form/app-combobox'],function($,$A) {
	
	function setSimpleValue(v){
		$(this).val(v);
	};
	function getSimpleValue(){
		return $(this).val();
	};
	function setBoxValue(v){
		var $this = $(this);
		if($this.attr("type")=="radio"){
			$this.each(function(){
				var $t = $(this);
				if($t.val()==v){
					$t.attr('checked', 'true');
					return false;
				}
			});
		}else{
			v = ","+v+",";
			$this.each(function(){
				var $t = $(this),val=$t.val();
				if(v.indexOf(","+val+",")>-1){
					$t.attr('checked', 'true');
				}else{
					$t.removeAttr('checked');
				}
			});
		}
	};
	function getBoxValue(){
		var rs = new Array;
		$(this).filter(":checked").each(function(){
			rs.push($(this).val());
		});
		if(rs.length == 0)
			return null;
		return rs.join(",");
	};
	function setWrapperValue(v,type){
		$(this)[type]("setValue",v);
	};
	function getWrapperValue(type){
		return $(this)[type]("getValue");
	};
	function setWrapperText(t,type){
		$(this)[type]("setText",t);
	};
	function getWrapperText(type){
		return $(this)[type]("getText");
	};
	function setParameter(t,type){
		$(this)[type]("setParameter",t);
	};
	function clearSimpleValue(){
		$(this).val('');
	};
	function clearValue(v,type){
		$(this)[type]("clearValue");
	};
	var getValues = {
		hidden:getSimpleValue,
		textfield:getSimpleValue,
		textbox:getWrapperValue,
		textarea:getSimpleValue,
		datetime:getWrapperValue,
		money:getWrapperValue,
		number:getWrapperValue,
		combobox:getWrapperValue,
		comboztree:getWrapperValue,
		combogrid:getWrapperValue,
		reference:getWrapperValue,
		suggest:getWrapperValue,
		typeahead:getSimpleValue,
		radio:getBoxValue,
		checkbox:getBoxValue
	};
	var setValues = {
		hidden:setSimpleValue,
		textfield:setSimpleValue,
		textarea:setSimpleValue,
		textbox:setWrapperValue,
		datetime:setWrapperValue,
		money:setWrapperValue,
		number:setWrapperValue,
		combobox:setWrapperValue,
		comboztree:setWrapperValue,
		combogrid:setWrapperValue,
		reference:setWrapperValue,
		suggest:setWrapperValue,
		typeahead:setSimpleValue,
		radio:setBoxValue,
		checkbox:setBoxValue
	};
	var getTexts = {
		hidden:getSimpleValue,
		textfield:getSimpleValue,
		textarea:getSimpleValue,
		textbox:getSimpleValue,
		money:getWrapperText,
		number:getWrapperText,
		datetime:getWrapperText,
		combobox:getWrapperText,
		comboztree:getWrapperText,
		combogrid:getWrapperText,
		reference:getWrapperText,
		suggest:getWrapperText,
		typeahead:getWrapperText
	};
	var setTexts = {
		datetime:setWrapperText,
		combobox:setWrapperText,
		comboztree:setWrapperText,
		combogrid:setWrapperText,
		reference:setWrapperText,
		suggest:setWrapperText,
		typeahead:setSimpleValue
	};

	var setParams = {
		textbox:setParameter,
		combobox:setParameter,
		comboztree:setParameter,
		combogrid:setParameter,
		reference:setParameter,
		suggest:setParameter
	};
	var clearValues = {
		hidden:clearSimpleValue,
		textfield:clearSimpleValue,
		textbox:clearValue,
		textarea:clearSimpleValue,
		money:clearValue,
		number:clearValue,
		datetime:clearValue,
		combobox:clearValue,
		comboztree:clearValue,
		combogrid:clearValue,
		reference:clearValue,
		suggest:clearValue,
		typeahead:clearSimpleValue
	};
	function filterComponents($elements){
		var filterType = null;
		return $elements.filter(function(){
			var $this = $(this)
			,type = $this.attr("type");
			if($this.parent().hasClass("app-number")){
				return !filterType;
			}
			if($this.parent().hasClass("app-money")){
				return !filterType;
			}
			if($this.parent().hasClass("app-datetime")){
				return !filterType;
			}
			if($this.parent().hasClass("app-textbox")){
				return !filterType;
			}
			if($this.parent().hasClass("app-combobox")){
				return !filterType;
			}
			if($this.parent().hasClass("app-reference")){
				return !filterType;
			}
			if($this.parent().hasClass("app-comboztree")){
				return !filterType;
			}
			if($this.parent().hasClass("app-combogrid")){
				return !filterType;
			}
			if($this.parent().hasClass("app-suggest")){
				returnType="suggest";
				return !filterType;
			}
			if($this.parent().hasClass("app-typeahead")){
				return !filterType;
			}
			if(type == "textfield" || type == "textarea" || type=="hidden"){
				return !filterType;
			}
			if($this.is("textarea")){
				return !filterType;
			}
			if(type=="radio"||type=="checkbox"){
				if(filterType == null)
					filterType = type;
				if(filterType == type)
					return true;
			}
			return false;
		});
	}
	function setCompAttr($element,methods,v){
		var eles = filterComponents($element);
		if(eles.length == 0)
			return;
		var type = $(eles[0]).getCompType();
		if(type == null)
			return;
		var m = methods[type];
		if(m == null)
			return;
		m.call(eles,v,type);
	}
	function getCompAttr($element,methods){
		var eles = filterComponents($element);
		if(eles.length == 0)
			return;
		var type = $(eles[0]).getCompType();
		if(type == null)
			return;
		var m = methods[type];
		if(m == null)
			return;
		return m.call(eles,type);
	}
	$.extend($.fn,{
		/**
		 * 取得组件类型
		 * @return {string} 组件类型
		 */
		getCompType:function(){
			var returnType = null;
			$(this).each(function(){
				var $this = $(this)
				,type = $this.attr("type");
				if($this.parent().hasClass("app-datetime")){
					returnType="datetime";
					return false;
				}
				if($this.parent().hasClass("app-number")){
					returnType="number";
					return false;
				}
				if($this.parent().hasClass("app-money")){
					returnType="money";
					return false;
				}
				if($this.parent().hasClass("app-textbox")){
					returnType="textbox";
					return false;
				}
				if($this.parent().hasClass("app-combobox")){
					returnType="combobox";
					return false;
				}
				if($this.parent().hasClass("app-reference")){
					returnType="reference";
					return false;
				}
				if($this.parent().hasClass("app-comboztree")){
					returnType="comboztree";
					return false;
				}
				if($this.parent().hasClass("app-combogrid")){
					returnType="combogrid";
					return false;
				}
				if($this.parent().hasClass("app-suggest")){
					returnType="suggest";
					return false;
				}
				if($this.parent().hasClass("app-typeahead")){
					returnType="typeahead";
					return false;
				}
				if(type == "textfield" || type == "textarea" || type=="hidden"||type=="radio"||type=="checkbox"){
					returnType=type;
					return false;
				}
				if($this.is("textarea")){
					returnType="textarea";
					return false;
				}
			});
			return returnType;
		},
		
		/**
		 * 取得组件类型
		 */
		isTriggerChange:function(){
			$(this).attr("type") != "wrapper";
		},
		/**
		 * 取得组件显示值
		 */
		getCompText:function(){
			return getCompAttr(this,getTexts);
		},
		/**
		 * 设置组件显示值
		 */
		setCompText:function(v){
			setCompAttr(this,setTexts,v);
		},
		/**
		 * 取得组件值
		 */
		getCompValue:function(){
			return getCompAttr(this,getValues);
		},
		/**
		 * 设置组件值
		 */
		setCompValue:function(v){
			setCompAttr(this,setValues,v);
		},
		/**
		 * 取得组件值
		 */
		getCompData:function(){
			var eles = filterComponents($(this));
			if(eles.length == 0)
				return;
			var type = $(eles[0]).getCompType();
			if(type == null)
				return;
			var m = getValues[type];
			if(m == null)
				return;
			var v= m.call(eles,type);
		
			m = getTexts[type];
			if(m == null)
				return {value:v};
			var txt= m.call(eles,type);
			return {value:v,showValue:txt};
		},
		/**
		 * 设置组件值
		 */
		setCompData:function(value,showValue){
			var eles = filterComponents($(this));
			if(eles.length == 0)
				return;
			var type = $(eles[0]).getCompType();
			if(type == null)
				return;
			var m = setValues[type];
			if(m == null)
				return;
			if(value!= null && typeof value == "object" && value.value){
				showValue = value.showValue;
				value = value.value;
			}
			if (value!=null){
				value=value.toString();
			}
			//modify by tw
			m.call(eles,value,type);
			if(showValue !=null ||(value==null && showValue==null)){
				var setTextMethod = setTexts[type];
				if(setTextMethod != null)
					setTextMethod.call(eles,showValue,type);
			}
			//else{
			//	m.call(eles,value,type);
			//}
		},
		/**
		 * 设置参数值
		 */
		setCompParameter:function(v){
			setCompAttr(this,setParams,v);
		},
		/**
		 * 设置参数值
		 */
		clearCompValue:function(){
			setCompAttr(this,clearValues);
		}
	});
	return $;
});
	