
define(["jquery"
], function (jQuery) {

    /**
     * Created by qiuyong on 2017/7/19.
     * 参考：https://zhuanlan.zhihu.com/p/24057749?refer=dreawer
     */
    (function ($) {
        /**
         * 防抖动函数
         * @param fun
         * @param delay
         * @param time
         * @return {Function}
         */
        function throttle(fun,args, delay, time) {
            var timeout,
                startTime = new Date();
            return function(e) {
                var context = this,
                    curTime = new Date();
                args.push(e);
                clearTimeout(timeout);
                // 如果达到了规定的触发时间间隔，触发 handler
                if (curTime - startTime >= time) {
                    fun.apply(context, args);
                    startTime = curTime;
                    // 没达到触发间隔，重新设定定时器
                } else {
                    timeout = setTimeout(function () {
                        fun.apply(context, args);
                    }, delay);
                }
            };
        };

        function onload(img, fn) {
            var timer = setInterval(function() {
                if (img.complete) {
                    fn(img)
                    clearInterval(timer)
                }
            }, 500)
        }

        function lazyload($contanier,imgSel,defImg,onloadFn){
            var imgs = $contanier.find(imgSel);
            //过滤已经正在延迟加载的
            imgs = imgs.filter(function(index,img){
                if($(img).attr('lazyloaded')) return false;
                return true;
            })
            $(imgs).each(function (index,item) {
                var $img = $(item);
                if (item.offsetTop < parseInt($contanier.height()) + parseInt($contanier.scrollTop())) {
                    if ($img.attr('src') === defImg) {
                        $img.attr('lazyloaded',true);
                        var src = $img.attr("data-src");
                        //加载中图片隐藏
                        var $loadImg = $(document.createElement('img'));
                        $loadImg.attr('src',src);
                        $('body').append($loadImg);
                        $loadImg.hide();
                        onload($loadImg[0],function () {
                            $img.attr("src", src);
                            $loadImg.remove();
                            onloadFn($img);
                        })
                    }
                }
            })
        }

        $.fn.extend({
            imgLazyLoad:function (imgSel,defImg,onloadFn) {
                var $contanier =  $(this);
                onloadFn = $.isFunction(onloadFn)?onloadFn:$.noop;
                $contanier.find(imgSel).each(function(index,img){
					if(!$(img).attr('lazyloaded')){
						$(img).attr('src',defImg);
					}
				})
                $contanier.scroll(throttle(lazyload,[$contanier,imgSel,defImg,onloadFn],500,1000));
                lazyload($contanier,imgSel,defImg,onloadFn);
            }
        });
    })(jQuery);


});
