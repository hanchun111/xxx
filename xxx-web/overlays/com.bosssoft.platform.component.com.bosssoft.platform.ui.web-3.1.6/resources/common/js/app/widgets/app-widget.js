define(["app/core/app-base",'app/core/app-jquery'], function(Base,$) {
    // Widget
    // ---------
    // Widget 是与 DOM 元素相关联的非工具类组件，主要负责 View 层的管理。
    // Widget 组件具有四个要素：描述状态的 attributes 和 properties，描述行为的 events
    // 和 methods。Widget 基类约定了这四要素创建时的基本流程和最佳实践。
    /**
     * Widget 是与 DOM 元素相关联的非工具类组件，主要负责 View 层的管理
     * @class
     * @name Widget
     * @extends Base
     * @classdesc 控件基类。
     */
  var Widget = Base.extend({
        // config 中的这些键值会直接添加到实例上，转换成 properties
  		//, 'template', 'model', 'events'
      	 propsInAttrs: ['element','template', 'model', 'events'],

        // 与 widget 关联的 DOM 元素
      	element: null,

        // 默认模板
        template: '<div></div>',

        // 默认数据模型
       // model: null,

        // 事件代理，格式为：
        //   {
        //     'mousedown .title': 'edit',
        //     'click {{attrs.saveButton}}': 'save'
        //     'click .open': function(ev) { ... }
        //   }
        events: null,

        // 属性列表
        attrs: {
            // 组件的默认父节点
          //  parentNode: document.body,

            // 默认开启 data-api 解析
            //'data-api': true
        },
        // 初始化方法，确定组件创建时的基本流程：
        // 初始化 attrs --》 初始化 properties --》 初始化 events --》 子类的初始化
        initialize: function(config) {
            //this.cid = uniqueCid();
            // 由 Base 提供
            this.initAttrs(config);
            // 由 Widget 提供
            // 由子类提供
             this.initProps();
             this.setup();
             //this.delegateEvents();
        },

        // 构建 this.element
        // 构建 this.element
        parseElement: function() {
            var element = this.element;
            if (element) {
                this.element = $(element);
            }
            // 未传入 element 时，从 template 构建
            else if (this.get('template')) {
                this.parseElementFromTemplate();
            }

            // 如果对应的 DOM 元素不存在，则报错
            if (!this.element || !this.element[0]) {
                throw 'element is invalid';
            }
        },

        // 从模板中构建 this.element
          // 从模板中构建 this.element
        parseElementFromTemplate: function() {
            this.element = $(this.get('template'));
        },
        // 解析 this.element 中的 data-* 配置，获得 this.dataset
        // 并自动将 data-action 配置转换成事件代理
        _parseDataAttrs: function() {
           
        },
        // 负责 properties 的初始化，提供给子类覆盖
        initProps: function() {
        },
        // 注册事件代理
        delegateEvents: function(events, handler) {
           
        },
        addEvents : function(o){
            var me = this;
            me.events = me.events || {};
            if (typeof o == 'string') {
                var a = arguments,
                    i = a.length;
                while(i--) {
                    me.events[a[i]] = me.events[a[i]] || true;
                	if (this.get(a[i])){
                	 this.off(a[i]);
                	 this.on(a[i],this.get(a[i]),this);
                	}
                }
            } else {
            	for(var evnetName in o){
            		this.off(evnetName);
            		this.on(evnetName,o[evnetName],this);
            	}
                $.extend(me.events, o);
            }
        },
        // 卸载事件代理
        undelegateEvents: function(eventKey, handler) {
        	
        	
        },
        // 提供给子类覆盖的初始化方法
        setup: function() {
        },
        // 将 widget 渲染到页面上
        // 渲染不仅仅包括插入到 DOM 树中，还包括样式渲染等
        // 约定：子类覆盖时，需保持 `return this`
        render: function() {
           
        },
        destroy: function() {
          //  this.undelegateEvents();
            Widget.superclass.destroy.call(this);
        }
    });

    return Widget;
   
});
