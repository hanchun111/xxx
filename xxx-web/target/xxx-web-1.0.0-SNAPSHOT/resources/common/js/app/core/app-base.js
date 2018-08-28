define(["app/core/app-class","app/core/app-attribute","app/core/app-events"],function(Class,Attribute,Events) {

    // Base Events、Aspect
    /**
     *
     * @class
     * @name Base
     * @extends Class
     * @classdesc  Base 是一个基础类，提供 Class、Attrs 和  支持。
     */
    var Base = Class.create({
        Implements: [Attribute,Events],
        initialize: function(config) {
               this.initAttrs(config);
            // 对于 Base 来说，`change:attr` 事件的含义应该是在实例化后，当属性有变化
            // 时触发，初始化过程中不应该触发。
     
            // 标识实例已准备好
        	parseEventsFromInstance(this, this.attrs);
        },
        /**
         * 注销方法
         * @abstract
         * @memberof Base
         */
        destroy: function() {
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
        },
        bind:function(target,eventObj){
        	var evts=eventObj;
        	if (arguments.length==1){
        		evts=target;
        	}
          	for(var eventName in evts){
          		this.on(eventName,evts[eventName]);
          	}
        },
        unbind:function(trage,events){
          if (typeof events=="string"){
          		this.off(events);
          }
          if (typeof events=="array"){
          	for(var i=0,len=events.length;i<len;i++){
          		this.off(events[i]);
          	}
          }
        }
    });
   return Base;
function parseEventsFromInstance(host, attrs) {
  for (var attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      var m = '_onChange' + ucfirst(attr);
      if (host[m]) {
        host.on('change:' + attr, host[m]);
      }
    }
  }
}
function ucfirst(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}
});
