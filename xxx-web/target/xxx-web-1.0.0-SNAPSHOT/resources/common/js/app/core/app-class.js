define(function() {

    // Class
    // -----------------
    // Thanks to:
    //  - http://mootools.net/docs/core/Class/Class
    //  - http://ejohn.org/blog/simple-javascript-inheritance/
    //  - https://github.com/ded/klass
    //  - http://documentcloud.github.com/backbone/#Model-extend
    //  - https://github.com/joyent/node/blob/master/lib/util.js
    //  - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js
    // The base Class implementation.
    /**
     *
     * @class
     * @name Class
     * @classdesc 提供简洁的 OO 实现
     */
    function Class(o) {
        // Convert existed function to Class.
        if (!(this instanceof Class) && isFunction(o)) {
            return classify(o);
        }
    }
    /**
     * 创建类对象方法
     * @function create
     * @memberof Class
     * @static
     * @example 创建一个类
     * // Create a new Class.
     * //
     * //    var SuperPig = Class.create({
     * //        Extends: Animal,//继承类
     * //        Implements: Flyable,//实现了,相当于SuperPig拥有了Flyable的所有方法
     * //        initialize: function() {//初始化方法
     * //            SuperPig.superclass.initialize.apply(this, arguments);
     * //        },
     * //        Statics: {
     * //            COLOR: 'red'
     * //        }
     * //    });
     * //
     * @param parent 父类
     * @param properties 方法对象
     * @returns {*}
     */
    Class.create = function(parent, properties) {
        if (!isFunction(parent)) {
            properties = parent;
            parent = null;
        }

        properties || (properties = {});
        parent || (parent = properties.Extends || Class);
        properties.Extends = parent;

        // The created class constructor
        function SubClass() {
            // Call the parent constructor.
            parent.apply(this, arguments);

            // Only call initialize in self constructor.
            if (this.constructor === SubClass && this.initialize) {
                this.initialize.apply(this, arguments);
            }
        }

        // Inherit class (static) properties from parent.
        if (parent !== Class) {
            mix(SubClass, parent);
        }

        // Add instance properties to the subclass.
        implement.call(SubClass, properties);

        // Make subclass extendable.
        return classify(SubClass);
    };


    function implement(properties) {
        var key, value;

        for (key in properties) {
            value = properties[key];

            if (Class.Mutators.hasOwnProperty(key)) {
                Class.Mutators[key].call(this, value);
            } else {
                this.prototype[key] = value;
            }
        }
    }



    /**
     * 由 Class.create 创建的类，自动具有 extend 方法，功能与 Class.create 完全一样，只是继承的父类是 SomeClass 自身，前面的例子中已说明，不赘述
     * @memberof Class
     * @example 创建一个类
     *
     *
     * //function Animal() {
     *  // }
     * // Animal.prototype.talk = function() {};
     * //var Dog = Class(Animal).extend({
     *  //swim: function() {}
     *  // });
     * // Create a sub Class based on `Class`.
     * //
     * @param properties 方法对象
     * @returns {*}
     */
    Class.extend = function(properties) {
        properties || (properties = {});
        properties.Extends = this;

        return Class.create(properties);
    };


    function classify(cls) {
        cls.extend = Class.extend;
        cls.implement = implement;
        return cls;
    }


    // Mutators define special properties.
    Class.Mutators = {
        'Extends': function(parent) {
            var existed = this.prototype;
            var proto = createProto(parent.prototype);

            // Keep existed properties.
            mix(proto, existed);

            // Enforce the constructor to be what we expect.
            proto.constructor = this;

            // Set the prototype chain to inherit from `parent`.
            this.prototype = proto;

            // Set a convenience property in case the parent's prototype is
            // needed later.
            this.superclass = parent.prototype;
        },

        'Implements': function(items) {
            isArray(items) || (items = [items]);
            var proto = this.prototype, item;

            while (item = items.shift()) {
                mix(proto, item.prototype || item);
            }
        },

        'Statics': function(staticProperties) {
            mix(this, staticProperties);
        }
    };


    // Shared empty constructor function to aid in prototype-chain creation.
    function Ctor() {
    }

    // See: http://jsperf.com/object-create-vs-new-ctor
    var createProto = Object.__proto__ ?
            function(proto) {
                return { __proto__: proto };
            } :
            function(proto) {
                Ctor.prototype = proto;
                return new Ctor();
            };


    // Helpers
    // ------------

    function mix(r, s) {
        // Copy "all" properties including inherited ones.
        for (var p in s) {
            // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除掉。
            if (p === 'prototype') continue;
            r[p] = s[p];
        }
    }


    var toString = Object.prototype.toString;
    var isArray = Array.isArray;

    if (!isArray) {
        isArray = function(val) {
            return toString.call(val) === '[object Array]';
        };
    }

    var isFunction = function(val) {
        return toString.call(val) === '[object Function]';
    };


    return Class;
});
