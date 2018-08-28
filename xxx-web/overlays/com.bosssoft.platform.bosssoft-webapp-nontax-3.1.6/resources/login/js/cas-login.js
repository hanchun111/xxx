(function (scope) {
    var casUrl = 'http://127.0.0.1:13526/ca';
    var heartUrl = 'http://127.0.0.1:13526/heart';
    if(location.href.match('^https://')!==null){
        casUrl = 'https://127.0.0.1:13526/ca';
        heartUrl = 'https://127.0.0.1:13526/heart';
    }
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
    var message = new Message();


    var getRs = function () {
        return this.ret.ret_msg;
    };
    var Socket = function () {
    };
    Socket.prototype = {
        constructor:Socket,
        send:function (op) {
            var _self = this;
            var data = op.data;
            op.id = op.data.id = new Date().getTime();
            if(typeof data.payload === 'undefined'){
                throw new Error('data.payload not found!');
            }
            //payload 鍒濆鍖�
            var payload = data.payload;
            payload = JSON.stringify(payload);
            payload = _self.base64Encode(payload);
            op.data.payload = payload;
            var $iframe = _self.createIframe(op);
            var $form = _self.createForm(op);
            //  " 浼氭埅鏂暟鎹�
            $form.find('[name="payload"]').val(payload);
            var callback = function (data) {
                if(data==='undefined'){
                    data = {};
                }
                data['getResult'] = getRs;
                var args = [data.getResult()];
                try {
                    args = args.concat([].slice.call(arguments,0));
                    args.push(op);
                    if(data.ret['ret_code']==='0'){
                        op.success.apply(op,args);
                    }else{
                        op.error.apply(op,args);
                    }
                    $form.remove();
                    $iframe.remove();
                }catch (e){
                    $form.remove();
                    $iframe.remove();
                    throw e;
                }
            }
            message.set(op.id,callback);
            $form.submit();
            $.ajax({
                url:heartUrl,
                timeout:op.timeout?op.timeout:3000,
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                dataType: 'jsonp',
                jsonp: 'jsonp',
                type:'GET',
                error:function () {
                    $form.remove();
                    $iframe.remove();
                    op.clientError.apply(op,arguments)
                }
            })
        },
        createIframe:function (op) {
            var template= '<iframe \
                                id="socketIframe$id" \
                                name="socketIframe$id" \
                                style="position:absolute; top:-9999px; left:-9999px">\
                            </iframe>';
            var $iframe = $(template.replace(/\$id/g,op.id));
            $iframe.appendTo('body');
            return $iframe;
        },
        createForm:function (op) {
            if(!!op.func){
                op.invokeType = 'func';
                op.invokeValue = op.func;
            }else{
                op.invokeType = 'proc';
                op.invokeValue = op.proc;
            }
            var template= '<form id="socketForm$id" name="socketForm$id" \
                target="socketIframe$id" \
                action="$url" \
                method="post" \
                accept-charset="UTF-8" \
                > \
                <input type="hidden" name="$invokeType" value="$invokeValue" /> \
                <input type="hidden" name="id" value="$id" /> \
                <input type="hidden" name="payload" /> \
                </form>';
            var $form = $(
                template.replace(/\$id/g,op.id)
                    .replace(/\$url/,op.url)
                    .replace(/\$invokeType/,op.invokeType)
                    .replace(/\$invokeValue/,op.invokeValue)
            );
            $form.appendTo('body');
            return $form;
        },
        base64Encode:function (data) {
            return Base64.encode(data);
        }
    };

    var socket = new Socket();

    var CASLogin = function () {
    };

    CASLogin.prototype = {
        constructor:CASLogin,
        doSign:function (op) {
            var success = $.isFunction(op.success)?op.success:$.noop;
            var error = $.isFunction(op.error)?op.error:$.noop;
            var clientError = $.isFunction(op.clientError)?op.clientError:$.noop;
            delete op.success;
            delete op.error;
            delete op.clientError;
            var options = {
                url:casUrl,
                func:'doSign',
                success:success,
                error:error,
                clientError:clientError,
                data:{
                    payload:{
                        config:{
                        	appId:'cas-server'
                        },
                        data:[
                            op
                        ]
                    }
                }
            };

           socket.send(options);
        }
    };

    scope.casLogin = new CASLogin();
}(window));

