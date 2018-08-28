// JavaScript Document
define(["app/core/app-jquery","app/core/app-core"],function($,$A) {

	 /* SCROLLSPY CLASS DEFINITION
	  * ========================== */

	  function ScrollSpy(element) {
		  var $element=$(element)
		  	,target = $element.attr("target")
		  	,$target = $A(target);
		  this.$element = $element;
		  if($target.length == 0){
			  $target=$A();
		  };
		  if($target.is(document)){
			  $target=$(window);
		  };
		  this.options = $.extend({}, $.fn.scrollspy.defaults, $A.options.scrollspy);
		  var process = $.proxy(this.process, this);
		  this.$scrollElement = $target.on('scroll.scroll-spy.data-api', process);
		  this.selector = 'ul>li> a';
		  this.$body = $('body');
		  this.refresh();
		  this.process();
	  }

	  ScrollSpy.prototype = {

	      constructor: ScrollSpy

	    , refresh: function () {
	        var self = this;
	        this.offsets = $([]);
	        this.targets = $([]);
	        $targets = this.$element.find(this.selector)
	        	.map(function () {
	        		var $el = $(this)
	        		,href = $el.data('target') || $el.attr('href')
	        		,$href = /^#\w/.test(href) && $(href);
	        		return ( $href && $href.length
	        				&& [[ $href.position().top + (!$.isWindow(self.$scrollElement.get(0)) && (self.$scrollElement.scrollTop())-self.$scrollElement.position().top), href ]] ) || null;
	        	})
	        	.sort(function (a, b) { return a[0] - b[0];})
	        	.each(function () {
	        		self.offsets.push(this[0]);
	        		self.targets.push(this[1]);
	        	});
	      }

	    , process: function () {
	        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
	          , scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
	          , maxScroll = scrollHeight - this.$scrollElement.height()
	          , offsets = this.offsets
	          , targets = this.targets
	          , activeTarget = this.activeTarget
	          , i;

	        if (scrollTop >= maxScroll) {
	          return activeTarget != (i = targets.last()[0])
	            && this.activate ( i );
	        }
	        if (scrollTop <= this.offsets[0]) {
	          return activeTarget != (i = targets.first()[0])
	            && this.activate ( i );
	        }
	        for (i = offsets.length; i--;) {
	          activeTarget != targets[i]
	            && scrollTop >= offsets[i]-50
	            && (!offsets[i + 1] || scrollTop <= offsets[i + 1]-50)
	            && this.activate( targets[i] );
	        }
	      }

	    , activate: function (target) {
	        this.activeTarget = target;
	        var $items = this.$element.find(this.selector);
	        $items.parent('.active').removeClass('active');

	        var $active = $items.filter('[data-target="' + target + '"],[href="' + target + '"]');
	        $active.parent('li').addClass('active');
	        $active.trigger('activate');
	      }

	  };


	 /* SCROLLSPY PLUGIN DEFINITION
	  * =========================== */
	  $.fn.scrollspy = function (option) {
	    return this.each(function () {
	      var $this = $(this)
	        , data = $this.data('scrollspy')
	        , options = typeof option == 'object' && option;
	      if (!data) $this.data('scrollspy', (data = new ScrollSpy(this, options)));
	      if (typeof option == 'string') data[option]();
	    });
	  };

	  $.fn.scrollspy.Constructor = ScrollSpy;
	  $.fn.scrollspy.defaults = {offset: 30};
	
});
