define([],function() {
	
	var result = {
			
			download:function(url,params,_blank){
				var $form = $("<form style=\"display:none;\"></form>").attr("action",url).attr("method","post");
				if(_blank){
					$form.attr("target","_blank");
				}
				for(var key in params){
					$("<input type=\"hidden\" />").attr("name",key).val(params[key]).appendTo($form);
				}
				$("body").append($form);
				$form.submit();
				$form.remove();
			}
			
	};
	return result;
	
});