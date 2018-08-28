/**
 * 表单验证
 */
define(["jquery","app/core/app-core","app/widgets/form/app-comp"],function($,$A){
	$A.gearRules={
		rules:{
			mnemonic:{
				name:"mnemonic",
				trigger:"change",
				handle:function($s,$t,c){
					var t = $s.getCompText();
					if(t){
						var pinyin = t.toUpperInitials();
						$t.setCompValue(pinyin);
						$t.setCompText(pinyin);
					}
				}
			},
			gear:{
				name:"gear",
				trigger:"change",
				init:true,
				handle:function($s,$t,c){
					var map = c.map||{}
					,clear=c.clear!==false;
					var param={};
					$s.each(function(){
						var $o = $(this)
						,v=$o.getCompValue()
						,t =$o.getCompText()
						,n=$o.attr("name")
						,sn=$o.attr("showName");
						n=map[n]||n;
						param[n]=v;
						if(sn){
							sn=map[sn]||sn;
							param[sn]=t;
						}
					})
					$t.setCompParameter(param);
					$t.clearCompValue();
				}
			}
		},
		addRule:function(name,rule){
			if(typeof name == "object"){
				rule = name;
			}else{
				rule.name=name;
			}
			rules[rule.name]=rule;
		}
	};
	
	/**
	 * 创建规则对象
	 * @param rules{object}额外规则
	 */
	$.fn.gearRule = function(rules){
		rules = $.extend({},$A.gearRules.rules,rules);
		$(this).each(function(){
			var $target = $(this)
			,elRules=$target.attr("gearRules");
			if(!elRules)
				return;
			elRules=$A.jsonEval(elRules);
			$.each(elRules, function(prop, val) {
				if(!val)
					return;
				var rule = rules[prop];
				if(rule == null)
					return;
				var trigger = rule.trigger||"change";
				var config = val;
				var init = rule.init;
				if(typeof val!="string"){
					val=config.depend;
					if(config.init !== undefined){
						init = config.init;
					}
				}
				var $source = $target;
				if(val){
					$source = $A(val);
					if($source.size() == 0)
						return;
				}
				if(init){
					if(typeof init == "function"){
						init($source,$target,config);
					}else{
						rule.handle($source,$target,config);
					}
				}
				$source.on(trigger,function(){
					rule.handle($(this),$target,config);
				});
			});
		});
	};
	return $;
});
