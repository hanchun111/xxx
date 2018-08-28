/**
 * Created by qiu.yong on 2017/5/24.
 */

define(["jquery"], function ($) {
    var Message = function () {
        var _self = this;
        _self.msgStack = {};
        $(window).on('message', function (event) {
            var data = event.originalEvent.data;
            data = $.parseJSON(data);
            var callback = _self.get(data.id);
            if (!!callback) {
                callback.call({}, data);
            }
        });
    };
    Message.prototype = {
        constructor:Message,
        set: function (id, callback) {
            this.msgStack[id] = callback;
        },
        get: function (id) {
            var callback = this.msgStack[id];
            if (!!callback) {
                delete this.msgStack[id];
            }
            return callback;
        }
    };
    return new Message();
});