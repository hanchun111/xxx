define(["jquery","app/widgets/app-workspace","resources/frame/themes/nontax/js/superfish.min","resources/frame/themes/nontax/js/jquery.nicescroll.min"],function($,WorkSPace){
	
	var learunindex = {
			
			initEvent:function(){
				
				
			},
			
			loadFavoriteMenu:function(){
            	WEB_CONFIG["favorite"]["buildFavoriteMenu"]("#favoriteMenuList");

			},
	        load: function () {
	       
	        	 $("body").removeClass("hold-transition");
	        	 
	        	 if (top != window) {
	        		 $("body").addClass("nesting-frame");
	        		 
	        	 }
	        	   $(".sidebar-toggle").click(function () {
		                 if (!$("body").hasClass("sidebar-collapse")) {
		                     $("body").addClass("sidebar-collapse");
		                 	
		                  
		                 } else {
		                     $("body").removeClass("sidebar-collapse");
		                 }
		                 $(window).resize()
		             })
	        
	          
	           
	        },
	        jsonWhere: function (data, action) {
	            if (action == null) return;
	            var reval = new Array();
	            $(data).each(function (i, v) {
	                if (action(v)) {
	                    reval.push(v);
	                }
	            })
	            
	            
	            reval = $A.utils.sort(reval,function(a,b){
                    if (!a["sortNo"]){
                        a["sortNo"]=0;
                    }
                    if (!b["sortNo"]){
                        b["sortNo"]=0;
                    }
                    return a["sortNo"]-b["sortNo"];
                });
	            return reval;
	           
	       
	        },
	        loadMenu: function () {
	        	var data=[];
	        	var favoriteMenusMap={}
	        	if (WEB_CONFIG.favoriteMenus){
		        	for(var i=0;i<WEB_CONFIG.favoriteMenus.length;i++){
		        		favoriteMenusMap[favoriteMenus[i]["menuId"]]=favoriteMenus[i]["menuId"];
		        	}	
	        	}
	        	
	        	if (WEB_CONFIG.menus){
	        		
	        		data=WEB_CONFIG.menus;
	        	}
	        	
	        	data=$A.utils.sort(data,function(a,b){
                    if (!a["sortNo"]){
                        a["sortNo"]=0;
                    }
                    if (!b["sortNo"]){
                        b["sortNo"]=0;
                    }
                    return a["sortNo"]-b["sortNo"];
                })
	        	
	        
	        	
	        	var _html = "";
	            $.each(data, function (i) {
	                var row = data[i];
	                if (!row.parentMenuId ||row.parentMenuId == "0") {
	                    if (i == 0) {
	                        _html += '<li class>';
	                    } else {
	                        _html += '<li class>';
	                    }
	                    _html += '<a  class="menuItem"  data-code="' + row.menuCode + '" data-id="' + row.menuId + '" href="' +( row.menuUrl||"") + '">'
	                    _html += '<i class="' + (row.collapseIcon || 'menu-icon-none') +' menu-icon-'+row.menuCode+  '"></i><span>' + row.menuName + '</span>'
	                    _html += '</a>'
	                    var childNodes = learunindex.jsonWhere(data, function (v) { return v.parentMenuId == row.menuId });
	                    if (childNodes.length > 0) {
	                        _html += '<ul>';
	                        $.each(childNodes, function (i) {
	                            var subrow = childNodes[i];
	                            var subchildNodes = learunindex.jsonWhere(data, function (v) { return v.parentMenuId == subrow.menuId });
	                            _html += '<li>';
	                            if (subchildNodes.length > 0) {
	                            	//<i class="' + (subrow.collapseIcon||'menu-icon-none')+' menu-icon-'+subrow.menuCode+  '"></i>
	                                _html += '<a href="#">' + subrow.menuName + '';
	                                _html += '</a>';
	                                _html += '<ul class="">';
	                                $.each(subchildNodes, function (i) {
	                                    var subchildNodesrow = subchildNodes[i];
	                                    //<i  class="' + (subchildNodesrow.collapseIcon||'')+' menu-icon-'+subchildNodesrow.menuCode+ '"></i>
	                                    _html += '<li><a class="menuItem"  data-code="' + subchildNodesrow.menuCode + '" data-id="' + subchildNodesrow.menuId + '" href="' + subchildNodesrow.menuUrl + '">' + subchildNodesrow.menuName + '</a><i class="icon-collection"></i></li>';
	                                });
	                                _html += '</ul>';

	                            } else {
	                            	//<i class="' + (subrow.collapseIcon|| '')+' menu-icon-'+subrow.menuCode+ '"></i>
	                                _html += '<a class="menuItem"  data-code="' + subrow.menuCode + '" data-id="' + subrow.menuId + '" href="' + subrow.menuUrl + '">' + subrow.menuName + '</a><i class="icon-collection"></i>';
	                            }
	                            _html += '</li>';
	                        });
	                        _html += '</ul>';
	                    }
	                    _html += '</li>'
	                }
	            });
	           $("#sidebarmenu").append(_html);
	            
	            var example = $('#sidebarmenu').superfish({
	            	onBeforeShow:function(ul){
	            		var favoriteList=$("#favoriteMenuList a");
	            		var menuCodes=[];
	            		for(var i=0;i<favoriteList.length;i++){
	            			var menuCode=$(favoriteList[i]).data("id");
	            			menuCodes.push(menuCode);
	            		}
	           
	            		for (var i=0;i<menuCodes.length;i++){
	            			var menuCode=menuCodes[i];
	            			var favoriteMenuItem=$("a[data-id='"+menuCode+"']",this);
	            		if (favoriteMenuItem.length>0){
	            			if (!favoriteMenuItem.next().hasClass("icon-start")){
	            				favoriteMenuItem.next().addClass("icon-start")
	            			}
	            		}
	            		}
	            		
	            	}
					//add options here if required
				});
	            
	           
	        }
	    }
	
	
	var TabWorkSpace=WorkSPace.extend({
		initialize : function(el, options) {
			TabWorkSpace.superclass.initialize.call(this, options);
			this.element=el;
			 	$('.menuTabs').on('click', '.menuTab i', this.closeTab);
	            $('.menuTabs').on('click', '.menuTab', this.activeTab);
	            $('.tabLeft').on('click', this.scrollTabLeft);
	            $('.tabRight').on('click', this.scrollTabRight);
	            $('.tabReload').on('click', this.refreshTab);
	            
		},requestFullScreen: function () {
            var de = document.documentElement;
            if (de.requestFullscreen) {
                de.requestFullscreen();
            } else if (de.mozRequestFullScreen) {
                de.mozRequestFullScreen();
            } else if (de.webkitRequestFullScreen) {
                de.webkitRequestFullScreen();
            }
        },
        exitFullscreen: function () {
            var de = document;
            if (de.exitFullscreen) {
                de.exitFullscreen();
            } else if (de.mozCancelFullScreen) {
                de.mozCancelFullScreen();
            } else if (de.webkitCancelFullScreen) {
                de.webkitCancelFullScreen();
            }
        },
        refreshTab: function () {
            var currentId = $('.page-tabs-content').find('.active').attr('data-id');
            var target = $('.tab-page[data-id="' + currentId + '"]');
            var url = target.data('href');
            $A.destroyDom(target);
            target.htmlAJAX({
				type:"GET",
					url:url
            })
           
        },  
        activeTab: function () {
            var currentId = $(this).data('id');
            if (!$(this).hasClass('active')) {
                $('.main-content .tab-page').each(function () {
                    if ($(this).data('id') == currentId) {
                        $(this).show().siblings('.tab-page').hide();
                        return false;
                    }
                });
                $(this).addClass('active').siblings('.menuTab').removeClass('active');
                learuntab.scrollToTab(this);
            }
            $A.getWorkSpace().trigger("onSelect",currentId);
           
        },
        closeOtherTabs: function () {
            $('.page-tabs-content').children("[data-id]").find('.icon-remove').parents('a').not(".active").each(function () {
                $('.tab-page[data-id="' + $(this).data('id') + '"]').remove();
                $(this).remove();
            });
            $('.page-tabs-content').css("margin-left", "0");
        },
        closeTab: function () {
            var closeTabId = $(this).parents('.menuTab').data('id');
            var currentWidth = $(this).parents('.menuTab').width();
            if ($(this).parents('.menuTab').hasClass('active')) {
                if ($(this).parents('.menuTab').next('.menuTab').size()) {
                    var activeId = $(this).parents('.menuTab').next('.menuTab:eq(0)').data('id');
                    $(this).parents('.menuTab').next('.menuTab:eq(0)').addClass('active');

                    $('.main-content .tab-page').each(function () {
                        if ($(this).data('id') == activeId) {
                            $(this).show().siblings('.tab-page').hide();
                            return false;
                        }
                    });
                    var marginLeftVal = parseInt($('.page-tabs-content').css('margin-left'));
                    if (marginLeftVal < 0) {
                        $('.page-tabs-content').animate({
                            marginLeft: (marginLeftVal + currentWidth) + 'px'
                        }, "fast");
                    }
                    $(this).parents('.menuTab').remove();
                    $('.main-content .tab-page').each(function () {
                        if ($(this).data('id') == closeTabId) {
                            $(this).remove();
                            return false;
                        }
                    });
                }
                if ($(this).parents('.menuTab').prev('.menuTab').size()) {
                    var activeId = $(this).parents('.menuTab').prev('.menuTab:last').data('id');
                    $(this).parents('.menuTab').prev('.menuTab:last').addClass('active');
                    $('.main-content .tab-page').each(function () {
                        if ($(this).data('id') == activeId) {
                            $(this).show().siblings('.tab-page').hide();
                            return false;
                        }
                    });
                    $(this).parents('.menuTab').remove();
                    $('.main-content .tab-page').each(function () {
                        if ($(this).data('id') == closeTabId) {
                            $(this).remove();
                            return false;
                        }
                    });
                }
            }
            else {
                $(this).parents('.menuTab').remove();
                $('.main-content .tab-page').each(function () {
                    if ($(this).data('id') == closeTabId) {
                        $(this).remove();
                        return false;
                    }
                });
                learuntab.scrollToTab($('.menuTab.active'));
            }
            return false;
        },
        addPage: function (pageInfo) {
        	  var dataId,dataUrl ,menuName,isClose=true,funccode;
        	  $(".navbar-custom-menu>ul>li.open").removeClass("open");
        	if (pageInfo&&pageInfo.pageTitle){
        		dataId=pageInfo.pageId;
        		menuName=pageInfo.pageTitle;
        		dataUrl=pageInfo.pageUrl;
        		isClose=pageInfo.isClose
                funccode=pageInfo.funccode;
        	}else{
	            dataId=$(this).attr('data-id');
	            dataUrl = $(this).attr('href');
                funccode = $(this).data('code');
	            menuName = $.trim($(this).attr("title")||$(this).text());
        	}
            var flag = true,panel="";
            if (dataUrl == undefined || $.trim(dataUrl).length == 0) {
                return false;
            }
            $('.menuTab').each(function () {
                if ($(this).data('id') == dataId) {
                    if (!$(this).hasClass('active')) {
                        $(this).addClass('active').siblings('.menuTab').removeClass('active');
                        learuntab.scrollToTab(this);
                       
                    }
                    $('.main-content .tab-page').each(function () {
                        if ($(this).data('id') == dataId) {
                            $(this).show().siblings('.tab-page').hide();
                            panel=$(this);
                            return false;
                        }
                    });
                   flag = false;
                   return false;
                }
            });
            if(dataUrl.indexOf('?')!=-1){
                dataUrl += '&__funccode='+funccode;
            }else{
                dataUrl += '?__funccode='+funccode;
            }
            if (flag) {
                var str = '<a  class="active menuTab" data-id="' + dataId + '" >' + menuName + (isClose?' <i class="icon-remove"></i>':'')+'</a>';
                $('.menuTab').removeClass('active');
                //var str1 = '<iframe class="LRADMS_iframe" id="iframe' + dataId + '" name="iframe' + dataId + '"  width="100%" height="100%" src="' + dataUrl + '" frameborder="0" data-id="' + dataUrl + '" seamless></iframe>';
               // $('.main-content').find('iframe.tab-page').hide();
                var $panel = $('<div class="tab-page" id="tabpage' + dataId + '" name="tabpage' + dataId + '"    data-id="' + dataId + '"  data-href="' + dataUrl + '" seamless></div>');
                $('.main-content').find('div.tab-page').hide();
                $panel.appendTo($('.main-content'));
                
                $('.menuTabs .page-tabs-content').append(str);
                learuntab.scrollToTab($('.menuTab.active'));
                $("#_tabmask").show();
            	$panel.htmlAJAX({
					type:"GET", url:dataUrl, callback:function(){
						//navTab._loadUrlCallback($panel);
						
					},error:function(){
						
					}
				});
            }else{
            	if (panel&&panel.data("href")!=dataUrl){
            		$A.destroyDom(panel);
            		
            		
            		panel.htmlAJAX({
    					type:"GET", url:dataUrl, callback:function(){
    						//navTab._loadUrlCallback($panel);
    						
    					},error:function(){
    						
    					}
    				});
            		
            	}
            	
            }
            return false;
        },
        scrollTabRight: function () {
            var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
            var tabOuterWidth = learuntab.calSumWidth($(".content-tabs").children().not(".menuTabs"));
            var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
            var scrollVal = 0;
            if ($(".page-tabs-content").width() < visibleWidth) {
                return false;
            } else {
                var tabElement = $(".menuTab:first");
                var offsetVal = 0;
                while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {
                    offsetVal += $(tabElement).outerWidth(true);
                    tabElement = $(tabElement).next();
                }
                offsetVal = 0;
                while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
                    offsetVal += $(tabElement).outerWidth(true);
                    tabElement = $(tabElement).next();
                }
                scrollVal = learuntab.calSumWidth($(tabElement).prevAll());
                if (scrollVal > 0) {
                    $('.page-tabs-content').animate({
                        marginLeft: 0 - scrollVal + 'px'
                    }, "fast");
                }
            }
        },
        scrollTabLeft: function () {
            var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
            var tabOuterWidth = learuntab.calSumWidth($(".content-tabs").children().not(".menuTabs"));
            var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
            var scrollVal = 0;
            if ($(".page-tabs-content").width() < visibleWidth) {
                return false;
            } else {
                var tabElement = $(".menuTab:first");
                var offsetVal = 0;
                while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {
                    offsetVal += $(tabElement).outerWidth(true);
                    tabElement = $(tabElement).next();
                }
                offsetVal = 0;
                if (learuntab.calSumWidth($(tabElement).prevAll()) > visibleWidth) {
                    while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
                        offsetVal += $(tabElement).outerWidth(true);
                        tabElement = $(tabElement).prev();
                    }
                    scrollVal = learuntab.calSumWidth($(tabElement).prevAll());
                }
            }
            $('.page-tabs-content').animate({
                marginLeft: 0 - scrollVal + 'px'
            }, "fast");
        },
        scrollToTab: function (element) {
            var marginLeftVal = learuntab.calSumWidth($(element).prevAll()), marginRightVal = learuntab.calSumWidth($(element).nextAll());
            var tabOuterWidth = learuntab.calSumWidth($(".content-tabs").children().not(".menuTabs"));
            var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
            var scrollVal = 0;
            if ($(".page-tabs-content").outerWidth() < visibleWidth) {
                scrollVal = 0;
            } else if (marginRightVal <= (visibleWidth - $(element).outerWidth(true) - $(element).next().outerWidth(true))) {
                if ((visibleWidth - $(element).next().outerWidth(true)) > marginRightVal) {
                    scrollVal = marginLeftVal;
                    var tabElement = element;
                    while ((scrollVal - $(tabElement).outerWidth()) > ($(".page-tabs-content").outerWidth() - visibleWidth)) {
                        scrollVal -= $(tabElement).prev().outerWidth();
                        tabElement = $(tabElement).prev();
                    }
                }
            } else if (marginLeftVal > (visibleWidth - $(element).outerWidth(true) - $(element).prev().outerWidth(true))) {
                scrollVal = marginLeftVal - $(element).prev().outerWidth(true);
            }
            $('.page-tabs-content').animate({
                marginLeft: 0 - scrollVal + 'px'
            }, "fast");
        },
        calSumWidth: function (element) {
            var width = 0;
            $(element).each(function () {
                width += $(this).outerWidth(true);
            });
            return width;
        },
        init: function () {

        	
    	$(".content-iframe").height($("body").outerHeight()-$(".content-iframe").position().top);
    	
    	
    	$("#sidebar-menu").height($("body").outerHeight()-$(".sidebar").position().top);
        $("#sidebar-menu").niceScroll({cursorwidth:'5',ispage:true,cursorfixedheight:39,autohidemode:"cursor",cursorborder:"",background:"#113c5e",cursorcolor:"#e6e9f0",boxzoom:false,enabletranslate3d:false}); 
  
        
        $(document).on('click',function (e) {
        	var t=$(e.target).closest(".menuItem");
        	
        	if (t.length==0){
        	
        		$('#sidebarmenu').superfish("hide");
        	}
    		
    	});
        
    	$(window).resize(function() {
        	$(".content-iframe").height($("body").outerHeight()-$(".content-iframe").position().top);
        	$("#sidebar-menu").height($("body").outerHeight()-$(".sidebar").position().top);
    	});
    

            $('.menuItem').on('click', function(e){
            	   e.preventDefault(); 
            	 var dataUrl = $(this).attr('href');
            	 if (dataUrl){
	            	learuntab.addPage.call(this);
	            	$('#sidebarmenu').superfish("hide");
            	 }
            
            	
            });
            $('.icon-collection').on('click', function(){
            	var $this=$(this),menuItem=$this.prev();
            	var menuId=menuItem.attr("data-id");
            	WEB_CONFIG["favorite"]["addFavoriteMenu"](menuId,function(data){
            		if (data.params&&data.params["usedMenuList"]){
            			
            			
            			
                    	WEB_CONFIG["favorite"]["buildFavoriteMenu"]("#favoriteMenuList",data.params["usedMenuList"]);

            		}else{
            			if (data){
            				WEB_CONFIG["favorite"]["buildFavoriteMenu"]("#favoriteMenuList",data);
            				
            			}
            			
            		}
            	
            		
            	});
            	
            	
            	
            	//console.log(menuItem);
            });
           
            $("#btn_favoriteMenu").on("click",function(e){
            	var li=$( e.target ).closest("li")
            	if (li.attr("id")=="btn_favoriteMenu"){
            		
                	WEB_CONFIG["favorite"]["setFavoriteMenu"]();

            	}

            })
            $('.tabCloseCurrent').on('click', function () {
                $('.page-tabs-content').find('.active i').trigger("click");
            });
            $('.tabCloseAll').on('click', function () {
                $('.page-tabs-content').children("[data-id]").find('.icon-remove').each(function () {
                    $('.tab-page[data-id="' + $(this).data('id') + '"]').remove();
                    $(this).parents('a').remove();
                });
                $('.page-tabs-content').children("[data-id]:first").each(function () {
                    $('.tab-page[data-id="' + $(this).data('id') + '"]').show();
                    $(this).addClass("active");
                });
                $('.page-tabs-content').css("margin-left", "0");
            });
            $('.tabCloseOther').on('click', learuntab.closeOtherTabs);
      
            
            	
        
            $('.fullscreen').on('click', function () {
            	//ie11版本不支持全屏
                if ($.browser.msie  && parseInt($.browser.version, 10) < 11) {
                	$A.messager.warn("ie11版本以下不支持全屏")
                }
                if (!$(this).attr('fullscreen')) {
                    $(this).attr('fullscreen', 'true');
                    learuntab.requestFullScreen();
                } else {
                    $(this).removeAttr('fullscreen')
                    learuntab.exitFullscreen();
                }
            });
        },getActionPage:function(){
        	 var currentId = $('.page-tabs-content').find('.active').attr('data-id');
             var target = $('.tab-page[data-id="' + currentId + '"]');
			return target;
		}
		})
	
	
	var learuntab=new TabWorkSpace("content-wrapper");
	
	var WEB_CONFIG;
	return {
		
		init:function(webconfig){
			WEB_CONFIG=webconfig;
			learunindex.load();	
			learunindex.loadMenu();
			learunindex.loadFavoriteMenu();
			learuntab.init();
			learuntab.addPage({pageTitle:"欢迎首页",pageId:'default',pageUrl:WEB_CONFIG["indexPageUrl"],isClose:false})
			//learunindex.initEvent()
			$A.registerWorkSpace(learuntab)
		}
		
	}
})


