/**
 * 表单验证
 * @author Mr.T
 */
define(["jquery",localeFile,"jquery/jquery.validate","jquery/jquery.metadata"],function($,$lang){
	$.validator.addMethod("alphanumeric", function(value, element) {
		return this.optional(element) || /^\w+$/i.test(value);
	}, "Letters, numbers or underscores only please");
	
	$.validator.addMethod("lettersonly", function(value, element) {
		return this.optional(element) || /^[a-z]+$/i.test(value);
	}, "Letters only please"); 
	
	$.validator.addMethod("phone", function(v, element) {
	    v = v.replace(/\s+/g, ""); 
		return this.optional(element) || v.match(/^[0-9 \(\)]{7,30}$/);
	}, "Please specify a valid phone number");
	
	$.validator.addMethod("postcode", function(v, element) {
	    v = v.replace(/\s+/g, ""); 
		return this.optional(element) || v.match(/^[0-9 A-Za-z]{5,20}$/);
	}, "Please specify a valid postcode");
	
	$.validator.addMethod("date", function(v, element) {
	    v = v.replace(/\s+/g, ""); 
		return this.optional(element) || v.match(/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/);
	});
	// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
	$.validator.addMethod("equalTo",function(value, element, param) {
		// bind to the blur event of the target in order to revalidate whenever the target field is updated
		// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
		var target = $(param);
		if (this.settings.onfocusout) {
			target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
				$(element).valid();
			});
		}
		if($(element).parent().hasClass('app-wrapper')){
			target.unbind(".validate-equalTo").bind("change.validate-equalTo", function() {
				$(element).valid();
			});
		}
		return value === target.val();
	});
	
	$.validator.addMethod("laterThan",function(value, element, param) {
		var target = $(param);
		if (this.settings.onfocusout) {
			target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
				$(element).valid();
			});
		}
		if($(element).parent().hasClass('app-wrapper')){
			target.unbind(".validate-equalTo").bind("change.validate-equalTo", function() {
				$(element).valid();
			});
		}
		return value >= target.val();
	});
	
	// http://docs.jquery.com/Plugins/Validation/Methods/remote
	$.validator.addMethod('remote',function(value, element, param) {
		if ( this.optional(element) ) {
			return "dependency-mismatch";
		}
		var previous = this.previousValue(element);
		if (!this.settings.messages[element.name] ) {
			this.settings.messages[element.name] = {};
		}
		previous.originalMessage = this.settings.messages[element.name].remote;
		this.settings.messages[element.name].remote = previous.message;

		param = typeof param === "string" && {url:param} || param;

		if ( this.pending[element.name] ) {
			return "pending";
		}
		if ( previous.old === value ) {
			return previous.valid;
		}

		previous.old = value;
		var validator = this;
		this.startRequest(element);
		var data = {};
		data[element.name] = value;
		appendParams(data,this,param);
		$.ajax($.extend(true, {
			url: param,
			mode: "abort",
			port: "validate" + element.name,
			dataType: "json",
			data: data,
			success: function(response) {
				validator.settings.messages[element.name].remote = previous.originalMessage;
				var valid = response === true || response === "true";
				if ( valid ) {
					var submitted = validator.formSubmitted;
					validator.prepareElement(element);
					validator.formSubmitted = submitted;
					validator.successList.push(element);
					delete validator.invalid[element.name];
					validator.showErrors();
				} else {
					var errors = {};
					var message = response || validator.defaultMessage( element, "remote" );
					errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
					validator.invalid[element.name] = true;
					validator.showErrors(errors);
				}
				previous.valid = valid;
				validator.stopRequest(element, valid);
			}
		}, param));
		return "pending";
		/**
		 * 扩展方法 追加其他的参数
		 * @param data 原请求参数
		 * @param validator 表单校验器
		 * @param params 参数
		 */
		function appendParams(data,validator,params){
			if(params.withHidden){
				var hidden = $(validator.currentForm).find('input:hidden');
				for(var i = 0; i<hidden.length; i++){
					var h = $(hidden[i]);
					data[h.attr('name')] = h.val();
				}
			}
			var t = $.extend({},params);
			delete t.url;
			$.extend(data,t);
		}
	});
	
	$.validator.addClassRules({
		date: {date: false},
		alphanumeric: { alphanumeric: true },
		lettersonly: { lettersonly: true },
		phone: { phone: true },
		postcode: {postcode: true}
	});
	$.validator.setDefaults({
		highlight:function(element,errorClass,validClass){
			$(element).parents('.form-group:first').addClass(errorClass).removeClass(validClass);
		},
		unhighlight:function(element,errorClass,validClass){
			$grp = $(element).parents('.form-group:first');
			$grp.removeClass(errorClass).removeClass(validClass);
			this.showHelps(element);
		},
		success:function(label,element){
			$grp = $(element).parents('.form-group:first');
			$grp.removeClass("error");
			$grp.addClass("success");
			this.hideHelps(element);
			label.html("<i class='icon icon-green icon-check'></i>");
		},
		/**
		 * 扩展出值改变事件
		 */
		onchange:function(element, event){
			this.element(element);
		},
		invalidHandler:function(form, validator) {
			var list = validator.errorList;
			for(var i=0;i<list.length;i++){
				var el = $(list[i].element);
				var p = el.parent();
				if(p.is('.app-wrapper')){
					p.addClass('errorTarger');
				}else{
					el.addClass('errorTarger');
				}
			}
		},
		errorClass:"error",
		validClass:"success",
		errorElement:"span",
		focusInvalid: false,
		focusCleanup: true,
		ignore: '.ignore',
		onkeyup:$.emptyFunction
	});
	$.validator.autoCreateRanges=true;
	$.extend($.validator.prototype,{
		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = (this.groups = {});
			$.each(this.settings.groups, function(key, value) {
				$.each(value.split(/\s/), function(index, name) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function(key, value) {
				rules[key] = $.validator.normalizeRule(value);
			});

			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				if (validator.settings[eventType]) {
					validator.settings[eventType].call(validator, this[0], event);
				}
			}
			$(this.currentForm)
				.validateDelegate(":text, [type='text'], [type='password'], " +
					"[type='showValue'], [type='file'], [type='number'], [type='tel'], " +
					"[type='url'], [type='email'], select, textarea ",
					"focusin focusout keyup", delegate)
				.validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);
			//扩展出App控件
			wrapperDelegate($(this.currentForm));

			/**
			 * 自定义控件进行验证事件的委托
			 * @param $form
			 */
			function wrapperDelegate($form){
				//隐藏值改变触发一次验证
				$form.validateDelegate(".app-wrapper input:first-child", "change", delegate);
				//下拉展开面板触发一次验证
//				var dropBtn = $form.find(".app-wrapper").find('a.wrapper-open');
//				dropBtn.on('click.validate.api',function(){
//					var $value = $(this).parent().children(':first-child')[0];
//					var validator = $.data($value.form, 'validator');
//					validator.settings.onchange.call(validator, $value, event);
//				});
			}
			
			if (this.settings.invalidHandler) {
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
			}
		},
		elementValue: function( element ) {
			var $element = $(element)
				,type = $element.attr('type'),
				val = $element.val();

			if ( type === 'radio' || type === 'checkbox' ) {
				return $('input[name="' + $element.attr('name') + '"]:checked').val();
			}
			var $parent = $element.parent(); 
			//扩展app控件的值获取
			if( $parent.hasClass('app-wrapper') 
					&& $parent.find('input:first-child').data('context').setting.multiple){
				return val.split(',');
			}

			if ( typeof val === 'string' ) {
				return val.replace(/\r/g, "");
			}
			return val;
		},
		showHelps:function(element){
			$(element).parents('.form-group:first').find('.help-inline:not([for]),.help-block:not([for])').show();
		},
		hideHelps:function(element){
			$(element).parents('.form-group:first').find('.help-inline:not([for]),.help-block:not([for])').hide();
		},
		showLabel:function(element, message) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// check if we have a generated label, replace the message then
				if ( label.attr("generated") ) {
					label.html(message);
				}
			} else {
				var cls =$(element).parents('.form-group:first').attr('helpType')=='block'?'help-block':'help-inline';
				// create label
				label = $("<" + this.settings.errorElement + "/>")
					.attr({"for":  this.idOrName(element), generated: true})
					.addClass(cls)
					.html(message || "");
				if ( !this.labelContainer.append(label).length ) {
					if ( this.settings.errorPlacement ) {
						this.settings.errorPlacement(label, $(element) );
					} else {
						defaultPosition(label, $(element));
					}
				}
			}
			if ( !message && this.settings.success ) {
				label.text("");
				if ( typeof this.settings.success === "string" ) {
					label.addClass( this.settings.success );
				} else {
					this.settings.success.call(this,label, element );
				}
			}
			this.toShow = this.toShow.add(label);
			this.hideHelps(element);
			/**
			 * 默认的错误标签显示位置
			 * @param label 错误描述标签
			 * @param $element 出现错误元素
			 */
			function defaultPosition(label, $element){
				var $targer = $element; 
				var $p = $element.parent();
				if($p.hasClass('app-wrapper')){
					$targer = $p;
				}else if($p.parent().hasClass('multipleboxDiv')){
					$targer = $p.parent();
				}
				var wrap = $targer.data('errorWrapper');
				if(!wrap){
					var $wrapper = $('<div class=\"errorWrapper\"><div><div></div></div></div>');
					$wrapper.css('width',$targer.outerWidth());
					$wrapper.appendTo($.$appPanelContainer);
					$targer.data('errorWrapper', $wrapper);
					label.insertBefore($wrapper.find('div div'));
					hoverShowErrors($targer);
				}else{
					wrap.find('div>span').text(label.text());
				}
				/**
				 * 绑定浮动显示错误事件
				 * @param $targer
				 */
				function hoverShowErrors($targer){
					$targer.hover(function(){
						var $this = $(this);
						var $wrapper = $this.data('errorWrapper');
						if($wrapper.text()){
							$this.addClass('errorTarger');
							var css = $this.offset()
								,$thisTop = $this.offset().top;
							css.display = 'block';
							if($thisTop < $wrapper.outerHeight()){
								css.top = css.top + $this.outerHeight();
								$wrapper.addClass('up');
							}else{
								css.top = css.top -  $wrapper.outerHeight();
								$wrapper.removeClass('up');
							}
							$wrapper.css(css);
						}
					},function(){
						var $this = $(this);
						$this.removeClass('errorTarger');
						var $wrapper = $this.data('errorWrapper');
						var css = {display:'none'};
						$wrapper.css(css);
					});
				}
			}
		},
		hideErrors: function() {
			this.showHelps(this.toHide);
			this.addWrapper( this.toHide ).hide();
		},
		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			return $(this.currentForm)
			.find("input[type!=showValue], select, textarea")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				if ( !this.name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this);
				}

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) ) {
					return false;
				}

				rulesCache[this.name] = true;
				return true;
			});
		},
		errors: function() {
			return $( '.errorWrapper', this.errorContext );
		},
		validElements: function() {
			return this.currentElements.not(this.invalidElements()).not(this.successList);
		},
		form: function() {
			//校验前 去除之前错误的样式 Mr.T 2014年11月19日10:59:25
			$(this.currentForm).find('.errorTarger').removeClass('errorTarger');
			$(this.currentForm).find('.errorWrapper').remove();

			this.checkForm();
			
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if (!this.valid()) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			}
			this.showErrors();
			if (this.errorList&& this.errorList.length>0){
			
				var firstEl=this.errorList[0];
				
					$(firstEl.element).parent().find("input:visible,textarea:visible,select:visible").focus()
			
			}
			return this.valid();
		}


	});
	return $;
});
