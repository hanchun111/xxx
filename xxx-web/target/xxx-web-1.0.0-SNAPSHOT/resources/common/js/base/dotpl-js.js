/*
 * Dotpl-JS v1.0
 * http://code.google.com/p/dotpl-js/
 * (c) 2012 by Chunzhan.He. All rights reserved.
 * chunzhan.he@gmail.com
 */
// alert(dotpl.diving("data", {data:{data1:{val:"evolution"}}}));
// alert(dotpl.diving("data.data1", {data:{data1:{val:"evolution"}}}));
// alert(dotpl.diving("data.data1.val", {data:{data1:{val:"evolution"}}}));
// alert(dotpl.applyTpl("hello ${val}", {val:"world"}));
// alert(dotpl.applyTpl("hello ${val} ${val2}", {val:"world",val1:"wide-web",val2:"good"}, function(k,v,kv){
// if(k=='val') return kv['val']+"-"+kv['val1'];
// }));
// alert(dotpl.applyTpl("hello ${data.val}", {data:{val:"freedom"}}));
// alert(dotpl.applyTpl("hello ${data.val} nothing ${none}", {data:{val:"freedom"}}));
// alert(dotpl.applyTpl("hello ${data.data1.val}", {data:{data1:{val:"evolution"}}}));
// alert(dotpl.applyTpl("hello ${val},i ${action} you", {val:"town", action:'love'}));
// alert(dotpl.applyTpl("hello ${val},<tpl if=\"'${action}'=='love'\">i ${action} you</tpl>", {val:"town", action:'love'}));
// alert(dotpl.applyTpl("hello ${val},if false<tpl if=\"'${action}'=='love'\">i ${action} you</tpl>", {val:"town", action:'like'}));
// alert(dotpl.applyTpl("list:\n<tpl for=\".\">${__offset} hello ${key} ${val}\n</tpl>", [{key:"world", val:'like'},{key:"town", val:'freedom'}]));
// alert(dotpl.applyTpl("list:\n<tpl for=\"data\">${__offset} hello ${key} ${val}\n</tpl>", {data:[{key:"world", val:'like'},{key:"town", val:'freedom'}]}));
// alert(dotpl.applyTpl("list:\n<tpl for=\"data\">${__offset} hello ${__val} \n</tpl>", {data:[1,2,4]}));
// alert(dotpl.applyTpl("list:\n<tpl for=\"data\">${__offset} hello ${__val} \n</tpl>", {data:["s1","s2","s3"]}));
// alert(dotpl.applyTpl("list:\n<tpl for=\"data\">${__offset} hello ${key} ${val}\n</tpl>list2:\n<tpl for=\"data\">${__offset} 1024 ${key} ${val}\n</tpl>", {data:[{key:"world", val:'like'},{key:"town", val:'freedom'}]}));
// alert(dotpl.applyTpl("<tpl for=\".\">list${__offset} \n <ul><tpl0 for=\"data\"><li>${__offset} \n ${key} ${val}</li></tpl0></ul></tpl>", [{data:[{key:"world", val:'like'},{key:"town", val:'freedom'}]},{data:[{key:"world1", val:'like1'},{key:"town1", val:'freedom1'}]}]));
// dotpl.applyRTpl("/display.tpl",{key:'hellow world'},function(view){alert(view);});
define([],function () {
    var dotpl = function() {
        function _diving(key,kv) {
            var keys = key.split("\.");
            var i = 0;
            do {
                kv = kv[keys[i++]];
                if(kv==null) break;
            } while(i<keys.length&&typeof(kv)=='object');
            return kv;
        }
        function _applyMapTpl(tpl, values, renderer, pk, parent) {
            var re = /\${1}\{([^\}]+?)\}/ig;
            var view = tpl.replace(re, function($0,$1) {
                try {
                    var val = _diving($1,values);
                    val = (val==null?"":val);
                    if(typeof renderer=='function') {
                        var tmp = renderer.call(this, $1, val, values, pk, parent);
                        return tmp==null?val:tmp;
                    }
                    return val;
                } catch(e){ alert($1||e.message||e);return null;}
            });
            return view;
        }
        function _request(url,cb,sync) {
            var xmlhttp = null;
            if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp=new XMLHttpRequest();
            } else {// code for IE6, IE5
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange=function() {
                if (xmlhttp.readyState==4) {
                    try {
                        cb.call(this, xmlhttp.responseText,xmlhttp.status);
                    } catch(e){ alert(e.message||e);return null;}
                }
            }
            try {
                xmlhttp.open('GET',url,!!sync);
                xmlhttp.send();
            } catch(e){ alert(e.message||e);return null;}
            return xmlhttp;
        }
        function _applyTpl(tpl, data, renderer, pk, parent){
            var regx = /<(tpl\d?)\s+(\w+)\s*=\s*(['|"]{1})([^\3]+?)\3\s*>([\s\S]+?)<\/\1>/ig;
            if(regx.test(tpl)) {
                tpl = tpl.replace(regx, function($0,$1,$2,$3,$4,$5){
                    var output = "";
                    if($2!=null) {
                        if($2.toUpperCase()=="FOR") {
                            var arr = data;
                            if($4!=".") {
                                arr = _diving($4,data);
                            }
                            for(var i=0;arr!=null&&i<arr.length;i++) {
                                var item = {};
                                if(typeof(arr[i])!='object') {
                                    item.__val = arr[i];
                                } else {
                                    item = arr[i];
                                }
                                item.__offset = i;
                                output+=_applyTpl($5,item,renderer,$4,arr);
                            }
                        } else if($2.toUpperCase()=="IF") {
                            try {
                                if(eval(applyTpl($4,data))) {
                                    return _applyTpl($5, data, renderer, pk, parent);
                                }
                            } catch(e) {
                                alert($4||e.message||e);
                            }
                        }
                    }
                    return output;
                });
            }
            return _applyMapTpl(tpl, data, renderer, pk, parent);
        }
        return function(){
            this.diving=_diving;
            this.applyTpl=_applyTpl;
            //remote template
            this.applyRTpl=function(url, data, cb, renderer){
                _request(url, function(tpl, status){
                    if(status==200) {
                        cb.call(this, _applyTpl(tpl, data, renderer));
                    } else {
                        alert("Error "+status+":"+url);
                    }
                });
            };
            return this;
        };
    }()();
    window.dotpl = dotpl;
    return dotpl;
});